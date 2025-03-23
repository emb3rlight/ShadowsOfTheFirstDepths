// movement.js
import { dungeon, playerPos, mapRevealed, foughtMonsters, currentFloor, totalFloors, combatLog, victoryScreen, chestLocations, monsterLocations, party, startTime } from './game.js';
import { openChest, startCombat } from './combat.js';
import { generateDungeon } from './dungeon.js';
import { render } from './render.js';
import { resetGame } from './game.js'; // Added explicitly

export function move(key) {
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
        playerPos.x = newPos.x;
        playerPos.y = newPos.y;
        mapRevealed[newPos.y][newPos.x] = true;
        checkTile(direction);
    }
    render(direction);
}

export function checkTile(direction) {
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

function nextFloor() {
    currentFloor++;
    combatLog.innerText += `You ascend to Floor ${currentFloor}!\n`;
    dungeon = generateDungeon(currentFloor, chestLocations, monsterLocations);
    playerPos.x = 5;
    playerPos.y = 9;
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