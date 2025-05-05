use starknet::ContractAddress;

#[derive(Drop, Serde, Clone, starknet::Store)]
pub struct TransactionFeeConfig {
  pub cost: u128,
  pub value: u128,
}

#[derive(Drop, Serde, Clone, starknet::Store)]
pub struct TransactionSpeedConfig {
  pub cost: u128,
  pub value: u128,
}

#[derive(Drop, Serde)]
pub struct TransactionSetupParams {
    pub chain_id: u32,
    pub tx_type_id: u32,
    pub fee_levels: Span<TransactionFeeConfig>,
    pub speed_levels: Span<TransactionSpeedConfig>,
}

#[starknet::interface]
pub trait IPowTransactions<TContractState> {
  // Game config
  fn get_transaction_fee_config(self: @TContractState, chain_id: u32, tx_type_id: u32, level: u32) -> TransactionFeeConfig;
  fn get_transaction_speed_config(self: @TContractState, chain_id: u32, tx_type_id: u32, level: u32) -> TransactionSpeedConfig;
  fn setup_transaction_config(ref self: TContractState, params: TransactionSetupParams);

  // User transactions
  fn get_user_transaction_fee_level(self: @TContractState, user: ContractAddress, chain_id: u32, tx_type_id: u32) -> u32;
  fn get_user_transaction_speed_level(self: @TContractState, user: ContractAddress, chain_id: u32, tx_type_id: u32) -> u32;
  fn level_transaction_fee(ref self: TContractState, chain_id: u32, tx_type_id: u32);
  fn level_transaction_speed(ref self: TContractState, chain_id: u32, tx_type_id: u32);

  // Use transactions
  fn get_next_tx_fee_cost(self: @TContractState, chain_id: u32, tx_type_id: u32) -> u128;
  fn get_next_tx_speed_cost(self: @TContractState, chain_id: u32, tx_type_id: u32) -> u128;
  fn get_my_tx_fee_value(self: @TContractState, chain_id: u32, tx_type_id: u32) -> u128;
  fn get_my_tx_speed_value(self: @TContractState, chain_id: u32, tx_type_id: u32) -> u128;
}
