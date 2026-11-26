// Instancia única que guarda en memoria las tareas que llegan del backend
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
const boardError = document.getElementById('boardError');
const boardErrorText = document.getElementById('boardErrorText');
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

// ---------- Mensajes al usuario (notificaciones toast) ----------

const toastStack = document.getElementById('toastStack');

// type: 'success' o 'error'
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  toastStack.append(toast);

  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 300);
  }, type === 'error' ? 6000 : 3000);
}

// Campos del backend -> campo del formulario y su mensaje de error
const SERVER_FIELDS = {
  name: [nameInput, 'taskNameError'],
  description: [descriptionInput, 'taskDescriptionError'],
  assignedTo: [assigneeInput, 'taskAssigneeError'],
  dueDate: [dueDateInput, 'taskDueDateError'],
  status: [statusInput, 'taskStatusError']
};

// Muestra los errores de validación que devolvió el servidor (400) debajo de cada campo
function showServerFieldErrors(fieldErrors) {
  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (SERVER_FIELDS[field]) {
      const [input, errorId] = SERVER_FIELDS[field];
      showFieldError(input, errorId, message);
    }
  });
}

// ---------- Tarea 3: agregar (o actualizar) tareas desde el formulario ----------

const submitButton = document.getElementById('submitButton');
const cancelEditButton = document.getElementById('cancelEdit');
const formTitle = document.getElementById('formTitle');

// id de la tarea que se está editando (null = se está creando una nueva)
let editingTaskId = null;

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateTaskForm()) {
    return; // Si la validación falla, no se envía nada al servidor
  }

  const taskData = {
    nombre: nameInput.value.trim(),
    descripcion: descriptionInput.value.trim(),
    asignadoA: assigneeInput.value.trim(),
    fechaDeEntrega: dueDateInput.value,
    estado: statusInput.value
  };

  const isEditing = editingTaskId !== null;
  submitButton.disabled = true;

  try {
    // La interfaz se actualiza solo cuando el backend responde con éxito
    if (isEditing) {
      const updated = await taskApi.update(editingTaskId, taskData);
      taskManager.replaceTask(updated);
    } else {
      const created = await taskApi.create(taskData);
      taskManager.addTask(created);
    }

    resetForm(); // el botón vuelve a "Guardar" y los campos quedan vacíos
    refreshBoard();
    showToast(isEditing ? 'Tarea actualizada.' : 'Tarea guardada.');
  } catch (error) {
    if (error.status === 400) {
      showServerFieldErrors(error.fieldErrors);
      formErrors.textContent = error.message;
      formErrors.hidden = false;
    } else if (error.status === 404) {
      // La tarea ya no existe en la base de datos
      showToast(error.message, 'error');
      resetForm();
      await loadTasks();
    } else {
      showToast(error.message, 'error');
    }
  } finally {
    submitButton.disabled = false;
  }
});

// Carga los datos de una tarea en el formulario y cambia el botón a "Actualizar"
function startEditing(taskId) {
  const task = taskManager.getTaskById(taskId);
  editingTaskId = task.id;

  nameInput.value = task.nombre;
  descriptionInput.value = task.descripcion;
  assigneeInput.value = task.asignadoA;
  dueDateInput.value = task.fechaDeEntrega;
  statusInput.value = task.estado;

  submitButton.textContent = 'Actualizar';
  formTitle.textContent = `Editar tarea #${task.id}`;
  cancelEditButton.hidden = false;
  clearErrors();
  refreshBoard();
  formTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
  nameInput.focus({ preventScroll: true });
}

// Deja el formulario vacío y en modo "Guardar"
function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  submitButton.textContent = 'Guardar';
  formTitle.textContent = 'Nueva tarea';
  cancelEditButton.hidden = true;
  clearErrors();
}

function clearErrors() {
  [
    [nameInput, 'taskNameError'],
    [descriptionInput, 'taskDescriptionError'],
    [assigneeInput, 'taskAssigneeError'],
    [dueDateInput, 'taskDueDateError'],
    [statusInput, 'taskStatusError']
  ].forEach(([field, errorId]) => showFieldError(field, errorId, ''));
  formErrors.hidden = true;
}

