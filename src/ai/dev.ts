import { config } from 'dotenv';
config();

import '@/ai/flows/ai-notifications.ts';
import '@/ai/flows/project-summary.ts';
import '@/ai/flows/meeting-prep.ts';
import '@/ai/flows/redact-notes.ts';
