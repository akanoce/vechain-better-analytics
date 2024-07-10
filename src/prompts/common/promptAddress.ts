import { addressUtils } from "@vechain/sdk-core";
import { commonAddressesWithNameMapping } from "../../constant";

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
  message = "Select an address",
  anyoneAllowed = true,
  customAddressAllowed = true
) => {
  const commonAddressPrompt = new Select({
    name: "fromChoice",
    message: message,
    choices: [
      ...(anyoneAllowed ? [{ message: "Any address", name: "any" }] : []),
      ...(customAddressAllowed
        ? [{ message: "Custom address", name: "custom" }]
        : []),
      ...commonAddressesWithNameMapping,
    ],
  });
  const result = await commonAddressPrompt.run();

  if (result === "any") return undefined;

  if (result === "custom") {
    while (true) {
      const customAddressPrompt = new Input({
        message: "Enter the address",
        initial: "0x",
      });

      const res = await customAddressPrompt.run();
      if (addressUtils.isAddress(res)) return res;
      console.log("Invalid address, please try again");
    }
  }

  return result;
};
