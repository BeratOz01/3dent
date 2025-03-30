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
	const handleGenerateKeyPair = () => {
		const { privateKey, publicKey } = genKeyPair();
		setKeyPair({ privateKey, publicKey: { x: publicKey[0], y: publicKey[1] } });
	};

	return (
		<main className="max-w-4xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4">
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center">
					Poseidon Encryption & Decryption
				</h2>

				<p className="text-justify indent-6">
					<strong className="text-cyber-green">Poseidon encryption</strong> is a
					zk-friendly symmetric encryption scheme designed to be efficient
					inside zero-knowledge proof systems. In the EERC protocol, it is used
					alongside ElGamal to allow balances to be decrypted without solving
					the discrete logarithm problem.
				</p>

				<p className="text-justify indent-6">
					While ElGamal provides strong homomorphic guarantees and is used in ZK
					proofs, it is computationally expensive to decrypt. To solve this,
					each encrypted balance is also stored using a Poseidon-encrypted
					representation that allows the user to easily decrypt their own
					balance locally using a shared secret key derived from their private
					key. Protocol using ElGamal ciphertext for checking balance validity
					and Poseidon ciphertext for faster decryptions.
				</p>

				<p className="text-justify indent-6">
					This hybrid encryption approach ensures both privacy and usability:
					ElGamal ciphertext ensures ciphertext validity, and Poseidon
					ciphertext allows user for faster decryptions instead of solving the
					discrete logarithm problem.
				</p>

				{/* Optional: live hashing demo or comparison? */}

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
					}}
					keyPair={keyPair}
				/>

				<Divider title="📦 Encryption" />
				<div className="font-mono text-sm text-cyber-gray leading-relaxed mt-6 space-y-4">
					<p>
						When you encrypt data using Poseidon encryption, several components
						are generated to ensure the security and integrity of your encrypted
						values. Here's what each part means:
					</p>

					<ul className="list-disc list-inside space-y-2">
						<li>
							<strong className="text-cyber-green/80">Inputs:</strong> The raw
							values you want to encrypt, such as balances or token amounts.
						</li>
						<li>
							<strong className="text-cyber-green/80">Encryption Key:</strong> A
							shared secret derived from Elliptic Curve Diffie-Hellman (ECDH)
							between your private key and the recipient's public key. Used to
							encrypt the inputs.
						</li>
						<li>
							<strong className="text-cyber-green/80">Nonce:</strong> A random
							value that adds uniqueness to each encryption. It prevents
							encrypted messages from producing the same output even with the
							same input and key.
						</li>
						<li>
							<strong className="text-cyber-green/80">
								Authentication Key:
							</strong>{" "}
							A secondary key derived from the encryption key or hashing
							process, used to ensure that the ciphertext hasn’t been tampered
							with.
						</li>
						<li>
							<strong className="text-cyber-green/80">Ciphertext:</strong> The
							encrypted result of your inputs, which can be safely stored or
							submitted on-chain without revealing the original values.
						</li>
					</ul>

					<p>
						This combination of keys and randomness ensures that your encrypted
						data is both private and verifiable, making it suitable for use in
						privacy-preserving smart contracts like EERC.
					</p>
					<p>
						To allow another user to decrypt the message, you must share the{" "}
						<span className="text-cyber-green font-semibold">ciphertext</span>,
						the <span className="text-cyber-green font-semibold">nonce</span>,
						and the{" "}
						<span className="text-cyber-green font-semibold">auth key</span>{" "}
						(which is <code>Base8 * r</code>). The recipient multiplies this
						auth key with their own private key to derive the shared encryption
						key. This ensures that only the intended recipient, with their
						private key, can successfully decrypt the encrypted data.
					</p>
				</div>

				<p className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-2">
					Input values to encrypt. (separated by commas, e.g. 1,2,3)
				</p>

				<div className="space-y-2">
					<input
						type="text"
						value={inputs}
						onChange={(e) => setInputs(e.target.value)}
						placeholder={"..."}
						className="flex-1 bg-cyber-dark text-cyber-gray px-4 py-0.5 rounded-md border border-cyber-green/20 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green outline-none font-mono w-full mb-2"
					/>
				</div>

				<button
					type="button"
					onClick={() => {
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

						const encrypted = poseidonEncrypt(
							inputs.split(",").map((i) => BigInt(i)),
							_encryptionKey,
							_nonce,
						);

						setCiphertext(encrypted);
					}}
					disabled={!keyPair.privateKey || !inputs}
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
				>
					Encrypt
				</button>

				{!!encryptionRandom && (
					<RightTooltip
						content={
							"r (private) = random scalar to randomize encryption output"
						}
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
						content={"Encryption Key = r * publicKey (private)"}
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
						content={"Authentication Key = Base8 * r (public)"}
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
						content={
							"n (public) = Used as a salt to ensure ciphertext uniqueness"
						}
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
				<button
					type="button"
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono mt-2"
					onClick={() => {
						const sharedKey = mulPointEscalar(
							[authKey.x, authKey.y],
							keyPair.privateKey,
						);

						const _decrypted = poseidonDecryptWithoutCheck(
							ciphertext,
							sharedKey,
							nonce,
							inputs.split(",").length,
						);

						setDecrypted(_decrypted);
					}}
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
						<strong className="text-cyber-green">Decrypted</strong>
						{decrypted.map((d) => (
							<p key={d.toString()}>{d.toString()}</p>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
