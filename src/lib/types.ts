import type { ToastSettings } from '@skeletonlabs/skeleton';

export type RetrievalType = 'submission' | 'comment';

export type QueryResponse = {
	responseData?: Object;
	authorData?: Object;
	toast?: ToastSettings;
};
