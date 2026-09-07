// Módulo "Fundamentos" (iniciante) — 9 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ./index.js para o formato e a validação de boot.
//
// Cada lição usa o formato de intro multi-slide (intro.slides) — uma tela de apresentação por
// conceito, terminando no botão de começar as perguntas — porque a introdução PRECISA ensinar
// explicitamente todo conceito que as perguntas vão cobrar (ver feedback do usuário sobre a
// didática do curso, e o mesmo padrão já usado em courses/logica/).
module.exports = {
  "id": "fundamentos",
  "levelKey": "beginner",
  "order": 1,
  "title": "Fundamentos",
  "subtitle": "Variáveis, tipos, entrada de dados, strings e tratamento de erros",
  "accent": "#00e5a0",
  "lessons": [
    {
      "id": "fund-01-variaveis",
      "title": "Variáveis e tipos",
      "goal": "Entender variáveis, atribuição e os tipos básicos: int, float, str e bool.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "O que é uma variável?",
            "body": "Uma variável guarda um valor com um nome. Python descobre o tipo sozinho, a partir do valor atribuído — não é preciso declarar o tipo antes, diferente de outras linguagens.",
            "code": "x = 5\ny = 3.14\nnome = \"Ana\"\nativo = True"
          },
          {
            "title": "Tipo int (inteiro)",
            "body": "Números sem casas decimais, como 5, -3 ou 100, são do tipo int."
          },
          {
            "title": "Tipo float (decimal)",
            "body": "Números com casas decimais, como 3.14 ou -0.5, são do tipo float."
          },
          {
            "title": "Tipo str (texto)",
            "body": "Texto entre aspas, como \"Ana\" ou \"Python\", é do tipo str (string). Mesmo um texto só com números, como \"42\", continua sendo str por causa das aspas."
          },
          {
            "title": "Tipo bool (lógico)",
            "body": "Só existem dois valores possíveis: True ou False (sempre com a primeira letra maiúscula em Python). Usado para representar decisões e comparações."
          },
          {
            "title": "Descobrindo o tipo com type()",
            "body": "A função type() devolve o tipo de qualquer valor ou variável — útil para confirmar o que Python \"decidiu\" sozinho.",
            "code": "print(type(5))      # <class 'int'>\nprint(type(3.14))   # <class 'float'>"
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Qual é o tipo do valor de x abaixo?",
          "code": "x = 5",
          "choices": [
            {
              "id": "a",
              "text": "int"
            },
            {
              "id": "b",
              "text": "float"
            },
            {
              "id": "c",
              "text": "str"
            },
            {
              "id": "d",
              "text": "bool"
            }
          ],
          "answer": "a",
          "explanation": "5 não tem ponto decimal nem aspas — é um int (inteiro)."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "E o tipo do valor de y abaixo?",
          "code": "y = \"5\"",
          "choices": [
            {
              "id": "a",
              "text": "int"
            },
            {
              "id": "b",
              "text": "float"
            },
            {
              "id": "c",
              "text": "str"
            },
            {
              "id": "d",
              "text": "bool"
            }
          ],
          "answer": "c",
          "explanation": "As aspas fazem de \"5\" uma string, mesmo parecendo um número."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "O que print(type(x)) exibe quando x = 3.14?",
          "choices": [
            {
              "id": "a",
              "text": "<class 'int'>"
            },
            {
              "id": "b",
              "text": "<class 'float'>"
            },
            {
              "id": "c",
              "text": "<class 'str'>"
            },
            {
              "id": "d",
              "text": "<class 'bool'>"
            }
          ],
          "answer": "b",
          "explanation": "Números com ponto decimal são float."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete: qual função embutida devolve o tipo de um valor?",
          "code": "x = 10\nprint(___(x))",
          "accept": [
            "type"
          ],
          "explanation": "type() devolve a classe (o tipo) do valor passado."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Qual dessas linhas é uma atribuição válida em Python?",
          "choices": [
            {
              "id": "a",
              "text": "x = 5"
            },
            {
              "id": "b",
              "text": "5 = x"
            },
            {
              "id": "c",
              "text": "let x = 5"
            },
            {
              "id": "d",
              "text": "int x = 5"
            }
          ],
          "answer": "a",
          "explanation": "Python não usa \"let\" nem declaração de tipo antes do nome — só nome = valor."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Depois de rodar as duas linhas abaixo, qual é o tipo final de x?",
          "code": "x = 5\nx = \"cinco\"",
          "choices": [
            {
              "id": "a",
              "text": "int"
            },
            {
              "id": "b",
              "text": "str"
            },
            {
              "id": "c",
              "text": "os dois ao mesmo tempo"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "b",
          "explanation": "Python é dinamicamente tipado: uma variável pode ser reatribuída para um valor de outro tipo, e passa a valer o tipo mais recente."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Qual é o valor de bool(0)?",
          "choices": [
            {
              "id": "a",
              "text": "True"
            },
            {
              "id": "b",
              "text": "False"
            },
            {
              "id": "c",
              "text": "0"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "b",
          "explanation": "0 é considerado \"falso\" por Python ao ser convertido para bool."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete: qual função converte a string \"42\" em número inteiro?",
          "code": "idade = ___(\"42\")\nprint(idade + 1)",
          "accept": [
            "int"
          ],
          "explanation": "int() converte um texto numérico em inteiro. float(\"42\") também funcionaria, mas devolveria 42.0."
        }
      ]
    },
    {
      "id": "fund-02-operadores",
      "title": "Operadores e expressões",
      "goal": "Operadores aritméticos, de comparação e lógicos.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Operadores aritméticos básicos",
            "body": "Python usa + (soma), - (subtração), * (multiplicação) e / (divisão) para cálculos com números.",
            "code": "print(5 + 3)  # 8\nprint(5 - 3)  # 2\nprint(5 * 3)  # 15\nprint(5 / 3)  # 1.666..."
          },
          {
            "title": "Divisão inteira (//) e resto (%)",
            "body": "// divide e descarta a parte decimal (divisão inteira); % devolve o resto da divisão.",
            "code": "print(7 // 2)  # 3\nprint(7 % 2)   # 1"
          },
          {
            "title": "Potenciação (**)",
            "body": "** eleva um número a uma potência.",
            "code": "print(2 ** 3)  # 8"
          },
          {
            "title": "Operadores de comparação",
            "body": "== compara se dois valores são iguais; != compara se são diferentes. O resultado de uma comparação é sempre um valor bool (True ou False).",
            "code": "print(5 == 5)  # True\nprint(5 != 3)  # True"
          },
          {
            "title": "Operadores lógicos: and, or, not",
            "body": "and exige que os dois lados sejam True; or basta um lado ser True; not inverte o valor.",
            "code": "print(True and False)  # False\nprint(True or False)   # True\nprint(not True)        # False"
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Qual o resultado de 7 // 2?",
          "choices": [
            {
              "id": "a",
              "text": "3.5"
            },
            {
              "id": "b",
              "text": "3"
            },
            {
              "id": "c",
              "text": "4"
            },
            {
              "id": "d",
              "text": "2"
            }
          ],
          "answer": "b",
          "explanation": "// é a divisão inteira: divide e descarta a parte decimal."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Qual o resultado de 7 % 2?",
          "choices": [
            {
              "id": "a",
              "text": "3"
            },
            {
              "id": "b",
              "text": "3.5"
            },
            {
              "id": "c",
              "text": "0"
            },
            {
              "id": "d",
              "text": "1"
            }
          ],
          "answer": "d",
          "explanation": "% devolve o resto da divisão: 7 dividido por 2 dá 3, com resto 1."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "Qual operador verifica igualdade entre dois valores (sem atribuir nada)?",
          "choices": [
            {
              "id": "a",
              "text": "="
            },
            {
              "id": "b",
              "text": "=="
            },
            {
              "id": "c",
              "text": "==="
            },
            {
              "id": "d",
              "text": "eq"
            }
          ],
          "answer": "b",
          "explanation": "= atribui um valor; == compara dois valores. Python não usa ===."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete o operador que eleva 2 ao cubo (2 elevado a 3):",
          "code": "resultado = 2 ___ 3",
          "accept": [
            "**"
          ],
          "explanation": "** é o operador de potenciação: 2 ** 3 é 8."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Qual o resultado de True and False?",
          "choices": [
            {
              "id": "a",
              "text": "True"
            },
            {
              "id": "b",
              "text": "False"
            },
            {
              "id": "c",
              "text": "None"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "b",
          "explanation": "and só é True quando os dois lados são True."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Qual o resultado de not (5 > 3)?",
          "choices": [
            {
              "id": "a",
              "text": "True"
            },
            {
              "id": "b",
              "text": "False"
            },
            {
              "id": "c",
              "text": "5"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "b",
          "explanation": "5 > 3 é True; not inverte para False."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Qual o resultado de 10 != 10?",
          "choices": [
            {
              "id": "a",
              "text": "True"
            },
            {
              "id": "b",
              "text": "False"
            },
            {
              "id": "c",
              "text": "0"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "b",
          "explanation": "!= é \"diferente de\"; 10 é igual a 10, então o resultado é False."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete o operador lógico \"ou\" em Python:",
          "code": "pode_entrar = tem_ingresso ___ eh_convidado",
          "accept": [
            "or"
          ],
          "explanation": "or é o \"ou\" lógico: basta um dos lados ser True."
        }
      ]
    },
    {
      "id": "fund-07-entrada-dados",
      "title": "Entrada de dados",
      "goal": "Usar input() para ler dados do usuário e converter para o tipo certo.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Por que ler dados do usuário?",
            "body": "Até agora, os valores das variáveis vinham prontos no código. Para um programa interagir de verdade, ele precisa RECEBER informação de quem o usa — em Python, isso é feito com a função input()."
          },
          {
            "title": "A função input()",
            "body": "input() pausa o programa, espera o usuário digitar algo e teclar Enter, e devolve o que foi digitado como uma STRING (texto), mesmo que pareça um número.",
            "code": "nome = input(\"Qual é o seu nome? \")\nprint(\"Olá, \" + nome)"
          },
          {
            "title": "input() sempre devolve texto",
            "body": "Mesmo que o usuário digite \"25\", input() devolve a string \"25\", não o número 25. Para usar como número, é preciso converter com int() ou float(), como já vimos na lição de variáveis.",
            "code": "idade_texto = input(\"Sua idade: \")\nidade = int(idade_texto)\nprint(idade + 1)"
          },
          {
            "title": "Combinando tudo numa linha",
            "body": "É comum escrever a leitura e a conversão numa única linha, chamando int() diretamente sobre o resultado de input().",
            "code": "idade = int(input(\"Sua idade: \"))"
          },
          {
            "title": "Cuidado: conversão pode falhar",
            "body": "Se o usuário digitar algo que não é um número (como \"abc\") e tentarmos converter com int(), o programa gera um erro e para. Mais à frente vamos ver como lidar com isso."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que a função input() faz?",
          "choices": [
            { "id": "a", "text": "Pausa o programa, espera o usuário digitar algo e devolve o texto digitado" },
            { "id": "b", "text": "Converte um texto em número" },
            { "id": "c", "text": "Exibe um valor na tela, sem esperar nada" },
            { "id": "d", "text": "Sempre devolve um número" }
          ],
          "answer": "a",
          "explanation": "input() é o comando de entrada: espera a digitação do usuário e devolve o texto."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Qual o tipo do valor devolvido por input(), mesmo que o usuário digite só números?",
          "choices": [
            { "id": "a", "text": "str (string/texto)" },
            { "id": "b", "text": "int" },
            { "id": "c", "text": "float" },
            { "id": "d", "text": "bool" }
          ],
          "answer": "a",
          "explanation": "input() sempre devolve uma string, independente do que foi digitado."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Dado o código abaixo, o que acontece se o usuário digitar \"25\"?",
          "code": "idade = input(\"Sua idade: \")\nprint(idade + 1)",
          "choices": [
            { "id": "a", "text": "Dá erro, porque idade é uma string e não pode ser somada a um número" },
            { "id": "b", "text": "Imprime 26 normalmente" },
            { "id": "c", "text": "Imprime \"251\"" },
            { "id": "d", "text": "O programa não executa nada" }
          ],
          "answer": "a",
          "explanation": "idade é string (\"25\"); somar string com número diretamente gera erro — seria preciso converter com int() primeiro."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a função que converte o texto lido para número inteiro:",
          "code": "idade = ___(input(\"Sua idade: \"))",
          "accept": ["int"],
          "explanation": "int() converte o texto devolvido por input() em número inteiro."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Por que às vezes escrevemos int(input(...)) numa linha só?",
          "choices": [
            { "id": "a", "text": "Para ler o texto digitado e já converter para número numa única expressão" },
            { "id": "b", "text": "Porque input() já devolve número, e int() não faz nada" },
            { "id": "c", "text": "Porque não é possível usar int() e input() juntos" },
            { "id": "d", "text": "É proibido em Python" }
          ],
          "answer": "a",
          "explanation": "É só uma forma mais curta de ler e converter ao mesmo tempo."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "O que acontece se tentarmos converter com int() um texto que não é um número, como \"abc\"?",
          "choices": [
            { "id": "a", "text": "O programa gera um erro e para" },
            { "id": "b", "text": "Devolve 0 automaticamente" },
            { "id": "c", "text": "Devolve a mesma string sem converter" },
            { "id": "d", "text": "Nada acontece" }
          ],
          "answer": "a",
          "explanation": "int() não consegue converter texto não-numérico, e isso gera um erro (ValueError)."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual das opções lê o nome digitado pelo usuário e guarda na variável nome?",
          "choices": [
            { "id": "a", "text": "nome = input(\"Seu nome: \")" },
            { "id": "b", "text": "nome = print(\"Seu nome: \")" },
            { "id": "c", "text": "input(nome)" },
            { "id": "d", "text": "nome == input()" }
          ],
          "answer": "a",
          "explanation": "input() é chamado e o resultado é atribuído à variável nome."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete a função usada para ler algo digitado pelo usuário:",
          "code": "cidade = ___(\"Onde você mora? \")",
          "accept": ["input"],
          "explanation": "input() é a função que lê o que o usuário digita."
        }
      ]
    },
    {
      "id": "fund-03-condicionais",
      "title": "Condicionais",
      "goal": "if, elif, else e como a indentação organiza o código.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Indentação define os blocos",
            "body": "Diferente de outras linguagens, Python usa indentação (espaços no início da linha) para marcar o que pertence a um bloco — não chaves { } nem palavras como \"begin/end\"."
          },
          {
            "title": "A estrutura if",
            "body": "if testa uma condição; se ela for True, o bloco indentado logo abaixo é executado.",
            "code": "idade = 20\nif idade >= 18:\n    print(\"maior de idade\")"
          },
          {
            "title": "O bloco else",
            "body": "else executa quando a condição do if é False. É opcional: sem ele, nada acontece se a condição for falsa.",
            "code": "if idade >= 18:\n    print(\"maior de idade\")\nelse:\n    print(\"menor de idade\")"
          },
          {
            "title": "Encadeando com elif",
            "body": "elif (contração de \"else if\") testa uma condição alternativa, permitindo várias possibilidades em sequência.",
            "code": "if idade >= 18:\n    print(\"maior\")\nelif idade >= 13:\n    print(\"adolescente\")\nelse:\n    print(\"crianca\")"
          },
          {
            "title": "Valores \"falsy\" em Python",
            "body": "Além de False, alguns valores são tratados como falsos dentro de um if: 0, \"\" (string vazia), [] (lista vazia) e None."
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "O que define um bloco de código em Python, em vez de chaves { }?",
          "choices": [
            {
              "id": "a",
              "text": "Indentação (espaços no início da linha)"
            },
            {
              "id": "b",
              "text": "Ponto e vírgula no fim da linha"
            },
            {
              "id": "c",
              "text": "Parênteses"
            },
            {
              "id": "d",
              "text": "A palavra \"block\""
            }
          ],
          "answer": "a",
          "explanation": "A indentação é obrigatória e define o que está \"dentro\" do if/for/def/etc."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Qual palavra-chave testa uma condição alternativa depois de um if?",
          "choices": [
            {
              "id": "a",
              "text": "elseif"
            },
            {
              "id": "b",
              "text": "elif"
            },
            {
              "id": "c",
              "text": "else if"
            },
            {
              "id": "d",
              "text": "otherwise"
            }
          ],
          "answer": "b",
          "explanation": "Python usa elif, uma palavra só (nem \"elseif\" nem \"else if\")."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "Com idade = 15, qual mensagem é impressa?",
          "code": "idade = 15\nif idade >= 18:\n    print(\"maior\")\nelif idade >= 13:\n    print(\"adolescente\")\nelse:\n    print(\"crianca\")",
          "choices": [
            {
              "id": "a",
              "text": "maior"
            },
            {
              "id": "b",
              "text": "adolescente"
            },
            {
              "id": "c",
              "text": "crianca"
            },
            {
              "id": "d",
              "text": "nada é impresso"
            }
          ],
          "answer": "b",
          "explanation": "15 não é >= 18, mas é >= 13, então cai no elif."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete a palavra-chave que cobre o caso final, quando nenhuma condição anterior foi verdadeira:",
          "code": "if nota >= 7:\n    print(\"aprovado\")\n___:\n    print(\"reprovado\")",
          "accept": [
            "else"
          ],
          "explanation": "else não tem condição própria — executa quando tudo antes foi falso."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "O que acontece se a condição de um if for falsa e não houver else?",
          "choices": [
            {
              "id": "a",
              "text": "Erro de execução"
            },
            {
              "id": "b",
              "text": "O bloco do if é simplesmente pulado"
            },
            {
              "id": "c",
              "text": "Python cria um else vazio automaticamente"
            },
            {
              "id": "d",
              "text": "O programa para"
            }
          ],
          "answer": "b",
          "explanation": "Sem else, nada acontece se a condição for falsa — o programa segue depois do bloco."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Qual desses valores é avaliado como False dentro de um if?",
          "choices": [
            {
              "id": "a",
              "text": "0"
            },
            {
              "id": "b",
              "text": "1"
            },
            {
              "id": "c",
              "text": "\"texto\""
            },
            {
              "id": "d",
              "text": "[1, 2]"
            }
          ],
          "answer": "a",
          "explanation": "0, \"\" (string vazia), [] (lista vazia) e None são \"falsy\" em Python."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Qual o resultado da condição: 5 > 3 and 2 > 1?",
          "choices": [
            {
              "id": "a",
              "text": "True"
            },
            {
              "id": "b",
              "text": "False"
            },
            {
              "id": "c",
              "text": "1"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "a",
          "explanation": "As duas comparações são True, e and exige que ambas sejam."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete para checar, numa única expressão, se x é maior que 1 e menor que 10:",
          "code": "dentro = 1 < x ___ 10",
          "accept": [
            "<"
          ],
          "explanation": "Python permite encadear comparações: 1 < x < 10 equivale a (1 < x) and (x < 10)."
        }
      ]
    },
    {
      "id": "fund-04-lacos",
      "title": "Laços de repetição",
      "goal": "for, while, range(), break e continue.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "O laço while",
            "body": "while repete um bloco enquanto uma condição for True. A condição é testada antes de cada repetição."
          },
          {
            "title": "O laço for e a função range()",
            "body": "for percorre uma sequência. range(n) gera os números de 0 até n-1.",
            "code": "for i in range(5):\n    print(i)"
          },
          {
            "title": "break: interrompendo o laço",
            "body": "break sai do laço imediatamente, mesmo que a condição ainda fosse True.",
            "code": "for i in range(10):\n    if i == 3:\n        break\n    print(i)"
          },
          {
            "title": "continue: pulando para a próxima repetição",
            "body": "continue volta para o início do laço, pulando o que vem depois dele no bloco, sem sair do laço.",
            "code": "for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i)"
          },
          {
            "title": "enumerate(): índice e valor juntos",
            "body": "enumerate() devolve pares (índice, valor) a cada repetição, útil quando é preciso saber a posição também.",
            "code": "for indice, valor in enumerate([\"a\", \"b\", \"c\"]):\n    print(indice, valor)"
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Qual estrutura repete um bloco enquanto uma condição for verdadeira?",
          "choices": [
            {
              "id": "a",
              "text": "for"
            },
            {
              "id": "b",
              "text": "while"
            },
            {
              "id": "c",
              "text": "repeat"
            },
            {
              "id": "d",
              "text": "loop"
            }
          ],
          "answer": "b",
          "explanation": "while repete enquanto a condição continuar verdadeira."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Quais números range(5) gera?",
          "choices": [
            {
              "id": "a",
              "text": "1, 2, 3, 4, 5"
            },
            {
              "id": "b",
              "text": "0, 1, 2, 3, 4"
            },
            {
              "id": "c",
              "text": "0, 1, 2, 3, 4, 5"
            },
            {
              "id": "d",
              "text": "só o número 5"
            }
          ],
          "answer": "b",
          "explanation": "range(n) começa em 0 e vai até n-1."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "Qual comando interrompe um laço imediatamente, antes dele terminar sozinho?",
          "choices": [
            {
              "id": "a",
              "text": "continue"
            },
            {
              "id": "b",
              "text": "break"
            },
            {
              "id": "c",
              "text": "stop"
            },
            {
              "id": "d",
              "text": "exit"
            }
          ],
          "answer": "b",
          "explanation": "break sai do laço na hora, mesmo que a condição ainda fosse verdadeira."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete para pular para a próxima repetição sem executar o resto do bloco:",
          "code": "for i in range(10):\n    if i % 2 == 0:\n        ___\n    print(i)",
          "accept": [
            "continue"
          ],
          "explanation": "continue volta para o topo do laço, pulando o que vem depois dele no bloco."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Quantas vezes o laço abaixo executa?",
          "code": "for i in range(3):\n    print(i)",
          "choices": [
            {
              "id": "a",
              "text": "2"
            },
            {
              "id": "b",
              "text": "3"
            },
            {
              "id": "c",
              "text": "4"
            },
            {
              "id": "d",
              "text": "infinitas"
            }
          ],
          "answer": "b",
          "explanation": "range(3) gera 0, 1, 2 — três valores."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "O que acontece se a condição de um while nunca se tornar falsa?",
          "choices": [
            {
              "id": "a",
              "text": "Erro de sintaxe"
            },
            {
              "id": "b",
              "text": "Laço infinito"
            },
            {
              "id": "c",
              "text": "Python encerra depois de 100 repetições"
            },
            {
              "id": "d",
              "text": "O laço é ignorado"
            }
          ],
          "answer": "b",
          "explanation": "Sem uma condição que se torne falsa (ou um break), o while roda para sempre."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Qual é o valor de i na última repetição de: for i in range(5):",
          "choices": [
            {
              "id": "a",
              "text": "5"
            },
            {
              "id": "b",
              "text": "4"
            },
            {
              "id": "c",
              "text": "0"
            },
            {
              "id": "d",
              "text": "6"
            }
          ],
          "answer": "b",
          "explanation": "range(5) vai de 0 a 4 — o último valor é 4."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete a função embutida que devolve índice e valor juntos ao iterar:",
          "code": "for indice, valor in ___(lista):\n    print(indice, valor)",
          "accept": [
            "enumerate"
          ],
          "explanation": "enumerate() devolve pares (índice, valor) a cada repetição."
        }
      ]
    },
    {
      "id": "fund-05-listas-dicionarios",
      "title": "Listas e dicionários",
      "goal": "Guardar e acessar coleções de valores com listas e dicionários.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Listas: coleções ordenadas",
            "body": "Uma lista guarda vários valores em ordem, acessados por posição (índice), começando em 0.",
            "code": "nums = [10, 20, 30]\nprint(nums[0])  # 10"
          },
          {
            "title": "Métodos de lista: append() e pop()",
            "body": "append() adiciona um item ao final da lista; pop() remove e devolve o último item.",
            "code": "nums.append(40)      # [10, 20, 30, 40]\nultimo = nums.pop()  # 40; nums vira [10, 20, 30]"
          },
          {
            "title": "Índices negativos",
            "body": "nums[-1] acessa o último elemento da lista — índices negativos contam a partir do final."
          },
          {
            "title": "Dicionários: chave e valor",
            "body": "Um dicionário associa uma chave a um valor, acessado com colchetes e a chave entre aspas.",
            "code": "pessoa = {\"nome\": \"Ana\", \"idade\": 30}\nprint(pessoa[\"nome\"])  # \"Ana\""
          },
          {
            "title": "O método .get() com valor padrão",
            "body": ".get(chave, padrao) evita erro quando a chave não existe, devolvendo o valor padrão nesse caso.",
            "code": "idade = pessoa.get(\"idade\", 0)"
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Como acessar o primeiro elemento da lista nums?",
          "choices": [
            {
              "id": "a",
              "text": "nums[0]"
            },
            {
              "id": "b",
              "text": "nums[1]"
            },
            {
              "id": "c",
              "text": "nums.first()"
            },
            {
              "id": "d",
              "text": "nums(0)"
            }
          ],
          "answer": "a",
          "explanation": "Listas em Python começam no índice 0."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Qual método adiciona um item ao final de uma lista?",
          "choices": [
            {
              "id": "a",
              "text": "add()"
            },
            {
              "id": "b",
              "text": "append()"
            },
            {
              "id": "c",
              "text": "push()"
            },
            {
              "id": "d",
              "text": "insert()"
            }
          ],
          "answer": "b",
          "explanation": "append() acrescenta um item ao final da lista."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "O que nums[-1] retorna?",
          "choices": [
            {
              "id": "a",
              "text": "Erro"
            },
            {
              "id": "b",
              "text": "O primeiro elemento"
            },
            {
              "id": "c",
              "text": "O último elemento"
            },
            {
              "id": "d",
              "text": "None"
            }
          ],
          "answer": "c",
          "explanation": "Índices negativos contam a partir do final: -1 é o último item."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete o método que remove e devolve o último item de uma lista:",
          "code": "ultimo = nums.___()",
          "accept": [
            "pop"
          ],
          "explanation": "pop() sem argumento remove e devolve o último elemento."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Como acessar o valor associado à chave \"nome\" no dicionário pessoa?",
          "choices": [
            {
              "id": "a",
              "text": "pessoa[\"nome\"]"
            },
            {
              "id": "b",
              "text": "pessoa.nome"
            },
            {
              "id": "c",
              "text": "pessoa(nome)"
            },
            {
              "id": "d",
              "text": "pessoa->nome"
            }
          ],
          "answer": "a",
          "explanation": "Dicionários usam colchetes com a chave entre aspas."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "O que len([1, 2, 3]) retorna?",
          "choices": [
            {
              "id": "a",
              "text": "2"
            },
            {
              "id": "b",
              "text": "3"
            },
            {
              "id": "c",
              "text": "[1, 2, 3]"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "b",
          "explanation": "len() devolve a quantidade de itens — a lista tem 3."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Dicionários em Python associam:",
          "choices": [
            {
              "id": "a",
              "text": "Índice a valor, como listas"
            },
            {
              "id": "b",
              "text": "Chave a valor"
            },
            {
              "id": "c",
              "text": "Apenas strings entre si"
            },
            {
              "id": "d",
              "text": "Nada — são idênticos a listas"
            }
          ],
          "answer": "b",
          "explanation": "Cada chave (geralmente uma string) mapeia para um valor."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete o método de dicionário que devolve um valor padrão quando a chave não existe:",
          "code": "idade = pessoa.___(\"idade\", 0)",
          "accept": [
            "get"
          ],
          "explanation": "get(chave, padrao) evita erro quando a chave não existe, devolvendo o padrão."
        }
      ]
    },
    {
      "id": "fund-10-tuplas-conjuntos",
      "title": "Tuplas e conjuntos",
      "goal": "Entender tuplas (imutáveis) e sets (sem ordem e sem duplicatas).",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Tupla: como uma lista, mas imutável",
            "body": "Uma tupla guarda vários valores em ordem, como uma lista, mas é escrita com parênteses ( ) em vez de colchetes. A diferença essencial: uma tupla não pode ser alterada depois de criada.",
            "code": "coordenada = (10, 20)\nprint(coordenada[0])  # 10"
          },
          {
            "title": "Por que usar uma tupla em vez de uma lista?",
            "body": "Quando um conjunto de valores não deve mudar (como as coordenadas x, y de um ponto fixo), a tupla deixa essa intenção clara no código e evita alterações acidentais."
          },
          {
            "title": "Tentar alterar uma tupla dá erro",
            "body": "Diferente da lista, atribuir um novo valor a uma posição de uma tupla gera um erro, porque tuplas são imutáveis.",
            "code": "coordenada = (10, 20)\ncoordenada[0] = 99\n# TypeError: 'tuple' object does not support item assignment"
          },
          {
            "title": "Set: uma coleção sem ordem e sem repetição",
            "body": "Um set guarda valores únicos, sem posições fixas (não dá pra acessar por índice) e sem duplicatas — se você tentar adicionar um valor que já existe, nada muda.",
            "code": "numeros = {1, 2, 3, 2, 1}\nprint(numeros)  # {1, 2, 3}"
          },
          {
            "title": "Operações comuns com set",
            "body": ".add() adiciona um valor ao set; o operador in verifica rapidamente se um valor está presente.",
            "code": "frutas = {\"maçã\", \"banana\"}\nfrutas.add(\"uva\")\nprint(\"banana\" in frutas)  # True"
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Qual a principal diferença entre uma tupla e uma lista?",
          "choices": [
            { "id": "a", "text": "A tupla é imutável — não pode ser alterada depois de criada" },
            { "id": "b", "text": "A tupla só guarda números" },
            { "id": "c", "text": "A lista não pode ter mais de 3 itens" },
            { "id": "d", "text": "Não existe diferença nenhuma" }
          ],
          "answer": "a",
          "explanation": "Imutabilidade é a característica que distingue a tupla da lista."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Como uma tupla é escrita em Python?",
          "choices": [
            { "id": "a", "text": "Com parênteses, como (10, 20)" },
            { "id": "b", "text": "Com colchetes, como [10, 20]" },
            { "id": "c", "text": "Com chaves, como {10, 20}" },
            { "id": "d", "text": "Sem símbolo nenhum" }
          ],
          "answer": "a",
          "explanation": "Parênteses são a notação usada para criar uma tupla."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que acontece ao tentar executar coordenada[0] = 99 numa tupla?",
          "code": "coordenada = (10, 20)\ncoordenada[0] = 99",
          "choices": [
            { "id": "a", "text": "Gera um erro, porque tuplas são imutáveis" },
            { "id": "b", "text": "Funciona normalmente, como numa lista" },
            { "id": "c", "text": "Cria uma nova posição" },
            { "id": "d", "text": "Apaga a tupla inteira" }
          ],
          "answer": "a",
          "explanation": "Tuplas não suportam atribuição de item — a tentativa gera TypeError."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o símbolo de abertura usado para criar uma tupla:",
          "code": "coordenada = ___10, 20)",
          "accept": ["("],
          "explanation": "Parênteses abrem (e fecham) a criação de uma tupla."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que caracteriza um set (conjunto) em Python?",
          "choices": [
            { "id": "a", "text": "Guarda valores únicos, sem ordem fixa e sem duplicatas" },
            { "id": "b", "text": "Guarda valores em ordem, com índices como uma lista" },
            { "id": "c", "text": "Guarda pares chave-valor, como um dicionário" },
            { "id": "d", "text": "Só pode guardar números" }
          ],
          "answer": "a",
          "explanation": "Unicidade e ausência de ordem são as características centrais do set."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "O que acontece com numeros = {1, 2, 3, 2, 1}?",
          "choices": [
            { "id": "a", "text": "O set fica {1, 2, 3} — duplicatas são removidas automaticamente" },
            { "id": "b", "text": "Dá erro por causa dos valores repetidos" },
            { "id": "c", "text": "O set guarda todos os 5 valores, incluindo repetidos" },
            { "id": "d", "text": "O set fica vazio" }
          ],
          "answer": "a",
          "explanation": "Sets nunca guardam valores duplicados — cada valor aparece só uma vez."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual método adiciona um valor a um set?",
          "choices": [
            { "id": "a", "text": ".add()" },
            { "id": "b", "text": ".append()" },
            { "id": "c", "text": ".insert()" },
            { "id": "d", "text": ".push()" }
          ],
          "answer": "a",
          "explanation": ".add() é o método usado para inserir um valor num set (diferente de .append() das listas)."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o operador usado para checar se um valor está dentro de um set:",
          "code": "print(\"banana\" ___ frutas)",
          "accept": ["in"],
          "explanation": "O operador in verifica a presença de um valor numa coleção."
        }
      ]
    },
    {
      "id": "fund-06-funcoes",
      "title": "Funções",
      "goal": "Definir e chamar funções, parâmetros, valores padrão e return.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Definindo uma função com def",
            "body": "def inicia a definição de uma função, seguido do nome dela e parênteses com os parâmetros.",
            "code": "def soma(a, b):\n    return a + b"
          },
          {
            "title": "O comando return",
            "body": "return devolve um valor da função para quem a chamou, e encerra a execução dela naquele ponto."
          },
          {
            "title": "Parâmetros com valor padrão",
            "body": "Um parâmetro pode ter um valor padrão, usado automaticamente quando o argumento correspondente não é passado na chamada.",
            "code": "def soma(a, b=10):\n    return a + b\n\nprint(soma(5))     # 15\nprint(soma(5, 1))  # 6"
          },
          {
            "title": "Escopo local",
            "body": "Uma variável criada dentro de uma função só existe ali dentro (escopo local) — ela some quando a função termina de executar."
          },
          {
            "title": "Função sem return",
            "body": "Uma função sem return explícito devolve None automaticamente, mesmo que ela imprima algo na tela com print()."
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Qual palavra-chave define uma função em Python?",
          "choices": [
            {
              "id": "a",
              "text": "function"
            },
            {
              "id": "b",
              "text": "def"
            },
            {
              "id": "c",
              "text": "func"
            },
            {
              "id": "d",
              "text": "fn"
            }
          ],
          "answer": "b",
          "explanation": "def inicia a definição de uma função."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "O que a palavra-chave return faz?",
          "choices": [
            {
              "id": "a",
              "text": "Só imprime um valor na tela"
            },
            {
              "id": "b",
              "text": "Devolve um valor da função e encerra a execução dela"
            },
            {
              "id": "c",
              "text": "Repete a função automaticamente"
            },
            {
              "id": "d",
              "text": "Não faz nada em Python"
            }
          ],
          "answer": "b",
          "explanation": "return entrega o valor para quem chamou a função e para a execução ali."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "Qual o resultado de soma(5), dado o código abaixo?",
          "code": "def soma(a, b=10):\n    return a + b",
          "choices": [
            {
              "id": "a",
              "text": "5"
            },
            {
              "id": "b",
              "text": "10"
            },
            {
              "id": "c",
              "text": "15"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "c",
          "explanation": "b não foi passado, então usa o padrão 10: 5 + 10 = 15."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete para chamar a função soma passando 3 e 4 como argumentos:",
          "code": "resultado = ___(3, 4)",
          "accept": [
            "soma"
          ],
          "explanation": "Chamar uma função é escrever o nome dela seguido de parênteses com os argumentos."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Uma variável criada dentro de uma função:",
          "choices": [
            {
              "id": "a",
              "text": "Fica disponível globalmente depois"
            },
            {
              "id": "b",
              "text": "Só existe dentro da função (escopo local)"
            },
            {
              "id": "c",
              "text": "Gera erro sempre"
            },
            {
              "id": "d",
              "text": "Vira uma constante"
            }
          ],
          "answer": "b",
          "explanation": "Variáveis definidas dentro de uma função têm escopo local — somem quando ela termina."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Uma função sem return explícito devolve:",
          "choices": [
            {
              "id": "a",
              "text": "0"
            },
            {
              "id": "b",
              "text": "\"\" (string vazia)"
            },
            {
              "id": "c",
              "text": "None"
            },
            {
              "id": "d",
              "text": "Erro"
            }
          ],
          "answer": "c",
          "explanation": "Sem return, o valor devolvido é sempre None."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Qual dessas é uma chamada de função válida?",
          "choices": [
            {
              "id": "a",
              "text": "soma 3, 4"
            },
            {
              "id": "b",
              "text": "soma(3, 4)"
            },
            {
              "id": "c",
              "text": "soma[3, 4]"
            },
            {
              "id": "d",
              "text": "call soma(3, 4)"
            }
          ],
          "answer": "b",
          "explanation": "Chamadas de função sempre usam parênteses."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete a palavra-chave que devolve o dobro de x como resultado da função:",
          "code": "def dobro(x):\n    ___ x * 2",
          "accept": [
            "return"
          ],
          "explanation": "return é o que faz o valor calculado sair da função."
        }
      ]
    },
    {
      "id": "fund-08-strings",
      "title": "Manipulação de texto",
      "goal": "Indexação, fatiamento, métodos de string e f-strings.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "Strings são sequências de caracteres",
            "body": "Assim como uma lista, uma string em Python pode ser acessada por índice: cada caractere tem uma posição, começando em 0.",
            "code": "nome = \"Python\"\nprint(nome[0])  # 'P'\nprint(nome[5])  # 'n'"
          },
          {
            "title": "Fatiamento (slicing)",
            "body": "Podemos pegar um PEDAÇO de uma string com nome[inicio:fim] — o caractere na posição \"fim\" NÃO é incluído.",
            "code": "nome = \"Python\"\nprint(nome[0:3])  # 'Pyt'\nprint(nome[2:])   # 'thon'"
          },
          {
            "title": "Métodos úteis de string",
            "body": "Strings têm métodos prontos: .upper() deixa tudo maiúsculo, .lower() tudo minúsculo, .strip() remove espaços do início/fim, .replace(a, b) troca um trecho por outro.",
            "code": "texto = \"  Olá Mundo  \"\nprint(texto.strip())  # \"Olá Mundo\""
          },
          {
            "title": "Dividindo uma string com split()",
            "body": ".split() quebra uma string em uma LISTA de pedaços, usando um separador (por padrão, espaço).",
            "code": "frase = \"Python é divertido\"\npalavras = frase.split()\nprint(palavras)  # ['Python', 'é', 'divertido']"
          },
          {
            "title": "f-strings: montando texto com variáveis",
            "body": "Uma f-string (escrita como f\"...\") permite inserir o valor de variáveis direto dentro do texto, usando chaves { }.",
            "code": "nome = \"Ana\"\nidade = 20\nprint(f\"{nome} tem {idade} anos\")"
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Como acessamos o primeiro caractere de uma string chamada nome?",
          "choices": [
            { "id": "a", "text": "nome[0]" },
            { "id": "b", "text": "nome[1]" },
            { "id": "c", "text": "nome.primeiro()" },
            { "id": "d", "text": "nome(0)" }
          ],
          "answer": "a",
          "explanation": "O índice de caracteres numa string começa em 0, igual numa lista."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Dado nome = \"Python\", o que nome[0:3] devolve?",
          "choices": [
            { "id": "a", "text": "\"Pyt\"" },
            { "id": "b", "text": "\"Pyth\"" },
            { "id": "c", "text": "\"yth\"" },
            { "id": "d", "text": "\"on\"" }
          ],
          "answer": "a",
          "explanation": "O fatiamento [0:3] pega os índices 0, 1 e 2 — o índice 3 não é incluído."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que o método .strip() faz?",
          "choices": [
            { "id": "a", "text": "Remove espaços em branco do início e do fim da string" },
            { "id": "b", "text": "Deixa tudo maiúsculo" },
            { "id": "c", "text": "Divide a string em uma lista" },
            { "id": "d", "text": "Junta duas strings" }
          ],
          "answer": "a",
          "explanation": ".strip() remove espaços (ou outros caracteres) das bordas da string."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o método que deixa toda a string em maiúsculas:",
          "code": "nome = \"ana\"\nprint(nome.___())  # \"ANA\"",
          "accept": ["upper"],
          "explanation": ".upper() converte todos os caracteres para maiúsculo."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que o método .split() devolve?",
          "choices": [
            { "id": "a", "text": "Uma lista com os pedaços da string, separados por um delimitador" },
            { "id": "b", "text": "Um único número" },
            { "id": "c", "text": "A mesma string sem mudanças" },
            { "id": "d", "text": "Um valor lógico" }
          ],
          "answer": "a",
          "explanation": ".split() quebra a string numa lista de pedaços."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual das opções é uma f-string válida?",
          "choices": [
            { "id": "a", "text": "f\"Olá, {nome}!\"" },
            { "id": "b", "text": "\"Olá, f{nome}!\"" },
            { "id": "c", "text": "fstring(\"Olá, \" + nome)" },
            { "id": "d", "text": "f(Olá, {nome}!)" }
          ],
          "answer": "a",
          "explanation": "f-strings usam o prefixo f antes das aspas, com variáveis entre chaves."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Dado nome = \"Ana\" e idade = 20, o que f\"{nome} tem {idade} anos\" produz?",
          "choices": [
            { "id": "a", "text": "\"Ana tem 20 anos\"" },
            { "id": "b", "text": "\"{nome} tem {idade} anos\"" },
            { "id": "c", "text": "\"nome tem idade anos\"" },
            { "id": "d", "text": "Erro" }
          ],
          "answer": "a",
          "explanation": "A f-string substitui {nome} e {idade} pelos valores das variáveis."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o método que substitui um trecho da string por outro:",
          "code": "texto = \"Olá Mundo\"\nprint(texto.___(\"Mundo\", \"Python\"))  # \"Olá Python\"",
          "accept": ["replace"],
          "explanation": ".replace(antigo, novo) troca todas as ocorrências de um trecho por outro."
        }
      ]
    },
    {
      "id": "fund-09-erros",
      "title": "Tratamento de erros",
      "goal": "Usar try/except para lidar com erros sem derrubar o programa.",
      "xp": 20,
      "intro": {
        "slides": [
          {
            "title": "O que acontece quando um erro ocorre?",
            "body": "Quando o Python encontra um erro durante a execução (como converter \"abc\" para número), ele gera uma EXCEÇÃO e o programa PARA imediatamente, mostrando uma mensagem de erro.",
            "code": "idade = int(\"abc\")  # ValueError: invalid literal for int()"
          },
          {
            "title": "O bloco try/except",
            "body": "try/except permite \"tentar\" um trecho de código que pode dar erro, e definir o que fazer SE o erro acontecer, sem derrubar o programa inteiro.",
            "code": "try:\n    idade = int(input(\"Sua idade: \"))\n    print(idade)\nexcept:\n    print(\"Isso não é um número válido!\")"
          },
          {
            "title": "Capturando o tipo específico de erro",
            "body": "É possível capturar um tipo específico de exceção, como ValueError (erro de conversão), em vez de qualquer erro genérico — isso ajuda a tratar cada problema de um jeito apropriado.",
            "code": "try:\n    idade = int(input(\"Sua idade: \"))\nexcept ValueError:\n    print(\"Digite um número válido!\")"
          },
          {
            "title": "Por que tratar erros é importante?",
            "body": "Sem tratamento de erros, qualquer entrada inválida do usuário derrubaria o programa inteiro. Com try/except, o programa continua rodando e pode pedir a informação de novo ou seguir de outro jeito."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que acontece quando o Python encontra um erro durante a execução e não há tratamento nenhum?",
          "choices": [
            { "id": "a", "text": "O programa para imediatamente e mostra uma mensagem de erro" },
            { "id": "b", "text": "O programa ignora o erro e continua normalmente" },
            { "id": "c", "text": "O erro é corrigido automaticamente" },
            { "id": "d", "text": "Nada acontece" }
          ],
          "answer": "a",
          "explanation": "Sem tratamento, uma exceção não capturada interrompe o programa."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Para que serve o bloco try/except?",
          "choices": [
            { "id": "a", "text": "Para tentar um trecho de código que pode dar erro, e tratar o erro sem derrubar o programa" },
            { "id": "b", "text": "Para repetir um bloco de código várias vezes" },
            { "id": "c", "text": "Para definir uma função" },
            { "id": "d", "text": "Para ler dados do usuário" }
          ],
          "answer": "a",
          "explanation": "try/except captura erros e permite decidir o que fazer quando eles acontecem."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "No código abaixo, o que acontece se o usuário digitar \"abc\"?",
          "code": "try:\n    idade = int(input(\"Sua idade: \"))\nexcept:\n    print(\"Isso não é um número válido!\")",
          "choices": [
            { "id": "a", "text": "O bloco except é executado, imprimindo a mensagem de erro tratada" },
            { "id": "b", "text": "O programa para com um erro não tratado" },
            { "id": "c", "text": "idade recebe o valor \"abc\"" },
            { "id": "d", "text": "Nada é impresso" }
          ],
          "answer": "a",
          "explanation": "O erro de conversão é capturado pelo except, e a mensagem tratada é exibida em vez do programa quebrar."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a palavra-chave que define o bloco a ser tentado:",
          "code": "___:\n    idade = int(input(\"Sua idade: \"))\nexcept:\n    print(\"Erro!\")",
          "accept": ["try"],
          "explanation": "try inicia o bloco que será executado, com o risco de dar erro."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Qual a vantagem de capturar um tipo específico de erro (como ValueError) em vez de qualquer erro genérico?",
          "choices": [
            { "id": "a", "text": "Permite tratar cada tipo de problema de um jeito apropriado" },
            { "id": "b", "text": "Não existe vantagem nenhuma" },
            { "id": "c", "text": "Só funciona com números pares" },
            { "id": "d", "text": "Impede qualquer erro de acontecer" }
          ],
          "answer": "a",
          "explanation": "Capturar tipos específicos evita tratar erros muito diferentes da mesma forma genérica."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Por que tratar erros é importante num programa interativo?",
          "choices": [
            { "id": "a", "text": "Sem tratamento, uma entrada inválida do usuário derrubaria o programa inteiro" },
            { "id": "b", "text": "Erros nunca acontecem em Python" },
            { "id": "c", "text": "Só serve para deixar o código mais bonito" },
            { "id": "d", "text": "Não afeta o funcionamento do programa" }
          ],
          "answer": "a",
          "explanation": "Tratar erros mantém o programa rodando mesmo diante de entradas inesperadas."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual exceção é comumente gerada ao tentar converter um texto inválido para número com int()?",
          "choices": [
            { "id": "a", "text": "ValueError" },
            { "id": "b", "text": "TypeError sempre" },
            { "id": "c", "text": "SyntaxError" },
            { "id": "d", "text": "Nenhuma, a conversão nunca falha" }
          ],
          "answer": "a",
          "explanation": "ValueError é a exceção padrão para conversões inválidas com int()/float()."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete a palavra-chave que define o que fazer quando o erro acontece:",
          "code": "try:\n    idade = int(input(\"Sua idade: \"))\n___:\n    print(\"Erro!\")",
          "accept": ["except"],
          "explanation": "except define o bloco executado quando o try falha."
        }
      ]
    }
  ]
};
