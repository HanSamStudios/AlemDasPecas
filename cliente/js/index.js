/*global Phaser, io*/
/*eslint no-undef: "error"*/
import config from "./config.js";
import abertura from "./abertura.js";
import precarregamento from "./precarregamento.js";
import sala from "./sala.js";
import fase1 from "./fase1.js";
import finalacabado from "./final-acabado.js";
import finalperdeu from "./final-perdeu.js";
import detonou from "./detonou.js";

class Game extends Phaser.Game {
  constructor() {
    super(config);

    this.audio = document.querySelector("audio");
    this.iceServers = {
      iceServers: [
        { urls: "stun:feira-de-jogos.dev.br" },
        { urls: "stun:stun.1.google.com:19302" },
      ],
    };

    // Conexão com o servidor via Socket.IO
    this.socket = io();

    // Adicionando as cenas ao jogo
    this.scene.add("abertura", abertura);
    this.scene.add("precarregamento", precarregamento);
    this.scene.add("sala", sala);
    this.scene.add("fase1", fase1);
    this.scene.add("finalacabado", finalacabado);
    this.scene.add("finalperdeu", finalperdeu);
    this.scene.add("detonou", detonou);

    // Inicia o jogo na cena "abertura"
    this.scene.start("abertura");

    // Evento de conexão do Socket.IO
    this.socket.on("connect", () => {
      console.log(`Usuário ${this.socket.id} conectado no servidor`);
    });

    // Quando a sala for atualizada, verifica o número de jogadores
    this.socket.on("salaAtualizada", (quantidadeJogadores) => {
      if (quantidadeJogadores >= 3) {
        console.log("Sala cheia!");
        this.game.stop(); // Para o jogo
        this.game.start("sala"); // Redireciona para a tela de sala
        window.alert("A sala está cheia!"); // Alerta o jogador
      }
    });

    // Quando o servidor avisa que a sala está cheia
    this.socket.on("salaCheia", () => {
      console.log("A sala está cheia, não é possível entrar.");
      window.alert("A sala está cheia, não é possível entrar.");
      this.game.stop();
      this.game.start("sala");
    });

    // Tenta entrar na sala, aqui você pode passar a salaId desejada
    this.entrarNaSala("sala1");
  }

  // Função para entrar na sala
  entrarNaSala(salaId) {
    this.socket.emit("entrarNaSala", salaId);
  }
}

// Inicializa o jogo quando a janela carregar
window.onload = () => {
  window.game = new Game();
};
