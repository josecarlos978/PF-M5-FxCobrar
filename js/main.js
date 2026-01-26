// js/main.js
// Layout y navegación común a todo el sistema (estilo claro tipo dashboard)

document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  setActiveNavLink();
});

function renderLayout() {
  const header = document.getElementById("appHeader");
  const sidebar = document.getElementById("appSidebar");

  if (header) header.innerHTML = getHeaderHTML();

  if (sidebar) {
    // ✅ Sidebar CLARO (nada oscuro)
    sidebar.className =
      "fixed left-0 top-16 h-[calc(100vh-64px)] w-64 " +
      "bg-white border-r border-slate-200 " +
      "p-4 hidden md:flex flex-col justify-between";
    sidebar.innerHTML = getSidebarHTML();
  }
}

function getHeaderHTML() {
  return `
    <div class="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-primary px-10 text-white shadow">
      <div class="flex items-center gap-3">
        <div class="size-9 rounded-xl bg-white/15 flex items-center justify-center">
          <span class="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <h1 class="text-lg font-extrabold tracking-wide">Gestión de Cuentas</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right leading-tight hidden sm:block">
          <p class="text-xs opacity-80 font-semibold">Administrador</p>
          <p class="text-sm font-bold">Juan Pérez</p>
        </div>

        <div class="size-10 rounded-full bg-white/20 flex items-center justify-center font-black">
          A
        </div>
      </div>
    </div>
  `;
}

function getSidebarHTML() {
  return `
    <div class="flex flex-col gap-4">
      <div class="px-2 pt-2">
        <p class="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          Menú
        </p>
      </div>

      <nav class="flex flex-col gap-2">
        ${navLink("index.html", "home", "Inicio")}
        ${navLink("clientes.html", "group", "Clientes")}
        ${navLink("facturas.html", "receipt_long", "Facturas")}
        ${navLink("dashboard.html", "dashboard", "Dashboard")}
      </nav>
    </div>

    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
      <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
        Soporte
      </p>
      <div class="flex items-center gap-2 text-slate-600 text-sm">
        <span class="material-symbols-outlined text-base">help</span>
        <span>Centro de ayuda</span>
      </div>
    </div>
  `;
}

function navLink(href, icon, label) {
  // ✅ clases base claras, estilo dashboard
  return `
    <a href="${href}"
      class="nav-link group flex items-center gap-3 px-3 py-3 rounded-xl
             text-slate-700 hover:bg-slate-50 hover:text-slate-900
             transition border border-transparent"
      data-href="${href}">
      <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-primary">
        ${icon}
      </span>
      <span class="text-sm font-bold">${label}</span>
    </a>
  `;
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    const href = link.dataset.href;

    // Reset a estado base
    link.classList.remove("bg-primary", "text-white", "shadow-sm");
    link.classList.remove("bg-blue-50", "border-blue-200", "text-primary");
    link.classList.add("text-slate-700");
    link.style.boxShadow = "none";

    const icon = link.querySelector(".material-symbols-outlined");
    if (icon) {
      icon.classList.remove("text-white");
      icon.classList.add("text-slate-500");
    }

    // ✅ Activo estilo dashboard (claro, no oscuro)
    if (href === currentPage) {
      link.classList.add("bg-blue-50", "border-blue-200", "text-primary");
      if (icon) {
        icon.classList.remove("text-slate-500");
        icon.classList.add("text-primary");
      }
    }
  });
}
