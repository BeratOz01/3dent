import { useState } from "react";

interface DepositProps {
	handlePrivateDeposit: (amount: string) => Promise<void>;
	shouldGenerateKey: boolean;
}

export function Deposit({
	handlePrivateDeposit,
	shouldGenerateKey,
}: DepositProps) {
	const [depositAmount, setDepositAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-cyber-green font-bold mb-2">Deposit</h3>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4">
					When you deposit tokens, you first approve the converter contract to
					spend your ERC-20. Once approved and and deposited, the contract
					receives the tokens and encrypts the deposited amount using your
					public key. This encrypted value is then added to your private balance
					using homomorphic operations.
				</p>
			</div>

			<div>
				<input
					type="text"
					value={depositAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setDepositAmount(value);
						}
					}}
					placeholder={"Amount in ether (eg. 1.5, 0.01)"}
					className="flex-1 bg-cyber-dark text-cyber-gray px-2 py-0.5 rounded-lg border border-cyber-green/20 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green outline-none font-mono w-full"
				/>
				<button
					type="button"
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						setLoading(true);
						handlePrivateDeposit(depositAmount)
							.then(() => {
								setLoading(false);
								setDepositAmount("");
							})
							.catch((error) => {
								console.error(error);
								setLoading(false);
							});
					}}
					disabled={!depositAmount || loading || shouldGenerateKey}
				>
					{loading ? "Depositing..." : "Deposit"}
				</button>
			</div>
		</>
	);
}
