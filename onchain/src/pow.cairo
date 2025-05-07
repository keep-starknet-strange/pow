use starknet::ContractAddress;

const DA_TX_TYPE_ID: u32 = 100;
const PROOF_TX_TYPE_ID: u32 = 101;

#[starknet::interface]
pub trait IPowGame<TContractState> {
    fn get_genesis_block_reward(self: @TContractState) -> u128;
    fn set_genesis_block_reward(ref self: TContractState, reward: u128);
    fn get_max_chain_id(self: @TContractState) -> u32;
    fn set_max_chain_id(ref self: TContractState, chain_id: u32);
    fn check_valid_chain_id(self: @TContractState, chain_id: u32);
    fn check_user_valid_chain(self: @TContractState, chain_id: u32);
    fn add_game_master(ref self: TContractState, user: ContractAddress);
    fn remove_game_master(ref self: TContractState, user: ContractAddress);
    fn check_valid_game_master(self: @TContractState, user: ContractAddress);

    fn do_prestige(ref self: TContractState);
    fn init_my_game(ref self: TContractState);
    fn unlock_next_chain(ref self: TContractState);
    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u128;

    fn add_transaction(ref self: TContractState, chain_id: u32, tx_type_id: u32);
    fn mine_block(ref self: TContractState, chain_id: u32);
    fn store_da(ref self: TContractState, chain_id: u32);
    fn prove(ref self: TContractState, chain_id: u32);

    fn buy_tx_fee(ref self: TContractState, chain_id: u32, tx_type_id: u32);
    fn buy_tx_speed(ref self: TContractState, chain_id: u32, tx_type_id: u32);
    fn buy_upgrade(ref self: TContractState, chain_id: u32, upgrade_id: u32);
    fn buy_automation(ref self: TContractState, chain_id: u32, automation_id: u32);
    fn buy_dapps(ref self: TContractState, chain_id: u32);
    fn buy_next_chain(ref self: TContractState);
    fn buy_prestige(ref self: TContractState);
}

