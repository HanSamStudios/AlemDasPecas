export default class sala extends Phaser.Scene {

  constructor () {
    super('sala')

  }

  
  preload() {
    this.load.image('escolha', 'assets/escolha.png') // <-- Caminho correto da imagem
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
  this.salas.forEach((sala) => { 
    sala.botao = this.add
      .text(sala.x, sala.y, sala.numero, {
        fontSize: '32px', // Aumenta o tamanho da fonte
        fontFamily: 'game-over',
        color: '#ffffff' // Opcional: define a cor
        
      })
      .setShadow(2, 2, '#000000', 2, true, true)
      .setInteractive()
      .on("pointerdown", () => {
        this.game.sala = sala.numero
        this.game.socket.emit("entrar-na-sala", this.game.sala)
      })
    })
    this.game.socket.on("jogadores",
      (jogadores) => {
        if (jogadores.segundo) {
          this.game.jogadores = jogadores
          this.scene.stop()
          this.scene.start("fase1")
        }
    })
  }   
}
