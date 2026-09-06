# Rule: Windows Runtime UTF-8 Console Encoding Guardrail

## Scope
All Python test suites, backend service scripts, and CLI entry points running on Windows environments.

## Rule Invariant
On Windows operating systems, the standard I/O console stream defaults to code page 1252 (CP1252). This triggers unhandled `UnicodeEncodeError` crashes whenever scripts output clinical checkmarks (`✓`), bullet points (`•`), the Indian Rupee symbol (`₹`), or Devanagari / vernacular scripts.

All Python CLI scripts and test suites MUST explicitly configure UTF-8 encoding on standard output and error immediately upon execution:

```python
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")
```
