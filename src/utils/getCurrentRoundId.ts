import { xAllocationVotingAddress } from "../constant";
import { thorClient } from "./thor";
import XAllocationVotingAbi from "../abis/XAllocationVoting.json";

const xAllocationContract = thorClient.contracts.load(
  xAllocationVotingAddress,
  XAllocationVotingAbi.abi
);

export const getCurrentRoundId = async () => {
  const currentRoundId = (await xAllocationContract.read.currentRoundId())[0];
  return currentRoundId;
};
