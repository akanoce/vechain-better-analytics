import { abi, unitsUtils } from "@vechain/sdk-core";
import { HttpClient, ThorClient } from "@vechain/sdk-network";
import { b3trContractAddress } from "./constant/addresses";
import { TranferEventAbi } from "./constant";

const _testnetUrl = "https://testnet.vechain.org";
const testNetwork = new HttpClient(_testnetUrl);
const thorClient = new ThorClient(testNetwork);

const transferEvent = new abi.Event(TranferEventAbi);

export const filterTransfers = async (
  fromAddress?: string,
  toAddress?: string
) => {
  const currentBlock = await thorClient.blocks.getBestBlockCompressed();

  const transferTopics = transferEvent.encodeFilterTopics([
    fromAddress,
    toAddress,
  ]);

  const eventLogs = await thorClient.logs.filterEventLogs({
    // Specify the range of blocks to search for events
    range: {
      unit: "block",
      from: 0,
      to: currentBlock?.number,
    },
    // Additional options for the query, such as offset and limit
    options: {
      offset: 0,
      limit: 100000,
    },
    // Define criteria for filtering events
    criteriaSet: [
      {
        // Contract address to filter events
        address: b3trContractAddress,
        // Event to filter
        // Topics to further narrow down the search
        topic0: transferTopics[0],
        topic1: transferTopics[1],
        topic2: transferTopics[2],
        topic3: transferTopics[3],
        topic4: transferTopics[4],
      },
    ],
    // Specify the order in which logs should be retrieved (ascending in this case)
    order: "asc",
  });

  console.log("Event logs:", eventLogs.length);

  const decoded = eventLogs.map((log) => {
    return transferEvent.decodeEventLog({ data: log.data, topics: log.topics });
  });

  const mapDecoded = decoded.map((log) => {
    return {
      from: log._from,
      to: log._to,
      value: log._value.toString(),
      formattedValue: unitsUtils.formatUnits(log._value.toString(), 18),
    };
  });

  const totalTransferred = mapDecoded.reduce((acc, log) => {
    return acc + parseFloat(log.formattedValue);
  }, 0);
  console.log("Total transferred:", totalTransferred);

  const sortedTransfers = mapDecoded.sort((a, b) => {
    return parseFloat(b.value) - parseFloat(a.value);
  });

  console.log("Top 10 transfers:", sortedTransfers.slice(0, 10));
};
