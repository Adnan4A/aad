# Overview

This project is a full-stack TypeScript cryptocurrency dashboard providing real-time market data, user authentication, watchlist management, and advanced analytics. It features an intuitive web interface with a distinctive liquid frosted glass design, integrating Firebase for authentication and CoinGecko API for market data. The application offers interactive components like live price tickers, market tables with pagination, a comprehensive watchlist, and analytical charts, alongside multi-source news aggregation and a social feed. The core vision is to offer a robust, real-time, and user-centric platform for cryptocurrency enthusiasts and traders.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is a React 18 Single Page Application (SPA) using TypeScript, Wouter for routing, and TanStack Query for state management and caching. Styling is managed with Tailwind CSS and custom CSS variables, complemented by Radix UI primitives and shadcn/ui components for a consistent glass morphism design aesthetic. The application follows a component-based architecture with clear separation of concerns, built with Vite for fast development.

## Backend Architecture

The server is built with Node.js and Express.js, following a RESTful API pattern. It uses TypeScript with ES modules and Zod for type-safe data validation. An in-memory caching strategy with TTL is implemented for API rate limit management. The backend integrates with CoinGecko for market data and various news sources (CryptoPanic, CoinDesk RSS, Cointelegraph RSS).

## Data Storage Solutions

Currently, the application uses in-memory caching for API responses. While no persistent data storage is actively implemented, Drizzle ORM is configured with PostgreSQL support, and database migrations are set up for future expansion.

## Authentication and Authorization

Firebase Authentication is integrated for user management, including Google OAuth sign-in, user profile management via Firestore, and session persistence. User data, including watchlists, is stored in Firestore with real-time synchronization. Authentication components include an AuthButton and custom React hooks for state management, securing protected routes.

## UI/UX Design

The application features a unified liquid frosted glass design across all components, including headers, widgets, and menus. This is characterized by enhanced blur effects (25px backdrop-filter), improved shadow depth, cubic-bezier animations, and responsive liquid scrollbars. The design is optimized for both mobile and desktop, incorporating loading states and skeleton screens for an improved user experience. Professional transparency gradients and consistent styling are applied throughout.

## Core Features

- **Real-Time Data**: 1-second real-time price updates across the entire application, with synchronized price movements and immediate data refresh.
- **Interactive Markets**: Comprehensive market tables with pagination, sorting, search, filtering, RSI indicators, sparkline charts, and detailed coin information. All coins are clickable and interactive.
- **Analytics & Charts**: Dedicated analytics page with interactive charts (Bitcoin and Ethereum initially) featuring crosshairs and timeframe switching. Charts exclusively use authentic CoinGecko API data.
- **User Watchlist**: Personal cryptocurrency tracking and favorites management powered by Firebase, with interactive star-based toggles and a dedicated watchlist page.
- **Global Market Insights**: Integration of real-time market hours (NYSE, LSE, TSE) and global market widgets (MarketCap, Volume, BTC Dominance) within the transparent header navigation. Heatmap and Global insights pages use authentic API data.
- **News & Social Feed**: Multi-source news aggregation from CryptoPanic, CoinDesk RSS, and Cointelegraph RSS, alongside a Twitter-like crypto social feed. Features include category filtering, real-time updates, and a white liquid glass design.
- **User Profile System**: Comprehensive profile management allowing users to edit personal details, manage preferences (theme, currency, notifications), and view trading statistics. Features enhanced avatar upload/download.

# External Dependencies

- **CoinGecko API**: Primary data source for all cryptocurrency market data (global stats, coin listings, details, historical data, search).
- **Firebase**: Authentication (Google OAuth) and Firestore database for user profiles, watchlists, and secure user data storage.
- **CryptoPanic API**: Real-time news aggregation.
- **CoinDesk RSS / Cointelegraph RSS**: Direct parsing for immediate news updates.
- **Trading Hours API**: Integration for real-time market status.
- **Google Fonts**: Typography.
- **Replit-specific Plugins**: Development tools for runtime error handling within the Replit environment.