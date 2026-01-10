import { NextResponse } from "next/server";

export interface MilitaryBase {
  name: string;
  lat: number;
  lng: number;
  state?: string;
  country?: string;
  branch?: string;
}

// Comprehensive list of major US military installations worldwide
// This static data is more reliable than external APIs that may change
const US_MILITARY_BASES: MilitaryBase[] = [
  // === CONTINENTAL UNITED STATES ===
  // Army
  { name: "Fort Liberty (Bragg)", lat: 35.139, lng: -79.006, state: "NC", country: "USA", branch: "Army" },
  { name: "Fort Hood", lat: 31.138, lng: -97.775, state: "TX", country: "USA", branch: "Army" },
  { name: "Fort Campbell", lat: 36.663, lng: -87.474, state: "KY", country: "USA", branch: "Army" },
  { name: "Fort Benning", lat: 32.359, lng: -84.949, state: "GA", country: "USA", branch: "Army" },
  { name: "Fort Stewart", lat: 31.869, lng: -81.611, state: "GA", country: "USA", branch: "Army" },
  { name: "Fort Carson", lat: 38.737, lng: -104.787, state: "CO", country: "USA", branch: "Army" },
  { name: "Fort Riley", lat: 39.055, lng: -96.787, state: "KS", country: "USA", branch: "Army" },
  { name: "Fort Drum", lat: 44.055, lng: -75.758, state: "NY", country: "USA", branch: "Army" },
  { name: "Fort Bliss", lat: 31.815, lng: -106.422, state: "TX", country: "USA", branch: "Army" },
  { name: "Fort Sill", lat: 34.652, lng: -98.400, state: "OK", country: "USA", branch: "Army" },
  { name: "Fort Leonard Wood", lat: 37.716, lng: -92.130, state: "MO", country: "USA", branch: "Army" },
  { name: "Fort Polk", lat: 31.045, lng: -93.199, state: "LA", country: "USA", branch: "Army" },
  { name: "Fort Irwin", lat: 35.263, lng: -116.684, state: "CA", country: "USA", branch: "Army" },
  { name: "Fort Huachuca", lat: 31.554, lng: -110.345, state: "AZ", country: "USA", branch: "Army" },
  { name: "Fort Knox", lat: 37.891, lng: -85.963, state: "KY", country: "USA", branch: "Army" },
  { name: "Fort Leavenworth", lat: 39.351, lng: -94.922, state: "KS", country: "USA", branch: "Army" },
  { name: "Joint Base Lewis-McChord", lat: 47.108, lng: -122.555, state: "WA", country: "USA", branch: "Army/Air Force" },
  { name: "Redstone Arsenal", lat: 34.684, lng: -86.647, state: "AL", country: "USA", branch: "Army" },
  { name: "Aberdeen Proving Ground", lat: 39.466, lng: -76.130, state: "MD", country: "USA", branch: "Army" },
  { name: "Fort Detrick", lat: 39.436, lng: -77.427, state: "MD", country: "USA", branch: "Army" },
  { name: "Presidio of Monterey", lat: 36.601, lng: -121.902, state: "CA", country: "USA", branch: "Army" },
  { name: "Fort Meade", lat: 39.107, lng: -76.743, state: "MD", country: "USA", branch: "Army/NSA" },
  { name: "West Point", lat: 41.391, lng: -73.956, state: "NY", country: "USA", branch: "Army" },

  // Navy
  { name: "Naval Station Norfolk", lat: 36.946, lng: -76.303, state: "VA", country: "USA", branch: "Navy" },
  { name: "Naval Base San Diego", lat: 32.684, lng: -117.129, state: "CA", country: "USA", branch: "Navy" },
  { name: "Naval Station Mayport", lat: 30.393, lng: -81.406, state: "FL", country: "USA", branch: "Navy" },
  { name: "Naval Submarine Base Kings Bay", lat: 30.799, lng: -81.563, state: "GA", country: "USA", branch: "Navy" },
  { name: "Naval Submarine Base New London", lat: 41.389, lng: -72.091, state: "CT", country: "USA", branch: "Navy" },
  { name: "Naval Air Station Pensacola", lat: 30.352, lng: -87.319, state: "FL", country: "USA", branch: "Navy" },
  { name: "Naval Air Station Jacksonville", lat: 30.236, lng: -81.681, state: "FL", country: "USA", branch: "Navy" },
  { name: "Naval Air Station Oceana", lat: 36.821, lng: -76.033, state: "VA", country: "USA", branch: "Navy" },
  { name: "Naval Air Station Whidbey Island", lat: 48.352, lng: -122.656, state: "WA", country: "USA", branch: "Navy" },
  { name: "Naval Air Station Lemoore", lat: 36.333, lng: -119.952, state: "CA", country: "USA", branch: "Navy" },
  { name: "Naval Air Station Fallon", lat: 39.417, lng: -118.700, state: "NV", country: "USA", branch: "Navy" },
  { name: "Naval Base Kitsap", lat: 47.563, lng: -122.653, state: "WA", country: "USA", branch: "Navy" },
  { name: "Naval Station Great Lakes", lat: 42.299, lng: -87.851, state: "IL", country: "USA", branch: "Navy" },
  { name: "Naval Air Weapons Station China Lake", lat: 35.688, lng: -117.692, state: "CA", country: "USA", branch: "Navy" },
  { name: "Naval Station Newport", lat: 41.513, lng: -71.333, state: "RI", country: "USA", branch: "Navy" },
  { name: "Naval Support Activity Panama City", lat: 30.196, lng: -85.812, state: "FL", country: "USA", branch: "Navy" },
  { name: "Naval Surface Warfare Center Dahlgren", lat: 38.332, lng: -77.039, state: "VA", country: "USA", branch: "Navy" },

  // Air Force
  { name: "Nellis AFB", lat: 36.236, lng: -115.034, state: "NV", country: "USA", branch: "Air Force" },
  { name: "Edwards AFB", lat: 34.905, lng: -117.884, state: "CA", country: "USA", branch: "Air Force" },
  { name: "Eglin AFB", lat: 30.464, lng: -86.526, state: "FL", country: "USA", branch: "Air Force" },
  { name: "Wright-Patterson AFB", lat: 39.826, lng: -84.048, state: "OH", country: "USA", branch: "Air Force" },
  { name: "Travis AFB", lat: 38.263, lng: -121.927, state: "CA", country: "USA", branch: "Air Force" },
  { name: "Hill AFB", lat: 41.124, lng: -111.973, state: "UT", country: "USA", branch: "Air Force" },
  { name: "Tinker AFB", lat: 35.415, lng: -97.386, state: "OK", country: "USA", branch: "Air Force" },
  { name: "Robins AFB", lat: 32.640, lng: -83.592, state: "GA", country: "USA", branch: "Air Force" },
  { name: "Shaw AFB", lat: 33.974, lng: -80.476, state: "SC", country: "USA", branch: "Air Force" },
  { name: "Seymour Johnson AFB", lat: 35.339, lng: -77.961, state: "NC", country: "USA", branch: "Air Force" },
  { name: "Langley AFB", lat: 37.083, lng: -76.361, state: "VA", country: "USA", branch: "Air Force" },
  { name: "Offutt AFB", lat: 41.118, lng: -95.913, state: "NE", country: "USA", branch: "Air Force" },
  { name: "Barksdale AFB", lat: 32.501, lng: -93.663, state: "LA", country: "USA", branch: "Air Force" },
  { name: "Whiteman AFB", lat: 38.730, lng: -93.548, state: "MO", country: "USA", branch: "Air Force" },
  { name: "Minot AFB", lat: 48.416, lng: -101.358, state: "ND", country: "USA", branch: "Air Force" },
  { name: "F.E. Warren AFB", lat: 41.146, lng: -104.867, state: "WY", country: "USA", branch: "Air Force" },
  { name: "Malmstrom AFB", lat: 47.506, lng: -111.183, state: "MT", country: "USA", branch: "Air Force" },
  { name: "Dyess AFB", lat: 32.421, lng: -99.855, state: "TX", country: "USA", branch: "Air Force" },
  { name: "Ellsworth AFB", lat: 44.145, lng: -103.103, state: "SD", country: "USA", branch: "Air Force" },
  { name: "Luke AFB", lat: 33.535, lng: -112.383, state: "AZ", country: "USA", branch: "Air Force" },
  { name: "Davis-Monthan AFB", lat: 32.167, lng: -110.880, state: "AZ", country: "USA", branch: "Air Force" },
  { name: "Holloman AFB", lat: 32.852, lng: -106.107, state: "NM", country: "USA", branch: "Air Force" },
  { name: "Cannon AFB", lat: 34.383, lng: -103.322, state: "NM", country: "USA", branch: "Air Force" },
  { name: "Peterson SFB", lat: 38.824, lng: -104.700, state: "CO", country: "USA", branch: "Space Force" },
  { name: "Schriever SFB", lat: 38.806, lng: -104.527, state: "CO", country: "USA", branch: "Space Force" },
  { name: "Buckley SFB", lat: 39.703, lng: -104.752, state: "CO", country: "USA", branch: "Space Force" },
  { name: "Vandenberg SFB", lat: 34.733, lng: -120.568, state: "CA", country: "USA", branch: "Space Force" },
  { name: "Patrick SFB", lat: 28.235, lng: -80.610, state: "FL", country: "USA", branch: "Space Force" },
  { name: "Cheyenne Mountain SFS", lat: 38.744, lng: -104.846, state: "CO", country: "USA", branch: "Space Force" },
  { name: "Lackland AFB", lat: 29.384, lng: -98.615, state: "TX", country: "USA", branch: "Air Force" },
  { name: "Randolph AFB", lat: 29.530, lng: -98.279, state: "TX", country: "USA", branch: "Air Force" },
  { name: "Laughlin AFB", lat: 29.359, lng: -100.778, state: "TX", country: "USA", branch: "Air Force" },
  { name: "Sheppard AFB", lat: 33.987, lng: -98.491, state: "TX", country: "USA", branch: "Air Force" },
  { name: "Goodfellow AFB", lat: 31.432, lng: -100.407, state: "TX", country: "USA", branch: "Air Force" },
  { name: "Maxwell AFB", lat: 32.383, lng: -86.366, state: "AL", country: "USA", branch: "Air Force" },
  { name: "Columbus AFB", lat: 33.638, lng: -88.443, state: "MS", country: "USA", branch: "Air Force" },
  { name: "Vance AFB", lat: 36.339, lng: -97.913, state: "OK", country: "USA", branch: "Air Force" },
  { name: "McConnell AFB", lat: 37.622, lng: -97.268, state: "KS", country: "USA", branch: "Air Force" },
  { name: "McGuire AFB", lat: 40.016, lng: -74.593, state: "NJ", country: "USA", branch: "Air Force" },
  { name: "Dover AFB", lat: 39.130, lng: -75.466, state: "DE", country: "USA", branch: "Air Force" },
  { name: "Charleston AFB", lat: 32.899, lng: -80.041, state: "SC", country: "USA", branch: "Air Force" },
  { name: "Scott AFB", lat: 38.545, lng: -89.850, state: "IL", country: "USA", branch: "Air Force" },
  { name: "Fairchild AFB", lat: 47.616, lng: -117.656, state: "WA", country: "USA", branch: "Air Force" },
  { name: "Mountain Home AFB", lat: 43.043, lng: -115.872, state: "ID", country: "USA", branch: "Air Force" },
  { name: "Beale AFB", lat: 39.136, lng: -121.437, state: "CA", country: "USA", branch: "Air Force" },
  { name: "Grand Forks AFB", lat: 47.954, lng: -97.401, state: "ND", country: "USA", branch: "Air Force" },
  { name: "US Air Force Academy", lat: 38.998, lng: -104.861, state: "CO", country: "USA", branch: "Air Force" },

  // Marines
  { name: "Camp Pendleton", lat: 33.387, lng: -117.565, state: "CA", country: "USA", branch: "Marines" },
  { name: "Camp Lejeune", lat: 34.673, lng: -77.355, state: "NC", country: "USA", branch: "Marines" },
  { name: "MCAS Miramar", lat: 32.868, lng: -117.143, state: "CA", country: "USA", branch: "Marines" },
  { name: "MCAS Cherry Point", lat: 34.901, lng: -76.881, state: "NC", country: "USA", branch: "Marines" },
  { name: "MCAS New River", lat: 34.708, lng: -77.440, state: "NC", country: "USA", branch: "Marines" },
  { name: "MCAS Beaufort", lat: 32.477, lng: -80.719, state: "SC", country: "USA", branch: "Marines" },
  { name: "MCAS Yuma", lat: 32.656, lng: -114.606, state: "AZ", country: "USA", branch: "Marines" },
  { name: "MCB Quantico", lat: 38.522, lng: -77.319, state: "VA", country: "USA", branch: "Marines" },
  { name: "MCRD San Diego", lat: 32.741, lng: -117.196, state: "CA", country: "USA", branch: "Marines" },
  { name: "MCRD Parris Island", lat: 32.341, lng: -80.683, state: "SC", country: "USA", branch: "Marines" },
  { name: "MCAGCC Twentynine Palms", lat: 34.237, lng: -116.063, state: "CA", country: "USA", branch: "Marines" },

  // Coast Guard
  { name: "Coast Guard Base Alameda", lat: 37.773, lng: -122.298, state: "CA", country: "USA", branch: "Coast Guard" },
  { name: "Coast Guard Base Boston", lat: 42.354, lng: -71.047, state: "MA", country: "USA", branch: "Coast Guard" },
  { name: "Coast Guard Base Miami", lat: 25.770, lng: -80.163, state: "FL", country: "USA", branch: "Coast Guard" },
  { name: "Coast Guard Training Center Cape May", lat: 38.936, lng: -74.894, state: "NJ", country: "USA", branch: "Coast Guard" },
  { name: "Coast Guard Academy", lat: 41.370, lng: -72.098, state: "CT", country: "USA", branch: "Coast Guard" },

  // === ALASKA & HAWAII ===
  { name: "Joint Base Elmendorf-Richardson", lat: 61.251, lng: -149.807, state: "AK", country: "USA", branch: "Air Force/Army" },
  { name: "Eielson AFB", lat: 64.666, lng: -147.102, state: "AK", country: "USA", branch: "Air Force" },
  { name: "Fort Wainwright", lat: 64.828, lng: -147.640, state: "AK", country: "USA", branch: "Army" },
  { name: "Clear SFS", lat: 64.290, lng: -149.187, state: "AK", country: "USA", branch: "Space Force" },
  { name: "Joint Base Pearl Harbor-Hickam", lat: 21.348, lng: -157.940, state: "HI", country: "USA", branch: "Navy/Air Force" },
  { name: "Schofield Barracks", lat: 21.494, lng: -158.064, state: "HI", country: "USA", branch: "Army" },
  { name: "MCB Hawaii Kaneohe Bay", lat: 21.450, lng: -157.768, state: "HI", country: "USA", branch: "Marines" },
  { name: "Fort Shafter", lat: 21.347, lng: -157.895, state: "HI", country: "USA", branch: "Army" },
  { name: "Tripler Army Medical Center", lat: 21.363, lng: -157.886, state: "HI", country: "USA", branch: "Army" },
  { name: "Pacific Missile Range Facility", lat: 22.021, lng: -159.785, state: "HI", country: "USA", branch: "Navy" },

  // === OVERSEAS - EUROPE ===
  { name: "Ramstein Air Base", lat: 49.437, lng: 7.600, country: "Germany", branch: "Air Force" },
  { name: "Spangdahlem Air Base", lat: 49.972, lng: 6.693, country: "Germany", branch: "Air Force" },
  { name: "US Army Garrison Bavaria (Grafenwöhr)", lat: 49.698, lng: 11.924, country: "Germany", branch: "Army" },
  { name: "Vilseck (Rose Barracks)", lat: 49.626, lng: 11.810, country: "Germany", branch: "Army" },
  { name: "US Army Garrison Stuttgart", lat: 48.728, lng: 9.073, country: "Germany", branch: "Army" },
  { name: "US Army Garrison Wiesbaden", lat: 50.050, lng: 8.325, country: "Germany", branch: "Army" },
  { name: "US Army Garrison Ansbach", lat: 49.310, lng: 10.590, country: "Germany", branch: "Army" },
  { name: "Landstuhl Regional Medical Center", lat: 49.410, lng: 7.552, country: "Germany", branch: "Army" },
  { name: "RAF Lakenheath", lat: 52.409, lng: 0.561, country: "UK", branch: "Air Force" },
  { name: "RAF Mildenhall", lat: 52.362, lng: 0.486, country: "UK", branch: "Air Force" },
  { name: "RAF Croughton", lat: 51.990, lng: -1.203, country: "UK", branch: "Air Force" },
  { name: "RAF Fairford", lat: 51.682, lng: -1.790, country: "UK", branch: "Air Force" },
  { name: "Naval Station Rota", lat: 36.640, lng: -6.349, country: "Spain", branch: "Navy" },
  { name: "Morón Air Base", lat: 37.175, lng: -5.616, country: "Spain", branch: "Air Force" },
  { name: "Naval Air Station Sigonella", lat: 37.402, lng: 14.922, country: "Italy", branch: "Navy" },
  { name: "Aviano Air Base", lat: 46.032, lng: 12.596, country: "Italy", branch: "Air Force" },
  { name: "US Army Garrison Italy (Vicenza)", lat: 45.538, lng: 11.549, country: "Italy", branch: "Army" },
  { name: "Camp Darby", lat: 43.652, lng: 10.327, country: "Italy", branch: "Army" },
  { name: "Naval Support Activity Naples", lat: 40.817, lng: 14.195, country: "Italy", branch: "Navy" },
  { name: "Naval Support Activity Souda Bay", lat: 35.486, lng: 24.115, country: "Greece", branch: "Navy" },
  { name: "Lajes Field", lat: 38.762, lng: -27.091, country: "Portugal", branch: "Air Force" },
  { name: "Incirlik Air Base", lat: 37.002, lng: 35.426, country: "Turkey", branch: "Air Force" },
  { name: "Izmir Air Station", lat: 38.425, lng: 27.152, country: "Turkey", branch: "Air Force" },
  { name: "Camp Bondsteel", lat: 42.360, lng: 21.247, country: "Kosovo", branch: "Army" },
  { name: "Mihail Kogălniceanu Air Base", lat: 44.366, lng: 28.488, country: "Romania", branch: "Air Force" },
  { name: "Deveselu (Aegis Ashore)", lat: 43.789, lng: 24.500, country: "Romania", branch: "Navy" },
  { name: "Camp Lemonnier", lat: 11.547, lng: 43.145, country: "Djibouti", branch: "Navy" },
  { name: "Naval Air Station Keflavik", lat: 63.983, lng: -22.596, country: "Iceland", branch: "Navy" },

  // === OVERSEAS - PACIFIC & ASIA ===
  { name: "Kadena Air Base", lat: 26.352, lng: 127.769, country: "Japan", branch: "Air Force" },
  { name: "Yokota Air Base", lat: 35.749, lng: 139.349, country: "Japan", branch: "Air Force" },
  { name: "Misawa Air Base", lat: 40.703, lng: 141.368, country: "Japan", branch: "Air Force" },
  { name: "US Fleet Activities Yokosuka", lat: 35.286, lng: 139.661, country: "Japan", branch: "Navy" },
  { name: "US Fleet Activities Sasebo", lat: 33.160, lng: 129.720, country: "Japan", branch: "Navy" },
  { name: "Naval Air Facility Atsugi", lat: 35.455, lng: 139.450, country: "Japan", branch: "Navy" },
  { name: "MCB Camp Butler (Okinawa)", lat: 26.310, lng: 127.758, country: "Japan", branch: "Marines" },
  { name: "Camp Hansen", lat: 26.428, lng: 127.893, country: "Japan", branch: "Marines" },
  { name: "Camp Schwab", lat: 26.533, lng: 128.033, country: "Japan", branch: "Marines" },
  { name: "Camp Foster", lat: 26.284, lng: 127.765, country: "Japan", branch: "Marines" },
  { name: "MCAS Iwakuni", lat: 34.144, lng: 132.236, country: "Japan", branch: "Marines" },
  { name: "MCAS Futenma", lat: 26.274, lng: 127.755, country: "Japan", branch: "Marines" },
  { name: "Camp Zama", lat: 35.497, lng: 139.384, country: "Japan", branch: "Army" },
  { name: "Osan Air Base", lat: 37.091, lng: 127.030, country: "South Korea", branch: "Air Force" },
  { name: "Kunsan Air Base", lat: 35.922, lng: 126.616, country: "South Korea", branch: "Air Force" },
  { name: "US Army Garrison Humphreys", lat: 36.960, lng: 127.032, country: "South Korea", branch: "Army" },
  { name: "US Army Garrison Yongsan", lat: 37.537, lng: 126.975, country: "South Korea", branch: "Army" },
  { name: "US Naval Forces Korea (Busan)", lat: 35.101, lng: 129.032, country: "South Korea", branch: "Navy" },
  { name: "Andersen AFB", lat: 13.584, lng: 144.930, country: "Guam", branch: "Air Force" },
  { name: "Naval Base Guam", lat: 13.445, lng: 144.649, country: "Guam", branch: "Navy" },
  { name: "Joint Region Marianas", lat: 13.457, lng: 144.784, country: "Guam", branch: "Navy" },
  { name: "Diego Garcia", lat: -7.316, lng: 72.411, country: "British Indian Ocean Territory", branch: "Navy" },
  { name: "RAAF Base Darwin (US Rotational)", lat: -12.415, lng: 130.877, country: "Australia", branch: "Marines" },
  { name: "Pine Gap", lat: -23.799, lng: 133.737, country: "Australia", branch: "Intelligence" },
  { name: "Sembawang Naval Base", lat: 1.455, lng: 103.820, country: "Singapore", branch: "Navy" },
  { name: "Changi Naval Base", lat: 1.349, lng: 103.982, country: "Singapore", branch: "Navy" },
  { name: "Clark Air Base (EDCA)", lat: 15.186, lng: 120.560, country: "Philippines", branch: "Air Force" },
  { name: "Subic Bay (EDCA)", lat: 14.798, lng: 120.262, country: "Philippines", branch: "Navy" },

  // === OVERSEAS - MIDDLE EAST ===
  { name: "Al Udeid Air Base", lat: 25.117, lng: 51.315, country: "Qatar", branch: "Air Force" },
  { name: "Al Dhafra Air Base", lat: 24.248, lng: 54.548, country: "UAE", branch: "Air Force" },
  { name: "Naval Support Activity Bahrain", lat: 26.196, lng: 50.595, country: "Bahrain", branch: "Navy" },
  { name: "Camp Arifjan", lat: 28.941, lng: 48.109, country: "Kuwait", branch: "Army" },
  { name: "Ali Al Salem Air Base", lat: 29.346, lng: 47.521, country: "Kuwait", branch: "Air Force" },
  { name: "Ahmed Al Jaber Air Base", lat: 28.934, lng: 47.792, country: "Kuwait", branch: "Air Force" },
  { name: "Camp Buehring", lat: 29.485, lng: 47.068, country: "Kuwait", branch: "Army" },
  { name: "Prince Sultan Air Base", lat: 24.062, lng: 47.580, country: "Saudi Arabia", branch: "Air Force" },
  { name: "Thumrait Air Base", lat: 17.663, lng: 53.933, country: "Oman", branch: "Air Force" },
  { name: "Masirah Air Base", lat: 20.675, lng: 58.890, country: "Oman", branch: "Air Force" },
  { name: "Muscat Air Base", lat: 23.593, lng: 58.284, country: "Oman", branch: "Air Force" },
  { name: "Al Ain Air Base", lat: 24.262, lng: 55.609, country: "UAE", branch: "Air Force" },
  { name: "Muwaffaq Salti Air Base", lat: 31.826, lng: 36.782, country: "Jordan", branch: "Air Force" },
  { name: "Eskan Village", lat: 24.699, lng: 46.713, country: "Saudi Arabia", branch: "Air Force" },

  // === CARIBBEAN & CENTRAL AMERICA ===
  { name: "Naval Station Guantanamo Bay", lat: 19.906, lng: -75.097, country: "Cuba", branch: "Navy" },
  { name: "Soto Cano Air Base", lat: 14.382, lng: -87.621, country: "Honduras", branch: "Air Force" },
  { name: "Roosevelt Roads (Inactive)", lat: 18.257, lng: -65.642, country: "Puerto Rico", branch: "Navy" },
  { name: "Fort Buchanan", lat: 18.417, lng: -66.113, country: "Puerto Rico", branch: "Army" },
];

export async function GET() {
  try {
    console.log(`[Military Bases API] Returning ${US_MILITARY_BASES.length} installations`);

    return NextResponse.json({
      bases: US_MILITARY_BASES,
      cached: false,
      count: US_MILITARY_BASES.length,
      source: "static",
    });
  } catch (error) {
    console.error("[Military Bases API] Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch military bases", bases: [] },
      { status: 200 }
    );
  }
}
