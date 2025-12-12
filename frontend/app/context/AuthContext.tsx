import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";

const FOC_ENGINE_API =
  process.env.EXPO_PUBLIC_FOC_ENGINE_API || "http://localhost:8080";

const JWT_STORAGE_KEY = "foc_auth_jwt";
const REFRESH_TOKEN_STORAGE_KEY = "foc_auth_refresh";
const TOKEN_EXPIRATION_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticateWithFingerprint: (
    sealedResult: string,
    requestId?: string,
  ) => Promise<{ accessToken: string; refreshToken: string } | null>;
  refreshAccessToken: () => Promise<boolean>;
  getAuthHeaders: () => Promise<Record<string, string>>;
  logout: () => Promise<void>;
  ensureAuthenticated: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to decode JWT and get expiration
const getTokenExpiration = (token: string): number | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp) {
      return payload.exp * 1000; // Convert to milliseconds
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.error("Error decoding JWT:", error);
    }
    return null;
  }
};

// Check if token is expired or expiring soon
const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true; // If we can't parse expiration, assume expired
  }
  const now = Date.now();
  return expiration - now < TOKEN_EXPIRATION_BUFFER;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load authentication state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const jwt = await SecureStore.getItemAsync(JWT_STORAGE_KEY);
        if (jwt && !isTokenExpired(jwt)) {
          setIsAuthenticated(true);
        } else if (jwt && isTokenExpired(jwt)) {
          // Try to refresh if expired
          const refreshed = await refreshAccessToken();
          setIsAuthenticated(refreshed);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error loading auth state:", error);
        }
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const authenticateWithFingerprint = useCallback(
    async (
      sealedResult: string,
      requestId?: string,
    ): Promise<{ accessToken: string; refreshToken: string } | null> => {
      try {
        const response = await fetch(`${FOC_ENGINE_API}/auth/verify-device`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sealedResult,
            requestId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (__DEV__) {
            console.error("Authentication failed:", errorData);
          }
          return null;
        }

        const data = await response.json();
        const { accessToken, refreshToken } = data;

        if (!accessToken || !refreshToken) {
          if (__DEV__) {
            console.error("Invalid response from auth endpoint");
          }
          return null;
        }

        // Store tokens securely
        await SecureStore.setItemAsync(JWT_STORAGE_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);

        setIsAuthenticated(true);

        if (__DEV__) {
          console.log("Successfully authenticated with fingerprint");
        }

        return { accessToken, refreshToken };
      } catch (error) {
        if (__DEV__) {
          console.error("Error authenticating with fingerprint:", error);
        }
        return null;
      }
    },
    [],
  );

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(
        REFRESH_TOKEN_STORAGE_KEY,
      );

      if (!refreshToken) {
        if (__DEV__) {
          console.log("No refresh token available");
        }
        return false;
      }

      const response = await fetch(`${FOC_ENGINE_API}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        if (__DEV__) {
          console.error("Token refresh failed:", response.status);
        }
        // Clear tokens if refresh fails
        await logout();
        return false;
      }

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken } = data;

      if (!accessToken) {
        if (__DEV__) {
          console.error("Invalid response from refresh endpoint");
        }
        await logout();
        return false;
      }

      // Update stored tokens
      await SecureStore.setItemAsync(JWT_STORAGE_KEY, accessToken);
      if (newRefreshToken) {
        await SecureStore.setItemAsync(
          REFRESH_TOKEN_STORAGE_KEY,
          newRefreshToken,
        );
      }

      setIsAuthenticated(true);

      if (__DEV__) {
        console.log("Successfully refreshed access token");
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error("Error refreshing access token:", error);
      }
      await logout();
      return false;
    }
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    try {
      let jwt = await SecureStore.getItemAsync(JWT_STORAGE_KEY);

      if (!jwt) {
        return {};
      }

      // Check if token is expired or expiring soon
      if (isTokenExpired(jwt)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          jwt = await SecureStore.getItemAsync(JWT_STORAGE_KEY);
        } else {
          return {};
        }
      }

      if (!jwt) {
        return {};
      }

      return {
        Authorization: `Bearer ${jwt}`,
      };
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting auth headers:", error);
      }
      return {};
    }
  }, [refreshAccessToken]);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(JWT_STORAGE_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
      setIsAuthenticated(false);
      if (__DEV__) {
        console.log("Logged out successfully");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error logging out:", error);
      }
    }
  }, []);

  const ensureAuthenticated = useCallback(async (): Promise<boolean> => {
    if (isAuthenticated) {
      const jwt = await SecureStore.getItemAsync(JWT_STORAGE_KEY);
      if (jwt && !isTokenExpired(jwt)) {
        return true;
      }
    }

    // Try to refresh
    return await refreshAccessToken();
  }, [isAuthenticated, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authenticateWithFingerprint,
        refreshAccessToken,
        getAuthHeaders,
        logout,
        ensureAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

