import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import YoutubePlayer from "react-native-youtube-iframe";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NounsDAOSection = () => {
  const { width } = Dimensions.get("window");
  const videoWidth = width - 64; // Account for padding
  const videoHeight = (videoWidth * 9) / 16; // 16:9 aspect ratio
  const [showVideo, setShowVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <Animated.View className="flex-1" entering={FadeInUp}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-[#101119] text-[40px] font-Xerxes text-right">
          NounsDAO
        </Text>
        <View className="mt-2">
          <Text className="text-[#101119] text-[16px] font-Pixels mb-4 leading-6">
            NounsDAO is a decentralized autonomous organization building a new
            way of funding public goods. Every day, one Noun NFT is trustlessly
            auctioned off forever. 100% of the proceeds go to the DAO treasury,
            which is governed by Noun holders.
          </Text>
          <Text className="text-[#101119] text-[16px] font-Pixels mb-4 leading-6">
            Each Noun is unique, generated from a collection of heads, bodies,
            accessories, and of course, the iconic pixelated glasses known as
            "noggles" ⌐◨-◨.
            POW! avatars are based on NounsDAO art, which is open-source (CC0),
            bringing the Nounish aesthetic to Starknet.
          </Text>
          <View className="mb-6">
            <Text className="text-[#101119] text-[16px] font-Pixels mb-3">
              Watch: What is Nouns?
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowVideo(true);
                setPlaying(true);
              }}
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

      <Modal
        visible={showVideo}
        animationType="slide"
        onRequestClose={() => setShowVideo(false)}
      >
        <View className="flex-1 bg-black">
          <View
            className="flex-row justify-end p-4"
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowVideo(false);
                setPlaying(false);
              }}
              className="bg-white/20 px-4 py-2 rounded"
            >
              <Text className="text-white font-Pixels text-[16px]">Close</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center">
            <YoutubePlayer
              height={300}
              videoId="lOzCA7bZG_k"
              play={playing}
              forceAndroidAutoplay={true}
            />
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default NounsDAOSection;
