use starknet::ContractAddress;

#[derive(Drop, Serde, Clone, starknet::Store)]
pub struct UpgradeConfig {
  pub cost: u128,
  pub value: u128,
}

#[derive(Drop, Serde)]
pub struct UpgradeSetupParams {
    pub chain_id: u32,
    pub upgrade_id: u32,
    pub levels: Span<UpgradeConfig>,
}

#[derive(Drop, Serde, Clone, starknet::Store)]
pub struct AutomationConfig {
    pub cost: u128,
    pub value: u128,
}

#[derive(Drop, Serde)]
pub struct AutomationSetupParams {
    pub chain_id: u32,
    pub automation_id: u32,
    pub levels: Span<AutomationConfig>,
}

#[starknet::interface]
pub trait IPowUpgrades<TContractState> {
  // Game config
  fn get_upgrade_config(self: @TContractState, chain_id: u32, upgrade_id: u32, level: u32) -> UpgradeConfig;
  fn get_automation_config(self: @TContractState, chain_id: u32, automation_id: u32, level: u32) -> AutomationConfig;
  fn setup_upgrade(ref self: TContractState, params: UpgradeSetupParams);
  fn setup_automation(ref self: TContractState, params: AutomationSetupParams);

  // User upgrades
  fn get_user_upgrade_level(self: @TContractState, user: ContractAddress, chain_id: u32, upgrade_id: u32) -> u32;
  fn get_user_automation_level(self: @TContractState, user: ContractAddress, chain_id: u32, automation_id: u32) -> u32;
  fn level_upgrade(ref self: TContractState, chain_id: u32, upgrade_id: u32);
  fn level_automation(ref self: TContractState, chain_id: u32, automation_id: u32);

  // Use upgrades
  fn get_next_upgrade_cost(self: @TContractState, chain_id: u32, upgrade_id: u32) -> u128;
  fn get_next_automation_cost(self: @TContractState, chain_id: u32, automation_id: u32) -> u128;
  fn get_my_upgrade_value(self: @TContractState, chain_id: u32, upgrade_id: u32) -> u128;
  fn get_my_automation_value(self: @TContractState, chain_id: u32, automation_id: u32) -> u128;
}
