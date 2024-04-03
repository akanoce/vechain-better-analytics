import { xAllocationVotingAddress } from "../constant";
import { thorClient } from "./thor";
import XAllocationVotingAbi from "../abis/XAllocationVoting.json";

export type XApp = {
  id: string;
  receiverAddress: string;
  name: string;
  createdAt: number;
};

const xAllocationContract = thorClient.contracts.load(
  xAllocationVotingAddress,
  XAllocationVotingAbi.abi
);

export const getApps = async () => {
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
