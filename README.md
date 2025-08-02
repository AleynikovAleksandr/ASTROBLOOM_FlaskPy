# Restaurant Web Application — `restaurant_web_app`

## Features(at the current moment of development)

- User registration and login
- Viewing detailed menu items (with price, weight, and ingredients)
- Dish cards with images and descriptions
- Cart functionality (add/remove items, quantity adjustment)
- Sorting by name and price
- Reservations and order viewing (interface in progress)
- Secure logout
- Flash messages for status feedback

## Technologies Used

- Python 3.11+
- Flask
- SQLAlchemy
- Flask-Login
- MySQL
- HTML5
- CSS3
- JavaScript

## Getting Started

# Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AleynikovAleksandr/restaurant_web_app.git
   cd restaurant_web_app
   ```

2. Create and activate a virtual environment:
   - On macOS/Linux:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
   - On Windows:
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

# Application Notes
- **Visitor Login**: After logging in as a visitor, users are redirected to a modern user interface displaying a dish menu.
- **Logout Functionality**: A "Logout" button in the header handles logout and redirects users to the login screen.
- **Flash Messages**: Flash messages are used to notify users of success or error states during authentication.

# License

- This project is for educational purposes and has no license. Contact the author for usage permissions.

# Author

Developed by Aleynikov Aleksandr  
Contact: aleynikov.aleksandr@icloud.com