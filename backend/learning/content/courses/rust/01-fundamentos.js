// Módulo "Fundamentos" (iniciante) — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ../../index.js para o formato e a validação de boot. Diferente dos
// outros cursos (conceituais ou de outra linguagem), Rust exige introduzir ownership/borrowing já
// no nível iniciante — não dá para escrever nem um programa trivial correto sem entender isso, ao
// contrário de Python/GameMaker, onde o básico de sintaxe já rende lições inteiras antes de tocar
// em conceitos centrais da linguagem.
// Ids não são numericamente sequenciais na ordem pedagógica: rst-11/rst-12/rst-13 foram inseridas
// depois, entre lições já numeradas (mesma convenção dos outros cursos) — Vec<T> logo após
// Borrowing (cresce naturalmente do que se aprendeu sobre referências/&mut), println!/Debug logo
// após Structs (resolve o problema real de tentar imprimir a struct recém-aprendida), Result<T, E>
// no final, logo após Option (os dois são sempre ensinados lado a lado).
module.exports = {
  id: 'fundamentos-rust',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Sintaxe básica, ownership e borrowing — a base de tudo em Rust',
  accent: '#ce422b',
  lessons: [
    {
      id: 'rst-01-intro',
      title: 'O que é Rust',
      goal: 'Entender o que é Rust e por que ele é conhecido pela segurança de memória sem garbage collector.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é Rust',
            body: 'Rust é uma linguagem de programação de sistemas, criada para produzir programas rápidos (parecido com C/C++) mas com garantias de segurança de memória verificadas em tempo de compilação.'
          },
          {
            title: 'Sem garbage collector, mas sem os perigos do C',
            body: 'Diferente de linguagens como Python (que usa um coletor de lixo automático), Rust não tem garbage collector — mas também evita os erros clássicos de memória do C/C++ (como usar memória já liberada), através de um sistema de regras checado pelo compilador, chamado "ownership" (posse), que veremos mais à frente no curso.'
          },
          {
            title: 'O compilador como "professor rigoroso"',
            body: 'Uma fama comum de Rust é que o compilador recusa compilar código que tenha certos tipos de erro de memória — isso costuma frustrar iniciantes no começo, mas evita bugs que só apareceriam em produção em outras linguagens.'
          },
          {
            title: 'cargo: o gerenciador de projetos do Rust',
            body: 'cargo é a ferramenta de linha de comando usada para criar projetos, compilar, rodar testes e gerenciar dependências (chamadas de "crates") — é o ponto de entrada para quase todo projeto Rust.'
          },
          {
            title: 'rustc e a compilação',
            body: 'rustc é o compilador de Rust propriamente dito (usado por baixo dos panos pelo cargo); um programa Rust precisa ser compilado antes de rodar, diferente de linguagens interpretadas como Python.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que Rust é?',
          choices: [
            { id: 'a', text: 'Uma linguagem de programação de sistemas, com garantias de segurança de memória verificadas em tempo de compilação' },
            { id: 'b', text: 'Uma linguagem só para páginas web, sem execução no servidor' },
            { id: 'c', text: 'Um framework de testes para outras linguagens' },
            { id: 'd', text: 'Um banco de dados' }
          ],
          answer: 'a',
          explanation: 'Rust é uma linguagem de sistemas focada em desempenho e segurança de memória.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Rust usa um garbage collector, como Python?',
          choices: [
            { id: 'a', text: 'Não, Rust não tem garbage collector' },
            { id: 'b', text: 'Sim, exatamente igual ao Python' },
            { id: 'c', text: 'Sim, mas só em modo de depuração' },
            { id: 'd', text: 'Depende da versão instalada' }
          ],
          answer: 'a',
          explanation: 'Rust gerencia memória sem um coletor de lixo em tempo de execução.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como Rust evita os erros clássicos de memória do C/C++, mesmo sem garbage collector?',
          choices: [
            { id: 'a', text: 'Através de um sistema de regras (ownership) checado pelo compilador' },
            { id: 'b', text: 'Executando o programa duas vezes para conferir erros' },
            { id: 'c', text: 'Não evita, tem exatamente os mesmos riscos do C' },
            { id: 'd', text: 'Usando um garbage collector escondido' }
          ],
          answer: 'a',
          explanation: 'O ownership é checado em tempo de compilação, sem custo em tempo de execução.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a ferramenta de linha de comando usada para criar, compilar e gerenciar projetos Rust:',
          code: 'O ___ é a ferramenta de linha de comando usada para criar, compilar e gerenciar projetos Rust',
          accept: ['cargo', 'Cargo'],
          explanation: 'cargo é o gerenciador de projetos e dependências do Rust.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que o compilador de Rust é conhecido por ser "rigoroso"?',
          choices: [
            { id: 'a', text: 'Porque recusa compilar código com certos tipos de erro de memória, evitando bugs que só apareceriam em produção' },
            { id: 'b', text: 'Porque é mais lento que qualquer outro compilador' },
            { id: 'c', text: 'Porque exige pagamento para compilar' },
            { id: 'd', text: 'Não há nada de rigoroso nele, é só uma fama sem fundamento' }
          ],
          answer: 'a',
          explanation: 'O compilador recusa código com erros de memória detectáveis estaticamente.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que são "crates" em Rust?',
          choices: [
            { id: 'a', text: 'As dependências (bibliotecas externas) de um projeto Rust' },
            { id: 'b', text: 'Um tipo de erro de compilação' },
            { id: 'c', text: 'O nome do compilador do Rust' },
            { id: 'd', text: 'Uma estrutura de dados embutida na linguagem' }
          ],
          answer: 'a',
          explanation: 'Crates são os pacotes/bibliotecas que um projeto Rust pode usar como dependência.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Um programa Rust precisa ser compilado antes de rodar?',
          choices: [
            { id: 'a', text: 'Sim, diferente de linguagens interpretadas como Python' },
            { id: 'b', text: 'Não, Rust é sempre interpretado linha a linha' },
            { id: 'c', text: 'Só em alguns sistemas operacionais' },
            { id: 'd', text: 'Só se o programa usar cargo' }
          ],
          answer: 'a',
          explanation: 'Rust é uma linguagem compilada — precisa gerar um executável antes de rodar.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do compilador de Rust, usado por baixo dos panos pelo cargo:',
          code: 'O ___ é o compilador de Rust, usado por baixo dos panos pelo cargo',
          accept: ['rustc'],
          explanation: 'rustc é o compilador propriamente dito do Rust.'
        }
      ]
    },
    {
      id: 'rst-02-variaveis',
      title: 'Variáveis e mutabilidade',
      goal: 'Entender como declarar variáveis em Rust e por que elas são imutáveis por padrão.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'let: declarando uma variável',
            body: 'Em Rust, let declara uma variável; diferente de Python, o tipo pode ser inferido automaticamente pelo compilador na maioria dos casos.',
            code: 'let x = 5;'
          },
          {
            title: 'Imutável por padrão',
            body: 'Uma diferença importante: variáveis criadas com let são IMUTÁVEIS por padrão — tentar mudar o valor depois gera erro de compilação.',
            code: 'let x = 5;\nx = 6; // erro de compilação: não é possível atribuir duas vezes a uma variável imutável'
          },
          {
            title: 'mut: permitindo mutação',
            body: 'Para permitir que uma variável mude de valor, é preciso declará-la explicitamente com mut.',
            code: 'let mut x = 5;\nx = 6; // ok, x é mutável'
          },
          {
            title: 'Por que imutável por padrão',
            body: 'Essa escolha de design ajuda a evitar bugs onde uma variável muda de valor sem que o programador espere — o compilador força você a ser explícito sempre que quiser mutabilidade.'
          },
          {
            title: 'Constantes',
            body: 'const declara um valor que nunca muda durante toda a execução do programa, precisa ter o tipo anotado explicitamente, e por convenção é escrito em maiúsculas.',
            code: 'const LIMITE_MAXIMO: u32 = 100_000;'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que let faz em Rust?',
          choices: [
            { id: 'a', text: 'Declara uma variável' },
            { id: 'b', text: 'Declara uma função' },
            { id: 'c', text: 'Importa uma dependência' },
            { id: 'd', text: 'Compila o programa' }
          ],
          answer: 'a',
          explanation: 'let é a palavra-chave usada para declarar variáveis em Rust.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Variáveis declaradas com let são mutáveis por padrão?',
          choices: [
            { id: 'a', text: 'Não, são imutáveis por padrão' },
            { id: 'b', text: 'Sim, sempre podem ser alteradas depois' },
            { id: 'c', text: 'Depende do tipo de dado' },
            { id: 'd', text: 'Só são mutáveis dentro de funções' }
          ],
          answer: 'a',
          explanation: 'Por padrão, variáveis em Rust são imutáveis, precisando de mut para mudar isso.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é preciso fazer para permitir que uma variável mude de valor?',
          choices: [
            { id: 'a', text: 'Declará-la com mut' },
            { id: 'b', text: 'Declará-la com const' },
            { id: 'c', text: 'Não é possível mudar o valor de nenhuma variável em Rust' },
            { id: 'd', text: 'Usar a palavra-chave fn' }
          ],
          answer: 'a',
          explanation: 'mut é o modificador que torna uma variável mutável.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que torna uma variável mutável:',
          code: 'let ___ x = 5;\nx = 6; // ok, x é mutável',
          accept: ['mut'],
          explanation: 'mut permite que a variável seja reatribuída depois.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que Rust escolheu tornar variáveis imutáveis por padrão?',
          choices: [
            { id: 'a', text: 'Para evitar bugs onde uma variável muda de valor sem que o programador espere' },
            { id: 'b', text: 'Porque é mais rápido para o compilador processar' },
            { id: 'c', text: 'Porque variáveis mutáveis não são suportadas pelo hardware' },
            { id: 'd', text: 'Não há um motivo real, é só uma escolha arbitrária' }
          ],
          answer: 'a',
          explanation: 'A imutabilidade por padrão ajuda a evitar mudanças de estado inesperadas.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que const declara?',
          choices: [
            { id: 'a', text: 'Um valor que nunca muda durante toda a execução do programa' },
            { id: 'b', text: 'Uma variável que pode ser alterada livremente' },
            { id: 'c', text: 'Uma função sem retorno' },
            { id: 'd', text: 'Um tipo de referência' }
          ],
          answer: 'a',
          explanation: 'const declara um valor fixo, definido em tempo de compilação.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Uma constante em Rust precisa ter o tipo anotado explicitamente?',
          choices: [
            { id: 'a', text: 'Sim, diferente de let, que pode inferir o tipo' },
            { id: 'b', text: 'Não, o tipo é sempre inferido automaticamente' },
            { id: 'c', text: 'Só se o valor for um número' },
            { id: 'd', text: 'Só em versões antigas de Rust' }
          ],
          answer: 'a',
          explanation: 'const exige anotação de tipo explícita, ao contrário de let.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a convenção de nomenclatura usada para os nomes de constantes em Rust:',
          code: 'const LIMITE_MAXIMO: u32 = 100_000; // por convenção, o nome fica em ___',
          accept: ['maiúsculas', 'maiusculas'],
          explanation: 'Por convenção, constantes em Rust são escritas em maiúsculas com underscores.'
        }
      ]
    },
    {
      id: 'rst-03-tipos',
      title: 'Tipos de dados básicos',
      goal: 'Conhecer os tipos escalares e compostos fundamentais de Rust.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Tipos escalares: inteiros',
            body: 'Rust tem vários tipos de número inteiro, como i32 (inteiro de 32 bits com sinal) e u32 (inteiro de 32 bits sem sinal, só positivo) — o "i" e "u" indicam com ou sem sinal, e o número indica quantos bits ocupam.',
            code: 'let idade: i32 = 30;\nlet contador: u32 = 0;'
          },
          {
            title: 'Tipos escalares: ponto flutuante e booleano',
            body: 'f64 é o tipo padrão para números com casas decimais; bool guarda true ou false.',
            code: 'let preco: f64 = 19.99;\nlet ativo: bool = true;'
          },
          {
            title: 'char',
            body: 'O tipo char representa um único caractere Unicode, sempre entre aspas simples — diferente de String, que usa aspas duplas.',
            code: "let letra: char = 'A';"
          },
          {
            title: 'Tuplas',
            body: 'Uma tupla agrupa vários valores de tipos possivelmente diferentes numa única variável, com tamanho fixo, acessados por posição usando um ponto.',
            code: "let pessoa: (i32, f64, char) = (30, 1.75, 'M');\nlet idade = pessoa.0;"
          },
          {
            title: 'Arrays',
            body: 'Um array guarda vários valores do MESMO tipo, com tamanho fixo definido em tempo de compilação — diferente de uma lista dinâmica, o tamanho de um array não muda.',
            code: 'let numeros: [i32; 3] = [1, 2, 3];'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que i32 representa?',
          choices: [
            { id: 'a', text: 'Um inteiro de 32 bits com sinal (pode ser negativo)' },
            { id: 'b', text: 'Um número com casas decimais' },
            { id: 'c', text: 'Um único caractere' },
            { id: 'd', text: 'Um valor booleano' }
          ],
          answer: 'a',
          explanation: 'i32 é um inteiro com sinal de 32 bits.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a diferença entre i32 e u32?',
          choices: [
            { id: 'a', text: 'u32 só guarda valores sem sinal (positivos); i32 pode guardar valores negativos' },
            { id: 'b', text: 'Não há diferença nenhuma entre os dois' },
            { id: 'c', text: 'u32 é para texto, i32 é para números' },
            { id: 'd', text: 'i32 é mais lento que u32' }
          ],
          answer: 'a',
          explanation: 'O "u" indica "unsigned" (sem sinal), o "i" indica "signed" (com sinal).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o tipo char representa?',
          choices: [
            { id: 'a', text: 'Um único caractere Unicode' },
            { id: 'b', text: 'Uma sequência de texto inteira' },
            { id: 'c', text: 'Um número decimal' },
            { id: 'd', text: 'Um valor booleano' }
          ],
          answer: 'a',
          explanation: 'char guarda exatamente um caractere Unicode.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo padrão para números com casas decimais em Rust:',
          code: 'let preco: ___ = 19.99;',
          accept: ['f64'],
          explanation: 'f64 é o tipo padrão de ponto flutuante em Rust.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que uma tupla permite?',
          choices: [
            { id: 'a', text: 'Agrupar vários valores de tipos possivelmente diferentes numa única variável' },
            { id: 'b', text: 'Guardar apenas valores do mesmo tipo' },
            { id: 'c', text: 'Crescer de tamanho dinamicamente' },
            { id: 'd', text: 'Executar uma função automaticamente' }
          ],
          answer: 'a',
          explanation: 'Tuplas agrupam valores de tipos diferentes, com tamanho fixo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como acessamos o primeiro valor de uma tupla chamada pessoa?',
          choices: [
            { id: 'a', text: 'pessoa.0' },
            { id: 'b', text: 'pessoa[0]' },
            { id: 'c', text: 'pessoa.first()' },
            { id: 'd', text: 'pessoa->0' }
          ],
          answer: 'a',
          explanation: 'Campos de tupla são acessados com ponto seguido do índice numérico.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que caracteriza um array em Rust?',
          choices: [
            { id: 'a', text: 'Guarda vários valores do mesmo tipo, com tamanho fixo definido em tempo de compilação' },
            { id: 'b', text: 'Pode crescer e diminuir livremente de tamanho' },
            { id: 'c', text: 'Guarda valores de tipos diferentes' },
            { id: 'd', text: 'Só existe dentro de uma struct' }
          ],
          answer: 'a',
          explanation: 'Arrays em Rust têm tamanho fixo e todos os elementos do mesmo tipo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de dado usado para representar um único caractere:',
          code: "let letra: ___ = 'A';",
          accept: ['char'],
          explanation: 'char é o tipo usado para um único caractere Unicode.'
        }
      ]
    },
    {
      id: 'rst-04-funcoes',
      title: 'Funções',
      goal: 'Declarar funções em Rust, com parâmetros e valores de retorno.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'fn: declarando uma função',
            body: 'A palavra-chave fn declara uma função; por convenção, nomes de função em Rust usam snake_case (palavras separadas por underline).',
            code: 'fn saudacao() {\n    println!("Olá!");\n}'
          },
          {
            title: 'Parâmetros com tipo obrigatório',
            body: 'Diferente de Python, todo parâmetro de função em Rust precisa ter seu tipo declarado explicitamente.',
            code: 'fn somar(a: i32, b: i32) {\n    println!("{}", a + b);\n}'
          },
          {
            title: 'Retornando um valor',
            body: 'A seta -> indica o tipo do valor retornado pela função.',
            code: 'fn somar(a: i32, b: i32) -> i32 {\n    a + b\n}'
          },
          {
            title: 'Expressões x statements',
            body: 'Em Rust, a última linha de uma função, SEM ponto e vírgula, é o valor retornado automaticamente — colocar um ponto e vírgula transformaria essa linha num statement, sem valor de retorno.',
            code: 'fn somar(a: i32, b: i32) -> i32 {\n    a + b  // sem ; -> é o valor retornado\n}'
          },
          {
            title: 'return explícito',
            body: 'Também é possível usar a palavra return para retornar antecipadamente, de qualquer ponto da função (útil dentro de condicionais, por exemplo).',
            code: 'fn checar(n: i32) -> bool {\n    if n < 0 {\n        return false;\n    }\n    true\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual palavra-chave declara uma função em Rust?',
          choices: [
            { id: 'a', text: 'fn' },
            { id: 'b', text: 'def' },
            { id: 'c', text: 'function' },
            { id: 'd', text: 'func' }
          ],
          answer: 'a',
          explanation: 'fn é a palavra-chave usada para declarar funções em Rust.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Os parâmetros de uma função em Rust precisam ter tipo declarado?',
          choices: [
            { id: 'a', text: 'Sim, todo parâmetro precisa ter seu tipo explicitamente declarado' },
            { id: 'b', text: 'Não, o tipo é sempre inferido automaticamente' },
            { id: 'c', text: 'Só se a função tiver retorno' },
            { id: 'd', text: 'Só o primeiro parâmetro precisa de tipo' }
          ],
          answer: 'a',
          explanation: 'Diferente de variáveis locais, parâmetros de função sempre exigem tipo explícito.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a seta -> indica na declaração de uma função?',
          choices: [
            { id: 'a', text: 'O tipo do valor retornado pela função' },
            { id: 'b', text: 'O nome da função' },
            { id: 'c', text: 'Que a função é pública' },
            { id: 'd', text: 'Que a função aceita referências' }
          ],
          answer: 'a',
          explanation: 'A seta -> precede o tipo de retorno da função.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o símbolo que indica o tipo de retorno de uma função:',
          code: 'fn somar(a: i32, b: i32) ___ i32 {\n    a + b\n}',
          accept: ['->'],
          explanation: 'A seta -> indica o tipo retornado pela função.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece se a última linha de uma função tiver um ponto e vírgula no final?',
          choices: [
            { id: 'a', text: 'Deixa de ser uma expressão de retorno, virando um statement sem valor de retorno' },
            { id: 'b', text: 'Nada muda, o valor ainda é retornado normalmente' },
            { id: 'c', text: 'A função deixa de compilar sempre' },
            { id: 'd', text: 'O ponto e vírgula é obrigatório para retornar um valor' }
          ],
          answer: 'a',
          explanation: 'O ponto e vírgula transforma a expressão num statement, sem valor de retorno.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual palavra-chave permite retornar antecipadamente de dentro de uma função?',
          choices: [
            { id: 'a', text: 'return' },
            { id: 'b', text: 'break' },
            { id: 'c', text: 'exit' },
            { id: 'd', text: 'stop' }
          ],
          answer: 'a',
          explanation: 'return permite sair da função antecipadamente, com um valor.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual convenção de nomenclatura Rust usa para nomes de função?',
          choices: [
            { id: 'a', text: 'snake_case' },
            { id: 'b', text: 'camelCase' },
            { id: 'c', text: 'PascalCase' },
            { id: 'd', text: 'kebab-case' }
          ],
          answer: 'a',
          explanation: 'snake_case é a convenção usada para funções e variáveis em Rust.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o que deve estar ausente ao final da última linha de uma função, para que ela seja o valor retornado:',
          code: 'fn somar(a: i32, b: i32) -> i32 {\n    a + b  // sem ___ no final, é o valor retornado\n}',
          accept: [';'],
          explanation: 'A ausência do ponto e vírgula torna a linha uma expressão de retorno.'
        }
      ]
    },
    {
      id: 'rst-05-controle-fluxo',
      title: 'Controle de fluxo: if/else e loops',
      goal: 'Usar if/else como expressão e os três tipos de laço de repetição de Rust.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'if/else',
            body: 'Parecido com outras linguagens, mas sem parênteses obrigatórios ao redor da condição.',
            code: 'let numero = 5;\nif numero > 0 {\n    println!("positivo");\n} else {\n    println!("não positivo");\n}'
          },
          {
            title: 'if como expressão',
            body: 'Como se viu com funções, if também pode ser uma expressão que produz um valor, atribuído diretamente a uma variável.',
            code: 'let resultado = if numero > 0 { "positivo" } else { "não positivo" };'
          },
          {
            title: 'loop: repetição infinita controlada',
            body: 'loop repete um bloco indefinidamente, até encontrar um break explícito.',
            code: 'let mut contador = 0;\nloop {\n    contador += 1;\n    if contador == 5 {\n        break;\n    }\n}'
          },
          {
            title: 'while',
            body: 'Repete enquanto uma condição for verdadeira, parecido com outras linguagens.',
            code: 'let mut contador = 0;\nwhile contador < 5 {\n    contador += 1;\n}'
          },
          {
            title: 'for',
            body: 'Percorre os itens de uma coleção (como um array) ou um intervalo (range), sendo o laço mais usado em Rust para iterar.',
            code: 'for i in 0..5 {\n    println!("{}", i);\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Um if em Rust precisa de parênteses ao redor da condição?',
          choices: [
            { id: 'a', text: 'Não, os parênteses não são obrigatórios' },
            { id: 'b', text: 'Sim, sempre são obrigatórios' },
            { id: 'c', text: 'Só quando a condição usa &&' },
            { id: 'd', text: 'Só dentro de funções' }
          ],
          answer: 'a',
          explanation: 'Rust não exige parênteses ao redor da condição de um if.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'if pode ser usado como expressão em Rust, produzindo um valor?',
          choices: [
            { id: 'a', text: 'Sim, o resultado de um if/else pode ser atribuído diretamente a uma variável' },
            { id: 'b', text: 'Não, if nunca produz um valor em Rust' },
            { id: 'c', text: 'Só dentro de loops' },
            { id: 'd', text: 'Só se usar a palavra return' }
          ],
          answer: 'a',
          explanation: 'if/else pode ser usado como expressão, atribuindo seu resultado a uma variável.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que loop faz?',
          choices: [
            { id: 'a', text: 'Repete um bloco indefinidamente, até encontrar um break explícito' },
            { id: 'b', text: 'Repete um bloco um número fixo de vezes' },
            { id: 'c', text: 'Executa o bloco uma única vez' },
            { id: 'd', text: 'Percorre os itens de uma coleção' }
          ],
          answer: 'a',
          explanation: 'loop repete indefinidamente até um break interromper a execução.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para sair de um loop:',
          code: 'let mut contador = 0;\nloop {\n    contador += 1;\n    if contador == 5 {\n        ___;\n    }\n}',
          accept: ['break'],
          explanation: 'break interrompe a execução de um loop.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que while faz?',
          choices: [
            { id: 'a', text: 'Repete um bloco enquanto uma condição for verdadeira' },
            { id: 'b', text: 'Repete um bloco um número fixo de vezes' },
            { id: 'c', text: 'Executa o bloco só uma vez, sempre' },
            { id: 'd', text: 'Nunca repete, é equivalente a um if' }
          ],
          answer: 'a',
          explanation: 'while repete enquanto a condição continuar verdadeira.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para que serve o for em Rust?',
          choices: [
            { id: 'a', text: 'Percorrer os itens de uma coleção ou um intervalo (range)' },
            { id: 'b', text: 'Declarar uma nova função' },
            { id: 'c', text: 'Criar uma nova struct' },
            { id: 'd', text: 'Definir um tipo de dado' }
          ],
          answer: 'a',
          explanation: 'for é o laço usado para iterar sobre coleções e ranges em Rust.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que 0..5 representa, dentro de um for?',
          choices: [
            { id: 'a', text: 'Um intervalo (range) de números, de 0 até 4 (exclusivo do 5)' },
            { id: 'b', text: 'Uma tupla com dois valores, 0 e 5' },
            { id: 'c', text: 'Um array de 5 elementos vazios' },
            { id: 'd', text: 'Uma divisão entre 0 e 5' }
          ],
          answer: 'a',
          explanation: '0..5 é um range que vai de 0 até 4, excluindo o limite superior.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador usado para criar um intervalo (range) entre dois números:',
          code: 'for i in 0___5 {\n    println!("{}", i);\n}',
          accept: ['..'],
          explanation: '.. cria um range entre dois valores, excluindo o limite superior.'
        }
      ]
    },
    {
      id: 'rst-06-ownership',
      title: 'Ownership: as regras de posse',
      goal: 'Entender o conceito central de Rust: cada valor tem um único dono, e o que acontece quando esse dono muda.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema que ownership resolve',
            body: 'Sem garbage collector, alguém precisa decidir quando a memória de um valor pode ser liberada — em Rust, isso é determinado em tempo de compilação, por um conjunto de regras chamado ownership (posse).'
          },
          {
            title: 'A regra central',
            body: 'Cada valor em Rust tem um único "dono" (owner) por vez — quando o dono sai de escopo (o bloco de código onde foi criado termina), o valor é automaticamente liberado da memória.'
          },
          {
            title: 'Move: transferindo a posse',
            body: 'Atribuir um valor (como uma String, que vive na heap) a outra variável MOVE a posse para a nova variável — a variável original deixa de ser válida.',
            code: 'let s1 = String::from("olá");\nlet s2 = s1;\n// s1 não pode mais ser usada aqui: a posse foi movida para s2'
          },
          {
            title: 'Por que isso evita bugs',
            body: 'Como só existe um dono por vez, é impossível ter duas variáveis tentando liberar a mesma memória (um erro clássico chamado "double free") — o compilador simplesmente recusa compilar código que tentasse usar s1 depois do move.'
          },
          {
            title: 'Tipos simples são copiados, não movidos',
            body: 'Tipos simples como i32, que vivem inteiramente na pilha (stack) e são baratos de duplicar, são COPIADOS em vez de movidos — por isso variáveis desses tipos continuam válidas depois de serem atribuídas a outra.',
            code: 'let x = 5;\nlet y = x;\n// x e y são independentes, ambos continuam válidos (i32 é Copy)'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual problema o sistema de ownership do Rust resolve?',
          choices: [
            { id: 'a', text: 'Decidir, em tempo de compilação, quando a memória de um valor pode ser liberada, sem garbage collector' },
            { id: 'b', text: 'Acelerar a compilação do programa' },
            { id: 'c', text: 'Traduzir código Rust para outras linguagens' },
            { id: 'd', text: 'Gerenciar dependências externas (crates)' }
          ],
          answer: 'a',
          explanation: 'Ownership resolve o gerenciamento de memória sem um coletor de lixo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quantos "donos" um valor pode ter por vez em Rust?',
          choices: [
            { id: 'a', text: 'Um único dono por vez' },
            { id: 'b', text: 'Quantos forem necessários' },
            { id: 'c', text: 'Sempre dois, no mínimo' },
            { id: 'd', text: 'Depende do tipo do valor' }
          ],
          answer: 'a',
          explanation: 'A regra central do ownership é que cada valor tem exatamente um dono por vez.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que acontece quando o dono de um valor sai de escopo?',
          choices: [
            { id: 'a', text: 'O valor é automaticamente liberado da memória' },
            { id: 'b', text: 'O valor é duplicado automaticamente' },
            { id: 'c', text: 'Nada acontece, o valor continua na memória indefinidamente' },
            { id: 'd', text: 'O programa trava imediatamente' }
          ],
          answer: 'a',
          explanation: 'Quando o dono sai de escopo, o valor é liberado automaticamente.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o que acontece com a posse de um valor ao atribuí-lo a outra variável:',
          code: 'let s1 = String::from("olá");\nlet s2 = s1;\n// a posse foi ___ de s1 para s2',
          accept: ['movida', 'move'],
          explanation: 'A posse é movida da variável original para a nova variável.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Depois de let s2 = s1; com uma String, s1 ainda pode ser usada?',
          choices: [
            { id: 'a', text: 'Não, a posse foi movida para s2, e s1 deixou de ser válida' },
            { id: 'b', text: 'Sim, s1 e s2 continuam sendo donas independentes' },
            { id: 'c', text: 'Sim, mas só dentro de loops' },
            { id: 'd', text: 'Depende do sistema operacional' }
          ],
          answer: 'a',
          explanation: 'Depois do move, apenas s2 é válida — usar s1 gera erro de compilação.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que a regra de "um único dono" evita o erro de "double free"?',
          choices: [
            { id: 'a', text: 'Porque impede que duas variáveis tentem liberar a mesma memória' },
            { id: 'b', text: 'Porque duplica a memória automaticamente' },
            { id: 'c', text: 'Porque desativa a liberação de memória por completo' },
            { id: 'd', text: 'Não tem relação com esse tipo de erro' }
          ],
          answer: 'a',
          explanation: 'Com um único dono, só uma variável é responsável por liberar aquela memória.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que tipos simples como i32 são copiados em vez de movidos ao serem atribuídos a outra variável?',
          choices: [
            { id: 'a', text: 'Porque vivem na pilha (stack) e são baratos de duplicar' },
            { id: 'b', text: 'Porque i32 nunca pode ser usado em mais de uma variável' },
            { id: 'c', text: 'Porque i32 vive na heap, como String' },
            { id: 'd', text: 'Não existe cópia para nenhum tipo em Rust' }
          ],
          answer: 'a',
          explanation: 'Tipos simples na stack são baratos de copiar, dispensando o move.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o traço (trait) que permite que x e y continuem válidos depois da atribuição:',
          code: 'let x = 5;\nlet y = x;\n// x e y continuam válidos porque i32 implementa ___',
          accept: ['Copy'],
          explanation: 'Tipos que implementam Copy são duplicados em vez de movidos.'
        }
      ]
    },
    {
      id: 'rst-07-borrowing',
      title: 'Borrowing e referências',
      goal: 'Usar referências para acessar um valor sem tomar posse dele.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema de sempre mover a posse',
            body: 'Se toda função que recebe um valor tomasse posse dele, seria preciso devolver o valor toda vez para poder usá-lo de novo depois — muito inconveniente.'
          },
          {
            title: 'Referências: emprestando sem tomar posse',
            body: 'O operador & cria uma referência a um valor, EMPRESTANDO-o sem transferir a posse — a função pode usar o valor, mas quem chamou continua sendo o dono.',
            code: 'fn calcular_tamanho(s: &String) -> usize {\n    s.len()\n}\nlet minha_string = String::from("olá");\nlet tamanho = calcular_tamanho(&minha_string);\n// minha_string ainda é válida aqui'
          },
          {
            title: 'Referências imutáveis por padrão',
            body: 'Assim como variáveis, uma referência criada com & é imutável por padrão: não é possível alterar o valor através dela.'
          },
          {
            title: '&mut: referência mutável',
            body: '&mut cria uma referência que permite alterar o valor emprestado — mas com uma regra importante: só pode existir UMA referência mutável para um valor por vez, dentro do mesmo escopo.',
            code: 'fn adicionar_sufixo(s: &mut String) {\n    s.push_str("!");\n}\nlet mut minha_string = String::from("olá");\nadicionar_sufixo(&mut minha_string);'
          },
          {
            title: 'Por que a regra de uma única referência mutável existe',
            body: 'Isso evita "data races": duas partes do código tentando ler e escrever o mesmo dado ao mesmo tempo, uma fonte clássica de bugs difíceis de rastrear em outras linguagens.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o operador & faz, aplicado a um valor?',
          choices: [
            { id: 'a', text: 'Cria uma referência, emprestando o valor sem transferir a posse' },
            { id: 'b', text: 'Duplica o valor imediatamente' },
            { id: 'c', text: 'Destrói o valor original' },
            { id: 'd', text: 'Converte o valor para outro tipo' }
          ],
          answer: 'a',
          explanation: '& cria uma referência (empréstimo) ao valor, sem transferir a posse.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Depois de passar &minha_string para uma função, minha_string continua válida no chamador?',
          choices: [
            { id: 'a', text: 'Sim, porque a referência empresta o valor, sem tomar a posse' },
            { id: 'b', text: 'Não, a posse é sempre movida para a função' },
            { id: 'c', text: 'Só se a função devolver o valor explicitamente' },
            { id: 'd', text: 'Depende do tipo de retorno da função' }
          ],
          answer: 'a',
          explanation: 'Referências emprestam o valor sem tomar posse, mantendo a variável original válida.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Uma referência criada com & é mutável por padrão?',
          choices: [
            { id: 'a', text: 'Não, é imutável por padrão' },
            { id: 'b', text: 'Sim, toda referência já é mutável' },
            { id: 'c', text: 'Depende do tipo do valor referenciado' },
            { id: 'd', text: 'Só é imutável dentro de loops' }
          ],
          answer: 'a',
          explanation: 'Referências criadas com & são imutáveis por padrão, como variáveis normais.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o símbolo que cria uma referência a um parâmetro do tipo String:',
          code: 'fn calcular_tamanho(s: ___String) -> usize {\n    s.len()\n}',
          accept: ['&'],
          explanation: '& antes do tipo indica que o parâmetro é uma referência.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que &mut permite, diferente de &?',
          choices: [
            { id: 'a', text: 'Permite alterar o valor emprestado através da referência' },
            { id: 'b', text: 'Permite criar quantas referências mutáveis quiser ao mesmo tempo' },
            { id: 'c', text: 'Transfere a posse definitivamente' },
            { id: 'd', text: 'Só funciona com tipos numéricos' }
          ],
          answer: 'a',
          explanation: '&mut permite modificar o valor emprestado, diferente de & (somente leitura).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quantas referências mutáveis podem existir para o mesmo valor, no mesmo escopo, ao mesmo tempo?',
          choices: [
            { id: 'a', text: 'Apenas uma' },
            { id: 'b', text: 'Quantas forem necessárias' },
            { id: 'c', text: 'Exatamente duas' },
            { id: 'd', text: 'Nenhuma, referências mutáveis não existem em Rust' }
          ],
          answer: 'a',
          explanation: 'Rust permite apenas uma referência mutável por vez, no mesmo escopo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que a regra de uma única referência mutável por vez existe?',
          choices: [
            { id: 'a', text: 'Para evitar "data races", onde duas partes do código leem/escrevem o mesmo dado ao mesmo tempo' },
            { id: 'b', text: 'Para economizar memória do programa' },
            { id: 'c', text: 'Porque o compilador não consegue lidar com mais de uma referência' },
            { id: 'd', text: 'Não há um motivo real, é uma limitação arbitrária' }
          ],
          answer: 'a',
          explanation: 'A regra evita condições de corrida (data races) entre leituras e escritas simultâneas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete os símbolos que criam uma referência mutável a um parâmetro:',
          code: 'fn adicionar_sufixo(s: &___ String) {\n    s.push_str("!");\n}',
          accept: ['mut'],
          explanation: '&mut cria uma referência que permite alterar o valor emprestado.'
        }
      ]
    },
    {
      id: 'rst-11-vec',
      title: 'Vec<T>: vetores dinâmicos',
      goal: 'Guardar uma coleção de valores que pode crescer, diferente de um array de tamanho fixo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O limite do array',
            body: 'Vimos que um array tem tamanho fixo, definido em tempo de compilação — mas na maioria dos programas reais, não sabemos de antemão quantos itens vamos precisar guardar.'
          },
          {
            title: 'Vec::new() e push',
            body: 'Vec<T> é uma coleção que vive na heap e pode crescer dinamicamente; Vec::new() cria um vetor vazio, e push adiciona um item ao final.',
            code: 'let mut numeros: Vec<i32> = Vec::new();\nnumeros.push(1);\nnumeros.push(2);'
          },
          {
            title: 'A macro vec!',
            body: 'Para criar um Vec já com valores iniciais, existe a macro vec!, mais concisa que criar vazio e dar push em cada item.',
            code: 'let numeros = vec![1, 2, 3];'
          },
          {
            title: 'Acessando itens',
            body: 'Assim como um array, itens de um Vec são acessados por índice com colchetes; acessar um índice fora dos limites causa panic (o programa encerra com erro) em tempo de execução.',
            code: 'let primeiro = numeros[0];'
          },
          {
            title: 'Percorrendo com for',
            body: 'Um Vec pode ser percorrido com for, iterando sobre uma referência (&numeros) para não mover a posse do vetor inteiro.',
            code: 'for n in &numeros {\n    println!("{}", n);\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a principal diferença entre um array e um Vec<T>?',
          choices: [
            { id: 'a', text: 'Um Vec pode crescer dinamicamente; um array tem tamanho fixo' },
            { id: 'b', text: 'Um array pode crescer dinamicamente; um Vec tem tamanho fixo' },
            { id: 'c', text: 'Não há diferença nenhuma entre os dois' },
            { id: 'd', text: 'Vec só guarda texto, array só guarda números' }
          ],
          answer: 'a',
          explanation: 'Vec<T> é uma coleção que cresce dinamicamente, diferente do array de tamanho fixo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que Vec::new() cria?',
          choices: [
            { id: 'a', text: 'Um vetor vazio' },
            { id: 'b', text: 'Um vetor já com 3 itens' },
            { id: 'c', text: 'Um array de tamanho fixo' },
            { id: 'd', text: 'Uma struct vazia' }
          ],
          answer: 'a',
          explanation: 'Vec::new() cria um vetor vazio, pronto para receber itens com push.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que push faz num Vec?',
          choices: [
            { id: 'a', text: 'Adiciona um item ao final do vetor' },
            { id: 'b', text: 'Remove o primeiro item do vetor' },
            { id: 'c', text: 'Cria um novo Vec vazio' },
            { id: 'd', text: 'Ordena os itens do vetor' }
          ],
          answer: 'a',
          explanation: 'push acrescenta um novo item ao final do Vec.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a macro que cria um Vec já com valores iniciais:',
          code: 'let numeros = ___![1, 2, 3];',
          accept: ['vec'],
          explanation: 'vec! cria um Vec já preenchido com os valores informados.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Como acessamos o primeiro item de um Vec chamado numeros?',
          choices: [
            { id: 'a', text: 'numeros[0]' },
            { id: 'b', text: 'numeros.0' },
            { id: 'c', text: 'numeros->0' },
            { id: 'd', text: 'numeros.first' }
          ],
          answer: 'a',
          explanation: 'Itens de um Vec são acessados por índice com colchetes, como num array.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece ao acessar um índice fora dos limites de um Vec?',
          choices: [
            { id: 'a', text: 'O programa entra em panic e encerra com erro em tempo de execução' },
            { id: 'b', text: 'O Rust devolve automaticamente o valor 0' },
            { id: 'c', text: 'O Vec cresce automaticamente até esse índice' },
            { id: 'd', text: 'Nada acontece, o acesso é simplesmente ignorado' }
          ],
          answer: 'a',
          explanation: 'Acessar um índice inválido causa panic em tempo de execução.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que percorremos um Vec com for n in &numeros, em vez de for n in numeros?',
          choices: [
            { id: 'a', text: 'Para não mover a posse do vetor inteiro, apenas emprestando cada item por referência' },
            { id: 'b', text: 'Porque for n in numeros não compila em nenhuma hipótese' },
            { id: 'c', text: 'Porque & torna o laço mais rápido, sem relação com ownership' },
            { id: 'd', text: 'Não há diferença nenhuma entre as duas formas' }
          ],
          answer: 'a',
          explanation: 'Iterar por referência evita mover a posse do Vec, permitindo usá-lo depois do laço.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o método usado para adicionar um item ao final de um Vec:',
          code: 'let mut numeros: Vec<i32> = Vec::new();\nnumeros.___(1);',
          accept: ['push'],
          explanation: 'push adiciona um novo item ao final do vetor.'
        }
      ]
    },
    {
      id: 'rst-08-strings',
      title: 'Strings e slices',
      goal: 'Entender a diferença entre String e &str, e o que é uma slice.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Dois tipos para texto',
            body: 'Rust tem dois tipos principais para trabalhar com texto: String (dona do seu conteúdo, pode crescer) e &str (uma referência/fatia de texto, geralmente imutável).'
          },
          {
            title: 'String: dona e mutável',
            body: 'String::from cria uma String que possui seu próprio conteúdo na heap, podendo ser alterada e crescer (por exemplo, com push_str).',
            code: 'let mut s = String::from("olá");\ns.push_str(", mundo!");'
          },
          {
            title: '&str: uma fatia de texto',
            body: '&str é uma referência a uma sequência de caracteres, muitas vezes apontando para parte de uma String, ou para um texto literal escrito diretamente no código.',
            code: 'let literal: &str = "eu sou um &str";'
          },
          {
            title: 'Slices: uma "fatia" de uma coleção',
            body: 'De forma mais geral, uma slice referencia uma parte contígua de uma coleção (como parte de uma String ou de um array), sem copiar os dados.',
            code: 'let s = String::from("olá mundo");\nlet primeira_palavra = &s[0..3]; // fatia "olá"'
          },
          {
            title: 'Quando usar cada tipo',
            body: 'Funções que só precisam LER um texto costumam aceitar &str (mais flexível, aceita tanto String quanto literais); funções que precisam ser DONAS do texto ou alterá-lo usam String.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a diferença central entre String e &str?',
          choices: [
            { id: 'a', text: 'String é dona do seu conteúdo e pode crescer; &str é uma referência/fatia de texto' },
            { id: 'b', text: 'São exatamente o mesmo tipo, com nomes diferentes' },
            { id: 'c', text: '&str pode crescer, mas String não' },
            { id: 'd', text: 'String só existe dentro de structs' }
          ],
          answer: 'a',
          explanation: 'String possui o conteúdo; &str é uma referência a texto existente.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que String::from cria?',
          choices: [
            { id: 'a', text: 'Uma String que possui seu próprio conteúdo na heap, podendo ser alterada' },
            { id: 'b', text: 'Uma referência a um texto literal' },
            { id: 'c', text: 'Um array de caracteres de tamanho fixo' },
            { id: 'd', text: 'Uma constante imutável' }
          ],
          answer: 'a',
          explanation: 'String::from cria uma String dona do seu próprio conteúdo, alocado na heap.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que uma slice representa?',
          choices: [
            { id: 'a', text: 'Uma parte contígua de uma coleção, referenciada sem copiar os dados' },
            { id: 'b', text: 'Uma cópia completa de uma coleção' },
            { id: 'c', text: 'Um novo tipo de struct' },
            { id: 'd', text: 'Um valor numérico' }
          ],
          answer: 'a',
          explanation: 'Uma slice referencia parte de uma coleção existente, sem copiar os dados.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o símbolo que precede str num tipo de referência de texto:',
          code: 'let literal: ___str = "eu sou um &str";',
          accept: ['&'],
          explanation: '&str é uma referência a uma sequência de caracteres.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que funções que só precisam ler um texto costumam aceitar &str?',
          choices: [
            { id: 'a', text: 'Porque é mais flexível, aceitando tanto uma String quanto um literal de texto' },
            { id: 'b', text: 'Porque &str é mais lento, mas mais seguro' },
            { id: 'c', text: 'Porque String não pode ser passada como parâmetro' },
            { id: 'd', text: 'Não há vantagem real em usar &str' }
          ],
          answer: 'a',
          explanation: '&str aceita tanto Strings quanto literais de texto, sendo mais flexível como parâmetro.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que push_str faz numa String?',
          choices: [
            { id: 'a', text: 'Adiciona texto ao final da String existente' },
            { id: 'b', text: 'Remove todo o conteúdo da String' },
            { id: 'c', text: 'Converte a String em &str' },
            { id: 'd', text: 'Cria uma nova String vazia' }
          ],
          answer: 'a',
          explanation: 'push_str acrescenta texto ao final de uma String mutável.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando faz mais sentido usar String em vez de &str?',
          choices: [
            { id: 'a', text: 'Quando a função precisa ser dona do texto ou alterá-lo' },
            { id: 'b', text: 'Quando o texto nunca muda' },
            { id: 'c', text: 'Sempre, &str nunca deveria ser usado' },
            { id: 'd', text: 'Somente para textos literais fixos no código' }
          ],
          answer: 'a',
          explanation: 'String é a escolha certa quando é preciso possuir ou modificar o texto.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador usado para definir o intervalo de uma slice de String:',
          code: 'let s = String::from("olá mundo");\nlet primeira_palavra = &s[0___3];',
          accept: ['..'],
          explanation: '.. define o intervalo de índices usado na slice.'
        }
      ]
    },
    {
      id: 'rst-09-structs',
      title: 'Structs',
      goal: 'Agrupar dados relacionados num tipo próprio, com campos nomeados e métodos.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é uma struct',
            body: 'struct define um novo tipo, agrupando vários campos nomeados relacionados, parecido com um "registro" ou objeto simples.',
            code: 'struct Pessoa {\n    nome: String,\n    idade: u32,\n}'
          },
          {
            title: 'Criando uma instância',
            body: 'Para criar um valor desse tipo, especificamos um valor para cada campo.',
            code: 'let p = Pessoa {\n    nome: String::from("Ana"),\n    idade: 30,\n};'
          },
          {
            title: 'Acessando campos',
            body: 'Os campos são acessados com ponto, igual em outras linguagens.',
            code: 'println!("{}", p.nome);'
          },
          {
            title: 'impl: adicionando métodos',
            body: 'O bloco impl associa funções (métodos) a uma struct — o primeiro parâmetro &self representa a própria instância que chamou o método.',
            code: 'impl Pessoa {\n    fn apresentar(&self) {\n        println!("Meu nome é {}", self.nome);\n    }\n}'
          },
          {
            title: 'Chamando um método',
            body: 'Uma vez definido dentro de impl, o método é chamado com ponto, na instância.',
            code: 'p.apresentar();'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que uma struct faz?',
          choices: [
            { id: 'a', text: 'Define um novo tipo, agrupando vários campos nomeados relacionados' },
            { id: 'b', text: 'Declara uma função solta' },
            { id: 'c', text: 'Cria um intervalo (range) de números' },
            { id: 'd', text: 'Importa uma dependência externa' }
          ],
          answer: 'a',
          explanation: 'struct agrupa campos nomeados relacionados num novo tipo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como criamos uma instância de uma struct?',
          choices: [
            { id: 'a', text: 'Especificando um valor para cada campo definido' },
            { id: 'b', text: 'Chamando a função new() automaticamente' },
            { id: 'c', text: 'Structs não podem ser instanciadas' },
            { id: 'd', text: 'Usando apenas a palavra-chave impl' }
          ],
          answer: 'a',
          explanation: 'Uma instância é criada fornecendo um valor para cada campo da struct.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como acessamos um campo de uma instância de struct?',
          choices: [
            { id: 'a', text: 'Com ponto, como p.nome' },
            { id: 'b', text: 'Com colchetes, como p["nome"]' },
            { id: 'c', text: 'Com uma seta, como p->nome' },
            { id: 'd', text: 'Não é possível acessar campos individualmente' }
          ],
          answer: 'a',
          explanation: 'Campos de struct são acessados com ponto, como em outras linguagens.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que define um novo tipo, agrupando campos nomeados:',
          code: '___ Pessoa {\n    nome: String,\n    idade: u32,\n}',
          accept: ['struct'],
          explanation: 'struct é a palavra-chave que declara o novo tipo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que o bloco impl faz?',
          choices: [
            { id: 'a', text: 'Associa funções (métodos) a uma struct' },
            { id: 'b', text: 'Cria uma nova variável mutável' },
            { id: 'c', text: 'Importa uma dependência externa' },
            { id: 'd', text: 'Declara um novo módulo' }
          ],
          answer: 'a',
          explanation: 'impl é onde os métodos de uma struct são definidos.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que &self representa, como primeiro parâmetro de um método?',
          choices: [
            { id: 'a', text: 'A própria instância que chamou o método' },
            { id: 'b', text: 'Um parâmetro qualquer, sem significado especial' },
            { id: 'c', text: 'O nome da struct' },
            { id: 'd', text: 'Uma nova instância criada dentro do método' }
          ],
          answer: 'a',
          explanation: '&self referencia a instância na qual o método foi chamado.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Como chamamos um método definido dentro de impl?',
          choices: [
            { id: 'a', text: 'Com ponto, na instância, como p.apresentar()' },
            { id: 'b', text: 'Chamando Pessoa::apresentar() sempre' },
            { id: 'c', text: 'Métodos não podem ser chamados diretamente' },
            { id: 'd', text: 'Com colchetes, como p[apresentar]' }
          ],
          answer: 'a',
          explanation: 'Métodos são chamados com ponto, na instância que os possui.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o parâmetro que representa a própria instância dentro de um método:',
          code: 'impl Pessoa {\n    fn apresentar(___) {\n        println!("Meu nome é {}", self.nome);\n    }\n}',
          accept: ['&self'],
          explanation: '&self é o parâmetro que referencia a instância que chamou o método.'
        }
      ]
    },
    {
      id: 'rst-12-println-debug',
      title: 'println!, format! e Debug',
      goal: 'Entender a macro println!, seus placeholders, e por que imprimir uma struct exige #[derive(Debug)].',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'println! é uma macro, não uma função',
            body: 'O ! no final indica que println! é uma macro — ela existe porque precisa aceitar um número variável e flexível de argumentos, algo que uma função comum em Rust não permite da mesma forma.',
            code: 'println!("Olá, {}!", "mundo");'
          },
          {
            title: 'O placeholder {}',
            body: 'Dentro da string, {} marca onde cada argumento seguinte deve ser inserido, na ordem em que aparecem.',
            code: 'let nome = "Ana";\nlet idade = 30;\nprintln!("{} tem {} anos", nome, idade);'
          },
          {
            title: 'format!',
            body: 'Parecido com println!, mas em vez de imprimir na tela, format! devolve uma nova String montada com os valores — útil quando você quer guardar o texto, não só exibi-lo.',
            code: 'let mensagem = format!("{} tem {} anos", nome, idade);'
          },
          {
            title: 'Tentando imprimir uma struct',
            body: 'Se você tentar usar println!("{}", p) com uma struct como Pessoa, o código não compila: {} exige que o tipo implemente Display, e structs não têm isso automaticamente.'
          },
          {
            title: '{:?} e #[derive(Debug)]',
            body: 'Adicionando #[derive(Debug)] logo acima da struct, o compilador gera automaticamente uma implementação de depuração — permitindo usar {:?} (em vez de {}) para imprimir a struct inteira, formatada para debug.',
            code: '#[derive(Debug)]\nstruct Pessoa {\n    nome: String,\n    idade: u32,\n}\n\nprintln!("{:?}", p);'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que println! é uma macro, e não uma função comum?',
          choices: [
            { id: 'a', text: 'Porque precisa aceitar um número variável e flexível de argumentos' },
            { id: 'b', text: 'Porque macros são sempre mais rápidas que funções' },
            { id: 'c', text: 'Porque funções não podem imprimir texto na tela' },
            { id: 'd', text: 'Não há motivo real, poderia ser uma função comum' }
          ],
          answer: 'a',
          explanation: 'Macros permitem um número flexível de argumentos, algo que funções comuns não fazem da mesma forma.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que {} representa dentro da string de um println!?',
          choices: [
            { id: 'a', text: 'O lugar onde cada argumento seguinte deve ser inserido, na ordem em que aparecem' },
            { id: 'b', text: 'Um comentário dentro da string' },
            { id: 'c', text: 'O fim da string' },
            { id: 'd', text: 'Um erro de sintaxe' }
          ],
          answer: 'a',
          explanation: '{} é o placeholder onde os argumentos são inseridos, em ordem.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença entre println! e format!?',
          choices: [
            { id: 'a', text: 'println! imprime na tela; format! devolve uma nova String montada com os valores' },
            { id: 'b', text: 'São exatamente a mesma macro, com nomes diferentes' },
            { id: 'c', text: 'format! só funciona com números' },
            { id: 'd', text: 'println! devolve uma String; format! imprime na tela' }
          ],
          answer: 'a',
          explanation: 'format! monta e devolve a String, sem imprimir nada na tela.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o placeholder usado dentro da string do println! para inserir um argumento:',
          code: 'println!("Olá, ___!", "mundo");',
          accept: ['{}'],
          explanation: '{} marca onde o argumento seguinte deve ser inserido.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece ao tentar usar println!("{}", p) com uma struct comum, sem nenhuma preparação extra?',
          choices: [
            { id: 'a', text: 'O código não compila, porque {} exige que o tipo implemente Display, e structs não têm isso automaticamente' },
            { id: 'b', text: 'O código compila e imprime a struct normalmente' },
            { id: 'c', text: 'O código compila, mas imprime um valor vazio' },
            { id: 'd', text: 'O programa entra em panic em tempo de execução' }
          ],
          answer: 'a',
          explanation: 'Sem implementar Display, structs não podem ser usadas diretamente com {}.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que #[derive(Debug)] faz, colocado acima de uma struct?',
          choices: [
            { id: 'a', text: 'Gera automaticamente uma implementação de depuração para aquele tipo' },
            { id: 'b', text: 'Torna todos os campos da struct públicos' },
            { id: 'c', text: 'Impede que a struct seja instanciada' },
            { id: 'd', text: 'Converte a struct num enum' }
          ],
          answer: 'a',
          explanation: '#[derive(Debug)] gera automaticamente o suporte a {:?} para o tipo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual placeholder usamos para imprimir uma struct com #[derive(Debug)]?',
          choices: [
            { id: 'a', text: '{:?}' },
            { id: 'b', text: '{}' },
            { id: 'c', text: '{!}' },
            { id: 'd', text: '{#}' }
          ],
          answer: 'a',
          explanation: '{:?} usa a implementação de Debug gerada pelo derive.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o atributo usado para gerar automaticamente a implementação de depuração de uma struct:',
          code: '#[___(Debug)]\nstruct Pessoa {\n    nome: String,\n    idade: u32,\n}',
          accept: ['derive'],
          explanation: 'derive(Debug) gera a implementação necessária para usar {:?}.'
        }
      ]
    },
    {
      id: 'rst-10-enums-option',
      title: 'Enums e Option: lidando com a ausência de valor',
      goal: 'Definir enums básicos e usar Option<T> para representar a ausência de um valor, sem usar null.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é um enum',
            body: 'enum define um tipo que só pode assumir um conjunto fixo e nomeado de variantes — útil quando um valor só pode ser "um entre poucos" estados possíveis.',
            code: 'enum Direcao {\n    Norte,\n    Sul,\n    Leste,\n    Oeste,\n}'
          },
          {
            title: 'Usando um enum com match',
            body: 'match compara um valor contra cada variante possível do enum, executando o bloco correspondente — parecido com um switch, mas exige cobrir todos os casos.',
            code: 'let d = Direcao::Norte;\nmatch d {\n    Direcao::Norte => println!("indo para cima"),\n    Direcao::Sul => println!("indo para baixo"),\n    Direcao::Leste => println!("indo para a direita"),\n    Direcao::Oeste => println!("indo para a esquerda"),\n}'
          },
          {
            title: 'O problema do "null" em outras linguagens',
            body: 'Muitas linguagens têm um valor especial (null, None, nil) que pode aparecer onde um valor de verdade era esperado, causando erros em tempo de execução quando isso é esquecido.'
          },
          {
            title: 'Option<T>: ausência de valor, verificada em tempo de compilação',
            body: 'Rust não tem null — em vez disso, usa o enum Option<T>, com duas variantes: Some(valor), quando há um valor, e None, quando não há.',
            code: 'let talvez_numero: Option<i32> = Some(5);\nlet nada: Option<i32> = None;'
          },
          {
            title: 'Por que isso é mais seguro',
            body: 'Como Option<T> é um tipo diferente de T, o compilador OBRIGA o programador a tratar explicitamente o caso None antes de acessar o valor de dentro — eliminando, em tempo de compilação, uma categoria inteira de erros de "valor nulo inesperado".'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um enum define?',
          choices: [
            { id: 'a', text: 'Um tipo que só pode assumir um conjunto fixo e nomeado de variantes' },
            { id: 'b', text: 'Uma função com múltiplos parâmetros' },
            { id: 'c', text: 'Uma referência mutável' },
            { id: 'd', text: 'Um array de tamanho variável' }
          ],
          answer: 'a',
          explanation: 'enum define variantes nomeadas e fixas para um tipo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que match faz com um valor de enum?',
          choices: [
            { id: 'a', text: 'Compara o valor contra cada variante possível, executando o bloco correspondente' },
            { id: 'b', text: 'Cria uma nova variante do enum' },
            { id: 'c', text: 'Converte o enum em uma String' },
            { id: 'd', text: 'Destrói o valor do enum' }
          ],
          answer: 'a',
          explanation: 'match compara o valor contra as variantes do enum.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Rust tem um valor null, como muitas outras linguagens?',
          choices: [
            { id: 'a', text: 'Não, Rust não tem null' },
            { id: 'b', text: 'Sim, chamado de "nil"' },
            { id: 'c', text: 'Sim, mas só para tipos numéricos' },
            { id: 'd', text: 'Sim, exatamente igual a outras linguagens' }
          ],
          answer: 'a',
          explanation: 'Rust não possui null — usa Option<T> para representar ausência de valor.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a variante de Option<T> usada quando há um valor presente:',
          code: 'let talvez_numero: Option<i32> = ___(5);',
          accept: ['Some'],
          explanation: 'Some(valor) representa a presença de um valor dentro de Option<T>.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que a variante None de Option<T> representa?',
          choices: [
            { id: 'a', text: 'A ausência de um valor' },
            { id: 'b', text: 'Um erro de compilação' },
            { id: 'c', text: 'O valor zero' },
            { id: 'd', text: 'Uma referência mutável' }
          ],
          answer: 'a',
          explanation: 'None representa explicitamente a ausência de um valor.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que Option<T> é considerado mais seguro que um valor null tradicional?',
          choices: [
            { id: 'a', text: 'Porque o compilador obriga o programador a tratar explicitamente o caso None antes de acessar o valor' },
            { id: 'b', text: 'Porque Option<T> nunca pode representar ausência de valor' },
            { id: 'c', text: 'Porque é mais rápido de processar' },
            { id: 'd', text: 'Não há diferença real de segurança' }
          ],
          answer: 'a',
          explanation: 'O compilador exige tratamento explícito do caso None, evitando erros em tempo de execução.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando faz sentido usar Option<T> em vez de um valor comum do tipo T?',
          choices: [
            { id: 'a', text: 'Quando o valor pode legitimamente estar ausente' },
            { id: 'b', text: 'Sempre, para qualquer variável do programa' },
            { id: 'c', text: 'Somente para números inteiros' },
            { id: 'd', text: 'Nunca, Option<T> é obsoleto em Rust' }
          ],
          answer: 'a',
          explanation: 'Option<T> é usado quando a ausência de valor é uma possibilidade real.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variante de Option<T> usada quando não há valor:',
          code: 'let nada: Option<i32> = ___;',
          accept: ['None'],
          explanation: 'None representa a ausência de valor dentro de Option<T>.'
        }
      ]
    },
    {
      id: 'rst-13-result',
      title: 'Result<T, E>: tratando operações que podem falhar',
      goal: 'Usar Result<T, E> para representar operações que podem ter sucesso ou falhar, com um erro explícito.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Nem toda ausência de valor é "só não ter nada"',
            body: 'Option<T> serve para quando um valor pode simplesmente não existir; mas às vezes uma operação FALHA, e queremos saber POR QUE ela falhou — é aí que entra Result<T, E>.'
          },
          {
            title: 'As duas variantes de Result',
            body: 'Result<T, E> tem duas variantes: Ok(valor), quando a operação deu certo, com o valor de tipo T; e Err(erro), quando falhou, com um erro de tipo E explicando o motivo.',
            code: 'fn dividir(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        return Err(String::from("divisão por zero"));\n    }\n    Ok(a / b)\n}'
          },
          {
            title: 'Tratando um Result com match',
            body: 'Assim como Option, um Result costuma ser tratado com match, cobrindo os dois casos possíveis.',
            code: 'match dividir(10.0, 2.0) {\n    Ok(resultado) => println!("Resultado: {}", resultado),\n    Err(motivo) => println!("Erro: {}", motivo),\n}'
          },
          {
            title: 'panic! e unwrap: quando você tem certeza (ou não se importa)',
            body: 'unwrap() extrai o valor de dentro de um Ok, mas causa panic! (o programa encerra com erro) se for um Err — útil só em protótipos rápidos ou quando um erro ali realmente não deveria ser possível.',
            code: 'let resultado = dividir(10.0, 2.0).unwrap(); // panic se for Err'
          },
          {
            title: 'O operador ?',
            body: 'Dentro de uma função que também devolve Result, o operador ? propaga automaticamente um Err para quem chamou a função, sem precisar escrever um match inteiro — um atalho muito usado no dia a dia.',
            code: 'fn calcular() -> Result<f64, String> {\n    let resultado = dividir(10.0, 0.0)?; // se for Err, já retorna daqui\n    Ok(resultado * 2.0)\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quando faz mais sentido usar Result<T, E> em vez de Option<T>?',
          choices: [
            { id: 'a', text: 'Quando uma operação pode falhar e queremos saber o motivo do erro, não só que "não há valor"' },
            { id: 'b', text: 'Quando o valor nunca pode estar ausente' },
            { id: 'c', text: 'Result e Option são exatamente a mesma coisa, com nomes diferentes' },
            { id: 'd', text: 'Result só serve para números' }
          ],
          answer: 'a',
          explanation: 'Result carrega um motivo de erro, diferente de Option, que só indica ausência.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a variante Ok(valor) de Result representa?',
          choices: [
            { id: 'a', text: 'Que a operação deu certo, com o valor de tipo T' },
            { id: 'b', text: 'Que a operação falhou' },
            { id: 'c', text: 'Que o valor está ausente' },
            { id: 'd', text: 'Um erro de compilação' }
          ],
          answer: 'a',
          explanation: 'Ok(valor) representa o caso de sucesso de um Result.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a variante Err(erro) de Result representa?',
          choices: [
            { id: 'a', text: 'Que a operação falhou, com um erro de tipo E explicando o motivo' },
            { id: 'b', text: 'Que a operação teve sucesso' },
            { id: 'c', text: 'Que o valor é None' },
            { id: 'd', text: 'Que o programa travou permanentemente' }
          ],
          answer: 'a',
          explanation: 'Err(erro) carrega o motivo da falha da operação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a variante de Result usada para retornar um erro:',
          code: 'fn dividir(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        return ___(String::from("divisão por zero"));\n    }\n    Ok(a / b)\n}',
          accept: ['Err'],
          explanation: 'Err(erro) é a variante usada para sinalizar que a operação falhou.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que unwrap() faz quando chamado num Result que é Err?',
          choices: [
            { id: 'a', text: 'Causa panic!, encerrando o programa com erro' },
            { id: 'b', text: 'Devolve um valor padrão silenciosamente' },
            { id: 'c', text: 'Converte o Err em Ok automaticamente' },
            { id: 'd', text: 'Não faz nada, ignora o erro' }
          ],
          answer: 'a',
          explanation: 'unwrap() em um Err causa panic!, encerrando o programa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando usar unwrap() costuma ser aceitável?',
          choices: [
            { id: 'a', text: 'Só em protótipos rápidos ou quando um erro ali realmente não deveria ser possível' },
            { id: 'b', text: 'Sempre, em qualquer código de produção' },
            { id: 'c', text: 'Nunca, unwrap() não existe em Rust' },
            { id: 'd', text: 'Só dentro de structs' }
          ],
          answer: 'a',
          explanation: 'unwrap() é aceitável em contextos controlados, não em tratamento robusto de erros.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que o operador ? faz, dentro de uma função que também devolve Result?',
          choices: [
            { id: 'a', text: 'Propaga automaticamente um Err para quem chamou a função, sem precisar escrever um match inteiro' },
            { id: 'b', text: 'Converte qualquer Err em Ok automaticamente' },
            { id: 'c', text: 'Causa panic! sempre que usado' },
            { id: 'd', text: 'Só funciona com Option, nunca com Result' }
          ],
          answer: 'a',
          explanation: 'O operador ? propaga o erro automaticamente, encurtando o tratamento manual.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o método usado para extrair o valor de um Result, causando panic! se for Err:',
          code: 'let resultado = dividir(10.0, 2.0).___(); // panic se for Err',
          accept: ['unwrap'],
          explanation: 'unwrap() extrai o valor de um Ok, ou causa panic! se for Err.'
        }
      ]
    }
  ]
};
