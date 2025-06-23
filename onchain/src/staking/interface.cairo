use starknet::ContractAddress;

#[derive(Drop, starknet::Store, Serde, Clone)]
pub struct StakingConfig {
    pub min_stake: u128,
    pub reward_rate: u128,
    pub slashing_config: SlashingConfig,
}


#[derive(Drop, starknet::Store, Serde, Clone)]
pub struct SlashingConfig {
    pub slash_percentage: u32, // Percentage of stake
    pub due_time: u32, // Time in seconds after which slashing occurs
    pub chance: u32, // Probability of slashing occurring
}

#[starknet::interface]
pub trait IStaking<TContractState> {
    fn stake_tokens(ref self: TContractState, amount: u128);
    fn claim_rewards(ref self: TContractState);
    fn validate(ref self: TContractState);
    fn get_staked_amount(self: @TContractState, user: ContractAddress) -> u128;
    fn get_reward_amount(self: @TContractState, user: ContractAddress) -> u128;
}