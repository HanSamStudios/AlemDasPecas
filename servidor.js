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

  if (numJogadores >= 2) {
    socket.emit("sala-cheia");
    return;
  }

  socket.join(sala);
  console.log(`Usuário ${socket.id} entrou na sala ${sala}`);

  const jogadoresNaSala = Array.from(io.sockets.adapter.rooms.get(sala));
  let jogadores = {
    primeiro: jogadoresNaSala[0],
    segundo: jogadoresNaSala[1]
  };

  io.to(sala).emit("jogadores", jogadores);
});

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