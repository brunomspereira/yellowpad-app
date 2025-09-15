import React from "react";
import type ParsedDocument from "../../models/ParsedDocument";
import { Upload, FileText, Loader2 } from "lucide-react";

interface DocumentUploadProps {
	uploadedFile: File | null;
	parsedDocument: ParsedDocument | null;
	uploading: boolean;
	onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DocumentUpload = ({
	uploadedFile,
	parsedDocument,
	uploading,
	onFileUpload,
}: DocumentUploadProps) => {
	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-xl font-semibold mb-4 flex items-center">
				<Upload className="mr-2" size={20} />
				Upload Document
			</h2>

			<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
				<input
					type="file"
					accept=".docx"
					onChange={onFileUpload}
					className="hidden"
					id="file-upload"
					disabled={uploading}
				/>
				<label htmlFor="file-upload" className="cursor-pointer">
					{uploading ? (
						<Loader2
							className="mx-auto mb-2 text-blue-500 animate-spin"
							size={48}
						/>
					) : (
						<FileText className="mx-auto mb-2 text-gray-400" size={48} />
					)}
					<p className="text-gray-600">
						{uploading
							? "Uploading and parsing..."
							: "Click to upload a .docx file"}
					</p>
					<p className="text-sm text-gray-500">Word documents only</p>
				</label>
			</div>

			{uploadedFile && parsedDocument && (
				<div className="mt-4 p-3 bg-green-50 rounded-lg">
					<p className="text-green-800 font-medium">{uploadedFile.name}</p>
					<p className="text-sm text-green-600">
						Parsed successfully • {parsedDocument.totalSections} sections •{" "}
						{parsedDocument.documentType}
					</p>
				</div>
			)}
		</div>
	);
};

export default DocumentUpload;
