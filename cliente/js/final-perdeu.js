export default class finalperdeu extends Phaser.Scene {

  constructor () {
    super('final-perdeu')
  }

  preload () {
    // Substitua o caminho pelo local correto da sua imagem
    this.load.image('gameover', 'assets/gameover.png')
  }

  create () {
    // Adiciona a imagem no centro da tela
    const gameOverImage = this.add.image(400, 225, 'gameover') // Centralizado para 800x450 tela
    gameOverImage.setDisplaySize(800, 450)
    gameOverImage.setInteractive()

    // Ao clicar na imagem, recarrega a página
    gameOverImage.on('pointerdown', () => {
      location.reload()
    })
  }

  update () { }
}