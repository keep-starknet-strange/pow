import React, { memo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native";
import { useFocEngine } from "../../context/FocEngineConnector";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useEventManager } from "../../stores/useEventManager";
import { useImages } from "../../hooks/useImages";
import NounsBuilder from "../../components/NounsBuilder";
import BasicButton from "../../components/buttons/Basic";
import AvatarCreator from "./AvatarCreator";
import Constants from "expo-constants";
import { getRandomNounsAttributes, NounsAttributes } from "../../configs/nouns";
import {
  Canvas,
  FilterMode,
  Image as SkiaImg,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Marquee } from "@animatereactnative/marquee";

type AccountCreationProps = {
  setLoginPage: (page: string) => void;
};

export const AccountCreationPage: React.FC<AccountCreationProps> = ({
  setLoginPage,
}) => {
  const version = Constants.expoConfig?.version || "0.0.1";
  const { notify } = useEventManager();
  const {
    isUsernameUnique,
    isUsernameValid,
    usernameValidationError,
    initializeAccount,
    accountsContractAddress,
    mintFunds,
  } = useFocEngine();
  const {
    generatePrivateKey,
    generateAccountAddress,
    deployAccount,
    network,
    getAvailableKeys,
    storeKeyAndConnect,
  } = useStarknetConnector();
  const { getImage } = useImages();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const [avatarContainerSize, setAvatarContainerSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [usernameError, setUsernameError] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [isGeneratingUsername, setIsGeneratingUsername] =
    React.useState<boolean>(false);
  const [isSavingAccount, setIsSavingAccount] = React.useState<boolean>(false);
  const [avatar, setAvatar] = React.useState<NounsAttributes>(
    getRandomNounsAttributes(),
  );
  const [newAvatar, setNewAvatar] = React.useState<NounsAttributes>(avatar);
  const [creatingAvatar, setCreatingAvatar] = React.useState<boolean>(false);

  const startCreatingAvatar = () => {
    setCreatingAvatar(true);
    setNewAvatar(avatar);
    notify("BasicClick");
  };

  const applyAvatarCreation = () => {
    setCreatingAvatar(false);
    setAvatar(newAvatar);
    notify("BasicClick");
  };

  // Local word lists for username generation
  const adjectives = [
    "Swift",
    "Bright",
    "Bold",
    "Quick",
    "Smart",
    "Cool",
    "Fast",
    "Wild",
    "Free",
    "Pure",
    "Strong",
    "Brave",
    "Calm",
    "Sharp",
    "Wise",
    "Kind",
    "True",
    "Fair",
    "Deep",
    "Clear",
    "Smooth",
    "Solid",
    "Noble",
    "Proud",
    "Lucky",
    "Happy",
    "Golden",
    "Silver",
    "Cosmic",
    "Digital",
    "Crypto",
    "Quantum",
    "Decentralized",
    "Trustless",
    "Immutable",
    "Permissionless",
    "Atomic",
    "Zero",
    "Alpha",
    "Beta",
    "Genesis",
    "Final",
    "Ultra",
    "Meta",
    "Super",
    "Hyper",
    "Mega",
    "Giga",
    "Nano",
    "Micro",
    "Stealth",
    "Phantom",
    "Shadow",
    "Elite",
    "Prime",
    "Apex",
    "Void",
    "Dark",
    "Light",
    "Neon",
    "Electric",
    "Plasma",
    "Laser",
    "Turbo",
    "Blaze",
    "Frost",
    "Storm",
    "Cyber",
    "Neural",
    "Binary",
    "Flux",
    "Nexus",
    "Vector",
    "Matrix",
    "Prism",
    "Pulse",
    "Echo",
    "Viral",
    "Ghost",
    "Rogue",
    "Mystic",
    "Sacred",
    "Divine",
    "Eternal",
    "Infinite",
    "Stellar",
    "Galactic",
    "Lunar",
    "Solar",
    "Orbital",
    "Radiant",
    "Luminous",
    "Brilliant",
    "Shining",
    "Glowing",
    "Blazing",
    "Burning",
    "Frozen",
    "Crystal",
    "Diamond",
    "Platinum",
    "Titanium",
    "Carbon",
    "Iron",
    "Steel",
    "Copper",
    "Bronze",
    "Emerald",
    "Ruby",
    "Sapphire",
    "Obsidian",
    "Granite",
    "Marble",
    "Quartz",
    "Jade",
    "Amber",
    "Pearl",
    "Opal",
    "Topaz",
    "Crimson",
    "Scarlet",
    "Azure",
    "Violet",
    "Indigo",
    "Magenta",
    "Cyan",
    "Teal",
    "Lime",
    "Orange",
    "Purple",
    "Maroon",
    "Navy",
    "Olive",
    "Pink",
    "Brown",
    "Gray",
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Arctic",
    "Polar",
    "Tropical",
    "Desert",
    "Mountain",
    "Forest",
    "Ocean",
    "Sky",
    "Earth",
    "Fire",
    "Water",
    "Air",
    "Space",
    "Time",
    "Speed",
    "Power",
    "Energy",
    "Force",
    "Chaos",
    "Order",
    "Peace",
    "War",
    "Love",
    "Hate",
    "Hope",
    "Fear",
    "Joy",
    "Rage",
    "Calm",
    "Wild",
    "Tame",
    "Lost",
    "Found",
    "Hidden",
    "Visible",
    "Secret",
    "Open",
    "Closed",
    "Locked",
    "Free",
    "Bound",
    "Broken",
    "Fixed",
    "New",
    "Old",
    "Young",
    "Ancient",
    "Modern",
    "Future",
    "Past",
    "Present",
    "Real",
    "Virtual",
    "Artificial",
    "Natural",
    "Synthetic",
    "Organic",
    "Toxic",
    "Pure",
    "Clean",
    "Dirty",
    "Fresh",
    "Stale",
    "Hot",
    "Cold",
    "Warm",
    "Cool",
  ];

  const nouns = [
    "Tiger",
    "Eagle",
    "Wolf",
    "Lion",
    "Bear",
    "Fox",
    "Hawk",
    "Shark",
    "Dragon",
    "Phoenix",
    "Storm",
    "Thunder",
    "Lightning",
    "Fire",
    "Ice",
    "Star",
    "Moon",
    "Sun",
    "Wind",
    "Rain",
    "Mountain",
    "River",
    "Ocean",
    "Forest",
    "Desert",
    "Valley",
    "Peak",
    "Wave",
    "Stone",
    "Crystal",
    "Block",
    "Chain",
    "Node",
    "Hash",
    "Token",
    "Coin",
    "Wallet",
    "Key",
    "Proof",
    "Stake",
    "Mint",
    "Fork",
    "Bridge",
    "Pool",
    "Swap",
    "Yield",
    "Vault",
    "Protocol",
    "Layer",
    "Network",
    "Gas",
    "Fee",
    "Burn",
    "Lock",
    "Shard",
    "Merkle",
    "Nonce",
    "Oracle",
    "Rollup",
    "Zap",
    "Panther",
    "Falcon",
    "Cobra",
    "Viper",
    "Raven",
    "Serpent",
    "Lynx",
    "Jaguar",
    "Leopard",
    "Cheetah",
    "Rhino",
    "Buffalo",
    "Bison",
    "Mammoth",
    "Kraken",
    "Leviathan",
    "Hydra",
    "Griffin",
    "Wyvern",
    "Unicorn",
    "Pegasus",
    "Sphinx",
    "Minotaur",
    "Titan",
    "Golem",
    "Wraith",
    "Specter",
    "Phantom",
    "Spirit",
    "Soul",
    "Essence",
    "Core",
    "Heart",
    "Mind",
    "Brain",
    "Nexus",
    "Portal",
    "Gateway",
    "Beacon",
    "Signal",
    "Pulse",
    "Echo",
    "Wave",
    "Flow",
    "Stream",
    "Current",
    "Surge",
    "Spark",
    "Flash",
    "Bolt",
    "Ray",
    "Beam",
    "Laser",
    "Plasma",
    "Energy",
    "Power",
    "Force",
    "Field",
    "Zone",
    "Realm",
    "Domain",
    "Empire",
    "Kingdom",
    "Throne",
    "Crown",
    "Scepter",
    "Blade",
    "Sword",
    "Shield",
    "Armor",
    "Forge",
    "Hammer",
    "Anvil",
    "Axe",
    "Spear",
    "Arrow",
    "Bow",
    "Staff",
    "Wand",
    "Rod",
    "Club",
    "Mace",
    "Dagger",
    "Knife",
    "Scythe",
    "Whip",
    "Chain",
    "Rope",
    "Net",
    "Trap",
    "Cage",
    "Prison",
    "Tower",
    "Castle",
    "Fortress",
    "Citadel",
    "Bastion",
    "Keep",
    "Wall",
    "Gate",
    "Door",
    "Window",
    "Bridge",
    "Path",
    "Road",
    "Trail",
    "Journey",
    "Quest",
    "Mission",
    "Task",
    "Goal",
    "Dream",
    "Vision",
    "Hope",
    "Wish",
    "Desire",
    "Want",
    "Need",
    "Fear",
    "Doubt",
    "Faith",
    "Trust",
    "Belief",
    "Truth",
    "Lie",
    "Secret",
    "Mystery",
    "Riddle",
    "Puzzle",
    "Code",
    "Cipher",
    "Symbol",
    "Sign",
    "Mark",
    "Stamp",
    "Seal",
    "Badge",
    "Medal",
    "Trophy",
    "Prize",
    "Reward",
    "Gift",
    "Present",
    "Surprise",
    "Wonder",
    "Miracle",
    "Magic",
    "Spell",
    "Charm",
    "Curse",
    "Blessing",
    "Prayer",
    "Ritual",
    "Ceremony",
    "Festival",
    "Party",
    "Dance",
    "Song",
    "Music",
    "Sound",
    "Voice",
    "Word",
    "Name",
    "Title",
    "Rank",
    "Level",
    "Grade",
    "Class",
    "Type",
    "Kind",
    "Sort",
    "Form",
    "Shape",
    "Size",
    "Color",
    "Shade",
    "Tone",
    "Hue",
    "Tint",
    "Light",
    "Dark",
    "Shadow",
    "Glow",
    "Shine",
    "Spark",
    "Flame",
    "Ember",
    "Ash",
    "Dust",
    "Sand",
    "Dirt",
    "Mud",
    "Clay",
    "Rock",
    "Boulder",
    "Pebble",
    "Gem",
    "Jewel",
    "Diamond",
    "Ruby",
    "Emerald",
    "Sapphire",
    "Topaz",
    "Opal",
    "Pearl",
    "Coral",
    "Shell",
    "Bone",
    "Skull",
    "Spine",
    "Rib",
    "Tooth",
    "Fang",
    "Claw",
    "Talon",
    "Wing",
    "Feather",
    "Scale",
    "Fur",
    "Hair",
    "Skin",
    "Hide",
    "Leather",
    "Fabric",
    "Cloth",
    "Silk",
    "Cotton",
    "Wool",
    "Linen",
    "Velvet",
    "Satin",
    "Lace",
    "Thread",
    "String",
    "Wire",
    "Cable",
    "Cord",
    "Line",
    "Loop",
    "Circle",
    "Ring",
    "Band",
    "Strip",
    "Belt",
    "Strap",
    "Buckle",
    "Button",
    "Zipper",
    "Hook",
    "Latch",
    "Lock",
    "Key",
    "Handle",
    "Grip",
    "Hold",
    "Clutch",
    "Grasp",
    "Touch",
    "Feel",
    "Sense",
    "Sight",
    "Sound",
    "Taste",
    "Smell",
    "Memory",
    "Thought",
    "Idea",
    "Concept",
    "Theory",
    "Fact",
    "Data",
    "Info",
    "Knowledge",
    "Wisdom",
    "Intelligence",
    "Genius",
    "Talent",
    "Skill",
    "Art",
    "Craft",
    "Trade",
    "Work",
    "Job",
    "Task",
    "Duty",
    "Role",
    "Part",
    "Piece",
    "Bit",
    "Chunk",
    "Block",
    "Unit",
    "Element",
    "Component",
    "Part",
    "Section",
    "Division",
    "Branch",
    "Arm",
    "Leg",
    "Foot",
    "Hand",
    "Finger",
    "Thumb",
    "Palm",
    "Wrist",
    "Elbow",
    "Shoulder",
    "Neck",
    "Head",
    "Face",
    "Eye",
    "Ear",
    "Nose",
    "Mouth",
    "Lip",
    "Tongue",
    "Teeth",
    "Chin",
    "Cheek",
    "Brow",
    "Forehead",
    "Temple",
    "Jaw",
    "Beard",
    "Mustache",
    "Smile",
    "Frown",
    "Grin",
    "Laugh",
    "Cry",
    "Tear",
    "Drop",
    "Splash",
    "Ripple",
    "Tide",
    "Current",
    "Flow",
    "Stream",
    "River",
    "Lake",
    "Pond",
    "Pool",
    "Sea",
    "Ocean",
    "Bay",
    "Gulf",
    "Strait",
    "Channel",
    "Harbor",
    "Port",
    "Dock",
    "Pier",
    "Wharf",
    "Shore",
    "Beach",
    "Coast",
    "Island",
    "Peninsula",
    "Cape",
    "Point",
    "Cliff",
    "Rock",
    "Cave",
    "Cavern",
    "Tunnel",
    "Mine",
    "Shaft",
    "Pit",
    "Hole",
    "Gap",
    "Space",
    "Room",
    "Hall",
    "Chamber",
    "Vault",
    "Cellar",
    "Basement",
    "Attic",
    "Loft",
    "Floor",
    "Ceiling",
    "Wall",
    "Corner",
    "Edge",
    "Border",
    "Boundary",
    "Limit",
    "End",
    "Start",
    "Beginning",
    "Origin",
    "Source",
    "Root",
    "Base",
    "Foundation",
    "Ground",
    "Earth",
    "Soil",
    "Land",
    "Field",
    "Meadow",
    "Prairie",
    "Plain",
    "Plateau",
    "Hill",
    "Mountain",
    "Peak",
    "Summit",
    "Top",
    "Crown",
    "Apex",
    "Zenith",
    "Height",
    "Altitude",
    "Depth",
    "Bottom",
    "Floor",
    "Basement",
    "Foundation",
    "Core",
    "Center",
    "Middle",
    "Hub",
    "Axis",
    "Pivot",
    "Hinge",
    "Joint",
    "Connection",
    "Link",
    "Bond",
    "Tie",
    "Knot",
    "Twist",
    "Turn",
    "Bend",
    "Curve",
    "Arc",
    "Circle",
    "Spiral",
    "Helix",
    "Coil",
    "Spring",
    "Bounce",
    "Jump",
    "Leap",
    "Hop",
    "Skip",
    "Step",
    "Stride",
    "Walk",
    "Run",
    "Sprint",
    "Dash",
    "Rush",
    "Speed",
    "Velocity",
    "Momentum",
    "Inertia",
    "Motion",
    "Movement",
    "Action",
    "Activity",
    "Operation",
    "Function",
    "Process",
    "Method",
    "Way",
    "Path",
    "Route",
    "Course",
    "Direction",
    "Heading",
    "Bearing",
    "Angle",
    "Degree",
    "Measure",
    "Scale",
    "Size",
    "Length",
    "Width",
    "Height",
    "Depth",
    "Volume",
    "Mass",
    "Weight",
    "Density",
    "Pressure",
    "Force",
    "Power",
    "Energy",
    "Strength",
    "Might",
    "Vigor",
    "Vitality",
    "Life",
    "Living",
    "Being",
    "Existence",
    "Reality",
    "Truth",
    "Fact",
    "Matter",
    "Substance",
    "Material",
    "Object",
    "Thing",
    "Item",
    "Article",
    "Piece",
    "Part",
    "Fragment",
    "Shard",
    "Splinter",
    "Chip",
    "Crack",
    "Break",
    "Split",
    "Tear",
    "Rip",
    "Cut",
    "Slice",
    "Chop",
    "Hack",
    "Strike",
    "Hit",
    "Blow",
    "Impact",
    "Crash",
    "Smash",
    "Crush",
    "Squeeze",
    "Press",
    "Push",
    "Pull",
    "Drag",
    "Lift",
    "Raise",
    "Lower",
    "Drop",
    "Fall",
    "Descent",
    "Ascent",
    "Rise",
    "Climb",
    "Reach",
    "Stretch",
    "Extend",
    "Expand",
    "Grow",
    "Increase",
    "Decrease",
    "Reduce",
    "Shrink",
    "Contract",
    "Compress",
    "Compact",
    "Dense",
    "Thick",
    "Thin",
    "Narrow",
    "Wide",
    "Broad",
    "Long",
    "Short",
    "Tall",
    "Small",
    "Large",
    "Big",
    "Huge",
    "Giant",
    "Massive",
    "Enormous",
    "Tiny",
    "Minute",
    "Micro",
    "Mini",
    "Mega",
    "Ultra",
    "Super",
    "Hyper",
    "Extra",
    "Special",
    "Unique",
    "Rare",
    "Common",
    "Normal",
    "Regular",
    "Standard",
    "Basic",
    "Simple",
    "Complex",
    "Complicated",
    "Difficult",
    "Easy",
    "Hard",
    "Soft",
    "Smooth",
    "Rough",
    "Sharp",
    "Dull",
    "Bright",
    "Dark",
    "Light",
    "Heavy",
    "Fast",
    "Slow",
    "Quick",
    "Swift",
    "Rapid",
    "Instant",
    "Immediate",
    "Sudden",
    "Gradual",
    "Steady",
    "Stable",
    "Solid",
    "Firm",
    "Fixed",
    "Loose",
    "Tight",
    "Open",
    "Closed",
    "Full",
    "Empty",
    "Complete",
    "Partial",
    "Whole",
    "Half",
    "Quarter",
    "Third",
    "Double",
    "Triple",
    "Single",
    "Multiple",
    "Many",
    "Few",
    "Several",
    "Some",
    "All",
    "None",
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Hundred",
    "Thousand",
    "Million",
    "Billion",
    "Infinity",
  ];

  // Generate random username using local word lists
  const generateRandomUsername = async () => {
    setIsGeneratingUsername(true);
    try {
      // Get random words from local lists
      const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

      let combinedUsername = randomAdjective + randomNoun;

      // Ensure max 31 characters
      if (combinedUsername.length > 31) {
        // Try to trim the noun first
        const maxNounLength = 31 - randomAdjective.length;
        if (maxNounLength > 3) {
          combinedUsername =
            randomAdjective + randomNoun.substring(0, maxNounLength);
        } else {
          // If still too long, trim both words proportionally
          const halfLength = Math.floor(31 / 2);
          combinedUsername =
            randomAdjective.substring(0, halfLength) +
            randomNoun.substring(0, 31 - halfLength);
        }
      }

      setUsername(combinedUsername);
      setUsernameError(""); // Clear any previous errors
      notify("DiceRoll");
    } catch (error) {
      console.error("Error generating random username:", error);
      // Fallback username if generation fails
      setUsername("RandomUser" + Math.floor(Math.random() * 1000));
      notify("BasicError");
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const createAccountAndClaimUsername = async () => {
    setIsSavingAccount(true);
    try {
      // First check if we already have an account connected
      const keys = await getAvailableKeys("pow_game");
      if (keys.length > 0) {
        // Account exists, just claim username
        await initializeAccount(username, [
          `0x` + avatar.head.toString(16),
          `0x` + avatar.body.toString(16),
          `0x` + avatar.glasses.toString(16),
          `0x` + avatar.accessories.toString(16),
        ]);
        // No need to navigate, user will see the account creation process complete
        return;
      }

      // No account exists, create new one using the claim_username logic
      if (!accountsContractAddress) {
        throw new Error("Accounts contract address is not set");
      }

      const privateKey = generatePrivateKey();
      if (network === "SN_DEVNET") {
        const accountAddress = generateAccountAddress(privateKey, "devnet");
        await mintFunds(accountAddress, 10n ** 20n); // Mint 1000 ETH
        await deployAccount(privateKey, "devnet");
        await storeKeyAndConnect(privateKey, "pow_game", "devnet");
        // After account is deployed, claim username
        await initializeAccount(username, [
          `0x` + avatar.head.toString(16),
          `0x` + avatar.body.toString(16),
          `0x` + avatar.glasses.toString(16),
          `0x` + avatar.accessories.toString(16),
        ]);
      } else {
        // This will deploy the account and claim username in one transaction with retries
        await initializeAccount(
          username,
          [
            `0x` + avatar.head.toString(16),
            `0x` + avatar.body.toString(16),
            `0x` + avatar.glasses.toString(16),
            `0x` + avatar.accessories.toString(16),
          ],
          undefined,
          privateKey,
          3,
        );
      }
    } catch (error) {
      console.error("Error creating account and claiming username:", error);
      setUsernameError("Failed to create account. Please try again.");
      notify("BasicError");
    } finally {
      setIsSavingAccount(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <AccountCreationHeader width={width} topInset={insets.top} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{
            flex: 0.7,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setAvatarContainerSize({ width, height });
            }}
          >
            <AvatarCreator
              containerSize={avatarContainerSize}
              avatar={avatar}
              setAvatar={setAvatar}
              newAvatar={newAvatar}
              setNewAvatar={setNewAvatar}
              startCreatingAvatar={startCreatingAvatar}
              creatingAvatar={creatingAvatar}
            />
          </View>

          <Animated.View
            entering={FadeInDown}
            className="flex flex-col items-start w-screen px-8 my-2"
          >
            <Text className="text-[#101119] text-lg font-Pixels">
              Set up a username
            </Text>
            <View className="flex-row items-center w-full mt-1 gap-2">
              <TextInput
                className="bg-[#10111910] flex-1 px-2
                            pt-1 text-[32px] text-[#101119] border-2 border-[#101119]
                            shadow-lg shadow-black/50 font-Teatime"
                selectionColor="#101119"
                placeholder="Satoshi"
                placeholderTextColor="#10111980"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                value={username}
                onChangeText={setUsername}
              />
              <Pressable
                onPress={generateRandomUsername}
                disabled={isGeneratingUsername || isSavingAccount}
                className="shadow-lg shadow-black/50"
              >
                <Canvas style={{ width: 40, height: 40 }}>
                  <SkiaImg
                    image={getImage("icon.random")}
                    x={0}
                    y={0}
                    width={40}
                    height={40}
                    fit="contain"
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                  />
                </Canvas>
              </Pressable>
            </View>
            <Text className="text-[#101119a0] text-md mt-2 font-Pixels">
              Please notice: your username will be public
            </Text>
            {usernameError ? (
              <Text className="text-red-500 text-md mt-2 font-Pixels">
                {usernameError}
              </Text>
            ) : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          flex: 0.3,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
        entering={FadeInDown}
      >
        <BasicButton
          label={isSavingAccount ? "Saving..." : "Save"}
          disabled={isSavingAccount}
          onPress={async () => {
            if (!isUsernameValid(username)) {
              setUsernameError(`Invalid username:\n${usernameValidationError}`);
              notify("BasicError");
              return;
            }
            if (!(await isUsernameUnique(username))) {
              setUsernameError("This username is unavailable.");
              notify("BasicError");
              return;
            }
            await createAccountAndClaimUsername();
          }}
        />
        <BasicButton
          label="Cancel"
          disabled={isSavingAccount}
          onPress={async () => {
            setLoginPage("login");
          }}
        />
      </Animated.View>

      <View
        style={{
          alignSelf: "flex-end",
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
        className="w-full px-8 bg-[#10111A]"
      >
        <Animated.View
          entering={FadeInDown}
          className="flex flex-row items-center justify-between w-full"
        >
          <Text className="text-[#fff7ff] font-Pixels text-[16px]">
            version {version}
          </Text>
          <Text className="text-[#fff7ff] font-Pixels text-[16px]">
            We're open source!
          </Text>
        </Animated.View>
      </View>

      {creatingAvatar && (
        <NounsBuilder
          avatar={avatar}
          setCreatingAvatar={setCreatingAvatar}
          applyAvatarCreation={applyAvatarCreation}
          newAvatar={newAvatar}
          setNewAvatar={setNewAvatar}
        />
      )}
    </View>
  );
};

const AccountCreationHeader: React.FC<{ width: number; topInset: number }> =
  memo(({ width, topInset }) => {
    const { getImage } = useImages();
    return (
      <View
        className="relative top-0 left-0 w-full"
        style={{ height: 50 + topInset, width: width }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={getImage("bar.top")}
            fit="fill"
            x={0}
            y={0}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            width={width}
            height={50 + topInset}
          />
        </Canvas>
        <View
          className="absolute top-0 left-0 w-full"
          style={{ paddingTop: topInset }}
        >
          <Marquee spacing={0} speed={1}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-[#fff7ff] font-Teatime text-[40px]">
                CREATE YOUR ACCOUNT
              </Text>
              <View className="w-2 aspect-square bg-[#fff7ff] mx-4" />
            </View>
          </Marquee>
        </View>
      </View>
    );
  });

export default AccountCreationPage;
