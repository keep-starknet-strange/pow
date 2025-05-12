use starknet::ContractAddress;

// Game configuration & state
#[starknet::interface]
pub trait IPowGame<TContractState> {
    fn get_genesis_block_reward(self: @TContractState) -> u128;
    fn set_genesis_block_reward(ref self: TContractState, reward: u128);
    fn get_max_chain_id(self: @TContractState) -> u32;
    fn set_max_chain_id(ref self: TContractState, chain_id: u32);
    fn add_game_master(ref self: TContractState, user: ContractAddress);
    fn remove_game_master(ref self: TContractState, user: ContractAddress);

    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u128;
}

// Game asserts / check helper functions
#[starknet::interface]
pub trait IPowGameValidation<TContractState> {
    fn check_valid_chain_id(self: @TContractState, chain_id: u32);
    fn check_user_valid_chain(self: @TContractState, chain_id: u32);
    fn check_valid_game_master(self: @TContractState, user: ContractAddress);
    fn check_block_not_full(self: @TContractState, chain_id: u32);
}
