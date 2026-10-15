# Cycle Planner
### A daily wellness plan shaped by today's context

An AI-powered MVP exploring a simple question: can a short check-in turn a person's energy, available time, equipment, and cycle context into a more useful plan for today?

## The product
Enter cycle day, energy, time available, equipment, soreness, goals, dietary preferences, and optional notes. Generate a plan covering:
- A workout with warmup, main set, cooldown, intensity, and modifications.
- Nutrition and hydration suggestions.
- Recovery, sleep, and a five-minute mindset practice.
- Safety notes and a copy-to-clipboard action.

**Status:** Functional prototype; no measured adoption or health outcomes are claimed.

## Product decisions visible in the implementation

| Decision | Why it matters | Tradeoff |
| --- | --- | --- |
| Plan for today | Keeps the output focused on an immediate decision | No longer-term progression or history |
| Include energy, time, and equipment | Makes personalization reflect practical constraints | Requires several inputs before first value |
| Use a strict JSON schema | Gives the interface predictable sections instead of free-form chat | Schema compliance does not establish recommendation quality |
| Generate on the server | Keeps the API key out of browser code | Requires a configured server and paid API access |
| Keep outputs short | Limits response length and reading effort | Short output budgets can truncate a response |

## How it works
`app/page.tsx` collects context and posts to `/api/plan`. The server derives a simple phase hint, builds a prompt, and calls the OpenAI Responses API with `gpt-4.1-mini` and a strict JSON schema. The client renders the returned plan.

**Stack:** Next.js 16 · React 19 · TypeScript · OpenAI SDK

## Run locally
Requires Node.js compatible with Next.js 16 and an OpenAI API key.

```bash
npm ci
```

Create an untracked `.env.local` file:
```dotenv
OPENAI_API_KEY=your_api_key_here
```

```bash
npm run dev
```

Open http://localhost:3000. Plan generation sends the submitted context to OpenAI and uses your API account.

## What I would validate next
These are proposed experiments, not completed research or measured results.
- **Activation:** Do visitors complete the check-in and generate their first plan?
- **Usefulness:** Can users find an appropriate action without editing most of the output?
- **Return value:** Do people come back to generate another plan within seven days?
- **AI quality:** Evaluate feasibility, constraint adherence, response completeness, latency, and cost per successful plan.

## Current boundaries
The phase hint uses fixed day ranges; it does not estimate an individual's actual hormone levels or confirm ovulation. This is a wellness prototype, not a clinically validated tool. Inputs are passed to the model provider. The current version has no accounts, saved plans, rate limiting, or comprehensive server-side input validation.

## About the builder
Built by [Ritika Dahiya](https://github.com/RitikaD10), a product leader with experience at Walmart+ and MyFitnessPal, exploring AI personalization and everyday behavior change through hands-on projects.
