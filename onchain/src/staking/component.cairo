#[starknet::component]
pub mod StakingComponent {
    use pow_game::staking::interface::{IStaking, StakingConfig};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp};

    #[storage]
    pub struct Storage {
        // Staking configuration
        staking_config: StakingConfig,
        // Maps: user address -> unlocked status
        staking_unlocked: Map<ContractAddress, bool>,
        // Maps: user address -> staked amount
        user_stakes: Map<ContractAddress, u128>,
        // Maps: user address -> reward amount
        user_rewards: Map<ContractAddress, u128>,
        // Maps: user address -> last validation timestamp
        user_last_validation: Map<ContractAddress, u64>,
    }

    #[derive(Drop, starknet::Event)]
    struct StakeUpdated {
        #[key]
        user: ContractAddress,
        amount: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        StakeUpdated: StakeUpdated,
        Slashed: Slashed,
        Reward: Reward,
        WithdrawStake: WithdrawStake,
        ClaimRewards: ClaimRewards,
        StakingConfigUpdate: StakingConfigUpdate,
        StakingUnlocked: StakingUnlocked,
    }

    #[derive(Drop, starknet::Event)]
    struct Slashed {
        #[key]
        user: ContractAddress,
        amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct Reward {
        #[key]
        user: ContractAddress,
        amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct WithdrawStake {
        #[key]
        user: ContractAddress,
        amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct ClaimRewards {
        #[key]
        user: ContractAddress,
        amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct StakingConfigUpdate {
        config: StakingConfig,
    }

    #[derive(Drop, starknet::Event)]
    struct StakingUnlocked {
        #[key]
        user: ContractAddress,
        is_unlocked: bool,
    }

    #[embeddable_as(StakingImpl)]
    impl Staking<
        TContractState, +HasComponent<TContractState>,
    > of IStaking<ComponentState<TContractState>> {
        fn get_staking_config(self: @ComponentState<TContractState>) -> StakingConfig {
            self.staking_config.read()
        }

        fn get_staked_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_stakes.read(user)
        }

        fn get_reward_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_rewards.read(user)
        }

        fn get_staking_unlocked(
            self: @ComponentState<TContractState>, user: ContractAddress,
        ) -> bool {
            self.staking_unlocked.read(user)
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn setup_staking(ref self: ComponentState<TContractState>, config: StakingConfig) {
            assert(config.slashing_config.slash_fraction > 0, 'slash_fraction must be > 0');
            assert(config.slashing_config.due_time > 0, 'due_time must be > 0');
            assert(config.reward_rate > 0, 'reward_rate must be > 0');

            self.staking_config.write(config);
            self.emit(StakingConfigUpdate { config: config });
        }

        fn unlock_staking(ref self: ComponentState<TContractState>, user: ContractAddress) {
            self.staking_unlocked.write(user.into(), true);
            self.emit(StakingUnlocked { user, is_unlocked: true });
        }

        fn stake(
            ref self: ComponentState<TContractState>, user: ContractAddress, amount: u128, now: u64,
        ) {
            assert(self.staking_unlocked.read(user), 'staking not unlocked');
            self.validate(user, now);
            let current_stake = self.user_stakes.read(user);
            self.user_stakes.write(user, current_stake + amount);
            self.emit(StakeUpdated { user: user, amount });
        }

        fn claim_rewards(ref self: ComponentState<TContractState>, user: ContractAddress) -> u128 {
            let reward = self.user_rewards.read(user);
            self.user_rewards.write(user, 0);
            self.emit(ClaimRewards { user: user, amount: reward });
            return reward;
        }

        fn validate(ref self: ComponentState<TContractState>, user: ContractAddress, now: u64) {
            let user_stake = self.user_stakes.read(user);
            if user_stake == 0 {
                return;
            }
            self.check_timing(now);
            let last_validation = self.user_last_validation.read(user);
            let config = self.staking_config.read();
            let time_since_last_validation = now - last_validation;
            let user_rewards = self.user_rewards.read(user);
            let total_stake = user_stake + user_rewards;
            self.user_last_validation.write(user, now);

            if time_since_last_validation > config.slashing_config.due_time {
                // Slash logic
                let periods_late = time_since_last_validation / config.slashing_config.due_time;
                let slash_amount = user_stake / config.slashing_config.slash_fraction;
                let scaled_slash = slash_amount * periods_late.into();
                let slashed_amount = if scaled_slash < user_stake {
                    scaled_slash
                } else {
                    user_stake
                };
                self.user_stakes.write(user, user_stake - slashed_amount);
                self.emit(Slashed { user: user, amount: slashed_amount });
            } else {
                // Reward logic
                let reward: u128 = total_stake
                    * (time_since_last_validation.into())
                    / config.reward_rate;
                self.user_rewards.write(user, user_rewards + reward);
                self.emit(Reward { user: user, amount: reward });
            }
        }

        fn withdraw_stake(
            ref self: ComponentState<TContractState>, user: ContractAddress, now: u64,
        ) -> u128 {
            self.validate(user, now);
            let current_stake = self.user_stakes.read(user);
            self.user_stakes.write(user, 0);
            self.emit(WithdrawStake { user: user, amount: current_stake });
            return current_stake;
        }

        fn check_timing(self: @ComponentState<TContractState>, now: u64) {
            let block_timestamp = get_block_timestamp();
            let leanience_margin = self.get_staking_config().slashing_config.leaniance_margin;
            let expected_block_time = 30; // 30 seconds
            assert(now >= block_timestamp - leanience_margin, 'Timestamp too far behind');
            assert(now <= block_timestamp + 2 * expected_block_time, 'Timestamp too far ahead');
        }
    }
}
