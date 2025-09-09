'use server';

/**
 * @fileOverview A flow to suggest new chat topics based on previous conversations.
 *
 * - suggestNewChats - A function that suggests new chat topics.
 * - SuggestNewChatsInput - The input type for the suggestNewChats function.
 * - SuggestNewChatsOutput - The return type for the suggestNewChats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewChatsInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The complete history of previous conversations.'),
});
export type SuggestNewChatsInput = z.infer<typeof SuggestNewChatsInputSchema>;

const SuggestNewChatsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested new chat topics.'),
});
export type SuggestNewChatsOutput = z.infer<typeof SuggestNewChatsOutputSchema>;

export async function suggestNewChats(
  input: SuggestNewChatsInput
): Promise<SuggestNewChatsOutput> {
  return suggestNewChatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewChatsPrompt',
  input: {schema: SuggestNewChatsInputSchema},
  output: {schema: SuggestNewChatsOutputSchema},
  prompt: `Given the following conversation history, suggest 3 new chat topics that the user might be interested in.

Conversation History: {{{conversationHistory}}}

Suggestions:`,
});

const suggestNewChatsFlow = ai.defineFlow(
  {
    name: 'suggestNewChatsFlow',
    inputSchema: SuggestNewChatsInputSchema,
    outputSchema: SuggestNewChatsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
