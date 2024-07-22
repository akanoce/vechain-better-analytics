import { HttpClient } from "@vechain/sdk-network";

export const testnetUrl = "https://testnet.vechain.org";
export const testNetwork = new HttpClient(testnetUrl);

export const mainnetUrl = "https://mainnet.vechain.org";
export const mainNetwork = new HttpClient(mainnetUrl);

export const urlToNetworkType = {
  [testnetUrl]: "test",
  [mainnetUrl]: "main",
};

export const networkTypeToUrl = {
  main: mainnetUrl,
  test: testnetUrl,
};

export const getNetworkTypeFromUrl = (url: string) => {
  const networkType = urlToNetworkType[url as keyof typeof urlToNetworkType] as
    | "main"
    | "test";
  if (networkType === undefined) {
    throw new Error("Invalid network type");
  }
  return networkType;
};
