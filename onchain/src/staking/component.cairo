#[starknet::component]
pub mod StakingComponent {
    use pow_game::staking::interface::{IStaking, StakingConfig, SlashingConfig};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp};

    #[storage]
    pub struct Storage {
        // Staking configuration
        staking_config: StakingConfig,
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
        #[key]
        amount: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        StakeUpdated: StakeUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct Slashed {
        #[key] user: ContractAddress,
        amount: u128,
    }

    #[embeddable_as(StakingImpl)]
    impl Staking<
        TContractState, +HasComponent<TContractState>,
    > of IStaking<ComponentState<TContractState>> {
        fn get_staking_config(self: @ComponentState<TContractState>) -> StakingConfig {
            self.staking_config.read()
        }

        fn setup_staking(ref self: ComponentState<TContractState>, user: ContractAddress, config: StakingConfig) {
            self.staking_config.write(config);
        }
        fn stake(ref self: ComponentState<TContractState>, user: ContractAddress, amount: u128) {
            let current_stake = self.user_stakes.read(user);
            self.user_stakes.write(user, current_stake + amount);
            self.emit(StakeUpdated { user: user, amount });
        }

        fn claim_rewards(ref self: ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.validate(user);
            let reward = self.user_rewards.read(user);
            self.user_rewards.write(user, 0);
            return reward;
        }
        
        fn validate(ref self: ComponentState<TContractState>, user: ContractAddress) {
            let last_validation = self.user_last_validation.read(user);
            let current_time = get_block_timestamp();
            let time_since_last_validation = current_time - last_validation;
            let config = self.staking_config.read();
            let user_stake = self.user_stakes.read(user);
            let user_rewards = self.user_rewards.read(user);
            let total_stake = user_stake + user_rewards;
            self.user_last_validation.write(user, current_time);
            
            if time_since_last_validation > config.slashing_config.due_time {
                // Slash logic
                let slash_amount = user_stake / config.slashing_config.slash_fraction;
                self.user_stakes.write(user, user_stake - slash_amount);
            } else {
                // Reward logic
                let reward: u128 = total_stake * (time_since_last_validation.into()) / config.reward_rate;
                self.user_rewards.write(user, user_rewards + reward);
            }
        }

        fn withdraw_stake(ref self: ComponentState<TContractState>, user: ContractAddress) -> u128 {
            let current_stake = self.user_stakes.read(user);
            self.user_stakes.write(user, 0);
            return current_stake;
        }

        fn get_staked_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_stakes.read(user)
        }

        fn get_reward_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_rewards.read(user)
        }
    }
}
