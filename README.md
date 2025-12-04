# Roomivo 🏠

Roomivo is a modern, AI-powered property management platform connecting landlords and tenants with a seamless, premium experience.

## 🚀 Features

### 🔐 Authentication & Security
*   **Role-Based Access**: Distinct dashboards for Tenants and Landlords.
*   **Secure Login**: Email/Password and Google OAuth integration.
*   **Profile Management**: Comprehensive user profiles with income, profession, and preference tracking.
*   **Data Protection**: Row Level Security (RLS) ensures users only access their own data.

### 👤 Tenant Experience
*   **AI Matching**: Smart algorithm matches properties based on income, budget, and location preferences.
*   **One-Click Apply**: Streamlined application process with pre-filled profile data.
*   **Document Uploads**: Securely attach IDs, payslips, and other documents to applications.
*   **Application Tracking**: Real-time status updates (Pending, Approved, Rejected).
*   **Payment History**: View past rent payments and download invoices.
*   **Incident Reporting**: Report maintenance issues directly to the landlord.

### 🔑 Landlord Experience
*   **Property Management**: Add, edit, and manage property listings with image uploads.
*   **Applicant Insights**: View detailed applicant profiles including profession, income, and "Match Score".
*   **Smart Dashboard**: Overview of total properties, active applications, and monthly revenue.
*   **Contract Generation**: Generate basic rental agreements for approved tenants instantly.
*   **Application Workflow**: Approve or reject applications with a single click.

### 💬 Communication
*   **Real-Time Chat**: Integrated messaging system for direct Landlord-Tenant communication.
*   **Notifications**: Visual feedback for important actions.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Realtime, Storage)
*   **Deployment**: [Vercel](https://vercel.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/venkyden/roomivo_web.git
    cd roomivo-web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🗄️ Database Migrations

This project uses Supabase. Ensure you run the SQL migrations located in `supabase/migrations/` in the following order:
1.  `01_payments.sql`
2.  `02_incidents.sql`
3.  `03_user_trigger.sql`
4.  `04_storage.sql`
5.  `05_profile_fields.sql`

## 📄 License

Private Property of Roomivo.
