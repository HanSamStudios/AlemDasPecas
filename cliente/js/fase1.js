export default class fase1 extends Phaser.Scene {
  constructor () {
    super('fase1')

    this.threshold = 0.2
    this.speed = 125
    this.isJumping = false  // Variável para controle do pulo
    this.direcaoAtual = 'direita'
    this.jumpPressed = false // Controle do botão de pulo
  }

  init () { }

  preload () {
    this.load.tilemapTiledJSON('mapa', 'assets/mapa/mapa.json')
    this.load.image('arvore', 'assets/mapa/arvore.png')
    this.load.image('chao', 'assets/mapa/chao.png')
    this.load.image('flores', 'assets/mapa/flores.png')
    this.load.image('vaso', 'assets/mapa/vaso.png')

    this.load.spritesheet('bomba', 'assets/mapa/bomba.png', {
      frameWidth: 8,
      frameHeight: 8
    })

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
    this.tilesetArvore = this.tilemapMapa.addTilesetImage('arvore')
    this.tilesetChao = this.tilemapMapa.addTilesetImage('chao', null, 64, 64)
    this.tilesetVaso = this.tilemapMapa.addTilesetImage('vaso', null, 64, 64)
    this.tilesetFlores = this.tilemapMapa.addTilesetImage('flores', null, 64, 32)

    // camadas
    this.layerChao = this.tilemapMapa.createLayer('chao', [this.tilesetChao])
    this.layerObjeto = this.tilemapMapa.createLayer('objeto', [this.tilesetFlores, this.tilesetVaso, this.tilesetArvore])

    // spawn
    const spawnPoint = this.tilemapMapa.findObject("spawn", obj => obj.name === "spawn")

    // personagem
    this.personagemLocal = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox')
    this.personagemLocal.body.setSize(40, 50)
    this.personagemLocal.body.setOffset(12, 14)
    this.personagemLocal.body.setGravityY(400)
    this.cameras.main.startFollow(this.personagemLocal)

    // colisão
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
      key: 'personagem-parado-esquerda',
      frames: this.anims.generateFrameNumbers('fox', { start: 1, end: 1 }),
      frameRate: 1
    })
    this.anims.create({
      key: 'personagem-pulando',
      frames: this.anims.generateFrameNumbers('fox', { start: 19, end: 19 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'personagem-caindo',
      frames: this.anims.generateFrameNumbers('fox', { start: 20, end: 20 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'personagem-wallgrab',
      frames: this.anims.generateFrameNumbers('fox', { start: 21, end: 21 }),
      frameRate: 10,
      repeat: -1
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

    // botão de pulo (A)
    this.botaoPulo = this.add.circle(680, 360, 35, 0x66ccff).setScrollFactor(0).setInteractive()
    this.add.text(665, 348, 'A', { fontSize: '20px', fill: '#000' }).setScrollFactor(0)

    // Controle de pulo
    this.botaoPulo.on('pointerdown', () => {
      // Só ativa pulo se o personagem estiver no chão ou agarrado na parede
      if (this.personagemLocal.body.blocked.down || this.personagemLocal.body.blocked.left || this.personagemLocal.body.blocked.right) {
        this.jumpPressed = true
      }
    })
  }

  update () {
    const angle = Phaser.Math.DegToRad(this.joystick.angle)
    const force = this.joystick.force

    // Movimento horizontal
    if (force > this.threshold) {
      const velocityX = Math.cos(angle) * this.speed
      this.personagemLocal.setVelocityX(velocityX)

      if (velocityX > 0) {
        this.personagemLocal.setFlipX(false)
        if (!this.isJumping) {
          this.personagemLocal.anims.play('personagem-andando-direita', true)
        }
        this.direcaoAtual = 'direita'
      } else {
        this.personagemLocal.setFlipX(true)
        if (!this.isJumping) {
          this.personagemLocal.anims.play('personagem-andando-esquerda', true)
        }
        this.direcaoAtual = 'esquerda'
      }
    } else {
      this.personagemLocal.setVelocityX(0)

      if (!this.isJumping) {
        if (this.direcaoAtual === 'direita') {
          this.personagemLocal.anims.play('personagem-parado-direita', true)
        } else if (this.direcaoAtual === 'esquerda') {
          this.personagemLocal.anims.play('personagem-parado-esquerda', true)
        }
      }
    }

    // Animação de pulo, queda e agarrar parede
    if (!this.personagemLocal.body.blocked.down) {
      // Checar se está encostando na parede
      if (this.personagemLocal.body.blocked.left || this.personagemLocal.body.blocked.right) {
        this.personagemLocal.setVelocityY(10) // Desce bem devagar enquanto segura
        this.personagemLocal.anims.play('personagem-wallgrab', true)
        this.isJumping = true
      } else if (this.personagemLocal.body.velocity.y < 0) {
        // Pulando para cima
        this.personagemLocal.anims.play('personagem-pulando', true)
        this.isJumping = true
      } else if (this.personagemLocal.body.velocity.y > 0) {
        // Caindo
        this.personagemLocal.anims.play('personagem-caindo', true)
        this.isJumping = true
      }

    } else {
      // Se encostar no chão
      this.isJumping = false
    }

    // Lógica de pulo no chão (permitir pulo enquanto se move)
    if (this.jumpPressed && this.personagemLocal.body.blocked.down) {
      this.personagemLocal.setVelocityY(-300) // Força do pulo
      this.isJumping = true
      this.personagemLocal.anims.play('personagem-pulando', true)
      this.jumpPressed = false // Impede múltiplos saltos no mesmo clique
    }
  }
}
