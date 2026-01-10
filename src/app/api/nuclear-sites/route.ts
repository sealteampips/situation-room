import { NextResponse } from "next/server";

export type NuclearCountry = "US" | "Russia" | "China" | "UK" | "France" | "Israel" | "Pakistan" | "India" | "North Korea";
export type NuclearType = "ICBM" | "SLBM" | "Bomber" | "Storage" | "Production" | "Research";

export interface NuclearSite {
  name: string;
  lat: number;
  lng: number;
  country: NuclearCountry;
  type: NuclearType;
  details?: string;
  warheads?: string; // Estimated count or range
}

// Comprehensive list of known nuclear weapons sites worldwide
// Data compiled from public sources - OSINT, FAS, SIPRI, CSIS
const NUCLEAR_SITES: NuclearSite[] = [
  // === UNITED STATES ===
  // ICBM Fields (3 active wings, ~400 Minuteman III missiles)
  { name: "Malmstrom AFB ICBM Field", lat: 47.506, lng: -111.183, country: "US", type: "ICBM", details: "341st Missile Wing - 150 Minuteman III silos across Montana", warheads: "~150" },
  { name: "Minot AFB ICBM Field", lat: 48.416, lng: -101.358, country: "US", type: "ICBM", details: "91st Missile Wing - 150 Minuteman III silos across North Dakota", warheads: "~150" },
  { name: "F.E. Warren AFB ICBM Field", lat: 41.146, lng: -104.867, country: "US", type: "ICBM", details: "90th Missile Wing - 150 Minuteman III silos across Wyoming/Colorado/Nebraska", warheads: "~150" },

  // SSBN Submarine Bases (14 Ohio-class submarines)
  { name: "Naval Submarine Base Kings Bay", lat: 30.799, lng: -81.563, country: "US", type: "SLBM", details: "Atlantic Fleet SSBNs - 6 Ohio-class submarines with Trident II D5", warheads: "~600" },
  { name: "Naval Base Kitsap-Bangor", lat: 47.729, lng: -122.714, country: "US", type: "SLBM", details: "Pacific Fleet SSBNs - 8 Ohio-class submarines with Trident II D5", warheads: "~800" },

  // Strategic Bomber Bases
  { name: "Whiteman AFB", lat: 38.730, lng: -93.548, country: "US", type: "Bomber", details: "509th Bomb Wing - B-2 Spirit stealth bombers", warheads: "B61/B83" },
  { name: "Barksdale AFB", lat: 32.501, lng: -93.663, country: "US", type: "Bomber", details: "2nd Bomb Wing - B-52H Stratofortress", warheads: "AGM-86B ALCM" },
  { name: "Minot AFB (Bombers)", lat: 48.420, lng: -101.350, country: "US", type: "Bomber", details: "5th Bomb Wing - B-52H Stratofortress", warheads: "AGM-86B ALCM" },
  { name: "Dyess AFB", lat: 32.421, lng: -99.855, country: "US", type: "Bomber", details: "7th Bomb Wing - B-1B Lancer (conventional, nuclear-capable airframe)", warheads: "Conventional" },

  // NATO Nuclear Sharing Sites (B61 gravity bombs)
  { name: "Incirlik Air Base", lat: 37.002, lng: 35.426, country: "US", type: "Storage", details: "NATO Nuclear Sharing - Turkey - B61 bombs", warheads: "~50" },
  { name: "Aviano Air Base", lat: 46.032, lng: 12.596, country: "US", type: "Storage", details: "NATO Nuclear Sharing - Italy - B61 bombs", warheads: "~40" },
  { name: "Büchel Air Base", lat: 50.174, lng: 7.063, country: "US", type: "Storage", details: "NATO Nuclear Sharing - Germany - B61 bombs", warheads: "~20" },
  { name: "Kleine Brogel Air Base", lat: 51.168, lng: 5.470, country: "US", type: "Storage", details: "NATO Nuclear Sharing - Belgium - B61 bombs", warheads: "~20" },
  { name: "Volkel Air Base", lat: 51.657, lng: 5.708, country: "US", type: "Storage", details: "NATO Nuclear Sharing - Netherlands - B61 bombs", warheads: "~20" },

  // Production/Research
  { name: "Pantex Plant", lat: 35.320, lng: -101.570, country: "US", type: "Production", details: "Primary US nuclear weapons assembly/disassembly facility", warheads: "N/A" },
  { name: "Y-12 National Security Complex", lat: 35.985, lng: -84.245, country: "US", type: "Production", details: "Uranium processing and weapons components", warheads: "N/A" },
  { name: "Los Alamos National Laboratory", lat: 35.881, lng: -106.299, country: "US", type: "Research", details: "Nuclear weapons research and design", warheads: "N/A" },
  { name: "Lawrence Livermore National Laboratory", lat: 37.687, lng: -121.706, country: "US", type: "Research", details: "Nuclear weapons research and design", warheads: "N/A" },
  { name: "Sandia National Laboratories", lat: 35.058, lng: -106.540, country: "US", type: "Research", details: "Nuclear weapons engineering", warheads: "N/A" },

  // === RUSSIA ===
  // ICBM Fields (RS-28 Sarmat, RS-24 Yars, RS-18, RS-12M Topol)
  { name: "Kozelsk ICBM Base", lat: 54.033, lng: 35.783, country: "Russia", type: "ICBM", details: "28th Guards Missile Division - RS-24 Yars", warheads: "~60" },
  { name: "Tatishchevo ICBM Base", lat: 51.680, lng: 45.170, country: "Russia", type: "ICBM", details: "60th Missile Division - RS-24 Yars, RS-28 Sarmat", warheads: "~100" },
  { name: "Uzhur ICBM Base", lat: 55.316, lng: 89.830, country: "Russia", type: "ICBM", details: "62nd Missile Division - RS-18 Stiletto", warheads: "~30" },
  { name: "Dombarovsky ICBM Base", lat: 50.752, lng: 59.520, country: "Russia", type: "ICBM", details: "13th Missile Division - RS-28 Sarmat deployment site", warheads: "~18" },
  { name: "Kartaly ICBM Base", lat: 53.033, lng: 60.633, country: "Russia", type: "ICBM", details: "Missile Division - RS-24 Yars mobile", warheads: "~20" },
  { name: "Novosibirsk ICBM Base", lat: 55.030, lng: 82.920, country: "Russia", type: "ICBM", details: "39th Guards Missile Division - RS-24 Yars mobile", warheads: "~30" },
  { name: "Irkutsk ICBM Base", lat: 52.290, lng: 104.300, country: "Russia", type: "ICBM", details: "29th Guards Missile Division - RS-24 Yars mobile", warheads: "~30" },
  { name: "Yoshkar-Ola ICBM Base", lat: 56.600, lng: 47.900, country: "Russia", type: "ICBM", details: "14th Missile Division - RS-24 Yars mobile", warheads: "~20" },
  { name: "Teykovo ICBM Base", lat: 56.850, lng: 40.516, country: "Russia", type: "ICBM", details: "54th Guards Missile Division - RS-24 Yars", warheads: "~20" },
  { name: "Vypolzovo ICBM Base", lat: 57.783, lng: 34.233, country: "Russia", type: "ICBM", details: "7th Guards Missile Division - RS-24 Yars", warheads: "~20" },
  { name: "Barnaul ICBM Base", lat: 53.350, lng: 83.770, country: "Russia", type: "ICBM", details: "35th Missile Division - RS-24 Yars mobile", warheads: "~20" },

  // SSBN Submarine Bases
  { name: "Gadzhiyevo Naval Base", lat: 69.250, lng: 33.333, country: "Russia", type: "SLBM", details: "Northern Fleet SSBNs - Delta IV and Borei-class", warheads: "~400" },
  { name: "Severomorsk Naval Base", lat: 69.067, lng: 33.417, country: "Russia", type: "SLBM", details: "Northern Fleet headquarters - SSBN support", warheads: "Support" },
  { name: "Vilyuchinsk Naval Base", lat: 52.933, lng: 158.400, country: "Russia", type: "SLBM", details: "Pacific Fleet SSBNs - Delta III and Borei-class", warheads: "~200" },

  // Strategic Bomber Bases
  { name: "Engels-2 Air Base", lat: 51.483, lng: 46.200, country: "Russia", type: "Bomber", details: "Tu-160 Blackjack and Tu-95MS Bear bombers", warheads: "Kh-102 ALCM" },
  { name: "Ukrainka Air Base", lat: 51.167, lng: 128.417, country: "Russia", type: "Bomber", details: "Tu-95MS Bear bombers - Far East", warheads: "Kh-102 ALCM" },

  // Production
  { name: "Sarov (Arzamas-16)", lat: 54.933, lng: 43.317, country: "Russia", type: "Production", details: "RFNC-VNIIEF - Primary nuclear weapons design center", warheads: "N/A" },
  { name: "Snezhinsk (Chelyabinsk-70)", lat: 56.083, lng: 60.733, country: "Russia", type: "Research", details: "RFNC-VNIITF - Secondary weapons design center", warheads: "N/A" },

  // === CHINA ===
  // ICBM Fields (DF-5, DF-31, DF-41)
  { name: "Jilantai ICBM Base", lat: 39.780, lng: 105.750, country: "China", type: "ICBM", details: "DF-31A/AG mobile ICBMs - Inner Mongolia", warheads: "~20" },
  { name: "Sundian ICBM Base", lat: 34.633, lng: 111.383, country: "China", type: "ICBM", details: "DF-5B liquid-fueled ICBMs - Henan", warheads: "~10" },
  { name: "Delingha ICBM Base", lat: 37.383, lng: 97.367, country: "China", type: "ICBM", details: "DF-31 mobile ICBMs - Qinghai", warheads: "~12" },
  { name: "Yumen Silo Field", lat: 40.300, lng: 97.000, country: "China", type: "ICBM", details: "New construction - ~120 silos under development", warheads: "~120 (future)" },
  { name: "Hami Silo Field", lat: 42.800, lng: 93.500, country: "China", type: "ICBM", details: "New construction - ~110 silos under development", warheads: "~110 (future)" },
  { name: "Ordos Silo Field", lat: 40.000, lng: 109.800, country: "China", type: "ICBM", details: "New construction - possible DF-41 silos", warheads: "~30 (future)" },
  { name: "Luoning ICBM Base", lat: 34.400, lng: 111.650, country: "China", type: "ICBM", details: "DF-5 liquid-fueled ICBMs", warheads: "~10" },
  { name: "Nanyang ICBM Base", lat: 32.990, lng: 112.530, country: "China", type: "ICBM", details: "DF-41 road-mobile ICBMs", warheads: "~12" },
  { name: "Xinyang ICBM Base", lat: 32.133, lng: 114.066, country: "China", type: "ICBM", details: "DF-41 road-mobile ICBMs", warheads: "~12" },
  { name: "Tonghua ICBM Base", lat: 41.683, lng: 125.933, country: "China", type: "ICBM", details: "DF-31AG mobile ICBMs - Jilin", warheads: "~12" },
  { name: "Hanzhong ICBM Base", lat: 33.067, lng: 107.033, country: "China", type: "ICBM", details: "DF-31A mobile ICBMs - Shaanxi", warheads: "~12" },

  // SSBN Submarine Base
  { name: "Yulin Naval Base", lat: 18.227, lng: 109.562, country: "China", type: "SLBM", details: "Jin-class (Type 094) SSBNs - South China Sea", warheads: "~72" },
  { name: "Jianggezhuang Naval Base", lat: 36.100, lng: 120.583, country: "China", type: "SLBM", details: "Potential SSBN support - Yellow Sea", warheads: "Support" },

  // Bomber Bases
  { name: "Xi'an-Yanliang Air Base", lat: 34.533, lng: 109.250, country: "China", type: "Bomber", details: "H-6K/N bombers - nuclear-capable", warheads: "Air-launched" },

  // Production
  { name: "China Academy of Engineering Physics", lat: 31.583, lng: 104.750, country: "China", type: "Research", details: "Mianyang - Primary nuclear weapons research", warheads: "N/A" },

  // === UNITED KINGDOM ===
  { name: "HMNB Clyde (Faslane)", lat: 56.067, lng: -4.817, country: "UK", type: "SLBM", details: "Vanguard-class SSBNs with Trident II D5 - UK nuclear deterrent", warheads: "~120" },
  { name: "RNAD Coulport", lat: 56.050, lng: -4.883, country: "UK", type: "Storage", details: "Trident warhead storage and handling facility", warheads: "~120" },
  { name: "AWE Aldermaston", lat: 51.380, lng: -1.167, country: "UK", type: "Production", details: "Atomic Weapons Establishment - warhead production", warheads: "N/A" },
  { name: "AWE Burghfield", lat: 51.417, lng: -1.000, country: "UK", type: "Production", details: "Warhead assembly facility", warheads: "N/A" },

  // === FRANCE ===
  { name: "Île Longue Naval Base", lat: 48.283, lng: -4.517, country: "France", type: "SLBM", details: "Triomphant-class SSBNs with M51 SLBMs - FOST", warheads: "~200" },
  { name: "Base Aérienne 125 Istres", lat: 43.517, lng: 4.933, country: "France", type: "Bomber", details: "Mirage 2000N and Rafale with ASMP-A missiles", warheads: "~50" },
  { name: "Base Aérienne 113 Saint-Dizier", lat: 48.633, lng: 4.900, country: "France", type: "Bomber", details: "Rafale with ASMP-A nuclear missiles", warheads: "~40" },
  { name: "CEA Valduc", lat: 47.483, lng: 4.917, country: "France", type: "Production", details: "Nuclear warhead production and maintenance", warheads: "N/A" },

  // === ISRAEL (Assumed/Undeclared) ===
  { name: "Negev Nuclear Research Center (Dimona)", lat: 31.001, lng: 35.145, country: "Israel", type: "Production", details: "Plutonium production reactor - undeclared nuclear program", warheads: "~90 (est.)" },
  { name: "Sdot Micha Air Base", lat: 31.717, lng: 34.917, country: "Israel", type: "ICBM", details: "Jericho III IRBM/ICBM deployment", warheads: "~25 (est.)" },
  { name: "Tirosh Storage Site", lat: 31.817, lng: 34.867, country: "Israel", type: "Storage", details: "Suspected nuclear warhead storage", warheads: "Unknown" },

  // === PAKISTAN ===
  { name: "Khushab Nuclear Complex", lat: 32.017, lng: 72.217, country: "Pakistan", type: "Production", details: "Plutonium production reactors (4 reactors)", warheads: "N/A" },
  { name: "Pakistan Ordnance Factories Wah", lat: 33.767, lng: 72.750, country: "Pakistan", type: "Production", details: "Suspected warhead assembly", warheads: "N/A" },
  { name: "Sargodha Air Base", lat: 32.050, lng: 72.667, country: "Pakistan", type: "Bomber", details: "F-16 and Mirage nuclear-capable aircraft", warheads: "Air-delivered" },
  { name: "Masroor Air Base", lat: 24.894, lng: 66.939, country: "Pakistan", type: "Bomber", details: "Nuclear-capable aircraft base - Karachi", warheads: "Air-delivered" },
  { name: "Gujranwala Missile Base", lat: 32.167, lng: 74.183, country: "Pakistan", type: "ICBM", details: "Shaheen-III MRBM deployment", warheads: "~20 (est.)" },
  { name: "Dera Nawab Sahib", lat: 29.167, lng: 70.983, country: "Pakistan", type: "ICBM", details: "Shaheen missile deployment site", warheads: "~15 (est.)" },
  { name: "Karachi Naval Dockyard", lat: 24.852, lng: 66.980, country: "Pakistan", type: "SLBM", details: "Babur-3 SLCM development - Agosta submarines", warheads: "Development" },

  // === INDIA ===
  { name: "INS Arihant Base (Visakhapatnam)", lat: 17.717, lng: 83.300, country: "India", type: "SLBM", details: "Arihant-class SSBNs with K-15/K-4 SLBMs", warheads: "~48" },
  { name: "Bhabha Atomic Research Centre", lat: 19.017, lng: 72.917, country: "India", type: "Research", details: "BARC Mumbai - Nuclear weapons research", warheads: "N/A" },
  { name: "Indira Gandhi Centre for Atomic Research", lat: 12.550, lng: 80.167, country: "India", type: "Production", details: "Kalpakkam - Fast breeder reactor, Pu production", warheads: "N/A" },
  { name: "Agra Missile Base", lat: 27.167, lng: 78.017, country: "India", type: "ICBM", details: "Agni-V ICBM deployment - Strategic Forces Command", warheads: "~20 (est.)" },
  { name: "Secunderabad Missile Base", lat: 17.433, lng: 78.500, country: "India", type: "ICBM", details: "Agni-II/III MRBM deployment", warheads: "~15 (est.)" },
  { name: "Tezpur Air Base", lat: 26.709, lng: 92.785, country: "India", type: "Bomber", details: "Su-30MKI nuclear-capable aircraft", warheads: "Air-delivered" },
  { name: "Ambala Air Base", lat: 30.367, lng: 76.817, country: "India", type: "Bomber", details: "Jaguar and Su-30MKI nuclear-capable aircraft", warheads: "Air-delivered" },

  // === NORTH KOREA ===
  { name: "Yongbyon Nuclear Scientific Research Center", lat: 39.800, lng: 125.750, country: "North Korea", type: "Production", details: "5MWe reactor, reprocessing plant, centrifuge facility", warheads: "~60 (est. total)" },
  { name: "Punggye-ri Nuclear Test Site", lat: 41.283, lng: 129.083, country: "North Korea", type: "Research", details: "Underground nuclear test facility (6 tests conducted)", warheads: "Test site" },
  { name: "Sunchon Missile Base", lat: 39.417, lng: 125.933, country: "North Korea", type: "ICBM", details: "Hwasong-15/17 ICBM deployment site", warheads: "~10 (est.)" },
  { name: "Kusong Missile Base", lat: 40.000, lng: 125.100, country: "North Korea", type: "ICBM", details: "Hwasong-14/15 test launches, possible deployment", warheads: "~10 (est.)" },
  { name: "Sinpo Naval Shipyard", lat: 39.933, lng: 128.167, country: "North Korea", type: "SLBM", details: "SLBM development - Pukguksong missiles", warheads: "Development" },
  { name: "Magunpo Missile Base", lat: 38.700, lng: 125.567, country: "North Korea", type: "ICBM", details: "Ballistic missile garrison", warheads: "~5 (est.)" },
  { name: "Pyongyang International Airport (Military)", lat: 39.033, lng: 125.783, country: "North Korea", type: "Bomber", details: "Potential nuclear-capable aircraft", warheads: "Unknown" },
];

export async function GET() {
  try {
    // Group sites by country for statistics
    const byCountry = NUCLEAR_SITES.reduce((acc, site) => {
      acc[site.country] = (acc[site.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by type
    const byType = NUCLEAR_SITES.reduce((acc, site) => {
      acc[site.type] = (acc[site.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[Nuclear Sites API] Returning ${NUCLEAR_SITES.length} sites`);
    console.log(`[Nuclear Sites API] By country:`, byCountry);
    console.log(`[Nuclear Sites API] By type:`, byType);

    return NextResponse.json({
      sites: NUCLEAR_SITES,
      count: NUCLEAR_SITES.length,
      byCountry,
      byType,
      source: "static",
    });
  } catch (error) {
    console.error("[Nuclear Sites API] Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch nuclear sites", sites: [] },
      { status: 200 }
    );
  }
}
