import { abi, unitsUtils } from "@vechain/sdk-core";
import { getCommonAddresses, TranferEventAbi } from "./constant";
import { EventLogs, ThorClient } from "@vechain/sdk-network";
import { getAllEvents } from "./utils";
import { vot3ContractAddress } from "./constant/addresses/mainnet";

const transferEvent = new abi.Event(TranferEventAbi);

export type FilterTransfersReturnType = {
  totalTransferred: number;
  avgTransferred: number;
  uniqueAddressesFrom: string[];
  uniqueAddressesTo: string[];
  transfers: {
    from: string;
    to: string;
    value: string;
    formattedValue: string;
    meta: EventLogs["meta"];
  }[];
  sortedTransfers: {
    from: string;
    to: string;
    value: string;
    formattedValue: string;
    meta: EventLogs["meta"];
  }[];
  key?: string;
};
export const filterTransfers = async (
  thorClient: ThorClient,
  fromAddress?: string,
  toAddress?: string,
  key?: string
): Promise<FilterTransfersReturnType> => {
  const { b3trContractAddress } = getCommonAddresses(thorClient);

  const transferTopics = transferEvent.encodeFilterTopics([
    fromAddress,
    toAddress,
  ]);

  const eventLogs = await getAllEvents({
    thor: thorClient,
    criteriaSet: [
      {
        address: b3trContractAddress,
        topic0: transferTopics[0],
        topic1: transferTopics[1],
        topic2: transferTopics[2],
        topic3: transferTopics[3],
        topic4: transferTopics[4],
      },
      {
        address: vot3ContractAddress,
        topic0: transferTopics[0],
        topic1: transferTopics[1],
        topic2: transferTopics[2],
        topic3: transferTopics[3],
        topic4: transferTopics[4],
      },
    ],
    order: "asc",
  });

  const decoded = eventLogs
    .map((log) => {
      const decoded = transferEvent.decodeEventLog({
        data: log.data,
        topics: log.topics,
      });
      if (decoded._from === "0x0" || decoded._to === "0x0")
        console.log("0x0 decoded", decoded);
      return {
        from: decoded._from,
        to: decoded._to,
        value: decoded._value,
        formattedValue: unitsUtils.formatUnits(decoded._value.toString(), 18),
        meta: log.meta,
      };
    }) // filter out the transfers to the vot3 contract
    .filter((log) => log.to !== vot3ContractAddress);

  const totalTransferred = decoded.reduce((acc, log) => {
    return acc + parseFloat(log.formattedValue);
  }, 0);

  const avgTransferred = totalTransferred / decoded.length;

  const uniqueAddressesTo = decoded.reduce((acc, log) => {
    if (!acc.includes(log.to)) acc.push(log.to);
    return acc;
  }, [] as string[]);

  const uniqueAddressesFrom = decoded.reduce((acc, log) => {
    if (!acc.includes(log.from)) acc.push(log.from);
    return acc;
  }, [] as string[]);

  const sortedTransfers = decoded.toSorted((a, b) => {
    return parseFloat(b.value) - parseFloat(a.value);
  });

  return {
    totalTransferred,
    avgTransferred,
    uniqueAddressesFrom,
    uniqueAddressesTo,
    transfers: decoded,
    sortedTransfers,
    ...(!!key && { key }),
  };
};
