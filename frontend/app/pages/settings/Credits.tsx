import { View, Text } from "react-native";

export const CreditsSection = () => {
  const creditedPeople = [
    { name: "Brandon Roberts", role: "Design & Development" },
    { name: "Zack Williams", role: "Design & Development" },
    { name: "Estevan", role: "Team Lead" },
  ];
  const specialThanks = [
    { name: "Satoshi Nakamoto", reason: "Creating a new era" },
    { name: "Vitalik Buterin", reason: "Innovating the blockchain space" },
  ];
  return (
    <View className="">
      <Text className="text-white text-4xl font-bold mt-4">Credits</Text>
      <View className="mt-2">
        <Text className="text-white text-lg font-bold">
          This app was created by StarkWare's Exploration Apps team.
        </Text>
        {creditedPeople.map((person, index) => (
          <Text
            key={index}
            className="text-white text-md w-full text-center mt-2"
          >
            {person.name} - {person.role}
          </Text>
        ))}
        <Text className="text-white text-lg font-bold mt-4">
          Special thanks to:
        </Text>
        {specialThanks.map((thanks, index) => (
          <Text
            key={index}
            className="text-white text-md w-full text-center mt-2"
          >
            {thanks.name} - {thanks.reason}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default CreditsSection;
