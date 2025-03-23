// dungeon.js
export function generateDungeon(floor, chestLocations, monsterLocations) {
    let grid = Array(10).fill().map(() => Array(10).fill('floor'));
    
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (Math.random() < 0.3 && !(x === 5 && y === 9)) {
                grid[y][x] = 'wall';
            }
        }
    }
    
    grid[9][5] = 'entrance';
    placeRandomTiles(grid, 'chest', 2, chestLocations, monsterLocations);
    placeRandomTiles(grid, 'monster', 2, chestLocations, monsterLocations);
    placeRandomTiles(grid, 'chest', Math.floor(Math.random() * 2) + 1, chestLocations, monsterLocations);
    placeRandomTiles(grid, 'monster', Math.floor(Math.random() * 2) + 1, chestLocations, monsterLocations);

    let stairsPos = { x: 0, y: 0 }; // Default to (0,0) for visibility
    if (floor < 5) {
        do {
            stairsPos.x = Math.floor(Math.random() * 10);
            stairsPos.y = Math.floor(Math.random() * 10);
        } while (grid[stairsPos.y][stairsPos.x] !== 'floor' || (stairsPos.x === 5 && stairsPos.y === 9));
        grid[stairsPos.y][stairsPos.x] = 'stairs';
    } else {
        grid[9][9] = 'exit';
        stairsPos = { x: 9, y: 9 };
    }

    let start = { x: 5, y: 9 };
    let current = { x: start.x, y: start.y };
    let visited = new Set();
    while (current.x !== stairsPos.x || current.y !== stairsPos.y) {
        visited.add(`${current.x},${current.y}`);
        grid[current.y][current.x] = 'floor';
        if (current.x < stairsPos.x) current.x++;
        else if (current.x > stairsPos.x) current.x--;
        else if (current.y < stairsPos.y) current.y++;
        else if (current.y > stairsPos.y) current.y--;
        if (visited.has(`${current.x},${current.y}`)) break;
    }
    grid[9][5] = 'entrance';
    if (floor < 5) {
        grid[stairsPos.y][stairsPos.x] = 'stairs'; // Ensure stairs persist
    } else {
        grid[9][9] = 'exit';
    }

    return grid;
}

export function placeRandomTiles(grid, type, count, chestLocations, monsterLocations) {
    while (count > 0) {
        let x = Math.floor(Math.random() * 10);
        let y = Math.floor(Math.random() * 10);
        if (grid[y][x] === 'floor' && !(x === 5 && y === 9) && !(x === 9 && y === 9)) {
            grid[y][x] = type;
            if (type === 'chest') chestLocations[y][x] = true;
            if (type === 'monster') monsterLocations[y][x] = true;
            count--;
        }
    }
}