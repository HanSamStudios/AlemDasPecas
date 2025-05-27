/*global Phaser*/
/*eslint no-undef: "error"*/
export default class fase1 extends Phaser.Scene {
  constructor () {
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

  preload () {
    this.load.tilemapTiledJSON("mapa", "assets/mapa/mapa.json");
    this.load.image("arvore", "assets/mapa/arvore.png");
    this.load.image("chao", "assets/mapa/chao.png");
    this.load.image("flores", "assets/mapa/flores.png");
    this.load.image("jump", "assets/jump.png");
    this.load.image("fundo2", "assets/fundo2.png");
    this.load.image("coracao", "assets/coracao.png");
    this.load.image("casa", "assets/mapa/casa.png");
    this.load.image("back", "assets/parallax/back.png");
    this.load.image("repeat", "assets/repeat.png");
    this.load.image("vaso", "assets/mapa/vaso.png");
    this.load.image("espinhos", "assets/mapa/espinhos.png");
    this.load.spritesheet("crystal", "assets/greencrystal.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("dano", "assets/perde.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
     this.load.spritesheet("passarinho", "assets/passarinho.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("passarinho-dano", "assets/passarinho-dano.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.audio("musicaa", "assets/musicaa.mp3");
    this.load.audio("dashsound", "assets/dashsound.mp3");
    this.load.audio("crystalsound", "assets/crystalsound.mp3");
    this.load.audio("jumpsound", "assets/jumpsound.mp3");
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
      "./js/rexvirtualjoystickplugin.min.js",
      true
    );
    this.load.image("fullscreen", "assets/fullscreen.png");
  }

  create () {
    this.physics.world.createDebugGraphic();
    this.musica = this.sound.add("musicaa", {
      loop: true, // para repetir indefinidamente
      volume: 0.5, // volume entre 0 e 1
    });
    this.musica.play();
    this.somMorte = this.sound.add("morte", {
      volume: 3,
    });
    this.input.addPointer(3);

    this.tilemapMapa = this.make.tilemap({ key: "mapa" });

    this.tilesetCasa = this.tilemapMapa.addTilesetImage("casa");
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
    this.back.setAlpha(1);
    this.fundo2 = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "fundo2")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-10)
      .setAlpha(0);
    this.back.setDepth(-10);
    this.cavernaFundo = this.add
      .image(0, 0, "fundo")
      .setOrigin(0)
      .setScrollFactor(0);
    this.cavernaFundo.setAlpha(0);

    this.fundoAtual = "back";

    this.layerChao = this.tilemapMapa
      .createLayer("chao", [this.tilesetChao])
      .setDepth(10);
    this.layerEspinhos = this.tilemapMapa
      .createLayer("espinhos", [this.tilesetEspinhos])
      .setDepth(10);
    this.tilemapMapa.getObjectLayer("casa").objects.forEach((obj) => {
      this.add
        .image(obj.x, obj.y, "casa")
        .setOrigin(0, 1)
        .setDepth(5)
        .setFlipX(true)
        .setScale(1.5);
    });
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

    this.tilemapMapa.getObjectLayer("casa").objects.forEach((obj) => {
      this.add.image(obj.x, obj.y, "casa").setOrigin(0, 1); // Origem na base
    });

    if (this.game.jogadores.primeiro == this.game.socket.id) {
      this.game.remoteConnection = new RTCPeerConnection(this.game.iceServers);
      this.game.dadosJogo = this.game.remoteConnection.createDataChannel(
        "dadosJogo",
        { negotiated: true, id: 0 }
      );

      this.game.remoteConnection.onicecandidate = ({ candidate }) => {
        this.game.socket.emit("candidate", this.game.sala, candidate);
      };

      this.game.remoteConnection.ontrack = ({ streams: [stream] }) => {
        this.game.audio.srcObject = stream;
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
              this.game.remoteConnection.localDescription
            )
          )
          .catch((error) => console.error("Erro ao criar resposta:", error));
      });

      this.game.socket.on("candidate", (candidate) => {
        this.game.remoteConnection.addIceCandidate(candidate);
      });

      this.personagemLocal = this.physics.add
        .sprite(spawnPoint.x, spawnPoint.y, "fox-primeiro")
        .setDepth(10);
      this.personagemLocal.body.setSize(40, 50);
      this.personagemLocal.body.setOffset(12, 14);
      this.personagemLocal.body.setGravityY(10);

      this.personagemRemoto = this.add
        .sprite(spawnPoint.x, spawnPoint.y, "fox-segundo")
        .setDepth(6);
    } else if (this.game.jogadores.segundo == this.game.socket.id) {
      this.game.localConnection = new RTCPeerConnection(this.game.iceServers);
      this.game.dadosJogo = this.game.localConnection.createDataChannel(
        "dadosJogo",
        { negotiated: true, id: 0 }
      );

      this.game.localConnection.onicecandidate = ({ candidate }) => {
        this.game.socket.emit("candidate", this.game.sala, candidate);
      };

      this.game.localConnection.ontrack = ({ streams: [stream] }) => {
        this.game.audio.srcObject = stream;
      };

      if (this.game.midias) {
        this.game.midias
          .getTracks()
          .forEach((track) =>
            this.game.localConnection.addTrack(track, this.game.midias)
          );
      }

      this.game.localConnection
        .createOffer()
        .then((offer) => this.game.localConnection.setLocalDescription(offer))
        .then(() =>
          this.game.socket.emit(
            "offer",
            this.game.sala,
            this.game.localConnection.localDescription
          )
        );

      this.game.socket.on("answer", (description) => {
        this.game.localConnection.setRemoteDescription(description);
      });

      this.game.socket.on("candidate", (candidate) => {
        this.game.localConnection.addIceCandidate(candidate);
      });

      this.personagemLocal = this.physics.add
        .sprite(spawnPoint.x, spawnPoint.y, "fox-segundo")
        .setDepth(10);
      this.personagemLocal.body.setSize(40, 50);
      this.personagemLocal.body.setOffset(12, 14);
      this.personagemLocal.body.setGravityY(10);
      this.personagemRemoto = this.add
        .sprite(spawnPoint.x, spawnPoint.y, "fox-primeiro")
        .setDepth(6);
    } else {
      window.alert("JSala");
      this.game.stop();
      this.game.start("sala");
    }

    this.game.dadosJogo.onopen = () => {
      console.log("Conexão de dados aberta!");
    };

    this.game.dadosJogo.onmessage = (event) => {
      const dados = JSON.parse(event.data);
      if (dados.personagem) {
        this.personagemRemoto.x = dados.personagem.x;
        this.personagemRemoto.y = dados.personagem.y;
        this.personagemRemoto.setFrame(dados.personagem.frame);
      }
      if (dados.vidas !== undefined) {
        this.vidas = dados.vidas;
        this.atualizarCoracoes();
    
        // Se a vida chegou a zero pelo dado recebido, finalize localmente
        if (this.vidas <= 0) {
          this.scene.start("abertura")
          // Aqui desative controles, etc, se precisar
        }
      }
      if (dados.gameOver) {
        this.scene.start("abertura")
      }
    

      if (dados.cristal) {
        this.cristal.forEach((cristal, i) => {
          if (dados.cristal[i].visivel) {
            // Reativa o cristal se visível
            cristal.objeto.enableBody(false, cristal.x, cristal.y, true, true);
            cristal.objeto.setAlpha(1);
            cristal.objeto.setScale(1);
          } else {
            // Desativa o cristal se não visível
            cristal.objeto.disableBody(true, true);
          }
        });
      }
    if (dados.passarinho) {
      this.passarinho.x = dados.passarinho.x;
      this.passarinho.y = dados.passarinho.y;
      this.passarinho.setFrame(dados.passarinho.frame);
      this.passarinho.setFlipX(dados.passarinho.flipX);

  if (dados.passarinho.anim && this.passarinho.anims?.currentAnim?.key !== dados.passarinho.anim) {
    this.passarinho.play(dados.passarinho.anim);
  }
}
    };
    // this.personagemLocal.setTint(0x800080);
    /*candidate && 
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

    this.espinhosCaindo = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    const objetosEspinhos =
      this.tilemapMapa.getObjectLayer("espinhos_caindo").objects;

    objetosEspinhos.forEach((obj) => {
      if (obj.name === "espinho") {
        const espinho = this.espinhosCaindo
          .create(obj.x, obj.y, "espinhos")
          .setCrop(0, 0, 64, 48); // 'espinho' é o nome do sprite
        espinho.setOrigin(0, 1); // depende do seu sprite
        espinho.body.setAllowGravity(false); // começa parado
        espinho.body.setImmovable(true);

        // Armazena posição original se precisar resetar depois
        espinho.startY = obj.y;
        espinho.hasFallen = false;
      }
    });

    this.espinhosCaindo.children.iterate((espinho) => {
      espinho.startX = espinho.x;
      espinho.startY = espinho.y;
      espinho.hasFallen = false;
      espinho.setVisible(true);
      espinho.body.enable = true;
      espinho.body.setAllowGravity(false);
      espinho.body.setSize(64, 10); // apenas os últimos 10px de altura
      espinho.body.setOffset(0, 30);
    });

    this.physics.add.collider(
      this.personagemLocal,
      this.espinhosCaindo,
      (player, espinho) => {
        this.matarJogador(); // sua função de "game over" ou respawn

        // Esconde e desativa física, sem destruir o objeto
        espinho.setVisible(false);
        espinho.body.enable = false;
        espinho.body.setVelocity(0, 0);
      }
    );

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
        this.sound.play("dashsound");
        this.personagemLocal.setTint(0xffffff);
        const dashVelX =
          this.direcaoAtual === "esquerda" ? -this.dashSpeed : this.dashSpeed;
        const dashVelY = 0;
        this.personagemLocal.setVelocity(dashVelX, dashVelY);
        this.personagemLocal.anims.play("personagem-dash-direita", true);

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

    // Variáveis para vida
    this.vidas = 3;
    this.coracoes = [];

    // Cria 3 corações no canto superior esquerdo
    this.coracoes = [];
    this.animacoesDano = [];

    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 38;
      const y = 20;

      // Coração visível
      const coracao = this.add
        .image(x, y, "coracao")
        .setScrollFactor(0)
        .setDepth(1000)
        .setScale(0.5);

      this.coracoes.push(coracao);

      // Sprite para animação de dano (inicialmente invisível)
      const animDano = this.add
        .sprite(x, y, "dano")
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(1000)
        .setScale(0.5);

      this.animacoesDano.push(animDano);
    }

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

    this.cristal = [
      { x: -501.15, y: 3898.24 },
      { x: 1377.64, y: 3507.33 },
      { x: 3214.0, y: 4137.64 },
      { x: 4456.42, y: 3604.3 },
      { x: 6538.24, y: 4334.61 },
    ];

    this.cristal.forEach((cristal) => {
      cristal.objeto = this.physics.add.sprite(cristal.x, cristal.y, "crystal");
      cristal.objeto.body.setAllowGravity(false);
      cristal.objeto.play("crystal_spin");
      this.physics.add.collider(cristal.objeto, this.layerChao);
      this.physics.add.overlap(
        this.personagemLocal,
        cristal.objeto,
        (personagem, cristal) => {
          this.tweens.add({
            targets: cristal,
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              cristal.disableBody(true, true);
            },
          });
          this.sound.play("crystalsound");
          this.pontuacao += 1;
          const rainbowColors = [
            0xff0000, // vermelho
            0xff7f00, // laranja
            0xffff00, // amarelo
            0x00ff00, // verde
            0x0000ff, // azul
            0x4b0082, // anil
            0x8f00ff, // violeta
          ];

          let colorIndex = 0;

          // Intervalo que troca as cores
          const colorEvent = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
              this.personagemLocal.setTint(rainbowColors[colorIndex]);
              colorIndex = (colorIndex + 1) % rainbowColors.length;
            },
          });

          // Depois de 700ms, para o efeito e limpa a cor
          this.time.delayedCall(700, () => {
            colorEvent.remove(false); // para o evento de troca
            this.personagemLocal.clearTint(); // remove a cor
          });
        },
        null,
        this
      );
    });
    this.checarUI = () => {
      const elementosUI = [
        { nome: "Joystick", objeto: this.joystick.base },
        { nome: "Botão de Pulo", objeto: this.botaoPulo },
        { nome: "Botão de Dash", objeto: this.botaoDash },
        { nome: "Botão de Respawn", objeto: this.botaoRespawn },
      ];

      elementosUI.forEach(({ nome, objeto }) => {
        if (!objeto || !objeto.active || !objeto.visible) {
          console.warn(`[ALERTA] ${nome} não foi criado corretamente.`);
        } else {
          console.log(`[OK] ${nome} visível e ativo.`);
        }
        this.time.delayedCall(1000, () => {
          this.checarUI();
        });
      });
    };
    this.zonasDeFundo = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    const zonas = this.tilemapMapa.getObjectLayer("Triggers").objects;

    zonas.forEach((obj) => {
      if (obj.name === "mudarFundo") {
        const x = obj.x + obj.width / 2;
        const y = obj.y + obj.height / 2;

        this.zonaFundo = this.add.zone(x, y, obj.width, obj.height);
        this.physics.add.existing(this.zonaFundo);
        this.zonaFundo.body.setAllowGravity(false);
        this.zonaFundo.body.setImmovable(true);
      }
    });
    this.passarinhos = this.physics.add.group();

// 2. Cria passarinho 1
const passarinho1 = this.passarinhos.create(8180, 3854, "passarinho");
passarinho1.setDepth(10);
passarinho1.play("passarinho");
passarinho1.body.allowGravity = false;
passarinho1.body.immovable = true;
passarinho1.setVelocityX(100);
passarinho1.minX = 8100;
passarinho1.maxX = 8280;
passarinho1.atingido = false;

// 3. Cria passarinho 2
const passarinho2 = this.passarinhos.create(8380, 3854, "passarinho");
passarinho2.setDepth(10);
passarinho2.play("passarinho");
passarinho2.body.allowGravity = false;
passarinho2.body.immovable = true;
passarinho2.setVelocityX(-100);
passarinho2.minX = 8400;
passarinho2.maxX = 8800;
passarinho2.atingido = false;

    this.physics.add.overlap(this.personagemLocal, this.passarinho, () => {
  // Faz o personagem "pular" alto
  this.passarinho.setVelocityX(100);; // ajuste esse valor conforme necessário
  });
  this.passarinhos.minX = 8180.00;
  this.passarinhos.maxX = 8352.00;
    /*
    this.physics.add.overlap(
      this.personagemLocal,
      this.zonasDeFundo,
      this.trocarFundo,
      null,
      this
    );
    */
