export function PoseidonEncrypt() {
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
			</div>
		</main>
	);
}
