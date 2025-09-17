import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";

// Only initialize Sentry in production builds
if (!__DEV__) {
  Sentry.init({
    dsn: "https://9b8c74b3c76dc6fdbbfcecc727926eb3@o4506665673621504.ingest.us.sentry.io/4509632391348225",

    // Disable sending personally identifiable information
    sendDefaultPii: false,

    // Filter data to only include essential device information
    beforeSend(event) {
      // Clear user context to prevent any user data collection
      if (event.user) {
        event.user = {};
      }

      // Clear request data that might contain sensitive info
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.headers;
      }

      // Keep only essential device context
      if (event.contexts) {
        const allowedContexts = ["device", "os", "app"];
        const filteredContexts: any = {};

        allowedContexts.forEach((key) => {
          if (event.contexts![key]) {
            if (key === "device") {
              // Only keep model and manufacturer
              filteredContexts[key] = {
                model: event.contexts![key].model,
                manufacturer: event.contexts![key].manufacturer,
              };
            } else if (key === "os") {
              // Only keep OS name and version
              filteredContexts[key] = {
                name: event.contexts![key].name,
                version: event.contexts![key].version,
              };
            } else if (key === "app") {
              // Keep app version for debugging
              filteredContexts[key] = {
                app_version: event.contexts![key].app_version,
              };
            }
          }
        });

        event.contexts = filteredContexts;
      }

      // Clear breadcrumbs that might contain user actions
      if (event.breadcrumbs) {
        event.breadcrumbs = [];
      }

      return event;
    },

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllText: false,
        maskAllImages: false,
        maskAllVectors: false,
      }),
    ],
  });
}

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
