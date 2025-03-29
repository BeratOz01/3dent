import { useState } from "react";

interface WithdrawProps {
	handlePrivateWithdraw: (amount: string) => Promise<void>;
	shouldGenerateKey: boolean;
}

export function Withdraw({
	handlePrivateWithdraw,
	shouldGenerateKey,
}: WithdrawProps) {
	const [withdrawAmount, setWithdrawAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	return (
		<>
			<div className="flex-1">
				<h3 className="text-cyber-green font-bold mb-2">Withdraw</h3>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4">
					When user try to withdraw tokens, user generates a proof that the
					encrypted balance is sufficient for the requested withdrawn amount —
					without revealing the actual balance. Contract will then encrypt the
					withdrawn amount using user's public key and homomorphically subtract
					it from the user's encrypted balance. Once the proof is verified, the
					corresponding ERC-20 tokens are transferred back to user's wallet.
				</p>
			</div>

			<div>
				<input
					type="text"
					value={withdrawAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setWithdrawAmount(value);
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
						handlePrivateWithdraw(withdrawAmount)
							.then(() => {
								setLoading(false);
								setWithdrawAmount("");
							})
							.catch((error) => {
								console.error(error);
								setLoading(false);
							});
					}}
					disabled={!withdrawAmount || loading || shouldGenerateKey}
				>
					{loading ? "Withdrawing..." : "Withdraw"}
				</button>
			</div>
		</>
	);
}
