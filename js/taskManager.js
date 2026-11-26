// Estados válidos de una tarea y su texto para mostrar
const TASK_STATUSES = {
  'PENDIENTE': { label: 'Pendiente', className: 'status-todo' },
  'EN PROGRESO': { label: 'En progreso', className: 'status-progress' },
  'REVISIÓN': { label: 'Revisión', className: 'status-review' },
  'HECHO': { label: 'Hecho', className: 'status-done' }
};

/**
 * Representa una tarea. Es un objeto plano, así que se puede
 * convertir a JSON con JSON.stringify().
 */
class Task {
  constructor(id, nombre, descripcion, asignadoA, fechaDeEntrega, estado) {
    this.id = id;                         // Entero único
    this.nombre = nombre;                 // Cadena de texto
    this.descripcion = descripcion;       // Cadena de texto
    this.asignadoA = asignadoA;           // Cadena de texto
    this.fechaDeEntrega = fechaDeEntrega; // Fecha en formato AAAA-MM-DD
    this.estado = estado;                 // PENDIENTE | EN PROGRESO | REVISIÓN | HECHO
  }
}

/**
 * Gestiona la lista de tareas en memoria.
 * Las tareas se guardan en el backend (MySQL); aquí solo se guarda
 * una copia para dibujarlas en la página.
 */
class TaskManager {
  constructor() {
    this.tasks = [];     // Array interno con todas las tareas
    this.currentId = 0;  // Contador para generar IDs cuando la tarea no trae uno
  }

  // Reemplaza toda la lista (se usa con las tareas que llegan del backend)
  setTasks(tasks) {
    this.tasks = tasks;
  }

