// Módulo "Fundamentos" (iniciante) — 6 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ./index.js para o formato e a validação de boot.
module.exports = {
  "id": "fundamentos",
  "levelKey": "beginner",
  "order": 1,
  "title": "Fundamentos",
  "subtitle": "Variáveis, tipos e a base da linguagem",
  "accent": "#00e5a0",
  "lessons": [
    {
      "id": "fund-01-variaveis",
      "title": "Variáveis e tipos",
      "goal": "Entender variáveis, atribuição e os tipos básicos: int, float, str e bool.",
      "xp": 20,
      "intro": {
        "body": "Uma variável guarda um valor com um nome. Python descobre o tipo sozinho, a partir do valor atribuído — não é preciso declarar o tipo antes.",
        "code": "x = 5\ny = 3.14\nnome = \"Ana\"\nativo = True"
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
        "body": "Além de + - * /, Python tem // (divisão inteira), % (resto da divisão) e ** (potência). Comparações usam == (igual) e != (diferente); os operadores lógicos são and, or e not, escritos por extenso.",
        "code": "print(7 // 2)  # 3\nprint(7 % 2)   # 1\nprint(2 ** 3)  # 8"
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
      "id": "fund-03-condicionais",
      "title": "Condicionais",
      "goal": "if, elif, else e como a indentação organiza o código.",
      "xp": 20,
      "intro": {
        "body": "Python usa indentação (espaços no início da linha) para marcar o que pertence a um bloco, em vez de chaves { }. if testa uma condição, elif testa outra alternativa e else cobre o que sobrar.",
        "code": "if idade >= 18:\n    print(\"maior de idade\")\nelse:\n    print(\"menor de idade\")"
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
        "body": "for percorre uma sequência (como range(5), que gera 0,1,2,3,4). while repete enquanto uma condição for verdadeira. break interrompe o laço; continue pula para a próxima repetição.",
        "code": "for i in range(5):\n    if i == 3:\n        break\n    print(i)"
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
        "body": "Uma lista guarda vários valores em ordem, acessados por posição (começando em 0). Um dicionário guarda pares chave-valor, acessados pela chave.",
        "code": "nums = [10, 20, 30]\npessoa = {\"nome\": \"Ana\", \"idade\": 30}"
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
      "id": "fund-06-funcoes",
      "title": "Funções",
      "goal": "Definir e chamar funções, parâmetros, valores padrão e return.",
      "xp": 20,
      "intro": {
        "body": "def define uma função; return devolve um valor e encerra a execução dela. Parâmetros podem ter valor padrão, usado quando o argumento não é passado na chamada.",
        "code": "def soma(a, b=10):\n    return a + b\n\nprint(soma(5))     # 15\nprint(soma(5, 1))  # 6"
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
    }
  ]
};
