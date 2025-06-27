pub mod actions;
pub mod interface;
pub mod pow;
pub mod store;
pub mod types;

pub mod upgrades {
    pub mod component;
    pub mod interface;

    pub use interface::{IPowUpgradesDispatcher, IPowUpgradesDispatcherTrait, UpgradeConfig};
}

pub mod transactions {
    pub mod component;
    pub mod interface;

    pub use interface::{
        DA_TX_TYPE_ID, IPowTransactionsDispatcher, IPowTransactionsDispatcherTrait,
        PROOF_TX_TYPE_ID, TransactionFeeConfig, TransactionSpeedConfig,
    };
}

pub mod prestige {
    pub mod component;
    pub mod interface;

    pub use interface::{IPrestigeDispatcher, IPrestigeDispatcherTrait, PrestigeConfig};
}

pub mod builder {
    pub mod component;
    pub mod interface;

    pub use interface::{BuildingState, IBuilderDispatcher, IBuilderDispatcherTrait};
}

pub mod staking {
    pub mod component;
    pub mod interface;

    pub use interface::{IStakingDispatcher, IStakingDispatcherTrait, StakingConfig, SlashingConfig};
}
