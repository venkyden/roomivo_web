# Deploying Roomivo Web to Vercel

Since you are already logged in to Vercel CLI, deploying this new version is straightforward.

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
