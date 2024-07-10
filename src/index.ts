import yargs from "yargs/yargs";
import { filterTransfers } from "./transfers";
import { filterAllocationVotes } from "./utils/filterAllocationVotes";
import { generateInsights } from "./generateInsights";
import { resolveCommonAddresses } from "./utils/resolveCommonAddresses";
import { generateStreakXls } from "./utils/generateStreakXls";
import { transfersPrompt } from "./prompts/transferPrompt";
import { votesPrompt } from "./prompts/votesPrompt";

const { Select } = require("enquirer");

// const argv = yargs(process.argv.slice(2))
//   .options({
//     transfers: { type: "boolean", demandOption: false },
//     votes: { type: "boolean", demandOption: false },
//     insights: { type: "boolean", demandOption: false },
//     dappInteractions: { type: "boolean", demandOption: false },
//     f: { type: "string", alias: "from" },
//     t: { type: "string", alias: "to" },
//     r: { type: "number", alias: "round" },
//     v: { type: "string", alias: "voter" },
//     a: { type: "string", alias: "address", number: false, array: true },
//   })
//   .parseSync();

// console.log("Command executed with the following arguments:", argv);

const main = async () => {
  const prompt = new Select({
    name: "mainChoice",
    message: "What do you want to do?",
    choices: [
      "Analyse transfers",
      "Analyse votes",
      "Generate XLS DAO insights",
      "Generate XLS Apps interactions",
    ],
  });

  const response = await prompt.run();

  switch (response) {
    case "Analyse transfers":
      await transfersPrompt();
      break;
    case "Analyse votes":
      await votesPrompt();
      break;
    case "Generate XLS DAO insights":
      throw new Error("Not implemented yet");
      break;
    case "Generate XLS Apps interactions":
      throw new Error("Not implemented yet");
      break;
  }

  //   if (argv.insights) {
  //     console.log("Insights flag is set");
  //     generateInsights();
  //   }

  //   if (argv.votes) {
  //     console.log("Votes flag is set");
  //     const voter = resolveCommonAddresses(argv.v);
  //     const { totalVotesCasted, formattedDecoded, appsInsights } =
  //       await filterAllocationVotes(argv.r, voter);

  //     console.log("Total votes casted:", totalVotesCasted);
  //     console.log("Top 10 voters:", formattedDecoded.slice(0, 10));
  //     console.log("Apps Insights:", appsInsights);
  //   }

  //   if (argv.dappInteractions) {
  //     console.log("dappInteractions flag is set");
  //     if (!argv.a?.length)
  //       throw new Error("Please provide an address to filter dapp interactions");

  //     const addresses = argv.a.map((address) => address.toString());
  //     await generateStreakXls(addresses);
  //   }
};

main();
