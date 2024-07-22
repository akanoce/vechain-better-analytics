import { addressUtils } from "@vechain/sdk-core";
import { getCommonAddresses } from "../../constant/index";
import { ThorClient } from "@vechain/sdk-network";

const { Select, Input } = require("enquirer");

/**
 * Prompt for an address, firstly proposing common addresses
 * and then allowing the user to input a custom address - will handle validation
 * @param message - The first message to display to the user
 * @param anyoneAllowed - If true, the user can select any address
 * @param customAddressAllowed - If true, the user can input a custom address

 * 
 */
export const promptAddress = async (
  thorClient: ThorClient,
  message = "Select an address",
  type: "withCommon" | "custom" = "withCommon",
  anyoneAllowed = true,
  customAddressAllowed = true
): Promise<string | undefined> => {
  const { commonAddresses } = getCommonAddresses(thorClient);

  if (type === "custom") return promptForCustomAddress(message);

  const commonAddressPrompt = new Select({
    name: "fromChoice",
    message: message,
    choices: [
      ...(anyoneAllowed ? [{ message: "Any address", name: "any" }] : []),
      ...(customAddressAllowed
        ? [{ message: "Custom address", name: "custom" }]
        : []),
      ...commonAddresses.map((comm) => ({
        message: comm.name,
        name: comm.name,
      })),
    ],
  });
  const result = await commonAddressPrompt.run();

  if (result === "any") return undefined;

  if (result === "custom") return promptForCustomAddress("Enter the address");

  const selectedApp = commonAddresses.find((comm) => comm.name === result);
  if (!selectedApp) throw new Error("Invalid app selected");

  const appAddressPrompt = new Select({
    name: "fromAppChoice",
    message: `Which address of ${result}?`,
    choices: [
      { message: "Treasury", name: selectedApp.treasury },
      ...selectedApp.contracts.map((contract) => ({
        message: contract.name,
        name: contract.address,
      })),
    ],
  });

  const selectedAddress = await appAddressPrompt.run();

  return String(selectedAddress);
};

const promptForCustomAddress = async (
  message: string = "Enter the address"
) => {
  while (true) {
    const customAddressPrompt = new Input({
      message,
      initial: "0x",
    });

    const res = await customAddressPrompt.run();
    if (addressUtils.isAddress(res)) return res;
    console.log("Invalid address, please try again");
  }
};
