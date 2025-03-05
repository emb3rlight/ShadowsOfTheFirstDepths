// Game State
let party = {
    fighter: { level: 1, hp: 50, str: 15, def: 10, mag: 5, spd: 10, weapon: 'Wooden Sword', armor: 'Leather Armor' },
    cleric: { level: 1, hp: 35, str: 5, def: 8, mag: 15, spd: 10, weapon: 'Simple Staff', armor: 'Cloth Robe' },
    mage: { level: 1, hp: 25, str: 5, def: 5, mag: 20, spd: 10, weapon: 'Basic Wand', armor: 'Cloth Robe' },
    hunter: { level: 1, hp: 40, str: 10, def: 7, mag: 5, spd: 10, weapon: 'Short Bow', armor: 'Leather Armor' }
};
let dungeon = [];
let playerPos = { x: 5, y: 9 }; // Spawn at entrance (5, 9)
let mapRevealed = Array(10).fill().map(() => Array(10).fill(false));
let foughtMonsters = Array(10).fill().map(() => Array(10).fill(false));
let chestLocations = Array(10).fill().map(() => Array(10).fill(false));
let monsterLocations = Array(10).fill().map(() => Array(10).fill(false));
let currentFloor = 1;
let totalFloors = 5;
let startTime = Date.now();
let combatLog = document.getElementById('combat-log');
let victoryScreen = document.getElementById('victory-screen');

// Dungeon Generation
function generateDungeon(floor) {
    let grid = Array(10).fill().map(() => Array(10).fill('floor'));
    
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (Math.random() < 0.3 && !(x === 5 && y === 9)) {
                grid[y][x] = 'wall';
            }
        }
    }
    
    grid[9][5] = 'entrance';
    placeRandomTiles(grid, 'chest', 2);
    placeRandomTiles(grid, 'monster', 2);
    placeRandomTiles(grid, 'chest', Math.floor(Math.random() * 2) + 1);
    placeRandomTiles(grid, 'monster', Math.floor(Math.random() * 2) + 1);

    let stairsPos = { x: 5, y: 4 };
    if (floor < totalFloors) {
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
    if (floor < totalFloors) {
        grid[stairsPos.y][stairsPos.x] = 'stairs';
    } else {
        grid[9][9] = 'exit';
    }

    return grid;
}

function placeRandomTiles(grid, type, count) {
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

// Movement with WASD
function move(key) {
    let newPos = { x: playerPos.x, y: playerPos.y };
    let direction = '';

    if (key === 'w') {
        if (playerPos.y > 0) { newPos.y--; direction = 'up'; }
    } else if (key === 's') {
        if (playerPos.y < 9) { newPos.y++; direction = 'down'; }
    } else if (key === 'a') {
        if (playerPos.x > 0) { newPos.x--; direction = 'left'; }
    } else if (key === 'd') {
        if (playerPos.x < 9) { newPos.x++; direction = 'right'; }
    }

    if (dungeon[newPos.y][newPos.x] !== 'wall') {
        playerPos = newPos;
        mapRevealed[newPos.y][newPos.x] = true;
        checkTile(direction);
    }
    render(direction);
}

// Keyboard Input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': move('w'); break;
        case 'a': move('a'); break;
        case 's': move('s'); break;
        case 'd': move('d'); break;
    }
});

// Tile Interactions
function checkTile(direction) {
    let tile = dungeon[playerPos.y][playerPos.x];
    if (tile === 'chest') {
        openChest();
    } else if (tile === 'monster' && !foughtMonsters[playerPos.y][playerPos.x]) {
        startCombat();
        foughtMonsters[playerPos.y][playerPos.x] = true;
        dungeon[playerPos.y][playerPos.x] = 'floor';
    } else if (tile === 'stairs') {
        nextFloor();
    } else if (tile === 'exit' && currentFloor === totalFloors) {
        endGame();
    }
}

