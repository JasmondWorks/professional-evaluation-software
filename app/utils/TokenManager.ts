let inMemoryAccessToken: string | null = null;

export const TokenManager = {
  getToken: () => inMemoryAccessToken,
  setToken: (token: string | null) => {
    inMemoryAccessToken = token;
  },
  clearToken: () => {
    inMemoryAccessToken = null;
  }
};
