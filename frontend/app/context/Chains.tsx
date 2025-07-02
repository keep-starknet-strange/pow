import React, { createContext, useContext, useState, useEffect } from "react";
import { Chain, newChain, Block } from "../types/Chains";
import { useFocEngine } from "./FocEngineConnector";
import { usePowContractConnector } from "./PowContractConnector";

type ChainsContextType = {
  chains: Chain[];

  getChain: (chainId: number) => Chain;
  addChain: () => void;
  getBlock: (chainId: number, blockId: number) => Block | null;
  getLatestBlock: (chainId: number) => Block | null;
  addBlock: (chainId: number, block: Block) => void;
};

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

export const useChains = () => {
  const context = useContext(ChainsContext);
  if (!context) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return context;
};

export const ChainsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chains, setChains] = useState<Chain[]>([newChain(0)]);
  const { user } = useFocEngine();
  const { powGameContractAddress, getUserBlockNumber, getUserMaxChainId } = usePowContractConnector();

  const resetChains = () => {
    setChains([newChain(0)]);
  };

  useEffect(() => {
    const fetchChainState = async () => {
      if (powGameContractAddress && user) {
        try {
          // TODO: Use foc engine?
          const maxChainId = await getUserMaxChainId() || 0;
          // Setup l1 state
          const blockNumber = await getUserBlockNumber(0) || 0;
          // TODO: Get block size?
          const chain = newChain(0);
          if (blockNumber > 0) {
            chain.blocks.push({
              blockId: blockNumber - 1,
              fees: 0,
              transactions: Array.from({ length: 25 }, (_, i) => ({
                typeId: 0,
                fee: 0,
                isDapp: false
              })),
              isBuilt: true,
            });
          }
          if (maxChainId > 1) {
            const l2Chain = newChain(1);
            const l2BlockNumber = await getUserBlockNumber(1) || 0;
            if (l2BlockNumber > 0) {
              l2Chain.blocks.push({
                blockId: l2BlockNumber - 1,
                fees: 0,
                transactions: Array.from({ length: 25 }, (_, i) => ({
                  typeId: 0,
                  fee: 0,
                  isDapp: false
                })),
                isBuilt: true,
              });
            }
            setChains([chain, l2Chain]);
          } else {
            setChains([chain]);
          }
        } catch (error) {
          console.error("Error fetching chain state:", error);
          resetChains();
        }
      }
    }
    fetchChainState();
    /*
    const getNewGameState = async () => {
      const newGameState = await getGameState(mockAddress);
      if (!newGameState) return;
      setGameState(newGameState);
    }
    getNewGameState();
    */
  }, [powGameContractAddress, user]);

  const getChain = (chainId: number) => {
    return chains[chainId] || null;
  };

  const addChain = () => {
    setChains((prevState) => {
      const newChainId = prevState.length;
      const chain = newChain(newChainId);
      return [...prevState, chain];
    });
  };

  const getBlock = (chainId: number, blockId: number) => {
    const chain = getChain(chainId);
    if (!chain) return null;
    return chain.blocks.find((block) => block.blockId === blockId) || null;
  };

  const getLatestBlock = (chainId: number) => {
    const chain = getChain(chainId);
    if (!chain || chain.blocks.length === 0) return null;
    return chain.blocks[chain.blocks.length - 1];
  };

  const addBlock = (chainId: number, block: Block) => {
    setChains((prevState) => {
      if (!prevState[chainId]) {
        console.error(`Chain with ID ${chainId} does not exist.`);
        return prevState;
      }
      const newChains = [...prevState];
      newChains[chainId] = {
        ...prevState[chainId],
        blocks: [...prevState[chainId].blocks, block].slice(-3), // Limit to 3 blocks
      };
      return newChains;
    });
  };

  return (
    <ChainsContext.Provider
      value={{
        chains,
        getChain,
        addChain,
        getBlock,
        addBlock,
        getLatestBlock,
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
};
