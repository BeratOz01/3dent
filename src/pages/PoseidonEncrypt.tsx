import { Base8, mulPointEscalar, packPoint } from "@zk-kit/baby-jubjub";
import {
	poseidonDecryptWithoutCheck,
	poseidonEncrypt,
} from "@zk-kit/poseidon-cipher";
import { useState } from "react";
import { Divider } from "../components";
import { RightTooltip } from "../components/Tooltip";
import { GenerateKey } from "../components/elgamal/GenerateKey";
import { IDENTITY_POINT } from "../pkg/constants";
import { genKeyPair, genRandomScalar } from "../pkg/jub";
import type { IJubPoint } from "../types";

export function PoseidonEncrypt() {
	const [keyPair, setKeyPair] = useState<{
		privateKey: bigint;
		publicKey: IJubPoint;
	}>({
		privateKey: 0n,
		publicKey: IDENTITY_POINT,
	});

	const [nonce, setNonce] = useState<bigint>(0n);
	const [encryptionRandom, setEncryptionRandom] = useState<bigint>(0n);
	const [encryptionKey, setEncryptionKey] = useState<IJubPoint>(IDENTITY_POINT);
	const [authKey, setAuthKey] = useState<IJubPoint>(IDENTITY_POINT);
	const [inputs, setInputs] = useState<string>("");
	const [ciphertext, setCiphertext] = useState<bigint[]>([]);
	const [decrypted, setDecrypted] = useState<bigint[]>([]);
	const [error, setError] = useState<string>("");

	const handleGenerateKeyPair = () => {
		const { privateKey, publicKey } = genKeyPair();
		setKeyPair({ privateKey, publicKey: { x: publicKey[0], y: publicKey[1] } });
	};

	const handleEncrypt = () => {
		try {
			setError("");

			// Validate inputs
			if (!inputs.trim()) {
				throw new Error("Please enter numbers to encrypt");
			}

			// Parse and validate numbers
			const numbers = inputs
				.split(",")
				.map((num) => {
					const trimmed = num.trim();
					if (!trimmed) return null;

					try {
						return BigInt(trimmed);
					} catch (e) {
						throw new Error(`Invalid number: ${trimmed}`);
					}
				})
				.filter((num) => num !== null);

			if (numbers.length === 0) {
				throw new Error("Please enter at least one valid number");
			}

			const _nonce = genRandomScalar() % 2n ** 128n;
			const _encRandom = genRandomScalar();
			const _encryptionKey = mulPointEscalar(
				[keyPair.publicKey.x, keyPair.publicKey.y],
				_encRandom,
			);
			const _authKey = mulPointEscalar(Base8, _encRandom);

			setNonce(_nonce);
			setEncryptionRandom(_encRandom);
			setEncryptionKey({
				x: _encryptionKey[0],
				y: _encryptionKey[1],
			});
			setAuthKey({
				x: _authKey[0],
				y: _authKey[1],
			});

			const encrypted = poseidonEncrypt(numbers, _encryptionKey, _nonce);

			setCiphertext(encrypted);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred during encryption",
			);
			setCiphertext([]);
		}
	};

	const handleDecrypt = () => {
		try {
			setError("");

			const sharedKey = mulPointEscalar(
				[authKey.x, authKey.y],
				keyPair.privateKey,
			);

			const _decrypted = poseidonDecryptWithoutCheck(
				ciphertext,
				sharedKey,
				nonce,
				inputs.split(",").filter((n) => n.trim()).length,
			);

			setDecrypted(_decrypted);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred during decryption",
			);
			setDecrypted([]);
		}
	};

	return (
		<main className="max-w-4xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4">
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center">
					Poseidon Encryption & Decryption
				</h2>

				<p className="text-justify indent-6">
					<strong className="text-cyber-green">Poseidon encryption</strong> is a
					specialized encryption method designed to work efficiently within
					zero-knowledge proof systems. Unlike traditional encryption methods,
					it's optimized for privacy-preserving applications where computational
					efficiency is crucial.
				</p>

				<p className="text-justify indent-6">
					This encryption scheme is particularly useful in blockchain
					applications where you need to:
				</p>
				<ul className="list-disc pl-10 mb-4">
					<li>
						Encrypt sensitive data while maintaining the ability to verify its
						validity
					</li>
					<li>
						Allow users to decrypt their own data without revealing it to others
					</li>
					<li>
						Perform operations on encrypted data without decrypting it first
					</li>
				</ul>

				<p className="text-justify indent-6">
					In privacy-preserving protocols, Poseidon encryption is often used
					alongside other cryptographic tools to create a balance between
					security, privacy, and usability.
				</p>

				<div className="bg-cyber-dark/50 border border-cyber-green/50 p-4 rounded-md my-6">
					<h3 className="text-cyber-green font-bold mb-2">
						Poseidon Encryption (PCTS) in eERC
					</h3>
					<p className="text-justify">
						In eERC users encrypted balance in 2 way, first one is using ElGamal
						encryption and the other one is using set of a Poseidon encryption
						cipher texts. While users proving their balance in zero-knowledge
						circuit, they use ElGamal cipher texts to prove their balance. It is
						only used for validity of cipher texts. Since decryption is costly
						in ElGamal, we can decrypt the set of poseidon cipher texts to get
						the decrypted balance.
					</p>
					<ul className="list-disc pl-10 mt-2 space-y-1">
						<li>
							Users can only decrypt their own balance and the amounts they're
							receiving
						</li>
						<li>
							Zero-knowledge proof verifiers only check the validity of the
							ElGamal encryption
						</li>
						<li>
							In a browser environment, users can decrypt their Poseidon
							ciphertext to see their balance
						</li>
					</ul>
					<p className="text-justify mt-2">
						This demo is for educational purposes to understand how Poseidon
						encryption works, but in production systems, ElGamal encryption is
						used for ERC token balances.
					</p>
				</div>

				<Divider title="🔐 Key Generation" />
				<GenerateKey
					handleGenerateKeyPair={() => {
						handleGenerateKeyPair();
						setNonce(0n);
						setEncryptionRandom(0n);
						setEncryptionKey(IDENTITY_POINT);
						setCiphertext([]);
						setAuthKey(IDENTITY_POINT);
						setDecrypted([]);
						setError("");
					}}
					keyPair={keyPair}
				/>

				<Divider title="📦 Encryption" />
				<div className="font-mono text-sm text-cyber-gray leading-relaxed mt-6 space-y-4">
					<p>
						When you encrypt data using Poseidon encryption, several components
						work together to ensure security:
					</p>

					<ul className="list-disc pl-10 space-y-2">
						<li>
							<strong className="text-cyber-green/80">Inputs:</strong> The
							numbers you want to encrypt (like account balances or transaction
							amounts).
						</li>
						<li>
							<strong className="text-cyber-green/80">Encryption Key:</strong> A
							shared secret created using your private key and the recipient's
							public key. This ensures only the intended recipient can decrypt
							the data.
						</li>
						<li>
							<strong className="text-cyber-green/80">Nonce:</strong> A random
							value that makes each encryption unique, even if you encrypt the
							same data multiple times.
						</li>
						<li>
							<strong className="text-cyber-green/80">
								Authentication Key:
							</strong>{" "}
							A verification key that helps ensure the encrypted data hasn't
							been tampered with.
						</li>
						<li>
							<strong className="text-cyber-green/80">Ciphertext:</strong> The
							final encrypted result that can be safely stored or transmitted.
						</li>
					</ul>

					<p>
						To share encrypted data with someone, you need to provide them with
						three pieces of information:
					</p>
					<ul className="list-disc pl-10 space-y-2">
						<li>
							The{" "}
							<span className="text-cyber-green font-semibold">ciphertext</span>{" "}
							(the encrypted data)
						</li>
						<li>
							The <span className="text-cyber-green font-semibold">nonce</span>{" "}
							(the random value used during encryption)
						</li>
						<li>
							The{" "}
							<span className="text-cyber-green font-semibold">auth key</span>{" "}
							(used to verify the data hasn't been tampered with)
						</li>
					</ul>
					<p>
						The recipient can then use their private key to decrypt the data,
						ensuring that only they can access the original information.
					</p>
				</div>

				<p className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-2">
					Enter numbers to encrypt (separated by commas, e.g. 1,2,3)
				</p>

				<div className="space-y-2">
					<input
						type="text"
						value={inputs}
						onChange={(e) => setInputs(e.target.value)}
						placeholder={"Enter numbers separated by commas"}
						className="flex-1 bg-cyber-dark text-cyber-gray px-4 py-0.5 rounded-md border border-cyber-green/20 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green outline-none font-mono w-full mb-2"
					/>
				</div>

				{error && (
					<div className="bg-red-900/30 border border-red-500/50 text-red-300 py-2 px-4 rounded-md text-sm mt-2 mb-2 font-mono">
						<strong>Error:</strong> {error}
					</div>
				)}

				<button
					type="button"
					onClick={handleEncrypt}
					disabled={!keyPair.privateKey || !inputs}
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
				>
					Encrypt
				</button>

				{!!encryptionRandom && (
					<RightTooltip
						content={"Random value used to create unique encryption keys"}
						id="encryption-random"
					>
						<div className="border border-cyber-green/40 py-2 px-4 rounded bg-black/20 mt-2 text-sm">
							<p>
								<strong className="text-cyber-green">Encryption Random</strong>:{" "}
								<code>{encryptionRandom.toString()}</code>
							</p>
						</div>
					</RightTooltip>
				)}
				{!!encryptionKey && !!encryptionKey.x && (
					<RightTooltip
						content={"The key used to encrypt your data"}
						id="encryption-key"
					>
						<div className="border border-cyber-green/40 py-2 px-4 rounded bg-black/20 mt-2 text-sm">
							<p>
								<strong className="text-cyber-green">Encryption Key</strong>:{" "}
								<code>
									{packPoint([encryptionKey.x, encryptionKey.y]).toString(16)}
								</code>
							</p>
						</div>
					</RightTooltip>
				)}
				{!!authKey && !!authKey.x && (
					<RightTooltip
						content={
							"Used to verify the encrypted data hasn't been tampered with"
						}
						id="auth-key"
					>
						<div className="border border-cyber-green/40 py-2 px-4 rounded bg-black/20 mt-2 text-sm">
							<p>
								<strong className="text-cyber-green">Authentication Key</strong>
								: <code>{packPoint([authKey.x, authKey.y]).toString(16)}</code>
							</p>
						</div>
					</RightTooltip>
				)}
				{!!nonce && (
					<RightTooltip
						content={"Random value that ensures each encryption is unique"}
						id="nonce"
					>
						<div className="border border-cyber-green/40 py-2 px-4 rounded bg-black/20 text-sm mt-2">
							<p>
								<strong className="text-cyber-green">Nonce</strong>:{" "}
								<code>{nonce.toString()}</code>
							</p>
						</div>
					</RightTooltip>
				)}

				{ciphertext.length > 0 && (
					<div className="border border-cyber-green/40 py-2 px-4 rounded bg-black/20 text-sm mt-2 font-mono">
						<strong className="text-cyber-green">Ciphertext</strong>
						{ciphertext.map((c) => (
							<p key={c.toString()}>{c.toString()}</p>
						))}
					</div>
				)}

				<Divider title="🔑 Decryption" />
				<p className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-2">
					Click the button below to decrypt the data using your private key.
				</p>
				<button
					type="button"
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
					onClick={handleDecrypt}
					disabled={
						!keyPair.privateKey ||
						!ciphertext.length ||
						!authKey.x ||
						!authKey.y ||
						!encryptionKey.x ||
						!encryptionKey.y
					}
				>
					Decrypt
				</button>

				{decrypted.length > 0 && (
					<div className="border border-cyber-green/40 py-2 px-4 rounded bg-black/20 text-sm mt-2 font-mono">
						<strong className="text-cyber-green">Decrypted Values</strong>
						{decrypted.map((d) => (
							<p key={d.toString()}>{d.toString()}</p>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
