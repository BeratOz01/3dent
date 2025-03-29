export const toHex = (value: string): string => {
	try {
		const num = BigInt(value);
		return `0x${num.toString(16)}`;
	} catch {
		return value; // Return original value if not a valid number
	}
};

export const fromHex = (value: string): string => {
	try {
		if (value.startsWith("0x")) {
			return BigInt(value).toString(10);
		}
		return value;
	} catch {
		return value; // Return original value if not a valid hex
	}
};
