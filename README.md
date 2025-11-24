# WOT API: Seamless Order Management & Customer Engagement 🚀

## Overview
WOT (Whatsapp Order Transparency) is a robust backend service built with **NestJS** and **TypeScript**, leveraging **Supabase** for data persistence and authentication. It provides comprehensive order management functionalities for Small and Medium Enterprises (SMEs), integrating with **WhatsApp Business API (WABA)** for real-time customer and rider notifications.

## Features
- **Order Management**: Create, retrieve, and update the status of orders.
- **Supabase Integration**: Secure user authentication and efficient data storage using Supabase.
- **Authentication & Authorization**: JWT-based authentication via Supabase, protecting sensitive endpoints.
- **Real-time Notifications**: Automated WhatsApp notifications for rider assignment, customer dispatch, and delivery completion.
- **Public Order Tracking**: Customers and riders can track order status using unique tokens without requiring authentication.
- **Customer Satisfaction (CSAT)**: Public endpoint for customers to submit feedback on delivered orders.
- **API Documentation**: Built-in interactive API documentation with Swagger for easy exploration.

## Getting Started

### Installation
To get the WOT API running locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url> # Replace with your repository URL
    cd WOT
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Build the Project**:
    ```bash
    npm run build
    ```
4.  **Start the Development Server**:
    ```bash
    npm run start:dev
    ```
    The API will be available at `http://localhost:3000/api/v1` by default, or the port specified in your `.env`.
    The Swagger API documentation will be available at `http://localhost:3000/api/docs`.

### Environment Variables
Create a `.env` file in the root directory and populate it with the following required variables. These are crucial for connecting to Supabase and securing your application.

```ini
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-from-supabase-project-settings
JWT_SECRET=a-strong-random-secret-key-for-jwt-signing
PORT=3000 # Optional, default is 3000
```
*   `SUPABASE_URL`: Your Supabase project URL, found in your Supabase project settings.
*   `SUPABASE_KEY`: Your Supabase "anon" public key.
*   `JWT_SECRET`: A secret string used to sign and verify JWT tokens. This should be a strong, randomly generated string.

## Usage
Once the API is running, you can interact with it using tools like Postman, curl, or through the Swagger UI at `/api/docs`.

### Authenticated Operations (SMEs)
SMEs can manage their orders by authenticating with a JWT token obtained from Supabase. The token should be included in the `Authorization` header as `Bearer <YOUR_JWT_TOKEN>`.

**Example: Creating an Order**
```bash
curl -X POST http://localhost:3000/api/v1/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
-d '{
    "customer_name": "Alice Smith",
    "customer_phone": "+2349012345678",
    "delivery_address": "456 Oak Ave, Abuja",
    "price_total": 2500.50
}'
```

**Example: Fetching All Orders**
```bash
curl -X GET http://localhost:3000/api/v1/orders \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Example: Updating Order Status to 'READY' (requires rider_phone)**
```bash
curl -X PATCH http://localhost:3000/api/v1/orders/<order_id>/status \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
-d '{
    "status": "READY",
    "rider_phone": "+2348098765432"
}'
```

### Public Operations (Customers/Riders)
Public endpoints do not require authentication and are used for tracking and feedback.

**Example: Tracking an Order by Token**
```bash
curl -X GET http://localhost:3000/api/v1/public/orders/<order_token>
```

**Example: Submitting CSAT for an Order**
```bash
curl -X POST http://localhost:3000/api/v1/public/orders/<order_token>/csat \
-H "Content-Type: application/json" \
-d '{
    "csat_score": 5,
    "csat_comment": "Excellent delivery experience!"
}'
```

## API Documentation

### Base URL
`http://localhost:3000/api/v1` (or your configured host and port)

### Endpoints

#### POST /orders
Creates a new order for the authenticated SME.

**Request**:
```json
{
  "customer_name": "string",  // Required: Name of the customer
  "customer_phone": "string", // Required: Phone number of the customer (e.g., '+2348012345678')
  "delivery_address": "string", // Required: Full delivery address
  "price_total": 0             // Required: Total price of the order
}
```

**Response**:
```json
{
  "sme_id": "string (UUID)",
  "customer_name": "string",
  "customer_phone": "string",
  "delivery_address": "string",
  "price_total": 0,
  "status": "NEW",
  "id": "string (UUID)",
  "created_at": "ISO 8601 Date String"
}
```

**Errors**:
- `400 Bad Request`: Invalid payload or missing required fields.
- `401 Unauthorized`: No valid JWT token provided.

#### GET /orders
Retrieves all orders associated with the authenticated SME, ordered by creation date (descending).

**Request**:
(No payload)

**Response**:
```json
[
  {
    "sme_id": "string (UUID)",
    "customer_name": "string",
    "customer_phone": "string",
    "delivery_address": "string",
    "price_total": 0,
    "status": "NEW",
    "id": "string (UUID)",
    "created_at": "ISO 8601 Date String",
    "updated_at": "ISO 8601 Date String",
    "rider_phone": "string | null",
    "rider_token": "string | null",
    "customer_token": "string | null",
    "csat_score": "number | null",
    "csat_comment": "string | null"
  }
]
```

