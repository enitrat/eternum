import { useDojo } from "@/hooks/context/DojoContext";
import { getEntityIdFromKeys, gramToKg } from "@/ui/utils/utils";
import { BuildingType, CapacityConfigCategory, EternumGlobalConfig, ID, RESOURCE_TIERS } from "@bibliothecadao/eternum";
import { useComponentValue } from "@dojoengine/react";
import { useMemo } from "react";
import { ResourceChip } from "./ResourceChip";

export const EntityResourceTable = ({ entityId }: { entityId: ID | undefined }) => {
  const dojo = useDojo();

  const quantity =
    useComponentValue(
      dojo.setup.components.BuildingQuantityv2,
      getEntityIdFromKeys([BigInt(entityId || 0), BigInt(BuildingType.Storehouse)]),
    )?.value || 0;

  const maxBalance = useMemo(() => {
    return (
      quantity * gramToKg(EternumGlobalConfig.carryCapacityGram[CapacityConfigCategory.Storehouse]) +
      gramToKg(EternumGlobalConfig.carryCapacityGram[CapacityConfigCategory.Storehouse]) *
        EternumGlobalConfig.resources.resourcePrecision
    );
  }, [quantity]);

  if (!entityId) {
    return <div>Entity not found</div>;
  }

  const resourceElements = useMemo(() => {
    return Object.entries(RESOURCE_TIERS).map(([tier, resourceIds]) => {
      const resources = resourceIds.map((resourceId: any) => {
        return <ResourceChip key={resourceId} resourceId={resourceId} entityId={entityId} maxBalance={maxBalance} />;
      });

      return (
        <div key={tier}>
          <div className="grid grid-cols-1 flex-wrap">{resources}</div>
        </div>
      );
    });
  }, [entityId]);

  return <div>{resourceElements}</div>;
};