#[starknet::contract]
mod PowGame {
    use pow_game::upgrades::component::PowUpgradesComponent;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};
    use super::{DA_TX_TYPE_ID, PROOF_TX_TYPE_ID};
    component!(path: PowUpgradesComponent, storage: upgrades, event: UpgradeEvent);
    #[abi(embed_v0)]
    impl PowUpgradesComponentImpl =
        PowUpgradesComponent::PowUpgradesImpl<ContractState>;
    use pow_game::transactions::component::PowTransactionsComponent;
    component!(path: PowTransactionsComponent, storage: transactions, event: TransactionEvent);
    #[abi(embed_v0)]
    impl PowTransactionsComponentImpl =
        PowTransactionsComponent::PowTransactionsImpl<ContractState>;
    use pow_game::prestige::component::PrestigeComponent;
    component!(path: PrestigeComponent, storage: prestige, event: PrestigeEvent);
    #[abi(embed_v0)]
    impl PrestigeComponentImpl = PrestigeComponent::PrestigeImpl<ContractState>;
    use pow_game::builder::component::BuilderComponent;
    component!(path: BuilderComponent, storage: builder, event: BuilderEvent);
    #[abi(embed_v0)]
    impl BuilderComponentImpl = BuilderComponent::BuilderImpl<ContractState>;

    #[storage]
    struct Storage {
        game_masters: Map<ContractAddress, bool>,
        genesis_block_reward: u128,
        max_chain_id: u32,
        // Maps: user address -> user max chain unlocked
        user_max_chains: Map<ContractAddress, u32>,
        // Maps: user address -> user balance
        user_balances: Map<ContractAddress, u128>,
        #[substorage(v0)]
        upgrades: PowUpgradesComponent::Storage,
        #[substorage(v0)]
        transactions: PowTransactionsComponent::Storage,
        #[substorage(v0)]
        prestige: PrestigeComponent::Storage,
        #[substorage(v0)]
        builder: BuilderComponent::Storage,
    }

    #[derive(Drop, starknet::Event)]
    struct ChainUnlocked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct BalanceUpdated {
        #[key]
        user: ContractAddress,
        old_balance: u128,
        new_balance: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionAdded {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        #[key]
        tx_type_id: u32,
        fees: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct BlockMined {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        fees: u128,
        reward: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct DAStored {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        fees: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofStored {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        fees: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ChainUnlocked: ChainUnlocked,
        BalanceUpdated: BalanceUpdated,
        TransactionAdded: TransactionAdded,
        BlockMined: BlockMined,
        DAStored: DAStored,
        ProofStored: ProofStored,
        #[flat]
        UpgradeEvent: PowUpgradesComponent::Event,
        #[flat]
        TransactionEvent: PowTransactionsComponent::Event,
        #[flat]
        PrestigeEvent: PrestigeComponent::Event,
        #[flat]
        BuilderEvent: BuilderComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, host: ContractAddress) {
        self.genesis_block_reward.write(1);
        self.max_chain_id.write(2);
        self.game_masters.write(host, true);
    }

    #[abi(embed_v0)]
    impl PowGameImpl of super::IPowGame<ContractState> {
        fn get_genesis_block_reward(self: @ContractState) -> u128 {
            self.genesis_block_reward.read()
        }

        fn set_genesis_block_reward(ref self: ContractState, reward: u128) {
            self.check_valid_game_master(get_caller_address());
            self.genesis_block_reward.write(reward);
        }

        fn get_max_chain_id(self: @ContractState) -> u32 {
            self.max_chain_id.read()
        }

        fn set_max_chain_id(ref self: ContractState, chain_id: u32) {
            self.check_valid_game_master(get_caller_address());
            self.max_chain_id.write(chain_id);
        }

        fn check_valid_chain_id(self: @ContractState, chain_id: u32) {
            let max_chain_id = self.max_chain_id.read();
            assert!(chain_id < max_chain_id, "Invalid chain id");
        }

        fn check_user_valid_chain(self: @ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let max_chain_id = self.user_max_chains.read(caller);
            assert!(chain_id < max_chain_id, "Chain not unlocked");
        }

        fn add_game_master(ref self: ContractState, user: ContractAddress) {
            self.check_valid_game_master(get_caller_address());
            self.game_masters.write(user, true);
        }

        fn remove_game_master(ref self: ContractState, user: ContractAddress) {
            // TODO: Add host that cannot be removed?
            self.check_valid_game_master(get_caller_address());
            self.game_masters.write(user, false);
        }

        fn check_valid_game_master(self: @ContractState, user: ContractAddress) {
            assert!(self.game_masters.read(user), "Invalid game master");
        }

        fn init_my_game(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(self.user_max_chains.read(caller) == 0, "Account already initialized");
            self.unlock_next_chain();
        }

        fn unlock_next_chain(ref self: ContractState) {
            let caller = get_caller_address();
            let new_chain_id = self.user_max_chains.read(caller);
            self.check_valid_chain_id(new_chain_id);
            self.user_max_chains.write(caller, new_chain_id + 1);
            update_balance(ref self, caller, self.genesis_block_reward.read());
            self.emit(ChainUnlocked { user: caller, chain_id: new_chain_id });
        }

        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u128 {
            self.user_balances.read(user)
        }

        fn do_prestige(ref self: ContractState) {
            // Validation
            let caller = get_caller_address();
            let my_max_chain_id = self.user_max_chains.read(caller);
            assert!(my_max_chain_id >= self.max_chain_id.read(), "Not enough chains unlocked");
            // TODO: Check upgrades, txs, etc. levels

            self.prestige();

            // Reset user state
            self.user_max_chains.write(caller, 0);
            self.user_balances.write(caller, 0);
            let mut chain_id = 0;
            let max_chain_id = self.max_chain_id.read();
            while chain_id != max_chain_id {
                self.reset_block(chain_id);
                self.reset_da(chain_id);
                self.reset_proof(chain_id);
                self.transactions.reset_tx_levels(chain_id);
                self.upgrades.reset_upgrade_levels(chain_id);
                chain_id += 1;
            }
        }

        fn add_transaction(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            // Validation
            self.check_valid_chain_id(chain_id);
            self.check_user_valid_chain(chain_id);
            self.check_has_tx(chain_id, tx_type_id);
            let caller = get_caller_address();
            let working_block = self.get_block_building_state(caller, chain_id);
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");

            // Update working block
            let tx_fees = self.transactions.get_my_tx_fee_value(chain_id, tx_type_id);
            let mev_boost = self.get_my_upgrade(chain_id, 'MEV Boost');
            let prestige_scaler = self.get_my_prestige_scaler();
            let total_fees = tx_fees * mev_boost * prestige_scaler;
            self.build_block(chain_id, total_fees);
            self.emit(TransactionAdded { user: caller, chain_id, tx_type_id, fees: total_fees });
        }

        fn mine_block(ref self: ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            let working_block = self.get_block_building_state(caller, chain_id);
            assert!(working_block.size.into() >= block_size, "Block is not full");
            do_click_block(ref self, chain_id);
            let current_clicks = self.get_block_clicks(caller, chain_id);
            let block_hp = self.get_my_upgrade(chain_id, 'Block Difficulty');
            if current_clicks < block_hp {
                return;
            }

            let fees = working_block.fees;
            let reward = self.get_my_upgrade(chain_id, 'Block Reward');
            update_balance(ref self, caller, fees + reward);

            // Reset the working block state
            self.reset_block(chain_id);
            self.emit(BlockMined { user: caller, chain_id, fees, reward });
        }

        fn store_da(ref self: ContractState, chain_id: u32) {
            assert!(chain_id > 0, "DA compression not available on genesis chain");
            let caller = get_caller_address();
            let da_size = self.get_my_upgrade(chain_id, 'DA compression');
            let working_da = self.get_da_building_state(caller, chain_id);
            assert!(working_da.size.into() >= da_size, "DA is not full");
            do_click_da(ref self, chain_id);
            let current_clicks = self.get_da_clicks(caller, chain_id);
            let da_hp = self.get_my_upgrade(chain_id, 'DA compression');
            if current_clicks < da_hp {
                return;
            }

            // Add da to lower chain
            let working_block = self.get_block_building_state(caller, chain_id - 1);
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");

            let total_fees = working_da.fees;
            self.build_block(chain_id - 1, total_fees);
            self
                .emit(
                    TransactionAdded {
                        user: caller, chain_id, tx_type_id: DA_TX_TYPE_ID, fees: total_fees,
                    },
                );

            // Reset the working da state
            self.reset_da(chain_id);
            self.emit(DAStored { user: caller, chain_id, fees: total_fees });
        }

        fn prove(ref self: ContractState, chain_id: u32) {
            assert!(chain_id > 0, "Proof compression not available on genesis chain");
            let caller = get_caller_address();
            let proof_size = self.get_my_upgrade(chain_id, 'Recursive Proving');
            let working_proof = self.get_proof_building_state(caller, chain_id);
            assert!(working_proof.size.into() >= proof_size, "Proof is not full");
            do_click_proof(ref self, chain_id);
            let current_clicks = self.get_proof_clicks(caller, chain_id);
            let proof_hp = self.get_my_upgrade(chain_id, 'Recursive Proving');
            if current_clicks < proof_hp {
                return;
            }

            // Add proof to lower chain
            let working_block = self.get_block_building_state(caller, chain_id - 1);
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");
            let total_fees = working_proof.fees;
            self.build_block(chain_id - 1, total_fees);
            self
                .emit(
                    TransactionAdded {
                        user: caller, chain_id, tx_type_id: PROOF_TX_TYPE_ID, fees: total_fees,
                    },
                );

            // Reset the working proof state
            self.reset_proof(chain_id);
            self.emit(ProofStored { user: caller, chain_id, fees: total_fees });
        }

        fn buy_tx_fee(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            let cost = self.get_next_tx_fee_cost(chain_id, tx_type_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.level_transaction_fee(chain_id, tx_type_id);
        }

        fn buy_tx_speed(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            let cost = self.get_next_tx_speed_cost(chain_id, tx_type_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.level_transaction_speed(chain_id, tx_type_id);
        }

        fn buy_upgrade(ref self: ContractState, chain_id: u32, upgrade_id: u32) {
            let cost = self.get_next_upgrade_cost(chain_id, upgrade_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.level_upgrade(chain_id, upgrade_id);
        }

        fn buy_automation(ref self: ContractState, chain_id: u32, automation_id: u32) {
            let cost = self.get_next_automation_cost(chain_id, automation_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.level_automation(chain_id, automation_id);
        }

        fn buy_dapps(ref self: ContractState, chain_id: u32) {
            let cost = 100; // TODO: get from config
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.unlock_dapps(chain_id);
        }

        fn buy_next_chain(ref self: ContractState) {
            let cost = 1000; // TODO: get from config
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.unlock_next_chain();
        }

        fn buy_prestige(ref self: ContractState) {
            let cost = self.get_next_prestige_cost();
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.prestige();
        }
    }

    // Private functions
    fn set_user_balance(ref self: ContractState, user: ContractAddress, balance: u128) {
        let old_balance = self.user_balances.read(user);
        self.user_balances.write(user, balance);
        self.emit(BalanceUpdated { user, old_balance, new_balance: balance });
    }

    fn update_balance(ref self: ContractState, user: ContractAddress, delta: u128) {
        let old_balance = self.user_balances.read(user);
        let new_balance = old_balance + delta;
        self.user_balances.write(user, new_balance);
        self.emit(BalanceUpdated { user, old_balance, new_balance });
    }

    fn check_can_buy(ref self: ContractState, user: ContractAddress, cost: u128) {
        let balance = self.user_balances.read(user);
        assert!(balance >= cost, "Not enough balance");
    }

    fn debit_user(ref self: ContractState, user: ContractAddress, cost: u128) {
        let balance = self.user_balances.read(user);
        check_can_buy(ref self, user, cost);
        let new_balance = balance - cost;
        self.user_balances.write(user, new_balance);
        self.emit(BalanceUpdated { user, old_balance: balance, new_balance });
    }

    fn do_click_block(ref self: ContractState, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        self.click_block(chain_id);
    }

    fn do_click_da(ref self: ContractState, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        self.click_da(chain_id);
    }

    fn do_click_proof(ref self: ContractState, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        self.click_proof(chain_id);
    }
}
