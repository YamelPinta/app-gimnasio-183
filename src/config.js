import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://azssqieevaglrgyacxfl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3NxaWVldmFnbHJneWFjeGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjM4NjYsImV4cCI6MjA5ODIzOTg2Nn0.WsEiF1mmdlqnOILxKWKchOgUXc7Yw84lE6ATbWQha-Q";

// Creamos el cliente y lo colgamos de window para que el resto de los archivos lo lean sin romper nada
export const clienteSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.clienteSupabase = clienteSupabase;