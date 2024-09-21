import { ThorClient } from "@vechain/sdk-network";
import { getApps, getCurrentRoundId } from "../utils";
import { filterRewards, RewardDistributedEvent } from "../filterRewards";
import { filterRounds } from "../filterRounds";
import { filterTransfers } from "../transfers";
import { getCommonAddresses } from "../constant";
import { dexPoolAddresses } from "../constant/addresses/mainnet";
const { Select, Confirm } = require("enquirer");

/**
 *  This function is used to prompt the user for the transfer details and then call the filterTransfers function
 */
export const rewardsPrompt = async (thorClient: ThorClient) => {
  const commonAddresses = getCommonAddresses(thorClient).commonAddresses;

  const apps = await getApps(thorClient);

  console.log(apps);
  const whichApp = new Select({
    name: "whichApp",
    message: "Which app do you want to check?",
    choices: apps.map((app) => ({
      message: app.name,
      name: app.id,
    })),
  });

  const result = (await whichApp.run()) as string;

  const doYouWantRound = new Confirm({
    name: "doYouWantRound",
    message: "Do you want to filter by round?",
  });

  const round = await doYouWantRound.run();
  let fromBlock: number | undefined;
  let toBlock: number | undefined;
  if (round) {
    const currentRound = await getCurrentRoundId(thorClient);
    const roundEvents = await filterRounds(thorClient);
    const fromRoundPrompt = new Select({
      name: "round",
      message: "From which round?",
      choices: roundEvents.map((round) => ({
        message: round.roundId,
        name: round.roundId,
      })),
    });
    const fromRound = await fromRoundPrompt.run();
    fromBlock = Number(
      roundEvents.find((round) => round.roundId === fromRound)?.voteStart
    );
    const toRoundPrompt = new Select({
      name: "round",
      message: "To which round?",
      choices: roundEvents.map((round) => ({
        message: round.roundId,
        name: round.roundId,
      })),
    });
    const toRound = await toRoundPrompt.run();
    toBlock = Number(
      roundEvents.find((round) => round.roundId === toRound)?.voteEnd
    );
  }

  console.log("Filtering RewardDistributed events...");

  const notUsingDistributor = ["Oily", "Carboneers", "Vyvo"];
  let filterRewardsResult: RewardDistributedEvent[] = [];
  const relatedApp = apps.find((app) => app.id === result);
  if (!relatedApp) throw new Error("App not found");
  const completeApp = commonAddresses.find(
    (common) => common.name === relatedApp?.name
  );
  if (!completeApp) throw new Error("App not found");

  if (notUsingDistributor.includes(completeApp.name)) {
    console.log(
      "This app is not using distributor, indexing B3TR transfers from its contracts"
    );
    const contract = completeApp.contracts[0].address;
    const filteredTransfers = (await filterTransfers(thorClient, contract))
      .transfers;
    filterRewardsResult = filteredTransfers.map((transfer) => ({
      amount: transfer.formattedValue,
      appId: relatedApp.id,
      distributor: "0x0",
      meta: transfer.meta,
      proof: "",
      receiver: transfer.to,
    }));
  } else {
    filterRewardsResult = await filterRewards(
      thorClient,
      result,
      fromBlock,
      toBlock
    );
  }

  if (filterRewardsResult.length === 0) {
    console.log("No rewards found for this app");
    return;
  }

  console.log(filterRewardsResult.length, "events found - aggregating data");

  return await generateStats(thorClient, filterRewardsResult);
};

