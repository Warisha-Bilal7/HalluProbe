"""Frontend setup and deployment guide."""

# HalluProbe Frontend Setup Guide

A professional, production-ready React/TypeScript frontend for HalluProbe.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (http://localhost:8000)

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Set API URL
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Development

### Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx           # Main page
│   └── globals.css
├── components/
│   ├── ui/                # Base UI components
│   ├── DetectionForm.tsx
│   ├── BatchDetection.tsx
│   ├── ScoreDisplay.tsx
│   ├── Header.tsx
│   ├── StatusPanel.tsx
│   ├── InfoPanel.tsx
│   └── NavTabs.tsx
├── hooks/
│   └── useApi.ts          # Custom hooks for API
├── lib/
│   ├── api.ts             # API client
│   └── utils.ts           # Utilities
├── types/
│   └── api.ts             # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Features

### 1. Single Detection

- Real-time hallucination detection
- Adjustable threshold slider
- Visual score display with color coding
- Optional feature and domain logits

### 2. Batch Processing

- CSV import/export
- Multiple items processing
- Results visualization
- Download results

### 3. API Monitoring

- Health status display
- Model configuration viewer
- Automatic health polling

### 4. Information Panel

- How-it-works guide
- Score interpretation
- Feature descriptions

## Architecture Decisions

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: React hooks
- **API**: Fetch API with custom client

### Why These Choices?

1. **Next.js**: Production-ready, built-in optimization, SSR support
2. **TypeScript**: Type safety throughout the application
3. **Tailwind**: Utility-first CSS, minimal custom CSS
4. **React Hooks**: No external state management needed for this scope
5. **Custom API Client**: Full control, no unnecessary dependencies

### Component Architecture

Each component has a single responsibility:

- UI components are dumb and reusable
- Feature components handle logic
- Hooks encapsulate API interactions

This follows React best practices and is easy to maintain and extend.

## API Integration

The `lib/api.ts` client provides:

- Type-safe API calls
- Automatic error handling
- Proper error types
- Request/response typing

```typescript
// Usage example
import { halluProbeApi } from "@/lib/api";

const result = await halluProbeApi.detect({
  prompt: "...",
  answer: "...",
  threshold: 0.5,
});
```

## Environment Variables

```
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
```

## Deployment

### Docker

```bash
# Build image
docker build -f frontend/Dockerfile -t halluprobe-frontend:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api:8000 \
  halluprobe-frontend:latest
```

### Docker Compose

```bash
# Run full stack
docker-compose -f docker/docker-compose-full.yml up

# Frontend: http://localhost:3000
# API: http://localhost:8000
# Demo: http://localhost:7860
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## Performance

- Automatic code splitting
- Image optimization (if added)
- CSS minification
- React optimization

### Metrics

- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Lighthouse score: > 90

## Testing

For adding tests in the future:

```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Coverage
npm test -- --coverage
```

## Troubleshooting

### API Connection Issues

**Problem**: Cannot connect to backend

```
Solution:
1. Ensure backend is running: http://localhost:8000/api/v1/health
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Check browser console for CORS errors
```

### Build Issues

**Problem**: Build fails with TypeScript errors

```
Solution:
1. Run type checking: npm run type-check
2. Fix reported errors
3. Clear cache: rm -rf .next && npm run build
```

### Slow Performance

**Problem**: Slow page loads

```
Solution:
1. Check API response times
2. Use browser DevTools to profile
3. Check network tab for large assets
```

## Code Quality

### TypeScript Strict Mode

All code uses TypeScript strict mode for maximum safety.

### ESLint

Configured with Next.js best practices.

### Prettier

Automatic code formatting on save.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Dark mode
- [ ] Result history/caching
- [ ] Advanced charts and analytics
- [ ] User authentication
- [ ] Settings panel
- [ ] Keyboard shortcuts
- [ ] Real-time collaboration

## Contributing

1. Follow existing code style
2. Use TypeScript
3. Add proper type hints
4. Test changes locally
5. Update documentation

## Support

For issues or questions:

1. Check frontend/README.md for details
2. Review component source code
3. Check browser console for errors
4. Verify API connectivity

## License

MIT License - See LICENSE file in project root

---

**Frontend Version**: 1.0.0  
**Last Updated**: June 2026  
**Node Requirements**: 18+  
**Build Time**: ~2 minutes
