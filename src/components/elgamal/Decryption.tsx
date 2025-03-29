import type { IJubPoint } from "../../types";
import { toHex } from "../../utils/conversion";
import { CurvePoint } from "../ecc/CurvePoint";

interface DecryptionProps {
	decrypted: IJubPoint;
	handleDecrypt: () => void;
	canDecrypt: boolean;
	packedOriginal: string;
	packedDecrypted: string;
}

export const Decryption = ({
	decrypted,
	handleDecrypt,
	canDecrypt,
	packedOriginal,
	packedDecrypted,
}: DecryptionProps) => {
	return (
		<div className="font-mono">
			<div className="border border-cyber-green/40 p-4 rounded bg-black/20">
				<h3 className="font-bold mb-2">🔑 Strategy</h3>
				<p>
					Using the private key <code>x</code>, recover the original message
					point by reversing the encryption process with{" "}
					<code>M = C₂ - xC₁</code>. Here, <code>xC₁</code> reconstructs the
					shared secret used during encryption, and subtracting it from{" "}
					<code>C₂</code> reveals the original message point <code>M</code> on
					the BabyJubjub curve.
				</p>
			</div>
			<button
				onClick={handleDecrypt}
				type="button"
				disabled={!canDecrypt}
				className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 mt-4 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200"
			>
				Decrypt
			</button>
			{!!decrypted &&
				!!decrypted.x &&
				!!decrypted.y &&
				decrypted.x !== 0n &&
				decrypted.y !== 0n && (
					<>
						<p className="text-sm font-mono text-cyber-gray my-2 italic">
							Note: Using the private key x, recover the original message point
							by reversing the encryption process with M = C₂ - xC₁. Here, xC₁
							reconstructs the shared secret used during encryption, and
							subtracting it from C₂ reveals the original message point M on the
							BabyJubjub curve. However, because recovering the original message
							scalar m from the point M = mG would require solving the elliptic
							curve discrete logarithm problem (ECDLP) — which is
							computationally infeasible — we compare the packed representation
							of the original point mG and the decrypted point M to verify
							correctness.
						</p>

						<CurvePoint
							x={decrypted.x}
							y={decrypted.y}
							onChange={() => {}}
							shouldCollapse={false}
							label="Decrypted Point"
						/>

						<div
							className={`text-xs p-3 rounded-md font-mono mt-2 ${
								packedOriginal === packedDecrypted
									? "bg-cyber-green/5 border border-cyber-green/40 text-cyber-green"
									: "bg-cyber-red/5 border border-cyber-red/40 text-cyber-red"
							}`}
						>
							<p className="mb-2 font-semibold">
								{packedOriginal === packedDecrypted
									? "✅ Points match"
									: "❌ Points do not match"}
							</p>
							<p>
								Original message (mG): <code>{toHex(packedOriginal)}</code>
							</p>
							<p>
								Decrypted message (M): <code>{toHex(packedDecrypted)}</code>
							</p>
						</div>
					</>
				)}
		</div>
	);
};
