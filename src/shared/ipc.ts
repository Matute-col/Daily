export const IPC = {
  listTasks: 'tasks:list',
  createTask: 'tasks:create',
  updateTask: 'tasks:update',
  deleteTask: 'tasks:delete',
  getSettings: 'settings:get',
  setSettings: 'settings:set',
  tasksChanged: 'tasks:changed',
  focusTask: 'tasks:focus',
  copyText: 'clipboard:write'
} as const
