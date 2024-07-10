import { filterTransfers } from "../transfers";
import { promptAddress } from "./common/promptAddress";
const { Select } = require("enquirer");

/**
 *  This function is used to prompt the user for the transfer details and then call the filterTransfers function
 */
export const transfersPrompt = async () => {
  const fromAddress = await promptAddress("From who?");
  const toAddress = await promptAddress("To who?");

  const whatToSeePrompt = new Select({
    name: "whatToSee",
    message: "What do you want to see?",
    choices: [
      { message: "Statistics", name: "stats" },
      { message: "All transfers", name: "all" },
    ],
  });

  const result = await whatToSeePrompt.run();

  const filterTransfersResult = await filterTransfers(fromAddress, toAddress);

  if (result === "stats") return generateStats(filterTransfersResult);

  console.log("All transfers:", filterTransfersResult.sortedTransfers);
  console.log("\n ------------------- \n");
  console.log(
    "Top 10 transfers:",
    filterTransfersResult.sortedTransfers.slice(0, 10)
  );
  console.log("\n ------------------- \n");
  generateStats(filterTransfersResult);
};

const generateStats = ({
  avgTransferred,
  sortedTransfers,
  totalTransferred,
  uniqueAddressesFrom,
  uniqueAddressesTo,
}: Awaited<ReturnType<typeof filterTransfers>>) => {
  console.log("Total transferred:", totalTransferred);
  console.log("Average transferred:", avgTransferred);
  console.log("Unique addresses from:", uniqueAddressesFrom.length);
  console.log("Unique addresses to:", uniqueAddressesTo.length);
  console.log("Total transfers:", sortedTransfers.length);
};
