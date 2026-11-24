# Boardwallah AI Platform Roadmap & Goals

> **Mission**: Build a unified, chat-first CBSE Class 10 AI Tutor where all study tools, chapter resources, practice quizzes, and revision workspaces live directly inside the conversation.

---

## 📌 Implementation Status Tracker

- [x] **Goal 1: In-Chat Chapter Resources & Interactive Quizzes** *(COMPLETED & VERIFIED)*
  - [x] 1.1 Added direct "📖 Notes ↗" links and "💬 Ask AI" dual action buttons to all 58 chapter cards in `#library-modal`.
  - [x] 1.2 Added "📚 Explore 58 Chapter Guides & Quizzes" and "🧪 Start Instant CBSE Practice Quiz" pills on welcome canvas + Quick action chips (`📚 58 Chapters`, `🧪 Quiz Me`, `🖼️ Diagrams`, `⚡ Formulas`) above the message input capsule.
  - [x] 1.3 Added smart In-Chat Resource Cards in AI responses (`detectChapterResource` attaches chapter notes link and 20-question quiz link dynamically).
  - [x] 1.4 Built In-Chat Interactive Quiz Engine (`/quiz [chapter]`, 1-click quiz buttons, and `quiz` mode in system prompt) that serves board questions turn-by-turn with instant CBSE rubric grading.
  - [x] 1.5 Fixed global link interceptor so chapter resource pages (`/resources/[slug]`) open seamlessly in new tabs.

- [x] **Goal 2: Multi-Turn Conversation Memory & Context Continuity** *(COMPLETED & VERIFIED)*
  - [x] 2.1 Upgraded `/api/v1/ai/doubt-tutor` with `buildNormalizedContents()` enforcing Gemini's strict alternating turn schema (`user` ⇄ `model`).
  - [x] 2.2 Eliminated thread fragmentation by maintaining `activeThreadId` at top scope, appending follow-ups into active thread messages.
  - [x] 2.3 Verified context-dependent queries (*"explain step 2"*, *"give another practice question like this"*) with multi-turn sliding window.

- [x] **Goal 3: Fully Activate Subject "Notebooks" Workspaces** *(COMPLETED & VERIFIED)*
  - [x] 3.1 Wired `+ New notebook` (`#new-notebook-trigger`) with custom notebook creation dialog (`openCreateNotebookPrompt()`).
  - [x] 3.2 Wired `... All notebooks` (`#all-notebooks-btn`) modal (`#notebooks-modal`) to browse, switch, and inspect workspaces.
  - [x] 3.3 Connected local storage persistence (`boardwallah_custom_notebooks`) and dynamic rendering into `.notebooks-list`.
  - [x] 3.4 Integrated active workspace title switcher (`selectNotebook()`) and Revision Vault export sheet.

- [x] **Goal 4: Firestore Question Bank Database Migration** *(COMPLETED & VERIFIED)*
  - [x] 4.1 Designed Firestore `question_bank` schema (subject, chapterSlug, question, options, correctAnswerIndex, explanation, marks, examType).
  - [x] 4.2 Created automated extractor `scripts/build-question-bank.cjs` parsing 720 board questions across 36 chapters into `frontend/public/data/question_bank.json`.
  - [x] 4.3 Successfully seeded **all 720 questions** into Firebase Firestore collection `question_bank` via `scripts/seed-firestore-questions.cjs` and verified live query retrieval.

---

## 🚀 Execution Summary

All 4 goals have been sequentially implemented, built, and verified end-to-end!
