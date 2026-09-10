import { InjectionToken } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { supabaseClient } from './supabase-client';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SUPABASE_CLIENT', {
  providedIn: 'root',
  factory: () => supabaseClient,
});
