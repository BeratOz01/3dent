// Contract addresses
export const CONTRACTS = {
	EERC_STANDALONE: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
	EERC_CONVERTER: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528",
	ERC20: "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
} as const;

// Circuit configuration
export const CIRCUIT_CONFIG = {
	register: {
		wasm: "/RegistrationCircuit.wasm",
		zkey: "/RegistrationCircuit.groth16.zkey",
	},
	mint: {
		wasm: "/MintCircuit.wasm",
		zkey: "/MintCircuit.groth16.zkey",
	},
	transfer: {
		wasm: "/TransferCircuit.wasm",
		zkey: "/TransferCircuit.groth16.zkey",
	},
	withdraw: {
		wasm: "/WithdrawCircuit.wasm",
		zkey: "/WithdrawCircuit.groth16.zkey",
	},
} as const;

// Explorer URL
export const EXPLORER_BASE_URL = "https://testnet.snowtrace.io/address/";

// Mode types
export type EERCMode = "standalone" | "converter";
