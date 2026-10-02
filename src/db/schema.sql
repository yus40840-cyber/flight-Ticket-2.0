-- ============================================================================
-- FLIGH.COM DATABASE SCHEMA (POSTGRESQL / RELATIONAL SQL COMPATIBLE)
-- Official Database Definition for Flights, Hotels, Bookings & E-Tickets
-- ============================================================================

-- Create ENUM types
CREATE TYPE booking_status_enum AS ENUM ('CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED', 'CHECKED_IN', 'COMPLETED');
CREATE TYPE payment_status_enum AS ENUM ('PAID', 'PENDING', 'FAILED', 'REFUNDED');
CREATE TYPE cabin_class_enum AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST');
CREATE TYPE trip_type_enum AS ENUM ('ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY');

-- ----------------------------------------------------------------------------
-- 1. USERS & PASSENGER PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    phone VARCHAR(30),
    passport_or_cnic VARCHAR(40),
    nationality VARCHAR(60) DEFAULT 'Pakistan',
    date_of_birth DATE,
    coins_balance INT DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. AIRLINES & AIRPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE airlines (
    code VARCHAR(3) PRIMARY KEY, -- e.g. EK, PK, QR, TK, SV
    name VARCHAR(80) NOT NULL,
    country VARCHAR(60) NOT NULL,
    callsign VARCHAR(60),
    logo_color VARCHAR(10) DEFAULT '#0066E0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE airports (
    iata_code VARCHAR(3) PRIMARY KEY, -- e.g. KHI, MXP, LHE, ISB, DXB
    name VARCHAR(120) NOT NULL,
    city VARCHAR(80) NOT NULL,
    country VARCHAR(60) NOT NULL,
    terminals INT DEFAULT 1,
    timezone VARCHAR(50) DEFAULT 'UTC'
);

