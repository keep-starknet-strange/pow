import { Header } from "@react-navigation/elements";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => (
          <Header
            {...options}
            headerStyle={{
              height: 60,
              backgroundColor: "#101119",
            }}
            title=""
          />
        ),
      }}
    >
      <Stack.Screen name="index" options={{ }} />
    </Stack>
  );
}
