import { Base8, type Point, packPoint } from "@zk-kit/baby-jubjub";
import { useEffect, useState } from "react";
import { FaMapPin } from "react-icons/fa";
import { CurvePoint } from "../components/ecc/CurvePoint";
import { ElGamal } from "../components/ecc/ElGamal";
import { MathEquation } from "../components/ecc/MathEquation";
import { PointOperations } from "../components/ecc/PointOperations";
import { GENERATOR_POINT, IDENTITY_POINT } from "../pkg/constants";
import type { IJubPoint } from "../types";

export function ECC() {
	const [p1, setP1] = useState<IJubPoint>(IDENTITY_POINT);
	const [p2, setP2] = useState<IJubPoint>(IDENTITY_POINT);

	const [packed, setPacked] = useState<bigint>(0n);

	const handlePoint1Change = (point: Partial<IJubPoint>) =>
		setP1((prev) => ({ ...prev, ...point }));

	const handlePoint2Change = (point: Partial<IJubPoint>) =>
		setP2((prev) => ({ ...prev, ...point }));

	useEffect(() => {
		if (p1.x.toString() && p1.y.toString()) {
			try {
				const _p1 = [p1.x, p1.y] as Point<bigint>;
				const _packed = packPoint(_p1);
				setPacked(_packed);
			} catch (error) {
				console.error("Error packing point", error);
				setPacked(0n);
			}
		}
	}, [p1]);

	return (
		<main className="max-w-6xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-6">
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center">
					ECC (BabyJubjub)
				</h2>
				<p className="text-justify indent-6">
					The BabyJubjub curve is a zk-friendly elliptic curve specifically
					optimized for use in zero-knowledge proof systems like zk-SNARKs and
					zk-STARKs. It is defined over a finite field with a large prime
					modulus and designed to ensure computational efficiency, making it a
					preferred choice for privacy-preserving applications.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-1 gap-2">
				<div className="bg-cyber-dark py-2 px-4 rounded-lg border border-cyber-green/20">
					<div className="space-y-2">
						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono">
								Curve Equation
							</h3>
							<MathEquation>
								<p className="text-sm font-mono">
									y<sup>2</sup> = x<sup>3</sup> + 168700x<sup>2</sup> + x mod (2
									<sup>254</sup> - 127)
								</p>
							</MathEquation>
						</div>

						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono">
								Prime Field
							</h3>
							<MathEquation>
								<p className="text-sm font-mono scrollable-text">
									p =
									21888242871839275222246405745257275088548364400416034343698204186575808495617
								</p>
							</MathEquation>
						</div>

						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono">
								Generator Point
							</h3>
							<MathEquation>
								<p className="text-sm font-mono scrollable-text">
									x = {GENERATOR_POINT.x.toString()}
								</p>
								<p className="text-sm font-mono scrollable-text">
									y = {GENERATOR_POINT.y.toString()}
								</p>
							</MathEquation>
						</div>
						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono">
								Base8 Point
							</h3>
							<MathEquation>
								<p className="text-sm font-mono scrollable-text">
									x = {Base8[0].toString()}
								</p>
								<p className="text-sm font-mono scrollable-text">
									y = {Base8[1].toString()}
								</p>
							</MathEquation>
						</div>
					</div>
				</div>
			</div>

			<p className="text-cyber-gray text-sm font-mono text-center my-4">
				Fill in the points P1 and P2 to use the operations.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
				<CurvePoint {...p1} label="P1" onChange={handlePoint1Change} />
				<CurvePoint {...p2} label="P2" onChange={handlePoint2Change} />
			</div>

			<PointOperations p1={p1} p2={p2} />

			<p className="text-cyber-gray text-sm font-mono mt-2 mb-1">
				Point Compression
			</p>

			<div className="group relative flex-1">
				<div
					className={
						"flex items-center space-x-4 bg-cyber-dark/50 px-4 py-3 rounded-lg border border-cyber-green/30 hover:border-cyber-green/30 transition-all"
					}
				>
					<div className="flex-shrink-0 w-12 h-12 flex items-center justify-center flex-col">
						<FaMapPin className={"w-6 h-6 self-center text-cyber-green/60"} />
						<div className="text-xs text-center mt-1 text-cyber-gray font-mono">
							Packed
						</div>
					</div>

					<div className="font-mono">
						<div className="text-sm">
							<span className={"text-cyber-green/60"}>
								{packed === 0n ? "0" : packed.toString(16)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<ElGamal />
		</main>
	);
}
