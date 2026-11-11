export const usesMockSessionStorage = (mockBuild: boolean, searchHasMock: boolean, injectedMock: boolean) =>
  mockBuild && (searchHasMock || injectedMock)
