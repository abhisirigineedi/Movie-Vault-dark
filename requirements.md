# Project Requirements & Setup

This project has been migrated to a **Serverless Firebase Architecture**. 

## Environment Prerequisites
- **Node.js**: Version 18.0 or higher is required to run the Vite frontend.
- **npm**: (Included with Node.js) for dependency management.

## Frontend Dependencies (package.json)
The following key libraries are used:
- `firebase`: For Authentication and Firestore Database.
- `react` & `react-router-dom`: For UI and navigation.
- `lucide-react`: For iconography.
- `tailwindcss`: For styling.

## Firebase Backend Requirements (Action Required)
To make the application functional, you MUST enable these services in your [Firebase Console](https://console.firebase.google.com/):

### 1. Enable Authentication
1. Go to **Build** > **Authentication**.
2. Click **Get Started**.
3. Select **Email/Password**.
4. Enable the **Email/Password** switch and click **Save**.
   > [!IMPORTANT]
   > Failure to do this will result in the `auth/configuration-not-found` error.

### 2. Enable Firestore Database
1. Go to **Build** > **Firestore Database**.
2. Click **Create Database**.
3. Choose a location and start in **Test Mode** (or Production Mode with secure rules).
4. Rules should allow read/write for authenticated users:
   ```javascript
   match /movies/{movieId} {
     allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
     allow create: if request.auth != null;
   }
   ```

## Running the App Locally
1. Open a terminal in the `frontend` folder.
2. Run `npm install`.
3. Run `npm run dev -- --host 127.0.0.1`.
4. Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Deploying to Production (Render)
Because this is now a **Static Site**, you no longer need a Python environment or a complex backend setup.
1. Connect your repo to **Render**.
2. Select **Blueprint** (it will auto-detect the `render.yaml` in the root).
3. The build command is `npm run build` and the publish directory is `dist/` (inside the `frontend` folder).
4. All database logic and authentication are handled securely by **Firebase**.

> [!TIP]
> This serverless approach is cheaper, faster, and more secure than hosting a tradition monolithic Python backend.

