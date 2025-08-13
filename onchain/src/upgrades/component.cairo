#[starknet::component]
pub mod PowUpgradesComponent {
    use pow_game::upgrades::interface::{
        AutomationConfig, AutomationSetupParams, IPowUpgrades, UpgradeConfig, UpgradeSetupParams,
    };
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    pub struct Storage {
        // Maps: short upgrade name -> upgrade id
        upgrade_ids: Map<felt252, u32>,
        // Maps: (chain_id, upgrade id, level) -> upgrade config
        upgrades: Map<(u32, u32, u32), UpgradeConfig>,
        // Maps: (chain_id, upgrade id) -> max level
        max_upgrade_levels: Map<(u32, u32), u32>,
        // Maps: short automation name -> automation id
        automation_ids: Map<felt252, u32>,
        // Maps: (chain_id, automation id, level) -> automation config
        automations: Map<(u32, u32, u32), AutomationConfig>,
        // Maps: (chain_id, automation id) -> max level
        max_automation_levels: Map<(u32, u32), u32>,
        // Maps: (user address, chain id, upgrade id) -> upgrade level
        upgrade_levels: Map<(ContractAddress, u32, u32), u32>,
        // Maps: (user address, chain id, automation id) -> automation level
        automation_levels: Map<(ContractAddress, u32, u32), u32>,
    }

    #[derive(Drop, starknet::Event)]
    struct UpgradeConfigUpdated {
        #[key]
        chain_id: u32,
        #[key]
        upgrade_id: u32,
        new_config: UpgradeSetupParams,
    }

    #[derive(Drop, starknet::Event)]
    struct AutomationConfigUpdated {
        #[key]
        chain_id: u32,
        #[key]
        automation_id: u32,
        new_config: AutomationSetupParams,
    }

