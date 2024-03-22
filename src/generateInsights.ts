import { HttpClient, ThorClient } from "@vechain/sdk-network";
import { xAllocationVotingAddress } from "./constant/addresses";
import XAllocationVotingAbi from "./abis/XAllocationVoting.json";
import { filterAllocationVotes } from "./allocationVoting";
import writeXlsxFile from "write-excel-file";

const _testnetUrl = "https://testnet.vechain.org";
const testNetwork = new HttpClient(_testnetUrl);
const thorClient = new ThorClient(testNetwork);

const xAllocationContract = thorClient.contracts.load(
  xAllocationVotingAddress,
  XAllocationVotingAbi.abi
);

type XApp = {
  id: string;
  receiverAddress: string;
  name: string;
  createdAt: number;
};
const getApps = async () => {
  const apps = (await xAllocationContract.read.getAllApps())[0];
  const parsedXApps: XApp[] = apps.map((app: any) => {
    return {
      id: app[0],
      receiverAddress: app[1],
      name: app[2],
      createdAt: app[3],
    };
  });
  return parsedXApps;
};

const getCurrentRoundId = async () => {
  const currentRoundId = (await xAllocationContract.read.currentRoundId())[0];
  return currentRoundId;
};

const generateXlsFile = async (
  rounds: number[],
  addressesWithVotes: Record<string, Record<string, number>>
) => {
  const headerRow = [
    {
      value: "Address",
      fontWeight: "bold",
    },
    ...rounds.map((round) => ({
      value: `Round ${round}`,
      fontWeight: "bold",
    })),
  ];

  const rows = Object.keys(addressesWithVotes).map((address) => {
    const roundsVotes = Object.keys(addressesWithVotes[address]).map(
      (round) => ({
        type: Number,
        value: addressesWithVotes[address][round],
      })
    );
    return [
      {
        type: String,
        value: address,
      },
      ...roundsVotes,
    ];
  });

  const data = [...rows];

  await writeXlsxFile(data, {
    fileName: "file.xlsx",
  });
};
export const generateInsights = async () => {
  const apps = await getApps();
  const currentRoundId = await getCurrentRoundId();
  const allRounds = Array.from(
    { length: Number(currentRoundId) },
    (_, i) => i + 1
  );
  console.log("allRounds", allRounds);
  console.log("currentRoundId", currentRoundId);
  console.log("apps", apps);

  //get all votes for each round concurrently and then process them
  const roundsVotes = await Promise.all(
    allRounds.map(async (roundId) => {
      const { mapDecoded: votes } = await filterAllocationVotes(roundId);
      return { roundId, votes };
    })
  );

  const addressesWithVotes: Record<string, Record<string, number>> = {};

  for (const round of roundsVotes) {
    for (const vote of round.votes) {
      const totalVotes = vote.voteWeights.reduce(
        (prev, curr) => Number(prev) + Number(curr),
        0
      );
      if (!addressesWithVotes[vote.voter]) {
        addressesWithVotes[vote.voter] = {};
      }

      addressesWithVotes[vote.voter][round.roundId] = totalVotes;
    }
  }

  await generateXlsFile(allRounds, addressesWithVotes);
};
