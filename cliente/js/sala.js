export default class sala extends Phaser.Scene {

  constructor () {
    super('sala')

  }

  create () { 
      this.add.text(280, 23, 'Escolha sua sala', {
    fontSize: '35px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  })
    this.salas = [
      { x: 200, y: 100, numero: '1' },
      { x: 300, y: 100, numero: '2' },
      { x: 400, y: 100, numero: '3' },
      { x: 500, y: 100, numero: '4' },
      { x: 600, y: 100, numero: '5' },
      { x: 200, y: 200, numero: '6' },
      { x: 300, y: 200, numero: '7' },
      { x: 400, y: 200, numero: '8' },
      { x: 500, y: 200, numero: '9' },
      { x: 600, y: 200, numero: '10' },
    ]
  this.salas.forEach((sala) => { 
    sala.botao = this.add
      .text(sala.x, sala.y, sala.numero, {
        fontSize: '32px', // Aumenta o tamanho da fonte
        color: '#ffffff' // Opcional: define a cor
      })
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
