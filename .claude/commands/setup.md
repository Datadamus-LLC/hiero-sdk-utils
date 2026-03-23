# /setup — Project & Git Initialization

You are setting up the `hiero-sdk-utils` project from scratch. This command runs ONCE at the very beginning, before any `/build` calls. It initializes git, configures GPG signing, sets up DCO sign-off, and creates the GitHub repository.

## Step 1: Read the Rules First

Read `.claude/skills/hiero-rule-enforcer/SKILL.md` to understand all Hiero contribution requirements.

## Step 2: Initialize Git Repository

```bash
cd /path/to/hiero-sdk-utils
git init
git branch -m main
```

## Step 3: Configure Git Identity

Use the project owner's identity:

```bash
git config user.name "Dmitrij Titarenko"
git config user.email "dtytarenko666@gmail.com"
```

## Step 4: Generate GPG Key

Hiero requires GPG-signed commits. Generate a key if one doesn't exist:

```bash
# Check for existing keys
gpg --list-secret-keys --keyid-format=long

# If no key exists, generate one:
gpg --batch --gen-key <<EOF2
%no-protection
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Dmitrij Titarenko
Name-Email: dtytarenko666@gmail.com
Expire-Date: 0
%commit
EOF2
```

Then configure git to use it:

```bash
# Get the key ID
KEY_ID=$(gpg --list-secret-keys --keyid-format=long | grep -A1 'sec' | grep -oP '[A-F0-9]{16}')

# Configure git to sign with this key
git config user.signingkey "$KEY_ID"
git config commit.gpgsign true

# Export public key — user must add this to GitHub Settings > SSH and GPG keys
gpg --armor --export "$KEY_ID"
```

**IMPORTANT**: Print the public key and tell the user:
> "Copy this GPG public key and add it to GitHub:
> GitHub → Settings → SSH and GPG keys → New GPG key → paste it"

## Step 5: Configure DCO Sign-off

Hiero requires Developer Certificate of Origin sign-off on every commit. Verify the sign-off matches git identity:

```bash
# These must match exactly
echo "Git config: $(git config user.name) <$(git config user.email)>"
echo "Sign-off will be: Signed-off-by: $(git config user.name) <$(git config user.email)>"
```

## Step 6: Create .gitignore

```bash
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/

# Build output
dist/

# Environment
.env
.env.*
!.env.example

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# Logs
*.log
npm-debug.log*
GITIGNORE
```

## Step 7: Create GitHub Repository

```bash
# Create the repo on GitHub (public, no wiki, no issues template)
gh repo create dmitrijtitarenko/hiero-sdk-utils \
  --public \
  --description "TypeScript utilities for Hedera/Hiero Mirror Node — typed queries, auto-pagination, and developer helpers" \
  --license Apache-2.0

# Set remote
git remote add origin https://github.com/dmitrijtitarenko/hiero-sdk-utils.git
```

If `gh` CLI is not available, tell the user to create the repo manually on GitHub and provide the remote URL.

## Step 8: Initial Commit

Create the initial commit with just the `.gitignore` and `.claude/` skills:

```bash
git add .gitignore
git commit -S -s -m "$(cat <<'EOF'
chore: initialize repository

Set up .gitignore for Node.js/TypeScript project.

Signed-off-by: Dmitrij Titarenko <dtytarenko666@gmail.com>
EOF
)"
```

## Step 9: Verify Everything Works

```bash
# Verify commit is signed
git log --show-signature -1

# Verify sign-off is present
git log -1 | grep 'Signed-off-by'

# Verify remote is set
git remote -v
```

## Step 10: Report

```
SETUP COMPLETE
==============
Git initialized: yes
GPG key created: [key ID]
GPG signing enabled: yes
DCO sign-off configured: yes
GitHub repo created: [yes/manual needed]
Remote set: origin → https://github.com/dmitrijtitarenko/hiero-sdk-utils.git
Initial commit: [hash]

GPG PUBLIC KEY (add to GitHub):
[key block]

NEXT: Run /build to start Phase 1 (project scaffolding)
```
