import { abi, unitsUtils } from "@vechain/sdk-core";
import { RewardDistributedAbi } from "./constant";
import { EventLogs, ThorClient } from "@vechain/sdk-network";
import { getAllEvents } from "./utils";
import { x2EarnRewardsPoolAddress } from "./constant/addresses/mainnet";

const rewardDistributedEvent = new abi.Event(RewardDistributedAbi);

export type RewardDistributedEvent = {
  amount: string;
  appId: string;
  receiver: string;
  proof: string;
  distributor: string;
  meta: EventLogs["meta"];
};
export const filterRewards = async (
  thorClient: ThorClient,
  appId?: string,
  fromBlock?: number,
  toBlock?: number
): Promise<RewardDistributedEvent[]> => {
  const rewardDitributedTopics = rewardDistributedEvent.encodeFilterTopics([
    ...(appId ? [appId] : []),
  ]);

  const eventLogs = await getAllEvents({
    thor: thorClient,
    from: fromBlock,
    to: toBlock,
    criteriaSet: [
      {
        address: x2EarnRewardsPoolAddress,
        topic0: rewardDitributedTopics[0],
        topic1: rewardDitributedTopics[1],
        topic2: rewardDitributedTopics[2],
        topic3: rewardDitributedTopics[3],
        topic4: rewardDitributedTopics[4],
      },
    ],
    order: "asc",
  });

  let decodeErrors = 0;
  const decoded = eventLogs.map((log) => {
    try {
      const decoded = rewardDistributedEvent.decodeEventLog({
        data: log.data,
        topics: log.topics,
      });
      // console.log("decoded", decoded);
      // console.log("decoded", decoded);
      return {
        amount: unitsUtils.formatUnits(decoded[0], 18),
        appId: decoded[1],
        receiver: decoded[2],
        proof: decoded[3],
        distributor: decoded[4],
        meta: log.meta,
      };
    } catch (e) {
      console.log("error", e);
      decodeErrors++;
      return {
        amount: "0",
        appId: "0x0",
        receiver: "0x0",
        proof: "0x0",
        distributor: "0x0",
        meta: { blockID: "0x0", blockNumber: 0, txID: "0x0" } as any,
      };
    }
  });

  console.log("decodeErrors", decodeErrors);

  return decoded;
};
