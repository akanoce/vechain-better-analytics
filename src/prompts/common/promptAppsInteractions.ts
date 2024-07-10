import { promptAddress } from "./promptAddress";
import { generateStreakXls } from "../../utils/generateStreakXls";
const { Toggle, Input } = require("enquirer");

/**
 * Prompt the user to select an user to generate insights about the apps interactions
 *
 */
export const promptAppsInteractions = async () => {
  const addresses = [];
  let askForMore = true;
  while (askForMore) {
    const address = await promptAddress(
      "Enter the address",
      "custom",
      false,
      true
    );
    if (!address) continue;
    addresses.push(address);

    const promptMore = new Toggle({
      message: "Do you want to add another address?",
      enabled: "Yes",
      disabled: "No",
    });
    const responseMore = await promptMore.run();
    askForMore = responseMore;
  }

  const filePathprompt = new Input({
    message: "Enter the file path for the XLS file",
    initial: "./streak.xlsx",
  });
  const filePath = await filePathprompt.run();

  await generateStreakXls(addresses, filePath);
};
