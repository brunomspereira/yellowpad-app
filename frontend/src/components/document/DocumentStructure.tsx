import type ParsedDocument from "../../models/ParsedDocument";

interface DocumentStructureProps {
	document: ParsedDocument;
}

const DocumentStructure = ({ document }: DocumentStructureProps) => {
	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-xl font-semibold mb-4">Document Structure</h2>
			<div className="space-y-2 max-h-64 overflow-y-auto">
				{document.sections.map((section, index) => (
					<div
						key={index}
						className={`p-2 rounded ${
							section.level === 1 ? "bg-blue-50" : "bg-gray-50 ml-4"
						}`}
					>
						<span className="font-medium text-sm">
							{section.number}. {section.title}
						</span>
					</div>
				))}
			</div>
			<div className="mt-4 text-sm text-gray-600">
				Document Type:{" "}
				<span className="font-medium">{document.documentType}</span> | Sections:{" "}
				<span className="font-medium">{document.totalSections}</span>
			</div>
		</div>
	);
};

export default DocumentStructure;
