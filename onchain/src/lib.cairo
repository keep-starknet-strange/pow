pub mod actions;
pub mod interface;
pub mod pow;
pub mod store;
pub mod types;

pub mod upgrades {
    pub mod component;
    pub mod interface;

    pub use interface::{
        AutomationSetupParams, IPowUpgradesDispatcher, IPowUpgradesDispatcherTrait, UpgradeConfig,
        UpgradeSetupParams,
    };
}

pub mod transactions {
    pub mod component;
    pub mod interface;

    pub use interface::{
        IPowTransactionsDispatcher, IPowTransactionsDispatcherTrait,
        TransactionFeeConfig, TransactionSetupParams, TransactionSpeedConfig,
    };
}

pub mod prestige {
    pub mod component;
    pub mod interface;

    pub use interface::{
        IPrestigeDispatcher, IPrestigeDispatcherTrait, PrestigeConfig, PrestigeSetupParams,
    };
}

pub mod builder {
    pub mod component;
    pub mod interface;

    pub use interface::{BuildingState, IBuilderDispatcher, IBuilderDispatcherTrait};
}

pub mod staking {
    pub mod component;
    pub mod interface;

    pub use interface::{IStakingDispatcher, IStakingDispatcherTrait, SlashingConfig, StakingConfig};
}
