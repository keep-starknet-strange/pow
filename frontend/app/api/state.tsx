import { fetchWrapper, useMock } from './requests';
import { mockGameState } from './mock';
import { Block } from '../types/Block';
import { newEmptyTransaction } from '../types/Transaction';
import { GameState } from '../types/GameState';
import { hexToInt } from './utils';
// temoporary import
import contractResponse from './contracts.json';

export const getGameState = async (address: string): Promise<GameState | null> => {
  
  if (useMock) return mockGameState;
  // TODO: Get all chains ( and/or pagination? )
  const chainIds = [0];
  // TODO: Use contract.json for event ids
  let balance = 0;
  const balanceRes = await fetchWrapper(
    `events/get-latest-with?eventId=1&keys=2:${address}`
  );
  if (balanceRes && balanceRes.data) {
    balance = hexToInt(balanceRes.data.data[1]);
  }
  let gameState: GameState = {
    balance: balance,
    chains: []
  }
  for (const chainId of chainIds) {
    // TODO: Filter out events for other chains w/ keys=3:<chainId>
    let lastBlock: Block | null = null;
    const lastBlockRes = await fetchWrapper(
      `events/get-latest-with?eventId=3&keys=2:${address}`
    );
    if (lastBlockRes && lastBlockRes.data) {
      const lastBlockNumber = hexToInt(lastBlockRes.data.data[0]);
      const lastBlockSize = hexToInt(lastBlockRes.data.data[1]);
      const _lastBlockDifficulty = hexToInt(lastBlockRes.data.data[2]);
      const lastBlockReward = hexToInt(lastBlockRes.data.data[3]);
      lastBlock = {
        id: lastBlockNumber,
        reward: lastBlockReward,
        fees: 0,
        hp: 0,
        transactions: Array(lastBlockSize).fill(newEmptyTransaction()),
        maxSize: lastBlockSize,
      };
    }

    const blockId = lastBlock ? lastBlock.id + 1 : 0;

    // TODO: use actual api response
    // TODO: Filter out events for other chains w/ keys=3:<chainId>
    const contractInfo = await contractResponse
    const eventList = contractInfo[0]?.events || [];
    const events = Object.fromEntries(await Promise.all(eventList.map(async (e) => {
      const response = await fetchWrapper(
        `events/get-latest-with?eventId=${e.id}&keys=2:${address}`
      );
      const value = response && response.data ? hexToInt(response.data.data[1]) : 0;
      return [e.name, value];
    })));

    const currentBlock: Block = {
      id: blockId,
      transactions: [], // TODO: Get transactions
      reward: events.UserBlockRewardUpdated,
      fees: events.UserBlockFeeUpdated,
      hp: events.UserBlockHpUpdated,
      maxSize: events.UserBlockSizeUpdated,
    };

    // TODO: Only get last 10 blocks?
    const pastBlocks = lastBlock ? [lastBlock, ...Array(lastBlock.id - 1).fill(lastBlock)] : [];

    gameState.chains.push({
      id: chainId,
      lastBlock: lastBlock,
      currentBlock: currentBlock,
      pastBlocks: pastBlocks
    });
  }
  
  return gameState as GameState | null;
};
