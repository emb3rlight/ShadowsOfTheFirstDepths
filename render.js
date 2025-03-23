// render.js
import { party, dungeon, playerPos, mapRevealed, foughtMonsters, chestLocations, monsterLocations, currentFloor } from './game.js';

export function render(direction = 'up') {
    const dungeonCanvas = document.getElementById('dungeon-view').getContext('2d');
    const mapCanvas = document.getElementById('map-canvas').getContext('2d');
    const statsDiv = document.getElementById('party-stats');
    const equipmentDiv = document.getElementById('party-equipment');
    const tutorialDiv = document.getElementById('tutorial-text');

    // Clear canvases
    dungeonCanvas.clearRect(0, 0, 900, 700);
    mapCanvas.clearRect(0, 0, 300, 300);

    // Dungeon view - 3D rendering
    dungeonCanvas.fillStyle = '#333';
    dungeonCanvas.fillRect(0, 0, 900, 700);

    let aheadX = playerPos.x;
    let aheadY = playerPos.y;
    if (direction === 'up') aheadY--;
    else if (direction === 'down') aheadY++;
    else if (direction === 'left') aheadX--;
    else if (direction === 'right') aheadX++;

    let tileAhead = 'wall';
    if (aheadX >= 0 && aheadX < 10 && aheadY >= 0 && aheadY < 10) {
        tileAhead = dungeon[aheadY][aheadX];
    }

    if (tileAhead === 'floor' || tileAhead === 'entrance') {
        dungeonCanvas.fillStyle = '#555';
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(200, 700);
        dungeonCanvas.lineTo(700, 700);
        dungeonCanvas.lineTo(600, 100);
        dungeonCanvas.lineTo(300, 100);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();

        dungeonCanvas.fillStyle = '#777';
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(0, 700);
        dungeonCanvas.lineTo(200, 700);
        dungeonCanvas.lineTo(300, 100);
        dungeonCanvas.lineTo(0, 100);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();

        dungeonCanvas.fillStyle = '#777';
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(700, 700);
        dungeonCanvas.lineTo(900, 700);
        dungeonCanvas.lineTo(900, 100);
        dungeonCanvas.lineTo(600, 100);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();
    } else if (tileAhead === 'wall') {
        dungeonCanvas.fillStyle = '#666';
        dungeonCanvas.fillRect(0, 100, 900, 600);
        dungeonCanvas.fillStyle = 'rgba(0, 0, 0, 0.3)';
        dungeonCanvas.fillRect(0, 100, 900, 300);
    } else if (tileAhead === 'stairs') {
        for (let i = 0; i < 5; i++) {
            dungeonCanvas.fillStyle = '#888';
            dungeonCanvas.fillRect(200 + i * 50, 700 - i * 120, 500 - i * 100, 120);
            dungeonCanvas.fillStyle = '#666';
            dungeonCanvas.fillRect(200 + i * 50, 700 - i * 120 - 20, 500 - i * 100, 20);
        }
    } else if (tileAhead === 'chest') {
        dungeonCanvas.fillStyle = '#8B4513';
        dungeonCanvas.fillRect(350, 400, 200, 200);
        dungeonCanvas.fillStyle = '#A0522D';
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(350, 400);
        dungeonCanvas.lineTo(550, 400);
        dungeonCanvas.lineTo(600, 350);
        dungeonCanvas.lineTo(300, 350);
        dungeonCanvas.closePath();
        dungeonCanvas.fill();
        dungeonCanvas.fillStyle = '#FFD700';
        dungeonCanvas.fillRect(440, 480, 20, 40);
    } else if (tileAhead === 'monster' && !foughtMonsters[aheadY][aheadX]) {
        dungeonCanvas.fillStyle = '#FF0000';
        dungeonCanvas.beginPath();
        dungeonCanvas.arc(450, 350, 30, 0, Math.PI * 2);
        dungeonCanvas.fill();
        dungeonCanvas.strokeStyle = '#FF0000';
        dungeonCanvas.lineWidth = 5;
        dungeonCanvas.beginPath();
        dungeonCanvas.moveTo(450, 380);
        dungeonCanvas.lineTo(450, 500);
        dungeonCanvas.moveTo(450, 400);
        dungeonCanvas.lineTo(400, 450);
        dungeonCanvas.moveTo(450, 400);
        dungeonCanvas.lineTo(500, 450);
        dungeonCanvas.moveTo(450, 500);
        dungeonCanvas.lineTo(400, 600);
        dungeonCanvas.moveTo(450, 500);
        dungeonCanvas.lineTo(500, 600);
        dungeonCanvas.stroke();
    } else if (tileAhead === 'exit') {
        let gradient = dungeonCanvas.createRadialGradient(450, 350, 50, 450, 350, 200);
        gradient.addColorStop(0, '#00FF00');
        gradient.addColorStop(1, '#006600');
        dungeonCanvas.fillStyle = gradient;
        dungeonCanvas.beginPath();
        dungeonCanvas.arc(450, 350, 150, 0, Math.PI * 2);
        dungeonCanvas.fill();
    }

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