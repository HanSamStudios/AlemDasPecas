export default class Detonou extends Phaser.Scene {
  constructor() {
    super('detonou');
  }

  preload() {
    this.load.image('detonou', 'assets/detonou.png'); // Adicione essa imagem na pasta
  }

create() {
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
              value: 1500, // crédito em tijolinhos
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

  // --- CORREÇÃO APLICADA AQUI ---
  // 1. Crie a imagem e guarde-a na constante 'detonouImage'
  const detonouImage = this.add.image(0, 0, 'detonou').setOrigin(0);

  // 2. Agora use a constante 'detonouImage' para adicionar a interatividade
  detonouImage.setInteractive();
  detonouImage.on('pointerdown', () => {
    console.log('A imagem foi clicada, recarregando a página...');
    location.reload();
  });

  // (Opcional, mas recomendado) Mudar o cursor para "mãozinha"
  detonouImage.on('pointerover', () => {
    this.input.setDefaultCursor('pointer');
  });
  detonouImage.on('pointerout', () => {
    this.input.setDefaultCursor('default');
  });
}
  
}