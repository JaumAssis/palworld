// Módulo "Avançado" — 8 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes por
// lição). Ver ./index.js para o formato e a validação de boot.
//
// Cada lição usa o formato de intro multi-slide (intro.slides) — uma tela de apresentação por
// conceito, terminando no botão de começar as perguntas — mesmo padrão de courses/python/01 e 02,
// e de courses/logica/.
module.exports = {
  "id": "avancado",
  "levelKey": "advanced",
  "order": 3,
  "title": "Avançado",
  "subtitle": "Generators, decorators, concorrência, type hints e performance",
  "accent": "#c084fc",
  "lessons": [
    {
      "id": "adv-01-geradores",
      "title": "Iteradores e geradores",
      "goal": "Entender yield e como generators produzem valores sob demanda.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O que é yield?",
            "body": "yield pausa uma função e devolve um valor, guardando o ponto exato para continuar na próxima chamada — diferente de return, que encerra a função de vez."
          },
          {
            "title": "Uma função com yield é um generator",
            "body": "Uma função que contém yield é chamada de função geradora: em vez de devolver tudo de uma vez, ela produz valores um de cada vez, sob demanda.",
            "code": "def contar_ate(n):\n    i = 1\n    while i <= n:\n        yield i\n        i += 1"
          },
          {
            "title": "Percorrendo um generator com for",
            "body": "Um for percorre um generator igual percorre uma lista, chamando next() por trás dos panos a cada repetição.",
            "code": "for x in contar_ate(3):\n    print(x)  # 1, 2, 3"
          },
          {
            "title": "Chamando next() manualmente",
            "body": "Sem usar for, podemos pedir o próximo valor manualmente com next(gerador). Quando não há mais valores, next() levanta a exceção StopIteration."
          },
          {
            "title": "Generator expressions",
            "body": "Trocando colchetes por parênteses numa comprehension, criamos um generator em vez de uma lista — a mesma ideia, só que preguiçosa (os valores só são calculados quando pedidos).",
            "code": "quadrados = (x**2 for x in range(5))  # generator, não uma lista"
          }
        ]
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
        "slides": [
          {
            "title": "O que é um decorator?",
            "body": "Um decorator é uma função que recebe outra função e devolve uma versão estendida dela, sem alterar o código original."
          },
          {
            "title": "A sintaxe @",
            "body": "@nome_do_decorator, escrito na linha acima de uma função, aplica esse decorator a ela.",
            "code": "@log\ndef ola():\n    print(\"oi\")"
          },
          {
            "title": "Como um decorator funciona por dentro",
            "body": "O decorator recebe a função original como parâmetro e devolve uma nova função (geralmente chamada wrapper) que \"embrulha\" a original, adicionando algo antes/depois de chamá-la.",
            "code": "def log(func):\n    def wrapper(*args):\n        print(\"chamando\", func.__name__)\n        return func(*args)\n    return wrapper"
          },
          {
            "title": "Funções são cidadãs de primeira classe",
            "body": "Decorators só são possíveis porque, em Python, funções podem ser passadas como argumento e devolvidas por outras funções, como qualquer outro valor."
          },
          {
            "title": "Usos comuns de decorators",
            "body": "Adicionar log, medir tempo de execução, checar permissão de acesso — tudo isso sem precisar alterar o código da função original."
          }
        ]
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
    },
    {
      "id": "adv-03-context-managers",
      "title": "Context managers customizados",
      "goal": "Criar um context manager próprio com __enter__/__exit__ ou @contextmanager.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Lembrando do with",
            "body": "Já vimos with ao abrir arquivos: ele garante que algo seja \"limpo\" automaticamente ao final do bloco, mesmo se um erro ocorrer.",
            "code": "with open(\"dados.txt\") as arquivo:\n    conteudo = arquivo.read()"
          },
          {
            "title": "Criando um context manager com uma classe",
            "body": "Uma classe vira um context manager implementando dois métodos especiais: __enter__ (executado ao entrar no with) e __exit__ (executado ao sair, mesmo com erro).",
            "code": "class Cronometro:\n    def __enter__(self):\n        self.inicio = time.time()\n        return self\n    def __exit__(self, *args):\n        print(time.time() - self.inicio)"
          },
          {
            "title": "O que __enter__ e __exit__ fazem",
            "body": "__enter__ roda no início do bloco with e pode devolver um valor (capturado pelo as); __exit__ roda ao final, sempre — até se o bloco lançar um erro."
          },
          {
            "title": "Um jeito mais curto: @contextmanager",
            "body": "O decorator @contextmanager (do módulo contextlib) permite criar um context manager com uma função e yield, sem precisar escrever uma classe inteira.",
            "code": "from contextlib import contextmanager\n\n@contextmanager\ndef cronometro():\n    inicio = time.time()\n    yield\n    print(time.time() - inicio)"
          },
          {
            "title": "Por que criar um context manager próprio?",
            "body": "Útil sempre que algo precisa de uma \"preparação\" no início e uma \"limpeza\" garantida no final — como abrir/fechar uma conexão, medir tempo, ou trocar uma configuração temporariamente."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Quais dois métodos especiais uma classe precisa implementar para virar um context manager?",
          "choices": [
            { "id": "a", "text": "__enter__ e __exit__" },
            { "id": "b", "text": "__init__ e __del__" },
            { "id": "c", "text": "__start__ e __stop__" },
            { "id": "d", "text": "__open__ e __close__" }
          ],
          "answer": "a",
          "explanation": "__enter__ e __exit__ são os métodos especiais exigidos pelo protocolo de context manager."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Quando o método __enter__ é executado?",
          "choices": [
            { "id": "a", "text": "No início do bloco with" },
            { "id": "b", "text": "No final do bloco with" },
            { "id": "c", "text": "Só se ocorrer um erro" },
            { "id": "d", "text": "Nunca é executado automaticamente" }
          ],
          "answer": "a",
          "explanation": "__enter__ roda assim que o bloco with começa a executar."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O __exit__ é executado mesmo se ocorrer um erro dentro do bloco with?",
          "choices": [
            { "id": "a", "text": "Sim, __exit__ sempre roda, mesmo com erro" },
            { "id": "b", "text": "Não, só roda se tudo der certo" },
            { "id": "c", "text": "Só roda se for chamado manualmente" },
            { "id": "d", "text": "__exit__ nunca existe de verdade" }
          ],
          "answer": "a",
          "explanation": "Essa garantia de limpeza, mesmo com erro, é o principal motivo de existir o with."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o método especial executado ao entrar no bloco with:",
          "code": "class Cronometro:\n    def ___(self):\n        self.inicio = time.time()\n        return self",
          "accept": ["__enter__"],
          "explanation": "__enter__ é executado no início do bloco with."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que o decorator @contextmanager (do módulo contextlib) permite fazer?",
          "choices": [
            { "id": "a", "text": "Criar um context manager com uma função e yield, sem escrever uma classe inteira" },
            { "id": "b", "text": "Substituir o with por outra sintaxe" },
            { "id": "c", "text": "Impedir o uso de with" },
            { "id": "d", "text": "Só funciona com arquivos" }
          ],
          "answer": "a",
          "explanation": "@contextmanager é um atalho que evita escrever __enter__/__exit__ manualmente."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Numa função decorada com @contextmanager, o que yield representa?",
          "choices": [
            { "id": "a", "text": "O ponto onde o código do bloco with é executado" },
            { "id": "b", "text": "O fim da função" },
            { "id": "c", "text": "Um erro proposital" },
            { "id": "d", "text": "O início e o fim ao mesmo tempo" }
          ],
          "answer": "a",
          "explanation": "Tudo antes do yield roda como __enter__; tudo depois roda como __exit__."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual é um bom motivo para criar um context manager próprio?",
          "choices": [
            { "id": "a", "text": "Garantir uma \"limpeza\" automática no final, como fechar uma conexão ou medir um tempo" },
            { "id": "b", "text": "Deixar o código mais difícil de ler" },
            { "id": "c", "text": "Impedir o uso de exceções" },
            { "id": "d", "text": "Não existe motivo real, é só estilo" }
          ],
          "answer": "a",
          "explanation": "Garantir preparação/limpeza automática é o propósito central de um context manager."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o módulo de onde vem o decorator contextmanager:",
          "code": "from ___ import contextmanager",
          "accept": ["contextlib"],
          "explanation": "contextlib é o módulo da biblioteca padrão que contém o decorator contextmanager."
        }
      ]
    },
    {
      "id": "adv-04-type-hints",
      "title": "Type hints",
      "goal": "Anotar tipos de parâmetros e retornos de função para deixar o código mais claro.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "O que são type hints?",
            "body": "Type hints são anotações opcionais que indicam o tipo esperado de uma variável, parâmetro ou retorno — Python não obriga (nem verifica em tempo de execução), mas ferramentas e editores usam isso para ajudar a evitar erros.",
            "code": "def somar(a: int, b: int) -> int:\n    return a + b"
          },
          {
            "title": "Anotando parâmetros e retorno",
            "body": "Depois do nome do parâmetro, : tipo indica o tipo esperado; -> tipo, antes dos dois-pontos da função, indica o tipo do retorno."
          },
          {
            "title": "Tipos compostos: list, dict, Optional",
            "body": "list[int] indica uma lista de inteiros; Optional[str] (do módulo typing) indica que o valor pode ser uma string OU None.",
            "code": "from typing import Optional\n\ndef buscar(nome: str) -> Optional[str]:\n    ..."
          },
          {
            "title": "Type hints não impedem erros em tempo de execução",
            "body": "Diferente de linguagens com tipagem estática, Python não verifica os tipos ao rodar o programa — as anotações servem de documentação e para ferramentas externas (como mypy) checarem antes de rodar."
          },
          {
            "title": "Por que usar type hints?",
            "body": "Deixam claro o que uma função espera e devolve, ajudam editores a sugerir código automaticamente e facilitam encontrar erros antes mesmo de rodar o programa."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que são type hints em Python?",
          "choices": [
            { "id": "a", "text": "Anotações opcionais que indicam o tipo esperado de uma variável, parâmetro ou retorno" },
            { "id": "b", "text": "Um tipo de laço" },
            { "id": "c", "text": "Um comando que converte tipos automaticamente" },
            { "id": "d", "text": "Uma obrigatoriedade de sintaxe" }
          ],
          "answer": "a",
          "explanation": "Type hints são anotações informativas, não conversões nem obrigações de sintaxe."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Na função def somar(a: int, b: int) -> int:, o que -> int indica?",
          "choices": [
            { "id": "a", "text": "O tipo do valor que a função devolve" },
            { "id": "b", "text": "O tipo do primeiro parâmetro" },
            { "id": "c", "text": "Um erro de sintaxe" },
            { "id": "d", "text": "Que a função sempre devolve 0" }
          ],
          "answer": "a",
          "explanation": "-> tipo anota o tipo do valor de retorno da função."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Python verifica os type hints em tempo de execução, impedindo passar um tipo errado?",
          "choices": [
            { "id": "a", "text": "Não — type hints são só anotações; Python não obriga nem verifica sozinho" },
            { "id": "b", "text": "Sim, sempre gera um erro" },
            { "id": "c", "text": "Só em funções recursivas" },
            { "id": "d", "text": "Só se o type hint for int" }
          ],
          "answer": "a",
          "explanation": "Type hints não são verificados em tempo de execução — servem de documentação e para ferramentas externas."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a anotação de tipo do parâmetro a, que espera um inteiro:",
          "code": "def somar(a: ___, b: int) -> int:\n    return a + b",
          "accept": ["int"],
          "explanation": "int anota que o parâmetro a espera um valor inteiro."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que Optional[str] (do módulo typing) indica?",
          "choices": [
            { "id": "a", "text": "O valor pode ser uma string ou None" },
            { "id": "b", "text": "O valor é sempre uma string" },
            { "id": "c", "text": "O valor nunca pode ser None" },
            { "id": "d", "text": "O valor é opcionalmente um número" }
          ],
          "answer": "a",
          "explanation": "Optional[str] equivale a dizer que o tipo é str ou None."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual a principal vantagem de usar type hints?",
          "choices": [
            { "id": "a", "text": "Deixam claro o que a função espera/devolve e ajudam ferramentas a encontrar erros antes de rodar" },
            { "id": "b", "text": "Tornam o programa mais rápido em tempo de execução" },
            { "id": "c", "text": "Obrigam Python a checar tipos automaticamente" },
            { "id": "d", "text": "Não existe vantagem nenhuma" }
          ],
          "answer": "a",
          "explanation": "Clareza e detecção antecipada de erros são os principais ganhos dos type hints."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "De qual módulo vem o Optional usado em type hints mais avançados?",
          "choices": [
            { "id": "a", "text": "typing" },
            { "id": "b", "text": "math" },
            { "id": "c", "text": "functools" },
            { "id": "d", "text": "contextlib" }
          ],
          "answer": "a",
          "explanation": "O módulo typing traz recursos como Optional, List, Dict para anotações mais avançadas."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o símbolo usado antes do tipo de retorno de uma função:",
          "code": "def somar(a: int, b: int) ___ int:\n    return a + b",
          "accept": ["->"],
          "explanation": "-> indica o tipo do valor de retorno da função."
        }
      ]
    },
    {
      "id": "adv-05-concorrencia",
      "title": "Concorrência: threading e multiprocessing",
      "goal": "Entender a diferença entre threads e processos para executar tarefas em paralelo.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Por que executar tarefas ao mesmo tempo?",
            "body": "Algumas tarefas (baixar vários arquivos, processar dados grandes) ficam mais rápidas se executadas em paralelo, em vez de uma depois da outra."
          },
          {
            "title": "Threading: múltiplas linhas de execução",
            "body": "O módulo threading cria THREADS, que compartilham a mesma memória do programa. Bom para tarefas que passam muito tempo ESPERANDO (como uma requisição de rede) — chamadas de tarefas \"I/O-bound\".",
            "code": "import threading\n\nt = threading.Thread(target=minha_funcao)\nt.start()"
          },
          {
            "title": "O GIL: uma limitação do Python",
            "body": "O GIL (Global Interpreter Lock) impede que duas threads executem código Python AO MESMO TEMPO dentro do mesmo processo — por isso threading não acelera tarefas que exigem muito processamento (CPU-bound)."
          },
          {
            "title": "Multiprocessing: processos separados",
            "body": "O módulo multiprocessing cria PROCESSOS separados, cada um com sua própria memória e seu próprio GIL — por isso consegue paralelizar de verdade tarefas pesadas de processamento (CPU-bound).",
            "code": "from multiprocessing import Process\n\np = Process(target=minha_funcao)\np.start()"
          },
          {
            "title": "Quando usar cada um",
            "body": "threading para tarefas que esperam muito (I/O-bound, como rede ou arquivos); multiprocessing para tarefas que processam muito (CPU-bound, como cálculos pesados)."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que o módulo threading permite fazer?",
          "choices": [
            { "id": "a", "text": "Criar múltiplas threads que compartilham a mesma memória do programa" },
            { "id": "b", "text": "Criar processos completamente separados" },
            { "id": "c", "text": "Acelerar qualquer tipo de tarefa automaticamente" },
            { "id": "d", "text": "Substituir funções por classes" }
          ],
          "answer": "a",
          "explanation": "threading cria threads que compartilham memória dentro do mesmo processo."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que é o GIL (Global Interpreter Lock)?",
          "choices": [
            { "id": "a", "text": "Um mecanismo que impede duas threads de executarem código Python ao mesmo tempo no mesmo processo" },
            { "id": "b", "text": "Um tipo de laço de repetição" },
            { "id": "c", "text": "Um módulo para ler arquivos" },
            { "id": "d", "text": "Uma função de conversão de tipos" }
          ],
          "answer": "a",
          "explanation": "O GIL serializa a execução de bytecode Python, mesmo com múltiplas threads."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Por que threading não acelera tarefas CPU-bound (muito processamento)?",
          "choices": [
            { "id": "a", "text": "Por causa do GIL, que impede paralelismo real de código Python dentro do mesmo processo" },
            { "id": "b", "text": "Threads sempre são mais lentas que processos" },
            { "id": "c", "text": "threading não existe em Python" },
            { "id": "d", "text": "Tarefas CPU-bound não podem ser executadas de jeito nenhum" }
          ],
          "answer": "a",
          "explanation": "O GIL é a razão pela qual threading não ajuda em tarefas que exigem muito processamento."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o módulo usado para criar processos separados, cada um com seu próprio GIL:",
          "code": "from ___ import Process",
          "accept": ["multiprocessing"],
          "explanation": "multiprocessing cria processos separados, cada um com memória e GIL próprios."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Para qual tipo de tarefa threading costuma ser uma boa escolha?",
          "choices": [
            { "id": "a", "text": "Tarefas I/O-bound, que passam muito tempo esperando (como requisições de rede)" },
            { "id": "b", "text": "Tarefas CPU-bound, que processam muito" },
            { "id": "c", "text": "Nenhum tipo de tarefa" },
            { "id": "d", "text": "Só tarefas matemáticas" }
          ],
          "answer": "a",
          "explanation": "threading brilha em tarefas de espera, onde o GIL não é um gargalo real."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Para qual tipo de tarefa multiprocessing costuma ser uma boa escolha?",
          "choices": [
            { "id": "a", "text": "Tarefas CPU-bound, que exigem muito processamento" },
            { "id": "b", "text": "Tarefas que só esperam por uma resposta de rede" },
            { "id": "c", "text": "Nenhum tipo de tarefa" },
            { "id": "d", "text": "Só tarefas de leitura de arquivo" }
          ],
          "answer": "a",
          "explanation": "multiprocessing contorna o GIL usando processos separados, ideal para processamento pesado."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual a principal diferença entre uma thread e um processo separado?",
          "choices": [
            { "id": "a", "text": "Threads compartilham a mesma memória; processos têm memória própria, separada" },
            { "id": "b", "text": "São exatamente a mesma coisa" },
            { "id": "c", "text": "Processos sempre são mais lentos que threads" },
            { "id": "d", "text": "Threads não podem ser criadas em Python" }
          ],
          "answer": "a",
          "explanation": "Essa diferença de memória compartilhada x isolada é central para entender quando usar cada um."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o método usado para iniciar a execução de uma thread ou processo criado:",
          "code": "t = threading.Thread(target=minha_funcao)\nt.___()",
          "accept": ["start"],
          "explanation": "start() inicia a execução da thread (ou processo)."
        }
      ]
    },
    {
      "id": "adv-06-asyncio",
      "title": "asyncio: programação assíncrona",
      "goal": "Entender async/await para tarefas que passam muito tempo esperando.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "O problema: esperar sem travar tudo",
            "body": "Quando um programa espera algo (como uma resposta de rede), ele pode ficar \"parado\" nesse tempo. asyncio permite que o programa faça outras coisas ENQUANTO espera, sem precisar de threads."
          },
          {
            "title": "Definindo uma função assíncrona com async def",
            "body": "Uma função assíncrona é definida com async def, e pode ser pausada e retomada em pontos específicos.",
            "code": "async def buscar_dados():\n    print(\"Buscando...\")\n    await asyncio.sleep(2)\n    print(\"Pronto!\")"
          },
          {
            "title": "await: pausando até algo terminar",
            "body": "await pausa a execução daquela função ATÉ que a operação esperada termine, mas devolve o controle para o programa continuar fazendo outras coisas nesse meio tempo."
          },
          {
            "title": "Executando uma função assíncrona",
            "body": "Uma função async não roda sozinha ao ser chamada — é preciso usar asyncio.run() para efetivamente executá-la.",
            "code": "import asyncio\nasyncio.run(buscar_dados())"
          },
          {
            "title": "asyncio x threading",
            "body": "asyncio é ótimo para MUITAS tarefas de espera (como centenas de requisições de rede) rodando de forma cooperativa num único processo, sem a complexidade de gerenciar várias threads."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Como uma função assíncrona é definida em Python?",
          "choices": [
            { "id": "a", "text": "Com async def" },
            { "id": "b", "text": "Com def async" },
            { "id": "c", "text": "Com asyncio def" },
            { "id": "d", "text": "Com await def" }
          ],
          "answer": "a",
          "explanation": "async def é a sintaxe usada para definir uma função assíncrona (corrotina)."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que await faz dentro de uma função assíncrona?",
          "choices": [
            { "id": "a", "text": "Pausa a execução até a operação esperada terminar, liberando o programa para fazer outras coisas nesse meio tempo" },
            { "id": "b", "text": "Encerra a função imediatamente" },
            { "id": "c", "text": "Repete a função para sempre" },
            { "id": "d", "text": "Não faz nada de especial" }
          ],
          "answer": "a",
          "explanation": "await cede o controle enquanto espera, permitindo que outras tarefas rodem nesse meio tempo."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Como executar de fato uma função definida com async def?",
          "choices": [
            { "id": "a", "text": "Com asyncio.run(funcao())" },
            { "id": "b", "text": "Chamando a função normalmente, como qualquer outra" },
            { "id": "c", "text": "Com threading.Thread(funcao)" },
            { "id": "d", "text": "Não é possível executar funções async" }
          ],
          "answer": "a",
          "explanation": "asyncio.run() é o ponto de entrada que efetivamente executa uma corrotina."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a palavra-chave que define uma função assíncrona:",
          "code": "___ def buscar_dados():\n    await asyncio.sleep(2)",
          "accept": ["async"],
          "explanation": "async marca a função como assíncrona (uma corrotina)."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Para qual tipo de cenário asyncio é especialmente útil?",
          "choices": [
            { "id": "a", "text": "Muitas tarefas que esperam bastante (como várias requisições de rede ao mesmo tempo)" },
            { "id": "b", "text": "Cálculos matemáticos pesados que exigem CPU" },
            { "id": "c", "text": "Nenhum cenário real" },
            { "id": "d", "text": "Só para abrir arquivos" }
          ],
          "answer": "a",
          "explanation": "asyncio é ideal para tarefas de espera (I/O-bound), especialmente em grande quantidade."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "O que acontece se você chamar uma função async diretamente, sem asyncio.run() ou await?",
          "choices": [
            { "id": "a", "text": "A função não executa de verdade — devolve um objeto \"corrotina\" pendente" },
            { "id": "b", "text": "Ela executa normalmente, como uma função comum" },
            { "id": "c", "text": "Gera um erro de sintaxe imediato" },
            { "id": "d", "text": "O programa trava para sempre" }
          ],
          "answer": "a",
          "explanation": "Chamar uma função async só cria o objeto corrotina — é preciso executá-la de fato com run() ou await."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual a vantagem de asyncio sobre criar várias threads para tarefas de espera?",
          "choices": [
            { "id": "a", "text": "Evita a complexidade de gerenciar várias threads, rodando tudo de forma cooperativa num único processo" },
            { "id": "b", "text": "asyncio sempre usa mais memória que threading" },
            { "id": "c", "text": "Não existe vantagem nenhuma" },
            { "id": "d", "text": "asyncio só funciona com um único await por programa" }
          ],
          "answer": "a",
          "explanation": "asyncio simplifica a concorrência cooperativa sem os custos de gerenciar múltiplas threads."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete a função usada para efetivamente rodar uma corrotina assíncrona:",
          "code": "import asyncio\nasyncio.___(buscar_dados())",
          "accept": ["run"],
          "explanation": "asyncio.run() executa a corrotina passada."
        }
      ]
    },
    {
      "id": "adv-09-descriptors",
      "title": "Descriptors",
      "goal": "Entender __get__/__set__ como o mecanismo por trás de @property.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Relembrando @property",
            "body": "No intermediário vimos que @property controla o acesso a um atributo. Por trás dos panos, isso funciona graças a um mecanismo mais geral chamado descriptor."
          },
          {
            "title": "O que é um descriptor?",
            "body": "Um descriptor é uma classe que implementa __get__ (e opcionalmente __set__/__delete__), controlando o que acontece ao ler, atribuir ou apagar um atributo que aponta para ele.",
            "code": "class Positivo:\n    def __get__(self, obj, tipo):\n        return obj._valor\n    def __set__(self, obj, valor):\n        if valor < 0:\n            raise ValueError(\"precisa ser positivo\")\n        obj._valor = valor"
          },
          {
            "title": "Usando um descriptor numa classe",
            "body": "O descriptor é atribuído como um atributo DE CLASSE; toda instância que tenta acessar esse atributo passa pelo __get__/__set__ do descriptor.",
            "code": "class Produto:\n    preco = Positivo()\n\np = Produto()\np.preco = 10   # chama __set__\nprint(p.preco) # chama __get__"
          },
          {
            "title": "Descriptor x property: qual a diferença?",
            "body": "@property cria um descriptor de forma simplificada, específico para UM atributo de UMA classe. Um descriptor escrito à mão pode ser reaproveitado em VÁRIAS classes diferentes, sem repetir a lógica."
          },
          {
            "title": "Onde descriptors são usados",
            "body": "Bibliotecas como Django e várias ferramentas de validação usam descriptors por trás dos panos, para reaproveitar a mesma lógica de controle de atributo em muitas classes."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que é um descriptor em Python?",
          "choices": [
            { "id": "a", "text": "Uma classe que implementa __get__ (e opcionalmente __set__/__delete__), controlando o acesso a um atributo" },
            { "id": "b", "text": "Um tipo de decorator exclusivo de funções" },
            { "id": "c", "text": "Um método que só existe em módulos" },
            { "id": "d", "text": "Um tipo de laço" }
          ],
          "answer": "a",
          "explanation": "O descriptor controla leitura/escrita/remoção de um atributo através de métodos especiais."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Qual método um descriptor precisa implementar, no mínimo, para controlar a LEITURA de um atributo?",
          "choices": [
            { "id": "a", "text": "__get__" },
            { "id": "b", "text": "__init__" },
            { "id": "c", "text": "__str__" },
            { "id": "d", "text": "__call__" }
          ],
          "answer": "a",
          "explanation": "__get__ é chamado ao ler o valor do atributo controlado pelo descriptor."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Onde um descriptor é atribuído dentro de uma classe que o utiliza?",
          "choices": [
            { "id": "a", "text": "Como um atributo de classe" },
            { "id": "b", "text": "Só dentro do __init__" },
            { "id": "c", "text": "Como uma variável global" },
            { "id": "d", "text": "Não pode ser atribuído a uma classe" }
          ],
          "answer": "a",
          "explanation": "O descriptor precisa ser um atributo de classe para funcionar como protocolo de descriptor."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o método do descriptor executado ao LER o atributo:",
          "code": "class Positivo:\n    def ___(self, obj, tipo):\n        return obj._valor",
          "accept": ["__get__"],
          "explanation": "__get__ é o método chamado na leitura do atributo."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Qual a principal vantagem de um descriptor escrito à mão sobre @property?",
          "choices": [
            { "id": "a", "text": "Pode ser reaproveitado em várias classes diferentes, sem repetir a lógica" },
            { "id": "b", "text": "É sempre mais rápido em qualquer situação" },
            { "id": "c", "text": "Não pode ser usado em mais de uma classe" },
            { "id": "d", "text": "Substitui completamente o uso de classes" }
          ],
          "answer": "a",
          "explanation": "Um descriptor genérico pode ser reaproveitado, enquanto @property é específico de uma classe."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "O que acontece quando atribuímos p.preco = 10, se preco for um descriptor com __set__ definido?",
          "choices": [
            { "id": "a", "text": "O método __set__ do descriptor é chamado, podendo validar o valor antes de guardar" },
            { "id": "b", "text": "O valor é sempre rejeitado" },
            { "id": "c", "text": "Nada acontece, o valor é ignorado" },
            { "id": "d", "text": "Gera um erro de sintaxe" }
          ],
          "answer": "a",
          "explanation": "__set__ intercepta a atribuição, permitindo validação antes de guardar o valor."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "@property, por trás dos panos, é uma forma simplificada de:",
          "choices": [
            { "id": "a", "text": "Um descriptor" },
            { "id": "b", "text": "Um decorator sem relação com descriptors" },
            { "id": "c", "text": "Uma metaclasse" },
            { "id": "d", "text": "Um context manager" }
          ],
          "answer": "a",
          "explanation": "@property gera, internamente, um objeto que implementa o protocolo de descriptor."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o método do descriptor executado ao ATRIBUIR um novo valor ao atributo:",
          "code": "class Positivo:\n    def ___(self, obj, valor):\n        obj._valor = valor",
          "accept": ["__set__"],
          "explanation": "__set__ é o método chamado ao atribuir um novo valor ao atributo."
        }
      ]
    },
    {
      "id": "adv-07-metaclasses",
      "title": "Metaclasses",
      "goal": "Entender que classes também são objetos, criados por uma metaclasse.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Classes também são objetos",
            "body": "Em Python, tudo é objeto — inclusive as próprias CLASSES. Uma classe é criada, por trás dos panos, por algo chamado metaclasse."
          },
          {
            "title": "type: a metaclasse padrão",
            "body": "Toda classe comum é criada pela metaclasse type, o \"molde padrão\" usado quando escrevemos class NomeDaClasse: ...",
            "code": "class Pessoa:\n    pass\n\nprint(type(Pessoa))  # <class 'type'>"
          },
          {
            "title": "O que é uma metaclasse?",
            "body": "Uma metaclasse é \"a classe de uma classe\" — assim como uma classe define como um OBJETO se comporta, uma metaclasse define como uma CLASSE se comporta."
          },
          {
            "title": "Criando uma metaclasse customizada",
            "body": "É possível criar uma metaclasse própria, herdando de type, para controlar automaticamente como classes são construídas — por exemplo, validando ou registrando toda classe criada com ela.",
            "code": "class MinhaMeta(type):\n    def __new__(cls, nome, bases, atributos):\n        print(f\"Criando a classe {nome}\")\n        return super().__new__(cls, nome, bases, atributos)"
          },
          {
            "title": "Quando usar metaclasses",
            "body": "Metaclasses são um recurso avançado e raramente necessário no dia a dia — a maioria dos problemas pode ser resolvida com herança comum ou decorators, então metaclasses costumam ser reservadas para frameworks e bibliotecas."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que é uma metaclasse?",
          "choices": [
            { "id": "a", "text": "A \"classe de uma classe\" — define como uma classe se comporta" },
            { "id": "b", "text": "Um tipo de laço de repetição" },
            { "id": "c", "text": "Um método especial de instância" },
            { "id": "d", "text": "Um módulo da biblioteca padrão" }
          ],
          "answer": "a",
          "explanation": "A metaclasse está para a classe assim como a classe está para o objeto."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Qual é a metaclasse padrão usada ao criar uma classe comum em Python?",
          "choices": [
            { "id": "a", "text": "type" },
            { "id": "b", "text": "object" },
            { "id": "c", "text": "class" },
            { "id": "d", "text": "meta" }
          ],
          "answer": "a",
          "explanation": "type é a metaclasse padrão de toda classe em Python."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que print(type(Pessoa)) exibe, para uma classe Pessoa comum?",
          "choices": [
            { "id": "a", "text": "<class 'type'>" },
            { "id": "b", "text": "<class 'Pessoa'>" },
            { "id": "c", "text": "None" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "O tipo de uma classe comum é sua metaclasse: type."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a metaclasse padrão de onde uma metaclasse customizada geralmente herda:",
          "code": "class MinhaMeta(___):\n    pass",
          "accept": ["type"],
          "explanation": "Metaclasses customizadas geralmente herdam de type."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Assim como uma classe define o comportamento de um objeto, uma metaclasse define o comportamento de:",
          "choices": [
            { "id": "a", "text": "Uma classe" },
            { "id": "b", "text": "Uma variável comum" },
            { "id": "c", "text": "Um módulo" },
            { "id": "d", "text": "Um arquivo" }
          ],
          "answer": "a",
          "explanation": "A relação metaclasse-classe espelha a relação classe-objeto."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Metaclasses são um recurso usado com frequência no dia a dia da programação?",
          "choices": [
            { "id": "a", "text": "Não — são raramente necessárias, reservadas principalmente para frameworks e bibliotecas" },
            { "id": "b", "text": "Sim, toda classe precisa de uma metaclasse customizada" },
            { "id": "c", "text": "São obrigatórias em qualquer programa Python" },
            { "id": "d", "text": "Substituem completamente o uso de classes comuns" }
          ],
          "answer": "a",
          "explanation": "Metaclasses são um recurso de nicho, não algo usado no código do dia a dia."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "O que uma metaclasse customizada pode fazer ao ser usada na criação de uma classe?",
          "choices": [
            { "id": "a", "text": "Controlar/validar automaticamente como aquela classe é construída" },
            { "id": "b", "text": "Impedir que a classe tenha métodos" },
            { "id": "c", "text": "Apagar a classe depois de criada" },
            { "id": "d", "text": "Nada, é só decorativo" }
          ],
          "answer": "a",
          "explanation": "Uma metaclasse pode interceptar e customizar o processo de criação da classe."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o método especial sobrescrito numa metaclasse para controlar a criação da classe:",
          "code": "class MinhaMeta(type):\n    def ___(cls, nome, bases, atributos):\n        return super().__new__(cls, nome, bases, atributos)",
          "accept": ["__new__"],
          "explanation": "__new__ é o método responsável por efetivamente criar o novo objeto (a classe, no caso de uma metaclasse)."
        }
      ]
    },
    {
      "id": "adv-10-slots",
      "title": "__slots__",
      "goal": "Entender como __slots__ limita atributos de instância para economizar memória.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Como Python guarda atributos de instância",
            "body": "Por padrão, cada objeto guarda seus atributos num dicionário interno (__dict__), o que é flexível mas consome memória extra — especialmente quando existem MUITAS instâncias."
          },
          {
            "title": "Definindo __slots__",
            "body": "__slots__ é uma lista de nomes de atributos permitidos para aquela classe. Com __slots__ definido, as instâncias NÃO têm mais um __dict__, economizando memória.",
            "code": "class Ponto:\n    __slots__ = [\"x\", \"y\"]\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y"
          },
          {
            "title": "O que acontece ao tentar definir um atributo fora de __slots__",
            "body": "Com __slots__ definido, atribuir um atributo que não está na lista gera um erro (AttributeError) — diferente do comportamento padrão, que permite adicionar qualquer atributo a qualquer momento."
          },
          {
            "title": "Quando vale a pena usar __slots__",
            "body": "Faz diferença real quando o programa cria uma quantidade MUITO grande de instâncias da mesma classe (milhares ou milhões) — a economia de memória por objeto se multiplica."
          },
          {
            "title": "A troca: menos flexibilidade, mais economia",
            "body": "Com __slots__, a classe perde a flexibilidade de adicionar atributos novos livremente, mas ganha economia de memória e, em muitos casos, um acesso levemente mais rápido aos atributos."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que __slots__ faz numa classe?",
          "choices": [
            { "id": "a", "text": "Limita quais atributos as instâncias podem ter, economizando memória" },
            { "id": "b", "text": "Cria automaticamente um __init__" },
            { "id": "c", "text": "Impede a criação de qualquer instância" },
            { "id": "d", "text": "Torna a classe abstrata" }
          ],
          "answer": "a",
          "explanation": "__slots__ restringe os atributos possíveis e remove o __dict__ por instância."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Por padrão (sem __slots__), onde os atributos de uma instância são guardados?",
          "choices": [
            { "id": "a", "text": "Num dicionário interno (__dict__) de cada instância" },
            { "id": "b", "text": "Numa lista compartilhada entre todas as instâncias" },
            { "id": "c", "text": "Direto na definição da classe" },
            { "id": "d", "text": "Não são guardados em lugar nenhum" }
          ],
          "answer": "a",
          "explanation": "Cada instância tem, por padrão, seu próprio __dict__ com os atributos."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que acontece ao tentar atribuir um atributo que NÃO está listado em __slots__?",
          "choices": [
            { "id": "a", "text": "Um erro (AttributeError) é gerado" },
            { "id": "b", "text": "O atributo é criado normalmente, como sem __slots__" },
            { "id": "c", "text": "O programa ignora silenciosamente" },
            { "id": "d", "text": "A classe inteira é apagada" }
          ],
          "answer": "a",
          "explanation": "__slots__ impede a criação de atributos fora da lista definida."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a lista que define quais atributos uma classe com slots pode ter:",
          "code": "class Ponto:\n    ___ = [\"x\", \"y\"]\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y",
          "accept": ["__slots__"],
          "explanation": "__slots__ é o atributo especial que restringe os atributos de instância."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Quando usar __slots__ faz mais diferença na prática?",
          "choices": [
            { "id": "a", "text": "Quando o programa cria uma quantidade muito grande de instâncias da mesma classe" },
            { "id": "b", "text": "Quando a classe só é instanciada uma vez" },
            { "id": "c", "text": "Nunca faz diferença nenhuma" },
            { "id": "d", "text": "Só em classes sem nenhum atributo" }
          ],
          "answer": "a",
          "explanation": "A economia de memória por instância se multiplica quando há muitas instâncias."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual a principal \"troca\" ao usar __slots__?",
          "choices": [
            { "id": "a", "text": "Menos flexibilidade para adicionar atributos novos, em troca de economia de memória" },
            { "id": "b", "text": "Mais flexibilidade e mais memória usada" },
            { "id": "c", "text": "Nenhuma troca, só vantagens sem custo nenhum" },
            { "id": "d", "text": "A classe fica mais lenta em qualquer situação" }
          ],
          "answer": "a",
          "explanation": "Ganha-se economia de memória, perde-se a flexibilidade de atributos dinâmicos."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Uma classe com __slots__ = [\"x\", \"y\"] ainda tem um __dict__ por instância?",
          "choices": [
            { "id": "a", "text": "Não — __slots__ remove o __dict__ por padrão, economizando memória" },
            { "id": "b", "text": "Sim, sempre mantém o __dict__ também" },
            { "id": "c", "text": "Só se __init__ não for definido" },
            { "id": "d", "text": "Depende do nome dos atributos" }
          ],
          "answer": "a",
          "explanation": "A ausência do __dict__ é justamente o que gera a economia de memória."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o tipo de erro gerado ao tentar definir um atributo fora de __slots__:",
          "code": "p = Ponto(1, 2)\np.z = 3  # ___: 'Ponto' object has no attribute 'z'",
          "accept": ["AttributeError"],
          "explanation": "AttributeError é a exceção gerada ao tentar criar um atributo fora da lista de slots."
        }
      ]
    },
    {
      "id": "adv-08-performance",
      "title": "Profiling e otimização de performance",
      "goal": "Medir o desempenho do código antes de tentar otimizá-lo.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Não otimize sem medir primeiro",
            "body": "Uma regra de ouro: nunca otimize um código só por \"achar\" que está lento — meça primeiro para descobrir onde o tempo realmente está sendo gasto."
          },
          {
            "title": "Medindo tempo com time",
            "body": "A forma mais simples de medir é marcar o tempo antes e depois de um trecho de código, usando time.perf_counter().",
            "code": "import time\ninicio = time.perf_counter()\n# código a medir\nfim = time.perf_counter()\nprint(fim - inicio)"
          },
          {
            "title": "Profiling: medindo função por função",
            "body": "Um profiler (como o módulo cProfile) mede quanto tempo CADA função do programa consome, mostrando exatamente onde otimizar vale a pena.",
            "code": "import cProfile\ncProfile.run(\"minha_funcao()\")"
          },
          {
            "title": "Otimização prematura é a raiz de muitos problemas",
            "body": "Otimizar um trecho que já é rápido, ou que raramente é executado, é tempo perdido — é melhor focar nos \"gargalos\" reais, identificados por medição."
          },
          {
            "title": "Complexidade importa mais que microotimizações",
            "body": "Trocar um algoritmo O(n²) por um O(n log n) (como visto no curso de Lógica) costuma trazer um ganho muito maior do que pequenos ajustes de sintaxe."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Qual a regra de ouro antes de otimizar um código?",
          "choices": [
            { "id": "a", "text": "Medir primeiro, para descobrir onde o tempo realmente está sendo gasto" },
            { "id": "b", "text": "Otimizar tudo, sempre, sem medir nada" },
            { "id": "c", "text": "Nunca otimizar nada" },
            { "id": "d", "text": "Reescrever o programa inteiro do zero" }
          ],
          "answer": "a",
          "explanation": "Medir antes de otimizar evita perder tempo em partes que não são o gargalo real."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que time.perf_counter() é usado para fazer?",
          "choices": [
            { "id": "a", "text": "Medir o tempo decorrido entre dois pontos do código" },
            { "id": "b", "text": "Pausar o programa por um tempo fixo" },
            { "id": "c", "text": "Converter texto em número" },
            { "id": "d", "text": "Criar uma thread nova" }
          ],
          "answer": "a",
          "explanation": "perf_counter() marca um instante preciso, usado para calcular durações."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que um profiler (como cProfile) faz?",
          "choices": [
            { "id": "a", "text": "Mede quanto tempo cada função do programa consome" },
            { "id": "b", "text": "Corrige erros automaticamente" },
            { "id": "c", "text": "Substitui a necessidade de testes" },
            { "id": "d", "text": "Só funciona com arquivos" }
          ],
          "answer": "a",
          "explanation": "Um profiler detalha o tempo gasto em cada função, ajudando a achar gargalos."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o módulo usado para medir o tempo de cada função de um programa:",
          "code": "import ___\ncProfile.run(\"minha_funcao()\")",
          "accept": ["cProfile"],
          "explanation": "cProfile é o módulo padrão de profiling do Python."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que significa \"otimização prematura\"?",
          "choices": [
            { "id": "a", "text": "Otimizar um trecho que já é rápido ou raramente executado, antes de medir onde o problema real está" },
            { "id": "b", "text": "Otimizar exatamente o trecho mais lento do programa" },
            { "id": "c", "text": "Nunca otimizar nada" },
            { "id": "d", "text": "Medir o tempo de execução corretamente" }
          ],
          "answer": "a",
          "explanation": "Otimização prematura é gastar esforço onde não traz ganho real, sem antes medir."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Ao comparar uma melhoria de algoritmo (ex: O(n²) para O(n log n)) com pequenos ajustes de sintaxe, qual costuma trazer mais ganho de performance?",
          "choices": [
            { "id": "a", "text": "A melhoria de algoritmo (mudar a complexidade)" },
            { "id": "b", "text": "Os pequenos ajustes de sintaxe" },
            { "id": "c", "text": "Os dois trazem exatamente o mesmo ganho sempre" },
            { "id": "d", "text": "Nenhum dos dois faz diferença" }
          ],
          "answer": "a",
          "explanation": "Mudar a ordem de complexidade costuma dominar qualquer microotimização de sintaxe."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual a função usada para marcar um ponto no tempo, para depois calcular quanto tempo passou?",
          "choices": [
            { "id": "a", "text": "time.perf_counter()" },
            { "id": "b", "text": "time.sleep()" },
            { "id": "c", "text": "time.stop()" },
            { "id": "d", "text": "time.pause()" }
          ],
          "answer": "a",
          "explanation": "perf_counter() é a função recomendada para medir intervalos de tempo com precisão."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o módulo usado para medir o tempo entre dois pontos do código:",
          "code": "import ___\ninicio = time.perf_counter()",
          "accept": ["time"],
          "explanation": "time é o módulo da biblioteca padrão que fornece perf_counter()."
        }
      ]
    },
    {
      "id": "adv-11-idioms",
      "title": "Idioms pythônicos",
      "goal": "Entender EAFP x LBYL e duck typing, o estilo idiomático do Python.",
      "xp": 35,
      "intro": {
        "slides": [
          {
            "title": "Dois estilos de programar: LBYL x EAFP",
            "body": "LBYL (Look Before You Leap) significa checar condições ANTES de agir. EAFP (Easier to Ask Forgiveness than Permission) significa tentar agir e tratar o erro DEPOIS, se ele acontecer. Python geralmente prefere o estilo EAFP."
          },
          {
            "title": "Um exemplo em LBYL",
            "body": "Checar se uma chave existe num dicionário ANTES de acessá-la.",
            "code": "if \"idade\" in pessoa:\n    print(pessoa[\"idade\"])\nelse:\n    print(\"não encontrado\")"
          },
          {
            "title": "O mesmo exemplo em EAFP",
            "body": "Tentar acessar direto, e tratar o erro se a chave não existir — o estilo mais comum em Python.",
            "code": "try:\n    print(pessoa[\"idade\"])\nexcept KeyError:\n    print(\"não encontrado\")"
          },
          {
            "title": "Duck typing: o comportamento importa mais que o tipo",
            "body": "\"Se anda como um pato e faz quack como um pato, é um pato\": Python confia no COMPORTAMENTO de um objeto (quais métodos ele tem) em vez de checar seu tipo exato antes de usá-lo.",
            "code": "def fazer_barulho(animal):\n    animal.emitir_som()  # funciona com qualquer objeto que tenha esse método"
          },
          {
            "title": "Por que Python prefere esses estilos?",
            "body": "EAFP evita checagens repetidas e condições de corrida; duck typing deixa o código mais flexível, funcionando com qualquer objeto compatível, sem exigir uma hierarquia de herança rígida."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que significa o estilo LBYL (Look Before You Leap)?",
          "choices": [
            { "id": "a", "text": "Checar condições antes de agir" },
            { "id": "b", "text": "Tentar agir e tratar o erro depois" },
            { "id": "c", "text": "Nunca tratar erros" },
            { "id": "d", "text": "Sempre usar decorators" }
          ],
          "answer": "a",
          "explanation": "LBYL verifica as condições antes de executar a ação."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que significa o estilo EAFP (Easier to Ask Forgiveness than Permission)?",
          "choices": [
            { "id": "a", "text": "Tentar agir diretamente e tratar o erro depois, se ele acontecer" },
            { "id": "b", "text": "Checar todas as condições possíveis antes de agir" },
            { "id": "c", "text": "Evitar o uso de try/except sempre" },
            { "id": "d", "text": "Só funciona com números" }
          ],
          "answer": "a",
          "explanation": "EAFP assume que a ação vai dar certo e trata a exceção só se ela ocorrer."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Qual estilo (LBYL ou EAFP) Python costuma preferir, de forma idiomática?",
          "choices": [
            { "id": "a", "text": "EAFP" },
            { "id": "b", "text": "LBYL" },
            { "id": "c", "text": "Nenhum dos dois, Python não tem preferência" },
            { "id": "d", "text": "Depende só da versão do Python" }
          ],
          "answer": "a",
          "explanation": "EAFP é considerado o estilo mais pythônico na maioria dos casos."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a exceção comumente capturada ao tentar acessar uma chave inexistente num dicionário, no estilo EAFP:",
          "code": "try:\n    print(pessoa[\"idade\"])\nexcept ___:\n    print(\"não encontrado\")",
          "accept": ["KeyError"],
          "explanation": "KeyError é a exceção levantada ao acessar uma chave inexistente num dicionário."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que é \"duck typing\"?",
          "choices": [
            { "id": "a", "text": "Confiar no comportamento (quais métodos um objeto tem) em vez de checar seu tipo exato" },
            { "id": "b", "text": "Um tipo de decorator" },
            { "id": "c", "text": "Uma forma de tipagem estática obrigatória" },
            { "id": "d", "text": "Um método especial de classes" }
          ],
          "answer": "a",
          "explanation": "Duck typing prioriza o que o objeto sabe fazer, não sua classe exata."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Segundo o princípio do duck typing, o que importa para usar um objeto?",
          "choices": [
            { "id": "a", "text": "Se ele tem os métodos/atributos necessários, não seu tipo exato" },
            { "id": "b", "text": "Sua herança de uma classe específica" },
            { "id": "c", "text": "O nome da variável usada" },
            { "id": "d", "text": "O módulo de onde ele veio" }
          ],
          "answer": "a",
          "explanation": "O que importa é a compatibilidade de comportamento, não a hierarquia de classes."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Qual a vantagem do estilo EAFP em situações onde uma condição pode mudar entre a checagem e o uso?",
          "choices": [
            { "id": "a", "text": "Evita problemas de condição de corrida, já que não depende de checar antes de agir" },
            { "id": "b", "text": "Não existe vantagem nenhuma" },
            { "id": "c", "text": "EAFP sempre é mais lento" },
            { "id": "d", "text": "EAFP impede qualquer erro de acontecer" }
          ],
          "answer": "a",
          "explanation": "Como EAFP age direto e trata o erro, evita a janela de tempo entre checar e usar que o LBYL tem."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o nome do princípio que diz que o comportamento de um objeto importa mais que seu tipo exato:",
          "code": "O princípio de que o comportamento de um objeto importa mais que seu tipo exato se chama ___ typing.",
          "accept": ["duck"],
          "explanation": "Duck typing é o nome desse princípio."
        }
      ]
    }
  ]
};
