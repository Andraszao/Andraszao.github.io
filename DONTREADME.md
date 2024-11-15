# Wish Upon Task Manager

A lightweight, collaborative task management tool that uses GitHub Pages for hosting and GitHub's API for data storage.

## Features
- Create and manage tasks in customizable categories
- Collaborative editing through GitHub storage
- Offline support with localStorage fallback
- No backend required - runs entirely on GitHub Pages
- Version history through Git

## Setup

1. **Fork or Clone the Repository**
   ```bash
   git clone https://github.com/andraszao/andraszao.github.io.git
   ```

2. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select "gh-pages" branch
   - Your site will be available at `https://[username].github.io/[repository-name]`

3. **Set up GitHub Token**
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate new token (classic) with 'repo' scope
   - Copy token
   - Go to your repository Settings → Secrets and variables → Actions
   - Create new secret named `ACCESS_TOKEN` with your token value

## How It Works

- Tasks are stored in `data/tasks.json`
- Changes are saved to GitHub when tasks are updated
- If GitHub is unavailable, changes are stored in localStorage
- Periodic sync checks for updates from other users
- GitHub Actions automatically deploys changes to GitHub Pages

## Development

The project uses:
- Pure JavaScript (no framework)
- GitHub API for data storage
- GitHub Actions for deployment
- GitHub Pages for hosting

Key files:
- `index.html`: Main application
- `.github/workflows/build.yml`: Deployment workflow
- `data/tasks.json`: Task data storage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
