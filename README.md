# Payment Provider System

A backend payment processing system built using NestJS, TypeScript, PostgreSQL, and Sequelize.

This project simulates a real-world payment provider with:
- Authentication
- Card management
- Payment processing
- Retry mechanisms
- Idempotency protection
- Transaction state machine
- Metrics and analytics
- E2E testing

---

# Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Jest + Supertest
- Docker

---

# Features

## Authentication
- User Registration
- User Login
- JWT-based authentication

---

## Card Management
- Add payment cards
- Luhn algorithm validation
- Dynamic card type detection
- Card tokenization
- Secure masked card response

---

## Payment Processing
- Payment authorization simulation
- Mock bank integration
- Transaction state machine

### Transaction States
- INITIATED
- PROCESSING
- AUTHORIZED
- CAPTURED
- FAILED
- RETRYING

---

## Retry Mechanism
- Automatic retry for retryable failures
- Exponential backoff with jitter
- Retry attempt tracking
- Retry state history

Retryable errors:
- NETWORK_TIMEOUT
- RATE_LIMIT_EXCEEDED

---

## Idempotency Protection
Prevents duplicate payment processing caused by:
- Frontend retries
- User double clicks
- Network retries

Implemented using:
- `Idempotency-Key` header
- Database validation
- Request guard

---

## Metrics API
Provides:
- Total transactions
- Success/failure rates
- Retry analytics
- Processing time metrics
- Transaction status distribution

---

# Project Structure

```bash
src/
│
├── auth/
├── cards/
├── payments/
├── bank/
├── guards/
├── models/
├── metrics/
├── common/
│
└── main.ts
```

---

# Database Tables

| Table | Purpose |
|---|---|
| users | Store user accounts |
| cards | Store tokenized card data |
| transactions | Store payment transactions |
| transaction_state_history | Track transaction state changes |
| idempotency_keys | Prevent duplicate requests |

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone <repository-url>
cd payment-provider
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create `.env`

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=payment_provider

JWT_SECRET=mySecretKey
```

---

## 4. Start PostgreSQL Using Docker

```bash
docker-compose up -d
```

---

## 5. Start Application

```bash
npm run start:dev
```

Application runs on:

```bash
http://localhost:3000
```

---

# API Endpoints

## Authentication

### Register

```http
POST /auth/register
```

Request:

```json
{
  "email": "test@gmail.com",
  "password": "password123"
}
```

---

### Login

```http
POST /auth/login
```

---

## Cards

### Add Card

```http
POST /cards
```

Headers:

```http
Authorization: Bearer <token>
```

---

### Get Cards

```http
GET /cards
```

---

## Payments

### Create Payment

```http
POST /payments
```

Headers:

```http
Authorization: Bearer <token>
Idempotency-Key: payment-123
```

Request:

```json
{
  "cardToken": "uuid",
  "amount": 100,
  "currency": "USD"
}
```


### Mock Bank Failure Simulation

The internal mock bank service simulates:
- Success: 85%
- Insufficient funds: 8%
- Invalid card: 2%
- Card expired: 2%
- Network timeout: 2%
- Rate limit exceeded: 1%

Variable response time:
- 100ms to 3000ms

## Rate Limiting

Implemented using NestJS Throttler module.

Configuration:
- 10 requests per minute per user/IP

Purpose:
- Prevent API abuse
- Protect payment endpoints
- Improve system stability



## Observability & Logging

Implemented structured logging with:
- Correlation IDs
- Event-based logs
- Retry logs
- Error logs
- Payment lifecycle tracking

Each request generates a unique correlation ID which is propagated across logs for traceability and debugging.
---

## Metrics

### Get Metrics

```http
GET /metrics
```

Headers:

```http
Authorization: Bearer <token>
```


Example Response:

```json
{
  "overview": {
    "totalTransactions": 12,
    "successfulTransactions": 9,
    "failedTransactions": 3,
    "successRate": "75.00%"
  }
}
```

---

# Running Tests

## Run E2E Tests

```bash
npm run test:e2e
```

---

# Test Coverage Includes

- User registration
- User login
- Invalid card validation
- Payment processing
- Retry handling
- Idempotency protection

---

# Architecture Decisions

## Why Idempotency?
To prevent duplicate payment processing caused by:
- Network retries
- Double-clicks
- Frontend retry mechanisms

---

## Why Transaction State History?
Provides:
- Audit trail
- Debugging capability
- Payment lifecycle tracking

---

## Why Retry Mechanism?
Improves reliability for temporary failures such as:
- Network timeouts
- Rate limiting

---

# Future Improvements

- Redis-based idempotency cache
- Async event processing
- Payment webhooks
- Circuit breaker pattern
- Swagger API documentation
- PCI-compliant card encryption

---


## ER Diagram 

┌─────────────────────┐
│        users        │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ password            │
│ createdAt           │
│ updatedAt           │
└─────────┬───────────┘
          │ 1
          │
          │ N
┌─────────▼───────────┐
│        cards        │
├─────────────────────┤
│ id (PK)             │
│ userId (FK)         │
│ cardToken           │
│ maskedCardNumber    │
│ cardType            │
│ expiryMonth         │
│ expiryYear          │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘


┌─────────────────────┐
│        users        │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ password            │
└─────────┬───────────┘
          │ 1
          │
          │ N
┌─────────▼──────────────┐
│      transactions      │
├────────────────────────┤
│ id (PK)                │
│ userId (FK)            │
│ cardToken              │
│ amount                 │
│ currency               │
│ status                 │
│ retryCount             │
│ authorizationCode      │
│ failureReason          │
│ createdAt              │
│ updatedAt              │
└─────────┬──────────────┘
          │ 1
          │
          │ N
┌─────────▼────────────────────┐
│  transaction_state_history   │
├──────────────────────────────┤
│ id (PK)                      │
│ transactionId (FK)           │
│ fromState                    │
│ toState                      │
│ reason                       │
│ createdAt                    │
└──────────────────────────────┘


┌────────────────────────┐
│      transactions      │
├────────────────────────┤
│ id (PK)                │
└─────────┬──────────────┘
          │ 1
          │
          │ 1
┌─────────▼──────────────┐
│    idempotency_keys    │
├────────────────────────┤
│ id (PK)                │
│ idempotencyKey         │
│ transactionId (FK)     │
│ createdAt              │
│ updatedAt              │
└────────────────────────┘

# Author

Rupesh Parmar