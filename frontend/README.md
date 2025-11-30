# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   cd frontend
   npm install
   ```

2. Start the app

   ```bash
    cd frontend
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Remote Configuration

The app uses Google Sheets for remote configuration management:

[**Remote Config Sheet**](https://docs.google.com/spreadsheets/d/1xxhXwW09jAlbbUhGfnoEQu_vT_bcTHi9WfPlpqXPmNM/edit?gid=0#gid=0)

This spreadsheet controls:
- **Cell B1**: Minimum app version - forces users to update if their version is below this
- **Cell B2**: What's new message - displays news/announcements to users
- **Cell B3**: Optional link - adds a "Learn more" link to news messages (leave empty to hide)

Changes to the spreadsheet take effect immediately on the next app launch.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
