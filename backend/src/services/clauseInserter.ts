import {
	Document,
	Paragraph,
	TextRun,
	HeadingLevel,
	AlignmentType,
	Packer,
} from "docx";
import { InsertionJob, ParsedDocument, ProcessingResult } from "../types";

export class ClauseInserter {
	async processInsertions(
		document: ParsedDocument,
		jobs: InsertionJob[]
	): Promise<ProcessingResult> {
		const results: InsertionJob[] = [];
		const errors: string[] = [];

		try {
			for (const job of jobs) {
				const processedJob = await this.processJob(job, document);
				results.push(processedJob);

				if (processedJob.status === "error") {
					errors.push(processedJob.message || "Unknown error");
				}
			}

			// Generate new document if all jobs succeeded
			let processedDocumentBuffer: Buffer | undefined;
			if (results.every((r) => r.status === "success")) {
				processedDocumentBuffer = await this.generateProcessedDocument(
					document,
					results
				);
			}

			return {
				success: errors.length === 0,
				results,
				processedDocumentBuffer,
				errors: errors.length > 0 ? errors : undefined,
			};
		} catch (error) {
			let errorMessage = "Unkown error";

			if (error instanceof Error) {
				errorMessage = error.message;
			}
			return {
				success: false,
				results,
				errors: [`Processing failed: ${errorMessage}`],
			};
		}
	}

	private async processJob(
		job: InsertionJob,
		document: ParsedDocument
	): Promise<InsertionJob> {
		const insertionPoint = this.findInsertionPoint(
			document.sections,
			job.instruction
		);

		if (insertionPoint < 0) {
			return {
				...job,
				status: "error",
				message:
					'Could not determine insertion point from instruction. Try being more specific (e.g., "after section 4.1" or "before section 5").',
			};
		}

		// Determine new section number
		const newSectionNumber = this.calculateNewSectionNumber(
			document.sections,
			insertionPoint,
			job.instruction
		);

		return {
			...job,
			status: "success",
			insertionPoint,
			computedSectionNumber: newSectionNumber,
			appliedStyle: document.style.headingStyle,
			message: `Successfully inserted as section ${newSectionNumber} at position ${
				insertionPoint + 1
			}`,
		};
	}

	private findInsertionPoint(sections: any[], instruction: string): number {
		const lowerInstruction = instruction.toLowerCase();

		// Match explicit targets like: section 4.1, section 4.A, section 4(a)
		const sectionRegex =
			/section\s+([\dA-Z]+(?:[\.\-][\dA-Z]+)*|\d+\s*\([a-zA-Z]\))/i;
		const m = instruction.match(sectionRegex);
		if (!m) return -1;

		let target = m[1]
			.replace(/\s*\(/g, ".")
			.replace(/\)/g, "")
			.replace(/\s+/g, "");

		const targetParts = target.split(/[\.\-]/).map((p) => p.toUpperCase());

		let bestIndex = -1;
		for (let i = 0; i < sections.length; i++) {
			const sectionParts = sections[i].number
				.split(".")
				.map((p: string) => p.toUpperCase());
			let matches = true;
			for (let j = 0; j < targetParts.length; j++) {
				if (sectionParts[j] !== targetParts[j]) {
					matches = false;
					break;
				}
			}
			if (matches) {
				bestIndex = i;
				break;
			}
		}

		if (bestIndex !== -1) {
			if (lowerInstruction.includes("after")) return bestIndex + 1;
			if (lowerInstruction.includes("before")) return bestIndex;
			return bestIndex + 1;
		}

		// Fallback: operate relative to the broader section group (e.g., "4")
		const baseSection = targetParts[0];
		const groupStart = sections.findIndex(
			(s: any) => s.number.split(".")[0].toUpperCase() === baseSection
		);
		if (groupStart === -1) return -1;

		let groupEnd = groupStart;
		for (let i = groupStart + 1; i < sections.length; i++) {
			const top = sections[i].number.split(".")[0].toUpperCase();
			if (top !== baseSection) break;
			groupEnd = i;
		}

		if (lowerInstruction.includes("before")) {
			return groupStart; // insert before the group
		}
		return groupEnd + 1; // default/after -> after the group
	}

	private calculateNewSectionNumber(
		sections: any[],
		insertionPoint: number,
		instruction: string
	): string {
		// Prefer explicit number in instruction (supports letters)
		const instructionMatch = instruction.match(
			/as section\s+([\dA-Z]+(?:\.[\dA-Z]+)*)/i
		);
		if (instructionMatch) {
			return instructionMatch[1];
		}

		// Fallback: calculate based on position
		// Fallback: increment within the top-level group
		const prev = sections[Math.max(0, insertionPoint - 1)];
		if (prev) {
			const top = prev.number.split(".")[0];
			// If inserting right after a top-level heading without explicit numbering, default to next sibling
			return `${top}`;
		}

		return `${sections.length + 1}`;
	}

