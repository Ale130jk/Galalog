// register.js
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  const regMessage = document.getElementById('register-message');

  document.getElementById('register-button').addEventListener('click', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido = document.getElementById('reg-apellido').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim(); // Solo informativo
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const rol = document.getElementById('reg-rol').value;

    if (!nombre || !apellido || !username || !email || !password || !confirmPassword || !rol) {
      mostrarMensaje('❌ Todos los campos son obligatorios.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      mostrarMensaje('❌ Las contraseñas no coinciden.', 'error');
      return;
    }

    const { data: existentes, error: errorExist } = await supabase
      .from('usuarios')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`);

    if (existentes && existentes.length > 0) {
      mostrarMensaje('⚠️ El usuario o correo ya está registrado.', 'error');
      return;
    }

    const { error } = await supabase.from('usuarios').insert([
      { nombre, apellido, username, email, password, rol }
    ]);

    if (error) {
      mostrarMensaje(`❌ Error al registrar: ${error.message}`, 'error');
      return;
    }

    mostrarMensaje('✅ Registro exitoso. Redirigiendo...', 'success');
    regForm.reset();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  });

  function mostrarMensaje(texto, tipo) {
    if (!regMessage) return;
    regMessage.textContent = texto;
    regMessage.className = 'mensaje ' + tipo;
  }
});
