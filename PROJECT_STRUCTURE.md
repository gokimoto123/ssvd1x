# SSVD Project Structure

## Directory Organization

```
SSVD-R1-PROJECT-III/
├── index.html              # Application selector (choose SSVD1x or SSVD-R1)
│
├── ssvd1x/                 # SSVD1x Application (Current Focus)
│   ├── index.html          # Stable release version
│   ├── current.html        # Development version
│   └── backups/           # Version history
│
├── ssvd-r1/               # SSVD-R1 Application (Original)
│   ├── index.html          # Stable release version
│   ├── current.html        # Development version
│   └── backups/           # Version history
│
├── shared/                # Shared Resources
│   ├── Data/              # Test data files (CSV, etc.)
│   ├── docs/              # Documentation
│   └── assets/            # Images, icons, etc.
│
├── archive/               # Historical versions
│   ├── old-versions/      # Previous HTML versions
│   ├── session-docs/      # Session summaries
│   ├── backup-files/      # Backup copies
│   └── test-files/        # Test implementations
│
├── CLAUDE.md              # AI Assistant instructions
├── README.md              # Main project documentation
└── PROJECT_STRUCTURE.md   # This file
```

## Development Workflow

### For SSVD1x Development:
1. Edit: `ssvd1x/current.html`
2. Test at: `http://localhost:8000/ssvd1x/current.html`
3. When stable: Copy to `ssvd1x/index.html`
4. Backup old version to: `ssvd1x/backups/`

### For SSVD-R1 Development:
1. Edit: `ssvd-r1/current.html`
2. Test at: `http://localhost:8000/ssvd-r1/current.html`
3. When stable: Copy to `ssvd-r1/index.html`
4. Backup old version to: `ssvd-r1/backups/`

## Quick Commands

```bash
# Start development server
python3 -m http.server 8000

# Access applications
# Main selector: http://localhost:8000/
# SSVD1x: http://localhost:8000/ssvd1x/
# SSVD-R1: http://localhost:8000/ssvd-r1/

# Backup current work (SSVD1x example)
cp ssvd1x/current.html "ssvd1x/backups/backup-$(date +%Y%m%d-%H%M%S).html"

# Promote to stable (SSVD1x example)
cp ssvd1x/current.html ssvd1x/index.html
```

## Current Status

- **SSVD1x**: Active development - includes parameter display, eFDR batching
- **SSVD-R1**: Stable - CHART-HIGHLIGHTING-COMPLETE version from Aug 13

## Important Files

- `ssvd1x/current.html` - Latest SSVD1x with parameter display
- `ssvd-r1/current.html` - Working SSVD-R1 (SSVD1) version
- `shared/Data/` - Common test data for both applications