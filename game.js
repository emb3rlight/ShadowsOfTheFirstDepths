// game.js
import { generateDungeon } from './dungeon.js';
import { move, checkTile } from './movement.js';
import { render } from './render.js';

// Game State
export let party = {
    fighter: { level: 1, hp: 50, str: 15, def: 10, mag: 5, spd: 10, weapon: 'Wooden Sword', armor: 'Leather Armor' },
    cleric: { level: 1, hp: 35, str: 5, def: 8, mag: 15, spd: 10, weapon: 'Simple Staff', armor: 'Cloth Robe' },
    mage: { level: 1, hp: 25, str: 5, def: 5, mag: 20, spd: 10, weapon: 'Basic Wand', armor: 'Cloth Robe' },
    hunter: { level: 1, hp: 40, str: 10, def: 7, mag: 5, spd: 10, weapon: 'Short Bow', armor: 'Leather Armor' }
};
export let dungeon = [];
export let playerPos = { x: 5, y: 9 };
export let mapRevealed = Array(10).fill().map(() => Array(10).fill(false));
export let foughtMonsters = Array(10).fill().map(() => Array(10).fill(false));
export let chestLocations = Array(10).fill().map(() => Array(10).fill(false));
export let monsterLocations = Array(10).fill().map(() => Array(10).fill(false));
export let currentFloor = 1;
export const totalFloors = 5;
export let startTime = Date.now();
export let combatLog = document.getElementById('combat-log');
export let victoryScreen = document.getElementById('victory-screen');

export function resetGame() {
    party = {
        fighter: { level: 1, hp: 50, str: 15, def: 10, mag: 5, spd: 10, weapon: 'Wooden Sword', armor: 'Leather Armor' },
        cleric: { level: 1, hp: 35, str: 5, def: 8, mag: 15, spd: 10, weapon: 'Simple Staff', armor: 'Cloth Robe' },
        mage: { level: 1, hp: 25, str: 5, def: 5, mag: 20, spd: 10, weapon: 'Basic Wand', armor: 'Cloth Robe' },
        hunter: { level: 1, hp: 40, str: 10, def: 7, mag: 5, spd: 10, weapon: 'Short Bow', armor: 'Leather Armor' }
    };
    currentFloor = 1;
    startTime = Date.now();
    dungeon = generateDungeon(currentFloor, chestLocations, monsterLocations);
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

// Initialize
dungeon = generateDungeon(currentFloor, chestLocations, monsterLocations);
mapRevealed[9][5] = true;
render();

// Keyboard Input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': move('w'); break;
        case 'a': move('a'); break;
        case 's': move('s'); break;
        case 'd': move('d'); break;
    }
});