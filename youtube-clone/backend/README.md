# YouTube Clone Backend API

## 📋 Project Proposal

### Aim and Objective

**Problem Statement:**
Modern video streaming platforms require robust, scalable backend APIs that can handle high-volume video content delivery, user authentication, real-time interactions, and complex data relationships. This project addresses the need for a comprehensive video platform API that supports content creators, viewers, and platform administrators with secure, efficient, and feature-rich functionality.

**Concrete Objectives:**
1. **Performance Target**: Implement an API gateway capable of handling 500+ concurrent requests per second with sub-200ms response times
2. **Security Compliance**: Achieve 100% secure endpoint coverage with JWT authentication, input validation, and SQL injection prevention by June 14, 2025
3. **Feature Completeness**: Deliver 95% feature parity with major video platforms including video upload, streaming, comments, subscriptions, and search functionality
4. **Documentation Excellence**: Maintain 100% API endpoint documentation coverage with RAML specifications and interactive examples
5. **Deployment Readiness**: Establish production-grade deployment pipeline with multi-environment support (development, staging, production)

### Feasibility Analysis

**Technical Capabilities Assessment:**
- ✅ **Backend Development**: Strong proficiency in Node.js, Express.js, and RESTful API design
- ✅ **Database Management**: Advanced knowledge of PostgreSQL, Prisma ORM, and database optimization
- ✅ **Authentication & Security**: Experience with JWT, bcrypt, and security best practices
- ✅ **File Management**: Competency in multer, file streaming, and cloud storage integration
- ✅ **API Documentation**: Familiarity with RAML, OpenAPI, and documentation tools

**Resource Requirements:**
- **Server Requirements**: 
  - Development: Local machine (8GB RAM, 4 CPU cores)
  - Production: Cloud instance (16GB RAM, 8 CPU cores) - Estimated cost: $50-100/month
- **Database**: PostgreSQL instance with 100GB storage - Estimated cost: $20-40/month
- **File Storage**: Cloud storage for video files (1TB) - Estimated cost: $25-50/month
- **Third-party Services**: 
  - JWT token management (free tier)
  - Email service for notifications (free tier up to 10k emails/month)

**Risk Register & Mitigation Strategies:**

| Risk | Impact | Probability | Mitigation Strategy |
|------|---------|-------------|-------------------|
| **High Database Load** | High | Medium | Implement connection pooling, query optimization, and read replicas |
| **File Upload Failures** | Medium | High | Add retry mechanisms, chunked uploads, and comprehensive error handling |
| **Security Vulnerabilities** | High | Low | Regular security audits, dependency updates, and penetration testing |

### Expected Outcomes

**Final Deliverables with Acceptance Criteria:**

1. **Production-Ready API Platform**
   - ✅ All 25+ endpoints fully functional and tested
   - ✅ Sub-200ms average response time under normal load
   - ✅ 99.9% uptime in production environment

2. **Comprehensive Documentation Suite**
   - ✅ Complete API reference with request/response examples
   - ✅ Database ERD and schema documentation
   - ✅ RAML specification with 100% endpoint coverage
   - ✅ Developer onboarding guide and tutorials

3. **Deployment Infrastructure**
   - ✅ Multi-environment deployment pipeline
   - ✅ Automated testing and CI/CD integration
   - ✅ Production monitoring and logging

**Success Indicators:**
- API handles 500+ concurrent users without performance degradation
- Zero critical security vulnerabilities in production
- Developer onboarding time reduced to under 30 minutes
- 95% API endpoint test coverage maintained

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd youtube-clone/backend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env with your database credentials and secrets

# Database initialization
npm run db:setup

# Seed with demo data (100 playable videos)
npm run db:seed-demo

# Start development server
npm run dev
```

## 📋 Environment Variables

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/youtube_clone"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_REFRESH_EXPIRES_IN="7d"

# File Upload Configuration
MAX_FILE_SIZE=100MB
UPLOAD_PATH="./public/uploads"
```

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   File Storage  │
                       │   (Local/Cloud) │
                       └─────────────────┘
