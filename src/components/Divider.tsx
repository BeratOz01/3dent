interface DividerProps {
	title?: string;
	my?: number;
}

export const Divider = ({ title, my }: DividerProps) => {
	if (!title) {
		return (
			<div
				className={`w-full h-[1px] bg-cyber-green/20 ${my ? `my-${my}` : "my-4"}`}
			/>
		);
	}

	return (
		<div className={`flex items-center ${my ? `my-${my}` : "my-4"}`}>
			<div className="flex-grow h-[1px] bg-cyber-green/20" />
			<span className="px-4 text-cyber-gray text-sm font-mono">{title}</span>
			<div className="flex-grow h-[1px] bg-cyber-green/20" />
		</div>
	);
};
