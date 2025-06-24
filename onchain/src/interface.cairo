use starknet::ContractAddress;
use pow_game::types::RewardParams;
use pow_game::staking::{StakingConfig};

// Game configuration & state
#[starknet::interface]
pub trait IPowGame<TContractState> {
    fn get_genesis_block_reward(self: @TContractState) -> u128;
    fn set_genesis_block_reward(ref self: TContractState, reward: u128);
    fn get_max_chain_id(self: @TContractState) -> u32;
    fn set_max_chain_id(ref self: TContractState, chain_id: u32);
    fn add_game_master(ref self: TContractState, user: ContractAddress);
    fn remove_game_master(ref self: TContractState, user: ContractAddress);
    fn staking_config(self: @TContractState) -> StakingConfig;
    fn setup_staking_config(ref self: TContractState, user: ContractAddress, config: StakingConfig);

    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u128;
    fn get_user_staked_amount(self: @TContractState, user: ContractAddress) -> u128;
    fn get_user_reward_amount(self: @TContractState, user: ContractAddress) -> u128;
}

// Game Rewards management
#[starknet::interface]
pub trait IPowGameRewards<TContractState> {
    fn set_reward_params(ref self: TContractState, reward_params: RewardParams);
    fn claim_reward(ref self: TContractState, recipient: ContractAddress);
    fn get_reward_params(self: @TContractState) -> RewardParams;
    fn game_master_give_reward(ref self: TContractState, game_address: ContractAddress, recipient: ContractAddress);
    fn remove_funds(ref self: TContractState, token_address: ContractAddress, recipient: ContractAddress, value: u256);
    fn pause_rewards(ref self: TContractState);
    fn unpause_rewards(ref self: TContractState);
}

// Game asserts / check helper functions
#[starknet::interface]
pub trait IPowGameValidation<TContractState> {
    fn check_valid_chain_id(self: @TContractState, chain_id: u32);
    fn check_user_valid_chain(self: @TContractState, chain_id: u32);
    fn check_valid_game_master(self: @TContractState, user: ContractAddress);
    fn check_block_not_full(self: @TContractState, chain_id: u32);
}
