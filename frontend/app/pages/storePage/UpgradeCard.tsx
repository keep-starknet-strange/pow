import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'

interface UpgradeCardProps {
  imageSrc: ImageSourcePropType
  title: string
  description: string
  unlocked: boolean
  cost: number
  onPress: () => void
  disabled?: boolean
  containerClass?: string
  buttonBgColor?: string
  unlockedBgColor?: string
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  imageSrc,
  title,
  description,
  unlocked,
  cost,
  onPress,
  disabled = false,
  containerClass = '',
  buttonBgColor = '#e7e760e0',
  unlockedBgColor = '#9ef7a0d0',
}) => (
  <View
    className={`flex flex-row justify-between items-center p-2 mx-2 bg-[#e760e740] rounded-lg border-2 border-[#e7e7e740] relative ${containerClass}`}
  >
    <Image source={imageSrc} className="w-[3.6rem] h-[3.6rem] rounded-full" />
    <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
      <Text className="text-[#e7e7e7] text-xl font-bold">{title}</Text>
      <Text className="text-[#e7e7e7] text-md">{description}</Text>
    </View>

    {unlocked ? (
      <View
        className="flex flex-1 justify-center items-center rounded-lg p-2 border-2 border-[#e7e7e740] mr-1"
        style={{ backgroundColor: unlockedBgColor }}
      >
        <Text className="text-[#171717] text-md font-bold">Unlocked!</Text>
      </View>
    ) : (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className="flex flex-1 justify-center items-center rounded-lg p-2 border-2 border-[#e7e7e740] mr-1"
        style={[
          { backgroundColor: buttonBgColor },
          disabled && { opacity: 0.5 },
        ]}
      >
        <Text className="text-[#171717] text-md font-bold">Unlock – ₿{cost}</Text>
      </TouchableOpacity>
    )}
  </View>
)
