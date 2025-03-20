import { View, Text, ScrollView } from "react-native";

const HelpSection: React.FC = () => {
  return (
    <ScrollView className="flex-1 p-6 bg-[#171717] rounded-xl border-2 border-[#ffffff80]">
      <Text className="text-3xl text-[#f7f7f7] font-bold mb-4">How to Play a Click Chain</Text>

      {/* Step 1 */}
      <Text className="text-2xl text-[#f7f7f7] font-semibold mt-2">🖱️ Step 1: Click Transactions</Text>
      <Text className="text-lg text-[#d0d0d0] mt-1">
        See those little transaction boxes? The ones waiting for you to click them?  
        Click them.
      </Text>

      {/* Step 2 */}
      <Text className="text-2xl text-[#f7f7f7] font-semibold mt-4">📊 Step 2: Get the Fees</Text>
      <Text className="text-lg text-[#d0d0d0] mt-1">
        Each transaction has a fee.  
        Higher fees = more money. That's called math.  
        So if you like money, pick the high-fee transactions.  
      </Text>

      {/* Step 3 */}
      <Text className="text-2xl text-[#f7f7f7] font-semibold mt-4">⛏️ Step 3: Click the Block to Mine</Text>
      <Text className="text-lg text-[#d0d0d0] mt-1">
        Once your block is full, click it to mine.  
        That's what miners do solve puzzles and collect fees.   
        More fees in the block = more money for you. Math. 
      </Text>

      {/* Step 4 */}
      <Text className="text-2xl text-[#f7f7f7] font-semibold mt-4">🤑 Step 4: Profit</Text>
      <Text className="text-lg text-[#d0d0d0] mt-1">
        Congratulations! You’ve successfully clicked things!  
        You get paid in block rewards + fees. Amazing, right? 
        If you're not making enough money, maybe click faster or buy upgrades.  
        Don't blame the game for your slow clicking.  
      </Text>

      {/* Pro Tips */}
      <Text className="text-2xl text-[#f7f7f7] font-semibold mt-4">💡 Pro Tips</Text>
      <Text className="text-lg text-[#d0d0d0] mt-1">
        - Click faster = more transactions per block = more money.  
        - Higher-fee transactions = more profits. 
        - Upgrade your setup instead of complaining about low rewards.  
      </Text>

      {/* Final Note */}
      <Text className="text-2xl text-[#f7f7f7] font-semibold mt-4">🎓 You're Now a Blockchain Expert</Text>
      <Text className="text-lg text-[#d0d0d0] mt-1">
        Congrats, you now understand how a blockchain works at the most basic level.  
        Try explaining this to your friends and watch their eyes glaze over.  
      </Text>
    </ScrollView>
  );
};

export default HelpSection;
