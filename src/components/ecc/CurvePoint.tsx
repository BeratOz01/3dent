import { type Point, inCurve } from "@zk-kit/baby-jubjub";
import { useEffect, useMemo, useState } from "react";
import { FaMapPin } from "react-icons/fa";
import type { IJubPoint } from "../../types";

interface CurvePointProps {
	x: bigint;
	y: bigint;
	label?: string;
	onChange: (point: Partial<IJubPoint>) => void;
	shouldCollapse?: boolean;
}

export function CurvePoint({
	x,
	y,
	label,
	onChange,
	shouldCollapse = true,
}: CurvePointProps) {
	const [isHovering, setIsHovering] = useState(false);
	const [isOnCurve, setIsOnCurve] = useState(false);

	const truncateValue = (value: bigint) => {
		if (value.toString().length > 10) {
			return `${value.toString().slice(0, 5)}...${value.toString().slice(-5)}`;
		}
		return value.toString();
	};

	useEffect(() => {
		try {
			if (x.toString() && y.toString()) {
				const issOnCurve = inCurve([x, y] as Point<bigint>);
				setIsOnCurve(issOnCurve);
			}
		} catch (error) {
			console.error(error);
			setIsOnCurve(false);
		}
	}, [x, y]);

	const styles = useMemo(() => {
		if (isOnCurve)
			return {
				boxStyle: "border-cyber-green/30 hover:border-cyber-green/30",
				pinColor: "text-cyber-green/60",
				textStyle: "text-cyber-green/60",
			};
		return {
			boxStyle: "border-cyber-red/30 hover:border-cyber-red/30",
			pinColor: "text-cyber-red/60",
			textStyle: "text-cyber-red/60",
		};
	}, [isOnCurve]);

	return (
		<div className="group relative flex-1">
			<div
				className={`flex items-center space-x-4 bg-cyber-dark/50 px-4 py-3 rounded-lg border ${styles.boxStyle} transition-all`}
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
			>
				<div className="flex-shrink-0 w-12 h-12 flex items-center justify-center flex-col">
					<FaMapPin className={`w-6 h-6 self-center ${styles.pinColor}`} />
					{label && (
						<div className="text-xs text-center mt-1 text-cyber-gray font-mono">
							{label}
						</div>
					)}
				</div>

				{isHovering ? (
					<div className="font-mono w-full">
						<div className="text-sm text-cyber-gray/80">
							<input
								className={`${styles.textStyle} text-sm bg-transparent w-full focus:outline-none font-mono`}
								value={x.toString()}
								onChange={(e) => onChange({ x: BigInt(e.target.value) })}
							/>
						</div>
						<div className="text-sm text-cyber-gray/80">
							<input
								className={`${styles.textStyle} text-sm bg-transparent w-full focus:outline-none font-mono`}
								value={y.toString()}
								onChange={(e) => onChange({ y: BigInt(e.target.value) })}
							/>
						</div>
					</div>
				) : (
					<div className="font-mono">
						<div className="text-sm">
							<span className={`${styles.textStyle}`}>
								{shouldCollapse ? truncateValue(x) : x.toString()}
							</span>
						</div>
						<div className="text-sm">
							<span className={`${styles.textStyle}`}>
								{shouldCollapse ? truncateValue(y) : y.toString()}
							</span>
						</div>
					</div>
				)}

				{!isOnCurve && (
					<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-cyber-dark text-cyber-red px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity font-mono">
						Point is not on the curve
					</div>
				)}
			</div>
		</div>
	);
}
