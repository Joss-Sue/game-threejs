import Score  from '../db/models/scoreModel.js';
const jugadoresPorSala = {};
const resultadosPorSala = {};

function configurarJuegoSockets(io, socket, user, sala) {
  console.log(sala,"Este es de configurar");
  if (!jugadoresPorSala[sala]) {
    jugadoresPorSala[sala] = {
      jugadores: {},
      numerosDisponibles: [1, 2],
      vidas: {
        1: 100,
        2: 100,
      },
      enemigo: {
        vida: 1000,
        activo: true,
      }
    };
  }

  const salaData = jugadoresPorSala[sala];

  if (salaData.numerosDisponibles.length === 0) {
    socket.emit('salaLlena');
    return;
  }

  const numeroJugador = salaData.numerosDisponibles.shift();

  salaData.jugadores[socket.id] = {
    id: socket.id,
    nombre: user.nombre,
    numero: numeroJugador,
    posicion: null,
    rotacion: null,
  };

  socket.emit('info-jugador', {
    id: socket.id,
    nombre: user.nombre,
    numero: numeroJugador,
    vidas: salaData.vidas,
    enemigo: salaData.enemigo,
  });

  const jugadores = Object.values(salaData.jugadores).map(j => ({
    id: j.id,
    nombre: j.nombre,
    numero: j.numero,
  }));

  io.to(sala).emit('jugadores-actualizados', jugadores);

  socket.on('estadoJugador', (estado) => {
    const jugador = salaData.jugadores[socket.id];
    if (jugador) {
      jugador.posicion = estado.posicion;
      jugador.rotacion = estado.rotacion;

      socket.to(sala).emit('estado-remoto', {
        id: socket.id,
        numero: jugador.numero,
        posicion: estado.posicion,
        rotacion: estado.rotacion
      });
    }
  });

  socket.on('danioJugador', ({ numeroJugador, danio,tipo }) => {
    if (!salaData.vidas[numeroJugador]) return;
    if(tipo){
      salaData.vidas[numeroJugador] = Math.max(0, salaData.vidas[numeroJugador] + danio);
    }else{
      salaData.vidas[numeroJugador] = Math.max(0, salaData.vidas[numeroJugador] - danio);
      
    }

    io.to(sala).emit('estado-vidas-actualizado', {
      vidas: salaData.vidas,
      enemigo: salaData.enemigo,
    });
  });

  socket.on('danioEnemigo', ({ danio }) => {
    if (!salaData.enemigo.activo) return;

    salaData.enemigo.vida = Math.max(0, salaData.enemigo.vida - danio);

    if (salaData.enemigo.vida <= 0) {
      salaData.enemigo.activo = false;
    }

    io.to(sala).emit('estado-vidas-actualizado', {
      vidas: salaData.vidas,
      enemigo: salaData.enemigo,
    });
  });

 // Esto debe estar definido en un scope superior si no lo estaba

socket.on('orbesRecolectadas', async (dataRoom) => {
  if (!dataRoom || !dataRoom.sala) {
    console.warn('⚠️ Evento recibido sin datos válidos:', dataRoom);
    return;
  }

  const sala = dataRoom.sala;
  resultadosPorSala[sala] = resultadosPorSala[sala] || [];

  // Solo guardar si el nombre aún no está registrado en esta sala
  const nombreYaRegistrado = resultadosPorSala[sala].some(r => r.nombre === dataRoom.nombre);
  if (!nombreYaRegistrado) {
    resultadosPorSala[sala].push(dataRoom);

    console.log(`📩 Resultado registrado de ${dataRoom.nombre} (${dataRoom.jugador}) en sala ${sala}: ${dataRoom.orbes} orbes`);
    console.log(`📊 Estado actual de resultados en sala "${sala}":`, resultadosPorSala[sala]);
  } else {
    console.warn(`⚠️ Nombre duplicado "${dataRoom.nombre}" en sala ${sala}. Ignorado.`);
  }

  // Ejecutar lógica final solo si hay dos resultados únicos
  if (resultadosPorSala[sala].length === 2) {
    const [jugador1, jugador2] = resultadosPorSala[sala]; 

    let mensaje;
    if (jugador1.cantidad > jugador2.cantidad) {
      mensaje = `${jugador1.nombre} gana con ${jugador1.cantidad} orbes 🏆`;
      const data = {
        jugador: jugador1.nombre,
        rival: jugador2.nombre,
        puntaje: jugador1.cantidad
      };
      await Score.createScore(data);
    } else if (jugador2.cantidad > jugador1.cantidad) {
      const data = {
        jugador: jugador2.nombre,
        rival: jugador1.nombre,
        puntaje: jugador2.cantidad
      };
     await Score.createScore(data);
      mensaje = `${jugador2.nombre} gana con ${jugador2.cantidad} orbes 🏆`;
    } else {
      mensaje = `Empate con ${jugador1.cantidad} orbes cada uno 🤝`;
    }

    

    console.log(`🏁 Resultado final en sala "${sala}":`, mensaje);
    io.to(sala).emit('resultadoFinal', mensaje);

    // Limpiar resultados
    delete resultadosPorSala[sala];
    console.log(`🧹 Resultados eliminados para sala "${sala}"`);
  }
});


  socket.on('disconnect', () => {
    const jugador = salaData.jugadores[socket.id];
    if (!jugador) return;

    delete salaData.jugadores[socket.id];
    salaData.numerosDisponibles.push(jugador.numero);

    socket.to(sala).emit('jugadorDesconectado', jugador.numero);

    if (Object.keys(salaData.jugadores).length === 0) {
      delete jugadoresPorSala[sala];
    } else {
      const jugadoresRestantes = Object.values(salaData.jugadores).map(j => ({
        id: j.id,
        nombre: j.nombre,
        numero: j.numero,
      }));
      io.to(sala).emit('jugadores-actualizados', jugadoresRestantes);
    }
  });
}

export default configurarJuegoSockets;
