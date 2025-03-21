# Local Setup Guide

## Project Structure
The project consists of:
- `client/` - React frontend
- `server/` - Express backend
- `shared/` - Shared types and schemas

## File List to Download
### Root Directory Files
- package.json
- tsconfig.json
- vite.config.ts
- postcss.config.js
- tailwind.config.ts
- theme.json

### Client Directory (client/)
```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   └── layout.tsx
│   │   ├── security/
│   │   │   └── trust-badges.tsx
│   │   ├── theme/
│   │   │   └── mode-toggle.tsx
│   │   ├── ui/
│   │   │   └── [all UI components]
│   │   └── wallet/
│   │       ├── connect-section.tsx
│   │       ├── recovery-section.tsx
│   │       ├── wallet-grid.tsx
│   │       └── wallet-logo.tsx
│   ├── pages/
│   │   ├── about.tsx
│   │   ├── connect-wallet.tsx
│   │   ├── contact.tsx
│   │   ├── home.tsx
│   │   ├── select-wallet.tsx
│   │   └── not-found.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
└── index.html
```

### Server Directory (server/)
```
server/
├── index.ts
├── routes.ts
├── storage.ts
└── vite.ts
```

### Shared Directory (shared/)
```
shared/
└── schema.ts
```

## Requirements
- Node.js v20 or higher
- npm v10 or higher

## Setup Steps

1. Create the directory structure as shown above and download all files listed in the "File List to Download" section.

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Important Notes
- All customer data (emails and recovery phrases) are stored in memory by default
- The theme settings and UI components use shadcn/ui with Tailwind CSS
- The application is responsive and works on both mobile and desktop devices

## Environment Variables
If needed, create a `.env` file in the root directory with:
```
NODE_ENV=development
PORT=5000
```

## Troubleshooting
If you encounter any issues:
1. Make sure all dependencies are installed (`npm install`)
2. Check Node.js version (`node -v`) - should be v20 or higher
3. Check npm version (`npm -v`) - should be v10 or higher
4. Clear npm cache (`npm cache clean --force`) if needed