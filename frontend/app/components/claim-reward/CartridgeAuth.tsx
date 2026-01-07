import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCartridgeAccount } from "../../hooks/useCartridgeAccount";

interface CartridgeAuthProps {
  onAuthSuccess: (address: string) => void;
}

export const CartridgeAuth: React.FC<CartridgeAuthProps> = ({ onAuthSuccess }) => {
  const {
    accountAddress,
    isLoading,
    error,
    createAccount,
    login,
    hasAccount,
  } = useCartridgeAccount();
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If already authenticated, call success callback
  useEffect(() => {
    if (accountAddress && !isLoading) {
      onAuthSuccess(accountAddress);
    }
  }, [accountAddress, isLoading, onAuthSuccess]);

  const handleCreateAccount = async () => {
    setIsCreating(true);
    try {
      const address = await createAccount(username || undefined);
      onAuthSuccess(address);
    } catch (error) {
      if (__DEV__) {
        console.error("Error creating Cartridge account:", error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const address = await login();
      onAuthSuccess(address);
    } catch (error) {
      if (__DEV__) {
        console.error("Error logging into Cartridge account:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="small" color="#22c55e" />
          <Text style={styles.loadingText}>Loading Cartridge account...</Text>
        </View>
      </View>
    );
  }

  if (accountAddress) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.successTitle}>✅ Cartridge Account Connected</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {accountAddress}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Cartridge Account</Text>
        <Text style={styles.subtitle}>
          {hasAccount
            ? "Login to your existing Cartridge account"
            : "Create a new Cartridge account to receive your reward"}
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputSection}>
          <Text style={styles.label}>Username (optional)</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Leave empty for auto-generated"
            placeholderTextColor="#bfbfc6"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isCreating && !isLoggingIn}
          />
          <Text style={styles.hint}>
            If left empty, a unique username will be generated
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {hasAccount ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#fff7ff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateAccount}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff7ff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "rgba(16,17,25,0.75)",
    borderWidth: 1,
    borderColor: "#39274E",
    borderRadius: 6,
    padding: 12,
  },
  title: {
    fontFamily: "Pixels",
    fontSize: 18,
    color: "#fff7ff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Pixels",
    fontSize: 16,
    color: "#e7e7e7",
    textAlign: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: "Pixels",
    fontSize: 16,
    color: "#e7e7e7",
    textAlign: "center",
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#f44336",
  },
  errorText: {
    fontFamily: "Pixels",
    fontSize: 14,
    color: "#f87171",
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Pixels",
    fontSize: 14,
    color: "#e7e7e7",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    minHeight: 46,
    borderRadius: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff7ff",
    borderWidth: 2,
    borderColor: "#39274E",
    backgroundColor: "#0f0f14",
    fontFamily: "Pixels",
  },
  hint: {
    fontFamily: "Pixels",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  primaryButton: {
    backgroundColor: "#39274E",
    borderWidth: 1,
    borderColor: "#5a3d6e",
  },
  buttonText: {
    color: "#fff7ff",
    fontSize: 16,
    fontFamily: "Pixels",
    fontWeight: "600",
  },
  successTitle: {
    fontFamily: "Pixels",
    fontSize: 18,
    textAlign: "center",
    color: "#22c55e",
    marginBottom: 8,
  },
  addressText: {
    fontFamily: "Pixels",
    fontSize: 14,
    color: "#e7e7e7",
    textAlign: "center",
  },
});


