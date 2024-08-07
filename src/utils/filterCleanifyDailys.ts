import { ThorClient } from "@vechain/sdk-network";
import { CleanifyChallengeAddedEvent, getCommonAddresses } from "../constant";
import { abi } from "@vechain/sdk-core";
import { getAllEvents } from "./getEvents";

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

  const transferTopics = challengeAddedEvent.encodeFilterTopics([
    undefined,
    address,
  ]);

  const eventLogs = await getAllEvents({
    thor: thorClient,
    criteriaSet: [
      {
        address: cleanifyDailyContractAddress,
        topic0: transferTopics[0],
        topic1: transferTopics[1],
        topic2: transferTopics[2],
        topic3: transferTopics[3],
        topic4: transferTopics[4],
      },
    ],
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