function openChest() {
    const items = [
        { name: 'Steel Sword', stat: 'str', boost: Math.floor(Math.random() * 5) + 1, target: 'fighter' },
        { name: 'Holy Staff', stat: 'mag', boost: Math.floor(Math.random() * 5) + 1, target: 'cleric' },
        { name: 'Magic Wand', stat: 'mag', boost: Math.floor(Math.random() * 5) + 1, target: 'mage' },
        { name: 'Swift Bow', stat: 'spd', boost: Math.floor(Math.random() * 5) + 1, target: 'hunter' },
        { name: 'Wind Cloak', stat: 'spd', boost: Math.floor(Math.random() * 5) + 1, target: 'hunter' },
        { name: 'Iron Armor', stat: 'def', boost: Math.floor(Math.random() * 5) + 1, target: 'fighter' }
    ];
    let item = items[Math.floor(Math.random() * items.length)];
    combatLog.innerText += `Found ${item.name} (+${item.boost} ${item.stat.toUpperCase()})! Assigned to ${item.target}.\n`;
    party[item.target][item.stat] += item.boost;
    if (item.name.includes('Armor') || item.name.includes('Cloak')) {
        party[item.target].armor = item.name;
    } else {
        party[item.target].weapon = item.name;
    }
    dungeon[playerPos.y][playerPos.x] = 'floor';
}

function startCombat() {
    let enemy = { hp: 20, str: 8, def: 5, spd: Math.floor(Math.random() * 5) + 8 };
    let combatants = [
        { name: 'Fighter', obj: party.fighter },
        { name: 'Cleric', obj: party.cleric },
        { name: 'Mage', obj: party.mage },
        { name: 'Hunter', obj: party.hunter },
        { name: 'Goblin', obj: enemy }
    ];
    
    combatants.sort((a, b) => b.obj.spd - a.obj.spd);
    
    combatLog.innerText += 'A Goblin appears!\n';
    for (let combatant of combatants) {
        if (combatant.name === 'Goblin' && enemy.hp > 0) {
            let targets = [party.fighter, party.cleric, party.mage, party.hunter];
            let target = targets[Math.floor(Math.random() * targets.length)];
            let damage = Math.floor(Math.random() * 3) + 1;
            target.hp = Math.max(0, target.hp - damage);
            combatLog.innerText += `Goblin deals ${damage} damage to ${combatant.name === 'Fighter' ? 'Fighter' : combatant.name === 'Cleric' ? 'Cleric' : combatant.name === 'Mage' ? 'Mage' : 'Hunter'}. ${combatant.name === 'Fighter' ? 'Fighter' : combatant.name === 'Cleric' ? 'Cleric' : combatant.name === 'Mage' ? 'Mage' : 'Hunter'} HP: ${target.hp}\n`;
            if (target.hp <= 0) {
                combatLog.innerText += `${combatant.name === 'Fighter' ? 'Fighter' : combatant.name === 'Cleric' ? 'Cleric' : combatant.name === 'Mage' ? 'Mage' : 'Hunter'} has fallen! Party defeated.\n`;
                setTimeout(resetGame, 2000);
                return;
            }
        } else if (enemy.hp > 0) {
            let damage = Math.max(0, combatant.obj.str - enemy.def);
            enemy.hp -= damage;
            combatLog.innerText += `${combatant.name} deals ${damage} damage to Goblin. Goblin HP: ${enemy.hp}\n`;
        }
        if (enemy.hp <= 0) {
            combatLog.innerText += 'Goblin defeated! +10 EXP\n';
            break;
        }
    }
    render();
}

function nextFloor() {
    currentFloor++;
    combatLog.innerText += `You ascend to Floor ${currentFloor}!\n`;
    dungeon = generateDungeon(currentFloor);
    playerPos = { x: 5, y: 9 };
    mapRevealed = Array(10).fill().map(() => Array(10).fill(false));
    foughtMonsters = Array(10).fill().map(() => Array(10).fill(false));
    chestLocations = Array(10).fill().map(() => Array(10).fill(false));
    monsterLocations = Array(10).fill().map(() => Array(10).fill(false));
    mapRevealed[9][5] = true;
    render();
}

