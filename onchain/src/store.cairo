// Store
#[starknet::interface]
pub trait IPowStore<TContractState> {
    fn buy_tx_fee(ref self: TContractState, chain_id: u32, tx_type_id: u32);
    fn buy_tx_speed(ref self: TContractState, chain_id: u32, tx_type_id: u32);
    fn buy_upgrade(ref self: TContractState, chain_id: u32, upgrade_id: u32);
    fn buy_automation(ref self: TContractState, chain_id: u32, automation_id: u32);
    fn buy_dapps(ref self: TContractState, chain_id: u32);
    fn buy_next_chain(ref self: TContractState);
    fn buy_prestige(ref self: TContractState);
    fn buy_staking(ref self: TContractState);
}
