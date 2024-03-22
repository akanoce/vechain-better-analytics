import { abi, unitsUtils } from "@vechain/sdk-core";
import { HttpClient, ThorClient } from "@vechain/sdk-network";
import { xAllocationVotingAddress } from "./constant/addresses";
import { AllocationVoteCastAbi } from "./constant";

const _testnetUrl = "https://testnet.vechain.org";
const testNetwork = new HttpClient(_testnetUrl);
const thorClient = new ThorClient(testNetwork);

const eventFragment = new abi.Event(AllocationVoteCastAbi);

export const filterAllocationVotes = async (
  roundId: number,
  voter?: string
) => {
  const currentBlock = await thorClient.blocks.getBestBlockCompressed();
  const votingTopics = eventFragment.encodeFilterTopics([voter, roundId]);

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
      limit: 1024,
    },
    // Define criteria for filtering events
    criteriaSet: [
      {
        // Contract address to filter events
        address: xAllocationVotingAddress,
        // Event to filter
        // Topics to further narrow down the search
        topic0: votingTopics[0],
        topic1: votingTopics[1],
        topic2: votingTopics[2],
        topic3: votingTopics[3],
        topic4: votingTopics[4],
      },
    ],
    // Specify the order in which logs should be retrieved (ascending in this case)
    order: "asc",
  });

  console.log(`Event logs for round ${roundId}:`, eventLogs.length);

  const decoded = eventLogs.map((log) => {
    return eventFragment.decodeEventLog({ data: log.data, topics: log.topics });
  });

  type Decoded = {
    voter: string;
    roundId: string;
    appsIds: string[];
    voteWeights: string[];
    formattedVoteWeights: string[];
  };
  const mapDecoded: Decoded[] = decoded.map((log) => {
    return {
      voter: log.voter,
      roundId: log.roundId,
      appsIds: log.appsIds,
      voteWeights: log.voteWeights,
      formattedVoteWeights: log.voteWeights.map((weight: string) => {
        return unitsUtils.formatUnits(weight, 18);
      }),
    };
  });

  const totalVotesCasted = mapDecoded.reduce((acc, log) => {
    return (
      acc +
      log.formattedVoteWeights.reduce((acc, weight) => {
        return acc + parseFloat(weight);
      }, 0)
    );
  }, 0);

  const sortedVotes = mapDecoded.sort((a, b) => {
    return (
      b.formattedVoteWeights.reduce((acc, weight) => {
        return acc + parseFloat(weight);
      }, 0) -
      a.formattedVoteWeights.reduce((acc, weight) => {
        return acc + parseFloat(weight);
      }, 0)
    );
  });

  return { mapDecoded, sortedVotes, totalVotesCasted };
};
