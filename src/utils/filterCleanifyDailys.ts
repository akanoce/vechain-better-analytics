import {
  CleanifyChallengeAddedEvent,
  cleanifyDailyContractAddress,
} from "../constant";
import { thorClient } from "./thor";
import { abi } from "@vechain/sdk-core";

const challengeAddedEvent = new abi.Event(CleanifyChallengeAddedEvent);

export const filterCleanifyDailys = async (address?: string) => {
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
