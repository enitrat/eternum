import { useEffect, useMemo, useRef } from "react";
// @ts-ignore
import { Flags } from "@/ui/components/worldmap/Flags.jsx";
import useUIStore from "../../../../hooks/store/useUIStore.js";
import { useDojo } from "../../../../hooks/context/DojoContext";
import { Subscription } from "rxjs";
import { BiomesGrid, HexagonGrid, useSetPossibleActions } from "./HexLayers.js";
import { Armies } from "../armies/Armies.js";
import { create } from "zustand";
import { ShardsMines } from "../../models/buildings/worldmap/ShardsMines.js";
import { Structures } from "../../models/buildings/worldmap/Structures.js";

import { COLS, FELT_CENTER, ROWS } from "@/ui/config.js";

interface ExploredHexesState {
  exploredHexes: Map<number, Set<number>>;
  setExploredHexes: (col: number, row: number) => void;
}

export const useExploredHexesStore = create<ExploredHexesState>((set) => ({
  exploredHexes: new Map<number, Set<number>>(),

  setExploredHexes: (col: number, row: number) =>
    set((state) => {
      const newMap = new Map(state.exploredHexes);
      if (!newMap.has(col)) {
        newMap.set(col, new Set());
      }
      newMap.get(col)!.add(row);
      return { exploredHexes: newMap };
    }),
}));

export const WorldMap = () => {
  const {
    setup: {
      updates: {
        eventUpdates: { createExploreMapEvents: exploreMapEvents },
      },
    },
  } = useDojo();

  const hexData = useUIStore((state) => state.hexData);

  const hexagonGrids = useMemo(() => {
    const hexagonGrids = [];
    for (let i = 0; i < ROWS; i += 50) {
      const startRow = i;
      const endRow = startRow + 50;
      for (let j = 0; j < COLS; j += 50) {
        const startCol = j;
        const endCol = startCol + 50;
        hexagonGrids.push({ startRow, endRow, startCol, endCol });
      }
    }
    return hexagonGrids;
  }, []);

  const setExploredHexes = useExploredHexesStore((state) => state.setExploredHexes);
  const exploredHexes = useExploredHexesStore((state) => state.exploredHexes);

  const subscriptionRef = useRef<Subscription | undefined>();
  const isComponentMounted = useRef(true);

  useEffect(() => {
    const subscribeToExploreEvents = async () => {
      const observable = await exploreMapEvents();
      const subscription = observable.subscribe((event) => {
        if (!isComponentMounted.current) return;
        if (event && hexData) {
          const col = Number(event.keys[2]) - FELT_CENTER;
          const row = Number(event.keys[3]) - FELT_CENTER;
          setExploredHexes(col, row);
        }
      });
      subscriptionRef.current = subscription;
    };

    subscribeToExploreEvents();

    return () => {
      isComponentMounted.current = false;
      subscriptionRef.current?.unsubscribe(); // Ensure to unsubscribe on component unmount
    };
  }, [hexData, setExploredHexes]);

  useSetPossibleActions(exploredHexes);

  return (
    <>
      <group rotation={[Math.PI / -2, 0, 0]} frustumCulled={true}>
        {hexagonGrids.map((grid, index) => {
          return <BiomesGrid key={index} {...grid} explored={exploredHexes} />;
        })}
        {hexagonGrids.map((grid, index) => {
          return <HexagonGrid key={index} {...grid} explored={exploredHexes} />;
        })}
      </group>
      <Armies />
      <ShardsMines />
      <Structures />
      <Flags />
    </>
  );
};
