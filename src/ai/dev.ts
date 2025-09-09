import { config } from 'dotenv';
config();

import '@/ai/flows/generate-chat-title.ts';
import '@/ai/flows/summarize-chat-history.ts';
import '@/ai/flows/suggest-new-chats.ts';