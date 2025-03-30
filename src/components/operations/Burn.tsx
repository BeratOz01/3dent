import { useState } from "react";
import { Bounce, toast } from "react-toastify";
import { formatAmount } from "../../pkg/helpers";

interface BurnProps {
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	shouldGenerateKey: boolean;
}

export function Burn({ handlePrivateBurn, shouldGenerateKey }: BurnProps) {
	const [burnAmount, setBurnAmount] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<>
			<div className="flex-1">
				<h3 className="text-cyber-green font-bold mb-2">Private Burn</h3>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4">
					To burn tokens, the protocol performs a private transfer to a special
					identity account with public key <code>(0, 1)</code> — the identity
					point on the BabyJubjub curve. This dummy account has no corresponding
					private key, making the transferred tokens permanently inaccessible.
					This mechanism ensures that tokens are cryptographically removed from
					circulation without breaking the encrypted balance model.
				</p>
			</div>

			<div>
				<input
					type="text"
					value={burnAmount}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*\.?\d{0,2}$/.test(value)) {
							setBurnAmount(value);
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
						const formattedAmount = formatAmount(burnAmount);
						handlePrivateBurn(formattedAmount)
							.then(() => {
								setLoading(false);
								setBurnAmount("");
							})
							.catch((error) => {
								const isUserRejected = error?.details.includes("User rejected");
								toast.error(
									<div>
										<p>
											{isUserRejected ? "Transaction rejected" : error?.message}
										</p>
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
					disabled={!burnAmount || loading || shouldGenerateKey}
				>
					{loading ? "Burning..." : "Burn"}
				</button>
			</div>
		</>
	);
}
