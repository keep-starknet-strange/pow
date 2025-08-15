#[starknet::contract]
mod PowGame {
    use openzeppelin_security::PausableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin_upgrades::UpgradeableComponent;
    use openzeppelin_upgrades::interface::IUpgradeable;
    use pow_game::actions::*;
    use pow_game::cheat_codes::{CheatCodeUsed, IPowCheatCodes};
    use pow_game::interface::{IPowGame, IPowGameRewards, IPowGameValidation};
    use pow_game::store::*;
    use pow_game::types::RewardParams;

    // --- Game Components ---

    // Upgrades
    use pow_game::upgrades::component::PowUpgradesComponent;
    use pow_game::upgrades::{AutomationSetupParams, UpgradeSetupParams};

    // --- External Dependencies ---
    use starknet::{
        ClassHash, ContractAddress, get_caller_address,
        storage::{
            Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
            StoragePointerWriteAccess,
        },
    };
    component!(path: PowUpgradesComponent, storage: upgrades, event: UpgradeEvent);
    #[abi(embed_v0)]
    impl PowUpgradesComponentImpl =
        PowUpgradesComponent::PowUpgradesImpl<ContractState>;
    impl PowUpgradesInternalImpl = PowUpgradesComponent::InternalImpl<ContractState>;
    use pow_game::transactions::TransactionSetupParams;

    // Transactions
    use pow_game::transactions::component::PowTransactionsComponent;
    component!(path: PowTransactionsComponent, storage: transactions, event: TransactionEvent);
    #[abi(embed_v0)]
    impl PowTransactionsComponentImpl =
        PowTransactionsComponent::PowTransactionsImpl<ContractState>;
    impl PowTransactionsInternalImpl = PowTransactionsComponent::InternalImpl<ContractState>;
    use pow_game::prestige::PrestigeSetupParams;

    // Prestige
    use pow_game::prestige::component::PrestigeComponent;
    component!(path: PrestigeComponent, storage: prestige, event: PrestigeEvent);
    #[abi(embed_v0)]
    impl PrestigeComponentImpl = PrestigeComponent::PrestigeImpl<ContractState>;
    impl PrestigeInternalImpl = PrestigeComponent::InternalImpl<ContractState>;

    // Builder
    use pow_game::builder::component::BuilderComponent;
    component!(path: BuilderComponent, storage: builder, event: BuilderEvent);
    #[abi(embed_v0)]
    impl BuilderComponentImpl = BuilderComponent::BuilderImpl<ContractState>;
    impl BuilderInternalImpl = BuilderComponent::InternalImpl<ContractState>;

    // TODO: Re-enable
    // Staking
    // use pow_game::staking::StakingConfig;
    // use pow_game::staking::component::StakingComponent;
    // component!(path: StakingComponent, storage: staking, event: StakingEvent);
    // #[abi(embed_v0)]
    // impl StakingComponentImpl = StakingComponent::StakingImpl<ContractState>;
    // impl StakingInternalImpl = StakingComponent::InternalImpl<ContractState>;

    // -- Admin Components --

    // Upgradability
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    // Pausability
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;


