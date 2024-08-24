import { useDojo } from "@/hooks/context/DojoContext";
import { useStaminaManager } from "@/hooks/helpers/useStamina";
import useUIStore from "@/hooks/store/useUIStore";
import { EternumGlobalConfig, ID } from "@bibliothecadao/eternum";
import { getComponentValue } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";

export const StaminaResource = ({ entityId, className }: { entityId: ID | undefined; className?: string }) => {
  const { setup } = useDojo();

  const currentArmiesTick = useUIStore((state) => state.currentArmiesTick);

  const staminaManager = useStaminaManager(entityId || 0);

  const maxStamina = staminaManager.getMaxStamina(
    getComponentValue(setup.components.Army, getEntityIdFromKeys([BigInt(entityId || 0)]))?.troops,
  );

  const stamina = useMemo(
    () => staminaManager.getStamina(currentArmiesTick),
    [entityId, currentArmiesTick, staminaManager],
  );

  const staminaAmount = useMemo(() => Number(stamina?.amount || 0), [entityId, stamina]);

  const staminaPercentage = useMemo(() => (staminaAmount / maxStamina) * 100, [staminaAmount, maxStamina]);

  const staminaColor = useMemo(
    () => (staminaAmount < EternumGlobalConfig.stamina.travelCost ? "bg-red-500" : "bg-yellow-500"),
    [staminaAmount],
  );

  return (
    <div className={`flex flex-col text-xs font-bold uppercase self-center ${className}`}>
      <div className="bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 border border-y w-16">
        <div className={`${staminaColor} h-1 rounded-full  bg-yellow`} style={{ width: `${staminaPercentage}%` }}></div>
      </div>
    </div>
  );
};
