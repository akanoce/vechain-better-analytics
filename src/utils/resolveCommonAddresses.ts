import {
  b3trTreasuryAddress,
  cleanifyCampaignsContractAddress,
  cleanifyDailyContractAddress,
  cleanifyTreasuryAddress,
  mugshotNewContractAddress,
  mugshotTreasuryAddress,
  vyvoTreasuryAddress,
} from "../constant";

/**
 *  Resolve common names to addresses
 * @param name  The name of the address to resolve
 * @returns   The resolved address
 */
export const resolveCommonAddresses = (nameOrAddress?: string) => {
  switch (nameOrAddress) {
    case "mugshot_treasury":
      return mugshotTreasuryAddress;
    case "mugshot_contract":
      return mugshotNewContractAddress;
    case "cleanify_treasury":
      return cleanifyTreasuryAddress;
    case "cleanify_campaigns":
      return cleanifyCampaignsContractAddress;
    case "cleanify_daily":
      return cleanifyDailyContractAddress;
    case "vyvo_treasury":
      return vyvoTreasuryAddress;
    case "treasury":
      return b3trTreasuryAddress;
    default:
      return nameOrAddress;
  }
};
