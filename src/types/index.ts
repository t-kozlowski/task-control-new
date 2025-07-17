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
  assignee: string; // email of the user
  priority: Priority;
  status: Status;
  subTasks: SubTask[]; // This might become deprecated, but keep for now to avoid breaking changes.
  progress?: number;
  parentId?: string | null;
}

export interface AiDirective {
  id: string;
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ActionItem {
    id: string;
    description: string;
    owner: string; // email
    status: Status | 'Done' | 'In Progress' | 'Todo' | 'Backlog';
}

export interface Meeting {
    id: string;
    date: string;
    title: string;
    summary: string;
    attendees: string[]; // emails
    actionItems: ActionItem[];
}
