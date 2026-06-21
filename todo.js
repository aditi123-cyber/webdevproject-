const STORAGE_KEY = 'todoApp.tasks';
const form = document.getElementById('todo-form');
const taskInput = document.getElementById('todo-input');
const taskList = document.getElementById('task-list');
const filterGroup = document.querySelector('.filters');
const clearCompletedButton = document.getElementById('clear-completed');
const taskCount = document.getElementById('task-count');

let tasks = [];
let currentFilter = 'all';

function loadTasks() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateTaskCount() {
  const activeCount = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} left`;
}

function createTaskItem(task) {
  const listItem = document.createElement('li');
  listItem.className = `task-item${task.completed ? ' completed' : ''}`;
  listItem.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-toggle';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark task ${task.text} as ${task.completed ? 'active' : 'completed'}`);

  const textContainer = document.createElement('span');
  textContainer.className = 'task-text';
  textContainer.textContent = task.text;
  textContainer.tabIndex = 0;
  textContainer.setAttribute('role', 'button');
  textContainer.setAttribute('aria-label', `Edit task ${task.text}`);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-button edit-button';
  editButton.textContent = 'Edit';
  editButton.setAttribute('aria-label', `Edit task ${task.text}`);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-button delete-button';
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('aria-label', `Delete task ${task.text}`);

  actions.append(editButton, deleteButton);
  listItem.append(checkbox, textContainer, actions);

  return listItem;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'task-item';
    emptyMessage.textContent = currentFilter === 'completed' ? 'No completed tasks yet.' : 'No tasks yet. Add your first task above.';
    taskList.append(emptyMessage);
  } else {
    filteredTasks.forEach((task) => taskList.append(createTaskItem(task)));
  }

  updateTaskCount();
}

function setActiveFilter(button) {
  document.querySelectorAll('.filter-button').forEach((control) => {
    control.classList.toggle('active', control === button);
  });
}

function addTask(text) {
  const newTask = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: Date.now(),
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function toggleTaskCompletion(taskId) {
  tasks = tasks.map((task) => ({
    ...task,
    completed: task.id === taskId ? !task.completed : task.completed,
  }));

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function startTaskEdit(listItem) {
  const taskId = listItem.dataset.id;
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  const textSpan = listItem.querySelector('.task-text');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', `Edit task ${task.text}`);

  textSpan.replaceWith(input);
  input.focus();
  input.select();
}

function finishTaskEdit(input) {
  const listItem = input.closest('.task-item');
  const taskId = listItem.dataset.id;
  const newText = input.value.trim();

  if (newText === '') {
    deleteTask(taskId);
    return;
  }

  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, text: newText } : task
  );

  saveTasks();
  renderTasks();
}

function handleListClick(event) {
  const listItem = event.target.closest('.task-item');
  if (!listItem) return;

  if (event.target.matches('.task-toggle')) {
    toggleTaskCompletion(listItem.dataset.id);
    return;
  }

  if (event.target.matches('.delete-button')) {
    deleteTask(listItem.dataset.id);
    return;
  }

  if (event.target.matches('.edit-button') || event.target.matches('.task-text')) {
    startTaskEdit(listItem);
  }
}

function handleTaskInputEvents(event) {
  if (event.target.matches('.task-edit-input') && event.key === 'Enter') {
    event.preventDefault();
    finishTaskEdit(event.target);
  }

  if (event.target.matches('.task-edit-input') && event.key === 'Escape') {
    renderTasks();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  addTask(taskText);
  taskInput.value = '';
  taskInput.focus();
});

filterGroup.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;

  currentFilter = button.dataset.filter;
  setActiveFilter(button);
  renderTasks();
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

taskList.addEventListener('click', handleListClick);
taskList.addEventListener('keydown', handleTaskInputEvents);

taskList.addEventListener('focusout', (event) => {
  if (event.target.matches('.task-edit-input')) {
    finishTaskEdit(event.target);
  }
});

loadTasks();
renderTasks();
