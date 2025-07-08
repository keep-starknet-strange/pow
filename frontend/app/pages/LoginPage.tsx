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
  const ActivePage = loginPages[currentPage];

  const setLoginPage = (page: string) => {
    setCurrentPage(page as keyof typeof loginPages);
  };

  return (
    <View className="flex-1 items-center">
      <MainBackground />
      <ActivePage setLoginPage={setLoginPage} />
    </View>
  );
};

export default LoginPage;
