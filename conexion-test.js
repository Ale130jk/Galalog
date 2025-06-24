// conexion-test.js
import { supabase } from './supabaseClient.js';

async function testConexion() {
  const { data, error } = await supabase.from('usuarios').select('*');
  console.log('✅ Datos desde Supabase:', data);
  if (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
  }
}

testConexion();
