import {
	type CompatiblePublicClient,
	type CompatibleWalletClient,
	useEERC,
} from "@avalabs/eerc-sdk-next";
import { packPoint } from "@zk-kit/baby-jubjub";
import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { parseUnits } from "viem";
import {
	injected,
	useAccount,
	useConnect,
	useDisconnect,
	usePublicClient,
	useReadContract,
	useWaitForTransactionReceipt,
	useWalletClient,
	useWriteContract,
} from "wagmi";
import { Divider } from "../components";
import { RightTooltip } from "../components/Tooltip";
import { CurvePoint } from "../components/ecc/CurvePoint";
import { Operations } from "../components/operations/Operations";
import { MAX_UINT256, DEMO_TOKEN_ABI as erc20Abi } from "../pkg/constants";
import { formatDisplayAmount } from "../pkg/helpers";

const eERC_STANDALONE_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
const ERC20_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
const eERC_CONVERTER_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

export function EERC() {
	const [txHash, setTxHash] = useState<`0x${string}`>("" as `0x${string}`);
	const [mode, setMode] = useState<"standalone" | "converter">("standalone");

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
				<div>
					<p>Transaction successful</p>
					<a
						href={`${explorerBaseUrl}${transactionReceipt?.transactionHash}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-cyber-green underline hover:text-cyber-green/80"
					>
						See on Explorer →
					</a>
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

			setTxHash("" as `0x${string}`);
		}
	}, [txHash, isSuccess, isFetched, transactionReceipt]);

	const { connectAsync } = useConnect();
	const { disconnectAsync } = useDisconnect();
	const { address, isConnected, isConnecting } = useAccount();
	const explorerBaseUrl = "https://testnet.snowtrace.io/address/";

	const publicClient = usePublicClient({ chainId: 31337 });
	const { data: walletClient } = useWalletClient();

	// use eerc
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
		mode === "converter" ? eERC_CONVERTER_ADDRESS : eERC_STANDALONE_ADDRESS,
		{
			transferURL: "/prover_transfer.wasm",
			multiWasmURL: "/prover_multi.wasm",
		},
	);

	// use encrypted balance
	const {
		decryptedBalance,
		encryptedBalance,
		decimals,
		privateMint,
		privateBurn,
		privateTransfer,
		deposit,
		withdraw,
		refetchBalance,
	} = useEncryptedBalance(mode === "converter" ? ERC20_ADDRESS : undefined);

	// handle private mint
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
		refetchBalance();
	};

	// handle private burn
	const handlePrivateBurn = async (amount: bigint) => {
		if (!isConnected) {
			console.log("Not connected");
			return;
		}

		const { transactionHash } = await privateBurn(amount);
		setTxHash(transactionHash as `0x${string}`);
		refetchBalance();
	};

	// handle private transfer
	const handlePrivateTransfer = async (to: string, amount: string) => {
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

		const parsedAmount = parseUnits(amount, Number(decimals));

		const { transactionHash } = await privateTransfer(to, parsedAmount);
		setTxHash(transactionHash as `0x${string}`);
		refetchBalance();
	};

	// handle private deposit
	const handlePrivateDeposit = async (amount: string) => {
		if (!isConnected) {
			console.log("Not connected");
			return;
		}

		if (!erc20Decimals) {
			console.log("No decimals");
			return;
		}

		const parsedAmount = parseUnits(amount, erc20Decimals);

		const { transactionHash } = await deposit(parsedAmount);
		setTxHash(transactionHash as `0x${string}`);
		refetchBalance();
		refetchErc20Balance();
	};

	// handle private withdraw
	const handlePrivateWithdraw = async (amount: string) => {
		if (!isConnected) {
			console.log("Not connected");
			return;
		}

		if (!decimals) {
			console.log("No decimals");
			return;
		}

		const parsedAmount = parseUnits(amount, Number(decimals));

		const { transactionHash } = await withdraw(parsedAmount);
		setTxHash(transactionHash as `0x${string}`);
		refetchBalance();
		refetchErc20Balance();
	};

	const { data: timeUntilNextRequest, refetch: refetchTimeUntilNextRequest } =
		useReadContract({
			abi: erc20Abi,
			functionName: "timeUntilNextRequest",
			args: [address as `0x${string}`],
			query: { enabled: !!address },
			address: ERC20_ADDRESS,
		}) as { data: bigint; refetch: () => void };

	const { data: erc20Balance, refetch: refetchErc20Balance } = useReadContract({
		abi: erc20Abi,
		functionName: "balanceOf",
		args: [address as `0x${string}`],
		query: { enabled: !!address },
		address: ERC20_ADDRESS,
	}) as { data: bigint; refetch: () => void };

	const { data: approveAmount, refetch: refetchApproveAmount } =
		useReadContract({
			abi: erc20Abi,
			functionName: "allowance",
			args: [address as `0x${string}`, eERC_CONVERTER_ADDRESS],
			query: { enabled: !!address },
			address: ERC20_ADDRESS,
		}) as { data: bigint; refetch: () => void };

	const { data: erc20Symbol } = useReadContract({
		abi: erc20Abi,
		functionName: "symbol",
		args: [],
		query: { enabled: !!address },
		address: ERC20_ADDRESS,
	}) as { data: string };

	const { data: erc20Decimals } = useReadContract({
		abi: erc20Abi,
		functionName: "decimals",
		args: [],
		query: { enabled: !!address },
		address: ERC20_ADDRESS,
	}) as { data: number };

	const { writeContractAsync } = useWriteContract({});

	return (
		<main className="max-w-6xl mx-auto px-4 py-8">
			<div className="text-cyber-gray font-mono text-sm leading-relaxed mt-4">
				<h2 className="text-cyber-green font-bold text-lg mb-2 text-center flex items-center justify-center gap-2">
					<img src="/logo.svg" alt="avax" className="w-7 h-7 inline-block" />
					eERC
				</h2>
			</div>

			<div className="flex justify-center mb-4">
				<span className="bg-cyber-green/5 text-cyber-green text-xs px-2 py-1 rounded font-mono align-center">
					Privacy-Preserving • Auditable • ZK-Powered
				</span>
			</div>

			<div className="space-y-2 text-sm font-mono text-cyber-gray leading-relaxed indent-6">
				<p>
					eERC is a privacy-preserving ERC-20 token protocol that allows users
					to mint, transfer, and burn tokens without revealing their balances or
					transaction amounts on-chain. It leverages elliptic curve encryption
					and zero-knowledge proofs to ensure that all operations are verifiable
					while remaining fully private.
				</p>
				<p>
					There are two modes of eERC:{" "}
					<span className="text-cyber-green font-semibold">
						Standalone Mode{" "}
					</span>
					lets you mint and manage encrypted tokens directly, while{" "}
					<span className="text-cyber-green font-semibold">Converter Mode</span>{" "}
					wraps existing ERC-20 tokens into encrypted form — allowing you to
					deposit and later withdraw standard tokens privately.
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

				<p className="text-sm text-cyber-gray font-mono leading-relaxed">
					All encrypted balances are tied to your wallet’s public key, and every
					interaction with the contract (mint, transfer, burn, withdraw) is
					processed through cryptographic proofs and homomorphic operations.
					This ensures your private balance is updated correctly — without ever
					exposing sensitive data to the blockchain. At the same time Encrypted
					ERC incorporates a powerful{" "}
					<span className="text-cyber-green font-semibold">auditability</span>{" "}
					feature that addresses regulatory compliance concerns. This feature
					allows designated regulatory authorities to access and review
					transaction details through auditor keys, ensuring that while
					transactions remain private to the general public, authorized
					regulators can perform necessary oversight functions when required.
				</p>

				<p className="text-xs text-cyber-green/70 mt-0">
					Want to learn more? See the full documentation on our{" "}
					<a
						href="https://docs.avacloud.io/encrypted-erc"
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
				You can connect your wallet to the Fuji network and interact with these
				contracts directly — mint, transfer, burn, or convert depending on the
				mode.
			</p>

			{/* Contracts */}
			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="text-cyber-green font-bold mb-2">📜 Contracts</div>
				<div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-4 items-center">
					<div className="text-cyber-green">Standalone Mode</div>
					<div className="text-cyber-green/80 break-all">
						<div>{eERC_STANDALONE_ADDRESS}</div>
						<a
							href={`${explorerBaseUrl}${eERC_STANDALONE_ADDRESS}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
						>
							See on Explorer →
						</a>
					</div>

					<div className="text-cyber-green">Converter Mode</div>
					<div className="text-cyber-green/80 break-all">
						<div>{eERC_CONVERTER_ADDRESS}</div>
						<a
							href={`${explorerBaseUrl}${eERC_CONVERTER_ADDRESS}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
						>
							See on Explorer →
						</a>
					</div>

					<div className="text-cyber-green">Dummy ERC-20</div>
					<div className="text-cyber-green/80 break-all">
						<div>{ERC20_ADDRESS}</div>
						<a
							href={`${explorerBaseUrl}${ERC20_ADDRESS}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
						>
							See on Explorer →
						</a>
					</div>
				</div>
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

			{/* Faucet */}
			<div className="border border-cyber-green/30 rounded-md p-2 font-mono text-sm bg-black/10 p-3">
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

			<Divider title="🔑 Generate Decryption Key" />
			<p className="text-sm text-cyber-gray font-mono leading-relaxed mb-4 indent-6">
				To enable private transactions, each user must generate a unique
				decryption key tied to their wallet address. This key is used to encrypt
				and decrypt balances locally in the browser — it is never uploaded or
				stored on-chain. This key will be derived from your signature by signing
				a pre-defined message.
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
						.then(() => {
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

			<Divider title="🧾 Registration" />

			<div>
				<p className="text-sm text-cyber-gray font-mono leading-relaxed indent-6">
					Every user must register to the protocol with their wallet address and
					public key in order to interact with the eERC system. During
					registration, the user derives a private key by signing a message with
					their wallet, which is then used to generate a BabyJubjub public key
					for ElGamal encryption. This public key is stored on-chain. At the
					same time, a Poseidon hash is used to create a secure commitment that
					links the user’s wallet address to their BabyJubjub keypair. This
					registration step ensures that only the rightful owner of the wallet
					can generate encrypted transactions, and that identity verification
					can be performed efficiently inside zero-knowledge circuits.
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

			<div className="flex items-center space-x-4 font-mono text-sm text-cyber-gray justify-center my-3">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<span
					className={`cursor-pointer ${mode === "standalone" ? "text-cyber-green font-bold" : "opacity-50"}`}
					onClick={() => setMode("standalone")}
				>
					Standalone Mode
				</span>
				<span className="text-cyber-green/40">|</span>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<span
					className={`cursor-pointer ${mode === "converter" ? "text-cyber-green font-bold" : "opacity-50"}`}
					onClick={() => setMode("converter")}
				>
					Converter Mode
				</span>
			</div>

			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="grid grid-cols-[220px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cyber-green">Contract Address</div>
					<div className="text-cyber-green/80 break-all">
						{mode === "standalone"
							? eERC_STANDALONE_ADDRESS
							: eERC_CONVERTER_ADDRESS}
					</div>

					<div className="text-cyber-green">Owner</div>
					<div className="text-cyber-green/80 break-all">{owner ?? "N/A"}</div>

					<div className="text-cyber-green">Mode</div>
					<div className="text-cyber-green/80 break-all">
						{isConverter ? "Converter" : "Standalone"}
					</div>

					{mode === "standalone" && (
						<>
							<div className="text-cyber-green">Decimals</div>
							<div className="text-cyber-green/80 break-all">
								{decimals?.toString()}
							</div>

							<div className="text-cyber-green">Token Name</div>
							<div className="text-cyber-green/80 break-all">
								{name ?? "N/A"}
							</div>

							<div className="text-cyber-green">Token Symbol</div>
							<div className="text-cyber-green/80 break-all">
								{symbol ?? "N/A"}
							</div>
						</>
					)}

					<div className="text-cyber-green">Is Auditor Key Set</div>
					<div className="text-cyber-green/80 break-all">
						{isAuditorKeySet ? "Yes" : "No"}
					</div>

					<div className="text-cyber-green">Auditor Public Key (hex)</div>
					<div className="text-cyber-green/80 break-all">
						{isAuditorKeySet
							? `0x${packPoint(auditorPublicKey as [bigint, bigint]).toString(
									16,
								)}`
							: "N/A"}
					</div>

					<div className="text-cyber-green">User Public Key (hex)</div>
					<div className="text-cyber-green/80 break-all">
						{!!publicKey.length && publicKey[0] !== 0n && publicKey[1] !== 0n
							? `0x${packPoint(publicKey as [bigint, bigint]).toString(16)}`
							: "N/A"}
					</div>
				</div>
			</div>

			{mode === "converter" && (
				<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-2">
					<div className="text-cyber-green font-bold mb-2">
						ERC-20 for Conversion
					</div>
					<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
						<div className="text-cyber-green">Decimals</div>
						<div className="text-cyber-green/80 break-all">{erc20Decimals}</div>

						<div className="text-cyber-green">Balance</div>
						<div className="text-cyber-green/80 break-all flex flex-row">
							{formatDisplayAmount(erc20Balance ?? 0n, erc20Decimals)}{" "}
							{erc20Symbol}
							<RightTooltip
								content="You can only request test tokens once every hour."
								id="request-erc20-tooltip"
							>
								<button
									className={`relative group inline-block text-cyber-gray/50 ml-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none inline-flex items-center transition-colors ${timeUntilNextRequest !== 0n ? "opacity-50 cursor-not-allowed hover:text-cyber-red" : "hover:text-cyber-gray"}`}
									title={`Request ERC-20 in ${timeUntilNextRequest} seconds`}
									onClick={async () => {
										const transactionHash = await writeContractAsync({
											abi: erc20Abi,
											functionName: "requestTokens",
											args: [],
											address: ERC20_ADDRESS,
											account: address as `0x${string}`,
										});
										await refetchErc20Balance();
										await refetchTimeUntilNextRequest();
										setTxHash(transactionHash as `0x${string}`);
									}}
									disabled={timeUntilNextRequest !== 0n}
									type="button"
								>
									Request ERC-20
								</button>
							</RightTooltip>
						</div>

						<div className="text-cyber-green">Allowance</div>
						<div className="text-cyber-green/80 break-all flex flex-row">
							{approveAmount === MAX_UINT256
								? "MAX"
								: `${formatDisplayAmount(approveAmount ?? 0n)} ${erc20Symbol}`}

							<RightTooltip
								content="The maximum amount of ERC-20 tokens that can be approved."
								id="approve-tooltip"
							>
								<button
									className={
										"relative group inline-block text-cyber-gray/50 ml-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none inline-flex items-center transition-colors hover:text-cyber-gray"
									}
									onClick={async () => {
										const transactionHash = await writeContractAsync({
											abi: erc20Abi,
											functionName: "approve",
											args: [eERC_CONVERTER_ADDRESS, MAX_UINT256],
											address: ERC20_ADDRESS,
											account: address as `0x${string}`,
										});
										await refetchApproveAmount();
										setTxHash(transactionHash as `0x${string}`);
									}}
									type="button"
								>
									Approve All
								</button>
							</RightTooltip>
						</div>
					</div>
				</div>
			)}

			<Divider title="💰 Encrypted Balance" my={2} />
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

			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-2 mb-4">
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cyber-gray">Decrypted Balance</div>
					<div className="text-cyber-green/80 break-all">
						<span className="text-cyber-green">
							{formatDisplayAmount(decryptedBalance)}
							{mode === "standalone" ? ` ${symbol}` : ` e.${erc20Symbol}`}
						</span>
					</div>
				</div>
			</div>

			<Divider title="⚙️ Operations" my={2} />
			<Operations
				handlePrivateDeposit={handlePrivateDeposit}
				handlePrivateMint={handlePrivateMint}
				handlePrivateBurn={handlePrivateBurn}
				handlePrivateTransfer={handlePrivateTransfer}
				handlePrivateWithdraw={handlePrivateWithdraw}
				mode={mode}
				shouldGenerateKey={shouldGenerateDecryptionKey}
			/>
		</main>
	);
}
