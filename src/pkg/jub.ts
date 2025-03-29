import crypto from "node:crypto";
import { Base8, mulPointEscalar } from "@zk-kit/baby-jubjub";
import { BN128_PRIME } from "./constants";

export function genRandomPrivateKey() {
	const maxBigInt = BigInt(BN128_PRIME);
	// Calculate the byte length
	const byteLength = (maxBigInt.toString(16).length + 1) >> 1;
	while (true) {
		const buf = crypto.randomBytes(byteLength);
		const num = BigInt(`0x${buf.toString("hex")}`);

		if (num <= maxBigInt) {
			return num;
		}
	}
}

// generates key pair from private key
export const genKeyPair = () => {
	const privateKey = genRandomPrivateKey();
	const publicKey = mulPointEscalar(Base8, privateKey);
	return { privateKey, publicKey };
};

// generates random scalar in the range of the curve order
export function genRandomScalar(): bigint {
	return genRandomPrivateKey();
}

// field reduction
export function fieldE(n: bigint): bigint {
	const order = BigInt(BN128_PRIME);
	const res = n % order;

	return res < 0 ? res + order : res;
}
