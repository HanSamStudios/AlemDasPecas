export default class sala extends Phaser.Scene {
  constructor () {
    super('sala')
  }

  preload() {
    this.load.image('escolha', 'assets/escolha.png') // Caminho correto da imagem
    this.fontReady = false;
    WebFont.load({
      custom: {
        families: ['game-over'],
      },
      active: () => {
        this.fontReady = true;
      }
    });
  }

  create () {
    if (!this.fontReady) {
      this.time.delayedCall(100, () => this.create(), [], this); // tenta de novo até a fonte carregar
      return;
    }

    this.add.image(0, 0, 'escolha').setOrigin(0).setDepth(0).setScale(0.5)

    this.salas = [
      { x: 300, y: 200, numero: '1' },
      { x: 390, y: 200, numero: '2' },
      { x: 490, y: 200, numero: '3' },
      { x: 570, y: 200, numero: '4' },
      { x: 670, y: 200, numero: '5' },
      { x: 300, y: 300, numero: '6' },
      { x: 390, y: 300, numero: '7' },
      { x: 490, y: 300, numero: '8' },
      { x: 570, y: 300, numero: '9' },
      { x: 655, y: 300, numero: '10' },
    ]

    // Cria os botões para as salas
    this.salas.forEach((sala) => {
      sala.botao = this.add.text(sala.x, sala.y, sala.numero, {
        fontSize: '32px',
        fontFamily: 'game-over',
        color: '#ffffff'
      })
      .setShadow(2, 2, '#000000', 2, true, true)
      .setInteractive()
      .on("pointerdown", () => {
        this.game.sala = sala.numero
        this.game.socket.emit("entrar-na-sala", this.game.sala)
        this.showWaitingOverlay()
      })
    })

    // Criar overlay preto semitransparente para esperar o segundo jogador
    this.waitingOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(10)
      .setVisible(false)

    // Texto "Esperando jogador..."
    this.waitingText = this.add.text(this.scale.width/2, this.scale.height/2, 'Esperando jogador', {
      fontSize: '36px',
      fontFamily: 'game-over',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(11).setVisible(false)

    // Variável para animação dos pontos
    this.dotsCount = 0
    this.dotsTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.dotsCount = (this.dotsCount + 1) % 4
        let dots = '.'.repeat(this.dotsCount)
        this.waitingText.setText('Esperando jogador' + dots)
      }
    })
    this.dotsTimer.paused = true // começa pausada

    // NOVO: Criar overlay preto mais opaco para quando a sala tiver 3+ jogadores (tela cheia individual)
    this.fullRoomOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.9)
      .setOrigin(0)
      .setDepth(12) // Coloca este overlay acima dos outros elementos
      .setVisible(false);

    // NOVO: Texto "SALA CHEIA! Aguardando o jogo começar..."
    this.fullRoomText = this.add.text(this.scale.width/2, this.scale.height/2, 'SALA CHEIA! Aguardando o jogo começar...', {
      fontSize: '48px', // Fonte maior para a mensagem de sala cheia
      fontFamily: 'game-over',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(13).setVisible(false);


    // Escuta resposta do servidor quando entrarem os jogadores
    // AGORA 'jogadoresRecebidos' É UM ARRAY DE IDs DE SOCKET!
    this.game.socket.on("jogadores", (jogadoresRecebidos) => {
      console.log("[CLIENTE] Recebeu lista de jogadores:", jogadoresRecebidos);

      // Se há pelo menos 2 jogadores, significa que a fase1 pode potencialmente iniciar
      if (jogadoresRecebidos.length >= 2) {
        this.hideWaitingOverlay(); // Esconde o overlay de "Esperando jogador..."

        // Armazena os IDs dos dois primeiros jogadores para compatibilidade com a estrutura esperada
        this.game.jogadores = {
          primeiro: jogadoresRecebidos[0],
          segundo: jogadoresRecebidos[1] || null // O segundo pode ser null se for o primeiro a entrar, mas a condição acima já garante 2
        };

        // Se o jogador atual é o primeiro ou o segundo a entrar na sala, inicia a fase1
        // (Assumimos que 'this.game.socket.id' é o ID do socket do cliente atual)
        if (this.game.socket.id === jogadoresRecebidos[0] || this.game.socket.id === jogadoresRecebidos[1]) {
            this.scene.stop();
            this.scene.start("fase1");
        } else {
            // Se o jogador atual é o terceiro ou subsequente, ele não inicia a fase1 aqui.
            // A mensagem de sala cheia individual já terá sido ativada para ele.
            // Certifica-se que o overlay de espera não reapareça
            this.hideWaitingOverlay();
        }

      } else {
        // Se há menos de 2 jogadores (apenas 1), continua mostrando o overlay de espera
        this.showWaitingOverlay();
        this.hideFullRoomOverlay(); // Garante que o overlay de sala cheia não esteja visível
      }
    });

    // REMOVIDO: Antiga lógica do window.alert para "sala-cheia"
    /*
    this.game.socket.on("sala-cheia", () => {
      console.log("[CLIENTE] Recebeu sala-cheia");
      window.alert("Sala cheia! Tente outra sala.");
      this.scene.stop();
      this.scene.start("sala");
    });
    */

    // NOVO: Listener para o evento individual de sala cheia (para o 3º jogador em diante)
    this.game.socket.on("sala-cheia-individual", () => {
      console.log("[CLIENTE] Recebeu sala-cheia-individual. Mostrando overlay 'Sala Cheia' para este jogador.");
      this.hideWaitingOverlay(); // Esconde o overlay de "Esperando jogador..."
      this.showFullRoomOverlay(); // Mostra o overlay de "Sala Cheia!" para ESTE cliente
    });
  }

  showWaitingOverlay() {
    this.waitingOverlay.setVisible(true)
    this.waitingText.setVisible(true)
    this.dotsTimer.paused = false
  }

  hideWaitingOverlay() {
    this.waitingOverlay.setVisible(false)
    this.waitingText.setVisible(false)
    this.dotsTimer.paused = true
  }

  // NOVO: Funções para controlar o overlay de sala cheia (3+ jogadores)
  showFullRoomOverlay() {
    this.fullRoomOverlay.setVisible(true);
    this.fullRoomText.setVisible(true);
  }

  hideFullRoomOverlay() {
    this.fullRoomOverlay.setVisible(false);
    this.fullRoomText.setVisible(false);
  }
}
