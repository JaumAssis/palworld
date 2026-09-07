// Módulo "Estruturas de Dados e Subalgoritmos" (intermediário) — 9 lições, 8 questões cada (3
// múltipla escolha + 1 lacuna, duas vezes por lição). Independente de linguagem: pseudocódigo
// genérico, não Python. Ver ../../index.js para o formato e a validação de boot, e
// ./01-fundamentos.js para os pré-requisitos (variáveis, laços, decisões) que este módulo assume.
// Os ids das lições não seguem mais a numeração 09-14 em sequência estrita (registros/recursividade/
// seleção-inserção foram inseridos depois, entre lições já numeradas) — a ORDEM real é a posição no
// array `lessons` abaixo, não o número no id (que é só um identificador estável, não semântico).
module.exports = {
  id: 'estruturas-logica',
  levelKey: 'intermediate',
  order: 2,
  title: 'Estruturas de Dados e Subalgoritmos',
  subtitle: 'Vetores, matrizes, registros, funções, recursividade, strings, busca e ordenação',
  accent: '#38bdf8',
  lessons: [
    {
      id: 'logica-09-vetores',
      title: 'Vetores',
      goal: 'Entender o conceito de vetor, acessar por índice e percorrer com um laço.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é um vetor?',
            body: 'Um vetor é uma coleção de valores do mesmo tipo, guardados em sequência e acessados por um índice numérico. Diferente de várias variáveis soltas (nota1, nota2, nota3...), um vetor guarda muitos valores relacionados sob um único nome.'
          },
          {
            title: 'Declarando e acessando um vetor',
            body: 'O índice de um vetor começa em 0. Em notas <- [7, 8, 5, 9], notas[0] é o primeiro valor (7), notas[1] é o segundo (8), e assim por diante.',
            code: 'notas <- [7, 8, 5, 9]\nESCREVA notas[0]  # 7\nESCREVA notas[1]  # 8'
          },
          {
            title: 'Percorrendo um vetor com um laço',
            body: 'Para acessar TODOS os valores de um vetor, usamos um laço que varia o índice do início ao fim. PARA i DE 0 ATÉ 3 FAÇA percorre as 4 posições de um vetor com 4 elementos (índices 0 a 3).',
            code: 'PARA i DE 0 ATÉ 3 FAÇA\n  ESCREVA notas[i]\nFIM PARA'
          },
          {
            title: 'Alterando um valor do vetor',
            body: 'Podemos atribuir um novo valor a uma posição específica do vetor: notas[2] <- 10 substitui o terceiro valor (índice 2) por 10, sem afetar as outras posições.'
          },
          {
            title: 'Erros comuns: índice fora dos limites',
            body: 'Tentar acessar uma posição que não existe (como notas[10] num vetor de 4 posições, índices 0 a 3) causa um erro de índice fora dos limites. É preciso sempre respeitar o tamanho real do vetor.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um vetor?',
          choices: [
            { id: 'a', text: 'Uma coleção de valores do mesmo tipo, guardados em sequência e acessados por índice' },
            { id: 'b', text: 'Um tipo de decisão' },
            { id: 'c', text: 'Um símbolo de fluxograma' },
            { id: 'd', text: 'Um único valor guardado numa variável' }
          ],
          answer: 'a',
          explanation: 'Um vetor guarda vários valores relacionados, cada um numa posição própria, acessada por índice.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Dado notas <- [7, 8, 5, 9], qual o valor de notas[0]?',
          choices: [
            { id: 'a', text: '7' },
            { id: 'b', text: '8' },
            { id: 'c', text: '9' },
            { id: 'd', text: 'Erro — o índice começa em 1' }
          ],
          answer: 'a',
          explanation: 'O índice começa em 0, então notas[0] é o primeiro valor: 7.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual estrutura usamos tipicamente para percorrer todas as posições de um vetor?',
          choices: [
            { id: 'a', text: 'Um laço (PARA ou ENQUANTO), variando o índice' },
            { id: 'b', text: 'Um único SE' },
            { id: 'c', text: 'Só o comando LEIA' },
            { id: 'd', text: 'Não é possível percorrer um vetor' }
          ],
          answer: 'a',
          explanation: 'Um laço evita repetir manualmente o mesmo comando para cada posição do vetor.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o índice que acessa o terceiro valor do vetor (índice começando em 0):',
          code: 'notas <- [7, 8, 5, 9]\nESCREVA notas[___]  # acessa o terceiro valor (5)',
          accept: ['2'],
          explanation: 'Com índice começando em 0, o terceiro valor está na posição 2.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Como alterar o valor guardado na posição 2 de um vetor chamado notas?',
          choices: [
            { id: 'a', text: 'notas[2] <- novo_valor' },
            { id: 'b', text: 'notas <- novo_valor[2]' },
            { id: 'c', text: '2 <- notas[novo_valor]' },
            { id: 'd', text: 'Não é possível alterar um valor depois de criado' }
          ],
          answer: 'a',
          explanation: 'Atribuímos um novo valor diretamente à posição indicada entre colchetes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece ao tentar acessar notas[10] num vetor de 4 posições (índices 0 a 3)?',
          choices: [
            { id: 'a', text: 'Um erro de índice fora dos limites' },
            { id: 'b', text: 'Devolve 0 automaticamente' },
            { id: 'c', text: 'Cria a posição automaticamente' },
            { id: 'd', text: 'Nada acontece' }
          ],
          answer: 'a',
          explanation: 'Acessar um índice além do tamanho do vetor é um erro comum, conhecido como estouro de índice.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a vantagem de um vetor sobre usar variáveis separadas (nota1, nota2, nota3...)?',
          choices: [
            { id: 'a', text: 'Permite guardar e processar muitos valores relacionados com laços, sem repetir código para cada um' },
            { id: 'b', text: 'Não existe vantagem nenhuma' },
            { id: 'c', text: 'Vetores só funcionam com texto' },
            { id: 'd', text: 'Vetores sempre ocupam menos memória, independente do tamanho' }
          ],
          answer: 'a',
          explanation: 'Com um vetor, um único laço processa qualquer quantidade de valores.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta para percorrer o vetor inteiro:',
          code: 'PARA i DE 0 ATÉ 3 ___\n  ESCREVA notas[i]\nFIM PARA',
          accept: ['FAÇA', 'FACA'],
          explanation: 'FAÇA introduz o bloco de comandos repetido a cada volta do PARA.'
        }
      ]
    },
    {
      id: 'logica-10-matrizes',
      title: 'Matrizes',
      goal: 'Entender matrizes como vetores de duas dimensões e percorrê-las com laços aninhados.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é uma matriz?',
            body: 'Uma matriz é como um vetor de DUAS dimensões: organiza valores em linhas e colunas, como uma tabela. Cada posição é acessada por dois índices — um para a linha, outro para a coluna.'
          },
          {
            title: 'Declarando e acessando uma matriz',
            body: 'Em tabuleiro <- [[1,2,3],[4,5,6]], tabuleiro[0][0] é 1 (linha 0, coluna 0); tabuleiro[1][2] é 6 (linha 1, coluna 2).',
            code: 'tabuleiro <- [[1, 2, 3], [4, 5, 6]]\nESCREVA tabuleiro[0][0]  # 1\nESCREVA tabuleiro[1][2]  # 6'
          },
          {
            title: 'Percorrendo uma matriz com laços aninhados',
            body: 'Para visitar TODAS as posições, usamos um laço PARA dentro de outro laço PARA: o de fora percorre as linhas, o de dentro percorre as colunas de cada linha.',
            code: 'PARA linha DE 0 ATÉ 1 FAÇA\n  PARA coluna DE 0 ATÉ 2 FAÇA\n    ESCREVA tabuleiro[linha][coluna]\n  FIM PARA\nFIM PARA'
          },
          {
            title: 'Onde matrizes são usadas',
            body: 'Tabuleiros de jogos, planilhas e imagens (cada pixel é uma posição) são exemplos comuns de dados que naturalmente se organizam em linhas e colunas — por isso são representados como matrizes.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma matriz, comparada a um vetor?',
          choices: [
            { id: 'a', text: 'É como um vetor de duas dimensões, organizado em linhas e colunas' },
            { id: 'b', text: 'É exatamente igual a um vetor comum' },
            { id: 'c', text: 'Só existe em fluxogramas' },
            { id: 'd', text: 'É um tipo de variável lógica' }
          ],
          answer: 'a',
          explanation: 'A matriz acrescenta uma segunda dimensão (colunas) ao conceito de vetor.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quantos índices são necessários para acessar uma posição de uma matriz?',
          choices: [
            { id: 'a', text: 'Dois (linha e coluna)' },
            { id: 'b', text: 'Um' },
            { id: 'c', text: 'Três' },
            { id: 'd', text: 'Nenhum, acessa direto' }
          ],
          answer: 'a',
          explanation: 'Uma posição na matriz precisa da linha E da coluna para ser identificada.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Dado tabuleiro <- [[1,2,3],[4,5,6]], qual o valor de tabuleiro[1][2]?',
          choices: [
            { id: 'a', text: '6' },
            { id: 'b', text: '3' },
            { id: 'c', text: '4' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: 'Linha 1 é [4,5,6]; a coluna 2 dessa linha (índice 2) é 6.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o índice de linha que falta para acessar o valor 4:',
          code: 'ESCREVA tabuleiro[___][0]  # acessa o valor 4 (linha 1, coluna 0)',
          accept: ['1'],
          explanation: 'O valor 4 está na segunda linha, que tem índice 1.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual estrutura é usada para percorrer TODAS as posições de uma matriz?',
          choices: [
            { id: 'a', text: 'Um laço PARA dentro de outro laço PARA (laços aninhados)' },
            { id: 'b', text: 'Um único SE' },
            { id: 'c', text: 'Só o comando LEIA' },
            { id: 'd', text: 'Não é possível percorrer uma matriz inteira' }
          ],
          answer: 'a',
          explanation: 'Um laço percorre as linhas; dentro dele, outro laço percorre as colunas de cada linha.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Numa matriz percorrida com laços aninhados, o que o laço de FORA geralmente controla?',
          choices: [
            { id: 'a', text: 'As linhas' },
            { id: 'b', text: 'As colunas' },
            { id: 'c', text: 'O valor de cada posição' },
            { id: 'd', text: 'Nada, os dois laços fazem a mesma coisa' }
          ],
          answer: 'a',
          explanation: 'Por convenção, o laço externo varia a linha e o laço interno varia a coluna dessa linha.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual dos exemplos abaixo é um bom caso de uso para uma matriz?',
          choices: [
            { id: 'a', text: 'Um tabuleiro de jogo, organizado em linhas e colunas' },
            { id: 'b', text: 'Um único número guardado numa variável' },
            { id: 'c', text: 'Uma decisão SE-ENTÃO' },
            { id: 'd', text: 'Um comando de entrada' }
          ],
          answer: 'a',
          explanation: 'Dados naturalmente organizados em linhas e colunas são o caso de uso clássico de uma matriz.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta no laço interno (percorre as colunas):',
          code: 'PARA linha DE 0 ATÉ 1 FAÇA\n  PARA coluna DE 0 ATÉ 2 ___\n    ESCREVA tabuleiro[linha][coluna]\n  FIM PARA\nFIM PARA',
          accept: ['FAÇA', 'FACA'],
          explanation: 'Assim como o laço externo, o laço interno também precisa de FAÇA antes do bloco repetido.'
        }
      ]
    },
    {
      id: 'logica-11-registros',
      title: 'Registros',
      goal: 'Agrupar campos de tipos diferentes relacionados sob um único nome, e diferenciar de vetores.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que agrupar dados diferentes?',
            body: 'Até agora, vetores guardam vários valores do MESMO tipo (várias notas, por exemplo). Mas às vezes precisamos agrupar informações de tipos DIFERENTES que descrevem a mesma coisa — como nome (texto), idade (número) e aprovado (lógico) de uma pessoa. Para isso existe o REGISTRO.'
          },
          {
            title: 'O que é um registro?',
            body: 'Um registro agrupa vários campos, cada um com seu próprio nome e tipo, sob um nome só. Cada campo é acessado usando um ponto: registro.campo.',
            code: 'REGISTRO Pessoa\n  nome: TEXTO\n  idade: NUMÉRICO\n  aprovado: LÓGICO\nFIM REGISTRO'
          },
          {
            title: 'Criando e acessando um registro',
            body: 'Depois de definido o tipo, criamos uma variável desse tipo e acessamos cada campo com ponto.',
            code: 'aluno: Pessoa\naluno.nome <- "Ana"\naluno.idade <- 20\nESCREVA aluno.nome  # "Ana"'
          },
          {
            title: 'Registro x vetor: qual a diferença?',
            body: 'Um vetor guarda vários valores do MESMO tipo, acessados por índice numérico (vetor[0]). Um registro guarda vários campos de tipos DIFERENTES, acessados pelo nome do campo (registro.campo). São conceitos complementares, não substitutos.'
          },
          {
            title: 'Vetor de registros',
            body: 'Podemos combinar os dois conceitos: um vetor onde cada posição é um registro inteiro. Assim, alunos[0].nome acessa o nome do primeiro aluno de uma lista de alunos.',
            code: 'alunos[0].nome <- "Ana"\nalunos[1].nome <- "Bruno"'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que usamos um registro em vez de um vetor comum?',
          choices: [
            { id: 'a', text: 'Para agrupar campos de tipos diferentes relacionados (como nome, idade, aprovado) sob um nome só' },
            { id: 'b', text: 'Porque registros são sempre mais rápidos que vetores' },
            { id: 'c', text: 'Porque vetores não podem guardar texto' },
            { id: 'd', text: 'Não existe diferença nenhuma entre os dois' }
          ],
          answer: 'a',
          explanation: 'O registro existe justamente para agrupar campos de tipos diferentes que descrevem a mesma coisa.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como acessamos o campo idade de uma variável aluno do tipo registro Pessoa?',
          choices: [
            { id: 'a', text: 'aluno.idade' },
            { id: 'b', text: 'aluno[idade]' },
            { id: 'c', text: 'idade(aluno)' },
            { id: 'd', text: 'aluno->buscar(idade)' }
          ],
          answer: 'a',
          explanation: 'O ponto (.) é usado para acessar um campo específico de um registro.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a principal diferença entre um vetor e um registro?',
          choices: [
            { id: 'a', text: 'Vetor guarda valores do mesmo tipo, acessados por índice; registro guarda campos de tipos diferentes, acessados pelo nome' },
            { id: 'b', text: 'São exatamente a mesma coisa' },
            { id: 'c', text: 'Registro só pode ter um campo' },
            { id: 'd', text: 'Vetor só pode guardar números' }
          ],
          answer: 'a',
          explanation: 'Essa é a distinção central entre as duas estruturas.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o símbolo usado para acessar um campo de um registro:',
          code: 'aluno___nome <- "Ana"',
          accept: ['.'],
          explanation: 'O ponto separa o nome da variável do nome do campo que queremos acessar.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é um "vetor de registros"?',
          choices: [
            { id: 'a', text: 'Um vetor onde cada posição guarda um registro inteiro, com vários campos' },
            { id: 'b', text: 'Um registro que só tem um campo do tipo vetor' },
            { id: 'c', text: 'Uma estrutura que não existe em lógica de programação' },
            { id: 'd', text: 'Um vetor com só um elemento' }
          ],
          answer: 'a',
          explanation: 'Combina os dois conceitos: várias posições (vetor), cada uma com vários campos (registro).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Ao definir o registro Pessoa com os campos nome (texto), idade (numérico) e aprovado (lógico), quantos tipos diferentes de dados esse registro agrupa?',
          choices: [
            { id: 'a', text: 'Três (texto, numérico e lógico)' },
            { id: 'b', text: 'Um só' },
            { id: 'c', text: 'Nenhum — registros não têm tipo' },
            { id: 'd', text: 'Depende da linguagem' }
          ],
          answer: 'a',
          explanation: 'Cada campo pode ter seu próprio tipo — é justamente essa a vantagem do registro sobre o vetor.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Em alunos[0].nome, o que representa o índice 0?',
          choices: [
            { id: 'a', text: 'A posição do primeiro aluno no vetor de registros' },
            { id: 'b', text: 'O nome do campo' },
            { id: 'c', text: 'Um erro de sintaxe' },
            { id: 'd', text: 'O tipo do dado' }
          ],
          answer: 'a',
          explanation: 'O índice seleciona qual registro do vetor estamos acessando; o .nome seleciona o campo dentro dele.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o campo que falta para acessar a idade do segundo aluno (índice 1) de um vetor de registros:',
          code: 'ESCREVA alunos[1].___',
          accept: ['idade'],
          explanation: 'O campo idade é acessado pelo nome, depois do ponto.'
        }
      ]
    },
    {
      id: 'logica-12-funcoes',
      title: 'Funções e procedimentos',
      goal: 'Entender por que modularizar um algoritmo, parâmetros, retorno e escopo local x global.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que dividir um algoritmo em partes?',
            body: 'Conforme um algoritmo cresce, repetir os mesmos passos em vários lugares (como calcular uma média) deixa o código longo e difícil de manter. Um SUBALGORITMO agrupa um conjunto de passos sob um nome, para ser reaproveitado sempre que precisar, sem reescrever tudo de novo.'
          },
          {
            title: 'Procedimentos',
            body: 'Um PROCEDIMENTO executa uma sequência de ações, mas não devolve nenhum valor diretamente — por exemplo, um procedimento "exibir_mensagem" que só escreve algo na tela.',
            code: 'PROCEDIMENTO exibir_mensagem\n  ESCREVA "Olá!"\nFIM PROCEDIMENTO'
          },
          {
            title: 'Funções',
            body: 'Uma FUNÇÃO executa ações e DEVOLVE um valor através do comando RETORNE, que pode ser usado por quem a chamou. Por exemplo, uma função "media(a, b)" devolve o resultado do cálculo, pronto para ser usado.',
            code: 'FUNÇÃO media(a, b)\n  RETORNE (a + b) / 2\nFIM FUNÇÃO\n\nresultado <- media(7, 9)'
          },
          {
            title: 'Parâmetros',
            body: 'Parâmetros são os valores que entram num subalgoritmo, escritos entre parênteses no momento da chamada. Na função media(a, b), a e b são os parâmetros — na chamada media(7, 9), a recebe 7 e b recebe 9.'
          },
          {
            title: 'Escopo local x global',
            body: 'Uma variável criada DENTRO de um subalgoritmo (escopo LOCAL) só existe enquanto ele está executando, e some depois. Uma variável do algoritmo principal (escopo GLOBAL) pode ser vista de fora. Essa separação evita que subalgoritmos interfiram uns nos outros sem querer.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que dividir um algoritmo grande em subalgoritmos (funções/procedimentos)?',
          choices: [
            { id: 'a', text: 'Para reaproveitar um conjunto de passos sempre que precisar, sem repetir código' },
            { id: 'b', text: 'Para deixar o algoritmo mais lento' },
            { id: 'c', text: 'Não existe vantagem nenhuma' },
            { id: 'd', text: 'Só é possível em fluxogramas' }
          ],
          answer: 'a',
          explanation: 'Subalgoritmos evitam duplicar o mesmo conjunto de passos em vários lugares do algoritmo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a diferença entre um procedimento e uma função?',
          choices: [
            { id: 'a', text: 'A função devolve um valor com RETORNE; o procedimento não devolve valor nenhum' },
            { id: 'b', text: 'São exatamente a mesma coisa' },
            { id: 'c', text: 'Só a função pode receber parâmetros' },
            { id: 'd', text: 'Só o procedimento pode ser chamado mais de uma vez' }
          ],
          answer: 'a',
          explanation: 'Essa é a distinção central: função devolve valor, procedimento só executa ações.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Na função "FUNÇÃO media(a, b) / RETORNE (a+b)/2 / FIM FUNÇÃO", o que RETORNE faz?',
          choices: [
            { id: 'a', text: 'Devolve o valor calculado para quem chamou a função' },
            { id: 'b', text: 'Só imprime o valor na tela' },
            { id: 'c', text: 'Repete a função automaticamente' },
            { id: 'd', text: 'Não faz nada em pseudocódigo' }
          ],
          answer: 'a',
          explanation: 'RETORNE entrega o valor calculado de volta pra quem chamou a função.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que devolve um valor de dentro de uma função:',
          code: 'FUNÇÃO dobro(x)\n  ___ x * 2\nFIM FUNÇÃO',
          accept: ['RETORNE'],
          explanation: 'RETORNE é o comando que devolve o valor calculado para quem chamou a função.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que são os "parâmetros" de um subalgoritmo?',
          choices: [
            { id: 'a', text: 'Os valores que entram no subalgoritmo, escritos entre parênteses na chamada' },
            { id: 'b', text: 'O nome do subalgoritmo' },
            { id: 'c', text: 'O valor que ele sempre devolve' },
            { id: 'd', text: 'Um tipo de laço' }
          ],
          answer: 'a',
          explanation: 'Parâmetros são as entradas do subalgoritmo — os valores que ele recebe para trabalhar.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Uma variável criada DENTRO de uma função (escopo local):',
          choices: [
            { id: 'a', text: 'Só existe enquanto a função está sendo executada' },
            { id: 'b', text: 'Fica disponível pro algoritmo inteiro depois' },
            { id: 'c', text: 'Vira uma constante global' },
            { id: 'd', text: 'Causa erro sempre' }
          ],
          answer: 'a',
          explanation: 'O escopo local limita a existência da variável ao tempo de execução da função.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual das opções é uma chamada válida da função media(a, b)?',
          choices: [
            { id: 'a', text: 'resultado <- media(7, 9)' },
            { id: 'b', text: 'resultado <- media' },
            { id: 'c', text: 'media[7, 9]' },
            { id: 'd', text: 'chame media com 7 e 9' }
          ],
          answer: 'a',
          explanation: 'Chamar uma função é escrever seu nome seguido dos parênteses com os argumentos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que define um subalgoritmo que só executa ações, sem devolver valor:',
          code: '___ exibir_mensagem\n  ESCREVA "Olá!"\nFIM PROCEDIMENTO',
          accept: ['PROCEDIMENTO'],
          explanation: 'PROCEDIMENTO define um subalgoritmo que não devolve valor, diferente de uma FUNÇÃO.'
        }
      ]
    },
    {
      id: 'logica-13-recursividade',
      title: 'Recursividade',
      goal: 'Entender uma função que chama a si mesma, o caso base, e o risco de recursão sem parada.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é recursividade?',
            body: 'Recursividade é quando uma função chama A SI MESMA para resolver uma versão menor do mesmo problema. Cada chamada trabalha com uma versão um pouco mais simples do problema original, até chegar a um caso simples o bastante para resolver direto.'
          },
          {
            title: 'O caso base',
            body: 'Toda função recursiva precisa de um CASO BASE: uma condição simples que NÃO chama a função de novo, só devolve um valor direto. Sem caso base, a função chamaria a si mesma para sempre.',
            code: 'FUNÇÃO fatorial(n)\n  SE n = 0 ENTÃO\n    RETORNE 1              # caso base\n  SENÃO\n    RETORNE n * fatorial(n - 1)  # chamada recursiva\n  FIM SE\nFIM FUNÇÃO'
          },
          {
            title: 'Como o fatorial funciona passo a passo',
            body: 'fatorial(3) chama fatorial(2), que chama fatorial(1), que chama fatorial(0) — o caso base, que devolve 1 direto. Depois os resultados "sobem": 1*1=1, 2*1=2, e por fim 3*2=6.',
            code: 'fatorial(3) = 3 * fatorial(2)\n            = 3 * (2 * fatorial(1))\n            = 3 * (2 * (1 * fatorial(0)))\n            = 3 * (2 * (1 * 1)) = 6'
          },
          {
            title: 'Recursividade x repetição (laços)',
            body: 'Qualquer problema resolvido com recursividade também pode ser resolvido com um laço (ENQUANTO/PARA), e vice-versa. A recursividade costuma deixar problemas que se repetem "em camadas menores" (como o fatorial) mais claros de expressar.'
          },
          {
            title: 'Cuidado: recursão sem caso base',
            body: 'Se a função nunca chegar ao caso base (por exemplo, esquecer de diminuir n a cada chamada), ela chamaria a si mesma para sempre, até esgotar a memória do computador — um erro chamado estouro de pilha.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é recursividade?',
          choices: [
            { id: 'a', text: 'Quando uma função chama a si mesma para resolver uma versão menor do mesmo problema' },
            { id: 'b', text: 'Um tipo de laço que nunca para' },
            { id: 'c', text: 'Um símbolo de fluxograma' },
            { id: 'd', text: 'Um tipo de variável' }
          ],
          answer: 'a',
          explanation: 'A função recursiva se chama de novo, trabalhando com uma versão menor do problema original.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é o "caso base" de uma função recursiva?',
          choices: [
            { id: 'a', text: 'Uma condição simples que devolve um valor direto, sem chamar a função de novo' },
            { id: 'b', text: 'A primeira linha de qualquer função' },
            { id: 'c', text: 'Um erro que sempre acontece' },
            { id: 'd', text: 'O nome da função' }
          ],
          answer: 'a',
          explanation: 'O caso base é o que interrompe a cadeia de chamadas recursivas.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No exemplo do fatorial, o que aconteceria se esquecêssemos o caso base?',
          code: 'FUNÇÃO fatorial(n)\n  RETORNE n * fatorial(n - 1)\nFIM FUNÇÃO',
          choices: [
            { id: 'a', text: 'A função chamaria a si mesma para sempre, sem nunca parar (estouro de pilha)' },
            { id: 'b', text: 'A função funcionaria normalmente, só um pouco mais devagar' },
            { id: 'c', text: 'Dá erro de sintaxe imediatamente' },
            { id: 'd', text: 'A função devolve 0 automaticamente' }
          ],
          answer: 'a',
          explanation: 'Sem caso base, não há nada que interrompa as chamadas recursivas.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta no caso base do fatorial:',
          code: 'FUNÇÃO fatorial(n)\n  SE n = 0 ___\n    RETORNE 1\n  SENÃO\n    RETORNE n * fatorial(n - 1)\n  FIM SE\nFIM FUNÇÃO',
          accept: ['ENTÃO', 'ENTAO'],
          explanation: 'ENTÃO sempre vem depois da condição de um SE.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual o valor de fatorial(3), segundo o exemplo (fatorial(n) = n * fatorial(n-1), com fatorial(0) = 1)?',
          choices: [
            { id: 'a', text: '6' },
            { id: 'b', text: '3' },
            { id: 'c', text: '9' },
            { id: 'd', text: '1' }
          ],
          answer: 'a',
          explanation: 'fatorial(3) = 3 * 2 * 1 * 1 = 6.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Todo problema resolvido com recursividade também pode ser resolvido com:',
          choices: [
            { id: 'a', text: 'Um laço (ENQUANTO ou PARA)' },
            { id: 'b', text: 'Nada — só é possível com recursividade' },
            { id: 'c', text: 'Um vetor' },
            { id: 'd', text: 'Um registro' }
          ],
          answer: 'a',
          explanation: 'Recursividade e repetição são formas alternativas de resolver o mesmo tipo de problema.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Numa função recursiva, cada chamada geralmente trabalha com:',
          choices: [
            { id: 'a', text: 'Uma versão menor/mais simples do mesmo problema' },
            { id: 'b', text: 'Um problema completamente diferente' },
            { id: 'c', text: 'Sempre o mesmo valor de entrada, sem mudar nada' },
            { id: 'd', text: 'Um valor aleatório' }
          ],
          answer: 'a',
          explanation: 'A cada chamada, o problema fica um pouco menor, até chegar ao caso base.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: uma recursão que nunca chega ao caso base causa um erro chamado estouro de ___.',
          code: 'Uma recursão que nunca chega ao caso base causa um erro chamado estouro de ___.',
          accept: ['pilha'],
          explanation: 'Cada chamada recursiva ocupa espaço de memória (a "pilha"); sem parar, esse espaço se esgota.'
        }
      ]
    },
    {
      id: 'logica-14-strings',
      title: 'Manipulação de strings',
      goal: 'Operações básicas com texto: tamanho, concatenação e acesso a caracteres.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é uma string?',
            body: 'Uma string (cadeia de caracteres) é uma sequência de caracteres, como "Ana" ou "Python". Assim como um vetor, cada caractere tem uma posição, contada a partir de 0.'
          },
          {
            title: 'Tamanho de uma string',
            body: 'A função TAMANHO devolve quantos caracteres uma string tem. TAMANHO("Ana") devolve 3, porque "Ana" tem 3 caracteres.',
            code: 'nome <- "Ana"\nESCREVA TAMANHO(nome)  # 3'
          },
          {
            title: 'Concatenação',
            body: 'Juntar duas strings numa só é chamado de concatenação, geralmente feito com o operador + entre elas.',
            code: 'nome_completo <- "Ana" + " Silva"\n# resultado: "Ana Silva"'
          },
          {
            title: 'Acessando um caractere específico',
            body: 'Assim como um vetor, podemos acessar um caractere de uma string pela posição: nome[0] é o primeiro caractere de nome, contando a partir de 0.',
            code: 'sobrenome <- "Silva"\nESCREVA sobrenome[0]  # "S"'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma string (cadeia de caracteres)?',
          choices: [
            { id: 'a', text: 'Uma sequência de caracteres, como "Ana" ou "Python"' },
            { id: 'b', text: 'Um tipo de número decimal' },
            { id: 'c', text: 'Um valor lógico' },
            { id: 'd', text: 'Um símbolo de fluxograma' }
          ],
          answer: 'a',
          explanation: 'Uma string guarda texto — uma sequência de caracteres entre aspas.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a função TAMANHO("Ana") devolve?',
          choices: [
            { id: 'a', text: '3' },
            { id: 'b', text: '4' },
            { id: 'c', text: '"Ana"' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: '"Ana" tem 3 caracteres: A, n e a.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que significa "concatenar" duas strings?',
          choices: [
            { id: 'a', text: 'Juntar as duas strings numa só' },
            { id: 'b', text: 'Comparar se são iguais' },
            { id: 'c', text: 'Apagar uma delas' },
            { id: 'd', text: 'Contar quantos caracteres elas têm' }
          ],
          answer: 'a',
          explanation: 'Concatenar é unir o conteúdo de duas strings em uma nova string.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o operador que concatena (junta) duas strings:',
          code: 'nome_completo <- "Ana" ___ " Silva"  # resultado: "Ana Silva"',
          accept: ['+'],
          explanation: '+ é o operador usado para concatenar (juntar) strings.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Assim como um vetor, como acessamos o primeiro caractere de uma string chamada nome?',
          choices: [
            { id: 'a', text: 'nome[0]' },
            { id: 'b', text: 'nome[1]' },
            { id: 'c', text: 'nome(0)' },
            { id: 'd', text: 'nome.primeiro' }
          ],
          answer: 'a',
          explanation: 'O índice de caracteres numa string também começa em 0.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual o resultado de TAMANHO(""), para uma string vazia?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '1' },
            { id: 'c', text: 'Erro' },
            { id: 'd', text: 'Não é possível medir uma string vazia' }
          ],
          answer: 'a',
          explanation: 'Uma string vazia não tem nenhum caractere, então seu tamanho é 0.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Se sobrenome <- "Silva", qual o valor de sobrenome[0]?',
          choices: [
            { id: 'a', text: '"S"' },
            { id: 'b', text: '"i"' },
            { id: 'c', text: '"Silva"' },
            { id: 'd', text: 'Erro' }
          ],
          answer: 'a',
          explanation: 'O caractere na posição 0 de "Silva" é "S".'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que devolve o número de caracteres de uma string:',
          code: 'tamanho_nome <- ___("Maria")  # resultado: 5',
          accept: ['TAMANHO'],
          explanation: 'TAMANHO devolve quantos caracteres a string tem.'
        }
      ]
    },
    {
      id: 'logica-15-busca',
      title: 'Busca sequencial e busca binária',
      goal: 'Comparar duas formas de buscar um valor num vetor e entender quando usar cada uma.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Busca sequencial',
            body: 'A busca sequencial percorre as posições do vetor uma por uma, na ordem, comparando cada valor com o que procuramos, até encontrar ou terminar o vetor. Funciona em QUALQUER vetor, ordenado ou não.',
            code: 'PARA i DE 0 ATÉ N-1 FAÇA\n  SE vetor[i] = alvo ENTÃO\n    ESCREVA "encontrado na posição ", i\n  FIM SE\nFIM PARA'
          },
          {
            title: 'Busca binária: a ideia',
            body: 'Se o vetor JÁ ESTIVER ORDENADO, podemos ser muito mais rápidos: comparamos o valor do MEIO do vetor com o que procuramos. Se for igual, achamos. Se o que procuramos for menor, só olhamos a metade da esquerda; se for maior, só a metade da direita. Repetimos isso, dividindo a busca pela metade a cada passo.'
          },
          {
            title: 'Por que a busca binária é mais rápida?',
            body: 'Cada comparação elimina METADE das posições restantes. Num vetor de 1000 posições, a busca sequencial pode levar até 1000 comparações no pior caso; a busca binária leva no máximo cerca de 10.'
          },
          {
            title: 'A exigência da busca binária',
            body: 'A busca binária só funciona corretamente se o vetor JÁ ESTIVER ORDENADO antes de começar. Num vetor desordenado, ela pode dar um resultado errado — descartar a metade errada sem perceber.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a busca sequencial?',
          choices: [
            { id: 'a', text: 'Percorrer as posições do vetor uma por uma, na ordem, até encontrar o valor ou terminar' },
            { id: 'b', text: 'Acessar diretamente a posição certa sem procurar' },
            { id: 'c', text: 'Só funciona em vetores ordenados' },
            { id: 'd', text: 'Um tipo de laço infinito' }
          ],
          answer: 'a',
          explanation: 'A busca sequencial verifica posição por posição, na ordem, até achar o valor ou chegar ao fim.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a principal exigência para usar a busca binária?',
          choices: [
            { id: 'a', text: 'O vetor precisa estar ordenado antes de começar' },
            { id: 'b', text: 'O vetor precisa ter menos de 10 posições' },
            { id: 'c', text: 'Não existe exigência nenhuma' },
            { id: 'd', text: 'O vetor precisa ter só números pares' }
          ],
          answer: 'a',
          explanation: 'Sem o vetor ordenado, a lógica de "descartar metade" da busca binária não funciona.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Na busca binária, o que fazemos quando o valor do meio é MAIOR que o que procuramos?',
          choices: [
            { id: 'a', text: 'Continuamos a busca só na metade da esquerda' },
            { id: 'b', text: 'Continuamos a busca só na metade da direita' },
            { id: 'c', text: 'Encerramos a busca imediatamente' },
            { id: 'd', text: 'Reiniciamos do começo do vetor' }
          ],
          answer: 'a',
          explanation: 'Se o valor procurado é menor que o do meio, ele só pode estar na metade da esquerda (num vetor ordenado crescente).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete: a busca binária funciona dividindo a busca pela ___ a cada passo.',
          code: 'A busca binária funciona dividindo a busca pela ___ a cada passo.',
          accept: ['metade'],
          explanation: 'A cada comparação, metade das posições restantes é descartada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que a busca binária costuma ser mais rápida que a busca sequencial em vetores grandes?',
          choices: [
            { id: 'a', text: 'Porque cada comparação elimina metade das posições restantes' },
            { id: 'b', text: 'Porque ela não precisa comparar valor nenhum' },
            { id: 'c', text: 'Porque ela sempre acha o valor na primeira tentativa' },
            { id: 'd', text: 'Não existe diferença de velocidade entre elas' }
          ],
          answer: 'a',
          explanation: 'Eliminar metade a cada passo faz o número de comparações crescer muito mais devagar que o tamanho do vetor.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'A busca sequencial funciona em vetores desordenados?',
          choices: [
            { id: 'a', text: 'Sim, ela funciona em qualquer vetor, ordenado ou não' },
            { id: 'b', text: 'Não, só funciona em vetores ordenados' },
            { id: 'c', text: 'Só funciona em vetores com números' },
            { id: 'd', text: 'Nunca funciona' }
          ],
          answer: 'a',
          explanation: 'A busca sequencial não depende de ordem — ela só compara posição por posição.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Num vetor de 1000 posições, no pior caso, quantas comparações a busca sequencial pode precisar?',
          choices: [
            { id: 'a', text: 'Até 1000' },
            { id: 'b', text: 'Sempre só 1' },
            { id: 'c', text: 'Sempre 10' },
            { id: 'd', text: '0' }
          ],
          answer: 'a',
          explanation: 'Se o valor não está no vetor (ou está na última posição), é preciso checar todas as posições.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: a busca binária só funciona corretamente se o vetor já estiver ___.',
          code: 'A busca binária só funciona corretamente se o vetor já estiver ___.',
          accept: ['ordenado'],
          explanation: 'Sem o vetor ordenado, descartar metade das posições pode eliminar justamente onde o valor está.'
        }
      ]
    },
    {
      id: 'logica-16-ordenacao',
      title: 'Ordenação (bolha)',
      goal: 'Entender o algoritmo de ordenação por bolha (bubble sort) passo a passo.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que significa ordenar?',
            body: 'Ordenar um vetor significa reorganizar seus valores numa ordem específica, como crescente (do menor para o maior) ou decrescente.'
          },
          {
            title: 'A ideia da ordenação por bolha',
            body: 'Comparamos cada PAR de valores vizinhos no vetor; se estiverem fora de ordem, trocamos os dois de posição. Repetimos essa passada várias vezes até que nenhuma troca seja mais necessária — nesse ponto, o vetor está ordenado.',
            code: 'PARA i DE 0 ATÉ N-2 FAÇA\n  SE vetor[i] > vetor[i+1] ENTÃO\n    troca(vetor[i], vetor[i+1])\n  FIM SE\nFIM PARA'
          },
          {
            title: "Por que se chama 'bolha'?",
            body: 'A cada passada completa, o maior valor "sobe" gradualmente para o final do vetor, como uma bolha subindo na água — por isso o nome "ordenação por bolha".'
          },
          {
            title: 'Quantas passadas são necessárias?',
            body: 'No pior caso, é preciso repetir o processo N-1 vezes para um vetor de N elementos, até garantir que tudo esteja ordenado — cada passada completa "empurra" pelo menos um valor para sua posição final.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa "ordenar" um vetor?',
          choices: [
            { id: 'a', text: 'Reorganizar os valores numa ordem específica, como crescente ou decrescente' },
            { id: 'b', text: 'Apagar valores repetidos' },
            { id: 'c', text: 'Somar todos os valores' },
            { id: 'd', text: 'Trocar os nomes das variáveis' }
          ],
          answer: 'a',
          explanation: 'Ordenar reorganiza os elementos, sem removê-los, seguindo um critério de ordem.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Na ordenação por bolha, o que acontece quando dois valores vizinhos estão fora de ordem?',
          choices: [
            { id: 'a', text: 'Eles são trocados de posição' },
            { id: 'b', text: 'O algoritmo para imediatamente' },
            { id: 'c', text: 'Um erro é gerado' },
            { id: 'd', text: 'Nada, eles ficam como estão' }
          ],
          answer: 'a',
          explanation: 'A troca de pares fora de ordem, repetida várias vezes, é o que gradualmente ordena o vetor inteiro.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que esse algoritmo de ordenação se chama "bolha"?',
          choices: [
            { id: 'a', text: 'Porque o maior valor "sobe" gradualmente para o final do vetor a cada passada, como uma bolha' },
            { id: 'b', text: 'Porque ele só funciona com números redondos' },
            { id: 'c', text: 'Porque foi inventado por alguém chamado Bolha' },
            { id: 'd', text: 'Não tem relação nenhuma com o funcionamento do algoritmo' }
          ],
          answer: 'a',
          explanation: 'O nome vem justamente do movimento gradual do maior valor até o final, lembrando uma bolha subindo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta depois da condição de troca:',
          code: 'SE vetor[i] > vetor[i+1] ___\n  troca(vetor[i], vetor[i+1])\nFIM SE',
          accept: ['ENTÃO', 'ENTAO'],
          explanation: 'ENTÃO sempre vem depois da condição, antes do bloco a ser executado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Depois de ordenar um vetor em ordem crescente com a bolha, onde fica o MAIOR valor?',
          choices: [
            { id: 'a', text: 'No final do vetor' },
            { id: 'b', text: 'No início do vetor' },
            { id: 'c', text: 'No meio' },
            { id: 'd', text: 'Depende do algoritmo' }
          ],
          answer: 'a',
          explanation: 'Em ordem crescente, o maior valor termina no final do vetor.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quantas passadas completas, no pior caso, a ordenação por bolha pode precisar para um vetor de N elementos?',
          choices: [
            { id: 'a', text: 'Até N-1 passadas' },
            { id: 'b', text: 'Sempre só 1 passada' },
            { id: 'c', text: 'Sempre 2 passadas' },
            { id: 'd', text: 'Nenhuma, é instantâneo' }
          ],
          answer: 'a',
          explanation: 'No pior caso, cada passada garante a posição final de só um elemento, exigindo até N-1 passadas.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'A ordenação por bolha compara:',
          choices: [
            { id: 'a', text: 'Pares de valores vizinhos, um par de cada vez' },
            { id: 'b', text: 'O primeiro valor com todos os outros de uma vez' },
            { id: 'c', text: 'Só o primeiro e o último valor' },
            { id: 'd', text: 'Não faz nenhuma comparação' }
          ],
          answer: 'a',
          explanation: 'A cada passo, apenas dois valores vizinhos são comparados (e possivelmente trocados).'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: ordenar significa reorganizar os valores numa ___ específica.',
          code: 'Ordenar significa reorganizar os valores numa ___ específica.',
          accept: ['ordem'],
          explanation: 'A reorganização segue um critério de ordem, como crescente ou decrescente.'
        }
      ]
    },
    {
      id: 'logica-17-selecao-insercao',
      title: 'Outros métodos de ordenação',
      goal: 'Conhecer a ordenação por seleção e por inserção, e comparar com a ordenação por bolha.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que existem vários métodos de ordenação?',
            body: 'Já vimos a ordenação por bolha. Existem outros métodos, com ideias diferentes para chegar ao mesmo resultado (um vetor ordenado) — cada um com sua própria forma de decidir o que comparar e trocar a cada passo.'
          },
          {
            title: 'Ordenação por seleção',
            body: 'A cada passada, encontramos o MENOR valor entre os que ainda não foram ordenados, e o colocamos na posição correta (trocando com quem estava lá). Repetimos isso até o vetor inteiro estar ordenado.',
            code: 'PARA i DE 0 ATÉ N-2 FAÇA\n  menor <- i\n  PARA j DE i+1 ATÉ N-1 FAÇA\n    SE vetor[j] < vetor[menor] ENTÃO\n      menor <- j\n    FIM SE\n  FIM PARA\n  troca(vetor[i], vetor[menor])\nFIM PARA'
          },
          {
            title: 'Ordenação por inserção',
            body: 'Percorremos o vetor da esquerda para a direita, pegando cada valor e inserindo-o na posição correta entre os valores JÁ ordenados à sua esquerda — parecido com organizar cartas de baralho na mão, uma de cada vez.'
          },
          {
            title: 'Comparando bolha, seleção e inserção',
            body: 'Os três têm a mesma ideia central (comparar e reorganizar valores), mas se diferenciam em COMO decidem o que comparar/trocar a cada passo. Para vetores pequenos ou quase ordenados, a diferença de desempenho entre eles costuma ser pequena.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Na ordenação por seleção, o que fazemos a cada passada?',
          choices: [
            { id: 'a', text: 'Encontramos o menor valor entre os ainda não ordenados e o colocamos na posição correta' },
            { id: 'b', text: 'Comparamos só os dois primeiros valores do vetor' },
            { id: 'c', text: 'Ordenamos o vetor inteiro de uma vez só' },
            { id: 'd', text: 'Removemos o maior valor do vetor' }
          ],
          answer: 'a',
          explanation: 'A cada passada, a seleção busca o menor valor restante e o posiciona corretamente.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Na ordenação por inserção, a ideia é parecida com:',
          choices: [
            { id: 'a', text: 'Organizar cartas de baralho na mão, uma de cada vez, inserindo cada uma na posição certa' },
            { id: 'b', text: 'Jogar todas as cartas fora e recomeçar' },
            { id: 'c', text: 'Embaralhar as cartas aleatoriamente' },
            { id: 'd', text: 'Escolher só a maior carta' }
          ],
          answer: 'a',
          explanation: 'É exatamente essa analogia que dá nome à ordenação por inserção.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que os métodos de ordenação por bolha, seleção e inserção têm em comum?',
          choices: [
            { id: 'a', text: 'Todos comparam e reorganizam valores para chegar a um vetor ordenado' },
            { id: 'b', text: 'Nenhum deles funciona de verdade' },
            { id: 'c', text: 'Só funcionam com texto' },
            { id: 'd', text: 'Não têm nada em comum' }
          ],
          answer: 'a',
          explanation: 'Os três resolvem o mesmo problema (ordenar), só com lógicas diferentes de comparação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que falta na condição de comparação da ordenação por seleção:',
          code: 'SE vetor[j] < vetor[menor] ___\n  menor <- j\nFIM SE',
          accept: ['ENTÃO', 'ENTAO'],
          explanation: 'ENTÃO sempre vem depois da condição de um SE.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Na ordenação por seleção, depois de encontrar o menor valor entre os não ordenados, o que fazemos?',
          choices: [
            { id: 'a', text: 'Trocamos ele de posição com o primeiro valor ainda não ordenado' },
            { id: 'b', text: 'Apagamos ele do vetor' },
            { id: 'c', text: 'Somamos ele aos outros valores' },
            { id: 'd', text: 'Nada, ele já fica na posição certa sozinho' }
          ],
          answer: 'a',
          explanation: 'A troca move o menor valor encontrado para o início da parte ainda não ordenada.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Na ordenação por inserção, cada valor é inserido:',
          choices: [
            { id: 'a', text: 'Na posição correta entre os valores já ordenados à sua esquerda' },
            { id: 'b', text: 'Sempre no final do vetor, sem checar nada' },
            { id: 'c', text: 'Sempre no início do vetor' },
            { id: 'd', text: 'Numa posição aleatória' }
          ],
          answer: 'a',
          explanation: 'A inserção mantém a parte já processada sempre ordenada, encaixando cada novo valor no lugar certo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Comparados à ordenação por bolha, os métodos de seleção e inserção:',
          choices: [
            { id: 'a', text: 'Resolvem o mesmo problema (ordenar), mas com uma lógica diferente de comparação/troca a cada passo' },
            { id: 'b', text: 'Não conseguem ordenar vetores de números' },
            { id: 'c', text: 'São a mesma coisa que a busca binária' },
            { id: 'd', text: 'Só funcionam em vetores já ordenados' }
          ],
          answer: 'a',
          explanation: 'Todos os três são métodos de ordenação válidos, diferindo na estratégia usada.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variável que guarda a posição do menor valor encontrado até agora, na ordenação por seleção:',
          code: 'menor <- i\nPARA j DE i+1 ATÉ N-1 FAÇA\n  SE vetor[j] < vetor[___] ENTÃO\n    menor <- j\n  FIM SE\nFIM PARA',
          accept: ['menor'],
          explanation: 'A variável "menor" guarda o índice do menor valor encontrado até o momento na passada atual.'
        }
      ]
    }
  ]
};
