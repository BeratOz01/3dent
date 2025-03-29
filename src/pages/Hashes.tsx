import { useState } from "react";
import { HashInput } from "../components/hash/HashInput";
import { HashOutput } from "../components/hash/HashOutput";
import { useHashCalculation } from "../hooks/useHashCalculation";
import type {
	DisplayMode,
	HashFunction,
	HashInput as HashInputType,
	MimcParams,
} from "../types";

export function Hashes() {
	const [inputs, setInputs] = useState<HashInputType[]>([
		{ id: "1", value: "" },
	]);
	const [mimcParams, setMimcParams] = useState<MimcParams>({
		rounds: 220,
		key: 0,
		nOutputs: 2,
	});

	const [selectedFunction, setSelectedFunction] =
		useState<HashFunction>("poseidon");
	const [displayMode, setDisplayMode] = useState<DisplayMode>("decimal");

	const { currentHash } = useHashCalculation(
		inputs,
		selectedFunction,
		mimcParams,
	);

	const onMimcParamsChange = (n: Partial<typeof mimcParams>) =>
		setMimcParams((prev) => ({ ...prev, ...n }));

	const handleInputChange = (id: string, value: string) =>
		setInputs((prev) =>
			prev.map((input) => (input.id === id ? { ...input, value } : input)),
		);

	const handleAddInput = () =>
		setInputs((prev) => [...prev, { id: Date.now().toString(), value: "" }]);

	const handleRemoveInput = (id: string) =>
		setInputs((prev) => prev.filter((input) => input.id !== id));

	const toggleDisplayMode = () =>
		setDisplayMode((prev) => (prev === "decimal" ? "hex" : "decimal"));

	const copyToClipboard = () =>
		navigator.clipboard.writeText(currentHash.toString());

	const onClearInputs = () => setInputs([{ id: "1", value: "" }]);

	return (
		<main className="max-w-4xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-6">
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center">
					Cryptographic Hash Functions
				</h2>
				<p className="text-justify indent-6">
					Cryptographic hash functions are mathematical algorithms that
					transform any input into a fixed-length string of characters, known as
					a hash. These functions are designed to be deterministic,
					collision-resistant, and irreversible, ensuring that even the smallest
					input changes produce drastically different outputs.
				</p>
				<p className="text-justify indent-6">
					In zero-knowledge proofs, hash functions play a critical role. They
					allow developers to create secure commitments, efficient proofs, and
					verifiable computations without revealing sensitive data. Hashes make
					it possible to verify the correctness of computations while keeping
					inputs private.
				</p>
				<p className="text-justify indent-6">
					<strong className="text-cyber-green">Poseidon</strong> is a
					zk-friendly hash function specifically designed to be efficient inside
					zk-SNARK and zk-STARK circuits. Unlike traditional hash functions like
					SHA or Keccak, Poseidon is optimized to reduce the number of
					constraints in arithmetic circuits over finite fields — making it
					extremely efficient for use in zk applications. Its algebraic
					structure is well-suited for zk proving systems, making operations
					like Merkle tree hashing, commitments, and on-chain validation much
					cheaper and scalable.
				</p>
				<p className="text-justify indent-6">
					Another zk-optimized hash function is{" "}
					<strong className="text-cyber-green">MiMC Sponge</strong>, which
					operates on a similar principle but with a different internal
					construction. While MiMC provides excellent performance in certain
					contexts, Poseidon generally outperforms it in constraint minimization
					and proof generation times, especially in zkDSLs and proof systems
					like Halo2, Circom, and Plonk. Both Poseidon and MiMC are widely used
					for hashing sensitive data, generating commitments, and building
					verifiable circuits that preserve privacy at scale.
				</p>
			</div>
			<HashInput
				inputs={inputs}
				selectedFunction={selectedFunction}
				displayMode={displayMode}
				onInputChange={handleInputChange}
				onAddInput={handleAddInput}
				onRemoveInput={handleRemoveInput}
				onFunctionChange={setSelectedFunction}
				onClearInputs={onClearInputs}
				onMimcParamsChange={onMimcParamsChange}
				mimcParams={mimcParams}
			/>

			{currentHash.length > 0 && (
				<div className="mt-6">
					<HashOutput
						hash={currentHash}
						displayMode={displayMode}
						onToggleDisplay={toggleDisplayMode}
						onCopy={copyToClipboard}
					/>
				</div>
			)}
		</main>
	);
}
