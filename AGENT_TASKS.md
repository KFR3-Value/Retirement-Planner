# AI Agent Task Tracker

This file manages asynchronous workflows between the human user and AI agents. Agents should read this file to find their next task, update the status as they work, and mark tasks for human review.

## Status Legend
- `[ ]` **Not Started**: Task is ready to be picked up by an AI agent.
- `[WIP]` **In Progress**: An agent is currently working on this task.
- `[REVIEW]` **Ready for Review**: Agent has completed the work and requires human approval.
- `[ADJUST]` **Needs Adjustment**: Human has reviewed and requested further changes.
- `[x]` **Done**: Human has approved the work and the task is fully closed.

---

## Active Epics & Tasks

### 1. Master Task: GUI Optimization
**Goal**: Optimize the Graphical User Interface to make it more intuitive, modern, and informative.

- `[REVIEW]` **1.1 Analysis**: Analyze the current GUI situation and describe its strengths, weaknesses, and structural layout.
- `[ ]` **1.2 Proposals**: Formulate concrete suggestions and design adjustments based on the analysis. *(Requires Review before moving to implementation)*
- `[ ]` **1.3 Implementation**: Execute the approved design changes in the codebase.
- `[ ]` **1.4 Review & Verification**: Thoroughly review the implemented changes, ensuring no regressions and validating against the proposals.
- `[ ]` **1.5 Deployment**: Ship the finalized GUI to production.

### 2. Master Task: Tax Module Audit and Enhancement
**Goal**: Ensure the tax module logic is correct, stable, and easily auditable by analysts, and display total tax paid over the planning period on the dashboard.

- `[x]` **2.1 Status Quo Analysis**: Analyze the current implementation of the tax module and identify how calculations are performed and presented.
- `[x]` **2.2 Tax Logic Validation**: Conduct internet research to challenge the current logic, verifying its correctness and stability against real-world tax logic.
- `[x]` **2.3 Improvement Proposals**: Formulate suggestions on how to better implement the tax module and how to improve the UI visualization for analysts to audit the outputs effectively.
- `[x]` **2.4 Dashboard Enhancement**: Add a variable in the dashboard showing the total sum of tax paid for the entire planning period.
- `[x]` **2.5 Implementation**: Execute the approved tax logic/visualization changes and dashboard updates.
- `[x]` **2.6 Review & Verification**: Test the new tax module outputs and dashboard variables for accuracy.

---

## Archive (Completed Master Tasks)
*(Move fully completed Master Tasks here to keep the Active section clean)*
