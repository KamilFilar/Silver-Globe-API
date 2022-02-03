// This file is from: https://github.com/ryanseys/lune 
// Some functions have changed
// Apache 2.0           (03.02.2022)

// Phases of the moon & precision
const NEW = 0;
const FIRST = 1;
const FULL = 2;
const LAST = 3;
const PHASE_MASK = 3;

const SUN_SMAXIS = 1.49585e8; // Semi-major axis of Earth's orbit, in km
const SUN_ANGULAR_SIZE_SMAXIS = SUN_SMAXIS * 0.533128; // SUN_SMAXIS premultiplied by the angular size of the Sun from the Earth
const MOON_SMAXIS = 384401.0; // Semi-major axis of the Moon's orbit, in kilometers
const MOON_ANGULAR_SIZE_SMAXIS = MOON_SMAXIS * 0.5181; // MOON_SMAXIS premultiplied by the angular size of the Moon from the Earth
const SYNODIC_MONTH = 29.530588853; // SYNODIC_MONTH (new Moon to new Moon), in days

// Auxiliary functions to calc JD
let fromDate = (date) => {
    return date.getTime() / 86400000 + 2440587.5
}

let toDate = (julian) => {
    return new Date((julian - 2440587.5) * 86400000)
}

// Normalization
const normalize = (value) => {
    value = value - Math.floor(value);
    if (value < 0)
        value = value + 1
    return value;
}

