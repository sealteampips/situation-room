import { NextResponse } from "next/server";

export interface ForeignMilitaryBase {
  name: string;
  lat: number;
  lng: number;
  country: "Russia" | "China" | "UK" | "France" | "India";
  hostNation: string;
  type: "Naval" | "Air" | "Army" | "Joint" | "Logistics" | "Intelligence";
}

// Comprehensive list of foreign military bases worldwide
// Data compiled from public sources - OSINT
const FOREIGN_MILITARY_BASES: ForeignMilitaryBase[] = [
  // === RUSSIA ===
  // Syria
  { name: "Khmeimim Air Base", lat: 35.411, lng: 35.948, country: "Russia", hostNation: "Syria", type: "Air" },
  { name: "Tartus Naval Facility", lat: 34.896, lng: 35.868, country: "Russia", hostNation: "Syria", type: "Naval" },
  // Armenia
  { name: "102nd Military Base (Gyumri)", lat: 40.789, lng: 43.847, country: "Russia", hostNation: "Armenia", type: "Army" },
  { name: "Erebuni Air Base", lat: 40.083, lng: 44.467, country: "Russia", hostNation: "Armenia", type: "Air" },
  // Belarus
  { name: "Joint Training Center Baranovichi", lat: 53.110, lng: 25.983, country: "Russia", hostNation: "Belarus", type: "Air" },
  { name: "Vileyka VLF Station", lat: 54.463, lng: 26.802, country: "Russia", hostNation: "Belarus", type: "Intelligence" },
  // Kazakhstan
  { name: "Baikonur Cosmodrome", lat: 45.965, lng: 63.305, country: "Russia", hostNation: "Kazakhstan", type: "Joint" },
  { name: "Sary-Shagan Test Range", lat: 46.010, lng: 73.630, country: "Russia", hostNation: "Kazakhstan", type: "Joint" },
  // Kyrgyzstan
  { name: "Kant Air Base", lat: 42.853, lng: 74.846, country: "Russia", hostNation: "Kyrgyzstan", type: "Air" },
  // Tajikistan
  { name: "201st Military Base (Dushanbe)", lat: 38.560, lng: 68.774, country: "Russia", hostNation: "Tajikistan", type: "Army" },
  { name: "Ayni Air Base", lat: 38.953, lng: 68.583, country: "Russia", hostNation: "Tajikistan", type: "Air" },
  // Vietnam (access agreement)
  { name: "Cam Ranh Bay (Access)", lat: 11.998, lng: 109.219, country: "Russia", hostNation: "Vietnam", type: "Naval" },
  // Abkhazia (disputed)
  { name: "Gudauta Base", lat: 43.105, lng: 40.620, country: "Russia", hostNation: "Abkhazia", type: "Army" },
  { name: "Bombora Air Base", lat: 43.077, lng: 40.568, country: "Russia", hostNation: "Abkhazia", type: "Air" },
  // South Ossetia (disputed)
  { name: "Tskhinvali Base", lat: 42.225, lng: 43.970, country: "Russia", hostNation: "South Ossetia", type: "Army" },
  // Transnistria
  { name: "Tiraspol OGRF", lat: 46.842, lng: 29.600, country: "Russia", hostNation: "Transnistria", type: "Army" },
  // Sudan (planned/agreement)
  { name: "Port Sudan Naval Facility", lat: 19.617, lng: 37.217, country: "Russia", hostNation: "Sudan", type: "Naval" },
  // Libya (Wagner/PMC presence)
  { name: "Al-Jufra Air Base", lat: 29.195, lng: 16.000, country: "Russia", hostNation: "Libya", type: "Air" },
  // Central African Republic
  { name: "Bangui Military Presence", lat: 4.361, lng: 18.558, country: "Russia", hostNation: "Central African Republic", type: "Army" },
  // Mali
  { name: "Bamako Military Presence", lat: 12.639, lng: -8.003, country: "Russia", hostNation: "Mali", type: "Army" },
  // Burkina Faso
  { name: "Ouagadougou Military Presence", lat: 12.354, lng: -1.535, country: "Russia", hostNation: "Burkina Faso", type: "Army" },
  // Niger
  { name: "Niamey Military Presence", lat: 13.512, lng: 2.112, country: "Russia", hostNation: "Niger", type: "Army" },

  // === CHINA ===
  // Djibouti
  { name: "PLA Support Base Djibouti", lat: 11.532, lng: 42.933, country: "China", hostNation: "Djibouti", type: "Naval" },
  // Cambodia
  { name: "Ream Naval Base", lat: 10.505, lng: 103.640, country: "China", hostNation: "Cambodia", type: "Naval" },
  // Myanmar
  { name: "Coco Islands Facility", lat: 14.100, lng: 93.365, country: "China", hostNation: "Myanmar", type: "Intelligence" },
  { name: "Kyaukpyu Port", lat: 19.426, lng: 93.548, country: "China", hostNation: "Myanmar", type: "Naval" },
  // Pakistan
  { name: "Gwadar Port", lat: 25.126, lng: 62.325, country: "China", hostNation: "Pakistan", type: "Naval" },
  // Sri Lanka
  { name: "Hambantota Port", lat: 6.119, lng: 81.102, country: "China", hostNation: "Sri Lanka", type: "Naval" },
  // Tajikistan
  { name: "Gorno-Badakhshan Outpost", lat: 38.563, lng: 71.505, country: "China", hostNation: "Tajikistan", type: "Army" },
  // Solomon Islands (agreement)
  { name: "Honiara (Security Agreement)", lat: -9.428, lng: 159.950, country: "China", hostNation: "Solomon Islands", type: "Logistics" },
  // Equatorial Guinea (reported)
  { name: "Bata Port (Reported)", lat: 1.866, lng: 9.766, country: "China", hostNation: "Equatorial Guinea", type: "Naval" },
  // UAE (dual-use port)
  { name: "Khalifa Port Facility", lat: 24.810, lng: 54.644, country: "China", hostNation: "UAE", type: "Logistics" },
  // Argentina (satellite station)
  { name: "Neuquén Space Station", lat: -38.980, lng: -69.361, country: "China", hostNation: "Argentina", type: "Intelligence" },

  // === UNITED KINGDOM ===
  // Cyprus
  { name: "RAF Akrotiri", lat: 34.590, lng: 32.988, country: "UK", hostNation: "Cyprus (SBA)", type: "Air" },
  { name: "Dhekelia Garrison", lat: 34.986, lng: 33.742, country: "UK", hostNation: "Cyprus (SBA)", type: "Army" },
  { name: "Ayios Nikolaos Station", lat: 35.100, lng: 33.897, country: "UK", hostNation: "Cyprus (SBA)", type: "Intelligence" },
  // Gibraltar
  { name: "RAF Gibraltar", lat: 36.152, lng: -5.347, country: "UK", hostNation: "Gibraltar", type: "Air" },
  { name: "HMS Rooke", lat: 36.142, lng: -5.365, country: "UK", hostNation: "Gibraltar", type: "Naval" },
  // Falkland Islands
  { name: "RAF Mount Pleasant", lat: -51.822, lng: -58.447, country: "UK", hostNation: "Falkland Islands", type: "Air" },
  { name: "Mare Harbour", lat: -51.919, lng: -59.033, country: "UK", hostNation: "Falkland Islands", type: "Naval" },
  // British Indian Ocean Territory
  { name: "Diego Garcia (UK Sovereignty)", lat: -7.316, lng: 72.411, country: "UK", hostNation: "BIOT", type: "Joint" },
  // Brunei
  { name: "Seria Garrison", lat: 4.608, lng: 114.323, country: "UK", hostNation: "Brunei", type: "Army" },
  // Kenya
  { name: "BATUK Nanyuki", lat: 0.018, lng: 37.073, country: "UK", hostNation: "Kenya", type: "Army" },
  // Oman
  { name: "JMOTS Duqm", lat: 19.501, lng: 57.697, country: "UK", hostNation: "Oman", type: "Joint" },
  { name: "RAF Seeb", lat: 23.593, lng: 58.284, country: "UK", hostNation: "Oman", type: "Air" },
  // Bahrain
  { name: "HMS Juffair", lat: 26.237, lng: 50.609, country: "UK", hostNation: "Bahrain", type: "Naval" },
  // Singapore
  { name: "Sembawang Wharf", lat: 1.455, lng: 103.820, country: "UK", hostNation: "Singapore", type: "Naval" },
  // Ascension Island
  { name: "RAF Ascension Island", lat: -7.969, lng: -14.394, country: "UK", hostNation: "Ascension Island", type: "Air" },
  // South Georgia
  { name: "King Edward Point", lat: -54.283, lng: -36.500, country: "UK", hostNation: "South Georgia", type: "Naval" },
  // Belize
  { name: "BATSUB Price Barracks", lat: 17.250, lng: -88.767, country: "UK", hostNation: "Belize", type: "Army" },
  // Nepal
  { name: "British Gurkha Nepal", lat: 27.677, lng: 85.316, country: "UK", hostNation: "Nepal", type: "Army" },

  // === FRANCE ===
  // Djibouti
  { name: "FFDj (French Forces Djibouti)", lat: 11.550, lng: 42.930, country: "France", hostNation: "Djibouti", type: "Joint" },
  // UAE
  { name: "Al Dhafra (French Det.)", lat: 24.248, lng: 54.548, country: "France", hostNation: "UAE", type: "Air" },
  { name: "Naval Air Station Abu Dhabi", lat: 24.420, lng: 54.459, country: "France", hostNation: "UAE", type: "Naval" },
  // Senegal
  { name: "Dakar Naval Base", lat: 14.678, lng: -17.442, country: "France", hostNation: "Senegal", type: "Naval" },
  // Gabon
  { name: "Port-Gentil Naval Detachment", lat: -0.719, lng: 8.781, country: "France", hostNation: "Gabon", type: "Naval" },
  { name: "Libreville Base", lat: 0.392, lng: 9.454, country: "France", hostNation: "Gabon", type: "Army" },
  // Ivory Coast
  { name: "FFCI Abidjan", lat: 5.316, lng: -4.012, country: "France", hostNation: "Ivory Coast", type: "Joint" },
  // Chad
  { name: "N'Djamena Base", lat: 12.134, lng: 15.044, country: "France", hostNation: "Chad", type: "Air" },
  // New Caledonia
  { name: "FANC Nouméa", lat: -22.276, lng: 166.458, country: "France", hostNation: "New Caledonia", type: "Joint" },
  // French Polynesia
  { name: "FAPF Papeete", lat: -17.536, lng: -149.569, country: "France", hostNation: "French Polynesia", type: "Naval" },
  // Reunion
  { name: "FAZSOI Le Port", lat: -20.932, lng: 55.290, country: "France", hostNation: "Reunion", type: "Joint" },
  // Mayotte
  { name: "DLEM Mayotte", lat: -12.778, lng: 45.228, country: "France", hostNation: "Mayotte", type: "Army" },
  // French Guiana
  { name: "3rd REI Kourou", lat: 5.160, lng: -52.650, country: "France", hostNation: "French Guiana", type: "Army" },
  { name: "CSG Kourou (Space)", lat: 5.236, lng: -52.768, country: "France", hostNation: "French Guiana", type: "Joint" },
  // Martinique
  { name: "Fort Saint-Louis", lat: 14.600, lng: -61.067, country: "France", hostNation: "Martinique", type: "Naval" },
  // Guadeloupe
  { name: "Pointe-à-Pitre Naval", lat: 16.224, lng: -61.533, country: "France", hostNation: "Guadeloupe", type: "Naval" },
  // Jordan
  { name: "H5 Air Detachment", lat: 32.164, lng: 37.149, country: "France", hostNation: "Jordan", type: "Air" },
  // Syria (withdrawn but listed for completeness)
  // { name: "Northern Syria (Ops)", lat: 36.509, lng: 38.287, country: "France", hostNation: "Syria", type: "Army" },

  // === INDIA ===
  // Tajikistan
  { name: "Farkhor Air Base", lat: 37.474, lng: 69.389, country: "India", hostNation: "Tajikistan", type: "Air" },
  { name: "Ayni Air Base (Renovation)", lat: 38.953, lng: 68.583, country: "India", hostNation: "Tajikistan", type: "Air" },
  // Mauritius
  { name: "Agaléga Island Base", lat: -10.430, lng: 56.620, country: "India", hostNation: "Mauritius", type: "Naval" },
  // Seychelles (cancelled but agreement exists)
  { name: "Assumption Island (Proposed)", lat: -9.742, lng: 46.508, country: "India", hostNation: "Seychelles", type: "Naval" },
  // Oman
  { name: "Duqm Port (Access)", lat: 19.501, lng: 57.697, country: "India", hostNation: "Oman", type: "Naval" },
  // Singapore
  { name: "Changi Naval Base (Access)", lat: 1.349, lng: 103.982, country: "India", hostNation: "Singapore", type: "Naval" },
  // Madagascar
  { name: "Antsiranana Bay (Access)", lat: -12.268, lng: 49.292, country: "India", hostNation: "Madagascar", type: "Naval" },
  // Bhutan (military training)
  { name: "IMTRAT Bhutan", lat: 27.471, lng: 89.639, country: "India", hostNation: "Bhutan", type: "Army" },
  // Maldives
  { name: "Uthuru Thila Falhu (UTF)", lat: 4.188, lng: 73.528, country: "India", hostNation: "Maldives", type: "Naval" },
  { name: "Addu Atoll", lat: -0.627, lng: 73.150, country: "India", hostNation: "Maldives", type: "Naval" },
];

export async function GET() {
  try {
    // Group bases by country for statistics
    const byCountry = FOREIGN_MILITARY_BASES.reduce((acc, base) => {
      acc[base.country] = (acc[base.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[Foreign Bases API] Returning ${FOREIGN_MILITARY_BASES.length} installations`);
    console.log(`[Foreign Bases API] By country:`, byCountry);

    return NextResponse.json({
      bases: FOREIGN_MILITARY_BASES,
      count: FOREIGN_MILITARY_BASES.length,
      byCountry,
      source: "static",
    });
  } catch (error) {
    console.error("[Foreign Bases API] Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch foreign military bases", bases: [] },
      { status: 200 }
    );
  }
}
