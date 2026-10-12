// login-demo.js — versión de portafolio: no llama a ningún servidor real.
const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');
const toggleBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

toggleBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  toggleBtn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorBox.classList.remove('is-visible');

  const username = document.getElementById('username').value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    errorBox.textContent = 'Completa usuario y contraseña.';
    errorBox.classList.add('is-visible');
    return;
  }

  const submitBtn = form.querySelector('.btn-submit');
  submitBtn.textContent = 'Ingresando...';
  submitBtn.disabled = true;

  // En la demo, cualquier credencial es válida: simulamos la latencia
  // de un login real y guardamos una sesión falsa en memoria del navegador.
  localStorage.setItem('user_role', 'admin');
  localStorage.setItem('user_name', username);

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 500);
});
