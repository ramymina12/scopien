'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a chat title based on the first few messages.
 *
 * @remarks
 * The flow takes a list of messages as input and uses a language model to generate a concise title summarizing the chat's topic.
 *
 * @exports generateChatTitle - The main function to generate a chat title.
 * @exports GenerateChatTitleInput - The input type for the generateChatTitle function.
 * @exports GenerateChatTitleOutput - The output type for the generateChatTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the generateChatTitle flow
const GenerateChatTitleInputSchema = z.object({
  messages: z
    .array(
      z.object({
        type: z.enum(['human', 'ai']),
        data: z.object({
          content: z.string(),
        }),
      })
    )
    .describe('An array of messages from the chat history.'),
});

export type GenerateChatTitleInput = z.infer<typeof GenerateChatTitleInputSchema>;

// Define the output schema for the generateChatTitle flow
const GenerateChatTitleOutputSchema = z.object({
  title: z.string().describe('A concise title summarizing the chat.'),
});

export type GenerateChatTitleOutput = z.infer<typeof GenerateChatTitleOutputSchema>;

// Define the wrapper function
export async function generateChatTitle(input: GenerateChatTitleInput): Promise<GenerateChatTitleOutput> {
  return generateChatTitleFlow(input);
}

// Define the prompt to generate the chat title
const generateChatTitlePrompt = ai.definePrompt({
  name: 'generateChatTitlePrompt',
  input: {schema: GenerateChatTitleInputSchema},
  output: {schema: GenerateChatTitleOutputSchema},
  prompt: `You are an expert at generating concise and descriptive titles for chat conversations.

  Given the following chat messages, generate a title that summarizes the main topic of the conversation.
  The title should be no more than 10 words.

  Messages:
  {{#each messages}}
  {{this.type}}: {{this.data.content}}
  {{/each}}
  `,
});

// Define the Genkit flow
const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: GenerateChatTitleInputSchema,
    outputSchema: GenerateChatTitleOutputSchema,
  },
  async input => {
    // Call the prompt to generate the title
    const {output} = await generateChatTitlePrompt(input);
    return output!;
  }
);
