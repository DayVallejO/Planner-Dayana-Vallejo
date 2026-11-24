const expect = chai.expect;

// Datos de una tarea de prueba
function sampleTask() {
  return {
    nombre: 'Tarea de prueba',
    descripcion: 'Descripción de la tarea de prueba',
    asignadoA: 'Dayana Vallejo',
    fechaDeEntrega: '2026-12-01',
    estado: 'PENDIENTE'
  };
}

describe('TaskManager', () => {
  let taskManager;

  // Antes de cada prueba se crea un TaskManager nuevo y vacío
  beforeEach(() => {
    taskManager = new TaskManager();
  });

  describe('addTask (Agregar)', () => {
    it('agrega la tarea a la lista', () => {
      taskManager.addTask(sampleTask());

      expect(taskManager.tasks.length).to.equal(1);
      expect(taskManager.tasks[0].nombre).to.equal('Tarea de prueba');
    });

    it('le asigna un id nuevo a cada tarea', () => {
      const first = taskManager.addTask(sampleTask());
      const second = taskManager.addTask(sampleTask());

      expect(first.id).to.equal(1);
      expect(second.id).to.equal(2);
      expect(taskManager.currentId).to.equal(2);
    });
  });

  describe('deleteTask (Eliminar)', () => {
    it('elimina la tarea con el id indicado', () => {
      const task = taskManager.addTask(sampleTask());
      taskManager.addTask(sampleTask());

      taskManager.deleteTask(task.id);

      expect(taskManager.tasks.length).to.equal(1);
      expect(taskManager.getTaskById(task.id)).to.equal(undefined);
    });
  });

  describe('updateTask (Actualizar)', () => {
    it('cambia el estado de la tarea', () => {
      const task = taskManager.addTask(sampleTask());

      taskManager.updateTask(task.id, 'HECHO');

      expect(taskManager.getTaskById(task.id).estado).to.equal('HECHO');
    });
  });

  describe('editTask (Actualizar desde el formulario)', () => {
    it('cambia todos los datos de la tarea', () => {
      const task = taskManager.addTask(sampleTask());

      taskManager.editTask(task.id, {
        nombre: 'Nombre nuevo de la tarea',
        descripcion: 'Descripción nueva de la tarea',
        asignadoA: 'Laura Martínez',
        fechaDeEntrega: '2026-12-15',
        estado: 'REVISIÓN'
      });

      const updated = taskManager.getTaskById(task.id);
      expect(updated.nombre).to.equal('Nombre nuevo de la tarea');
      expect(updated.descripcion).to.equal('Descripción nueva de la tarea');
      expect(updated.asignadoA).to.equal('Laura Martínez');
      expect(updated.fechaDeEntrega).to.equal('2026-12-15');
      expect(updated.estado).to.equal('REVISIÓN');
    });
  });

  describe('assignTask (Asignar A)', () => {
    it('cambia la persona asignada', () => {
      const task = taskManager.addTask(sampleTask());

      taskManager.assignTask(task.id, 'Carlos Rodríguez');

      expect(taskManager.getTaskById(task.id).asignadoA).to.equal('Carlos Rodríguez');
    });
  });

  describe('getTaskById', () => {
    it('devuelve la tarea con ese id', () => {
      taskManager.addTask(sampleTask());
      const task = taskManager.addTask(sampleTask());

      expect(taskManager.getTaskById(task.id)).to.equal(task);
    });
  });

  describe('save y load (localStorage)', () => {
    // Se guarda lo que había en localStorage para no borrar las tareas reales
    let savedTasks;
    let savedId;

    beforeEach(() => {
      savedTasks = localStorage.getItem('tasks');
      savedId = localStorage.getItem('currentId');
    });

    afterEach(() => {
      if (savedTasks === null) localStorage.removeItem('tasks');
      else localStorage.setItem('tasks', savedTasks);
      if (savedId === null) localStorage.removeItem('currentId');
      else localStorage.setItem('currentId', savedId);
    });

    it('guarda las tareas y el contador de ids', () => {
      taskManager.addTask(sampleTask());
      taskManager.save();

      const stored = JSON.parse(localStorage.getItem('tasks'));
      expect(stored.length).to.equal(1);
      expect(localStorage.getItem('currentId')).to.equal('1');
    });

    it('carga las tareas guardadas', () => {
      taskManager.addTask(sampleTask());
      taskManager.addTask(sampleTask());
      taskManager.save();

      const otherManager = new TaskManager();
      otherManager.load();

      expect(otherManager.tasks.length).to.equal(2);
      expect(otherManager.currentId).to.equal(2);
    });
  });

  describe('UI: render', () => {
    let list;

    // Lista HTML de prueba (no se agrega a la página)
    beforeEach(() => {
      list = document.createElement('div');
    });

    it('al agregar una tarea, aparece en la lista HTML', () => {
      const task = taskManager.addTask(sampleTask());
      taskManager.render(list);

      const card = list.querySelector(`[data-id="${task.id}"]`);
      expect(list.children.length).to.equal(1);
      expect(card).to.not.equal(null);
      expect(card.querySelector('.card-title').textContent).to.equal('Tarea de prueba');
    });

    it('al eliminar una tarea, desaparece de la lista HTML', () => {
      const task = taskManager.addTask(sampleTask());
      taskManager.addTask(sampleTask());
      taskManager.render(list);
      expect(list.children.length).to.equal(2);

      taskManager.deleteTask(task.id);
      taskManager.render(list);

      expect(list.children.length).to.equal(1);
      expect(list.querySelector(`[data-id="${task.id}"]`)).to.equal(null);
    });
  });
});
