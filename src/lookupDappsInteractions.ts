import {
  cleanifyDailyContractAddress,
  greenAmbassadorAddress,
  greenCartContractAddress,
  mugshotNewContractAddress,
  mugshotOldContractAddress,
} from "./constant";
import { filterTransfers } from "./transfers";
import { filterCleanifyDailys } from "./utils/filterCleanifyDailys";

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
    cleanifyNewDailyEvents,
    greencartTransfers,
    greenAmbassadorTransfers,
  ] = await Promise.all([
    filterTransfers(mugshotOldContractAddress, address),
    filterTransfers(mugshotNewContractAddress, address),
    filterTransfers(cleanifyDailyContractAddress, address),
    filterCleanifyDailys(address),
    filterTransfers(greenCartContractAddress, address),
    filterTransfers(greenAmbassadorAddress, address),
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
    cleanifyNewDailyEvents,
    greencartTransfers,
    greenAmbassadorTransfers,
  };
};
