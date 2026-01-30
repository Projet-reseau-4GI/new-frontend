# VerifID Frontend

VerifID is a robust frontend application for document verification, built with Next.js, React, and Tailwind CSS. It integrates with a backend service to handle user authentication, document uploads, and identity verification.

## 📋 Overview

This application provides a complete flow for:
1.  **Authentication**: User registration (with email/password or Google OAuth) and login.
2.  **Document Upload**: Secure interface to upload identity documents (recto/verso).
3.  **Verification**: Automated analysis and extraction of document data.
4.  **Results**: Clear display of verification status (Confirmed, expired, invalid, etc.).

## 🛠️ Technology Stack

-   **Framework**: Next.js 16 (App Router)
-   **UI Library**: React 19, Tailwind CSS 4, shadcn/ui
-   **Icons**: Lucide React
-   **Language**: TypeScript
-   **Validation**: Zod (optional)

## 📁 Project Structure

```
verifid-frontend/
├── app/                           # Next.js App Router
│   ├── login/                     # Login page
│   ├── signup/                    # Signup page
│   ├── upload/                    # Document upload page
│   ├── results/                   # Results page
│   └── api/                       # API Routes (e.g., Google OAuth callback)
├── components/                    # UI Components (shadcn/ui)
├── hooks/                         # Custom Hooks
│   ├── use-auth.ts                # Authentication logic
│   └── use-document-upload.ts     # Document upload logic
├── lib/                           # Core logic & Services
│   ├── api-client.ts              # Centralized API service
│   └── types.ts                   # TypeScript definitions
└── public/                        # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd verifid-frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

The application is configured to connect to the backend at:
**`https://new-backend-network.onrender.com`**

No local `.env` file is strictly required for the frontend to function as the backend URL is currently configured in `lib/api-client.ts`.

## 🔑 Key Features & Integration

### Authentication
-   **Service**: `authService` in `lib/api-client.ts`
-   **Features**: Login, Register, Google OAuth, Password Strength Validation.
-   **Token Storage**: JWT stored in `localStorage`.

### Document Verification
-   **Service**: `documentService` in `lib/api-client.ts`
-   **Flow**:
    1.  User uploads document (PNG/JPG/PDF, max 10MB).
    2.  Files are sent to `/api/documents/upload-analyze`.
    3.  Backend returns a `document_id`.
    4.  User is redirected to `/results?documentId=...` to view the analysis.

### Results Scenarios
The application handles 4 main verification states:
1.  **Confirmed** ✅: High confidence & valid document.
2.  **Expired** ⚠️: Document is not valid (expired).
3.  **Unclear** ⚠️: Low confidence score (0.3 - 0.6).
4.  **Invalid** ❌: Very low confidence or invalid document type.

## 🐛 Troubleshooting

| Problem | Possible Cause | Solution |
| :--- | :--- | :--- |
| **API 401 Unauthorized** | Token missing/expired | Re-login or check `localStorage`. |
| **Upload Failed** | File > 10MB or wrong format | Check file size and type (PNG/JPG/PDF). |
| **Google Login Fails** | CORS or Configuration | Check Backend/Google Console config. |
| **Results Page Empty** | Invalid `documentId` | Check URL parameters and backend logs. |

For detailed API debugging, check the browser console for logs prefixed with `[v0]`.

---

*This documentation consolidates the project configuration, structure, and integration guide.*