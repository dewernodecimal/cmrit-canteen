#!/usr/bin/env python3
import os
import subprocess
import sys

# Set standard output to UTF-8 on Windows if supported, else fallback to ascii characters
if sys.platform.startswith('win'):
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'replace')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'replace')
    except Exception:
        pass

def print_banner():
    print("=" * 65)
    print(" [SECURE] GIT DETECTIVE: SECRET CONFIGURATION & ENVIRONMENT AUDIT")
    print("=" * 65)

def run_git_command(args):
    """Helper function to execute a git command and return stdout/stderr."""
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except FileNotFoundError:
        print("[ERROR] 'git' executable not found. Make sure Git is installed and in your PATH.")
        sys.exit(1)

def audit_git_repository():
    # 1. Check if inside git repo
    code, out, _ = run_git_command(["rev-parse", "--is-inside-work-tree"])
    if code != 0 or out != "true":
        print("[ERROR] Current directory is not a Git repository.")
        sys.exit(1)

    print("\n>>> Step 1: Checking .gitignore definitions...")
    gitignore_path = ".gitignore"
    env_files = [".env", ".env.local", ".env.production", ".env.development"]
    ignored_status = {f: False for f in env_files}

    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        for line in lines:
            line_cleaned = line.strip()
            # Skip comments or empty lines
            if not line_cleaned or line_cleaned.startswith("#"):
                continue
            
            for f in env_files:
                # Match exact pattern or wildcard pattern
                if f in line_cleaned or "*" in line_cleaned:
                    ignored_status[f] = True

        for f, is_ignored in ignored_status.items():
            if is_ignored:
                print(f"  [OK] '{f}' is listed in .gitignore.")
            else:
                print(f"  [WARNING] '{f}' is NOT explicitly listed in .gitignore.")
    else:
        print("  [ERROR] No .gitignore file found in the root directory!")

    # 2. Check if currently tracked in git index (cached)
    print("\n>>> Step 2: Checking Git Index (cached files)...")
    any_cached = False
    for f in env_files:
        code, out, _ = run_git_command(["ls-files", f])
        if code == 0 and out:
            print(f"  [ALERT] '{f}' is tracked in the Git Index! (It will be committed if changed).")
            any_cached = True
        else:
            print(f"  [OK] '{f}' is not tracked in the Git index.")

    # 3. Check historical commits
    print("\n>>> Step 3: Auditing Git commit history for leaked secrets...")
    leaked_history = []
    for f in env_files:
        # Check commits touching this path
        code, out, _ = run_git_command(["log", "--all", "--full-history", "--oneline", "--", f])
        if code == 0 and out:
            print(f"  [LEAK DETECTED] Found commits historically touching '{f}'!")
            lines = out.split("\n")
            for line in lines[:5]:  # print first 5 commits
                print(f"     -> {line}")
            if len(lines) > 5:
                print(f"     ... and {len(lines) - 5} more commits.")
            leaked_history.append(f)
        else:
            print(f"  [OK] No historical commits found containing '{f}'.")

    # 4. Mitigation Recommendations
    print("\n" + "=" * 65)
    print("AUDIT SUMMARY & MITIGATION STEPS:")
    print("=" * 65)
    
    warnings_found = any(not v for v in ignored_status.values()) or any_cached or leaked_history

    if not warnings_found:
        print(" [SAFE] No environmental leaks or tracking vulnerabilities detected.")
        print(" Your local .env configurations are completely safe from your Git history.")
    else:
        print(" [ACTION REQUIRED] Potential security vulnerabilities detected!")
        
        # Remediation for cached index
        if any_cached:
            print("\n  Fix 1: Untrack cached environment files (removes from Git index without deleting local files):")
            for f in env_files:
                code, out, _ = run_git_command(["ls-files", f])
                if code == 0 and out:
                    print(f"   git rm --cached {f}")
            print("   Then, add a commit stating: 'security: untrack config environment files'")

        # Remediation for .gitignore definitions
        missing_ignores = [f for f, is_ignored in ignored_status.items() if not is_ignored]
        if missing_ignores:
            print("\n  Fix 2: Append missing files to your .gitignore:")
            for f in missing_ignores:
                print(f"   echo \"{f}\" >> .gitignore")

        # Remediation for historical leaks
        if leaked_history:
            print("\n  Fix 3: Historical Leak Detected!")
            print("   * IMPORTANT: Since secrets were committed in the past, they are in the Git log.")
            print("     Adding them to .gitignore does NOT delete them from history.")
            print("     To completely purge them before adding collaborators, run:")
            print("     git filter-branch --force --index-filter \\")
            print("     \"git rm --cached --ignore-unmatch .env*\" \\")
            print("     --prune-empty --tag-name-filter cat -- --all")
            print("\n     (Alternatively, use 'git-filter-repo' or the 'BFG Repo-Cleaner' tool).")
            print("   * CAUTION: Running history purges changes commit SHAs. Coordinate with your team.")
            print("   * BEST PRACTICE: Revoke and regenerate all credentials stored in those history leaks!")

if __name__ == "__main__":
    print_banner()
    audit_git_repository()
