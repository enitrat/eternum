import React from "react";
// import { ReactComponent as HeadlineLeft } from "@/assets/icons/common/headline-left.svg";
// import { ReactComponent as HeadlineRight } from "@/assets/icons/common/headline-right.svg";
// import { ReactComponent as HeadlineBigLeft } from "@/assets/icons/common/headline-big-left.svg";
// import { ReactComponent as HeadlineBigRight } from "@/assets/icons/common/headline-big-right.svg";
import clsx from "clsx";

type HeadlineProps = {
  children: React.ReactNode;
  className?: string;
};

export const Headline = ({ children, className }: HeadlineProps) => (
  <div className={clsx("flex items-center justify-center select-none w-full  bg-gold/5 p-2 h6 font-bold", className)}>
    <div className="flex flex-1 items-center">
      <svg width="28" height="11" viewBox="0 0 28 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.4904 0.0869133C16.6528 -0.0260537 16.8657 -0.02914 17.0312 0.0790727L21.5655 3.04357L27.6586 5.02363C27.8619 5.08971 28 5.28237 28 5.50003C28 5.71769 27.8619 5.91034 27.6586 5.97642L21.5655 7.95643L17.0312 10.9209C16.8657 11.0291 16.6528 11.0261 16.4904 10.9131L10.2378 6.56457C10.1474 6.60177 10.0348 6.64764 9.90422 6.69985C9.54862 6.84209 9.05874 7.03201 8.52268 7.22223C7.98763 7.41209 7.40094 7.60427 6.85296 7.74954C6.31492 7.89218 5.77689 8 5.35361 8C4.90802 8 4.35917 7.84984 3.82741 7.65921C3.28224 7.46377 2.70219 7.20587 2.17575 6.95204C1.64799 6.69756 1.16679 6.44361 0.817914 6.25353C0.643277 6.15839 0.501316 6.07898 0.402691 6.02317C0.353368 5.99527 0.314853 5.97324 0.288477 5.95808L0.258173 5.94061L0.250153 5.93596L0.247168 5.93423L0.490281 5.50003C0.24705 5.0659 0.247976 5.06536 0.247976 5.06536L0.250147 5.06409L0.258167 5.05945L0.288471 5.04197C0.314848 5.02681 0.353362 5.00479 0.402687 4.97688C0.501312 4.92107 0.643272 4.84167 0.817908 4.74652C1.16679 4.55643 1.64798 4.30247 2.17575 4.04799C2.70219 3.79415 3.28224 3.53625 3.82741 3.3408C4.35917 3.15016 4.90802 3 5.35361 3C5.77689 3 6.31492 3.10782 6.85296 3.25046C7.40094 3.39573 7.98763 3.58791 8.52268 3.77777C9.05874 3.96799 9.54861 4.15791 9.90422 4.30015C10.0347 4.35236 10.1474 4.39823 10.2378 4.43543L16.4904 0.0869133ZM18.1408 5.50001C18.1408 6.32844 17.4822 7.00001 16.6699 7.00001C15.8576 7.00001 15.1991 6.32844 15.1991 5.50001C15.1991 4.67158 15.8576 4.00001 16.6699 4.00001C17.4822 4.00001 18.1408 4.67158 18.1408 5.50001ZM5.39344 6.50001C5.93499 6.50001 6.374 6.05229 6.374 5.50001C6.374 4.94772 5.93499 4.50001 5.39344 4.50001C4.85189 4.50001 4.41288 4.94772 4.41288 5.50001C4.41288 6.05229 4.85189 6.50001 5.39344 6.50001Z"
          className="fill-gold/40"
        />
        <path
          d="M0.490281 5.50003L0.24705 5.0659C0.0942805 5.15492 -1.88563e-06 5.32059 0 5.50003C1.88569e-06 5.67947 0.0943984 5.84521 0.247168 5.93423C0.247168 5.93423 0.247054 5.93416 0.490281 5.50003Z"
          className="fill-gold/40"
        />
      </svg>
      <div className="h-[1px] flex-1 bg-gold/40"></div>
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.463 2.55045e-07L5 2.5L2.463 5L-2.5828e-07 2.5L2.463 2.55045e-07Z"
          className="fill-gold/40"
        />
      </svg>
    </div>
    <div className="mx-6 whitespace-nowrap">{children}</div>
    <div className="flex flex-1 items-center">
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.463 2.55045e-07L5 2.5L2.463 5L-2.5828e-07 2.5L2.463 2.55045e-07Z"
          className="fill-gold/40"
        />
      </svg>
      <div className="h-[1px]  flex-1 bg-gold/40"></div>
      <svg
        className=" -scale-x-100 "
        width="28"
        height="11"
        viewBox="0 0 28 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.4904 0.0869133C16.6528 -0.0260537 16.8657 -0.02914 17.0312 0.0790727L21.5655 3.04357L27.6586 5.02363C27.8619 5.08971 28 5.28237 28 5.50003C28 5.71769 27.8619 5.91034 27.6586 5.97642L21.5655 7.95643L17.0312 10.9209C16.8657 11.0291 16.6528 11.0261 16.4904 10.9131L10.2378 6.56457C10.1474 6.60177 10.0348 6.64764 9.90422 6.69985C9.54862 6.84209 9.05874 7.03201 8.52268 7.22223C7.98763 7.41209 7.40094 7.60427 6.85296 7.74954C6.31492 7.89218 5.77689 8 5.35361 8C4.90802 8 4.35917 7.84984 3.82741 7.65921C3.28224 7.46377 2.70219 7.20587 2.17575 6.95204C1.64799 6.69756 1.16679 6.44361 0.817914 6.25353C0.643277 6.15839 0.501316 6.07898 0.402691 6.02317C0.353368 5.99527 0.314853 5.97324 0.288477 5.95808L0.258173 5.94061L0.250153 5.93596L0.247168 5.93423L0.490281 5.50003C0.24705 5.0659 0.247976 5.06536 0.247976 5.06536L0.250147 5.06409L0.258167 5.05945L0.288471 5.04197C0.314848 5.02681 0.353362 5.00479 0.402687 4.97688C0.501312 4.92107 0.643272 4.84167 0.817908 4.74652C1.16679 4.55643 1.64798 4.30247 2.17575 4.04799C2.70219 3.79415 3.28224 3.53625 3.82741 3.3408C4.35917 3.15016 4.90802 3 5.35361 3C5.77689 3 6.31492 3.10782 6.85296 3.25046C7.40094 3.39573 7.98763 3.58791 8.52268 3.77777C9.05874 3.96799 9.54861 4.15791 9.90422 4.30015C10.0347 4.35236 10.1474 4.39823 10.2378 4.43543L16.4904 0.0869133ZM18.1408 5.50001C18.1408 6.32844 17.4822 7.00001 16.6699 7.00001C15.8576 7.00001 15.1991 6.32844 15.1991 5.50001C15.1991 4.67158 15.8576 4.00001 16.6699 4.00001C17.4822 4.00001 18.1408 4.67158 18.1408 5.50001ZM5.39344 6.50001C5.93499 6.50001 6.374 6.05229 6.374 5.50001C6.374 4.94772 5.93499 4.50001 5.39344 4.50001C4.85189 4.50001 4.41288 4.94772 4.41288 5.50001C4.41288 6.05229 4.85189 6.50001 5.39344 6.50001Z"
          className="fill-gold/40"
        />
        <path
          d="M0.490281 5.50003L0.24705 5.0659C0.0942805 5.15492 -1.88563e-06 5.32059 0 5.50003C1.88569e-06 5.67947 0.0943984 5.84521 0.247168 5.93423C0.247168 5.93423 0.247054 5.93416 0.490281 5.50003Z"
          fill="#CAB1A6"
        />
      </svg>
    </div>
  </div>
);
