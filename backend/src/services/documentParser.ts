import mammoth from "mammoth";
import { DocumentSection, ParsedDocument, DocumentStyle } from "../types";

export class DocumentParser {
	async parseDocument(
		buffer: Buffer,
		filename: string
	): Promise<ParsedDocument> {
		try {
			// Extract text content using mammoth
			const result = await mammoth.extractRawText({ buffer });
			const text = result.value;

			// Parse sections from the text
			const sections = this.extractSections(text);

			// Analyze document style
			const style = await this.analyzeStyle(buffer);

			// Determine document type
			const documentType = this.determineDocumentType(text, filename);

			return {
				filename,
				sections,
				totalSections: sections.length,
				documentType,
				originalBuffer: buffer,
				style,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to parse document: ${error.message}`);
			}
			throw new Error("Failed to parse document: Unknown error");
		}
	}

	private extractSections(text: string): DocumentSection[] {
		const sections: DocumentSection[] = [];
		// Normalize text: ensure headings begin on their own lines
		let normalized = text.replace(/\r\n/g, "\n");
		// Insert line breaks before numbered headings (e.g., 4., 4.2.) when missing
		normalized = normalized.replace(/(?<!\n)(\b\d+(?:\.\d+)*)\.\s+/g, "\n$1. ");
		// Insert line breaks before lettered subsections (e.g., A., B.) when missing
		normalized = normalized.replace(/(?<!\n)(\b[A-Z])\.\s+/g, "\n$1. ");

		const lines = normalized.split("\n").filter((line) => line.trim());

		let currentPosition = 0;
		let currentNumericSection: string | null = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Match numbered sections (1., 2., 10., 4.2, etc.)
			const numberedMatch = line.match(/^(\d+(?:\.\d+)*)\.\s*(.+)/);
			// Match lettered subsections (A., B., etc.)
			const letteredMatch = line.match(/^([A-Z])\.\s+(.+)/);

			if (numberedMatch) {
				const number = numberedMatch[1];
				const title = numberedMatch[2];
				const level = number.split(".").length;
				currentNumericSection = number;

				// Get content (next lines until next numbered or lettered section)
				let content = "";
				let j = i + 1;
				while (
					j < lines.length &&
					!lines[j].match(/^\d+(?:\.\d+)*\.\s/) &&
					!lines[j].match(/^[A-Z]\.\s+/)
				) {
					content += lines[j] + "\n";
					j++;
				}

				sections.push({
					number,
					title: title.replace(/[\[\]{}]/g, "").trim(),
					content: content.trim(),
					level,
					position: currentPosition++,
				});
				continue;
			}

			if (letteredMatch) {
				const letter = letteredMatch[1];
				const title = letteredMatch[2];
				const number = currentNumericSection
					? `${currentNumericSection}.${letter}`
					: letter;
				const level = number.split(".").length;

				let content = "";
				let j = i + 1;
				while (
					j < lines.length &&
					!lines[j].match(/^\d+(?:\.\d+)*\.\s/) &&
					!lines[j].match(/^[A-Z]\.\s+/)
				) {
					content += lines[j] + "\n";
					j++;
				}

				sections.push({
					number,
					title: title.replace(/[\[\]{}]/g, "").trim(),
					content: content.trim(),
					level,
					position: currentPosition++,
				});
			}
		}

		return sections;
	}

	private async analyzeStyle(buffer: Buffer): Promise<DocumentStyle> {
		// In a real implementation, this would analyze the actual Word document formatting
		// For now, return common legal document styling
		return {
			headingStyle: {
				bold: true,
				underline: true,
				fontSize: "12pt",
				fontFamily: "Times New Roman",
			},
			bodyStyle: {
				fontSize: "11pt",
				fontFamily: "Times New Roman",
				spacing: "1.15",
			},
			numberingStyle: "decimal",
		};
	}

	private determineDocumentType(text: string, filename: string): string {
		const lowerText = text.toLowerCase();
		const lowerFilename = filename.toLowerCase();

		if (
			lowerText.includes("non-disclosure") ||
			lowerText.includes("confidential") ||
			lowerFilename.includes("nda")
		) {
			return "Non-Disclosure Agreement";
		} else if (
			lowerText.includes("subscription") ||
			lowerText.includes("service agreement")
		) {
			return "Service Agreement";
		} else if (
			lowerText.includes("mutual") &&
			lowerText.includes("agreement")
		) {
			return "Mutual Agreement";
		}

		return "Legal Document";
	}
}
