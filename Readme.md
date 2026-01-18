# Guestara - Menu & Services Management Backend

A robust backend system for managing menus, services, pricing, and bookings similar to what real restaurant/SaaS products use.

## 🏗 Architecture Overview

This project follows a **layered service architecture** which separates concerns cleanly:

```
Routes → Controllers → Services → Models → Database
```

### Why This Architecture?

- **Routes**: Define API structure and endpoints
- **Controllers**: Handle HTTP requests/responses (thin layer)
- **Services**: Contain all business logic (pricing, tax inheritance, booking validation)
- **Models**: Define data structure and persistence
- **Validators**: Input validation using Zod
- **Middleware**: Global error handling and validation

This keeps the system modular, testable, and scalable.

## 📊 Data Modeling Decisions

### Entity Relationships

```
Category
  ├── Subcategory (optional)
  │     └── Item
  └── Item (can belong directly to category)
```

### Key Design Choices

1. **Flexible Hierarchy**: Items can belong to either Category OR Subcategory (not both)
2. **Tax Inheritance Chain**: Item → Subcategory → Category
3. **Soft Deletes**: All entities use `is_active` flag instead of hard deletion
4. **Flexible Pricing**: Single `pricing` object with type and config for extensibility

## 🧮 Tax Inheritance Implementation

### The Challenge
When a category's tax changes, all items inheriting that tax must reflect the new value **without manually updating every item**.

### My Solution
**Dynamic Resolution at Query Time**

Instead of storing computed tax values in items, I resolve tax dynamically:

```javascript
// Tax resolution logic
if (item.tax_applicable !== null) {
  return item.tax;
} else if (item.subcategory && subcategory.tax_applicable !== null) {
  return subcategory.tax;
} else {
  return category.tax;
}
```

### Benefits
- ✅ Category tax updates automatically reflect in all items
- ✅ No background jobs needed
- ✅ Items can override inheritance at any level
- ✅ Clear inheritance chain

### Tradeoff
- Requires one extra database query to fetch parent tax
- But improves consistency and maintainability significantly

## 💰 Pricing Engine

The system supports 5 pricing types:

### 1. Static Pricing
Fixed price regardless of context.
```json
{
  "type": "STATIC",
  "config": { "price": 200 }
}
```

### 2. Tiered Pricing
Price based on usage duration.
```json
{
  "type": "TIERED",
  "config": {
    "tiers": [
      { "max_duration": 1, "price": 300 },
      { "max_duration": 2, "price": 500 },
      { "max_duration": 4, "price": 800 }
    ]
  }
}
```

### 3. Complimentary
Always free.
```json
{
  "type": "COMPLIMENTARY",
  "config": {}
}
```

### 4. Discounted Pricing
Base price with discount (flat or percentage).
```json
{
  "type": "DISCOUNTED",
  "config": {
    "base_price": 500,
    "discount_type": "PERCENTAGE",
    "discount_value": 20
  }
}
```

### 5. Dynamic Pricing
Time-based pricing windows.
```json
{
  "type": "DYNAMIC",
  "config": {
    "time_windows": [
      { "start": "08:00", "end": "11:00", "price": 199 },
      { "start": "11:00", "end": "18:00", "price": 299 }
    ]
  }
}
```

### Pricing Endpoint
```
GET /api/items/:id/price?duration=2&time=10:30&addons[]=addon_id
```

Response includes:
- Applied pricing rule
- Base price
- Add-on total
- Tax calculation
- Grand total

## 🗓 Booking System

### Features
- Check available slots for any date
- Prevent double booking (enforced at database level)
- Day-of-week validation
- Time slot validation

### Flow
1. User requests available slots for a date
2. System checks item availability configuration
3. Filters out already booked slots
4. Returns available slots
5. Booking creates a record with unique constraint on (item, date, time_slot)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd guestara-backend

# Install dependencies
npm install

# Create .env file
PORT=3000
MONGODB_URI=mongodb://localhost:27017/guestara
NODE_ENV=development

# Start server
npm run dev
```

Server runs at `http://localhost:3000`

## 📡 API Documentation

### Categories

```bash
# Create category
POST /api/categories
{
  "name": "Beverages",
  "tax_applicable": true,
  "tax_percentage": 5
}

# Get all categories
GET /api/categories?page=1&limit=10&sortBy=name

# Get category by ID
GET /api/categories/:id

# Update category
PUT /api/categories/:id

# Delete category (soft delete)
DELETE /api/categories/:id
```

