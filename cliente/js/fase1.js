export default class fase1 extends Phaser.Scene {
  constructor() {
    super("fase1");

    this.threshold = 0.2;
    this.speed = 200;
    this.isJumping = false;
    this.direcaoAtual = "direita";
    this.jumpPressed = false;
    this.isDashing = false;
    this.dashSpeed = 800;
    this.canAirDash = true;
    this.canDash = true;
    this.dashCooldown = 500;
    this.isWallGrabbing = false;
    this.ultimaParedeGrudada = null;
    this.ladoParedeAtual = null;
    this.levandoDano = false;
    this.spawnPoint = null;
    this.contadorCristais = 0; // Inicialize o contador de cristais
  }

  preload() {
    this.load.tilemapTiledJSON("mapa", "assets/mapa/mapa.json");
    this.load.image("arvore", "assets/mapa/arvore.png");
    this.load.image("chao", "assets/mapa/chao.png");
    this.load.image("flores", "assets/mapa/flores.png");
    this.load.image("jump", "assets/jump.png");
    this.load.image("back", "assets/parallax/back.png");
    this.load.image("repeat", "assets/repeat.png");
    this.load.image("vaso", "assets/mapa/vaso.png");
    this.load.image("espinhos", "assets/mapa/espinhos.png");
    this.load.spritesheet("crystal", "assets/greencrystal.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.audio("musica", "assets/musica.mp3");
    this.load.audio("morte", "assets/morte.mp3");
    this.load.image("fceu", "assets/ceu.jpg");
    this.load.spritesheet("bomba", "assets/mapa/bomba.png", {
      frameWidth: 8,
      frameHeight: 8,
    });
    // personagens (colocar o segundo depois)
    this.load.spritesheet("fox-primeiro", "assets/Spritesheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("fox-segundo", "assets/foxroxo.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.plugin(
      "rexvirtualjoystickplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js",
      true
    );
  }

  create() {
    this.somMorte = this.sound.add("morte");
    this.input.addPointer(3);
    this.trailGroup = this.add.group();

    this.tilemapMapa = this.make.tilemap({ key: "mapa" });

    this.tilesetArvore = this.tilemapMapa.addTilesetImage("arvore");
    this.tilesetChao = this.tilemapMapa.addTilesetImage("chao", null, 64, 64);
    this.tilesetVaso = this.tilemapMapa.addTilesetImage("vaso", null, 64, 64);
    this.tilesetEspinhos = this.tilemapMapa.addTilesetImage("espinhos");
    this.tilesetFlores = this.tilemapMapa.addTilesetImage(
      "flores",
      null,
      64,
      32
    );
    this.back = this.add.tileSprite(0, 0, 800, 450, "back");
    this.back.setOrigin(0, 0);
    this.back.setScrollFactor(0);

    this.layerChao = this.tilemapMapa
      .createLayer("chao", [this.tilesetChao])
      .setDepth(10);
    this.layerEspinhos = this.tilemapMapa
      .createLayer("espinhos", [this.tilesetEspinhos])
      .setDepth(10);
    this.layerObjeto = this.tilemapMapa
      .createLayer("objeto", [
        this.tilesetFlores,
        this.tilesetVaso,
        this.tilesetArvore,
      ])
      .setDepth(10);

    const spawnPoint = this.tilemapMapa.findObject(
      "spawn",
      (obj) => obj.name === "spawn"
    );
    this.spawnPoint = spawnPoint;

    if (this.game.jogadores.primeiro == this.game.socket.id) {
      this.game.remoteConnection = new RTCPeerConnection(this.game.iceServers);
      this.game.dadosJogo = this.game.remoteConnection.createDataChannel(
        "dadosJogo",
        { negotiated: true, id: 0 }
      );

      this.game.remoteConnection.onicecandidate = ({ candidate }) => {
        this.game.socket.emit("candidate", this.game.sala, candidate);
      };

      this.game.remoteConnection.ontrack = ({ streams: [track] }) => {
        this.game.audio.srcObject = track;
      };

      if (this.game.midias) {
        this.game.midias.getTracks().forEach((track) => {
          this.game.remoteConnection.addTrack(track, this.game.midias);
        });
      }
      this.game.socket.on("offer", (description) => {
        this.game.remoteConnection
          .setRemoteDescription(description)
          .then(() => this.game.remoteConnection.createAnswer())
          .then((answer) =>
            this.game.remoteConnection.setLocalDescription(answer)
        )
          .then(() =>
            this.game.socket.emit(
              "answer",
              this.game.sala,
              this.game.remoteConnection.setLocalDescription
            )
        )
        .catch((error) => console.error("Ero ao criar resposta:", error))
      })

      this.personagemLocal = this.physics.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        "fox-primeiro"
      );
      this.personagemRemoto = this.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        "fox-segundo"
      );
    } else if (this.game.jogadores.segundo == this.game.socket.id) {
      this.game.localConnection = new RTCPeerConnection(this.game.iceServers);
      this.game.dadosJogo = this.game.localConnection.createDataChannel(
        "dadosJogo",
        { negotiated: true, id: 0 }
      );

      this.personagemLocal = this.physics.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        "fox-segundo"
      );
      this.personagemRemoto = this.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        "fox-primeiro"
      );
    } else {
      window.alert("Jogador não encontrado");
      this.game.stop();
      this.game.start("abertura");
    }
    // this.personagemLocal.setTint(0x800080);
    /*andidate && 
  this.personagemLocal = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox-primeiro')
  .setDepth(10)
  this.personagemLocal.body.setSize(40, 50)
  this.personagemLocal.body.setOffset(12, 14)
  this.personagemLocal.body.setGravityY(10)
  this.personagemRemoto = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'fox-segundo')
    .setDepth(10)
  this.personagemLocal.body.setSize(40, 50)
  this.personagemLocal.body.setOffset(12, 14)
  this.personagemLocal.body.setGravityY(10)
*/

    this.cameras.main.startFollow(this.personagemLocal);

    this.layerChao.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.personagemLocal, this.layerChao);

    this.espinhosObjetos = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.joystick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
      x: 125,
      y: 350,
      radius: 50,
      base: this.add
        .circle(120, 360, 50, 0x888888)
        .setScrollFactor(0)
        .setDepth(10),
      thumb: this.add
        .circle(120, 360, 25, 0xcccccc)
        .setScrollFactor(0)
        .setDepth(10),
    });

    this.botaoRespawn = this.add
      .image(750, 50, "repeat")
      .setDepth(10) // imagem do botão
      .setScrollFactor(0)
      .setInteractive()
      .setDisplaySize(60, 60); // ajuste o tamanho conforme necessário

    // Efeito visual ao pressionar
    this.botaoRespawn.on("pointerdown", () => {
      this.botaoRespawn.setDisplaySize(45, 45); // efeito de "apertado"
      this.botaoRespawn.setTint(0x999999); // escurece o botão

      this.personagemLocal.setPosition(this.spawnPoint.x, this.spawnPoint.y);
      this.personagemLocal.setVelocity(0, 0);
    });

    // Restaura o botão ao soltar
    this.botaoRespawn.on("pointerup", () => {
      this.botaoRespawn.setDisplaySize(60, 60);
      this.botaoRespawn.clearTint();
    });

    // Também restaura se o jogador mover o dedo/mouse para fora do botão
    this.botaoRespawn.on("pointerout", () => {
      this.botaoRespawn.setDisplaySize(60, 60);
      this.botaoRespawn.clearTint();
    });

    // Substituindo o botão de pulo com a imagem 'jump'
    this.botaoPulo = this.add
      .image(715, 360, "jump")
      .setDepth(10) // Usando a imagem 'jump'
      .setScrollFactor(0)
      .setInteractive();

    // Ajustando o tamanho do botão
    this.botaoPulo.setDisplaySize(100, 100); // Ajuste o tamanho conforme necessário

    // Evento de pressionar o botão
    this.botaoPulo.on("pointerdown", () => {
      this.jumpPressed = true; // Flag de pulo ativada aqui.
    });

    this.botaoDash = this.add
      .image(635, 300, "jump")
      .setDepth(10)
      .setScrollFactor(0)
      .setInteractive();

    this.botaoDash.setAngle(90);

    // Ajustando o tamanho da imagem para o botão de dash
    this.botaoDash.setDisplaySize(80, 80); // Ajuste o tamanho conforme necessário

    // Evento de pressionar o botão de dash
    this.botaoDash.on("pointerdown", () => {
      // Lógica para o botão de dash (por exemplo, ativando o dash)
      if (
        !this.isDashing &&
        this.canDash &&
        (this.personagemLocal.body.blocked.down ||
          this.canAirDash ||
          this.isWallGrabbing)
      ) {
        this.isDashing = true;
        this.canDash = false;

        if (this.isWallGrabbing) this.personagemLocal.setVelocityY(0);
        if (!this.personagemLocal.body.blocked.down) this.canAirDash = false;

        this.personagemLocal.setTint(0xffffff);
        const dashVelX = this.personagemLocal.flipX
          ? -this.dashSpeed
          : this.dashSpeed;
        const dashVelY = 0;
        this.personagemLocal.setVelocity(dashVelX, dashVelY);
        this.personagemLocal.anims.play("personagem-dash", true);

        this.time.delayedCall(150, () => {
          this.isDashing = false;
          this.personagemLocal.clearTint();
        });

        this.time.delayedCall(this.dashCooldown, () => {
          this.canDash = true;
        });

        this.isWallGrabbing = false;
      }
    });

    this.tilemapMapa
      .getObjectLayer("espinhosObjetos")
      .objects.forEach((obj) => {
        const espinho = this.add.rectangle(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          obj.width,
          obj.height
        );
        this.physics.add.existing(espinho);
        espinho.body.setAllowGravity(false);
        espinho.body.setImmovable(true);
        espinho.setVisible(false);
        this.espinhosObjetos.add(espinho);
      });

    this.physics.add.overlap(
      this.personagemLocal,
      this.espinhosObjetos,
      () => {
        if (!this.personagemLocal.isInvulnerable) {
          this.somMorte.play();
          this.tratarDano();
        }
      },
      null,
      this
    );

    this.createAnims();

    this.bomba = this.physics.add.sprite(400, 225, "bomba");
    this.bomba.body.setAllowGravity(false);
    this.bomba.setInteractive().on("pointerdown", () => {
      this.bomba.play("bomba_anim"); // Corrigi aqui a animação da bomba
    });
    this.anims.create({
      key: "crystal_spin",
      frames: this.anims.generateFrameNumbers("crystal", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.crystals = this.physics.add.group();

    const crystalObjects = this.tilemapMapa.getObjectLayer("Crystals").objects;

    crystalObjects.forEach((obj) => {
      const x = obj.x + (obj.width / 2 || 0);
      const y = obj.y - (obj.height / 2 || 0) + 50;

      const crystal = this.crystals.create(x, y, "crystal");
      crystal.body.setAllowGravity(false);
      crystal.setImmovable(true);
      crystal.play("crystal_spin");
    });

    this.physics.add.overlap(
      this.personagemLocal,
      this.crystals,
      this.coletarCristal,
      null,
      this
    );
  }

  coletarCristal(personagem, cristal) {
    cristal.body.checkCollision.none = true; // Evita múltiplas colisões

    this.tweens.add({
      targets: cristal,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => {
        cristal.destroy();
        this.contadorCristais += 1;
        console.log("Cristais Coletados:", this.contadorCristais);
      },
    });

    this.tweens.add({
      targets: this.personagemLocal,
      tint: 0x00ff00,
      duration: 150,
      onComplete: () => {
        this.personagemLocal.clearTint();
      },
    });
  }

  update() {
    this.back.tilePositionX = this.cameras.main.scrollX * 0.3;
    const angle = Phaser.Math.DegToRad(this.joystick.angle);
    const force = this.joystick.force;

    if (this.personagemLocal.isInvulnerable) return;

    if (!this.isDashing && !this.isWallGrabbing) {
      if (force > this.threshold) {
        const velocityX = Math.cos(angle) * this.speed;
        this.personagemLocal.setVelocityX(velocityX);

        if (velocityX > 0) {
          this.personagemLocal.setFlipX(false);
          if (!this.isJumping)
            this.personagemLocal.anims.play("personagem-andando-direita", true);
          this.direcaoAtual = "direita";
        } else {
          this.personagemLocal.setFlipX(true);
          if (!this.isJumping)
            this.personagemLocal.anims.play(
              "personagem-andando-esquerda",
              true
            );
          this.direcaoAtual = "esquerda";
        }
      } else {
        this.personagemLocal.setVelocityX(0);
        if (!this.isJumping && !this.isWallGrabbing) {
          if (this.direcaoAtual === "direita")
            this.personagemLocal.anims.play("personagem-parado-direita", true);
          else
            this.personagemLocal.anims.play("personagem-parado-esquerda", true);
        }
      }
    } else if (this.isDashing) {
      this.createTrail();
    }

    const tileSize = this.tilemapMapa.tileWidth;
    const playerX = this.personagemLocal.x;
    const playerY =
      this.personagemLocal.y + this.personagemLocal.body.height / 2;

    const tileLeft = this.layerChao.getTileAtWorldXY(
      playerX - tileSize / 2 - 1,
      playerY,
      true
    );
    const tileRight = this.layerChao.getTileAtWorldXY(
      playerX + tileSize / 2 + 1,
      playerY,
      true
    );

    const encostadoEsquerda =
      this.personagemLocal.body.blocked.left && tileLeft && tileLeft.collides;
    const encostadoDireita =
      this.personagemLocal.body.blocked.right &&
      tileRight &&
      tileRight.collides;

    if (!this.personagemLocal.body.blocked.down) {
      if ((encostadoEsquerda || encostadoDireita) && !this.isDashing) {
        const ladoAtual = encostadoEsquerda ? "left" : "right";

        if (this.ultimaParedeGrudada !== ladoAtual) {
          this.personagemLocal.body.setGravityY(300);
          this.personagemLocal.setVelocityY(2);

          this.personagemLocal.anims.play("personagem-wallgrab", true);
          this.isWallGrabbing = true;
          this.isJumping = true;
          this.ladoParedeAtual = ladoAtual;
        }
      } else if (this.personagemLocal.body.velocity.y < 0) {
        this.personagemLocal.anims.play("personagem-pulando", true);
        this.isWallGrabbing = false;
        this.isJumping = true;
      } else if (
        this.personagemLocal.body.velocity.y > 0 &&
        !this.isWallGrabbing
      ) {
        this.personagemLocal.anims.play("personagem-caindo", true);
        this.isJumping = true;
      }
    } else {
      this.isJumping = false;
      this.canAirDash = true;
      this.isWallGrabbing = false;
      this.personagemLocal.body.setGravityY(400);
      this.ultimaParedeGrudada = null;

      if (this.personagemLocal.body.velocity.y > 0) {
        this.personagemLocal.setVelocityY(
          Math.min(this.personagemLocal.body.velocity.y, 500)
        );
      }
    }

    if (this.jumpPressed) {
      if (this.personagemLocal.body.blocked.down || this.isWallGrabbing) {
        if (this.isWallGrabbing) {
          const impulsoX = this.ladoParedeAtual === "left" ? 200 : -200;
          this.personagemLocal.setVelocity(impulsoX, -230);
          this.ultimaParedeGrudada = this.ladoParedeAtual;
        } else {
          this.personagemLocal.setVelocityY(-300);
        }

        this.isJumping = true;
        this.personagemLocal.anims.play("personagem-pulando", true);
        this.isWallGrabbing = false;
      }

      this.jumpPressed = false;
      this.isJumping = true;
      this.personagemLocal.anims.play("personagem-pulando", true);
      this.jumpPressed = false;
      this.isWallGrabbing = false;
    }
  }

  tratarDano() {
    if (this.personagemLocal.isInvulnerable) return;

    this.personagemLocal.isInvulnerable = true;
    this.personagemLocal.setVelocity(0, 0);
    this.personagemLocal.anims.play("personagem-dano", true);
    this.personagemLocal.setTint(0xff7f7f);

    const knockback = this.personagemLocal.flipX ? 150 : -150;
    this.personagemLocal.setVelocity(knockback, -200);

    this.isDashing = true;
    this.jumpPressed = false;

    this.time.delayedCall(750, () => {
      this.personagemLocal.clearTint();
      this.personagemLocal.setPosition(this.spawnPoint.x, this.spawnPoint.y);
      this.isDashing = false;
      this.personagemLocal.isInvulnerable = false;

      if (this.direcaoAtual === "direita") {
        this.personagemLocal.anims.play("personagem-parado-direita", true);
      } else {
        this.personagemLocal.anims.play("personagem-parado-esquerda", true);
      }
    });
  }

  createTrail() {
    const trail = this.add.sprite(
      this.personagemLocal.x,
      this.personagemLocal.y,
      "fox"
    );
    trail.setAlpha(0.5);
    trail.setDepth(-1);
    trail.setFlipX(this.personagemLocal.flipX);
    trail.setFrame(this.personagemLocal.anims.currentFrame.index);
    trail.setTint(0x66ccff);

    this.trailGroup.add(trail);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scale: { from: 1, to: 1.5 },
      duration: 300,
      ease: "Cubic.easeOut",
      onComplete: () => {
        trail.destroy();
      },
    });
  }

  createAnims() {
    this.anims.create({
      key: "personagem-andando-direita",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 3, end: 9 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-andando-esquerda",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 3, end: 9 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-parado-direita",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 1, end: 1 }
      ),
      frameRate: 1,
    });
    this.anims.create({
      key: "personagem-parado-esquerda",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 1, end: 1 }
      ),
      frameRate: 1,
    });
    this.anims.create({
      key: "personagem-pulando",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 19, end: 19 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-caindo",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 20, end: 20 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-wallgrab",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 21, end: 21 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-dash",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 30, end: 33 }
      ),
      frameRate: 20,
      repeat: 0,
    });
    this.anims.create({
      key: "personagem-dano",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 17, end: 18 }
      ),
      frameRate: 6,
      repeat: 0,
    });
  }

  resetarParaSpawn() {
    this.personagemLocal.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.personagemLocal.setVelocity(0, 0);
    this.personagemLocal.clearTint();
    this.isDashing = false;
    this.isWallGrabbing = false;
    this.jumpPressed = false;
    this.personagemLocal.isInvulnerable = false;

    if (this.direcaoAtual === "direita") {
      this.personagemLocal.anims.play("personagem-parado-direita", true);
    } else {
      this.personagemLocal.anims.play("personagem-parado-esquerda", true);
    }
  }
}
