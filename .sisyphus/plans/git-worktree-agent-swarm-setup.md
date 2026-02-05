# Git Worktree & Agent Swarm Setup for Blod Wiki

## TL;DR

> **Quick Summary**: Convert the existing Blod Wiki git repository to a bare repository with worktrees for agent swarm development, commit all changes, and push to GitHub (imarinmed/sagg) as a private repository.
>
> **Deliverables**:
> - Bare git repository hub at `/Users/wolfy/Developer/2026.Y/bats.git/`
> - Main branch worktree at `/Users/wolfy/Developer/2026.Y/sagg-main/`
> - Private GitHub repository `imarinmed/sagg`
> - All changes committed and pushed
> - Supermemory initialized for project continuity
> - Agent swarm configuration files
>
> **Estimated Effort**: Medium (7-10 tasks)
> **Parallel Execution**: NO - Sequential git operations required
> **Critical Path**: Validate → Backup → Convert → Create Remote → Push → Setup Worktree

---

## Context

### Original Request
Set up the project for git worktrees and agent swarms, commit and push to GitHub imarinmed account.

### Interview Summary
**Key Decisions**:
- Repository name: `sagg` (user's choice)
- Visibility: Private
- Worktree branches: main only (simpler setup)
- High accuracy mode: Yes (Momus review required)

**Research Findings** (from AGENTS.md):
- Project: Blod Wiki (Blood, Sweat, Tears vampire wiki)
- Backend: FastAPI, Python 3.12+, uv, SQLite, Alembic
- Frontend: Next.js 15, React 19, TypeScript, Tailwind v4, HeroUI v3
- Data: YAML characters, JSON episodes, SQLite database
- Package managers: uv (backend), bun (frontend)
- Ports: Backend 8000, Frontend 6699
- Substantial development work already completed (11/13 temporal visualization files)

### Metis Review
**Identified Gaps** (addressed in this plan):
- Must validate git state BEFORE any operations
- Must backup before bare conversion
- Must verify GitHub authentication
- Must handle uncommitted changes first
- Must NOT commit secrets, database, or large binaries
- Must handle SQLite database strategy (can't share across worktrees)
- Must verify SSH keys work for GitHub

---

## Work Objectives

### Core Objective
Convert the existing git repository to a bare repository with worktrees, ensuring agent swarm compatibility with isolated environments per worktree, then commit all changes and push to GitHub.

### Concrete Deliverables
1. Bare repository at `/Users/wolfy/Developer/2026.Y/bats.git/`
2. Main branch worktree at `/Users/wolfy/Developer/2026.Y/sagg-main/`
3. Private GitHub repository `imarinmed/sagg`
4. Updated `.gitignore` with worktree exclusions
5. Agent swarm configuration (`.agentrc` or similar)
6. Supermemory initialized with project knowledge
7. All local commits pushed to origin/main

### Definition of Done
- [ ] `gh repo view imarinmed/sagg` shows private repository
- [ ] `git -C /Users/wolfy/Developer/2026.Y/sagg-main status` shows "On branch main"
- [ ] `git -C /Users/wolfy/Developer/2026.Y/sagg-main log origin/main -1` shows latest commit
- [ ] Supermemory shows project initialized
- [ ] Worktree has isolated `.venv/` and `node_modules/`

### Must Have
- Bare repository conversion completed successfully
- Main branch worktree functional
- GitHub remote configured and push successful
- All uncommitted changes committed
- Supermemory initialized

### Must NOT Have (Guardrails from Metis)
- ❌ Force push (`--force` or `-f`)
- ❌ Secrets committed (`.env`, credentials, API keys)
- ❌ `data/blod.db` committed without explicit confirmation
- ❌ Original directory deleted before worktree verification
- ❌ Large binary files (>100MB) committed
- ❌ CI/CD setup
- ❌ GitHub Actions configuration
- ❌ Branch protection rules
- ❌ README updates
- ❌ Code changes
- ❌ Dependency updates

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (git repo exists)
- **Automated tests**: NO (not applicable for infrastructure setup)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY)

**Scenario 1: GitHub Repository Exists and is Private**
```
Tool: Bash (gh CLI)
Preconditions: GitHub CLI authenticated
Steps:
  1. Run: gh repo view imarinmed/sagg --json name,visibility,owner
  2. Assert: name equals "sagg"
  3. Assert: visibility equals "PRIVATE"
  4. Assert: owner.login equals "imarinmed"
Expected Result: Repository exists and is private
Evidence: Terminal output captured
```

**Scenario 2: Bare Repository Created**
```
Tool: Bash
Preconditions: Conversion completed
Steps:
  1. Run: test -d /Users/wolfy/Developer/2026.Y/bats.git && echo "EXISTS" || echo "MISSING"
  2. Assert: Output equals "EXISTS"
  3. Run: git -C /Users/wolfy/Developer/2026.Y/bats.git rev-parse --is-bare-repository
  4. Assert: Output equals "true"
Expected Result: Bare repository exists at expected path
Evidence: Terminal output captured
```

**Scenario 3: Main Worktree Functional**
```
Tool: Bash
Preconditions: Worktree created
Steps:
  1. Run: cd /Users/wolfy/Developer/2026.Y/sagg-main && git status
  2. Assert: Output contains "On branch main"
  3. Assert: Output contains "working tree clean"
  4. Run: git remote get-url origin
  5. Assert: Output contains "imarinmed/sagg"
Expected Result: Worktree on main branch with clean working tree
Evidence: Terminal output captured
```

**Scenario 4: Push Successful**
```
Tool: Bash
Preconditions: Commits made and remote configured
Steps:
  1. Run: cd /Users/wolfy/Developer/2026.Y/sagg-main && git log --oneline origin/main -1
  2. Run: git log --oneline main -1
  3. Assert: Both outputs show same commit SHA
Expected Result: Local main and origin/main are in sync
Evidence: Terminal output captured
```

**Scenario 5: Supermemory Initialized**
```
Tool: Bash (supermemory CLI)
Preconditions: Supermemory configured
Steps:
  1. Run: supermemory profile
  2. Assert: Output shows project context
  3. Run: supermemory list --scope project
  4. Assert: Output contains entries for Blod Wiki
Expected Result: Supermemory has project knowledge
Evidence: Terminal output captured
```

**Scenario 6: Environment Isolation**
```
Tool: Bash
Preconditions: Dependencies installed in worktree
Steps:
  1. Run: cd /Users/wolfy/Developer/2026.Y/sagg-main/backend && source .venv/bin/activate && which python
  2. Assert: Path contains "sagg-main/backend/.venv"
  3. Run: cd /Users/wolfy/Developer/2026.Y/sagg-main/frontend && ls node_modules/.bin/bun 2>/dev/null && echo "EXISTS" || echo "MISSING"
  4. Assert: Output equals "EXISTS"
Expected Result: Isolated environments in worktree
Evidence: Terminal output captured
```

---

## Execution Strategy

### Sequential Execution (Git Operations Cannot Parallelize)

```
Wave 1 (Validation - Must Complete First):
└── Task 1: Validate current git state

Wave 2 (Preparation):
└── Task 2: Backup and prepare for conversion

Wave 3 (Conversion):
└── Task 3: Convert to bare repository with worktree

Wave 4 (GitHub Setup):
├── Task 4: Create GitHub repository
└── Task 5: Configure remote and push

Wave 5 (Configuration):
├── Task 6: Update .gitignore for worktrees
├── Task 7: Create agent swarm configuration
└── Task 8: Initialize Supermemory

Wave 6 (Verification):
└── Task 9: Verify complete setup

Critical Path: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 9
```

---

## TODOs

- [ ] 1. Validate Current Git State

  **What to do**:
  - Check if current directory is a git repository
  - Check current branch name (main vs master)
  - Check for existing remotes
  - Check for uncommitted changes
  - Check GitHub CLI authentication status
  - Check SSH key authentication to GitHub
  - List all local branches

  **Must NOT do**:
  - Do NOT proceed if not a git repository
  - Do NOT proceed if critical validation fails

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `git-master`
  - Reason: Simple validation task requiring git commands

  **Parallelization**:
  - **Can Run In Parallel**: NO (first task)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `git rev-parse --git-dir` returns path
  - [ ] `git branch --show-current` returns branch name
  - [ ] `git remote -v` shows current remotes (if any)
  - [ ] `git status` shows working tree status
  - [ ] `gh auth status` shows authenticated
  - [ ] `ssh -T git@github.com` succeeds
  - [ ] `git branch -a` lists all branches

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Git state validated successfully
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: git rev-parse --git-dir
      2. Assert: Exit code 0, output contains ".git"
      3. Run: git branch --show-current
      4. Assert: Output is "main" or "master"
      5. Run: gh auth status 2>&1 | head -5
      6. Assert: Output contains "Logged in"
      7. Run: ssh -T git@github.com 2>&1 | head -1
      8. Assert: Output contains "successfully authenticated"
    Expected Result: All validations pass
    Evidence: Terminal output captured
  ```

  **Commit**: NO

---

- [ ] 2. Backup Current State

  **What to do**:
  - Create backup branch from current state
  - Stash any uncommitted changes (if needed)
  - Document current remotes for reference
  - Ensure all important work is saved

  **Must NOT do**:
  - Do NOT delete anything
  - Do NOT modify history

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `git-master`
  - Reason: Simple git operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **Acceptance Criteria**:
  - [ ] Backup branch `pre-worktree-backup` created
  - [ ] All uncommitted changes committed or stashed
  - [ ] Current state documented

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Backup created successfully
    Tool: Bash
    Preconditions: Task 1 completed
    Steps:
      1. Run: git branch | grep pre-worktree-backup
      2. Assert: Output contains "pre-worktree-backup"
      3. Run: git status
      4. Assert: Output contains "working tree clean" or "nothing to commit"
    Expected Result: Backup exists and working tree is clean
    Evidence: Terminal output captured
  ```

  **Commit**: NO

---

- [ ] 3. Convert to Bare Repository with Worktree

  **What to do**:
  - Move `.git` directory to `bats.git` (bare repository)
  - Create `.git` file pointing to bare repo
  - Create worktree for main branch at `../sagg-main/`
  - Configure bare repository to recognize worktree
  - Verify worktree is functional

  **Must NOT do**:
  - Do NOT delete original `.git` until bare repo verified
  - Do NOT proceed if worktree creation fails

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `git-master`
  - Reason: Complex git operations requiring expertise

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 4, Task 5
  - **Blocked By**: Task 2

  **References**:
  - Git worktree documentation: `git worktree --help`
  - Pattern: Convert existing repo to bare with worktrees

  **Acceptance Criteria**:
  - [ ] Bare repo exists at `/Users/wolfy/Developer/2026.Y/bats.git/`
  - [ ] Original directory has `.git` file (not directory)
  - [ ] Worktree created at `/Users/wolfy/Developer/2026.Y/sagg-main/`
  - [ ] Worktree shows "On branch main" in git status
  - [ ] Can run git commands from worktree

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Bare repository and worktree created
    Tool: Bash
    Preconditions: Task 2 completed
    Steps:
      1. Run: test -d /Users/wolfy/Developer/2026.Y/bats.git && echo "BARE_EXISTS"
      2. Assert: Output equals "BARE_EXISTS"
      3. Run: test -f /Users/wolfy/Developer/2026.Y/bats/.git && echo "GITFILE_EXISTS"
      4. Assert: Output equals "GITFILE_EXISTS"
      5. Run: test -d /Users/wolfy/Developer/2026.Y/sagg-main && echo "WORKTREE_EXISTS"
      6. Assert: Output equals "WORKTREE_EXISTS"
      7. Run: git -C /Users/wolfy/Developer/2026.Y/sagg-main status | head -1
      8. Assert: Output contains "On branch main"
    Expected Result: Bare repo, .git file, and worktree all exist and functional
    Evidence: Terminal output captured
  ```

  **Commit**: NO

---

- [ ] 4. Create GitHub Repository

  **What to do**:
  - Use `gh repo create` to create private repository `imarinmed/sagg`
  - Do NOT initialize with README (we have existing code)
  - Verify repository created successfully

  **Must NOT do**:
  - Do NOT create as public
  - Do NOT initialize with README, .gitignore, or license
  - Do NOT use web interface (use CLI for consistency)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `git-master`
  - Reason: Simple CLI operation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **Acceptance Criteria**:
  - [ ] Repository `imarinmed/sagg` created on GitHub
  - [ ] Repository is private
  - [ ] Repository is empty (no README, no initial commit)
  - [ ] `gh repo view imarinmed/sagg` succeeds

  **Agent-Executed QA Scenario**:
  ```
  Scenario: GitHub repository created
    Tool: Bash (gh CLI)
    Preconditions: Task 3 completed, gh authenticated
    Steps:
      1. Run: gh repo create imarinmed/sagg --private --confirm 2>&1
      2. Assert: Exit code 0 or "already exists" message
      3. Run: gh repo view imarinmed/sagg --json name,visibility
      4. Assert: JSON output shows name="sagg", visibility="PRIVATE"
    Expected Result: Repository exists and is private
    Evidence: Terminal output captured
  ```

  **Commit**: NO

---

- [ ] 5. Configure Remote and Push

  **What to do**:
  - Add GitHub remote to bare repository
  - Push all branches to origin
  - Push all tags to origin
  - Set upstream tracking for main branch
  - Verify push succeeded

  **Must NOT do**:
  - Do NOT force push
  - Do NOT push if remote already has different history

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `git-master`
  - Reason: Critical git operations, must handle edge cases

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 6, Task 7, Task 8
  - **Blocked By**: Task 4

  **Acceptance Criteria**:
  - [ ] Remote `origin` configured pointing to `git@github.com:imarinmed/sagg.git`
  - [ ] All local branches pushed to origin
  - [ ] All tags pushed to origin
  - [ ] `git log origin/main` shows same commits as `git log main`

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Push to GitHub successful
    Tool: Bash
    Preconditions: Task 4 completed
    Steps:
      1. Run: cd /Users/wolfy/Developer/2026.Y/sagg-main && git remote get-url origin
      2. Assert: Output contains "github.com:imarinmed/sagg"
      3. Run: git push -u origin main 2>&1
      4. Assert: Exit code 0
      5. Run: git log --oneline origin/main -1
      6. Run: git log --oneline main -1
      7. Assert: Both show same commit SHA
    Expected Result: Remote configured and push successful
    Evidence: Terminal output captured
  ```

  **Commit**: NO

---

- [ ] 6. Update .gitignore for Worktrees

  **What to do**:
  - Review current `.gitignore`
  - Add worktree-specific exclusions:
    - `*.worktree` (if any)
    - `.venv/` (per worktree)
    - `node_modules/` (per worktree)
    - `.env*` (environment files)
    - `*.db` (SQLite databases)
    - `.sisyphus/drafts/` (working drafts)
  - Ensure `data/blod.db` is excluded
  - Ensure large binaries are excluded

  **Must NOT do**:
  - Do NOT remove existing ignore rules
  - Do NOT ignore `.sisyphus/plans/` (keep these)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple file editing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 7
  - **Blocked By**: Task 5

  **References**:
  - Current `.gitignore` at repository root

  **Acceptance Criteria**:
  - [ ] `.gitignore` updated with worktree exclusions
  - [ ] `data/blod.db` is excluded
  - [ ] `.env*` files are excluded
  - [ ] `node_modules/` and `.venv/` are excluded
  - [ ] Changes committed

  **Agent-Executed QA Scenario**:
  ```
  Scenario: .gitignore properly configured
    Tool: Bash
    Preconditions: Task 5 completed
    Steps:
      1. Run: cat /Users/wolfy/Developer/2026.Y/sagg-main/.gitignore | grep -E "(\.venv/|node_modules/|\.env\*|\.db)"
      2. Assert: Output contains all required patterns
      3. Run: git -C /Users/wolfy/Developer/2026.Y/sagg-main check-ignore data/blod.db 2>&1 && echo "IGNORED" || echo "NOT_IGNORED"
      4. Assert: Output equals "IGNORED"
    Expected Result: .gitignore properly excludes worktree and sensitive files
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `chore(git): update .gitignore for worktree setup`
  - Files: `.gitignore`
  - Pre-commit: `git status` to verify

---

- [ ] 7. Create Agent Swarm Configuration

  **What to do**:
  - Create `.agentrc` or similar configuration file
  - Document worktree structure for agents
  - Define environment isolation strategy
  - Document database strategy (SQLite per worktree)
  - Add to repository

  **Must NOT do**:
  - Do NOT create complex orchestration configs
  - Do NOT add secrets to config

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []
  - Reason: Documentation task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 8
  - **Blocked By**: Task 6

  **Acceptance Criteria**:
  - [ ] `.agentrc` or `AGENTS.md` worktree section created
  - [ ] Worktree paths documented
  - [ ] Environment isolation documented
  - [ ] Database strategy documented
  - [ ] Changes committed

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Agent configuration created
    Tool: Bash
    Preconditions: Task 6 completed
    Steps:
      1. Run: test -f /Users/wolfy/Developer/2026.Y/sagg-main/.agentrc && echo "AGENTRC_EXISTS" || echo "AGENTRC_MISSING"
      2. Assert: Output equals "AGENTRC_EXISTS"
      3. Run: grep -E "(worktree|sagg-main|isolation)" /Users/wolfy/Developer/2026.Y/sagg-main/.agentrc | wc -l
      4. Assert: Output is greater than 0
    Expected Result: Agent config exists with worktree documentation
    Evidence: Terminal output captured
  ```

  **Commit**: YES (or group with Task 6)
  - Message: `docs(agents): add worktree configuration for agent swarms`
  - Files: `.agentrc` or `AGENTS.md`

---

- [ ] 8. Initialize Supermemory

  **What to do**:
  - Initialize Supermemory for project
  - Add key project knowledge:
    - Project structure
    - Tech stack
    - Ports and commands
    - Worktree setup
  - Verify initialization

  **Must NOT do**:
  - Do NOT add sensitive information

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple CLI operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 9
  - **Blocked By**: Task 7

  **Acceptance Criteria**:
  - [ ] Supermemory initialized
  - [ ] Project context added
  - [ ] Worktree info added
  - [ ] `supermemory profile` shows project

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Supermemory initialized with project knowledge
    Tool: Bash
    Preconditions: Task 7 completed
    Steps:
      1. Run: supermemory add --scope project --type project-config "Blod Wiki project with FastAPI backend and Next.js frontend. Worktree setup at sagg-main/"
      2. Assert: Exit code 0
      3. Run: supermemory list --scope project | grep -i "blod\|worktree" | wc -l
      4. Assert: Output is greater than 0
    Expected Result: Supermemory has project knowledge
    Evidence: Terminal output captured
  ```

  **Commit**: NO (Supermemory is external)

---

- [ ] 9. Verify Complete Setup

  **What to do**:
  - Run comprehensive verification of all components
  - Verify GitHub repository
  - Verify bare repository
  - Verify worktree
  - Verify push
  - Verify Supermemory
  - Document any issues

  **Must NOT do**:
  - Do NOT skip verification steps

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Verification commands

  **Parallelization**:
  - **Can Run In Parallel**: NO (final task)
  - **Blocks**: None
  - **Blocked By**: Task 8

  **Acceptance Criteria**:
  - [ ] All QA scenarios pass
  - [ ] GitHub repo exists and is private
  - [ ] Bare repo functional
  - [ ] Worktree functional
  - [ ] Push successful
  - [ ] Supermemory initialized

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Complete setup verification
    Tool: Bash
    Preconditions: All previous tasks completed
    Steps:
      1. Run: gh repo view imarinmed/sagg --json name,visibility | grep -E '"name"|"visibility"'
      2. Assert: Output contains "sagg" and "PRIVATE"
      3. Run: git -C /Users/wolfy/Developer/2026.Y/bats.git rev-parse --is-bare-repository
      4. Assert: Output equals "true"
      5. Run: git -C /Users/wolfy/Developer/2026.Y/sagg-main status | head -1
      6. Assert: Output contains "On branch main"
      7. Run: git -C /Users/wolfy/Developer/2026.Y/sagg-main log origin/main..main --oneline | wc -l
      8. Assert: Output equals "0" (no unpushed commits)
    Expected Result: All components verified working
    Evidence: Terminal output captured
  ```

  **Commit**: NO

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 6 | `chore(git): update .gitignore for worktree setup` | `.gitignore` | `git status` |
| 7 | `docs(agents): add worktree configuration for agent swarms` | `.agentrc` or `AGENTS.md` | `git status` |

---

## Success Criteria

### Verification Commands
```bash
# 1. GitHub repository exists and is private
gh repo view imarinmed/sagg --json name,visibility
# Expected: {"name":"sagg","visibility":"PRIVATE"}

# 2. Bare repository exists
git -C /Users/wolfy/Developer/2026.Y/bats.git rev-parse --is-bare-repository
# Expected: true

# 3. Worktree functional
git -C /Users/wolfy/Developer/2026.Y/sagg-main status | head -1
# Expected: On branch main

# 4. Push successful
git -C /Users/wolfy/Developer/2026.Y/sagg-main log origin/main..main --oneline
# Expected: (empty - no output)

# 5. Supermemory initialized
supermemory list --scope project | grep -c "blod\|worktree"
# Expected: >0

# 6. Environment isolation
cd /Users/wolfy/Developer/2026.Y/sagg-main/backend && test -d .venv && echo "VENV_OK"
cd /Users/wolfy/Developer/2026.Y/sagg-main/frontend && test -d node_modules && echo "NODE_OK"
```

### Final Checklist
- [ ] GitHub repository `imarinmed/sagg` exists and is private
- [ ] Bare repository at `/Users/wolfy/Developer/2026.Y/bats.git/` functional
- [ ] Worktree at `/Users/wolfy/Developer/2026.Y/sagg-main/` functional
- [ ] All changes committed and pushed to origin/main
- [ ] `.gitignore` updated for worktree exclusions
- [ ] Agent configuration documented
- [ ] Supermemory initialized with project knowledge
- [ ] No secrets committed
- [ ] No database files committed
- [ ] Original backup branch exists
