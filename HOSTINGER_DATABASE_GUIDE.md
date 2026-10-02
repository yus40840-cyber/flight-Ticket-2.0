# Hostinger Database Setup & Import Guide for Fligh.com

This guide provides step-by-step instructions to create, import, and connect the **Fligh.com** production MySQL database on **Hostinger Web Hosting**, **Hostinger Cloud Hosting**, or **Hostinger VPS**.

---

## 📁 Database Files Provided

- **`/hostinger_mysql_database.sql`** (Root repository copy)
- **`/src/db/hostinger_mysql_database.sql`** (Source tree copy)

Both files contain complete schemas, relations, indexes, and full production seed data (airports, airlines, flights, hotels, coupons, sample bookings, and e-tickets).

---

## Step 1: Create MySQL Database in Hostinger hPanel

1. Log in to your **Hostinger Control Panel (hPanel)** at [https://hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Under your hosting plan, navigate to **Databases** → **MySQL Databases**.
3. Fill in the **Create a New MySQL Database And Database User** form:
   - **MySQL Database Name**: e.g. `fligh_db` (Hostinger will prefix it, e.g. `u123456789_fligh_db`)
   - **MySQL Username**: e.g. `fligh_user` (Hostinger will prefix it, e.g. `u123456789_fligh_user`)
   - **Password**: Create a strong password (copy and save this securely).
4. Click **Create**.

---

## Step 2: Import the SQL File via Hostinger phpMyAdmin

1. On the same **MySQL Databases** page in hPanel, scroll down to **List of Current MySQL Databases And Users**.
2. Find your new database and click the **phpMyAdmin** button (or **Enter phpMyAdmin**).
3. In phpMyAdmin, click on your database name on the left sidebar:
   `u123456789_fligh_db`
4. Click on the **Import** tab in the top navigation bar.
5. In the **File to import** section, click **Choose File** (or Browse) and select:
   `hostinger_mysql_database.sql`
6. Keep the settings as default:
   - Format: **SQL**
   - Character set: **utf-8**
   - SQL compatibility mode: **NONE**
7. Scroll to the bottom and click the **Import** (or **Go**) button.
8. You will see a green success message:
   `"Import has been successfully finished, XX queries executed."`

---

## Step 3: Verified Tables Created

| Table Name | Description |
|---|---|
| `countries` | 12 countries with flags (🇵🇰, 🇮🇹, 🇦🇪, 🇸🇦, 🇬🇧, 🇹🇷, 🇺🇸, etc.) |
| `airports` | 26 worldwide airports (KHI, LHE, ISB, MXP, FCO, DXB, JED, LHR, JFK...) |
| `airlines` | 15 leading airlines (Emirates, Qatar Airways, Turkish, PIA, Saudia, BA...) |
| `flights` | Real flight schedules, PKR fares, halal meals, aircraft types |
| `hotels` | Milan & global luxury hotels with ratings and PKR pricing |
| `bookings` | Customer reservations with PNR references (`FLI-749210`) |
| `e_tickets` | IATA digital electronic tickets, boarding gates, seats, barcodes |
| `coupons` | Active discount coupons (`FLIGH10HOTEL`, `TAKE5FLIGHT`, `EXPLORE10`) |
| `users` | Customer profiles, passport/CNIC, and Fligh.com reward coins |
| `contact_inquiries` | Customer service help desk messages |

---

## Step 4: Connecting from Node.js / Express on Hostinger

Create or update your `.env` file on Hostinger:

```env
DB_HOST=localhost
DB_USER=u123456789_fligh_user
DB_PASSWORD=YourHostingerPasswordHere
DB_NAME=u123456789_fligh_db
DB_PORT=3306
```

### Node.js (mysql2/promise) connection snippet:

```typescript
import mysql from 'mysql2/promise';

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fligh_com_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Example Query:
export async function getFlightsFromKarachi() {
  const [rows] = await dbPool.query(
    'SELECT * FROM flights WHERE origin_code = ? AND is_active = 1',
    ['KHI']
  );
  return rows;
}
```

---

## Step 5: Connecting from PHP (Hostinger Native)

If you are using PHP scripts or API endpoints on Hostinger:

```php
<?php
$host = 'localhost';
$db   = 'u123456789_fligh_db';
$user = 'u123456789_fligh_user';
$pass = 'YourHostingerPasswordHere';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
```

---

## Troubleshooting Hostinger phpMyAdmin

1. **"File exceeds max upload size"**:
   - `hostinger_mysql_database.sql` is ~18KB, which is well below Hostinger's default 128MB or 256MB phpMyAdmin limit.
2. **"Unknown database 'fligh_com_db'"**:
   - If Hostinger prohibits creating databases via SQL scripts, simply remove the `CREATE DATABASE ...` and `USE ...` lines at the top of the file, then import directly into your assigned Hostinger database.
3. **Emoji / Flag encoding**:
   - The file uses `utf8mb4` with `COLLATE utf8mb4_unicode_ci` so country flags (🇵🇰, 🇮🇹, 🇦🇪) render with zero corruption.
