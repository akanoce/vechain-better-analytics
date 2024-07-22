import { ThorClient } from "@vechain/sdk-network";
import { generateInsights } from "../../utils/generateInsights";

const { Input } = require("enquirer");

/**
 * This function is used to prompt the user for the file path in order to generate the insights XLS file
 */
export const promptInsights = async (thorClient: ThorClient) => {
  const filePathprompt = new Input({
    message: "Enter the file path",
    initial: "./vebetterdao_insights.xlsx",
  });
  const filePath = await filePathprompt.run();

  await generateInsights(thorClient, filePath);
};
