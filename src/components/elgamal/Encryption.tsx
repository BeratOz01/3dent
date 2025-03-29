import { Base8, mulPointEscalar } from "@zk-kit/baby-jubjub";
import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { GENERATOR_POINT, IDENTITY_POINT } from "../../pkg/constants";
import type { IJubPoint } from "../../types";
import { CurvePoint } from "../ecc/CurvePoint";

export const Encryption = ({
	message,
	setMessage,
	handleEncrypt,
	ciphertext,
	setCiphertext,
	encryptionRandom,
	setDecrypted,
}: {
	message: string;
	setMessage: (message: string) => void;
	handleEncrypt: () => void;
	ciphertext: { C1: IJubPoint; C2: IJubPoint };
	setCiphertext: (ciphertext: { C1: IJubPoint; C2: IJubPoint }) => void;
	encryptionRandom: bigint;
	setDecrypted: (decrypted: IJubPoint) => void;
}) => {
	const [scalarMulResult, setScalarMulResult] =
		useState<IJubPoint>(IDENTITY_POINT);

	useEffect(() => {
		try {
			if (message) {
				const msgInBigInt = BigInt(message);
				const msgInPoint = mulPointEscalar(Base8, msgInBigInt);
				setScalarMulResult({
					x: msgInPoint[0],
					y: msgInPoint[1],
				});
				return;
			}

			setScalarMulResult(IDENTITY_POINT);
		} catch (e) {
			console.error("Invalid message", e);
		}
	}, [message]);

	return (
		<motion.div className="font-mono">
			<p className="text-justify indent-6 font-mono text-sm">
				ElGamal encryption is a public-key cryptographic scheme based on the
				hardness of the discrete logarithm problem. In the context of elliptic
				curves, such as BabyJubjub, ElGamal provides a secure and efficient way
				to encrypt data using elliptic curve arithmetic. Unlike traditional
				encryption schemes, ElGamal allows operations to be performed on
				encrypted data. This means you can securely manipulate values without
				exposing their contents — a property known as homomorphism. In
				privacy-focused protocols, this enables users to update or transfer
				balances without ever revealing the underlying numbers, making it ideal
				for use in zero-knowledge systems and encrypted smart contracts.
			</p>

			<div className="border border-cyber-green/40 p-4 rounded bg-black/20 my-4">
				<h3 className="font-bold mb-2">📦 Strategy</h3>
				<p>
					Pick a random scalar <code>r</code>, compute <code>C₁ = rG</code> and{" "}
					<code>C₂ = M + rP</code>. The pair <code>(C₁, C₂)</code> is the
					ciphertext.
				</p>
			</div>

			{!!encryptionRandom && (
				<div className="border border-cyber-green/40 p-4 rounded bg-black/20 my-4">
					<p>
						Encryption random: <code>{encryptionRandom.toString()}</code>
					</p>
				</div>
			)}

			<div className="w-full flex flex-row justify-between text-sm text-cyber-green/50 px-1">
				<p>Message to encrypt:</p>
				<p>Corresponding point on the curve (mG):</p>
			</div>
			<div className="flex gap-2 mt-1">
				<input
					type="text"
					value={message}
					onChange={(e) => {
						const value = e.target.value.trim();
						if (/^\d*$/.test(value)) {
							setMessage(value);
							setCiphertext({ C1: IDENTITY_POINT, C2: IDENTITY_POINT });
							setDecrypted(IDENTITY_POINT);
						}
					}}
					placeholder={"Message"}
					className="flex-0.1 bg-cyber-dark/50 text-cyber-gray p-2.5 rounded-lg border border-cyber-green/20 outline-none font-mono text-center text-lg"
				/>
				<CurvePoint
					x={scalarMulResult.x}
					y={scalarMulResult.y}
					onChange={() => {}} // Empty function
					label={"mG"}
					shouldCollapse={true}
				/>
			</div>
			<button
				type="button"
				onClick={handleEncrypt}
				disabled={!message || message.length === 0 || !scalarMulResult}
				className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 mt-4 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200"
			>
				Encrypt
			</button>
			<p className="text-sm text-cyber-green/70 mb-2 px-1">
				Ciphertext (C1, C2) = (rG, mG + rP)
			</p>
			<div className="flex flex-col gap-2">
				<CurvePoint
					x={ciphertext.C1.x}
					y={ciphertext.C1.y}
					onChange={() => {}} // Empty function
					label={"C1"}
					shouldCollapse={false}
				/>
				<CurvePoint
					x={ciphertext.C2.x}
					y={ciphertext.C2.y}
					onChange={() => {}} // Empty function
					label={"C2"}
					shouldCollapse={false}
				/>
			</div>
		</motion.div>
	);
};
