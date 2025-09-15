import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { DocumentParser } from "../services/documentParser";
import { ClauseInserter } from "../services/clauseInserter";
import { ParsedDocument, InsertionJob } from "../types";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const documents: Map<string, ParsedDocument> = new Map();
const jobs: Map<string, InsertionJob[]> = new Map();

const documentParser = new DocumentParser();
const clauseInserter = new ClauseInserter();

router.post("/upload", upload.single("document"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		if (!req.file.originalname.endsWith(".docx")) {
			return res.status(400).json({ error: "Only .docx files are supported" });
		}

		const documentId = uuidv4();
		const parsedDocument = await documentParser.parseDocument(
			req.file.buffer,
			req.file.originalname
		);

		documents.set(documentId, parsedDocument);
		jobs.set(documentId, []);

		res.json({
			success: true,
			documentId,
			document: {
				filename: parsedDocument.filename,
				sections: parsedDocument.sections,
				totalSections: parsedDocument.totalSections,
				documentType: parsedDocument.documentType,
			},
		});
	} catch (error) {
		let errorMessage = "Unkown error";

		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Upload error:", error);
		res.status(500).json({ error: errorMessage });
	}
});

// Add insertion job
router.post("/jobs/:documentId", (req, res) => {
	try {
		const { documentId } = req.params;
		const { clause, instruction } = req.body;

		if (!documents.has(documentId)) {
			return res.status(404).json({ error: "Document not found" });
		}

		if (!clause || !instruction) {
			return res
				.status(400)
				.json({ error: "Clause and instruction are required" });
		}

		const job: InsertionJob = {
			id: uuidv4(),
			clause,
			instruction,
			status: "pending",
		};

		const documentJobs = jobs.get(documentId) || [];
		documentJobs.push(job);
		jobs.set(documentId, documentJobs);

		res.json({ success: true, job });
	} catch (error) {
		let errorMessage = "Unkown error";

		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Add job error:", error);
		res.status(500).json({ error: errorMessage });
	}
});

// Get jobs for document
router.get("/jobs/:documentId", (req, res) => {
	try {
		const { documentId } = req.params;
		const documentJobs = jobs.get(documentId) || [];
		res.json({ success: true, jobs: documentJobs });
	} catch (error) {
		let errorMessage = "Unkown error";

		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Get jobs error:", error);
		res.status(500).json({ error: errorMessage });
	}
});

// Process all insertions
router.post("/process/:documentId", async (req, res) => {
	try {
		const { documentId } = req.params;
		const document = documents.get(documentId);
		const documentJobs = jobs.get(documentId);

		if (!document) {
			return res.status(404).json({ error: "Document not found" });
		}

		if (!documentJobs || documentJobs.length === 0) {
			return res.status(400).json({ error: "No jobs to process" });
		}

		const result = await clauseInserter.processInsertions(
			document,
			documentJobs
		);

		// Update stored jobs with results
		jobs.set(documentId, result.results);

		res.json({
			success: result.success,
			results: result.results,
			errors: result.errors,
			hasProcessedDocument: !!result.processedDocumentBuffer,
		});
	} catch (error) {
		let errorMessage = "Unkown error";

		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Process error:", error);
		res.status(500).json({ error: errorMessage });
	}
});

// Download processed document
router.get("/download/:documentId", async (req, res) => {
	try {
		const { documentId } = req.params;
		const document = documents.get(documentId);
		const documentJobs = jobs.get(documentId);

		if (!document || !documentJobs) {
			return res.status(404).json({ error: "Document or jobs not found" });
		}

		const result = await clauseInserter.processInsertions(
			document,
			documentJobs
		);

		if (!result.processedDocumentBuffer) {
			return res.status(400).json({ error: "No processed document available" });
		}

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="processed_${document.filename}"`
		);
		res.send(result.processedDocumentBuffer);
	} catch (error) {
		let errorMessage = "Unkown error";

		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Download error:", error);
		res.status(500).json({ error: errorMessage });
	}
});

export default router;