// Function to calc JD
export function getJulianDate(date) {
    if (!date) {
        date = new Date();
    }

    Date.prototype.getJulian = function () {
        return (date / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
        //   days since epoch         subtract offset                days from 4713 B.C. to 1970 A.D.
    }

    const julianDate = date.getJulian();
    return julianDate;
}

export function getPercentCycle(date) {
    return normalize((getJulianDate(date) - 2451550.1) / SYNODIC_MONTH);
}

export function getCalcDate(date) {
    let calcDate = phase(date).date;
    return calcDate;
}

export function getLunarAge(date) {
    const percent = getPercentCycle(date);
    const age = percent * SYNODIC_MONTH;
    return age;
}

export function getIllumination(date) {
    let illumination = phase(date).illuminated;
    return illumination;
}

export function getDistance(date) {
    let distanceInKM = phase(date).distance;
    return distanceInKM;
}

export function getMoonPhases(date) {
    let moonPhases = phaseHunt(date);
    return moonPhases;
}

export function getCalcPhase(date) {
    let calcPhase = phase(date).phase;
    return calcPhase;
}

// Convert degrees to radians
let torad = (d) => {
    return (Math.PI / 180.0) * d;
}

// Convert radians to degrees
let dsin = (d) => {
    return Math.sin(torad(d));
}

let dcos = (d) => {
    return Math.cos(torad(d));
}

// Convert astronomical units to kilometers
let tokm = (au) => {
    return 149597870.700 * au;
}

// Finds the phase information for specific date.
export function phase(date) {
    if (!date) {
        date = new Date()
    }
    if (!(date instanceof Date)) {
        throw new TypeError('Invalid parameter!');
    }
    if (Number.isNaN(date.getTime())) {
        throw new RangeError('Invalid Date!');
    }

    // t is the time in "Julian centuries" starting from 2000-01-01
    // (0.3 is because the UNIX epoch is on 1970-01-01 and that's 3/10th of a century before 2000-01-01)
    const t = date.getTime() * (1 / 3155760000000) - 0.3;

    // Lunar mean elongation
    const d = 297.8501921 + t * (445267.1114034 + t * (-0.0018819 + t * ((1 / 545868) + t * (-1 / 113065000))));

    // Solar mean anomaly
    const m = 357.5291092 + t * (35999.0502909 + t * (-0.0001536 + t * (1 / 24490000)));

    // Lunar mean anomaly
    const n = 134.9633964 + t * (477198.8675055 + t * (0.0087414 + t * ((1 / 69699) + t * (-1 / 14712000))));

    // Derive sines and cosines necessary for the below calculations
    const sind = dsin(d);
    const sinm = dsin(m);
    const sinn = dsin(n);
    const cosd = dcos(d);
    const cosm = dcos(m);
    const cosn = dcos(n);

    // Use trigonometric identities to derive the remainder of the sines and
    // cosines we need. this reduces us from needing 14 sin/cos calls to only 7,
    // and makes the lunar distance and solar distance essentially free.
    const sin2d = 2 * sind * cosd; // sin(2d)
    const sin2n = 2 * sinn * cosn; // sin(2n)
    const cos2d = 2 * cosd * cosd - 1;// cos(2d)
    const cos2m = 2 * cosm * cosm - 1; // cos(2m)
    const cos2n = 2 * cosn * cosn - 1; // cos(2n)
    const sin2dn = sin2d * cosn - cos2d * sinn; // sin(2d - n)
    const cos2dn = cos2d * cosn + sin2d * sinn; // cos(2d - n)

    // Lunar phase angle
    const i = 180 - d - 6.289 * sinn + 2.100 * sinm - 1.274 * sin2dn - 0.658 * sin2d - 0.214 * sin2n - 0.110 * sind;

    // Fractional illumination
    const illumination = dcos(i) * 0.5 + 0.5;

    // Fractional lunar phase
    let phase = 0.5 - i * (1 / 360);
    phase -= Math.floor(phase);

    // Lunar distance
    const moonDistance = 385000.56 - 20905.355 * cosn - 3699.111 * cos2dn - 2955.968 * cos2d - 569.925 * cos2n + 108.743 * cosd;

    // Solar distance
    const sunDistance = tokm(1.00014 - 0.01671 * cosm - 0.00014 * cos2m);

    return {
        date: date,
        phase: phase,
        illuminated: illumination,
        age: phase * SYNODIC_MONTH,
        distance: moonDistance,
        angular_diameter: MOON_ANGULAR_SIZE_SMAXIS / moonDistance,
        sun_distance: sunDistance,
        sun_angular_diameter: SUN_ANGULAR_SIZE_SMAXIS / sunDistance
    }
}

//  Calculates time of the mean new Moon for a given base date.
//  This argument K to this function is the precomputed synodic month
//  index, given by: K = (year - 1900) * 12.3685
//  where year is expressed as a year and fractional year.
let meanphase = (sdate, k) => {
    // Time in Julian centuries from 1900 January 12 noon UTC
    const delta = (sdate - -2208945600000.0) / 86400000.0;
    const t = delta / 36525;
    return 2415020.75933 +
        SYNODIC_MONTH * k +
        (0.0001178 - 0.000000155 * t) * t * t +
        0.00033 * dsin(166.56 + (132.87 - 0.009173 * t) * t);
}


//  Given a K value used to determine the mean phase of the new moon, and a
//  phase selector (0, 1, 2, 3), obtain the true, corrected phase time.
let truephase = (k, tphase) => {
    // Restrict tphase to (0, 1, 2, 3)
    tphase = tphase & PHASE_MASK;

    // Add phase to new moon time
    k = k + 0.25 * tphase;

    // Time in Julian centuries from 1900 January 0.5
    const t = (1.0 / 1236.85) * k;

    // Mean time of phase
    let pt = 2415020.75933 +
        SYNODIC_MONTH * k +
        (0.0001178 - 0.000000155 * t) * t * t +
        0.00033 * dsin(166.56 + (132.87 - 0.009173 * t) * t);

    // Sun's mean anomaly
    const m = 359.2242 + 29.10535608 * k - (0.0000333 - 0.00000347 * t) * t * t;

    // Moon's mean anomaly
    const mprime = 306.0253 + 385.81691806 * k + (0.0107306 + 0.00001236 * t) * t * t;

    // Moon's argument of latitude
    const f = 21.2964 + 390.67050646 * k - (0.0016528 - 0.00000239 * t) * t * t;

    // Use different correction equations depending on the phase being sought
    switch (tphase) {
        // New and full moon use one correction
        case NEW:
        case FULL:
            pt += (0.1734 - 0.000393 * t) * dsin(m) +
                0.0021 * dsin(2 * m) -
                0.4068 * dsin(mprime) +
                0.0161 * dsin(2 * mprime) -
                0.0004 * dsin(3 * mprime) +
                0.0104 * dsin(2 * f) -
                0.0051 * dsin(m + mprime) -
                0.0074 * dsin(m - mprime) +
                0.0004 * dsin(2 * f + m) -
                0.0004 * dsin(2 * f - m) -
                0.0006 * dsin(2 * f + mprime) +
                0.0010 * dsin(2 * f - mprime) +
                0.0005 * dsin(m + 2 * mprime)
            break;

        // First and last quarter moon use a different correction
        case FIRST:
        case LAST:
            pt += (0.1721 - 0.0004 * t) * dsin(m) +
                0.0021 * dsin(2 * m) -
                0.6280 * dsin(mprime) +
                0.0089 * dsin(2 * mprime) -
                0.0004 * dsin(3 * mprime) +
                0.0079 * dsin(2 * f) -
                0.0119 * dsin(m + mprime) -
                0.0047 * dsin(m - mprime) +
                0.0003 * dsin(2 * f + m) -
                0.0004 * dsin(2 * f - m) -
                0.0006 * dsin(2 * f + mprime) +
                0.0021 * dsin(2 * f - mprime) +
                0.0003 * dsin(m + 2 * mprime) +
                0.0004 * dsin(m - 2 * mprime) -
                0.0003 * dsin(2 * m + mprime)

            // The sign of the last term depends on whether we're looking for a first or last quarter moon!
            const sign = (tphase < FULL) ? +1 : -1;
            pt += sign * (0.0028 - 0.0004 * dcos(m) + 0.0003 * dcos(mprime));
            break;
    }
    return toDate(pt);
}

//  Find time of phases of the moon which surround the current date.
//  Five phases are found, starting and ending with the new moons
//  which bound the current lunation.
let phaseHunt = (sdate) => {
    if (!sdate) {
        sdate = new Date();
    }
    if (!(sdate instanceof Date)) {
        throw new TypeError('Invalid parameter');
    }
    if (Number.isNaN(sdate.getTime())) {
        throw new RangeError('Invalid Date');
    }

    let adate = new Date(sdate.getTime() - (45 * 86400000)); // 45 days prior
    let k1 = Math.floor(12.3685 * (adate.getFullYear() + (1.0 / 12.0) * adate.getMonth() - 1900));
    let nt1 = meanphase(adate.getTime(), k1);

    sdate = fromDate(sdate)
    adate = nt1 + SYNODIC_MONTH;
    let k2 = k1 + 1;
    let nt2 = meanphase(adate, k2);
    while (nt1 > sdate || sdate >= nt2) {
        adate += SYNODIC_MONTH;
        k1++;
        k2++;
        nt1 = nt2;
        nt2 = meanphase(adate, k2);
    }

    return {
        new_date: truephase(k1, NEW),
        q1_date: truephase(k1, FIRST),
        full_date: truephase(k1, FULL),
        q3_date: truephase(k1, LAST),
        nextnew_date: truephase(k2, NEW)
    }
}