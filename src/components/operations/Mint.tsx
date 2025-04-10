import { useState } from "react";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import { formatAmount } from "../../pkg/helpers";

interface MintProps {
	handlePrivateMint: (amount: bigint) => Promise<void>;
	isDecryptionKeySet: boolean;
}

export function Mint({ handlePrivateMint, isDecryptionKeySet }: MintProps) {
	const [mintAmount, setMintAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-cyber-green font-bold mb-2">Private Mint</h3>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4">
					In private minting, a zero-knowledge proof is generated to prove that
					the encrypted amount is valid with respect to your public key using
					ElGamal encryption. The resulting ElGamal ciphertext is
					homomorphically added to your current balance, allowing you to
					increase your encrypted balance without revealing any amounts. In
					addition to the ElGamal ciphertext, the amount is also encrypted using
					Poseidon-based encryption, enabling efficient client-side decryption
					without solving the discrete logarithm problem.
				</p>
			</div>

			<div>
				<input
					type="text"
					value={mintAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setMintAmount(value);
						}
					}}
					placeholder={"..."}
					className="flex-1 bg-cyber-dark text-cyber-gray px-4 py-0.5 rounded-lg border border-cyber-green/20 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green outline-none font-mono w-full"
				/>
				<button
					type="button"
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
					onClick={async () => {
						setLoading(true);
						const formattedAmount = formatAmount(mintAmount);
						handlePrivateMint(formattedAmount)
							.then(() => {
								setLoading(false);
								setMintAmount("");
							})
							.catch((error) => {
								console.log(error);

								toast.error(
									<div>
										<p>{error.reason}</p>
									</div>,
									{
										position: "top-right",
										autoClose: 5000,
										hideProgressBar: true,
										closeOnClick: true,
										pauseOnHover: false,
										draggable: true,
										progress: undefined,
										transition: Bounce,
									},
								);
								setLoading(false);
							});
					}}
					disabled={!mintAmount || loading || !isDecryptionKeySet}
				>
					{loading ? "Minting..." : "Mint"}
				</button>
			</div>
		</>
	);
}
