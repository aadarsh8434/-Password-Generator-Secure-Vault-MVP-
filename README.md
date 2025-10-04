# Secure Password Generator & Vault

## Introduction

Secure Password Generator & Vault is a robust and user-friendly web application for generating strong, secure passwords and storing them in a personal vault. It features a client-side password generator with customizable options and a Node.js backend to securely manage your saved passwords.

## Features

### Password Generator

- Customizable Length: Generate passwords from 4 to 64 characters long.
- Character Options: Include or exclude uppercase letters, numbers, and symbols.
- Exclude Similar Characters: Option to avoid confusing characters like i, l, 1, L, o, 0, O.
- No Repeat Characters: Ensure all characters in the generated password are unique.
- Custom Symbols: Add your own specific symbols to the character pool.
- Password Strength Indicator: Provides real-time feedback on password strength (Very Weak to Very Strong).
- Copy to Clipboard: Easily copy the generated password.
- Reset Options: Quickly reset all options to their default values.

### Password Vault

- Categorized Storage: Save generated passwords into custom categories such as Social, Work, and Banking.
- Secure Storage: Passwords are saved in a JSON file on the server.
- View & Manage: Display all saved passwords categorized for easy access.
- Copy Vault Passwords: Copy any saved password directly from the vault list.
- Delete Passwords: Remove individual passwords from your vault.
- Export Vault: Download your entire vault as a JSON file for backup or transfer.

### User Interface

- Responsive Design: Adapts to various screen sizes.
- Dark Mode Toggle: Switch between light and dark themes for comfortable viewing.

## Technologies Used

### Frontend

- HTML5 for application structure.
- CSS3 for styling and layout, including dark mode.
- JavaScript for client-side logic, UI interactions, and backend communication.

### Backend

- Node.js as the runtime environment.
- Express.js for building RESTful API endpoints.
- fs.promises for asynchronous file system operations to manage vault data.
- cors middleware to enable Cross-Origin Resource Sharing during development.

## Installation & Setup

### Prerequisites

- Node.js (LTS version recommended).
- npm (Node Package Manager).

### Installation Steps

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install backend dependencies (Express, cors).
4. Create a `public` directory and place frontend files (HTML, CSS, JavaScript) inside it.
5. Create the server script (`server.js`) in the root directory with backend code.
6. Start the backend server.
7. Open your web browser and navigate to `http://localhost:3000` to use the application.

The backend initializes a vault JSON file if it doesn’t exist and treats empty category inputs as "Uncategorized".
## Usage

- Enter desired password length and select character options in the password generator.
- Use the "Exclude Similar Characters" and "No Repeat Characters" options to enhance password clarity and uniqueness.
- View real-time password strength feedback as you customize.
- Copy the generated password to clipboard for immediate use.
- Save passwords into categorized vault sections by entering a category and password.
- View all saved passwords organized by category in the vault.
- Copy or delete individual passwords from the vault as needed.
- Export the entire vault as a JSON file for backup or transfer.

## Project Structure

### Backend

- `server.js`: Main server file managing REST API endpoints for vault operations.
- `vault.json`: JSON file storing saved passwords categorized by user.
- Express routes handle CRUD operations on the vault (Create, Read, Delete passwords).
- Middleware for CORS and JSON parsing.

### Frontend

- `public/index.html`: The main HTML interface.
- `public/style.css`: CSS styles (embedded or separate).
- `public/script.js`: Client-side JavaScript handling UI logic, password generation, API communication, and theme toggling.
- Uses responsive design and Leaflet.js or similar for any map integrations (if applicable).

## Notes

- Passwords are stored in a JSON file on the server and are not encrypted—avoid using this for highly sensitive information in production.
- The app requests permission for clipboard access to enable copying passwords.
- The backend treats empty category inputs as "Uncategorized" by default.
- Cross-origin requests are enabled for easier development, but configure CORS carefully for production environments.