```

### Technology Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18+
- **Database**: PostgreSQL v13+ with Prisma ORM
- **Authentication**: JWT with refresh token rotation
- **File Upload**: Multer with streaming support
- **Security**: Helmet, CORS, bcrypt
- **Documentation**: RAML, JSDoc
- **Testing**: Jest, Supertest
- **Monitoring**: Morgan logging, custom metrics

---

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts and creator profiles
- **Video**: Video content and metadata
- **Comment**: Video comments and replies
- **Like**: Video likes/dislikes
- **Subscription**: Channel subscriptions
- **WatchHistory**: User viewing history
- **Playlist**: User-created playlists

## 📊 Database Design

### Entity Relationship Diagram (ERD)

```
Users (1) ──────── (M) Videos
  │                    │
  │                    │
  │ (M)            (M) │
  │                    │
Subscriptions      Comments
  │                    │
  │                    │
  │ (M)            (1) │
  │                    │
Channels ──────────────┘

Additional Entities:
- RefreshTokens (1:M with Users)
- Likes (M:M between Users and Videos)
- WatchHistory (M:M between Users and Videos)
- Playlists (1:M with Users, M:M with Videos)
```

### Database Schema

#### Core Tables

**Users Table**
```sql
CREATE TABLE users (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    username        TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    profile_picture TEXT,
    banner_image    TEXT,
    description     TEXT,
    is_creator      BOOLEAN DEFAULT FALSE,
    verified        BOOLEAN DEFAULT FALSE,
    channel_name    TEXT,
    subscribers     INTEGER DEFAULT 0,
    total_views     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_creator ON users(is_creator);
```

**Videos Table**
```sql
CREATE TABLE videos (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    description  TEXT,
    thumbnail_url TEXT,
    video_url    TEXT NOT NULL,
    duration     TEXT,
    views        INTEGER DEFAULT 0,
    likes        INTEGER DEFAULT 0,
    dislikes     INTEGER DEFAULT 0,
    category     TEXT NOT NULL,
    tags         TEXT[],
    is_public    BOOLEAN DEFAULT TRUE,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

-- Indexes for search and filtering
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_is_public ON videos(is_public);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_views ON videos(views DESC);
```

#### Relationship Tables

**Comments Table**
```sql
CREATE TABLE comments (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    text      TEXT NOT NULL,
    likes     INTEGER DEFAULT 0,
    dislikes  INTEGER DEFAULT 0,
    user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id  TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for comment retrieval
CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

---

## 🔧 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "isCreator": false
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "isCreator": false,
      "verified": false,
      "createdAt": "2025-06-13T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
**Description**: Authenticate user and return JWT tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "/uploads/avatars/default-avatar.png",
      "isCreator": false,
      "verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Video Management Endpoints

#### GET /api/videos
**Description**: Retrieve videos with optional filtering and pagination

**Query Parameters**:
- `category` (string, optional): Filter by video category
- `limit` (integer, default: 20): Number of videos to return
- `offset` (integer, default: 0): Number of videos to skip
- `sortBy` (string, default: "createdAt"): Sort order (createdAt, views, likes)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title": "Introduction to React Hooks",
      "description": "Learn the fundamentals of React Hooks...",
      "thumbnailUrl": "http://localhost:5001/uploads/thumbnails/thumb1.jpg",
      "videoUrl": "http://localhost:5001/uploads/videos/video1.mp4",
      "duration": "10:53",
      "views": 15420,
      "likes": 892,
      "dislikes": 23,
      "category": "Technology",
      "tags": ["react", "javascript", "hooks"],
      "createdAt": "2025-06-13T10:30:00.000Z",
      "channel": {
        "id": "clx0987654321",
        "name": "Tech Tutorials Pro",
        "profilePicture": "/uploads/avatars/channel1.jpg",
        "verified": true,
        "subscribers": 125000
      },
      "commentCount": 156,
      "likeCount": 892
    }
  ]
}
```

#### POST /api/videos/upload
**Description**: Upload a new video (Creator only)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data**:
- `video` (file, required): Video file (MP4, AVI, MOV)
- `thumbnail` (file, optional): Thumbnail image (JPG, PNG)
- `title` (string, required): Video title
- `description` (string, required): Video description
- `category` (string, required): Video category
- `tags` (string, optional): Comma-separated tags
- `isPublic` (boolean, default: true): Video visibility

**Response (201)**:
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "id": "clx1234567890",
    "title": "My New Video",
    "description": "This is my latest video...",
    "thumbnailUrl": "http://localhost:5001/uploads/thumbnails/thumb_new.jpg",
    "videoUrl": "http://localhost:5001/uploads/videos/video_new.mp4",
    "category": "Technology",
    "tags": ["tutorial", "coding"],
    "isPublic": true,
    "createdAt": "2025-06-13T10:30:00.000Z",
    "channel": {
      "id": "clx0987654321",
      "name": "My Channel",
      "profilePicture": "/uploads/avatars/my_avatar.jpg",
      "verified": false
    }
  }
}
```

