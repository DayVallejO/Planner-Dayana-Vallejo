// ---------- Servicio de API: todas las llamadas fetch al backend en Spring Boot ----------

const API_URL = 'http://localhost:8080/api/tasks';

// El frontend usa los estados en español y el backend en inglés
const STATUS_TO_API = {
  'PENDIENTE': 'PENDING',
  'EN PROGRESO': 'IN_PROGRESS',
  'REVISIÓN': 'REVIEW',
  'HECHO': 'DONE'
};

const STATUS_FROM_API = {
  'PENDING': 'PENDIENTE',
  'IN_PROGRESS': 'EN PROGRESO',
  'REVIEW': 'REVISIÓN',
  'DONE': 'HECHO'
};

// Convierte una tarea del frontend al formato JSON que espera el backend
function toApiTask(task) {
  return {
    name: task.nombre,
    description: task.descripcion,
    assignedTo: task.asignadoA,
    dueDate: task.fechaDeEntrega,
    status: STATUS_TO_API[task.estado]
  };
}

// Convierte una tarea que llega del backend a un objeto Task del frontend
function fromApiTask(data) {
  return new Task(
    data.id,
    data.name,
    data.description,
    data.assignedTo,
    data.dueDate,
    STATUS_FROM_API[data.status]
  );
}

/**
 * Error de la API. Guarda el código HTTP (0 si el servidor no respondió)
 * y los errores de cada campo cuando el backend responde 400.
 */
class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Hace la petición y revisa response.ok. Lanza ApiError si algo falla.
async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // fetch solo falla así cuando no hay conexión con el servidor
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté encendido en el puerto 8080.',
      0
    );
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch (error) {
      // la respuesta de error no trae JSON
    }
    const message = body && body.message ? body.message : `El servidor respondió con el error ${response.status}.`;
    const fieldErrors = body && body.fieldErrors ? body.fieldErrors : {};
    throw new ApiError(message, response.status, fieldErrors);
  }

  // 204 No Content (al eliminar) no trae cuerpo
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

const taskApi = {
  // GET /api/tasks
  async getAll() {
    const data = await request(API_URL);
    return data.map(fromApiTask);
  },

  // POST /api/tasks
  async create(task) {
    const data = await request(API_URL, {
      method: 'POST',
      body: JSON.stringify(toApiTask(task))
    });
    return fromApiTask(data);
  },

  // PUT /api/tasks/{id}
  async update(id, task) {
    const data = await request(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApiTask(task))
    });
    return fromApiTask(data);
  },

  // DELETE /api/tasks/{id}
  async remove(id) {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
  }
};
