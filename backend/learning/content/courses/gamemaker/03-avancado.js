// Módulo "Avançado" — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes por
// lição). Ver ../index.js para o formato e a validação de boot. Sintaxe GML (GameMaker Language)
// usada nos exemplos de código, mesmo padrão de ./01-fundamentos.js e ./02-intermediario.js.
// Ids não são numericamente sequenciais na ordem pedagógica: gma-11/gma-12/gma-13 foram inseridas
// depois, entre lições já numeradas (mesma convenção dos outros módulos) — Gamepad logo após
// Métodos (entrada, antes da parte de renderização), ds_grid logo após Tilemaps (par lógico do
// mapa visual), Networking logo após Eventos assíncronos (mesmo padrão Async aplicado à rede).
module.exports = {
  id: 'avancado-gamemaker',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'Métodos, surfaces, shaders, tilemaps, sequences, arquivos, assíncrono, desempenho e física',
  accent: '#c084fc',
  lessons: [
    {
      id: 'gma-01-metodos-structs',
      title: 'Métodos: funções como valores',
      goal: 'Guardar funções dentro de structs e variáveis, criando comportamento reutilizável.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Funções também são valores',
            body: 'Em GML, uma função não é só algo que se "chama": ela também é um valor, que pode ser guardado numa variável, passado como parâmetro, ou guardado dentro de um struct.',
            code: 'var somar = function(a, b) { return a + b }\nshow_debug_message(somar(2, 3))  // 5'
          },
          {
            title: 'method() e o struct dono',
            body: 'Quando uma função guardada num struct precisa acessar os OUTROS campos desse mesmo struct, usamos method(objeto_dono, funcao) — parecido com "this" em outras linguagens.',
            code: 'personagem = { vida: 100 }\npersonagem.curar = method(personagem, function(quantia) { vida += quantia })'
          },
          {
            title: 'Structs com métodos = "objetos" com comportamento',
            body: 'Combinando dados (campos) e comportamento (métodos) num único struct, criamos algo parecido com um objeto de outras linguagens orientadas a objeto, sem precisar de um Object separado no editor.'
          },
          {
            title: 'Funções como parâmetro (callbacks)',
            body: 'Como uma função é um valor, ela pode ser passada como argumento para outra função, sendo chamada depois — um "callback", muito usado para reagir a algo específico.',
            code: 'function ao_terminar(callback) {\n    callback()\n}\nao_terminar(function() { show_debug_message("Terminou!") })'
          },
          {
            title: 'Quando isso vale a pena',
            body: 'Funções-como-valor brilham quando você quer comportamento configurável (por exemplo, um "tipo" de inimigo com uma função de ataque diferente) sem criar um Object separado para cada variação.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Em GML, o que uma função é, além de algo que se chama?',
          choices: [
            { id: 'a', text: 'Um valor, que pode ser guardado em variável, struct, ou passado como parâmetro' },
            { id: 'b', text: 'Um tipo de sprite' },
            { id: 'c', text: 'Um evento especial' },
            { id: 'd', text: 'Uma sala' }
          ],
          answer: 'a',
          explanation: 'Funções são valores de primeira classe em GML, assim como números ou structs.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve method(objeto, funcao)?',
          choices: [
            { id: 'a', text: 'Permite que a função acesse os campos do struct dono, como se fosse "this"' },
            { id: 'b', text: 'Cria um novo objeto no editor' },
            { id: 'c', text: 'Destrói a função informada' },
            { id: 'd', text: 'Converte a função num struct' }
          ],
          answer: 'a',
          explanation: 'method() liga a função ao struct dono, dando acesso aos campos dele.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é um callback?',
          choices: [
            { id: 'a', text: 'Uma função passada como argumento para outra função, para ser chamada depois' },
            { id: 'b', text: 'Um tipo de colisão' },
            { id: 'c', text: 'Um evento de alarm' },
            { id: 'd', text: 'Um campo de struct que guarda só números' }
          ],
          answer: 'a',
          explanation: 'Callbacks são funções passadas para serem executadas em outro momento, por outra função.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para criar uma função guardada numa variável:',
          code: 'var somar = ___(a, b) { return a + b }',
          accept: ['function'],
          explanation: 'function declara a função, mesmo quando guardada diretamente numa variável.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que combinar dados e métodos num struct pode ser útil?',
          choices: [
            { id: 'a', text: 'Permite criar algo parecido com um objeto com comportamento próprio, sem um Object do editor' },
            { id: 'b', text: 'É a única forma de guardar números em GML' },
            { id: 'c', text: 'Torna o struct automaticamente persistent' },
            { id: 'd', text: 'Não traz nenhuma vantagem real' }
          ],
          answer: 'a',
          explanation: 'Dados + métodos num struct imitam o conceito de objeto com comportamento.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando vale a pena usar função-como-valor em vez de criar um Object novo?',
          choices: [
            { id: 'a', text: 'Quando se quer comportamento configurável (ex: tipos de ataque diferentes) sem duplicar objetos' },
            { id: 'b', text: 'Sempre, Objects nunca deveriam ser usados' },
            { id: 'c', text: 'Nunca, isso não é uma prática real' },
            { id: 'd', text: 'Só quando não há sprite disponível' }
          ],
          answer: 'a',
          explanation: 'Funções-como-valor evitam criar um Object separado só para variar um comportamento.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'personagem.curar = method(personagem, function(quantia) { vida += quantia }) — o que isso permite?',
          choices: [
            { id: 'a', text: 'Chamar personagem.curar(10) e a função alterar o campo vida do próprio personagem' },
            { id: 'b', text: 'Criar um novo personagem automaticamente' },
            { id: 'c', text: 'Destruir o campo vida' },
            { id: 'd', text: 'Nada, essa sintaxe não é válida' }
          ],
          answer: 'a',
          explanation: 'method() garante que a função enxergue os campos do struct personagem.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que liga uma função ao struct dono, dando acesso aos campos dele:',
          code: 'personagem.curar = ___(personagem, function(quantia) { vida += quantia })',
          accept: ['method'],
          explanation: 'method(objeto, funcao) é o que conecta a função ao struct que a guarda.'
        }
      ]
    },
    {
      id: 'gma-11-gamepad',
      title: 'Suporte a controle (gamepad)',
      goal: 'Detectar e ler a entrada de um controle, além do teclado e do mouse.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Além do teclado e mouse',
            body: 'Já vimos keyboard_check (iniciante) e mouse_check_button (intermediário); muitos jogadores preferem jogar com um controle (gamepad) — o GameMaker também tem funções prontas para isso.'
          },
          {
            title: 'gamepad_is_connected',
            body: 'Antes de ler um controle, é preciso confirmar que ele está conectado. gamepad_is_connected(numero) devolve true se há um controle na posição indicada (0 é geralmente o primeiro).',
            code: 'if (gamepad_is_connected(0)) {\n    // ler o controle 0\n}'
          },
          {
            title: 'gamepad_button_check',
            body: 'gamepad_button_check(numero, botão) devolve true enquanto um botão específico do controle estiver pressionado — parecido com keyboard_check, mas usando constantes de gamepad (gp_face1, gp_face2...).',
            code: 'if (gamepad_button_check(0, gp_face1)) {\n    // botão A/X pressionado\n}'
          },
          {
            title: 'gamepad_axis_value',
            body: 'Analógicos não são só "pressionado ou não" — gamepad_axis_value(numero, eixo) devolve um valor entre -1 e 1, representando o quanto o analógico está inclinado naquele eixo.',
            code: 'var horizontal = gamepad_axis_value(0, gp_axislh)\nx += horizontal * 4'
          },
          {
            title: 'Suportando os dois ao mesmo tempo',
            body: 'Um bom jogo costuma checar teclado E gamepad juntos, sem obrigar o jogador a escolher um só — permitindo trocar de dispositivo a qualquer momento durante a partida.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve gamepad_is_connected(0)?',
          choices: [
            { id: 'a', text: 'Confirmar se há um controle conectado na posição indicada, antes de tentar lê-lo' },
            { id: 'b', text: 'Conectar um controle automaticamente' },
            { id: 'c', text: 'Desligar o controle' },
            { id: 'd', text: 'Ler a posição do mouse' }
          ],
          answer: 'a',
          explanation: 'gamepad_is_connected evita erros ao tentar ler um controle que não existe.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que gamepad_button_check(0, gp_face1) devolve enquanto o botão estiver pressionado?',
          choices: [
            { id: 'a', text: 'true' },
            { id: 'b', text: 'Um valor entre -1 e 1' },
            { id: 'c', text: 'O nome do botão' },
            { id: 'd', text: 'Sempre false' }
          ],
          answer: 'a',
          explanation: 'gamepad_button_check devolve true durante todo o tempo em que o botão estiver pressionado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que gamepad_axis_value devolve?',
          choices: [
            { id: 'a', text: 'Um valor entre -1 e 1, representando a inclinação do analógico naquele eixo' },
            { id: 'b', text: 'true ou false' },
            { id: 'c', text: 'O número de controles conectados' },
            { id: 'd', text: 'A posição x da instância' }
          ],
          answer: 'a',
          explanation: 'gamepad_axis_value devolve um valor contínuo, não apenas pressionado/solto.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que confirma se há um controle conectado na posição 0:',
          code: 'if (___(0)) {\n    // ler o controle 0\n}',
          accept: ['gamepad_is_connected'],
          explanation: 'gamepad_is_connected checa a conexão antes de ler botões ou analógicos.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que checar gamepad_is_connected antes de ler os botões do controle?',
          choices: [
            { id: 'a', text: 'Para evitar erros ao tentar ler um controle que não existe' },
            { id: 'b', text: 'Porque isso liga o controle automaticamente' },
            { id: 'c', text: 'Não é necessário, GameMaker já checa sozinho' },
            { id: 'd', text: 'Para desligar o teclado' }
          ],
          answer: 'a',
          explanation: 'Ler um controle desconectado sem checar antes pode causar comportamento inesperado.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre gamepad_button_check e gamepad_axis_value?',
          choices: [
            { id: 'a', text: 'button_check devolve true/false para um botão; axis_value devolve um valor contínuo para um analógico' },
            { id: 'b', text: 'São a mesma função com nomes diferentes' },
            { id: 'c', text: 'axis_value só funciona com o teclado' },
            { id: 'd', text: 'button_check só existe no evento Create' }
          ],
          answer: 'a',
          explanation: 'Botões são binários (pressionado ou não); analógicos têm um valor de intensidade/direção.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que um bom jogo costuma suportar teclado E gamepad ao mesmo tempo?',
          choices: [
            { id: 'a', text: 'Para não obrigar o jogador a escolher um dispositivo só, permitindo trocar a qualquer momento' },
            { id: 'b', text: 'Porque GameMaker proíbe usar só um dos dois' },
            { id: 'c', text: 'Porque gamepad substitui completamente o teclado' },
            { id: 'd', text: 'Não há vantagem real nisso' }
          ],
          answer: 'a',
          explanation: 'Suportar os dois dá liberdade ao jogador de escolher como prefere jogar.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que lê o valor de um analógico, entre -1 e 1:',
          code: 'var horizontal = ___(0, gp_axislh)\nx += horizontal * 4',
          accept: ['gamepad_axis_value'],
          explanation: 'gamepad_axis_value(numero, eixo) devolve a inclinação atual do analógico.'
        }
      ]
    },
    {
      id: 'gma-02-surfaces',
      title: 'Surfaces',
      goal: 'Desenhar em um buffer separado da tela, preparando efeitos de pós-processamento.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é uma surface',
            body: 'Uma surface é uma "tela" auxiliar, na memória da placa de vídeo, onde é possível desenhar antes de mostrar na tela de verdade — útil para compor efeitos, aplicar um shader depois, ou desenhar algo uma vez e reaproveitar.'
          },
          {
            title: 'surface_create',
            body: 'surface_create(largura, altura) cria uma nova surface com o tamanho indicado.',
            code: 'minha_surface = surface_create(400, 300)'
          },
          {
            title: 'surface_set_target / surface_reset_target',
            body: 'Tudo que for desenhado depois de surface_set_target vai parar na surface, não na tela; surface_reset_target volta a desenhar na tela normal.',
            code: 'surface_set_target(minha_surface)\ndraw_clear(c_black)\n// desenhos aqui vão para a surface\nsurface_reset_target()'
          },
          {
            title: 'Desenhando a surface na tela',
            body: 'Depois de preparada, draw_surface(surface, x, y) mostra o conteúdo da surface na tela, como se fosse uma imagem comum.'
          },
          {
            title: 'Surfaces não sobrevivem sozinhas',
            body: 'Surfaces podem ser perdidas (por exemplo, ao minimizar a janela do jogo) — por isso é comum checar surface_exists(surface) e recriá-la se necessário, antes de usá-la.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma surface?',
          choices: [
            { id: 'a', text: 'Uma "tela" auxiliar onde se pode desenhar antes de mostrar na tela de verdade' },
            { id: 'b', text: 'Um tipo de objeto' },
            { id: 'c', text: 'Um efeito sonoro' },
            { id: 'd', text: 'Uma variável global' }
          ],
          answer: 'a',
          explanation: 'A surface é um destino de desenho separado, na memória da GPU.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que surface_create(400, 300) faz?',
          choices: [
            { id: 'a', text: 'Cria uma nova surface com 400x300 de tamanho' },
            { id: 'b', text: 'Cria uma sala de 400x300 pixels' },
            { id: 'c', text: 'Redimensiona a tela do jogo' },
            { id: 'd', text: 'Cria um sprite de 400x300' }
          ],
          answer: 'a',
          explanation: 'surface_create(largura, altura) cria uma surface com o tamanho informado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que surface_set_target faz?',
          choices: [
            { id: 'a', text: 'Redireciona os desenhos seguintes para a surface indicada, em vez da tela' },
            { id: 'b', text: 'Destrói a surface indicada' },
            { id: 'c', text: 'Move a câmera até a surface' },
            { id: 'd', text: 'Cria uma nova surface automaticamente' }
          ],
          answer: 'a',
          explanation: 'surface_set_target passa a mandar os desenhos para a surface, não para a tela.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que cria uma nova surface de 400x300:',
          code: 'minha_surface = ___(400, 300)',
          accept: ['surface_create'],
          explanation: 'surface_create(largura, altura) cria a surface com o tamanho indicado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que draw_surface(surface, x, y) faz?',
          choices: [
            { id: 'a', text: 'Desenha o conteúdo da surface na tela, na posição indicada' },
            { id: 'b', text: 'Cria uma nova surface na posição indicada' },
            { id: 'c', text: 'Destrói a surface após desenhar' },
            { id: 'd', text: 'Só funciona dentro do evento Create' }
          ],
          answer: 'a',
          explanation: 'draw_surface mostra o conteúdo já desenhado na surface, como uma imagem.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que é comum checar surface_exists antes de usar uma surface?',
          choices: [
            { id: 'a', text: 'Porque surfaces podem ser perdidas (ex: ao minimizar a janela) e precisam ser recriadas' },
            { id: 'b', text: 'Porque toda surface se destrói sozinha após 1 segundo' },
            { id: 'c', text: 'Não é necessário, é só um costume sem efeito real' },
            { id: 'd', text: 'Porque surfaces não podem ser destruídas' }
          ],
          answer: 'a',
          explanation: 'surface_exists evita erros ao tentar usar uma surface que já não existe mais.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que surface_reset_target faz?',
          choices: [
            { id: 'a', text: 'Volta a direcionar os desenhos seguintes para a tela normal' },
            { id: 'b', text: 'Cria uma nova surface' },
            { id: 'c', text: 'Limpa o conteúdo da surface atual' },
            { id: 'd', text: 'Aplica um shader à surface' }
          ],
          answer: 'a',
          explanation: 'surface_reset_target encerra o redirecionamento, voltando a desenhar na tela.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que volta a desenhar na tela normal, depois de usar uma surface:',
          code: 'surface_set_target(minha_surface)\ndraw_clear(c_black)\n// ...\n___()',
          accept: ['surface_reset_target'],
          explanation: 'surface_reset_target encerra o uso da surface como destino dos desenhos.'
        }
      ]
    },
    {
      id: 'gma-03-shaders',
      title: 'Shaders básicos',
      goal: 'Entender o que um shader faz e como aplicá-lo a um desenho.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é um shader',
            body: 'Um shader é um pequeno programa que roda na placa de vídeo (GPU), controlando exatamente como cada pixel é desenhado na tela — permite efeitos como distorção, mudança de cor ou desfoque, difíceis ou lentos de fazer só com GML.'
          },
          {
            title: 'shader_set / shader_reset',
            body: 'shader_set(shader) ativa um shader para os desenhos seguintes; shader_reset() volta ao desenho normal, sem nenhum shader.',
            code: 'shader_set(sh_tons_de_cinza)\ndraw_sprite(spr_heroi, 0, x, y)\nshader_reset()'
          },
          {
            title: 'Uniforms',
            body: 'Uniforms são variáveis que o GML envia para dentro do shader, controlando seu comportamento (por exemplo, a intensidade de um efeito) — shader_get_uniform busca essa "entrada" pelo nome, e shader_set_uniform_f envia um valor numérico para ela.'
          },
          {
            title: 'De onde vêm os shaders',
            body: 'Shaders são escritos numa linguagem própria (GLSL, no caso do GameMaker), como um recurso separado do projeto — escrever um do zero foge do escopo desta lição, mas usar um já pronto é simples, como qualquer outro recurso.'
          },
          {
            title: 'Combinando shader com surface',
            body: 'É comum aplicar um shader sobre o conteúdo de uma surface (visto na lição anterior), permitindo efeitos de pós-processamento na tela inteira, não só num sprite isolado.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um shader controla?',
          choices: [
            { id: 'a', text: 'Exatamente como cada pixel é desenhado na tela, rodando na GPU' },
            { id: 'b', text: 'Apenas o volume do som' },
            { id: 'c', text: 'A posição da câmera' },
            { id: 'd', text: 'A física do jogo' }
          ],
          answer: 'a',
          explanation: 'Shaders são programas de GPU que controlam o resultado final de cada pixel.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que shader_set faz?',
          choices: [
            { id: 'a', text: 'Ativa um shader para os desenhos seguintes' },
            { id: 'b', text: 'Cria um novo shader do zero' },
            { id: 'c', text: 'Destrói o shader atual' },
            { id: 'd', text: 'Move a câmera' }
          ],
          answer: 'a',
          explanation: 'shader_set liga o shader indicado, afetando os desenhos feitos a partir dali.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que um uniform representa?',
          choices: [
            { id: 'a', text: 'Uma variável enviada do GML para dentro do shader, controlando seu comportamento' },
            { id: 'b', text: 'Um tipo de colisão' },
            { id: 'c', text: 'Um evento de alarm' },
            { id: 'd', text: 'Um tipo de sprite' }
          ],
          answer: 'a',
          explanation: 'Uniforms são a ponte entre o código GML e o comportamento configurável do shader.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que desativa o shader, voltando ao desenho normal:',
          code: 'shader_set(sh_tons_de_cinza)\ndraw_sprite(spr_heroi, 0, x, y)\n___()',
          accept: ['shader_reset'],
          explanation: 'shader_reset() encerra o uso do shader ativo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Em qual linguagem os shaders do GameMaker são escritos?',
          choices: [
            { id: 'a', text: 'GLSL' },
            { id: 'b', text: 'GML puro' },
            { id: 'c', text: 'Python' },
            { id: 'd', text: 'JSON' }
          ],
          answer: 'a',
          explanation: 'Shaders no GameMaker usam GLSL, a linguagem padrão de shaders gráficos.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que combinar shader com surface é comum?',
          choices: [
            { id: 'a', text: 'Permite aplicar o efeito na tela inteira (ou numa área composta), não só num sprite isolado' },
            { id: 'b', text: 'Surfaces e shaders são a mesma coisa' },
            { id: 'c', text: 'Não é possível usar shader sem surface' },
            { id: 'd', text: 'Shaders só funcionam dentro de uma surface' }
          ],
          answer: 'a',
          explanation: 'Aplicar um shader sobre uma surface permite efeitos de pós-processamento amplos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que acontece com os desenhos feitos depois de shader_reset()?',
          choices: [
            { id: 'a', text: 'Voltam a ser desenhados normalmente, sem nenhum shader ativo' },
            { id: 'b', text: 'Continuam usando o shader anterior' },
            { id: 'c', text: 'Param de ser desenhados' },
            { id: 'd', text: 'São desenhados numa nova surface automaticamente' }
          ],
          answer: 'a',
          explanation: 'shader_reset encerra completamente o efeito do shader nos desenhos seguintes.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que ativa um shader para os desenhos seguintes:',
          code: '___(sh_tons_de_cinza)\ndraw_sprite(spr_heroi, 0, x, y)\nshader_reset()',
          accept: ['shader_set'],
          explanation: 'shader_set(shader) ativa o shader indicado para os próximos desenhos.'
        }
      ]
    },
    {
      id: 'gma-04-tilemaps',
      title: 'Tilemaps e colisão com tiles',
      goal: 'Montar cenários com blocos repetidos (tiles) e detectar colisão com eles.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é um tilemap',
            body: 'Em vez de desenhar cada pedaço do cenário como um sprite ou objeto separado, um tilemap monta o cenário repetindo pequenos blocos (tiles) de um tileset — muito mais leve para cenários grandes, como plataformas ou paredes.'
          },
          {
            title: 'Camadas de tile',
            body: 'No editor de salas, uma camada do tipo Tile guarda qual tile aparece em cada posição da grade — pintada visualmente, como um "photoshop de blocos".'
          },
          {
            title: 'tilemap_get_at_pixel',
            body: 'tilemap_get_at_pixel(camada, x, y) devolve qual tile existe numa posição específica (em pixels) de uma camada de tile — útil para checar programaticamente o que tem ali.',
            code: 'var tile = tilemap_get_at_pixel(camada_chao, x, y)'
          },
          {
            title: 'Colisão com tiles',
            body: 'Funções de colisão com tilemap devolvem true se aquela posição tem um tile marcado como sólido/colidível na camada — permitindo que o jogador "bata" no cenário sem precisar de um objeto extra para cada bloco.'
          },
          {
            title: 'Tiles x objetos',
            body: 'Use tiles para cenário estático e repetitivo (chão, paredes); continue usando objetos para tudo que se move, reage a eventos, ou tem lógica própria (inimigos, itens, o jogador).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a vantagem de um tilemap sobre criar um objeto para cada pedaço do cenário?',
          choices: [
            { id: 'a', text: 'É muito mais leve para cenários grandes, com blocos repetidos' },
            { id: 'b', text: 'Tilemaps são mais lentos, mas mais fáceis de programar' },
            { id: 'c', text: 'Não há diferença nenhuma de desempenho' },
            { id: 'd', text: 'Tilemaps substituem objetos e sprites por completo' }
          ],
          answer: 'a',
          explanation: 'Tiles evitam o custo de ter uma instância separada para cada bloco do cenário.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Onde ficam definidos quais tiles aparecem em cada posição da sala?',
          choices: [
            { id: 'a', text: 'Numa camada do tipo Tile, na sala' },
            { id: 'b', text: 'Dentro do evento Create de cada objeto' },
            { id: 'c', text: 'No sprite do jogador' },
            { id: 'd', text: 'Numa struct global' }
          ],
          answer: 'a',
          explanation: 'Camadas do tipo Tile guardam a disposição visual dos blocos na sala.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que tilemap_get_at_pixel devolve?',
          choices: [
            { id: 'a', text: 'Qual tile existe numa posição específica da camada' },
            { id: 'b', text: 'A posição do jogador' },
            { id: 'c', text: 'O nome da sala atual' },
            { id: 'd', text: 'Quantos tiles existem no total' }
          ],
          answer: 'a',
          explanation: 'tilemap_get_at_pixel identifica qual tile está numa posição (em pixels) informada.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que devolve qual tile existe numa posição específica de uma camada:',
          code: 'var tile = ___(camada_chao, x, y)',
          accept: ['tilemap_get_at_pixel'],
          explanation: 'tilemap_get_at_pixel(camada, x, y) consulta o tile numa posição em pixels.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que serve checar colisão com tiles?',
          choices: [
            { id: 'a', text: 'Permitir que o jogador "bata" no cenário sem precisar de um objeto extra para cada bloco' },
            { id: 'b', text: 'Trocar o sprite do jogador' },
            { id: 'c', text: 'Criar novas salas automaticamente' },
            { id: 'd', text: 'Tocar sons de fundo' }
          ],
          answer: 'a',
          explanation: 'A colisão com tiles evita ter que criar um objeto sólido para cada bloco do cenário.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando faz mais sentido usar um tile em vez de um objeto?',
          choices: [
            { id: 'a', text: 'Para cenário estático e repetitivo, como chão e paredes' },
            { id: 'b', text: 'Para o jogador, sempre' },
            { id: 'c', text: 'Para qualquer coisa com lógica própria' },
            { id: 'd', text: 'Nunca, tiles servem só para decoração sem colisão' }
          ],
          answer: 'a',
          explanation: 'Tiles são ideais para partes repetitivas e sem comportamento próprio do cenário.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando ainda faz sentido usar um objeto em vez de um tile?',
          choices: [
            { id: 'a', text: 'Para qualquer coisa que se move, reage a eventos, ou tem lógica própria' },
            { id: 'b', text: 'Só para o chão da sala' },
            { id: 'c', text: 'Objetos nunca deveriam ser usados junto de tiles' },
            { id: 'd', text: 'Só quando não existe tileset disponível' }
          ],
          answer: 'a',
          explanation: 'Objetos continuam sendo a escolha certa para comportamento, movimento e eventos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de camada, no editor de salas, onde os tiles são organizados:',
          code: 'No editor de salas, os tiles ficam organizados numa camada do tipo ___',
          accept: ['Tile', 'tile'],
          explanation: 'Uma camada do tipo Tile guarda a disposição dos blocos na sala.'
        }
      ]
    },
    {
      id: 'gma-12-ds-grid',
      title: 'ds_grid: dados organizados em grade',
      goal: 'Guardar e consultar dados organizados em linhas e colunas, útil para tabuleiros e mapas lógicos.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é um ds_grid',
            body: 'Parecido com ds_list e ds_map (vistos no intermediário), mas organizado em DUAS dimensões — linhas e colunas — como uma planilha ou um tabuleiro.'
          },
          {
            title: 'ds_grid_create',
            body: 'ds_grid_create(largura, altura) cria uma nova grade vazia, com o número de colunas e linhas indicado.',
            code: 'grade = ds_grid_create(10, 10)  // 10 colunas, 10 linhas'
          },
          {
            title: 'Lendo e escrevendo uma célula',
            body: 'ds_grid_set(grade, coluna, linha, valor) escreve um valor numa célula específica; ds_grid_get(grade, coluna, linha) lê o valor daquela célula.',
            code: 'ds_grid_set(grade, 3, 2, 1)  // marca a célula (3, 2)\nvar tipo = ds_grid_get(grade, 3, 2)'
          },
          {
            title: 'Um uso comum: mapa lógico separado do visual',
            body: 'O tilemap (visto na lição anterior) cuida do visual do cenário; um ds_grid pode guardar, na MESMA forma de grade, informação lógica (esta célula é andável? tem um item? é a saída da fase?), sem misturar com a parte visual.'
          },
          {
            title: 'Destruindo o grid',
            body: 'Assim como ds_list e ds_map, um ds_grid não é limpo sozinho da memória — é preciso chamar ds_grid_destroy quando ele não for mais necessário.',
            code: 'ds_grid_destroy(grade)'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que diferencia um ds_grid de um ds_list?',
          choices: [
            { id: 'a', text: 'ds_grid organiza os dados em duas dimensões (linhas e colunas), como uma planilha ou tabuleiro' },
            { id: 'b', text: 'ds_grid só guarda texto, nunca números' },
            { id: 'c', text: 'Não há diferença nenhuma entre os dois' },
            { id: 'd', text: 'ds_grid é limpo automaticamente da memória, e ds_list não' }
          ],
          answer: 'a',
          explanation: 'A grade organiza os dados por posição em duas dimensões, ao contrário da lista.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que ds_grid_create(10, 10) faz?',
          choices: [
            { id: 'a', text: 'Cria uma nova grade vazia com 10 colunas e 10 linhas' },
            { id: 'b', text: 'Cria uma sala de 10x10 pixels' },
            { id: 'c', text: 'Cria 10 instâncias de um objeto' },
            { id: 'd', text: 'Destrói uma grade existente' }
          ],
          answer: 'a',
          explanation: 'ds_grid_create(largura, altura) define o tamanho da grade em colunas e linhas.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que ds_grid_set(grade, coluna, linha, valor) faz?',
          choices: [
            { id: 'a', text: 'Escreve um valor numa célula específica da grade' },
            { id: 'b', text: 'Lê o valor de uma célula' },
            { id: 'c', text: 'Cria uma nova grade' },
            { id: 'd', text: 'Destrói a grade inteira' }
          ],
          answer: 'a',
          explanation: 'ds_grid_set grava um valor na posição (coluna, linha) indicada.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que cria uma nova grade vazia de 10x10:',
          code: 'grade = ___(10, 10)',
          accept: ['ds_grid_create'],
          explanation: 'ds_grid_create(largura, altura) cria a grade com o tamanho indicado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que ds_grid_get(grade, coluna, linha) devolve?',
          choices: [
            { id: 'a', text: 'O valor guardado naquela célula específica' },
            { id: 'b', text: 'O tamanho total da grade' },
            { id: 'c', text: 'Sempre 0' },
            { id: 'd', text: 'Uma nova grade vazia' }
          ],
          answer: 'a',
          explanation: 'ds_grid_get lê o valor previamente guardado na posição indicada.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual um uso comum de ds_grid num jogo que já usa tilemap?',
          choices: [
            { id: 'a', text: 'Guardar informação lógica (andável, item, saída) na mesma forma de grade, separada do visual' },
            { id: 'b', text: 'Substituir o tilemap por completo' },
            { id: 'c', text: 'Desenhar os sprites do cenário' },
            { id: 'd', text: 'Tocar sons de fundo' }
          ],
          answer: 'a',
          explanation: 'O ds_grid guarda dados de jogo lado a lado com o tilemap visual, sem misturar os dois.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que é preciso chamar ds_grid_destroy quando o grid não for mais usado?',
          choices: [
            { id: 'a', text: 'Porque, assim como ds_list/ds_map, ds_grid não é liberado sozinho da memória' },
            { id: 'b', text: 'Porque senão o jogo trava imediatamente' },
            { id: 'c', text: 'Não é preciso, é só um costume sem efeito real' },
            { id: 'd', text: 'Porque ds_grid é limpo automaticamente, ds_grid_destroy é opcional' }
          ],
          answer: 'a',
          explanation: 'Estruturas ds_ exigem destruição manual, incluindo ds_grid.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função usada para liberar da memória um ds_grid que não será mais usado:',
          code: '___(grade)',
          accept: ['ds_grid_destroy'],
          explanation: 'ds_grid_destroy libera a memória ocupada pela grade.'
        }
      ]
    },
    {
      id: 'gma-05-sequences',
      title: 'Sequences: linha do tempo de animação',
      goal: 'Criar animações mais complexas que uma simples troca de sprite.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Além da animação de sprite simples',
            body: 'Até agora, animar era trocar de frame de sprite (image_index/image_speed). Um Sequence permite montar uma linha do tempo completa: mover, girar, escalar e trocar sprites ao longo do tempo, tudo num único recurso visual.'
          },
          {
            title: 'A linha do tempo (timeline)',
            body: 'No editor de Sequences, você posiciona "quadros-chave" (keyframes) em pontos do tempo, e o GameMaker interpola (calcula os valores intermediários) automaticamente entre eles.'
          },
          {
            title: 'Tocando um Sequence via código',
            body: 'layer_sequence_create(camada, x, y, sequence) cria uma instância de um Sequence numa camada, numa posição, começando a tocar automaticamente.',
            code: 'layer_sequence_create("Efeitos", x, y, seq_explosao)'
          },
          {
            title: 'Quando usar Sequence em vez de código manual',
            body: 'Animações com muitos detalhes visuais (um menu que desliza e depois gira, um efeito de "level up") são mais fáceis de ajustar visualmente num Sequence do que calculando cada valor manualmente no Step.'
          },
          {
            title: 'Sequence x sprite simples',
            body: 'Para animação de personagem simples (andar, pular), a troca de sprite tradicional continua sendo a forma mais direta; Sequence brilha em animações de UI e efeitos curtos.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um Sequence permite além de simplesmente trocar de sprite?',
          choices: [
            { id: 'a', text: 'Montar uma linha do tempo completa, movendo, girando e escalando ao longo do tempo' },
            { id: 'b', text: 'Detectar colisões' },
            { id: 'c', text: 'Ler o teclado' },
            { id: 'd', text: 'Criar novas salas' }
          ],
          answer: 'a',
          explanation: 'Sequences descrevem mudanças de vários valores ao longo do tempo, numa timeline.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que são "quadros-chave" (keyframes) numa timeline?',
          choices: [
            { id: 'a', text: 'Pontos específicos no tempo onde um valor é definido, interpolado automaticamente entre eles' },
            { id: 'b', text: 'Os frames de um sprite' },
            { id: 'c', text: 'Eventos de colisão' },
            { id: 'd', text: 'Variáveis globais' }
          ],
          answer: 'a',
          explanation: 'Keyframes marcam valores em pontos do tempo; o resto é calculado (interpolado) automaticamente.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o GameMaker faz entre dois keyframes?',
          choices: [
            { id: 'a', text: 'Interpola (calcula) os valores intermediários automaticamente' },
            { id: 'b', text: 'Deixa o valor parado até o próximo keyframe' },
            { id: 'c', text: 'Exige que você calcule cada valor manualmente' },
            { id: 'd', text: 'Reinicia a sequência do zero' }
          ],
          answer: 'a',
          explanation: 'A interpolação automática é o que torna a timeline prática de usar.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que cria uma instância de um Sequence numa camada, começando a tocar:',
          code: '___("Efeitos", x, y, seq_explosao)',
          accept: ['layer_sequence_create'],
          explanation: 'layer_sequence_create(camada, x, y, sequence) inicia o Sequence naquela posição.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quando um Sequence costuma valer mais a pena que animação manual no Step?',
          choices: [
            { id: 'a', text: 'Em animações com muitos detalhes visuais, como menus ou efeitos de "level up"' },
            { id: 'b', text: 'Nunca, Sequences são sempre piores que código manual' },
            { id: 'c', text: 'Só para animar o chão da sala' },
            { id: 'd', text: 'Só quando o jogo não tem nenhum objeto' }
          ],
          answer: 'a',
          explanation: 'Sequences facilitam ajustar visualmente animações com vários detalhes combinados.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para animação simples de personagem (andar, pular), o que costuma ser mais direto?',
          choices: [
            { id: 'a', text: 'A troca tradicional de sprite (image_index/image_speed)' },
            { id: 'b', text: 'Sempre um Sequence, sem exceção' },
            { id: 'c', text: 'Um shader' },
            { id: 'd', text: 'Um tilemap' }
          ],
          answer: 'a',
          explanation: 'Para animações simples, trocar de sprite continua sendo o caminho mais direto.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que layer_sequence_create faz?',
          choices: [
            { id: 'a', text: 'Cria uma instância de um Sequence numa camada, numa posição, começando a tocar' },
            { id: 'b', text: 'Cria uma nova camada vazia' },
            { id: 'c', text: 'Destrói um Sequence existente' },
            { id: 'd', text: 'Pausa todos os Sequences do jogo' }
          ],
          answer: 'a',
          explanation: 'layer_sequence_create inicia o Sequence indicado numa camada e posição.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo usado para os pontos específicos definidos numa timeline, interpolados automaticamente entre si:',
          code: 'Um Sequence é composto por vários ___',
          accept: ['keyframes', 'keyframe', 'quadros-chave', 'quadros chave'],
          explanation: 'Keyframes (quadros-chave) marcam os valores em pontos específicos do tempo.'
        }
      ]
    },
    {
      id: 'gma-06-buffers-arquivos',
      title: 'Buffers e salvando arquivos de verdade',
      goal: 'Gravar e ler dados num arquivo real, completando o que ficou pendente na Persistência.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando a Persistência',
            body: 'No módulo intermediário, vimos que json_stringify transforma um struct em texto — mas isso sozinho não SALVA nada em disco. Falta escrever esse texto num arquivo de verdade.'
          },
          {
            title: 'buffer_create',
            body: 'Um buffer é um bloco de memória bruta, pensado para ler/escrever dados binários ou texto de forma eficiente. buffer_create(tamanho, tipo, alinhamento) cria um novo buffer.',
            code: 'var buffer = buffer_create(1024, buffer_grow, 1)'
          },
          {
            title: 'Escrevendo texto num buffer',
            body: 'buffer_write(buffer, buffer_text, texto) escreve uma string dentro do buffer, pronta para ser salva.',
            code: 'buffer_write(buffer, buffer_text, json_stringify(save_data))'
          },
          {
            title: 'buffer_save',
            body: 'buffer_save(buffer, nome_do_arquivo) grava o conteúdo do buffer inteiro num arquivo, no disco do jogador.',
            code: 'buffer_save(buffer, "save1.sav")'
          },
          {
            title: 'Carregando de volta',
            body: 'buffer_load lê um arquivo existente para dentro de um buffer; buffer_read(buffer, buffer_text) lê o texto salvo, que pode então ser transformado de volta em struct com json_parse.',
            code: 'var buffer = buffer_load("save1.sav")\nvar texto = buffer_read(buffer, buffer_text)\nvar dados = json_parse(texto)'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que ainda faltava, depois de json_stringify, para realmente SALVAR o progresso em disco?',
          choices: [
            { id: 'a', text: 'Escrever o texto gerado num arquivo de verdade' },
            { id: 'b', text: 'Nada, json_stringify já salva em disco sozinho' },
            { id: 'c', text: 'Marcar o objeto como persistent' },
            { id: 'd', text: 'Criar uma nova sala' }
          ],
          answer: 'a',
          explanation: 'json_stringify só gera o texto — gravá-lo em arquivo é um passo separado.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que um buffer representa?',
          choices: [
            { id: 'a', text: 'Um bloco de memória bruta, para ler/escrever dados binários ou texto de forma eficiente' },
            { id: 'b', text: 'Um tipo de sprite' },
            { id: 'c', text: 'Um evento assíncrono' },
            { id: 'd', text: 'Uma câmera auxiliar' }
          ],
          answer: 'a',
          explanation: 'Buffers guardam dados brutos, prontos para serem manipulados ou salvos.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que buffer_save faz?',
          choices: [
            { id: 'a', text: 'Grava o conteúdo do buffer inteiro num arquivo no disco' },
            { id: 'b', text: 'Cria um novo buffer vazio' },
            { id: 'c', text: 'Lê um arquivo existente' },
            { id: 'd', text: 'Apaga o conteúdo do buffer' }
          ],
          answer: 'a',
          explanation: 'buffer_save(buffer, nome_do_arquivo) grava o conteúdo do buffer em disco.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que transforma o struct de dados numa string, antes de escrevê-la no buffer:',
          code: 'buffer_write(buffer, buffer_text, ___(save_data))',
          accept: ['json_stringify'],
          explanation: 'json_stringify converte o struct em texto, que o buffer_write então grava.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que buffer_load faz?',
          choices: [
            { id: 'a', text: 'Lê um arquivo existente para dentro de um buffer' },
            { id: 'b', text: 'Grava um buffer em disco' },
            { id: 'c', text: 'Cria um struct vazio' },
            { id: 'd', text: 'Destrói um arquivo' }
          ],
          answer: 'a',
          explanation: 'buffer_load carrega o conteúdo de um arquivo salvo para um buffer em memória.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Depois de ler o texto salvo com buffer_read, o que fazemos para recriar o struct original?',
          choices: [
            { id: 'a', text: 'Chamamos json_parse no texto lido' },
            { id: 'b', text: 'Chamamos buffer_save de novo' },
            { id: 'c', text: 'Não é possível recriar o struct' },
            { id: 'd', text: 'Chamamos instance_create_layer' }
          ],
          answer: 'a',
          explanation: 'json_parse transforma o texto de volta num struct utilizável.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que usamos json_stringify antes de buffer_write?',
          choices: [
            { id: 'a', text: 'Porque buffer_write espera um texto, e json_stringify transforma o struct em texto' },
            { id: 'b', text: 'Porque buffer_write só aceita números' },
            { id: 'c', text: 'Não há motivo real, é só um costume' },
            { id: 'd', text: 'Porque buffer_write apaga structs automaticamente' }
          ],
          answer: 'a',
          explanation: 'buffer_write(buffer, buffer_text, ...) precisa de uma string, daí a conversão prévia.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que grava o conteúdo de um buffer num arquivo chamado "save1.sav":',
          code: '___(buffer, "save1.sav")',
          accept: ['buffer_save'],
          explanation: 'buffer_save(buffer, nome_do_arquivo) grava o buffer inteiro em disco.'
        }
      ]
    },
    {
      id: 'gma-07-eventos-assincronos',
      title: 'Eventos assíncronos',
      goal: 'Lidar com operações que não terminam instantaneamente, sem travar o jogo.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: operações que demoram',
            body: 'Buscar dados na internet, ou ler um arquivo grande, pode levar um tempo que o jogo não pode simplesmente "esperar parado" — isso travaria a experiência do jogador durante toda a espera.'
          },
          {
            title: 'Operações assíncronas',
            body: 'Em vez de esperar parado, o GameMaker inicia a operação e continua rodando o jogo normalmente; quando ela termina (não importa quando), um evento Async correspondente dispara automaticamente, avisando o resultado.'
          },
          {
            title: 'http_get e o Async - HTTP',
            body: 'http_get(url) inicia uma requisição de internet, devolvendo um id, sem travar o jogo esperando; quando a resposta chega, o evento Async - HTTP roda, com o resultado disponível em async_load.',
            code: 'var id_requisicao = http_get("https://exemplo.com/dados")'
          },
          {
            title: 'async_load',
            body: 'Dentro de um evento Async, async_load é um ds_map especial com as informações daquele evento específico — por exemplo, o texto da resposta, ou se deu erro.',
            code: '// Async - HTTP\nif (async_load[? "id"] == id_requisicao) {\n    var resposta = async_load[? "result"]\n}'
          },
          {
            title: 'O mesmo padrão para outras operações',
            body: 'Salvar/carregar buffers grandes, ou operações de rede em jogos multiplayer, seguem o mesmo padrão: iniciar a operação e reagir ao resultado depois, num evento Async específico, sem travar o jogo esperando.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que operações como buscar dados na internet não podem simplesmente "esperar parado"?',
          choices: [
            { id: 'a', text: 'Porque isso travaria o jogo durante toda a espera, prejudicando a experiência' },
            { id: 'b', text: 'Porque GameMaker não permite acessar a internet' },
            { id: 'c', text: 'Não há problema nenhum em esperar parado' },
            { id: 'd', text: 'Porque isso apaga o progresso salvo' }
          ],
          answer: 'a',
          explanation: 'Esperar parado bloquearia o jogo inteiro até a resposta chegar.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que acontece quando uma operação assíncrona termina?',
          choices: [
            { id: 'a', text: 'Um evento Async correspondente dispara automaticamente, avisando o resultado' },
            { id: 'b', text: 'O jogo precisa checar manualmente todo Step se já terminou' },
            { id: 'c', text: 'A instância que iniciou é destruída' },
            { id: 'd', text: 'Nada acontece automaticamente' }
          ],
          answer: 'a',
          explanation: 'O evento Async correspondente é disparado sozinho quando a operação termina.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que http_get(url) faz?',
          choices: [
            { id: 'a', text: 'Inicia uma requisição de internet, devolvendo um id, sem travar o jogo esperando' },
            { id: 'b', text: 'Baixa e aplica a resposta imediatamente, travando o jogo até terminar' },
            { id: 'c', text: 'Cria um novo buffer' },
            { id: 'd', text: 'Só funciona dentro do evento Create' }
          ],
          answer: 'a',
          explanation: 'http_get inicia a requisição de forma assíncrona, sem bloquear o jogo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que inicia uma requisição de internet:',
          code: 'var id_requisicao = ___("https://exemplo.com/dados")',
          accept: ['http_get'],
          explanation: 'http_get(url) inicia a requisição, devolvendo um id para identificá-la depois.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que async_load representa dentro de um evento Async?',
          choices: [
            { id: 'a', text: 'Um ds_map especial com as informações daquele evento específico' },
            { id: 'b', text: 'A posição do mouse' },
            { id: 'c', text: 'Um novo buffer vazio' },
            { id: 'd', text: 'O sprite atual da instância' }
          ],
          answer: 'a',
          explanation: 'async_load carrega os dados relevantes daquele evento assíncrono específico.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a vantagem do padrão assíncrono sobre simplesmente esperar a resposta?',
          choices: [
            { id: 'a', text: 'O jogo continua rodando normalmente enquanto a operação acontece em segundo plano' },
            { id: 'b', text: 'A resposta chega mais rápido' },
            { id: 'c', text: 'Não há vantagem real' },
            { id: 'd', text: 'Elimina completamente a necessidade de internet' }
          ],
          answer: 'a',
          explanation: 'O jogo não fica travado esperando — ele reage quando o resultado chega.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Além de requisições de internet, que outro tipo de operação costuma seguir esse mesmo padrão assíncrono?',
          choices: [
            { id: 'a', text: 'Operações de arquivo/buffer grandes ou de rede multiplayer' },
            { id: 'b', text: 'Trocar o sprite de uma instância' },
            { id: 'c', text: 'Ler o teclado' },
            { id: 'd', text: 'Desenhar texto na tela' }
          ],
          answer: 'a',
          explanation: 'Operações potencialmente demoradas seguem o mesmo padrão: iniciar e reagir depois.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a chave usada para ler o resultado de uma resposta HTTP dentro de async_load:',
          code: 'var resposta = async_load[? ___]',
          accept: ['"result"'],
          explanation: 'async_load[? "result"] guarda o conteúdo da resposta recebida.'
        }
      ]
    },
    {
      id: 'gma-13-networking',
      title: 'Networking multiplayer básico',
      goal: 'Entender os conceitos básicos de comunicação em rede para jogos multiplayer.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que networking é diferente',
            body: 'Até agora, tudo aconteceu num único jogo, numa única máquina. Um jogo multiplayer precisa trocar informação entre máquinas diferentes, pela rede — e isso, assim como vimos com http_get, é uma operação assíncrona.'
          },
          {
            title: 'Criando um socket',
            body: 'network_create_socket(tipo) cria um "canal" de comunicação de rede (por exemplo, network_socket_tcp) — o primeiro passo antes de conectar ou aceitar conexões.',
            code: 'meu_socket = network_create_socket(network_socket_tcp)'
          },
          {
            title: 'Servidor x cliente',
            body: 'Um SERVIDOR fica esperando conexões (network_create_server) e pode ter vários jogadores conectados; um CLIENTE se conecta a um servidor específico (network_connect) — a maioria dos jogos multiplayer simples usa esse modelo.'
          },
          {
            title: 'Enviando dados',
            body: 'network_send_packet envia um buffer de dados (lembra dos buffers, vistos antes?) para o outro lado da conexão — por isso empacotar dados em buffers já é um passo familiar.',
            code: 'network_send_packet(id_conexao, buffer, buffer_get_size(buffer))'
          },
          {
            title: 'Recebendo dados: o evento Async - Networking',
            body: 'Assim como Async - HTTP, dados recebidos pela rede chegam através do evento Async - Networking, com as informações em async_load — o mesmo padrão assíncrono de antes, aplicado à rede.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que a comunicação em rede é tratada de forma assíncrona?',
          choices: [
            { id: 'a', text: 'Porque enviar/receber dados pela rede pode demorar, e o jogo não pode travar esperando' },
            { id: 'b', text: 'Porque GameMaker não suporta rede de outra forma' },
            { id: 'c', text: 'Não há necessidade real disso' },
            { id: 'd', text: 'Porque rede sempre trava o jogo de qualquer forma' }
          ],
          answer: 'a',
          explanation: 'O padrão assíncrono evita que o jogo fique parado esperando a rede responder.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que network_create_socket faz?',
          choices: [
            { id: 'a', text: 'Cria um canal de comunicação de rede, usado antes de conectar ou aceitar conexões' },
            { id: 'b', text: 'Cria uma nova instância de objeto' },
            { id: 'c', text: 'Cria um novo buffer vazio' },
            { id: 'd', text: 'Desconecta todos os jogadores' }
          ],
          answer: 'a',
          explanation: 'network_create_socket prepara o canal de rede que será usado depois.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença entre servidor e cliente num jogo multiplayer simples?',
          choices: [
            { id: 'a', text: 'O servidor espera conexões e pode ter vários jogadores conectados; o cliente se conecta a um servidor específico' },
            { id: 'b', text: 'Não há diferença nenhuma entre os dois papéis' },
            { id: 'c', text: 'O cliente sempre espera conexões' },
            { id: 'd', text: 'Servidor e cliente não podem existir no mesmo jogo' }
          ],
          answer: 'a',
          explanation: 'O modelo servidor/cliente é a base da maioria dos jogos multiplayer simples.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que cria um canal de comunicação de rede:',
          code: 'meu_socket = ___(network_socket_tcp)',
          accept: ['network_create_socket'],
          explanation: 'network_create_socket cria o socket usado para conectar ou aceitar conexões.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que network_send_packet envia?',
          choices: [
            { id: 'a', text: 'Um buffer de dados para o outro lado da conexão' },
            { id: 'b', text: 'Um sprite inteiro' },
            { id: 'c', text: 'Uma nova sala' },
            { id: 'd', text: 'Um evento Alarm' }
          ],
          answer: 'a',
          explanation: 'network_send_packet transmite o conteúdo de um buffer pela rede.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que os buffers (vistos numa lição anterior) são relevantes para networking?',
          choices: [
            { id: 'a', text: 'Porque os dados enviados pela rede são empacotados em buffers, o mesmo conceito já usado para arquivos' },
            { id: 'b', text: 'Buffers não têm nenhuma relação com rede' },
            { id: 'c', text: 'Porque buffers substituem os sockets' },
            { id: 'd', text: 'Porque só é possível enviar texto puro pela rede' }
          ],
          answer: 'a',
          explanation: 'O mesmo conceito de buffer usado para salvar arquivos serve para empacotar dados de rede.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Como dados recebidos pela rede chegam ao jogo?',
          choices: [
            { id: 'a', text: 'Através do evento Async - Networking, com as informações em async_load' },
            { id: 'b', text: 'Direto numa variável global, sem nenhum evento' },
            { id: 'c', text: 'Só é possível ler dados de rede no evento Create' },
            { id: 'd', text: 'GameMaker não permite receber dados de rede' }
          ],
          answer: 'a',
          explanation: 'O padrão assíncrono de eventos também se aplica a dados recebidos pela rede.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que devolve o tamanho de um buffer, usada ao enviar um pacote de rede:',
          code: 'network_send_packet(id_conexao, buffer, ___(buffer))',
          accept: ['buffer_get_size'],
          explanation: 'buffer_get_size informa quantos bytes do buffer devem ser enviados.'
        }
      ]
    },
    {
      id: 'gma-08-object-pooling',
      title: 'Otimização: reaproveitando instâncias (object pooling)',
      goal: 'Evitar o custo de criar e destruir muitas instâncias repetidamente.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O custo de criar/destruir toda hora',
            body: 'instance_create_layer e instance_destroy têm um custo pequeno — mas em jogos com MUITAS criações por segundo (uma metralhadora, muitos efeitos seguidos), esse custo pequeno somado vira um problema real de desempenho.'
          },
          {
            title: 'A ideia do object pooling',
            body: 'Em vez de destruir de verdade uma instância que não é mais necessária, ela é "desativada" (escondida, parada) e guardada numa reserva (pool); ao precisar de uma nova, reaproveitamos uma da reserva em vez de criar do zero.'
          },
          {
            title: 'instance_deactivate_object / instance_activate_object',
            body: 'Desativar uma instância a torna invisível e ignora seus eventos automáticos, sem realmente destruí-la — pronta para ser reativada e reaproveitada depois.',
            code: 'instance_deactivate_object(id)  // "desliga" temporariamente\ninstance_activate_object(id)    // "liga" de novo, reaproveitando'
          },
          {
            title: 'Guardando instâncias inativas',
            body: 'O padrão comum é guardar as instâncias desativadas numa lista (array ou ds_list); ao precisar de uma nova, pegamos uma dessa lista (se houver) em vez de criar uma nova do zero.'
          },
          {
            title: 'Quando vale a pena',
            body: 'Object pooling só compensa quando há criação/destruição muito frequente (balas, efeitos repetidos, inimigos que reaparecem sem parar); para poucas instâncias, criar/destruir normalmente já é rápido o bastante.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual o problema de criar e destruir MUITAS instâncias repetidamente?',
          choices: [
            { id: 'a', text: 'O pequeno custo de cada criação/destruição soma e pode virar um problema real de desempenho' },
            { id: 'b', text: 'GameMaker bloqueia depois de 100 criações' },
            { id: 'c', text: 'Não existe nenhum custo real' },
            { id: 'd', text: 'A sala é destruída automaticamente' }
          ],
          answer: 'a',
          explanation: 'Criações/destruições frequentes acumulam um custo que pode afetar o desempenho.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a ideia central do object pooling?',
          choices: [
            { id: 'a', text: 'Reaproveitar instâncias desativadas em vez de destruí-las e criar novas do zero' },
            { id: 'b', text: 'Nunca destruir nenhuma instância, mesmo desnecessária' },
            { id: 'c', text: 'Criar todas as instâncias possíveis já no Create da sala' },
            { id: 'd', text: 'Usar apenas structs em vez de objetos' }
          ],
          answer: 'a',
          explanation: 'O pooling reaproveita instâncias já existentes, evitando recriar do zero.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que instance_deactivate_object faz?',
          choices: [
            { id: 'a', text: 'Torna a instância invisível e ignora seus eventos automáticos, sem destruí-la de verdade' },
            { id: 'b', text: 'Destrói a instância imediatamente' },
            { id: 'c', text: 'Cria uma cópia da instância' },
            { id: 'd', text: 'Move a instância para fora da sala' }
          ],
          answer: 'a',
          explanation: 'Desativar "pausa" a instância sem realmente destruí-la, permitindo reaproveitá-la depois.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que desativa uma instância temporariamente, sem destruí-la:',
          code: '___(id)  // "desliga" temporariamente, sem destruir',
          accept: ['instance_deactivate_object'],
          explanation: 'instance_deactivate_object desativa a instância, mantendo-a pronta para reativar.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Como reativamos uma instância desativada?',
          choices: [
            { id: 'a', text: 'Chamando instance_activate_object na instância' },
            { id: 'b', text: 'Criando uma instância totalmente nova' },
            { id: 'c', text: 'Reiniciando a sala' },
            { id: 'd', text: 'Não é possível reativar, é preciso criar de novo' }
          ],
          answer: 'a',
          explanation: 'instance_activate_object "liga" de novo a instância que estava desativada.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde costumamos guardar as instâncias desativadas, prontas para reaproveitar?',
          choices: [
            { id: 'a', text: 'Numa lista (array ou ds_list) de instâncias inativas' },
            { id: 'b', text: 'Numa variável global única' },
            { id: 'c', text: 'Não é preciso guardar em lugar nenhum' },
            { id: 'd', text: 'Dentro do evento Draw' }
          ],
          answer: 'a',
          explanation: 'Uma lista de instâncias inativas facilita encontrar uma pronta para reaproveitar.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando object pooling realmente vale a pena?',
          choices: [
            { id: 'a', text: 'Quando há criação/destruição muito frequente, como balas ou efeitos repetidos' },
            { id: 'b', text: 'Sempre, mesmo para um único objeto que nunca se repete' },
            { id: 'c', text: 'Nunca, é uma técnica ultrapassada' },
            { id: 'd', text: 'Só quando o jogo não tem nenhuma instância' }
          ],
          answer: 'a',
          explanation: 'O ganho de pooling aparece justamente quando há muita criação/destruição repetida.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que reativa uma instância desativada, pronta para ser reaproveitada:',
          code: '___(id)  // reativa a instância',
          accept: ['instance_activate_object'],
          explanation: 'instance_activate_object "liga" de novo a instância, reaproveitando-a.'
        }
      ]
    },
    {
      id: 'gma-09-desempenho-profiling',
      title: 'Desempenho: identificando e evitando gargalos',
      goal: 'Usar o profiler e boas práticas para manter o jogo rodando bem.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que medir antes de otimizar',
            body: 'Otimizar sem saber onde está o problema real é perda de tempo — o profiler embutido do GameMaker mostra quanto tempo cada evento/objeto consome a cada frame, apontando onde otimizar de fato importa.'
          },
          {
            title: 'O profiler da IDE',
            body: 'Acessível pela IDE durante o Run, o profiler mostra, quadro a quadro, o tempo gasto em cada evento de cada objeto — o primeiro passo antes de qualquer otimização é olhar aqui.'
          },
          {
            title: 'Medindo manualmente com get_timer',
            body: 'get_timer() devolve o tempo atual do sistema em microssegundos; medir antes e depois de um trecho de código mostra quanto tempo ele realmente consumiu.',
            code: 'var inicio = get_timer()\n// código que queremos medir\nvar duracao = get_timer() - inicio'
          },
          {
            title: 'Evitar recalcular o que não muda',
            body: 'Cálculos caros (ex: distância entre muitas instâncias) não precisam ser refeitos todo Step se o resultado não muda a cada frame — guardar o resultado numa variável e só recalcular quando necessário evita trabalho repetido.'
          },
          {
            title: 'Draw: menos é mais',
            body: 'Cada draw_ tem um custo; desenhar algo fora da view da câmera desperdiça tempo — checar se algo está visível antes de desenhá-lo, junto com object pooling e delta_time (já vistos), é boa parte do trabalho de manter um jogo rodando bem em hardware variado.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que medir antes de otimizar?',
          choices: [
            { id: 'a', text: 'Porque otimizar sem saber onde está o problema real é perda de tempo' },
            { id: 'b', text: 'Porque medir sempre piora o desempenho' },
            { id: 'c', text: 'Não é necessário medir nada, basta otimizar tudo' },
            { id: 'd', text: 'Porque o GameMaker exige isso para compilar' }
          ],
          answer: 'a',
          explanation: 'Sem medir, é fácil otimizar a parte errada do jogo, sem ganho real.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que o profiler do GameMaker mostra?',
          choices: [
            { id: 'a', text: 'Quanto tempo cada evento de cada objeto consome, quadro a quadro' },
            { id: 'b', text: 'Só o uso de memória RAM' },
            { id: 'c', text: 'Apenas erros de sintaxe' },
            { id: 'd', text: 'O histórico de versões do projeto' }
          ],
          answer: 'a',
          explanation: 'O profiler detalha o tempo gasto em cada evento/objeto, quadro a quadro.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que get_timer() devolve?',
          choices: [
            { id: 'a', text: 'O tempo atual do sistema, em microssegundos' },
            { id: 'b', text: 'A posição x da instância' },
            { id: 'c', text: 'O tamanho da sala' },
            { id: 'd', text: 'O número de instâncias vivas' }
          ],
          answer: 'a',
          explanation: 'get_timer() devolve um valor em microssegundos, útil para medir durações.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para medir manualmente quanto tempo um trecho de código levou:',
          code: 'var inicio = ___()',
          accept: ['get_timer'],
          explanation: 'get_timer() marca o instante inicial, para comparar com o tempo depois do trecho medido.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que evitar recalcular um valor que não muda a cada Step?',
          choices: [
            { id: 'a', text: 'Porque refazer o mesmo cálculo repetidamente desperdiça tempo de processamento' },
            { id: 'b', text: 'Porque isso é proibido pela engine' },
            { id: 'c', text: 'Não há problema nenhum em recalcular sempre' },
            { id: 'd', text: 'Porque isso muda o resultado do cálculo' }
          ],
          answer: 'a',
          explanation: 'Recalcular algo que não mudou é trabalho repetido e desnecessário.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que desenhar algo fora da view da câmera é desperdício?',
          choices: [
            { id: 'a', text: 'Porque o jogador não vai ver aquele desenho, mas ele ainda consome tempo de processamento' },
            { id: 'b', text: 'Porque isso trava o jogo imediatamente' },
            { id: 'c', text: 'Não é desperdício, é necessário desenhar tudo sempre' },
            { id: 'd', text: 'Porque a câmera é destruída nesse caso' }
          ],
          answer: 'a',
          explanation: 'Desenhar o que não será visto consome tempo sem trazer benefício visual.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a relação entre object pooling (lição anterior) e desempenho?',
          choices: [
            { id: 'a', text: 'Reduz o custo de criar/destruir instâncias com muita frequência' },
            { id: 'b', text: 'Não tem nenhuma relação com desempenho' },
            { id: 'c', text: 'Torna as instâncias mais bonitas visualmente' },
            { id: 'd', text: 'Substitui o uso de sprites' }
          ],
          answer: 'a',
          explanation: 'Object pooling foi visto justamente como uma técnica de otimização de desempenho.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a ferramenta da IDE usada, antes de qualquer otimização, para descobrir onde está o gargalo real:',
          code: 'Antes de otimizar, usamos o ___ para descobrir onde está o gargalo real',
          accept: ['profiler'],
          explanation: 'O profiler mostra, com dados reais, onde o tempo do jogo está sendo gasto.'
        }
      ]
    },
    {
      id: 'gma-10-fisica-basica',
      title: 'Física básica (Box2D)',
      goal: 'Usar o motor de física embutido para movimento e colisões realistas.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Física própria x física de verdade',
            body: 'Até agora, todo movimento (x/y, speed/direction) foi controlado manualmente por você. O GameMaker também tem um motor de física embutido (baseado no Box2D), que simula gravidade, forças e colisões realistas automaticamente.'
          },
          {
            title: 'Ativando o mundo físico',
            body: 'physics_world_create(gravidade_x, gravidade_y) ativa a simulação física da sala, definindo a força e direção da gravidade.',
            code: 'physics_world_create(0, 10)  // gravidade "para baixo"'
          },
          {
            title: 'physics_fixture',
            body: 'Antes de um objeto poder participar da física, ele precisa de uma "fixture" (physics_fixture_create + physics_fixture_set_box_shape/circle_shape + physics_fixture_bind), que define sua forma física e propriedades (densidade, atrito).'
          },
          {
            title: 'Aplicando forças',
            body: 'Em vez de mudar x/y diretamente, instâncias físicas são movidas aplicando FORÇAS ou IMPULSOS (physics_apply_force, physics_apply_impulse) — o motor de física calcula o resultado, incluindo colisões com outros corpos físicos, automaticamente.',
            code: 'physics_apply_impulse(x, y, 0, -500)  // um "pulo" físico'
          },
          {
            title: 'Quando vale a pena usar física de verdade',
            body: 'Para jogos que precisam de física realista (empilhar caixas, veículos, balanços, cordas), o motor físico economiza muito trabalho manual; para a maioria dos jogos 2D simples, o movimento manual (x/y, speed/direction) continua sendo mais simples e previsível.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o motor de física embutido do GameMaker simula automaticamente?',
          choices: [
            { id: 'a', text: 'Gravidade, forças e colisões realistas' },
            { id: 'b', text: 'Apenas o som do jogo' },
            { id: 'c', text: 'A troca de salas' },
            { id: 'd', text: 'O texto da interface' }
          ],
          answer: 'a',
          explanation: 'O motor físico (Box2D) cuida de gravidade, forças e colisões de forma realista.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que physics_world_create(0, 10) faz?',
          choices: [
            { id: 'a', text: 'Ativa a simulação física da sala, com a gravidade definida' },
            { id: 'b', text: 'Cria uma nova sala física' },
            { id: 'c', text: 'Destrói toda a física existente' },
            { id: 'd', text: 'Move a câmera 10 pixels' }
          ],
          answer: 'a',
          explanation: 'physics_world_create ativa a física da sala, com a gravidade x/y informada.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Para que serve uma physics_fixture?',
          choices: [
            { id: 'a', text: 'Define a forma física e propriedades (densidade, atrito) de uma instância antes dela participar da física' },
            { id: 'b', text: 'Define o sprite da instância' },
            { id: 'c', text: 'Cria uma nova sala' },
            { id: 'd', text: 'Ativa o teclado' }
          ],
          answer: 'a',
          explanation: 'A fixture é o que conecta uma instância ao mundo físico, com forma e propriedades.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o valor de gravidade vertical usado para simular gravidade "para baixo":',
          code: 'physics_world_create(0, ___)  // gravidade "para baixo"',
          accept: ['10'],
          explanation: 'Um valor positivo de gravidade y simula a gravidade puxando para baixo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Como movemos uma instância física, em vez de mudar x/y diretamente?',
          choices: [
            { id: 'a', text: 'Aplicando forças ou impulsos (physics_apply_force/physics_apply_impulse)' },
            { id: 'b', text: 'Só é possível mudando x/y diretamente, física não muda isso' },
            { id: 'c', text: 'Recriando a instância a cada frame' },
            { id: 'd', text: 'Trocando o sprite da instância' }
          ],
          answer: 'a',
          explanation: 'Instâncias físicas são movidas por forças/impulsos, e o motor calcula o resultado.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que physics_apply_impulse(x, y, 0, -500) representa no exemplo?',
          choices: [
            { id: 'a', text: 'Um "pulo" físico, aplicando um impulso para cima' },
            { id: 'b', text: 'Uma queda para baixo' },
            { id: 'c', text: 'Um giro em torno do próprio eixo' },
            { id: 'd', text: 'A destruição da instância' }
          ],
          answer: 'a',
          explanation: 'Um impulso vertical negativo (para cima) simula um pulo físico.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando vale mais a pena usar o motor de física de verdade em vez de movimento manual?',
          choices: [
            { id: 'a', text: 'Quando o jogo precisa de física realista, como empilhar caixas, veículos ou cordas' },
            { id: 'b', text: 'Sempre, para qualquer jogo 2D simples' },
            { id: 'c', text: 'Nunca, física de verdade é sempre pior' },
            { id: 'd', text: 'Só quando o jogo não tem colisões' }
          ],
          answer: 'a',
          explanation: 'O motor físico compensa quando há necessidade real de comportamento físico realista.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que aplica um impulso físico a uma instância:',
          code: '___(x, y, 0, -500)  // aplica um impulso para cima',
          accept: ['physics_apply_impulse'],
          explanation: 'physics_apply_impulse aplica um impulso instantâneo, movendo a instância pela física.'
        }
      ]
    }
  ]
};
