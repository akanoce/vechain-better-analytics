import yargs from "yargs/yargs";
import { filterTransfers } from "./transfers";
import { filterAllocationVotes } from "./allocationVoting";
import { generateInsights } from "./generateInsights";
import { resolveCommonAddresses } from "./utils/resolveCommonAddresses";
import { lookupDappsInteractions } from "./lookupDappsInteractions";

const argv = yargs(process.argv.slice(2))
  .options({
    transfers: { type: "boolean", demandOption: false },
    votes: { type: "boolean", demandOption: false },
    insights: { type: "boolean", demandOption: false },
    dappInteractions: { type: "boolean", demandOption: false },
    f: { type: "string", alias: "from" },
    t: { type: "string", alias: "to" },
    r: { type: "number", alias: "round" },
    v: { type: "string", alias: "voter" },
    a: { type: "string", alias: "address" },
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
    const { totalTransferred, sortedTransfers } = await filterTransfers(
      from,
      to
    );

    console.log("Total transferred:", totalTransferred);
    console.log("Top 10 transfers:", sortedTransfers.slice(0, 10));
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

  if (argv.dappInteractions) {
    console.log("dappInteractions flag is set");
    if (!argv.a?.length)
      throw new Error("Please provide an address to filter dapp interactions");

    const {
      mugshotTransfers,
      cleanifyTransfers,
      cleanifyNewDailyEvents,
      greencartTransfers,
      greenAmbassadorTransfers,
    } = await lookupDappsInteractions(argv.a);

    console.log({
      mugshot: {
        transfers: mugshotTransfers.transfers.length,
        totalTransferred: mugshotTransfers.totalTransferred,
      },
      cleanify: {
        transfers: cleanifyTransfers.transfers.length,
        totalTransferred: cleanifyTransfers.totalTransferred,
        dailys: cleanifyNewDailyEvents.length,
      },
      greencart: {
        transfers: greencartTransfers.transfers.length,
        totalTransferred: greencartTransfers.totalTransferred,
      },
      greenAmbassador: {
        transfers: greenAmbassadorTransfers.transfers.length,
        totalTransferred: greenAmbassadorTransfers.totalTransferred,
      },
    });
  }
};

main();
