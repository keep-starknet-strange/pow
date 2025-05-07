use starknet::ContractAddress;

#[derive(Drop, starknet::Store, Serde, Clone)]
struct WorkingBlock {
    size: u32,
    fees: u128,
}

#[derive(Drop, starknet::Store, Serde, Clone)]
struct WorkingDA {
    size: u32,
    fees: u128,
}

#[derive(Drop, starknet::Store, Serde, Clone)]
struct WorkingProof {
    size: u32,
    fees: u128,
}

const DA_TX_TYPE_ID: u32 = 100;
const PROOF_TX_TYPE_ID: u32 = 101;

#[starknet::interface]
pub trait IPowGame<TContractState> {
  // Configs & helpers
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

  fn get_working_block(self: @TContractState, user: ContractAddress, chain_id: u32) -> WorkingBlock;
  fn get_working_block_size(self: @TContractState, user: ContractAddress, chain_id: u32) -> u32;
  fn get_working_block_fees(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;
  fn add_transaction(ref self: TContractState, chain_id: u32, tx_type_id: u32);
  fn get_block_clicks(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;
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
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess,
        StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};
    use super::{WorkingBlock, WorkingDA, WorkingProof, DA_TX_TYPE_ID, PROOF_TX_TYPE_ID};

    use pow_game::upgrades::component::PowUpgradesComponent;
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
    impl PrestigeComponentImpl =
        PrestigeComponent::PrestigeImpl<ContractState>;

    #[storage]
    struct Storage {
        // Configs
        genesis_block_reward: u128,
        max_chain_id: u32,
        game_masters: Map<ContractAddress, bool>,

        // Maps: user address -> user max chain unlocked
        user_max_chains: Map<ContractAddress, u32>,
        // Maps: user address -> user balance
        user_balances: Map<ContractAddress, u128>,
        // Maps: (user address, chain id) -> in progress block
        working_blocks: Map<(ContractAddress, u32), WorkingBlock>,
        // Maps: (user address, chain id) -> click counter
        block_clicks: Map<(ContractAddress, u32), u128>,
        // Maps: (user address, chain id) -> in progress da
        working_da: Map<(ContractAddress, u32), WorkingDA>,
        // Maps: (user address, chain id) -> da click counter
        da_clicks: Map<(ContractAddress, u32), u128>,
        // Maps: (user address, chain id) -> in progress proof
        working_proof: Map<(ContractAddress, u32), WorkingProof>,
        // Maps: (user address, chain id) -> proof click counter
        proof_clicks: Map<(ContractAddress, u32), u128>,

        #[substorage(v0)]
        upgrades: PowUpgradesComponent::Storage,
        #[substorage(v0)]
        transactions: PowTransactionsComponent::Storage,
        #[substorage(v0)]
        prestige: PrestigeComponent::Storage,
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
        new_block: WorkingBlock,
    }

    #[derive(Drop, starknet::Event)]
    struct BlockClicked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        click_count: u128,
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
    struct DAClicked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        click_count: u128,
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
    struct ProofClicked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        click_count: u128,
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
        BlockClicked: BlockClicked,
        BlockMined: BlockMined,
        DAClicked: DAClicked,
        DAStored: DAStored,
        ProofClicked: ProofClicked,
        ProofStored: ProofStored,
        #[flat]
        UpgradeEvent: PowUpgradesComponent::Event,
        #[flat]
        TransactionEvent: PowTransactionsComponent::Event,
        #[flat]
        PrestigeEvent: PrestigeComponent::Event,
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
            self.emit(
              ChainUnlocked {
                user: caller,
                chain_id: new_chain_id,
              }
            );
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
                self.working_blocks.write((caller, chain_id), WorkingBlock { size: 0, fees: 0 });
                self.working_da.write((caller, chain_id), WorkingDA { size: 0, fees: 0 });
                self.working_proof.write((caller, chain_id), WorkingProof { size: 0, fees: 0 });
                self.block_clicks.write((caller, chain_id), 0);
                self.da_clicks.write((caller, chain_id), 0);
                self.proof_clicks.write((caller, chain_id), 0);
                self.transactions.reset_tx_levels(chain_id);
                self.upgrades.reset_upgrade_levels(chain_id);
                chain_id += 1;
            }
        }

        fn get_working_block(self: @ContractState, user: ContractAddress, chain_id: u32) -> WorkingBlock {
            self.working_blocks.read((user, chain_id))
        }

        fn get_working_block_size(self: @ContractState, user: ContractAddress, chain_id: u32) -> u32 {
            self.working_blocks.read((user, chain_id)).size
        }

        fn get_working_block_fees(self: @ContractState, user: ContractAddress, chain_id: u32) -> u128 {
            self.working_blocks.read((user, chain_id)).fees
        }

        fn add_transaction(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            // Validation
            self.check_valid_chain_id(chain_id);
            self.check_user_valid_chain(chain_id);
            self.check_has_tx(chain_id, tx_type_id);
            let caller = get_caller_address();
            let working_block = self.working_blocks.read((caller, chain_id));
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");

            // Update working block
            let tx_fees = self.transactions.get_my_tx_fee_value(chain_id, tx_type_id);
            let mev_boost = self.get_my_upgrade(chain_id, 'MEV Boost');
            let prestige_scaler = self.get_my_prestige_scaler();
            let total_fees = tx_fees * mev_boost * prestige_scaler;
            let new_fees = working_block.fees + total_fees;
            let new_working_block = WorkingBlock {
                size: working_block.size + 1,
                fees: new_fees,
            };
            self.working_blocks.write((caller, chain_id), new_working_block.clone());
            self.emit(
              TransactionAdded {
                user: caller,
                chain_id,
                tx_type_id,
                fees: total_fees,
                new_block: new_working_block,
              }
            );
        }

        fn get_block_clicks(self: @ContractState, user: ContractAddress, chain_id: u32) -> u128 {
            self.block_clicks.read((user, chain_id))
        }

        fn mine_block(ref self: ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            let working_block = self.working_blocks.read((caller, chain_id));
            assert!(working_block.size.into() >= block_size, "Block is not full");
            click_block(ref self, caller, chain_id);
            let current_clicks = self.block_clicks.read((caller, chain_id));
            let block_hp = self.get_my_upgrade(chain_id, 'Block Difficulty');
            if current_clicks < block_hp {
                return;
            }

            let fees = self.working_blocks.read((caller, chain_id)).fees;
            let reward = self.get_my_upgrade(chain_id, 'Block Reward');
            update_balance(ref self, caller, fees + reward);

            // Reset the working block state
            self.working_blocks.write((caller, chain_id), WorkingBlock { size: 0, fees: 0 });
            self.block_clicks.write((caller, chain_id), 0);
            self.emit(
              BlockMined {
                user: caller,
                chain_id,
                fees,
                reward,
              }
            );
        }

        fn store_da(ref self: ContractState, chain_id: u32) {
            assert!(chain_id > 0, "DA compression not available on genesis chain");
            let caller = get_caller_address();
            let da_size = self.get_my_upgrade(chain_id, 'DA compression');
            let working_da = self.working_da.read((caller, chain_id));
            assert!(working_da.size.into() >= da_size, "DA is not full");
            click_da(ref self, caller, chain_id);
            let current_clicks = self.da_clicks.read((caller, chain_id));
            let da_hp = self.get_my_upgrade(chain_id, 'DA compression');
            if current_clicks < da_hp {
                return;
            }

            // Add da to lower chain
            let working_block = self.working_blocks.read((caller, chain_id - 1));
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");

            let total_fees = self.working_da.read((caller, chain_id)).fees;
            let new_fees = working_block.fees + total_fees;
            let new_working_block = WorkingBlock {
                size: working_block.size + 1,
                fees: new_fees,
            };
            self.working_blocks.write((caller, chain_id), new_working_block.clone());
            self.emit(
              TransactionAdded {
                user: caller,
                chain_id,
                tx_type_id: DA_TX_TYPE_ID,
                fees: total_fees,
                new_block: new_working_block,
              }
            );

            // Reset the working da state
            self.working_da.write((caller, chain_id), WorkingDA { size: 0, fees: 0 });
            self.da_clicks.write((caller, chain_id), 0);
            self.emit(
              DAStored {
                user: caller,
                chain_id,
                fees: total_fees,
              }
            );
        }

        fn prove(ref self: ContractState, chain_id: u32) {
            assert!(chain_id > 0, "Proof compression not available on genesis chain");
            let caller = get_caller_address();
            let proof_size = self.get_my_upgrade(chain_id, 'Recursive Proving');
            let working_proof = self.working_proof.read((caller, chain_id));
            assert!(working_proof.size.into() >= proof_size, "Proof is not full");
            click_proof(ref self, caller, chain_id);
            let current_clicks = self.proof_clicks.read((caller, chain_id));
            let proof_hp = self.get_my_upgrade(chain_id, 'Recursive Proving');
            if current_clicks < proof_hp {
                return;
            }

            // Add proof to lower chain
            let working_block = self.working_blocks.read((caller, chain_id - 1));
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");
            let total_fees = self.working_proof.read((caller, chain_id)).fees;
            let new_fees = working_block.fees + total_fees;
            let new_working_block = WorkingBlock {
                size: working_block.size + 1,
                fees: new_fees,
            };
            self.working_blocks.write((caller, chain_id), new_working_block.clone());
            self.emit(
              TransactionAdded {
                user: caller,
                chain_id,
                tx_type_id: PROOF_TX_TYPE_ID,
                fees: total_fees,
                new_block: new_working_block,
              }
            );

            // Reset the working proof state
            self.working_proof.write((caller, chain_id), WorkingProof { size: 0, fees: 0 });
            self.proof_clicks.write((caller, chain_id), 0);
            self.emit(
              ProofStored {
                user: caller,
                chain_id,
                fees: total_fees,
              }
            );
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
        self.emit(
          BalanceUpdated {
            user,
            old_balance,
            new_balance: balance,
          }
        );
    }

    fn update_balance(ref self: ContractState, user: ContractAddress, delta: u128) {
        let old_balance = self.user_balances.read(user);
        let new_balance = old_balance + delta;
        self.user_balances.write(user, new_balance);
        self.emit(
          BalanceUpdated {
            user,
            old_balance,
            new_balance,
          }
        );
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
        self.emit(
          BalanceUpdated {
            user,
            old_balance: balance,
            new_balance,
          }
        );
    }

    fn click_block(ref self: ContractState, user: ContractAddress, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        let current_clicks = self.block_clicks.read((user, chain_id));
        let new_clicks = current_clicks + 1;
        self.block_clicks.write((user, chain_id), new_clicks);
        self.emit(
          BlockClicked {
            user,
            chain_id,
            click_count: new_clicks,
          }
        ); 
    }

    fn click_da(ref self: ContractState, user: ContractAddress, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        let current_clicks = self.da_clicks.read((user, chain_id));
        let new_clicks = current_clicks + 1;
        self.da_clicks.write((user, chain_id), new_clicks);
        self.emit(
          DAClicked {
            user,
            chain_id,
            click_count: new_clicks,
          }
        );
    }

    fn click_proof(ref self: ContractState, user: ContractAddress, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        let current_clicks = self.proof_clicks.read((user, chain_id));
        let new_clicks = current_clicks + 1;
        self.proof_clicks.write((user, chain_id), new_clicks);
        self.emit(
          ProofClicked {
            user,
            chain_id,
            click_count: new_clicks,
          }
        );
    }
}
