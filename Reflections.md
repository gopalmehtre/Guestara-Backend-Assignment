## 💭 Reflections

### Why did you choose MongoDB?

Honestly, I picked MongoDB mainly because the pricing configuration varies so much between types. For static pricing, you just need a price. For tiered, you need an array of tiers. For dynamic, you need time windows. Trying to model this in a relational database with separate tables felt overly complicated.

With MongoDB, I could just store the whole pricing config as a flexible object and not worry about migrations every time I wanted to add a new pricing type. The document model also felt natural for things like availability slots and nested structures.

The downside is that I lose some of the strict validation you get with SQL, but I handled that in the application layer with Zod and service validations. If this were a banking system or something where data integrity is critical, I'd probably go with PostgreSQL. But for a menu management system, the flexibility was worth it.

### Three things I learned while building this

**1. Tax inheritance is trickier than it looks**

At first, I thought I'd just copy the category's tax to the item when creating it. Simple, right? Wrong. When the category's tax changes, you'd have to update every single item. I ended up implementing dynamic resolution instead - items store `null` and we look up the parent's tax at query time. It's one extra query, but it keeps everything consistent automatically.

**2. Validation should happen at multiple layers**

I initially put all validation in the models, then realized I needed business logic validation too (like "tiers can't overlap"). Now I have three layers: Zod catches bad input format, Mongoose ensures data structure, and services handle business rules. It feels like overkill until you catch a bug at each level.

**3. Race conditions are real, even in small projects**

I learned this the hard way with bookings. Two people could book the same slot simultaneously because I was checking availability in code. Moving the uniqueness check to a database constraint was a light-bulb moment - let the database handle what it's good at.

### The hardest technical or design challenge you faced

Preventing double bookings was definitely the hardest part.

My first attempt was to query all bookings for that item and date, check if any overlapped with the requested time slot, and then create the booking if it was free. Seemed logical. But then I realized: what if two requests come in at the exact same time? Both check, both see it's available, both create bookings. Race condition.

I considered using transactions or locking mechanisms, but that felt too complex. Then I remembered - databases are built to handle uniqueness! I created a compound unique index on `(item_id, date, time_slot.start)`. Now MongoDB itself prevents duplicates. If two requests try to book the same slot, the second one gets a duplicate key error, which I catch and return as "This slot is already booked."

The elegant part is that it's both simpler (less code) and more reliable (no race conditions) than my original approach. Sometimes the best solution is to use the tools you already have properly.

### What you would improve or refactor if you had more time

**Testing would be first priority.** Right now I've been testing manually with curl, but proper unit tests for the services and integration tests for the APIs would make this much more maintainable. I'd use Jest for unit tests and Supertest for the API tests.

**Add-on groups would be useful.** The assignment mentioned "Choose 1 of 3 sauces" type constraints. Right now add-ons are independent - you can select any combination. Adding validation for "must choose exactly one from this group" or "maximum 2 toppings" would make it more realistic.

**Caching for tax resolution.** Every price calculation queries the database to get the category's tax. For a high-traffic system, I'd cache category and subcategory data in Redis since they don't change that often. Would probably reduce response times by 30-40%.

**Better time zone handling.** Right now everything assumes the server's time zone. For a real system, I'd want to store the restaurant's timezone and handle bookings in local time. The current implementation would break if your server is in UTC but your restaurant is in EST.

**Audit logging.** It would be really useful to track who changed what and when. Especially for things like price changes or tax updates. Right now if a category's tax changes, you can't see the history. A simple audit log table would solve this.

**API documentation with Swagger.** I documented everything in the README, but having interactive API docs where you can test endpoints directly would be much better for other developers using this API.

The core architecture is solid though - these are all additions rather than fixes. I'm happy with how the pricing engine and tax inheritance turned out.