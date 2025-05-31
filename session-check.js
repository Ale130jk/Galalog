document.addEventListener('DOMContentLoaded', () => {
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));


  const rol = usuarioActual.rol;
  const url = window.location.pathname;

  if (url.includes("jefe") && rol !== "jefe") {
    window.location.href = "index.html";
  } else if (url.includes("almacenero") && rol !== "almacenero") {
    window.location.href = "index.html";
  }

  // Mostrar nombre de usuario si tienes elementos con clase nombre-usuario
  document.querySelectorAll('.nombre-usuario').forEach(el => {
    el.textContent = usuarioActual.username;
  });

  // Manejar logout
  document.querySelectorAll('.logout').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      sessionStorage.removeItem('usuarioActual');
      window.location.href = "index.html";
    });
  });
});
