import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export const CreditsSection = () => {
  const creditedPeople = [
    { name: "ESTEVAN", role: "Team Lead" },
    { name: "BRANDON", role: "Design & Development" },
    { name: "ZACK", role: "Design & Development" },
    { name: "ALEX", role: "Development" },
    { name: "MICHAEL", role: "Development" },
    { name: "MORAN", role: "Design" },
    { name: "JON", role: "Art & Design" },
    { name: "NOUNSDAO", role: "Avatar Art" },
  ];
  const specialThanks = [
    { name: "SATOSHI NAKAMOTO", reason: "Creating a new era" },
    { name: "VITALIK BUTERIN", reason: "Creating the World Computer" },
    { name: "ELI BEN-SASSON", reason: "Creating STARK tech" },
  ];
  const musicCredits = [
    {
      title: "Mega Wall",
      artist: "The Cynic Project",
      link: "https://cynicmusic.com/",
      attribution: null,
    },
    {
      title: "Happy",
      artist: "rezoner",
      link: "https://twitter.com/rezoner",
      attribution: null,
    },
    {
      title: "Busy Day At The Market",
      artist: "David McKee (ViRiX)",
      link: "https://soundcloud.com/virix",
      attribution: "Music created by David McKee (ViRiX) soundcloud.com/virix",
    },
    {
      title: "Left Right Excluded",
      artist: "Matthew Klingensmith",
      link: "https://www.matthewklingensmith.com",
      attribution: null,
    },
    {
      title: "The Return of the 8-Bit Era",
      artist: "DJARTMUSIC",
      link: null,
      attribution: "DJARTMUSIC on Pixabay",
    },
    {
      title: "Super Ninja Assassin",
      artist: "Ove Melaa",
      link: null,
      attribution:
        "Written and produced by Ove Melaa (Omsofware@hotmail.com) -2013 Ove Melaa",
    },
  ];
  return (
    <Animated.View className="flex-1" entering={FadeInUp}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-[#101119] text-[40px] font-Xerxes text-right">
          Credits
        </Text>
        <View className="mt-2">
          <Text className="text-[#101119] text-[22px] font-Teatime mb-6">
            created by StarkWare Exploration
          </Text>
          {creditedPeople.map((person, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between mb-2"
            >
              <Text className="text-[#101119] text-[24px] font-Teatime w-1/3">
                {person.name}
              </Text>
              <Text className="text-[#101119] text-[16px] font-Pixels flex-1 text-left">
                {person.role}
              </Text>
            </View>
          ))}
          <Text className="text-[#101119] text-[20px] font-Xerxes mt-6 mb-4 text-right">
            Special thanks
          </Text>
          {specialThanks.map((thanks, index) => (
            <View key={index} className="mb-4">
              <Text className="text-[#101119] text-[24px] font-Teatime">
                {thanks.name}
              </Text>
              <Text className="text-[#101119] text-[16px] font-Pixels ml-4">
                {thanks.reason}
              </Text>
            </View>
          ))}
          <Text className="text-[#101119] text-[20px] font-Xerxes mt-6 mb-4 text-right">
            Music
          </Text>
          {musicCredits.map((music, index) => (
            <View key={index} className="mb-4">
              <Text className="text-[#101119] text-[20px] font-Teatime">
                {music.title}
              </Text>
              {music.link ? (
                <TouchableOpacity onPress={() => Linking.openURL(music.link)}>
                  <Text className="text-[#101119] text-[16px] font-Pixels ml-4 underline">
                    {music.artist}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-[#101119] text-[16px] font-Pixels ml-4">
                  {music.artist}
                </Text>
              )}
              {music.attribution && (
                <Text className="text-[#101119] text-[14px] font-Pixels ml-4 mt-1 opacity-80">
                  {music.attribution}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default CreditsSection;
