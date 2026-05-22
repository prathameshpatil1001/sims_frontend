// Compatibility shim — all API calls now go through lib/api-service.ts
// This file is kept to avoid breaking any remaining import references.
// Gradually migrate callers to import from '@/lib/api-service' directly.

export { authApi as apiClient } from './api-service';
