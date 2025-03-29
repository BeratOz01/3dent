import type { ReactNode } from "react";
import { Tooltip } from "react-tooltip";

interface RightTooltipProps {
	content: string;
	id: string; // unique ID for each tooltip
	children: ReactNode;
}

export const RightTooltip = ({ content, id, children }: RightTooltipProps) => {
	return (
		<>
			<div data-tooltip-id={id} data-tooltip-content={content}>
				{children}
			</div>
			<Tooltip
				id={id}
				place="right"
				className="!bg-black !text-cyber-green !text-xs !font-mono !px-3 !py-1 !z-50"
				opacity={95}
				offset={8}
			/>
		</>
	);
};
