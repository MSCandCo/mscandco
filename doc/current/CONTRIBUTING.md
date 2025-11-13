# Contributing to AudioStems 🎵

Thank you for your interest in contributing to AudioStems! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Community](#community)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Be respectful** - Treat everyone with respect
- **Be inclusive** - Welcome people of all backgrounds
- **Be collaborative** - Work together to achieve common goals
- **Be constructive** - Provide constructive feedback
- **Be professional** - Maintain professional behavior

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Git
- AWS CLI (for deployment)

### Fork and Clone

1. **Fork the repository**
   ```bash
   # Go to https://github.com/Audiostems/audiostems-backend
   # Click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/audiostems-backend.git
   cd audiostems-backend
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Audiostems/audiostems-backend.git
   ```

## 🛠️ Development Setup

### Local Development

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Access services**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:1337
   - Admin Panel: http://localhost:1337/admin
   - AI Service: http://localhost:8000

### Individual Service Development

**Backend (Strapi)**
```bash
cd audiostems-backend
npm install
npm run develop
```

**Frontend (Next.js)**
```bash
cd audiostems-frontend
npm install
npm run dev
```

**AI Services**
```bash
cd auditus-ai
pip install -r requirements.txt
python src/api.py
```

## 📝 Coding Standards

### General Principles

- **Readability** - Write code that's easy to understand
- **Maintainability** - Write code that's easy to modify
- **Testability** - Write code that's easy to test
- **Performance** - Consider performance implications
- **Security** - Follow security best practices

### Backend (Node.js/Strapi)

**Code Style**
- Use ESLint and Prettier
- Follow Strapi conventions
- Use meaningful variable names
- Add JSDoc comments for functions

**File Structure**
```
src/
├── api/           # API endpoints
├── components/    # Reusable components
├── config/        # Configuration files
├── extensions/    # Strapi extensions
└── utils/         # Utility functions
```

**Example**
```javascript
/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 */
async function getUserById(id) {
  try {
    const user = await strapi.entityService.findOne('plugin::users-permissions.user', id);
    return user;
  } catch (error) {
    strapi.log.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}
```

### Frontend (Next.js/React)

**Code Style**
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

**File Structure**
```
components/
├── ui/           # Reusable UI components
├── layouts/      # Layout components
├── forms/        # Form components
└── pages/        # Page components
```

**Example**
```typescript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={handleEdit}>
          Edit
        </button>
      )}
    </div>
  );
};
```

### AI Services (Python/FastAPI)

**Code Style**
- Use Black for code formatting
- Use Flake8 for linting
- Follow PEP 8 guidelines
- Add type hints

**File Structure**
```
src/
├── api/          # API endpoints
├── models/       # ML models
├── services/     # Business logic
└── utils/        # Utility functions
```

**Example**
```python
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class AudioAnalysisRequest(BaseModel):
    file_id: str
    audio_url: str

class AudioAnalysisResponse(BaseModel):
    file_id: str
    analysis: dict

async def analyze_audio(request: AudioAnalysisRequest) -> AudioAnalysisResponse:
    """Analyze audio file and return analysis results."""
    try:
        analysis = await perform_analysis(request.audio_url)
        return AudioAnalysisResponse(
            file_id=request.file_id,
            analysis=analysis
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/         # Unit tests
├── integration/  # Integration tests
├── e2e/         # End-to-end tests
└── fixtures/    # Test data
```

### Running Tests

**Backend Tests**
```bash
cd audiostems-backend
npm test
npm run test:watch
```

**Frontend Tests**
```bash
cd audiostems-frontend
npm test
npm run test:coverage
```

**AI Service Tests**
```bash
cd auditus-ai
pytest
pytest --cov=src
```

### Test Guidelines

- **Unit Tests** - Test individual functions/components
- **Integration Tests** - Test API endpoints and database interactions
- **E2E Tests** - Test complete user workflows
- **Coverage** - Aim for 80%+ code coverage
- **Performance Tests** - Test critical performance paths

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow coding standards
   - Add tests
   - Update documentation

4. **Run tests locally**
   ```bash
   # Backend
   cd audiostems-backend && npm test
   
   # Frontend
   cd audiostems-frontend && npm test
   
   # AI Services
   cd auditus-ai && pytest
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(auth): add OAuth2 authentication"
git commit -m "fix(api): resolve user creation bug"
git commit -m "docs(readme): update installation instructions"
```

### Submitting a PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template
   - Add reviewers

3. **PR Review Process**
   - Address review comments
   - Update code as needed
   - Ensure CI passes
   - Get approval from maintainers

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Steps

1. **Create release branch**
   ```bash
   git checkout -b release/v1.2.3
   ```

2. **Update version numbers**
   - Update `package.json` files
   - Update documentation
   - Update changelog

3. **Create release PR**
   - Submit PR for review
   - Get approval from maintainers

4. **Tag and release**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

5. **Deploy to production**
   - CI/CD will automatically deploy
   - Monitor deployment
   - Verify functionality

## 🏷️ Labels and Milestones

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

### PR Labels

- `ready for review` - Ready for code review
- `work in progress` - Still being worked on
- `needs review` - Requires review
- `approved` - Approved by maintainers
- `changes requested` - Changes requested

## 🎯 Areas for Contribution

### High Priority

- **Performance Optimization** - Improve load times and efficiency
- **Security Enhancements** - Strengthen security measures
- **Testing Coverage** - Increase test coverage
- **Documentation** - Improve documentation quality
- **Accessibility** - Improve accessibility features

### Medium Priority

- **UI/UX Improvements** - Enhance user experience
- **API Enhancements** - Add new API endpoints
- **Monitoring** - Improve monitoring and alerting
- **Internationalization** - Add multi-language support
- **Mobile Optimization** - Improve mobile experience

### Low Priority

- **Code Refactoring** - Improve code structure
- **Tooling** - Improve development tools
- **Examples** - Add usage examples
- **Tutorials** - Create tutorials and guides

## 🤝 Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General discussions
- **Discord** - Real-time chat (link TBD)
- **Email** - support@audiostems.com

### Getting Help

1. **Check Documentation** - Read the docs first
2. **Search Issues** - Look for similar issues
3. **Ask in Discussions** - Use GitHub Discussions
4. **Create Issue** - If problem persists

### Recognition

Contributors will be recognized in:
- **README.md** - Contributor list
- **Release Notes** - Feature contributors
- **GitHub Profile** - Contribution graph
- **Hall of Fame** - Special contributors

## 📚 Resources

### Documentation

- [Strapi Documentation](https://docs.strapi.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [AWS Documentation](https://docs.aws.amazon.com/)

### Tools

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Black** - Python formatting
- **Flake8** - Python linting
- **Jest** - JavaScript testing
- **Pytest** - Python testing

### Learning Resources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Python Best Practices](https://docs.python-guide.org/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

Thank you for contributing to AudioStems! 🎵

Your contributions help make music licensing better for everyone. 