# Contributing Guide

Thank you for your interest in contributing to My Free Sailing Coach! This document provides guidelines and instructions for contributing.

## Getting Started

### 1. Fork the Repository
```bash
# Click "Fork" on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sailing-coach.git
cd sailing-coach
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Install Dependencies
```bash
npm run install-all
```

### 4. Start Development
```bash
npm run dev:backend  # Terminal 1
npm run dev:frontend  # Terminal 2
```

## Code Standards

### JavaScript/React
- Use ES6+ syntax
- Use const/let instead of var
- Add JSDoc comments for functions
- Follow the existing code style

### File Organization
```
frontend/src/
├── pages/        # Full page components
├── components/   # Reusable components
├── utils/        # Helper functions
└── App.jsx       # Main app component

backend/
├── routes/       # API route handlers
├── utils/        # Utility functions
└── server.js     # Main server file
```

### Naming Conventions
- Components: PascalCase (e.g., `RaceMap.jsx`)
- Functions: camelCase (e.g., `calculateDistance()`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)
- Files: kebab-case for utilities (e.g., `gpx-parser.js`)

## Commit Messages

Write clear, descriptive commit messages:

```
# Good
git commit -m "Add speed filtering to performance metrics"
git commit -m "Fix GPX parsing for malformed files"
git commit -m "Improve race map responsiveness"

# Avoid
git commit -m "Fix stuff"
git commit -m "Updates"
git commit -m "WIP"
```

## Pull Request Process

1. **Update documentation** if you change functionality
2. **Test thoroughly**:
   - Test with various GPX files
   - Test on different screen sizes
   - Check browser console for errors
3. **Create a clear PR description**:
   ```
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   
   ## How to Test
   Steps to verify the changes
   
   ## Screenshots (if applicable)
   ```

4. **Link any related issues**:
   ```
   Closes #123
   ```

## Feature Ideas

### Performance Analysis
- [ ] VMG (Velocity Made Good) calculation
- [ ] Apparent wind angle calculation
- [ ] Tactical analysis (mark rounding analysis)
- [ ] Speed polars visualization
- [ ] Performance comparison between legs

### User Interface
- [ ] Dark mode
- [ ] Customizable metric display
- [ ] 3D route visualization
- [ ] Mobile app (React Native)
- [ ] Race playback (animation)

### Data & Integration
- [ ] Weather data overlay
- [ ] Current/tide data integration
- [ ] Automatic race detection
- [ ] Multi-race comparison
- [ ] Export to PDF reports

### Social Features
- [ ] Race sharing (public/private)
- [ ] Leaderboards
- [ ] Comments on races
- [ ] Following other sailors
- [ ] Race comments and annotations

### Advanced Analytics
- [ ] Machine learning for tactical recommendations
- [ ] Wind pattern analysis
- [ ] Trend analysis over time
- [ ] Fleet analysis
- [ ] Competitor tracking

## Testing

### Manual Testing Checklist
```
- [ ] Upload sample GPX file
- [ ] Verify metrics calculations
- [ ] Check map renders correctly
- [ ] Test on mobile device
- [ ] Verify data persists in dashboard
- [ ] Delete race and verify removal
```

### Sample GPX Files for Testing

We maintain a collection of test GPX files in `/test-data/`:
- short-race.gpx (5 minute race)
- long-race.gpx (2 hour race)
- complex-route.gpx (multiple marks)

## Bug Reports

When reporting bugs, include:

```markdown
## Bug Description
Clear description of what's broken

## Steps to Reproduce
1. Upload [specific GPX file type]
2. Navigate to [page]
3. Observe [behavior]

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- OS: Windows 11
- GPX File: [attach if possible]
```

## Code Review

When reviewing PRs, check for:

- [ ] Code follows style guide
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No hardcoded values
- [ ] Performance impact considered
- [ ] Mobile responsive

## Database Changes

If modifying the schema:

1. Update `backend/utils/database.js`
2. Create migration instructions
3. Provide upgrade path for existing users
4. Test with existing data

## Performance Guidelines

- Keep bundle size small
- Optimize images
- Lazy load components when possible
- Avoid unnecessary re-renders
- Cache API responses

## Documentation

- Update README.md for user-facing changes
- Update SETUP.md for setup changes
- Add JSDoc comments to functions
- Include examples for new features

## Security Considerations

- Validate all file uploads
- Sanitize user input
- Never expose API keys
- Use HTTPS in production
- Implement rate limiting for API

## Dependencies

Before adding new packages:

1. Check if already exists
2. Verify it's actively maintained
3. Check file size
4. Check for security vulnerabilities
5. Update both package.json and SETUP.md

Add with:
```bash
# Frontend
cd frontend && npm install package-name

# Backend
cd backend && npm install package-name
```

## Style Guide

### React Components

```javascript
// Good
export default function RaceMap({ trackpoints }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // effect code
  }, [dependency]);
  
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}

// Avoid
function RaceMap(props) {
  this.state = {};
  // using this.state
}
```

### Comments

```javascript
// Good - explain WHY, not WHAT
// Calculate distance using Haversine formula to account for Earth's curvature
const distance = calculateDistance(lat1, lon1, lat2, lon2);

// Avoid - obvious from code
// Add 1 to count
count++;
```

## Questions?

- Check existing issues/PRs
- Open a discussion
- Join our community
- Email: [contact info]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! ⛵
