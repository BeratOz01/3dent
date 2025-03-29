interface DividerProps {
	title?: string;
}

export const Divider = ({ title }: DividerProps) => {
	if (!title) {
		return <div className="w-full h-[1px] bg-cyber-green/20 my-4" />;
	}

	return (
		<div className="flex items-center my-4">
			<div className="flex-grow h-[1px] bg-cyber-green/20" />
			<span className="px-4 text-cyber-gray text-sm font-mono">{title}</span>
			<div className="flex-grow h-[1px] bg-cyber-green/20" />
		</div>
	);
};
