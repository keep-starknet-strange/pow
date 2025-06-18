#[starknet::component]
pub mod PowTransactionsComponent {
    use pow_game::transactions::interface::{
        IPowTransactions, TransactionFeeConfig, TransactionSetupParams, TransactionSpeedConfig,
    };
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    pub struct Storage {
        // Maps: (user address, chain id) -> is dapp unlocked
        dapps_unlocked: Map<(ContractAddress, u32), bool>,
        // Maps: (chain id, tx type id) -> is dapp
        dapps: Map<(u32, u32), bool>,
        // Maps: (chain_id, tx_type_id, level) -> transaction fee config
        transaction_fee_config: Map<(u32, u32, u32), TransactionFeeConfig>,
        // Maps: (chain_id, tx_type_id, level) -> transaction speed config
        transaction_speed_config: Map<(u32, u32, u32), TransactionSpeedConfig>,
        // Maps: (user address, chain id, tx type id) -> transaction fee level
        transaction_fee_levels: Map<(ContractAddress, u32, u32), u32>,
        // Maps: (user address, chain id, tx type id) -> transaction speed level
        transaction_speed_levels: Map<(ContractAddress, u32, u32), u32>,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionConfigUpdated {
        #[key]
        chain_id: u32,
        #[key]
        tx_type_id: u32,
        new_config: TransactionSetupParams,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionFeeLevelUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        #[key]
        tx_type_id: u32,
        old_level: u32,
        new_level: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionSpeedLevelUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        #[key]
        tx_type_id: u32,
        old_level: u32,
        new_level: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct DappsUnlocked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        TransactionConfigUpdated: TransactionConfigUpdated,
        TransactionFeeLevelUpdated: TransactionFeeLevelUpdated,
        TransactionSpeedLevelUpdated: TransactionSpeedLevelUpdated,
        DappsUnlocked: DappsUnlocked,
    }

    #[embeddable_as(PowTransactionsImpl)]
    impl PowTransactions<
        TContractState, +HasComponent<TContractState>,
    > of IPowTransactions<ComponentState<TContractState>> {
        fn get_transaction_fee_config(
            self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32, level: u32,
        ) -> TransactionFeeConfig {
            self.transaction_fee_config.read((chain_id, tx_type_id, level))
        }

        fn get_transaction_speed_config(
            self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32, level: u32,
        ) -> TransactionSpeedConfig {
            self.transaction_speed_config.read((chain_id, tx_type_id, level))
        }

        // TODO: Clear TransactionFeeConfig & TransactionSpeedConfig for higher than len()
        fn setup_transaction_config(
            ref self: ComponentState<TContractState>, params: TransactionSetupParams,
        ) {
            let chain_id = params.chain_id;
            let tx_type_id = params.tx_type_id;
            let mut idx = 0;
            let maxFeeLevel = params.fee_levels.len();
            while idx != maxFeeLevel {
                self
                    .transaction_fee_config
                    .write((chain_id, tx_type_id, idx), params.fee_levels[idx].clone());
                idx += 1;
            }
            idx = 0;
            let maxSpeedLevel = params.speed_levels.len();
            while idx != maxSpeedLevel {
                self
                    .transaction_speed_config
                    .write((chain_id, tx_type_id, idx), params.speed_levels[idx].clone());
                idx += 1;
            }
            if params.is_dapp {
                self.dapps.write((chain_id, tx_type_id), true);
            }
            self.emit(TransactionConfigUpdated { chain_id, tx_type_id, new_config: params });
        }

        fn get_user_transaction_fee_level(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            tx_type_id: u32,
        ) -> u32 {
            self.transaction_fee_levels.read((user, chain_id, tx_type_id))
        }

        fn get_user_transaction_speed_level(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            tx_type_id: u32,
        ) -> u32 {
            self.transaction_speed_levels.read((user, chain_id, tx_type_id))
        }

        fn get_user_transaction_fee_levels(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            tx_count: u32,
        ) -> Span<u32> {
            let mut idx = 0;
            let mut levels = array![];
            while idx != tx_count {
                levels.append(self.transaction_fee_levels.read((user, chain_id, idx)));
                idx += 1;
            }
            levels.span()
        }

        fn get_user_transaction_speed_levels(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            tx_count: u32,
        ) -> Span<u32> {
            let mut idx = 0;
            let mut levels = array![];
            while idx != tx_count {
                levels.append(self.transaction_speed_levels.read((user, chain_id, idx)));
                idx += 1;
            }
            levels.span()
        }

        fn level_transaction_fee(
            ref self: ComponentState<TContractState>, chain_id: u32, tx_type_id: u32,
        ) {
            let caller = get_caller_address();
            // Ensure previous tx unlocked
            if (tx_type_id != 0) {
                let previous_level = self
                    .transaction_fee_levels
                    .read((caller, chain_id, tx_type_id - 1));
                assert!(previous_level != 0, "Tx Type Locked");
            }
            // Ensure dapp unlocked
            if (self.is_dapp(chain_id, tx_type_id)) {
                let dapps_unlocked = self.dapps_unlocked.read((caller, chain_id));
                assert!(dapps_unlocked, "Dapps Locked");
            }
            let current_level = self.transaction_fee_levels.read((caller, chain_id, tx_type_id));
            let new_level = current_level + 1;
            self.transaction_fee_levels.write((caller, chain_id, tx_type_id), new_level);
            self
                .emit(
                    TransactionFeeLevelUpdated {
                        user: caller, chain_id, tx_type_id, old_level: current_level, new_level,
                    },
                );
        }

        fn level_transaction_speed(
            ref self: ComponentState<TContractState>, chain_id: u32, tx_type_id: u32,
        ) {
            let caller = get_caller_address();
            let tx_fee_level = self.transaction_fee_levels.read((caller, chain_id, tx_type_id));
            assert!(tx_fee_level != 0, "Tx Type Locked");
            let current_level = self.transaction_speed_levels.read((caller, chain_id, tx_type_id));
            let new_level = current_level + 1;
            self.transaction_speed_levels.write((caller, chain_id, tx_type_id), new_level);
            self
                .emit(
                    TransactionSpeedLevelUpdated {
                        user: caller, chain_id, tx_type_id, old_level: current_level, new_level,
                    },
                );
        }

        fn reset_tx_levels(ref self: ComponentState<TContractState>, chain_id: u32) {
            let caller = get_caller_address();
            let mut idx = 0;
            let transactions_count = 20; // TODO
            while idx != transactions_count {
                self.transaction_fee_levels.write((caller, chain_id, idx), 0);
                self.transaction_speed_levels.write((caller, chain_id, idx), 0);
                idx += 1;
            }
            self.dapps_unlocked.write((caller, chain_id), false);
        }

        // TODO: If maxlevel
        fn get_next_tx_fee_cost(
            self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let next_level = self.transaction_fee_levels.read((caller, chain_id, tx_type_id)) + 1;
            self.transaction_fee_config.read((chain_id, tx_type_id, next_level)).cost
        }

        fn get_next_tx_speed_cost(
            self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let next_level = self.transaction_speed_levels.read((caller, chain_id, tx_type_id)) + 1;
            self.transaction_speed_config.read((chain_id, tx_type_id, next_level)).cost
        }

        fn get_my_tx_fee_value(
            self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let level = self.transaction_fee_levels.read((caller, chain_id, tx_type_id));
            self.transaction_fee_config.read((chain_id, tx_type_id, level)).value
        }

        fn get_my_tx_speed_value(
            self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let level = self.transaction_speed_levels.read((caller, chain_id, tx_type_id));
            self.transaction_speed_config.read((chain_id, tx_type_id, level)).value
        }

        fn check_has_tx(self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32) {
            let level = self
                .transaction_fee_levels
                .read((get_caller_address(), chain_id, tx_type_id));
            assert!(level != 0, "Tx Type Locked");
        }

        fn unlock_dapps(ref self: ComponentState<TContractState>, chain_id: u32) {
            let caller = get_caller_address();
            self.dapps_unlocked.write((caller, chain_id), true);
            self.emit(DappsUnlocked { user: caller, chain_id });
        }

        fn is_dapp(self: @ComponentState<TContractState>, chain_id: u32, tx_type_id: u32) -> bool {
            self.dapps.read((chain_id, tx_type_id))
        }
    }
}
