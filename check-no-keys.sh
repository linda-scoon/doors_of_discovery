#!/bin/sh
# Verify that no value from .env appears anywhere in what git has staged.
# Prints only variable NAMES, never values. Run after `git add -A`,
# before `git commit`.
found=0
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  name=${line%%=*}
  value=${line#*=}
  [ -z "$value" ] && continue
  if git grep -q --cached -F -- "$value" 2>/dev/null; then
    echo "  STILL STAGED: $name"
    found=1
  fi
done < .env

if [ "$found" -eq 0 ]; then
  echo "  Clean - no .env value appears in any staged file."
else
  echo ""
  echo "  Do NOT commit. Those keys are still in the code somewhere."
  exit 1
fi

# The generated environment files must not be tracked either.
if git ls-files --cached --error-unmatch src/environments/environment.ts >/dev/null 2>&1 \
|| git ls-files --cached --error-unmatch src/environments/environment.prod.ts >/dev/null 2>&1; then
  echo "  WARNING: a generated environment file is still tracked by git."
  echo "  Run: git rm --cached src/environments/environment.ts src/environments/environment.prod.ts"
  exit 1
fi
echo "  Generated environment files are correctly untracked."
