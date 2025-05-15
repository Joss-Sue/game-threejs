import { enemy1s } from './enemy1.js';
import { enemy2s } from './enemy2.js';

const velocidad1 = 0.5;
const velocidad2 = 0.3;

export function actualizarEnemigos(jugador, deltaTime) {
    moverEnemigos(enemy1s, jugador, velocidad1, deltaTime);
    moverEnemigos(enemy2s, jugador, velocidad2, deltaTime);
}

function moverEnemigos(enemigos, jugador, velocidad, deltaTime) {
    enemigos.forEach((enemigo) => {
        if (!enemigo) return;

        enemigo.lookAt(jugador.position);
        enemigo.translateZ(velocidad * deltaTime);
    });
}
