import type DocumentSection from "./DocumentSection";

export default interface ParsedDocument {
	filename: string;
	sections: DocumentSection[];
	totalSections: number;
	documentType: string;
}
