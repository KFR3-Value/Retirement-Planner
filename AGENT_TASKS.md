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

### 3. Master Task: Income Variables & AHV Scenarios
**Goal**: Enhance income planning with precise temporal controls and implement multiple AHV withdrawal scenarios.

- `[x]` **3.1 Detailed Income Phasing**: Implement detailed month inputs for all income variables to specify exactly when they start and end.
- `[ ]` **3.2 Rente End Dates**: Add the option to specify an end date for any Rente (pension) stream.
- `[x]` **3.3 AHV Scenarios**: Implement 3 distinct AHV scenarios (Monique drawing 3 years prior, User on 64th birthday, User 1 year later) and accurately reflect their impact on the AHV rent as specified in the underlying data.
- `[ ]` **3.4 Tragbarkeitsrechner**: Implement a mortgage affordability calculator (Tragbarkeitsrechner) to display year-by-year whether bank affordability criteria are met.

### 4. Master Task: Scenario & Sensitivity Analysis
**Goal**: Build advanced analytical capabilities to simulate different pension withdrawal strategies and track specific wealth KPIs under varying conditions.

- `[ ]` **4.1 Wealth Definitions Refactoring**: Implement two explicit definitions of wealth across the platform: "Total Vermögen" (including pension fund capital) and "Liquid Vermögen" (strictly liquid assets).
- `[ ]` **4.2 Sensitivity Analysis Module**: Build a sensitivity analysis tool to evaluate the impact of different Pensionskasse Rente vs. Kapital splits.
- `[ ]` **4.3 Scenario KPIs**: Implement comparative KPIs for the analysis, specifically tracking "Net Wealth per 2045" (for both wealth definitions) and the "Risk/Probability of dropping below starting wealth".

---

## Archive (Completed Master Tasks)
*(Move fully completed Master Tasks here to keep the Active section clean)*
