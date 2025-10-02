# Inventory Management System (COMP S381F)

## Description
A simple Inventory Management System using Node.js, Express.js, MongoDB, and EJS. It supports user login/logout, item CRUD operations, and session management.

## Technologies Used
- Node.js
- Express.js
- MongoDB 4.4
- EJS Template Engine
- cookie-session
- body-parser
- Disintegrate.js + custom JS (for UI effects)

## Installation and Setup
#### 1. Make sure MongoDB server is installed and running:
    sudo systemctl start mongod
    sudo systemctl enable mongod
#### 2. Clone the project and install dependencies:
    git clone <repository_url>
    cd inventory-management
    npm install
#### 3. Run the server:
    node server.js
#### 4. Access the app in the browser at:
    http://localhost:3000/login

## Usage
- Login with username `admin` and password `password`.
- Add, edit, and delete inventory items.
- - Manage items:
  - Create, Edit, Delete
  - Search by keyword or quantity range
  - Bulk-generate random 5 or 100 items
- Logout using the "Logout" link.

## Notes
- This project uses a hardcoded user for demonstration only.
- For production, implement proper user authentication and password security.

