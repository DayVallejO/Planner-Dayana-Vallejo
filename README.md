# Planificador de Tareas

Aplicación web para organizar tareas: crearlas, asignarlas, cambiar su estado, editarlas y eliminarlas. Las tareas se guardan en una base de datos MySQL a través de una API REST en Spring Boot, así que no se pierden al recargar la página ni al cambiar de navegador.

El backend está en [Planner-Backend-Dayana-Vallejo](https://github.com/DayVallejO/Planner-Backend-Dayana-Vallejo).

Proyecto del Desafío de Aplicación de Habilidades (SAC) de Generation.

## Funcionalidades

- Crear tareas con nombre, descripción, persona asignada, fecha de entrega y estado.
- Validar el formulario antes de enviarlo. El servidor también valida y sus errores se muestran debajo de cada campo.
- Editar una tarea: al hacer clic en una tarjeta, sus datos se cargan en el formulario y el botón cambia a **Actualizar**.
- Marcar una tarea como hecha, cambiar su estado o eliminarla desde su tarjeta.
- Filtrar por estado: Pendiente, En progreso, Revisión y Hecho.
- Ver el total de tareas, las que están en curso y el porcentaje completado.
- Mostrar notificaciones de éxito o error, y un aviso con botón **Reintentar** si el servidor está apagado.

## Tecnologías

- HTML, CSS y JavaScript (`fetch` con `async/await`)
- Bootstrap 5
- Mocha y Chai para las pruebas unitarias
- Backend: Spring Boot + MySQL

## Cómo usarlo

1. Inicia el backend siguiendo las instrucciones de su [README](https://github.com/DayVallejO/Planner-Backend-Dayana-Vallejo#cómo-ejecutarlo). La API debe quedar en `http://localhost:8080`.
2. Clona este repositorio:
   ```bash
   git clone https://github.com/DayVallejO/Planner-Dayana-Vallejo.git
   ```
3. Abre `index.html` con **Live Server** (VS Code) o cualquier servidor local.

## Pruebas

Abre `test/test.html` en el navegador para ejecutar las pruebas. Cubren:

- Los métodos de `TaskManager`: agregar, eliminar, actualizar, asignar y reemplazar tareas.
- La conversión de datos entre el frontend y la API (`api.js`).
- La interfaz: que una tarea aparezca en la lista al agregarla y desaparezca al eliminarla.

## Estructura

```
├── index.html             Página principal
├── css/styles.css         Estilos
├── js/taskManager.js      Clases Task y TaskManager
├── js/api.js              Llamadas fetch a la API del backend
├── js/app.js              Eventos del formulario y de la lista
└── test/                  Pruebas unitarias
```

## Autora

Dayana Vallejo
