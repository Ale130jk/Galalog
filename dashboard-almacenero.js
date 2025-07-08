import { supabase } from './supabaseClient.js';

let userId = null;
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // ✅ Obtener usuario desde sessionStorage (sistema personalizado)
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

  if (!usuarioActual) {
    alert("⚠️ No has iniciado sesión.");
    window.location.href = 'index.html';
    return;
  }

  // ✅ Usar el ID del usuario desde tu sistema personalizado
  userId = usuarioActual.id;

  const form = document.getElementById('form-producto');
  const btnActualizar = document.getElementById('actualizar');
  const btnLimpiar = document.getElementById('limpiar');

  // Cargar productos
  await cargarProductos();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id').value.trim();
    const nombre = document.getElementById('nombre_producto').value.trim();
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
      id_producto: id, // Cambié de 'id' a 'id_producto' para evitar conflictos
      nombre_producto: nombre,
      empresa_destino: empresa, // Cambié de 'empresa' a 'empresa_destino' para ser más específico
      cantidad: parseInt(cantidad),
      fecha_entrega: fechaIngreso.split('T')[0],
      hora_entrega: fechaIngreso.split('T')[1],
      fecha_salida: fechaSalida.split('T')[0],
      hora_salida: fechaSalida.split('T')[1],
      creado_por: userId
    };

    if (editandoId) {
      // ✅ Implementar edición
      const { error } = await supabase
        .from('productos')
        .update(datos)
        .eq('id', editandoId);
      
      if (error) {
        mostrarMensaje('❌ Error al actualizar: ' + error.message, 'error');
      } else {
        mostrarMensaje('✅ Producto actualizado correctamente.', 'success');
        form.reset();
        editandoId = null;
        btnActualizar.disabled = true;
        await cargarProductos();
      }
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

  // ✅ Implementar función de actualizar
  btnActualizar.addEventListener('click', async () => {
    if (!editandoId) return;
    
    const form = document.getElementById('form-producto');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
  });

  btnLimpiar.addEventListener('click', () => {
    form.reset();
    editandoId = null;
    btnActualizar.disabled = true;
    mostrarMensaje('🧹 Formulario limpiado.', 'success');
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

  if (!data || data.length === 0) {
    lista.innerHTML = '<tr><td colspan="7">No hay productos registrados</td></tr>';
    return;
  }

  data.forEach((prod) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${prod.id_producto || prod.id}</td>
      <td>${prod.nombre_producto}</td>
      <td>${prod.empresa_destino || prod.empresa || ''}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.fecha_entrega} ${prod.hora_entrega}</td>
      <td>${prod.fecha_salida} ${prod.hora_salida}</td>
      <td>
        <button onclick="editarProducto('${prod.id}')" title="Editar">✏️</button>
        <button onclick="eliminarProducto('${prod.id}')" title="Eliminar">❌</button>
      </td>
    `;
    lista.appendChild(fila);
  });
}

// ✏️ Editar producto
window.editarProducto = async function (id) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    mostrarMensaje('❌ Error al cargar producto: ' + error.message, 'error');
    return;
  }

  // Llenar el formulario con los datos del producto
  document.getElementById('id').value = data.id_producto || data.id;
  document.getElementById('nombre_producto').value = data.nombre_producto;
  document.getElementById('empresa').value = data.empresa_destino || data.empresa || '';
  document.getElementById('cantidad').value = data.cantidad;
  
  // Combinar fecha y hora para datetime-local
  const fechaIngreso = `${data.fecha_entrega}T${data.hora_entrega}`;
  const fechaSalida = `${data.fecha_salida}T${data.hora_salida}`;
  
  document.getElementById('fecha_ingreso').value = fechaIngreso;
  document.getElementById('fecha_salida').value = fechaSalida;

  editandoId = id;
  document.getElementById('actualizar').disabled = false;
  
  mostrarMensaje('✏️ Producto cargado para edición. Modifica los campos y presiona "Actualizar".', 'success');
};

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
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    mensaje.textContent = '';
    mensaje.className = 'mensaje';
  }, 5000);
}
