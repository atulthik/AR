# AuraSpace - AR Furniture Placement App

A high-fidelity full-stack Augmented Reality (AR) Furniture Placement application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js) with Three.js, React Three Fiber (R3F), and WebXR/WebRTC Camera overlay.

---

## Features

### User Features
1. **User Accounts & Auth**: Registration & JWT Session Caching.
2. **Wishlist**: Real-time heart saves sync'd across search lists and user profiles.
3. **Interactive 3D Preview**: Deep-dive product inspections inside an Orbit-controlled Three.js sandbox with auto-wireframe box failovers.
4. **Hybrid AR Studio Workspace**:
   - **Immersive WebXR**: Integrates floor tracking when accessed from WebXR-ready mobile devices.
   - **Simulated Webcam AR**: Streams the user's web camera behind a transparent R3F canvas for standard desktop/iOS browsers.
   - **Interactive Gestures**: Drag to place/move items on the floor plane, click to select, rotate using slider rings, and adjust scale multipliers.
5. **Advanced Engine Systems**:
   - **Voice Commands**: Web Speech API speech listener supporting commands like "add chair", "rotate", "scale up", "delete", and "save design".
   - **AI Layout Suggestions**: Recommends style configurations (e.g., matching coffee tables for sofas) and provides one-click placement.
   - **Cost Estimator**: Dynamic shopping cart summation adding subtotals, promo codes (`WELCOME10`), and tax margins.
   - **Compatibility Checker**: Multi-object AABB collision calculations and wall limits checks to warn of item overlap.
6. **Layout Sessions**: Save layouts to user accounts, view saved rooms, and copy share links to display public read-only 3D viewports.

### Admin Features
1. **Dashboard analytics**: Counts for users, categories, average catalogs cost, and popular wishlisted statistics.
2. **Catalog CRUD**: Publishing furniture items with metric dimensions (width, height, depth in meters) and raw file uploads for thumbnail images and `.glb` 3D model assets.
3. **Cloudinary Integration**: Automatically uploads assets to Cloudinary if keys are provided, falling back to local Express static storage (`/uploads/`) if offline.

---

## Project Folder Structure

```text
AR/
├── client/                 # React SPA (Vite)
│   ├── src/
│   │   ├── admin/         # Admin telemetries and catalog CRUD panels
│   │   ├── ar/            # AR Canvas overlays and interactive workspace editors
│   │   ├── components/    # Reusable navigation headers and Stage 3D Orbit canvases
│   │   ├── context/       # Auth state managers and wishlist hooks
│   │   ├── pages/         # User profile lists, catalogs, auth forms, share screens
│   │   └── services/      # Axios/Fetch API request wrapper
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                 # Express REST API Backend
    ├── config/            # DB and Cloudinary connection configurations
    ├── controllers/       # Route request handlers
    ├── middleware/        # JWT validators and admin role guards
    ├── models/            # Mongoose MongoDB schemas
    ├── routes/            # Express route maps
    ├── uploads/           # Local file storage for images and GLB models (fallback)
    ├── server.js          # Entrypoint script
    └── seeder.js          # Mock catalog and account creator script
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://127.0.0.1:27017/ar_furniture`) or MongoDB Atlas cluster.

### 1. Backend Server Setup

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. A pre-configured `.env` is created for local execution. To customize, edit `.env`:
   - `PORT`: Port server runs on (default: `5000`)
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Crypto signature key for Auth tokens
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (Optional: leave empty to trigger local static server disk storage fallback)
4. Seed the database with default users, admins, and furniture catalogs:
   ```bash
   npm run seed
   ```
   *Note: This creates two default login accounts:*
   - **Standard User**: `user@example.com` (password: `password123`)
   - **Admin Portal**: `admin@example.com` (password: `admin123`)
5. Start the backend dev server:
   ```bash
   npm run dev
   ```
   The backend API will run on: `http://localhost:5000`

---

### 2. Frontend Client Setup

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install client dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the client dev server:
   ```bash
   npm run dev
   ```
   The React SPA will launch on: `http://localhost:5173`

---

## Usage Guide & Developer Workflows

### Testing Catalog Uploads (Admin)
1. Sign in on the frontend with the admin credentials: `admin@example.com` / `admin123`.
2. Click **Admin Portal** in the navigation header.
3. Review catalog analytics.
4. Click **Manage Catalog** / **Add New Furniture**. Fill in attributes and select image/GLB assets. If you do not have a GLB file on hand, submit the form with empty files — the 3D studio will automatically build a scale-accurate translucent placeholder block representing the metrics!

### Placing Items in AR
1. Navigate to the **AR Workspace** page.
2. Choose items from the **Catalog Drawer** in the sidebar. They will snap to coordinate `[0, 0, 0]`.
3. Left-click/Touch drag on the grid floor to move items around the room space.
4. Select any item to display fine-tuning controls in the bottom-left overlay (rotation sliders, scale controls, trash removals).
5. Toggle **Camera AR** to activate your web camera stream beneath the models.
6. Toggle **Speech Commands** and speak inputs into your microphone:
   - *"add chair"* / *"add sofa"* / *"add table"*
   - *"rotate"* (adds rotation)
   - *"scale up"* / *"scale down"*
   - *"delete"* (removes active item)
   - *"clear room"*
   - *"save design"*
7. Save your room design by naming it and clicking **Save Room**. Go to your **Dashboard** to grab the public share link!
