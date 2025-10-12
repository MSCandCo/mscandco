# MSC & Co - Multi-Brand Music Distribution Platform

A comprehensive music distribution and publishing platform supporting multiple brands under the MSC & Co umbrella.

## Brand Architecture

- **MSC & Co** - Parent company and main platform
- **MSC & Co MSC** - Gospel and Christian music distribution & publishing
- **Audio MSC** - General music distribution & licensing for film/TV/media

## Features

### Multi-Brand Support
- Brand selection during artist onboarding
- Brand-specific features and services
- Separate branding in emails, dashboards, and project views

### Artist Portal
- Complete artist profile management
- Project and release management
- Analytics and royalty tracking
- Contract management

### Distribution Services
- Global music distribution to 150+ platforms
- Professional publishing and royalty collection
- Sync licensing opportunities
- Real-time analytics and revenue tracking

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Auth0 account configured
- Strapi backend running

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd msc-co-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_MANAGEMENT_TOKEN=your-management-api-token

# Strapi Configuration
NEXT_PUBLIC_STRAPI=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token

# Email Service (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@mscandco.com
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Project Structure

```
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── layouts/        # Layout components
│   └── ui/             # UI components
├── lib/                # Utility functions and configurations
│   ├── brand-config.js # Multi-brand configuration
│   └── constants.js    # Platform constants
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard pages
│   └── distribution/  # Distribution and publishing pages
└── public/            # Static assets
```

## Brand Configuration

The platform supports multiple brands through the `lib/brand-config.js` file:

- **MSC & Co MSC**: Gospel and Christian music focus
- **Audio MSC**: General music and licensing focus

Each brand has its own:
- Color scheme and branding
- Service offerings
- Email templates
- Dashboard customization

## Development

### Adding New Features
1. Create feature branch from main
2. Implement feature with brand-aware components
3. Test across different brand configurations
4. Submit pull request

### Brand-Specific Development
- Use `getBrandByUser()` to get user's brand
- Use brand configuration for styling and content
- Test features with different brand contexts

## Deployment

### Production Environment
- Update Auth0 settings for production domain
- Configure environment variables for production
- Set up SSL certificates
- Configure CDN for static assets

### Brand Domains
- Main platform: mscandco.com
- MSC & Co MSC: yhwh-msc.mscandco.com
- Audio MSC: audio-msc.mscandco.com

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by MSC & Co.

## Support

For support, email support@mscandco.com or visit our documentation at docs.mscandco.com.
