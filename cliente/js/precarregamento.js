/*global Phaser*/
/*eslint no-undef: "error"*/
export default class precarregamento extends Phaser.Scene {
  constructor() {
    super("precarregamento");
  }

  init() {
    this.add.rectangle(400, 300, 468, 32).setStrokeStyle(1, 0xffffff);
    const progresso = this.add.rectangle(400 - 238, 300, 4, 28, 0xffffff);
    this.load.on("progress", (progress) => {
      progresso.width = 4 + 460 * progress;
    });
  }

  preload() {
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

  create() {
    this.scene.start("sala");
  }
  update() {}
}
