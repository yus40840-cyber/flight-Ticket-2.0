-- ============================================================================
-- FLIGH.COM PRODUCTION DATABASE FOR HOSTINGER (MYSQL / MARIADB 8.0+)
-- Public asset for direct browser download
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `fligh_com_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fligh_com_db`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `passport_or_cnic` VARCHAR(40) DEFAULT NULL,
  `nationality` VARCHAR(60) DEFAULT 'Pakistan',
  `date_of_birth` DATE DEFAULT NULL,
  `role` ENUM('USER', 'AGENT', 'ADMIN') NOT NULL DEFAULT 'USER',
  `coins_balance` INT NOT NULL DEFAULT 500,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `countries`;
CREATE TABLE `countries` (
  `code` VARCHAR(3) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `flag_emoji` VARCHAR(10) NOT NULL,
  `region` VARCHAR(50) NOT NULL,
  `is_domestic_pk` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `airports`;
CREATE TABLE `airports` (
  `iata_code` VARCHAR(3) NOT NULL,
  `icao_code` VARCHAR(4) DEFAULT NULL,
  `name` VARCHAR(140) NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `country_code` VARCHAR(3) NOT NULL,
  `country_name` VARCHAR(80) NOT NULL,
  `terminals_count` INT NOT NULL DEFAULT 1,
  `annual_passengers` VARCHAR(30) DEFAULT NULL,
  `direct_from_pk` TINYINT(1) NOT NULL DEFAULT 1,
  `timezone` VARCHAR(50) DEFAULT 'UTC',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`iata_code`),
  KEY `fk_airports_country` (`country_code`),
  CONSTRAINT `fk_airports_country` FOREIGN KEY (`country_code`) REFERENCES `countries` (`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `airlines`;
CREATE TABLE `airlines` (
  `iata_code` VARCHAR(3) NOT NULL,
  `icao_code` VARCHAR(4) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(80) NOT NULL,
  `hub_airport_code` VARCHAR(3) DEFAULT NULL,
  `hub_airport_name` VARCHAR(120) DEFAULT NULL,
  `alliance` ENUM('Star Alliance', 'oneworld', 'SkyTeam', 'Independent') NOT NULL DEFAULT 'Independent',
  `fleet_size` INT NOT NULL DEFAULT 20,
  `skytrax_stars` TINYINT NOT NULL DEFAULT 4,
  `flagship_aircraft` VARCHAR(100) DEFAULT NULL,
  `logo_color` VARCHAR(10) NOT NULL DEFAULT '#0066E0',
  `is_partner` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`iata_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `flights`;
CREATE TABLE `flights` (
  `id` VARCHAR(64) NOT NULL,
  `flight_number` VARCHAR(15) NOT NULL,
  `airline_code` VARCHAR(3) NOT NULL,
  `aircraft_model` VARCHAR(80) NOT NULL,
  `origin_code` VARCHAR(3) NOT NULL,
  `origin_city` VARCHAR(80) NOT NULL,
  `dest_code` VARCHAR(3) NOT NULL,
  `dest_city` VARCHAR(80) NOT NULL,
  `departure_time_str` VARCHAR(30) NOT NULL,
  `arrival_time_str` VARCHAR(30) NOT NULL,
  `duration_str` VARCHAR(30) NOT NULL,
  `stops_count` INT NOT NULL DEFAULT 0,
  `stop_details` VARCHAR(120) DEFAULT 'Direct',
  `cabin_class` ENUM('Economy', 'Premium Economy', 'Business', 'First') NOT NULL DEFAULT 'Economy',
  `price_pkr` INT NOT NULL,
  `original_price_pkr` INT DEFAULT NULL,
  `seats_remaining` INT NOT NULL DEFAULT 9,
  `baggage_allowance` VARCHAR(80) DEFAULT '30 KG Check-in + 7 KG Cabin',
  `meal_type` VARCHAR(80) DEFAULT 'Complimentary Halal Hot Meal',
  `is_refundable` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_flights_airline` (`airline_code`),
  KEY `fk_flights_origin` (`origin_code`),
  KEY `fk_flights_dest` (`dest_code`),
  CONSTRAINT `fk_flights_airline` FOREIGN KEY (`airline_code`) REFERENCES `airlines` (`iata_code`) ON UPDATE CASCADE,
  CONSTRAINT `fk_flights_origin` FOREIGN KEY (`origin_code`) REFERENCES `airports` (`iata_code`) ON UPDATE CASCADE,
  CONSTRAINT `fk_flights_dest` FOREIGN KEY (`dest_code`) REFERENCES `airports` (`iata_code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `hotels`;
CREATE TABLE `hotels` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(140) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `country` VARCHAR(80) NOT NULL,
  `rating_score` DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  `reviews_count` INT NOT NULL DEFAULT 120,
  `price_pkr_per_night` INT NOT NULL,
  `original_price_pkr` INT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `amenities_json` JSON DEFAULT NULL,
  `star_classification` TINYINT NOT NULL DEFAULT 4,
  `free_cancellation` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hotels_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(64) NOT NULL,
  `reference` VARCHAR(20) NOT NULL,
  `e_ticket_number` VARCHAR(30) NOT NULL,
  `booking_type` ENUM('flight', 'hotel', 'train', 'package') NOT NULL DEFAULT 'flight',
  `title` VARCHAR(200) NOT NULL,
  `price_pkr` INT NOT NULL,
  `travel_date` VARCHAR(30) NOT NULL,
  `passenger_name` VARCHAR(120) NOT NULL,
  `passenger_email` VARCHAR(191) NOT NULL,
  `passenger_phone` VARCHAR(30) DEFAULT NULL,
  `passport_or_cnic` VARCHAR(40) DEFAULT NULL,
  `flight_id` VARCHAR(64) DEFAULT NULL,
  `hotel_id` VARCHAR(64) DEFAULT NULL,
  `booking_status` ENUM('CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED', 'CHECKED_IN', 'COMPLETED') NOT NULL DEFAULT 'CONFIRMED',
  `payment_status` ENUM('PAID', 'PENDING', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PAID',
  `payment_method` VARCHAR(50) DEFAULT 'Debit / Credit Card (VISA/MasterCard)',
  `qr_security_hash` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_reference` (`reference`),
  UNIQUE KEY `uk_bookings_eticket` (`e_ticket_number`),
  KEY `idx_bookings_email` (`passenger_email`),
  KEY `idx_bookings_status` (`booking_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `e_tickets`;
CREATE TABLE `e_tickets` (
  `id` VARCHAR(64) NOT NULL,
  `booking_id` VARCHAR(64) NOT NULL,
  `pnr` VARCHAR(20) NOT NULL,
  `e_ticket_number` VARCHAR(30) NOT NULL,
  `passenger_name` VARCHAR(120) NOT NULL,
  `seat_assignment` VARCHAR(10) NOT NULL DEFAULT '14A',
  `boarding_gate` VARCHAR(10) NOT NULL DEFAULT 'G4',
  `terminal` VARCHAR(10) NOT NULL DEFAULT 'T1',
  `boarding_time` VARCHAR(30) NOT NULL,
  `barcode_data` VARCHAR(150) NOT NULL,
  `qr_verification_url` VARCHAR(255) NOT NULL,
  `issued_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_etickets_booking` (`booking_id`),
  CONSTRAINT `fk_etickets_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(30) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `discount_title` VARCHAR(80) NOT NULL,
  `discount_desc` VARCHAR(255) NOT NULL,
  `discount_percentage` INT NOT NULL DEFAULT 10,
  `max_discount_pkr` INT NOT NULL DEFAULT 15000,
  `min_spend_pkr` INT NOT NULL DEFAULT 20000,
  `expires_in_text` VARCHAR(50) DEFAULT 'Ends in 4 days',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupons_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `contact_inquiries`;
CREATE TABLE `contact_inquiries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `subject` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('NEW', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'NEW',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. Insert Countries
INSERT INTO `countries` (`code`, `name`, `flag_emoji`, `region`, `is_domestic_pk`) VALUES
('PK', 'Pakistan', '🇵🇰', 'Domestic Pakistan', 1),
('IT', 'Italy', '🇮🇹', 'Europe', 0),
('AE', 'United Arab Emirates', '🇦🇪', 'Middle East', 0),
('SA', 'Saudi Arabia', '🇸🇦', 'Middle East', 0),
('GB', 'United Kingdom', '🇬🇧', 'Europe', 0),
('TR', 'Turkey', '🇹🇷', 'Europe', 0),
('US', 'United States', '🇺🇸', 'North America', 0),
('QA', 'Qatar', '🇶🇦', 'Middle East', 0),
('TH', 'Thailand', '🇹🇭', 'Asia', 0),
('SG', 'Singapore', '🇸🇬', 'Asia', 0),
('DE', 'Germany', '🇩🇪', 'Europe', 0),
('CA', 'Canada', '🇨🇦', 'North America', 0)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Insert Airports
INSERT INTO `airports` (`iata_code`, `icao_code`, `name`, `city`, `country_code`, `country_name`, `terminals_count`, `annual_passengers`, `direct_from_pk`) VALUES
('KHI', 'OPKC', 'Jinnah International Airport', 'Karachi', 'PK', 'Pakistan', 1, '7.5M+', 1),
('LHE', 'OPLA', 'Allama Iqbal International Airport', 'Lahore', 'PK', 'Pakistan', 1, '6.2M+', 1),
('ISB', 'OPIS', 'Islamabad International Airport', 'Islamabad', 'PK', 'Pakistan', 1, '5.8M+', 1),
('PEW', 'OPPS', 'Bacha Khan International Airport', 'Peshawar', 'PK', 'Pakistan', 1, '2.1M+', 1),
('SKT', 'OPST', 'Sialkot International Airport', 'Sialkot', 'PK', 'Pakistan', 1, '1.4M+', 1),
('MUX', 'OPMT', 'Multan International Airport', 'Multan', 'PK', 'Pakistan', 1, '1.2M+', 1),
('MXP', 'LIMC', 'Milan Malpensa Airport', 'Milan', 'IT', 'Italy', 2, '26.0M+', 1),
('FCO', 'LIRF', 'Leonardo da Vinci Fiumicino Airport', 'Rome', 'IT', 'Italy', 2, '40.5M+', 1),
('VCE', 'LIPZ', 'Venice Marco Polo Airport', 'Venice', 'IT', 'Italy', 1, '11.5M+', 1),
('DXB', 'OMDB', 'Dubai International Airport', 'Dubai', 'AE', 'United Arab Emirates', 3, '87.0M+', 1),
('AUH', 'OMAA', 'Zayed International Airport', 'Abu Dhabi', 'AE', 'United Arab Emirates', 2, '24.0M+', 1),
('JED', 'OEJN', 'King Abdulaziz International Airport (Hajj)', 'Jeddah', 'SA', 'Saudi Arabia', 3, '42.0M+', 1),
('RUH', 'OERK', 'King Khalid International Airport', 'Riyadh', 'SA', 'Saudi Arabia', 5, '31.0M+', 1),
('MED', 'OEMA', 'Prince Mohammad Bin Abdulaziz Airport', 'Madinah', 'SA', 'Saudi Arabia', 1, '9.5M+', 1),
('LHR', 'EGLL', 'London Heathrow Airport', 'London', 'GB', 'United Kingdom', 4, '79.2M+', 1),
('LGW', 'EGKK', 'London Gatwick Airport', 'London', 'GB', 'United Kingdom', 2, '41.0M+', 1),
('MAN', 'EGCC', 'Manchester International Airport', 'Manchester', 'GB', 'United Kingdom', 3, '28.0M+', 1),
('IST', 'LTFM', 'Istanbul Grand Airport', 'Istanbul', 'TR', 'Turkey', 1, '76.0M+', 1),
('JFK', 'KJFK', 'John F. Kennedy International Airport', 'New York', 'US', 'United States', 6, '62.5M+', 1),
('LAX', 'KLAX', 'Los Angeles International Airport', 'Los Angeles', 'US', 'United States', 9, '75.0M+', 0),
('ORD', 'KORD', 'O’Hare International Airport', 'Chicago', 'US', 'United States', 4, '73.9M+', 0),
('DOH', 'OTHH', 'Hamad International Airport', 'Doha', 'QA', 'Qatar', 1, '45.0M+', 1),
('BKK', 'VTBS', 'Suvarnabhumi Airport', 'Bangkok', 'TH', 'Thailand', 2, '51.0M+', 1),
('SIN', 'WSSS', 'Singapore Changi Airport', 'Singapore', 'SG', 'Singapore', 4, '68.0M+', 1),
('FRA', 'EDDF', 'Frankfurt International Airport', 'Frankfurt', 'DE', 'Germany', 2, '59.4M+', 1),
('YYZ', 'CYYZ', 'Toronto Pearson International Airport', 'Toronto', 'CA', 'Canada', 2, '45.0M+', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. Insert Airlines
INSERT INTO `airlines` (`iata_code`, `icao_code`, `name`, `country`, `hub_airport_code`, `hub_airport_name`, `alliance`, `fleet_size`, `skytrax_stars`, `flagship_aircraft`, `logo_color`) VALUES
('EK', 'UAE', 'Emirates', 'United Arab Emirates', 'DXB', 'Dubai International (DXB)', 'Independent', 260, 5, 'Airbus A380 & Boeing 777-300ER', '#D71921'),
('QR', 'QTR', 'Qatar Airways', 'Qatar', 'DOH', 'Hamad International (DOH)', 'oneworld', 254, 5, 'Airbus A350-1000 & Boeing 787-9', '#5C0632'),
('TK', 'THY', 'Turkish Airlines', 'Turkey', 'IST', 'Istanbul Grand Airport (IST)', 'Star Alliance', 450, 4, 'Airbus A350-900 & Boeing 787-9', '#E81932'),
('PK', 'PIA', 'Pakistan International Airlines', 'Pakistan', 'KHI', 'Jinnah International (KHI) / ISB', 'Independent', 34, 4, 'Boeing 777-200ER/LR & Airbus A320', '#004A26'),
('SV', 'SVA', 'Saudia', 'Saudi Arabia', 'JED', 'King Abdulaziz International (JED)', 'SkyTeam', 158, 4, 'Boeing 777-300ER & 787 Dreamliner', '#0B5E38'),
('BA', 'BAW', 'British Airways', 'United Kingdom', 'LHR', 'London Heathrow (LHR)', 'oneworld', 280, 4, 'Airbus A350-1000 & Boeing 777', '#075AAA'),
('LH', 'DLH', 'Lufthansa', 'Germany', 'FRA', 'Frankfurt Airport (FRA)', 'Star Alliance', 310, 4, 'Boeing 747-8 & Airbus A350', '#05164D'),
('SQ', 'SIA', 'Singapore Airlines', 'Singapore', 'SIN', 'Singapore Changi (SIN)', 'Star Alliance', 155, 5, 'Airbus A380 Suites & A350-900ULR', '#FFB81C'),
('EY', 'ETD', 'Etihad Airways', 'United Arab Emirates', 'AUH', 'Zayed International (AUH)', 'Independent', 90, 4, 'Airbus A380 & Boeing 787-10', '#BD9B60'),
('AF', 'AFR', 'Air France', 'France', 'CDG', 'Paris Charles de Gaulle (CDG)', 'SkyTeam', 220, 4, 'Airbus A350-900 & Boeing 777-300ER', '#002157'),
('KL', 'KLM', 'KLM Royal Dutch Airlines', 'Netherlands', 'AMS', 'Amsterdam Schiphol (AMS)', 'SkyTeam', 110, 4, 'Boeing 787-10 & Boeing 777', '#00A1DE'),
('DL', 'DAL', 'Delta Air Lines', 'United States', 'ATL', 'Atlanta Hartsfield (ATL)', 'SkyTeam', 970, 4, 'Airbus A350-900 & A330neo', '#C41230'),
('UA', 'UAL', 'United Airlines', 'United States', 'ORD', 'Chicago O’Hare (ORD)', 'Star Alliance', 950, 4, 'Boeing 787-10 & 777-300ER', '#002244'),
('AA', 'AAL', 'American Airlines', 'United States', 'DFW', 'Dallas/Fort Worth (DFW)', 'oneworld', 960, 4, 'Boeing 777-300ER & 787-9', '#0078D2'),
('AC', 'ACA', 'Air Canada', 'Canada', 'YYZ', 'Toronto Pearson (YYZ)', 'Star Alliance', 350, 4, 'Boeing 787-9 & 777-300ER', '#E31837')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. Insert Flights
INSERT INTO `flights` (`id`, `flight_number`, `airline_code`, `aircraft_model`, `origin_code`, `origin_city`, `dest_code`, `dest_city`, `departure_time_str`, `arrival_time_str`, `duration_str`, `stops_count`, `stop_details`, `cabin_class`, `price_pkr`, `original_price_pkr`, `seats_remaining`, `baggage_allowance`, `meal_type`) VALUES
('fl-ek-01', 'EK 607', 'EK', 'Boeing 777-300ER', 'KHI', 'Karachi', 'MXP', 'Milan', '03:20 KHI', '12:45 MXP', '11h 25m', 1, '1h 45m in Dubai (DXB)', 'Economy', 178500, 198000, 7, '30 KG Check-in + 7 KG Cabin', 'Emirates Halal Multi-course Dining'),
('fl-qr-02', 'QR 611', 'QR', 'Airbus A350-900', 'KHI', 'Karachi', 'MXP', 'Milan', '04:45 KHI', '13:15 MXP', '10h 30m', 1, '1h 20m in Doha (DOH)', 'Economy', 184200, 205000, 4, '35 KG Check-in + 7 KG Cabin', 'Qatar Gourmet Halal Meal'),
('fl-tk-03', 'TK 709', 'TK', 'Airbus A330-300', 'KHI', 'Karachi', 'MXP', 'Milan', '06:15 KHI', '14:55 MXP', '10h 40m', 1, '1h 50m in Istanbul (IST)', 'Economy', 165000, 185000, 9, '30 KG Check-in + 8 KG Cabin', 'Turkish Flying Chef Dining'),
('fl-sv-04', 'SV 701', 'SV', 'Boeing 777-300', 'KHI', 'Karachi', 'MXP', 'Milan', '01:30 KHI', '11:15 MXP', '11h 45m', 1, '2h 10m in Jeddah (JED)', 'Economy', 158900, 175000, 12, '40 KG (2x23KG) Check-in', '100% Halal Certified Saudi Dining'),
('fl-pk-05', 'PK 769', 'PK', 'Boeing 777-200LR', 'ISB', 'Islamabad', 'MXP', 'Milan', '10:00 ISB', '16:30 MXP', '8h 30m', 0, 'Non-stop Direct Flight', 'Economy', 192000, 210000, 5, '40 KG Check-in Allowance', 'Traditional Pakistani Cuisine & Chai'),
('fl-ek-06', 'EK 623', 'EK', 'Boeing 777-300ER', 'LHE', 'Lahore', 'DXB', 'Dubai', '03:30 LHE', '05:45 DXB', '3h 15m', 0, 'Non-stop Direct Flight', 'Economy', 78500, 89000, 15, '30 KG Check-in + 7 KG Cabin', 'Complimentary Hot Meal')
ON DUPLICATE KEY UPDATE `price_pkr`=VALUES(`price_pkr`);

-- 5. Insert Hotels in Milan
INSERT INTO `hotels` (`id`, `name`, `area`, `city`, `country`, `rating_score`, `reviews_count`, `price_pkr_per_night`, `original_price_pkr`, `image_url`, `amenities_json`, `star_classification`) VALUES
('h-mil-01', 'Glamore Milano Duomo', 'Piazza del Duomo', 'Milan', 'Italy', 4.9, 1420, 68000, 85000, '/src/assets/images/milan_duomo_hero_1790962682658.jpg', '["Free High-speed Wi-Fi", "Direct Duomo Cathedral View", "Breakfast Included", "24/7 Airport Chauffeur"]', 5),
('h-mil-02', 'Room Mate Giulia Design Hotel', 'Galleria Vittorio Emanuele II', 'Milan', 'Italy', 4.8, 980, 52000, 65000, '/src/assets/images/milan_galleria_interior_1790962700870.jpg', '["Designer Boutique Interior", "Free Wi-Fi", "Spa & Sauna", "Central Metro 50m"]', 4),
('h-mil-03', 'Hotel Sforzesco Heritage', 'Castello Sforzesco / Brera', 'Milan', 'Italy', 4.7, 760, 44000, 55000, '/src/assets/images/milan_sforza_castle_1790962716722.jpg', '["Castle Gardens View", "Breakfast Included", "Bar & Lounge", "Express Check-in"]', 4),
('h-mil-04', 'NYX Hotel Milan by Leonardo', 'Milano Centrale Train Station', 'Milan', 'Italy', 4.6, 1890, 38500, 48000, '/src/assets/images/karachi_coastal_skyline_1790962729502.jpg', '["Direct Airport Express Trains", "Rooftop Terrace Bar", "Modern Art Decor", "Fitness Center"]', 4)
ON DUPLICATE KEY UPDATE `price_pkr_per_night`=VALUES(`price_pkr_per_night`);

-- 6. Insert Coupons
INSERT INTO `coupons` (`id`, `code`, `category`, `discount_title`, `discount_desc`, `discount_percentage`, `max_discount_pkr`, `min_spend_pkr`, `expires_in_text`) VALUES
('c-01', 'FLIGH10HOTEL', 'Hotels & Homes', '10% OFF', 'Hotels & Homes worldwide. Valid for Milan, Rome, Dubai & Pakistan.', 10, 15000, 25000, 'Ends in 4 days'),
('c-02', 'TAKE5FLIGHT', 'Flights', '5% OFF', 'International & domestic flights. Max cap Rs 15,000.', 5, 15000, 50000, 'Ends in 2 days'),
('c-03', 'EXPLORE10', 'Attractions & Tours', '10% OFF', 'Milan Duomo, Rome Colosseum & worldwide city passes.', 10, 10000, 15000, 'Ends in 6 days')
ON DUPLICATE KEY UPDATE `discount_title`=VALUES(`discount_title`);

-- 7. Insert Initial Seed Users
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `passport_or_cnic`, `nationality`, `role`, `coins_balance`) VALUES
('usr-001', 'Muhammad Usman Khan', 'usman.travel@fligh.com', '+92 300 8241920', 'PK84920194', 'Pakistan', 'ADMIN', 1500),
('usr-002', 'Yusuf Ahmed', 'yus40840@gmail.com', '+92 321 9876543', 'PK74920188', 'Pakistan', 'USER', 750)
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- 8. Insert Seed Confirmed Booking
INSERT INTO `bookings` (`id`, `reference`, `e_ticket_number`, `booking_type`, `title`, `price_pkr`, `travel_date`, `passenger_name`, `passenger_email`, `passenger_phone`, `passport_or_cnic`, `flight_id`, `booking_status`, `payment_status`, `payment_method`, `qr_security_hash`) VALUES
('b-749210', 'FLI-749210', '214-8492019482', 'flight', 'Emirates: Karachi (KHI) → Milan (MXP)', 178500, '2026-10-04', 'Muhammad Usman Khan', 'usman.travel@fligh.com', '+92 300 8241920', 'PK84920194', 'fl-ek-01', 'CONFIRMED', 'PAID', 'Debit / Credit Card (VISA)', 'FLIGH-SEC-749210-984021')
ON DUPLICATE KEY UPDATE `reference`=VALUES(`reference`);

-- 9. Insert Seed E-Ticket
INSERT INTO `e_tickets` (`id`, `booking_id`, `pnr`, `e_ticket_number`, `passenger_name`, `seat_assignment`, `boarding_gate`, `terminal`, `boarding_time`, `barcode_data`, `qr_verification_url`) VALUES
('et-749210', 'b-749210', 'FLI-749210', '214-8492019482', 'Muhammad Usman Khan', '14A', 'G4', 'T1', '02:35 KHI', 'FLI-749210-214-8492019482-14A-EK607', 'https://fligh.com/verify?pnr=FLI-749210&t=214-8492019482')
ON DUPLICATE KEY UPDATE `pnr`=VALUES(`pnr`);

SET FOREIGN_KEY_CHECKS = 1;
