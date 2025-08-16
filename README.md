# Restaurant Web Application — `restaurant_web_app`

## Features (Current Development Status)

* User registration and login for **Visitors** and **Staff**
* Viewing detailed menu items (price, weight, ingredients, images)
* Dish cards with modern UI styling and descriptions
* Cart functionality:
  * Add/remove items
  * Adjust quantity with +/− buttons
  * Undo/Redo actions
  * Clear all items
* Sorting menu items by name and price
* Reservations and order overview (interface under development)
* Secure logout for all user types
* Flash messages for success/error feedback
* Client-side and server-side cart synchronization (IndexedDB + Flask API)

## Technologies Used

* Python 3.11+
* Flask + Flask-Login
* SQLAlchemy (ORM)
* MySQL (Database)
* HTML5, CSS3, JavaScript (ES6+)
* AJAX/Fetch API for cart synchronization

## Getting Started

### Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AleynikovAleksandr/restaurant_web_app.git
   cd restaurant_web_app
   ```

2. Create and activate a virtual environment:
   * On macOS/Linux:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
   * On Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run the Application

```bash
cd backend
python run.py
```

Then, open your browser and navigate to:
```
http://127.0.0.1:5000
```

## Test Accounts

**Visitors (Customers):**
- Login: `IvanovII`
- Password: `Pa$$w0rd`

**Waiters (Staff):**
- Login: `of_SemenovKN` 
- Password: `Pa$$w0rd`

## Application Notes

* **Visitor Login**: After logging in, visitors are redirected to a modern user interface showing the dish menu with interactive cards.
* **Cart System**: Fully interactive cart with undo/redo, quantity adjustment, server sync, and persistent storage in IndexedDB.
* **Menu Sorting**: Users can sort dishes by name and price.
* **Logout**: Secure logout available in the header.
* **Flash Messages**: Used for authentication and cart actions feedback.
* **Responsive Design**: Interface adapts to mobile and desktop screens.

## License

Copyright (c) 2025 Aleynikov Aleksandr

Permission is hereby granted, free of charge, to any person obtaining a copy of this software (`restaurant_web_app`) for educational or demonstration purposes only. The software may not be used for commercial purposes, redistributed, or modified without prior written permission from the copyright holder.

For permissions, contact: [aleynikov.aleksandr@icloud.com](mailto:aleynikov.aleksandr@icloud.com).

## Author

Developed by Aleynikov Aleksandr  
Contact: [aleynikov.aleksandr@icloud.com](mailto:aleynikov.aleksandr@icloud.com)
