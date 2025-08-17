# Domexis Server

## Overview

Domexis Server is a Node.js/Express backend for the Domexis building management application. It provides RESTful APIs for user management, apartment agreements, payments, coupons, and announcements. The server uses MongoDB for data storage, Firebase Admin for authentication, and Stripe for payment processing.

## Features

- User registration, authentication, and role management (admin, member, user)
- Apartment and agreement management
- Coupon creation, update, and deletion
- Payment processing and history (Stripe integration)
- Announcements CRUD
- Secure endpoints with Firebase token verification

## Installation

1. **Clone the repository:**
   ```
   git clone [repository-url]
   cd Domexis-server-site
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Environment setup:**
   - Create a `.env` file in the root directory with the following variables:
     ```
     DB_USER=your_mongodb_user
     DB_PASS=your_mongodb_password
     PAYMENT_GATEWAY_KEY=your_stripe_secret_key
     ```
   - Place your Firebase Admin SDK JSON as `firebase-admin-key.json` in the root directory.

## Usage

Start the server with:

```
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

- **Users:**  
  `GET /users`  
  `GET /users/:email`  
  `POST /users`  
  `PATCH /users/:id/remove-member`  

- **Coupons:**  
  `GET /coupons`  
  `POST /coupons`  
  `PUT /coupons/:id`  
  `DELETE /coupons/:id`  

- **Apartments:**  
  `GET /apartment`  
  `PATCH /apartment/:apartmentNo`  

- **Agreements:**  
  `GET /agreements`  
  `POST /agreements`  
  `PATCH /agreements/:id`  
  `DELETE /agreements/:id`  

- **Payments:**  
  `GET /payments`  
  `POST /payments/complete`  
  `POST /create-payment-intent`  

- **Announcements:**  
  `GET /announcements`  
  `POST /announcements`  
  `PUT /announcements/:id`  
  `DELETE /announcements/:id`  

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[Specify your license here]