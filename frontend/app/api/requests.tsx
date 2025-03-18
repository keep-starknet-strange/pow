export const focFunUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://api.foc.fun';
export const useMock = (process.env.EXPO_PUBLIC_USE_MOCK === undefined || process.env.EXPO_PUBLIC_USE_MOCK === '' || process.env.EXPO_PUBLIC_USE_MOCK === 'true');

export const fetchWrapper = async (url: string, options = {}) => {
  const controller = new AbortController();
  const signal = controller.signal;
  try {
    const response = await fetch(`${focFunUrl}/${url}`, {
      mode: 'cors',
      signal,
      ...options
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
    status: 200
  };
}
