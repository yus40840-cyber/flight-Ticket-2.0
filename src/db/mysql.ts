// ============================================================================
// HOSTINGER MYSQL DATABASE CONNECTOR (FOR NODE.JS / EXPRESS / BACKEND)
// ============================================================================

export interface HostingerDbConfig {
  host: string;
  user: string;
  password?: string;
  database: string;
  port: number;
}

export const getHostingerDbConfig = (): HostingerDbConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fligh_com_db',
    port: Number(process.env.DB_PORT) || 3306,
  };
};

export const SAMPLE_SQL_QUERIES = {
  SEARCH_FLIGHTS: `
    SELECT f.*, a.name AS airline_name, a.logo_color,
           orig.name AS origin_airport_name, dest.name AS dest_airport_name
    FROM flights f
    JOIN airlines a ON f.airline_code = a.iata_code
    JOIN airports orig ON f.origin_code = orig.iata_code
    JOIN airports dest ON f.dest_code = dest.iata_code
    WHERE f.origin_code = ? AND f.dest_code = ? AND f.is_active = 1
    ORDER BY f.price_pkr ASC;
  `,
  GET_BOOKING_BY_PNR: `
    SELECT b.*, t.seat_assignment, t.boarding_gate, t.terminal, t.barcode_data
    FROM bookings b
    LEFT JOIN e_tickets t ON b.id = t.booking_id
    WHERE b.reference = ?;
  `,
  LIST_WORLDWIDE_AIRPORTS: `
    SELECT * FROM airports ORDER BY country_name ASC, city ASC;
  `,
  LIST_WORLDWIDE_AIRLINES: `
    SELECT * FROM airlines ORDER BY skytrax_stars DESC, name ASC;
  `,
};
