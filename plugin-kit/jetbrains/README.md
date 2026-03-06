# JetBrains Adapter

This adapter targets JetBrains IDEs through the IntelliJ Platform.

## Local build requirements

- Java 17 or newer available on `PATH`
- Gradle installed, or run the GitHub Actions workflow after uploading the repository

## Build

```bash
gradle buildPlugin
```

Expected artifact:
- `build/distributions/*.zip`

## Notes

- The code is intentionally a starter skeleton.
- The local bridge stays the shared backend for task-plan evaluation, wake, heartbeat, and diagnostics.
