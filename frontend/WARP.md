# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the frontend component of a Social Commerce AI Platform, built as a React TypeScript application using Create React App. The app combines traditional e-commerce functionality with social media features, allowing users to discover, share, and shop products through a social interface.

## Core Technology Stack

- **Framework**: React 19.1.1 with TypeScript
- **UI Library**: Material-UI (MUI) v7 with Emotion styling
- **State Management**: Currently using local React state (has Redux Toolkit installed but not implemented)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.IO Client
- **Testing**: React Testing Library with Jest
- **Build Tool**: React Scripts (Create React App)

## Essential Commands

### Development
```bash
npm start                 # Start development server (runs on http://localhost:3000)
npm run build            # Build for production
npm test                 # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage report
```

### Testing
```bash
npm test                           # Run all tests in watch mode
npm test -- --watchAll=false      # Run tests once
npm test App.test.tsx              # Run specific test file
npm test -- --testNamePattern="renders" # Run tests matching pattern
```

## Architecture and Structure

### Application Architecture
The application follows a **single-page application (SPA) monolithic component structure**:

- **Monolithic App Component**: All application logic is contained within `src/App.tsx` (~1,057 lines)
- **View-based Navigation**: Uses conditional rendering based on `currentView` state instead of React Router
- **Component-in-Component Pattern**: UI components (ProductCard, PostCard, CartDrawer) are defined within App.tsx
- **Mock Data Architecture**: Currently uses hardcoded mock data for products, categories, and social posts

### State Management Pattern
The application uses **local React state** with useState hooks for:
- `searchQuery`: Product search functionality
- `currentView`: Navigation/page state ('home', 'products', 'categories', 'deals', 'feed', 'cart', 'wishlist')
- `selectedCategory`: Product filtering
- `cartItems`: Shopping cart state
- `wishlistItems`: User wishlist
- `sortBy` & `priceRange`: Product filtering and sorting

### Key Business Logic Components

#### Product Management
- **Product Catalog**: 15 hardcoded products across 6 categories (Electronics, Fashion, Home & Garden, Sports & Fitness, Beauty & Health, Books & Media)
- **Search & Filter**: Text search, category filtering, price range filtering
- **Sorting**: By popularity, price (low/high), rating, newest

#### Shopping Cart System
- Add/remove products with quantity management
- Cart state persistence during session
- Drawer-based cart interface
- Total calculation with quantity

#### Social Features
- **Social Feed**: Mock posts with product attachments
- **Wishlist**: Heart-based favoriting system
- **Product Interactions**: Like counts and social sharing buttons

### UI Architecture
- **Material-UI Design System**: Consistent theming and components
- **Responsive Grid Layout**: Uses MUI Grid and responsive breakpoints
- **Modal/Drawer Pattern**: Cart, authentication, and detail views
- **Card-based Product Display**: Standardized ProductCard component

## Development Guidelines

### Component Development
When creating new components, maintain consistency with the existing Material-UI design patterns. Use the established card-based layout for product displays and maintain the same prop structure.

### State Management Migration Path
The application has Redux Toolkit installed but not implemented. Future state management should consider:
- Moving complex state (cart, wishlist, user) to Redux
- Implementing proper API integration layers
- Adding state persistence

### Data Layer Evolution
Current mock data should be replaced with:
- API service layers using Axios
- TypeScript interfaces for data models
- Error handling and loading states

### Testing Strategy
The application uses React Testing Library with a basic test setup. Key areas for testing:
- Component rendering with different props
- User interactions (cart, wishlist, search)
- State management logic
- Navigation flows

## Deployment Configuration

The application is configured for **Vercel deployment** with:
- Static build process using `@vercel/static-build`
- SPA routing handled by catch-all route to `index.html`
- Static asset caching configuration
- Build output directory: `build/`

## Integration Points

### Prepared for Backend Integration
The application structure suggests integration with:
- **AI Services**: Socket.IO client ready for real-time AI features
- **Authentication System**: Auth modal structure in place
- **Product API**: Axios configured for HTTP requests
- **Real-time Features**: Socket.IO for live updates and social features

### Related Services
This frontend is part of a larger social commerce platform that includes:
- AI services backend (FastAPI with ML capabilities)
- Product recommendation systems
- User authentication and social features