cancelEditButton.addEventListener('click', () => {
  resetForm();
  refreshBoard();
});

// ---------- Cambiar el estado y eliminar (conectados con PUT y DELETE) ----------

// Envía la tarea con un estado nuevo al backend (PUT) y actualiza la tarjeta
async function changeStatus(taskId, newStatus) {
  const task = taskManager.getTaskById(taskId);
  try {
    const updated = await taskApi.update(taskId, { ...task, estado: newStatus });
    taskManager.replaceTask(updated);
    showToast(newStatus === 'HECHO' ? 'Tarea marcada como hecha.' : 'Estado actualizado.');
  } catch (error) {
    showToast(error.message, 'error');
    if (error.status === 404) {
      await loadTasks(); // la tarea ya no existe: se vuelve a cargar la lista
      return;
    }
  }
  refreshBoard(); // si falló, la tarjeta vuelve a mostrar el estado anterior
}

// Elimina la tarea en el backend (DELETE) y la quita de la página
async function removeTask(taskId) {
  try {
    await taskApi.remove(taskId);
    taskManager.deleteTask(taskId);
    if (editingTaskId === taskId) {
      resetForm(); // si se estaba editando, se limpia el formulario
    }
    refreshBoard();
    showToast('Tarea eliminada.');
  } catch (error) {
    showToast(error.message, 'error');
    if (error.status === 404) {
      await loadTasks();
    }
  }
}

// ---------- Tarea 7: actualizar tareas (delegación de eventos) ----------

// Un único listener en la lista de tareas, en lugar de uno por botón
const taskList = document.querySelector('#tasksContainer');

taskList.addEventListener('click', (event) => {
  const target = event.target;

  // Marcar la tarea como completada
  if (target.classList.contains('done-button')) {
    // Recorrido del DOM: botón -> article (card) -> div (columna con data-id)
    const taskElement = target.parentElement.parentElement;
    const taskId = Number(taskElement.dataset.id); // el data-id es String

    target.disabled = true;
    changeStatus(taskId, 'HECHO');
    return;
  }

  // Tarea 4: eliminar la tarea
  const deleteButton = target.closest('.btn-delete');
  if (deleteButton) {
    const taskElement = deleteButton.closest('.task-col');
    const taskId = Number(taskElement.dataset.id);

    deleteButton.disabled = true;
    removeTask(taskId);
    return;
  }

  // Clic en cualquier otra parte de la tarjeta: cargarla en el formulario
  const isControl = target.closest('button, select, label');
  const taskElement = target.closest('.task-col');
  if (!isControl && taskElement) {
    startEditing(Number(taskElement.dataset.id));
  }
});

// Cambiar el estado desde el selector de la tarjeta
taskList.addEventListener('change', (event) => {
  const target = event.target;
  if (target.classList.contains('card-select')) {
    const taskElement = target.closest('.task-col');
    const taskId = Number(taskElement.dataset.id);

    target.disabled = true;
    changeStatus(taskId, target.value);
  }
});

// Vuelve a dibujar las tarjetas y los contadores
function refreshBoard() {
  taskManager.render(tasksContainer, currentFilter);

  // Resalta la tarjeta que se está editando
  if (editingTaskId !== null) {
    const editingCard = tasksContainer.querySelector(`[data-id="${editingTaskId}"]`);
    if (editingCard) editingCard.classList.add('is-editing');
  }

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
  emptyState.hidden = visible > 0 || !boardError.hidden;
}

// ---------- Cargar las tareas desde el backend ----------

// Pide las tareas al backend (GET) y las dibuja.
// Si el servidor está apagado, muestra un aviso con un botón para reintentar.
async function loadTasks() {
  try {
    const tasks = await taskApi.getAll();
    taskManager.setTasks(tasks);
    boardError.hidden = true;
  } catch (error) {
    taskManager.setTasks([]);
    boardErrorText.textContent = error.message;
    boardError.hidden = false;
  }
  refreshBoard();
}

document.getElementById('retryButton').addEventListener('click', loadTasks);

document.addEventListener('DOMContentLoaded', loadTasks);
