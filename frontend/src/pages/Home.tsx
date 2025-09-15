import { useYellowPad } from "../hooks/useYellowPad";
import PageHeader from "../components/common/PageHeader";
import InstructionSection from "../components/common/InstructionSection";
import DocumentUpload from "../components/upload/DocumentUpload";
import DocumentStructure from "../components/document/DocumentStructure";
import InsertionJobsPanel from "../components/jobs/InsertionJobsPanel";
import ProcessButton from "../components/processing/ProcessButton";
import ResultsPanel from "../components/results/ResultsPanel";
import ApiStatus from "../components/status/ApiStatus";
import ErrorBanner from "../components/common/ErrorBanner";

const Home = () => {
	const {
		uploadedFile,
		parsedDocument,
		documentId,
		insertionJobs,
		processing,
		uploading,
		results,
		error,
		handleFileUpload,
		addInsertionJob,
		updateInsertionJob,
		removeInsertionJob,
		processInsertions,
		downloadProcessedDocument,
		clearError,
	} = useYellowPad();

	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					<PageHeader />

					{error && <ErrorBanner error={error} onClear={clearError} />}

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="space-y-6">
							<DocumentUpload
								uploadedFile={uploadedFile}
								parsedDocument={parsedDocument}
								uploading={uploading}
								onFileUpload={handleFileUpload}
							/>

							{parsedDocument && (
								<DocumentStructure document={parsedDocument} />
							)}
						</div>

						<div className="space-y-6">
							<InsertionJobsPanel
								jobs={insertionJobs}
								parsedDocument={parsedDocument}
								onAddJob={addInsertionJob}
								onUpdateJob={updateInsertionJob}
								onRemoveJob={removeInsertionJob}
							/>

							<ProcessButton
								jobs={insertionJobs}
								parsedDocument={parsedDocument}
								processing={processing}
								onProcess={processInsertions}
							/>

							<ResultsPanel
								results={results}
								parsedDocument={parsedDocument}
								onDownload={downloadProcessedDocument}
							/>

							<ApiStatus
								parsedDocument={parsedDocument}
								documentId={documentId}
							/>
						</div>
					</div>

					<InstructionSection />
				</div>
			</div>
		</main>
	);
};

export default Home;
