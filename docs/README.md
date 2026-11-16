# Docs

## Rules (how code is written here)

| File | Covers |
| ---- | ------ |
| [rules/project-rules.md](rules/project-rules.md) | Project-specific rules: stack, styling, no-backend, branches |
| [rules/typescript-standards.md](rules/typescript-standards.md) | Universal TypeScript rules for every `.ts` / `.tsx` file |
| [rules/frontend-folder-structure.md](rules/frontend-folder-structure.md) | Where files live in the Next.js app |
| [rules/comments.md](rules/comments.md) | The four allowed comment formats and placement |
| [rules/commit.md](rules/commit.md) | Conventional commit message format |
| [rules/test-standards.md](rules/test-standards.md) | Test-driven development standards |

Provenance: these rule files were supplied by the project owner on 2026-11-16 and originate from his existing projects (portfolio-next). Backend-specific sections of `test-standards.md` (NestJS, API layers) do not apply here - this project has no backend. SEO rule files from the other projects were intentionally not carried over.

## Design system

| File | Covers |
| ---- | ------ |
| [design-system/risograph-print-design-system.md](design-system/risograph-print-design-system.md) | Risograph Print tokens: color, type, spacing, shadows, components |
| [design-system/risograph-print-instructions.md](design-system/risograph-print-instructions.md) | Construction rules and pre-ship checklist for the Risograph system |

The whole app UI follows the Risograph Print system (Tailwind utilities mapped to its `--ds-*` tokens), responsive across desktop, tablet and mobile.

## Plans

- [plans/plan.md](plans/plan.md) - what we are building and in what order
