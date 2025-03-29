import { Burn } from "./Burn";
import { Mint } from "./Mint";
import { Transfer } from "./Transfer";

interface OperationsProps {
	handlePrivateMint: (amount: bigint) => Promise<void>;
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	handlePrivateTransfer: (to: string, amount: bigint) => Promise<void>;
}

export function Operations({
	handlePrivateMint,
	handlePrivateBurn,
	handlePrivateTransfer,
}: OperationsProps) {
	return (
		<div className="flex flex-col font-mono space-y-2">
			<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4 mt-2">
				All operations below are fully encrypted using elliptic curve
				cryptography. When you mint, transfer, or burn tokens, the data is
				encrypted with your public key so that only you can decrypt and view
				your balances. For transfer operations, the recipient’s public key will
				be automatically fetched from the protocol to encrypt the tokens for
				them.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px]">
					<Mint handlePrivateMint={handlePrivateMint} />
				</div>

				<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px] ">
					<Burn handlePrivateBurn={handlePrivateBurn} />
				</div>
			</div>

			<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px]">
				{/* <Mint handlePrivateMint={handlePrivateMint} /> */}
				<Transfer handlePrivateTransfer={handlePrivateTransfer} />
			</div>
		</div>
	);
}
