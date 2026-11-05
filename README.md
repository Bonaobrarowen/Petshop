# Pet Shop Grooming Management System

A Node.js, Express, and SQLite system for managing customers, pets, inventory, grooming appointments, pet pickups, point-of-sale transactions, users, backups, and dashboard activity.

## Requirements

- Node.js
- npm

## Installation and start

1. Open a terminal in the project folder.
2. Install the dependencies:

   ```powershell
   npm install
   ```

3. Create the environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Open `.env` and change `JWT_SECRET` to a private, random value.
5. Start the server:

   ```powershell
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) in a browser.

To stop the system, return to the terminal running the server and press `Ctrl+C`.

## Login accounts

| Username | Password | Role | Full name |
| --- | --- | --- | --- |
| `admin` | `admin123` | Administrator | System Administrator |
| `staff_anna` | `staff123` | Staff | Anna Reyes |
| `staff_mark` | `staff123` | Staff | Mark Santos |

Change the default password under **Users** after signing in.

New users can also create a staff account from the login page using **Create an account**.

## Load sample data

The sample seed resets operational sample records and loads customers, pets, inventory, appointments, pickup records, and the test accounts above.

Run:

```powershell
npm run seed
```

The seed reloads:

- 3 users
- 10 customers
- 4 pets
- 7 inventory products
- 4 grooming appointments
- 2 authorized pickups
- 10 sales history entries

## System features

### Dashboard

- Displays grooming appointments, sales, low-stock items, customers, and pets.
- Shows the current live date and time.
- Includes quick actions for adding customers and pets, scheduling grooming, and opening the point of sale.

### Authentication and user management

- Centered login and signup interface titled **Pet Shop Grooming**.
- Login uses **Login** as the heading and button label.
- Passwords are hidden and must meet minimum signup length requirements.
- New public accounts receive the Staff role.
- User creation displays success or error feedback.
- Administrators can manage staff and administrator accounts.

### Point of sale

- Search inventory by product name.
- Validates stock availability and quantity.
- Calculates cash change after the cashier enters cash tendered.
- Displays a digital receipt and supports printing.
- Automatically deducts product stock and records sales and payments.

### Inventory and low stock

- Inventory tracks product ID, name, category, price, stock, reorder level, and barcode.
- Administrators can delete inventory products.
- Inventory categories are limited to pet-shop categories.
- Price cannot be negative.
- Stock and reorder levels cannot be negative.
- Products at or below their reorder level are identified with low-stock warning badges.
- Dedicated Low Stock view lists products requiring restocking.


### Customers and pets

- Customer records contain name, phone, email, and address.
- Pet records use a customer dropdown instead of requiring an owner ID to be typed.
- Customer view includes **Add pet for this customer**, which opens the Pets page with that owner selected.
- Customer history shows pet, grooming, and sales counts.
- Pet history always shows the owner's name and phone number.

### Grooming appointments

- Uses native HTML5 date and time input.
- Defaults to approximately 30 minutes from the current time.
- Displays the live system date and time.
- Rejects appointments scheduled in the past.
- Grooming history shows the pet, owner, owner phone number, service, date, price, and status together.

Grooming services include:

| Service | Price |
| --- | --- |
| Full Grooming Package | PHP 850.00 |
| Basic Shower & Blow Dry | PHP 450.00 |
| Nail Trimming & Filing | PHP 150.00 |
| Ear Cleaning & Plucking | PHP 150.00 |
| Anti-Flea & Tick Treatment | PHP 350.00 |
| De-Shedding & De-Matting | PHP 300.00 |
| Teeth Brushing & Breath Care | PHP 120.00 |
| Puppy / Kitten First Bath | PHP 300.00 |

### Pet pickup

- Tracks authorized person, relationship, contact number, ID presentation, verification status, release time, and verifier.
- Verification statuses are Pending, Verified, or Rejected.
- Pickup records can be searched and verified by staff.

## Sample inventory

| Barcode | Product | Category | Price (PHP) | Stock | Reorder level |
| --- | --- | ---: | ---: | ---: | ---: |
| PET100001 | Premium Adult Dog Food (5kg) | Food | 650.00 | 15 | 5 |
| PET100002 | Kitten Milk Replacer (300g) | Food | 350.00 | 3 | 5 |
| PET100003 | Anti-Tick & Flea Dog Shampoo | Grooming | 280.00 | 12 | 4 |
| PET100004 | Stainless Steel Pet Bowl | Accessories | 150.00 | 25 | 10 |
| PET100005 | Chewable Dental Treats (Pack) | Treats | 120.00 | 2 | 5 |
| PET100006 | Cat Scratching Post | Accessories | 850.00 | 6 | 2 |
| PET100007 | De-shedding Pet Brush | Grooming | 220.00 | 8 | 3 |

## Sample customer and pet records

| Customer ID | Customer | Phone | Pet | Species | Breed |
| ---: | --- | --- | --- | --- | --- |
| 1 | Juan Dela Cruz | 09171234567 | Buddy | Dog | Golden Retriever |
| 1 | Juan Dela Cruz | 09171234567 | Milo | Cat | Siamese |
| 2 | Maria Clara | 09189876543 | Bella | Dog | Poodle |
| 3 | Pedro Penduko | 09195551234 | Luna | Cat | Persian |

## Sample grooming appointments

| Appointment | Pet | Service | Date and time |
| ---: | --- | --- | --- |
| 1 | Buddy | Full Grooming Package | November 6, 2026 at 10:00 AM |
| 2 | Bella | Basic Shower & Blow Dry | November 6, 2026 at 11:30 AM |
| 3 | Milo | Anti-Flea & Tick Treatment | November 6, 2026 at 2:00 PM |
| 4 | Luna | Nail Trimming & Filing | November 6, 2026 at 3:30 PM |

## Backups

Backups are saved in `database/backups/`. A restore is staged and applied on the next server restart.

Backups are saved in `database/backups/`. A restore is staged and applied on the next server restart.
