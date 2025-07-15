import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { CompletedBlockView } from "@/app/components/CompletedBlockView";
import EmptyBlockView from "@/app/components/EmptyBlockView";
import WorkingBlockView from "@/app/components/WorkingBlockView";
import WorkingBlockDetails from "@/app/components/WorkingBlockDetails";
import { useChains } from "@/app/context/Chains";

export type BlockchainViewProps = {
  chainId: number;
  style: StyleProp<ViewStyle>;
};

/*
 * The size of the block proportional to the smallest available dimension.
 */
const BLOCK_SIZE_PERCENT = 0.7;

export const BlockchainView: React.FC<BlockchainViewProps> = (props) => {
  const parentRef = useRef<View>(null);
  const [parentSize, setParentSize] = useState({ width: 0, height: 0 });
  const { chains } = useChains();

  const [workingBlockPosition, setWorkingBlockPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const smallestViewportSize = Math.min(parentSize.width, parentSize.height);

    const size = smallestViewportSize * BLOCK_SIZE_PERCENT;

    const blockSize = {
      top: (parentSize.height - size) / 2,
      left: (parentSize.width - size) / 2,
      width: size,
      height: size,
    };

    setWorkingBlockPosition(blockSize);
  }, [parentSize, BLOCK_SIZE_PERCENT]);

  useLayoutEffect(() => {
    parentRef.current?.measure((_x, _y, width, height, _pageX, _pageY) => {
      setParentSize({ width: width, height: height });
    });
  }, [parentRef, setParentSize]);

  return (
    <View ref={parentRef} style={props.style}>
      {chains[props.chainId].blocks.length > 0 && (
        <CompletedBlockView
          chainId={props.chainId}
          placement={{
            top: workingBlockPosition.top,
            left: workingBlockPosition.left - workingBlockPosition.width - 16,
            width: workingBlockPosition.width,
            height: workingBlockPosition.height,
          }}
          completedPlacementLeft={
            workingBlockPosition.left - 2 * workingBlockPosition.width - 32
          }
        />
      )}

      <EmptyBlockView
        chainId={props.chainId}
        placement={{
          top: workingBlockPosition.top,
          left: workingBlockPosition.left + workingBlockPosition.width + 16,
          width: workingBlockPosition.width,
          height: workingBlockPosition.height,
        }}
        completedPlacementLeft={workingBlockPosition.left}
      />
      <EmptyBlockView
        chainId={props.chainId}
        placement={{
          top: workingBlockPosition.top,
          left: workingBlockPosition.left + 2 * workingBlockPosition.width + 32,
          width: workingBlockPosition.width,
          height: workingBlockPosition.height,
        }}
        completedPlacementLeft={
          workingBlockPosition.left + workingBlockPosition.width + 16
        }
      />

      <WorkingBlockView
        chainId={props.chainId}
        placement={{
          top: workingBlockPosition.top,
          left: workingBlockPosition.left,
          width: workingBlockPosition.width,
          height: workingBlockPosition.height,
        }}
        completedPlacementLeft={
          workingBlockPosition.left - workingBlockPosition.width - 16
        }
      />
      <WorkingBlockDetails
        chainId={props.chainId}
        placement={{
          top: workingBlockPosition.top,
          left: workingBlockPosition.left,
          width: workingBlockPosition.width,
          height: workingBlockPosition.height,
        }}
      />
    </View>
  );
};

export default BlockchainView;
