import { HttpClient, ThorClient } from "@vechain/sdk-network";

const _testnetUrl = "https://testnet.vechain.org";
const testNetwork = new HttpClient(_testnetUrl);
export const thorClient = new ThorClient(testNetwork);
