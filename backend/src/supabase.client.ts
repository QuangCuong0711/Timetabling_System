import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgfieofjpnamhnlvqubp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZmllb2ZqcG5hbWhubHZxdWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzg0MzQsImV4cCI6MjA5MDc1NDQzNH0.yehQkQAMySIue-zhylKee4ePxb1LPbIPYxEjRODO38c';

export const supabase = createClient(supabaseUrl, supabaseKey);
