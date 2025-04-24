export default class fase1 extends Phaser.Scene {

  constructor () {
    super('fase1')
  }

  init () { }

  preload () {
    this.load.tilemapTiledJSON('mapa', 'assets/mapa/mapa.json')
    this.load.image('arvore', 'assets/mapa/arvore.png')
    this.load.image('chao', 'assets/mapa/chao.png')
    this.load.image('flores', 'assets/mapa/flores.png')
    this.load.image('vaso', 'assets/mapa/vaso.png')
    // botão
    this.load.spritesheet('bomba', 'assets/mapa/bomba.png', {
      frameWidth: 8,
      frameWeight: 8
    })
    // personagem
    this.load.spritesheet('fox', 'assets/Spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    })
  }

  create () {
    this.cameras.main.setBackgroundColor('#87ceeb');
    // mapa
    this.tilemapMapa = this.make.tilemap({ key: 'mapa' })
    // tilesets
    this.tilesetArvore = this.tilemapMapa.addTilesetImage('arvore', null, 256, 208)
    this.tilesetChao = this.tilemapMapa.addTilesetImage('chao', null, 64, 64)
    this.tilesetVaso = this.tilemapMapa.addTilesetImage('vaso', null, 64, 64)
    this.tilesetFlores = this.tilemapMapa.addTilesetImage('flores', null, 64,32)

    // camadas
    this.layerChao = this.tilemapMapa.createLayer('chao', [this.tilesetChao])
    this.layerObjeto = this.tilemapMapa.createLayer('objeto', [this.tilesetFlores, this.tilesetVaso, this.tilesetArvore])

    // spawn
    const spawnPoint = this.tilemapMapa.findObject("spawn", obj => obj.name === "spawn")

    // personagens
    this.fox = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox')
    this.cameras.main.startFollow(this.fox)

    // colisao
    this.layerChao.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.fox, this.layerChao, this.bomba)

    //animacao
    this.anims.create({
      key: 'fox-direita',
      frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'bomba',
      frames: this.anims.generateFrameNumbers('bomba', { start: 0, end: 6 }),
      frameRate: 10
    })
    // personagem
    this.fox.play('fox-direita')
    this.fox.setVelocityX(100)

    // bomba
    this.bomba = this.physics.add.sprite(400, 225, 'bomba')
    this.bomba.body.setGravity(0, 0)
    this.bomba.body.setAllowGravity(false)
    
    this.bomba
      .setInteractive()
      .on('pointerdown', () => {
        this.bomba.play('bomba')

      
      })
  }

  update () { }

}