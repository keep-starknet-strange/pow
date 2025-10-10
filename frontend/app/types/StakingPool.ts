export type StakingPool = {
  createdAt: number;
  stakedAmount: number;
  lastBlockUpdated: number;
  rewardAccrued: number;
  icon?: string;
};

export const newStakingPool = (
  stakedAmount: number,
  rewardAccrued: number,
): StakingPool => ({
  createdAt: Math.floor(Date.now() / 1000), // current second
  stakedAmount,
  lastBlockUpdated: Math.floor(Date.now() / 1000),
  rewardAccrued,
});
