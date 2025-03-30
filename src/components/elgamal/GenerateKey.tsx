import type { IJubPoint } from "../../types";
import { toHex } from "../../utils/conversion";
import { CurvePoint } from "../ecc/CurvePoint";

interface GenerateKeyProps {
	handleGenerateKeyPair: () => void;
	keyPair: {
		privateKey: bigint;
		publicKey: IJubPoint;
	};
}

export const GenerateKey = ({
	handleGenerateKeyPair,
	keyPair,
}: GenerateKeyProps) => {
	return (
		<div className="space-y-4 font-mono">
			<div className="space-y-2">
				<p className="indent-6 text-sm">
					Click the button below to generate a new key pair. This will create a
					random private key, and compute its corresponding public key on the
					BabyJubjub elliptic curve. These keys will be used to perform
					encryption and decryption operations in the next steps.
				</p>
			</div>

			<div className="space-y-4 font-mono">
				{keyPair && (
					<div className="space-y-2 font-mono text-sm">
						<div className="text-cyber-gray">
							Private Key:{" "}
							<span className="text-cyber-green/60">
								{toHex(keyPair.privateKey.toString())}
							</span>
						</div>
						<CurvePoint
							label="Public Key"
							x={keyPair.publicKey.x}
							y={keyPair.publicKey.y}
							onChange={() => {}}
							shouldCollapse={false}
						/>
					</div>
				)}
				<button
					type="button"
					onClick={handleGenerateKeyPair}
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 hover:bg-cyber-green/60 transition-all duration-150"
				>
					Generate Key Pair
				</button>
			</div>
		</div>
	);
};
