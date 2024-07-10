import { transfersPrompt } from "./prompts/transferPrompt";
import { votesPrompt } from "./prompts/votesPrompt";
import { promptInsights } from "./prompts/common/promptInsights";
import { promptAppsInteractions } from "./prompts/common/promptAppsInteractions";

const { Select } = require("enquirer");

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
      await promptInsights();
      break;
    case "Generate XLS Apps interactions":
      await promptAppsInteractions();
      break;
  }
};

main();