this.fullscreen = this.add.image(680, 50, "fullscreen")
  .setInteractive()
  .setDepth(50)
  .setScale(0.01)
  .setScrollFactor(0) // Corrigido: "setscrollFactor" → "setScrollFactor"
  .on("pointerdown", () => {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen(); // Corrigido: "this.cale" → "this.scale"
    } else {
      this.scale.startFullscreen();
    }
  });
}
  update () {
    this.back.tilePositionX = this.cameras.main.scrollX * 0.3;
    const angle = Phaser.Math.DegToRad(this.joystick.angle);
    const force = this.joystick.force;

    if (this.personagemLocal.isInvulnerable) return;

    if (!this.isDashing && !this.isWallGrabbing) {
      if (force > this.threshold) {
        const velocityX = Math.cos(angle) * this.speed;
        this.personagemLocal.setVelocityX(velocityX);

        if (velocityX > 0) {
          if (!this.isJumping)
            this.personagemLocal.anims.play("personagem-andando-direita", true);
          this.direcaoAtual = "direita";
        } else {
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

          const wallGrabAnim =
            this.direcaoAtual === "direita"
              ? "personagem-wallgrab-direita"
              : "personagem-wallgrab-esquerda";
          this.personagemLocal.anims.play(wallGrabAnim, true);

          this.isWallGrabbing = true;
          this.isJumping = true;
          this.ladoParedeAtual = ladoAtual;
        }
      } else if (this.personagemLocal.body.velocity.y < 0) {
        const jumpAnim =
          this.direcaoAtual === "direita"
            ? "personagem-pulando-direita"
            : "personagem-pulando-esquerda";
        this.personagemLocal.anims.play(jumpAnim, true);

        this.isWallGrabbing = false;
        this.isJumping = true;
      } else if (
        this.personagemLocal.body.velocity.y > 0 &&
        !this.isWallGrabbing
      ) {
        const fallAnim =
          this.direcaoAtual === "direita"
            ? "personagem-caindo-direita"
            : "personagem-caindo-esquerda";
        this.personagemLocal.anims.play(fallAnim, true);

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
          this.sound.play("jumpsound");
          this.ultimaParedeGrudada = this.ladoParedeAtual;
        } else {
          this.personagemLocal.setVelocityY(-300);
          this.sound.play("jumpsound");
        }

        this.isJumping = true;
        const jumpAnim =
          this.direcaoAtual === "direita"
            ? "personagem-pulando-direita"
            : "personagem-pulando-esquerda";
        this.personagemLocal.anims.play(jumpAnim, true);
        this.isWallGrabbing = false;
      }

      this.jumpPressed = false;
      this.isJumping = true;
      const jumpAnim =
        this.direcaoAtual === "direita"
          ? "personagem-pulando-direita"
          : "personagem-pulando-esquerda";
      this.personagemLocal.anims.play(jumpAnim, true);
      this.isWallGrabbing = false;
    }

    const dentroZona = Phaser.Geom.Intersects.RectangleToRectangle(
      this.personagemLocal.getBounds(),
      this.zonaFundo.getBounds()
    );

    if (dentroZona && this.fundoAtual !== "fundo2") {
      this.fundoAtual = "fundo2";
      this.tweens.add({
        targets: this.back,
        alpha: 0,
        duration: 1000,
        ease: "Linear",
      });
      this.tweens.add({
        targets: this.fundo2,
        alpha: 1,
        duration: 1000,
        ease: "Linear",
      });
    }

    if (!dentroZona && this.fundoAtual !== "back") {
      this.fundoAtual = "back";
      this.tweens.add({
        targets: this.back,
        alpha: 1,
        duration: 1000,
        ease: "Linear",
      });
      this.tweens.add({
        targets: this.fundo2,
        alpha: 0,
        duration: 1000,
        ease: "Linear",
      });
    }
    try {
      if (this.game.dadosJogo.readyState === "open") {
        if (this.personagemLocal) {
          this.game.dadosJogo.send(
            JSON.stringify({
              personagem: {
                x: this.personagemLocal.x,
                y: this.personagemLocal.y,
                frame: this.personagemLocal.frame.name,
              },
              cristal: this.cristal.map((c) => ({ visivel: c.objeto.visible })),
            })
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
    this.espinhosCaindo.children.iterate((espinho) => {
      if (!espinho.hasFallen) {
        const dx = Math.abs(espinho.x - this.personagemLocal.x);
        const dy = this.personagemLocal.y - espinho.y;

        // Se o personagem estiver a menos de 40px na horizontal
        // E estiver abaixo do espinho (dy > 0)
        if (dx < 40 && dy > 0 && dy < 300) {
          espinho.body.setAllowGravity(true);
          espinho.body.setGravityY(1000);
          espinho.hasFallen = true;

          // Não precisa mudar visibilidade aqui, ele já está visível
          espinho.body.enable = true;

          // Salva posição original ANTES de resetar
          const { startX, startY } = espinho;

          this.time.delayedCall(3000, () => {
            if (espinho && espinho.body) {
              // Reposiciona primeiro!
              espinho.setPosition(startX, startY);
              espinho.setVisible(true);
              espinho.body.enable = true;
              espinho.body.setAllowGravity(false);
              espinho.body.setVelocity(0, 0);
              espinho.hasFallen = false;
            }
          });
        }
      }
    });
   this.passarinhos.children.iterate(passarinho => {
  if (!passarinho.atingido) {
    if (passarinho.x <= passarinho.minX) {
      passarinho.setVelocityX(100);
      passarinho.setFlipX(true); // vira para a direita
    } else if (passarinho.x >= passarinho.maxX) {
      passarinho.setVelocityX(-100);
      passarinho.setFlipX(false); // vira para a esquerda
    }
  }
});
  if (this.eDonoDoPassarinho && this.game.dadosJogo?.readyState === "open") {
  const dados = {
    passarinho: {
      x: this.passarinho.x,
      y: this.passarinho.y,
      frame: this.passarinho.anims?.currentFrame?.index || 0,
      flipX: this.passarinho.flipX,
      anim: this.passarinho.anims?.currentAnim?.key || null
    },
  };
  this.game.dadosJogo.send(JSON.stringify(dados));
}

  // Também aqui pode ir a lógica do "pulão":
  this.physics.add.overlap(this.personagemLocal, this.passarinhos, (personagem, passarinho) => {
  if (!passarinho.atingido) {
    personagem.setVelocityY(-425);
    passarinho.atingido = true;

    const direcao = passarinho.body.velocity.x > 0 ? 1 : -1;

    passarinho.setVelocityX(0);
    passarinho.play("passarinho-dano");

    this.time.delayedCall(200, () => {
      passarinho.play("passarinho");
      passarinho.setVelocityX(100 * direcao);
      passarinho.setFlipX(direcao < 0);
      passarinho.atingido = false;
    });
  }
});
  }

  tratarDano () {
    if (this.personagemLocal.isInvulnerable) return;
    this.levandoDano = true;

    // Diminuir vida ao tomar dano
    if (this.vidas > 0) {
      this.vidas--;

      // Esconder o coração perdido
      if (this.coracoes[this.vidas]) {
        this.coracoes[this.vidas].setVisible(false);
      }

      // Mostrar animação de dano no mesmo lugar do coração perdido
      if (this.animacoesDano[this.vidas]) {
        const animDano = this.animacoesDano[this.vidas];
        animDano.setVisible(true);
        animDano.anims.play("dano");

        // Quando a animação terminar, esconder o sprite
        animDano.on(
          "animationcomplete",
          () => {
            animDano.setVisible(false);
          },
          this
        );
      }
    }

    if (this.vidas <= 0) {
      this.atualizarVidas();
      this.scene.start("abertura");
      return;
    }
    this.atualizarVidas();

    // Continua com o efeito de dano e invulnerabilidade
    this.personagemLocal.isInvulnerable = true;
    this.personagemLocal.setVelocity(0, 0);
    this.personagemLocal.anims.play("personagem-dano", true);
    this.personagemLocal.setTint(0xff7f7f);

    const knockback = this.direcaoAtual === "direita" ? -150 : 150; // Ajustei para bater pra trás
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

  createAnims () {
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
        { start: 39, end: 45 }
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
        { start: 36, end: 36 }
      ),
      frameRate: 1,
    });
    this.anims.create({
      key: "personagem-pulando-direita",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 19, end: 19 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-pulando-esquerda",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 55, end: 55 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-caindo-direita",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 20, end: 20 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-caindo-esquerda",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 56, end: 56 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-wallgrab-direita",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 21, end: 21 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-wallgrab-esquerda",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 57, end: 57 }
      ),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-dash-direita",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 30, end: 33 }
      ),
      frameRate: 20,
      repeat: 0,
    });
    this.anims.create({
      key: "personagem-dash-esquerda",
      frames: this.anims.generateFrameNumbers(
        this.personagemLocal.texture.key,
        { start: 66, end: 69 }
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
      frameRate: 4,
      repeat: 0,
    });
    this.anims.create({
      key: "dano",
      frames: this.anims.generateFrameNumbers("dano", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: 0,
    });
    this.anims.create({
  key: "passarinho",
  frames: this.anims.generateFrameNumbers("passarinho", {
    start: 0,
    end: 8,
  }),
  frameRate: 15,
  repeat: -1,
});
this.anims.create({
  key: "passarinho-dano",
  frames: this.anims.generateFrameNumbers("passarinho-dano", {
    start: 0,
    end: 4,
  }),
  frameRate: 2,
  repeat: 0,
});
  }

  resetarParaSpawn () {
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
  trocarFundo (personagem, zona) {
    if (zona.tipo === "mudarFundo") {
      this.back.setTexture("fundo2");

      // Opcional: remova a zona para que a troca ocorra só uma vez
      zona.destroy();
    }
  }
  matarJogador () {
    console.log("Jogador morreu! Voltando para o respawn...");

    // Reseta a posição para o spawnPoint
    this.personagemLocal.setPosition(this.spawnPoint.x, this.spawnPoint.y);

    // Zera a velocidade para evitar que ele continue caindo ou andando
    this.personagemLocal.setVelocity(0, 0);

    // Se quiser, pode limpar estados ou flags que controlam o personagem aqui
    this.isDashing = false;
    this.canDash = true;
    this.jumpPressed = false;

    // Pode também tocar algum som ou animação de "morte" antes de voltar
    // this.sound.play("deathSound");
  }
  atualizarCoracoes () {
    for (let i = 0; i < this.coracoes.length; i++) {
      if (i < this.vidas) {
        this.coracoes[i].setVisible(true);
      } else {
        this.coracoes[i].setVisible(false);
      }
    }
  }
  atualizarVidas () {
    this.atualizarCoracoes();
  
    if (this.game.dadosJogo && this.game.dadosJogo.readyState === "open") {
      // Enviar as vidas atuais e se o jogo acabou
      this.game.dadosJogo.send(JSON.stringify({
        vidas: this.vidas,
        gameOver: this.vidas <= 0
      }));
    }
  }
}

