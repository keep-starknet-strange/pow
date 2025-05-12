use starknet::ContractAddress;

#[derive(Drop, starknet::Store, Serde, Clone)]
pub struct BuildingState {
    pub size: u32,
    pub fees: u128,
}

#[starknet::interface]
pub trait IBuilder<TContractState> {
    fn get_block_building_state(
        self: @TContractState, user: ContractAddress, chain_id: u32,
    ) -> BuildingState;
    fn get_da_building_state(
        self: @TContractState, user: ContractAddress, chain_id: u32,
    ) -> BuildingState;
    fn get_proof_building_state(
        self: @TContractState, user: ContractAddress, chain_id: u32,
    ) -> BuildingState;
    fn get_block_clicks(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;
    fn get_da_clicks(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;
    fn get_proof_clicks(self: @TContractState, user: ContractAddress, chain_id: u32) -> u128;

    fn build_block(ref self: TContractState, chain_id: u32, fees: u128);
    fn click_block(ref self: TContractState, chain_id: u32);
    fn reset_block(ref self: TContractState, chain_id: u32);

    fn build_da(ref self: TContractState, chain_id: u32, fees: u128);
    fn click_da(ref self: TContractState, chain_id: u32);
    fn reset_da(ref self: TContractState, chain_id: u32);

    fn build_proof(ref self: TContractState, chain_id: u32, fees: u128);
    fn click_proof(ref self: TContractState, chain_id: u32);
    fn reset_proof(ref self: TContractState, chain_id: u32);
}