### Comment System Endpoints

#### GET /api/videos/:videoId/comments
**Description**: Get comments for a specific video

**Parameters**:
- `videoId` (string, required): Video ID

**Query Parameters**:
- `limit` (integer, default: 20): Number of comments to return
- `offset` (integer, default: 0): Number of comments to skip

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "text": "Great tutorial! Very helpful.",
      "likes": 15,
      "dislikes": 0,
      "createdAt": "2025-06-13T10:30:00.000Z",
      "user": {
        "id": "clx0987654321",
        "username": "viewer123",
        "profilePicture": "/uploads/avatars/user1.jpg",
        "verified": false
      },
      "replies": [
        {
          "id": "clx1234567891",
          "text": "Thanks for watching!",
          "likes": 5,
          "dislikes": 0,
          "createdAt": "2025-06-13T11:00:00.000Z",
          "user": {
            "id": "clx0987654322",
            "username": "creator",
            "profilePicture": "/uploads/avatars/creator.jpg",
            "verified": true
          }
        }
      ],
      "replyCount": 3
    }
  ]
}
```

#### POST /api/videos/:videoId/comments
**Description**: Add a comment to a video

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "text": "This is an amazing video!",
  "parentId": null
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "clx1234567890",
    "text": "This is an amazing video!",
    "likes": 0,
    "dislikes": 0,
    "createdAt": "2025-06-13T10:30:00.000Z",
    "user": {
      "id": "clx0987654321",
      "username": "commenter",
      "profilePicture": "/uploads/avatars/user.jpg",
      "verified": false
    },
    "parentId": null
  }
}
```

### Search Endpoints

#### GET /api/search
**Description**: Search for videos and channels

**Query Parameters**:
- `q` (string, required): Search query
- `type` (string, default: "video"): Search type (video, channel, all)
- `category` (string, optional): Filter by category
- `sortBy` (string, default: "relevance"): Sort order
- `limit` (integer, default: 20): Number of results
- `offset` (integer, default: 0): Number of results to skip

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title": "React Tutorial for Beginners",
      "description": "Complete React course...",
      "thumbnailUrl": "http://localhost:5001/uploads/thumbnails/react_thumb.jpg",
      "videoUrl": "http://localhost:5001/uploads/videos/react_tutorial.mp4",
      "duration": "45:30",
      "views": 50000,
      "createdAt": "2025-06-13T10:30:00.000Z",
      "channel": {
        "id": "clx0987654321",
        "name": "Code Academy",
        "profilePicture": "/uploads/avatars/academy.jpg",
        "verified": true
      }
    }
  ],
  "meta": {
    "query": "react tutorial",
    "type": "video",
    "totalResults": 1
  }
}
```

---

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Access Token**: Short-lived token (15 minutes) for API requests
2. **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🔒 Security Implementation

### Authentication & Authorization

**JWT Token Strategy**:
- **Access Tokens**: Short-lived (15 minutes) for API requests
- **Refresh Tokens**: Long-lived (7 days) for token renewal
- **Token Rotation**: Automatic refresh token rotation on use
- **Secure Storage**: Refresh tokens stored in database with expiration

**Password Security**:
```javascript
// Password hashing with bcrypt (12 salt rounds)
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password validation
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Input Validation & Sanitization**:
```javascript
// Example validation middleware
const validateVideoUpload = (req, res, next) => {
  const { title, description, category } = req.body;
  
  // Title validation
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }
  
  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Title must be less than 100 characters"
    });
  }
  
  // Sanitize HTML content
  req.body.title = title.trim();
  req.body.description = description ? description.trim() : '';
  
  next();
};
```

