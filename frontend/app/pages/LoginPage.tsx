import React, { useState } from "react";
import { View } from "react-native";
import { LoginMainPage } from "./login/Main";
import { AccountCreationPage } from "./login/AccountCreation";
import { SettingsPage } from "./SettingsPage";
import { MainBackground } from "../components/MainBackground";

export const LoginPage: React.FC = () => {
  const loginPages = {
    login: LoginMainPage,
    accountCreation: AccountCreationPage,
    settings: SettingsPage,
  };
  const [currentPage, setCurrentPage] =
    useState<keyof typeof loginPages>("login");
  const [settingsTab, setSettingsTab] = useState<string>("Main");

  const setLoginPage = (page: string) => {
    setCurrentPage(page as keyof typeof loginPages);
  };

  const handleSetSettingTab = (tab: string) => {
    setSettingsTab(tab);
  };

  return (
    <View className="flex-1 items-center">
      <MainBackground />
      <View className="absolute w-full h-full">
        {currentPage === "login" ? (
          <LoginMainPage
            setLoginPage={setLoginPage}
            setSettingTab={handleSetSettingTab}
          />
        ) : currentPage === "settings" ? (
          <SettingsPage setLoginPage={setLoginPage} initialTab={settingsTab} />
        ) : (
          <AccountCreationPage setLoginPage={setLoginPage} />
        )}
      </View>
    </View>
  );
};
