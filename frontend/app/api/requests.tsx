export const focFunUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://api.foc.fun";
export const useMock =
  process.env.EXPO_PUBLIC_USE_MOCK === undefined ||
  process.env.EXPO_PUBLIC_USE_MOCK === "" ||
  process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const fetchWrapper = async (url: string, options = {}) => {
  const controller = new AbortController();
  const signal = controller.signal;
  try {
    const response = await fetch(`${focFunUrl}/${url}`, {
      mode: "cors",
      signal,
      ...options,
    });
    if (!response.ok) {
      console.log(`Failed to fetch ${url}, got response:`, response);
      throw new Error(`Failed to fetch ${url} with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.log(`Error while fetching ${url}:`, err);
    throw err; // Re-throw the error for further handling if needed
  } finally {
    controller.abort(); // Ensure the request is aborted after completion or error
  }
};

export const mockResponse = (data: any) => {
  return {
    data,
    status: 200,
  };
};

/**
 * Validates sealed result with backend and retrieves suspect score
 * @param sealedResult Base64 encoded sealed result from Fingerprint SDK
 * @param requestId Optional request ID for fallback
 * @returns Suspect score response with validation status
 */
export const validateSealedResult = async (
  sealedResult: string,
  requestId?: string,
): Promise<{
  suspectScore: number;
  isValid: boolean;
  visitorId?: string;
  requestId?: string;
  error?: string;
}> => {
  if (useMock) {
    // Mock response for development
    return {
      suspectScore: 0.1,
      isValid: true,
      visitorId: "mock_visitor_id",
      requestId: requestId || "mock_request_id",
    };
  }

  try {
    const response = await fetchWrapper("api/fingerprint/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sealedResult,
        requestId,
      }),
    });

    return {
      suspectScore: response.suspectScore ?? 0,
      isValid: response.isValid ?? false,
      visitorId: response.visitorId,
      requestId: response.requestId,
      error: response.error,
    };
  } catch (err: any) {
    if (__DEV__) {
      console.error("Error validating sealed result:", err);
    }
    return {
      suspectScore: 1.0, // Default to suspicious on error
      isValid: false,
      error: err?.message || "Failed to validate sealed result",
    };
  }
};

/**
 * Authenticates device with FOC engine using fingerprint data
 * @param sealedResult Base64 encoded sealed result from Fingerprint SDK
 * @param requestId Optional request ID for fallback
 * @returns Authentication response with access token and refresh token
 */
export const authenticateDevice = async (
  sealedResult: string,
  requestId?: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
} | null> => {
  const focEngineApi =
    process.env.EXPO_PUBLIC_FOC_ENGINE_API || "http://localhost:8080";

  try {
    const response = await fetch(`${focEngineApi}/auth/verify-device`, {
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
        console.error("Device authentication failed:", {
          status: response.status,
          error: errorData,
        });
      }
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  } catch (err: any) {
    if (__DEV__) {
      console.error("Error authenticating device:", err);
    }
    return null;
  }
};
