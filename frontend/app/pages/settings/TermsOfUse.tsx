import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const TermsOfUse: React.FC = () => {
  return (
    <View className="flex-1 bg-white">
      <Animated.View
        entering={FadeInDown}
        style={{
          flex: 1,        
          paddingHorizontal: 24,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#000",
                textAlign: "center",
                marginVertical: 16,
              }}
            >
              Terms and Conditions for POW!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#333",
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              Welcome to POW! Please read these Terms and Conditions carefully
              before playing.
            </Text>
          </View>

          {/* Terms of Service Section */}
          <View style={{ gap: 28, marginBottom: 48 }}>
            {/* 1. Your Agreement */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                1. Your Agreement
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                By playing POW!, you confirm that you have read, understood, and
                agree to these Terms and Conditions. If you do not agree, please
                do not play the game.
              </Text>
            </View>

            {/* 2. About the Game */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                2. About the Game
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginBottom: 12,
                }}
              >
                POW! is an educational blockchain-based game on Starknet where
                players fill blocks with transactions to learn how blockchain
                works. As part of the gameplay, players can unlock and earn STRK
                tokens.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                You may encounter in-game 'points' referred to as 'Bitcoin' for
                thematic or illustrative purposes. These in-game Bitcoin points
                are entirely fictional, do not represent real or actual Bitcoin,
                and have no monetary value. They are used purely for gameplay
                mechanics and educational engagement. The only digital item of
                real-world value that may be earned or transmitted through the
                game is the STRK token.
              </Text>
            </View>

            {/* 3. Account and Wallet */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                3. Account and Wallet
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                <Text style={{ fontWeight: "600" }}>Login:</Text> You will log
                in using a username of your choice (the username you choose will
                be displayed publicly on the leaderboard).
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginTop: 8,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  Automatic Wallet Creation:
                </Text>{" "}
                When you log in, we automatically create a Starknet wallet for
                you. This wallet is securely linked to your login.
              </Text>
            </View>

            {/* 4. Game Rules */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                4. Game Rules
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                • Play fair. Cheating, exploiting bugs, or using bots is
                strictly prohibited.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginTop: 4,
                }}
              >
                • You are solely responsible for your account and any actions
                taken with it.
              </Text>
            </View>

            {/* 5. Rewards (STRK) */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                5. Rewards (STRK)
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginBottom: 12,
                }}
              >
                POW! allows players to unlock and receive STRK tokens as
                rewards. The amount and conditions will be communicated within
                the game.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontWeight: "600" }}>Onboarding Bonus:</Text>{" "}
                Once you complete the game, you will be eligible to receive 10
                STRK to a Starknet Account of your choice. This is a one-time
                reward intended to help you begin your blockchain onboarding
                journey.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                We are not responsible for fluctuations in the value of STRK or
                the availability of the token.
              </Text>
            </View>

            {/* 6. Your Data */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                6. Your Data
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                • We collect your username and game progress data for gameplay
                purposes and leaderboard ranking.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginTop: 4,
                }}
              >
                • Your data will be processed in accordance with our Privacy
                Policy.
              </Text>
            </View>

            {/* 7. Changes to These Terms */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                7. Changes to These Terms
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                We may update these Terms and Conditions at any time. When we
                do, we'll notify you in-game or via our website. Continued use
                of the game implies acceptance of the revised terms.
              </Text>
            </View>

            {/* 8. Game Modifications and Access */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                8. Game Modifications and Access
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                We reserve the right to change, suspend, or discontinue any
                aspect of the game at any time. We may also suspend or terminate
                access for violations of these terms.
              </Text>
            </View>

            {/* 9. Disclaimer */}
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                9. Disclaimer
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                }}
              >
                • The game is provided "as is" without warranties of any kind.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginTop: 4,
                }}
              >
                • We do not guarantee uninterrupted or error-free access.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#333",
                  textAlign: "justify",
                  marginTop: 4,
                }}
              >
                • We are not liable for any losses, damages, or issues arising
                from your use of the game or the STRK tokens.
              </Text>
            </View>
          </View>

          {/* Privacy Policy Section */}
          <View
            style={{
              borderTopWidth: 2,
              borderTopColor: "#e0e0e0",
              paddingTop: 48,
              marginBottom: 48,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#000",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Privacy Policy
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#333",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              This Privacy Policy outlines how we collect, use, and protect your
              information when you play POW!.
            </Text>

            <View style={{ gap: 28 }}>
              {/* 1. Information We Collect */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  1. Information We Collect
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginBottom: 8,
                  }}
                >
                  When you play POW!, we may collect:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  • <Text style={{ fontWeight: "600" }}>Username:</Text> Used
                  for login and public leaderboard.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  •{" "}
                  <Text style={{ fontWeight: "600" }}>Game Progress Data:</Text>{" "}
                  Levels completed, rewards earned, and performance metrics.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  •{" "}
                  <Text style={{ fontWeight: "600" }}>Wallet Information:</Text>{" "}
                  A Starknet wallet is created and managed on your behalf.
                </Text>
              </View>

              {/* 2. How We Use Your Information */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  2. How We Use Your Information
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginBottom: 8,
                  }}
                >
                  We use the data to:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  • Operate and maintain the game experience.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  • Display your progress on the public leaderboard.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  • Manage your Starknet wallet and enable rewards distribution.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  • Analyze game usage to improve features and performance.
                </Text>
              </View>

              {/* 3. Data Sharing */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  3. Data Sharing
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  • <Text style={{ fontWeight: "600" }}>Leaderboard:</Text> Your
                  username will be visible to other players.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  • <Text style={{ fontWeight: "600" }}>Third Parties:</Text> We
                  do not sell your data. We may share it with third-party
                  service providers (e.g., cloud hosting, wallet infrastructure)
                  only to operate the game.
                </Text>
              </View>

              {/* 4. Data Security */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  4. Data Security
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  We implement industry-standard measures to secure your data.
                  However, no system is completely secure; use the game at your
                  own risk.
                </Text>
              </View>

              {/* 5. Your Choices */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  5. Your Choices
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  • <Text style={{ fontWeight: "600" }}>Username:</Text> Choose
                  a username carefully, as it is publicly visible.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                    marginTop: 4,
                  }}
                >
                  • <Text style={{ fontWeight: "600" }}>Account Deletion:</Text>{" "}
                  To delete your account, please contact us at [].
                </Text>
              </View>

              {/* 6. Children's Privacy */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  6. Children's Privacy
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  This game is not intended for children under the age of 16. We
                  do not knowingly collect data from children below this age. If
                  you believe a child's data was collected, please contact us
                  for removal.
                </Text>
              </View>

              {/* 7. Policy Updates */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  7. Policy Updates
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  We may update this Privacy Policy. All significant changes
                  will be communicated within the game or via our website.
                </Text>
              </View>

              {/* 8. Contact Us */}
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                  }}
                >
                  8. Contact Us
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#333",
                    textAlign: "justify",
                  }}
                >
                  For any privacy-related questions or requests, please contact
                  us at: Legal@starkware.co.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default TermsOfUse;
