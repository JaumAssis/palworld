// Módulo "Fundamentos" (iniciante) — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ../../index.js para o formato e a validação de boot. Sintaxe GML
// (GameMaker Language) usada nos exemplos de código — a linguagem de script do GameMaker Studio.
// Ids não são numericamente sequenciais na ordem pedagógica: gm-11/gm-12/gm-13 foram inseridas
// depois, entre lições já numeradas, no ponto do array onde fazem mais sentido (condicionais e
// laços antes de Movimento, que já usa if; mouse logo depois de Movimento/teclado; instâncias
// logo depois de Colisões, de onde nasce o padrão criar/destruir).
module.exports = {
  id: 'fundamentos-gamemaker',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Sprites, objetos, eventos, salas e a lógica básica de um jogo',
  accent: '#f472b6',
  lessons: [
    {
      id: 'gm-01-intro',
      title: 'O que é o GameMaker',
      goal: 'Entender a IDE do GameMaker e os 3 blocos fundamentais: sprites, objetos e salas.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é o GameMaker?',
            body: 'GameMaker é uma engine (motor de jogo) que permite criar jogos 2D sem precisar programar tudo do zero — ele já resolve problemas comuns (desenhar na tela, detectar teclas, física básica), deixando você focar na lógica do SEU jogo.'
          },
          {
            title: 'Os 3 blocos fundamentais',
            body: 'Todo jogo no GameMaker é montado com três peças principais: SPRITES (as imagens), OBJETOS (o comportamento) e SALAS/ROOMS (onde tudo acontece).'
          },
          {
            title: 'A área de trabalho (workspace)',
            body: 'A IDE do GameMaker organiza tudo em pastas: Sprites, Objects, Rooms, Sounds, entre outras — cada recurso do seu jogo fica guardado numa dessas pastas.'
          },
          {
            title: 'Rodando o jogo (Run)',
            body: 'O botão de "Run" compila e executa seu jogo, permitindo testar imediatamente o que foi criado, sem sair da IDE.'
          },
          {
            title: 'Por que separar sprite e objeto?',
            body: 'Separar a aparência (sprite) do comportamento (objeto) permite reaproveitar: o mesmo objeto pode trocar de sprite (ex: personagem correndo x parado), e o mesmo sprite pode ser usado por objetos diferentes.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é o GameMaker?',
          choices: [
            { id: 'a', text: 'Uma engine (motor de jogo) que facilita a criação de jogos 2D' },
            { id: 'b', text: 'Uma linguagem de programação isolada, sem interface gráfica' },
            { id: 'c', text: 'Um editor de imagens apenas' },
            { id: 'd', text: 'Um tipo de banco de dados' }
          ],
          answer: 'a',
          explanation: 'GameMaker é uma engine completa, com editor visual e linguagem de script própria.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quais são os 3 blocos fundamentais para montar um jogo no GameMaker?',
          choices: [
            { id: 'a', text: 'Sprites, objetos e salas (rooms)' },
            { id: 'b', text: 'Só código, sem recursos visuais' },
            { id: 'c', text: 'Vetores, matrizes e funções' },
            { id: 'd', text: 'Apenas sons e músicas' }
          ],
          answer: 'a',
          explanation: 'Sprites (imagem), objetos (comportamento) e salas (onde tudo acontece) são os pilares de qualquer projeto.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que um SPRITE representa no GameMaker?',
          choices: [
            { id: 'a', text: 'A imagem/aparência visual de algo no jogo' },
            { id: 'b', text: 'O comportamento de um personagem' },
            { id: 'c', text: 'Uma sala inteira do jogo' },
            { id: 'd', text: 'Um efeito sonoro' }
          ],
          answer: 'a',
          explanation: 'O sprite é puramente visual — o que aparece desenhado na tela.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o recurso que representa o COMPORTAMENTO de algo no jogo (diferente da imagem):',
          code: 'No GameMaker, o comportamento de algo no jogo é definido por um ___.',
          accept: ['objeto'],
          explanation: 'O objeto define o que aquele elemento do jogo FAZ, separado de sua aparência.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que uma SALA (room) representa?',
          choices: [
            { id: 'a', text: 'O lugar onde os objetos do jogo são posicionados e onde a ação acontece' },
            { id: 'b', text: 'Só a tela de menu principal' },
            { id: 'c', text: 'Um tipo de som de fundo' },
            { id: 'd', text: 'Um arquivo de configuração' }
          ],
          answer: 'a',
          explanation: 'A sala é o palco onde as instâncias de objetos existem e interagem.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que separar a aparência (sprite) do comportamento (objeto)?',
          choices: [
            { id: 'a', text: 'Permite reaproveitar: o mesmo objeto pode trocar de sprite, e o mesmo sprite pode servir a objetos diferentes' },
            { id: 'b', text: 'Não existe motivo real, é só uma imposição da engine' },
            { id: 'c', text: 'Sprites não podem ser reaproveitados de jeito nenhum' },
            { id: 'd', text: 'Objetos sempre têm um único sprite fixo para sempre' }
          ],
          answer: 'a',
          explanation: 'Essa separação é o que dá flexibilidade para reaproveitar recursos visuais e de comportamento.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que o botão "Run" faz na IDE do GameMaker?',
          choices: [
            { id: 'a', text: 'Compila e executa o jogo, para testar o que foi criado' },
            { id: 'b', text: 'Apaga todos os recursos do projeto' },
            { id: 'c', text: 'Só salva o projeto, sem executar nada' },
            { id: 'd', text: 'Abre um editor de sons' }
          ],
          answer: 'a',
          explanation: 'Run compila o projeto e roda o jogo imediatamente, para testes rápidos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do recurso que guarda a imagem/aparência de algo no jogo:',
          code: 'No GameMaker, a imagem/aparência de algo no jogo é definida por um ___.',
          accept: ['sprite'],
          explanation: 'O sprite é o recurso visual, separado do objeto que define o comportamento.'
        }
      ]
    },
    {
      id: 'gm-02-sprites-objetos',
      title: 'Sprites e objetos',
      goal: 'Associar um sprite a um objeto e entender a diferença entre objeto e instância.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Criando um objeto a partir de um sprite',
            body: 'Ao criar um novo objeto, associamos um sprite a ele no campo "Sprite" — esse sprite é o que será desenhado na tela sempre que uma instância desse objeto existir.'
          },
          {
            title: 'Um sprite pode ser usado por vários objetos',
            body: 'Nada impede reaproveitar o mesmo sprite em objetos diferentes — por exemplo, um sprite de "moeda" pode ser usado tanto pelo objeto "moeda_bronze" quanto "moeda_prata", cada um com seu próprio comportamento.'
          },
          {
            title: 'Um objeto pode trocar de sprite em tempo de execução',
            body: 'Um objeto não fica preso a um único sprite: é possível trocar o sprite dele durante o jogo (ex: personagem parado vs correndo), usando a variável sprite_index.',
            code: 'sprite_index = spr_personagem_correndo'
          },
          {
            title: 'Instância x objeto: qual a diferença?',
            body: 'O OBJETO é o "molde" (definido uma vez no editor); uma INSTÂNCIA é uma cópia concreta desse objeto colocada numa sala — você pode ter várias instâncias do mesmo objeto ao mesmo tempo.'
          },
          {
            title: 'Onde objetos são posicionados',
            body: 'Objetos são colocados dentro de uma sala (room), que define a posição inicial de cada instância quando o jogo começa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Ao criar um objeto novo, o que o campo "Sprite" define?',
          choices: [
            { id: 'a', text: 'Qual imagem será desenhada na tela para esse objeto' },
            { id: 'b', text: 'O comportamento do objeto' },
            { id: 'c', text: 'O som que o objeto emite' },
            { id: 'd', text: 'A sala onde o objeto aparece' }
          ],
          answer: 'a',
          explanation: 'O campo Sprite só associa a aparência visual, não o comportamento.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'É possível o mesmo sprite ser usado por objetos diferentes?',
          choices: [
            { id: 'a', text: 'Sim, um sprite pode ser reaproveitado por vários objetos diferentes' },
            { id: 'b', text: 'Não, cada sprite só pode pertencer a um único objeto' },
            { id: 'c', text: 'Só é possível com sprites de personagens' },
            { id: 'd', text: 'Só se os objetos tiverem o mesmo nome' }
          ],
          answer: 'a',
          explanation: 'Sprites são recursos independentes, reaproveitáveis por quantos objetos forem necessários.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a variável sprite_index permite fazer?',
          choices: [
            { id: 'a', text: 'Trocar o sprite exibido por um objeto durante o jogo' },
            { id: 'b', text: 'Mudar a sala atual' },
            { id: 'c', text: 'Tocar um som' },
            { id: 'd', text: 'Apagar o objeto' }
          ],
          answer: 'a',
          explanation: 'sprite_index aponta para qual sprite está sendo usado naquele momento pela instância.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a variável usada para trocar o sprite de um objeto em tempo de execução:',
          code: '___ = spr_personagem_correndo',
          accept: ['sprite_index'],
          explanation: 'sprite_index é a variável que define qual sprite a instância está usando.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a diferença entre um objeto e uma instância?',
          choices: [
            { id: 'a', text: 'O objeto é o molde definido uma vez; a instância é uma cópia concreta desse objeto numa sala' },
            { id: 'b', text: 'São exatamente a mesma coisa, sem diferença' },
            { id: 'c', text: 'Uma instância só pode existir se não houver objeto' },
            { id: 'd', text: 'Um objeto só pode ter uma instância no jogo inteiro' }
          ],
          answer: 'a',
          explanation: 'Essa distinção é fundamental: o objeto é a definição; a instância é a cópia em uso.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'É possível ter várias instâncias do mesmo objeto numa sala?',
          choices: [
            { id: 'a', text: 'Sim, o mesmo objeto pode ter quantas instâncias forem necessárias' },
            { id: 'b', text: 'Não, cada objeto só pode existir uma vez por sala' },
            { id: 'c', text: 'Só é possível com objetos de inimigo' },
            { id: 'd', text: 'Depende do tamanho do sprite' }
          ],
          answer: 'a',
          explanation: 'Um mesmo objeto (como "inimigo") pode ter dezenas de instâncias na mesma sala.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde as instâncias de um objeto são posicionadas inicialmente?',
          choices: [
            { id: 'a', text: 'Dentro de uma sala (room)' },
            { id: 'b', text: 'Dentro do próprio sprite' },
            { id: 'c', text: 'Num arquivo de som' },
            { id: 'd', text: 'Não é preciso posicionar nada' }
          ],
          answer: 'a',
          explanation: 'A sala é onde definimos a posição inicial de cada instância do jogo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que descreve uma cópia concreta de um objeto colocada numa sala:',
          code: 'Uma cópia concreta de um objeto, colocada numa sala, é chamada de ___.',
          accept: ['instância', 'instancia'],
          explanation: 'Instância é o nome dado a cada cópia individual de um objeto presente no jogo.'
        }
      ]
    },
    {
      id: 'gm-03-eventos',
      title: 'Eventos (Events)',
      goal: 'Entender o modelo orientado a eventos do GameMaker: Create, Step e Draw.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é um evento?',
            body: 'No GameMaker, um objeto reage a EVENTOS — momentos específicos em que um pedaço de código (ou blocos de ação) é executado. Em vez de um programa rodar de cima a baixo, cada evento roda quando sua condição acontece.'
          },
          {
            title: 'O evento Create',
            body: 'Create roda UMA VEZ, assim que a instância é criada — é o lugar ideal para definir variáveis iniciais daquele objeto.',
            code: '// Evento Create\nvida = 100\npontos = 0'
          },
          {
            title: 'O evento Step',
            body: 'Step roda a CADA FRAME do jogo (muitas vezes por segundo) — é onde a maior parte da lógica de movimento e verificação acontece.',
            code: '// Evento Step\nx += 2  // move 2 pixels para a direita a cada frame'
          },
          {
            title: 'O evento Draw',
            body: 'Draw roda a cada frame também, mas é reservado especificamente para DESENHAR algo na tela — se você sobrescrever o Draw, precisa desenhar o sprite manualmente com draw_self() ou funções de desenho.'
          },
          {
            title: 'Outros eventos comuns',
            body: 'Existem eventos para colisão (Collision), teclado (Keyboard), destruição (Destroy) e muitos outros — cada um dispara em um momento específico do ciclo de vida da instância.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um evento no GameMaker?',
          choices: [
            { id: 'a', text: 'Um momento específico em que um pedaço de código/ação é executado' },
            { id: 'b', text: 'Um tipo de sprite animado' },
            { id: 'c', text: 'Um arquivo de som' },
            { id: 'd', text: 'Uma sala do jogo' }
          ],
          answer: 'a',
          explanation: 'O modelo de eventos organiza QUANDO cada trecho de código roda.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quando o evento Create é executado?',
          choices: [
            { id: 'a', text: 'Uma única vez, assim que a instância é criada' },
            { id: 'b', text: 'A cada frame do jogo' },
            { id: 'c', text: 'Só quando o jogador aperta uma tecla' },
            { id: 'd', text: 'Nunca é executado automaticamente' }
          ],
          answer: 'a',
          explanation: 'Create roda só uma vez, no nascimento da instância — ideal para inicializações.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Quando o evento Step é executado?',
          choices: [
            { id: 'a', text: 'A cada frame do jogo, repetidamente' },
            { id: 'b', text: 'Só uma vez, ao criar a instância' },
            { id: 'c', text: 'Só ao final do jogo' },
            { id: 'd', text: 'Só quando ocorre uma colisão' }
          ],
          answer: 'a',
          explanation: 'Step é o "coração" do loop do jogo, rodando continuamente enquanto a instância existir.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o evento que roda uma única vez, ao criar a instância, ideal para definir variáveis iniciais:',
          code: 'O evento que roda uma única vez, ao criar a instância, se chama ___.',
          accept: ['Create', 'create'],
          explanation: 'Create é o evento de inicialização de uma instância.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que serve o evento Draw?',
          choices: [
            { id: 'a', text: 'Desenhar algo na tela, executado a cada frame' },
            { id: 'b', text: 'Tocar um som' },
            { id: 'c', text: 'Definir variáveis iniciais' },
            { id: 'd', text: 'Só é usado para colisões' }
          ],
          answer: 'a',
          explanation: 'Draw é reservado para desenhar sprites, textos e outros elementos visuais.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde normalmente colocamos a lógica de movimento de um objeto?',
          choices: [
            { id: 'a', text: 'No evento Step, que roda a cada frame' },
            { id: 'b', text: 'No evento Create, que roda só uma vez' },
            { id: 'c', text: 'No evento Draw, que é só para desenhar' },
            { id: 'd', text: 'Não existe lugar certo para isso' }
          ],
          answer: 'a',
          explanation: 'Movimento precisa ser recalculado continuamente, o que combina com o Step.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Além de Create, Step e Draw, qual outro evento comum existe no GameMaker?',
          choices: [
            { id: 'a', text: 'Collision (colisão)' },
            { id: 'b', text: 'Print' },
            { id: 'c', text: 'Import' },
            { id: 'd', text: 'Return' }
          ],
          answer: 'a',
          explanation: 'Collision é outro evento essencial, disparado quando duas instâncias se tocam.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o evento que roda a cada frame do jogo, geralmente usado para movimento e lógica:',
          code: 'O evento que roda a cada frame do jogo se chama ___.',
          accept: ['Step', 'step'],
          explanation: 'Step é o evento repetido a cada frame, ideal para lógica contínua.'
        }
      ]
    },
    {
      id: 'gm-04-salas',
      title: 'Salas (Rooms)',
      goal: 'Entender rooms como as fases/cenas do jogo e como trocar entre elas.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é uma sala (room)?',
            body: 'Uma sala representa uma fase, tela ou cena do jogo — um menu, uma fase de plataforma, uma tela de game over podem ser cada uma sua própria sala.'
          },
          {
            title: 'Posicionando instâncias numa sala',
            body: 'No editor de salas, arrastamos objetos para dentro da sala, definindo a posição inicial (x, y) de cada instância quando o jogo começar naquela sala.'
          },
          {
            title: 'Trocando de sala durante o jogo',
            body: 'A função room_goto(sala) muda o jogo para outra sala — usada, por exemplo, ao terminar uma fase ou abrir um menu.',
            code: 'room_goto(rm_fase2)'
          },
          {
            title: 'A ordem das salas',
            body: 'As salas ficam listadas numa ordem no projeto; room_goto_next() e room_goto_previous() avançam ou voltam nessa lista, útil para fases sequenciais.'
          },
          {
            title: 'O tamanho da sala x o tamanho da tela (view)',
            body: 'Uma sala pode ser maior que a tela visível — o jogo mostra só uma PARTE da sala por vez, geralmente seguindo o personagem, através de um recurso chamado "view" (câmera).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que uma sala (room) representa no GameMaker?',
          choices: [
            { id: 'a', text: 'Uma fase, tela ou cena do jogo' },
            { id: 'b', text: 'Um único sprite' },
            { id: 'c', text: 'Um efeito sonoro' },
            { id: 'd', text: 'Uma variável do jogo' }
          ],
          answer: 'a',
          explanation: 'A sala é a unidade de cena/fase do jogo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como as instâncias são posicionadas dentro de uma sala?',
          choices: [
            { id: 'a', text: 'Arrastando objetos para dentro do editor de salas, definindo a posição x, y de cada uma' },
            { id: 'b', text: 'Automaticamente, sem controle nenhum' },
            { id: 'c', text: 'Só por código, nunca pelo editor visual' },
            { id: 'd', text: 'Não é possível posicionar instâncias' }
          ],
          answer: 'a',
          explanation: 'O editor de salas permite posicionar visualmente cada instância inicial.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a função room_goto(sala) faz?',
          choices: [
            { id: 'a', text: 'Muda o jogo para a sala indicada' },
            { id: 'b', text: 'Cria uma sala nova do zero' },
            { id: 'c', text: 'Apaga a sala atual' },
            { id: 'd', text: 'Só funciona no evento Draw' }
          ],
          answer: 'a',
          explanation: 'room_goto transiciona o jogo inteiro para outra sala do projeto.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para mudar o jogo para a próxima sala da lista:',
          code: '___()  // avança para a próxima sala do projeto',
          accept: ['room_goto_next'],
          explanation: 'room_goto_next() avança para a sala seguinte na ordem do projeto.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Uma sala pode ser maior que a tela visível do jogo?',
          choices: [
            { id: 'a', text: 'Sim, o jogo mostra só uma parte da sala por vez, geralmente através de uma "view"' },
            { id: 'b', text: 'Não, a sala sempre tem exatamente o tamanho da tela' },
            { id: 'c', text: 'Só salas de menu podem ser maiores' },
            { id: 'd', text: 'Isso nunca é possível no GameMaker' }
          ],
          answer: 'a',
          explanation: 'Salas grandes com uma view (câmera) seguindo o jogador são muito comuns.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que uma "view" (câmera) faz numa sala maior que a tela?',
          choices: [
            { id: 'a', text: 'Mostra só uma parte da sala por vez, geralmente seguindo o personagem' },
            { id: 'b', text: 'Aumenta o tamanho de todos os sprites' },
            { id: 'c', text: 'Muda a cor de fundo da sala' },
            { id: 'd', text: 'Não tem relação com o tamanho da sala' }
          ],
          answer: 'a',
          explanation: 'A view recorta a parte visível da sala, como uma câmera.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que é comum ter uma sala separada para o menu principal e outra para cada fase do jogo?',
          choices: [
            { id: 'a', text: 'Cada sala representa uma cena distinta, facilitando organizar o fluxo do jogo' },
            { id: 'b', text: 'O GameMaker só permite uma sala no projeto inteiro' },
            { id: 'c', text: 'Menus não podem ser salas' },
            { id: 'd', text: 'Não existe vantagem nenhuma nessa separação' }
          ],
          answer: 'a',
          explanation: 'Separar em salas distintas organiza o fluxo entre menu, fases e telas de fim de jogo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que muda o jogo para uma sala específica, passada como argumento:',
          code: '___(rm_fase2)',
          accept: ['room_goto'],
          explanation: 'room_goto(sala) transiciona diretamente para a sala indicada.'
        }
      ]
    },
    {
      id: 'gm-05-variaveis-gml',
      title: 'Variáveis e GML básico',
      goal: 'Entender variáveis de instância e a sintaxe básica de GML.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'GML: a linguagem do GameMaker',
            body: 'GML (GameMaker Language) é a linguagem de script usada para programar comportamentos mais avançados que o simples arrastar-e-soltar — parecida com outras linguagens de programação, com variáveis, condicionais e laços.'
          },
          {
            title: 'Variáveis de instância',
            body: 'Cada instância pode ter suas próprias variáveis, geralmente definidas no evento Create, guardando dados como vida, pontos ou velocidade.',
            code: '// Create\nvida = 100\nvelocidade = 4'
          },
          {
            title: 'Atribuição e operadores em GML',
            body: 'GML usa = para atribuir um valor e == para comparar — muito parecido com outras linguagens de programação que você já viu.',
            code: 'vida = vida - 10\nse_morreu = (vida <= 0)'
          },
          {
            title: 'Comentários em GML',
            body: '// inicia um comentário de uma linha, ignorado pelo GameMaker ao executar o código — útil para explicar o que um trecho faz.'
          },
          {
            title: 'Variáveis globais x variáveis de instância',
            body: 'Uma variável de instância pertence só àquela instância específica; já uma variável GLOBAL (usando global.nome) é compartilhada por todo o jogo, acessível de qualquer objeto.',
            code: 'global.pontuacao_total = 0'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é GML?',
          choices: [
            { id: 'a', text: 'A linguagem de script usada para programar comportamentos no GameMaker' },
            { id: 'b', text: 'Um tipo de sprite animado' },
            { id: 'c', text: 'Um formato de imagem' },
            { id: 'd', text: 'Um efeito sonoro' }
          ],
          answer: 'a',
          explanation: 'GML é a linguagem de programação própria do GameMaker.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Onde geralmente definimos as variáveis iniciais de uma instância?',
          choices: [
            { id: 'a', text: 'No evento Create' },
            { id: 'b', text: 'No evento Draw' },
            { id: 'c', text: 'Numa sala' },
            { id: 'd', text: 'Num sprite' }
          ],
          answer: 'a',
          explanation: 'Create roda uma vez, no momento ideal para inicializar variáveis.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual operador é usado para ATRIBUIR um valor a uma variável em GML?',
          choices: [
            { id: 'a', text: '=' },
            { id: 'b', text: '==' },
            { id: 'c', text: ':=' },
            { id: 'd', text: '<-' }
          ],
          answer: 'a',
          explanation: '= atribui um valor à variável, igual em várias outras linguagens.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o símbolo usado para iniciar um comentário de uma linha em GML:',
          code: '___ isso é um comentário',
          accept: ['//'],
          explanation: '// marca o início de um comentário de linha em GML.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que uma variável GLOBAL (como global.pontuacao_total) permite?',
          choices: [
            { id: 'a', text: 'Ser acessada e compartilhada por qualquer objeto do jogo' },
            { id: 'b', text: 'Existir só dentro de uma única instância' },
            { id: 'c', text: 'Ser usada apenas no evento Create' },
            { id: 'd', text: 'Não existe esse conceito em GML' }
          ],
          answer: 'a',
          explanation: 'O prefixo global. torna a variável acessível a partir de qualquer objeto.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual operador é usado para COMPARAR se dois valores são iguais em GML?',
          choices: [
            { id: 'a', text: '==' },
            { id: 'b', text: '=' },
            { id: 'c', text: '===' },
            { id: 'd', text: 'equals' }
          ],
          answer: 'a',
          explanation: '== compara dois valores, diferente do = que atribui.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Uma variável de instância definida no Create de um objeto:',
          choices: [
            { id: 'a', text: 'Pertence só àquela instância específica' },
            { id: 'b', text: 'É automaticamente compartilhada com todas as instâncias do jogo' },
            { id: 'c', text: 'Só existe durante o evento Create' },
            { id: 'd', text: 'Não pode guardar números' }
          ],
          answer: 'a',
          explanation: 'Cada instância tem sua própria cópia das variáveis definidas no Create.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o prefixo usado para declarar uma variável global em GML:',
          code: '___.pontuacao_total = 0',
          accept: ['global'],
          explanation: 'global. é o prefixo que torna uma variável compartilhada por todo o jogo.'
        }
      ]
    },
    {
      id: 'gm-11-condicionais-lacos',
      title: 'Condicionais e laços em GML',
      goal: 'Tomar decisões com if/else e repetir ações com repeat, while e for.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que decisões e repetições',
            body: 'Todo jogo precisa reagir a condições (a vida acabou? o botão foi clicado?) e, às vezes, repetir uma ação várias vezes seguidas dentro do mesmo código — é isso que condicionais e laços fazem.'
          },
          {
            title: 'if e else',
            body: 'if (condição) { ... } executa um bloco só quando a condição é verdadeira; um else opcional executa outro bloco quando ela é falsa.',
            code: 'if (vida <= 0) {\n    instance_destroy()\n} else {\n    vida -= 10\n}'
          },
          {
            title: 'Operadores de comparação e lógicos',
            body: 'Dentro de um if usamos comparações (==, !=, <, >, <=, >=) e operadores lógicos para combinar condições: && significa "E" (as duas precisam ser verdadeiras) e || significa "OU" (basta uma ser verdadeira).',
            code: 'if (vida <= 0 && vidas_extras == 0) {\n    instance_destroy()\n}'
          },
          {
            title: 'repeat: repetir um número fixo de vezes',
            body: 'repeat (n) { ... } executa o bloco exatamente n vezes seguidas, útil por exemplo para criar várias instâncias de uma vez.',
            code: 'repeat (3) {\n    instance_create_layer(x, y, "Instances", obj_moeda)\n}'
          },
          {
            title: 'while e for',
            body: 'while (condição) { ... } repete enquanto a condição for verdadeira, sem número fixo de repetições; for é parecido, mas já embute contador, condição de parada e incremento numa linha só, muito usado para percorrer um intervalo de números.',
            code: 'for (var i = 0; i < 3; i += 1) {\n    show_debug_message(string(i))\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve o if em GML?',
          choices: [
            { id: 'a', text: 'Executar um bloco de código só quando uma condição é verdadeira' },
            { id: 'b', text: 'Repetir um bloco um número fixo de vezes' },
            { id: 'c', text: 'Desenhar um sprite na tela' },
            { id: 'd', text: 'Tocar um som' }
          ],
          answer: 'a',
          explanation: 'if executa seu bloco apenas quando a condição entre parênteses é verdadeira.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que o bloco de um else faz?',
          choices: [
            { id: 'a', text: 'Executa quando a condição do if correspondente é falsa' },
            { id: 'b', text: 'Executa sempre, independente do if' },
            { id: 'c', text: 'Substitui o if por completo' },
            { id: 'd', text: 'Só existe em laços, não em condicionais' }
          ],
          answer: 'a',
          explanation: 'else é o caminho alternativo, executado quando a condição do if é falsa.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual operador lógico representa "E" (as duas condições precisam ser verdadeiras)?',
          choices: [
            { id: 'a', text: '&&' },
            { id: 'b', text: '||' },
            { id: 'c', text: '==' },
            { id: 'd', text: '!=' }
          ],
          answer: 'a',
          explanation: '&& (E lógico) exige que ambas as condições sejam verdadeiras.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o operador lógico "OU" (basta uma condição ser verdadeira):',
          code: 'if (vida <= 0 ___ tempo <= 0) {\n    instance_destroy()\n}',
          accept: ['||'],
          explanation: '|| (OU lógico) é verdadeiro quando pelo menos uma das condições é verdadeira.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que repeat (3) { ... } faz?',
          choices: [
            { id: 'a', text: 'Executa o bloco exatamente 3 vezes seguidas' },
            { id: 'b', text: 'Executa o bloco enquanto uma condição for verdadeira' },
            { id: 'c', text: 'Executa o bloco só se uma condição for verdadeira' },
            { id: 'd', text: 'Espera 3 segundos antes de continuar' }
          ],
          answer: 'a',
          explanation: 'repeat repete o bloco um número fixo de vezes, definido entre parênteses.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre while e repeat?',
          choices: [
            { id: 'a', text: 'while repete enquanto uma condição for verdadeira; repeat sempre um número fixo de vezes' },
            { id: 'b', text: 'Não há diferença, são idênticos' },
            { id: 'c', text: 'repeat só funciona dentro do evento Draw' },
            { id: 'd', text: 'while só aceita números, nunca condições' }
          ],
          answer: 'a',
          explanation: 'while depende de uma condição booleana; repeat sempre roda um total fixo de vezes.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Para que um laço for é mais usado?',
          choices: [
            { id: 'a', text: 'Para contar ou percorrer um intervalo de números com uma variável contadora' },
            { id: 'b', text: 'Para desenhar sprites na tela' },
            { id: 'c', text: 'Para detectar colisões' },
            { id: 'd', text: 'Para tocar sons em loop' }
          ],
          answer: 'a',
          explanation: 'for embute contador, condição de parada e incremento, ideal para percorrer intervalos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra que introduz o bloco alternativo, executado quando a condição do if é falsa:',
          code: 'if (vida <= 0) {\n    instance_destroy()\n} ___ {\n    vida -= 10\n}',
          accept: ['else'],
          explanation: 'else define o que acontece quando a condição do if não é verdadeira.'
        }
      ]
    },
    {
      id: 'gm-06-movimento',
      title: 'Movimento',
      goal: 'Mover objetos usando x/y, direção/velocidade e entrada do teclado.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Posição: as variáveis x e y',
            body: 'Toda instância tem uma posição na tela, guardada nas variáveis x (horizontal) e y (vertical) — alterar essas variáveis move o objeto.',
            code: 'x += 4  // move 4 pixels para a direita a cada frame (no Step)'
          },
          {
            title: 'Movimento com direção e velocidade',
            body: 'Em vez de mexer em x/y diretamente, também é possível definir direction (ângulo, em graus) e speed (velocidade) — o GameMaker calcula o movimento automaticamente com base nesses dois valores.',
            code: 'direction = 90  // graus\nspeed = 4'
          },
          {
            title: 'Lendo o teclado',
            body: 'A função keyboard_check(tecla) devolve true enquanto uma tecla está pressionada, permitindo mover o personagem conforme a entrada do jogador.',
            code: 'if keyboard_check(vk_right) {\n    x += 4\n}'
          },
          {
            title: 'Combinando teclas para os 4 lados',
            body: 'É comum checar várias teclas no mesmo Step, uma para cada direção, para permitir movimento livre.',
            code: 'if keyboard_check(vk_right) { x += 4 }\nif keyboard_check(vk_left)  { x -= 4 }'
          },
          {
            title: 'Onde colocar a lógica de movimento',
            body: 'Assim como vimos na lição de eventos, o lugar certo para checar teclas e mover o personagem é o evento Step, que roda a cada frame.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quais variáveis guardam a posição de uma instância na tela?',
          choices: [
            { id: 'a', text: 'x e y' },
            { id: 'b', text: 'speed e direction' },
            { id: 'c', text: 'vida e pontos' },
            { id: 'd', text: 'sprite_index e image_index' }
          ],
          answer: 'a',
          explanation: 'x e y guardam a posição horizontal e vertical da instância.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a variável speed representa?',
          choices: [
            { id: 'a', text: 'A velocidade de movimento da instância' },
            { id: 'b', text: 'A posição vertical' },
            { id: 'c', text: 'O sprite atual' },
            { id: 'd', text: 'O volume do som' }
          ],
          answer: 'a',
          explanation: 'speed, junto com direction, controla o movimento automático da instância.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a função keyboard_check(vk_right) devolve enquanto a tecla seta-direita está pressionada?',
          choices: [
            { id: 'a', text: 'true' },
            { id: 'b', text: 'O nome da tecla' },
            { id: 'c', text: 'Sempre false' },
            { id: 'd', text: 'A posição x atual' }
          ],
          answer: 'a',
          explanation: 'keyboard_check devolve true enquanto a tecla indicada estiver pressionada.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para checar se uma tecla está pressionada no momento:',
          code: 'if ___(vk_right) {\n    x += 4\n}',
          accept: ['keyboard_check'],
          explanation: 'keyboard_check verifica o estado de uma tecla a cada frame.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Em qual evento normalmente colocamos a checagem de teclado e a lógica de movimento?',
          choices: [
            { id: 'a', text: 'Step' },
            { id: 'b', text: 'Create' },
            { id: 'c', text: 'Draw' },
            { id: 'd', text: 'Destroy' }
          ],
          answer: 'a',
          explanation: 'O Step, rodando a cada frame, é o lugar natural para checar entrada e mover.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Além de mexer em x e y diretamente, qual outra forma existe de mover uma instância?',
          choices: [
            { id: 'a', text: 'Definindo direction (ângulo) e speed (velocidade)' },
            { id: 'b', text: 'Só é possível mexer em x e y' },
            { id: 'c', text: 'Alterando o sprite_index' },
            { id: 'd', text: 'Alterando o volume do som' }
          ],
          answer: 'a',
          explanation: 'direction/speed é uma forma alternativa e muitas vezes mais natural de mover.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que x += 4 faz a cada frame, dentro do evento Step?',
          choices: [
            { id: 'a', text: 'Move a instância 4 pixels para a direita a cada frame' },
            { id: 'b', text: 'Move a instância para cima' },
            { id: 'c', text: 'Muda o sprite da instância' },
            { id: 'd', text: 'Toca um som' }
          ],
          answer: 'a',
          explanation: 'Somar à posição x, repetidamente no Step, cria um movimento contínuo para a direita.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variável de posição horizontal de uma instância:',
          code: '___ += 4  // move para a direita',
          accept: ['x'],
          explanation: 'x é a variável de posição horizontal.'
        }
      ]
    },
    {
      id: 'gm-12-mouse',
      title: 'Entrada do mouse',
      goal: 'Ler a posição e os cliques do mouse para criar interações do tipo apontar-e-clicar.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Além do teclado',
            body: 'Muitos jogos usam o mouse para mirar, clicar em botões ou arrastar itens — o GameMaker também oferece funções prontas para ler a posição e os cliques do mouse.'
          },
          {
            title: 'mouse_x e mouse_y',
            body: 'mouse_x e mouse_y guardam a posição atual do cursor dentro da sala (room), atualizadas automaticamente a cada frame.',
            code: 'x = mouse_x\ny = mouse_y'
          },
          {
            title: 'mouse_check_button',
            body: 'mouse_check_button(botão) devolve true enquanto o botão indicado estiver pressionado — por exemplo, mb_left para o botão esquerdo.',
            code: 'if mouse_check_button(mb_left) {\n    instance_create_layer(mouse_x, mouse_y, "Instances", obj_marca)\n}'
          },
          {
            title: 'mouse_check_button_pressed',
            body: 'mouse_check_button_pressed(botão) só devolve true no exato frame em que o clique aconteceu — diferente de mouse_check_button, que fica true enquanto o botão segue pressionado. É a escolha certa para não disparar uma ação repetidas vezes por engano.'
          },
          {
            title: 'Mirando na direção do mouse',
            body: 'A função point_direction(x1, y1, x2, y2) calcula o ângulo entre dois pontos — combinada com mouse_x/mouse_y, permite fazer um personagem apontar sempre para o cursor.',
            code: 'direction = point_direction(x, y, mouse_x, mouse_y)'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que mouse_x e mouse_y guardam?',
          choices: [
            { id: 'a', text: 'A posição atual do cursor do mouse dentro da sala' },
            { id: 'b', text: 'O botão do mouse que foi clicado' },
            { id: 'c', text: 'A posição de uma instância qualquer' },
            { id: 'd', text: 'O volume do som' }
          ],
          answer: 'a',
          explanation: 'mouse_x e mouse_y acompanham a posição do cursor, atualizadas a cada frame.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual função verifica se um botão do mouse foi clicado só neste frame exato, sem repetir enquanto o botão segue pressionado?',
          choices: [
            { id: 'a', text: 'mouse_check_button_pressed' },
            { id: 'b', text: 'mouse_check_button' },
            { id: 'c', text: 'mouse_x' },
            { id: 'd', text: 'keyboard_check' }
          ],
          answer: 'a',
          explanation: 'mouse_check_button_pressed é true apenas no frame em que o clique aconteceu.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que mouse_check_button(mb_left) devolve enquanto o botão esquerdo estiver pressionado?',
          choices: [
            { id: 'a', text: 'true' },
            { id: 'b', text: 'A posição do mouse' },
            { id: 'c', text: 'Sempre false' },
            { id: 'd', text: 'O nome do botão' }
          ],
          answer: 'a',
          explanation: 'mouse_check_button devolve true durante todo o tempo em que o botão estiver pressionado.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a constante que representa o botão esquerdo do mouse:',
          code: 'if mouse_check_button(___) {\n    // ...\n}',
          accept: ['mb_left'],
          explanation: 'mb_left identifica o botão esquerdo do mouse nas funções de mouse.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a diferença entre mouse_check_button e mouse_check_button_pressed?',
          choices: [
            { id: 'a', text: 'check_button fica true enquanto o botão estiver segurado; check_button_pressed é true só no frame do clique' },
            { id: 'b', text: 'Não há diferença, são idênticas' },
            { id: 'c', text: 'check_button_pressed só funciona com o botão direito' },
            { id: 'd', text: 'check_button só existe no evento Create' }
          ],
          answer: 'a',
          explanation: 'A diferença é justamente o comportamento contínuo (segurado) versus único (clique).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Que função calcula o ângulo entre dois pontos, útil para mirar na direção do mouse?',
          choices: [
            { id: 'a', text: 'point_direction' },
            { id: 'b', text: 'instance_create_layer' },
            { id: 'c', text: 'keyboard_check' },
            { id: 'd', text: 'audio_play_sound' }
          ],
          answer: 'a',
          explanation: 'point_direction(x1, y1, x2, y2) devolve o ângulo entre dois pontos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que point_direction(x, y, mouse_x, mouse_y) devolve?',
          choices: [
            { id: 'a', text: 'O ângulo (direção) da instância até a posição atual do mouse' },
            { id: 'b', text: 'A distância até o mouse' },
            { id: 'c', text: 'A cor do sprite' },
            { id: 'd', text: 'Se o botão do mouse está pressionado' }
          ],
          answer: 'a',
          explanation: 'point_direction devolve um ângulo em graus, pronto para ser usado em direction.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função usada para calcular o ângulo até a posição do mouse:',
          code: 'direction = ___(x, y, mouse_x, mouse_y)',
          accept: ['point_direction'],
          explanation: 'point_direction(x1, y1, x2, y2) calcula o ângulo entre os dois pontos informados.'
        }
      ]
    },
    {
      id: 'gm-07-colisoes',
      title: 'Colisões',
      goal: 'Detectar e reagir a colisões entre objetos.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é uma colisão?',
            body: 'Uma colisão acontece quando duas instâncias se sobrepõem na tela — o GameMaker detecta isso automaticamente, baseado na forma (bounding box) do sprite de cada uma.'
          },
          {
            title: 'O evento Collision',
            body: 'Um objeto pode ter um evento de Collision específico para outro objeto — o código dentro desse evento só roda quando essas duas instâncias se tocam.',
            code: '// Evento: Collision com obj_inimigo\nvida -= 10'
          },
          {
            title: 'Verificando colisão sem esperar o evento',
            body: 'A função instance_place(x, y, objeto) verifica se HAVERIA colisão com um objeto numa posição específica, útil para checar antes de mover.',
            code: 'if instance_place(x + 4, y, obj_parede) {\n    // não anda, tem parede na frente\n} else {\n    x += 4\n}'
          },
          {
            title: 'Objetos sólidos',
            body: 'Marcar um objeto como "Solid" faz o GameMaker impedir automaticamente que outras instâncias o atravessem em certos cálculos de movimento, embora hoje em dia instance_place seja mais recomendado.'
          },
          {
            title: 'Reagindo à colisão',
            body: 'Dentro do evento Collision, é comum destruir uma das instâncias (como uma moeda coletada), diminuir vida, ou mudar de sala — a reação depende do que faz sentido para aquele jogo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quando uma colisão é detectada entre duas instâncias?',
          choices: [
            { id: 'a', text: 'Quando elas se sobrepõem na tela, baseado na forma dos sprites' },
            { id: 'b', text: 'Só quando o jogador aperta uma tecla' },
            { id: 'c', text: 'Nunca é detectada automaticamente' },
            { id: 'd', text: 'Só uma vez, no início do jogo' }
          ],
          answer: 'a',
          explanation: 'A colisão é detectada pela sobreposição das formas dos sprites das instâncias.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve o evento Collision de um objeto?',
          choices: [
            { id: 'a', text: 'Executar código específico quando aquela instância colide com outro objeto indicado' },
            { id: 'b', text: 'Definir a posição inicial da instância' },
            { id: 'c', text: 'Tocar música de fundo' },
            { id: 'd', text: 'Trocar de sala' }
          ],
          answer: 'a',
          explanation: 'Cada evento Collision é específico para um objeto-alvo indicado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a função instance_place(x, y, objeto) verifica?',
          choices: [
            { id: 'a', text: 'Se haveria colisão com o objeto indicado, na posição informada' },
            { id: 'b', text: 'Se o objeto existe no projeto' },
            { id: 'c', text: 'O volume de um som' },
            { id: 'd', text: 'A cor de um sprite' }
          ],
          answer: 'a',
          explanation: 'instance_place testa uma posição hipotética, sem realmente mover a instância.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para checar se haveria colisão numa posição específica:',
          code: 'if ___(x + 4, y, obj_parede) {\n    // tem parede na frente\n}',
          accept: ['instance_place'],
          explanation: 'instance_place verifica colisão numa posição hipotética antes de mover de verdade.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que significa marcar um objeto como "Solid"?',
          choices: [
            { id: 'a', text: 'Impede automaticamente que outras instâncias o atravessem em certos cálculos de movimento' },
            { id: 'b', text: 'Torna o objeto invisível' },
            { id: 'c', text: 'Faz o objeto emitir som constantemente' },
            { id: 'd', text: 'Não tem efeito nenhum' }
          ],
          answer: 'a',
          explanation: 'Solid é uma flag legada que afeta certos cálculos automáticos de colisão.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que é comum fazer dentro de um evento Collision com uma moeda coletável?',
          choices: [
            { id: 'a', text: 'Destruir a instância da moeda e aumentar a pontuação' },
            { id: 'b', text: 'Trocar de sala imediatamente sempre' },
            { id: 'c', text: 'Pausar o jogo para sempre' },
            { id: 'd', text: 'Nada, colisões não podem ter reação' }
          ],
          answer: 'a',
          explanation: 'Esse é o padrão clássico de "coletar item": destruir e somar pontos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Uma colisão pode ser usada para diminuir a vida do jogador ao tocar um inimigo?',
          choices: [
            { id: 'a', text: 'Sim, é um uso comum do evento Collision' },
            { id: 'b', text: 'Não, colisões só servem para efeitos visuais' },
            { id: 'c', text: 'Só é possível com objetos sólidos' },
            { id: 'd', text: 'Só funciona com um único inimigo no jogo inteiro' }
          ],
          answer: 'a',
          explanation: 'Reduzir vida ao colidir com um inimigo é um dos usos mais comuns do evento.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de evento que dispara quando duas instâncias se tocam:',
          code: 'O evento que dispara quando duas instâncias se tocam se chama ___.',
          accept: ['Collision', 'collision'],
          explanation: 'Collision é o evento acionado ao detectar sobreposição entre instâncias.'
        }
      ]
    },
    {
      id: 'gm-13-instancias',
      title: 'Criando e destruindo instâncias',
      goal: 'Criar objetos em tempo de execução e removê-los quando não são mais necessários.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Além dos objetos colocados na sala',
            body: 'Até agora, todo objeto do jogo foi colocado manualmente na sala pelo editor. Mas a maioria dos jogos precisa criar coisas durante a partida — balas, inimigos, itens — sem que elas já existam na sala desde o início.'
          },
          {
            title: 'instance_create_layer',
            body: 'instance_create_layer(x, y, camada, objeto) cria uma nova instância de um objeto numa posição e camada (layer) específicas, em tempo de execução.',
            code: 'instance_create_layer(x, y, "Instances", obj_bala)'
          },
          {
            title: 'instance_destroy',
            body: 'instance_destroy() remove a instância atual do jogo — chamada de dentro do próprio objeto, por exemplo quando uma bala sai da tela ou um inimigo perde toda a vida.',
            code: 'if (y < 0) {\n    instance_destroy()\n}'
          },
          {
            title: 'Combinando com colisão',
            body: 'É comum destruir os dois objetos envolvidos numa colisão — por exemplo, uma bala que acerta um inimigo: cada um chama seu próprio instance_destroy() dentro do evento Collision.'
          },
          {
            title: 'Cuidado com criação sem controle',
            body: 'Criar instâncias sem limite (por exemplo, toda vez que o Step roda) pode lotar o jogo rapidamente e travar a performance — por isso normalmente a criação é ligada a um clique, uma tecla, ou um cooldown (alarm), não ao Step direto.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que instance_create_layer faz?',
          choices: [
            { id: 'a', text: 'Cria uma nova instância de um objeto em tempo de execução, numa posição e camada específicas' },
            { id: 'b', text: 'Destrói a instância atual' },
            { id: 'c', text: 'Toca um som' },
            { id: 'd', text: 'Move a instância atual para uma nova posição' }
          ],
          answer: 'a',
          explanation: 'instance_create_layer cria uma instância nova durante o jogo, fora do que já estava na sala.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Em instance_create_layer(x, y, "Instances", obj_bala), qual argumento indica QUAL objeto será criado?',
          choices: [
            { id: 'a', text: 'obj_bala' },
            { id: 'b', text: '"Instances"' },
            { id: 'c', text: 'x' },
            { id: 'd', text: 'y' }
          ],
          answer: 'a',
          explanation: 'O último argumento é o objeto do qual será criada uma nova instância.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que instance_destroy() faz quando chamado dentro do código de um objeto?',
          choices: [
            { id: 'a', text: 'Remove a instância atual do jogo' },
            { id: 'b', text: 'Cria uma nova instância' },
            { id: 'c', text: 'Pausa o jogo' },
            { id: 'd', text: 'Troca o sprite da instância' }
          ],
          answer: 'a',
          explanation: 'instance_destroy remove do jogo a instância que o chamou.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para remover a instância atual do jogo:',
          code: 'if (y < 0) {\n    ___()\n}',
          accept: ['instance_destroy'],
          explanation: 'instance_destroy() remove a instância atual, sem precisar de argumentos.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Onde faz mais sentido chamar instance_destroy() para reagir a uma colisão com outro objeto?',
          choices: [
            { id: 'a', text: 'No evento Collision do objeto' },
            { id: 'b', text: 'No evento Create' },
            { id: 'c', text: 'Numa sala (room)' },
            { id: 'd', text: 'Num sprite' }
          ],
          answer: 'a',
          explanation: 'O evento Collision é o lugar certo para reagir (e destruir) quando dois objetos se tocam.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que criar instâncias sem controle a cada Step é arriscado?',
          choices: [
            { id: 'a', text: 'Pode lotar o jogo de instâncias rapidamente e travar a performance' },
            { id: 'b', text: 'O GameMaker bloqueia isso automaticamente, então não há risco' },
            { id: 'c', text: 'Instâncias criadas no Step nunca aparecem na tela' },
            { id: 'd', text: 'Isso destrói a sala atual' }
          ],
          answer: 'a',
          explanation: 'Sem algum controle (clique, tecla, cooldown), o Step roda a cada frame e criaria instâncias demais.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'instance_create_layer permite criar instâncias em qual momento do jogo?',
          choices: [
            { id: 'a', text: 'A qualquer momento, em tempo de execução, não só as que já estavam na sala' },
            { id: 'b', text: 'Só durante o carregamento inicial da sala' },
            { id: 'c', text: 'Só dentro do editor, nunca durante o jogo' },
            { id: 'd', text: 'Só uma vez por sala' }
          ],
          answer: 'a',
          explanation: 'É exatamente essa a utilidade da função: criar instâncias dinamicamente, durante a partida.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'obj_moeda já existe. Complete a função que cria uma instância dele na posição (x, y):',
          code: '___(x, y, "Instances", obj_moeda)',
          accept: ['instance_create_layer'],
          explanation: 'instance_create_layer(x, y, camada, objeto) cria a instância na posição e camada indicadas.'
        }
      ]
    },
    {
      id: 'gm-08-animacao',
      title: 'Animação de sprites',
      goal: 'Usar múltiplos frames de sprite e controlar a velocidade da animação.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Sprites com múltiplos frames',
            body: 'Um sprite pode ter vários "quadros" (frames), como os fotogramas de uma animação — o GameMaker alterna entre eles automaticamente para criar a sensação de movimento.'
          },
          {
            title: 'image_index: o frame atual',
            body: 'A variável image_index indica QUAL frame do sprite está sendo mostrado no momento, começando em 0.'
          },
          {
            title: 'image_speed: a velocidade da animação',
            body: 'image_speed controla quão rápido os frames trocam — 1 é a velocidade padrão; 0 pausa a animação no frame atual.',
            code: 'image_speed = 0.5  // metade da velocidade normal'
          },
          {
            title: 'Trocando de sprite conforme a ação',
            body: 'É comum trocar o sprite_index (o sprite inteiro, não só o frame) conforme a ação do personagem — por exemplo, um sprite de "parado" e outro de "andando".',
            code: 'if (speed > 0) {\n    sprite_index = spr_andando\n} else {\n    sprite_index = spr_parado\n}'
          },
          {
            title: 'image_index reinicia ao trocar de sprite_index',
            body: 'Ao trocar o sprite_index, o image_index geralmente reinicia do começo — importante para a animação não "pular" de forma estranha.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que image_index representa?',
          choices: [
            { id: 'a', text: 'Qual frame (quadro) do sprite está sendo mostrado no momento' },
            { id: 'b', text: 'A posição x da instância' },
            { id: 'c', text: 'O volume do som' },
            { id: 'd', text: 'A sala atual' }
          ],
          answer: 'a',
          explanation: 'image_index indica o quadro atual dentro da animação do sprite.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que image_speed controla?',
          choices: [
            { id: 'a', text: 'A velocidade com que os frames do sprite trocam' },
            { id: 'b', text: 'A velocidade de movimento da instância' },
            { id: 'c', text: 'O volume da música' },
            { id: 'd', text: 'O tamanho do sprite' }
          ],
          answer: 'a',
          explanation: 'image_speed controla o ritmo da animação, não o movimento da instância.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que acontece se image_speed for definido como 0?',
          choices: [
            { id: 'a', text: 'A animação pausa no frame atual' },
            { id: 'b', text: 'A animação acelera ao máximo' },
            { id: 'c', text: 'O sprite desaparece' },
            { id: 'd', text: 'O jogo é pausado inteiro' }
          ],
          answer: 'a',
          explanation: 'image_speed = 0 congela a animação naquele frame específico.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a variável que controla a velocidade da animação de um sprite:',
          code: '___ = 0.5  // metade da velocidade normal',
          accept: ['image_speed'],
          explanation: 'image_speed define o ritmo de troca entre os frames.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que é comum trocar o sprite_index conforme a ação do personagem (parado x andando)?',
          choices: [
            { id: 'a', text: 'Para exibir a animação certa para cada situação, como parado ou se movendo' },
            { id: 'b', text: 'Porque um sprite não pode ter mais de um frame' },
            { id: 'c', text: 'Porque image_index nunca muda sozinho' },
            { id: 'd', text: 'Não existe motivo real' }
          ],
          answer: 'a',
          explanation: 'Trocar sprite_index conforme o estado do personagem é o padrão para animações contextuais.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que costuma acontecer com o image_index ao trocar o sprite_index de uma instância?',
          choices: [
            { id: 'a', text: 'Ele geralmente reinicia do começo, para a nova animação não começar num frame estranho' },
            { id: 'b', text: 'Ele nunca muda, mesmo trocando de sprite' },
            { id: 'c', text: 'O jogo trava sempre' },
            { id: 'd', text: 'O sprite antigo continua sendo exibido' }
          ],
          answer: 'a',
          explanation: 'O reinício evita que a nova animação comece num quadro incoerente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'A partir de qual número o image_index começa a contar os frames de um sprite?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '1' },
            { id: 'c', text: '-1' },
            { id: 'd', text: 'Depende do sprite' }
          ],
          answer: 'a',
          explanation: 'Assim como índices de vetores, image_index começa em 0.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variável que indica qual frame do sprite está sendo exibido:',
          code: 'ESCREVA(___)  // exibe o número do frame atual',
          accept: ['image_index'],
          explanation: 'image_index é a variável que guarda o frame atual da animação.'
        }
      ]
    },
    {
      id: 'gm-09-som',
      title: 'Som e música',
      goal: 'Tocar efeitos sonoros e música de fundo no jogo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Recursos de som no GameMaker',
            body: 'Assim como sprites e objetos, sons e músicas são importados como recursos próprios do projeto, geralmente na pasta Sounds.'
          },
          {
            title: 'Tocando um som com audio_play_sound',
            body: 'audio_play_sound(som, prioridade, loop) toca um som (ou música) — loop = true faz o som repetir continuamente, útil para música de fundo.',
            code: 'audio_play_sound(snd_pulo, 1, false)'
          },
          {
            title: 'Efeitos sonoros x música de fundo',
            body: 'Efeitos sonoros (como pulo, tiro, moeda) costumam ser curtos e tocados uma vez (loop = false); música de fundo geralmente usa loop = true, para tocar continuamente.'
          },
          {
            title: 'Parando um som',
            body: 'audio_stop_sound(som) interrompe um som que está tocando — útil para parar a música ao trocar de sala, por exemplo.',
            code: 'audio_stop_sound(snd_musica_fase1)'
          },
          {
            title: 'Controlando o volume',
            body: 'audio_sound_gain(som, volume, tempo) ajusta o volume de um som já tocando, permitindo efeitos como música diminuindo gradualmente.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que audio_play_sound(som, prioridade, loop) faz?',
          choices: [
            { id: 'a', text: 'Toca o som indicado, podendo repetir em loop' },
            { id: 'b', text: 'Para todos os sons do jogo' },
            { id: 'c', text: 'Importa um novo som para o projeto' },
            { id: 'd', text: 'Muda o volume de todos os sons' }
          ],
          answer: 'a',
          explanation: 'audio_play_sound inicia a reprodução do som indicado.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que loop = true faz ao tocar um som?',
          choices: [
            { id: 'a', text: 'Faz o som repetir continuamente' },
            { id: 'b', text: 'Toca o som só uma vez' },
            { id: 'c', text: 'Aumenta o volume ao máximo' },
            { id: 'd', text: 'Impede o som de tocar' }
          ],
          answer: 'a',
          explanation: 'loop = true mantém o som repetindo sem parar, ideal para música de fundo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Efeitos sonoros curtos (como pulo ou moeda) geralmente usam qual valor de loop?',
          choices: [
            { id: 'a', text: 'false' },
            { id: 'b', text: 'true' },
            { id: 'c', text: 'Não é preciso informar loop nesse caso' },
            { id: 'd', text: 'Sempre 1' }
          ],
          answer: 'a',
          explanation: 'Efeitos pontuais tocam uma vez e param — loop = false.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para tocar um som no GameMaker:',
          code: '___(snd_pulo, 1, false)',
          accept: ['audio_play_sound'],
          explanation: 'audio_play_sound é a função que inicia a reprodução de um som.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que audio_stop_sound(som) faz?',
          choices: [
            { id: 'a', text: 'Interrompe um som que está tocando' },
            { id: 'b', text: 'Toca o som pela primeira vez' },
            { id: 'c', text: 'Aumenta o volume do som' },
            { id: 'd', text: 'Cria um novo som' }
          ],
          answer: 'a',
          explanation: 'audio_stop_sound para a reprodução de um som específico.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Música de fundo geralmente usa qual valor de loop ao ser tocada?',
          choices: [
            { id: 'a', text: 'true, para repetir continuamente' },
            { id: 'b', text: 'false, para tocar só uma vez' },
            { id: 'c', text: 'Não é possível usar loop com música' },
            { id: 'd', text: 'Depende só do volume' }
          ],
          answer: 'a',
          explanation: 'Música de fundo costuma repetir indefinidamente com loop = true.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que audio_sound_gain(som, volume, tempo) permite fazer?',
          choices: [
            { id: 'a', text: 'Ajustar o volume de um som já tocando, podendo mudar gradualmente' },
            { id: 'b', text: 'Trocar o som por outro completamente diferente' },
            { id: 'c', text: 'Pausar o jogo inteiro' },
            { id: 'd', text: 'Mudar de sala' }
          ],
          answer: 'a',
          explanation: 'audio_sound_gain permite fade in/out de volume de um som em execução.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função usada para parar um som que está tocando:',
          code: '___(snd_musica_fase1)',
          accept: ['audio_stop_sound'],
          explanation: 'audio_stop_sound interrompe a reprodução do som indicado.'
        }
      ]
    },
    {
      id: 'gm-10-interface-pontuacao',
      title: 'Interface e pontuação (HUD)',
      goal: 'Exibir texto na tela, como pontuação e vida, usando draw_text.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é um HUD?',
            body: 'HUD (Heads-Up Display) é a interface exibida na tela durante o jogo — pontuação, vida, tempo restante são exemplos comuns de informação mostrada no HUD.'
          },
          {
            title: 'Desenhando texto com draw_text',
            body: 'draw_text(x, y, texto) desenha um texto na tela, na posição indicada — precisa ser chamado dentro do evento Draw.',
            code: '// Evento Draw\ndraw_text(10, 10, "Pontos: " + string(pontos))'
          },
          {
            title: 'Convertendo número em texto com string()',
            body: 'Como draw_text espera um texto, usamos string(numero) para converter um valor numérico (como a pontuação) em texto, permitindo juntá-lo a outro texto com +.'
          },
          {
            title: 'Atualizando a pontuação',
            body: 'A variável de pontuação (geralmente global.pontos ou uma variável de um objeto "controlador") é alterada durante o jogo — por exemplo, ao coletar uma moeda — e exibida no Draw.',
            code: '// No evento Collision com moeda\nglobal.pontos += 10'
          },
          {
            title: 'Um objeto controlador para o HUD',
            body: 'É comum ter um objeto especial (sem sprite visível) só para desenhar o HUD e guardar variáveis globais do jogo, como pontuação e vidas restantes.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que HUD significa, no contexto de jogos?',
          choices: [
            { id: 'a', text: 'A interface exibida na tela durante o jogo, como pontuação e vida' },
            { id: 'b', text: 'Um tipo de som' },
            { id: 'c', text: 'Um tipo de sprite animado' },
            { id: 'd', text: 'Uma sala de menu' }
          ],
          answer: 'a',
          explanation: 'HUD é a camada de informação exibida sobre a ação do jogo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual função é usada para desenhar texto na tela?',
          choices: [
            { id: 'a', text: 'draw_text(x, y, texto)' },
            { id: 'b', text: 'audio_play_sound(texto)' },
            { id: 'c', text: 'room_goto(texto)' },
            { id: 'd', text: 'instance_place(texto)' }
          ],
          answer: 'a',
          explanation: 'draw_text é a função de desenho de texto na tela.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Em qual evento draw_text deve ser chamado para funcionar?',
          choices: [
            { id: 'a', text: 'Draw' },
            { id: 'b', text: 'Create' },
            { id: 'c', text: 'Collision' },
            { id: 'd', text: 'Não importa o evento' }
          ],
          answer: 'a',
          explanation: 'Funções de desenho só têm efeito quando chamadas dentro do evento Draw.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para converter um número em texto, antes de desenhar na tela:',
          code: 'draw_text(10, 10, "Pontos: " + ___(pontos))',
          accept: ['string'],
          explanation: 'string() converte um valor numérico em texto, para concatenar com outra string.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que é preciso converter a pontuação com string() antes de juntar com outro texto?',
          choices: [
            { id: 'a', text: 'Porque draw_text e o operador + esperam texto, não um número puro' },
            { id: 'b', text: 'Porque números não podem ser desenhados de jeito nenhum' },
            { id: 'c', text: 'Porque string() aumenta o valor da pontuação' },
            { id: 'd', text: 'Não é realmente necessário, é só estilo' }
          ],
          answer: 'a',
          explanation: 'A concatenação com + exige que os dois lados sejam texto.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde a pontuação costuma ser atualizada, por exemplo, ao coletar uma moeda?',
          choices: [
            { id: 'a', text: 'No evento Collision daquele objeto com a moeda' },
            { id: 'b', text: 'No evento Draw' },
            { id: 'c', text: 'Só no evento Create, uma vez' },
            { id: 'd', text: 'A pontuação nunca pode ser alterada durante o jogo' }
          ],
          answer: 'a',
          explanation: 'A pontuação muda no momento da ação — colidir com a moeda.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que é comum ter um objeto "controlador" separado, sem sprite visível, só para o HUD?',
          choices: [
            { id: 'a', text: 'Para centralizar a lógica de pontuação/vidas e o desenho da interface num único lugar' },
            { id: 'b', text: 'Porque objetos sem sprite não funcionam no GameMaker' },
            { id: 'c', text: 'Porque HUD só pode ser desenhado por sprites' },
            { id: 'd', text: 'Não existe essa prática' }
          ],
          answer: 'a',
          explanation: 'Um objeto controlador organiza a lógica global do jogo num único lugar.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função usada para desenhar um texto na posição (10, 10):',
          code: '___(10, 10, "Pontos: " + string(pontos))',
          accept: ['draw_text'],
          explanation: 'draw_text(x, y, texto) desenha o texto na posição indicada.'
        }
      ]
    }
  ]
};
