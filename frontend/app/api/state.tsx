import { fetchWrapper, useMock } from "./requests";
import { mockGameState } from "./mock";
import { Block } from "../types/Block";
import { newEmptyTransaction } from "../utils/transactions";
import { GameState } from "../types/GameState";
import { hexToInt, getEventValue } from "./utils";
// temoporary import
import contractResponse from "./contracts.json";

export const getGameState = async (
  address: string,
): Promise<GameState | null> => {
  if (useMock) return mockGameState;
  // TODO: Get all chains ( and/or pagination? )
  const chainIds = [0];

  // TODO: use actual api response
  // TODO: Filter out events for other chains w/ keys=3:<chainId>
  const contractInfo = await contractResponse;
  const eventList = contractInfo[0]?.events || [];
  const events = Object.fromEntries(
    await Promise.all(
      eventList.map(async (e) => {
        const response = await fetchWrapper(
          `events/get-latest-with?eventId=${e.id}&keys=2:${address}`,
        );
        return [e.name, response];
      }),
    ),
  );

  const gameState: GameState = {
    balance: getEventValue(events.UserBalanceUpdated, 0, 1),
    chains: [],
  };
  for (const chainId of chainIds) {
    // TODO: Filter out events for other chains w/ keys=3:<chainId>
    let lastBlock: Block | null = null;
    const lastBlockRes = events.UserLastBlockUpdated;
    if (lastBlockRes && lastBlockRes.data) {
      const [id = 0, size = 0, _difficulty = 0, reward = 0] =
        lastBlockRes.data.data.map(hexToInt);
      lastBlock = {
        id,
        reward,
        fees: 0,
        hp: 0,
        transactions: Array(size).fill(newEmptyTransaction()),
        maxSize: size,
      };
    }

    const blockId = lastBlock ? lastBlock.id + 1 : 0;

    const fees = getEventValue(events.UserBlockFeeUpdated);
    const reward = getEventValue(events.UserBlockRewardUpdated);
    const hp = getEventValue(events.UserBlockHpUpdated);
    const maxSize = getEventValue(events.UserBlockSizeUpdated);

    const currentBlock: Block = {
      id: blockId,
      transactions: [], // TODO: Get transactions
      reward,
      fees,
      hp,
      maxSize,
    };

    // TODO: Only get last 10 blocks?
    const pastBlocks = lastBlock
      ? [lastBlock, ...Array(lastBlock.id - 1).fill(lastBlock)]
      : [];

    gameState.chains.push({
      id: chainId,
      lastBlock,
      currentBlock,
      pastBlocks,
    });
  }

  return gameState as GameState | null;
};
