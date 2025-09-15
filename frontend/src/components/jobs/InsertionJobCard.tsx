import type InsertionJob from "../../models/InertionJob";
import { Trash2 } from "lucide-react";

interface InsertionJobCardProps {
	job: InsertionJob;
	onUpdate: (id: string, field: keyof InsertionJob, value: string) => void;
	onRemove: (id: string) => void;
}

const InsertionJobCard = ({
	job,
	onUpdate,
	onRemove,
}: InsertionJobCardProps) => {
	return (
		<div className="border rounded-lg p-4 relative">
			<div className="space-y-3">
				<div>
					<label className="block text-sm font-medium mb-1">
						New Clause Text
					</label>
					<textarea
						placeholder="Enter the clause text to insert..."
						value={job.clause}
						onChange={(e) => onUpdate(job.id, "clause", e.target.value)}
						className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						rows={3}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Insertion Instruction
					</label>
					<textarea
						placeholder="e.g., Insert as section 4.2, directly after section 4.1..."
						value={job.instruction}
						onChange={(e) => onUpdate(job.id, "instruction", e.target.value)}
						className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						rows={2}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Examples: "after section 3", "before section 5", "as section 4.2
						after section 4.1"
					</p>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-xs text-gray-500">
						Job{" "}
						{job.id.startsWith("temp-")
							? "(unsaved)"
							: `#${job.id.slice(0, 8)}`}
					</span>
					<button
						onClick={() => onRemove(job.id)}
						className="text-red-600 hover:text-red-800 text-sm flex items-center"
					>
						<Trash2 size={14} className="mr-1" />
						Remove
					</button>
				</div>
			</div>
		</div>
	);
};

export default InsertionJobCard;
