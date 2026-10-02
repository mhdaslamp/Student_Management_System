/**
 * @file ktuPointsEngine.js
 * @description Deterministic rule engine for calculating KTU Activity Points.
 * Takes the form submission data and computes the points using KTU 2024 guidelines.
 */

'use strict';

/**
 * Common point scale for level-based events.
 */
const LEVEL_POINTS = {
    college: 4,
    zonal: 8,
    state: 12,
    national: 16,
    international: 20
};

const WINNER_MULTIPLIER = {
    participation: 1,
    first: 1.5,
    second: 1.25,
    third: 1.1
};

/**
 * Calculate points for an activity
 * @param {Object} activity - The activity mongoose document or JSON
 * @returns {Object} { points: Number, breakdown: String }
 */
function calculatePoints(activity) {
    const { ktuRuleId, eventLevel, achievementType, stageOrPhase, hasDuration } = activity;

    // Fallback/Default for other activities
    if (ktuRuleId === 'other') {
        return {
            points: null,
            breakdown: 'Custom activity. Points must be manually assigned by a faculty member.'
        };
    }

    let points = 0;
    let breakdown = `Rule ${ktuRuleId}`;

    switch (ktuRuleId) {
        // --- GROUP 1 ---
        case '1.1': // Sports Participation
            if (eventLevel && LEVEL_POINTS[eventLevel]) {
                points = LEVEL_POINTS[eventLevel];
                breakdown += ` -> ${eventLevel} level participation (${points} pts)`;
            }
            break;
        case '1.2': // Sports Single Winner
        case '1.3': // Sports Group Winner
            if (eventLevel && LEVEL_POINTS[eventLevel]) {
                let base = LEVEL_POINTS[eventLevel];
                let multi = achievementType && WINNER_MULTIPLIER[achievementType] ? WINNER_MULTIPLIER[achievementType] : 1.5;
                points = Math.round(base * multi);
                breakdown += ` -> ${eventLevel} level ${achievementType} (${points} pts)`;
            }
            break;
        case '1.4': // Magazine
        case '1.5': // License
        case '1.8': // Blood Donation
        case '1.10': // Tree Planting
            points = 10;
            breakdown += ` -> Standard completion (10 pts)`;
            break;
        case '1.6': // Comm Service 2 days
            points = 12;
            breakdown += ` -> 2 days service (12 pts)`;
            break;
        case '1.11': // NSS 2 year
            points = 60;
            breakdown += ` -> NSS 2 Year Voluntiership (60 pts)`;
            break;
        case '1.15': // NSS State/Nat Award
            if (stageOrPhase === 'national') { points = 25; breakdown += ` -> National Award (25 pts)`; }
            else { points = 15; breakdown += ` -> State Award (15 pts)`; }
            break;
        case '1.19': // NCC Certs
            if (stageOrPhase === 'c_cert') { points = 30; breakdown += ` -> NCC C Cert (30 pts)`; }
            else if (stageOrPhase === 'b_cert') { points = 20; breakdown += ` -> NCC B Cert (20 pts)`; }
            else { points = 10; breakdown += ` -> NCC 1-Year (10 pts)`; }
            break;
        
        // --- GROUP 2 ---
        case '2.1': // Tech Fest Part
        case '2.3': // Prof Soc Tech Part
            if (eventLevel && LEVEL_POINTS[eventLevel]) {
                points = LEVEL_POINTS[eventLevel];
                breakdown += ` -> ${eventLevel} level participation (${points} pts)`;
            }
            break;
        case '2.2': // Tech Fest Winner
        case '2.4': // Prof Soc Tech Winner
            if (eventLevel && LEVEL_POINTS[eventLevel]) {
                let base = LEVEL_POINTS[eventLevel];
                let multi = achievementType && WINNER_MULTIPLIER[achievementType] ? WINNER_MULTIPLIER[achievementType] : 1.5;
                points = Math.round(base * multi);
                breakdown += ` -> ${eventLevel} level winner (${points} pts)`;
            }
            break;
        case '2.11': // Prof Soc Membership
            if (stageOrPhase === 'chair') { points = 15; }
            else if (stageOrPhase === 'exec') { points = 10; }
            else { points = 5; } // member or coordinator
            breakdown += ` -> Professional Society Role (${points} pts)`;
            break;
        case '2.12': // College Union
            if (stageOrPhase === 'univ_bearer') { points = 30; }
            else if (stageOrPhase === 'univ_member') { points = 25; }
            else if (stageOrPhase === 'office_bearer') { points = 20; }
            else { points = 15; } // exec
            breakdown += ` -> Union Role (${points} pts)`;
            break;
        
        // --- GROUP 3 ---
        case '3.4': // LEAP
            if (stageOrPhase === 'project') { points = 20; }
            else if (stageOrPhase === 'course') { points = 15; }
            else { points = 10; } // bootcamp
            breakdown += ` -> LEAP Stage (${points} pts)`;
            break;
        case '3.5': // YIP
            if (stageOrPhase === 'state_winner') { points = 35; }
            else if (stageOrPhase === 'district_winner') { points = 20; }
            else if (stageOrPhase === 'district_shortlisted') { points = 10; }
            else { points = 5; } // idea
            breakdown += ` -> YIP Achievement (${points} pts)`;
            break;
        case '3.10': // Patent
            if (stageOrPhase === 'licensed' || stageOrPhase === 'granted') { points = 40; }
            else if (stageOrPhase === 'published') { points = 30; }
            else { points = 20; } // filed
            breakdown += ` -> Patent Stage (${points} pts)`;
            break;

        default:
            // Generic fallback for any unmapped standard rules
            points = 10;
            breakdown += ` -> Assigned base default points (10 pts)`;
            break;
    }

    return { points, breakdown };
}

module.exports = {
    calculatePoints
};
