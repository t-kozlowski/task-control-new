export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Todo' | 'In Progress' | 'Done' | 'Backlog';

export interface SubTask {
  id: string;
  name: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: Priority;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string;
  priority: Priority;
  status: Status;
  subTasks: SubTask[];
  progress?: number;
}

export interface AiDirective {
  id: string;
  text: string;
}
