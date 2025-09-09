# 🧄 /peel

Load relevant context for the current conversation.

## Auto-Loaded Context:

@CLAUDE.md
@layers/structure.md
@llms.txt

User arguments: "$ARGUMENTS"

## Steps

### 1. Parse Work Area

- Analyze user request or arguments
- Determine relevant components or features
- Assess required context depth

### 2. Load Targeted Context

- Read `llms.txt` to understand engine usage patterns
- Read relevant `context.md` files for identified areas
- Skip unrelated component contexts to minimize tokens

### 3. Confirm Scope

- Brief summary of loaded context
- State understanding of work focus
- Note any assumptions made

## Guidelines

- Load only what's needed for the current task
- Defer code reading until necessary
