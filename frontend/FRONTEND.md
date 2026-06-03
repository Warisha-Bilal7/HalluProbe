# HalluProbe Frontend

A modern, production-ready React/TypeScript + Next.js frontend for hallucination detection with a professional UI/UX.

## Features

✨ **Core Features**
- Single detection with adjustable threshold slider
- Batch processing with CSV import/export
- Real-time API health monitoring (30s polling)
- Color-coded hallucination score visualization
- Responsive design for all screen sizes
- Full TypeScript type safety (strict mode)
- Professional UI with Tailwind CSS

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.0.0 | React framework |
| React | 18.2.0 | UI framework |
| TypeScript | 5.0.0 | Type safety |
| Tailwind CSS | 3.3.0 | Styling |
| Autoprefixer | 10.4.0 | CSS vendor prefixes |

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Base UI components
│   │   └── index.tsx      # 7 UI components
│   ├── DetectionForm.tsx  # Single detection form
│   ├── BatchDetection.tsx # Batch processing
│   ├── ScoreDisplay.tsx   # Results visualization
│   ├── StatusPanel.tsx    # API health monitor
│   ├── Header.tsx         # Header component
│   ├── NavTabs.tsx        # Navigation tabs
│   └── InfoPanel.tsx      # Help & info
├── hooks/
│   └── useApi.ts          # 4 custom hooks
├── lib/
│   ├── api.ts             # API client (typed)
│   └── utils.ts           # Utilities
├── types/
│   └── api.ts             # 13 TypeScript interfaces
├── public/                # Static assets
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
├── postcss.config.js      # PostCSS config
├── .eslintrc.js           # ESLint config
├── .prettierrc.js         # Prettier config
├── .env.example           # Environment template
├── Dockerfile             # Docker image
└── README.md              # This file
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# (Optional) Edit .env.local for custom API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

```bash
# Start development server
npm run dev
# Opens http://localhost:3000

# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format
```

## Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle size
npm run build -- --analyze
```

## Components

### UI Components (`components/ui/`)

Reusable, unstyled components with full type safety:

- **Button** - 3 variants (primary, secondary, outline) + loading state
- **Input** - Text input with label and error handling
- **TextArea** - Multi-line input with validation
- **Card** - Container component
- **Badge** - Status indicator with 4 variants
- **Loader** - Loading animation with 3 sizes
- **Alert** - Messages with 4 severity levels

### Feature Components

#### DetectionForm
Single prompt-answer detection with:
- Form validation and error messages
- Threshold slider (0-1, 0.05 step)
- Feature toggle option
- Real-time result display
- Loading state handling

#### BatchDetection
Bulk detection with:
- CSV file import
- Manual item addition
- Inline editing
- Real-time progress
- CSV export
- Item management

#### ScoreDisplay
Results visualization with:
- Color-coded score (green < 0.3, yellow < 0.5, orange < 0.7, red ≥ 0.7)
- Risk level indicators
- Optional feature display
- Optional domain logits

#### StatusPanel
API monitoring with:
- Health status indicator (green/red)
- Auto-refresh every 30s
- Model configuration display
- Connection status

#### Header
Branded header with project info and feature list

#### NavTabs
Tab navigation with icons and active state

#### InfoPanel
Help section with:
- How-it-works guide (4 steps)
- Score interpretation
- Risk level explanations

## Hooks

### useDetection
```typescript
const { result, isLoading, error, detect } = useDetection();
await detect({ prompt: "...", answer: "...", threshold: 0.5 });
```

### useBatchDetection
```typescript
const { results, isLoading, error, detectBatch } = useBatchDetection();
await detectBatch({ prompts: [...], answers: [...] });
```

### useHealth
```typescript
const { health, isLoading, error } = useHealth();
// Auto-polls every 30 seconds
```

### useConfig
```typescript
const { config, isLoading, error } = useConfig();
// Fetches on mount
```

## API Client

Fully typed API client in `lib/api.ts`:

```typescript
import { halluProbeApi } from "@/lib/api";

// Single detection
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

// Get metrics
const metrics = await halluProbeApi.getMetrics();
```

## Type Safety

13 TypeScript interfaces with no `any` types:
- DetectionResult, DetectionRequest
- BatchDetectionResult, BatchDetectionRequest
- ModelInfo, ConfigResponse
- HealthResponse, DetectionFormData
- BatchItem, VisualizationData
- And more...

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
```

## Styling

- **Framework**: Tailwind CSS (utility-first)
- **Approach**: No custom CSS - pure Tailwind
- **Colors**: Custom semantic colors (primary, secondary)
- **Responsive**: Mobile-first design
- **Animations**: Custom fadeIn animation

## Configuration Files

### package.json
- All dependencies pinned for consistency
- Scripts for dev, build, lint, type-check, format

### tsconfig.json
- Strict TypeScript mode (no `any`)
- Path mapping for `@/*` imports
- Modern ES2020 target

### next.config.js
- React strict mode enabled
- SWC minification
- Environment variable support

### tailwind.config.ts
- Custom color scheme
- Content path configuration

### .eslintrc.js
- Next.js best practices
- TypeScript support

## Docker

### Build
```bash
docker build -t halluprobe-frontend:latest .
```

### Run
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api:8000 \
  halluprobe-frontend:latest
```

## Performance Optimizations

- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ CSS minification
- ✅ Font optimization
- ✅ Component lazy loading ready
- ✅ API response caching ready

## Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] StatusPanel shows API connection
- [ ] Single detection works
- [ ] Batch detection works
- [ ] CSV import works
- [ ] CSV export works
- [ ] Threshold slider works
- [ ] All UI components render
- [ ] Error handling works
- [ ] Loading states work
- [ ] Responsive design works

### Future: Automated Tests
```bash
npm install --save-dev jest @testing-library/react
npm test
```

## Troubleshooting

### API Connection Error
**Problem**: "Connection Failed" in StatusPanel

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/api/v1/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is enabled on backend
4. Check browser console for errors

### Build Errors
**Problem**: TypeScript errors during build

**Solution**:
```bash
# Check types locally
npm run type-check

# Clear cache
rm -rf .next
npm run build
```

### Slow Performance
**Problem**: Slow page loads

**Solution**:
1. Check API response times
2. Use browser DevTools Network tab
3. Profile with React DevTools
4. Enable analytics to identify bottlenecks

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Dark mode support
- [ ] Result history and caching
- [ ] Advanced charts (Chart.js)
- [ ] Embeddings visualization
- [ ] User authentication
- [ ] Settings panel
- [ ] Keyboard shortcuts
- [ ] Real-time collaboration
- [ ] Result sharing
- [ ] Advanced filtering

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests and linting
5. Create a pull request

**Code Style**:
- Follow TypeScript strict mode
- Use Prettier for formatting
- Add proper type hints
- Comment complex logic

## License

MIT License - See LICENSE file in project root

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Production Ready  
**Node Requirements**: 18+