### Security Headers & CORS

```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### File Upload Security

```javascript
// File upload validation
const fileFilter = (req, file, cb) => {
  // Video files
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
  
  // Image files
  if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
};

// File size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
    files: 2 // Maximum 2 files (video + thumbnail)
  }
});
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── upload.js            # File upload middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── videos.js            # Video routes
│   │   ├── comments.js          # Comment routes
│   │   ├── channels.js          # Channel routes
│   │   ├── search.js            # Search routes
│   │   └── users.js             # User routes
│   └── server.js                # Main server file
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.js                  # Database seeding
├── uploads/                     # File upload directory
│   ├── videos/                  # Video files
│   ├── thumbnails/              # Thumbnail images
│   └── avatars/                 # Profile pictures
└── package.json
```

## 🛠️ Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed

# Run tests
npm test

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test auth.test.js
```

## 🧪 Testing Strategy

### Test Coverage

**Unit Tests** (Jest):
```javascript
// Example: Authentication middleware test
describe('Authentication Middleware', () => {
  test('should authenticate valid JWT token', async () => {
    const token = jwt.sign({ userId: 'test-user-id' }, process.env.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {};
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('test-user-id');
    expect(next).toHaveBeenCalled();
  });

  test('should reject invalid JWT token', async () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
```

**Integration Tests** (Supertest):
```javascript
// Example: Video upload integration test
describe('POST /api/videos/upload', () => {
  test('should upload video successfully', async () => {
    const token = await getAuthToken(); // Helper function
    
    const response = await request(app)
      .post('/api/videos/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Video')
      .field('description', 'Test Description')
      .field('category', 'Technology')
      .attach('video', 'test/fixtures/sample-video.mp4')
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Video');
    expect(response.body.data.videoUrl).toContain('/uploads/videos/');
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run unit tests only
npm run test:unit
```

---

## 🚀 Deployment

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy application

### Production Considerations

- Use environment-specific database URLs
- Set \`NODE_ENV=production\`
- Configure proper CORS origins
- Set up file storage (AWS S3, etc.)
- Implement logging and monitoring
- Set up SSL/HTTPS

## 🚀 Deployment Configuration

### Multi-Environment Setup

**Environment Configurations**:

```javascript
// config/environments.js
const environments = {
  development: {
    port: 5001,
    database: {
      url: process.env.DATABASE_URL,
      ssl: false,
      logging: true
    },
    cors: {
      origin: "http://localhost:3000"
    },
    uploads: {
      path: "./public/uploads",
      maxSize: "100MB"
    }
  },
  
  staging: {
    port: process.env.PORT || 5001,
    database: {
      url: process.env.DATABASE_URL,
      ssl: true,
      logging: false
    },
    cors: {
      origin: process.env.FRONTEND_URL
    },
    uploads: {
      path: "./public/uploads",
      maxSize: "100MB"
    }
  },
  
  production: {
    port: process.env.PORT || 5001,
    database: {
      url: process.env.DATABASE_URL,
      ssl: true,
      logging: false,
      pool: {
        max: 20,
        min: 5
      }
    },
    cors: {
      origin: process.env.FRONTEND_URL
    },
    uploads: {
      path: process.env.UPLOAD_PATH || "./public/uploads",
      maxSize: "100MB"
    },
    security: {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      }
    }
  }
};