function endGame() {
    let endTime = Date.now();
    let timeTaken = Math.floor((endTime - startTime) / 1000);
    let minutes = Math.floor(timeTaken / 60);
    let seconds = timeTaken % 60;

    victoryScreen.style.display = 'block';
    document.getElementById('final-stats').innerHTML = `
        <p>Floors Conquered: ${currentFloor}</p>
        <p>Time Taken: ${minutes}m ${seconds}s</p>
        <p>Final Party Stats:</p>
        Fighter (Lv ${party.fighter.level}): HP ${party.fighter.hp}, STR ${party.fighter.str}, DEF ${party.fighter.def}, SPD ${party.fighter.spd}<br>
        Cleric (Lv ${party.cleric.level}): HP ${party.cleric.hp}, MAG ${party.cleric.mag}, SPD ${party.cleric.spd}<br>
        Mage (Lv ${party.mage.level}): HP ${party.mage.hp}, MAG ${party.mage.mag}, SPD ${party.mage.spd}<br>
        Hunter (Lv ${party.hunter.level}): HP ${party.hunter.hp}, STR ${party.hunter.str}, SPD ${party.hunter.spd}
    `;
    document.getElementById('reset-button').addEventListener('click', resetGame);
}

function resetGame() {
    party = {
        fighter: { level: 1, hp: 50, str: 15, def: 10, mag: 5, spd: 10, weapon: 'Wooden Sword', armor: 'Leather Armor' },
        cleric: { level: 1, hp: 35, str: 5, def: 8, mag: 15, spd: 10, weapon: 'Simple Staff', armor: 'Cloth Robe' },
        mage: { level: 1, hp: 25, str: 5, def: 5, mag: 20, spd: 10, weapon: 'Basic Wand', armor: 'Cloth Robe' },
        hunter: { level: 1, hp: 40, str: 10, def: 7, mag: 5, spd: 10, weapon: 'Short Bow', armor: 'Leather Armor' }
    };
    currentFloor = 1;
    startTime = Date.now();
    dungeon = generateDungeon(currentFloor);
    playerPos = { x: 5, y: 9 };
    mapRevealed = Array(10).fill().map(() => Array(10).fill(false));
    foughtMonsters = Array(10).fill().map(() => Array(10).fill(false));
    chestLocations = Array(10).fill().map(() => Array(10).fill(false));
    monsterLocations = Array(10).fill().map(() => Array(10).fill(false));
    mapRevealed[9][5] = true;
    combatLog.innerText = '';
    victoryScreen.style.display = 'none';
    render();
}

