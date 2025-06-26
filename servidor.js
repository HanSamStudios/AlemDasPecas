const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.port || 3000

io.on('connection', (socket) => {
  console.log(`Usuário ${socket.id} conectado no servidor`)

  socket.on("entrar-na-sala", (sala) => {
    const salaAtual = io.sockets.adapter.rooms.get(sala);
    const numJogadores = salaAtual ? salaAtual.size : 0;
    console.log(`Número de jogadores na sala ${sala}: ${numJogadores}`);

    if (numJogadores >= 3) {
      console.log(`Sala ${sala} está cheia.`);
      // Sala cheia, avisa o jogador
      socket.emit("sala-cheia");
      return;
    }

    // Adiciona o jogador à sala somente se não estiver cheia
    socket.join(sala);
    console.log(`Usuário ${socket.id} entrou na sala ${sala}`);

    let jogadores = {};
    if (io.sockets.adapter.rooms.get(sala).size === 1) {
      jogadores = {
        primeiro: socket.id,
        segundo: undefined,
      };
    } else if (io.sockets.adapter.rooms.get(sala).size === 2) {
      const [primeiro] = io.sockets.adapter.rooms.get(sala);
      jogadores = {
        primeiro,
        segundo: socket.id,
      };
    }
    io.to(sala).emit("jogadores", jogadores);
  })

  socket.on("offer", (sala, description) => { 
    socket.to(sala).emit("offer", description)
  })
  socket.on("answer", (sala, description) => {
    socket.to(sala).emit("answer", description)
   })
  socket.on("candidate", (sala, candidate) => { 
    socket.to(sala).emit("candidate", candidate)
  })

  socket.on('disconnect', (socket) => {
    console.log(`Usuário ${socket.id} desconectado do servidor`)
  })
})

app.use(express.static('cliente/'))
server.listen(port, () => {
  console.log('Servidor rodando!')
})