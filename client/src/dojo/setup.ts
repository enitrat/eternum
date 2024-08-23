import { DojoConfig } from "@dojoengine/core";
import { getSyncEntities, getSyncEvents } from "@dojoengine/state";
import { createClientComponents } from "./createClientComponents";
import { createSystemCalls } from "./createSystemCalls";
import { createUpdates } from "./createUpdates";
import { setupNetwork } from "./setupNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup({ ...config }: DojoConfig) {
  const network = await setupNetwork(config);
  const components = createClientComponents(network);
  const systemCalls = createSystemCalls(network);
  const updates = await createUpdates();

  // fetch all existing entities from torii
  const sync = await getSyncEntities(network.toriiClient, network.contractComponents as any, [], 1000);

  const timestamp = Math.round(Date.now() / 1000 - 120); // Subtract 2 minutes (120 seconds

  const eventSync = getSyncEvents(
    network.toriiClient,
    network.contractComponents as any,
    {
      Composite: {
        operator: "And",
        clauses: [
          {
            Member: {
              model: "MapExplored",
              member: "timestamp",
              operator: "Gt",
              value: { U64: timestamp },
            },
          },
        ],
      },
    },
    [],
  );

  return {
    network,
    components,
    systemCalls,
    updates,
    sync,
    eventSync,
  };
}