    #[derive(Drop, starknet::Event)]
    struct UpgradeLevelUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        #[key]
        upgrade_id: u32,
        old_level: u32,
        new_level: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct AutomationLevelUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        #[key]
        automation_id: u32,
        old_level: u32,
        new_level: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        UpgradeConfigUpdated: UpgradeConfigUpdated,
        AutomationConfigUpdated: AutomationConfigUpdated,
        UpgradeLevelUpdated: UpgradeLevelUpdated,
        AutomationLevelUpdated: AutomationLevelUpdated,
    }

    #[embeddable_as(PowUpgradesImpl)]
    impl PowUpgrades<
        TContractState, +HasComponent<TContractState>,
    > of IPowUpgrades<ComponentState<TContractState>> {
        fn get_upgrade_config(
            self: @ComponentState<TContractState>, chain_id: u32, upgrade_id: u32, level: u32,
        ) -> UpgradeConfig {
            self.upgrades.read((chain_id, upgrade_id, level))
        }

        fn get_automation_config(
            self: @ComponentState<TContractState>, chain_id: u32, automation_id: u32, level: u32,
        ) -> AutomationConfig {
            self.automations.read((chain_id, automation_id, level))
        }

        fn get_user_upgrade_level(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            upgrade_id: u32,
        ) -> u32 {
            self.upgrade_levels.read((user, chain_id, upgrade_id))
        }

        fn get_user_automation_level(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            automation_id: u32,
        ) -> u32 {
            self.automation_levels.read((user, chain_id, automation_id))
        }

        fn get_user_upgrade_levels(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            upgrade_count: u32,
        ) -> Span<u32> {
            let mut idx = 0;
            let mut levels = array![];
            while idx != upgrade_count {
                levels.append(self.upgrade_levels.read((user, chain_id, idx)));
                idx += 1;
            }
            levels.span()
        }

        fn get_user_automation_levels(
            self: @ComponentState<TContractState>,
            user: ContractAddress,
            chain_id: u32,
            automation_count: u32,
        ) -> Span<u32> {
            let mut idx = 0;
            let mut levels = array![];
            while idx != automation_count {
                levels.append(self.automation_levels.read((user, chain_id, idx)));
                idx += 1;
            }
            levels.span()
        }

        // TODO: If maxlevel
        fn get_next_upgrade_cost(
            self: @ComponentState<TContractState>, chain_id: u32, upgrade_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let next_level = self.upgrade_levels.read((caller, chain_id, upgrade_id)) + 1;
            self.upgrades.read((chain_id, upgrade_id, next_level)).cost
        }

        fn get_next_automation_cost(
            self: @ComponentState<TContractState>, chain_id: u32, automation_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let next_level = self.automation_levels.read((caller, chain_id, automation_id)) + 1;
            self.automations.read((chain_id, automation_id, next_level)).cost
        }

        fn get_my_upgrade_value(
            self: @ComponentState<TContractState>, chain_id: u32, upgrade_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let level = self.upgrade_levels.read((caller, chain_id, upgrade_id));
            self.upgrades.read((chain_id, upgrade_id, level)).value
        }

        fn get_my_upgrade(
            self: @ComponentState<TContractState>, chain_id: u32, upgrade_name: felt252,
        ) -> u128 {
            let caller = get_caller_address();
            let upgrade_id = self.upgrade_ids.read(upgrade_name);
            let level = self.upgrade_levels.read((caller, chain_id, upgrade_id));
            self.upgrades.read((chain_id, upgrade_id, level)).value
        }

        fn get_my_automation_value(
            self: @ComponentState<TContractState>, chain_id: u32, automation_id: u32,
        ) -> u128 {
            let caller = get_caller_address();
            let level = self.automation_levels.read((caller, chain_id, automation_id));
            self.automations.read((chain_id, automation_id, level)).value
        }

        fn get_my_automation(
            self: @ComponentState<TContractState>, chain_id: u32, automation_name: felt252,
        ) -> u128 {
            let caller = get_caller_address();
            let automation_id = self.automation_ids.read(automation_name);
            let level = self.automation_levels.read((caller, chain_id, automation_id));
            self.automations.read((chain_id, automation_id, level)).value
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        // TODO: Clear UpgradeConfig for values higher than params.costs.len()
        // TODO: Game master checks on all component setup functions
        fn setup_upgrade(ref self: ComponentState<TContractState>, params: UpgradeSetupParams) {
            let chain_id = params.chain_id;
            let upgrade_id = params.upgrade_id;
            let mut idx = 0;
            let maxLevel = params.levels.len();
            while idx != maxLevel {
                self.upgrades.write((chain_id, upgrade_id, idx), params.levels[idx].clone());
                idx += 1;
            }
            self.upgrade_ids.write(params.name, upgrade_id);
            self.max_upgrade_levels.write((chain_id, upgrade_id), maxLevel);
            self.emit(UpgradeConfigUpdated { chain_id, upgrade_id, new_config: params });
        }

        // TODO: Clear AutomationConfig for values higher than params.costs.len()
        fn setup_automation(
            ref self: ComponentState<TContractState>, params: AutomationSetupParams,
        ) {
            let chain_id = params.chain_id;
            let automation_id = params.automation_id;
            let mut idx = 0;
            let maxLevel = params.levels.len();
            while idx != maxLevel {
                self.automations.write((chain_id, automation_id, idx), params.levels[idx].clone());
                idx += 1;
            }
            self.automation_ids.write(params.name, automation_id);
            self.max_automation_levels.write((chain_id, automation_id), maxLevel);
            self.emit(AutomationConfigUpdated { chain_id, automation_id, new_config: params });
        }

        fn level_upgrade(ref self: ComponentState<TContractState>, chain_id: u32, upgrade_id: u32) {
            let caller = get_caller_address();
            let current_level = self.upgrade_levels.read((caller, chain_id, upgrade_id));
            let new_level = current_level + 1;
            self.upgrade_levels.write((caller, chain_id, upgrade_id), new_level);
            self
                .emit(
                    UpgradeLevelUpdated {
                        user: caller, chain_id, upgrade_id, old_level: current_level, new_level,
                    },
                );
        }

        fn level_automation(
            ref self: ComponentState<TContractState>, chain_id: u32, automation_id: u32,
        ) {
            let caller = get_caller_address();
            let current_level = self.automation_levels.read((caller, chain_id, automation_id));
            let new_level = current_level + 1;
            self.automation_levels.write((caller, chain_id, automation_id), new_level);
            self
                .emit(
                    AutomationLevelUpdated {
                        user: caller, chain_id, automation_id, old_level: current_level, new_level,
                    },
                );
        }

        fn reset_upgrade_levels(ref self: ComponentState<TContractState>, chain_id: u32) {
            let caller = get_caller_address();
            let mut idx = 0;
            let upgrades_count = 10; // TODO
            while idx != upgrades_count {
                self.upgrade_levels.write((caller, chain_id, idx), 0);
                idx += 1;
            }
            let mut idx = 0;
            let automations_count = 10; // TODO
            while idx != automations_count {
                self.automation_levels.write((caller, chain_id, idx), 0);
                idx += 1;
            };
        }
    }
}
