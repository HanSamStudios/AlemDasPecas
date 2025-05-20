/*global Phaser*/
/*eslint no-undef: "error"*/
export default {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  pixelArt: true,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 100 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
