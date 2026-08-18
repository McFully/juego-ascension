---
name: terminal-solver
description: >
  Diagnose and fix terminal/command-line problems. Use when the user reports
  shell errors, command not found, syntax errors, path issues, permission
  denied, unexpected output, encoding issues, package manager failures, or
  any PowerShell/cmd/bash problem. Also use when commands run manually
  produce different results than expected. Covers Windows (PowerShell 5.1,
  pwsh, cmd), Linux/macOS (bash, zsh, sh), and cross-platform tooling.
  Use ONLY for actual terminal/shell problems - not for general debugging
  of application logic.
license: MIT
compatibility: opencode
metadata:
  audience: all
  platform: windows, linux, macOS
---

# Terminal Solver

Diagnose and fix terminal/command-line problems step by step.

## Investigation Protocol

1. **Capture the exact error.** Ask the user to paste the full error message and the command that produced it.
2. **Reproduce.** Run the failing command yourself inside the tool environment to see the exact output.
3. **Check the shell.** Determine which shell is in use (PowerShell 5.1, pwsh 7+, cmd, bash, zsh, fish) - syntax and semantics differ significantly.
4. **Inspect state before acting.** Before suggesting fixes, check:
   - Current working directory (`Get-Location` / `pwd`)
   - Environment variables (esp. `PATH`, `HOME`, `SHELL`)
   - File existence and permissions (`Test-Path`, `Get-ChildItem`, `ls -la`)
   - Whether the command is aliased (`Get-Command`, `Get-Alias`, `which`, `type`)
   - Whether the tool/package is installed (`Get-Command`, `where.exe`, `npm list`)
5. **Isolate the variable.** If a command works in one context but not another, identify the difference (profile script, env var, cwd, shell version).

## Common Windows (PowerShell/cmd) Issues

### "Command not found" / "not recognized"
- **PowerShell:** `Get-Command <name>` - if missing, install via `winget`, `choco`, `scoop`, or add to `PATH`.
- **cmd:** `where <name>` - same resolution.
- **Node/npm tools:** Check `npx` availability, global install with `npm i -g`, or `node_modules/.bin` path.
- **Script execution policy:** `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` if scripts won't run.

### Path issues
- PowerShell uses `;` as path separator (like UNIX `:`).
- Quotes matter: paths with spaces need quoting or backtick-escaping.
- `~` in PowerShell resolves to `$HOME`, but not all commands expand it. Use `$env:USERPROFILE` or `Resolve-Path`.
- Long paths (>260 chars) may fail on some Windows versions. Use `\\?\` prefix or enable long path support.

### Encoding problems
- PowerShell pipes output as UTF-16LE by default; tools expecting UTF-8 may garble text.
- Fix: `$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new()`
- Redirect operators (`>`) create UTF-16LE files. Use `Out-File -Encoding utf8` or `Set-Content`.
- `chcp 65001` in cmd switches to UTF-8 code page.

### Permission errors
- "Access denied" on `C:\Program Files`, `C:\Windows`, `System32` - run shell as Administrator.
- File may be locked by another process. Use `handle.exe` or restart.
- Network drives may have different permissions than local.

### PowerShell syntax pitfalls
- **Comparison:** `-eq`, not `==`. `-match` for regex.
- **Boolean:** `$true` / `$false`, not `true` / `false`.
- **Pipeline:** Objects, not text. Use `| Select-Object`, `| Where-Object`, `| ForEach-Object`.
- **Command chaining:** `;` always runs next command (regardless of exit code). Use `if ($?) { ... }` for conditional chaining.
- **Exit code:** Check `$LASTEXITCODE` for native commands. `$?` is `$true`/`$false` for last command success.
- **Splatting:** Use `@args` instead of `$args` to pass arrays/param objects.

### Process stuck / hanging
- `Stop-Process -Name <name>` to kill.
- `Get-Process` to list running processes.
- Port in use: `netstat -ano | Select-String ":<port>"` or `Get-NetTCPConnection -LocalPort <port>`.

## Common Unix/Linux/macOS Issues

### "command not found" on Linux/macOS
- `which <name>` or `command -v <name>` to locate.
- Check `PATH` in `.bashrc`, `.zshrc`, `.profile`.
- Package may be missing: `apt`, `brew`, `dnf`, `pacman`.

### Permission denied (execution)
- Missing `+x`: `chmod +x <file>`.
- Shebang wrong: first line must be valid interpreter path.

### Shell syntax pitfalls
- Always quote variables: `"$var"` not `$var` (word splitting).
- `set -e`, `set -u`, `set -o pipefail` for strict mode.
- `$?` for exit code of last command.
- `2>&1` to redirect stderr; `&>` in bash 4+.

## Cross-Platform Tools

| Tool | Windows | Unix |
|------|---------|------|
| Node.js | `nvm-windows`, `nvs` | `nvm`, `fnm`, `n` |
| Python | `py` launcher, `winget` | `pyenv`, apt/brew |
| Package mgr | `winget`, `choco`, `scoop` | `apt`, `brew`, `dnf` |
| Containers | `Docker Desktop` | `docker`, `podman` |
| Version mgr | `git` | `git` |

## Diagnostic Commands Cheatsheet

### Windows PowerShell
```powershell
# Environment
Get-Location; $PSVersionTable; $Host.Version
$env:PATH -split ';'
Get-ChildItem Env: | Sort-Object Name

# Commands
Get-Command <name> -ErrorAction SilentlyContinue
Get-Alias | Where-Object { $_.Definition -like '*<name>*' }
Get-Module -ListAvailable

# Process / Ports
Get-Process -Name <name>
Get-NetTCPConnection -LocalPort <port> | Select-Object OwningProcess, State
Stop-Process -Id <pid> -Force

# File system
Test-Path <path>
Get-ChildItem -Recurse -Filter <pattern> -ErrorAction SilentlyContinue
```

### cmd
```cmd
echo %PATH%
where <name>
netstat -ano | findstr :<port>
tasklist /FI "IMAGENAME eq <name>.exe"
```

### bash/zsh
```bash
echo "$PATH" | tr ':' '\n'
type <name>      # bash builtin
whence -v <name> # zsh
command -v <name>
lsof -i :<port>
ps aux | grep <name>
```

## When to Escalate

- File system corruption: `chkdsk` / `fsck`
- Hardware / driver issues
- Antivirus/firewall interfering - suggest the user disable temporarily to test, then whitelist
- System update required: `wuauclt`, Windows Update, `apt upgrade`, `brew upgrade`
- If the issue is clearly a bug in a third-party tool, suggest filing an upstream issue

## Response Template

Stick to this structure for terminal issues:

1. **Root cause** - one-line explanation of what is wrong
2. **Fix command** - copy-pasteable solution (with explanation of what it does)
3. **Verification** - command to confirm the fix worked
4. **Prevention** - one-liner on how to avoid in the future (env var, config change, alias)
