import { abi, unitsUtils } from "@vechain/sdk-core";
import { AllocationVoteCastAbi, getCommonAddresses } from "../constant";
import { XApp, getAllEvents, getApps } from ".";
import { ThorClient } from "@vechain/sdk-network";

const eventFragment = new abi.Event(AllocationVoteCastAbi);

export type DecodedCastVoteEvent = {
  voter: string;
  roundId: string;
  appsIds: string[];
  voteWeights: string[];
  formattedVoteWeights: string[];
};

export const filterAllocationVotes = async (
  thorClient: ThorClient,
  roundId?: number,
  voter?: string
) => {
  const { xAllocationVotingAddress } = getCommonAddresses(thorClient);
  const apps = await getApps(thorClient);
  const appsMapping: Record<string, XApp> = {};

  for (const app of apps) {
    appsMapping[app.id] = app;
  }
  const votingTopics = eventFragment.encodeFilterTopics([voter, roundId]);

  const eventLogs = await getAllEvents({
    thor: thorClient,
    criteriaSet: [
      {
        address: xAllocationVotingAddress,
        topic0: votingTopics[0],
        topic1: votingTopics[1],
        topic2: votingTopics[2],
        topic3: votingTopics[3],
        topic4: votingTopics[4],
      },
    ],
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