const generateStats = async (
  thorClient: ThorClient,
  rewardsEvent: Awaited<ReturnType<typeof filterRewards>>
) => {
  const addressesWithAmount = {} as Record<string, number>;
  let totalRewards = 0;
  rewardsEvent.forEach((event) => {
    if (addressesWithAmount[event.receiver]) {
      addressesWithAmount[event.receiver] += parseFloat(event.amount);
    } else {
      addressesWithAmount[event.receiver] = parseFloat(event.amount);
    }
    totalRewards += parseFloat(event.amount);
  });
  const AddressArray = Object.keys(addressesWithAmount);

  const sortedAddresses = AddressArray.toSorted(
    (a, b) => addressesWithAmount[b] - addressesWithAmount[a]
  );

  console.log("Total addresses rewarded:", AddressArray.length);
  console.log("Total rewards distributed:", totalRewards);
  console.log("\n");
  console.log("Top 10 addresses with rewards:");
  for (let i = 0; i < 10; i++) {
    console.log(
      `${sortedAddresses[i]}: ${addressesWithAmount[sortedAddresses[i]]}`
    );
  }

  renderPercentiles(totalRewards, addressesWithAmount, sortedAddresses);

  console.log("Looking for related addresses for the top 10 addresses...");

  const filteredSortedAddresses = new Set([...sortedAddresses]); // Use a Set to avoid duplicates
  const filteredAmounts = { ...addressesWithAmount };
  const toRemove = new Set<string>(); // A Set to collect addresses to remove

  for (const addr of filteredSortedAddresses) {
    // Skip if the address has already been marked for removal
    if (toRemove.has(addr)) continue;

    let relatedAddresses = new Set<string>();
    try {
      relatedAddresses = await findRelatedAddresses(
        thorClient,
        addr,
        AddressArray,
        dexPoolAddresses
      );
    } catch (e) {
      console.log(e);
    }

    const parsedRelated = [...relatedAddresses].filter(
      (address) => addr !== address && !toRemove.has(address)
    );

    console.log("related", parsedRelated);

    parsedRelated.forEach((related) => {
      if (!filteredAmounts[related]) return;
      filteredAmounts[addr] += filteredAmounts[related];

      // Mark the related addresses for removal
      toRemove.add(related);
      delete filteredAmounts[related]; // Remove the amount of the related address
    });

    console.log(
      `Address ${addr} has ${parsedRelated.length} related addresses with a total of ${filteredAmounts[addr]} rewards`
    );
  }

  // Remove the marked addresses after the iteration
  toRemove.forEach((related) => filteredSortedAddresses.delete(related));

  // After removing, sort the remaining addresses based on their filtered amounts
  const resortedArray = [...filteredSortedAddresses].toSorted(
    (a, b) => (filteredAmounts[b] || 0) - (filteredAmounts[a] || 0)
  );

  const addressReducedPercentage =
    (1 - resortedArray.length / AddressArray.length) * 100;

  console.log(
    `After removing related addresses, ${
      resortedArray.length
    } addresses remain (${addressReducedPercentage.toFixed(2)}% reduction)`
  );

  const newTotalRewards = resortedArray.reduce(
    (acc, address) => acc + (filteredAmounts[address] || 0),
    0
  );

  console.log(
    `Total rewards after removing related addresses: ${newTotalRewards} (${
      (newTotalRewards / totalRewards) * 100
    }%)`
  );

  renderPercentiles(newTotalRewards, filteredAmounts, resortedArray);
};

const renderPercentiles = (
  totalRewards: number,
  addressesWithAmount: Record<string, number>,
  addresses: string[]
) => {
  const PercentileArray = [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99];
  console.log("\n");
  for (const element of PercentileArray) {
    let totalRewardsPercentile = 0;
    let j = 0;
    while (totalRewardsPercentile < totalRewards * element) {
      totalRewardsPercentile += addressesWithAmount[addresses[j]];
      j++;
    }
    console.log(
      `${j} addresses (${((j / addresses.length) * 100).toFixed(2)}%) got ${
        element * 100
      }% of the rewards:`,
      "Total rewards needed:",
      totalRewardsPercentile
    );
  }
};

// Return the set of addresses that sent tokens to the given address
const findRelatedAddresses = async (
  thorClient: ThorClient,
  address: string,
  addresses: string[],
  ignoreAddresses: string[],
  visited = new Set<string>()
): Promise<Set<string>> => {
  // If the address has already been visited, return an empty set to avoid cycles.
  if (visited.has(address)) {
    return new Set<string>();
  }
  if (ignoreAddresses.includes(address)) {
    console.log(`Ignoring DEX ${address}`);
    return new Set<string>();
  }

  // Mark the current address as visited
  visited.add(address);

  const toAddress = await filterTransfers(thorClient, undefined, address);
  const fromAddress = await filterTransfers(thorClient, address);
  let relatedAddresses = new Set<string>();

  const uniqueAddressesFromTo = new Set([
    ...toAddress.uniqueAddressesFrom,
    ...fromAddress.uniqueAddressesTo,
  ]);

  const addressesToFilter = [address, ...ignoreAddresses];

  [...uniqueAddressesFromTo]
    .filter((addr) => addresses.includes(addr))
    .forEach(
      (addr) => !addressesToFilter.includes(addr) && relatedAddresses.add(addr)
    );

  // Recursively find related addresses for each newly found address
  for (const addr of relatedAddresses) {
    const newRelated = await findRelatedAddresses(
      thorClient,
      addr,
      addresses,
      ignoreAddresses,
      visited
    );
    newRelated.forEach((newAddr) => relatedAddresses.add(newAddr));
  }

  return relatedAddresses;
};
