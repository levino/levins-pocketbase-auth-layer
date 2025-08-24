# Protected Documentation Template

A modern template for creating **protected documentation websites** that combines the power of [Docusaurus](https://docusaurus.io/) with robust authentication and access control.

![Protected Docs Template](https://img.shields.io/badge/docs-protected-green)
![Docusaurus](https://img.shields.io/badge/Docusaurus-3.8-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

## 🎯 What is this?

This template provides a complete solution for creating documentation websites that are only accessible to authenticated users. Perfect for:

- **Internal company documentation** that should only be accessible to employees
- **Member-only content** for organizations, communities, or premium users
- **Private API documentation** that requires user authentication
- **Client portals** with restricted access to specific user groups
- **Educational content** with access control based on enrollment or membership

## 🏗️ How it works

The template consists of two main components that work together:

### 1. Documentation Website (Docusaurus)
- Built with **Docusaurus 3.8**, a modern static site generator
- Supports **Markdown** for easy content creation
- Features **internationalization** (i18n) support
- Includes **blog functionality** and **versioning**
- Responsive design with dark/light mode support

### 2. Authentication Server (Node.js + Express)
- **OAuth authentication** via GitHub, Google, and other providers
- **PocketBase** integration for user management and access control
- **Group-based access control** - users must be members of specific groups
- **Session management** with secure cookies
- **Multi-language support** (German and English login pages)

### Authentication Flow
1. User visits the documentation site
2. Server checks for valid authentication cookie
3. If not authenticated, user is redirected to login page
4. User authenticates via OAuth provider (GitHub, Google, etc.)
5. Server verifies user is member of required group(s)
6. If authorized, user gains access to the protected documentation

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **Docker** (optional, for containerized deployment)
- **PocketBase instance** (for user management)

### 1. Clone and Install
```bash
git clone <your-fork-of-this-repo>
cd protected-docs-template
npm install
```

### 2. Configure Environment
Create `.env.local` file in the root directory:
```env
POCKETBASE_URL=https://your-pocketbase-instance.com
POCKETBASE_GROUP=your-group-name
PORT=8000
```

### 3. Set up PocketBase
1. Create a PocketBase instance (self-hosted or cloud)
2. Create a `groups` collection with `user_id` and `your-group-name` fields
3. Configure OAuth providers (GitHub, Google, etc.)
4. Add users to the appropriate groups

### 4. Customize Your Documentation
Navigate to the `website/` directory and:
```bash
cd website
# Edit your documentation files in docs/
# Customize the site config in docusaurus.config.ts
# Add your branding, colors, and content
```

### 5. Build and Run

#### Development Mode
```bash
# Start the website development server
cd website
npm run start

# In another terminal, start the auth server
cd server
npm run start
```

#### Production Mode
```bash
# Build the website
cd website
npm run build

# Start the production server
cd server
npm run start
```

#### Docker Deployment
```bash
docker compose up --build
```

The application will be available at `http://localhost:8000`

## 📁 Project Structure

```
protected-docs-template/
├── website/                 # Docusaurus documentation site
│   ├── docs/               # Documentation content (Markdown files)
│   ├── blog/               # Blog posts
│   ├── src/                # React components and pages
│   ├── static/             # Static assets
│   └── docusaurus.config.ts # Site configuration
├── server/                 # Authentication server
│   ├── index.ts            # Main server file
│   └── views/              # Login page templates
├── Dockerfile              # Container configuration
├── docker-compose.yaml     # Multi-container setup
└── package.json            # Workspace configuration
```

## 🔧 Configuration

### Authentication Providers
The system supports multiple OAuth providers via PocketBase:
- **GitHub** (default)
- **Google** (default)
- **Microsoft**
- **Facebook**
- **GitLab**
- **Discord**
- **Spotify**
- And many more...

To add new providers, configure them in your PocketBase admin panel.

### Access Control
Users must be members of a specific group to access the documentation. Configure this in your `.env.local`:
```env
POCKETBASE_GROUP=employees  # Only users in "employees" group can access
```

### Internationalization
The template includes German language support out of the box. To add more languages:

1. Update `docusaurus.config.ts`:
```typescript
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'de', 'fr'], // Add your languages
},
```

2. Create translation files in `website/i18n/`

### Customization
- **Branding**: Edit `website/docusaurus.config.ts` and `website/src/css/custom.css`
- **Content**: Add your documentation to `website/docs/`
- **Login Pages**: Customize `server/views/login.ejs` and `server/views/not_a_member.ejs`

## 🎨 Use Cases

### Internal Company Documentation
Perfect for companies that need to share internal documentation, processes, or knowledge bases with employees only.

```env
POCKETBASE_GROUP=employees
```

### Client Portals
Create documentation portals for specific clients or customer segments.

```env
POCKETBASE_GROUP=premium_clients
```

### Educational Platforms
Provide course materials or learning resources to enrolled students or members.

```env
POCKETBASE_GROUP=course_participants
```

### API Documentation
Share private API documentation with authorized developers or partners.

```env
POCKETBASE_GROUP=api_partners
```

## 🛠️ Development

### Adding New Content
1. Create Markdown files in `website/docs/`
2. Update `website/sidebars.ts` if needed
3. Add blog posts to `website/blog/`

### Customizing Authentication
- Modify `server/index.ts` to change authentication logic
- Update login templates in `server/views/`
- Configure additional OAuth providers in PocketBase

### Styling and Theming
- Edit `website/src/css/custom.css` for global styles
- Modify `website/docusaurus.config.ts` for theme configuration
- Create custom React components in `website/src/components/`

## 🚀 Deployment

### Docker (Recommended)
```bash
docker compose up --build -d
```

### Manual Deployment
1. Build the website: `cd website && npm run build`
2. Deploy the server with built files
3. Configure environment variables
4. Set up reverse proxy (nginx, Apache, etc.)

### Cloud Platforms
The template works well with:
- **Vercel** (for the documentation site)
- **Railway** / **Heroku** (for the auth server)
- **Digital Ocean** / **AWS** / **Google Cloud** (full stack)

## 🔒 Security Features

- **OAuth-only authentication** - no password storage required
- **Group-based access control** - fine-grained permissions
- **Secure session management** - httpOnly cookies with proper settings
- **CSRF protection** - built into the authentication flow
- **Regular security updates** - based on maintained dependencies

## 📝 License

This template is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Documentation**: Check the [Docusaurus documentation](https://docusaurus.io/docs) for site customization

## 🏷️ Version

Current version: **1.0.0**

Built with:
- Docusaurus 3.8.1
- Node.js 18+
- PocketBase 0.26
- Express 4.21
- TypeScript 5.6

---

**Made with ❤️ for the developer community**