import { getCommonAddresses } from "../constant";
import XAllocationVotingAbi from "../abis/XAllocationVoting.json";
import { ThorClient } from "@vechain/sdk-network";

export const getCurrentRoundId = async (thorClient: ThorClient) => {
  const { xAllocationVotingAddress } = getCommonAddresses(thorClient);

  const xAllocationContract = thorClient.contracts.load(
    xAllocationVotingAddress,
    XAllocationVotingAbi.abi
  );

  const currentRoundId = (
    await xAllocationContract.read.currentRoundId()
  )[0] as BigInt;
  return currentRoundId.toString();
};