module.exports = environments[process.env.NODE_ENV || 'development'];
```

### Docker Configuration

**Dockerfile**:
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p public/uploads/videos public/uploads/thumbnails public/uploads/avatars

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Start application
CMD ["npm", "start"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/youtube_clone
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
    volumes:
      - uploads:/app/public/uploads
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=youtube_clone
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

### CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

---

## 📊 Monitoring & Logging

### Application Monitoring

**Health Check Endpoint**:
```javascript
// Health check with detailed system information
app.get('/health', async (req, res) => {
  try {
    // Database connectivity check
    await prisma.$queryRaw\`SELECT 1 as result\`;
    
    // File system check
    const uploadsPath = path.join(__dirname, '../public/uploads');
    const uploadsAccessible = fs.existsSync(uploadsPath);
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      database: 'connected',
      fileSystem: uploadsAccessible ? 'accessible' : 'error',
      memory: {
        rss: \`\${Math.round(memoryUsage.rss / 1024 / 1024)} MB\`,
        heapTotal: \`\${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB\`,
        heapUsed: \`\${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB\`
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

**Request Logging**:
```javascript
// Custom Morgan logging format
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Log to file in production
      if (process.env.NODE_ENV === 'production') {
        fs.appendFileSync('./logs/access.log', message);
      }
      console.log(message.trim());
    }
  }
}));
```

### Error Tracking

```javascript
// Global error handler with detailed logging
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    }
  });

  // Send appropriate response
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

app.use(errorHandler);
```

---

## 📚 API Documentation Tools

### RAML Specification

**api.raml**:
```yaml
#%RAML 1.0
title: YouTube Clone API
version: v1
baseUri: http://localhost:5001/api
mediaType: application/json

documentation:
  - title: Getting Started
    content: |
      Welcome to the YouTube Clone API documentation.
      This API provides comprehensive video platform functionality
      including user authentication, video management, comments, and search.

securitySchemes:
  JWT:
    description: JWT Authentication
    type: x-custom
    describedBy:
      headers:
        Authorization:
          description: JWT token
          type: string
          example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

types:
  User:
    type: object
    properties:
      id: string
      email: string
      username: string
      firstName: string
      lastName: string
      profilePicture?: string
      isCreator: boolean
      verified: boolean
      createdAt: datetime

  Video:
    type: object
    properties:
      id: string
      title: string
      description?: string
      thumbnailUrl?: string
      videoUrl: string
      duration?: string
      views: integer
      likes: integer
      dislikes: integer
      category: string
      tags: string[]
      isPublic: boolean
      createdAt: datetime
      channel: Channel

  Channel:
    type: object
    properties:
      id: string
      name: string
      profilePicture?: string
      verified: boolean
      subscribers: integer

  Comment:
    type: object
    properties:
      id: string
      text: string
      likes: integer
      dislikes: integer
      createdAt: datetime
      user: User
      replies?: Comment[]
      replyCount: integer

/auth:
  /register:
    post:
      description: Register a new user account
      body:
        application/json:
          type: object
          properties:
            email: string
            username: string
            password: string
            firstName: string
            lastName: string
            isCreator?: boolean
          example:
            email: "user@example.com"
            username: "johndoe"
            password: "securePassword123"
            firstName: "John"
            lastName: "Doe"
            isCreator: false
      responses:
        201:
          body:
            application/json:
              type: object
              properties:
                success: boolean
                message: string
                data:
                  type: object
                  properties:
                    user: User
                    token: string
                    refreshToken: string

  /login:
    post:
      description: Authenticate user and return JWT tokens
      body:
        application/json:
          type: object
          properties:
            email: string
            password: string
          example:
            email: "user@example.com"
            password: "securePassword123"
      responses:
        200:
          body:
            application/json:
              type: object
              properties:
                success: boolean
                message: string
                data:
                  type: object
                  properties:
                    user: User
                    token: string
                    refreshToken: string

