export default class finalunico extends Phaser.Scene {
  constructor() {
    super('final-unico');

    // Inicializa as propriedades da classe
    this.gameData = {};
    this.fontReady = false;
  }

  /**
   * O método init() é executado uma vez, antes de preload e create.
   * É o lugar perfeito para configurar coisas que não precisam ser recarregadas.
   */
  init(data) {
    // 1. Armazena os dados recebidos da cena anterior (ex: { verdes: 11, vermelhos: 7 })
    this.gameData = data;

    // 2. INICIALIZA A BIBLIOTECA DO GOOGLE APENAS UMA VEZ
    globalThis.google.accounts.id.initialize({
      client_id:
        "331191695151-ku8mdhd76pc2k36itas8lm722krn0u64.apps.googleusercontent.com",
      callback: (res) => {
        if (res.error) {
          console.error("Erro no login do Google:", res.error);
          alert("Ocorreu um erro durante o login com o Google.");
          return;
        }
        data.verdes = 11;
  data.vermelhos = 7;
        // Calcula os créditos aqui dentro, usando os dados que guardamos em this.gameData
        const pegouTodos = (this.gameData.verdes === 11 && this.gameData.vermelhos === 7);
        const creditos = pegouTodos ? 1500 : 500;

        // O resto da lógica de envio para o servidor permanece igual
        axios
          .post(
            "https://feira-de-jogos.dev.br/api/v2/credit",
            {
              product: 41,
              value: creditos,
            },
            {
              headers: {
                Authorization: `Bearer ${res.credential}`,
              },
            }
          )
          .then(function (response) {
            console.log(response);
            alert("Crédito adicionado com sucesso!");
          })
          .catch(function (error) {
            console.error("Erro ao enviar crédito:", error);
            alert("Ops! Ocorreu um erro ao adicionar seu crédito. :(");
          });
      },
    });
  }

  /**
   * Carrega todas as imagens e fontes necessárias para a cena.
   */
  preload() {
    this.load.image('detonou', 'assets/detonou.png');
    this.load.image('parabens', 'assets/parabens.png');

    // Carrega a fonte customizada e define a flag 'fontReady' como true quando estiver pronta
    WebFont.load({
      custom: {
        families: ['game-over'],
      },
      active: () => {
        this.fontReady = true;
      }
    });
  }

  /**
   * Cria os objetos e a lógica da cena.
   */
  create() {
    
    // Determina qual imagem de fundo usar
    const pegouTodos = (this.gameData.verdes === 11 && this.gameData.vermelhos === 7);
    const imagem = pegouTodos ? 'detonou' : 'parabens';

    this.add.image(0, 0, imagem).setOrigin(0);

    // 3. CHAMA O PROMPT DE LOGIN (o pop-up) ASSIM QUE A CENA É CRIADA
    // A configuração já foi feita no init(), aqui apenas pedimos para ele aparecer.
    globalThis.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn("O prompt de login do Google não foi exibido.");
        // OBS: Não chame `prompt()` de novo aqui. Se o pop-up não aparecer,
        // o ideal é ter um botão na tela "Salvar Pontuação" para o usuário clicar.
      }
    });

    // 4. CHAMA A FUNÇÃO QUE IRÁ RENDERIZAR OS TEXTOS
    // Essa função vai esperar a fonte carregar antes de criar os textos.
    this.renderTextsWhenReady();
  }

  /**
   * Função auxiliar que espera a fonte estar pronta para renderizar os textos.
   * Isso evita o loop que quebrava o login do Google.
   */
  renderTextsWhenReady() {
    // Se a fonte ainda não carregou, espera 100ms e tenta de novo.
    if (!this.fontReady) {
      this.time.delayedCall(100, this.renderTextsWhenReady, [], this);
      return;
    }

    // Agora que a fonte está pronta, podemos criar os textos com segurança.
    const pegouTodos = (this.gameData.verdes === 11 && this.gameData.vermelhos === 7);

    // Só mostra os textos de contagem se o jogador não pegou todos os cristais
    if (!pegouTodos) {
      const verdes = this.gameData.verdes || 0;
      const vermelhos = this.gameData.vermelhos || 0;

      this.add.text(
        320, 280, `${verdes} / 11`, {
          fontFamily: 'game-over',
          fontSize: '28px',
          color: '#00ff00',
          stroke: '#000000',
          strokeThickness: 4,
        }
      ).setOrigin(0.5);

      this.add.text(
        540, 280, `${vermelhos} / 7`, {
          fontFamily: 'game-over',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4,
        }
      ).setOrigin(0.5);
    }
  }

  update() {
    // O método update pode ficar vazio se não houver lógica de jogo contínua nesta cena.
  }
}