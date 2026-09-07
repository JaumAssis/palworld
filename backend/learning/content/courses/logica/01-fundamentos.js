// Módulo "Fundamentos da Lógica" (iniciante) — 6 lições, 8 questões cada (3 múltipla escolha + 1
// lacuna, duas vezes por lição). Independente de linguagem: pseudocódigo genérico, não Python.
//
// Cada lição usa o formato de intro multi-slide (intro.slides) — uma tela de apresentação por
// conceito, terminando no botão de começar as perguntas — porque a introdução PRECISA ensinar
// explicitamente todo conceito que as perguntas vão cobrar (ex: se uma pergunta pede "qual desses
// é o tipo lógico", os slides já precisam ter nomeado e explicado o que é o tipo lógico antes
// disso, não só dado um exemplo passando ao largo). Ver checkIntro em ../../index.js.
module.exports = {
  id: 'fundamentos-logica',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos da Lógica',
  subtitle: 'Algoritmos, fluxogramas, variáveis, decisões e repetições',
  accent: '#f97316',
  lessons: [
    {
      id: 'logica-01-algoritmos',
      title: 'O que é um algoritmo',
      goal: 'Entender o conceito de algoritmo, um exemplo do dia a dia e o que faz um algoritmo ser bom.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é um algoritmo?',
            body: 'Um algoritmo é uma sequência finita e ordenada de passos para resolver um problema ou realizar uma tarefa. "Finita" quer dizer que tem um número limitado de passos — não pode ser infinito. "Ordenada" quer dizer que a ordem dos passos importa: seguir fora de ordem pode dar um resultado errado.'
          },
          {
            title: 'Um exemplo do dia a dia',
            body: 'Uma receita de bolo é um algoritmo: separar os ingredientes, misturar, colocar na forma, assar, esperar esfriar. Se você trocar a ordem — por exemplo, assar antes de misturar os ingredientes — o resultado sai errado. É exatamente por isso que a ordem dos passos de um algoritmo é importante.',
            code: '1. Separar os ingredientes\n2. Misturar\n3. Colocar na forma\n4. Assar\n5. Esperar esfriar'
          },
          {
            title: 'Características de um bom algoritmo',
            body: 'Um bom algoritmo precisa ser: CLARO (sem ambiguidade, qualquer pessoa consegue seguir os passos do mesmo jeito), FINITO (tem um número limitado de passos) e precisa TERMINAR em algum momento (não pode ficar rodando para sempre). Detalhes como cor ou formatação não fazem parte dessas características — não afetam se o algoritmo está correto.'
          },
          {
            title: 'Algoritmo x Programa',
            body: 'O algoritmo é a ideia, a lógica dos passos. O programa é essa mesma lógica escrita numa linguagem que o computador entende, como Python ou Java. Por isso é uma boa prática pensar no algoritmo primeiro (no papel, num fluxograma ou em pseudocódigo) antes de programar: planejar a lógica evita erros e deixa a solução mais clara.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um algoritmo?',
          choices: [
            { id: 'a', text: 'Uma sequência finita e ordenada de passos para resolver um problema' },
            { id: 'b', text: 'Um tipo de computador' },
            { id: 'c', text: 'Um erro de programação' },
            { id: 'd', text: 'Um tipo de variável' }
          ],
          answer: 'a',
          explanation: 'Um algoritmo descreve, passo a passo e em ordem, como resolver um problema — não é um objeto físico nem um erro.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual das opções abaixo é um exemplo de algoritmo do dia a dia?',
          choices: [
            { id: 'a', text: 'Uma receita de bolo' },
            { id: 'b', text: 'A cor de uma parede' },
            { id: 'c', text: 'O nome de uma pessoa' },
            { id: 'd', text: 'Um número aleatório' }
          ],
          answer: 'a',
          explanation: 'Uma receita tem passos ordenados (misturar, assar, esperar) — é um algoritmo, mesmo sem envolver computador.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que a ORDEM dos passos de um algoritmo é importante?',
          choices: [
            { id: 'a', text: 'Porque executar os passos fora de ordem pode levar a um resultado errado' },
            { id: 'b', text: 'A ordem nunca importa' },
            { id: 'c', text: 'Só importa em algoritmos matemáticos' },
            { id: 'd', text: 'Porque o computador escolhe a ordem sozinho' }
          ],
          answer: 'a',
          explanation: 'Trocar a ordem (ex: assar antes de misturar os ingredientes) muda o resultado — por isso a sequência importa.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete: um algoritmo precisa ter um número ___ de passos (não pode ser infinito).',
          code: 'Um algoritmo é uma sequência ___ de passos.',
          accept: ['finita'],
          explanation: 'Um algoritmo precisa terminar em algum momento — uma sequência infinita de passos nunca chegaria a um resultado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a diferença entre um algoritmo e um programa de computador?',
          choices: [
            { id: 'a', text: 'O algoritmo é a ideia/sequência de passos; o programa é essa ideia escrita numa linguagem que o computador entende' },
            { id: 'b', text: 'São exatamente a mesma coisa, sem diferença nenhuma' },
            { id: 'c', text: 'Um algoritmo só existe dentro do computador' },
            { id: 'd', text: 'Um programa é sempre mais simples que um algoritmo' }
          ],
          answer: 'a',
          explanation: 'O algoritmo é a lógica; o programa é essa lógica traduzida para uma linguagem específica (Python, Java, etc.).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual das opções NÃO é uma característica essencial de um bom algoritmo?',
          choices: [
            { id: 'a', text: 'Ser claro e sem ambiguidade' },
            { id: 'b', text: 'Ter um número finito de passos' },
            { id: 'c', text: 'Ser escrito numa cor de fonte específica' },
            { id: 'd', text: 'Terminar em algum momento' }
          ],
          answer: 'c',
          explanation: 'Cor de fonte é só formatação visual — não afeta se o algoritmo está correto ou não.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Antes de programar, por que é útil pensar no algoritmo primeiro?',
          choices: [
            { id: 'a', text: 'Planejar a lógica antes ajuda a evitar erros e deixa a solução mais clara antes de escrever código' },
            { id: 'b', text: 'Não é útil — deve-se sempre programar direto, sem planejar' },
            { id: 'c', text: 'Só é útil para quem já programa há anos' },
            { id: 'd', text: 'Porque o computador exige isso como regra de sintaxe' }
          ],
          answer: 'a',
          explanation: 'Planejar o algoritmo antes (num papel, fluxograma ou pseudocódigo) evita retrabalho na hora de programar.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: antes de programar, é uma boa prática planejar o ___ primeiro.',
          code: 'Antes de programar, é uma boa prática planejar o ___ primeiro.',
          accept: ['algoritmo'],
          explanation: 'Planejar o algoritmo (a lógica) antes de escrever código numa linguagem específica ajuda a evitar erros.'
        }
      ]
    },
    {
      id: 'logica-02-fluxogramas',
      title: 'Fluxogramas',
      goal: 'Reconhecer os símbolos básicos de um fluxograma e como ler o fluxo de um algoritmo.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é um fluxograma?',
            body: 'Um fluxograma representa um algoritmo visualmente, com símbolos ligados por setas. Cada símbolo tem um significado específico — vamos ver os 4 mais usados, um de cada vez.',
            code: 'INÍCIO -> LEIA nota -> nota >= 7? -> (SIM) "aprovado" / (NÃO) "reprovado" -> FIM'
          },
          {
            title: 'Início e fim: o oval',
            body: 'O símbolo em forma de OVAL marca onde o algoritmo começa e onde termina. Todo fluxograma tem pelo menos um oval de início e um de fim.'
          },
          {
            title: 'Processo: o retângulo',
            body: 'O símbolo em forma de RETÂNGULO representa um processo — uma ação, como um cálculo ou a atribuição de um valor a uma variável.'
          },
          {
            title: 'Decisão: o losango',
            body: 'O símbolo em forma de LOSANGO (diamante) representa uma decisão: uma pergunta cuja resposta é SIM ou NÃO. Depois de um losango, o fluxo sempre se divide em pelo menos dois caminhos possíveis, um para cada resposta.'
          },
          {
            title: 'Entrada e saída: o paralelogramo',
            body: 'O símbolo em forma de PARALELOGRAMO representa a entrada de dados (ler um valor digitado) ou a saída de dados (exibir um resultado). O mesmo símbolo serve para os dois casos.'
          },
          {
            title: 'As setas: a ordem do fluxo',
            body: 'As setas conectam os símbolos e indicam a direção — a ordem em que os passos devem ser seguidos. Sem as setas, não haveria como saber por onde o fluxo passa primeiro.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual símbolo de fluxograma representa o início ou fim de um algoritmo?',
          choices: [
            { id: 'a', text: 'Oval' },
            { id: 'b', text: 'Retângulo' },
            { id: 'c', text: 'Losango' },
            { id: 'd', text: 'Paralelogramo' }
          ],
          answer: 'a',
          explanation: 'O oval marca os pontos de início e fim do fluxograma.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual símbolo representa uma decisão (uma pergunta com respostas SIM/NÃO)?',
          choices: [
            { id: 'a', text: 'Oval' },
            { id: 'b', text: 'Retângulo' },
            { id: 'c', text: 'Losango' },
            { id: 'd', text: 'Seta' }
          ],
          answer: 'c',
          explanation: 'O losango (diamante) é o símbolo padrão para decisões/condições.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual símbolo representa um processo (uma ação, como um cálculo)?',
          choices: [
            { id: 'a', text: 'Retângulo' },
            { id: 'b', text: 'Círculo' },
            { id: 'c', text: 'Losango' },
            { id: 'd', text: 'Oval' }
          ],
          answer: 'a',
          explanation: 'O retângulo representa uma ação/processo dentro do fluxo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete: o símbolo em forma de ___ representa uma decisão no fluxograma.',
          code: 'O símbolo em forma de ___ representa uma decisão no fluxograma.',
          accept: ['losango'],
          explanation: 'O losango é reservado para pontos de decisão, onde o fluxo se divide dependendo de uma condição.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que as setas em um fluxograma indicam?',
          choices: [
            { id: 'a', text: 'A direção/ordem em que os passos devem ser seguidos' },
            { id: 'b', text: 'A cor do fluxograma' },
            { id: 'c', text: 'O tamanho do algoritmo' },
            { id: 'd', text: 'Nada — são só decoração' }
          ],
          answer: 'a',
          explanation: 'As setas conectam os símbolos e mostram o caminho que o fluxo de execução segue.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Em um fluxograma, o que geralmente acontece depois de um símbolo de decisão (losango)?',
          choices: [
            { id: 'a', text: 'O fluxo se divide em pelo menos dois caminhos possíveis (ex: SIM e NÃO)' },
            { id: 'b', text: 'O algoritmo sempre termina' },
            { id: 'c', text: 'Nada — decisões não têm saída' },
            { id: 'd', text: 'O fluxo volta automaticamente para o início' }
          ],
          answer: 'a',
          explanation: 'Uma decisão sempre abre pelo menos dois caminhos possíveis, um para cada resposta da condição.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual símbolo representa a entrada ou saída de dados (como ler um valor digitado ou exibir um resultado)?',
          choices: [
            { id: 'a', text: 'Paralelogramo' },
            { id: 'b', text: 'Retângulo' },
            { id: 'c', text: 'Oval' },
            { id: 'd', text: 'Losango' }
          ],
          answer: 'a',
          explanation: 'O paralelogramo marca pontos de entrada (leitura) ou saída (exibição) de dados.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: ler um valor digitado pelo usuário é representado pelo símbolo de entrada e ___.',
          code: 'Ler um valor digitado pelo usuário é representado pelo símbolo de entrada e ___.',
          accept: ['saída', 'saida'],
          explanation: 'O mesmo símbolo (paralelogramo) representa tanto entrada quanto saída de dados.'
        }
      ]
    },
    {
      id: 'logica-03-variaveis',
      title: 'Variáveis e tipos de dados',
      goal: 'Conhecer os três tipos de dados básicos (numérico, texto e lógico) e o que é uma variável.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é uma variável?',
            body: 'Uma variável é um espaço com um nome que guarda um valor durante a execução de um algoritmo. O símbolo <- (ou "recebe") atribui um valor à variável. Vamos conhecer os três tipos de dados mais básicos que uma variável pode guardar.',
            code: 'idade <- 25\nnome <- "Ana"\naprovado <- VERDADEIRO'
          },
          {
            title: 'Tipo numérico',
            body: 'O tipo NUMÉRICO representa números. Pode ser um número inteiro, sem casas decimais (como 25), ou um número decimal, com casas decimais (como 3.14). Números não usam aspas.'
          },
          {
            title: 'Tipo texto (cadeia de caracteres)',
            body: 'O tipo TEXTO representa palavras ou frases, sempre escritas entre aspas — por exemplo, "Maria". Mesmo que o texto contenha só números, como "42", ele continua sendo do tipo texto por causa das aspas.'
          },
          {
            title: 'Tipo lógico (booleano)',
            body: 'O tipo LÓGICO (também chamado de booleano) só tem dois valores possíveis: VERDADEIRO ou FALSO. É usado para representar respostas de sim/não e para tomar decisões.'
          },
          {
            title: 'Reatribuindo uma variável',
            body: 'Uma variável guarda só um valor por vez. Quando atribuímos um novo valor a uma variável que já tinha um valor, o valor antigo é substituído pelo novo — ele não fica guardado em nenhum lugar.'
          },
          {
            title: 'Por que dar nomes às variáveis?',
            body: 'Damos nomes às variáveis (como "idade", em vez de só o número 25 solto) para deixar o algoritmo mais legível — o nome comunica o que aquele valor representa, o que facilita entender e revisar o algoritmo depois.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma variável em um algoritmo?',
          choices: [
            { id: 'a', text: 'Um espaço com nome que guarda um valor durante a execução' },
            { id: 'b', text: 'Um tipo de erro' },
            { id: 'c', text: 'Um símbolo de fluxograma' },
            { id: 'd', text: 'Um comando que sempre repete' }
          ],
          answer: 'a',
          explanation: 'A variável guarda um valor sob um nome, para que o algoritmo possa usá-lo e alterá-lo depois.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual tipo de dado representa valores como VERDADEIRO ou FALSO?',
          choices: [
            { id: 'a', text: 'Numérico' },
            { id: 'b', text: 'Texto' },
            { id: 'c', text: 'Lógico' },
            { id: 'd', text: 'Vetor' }
          ],
          answer: 'c',
          explanation: 'O tipo lógico (também chamado booleano) só tem dois valores possíveis: VERDADEIRO ou FALSO.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual desses é um valor do tipo texto (cadeia de caracteres)?',
          choices: [
            { id: 'a', text: '"Maria"' },
            { id: 'b', text: '42' },
            { id: 'c', text: 'VERDADEIRO' },
            { id: 'd', text: '3.14' }
          ],
          answer: 'a',
          explanation: 'Valores entre aspas representam texto, mesmo que pareçam outra coisa.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete: idade <- 25 guarda um valor do tipo ___.',
          code: 'idade <- 25  # guarda um valor do tipo ___',
          accept: ['numérico', 'numerico'],
          explanation: '25 é um número inteiro, então o tipo é numérico.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece quando atribuímos um novo valor a uma variável que já tinha um valor?',
          choices: [
            { id: 'a', text: 'O valor antigo é substituído pelo novo' },
            { id: 'b', text: 'Os dois valores ficam guardados juntos' },
            { id: 'c', text: 'Sempre dá erro' },
            { id: 'd', text: 'A variável é apagada' }
          ],
          answer: 'a',
          explanation: 'Uma variável guarda só um valor por vez — atribuir de novo substitui o valor anterior.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que damos nomes às variáveis, em vez de usar só números soltos no algoritmo?',
          choices: [
            { id: 'a', text: 'Para deixar o algoritmo mais legível e fácil de entender o que cada valor representa' },
            { id: 'b', text: 'Porque o computador exige nomes aleatórios' },
            { id: 'c', text: 'Nomes não fazem diferença nenhuma' },
            { id: 'd', text: 'Só por tradição, sem motivo prático' }
          ],
          answer: 'a',
          explanation: 'Um nome como "idade" comunica o que o valor representa — muito mais claro que um número solto.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual desses é um valor do tipo numérico decimal?',
          choices: [
            { id: 'a', text: '3.14' },
            { id: 'b', text: '"3.14"' },
            { id: 'c', text: 'VERDADEIRO' },
            { id: 'd', text: 'FALSO' }
          ],
          answer: 'a',
          explanation: '3.14 sem aspas, com ponto decimal, é um valor numérico decimal.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: aprovado <- VERDADEIRO guarda um valor do tipo ___.',
          code: 'aprovado <- VERDADEIRO  # guarda um valor do tipo ___',
          accept: ['lógico', 'logico'],
          explanation: 'VERDADEIRO/FALSO são valores do tipo lógico (booleano).'
        }
      ]
    },
    {
      id: 'logica-04-entrada-saida',
      title: 'Entrada e saída de dados',
      goal: 'Usar os comandos LEIA e ESCREVA para interagir com quem usa o algoritmo.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que ler e escrever dados?',
            body: 'Um algoritmo interativo precisa RECEBER informação (entrada) de quem o usa e DEVOLVER um resultado (saída). Em pseudocódigo, existem dois comandos para isso: LEIA e ESCREVA.',
            code: 'INÍCIO\n  LEIA idade\n  ESCREVA "Sua idade é: ", idade\nFIM'
          },
          {
            title: 'O comando LEIA',
            body: 'LEIA captura um valor digitado pelo usuário e guarda numa variável. No exemplo "LEIA idade", o valor digitado é guardado na variável idade.'
          },
          {
            title: 'O comando ESCREVA',
            body: 'ESCREVA exibe uma mensagem ou o valor de uma variável na tela. No exemplo "ESCREVA \'Sua idade é: \', idade", o texto e o valor da variável idade são exibidos juntos.'
          },
          {
            title: 'A ordem natural de um algoritmo simples',
            body: 'A ordem típica é: primeiro ler a entrada (LEIA), depois processar/calcular o que for preciso, e só então escrever a saída (ESCREVA). No pseudocódigo, os comandos rodam nessa ordem — o ESCREVA só pode usar um valor depois que ele já foi lido pelo LEIA.'
          },
          {
            title: 'Nem todo algoritmo precisa de LEIA',
            body: 'O comando LEIA não é obrigatório em todo algoritmo: alguns algoritmos trabalham só com valores já fixos/definidos, sem precisar perguntar nada ao usuário.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual comando de pseudocódigo é usado para ler um valor digitado pelo usuário?',
          choices: [
            { id: 'a', text: 'LEIA' },
            { id: 'b', text: 'ESCREVA' },
            { id: 'c', text: 'SE' },
            { id: 'd', text: 'PARA' }
          ],
          answer: 'a',
          explanation: 'LEIA captura um valor de entrada e guarda numa variável.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual comando é usado para exibir um resultado na tela?',
          choices: [
            { id: 'a', text: 'LEIA' },
            { id: 'b', text: 'ESCREVA' },
            { id: 'c', text: 'ENQUANTO' },
            { id: 'd', text: 'FIM' }
          ],
          answer: 'b',
          explanation: 'ESCREVA exibe um valor ou mensagem como saída do algoritmo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No algoritmo do exemplo (INÍCIO / LEIA idade / ESCREVA / FIM), o que acontece primeiro?',
          choices: [
            { id: 'a', text: 'O algoritmo lê o valor de idade digitado pelo usuário' },
            { id: 'b', text: 'O algoritmo exibe a mensagem antes de saber a idade' },
            { id: 'c', text: 'O algoritmo termina imediatamente' },
            { id: 'd', text: 'É preciso escrever um valor fixo antes de tudo' }
          ],
          answer: 'a',
          explanation: 'Os comandos rodam em ordem: primeiro o LEIA captura o valor, só depois o ESCREVA usa esse valor.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que falta para ler o valor de idade:',
          code: 'INÍCIO\n  ___ idade\n  ESCREVA idade\nFIM',
          accept: ['LEIA'],
          explanation: 'LEIA é o comando que captura o valor digitado e guarda na variável idade.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Todo algoritmo PRECISA ter um comando de entrada (LEIA)?',
          choices: [
            { id: 'a', text: 'Não — alguns algoritmos só processam valores fixos e não precisam ler nada do usuário' },
            { id: 'b', text: 'Sim, sempre, sem exceção' },
            { id: 'c', text: 'Só em fluxogramas' },
            { id: 'd', text: 'Só quando o algoritmo usa números' }
          ],
          answer: 'a',
          explanation: 'Um algoritmo pode trabalhar só com valores já definidos, sem precisar ler nada do usuário.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual representa melhor a ordem típica de um algoritmo simples?',
          choices: [
            { id: 'a', text: 'Ler dados de entrada -> processar -> escrever a saída' },
            { id: 'b', text: 'Escrever a saída -> processar -> ler a entrada' },
            { id: 'c', text: 'Só processar, sem entrada nem saída' },
            { id: 'd', text: 'A ordem nunca importa' }
          ],
          answer: 'a',
          explanation: 'É natural primeiro coletar os dados, depois processá-los, e só então mostrar o resultado.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No pseudocódigo, o que os marcadores INÍCIO e FIM indicam?',
          choices: [
            { id: 'a', text: 'O começo e o fim da execução do algoritmo' },
            { id: 'b', text: 'Uma decisão lógica' },
            { id: 'c', text: 'Um tipo de variável' },
            { id: 'd', text: 'Um comando de repetição' }
          ],
          answer: 'a',
          explanation: 'INÍCIO e FIM delimitam onde o algoritmo começa e termina, igual ao oval do fluxograma.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que falta para exibir a nota:',
          code: 'INÍCIO\n  LEIA nota\n  ___ "Sua nota é: ", nota\nFIM',
          accept: ['ESCREVA'],
          explanation: 'ESCREVA exibe o texto e o valor da variável nota juntos.'
        }
      ]
    },
    {
      id: 'logica-05-operadores',
      title: 'Operadores aritméticos e relacionais',
      goal: 'Fazer cálculos e comparações em pseudocódigo.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Operadores aritméticos',
            body: 'Operadores aritméticos fazem cálculos com números: + (soma), - (subtração), * (multiplicação) e / (divisão). Por exemplo, 5 + 3 resulta em 8.',
            code: 'soma <- 5 + 3        # 8\ndiferenca <- 10 - 4  # 6\nproduto <- 3 * 2     # 6\ndivisao <- 20 / 4    # 5'
          },
          {
            title: 'Operadores relacionais',
            body: 'Operadores relacionais comparam dois valores e o resultado é SEMPRE um valor lógico: VERDADEIRO ou FALSO. Os principais são: = (igual), <> (diferente), > (maior), < (menor), >= (maior ou igual) e <= (menor ou igual).'
          },
          {
            title: 'Exemplos de comparações',
            body: 'Veja como cada operador relacional se comporta na prática: 10 > 7 resulta em VERDADEIRO (10 é maior que 7); 5 = 5 resulta em VERDADEIRO (são iguais); 8 <= 8 resulta em VERDADEIRO (<= inclui a igualdade); e 8 <> 8 resulta em FALSO (não são diferentes).',
            code: '10 > 7   # VERDADEIRO\n5 = 5    # VERDADEIRO\n8 <= 8   # VERDADEIRO\n8 <> 8   # FALSO'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o operador relacional > faz?',
          choices: [
            { id: 'a', text: 'Compara se um valor é maior que o outro' },
            { id: 'b', text: 'Soma dois valores' },
            { id: 'c', text: 'Atribui um valor a uma variável' },
            { id: 'd', text: 'Repete um bloco' }
          ],
          answer: 'a',
          explanation: '> é um operador relacional: compara dois valores e resulta em VERDADEIRO ou FALSO.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual o resultado da expressão (10 > 7)?',
          choices: [
            { id: 'a', text: 'VERDADEIRO' },
            { id: 'b', text: 'FALSO' },
            { id: 'c', text: '10' },
            { id: 'd', text: '7' }
          ],
          answer: 'a',
          explanation: '10 é de fato maior que 7, então a comparação resulta em VERDADEIRO.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual operador é usado para verificar se dois valores são DIFERENTES em pseudocódigo?',
          choices: [
            { id: 'a', text: '<>' },
            { id: 'b', text: '==' },
            { id: 'c', text: '=' },
            { id: 'd', text: '!' }
          ],
          answer: 'a',
          explanation: '<> é a convenção comum de pseudocódigo para "diferente de".'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o operador aritmético que soma os dois valores:',
          code: 'soma <- 5 ___ 3  # resultado: 8',
          accept: ['+'],
          explanation: '+ é o operador de soma.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual o resultado de (5 = 5)?',
          choices: [
            { id: 'a', text: 'VERDADEIRO' },
            { id: 'b', text: 'FALSO' },
            { id: 'c', text: '10' },
            { id: 'd', text: 'erro' }
          ],
          answer: 'a',
          explanation: '5 é igual a 5, então a comparação resulta em VERDADEIRO.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Operadores relacionais sempre resultam em qual tipo de valor?',
          choices: [
            { id: 'a', text: 'Lógico (VERDADEIRO ou FALSO)' },
            { id: 'b', text: 'Numérico' },
            { id: 'c', text: 'Texto' },
            { id: 'd', text: 'Depende da linguagem' }
          ],
          answer: 'a',
          explanation: 'Toda comparação (=, <>, >, <, >=, <=) resulta num valor lógico.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual o resultado de (8 <= 8)?',
          choices: [
            { id: 'a', text: 'VERDADEIRO' },
            { id: 'b', text: 'FALSO' },
            { id: 'c', text: '0' },
            { id: 'd', text: 'erro' }
          ],
          answer: 'a',
          explanation: '<= inclui a igualdade — 8 é menor ou igual a 8, então é VERDADEIRO.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador aritmético que divide os dois valores:',
          code: 'resultado <- 20 ___ 4  # divide 20 por 4, resultado: 5',
          accept: ['/'],
          explanation: '/ é o operador de divisão.'
        }
      ]
    },
    {
      id: 'logica-06-expressoes',
      title: 'Expressões lógicas',
      goal: 'Combinar valores lógicos com os operadores E, OU e NÃO.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Operador E (AND)',
            body: 'O operador E combina dois valores lógicos e só resulta em VERDADEIRO quando OS DOIS lados são VERDADEIRO. Se qualquer um dos dois for FALSO, o resultado é FALSO.',
            code: 'VERDADEIRO E VERDADEIRO  # VERDADEIRO\nVERDADEIRO E FALSO       # FALSO\nFALSO E FALSO            # FALSO'
          },
          {
            title: 'Operador OU (OR)',
            body: 'O operador OU combina dois valores lógicos e resulta em VERDADEIRO quando PELO MENOS UM dos dois lados é VERDADEIRO. Só resulta em FALSO quando os dois lados são FALSO.',
            code: 'VERDADEIRO OU FALSO  # VERDADEIRO\nFALSO OU FALSO       # FALSO'
          },
          {
            title: 'Operador NÃO (NOT)',
            body: 'O operador NÃO trabalha sozinho, com um único valor, e INVERTE esse valor: VERDADEIRO vira FALSO, e FALSO vira VERDADEIRO.',
            code: 'NÃO VERDADEIRO  # FALSO\nNÃO FALSO       # VERDADEIRO'
          },
          {
            title: 'Juntando tudo: expressões compostas',
            body: 'Podemos combinar E, OU e NÃO para representar situações do mundo real. Por exemplo: "pode_dirigir <- tem_carteira E maior_idade" só é VERDADEIRO se as duas condições forem verdadeiras ao mesmo tempo.',
            code: 'pode_dirigir <- tem_carteira E maior_idade\npode_entrar <- tem_ingresso OU eh_convidado'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quando o operador E resulta em VERDADEIRO?',
          choices: [
            { id: 'a', text: 'Só quando os dois valores envolvidos são VERDADEIRO' },
            { id: 'b', text: 'Quando pelo menos um dos valores é VERDADEIRO' },
            { id: 'c', text: 'Sempre' },
            { id: 'd', text: 'Nunca' }
          ],
          answer: 'a',
          explanation: 'E exige que ambos os lados sejam VERDADEIRO para o resultado ser VERDADEIRO.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quando o operador OU resulta em VERDADEIRO?',
          choices: [
            { id: 'a', text: 'Só quando os dois valores são VERDADEIRO' },
            { id: 'b', text: 'Quando pelo menos um dos valores é VERDADEIRO' },
            { id: 'c', text: 'Nunca' },
            { id: 'd', text: 'Só quando os dois são FALSO' }
          ],
          answer: 'b',
          explanation: 'Basta um dos lados ser VERDADEIRO para o OU resultar em VERDADEIRO.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o operador NÃO faz com um valor lógico?',
          choices: [
            { id: 'a', text: 'Inverte o valor (VERDADEIRO vira FALSO e vice-versa)' },
            { id: 'b', text: 'Soma dois valores' },
            { id: 'c', text: 'Sempre resulta em VERDADEIRO' },
            { id: 'd', text: 'Não faz nada' }
          ],
          answer: 'a',
          explanation: 'NÃO inverte: VERDADEIRO vira FALSO, e FALSO vira VERDADEIRO.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o operador lógico "ou":',
          code: 'pode_entrar <- tem_ingresso ___ eh_convidado',
          accept: ['OU'],
          explanation: 'OU é o operador lógico usado quando basta uma das condições ser verdadeira.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual o resultado de VERDADEIRO E FALSO?',
          choices: [
            { id: 'a', text: 'FALSO' },
            { id: 'b', text: 'VERDADEIRO' },
            { id: 'c', text: 'Depende' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: 'E exige que os dois lados sejam VERDADEIRO — como um deles é FALSO, o resultado é FALSO.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual o resultado de NÃO(VERDADEIRO)?',
          choices: [
            { id: 'a', text: 'FALSO' },
            { id: 'b', text: 'VERDADEIRO' },
            { id: 'c', text: '0' },
            { id: 'd', text: 'erro' }
          ],
          answer: 'a',
          explanation: 'NÃO inverte o valor: o oposto de VERDADEIRO é FALSO.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual o resultado de FALSO OU FALSO?',
          choices: [
            { id: 'a', text: 'FALSO' },
            { id: 'b', text: 'VERDADEIRO' },
            { id: 'c', text: 'Depende' },
            { id: 'd', text: 'erro' }
          ],
          answer: 'a',
          explanation: 'OU só é VERDADEIRO se pelo menos um lado for VERDADEIRO — aqui os dois são FALSO.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador lógico que inverte o valor de reprovado:',
          code: 'aprovado <- ___ reprovado  # inverte o valor lógico',
          accept: ['NÃO', 'NAO'],
          explanation: 'NÃO inverte o valor lógico da variável reprovado.'
        }
      ]
    },
    {
      id: 'logica-07-decisao',
      title: 'Estruturas condicionais',
      goal: 'Usar SE-ENTÃO-SENÃO para que o algoritmo tome decisões diferentes dependendo de uma condição.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que um algoritmo precisa tomar decisões?',
            body: 'Até agora, todo algoritmo que vimos executa os mesmos passos, na mesma ordem, sempre. Mas muitos problemas exigem que o algoritmo reaja de forma diferente dependendo da situação — por exemplo, mostrar "aprovado" ou "reprovado" dependendo da nota. É para isso que existem as estruturas condicionais.'
          },
          {
            title: 'A estrutura SE-ENTÃO',
            body: 'SE testa uma condição; se ela for VERDADEIRA, o bloco depois de ENTÃO é executado. FIM SE marca onde a estrutura termina. No exemplo, se idade for maior ou igual a 18, o algoritmo escreve "maior de idade".',
            code: 'SE idade >= 18 ENTÃO\n  ESCREVA "maior de idade"\nFIM SE'
          },
          {
            title: 'O bloco SENÃO',
            body: 'SENÃO define o que fazer quando a condição do SE é FALSA. Ele é opcional: sem SENÃO, se a condição for falsa, o algoritmo simplesmente não faz nada e segue em frente.',
            code: 'SE idade >= 18 ENTÃO\n  ESCREVA "maior de idade"\nSENÃO\n  ESCREVA "menor de idade"\nFIM SE'
          },
          {
            title: 'Decisões encadeadas: SENÃO SE',
            body: 'Quando é preciso testar MAIS de duas possibilidades em sequência, encadeamos SENÃO SE. O algoritmo testa cada condição na ordem, e executa o bloco da primeira que for verdadeira.',
            code: 'SE nota >= 9 ENTÃO\n  ESCREVA "excelente"\nSENÃO SE nota >= 7 ENTÃO\n  ESCREVA "bom"\nSENÃO\n  ESCREVA "insuficiente"\nFIM SE'
          },
          {
            title: 'Decisões dentro de decisões',
            body: 'Também é possível colocar um SE inteiro dentro do bloco de outro SE (uma decisão "aninhada") — útil quando um segundo critério só faz sentido depois que o primeiro já foi satisfeito.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a estrutura SE-ENTÃO-SENÃO permite que um algoritmo faça?',
          choices: [
            { id: 'a', text: 'Tomar decisões, executando um bloco ou outro dependendo de uma condição' },
            { id: 'b', text: 'Repetir um bloco várias vezes' },
            { id: 'c', text: 'Ler um valor do usuário' },
            { id: 'd', text: 'Definir uma variável' }
          ],
          answer: 'a',
          explanation: 'SE-ENTÃO-SENÃO é a estrutura de decisão: escolhe um caminho baseado numa condição.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'No exemplo do pseudocódigo, o que é impresso se idade for 15?',
          code: 'SE idade >= 18 ENTÃO\n  ESCREVA "maior de idade"\nSENÃO\n  ESCREVA "menor de idade"\nFIM SE',
          choices: [
            { id: 'a', text: '"menor de idade"' },
            { id: 'b', text: '"maior de idade"' },
            { id: 'c', text: 'Nada é impresso' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: '15 não é >= 18, então a condição é falsa e o bloco SENÃO é executado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O bloco SENÃO é executado quando:',
          choices: [
            { id: 'a', text: 'A condição do SE é falsa' },
            { id: 'b', text: 'A condição do SE é verdadeira' },
            { id: 'c', text: 'Sempre, independente da condição' },
            { id: 'd', text: 'Nunca é executado' }
          ],
          answer: 'a',
          explanation: 'SENÃO cobre exatamente o caso em que a condição do SE não foi satisfeita.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que inicia o bloco alternativo:',
          code: 'SE nota >= 7 ENTÃO\n  ESCREVA "aprovado"\n___\n  ESCREVA "reprovado"\nFIM SE',
          accept: ['SENÃO', 'SENAO'],
          explanation: 'SENÃO cobre o caso em que a condição do SE foi falsa.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'É obrigatório todo SE ter um SENÃO?',
          choices: [
            { id: 'a', text: 'Não — o SENÃO é opcional; sem ele, nada acontece se a condição for falsa' },
            { id: 'b', text: 'Sim, sempre obrigatório' },
            { id: 'c', text: 'Só em fluxogramas' },
            { id: 'd', text: 'Só quando há números envolvidos' }
          ],
          answer: 'a',
          explanation: 'Um SE sozinho, sem SENÃO, simplesmente não faz nada quando a condição é falsa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'É possível ter um SE dentro de outro SE (decisão aninhada)?',
          choices: [
            { id: 'a', text: 'Sim, é possível encadear decisões dentro de outras decisões' },
            { id: 'b', text: 'Não, isso nunca é permitido' },
            { id: 'c', text: 'Só é permitido uma vez' },
            { id: 'd', text: 'Só em algoritmos matemáticos' }
          ],
          answer: 'a',
          explanation: 'Decisões podem ser aninhadas para tratar casos mais específicos dentro de um caso mais geral.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual estrutura testa MÚLTIPLAS condições em sequência (ex: nota >= 9 "excelente", nota >= 7 "bom", senão "insuficiente")?',
          choices: [
            { id: 'a', text: 'SE-SENÃO SE (decisões encadeadas)' },
            { id: 'b', text: 'Um único SE sem SENÃO' },
            { id: 'c', text: 'ENQUANTO' },
            { id: 'd', text: 'LEIA' }
          ],
          answer: 'a',
          explanation: 'Encadear SENÃO SE permite testar várias condições em sequência, uma depois da outra.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta depois da condição:',
          code: 'SE nota >= 9 ___\n  ESCREVA "excelente"\nSENÃO SE nota >= 7 ENTÃO\n  ESCREVA "bom"\nFIM SE',
          accept: ['ENTÃO', 'ENTAO'],
          explanation: 'ENTÃO sempre vem depois da condição de um SE, antes do bloco a ser executado.'
        }
      ]
    },
    {
      id: 'logica-08-repeticao',
      title: 'Estruturas de repetição',
      goal: 'Usar ENQUANTO e PARA para repetir ações, com contadores e acumuladores, evitando laços infinitos.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que repetir passos?',
            body: 'Imagine escrever "ESCREVA i" cinco vezes, uma para cada número de 1 a 5 — funciona, mas não escalaria para 1000 números. Estruturas de repetição (também chamadas de laços) executam um bloco de comandos várias vezes, sem precisar repetir o código manualmente.'
          },
          {
            title: 'A estrutura ENQUANTO',
            body: 'ENQUANTO testa uma condição ANTES de cada repetição, e continua repetindo enquanto ela for VERDADEIRA. Assim que a condição se torna FALSA, o laço para.',
            code: 'contador <- 0\nENQUANTO contador < 5 FAÇA\n  contador <- contador + 1\nFIM ENQUANTO'
          },
          {
            title: 'A estrutura PARA',
            body: 'PARA é usado quando já sabemos exatamente quantas vezes repetir. "PARA i DE 1 ATÉ 5 FAÇA" repete o bloco 5 vezes, com i assumindo os valores 1, 2, 3, 4 e 5, um em cada repetição.',
            code: 'PARA i DE 1 ATÉ 5 FAÇA\n  ESCREVA i\nFIM PARA'
          },
          {
            title: 'Contadores',
            body: 'Um contador é uma variável que aumenta (ou diminui) a cada repetição, geralmente para controlar quantas vezes o laço já rodou. No exemplo do ENQUANTO acima, "contador" é exatamente isso.'
          },
          {
            title: 'Acumuladores',
            body: 'Um acumulador é uma variável que guarda um total que vai crescendo a cada repetição — por exemplo, somando um valor novo em cada volta do laço. É assim que somamos os números de 1 a 5 num laço: soma <- soma + i, repetido a cada volta.',
            code: 'soma <- 0\nPARA i DE 1 ATÉ 5 FAÇA\n  soma <- soma + i\nFIM PARA\n# soma = 15'
          },
          {
            title: 'Cuidado com laços infinitos',
            body: 'Se a condição de um ENQUANTO nunca se tornar FALSA, o laço nunca para — isso é um laço infinito, um erro comum. Por isso é essencial que algo dentro do laço (como um contador sendo incrementado) eventualmente faça a condição virar falsa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual estrutura repete um bloco enquanto uma condição for verdadeira?',
          choices: [
            { id: 'a', text: 'ENQUANTO' },
            { id: 'b', text: 'SE' },
            { id: 'c', text: 'PARA-CADA-SEMPRE' },
            { id: 'd', text: 'LEIA' }
          ],
          answer: 'a',
          explanation: 'ENQUANTO testa a condição antes de cada repetição e continua enquanto ela for verdadeira.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual estrutura é mais indicada quando já sabemos exatamente quantas vezes repetir?',
          choices: [
            { id: 'a', text: 'PARA' },
            { id: 'b', text: 'SE' },
            { id: 'c', text: 'ENQUANTO VERDADEIRO' },
            { id: 'd', text: 'ESCREVA' }
          ],
          answer: 'a',
          explanation: 'PARA é ideal quando o número de repetições já é conhecido de antemão (ex: de 1 até 5).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No exemplo da introdução, qual o valor final de soma?',
          code: 'soma <- 0\nPARA i DE 1 ATÉ 5 FAÇA\n  soma <- soma + i\nFIM PARA',
          choices: [
            { id: 'a', text: '15' },
            { id: 'b', text: '5' },
            { id: 'c', text: '10' },
            { id: 'd', text: '0' }
          ],
          answer: 'a',
          explanation: 'soma acumula 1+2+3+4+5, que resulta em 15.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que encerra o bloco de repetição:',
          code: 'contador <- 0\nENQUANTO contador < 5 FAÇA\n  contador <- contador + 1\nFIM ___',
          accept: ['ENQUANTO'],
          explanation: 'Todo ENQUANTO precisa ser fechado com "FIM ENQUANTO".'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é um "acumulador" em um algoritmo com repetição?',
          choices: [
            { id: 'a', text: 'Uma variável que guarda um total que vai crescendo a cada repetição (ex: uma soma)' },
            { id: 'b', text: 'Um tipo de decisão' },
            { id: 'c', text: 'Um símbolo de fluxograma' },
            { id: 'd', text: 'Um comando de entrada' }
          ],
          answer: 'a',
          explanation: 'O acumulador (como "soma") guarda um valor que é atualizado a cada volta do laço.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece se a condição de um ENQUANTO nunca se tornar falsa?',
          choices: [
            { id: 'a', text: 'O algoritmo entra em um laço infinito, repetindo para sempre' },
            { id: 'b', text: 'O algoritmo para automaticamente depois de 10 vezes' },
            { id: 'c', text: 'Dá erro de sintaxe' },
            { id: 'd', text: 'O laço é ignorado' }
          ],
          answer: 'a',
          explanation: 'Sem uma condição que se torne falsa em algum momento, o ENQUANTO nunca para sozinho.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No pseudocódigo "PARA i DE 1 ATÉ 3 FAÇA", quantas vezes o bloco é executado?',
          choices: [
            { id: 'a', text: '3' },
            { id: 'b', text: '2' },
            { id: 'c', text: '4' },
            { id: 'd', text: 'infinitas' }
          ],
          answer: 'a',
          explanation: 'i assume os valores 1, 2 e 3 — três repetições.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta antes do bloco a ser repetido:',
          code: 'soma <- 0\nPARA i DE 1 ATÉ 10 ___\n  soma <- soma + i\nFIM PARA',
          accept: ['FAÇA', 'FACA'],
          explanation: 'FAÇA introduz o bloco de comandos que será repetido a cada volta do PARA.'
        }
      ]
    }
  ]
};
