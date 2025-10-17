# Clothing Website Backend

A complete backend API for the clothing website built with Node.js, Express, MongoDB, and Cloudinary.

## Features

- **Authentication System**
  - User registration with email verification
  - Login/logout functionality
  - Password reset via email
  - JWT token-based authentication
  - Protected routes

- **Product Management**
  - CRUD operations for products
  - Product categories and filtering
  - Image upload with Cloudinary
  - Product reviews and ratings
  - Search functionality

- **Order Management**
  - Create and manage orders
  - Order status tracking
  - Order history for users
  - Admin order management

- **Shopping Cart & Wishlist**
  - Add/remove items from cart
  - Update cart quantities
  - Wishlist functionality
  - Persistent cart data

- **Security Features**
  - Password hashing with bcrypt
  - JWT token authentication
  - Rate limiting
  - CORS protection
  - Input validation

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGO_URI=mongodb+srv://joshisarthak556:Sart9426@cluster0.abjmdff.mongodb.net/clothingwebsite
PORT=5000
CLIENT_URL=http://localhost:3000
CLOUD_NAME=dtgms7yog
CLOUD_API_KEY=524251772772498
CLOUD_API_SECRET=EcNSWVkoFc5Hyt1HD9yKY0AKupI
CLOUDINARY_URL=cloudinary://524251772772498:EcNSWVkoFc5Hyt1HD9yKY0AKupI@dtgms7yog
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRE=7d
NODE_ENV=development
```

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Send password reset email
- `PUT /api/auth/resetpassword/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search` - Search products

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id` - Update order status (Admin)
- `DELETE /api/orders/:id` - Delete order (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove product from wishlist
- `DELETE /api/wishlist` - Clear wishlist

## Database Models

### User
- Personal information (name, email, phone, address)
- Authentication data (password, tokens)
- Role-based access control
- Email verification status

### Product
- Product details (name, description, price, images)
- Category and subcategory
- Size and color variants
- Stock management
- Reviews and ratings

### Order
- Order items with product details
- Shipping information
- Payment information
- Order status tracking

### Cart
- User's shopping cart items
- Quantity and variant selection
- Price calculations

### Wishlist
- User's saved products
- Quick access to favorite items

## Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for frontend integration

## Error Handling

- Centralized error handling middleware
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging

## Development

The backend uses:
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and management
- **Nodemailer** - Email sending
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

## Testing

To test the API endpoints, you can use:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Frontend application

## Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a secure JWT secret
3. Configure proper CORS origins
4. Set up SSL certificates
5. Use a process manager like PM2
6. Configure proper logging
