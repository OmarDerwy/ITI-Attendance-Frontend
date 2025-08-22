# Live demo link (check credentials below)
http://intrack-ai-frontend-hmiucs-1c8685-130-61-217-161.traefik.me/

## Credentials to log into the demo
### admin
email: admin@admin.com
password: admin
### supervisor
email: Edward.Braun@yahoo.com
password: test
### branch manager:
email: orland95@gmail.com
password: test
### coordinator:
email: kareem@coordinator.com
password: test
### student:
email: stu@stu.com
password: test

## The other repos
Back End Repo: https://github.com/OmarDerwy/ITI-Attendance-Backend
React Native App Repo: https://github.com/OmarDerwy/ITI-Attendance-FrontendRN

# ITI Attendance Frontend

This project is the frontend for the ITI Attendance Tracking system, a web application designed to manage student attendance, schedules, leave requests, and lost & found items within the institution.

## Features

*   **Authentication:** Secure login, password reset, and account activation.
*   **Role-Based Dashboards:** Tailored views for Admins, Supervisors, and Students.
*   **Attendance Management:**
    *   View and manage class schedules (FullCalendar integration).
    *   Track daily and weekly attendance status.
    *   Submit and manage leave requests (late arrival, early departure, full day).
    *   View historical attendance records.
*   **User Management (Admin):** Add, edit, and manage user accounts (students, supervisors).
*   **Track & Branch Management (Admin):** Create and manage academic tracks and institution branches.
*   **Lost & Found:**
    *   Report lost or found items with descriptions and images.
    *   Browse reported items.
    *   Manage personal reported items.
*   **Profile Management:** View and update user profile information.
*   **Notifications:** Real-time notifications.
*   **Responsive Design:** UI adapts to different screen sizes.

## Tech Stack

*   **Framework:** React
*   **Build Tool:** Vite
*   **Language:** JavaScript (JSX) & TypeScript (TSX)
*   **UI Library:** Shadcn UI
*   **Styling:** Tailwind CSS
*   **Routing:** React Router v6
*   **State Management:** React Context API
*   **Data Fetching:** Axios, TanStack Query (React Query)
*   **Calendar:** FullCalendar
*   **Charts:** Recharts
*   **Forms:** React Hook Form, Zod (for validation)
*   **Date/Time:** date-fns, dayjs
*   **Image Handling:** Cloudinary

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   Bun (preferred, as `bun.lockb` exists) or npm/yarn
*   Access to the backend API service.

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd ITI-Attendance-Frontend
    ```
2.  Install dependencies (using Bun is recommended):
    ```bash
    bun install
    ```
    Alternatively, use npm or yarn:
    ```bash
     npm install
     yarn install
    ```

### Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables. Based on the code, you'll likely need:

```env
VITE_API_BASE_URL=<your_backend_api_base_url>
# Example: VITE_API_BASE_URL=http://localhost:8000/api/v1/

# Add other variables if needed (e.g., Cloudinary keys)
# VITE_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
# VITE_CLOUDINARY_UPLOAD_PRESET=<your_cloudinary_upload_preset>
```

Replace `<your_backend_api_base_url>` with the actual URL where the backend API is running.

### Running the Development Server

```bash
bun run dev
```

Or using npm/yarn:

```bash
npm run dev
yarn dev
```

This will start the Vite development server, typically at `http://localhost:5173`.

## Building for Production

```bash
bun run build
```

Or using npm/yarn:

```bash
npm run build
yarn build
```

This command bundles the application into the `dist` directory for deployment. The `Dockerfile` and `nginx.conf` suggest potential deployment using Docker and Nginx.

## Contributors

*   Omar Hany
*   Hussein Saad
*   Menna Reda
*   Hoda Magdy

