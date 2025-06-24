// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://xrllocpppgxfrfwoppwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybGxvY3BwcGd4ZnJmd29wcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjM0MjMsImV4cCI6MjA2NjI5OTQyM30.hJlxScRfn6bqe8QWixCf8cEMf4dvWtlj5mKQOZZXbM4'
);
