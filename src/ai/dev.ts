import { config } from 'dotenv';
config();

import '@/ai/flows/ai-notifications.ts';
import '@/ai/flows/redact-notes.ts';
import '@/ai/flows/meeting-prep.ts';
import '@/ai/flows/suggest-task-description.ts';
import '@/ai/flows/suggest-burndown-values.ts';
