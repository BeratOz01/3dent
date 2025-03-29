import { http, createConfig } from "wagmi";
import { hardhat } from "wagmi/chains";

export const config = createConfig({
	chains: [hardhat],
	transports: {
		[hardhat.id]: http(),
	},
});