// Rendering with 3D visuals
function render(direction = 'up') {
    const dungeonCanvas = document.getElementById('dungeon-view').getContext('2d');
    const mapCanvas = document.getElementById('map-canvas').getContext('2d');
    const statsDiv = document.getElementById('party-stats');
    const equipmentDiv = document.getElementById('party-equipment');
    const tutorialDiv = document.getElementById('tutorial-text');

    // Clear canvases
    dungeonCanvas.clearRect(0, 0, 900, 700);
    mapCanvas.clearRect(0, 0, 300, 300);

    // Dungeon view - 3D rendering
    dungeonCanvas.fillStyle = '#333'; // Dark background
    dungeonCanvas.fillRect(0, 0, 900, 700);

    // Determine tiles ahead based on direction
    let aheadX = playerPos.x;
    let aheadY = playerPos.y;
    if (direction === 'up') aheadY--;
    else if (direction === 'down') aheadY++;
    else if (direction === 'left') aheadX--;
    else if (direction === 'right') aheadX++;

    // Check bounds and get tile ahead
    let tileAhead = 'wall';
    if (aheadX >= 0 && aheadX < 10 && aheadY >= 0 && aheadY < 10) {
        tileAhead = dungeon[aheadY][aheadX];
    }

    // Draw based on tile ahead
    if (tileAhead === 'floor' || tileAhead === 'entrance') {
        // Corridor (trapezoid for 3D effect)
        dungeonCanvas.fillStyle = '#555'; // Floor
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(200, 700); // Bottom left
        dungeonCanvas.lineTo(700, 700); // Bottom right
        dungeonCanvas.lineTo(600, 100); // Top right
        dungeonCanvas.lineTo(300, 100); // Top left
        dungeonCanvas.closePath();
        dungeonCanvas.fill();

        // Walls
        dungeonCanvas.fillStyle = '#777'; // Left wall
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(0, 700);
        dungeonCanvas.lineTo(200, 700);
        dungeonCanvas.lineTo(300, 100);
        dungeonCanvas.lineTo(0, 100);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();

        dungeonCanvas.fillStyle = '#777'; // Right wall
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(700, 700);
        dungeonCanvas.lineTo(900, 700);
        dungeonCanvas.lineTo(900, 100);
        dungeonCanvas.lineTo(600, 100);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();
    } else if (tileAhead === 'wall') {
        // Wall (full rectangle with shading)
        dungeonCanvas.fillStyle = '#666';
        dungeonCanvas.fillRect(0, 100, 900, 600);
        dungeonCanvas.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Shadow
        dungeonCanvas.fillRect(0, 100, 900, 300);
    } else if (tileAhead === 'stairs') {
        // Stairs (stepped blocks)
        for (let i = 0; i < 5; i++) {
            dungeonCanvas.fillStyle = '#888';
            dungeonCanvas.fillRect(200 + i * 50, 700 - i * 120, 500 - i * 100, 120);
            dungeonCanvas.fillStyle = '#666'; // Top face shading
            dungeonCanvas.fillRect(200 + i * 50, 700 - i * 120 - 20, 500 - i * 100, 20);
        }
    } else if (tileAhead === 'chest') {
        // Chest (3D box)
        dungeonCanvas.fillStyle = '#8B4513'; // Brown body
        dungeonCanvas.fillRect(350, 400, 200, 200);
        dungeonCanvas.fillStyle = '#A0522D'; // Lid
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(350, 400);
        dungeonCanvas.lineTo(550, 400);
        dungeonCanvas.lineTo(600, 350);
        dungeonCanvas.lineTo(300, 350);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();
        dungeonCanvas.fillStyle = '#FFD700'; // Gold latch
        dungeonCanvas.fillRect(440, 480, 20, 40);
    } else if (tileAhead === 'monster' && !foughtMonsters[aheadY][aheadX]) {
        // Monster (stick figure)
        dungeonCanvas.fillStyle = '#FF0000';
        dungeonCanvas.beginPath();
        dungeonCanvas.arc(450, 350, 30, 0, Math.PI * 2); // Head
        dungeonCanvas.fill();
        dungeonCanvas.strokeStyle = '#FF0000';
        dungeonCanvas.lineWidth = 5;
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(450, 380); // Body
        dungeonCanvas.lineTo(450, 500);
        dungeonCanvas.moveTo(450, 400); // Arms
        dungeonCanvas.lineTo(400, 450);
        dungeonCanvas.moveTo(450, 400);
        dungeonCanvas.lineTo(500, 450);
        dungeonCanvas.moveTo(450, 500); // Legs
        dungeonCanvas.lineTo(400, 600);
        dungeonCanvas.moveTo(450, 500);
        dungeonCanvas.lineTo(500, 600);
        dungeonCanvas.stroke();
    } else if (tileAhead === 'exit') {
        // Exit (glowing portal)
        let gradient = dungeonCanvas.createRadialGradient(450, 350, 50, 450, 350, 200);
        gradient.addColorStop(0, '#00FF00');
        gradient.addColorStop(1, '#006600');
        dungeonCanvas.fillStyle = gradient;
        dungeonCanvas.beginPath();
        dungeonCanvas.arc(450, 350, 150, 0, Math.PI * 2);
        dungeonCanvas.fill();
    }

    // Overlay floor and position text
    dungeonCanvas.fillStyle = 'white';
    dungeonCanvas.font = '20px Arial';
    dungeonCanvas.fillText(`Floor ${currentFloor} - Position: (${playerPos.x}, ${playerPos.y})`, 10, 30);

    // Mini-map
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (mapRevealed[y][x]) {
                mapCanvas.fillStyle = dungeon[y][x] === 'wall' ? 'gray' : 'white';
                mapCanvas.fillRect(x * 30, y * 30, 28, 28);
                mapCanvas.strokeStyle = 'black';
                mapCanvas.lineWidth = 1;
                mapCanvas.strokeRect(x * 30, y * 30, 28, 28);

                if (x === 5 && y === 9) {
                    mapCanvas.fillStyle = 'orange';
                    mapCanvas.fillRect(x * 30 + 8, y * 30 + 8, 12, 12);
                } else if (chestLocations[y][x]) {
                    mapCanvas.fillStyle = 'green';
                    mapCanvas.fillRect(x * 30 + 8, y * 30 + 8, 12, 12);
                } else if (monsterLocations[y][x]) {
                    mapCanvas.fillStyle = 'red';
                    mapCanvas.fillRect(x * 30 + 8, y * 30 + 8, 12, 12);
                } else if (dungeon[y][x] === 'stairs') {
                    mapCanvas.fillStyle = 'purple';
                    mapCanvas.fillRect(x * 30 + 8, y * 30 + 8, 12, 12);
                } else if (dungeon[y][x] === 'exit') {
                    mapCanvas.fillStyle = 'green';
                    mapCanvas.fillRect(x * 30 + 8, y * 30 + 8, 12, 12);
                }
            }
        }
    }
    mapCanvas.fillStyle = 'blue';
    mapCanvas.fillRect(playerPos.x * 30, playerPos.y * 30, 28, 28);

    // Party stats
    statsDiv.innerHTML = `
        Fighter (Lv ${party.fighter.level}): HP ${party.fighter.hp}, STR ${party.fighter.str}, DEF ${party.fighter.def}, SPD ${party.fighter.spd}<br>
        Cleric (Lv ${party.cleric.level}): HP ${party.cleric.hp}, MAG ${party.cleric.mag}, SPD ${party.cleric.spd}<br>
        Mage (Lv ${party.mage.level}): HP ${party.mage.hp}, MAG ${party.mage.mag}, SPD ${party.mage.spd}<br>
        Hunter (Lv ${party.hunter.level}): HP ${party.hunter.hp}, STR ${party.hunter.str}, SPD ${party.hunter.spd}
    `;

    // Party equipment
    equipmentDiv.innerHTML = `
        <h3>Party Equipment</h3>
        Fighter:<br>- Weapon: ${party.fighter.weapon || 'None'}<br>- Armor: ${party.fighter.armor || 'None'}<br>
        Cleric:<br>- Weapon: ${party.cleric.weapon || 'None'}<br>- Armor: ${party.cleric.armor || 'None'}<br>
        Mage:<br>- Weapon: ${party.mage.weapon || 'None'}<br>- Armor: ${party.mage.armor || 'None'}<br>
        Hunter:<br>- Weapon: ${party.hunter.weapon || 'None'}<br>- Armor: ${party.hunter.armor || 'None'}
    `;

    // Tutorial text
    tutorialDiv.innerHTML = `
        <h3>Tutorial</h3>
        <p><b>Controls:</b> Use WASD to move - W (up), A (left), S (down), D (right).</p>
        <p><b>Objective:</b> Navigate 5 floors to reach the exit. Find stairs (purple) on each floor to ascend.</p>
        <p><b>Game Over:</b> If any party member’s HP reaches 0, the game restarts.</p>
        <p><b>Elements:</b></p>
        <ul>
            <li><b>Monsters (red):</b> Fight them once; defeated tiles become normal floors.</li>
            <li><b>Chests (green):</b> Open for equipment to boost stats.</li>
            <li><b>Entrance (orange):</b> Your starting point each floor.</li>
            <li><b>Exit (green):</b> Reach it on Floor 5 to win!</li>
        </ul>
    `;
}

// Initialize
dungeon = generateDungeon(currentFloor);
mapRevealed[9][5] = true;
render();