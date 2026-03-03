# Medication Tracker Project

This project consists of a Spring Boot backend and a React frontend.

## Prerequisites

1.  **Java 17+**: Ensure you have Java 17 or higher installed.
2.  **Node.js**: Ensure you have Node.js and npm installed.
3.  **MySQL**: A MySQL server running on `localhost:3306`.

---

## Backend Setup (medication-tracker-backend)

1.  **Create Database**:
    Execute the following SQL command in your MySQL terminal:
    ```sql
    CREATE DATABASE medication_db;
    ```

2.  **Configure Credentials**:
    Open `src/main/resources/application.properties` and update the database username and password if they differ from the defaults:
    ```properties
    spring.datasource.username=root
    spring.datasource.password=*****
    ```

3.  **Run Application**:
    Navigate to the `medication-tracker-backend` directory and run:
    ```bash
    .\mvnw.cmd spring-boot:run
    ```
    The backend will start on **http://localhost:8080**.

---

## Frontend Setup (medication-tracker-frontend)

1.  **Install Dependencies**:
    Navigate to the `medication-tracker-frontend` directory and run:
    ```bash
    npm install
    ```

2.  **Run Application**:
    Run the following command to start the development server:
    ```bash
    npm start
    ```
    The frontend will be available at **http://localhost:3000**.

---

## API Testing

You can use the following endpoints to verify the system:

- **Register**: `POST http://localhost:8080/auth/register`
- **Login**: `POST http://localhost:8080/auth/login`

