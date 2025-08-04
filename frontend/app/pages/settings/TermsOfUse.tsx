import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type TermsOfUseProps = {
  onBack: () => void;
};

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <Animated.View
        entering={FadeInDown}
        style={{
          flex: 1,
          paddingTop: 40,
          paddingBottom: 40,
          paddingHorizontal: 24,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#000",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Terms of Use
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                textAlign: "center",
              }}
            >
              Last updated: [Date]
            </Text>
          </View>

          <View style={{ gap: 24 }}>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                1. Acceptance of Terms
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                By accessing and using this application, you accept and agree to
                be bound by these Terms of Use. If you do not agree to abide by
                the above, please do not use this service.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                2. Use License
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                Permission is granted to temporarily use this application for
                personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title, and under this
                license you may not modify or copy the materials.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                3. Disclaimer
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                The materials on this application are provided on an 'as is'
                basis. We make no warranties, expressed or implied, and hereby
                disclaim and negate all other warranties including without
                limitation, implied warranties or conditions of merchantability,
                fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                4. Limitations
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                In no event shall our company or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on this application.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                5. Privacy Policy
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                Your privacy is important to us. We collect and use information
                in accordance with our Privacy Policy, which forms part of these
                Terms of Use.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                6. Governing Law
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                These terms and conditions are governed by and construed in
                accordance with applicable laws, and you irrevocably submit to
                the exclusive jurisdiction of the courts in that state or
                location.
              </Text>
            </View>

            <View style={{ marginTop: 16, marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                This is mock content that will be replaced with actual terms.
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default TermsOfUse;
