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
| HU008 | Alerta de vencimientos | Facturas próximas a vencer o vencidas | ✅ Completada |
| HU009 | Reportes gráficos | Gráficos de estado y evolución | ✅ Completada |

**Avance actual: 9 de 9 historias implementadas (100%)**

---

### ⏳ Historias Pendientes

Todas las historias han sido implementadas. ✅

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
- **Monto cobrado**: Total de facturas pagadas
- Los indicadores se actualizan dinámicamente al cambiar datos en otras secciones
- Formatos de moneda en soles peruanos (PEN)

#### Alertas de Vencimientos (HU008)
- **Facturas vencidas**: Muestra facturas pendientes con fecha de vencimiento pasada
  - Indicador: "Crítico" en rojo
  - Muestra días de retraso
  - Botón "Gestionar Cobro"
- **Facturas próximas a vencer**: Muestra facturas pendientes que vencen en los próximos 3 días
  - Indicador: "Próximo" en naranja
  - Muestra días para vencer (hoy, mañana, etc.)
  - Botón "Enviar Recordatorio"
- Mensaje "Sin alertas" cuando todas las facturas están al día
- Actualización dinámica en tiempo real

#### Reportes Gráficos (HU009)
- **Gráfico de Barras - Estado de Facturas**:
  - Muestra cantidad de facturas por estado: Pagadas, Pendientes, Vencidas, Anuladas
  - Barras proporcionales a la cantidad de facturas
  - Etiquetas con cantidad exacta
  - Actualización dinámica
- **Gráfico de Líneas - Recaudación Mensual**:
  - Muestra recaudación (facturas pagadas/canceladas) de los últimos 4 meses
  - Puntos marcados en la línea para cada mes
  - Escalado automático según valores
  - Etiquetas de meses dinámicas
- Ambos gráficos se actualizan automáticamente al cambiar datos

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
