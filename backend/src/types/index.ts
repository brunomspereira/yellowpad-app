export interface DocumentSection {
	number: string;
	title: string;
	content: string;
	level: number;
	position: number;
}

export interface ParsedDocument {
	filename: string;
	sections: DocumentSection[];
	totalSections: number;
	documentType: string;
	originalBuffer: Buffer;
	style: DocumentStyle;
}

export interface DocumentStyle {
	headingStyle: {
		bold: boolean;
		underline: boolean;
		fontSize: string;
		fontFamily: string;
	};
	bodyStyle: {
		fontSize: string;
		fontFamily: string;
		spacing: string;
	};
	numberingStyle: string;
}

export interface InsertionJob {
	id: string;
	clause: string;
	instruction: string;
	status: "pending" | "processing" | "success" | "error";
	insertionPoint?: number;
	appliedStyle?: any;
	computedSectionNumber?: string;
	message?: string;
}

export interface ProcessingResult {
	success: boolean;
	results: InsertionJob[];
	processedDocumentBuffer?: Buffer;
	errors?: string[];
}
