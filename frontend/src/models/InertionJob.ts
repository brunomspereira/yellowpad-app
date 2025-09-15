export default interface InsertionJob {
	id: string;
	clause: string;
	instruction: string;
	status: "pending" | "processing" | "success" | "error";
	insertionPoint?: number;
	appliedStyle?: any;
	message?: string;
}
