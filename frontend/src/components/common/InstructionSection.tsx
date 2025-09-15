const InstructionSection = () => {
	return (
		<div className="mt-8 bg-white rounded-lg shadow-lg p-6">
			<h3 className="text-lg font-semibold mb-3">How to Use</h3>
			<div className="grid md:grid-cols-3 gap-4 text-sm">
				<div className="flex items-start">
					<div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs font-bold">
						1
					</div>
					<div>
						<p className="font-medium">Upload Document</p>
						<p className="text-gray-600">
							Upload a .docx contract file. The system will automatically parse
							sections and structure.
						</p>
					</div>
				</div>
				<div className="flex items-start">
					<div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs font-bold">
						2
					</div>
					<div>
						<p className="font-medium">Add Insertion Jobs</p>
						<p className="text-gray-600">
							Create jobs with the clause text and specific insertion
							instructions (e.g., "after section 4.1").
						</p>
					</div>
				</div>
				<div className="flex items-start">
					<div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs font-bold">
						3
					</div>
					<div>
						<p className="font-medium">Process & Download</p>
						<p className="text-gray-600">
							Process all jobs and download the modified document with proper
							formatting preserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InstructionSection;
