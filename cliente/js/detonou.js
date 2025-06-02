export default class Detonou extends Phaser.Scene {
  constructor() {
    super('detonou');
  }

  preload() {
    this.load.image('detonou', 'assets/detonou.png'); // Adicione essa imagem na pasta
  }

  create() {
    this.add.image(0, 0, 'detonou').setOrigin(0);
  }
}