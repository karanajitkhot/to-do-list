document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskTitle = document.getElementById('task-title');
  const taskDesc = document.getElementById('task-desc');
  const pendingTasks = document.getElementById('pending-tasks');
  const completedTasks = document.getElementById('completed-tasks');

  // Load tasks from localStorage
  loadTasks();

  // Add a new task to the pending list
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim(); 
    const desc = taskDesc.value.trim();

    if (title && desc) {
      const taskItem = createTaskItem({
        title,
        desc,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        id: Date.now().toString()
      });
      pendingTasks.appendChild(taskItem);
      taskForm.reset();
      saveTasks();
    }
  });

  // Function to create a task item
  function createTaskItem(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.innerHTML = `
      <div class="task-content">
        <div class="task-header">
          <strong>${task.title}</strong>
          <span class="timestamp">Created: ${formatDate(task.createdAt)}</span>
          ${task.completedAt ? `<span class="timestamp">Completed: ${formatDate(task.completedAt)}</span>` : ''}
        </div>
        <p>${task.desc}</p>
      </div>`;

    const btnContainer = document.createElement('div');
    btnContainer.className = 'button-container';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn complete-btn';
    completeBtn.textContent = task.isCompleted ? 'Undo' : 'Complete';
    completeBtn.addEventListener('click', () => toggleTask(li, !task.isCompleted));

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editTask(li, task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      li.remove();
      saveTasks();
    });

    btnContainer.appendChild(completeBtn);
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    li.appendChild(btnContainer);
    return li;
  }

  // Function to edit a task
  function editTask(taskItem, task) {
    const titleElement = taskItem.querySelector('strong');
    const descElement = taskItem.querySelector('p');
    
    const tempTitle = titleElement.textContent;
    const tempDesc = descElement.textContent;
    
    titleElement.innerHTML = `<input type="text" class="edit-input" value="${tempTitle}">`;
    descElement.innerHTML = `<textarea class="edit-input">${tempDesc}</textarea>`;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'action-btn save-btn';
    saveBtn.textContent = 'Save';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'action-btn cancel-btn';
    cancelBtn.textContent = 'Cancel';
    
    const btnContainer = taskItem.querySelector('.button-container');
    btnContainer.innerHTML = '';
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    
    saveBtn.addEventListener('click', () => {
      const newTitle = taskItem.querySelector('.edit-input').value.trim();
      const newDesc = taskItem.querySelector('textarea').value.trim();
      
      if (newTitle && newDesc) {
        task.title = newTitle;
        task.desc = newDesc;
        const newTaskItem = createTaskItem(task);
        taskItem.replaceWith(newTaskItem);
        saveTasks();
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      const newTaskItem = createTaskItem(task);
      taskItem.replaceWith(newTaskItem);
    });
  }

  // Move task between pending and completed lists
  function toggleTask(taskItem, isCompleted) {
    const id = taskItem.dataset.id;
    const title = taskItem.querySelector('strong').textContent;
    const desc = taskItem.querySelector('p').textContent;
    const createdAt = taskItem.querySelector('.timestamp').textContent.replace('Created: ', '');
    
    taskItem.remove();
    const newTask = createTaskItem({
      id,
      title,
      desc,
      isCompleted,
      createdAt,
      completedAt: isCompleted ? new Date().toISOString() : null
    });
    
    if (isCompleted) {
      completedTasks.appendChild(newTask);
    } else {
      pendingTasks.appendChild(newTask);
    }
    saveTasks();
  }

  // Helper function to format dates
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Save tasks to localStorage
  function saveTasks() {
    const tasks = {
      pending: Array.from(pendingTasks.children).map(getTaskData),
      completed: Array.from(completedTasks.children).map(getTaskData)
    };
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Load tasks from localStorage
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{"pending":[],"completed":[]}');
    
    tasks.pending.forEach(task => {
      pendingTasks.appendChild(createTaskItem(task));
    });
    
    tasks.completed.forEach(task => {
      completedTasks.appendChild(createTaskItem(task));
    });
  }

  // Helper function to get task data from DOM element
  function getTaskData(taskElement) {
    return {
      id: taskElement.dataset.id,
      title: taskElement.querySelector('strong').textContent,
      desc: taskElement.querySelector('p').textContent,
      isCompleted: taskElement.parentElement === completedTasks,
      createdAt: taskElement.querySelector('.timestamp').textContent.replace('Created: ', ''),
      completedAt: taskElement.querySelectorAll('.timestamp')[1]?.textContent.replace('Completed: ', '') || null
    };
  }
});