    #[storage]
    struct Storage {
        hosts: Map<ContractAddress, bool>,
        game_masters: Map<ContractAddress, bool>,
        reward_token_address: ContractAddress,
        reward_prestige_threshold: u32,
        reward_amount: u256,
        genesis_block_reward: u128,
        game_chain_count: u32,
        next_chain_cost: u128,
        dapps_unlock_cost: Map<u32, u128>,
        // Maps: user address -> user max chain unlocked
        user_chain_count: Map<ContractAddress, u32>,
        // Maps: user address -> user balance
        user_balances: Map<ContractAddress, u128>,
        // Maps: user address -> reward claimed
        reward_claimed: Map<ContractAddress, bool>,
        // Cheat codes enabled flag
        cheat_codes_enabled: bool,
        #[substorage(v0)]
        upgrades: PowUpgradesComponent::Storage,
        #[substorage(v0)]
        transactions: PowTransactionsComponent::Storage,
        #[substorage(v0)]
        prestige: PrestigeComponent::Storage,
        #[substorage(v0)]
        builder: BuilderComponent::Storage,
        // #[substorage(v0)]
        // staking: StakingComponent::Storage,
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
        // #[flat]
        // StakingEvent: StakingComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        CheatCodeUsed: CheatCodeUsed,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        host: ContractAddress,
        reward_params: RewardParams,
        is_devmode: bool,
    ) {
        self.genesis_block_reward.write(1);
        self.game_chain_count.write(2);
        self.next_chain_cost.write(527124000);
        self.dapps_unlock_cost.write(0, 847462);
        self.dapps_unlock_cost.write(1, 12086666666667);
        self.hosts.write(host, true);
        self.game_masters.write(host, true);
        self.reward_token_address.write(reward_params.reward_token_address);
        self.reward_prestige_threshold.write(reward_params.reward_prestige_threshold);
        self.reward_amount.write(reward_params.reward_amount);
        self.cheat_codes_enabled.write(is_devmode);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.check_valid_host(get_caller_address());
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[abi(embed_v0)]
    impl PowGameImpl of IPowGame<ContractState> {
        fn get_genesis_block_reward(self: @ContractState) -> u128 {
            self.genesis_block_reward.read()
        }

        fn set_genesis_block_reward(ref self: ContractState, reward: u128) {
            self.check_valid_game_master();
            self.genesis_block_reward.write(reward);
        }

        fn get_game_chain_count(self: @ContractState) -> u32 {
            self.game_chain_count.read()
        }

        fn set_game_chain_count(ref self: ContractState, chain_id: u32) {
            self.check_valid_game_master();
            self.game_chain_count.write(chain_id);
        }

        fn get_next_chain_cost(self: @ContractState) -> u128 {
            self.next_chain_cost.read()
        }

        fn set_next_chain_cost(ref self: ContractState, cost: u128) {
            self.check_valid_game_master();
            self.next_chain_cost.write(cost);
        }

        fn get_dapps_unlock_cost(self: @ContractState, chain_id: u32) -> u128 {
            self.dapps_unlock_cost.read(chain_id)
        }

        fn set_dapps_unlock_cost(ref self: ContractState, chain_id: u32, cost: u128) {
            self.check_valid_game_master();
            self.dapps_unlock_cost.write(chain_id, cost);
        }

        fn add_host(ref self: ContractState, user: ContractAddress) {
            self.check_valid_host(get_caller_address());
            self.hosts.write(user, true);
            self.game_masters.write(user, true);
        }

        fn remove_host(ref self: ContractState, user: ContractAddress) {
            self.check_valid_host(get_caller_address());
            self.hosts.write(user, false);
        }

        fn add_game_master(ref self: ContractState, user: ContractAddress) {
            self.check_valid_host(get_caller_address());
            self.game_masters.write(user, true);
        }

        fn remove_game_master(ref self: ContractState, user: ContractAddress) {
            self.check_valid_host(get_caller_address());
            self.game_masters.write(user, false);
        }

        fn get_user_chain_count(self: @ContractState, user: ContractAddress) -> u32 {
            self.user_chain_count.read(user)
        }

        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u128 {
            self.user_balances.read(user)
        }

        fn setup_upgrade_config(ref self: ContractState, config: UpgradeSetupParams) {
            self.check_valid_game_master();
            self.upgrades.setup_upgrade(config);
        }

        fn setup_automation_config(ref self: ContractState, config: AutomationSetupParams) {
            self.check_valid_game_master();
            self.upgrades.setup_automation(config);
        }

        fn setup_transaction_config(ref self: ContractState, config: TransactionSetupParams) {
            self.check_valid_game_master();
            self.transactions.setup_transaction_config(config);
        }

        fn setup_prestige_config(ref self: ContractState, config: PrestigeSetupParams) {
            self.check_valid_game_master();
            self.prestige.setup_prestige(config);
        }
        // fn setup_staking_config(ref self: ContractState, config: StakingConfig) {
    //     self.check_valid_game_master();
    //     self.staking.setup_staking(config);
    // }
    }

    #[abi(embed_v0)]
    impl PowGameRewardsImpl of IPowGameRewards<ContractState> {
        fn set_reward_params(ref self: ContractState, reward_params: RewardParams) {
            self.check_valid_host(get_caller_address());
            self.reward_token_address.write(reward_params.reward_token_address);
            assert!(reward_params.reward_prestige_threshold > 0, "Prestige threshold must be > 0");
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

            let success: bool = IERC20Dispatcher {
                contract_address: self.reward_token_address.read(),
            }
                .transfer(recipient, self.reward_amount.read());

            assert!(success, "Reward transfer failed");
            self.emit(RewardClaimed { user: caller, recipient });
        }

        fn host_give_reward(
            ref self: ContractState, user: ContractAddress, recipient: ContractAddress,
        ) {
            self.check_valid_host(get_caller_address());
            let claimed = self.reward_claimed.read(user);
            assert!(!claimed, "Reward already claimed");

            self.reward_claimed.write(user, true);

            let success: bool = IERC20Dispatcher {
                contract_address: self.reward_token_address.read(),
            }
                .transfer(recipient, self.reward_amount.read());

            assert!(success, "Reward transfer failed");
            self.emit(RewardClaimed { user: user, recipient });
        }

        fn get_reward_params(self: @ContractState) -> RewardParams {
            RewardParams {
                reward_token_address: self.reward_token_address.read(),
                reward_amount: self.reward_amount.read(),
                reward_prestige_threshold: self.reward_prestige_threshold.read(),
            }
        }

        fn remove_funds(
            ref self: ContractState,
            token_address: ContractAddress,
            recipient: ContractAddress,
            value: u256,
        ) {
            let caller = get_caller_address();
            self.check_valid_host(caller);
            let success: bool = IERC20Dispatcher { contract_address: token_address }
                .transfer(recipient, value);

            assert!(success, "remove_funds failed");
        }

        fn pause_rewards(ref self: ContractState) {
            self.check_valid_host(get_caller_address());
            self.pausable.pause();
        }

        fn unpause_rewards(ref self: ContractState) {
            self.check_valid_host(get_caller_address());
            self.pausable.unpause();
        }
    }

    #[abi(embed_v0)]
    impl PowGameValidationImpl of IPowGameValidation<ContractState> {
        fn check_valid_chain_id(self: @ContractState, chain_id: u32) {
            let game_chain_count = self.game_chain_count.read();
            assert!(chain_id < game_chain_count, "Invalid chain id");
        }

        fn check_user_valid_chain(self: @ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let game_chain_count = self.user_chain_count.read(caller);
            assert!(chain_id < game_chain_count, "Chain not unlocked");
        }

        fn check_valid_host(self: @ContractState, user: ContractAddress) {
            assert!(self.hosts.read(user), "Invalid host");
        }

        fn check_valid_game_master(self: @ContractState) {
            assert!(self.game_masters.read(get_caller_address()), "Invalid game master");
        }

        fn check_block_not_full(self: @ContractState, chain_id: u32) {
            let caller = get_caller_address();
            let working_block = self.get_block_building_state(caller, chain_id);
            assert!(working_block.size < working_block.max_size, "Block is full");
        }
    }

    #[abi(embed_v0)]
    impl PowGameActionsImpl of IPowGameActions<ContractState> {
        fn init_my_game(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(self.user_chain_count.read(caller) == 0, "Account already initialized");
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
            let working_block = self.get_block_building_state(caller, chain_id);
            assert!(working_block.size >= working_block.max_size, "Block is not full");

            // Try Mining
            do_click_block(ref self, chain_id);
            let current_clicks = self.get_block_clicks(caller, chain_id);
            // Use the difficulty stored in the block at creation time
            let block_hp = working_block.difficulty;
            if current_clicks < block_hp {
                return;
            }

            // Finalize block
            let fees = working_block.fees;
            let reward = self.get_my_upgrade(chain_id, 'Block Reward');
            if (chain_id != 0) {
                // Add block to da & proof
                self.builder.build_proof(chain_id, reward);
                self.builder.build_da(chain_id, reward);
            }
            pay_user(ref self, caller, fees + reward);
            self.emit(BlockMined { user: caller, chain_id, fees, reward });

            // Set max_size and difficulty for the new block based on current upgrade level
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let max_size: u32 = (block_width * block_width).try_into().unwrap_or(16);
            let block_difficulty = self.get_my_upgrade(chain_id, 'Block Difficulty');
            self.builder.reset_block(chain_id, max_size, block_difficulty);
        }

        fn store_da(ref self: ContractState, chain_id: u32) {
            // Validation
            assert!(chain_id > 0, "DA not available on genesis chain");
            let caller = get_caller_address();
            let working_da = self.get_da_building_state(caller, chain_id);
            let da_max_size = working_da.max_size;
            assert!(working_da.size.into() >= da_max_size, "DA is not full");

            // Try Storing
            do_click_da(ref self, chain_id);
            let current_clicks = self.get_da_clicks(caller, chain_id);
            // Use the difficulty stored in the DA at creation time
            let da_hp = working_da.difficulty;
            if current_clicks < da_hp {
                return;
            }

            // Add DA to lower chain
            let total_fees = working_da.fees;
            pay_user(ref self, caller, total_fees);
            self.emit(DAStored { user: caller, chain_id, fees: total_fees });
            // Set max_size and difficulty for the new DA based on current upgrade level
            let da_size = self.get_my_upgrade(chain_id, 'DA compression');
            let da_max_size: u32 = da_size.try_into().unwrap_or(1);
            let da_difficulty = da_size; // DA uses same value for size and difficulty
            self.builder.reset_da(chain_id, da_max_size, da_difficulty);
        }

        fn prove(ref self: ContractState, chain_id: u32) {
            // Validation
            assert!(chain_id > 0, "Proving not available on genesis chain");
            let caller = get_caller_address();
            let working_proof = self.get_proof_building_state(caller, chain_id);
            let proof_max_size = working_proof.max_size;
            assert!(working_proof.size.into() >= proof_max_size, "Proof is not full");

            // Try Proving
            do_click_proof(ref self, chain_id);
            let current_clicks = self.get_proof_clicks(caller, chain_id);
            // Use the difficulty stored in the proof at creation time
            let proof_hp = working_proof.difficulty;
            if current_clicks < proof_hp {
                return;
            }

            // Add Proof to lower chain
            let total_fees = working_proof.fees;
            pay_user(ref self, caller, total_fees);
            self.emit(ProofStored { user: caller, chain_id, fees: total_fees });
            // Set max_size and difficulty for the new proof based on current upgrade level
            let proof_size = self.get_my_upgrade(chain_id, 'Recursive Proving');
            let proof_max_size: u32 = proof_size.try_into().unwrap_or(1);
            let proof_difficulty = proof_size; // Proof uses same value for size and difficulty
            self.builder.reset_proof(chain_id, proof_max_size, proof_difficulty);
        }
    }

    // #[abi(embed_v0)]
    // impl PowGameStakingActionsImpl of IPowGameStakingActions<ContractState> {
    //     fn stake_tokens(ref self: ContractState, amount: u128, now: u64) {
    //         let caller = get_caller_address();
    //         debit_user(ref self, caller, amount);
    //         self.staking.stake(caller, amount, now);
    //     }

    //     fn claim_staking_rewards(ref self: ContractState) {
    //         let caller = get_caller_address();
    //         let reward = self.staking.claim_rewards(caller);
    //         pay_user(ref self, caller, reward);
    //     }

    //     fn validate_stake(ref self: ContractState, now: u64) {
    //         let caller = get_caller_address();
    //         self.staking.validate(caller, now);
    //     }

    //     fn withdraw_staked_tokens(ref self: ContractState, now: u64) {
    //         let caller = get_caller_address();
    //         let withdrawal = self.staking.withdraw_stake(caller, now);
    //         pay_user(ref self, caller, withdrawal);
    //     }
    // }

    #[abi(embed_v0)]
    impl PowCheatCodesImpl of IPowCheatCodes<ContractState> {
        fn double_balance_cheat(ref self: ContractState) {
            assert!(self.cheat_codes_enabled.read(), "Cheat codes are disabled");

            let caller = get_caller_address();
            let current_balance = self.user_balances.read(caller);

            // Use pay_user to add current_balance (so new balance = current + current = double)
            pay_user(ref self, caller, current_balance);

            // Emit cheat code event
            self.emit(CheatCodeUsed { user: caller, cheat_type: 'double_balance' });
        }

        fn enable_cheat_codes(ref self: ContractState) {
            self.check_valid_game_master();
            self.cheat_codes_enabled.write(true);
        }

        fn disable_cheat_codes(ref self: ContractState) {
            self.check_valid_game_master();
            self.cheat_codes_enabled.write(false);
        }
    }

    #[abi(embed_v0)]
    impl PowStoreImpl of IPowStore<ContractState> {
        fn buy_tx_fee(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            let cost = self.get_next_tx_fee_cost(chain_id, tx_type_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.transactions.level_transaction_fee(chain_id, tx_type_id);
        }

        fn buy_tx_speed(ref self: ContractState, chain_id: u32, tx_type_id: u32) {
            let cost = self.get_next_tx_speed_cost(chain_id, tx_type_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.transactions.level_transaction_speed(chain_id, tx_type_id);
        }

        fn buy_upgrade(ref self: ContractState, chain_id: u32, upgrade_id: u32) {
            let cost = self.get_next_upgrade_cost(chain_id, upgrade_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.upgrades.level_upgrade(chain_id, upgrade_id);
        }

        fn buy_automation(ref self: ContractState, chain_id: u32, automation_id: u32) {
            let cost = self.get_next_automation_cost(chain_id, automation_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.upgrades.level_automation(chain_id, automation_id);
        }

        fn buy_dapps(ref self: ContractState, chain_id: u32) {
            let cost = self.dapps_unlock_cost.read(chain_id);
            let caller = get_caller_address();
            debit_user(ref self, caller, cost);
            self.transactions.unlock_dapps(chain_id);
        }

        fn buy_next_chain(ref self: ContractState) {
            let cost = self.next_chain_cost.read();
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
        self.builder.build_block(chain_id, total_fees);
        self.emit(TransactionAdded { user: caller, chain_id, tx_type_id, fees: total_fees });
    }

    fn do_click_block(ref self: ContractState, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        self.builder.click_block(chain_id);
    }

    fn do_click_da(ref self: ContractState, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        self.builder.click_da(chain_id);
    }

    fn do_click_proof(ref self: ContractState, chain_id: u32) {
        self.check_valid_chain_id(chain_id);
        self.check_user_valid_chain(chain_id);

        self.builder.click_proof(chain_id);
    }

    fn unlock_next_chain(ref self: ContractState) {
        let caller = get_caller_address();
        let new_chain_id = self.user_chain_count.read(caller);
        self.check_valid_chain_id(new_chain_id);
        self.user_chain_count.write(caller, new_chain_id + 1);
        self.transactions.check_has_all_txs(new_chain_id);
        // Finalize genesis block
        if (new_chain_id != 0) {
            // Add genesis block to da & proof
            self.builder.build_proof(new_chain_id, self.genesis_block_reward.read());
            self.builder.build_da(new_chain_id, self.genesis_block_reward.read());
        } else {
            pay_user(ref self, caller, self.genesis_block_reward.read());
        }
        // Set max_size and difficulty for the new chain's first block based on current upgrade
        // level
        let block_width = self.get_my_upgrade(new_chain_id, 'Block Size');
        let max_size: u32 = (block_width * block_width).try_into().unwrap_or(16);
        let block_difficulty = self.get_my_upgrade(new_chain_id, 'Block Difficulty');
        self.builder.reset_block(new_chain_id, max_size, block_difficulty);

        // Initialize DA and Proof for new chains (L2+)
        if (new_chain_id != 0) {
            // Set max_size and difficulty for initial DA based on current upgrade level
            let da_size = self.get_my_upgrade(new_chain_id, 'DA compression');
            let da_max_size: u32 = da_size.try_into().unwrap_or(1);
            let da_difficulty = da_size; // DA uses same value for size and difficulty
            self.builder.reset_da(new_chain_id, da_max_size, da_difficulty);

            // Set max_size and difficulty for initial proof based on current upgrade level
            let proof_size = self.get_my_upgrade(new_chain_id, 'Recursive Proving');
            let proof_max_size: u32 = proof_size.try_into().unwrap_or(1);
            let proof_difficulty = proof_size; // Proof uses same value for size and difficulty
            self.builder.reset_proof(new_chain_id, proof_max_size, proof_difficulty);
        }

        self.emit(ChainUnlocked { user: caller, chain_id: new_chain_id });
    }

    fn do_prestige(ref self: ContractState) {
        // Validation
        let caller = get_caller_address();
        let my_chain_count = self.user_chain_count.read(caller);
        assert!(my_chain_count >= self.game_chain_count.read(), "Not enough chains unlocked");
        // TODO: Check upgrades, txs, etc. levels

        self.prestige.prestige();

        // Reset user state
        self.user_chain_count.write(caller, 0);
        self.user_balances.write(caller, 0);
        let mut chain_id = 0;
        let game_chain_count = self.game_chain_count.read();
        while chain_id != game_chain_count {
            // Set max_size and difficulty for reset blocks based on current upgrade level
            let block_width = self.get_my_upgrade(chain_id, 'Block Size');
            let max_size: u32 = (block_width * block_width).try_into().unwrap_or(16);
            let block_difficulty = self.get_my_upgrade(chain_id, 'Block Difficulty');
            self.builder.reset_block(chain_id, max_size, block_difficulty);
            // Set max_size and difficulty for reset DA based on current upgrade level
            let da_size = self.get_my_upgrade(chain_id, 'DA compression');
            let da_max_size: u32 = da_size.try_into().unwrap_or(1);
            let da_difficulty = da_size; // DA uses same value for size and difficulty
            self.builder.reset_da(chain_id, da_max_size, da_difficulty);
            // Set max_size and difficulty for reset proof based on current upgrade level
            let proof_size = self.get_my_upgrade(chain_id, 'Recursive Proving');
            let proof_max_size: u32 = proof_size.try_into().unwrap_or(1);
            let proof_difficulty = proof_size; // Proof uses same value for size and difficulty
            self.builder.reset_proof(chain_id, proof_max_size, proof_difficulty);
            self.transactions.reset_tx_levels(chain_id);
            self.upgrades.reset_upgrade_levels(chain_id);
            chain_id += 1;
        }
    }
}
