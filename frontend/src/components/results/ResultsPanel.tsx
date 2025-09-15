import type InsertionJob from "../../models/InertionJob";
import type ParsedDocument from "../../models/ParsedDocument";
import ResultCard from "./ResultCard";
import { Download } from "lucide-react";

interface ResultsPanelProps {
	results: InsertionJob[];
	parsedDocument: ParsedDocument | null;
	onDownload: () => void;
}

const ResultsPanel = ({
	results,
	parsedDocument,
	onDownload,
}: ResultsPanelProps) => {
	if (results.length === 0) return null;

	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-xl font-semibold mb-4">Processing Results</h2>
			<div className="space-y-3">
				{results.map((result) => (
					<ResultCard key={result.id} result={result} />
				))}
			</div>

			{results.every((r) => r.status === "success") && (
				<button
					onClick={onDownload}
					className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
				>
					<Download size={16} className="mr-2" />
					Download Processed Document
				</button>
			)}
		</div>
	);
};

export default ResultsPanel;
