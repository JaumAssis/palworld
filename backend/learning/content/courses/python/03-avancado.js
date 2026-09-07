// Módulo "Avançado" — amostra da v1 (2 lições). Mais lições entram aqui depois, sem mudar
// lógica nenhuma. Ver ./index.js para o formato e a validação de boot.
module.exports = {
  "id": "avancado",
  "levelKey": "advanced",
  "order": 3,
  "title": "Avançado",
  "subtitle": "Generators e decorators",
  "accent": "#c084fc",
  "lessons": [
    {
      "id": "adv-01-geradores",
      "title": "Iteradores e geradores",
      "goal": "Entender yield e como generators produzem valores sob demanda.",
      "xp": 30,
      "intro": {
        "body": "yield pausa uma função e devolve um valor, guardando o ponto exato para continuar na próxima chamada. Uma função com yield é um generator: produz valores um de cada vez, em vez de montar uma lista inteira na memória de uma vez.",
        "code": "def contar_ate(n):\n    i = 1\n    while i <= n:\n        yield i\n        i += 1\n\nfor x in contar_ate(3):\n    print(x)  # 1, 2, 3"
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "O que a palavra-chave yield faz dentro de uma função?",
          "choices": [
            {
              "id": "a",
              "text": "Encerra a função, como return"
            },
            {
              "id": "b",
              "text": "Pausa a função e devolve um valor, podendo retomar de onde parou"
            },
            {
              "id": "c",
              "text": "Repete a função para sempre"
            },
            {
              "id": "d",
              "text": "Só funciona dentro de classes"
            }
          ],
          "answer": "b",
          "explanation": "Diferente de return, yield guarda o estado da função para continuar na próxima chamada."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Uma função que contém yield é chamada de:",
          "choices": [
            {
              "id": "a",
              "text": "Iterador"
            },
            {
              "id": "b",
              "text": "Gerador (generator)"
            },
            {
              "id": "c",
              "text": "Decorator"
            },
            {
              "id": "d",
              "text": "Classe"
            }
          ],
          "answer": "b",
          "explanation": "yield é o que transforma uma função comum numa função geradora."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "Qual a principal vantagem de um generator sobre montar uma lista inteira na memória?",
          "choices": [
            {
              "id": "a",
              "text": "Produz os valores um de cada vez, sob demanda, economizando memória"
            },
            {
              "id": "b",
              "text": "É sempre mais rápido para qualquer tarefa"
            },
            {
              "id": "c",
              "text": "Só funciona com números"
            },
            {
              "id": "d",
              "text": "Não existe vantagem nenhuma"
            }
          ],
          "answer": "a",
          "explanation": "Isso é essencial para sequências muito grandes (ou infinitas), onde uma lista completa não caberia na memória."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete a palavra-chave que faz esta função devolver um valor de cada vez, sob demanda:",
          "code": "def contar():\n    i = 0\n    while True:\n        ___ i\n        i += 1",
          "accept": [
            "yield"
          ],
          "explanation": "yield é o que faz a função pausar e devolver i a cada chamada de next()."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Como pedir manualmente o próximo valor de um generator, sem usar um for?",
          "choices": [
            {
              "id": "a",
              "text": "next(gerador)"
            },
            {
              "id": "b",
              "text": "gerador.next()"
            },
            {
              "id": "c",
              "text": "gerador()"
            },
            {
              "id": "d",
              "text": "gerador[0]"
            }
          ],
          "answer": "a",
          "explanation": "next() é a função embutida que avança um iterador/generator manualmente."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "O que acontece quando um generator não tem mais valores e next() é chamado de novo?",
          "choices": [
            {
              "id": "a",
              "text": "Devolve None"
            },
            {
              "id": "b",
              "text": "Levanta a exceção StopIteration"
            },
            {
              "id": "c",
              "text": "Reinicia do começo automaticamente"
            },
            {
              "id": "d",
              "text": "Trava o programa"
            }
          ],
          "answer": "b",
          "explanation": "É assim que o for sabe quando parar de iterar — ele captura essa exceção internamente."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "O que (x**2 for x in range(5)), com parênteses, cria?",
          "choices": [
            {
              "id": "a",
              "text": "Uma lista"
            },
            {
              "id": "b",
              "text": "Um generator"
            },
            {
              "id": "c",
              "text": "Um dicionário"
            },
            {
              "id": "d",
              "text": "Um erro de sintaxe"
            }
          ],
          "answer": "b",
          "explanation": "Parênteses em vez de colchetes criam uma \"generator expression\" — a mesma ideia da list comprehension, mas preguiçosa."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete a função embutida usada para pedir manualmente o próximo valor de um iterador:",
          "code": "valor = ___(gerador)",
          "accept": [
            "next"
          ],
          "explanation": "next(iterador) avança e devolve o próximo valor produzido."
        }
      ]
    },
    {
      "id": "adv-02-decorators",
      "title": "Decorators",
      "goal": "Entender a sintaxe @ e como decorators estendem funções.",
      "xp": 30,
      "intro": {
        "body": "Um decorator é uma função que recebe outra função e devolve uma versão estendida dela, sem alterar o código original. A sintaxe @nome_do_decorator, colocada acima de uma função, aplica esse decorator a ela.",
        "code": "def log(func):\n    def wrapper(*args):\n        print(\"chamando\", func.__name__)\n        return func(*args)\n    return wrapper\n\n@log\ndef ola():\n    print(\"oi\")\n\nola()"
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Um decorator é, basicamente:",
          "choices": [
            {
              "id": "a",
              "text": "Uma função que recebe outra função e devolve uma versão estendida dela"
            },
            {
              "id": "b",
              "text": "Uma palavra reservada exclusiva de classes"
            },
            {
              "id": "c",
              "text": "Um tipo de laço de repetição"
            },
            {
              "id": "d",
              "text": "Um jeito de importar módulos"
            }
          ],
          "answer": "a",
          "explanation": "É uma função que \"embrulha\" outra, adicionando comportamento antes/depois de chamá-la."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Qual símbolo é usado para aplicar um decorator a uma função?",
          "choices": [
            {
              "id": "a",
              "text": "#"
            },
            {
              "id": "b",
              "text": "@"
            },
            {
              "id": "c",
              "text": "&"
            },
            {
              "id": "d",
              "text": "%"
            }
          ],
          "answer": "b",
          "explanation": "@nome_do_decorator, escrito na linha acima da função, aplica o decorator."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "No exemplo da introdução, o que acontece ao chamar ola()?",
          "code": "def log(func):\n    def wrapper(*args):\n        print(\"chamando\", func.__name__)\n        return func(*args)\n    return wrapper\n\n@log\ndef ola():\n    print(\"oi\")",
          "choices": [
            {
              "id": "a",
              "text": "Só \"oi\" é impresso"
            },
            {
              "id": "b",
              "text": "\"chamando ola\" é impresso, seguido de \"oi\""
            },
            {
              "id": "c",
              "text": "Nada é impresso"
            },
            {
              "id": "d",
              "text": "Dá erro, pois ola() não recebe argumentos"
            }
          ],
          "answer": "b",
          "explanation": "@log troca ola por wrapper: primeiro imprime o log, depois chama a ola original."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete a sintaxe usada para aplicar o decorator \"log\" à função \"ola\":",
          "code": "___log\ndef ola():\n    print(\"oi\")",
          "accept": [
            "@"
          ],
          "explanation": "O @ na linha de cima é o que aplica o decorator à função definida logo abaixo."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Por que a função interna de um decorator costuma se chamar \"wrapper\"?",
          "choices": [
            {
              "id": "a",
              "text": "É uma palavra reservada obrigatória do Python"
            },
            {
              "id": "b",
              "text": "Por convenção, porque ela \"envolve\" (wraps) a função original"
            },
            {
              "id": "c",
              "text": "Só funciona se tiver exatamente esse nome"
            },
            {
              "id": "d",
              "text": "Decorators exigem duas funções com o mesmo nome"
            }
          ],
          "answer": "b",
          "explanation": "\"wrapper\" é só um nome convencional — poderia se chamar qualquer coisa."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Decorators são úteis, por exemplo, para:",
          "choices": [
            {
              "id": "a",
              "text": "Adicionar log, medir tempo de execução ou checar permissão sem alterar a função original"
            },
            {
              "id": "b",
              "text": "Apagar automaticamente funções não usadas"
            },
            {
              "id": "c",
              "text": "Converter qualquer função numa classe"
            },
            {
              "id": "d",
              "text": "Impedir que a função seja chamada mais de uma vez, sempre"
            }
          ],
          "answer": "a",
          "explanation": "É o uso clássico: adicionar comportamento repetido (log, timing, autenticação) sem duplicar código."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Uma função em Python pode ser passada como argumento para outra função porque:",
          "choices": [
            {
              "id": "a",
              "text": "Funções são \"cidadãs de primeira classe\": podem ser tratadas como qualquer outro valor"
            },
            {
              "id": "b",
              "text": "Todo decorator é, na verdade, uma classe especial"
            },
            {
              "id": "c",
              "text": "Isso só é possível dentro de decorators"
            },
            {
              "id": "d",
              "text": "Não é possível — decorators usam outra sintaxe por baixo"
            }
          ],
          "answer": "a",
          "explanation": "É essa propriedade da linguagem que torna decorators possíveis em primeiro lugar."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete o atributo especial que devolve o nome de uma função, usado no exemplo:",
          "code": "print(func.___)",
          "accept": [
            "__name__"
          ],
          "explanation": "__name__ é um atributo especial presente em toda função, com o nome dela como string."
        }
      ]
    }
  ]
};
