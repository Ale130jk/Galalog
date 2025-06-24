import { supabase } from './supabaseClient.js';

let userId = null;
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("⚠️ No has iniciado sesión.");
    window.location.href = 'index.html';
    return;
  }

  userId = user.id;

  const form = document.getElementById('form-producto');
  const btnActualizar = document.getElementById('actualizar');
  const btnLimpiar = document.getElementById('limpiar');

  // Cargar productos
  await cargarProductos();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id').value.trim();
    const nombre = document.getElementById('nombre_producto').value.trim(); // aquí usamos el id correcto del input
    const empresa = document.getElementById('empresa').value.trim();
    const cantidad = document.getElementById('cantidad').value.trim();
    const fechaIngreso = document.getElementById('fecha_ingreso').value;
    const fechaSalida = document.getElementById('fecha_salida').value;

    if (!id || !nombre || !empresa || !cantidad || !fechaIngreso || !fechaSalida) {
      mostrarMensaje('❌ Todos los campos son obligatorios.', 'error');
      return;
    }

    if (new Date(fechaIngreso) < new Date()) {
      mostrarMensaje('❌ La fecha de ingreso no puede ser anterior al momento actual.', 'error');
      return;
    }

    if (new Date(fechaSalida) < new Date(fechaIngreso)) {
      mostrarMensaje('❌ La fecha de salida no puede ser anterior a la de ingreso.', 'error');
      return;
    }

    const datos = {
      id, // solo si tú quieres controlar el UUID; si no, elimínalo
      nombre_producto: nombre, // ✅ campo correcto según Supabase
      empresa, // ⚠️ asegúrate que esta columna exista, o elimina si no
      cantidad: parseInt(cantidad),
      fecha_entrega: fechaIngreso.split('T')[0],
      hora_entrega: fechaIngreso.split('T')[1],
      fecha_salida: fechaSalida.split('T')[0],
      hora_salida: fechaSalida.split('T')[1],
      creado_por: userId
    };

    if (editandoId) {
      mostrarMensaje('✏️ Edición aún no implementada.', 'error');
    } else {
      const { error } = await supabase.from('productos').insert([datos]);
      if (error) {
        mostrarMensaje('❌ Error al guardar: ' + error.message, 'error');
      } else {
        mostrarMensaje('✅ Producto agregado correctamente.', 'success');
        form.reset();
        await cargarProductos();
      }
    }
  });

  btnLimpiar.addEventListener('click', () => {
    form.reset();
    editandoId = null;
    btnActualizar.disabled = true;
  });
});

// 📄 Mostrar productos
async function cargarProductos() {
  if (!userId) return;

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('creado_por', userId)
    .order('fecha_entrega', { ascending: true });

  const lista = document.getElementById('lista-productos');
  lista.innerHTML = '';

  if (error) {
    mostrarMensaje('❌ Error al cargar productos: ' + error.message, 'error');
    return;
  }

  data.forEach((prod) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nombre_producto}</td>
      <td>${prod.empresa || ''}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.fecha_entrega} ${prod.hora_entrega}</td>
      <td>${prod.fecha_salida} ${prod.hora_salida}</td>
      <td><button onclick="eliminarProducto('${prod.id}')">❌</button></td>
    `;
    lista.appendChild(fila);
  });
}

// 🗑️ Eliminar producto
window.eliminarProducto = async function (id) {
  const confirmar = confirm('¿Estás seguro de eliminar este producto?');
  if (!confirmar) return;

  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) {
    mostrarMensaje('❌ Error al eliminar: ' + error.message, 'error');
  } else {
    mostrarMensaje('✅ Producto eliminado.', 'success');
    await cargarProductos();
  }
};

// 💬 Mostrar mensajes
function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById('mensaje');
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}
