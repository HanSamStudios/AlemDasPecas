const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.port || 3000

io.on('connection', (socket) => {
  console.log(`Usuário ${socket.id} conectado no servidor`)

 socket.on("entrar-na-sala", (sala) => {
  // Obtém o número de jogadores ANTES deste socket entrar na sala
  const salaAtualAntesDeEntrar = io.sockets.adapter.rooms.get(sala);
  const numJogadoresAntesDeEntrar = salaAtualAntesDeEntrar ? salaAtualAntesDeEntrar.size : 0;

  // Permite o jogador entrar na sala
  socket.join(sala);
  console.log(`Usuário ${socket.id} entrou na sala ${sala}`);

  // Obtém a lista atualizada de jogadores na sala APÓS o novo jogador ter entrado
  const jogadoresNaSala = Array.from(io.sockets.adapter.rooms.get(sala));
  // const numJogadoresAtualizado = jogadoresNaSala.length; // Não precisamos desta para a condição agora

  let jogadores = {
    primeiro: jogadoresNaSala[0],
    segundo: jogadoresNaSala[1] || null
  };

  // Sempre emite a lista de jogadores para todos na sala (para os 2 primeiros iniciarem o jogo)
  io.to(sala).emit("jogadores", jogadores);

  // Se havia 2 ou mais jogadores ANTES deste socket entrar,
  // significa que este jogador é o 3º ou subsequente.
  if (numJogadoresAntesDeEntrar >= 2) {
    console.log(`[SERVIDOR] Jogador ${socket.id} é o ${numJogadoresAntesDeEntrar + 1}º na sala ${sala}. Enviando 'sala-cheia-individual'.`);
    socket.emit("sala-cheia-individual"); // Novo evento, enviado APENAS para o socket que acabou de entrar
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