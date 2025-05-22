import { View } from 'react-native'
import { UpgradeButton } from './UpgradeButton'
import { useTutorialLayout } from '@/app/hooks/useTutorialLayout'
import { TargetId } from '@/app/context/Tutorial'
import { shortMoneyString } from '../../../utils/helpers'

type ActionsProps = {
  locked: boolean
  nextCost: number
  onBuyPress: () => void
  feeProps?: {
    level: number
    maxLevel: number
    nextCost: number
    onPress: () => void
    icon: any
    color: string
  }
  speedProps?: {
    level: number
    maxLevel: number
    nextCost: number
    onPress: () => void
    icon: any
    color: string
  }
}

export const TransactionUpgradeActions: React.FC<ActionsProps> = ({
  locked,
  nextCost,
  onBuyPress,
  feeProps,
  speedProps,
}) => {
  const { ref: feeRef, onLayout: onLayoutFee } = useTutorialLayout("feeUpgradeButton" as TargetId)
  const { ref: speedRef, onLayout: onLayoutSpeed } = useTutorialLayout("speedUpgradeButton" as TargetId)
  return (
    locked ? (
      <UpgradeButton
        label={`Buy ${shortMoneyString(nextCost)}`}
        level={0}
        maxLevel={0}
        nextCost={nextCost}
        color="#f7f760"
        onPress={onBuyPress}
      />
    ) : (
      <View className="flex flex-row justify-center items-center">
        {feeProps && (
          <View
            ref={feeRef}
            onLayout={onLayoutFee}
            className="pt-3 pb-4"
            >
            <UpgradeButton
              icon={feeProps.icon}
              level={feeProps.level}
              maxLevel={feeProps.maxLevel}
              nextCost={feeProps.nextCost}
              color={feeProps.color}
              onPress={feeProps.onPress}
            />
          </View>
        )}
        {speedProps && (
          <View
            ref={speedRef}
            onLayout={onLayoutSpeed}
            className="pt-3 pb-4"
            >
            <UpgradeButton
              icon={speedProps.icon}
              level={speedProps.level}
              maxLevel={speedProps.maxLevel}
              nextCost={speedProps.nextCost}
              color={speedProps.color}
              onPress={speedProps.onPress}
            />
          </View>
        )}
      </View>
    )
  )
}
