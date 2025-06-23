#[starknet::contract]
mod PowGame {
    use pow_game::actions::*;
    use pow_game::interface::{IPowGame, IPowGameValidation, IPowGameRewards};
    use pow_game::store::*;
    use pow_game::transactions::{DA_TX_TYPE_ID, PROOF_TX_TYPE_ID};
    use pow_game::types::RewardParams;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    // Import the components
    use pow_game::upgrades::component::PowUpgradesComponent;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address, ClassHash};
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
    use pow_game::staking::component::StakingComponent;
    component!(path: StakingComponent, storage: staking, event: StakingEvent);

    use openzeppelin_upgrades::interface::IUpgradeable;
    use openzeppelin_upgrades::UpgradeableComponent;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    use openzeppelin_security::PausableComponent;
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        game_masters: Map<ContractAddress, bool>,
        reward_token_address: ContractAddress,
        reward_prestige_threshold: u32,
        reward_amount: u256,
        genesis_block_reward: u128,
        max_chain_id: u32,
        // Maps: user address -> user max chain unlocked
        user_max_chains: Map<ContractAddress, u32>,
        // Maps: user address -> user balance
        user_balances: Map<ContractAddress, u128>,
        // Maps: user address -> reward claimed
        reward_claimed: Map<ContractAddress, bool>,
        #[substorage(v0)]
        upgrades: PowUpgradesComponent::Storage,
        #[substorage(v0)]
        transactions: PowTransactionsComponent::Storage,
        #[substorage(v0)]
        prestige: PrestigeComponent::Storage,
        #[substorage(v0)]
        builder: BuilderComponent::Storage,
        #[substorage(v0)]
        staking: StakingComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
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
    struct RewardClaimed {
        #[key]
        user: ContractAddress,
        recipient: ContractAddress,
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
        RewardClaimed: RewardClaimed,
        #[flat]
        UpgradeEvent: PowUpgradesComponent::Event,
        #[flat]
        TransactionEvent: PowTransactionsComponent::Event,
        #[flat]
        PrestigeEvent: PrestigeComponent::Event,
        #[flat]
        BuilderEvent: BuilderComponent::Event,
        #[flat]
        StakingEvent: StakingComponent::Event,
         #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
         #[flat]
        PausableEvent: PausableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, host: ContractAddress, reward_params: RewardParams) {
        self.genesis_block_reward.write(1);
        self.max_chain_id.write(2);
        self.game_masters.write(host, true);
        self.reward_token_address.write(reward_params.reward_token_address);
        self.reward_prestige_threshold.write(reward_params.reward_prestige_threshold);
        self.reward_amount.write(reward_params.reward_amount);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.check_valid_game_master(get_caller_address());
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[abi(embed_v0)]
    impl PowGameImpl of IPowGame<ContractState> {
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

        fn add_game_master(ref self: ContractState, user: ContractAddress) {
            self.check_valid_game_master(get_caller_address());
            self.game_masters.write(user, true);
        }

        fn remove_game_master(ref self: ContractState, user: ContractAddress) {
            // TODO: Add host that cannot be removed?
            self.check_valid_game_master(get_caller_address());
            self.game_masters.write(user, false);
        }

        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u128 {
            self.user_balances.read(user)
        }
    }

    #[abi(embed_v0)]
    impl PowGameRewardsImpl of IPowGameRewards<ContractState> {
        fn set_reward_params(ref self: ContractState, reward_params: RewardParams) {
            self.check_valid_game_master(get_caller_address());
            self.reward_token_address.write(reward_params.reward_token_address);
            self.reward_prestige_threshold.write(reward_params.reward_prestige_threshold);
            self.reward_amount.write(reward_params.reward_amount);
        }

        fn claim_reward(ref self: ContractState, recipient: ContractAddress) {
            self.pausable.assert_not_paused();
            let caller = get_caller_address();
            let claimed = self.reward_claimed.read(caller);
            assert!(!claimed, "Reward already claimed");
            let prestige = self.prestige.get_user_prestige(caller);
            let reward_prestige_threshold = self.reward_prestige_threshold.read();
            assert!(prestige >= reward_prestige_threshold, "Not enough prestige to claim reward");
            
            self.reward_claimed.write(caller, true);

            let success: bool = IERC20Dispatcher { contract_address: self.reward_token_address.read() }
                .transfer(recipient, self.reward_amount.read());

            assert!(success, "Reward transfer failed");
            self.emit(RewardClaimed {
                user: caller,
                recipient
            });
        }

        fn game_master_give_reward(ref self: ContractState, game_address: ContractAddress, recipient: ContractAddress) {
             self.check_valid_game_master(get_caller_address());
            let claimed = self.reward_claimed.read(game_address);
            assert!(!claimed, "Reward already claimed");
            
            self.reward_claimed.write(game_address, true);

            let success: bool = IERC20Dispatcher { contract_address: self.reward_token_address.read() }
                .transfer(recipient, self.reward_amount.read());

            assert!(success, "Reward transfer failed");
            self.emit(RewardClaimed {
                user: game_address,
                recipient
            });
        }

        fn get_reward_params(self: @ContractState) -> RewardParams {
            RewardParams {
                reward_token_address: self.reward_token_address.read(),
                reward_amount: self.reward_amount.read(),
                reward_prestige_threshold: self.reward_prestige_threshold.read()
            }
        }

        fn remove_funds(ref self: ContractState, token_address: ContractAddress, recipient: ContractAddress, value: u256) {
            let caller = get_caller_address();
            self.check_valid_game_master(caller);
            let success: bool = IERC20Dispatcher { contract_address: token_address }
                .transfer(recipient, value);

            assert!(success, "remove_funds failed");
        }

        fn pause_rewards(ref self: ContractState) {
            self.check_valid_game_master(get_caller_address());
            self.pausable.pause();
        }

        fn unpause_rewards(ref self: ContractState) {
            self.check_valid_game_master(get_caller_address());
            self.pausable.unpause();
        }
    }

    #[abi(embed_v0)]
    impl PowGameValidationImpl of IPowGameValidation<ContractState> {
        fn check_valid_chain_id(self: @ContractState, chain_id: u32) {
            let max_chain_id = self.max_chain_id.read();
            assert!(chain_id < max_chain_id, "Invalid chain id");
        }

        fn check_user_valid_chain(self: @ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let max_chain_id = self.user_max_chains.read(caller);
            assert!(chain_id < max_chain_id, "Chain not unlocked");
        }

        fn check_valid_game_master(self: @ContractState, user: ContractAddress) {
            assert!(self.game_masters.read(user), "Invalid game master");
        }

        fn check_block_not_full(self: @ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let working_block = self.get_block_building_state(caller, chain_id);
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            assert!(working_block.size.into() < block_size, "Block is full");
        }
    }

    #[abi(embed_v0)]
    impl PowGameActionsImpl of IPowGameActions<ContractState> {
        fn init_my_game(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(self.user_max_chains.read(caller) == 0, "Account already initialized");
            unlock_next_chain(ref self);
        }

        fn add_transaction(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            // Validation
            self.check_has_tx(chain_id, tx_type_id);

            // Update working block
            let tx_fees = self.transactions.get_my_tx_fee_value(chain_id, tx_type_id);
            let mev_boost = self.get_my_upgrade(chain_id, 'MEV Boost');
            let prestige_scaler = self.get_my_prestige_scaler();
            let total_fees = tx_fees * mev_boost * prestige_scaler;
            do_add_transaction(ref self, chain_id, tx_type_id, total_fees);
        }

        fn mine_block(ref self: ContractState, chain_id: u32) {
            // Validation
            let caller = get_caller_address();
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let block_size = block_width * block_width;
            let working_block = self.get_block_building_state(caller, chain_id);
            assert!(working_block.size.into() >= block_size, "Block is not full");

            // Try Mining
            do_click_block(ref self, chain_id);
            let current_clicks = self.get_block_clicks(caller, chain_id);
            let block_hp = self.get_my_upgrade(chain_id, 'Block Difficulty');
            if current_clicks < block_hp {
                return;
            }

            // Finalize block
            let fees = working_block.fees;
            let reward = self.get_my_upgrade(chain_id, 'Block Reward');
            if (chain_id != 0) {
              // Add block to da & proof
              self.build_proof(chain_id, fees + reward);
              self.build_da(chain_id, fees + reward);
            } else {
              pay_user(ref self, caller, fees + reward);
            }
            self.emit(BlockMined { user: caller, chain_id, fees, reward });

            self.reset_block(chain_id);
        }

        fn store_da(ref self: ContractState, chain_id: u32) {
            // Validation
            assert!(chain_id > 0, "DA compression not available on genesis chain");
            let caller = get_caller_address();
            let da_size = self.get_my_upgrade(chain_id, 'DA compression');
            let working_da = self.get_da_building_state(caller, chain_id);
            assert!(working_da.size.into() >= da_size, "DA is not full");

            // Try Storing
            do_click_da(ref self, chain_id);
            let current_clicks = self.get_da_clicks(caller, chain_id);
            let da_hp = self.get_my_upgrade(chain_id, 'DA compression');
            if current_clicks < da_hp {
                return;
            }

            // Add DA to lower chain
            let total_fees = working_da.fees;
            do_add_transaction(ref self, chain_id - 1, DA_TX_TYPE_ID, total_fees);
            self.emit(DAStored { user: caller, chain_id, fees: total_fees });

            self.reset_da(chain_id);
        }

        fn prove(ref self: ContractState, chain_id: u32) {
            // Validation
            assert!(chain_id > 0, "Proof compression not available on genesis chain");
            let caller = get_caller_address();
            let proof_size = self.get_my_upgrade(chain_id, 'Recursive Proving');
            let working_proof = self.get_proof_building_state(caller, chain_id);
            assert!(working_proof.size.into() >= proof_size, "Proof is not full");

            // Try Proving
            do_click_proof(ref self, chain_id);
            let current_clicks = self.get_proof_clicks(caller, chain_id);
            let proof_hp = self.get_my_upgrade(chain_id, 'Recursive Proving');
            if current_clicks < proof_hp {
                return;
            }

            // Add Proof to lower chain
            let total_fees = working_proof.fees;
            do_add_transaction(ref self, chain_id - 1, PROOF_TX_TYPE_ID, total_fees);
            self.emit(ProofStored { user: caller, chain_id, fees: total_fees });

            self.reset_proof(chain_id);
        }
    }

    #[abi(embed_v0)]
    impl PowStoreImpl of IPowStore<ContractState> {
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
            unlock_next_chain(ref self);
        }

        fn buy_prestige(ref self: ContractState) {
            let cost = self.get_next_prestige_cost();
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            do_prestige(ref self);
        }
    }

    // Private functions
    fn pay_user(ref self: ContractState, user: ContractAddress, delta: u128) {
        let old_balance = self.user_balances.read(user);
        let new_balance = old_balance + delta;
        self.user_balances.write(user, new_balance);
        self.emit(BalanceUpdated { user, old_balance, new_balance });
    }

    fn debit_user(ref self: ContractState, user: ContractAddress, cost: u128) {
        let balance = self.user_balances.read(user);
        assert!(balance >= cost, "Not enough balance");
        let new_balance = balance - cost;
        self.user_balances.write(user, new_balance);
        self.emit(BalanceUpdated { user, old_balance: balance, new_balance });
    }

    fn do_add_transaction(
        ref self: ContractState, chain_id: u32, tx_type_id: u32, total_fees: u128,
    ) {
        let caller = get_caller_address();
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);
        self.check_block_not_full(chain_id);
        self.build_block(chain_id, total_fees);
        self.emit(TransactionAdded { user: caller, chain_id, tx_type_id, fees: total_fees });
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

    fn unlock_next_chain(ref self: ContractState) {
        let caller = get_caller_address();
        let new_chain_id = self.user_max_chains.read(caller);
        self.check_valid_chain_id(new_chain_id);
        self.user_max_chains.write(caller, new_chain_id + 1);
        // Finalize genesis block
        if (new_chain_id != 0) {
          // Add genesis block to da & proof
          self.build_proof(new_chain_id, self.genesis_block_reward.read());
          self.build_da(new_chain_id, self.genesis_block_reward.read());
        } else {
          pay_user(ref self, caller, self.genesis_block_reward.read());
        }
        self.emit(ChainUnlocked { user: caller, chain_id: new_chain_id });
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
}
