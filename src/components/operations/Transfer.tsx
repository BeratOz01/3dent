import { useState } from "react";
import { formatAmount } from "../../pkg/helpers";

interface TransferProps {
	handlePrivateTransfer: (to: string, amount: bigint) => Promise<void>;
}

export function Transfer({ handlePrivateTransfer }: TransferProps) {
	const [transferAmount, setTransferAmount] = useState<string>("");
	const [to, setTo] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-cyber-green font-bold mb-2">Private Transfer</h3>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4">
					In a private transfer, the recipient’s public key is fetched from the
					protocol and used to encrypt the transferred amount. The sender proves
					ownership of their current balance by decrypting their
					ElGamal-encrypted balance and generating a zero-knowledge proof over
					it. At the same time, the sender creates a new ElGamal ciphertext
					representing <code>-amount</code>, which is homomorphically applied to
					reduce their balance. Thanks to ElGamal’s additive homomorphism, this
					update can be performed without revealing any values on-chain.
				</p>
			</div>

			<div>
				<input
					type="text"
					value={to}
					onChange={(e) => setTo(e.target.value.trim())}
					placeholder={"Recipient"}
					className="flex-1 bg-cyber-dark text-cyber-gray px-2 py-0.5 rounded-lg border border-cyber-green/20 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green outline-none font-mono w-full mb-2"
				/>
				<input
					type="text"
					value={transferAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setTransferAmount(value);
						}
					}}
					placeholder={"Amount"}
					className="flex-1 bg-cyber-dark text-cyber-gray px-2 py-0.5 rounded-lg border border-cyber-green/20 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green outline-none font-mono w-full"
				/>
				<button
					type="button"
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						setLoading(true);
						const formattedAmount = formatAmount(transferAmount);
						handlePrivateTransfer(to, formattedAmount).then(() => {
							setLoading(false);
							setTransferAmount("");
						});
					}}
					disabled={!transferAmount || loading || !to}
				>
					{loading ? "Transferring..." : "Transfer"}
				</button>
			</div>
		</>
	);
}
