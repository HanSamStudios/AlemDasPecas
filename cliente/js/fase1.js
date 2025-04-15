export default class fase1 extends Phaser.Scene {

  constructor () {
    super('fase1')
  }

  init () { }
  preload () {
    this.load.spritesheet('fox', 'assets/Spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    })
  }
  create () {
    this.fox = this.physics.add.sprite(100, 100, 'fox')

    this.anims.create({
      key: 'fox-direita',
      frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }),
      frameRate: 10,
      repeat: -1
    })
    this.fox.play('fox-direita')
    this.fox.setVelocityX(100)
  }
  update () { }

}