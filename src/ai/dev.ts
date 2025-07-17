import { config } from 'dotenv';
config();

import '@/ai/flows/ai-notifications.ts';
import '@/ai/flows/redact-notes.ts';
import '@/ai/flows/project-summary.ts';
