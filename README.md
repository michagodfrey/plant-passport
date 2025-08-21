# PlantPassport.ai

Credit to **OpenAI**, **Cursor** and **Lovable** for helping get this project to this point.

---

## Problem Statement

Australia's domestic plant quarantine rules are complex and fragmented. They are:

* **Not curated** in a central, user‑friendly way.
* Require **time‑consuming lookups** across multiple state manuals.
* Dependent on **pest status information** that is difficult to locate and often baffling to those unfamiliar with the system.
* Written in technical language requiring **specialised knowledge** to interpret.

State governments do not do a good job of making this information public or accessible, leaving producers and the public struggling to understand what applies to them.

This project addresses that gap.

---

## What this project is (and isn't)

* ✅ **Public information only** - all data is sourced from publicly available quarantine manuals and established pest location records.
* ✅ **Educational and supportive tool** - helps users understand what they are in for if they want to move plants commercially.
* ✅ **Fallback to authorities** - all outputs direct users back to the relevant biosecurity authority for final confirmation.
* ❌ **Not a business idea** - this project will not make money.
* ❌ **Not legally risky** - there is no mechanism for liability, as advice always refers back to official authorities.

---

## Who is this for?

* **Producers** - moving fruit, vegetables, nursery stock, soil, or related plant material.
* **House movers** - individuals relocating and unsure what plants they can take.
* **Regulators** - inspectors or policy officers looking for a quick reference.

---

## Roadmap / To‑Do

A comprehensive task list is in [`docs/todo.md`](./docs/todo.md). Resources for the knowledge base are in [`docs/resources.md`](./docs/resources.md).

Key deliverables:

* **AI Integration** - natural language interface to query conditions.
* **Knowledge Base** - structured import conditions for each state.
* **Plant Pest & Disease Database** - authoritative host/pest mapping.
* **Mapping** - pest distributions and area freedom zones.

---

## Project Info

**Frontend developed by Lovable**: [https://lovable.dev/projects/ccbb0de6-cd58-412c-997e-abf3209e5f46](https://lovable.dev/projects/ccbb0de6-cd58-412c-997e-abf3209e5f46)

### Tech Stack

This project is built with:

* Vite
* TypeScript
* React
* shadcn‑ui
* Tailwind CSS

---

## Development

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Enter project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Run the development server
npm run dev
```

### Edit via Lovable

* Open the [Lovable Project](https://lovable.dev/projects/ccbb0de6-cd58-412c-997e-abf3209e5f46)
* Start prompting to make edits.
* Changes commit automatically back to this repo.
