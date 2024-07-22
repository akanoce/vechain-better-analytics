import { getCurrentRoundId } from "../utils";
import { promptAddress } from "./common/promptAddress";
import { filterAllocationVotes } from "../utils/filterAllocationVotes";
import { promptRoundId } from "./common/promptRoundId";
import Table from "cli-table3";
import { ThorClient } from "@vechain/sdk-network";

const { Select } = require("enquirer");

/**
 *  This function is used to prompt the user for for a specific round and for a specific user, in order to generate statistics about the votes
 */
export const votesPrompt = async (thorClient: ThorClient) => {
  const currentRound = await getCurrentRoundId(thorClient);
  const rounds = Array.from(
    { length: Number(currentRound) },
    (_, i) => i + 1
  ).sort((a, b) => b - a);

  const whatPrompt = new Select({
    name: "whichRound",
    message: "What are you looking for?",
    choices: [
      {
        message: "Voting round insights",
        name: "votingRound",
      },
      {
        message: "Apps insights",
        name: "appVotes",
      },
      {
        message: "Voter insights",
        name: "voterVotes",
      },
    ],
  });

  const what = await whatPrompt.run();

  if (what === "votingRound") {
    const roundId = await promptRoundId(rounds);
    const { totalVotesCasted, formattedDecoded, appsInsights } =
      await filterAllocationVotes(roundId);

    console.log("Top 10 voters:", formattedDecoded.slice(0, 10));
    console.log("Total votes casted:", totalVotesCasted);
    console.log(
      "Average votes per voter:",
      totalVotesCasted / formattedDecoded.length
    );
    console.log("Apps Insights:", appsInsights);
  }

  if (what === "appVotes") {
    const roundId = await promptRoundId(rounds);
    const { appsInsights } = await filterAllocationVotes(roundId);
    console.log("Apps insights:", "\n ------- ");
    console.log(generateAppInsightsTable(appsInsights));
  }

  if (what === "voterVotes") {
    const roundId = await promptRoundId(rounds, currentRound);
    const voter = await promptAddress(
      thorClient,
      "Looking for a specific voter?"
    );

    const { sortedVotes, totalVotesCasted } = await filterAllocationVotes(
      thorClient,
      roundId,
      voter
    );

    console.log("Total votes casted:", totalVotesCasted);
    console.log("\n ------- ");
    console.log("Votes:", sortedVotes);
  }
};

const generateAppInsightsTable = (
  appsInsights: Awaited<
    ReturnType<typeof filterAllocationVotes>
  >["appsInsights"]
) => {
  const table = new Table({
    head: ["Name", "TotalVotes", "Voters", "PreferredByVoters"],
  });

  for (const app of appsInsights) {
    table.push([
      app.name,
      `${app.totalVotes} (${app.totalVotesPercentage}%)`,
      `${app.numberOfVoters} (${app.numberOfVotersPercentage}%)`,
      `${app.numberOfPreferredVotesPercentage} (${app.numberOfPreferredVotesPercentage}%)`,
    ]);
  }

  return table.toString();
};
