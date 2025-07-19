import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { Chain, newChain, Block } from "../types/Chains";

interface ChainsState {
  chains: Chain[];

  resetChains: () => void;
  initializeChains: (powContract: Contract | null, user: FocAccount | null,
               getUserMaxChainId: () => Promise<number | undefined>,
               getUserBlockNumber: (chainId: number) => Promise<number | undefined>) => void;
  getChain: (chainId: number) => Chain | undefined;
  addChain: () => void;
  getBlock: (chainId: number, blockNumber: number) => Block | undefined;
  getLatestBlock: (chainId: number) => Block | undefined;
  addBlock: (chainId: number, block: Block) => void;
}

export const useChainsStore = create<ChainsState>((set, get) => ({
  chains: [],

  resetChains: () => set({ chains: [newChain(0)] }),

  initializeChains: (powContract, user, getUserMaxChainId, getUserBlockNumber) => {
    const fetchChainState = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const maxChainId = (await getUserMaxChainId()) || 0;
          // Setup l1 state
          const blockNumber = (await getUserBlockNumber(0)) || 0;
          // TODO: Get block size?
          const chain = newChain(0);
          if (blockNumber > 0) {
            chain.blocks.push({
              blockId: blockNumber - 1,
              fees: 0,
              transactions: Array.from({ length: 25 }, (_, i) => ({
                typeId: 0,
                fee: 0,
                isDapp: false,
              })),
              isBuilt: true,
            });
          }
          if (maxChainId > 1) {
            const l2Chain = newChain(1);
            const l2BlockNumber = (await getUserBlockNumber(1)) || 0;
            if (l2BlockNumber > 0) {
              l2Chain.blocks.push({
                blockId: l2BlockNumber - 1,
                fees: 0,
                transactions: Array.from({ length: 25 }, (_, i) => ({
                  typeId: 0,
                  fee: 0,
                  isDapp: false,
                })),
                isBuilt: true,
              });
            }
            set(() => ({
              chains: [chain, l2Chain],
            }));
          } else {
            set(() => ({
              chains: [chain],
            }));
          }
        } catch (error) {
          console.error("Error fetching chain state:", error);
          set(() => ({
            chains: [newChain(0)],
          }));
        }
      } else {
        set(() => ({
          chains: [newChain(0)],
        }));
      }
    };
    fetchChainState();
  },

  getChain: (chainId) => get().chains[chainId],

  addChain: () => {
    set((state) => {
      const newChainId = get().chains.length;
      const newChainData = newChain(newChainId);
      return {
        chains: [...state.chains, newChainData],
      };
    });
  },

  getBlock: (chainId, blockNumber) => {
    const chain = get().getChain(chainId);
    return chain?.blocks.find((block) => block.blockId === blockNumber);
  },

  getLatestBlock: (chainId) => {
    const chain = get().getChain(chainId);
    return chain?.blocks[chain.blocks.length - 1];
  },

  addBlock: (chainId, block) => {
    set((state) => {
      const chain = state.getChain(chainId);
      if (!chain) return state;

      // Add the new block to the chain's blocks & truncate to the last 2 blocks
      return {
        chains: state.chains.map((c) =>
          c.chainId === chainId ? { ...c, blocks: [...c.blocks, block].slice(-2) } : c
        ),
      };
    });
  },
}));
