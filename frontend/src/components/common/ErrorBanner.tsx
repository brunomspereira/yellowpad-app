import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
	error: string;
	onClear: () => void;
}

const ErrorBanner = ({ error, onClear }: ErrorBannerProps) => {
	return (
		<div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
			<div className="flex justify-between items-center">
				<div className="flex items-center">
					<AlertCircle className="text-red-400 mr-2" size={20} />
					<p className="text-red-800">{error}</p>
				</div>
				<button onClick={onClear} className="text-red-400 hover:text-red-600">
					×
				</button>
			</div>
		</div>
	);
};

export default ErrorBanner;
