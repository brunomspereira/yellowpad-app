import type InsertionJob from "../../models/InertionJob";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ResultCardProps {
	result: InsertionJob;
}

const ResultCard = ({ result }: ResultCardProps) => {
	return (
		<div
			className={`p-3 rounded-lg ${
				result.status === "success" ? "bg-green-50" : "bg-red-50"
			}`}
		>
			<div className="flex items-center mb-2">
				{result.status === "success" ? (
					<CheckCircle className="text-green-600 mr-2" size={16} />
				) : (
					<AlertCircle className="text-red-600 mr-2" size={16} />
				)}
				<span
					className={`font-medium ${
						result.status === "success" ? "text-green-800" : "text-red-800"
					}`}
				>
					Job #{result.id.slice(0, 8)}
				</span>
			</div>
			<p
				className={`text-sm ${
					result.status === "success" ? "text-green-700" : "text-red-700"
				}`}
			>
				{result.message}
			</p>
			{result.status === "success" && result.appliedStyle && (
				<div className="mt-2 text-xs text-green-600">
					Applied formatting: Bold, Underlined, {result.appliedStyle.fontSize}{" "}
					{result.appliedStyle.fontFamily}
				</div>
			)}
			{result.clause && (
				<div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-gray-300">
					<strong>Clause:</strong> {result.clause.substring(0, 100)}...
				</div>
			)}
		</div>
	);
};

export default ResultCard;
