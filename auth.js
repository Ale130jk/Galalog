document.addEventListener('DOMContentLoaded', function () {
  const regForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (regForm) {
    document.getElementById('register-button').addEventListener('click', function () {
      const nombre = document.getElementById('reg-nombre').value.trim();
      const apellido = document.getElementById('reg-apellido').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const rol = document.getElementById('reg-rol').value;
      const regMessage = document.getElementById('register-message');

      // Validaciones
      if (!nombre || !apellido || !username || !email || !password || !confirmPassword || !rol) {
        regMessage.textContent = '❌ Todos los campos son obligatorios.';
        regMessage.style.color = 'red';
        return;
      }

      if (password !== confirmPassword) {
        regMessage.textContent = '❌ Las contraseñas no coinciden.';
        regMessage.style.color = 'red';
        return;
      }

      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

      if (usuarios.some(u => u.username === username)) {
        regMessage.textContent = '⚠️ El usuario ya existe.';
        regMessage.style.color = 'orange';
        return;
      }

      usuarios.push({ username, password, rol });
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      regMessage.textContent = '✅ Usuario registrado con éxito. Redirigiendo...';
      regMessage.style.color = 'green';
      regForm.reset();

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const errorMessage = document.getElementById('login-error-message');

      const usuariosFijos = [
        { username: 'almacenero1', password: '1234', rol: 'almacenero' },
        { username: 'jefe1', password: 'admin', rol: 'jefe' }
      ];

      const usuariosLocales = JSON.parse(localStorage.getItem('usuarios')) || [];
      const usuarios = usuariosFijos.concat(usuariosLocales);

      const usuario = usuarios.find(u => u.username === username && u.password === password);

      if (usuario) {
        sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
        const destino = usuario.rol === 'almacenero' ? 'dashboard-almacenero.html' : 'dashboard-jefe.html';
        window.location.href = destino;
      } else {
        errorMessage.textContent = '❌ Usuario o contraseña incorrectos.';
        errorMessage.style.color = 'red';
      }
    });
  }
});


document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const errorMessage = document.getElementById('login-error-message');

  const usuariosFijos = [
    { username: 'almacenero1', password: '1234', rol: 'almacenero' },
    { username: 'jefe1', password: 'admin', rol: 'jefe' }
  ];

  const usuariosLocales = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuarios = usuariosFijos.concat(usuariosLocales);

  const usuario = usuarios.find(u => u.username === username && u.password === password);

  if (usuario) {
    sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
    if (usuario.rol === 'almacenero') {
      window.location.href = 'dashboard-almacenero.html';
    } else if (usuario.rol === 'jefe') {
      window.location.href = 'dashboard-jefe.html';
    }
  } else {
    errorMessage.textContent = '❌ Usuario o contraseña incorrectos.';
    errorMessage.style.color = 'red';
  }
});
