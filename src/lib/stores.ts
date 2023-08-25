import { writable } from 'svelte/store';
import type { RetrievalType } from './types';

export const retrievalTypeStore = writable<RetrievalType>('submission');
