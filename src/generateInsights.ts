import {
  DecodedCastVoteEvent,
  filterAllocationVotes,
} from "./allocationVoting";
import writeXlsxFile from "write-excel-file/node";
import { XApp, getApps, getCurrentRoundId } from "./utils";

const generateOverviewXlsData = async (
  addressesWithVotes: Record<string, Record<string, DecodedCastVoteEvent>>,
  rounds: number[]
) => {
  const headerRow = [
    {
      value: "Address",
      fontWeight: "bold",
    },
    {
      value: "Total Votes casted",
      fontWeight: "bold",
    },
    ...rounds.map((round) => ({
      value: `Round ${round} - Votes casted`,
      fontWeight: "bold",
    })),
  ];

  const rows = Object.keys(addressesWithVotes).map((address) => {
    const roundsVotes = Object.keys(addressesWithVotes[address]).map(
      (round) => ({
        type: Number,
        value: addressesWithVotes[address][round].formattedVoteWeights.reduce(
          (prev, curr) => Number(prev) + Number(curr),
          0
        ),
      })
    );
    const totalVotes = roundsVotes.reduce((prev, curr) => prev + curr.value, 0);
    return [
      {
        type: String,
        value: address,
      },
      { type: Number, value: totalVotes },
      ...roundsVotes,
    ];
  });

  const data = [headerRow, ...rows];
  return data;
};

const generateRoundXlsData = async (
  addressesWithVotes: Record<string, Record<string, DecodedCastVoteEvent>>,
  roundId: number,
  apps: XApp[]
) => {
  const headerRow = [
    {
      value: "Address",
      fontWeight: "bold",
    },
    ...apps.map((app) => ({
      value: app.name,
      fontWeight: "bold",
    })),
  ];

  const roundUserAppsVotes: { type: any; value: any }[][] = [];

  // for every user, get their votes for each round
  Object.keys(addressesWithVotes).forEach((address) => {
    const votes = addressesWithVotes[address];
    const roundVotes = votes[roundId];

    if (roundVotes) {
      const userAppsVotes = apps.map((app) => {
        const appVoteIndex = roundVotes.formattedVoteWeights.findIndex(
          (vote, index) => vote && app.id === roundVotes.appsIds[index]
        );
        const appVote = roundVotes.formattedVoteWeights[appVoteIndex];

        return {
          type: String,
          value: appVote,
        };
        // @ts-ignore
      });

      const newArray = [];

      roundUserAppsVotes.push([
        {
          type: String,
          value: address,
        },
        ...userAppsVotes,
      ]);
    } else {
      roundUserAppsVotes.push([
        {
          type: String,
          value: address,
        },
        ...apps.map((app) => ({
          type: Number,
          value: 0,
        })),
      ]);
    }
  });

  return [headerRow, ...roundUserAppsVotes];
};

const generateXlsFile = async (
  addressesWithVotes: Record<string, Record<string, DecodedCastVoteEvent>>,
  rounds: number[],
  apps: XApp[]
) => {
  const overViewData = await generateOverviewXlsData(
    addressesWithVotes,
    rounds
  );

  const roundsRows = [];
  for (const round of rounds) {
    const roundXlsData = await generateRoundXlsData(
      addressesWithVotes,
      round,
      apps
    );
    roundsRows.push({ round, data: roundXlsData });
  }
  const filePath = "./vebetterdao_insights.xlsx";

  await writeXlsxFile(
    //@ts-ignore
    [overViewData, ...roundsRows.map((round) => round.data)],
    {
      filePath,
      sheets: [
        "Overview",
        ...roundsRows.map((round) => `Round ${round.round}`),
      ],
    }
  );
};

export const generateInsights = async () => {
  const apps = await getApps();
  const currentRoundId = await getCurrentRoundId();
  const allRounds = Array.from(
    { length: Number(currentRoundId) },
    (_, i) => i + 1
  );
  console.log("allRounds", allRounds);
  console.log("currentRoundId", currentRoundId);
  console.log("apps", apps);

  //get all votes for each round concurrently and then process them
  const roundsVotes = await Promise.all(
    allRounds.map(async (roundId) => {
      const { mapDecoded: votes } = await filterAllocationVotes(roundId);
      return { roundId, votes };
    })
  );

  const addressesWithVotes: Record<
    string,
    Record<string, DecodedCastVoteEvent>
  > = {};

  for (const round of roundsVotes) {
    for (const vote of round.votes) {
      if (!addressesWithVotes[vote.voter]) {
        addressesWithVotes[vote.voter] = {};
      }

      addressesWithVotes[vote.voter][round.roundId] = vote;
    }
  }

  await generateXlsFile(addressesWithVotes, allRounds, apps);
};
