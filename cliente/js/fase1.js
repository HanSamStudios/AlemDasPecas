export default class fase1 extends Phaser.Scene {
  constructor () {
    super('fase1')

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
    this.isWallGrabbing = false
    this.ultimaParedeGrudada = null
    this.ladoParedeAtual = null
    this.levandoDano = false // Nova variável para controle de invulnerabilidade
    this.spawnPoint = null // Variável para o ponto de spawn
  }

  preload () {
    this.load.tilemapTiledJSON('mapa', 'assets/mapa/mapa.json')
    this.load.image('arvore', 'assets/mapa/arvore.png')
    this.load.image('chao', 'assets/mapa/chao.png')
    this.load.image('flores', 'assets/mapa/flores.png')
    this.load.image('vaso', 'assets/mapa/vaso.png')
    this.load.image('espinhos', 'assets/mapa/espinhos.png')

    this.load.spritesheet('bomba', 'assets/mapa/bomba.png', { frameWidth: 8, frameHeight: 8 })
    this.load.spritesheet('fox', 'assets/Spritesheet.png', { frameWidth: 64, frameHeight: 64 })

    this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true)
  }

  create () {
    this.input.addPointer(3)
    this.trailGroup = this.add.group()
    this.cameras.main.setBackgroundColor('#87ceeb')

    this.tilemapMapa = this.make.tilemap({ key: 'mapa' })
    this.tilesetArvore = this.tilemapMapa.addTilesetImage('arvore')
    this.tilesetChao = this.tilemapMapa.addTilesetImage('chao', null, 64, 64)
    this.tilesetVaso = this.tilemapMapa.addTilesetImage('vaso', null, 64, 64)
    this.tilesetEspinhos = this.tilemapMapa.addTilesetImage('espinhos', null, 64, 64)
    this.tilesetFlores = this.tilemapMapa.addTilesetImage('flores', null, 64, 32)

    this.layerChao = this.tilemapMapa.createLayer('chao', [this.tilesetChao])
    this.layerEspinhos = this.tilemapMapa.createLayer('espinhos', [this.tilesetEspinhos])
    this.layerObjeto = this.tilemapMapa.createLayer('objeto', [this.tilesetFlores, this.tilesetVaso, this.tilesetArvore])

    
    const spawnPoint = this.tilemapMapa.findObject("spawn", obj => obj.name === "spawn")
    this.spawnPoint = spawnPoint // Guardando o ponto de spawn

    this.personagemLocal = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox')
    this.personagemLocal.body.setSize(40, 50)
    this.personagemLocal.body.setOffset(12, 14)
    this.personagemLocal.body.setGravityY(400)
    this.cameras.main.startFollow(this.personagemLocal)

    this.layerChao.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.personagemLocal, this.layerChao)

    this.layerEspinhos.setCollisionByProperty({ collides: true })

    // Verificando se o personagem tocou nos espinhos
    this.physics.add.overlap(
      this.personagemLocal,
      this.layerEspinhos,
      (player, tile) => {
        if (!this.personagemLocal.isInvulnerable && tile.index !== -1) {
          this.tratarDano();
        }
      },
      (player, tile) => tile.index !== -1, // Só se o tile for um espinho
      this
    )

    this.createAnims()

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

    this.botaoPulo.on('pointerdown', () => {
      if (this.personagemLocal.body.blocked.down || this.isWallGrabbing) {
        this.jumpPressed = true
      }
    })

    this.botaoDash.on('pointerdown', () => {
      if (!this.isDashing && this.canDash && (this.personagemLocal.body.blocked.down || this.canAirDash || this.isWallGrabbing)) {
        this.isDashing = true
        this.canDash = false

        if (this.isWallGrabbing) {
          this.personagemLocal.setVelocityY(0)
        }

        if (!this.personagemLocal.body.blocked.down) {
          this.canAirDash = false
        }

        this.personagemLocal.setTint(0xffffff)

        let dashVelX = this.personagemLocal.flipX ? -this.dashSpeed : this.dashSpeed
        let dashVelY = 0

        this.personagemLocal.setVelocity(dashVelX, dashVelY)
        this.personagemLocal.anims.play('personagem-dash', true)

        this.time.delayedCall(150, () => {
          this.isDashing = false
          this.personagemLocal.clearTint()
        })

        this.time.delayedCall(this.dashCooldown, () => {
          this.canDash = true
        })

        this.isWallGrabbing = false
      }
    })
  }


  update () {
    const angle = Phaser.Math.DegToRad(this.joystick.angle);
    const force = this.joystick.force;

    // Verifica se o personagem está invulnerável, não faz mais nada no update enquanto estiver nesse estado
    if (this.personagemLocal.isInvulnerable) return;

    // Movimento normal
    if (!this.isDashing && !this.isWallGrabbing) {
      if (force > this.threshold) {
        const velocityX = Math.cos(angle) * this.speed;
        this.personagemLocal.setVelocityX(velocityX);

        if (velocityX > 0) {
          this.personagemLocal.setFlipX(false);
          if (!this.isJumping) this.personagemLocal.anims.play('personagem-andando-direita', true);
          this.direcaoAtual = 'direita';
        } else {
          this.personagemLocal.setFlipX(true);
          if (!this.isJumping) this.personagemLocal.anims.play('personagem-andando-esquerda', true);
          this.direcaoAtual = 'esquerda';
        }
      } else {
        this.personagemLocal.setVelocityX(0);
        if (!this.isJumping && !this.isWallGrabbing) {
          if (this.direcaoAtual === 'direita') this.personagemLocal.anims.play('personagem-parado-direita', true);
          else this.personagemLocal.anims.play('personagem-parado-esquerda', true);
        }
      }
    } else if (this.isDashing) {
      this.createTrail();
    }

    // WALL GRAB COM BLOQUEIO DE ESCALAR A MESMA PAREDE
    if (!this.personagemLocal.body.blocked.down) {
      if ((this.personagemLocal.body.blocked.left || this.personagemLocal.body.blocked.right) && !this.isDashing) {
        const ladoAtual = this.personagemLocal.body.blocked.left ? 'left' : 'right';

        if (this.ultimaParedeGrudada !== ladoAtual) {
          this.personagemLocal.body.setGravityY(100);
          this.personagemLocal.setVelocityY(2);

          this.personagemLocal.anims.play('personagem-wallgrab', true);
          this.isWallGrabbing = true;
          this.isJumping = true;
          this.ladoParedeAtual = ladoAtual;
        }
      } else if (this.personagemLocal.body.velocity.y < 0) {
        this.personagemLocal.anims.play('personagem-pulando', true);
        this.isWallGrabbing = false;
        this.isJumping = true;
      } else if (this.personagemLocal.body.velocity.y > 0 && !this.isWallGrabbing) {
        this.personagemLocal.anims.play('personagem-caindo', true);
        this.isJumping = true;
      }
    } else {
      this.isJumping = false;
      this.canAirDash = true;
      this.isWallGrabbing = false;
      this.personagemLocal.body.setGravityY(400);
      this.ultimaParedeGrudada = null;

      if (this.personagemLocal.body.velocity.y > 0) {
        this.personagemLocal.setVelocityY(Math.min(this.personagemLocal.body.velocity.y, 500));
      }
    }

    if (this.jumpPressed && (this.personagemLocal.body.blocked.down || this.isWallGrabbing)) {
      if (this.isWallGrabbing) {
        this.personagemLocal.setVelocityY(-10000);
      } else {
        this.personagemLocal.setVelocityY(-300);
      }

      this.isJumping = true;
      this.personagemLocal.anims.play('personagem-pulando', true);
      this.jumpPressed = false;
      this.isWallGrabbing = false;
    }
  }

  tratarDano () {
    if (this.personagemLocal.isInvulnerable) return;

    this.personagemLocal.isInvulnerable = true;
    this.personagemLocal.setVelocity(0, 0);
    this.personagemLocal.anims.play('personagem-dano', true); // Garante que a animação de dano toque sem sobrepor com outras animações

    // Cor de dano mais suave
    this.personagemLocal.setTint(0xff7f7f); // Aplique um tom de vermelho mais claro

    const knockback = this.personagemLocal.flipX ? 150 : -150;
    this.personagemLocal.setVelocity(knockback, -200);

    this.isDashing = true;
    this.jumpPressed = false;

    // Não vai permitir que a animação de dano se sobreponha com outra animação durante a invulnerabilidade
    this.time.delayedCall(750, () => { // Reduzimos o tempo para 500ms
      this.personagemLocal.clearTint(); // Remove o tint de dano
      this.personagemLocal.setPosition(this.spawnPoint.x, this.spawnPoint.y); // Coloca o personagem no ponto de spawn
      this.isDashing = false;
      this.personagemLocal.isInvulnerable = false; // Permite que o personagem receba dano novamente

      // Aqui, a animação de dano é interrompida, e o personagem volta para uma animação neutra
      // Ou, dependendo de sua lógica de animações, pode retornar à animação de "parado" ou outra animação básica.
      if (this.direcaoAtual === 'direita') {
        this.personagemLocal.anims.play('personagem-parado-direita', true);
      } else {
        this.personagemLocal.anims.play('personagem-parado-esquerda', true);
      }
    });
  }




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

  createAnims () {
    this.anims.create({ key: 'personagem-andando-direita', frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-andando-esquerda', frames: this.anims.generateFrameNumbers('fox', { start: 3, end: 9 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-parado-direita', frames: this.anims.generateFrameNumbers('fox', { start: 1, end: 1 }), frameRate: 1 })
    this.anims.create({ key: 'personagem-parado-esquerda', frames: this.anims.generateFrameNumbers('fox', { start: 1, end: 1 }), frameRate: 1 })
    this.anims.create({ key: 'personagem-pulando', frames: this.anims.generateFrameNumbers('fox', { start: 19, end: 19 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-caindo', frames: this.anims.generateFrameNumbers('fox', { start: 20, end: 20 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-wallgrab', frames: this.anims.generateFrameNumbers('fox', { start: 21, end: 21 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'personagem-dash', frames: this.anims.generateFrameNumbers('fox', { start: 30, end: 33 }), frameRate: 20, repeat: 0 })

    // Alteração: A animação de dano agora é tocada uma vez, não repetidamente.
    this.anims.create({ key: 'personagem-dano', frames: this.anims.generateFrameNumbers('fox', { start: 17, end: 18 }), frameRate: 6, repeat: 0 });
    
  }
  
}
