import { fetchWrapper, useMock } from './requests';
import { mockGameState } from './mock';
import { Block } from '../types/Block';
import { newEmptyTransaction } from '../types/Transaction';
import { GameState } from '../types/GameState';
import { hexToInt } from './utils';

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
    let fees = 0;
    // TODO: Filter out events for other chains w/ keys=3:<chainId>
    const feesRes = await fetchWrapper(
      `events/get-latest-with?eventId=4&keys=2:${address}`
    );
    if (feesRes && feesRes.data) {
      fees = hexToInt(feesRes.data.data[1]);
    }
    let hp = 0;
    // TODO: Filter out events for other chains w/ keys=3:<chainId>
    const hpRes = await fetchWrapper(
      `events/get-latest-with?eventId=5&keys=2:${address}`
    );
    if (hpRes && hpRes.data) {
      hp = hexToInt(hpRes.data.data[1]);
    }

    const currentBlock: Block = {
      id: blockId,
      reward: 5, // TODO
      fees: fees,
      hp: hp,
      transactions: [], // TODO
      maxSize: 8*8 // TODO
    };

    gameState.chains.push({
      id: chainId,
      lastBlock: lastBlock,
      currentBlock: currentBlock
    });
  }
  
  return gameState as GameState | null;
};
