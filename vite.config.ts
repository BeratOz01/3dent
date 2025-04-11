import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
	plugins: [
		react(),
		nodePolyfills({
			include: ["crypto", "buffer", "stream", "util", "process"],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
		}),
	],
	resolve: {
		alias: {
			"node:crypto": "crypto",
			"node:buffer": "buffer",
			"node:stream": "stream",
			"node:util": "util",
			"node:process": "process",
		},
	},
});
