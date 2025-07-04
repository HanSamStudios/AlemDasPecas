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
    this.load.image("tp", "assets/mapa/tp.png");
    this.load.image("objetivo", "assets/objetivo.png");
    this.load.image("chao", "assets/mapa/chao.png");
    this.load.image("fantasm", "assets/mapa/fantasm.png");
    this.load.image("placaa", "assets/mapa/placaa.png");
    this.load.image("flores", "assets/mapa/flores.png");
    this.load.image("jump", "assets/jump.png");
    this.load.image("cemiterio", "assets/cemiterio.png");
    this.load.image("plataforma", "assets/plataforma.png");
    this.load.image("dash", "assets/dash.png");
    this.load.image("fundo2", "assets/fundo2.png");
    this.load.image("coracao", "assets/coracao.png");
    this.load.image("casa", "assets/mapa/casa.png");
    this.load.image("back", "assets/parallax/back.png");
    this.load.image("repeat", "assets/repeat.png");
    this.load.image("vaso", "assets/mapa/vaso.png");
    this.load.image("espinhos", "assets/mapa/espinhos.png");
    this.load.spritesheet("foxmalmorte", "assets/foxmalmorte.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("flag", "assets/flag.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
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
    this.load.audio("horror", "assets/horror.mp3");
    this.load.audio("fantasma", "assets/fantasma.mp3");
    this.load.audio("dashsound", "assets/dashsound.mp3");
    this.load.audio("crystalsound", "assets/crystalsound.mp3");
    this.load.audio("jumpsound", "assets/jumpsound.mp3");
    this.load.audio("morte", "assets/morte.mp3");
      this.load.audio("passarosound", "assets/passarosound.mp3");
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
    this.load.spritesheet("foxmal", "assets/foxmal.png", {
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
    this.fundoEscuro = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6)
  .setOrigin(0)
  .setScrollFactor(0)
  .setDepth(999); // abaixo da imagem de objetivo
this.objetivoImagem = this.add.image(this.scale.width / 2, this.scale.height / 2, "objetivo")
  .setScrollFactor(0)
  .setDepth(1000)
  .setOrigin(0.5)
  .setDepth(10000)
  .setInteractive(); // permite clique
this.objetivoImagem.on("pointerdown", () => {
  this.objetivoImagem.destroy(); // remove a imagem
   this.fundoEscuro.destroy();
});
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
    this.tilesetTp = this.tilemapMapa.addTilesetImage("tp");
    this.tilesetChao = this.tilemapMapa.addTilesetImage("chao", null, 64, 64);
    this.tilesetFantasm = this.tilemapMapa.addTilesetImage(
      "fantasm",
      null,
      64,
      64
    );
    this.tilesetVaso = this.tilemapMapa.addTilesetImage("vaso", null, 64, 64);
    this.tilesetPlacaa = this.tilemapMapa.addTilesetImage(
      "placaa",
      null,
      64,
      64
    );
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

    this.cemiterio = this.add.tileSprite(0, 0, 800, 450, "cemiterio");
    this.cemiterio.setOrigin(0, 0);
    this.cemiterio.setScrollFactor(0);
    this.cemiterio.setAlpha(0);
    this.cemiterio.setDepth(-10);

    this.fundoAtual = "back";

    this.layerChao = this.tilemapMapa
      .createLayer("chao", [
        this.tilesetChao,
        this.tilesetFantasm,
        this.tilesetTp,
      ])
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
    this.layersetas = this.tilemapMapa
      .createLayer("setas", [this.tilesetPlacaa])
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
      window.alert("ta cheio");
      this.game.stop();
      this.game.start("sala");
    }

    this.game.dadosJogo.onopen = () => {
      console.log("Conexão de dados aberta!");
    };

  this.game.dadosJogo.onmessage = (event) => {
      const dados = JSON.parse(event.data);

     if (dados.type === "finalizou" && !this.jogoFinalizado) {
  console.log("→ Recebido sinal de finalização do outro jogador");
  this.jogoFinalizado = true;

  

  const totalVerdes = dados.verdes ?? 0;
const totalVermelhos = dados.vermelhos ?? 0;
const pontuacao = dados.pontuacao ?? 0;

  if (this.personagemLocal?.body) {
    this.personagemLocal.body.enable = false;
  }
 this.finalizarJogoRemoto(dados.pontuacao, dados.verdes ?? 0, dados.vermelhos ?? 0);
  
}
     if (dados.type === "pontuacao") {
  console.log("[RECEBIDO PONTUAÇÃO]", dados);

  this.pontuacao = dados.pontuacao;
  this.cristaisContagem.verde = dados.verdes || 0;
  this.cristaisContagem.vermelho = dados.vermelhos || 0;

 if (dados.type === "cristal-coletado") {
  const index = dados.index;
  const cristal = this.cristal?.[index];
  if (cristal && !cristal.coletado) {
    cristal.coletado = true;
    cristal.objeto.disableBody(true, true);

    this.tweens.add({
      targets: cristal.objeto,
      scale: 0,
      alpha: 0,
      duration: 300,
    });

    const tint = dados.cor;
    if (tint === 0x00ff00) {
      this.cristaisContagem.verde += 1;
    } else if (tint === 0xff6666) {
      this.cristaisContagem.vermelho += 1;
    }

    console.log("[CRISTAL REMOTO] Coletado index:", index);
  }
}




}

      if (dados.personagem) {
        this.personagemRemoto.x = dados.personagem.x;
        this.personagemRemoto.y = dados.personagem.y;
        this.personagemRemoto.setFrame(dados.personagem.frame);
      }

 if (dados.type === "vidas" && dados.vidas !== undefined) {
  if (dados.vidas < this.vidas) {
    this.vidas = dados.vidas;
    this.atualizarVidas();    // atualize a UI local também
}
 }

if (dados.gameOver && !this.jogoFinalizado) {
  this.jogoFinalizado = true;
  this.scene.start("final-perdeu");
}

if (dados.type === "cristal-coletado") {
  const index = dados.index;
  const cristal = this.cristal?.[index];

  if (cristal && !cristal.coletado) {
    cristal.coletado = true;

    this.tweens.add({
      targets: cristal.objeto,
      alpha: 0,
      scale: 0,
      duration: 300,
      onComplete: () => {
        cristal.objeto.disableBody(true, true);
      }
    });

    // Atualiza a contagem remota se quiser
    if (dados.cor === 0x00ff00) {
      this.cristaisContagem.verde += 1;
    } else if (dados.cor === 0xff6666) {
      this.cristaisContagem.vermelho += 1;
    }

    console.log(`[SYNC] Cristal #${index} escondido remotamente`);
  }
}


      if (dados.passarinho) {
        this.passarinho.x = dados.passarinho.x;
        this.passarinho.y = dados.passarinho.y;
        this.passarinho.setFrame(dados.passarinho.frame);
        this.passarinho.setFlipX(dados.passarinho.flipX);

        if (
          dados.passarinho.anim &&
          this.passarinho.anims?.currentAnim?.key !== dados.passarinho.anim
        ) {
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
        this.tratarDano();
        // sua função de "game over" ou respawn

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
      .image(635, 300, "dash")
      .setDepth(10)
      .setScrollFactor(0)
      .setInteractive();

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
    this.vidas = 5;
    this.coracoes = [];

    // Cria 3 corações no canto superior esquerdo
    this.coracoes = [];
    this.animacoesDano = [];

    for (let i = 0; i < 5; i++) {
      const x = 320 + i * 38;
      const y = 30;

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
      { x: -2233.33, y: 3746.67, cor: 0xff6666 }, // vermelho
      { x: -501.15, y: 3898.24, cor: 0x00ff00 }, // verde
      { x: 1377.64, y: 3507.33, cor: 0x00ff00 }, // azul
      { x: 2457.33, y: 4080.0, cor: 0xff6666 }, // azul
      { x: 3214.0, y: 4137.64, cor: 0x00ff00 }, // amarelo
      { x: 4456.42, y: 3604.3, cor: 0x00ff00 }, // rosa
      { x: 6551.58, y: 4333.27, cor: 0x00ff00 }, // ciano
      { x: 6992.0, y: 4540.0, cor: 0xff6666 }, // ciano
      { x: 8034.67, y: 4356.0, cor: 0xff6666 }, // ciano
      { x: 8482.0, y: 3664.67, cor: 0x00ff00 }, // branco (sem mudança)
      { x: 10442.0, y: 3508.67, cor: 0x00ff00 }, // laranja
      { x: 11978.0, y: 3395.33, cor: 0x00ff00 }, // roxo
      { x: 13281.33, y: 4369.33, cor: 0xff6666 }, // roxo
      { x: 15312.0, y: 3181.33, cor: 0x00ff00 }, // verde
      { x: 16725.33, y: 3490.67, cor: 0xff6666 }, // verde
      { x: 17170.67, y: 2542.67, cor: 0x00ff00 },
      { x: 17460.0, y: 3218.67, cor: 0xff6666 }, // branco (sem mudança)
      { x: 18416.0, y: 2338.0, cor: 0x00ff00 }, // branco (sem mudança)
    ];

    this.cristaisContagem = {
  verde: 0,
  vermelho: 0
};

this.cristal.forEach((cristal, index) => {
  cristal.objeto = this.physics.add.sprite(cristal.x, cristal.y, "crystal");
  cristal.objeto.body.setAllowGravity(false);
  cristal.objeto.play("crystal_spin");

  cristal.objeto.setTint(cristal.cor);

  this.physics.add.collider(cristal.objeto, this.layerChao);
  this.physics.add.overlap(
  this.personagemLocal,
  cristal.objeto,
  (personagem, sprite) => {
    // Buscar o objeto original da lista
    const cristal = this.cristal.find(c => c.objeto === sprite);
    if (!cristal || cristal.coletado) return;
    cristal.coletado = true;

    cristal.objeto.disableBody(true, true);

    if (this.game.dadosJogo && this.game.dadosJogo.readyState === "open") {
  this.game.dadosJogo.send(
    JSON.stringify({
      type: "cristal-coletado",
      index: index, // ← manda o índice
      cor: cristal.cor
    })
  );
}

    this.tweens.add({
      targets: cristal.objeto,
      scale: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        cristal.objeto.disableBody(true, true);
      },
    });

    this.sound.play("crystalsound");
    this.pontuacao += 1;

    const tint = cristal.cor; // agora usa a cor original corretamente
    if (tint === 0x00ff00) {
      this.cristaisContagem.verde += 1;
      console.log("[CRISTAL] Verde coletado:", this.cristaisContagem.verde);
    } else if (tint === 0xff6666) {
      this.cristaisContagem.vermelho += 1;
      console.log("[CRISTAL] Vermelho coletado:", this.cristaisContagem.vermelho);
    }

    console.log("[CRISTAL] Total:", this.pontuacao);

    if (this.game.dadosJogo && this.game.dadosJogo.readyState === "open") {
      this.game.dadosJogo.send(
        JSON.stringify({
          type: "pontuacao",
          pontuacao: this.pontuacao,
          verdes: this.cristaisContagem.verde,
          vermelhos: this.cristaisContagem.vermelho,
          cristal: this.cristal.map(c => ({ visivel: c.objeto.visible }))
        })
      );
    }

    // Efeito arco-íris
    const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x8f00ff];
    let colorIndex = 0;

    const colorEvent = this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        this.personagemLocal.setTint(rainbowColors[colorIndex]);
        colorIndex = (colorIndex + 1) % rainbowColors.length;
      },
    });

    this.time.delayedCall(700, () => {
      colorEvent.remove(false);
      this.personagemLocal.clearTint();
    });
  },
  null,
  this
  )})

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
      this.canDash = true;
      this.canAirDash = true;
    });
    this.physics.add.overlap(
    this.personagemLocal,
    this.passarinhos,
    (personagem, passarinho) => {
      if (!passarinho.atingido) {
        personagem.setVelocityY(-425);
        this.canDash = true;
        this.canAirDash = true;
        passarinho.atingido = true;

        this.sound.play("passarosound");

        const direcao = passarinho.body.velocity.x > 0 ? 1 : -1;

        passarinho.setVelocityX(0);
        passarinho.play("passarinho-dano");

        this.time.delayedCall(200, () => {
          passarinho.play("passarinho");
          passarinho.setVelocityX(100 * direcao);
          passarinho.setFlipX(direcao > 0);
          passarinho.atingido = false;
        });
      }
    }
  )
    this.passarinhos.minX = 8180.0;
    this.passarinhos.maxX = 8352.0;
    /*
    this.physics.add.overlap(
      this.personagemLocal,
      this.zonasDeFundo,
      this.trocarFundo,
      null,
      this
    );
    */
    this.fullscreen = this.add
      .image(30, 30, "fullscreen")
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

    this.plataforma = this.physics.add.sprite(11900.67, 3623.33, "plataforma");
    this.plataforma.body.setSize(64, 56);
    this.plataforma.body.setOffset(0, 8); // 64 - 52 = 12, desloca a hitbox 12px para baixo

    // Configurações básicas
    this.plataforma.body.allowGravity = false; // plataforma não cai
    this.plataforma.body.immovable = true; // plataforma não é empurrada
    this.plataforma.setVelocityX(100); // começa se movendo pra direita

    // Colisão entre personagem e plataforma
    this.physics.add.collider(this.personagemLocal, this.plataforma);

    this.plataforma.setPosition(11750, this.plataforma.y);
    this.plataforma.setVelocityX(0); // começa parada
    this.plataformaAtiva = false;
    this.plataformaDirecao = 1;
    this.replayBuffer = [];
    this.ghostDelay = 60; // atraso em frames
    this.fantasmaAtivado = false;
    this.personagemMorto = false;

    this.ghost = this.physics.add
      .sprite(0, 0, "foxmal")
      .setSize(40, 50)
      .setOffset(12, 14)
      .setAlpha(0.5)
      .setVisible(true)
      .setDepth(100);
    this.ghost.body.allowGravity = false;

    this.physics.add.overlap(this.ghost, this.personagemLocal, () => {
      this.somMorte.play();
      this.tratarDano();
    });
    this.entrouNoCemiterio = false;
    this.ghostTrailGroup = this.add.group();

    const teleportes = this.tilemapMapa.getObjectLayer("tp").objects;

    teleportes.forEach((obj) => {
      const teleporte = this.add
        .zone(obj.x, obj.y, obj.width, obj.height)
        .setOrigin(0)
        .setName(obj.name);

      this.physics.world.enable(teleporte);
      teleporte.body.setAllowGravity(false);
      teleporte.body.moves = false;

      this.physics.add.overlap(this.personagemLocal, teleporte, () => {
        if (teleporte.name === "tp1") {
          this.personagemLocal.setPosition(7509.33, 4204.0);
        } else if (teleporte.name === "tp2") {
          this.personagemLocal.setPosition(11598.67, 3565.33);
        }
      });
    });

    this.pontuacao = 0;
    this.jogoFinalizado = false;
    this.horrorScheduled = false;
    this.fantasmaFinalizado = false;
    this.flag = this.physics.add.sprite(19264.67, 2247.33, "flag");
    this.flag.body.setAllowGravity(false);
    this.flag.body.setImmovable(true);
    this.flag.anims.play("flag");
    this.flag.setScale(2);
  }

  update () {
    const emCimaDaPlataforma =
      this.personagemLocal.body.touching.down &&
      this.plataforma.body.touching.up &&
      this.personagemLocal.body.blocked.down;

    if (emCimaDaPlataforma && !this.plataformaAtiva) {
      this.plataformaAtiva = true;
      this.plataforma.setVelocityX(100); // começa indo pra direita
      this.plataformaDirecao = 1;
    }

    if (this.plataformaAtiva) {
      if (this.plataforma.x >= 12800 && this.plataformaDirecao === 1) {
        this.plataforma.setVelocityX(-100);
        this.plataformaDirecao = -1;
      } else if (this.plataforma.x <= 11750 && this.plataformaDirecao === -1) {
        this.plataforma.setVelocityX(0);
        this.plataformaAtiva = false; // desativa, esperando novo toque
      }
    }
    this.back.tilePositionX = this.cameras.main.scrollX * 0.3;
    this.cavernaFundo.tilePositionX = this.cameras.main.scrollX * 0.3;
    this.cemiterio.tilePositionX = this.cameras.main.scrollX * 0.3;
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

    const encostadoPlataformaEsquerda =
      this.personagemLocal.body.touching.left &&
      this.plataforma.body.touching.right;
    const encostadoPlataformaDireita =
      this.personagemLocal.body.touching.right &&
      this.plataforma.body.touching.left;
    const encostadoPlataforma =
      encostadoPlataformaEsquerda || encostadoPlataformaDireita;

    if (!this.personagemLocal.body.blocked.down) {
      if (
        (encostadoEsquerda || encostadoDireita || encostadoPlataforma) &&
        !this.isDashing &&
        this.personagemLocal.body.velocity.y > -100
      ) {
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

    // Verifica se o personagem passou da coordenada x:14012.12 e troca para "cemiterio"
    // Primeiro verifica se passou do limite máximo pra resetar o fundo normal
    if (this.personagemLocal.x > 19133 && !this.jogoFinalizado) {
      this.jogoFinalizado = true;

       const dadosFinal = {
    type: "finalizou",
    pontuacao: this.pontuacao,
    verdes: this.cristaisContagem.verde,
    vermelhos: this.cristaisContagem.vermelho
  };
this.finalizarJogoLocal();
    } else {
      // Se não passou do limite máximo, mantém a lógica normal do cemitério
      const dentroDoCemiterio = this.personagemLocal.x > 14012.12;

  if (
    dentroDoCemiterio &&
    !this.entrouNoCemiterio &&
    !this.jogoFinalizado
  ) {
    this.entrouNoCemiterio = true;

    console.log("→ Entrando no cemitério");
    this.fundoAtual = "cemiterio";

    this.musica.stop();
    this.sound.play("fantasma", { loop: false });
    if (!this.horrorScheduled) {
      this.horrorScheduled = true;
      this.time.delayedCall(4000, () => {
        console.log("Tocando horror");
        this.sound.play("horror", { volume: 10, loop: true });
      });
    }

        // Mostrar texto "FUGA" imediatamente
        this.time.delayedCall(1000, () => {
          const fugaText = this.add
            .text(
              this.cameras.main.centerX,
              this.cameras.main.centerY,
              "FUJA",
              {
                fontFamily: "game-over",
                fontSize: "180px",
                color: "#8B0000",
                fontStyle: "bold",
              }
            )
            .setDepth(2000)
            .setOrigin(0.5)
            .setScrollFactor(0);

          this.tweens.add({
            targets: fugaText,
            alpha: 0,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              fugaText.destroy();
            },
          });
        });

        this.cemiterio.setVisible(true);

        this.tweens.add({
          targets: this.back,
          alpha: 0,
          duration: 1000,
          ease: "Linear",
        });

        this.tweens.add({
          targets: this.cemiterio,
          alpha: 1,
          duration: 1000,
          ease: "Linear",
        });
      } else if (!dentroDoCemiterio && this.entrouNoCemiterio) {
        this.entrouNoCemiterio = false; // Reset para permitir tocar de novo se voltar

        console.log("→ Saindo do cemitério, escondendo fundo");
        this.fundoAtual = "back";
        this.musica.play();
        this.sound.stopByKey("horror");
        this.horrorScheduled = false;
        this.tweens.add({
          targets: this.cemiterio,
          alpha: 0,
          duration: 1000,
          ease: "Linear",
          onComplete: () => {
            this.cemiterio.setVisible(false);
            console.log("→ Cemitério escondido");
          },
        });
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
    }
    // Se o personagem estiver morto, desativa o fantasma e sai do update do fantasma
    if (this.personagemMorto) {
      if (this.fantasmaAtivado) {
        this.fantasmaAtivado = false;
        if (this.ghost) {
          this.ghost.setVisible(false);
          this.ghost.body.enable = false; // Desativa colisão corretamente
        }
        this.replayBuffer = [];
      }
      return;
    }

    // Ativa o fantasma apenas se passar da posição X E estiver vivo
    if (!this.fantasmaAtivado && this.personagemLocal.x > 14012.12) {
      this.fantasmaAtivado = true;
      if (this.ghost) {
        this.ghost.setVisible(true);
        this.ghost.body.enable = true;
      }
      this.replayBuffer = [];
    }

    // Atualiza fantasma somente se ativado
    if (this.fantasmaAtivado) {
      // Grava posição, flip e animação do personagem no buffer
      this.replayBuffer.push({
        x: this.personagemLocal.x,
        y: this.personagemLocal.y,
        flipX: this.personagemLocal.flipX,
        anim: this.personagemLocal.anims?.isPlaying
          ? this.personagemLocal.anims.currentAnim
            ? this.personagemLocal.anims.currentAnim.key
            : null
          : null,
      });

      // Limita tamanho do buffer (300 frames)
      if (this.replayBuffer.length > 300) {
        this.replayBuffer.shift();
      }

      // Atualiza posição do fantasma com atraso
      if (this.ghost && this.replayBuffer.length > this.ghostDelay) {
        const ghostData = this.replayBuffer[0];

        this.ghost.setPosition(ghostData.x, ghostData.y);
        this.ghost.flipX = ghostData.flipX;

        if (ghostData.anim) {
          const ghostAnimKey = ghostData.anim + "-ghost";
          if (this.ghost.anims.currentAnim?.key !== ghostAnimKey) {
            this.ghost.anims.play(ghostAnimKey, true);
          }
        }

        this.replayBuffer.shift();
      }

      // Verifica se o fantasma passou do limite X para destruir
      if (this.ghost && this.ghost.x > 19133) {
        const x = this.ghost.x;
        const y = this.ghost.y;

        this.ghost.destroy();
        this.ghost = null;
        this.fantasmaAtivado = false;
        this.replayBuffer = [];

        const morteSprite = this.add.sprite(x, y, "foxmal");

        morteSprite.anims.play("foxmalmorte");

        // Quando a animação acabar, destrói o sprite da morte
        morteSprite.on("animationcomplete", () => {
          morteSprite.destroy();
        });
      }
    }

    // Cria trilha de fantasma se ativado
    if (this.fantasmaAtivado && this.ghost) {
      if (!this.lastTrailTime || this.time.now - this.lastTrailTime > 300) {
        // intervalo 300ms
        this.lastTrailTime = this.time.now;

        const trailSprite = this.add
          .sprite(this.ghost.x, this.ghost.y, "foxmal")
          .setAlpha(0.5)
          .setTint(0xff0000) // aplica tint vermelho
          .setFlipX(this.ghost.flipX)
          .setDepth(this.ghost.depth - 1); // fica atrás do fantasma

        this.ghostTrailGroup.add(trailSprite);

        // Toca a animação que o fantasma está tocando
        if (this.ghost.anims.currentAnim) {
          trailSprite.anims.play(this.ghost.anims.currentAnim.key);
        }

        // Faz sumir em 500ms
        this.tweens.add({
          targets: trailSprite,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            trailSprite.destroy();
          },
        });
      }
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
    this.passarinhos.children.iterate((passarinho) => {
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
          anim: this.passarinho.anims?.currentAnim?.key || null,
        },
      };
      this.game.dadosJogo.send(JSON.stringify(dados));
    }

  if (this.jogoFinalizado) return;  // para não mexer no personagem após fim
  // resto do update
        
      
  
    
  }
tratarDano() {
  if (this.personagemLocal.isInvulnerable) return;
  this.levandoDano = true;

  if (this.vidas > 0) {
    this.vidas--;

    // Atualizar UI corações
    if (this.coracoes[this.vidas]) {
      this.coracoes[this.vidas].setVisible(false);
    }
    if (this.animacoesDano[this.vidas]) {
      const animDano = this.animacoesDano[this.vidas];
      animDano.setVisible(true);
      animDano.anims.play("dano");
      animDano.on(
        "animationcomplete",
        () => {
          animDano.setVisible(false);
        },
        this
      );
    }

    this.atualizarVidas();

    // **Enviar vida atualizada para o outro jogador**
    if (this.game.dadosJogo && this.game.dadosJogo.readyState === "open") {
      this.game.dadosJogo.send(
        JSON.stringify({
          type: "vidas",    // importante ter o type para identificar a mensagem
          vidas: this.vidas
        })
      );
    }

    if (this.vidas <= 0 && !this.jogoFinalizado) {
      this.jogoFinalizado = true;

      // Enviar explicitamente gameOver para garantir
      if (this.game.dadosJogo && this.game.dadosJogo.readyState === "open") {
        this.game.dadosJogo.send(
          JSON.stringify({
            type: "gameOver",
            vidas: this.vidas,
            gameOver: true,
          })
        );
      }
    }

      // **Aqui escondemos o fantasma e desativamos**
      this.fantasmaAtivado = false;
      if (this.ghost) {
        this.ghost.setVisible(false), (this.ghost.body.enable = false);
      }
      this.replayBuffer = [];
    }

    // Se morreu totalmente
    if (this.vidas <= 0) {
      this.personagemMorto = true;

      // Se quiser destruir o fantasma ao morrer totalmente:
      if (this.ghost) {
        this.ghost.destroy();
        this.ghost = null;
      }

      this.replayBuffer = [];

      this.scene.start("final-perdeu");
      return;
    }

    this.atualizarVidas();

    // Continua com o efeito de dano e invulnerabilidade
    this.personagemLocal.isInvulnerable = true;
    this.personagemLocal.setVelocity(0, 0);
    this.personagemLocal.anims.play("personagem-dano", true);
    this.personagemLocal.setTint(0xff7f7f);

    const knockback = this.direcaoAtual === "direita" ? -150 : 150; // bate pra trás
    this.personagemLocal.setVelocity(knockback, -200);

    this.isDashing = true;
    this.jumpPressed = false;
this.time.delayedCall(750, () => {
  const xAtual = this.personagemLocal.x;

  if (this.entrouNoCemiterio) {
    // ⚰️ Renasce no cemitério
    this.personagemLocal.setPosition(13138.67, 3389.33);
    if (this.sound && this.sound.isPlaying('horror')) {
      this.sound.stopByKey('horror');
    }
  } else if (xAtual > 7361.00 && xAtual < 14012.12) {
    // 📍 Renasce no ponto fixo se estiver entre os limites
    this.personagemLocal.setPosition(7422.00, 4228.00);
  } else {
    // 🏠 Renasce no ponto padrão
    this.personagemLocal.setPosition(this.spawnPoint.x, this.spawnPoint.y);
  }

  this.personagemLocal.setVelocity(0, 0); // reseta movimento
  this.personagemLocal.clearTint();

      this.isDashing = false;
      this.personagemLocal.isInvulnerable = false;

      // Animação após o respawn
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

    this.anims.create({
      key: "flag",
      frames: this.anims.generateFrameNumbers("flag", { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "foxmalmorte",
      frames: this.anims.generateFrameNumbers("foxmalmorte", {
        start: 0,
        end: 4,
      }),
      frameRate: 8,
      repeat: 0,
    });

    //sprites da raposa fantasma

    this.anims.create({
      key: "personagem-andando-direita-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 3, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-andando-esquerda-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 39, end: 45 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-parado-direita-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 1, end: 1 }),
      frameRate: 1,
    });
    this.anims.create({
      key: "personagem-parado-esquerda-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 36, end: 36 }),
      frameRate: 1,
    });
    this.anims.create({
      key: "personagem-pulando-direita-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 19, end: 19 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-pulando-esquerda-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 55, end: 55 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-caindo-direita-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 20, end: 20 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-caindo-esquerda-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 56, end: 56 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-wallgrab-direita-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 21, end: 21 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-wallgrab-esquerda-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 57, end: 57 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "personagem-dash-direita-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 30, end: 33 }),
      frameRate: 20,
      repeat: 0,
    });
    this.anims.create({
      key: "personagem-dash-esquerda-ghost",
      frames: this.anims.generateFrameNumbers("foxmal", { start: 66, end: 69 }),
      frameRate: 20,
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
 console.log("→ atualizarVidas chamada. vidas =", this.vidas);

  if (this.game.dadosJogo && this.game.dadosJogo.readyState === "open") {
    console.log("→ Enviando estado via WebSocket:", {
      vidas: this.vidas,
      gameOver: this.vidas <= 0,
    });

    this.game.dadosJogo.send(
      JSON.stringify({
        vidas: this.vidas,
        gameOver: this.vidas <= 0,
      })
      );
    }
  }

 finalizarJogoLocal() {
  // Garante que a música volta ao normal
  this.fundoAtual = "back";
  this.sound.stopByKey("horror");
  this.musica.play();

  // Esconde o cemitério
  this.tweens.add({
    targets: this.cemiterio,
    alpha: 0,
    duration: 1000,
    ease: "Linear",
    onComplete: () => {
      this.cemiterio.setVisible(false);
      console.log("→ Cemitério escondido");

      // Mensagem "obrigado"
      const obrigadoText = this.add.text(
        this.cameras.main.centerX,
        80,
        "Obrigado por jogar",
        {
          fontFamily: "game-over",
          fontSize: "35px",
          color: "#FFFFFF",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
        .setDepth(3000)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0);

      this.tweens.add({
        targets: obrigadoText,
        alpha: 1,
        duration: 1500,
        ease: "Linear",
        delay: 500,
      });

      // Mensagem da princesa
      const princesaText = this.add.text(
        this.cameras.main.centerX,
        130,
        "mas a princesa esta em outro castelo",
        {
          fontFamily: "game-over",
          fontSize: "15px",
          color: "#FFA500",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
        .setDepth(3000)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0);

      this.tweens.add({
        targets: princesaText,
        alpha: 1,
        duration: 1500,
        ease: "Linear",
        delay: 2000,
      });

      // Envia mensagem de finalização para o outro jogador
      if (this.game.dadosJogo?.readyState === "open") {
        this.game.dadosJogo.send(
          JSON.stringify({
            type: "finalizou",
            pontuacao: this.pontuacao,
            verdes: this.cristaisContagem.verde,
            vermelhos: this.cristaisContagem.vermelho,
          })
        );
      }

      // Aguarda 4 segundos antes de trocar de cena, para mostrar as mensagens
 this.time.delayedCall(7000, () => {
  let pegouTodosCristais =
    this.cristaisContagem.verde === 11 &&
    this.cristaisContagem.vermelho === 7;

  let creditos = pegouTodosCristais ? 1500 : 500;

  this.scene.start("final-unico", {
    pontuacao: this.pontuacao,
    verdes: this.cristaisContagem.verde,
    vermelhos: this.cristaisContagem.vermelho,
    creditos: creditos,
  });
})
    }
  })
}
  
        

finalizarJogoRemoto(pontuacao, verdes, vermelhos) {
  this.fundoAtual = "back";
  this.sound.stopByKey("horror");
  this.musica.play();

  this.tweens.add({
    targets: this.cemiterio,
    alpha: 0,
    duration: 1000,
    ease: "Linear",
    onComplete: () => {
      this.cemiterio.setVisible(false);
      console.log("→ Cemitério escondido (remoto)");

      const obrigadoText = this.add.text(
        this.cameras.main.centerX,
        80,
        "Obrigado por jogar",
        {
          fontFamily: "game-over",
          fontSize: "35px",
          color: "#FFFFFF",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
        .setDepth(3000)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0);

      this.tweens.add({
        targets: obrigadoText,
        alpha: 1,
        duration: 1500,
        ease: "Linear",
        delay: 500,
      });

      const princesaText = this.add.text(
        this.cameras.main.centerX,
        130,
        "mas a princesa esta em outro castelo",
        {
          fontFamily: "game-over",
          fontSize: "15px",
          color: "#FFA500",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
        .setDepth(3000)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setAlpha(0);

      this.tweens.add({
        targets: princesaText,
        alpha: 1,
        duration: 1500,
        ease: "Linear",
        delay: 2000,
      });

    this.time.delayedCall(7000, () => {
  let pegouTodosCristais = verdes === 11 && vermelhos === 7;
  let creditos = pegouTodosCristais ? 1500 : 500;

  this.scene.start("final-unico", {
    pontuacao: pontuacao,
    verdes: verdes,
    vermelhos: vermelhos,
    creditos: creditos,
  });
});
    },
  });
}

}
