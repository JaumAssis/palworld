// Módulo "Intermediário" — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes
// por lição). Ver ../index.js para o formato e a validação de boot. Sintaxe GML (GameMaker
// Language) usada nos exemplos de código, mesmo padrão de ./01-fundamentos.js.
// Ids não são numericamente sequenciais na ordem pedagógica: gmi-14/gmi-15/gmi-16 foram inseridas
// depois, entre lições já numeradas (mesma convenção de 01-fundamentos.js) — delta_time logo após
// Alarms (ambos lidam com tempo/quadros), Paths logo após Máquinas de estado (implementação real
// do estado "patrulhando"), Partículas logo após Câmera (agrupando os dois assuntos visuais).
module.exports = {
  id: 'intermediario-gamemaker',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Arrays, estruturas de dados, funções próprias, herança, estados, câmera e persistência',
  accent: '#38bdf8',
  lessons: [
    {
      id: 'gmi-01-arrays',
      title: 'Arrays em GML',
      goal: 'Guardar várias informações numa única variável e percorrê-las com um laço.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que um array?',
            body: 'Até agora, cada informação (vida, pontos, nome) vivia numa variável separada. Um array guarda uma LISTA de valores numa única variável, acessados por posição (índice), começando em 0.',
            code: 'inventario = ["espada", "escudo", "poção"]'
          },
          {
            title: 'Lendo e alterando um item pelo índice',
            body: 'Colocamos o índice entre colchetes para ler ou trocar um item específico do array — o primeiro item é o índice 0, o segundo o índice 1, e assim por diante.',
            code: 'show_debug_message(inventario[0])  // "espada"\ninventario[1] = "escudo de ferro"'
          },
          {
            title: 'array_length',
            body: 'array_length(array) devolve quantos itens o array tem no momento — útil para não tentar acessar um índice que não existe.',
            code: 'var total = array_length(inventario)'
          },
          {
            title: 'array_push',
            body: 'array_push(array, valor) adiciona um novo item ao final do array, crescendo a lista dinamicamente durante o jogo.',
            code: 'array_push(inventario, "poção de mana")'
          },
          {
            title: 'Percorrendo um array com for',
            body: 'A combinação mais comum é um laço for de 0 até array_length(array) - 1, lendo cada posição do array uma por uma.',
            code: 'for (var i = 0; i < array_length(inventario); i += 1) {\n    show_debug_message(inventario[i])\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um array permite fazer?',
          choices: [
            { id: 'a', text: 'Guardar uma lista de valores numa única variável, acessados por índice' },
            { id: 'b', text: 'Tocar um som em loop' },
            { id: 'c', text: 'Criar uma nova sala' },
            { id: 'd', text: 'Desenhar texto na tela' }
          ],
          answer: 'a',
          explanation: 'Um array agrupa vários valores relacionados numa única variável.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o índice do PRIMEIRO item de um array em GML?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '1' },
            { id: 'c', text: '-1' },
            { id: 'd', text: 'Depende do array' }
          ],
          answer: 'a',
          explanation: 'Arrays em GML começam do índice 0, como na maioria das linguagens.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que array_length(inventario) devolve?',
          choices: [
            { id: 'a', text: 'A quantidade de itens que o array tem no momento' },
            { id: 'b', text: 'O primeiro item do array' },
            { id: 'c', text: 'O último item do array' },
            { id: 'd', text: 'Um novo array vazio' }
          ],
          answer: 'a',
          explanation: 'array_length devolve o tamanho atual do array.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que adiciona um novo item ao final de um array:',
          code: '___(inventario, "poção de mana")',
          accept: ['array_push'],
          explanation: 'array_push(array, valor) adiciona um item ao final do array.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a forma mais comum de percorrer todos os itens de um array?',
          choices: [
            { id: 'a', text: 'Um for de 0 até array_length(array) - 1' },
            { id: 'b', text: 'Um único if' },
            { id: 'c', text: 'Não é possível percorrer um array' },
            { id: 'd', text: 'Só com instance_create_layer' }
          ],
          answer: 'a',
          explanation: 'O for combinado com array_length é o jeito padrão de percorrer um array.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Em inventario[1] = "escudo de ferro", o que essa linha faz?',
          choices: [
            { id: 'a', text: 'Troca o item de índice 1 (o segundo) do array' },
            { id: 'b', text: 'Cria um novo array' },
            { id: 'c', text: 'Remove o primeiro item' },
            { id: 'd', text: 'Lê o tamanho do array' }
          ],
          answer: 'a',
          explanation: 'Atribuir a array[i] substitui o valor que estava naquela posição.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'inventario = ["espada", "escudo", "poção"] — qual o valor de inventario[2]?',
          choices: [
            { id: 'a', text: '"poção"' },
            { id: 'b', text: '"espada"' },
            { id: 'c', text: '"escudo"' },
            { id: 'd', text: 'Não existe índice 2' }
          ],
          answer: 'a',
          explanation: 'Índice 0 é "espada", 1 é "escudo", 2 é "poção".'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que devolve quantos itens um array tem:',
          code: 'var total = ___(inventario)',
          accept: ['array_length'],
          explanation: 'array_length(array) devolve o tamanho atual do array.'
        }
      ]
    },
    {
      id: 'gmi-02-ds-list-map',
      title: 'ds_list e ds_map',
      goal: 'Guardar coleções mais flexíveis que um array, usando listas e mapas chave-valor.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Além dos arrays',
            body: 'GameMaker também oferece ESTRUTURAS DE DADOS próprias — mais flexíveis que um array simples: ds_list (uma lista que cresce/encolhe facilmente) e ds_map (pares chave-valor, tipo um dicionário).'
          },
          {
            title: 'Criando e usando um ds_list',
            body: 'ds_list_create() cria uma lista vazia; ds_list_add adiciona itens ao final; ds_list_size devolve o tamanho atual.',
            code: 'var lista = ds_list_create()\nds_list_add(lista, "poção")\nds_list_add(lista, "elixir")'
          },
          {
            title: 'Criando e usando um ds_map',
            body: 'ds_map_create() cria um mapa vazio; ds_map_add associa uma CHAVE a um VALOR; ds_map_find_value busca o valor a partir da chave.',
            code: 'var jogador = ds_map_create()\nds_map_add(jogador, "vida", 100)\nvar vida = ds_map_find_value(jogador, "vida")'
          },
          {
            title: 'Destruindo estruturas de dados',
            body: 'Diferente de arrays e structs, ds_list e ds_map NÃO são limpos sozinhos da memória — é preciso chamar ds_list_destroy ou ds_map_destroy quando não forem mais usados, senão o jogo vai consumindo memória aos poucos (vazamento de memória).',
            code: 'ds_map_destroy(jogador)'
          },
          {
            title: 'Quando usar cada uma',
            body: 'Use array para listas simples e de tamanho mais previsível; ds_list quando precisar inserir/remover no meio com frequência; ds_map quando quiser buscar valores por um nome (chave) em vez de por posição.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um ds_map guarda?',
          choices: [
            { id: 'a', text: 'Pares chave-valor, permitindo buscar um valor a partir de um nome' },
            { id: 'b', text: 'Só números inteiros' },
            { id: 'c', text: 'Apenas sprites' },
            { id: 'd', text: 'Só uma sequência fixa de itens sem nome' }
          ],
          answer: 'a',
          explanation: 'ds_map associa cada valor a uma chave, como um dicionário.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual função cria um ds_map vazio?',
          choices: [
            { id: 'a', text: 'ds_map_create' },
            { id: 'b', text: 'ds_map_add' },
            { id: 'c', text: 'array_create' },
            { id: 'd', text: 'ds_map_destroy' }
          ],
          answer: 'a',
          explanation: 'ds_map_create() cria uma nova estrutura de mapa vazia.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que ds_map_find_value(jogador, "vida") faz?',
          choices: [
            { id: 'a', text: 'Busca e devolve o valor associado à chave "vida"' },
            { id: 'b', text: 'Cria uma nova chave "vida"' },
            { id: 'c', text: 'Remove a chave "vida" do mapa' },
            { id: 'd', text: 'Destrói o mapa inteiro' }
          ],
          answer: 'a',
          explanation: 'ds_map_find_value busca o valor guardado sob a chave informada.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para liberar da memória um ds_map que não será mais usado:',
          code: '___(jogador)',
          accept: ['ds_map_destroy'],
          explanation: 'ds_map_destroy libera a memória ocupada pelo mapa — estruturas ds_ não são limpas sozinhas.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que é preciso chamar ds_list_destroy/ds_map_destroy manualmente?',
          choices: [
            { id: 'a', text: 'Porque essas estruturas não são liberadas sozinhas da memória, ao contrário de arrays e structs' },
            { id: 'b', text: 'Porque senão o jogo trava imediatamente' },
            { id: 'c', text: 'Não é preciso, é só um costume antigo' },
            { id: 'd', text: 'Porque toda variável precisa ser destruída manualmente em GML' }
          ],
          answer: 'a',
          explanation: 'ds_list e ds_map exigem destruição explícita, ao contrário de arrays e structs.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual função adiciona um item ao final de um ds_list?',
          choices: [
            { id: 'a', text: 'ds_list_add' },
            { id: 'b', text: 'ds_map_add' },
            { id: 'c', text: 'array_push' },
            { id: 'd', text: 'ds_list_create' }
          ],
          answer: 'a',
          explanation: 'ds_list_add(lista, valor) adiciona um item ao final da lista.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando faz mais sentido usar um ds_map em vez de um array?',
          choices: [
            { id: 'a', text: 'Quando você quer buscar valores por um nome (chave), não por posição numérica' },
            { id: 'b', text: 'Quando você só precisa de números' },
            { id: 'c', text: 'Arrays e ds_map são sempre intercambiáveis, sem diferença' },
            { id: 'd', text: 'ds_map só serve para sprites' }
          ],
          answer: 'a',
          explanation: 'A vantagem do ds_map é associar valores a chaves nomeadas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que cria um ds_map vazio:',
          code: 'var jogador = ___()',
          accept: ['ds_map_create'],
          explanation: 'ds_map_create() cria uma nova estrutura de mapa, pronta para receber pares chave-valor.'
        }
      ]
    },
    {
      id: 'gmi-03-structs',
      title: 'Structs',
      goal: 'Agrupar dados relacionados com a sintaxe mais simples e moderna do GML.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Uma alternativa mais simples ao ds_map',
            body: 'Um STRUCT agrupa vários valores nomeados, parecido com um ds_map, mas com sintaxe mais simples ({} e ponto) e sem precisar destruir manualmente — o GameMaker limpa da memória sozinho quando o struct não é mais usado.',
            code: 'var jogador = { vida: 100, nome: "Herói", velocidade: 4 }'
          },
          {
            title: 'Acessando campos com ponto',
            body: 'Acessamos e alteramos os campos de um struct com um ponto, parecido com como já fazíamos com variáveis de instância.',
            code: 'jogador.vida -= 10\nshow_debug_message(jogador.nome)'
          },
          {
            title: 'Structs dentro de variáveis de instância',
            body: 'É comum guardar um struct numa variável de instância, para organizar dados relacionados (por exemplo, todos os atributos de um personagem) num único lugar em vez de várias variáveis soltas.'
          },
          {
            title: 'Struct x ds_map',
            body: 'Structs são mais simples de escrever e são limpos automaticamente da memória; ds_map ainda é útil quando os nomes dos campos só são conhecidos em tempo de execução (ex: vindos de um arquivo).'
          },
          {
            title: 'Structs e JSON',
            body: 'A sintaxe de struct é muito parecida com JSON — isso facilita bastante quando formos falar de salvar e carregar dados do jogo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um struct agrupa?',
          choices: [
            { id: 'a', text: 'Vários valores nomeados, parecido com um ds_map, mas com sintaxe mais simples' },
            { id: 'b', text: 'Só sprites' },
            { id: 'c', text: 'Só sons' },
            { id: 'd', text: 'Apenas uma sala inteira' }
          ],
          answer: 'a',
          explanation: 'Structs agrupam campos nomeados, como um "pacote" de dados relacionados.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como acessamos o campo vida de var jogador = { vida: 100 }?',
          choices: [
            { id: 'a', text: 'jogador.vida' },
            { id: 'b', text: 'jogador["vida"]' },
            { id: 'c', text: 'jogador->vida' },
            { id: 'd', text: 'vida(jogador)' }
          ],
          answer: 'a',
          explanation: 'Structs usam ponto para acessar seus campos, igual variáveis de instância.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que acontece com um struct que não é mais usado por ninguém?',
          choices: [
            { id: 'a', text: 'O GameMaker limpa ele da memória automaticamente' },
            { id: 'b', text: 'É preciso chamar struct_destroy manualmente' },
            { id: 'c', text: 'Ele trava o jogo' },
            { id: 'd', text: 'Ele vira um ds_map automaticamente' }
          ],
          answer: 'a',
          explanation: 'Diferente de ds_list/ds_map, structs são liberados sozinhos da memória.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a expressão que acessa o campo nome de um struct chamado jogador:',
          code: 'show_debug_message(jogador___nome)',
          accept: ['.'],
          explanation: 'O ponto é usado para acessar um campo de um struct.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a principal vantagem prática de um struct sobre um ds_map?',
          choices: [
            { id: 'a', text: 'Sintaxe mais simples e limpeza automática de memória' },
            { id: 'b', text: 'Structs são sempre mais rápidos em qualquer situação' },
            { id: 'c', text: 'ds_map não existe mais no GameMaker' },
            { id: 'd', text: 'Não há nenhuma diferença real' }
          ],
          answer: 'a',
          explanation: 'A sintaxe {} e ponto é mais direta, e não exige destruição manual.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'A sintaxe de um struct em GML se parece muito com qual formato?',
          choices: [
            { id: 'a', text: 'JSON' },
            { id: 'b', text: 'XML' },
            { id: 'c', text: 'CSV' },
            { id: 'd', text: 'HTML' }
          ],
          answer: 'a',
          explanation: 'Structs em GML têm uma sintaxe muito parecida com objetos JSON.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'jogador.vida -= 10 faz o quê?',
          choices: [
            { id: 'a', text: 'Subtrai 10 do campo vida do struct jogador' },
            { id: 'b', text: 'Cria um novo struct' },
            { id: 'c', text: 'Destrói o struct jogador' },
            { id: 'd', text: 'Soma 10 ao campo vida' }
          ],
          answer: 'a',
          explanation: '-= subtrai e atribui de volta ao mesmo campo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete os símbolos usados para criar um struct vazio:',
          code: 'var config = ___',
          accept: ['{}'],
          explanation: '{} cria um struct vazio, ao qual campos podem ser adicionados depois.'
        }
      ]
    },
    {
      id: 'gmi-04-funcoes',
      title: 'Funções e scripts próprios',
      goal: 'Criar funções reutilizáveis, com parâmetros e retorno, para organizar a lógica do jogo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que criar suas próprias funções',
            body: 'Até agora usamos apenas funções prontas do GameMaker (keyboard_check, instance_create_layer...). Também é possível criar as SUAS PRÓPRIAS funções, para reaproveitar um trecho de lógica em vários lugares do jogo.'
          },
          {
            title: 'Declarando uma função',
            body: 'A palavra function declara uma nova função, com um nome e parâmetros entre parênteses.',
            code: 'function curar(quantidade) {\n    vida += quantidade\n}'
          },
          {
            title: 'Retornando um valor',
            body: 'A palavra return devolve um valor de dentro da função para quem a chamou, encerrando a execução da função naquele ponto.',
            code: 'function dobro(numero) {\n    return numero * 2\n}\nvar resultado = dobro(5)  // 10'
          },
          {
            title: 'Escopo: var (local) x variável de instância x global',
            body: 'var dentro de uma função cria uma variável LOCAL, que só existe durante aquela chamada; sem var, a variável passa a pertencer à instância; com global., é compartilhada por todo o jogo.',
            code: 'function calcular() {\n    var total = 0  // some depois da função terminar\n    return total\n}'
          },
          {
            title: 'Onde declarar funções próprias',
            body: 'Funções próprias costumam ficar num Script separado (um recurso do tipo Script no projeto) ou no evento Create de um objeto controlador, para poderem ser chamadas de qualquer lugar do jogo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual palavra-chave declara uma nova função em GML?',
          choices: [
            { id: 'a', text: 'function' },
            { id: 'b', text: 'def' },
            { id: 'c', text: 'method' },
            { id: 'd', text: 'event' }
          ],
          answer: 'a',
          explanation: 'function nome(parâmetros) { ... } declara uma função própria em GML.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a palavra return faz dentro de uma função?',
          choices: [
            { id: 'a', text: 'Devolve um valor para quem chamou a função e encerra a execução dela' },
            { id: 'b', text: 'Cria uma nova variável global' },
            { id: 'c', text: 'Repete a função automaticamente' },
            { id: 'd', text: 'Destrói a instância atual' }
          ],
          answer: 'a',
          explanation: 'return encerra a função devolvendo um valor ao ponto onde ela foi chamada.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Em function curar(quantidade) { vida += quantidade }, o que é "quantidade"?',
          choices: [
            { id: 'a', text: 'Um parâmetro da função' },
            { id: 'b', text: 'Uma variável global' },
            { id: 'c', text: 'O nome de um objeto' },
            { id: 'd', text: 'Um evento' }
          ],
          answer: 'a',
          explanation: 'Parâmetros são os valores recebidos pela função quando ela é chamada.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra que devolve um valor de dentro de uma função:',
          code: 'function dobro(numero) {\n    ___ numero * 2\n}',
          accept: ['return'],
          explanation: 'return devolve o valor calculado para quem chamou a função.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que var faz quando usado dentro de uma função?',
          choices: [
            { id: 'a', text: 'Cria uma variável local, que só existe durante aquela chamada' },
            { id: 'b', text: 'Cria uma variável global automaticamente' },
            { id: 'c', text: 'Destrói a variável de mesmo nome' },
            { id: 'd', text: 'Não tem efeito nenhum em GML' }
          ],
          answer: 'a',
          explanation: 'var declara uma variável local, que desaparece quando a função termina.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a principal vantagem de criar suas próprias funções?',
          choices: [
            { id: 'a', text: 'Reaproveitar a mesma lógica em vários lugares do jogo, sem repetir código' },
            { id: 'b', text: 'Elas rodam mais rápido que qualquer outro código' },
            { id: 'c', text: 'Só funções próprias podem usar if' },
            { id: 'd', text: 'Não têm nenhuma vantagem real' }
          ],
          answer: 'a',
          explanation: 'Funções evitam repetir o mesmo trecho de lógica em vários pontos do código.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'var resultado = dobro(5) — supondo function dobro(numero) { return numero * 2 }, qual o valor de resultado?',
          choices: [
            { id: 'a', text: '10' },
            { id: 'b', text: '5' },
            { id: 'c', text: '2' },
            { id: 'd', text: 'Nenhum, a função não devolve nada' }
          ],
          answer: 'a',
          explanation: 'dobro(5) devolve 5 * 2, ou seja, 10.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que declara uma função chamada curar:',
          code: '___ curar(quantidade) {\n    vida += quantidade\n}',
          accept: ['function'],
          explanation: 'function é a palavra-chave que inicia a declaração de uma função própria.'
        }
      ]
    },
    {
      id: 'gmi-05-with',
      title: 'with() e múltiplas instâncias',
      goal: 'Executar código em várias instâncias de um objeto ao mesmo tempo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema: várias instâncias do mesmo objeto',
            body: 'Um jogo normalmente tem várias instâncias do mesmo objeto ao mesmo tempo (vários inimigos, várias moedas). Às vezes precisamos executar uma ação em TODAS elas de uma vez, de fora do código de cada uma.'
          },
          {
            title: 'with(objeto) { ... }',
            body: 'with(objeto) { ... } executa o bloco de código UMA VEZ PARA CADA instância existente daquele objeto, como se o código estivesse rodando dentro de cada uma delas.',
            code: 'with (obj_inimigo) {\n    vida = 0\n}'
          },
          {
            title: 'with(all) e with(other)',
            body: 'with(all) executa o bloco para TODAS as instâncias do jogo, de qualquer objeto; other, usado dentro de um with ou de uma colisão, se refere à outra instância envolvida (não a que está executando o código).'
          },
          {
            title: 'instance_number',
            body: 'instance_number(objeto) devolve quantas instâncias daquele objeto existem no momento — útil para, por exemplo, checar se ainda há inimigos vivos antes de avançar de fase.',
            code: 'if (instance_number(obj_inimigo) == 0) {\n    room_goto_next()\n}'
          },
          {
            title: 'instance_nearest',
            body: 'instance_nearest(x, y, objeto) devolve a instância daquele objeto mais próxima de uma posição — muito usado para, por exemplo, mirar automaticamente no inimigo mais próximo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que with(obj_inimigo) { vida = 0 } faz?',
          choices: [
            { id: 'a', text: 'Executa "vida = 0" em cada instância existente de obj_inimigo' },
            { id: 'b', text: 'Cria uma nova instância de obj_inimigo' },
            { id: 'c', text: 'Destrói o objeto obj_inimigo do projeto' },
            { id: 'd', text: 'Só afeta a primeira instância criada' }
          ],
          answer: 'a',
          explanation: 'with roda o bloco de código uma vez para cada instância do objeto indicado.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que with(all) { ... } faz?',
          choices: [
            { id: 'a', text: 'Executa o bloco para todas as instâncias existentes no jogo, de qualquer objeto' },
            { id: 'b', text: 'Executa só uma vez, sem repetir' },
            { id: 'c', text: 'Só funciona dentro do evento Create' },
            { id: 'd', text: 'Cria uma instância chamada "all"' }
          ],
          answer: 'a',
          explanation: 'all é uma palavra-chave especial que representa todas as instâncias do jogo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que instance_number(obj_inimigo) devolve?',
          choices: [
            { id: 'a', text: 'Quantas instâncias de obj_inimigo existem no momento' },
            { id: 'b', text: 'A posição da instância mais próxima' },
            { id: 'c', text: 'O nome do objeto' },
            { id: 'd', text: 'Sempre 1' }
          ],
          answer: 'a',
          explanation: 'instance_number conta quantas instâncias daquele objeto existem agora.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para executar um bloco de código em cada instância de obj_inimigo:',
          code: '___ (obj_inimigo) {\n    vida = 0\n}',
          accept: ['with'],
          explanation: 'with(objeto) { ... } executa o bloco em cada instância daquele objeto.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que serve instance_nearest(x, y, objeto)?',
          choices: [
            { id: 'a', text: 'Encontrar a instância daquele objeto mais próxima de uma posição' },
            { id: 'b', text: 'Contar quantas instâncias existem' },
            { id: 'c', text: 'Destruir a instância mais próxima' },
            { id: 'd', text: 'Criar uma instância na posição informada' }
          ],
          answer: 'a',
          explanation: 'instance_nearest devolve a instância mais próxima da posição indicada.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'if (instance_number(obj_inimigo) == 0) { room_goto_next() } faz o quê?',
          choices: [
            { id: 'a', text: 'Avança para a próxima sala quando não há mais nenhum obj_inimigo vivo' },
            { id: 'b', text: 'Cria um novo obj_inimigo' },
            { id: 'c', text: 'Sempre avança de sala, não importa o número de inimigos' },
            { id: 'd', text: 'Conta quantas salas existem no jogo' }
          ],
          answer: 'a',
          explanation: 'A checagem de instance_number == 0 é um jeito comum de detectar "fase concluída".'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Dentro de um with(obj_inimigo) { ... }, a que se refere other?',
          choices: [
            { id: 'a', text: 'À instância que executou o código antes de entrar no with (não a que está sendo afetada)' },
            { id: 'b', text: 'Sempre ao jogador' },
            { id: 'c', text: 'A um objeto que não existe no jogo' },
            { id: 'd', text: 'Ao mesmo que "self"' }
          ],
          answer: 'a',
          explanation: 'other, dentro de with (ou de uma colisão), se refere à outra instância envolvida.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que devolve quantas instâncias de um objeto existem no momento:',
          code: 'if (___(obj_inimigo) == 0) {\n    room_goto_next()\n}',
          accept: ['instance_number'],
          explanation: 'instance_number(objeto) conta as instâncias vivas daquele objeto.'
        }
      ]
    },
    {
      id: 'gmi-06-heranca',
      title: 'Herança de objetos',
      goal: 'Reaproveitar comportamento entre objetos parecidos usando Parent/Child.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema: objetos parecidos, mas não iguais',
            body: 'Imagine vários tipos de inimigo, todos com vida e podendo levar dano, mas cada um com um ataque diferente. Repetir a lógica de vida/dano em cada objeto é repetitivo e propenso a erro.'
          },
          {
            title: 'Parent (objeto pai)',
            body: 'No editor de objetos, é possível definir um Parent (objeto pai) para outro objeto — o objeto filho HERDA os eventos e variáveis do pai, podendo reaproveitar essa lógica comum.'
          },
          {
            title: 'Sobrescrevendo um evento herdado',
            body: 'Um objeto filho pode ter seu PRÓPRIO código num evento (por exemplo, Step), que substitui o do pai nesse evento específico — permitindo personalizar só o que for diferente.'
          },
          {
            title: 'event_inherited()',
            body: 'Dentro do evento de um filho, event_inherited() executa o código do MESMO evento do objeto pai, além do código próprio do filho — útil para complementar em vez de substituir totalmente.',
            code: '// Step do filho\nevent_inherited()  // roda a lógica de vida/dano do pai\n// ...lógica extra do filho aqui'
          },
          {
            title: 'Quando vale a pena usar herança',
            body: 'Herança compensa quando vários objetos compartilham uma parte real de comportamento (vida, dano, movimento básico) — para coisas totalmente diferentes, objetos sem parentesco continuam sendo a escolha mais simples.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um objeto filho ganha ao ter um Parent definido?',
          choices: [
            { id: 'a', text: 'Herda os eventos e variáveis do objeto pai' },
            { id: 'b', text: 'Vira automaticamente uma cópia idêntica do pai, sem poder mudar nada' },
            { id: 'c', text: 'Perde todos os próprios eventos' },
            { id: 'd', text: 'Não herda nada, Parent é só decorativo' }
          ],
          answer: 'a',
          explanation: 'O filho herda o comportamento definido no objeto pai.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que acontece quando um objeto filho define seu próprio código no mesmo evento que o pai?',
          choices: [
            { id: 'a', text: 'O código do filho substitui o do pai nesse evento, a menos que chame event_inherited()' },
            { id: 'b', text: 'Os dois códigos rodam sempre juntos automaticamente' },
            { id: 'c', text: 'Gera um erro de currículo' },
            { id: 'd', text: 'O código do pai sempre roda primeiro sem controle nenhum' }
          ],
          answer: 'a',
          explanation: 'Por padrão, o evento do filho substitui o do pai — event_inherited() é o jeito explícito de rodar os dois.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que event_inherited() faz quando chamado dentro do Step de um objeto filho?',
          choices: [
            { id: 'a', text: 'Executa o código do evento Step do objeto pai' },
            { id: 'b', text: 'Cria um novo objeto pai' },
            { id: 'c', text: 'Destrói o objeto pai' },
            { id: 'd', text: 'Troca o sprite do filho pelo do pai' }
          ],
          answer: 'a',
          explanation: 'event_inherited() roda o código do mesmo evento definido no objeto pai.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que executa o código do mesmo evento do objeto pai:',
          code: '___()',
          accept: ['event_inherited'],
          explanation: 'event_inherited() roda a lógica do pai, complementando o código do filho.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quando vale mais a pena usar herança entre dois objetos?',
          choices: [
            { id: 'a', text: 'Quando eles compartilham uma parte real de comportamento (ex: vida, dano)' },
            { id: 'b', text: 'Sempre, mesmo para objetos completamente diferentes' },
            { id: 'c', text: 'Nunca, herança não existe em GML' },
            { id: 'd', text: 'Só quando os dois têm o mesmo sprite' }
          ],
          answer: 'a',
          explanation: 'Herança compensa quando há comportamento genuinamente compartilhado.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'No editor de objetos, onde definimos que um objeto tem outro como Parent?',
          choices: [
            { id: 'a', text: 'No campo Parent das propriedades do objeto' },
            { id: 'b', text: 'Dentro do evento Draw' },
            { id: 'c', text: 'Numa sala (room)' },
            { id: 'd', text: 'Não é possível, isso não existe' }
          ],
          answer: 'a',
          explanation: 'Parent é uma propriedade configurável do próprio objeto no editor.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Vários objetos de inimigo compartilham a mesma lógica de "tomar dano e verificar se morreu". Qual a vantagem de colocar essa lógica num objeto pai comum?',
          choices: [
            { id: 'a', text: 'Evita repetir o mesmo código em cada objeto de inimigo' },
            { id: 'b', text: 'Faz o jogo rodar em outra engine' },
            { id: 'c', text: 'Impede que os inimigos tenham sprites diferentes' },
            { id: 'd', text: 'Não traz vantagem nenhuma' }
          ],
          answer: 'a',
          explanation: 'A lógica compartilhada fica centralizada no pai, evitando duplicação.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a propriedade do objeto usada para definir de qual objeto ele herda comportamento:',
          code: '// nas propriedades do objeto filho\n___: obj_inimigo_base',
          accept: ['Parent', 'parent'],
          explanation: 'Parent é o campo que define de qual objeto o comportamento é herdado.'
        }
      ]
    },
    {
      id: 'gmi-07-alarms',
      title: 'Alarms (temporizadores)',
      goal: 'Fazer algo acontecer depois de um tempo determinado, sem travar o jogo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema: esperar um tempo antes de agir',
            body: 'Muitas mecânicas precisam esperar um tempo antes de acontecer — um inimigo que atira a cada 2 segundos, um item que reaparece depois de um tempo. Um alarm é um temporizador embutido do GameMaker para isso.'
          },
          {
            title: 'Definindo um alarm',
            body: 'Cada instância tem até 12 alarms (alarm[0] até alarm[11]). Atribuir um número de frames a um deles inicia a contagem regressiva.',
            code: 'alarm[0] = room_speed * 2  // dispara em 2 segundos'
          },
          {
            title: 'O evento Alarm',
            body: 'Quando um alarm chega a 0, o evento Alarm correspondente (Alarm 0, Alarm 1...) roda automaticamente uma única vez — é lá que colocamos o que deve acontecer.'
          },
          {
            title: 'room_speed',
            body: 'room_speed é quantos frames rodam por segundo na sala atual — multiplicar por esse valor é como converter "segundos" para "frames" ao definir um alarm.',
            code: 'alarm[0] = room_speed * 3  // 3 segundos'
          },
          {
            title: 'Repetindo um alarm',
            body: 'Um alarm dispara só uma vez; para repetir (por exemplo, atirar a cada 2 segundos continuamente), o próprio evento Alarm reatribui o mesmo alarm de novo no final.',
            code: '// evento Alarm 0\ninstance_create_layer(x, y, "Instances", obj_bala)\nalarm[0] = room_speed * 2  // agenda o próximo disparo'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve um alarm em GML?',
          choices: [
            { id: 'a', text: 'Fazer algo acontecer depois de um tempo determinado' },
            { id: 'b', text: 'Desenhar um sprite na tela' },
            { id: 'c', text: 'Detectar colisões' },
            { id: 'd', text: 'Ler o teclado' }
          ],
          answer: 'a',
          explanation: 'Alarms são temporizadores embutidos, usados para atrasar ou repetir ações.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que acontece quando alarm[0] chega a 0?',
          choices: [
            { id: 'a', text: 'O evento Alarm 0 daquela instância roda automaticamente' },
            { id: 'b', text: 'A instância é destruída automaticamente' },
            { id: 'c', text: 'O jogo é pausado' },
            { id: 'd', text: 'Nada acontece, é preciso checar manualmente no Step' }
          ],
          answer: 'a',
          explanation: 'Chegar a 0 dispara o evento Alarm correspondente automaticamente.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que room_speed representa?',
          choices: [
            { id: 'a', text: 'Quantos frames rodam por segundo na sala atual' },
            { id: 'b', text: 'O tamanho da sala em pixels' },
            { id: 'c', text: 'A velocidade de uma instância específica' },
            { id: 'd', text: 'O volume do som da sala' }
          ],
          answer: 'a',
          explanation: 'room_speed é a taxa de frames por segundo, usada para converter tempo em frames.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a variável usada para definir um temporizador que dispara em 2 segundos:',
          code: '___[0] = room_speed * 2',
          accept: ['alarm'],
          explanation: 'alarm[n] guarda a contagem regressiva, em frames, até o evento Alarm n disparar.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quantas vezes um alarm dispara depois de ser definido uma vez?',
          choices: [
            { id: 'a', text: 'Uma única vez, a menos que seja reatribuído de novo' },
            { id: 'b', text: 'Repete para sempre automaticamente' },
            { id: 'c', text: 'Nunca dispara sozinho' },
            { id: 'd', text: 'Depende do sprite da instância' }
          ],
          answer: 'a',
          explanation: 'Um alarm dispara uma vez; repetir exige reatribuir o valor dentro do próprio evento Alarm.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como fazemos um inimigo atirar a cada 2 segundos continuamente, usando alarm?',
          choices: [
            { id: 'a', text: 'No evento Alarm, criar a bala e reatribuir alarm[0] = room_speed * 2 de novo' },
            { id: 'b', text: 'Definindo alarm[0] uma única vez no Create, sem mais nada' },
            { id: 'c', text: 'Alarms não podem se repetir, é preciso usar o Step' },
            { id: 'd', text: 'Chamando instance_destroy() dentro do Alarm' }
          ],
          answer: 'a',
          explanation: 'Reatribuir o alarm dentro do próprio evento Alarm cria um ciclo repetido.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quantos alarms uma instância pode ter, no máximo?',
          choices: [
            { id: 'a', text: '12 (de alarm[0] a alarm[11])' },
            { id: 'b', text: 'Só 1' },
            { id: 'c', text: 'Ilimitados' },
            { id: 'd', text: '4' }
          ],
          answer: 'a',
          explanation: 'GameMaker disponibiliza 12 alarms independentes por instância.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variável que converte "2 segundos" em frames ao definir um alarm:',
          code: 'alarm[0] = ___ * 2',
          accept: ['room_speed'],
          explanation: 'room_speed é quantos frames equivalem a 1 segundo na sala atual.'
        }
      ]
    },
    {
      id: 'gmi-14-delta-time',
      title: 'delta_time: movimento independente de quadros',
      goal: 'Entender por que confiar só na taxa de quadros é arriscado, e corrigir isso com delta_time.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema do FPS variável',
            body: 'Até agora, todo movimento assumiu que o jogo sempre roda exatamente na mesma taxa de quadros (room_speed) — mas isso nem sempre é verdade: telas diferentes, quedas de desempenho ou hardware mais fraco podem mudar a taxa real de quadros, fazendo o jogo parecer mais rápido ou mais lento dependendo da máquina.'
          },
          {
            title: 'delta_time',
            body: 'delta_time é uma variável embutida que guarda, em microssegundos, quanto tempo o ÚLTIMO quadro levou para processar de verdade — multiplicar o movimento por esse valor compensa as variações reais de tempo entre quadros.',
            code: 'x += 4 * (delta_time / 1000000)  // ajusta ao tempo real do último quadro'
          },
          {
            title: 'Convertendo microssegundos para segundos',
            body: '1 segundo equivale a 1.000.000 de microssegundos — por isso dividimos delta_time por 1000000 quando queremos trabalhar com "quanto tempo passou", em segundos, desde o último quadro.'
          },
          {
            title: 'Quando isso realmente importa',
            body: 'Para um protótipo simples, rodando sempre na mesma taxa de quadros, o movimento direto (sem delta_time) funciona bem. delta_time importa de verdade quando o jogo pode rodar em taxas de quadros diferentes, ou quando o desempenho cai e você não quer que a velocidade do jogo mude junto.'
          },
          {
            title: 'Aplicando também a speed',
            body: 'A mesma ideia vale para speed: multiplicar por um fator baseado em delta_time mantém a MESMA velocidade real, não importa a taxa de quadros da máquina.',
            code: 'speed = 4 * (delta_time / 1000000) * 60  // equivalente a 4 numa taxa de 60 fps'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que delta_time representa?',
          choices: [
            { id: 'a', text: 'Quanto tempo (em microssegundos) o último quadro levou para processar' },
            { id: 'b', text: 'A posição x atual da instância' },
            { id: 'c', text: 'O volume do som' },
            { id: 'd', text: 'O tamanho da sala' }
          ],
          answer: 'a',
          explanation: 'delta_time mede, em microssegundos, a duração real do último quadro.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que confiar só em "pixels por quadro" (sem delta_time) pode ser um problema?',
          choices: [
            { id: 'a', text: 'Porque a velocidade real do jogo muda conforme a taxa de quadros varia entre máquinas' },
            { id: 'b', text: 'Porque GameMaker não permite mexer em x e y diretamente' },
            { id: 'c', text: 'Não é um problema, é sempre a melhor abordagem' },
            { id: 'd', text: 'Porque isso trava o jogo imediatamente' }
          ],
          answer: 'a',
          explanation: 'Sem delta_time, quadros mais lentos ou mais rápidos mudam a velocidade percebida do jogo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Quantos microssegundos equivalem a 1 segundo?',
          choices: [
            { id: 'a', text: '1.000.000' },
            { id: 'b', text: '1.000' },
            { id: 'c', text: '100' },
            { id: 'd', text: '60' }
          ],
          answer: 'a',
          explanation: '1 segundo tem 1.000.000 de microssegundos.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a variável que guarda a duração real do último quadro, em microssegundos:',
          code: 'x += 4 * (___ / 1000000)',
          accept: ['delta_time'],
          explanation: 'delta_time guarda quanto tempo o último quadro realmente levou.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quando o uso de delta_time importa mais?',
          choices: [
            { id: 'a', text: 'Quando o jogo pode rodar em taxas de quadros diferentes ou sofrer quedas de desempenho' },
            { id: 'b', text: 'Só quando o jogo não tem nenhum movimento' },
            { id: 'c', text: 'Nunca, é só um detalhe cosmético' },
            { id: 'd', text: 'Só dentro do evento Draw' }
          ],
          answer: 'a',
          explanation: 'delta_time evita que variações de desempenho mudem a velocidade percebida do jogo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que a divisão delta_time / 1000000 faz?',
          choices: [
            { id: 'a', text: 'Converte o valor de microssegundos para segundos' },
            { id: 'b', text: 'Converte pixels para metros' },
            { id: 'c', text: 'Zera a variável delta_time' },
            { id: 'd', text: 'Converte segundos para frames' }
          ],
          answer: 'a',
          explanation: 'Dividir por 1.000.000 transforma microssegundos em segundos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Movimento baseado só em room_speed (sem delta_time) assume o quê?',
          choices: [
            { id: 'a', text: 'Que o jogo sempre roda exatamente na mesma taxa de quadros' },
            { id: 'b', text: 'Que o jogador nunca vai jogar em outra máquina' },
            { id: 'c', text: 'Que a sala nunca muda de tamanho' },
            { id: 'd', text: 'Nada, room_speed já resolve isso sozinho' }
          ],
          answer: 'a',
          explanation: 'A abordagem baseada só em room_speed pressupõe uma taxa de quadros constante.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o número usado para converter delta_time (microssegundos) em segundos:',
          code: 'var segundos = delta_time / ___',
          accept: ['1000000'],
          explanation: '1.000.000 microssegundos equivalem a 1 segundo.'
        }
      ]
    },
    {
      id: 'gmi-08-maquina-estados',
      title: 'Máquinas de estado simples',
      goal: 'Organizar o comportamento de um objeto usando estados nomeados e switch.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema: muitos ifs encadeados',
            body: 'Um inimigo pode "patrulhar", "perseguir" ou "atacar" — controlar tudo isso só com vários if separados fica confuso rápido. Uma máquina de estados organiza esse comportamento por ESTADO nomeado.'
          },
          {
            title: 'Uma variável de estado',
            body: 'A ideia central: uma variável guarda o estado atual, e o Step decide o que fazer de acordo com ela.',
            code: '// Create\nestado = "patrulhando"'
          },
          {
            title: 'switch: decidindo por vários casos',
            body: 'switch(variável) { case valor: ...; break } compara a variável com vários valores possíveis, executando o bloco do case que bater — mais organizado que vários if/else if encadeados para muitos casos.',
            code: 'switch (estado) {\n    case "patrulhando":\n        x += 1\n        break\n    case "perseguindo":\n        x += 3\n        break\n}'
          },
          {
            title: 'O break dentro do switch',
            body: 'break encerra o case atual, impedindo que a execução "vaze" para o próximo case — esquecer o break é um erro comum e faz mais de um bloco rodar sem querer.'
          },
          {
            title: 'Trocando de estado',
            body: 'A transição entre estados é só atribuir um novo valor à variável de estado, geralmente ao detectar uma condição (por exemplo, ver o jogador de perto).',
            code: 'if (distancia < 100) {\n    estado = "perseguindo"\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual o problema de controlar muitos comportamentos só com vários ifs separados?',
          choices: [
            { id: 'a', text: 'Fica confuso e difícil de manter conforme o número de comportamentos cresce' },
            { id: 'b', text: 'GameMaker não permite mais de um if por Step' },
            { id: 'c', text: 'if não funciona dentro de objetos' },
            { id: 'd', text: 'Não há problema nenhum' }
          ],
          answer: 'a',
          explanation: 'Muitos ifs soltos tendem a virar um código difícil de acompanhar.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a ideia central de uma máquina de estados simples?',
          choices: [
            { id: 'a', text: 'Uma variável guarda o estado atual, e o código decide o que fazer de acordo com ela' },
            { id: 'b', text: 'Criar um objeto novo para cada comportamento possível' },
            { id: 'c', text: 'Usar apenas alarms para tudo' },
            { id: 'd', text: 'Não usar nenhuma variável' }
          ],
          answer: 'a',
          explanation: 'A variável de estado é o núcleo de uma máquina de estados simples.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que switch(estado) { case "perseguindo": ...; break } faz?',
          choices: [
            { id: 'a', text: 'Executa o bloco daquele case só quando estado for igual a "perseguindo"' },
            { id: 'b', text: 'Executa todos os blocos de todos os cases sempre' },
            { id: 'c', text: 'Cria uma nova variável chamada estado' },
            { id: 'd', text: 'Só funciona com números, nunca com texto' }
          ],
          answer: 'a',
          explanation: 'switch compara o valor da variável com cada case, rodando o que bater.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que encerra um case dentro de um switch, evitando que a execução vaze para o próximo:',
          code: 'case "patrulhando":\n    x += 1\n    ___',
          accept: ['break'],
          explanation: 'break impede que a execução continue para o case seguinte.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece se esquecermos o break dentro de um case do switch?',
          choices: [
            { id: 'a', text: 'A execução continua e roda o case seguinte também, o que geralmente não é o esperado' },
            { id: 'b', text: 'Nada muda, break é só decorativo' },
            { id: 'c', text: 'O jogo trava imediatamente' },
            { id: 'd', text: 'O switch para de funcionar' }
          ],
          answer: 'a',
          explanation: 'Sem break, a execução "vaza" para os cases seguintes — um erro comum.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como um objeto normalmente TROCA de estado, numa máquina de estados simples?',
          choices: [
            { id: 'a', text: 'Atribuindo um novo valor à variável de estado quando alguma condição é detectada' },
            { id: 'b', text: 'Reiniciando a sala inteira' },
            { id: 'c', text: 'Trocando de objeto pai' },
            { id: 'd', text: 'Estados nunca podem mudar depois do Create' }
          ],
          answer: 'a',
          explanation: 'Trocar de estado é simplesmente reatribuir a variável que guarda o estado atual.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que usar switch em vez de vários if/else if quando há muitos casos possíveis?',
          choices: [
            { id: 'a', text: 'Fica mais organizado e legível para comparar uma mesma variável com muitos valores' },
            { id: 'b', text: 'switch é a única forma de comparar strings em GML' },
            { id: 'c', text: 'if/else if não existe em GML' },
            { id: 'd', text: 'Não há diferença nenhuma de legibilidade' }
          ],
          answer: 'a',
          explanation: 'switch organiza melhor a comparação de uma variável contra vários valores possíveis.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a estrutura usada para comparar uma variável de estado com vários valores possíveis, de forma organizada:',
          code: '___ (estado) {\n    case "patrulhando":\n        x += 1\n        break\n}',
          accept: ['switch'],
          explanation: 'switch compara a variável indicada com cada case, executando o que bater.'
        }
      ]
    },
    {
      id: 'gmi-15-paths',
      title: 'Paths (trajetórias predefinidas)',
      goal: 'Definir rotas fixas para movimentar instâncias automaticamente, ideal para patrulhas.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é um Path',
            body: 'Path é um recurso próprio do GameMaker: uma sequência de pontos (uma rota) desenhada no editor, que uma instância pode seguir automaticamente, sem que você precise calcular x/y passo a passo.'
          },
          {
            title: 'path_start',
            body: 'path_start(caminho, velocidade, endAction, absolute) faz a instância começar a seguir o path indicado, numa velocidade escolhida. endAction diz o que fazer quando a instância chega ao final da rota.',
            code: 'path_start(caminho_patrulha, 2, path_action_restart, true)'
          },
          {
            title: 'Ações ao final do path',
            body: 'path_action_stop para a instância no final; path_action_restart volta ao início do path, repetindo o percurso (efeito de patrulha em loop); path_action_reverse faz a instância percorrer o path de trás para frente.'
          },
          {
            title: 'path_position',
            body: 'path_position guarda o progresso atual da instância ao longo do path, um valor entre 0 (início) e 1 (fim) — pode ser lido para saber onde a instância está, ou alterado para "teleportar" para outro ponto da rota.'
          },
          {
            title: 'Combinando com a máquina de estados',
            body: 'Lembra do estado "patrulhando" da lição anterior, movendo com x += 1? Com um Path, basta chamar path_start uma vez ao entrar nesse estado — o GameMaker cuida sozinho de mover a instância ao longo de toda a rota.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um Path no GameMaker?',
          choices: [
            { id: 'a', text: 'Um recurso que define uma trajetória (sequência de pontos) que uma instância pode seguir automaticamente' },
            { id: 'b', text: 'Um tipo de sprite animado' },
            { id: 'c', text: 'Um efeito sonoro' },
            { id: 'd', text: 'Uma variável de instância' }
          ],
          answer: 'a',
          explanation: 'Path é um recurso próprio do editor, com uma rota de pontos pronta para ser seguida.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que path_start faz?',
          choices: [
            { id: 'a', text: 'Faz a instância começar a seguir o path indicado' },
            { id: 'b', text: 'Cria um novo path do zero' },
            { id: 'c', text: 'Destrói a instância atual' },
            { id: 'd', text: 'Move a câmera' }
          ],
          answer: 'a',
          explanation: 'path_start inicia o movimento da instância ao longo do path escolhido.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que path_action_restart faz quando a instância chega ao final do path?',
          choices: [
            { id: 'a', text: 'Volta a instância para o início do path, repetindo o percurso' },
            { id: 'b', text: 'Para a instância definitivamente' },
            { id: 'c', text: 'Destrói o path' },
            { id: 'd', text: 'Inverte a velocidade para negativa sem se mover' }
          ],
          answer: 'a',
          explanation: 'path_action_restart cria um efeito de repetição, voltando ao ponto inicial do path.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que faz uma instância começar a seguir um path:',
          code: '___(caminho_patrulha, 2, path_action_restart, true)',
          accept: ['path_start'],
          explanation: 'path_start(caminho, velocidade, endAction, absolute) inicia o percurso.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que path_position representa?',
          choices: [
            { id: 'a', text: 'O progresso atual da instância ao longo do path, de 0 a 1' },
            { id: 'b', text: 'A velocidade da instância' },
            { id: 'c', text: 'O nome do path' },
            { id: 'd', text: 'A posição da câmera' }
          ],
          answer: 'a',
          explanation: 'path_position vai de 0 (início) a 1 (fim do path).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a vantagem de usar um Path para uma patrulha, em vez de mover x/y manualmente?',
          choices: [
            { id: 'a', text: 'O GameMaker calcula a trajetória automaticamente, sem programar cada passo manualmente' },
            { id: 'b', text: 'Paths só funcionam para o jogador, nunca para inimigos' },
            { id: 'c', text: 'Não há vantagem real, dá exatamente no mesmo trabalho' },
            { id: 'd', text: 'Paths substituem completamente sprites e objetos' }
          ],
          answer: 'a',
          explanation: 'O Path assume o cálculo da rota, liberando o código de fazer isso manualmente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Ao combinar Path com uma máquina de estados, o que costuma acontecer ao entrar no estado "patrulhando"?',
          choices: [
            { id: 'a', text: 'path_start é chamado uma vez, deixando o Path controlar o movimento' },
            { id: 'b', text: 'O path é recriado a cada Step' },
            { id: 'c', text: 'A máquina de estados para de funcionar' },
            { id: 'd', text: 'A instância é destruída e recriada' }
          ],
          answer: 'a',
          explanation: 'Path_start uma única vez, ao entrar no estado, é suficiente — o Path cuida do resto.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a constante que faz a instância voltar ao início do path ao terminar, repetindo o percurso:',
          code: 'path_start(caminho, 2, ___, true)',
          accept: ['path_action_restart'],
          explanation: 'path_action_restart reinicia o path do começo, criando um efeito de loop.'
        }
      ]
    },
    {
      id: 'gmi-09-camera',
      title: 'Câmera e viewport',
      goal: 'Fazer a câmera seguir o jogador e entender os limites da sala.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que uma câmera?',
            body: 'Salas costumam ser maiores que a tela — a câmera (view) define qual parte da sala é mostrada, e pode se mover para seguir o jogador conforme ele anda.'
          },
          {
            title: 'camera_get_view_target / view_camera',
            body: 'view_camera[0] é a câmera padrão da sala; funções como camera_set_view_pos(camera, x, y) movem essa câmera para uma posição específica.',
            code: 'camera_set_view_pos(view_camera[0], jogador.x - 400, jogador.y - 300)'
          },
          {
            title: 'Seguindo o jogador no Step',
            body: 'O padrão mais simples é, a cada Step do objeto controlador (ou do próprio jogador), reposicionar a câmera centrada na posição atual do jogador.',
            code: 'camera_set_view_pos(view_camera[0], x - 400, y - 300)'
          },
          {
            title: 'room_width e room_height',
            body: 'room_width e room_height guardam o tamanho total da sala atual — comparando com eles, é possível impedir que a câmera mostre uma área fora dos limites da sala (além da borda).'
          },
          {
            title: 'Por que não deixar a câmera sair da sala',
            body: 'Sem esse limite, ao chegar perto das bordas o jogador veria uma área vazia fora da sala — travar a câmera dentro de room_width/room_height evita esse problema visual.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve a câmera (view) de uma sala?',
          choices: [
            { id: 'a', text: 'Define qual parte da sala é mostrada na tela, podendo se mover' },
            { id: 'b', text: 'Toca a música da sala' },
            { id: 'c', text: 'Cria novas instâncias automaticamente' },
            { id: 'd', text: 'Detecta colisões do jogador' }
          ],
          answer: 'a',
          explanation: 'A câmera controla a "janela" da sala que é exibida ao jogador.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que camera_set_view_pos(view_camera[0], x, y) faz?',
          choices: [
            { id: 'a', text: 'Move a câmera indicada para a posição (x, y)' },
            { id: 'b', text: 'Move o jogador para (x, y)' },
            { id: 'c', text: 'Cria uma nova sala' },
            { id: 'd', text: 'Redimensiona a janela do jogo' }
          ],
          answer: 'a',
          explanation: 'camera_set_view_pos reposiciona a câmera indicada.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que room_width e room_height representam?',
          choices: [
            { id: 'a', text: 'O tamanho total (largura e altura) da sala atual' },
            { id: 'b', text: 'O tamanho da tela do jogador' },
            { id: 'c', text: 'O tamanho de um sprite específico' },
            { id: 'd', text: 'A velocidade da câmera' }
          ],
          answer: 'a',
          explanation: 'room_width/room_height guardam as dimensões totais da sala atual.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função usada para mover a câmera para uma posição específica:',
          code: '___(view_camera[0], x - 400, y - 300)',
          accept: ['camera_set_view_pos'],
          explanation: 'camera_set_view_pos(camera, x, y) reposiciona a câmera indicada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que costumamos travar a câmera para não passar de room_width/room_height?',
          choices: [
            { id: 'a', text: 'Para evitar mostrar uma área vazia fora dos limites da sala' },
            { id: 'b', text: 'Porque senão o jogo trava' },
            { id: 'c', text: 'Porque a câmera não pode se mover sem isso' },
            { id: 'd', text: 'Não há motivo real para isso' }
          ],
          answer: 'a',
          explanation: 'Sem o limite, a câmera mostraria área fora da sala, sem conteúdo desenhado.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde normalmente colocamos a lógica de "seguir o jogador" com a câmera?',
          choices: [
            { id: 'a', text: 'No Step de um objeto (jogador ou controlador), reposicionando a câmera a cada frame' },
            { id: 'b', text: 'No evento Create, rodando uma única vez' },
            { id: 'c', text: 'Dentro de um sprite' },
            { id: 'd', text: 'Não é possível seguir o jogador com a câmera' }
          ],
          answer: 'a',
          explanation: 'Reposicionar no Step garante que a câmera acompanhe o jogador continuamente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'view_camera[0] representa o quê?',
          choices: [
            { id: 'a', text: 'A câmera padrão (primeira) da sala atual' },
            { id: 'b', text: 'O primeiro inimigo criado' },
            { id: 'c', text: 'O primeiro sprite carregado' },
            { id: 'd', text: 'A posição do mouse' }
          ],
          answer: 'a',
          explanation: 'view_camera[0] é a referência para a câmera padrão daquela sala.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variável que guarda a largura total da sala atual:',
          code: 'if (x > ___) {\n    x = room_width\n}',
          accept: ['room_width'],
          explanation: 'room_width guarda a largura total da sala atual.'
        }
      ]
    },
    {
      id: 'gmi-16-particulas',
      title: 'Sistemas de partículas básicos',
      goal: 'Criar efeitos visuais simples — fumaça, explosões, rastros — com o sistema de partículas.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é um sistema de partículas',
            body: 'Um sistema de partículas cria dezenas de pequenos elementos visuais automaticamente — fumaça, faíscas, explosões, rastros — sem que você precise criar e destruir manualmente um objeto para cada um deles.'
          },
          {
            title: 'part_system_create',
            body: 'part_system_create() cria um novo sistema de partículas — um "container" que vai gerenciar todas as partículas criadas dentro dele.',
            code: 'global.sistema = part_system_create()'
          },
          {
            title: 'part_type_create e configurando o tipo',
            body: 'part_type_create() cria um TIPO de partícula, definindo como ela se parece: funções como part_type_life (tempo de vida) e part_type_size (tamanho) configuram esse tipo antes de usá-lo.',
            code: 'tipo_fumaca = part_type_create()\npart_type_life(tipo_fumaca, 30, 60)\npart_type_size(tipo_fumaca, 0.5, 1, 0, 0)'
          },
          {
            title: 'part_particles_create',
            body: 'part_particles_create(sistema, x, y, tipo, quantidade) efetivamente cria as partículas daquele tipo, numa posição específica, dentro do sistema indicado.',
            code: 'part_particles_create(global.sistema, x, y, tipo_fumaca, 5)'
          },
          {
            title: 'Por que partículas em vez de instâncias comuns',
            body: 'Criar centenas de instâncias normais só para um efeito de fumaça seria pesado e desnecessário — o sistema de partículas foi feito exatamente para lidar com grandes quantidades de efeitos visuais de vida curta, de forma muito mais leve.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve um sistema de partículas?',
          choices: [
            { id: 'a', text: 'Criar dezenas de pequenos elementos visuais automaticamente, como fumaça ou explosões' },
            { id: 'b', text: 'Detectar colisões entre objetos' },
            { id: 'c', text: 'Ler a entrada do teclado' },
            { id: 'd', text: 'Salvar o progresso do jogador' }
          ],
          answer: 'a',
          explanation: 'Sistemas de partículas existem justamente para efeitos visuais compostos por muitos elementos pequenos.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que part_system_create faz?',
          choices: [
            { id: 'a', text: 'Cria um novo sistema de partículas, que gerencia as partículas criadas nele' },
            { id: 'b', text: 'Cria uma nova instância de objeto' },
            { id: 'c', text: 'Cria um novo path' },
            { id: 'd', text: 'Toca um som' }
          ],
          answer: 'a',
          explanation: 'part_system_create() cria o container que gerencia as partículas.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que part_type_create representa?',
          choices: [
            { id: 'a', text: 'Um tipo de partícula, definindo aparência, tamanho e tempo de vida' },
            { id: 'b', text: 'Um novo sistema de partículas' },
            { id: 'c', text: 'A posição onde as partículas vão nascer' },
            { id: 'd', text: 'Um evento do objeto' }
          ],
          answer: 'a',
          explanation: 'part_type_create define as características de um tipo de partícula, configurado depois.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que cria um novo sistema de partículas:',
          code: 'global.sistema = ___()',
          accept: ['part_system_create'],
          explanation: 'part_system_create() cria o sistema que vai gerenciar as partículas.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que part_particles_create faz?',
          choices: [
            { id: 'a', text: 'Cria partículas de um tipo específico numa posição, dentro de um sistema' },
            { id: 'b', text: 'Cria um novo tipo de partícula do zero' },
            { id: 'c', text: 'Destrói todas as partículas existentes' },
            { id: 'd', text: 'Move a câmera até a posição informada' }
          ],
          answer: 'a',
          explanation: 'part_particles_create efetivamente gera as partículas visíveis na tela.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que usar partículas em vez de instâncias comuns para um efeito como fumaça?',
          choices: [
            { id: 'a', text: 'Partículas são muito mais leves e otimizadas para grandes quantidades de efeitos visuais de curta duração' },
            { id: 'b', text: 'Instâncias comuns não podem ter sprite' },
            { id: 'c', text: 'Não há diferença real de desempenho' },
            { id: 'd', text: 'Partículas substituem objetos e sprites por completo' }
          ],
          answer: 'a',
          explanation: 'O sistema de partículas foi desenhado para lidar com muitos elementos visuais de forma leve.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'part_type_life(tipo_fumaca, 30, 60) configura o quê?',
          choices: [
            { id: 'a', text: 'Por quantos quadros (tempo de vida) cada partícula desse tipo dura, entre um mínimo e um máximo' },
            { id: 'b', text: 'A posição inicial da partícula' },
            { id: 'c', text: 'A cor da partícula' },
            { id: 'd', text: 'O som que a partícula reproduz' }
          ],
          answer: 'a',
          explanation: 'part_type_life define o tempo de vida (em quadros) das partículas daquele tipo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que efetivamente cria as partículas na tela:',
          code: '___(global.sistema, x, y, tipo_fumaca, 5)',
          accept: ['part_particles_create'],
          explanation: 'part_particles_create(sistema, x, y, tipo, quantidade) cria as partículas de fato.'
        }
      ]
    },
    {
      id: 'gmi-10-persistencia',
      title: 'Persistência e salvar/carregar',
      goal: 'Manter dados entre salas e transformar dados do jogo em texto para salvar.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema: variáveis somem ao trocar de sala',
            body: 'Por padrão, ao trocar de sala, as instâncias da sala anterior são destruídas e suas variáveis somem junto — mas às vezes queremos manter dados do jogador entre salas (vida, itens, pontuação).'
          },
          {
            title: 'A flag persistent',
            body: 'Um objeto marcado como persistent (nas propriedades do objeto) não é destruído ao trocar de sala — suas variáveis continuam existindo normalmente na sala seguinte.'
          },
          {
            title: 'Representando dados como struct',
            body: 'Para SALVAR o progresso de verdade (não só entre salas, mas entre sessões de jogo), primeiro organizamos os dados importantes num struct.',
            code: 'var save_data = { vida: vida, pontos: pontos, fase: fase_atual }'
          },
          {
            title: 'json_stringify e json_parse',
            body: 'json_stringify(struct) transforma um struct numa string de texto (formato JSON); json_parse(string) faz o caminho inverso, recriando o struct a partir do texto — é essa string de texto que pode ser gravada num arquivo.',
            code: 'var texto = json_stringify(save_data)\nvar dados_recuperados = json_parse(texto)'
          },
          {
            title: 'De onde vem o arquivo de save',
            body: 'Gravar essa string de texto num arquivo de verdade usa funções de arquivo do GameMaker (fora do escopo desta lição) — o importante aqui é entender que json_stringify/json_parse são a ponte entre os DADOS do jogo (struct) e um TEXTO que pode ser guardado ou transmitido.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que acontece com as instâncias de uma sala, por padrão, quando trocamos de sala?',
          choices: [
            { id: 'a', text: 'São destruídas, e suas variáveis somem junto' },
            { id: 'b', text: 'Continuam existindo normalmente na nova sala' },
            { id: 'c', text: 'Viram persistent automaticamente' },
            { id: 'd', text: 'São pausadas até a sala ser revisitada' }
          ],
          answer: 'a',
          explanation: 'Por padrão, trocar de sala destrói as instâncias da sala anterior.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a flag persistent faz num objeto?',
          choices: [
            { id: 'a', text: 'Impede que suas instâncias sejam destruídas ao trocar de sala' },
            { id: 'b', text: 'Faz o objeto ficar invisível' },
            { id: 'c', text: 'Impede que o objeto tenha colisões' },
            { id: 'd', text: 'Salva o jogo automaticamente em disco' }
          ],
          answer: 'a',
          explanation: 'persistent mantém as instâncias vivas entre trocas de sala.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que json_stringify(struct) devolve?',
          choices: [
            { id: 'a', text: 'Uma string de texto representando os dados do struct' },
            { id: 'b', text: 'Um novo struct vazio' },
            { id: 'c', text: 'Um número' },
            { id: 'd', text: 'Um array' }
          ],
          answer: 'a',
          explanation: 'json_stringify converte um struct numa string de texto no formato JSON.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que transforma um struct numa string de texto:',
          code: 'var texto = ___(save_data)',
          accept: ['json_stringify'],
          explanation: 'json_stringify(struct) gera a representação em texto dos dados.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que json_parse(texto) faz?',
          choices: [
            { id: 'a', text: 'Recria um struct a partir de uma string de texto no formato JSON' },
            { id: 'b', text: 'Apaga o texto informado' },
            { id: 'c', text: 'Transforma um struct em texto (o caminho inverso)' },
            { id: 'd', text: 'Só funciona com números' }
          ],
          answer: 'a',
          explanation: 'json_parse faz o caminho inverso de json_stringify, recriando o struct.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que organizamos os dados importantes num struct antes de salvar o progresso?',
          choices: [
            { id: 'a', text: 'Porque json_stringify/json_parse trabalham com structs, facilitando transformar em texto e voltar' },
            { id: 'b', text: 'Porque structs são o único tipo de dado que existe em GML' },
            { id: 'c', text: 'Não há motivo, poderia ser qualquer outro tipo' },
            { id: 'd', text: 'Porque structs são sempre persistent automaticamente' }
          ],
          answer: 'a',
          explanation: 'Structs se encaixam naturalmente no formato que json_stringify/json_parse manipulam.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Persistent resolve manter dados entre SALAS. O que ainda falta para salvar o progresso entre SESSÕES de jogo (fechar e abrir de novo)?',
          choices: [
            { id: 'a', text: 'Gravar os dados (por exemplo, via json_stringify) num arquivo de verdade, usando funções de arquivo' },
            { id: 'b', text: 'Nada, persistent já resolve tudo sozinho' },
            { id: 'c', text: 'Marcar a sala inteira como persistent' },
            { id: 'd', text: 'Usar apenas alarms' }
          ],
          answer: 'a',
          explanation: 'persistent não sobrevive a fechar o jogo — isso exige gravar em arquivo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que recria um struct a partir de uma string de texto JSON:',
          code: 'var dados = ___(texto)',
          accept: ['json_parse'],
          explanation: 'json_parse(string) recria o struct original a partir do texto.'
        }
      ]
    }
  ]
};
