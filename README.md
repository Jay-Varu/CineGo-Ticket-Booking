# 🎬 CineGo - Movie Ticket Booking App

A full-stack movie ticket booking application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. Features user authentication, movie browsing, and an interactive seat selection system.

## ✨ Features

-   User registration and login with JWT authentication.
-   Browse a list of currently showing movies.
-   View detailed information for each movie.
-   Interactive seat selection grid to choose seats.
-   Create bookings for specific showtimes.
-   View a personal history of all past bookings.
-   Protected routes on the backend to secure user-specific data.

## 🛠️ Tech Stack

-   **Frontend:** React.js, Vite, React Router
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB with Mongoose
-   **Authentication:** JSON Web Tokens (JWT) & bcrypt.js

## 🚀 Getting Started

### Prerequisites

-   Node.js and npm installed
-   MongoDB installed and running

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/CineGo-MERN-Booking-App.git](https://github.com/your-username/CineGo-MERN-Booking-App.git)
    cd CineGo-MERN-Booking-App
    ```

2.  **Setup the Backend:**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add the following variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
    Start the backend server:
    ```sh
    node server.js
    ```

3.  **Setup the Frontend:**
    ```sh
    cd ../client
    npm install
    ```
    Start the frontend development server:
    ```sh
    npm run dev
    ```

The app will be available at `http://localhost:5173` (or another port specified by Vite).
