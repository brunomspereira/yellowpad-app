import { useState, useCallback } from "react";
import type ParsedDocument from "../models/ParsedDocument";
import type InsertionJob from "../models/InertionJob";

const API_BASE_URL = "http://localhost:3000";

export const useYellowPad = () => {
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(
		null
	);
	const [documentId, setDocumentId] = useState<string | null>(null);
	const [insertionJobs, setInsertionJobs] = useState<InsertionJob[]>([]);
	const [processing, setProcessing] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [results, setResults] = useState<InsertionJob[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleFileUpload = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			if (!file.name.endsWith(".docx")) {
				setError("Please upload a .docx file");
				return;
			}

			setUploading(true);
			setError(null);

			try {
				const formData = new FormData();
				formData.append("document", file);

				const response = await fetch(`${API_BASE_URL}/upload`, {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Upload failed");
				}

				const data = await response.json();

				setUploadedFile(file);
				setParsedDocument(data.document);
				setDocumentId(data.documentId);
				setInsertionJobs([]);
				setResults([]);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Upload failed");
			} finally {
				setUploading(false);
			}
		},
		[]
	);

	const addInsertionJob = () => {
		const newJob: InsertionJob = {
			id: `temp-${Date.now()}`,
			clause: "",
			instruction: "",
			status: "pending",
		};

		setInsertionJobs([...insertionJobs, newJob]);
	};

	const updateInsertionJob = (
		id: string,
		field: keyof InsertionJob,
		value: string
	) => {
		setInsertionJobs((jobs) =>
			jobs.map((job) => (job.id === id ? { ...job, [field]: value } : job))
		);
	};

	const removeInsertionJob = (id: string) => {
		setInsertionJobs((jobs) => jobs.filter((job) => job.id !== id));
	};

	const saveJobToBackend = async (job: InsertionJob) => {
		if (!documentId || !job.clause || !job.instruction) return;

		try {
			const response = await fetch(`${API_BASE_URL}/jobs/${documentId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					clause: job.clause,
					instruction: job.instruction,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save job");
			}

			const data = await response.json();

			setInsertionJobs((jobs) =>
				jobs.map((j) => (j.id === job.id ? { ...j, id: data.job.id } : j))
			);
		} catch (err) {
			setError("Failed to save job to server");
		}
	};

	const processInsertions = async () => {
		if (!documentId || insertionJobs.length === 0) return;

		setProcessing(true);
		setError(null);

		try {
			for (const job of insertionJobs) {
				if (job.id.startsWith("temp-")) {
					await saveJobToBackend(job);
				}
			}

			const response = await fetch(`${API_BASE_URL}/process/${documentId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Processing failed");
			}

			const data = await response.json();
			setResults(data.results);

			if (!data.success && data.errors) {
				setError(data.errors.join(", "));
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Processing failed");
		} finally {
			setProcessing(false);
		}
	};

	const downloadProcessedDocument = async () => {
		if (!documentId) return;

		try {
			const response = await fetch(`${API_BASE_URL}/download/${documentId}`);

			if (!response.ok) {
				throw new Error("Download failed");
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `processed_${parsedDocument?.filename || "document.docx"}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (err) {
			setError("Download failed");
		}
	};

	const clearError = () => setError(null);

	return {
		// State
		uploadedFile,
		parsedDocument,
		documentId,
		insertionJobs,
		processing,
		uploading,
		results,
		error,
		// Actions
		handleFileUpload,
		addInsertionJob,
		updateInsertionJob,
		removeInsertionJob,
		processInsertions,
		downloadProcessedDocument,
		clearError,
	};
};
