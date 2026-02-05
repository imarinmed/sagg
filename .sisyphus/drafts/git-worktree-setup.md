# Draft: Git Worktree & Agent Swarm Setup

## Requirements Clarification

### Git Worktree Goals
- **Bare repository hub**: YES (recommended for agent swarms)
- **Worktrees for branches**: main, develop, and feature branches as needed
- **Location**: Default sibling directories under project root

### Agent Swarm Requirements
- **Agent types**: Frontend (Next.js), Backend (FastAPI), Full-stack, Data processing
- **Isolated environments**: YES - separate Python venv per worktree
- **Node.js isolation**: YES - separate node_modules per worktree
- **Concurrency**: Support 4-8 agents simultaneously

### GitHub Repository
- **Target account**: imarinmed
- **Repository name**: TBD (bats, blod-wiki, or vampire-wiki)
- **Visibility**: Likely private (given content nature)
- **Branch protection**: main branch protection recommended

### Current Project State (from AGENTS.md)
- Project: Blod Wiki (Blood, Sweat, Tears vampire wiki)
- Backend: FastAPI, Python 3.12+, uv, SQLite, Alembic
- Frontend: Next.js 15, React 19, TypeScript, Tailwind v4, HeroUI v3
- Data: YAML characters, JSON episodes, SQLite database
- Package managers: uv (backend), bun (frontend)
- Ports: Backend 8000, Frontend 6699

## Technical Decisions to Confirm

1. **Bare repo location**: `.git/` → rename to `.bare/` and create new `.git` file
2. **Worktree structure**:
   ```
   bats/                    # Bare repo (renamed from .git)
   bats-main/              # Worktree for main branch
   bats-develop/           # Worktree for develop branch
   bats-feature-*/         # Worktrees for feature branches
   ```
3. **Environment isolation**: Each worktree gets its own `.venv/` and `node_modules/`
4. **Shared data**: `data/` directory might be shared or symlinked
5. **GitHub remote**: Need to add remote and push all branches

## Open Questions (Answered)
- [x] Confirm repository name for GitHub → **sagg**
- [x] Confirm public vs private → **Private**
- [x] Confirm which branches exist and should be pushed → **main only**
- [x] Any existing remotes to preserve? → **TBD - need to check**

## Critical Gaps Identified by Metis

### Assumptions to Validate (BEFORE any operations)
1. **Git repository exists**: `/Users/wolfy/Developer/2026.Y/bats` must be a git repo
2. **Current branch**: Must verify if it's `main` or `master`
3. **Existing remote**: Check if remote already configured
4. **Uncommitted changes**: Must handle before any operations
5. **GitHub CLI auth**: Verify `gh auth status` before push
6. **SSH keys**: Verify `ssh -T git@github.com` works

### Guardrails (MUST NOT DO)
- ❌ NO force push (`--force` or `-f`)
- ❌ NO committing secrets (`.env`, credentials, API keys)
- ❌ NO committing `data/blod.db` (SQLite binary) without confirmation
- ❌ NO deleting original directory until worktrees verified
- ❌ NO large binary files without checking .gitignore
- ❌ NO CI/CD setup
- ❌ NO GitHub Actions
- ❌ NO branch protection rules
- ❌ NO README updates
- ❌ NO code changes
- ❌ NO dependency updates

### Agent Swarm Considerations
- Worktree naming: `sagg-main/` for main branch worktree
- Isolation: Each worktree needs independent `.venv/` and `node_modules/`
- Database: SQLite can't be shared (locking issues) - need strategy
- Shared data: `data/` directory - symlink or copy per worktree?
- Lock files: `uv.lock`, `bun.lockb` - gitignore for agent independence?
- Sisyphus state: `.sisyphus/` directory - commit or ignore?

### Edge Cases
- What if `imarinmed/sagg` already exists on GitHub?
- What if conversion fails mid-process? (need rollback)
- What if worktree directory already exists?
- What if files exceed GitHub's 100MB limit?

## Assumptions (can be overridden)
- Repository name: `blod-wiki` (descriptive, clean)
- Visibility: Private
- All local branches should be pushed
- Will set up branch protection for main
- Will create develop branch if doesn't exist
- Will configure worktrees for main and develop initially
