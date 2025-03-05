import type { ToastSettings } from '@skeletonlabs/skeleton';

export type RetrievalType = 'submission' | 'comment';
export type VizRetrievalType = 'topics' | 'comments';
export type Datum = 'count' | 'karma';
export type NumberRepresentation = 'literal' | 'percentage';
export type PieData = Array<[string, number]>;
export type TransformedPieData = Array<{ name: string; value: number }>;

export type QueryResponse = {
	responseData?: {
		authorData: Object;
		pieData: PieData;
	};
	authorData?: Object;
	toast?: ToastSettings;
};

export type ApiDataItem = {
	created_utc: number
	score: number
	num_comments: number
}