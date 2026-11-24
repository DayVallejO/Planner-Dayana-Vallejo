// Instancia única que guarda las tareas en memoria
const taskManager = new TaskManager();

// ---------- Referencias al DOM ----------
const taskForm = document.getElementById('taskForm');
const nameInput = document.getElementById('taskName');
const descriptionInput = document.getElementById('taskDescription');
const assigneeInput = document.getElementById('taskAssignee');
const dueDateInput = document.getElementById('taskDueDate');
const statusInput = document.getElementById('taskStatus');
const formErrors = document.getElementById('formErrors');

const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const STATUS_ORDER = ['PENDIENTE', 'EN PROGRESO', 'REVISIÓN', 'HECHO'];

let currentFilter = 'TODAS';

// ---------- Tarea 1: validación ----------

function showFieldError(field, errorId, message) {
  document.getElementById(errorId).textContent = message;
  field.classList.toggle('is-invalid', message !== '');
}

/**
 * Valida el formulario. Devuelve true si todos los campos son válidos,
 * false si alguno es inválido (y muestra el mensaje de error de cada uno).
 */
function validateTaskForm() {
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const assignee = assigneeInput.value.trim();
  const dueDate = dueDateInput.value.trim();
  const status = statusInput.value;

  const errors = {
    name: '',
    description: '',
    assignee: '',
    dueDate: '',
    status: ''
  };

  if (name === '') {
    errors.name = 'El nombre no puede estar vacío.';
  } else if (name.length <= 8) {
    errors.name = `El nombre debe tener más de 8 caracteres (tiene ${name.length}).`;
  }

  if (description === '') {
    errors.description = 'La descripción no puede estar vacía.';
  } else if (description.length <= 15) {
    errors.description = `La descripción debe tener más de 15 caracteres (tiene ${description.length}).`;
  }

  if (assignee === '') {
    errors.assignee = 'Indica a quién se asigna la tarea.';
  } else if (assignee.length <= 8) {
    errors.assignee = `El nombre del responsable debe tener más de 8 caracteres (tiene ${assignee.length}).`;
  }

  if (dueDate === '') {
    errors.dueDate = 'Elige una fecha de entrega.';
  }

  if (status === '') {
    errors.status = 'Selecciona un estado.';
  }

  showFieldError(nameInput, 'taskNameError', errors.name);
  showFieldError(descriptionInput, 'taskDescriptionError', errors.description);
  showFieldError(assigneeInput, 'taskAssigneeError', errors.assignee);
  showFieldError(dueDateInput, 'taskDueDateError', errors.dueDate);
  showFieldError(statusInput, 'taskStatusError', errors.status);

  const errorCount = Object.values(errors).filter((message) => message !== '').length;
  if (errorCount > 0) {
    formErrors.textContent = `Revisa ${errorCount} campo(s) marcados antes de agregar la tarea.`;
    formErrors.hidden = false;
    return false;
  }

  formErrors.hidden = true;
  return true;
}

// Al escribir en un campo con error, se limpia su mensaje
[
  [nameInput, 'taskNameError'],
  [descriptionInput, 'taskDescriptionError'],
  [assigneeInput, 'taskAssigneeError'],
  [dueDateInput, 'taskDueDateError'],
  [statusInput, 'taskStatusError']
].forEach(([field, errorId]) => {
  field.addEventListener('input', () => showFieldError(field, errorId, ''));
});

// ---------- Tarea 3: agregar tareas desde el formulario ----------

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!validateTaskForm()) {
    return; // Si la validación falla, no se agrega la tarea
  }

  const newTask = taskManager.addTask({
    nombre: nameInput.value.trim(),
    descripcion: descriptionInput.value.trim(),
    asignadoA: assigneeInput.value.trim(),
    fechaDeEntrega: dueDateInput.value,
    estado: statusInput.value
  });

  taskManager.render(tasksContainer, currentFilter);
  taskManager.save(); // Tarea 8: guardar después de agregar

  taskForm.reset();
  updateBoardInfo();
});

// ---------- Tarea 7: actualizar tareas (delegación de eventos) ----------

// Un único listener en la lista de tareas, en lugar de uno por botón
const taskList = document.querySelector('#tasksContainer');

