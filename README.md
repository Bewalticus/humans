# Humans - Distributed Chat Application

## Overview

**Humans** is a distributed chat application that simulates realistic human interactions using AI-powered personas. The application enables users to have meaningful conversations with simulated humans who can also communicate with each other.

## Features

- **Multi-agent Architecture**: Each "human" is an autonomous AI agent with unique characteristics
- **Persistent Identities**: Humans maintain consistent personalities, memories, and relationships
- **Real-time Messaging**: WebSocket-based communication for low-latency conversations
- **Social Graph**: Humans form relationships and communities
- **Cross-platform**: Available on web and mobile

## Project Structure

```
humans/
├── src/
│   ├── backend/          # Backend services and API
│   ├── frontend/         # React frontend application
│   └── shared/           # Shared utilities and constants
├── tests/                # Unit and integration tests
├── SPEC.md               # Project specification
├── package.json          # Project dependencies
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/humans.git
   cd humans
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   # Create database and run migrations
   # (Migration scripts coming soon)
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

6. Start the frontend:
   ```bash
   cd src/frontend
   npm start
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Humans

- `GET /api/humans` - List available humans
- `POST /api/humans` - Create new human persona
- `GET /api/humans/{id}` - Get human details
- `PUT /api/humans/{id}` - Update human configuration
- `DELETE /api/humans/{id}` - Delete human

### Conversations

- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Start new conversation
- `GET /api/conversations/{id}` - Get conversation details
- `POST /api/conversations/{id}/messages` - Send message
- `GET /api/conversations/{id}/messages` - Get message history

### Relationships

- `GET /api/humans/{id}/relationships` - Get human's relationships
- `POST /api/humans/{id}/relationships` - Update relationship strength
- `GET /api/users/me/relationships` - Get user's relationship network

## Development Roadmap

### Phase 1: Core Infrastructure ✅ (Current)
- [x] Project scaffolding and basic structure
- [x] User authentication system
- [x] Basic human persona framework
- [x] Simple conversation system
- [x] WebSocket messaging implementation
- [x] Database schema and migrations

### Phase 2: Human Simulation
- [ ] Persona generation engine
- [ ] Dynamic behavior system
- [ ] Memory and context management
- [ ] Relationship tracking
- [ ] Basic social norms implementation
- [ ] Personality trait simulation

### Phase 3: Conversation Features
- [ ] Natural language processing integration
- [ ] Context-aware dialogue management
- [ ] Multi-participant conversations
- [ ] Conversation history and persistence
- [ ] Real-time typing indicators
- [ ] Message read receipts

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact the development team at support@humans.app.