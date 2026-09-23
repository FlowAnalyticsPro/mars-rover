# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is not (yet) a codebase with an application to build, lint, or test. It is a **spec-driven workflow repository**: a structured process, implemented as Claude Code skills, that turns a raw idea into an accepted `intent.md`, then into an accepted `spec.md`, before any implementation ("Build phase") begins. The Mars Rover simulator described in `intent/mars-rover/` has not been built yet — only its intent and specification exist.

Documents and skill instructions are written in **French**; follow that convention when editing them.

## Workflow phases

1. **Intent** (`.claude/skills/intent/SKILL.md`, invoked via chat or the `intent` skill) — turns a stakeholder's idea into `intent/<slug>/intent.md`: problem, proposed outcome, users/systems involved, constraints, and open questions. The author never has product decisions made for them; anything undecided stays in "Questions ouvertes".
2. **Design / Spec** (`.claude/skills/spec/SKILL.md`, invoked with `/spec intent/<slug>/intent.md`) — turns an *accepted* intent into `intent/<slug>/spec.md`: numbered requirements (`EX-NN`) each tied back to the exact intent passage they come from, a Given/When/Then-style scenario, a proposed design, "Réserves" (ambiguities/contradictions blocking a decision), and tracked resolution of the intent's open questions. Every Product Owner decision is recorded with its date and rationale directly in the requirement/reserve/question it resolves.
3. **Build** (not started) — implementation, task breakdown and code. This phase does not exist yet in this repo; do not write application code or invent a tech stack unless explicitly asked to start it.

Both skill files above are the authoritative process rules — read them before acting as `intent` or `spec` on a new topic, since they specify exactly when branches may be created, when files may be written, and when commit/push/PR actions are (and are not) allowed. Key points shared by both skills:
- Never write to `intent/` without explicit human validation of the drafted content first.
- Work happens on a dedicated branch (`claude/intent-<slug>` or a Design-phase branch for spec work), never directly on `main`.
- Never commit, push, or open a pull request without explicit confirmation of that specific action; never merge a pull request.
- Each phase's document records its own "Contexte de génération": the exact invocation and the git commit of the skill version(s) used to produce it — keep this accurate when creating or revising a document.

## Repository layout

- `intent/<slug>/intent.md` — accepted product intent for feature `<slug>`.
- `intent/<slug>/spec.md` — requirements/design derived from that intent, cross-referencing it by requirement ID.
- `.claude/skills/intent/SKILL.md` — process and exact document template for the Intent phase.
- `.claude/skills/spec/SKILL.md` — process and exact document template for the Design/Spec phase.

## Current state: Mars Rover simulator

`intent/mars-rover/spec.md` is the accepted spec for a CLI simulator that reads a JSON file (map, start position, orientation, command list) and outputs the rover's final position, orientation, and any blockages, without ever executing on the real rover. Notable accepted decisions worth knowing before Build starts:
- Coordinate frame: origin (0,0) top-left, x right, y down; moving "north" decreases y. Left turn order is N → W → S → E → N.
- Map cells: 🟩/🟫 are free, 🌳/🪨 are obstacles (a map may mix both styles); map dimensions come from the JSON array shape, no separate width/height field.
- Commands are validated in full *before* any execution — an unknown command aborts with no partial result.
- Blockage causes are `"obstacle"` vs `"edge"` (map does not wrap); a blockage's reported `position` is the coordinate actually attempted, even if negative/out of bounds.
- All four error cases (unknown command, out-of-bounds start, start on obstacle, invalid/missing input file) share one error shape: `{"error": "..."}` on stdout plus a non-zero exit code.
- JSON field names are English snake_case (`map`, `start`, `orientation`, `commands`, `position`, `blockages`, `command`, `cause`); `cause` values are `"obstacle"`/`"edge"`.

See `intent/mars-rover/spec.md` for the full requirement list (EX-01 … EX-16) and their scenarios before implementing any part of this simulator.

## Erreurs récurrentes

Lorsqu’une même erreur se répète deux fois, propose une instruction courte et précise pour l’éviter. Appuie-toi sur les erreurs observées et fais valider cette instruction avant de l’ajouter à CLAUDE.md.

Si une instruction devient obsolète, propose sa correction ou son retrait et attends la validation avant de modifier le fichier.
