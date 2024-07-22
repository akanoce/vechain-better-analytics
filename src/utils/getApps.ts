import { getCommonAddresses } from "../constant";
import XAllocationVotingAbi from "../abis/XAllocationVoting.json";
import { ThorClient } from "@vechain/sdk-network";

export type XApp = {
  id: string;
  receiverAddress: string;
  name: string;
  createdAt: number;
};

export const getApps = async (thorClient: ThorClient) => {
  const { xAllocationVotingAddress } = getCommonAddresses(thorClient);
  const xAllocationContract = thorClient.contracts.load(
    xAllocationVotingAddress,
    XAllocationVotingAbi.abi
  );

  const apps = (await xAllocationContract.read.getAllApps())[0];
  const parsedXApps: XApp[] = apps.map((app: any) => {
    return {
      id: app[0],
      receiverAddress: app[1],
      name: app[2],
      createdAt: app[3],
    };
  });
  return parsedXApps;
};
