use starknet::ContractAddress;

#[derive(Drop, starknet::Store, Serde, Clone)]
pub struct PrestigeConfig {
    pub cost: u128,
    pub scaler: u128,
}

#[derive(Drop, Serde)]
pub struct PrestigeSetupParams {
  pub costs: Span<u128>,
  pub scalers: Span<u128>,
}

#[starknet::interface]
pub trait IPrestige<TContractState> {
  // Game config
  fn get_prestige_config(self: @TContractState, prestige_id: u32) -> PrestigeConfig;
  fn setup_prestige(ref self: TContractState, params: PrestigeSetupParams);

  // User prestige
  fn get_user_prestige(self: @TContractState, user: ContractAddress) -> u32;
  fn prestige(ref self: TContractState);

  fn get_next_prestige_cost(self: @TContractState) -> u128;
  fn get_my_prestige_scaler(self: @TContractState) -> u128;
}