	private async generateProcessedDocument(
		document: ParsedDocument,
		results: InsertionJob[]
	): Promise<Buffer> {
		// Create new Word document with insertions
		const doc = new Document({
			sections: [
				{
					properties: {},
					children: [
						// Add original sections with insertions only, no synthetic header
						...this.buildDocumentContent(document, results),
					],
				},
			],
		});

		// Generate buffer
		return (await Packer.toBuffer(doc)) as Buffer;
	}

	private buildDocumentContent(
		document: ParsedDocument,
		results: InsertionJob[]
	): Paragraph[] {
		const paragraphs: Paragraph[] = [];
		const successfulInsertions = results.filter((r) => r.status === "success");

		for (let i = 0; i < document.sections.length; i++) {
			const section = document.sections[i];

			// Insert any clauses scheduled at this boundary (before section i)
			const beforeInsertions = successfulInsertions.filter(
				(ins) => ins.insertionPoint === i
			);
			for (const ins of beforeInsertions) {
				paragraphs.push(this.createInsertedClause(ins, document));
				paragraphs.push(new Paragraph({ text: "" }));
			}

			// Add original section heading with document style
			paragraphs.push(
				new Paragraph({
					children: [
						new TextRun({
							text: `${section.number}. ${section.title}`,
							bold: document.style.headingStyle.bold,
							underline: document.style.headingStyle.underline
								? { type: "single" }
								: undefined,
							font: document.style.headingStyle.fontFamily,
							size: this.toHalfPoints(document.style.headingStyle.fontSize),
						}),
					],
				})
			);

			paragraphs.push(
				new Paragraph({
					children: [
						new TextRun({
							text: section.content,
							font: document.style.bodyStyle.fontFamily,
							size: this.toHalfPoints(document.style.bodyStyle.fontSize),
						}),
					],
				})
			);

			paragraphs.push(new Paragraph({ text: "" }));
		}

		// Handle insertions after the last section (insertionPoint === sections.length)
		const tailInsertions = successfulInsertions.filter(
			(ins) => ins.insertionPoint === document.sections.length
		);
		for (const ins of tailInsertions) {
			paragraphs.push(this.createInsertedClause(ins, document));
			paragraphs.push(new Paragraph({ text: "" }));
		}

		return paragraphs;
	}

	private createInsertedClause(
		insertion: InsertionJob,
		document: ParsedDocument
	): Paragraph {
		// Determine if the clause already carries its own heading/number
		const clauseTrim = insertion.clause.trim();
		const clauseHasNumber = /^(\d+(?:\.[\dA-Z]+)*|[A-Z])\./.test(clauseTrim);
		const sectionNumber =
			insertion.computedSectionNumber ||
			this.extractExplicitSectionNumber(insertion.instruction);

		if (clauseHasNumber) {
			// Render clause as-is with body style to avoid duplicate headings
			return new Paragraph({
				children: [
					new TextRun({
						text: clauseTrim,
						font: document.style.bodyStyle.fontFamily,
						size: this.toHalfPoints(document.style.bodyStyle.fontSize),
					}),
				],
			});
		}

		// Otherwise, render heading number then clause text
		const headingNumber = sectionNumber || "";
		return new Paragraph({
			children: [
				...(headingNumber
					? [
							new TextRun({
								text: `${headingNumber}.`,
								bold: document.style.headingStyle.bold,
								underline: document.style.headingStyle.underline
									? { type: "single" }
									: undefined,
								font: document.style.headingStyle.fontFamily,
								size: this.toHalfPoints(document.style.headingStyle.fontSize),
							}),
					  ]
					: []),
				new TextRun({
					text: `${headingNumber ? " " : ""}${clauseTrim}`,
					font: document.style.bodyStyle.fontFamily,
					size: this.toHalfPoints(document.style.bodyStyle.fontSize),
					break: 1,
				}),
			],
		});
	}

	private extractExplicitSectionNumber(
		instruction: string
	): string | undefined {
		const m = instruction.match(/as section\s+([\dA-Z]+(?:\.[\dA-Z]+)*)/i);
		return m ? m[1] : undefined;
	}

	private toHalfPoints(pointSize: string): number | undefined {
		// Convert CSS-like "12pt" into half-points used by docx (24)
		const m = pointSize.match(/^(\d+(?:\.\d+)?)pt$/i);
		if (!m) return undefined;
		return Math.round(parseFloat(m[1]) * 2);
	}
}
