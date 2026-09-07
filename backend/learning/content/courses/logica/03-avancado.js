// Módulo "Estruturas Avançadas e Eficiência" (avançado) — 9 lições, 8 questões cada (3 múltipla
// escolha + 1 lacuna, duas vezes por lição). Independente de linguagem: pseudocódigo genérico, não
// Python. Ver ../../index.js para o formato e a validação de boot, e 02-estruturas.js para os
// pré-requisitos (vetores, funções, recursividade, busca/ordenação) que este módulo assume.
// Os ids das lições não seguem mais a numeração 18-23 em sequência estrita (grafos/tabelas-hash/
// programação-dinâmica foram inseridos depois, entre lições já numeradas) — a ORDEM real é a
// posição no array `lessons` abaixo, não o número no id (só um identificador estável).
module.exports = {
  id: 'avancado-logica',
  levelKey: 'advanced',
  order: 3,
  title: 'Estruturas Avançadas e Eficiência',
  subtitle: 'Complexidade, estruturas de dados, grafos, tabelas hash e algoritmos eficientes',
  accent: '#c084fc',
  lessons: [
    {
      id: 'logica-18-complexidade',
      title: 'Complexidade de algoritmos',
      goal: 'Entender a notação O(1), O(n), O(log n) e O(n²) para comparar algoritmos com precisão.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que medir a eficiência de um algoritmo?',
            body: 'Já vimos que a busca sequencial pode precisar de até 1000 comparações num vetor de 1000 posições, enquanto a busca binária precisa de só umas 10. Para comparar algoritmos de forma precisa, formalizamos essa ideia com a notação O (chamada de "Big O" ou "ordem de complexidade").'
          },
          {
            title: 'O(1) — tempo constante',
            body: 'O algoritmo leva sempre o MESMO número de passos, não importa o tamanho da entrada. Acessar vetor[5] diretamente é O(1) — sempre 1 passo, seja o vetor de 10 ou de 10 milhões de posições.'
          },
          {
            title: 'O(n) — tempo linear',
            body: 'O número de passos cresce PROPORCIONALMENTE ao tamanho da entrada (n). A busca sequencial é O(n): dobrar o tamanho do vetor dobra o número máximo de comparações.'
          },
          {
            title: 'O(log n) — tempo logarítmico',
            body: 'O número de passos cresce bem mais devagar que o tamanho da entrada. A busca binária é O(log n): dobrar o vetor só soma 1 passo a mais — por isso ela é tão rápida em vetores grandes.'
          },
          {
            title: 'O(n²) — tempo quadrático',
            body: 'O número de passos cresce com o QUADRADO do tamanho da entrada. A ordenação por bolha, seleção e inserção são O(n²): dobrar o tamanho do vetor multiplica por 4 o número de passos.'
          },
          {
            title: 'Comparando as ordens de grandeza',
            body: 'Do mais rápido para o mais lento, para entradas grandes: O(1) < O(log n) < O(n) < O(n²). Essa comparação ajuda a escolher o algoritmo certo quando o volume de dados cresce muito.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa um algoritmo ser O(1)?',
          choices: [
            { id: 'a', text: 'Ele leva sempre o mesmo número de passos, não importa o tamanho da entrada' },
            { id: 'b', text: 'Ele nunca termina' },
            { id: 'c', text: 'Ele leva exatamente 1 segundo sempre' },
            { id: 'd', text: 'Ele só funciona com 1 elemento' }
          ],
          answer: 'a',
          explanation: 'O(1) descreve um número de passos constante, independente do tamanho da entrada.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual notação representa a busca sequencial, que pode precisar de até n comparações num vetor de n posições?',
          choices: [
            { id: 'a', text: 'O(n)' },
            { id: 'b', text: 'O(1)' },
            { id: 'c', text: 'O(n²)' },
            { id: 'd', text: 'O(log n)' }
          ],
          answer: 'a',
          explanation: 'O número de comparações cresce proporcionalmente ao tamanho do vetor — isso é O(n).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que a busca binária é O(log n)?',
          choices: [
            { id: 'a', text: 'Porque a cada comparação, metade das posições restantes é descartada, fazendo o número de passos crescer bem mais devagar que o tamanho da entrada' },
            { id: 'b', text: 'Porque ela sempre acha o valor na primeira tentativa' },
            { id: 'c', text: 'Porque ela é O(n²) na verdade' },
            { id: 'd', text: 'Porque ela só funciona com números pequenos' }
          ],
          answer: 'a',
          explanation: 'Eliminar metade a cada passo é exatamente o comportamento que caracteriza O(log n).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a ordem de grandeza da ordenação por bolha, seleção e inserção:',
          code: 'A ordenação por bolha, seleção e inserção têm complexidade O(n___).',
          accept: ['²', '2'],
          explanation: 'Esses três métodos comparam pares repetidamente, resultando em complexidade O(n²).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Colocando em ordem do mais rápido para o mais lento (em entradas grandes), qual é a sequência correta?',
          choices: [
            { id: 'a', text: 'O(1) < O(log n) < O(n) < O(n²)' },
            { id: 'b', text: 'O(n²) < O(n) < O(log n) < O(1)' },
            { id: 'c', text: 'Todas crescem na mesma velocidade' },
            { id: 'd', text: 'Não é possível comparar' }
          ],
          answer: 'a',
          explanation: 'Essa é a ordem crescente de "quão rápido o número de passos aumenta" conforme a entrada cresce.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Dobrar o tamanho da entrada num algoritmo O(n²) faz o número de passos:',
          choices: [
            { id: 'a', text: 'Multiplicar por aproximadamente 4' },
            { id: 'b', text: 'Dobrar também' },
            { id: 'c', text: 'Ficar exatamente igual' },
            { id: 'd', text: 'Diminuir' }
          ],
          answer: 'a',
          explanation: 'Como o crescimento é quadrático, dobrar n multiplica o número de passos por 2² = 4.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Acessar diretamente vetor[5] (um índice conhecido) tem qual complexidade?',
          choices: [
            { id: 'a', text: 'O(1)' },
            { id: 'b', text: 'O(n)' },
            { id: 'c', text: 'O(n²)' },
            { id: 'd', text: 'O(log n)' }
          ],
          answer: 'a',
          explanation: 'Acessar uma posição conhecida de um vetor é sempre imediato, sem depender do tamanho do vetor.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a notação que representa a busca binária:',
          code: 'A busca binária tem complexidade O(log ___).',
          accept: ['n'],
          explanation: 'A busca binária é O(log n), crescendo bem mais devagar que o tamanho da entrada.'
        }
      ]
    },
    {
      id: 'logica-19-listas-encadeadas',
      title: 'Listas encadeadas',
      goal: 'Entender listas encadeadas como estrutura dinâmica de nós ligados, diferente de vetores.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema do tamanho fixo dos vetores',
            body: 'Um vetor tem tamanho definido no início; crescer além disso geralmente exige criar um vetor novo maior e copiar tudo. Uma lista encadeada resolve esse problema de outro jeito, sem exigir um tamanho fixo.'
          },
          {
            title: 'O que é uma lista encadeada?',
            body: 'É uma sequência de NÓS, onde cada nó guarda um valor e uma REFERÊNCIA (também chamada de "ponteiro") para o PRÓXIMO nó da lista. Diferente de um vetor, não precisa de posições contíguas na memória.',
            code: 'NÓ\n  valor: NUMÉRICO\n  proximo: referência para o próximo NÓ\nFIM NÓ'
          },
          {
            title: 'Percorrendo uma lista encadeada',
            body: 'Começamos pelo primeiro nó (a "cabeça" da lista) e seguimos as referências "proximo" até chegar num nó cujo "proximo" é NULO — o fim da lista.'
          },
          {
            title: 'Inserir e remover elementos',
            body: 'Inserir ou remover um elemento no MEIO de uma lista encadeada só exige ajustar as referências dos nós vizinhos, sem precisar deslocar todos os outros elementos como aconteceria num vetor.'
          },
          {
            title: 'Lista encadeada x vetor: quando usar cada um',
            body: 'Vetor é melhor quando o tamanho é conhecido e o acesso direto por índice é frequente (O(1)). Lista encadeada é melhor quando o tamanho muda muito e inserções/remoções no meio são frequentes.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma lista encadeada?',
          choices: [
            { id: 'a', text: 'Uma sequência de nós, cada um guardando um valor e uma referência para o próximo nó' },
            { id: 'b', text: 'Um vetor com tamanho fixo' },
            { id: 'c', text: 'Um tipo de matriz' },
            { id: 'd', text: 'Um registro sem campos' }
          ],
          answer: 'a',
          explanation: 'A lista encadeada é formada por nós ligados entre si por referências, não por posições contíguas.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a principal vantagem de uma lista encadeada sobre um vetor?',
          choices: [
            { id: 'a', text: 'Pode crescer ou diminuir dinamicamente, sem precisar redefinir um tamanho fixo' },
            { id: 'b', text: 'Sempre ocupa menos memória' },
            { id: 'c', text: 'Permite acesso direto por índice mais rápido que o vetor' },
            { id: 'd', text: 'Não existe vantagem nenhuma' }
          ],
          answer: 'a',
          explanation: 'A lista encadeada cresce nó a nó, sem precisar de um tamanho definido de antemão.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como sabemos que chegamos ao fim de uma lista encadeada?',
          choices: [
            { id: 'a', text: 'O campo "proximo" do último nó é NULO (não aponta para nenhum outro nó)' },
            { id: 'b', text: 'A lista sempre tem exatamente 10 nós' },
            { id: 'c', text: 'O primeiro nó indica o tamanho total' },
            { id: 'd', text: 'Não é possível saber onde ela termina' }
          ],
          answer: 'a',
          explanation: 'Um "proximo" nulo marca o fim da lista — não há mais nó nenhum depois dele.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o campo que guarda a referência para o próximo nó:',
          code: 'NÓ\n  valor: NUMÉRICO\n  ___: referência para o próximo NÓ\nFIM NÓ',
          accept: ['proximo', 'próximo'],
          explanation: 'O campo "proximo" é o que liga cada nó ao seguinte na lista.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que inserir um elemento no MEIO de uma lista encadeada costuma ser mais simples que num vetor?',
          choices: [
            { id: 'a', text: 'Só é preciso ajustar as referências dos nós vizinhos, sem deslocar todos os outros elementos' },
            { id: 'b', text: 'Listas encadeadas não permitem inserir no meio' },
            { id: 'c', text: 'É exatamente igual ao vetor, sem diferença nenhuma' },
            { id: 'd', text: 'Listas encadeadas sempre inserem só no início' }
          ],
          answer: 'a',
          explanation: 'Num vetor, inserir no meio exige deslocar todos os elementos depois da posição; numa lista, basta reapontar referências.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando um vetor costuma ser a melhor escolha, comparado a uma lista encadeada?',
          choices: [
            { id: 'a', text: 'Quando o tamanho é conhecido e o acesso direto por índice é frequente' },
            { id: 'b', text: 'Quando o tamanho muda o tempo todo, de forma imprevisível' },
            { id: 'c', text: 'Nunca — listas encadeadas são sempre melhores' },
            { id: 'd', text: 'Só quando os dados são texto' }
          ],
          answer: 'a',
          explanation: 'O acesso por índice num vetor é O(1); numa lista encadeada, é preciso percorrer nó a nó.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que cada NÓ de uma lista encadeada guarda?',
          choices: [
            { id: 'a', text: 'Um valor e uma referência para o próximo nó' },
            { id: 'b', text: 'Só um valor, sem mais nada' },
            { id: 'c', text: 'Vários valores de tipos diferentes, como um registro completo' },
            { id: 'd', text: 'O tamanho total da lista' }
          ],
          answer: 'a',
          explanation: 'Essa dupla — valor e referência ao próximo — é o que define um nó de lista encadeada.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do primeiro nó de uma lista encadeada, por onde começamos a percorrê-la:',
          code: 'Começamos a percorrer a lista pela sua ___.',
          accept: ['cabeça'],
          explanation: 'A "cabeça" é o ponto de entrada da lista, de onde seguimos as referências "proximo".'
        }
      ]
    },
    {
      id: 'logica-20-pilhas',
      title: 'Pilhas (LIFO)',
      goal: 'Entender a pilha como estrutura LIFO, com as operações PUSH e POP.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é uma pilha?',
            body: 'Uma pilha é uma estrutura de dados onde o ÚLTIMO elemento inserido é o PRIMEIRO a ser removido — chamado de LIFO (Last In, First Out). É como uma pilha de pratos: você só pega o de cima.'
          },
          {
            title: 'As operações PUSH e POP',
            body: 'PUSH insere um elemento no topo da pilha; POP remove e devolve o elemento do topo. Não é possível acessar elementos no meio diretamente — só pelo topo.',
            code: 'PILHA <- []\nPUSH(PILHA, 5)   # pilha: [5]\nPUSH(PILHA, 8)   # pilha: [5, 8]\nPOP(PILHA)       # devolve 8; pilha: [5]'
          },
          {
            title: 'Onde pilhas são usadas',
            body: 'O botão "desfazer" (undo) de um editor de texto, o histórico de navegação de um navegador (botão voltar), e até as chamadas de função recursivas usam a ideia de pilha por trás — lembra do "estouro de pilha" da lição de recursividade?'
          },
          {
            title: 'Verificando se a pilha está vazia',
            body: 'Antes de fazer POP, é importante verificar se a pilha não está vazia — tentar remover de uma pilha vazia é um erro comum.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa LIFO?',
          choices: [
            { id: 'a', text: 'Last In, First Out — o último a entrar é o primeiro a sair' },
            { id: 'b', text: 'First In, First Out — o primeiro a entrar é o primeiro a sair' },
            { id: 'c', text: 'Um tipo de laço' },
            { id: 'd', text: 'Um símbolo de fluxograma' }
          ],
          answer: 'a',
          explanation: 'LIFO descreve exatamente o comportamento da pilha: o último a entrar sai primeiro.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a operação PUSH faz numa pilha?',
          choices: [
            { id: 'a', text: 'Insere um elemento no topo da pilha' },
            { id: 'b', text: 'Remove o elemento do topo' },
            { id: 'c', text: 'Remove o elemento do fundo' },
            { id: 'd', text: 'Esvazia a pilha inteira' }
          ],
          answer: 'a',
          explanation: 'PUSH sempre adiciona um novo elemento no topo da pilha.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a operação POP faz numa pilha?',
          choices: [
            { id: 'a', text: 'Remove e devolve o elemento do topo' },
            { id: 'b', text: 'Insere um elemento no topo' },
            { id: 'c', text: 'Devolve o tamanho da pilha' },
            { id: 'd', text: 'Insere um elemento no fundo' }
          ],
          answer: 'a',
          explanation: 'POP sempre remove e devolve o elemento que está no topo da pilha.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a operação que insere 10 no topo da pilha:',
          code: '___(PILHA, 10)',
          accept: ['PUSH'],
          explanation: 'PUSH é a operação que insere um novo elemento no topo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Depois de PUSH(PILHA, 5) e PUSH(PILHA, 8), o que POP(PILHA) devolve?',
          choices: [
            { id: 'a', text: '8' },
            { id: 'b', text: '5' },
            { id: 'c', text: 'Os dois valores juntos' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: '8 foi o último a entrar, então é o primeiro a sair (LIFO).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual exemplo do dia a dia usa a lógica de uma pilha?',
          choices: [
            { id: 'a', text: 'O botão "desfazer" de um editor de texto' },
            { id: 'b', text: 'Uma fila de banco, em ordem de chegada' },
            { id: 'c', text: 'Um vetor ordenado' },
            { id: 'd', text: 'Uma matriz de jogo' }
          ],
          answer: 'a',
          explanation: 'Desfazer a última ação primeiro é exatamente o comportamento LIFO de uma pilha.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que é importante checar antes de fazer POP numa pilha?',
          choices: [
            { id: 'a', text: 'Se a pilha não está vazia' },
            { id: 'b', text: 'Se o valor é numérico' },
            { id: 'c', text: 'Se a pilha tem mais de 100 elementos' },
            { id: 'd', text: 'Nada precisa ser checado' }
          ],
          answer: 'a',
          explanation: 'Fazer POP numa pilha vazia é um erro comum — não há elemento nenhum para remover.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome da estrutura onde o último elemento inserido é o primeiro a ser removido:',
          code: 'Uma estrutura onde o último elemento inserido é o primeiro a ser removido se chama ___.',
          accept: ['pilha'],
          explanation: 'Essa é justamente a definição de pilha (LIFO).'
        }
      ]
    },
    {
      id: 'logica-21-filas',
      title: 'Filas (FIFO)',
      goal: 'Entender a fila como estrutura FIFO, com as operações ENFILEIRAR e DESENFILEIRAR.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é uma fila?',
            body: 'Uma fila é uma estrutura de dados onde o PRIMEIRO elemento inserido é o PRIMEIRO a ser removido — chamado de FIFO (First In, First Out). É como uma fila de banco: quem chega primeiro é atendido primeiro.'
          },
          {
            title: 'As operações ENFILEIRAR e DESENFILEIRAR',
            body: 'ENFILEIRAR insere um elemento no final da fila; DESENFILEIRAR remove e devolve o elemento do início da fila.',
            code: 'FILA <- []\nENFILEIRAR(FILA, 5)   # fila: [5]\nENFILEIRAR(FILA, 8)   # fila: [5, 8]\nDESENFILEIRAR(FILA)   # devolve 5; fila: [8]'
          },
          {
            title: 'Onde filas são usadas',
            body: 'Filas de impressão (documentos são impressos na ordem que chegaram), atendimento em call centers e processamento de tarefas em ordem de chegada são exemplos comuns do dia a dia.'
          },
          {
            title: 'Pilha x Fila: qual a diferença?',
            body: 'Na pilha (LIFO), o último a entrar é o primeiro a sair. Na fila (FIFO), o primeiro a entrar é o primeiro a sair. A escolha entre as duas depende de qual ordem faz sentido para o problema.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa FIFO?',
          choices: [
            { id: 'a', text: 'First In, First Out — o primeiro a entrar é o primeiro a sair' },
            { id: 'b', text: 'Last In, First Out — o último a entrar é o primeiro a sair' },
            { id: 'c', text: 'Um tipo de árvore' },
            { id: 'd', text: 'Um símbolo de fluxograma' }
          ],
          answer: 'a',
          explanation: 'FIFO descreve o comportamento da fila: quem entra primeiro sai primeiro.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a operação ENFILEIRAR faz?',
          choices: [
            { id: 'a', text: 'Insere um elemento no final da fila' },
            { id: 'b', text: 'Remove o elemento do início' },
            { id: 'c', text: 'Remove o elemento do final' },
            { id: 'd', text: 'Esvazia a fila inteira' }
          ],
          answer: 'a',
          explanation: 'ENFILEIRAR sempre adiciona um novo elemento no final da fila.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a operação DESENFILEIRAR faz?',
          choices: [
            { id: 'a', text: 'Remove e devolve o elemento do início da fila' },
            { id: 'b', text: 'Insere um elemento no início' },
            { id: 'c', text: 'Devolve o tamanho da fila' },
            { id: 'd', text: 'Insere um elemento no final' }
          ],
          answer: 'a',
          explanation: 'DESENFILEIRAR sempre remove e devolve o elemento que está no início da fila.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a operação que remove o próximo elemento da fila:',
          code: 'proximo <- ___(FILA)',
          accept: ['DESENFILEIRAR'],
          explanation: 'DESENFILEIRAR é a operação que remove e devolve o elemento do início da fila.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Depois de ENFILEIRAR(FILA, 5) e ENFILEIRAR(FILA, 8), o que DESENFILEIRAR(FILA) devolve?',
          choices: [
            { id: 'a', text: '5' },
            { id: 'b', text: '8' },
            { id: 'c', text: 'Os dois valores juntos' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: '5 foi o primeiro a entrar, então é o primeiro a sair (FIFO).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual exemplo do dia a dia usa a lógica de uma fila?',
          choices: [
            { id: 'a', text: 'Uma fila de atendimento de banco, em ordem de chegada' },
            { id: 'b', text: 'O botão "desfazer" de um editor de texto' },
            { id: 'c', text: 'Uma busca binária' },
            { id: 'd', text: 'Uma matriz de jogo' }
          ],
          answer: 'a',
          explanation: 'Atender em ordem de chegada é exatamente o comportamento FIFO de uma fila.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a principal diferença entre pilha e fila?',
          choices: [
            { id: 'a', text: 'Pilha é LIFO (último a entrar sai primeiro); fila é FIFO (primeiro a entrar sai primeiro)' },
            { id: 'b', text: 'São exatamente a mesma estrutura' },
            { id: 'c', text: 'Fila só pode guardar números' },
            { id: 'd', text: 'Pilha não tem operação de remover' }
          ],
          answer: 'a',
          explanation: 'Essa é a distinção central entre as duas estruturas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome da estrutura onde o primeiro elemento inserido é o primeiro a ser removido:',
          code: 'Uma estrutura onde o primeiro elemento inserido é o primeiro a ser removido se chama ___.',
          accept: ['fila'],
          explanation: 'Essa é justamente a definição de fila (FIFO).'
        }
      ]
    },
    {
      id: 'logica-22-arvores',
      title: 'Árvores binárias',
      goal: 'Entender árvores como estrutura hierárquica e a árvore binária de busca.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é uma árvore?',
            body: 'Uma árvore é uma estrutura hierárquica: começa numa RAIZ, que se conecta a outros nós (chamados FILHOS), que por sua vez podem ter seus próprios filhos. Nós sem filhos são chamados de FOLHAS.'
          },
          {
            title: 'Árvore binária',
            body: 'Numa árvore BINÁRIA, cada nó tem NO MÁXIMO dois filhos: o filho da esquerda e o filho da direita.',
            code: 'NÓ\n  valor: NUMÉRICO\n  esquerda: referência para NÓ (ou nulo)\n  direita: referência para NÓ (ou nulo)\nFIM NÓ'
          },
          {
            title: 'Árvore binária de busca (ABB)',
            body: 'Numa árvore binária de BUSCA, todo valor à ESQUERDA de um nó é MENOR que ele, e todo valor à DIREITA é MAIOR. Isso torna a busca muito rápida: a cada nó, já sabemos de qual lado continuar.'
          },
          {
            title: 'Buscando numa árvore binária de busca',
            body: 'Para buscar um valor, comparamos com a raiz: se for igual, encontramos; se for menor, vamos para a esquerda; se for maior, vamos para a direita. Repetimos até encontrar ou chegar num nó nulo.'
          },
          {
            title: 'Por que árvores são eficientes para busca?',
            body: 'Assim como a busca binária num vetor, cada comparação numa árvore binária de busca bem balanceada elimina metade dos nós restantes — por isso ela também é O(log n).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma árvore, em estruturas de dados?',
          choices: [
            { id: 'a', text: 'Uma estrutura hierárquica que começa numa raiz e se ramifica em nós filhos' },
            { id: 'b', text: 'Um tipo de vetor ordenado' },
            { id: 'c', text: 'Um sinônimo de pilha' },
            { id: 'd', text: 'Um tipo de laço' }
          ],
          answer: 'a',
          explanation: 'A árvore organiza dados hierarquicamente, a partir de uma raiz que se ramifica.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Numa árvore binária, quantos filhos um nó pode ter, no máximo?',
          choices: [
            { id: 'a', text: 'Dois' },
            { id: 'b', text: 'Um' },
            { id: 'c', text: 'Três' },
            { id: 'd', text: 'Ilimitado' }
          ],
          answer: 'a',
          explanation: 'É justamente o "binária" no nome: no máximo dois filhos, esquerda e direita.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Numa árvore binária de busca, onde ficam os valores MENORES que um nó?',
          choices: [
            { id: 'a', text: 'À esquerda desse nó' },
            { id: 'b', text: 'À direita desse nó' },
            { id: 'c', text: 'Sempre na raiz' },
            { id: 'd', text: 'Em qualquer lugar, não importa' }
          ],
          answer: 'a',
          explanation: 'Essa é a regra que define a árvore binária de busca: menores à esquerda, maiores à direita.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o campo que falta na definição do nó de uma árvore binária:',
          code: 'NÓ\n  valor: NUMÉRICO\n  esquerda: referência para NÓ\n  ___: referência para NÓ\nFIM NÓ',
          accept: ['direita'],
          explanation: 'Todo nó de árvore binária tem duas referências: esquerda e direita.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Buscando o valor 15 numa árvore binária de busca cuja raiz é 20, para qual lado continuamos a busca?',
          choices: [
            { id: 'a', text: 'Para a esquerda (15 é menor que 20)' },
            { id: 'b', text: 'Para a direita (15 é menor que 20)' },
            { id: 'c', text: 'Paramos, o valor não existe' },
            { id: 'd', text: 'Voltamos para o início' }
          ],
          answer: 'a',
          explanation: 'Como 15 é menor que a raiz (20), a busca continua pela subárvore da esquerda.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como se chama um nó de árvore que não tem nenhum filho?',
          choices: [
            { id: 'a', text: 'Folha' },
            { id: 'b', text: 'Raiz' },
            { id: 'c', text: 'Galho' },
            { id: 'd', text: 'Semente' }
          ],
          answer: 'a',
          explanation: 'Nós sem filhos, no final dos "galhos" da árvore, são chamados de folhas.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que uma árvore binária de busca bem balanceada é eficiente para buscar valores?',
          choices: [
            { id: 'a', text: 'Porque cada comparação elimina metade dos nós restantes, assim como a busca binária num vetor' },
            { id: 'b', text: 'Porque ela sempre tem só 1 nó' },
            { id: 'c', text: 'Porque não é preciso comparar valor nenhum' },
            { id: 'd', text: 'Porque ela guarda os valores em ordem aleatória' }
          ],
          answer: 'a',
          explanation: 'A cada nó visitado, metade da árvore restante é descartada — o mesmo princípio da busca binária.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do nó inicial de uma árvore, de onde toda busca começa:',
          code: 'Toda busca numa árvore começa pela sua ___.',
          accept: ['raiz'],
          explanation: 'A raiz é o nó do topo da árvore, ponto de partida de qualquer percurso.'
        }
      ]
    },
    {
      id: 'logica-24-grafos',
      title: 'Grafos',
      goal: 'Entender grafos como generalização de árvores, vértices, arestas e grafos direcionados.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é um grafo?',
            body: 'Um grafo é uma estrutura formada por VÉRTICES (ou nós) e ARESTAS (as conexões entre eles). É uma generalização da árvore: toda árvore é um grafo, mas nem todo grafo é uma árvore — um grafo pode ter ciclos, e um vértice pode se conectar a vários outros sem uma hierarquia definida.'
          },
          {
            title: 'Vértices e arestas',
            body: 'Vértices representam os "itens" (cidades, pessoas, páginas web); arestas representam as CONEXÕES entre eles (estradas, amizades, links).',
            code: 'vértices: {A, B, C}\narestas: {(A,B), (B,C), (A,C)}'
          },
          {
            title: 'Grafo direcionado x não-direcionado',
            body: 'Num grafo NÃO-DIRECIONADO, a aresta entre A e B vale nos dois sentidos (como uma amizade). Num grafo DIRECIONADO, a aresta tem um sentido específico (A segue B numa rede social, mas B não necessariamente segue A de volta).'
          },
          {
            title: 'Onde grafos são usados',
            body: 'Mapas e rotas (cidades e estradas), redes sociais (pessoas e conexões) e a internet (páginas e links) são todos representados naturalmente como grafos.'
          },
          {
            title: 'Percorrendo um grafo',
            body: 'Assim como percorremos uma árvore, podemos percorrer um grafo visitando vértices através das arestas — mas como um grafo pode ter ciclos (voltar a um vértice já visitado), é preciso marcar quais vértices já foram visitados para não entrar num laço infinito.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um grafo?',
          choices: [
            { id: 'a', text: 'Uma estrutura formada por vértices (nós) e arestas (conexões entre eles)' },
            { id: 'b', text: 'Um tipo de vetor ordenado' },
            { id: 'c', text: 'Um sinônimo de pilha' },
            { id: 'd', text: 'Um tipo de laço' }
          ],
          answer: 'a',
          explanation: 'Vértices e arestas são os dois elementos que definem um grafo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a relação entre árvores e grafos?',
          choices: [
            { id: 'a', text: 'Toda árvore é um grafo, mas nem todo grafo é uma árvore' },
            { id: 'b', text: 'São exatamente a mesma coisa' },
            { id: 'c', text: 'Árvores e grafos não têm relação nenhuma' },
            { id: 'd', text: 'Todo grafo é uma árvore' }
          ],
          answer: 'a',
          explanation: 'A árvore é um caso particular de grafo: sem ciclos e com uma hierarquia a partir de uma raiz.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Num grafo NÃO-DIRECIONADO, o que significa uma aresta entre A e B?',
          choices: [
            { id: 'a', text: 'A conexão vale nos dois sentidos, entre A e B e entre B e A' },
            { id: 'b', text: 'A conexão só vale de A para B' },
            { id: 'c', text: 'Não existe conexão nenhuma' },
            { id: 'd', text: 'A e B são o mesmo vértice' }
          ],
          answer: 'a',
          explanation: 'No grafo não-direcionado, a aresta não tem sentido — conecta os dois vértices igualmente.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o termo que representa as conexões entre os vértices de um grafo:',
          code: 'Um grafo é formado por vértices e ___.',
          accept: ['arestas'],
          explanation: 'As arestas são as conexões que ligam os vértices de um grafo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Num grafo DIRECIONADO representando "quem segue quem" numa rede social, se A segue B, isso significa que:',
          choices: [
            { id: 'a', text: 'A aresta vai de A para B, mas B não precisa seguir A de volta' },
            { id: 'b', text: 'B necessariamente segue A também' },
            { id: 'c', text: 'A e B são a mesma pessoa' },
            { id: 'd', text: 'Não é possível representar isso com um grafo' }
          ],
          answer: 'a',
          explanation: 'Num grafo direcionado, cada aresta tem um sentido único — seguir não implica ser seguido de volta.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual exemplo do dia a dia é bem representado como um grafo?',
          choices: [
            { id: 'a', text: 'Um mapa de cidades conectadas por estradas' },
            { id: 'b', text: 'Um único número guardado numa variável' },
            { id: 'c', text: 'Uma pilha de pratos' },
            { id: 'd', text: 'Uma tabela de multiplicação' }
          ],
          answer: 'a',
          explanation: 'Cidades (vértices) conectadas por estradas (arestas) é o exemplo clássico de grafo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que é importante marcar vértices já visitados ao percorrer um grafo?',
          choices: [
            { id: 'a', text: 'Porque um grafo pode ter ciclos, e sem marcar, o percurso poderia entrar num laço infinito' },
            { id: 'b', text: 'Porque grafos nunca têm ciclos' },
            { id: 'c', text: 'Porque cada vértice só pode ser visitado por uma pessoa' },
            { id: 'd', text: 'Não é necessário marcar nada' }
          ],
          answer: 'a',
          explanation: 'Diferente de uma árvore, um grafo pode ter ciclos — marcar visitados evita repetir o percurso para sempre.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que representa os "itens" conectados num grafo:',
          code: 'Um grafo é formado por ___ e arestas.',
          accept: ['vértices', 'vertices'],
          explanation: 'Vértices (ou nós) são os itens conectados pelas arestas do grafo.'
        }
      ]
    },
    {
      id: 'logica-25-tabelas-hash',
      title: 'Tabelas hash',
      goal: 'Entender tabelas hash como estrutura de chave-valor com busca rápida via função hash.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: buscar rápido por uma chave',
            body: 'Já vimos buscas O(n) (sequencial) e O(log n) (binária/árvore). Uma tabela hash consegue buscar em tempo médio O(1) — praticamente instantâneo, independente do tamanho dos dados.'
          },
          {
            title: 'O que é uma função hash?',
            body: 'Uma FUNÇÃO HASH transforma uma chave (como um nome ou um número) num índice numérico, calculado diretamente, sem precisar comparar com outros valores. Esse índice indica exatamente onde o valor fica guardado.',
            code: 'indice <- hash("Ana") % tamanho_da_tabela\ntabela[indice] <- "Ana"'
          },
          {
            title: 'Chave e valor',
            body: 'Uma tabela hash guarda pares CHAVE-VALOR: a chave (ex: "Ana") é usada pela função hash para calcular onde o VALOR associado (ex: os dados dela) fica guardado.'
          },
          {
            title: 'Colisões',
            body: 'Às vezes, duas chaves diferentes geram o MESMO índice — isso se chama COLISÃO. Tabelas hash têm estratégias para lidar com isso (como guardar uma pequena lista de valores em cada posição), mas colisões deixam a busca um pouco mais lenta naquele ponto.'
          },
          {
            title: 'Tabela hash x árvore de busca: quando usar cada uma',
            body: 'Tabela hash é mais rápida em média (O(1)) para busca simples por chave, mas não mantém os dados em ORDEM. Árvore de busca é um pouco mais lenta (O(log n)), mas permite percorrer os valores em ordem crescente/decrescente facilmente.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a principal vantagem de uma tabela hash para buscar valores?',
          choices: [
            { id: 'a', text: 'Busca em tempo médio O(1), praticamente instantânea, independente do tamanho dos dados' },
            { id: 'b', text: 'Sempre ordena os dados automaticamente' },
            { id: 'c', text: 'Nunca ocupa memória nenhuma' },
            { id: 'd', text: 'Só funciona com números' }
          ],
          answer: 'a',
          explanation: 'A busca por chave numa tabela hash costuma ser O(1) em média, muito mais rápida que O(n) ou O(log n).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que uma função hash faz?',
          choices: [
            { id: 'a', text: 'Transforma uma chave num índice numérico, calculado diretamente' },
            { id: 'b', text: 'Ordena os valores da tabela' },
            { id: 'c', text: 'Compara a chave com todas as outras uma por uma' },
            { id: 'd', text: 'Sempre devolve o mesmo valor, não importa a chave' }
          ],
          answer: 'a',
          explanation: 'A função hash calcula o índice diretamente a partir da chave, sem precisar comparar com outros valores.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que uma tabela hash guarda?',
          choices: [
            { id: 'a', text: 'Pares chave-valor' },
            { id: 'b', text: 'Só valores, sem chave nenhuma' },
            { id: 'c', text: 'Só chaves, sem valor nenhum' },
            { id: 'd', text: 'Apenas números inteiros' }
          ],
          answer: 'a',
          explanation: 'Cada entrada da tabela hash associa uma chave a um valor.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o termo que descreve quando duas chaves diferentes geram o mesmo índice:',
          code: 'Quando duas chaves diferentes geram o mesmo índice, isso se chama ___.',
          accept: ['colisão', 'colisao'],
          explanation: 'Colisão é quando a função hash calcula o mesmo índice para chaves diferentes.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que geralmente acontece quando ocorre uma colisão numa tabela hash?',
          choices: [
            { id: 'a', text: 'A tabela usa uma estratégia (como uma pequena lista) para guardar mais de um valor na mesma posição' },
            { id: 'b', text: 'Um dos valores é perdido para sempre' },
            { id: 'c', text: 'A tabela para de funcionar' },
            { id: 'd', text: 'A tabela hash nunca tem colisões' }
          ],
          answer: 'a',
          explanation: 'Estratégias de tratamento de colisão evitam perder dados quando duas chaves geram o mesmo índice.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a principal desvantagem de uma tabela hash comparada a uma árvore de busca?',
          choices: [
            { id: 'a', text: 'Não mantém os dados em ordem naturalmente' },
            { id: 'b', text: 'É sempre mais lenta para buscar' },
            { id: 'c', text: 'Não pode guardar texto' },
            { id: 'd', text: 'Só funciona com um valor por vez' }
          ],
          answer: 'a',
          explanation: 'Diferente da árvore de busca, a tabela hash não organiza os dados em ordem.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando escolher uma árvore de busca em vez de uma tabela hash?',
          choices: [
            { id: 'a', text: 'Quando é importante percorrer os valores em ordem crescente/decrescente' },
            { id: 'b', text: 'Quando a busca precisa ser o mais rápida possível, sem se importar com ordem' },
            { id: 'c', text: 'Nunca — tabela hash é sempre melhor' },
            { id: 'd', text: 'Árvores de busca não servem pra buscar nada' }
          ],
          answer: 'a',
          explanation: 'A árvore de busca mantém os dados ordenados, o que a tabela hash não faz naturalmente.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: uma tabela hash guarda pares chave-___.',
          code: 'Uma tabela hash guarda pares chave-___.',
          accept: ['valor'],
          explanation: 'Cada chave está associada a um valor guardado na tabela.'
        }
      ]
    },
    {
      id: 'logica-23-ordenacao-eficiente',
      title: 'Ordenação eficiente (Mergesort e Quicksort)',
      goal: 'Entender a estratégia "dividir para conquistar" nos algoritmos Mergesort e Quicksort.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O limite dos métodos O(n²)',
            body: 'Bolha, seleção e inserção são O(n²): ficam lentos demais para vetores muito grandes. Existem métodos de ordenação mais eficientes, que usam uma estratégia diferente: dividir para conquistar.'
          },
          {
            title: "A estratégia 'dividir para conquistar'",
            body: 'Em vez de comparar pares de elementos repetidamente, dividimos o problema em partes MENORES, resolvemos cada parte separadamente (muitas vezes de forma recursiva), e depois juntamos os resultados.'
          },
          {
            title: 'Mergesort: dividir e depois juntar',
            body: 'O Mergesort divide o vetor ao meio repetidamente, até sobrar só vetores de 1 elemento (já "ordenados" por definição), e depois vai juntando (merge) essas partes de volta, sempre em ordem.',
            code: 'DIVIDIR o vetor ao meio\nORDENAR (recursivamente) cada metade\nJUNTAR as duas metades ordenadas'
          },
          {
            title: 'Quicksort: escolher um pivô',
            body: 'O Quicksort escolhe um valor de referência (o PIVÔ) e reorganiza o vetor de modo que tudo MENOR que o pivô fique à esquerda, e tudo MAIOR fique à direita. Depois repete esse processo em cada metade, recursivamente.'
          },
          {
            title: 'Por que são mais rápidos que a bolha?',
            body: 'Mergesort e Quicksort têm complexidade O(n log n) no caso típico — bem mais rápido que O(n²) para vetores grandes, porque a estratégia de dividir reduz drasticamente o número de comparações necessárias.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual o principal problema dos métodos de ordenação O(n²) (bolha, seleção, inserção)?',
          choices: [
            { id: 'a', text: 'Ficam muito lentos para vetores muito grandes' },
            { id: 'b', text: 'Não conseguem ordenar números' },
            { id: 'c', text: 'Só funcionam com texto' },
            { id: 'd', text: 'Não existe problema nenhum' }
          ],
          answer: 'a',
          explanation: 'O crescimento quadrático torna esses métodos impraticáveis para grandes volumes de dados.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que significa a estratégia "dividir para conquistar"?',
          choices: [
            { id: 'a', text: 'Dividir o problema em partes menores, resolver cada parte, e depois juntar os resultados' },
            { id: 'b', text: 'Resolver o problema inteiro de uma vez, sem dividir nada' },
            { id: 'c', text: 'Ignorar parte dos dados' },
            { id: 'd', text: 'Repetir o mesmo passo para sempre' }
          ],
          answer: 'a',
          explanation: 'É essa a ideia central por trás de algoritmos como Mergesort e Quicksort.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como o Mergesort funciona, de forma resumida?',
          choices: [
            { id: 'a', text: 'Divide o vetor ao meio repetidamente e depois junta as partes já ordenadas' },
            { id: 'b', text: 'Compara só os dois primeiros elementos do vetor' },
            { id: 'c', text: 'Ordena o vetor sem nenhuma divisão' },
            { id: 'd', text: 'Escolhe um pivô e não divide nada' }
          ],
          answer: 'a',
          explanation: 'Dividir e depois juntar (merge) é o que dá nome ao Mergesort.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a etapa final do Mergesort, depois de ordenar as duas metades:',
          code: 'DIVIDIR o vetor ao meio\nORDENAR (recursivamente) cada metade\n___ as duas metades ordenadas',
          accept: ['JUNTAR'],
          explanation: 'JUNTAR (merge) as metades já ordenadas é a etapa final do algoritmo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é o "pivô" no Quicksort?',
          choices: [
            { id: 'a', text: 'Um valor de referência escolhido para reorganizar o vetor em menores e maiores que ele' },
            { id: 'b', text: 'O primeiro elemento sempre removido do vetor' },
            { id: 'c', text: 'O tamanho do vetor' },
            { id: 'd', text: 'Um tipo de laço' }
          ],
          answer: 'a',
          explanation: 'O pivô é o valor usado para separar o vetor em duas partes durante o Quicksort.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Depois de escolher o pivô no Quicksort, o que acontece com os valores menores que ele?',
          choices: [
            { id: 'a', text: 'Ficam à esquerda do pivô' },
            { id: 'b', text: 'Ficam à direita do pivô' },
            { id: 'c', text: 'São removidos do vetor' },
            { id: 'd', text: 'Nada muda' }
          ],
          answer: 'a',
          explanation: 'O Quicksort reorganiza o vetor colocando os valores menores que o pivô à esquerda dele.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a complexidade típica do Mergesort e do Quicksort, comparada à bolha (O(n²))?',
          choices: [
            { id: 'a', text: 'O(n log n), mais rápida que O(n²) para vetores grandes' },
            { id: 'b', text: 'O(n²), exatamente igual à bolha' },
            { id: 'c', text: 'O(1), instantânea sempre' },
            { id: 'd', text: 'O(n³), mais lenta que a bolha' }
          ],
          answer: 'a',
          explanation: 'A estratégia de dividir para conquistar reduz a complexidade para O(n log n) no caso típico.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: Mergesort e Quicksort usam a estratégia de ___ para conquistar.',
          code: 'Mergesort e Quicksort usam a estratégia de ___ para conquistar.',
          accept: ['dividir'],
          explanation: 'Ambos dividem o problema em partes menores antes de resolvê-lo.'
        }
      ]
    },
    {
      id: 'logica-26-programacao-dinamica',
      title: 'Programação dinâmica',
      goal: 'Entender memoização, subproblemas sobrepostos e como evitar recálculo numa recursão.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema da recursão repetida',
            body: 'Lembra do fatorial recursivo? Alguns problemas recursivos, como calcular o número de Fibonacci, acabam RECALCULANDO o mesmo subproblema várias vezes, desperdiçando tempo.',
            code: 'FUNÇÃO fibonacci(n)\n  SE n <= 1 ENTÃO\n    RETORNE n\n  SENÃO\n    RETORNE fibonacci(n-1) + fibonacci(n-2)\n  FIM SE\nFIM FUNÇÃO'
          },
          {
            title: 'Subproblemas sobrepostos',
            body: 'Calcular fibonacci(5) chama fibonacci(4) e fibonacci(3); mas fibonacci(4) TAMBÉM chama fibonacci(3) de novo — o mesmo subproblema é resolvido repetidas vezes, desperdiçando trabalho.'
          },
          {
            title: 'O que é memoização?',
            body: 'Memoização significa GUARDAR o resultado de um subproblema já calculado (numa tabela ou vetor), e reutilizá-lo da próxima vez que for preciso, em vez de recalcular do zero.',
            code: 'memoria <- []  # vazio no início\nFUNÇÃO fibonacci(n)\n  SE memoria[n] existe ENTÃO\n    RETORNE memoria[n]\n  SENÃO\n    resultado <- fibonacci(n-1) + fibonacci(n-2)\n    memoria[n] <- resultado\n    RETORNE resultado\n  FIM SE\nFIM FUNÇÃO'
          },
          {
            title: 'Programação dinâmica',
            body: 'Programação dinâmica é o nome da técnica de resolver um problema dividindo-o em subproblemas, usando memoização para nunca resolver o mesmo subproblema duas vezes. É especialmente útil quando os subproblemas SE REPETEM — diferente do dividir para conquistar do Mergesort, onde os subproblemas são independentes.'
          },
          {
            title: 'O ganho de eficiência',
            body: 'Sem memoização, calcular fibonacci(n) de forma recursiva simples é extremamente lento para valores de n um pouco maiores. Com memoização, cada subproblema é calculado só uma vez, tornando o algoritmo muito mais rápido.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual o problema da recursão simples (sem memoização) no cálculo de Fibonacci?',
          choices: [
            { id: 'a', text: 'Ela recalcula os mesmos subproblemas várias vezes, desperdiçando tempo' },
            { id: 'b', text: 'Ela nunca termina' },
            { id: 'c', text: 'Ela só funciona para n = 0' },
            { id: 'd', text: 'Ela não usa recursão de verdade' }
          ],
          answer: 'a',
          explanation: 'Sem guardar resultados, o mesmo subproblema é resolvido repetidamente ao longo das chamadas recursivas.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que significa "subproblemas sobrepostos"?',
          choices: [
            { id: 'a', text: 'O mesmo subproblema menor aparece repetidas vezes ao resolver o problema maior' },
            { id: 'b', text: 'Os subproblemas nunca se repetem' },
            { id: 'c', text: 'O problema não pode ser dividido em partes menores' },
            { id: 'd', text: 'Os subproblemas são resolvidos em paralelo sempre' }
          ],
          answer: 'a',
          explanation: 'É exatamente essa repetição de subproblemas que a memoização evita recalcular.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é memoização?',
          choices: [
            { id: 'a', text: 'Guardar o resultado de um subproblema já calculado, para reutilizá-lo depois em vez de recalcular' },
            { id: 'b', text: 'Um tipo de laço infinito' },
            { id: 'c', text: 'Apagar resultados antigos da memória' },
            { id: 'd', text: 'Ordenar os resultados calculados' }
          ],
          answer: 'a',
          explanation: 'Memoização guarda resultados já calculados numa tabela ou vetor para reaproveitar depois.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o termo que descreve guardar um resultado já calculado para reaproveitar depois:',
          code: 'A técnica de guardar um resultado já calculado para reaproveitar depois se chama ___.',
          accept: ['memoização', 'memoizacao'],
          explanation: 'Memoização é o nome dessa técnica.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Como a memoização ajuda a resolver problemas com subproblemas sobrepostos?',
          choices: [
            { id: 'a', text: 'Calculando cada subproblema só uma vez e reaproveitando o resultado guardado' },
            { id: 'b', text: 'Ignorando parte dos subproblemas' },
            { id: 'c', text: 'Resolvendo tudo de uma vez, sem dividir nada' },
            { id: 'd', text: 'Aumentando o número de vezes que cada subproblema é calculado' }
          ],
          answer: 'a',
          explanation: 'Reaproveitar o resultado guardado é o que evita o recálculo repetido.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre "dividir para conquistar" (Mergesort) e "programação dinâmica"?',
          choices: [
            { id: 'a', text: 'No dividir para conquistar, os subproblemas geralmente são independentes; na programação dinâmica, os subproblemas se repetem e usam memoização' },
            { id: 'b', text: 'São exatamente a mesma técnica' },
            { id: 'c', text: 'Programação dinâmica nunca usa recursão' },
            { id: 'd', text: 'Dividir para conquistar não divide o problema' }
          ],
          answer: 'a',
          explanation: 'Essa é a distinção central entre as duas estratégias, ambas baseadas em dividir o problema.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Sem memoização, calcular Fibonacci recursivamente para valores de n um pouco maiores tende a ser:',
          choices: [
            { id: 'a', text: 'Muito lento, por recalcular os mesmos subproblemas repetidas vezes' },
            { id: 'b', text: 'Instantâneo, sempre O(1)' },
            { id: 'c', text: 'Mais rápido que com memoização' },
            { id: 'd', text: 'Impossível de calcular' }
          ],
          answer: 'a',
          explanation: 'O número de chamadas recursivas cresce muito rápido sem memoização.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome da técnica que combina subproblemas repetidos com memoização:',
          code: 'A técnica que resolve subproblemas repetidos usando memoização se chama programação ___.',
          accept: ['dinâmica', 'dinamica'],
          explanation: 'Programação dinâmica é o nome dessa técnica.'
        }
      ]
    }
  ]
};
