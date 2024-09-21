import { abi } from "@vechain/sdk-core";
import { RoundCreatedAbi } from "./constant";
import { ThorClient } from "@vechain/sdk-network";
import { getAllEvents } from "./utils";
import { xAllocationVotingAddress } from "./constant/addresses/mainnet";

const roundCreatedEvent = new abi.Event(RoundCreatedAbi);

export type RoundCreated = {
  roundId: string;
  proposer: string;
  voteStart: string;
  voteEnd: string;
  appsIds: string[];
};
export const filterRounds = async (
  thorClient: ThorClient
): Promise<RoundCreated[]> => {
  const roundCreatedTopics = roundCreatedEvent.encodeFilterTopics([]);

  const eventLogs = await getAllEvents({
    thor: thorClient,
    criteriaSet: [
      {
        address: xAllocationVotingAddress,
        topic0: roundCreatedTopics[0],
        topic1: roundCreatedTopics[1],
        topic2: roundCreatedTopics[2],
        topic3: roundCreatedTopics[3],
        topic4: roundCreatedTopics[4],
      },
    ],
    order: "asc",
  });

  const decoded = eventLogs.map((log) => {
    try {
      const decoded = roundCreatedEvent.decodeEventLog({
        data: log.data,
        topics: log.topics,
      });
      return {
        roundId: decoded[0],
        proposer: decoded[1],
        voteStart: decoded[2],
        voteEnd: decoded[3],
        appsIds: decoded[4],
        meta: log.meta,
      };
    } catch (e) {
      console.log("error", e);
      return {
        roundId: "error",
        proposer: "error",
        voteStart: "error",
        voteEnd: "error",
        appsIds: ["error"],
        meta: log.meta,
      };
    }
  });

  return decoded;
};
