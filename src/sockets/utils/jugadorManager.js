const jugadoresPorSala = {};

export function getSala(sala) {
  if (!jugadoresPorSala[sala]) {
    jugadoresPorSala[sala] = {
      jugadores: {},
      numerosDisponibles: [1, 2],
    };
  }
  return jugadoresPorSala[sala];
}

export function addJugador(sala, socketId, nombre) {
  const salaData = getSala(sala);

  if (salaData.numerosDisponibles.length === 0) return null;

  const numero = salaData.numerosDisponibles.shift();
  salaData.jugadores[socketId] = {
    id: socketId,
    nombre,
    numero,
    posicion: null,
    rotacion: null,
  };

  return {
    jugador: {
      id: socketId,
      nombre,
      numero,
    },
    jugadores: Object.values(salaData.jugadores).map(j => ({
      id: j.id,
      nombre: j.nombre,
      numero: j.numero,
    })),
  };
}

export function updateEstadoJugador(sala, socketId, estado) {
  const jugador = jugadoresPorSala[sala]?.jugadores[socketId];
  if (!jugador) return null;

  jugador.posicion = estado.posicion;
  jugador.rotacion = estado.rotacion;

  return {
    id: socketId,
    numero: jugador.numero,
    posicion: estado.posicion,
    rotacion: estado.rotacion,
  };
}

export function removeJugador(sala, socketId) {
  const salaData = jugadoresPorSala[sala];
  if (!salaData) return null;

  const jugador = salaData.jugadores[socketId];
  if (!jugador) return null;

  delete salaData.jugadores[socketId];
  salaData.numerosDisponibles.push(jugador.numero);

  const jugadoresRestantes = Object.values(salaData.jugadores).map(j => ({
    id: j.id,
    nombre: j.nombre,
    numero: j.numero,
  }));

  if (Object.keys(salaData.jugadores).length === 0) {
    delete jugadoresPorSala[sala];
  }

  return {
    numero: jugador.numero,
    jugadoresRestantes,
  };
}
