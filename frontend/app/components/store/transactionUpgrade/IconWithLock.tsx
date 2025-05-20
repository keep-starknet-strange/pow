import { View, Image } from 'react-native'
import lockImg from '../../../../assets/images/lock.png'

type IconWithLockProps = {
  source: any
  color: string
  locked: boolean
}

export const IconWithLock: React.FC<IconWithLockProps> = ({ source, color, locked }) => (
  <View
    className="flex flex-col justify-center rounded-lg border-2 border-[#e7e7e740] relative w-[4.5rem] h-[4.5rem]"
    style={{ backgroundColor: color }}
  >
    <Image source={source} className="w-full h-full rounded-lg p-1" />
    {locked && (
      <View className="absolute w-full h-full top-0 left-0 flex justify-center items-center bg-[#272727c0] rounded-lg">
        <Image source={lockImg} className="w-[3rem] h-[3rem]" />
      </View>
    )}
  </View>
)
