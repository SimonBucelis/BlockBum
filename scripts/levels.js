// Level data and configuration

const LEVELS = {
    level1: {
        name: "Gem Basics",
        gems: {
            type: "regular",
            target: 50,
            spawnRate: 0.2
        },
        obstacles: [],
        scoreThreshold: 1000,
        stars: {
            1: 1000,
            2: 2000,
            3: 3000
        }
    }
};

// Get level data
function getLevelData(levelNumber) {
    const levelKey = `level${levelNumber}`;
    return LEVELS[levelKey] || LEVELS.level1;
}

// Check if level exists
function levelExists(levelNumber) {
    const levelKey = `level${levelNumber}`;
    return LEVELS.hasOwnProperty(levelKey);
}
