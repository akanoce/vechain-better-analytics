import {
  cleanifyDailyContractAddress,
  greenCartContractAddress,
  mugshotNewContractAddress,
  mugshotOldContractAddress,
} from "./constant";
import { filterTransfers } from "./transfers";

/**
 *  Lookup all the dApp interactions for an address
 *  @param {string[]} address - Address to filter dApp interactions
 *
 */
export const lookupDappsInteractions = async (address: string) => {
  // promise all of all the addresses

  // filter all the transfers for each address

  const [
    mugshotOldTransfers,
    musghotNewTransfers,
    cleanifyTransfers,
    greencartTransfers,
  ] = await Promise.all([
    filterTransfers(mugshotOldContractAddress, address),
    filterTransfers(mugshotNewContractAddress, address),
    filterTransfers(cleanifyDailyContractAddress, address),
    filterTransfers(greenCartContractAddress, address),
  ]);

  const mugshotTransfers = {
    totalTransferred:
      mugshotOldTransfers.totalTransferred +
      musghotNewTransfers.totalTransferred,
    transfers: [
      ...mugshotOldTransfers.transfers,
      ...musghotNewTransfers.transfers,
    ],
    sortedTransfers: [
      ...mugshotOldTransfers.sortedTransfers,
      ...musghotNewTransfers.sortedTransfers,
    ],
  };

  return {
    mugshotTransfers,
    cleanifyTransfers,
    greencartTransfers,
  };
};