**Errors**:
- `401 Unauthorized`: No valid JWT token provided.

#### PATCH /orders/:id/status
Updates the status of an existing order. Triggers WhatsApp notifications based on status transitions.

**Request**:
```json
{
  "status": "NEW" | "PROCESSING" | "READY" | "DISPATCHED" | "COMPLETED" | "CANCELLED", // Required: New status for the order
  "rider_phone": "string" // Required if status is "READY" (e.g., '+2348098765432')
}
```

**Response**:
```json
{
  "sme_id": "string (UUID)",
  "customer_name": "string",
  "customer_phone": "string",
  "delivery_address": "string",
  "price_total": 0,
  "status": "READY",
  "id": "string (UUID)",
  "created_at": "ISO 8601 Date String",
  "updated_at": "ISO 8601 Date String",
  "rider_phone": "string | null",
  "rider_token": "string", // Generated if status is READY
  "customer_token": "string | null",
  "csat_score": "number | null",
  "csat_comment": "string | null"
}
```

**Errors**:
- `400 Bad Request`: Invalid status value, missing `rider_phone` for `READY` status, or other validation errors.
- `401 Unauthorized`: No valid JWT token provided.
- `404 Not Found`: Order with the given ID does not exist.

#### GET /public/orders/:token
Retrieves limited order details using a public token (either `rider_token` or `customer_token`).

**Request**:
(No payload)

**Response**:
*If `rider_token` is used:*
```json
{
  "readable_id": "string", // Human-readable order identifier
  "customer_name": "string",
  "customer_phone": "string",
  "delivery_address": "string",
  "price_total": 0,
  "status": "string",
  "created_at": "ISO 8601 Date String",
  "rider_phone": "string | null"
}
```
*If `customer_token` is used:*
```json
{
  "readable_id": "string",
  "delivery_address": "string",
  "status": "string",
  "rider_phone": "string | null"
}
```

**Errors**:
- `404 Not Found`: No order found for the provided token.

#### POST /public/orders/:token/csat
Submits a Customer Satisfaction (CSAT) score and optional comment for an order using a `customer_token`.

**Request**:
```json
{
  "csat_score": 1, // Required: CSAT score (integer from 1 to 5)
  "csat_comment": "string" // Optional: Additional comments
}
```

**Response**:
```json
{
  "sme_id": "string (UUID)",
  "customer_name": "string",
  "customer_phone": "string",
  "delivery_address": "string",
  "price_total": 0,
  "status": "COMPLETED",
  "id": "string (UUID)",
  "created_at": "ISO 8601 Date String",
  "updated_at": "ISO 8601 Date String",
  "rider_phone": "string | null",
  "rider_token": "string | null",
  "customer_token": "string",
  "csat_score": 5,
  "csat_comment": "string"
}
```

**Errors**:
- `400 Bad Request`: Invalid `csat_score` or other validation errors.
- `404 Not Found`: No order found for the provided customer token.

## Technologies Used
| Technology | Description | Link |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NestJS**        | A progressive Node.js framework for building efficient, reliable and scalable server-side applications.                    | [NestJS Official Site](https://nestjs.com/)                                                                                                                                                                          |
| **TypeScript**    | A strongly typed superset of JavaScript that compiles to plain JavaScript.                                               | [TypeScript Official Site](https://www.typescriptlang.org/)                                                                                                                                                          |
| **Supabase**      | An open-source Firebase alternative providing a PostgreSQL database, Authentication, instant APIs, and Realtime subscriptions. | [Supabase Official Site](https://supabase.com/)                                                                                                                                                                      |
| **Passport.js**   | Simple, unobtrusive authentication middleware for Node.js. Used here with JWT strategy.                                 | [Passport.js Official Site](http://www.passportjs.org/)                                                                                                                                                              |
| **Swagger (OpenAPI)** | A set of open-source tools built around the OpenAPI Specification that helps to design, build, document, and consume REST APIs. | [Swagger Official Site](https://swagger.io/)                                                                                                                                                                         |
| **class-validator** | A library to validate objects based on annotations and decorator metadata.                                                | [class-validator GitHub](https://github.com/typestack/class-validator)                                                                                                                                               |
| **RxJS**          | A library for reactive programming using Observables, to make it easier to compose asynchronous or callback-based code.    | [RxJS Official Site](https://rxjs.dev/)                                                                                                                                                                              |

## License
This project is currently UNLICENSED, as specified in `package.json`.

## Author Info
*   **[Your Name Here]**
    *   LinkedIn: [Your LinkedIn Profile]
    *   Twitter: [Your Twitter Handle]
    *   Portfolio: [Your Portfolio URL]

---
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)