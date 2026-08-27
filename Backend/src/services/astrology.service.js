// Vedic astrology calculations
// Production note: replace with swisseph for higher accuracy

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

// Normalize degree to 0–360
const norm = (deg) => ((deg % 360) + 360) % 360;

const degreeToSign = (deg) => SIGNS[Math.floor(norm(deg) / 30)];
const degreeToNakshatra = (deg) => NAKSHATRAS[Math.floor(norm(deg) / (360 / 27))];

// Julian Day Number
const toJulian = (date, timeStr, tzOffsetHours = 5.5) => {
    const [h, m] = timeStr.split(":").map(Number);
    const utcHour = h + m / 60 - tzOffsetHours;

    const y = date.getFullYear();
    const mo = date.getMonth() + 1;
    const d = date.getDate();
    const A = Math.floor((14 - mo) / 12);
    const Y = y + 4800 - A;
    const M = mo + 12 * A - 3;

    const jdn = d
        + Math.floor((153 * M + 2) / 5)
        + 365 * Y
        + Math.floor(Y / 4)
        - Math.floor(Y / 100)
        + Math.floor(Y / 400)
        - 32045;

    return jdn + (utcHour - 12) / 24;
};

// Julian centuries from J2000
const toT = (jd) => (jd - 2451545.0) / 36525;

// Mean planetary longitudes (simplified — use swisseph for production)
const meanLongitudes = (T) => ({
    Sun: norm(280.46646 + 36000.76983 * T),
    Moon: norm(218.3165 + 481267.8813 * T),
    Mercury: norm(252.2509 + 149472.6745 * T),
    Venus: norm(181.9798 + 58517.8156 * T),
    Mars: norm(355.4330 + 19140.2993 * T),
    Jupiter: norm(34.3515 + 3034.9057 * T),
    Saturn: norm(50.0774 + 1222.1138 * T),
    Rahu: norm(125.0445 - 1934.1363 * T),
});

const calcAscendant = (jd, lat, lng) => {
    const T = toT(jd);
    const GMST = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T);
    const LST = norm(GMST + lng);
    const asc = norm(LST + lat * 0.3); // simplified
    return { degree: parseFloat(asc.toFixed(4)), sign: degreeToSign(asc) };
};

const isRetrograde = (planet, T) => {
    const map = {
        Mercury: Math.sin(T * 3) < -0.7,
        Venus: Math.sin(T * 1.6) < -0.8,
        Mars: Math.sin(T * 0.5) < -0.85,
        Jupiter: Math.sin(T * 0.08) < -0.7,
        Saturn: Math.sin(T * 0.034) < -0.7,
        Rahu: true,
        Ketu: true,
    };
    return map[planet] || false;
};

// Vimshottari Dasha
const calcDashas = (birthDate, moonDeg) => {
    const nakshatraIndex = Math.floor(norm(moonDeg) / (360 / 27));
    const startPlanetIdx = nakshatraIndex % 9;

    let cursor = new Date(birthDate);
    const sequence = [];

    for (let i = 0; i < 9; i++) {
        const planet = DASHA_ORDER[(startPlanetIdx + i) % 9];
        const years = DASHA_YEARS[planet];
        const endDate = new Date(cursor);
        endDate.setFullYear(endDate.getFullYear() + years);

        sequence.push({ planet, startDate: new Date(cursor), endDate, years });
        cursor = new Date(endDate);
    }

    const now = new Date();
    const current = sequence.find((d) => now >= d.startDate && now <= d.endDate) || sequence[0];

    return { currentDasha: current, dashaSequence: sequence };
};

export const getSunSign = (date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "Aries";
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "Taurus";
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "Gemini";
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "Cancer";
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "Leo";
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "Virgo";
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "Libra";
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "Scorpio";
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "Sagittarius";
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "Capricorn";
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "Aquarius";
    return "Pisces";
};

// Main export — full kundli calculation
export const generateKundli = (birthDate, birthTime, lat, lng, tzOffsetHours = 5.5) => {
    const jd = toJulian(birthDate, birthTime, tzOffsetHours);
    const T = toT(jd);
    const lngs = meanLongitudes(T);

    // Add Ketu = Rahu + 180
    lngs.Ketu = norm(lngs.Rahu + 180);

    const ascendant = calcAscendant(jd, lat, lng);
    const ascIdx = SIGNS.indexOf(ascendant.sign);

    // Build planet objects
    const planets = Object.entries(lngs).map(([name, degree]) => {
        const signIdx = Math.floor(norm(degree) / 30);
        const houseNum = ((signIdx - ascIdx + 12) % 12) + 1;
        return {
            name,
            degree: parseFloat(degree.toFixed(4)),
            sign: SIGNS[signIdx],
            house: houseNum,
            nakshatra: degreeToNakshatra(degree),
            isRetro: isRetrograde(name, T),
        };
    });

    // Houses (whole sign system)
    const houses = Array.from({ length: 12 }, (_, i) => ({
        house: i + 1,
        sign: SIGNS[(ascIdx + i) % 12],
        degree: parseFloat(norm(ascendant.degree + i * 30).toFixed(4)),
    }));

    const moonPlanet = planets.find((p) => p.name === "Moon");
    const moonSign = moonPlanet?.sign || "Unknown";
    const sunSign = getSunSign(birthDate);
    const { currentDasha, dashaSequence } = calcDashas(birthDate, moonPlanet?.degree || 0);

    return { planets, houses, ascendant, sunSign, moonSign, currentDasha, dashaSequence };
};