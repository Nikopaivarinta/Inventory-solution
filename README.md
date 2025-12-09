# Inventory Management System
Retail App by SW Finland X MSFT

A modern web application for managing inventory with a clean and intuitive interface.

## Features

- 📦 Browse products with search and category filters
- ➕ Add new products with detailed information
- 🗑️ Delete products from inventory
- 📊 Update product quantities with easy increment/decrement controls
- 💰 Track total inventory value and item counts
- 🎨 Modern, responsive UI that works on all devices
- 💾 Local SQLite database pre-populated with 20 sample products

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Styling**: Pure CSS with modern design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nikopaivarinta/Inventory-solution.git
cd Inventory-solution
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

1. Start the backend server (from the root directory):
```bash
npm start
```
The server will start on http://localhost:3001

2. In a new terminal, start the frontend (from the root directory):
```bash
npm run client
```
The frontend will start on http://localhost:3000

3. Open your browser and navigate to http://localhost:3000

## Project Structure

```
Inventory-solution/
├── server.js           # Express backend server
├── inventory.db        # SQLite database (auto-created)
├── package.json        # Backend dependencies
├── client/             # React frontend
│   ├── src/
│   │   ├── App.jsx     # Main application component
│   │   ├── App.css     # Application styles
│   │   └── index.css   # Global styles
│   ├── index.html
│   └── package.json    # Frontend dependencies
└── README.md
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Add a new product
- `PUT /api/products/:id` - Update product (quantity or other fields)
- `DELETE /api/products/:id` - Delete a product

## Database Schema

```sql
products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  price REAL NOT NULL,
  image TEXT
)
```

## Usage

1. **Browse Products**: View all products in a card-based grid layout
2. **Search**: Use the search bar to find products by name or description
3. **Filter**: Filter products by category using the dropdown
4. **Add Product**: Click "Add Product" button and fill in the form
5. **Update Quantity**: Use the +1/-1 buttons on each product card
6. **Delete Product**: Click the "Delete" button on any product card

## Sample Data

The database is automatically seeded with 20 sample products across different categories:
- Electronics (laptops, phones, accessories)
- Furniture (chairs, desks, lamps)
- Accessories (cables, cases, organizers)

## License

ISC
