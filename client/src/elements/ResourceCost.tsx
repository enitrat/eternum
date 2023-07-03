import React, { useMemo } from 'react';
import { findResourceById } from '../constants/resources';
import { ResourceIcon } from './ResourceIcon';
import clsx from 'clsx';

type ResourceCostProps = {
    resourceId: number;
    amount: number;
    color?: string;
    type?: "horizontal" | "vertical";
}

export const ResourceCost = ({ type = "horizontal", ...props }: ResourceCostProps) => {
    const trait = useMemo(() => findResourceById(props.resourceId)?.trait, [props.resourceId])
    return (
        <div className={clsx(
            "relative flex items-center w-full gap-1 px-1 rounded",
            type === "horizontal" ? "flex-row justify-start" : "flex-col justify-center",
        )}>
            <ResourceIcon resource={trait || ''} size='xs' />
            <div className={clsx("relative flex flex-col items-center text-lightest shrink-0", type === "horizontal" ? 'ml-1 font-bold' : '')}>
                <div className={clsx("relative text-xs", props.color)}>
                    {(props.color && props.amount > 0) ? '+' : ''}
                    {(props.color && props.amount < 0) ? '-' : ''}
                    {props.amount}
                </div>
                {type === 'horizontal' && <div className="text-xxs leading-[10px] self-start relative">
                    {trait}
                </div>}
            </div>
        </div>
    )
};