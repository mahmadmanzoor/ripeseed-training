# Testing Documentation

This document outlines the comprehensive testing strategy for the Mini Store application.

## Testing Structure

### 1. Backend Testing (Jest + Supertest)

- **Location**: `backend/src/__tests__/`
- **Framework**: Jest with TypeScript support
- **Coverage**: Unit tests, integration tests, API endpoint tests

#### Test Files

- `auth.test.ts` - Authentication route tests
- `payment.test.ts` - Payment processing tests
- `integration.test.ts` - End-to-end API flow tests
- `setup.ts` - Test database configuration

#### Running Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### 2. Frontend Testing (Vitest + Testing Library)

- **Location**: `frontend/src/__tests__/`
- **Framework**: Vitest with React Testing Library
- **Coverage**: Component tests, user interaction tests

#### Test Files (Backend)

- `components/PaymentModal.test.tsx` - Payment modal component tests
- `components/Navbar.test.tsx` - Navigation component tests
- `pages/HomePage.test.tsx` - Homepage component tests
- `setup.ts` - Test environment configuration

#### Running Frontend Tests

```bash
cd frontend
npm test                   # Run all tests
npm run test:ui           # UI mode
npm run test:coverage    # With coverage report
```

### 3. End-to-End Testing (Playwright)

- **Location**: `e2e/`
- **Framework**: Playwright
- **Coverage**: Complete user flows, cross-browser testing

#### Test Files (Frontend)

- `auth.spec.ts` - Authentication flow tests
- `payment.spec.ts` - Payment flow tests
- `user-flow.spec.ts` - Complete user journey tests

#### Running E2E Tests

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # UI mode
npm run test:e2e:headed   # Headed mode (visible browser)
```

## Test Coverage

### Backend Coverage

- ✅ User registration and authentication
- ✅ JWT token validation
- ✅ Payment processing
- ✅ Database operations
- ✅ Error handling
- ✅ API endpoint responses

### Frontend Coverage

- ✅ Component rendering
- ✅ User interactions
- ✅ Form validation
- ✅ Modal functionality
- ✅ Navigation
- ✅ State management

### E2E Coverage

- ✅ Complete user registration flow
- ✅ Login/logout functionality
- ✅ Payment modal interactions
- ✅ Navigation between pages
- ✅ Cross-browser compatibility

## Running All Tests

From the root directory:

```bash
npm run test:all          # Run backend + frontend + E2E tests
```

## Test Database Setup

The backend tests use a separate test database:

- **Database**: `mini_store_test_db`
- **Environment**: `TEST_DATABASE_URL`
- **Cleanup**: Automatic cleanup after each test

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

- Backend tests with database setup
- Frontend tests with mocked APIs
- E2E tests with headless browsers
- Coverage reporting for all test types

## Best Practices

1. **Test Isolation**: Each test is independent
2. **Data Cleanup**: Automatic cleanup after tests
3. **Mocking**: External dependencies are mocked
4. **Coverage**: Aim for >80% code coverage
5. **Performance**: Tests should run quickly
6. **Reliability**: Tests should be deterministic

## Debugging Tests

### Backend Tests

```bash
cd backend
npm run test:watch -- --verbose
```

### Frontend Tests

```bash
cd frontend
npm run test:ui
```

### E2E Tests

```bash
npm run test:e2e:headed -- --debug
```

## Test Data Management

- **Backend**: Uses test database with automatic cleanup
- **Frontend**: Uses mocked API responses
- **E2E**: Uses real application with test data

## Coverage Reports

Coverage reports are generated in:

- Backend: `backend/coverage/`
- Frontend: `frontend/coverage/`
- E2E: `test-results/`
