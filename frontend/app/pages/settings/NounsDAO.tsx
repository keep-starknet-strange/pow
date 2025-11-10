import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export const NounsDAOSection = () => {
  const { width } = Dimensions.get("window");
  const videoWidth = width - 64; // Account for padding
  const videoHeight = (videoWidth * 9) / 16; // 16:9 aspect ratio

  return (
    <Animated.View className="flex-1" entering={FadeInUp}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-[#101119] text-[40px] font-Xerxes text-right">
          NounsDAO
        </Text>
        <View className="mt-2">
          <Text className="text-[#101119] text-[20px] font-Teatime mb-4">
            POW! is funded by NounsDAO ⌐◨-◨
          </Text>
          <Text className="text-[#101119] text-[16px] font-Pixels mb-4 leading-6">
            NounsDAO is a decentralized autonomous organization building a new
            way of funding public goods. Every day, one Noun NFT is trustlessly
            auctioned off forever. 100% of the proceeds go to the DAO treasury,
            which is governed by Noun holders.
          </Text>
          <Text className="text-[#101119] text-[16px] font-Pixels mb-4 leading-6">
            Each Noun is unique, generated from a collection of heads, bodies,
            accessories, and of course, the iconic pixelated glasses known as
            "noggles" ⌐◨-◨. POW! avatars are based on the Nouns art style,
            bringing the Nounish aesthetic to Starknet.
          </Text>
          <Text className="text-[#101119] text-[16px] font-Pixels mb-4 leading-6">
            Nouns DAO believes in funding open source software and creative
            projects that benefit the Ethereum ecosystem and beyond.
          </Text>
          <View className="mb-6">
            <Text className="text-[#101119] text-[16px] font-Pixels mb-3">
              Watch: What is Nouns?
            </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.youtube.com/watch?v=lOzCA7bZG_k")
              }
              style={{
                width: videoWidth,
                height: videoHeight,
                backgroundColor: "#000",
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                source={{
                  uri: "https://img.youtube.com/vi/lOzCA7bZG_k/maxresdefault.jpg",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "rgba(255,0,0,0.9)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 20,
                      borderTopWidth: 12,
                      borderBottomWidth: 12,
                      borderLeftColor: "#fff",
                      borderTopColor: "transparent",
                      borderBottomColor: "transparent",
                      marginLeft: 4,
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <Text className="text-[#101119] text-[20px] font-Xerxes mt-6 mb-4 text-right">
            Learn More
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://nouns.wtf")}
            className="mb-4"
          >
            <Text className="text-[#101119] text-[18px] font-Pixels underline">
              Visit nouns.wtf
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://nouns.build")}
            className="mb-4"
          >
            <Text className="text-[#101119] text-[18px] font-Pixels underline">
              Build with Nouns
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default NounsDAOSection;
