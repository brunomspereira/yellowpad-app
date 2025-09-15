import type ParsedDocument from "../../models/ParsedDocument";

interface ApiStatusProps {
	parsedDocument: ParsedDocument | null;
	documentId: string | null;
}

const ApiStatus = ({ parsedDocument, documentId }: ApiStatusProps) => {
	return (
		<div className="bg-white rounded-lg shadow-lg p-4">
			<div className="flex items-center justify-between text-sm">
				<span className="text-gray-600">API Status:</span>
				<span
					className={`flex items-center ${
						parsedDocument ? "text-green-600" : "text-gray-400"
					}`}
				>
					<div
						className={`w-2 h-2 rounded-full mr-2 ${
							parsedDocument ? "bg-green-400" : "bg-gray-400"
						}`}
					></div>
					{parsedDocument ? "Connected" : "Ready"}
				</span>
			</div>
			{documentId && (
				<div className="text-xs text-gray-500 mt-1">
					Document ID: {documentId.slice(0, 8)}...
				</div>
			)}
		</div>
	);
};

export default ApiStatus;
