import { TouchableOpacity, Image, Text } from 'react-native'
import { shortMoneyString } from '../../../utils/helpers'

type UpgradeButtonProps = {
  icon?: any
  label?: string
  level: number
  maxLevel: number
  nextCost: number
  color: string
  onPress: () => void
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  icon,
  label,
  level,
  maxLevel,
  nextCost,
  color,
  onPress,
}) => {
  const isLocked = !icon
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex justify-center items-center rounded-lg p-2 relative border-2 border-[#e7e7e770] mr-1 ${
        isLocked ? 'bg-[#f7f760d0]' : 'bg-[#e7e7e730]'
      }`}
    >
      {icon ? (
        <Image source={icon} className="w-[3rem] h-[3rem] p-1" />
      ) : (
        <Text className="w-[6rem] text-center">{label}</Text>
      )}

      {!isLocked && (
        <>
          <Text
            className="absolute bottom-[-1rem] text-center px-1 w-[3.6rem] border-2 border-[#e7e7e770] rounded-xl text-[#171717] text-sm font-bold"
            style={{ backgroundColor: color }}
          >
            {level + 1}/{maxLevel}
          </Text>
          <Text className="absolute top-[-0.7rem] text-center px-1 w-[3.6rem] border-2 border-[#e7e7e770] rounded-xl text-[#171717] text-sm font-bold bg-[#e7e760f0]">
            {level === maxLevel ? 'Max' : `${shortMoneyString(nextCost)}`}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}
