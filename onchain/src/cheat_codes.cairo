use starknet::ContractAddress;

// Cheat Codes
#[starknet::interface]
pub trait IPowCheatCodes<TContractState> {
    fn double_balance_cheat(ref self: TContractState);
    fn enable_cheat_codes(ref self: TContractState);
    fn disable_cheat_codes(ref self: TContractState);
}

#[derive(Drop, starknet::Event)]
pub struct CheatCodeUsed {
    #[key]
    pub user: ContractAddress,
    pub cheat_type: felt252,
}
