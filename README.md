# 🎬 CineGo - Movie Ticket Booking App

A full-stack movie ticket booking application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. Features user authentication, movie browsing, and an interactive seat selection system.

## ✨ Features

-   **User Authentication:** Secure user registration and login with JWT and bcrypt.js.
-   **Movie Browsing:** Fetches and displays a list of available movies from the database.
-   **Dynamic Showtimes:** View movie details with a list of upcoming, bookable showtimes. The system automatically disables showtimes that are in the past.
-   **Interactive Seat Selection:** A visual, clickable seat grid that shows already booked seats and allows users to select multiple seats.
-   **Booking System:** Create new bookings that are linked to a specific user, movie, and showtime.
-   **Personal Booking History:** A protected route and page for users to view their past bookings.
-   **RESTful API:** A well-structured backend API built with Node.js and Express.

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
