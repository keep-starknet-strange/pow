#[starknet::component]
pub mod StakingComponent {
    use pow_game::staking::interface::{IStaking, StakingConfig, SlashingConfig};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    #[storage]
    pub struct Storage {
        staking_config: StakingConfig,
        slashing_config: SlashingConfig,
        // Maps: user address -> staked amount
        user_stakes: Map<ContractAddress, u128>,
        // Maps: user address -> reward amount
        user_rewards: Map<ContractAddress, u128>,
        user_last_validation: Map<ContractAddress, u64>,
    }

    #[derive(Drop, starknet::Event)]
    struct StakeUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        amount: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        StakeUpdated: StakeUpdated,
    }

    #[embeddable_as(StakingImpl)]
    impl Staking<
        TContractState, +HasComponent<TContractState>,
    > of IStaking<ComponentState<TContractState>> {
        fn get_staking_config(self: @ComponentState<TContractState>) -> StakingConfig {
            self.staking_config.read()
        }

        fn setup_staking(ref self: ComponentState<TContractState>, config: StakingConfig) {
            self.staking_config.write(config);
        }
        fn stake_tokens(ref self: ComponentState<TContractState>, amount: u128) {
            let caller = get_caller_address();
            let current_stake = self.user_stakes.read(caller);
            self.user_stakes.write(caller, current_stake + amount);
            self.emit(StakeUpdated { user: caller, amount });
        }

        fn claim_rewards(ref self: ComponentState<TContractState>) -> u128 {
            let caller = get_caller_address();
            let reward = self.user_rewards.read(caller);
            // Logic to transfer rewards to the user would go here
            self.user_rewards.write(caller, 0);

            return reward;
        }

        fn withdraw_stake(ref self: ComponentState<TContractState>) -> u128 {
            let caller = get_caller_address();
            let current_stake = self.user_stakes.read(caller);
            self.user_stakes.write(caller, 0);
            return current_stake;
        }

        fn validate(ref self: ComponentState<TContractState>) {
            let caller = get_caller_address();
            let last_validation = self.user_last_validation.read(caller);
            let current_time = get_block_timestamp();
            let time_since_last_validation = current_time - last_validation;
            let config = self.staking_config.read();
            let user_stake = self.user_stakes.read(caller);
            let user_rewards = self.user_rewards.read(caller);
            let total_stake = user_stake + user_rewards;

            if time_since_last_validation > config.slashing_config.due_time {
                // Slash logic
                let slash_amount = user_stake / config.slashing_config.slash_fraction;
                self.user_stakes.write(caller, user_stake - slash_amount);
            } else {
                // Reward logic
                let reward: u128 = total_stake * (time_since_last_validation.into()) / config.reward_rate;
                self.user_rewards.write(caller, self.user_rewards.read(caller) + reward);
            }
        }

        fn get_staked_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_stakes.read(user)
        }

        fn get_reward_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_rewards.read(user)
        }
    }
}
