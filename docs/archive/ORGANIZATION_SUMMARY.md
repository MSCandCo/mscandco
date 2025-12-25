# Folder Organization Summary

This document outlines the organization structure of the MSC & Co project folder.

## Directory Structure

```
MSC & Co/
├── scripts/
│   └── gmail/          # All Gmail automation scripts
│       ├── README.md   # Documentation for scripts
│       ├── *.js        # Script files
│       └── *.json      # Configuration files (credentials, tokens)
│
├── docs/
│   └── gmail/          # Gmail documentation
│       ├── README.md   # Index of documentation
│       └── *.md        # Setup guides and documentation
│
├── logs/               # Application logs
│   └── *.txt          # Log files
│
├── mscandco-frontend/  # Main frontend application
├── msc-co-mcp-server/  # MCP server
├── doc/                # Project documentation
├── _archived/          # Archived code
└── [config files]      # Root-level configuration
```

## What Was Organized

### Moved to `scripts/gmail/`
- All Gmail-related JavaScript scripts (*.js)
- Gmail configuration files (credentials.json, token.json)
- Gmail package.json

### Moved to `docs/gmail/`
- All Gmail documentation files (*.md)
- Setup guides and README files

### Moved to `logs/`
- All log files (*.txt)

## Updated Files

- `.gitignore` - Added entries for Gmail credentials and tokens
- Created `scripts/gmail/README.md` - Documentation for scripts
- Created `docs/gmail/README.md` - Index of documentation

## Security Notes

The following files contain sensitive information and are excluded from git:
- `scripts/gmail/gmail-credentials.json`
- `scripts/gmail/gmail-token.json`
- `logs/*.txt`

## Last Updated
December 21, 2024
