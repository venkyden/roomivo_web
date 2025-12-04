# Deploying Roomivo Web to Vercel

Since you are already logged in to Vercel CLI, deploying this new version is straightforward.

## ⚠️ Critical: Database Setup
Before deploying, ensure you have run the following SQL scripts in your Supabase SQL Editor:
1. `supabase/schema.sql` (Core tables & RLS)
2. `supabase/migrations/01_payments.sql` (Payments system)
3. `supabase/migrations/02_incidents.sql` (Incident reporting)
4. `supabase/migrations/03_user_trigger.sql` (Auto-create profile on signup)

## ⚠️ Critical: Enable Google Auth
The error `Unsupported provider: provider is not enabled` means Google Login is turned off in your Supabase project.

**You MUST provide a Client ID and Secret.** Here is how to get them:

1.  **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Create a Project**: Click the dropdown at the top -> "New Project" -> Name it "Roomivo" -> Create.
3.  **Configure OAuth Consent Screen**:
    *   Go to **APIs & Services** > **OAuth consent screen**.
    *   Select **External** -> Create.
    *   Fill in App Name ("Roomivo"), Support Email, and Developer Contact Info. Click Save.
4.  **Create Credentials**:
    *   Go to **Credentials** (left sidebar).
    *   Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
    *   Application type: **Web application**.
    *   Name: "Roomivo Web".
    *   **Authorized redirect URIs**: Add this URL from your Supabase Dashboard:
        *   `https://lwcdcstmtkeujlocnhhk.supabase.co/auth/v1/callback`
    *   Click **Create**.
5.  **Copy Keys to Supabase**:
    *   Copy the **Client ID** and **Client Secret**.
    *   Go back to **Supabase Dashboard** > **Authentication** > **Providers** > **Google**.
    *   Paste the keys.
    *   Toggle **Enable Google** to **ON**.
    *   Click **Save**.

## 📧 Email Branding (Free SMTP Setup)
To remove "Lovable" branding, use **Resend** (Free tier: 3000 emails/mo).

1.  **Sign Up**: Go to [Resend.com](https://resend.com) and sign up.
2.  **Get API Key**:
    *   Go to **API Keys** > **Create API Key**.
    *   Name it "Supabase" -> Permission: "Full Access" -> Create -> **Copy the Key**.
3.  **Configure Supabase**:
    *   Go to **Supabase Dashboard** > **Project Settings** > **Authentication** > **SMTP Settings**.
    *   Toggle **Enable Custom SMTP**.
    *   **Sender Email**: `onboarding@resend.dev` (or your verified domain email).
    *   **Sender Name**: `Roomivo`.
    *   **Host**: `smtp.resend.com`
    *   **Port**: `465`
    *   **Username**: `resend`
    *   **Password**: [Paste your Resend API Key]
    *   **Encryption**: `SSL` (or `TLS` if 465 fails, but 465/SSL is standard).
    *   Click **Save**.

## Option 1: Using Vercel CLI (Recommended)

1.  **Navigate to the project directory**:
    ```bash
    cd roomivo-web
    ```

2.  **Run the deployment command**:
    ```bash
    vercel
    ```
    - Follow the prompts:
        - Set up and deploy? **Y**
        - Which scope? **venkyden**
        - Link to existing project? **N** (This is a new "Rebirth" project)
        - Project name? **roomivo-web** (or your preference)
        - In which directory is your code located? **./** (Default is correct since you are inside the folder)
        - Want to modify these settings? **N**

3.  **Set Environment Variables**:
    Once the project is linked, you need to add your Supabase keys to Vercel.
    
    You can do this via the Vercel Dashboard or CLI:
    ```bash
    vercel env add NEXT_PUBLIC_SUPABASE_URL
    # Paste the value from your .env.local
    
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
    # Paste the value from your .env.local
    ```

4.  **Deploy to Production**:
    After verifying the preview deployment:
    ```bash
    vercel deploy --prod
    ```

## Option 2: Vercel Dashboard (Git Integration)

1.  **Push your code** to a GitHub repository.
    - If pushing the entire `pixel-to-cloud` monorepo:
        - Go to Vercel Dashboard > Add New Project.
        - Import the `pixel-to-cloud` repository.
        - **Important**: In "Root Directory" settings, click "Edit" and select `roomivo-web`.
    
2.  **Configure Environment Variables**:
    - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project settings.

3.  **Deploy**: Click "Deploy".

## ✅ Verification
- Visit the deployed URL.
- Test the **Login** (Google Auth requires adding the Vercel deployment URL to Supabase Auth settings).
- Test the **Chat** and **Dashboard** features.
