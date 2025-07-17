import fs from 'fs/promises';
import path from 'path';
import { Task, AiDirective } from '@/types';

const dataDirectory = path.join(process.cwd(), 'data');
const tasksFilePath = path.join(dataDirectory, 'tasks.json');
const directivesFilePath = path.join(dataDirectory, 'directives.json');

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await fs.mkdir(dataDirectory, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw error;
  }
}

// Task Functions
export const getTasks = () => readData<Task>(tasksFilePath);
export const saveTasks = (tasks: Task[]) => writeData<Task>(tasksFilePath, tasks);

// Directive Functions
export const getDirectives = () => readData<AiDirective>(directivesFilePath);
export const saveDirectives = (directives: AiDirective[]) => writeData<AiDirective>(directivesFilePath, directives);
