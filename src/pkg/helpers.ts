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

export const formatDisplayAmount = (amount: bigint): string => {
	if (!amount) return "0";
	if (amount === 0n) return "0";

	// Convert bigint to string and pad with leading zeros if needed
	let numStr = amount.toString();
	numStr = numStr.padStart(3, "0"); // Ensure at least 3 digits for proper decimal placement

	// Split into whole and decimal parts
	const whole = numStr.slice(0, -2);
	const decimal = numStr.slice(-2);

	// Remove trailing zeros from decimal part
	const trimmedDecimal = decimal.replace(/0+$/, "");

	// If decimal part is empty after trimming, return just the whole number
	if (trimmedDecimal === "") {
		return whole;
	}

	// Combine with decimal point
	return `${whole}.${trimmedDecimal}`;
};
