import { BN128_PRIME } from "./constants";

export function uint8ArrayToBigInt(array: Uint8Array): bigint {
	console.log(array.length);

	let result = BigInt(0);

	for (let i = array.length - 1; i >= 0; i--) {
		result = (result << BigInt(8)) | BigInt(array[i]);
	}

	return result % BigInt(BN128_PRIME);
}

export const formatAmount = (amount: string): bigint => {
	// Remove any trailing decimal points
	const trimmedAmount = amount.replace(/\.+$/, "");

	if (trimmedAmount === "") return 0n;

	if (trimmedAmount.includes(".")) {
		// Handle decimal numbers
		const [whole, decimal] = trimmedAmount.split(".");
		// Pad decimal with zeros if needed (e.g., 0.5 -> 0.50)
		const paddedDecimal = decimal.padEnd(2, "0");
		// Combine and convert to bigint (e.g., "10.50" -> "1050")
		return BigInt(whole + paddedDecimal);
	}

	return BigInt(`${trimmedAmount}00`);
};

export const formatDisplayAmount = (amount: bigint, decimals = 2): string => {
	if (!amount || amount === 0n) return "0";

	const numStr = amount.toString().padStart(decimals + 1, "0");

	const whole = numStr.slice(0, -decimals);
	const decimal = numStr.slice(-decimals);

	const trimmedDecimal = decimal.replace(/0+$/, "");

	return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
};
