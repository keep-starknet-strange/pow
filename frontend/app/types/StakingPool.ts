export type StakingPool = {
  stakedAmount: number;
  lastBlockUpdated:  number;
  rewardAccrued: number;
};

export const newStakingPool = (stakedAmount: number, lastBlockUpdated: number, rewardAccrued: number): StakingPool => ({
  stakedAmount,
  lastBlockUpdated,
  rewardAccrued, 
});
