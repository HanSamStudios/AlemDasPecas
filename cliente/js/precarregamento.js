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
    this.load.image("chao", "assets/mapa/chao.png");
    this.load.image("arvore", "assets/mapa/arvore.png");
    this.load.image("flores", "assets/mapa/flores.png");
    this.load.image("vaso", "assets/mapa/vaso.png");
    this.load.audio("horror", "assets/horror.mp3");
    this.load.image("back", "assets/parallax/back.png");
    this.load.image("repeat", "assets/repeat.png");
    this.load.image("espinhos", "assets/mapa/espinhos.png");
    this.load.setPath("assets/");
    this.load.image("jump", "jump.png");
    this.load.image("fundo2", "fundo2.png");
    this.load.image("capa", "capa.png");
    this.load.image("fceu", "ceu.jpg");
    this.load.audio("musica", "musica.mp3");
    this.load.audio("jumpsound", "jumpsound.mp3");
    this.load.audio("dashsound", "dashsound.mp3");
    this.load.audio("crystalsound", "crystalsound.mp3");
    this.load.plugin(
      "rexvirtualjoystickplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js",
      true
    );
    this.load.audio("morte", "morte.mp3");
    this.load.spritesheet("crystal", "greencrystal.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("fox-laranja", "Spritesheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("fox-roxo", "foxroxo.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("bomba", "bomba.png", {
      frameWidth: 8,
      frameHeight: 8,
    });
  }

  create() {
    this.scene.start("sala");
  }
  update() {}
}
