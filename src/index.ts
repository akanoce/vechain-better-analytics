import yargs from "yargs/yargs";
import { filterTransfers } from "./transfers";
import { filterAllocationVotes } from "./allocationVoting";
import { generateInsights } from "./generateInsights";
import { resolveCommonAddresses } from "./utils/resolveCommonAddresses";

const argv = yargs(process.argv.slice(2))
  .options({
    transfers: { type: "boolean", demandOption: false },
    votes: { type: "boolean", demandOption: false },
    insights: { type: "boolean", demandOption: false },
    f: { type: "string", alias: "from" },
    t: { type: "string", alias: "to" },
    r: { type: "number", alias: "round" },
    v: { type: "string", alias: "voter" },
  })
  .parseSync();

console.log("Command executed with the following arguments:", argv);

const main = async () => {
  if (argv.transfers && argv.votes) {
    console.log(
      "Both transfers and votes flags are set, please choose only one"
    );
    process.exit();
  }

  if (argv.transfers) {
    console.log("Transfers flag is set");
    const from = resolveCommonAddresses(argv.f);
    const to = resolveCommonAddresses(argv.t);
    filterTransfers(from, to);
  }

  if (argv.insights) {
    console.log("Insights flag is set");
    generateInsights();
  }

  if (argv.votes) {
    console.log("Votes flag is set");
    const voter = resolveCommonAddresses(argv.v);
    const { totalVotesCasted, formattedDecoded, appsInsights } =
      await filterAllocationVotes(argv.r, voter);

    console.log("Total votes casted:", totalVotesCasted);
    console.log("Top 10 voters:", formattedDecoded.slice(0, 10));
    console.log("Apps Insights:", appsInsights);
  }
};

main();
