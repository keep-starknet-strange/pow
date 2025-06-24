use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct StakingConfig {
    pub min_stake: u128,
    pub reward_rate: u128,
    pub slashing_config: SlashingConfig,
}


#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct SlashingConfig {
    pub slash_fraction: u128, 
    pub due_time: u64, // Time in seconds after which slashing occurs
}

#[starknet::interface]
pub trait IStaking<TContractState> {
    fn get_staking_config(self: @TContractState) -> StakingConfig;
    fn setup_staking(ref self: TContractState, user: ContractAddress, config: StakingConfig);
    fn stake(ref self: TContractState, user: ContractAddress, amount: u128);
    fn claim_rewards(ref self: TContractState, user: ContractAddress) -> u128;
    fn validate(ref self: TContractState, user: ContractAddress);
    fn withdraw_stake(ref self: TContractState, user: ContractAddress) -> u128;
    fn get_staked_amount(self: @TContractState, user: ContractAddress) -> u128;
    fn get_reward_amount(self: @TContractState, user: ContractAddress) -> u128;
}
