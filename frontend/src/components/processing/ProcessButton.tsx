import type InsertionJob from "../../models/InertionJob";
import type ParsedDocument from "../../models/ParsedDocument";
import { Loader2 } from "lucide-react";

interface ProcessButtonProps {
	jobs: InsertionJob[];
	parsedDocument: ParsedDocument | null;
	processing: boolean;
	onProcess: () => void;
}

const ProcessButton = ({
	jobs,
	parsedDocument,
	processing,
	onProcess,
}: ProcessButtonProps) => {
	const hasIncompleteJobs = jobs.some((job) => !job.clause || !job.instruction);

	if (jobs.length === 0 || !parsedDocument) return null;

	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<button
				onClick={onProcess}
				disabled={processing || hasIncompleteJobs}
				className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium flex items-center justify-center"
			>
				{processing ? (
					<>
						<Loader2 className="animate-spin mr-2" size={16} />
						Processing...
					</>
				) : (
					"Process All Insertions"
				)}
			</button>
			{hasIncompleteJobs && (
				<p className="text-xs text-gray-500 mt-2 text-center">
					Please fill in all clause text and instructions before processing
				</p>
			)}
		</div>
	);
};

export default ProcessButton;
