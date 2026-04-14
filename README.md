# 🏛️ Domexis — Server
A high-performance intelligence layer and REST API for luxury building management, powered by Express.js 5, MongoDB, and Gemini 2.0 AI.
**AI Intelligence · Real Estate Inventory · Financial Orchestration · Multi-Role Security**

![Infrastructure: Node.js](https://img.shields.io/badge/Runtime-Node.js_20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Framework: Express](https://img.shields.io/badge/Framework-Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![AI Engine: Gemini](https://img.shields.io/badge/AI_Engine-Gemini_2.0_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)
![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Recent Updates](#-recent-updates)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Full Project Folder Structure](#-full-project-folder-structure)
- [Detailed Folder Descriptions](#-detailed-folder-descriptions)
- [Database Schema & Logic](#-database-schema--logic)
- [Development](#-development)
- [API Endpoints](#-api-endpoints)
- [Authentication & Security](#-authentication--security)
- [Environment Variables Reference](#-environment-variables-reference)
- [Deployment](#-deployment)
- [Monitoring & Logging](#-monitoring--logging)
- [Contributing](#-contributing)
- [Support & Questions](#-support--questions)

---

## 🎯 Project Overview
Domexis Server is a centralized backend ecosystem designed to automate luxury property operations. It serves as the "brain," managing everything from unit inventory to AI-powered resident assistants.

| Capability | Description |
| :--- | :--- |
| **AI Intelligence Suite** | Gemini 2.0 Flash integration for RAG-based resident chat and property matching. |
| **Real Estate Engine** | Full lifecycle management of apartment units, blocks, and rental states. |
| **Agreement Workflow** | Multi-tiered approval system for rental contracts (Requested → Admin Checked → Paid). |
| **Financial Gateway** | Integrated Stripe payment intents and idempotent transaction finalization. |
| **Identity Orchestration** | Robust RBAC (Role-Based Access Control) via Firebase Admin SDK. |
| **Dynamic Marketing** | Real-time coupon generation with percentage-based and flat-rate logic. |

---

## 🆕 Recent Updates
| Feature | Description |
| :--- | :--- |
| **RAG-based AI Chatbot** | Implemented a context-aware resident assistant using MongoDB data injection. |
| **Express 5 Upgrade** | Migrated core routing to the latest Express 5 for improved error handling and performance. |
| **Heuristic Analytics** | Added property-matching heuristics to calculate "Lifestyle Compatibility" scores. |
| **Stripe Idempotency** | Enhanced payment finalization to prevent duplicate role upgrades during concurrency. |

---

## 🛠 Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js 20.x or higher |
| **Framework** | Express.js 5.x (Latest) |
| **Database** | MongoDB Atlas (NoSQL) |
| **AI Engine** | @google/generative-ai (Gemini 2.0 Flash) |
| **Authentication** | Firebase Admin SDK (OIDC Verification) |
| **Payments** | Stripe SDK |
| **Deployment** | Vercel Serverless Functions |

---

## 📦 Prerequisites
- **Node.js 20.x** or higher
- **MongoDB Atlas** account for data persistence
- **Firebase Project** for identity management
- **Google AI Studio Key** (Gemini)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/domexis-server.git
cd domexis-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Identity Configuration
1. Obtain your **Service Account JSON** from the Firebase Console.
2. Save it as `firebase-admin-key.json` in the root directory.

---

## 🔐 Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_USER=your_mongodb_user
DB_PASS=your_mongodb_password

# AI & Payments
GEMINI_API_KEY=your_gemini_api_key
PAYMENT_GATEWAY_KEY=sk_test_...

# Server Config
PORT=5000
NODE_ENV=development
```

---

## 📂 Full Project Folder Structure
```text
.
├── .env                  # Environment Variables
├── vercel.json           # Vercel Deployment Config
├── firebase-admin-key.json # Secure Credential (Git ignored)
├── index.js              # Application Entry & Route Orchestration
├── package.json          # Dependencies & Scripts
└── node_modules/         # Dependencies
```

---

## 📖 Detailed Folder Descriptions
| Path | Purpose |
| :--- | :--- |
| `index.js` | Core logic, API endpoint registration, AI integration, and database connection. |
| `firebase-admin-key.json` | Private certificate used for validating Firebase OIDC tokens. |
| `vercel.json` | Configuration for serverless function routing and environment behavior on Vercel. |

---

## 🗄️ Database Schema & Logic

### Core Collections
| Model | Description |
| :--- | :--- |
| **Users** | Identity, personalization metadata, and RBAC roles (ADMIN, MEMBER, USER). |
| **Apartments** | Building inventory data (floor, block, rent, status). |
| **Agreements** | Transactional ledger for unit requests and active rentals. |
| **Payments** | Audit trail for Stripe-verified financial transactions. |
| **Coupons** | Discount logic for promotional marketing. |

### User Roles
| Role | Permissions |
| :--- | :--- |
| **USER** | Browse apartments, request agreements, and view announcements. |
| **MEMBER** | Access to paid unit services, rent payment, and payment ledger. |
| **ADMIN** | Full system moderation, user role overrides, and unit management. |

---

## 🔧 Development
| Command | Description |
| :--- | :--- |
| `npm start` | Runs the server in production mode using `node index.js`. |
| `npm run dev` | (Requires nodemon) Starts development server with hot-reload. |

---

## 📡 API Endpoints

### 🤖 AI Intelligence
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ai/chat` | Context-aware assistant via Gemini RAG logic. |
| `POST` | `/ai/property-match` | Lifestyle compatibility scoring algorithm. |
| `GET` | `/ai/maintenance-predict` | Virtual diagnostic building monitoring. |

### 💳 Financials & Payments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/create-payment-intent` | Provision Stripe transaction payload. |
| `POST` | `/payments/complete` | Finalize payment & upgrade user to MEMBER. |
| `GET` | `/coupons` | List all active promotional codes. |

### 🏘️ Management & Admin
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/agreements/requested` | Fetch pending unit requests (Admin Only). |
| `PATCH` | `/users/:id/remove-member` | Revoke membership tier (Admin Only). |

---

## 🔑 Authentication & Security
### Middleware Pipeline
- **verifyBToken**: Validates incoming Bearer tokens against Firebase OIDC.
- **verifyAdmin**: Secondary check for administrative authorization privileges.

### Security Features
- **Stateless Identity:** Derives user context from safety-first JWTs.
- **Whitelist CORS:** Strictly controlled origins for frontend interaction.

---

## 📝 Environment Variables Reference
| Variable | Description |
| :--- | :--- |
| `DB_USER` | MongoDB Atlas credential username. |
| `DB_PASS` | MongoDB Atlas credential password. |
| `GEMINI_API_KEY` | Google Generative AI access token. |
| `PAYMENT_GATEWAY_KEY` | Stripe Secret Key for financial intents. |

---

## 🚢 Deployment
### Deploy to Vercel
The application is pre-configured as a Vercel Serverless Function. Use the Vercel CLI or Dashboard:
```bash
vercel --prod
```

---

## 📊 Monitoring & Logging
- **Connection Status:** Real-time feedback on MongoDB and Gemini AI heartbeats.
- **Error Handling:** Standardized JSON error response payloads.

---

## 🤝 Contributing
1. Create a feature branch.
2. Ensure logic adheres to the established middleware pattern.
3. Submit a Pull Request for review.

---

## 📞 Support & Questions
For issues, please open a GitHub issue or contact engineering@domexis.com.

---

**© 2026 Domexis Infrastructure Group. All rights reserved.**