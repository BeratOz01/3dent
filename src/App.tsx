import { useState } from "react";
import { Logo } from "./components/layout/Logo";
import { ECC } from "./pages/ECC";
import { Hashes } from "./pages/Hashes";

export function App() {
	const [selectedPage, setSelectedPage] = useState<"hashes" | "ecc">("ecc");

	return (
		<div className="flex min-h-screen bg-gray-100">
			<nav className="sticky top-0 w-64 bg-cyber-dark text-white flex flex-col p-2 h-screen">
				<div className="p-4 font-bold text-lg flex justify-center items-center">
					<Logo />
				</div>
				<ul className="flex-grow space-y-2 p-4">
					<li>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
						<p
							onClick={() => setSelectedPage("ecc")}
							className="block px-4 py-2 rounded text-center text-cyber-green cursor-pointer font-mono"
						>
							ECC (BabyJubjub)
						</p>
					</li>
					<div className="border-b border-cyber-green/30 my-2" />
					<li>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
						<p
							onClick={() => setSelectedPage("hashes")}
							className="block px-4 py-2 rounded text-center text-cyber-green cursor-pointer font-mono"
						>
							Hash Functions
						</p>
					</li>
				</ul>
				<footer className="bg-cyber-dark mt-12 py-6 text-center text-cyber-gray">
					<p className="font-mono">Built for Developers</p>
				</footer>
			</nav>

			{/* Page Content */}
			<main className="flex-grow p-6 bg-cyber-black">
				{selectedPage === "hashes" ? <Hashes /> : <ECC />}
			</main>
		</div>
	);
}

export default App;
