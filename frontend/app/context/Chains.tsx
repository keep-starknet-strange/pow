import React, { createContext, useContext, useState, useEffect } from "react";
import { Chain, newChain, Block } from "../types/Chains";

type ChainsContextType = {
  chains: Chain[];

  getChain: (chainId: number) => Chain;
  addChain: () => void;
  getBlock: (chainId: number, blockId: number) => Block | null;
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
  const [chains, setChains] = useState<Chain[]>([]);

  const resetChains = () => {
    setChains([newChain(0)]);
  };

  useEffect(() => {
    resetChains();
    /*
    const getNewGameState = async () => {
      const newGameState = await getGameState(mockAddress);
      if (!newGameState) return;
      setGameState(newGameState);
    }
    getNewGameState();
    */
  }, []);

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

  const addBlock = (chainId: number, block: Block) => {
    setChains((prevState) => {
      if (!prevState[chainId]) {
        console.error(`Chain with ID ${chainId} does not exist.`);
        return prevState;
      }
      const newChains = [...prevState];
      newChains[chainId] = {
        ...prevState[chainId],
        blocks: [...prevState[chainId].blocks, block].slice(-5), // Limit to 5 blocks
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
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
};