### Items

```bash
# Create item
POST /api/items
{
  "name": "Cappuccino",
  "category_id": "category_id_here",
  "pricing": {
    "type": "STATIC",
    "config": { "price": 200 }
  }
}

# Get all items with filters
GET /api/items?search=coffee&category_id=xxx&min_price=100&max_price=500

# Get item price
GET /api/items/:id/price?duration=2&addons[]=addon_id

# Update item
PUT /api/items/:id

# Delete item
DELETE /api/items/:id
```

### Bookings

```bash
# Get available slots
GET /api/bookings/items/:itemId/slots?date=2024-01-20

# Create booking
POST /api/bookings
{
  "item_id": "item_id_here",
  "date": "2024-01-20",
  "time_slot": { "start": "10:00", "end": "11:00" },
  "customer_name": "John Doe"
}

# Get all bookings
GET /api/bookings?item_id=xxx&date=2024-01-20

# Cancel booking
PUT /api/bookings/:id/cancel
```

## 🤔 Technical Decisions

### Why MongoDB?
- **Flexibility**: Pricing config varies by type, perfect for schema-less storage
- **Document Model**: Natural fit for nested structures (pricing, availability)
- **Fast Iteration**: Easy to add new pricing types without migrations
- **Tradeoff**: Less strict validation at DB level (handled in application layer)

### Three Things I Learned
1. **Tax Inheritance**: Implementing dynamic resolution is cleaner than storing computed values
2. **Pricing Extensibility**: Using discriminated unions (type + config) makes adding pricing types easy
3. **Validation Layers**: Combining Zod (input) + Mongoose (schema) + Service (business) gives robust validation

### Hardest Challenge
**Preventing Double Bookings While Supporting Flexible Time Slots**

Initial approach was to check conflicts in application code, but this had race conditions. 

**Solution**: Created compound unique index on `(item_id, date, time_slot.start)` at database level. MongoDB enforces uniqueness, preventing race conditions even under concurrent requests.

### What I'd Improve With More Time
1. **Add-on Groups**: Support "Choose 1 of 3" constraints
2. **Caching**: Cache tax resolution for better performance
3. **Testing**: Add unit tests for services and integration tests for APIs
4. **API Documentation**: Generate Swagger/OpenAPI documentation
5. **Rate Limiting**: Add request rate limiting
6. **Audit Logs**: Track all changes to entities

## 🎯 Project Structure

```
src/
├── config/          # Database and environment config
├── models/          # Mongoose schemas
├── controllers/     # Request handlers (thin)
├── services/        # Business logic (thick)
├── routes/          # API routes
├── validators/      # Zod schemas
├── middlewares/     # Global middleware
├── utils/           # Helper functions
├── app.js           # Express app setup
└── server.js        # Entry point
```

## 🧪 Example Scenarios

### Scenario 1: Coffee Shop

```bash
# Create category with tax
POST /api/categories
{
  "name": "Beverages",
  "tax_applicable": true,
  "tax_percentage": 5
}

# Create coffee item (inherits tax from category)
POST /api/items
{
  "name": "Cappuccino",
  "category_id": "{{category_id}}",
  "pricing": {
    "type": "STATIC",
    "config": { "price": 200 }
  }
}

# Get price (will include 5% tax)
GET /api/items/{{item_id}}/price
```

### Scenario 2: Meeting Room with Tiered Pricing

```bash
# Create meeting room
POST /api/items
{
  "name": "Conference Room A",
  "category_id": "{{category_id}}",
  "is_bookable": true,
  "availability": {
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "time_slots": [
      { "start": "10:00", "end": "11:00" },
      { "start": "14:00", "end": "15:00" }
    ]
  },
  "pricing": {
    "type": "TIERED",
    "config": {
      "tiers": [
        { "max_duration": 1, "price": 300 },
        { "max_duration": 2, "price": 500 }
      ]
    }
  }
}

# Check available slots
GET /api/bookings/items/{{item_id}}/slots?date=2024-01-20

# Book slot
POST /api/bookings
{
  "item_id": "{{item_id}}",
  "date": "2024-01-20",
  "time_slot": { "start": "10:00", "end": "11:00" },
  "customer_name": "John Doe"
}
```

## 📝 Notes

- All timestamps are in UTC
- Soft deletes preserve data integrity
- Pagination defaults: page=1, limit=10
- All prices are in the smallest currency unit (e.g., paise for INR)

## Author

Gopal Mehtre.

- This is an assignment for Guestara.