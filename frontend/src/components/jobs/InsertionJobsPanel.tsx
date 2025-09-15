import { Plus } from "lucide-react";
import type InsertionJob from "../../models/InertionJob";
import type ParsedDocument from "../../models/ParsedDocument";
import InsertionJobCard from "./InsertionJobCard";

interface InsertionJobsPanelProps {
	jobs: InsertionJob[];
	parsedDocument: ParsedDocument | null;
	onAddJob: () => void;
	onUpdateJob: (id: string, field: keyof InsertionJob, value: string) => void;
	onRemoveJob: (id: string) => void;
}

const InsertionJobsPanel = ({
	jobs,
	parsedDocument,
	onAddJob,
	onUpdateJob,
	onRemoveJob,
}: InsertionJobsPanelProps) => {
	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold">Clause Insertions</h2>
				<button
					onClick={onAddJob}
					className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400"
					disabled={!parsedDocument}
				>
					<Plus size={16} className="mr-1" />
					Add Job
				</button>
			</div>

			<div className="space-y-4 max-h-96 overflow-y-auto">
				{jobs.map((job) => (
					<InsertionJobCard
						key={job.id}
						job={job}
						onUpdate={onUpdateJob}
						onRemove={onRemoveJob}
					/>
				))}

				{jobs.length === 0 && (
					<div className="text-center text-gray-500 py-8">
						<p>No insertion jobs yet.</p>
						<p className="text-sm">
							Upload a document and add jobs to get started.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default InsertionJobsPanel;
