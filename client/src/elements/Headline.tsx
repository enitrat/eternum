import React from 'react';
import { ReactComponent as HeadlineLeft } from '../assets/icons/common/headline-left.svg';
import { ReactComponent as HeadlineRight } from '../assets/icons/common/headline-right.svg';

type HeadlineProps = {
    children: React.ReactNode;
}

export const Headline = ({ children }: HeadlineProps) => (
    <div className='flex items-center justify-center select-none'>
        <HeadlineLeft />
        <div className='mx-3 text-xs font-bold text-white'>
            {children}
        </div>
        <HeadlineRight />
    </div>
);