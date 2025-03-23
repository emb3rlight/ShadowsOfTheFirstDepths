// combat.js
import { party, combatLog, dungeon, playerPos } from './game.js';
import { resetGame } from './game.js';
import { render } from './render.js'; // Fixed import

export function openChest() {
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

export function startCombat() {
    let enemy = { hp: 20, str: 8, def: 5, spd: Math.floor(Math.random() * 5) + 1 };
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