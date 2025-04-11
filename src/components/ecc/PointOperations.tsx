import {
	type Point,
	addPoint,
	inCurve,
	mulPointEscalar,
} from "@zk-kit/baby-jubjub";
import type React from "react";
import { useEffect, useState } from "react";

import { IDENTITY_POINT } from "../../pkg/constants";
import type { IJubPoint } from "../../types";
import { CurvePoint } from "./CurvePoint";

interface PointOperationsProps {
	p1: IJubPoint;
	p2: IJubPoint;
}

export const PointOperations: React.FC<PointOperationsProps> = ({ p1, p2 }) => {
	const [sum, setSum] = useState<IJubPoint>(IDENTITY_POINT);
	const [double, setDouble] = useState<IJubPoint>(IDENTITY_POINT);
	const [scalar, setScalar] = useState<string>("");
	const [scalarMulResult, setScalarMulResult] =
		useState<IJubPoint>(IDENTITY_POINT);

	useEffect(() => {
		if (p1 && p2) {
			const _p1 = [p1.x, p1.y] as Point<bigint>;
			const _p2 = [p2.x, p2.y] as Point<bigint>;
			const isBothOnCurve = inCurve(_p1) && inCurve(_p2);
			if (!isBothOnCurve) {
				console.error("Points are not on the curve");
				setSum(IDENTITY_POINT);
				return;
			}

			const result = addPoint(_p1, _p2);
			setSum({
				x: result[0],
				y: result[1],
			});
		}
	}, [p1, p2]);

	useEffect(() => {
		if (p1) {
			const _p1 = [p1.x, p1.y] as Point<bigint>;
			const isOnCurve = inCurve(_p1);
			if (!isOnCurve) {
				console.error("Point is not on the curve");
				setDouble(IDENTITY_POINT);
				return;
			}
			const result = addPoint(_p1, _p1);
			setDouble({
				x: result[0],
				y: result[1],
			});
		}
	}, [p1]);

	useEffect(() => {
		try {
			if (scalar) {
				const _p1 = [p1.x, p1.y] as Point<bigint>;
				if (!inCurve(_p1)) {
					console.error("Point is not on the curve");
					setScalarMulResult(IDENTITY_POINT);
					return;
				}
				const scalarInBig = BigInt(scalar);
				const result = mulPointEscalar(_p1, scalarInBig);
				setScalarMulResult({
					x: result[0],
					y: result[1],
				});
			}
		} catch (error) {
			console.error("Invalid scalar", error);
		}
	}, [scalar, p1]);

	return (
		<div className="flex flex-col gap-2 mt-2">
			<CurvePoint
				x={sum.x}
				y={sum.y}
				onChange={() => {}} // Empty function
				label="P1 + P2"
				shouldCollapse={false}
			/>

			<CurvePoint
				x={double.x}
				y={double.y}
				onChange={() => {}} // Empty function
				label="2P1"
				shouldCollapse={false}
			/>

			<div className="flex gap-2">
				<input
					type="text"
					value={scalar}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*$/.test(value)) setScalar(value);
					}}
					placeholder={"Scalar"}
					className="flex-0.5 bg-cyber-dark/50 text-cyber-gray p-2.5 rounded-lg border border-cyber-green/20 outline-none font-mono text-center text-lg"
				/>
				<CurvePoint
					x={scalarMulResult.x}
					y={scalarMulResult.y}
					onChange={() => {}} // Empty function
					label={"P * S"}
					shouldCollapse={false}
				/>
			</div>
		</div>
	);
};
