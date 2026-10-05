/**
 * Cities tutors' students commonly live in, with their IANA timezone.
 * The tutor picks a city (design: "City (sets timezone)"); we store city + timezone.
 * Add more as needed — keep to real IANA zone names.
 */

import { normalizeZone } from './time';

export type Country = { code: string; name: string; dial: string };
export type City = { city: string; country: string; tz: string };

const C = (code: string, name: string, dial: string): Country => ({ code, name, dial });

export const countries: Country[] = [
  C('IN', 'India', '+91'),
  C('US', 'United States', '+1'),
  C('GB', 'United Kingdom', '+44'),
  C('CA', 'Canada', '+1'),
  C('AU', 'Australia', '+61'),
  C('NZ', 'New Zealand', '+64'),
  C('AE', 'United Arab Emirates', '+971'),
  C('SA', 'Saudi Arabia', '+966'),
  C('QA', 'Qatar', '+974'),
  C('KW', 'Kuwait', '+965'),
  C('OM', 'Oman', '+968'),
  C('BH', 'Bahrain', '+973'),
  C('SG', 'Singapore', '+65'),
  C('MY', 'Malaysia', '+60'),
  C('HK', 'Hong Kong', '+852'),
  C('JP', 'Japan', '+81'),
  C('KR', 'South Korea', '+82'),
  C('CN', 'China', '+86'),
  C('ID', 'Indonesia', '+62'),
  C('TH', 'Thailand', '+66'),
  C('PH', 'Philippines', '+63'),
  C('LK', 'Sri Lanka', '+94'),
  C('NP', 'Nepal', '+977'),
  C('BD', 'Bangladesh', '+880'),
  C('PK', 'Pakistan', '+92'),
  C('IE', 'Ireland', '+353'),
  C('DE', 'Germany', '+49'),
  C('FR', 'France', '+33'),
  C('NL', 'Netherlands', '+31'),
  C('BE', 'Belgium', '+32'),
  C('CH', 'Switzerland', '+41'),
  C('IT', 'Italy', '+39'),
  C('ES', 'Spain', '+34'),
  C('PT', 'Portugal', '+351'),
  C('SE', 'Sweden', '+46'),
  C('NO', 'Norway', '+47'),
  C('DK', 'Denmark', '+45'),
  C('FI', 'Finland', '+358'),
  C('PL', 'Poland', '+48'),
  C('AT', 'Austria', '+43'),
  C('ZA', 'South Africa', '+27'),
  C('KE', 'Kenya', '+254'),
  C('NG', 'Nigeria', '+234'),
  C('MU', 'Mauritius', '+230'),
  C('BR', 'Brazil', '+55'),
  C('MX', 'Mexico', '+52'),
];

