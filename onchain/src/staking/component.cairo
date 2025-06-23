#[starknet::component]
pub mod StakingComponent {
    use pow_game::staking::interface::{IStaking, StakingConfig};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
    };
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    #[storage]
    pub struct Storage {
        staking_config: StakingConfig,
        // Maps: user address -> staked amount
        user_stakes: Map<ContractAddress, u128>,
        // Maps: user address -> reward amount
        user_rewards: Map<ContractAddress, u128>,
        user_last_validation: Map<ContractAddress, u32>,
    }

    #[derive(Drop, starknet::Event)]
    struct StakeUpdated {
        #[key]
        user: ContractAddress,
        amount: u128,
    }

    #[embeddable_as(StakingImpl)]
    impl Staking<
        TContractState, +HasComponent<TContractState>,
    > of IStaking<ComponentState<TContractState>> {
        fn stake_tokens(ref self: ComponentState<TContractState>, amount: u128) {
            let caller = get_caller_address();
            let current_stake = self.user_stakes.read(caller);
            self.user_stakes.write(caller, current_stake + amount);
        }

        fn claim_rewards(ref self: ComponentState<TContractState>) {
            let caller = get_caller_address();
            let reward = self.user_rewards.read(caller);
            // Logic to transfer rewards to the user would go here
            self.user_rewards.write(caller, 0);
        }

        fn validate(ref self: ComponentState<TContractState>) {
            let caller = get_caller_address();
            let last_validation = self.user_last_validation.read(caller);
            let current_time = get_block_timestamp(); // Assuming this function exists
            let config = self.staking_config.read();

            // if current_time - last_validation >= config.slashing_config.due_time {
            //     // Slashing logic
            //     if starknet::random() % 100 < config.slashing_config.chance {
            //         let stake = self.user_stakes.read(caller);
            //         let slash_amount = (stake * config.slashing_config.slash_percentage) / 100;
            //         self.user_stakes.write(caller, stake - slash_amount);
            //     }
            // }

            // self.user_last_validation.write(caller, current_time);
        }

        fn get_staked_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_stakes.read(user)
        }

        fn get_reward_amount(self: @ComponentState<TContractState>, user: ContractAddress) -> u128 {
            self.user_rewards.read(user)
        }
    }
}
