import { supabase } from './supabaseClient.js';

let userId = null;
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // ✅ Verificar sesión usando sessionStorage (igual que en auth.js)
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

  if (!usuarioActual) {
    alert("⚠️ No has iniciado sesión.");
    window.location.href = 'index.html';
    return;
  }

  // ✅ Usar el ID del usuario desde la sesión guardada
  userId = usuarioActual.id;
  
  console.log('Usuario actual:', usuarioActual);
  console.log('User ID:', userId);

  const form = document.getElementById('form-producto');
  const btnActualizar = document.getElementById('actualizar');
  const btnLimpiar = document.getElementById('limpiar');

  // Cargar productos al inicio
  await cargarProductos();

  // 📝 Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id').value.trim();
    const nombre = document.getElementById('nombre_producto').value.trim();
    const empresa = document.getElementById('empresa').value.trim();
    const cantidad = document.getElementById('cantidad').value.trim();
    const fechaIngreso = document.getElementById('fecha_ingreso').value;
    const fechaSalida = document.getElementById('fecha_salida').value;

    // Validaciones
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

    // Preparar datos para insertar
    const datos = {
      id: id,
      nombre_producto: nombre,
      empresa: empresa,
      cantidad: parseInt(cantidad),
      fecha_entrega: fechaIngreso.split('T')[0],
      hora_entrega: fechaIngreso.split('T')[1],
      fecha_salida: fechaSalida.split('T')[0],
      hora_salida: fechaSalida.split('T')[1],
      creado_por: userId
    };

    console.log('Datos a insertar:', datos);

    if (editandoId) {
      // Modo edición (por implementar)
      mostrarMensaje('✏️ Función de edición aún no implementada.', 'error');
    } else {
      // Modo inserción
      const { error } = await supabase.from('productos').insert([datos]);
      
      if (error) {
        console.error('Error al insertar:', error);
        mostrarMensaje('❌ Error al guardar: ' + error.message, 'error');
      } else {
        mostrarMensaje('✅ Producto agregado correctamente.', 'success');
        form.reset();
        await cargarProductos();
      }
    }
  });

  // 🧹 Limpiar formulario
  btnLimpiar.addEventListener('click', () => {
    form.reset();
    editandoId = null;
    if (btnActualizar) {
      btnActualizar.disabled = true;
    }
    mostrarMensaje('');
  });
});

// 📄 Cargar y mostrar productos
async function cargarProductos() {
  if (!userId) {
    console.log('No hay userId disponible');
    return;
  }

  console.log('Cargando productos para userId:', userId);

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('creado_por', userId)
    .order('fecha_entrega', { ascending: true });

  const lista = document.getElementById('lista-productos');
  
  if (!lista) {
    console.error('No se encontró el elemento lista-productos');
    return;
  }

  lista.innerHTML = '';

  if (error) {
    console.error('Error al cargar productos:', error);
    mostrarMensaje('❌ Error al cargar productos: ' + error.message, 'error');
    return;
  }

  console.log('Productos cargados:', data);

  if (!data || data.length === 0) {
    lista.innerHTML = '<tr><td colspan="7">No hay productos registrados</td></tr>';
    return;
  }

  data.forEach((prod) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nombre_producto}</td>
      <td>${prod.empresa || 'N/A'}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.fecha_entrega} ${prod.hora_entrega}</td>
      <td>${prod.fecha_salida} ${prod.hora_salida}</td>
      <td>
        <button onclick="eliminarProducto('${prod.id}')" class="btn-eliminar">❌</button>
      </td>
    `;
    lista.appendChild(fila);
  });
}

// 🗑️ Eliminar producto
window.eliminarProducto = async function (id) {
  const confirmar = confirm('¿Estás seguro de eliminar este producto?');
  if (!confirmar) return;

  console.log('Eliminando producto con ID:', id);

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)
    .eq('creado_por', userId); // Seguridad adicional

  if (error) {
    console.error('Error al eliminar:', error);
    mostrarMensaje('❌ Error al eliminar: ' + error.message, 'error');
  } else {
    mostrarMensaje('✅ Producto eliminado correctamente.', 'success');
    await cargarProductos();
  }
};

// 💬 Mostrar mensajes al usuario
function mostrarMensaje(texto, tipo = '') {
  const mensaje = document.getElementById('mensaje');
  if (!mensaje) {
    console.log('Mensaje:', texto);
    return;
  }
  
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  
  // Limpiar mensaje después de 5 segundos si es éxito
  if (tipo === 'success') {
    setTimeout(() => {
      mensaje.textContent = '';
      mensaje.className = 'mensaje';
    }, 5000);
  }
}
