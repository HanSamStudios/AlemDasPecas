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
      this.time.delayedCall(100, () => this.create(), [], this); // tenta de novo
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
      .setInteractive({ useHandCursor: false });

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

    // Escuta resposta do servidor quando entrarem os jogadores
    this.game.socket.on("jogadores", (jogadores) => {
      if (jogadores.segundo) {
        this.hideWaitingOverlay()
        this.game.jogadores = jogadores
        this.scene.stop()
        this.scene.start("fase1")
      }
      
    })
    this.game.socket.on("sala-cheia", () => {
      window.alert("Sala cheia! Tente outra sala.");
      this.scene.stop();
      this.scene.start("sala");
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
}
