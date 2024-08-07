import {
  EventLogs,
  FilterEventLogsOptions,
  ThorClient,
} from "@vechain/sdk-network";

/**
 * Params for getEvents function
 * @param thor the thor client
 * @param auctionId  the auction id to get the events
 * @param order  the order of the events (asc or desc)
 * @param offset  the offset of the events
 * @param limit  the limit of the events (max 256)
 * @param from  the block number to start from
 * @param filterCriteria  the filter criteria for the events
 * @returns  the encoded events
 */
export type GetEventsProps = {
  thor: ThorClient;
  order?: FilterEventLogsOptions["order"];
  offset?: number;
  limit?: number;
  from?: number;
  to?: number;
  criteriaSet?: FilterEventLogsOptions["criteriaSet"];
};
/**
 * Get events from blockchain (auction created, auction successful, auction cancelled)
 * @param order
 * @param offset
 * @param limit
 * @param from block parse start from
 */
export const getEvents = async ({
  thor,
  order = "asc",
  offset = 0,
  limit = 1000,
  from = 0,
  to = Number.MAX_SAFE_INTEGER,
  criteriaSet,
}: GetEventsProps): Promise<EventLogs[]> => {
  return await thor.logs.filterEventLogs({
    range: {
      unit: "block",
      from,
      to: to,
    },
    options: {
      offset,
      limit,
    },
    criteriaSet,
    order,
  });
};

/**
 *  call getEvents iteratively to get all the events
 * @param thor the thor client
 * @param order the order of the events (asc or desc)
 * @param from the block number to start from
 * @param filterCriteria the filter criteria for the events
 * @returns all the events from the blockchain
 */
export const getAllEvents = async ({
  thor,
  order = "asc",
  from,
  to = Number.MAX_SAFE_INTEGER,
  criteriaSet,
}: Omit<GetEventsProps, "offset" | "limit">) => {
  const allEvents: EventLogs[] = [];
  let offset = 0;

  // thor.block("best").get() is not working, have to use the node directly
  //   const bestBlock = await fetch(`${appConfig.nodeUrl}/blocks/best`)
  //   const bestBlockJson = (await bestBlock.json()) as Connex.Thor.Block

  to = to ?? Number.MAX_SAFE_INTEGER;

  //return from the function only when we get all the events
  while (true) {
    const events = await getEvents({
      thor,
      from,
      to,
      limit: 1000,
      order,
      offset,
      criteriaSet,
    });
    allEvents.push(...events);
    if (events.length < 1000) {
      return allEvents;
    }
    offset += 1000;
  }
};
