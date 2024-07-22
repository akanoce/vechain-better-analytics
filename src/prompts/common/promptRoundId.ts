const { Select } = require("enquirer");

export const promptRoundId = async (
  rounds: number[],
  currentRound?: string,
  allAllowed = true
) => {
  const whichRoundPrompt = new Select({
    name: "whichRound",
    message: "Which voting round?",
    choices: [
      ...(allAllowed
        ? [{ message: "All (Could take longer with more rounds)", name: "all" }]
        : []),
      ...rounds.map((round) => ({
        message:
          Number(currentRound) === round
            ? `${round} (current round)`
            : String(round),
        name: round,
      })),
    ],
  });

  const round = await whichRoundPrompt.run();
  return String(round);
};
