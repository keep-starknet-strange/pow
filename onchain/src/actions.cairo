use starknet::ContractAddress;

// Player actions
#[starknet::interface]
pub trait IPowGameActions<TContractState> {
    fn init_my_game(ref self: TContractState);
    fn add_transaction(ref self: TContractState, chain_id: u32, tx_type_id: u32);
    fn add_transaction_bundled(ref self: TContractState, chain_id: u32, tx_type_ids: Span<u32>);
    fn mine_block(ref self: TContractState, chain_id: u32);
    fn mine_block_bundled(ref self: TContractState, chain_id: u32, clicks: u32);
    fn store_da(ref self: TContractState, chain_id: u32);
    fn prove(ref self: TContractState, chain_id: u32);
}

#[starknet::interface]
pub trait IPowGameStakingActions<TContractState> {
    fn stake_tokens(ref self: TContractState, amount: u128, now: u64);
    fn claim_staking_rewards(ref self: TContractState);
    fn validate_stake(ref self: TContractState, now: u64);
    fn withdraw_staked_tokens(ref self: TContractState, now: u64);
}

#[derive(Drop, starknet::Event)]
pub struct TransactionAdded {
    #[key]
    pub user: ContractAddress,
    #[key]
    pub chain_id: u32,
    #[key]
    pub tx_type_id: u32,
    pub fees: u128,
}

#[derive(Drop, starknet::Event)]
pub struct TransactionsAdded {
    #[key]
    pub user: ContractAddress,
    #[key]
    pub chain_id: u32,
    pub tx_type_ids: Span<u32>,
    pub fees: u128,
}

#[derive(Drop, starknet::Event)]
pub struct BlockMined {
    #[key]
    pub user: ContractAddress,
    #[key]
    pub chain_id: u32,
    pub fees: u128,
    pub reward: u128,
}

#[derive(Drop, starknet::Event)]
pub struct DAStored {
    #[key]
    pub user: ContractAddress,
    #[key]
    pub chain_id: u32,
    pub fees: u128,
}

#[derive(Drop, starknet::Event)]
pub struct ProofStored {
    #[key]
    pub user: ContractAddress,
    #[key]
    pub chain_id: u32,
    pub fees: u128,
}
