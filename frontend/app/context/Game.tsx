import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useEventManager } from "./EventManager";
import { useBalance } from "./Balance";
import { useUpgrades } from "./Upgrades";
import { useChains } from "./Chains";
import { useMiner } from "../hooks/useMiner";
import { useSequencer } from "../hooks/useSequencer";
import { useDAConfirmer } from "../hooks/useDAConfirmer";
import { useProver } from "../hooks/useProver";
import { useFocEngine } from "./FocEngineConnector";
import { usePowContractConnector } from "./PowContractConnector";
import { Transaction, newTransaction, Block, newBlock } from "../types/Chains";
import { L2, newL2, L2DA, newL2DA, L2Prover, newL2Prover } from "../types/L2";
import { daTxTypeId, proofTxTypeId } from "../utils/transactions";

import l2Blob from "../../assets/images/transaction/l2Blob.png";
import l2Batch from "../../assets/images/transaction/l2Batch.png";

export const genesisBlockReward = 1;
type GameContextType = {
  workingBlocks: Block[];
  l2: L2 | undefined;

  getWorkingBlock: (chainId: number) => Block | null;
  addTransaction: (chainId: number, transaction: Transaction) => void;
  getL2: () => L2 | undefined;
  getDa: () => L2DA | undefined;
  getProver: () => L2Prover | undefined;
  getL2Cost: () => number;
  initL2: () => void;

  miningProgress: number;
  mineBlock: () => void;
  sequencingProgress: number;
  sequenceBlock: () => void;
  daProgress: number;
  daConfirm: () => void;
  proverProgress: number;
  prove: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notify } = useEventManager();
  const { updateBalance, tryBuy } = useBalance();
  const { user } = useFocEngine();
  const { powGameContractAddress, getUserBlockNumber, getUserBlockState, getUserMaxChainId, initMyGame } = usePowContractConnector();
  const { getUpgradeValue } = useUpgrades();
  const { addBlock, addChain } = useChains();

  const [workingBlocks, setWorkingBlocks] = useState<Block[]>([]);
  const [l2, setL2] = useState<L2 | undefined>(undefined);

  const resetGameState = () => {
    const initBlock = newBlock(0, genesisBlockReward);
    initBlock.isBuilt = true; // Mark the genesis block as built
    setWorkingBlocks([initBlock]);
    setL2(undefined);
  };

  useEffect(() => {
    const fetchGameState = async () => {
      if (powGameContractAddress && user) {
        try {
          // TODO: Use foc engine?
          const maxChainId = await getUserMaxChainId() || 0;
          // Setup l1 state
          const blockNumber = await getUserBlockNumber(0) || 0;
          if (blockNumber === 0) {
            resetGameState();
            return;
          }
          const {size: blockSize, fees: blockFees} = await getUserBlockState(0) || {size: 0, fees: 0};
          const l1WorkingBlock: Block = {
            blockId: blockNumber,
            fees: blockFees || 0,
            transactions: Array.from({ length: blockSize || 0 }, () => ({
              typeId: 0,
              fee: 0,
              isDapp: false,
            })),
            isBuilt: false,
            reward: blockNumber === 0 ? genesisBlockReward : undefined,
          };
          if (maxChainId > 1) {
            // Setup l2 state
            const l2BlockNumber = await getUserBlockNumber(1) || 0;
            const {size: l2BlockSize, fees: l2BlockFees} = await getUserBlockState(1) || {size: 0, fees: 0};
            const l2WorkingBlock: Block = {
              blockId: l2BlockNumber,
              fees: l2BlockFees || 0,
              transactions: Array.from({ length: l2BlockSize || 0 }, () => ({
                typeId: 0,
                fee: 0,
                isDapp: false,
              })),
              isBuilt: false,
              reward: l2BlockNumber === 0 ? genesisBlockReward : undefined,
            };
            const l2Instance: L2 = newL2();
            l2Instance.da = newL2DA();
            l2Instance.prover = newL2Prover();
            setL2(l2Instance);
            setWorkingBlocks([l1WorkingBlock, l2WorkingBlock]);
          } else {
            setWorkingBlocks([l1WorkingBlock]);
            setL2(undefined);
          }
        } catch (error) {
          console.error("Error fetching game state:", error);
          resetGameState();
        }
      }
    };
    fetchGameState();
    /*
    const getNewGameState = async () => {
      const newGameState = await getGameState(mockAddress);
      if (!newGameState) return;
      setGameState(newGameState);
    }
    getNewGameState();
    */
  }, [powGameContractAddress, user]);

  const getWorkingBlock = useCallback(
    (chainId: number) => {
      return workingBlocks[chainId] || null;
    },
    [workingBlocks],
  );

  const addTransaction = (chainId: number, transaction: Transaction) => {
    if (workingBlocks[chainId]?.isBuilt) return;
    setWorkingBlocks((prevState) => {
      const newWorkingBlocks = [...prevState];
      if (!newWorkingBlocks[chainId]) {
        console.warn(`No working block found for chainId ${chainId}`);
        return newWorkingBlocks;
      }
      const block = newWorkingBlocks[chainId];
      const maxBlockSize = getUpgradeValue(chainId, "Block Size") ** 2;
      if (block.transactions.length >= maxBlockSize) {
        block.isBuilt = true;
        return newWorkingBlocks;
      }
      block.transactions.push(transaction);
      block.fees += transaction.fee;
      if (block.transactions.length >= maxBlockSize) {
        block.isBuilt = true;
      }
      notify("TxAdded", { chainId, tx: transaction });
      return newWorkingBlocks;
    });
  };

  const onBlockMined = () => {
    const completedBlock = workingBlocks[0];
    if (completedBlock.blockId === 0) {
      initMyGame();
    }
    const blockReward =
      completedBlock.reward || getUpgradeValue(0, "Block Reward");
    completedBlock.reward = blockReward;
    setWorkingBlocks((prevState) => {
      const newWorkingBlocks = [...prevState];
      const newBlockInstance = newBlock(completedBlock.blockId + 1);
      newWorkingBlocks[0] = newBlockInstance;
      return newWorkingBlocks;
    });
    notify("MineDone", { block: completedBlock });
    updateBalance(blockReward + completedBlock.fees);
    addBlock(0, completedBlock);
  };
  const { miningProgress, mineBlock } = useMiner(onBlockMined, getWorkingBlock);

  // TODO: DA / Prover fee split? const daSplit = 0.5; // TODO: Config
  const addBlockToDa = (block: Block) => {
    if (!l2) return;
    setL2((prevState) => {
      if (!prevState) return prevState;
      const newL2Instance = { ...prevState };
      newL2Instance.da.blocks.push(block.blockId);
      const blockReward = block.reward || getUpgradeValue(1, "Block Reward");
      // TODO: DA / Prover fee split? newL2Instance.da.blockFees += (block.fees + blockReward) * daSplit;
      newL2Instance.da.blockFees += block.fees + blockReward;
      const daMaxSize = getUpgradeValue(1, "DA compression");
      newL2Instance.da.isBuilt = newL2Instance.da.blocks.length >= daMaxSize;
      return newL2Instance;
    });
  };

  const addBlockToProver = (block: Block) => {
    if (!l2) return;
    setL2((prevState) => {
      if (!prevState) return prevState;
      const newL2Instance = { ...prevState };
      newL2Instance.prover.blocks.push(block.blockId);
      const blockReward = block.reward || getUpgradeValue(1, "Block Reward");
      // TODO: newL2Instance.prover.blockFees += (block.fees + blockReward) * (1 - daSplit);
      newL2Instance.prover.blockFees += block.fees + blockReward;
      const proverMaxSize = getUpgradeValue(1, "Recursive Proving");
      newL2Instance.prover.isBuilt =
        newL2Instance.prover.blocks.length >= proverMaxSize;
      return newL2Instance;
    });
  };

  const onBlockSequenced = () => {
    const completedBlock = workingBlocks[1];
    const blockReward =
      completedBlock.reward || getUpgradeValue(1, "Block Reward");
    completedBlock.reward = blockReward;
    setWorkingBlocks((prevState) => {
      const newWorkingBlocks = [...prevState];
      const newBlockInstance = newBlock(completedBlock.blockId + 1);
      newWorkingBlocks[1] = newBlockInstance;
      return newWorkingBlocks;
    });
    notify("SequenceDone", { block: completedBlock });
    addBlockToDa(completedBlock);
    addBlockToProver(completedBlock);
    addBlock(1, completedBlock);
  };
  const { sequencingProgress, sequenceBlock } = useSequencer(
    onBlockSequenced,
    getWorkingBlock,
  );

  const getL2 = useCallback(() => {
    return l2;
  }, [l2]);

  const getDa = useCallback(() => {
    if (!l2) return undefined;
    return l2.da;
  }, [l2]);

  const onDAConfirmed = () => {
    setL2((prevState) => {
      if (!prevState) return prevState;
      const newTx = newTransaction(daTxTypeId, prevState.da.blockFees, l2Blob);
      // TODO: Issue when L1 block is built already
      addTransaction(0, newTx);
      const newL2Instance = { ...prevState };
      newL2Instance.da = newL2DA();
      return newL2Instance;
    });
  };
  const { daProgress, daConfirm } = useDAConfirmer(onDAConfirmed, getDa);

  const getProver = useCallback(() => {
    if (!l2) return undefined;
    return l2.prover;
  }, [l2]);

  const onProverConfirmed = () => {
    setL2((prevState) => {
      if (!prevState) return prevState;
      const newTx = newTransaction(
        proofTxTypeId,
        prevState.prover.blockFees,
        l2Batch,
      );
      // TODO: Issue when L1 block is built already
      addTransaction(0, newTx);
      const newL2Instance = { ...prevState };
      newL2Instance.prover = newL2Prover();
      return newL2Instance;
    });
  };
  const { proverProgress, prove } = useProver(onProverConfirmed, getProver);

  const defaultL2Cost = 1000; // TODO: Config
  const getL2Cost = useCallback(() => {
    return defaultL2Cost;
  }, [defaultL2Cost]);

  const initL2 = () => {
    const cost = getL2Cost();
    if (!tryBuy(cost)) return;

    setWorkingBlocks((prevState) => {
      if (l2) return prevState;
      const newWorkingBlock = newBlock(0, genesisBlockReward);
      newWorkingBlock.isBuilt = true; // Mark the genesis block as built
      return [...prevState, newWorkingBlock];
    });
    setL2((prevState) => {
      if (prevState) return prevState;
      return newL2();
    });
    addChain();
    notify("L2Purchased", {});
  };

  return (
    <GameContext.Provider
      value={{
        workingBlocks,
        getWorkingBlock,
        addTransaction,
        miningProgress,
        mineBlock,
        sequencingProgress,
        sequenceBlock,
        daProgress,
        daConfirm,
        proverProgress,
        prove,
        l2,
        getL2,
        getL2Cost,
        initL2,
        getDa,
        getProver,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
