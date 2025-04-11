import { packPoint } from "@zk-kit/baby-jubjub";
import { CONTRACTS } from "../../config/contracts";
import { formatDisplayAmount } from "../../pkg/helpers";
import { CurvePoint } from "../ecc/CurvePoint";
import { Operations } from "../operations/Operations";

interface StandaloneModeProps {
	showEncryptedDetails: boolean;
	setShowEncryptedDetails: (show: boolean) => void;
	handlePrivateMint: (amount: bigint) => Promise<void>;
	handlePrivateBurn: (amount: bigint) => Promise<void>;
	handlePrivateTransfer: (to: string, amount: string) => Promise<void>;
	publicKey: bigint[];
	owner: string;
	decimals: number;
	symbol: string;
	isAuditorKeySet: boolean;
	auditorPublicKey: bigint[];
	encryptedBalance: bigint[];
	decryptedBalance: bigint;
	isDecryptionKeySet: boolean;
	refetchBalance: () => void;
}

export function StandaloneMode({
	showEncryptedDetails,
	setShowEncryptedDetails,
	handlePrivateMint,
	handlePrivateBurn,
	handlePrivateTransfer,
	publicKey,
	owner,
	decimals,
	symbol,
	isAuditorKeySet,
	auditorPublicKey,
	encryptedBalance,
	decryptedBalance,
	isDecryptionKeySet,
	refetchBalance,
}: StandaloneModeProps) {
	return (
		<>
			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10">
				<div className="grid grid-cols-[220px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cyber-green">Contract Address</div>
					<div className="text-cyber-green/80 break-all">
						{CONTRACTS.EERC_STANDALONE}
					</div>

					<div className="text-cyber-green">Owner</div>
					<div className="text-cyber-green/80 break-all">{owner ?? "N/A"}</div>

					<div className="text-cyber-green">Mode</div>
					<div className="text-cyber-green/80 break-all">Standalone</div>

					<div className="text-cyber-green">Decimals</div>
					<div className="text-cyber-green/80 break-all">
						{decimals?.toString()}
					</div>

					<div className="text-cyber-green">Token Name</div>
					<div className="text-cyber-green/80 break-all">{name ?? "N/A"}</div>

					<div className="text-cyber-green">Token Symbol</div>
					<div className="text-cyber-green/80 break-all">{symbol ?? "N/A"}</div>

					<div className="text-cyber-green">Is Auditor Key Set</div>
					<div className="text-cyber-green/80 break-all">
						{isAuditorKeySet ? "Yes" : "No"}
					</div>

					<div className="text-cyber-green">Auditor Public Key (hex)</div>
					<div className="text-cyber-green/80 break-all">
						{isAuditorKeySet
							? `0x${packPoint(auditorPublicKey as [bigint, bigint]).toString(16)}`
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

			<div className="flex flex-col mt-2">
				<button
					type="button"
					className="mb-2 bg-cyber-dark text-cyber-green px-2 py-1 rounded text-sm border border-cyber-green/60 hover:bg-cyber-green/60 transition-all duration-200 font-mono self-center disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={
						encryptedBalance.length === 0 ||
						encryptedBalance.some((balance) => balance === 0n)
					}
					onClick={() => {
						setShowEncryptedDetails(!showEncryptedDetails);
					}}
				>
					{showEncryptedDetails
						? "Hide Encrypted Points"
						: "Show Encrypted Points"}
				</button>
				{showEncryptedDetails && (
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
			</div>

			<div className="border border-cyber-green/30 rounded-md p-4 font-mono text-sm bg-black/10 mt-1 mb-4">
				<div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-2 items-center">
					<div className="text-cyber-gray">Decrypted Balance</div>
					<div className="text-cyber-green/80 break-all">
						<span className="text-cyber-green">
							{formatDisplayAmount(decryptedBalance)}
							{` ${symbol}`}
						</span>
					</div>
				</div>
			</div>

			<Operations
				handlePrivateMint={handlePrivateMint}
				handlePrivateBurn={handlePrivateBurn}
				handlePrivateTransfer={handlePrivateTransfer}
				handlePrivateDeposit={() => Promise.resolve()}
				handlePrivateWithdraw={() => Promise.resolve()}
				mode="standalone"
				isDecryptionKeySet={isDecryptionKeySet}
				refetchBalance={refetchBalance}
			/>
		</>
	);
}
