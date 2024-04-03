import yargs from "yargs/yargs";
import { filterTransfers } from "./transfers";
import { filterAllocationVotes } from "./allocationVoting";
import { generateInsights } from "./generateInsights";

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
    filterTransfers(argv.f, argv.t);
  }

  if (argv.insights) {
    console.log("Insights flag is set");
    generateInsights();
  }

  if (argv.votes) {
    console.log("Votes flag is set");
    const { totalVotesCasted, formattedDecoded, appsInsights } =
      await filterAllocationVotes(argv.r, argv.v);
    console.log("Total votes casted:", totalVotesCasted);
    console.log("Top 10 voters:", formattedDecoded.slice(0, 10));
    console.log("Apps Insights:", appsInsights);
  }
};

main();
