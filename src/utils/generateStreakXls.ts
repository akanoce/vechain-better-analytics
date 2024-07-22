import writeXlsxFile from "write-excel-file/node";
import { lookupDappsInteractions } from "../lookupDappsInteractions";
import dayjs, { Dayjs } from "dayjs";
import { ThorClient } from "@vechain/sdk-network";

/**
 * Create a range of Day.js dates between a start and end date.
 *
 * ```js
 * getDaysBetween(dayjs('2021-04-03'), dayjs('2021-04-05'));
 * // => [dayjs('2021-04-03'), dayjs('2021-04-04'), dayjs('2021-04-05')]
 * ```
 */
export function getDaysBetween(start: Dayjs, end: Dayjs) {
  const range = [];
  let current = start;
  while (!current.isAfter(end)) {
    range.push(current);
    current = current.add(1, "days");
  }
  return range;
}
const startDate = dayjs("2024-03-01");
const getDaysBetweenResult = getDaysBetween(startDate, dayjs());

export const getNumberOfActionsPerDay = async (
  thorClient: ThorClient,
  address: string
) => {
  const dappInteractions = await lookupDappsInteractions(thorClient, address);

  // Get the timestamp of all the interactions - transfers and events
  const generalDappsInteractions = Object.values(dappInteractions);

  const transfersTimestamps = generalDappsInteractions.flatMap((transfer) =>
    transfer.transfers.map((t) => t.meta.blockTimestamp)
  );

  // Get the timestamp of all the interactions - transfers and events

  const dayActionMap: Record<string, number> = {};
  getDaysBetweenResult.forEach((day) => {
    const actionsInDay = transfersTimestamps.filter((timestamp) =>
      dayjs.unix(timestamp).isSame(day, "day")
    );
    dayActionMap[day.format("YYYY-MM-DD")] = actionsInDay.length;
  }, {});

  return dayActionMap;
};

export const generateStreakXls = async (
  thorClient: ThorClient,
  addresses: string[],
  filePath = "./streak.xlsx"
) => {
  const actionsPerDay = await Promise.all(
    addresses.map((address) => {
      return getNumberOfActionsPerDay(thorClient, address);
    })
  );

  const headerRow = [
    {
      type: String,
      value: "Address",
      fontWeight: "bold",
    },
    {
      type: String,
      value: "Total events",
      fontWeight: "bold",
    },
    {
      type: String,
      value: "Longest streak",
      fontWeight: "bold",
    },
    {
      type: String,
      value: "Address",
      fontWeight: "bold",
    },
    ...getDaysBetweenResult.map((day) => ({
      type: String,
      value: day.format("YYYY-MM-DD"),
      fontWeight: "bold",
    })),
  ];

  const rows = actionsPerDay.map((actions, index) => {
    return [
      {
        type: String,
        value: addresses[index],
      },
      {
        type: Number,
        value: Object.values(actions).reduce((acc, curr) => acc + curr, 0),
      },
      {
        type: Number,
        // Check how many days in a row the user has interacted with the dapps
        value: Math.max(
          ...Object.values(actions).reduce(
            (acc, curr) => {
              if (curr > 0) {
                acc[acc.length - 1]++;
              } else {
                acc.push(0);
              }
              return acc;
            },
            [0]
          )
        ),
      },
      ...getDaysBetweenResult.map((day) => ({
        type: Number,
        value: actions[day.format("YYYY-MM-DD")] || 0,
      })),
    ];
  });

  const data = [headerRow, ...rows];

  await writeXlsxFile(data, {
    filePath,
  });
};
