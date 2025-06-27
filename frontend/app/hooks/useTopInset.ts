import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, StatusBar } from "react-native";

export function useTopInset(): number {
  const insets = useSafeAreaInsets();
  console.log(
    "useTopInset",
    insets.top,
    "StatusBar.currentHeight",
    StatusBar.currentHeight,
  );
  return Platform.OS === "android"
    ? (StatusBar.currentHeight ?? 0)
    : insets.top;
}
