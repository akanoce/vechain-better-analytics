import { getCommonAddresses } from "../constant";
import TestnetXAllocationVotingAbi from "../abis/testnet/XAllocationVoting.json";
import MainnetX2EarnApps from "../abis/mainnet/X2EarnAppsUpgradeable.json";
import { ThorClient } from "@vechain/sdk-network";
import { getNetworkTypeFromUrl } from "./thor";

export type XApp = {
  id: string;
  receiverAddress: string;
  name: string;
  createdAt: number;
};

export const getApps = async (thorClient: ThorClient) => {
  const { xAllocationVotingAddress, x2EarnAppsContractAddress } =
    getCommonAddresses(thorClient);

  const netType = getNetworkTypeFromUrl(thorClient.httpClient.baseURL);

  if (netType === "main") {
    const appsContract = thorClient.contracts.load(
      x2EarnAppsContractAddress,
      MainnetX2EarnApps.abi
    );
    const apps = (await appsContract.read.apps())[0];
    const parsedXApps: XApp[] = apps.map((app: any) => {
      return {
        id: app[0],
        receiverAddress: app[1],
        name: app[2],
        createdAt: app[3],
      };
    });
    return parsedXApps;
  } else {
    const xAllocationContract = thorClient.contracts.load(
      xAllocationVotingAddress,
      TestnetXAllocationVotingAbi.abi
    );
    const apps = (await xAllocationContract.read.getRoundApps())[0];
    const parsedXApps: XApp[] = apps.map((app: any) => {
      return {
        id: app[0],
        receiverAddress: app[1],
        name: app[2],
        createdAt: app[3],
      };
    });
    return parsedXApps;
  }
};
