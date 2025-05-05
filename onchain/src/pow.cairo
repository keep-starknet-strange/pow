use starknet::ContractAddress;

#[starknet::interface]
pub trait IPowGame<TContractState> {
  fn get_user_prestige(self: @TContractState, user: ContractAddress) -> u128;
  fn prestige(ref self: TContractState);
  fn get_user_balance(self: @TContractState, user: ContractAddress) -> u128;

  fn get_working_block_fees(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;
  fn add_transaction(ref self: TContractState, chain_id: u32, tx_type_id: u32);
  fn get_block_clicks(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;
  fn mine_block(ref self: TContractState, chain_id: u32);
}

#[starknet::contract]
mod PowGame {
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};

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

    #[derive(Drop)]
    struct PrestigeConfig {
        id: u32,
        costs: Span<u128>,
        scalers: Span<u128>,
    }

    #[storage]
    struct Storage {
        // Maps: user address -> prestige
        user_prestige: Map<ContractAddress, u128>,
        // Maps: user address -> user balance
        user_balances: Map<ContractAddress, u128>,
        // Maps: (user address, chain id) -> new block fees
        working_blocks: Map<(ContractAddress, u32), u128>,
        // Maps: (user address, chain id) -> click counter
        block_clicks: Map<(ContractAddress, u32), u128>,

        #[substorage(v0)]
        upgrades: PowUpgradesComponent::Storage,
        #[substorage(v0)]
        transactions: PowTransactionsComponent::Storage,
    }

    #[derive(Drop, starknet::Event)]
    struct PrestigeUpdated {
        #[key]
        user: ContractAddress,
        prestige: u128,
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
        total_fees: u128,
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
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PrestigeUpdated: PrestigeUpdated,
        BalanceUpdated: BalanceUpdated,
        TransactionAdded: TransactionAdded,
        BlockClicked: BlockClicked,
        BlockMined: BlockMined,
        #[flat]
        UpgradeEvent: PowUpgradesComponent::Event,
        #[flat]
        TransactionEvent: PowTransactionsComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {

    }

    #[abi(embed_v0)]
    impl PowGameImpl of super::IPowGame<ContractState> {
        fn get_user_prestige(self: @ContractState, user: ContractAddress) -> u128 {
            self.user_prestige.read(user)
        }

        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u128 {
            self.user_balances.read(user)
        }

        fn prestige(ref self: ContractState) {
            let caller = get_caller_address();
            let current_prestige = self.user_prestige.read(caller);
            let new_prestige = current_prestige + 1;
            self.user_prestige.write(caller, new_prestige);
            self.emit(
              PrestigeUpdated {
                user: caller,
                prestige: new_prestige,
              }
            );

            // TODO: Reset user game state
        }

        fn get_working_block_fees(self: @ContractState, user: ContractAddress, chain_id: u32) -> u128 {
            self.working_blocks.read((user, chain_id))
        }

        fn add_transaction(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            let caller = get_caller_address();
            let fees = self.transactions.get_my_tx_fee_value(chain_id, tx_type_id);
            let current_fees = self.working_blocks.read((caller, chain_id));
            let new_fees = current_fees + fees;
            self.working_blocks.write((caller, chain_id), new_fees);
            self.emit(
              TransactionAdded {
                user: caller,
                chain_id,
                tx_type_id,
                fees,
                total_fees: new_fees,
              }
            );
        }

        fn get_block_clicks(self: @ContractState, user: ContractAddress, chain_id: u32) -> u128 {
            self.block_clicks.read((user, chain_id))
        }

        fn mine_block(ref self: ContractState, chain_id: u32) {
            let block_hp = 8; // TODO: get from storage
            click_block(ref self, get_caller_address(), chain_id);
            let current_clicks = self.block_clicks.read((get_caller_address(), chain_id));
            if current_clicks < block_hp {
                return;
            }

            let caller = get_caller_address();
            let fees = self.working_blocks.read((caller, chain_id));
            update_balance(ref self, caller, fees);
            // Reset the working block state
            self.working_blocks.write((caller, chain_id), 0);
            self.block_clicks.write((caller, chain_id), 0);
            self.emit(
              BlockMined {
                user: caller,
                chain_id,
                fees,
              }
            );
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

    fn click_block(ref self: ContractState, user: ContractAddress, chain_id: u32) {
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
}
