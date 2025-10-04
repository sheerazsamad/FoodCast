// This file is kept for backward compatibility
// The main Express server is now in src/index.ts

export { SupabaseService } from './supabase';
export { supabase } from './supabase';

// Re-export types for convenience
export type { Database, ApiResponse, SignupRequest, LoginRequest, SurplusUploadRequest, PredictionRequest, AllocationRequest, AnalyticsResponse } from './types';
