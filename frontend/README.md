"""Frontend development documentation."""

# HalluProbe Frontend

A modern, well-engineered React/TypeScript + Next.js frontend for the HalluProbe hallucination detection API.

## Architecture Overview

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   ├── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── DetectionForm.tsx  # Single detection form
│   ├── BatchDetection.tsx # Batch processing
│   ├── ScoreDisplay.tsx   # Results visualization
│   ├── Header.tsx         # Header component
│   ├── StatusPanel.tsx    # API status display
│   ├── InfoPanel.tsx      # Information/help
│   └── NavTabs.tsx        # Navigation tabs
├── hooks/                 # Custom React hooks
│   └── useApi.ts          # API interaction hooks
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript types
│   └── api.ts             # API type definitions
└── public/                # Static assets
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Features

### 1. **Single Detection**
- Real-time hallucination detection for individual prompt-answer pairs
- Adjustable confidence threshold
- Visual score display with color-coded risk levels
- Optional feature visualization

### 2. **Batch Processing**
- Process multiple prompt-answer pairs
- CSV import/export functionality
- Real-time progress tracking
- Bulk results visualization

### 3. **API Status Monitoring**
- Real-time API health checks
- Model configuration display
- Connection status indicator

### 4. **Information & Help**
- How-it-works guide
- Score interpretation guide
- Model architecture overview

## Component Architecture

### UI Components (`components/ui/`)
Reusable, unstyled components following React best practices:
- `Button` - With variants and loading states
- `Input` - With labels and error handling
- `TextArea` - Multi-line input with validation
- `Card` - Consistent container styling
- `Badge` - Status indicators
- `Loader` - Loading animation
- `Alert` - Error/success messages

### Feature Components
- `DetectionForm` - Single detection interface
- `BatchDetection` - Bulk detection with import/export
- `ScoreDisplay` - Results visualization
- `StatusPanel` - API health and configuration
- `Header` - Application header
- `InfoPanel` - Help and documentation

## Hooks

### `useDetection()`
```typescript
const { result, isLoading, error, detect } = useDetection();
await detect({ prompt: "...", answer: "...", threshold: 0.5 });
```

### `useBatchDetection()`
```typescript
const { results, isLoading, error, detectBatch } = useBatchDetection();
await detectBatch({ prompts: [...], answers: [...], threshold: 0.5 });
```

### `useHealth()`
```typescript
const { health, isLoading, error } = useHealth();
// Automatically polls API health every 30 seconds
```

### `useConfig()`
```typescript
const { config, isLoading, error } = useConfig();
// Fetches model configuration once on mount
```

## API Client

The `lib/api.ts` provides a clean, typed API client:

```typescript
import { halluProbeApi } from "@/lib/api";

// Detect single
const result = await halluProbeApi.detect({
  prompt: "What is 2+2?",
  answer: "2+2 equals 5",
  threshold: 0.5
});

// Batch detection
const results = await halluProbeApi.detectBatch({
  prompts: [...],
  answers: [...]
});

// Get config
const config = await halluProbeApi.getConfig();

// Check health
const health = await halluProbeApi.health();
```

## Type Safety

All API interactions are fully typed:

```typescript
interface DetectionResult {
  hallucination_score: number;
  is_hallucination: boolean;
  confidence: number;
  features?: number[];
  domain_logits?: number[];
}
```

## Styling

- **Framework**: Tailwind CSS
- **Colors**: Semantic color system
- **Spacing**: Consistent spacing scale
- **Responsive**: Mobile-first design

### Color Scheme
- **Primary**: Blue (#2563eb)
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red

## Error Handling

All API calls include robust error handling:

```typescript
import { halluProbeApi, ApiError } from "@/lib/api";

try {
  const result = await halluProbeApi.detect({...});
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`API Error ${err.status}: ${err.message}`);
  }
}
```

## Development

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Format Code
```bash
npm run format
```

## Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Performance Optimizations

- Next.js automatic code splitting
- React component memoization
- API response caching
- Image optimization
- CSS-in-JS minimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
```

## Troubleshooting

### API Connection Issues
1. Verify backend is running on correct port
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Ensure CORS is enabled on backend

### Build Errors
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`

### Performance Issues
1. Check browser DevTools Network tab
2. Review API response times
3. Profile React components: `npm install react-devtools`

## Contributing

1. Follow the existing code structure
2. Use TypeScript strict mode
3. Write meaningful commit messages
4. Test changes in development
5. Update documentation as needed

## License

MIT License - See LICENSE file in project root

---

**Frontend Version**: 1.0.0  
**Last Updated**: June 2026  
**Maintainers**: Advanced ML Course Team