-- ----------------------------------------------------------------------------
-- 3. FLIGHT INVENTORY & SCHEDULES
-- ----------------------------------------------------------------------------
CREATE TABLE flights (
    id VARCHAR(36) PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL, -- e.g. EK 607, PK 769
    airline_code VARCHAR(3) NOT NULL REFERENCES airlines(code) ON DELETE RESTRICT,
    origin_code VARCHAR(3) NOT NULL REFERENCES airports(iata_code) ON DELETE RESTRICT,
    dest_code VARCHAR(3) NOT NULL REFERENCES airports(iata_code) ON DELETE RESTRICT,
    departure_time VARCHAR(20) NOT NULL, -- e.g. "03:20 KHI"
    arrival_time VARCHAR(20) NOT NULL,   -- e.g. "14:20 MXP"
    duration VARCHAR(30) NOT NULL,       -- e.g. "13h 50m"
    stops INT DEFAULT 0,
    stop_details VARCHAR(80),
    aircraft VARCHAR(60) NOT NULL,       -- e.g. "Boeing 777-300ER"
    cabin_class cabin_class_enum DEFAULT 'ECONOMY',
    base_price_pkr DECIMAL(12, 2) NOT NULL,
    tax_pkr DECIMAL(12, 2) DEFAULT 0,
    baggage_allowance VARCHAR(60) DEFAULT '30 KG Check-in',
    meal_type VARCHAR(60) DEFAULT 'Halal Gourmet Certified',
    available_seats INT DEFAULT 180,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flights_route ON flights(origin_code, dest_code);
CREATE INDEX idx_flights_airline ON flights(airline_code);

-- ----------------------------------------------------------------------------
-- 4. HOTELS & ROOM TYPES
-- ----------------------------------------------------------------------------
CREATE TABLE hotels (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT,
    rating_score DECIMAL(3, 1) DEFAULT 8.5,
    review_count INT DEFAULT 100,
    price_per_night_pkr DECIMAL(12, 2) NOT NULL,
    stars INT DEFAULT 4,
    free_breakfast BOOLEAN DEFAULT TRUE,
    free_cancellation BOOLEAN DEFAULT TRUE,
    amenities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_city ON hotels(city);

-- ----------------------------------------------------------------------------
-- 5. BOOKINGS & ORDERS (MAIN TRANSACTION LEDGER)
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    pnr VARCHAR(12) UNIQUE NOT NULL, -- e.g. CIM-749210 / FLI-829104
    booking_type VARCHAR(20) NOT NULL, -- 'flight' | 'hotel'
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    flight_id VARCHAR(36) REFERENCES flights(id) ON DELETE SET NULL,
    hotel_id VARCHAR(36) REFERENCES hotels(id) ON DELETE SET NULL,
    
    -- Passenger Information
    passenger_name VARCHAR(120) NOT NULL,
    passenger_passport_cnic VARCHAR(40) NOT NULL,
    passenger_email VARCHAR(191) NOT NULL,
    passenger_phone VARCHAR(30) NOT NULL,
    
    -- Financials
    total_amount_pkr DECIMAL(12, 2) NOT NULL,
    discount_pkr DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PKR',
    payment_method VARCHAR(40) DEFAULT 'DEBIT_CREDIT_CARD',
    payment_status payment_status_enum DEFAULT 'PAID',
    transaction_ref VARCHAR(60),
    
    -- Status & Lifecycle
    booking_status booking_status_enum DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_pnr ON bookings(pnr);
CREATE INDEX idx_bookings_user_email ON bookings(passenger_email);
CREATE INDEX idx_bookings_status ON bookings(booking_status);

-- ----------------------------------------------------------------------------
-- 6. ELECTRONIC TICKETS (IATA COMPLIANT E-TICKET & BOARDING PASS)
-- ----------------------------------------------------------------------------
CREATE TABLE e_tickets (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- e.g. "214-8930194821"
    pnr VARCHAR(12) NOT NULL,
    
    -- Boarding & Airport Gate Assignment
    seat VARCHAR(20) DEFAULT '14A (Window)',
    gate VARCHAR(10) DEFAULT '24',
    terminal VARCHAR(10) DEFAULT '1',
    boarding_time VARCHAR(20) DEFAULT '02:35 KHI',
    cabin_class VARCHAR(30) DEFAULT 'Economy',
    
    -- Security & Scanning Vectors
    barcode_data VARCHAR(120) NOT NULL, -- Code-128 barcode payload
    qr_security_hash VARCHAR(100) NOT NULL, -- SHA256 Verification Hash
    issue_date VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_etickets_pnr ON e_tickets(pnr);
CREATE INDEX idx_etickets_ticket_number ON e_tickets(ticket_number);

-- ----------------------------------------------------------------------------
-- 7. COUPONS & REWARDS
-- ----------------------------------------------------------------------------
CREATE TABLE coupons (
    code VARCHAR(30) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    discount_title VARCHAR(50) NOT NULL,
    discount_desc TEXT,
    min_spend_pkr DECIMAL(12, 2) DEFAULT 0,
    discount_amount_pkr DECIMAL(12, 2) DEFAULT 0,
    discount_percent INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- INITIAL SEED DATA FOR PRODUCTION AIRLINE INVENTORY
-- ============================================================================

INSERT INTO airlines (code, name, country, logo_color) VALUES
('EK', 'Emirates', 'United Arab Emirates', '#D71921'),
('PK', 'Pakistan International Airlines', 'Pakistan', '#004A26'),
('QR', 'Qatar Airways', 'Qatar', '#5C0632'),
('TK', 'Turkish Airlines', 'Turkey', '#E81932'),
('SV', 'Saudia', 'Saudi Arabia', '#0B5E38')
ON CONFLICT (code) DO NOTHING;

INSERT INTO airports (iata_code, name, city, country, terminals) VALUES
('KHI', 'Jinnah International Airport', 'Karachi', 'Pakistan', 1),
('LHE', 'Allama Iqbal International Airport', 'Lahore', 'Pakistan', 1),
('ISB', 'Islamabad International Airport', 'Islamabad', 'Pakistan', 1),
('MXP', 'Milan Malpensa Airport', 'Milan', 'Italy', 2),
('DXB', 'Dubai International Airport', 'Dubai', 'UAE', 3),
('LHR', 'London Heathrow Airport', 'London', 'UK', 5),
('IST', 'Istanbul International Airport', 'Istanbul', 'Turkey', 1)
ON CONFLICT (iata_code) DO NOTHING;
