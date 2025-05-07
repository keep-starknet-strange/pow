pub mod pow;

pub mod upgrades {
    pub mod component;
    pub mod interface;

    pub use interface::{IPowUpgradesDispatcher, IPowUpgradesDispatcherTrait, UpgradeConfig};
}

pub mod transactions {
    pub mod component;
    pub mod interface;

    pub use interface::{
        IPowTransactionsDispatcher, IPowTransactionsDispatcherTrait, TransactionFeeConfig,
        TransactionSpeedConfig,
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
