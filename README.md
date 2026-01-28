# 📊 Sistema de Gestión de Clientes y Facturas por Cobrar

Proyecto académico de frontend desarrollado para aplicar los conceptos vistos en clase, enfocado en la gestión de clientes, facturas por cobrar y seguimiento de cobranza.

---

## 🎯 Objetivo del Proyecto

Desarrollar un aplicativo web que permita a una empresa llevar un control organizado de sus cuentas por cobrar, facilitando:

- El registro y mantenimiento de clientes
- El registro de facturas por cobrar
- La actualización del estado de las facturas
- El seguimiento de gestiones de cobranza

El proyecto se desarrolla **sin backend ni base de datos real**, utilizando únicamente tecnologías vistas en clase y almacenamiento local.

---

## 🧑‍💻 Tecnologías Utilizadas

- HTML5
- HTML Semántico (`header`, `main`, `section`, `nav`, `footer`)
- Tailwind CSS
- JavaScript (Vanilla JS)
- Manipulación del DOM
- Eventos y validaciones básicas
- `localStorage`
- Organización del código en carpetas

---

## 📁 Estructura del Proyecto

``` text
facturas-por-cobrar/
│
├── index.html ← Página principal / inicio
├── clientes.html ← Creación y gestión de clientes
├── facturas.html ← Registro y seguimiento de facturas
├── dashboard.html ← Panel de control (pendiente)
│
├── js/
│ ├── main.js ← Layout y navegación común
│ ├── clientes.js ← Lógica de clientes
│ ├── facturas.js ← Lógica de facturación y cobranzas
│ └── dashboard.js ← Indicadores (pendiente)
│
├── utils/
│ ├── storage.js ← Manejo de datos en localStorage
│ └── validation.js ← Validaciones de formularios
│
├── assets/
│ └── logo.png
│
└── README.md
```

---

## 📋 Estado de Implementación de Historias de Usuario

### ✅ Historias Implementadas

| Código | Historia | Descripción | Estado |
|:--|:--|:--|:--|
| HU001 | Registro de cliente | Registrar datos de cliente y contactos | ✅ Completada |
| HU002 | Visualización de clientes | Ver lista de clientes registrados | ✅ Completada |
| HU003 | Mantenimiento de cliente | Editar o eliminar clientes | ✅ Completada |
| HU004 | Registro de factura por cobrar | Registrar nueva factura | ✅ Completada |
| HU005 | Gestión de estado de factura | Actualizar estado (Pagada / Cancelada) | ✅ Completada |
| HU006 | Seguimiento de cobranza | Registrar contactos de cobranza por factura | ✅ Completada |
| HU007 | Visualización de indicadores | Dashboard con métricas generales | ✅ Completada |

**Avance actual: 7 de 9 historias implementadas (≈ 78%)**

---

### ⏳ Historias Pendientes

| Código | Historia | Descripción | Estado |
|:--|:--|:--|:--|
| HU008 | Alerta de vencimientos | Facturas próximas a vencer o vencidas | ⏳ Pendiente |
| HU009 | Reportes gráficos | Gráficos de estado y evolución | ⏳ Pendiente |

---

## 🏠 index.html – Página Principal

### Rol
- Punto de entrada del sistema.
- Contiene el **header**, **sidebar** y navegación hacia las demás secciones.

### Funcionalidades
- Navegación hacia:
  - Clientes
  - Facturas
  - Dashboard

---

## 👥 clientes.html – Creación y Gestión de Clientes

### Funcionalidades

#### Registro de Cliente
- Registro de:
  - RUC/DNI (único)
  - Razón social / nombre
  - Dirección fiscal
  - Contactos (nombre, celular, email)
- Validación de campos obligatorios.
- Persistencia en `localStorage`.

#### Gestión de Clientes
- Listado de clientes registrados.
- Acciones:
  - Editar cliente
  - Eliminar cliente (con confirmación)
- Búsqueda por RUC/DNI o Razón Social.
- Paginación simple.

### Historias Cubiertas
- HU001
- HU002
- HU003

---

## 📄 facturas.html – Registro y Seguimiento de Facturas

### Funcionalidades

#### Registro de Factura
- Selección de cliente registrado.
- Autocompletado de RUC.
- Registro de:
  - Número de factura
  - Monto
  - Fecha de emisión
  - Fecha de vencimiento
  - Estado inicial: **Pendiente**

#### Gestión de Facturas
- Listado de facturas con:
  - Cliente
  - RUC
  - Número de factura
  - Monto
  - Fechas
  - Estado
- Acciones:
  - Marcar como **Pagada**
  - Marcar como **Cancelada**
  - Eliminar factura

#### Seguimiento de Cobranza
- Registro de contactos de cobranza:
  - Fecha
  - Medio (Llamada, Email, WhatsApp)
  - Comentario
- Visualización del historial por factura.

### Historias Cubiertas
- HU004
- HU005
- HU006

---

## 📊 dashboard.html – Panel de Control

### Funcionalidades Implementadas

#### Indicadores Generales (HU007)
- **Total de clientes**: Cantidad de clientes registrados en el sistema
- **Total de facturas**: Cantidad total de facturas registradas
- **Monto pendiente**: Total de facturas sin cobrar
- **Monto cobrado**: Total de facturas pagadas o canceladas
- Los indicadores se actualizan dinámicamente al cambiar datos en otras secciones
- Formatos de moneda en soles peruanos (PEN)

### Funcionalidades Pendientes
- Gráficos de estado y evolución
- Alertas de facturas próximas a vencer
- Filtros por rango de fechas

### Historias Asociadas
- HU007 ✅ Completada
- HU008 ⏳ Pendiente
- HU009 ⏳ Pendiente

---

## ⚙️ Arquitectura y Buenas Prácticas

- Separación de lógica y renderizado.
- Uso de `DOMContentLoaded`.
- Uso de `localStorage` con `JSON.parse` y `JSON.stringify`.
- Delegación de eventos.
- Código organizado y legible.
- Enfoque académico y sin uso de frameworks.

---

## ▶️ Cómo Ejecutar el Proyecto

1. Abrir la carpeta del proyecto en **Visual Studio Code**.
2. Instalar la extensión **Live Server**.
3. Ejecutar `index.html` con **Open with Live Server**.
4. Navegar por el sistema usando el menú lateral.

> ⚠️ Importante:  
> Todas las páginas deben ejecutarse desde el mismo Live Server para que `localStorage` funcione correctamente.

---

## 👥 Equipo de Trabajo

- Nombre del integrante 1  
- Nombre del integrante 2  
- Nombre del integrante 3  

---

## 📝 Conclusión

El proyecto **Sistema de Gestión de Clientes y Facturas por Cobrar** permite aplicar de manera práctica los conceptos fundamentales de frontend, demostrando el uso correcto de JavaScript, manejo del DOM, almacenamiento local y organización del código.

El sistema implementa las funcionalidades principales del negocio y deja definidas las bases para futuras mejoras, como el dashboard de indicadores y reportes gráficos.

---
