import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";

export type AchievementsPageProps = {
  closeHeaderTab: () => void;
};

export const AchievementsPage: React.FC<AchievementsPageProps> = (props) => {
  const achievements = [
    {
      name: "Reach 10K BTC",
      progress: 0.2,
      image: "https://api.art-peace.net/stencils/stencil-003aaba2a65145884120024fefdc1fddad19053ab0b041856522f104b82e2fbf.png",
    },
    {
      name: "Reach 10M BTC",
      progress: 0.1,
      image: "https://api.art-peace.net/stencils/stencil-003aaba2a65145884120024fefdc1fddad19053ab0b041856522f104b82e2fbf.png",
    },
    {
      name: "Get an Antminer Rig",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-004c956171643d0f968c3be3ae8da8b8b406979f06205bccee1f4ec5a8fcf70c.png",
    },
    {
      name: "Achieve SNARK Scaling",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-0002c72fbf5063acdd8d3a031b391d52869b9a8e60b0f0f32d4c29acf0940fe7.png"
    },
    {
      name: "Achieve STARK Scaling",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-0002c72fbf5063acdd8d3a031b391d52869b9a8e60b0f0f32d4c29acf0940fe7.png"
    },
    {
      name: "Get 100BTC from 1 TX",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-003aaba2a65145884120024fefdc1fddad19053ab0b041856522f104b82e2fbf.png",
    },
    {
      name: "Mine a block first try",
      progress: 1,
      image: "https://api.art-peace.net/stencils/stencil-0002c72fbf5063acdd8d3a031b391d52869b9a8e60b0f0f32d4c29acf0940fe7.png"
    },
    {
      name: "Reach Block 1000",
      progress: 0.3,
      image: "https://api.art-peace.net/stencils/stencil-0002c72fbf5063acdd8d3a031b391d52869b9a8e60b0f0f32d4c29acf0940fe7.png"
    },
    {
      name: "Reach Block 1M",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-0002c72fbf5063acdd8d3a031b391d52869b9a8e60b0f0f32d4c29acf0940fe7.png"
    },
    {
      name: "Reach Block 1B",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-0002c72fbf5063acdd8d3a031b391d52869b9a8e60b0f0f32d4c29acf0940fe7.png"
    },
    {
      name: "Prestige!",
      progress: 0,
      image: "https://api.art-peace.net/stencils/stencil-003aaba2a65145884120024fefdc1fddad19053ab0b041856522f104b82e2fbf.png",
    },
  ];

  return (
    <View className="flex-1">
     <TouchableOpacity
       className="w-full flex items-end p-4"
       onPress={props.closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>
     <ScrollView className="flex-1">
       <View className="flex flex-row flex-wrap gap-4 justify-center mb-[3rem]">
         {achievements.map((achievement, index) => (
           <View className={`p-4 rounded-lg w-[40%]
             border-2 border-[#ffffff40] border-opacity-20
             flex flex-col items-center justify-center gap-2
             ${achievement.progress === 1 ? "bg-[#20ff2080]" : "bg-[#ffffff20]"}`}
             key={index}
           >
             <Text className="text-2xl text-white">{achievement.name}</Text>
             <Image className="w-24 h-24" source={{ uri: achievement.image }} />
             {achievement.progress === 1 ? (
               <Text className="text-white">Achieved!</Text>
              ) : (
               <View className="bg-[#ffffff40] w-full h-2 rounded-xl relative">
                 <View className="bg-[#20ff2080] h-full rounded-xl" style={{ width: `${achievement.progress * 100}%` }} />
               </View>
             )}
           </View>
         ))}
       </View>
     </ScrollView>
   </View>
  );
}

export default AchievementsPage;
