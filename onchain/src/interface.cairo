use pow_game::prestige::PrestigeSetupParams;
use pow_game::transactions::TransactionSetupParams;
use pow_game::types::RewardParams;
use pow_game::upgrades::{AutomationSetupParams, UpgradeSetupParams};
use starknet::ContractAddress;

// Game configuration & state
#[starknet::interface]
pub trait IPowGame<TContractState> {
    fn get_genesis_block_reward(self: @TContractState) -> u128;
    fn set_genesis_block_reward(ref self: TContractState, reward: u128);
    fn get_game_chain_count(self: @TContractState) -> u32;
    fn set_game_chain_count(ref self: TContractState, chain_id: u32);
    fn get_next_chain_cost(self: @TContractState) -> u128;
    fn set_next_chain_cost(ref self: TContractState, cost: u128);
    fn get_dapps_unlock_cost(self: @TContractState, chain_id: u32) -> u128;
    fn set_dapps_unlock_cost(ref self: TContractState, chain_id: u32, cost: u128);
    fn add_host(ref self: TContractState, user: ContractAddress);
    fn remove_host(ref self: TContractState, user: ContractAddress);
    fn add_game_master(ref self: TContractState, user: ContractAddress);
    fn remove_game_master(ref self: TContractState, user: ContractAddress);
    fn get_user_chain_count(self: @TContractState, user: ContractAddress) -> u32;
    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u128;

    fn setup_upgrade_config(ref self: TContractState, config: UpgradeSetupParams);
    fn setup_automation_config(ref self: TContractState, config: AutomationSetupParams);
    fn setup_transaction_config(ref self: TContractState, config: TransactionSetupParams);
    fn setup_prestige_config(ref self: TContractState, config: PrestigeSetupParams);
    // fn setup_staking_config(ref self: TContractState, config: StakingConfig);
}

// Game Rewards management
#[starknet::interface]
pub trait IPowGameRewards<TContractState> {
    fn set_reward_params(ref self: TContractState, reward_params: RewardParams);
    fn claim_reward(ref self: TContractState, recipient: ContractAddress);
    fn get_reward_params(self: @TContractState) -> RewardParams;
    fn has_claimed_reward(self: @TContractState, user: ContractAddress) -> bool;
    fn host_give_reward(
        ref self: TContractState, user: ContractAddress, recipient: ContractAddress,
    );
    fn remove_funds(
        ref self: TContractState,
        token_address: ContractAddress,
        recipient: ContractAddress,
        value: u256,
    );
    fn pause_rewards(ref self: TContractState);
    fn unpause_rewards(ref self: TContractState);
}

// Game asserts / check helper functions
#[starknet::interface]
pub trait IPowGameValidation<TContractState> {
    fn check_valid_chain_id(self: @TContractState, chain_id: u32);
    fn check_user_valid_chain(self: @TContractState, chain_id: u32);
    fn check_valid_host(self: @TContractState, user: ContractAddress);
    fn check_valid_game_master(self: @TContractState);
    fn check_block_not_full(self: @TContractState, chain_id: u32);
}
