import fs from 'fs/promises';
import path from 'path';
import { Task, AiDirective, User, Meeting } from '@/types';

const dataDirectory = path.join(process.cwd(), 'data');
const tasksFilePath = path.join(dataDirectory, 'tasks.json');
const directivesFilePath = path.join(dataDirectory, 'directives.json');
const usersFilePath = path.join(dataDirectory, 'users.json');
const meetingsFilePath = path.join(dataDirectory, 'meetings.json');
const visionFilePath = path.join(dataDirectory, 'vision.json');


async function readData<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await writeData(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
}

async function writeData<T>(filePath: string, data: T): Promise<void> {
  try {
    await fs.mkdir(dataDirectory, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw error;
  }
}

// Task Functions
export const getTasks = () => readData<Task[]>(tasksFilePath, []);
export const saveTasks = (tasks: Task[]) => writeData<Task[]>(tasksFilePath, tasks);

// Directive Functions
export const getDirectives = () => readData<AiDirective[]>(directivesFilePath, []);
export const saveDirectives = (directives: AiDirective[]) => writeData<AiDirective[]>(directivesFilePath, directives);

// User Functions
export const getUsers = () => readData<User[]>(usersFilePath, []);
export const saveUsers = (users: User[]) => writeData<User[]>(usersFilePath, users);


// Meeting Functions
export const getMeetings = () => readData<Meeting[]>(meetingsFilePath, []);
export const saveMeetings = (meetings: Meeting[]) => writeData<Meeting[]>(meetingsFilePath, meetings);

// Vision Functions
export const getVision = () => readData<{ text: string }>(visionFilePath, { text: '' });
export const saveVision = (vision: { text: string }) => writeData<{ text: string }>(visionFilePath, vision);
