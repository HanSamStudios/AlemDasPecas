const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.port || 3000

io.on('connection', (socket) => {
  console.log(`Usuário ${socket.id} conectado no servidor`)
socket.on("entrar-na-sala", (sala) => {
  const salaAtualAntesDeEntrar = io.sockets.adapter.rooms.get(sala);
  const numJogadoresAntesDeEntrar = salaAtualAntesDeEntrar ? salaAtualAntesDeEntrar.size : 0;

  socket.join(sala);
  console.log(`Usuário ${socket.id} entrou na sala ${sala}`);

  const jogadoresNaSala = Array.from(io.sockets.adapter.rooms.get(sala));
  // const numJogadoresAtualizado = jogadoresNaSala.length; // Não precisamos desta para a condição agora

  // *** MUDANÇA AQUI: ENVIAR A LISTA COMPLETA DE JOGADORES ***
  // Em vez de um objeto com 'primeiro' e 'segundo', envie o array completo.
  io.to(sala).emit("jogadores", jogadoresNaSala); // <--- MUDANÇA IMPORTANTE AQUI

  // Se havia 2 ou mais jogadores ANTES deste socket entrar,
  // significa que este jogador é o 3º ou subsequente.
  if (numJogadoresAntesDeEntrar >= 2) {
    console.log(`[SERVIDOR] Jogador ${socket.id} é o ${numJogadoresAntesDeEntrar + 1}º na sala ${sala}. Enviando 'sala-cheia-individual'.`);
    socket.emit("sala-cheia-individual");
  }
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

  socket.on('disconnect', () => {
    console.log(`Usuário ${socket.id} desconectado do servidor`)
  })
})

app.use(express.static('cliente/'))
server.listen(port, () => {
  console.log('Servidor rodando!')
})