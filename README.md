# ShopEase E-Commerce Platform

<div align="center">
  <img src="generated-icon.png" alt="ShopEase Logo" width="120" />
  <h3>A modern, responsive e-commerce platform built with React and Express</h3>
</div>

## ✨ Features

### 🛍️ Product Management
- **Product Listings**: Browse products with detailed information including descriptions, pricing, and ratings
- **Category Filtering**: Filter products by categories to find what you need quickly
- **Search Functionality**: Search for products across the entire catalog
- **Featured Products**: Showcase special products on the homepage
- **Responsive Product Grid**: Optimized viewing experience on any device

### 🛒 Shopping Cart
- **Add to Cart**: Easily add products with quantity selection
- **Update Quantities**: Increase or decrease product quantities
- **Remove Items**: Remove unwanted items from cart
- **Persistent Cart**: Cart data persists across sessions for logged-in users
- **Cart Summary**: View subtotal and item counts

### 👤 User Authentication
- **Secure Login**: Username/password authentication
- **User Registration**: Create new accounts with email verification
- **Protected Routes**: Secure checkout and user-specific pages
- **User Profile**: View and manage personal information

### 💳 Checkout Process
- **Shipping Information**: Enter shipping details
- **Billing Information**: Option for separate billing addresses
- **Payment Methods**: Support for multiple payment options
- **Order Summary**: Review items and total before purchase
- **Order Confirmation**: Confirmation page with order details

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile, tablet, and desktop
- **Adaptive Layout**: Interface adjusts to different screen sizes
- **Touch-Friendly**: Touch-optimized interactions for mobile users

## 🚀 Tech Stack

### Frontend
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Wouter**: Lightweight routing solution
- **TanStack Query**: Data fetching and state management
- **React Hook Form**: Form validation and handling
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Accessible and customizable UI components
- **Lucide Icons**: Beautiful and consistent icon set

### Backend
- **Express**: Node.js web application framework
- **TypeScript**: Type-safe JavaScript
- **Drizzle ORM**: Modern database toolkit
- **PostgreSQL**: Relational database (optional in-memory storage for development)
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **Zod**: API validation

### Tools & Utilities
- **Vite**: Next generation frontend tooling
- **ESBuild**: Extremely fast JavaScript bundler
- **Drizzle Kit**: Database schema migration tooling
- **Tailwind Merge**: Smart way to merge Tailwind CSS classes

## 🏗️ Architecture

The application follows a modern full-stack architecture:

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and services
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main application component
│   │
├── server/                # Backend Express application  
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage interface
│   └── index.ts           # Server entry point
│
└── shared/                # Shared code between client and server
    └── schema.ts          # Database schema and types
```

## 📦 Data Model

The application is built around the following core entities:

- **Users**: Customer accounts with authentication data
- **Products**: Items available for purchase with details and pricing
- **Categories**: Product organization and filtering
- **Cart Items**: Products added to a user's shopping cart
- **Orders**: Completed purchases with shipping and billing information
- **Order Items**: Individual products within an order

## 🚗 Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/shopease.git
cd shopease
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## 📝 Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string (optional, in-memory DB used by default)
- `SESSION_SECRET`: Secret key for session encryption
- `PORT`: Port number for the server (default: 5000)

## 🙏 Acknowledgements

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component system
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) for the icon set
- [Unsplash](https://unsplash.com/) for product images

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.