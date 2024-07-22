import { transfersPrompt } from "./prompts/transferPrompt";
import { votesPrompt } from "./prompts/votesPrompt";
import { promptInsights } from "./prompts/common/promptInsights";
import { promptAppsInteractions } from "./prompts/common/promptAppsInteractions";
import { ThorClient } from "@vechain/sdk-network";
import { mainNetwork, testNetwork } from "./utils";

const { Select } = require("enquirer");

const main = async () => {
  const networkPrompt = new Select({
    name: "network",
    message: "Which network do you want to use?",
    choices: ["Mainnet", "Testnet"],
  });

  const network = await networkPrompt.run();

  const net = network === "Mainnet" ? mainNetwork : testNetwork;

  console.log(`Using ${net.baseURL} network`);

  const thorClient = new ThorClient(net);

  const actionPrompt = new Select({
    name: "mainChoice",
    message: "What do you want to do?",
    choices: [
      "Analyse transfers",
      "Analyse votes",
      "Generate XLS DAO insights",
      "Generate XLS Apps interactions",
    ],
  });

  const action = await actionPrompt.run();

  switch (action) {
    case "Analyse transfers":
      await transfersPrompt(thorClient);
      break;
    case "Analyse votes":
      await votesPrompt(thorClient);
      break;
    case "Generate XLS DAO insights":
      await promptInsights(thorClient);
      break;
    case "Generate XLS Apps interactions":
      await promptAppsInteractions(thorClient);
      break;
  }
};

main();
