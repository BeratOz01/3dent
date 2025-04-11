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
import { toHex } from "../utils/conversion";

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
	const [displayMode, setDisplayMode] = useState<DisplayMode>("hex");

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

	const copyToClipboard = () => {
		navigator.clipboard.writeText(
			displayMode === "decimal"
				? currentHash.toString()
				: toHex(currentHash.toString()),
		);
	};

	const onClearInputs = () => setInputs([{ id: "1", value: "" }]);

	return (
		<main className="max-w-4xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-6">
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center">
					Cryptographic Hash Functions
				</h2>
				<p className="text-justify indent-6">
					Hash functions are like digital fingerprints for data. They take any
					input (text, numbers, files) and transform it into a fixed-length
					string of characters. This transformation is designed to be:
				</p>
				<ul className="list-disc pl-10 mt-1">
					<li>
						<strong>Deterministic</strong> - The same input always produces the
						same output
					</li>
					<li>
						<strong>One-way</strong> - It's practically impossible to reverse
						the process
					</li>
					<li>
						<strong>Collision-resistant</strong> - Different inputs rarely
						produce the same output
					</li>
					<li>
						<strong>Avalanche Effect</strong> - Any modification to the input
						results in significant changes to the output hash
					</li>
				</ul>

				<h3 className="text-cyber-green font-bold text-md mt-6">
					Hash Functions in Zero-Knowledge Proofs
				</h3>
				<p className="text-justify indent-6">
					Zero-knowledge proofs allow you to prove you know something without
					revealing what you know. Hash functions are essential building blocks
					in these systems, enabling:
				</p>
				<ul className="list-disc pl-10 mb-2">
					<li>
						<strong>Secure data commitments</strong> - A commitment is like a
						sealed envelope containing a secret. You can show others that you
						have a secret without revealing what it is. Later, you can "open"
						the commitment to prove you knew the secret all along. This is
						crucial for privacy-preserving systems.
					</li>
					<li>
						<strong>Efficient verification of computations</strong> - Hash
						functions can be used to verify computations without revealing the
						inputs or outputs.
					</li>
				</ul>

				<p className="text-justify indent-6">
					For example, imagine you want to prove you know a password without
					actually sharing it. You could create a commitment by hashing the
					password. You can share this hash with others, and later prove you
					knew the password by showing that hashing your password produces the
					same hash you shared earlier.
				</p>

				<h3 className="text-cyber-green font-bold text-md mt-2">
					Poseidon Hash
				</h3>
				<p className="text-justify indent-6">
					<strong className="text-cyber-green">Poseidon</strong> is a modern
					hash function specifically designed for zero-knowledge applications.
					Unlike traditional hash functions like SHA-256, Poseidon is optimized
					to work efficiently within zero-knowledge proof systems. This makes
					it:
				</p>
				<ul className="list-disc pl-10 mb-2">
					<li>Much faster to compute in zero-knowledge contexts</li>
					<li>More cost-effective for blockchain applications</li>
					<li>Ideal for building privacy-preserving systems</li>
				</ul>

				<h3 className="text-cyber-green font-bold text-md mt-2">MiMC Sponge</h3>
				<p className="text-justify indent-6">
					<strong className="text-cyber-green">MiMC Sponge</strong> is another
					zero-knowledge friendly hash function. While Poseidon generally offers
					better performance, MiMC remains important in certain specialized
					applications. Both functions are widely used in:
				</p>
				<ul className="list-disc pl-10">
					<li>Privacy-preserving blockchain transactions</li>
					<li>Secure data verification systems</li>
					<li>Zero-knowledge proof frameworks</li>
				</ul>

				<p className="text-justify indent-6 mt-2">
					Try out the hash calculator below to see how these functions generate
					unique hashes from any input.
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
