export default class fase1 extends Phaser.Scene {
  constructor () {
    super('fase1')

    // Parâmetros de controle do movimento
    this.threshold = 0.2
    this.speed = 125
    this.isJumping = false
    this.direcaoAtual = 'direita'
    this.jumpPressed = false
    this.isDashing = false
    this.dashSpeed = 800
    this.canAirDash = true
    this.canDash = true
    this.dashCooldown = 500
    this.isWallGrabbing = false // Novo estado: está agarrado na parede
  }

  preload () {
    // Carrega o mapa e imagens de fundo
    this.load.tilemapTiledJSON('mapa', 'assets/mapa/mapa.json')
    this.load.image('arvore', 'assets/mapa/arvore.png')
    this.load.image('chao', 'assets/mapa/chao.png')
    this.load.image('flores', 'assets/mapa/flores.png')
    this.load.image('vaso', 'assets/mapa/vaso.png')

    // Sprites dos personagens e objetos
    this.load.spritesheet('bomba', 'assets/mapa/bomba.png', { frameWidth: 8, frameHeight: 8 })
    this.load.spritesheet('fox', 'assets/Spritesheet.png', { frameWidth: 64, frameHeight: 64 })

    // Plugin de joystick
    this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true)
  }

  create () {
    this.input.addPointer(3)
    this.trailGroup = this.add.group()
    this.cameras.main.setBackgroundColor('#87ceeb')

    // Cria o mapa com seus tilesets
    this.tilemapMapa = this.make.tilemap({ key: 'mapa' })
    this.tilesetArvore = this.tilemapMapa.addTilesetImage('arvore')
    this.tilesetChao = this.tilemapMapa.addTilesetImage('chao', null, 64, 64)
    this.tilesetVaso = this.tilemapMapa.addTilesetImage('vaso', null, 64, 64)
    this.tilesetFlores = this.tilemapMapa.addTilesetImage('flores', null, 64, 32)

    this.layerChao = this.tilemapMapa.createLayer('chao', [this.tilesetChao])
    this.layerObjeto = this.tilemapMapa.createLayer('objeto', [this.tilesetFlores, this.tilesetVaso, this.tilesetArvore])

    // Define o ponto de spawn do personagem
    const spawnPoint = this.tilemapMapa.findObject("spawn", obj => obj.name === "spawn")

    this.personagemLocal = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox')
    this.personagemLocal.body.setSize(40, 50)
    this.personagemLocal.body.setOffset(12, 14)
    this.personagemLocal.body.setGravityY(400)
    this.cameras.main.startFollow(this.personagemLocal)

    this.layerChao.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.personagemLocal, this.layerChao)

    this.createAnims()

    // Cria bomba clicável com animação
    this.bomba = this.physics.add.sprite(400, 225, 'bomba')
    this.bomba.body.setAllowGravity(false)
    this.bomba.setInteractive().on('pointerdown', () => {
      this.bomba.play('bomba')
    })

    // Joystick virtual e botões
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

    // Lógica do botão de pulo
    this.botaoPulo.on('pointerdown', () => {
      if (this.personagemLocal.body.blocked.down || this.isWallGrabbing) {
        this.jumpPressed = true
      }
    })

    // Lógica do dash
    this.botaoDash.on('pointerdown', () => {
      if (!this.isDashing && this.canDash && (this.personagemLocal.body.blocked.down || this.canAirDash || this.isWallGrabbing)) {
        this.isDashing = true
        this.canDash = false

        // Se o personagem estiver saindo de uma parede, zera a velocidade Y (vertical)
        if (this.isWallGrabbing) {
          this.personagemLocal.setVelocityY(0)  // Zera a velocidade vertical ao sair da parede
        }

        if (!this.personagemLocal.body.blocked.down) {
          this.canAirDash = false
        }

        this.personagemLocal.setTint(0xffffff)

        const dashAngle = Phaser.Math.DegToRad(this.joystick.angle)
        let dashVelX = Math.cos(dashAngle) * this.dashSpeed
        let dashVelY = Math.sin(dashAngle) * this.dashSpeed * 0.40

        // Se o personagem estava agarrado na parede, reduz a componente vertical do dash
        if (this.isWallGrabbing) {
          dashVelY = 0  // Impede a velocidade vertical no dash após wallgrab
        }

        this.personagemLocal.setVelocity(dashVelX, dashVelY)
        this.personagemLocal.anims.play('personagem-dash', true)

        this.time.delayedCall(150, () => {
          this.isDashing = false
          this.personagemLocal.clearTint()
        })

        this.time.delayedCall(this.dashCooldown, () => {
          this.canDash = true
        })

        this.isWallGrabbing = false // Sai do wallgrab ao usar dash
      }
    })

  }

  update () {
    const angle = Phaser.Math.DegToRad(this.joystick.angle)
    const force = this.joystick.force

    // Movimento horizontal com joystick
    if (!this.isDashing && !this.isWallGrabbing) {
      if (force > this.threshold) {
        const velocityX = Math.cos(angle) * this.speed
        this.personagemLocal.setVelocityX(velocityX)

        if (velocityX > 0) {
          this.personagemLocal.setFlipX(false)
          if (!this.isJumping) this.personagemLocal.anims.play('personagem-andando-direita', true)
          this.direcaoAtual = 'direita'
        } else {
          this.personagemLocal.setFlipX(true)
          if (!this.isJumping) this.personagemLocal.anims.play('personagem-andando-esquerda', true)
          this.direcaoAtual = 'esquerda'
        }
      } else {
        this.personagemLocal.setVelocityX(0)
        if (!this.isJumping && !this.isWallGrabbing) {
          if (this.direcaoAtual === 'direita') this.personagemLocal.anims.play('personagem-parado-direita', true)
          else this.personagemLocal.anims.play('personagem-parado-esquerda', true)
        }
      }
    } else if (this.isDashing) {
      this.createTrail()
    }

    // Lógica de wallgrab com ajustes na gravidade e velocidade de queda
    if (!this.personagemLocal.body.blocked.down) {
      if ((this.personagemLocal.body.blocked.left || this.personagemLocal.body.blocked.right) && !this.isDashing) {
        // Ajuste a gravidade e a velocidade de queda durante o wall grab
        this.personagemLocal.body.setGravityY(100)  // Diminui a gravidade durante o wall grab
        this.personagemLocal.setVelocityY(2)  // Ajusta a velocidade de queda enquanto agarrado

        this.personagemLocal.anims.play('personagem-wallgrab', true)
        this.isWallGrabbing = true
        this.isJumping = true
      } else if (this.personagemLocal.body.velocity.y < 0) {
        this.personagemLocal.anims.play('personagem-pulando', true)
        this.isWallGrabbing = false
        this.isJumping = true
      } else if (this.personagemLocal.body.velocity.y > 0 && !this.isWallGrabbing) {
        this.personagemLocal.anims.play('personagem-caindo', true)
        this.isJumping = true
      }
    } else {
      this.isJumping = false
      this.canAirDash = true
      this.isWallGrabbing = false
      // Restaura a gravidade ao normal quando o personagem não está mais agarrado
      this.personagemLocal.body.setGravityY(400)  // Restaura a gravidade original

      // Garantir que a velocidade vertical não seja muito grande quando saímos do wallgrab
      if (this.personagemLocal.body.velocity.y > 0) {
        this.personagemLocal.setVelocityY(Math.min(this.personagemLocal.body.velocity.y, 200))  // Limita a velocidade de queda
      }
    }

    // Ajuste para o pulo a partir do wallgrab
    if (this.jumpPressed && this.isWallGrabbing) {
      this.personagemLocal.setVelocityY(-150)  // Pulo mais controlado do wallgrab
      this.isJumping = true
      this.personagemLocal.anims.play('personagem-pulando', true)
      this.jumpPressed = false
      this.isWallGrabbing = false
    }

    // Pulo a partir do chão ou da parede
    if (this.jumpPressed && (this.personagemLocal.body.blocked.down || this.isWallGrabbing)) {
      if (this.isWallGrabbing) {
        // Aumenta ainda mais a velocidade do pulo enquanto estiver agarrado na parede
        this.personagemLocal.setVelocityY(-1000)  // Aumente o valor aqui, experimente com -350 ou -400
      } else {
        this.personagemLocal.setVelocityY(-300)  // Velocidade do pulo normal
      }

      this.isJumping = true
      this.personagemLocal.anims.play('personagem-pulando', true)
      this.jumpPressed = false
      this.isWallGrabbing = false
    }


  }

  // Cria rastro visual durante o dash
  createTrail () {
    const trail = this.add.sprite(this.personagemLocal.x, this.personagemLocal.y, 'fox')
    trail.setAlpha(0.5)
    trail.setDepth(-1)
    trail.setFlipX(this.personagemLocal.flipX)
    trail.setFrame(this.personagemLocal.anims.currentFrame.index)
    trail.setTint(0x66ccff)

    this.trailGroup.add(trail)

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scale: { from: 1, to: 1.5 },
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => { trail.destroy() }
    })
  }

  // Criação das animações do personagem
  createAnims () {
    this.anims.create({ key: 'personagem-andando-direita', frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-andando-esquerda', frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-parado-direita', frames: this.anims.generateFrameNumbers('fox', { start: 1, end: 1 }), frameRate: 1 })
    this.anims.create({ key: 'personagem-parado-esquerda', frames: this.anims.generateFrameNumbers('fox', { start: 1, end: 1 }), frameRate: 1 })
    this.anims.create({ key: 'personagem-pulando', frames: this.anims.generateFrameNumbers('fox', { start: 19, end: 19 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-caindo', frames: this.anims.generateFrameNumbers('fox', { start: 20, end: 20 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-wallgrab', frames: this.anims.generateFrameNumbers('fox', { start: 21, end: 21 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-dash', frames: this.anims.generateFrameNumbers('fox', { start: 30, end: 33 }), frameRate: 20, repeat: 0 })
  }
}
