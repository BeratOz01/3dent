import { Base8, type Point, packPoint } from "@zk-kit/baby-jubjub";
import { useEffect, useState } from "react";
import {
	FaCalculator,
	FaInfoCircle,
	FaMapPin,
	FaPlay,
	FaRandom,
} from "react-icons/fa";
import { RightTooltip } from "../components/Tooltip";
import { CurvePoint } from "../components/ecc/CurvePoint";
import { ElGamal } from "../components/ecc/ElGamal";
import { MathEquation } from "../components/ecc/MathEquation";
import { PointOperations } from "../components/ecc/PointOperations";
import { GENERATOR_POINT, IDENTITY_POINT } from "../pkg/constants";
import type { IJubPoint } from "../types";

const PRESET_POINTS = {
	identity: IDENTITY_POINT,
	generator: GENERATOR_POINT,
	base8: { x: Base8[0], y: Base8[1] },
	random: () => ({
		x: BigInt(Math.floor(Math.random() * 1000000)),
		y: BigInt(Math.floor(Math.random() * 1000000)),
	}),
};

export function ECC() {
	const [p1, setP1] = useState<IJubPoint>(IDENTITY_POINT);
	const [p2, setP2] = useState<IJubPoint>(IDENTITY_POINT);
	const [packed, setPacked] = useState<bigint>(0n);

	const handlePoint1Change = (point: Partial<IJubPoint>) =>
		setP1((prev) => ({ ...prev, ...point }));

	const handlePoint2Change = (point: Partial<IJubPoint>) =>
		setP2((prev) => ({ ...prev, ...point }));

	const setPresetPoint = (point: IJubPoint, target: "p1" | "p2") => {
		if (target === "p1") {
			setP1(point);
		} else {
			setP2(point);
		}
	};

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
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center flex items-center justify-center gap-2">
					<FaCalculator className="text-cyber-green" />
					ECC (BabyJubjub)
				</h2>
				<div className="space-y-4">
					<p className="text-justify indent-6">
						The BabyJubjub curve is a zk-friendly elliptic curve specifically
						optimized for use in zero-knowledge proof systems like zk-SNARKs and
						zk-STARKs. It is defined over a finite field with a large prime
						modulus and designed to ensure computational efficiency, making it a
						preferred choice for privacy-preserving applications.
					</p>
					<div className="bg-cyber-dark/30 p-4 rounded-lg border border-cyber-green/20">
						<h3 className="text-cyber-green font-semibold mb-2">
							Why BabyJubjub?
						</h3>
						<ul className="list-disc pl-6 space-y-2 text-sm">
							<li>Optimized for zero-knowledge proofs</li>
							<li>Efficient point operations</li>
							<li>Large prime field for security</li>
							<li>Used in eERC for ElGamal encryption</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
				<div className="bg-cyber-dark py-4 px-6 rounded-lg border border-cyber-green/20">
					<div className="space-y-4">
						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono flex items-center gap-2">
								Curve Equation
								<RightTooltip
									content="The mathematical equation that defines the BabyJubjub curve"
									id="curve-equation-tooltip"
								>
									<FaInfoCircle className="text-cyber-green/60 cursor-help" />
								</RightTooltip>
							</h3>
							<MathEquation>
								<p className="text-sm font-mono">
									y<sup>2</sup> = x<sup>3</sup> + 168700x<sup>2</sup> + x mod (2
									<sup>254</sup> - 127)
								</p>
							</MathEquation>
						</div>

						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono flex items-center gap-2">
								Prime Field
								<RightTooltip
									content="The finite field over which the curve is defined"
									id="prime-field-tooltip"
								>
									<FaInfoCircle className="text-cyber-green/60 cursor-help" />
								</RightTooltip>
							</h3>
							<MathEquation>
								<p className="text-sm font-mono scrollable-text">
									p =
									21888242871839275222246405745257275088548364400416034343698204186575808495617
								</p>
							</MathEquation>
						</div>

						<div>
							<h3 className="text-cyber-gray mb-2 text-sm font-mono flex items-center gap-2">
								Generator Point
								<RightTooltip
									content="Base point used for public key generation and cryptographic operations"
									id="generator-point-tooltip"
								>
									<FaInfoCircle className="text-cyber-green/60 cursor-help" />
								</RightTooltip>
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
							<h3 className="text-cyber-gray mb-2 text-sm font-mono flex items-center gap-2">
								Base8 Point
								<RightTooltip
									content="Alternative base point used for specific operations"
									id="base8-point-tooltip"
								>
									<FaInfoCircle className="text-cyber-green/60 cursor-help" />
								</RightTooltip>
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

			<div className="mt-6">
				<div className="bg-cyber-dark/30 p-4 rounded-lg border border-cyber-green/20 mb-6">
					<h3 className="text-cyber-green font-semibold mb-4 flex items-center gap-2">
						<FaPlay className="text-cyber-green" />
						Point Playground
					</h3>
					<p className="text-sm text-cyber-gray mb-4">
						Experiment with different points on the curve. Try the presets or
						input your own values.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="text-cyber-gray text-sm mb-2">Point P1</h4>
							<div className="flex gap-2 mb-2">
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.identity, "p1")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60"
								>
									Identity
								</button>
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.generator, "p1")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60"
								>
									Generator
								</button>
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.base8, "p1")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60"
								>
									Base8
								</button>
							</div>
							<CurvePoint {...p1} label="P1" onChange={handlePoint1Change} />
						</div>

						<div>
							<h4 className="text-cyber-gray text-sm mb-2">Point P2</h4>
							<div className="flex gap-2 mb-2">
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.identity, "p2")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60"
								>
									Identity
								</button>
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.generator, "p2")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60"
								>
									Generator
								</button>
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.base8, "p2")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60"
								>
									Base8
								</button>
								<button
									type="button"
									onClick={() => setPresetPoint(PRESET_POINTS.random(), "p2")}
									className="text-xs bg-cyber-dark px-2 py-1 rounded border border-cyber-green/30 hover:border-cyber-green/60 flex items-center gap-1"
								>
									<FaRandom className="text-xs" />
									Random
								</button>
							</div>
							<CurvePoint {...p2} label="P2" onChange={handlePoint2Change} />
						</div>
					</div>

					<PointOperations p1={p1} p2={p2} />
				</div>

				<div className="mt-6">
					<p className="text-cyber-gray text-sm font-mono mb-2 flex items-center gap-2">
						Point Compression
						<RightTooltip
							content="Compresses a point into a single value for efficient storage"
							id="point-compression-tooltip"
						>
							<FaInfoCircle className="text-cyber-green/60 cursor-help" />
						</RightTooltip>
					</p>

					<div className="group relative flex-1">
						<div className="flex items-center space-x-4 bg-cyber-dark/50 px-4 py-3 rounded-lg border border-cyber-green/30 hover:border-cyber-green/30 transition-all">
							<div className="flex-shrink-0 w-12 h-12 flex items-center justify-center flex-col">
								<FaMapPin className="w-6 h-6 self-center text-cyber-green/60" />
								<div className="text-xs text-center mt-1 text-cyber-gray font-mono">
									Packed
								</div>
							</div>

							<div className="font-mono">
								<div className="text-sm">
									<span className="text-cyber-green/60">
										{packed === 0n ? "0" : packed.toString(16)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ElGamal />
		</main>
	);
}
