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

  describe('Tareas que llegan del backend', () => {
    it('addTask respeta el id que asignó la base de datos', () => {
      const task = taskManager.addTask({ ...sampleTask(), id: 42 });

      expect(task.id).to.equal(42);
      expect(taskManager.getTaskById(42)).to.equal(task);
    });

    it('setTasks reemplaza toda la lista', () => {
      taskManager.addTask(sampleTask());

      taskManager.setTasks([
        new Task(7, 'Tarea de prueba', 'Descripción', 'Dayana Vallejo', '2026-12-01', 'PENDIENTE'),
        new Task(8, 'Tarea de prueba', 'Descripción', 'Dayana Vallejo', '2026-12-01', 'HECHO')
      ]);

      expect(taskManager.tasks.length).to.equal(2);
      expect(taskManager.getTaskById(8).estado).to.equal('HECHO');
    });

    it('replaceTask cambia la tarea por la versión del servidor', () => {
      const task = taskManager.addTask(sampleTask());
      const updated = new Task(task.id, 'Nombre actualizado', 'Descripción', 'Dayana Vallejo', '2026-12-01', 'HECHO');

      taskManager.replaceTask(updated);

      expect(taskManager.tasks.length).to.equal(1);
      expect(taskManager.getTaskById(task.id).nombre).to.equal('Nombre actualizado');
    });
  });

  describe('api.js (conversión de datos)', () => {
    it('toApiTask convierte los campos y el estado al formato del backend', () => {
      const json = toApiTask({ ...sampleTask(), estado: 'EN PROGRESO' });

      expect(json).to.deep.equal({
        name: 'Tarea de prueba',
        description: 'Descripción de la tarea de prueba',
        assignedTo: 'Dayana Vallejo',
        dueDate: '2026-12-01',
        status: 'IN_PROGRESS'
      });
    });

    it('fromApiTask convierte la respuesta del backend en un Task', () => {
      const task = fromApiTask({
        id: 5,
        name: 'Tarea de prueba',
        description: 'Descripción de la tarea de prueba',
        assignedTo: 'Dayana Vallejo',
        dueDate: '2026-12-01',
        status: 'REVIEW'
      });

      expect(task).to.be.instanceOf(Task);
      expect(task.id).to.equal(5);
      expect(task.asignadoA).to.equal('Dayana Vallejo');
      expect(task.estado).to.equal('REVISIÓN');
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
