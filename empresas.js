import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const formEmpresa = document.getElementById('form-empresa');
  const listaEmpresas = document.getElementById('lista-empresas');
  const limpiarTablaBtn = document.getElementById('limpiar-tabla-empresas');
  const btnRegistrar = formEmpresa.querySelector('button[type="submit"]');

  let modoEdicion = false;
  let empresaEditarId = null;

  // Verificar sesión activa
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    alert('⚠️ No has iniciado sesión. Redirigiendo...');
    window.location.href = 'index.html';
    return;
  }

  const userId = user.id;

  // 📝 Registrar o editar empresa
  formEmpresa.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ruc = document.getElementById('ruc').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    console.log('ruc:', ruc);
    console.log('nombre:', nombre);
    console.log('direccion:', direccion);

    if (!ruc || !nombre || !direccion) {
      alert('❌ Todos los campos son obligatorios.');
      return;
    }

    if (modoEdicion && empresaEditarId) {
      // ✏️ Modo edición
      const { error } = await supabase
        .from('empresas')
        .update({
          ruc,
          nombre,
          direccion
        })
        .eq('id', empresaEditarId);

      if (error) {
        alert('❌ Error al actualizar empresa: ' + error.message);
      } else {
        alert('✅ Empresa actualizada correctamente.');
        modoEdicion = false;
        empresaEditarId = null;
        btnRegistrar.textContent = '➕ Registrar';
        formEmpresa.reset();
        cargarEmpresas();
      }

    } else {
      // ➕ Modo registro
      const empresa = {
        ruc,
        nombre,
        direccion,
        creado_por: userId
      };

      const { error } = await supabase.from('empresas').insert([empresa]);

      if (error) {
        alert('❌ Error al registrar empresa: ' + error.message);
      } else {
        alert('✅ Empresa registrada correctamente.');
        formEmpresa.reset();
      }
      cargarEmpresas();
    }
  });

// Asegúrate que está dentro del DOMContentLoaded

async function cargarEmpresas() {
  const { data, error } = await supabase
    .from('empresas')
    .select('id, ruc, nombre, direccion')
    .eq('creado_por', user.id) // 👈 filtra solo las del usuario actual
    .order('nombre', { ascending: true });

  listaEmpresas.innerHTML = '';

  if (error) {
    console.error('❌ Error al cargar empresas:', error.message);
    return;
  }

  data.forEach(emp => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${emp.ruc}</td>
      <td>${emp.nombre}</td>
      <td>${emp.direccion}</td>
      <td>
        <button class="btn-eliminar" data-id="${emp.id}" title="Eliminar">🗑️</button>
      </td>
    `;
    listaEmpresas.appendChild(fila);
  });

  // Asignar eventos a los botones de eliminar (importante que esté aquí)
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const empresaId = btn.getAttribute('data-id');

      if (confirm('¿Estás seguro de eliminar esta empresa?')) {
        const { error } = await supabase
          .from('empresas')
          .delete()
          .eq('id', empresaId)
          .eq('creado_por', user.id); // 🔐 seguridad extra por si acaso

        if (error) {
          alert('❌ Error al eliminar empresa: ' + error.message);
        } else {
          alert('✅ Empresa eliminada correctamente.');
          cargarEmpresas(); // 🔄 recargar
        }
      }
    });
  });
}
  // Cargar empresas al inicio
  cargarEmpresas();
});
