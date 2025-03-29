import {
	type CompatiblePublicClient,
	type CompatibleWalletClient,
	useEERC,
} from "@avalabs/eerc-sdk-next";
import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import {
	injected,
	useAccount,
	useConnect,
	useDisconnect,
	usePublicClient,
	useWaitForTransactionReceipt,
	useWalletClient,
} from "wagmi";
import { Divider } from "../components";
import { CurvePoint } from "../components/ecc/CurvePoint";
import { Operations } from "../components/operations/Operations";
import { formatDisplayAmount } from "../pkg/helpers";

const eERC_STANDALONE_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

export function EERC() {
	const [txHash, setTxHash] = useState<`0x${string}`>("" as `0x${string}`);

	const {
		data: transactionReceipt,
		isSuccess,
		isFetched,
	} = useWaitForTransactionReceipt({
		hash: txHash,
		query: { enabled: Boolean(txHash) },
		confirmations: 1,
	});

	useEffect(() => {
		if (txHash && isSuccess && isFetched && transactionReceipt) {
			toast.success(
				"Transaction successful".concat(
					`\n\n${transactionReceipt?.transactionHash}`,
				),
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

			setTxHash("" as `0x${string}`);
		}
	}, [txHash, isSuccess, isFetched, transactionReceipt]);

	const { connectAsync } = useConnect();
	const { disconnectAsync } = useDisconnect();
	const { address, isConnected, isConnecting } = useAccount();
	const explorerBaseUrl = "https://testnet.snowtrace.io/address/";

	const publicClient = usePublicClient({ chainId: 31337 });
	const { data: walletClient } = useWalletClient();

	const {
		isRegistered,
		shouldGenerateDecryptionKey,
		generateDecryptionKey,
		register,
		auditorPublicKey,
		publicKey,
		useEncryptedBalance,
		name,
		symbol,
		owner,
		isConverter,
		isAuditorKeySet,
		isAddressRegistered,
	} = useEERC(
		publicClient as CompatiblePublicClient,
		walletClient as CompatibleWalletClient,
		eERC_STANDALONE_ADDRESS,
		{
			transferURL: "/prover_transfer.wasm",
			multiWasmURL: "/prover_multi.wasm",
		},
		// "1d78423757195ab4f2c36f81e14ab30916a04f98158d3cbca09344477383c4d",
	);

	const {
		decryptedBalance,
		encryptedBalance,
		decimals,
		privateMint,
		privateBurn,
		privateTransfer,
	} = useEncryptedBalance();

	const handlePrivateMint = async (amount: bigint) => {
		if (!isConnected) {
			console.log("Not connected");
			return;
		}

		if (!address) {
			console.log("No address");
			return;
		}

		const { transactionHash } = await privateMint(address, amount);
		setTxHash(transactionHash as `0x${string}`);
	};

	const handlePrivateBurn = async (amount: bigint) => {
		if (!isConnected) {
			console.log("Not connected");
			return;
		}

		const { transactionHash } = await privateBurn(amount);
		setTxHash(transactionHash as `0x${string}`);
	};

	const handlePrivateTransfer = async (to: string, amount: bigint) => {
		if (!isConnected) {
			console.log("Not connected");
			return;
		}

		const { isRegistered: isToRegistered } = await isAddressRegistered(
			to as `0x${string}`,
		);
		if (!isToRegistered) {
			toast.error("Recipient is not registered");
			return;
		}

		const { transactionHash } = await privateTransfer(to, amount);
		setTxHash(transactionHash as `0x${string}`);
	};

	return (
		<main className="max-w-6xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4 mb-6">
				<h2 className="text-cyber-green font-bold text-lg mb-4 text-center">
					eERC
				</h2>
			</div>

			<div className="space-y-2 text-sm font-mono text-cyber-gray leading-relaxed indent-6">
				<p>
					The EERC protocol supports two modes of operation, depending on how
					the contract is deployed:
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4">
						<h3 className="text-cyber-green font-bold mb-2">Standalone Mode</h3>
						<p>
							Behaves like a standard token with privacy features — users can
							mint, transfer, and burn directly.
						</p>
					</div>

					<div className="border border-cyber-green/30 bg-black/10 rounded-lg p-4">
						<h3 className="text-cyber-green font-bold mb-2">Converter Mode</h3>
						<p>
							Wraps an existing ERC-20. Users deposit ERC-20 tokens and receive
							their encrypted equivalents.
						</p>
					</div>
				</div>

				<p className="text-xs text-cyber-green/70 mt-0">
					Want to learn more? See the full documentation on our{" "}
					<a
						href="https://your-gitbook-link.com"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-cyber-green"
					>
						GitBook →
					</a>
				</p>
			</div>

			<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4 mt-4 indent-6">
				The contracts below are deployed on the{" "}
				<strong className="text-cyber-green">Avalanche Fuji Testnet</strong>.
				There are two modes of the EERC protocol:
				<span className="text-cyber-green"> Standalone </span> and
				<span className="text-cyber-green"> Converter</span>. You can connect
				your wallet to the Fuji network and interact with these contracts
				directly — mint, transfer, burn, or convert depending on the mode.
			</p>

			{/* Contracts */}
			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="text-cyber-green font-bold mb-2">📜 Contracts</div>
				<div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-4 items-center">
					<div className="text-cyber-green">Standalone Mode</div>
					<div className="text-cyber-green/80 break-all">
						<div>0x0000000000000000000000000000000000000000</div>
						<a
							href={`${explorerBaseUrl}0x0000000000000000000000000000000000000000`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
						>
							See on Explorer →
						</a>
					</div>

					<div className="text-cyber-green">Converter Mode</div>
					<div className="text-cyber-green/80 break-all">
						<div>0x0000000000000000000000000000000000000000</div>
						<a
							href={`${explorerBaseUrl}0x0000000000000000000000000000000000000000`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
						>
							See on Explorer →
						</a>
					</div>

					<div className="text-cyber-green">Dummy ERC-20</div>
					<div className="text-cyber-green/80 break-all">
						<div>0x0000000000000000000000000000000000000000</div>
						<a
							href={`${explorerBaseUrl}0x0000000000000000000000000000000000000000`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
						>
							See on Explorer →
						</a>
					</div>
				</div>
			</div>

			{/* Faucet */}
			<div className="border border-cyber-green/30 rounded-md p-2 font-mono text-sm bg-black/10 mt-2 p-3">
				<p className="text-xs font-mono text-cyber-gray">
					💧 Need test tokens? You can get AVAX on the Fuji testnet from the{" "}
					<a
						href="https://core.app/en/tools/testnet-faucet/?subnet=c&token=c"
						target="_blank"
						rel="noopener noreferrer"
						className="text-cyber-green underline hover:text-cyber-green/80"
					>
						Avalanche Faucet →
					</a>
				</p>
			</div>

			<Divider title="🔗 Connect Wallet" />
			<button
				type="button"
				className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono"
				disabled={isConnected}
				onClick={() => {
					if (isConnected) {
						console.log("Already connected");
						return;
					}

					connectAsync({ connector: injected() });
				}}
			>
				{isConnected
					? `Connected as (${address})`
					: isConnecting
						? "Connecting..."
						: "Connect Wallet"}
			</button>

			{isConnected && (
				<button
					type="button"
					className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono"
					disabled={!isConnected}
					onClick={() => {
						if (!isConnected) {
							console.log("Not connected");
							return;
						}

						disconnectAsync();
					}}
				>
					Disconnect
				</button>
			)}

			<Divider title="🔑 Generate Decryption Key" />
			<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4 indent-6">
				To enable private transactions, each user must generate a unique
				decryption key tied to their wallet address. This key is used to encrypt
				and decrypt balances locally in the browser — it is never uploaded or
				stored on-chain. This key will be derived from your signature.
			</p>
			<button
				type="button"
				className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono"
				disabled={
					!isConnected || (isRegistered && !shouldGenerateDecryptionKey)
				}
				onClick={async () => {
					if (!isConnected) {
						console.log("Not connected");
						return;
					}

					generateDecryptionKey()
						.then((key) => {
							console.log(key);

							toast.success("🔑 Decryption key generated!", {
								position: "top-right",
								autoClose: 5000,
								hideProgressBar: true,
								closeOnClick: true,
								pauseOnHover: false,
								draggable: true,
								progress: undefined,
								transition: Bounce,
							});
						})
						.catch((error) => {
							toast.error("Error generating decryption key");
							console.error(error);
						});
				}}
			>
				Generate Decryption Key
			</button>

			<div>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed indent-6">
					You must register to the protocol with your wallet address and public
					key for interacting with eERC protocol.
				</p>
				<button
					type="button"
					className="mt-2 bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono"
					disabled={isRegistered}
					onClick={async () => {
						register().then(({ transactionHash }) => {
							setTxHash(transactionHash as `0x${string}`);
						});
					}}
				>
					{isRegistered ? "Registered" : "Register to the protocol"}
				</button>
			</div>

			<Divider title="📜 eERC Contract" my={2} />

			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cyber-green">Decimals</div>
					<div className="text-cyber-green/80 break-all">
						{decimals?.toString()}
					</div>

					<div className="text-cyber-green">Token Name</div>
					<div className="text-cyber-green/80 break-all">{name ?? "N/A"}</div>

					<div className="text-cyber-green">Token Symbol</div>
					<div className="text-cyber-green/80 break-all">{symbol ?? "N/A"}</div>

					<div className="text-cyber-green">Owner</div>
					<div className="text-cyber-green/80 break-all">{owner ?? "N/A"}</div>

					<div className="text-cyber-green">Is Auditor Key Set</div>
					<div className="text-cyber-green/80 break-all">
						{isAuditorKeySet ? "Yes" : "No"}
					</div>

					<div className="text-cyber-green">Mode</div>
					<div className="text-cyber-green/80 break-all">
						{isConverter ? "Converter" : "Standalone"}
					</div>
				</div>
			</div>
			{/* Auditor Public Key */}
			{!!auditorPublicKey.length &&
				!!auditorPublicKey[0] &&
				!!auditorPublicKey[1] && (
					<div className="mt-2">
						<CurvePoint
							x={auditorPublicKey[0]}
							y={auditorPublicKey[1]}
							onChange={() => {}} // Empty function
							shouldCollapse={false}
							label="Auditor Public Key"
						/>
					</div>
				)}

			<Divider title="💰 Balance" my={2} />
			{/* User Public Key */}
			{!!publicKey.length && !!publicKey[0] && !!publicKey[1] && (
				<CurvePoint
					x={publicKey[0]}
					y={publicKey[1]}
					onChange={() => {}} // Empty function
					shouldCollapse={false}
					label="User Public Key"
				/>
			)}

			<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-2 text-center mt-2">
				Encrypted Balance
			</p>
			{encryptedBalance && (
				<div className="flex flex-col gap-2">
					<CurvePoint
						x={encryptedBalance[0] ?? 0}
						y={encryptedBalance[1] ?? 0}
						onChange={() => {}} // Empty function
						label={"C1"}
						shouldCollapse={false}
					/>
					<CurvePoint
						x={encryptedBalance[2] ?? 0}
						y={encryptedBalance[3] ?? 0}
						onChange={() => {}} // Empty function
						label={"C2"}
						shouldCollapse={false}
					/>
				</div>
			)}

			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-2">
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cyber-gray">Decrypted Balance</div>
					<div className="text-cyber-green/80 break-all">
						<span className="text-cyber-green">
							{formatDisplayAmount(decryptedBalance)} ${symbol}
						</span>
					</div>
				</div>
			</div>

			<Divider title="⚙️ Operations" my={2} />
			<Operations
				handlePrivateMint={handlePrivateMint}
				handlePrivateBurn={handlePrivateBurn}
				handlePrivateTransfer={handlePrivateTransfer}
			/>
		</main>
	);
}
