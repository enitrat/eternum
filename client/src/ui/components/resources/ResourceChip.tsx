import { findResourceById, getIconResourceId } from "@bibliothecadao/eternum";

import { ResourceIcon } from "../../elements/ResourceIcon";
import { currencyFormat } from "../../utils/utils";
import { useProductionManager } from "@/hooks/helpers/useResources";
import { useMemo } from "react";
import useBlockchainStore from "@/hooks/store/useBlockchainStore";

export const ResourceChip = ({
  isLabor = false,
  resourceId,
  entityId,
}: {
  isLabor?: boolean;
  resourceId: number;
  entityId: bigint;
}) => {
  const currentTick = useBlockchainStore((state) => state.currentTick);
  const productionManager = useProductionManager(entityId, resourceId);

  const production = useMemo(() => {
    return productionManager.getProduction();
  }, []);

  const balance = useMemo(() => {
    return productionManager.balance(currentTick);
  }, [productionManager, production, currentTick]);

  const netRate = useMemo(() => {
    return productionManager.netRate(currentTick)[1];
  }, [productionManager, production]);

  return (
    <div className={`flex relative group items-center text-xs border border-gold/10 px-2 p-1 hover:bg-gold/20 `}>
      <ResourceIcon
        isLabor={isLabor}
        withTooltip={false}
        resource={findResourceById(getIconResourceId(resourceId, isLabor))?.trait as string}
        size="sm"
        className="mr-3 self-center"
      />

      <div className="flex justify-between w-full">
        <div className=" self-center text-sm">{currencyFormat(balance ? Number(balance) : 0, 2)}</div>

        <div className="text-xs w-full self-center text-opacity-65 px-4">{findResourceById(resourceId)?.trait}</div>
        {netRate ? (
          <div className={`${Number(netRate) < 0 ? "text-light-red" : "text-green"} self-center px-2`}>
            {parseFloat(netRate.toString()) < 0 ? "" : "+"}
            {currencyFormat(netRate, 2)}
          </div>
        ) : (
          <div className="self-center ml-2"></div>
        )}
      </div>
    </div>
  );
};