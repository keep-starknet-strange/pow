import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import AboutSection from "./settings/About";
import CreditsSection from "./settings/Credits";

import ToggleButton from "../components/buttons/Toggle";

import { useSound } from "../context/Sound";

export type SettingsPageProps = {
  closeHeaderTab: () => void;
};

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  const { isSoundOn, isMusicOn, toggleSound, toggleMusic } = useSound();
  const [notifs, setNotifs] = useState(true);

  const toggleNotifs = () => {
    setNotifs(!notifs);
  }

  const tabs = [
    {
      name: "Main",
      component: null
    },
    {
      name: "About",
      component: AboutSection
    },
    {
      name: "Credits",
      component: CreditsSection
    }
  ];
  const [openSection, setSettingTab] = useState(tabs[0]);

  // TODO: Help option?
  // TODO: Move main section to a separate component for better readability
  return (
    <View className="flex-1 flex flex-col gap-2 px-8">
     <View className="h-[2rem]" />
     {openSection.name === "Main" ? (
       <View className="flex flex-col gap-2 mt-4 w-full">
       <View className="flex flex-row justify-around mt-4 gap-4 w-full">
        <ToggleButton label="Sound" isOn={isSoundOn} onToggle={toggleSound} onSymbol={"🔊"} offSymbol={"🔇"}  />
        <ToggleButton label="Music" isOn={isMusicOn} onToggle={toggleMusic} onSymbol={"🔊"} offSymbol={"🔇"}/>
       </View>
       <ToggleButton label="Notifications" isOn={notifs} onToggle={toggleNotifs} onSymbol={"🔔"} offSymbol={"🔕"} />
       <TouchableOpacity
         className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
       >
         <Text className="text-4xl">Reset Tutorial 🔄</Text>
       </TouchableOpacity>
       <TouchableOpacity
         className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
         onPress={() => setSettingTab(tabs[1])}
       >
         <Text className="text-4xl">About 📖</Text>
       </TouchableOpacity>
       <TouchableOpacity
         className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
         onPress={() => setSettingTab(tabs[2])}
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
       </View>
     ) : (
       <View className="flex flex-col gap-4 mt-4 w-full">
         {openSection.component && (
           <openSection.component />
         )}
       </View>
     )}
     {openSection.name !== "Main" && (
       <TouchableOpacity
         onPress={() => setSettingTab(tabs[0])}
         className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
       >
         <Text className="text-4xl">Back to Settings ⚙️</Text>
       </TouchableOpacity>
     )}
   </View>
  );
}

export default SettingsPage;
