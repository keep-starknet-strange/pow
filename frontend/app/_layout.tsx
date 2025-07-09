import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://9b8c74b3c76dc6fdbbfcecc727926eb3@o4506665673621504.ingest.us.sentry.io/4509632391348225",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

export default Sentry.wrap(function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{}} />
    </Stack>
  );
});
