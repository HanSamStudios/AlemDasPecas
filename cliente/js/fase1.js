export default class fase1 extends Phaser.Scene {

  constructor () {
    super('fase1')

    this.threshold = 0.2
    this.speed = 125
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
    this.load.plugin(
      'rexvirtualjoystickplugin',
      'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js',
      true
    )
  }

  create () {
    this.cameras.main.setBackgroundColor('#87ceeb')

    // mapa
    this.tilemapMapa = this.make.tilemap({ key: 'mapa' })

    // tilesets
    this.tilesetArvore = this.tilemapMapa.addTilesetImage('arvore', null, 256, 208)
    this.tilesetChao = this.tilemapMapa.addTilesetImage('chao', null, 64, 64)
    this.tilesetVaso = this.tilemapMapa.addTilesetImage('vaso', null, 64, 64)
    this.tilesetFlores = this.tilemapMapa.addTilesetImage('flores', null, 64, 32)

    // camadas
    this.layerChao = this.tilemapMapa.createLayer('chao', [this.tilesetChao])
    this.layerObjeto = this.tilemapMapa.createLayer('objeto', [this.tilesetFlores, this.tilesetVaso, this.tilesetArvore])

    // spawn
    const spawnPoint = this.tilemapMapa.findObject("spawn", obj => obj.name === "spawn")

    // personagens
    this.personagemLocal = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox')
    this.cameras.main.startFollow(this.personagemLocal)

    // colisao
    this.layerChao.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.personagemLocal, this.layerChao)

    // animações
    this.anims.create({
      key: 'personagem-andando-direita',
      frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'personagem-andando-esquerda',
      frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'personagem-parado-direita',
      frames: this.anims.generateFrameNumbers('fox', { start: 1, end: 1 }),
      frameRate: 1
    })

    this.anims.create({
      key: 'bomba',
      frames: this.anims.generateFrameNumbers('bomba', { start: 0, end: 6 }),
      frameRate: 10
    })

    // bomba
    this.bomba = this.physics.add.sprite(400, 225, 'bomba')
    this.bomba.body.setAllowGravity(false)

    this.bomba.setInteractive().on('pointerdown', () => {
      this.bomba.play('bomba')
    })

    // joystick
    this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
      x: 200,
      y: 310,
      radius: 50,
      base: this.add.circle(120, 360, 50, 0x888888),
      thumb: this.add.circle(120, 360, 25, 0xcccccc)
    })
  }

    update() {
      const angle = Phaser.Math.DegToRad(this.joystick.angle) // Converte o ângulo para radianos
      const force = this.joystick.force

      if (force > this.threshold) {
        const velocityX = Math.cos(angle) * this.speed
        const velocityY = Math.sin(angle) * this.speed

        this.personagemLocal.setVelocity(velocityX, velocityY)

        // Animação do personagem conforme a direção do movimento
        if (Math.abs(velocityX) > Math.abs(velocityY)) {
          if (velocityX > 0) {
            this.personagemLocal.setFlipX(false)
            this.personagemLocal.anims.play('personagem-andando-direita', true)
            this.direcaoAtual = 'direita'
          } else {
            this.personagemLocal.setFlipX(true)
            this.personagemLocal.anims.play('personagem-andando-esquerda', true)
            this.direcaoAtual = 'esquerda'
          }
        } else {
          if (velocityY > 0) {
            this.personagemLocal.anims.play('personagem-andando-frente', true)
            this.direcaoAtual = 'frente'
          } else {
            this.personagemLocal.anims.play('personagem-andando-tras', true)
            this.direcaoAtual = 'tras'
          }
        }
      } else {
        // Se a força do joystick for baixa, o personagem para
        this.personagemLocal.setVelocity(0)

        switch (this.direcaoAtual) {
          case 'frente':
            this.personagemLocal.anims.play('personagem-parado-frente', true)
            break
          case 'direita':
            this.personagemLocal.anims.play('personagem-parado-direita', true)
            break
          case 'esquerda':
            this.personagemLocal.anims.play('personagem-parado-esquerda', true)
            break
          case 'tras':
            this.personagemLocal.anims.play('personagem-parado-tras', true)
            break
        }
      }
    }
  }




