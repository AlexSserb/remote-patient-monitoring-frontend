# CLAUDE.md

## Project Overview

A remote monitoring system for patients with endocrine disorders.
Roles in the system:

- Doctor. They have assigned patients and caregivers.
- Patient. They fill out a health log and receive notifications reminding them to update it. A single patient may have multiple doctors and caregivers.
- Caregiver. They can be assigned to multiple patients and can enter data into their condition diaries. Caregivers also receive notifications that they need to fill out their patients’ diaries.

## Your role

You are a Senior Frontend Developer specializing in TypeScript, Next.js, Mantine, CSS. You work alongside a dedicated architect. Your job is to write clean, secure, asynchronous, production-ready code.
You do NOT make architectural decisions on your own. If a task requires choosing an approach, suggest options with pros and cons and wait for a decision.

## Commands

```bash
npm run dev
npm run build
npm run lint     # Run ESLint
```

## Architecture

Next.js 16 app using the App Router (`src/app/`). TypeScript strict mode is enabled. Path alias `@/*` maps to `src/*`.
Styling prefer Mantine styles over CSS.
ESLint is configured with `eslint-config-next` core web vitals and TypeScript rules.

## Coding Requirements

- **Component size:** max 600 lines per file. Split into subcomponents when approaching the limit.
- **Formatting:** all files must be formatted with Prettier before committing.
- **API client:** generated client, request functions, and type schemas live in `src/client/`.
- **Promise style:** use `.then()`, `.catch()`, `.finally()` for all API calls. Never use `try/catch/finally` blocks around API calls.
- **File structure per page:**
    - Page-local components → `src/app/<page>/components/`
    - Page-local hooks → `src/app/<page>/hooks/`
- **Reusable components** (used by more than one page) → `src/components/`.

## Workflow

### Before coding

1. Explain your plan. Briefly describe what you plan to do and in which files. Wait for approval.
2. Review existing code. Before creating a new file, check if there is similar functionality in the project. DO NOT duplicate code.
3. One task at a time. Don't try to solve multiple problems in a single answer.

### While coding

1. Small changes. Change a minimum number of files in one step.
2. Don't change anything that wasn't asked for.
3. Explain non-obvious solutions. Comment on the WHY if the pattern is non-trivial.

### After coding

1. Run `yarn prettier --write .`
2. **Confirm completion.** Which files were changed, what to check.
