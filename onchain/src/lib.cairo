pub mod pow;

pub mod upgrades {
  pub mod interface;
  pub mod component;

  pub use interface::{
    UpgradeConfig, IPowUpgradesDispatcher, IPowUpgradesDispatcherTrait
  };
}

pub mod transactions {
  pub mod interface;
  pub mod component;

  pub use interface::{
    TransactionFeeConfig, TransactionSpeedConfig, IPowTransactionsDispatcher, IPowTransactionsDispatcherTrait
  };
}

pub mod prestige {
  pub mod interface;
  pub mod component;

  pub use interface::{
    PrestigeConfig, IPrestigeDispatcher, IPrestigeDispatcherTrait
  };
}
