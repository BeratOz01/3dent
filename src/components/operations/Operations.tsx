import { Burn } from "./Burn";
import { Deposit } from "./Deposit";
import { Mint } from "./Mint";
import { Transfer } from "./Transfer";
import { Withdraw } from "./Withdraw";

interface OperationsProps {
	handlePrivateMint: (amount: bigint) => Promise<void>;
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	handlePrivateTransfer: (to: string, amount: string) => Promise<void>;
	handlePrivateDeposit: (amount: string) => Promise<void>;
	handlePrivateWithdraw: (amount: string) => Promise<void>;
	mode: "standalone" | "converter";
	shouldGenerateKey: boolean;
}

export function Operations({
	handlePrivateMint,
	handlePrivateBurn,
	handlePrivateTransfer,
	handlePrivateDeposit,
	handlePrivateWithdraw,
	shouldGenerateKey,
	mode,
}: OperationsProps) {
	return (
		<div className="flex flex-col font-mono space-y-2">
			<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4 mt-2 indent-6">
				All operations below are fully encrypted using elliptic curve
				cryptography. When you mint, transfer, or burn tokens, the data is
				encrypted with your public key so that only you can decrypt and view
				your balances. For transfer operations, the recipient’s public key will
				be automatically fetched from the protocol to encrypt the tokens for
				them.
			</p>

			{mode === "standalone" && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px]">
						<Mint
							handlePrivateMint={handlePrivateMint}
							shouldGenerateKey={shouldGenerateKey}
						/>
					</div>

					<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px] ">
						<Burn
							handlePrivateBurn={handlePrivateBurn}
							shouldGenerateKey={shouldGenerateKey}
						/>
					</div>
				</div>
			)}

			{mode === "converter" && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px]">
						<Deposit
							handlePrivateDeposit={handlePrivateDeposit}
							shouldGenerateKey={shouldGenerateKey}
						/>
					</div>

					<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px] ">
						<Withdraw
							handlePrivateWithdraw={handlePrivateWithdraw}
							shouldGenerateKey={shouldGenerateKey}
						/>
					</div>
				</div>
			)}

			<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4 flex flex-col min-h-[200px]">
				<Transfer
					handlePrivateTransfer={handlePrivateTransfer}
					shouldGenerateKey={shouldGenerateKey}
				/>
			</div>
		</div>
	);
}