  // Cambia una tarea de la lista por la versión que devolvió el backend
  replaceTask(updatedTask) {
    const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
    }
    return updatedTask;
  }

  // Devuelve la lista de todas las tareas
  getAllTasks() {
    return this.tasks;
  }

  // Devuelve las tareas que tengan el estado indicado
  getTasksWithStatus(status) {
    return this.tasks.filter((task) => task.estado === status);
  }

  // Agrega una tarea a la lista. Si no trae id (por ejemplo, en las pruebas), le asigna uno nuevo.
  addTask(task) {
    let id = task.id;
    if (id === undefined || id === null) {
      this.currentId++;
      id = this.currentId;
    }
    const newTask = new Task(
      id,
      task.nombre,
      task.descripcion,
      task.asignadoA,
      task.fechaDeEntrega,
      task.estado
    );
    this.tasks.push(newTask);
    return newTask;
  }

  // Elimina una tarea de la lista por su ID
  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  // Actualiza el estado de una tarea
  updateTask(taskId, status) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.estado = status;
    }
    return task;
  }

  // Actualiza todos los datos de una tarea (se usa al editar desde el formulario)
  editTask(taskId, data) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.nombre = data.nombre;
      task.descripcion = data.descripcion;
      task.asignadoA = data.asignadoA;
      task.fechaDeEntrega = data.fechaDeEntrega;
      task.estado = data.estado;
    }
    return task;
  }

  // Actualiza la persona asignada a una tarea
  assignTask(taskId, assignee) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.asignadoA = assignee;
    }
    return task;
  }

  // Tarea 7 - Paso 4: busca una tarea por su id y la devuelve
  getTaskById(taskId) {
    let foundTask;
    for (const task of this.tasks) {
      const currentTask = task;
      if (currentTask.id === taskId) {
        foundTask = currentTask;
      }
    }
    return foundTask;
  }

  /**
   * Vuelve a dibujar todas las tarjetas a partir de this.tasks.
   * 1. Limpia el contenedor  2. Recorre this.tasks
   * 3. Crea la tarjeta de cada tarea  4. La agrega al contenedor
   * Si se indica un filtro, oculta las tarjetas que no tengan ese estado.
   */
  render(container, filter = 'TODAS') {
    container.innerHTML = '';
    for (const task of this.tasks) {
      const card = this.createTaskCard(task);
      card.hidden = filter !== 'TODAS' && task.estado !== filter;
      container.append(card);
    }
  }

  /**
   * Crea la tarjeta HTML de una tarea (card de Bootstrap dentro de una columna)
   * y devuelve la columna.
   * Se usa textContent para que el texto del usuario no se interprete como HTML.
   */
  createTaskCard(task) {
    const status = TASK_STATUSES[task.estado];

    const column = document.createElement('div');
    column.className = 'col task-col';
    column.dataset.id = task.id;

    const card = document.createElement('article');
    card.className = `card task-card ${status.className}`;

    // Encabezado: estado + ID
    const top = document.createElement('div');
    top.className = 'card-top';
    const badge = document.createElement('span');
    badge.className = 'badge';
    const dot = document.createElement('span');
    dot.className = 'badge-dot';
    badge.append(dot, status.label);
    const idLabel = document.createElement('span');
    idLabel.className = 'card-id';
    idLabel.textContent = `#${task.id}`;
    top.append(badge, idLabel);

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = task.nombre;

    const description = document.createElement('p');
    description.className = 'card-text card-description';
    description.textContent = task.descripcion;

    // Persona asignada y fecha de entrega
    const meta = document.createElement('div');
    meta.className = 'card-meta';

    const person = document.createElement('div');
    person.className = 'card-person';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.textContent = getInitials(task.asignadoA);
    const personName = document.createElement('span');
    personName.className = 'person-name';
    personName.textContent = task.asignadoA;
    person.append(avatar, personName);

    const date = document.createElement('div');
    date.className = 'card-date';
    date.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>';
    const dateText = document.createElement('span');
    dateText.textContent = formatDate(task.fechaDeEntrega);
    const due = getDueInfo(task);
    const duePill = document.createElement('span');
    duePill.className = `due due-${due.type}`;
    duePill.textContent = due.text;
    date.append(dateText, duePill);

    meta.append(person, date);

    // Tarea 7 - Paso 1: botón para marcar la tarea como completada
    const doneButton = document.createElement('button');
    doneButton.type = 'button';
    doneButton.className = 'btn btn-success done-button';
    if (task.estado === 'HECHO') {
      doneButton.disabled = true;
      doneButton.textContent = '✓ Completada';
    } else {
      doneButton.textContent = '✓ Marcar como hecha';
    }

    // Acciones: cambiar estado y eliminar
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const selectLabel = document.createElement('label');
    selectLabel.className = 'card-select-wrap';
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = `Cambiar estado de la tarea ${task.id}`;
    const select = document.createElement('select');
    select.className = 'form-select card-select';
    Object.keys(TASK_STATUSES).forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = TASK_STATUSES[key].label;
      option.selected = key === task.estado;
      select.append(option);
    });
    selectLabel.append(srText, select);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn-delete';
    deleteButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg> Eliminar';

    actions.append(selectLabel, deleteButton);

    card.append(top, title, description, meta, doneButton, actions);
    column.append(card);
    return column;
  }
}

// ---------- Utilidades para la tarjeta ----------

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  const first = words[0] ? words[0][0] : '';
  const second = words[1] ? words[1][0] : '';
  return (first + second).toUpperCase();
}

function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00`);
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

// Calcula la etiqueta de vencimiento: "Hoy", "Mañana", "En 3 días", "Vencida"...
function getDueInfo(task) {
  if (task.estado === 'HECHO') {
    return { text: 'Lista', type: 'done' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${task.fechaDeEntrega}T00:00`);
  const days = Math.round((dueDate - today) / 86400000);

  if (days < 0) return { text: 'Vencida', type: 'late' };
  if (days === 0) return { text: 'Hoy', type: 'today' };
  if (days === 1) return { text: 'Mañana', type: 'soon' };
  return { text: `En ${days} días`, type: 'soon' };
}
