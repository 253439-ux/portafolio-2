// --- Terminal del hero ---
(function () {
  const el = document.getElementById("hero-terminal-output");
  const cursor = document.getElementById("hero-cursor");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 
  const guion = [
    "whoami\n",
    "> Rey Emiliano Romero Suárez\n> Desarrollador Full Stack\n\n",
    "visitor@portfolio:~$ cat mission.txt\n",
    "> Construir sistemas que resuelven problemas reales\n> y ayudan a un negocio a crecer.\n",
  ].join("");
 
  if (prefersReducedMotion) {
    el.textContent = guion;
    cursor.style.display = "none";
  } else {
    let i = 0;
    (function type() {
      if (i <= guion.length) {
        el.textContent = guion.slice(0, i);
        i++;
        setTimeout(type, 18);
      }
    })();
  }
})();
 
// --- Modal del demo interactivo (sirve para cualquier proyecto) ---
(function () {
  const modal = document.getElementById("demo-modal");
  const iframe = document.getElementById("demo-iframe");
  const modalLabel = document.getElementById("demo-modal-label");
  const openBtns = document.querySelectorAll(".js-open-demo");
  const closeBtn = document.getElementById("btn-cerrar-demo");
  const backdrop = document.getElementById("demo-backdrop");
 
  function abrir(e) {
    if (e) e.preventDefault();
    const btn = e.currentTarget;
    iframe.src = btn.dataset.src;
    modalLabel.textContent = btn.dataset.label || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function cerrar() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    iframe.src = "";
    document.body.style.overflow = "";
  }
 
  openBtns.forEach(btn => btn.addEventListener("click", abrir));
  closeBtn.addEventListener("click", cerrar);
  backdrop.addEventListener("click", cerrar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
})();
 
// --- Ver más certificados ---
(function () {
  const btn = document.getElementById("btn-ver-mas-certs");
  if (!btn) return;
  const extras = document.querySelectorAll(".cert-extra");
  if (extras.length === 0) { btn.style.display = "none"; return; }
 
  let visible = false;
  btn.addEventListener("click", () => {
    visible = !visible;
    extras.forEach(el => el.classList.toggle("hidden", !visible));
    btn.textContent = visible ? "Ver menos" : "Ver más certificados";
    if (visible) btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
 
// --- Botones de CV: avisa si aún no subiste el archivo ---
(function () {
  ["btn-cv", "btn-cv-2"].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "cv.pdf";
    });
  });
})();
 
// --- Formulario de contacto: arma un link de WhatsApp con el mensaje ---
(function () {
  const form = document.getElementById("form-contacto");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("f-nombre").value.trim();
    const correo = document.getElementById("f-empresa").value.trim();
    const mensaje = document.getElementById("f-mensaje").value.trim();
 
    let texto = `Hola Rey, soy ${nombre}.`;
    if (correo) texto += ` Mi correo es ${correo}.`;
    texto += ` ${mensaje}`;
 
    const url = `https://wa.me/529671613668?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  });
})();
