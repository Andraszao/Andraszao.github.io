# Wish Upon Task Manager

A modern, collaborative task management tool that runs entirely on GitHub Pages with real-time synchronization and offline capabilities.

## Features

### Core Functionality
- Create and manage tasks in customizable categories
- Drag-and-drop task reordering and category organization
- Real-time collaborative editing with Firebase backend
- Offline support with localStorage fallback
- Task status tracking and progress visualization
- Assignee management and filtering

### Task Management
- Add, edit, and delete tasks and categories
- Mark tasks as complete/incomplete
- Add custom tags to tasks
- Assign tasks to team members
- Bulk task import/export via text format

### User Interface
- Clean, modern dark theme interface
- Mobile-responsive design
- Keyboard navigation support
- Progress tracking with visual indicators
- Customizable category labels
- Collapsible task groups

### Collaboration
- Real-time updates across all users
- Offline mode with automatic sync
- Task filtering by assignee
- Version history through Git
- Collaborative editing indicators

### Technical Features
- No backend required - runs on GitHub Pages
- Firebase real-time database integration
- Automatic deployment via GitHub Actions
- Local storage fallback when offline
- Performance optimized with lazy loading

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

3. **Set up Firebase (Optional)**
   - Create a Firebase project
   - Add the following secrets to your repository:
     - FIREBASE_API_KEY
     - FIREBASE_AUTH_DOMAIN
     - FIREBASE_PROJECT_ID
     - FIREBASE_STORAGE_BUCKET
     - FIREBASE_MESSAGING_SENDER_ID
     - FIREBASE_APP_ID
     - FIREBASE_MEASUREMENT_ID

4. **Set up GitHub Token**
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate new token (classic) with 'repo' scope
   - Add token to repository secrets as `ACCESS_TOKEN`

## How It Works

### Data Storage
- Tasks are stored in Firebase Realtime Database
- Fallback to localStorage when offline
- Periodic sync checks for updates
- Automatic conflict resolution

### Deployment
- Automatic deployment via GitHub Actions
- Firebase config injection during build
- Static hosting on GitHub Pages

### Performance
- Lazy loading of task components
- Optimized animations and transitions
- Efficient DOM updates
- Debounced save operations

## Development

### Technology Stack
- Pure JavaScript (no framework)
- Firebase Realtime Database
- GitHub Actions
- GitHub Pages

### Key Files
- `index.html`: Main application and UI
- `.github/workflows/deploy.yml`: Deployment workflow
- `data/tasks.json`: Initial task data structure

### Browser Support
- Modern browsers with ES6+ support
- Fallback features for older browsers
- Mobile browser optimization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
