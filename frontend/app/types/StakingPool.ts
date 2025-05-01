export type StakingPool = {
  chainId: number;
  stakedAmount: number;
  lastBlockUpdated:  number;
  rewardAccrued: number;
  icon?: string;
};

export const newStakingPool = (chainId: number, stakedAmount: number, lastBlockUpdated: number, rewardAccrued: number): StakingPool => ({
  chainId,
  stakedAmount,
  lastBlockUpdated,
  rewardAccrued, 
});
