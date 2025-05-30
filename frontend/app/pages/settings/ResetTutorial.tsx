import { useState } from "react";
import { View, Text, Modal } from "react-native";
import ToggleButton from "../../components/buttons/Toggle";


const ResetTutorialButton: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // TODO: Create Tuturial Context
  const [isTutorialReset, setIsTutorialReset] = useState(false);

  const handleReset = () => {
    setModalVisible(false);
    setIsTutorialReset(true);
  };

  return (
    <View>

      <ToggleButton
        label="Reset Tutorial"
        isOn={isTutorialReset}
        onSymbol="✅"
        offSymbol="🔄"
        onToggle={() => setModalVisible(true)}
      />
      {/* TODO: rework styling, maybe remove? */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="p-6 rounded-lg">
            <Text className="text-lg font-bold text-black mb-4">
              Are you sure?
            </Text>
            <Text className="text-md text-gray-600">
              This will reset your tutorial progress.
            </Text>

            <View className="flex flex-row justify-between mt-4">
              <ToggleButton
                label="Cancel"
                isOn={false}
                onSymbol=""
                offSymbol=""
                onToggle={() => setModalVisible(false)}
              />

              <ToggleButton
                label="Reset"
                isOn={false}
                onSymbol=""
                offSymbol=""
                onToggle={handleReset}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ResetTutorialButton;
