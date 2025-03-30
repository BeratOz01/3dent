import { GiTrident } from "react-icons/gi";

export function Logo() {
	return (
		<div className="flex items-center space-x-2">
			<GiTrident className="h-8 w-8 text-cyber-green" />
			<span className="text-xl font-mono text-white">3dent</span>
		</div>
	);
}