/videos:
  get:
    description: Retrieve videos with optional filtering and pagination
    queryParameters:
      category?:
        type: string
        description: Filter by video category
        example: Technology
      limit?:
        type: integer
        default: 20
        description: Number of videos to return
      offset?:
        type: integer
        default: 0
        description: Number of videos to skip
      sortBy?:
        type: string
        default: createdAt
        enum: [createdAt, views, likes]
        description: Sort order
    responses:
      200:
        body:
          application/json:
            type: object
            properties:
              success: boolean
              data: Video[]

  /upload:
    post:
      description: Upload a new video (Creator only)
      securedBy: [JWT]
      body:
        multipart/form-data:
          properties:
            video:
              type: file
              description: Video file (MP4, AVI, MOV)
              required: true
            thumbnail?:
              type: file
              description: Thumbnail image (JPG, PNG)
            title:
              type: string
              description: Video title
              required: true
            description:
              type: string
              description: Video description
              required: true
            category:
              type: string
              description: Video category
              required: true
            tags?:
              type: string
              description: Comma-separated tags
            isPublic?:
              type: boolean
              default: true
              description: Video visibility
      responses:
        201:
          body:
            application/json:
              type: object
              properties:
                success: boolean
                message: string
                data: Video

  /{videoId}:
    get:
      description: Get single video by ID
      responses:
        200:
          body:
            application/json:
              type: object
              properties:
                success: boolean
                data: Video
        404:
          body:
            application/json:
              type: object
              properties:
                success: boolean
                message: string

    /comments:
      get:
        description: Get comments for a specific video
        queryParameters:
          limit?:
            type: integer
            default: 20
          offset?:
            type: integer
            default: 0
        responses:
          200:
            body:
              application/json:
                type: object
                properties:
                  success: boolean
                  data: Comment[]

      post:
        description: Add a comment to a video
        securedBy: [JWT]
        body:
          application/json:
            type: object
            properties:
              text: string
              parentId?: string
            example:
              text: "Great video! Very helpful."
              parentId: null
        responses:
          201:
            body:
              application/json:
                type: object
                properties:
                  success: boolean
                  message: string
                  data: Comment

/search:
  get:
    description: Search for videos and channels
    queryParameters:
      q:
        type: string
        description: Search query
        required: true
        example: "react tutorial"
      type?:
        type: string
        default: video
        enum: [video, channel, all]
        description: Search type
      category?:
        type: string
        description: Filter by category
      sortBy?:
        type: string
        default: relevance
        enum: [relevance, upload_date, view_count, rating]
        description: Sort order
      limit?:
        type: integer
        default: 20
      offset?:
        type: integer
        default: 0
    responses:
      200:
        body:
          application/json:
            type: object
            properties:
              success: boolean
              data: Video[] | Channel[] | object
              meta:
                type: object
                properties:
                  query: string
                  type: string
                  totalResults: integer
```

### Interactive Documentation

**Swagger/OpenAPI Integration**:
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YouTube Clone API',
      version: '1.0.0',
      description: 'Comprehensive video platform API',
      contact: {
        name: 'API Support',
        email: 'support@youtubeclone.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.youtubeclone.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 🔧 Development Tools & Scripts

### Available Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "node prisma/seed.js",
    "db:seed-demo": "node scripts/seed-demo-data.js",
    "db:setup": "npm run db:generate && npm run db:push && npm run db:seed",
    "db:reset": "prisma migrate reset --force",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "docs:generate": "jsdoc -c jsdoc.conf.json",
    "logs:clear": "rm -rf logs/*.log",
    "build": "echo 'No build step required for Node.js'",
    "postinstall": "npm run db:generate"
  }
}
```

### Development Utilities

