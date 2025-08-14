#[starknet::component]
pub mod BuilderComponent {
    use pow_game::builder::interface::{BuildingState, IBuilder};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    pub struct Storage {
        // Maps: (user address, chain id) -> in progress block height
        building_block_height: Map<(ContractAddress, u32), u64>,
        // Maps: (user address, chain id) -> in progress block
        building_blocks: Map<(ContractAddress, u32), BuildingState>,
        // Maps: (user address, chain id) -> click counter
        block_clicks: Map<(ContractAddress, u32), u128>,
        // Maps: (user address, chain id) -> in progress da
        building_da: Map<(ContractAddress, u32), BuildingState>,
        // Maps: (user address, chain id) -> click counter
        da_clicks: Map<(ContractAddress, u32), u128>,
        // Maps: (user address, chain id) -> in progress proof
        building_proof: Map<(ContractAddress, u32), BuildingState>,
        // Maps: (user address, chain id) -> click counter
        proof_clicks: Map<(ContractAddress, u32), u128>,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingBlockUpdate {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        new_block: BuildingState,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingBlockClicked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        click_count: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingDaUpdate {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        new_da: BuildingState,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingDaClicked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        click_count: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingProofUpdate {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        new_proof: BuildingState,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingProofClicked {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u32,
        click_count: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        BuildingBlockUpdate: BuildingBlockUpdate,
        BuildingBlockClicked: BuildingBlockClicked,
        BuildingDaUpdate: BuildingDaUpdate,
        BuildingDaClicked: BuildingDaClicked,
        BuildingProofUpdate: BuildingProofUpdate,
        BuildingProofClicked: BuildingProofClicked,
    }

    #[embeddable_as(BuilderImpl)]
    impl Builder<
        TContractState, +HasComponent<TContractState>,
    > of IBuilder<ComponentState<TContractState>> {
        fn get_block_building_height(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> u64 {
            self.building_block_height.read((user, chain_id))
        }

        fn get_block_building_state(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> BuildingState {
            self.building_blocks.read((user, chain_id))
        }

        fn get_da_building_state(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> BuildingState {
            self.building_da.read((user, chain_id))
        }

        fn get_proof_building_state(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> BuildingState {
            self.building_proof.read((user, chain_id))
        }

        fn get_block_clicks(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> u128 {
            self.block_clicks.read((user, chain_id))
        }

        fn get_da_clicks(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> u128 {
            self.da_clicks.read((user, chain_id))
        }

        fn get_proof_clicks(
            self: @ComponentState<TContractState>, user: ContractAddress, chain_id: u32,
        ) -> u128 {
            self.proof_clicks.read((user, chain_id))
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn build_block(ref self: ComponentState<TContractState>, chain_id: u32, fees: u128) {
            let user = get_caller_address();
            let mut block = self.building_blocks.read((user, chain_id));
            block.fees += fees;
            block.size += 1;
            self.building_blocks.write((user, chain_id), block.clone());
            self.emit(BuildingBlockUpdate { user, chain_id, new_block: block });
        }

        fn click_block(ref self: ComponentState<TContractState>, chain_id: u32) {
            let user = get_caller_address();
            let mut clicks = self.block_clicks.read((user, chain_id));
            clicks += 1;
            self.block_clicks.write((user, chain_id), clicks);
            self.emit(BuildingBlockClicked { user, chain_id, click_count: clicks });
        }

        fn reset_block(ref self: ComponentState<TContractState>, chain_id: u32, max_size: u32, difficulty: u128) {
            let user = get_caller_address();
            let empty_block = BuildingState { fees: 0, size: 0, max_size, difficulty };
            self.building_blocks.write((user, chain_id), empty_block.clone());
            self.emit(BuildingBlockUpdate { user, chain_id, new_block: empty_block });
            self.block_clicks.write((user, chain_id), 0);
            self.emit(BuildingBlockClicked { user, chain_id, click_count: 0 });
            let last_height = self.building_block_height.read((user, chain_id));
            self.building_block_height.write((user, chain_id), last_height + 1);
        }

        fn build_da(ref self: ComponentState<TContractState>, chain_id: u32, fees: u128) {
            let user = get_caller_address();
            let mut da = self.building_da.read((user, chain_id));
            da.fees += fees;
            da.size += 1;
            self.building_da.write((user, chain_id), da.clone());
            self.emit(BuildingDaUpdate { user, chain_id, new_da: da });
        }

        fn click_da(ref self: ComponentState<TContractState>, chain_id: u32) {
            let user = get_caller_address();
            let mut clicks = self.da_clicks.read((user, chain_id));
            clicks += 1;
            self.da_clicks.write((user, chain_id), clicks);
            self.emit(BuildingDaClicked { user, chain_id, click_count: clicks });
        }

        fn reset_da(ref self: ComponentState<TContractState>, chain_id: u32, max_size: u32, difficulty: u128) {
            let user = get_caller_address();
            let empty_da = BuildingState { fees: 0, size: 0, max_size, difficulty };
            self.building_da.write((user, chain_id), empty_da.clone());
            self.emit(BuildingDaUpdate { user, chain_id, new_da: empty_da });
            self.da_clicks.write((user, chain_id), 0);
            self.emit(BuildingDaClicked { user, chain_id, click_count: 0 });
        }

        fn build_proof(ref self: ComponentState<TContractState>, chain_id: u32, fees: u128) {
            let user = get_caller_address();
            let mut proof = self.building_proof.read((user, chain_id));
            proof.fees += fees;
            proof.size += 1;
            self.building_proof.write((user, chain_id), proof.clone());
            self.emit(BuildingProofUpdate { user, chain_id, new_proof: proof });
        }

        fn click_proof(ref self: ComponentState<TContractState>, chain_id: u32) {
            let user = get_caller_address();
            let mut clicks = self.proof_clicks.read((user, chain_id));
            clicks += 1;
            self.proof_clicks.write((user, chain_id), clicks);
            self.emit(BuildingProofClicked { user, chain_id, click_count: clicks });
        }

        fn reset_proof(ref self: ComponentState<TContractState>, chain_id: u32, max_size: u32, difficulty: u128) {
            let user = get_caller_address();
            let empty_proof = BuildingState { fees: 0, size: 0, max_size, difficulty };
            self.building_proof.write((user, chain_id), empty_proof.clone());
            self.emit(BuildingProofUpdate { user, chain_id, new_proof: empty_proof });
            self.proof_clicks.write((user, chain_id), 0);
            self.emit(BuildingProofClicked { user, chain_id, click_count: 0 });
        }
    }
}
