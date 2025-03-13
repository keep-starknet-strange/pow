import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type SettingsPageProps = {
  closeHeaderTab: () => void;
};

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [notifs, setNotifs] = useState(true);

  const toggleSound = () => {
    setSound(!sound);
  }
  const toggleMusic = () => {
    setMusic(!music);
  }
  const toggleNotifs = () => {
    setNotifs(!notifs);
  }

  return (
    <View className="flex-1 flex flex-col gap-4 px-8">
     <View className="flex flex-row justify-around mt-4 gap-4 w-full">
       <TouchableOpacity
         onPress={toggleSound}
         className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
       >
         <Text className="text-4xl">Sound </Text>
         <Text className="text-2xl">{sound ? "🔊" : "🔇"}</Text>
       </TouchableOpacity>
       <TouchableOpacity
         onPress={toggleMusic}
         className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
        >
          <Text className="text-4xl">Music </Text>
          <Text className="text-2xl">{music ? "🔊" : "🔇"}</Text>
        </TouchableOpacity>
     </View>
     <TouchableOpacity
       onPress={toggleNotifs}
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">Notifications </Text>
       <Text className="text-2xl">{notifs ? "🔔" : "🔕"}</Text>
     </TouchableOpacity>
     <TouchableOpacity
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">Reset Tutorial 🔄</Text>
     </TouchableOpacity>
     <TouchableOpacity
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">About 📖</Text>
     </TouchableOpacity>
     <TouchableOpacity
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">Credits 🎉</Text>
     </TouchableOpacity>
     <TouchableOpacity
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">Review 📝</Text>
     </TouchableOpacity>
     <TouchableOpacity
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">Logout 🚪</Text>
     </TouchableOpacity>
     <TouchableOpacity
       onPress={props.closeHeaderTab}
       className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
     >
       <Text className="text-4xl">Back to Game 🎮</Text>
     </TouchableOpacity>
   </View>
  );
}

export default SettingsPage;