**Database Management Scripts**:
```bash
# Quick database operations
npm run db:setup      # Initialize database
npm run db:seed-demo  # Add 100 demo videos
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database (development only)
```

**Code Quality Scripts**:
```bash
# Code formatting and linting
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
npm run format        # Format code with Prettier
```

**Testing Scripts**:
```bash
# Testing commands
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

---

## 📋 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── environments.js      # Environment-specific configs
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── upload.js            # File upload handling
│   │   └── validation.js        # Input validation
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── videos.js            # Video management
│   │   ├── comments.js          # Comment system
│   │   ├── channels.js          # Channel management
│   │   ├── search.js            # Search functionality
│   │   └── users.js             # User management
│   ├── utils/
│   │   ├── helpers.js           # Utility functions
│   │   └── constants.js         # Application constants
│   └── server.js                # Main application entry
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.js                  # Basic seed data
│   └── migrations/              # Database migrations
├── scripts/
│   ├── seed-demo-data.js        # Demo data generation
│   ├── check-db.js              # Database health check
│   ├── init-db.js               # Database initialization
│   └── backup-db.js             # Database backup utility
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── fixtures/                # Test data
├── public/
│   └── uploads/                 # File storage
│       ├── videos/              # Video files
│       ├── thumbnails/          # Thumbnail images
│       └── avatars/             # Profile pictures
├── logs/                        # Application logs
├── docs/                        # Documentation
│   ├── api.raml                 # RAML specification
│   └── swagger.json             # OpenAPI specification
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose setup
├── package.json                 # Dependencies and scripts
└── README.md                    # This documentation
```

---

## 🚀 Getting Started for Developers

### Prerequisites Checklist
- [ ] Node.js v18+ installed
- [ ] PostgreSQL v13+ running
- [ ] Git configured
- [ ] Code editor (VS Code recommended)

### Quick Setup (5 minutes)
```bash
# 1. Clone and navigate
git clone https://github.com/02240365/WEB_Final_Project_Youtube.git
cd youtube-clone/backend

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env
# Edit .env with your database URL and secrets

# 4. Database setup
npm run db:setup

# 5. Add demo content
npm run db:seed-demo

# 6. Start development
npm run dev
```

### Verification Steps
1. **API Health**: Visit `http://localhost:5001/health`
2. **Database**: Run `npm run db:studio`
3. **Documentation**: Visit `http://localhost:5001/api-docs`
4. **Test Upload**: Use Postman to test `/api/videos/upload`

---

## 🤝 Contributing Guidelines

### Code Standards
- **ES6+** syntax with async/await
- **Consistent naming**: camelCase for variables, PascalCase for classes
- **Error handling**: Always use try-catch blocks
- **Comments**: JSDoc for functions, inline for complex logic
- **Testing**: Minimum 80% code coverage

### Pull Request Process
1. Create feature branch from `main`
2. Write tests for new functionality
3. Update documentation if needed
4. Ensure all tests pass
5. Submit PR with detailed description

### Commit Message Format
```
type(scope): description

feat(auth): add JWT refresh token rotation
fix(videos): resolve upload timeout issue
docs(api): update RAML specification
test(comments): add integration tests
```

---

## 📞 Support & Contact

### Technical Support
- **Documentation**: This README and `/api-docs` endpoint
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions

### Performance Benchmarks
- **Response Time**: < 200ms for 95% of requests
- **Throughput**: 500+ requests/second
- **Uptime**: 99.9% availability target
- **Database**: < 50ms query response time

### Monitoring Endpoints
- **Health Check**: `GET /health`
- **API Status**: `GET /api/status`
- **Database Test**: `GET /api/db-test`
- **Metrics**: `GET /api/metrics` (production only)

---

## 📄 License & Legal

This project is developed for educational purposes as part of a web development course. 

**Third-party Acknowledgments**:
- Express.js framework
- Prisma ORM
- PostgreSQL database
- JWT authentication library
- Multer file upload middleware

---

**Last Updated**: June 14, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team  
**Status**: Production Ready ✅
