import { getNetworkTypeFromUrl } from "../../utils";
import {
  b3trContractAddress,
  b3trTreasuryAddress,
  commonAddressesWithNameMapping,
  voterRewardsAddress,
  xAllocationVotingAddress,
} from "./mainnet";
import {
  testnetB3trContractAddress,
  testnetB3trTreasuryAddress,
  testnetCommonAddressesWithNameMapping,
  testnetVoterRewardsAddress,
  testnetXAllocationVotingAddress,
} from "./testnet";
import { ThorClient } from "@vechain/sdk-network";

export const getCommonAddresses = (thorClient: ThorClient) => {
  const netType = getNetworkTypeFromUrl(thorClient.httpClient.baseURL);

  if (netType === "main")
    return {
      b3trTreasuryAddress: b3trTreasuryAddress,
      b3trContractAddress: b3trContractAddress,
      xAllocationVotingAddress: xAllocationVotingAddress,
      voterRewardsAddress: voterRewardsAddress,
      commonAddresses: commonAddressesWithNameMapping,
    };

  return {
    b3trTreasuryAddress: testnetB3trTreasuryAddress,
    b3trContractAddress: testnetB3trContractAddress,
    xAllocationVotingAddress: testnetXAllocationVotingAddress,
    voterRewardsAddress: testnetVoterRewardsAddress,
    commonAddresses: testnetCommonAddressesWithNameMapping,
  };
};
