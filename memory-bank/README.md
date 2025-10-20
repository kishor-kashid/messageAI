# MessageAI MVP - Memory Bank

**Last Updated:** October 20, 2025  
**Project Status:** Pre-Development

---

## About This Memory Bank

This Memory Bank serves as the complete knowledge base for the MessageAI MVP project. Since AI context resets between sessions, these documents ensure continuity and provide all necessary context to resume work at any time.

---

## Core Files (Read These First)

### 1. [projectbrief.md](./projectbrief.md)
**Purpose:** Foundation document that defines the project  
**Contains:**
- Project vision and philosophy
- Success criteria
- Scope boundaries (in/out)
- Key constraints
- Primary user stories
- Technical foundation

**Read this first** - It shapes all other documents.

---

### 2. [productContext.md](./productContext.md)
**Purpose:** Why this project exists and how it should work  
**Contains:**
- Problems we're solving
- User experience flow
- Performance targets
- Design principles
- Key metrics

**Read this** to understand the "why" behind decisions.

---

### 3. [activeContext.md](./activeContext.md) ⚡ **UPDATE FREQUENTLY**
**Purpose:** Current work focus and recent changes  
**Contains:**
- Current phase and progress
- What we just completed
- Active work focus
- Recent decisions
- Known challenges
- Next actions

**Read this** at the start of every session.  
**Update this** after significant milestones.

---

### 4. [systemPatterns.md](./systemPatterns.md)
**Purpose:** Architecture and technical patterns  
**Contains:**
- Architecture overview
- Key technical decisions
- Design patterns in use
- Component relationships
- Data flows
- Security patterns

**Read this** before implementing new features.

---

### 5. [techContext.md](./techContext.md)
**Purpose:** Technologies and development setup  
**Contains:**
- Complete tech stack
- Development setup instructions
- Database schema
- Dependencies
- Environment variables
- Build & deployment

**Read this** when setting up or troubleshooting.

---

### 6. [progress.md](./progress.md) ⚡ **UPDATE FREQUENTLY**
**Purpose:** What works and what's left to build  
**Contains:**
- Overall progress percentage
- Completed PRs
- Remaining work
- Testing status
- Known issues
- Blockers

**Read this** to understand current status.  
**Update this** after completing each PR.

---

## Project Intelligence (.cursor/rules/)

The `.cursor/rules/` directory contains rule files that capture project-specific patterns and best practices:

### [base.mdc](../.cursor/rules/base.mdc)
Core project rules, code patterns, naming conventions, and common pitfalls

### [testing.mdc](../.cursor/rules/testing.mdc)
Testing standards, patterns, mocking strategies, and test structure

### [firebase.mdc](../.cursor/rules/firebase.mdc)
Firebase-specific patterns, collections structure, security rules, and performance tips

### [offline-sync.mdc](../.cursor/rules/offline-sync.mdc)
Offline-first architecture, sync logic, queue management, and conflict resolution

---

## How to Use This Memory Bank

### Starting a New Session
1. Read `activeContext.md` - Know where we are
2. Read `progress.md` - Know what's done
3. Review relevant rule files for the feature you're working on
4. Begin work

### During Development
- Reference `systemPatterns.md` for architecture decisions
- Reference `techContext.md` for implementation details
- Reference `.cursor/rules/` for specific patterns
- Keep code consistent with established patterns

### After Completing Work
1. Update `activeContext.md` with what changed
2. Update `progress.md` with completion status
3. Update other files if architecture or patterns changed
4. Document new patterns in `.cursor/rules/` if discovered

### When Stuck
1. Check `systemPatterns.md` for established patterns
2. Check `.cursor/rules/` for specific guidance
3. Check `techContext.md` for technical constraints
4. Review `projectbrief.md` to stay aligned with goals

---

## Memory Bank Hierarchy

```mermaid
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]
    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC
    AC --> P[progress.md]
```

**projectbrief.md** is the foundation - all other files reference it.

---

## File Update Frequency

| File | Update Frequency | Trigger |
|------|------------------|---------|
| `projectbrief.md` | Rarely | Scope changes only |
| `productContext.md` | Rarely | UX/product decisions |
| `activeContext.md` | **Frequently** | After each PR or significant work |
| `systemPatterns.md` | Occasionally | New patterns discovered |
| `techContext.md` | Occasionally | Tech stack changes |
| `progress.md` | **Frequently** | After completing each PR |
| `.cursor/rules/*.mdc` | As needed | New patterns or learnings |

---

## Quick Reference

### Project Info
- **Timeline:** 24 hours (Tuesday deadline)
- **Language:** JavaScript (not TypeScript)
- **Platform:** React Native + Expo
- **Backend:** Firebase
- **Focus:** Messaging reliability first

### Current Phase
- Pre-Development (ready to start PR #1)

### Critical Path
1. PR #1: Project Setup (1 hour)
2. PR #2: Authentication (2.5 hours)
3. PR #3: Local Database (1.5 hours)
4. PR #6: Messaging (3.5 hours)
5. PR #11: Offline Sync (2.5 hours)

### Test Coverage Target
- >70% coverage on critical modules
- 6 unit test files + 4 integration test files

---

## Related Documents

**In Project Root:**
- `messageai-prd.md` - Full Product Requirements Document
- `messageai-task-list.md` - Detailed 16-PR breakdown
- `README.md` - Project overview (to be expanded)

**The Memory Bank consolidates and organizes information from these documents into a more structured, AI-friendly format.**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 20, 2025 | Initial Memory Bank created |

---

**Remember:** After each session reset, read ALL Memory Bank files before continuing work. They are your only link to previous decisions and progress.

