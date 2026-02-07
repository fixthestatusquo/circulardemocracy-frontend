## frontend for the circular democracy project

check [Circular Democracy](https://circulardemocracy.org) for more information about the project



## Supabase Environment Variables

This project uses Supabase for authentication and backend services. To connect to your Supabase project, you need to set up environment variables.

1.  **Create a `.env` file**: In the root of your project, create a file named `.env`.
2.  **Add your Supabase credentials**: Open the `.env` file and add the following variables, replacing the placeholder values with your actual Supabase project URL and anonymous key. You can find these in your Supabase project settings under "API".

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```
    *   `VITE_SUPABASE_URL`: Your Supabase project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase project's public (anon) key.

    **Note:** For security reasons, never commit your `.env` file to version control. It's already included in `.gitignore`.

3.  **Restart the development server**: If your development server is running, you'll need to restart it for the new environment variables to be loaded.
