import React, { useState } from "react";
import { View } from "react-native";
import { LoginMainPage } from "./login/Main";
import { AccountCreationPage } from "./login/AccountCreation";

export const LoginPage: React.FC = () => {
  const loginPages = {
    login: LoginMainPage,
    accountCreation: AccountCreationPage,
  };
  const [currentPage, setCurrentPage] =
    useState<keyof typeof loginPages>("login");
  const ActivePage = loginPages[currentPage];

  const setLoginPage = (page: string) => {
    setCurrentPage(page as keyof typeof loginPages);
  };

  return (
    <View className="flex-1 items-center">
      <ActivePage setLoginPage={setLoginPage} />
    </View>
  );
};

export default LoginPage;
