import { abi, unitsUtils } from "@vechain/sdk-core";
import { xAllocationVotingAddress } from "./constant/addresses";
import { AllocationVoteCastAbi } from "./constant";
import { XApp, getApps, thorClient } from "./utils";

const eventFragment = new abi.Event(AllocationVoteCastAbi);

export type DecodedCastVoteEvent = {
  voter: string;
  roundId: string;
  appsIds: string[];
  voteWeights: string[];
  formattedVoteWeights: string[];
};

export const filterAllocationVotes = async (
  roundId?: number,
  voter?: string
) => {
  const apps = await getApps();
  const appsMapping: Record<string, XApp> = {};

  for (const app of apps) {
    appsMapping[app.id] = app;
  }
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

  const mapDecoded: DecodedCastVoteEvent[] = decoded.map((log) => {
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

  const sortedVotes = mapDecoded.toSorted((a, b) => {
    return (
      b.formattedVoteWeights.reduce((acc, weight) => {
        return acc + parseFloat(weight);
      }, 0) -
      a.formattedVoteWeights.reduce((acc, weight) => {
        return acc + parseFloat(weight);
      }, 0)
    );
  });

  const formattedDecoded = sortedVotes.map((log) => {
    const votesMap: Record<string, string> = {};
    log.appsIds.forEach((appId, index) => {
      const appName = appsMapping[appId].name;
      votesMap[appName] = log.formattedVoteWeights[index];
    });
    return {
      voter: log.voter,
      roundId: log.roundId,
      votes: votesMap,
    };
  });

  const appsInsights = apps.map((app) => {
    const appVotes = formattedDecoded.reduce((acc, log) => {
      return acc + (log.votes[app.name] ? parseFloat(log.votes[app.name]) : 0);
    }, 0);
    const numberOfVoters = formattedDecoded.filter((log) => {
      return !!log.votes[app.name] && log.votes[app.name] !== "0.0";
    }).length;
    const numberOfPreferredVotes = formattedDecoded.filter((log) => {
      const appVote = log.votes[app.name];
      return Object.keys(log.votes).every((key) => {
        return Number(appVote) >= Number(log.votes[key]);
      });
    }).length;
    return {
      name: app.name,
      totalVotes: appVotes,
      totalVotesPercentage: ((appVotes / totalVotesCasted) * 100).toFixed(2),
      numberOfVoters,
      numberOfVotersPercentage: (
        (numberOfVoters / formattedDecoded.length) *
        100
      ).toFixed(2),
      numberOfPreferredVotes,
      numberOfPreferredVotesPercentage: (
        (numberOfPreferredVotes / formattedDecoded.length) *
        100
      ).toFixed(2),
    };
  });

  return {
    mapDecoded,
    formattedDecoded,
    sortedVotes,
    totalVotesCasted,
    appsInsights,
  };
};
