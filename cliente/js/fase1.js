export default class fase1 extends Phaser.Scene {
  constructor () {
    super('fase1')

    this.threshold = 0.2
    this.speed = 125
    this.isJumping = false
    this.direcaoAtual = 'direita'
    this.jumpPressed = false
    this.isDashing = false
    this.dashSpeed = 5000
    this.dashDistance = 200
    this.canAirDash = true // <<< Adicionei aqui
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
    this.trailGroup = this.add.group()
    this.cameras.main.setBackgroundColor('#87ceeb')

    this.tilemapMapa = this.make.tilemap({ key: 'mapa' })

    this.tilesetArvore = this.tilemapMapa.addTilesetImage('arvore')
    this.tilesetChao = this.tilemapMapa.addTilesetImage('chao', null, 64, 64)
    this.tilesetVaso = this.tilemapMapa.addTilesetImage('vaso', null, 64, 64)
    this.tilesetFlores = this.tilemapMapa.addTilesetImage('flores', null, 64, 32)

    this.layerChao = this.tilemapMapa.createLayer('chao', [this.tilesetChao])
    this.layerObjeto = this.tilemapMapa.createLayer('objeto', [this.tilesetFlores, this.tilesetVaso, this.tilesetArvore])

    const spawnPoint = this.tilemapMapa.findObject("spawn", obj => obj.name === "spawn")

    this.personagemLocal = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox')
    this.personagemLocal.body.setSize(40, 50)
    this.personagemLocal.body.setOffset(12, 14)
    this.personagemLocal.body.setGravityY(400)
    this.cameras.main.startFollow(this.personagemLocal)

    this.layerChao.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.personagemLocal, this.layerChao)

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
      key: 'personagem-dash',
      frames: this.anims.generateFrameNumbers('fox', { start: 30, end: 33 }),
      frameRate: 10,
      repeat: 0
    })

    this.bomba = this.physics.add.sprite(400, 225, 'bomba')
    this.bomba.body.setAllowGravity(false)
    this.bomba.setInteractive().on('pointerdown', () => {
      this.bomba.play('bomba')
    })

    this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
      x: 200,
      y: 310,
      radius: 50,
      base: this.add.circle(120, 360, 50, 0x888888),
      thumb: this.add.circle(120, 360, 25, 0xcccccc)
    })

    this.botaoPulo = this.add.circle(680, 360, 35, 0x66ccff).setScrollFactor(0).setInteractive()
    this.add.text(665, 348, 'A', { fontSize: '20px', fill: '#000' }).setScrollFactor(0)

    this.botaoDash = this.add.circle(740, 360, 35, 0xff6347).setScrollFactor(0).setInteractive()
    this.add.text(730, 348, 'B', { fontSize: '20px', fill: '#000' }).setScrollFactor(0)

    // Controle de pulo
    this.botaoPulo.on('pointerdown', () => {
      if (this.personagemLocal.body.blocked.down || this.personagemLocal.body.blocked.left || this.personagemLocal.body.blocked.right) {
        this.jumpPressed = true
      }
    })

    // Controle de dash corrigido
    this.botaoDash.on('pointerdown', () => {
      if (!this.isDashing && (this.personagemLocal.body.blocked.down || this.canAirDash)) {
        this.isDashing = true

        if (!this.personagemLocal.body.blocked.down) {
          this.canAirDash = false
        }

        const startX = this.personagemLocal.x
        const targetX = this.direcaoAtual === 'direita' ? startX + this.dashDistance : startX - this.dashDistance

        this.personagemLocal.setTint(0xffffff)

        this.tweens.add({
          targets: this.personagemLocal,
          x: targetX,
          duration: 200,
          ease: 'Linear',
          onUpdate: () => {
            this.createTrail()
          },
          onComplete: () => {
            this.isDashing = false
            this.personagemLocal.clearTint()
          }
        })

        this.personagemLocal.anims.play('personagem-dash', true)
      }
    })
  }

  update () {
    const angle = Phaser.Math.DegToRad(this.joystick.angle)
    const force = this.joystick.force

    if (force > this.threshold) {
      const velocityX = Math.cos(angle) * this.speed
      this.personagemLocal.setVelocityX(velocityX)

      if (velocityX > 0) {
        this.personagemLocal.setFlipX(false)
        if (!this.isJumping && !this.isDashing) {
          this.personagemLocal.anims.play('personagem-andando-direita', true)
        }
        this.direcaoAtual = 'direita'
      } else {
        this.personagemLocal.setFlipX(true)
        if (!this.isJumping && !this.isDashing) {
          this.personagemLocal.anims.play('personagem-andando-esquerda', true)
        }
        this.direcaoAtual = 'esquerda'
      }
    } else {
      this.personagemLocal.setVelocityX(0)

      if (!this.isJumping && !this.isDashing) {
        if (this.direcaoAtual === 'direita') {
          this.personagemLocal.anims.play('personagem-parado-direita', true)
        } else if (this.direcaoAtual === 'esquerda') {
          this.personagemLocal.anims.play('personagem-parado-esquerda', true)
        }
      }
    }

    if (!this.personagemLocal.body.blocked.down) {
      if (this.personagemLocal.body.blocked.left || this.personagemLocal.body.blocked.right) {
        this.personagemLocal.setVelocityY(10)
        this.personagemLocal.anims.play('personagem-wallgrab', true)
        this.isJumping = true
      } else if (this.personagemLocal.body.velocity.y < 0) {
        this.personagemLocal.anims.play('personagem-pulando', true)
        this.isJumping = true
      } else if (this.personagemLocal.body.velocity.y > 0) {
        this.personagemLocal.anims.play('personagem-caindo', true)
        this.isJumping = true
      }
    } else {
      this.isJumping = false
      this.canAirDash = true // <<< Reset de dash ao tocar no chão
    }

    if (this.jumpPressed && this.personagemLocal.body.blocked.down) {
      this.personagemLocal.setVelocityY(-300)
      this.isJumping = true
      this.personagemLocal.anims.play('personagem-pulando', true)
      this.jumpPressed = false
    }

    if (this.isDashing) {
      this.personagemLocal.anims.play('personagem-dash', true)
    }
  }

  createTrail () {
    const trail = this.add.sprite(this.personagemLocal.x, this.personagemLocal.y, 'fox')
    trail.setAlpha(0.5)
    trail.setDepth(-1)
    trail.setFlipX(this.personagemLocal.flipX)
    trail.setFrame(this.personagemLocal.anims.currentFrame.index)

    this.trailGroup.add(trail)

    this.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        trail.destroy()
      }
    })
  }
}
