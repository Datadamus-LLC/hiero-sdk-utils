---
name: hiero-validate
description: "Validation skill for the hiero-sdk-utils library. Run this after any code change to verify the project compiles, tests pass, types are sound, and no quality regressions exist. Use whenever code has been written or modified — before committing, before moving to the next task, and before any audit."
---

# Hiero Validate

Run this validation sequence after every code change. Every step must pass. If any step fails, stop and fix before proceeding.

## Validation Sequence

Execute these checks in order. Each depends on the previous passing.

### Step 1: TypeScript Compilation

```bash
cd /sessions/sharp-dazzling-franklin/mnt/Hackathon/hiero-sdk-utils
npx tsc --noEmit
```

**What to look for:**
- Zero errors, zero warnings
- If there are errors, fix them before moving on — do not suppress with `@ts-ignore` or `@ts-expect-error` unless there is a documented reason

### Step 2: Lint Check

```bash
npx eslint src/ tests/ --max-warnings 0
```

**What to look for:**
- Zero errors, zero warnings
- `--max-warnings 0` is intentional — warnings are errors in this project

### Step 3: Test Execution

```bash
npx vitest run
```

**What to look for:**
- All tests pass
- No skipped tests (`.skip` is not allowed in committed code)
- No `.only` tests (they must not be committed)

### Step 4: Type Leak Scan

Search the source code for `any` type usage:

```bash
grep -rn '\bany\b' src/ --include='*.ts' | grep -v '// any-ok' | grep -v 'SPDX'
```

**What to look for:**
- Zero matches. Every instance of `any` in source files is a violation.
- The only exception is lines marked with `// any-ok` which must have a written justification

### Step 5: License Header Check

```bash
for f in $(find src/ -name '*.ts'); do
  head -1 "$f" | grep -q 'SPDX-License-Identifier: Apache-2.0' || echo "MISSING HEADER: $f"
done
```

**What to look for:**
- No files reported as missing headers

### Step 6: Export Audit

```bash
# Check that index.ts exports are clean
cat src/index.ts
```

**What to look for:**
- Only named exports (no `export default`)
- No internal types or utilities leaked to the public API
- Every resource class, every public type, and every error class is exported
- No duplicate exports

### Step 7: Silent Error Scan

```bash
grep -rn 'catch' src/ --include='*.ts' -A 3
```

**What to look for:**
- Every `catch` block either re-throws or throws a new typed error
- No empty catch blocks
- No catch blocks that only `console.log` or `console.error`
- No catch blocks that return `undefined`, `null`, or a default value without documenting why

### Step 8: Hardcode Scan

```bash
grep -rn 'mirrornode\.hedera\.com' src/ --include='*.ts' | grep -v 'types.ts' | grep -v 'client/types.ts'
```

**What to look for:**
- The only file that should contain Mirror Node URLs is the `Networks` constant in `src/client/types.ts`
- Zero matches from any other file

## Reporting

After running all steps, produce a summary:

```
VALIDATION REPORT
=================
[PASS/FAIL] TypeScript compilation
[PASS/FAIL] Lint check
[PASS/FAIL] Tests (X passed, Y failed)
[PASS/FAIL] Type leak scan (X instances of `any`)
[PASS/FAIL] License headers
[PASS/FAIL] Export audit
[PASS/FAIL] Silent error scan
[PASS/FAIL] Hardcode scan

Overall: PASS / FAIL (X/8 checks passed)
```

If any check fails, list the specific files and line numbers that need fixing. Do not proceed to the next development task until the report shows 8/8 PASS.
