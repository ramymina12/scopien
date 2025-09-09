# **App Name**: Scopie Chat

## Core Features:

- Google Authentication: Authenticate users via Google Sign-In using Firebase Authentication SDK.
- UI Layout: Responsive two-column layout: dark sidebar (280px) and light chat area, adaptable to different screen sizes. Fixed headers and footers.
- Message Display: Render user messages on the right with blue bubbles and AI messages on the left with gray bubbles, including user icons and timestamps.
- Chat history: Tool that remembers past conversations: When the user asks something, use context from their previous turns to give better results. Fetches history from the  'https://ai.scopien.com/webhook/9b5c21d6-370f-4a03-bed3-3e2b3da92c8b' endpoint, and caches to avoid refetching.
- Send Message: Send user messages to 'https://ai.scopien.com/webhook/7742abaa-046a-4362-ab28-b89393574ae6/chat' as JSON and display the AI response, also supporting markdown.
- Session Management: Client-side session management for chats using local storage, with Firebase user.uid for privacy and deletion features. Maintains chat history across sessions.
- Error Handling: Display user-friendly error messages within the chat interface, providing technical details to aid debugging.

## Style Guidelines:

- Primary color: Deep sky blue (#007BFF), reflecting trustworthiness, intelligence, and clear communication, qualities well-suited for an AI chat application.
- Background color: Very light blue-gray (#F8F9FA), almost white, to provide a clean, unobtrusive backdrop that enhances readability and focus on the chat content.
- Accent color: Electric purple (#7952B3), to highlight interactive elements and new messages, conveying a sense of modern tech and engaging user experience.
- Font: 'Inter', a grotesque-style sans-serif with a modern, machined, objective, neutral look; suitable for both headlines and body text in the application.
- Two-column layout with fixed-width sidebar (280px). The sidebar is dark (#1e293b) and the main content area is light (#ffffff).
- Simple, modern icons for user avatars, message status, and settings using a minimalist design.
- Subtle loading animations and transitions for a smooth user experience without being distracting.