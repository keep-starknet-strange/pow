import { View, Text } from 'react-native';

export const AboutSection = () => {
  return (
    <View className="">
      <Text className="text-white text-4xl font-bold mt-4">About</Text>
      <Text className="text-white text-center mt-2">
        Click chain is an onchain mobile clicker game built with React Native and powered by Starknet. Players design and upgrade their blockcahin by tapping, using blockchain-based mechanics to store progress and enable decentralized gameplay.
      </Text>
      <View className="mt-4">
        <Text className="text-white text-2xl font-bold mt-4">Features</Text> 
        <Text className="text-white text-center mt-2">Onchain Progression/State</Text>
        <Text className="text-white text-center mt-2">Click-to-Earn Mechaincs</Text>
        <Text className="text-white text-center mt-2">Session keys & Paymaster</Text>
      </View>
      <View className="mt-4">
        <Text className="text-white text-2xl font-bold mt-4">Links</Text> 
        <Text className="text-white text-center mt-2">Github: <Text className="text-blue-500">
          <Text onPress={() => {}}>@clickchain</Text>
        </Text></Text>
        <Text className="text-white text-center mt-2">Twitter: <Text className="text-blue-500">
          <Text onPress={() => {}}>@clickchain</Text>
        </Text></Text>
      </View>
    </View>
  );
}

export default AboutSection;