taskList.addEventListener('click', (event) => {
  const target = event.target;

  // Marcar la tarea como completada
  if (target.classList.contains('done-button')) {
    // Recorrido del DOM: botón -> article (card) -> div (columna con data-id)
    const taskElement = target.parentElement.parentElement;
    console.log(taskElement);

    const taskId = Number(taskElement.dataset.id); // el data-id es String
    const task = taskManager.getTaskById(taskId);
    task.estado = 'HECHO';

    refreshBoard();
    taskManager.save(); // Tarea 8: guardar después de actualizar
  }

  // Tarea 4: eliminar la tarea
  if (target.classList.contains('btn-delete')) {
    // botón -> div.card-actions -> article (card) -> div (columna con data-id)
    const taskElement = target.parentElement.parentElement.parentElement;
    const taskId = Number(taskElement.dataset.id);

    taskManager.deleteTask(taskId);
    refreshBoard();
    taskManager.save(); // Tarea 8: guardar después de eliminar
  }
});

// Cambiar el estado desde el selector de la tarjeta
taskList.addEventListener('change', (event) => {
  const target = event.target;
  if (target.classList.contains('card-select')) {
    const taskElement = target.closest('.task-col');
    const taskId = Number(taskElement.dataset.id);

    taskManager.updateTask(taskId, target.value);
    refreshBoard();
    taskManager.save(); // Tarea 8: guardar después de actualizar
  }
});

// Vuelve a dibujar las tarjetas y los contadores
function refreshBoard() {
  taskManager.render(tasksContainer, currentFilter);
  updateBoardInfo();
}

// ---------- Filtros ----------

document.getElementById('filters').addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;

  currentFilter = chip.dataset.filter;
  document.querySelectorAll('.chip').forEach((button) => {
    const isActive = button === chip;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  refreshBoard();
});

// ---------- Contadores ----------

function updateBoardInfo() {
  const total = taskManager.getAllTasks().length;
  const done = taskManager.getTasksWithStatus('HECHO').length;
  const active = taskManager.getTasksWithStatus('EN PROGRESO').length
    + taskManager.getTasksWithStatus('REVISIÓN').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statPercent').textContent = `${percent}%`;
  document.getElementById('progressBar').style.width = `${percent}%`;

  document.querySelector('[data-count="TODAS"]').textContent = total;
  STATUS_ORDER.forEach((status) => {
    document.querySelector(`[data-count="${status}"]`).textContent = taskManager.getTasksWithStatus(status).length;
  });

  const visible = currentFilter === 'TODAS' ? total : taskManager.getTasksWithStatus(currentFilter).length;
  document.getElementById('visibleCount').textContent = visible;
  emptyState.hidden = visible > 0;
}

// ---------- Tareas de ejemplo ----------

// Devuelve la fecha de hoy + N días en formato AAAA-MM-DD (hora local)
function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const SAMPLE_TASKS = [
  {
    nombre: 'Diseñar los wireframes',
    descripcion: 'Bocetar la vista del formulario y la lista de tareas en escritorio y móvil.',
    asignadoA: 'Dayana Vallejo',
    fechaDeEntrega: daysFromToday(-1),
    estado: 'HECHO'
  },
  {
    nombre: 'Maquetar el formulario',
    descripcion: 'Construir el formulario de tareas con los componentes de Bootstrap.',
    asignadoA: 'Laura Martínez',
    fechaDeEntrega: daysFromToday(0),
    estado: 'REVISIÓN'
  },
  {
    nombre: 'Validar las entradas',
    descripcion: 'Mostrar un mensaje de error claro cuando un campo del formulario no es válido.',
    asignadoA: 'Carlos Rodríguez',
    fechaDeEntrega: daysFromToday(1),
    estado: 'EN PROGRESO'
  },
  {
    nombre: 'Crear la tarjeta de tarea',
    descripcion: 'Mostrar nombre, descripción, responsable, fecha y estado de cada tarea.',
    asignadoA: 'Andrea Gómez',
    fechaDeEntrega: daysFromToday(3),
    estado: 'EN PROGRESO'
  },
  {
    nombre: 'Guardar tareas en el navegador',
    descripcion: 'Persistir la lista de tareas con localStorage para no perderlas al recargar.',
    asignadoA: 'Santiago Pérez',
    fechaDeEntrega: daysFromToday(7),
    estado: 'PENDIENTE'
  }
];

// ---------- Tarea 8: cargar las tareas al iniciar ----------
// Orden: 1) crear el TaskManager (arriba)  2) cargar  3) renderizar

const hasSavedTasks = localStorage.getItem('tasks') !== null;
taskManager.load();

// La primera vez (sin nada guardado) se agregan las tareas de ejemplo
if (!hasSavedTasks) {
  SAMPLE_TASKS.forEach((task) => taskManager.addTask(task));
  taskManager.save();
}

refreshBoard();
