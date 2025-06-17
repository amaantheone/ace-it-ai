# ACE IT AI

## Description

Ace It AI is an intelligent learning companion built to fulfill every students' needs. This application leverages artificial intelligence to enhance students' learning journeys through interactive features like AI chat, mindmap generation, flashcard creation, and quiz generation and attempt functionality. Whether you're studying for exams, exploring new topics, or organizing your knowledge, Ace It AI provides intuitive tools to make learning more efficient and enjoyable.

## Table of Contents

* Features
* Tech Stack
* Running Locally
* Contributing
* Support

## Features

- **AI Chat Assistant**: Engage in conversations with an AI tutor that can answer questions and provide explanations on various topics
- **PDF Context Upload**: Upload PDF documents to provide the AI with additional context for more relevant responses
- **Interactive Mindmaps**: Generate visual mindmaps of any topic to help understand relationships between concepts
- **Flashcard System**: Create study flashcards automatically based on your chosen topics
- **Bulk Flashcard Generation**: Generate multiple flashcards at once with automatic folder organization
- **Folder Management**: Organize your flashcards with comprehensive CRUD operations:
  - Create folders through the bulk generation feature
  - Update folder names
  - Move flashcards between folders
  - Delete folders and their contents
- **Adaptive Quizzes**: Generate educational quizzes on any topic with detailed explanations
  - Create quizzes from scratch *or* from uploaded PDF content
  - Multiple-choice questions with accurate answer validation
  - Detailed explanations for both correct and incorrect answers
  - Score tracking and accuracy statistics
  - Quiz history and progress tracking
  - Review completed quizzes to reinforce learning

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **UI Components**: shadcn UI
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM
- **AI Integration**: Google's Gemini language model for generating content
- **Visualization**: Mermaid.js for Interactive mindmap rendering

## Running locally

1. Clone the repository
   ```bash
   git clone https://github.com/amaantheone/ace-it-ai.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ace-it-ai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables: <br>
Create `.env` file and set env variables from `.env.example` file.

6. Database Initialization:
   ```bash
   npx prisma migrate deploy && npx prisma generate
   ```
6. **Run the app**:
   ```bash
   npm run dev
   ```

## Contributing:

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

## ❤️ Support:

If you liked the project, I will really appreciate it if you leave a star. 🌟😊
