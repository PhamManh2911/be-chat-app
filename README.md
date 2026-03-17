# 🚀 Real-time Chat Application

A scalable real-time chat backend built with **Node.js, Express, and Socket.io**, designed to handle concurrent users with low-latency messaging. The system emphasizes **robust API design**, **data consistency**, and **high test coverage**.

---

## ✨ Features

- ⚡ **Real-time messaging** using WebSockets (Socket.io)
- 🔁 **Idempotent API design** to prevent duplicate message processing
- 📄 **Cursor-based pagination** for efficient message history retrieval
- ✅ **Request validation** using class-validator for strict API contracts
- 🧪 **Comprehensive testing** with Jest and Supertest
- 🧵 **Concurrent connection handling** for multiple users
- 💾 **Message persistence** with NoSQL database (e.g., MongoDB)

---

## 🏗️ Architecture Overview

The application follows an **event-driven architecture**:

- **HTTP Layer (Express)** → Handles REST APIs (auth, message history, etc.)
- **WebSocket Layer (Socket.io)** → Handles real-time communication
- **Service Layer** → Business logic (message processing, idempotency)
- **Database Layer** → Stores messages and user data
- **Validation Layer** → Ensures request integrity using class-validator

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Realtime:** Socket.io with Redis Pub/sub (as adapter)
- **Database:** MongoDB
- **Validation:** class-validator
- **Testing:** Jest, Supertest

---

## 📦 Installation

```bash
git clone https://github.com/PhamManh2911/be-chat-app
cd be-chat-app
yarn
```

---

## ⚙️ Environment Variables

Create a `.env.development` file:

```env
BE_APP_PORT=3000
BE_APP_NAME=chat-service
BE_APP_MONGO_DB_URI=mongodb://username:password@127.0.0.1:27017/chat?authSource=admin
BE_APP_CACHE_URI=redis://127.0.0.1:6379/test
BE_APP_CORS_ORIGIN=*
BE_APP_JWT_SECRET=BE_APP_JWT_SECRET
BE_APP_AUTH_SERVICE_URL=http://127.0.0.1:4000
```

---

## ▶️ Running the App

```bash
# development
yarn start:dev

# production
yarn build:fresh
yarn start:pro
```

---

## 🧪 Running Tests

Create a `.env.test` file:

```env
BE_APP_PORT=0
BE_APP_NAME=chat-service
BE_APP_MONGO_DB_URI=mongodb://127.0.0.1:27017/test
BE_APP_CACHE_URI=redis://127.0.0.1:6379
BE_APP_CORS_ORIGIN=http://127.0.0.1:5173
BE_APP_JWT_SECRET=9c7489a266d5f1a303ebe7dd6a6548a1
BE_APP_AUTH_SERVICE_URL=http://127.0.0.1:4000
```

```bash
yarn test
```

- Unit and integration tests are implemented using **Jest** and **Supertest**
- Covers API endpoints, validation, and idempotency behavior

---

## 🔁 Idempotency Design

To ensure **safe retries** (e.g., network failures), APIs support idempotent requests:

- Each request includes a unique **idempotency key**
- Duplicate requests with the same key are **ignored or return cached results**
- Prevents duplicate message creation

---

## 📄 Pagination Strategy

Implemented **cursor-based pagination** for message history:

- Uses `cursor` (e.g., message ID or timestamp) instead of offset
- Improves performance for large datasets
- Ensures consistent results even with concurrent writes

---

## ✅ Validation

All incoming requests are validated using **class-validator**:

- Enforces strict DTO schemas
- Prevents malformed or invalid data
- Improves API reliability and maintainability

---

## 🚀 Future Improvements

- Redis Pub/Sub for horizontal scaling
- Authentication (JWT / OAuth)
- Message queue for async processing (Bull / Kafka)
- Docker & Kubernetes deployment
- Read receipts & typing indicators

---

## 📌 Summary

This project demonstrates:

- Real-time system design
- Event-driven architecture
- Backend reliability (idempotency, validation)
- Scalable data access patterns (cursor pagination)
- Strong testing practices
- Heavy write application
