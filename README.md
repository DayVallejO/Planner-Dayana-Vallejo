# Planificador de Tareas

Aplicación web para organizar tareas: crearlas, asignarlas, cambiar su estado, editarlas y eliminarlas. Las tareas se guardan en el navegador, así que no se pierden al recargar o cerrar la página.

Proyecto del Desafío de Aplicación de Habilidades (SAC) de Generation.

## Funcionalidades

- Crear tareas con nombre, descripción, persona asignada, fecha de entrega y estado.
- Validar el formulario antes de guardar.
- Editar una tarea: al hacer clic en una tarjeta, sus datos se cargan en el formulario y el botón cambia a **Actualizar**.
- Marcar una tarea como hecha, cambiar su estado o eliminarla desde su tarjeta.
- Filtrar por estado: Pendiente, En progreso, Revisión y Hecho.
- Ver el total de tareas, las que están en curso y el porcentaje completado.
- Guardar las tareas en `localStorage`.

## Tecnologías

- HTML, CSS y JavaScript
- Bootstrap 5
- Mocha y Chai para las pruebas unitarias

## Cómo usarlo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/CanelleGreen22/Planner-Dayana-Vallejo.git
   ```
2. Abre `index.html` en el navegador.

## Pruebas

Abre `test/test.html` en el navegador para ejecutar las pruebas. Cubren:

- Los métodos de `TaskManager`: agregar, eliminar, actualizar y asignar.
- Guardar y cargar desde `localStorage`.
- La interfaz: que una tarea aparezca en la lista al agregarla y desaparezca al eliminarla.

## Estructura

```
├── index.html             Página principal
├── css/styles.css         Estilos
├── js/taskManager.js      Clases Task y TaskManager
├── js/app.js              Eventos del formulario y de la lista
└── test/                  Pruebas unitarias
```

## Autora

Dayana Vallejo
