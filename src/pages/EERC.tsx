import {
  type CompatiblePublicClient,
  type CompatibleWalletClient,
  useEERC,
} from "@avalabs/eerc-sdk";
import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { parseUnits } from "viem";
import {
  useAccount,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { Divider } from "../components";
import { ConverterMode } from "../components/eerc/ConverterMode";
import { StandaloneMode } from "../components/eerc/StandaloneMode";
import { useWebComponents } from "../components/web-components";
import {
  CIRCUIT_CONFIG,
  CONTRACTS,
  type EERCMode,
  EXPLORER_BASE_URL,
  EXPLORER_BASE_URL_TX,
} from "../config/contracts";
import { DEMO_TOKEN_ABI as erc20Abi } from "../pkg/constants";
import { useAppKit } from "@reown/appkit/react";

export function EERC() {
  useWebComponents();
  const [txHash, setTxHash] = useState<`0x${string}`>("" as `0x${string}`);
  const [mode, setMode] = useState<EERCMode>("standalone");
  const [showEncryptedDetails, setShowEncryptedDetails] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionType, setTransactionType] = useState<string>("");
  const { data: transactionReceipt, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
    confirmations: 1,
  });
  const { disconnectAsync } = useDisconnect();
  const { open } = useAppKit();

  // Add URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "standalone" || modeParam === "converter")
      setMode(modeParam as EERCMode);
  }, []);

  // Update URL when mode changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [mode]);

  useEffect(() => {
    if (txHash && isSuccess && transactionReceipt) {
      toast.success(
        <div>
          <p>Transaction successful</p>
          <a
            href={`${EXPLORER_BASE_URL_TX}${transactionReceipt?.transactionHash}`}
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
        }
      );

      setTxHash("" as `0x${string}`);
      setIsRegistering(false);
      setIsTransactionPending(false);
      setTransactionType("");
    }
  }, [txHash, isSuccess, transactionReceipt]);

  const { address, isConnected, isConnecting } = useAccount();

  const publicClient = usePublicClient({ chainId: avalancheFuji.id });
  const { data: walletClient } = useWalletClient();

  // use eerc
  const {
    owner,
    symbol,
    isAuditorKeySet,
    auditorPublicKey,
    isRegistered,
    isDecryptionKeySet,
    generateDecryptionKey,
    register,
    useEncryptedBalance,
    isAddressRegistered,
    publicKey,
  } = useEERC(
    publicClient as CompatiblePublicClient,
    walletClient as CompatibleWalletClient,
    mode === "converter" ? CONTRACTS.EERC_CONVERTER : CONTRACTS.EERC_STANDALONE,
    CIRCUIT_CONFIG
  );

  // use encrypted balance
  const {
    privateMint,
    privateBurn,
    privateTransfer,
    deposit,
    withdraw,
    decimals,
    encryptedBalance,
    decryptedBalance,
    refetchBalance,
  } = useEncryptedBalance(mode === "converter" ? CONTRACTS.ERC20 : undefined);

  // handle private mint
  const handlePrivateMint = async (amount: bigint) => {
    if (!isConnected || !address) {
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Minting");
    try {
      const { transactionHash } = await privateMint(address, amount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Minting failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private burn
  const handlePrivateBurn = async (amount: bigint) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Burning");
    try {
      const { transactionHash } = await privateBurn(amount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Burning failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private transfer
  const handlePrivateTransfer = async (to: string, amount: string) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Transferring");
    try {
      const { isRegistered: isToRegistered } = await isAddressRegistered(
        to as `0x${string}`
      );
      if (!isToRegistered) {
        toast.error("Recipient is not registered");
        setIsTransactionPending(false);
        setTransactionType("");
        return;
      }

      const parsedAmount = parseUnits(amount, Number(decimals));

      const { transactionHash } = await privateTransfer(to, parsedAmount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error("Transfer failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private deposit
  const handlePrivateDeposit = async (amount: string) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Depositing");
    try {
      if (!erc20Decimals) {
        console.log("No decimals");
        setIsTransactionPending(false);
        setTransactionType("");
        return;
      }

      const parsedAmount = parseUnits(amount, erc20Decimals);

      const { transactionHash } = await deposit(parsedAmount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
      refetchErc20Balance();
    } catch (error) {
      console.error(error);
      toast.error("Deposit failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  // handle private withdraw
  const handlePrivateWithdraw = async (amount: string) => {
    if (!isConnected) {
      console.log("Not connected");
      return;
    }

    setIsTransactionPending(true);
    setTransactionType("Private Withdrawing");
    try {
      if (!decimals) {
        console.log("No decimals");
        setIsTransactionPending(false);
        setTransactionType("");
        return;
      }

      const parsedAmount = parseUnits(amount, Number(decimals));

      const { transactionHash } = await withdraw(parsedAmount);
      setTxHash(transactionHash as `0x${string}`);
      refetchBalance();
      refetchErc20Balance();
    } catch (error) {
      console.error(error);
      toast.error("Withdrawal failed");
      setIsTransactionPending(false);
      setTransactionType("");
    }
  };

  const { data: erc20Decimals } = useReadContract({
    abi: erc20Abi,
    functionName: "decimals",
    args: [],
    query: { enabled: !!address },
    address: CONTRACTS.ERC20,
  }) as { data: number };

  const { refetch: refetchErc20Balance } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address },
    address: CONTRACTS.ERC20,
  }) as { data: bigint; refetch: () => void };

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
          eERC is a privacy-preserving ERC-20 token that lets users mint,
          transfer, and burn — without exposing balances or amounts on-chain.
        </p>
        <p>
          There are two modes of eERC:{" "}
          <span className="text-cyber-green font-semibold">
            Standalone Mode{" "}
          </span>
          allows direct minting and management of encrypted tokens, while{" "}
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
          All encrypted balances are tied to your wallet's public key, and every
          interaction with the contract (mint, transfer, burn, withdraw) is
          processed through cryptographic proofs and homomorphic operations.
          This ensures your private balance is updated correctly — without ever
          exposing sensitive data to the blockchain. eERC also includes a
          powerful auditability feature for regulatory compliance. Designated
          authorities can access transaction details using special auditor keys
          — allowing for oversight without compromising user privacy.
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
            <div>{CONTRACTS.EERC_STANDALONE}</div>
            <a
              href={`${EXPLORER_BASE_URL}${CONTRACTS.EERC_STANDALONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
            >
              See on Explorer →
            </a>
          </div>

          <div className="text-cyber-green">Converter Mode</div>
          <div className="text-cyber-green/80 break-all">
            <div>{CONTRACTS.EERC_CONVERTER}</div>
            <a
              href={`${EXPLORER_BASE_URL}${CONTRACTS.EERC_CONVERTER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyber-green/60 underline hover:text-cyber-green"
            >
              See on Explorer →
            </a>
          </div>

          <div className="text-cyber-green">Dummy ERC-20</div>
          <div className="text-cyber-green/80 break-all">
            <div>{CONTRACTS.ERC20}</div>
            <a
              href={`${EXPLORER_BASE_URL}${CONTRACTS.ERC20}`}
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

          open().then(() => {
            console.log("Connected");
          });

          //   connectAsync({ connector: injected });
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
          onClick={async () => {
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
        This key is derived by signing a predefined message with your wallet. It
        is never uploaded or shared — it stays entirely local in your browser.
      </p>
      <button
        type="button"
        className="bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono"
        disabled={isDecryptionKeySet}
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
          Before you can use eERC, you need to register your wallet. This
          process:
        </p>
        <ul className="text-sm text-cyber-gray font-mono leading-relaxed indent-1 list-disc pl-8 space-y-1 ml-5">
          <li>Creates a unique public key for your encrypted transactions</li>
          <li>Links your wallet address to this public key securely</li>
          <li>Enables you to receive and manage encrypted tokens</li>
        </ul>
        <p className="text-sm text-cyber-gray font-mono leading-relaxed indent-6 mt-2">
          The registration is a one-time process that happens on-chain. Once
          completed, you'll be able to mint, transfer, and burn tokens
          privately. But key is generated locally, so you can use it on any
          device. Private keys are never uploaded or shared — they stay entirely
          local in your browser.
        </p>
        <button
          type="button"
          className="mt-2 bg-cyber-dark w-full text-cyber-green px-2 py-1 rounded-md text-sm border border-cyber-green/60 disabled:opacity-50 disabled:cursor-not-allowed mb-2 hover:bg-cyber-green/60 transition-all duration-200 font-mono"
          disabled={isRegistered || isRegistering || !isDecryptionKeySet}
          onClick={async () => {
            setIsRegistering(true);
            try {
              const { transactionHash } = await register();
              setTxHash(transactionHash as `0x${string}`);
            } catch (error) {
              console.error(error);
              toast.error("Registration failed");
              setIsRegistering(false);
            }
          }}
        >
          {isRegistered ? (
            "✓ Registered"
          ) : isRegistering ? (
            <div className="flex flex-col items-center gap-1">
              <span>Registering your wallet...</span>
              {txHash && (
                <span className="text-xs text-cyber-gray">
                  Transaction: {txHash.slice(0, 6)}...{txHash.slice(-4)}
                </span>
              )}
            </div>
          ) : (
            "Register Wallet"
          )}
        </button>
      </div>

      <Divider title="📜 eERC Contract" my={2} />

      {/* Transaction Pending Indicator - Enhanced Version */}
      {isTransactionPending && (
        <div className="border border-cyber-green/50 rounded-md p-4 font-mono text-sm mb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-cyber-green font-bold text-lg">
              {transactionType} in progress...
            </div>
            {txHash && (
              <div className="flex flex-col items-center p-3 rounded-md w-full">
                <span className="text-cyber-green font-semibold mb-1">
                  Transaction Hash:
                </span>
                <span className="text-xs text-cyber-gray font-mono p-2 rounded w-full text-center break-all">
                  {txHash}
                </span>
                <a
                  href={`${EXPLORER_BASE_URL_TX}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyber-green underline hover:text-cyber-green/80 mt-2 bg-cyber-green/10 px-3 py-1 rounded"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 font-mono text-sm text-cyber-gray justify-center my-3">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <span
          className={`cursor-pointer ${
            mode === "standalone" ? "text-cyber-green font-bold" : "opacity-50"
          }`}
          onClick={() => setMode("standalone")}
        >
          Standalone Mode
        </span>
        <span className="text-cyber-green/40">|</span>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <span
          className={`cursor-pointer ${
            mode === "converter" ? "text-cyber-green font-bold" : "opacity-50"
          }`}
          onClick={() => setMode("converter")}
        >
          Converter Mode
        </span>
      </div>

      {mode === "standalone" ? (
        <StandaloneMode
          showEncryptedDetails={showEncryptedDetails}
          setShowEncryptedDetails={setShowEncryptedDetails}
          handlePrivateMint={handlePrivateMint}
          handlePrivateBurn={handlePrivateBurn}
          handlePrivateTransfer={handlePrivateTransfer}
          publicKey={publicKey}
          owner={owner}
          decimals={Number(decimals)}
          symbol={symbol}
          isAuditorKeySet={isAuditorKeySet}
          auditorPublicKey={auditorPublicKey}
          encryptedBalance={encryptedBalance}
          decryptedBalance={decryptedBalance}
          isDecryptionKeySet={isDecryptionKeySet}
          refetchBalance={refetchBalance}
        />
      ) : (
        <ConverterMode
          showEncryptedDetails={showEncryptedDetails}
          setShowEncryptedDetails={setShowEncryptedDetails}
          handlePrivateDeposit={handlePrivateDeposit}
          handlePrivateWithdraw={handlePrivateWithdraw}
          isDecryptionKeySet={isDecryptionKeySet}
          publicKey={publicKey}
          owner={owner}
          isAuditorKeySet={isAuditorKeySet}
          auditorPublicKey={auditorPublicKey}
          encryptedBalance={encryptedBalance}
          decryptedBalance={decryptedBalance}
          refetchBalance={refetchBalance}
          handlePrivateTransfer={handlePrivateTransfer}
        />
      )}
    </main>
  );
}
