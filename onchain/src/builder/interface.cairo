use starknet::ContractAddress;

#[derive(Drop, starknet::Store, Serde, Clone)]
pub struct BuildingState {
    pub size: u32,
    pub fees: u128,
    pub max_size: u32, // Static block capacity set when block is created
    pub difficulty: u128 // Static difficulty set when block is created
}

#[starknet::interface]
pub trait IBuilder<TContractState> {
    fn get_block_building_height(
        self: @TContractState, user: ContractAddress, chain_id: u32,
    ) -> u64;
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
}
