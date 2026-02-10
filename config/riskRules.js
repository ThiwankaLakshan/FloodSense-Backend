module.exports = {
    // Rainfall scoring rules
    rainfall: {
        rainfall24h: [
            { min: 200, score: 4, label: 'Extreme 24h rainfall' },
            { min: 150, score: 3, label: 'Very heavy 24h rainfall' },
            { min: 100, score: 2, label: 'Heavy 24h rainfall' },
            { min: 50, score: 1, label: 'Moderate 24h rainfall' }
        ],
        rainfall72h: [
            { min: 400, score: 4, label: 'Extreme 72h rainfall' },
            { min: 300, score: 3, label: 'Very heavy 72h rainfall' },
            { min: 200, score: 2, label: 'Heavy 72h rainfall' },
            { min: 100, score: 1, label: 'Moderate 72h rainfall' }
        ]
    },

    // Elevation scoring
    elevation: [
        { max: 5, score: 3, label: 'Extremely low elevation' },
        { max: 10, score: 2, label: 'Very low elevation' },
        { max: 25, score: 1, label: 'Low elevation' }
    ],

    // Season scoring
    season: [
        { months: [5, 6, 7, 8, 9], score: 2, label: 'SW Monsoon season' },
        { months: [10, 11, 12, 1], score: 2, label: 'NE Monsoon season' },
        { months: [3, 4], score: 1, label: 'Inter-Monsoon period' }
    ],

    // Historical flood frequency
    historicalFlood: [
        { floodsLast5Years: 3, score: 2, label: 'Frequently flooded area' },
        { floodsLast5Years: 1, score: 1, label: 'Previously flooded area' }
    ],

    // Risk level mapping (0-15 scale)
    // Maximum possible score: 4 + 4 + 3 + 2 + 2 = 15
    riskLevels: [
        {
            minScore: 9,
            level: 'CRITICAL',
            color: '#DC2626',
            action: 'Evacuate immediately to higher ground'
        },
        {
            minScore: 6,
            level: 'HIGH',
            color: '#F97316',
            action: 'Prepare to evacuate - secure property and gather emergency supplies'
        },
        {
            minScore: 3,
            level: 'MODERATE',
            color: '#EAB308',
            action: 'Stay alert - monitor updates and review evacuation plan'
        },
        {
            minScore: 0,
            level: 'LOW',
            color: '#22C55E',
            action: 'Normal conditions - maintain general awareness'
        }
    ]
};
// ```

// ---

// ## 📊 **New Unified Scoring System (0-15 scale)**

// | Factor | Min Score | Max Score |
// |--------|-----------|-----------|
// | **24h Rainfall** | 0 | 4 |
// | **72h Rainfall** | 0 | 4 |
// | **Elevation** | 0 | 3 |
// | **Historical Floods** | 0 | 2 |
// | **Season** | 0 | 2 |
// | **TOTAL** | 0 | **15** |

// ### **Risk Levels:**
// - **CRITICAL:** 9-15 points
// - **HIGH:** 6-8 points
// - **MODERATE:** 3-5 points
// - **LOW:** 0-2 points

// ---

// ## 🔍 **Example Calculations:**

// ### **Scenario 1: Wellampitiya During Heavy Monsoon**
// ```
// 24h Rainfall: 180mm     → 3 points
// 72h Rainfall: 350mm     → 3 points
// Elevation: 3m           → 3 points
// Historical: 5 floods    → 2 points
// Season: June (monsoon)  → 2 points
// ─────────────────────────────────
// TOTAL:                  = 13 points → CRITICAL ⚠️
// ```

// ### **Scenario 2: Gampaha Light Rain**
// ```
// 24h Rainfall: 60mm      → 1 point
// 72h Rainfall: 120mm     → 1 point
// Elevation: 12m          → 1 point
// Historical: 2 floods    → 1 point
// Season: March (inter)   → 1 point
// ─────────────────────────────────
// TOTAL:                  = 5 points → MODERATE ⚠️
// ```

// ### **Scenario 3: Safe Conditions**
// ```
// 24h Rainfall: 10mm      → 0 points
// 72h Rainfall: 25mm      → 0 points
// Elevation: 15m          → 1 point
// Historical: 0 floods    → 0 points
// Season: February        → 0 points
// ─────────────────────────────────
// TOTAL:                  = 1 point → LOW ✅