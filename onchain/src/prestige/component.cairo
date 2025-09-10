#[starknet::component]
pub mod PrestigeComponent {
    use pow_game::prestige::interface::{IPrestige, PrestigeConfig, PrestigeSetupParams};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess
    };
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    pub struct Storage {
        // Configs
        max_prestige: u32,
        // Maps: prestige id -> prestige config
        prestiges: Map<u32, PrestigeConfig>,
        // Maps: user address -> prestige
        user_prestige: Map<ContractAddress, u32>,
    }

    #[derive(Drop, starknet::Event)]
    struct PrestigeConfigUpdated {
        new_config: PrestigeSetupParams,
    }

    #[derive(Drop, starknet::Event)]
    struct PrestigeUpdated {
        #[key]
        user: ContractAddress,
        prestige: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        PrestigeConfigUpdated: PrestigeConfigUpdated,
        PrestigeUpdated: PrestigeUpdated,
    }

    #[embeddable_as(PrestigeImpl)]
    impl Prestige<
        TContractState, +HasComponent<TContractState>,
    > of IPrestige<ComponentState<TContractState>> {
        fn get_prestige_config(
            self: @ComponentState<TContractState>, prestige_id: u32,
        ) -> PrestigeConfig {
            self.prestiges.read(prestige_id)
        }

        fn get_user_prestige(self: @ComponentState<TContractState>, user: ContractAddress) -> u32 {
            self.user_prestige.read(user)
        }

        fn get_next_prestige_cost(self: @ComponentState<TContractState>) -> u128 {
            let caller = get_caller_address();
            let next_prestige = self.user_prestige.read(caller) + 1;
            let max_prestige = self.max_prestige.read();
            assert!(next_prestige <= max_prestige, "Max prestige reached");
            self.prestiges.read(next_prestige).cost
        }

        fn get_my_prestige_scaler(self: @ComponentState<TContractState>) -> u128 {
            let caller = get_caller_address();
            let prestige = self.user_prestige.read(caller);
            self.prestiges.read(prestige).scaler
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn prestige(ref self: ComponentState<TContractState>) {
            let caller = get_caller_address();
            let prestige = self.user_prestige.read(caller);
            let max_prestige = self.max_prestige.read();
            
            // Enforce max prestige limit
            assert!(prestige < max_prestige, "Max prestige reached");
            
            self.user_prestige.write(caller, prestige + 1);
            self.emit(PrestigeUpdated { user: caller, prestige: prestige + 1 });
        }

        fn setup_prestige(ref self: ComponentState<TContractState>, params: PrestigeSetupParams) {
            let mut idx = 0;
            let max_prestige = params.costs.len();
            while idx != max_prestige {
                let prestige = PrestigeConfig {
                    cost: *params.costs[idx], scaler: *params.scalers[idx],
                };
                self.prestiges.write(idx, prestige);
                idx += 1;
            }
            self.max_prestige.write(max_prestige - 1);
            self.emit(PrestigeConfigUpdated { new_config: params });
        }
    }
}