/** [tz, country, ...cities] */
const groups: [string, string, ...string[]][] = [
  [
    'Asia/Kolkata',
    'India',
    'Kolkata',
    'Mumbai',
    'Delhi',
    'Bengaluru',
    'Chennai',
    'Hyderabad',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Agra',
    'Kochi',
    'Coimbatore',
    'Chandigarh',
    'Indore',
    'Bhopal',
  ],
  [
    'America/New_York',
    'United States',
    'New York',
    'New Jersey',
    'Boston',
    'Washington, D.C.',
    'Philadelphia',
    'Atlanta',
    'Miami',
    'Charlotte',
  ],
  ['America/Detroit', 'United States', 'Detroit'],
  ['America/Chicago', 'United States', 'Chicago', 'Dallas', 'Houston', 'Austin', 'Minneapolis'],
  ['America/Denver', 'United States', 'Denver', 'Salt Lake City'],
  ['America/Phoenix', 'United States', 'Phoenix'],
  [
    'America/Los_Angeles',
    'United States',
    'Los Angeles',
    'San Francisco',
    'San Jose',
    'San Diego',
    'Seattle',
    'Portland',
  ],
  ['America/Anchorage', 'United States', 'Anchorage'],
  ['Pacific/Honolulu', 'United States', 'Honolulu'],
  ['America/Toronto', 'Canada', 'Toronto', 'Ottawa', 'Montreal'],
  ['America/Winnipeg', 'Canada', 'Winnipeg'],
  ['America/Edmonton', 'Canada', 'Calgary', 'Edmonton'],
  ['America/Vancouver', 'Canada', 'Vancouver'],
  ['America/Halifax', 'Canada', 'Halifax'],
  [
    'Europe/London',
    'United Kingdom',
    'London',
    'Manchester',
    'Birmingham',
    'Leicester',
    'Leeds',
    'Glasgow',
    'Edinburgh',
  ],
  ['Europe/Dublin', 'Ireland', 'Dublin'],
  ['Australia/Sydney', 'Australia', 'Sydney', 'Canberra'],
  ['Australia/Melbourne', 'Australia', 'Melbourne'],
  ['Australia/Brisbane', 'Australia', 'Brisbane'],
  ['Australia/Perth', 'Australia', 'Perth'],
  ['Australia/Adelaide', 'Australia', 'Adelaide'],
  ['Pacific/Auckland', 'New Zealand', 'Auckland', 'Wellington'],
  ['Asia/Dubai', 'United Arab Emirates', 'Dubai', 'Abu Dhabi', 'Sharjah'],
  ['Asia/Riyadh', 'Saudi Arabia', 'Riyadh', 'Jeddah'],
  ['Asia/Qatar', 'Qatar', 'Doha'],
  ['Asia/Kuwait', 'Kuwait', 'Kuwait City'],
  ['Asia/Muscat', 'Oman', 'Muscat'],
  ['Asia/Bahrain', 'Bahrain', 'Manama'],
  ['Asia/Singapore', 'Singapore', 'Singapore'],
  ['Asia/Kuala_Lumpur', 'Malaysia', 'Kuala Lumpur'],
  ['Asia/Hong_Kong', 'Hong Kong', 'Hong Kong'],
  ['Asia/Tokyo', 'Japan', 'Tokyo'],
  ['Asia/Seoul', 'South Korea', 'Seoul'],
  ['Asia/Shanghai', 'China', 'Shanghai', 'Beijing'],
  ['Asia/Jakarta', 'Indonesia', 'Jakarta'],
  ['Asia/Bangkok', 'Thailand', 'Bangkok'],
  ['Asia/Manila', 'Philippines', 'Manila'],
  ['Asia/Colombo', 'Sri Lanka', 'Colombo'],
  ['Asia/Kathmandu', 'Nepal', 'Kathmandu'],
  ['Asia/Dhaka', 'Bangladesh', 'Dhaka'],
  ['Asia/Karachi', 'Pakistan', 'Karachi'],
  ['Europe/Berlin', 'Germany', 'Berlin', 'Munich', 'Frankfurt'],
  ['Europe/Paris', 'France', 'Paris'],
  ['Europe/Amsterdam', 'Netherlands', 'Amsterdam'],
  ['Europe/Brussels', 'Belgium', 'Brussels'],
  ['Europe/Zurich', 'Switzerland', 'Zurich'],
  ['Europe/Rome', 'Italy', 'Milan', 'Rome'],
  ['Europe/Madrid', 'Spain', 'Madrid', 'Barcelona'],
  ['Europe/Lisbon', 'Portugal', 'Lisbon'],
  ['Europe/Stockholm', 'Sweden', 'Stockholm'],
  ['Europe/Oslo', 'Norway', 'Oslo'],
  ['Europe/Copenhagen', 'Denmark', 'Copenhagen'],
  ['Europe/Helsinki', 'Finland', 'Helsinki'],
  ['Europe/Warsaw', 'Poland', 'Warsaw'],
  ['Europe/Vienna', 'Austria', 'Vienna'],
  ['Africa/Johannesburg', 'South Africa', 'Johannesburg', 'Cape Town'],
  ['Africa/Nairobi', 'Kenya', 'Nairobi'],
  ['Africa/Lagos', 'Nigeria', 'Lagos'],
  ['Indian/Mauritius', 'Mauritius', 'Port Louis'],
  ['America/Sao_Paulo', 'Brazil', 'São Paulo'],
  ['America/Mexico_City', 'Mexico', 'Mexico City'],
];

export const cities: City[] = groups.flatMap(([tz, country, ...names]) =>
  names.map((city) => ({ city, country, tz })),
);

export const countryByName = (name: string | null | undefined) =>
  countries.find((c) => c.name === name);

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return cities;
  return cities.filter(
    (c) => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
  );
}

/** City for a zone, falling back to the zone's own name ('America/Indiana/Indianapolis' → 'Indianapolis'). */
export function cityFromZone(zone: string): City {
  const tz = normalizeZone(zone);
  const known = cities.find((c) => c.tz === tz);
  if (known) return known;
  return { city: tz.split('/').pop()!.replace(/_/g, ' '), country: '', tz };
}
