export type StakingPool = {
  stakedAmount: number;
  startBlock:  number;
  rewardAccrued: number;
};

export const newStakingPool = (stakedAmount: number, startBlock: number, rewardAccrued: number): StakingPool => ({
  stakedAmount,
  startBlock,
  rewardAccrued, 
});
