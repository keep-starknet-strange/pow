use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
pub struct RewardParams {
    pub reward_token_address: ContractAddress,
    pub reward_amount: u256,
    pub reward_prestige_threshold: u32,
}
