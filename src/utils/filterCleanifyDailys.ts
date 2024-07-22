import { ThorClient } from "@vechain/sdk-network";
import { CleanifyChallengeAddedEvent, getCommonAddresses } from "../constant";
import { abi } from "@vechain/sdk-core";

const challengeAddedEvent = new abi.Event(CleanifyChallengeAddedEvent);

export const filterCleanifyDailys = async (
  thorClient: ThorClient,
  address?: string
) => {
  const { commonAddresses } = getCommonAddresses(thorClient);

  const cleanifyApp = commonAddresses.find((comm) => comm.name === "Cleanify");
  if (!cleanifyApp) throw new Error("Cleanify app not found");
  const cleanifyDailyContractAddress = cleanifyApp.contracts.find(
    (contract) => contract.name === "CleanifyDaily"
  )?.address;
  if (!cleanifyDailyContractAddress)
    throw new Error("Cleanify Daily contract not found");
  const currentBlock = await thorClient.blocks.getBestBlockCompressed();

  const transferTopics = challengeAddedEvent.encodeFilterTopics([
    undefined,
    address,
  ]);

  const eventLogs = await thorClient.logs.filterEventLogs({
    // Specify the range of blocks to search for events
    range: {
      unit: "block",
      from: 0,
      to: currentBlock?.number,
    },
    // Additional options for the query, such as offset and limit
    options: {
      offset: 0,
      limit: 100000,
    },
    // Define criteria for filtering events
    criteriaSet: [
      {
        // Contract address to filter events
        address: cleanifyDailyContractAddress,
        // Event to filter
        // Topics to further narrow down the search
        topic0: transferTopics[0],
        topic1: transferTopics[1],
        topic2: transferTopics[2],
        topic3: transferTopics[3],
        topic4: transferTopics[4],
      },
    ],
    // Specify the order in which logs should be retrieved (ascending in this case)
    order: "asc",
  });

  //   console.log("Event logs:", eventLogs.length);

  const decoded = eventLogs.map((log) => {
    const decoded = challengeAddedEvent.decodeEventLog({
      data: log.data,
      topics: log.topics,
    });
    return {
      challengeId: decoded._challengeId,
      user: decoded._user,
      meta: log.meta,
    };
  });

  return decoded;
};
