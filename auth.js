// auth.js
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const mensajeLogin = document.getElementById('login-error-message');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const btnLogin = document.getElementById('login-button');

  let intentos = parseInt(localStorage.getItem('intentosFallidos')) || 0;
  let bloqueoHasta = parseInt(localStorage.getItem('bloqueoHasta')) || 0;

  function mostrarMensaje(texto, color = 'red') {
    if (mensajeLogin) {
      mensajeLogin.textContent = texto;
      mensajeLogin.style.color = color;
      mensajeLogin.style.fontWeight = 'bold';
    }

    const toast = document.getElementById('login-toast');
    if (toast) {
      toast.className = `toast show`;
      toast.textContent = texto;
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }
  }

  function iniciarBloqueoVisual() {
    const ahora = Date.now();
    const tiempoRestante = Math.ceil((bloqueoHasta - ahora) / 1000);
    btnLogin.disabled = true;
    usernameInput.disabled = true;
    passwordInput.disabled = true;

    mostrarMensaje(`⛔ Bloqueado. Espera ${tiempoRestante}s para intentar de nuevo.`);

    alert(`⛔ Has sido bloqueado por 60 segundos.`);

    const interval = setInterval(() => {
      const tiempo = Math.ceil((bloqueoHasta - Date.now()) / 1000);
      if (tiempo <= 0) {
        clearInterval(interval);
        localStorage.removeItem('bloqueoHasta');
        localStorage.setItem('intentosFallidos', '0');
        btnLogin.disabled = false;
        usernameInput.disabled = false;
        passwordInput.disabled = false;
        mostrarMensaje('');
      } else {
        mostrarMensaje(`⛔ Bloqueado. Espera ${tiempo}s para intentar de nuevo.`);
      }
    }, 1000);
  }

  if (Date.now() < bloqueoHasta) {
    iniciarBloqueoVisual();
    return;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        mostrarMensaje('❌ Debes ingresar usuario y contraseña.');
        alert('❌ Debes ingresar usuario y contraseña.');
        return;
      }

      const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error || !user) {
        intentos++;
        localStorage.setItem('intentosFallidos', intentos);

        if (intentos >= 3) {
          const bloqueo = Date.now() + 60000; // 60 segundos
          localStorage.setItem('bloqueoHasta', bloqueo);
          bloqueoHasta = bloqueo;
          iniciarBloqueoVisual();
        } else {
          mostrarMensaje(`❌ Usuario o contraseña incorrectos. Intento ${intentos}/3.`);
          alert(`❌ Usuario o contraseña incorrectos. Intento ${intentos}/3.`);
        }
        return;
      }

      // ✅ Inicio exitoso
      localStorage.setItem('intentosFallidos', '0');
      sessionStorage.setItem('usuarioActual', JSON.stringify(user));

      alert('✅ Inicio de sesión exitoso.');

      if (user.rol === 'almacenero') {
        window.location.href = 'dashboard-almacenero.html';
      } else if (user.rol === 'jefe') {
        window.location.href = 'dashboard-jefe.html';
      } else {
        mostrarMensaje('⚠️ Rol no reconocido.');
        alert('⚠️ Rol no reconocido.');
      }
    });
  }
});
