/*global Phaser, axios*/
/*eslint no-undef: "error"*/

export default class finalacabado extends Phaser.Scene {
  constructor() {
    super('final-acabado');
  }

  init() {}

  preload() {
    this.load.image('parabens', 'assets/parabens.png'); // Imagem de fundo
    this.fontReady = false;

    WebFont.load({
      custom: {
        families: ['game-over'],
      },
      active: () => {
        this.fontReady = true;
      }
    });
  }

create (data) {
  // A lógica do Google Sign-In e do Axios está correta
  globalThis.google.accounts.id.initialize({
    client_id:
      "331191695151-ku8mdhd76pc2k36itas8lm722krn0u64.apps.googleusercontent.com",
    callback: (res) => {
      if (res.error) {
        console.error(res.error);
      } else {
        axios
          .post(
            "https://feira-de-jogos.dev.br/api/v2/credit",
            {
              product: 41, // id do jogo cadastrado no banco de dados da Feira de Jogos
              value: 500, // crédito em tijolinhos
            },
            {
              headers: {
                Authorization: `Bearer ${res.credential}`,
              }
            }
          )
          .then(function (response) {
            console.log(response);
            alert("Crédito adicionado!")
          })
          .catch(function (error) {
            console.error(error)
            alert("erro ao adicionar crédito :(")
          });
      }
    },
  });

  globalThis.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      globalThis.google.accounts.id.prompt();
    }
  });
  
  // A lógica de espera da fonte está correta
  if (!this.fontReady) {
    this.time.delayedCall(100, () => this.create(data), [], this); // Espera a fonte carregar
    return;
  }

  // --- CORREÇÃO APLICADA AQUI ---
  // 1. Crie a imagem e guarde-a na constante 'parabensImage'
  const parabensImage = this.add.image(0, 0, 'parabens').setOrigin(0).setDepth(0);

  // A exibição de texto está correta
  const verdes = data.verdes || 0;
  const vermelhos = data.vermelhos || 0;

  // Texto verde
  this.add.text(
    320, 280,
    `${verdes} / 11`,
    {
      fontFamily: 'game-over',
      fontSize: '28px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
    }
  ).setOrigin(0.5);

  // Texto vermelho
  this.add.text(
    540, 280,
    `${vermelhos} / 7`,
    {
      fontFamily: 'game-over',
      fontSize: '28px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4,
    }
  ).setOrigin(0.5);
  
  // 2. Agora use a constante 'parabensImage' para adicionar interatividade
  parabensImage.setInteractive();
  parabensImage.on('pointerdown', () => {
    console.log('A imagem foi clicada, recarregando a página...');
    location.reload();
  });

  // (Opcional) Adicionar o efeito de cursor para indicar que é clicável
  parabensImage.on('pointerover', () => {
    this.input.setDefaultCursor('pointer');
  });
  parabensImage.on('pointerout', () => {
    this.input.setDefaultCursor('default');
  });
}
  update() {}
}
