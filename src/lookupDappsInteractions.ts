import { ThorClient } from "@vechain/sdk-network";
import { getCommonAddresses } from "./constant";
import { filterTransfers, FilterTransfersReturnType } from "./transfers";

/**
 *  Lookup all the dApp interactions for an address
 *  @param {string[]} address - Address to filter dApp interactions
 *
 */
export const lookupDappsInteractions = async (
  thorClient: ThorClient,
  address: string
): Promise<Record<string, FilterTransfersReturnType>> => {
  // promise all of all the addresses

  // filter all the transfers for each address

  const { commonAddresses } = getCommonAddresses(thorClient);

  const transfers = await Promise.all(
    commonAddresses
      .map((comm) =>
        comm.contracts.map((contract) =>
          filterTransfers(thorClient, contract.address, address, comm.name)
        )
      )
      .flat()
  );

  // merge data based on keys and return

  // Map name: FilterTransfersReturnType => Cleanify: FilterTransfersReturnType
  let result: Record<string, FilterTransfersReturnType> = {};

  commonAddresses.forEach((comm, index) => {
    if (!result[comm.name]) {
      result[comm.name] = transfers[index];
    } else {
      result[comm.name].totalTransferred += transfers[index].totalTransferred;
      result[comm.name].transfers = [
        ...result[comm.name].transfers,
        ...transfers[index].transfers,
      ];
      result[comm.name].sortedTransfers = [
        ...result[comm.name].sortedTransfers,
        ...transfers[index].sortedTransfers,
      ];
    }
  });

  return result;
};
