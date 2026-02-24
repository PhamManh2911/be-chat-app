import { IdempotencyProcessStatus } from '@/types/app';

export const IDEMPOTENT_PROCESSING: IdempotencyProcessStatus = 'processing';

export const IDEMPOTENT_PROCESS_COMPLETED: IdempotencyProcessStatus = 'completed';

export const IDEMPOTENT_PROCESS_FAILED: IdempotencyProcessStatus = 'failed';
