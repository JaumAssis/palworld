// Módulo "Intermediário" — 8 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes
// por lição). Ver ./index.js para o formato e a validação de boot.
//
// Cada lição usa o formato de intro multi-slide (intro.slides) — uma tela de apresentação por
// conceito, terminando no botão de começar as perguntas — mesmo padrão de courses/python/01-
// fundamentos.js e courses/logica/.
module.exports = {
  "id": "intermediario",
  "levelKey": "intermediate",
  "order": 2,
  "title": "Intermediário",
  "subtitle": "Compreensões, POO, módulos, arquivos, programação funcional e testes",
  "accent": "#38bdf8",
  "lessons": [
    {
      "id": "int-01-compreensoes",
      "title": "Compreensões de lista",
      "goal": "Criar listas de forma concisa a partir de outra sequência.",
      "xp": 25,
      "intro": {
        "slides": [
          {
            "title": "O que é uma list comprehension?",
            "body": "Uma list comprehension cria uma lista nova numa linha só, seguindo o formato [expressão for item in sequência].",
            "code": "quadrados = [x**2 for x in range(5)]\n# [0, 1, 4, 9, 16]"
          },
          {
            "title": "A parte opcional if",
            "body": "Podemos adicionar uma condição no final: [expressão for item in sequência if condição]. Só os itens em que a condição é True entram no resultado.",
            "code": "pares = [x for x in range(10) if x % 2 == 0]\n# [0, 2, 4, 6, 8]"
          },
          {
            "title": "Comparando com um for tradicional",
            "body": "O mesmo resultado poderia ser escrito com um for e append(), mas a comprehension é mais concisa, numa linha só."
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "O que a comprehension abaixo produz?",
          "code": "[x * 2 for x in range(4)]",
          "choices": [
            {
              "id": "a",
              "text": "[0, 2, 4, 6]"
            },
            {
              "id": "b",
              "text": "[0, 1, 2, 3]"
            },
            {
              "id": "c",
              "text": "[2, 4, 6, 8]"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "a",
          "explanation": "range(4) dá 0,1,2,3; cada um é multiplicado por 2."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "O que a parte \"if\" no final de uma comprehension faz?",
          "choices": [
            {
              "id": "a",
              "text": "Repete a lista duas vezes"
            },
            {
              "id": "b",
              "text": "Filtra quais itens entram no resultado"
            },
            {
              "id": "c",
              "text": "Ordena o resultado"
            },
            {
              "id": "d",
              "text": "Soma todos os itens"
            }
          ],
          "answer": "b",
          "explanation": "Só os itens em que a condição é True aparecem na lista final."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "Qual dessas é a sintaxe correta de uma list comprehension?",
          "choices": [
            {
              "id": "a",
              "text": "[x for x in range(5)]"
            },
            {
              "id": "b",
              "text": "[for x in range(5): x]"
            },
            {
              "id": "c",
              "text": "[x in range(5)]"
            },
            {
              "id": "d",
              "text": "for x in range(5) [x]"
            }
          ],
          "answer": "a",
          "explanation": "A ordem é sempre [expressão for item in sequência]."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete para gerar o quadrado de cada número de 0 a 4:",
          "code": "quadrados = [x ___ 2 for x in range(5)]",
          "accept": [
            "**"
          ],
          "explanation": "** eleva x ao quadrado antes de entrar na lista."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "O que [x for x in range(10) if x % 2 == 0] gera?",
          "choices": [
            {
              "id": "a",
              "text": "[0, 2, 4, 6, 8]"
            },
            {
              "id": "b",
              "text": "[1, 3, 5, 7, 9]"
            },
            {
              "id": "c",
              "text": "[0, 1, 2, ..., 9]"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "a",
          "explanation": "O if mantém só os números pares de 0 a 9."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Comparadas a um for tradicional com append, list comprehensions costumam ser:",
          "choices": [
            {
              "id": "a",
              "text": "Mais lentas e mais longas de escrever"
            },
            {
              "id": "b",
              "text": "Mais concisas para transformar ou filtrar uma sequência"
            },
            {
              "id": "c",
              "text": "Utilizáveis apenas com números"
            },
            {
              "id": "d",
              "text": "Obrigatórias em qualquer laço"
            }
          ],
          "answer": "b",
          "explanation": "São um jeito mais curto de escrever o padrão \"para cada item, transforme e/ou filtre\"."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Qual é o tipo do resultado de [x for x in range(3)]?",
          "choices": [
            {
              "id": "a",
              "text": "list"
            },
            {
              "id": "b",
              "text": "tuple"
            },
            {
              "id": "c",
              "text": "dict"
            },
            {
              "id": "d",
              "text": "set"
            }
          ],
          "answer": "a",
          "explanation": "Colchetes [ ] produzem uma list — o mesmo padrão com { } produz um set, e com ( ) um generator."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete a palavra-chave que filtra itens dentro da comprehension:",
          "code": "pares = [x for x in nums ___ x % 2 == 0]",
          "accept": [
            "if"
          ],
          "explanation": "if, ao final da comprehension, decide quais itens entram no resultado."
        }
      ]
    },
    {
      "id": "int-05-comprehensions-dict-set",
      "title": "Compreensões de dicionário e conjunto",
      "goal": "Criar dicionários e sets de forma concisa, com a mesma ideia das list comprehensions.",
      "xp": 25,
      "intro": {
        "slides": [
          {
            "title": "Comprehension de dicionário",
            "body": "Assim como a list comprehension, podemos criar um dicionário numa linha só: {chave: valor for item in sequência}.",
            "code": "quadrados = {x: x**2 for x in range(5)}\n# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}"
          },
          {
            "title": "Comprehension de conjunto (set)",
            "body": "Trocando os colchetes [ ] por chaves { } (sem os dois-pontos), criamos um set em vez de uma lista.",
            "code": "pares = {x for x in range(10) if x % 2 == 0}\n# {0, 2, 4, 6, 8}"
          },
          {
            "title": "Por que usar comprehension de dict/set?",
            "body": "O mesmo motivo das listas: transformar e/ou filtrar uma sequência existente de forma concisa, numa linha só, em vez de um for tradicional com atribuições repetidas."
          },
          {
            "title": "Diferenciando pelos símbolos",
            "body": "[ ] sempre produz list; { chave: valor } produz dict; { valor } (sem dois-pontos) produz set; ( ) produz um generator."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que a comprehension {x: x**2 for x in range(3)} produz?",
          "choices": [
            { "id": "a", "text": "{0: 0, 1: 1, 2: 4}" },
            { "id": "b", "text": "[0, 1, 4]" },
            { "id": "c", "text": "{0, 1, 4}" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "A comprehension de dicionário associa cada x ao seu quadrado, como chave e valor."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Qual a diferença de sintaxe entre uma comprehension de dict e uma de set?",
          "choices": [
            { "id": "a", "text": "A de dict tem \"chave: valor\"; a de set tem só o valor" },
            { "id": "b", "text": "São exatamente iguais" },
            { "id": "c", "text": "A de set usa colchetes [ ]" },
            { "id": "d", "text": "A de dict não usa chaves { }" }
          ],
          "answer": "a",
          "explanation": "O dois-pontos (chave: valor) é o que diferencia a comprehension de dict da de set."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que {x for x in range(5) if x % 2 == 0} produz?",
          "choices": [
            { "id": "a", "text": "{0, 2, 4}" },
            { "id": "b", "text": "[0, 2, 4]" },
            { "id": "c", "text": "{0: 0, 2: 2, 4: 4}" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "Sem os dois-pontos, o resultado é um set com os números pares de 0 a 4."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o símbolo que falta entre a chave e o valor numa comprehension de dicionário:",
          "code": "quadrados = {x ___ x**2 for x in range(5)}",
          "accept": [":"],
          "explanation": "Os dois-pontos separam a chave do valor numa comprehension de dicionário."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Qual símbolo de abertura/fechamento cria uma comprehension de set ou de dict?",
          "choices": [
            { "id": "a", "text": "Chaves { }" },
            { "id": "b", "text": "Colchetes [ ]" },
            { "id": "c", "text": "Parênteses ( )" },
            { "id": "d", "text": "Nenhum símbolo especial" }
          ],
          "answer": "a",
          "explanation": "Chaves { } são usadas tanto para dict quanto para set comprehensions."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Por que usar uma comprehension de dicionário em vez de um for tradicional?",
          "choices": [
            { "id": "a", "text": "Para criar o dicionário de forma mais concisa, numa linha só" },
            { "id": "b", "text": "Porque for não funciona com dicionários" },
            { "id": "c", "text": "Comprehension é a única forma de criar um dict" },
            { "id": "d", "text": "Não existe vantagem nenhuma" }
          ],
          "answer": "a",
          "explanation": "É o mesmo ganho de concisão das list comprehensions, aplicado a dict/set."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Dado nums = [1, 2, 2, 3], o que {x for x in nums} produz?",
          "choices": [
            { "id": "a", "text": "{1, 2, 3} — duplicatas removidas" },
            { "id": "b", "text": "{1, 2, 2, 3}" },
            { "id": "c", "text": "[1, 2, 3]" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "Um set nunca guarda valores duplicados, mesmo criado por comprehension."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete: uma comprehension escrita entre ___ com \"chave: valor\" produz um dicionário.",
          "code": "Uma comprehension escrita entre ___ com \"chave: valor\" produz um dicionário.",
          "accept": ["chaves"],
          "explanation": "Chaves { } com dois-pontos entre chave e valor é a sintaxe de dict comprehension."
        }
      ]
    },
    {
      "id": "int-02-classes-objetos",
      "title": "Classes e objetos",
      "goal": "Definir classes, criar objetos e entender self e __init__.",
      "xp": 25,
      "intro": {
        "slides": [
          {
            "title": "O que é uma classe?",
            "body": "Uma classe é um molde para criar objetos — define quais atributos e métodos cada objeto criado a partir dela vai ter."
          },
          {
            "title": "O método __init__",
            "body": "__init__ é chamado automaticamente sempre que um objeto novo é criado a partir da classe, e é onde geralmente definimos os atributos iniciais.",
            "code": "class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome"
          },
          {
            "title": "O parâmetro self",
            "body": "self é o primeiro parâmetro de todo método de uma classe, e representa o próprio objeto que está sendo usado — cada instância tem o seu."
          },
          {
            "title": "Criando um objeto (instanciando)",
            "body": "Chamar a classe como se fosse uma função cria um objeto novo (uma instância) dela.",
            "code": "p = Pessoa(\"Ana\")\nprint(p.nome)  # Ana"
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "kind": "mcq",
          "prompt": "Qual palavra-chave define uma classe em Python?",
          "choices": [
            {
              "id": "a",
              "text": "class"
            },
            {
              "id": "b",
              "text": "struct"
            },
            {
              "id": "c",
              "text": "object"
            },
            {
              "id": "d",
              "text": "def"
            }
          ],
          "answer": "a",
          "explanation": "class inicia a definição de uma classe."
        },
        {
          "id": "q2",
          "kind": "mcq",
          "prompt": "Qual método é chamado automaticamente ao criar um objeto novo?",
          "choices": [
            {
              "id": "a",
              "text": "__init__"
            },
            {
              "id": "b",
              "text": "__construct__"
            },
            {
              "id": "c",
              "text": "__create__"
            },
            {
              "id": "d",
              "text": "__start__"
            }
          ],
          "answer": "a",
          "explanation": "__init__ é o inicializador padrão de uma classe em Python."
        },
        {
          "id": "q3",
          "kind": "mcq",
          "prompt": "O que self representa dentro dos métodos de uma classe?",
          "choices": [
            {
              "id": "a",
              "text": "A classe em si"
            },
            {
              "id": "b",
              "text": "A instância (o objeto) atual"
            },
            {
              "id": "c",
              "text": "Uma variável global"
            },
            {
              "id": "d",
              "text": "Um valor fixo que nunca muda"
            }
          ],
          "answer": "b",
          "explanation": "self é o próprio objeto sendo usado — cada instância tem o seu."
        },
        {
          "id": "q4",
          "kind": "fill",
          "prompt": "Complete o parâmetro que todo método de uma classe recebe primeiro, representando o próprio objeto:",
          "code": "class Pessoa:\n    def cumprimentar(___):\n        print(\"oi\")",
          "accept": [
            "self"
          ],
          "explanation": "self é uma convenção universal em Python para esse primeiro parâmetro."
        },
        {
          "id": "q5",
          "kind": "mcq",
          "prompt": "Dado o código abaixo, o que print(p.nome) exibe?",
          "code": "class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n\np = Pessoa(\"Ana\")",
          "choices": [
            {
              "id": "a",
              "text": "Ana"
            },
            {
              "id": "b",
              "text": "Pessoa"
            },
            {
              "id": "c",
              "text": "self.nome"
            },
            {
              "id": "d",
              "text": "erro"
            }
          ],
          "answer": "a",
          "explanation": "__init__ guardou \"Ana\" em self.nome, que vira o atributo p.nome."
        },
        {
          "id": "q6",
          "kind": "mcq",
          "prompt": "Como criar (instanciar) um objeto da classe Pessoa?",
          "choices": [
            {
              "id": "a",
              "text": "Pessoa.new(\"Ana\")"
            },
            {
              "id": "b",
              "text": "new Pessoa(\"Ana\")"
            },
            {
              "id": "c",
              "text": "Pessoa(\"Ana\")"
            },
            {
              "id": "d",
              "text": "create Pessoa(\"Ana\")"
            }
          ],
          "answer": "c",
          "explanation": "Chamar a classe como uma função cria um objeto novo — sem \"new\"."
        },
        {
          "id": "q7",
          "kind": "mcq",
          "prompt": "Atributos de um objeto (como self.nome) guardam:",
          "choices": [
            {
              "id": "a",
              "text": "Código que só a classe pode executar"
            },
            {
              "id": "b",
              "text": "Dados específicos daquela instância"
            },
            {
              "id": "c",
              "text": "Apenas outros métodos"
            },
            {
              "id": "d",
              "text": "Nada — servem só de documentação"
            }
          ],
          "answer": "b",
          "explanation": "Cada objeto tem seus próprios valores guardados em atributos."
        },
        {
          "id": "q8",
          "kind": "fill",
          "prompt": "Complete para acessar o atributo nome do objeto p:",
          "code": "print(p.___)",
          "accept": [
            "nome"
          ],
          "explanation": "Atributos são acessados com ponto: objeto.atributo."
        }
      ]
    },
    {
      "id": "int-06-heranca",
      "title": "Herança e métodos especiais",
      "goal": "Estender uma classe com herança, usar super() e conhecer __str__.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O que é herança?",
            "body": "Herança permite que uma classe (a \"filha\") reaproveite atributos e métodos de outra classe (a \"mãe\"), sem reescrever tudo.",
            "code": "class Animal:\n    def __init__(self, nome):\n        self.nome = nome\n\nclass Cachorro(Animal):\n    pass"
          },
          {
            "title": "Chamando o construtor da classe mãe com super()",
            "body": "Dentro do __init__ da classe filha, super().__init__(...) chama o construtor da classe mãe, reaproveitando sua lógica.",
            "code": "class Cachorro(Animal):\n    def __init__(self, nome, raca):\n        super().__init__(nome)\n        self.raca = raca"
          },
          {
            "title": "Sobrescrevendo (override) um método",
            "body": "A classe filha pode redefinir um método da classe mãe com o mesmo nome — isso se chama sobrescrita (override)."
          },
          {
            "title": "O método especial __str__",
            "body": "__str__ define o que print(objeto) exibe — sem ele, print mostra algo genérico como <__main__.Pessoa object at 0x...>.",
            "code": "class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n    def __str__(self):\n        return f\"Pessoa: {self.nome}\"\n\nprint(Pessoa(\"Ana\"))  # Pessoa: Ana"
          },
          {
            "title": "Métodos especiais (dunder methods)",
            "body": "__str__ é um exemplo de método especial (chamado de \"dunder\", de double underscore) — Python chama esses métodos automaticamente em situações específicas, como __init__ ao criar o objeto."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que é herança em Python?",
          "choices": [
            { "id": "a", "text": "Permite que uma classe reaproveite atributos e métodos de outra classe" },
            { "id": "b", "text": "Um tipo de laço de repetição" },
            { "id": "c", "text": "Uma forma de apagar uma classe" },
            { "id": "d", "text": "Só existe em listas" }
          ],
          "answer": "a",
          "explanation": "Herança é o mecanismo de reaproveitar código entre uma classe mãe e uma classe filha."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que super().__init__(...) faz dentro do __init__ de uma classe filha?",
          "choices": [
            { "id": "a", "text": "Chama o construtor da classe mãe, reaproveitando sua lógica" },
            { "id": "b", "text": "Cria uma nova classe do zero" },
            { "id": "c", "text": "Apaga o construtor da classe mãe" },
            { "id": "d", "text": "Não faz nada em Python" }
          ],
          "answer": "a",
          "explanation": "super() dá acesso à classe mãe, permitindo reaproveitar seu __init__."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que significa \"sobrescrever\" (override) um método?",
          "choices": [
            { "id": "a", "text": "A classe filha redefine um método da classe mãe, com o mesmo nome" },
            { "id": "b", "text": "Apagar um método permanentemente" },
            { "id": "c", "text": "Renomear um método" },
            { "id": "d", "text": "Só é possível uma vez por classe" }
          ],
          "answer": "a",
          "explanation": "Sobrescrita é quando a classe filha fornece sua própria versão de um método herdado."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o nome usado para chamar o construtor da classe mãe:",
          "code": "class Cachorro(Animal):\n    def __init__(self, nome, raca):\n        ___().__init__(nome)\n        self.raca = raca",
          "accept": ["super"],
          "explanation": "super() dá acesso aos métodos da classe mãe."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Para que serve o método especial __str__?",
          "choices": [
            { "id": "a", "text": "Define o que print(objeto) exibe" },
            { "id": "b", "text": "Cria o objeto" },
            { "id": "c", "text": "Apaga o objeto" },
            { "id": "d", "text": "Compara dois objetos" }
          ],
          "answer": "a",
          "explanation": "__str__ controla a representação em texto do objeto usada por print()."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Sem definir __str__, o que print(objeto) costuma exibir?",
          "choices": [
            { "id": "a", "text": "Algo genérico, como <__main__.Pessoa object at 0x...>" },
            { "id": "b", "text": "Sempre um erro" },
            { "id": "c", "text": "Sempre None" },
            { "id": "d", "text": "O código-fonte da classe" }
          ],
          "answer": "a",
          "explanation": "Sem __str__, Python usa uma representação padrão pouco legível do objeto."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Como são chamados métodos como __init__ e __str__, que começam e terminam com dois underscores?",
          "choices": [
            { "id": "a", "text": "Métodos especiais (ou \"dunder methods\")" },
            { "id": "b", "text": "Métodos privados" },
            { "id": "c", "text": "Métodos estáticos" },
            { "id": "d", "text": "Métodos abstratos" }
          ],
          "answer": "a",
          "explanation": "\"Dunder\" vem de \"double underscore\" — o padrão __nome__ desses métodos."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o método especial que define o texto exibido por print(objeto):",
          "code": "class Pessoa:\n    def ___(self):\n        return f\"Pessoa: {self.nome}\"",
          "accept": ["__str__"],
          "explanation": "__str__ é o método especial responsável pela representação em texto do objeto."
        }
      ]
    },
    {
      "id": "int-11-properties",
      "title": "Properties",
      "goal": "Usar @property para controlar o acesso a um atributo sem mudar a sintaxe de uso.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O problema: acesso direto a atributos",
            "body": "Até agora, acessávamos atributos diretamente (objeto.atributo), sem nenhum controle sobre o que acontece ao ler ou definir aquele valor."
          },
          {
            "title": "O decorator @property",
            "body": "@property transforma um método em algo que se comporta como um atributo — é chamado automaticamente ao acessar objeto.nome, sem precisar escrever objeto.nome().",
            "code": "class Pessoa:\n    def __init__(self, nome):\n        self._nome = nome\n\n    @property\n    def nome(self):\n        return self._nome"
          },
          {
            "title": "Por que usar um underscore no atributo interno?",
            "body": "Por convenção, self._nome (com underscore) marca o atributo \"de verdade\" guardado internamente, enquanto nome (sem underscore) é a property que controla o acesso a ele."
          },
          {
            "title": "Um setter com @nome.setter",
            "body": "Podemos definir o que acontece ao ATRIBUIR um valor com @nome.setter, permitindo validar o valor antes de guardá-lo.",
            "code": "@nome.setter\ndef nome(self, valor):\n    if not valor:\n        raise ValueError(\"Nome não pode ser vazio\")\n    self._nome = valor"
          },
          {
            "title": "A vantagem: sintaxe de atributo, lógica de método",
            "body": "Quem usa a classe continua escrevendo pessoa.nome (como se fosse um atributo simples), mas por trás roda a lógica definida na property."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que o decorator @property faz?",
          "choices": [
            { "id": "a", "text": "Transforma um método em algo acessado como se fosse um atributo comum" },
            { "id": "b", "text": "Cria uma variável global" },
            { "id": "c", "text": "Impede que a classe tenha métodos" },
            { "id": "d", "text": "Apaga o atributo" }
          ],
          "answer": "a",
          "explanation": "@property é o que permite chamar um método sem parênteses, como se fosse um atributo."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Como uma property definida com @property é acessada por quem usa a classe?",
          "choices": [
            { "id": "a", "text": "Como um atributo comum: objeto.nome, sem parênteses" },
            { "id": "b", "text": "Como um método: objeto.nome()" },
            { "id": "c", "text": "Só de dentro da própria classe" },
            { "id": "d", "text": "Não pode ser acessada de forma nenhuma" }
          ],
          "answer": "a",
          "explanation": "A property mantém a sintaxe de acesso de um atributo comum, sem parênteses."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Por que é comum guardar o valor real num atributo com underscore, como self._nome?",
          "choices": [
            { "id": "a", "text": "Para diferenciar o atributo interno da property que controla o acesso a ele" },
            { "id": "b", "text": "Porque Python exige o underscore por sintaxe" },
            { "id": "c", "text": "Para tornar o atributo mais rápido" },
            { "id": "d", "text": "Não tem motivo nenhum, é só estética" }
          ],
          "answer": "a",
          "explanation": "O underscore evita conflito de nome entre a property \"nome\" e o atributo interno que ela controla."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o decorator que transforma um método em property:",
          "code": "class Pessoa:\n    ___\n    def nome(self):\n        return self._nome",
          "accept": ["@property"],
          "explanation": "@property é o decorator que cria a property a partir do método."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Para que serve um setter definido com @nome.setter?",
          "choices": [
            { "id": "a", "text": "Permite validar ou processar um valor antes de guardá-lo, ao atribuir objeto.nome = valor" },
            { "id": "b", "text": "Cria uma nova classe" },
            { "id": "c", "text": "Remove a property" },
            { "id": "d", "text": "Só funciona com números" }
          ],
          "answer": "a",
          "explanation": "O setter intercepta a atribuição, permitindo validação antes de guardar o valor."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual a principal vantagem de usar @property em vez de acessar o atributo diretamente?",
          "choices": [
            { "id": "a", "text": "Permite controlar/validar o acesso, mantendo a sintaxe simples de atributo" },
            { "id": "b", "text": "Torna o código mais lento sempre" },
            { "id": "c", "text": "Impede qualquer acesso ao valor" },
            { "id": "d", "text": "Não existe vantagem nenhuma" }
          ],
          "answer": "a",
          "explanation": "É o melhor dos dois mundos: controle de método, sintaxe de atributo."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Depois de definir uma property \"nome\" com @property, quem usa a classe pode fazer pessoa.nome() com parênteses?",
          "choices": [
            { "id": "a", "text": "Não — o acesso é sem parênteses, como um atributo comum" },
            { "id": "b", "text": "Sim, sempre com parênteses" },
            { "id": "c", "text": "Só às vezes, dependendo do valor" },
            { "id": "d", "text": "Só se herdar de outra classe" }
          ],
          "answer": "a",
          "explanation": "Usar parênteses chamaria o resultado da property como se fosse uma função, o que não é o objetivo."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o decorator usado para definir o setter de uma property chamada nome:",
          "code": "@nome.___\ndef nome(self, valor):\n    self._nome = valor",
          "accept": ["setter"],
          "explanation": "@nome.setter define o método executado ao atribuir um novo valor à property."
        }
      ]
    },
    {
      "id": "int-07-modulos",
      "title": "Módulos e import",
      "goal": "Importar módulos da biblioteca padrão e organizar código em múltiplos arquivos.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O que é um módulo?",
            "body": "Um módulo é um arquivo Python (.py) com código reaproveitável — funções, classes, variáveis. Python já vem com uma biblioteca padrão cheia de módulos prontos."
          },
          {
            "title": "Importando um módulo inteiro",
            "body": "import nome_do_modulo traz o módulo inteiro; para usar algo dele, escrevemos modulo.algo.",
            "code": "import math\nprint(math.sqrt(16))  # 4.0"
          },
          {
            "title": "Importando só uma parte com from...import",
            "body": "from modulo import algo traz só o que for preciso, sem precisar escrever o nome do módulo toda vez.",
            "code": "from math import sqrt\nprint(sqrt(16))  # 4.0"
          },
          {
            "title": "Apelidando um módulo com as",
            "body": "import modulo as apelido dá um nome mais curto para o módulo, útil para módulos com nomes longos ou muito usados.",
            "code": "import math as m\nprint(m.sqrt(16))"
          },
          {
            "title": "Criando seu próprio módulo",
            "body": "Qualquer arquivo .py pode ser importado por outro, usando o nome do arquivo (sem .py) como nome do módulo — assim é possível organizar um programa grande em vários arquivos."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que é um módulo em Python?",
          "choices": [
            { "id": "a", "text": "Um arquivo .py com código reaproveitável (funções, classes, variáveis)" },
            { "id": "b", "text": "Um tipo de variável" },
            { "id": "c", "text": "Um símbolo de fluxograma" },
            { "id": "d", "text": "Um erro de sintaxe" }
          ],
          "answer": "a",
          "explanation": "Um módulo é simplesmente um arquivo .py que pode ser importado por outros."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que import math faz?",
          "choices": [
            { "id": "a", "text": "Traz o módulo math inteiro, acessado com math.algo" },
            { "id": "b", "text": "Executa o módulo math e apaga ele em seguida" },
            { "id": "c", "text": "Cria um novo módulo chamado math" },
            { "id": "d", "text": "Só funciona dentro de uma função" }
          ],
          "answer": "a",
          "explanation": "import traz o módulo inteiro, acessado com o prefixo do nome do módulo."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Qual a vantagem de from math import sqrt em vez de só import math?",
          "choices": [
            { "id": "a", "text": "Permite usar sqrt(16) diretamente, sem escrever math. na frente" },
            { "id": "b", "text": "Não muda nada, são idênticos" },
            { "id": "c", "text": "from...import é mais lento" },
            { "id": "d", "text": "Não é possível importar só uma parte" }
          ],
          "answer": "a",
          "explanation": "from...import traz só o nome específico, usado sem prefixo."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a palavra-chave usada para dar um apelido a um módulo importado:",
          "code": "import math ___ m\nprint(m.sqrt(16))",
          "accept": ["as"],
          "explanation": "as define um apelido para o módulo importado."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que print(math.sqrt(16)) exibe?",
          "choices": [
            { "id": "a", "text": "4.0" },
            { "id": "b", "text": "16" },
            { "id": "c", "text": "8.0" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "math.sqrt calcula a raiz quadrada — a raiz quadrada de 16 é 4.0."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "É possível importar um arquivo .py próprio, criado pelo programador?",
          "choices": [
            { "id": "a", "text": "Sim, qualquer arquivo .py pode ser importado por outro, usando o nome do arquivo (sem .py)" },
            { "id": "b", "text": "Não, só módulos da biblioteca padrão podem ser importados" },
            { "id": "c", "text": "Só é possível com um apelido" },
            { "id": "d", "text": "Só funciona com arquivos chamados \"main.py\"" }
          ],
          "answer": "a",
          "explanation": "Qualquer arquivo .py pode ser um módulo importável por outro arquivo do mesmo projeto."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Por que usar módulos em vez de escrever tudo num arquivo só?",
          "choices": [
            { "id": "a", "text": "Permite organizar um programa grande em partes reutilizáveis e mais fáceis de manter" },
            { "id": "b", "text": "Não existe vantagem nenhuma" },
            { "id": "c", "text": "Módulos tornam o programa mais lento sempre" },
            { "id": "d", "text": "É obrigatório em qualquer programa Python" }
          ],
          "answer": "a",
          "explanation": "Módulos ajudam a organizar e reaproveitar código entre diferentes partes de um projeto."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete a instrução que importa só a função sqrt do módulo math:",
          "code": "___ math import sqrt",
          "accept": ["from"],
          "explanation": "from define de qual módulo importar; import define o que trazer dele."
        }
      ]
    },
    {
      "id": "int-14-venv",
      "title": "Ambientes virtuais",
      "goal": "Entender por que isolar as dependências de um projeto Python com um ambiente virtual.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O problema: projetos diferentes, dependências diferentes",
            "body": "Cada projeto Python pode precisar de versões diferentes das mesmas bibliotecas. Instalar tudo \"globalmente\" no computador pode gerar conflitos entre projetos."
          },
          {
            "title": "O que é um ambiente virtual?",
            "body": "Um ambiente virtual (venv) é uma pasta isolada com sua própria instalação de Python e bibliotecas, separada do restante do sistema — cada projeto pode ter o seu."
          },
          {
            "title": "Criando um ambiente virtual",
            "body": "O módulo venv, da biblioteca padrão, cria um ambiente virtual novo numa pasta.",
            "code": "python -m venv meu_ambiente"
          },
          {
            "title": "Ativando o ambiente virtual",
            "body": "Depois de criado, é preciso ATIVAR o ambiente virtual no terminal — a partir daí, os pacotes instalados com pip ficam isolados dentro dele."
          },
          {
            "title": "Instalando pacotes com pip",
            "body": "Com o ambiente ativado, pip install nome_do_pacote instala uma biblioteca só dentro daquele ambiente, sem afetar outros projetos.",
            "code": "pip install requests"
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Por que usar um ambiente virtual (venv) num projeto Python?",
          "choices": [
            { "id": "a", "text": "Para isolar as bibliotecas instaladas de cada projeto, evitando conflitos entre versões diferentes" },
            { "id": "b", "text": "Para deixar o Python mais rápido" },
            { "id": "c", "text": "Para impedir que o código tenha erros" },
            { "id": "d", "text": "Não existe motivo real, é só opcional sem função" }
          ],
          "answer": "a",
          "explanation": "O isolamento de dependências é o motivo central para usar um ambiente virtual."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que é um ambiente virtual?",
          "choices": [
            { "id": "a", "text": "Uma pasta isolada com sua própria instalação de Python e bibliotecas" },
            { "id": "b", "text": "Um tipo de variável" },
            { "id": "c", "text": "Um símbolo de fluxograma" },
            { "id": "d", "text": "Um site que roda Python" }
          ],
          "answer": "a",
          "explanation": "O ambiente virtual é literalmente uma pasta com um Python e bibliotecas isolados."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Qual módulo da biblioteca padrão é usado para criar um ambiente virtual?",
          "choices": [
            { "id": "a", "text": "venv" },
            { "id": "b", "text": "math" },
            { "id": "c", "text": "random" },
            { "id": "d", "text": "functools" }
          ],
          "answer": "a",
          "explanation": "venv é o módulo padrão do Python para criar ambientes virtuais."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o comando que cria um ambiente virtual chamado meu_ambiente:",
          "code": "python -m ___ meu_ambiente",
          "accept": ["venv"],
          "explanation": "python -m venv cria um ambiente virtual novo na pasta indicada."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que é preciso fazer depois de criar um ambiente virtual, antes de instalar pacotes nele?",
          "choices": [
            { "id": "a", "text": "Ativá-lo no terminal" },
            { "id": "b", "text": "Reiniciar o computador" },
            { "id": "c", "text": "Apagar o ambiente e criar de novo" },
            { "id": "d", "text": "Nada, ele já vem ativado" }
          ],
          "answer": "a",
          "explanation": "A ativação faz o terminal usar o Python e os pacotes daquele ambiente específico."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Com o ambiente virtual ativado, qual comando instala uma biblioteca dentro dele?",
          "choices": [
            { "id": "a", "text": "pip install nome_do_pacote" },
            { "id": "b", "text": "python install nome_do_pacote" },
            { "id": "c", "text": "venv install nome_do_pacote" },
            { "id": "d", "text": "import nome_do_pacote" }
          ],
          "answer": "a",
          "explanation": "pip é o gerenciador de pacotes usado para instalar bibliotecas em Python."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "O que acontece com um pacote instalado dentro de um ambiente virtual ativado?",
          "choices": [
            { "id": "a", "text": "Ele fica isolado, disponível só naquele ambiente, sem afetar outros projetos" },
            { "id": "b", "text": "Ele é instalado globalmente no computador inteiro" },
            { "id": "c", "text": "Ele é apagado automaticamente depois de usar" },
            { "id": "d", "text": "Ele afeta todos os outros ambientes virtuais também" }
          ],
          "answer": "a",
          "explanation": "Esse isolamento é exatamente o propósito de um ambiente virtual."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o comando usado para instalar um pacote com o ambiente ativado:",
          "code": "___ install requests",
          "accept": ["pip"],
          "explanation": "pip é o comando usado para instalar pacotes Python."
        }
      ]
    },
    {
      "id": "int-08-arquivos",
      "title": "Manipulação de arquivos",
      "goal": "Abrir, ler e escrever arquivos de texto usando open() e with.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "Abrindo um arquivo com open()",
            "body": "open(caminho, modo) abre um arquivo. O modo indica o que fazer: 'r' para ler, 'w' para escrever (sobrescrevendo o conteúdo), 'a' para adicionar ao final.",
            "code": "arquivo = open(\"dados.txt\", \"r\")"
          },
          {
            "title": "O bloco with: fechamento automático",
            "body": "Usar with garante que o arquivo é fechado automaticamente ao final do bloco, mesmo se ocorrer um erro — é a forma recomendada de trabalhar com arquivos.",
            "code": "with open(\"dados.txt\", \"r\") as arquivo:\n    conteudo = arquivo.read()\nprint(conteudo)"
          },
          {
            "title": "Lendo o conteúdo: read() e readlines()",
            "body": ".read() devolve o arquivo inteiro como uma única string; .readlines() devolve uma lista, com uma linha do arquivo em cada posição."
          },
          {
            "title": "Escrevendo num arquivo",
            "body": "Com o modo 'w', .write(texto) escreve no arquivo, substituindo qualquer conteúdo anterior.",
            "code": "with open(\"saida.txt\", \"w\") as arquivo:\n    arquivo.write(\"Olá, arquivo!\")"
          },
          {
            "title": "Modo 'a': adicionar sem apagar",
            "body": "O modo 'a' (append) adiciona o texto ao final do arquivo, sem apagar o que já existia — diferente do 'w', que sobrescreve tudo."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que open(\"dados.txt\", \"r\") faz?",
          "choices": [
            { "id": "a", "text": "Abre o arquivo dados.txt para leitura" },
            { "id": "b", "text": "Cria um arquivo novo sempre" },
            { "id": "c", "text": "Apaga o arquivo dados.txt" },
            { "id": "d", "text": "Só funciona com arquivos .py" }
          ],
          "answer": "a",
          "explanation": "O modo \"r\" abre o arquivo para leitura."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Qual a vantagem de usar with ao abrir um arquivo?",
          "choices": [
            { "id": "a", "text": "Garante que o arquivo seja fechado automaticamente ao final do bloco" },
            { "id": "b", "text": "Torna a leitura mais lenta" },
            { "id": "c", "text": "Impede que o arquivo seja lido" },
            { "id": "d", "text": "Não existe vantagem nenhuma" }
          ],
          "answer": "a",
          "explanation": "with fecha o arquivo automaticamente, mesmo se um erro ocorrer dentro do bloco."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que o método .read() devolve?",
          "choices": [
            { "id": "a", "text": "O conteúdo inteiro do arquivo como uma única string" },
            { "id": "b", "text": "Uma lista de números" },
            { "id": "c", "text": "Sempre None" },
            { "id": "d", "text": "O nome do arquivo" }
          ],
          "answer": "a",
          "explanation": ".read() lê o arquivo inteiro de uma vez, como uma string só."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a palavra-chave que garante o fechamento automático do arquivo:",
          "code": "___ open(\"dados.txt\", \"r\") as arquivo:\n    conteudo = arquivo.read()",
          "accept": ["with"],
          "explanation": "with é o comando que garante o fechamento automático do arquivo."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "O que o modo 'w' faz ao abrir um arquivo que já existe?",
          "choices": [
            { "id": "a", "text": "Sobrescreve todo o conteúdo anterior" },
            { "id": "b", "text": "Adiciona ao final sem apagar nada" },
            { "id": "c", "text": "Só permite leitura" },
            { "id": "d", "text": "Impede a abertura do arquivo" }
          ],
          "answer": "a",
          "explanation": "O modo 'w' (write) sobrescreve o conteúdo existente do arquivo."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual modo adiciona texto ao final do arquivo, sem apagar o que já existia?",
          "choices": [
            { "id": "a", "text": "'a'" },
            { "id": "b", "text": "'w'" },
            { "id": "c", "text": "'r'" },
            { "id": "d", "text": "'x'" }
          ],
          "answer": "a",
          "explanation": "'a' (append) adiciona ao final, preservando o conteúdo anterior."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "O que .readlines() devolve?",
          "choices": [
            { "id": "a", "text": "Uma lista, com uma linha do arquivo em cada posição" },
            { "id": "b", "text": "Uma única string com tudo junto" },
            { "id": "c", "text": "Um dicionário" },
            { "id": "d", "text": "Sempre uma lista vazia" }
          ],
          "answer": "a",
          "explanation": ".readlines() separa o conteúdo do arquivo por linha, numa lista."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o método usado para escrever texto num arquivo aberto em modo 'w':",
          "code": "with open(\"saida.txt\", \"w\") as arquivo:\n    arquivo.___(\"Olá, arquivo!\")",
          "accept": ["write"],
          "explanation": ".write() escreve o texto passado no arquivo aberto."
        }
      ]
    },
    {
      "id": "int-12-args-kwargs",
      "title": "*args e **kwargs",
      "goal": "Aceitar um número indefinido de argumentos posicionais e nomeados numa função.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O problema: número variável de argumentos",
            "body": "Até agora, toda função tinha um número fixo de parâmetros. Mas às vezes queremos aceitar QUALQUER quantidade de argumentos — é para isso que existem *args e **kwargs."
          },
          {
            "title": "*args: argumentos posicionais variáveis",
            "body": "*args reúne todos os argumentos posicionais extras numa tupla, dentro da função.",
            "code": "def soma_tudo(*args):\n    return sum(args)\n\nprint(soma_tudo(1, 2, 3))     # 6\nprint(soma_tudo(1, 2, 3, 4))  # 10"
          },
          {
            "title": "**kwargs: argumentos nomeados variáveis",
            "body": "**kwargs reúne todos os argumentos nomeados extras (passados como chave=valor) num dicionário.",
            "code": "def apresentar(**kwargs):\n    for chave, valor in kwargs.items():\n        print(f\"{chave}: {valor}\")\n\napresentar(nome=\"Ana\", idade=20)"
          },
          {
            "title": "Os nomes args/kwargs são convenção",
            "body": "Os nomes \"args\" e \"kwargs\" não são obrigatórios (o que importa são os símbolos * e **), mas são a convenção universal usada por quase todo mundo."
          },
          {
            "title": "Combinando parâmetros normais com *args e **kwargs",
            "body": "É possível combinar parâmetros fixos com *args e **kwargs na mesma função, desde que na ordem: normais, depois *args, depois **kwargs.",
            "code": "def registrar(nome, *args, **kwargs):\n    print(nome, args, kwargs)"
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "Para que serve *args numa função?",
          "choices": [
            { "id": "a", "text": "Reunir todos os argumentos posicionais extras numa tupla" },
            { "id": "b", "text": "Reunir argumentos nomeados num dicionário" },
            { "id": "c", "text": "Definir um valor padrão fixo" },
            { "id": "d", "text": "Impedir que a função receba argumentos" }
          ],
          "answer": "a",
          "explanation": "*args coleta os argumentos posicionais extras numa tupla."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "Para que serve **kwargs numa função?",
          "choices": [
            { "id": "a", "text": "Reunir todos os argumentos nomeados extras (chave=valor) num dicionário" },
            { "id": "b", "text": "Reunir argumentos posicionais numa tupla" },
            { "id": "c", "text": "Definir o nome da função" },
            { "id": "d", "text": "Limitar a função a um único argumento" }
          ],
          "answer": "a",
          "explanation": "**kwargs coleta os argumentos nomeados extras num dicionário."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Dado def soma_tudo(*args): return sum(args), o que soma_tudo(1, 2, 3) devolve?",
          "choices": [
            { "id": "a", "text": "6" },
            { "id": "b", "text": "(1, 2, 3)" },
            { "id": "c", "text": "erro" },
            { "id": "d", "text": "3" }
          ],
          "answer": "a",
          "explanation": "sum(args) soma os valores da tupla (1, 2, 3), resultando em 6."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o símbolo que reúne argumentos posicionais extras numa tupla:",
          "code": "def soma_tudo(___args):\n    return sum(args)",
          "accept": ["*"],
          "explanation": "O asterisco (*) antes do nome cria o parâmetro que reúne argumentos posicionais extras."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Os nomes \"args\" e \"kwargs\" são obrigatórios em Python?",
          "choices": [
            { "id": "a", "text": "Não — são só convenção; o que importa são os símbolos * e **" },
            { "id": "b", "text": "Sim, são palavras reservadas obrigatórias" },
            { "id": "c", "text": "Só \"args\" é obrigatório" },
            { "id": "d", "text": "Só funcionam com esses nomes exatos" }
          ],
          "answer": "a",
          "explanation": "Qualquer nome funcionaria; args/kwargs é só a convenção seguida por quase todo mundo."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual a ordem correta para combinar parâmetros numa função?",
          "choices": [
            { "id": "a", "text": "Parâmetros normais, depois *args, depois **kwargs" },
            { "id": "b", "text": "**kwargs, depois *args, depois normais" },
            { "id": "c", "text": "A ordem nunca importa" },
            { "id": "d", "text": "*args sempre vem primeiro que os parâmetros normais" }
          ],
          "answer": "a",
          "explanation": "Essa é a ordem exigida pela sintaxe de Python: normais, *args, **kwargs."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "Dado apresentar(**kwargs) chamada como apresentar(nome=\"Ana\", idade=20), o que kwargs contém?",
          "choices": [
            { "id": "a", "text": "{\"nome\": \"Ana\", \"idade\": 20}" },
            { "id": "b", "text": "(\"Ana\", 20)" },
            { "id": "c", "text": "[\"nome\", \"idade\"]" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "kwargs vira um dicionário com os nomes dos argumentos como chaves."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o símbolo que reúne argumentos nomeados extras num dicionário:",
          "code": "def apresentar(___kwargs):\n    print(kwargs)",
          "accept": ["**"],
          "explanation": "Dois asteriscos (**) antes do nome criam o parâmetro que reúne argumentos nomeados extras."
        }
      ]
    },
    {
      "id": "int-09-funcional",
      "title": "Programação funcional: lambda, map e filter",
      "goal": "Criar funções anônimas com lambda e aplicá-las a sequências com map/filter.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "Funções anônimas com lambda",
            "body": "lambda cria uma função pequena, sem nome, numa linha só: lambda parametros: expressão.",
            "code": "dobro = lambda x: x * 2\nprint(dobro(5))  # 10"
          },
          {
            "title": "map(): aplicando uma função a cada item",
            "body": "map(funcao, sequencia) aplica a função a CADA item da sequência, devolvendo um novo iterável com os resultados.",
            "code": "nums = [1, 2, 3]\ndobrados = list(map(lambda x: x * 2, nums))\nprint(dobrados)  # [2, 4, 6]"
          },
          {
            "title": "filter(): mantendo só quem passa no teste",
            "body": "filter(funcao, sequencia) mantém só os itens para os quais a função devolve True.",
            "code": "nums = [1, 2, 3, 4, 5, 6]\npares = list(filter(lambda x: x % 2 == 0, nums))\nprint(pares)  # [2, 4, 6]"
          },
          {
            "title": "map/filter x list comprehension",
            "body": "Tudo que map/filter fazem também pode ser escrito com list comprehension — muitos programadores Python preferem comprehensions por serem mais legíveis, mas as duas formas são válidas."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que lambda cria em Python?",
          "choices": [
            { "id": "a", "text": "Uma função anônima, sem nome, numa linha só" },
            { "id": "b", "text": "Um tipo de laço" },
            { "id": "c", "text": "Uma classe" },
            { "id": "d", "text": "Um módulo" }
          ],
          "answer": "a",
          "explanation": "lambda cria uma função anônima, sem precisar de def nem de nome."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que map(funcao, sequencia) faz?",
          "choices": [
            { "id": "a", "text": "Aplica a função a cada item da sequência, devolvendo os resultados" },
            { "id": "b", "text": "Remove itens da sequência" },
            { "id": "c", "text": "Ordena a sequência" },
            { "id": "d", "text": "Soma todos os itens" }
          ],
          "answer": "a",
          "explanation": "map aplica a função item por item, produzindo um novo iterável de resultados."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "O que filter(funcao, sequencia) faz?",
          "choices": [
            { "id": "a", "text": "Mantém só os itens para os quais a função devolve True" },
            { "id": "b", "text": "Aplica a função a cada item, sem filtrar nada" },
            { "id": "c", "text": "Ordena a sequência do maior para o menor" },
            { "id": "d", "text": "Sempre devolve uma lista vazia" }
          ],
          "answer": "a",
          "explanation": "filter usa a função como um teste: só passam os itens em que ela devolve True."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a palavra-chave que cria uma função anônima:",
          "code": "dobro = ___ x: x * 2",
          "accept": ["lambda"],
          "explanation": "lambda é a palavra-chave que inicia uma função anônima."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Dado nums = [1, 2, 3], o que list(map(lambda x: x * 2, nums)) produz?",
          "choices": [
            { "id": "a", "text": "[2, 4, 6]" },
            { "id": "b", "text": "[1, 2, 3]" },
            { "id": "c", "text": "[1, 4, 9]" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "Cada valor de nums é multiplicado por 2."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Dado nums = [1, 2, 3, 4], o que list(filter(lambda x: x % 2 == 0, nums)) produz?",
          "choices": [
            { "id": "a", "text": "[2, 4]" },
            { "id": "b", "text": "[1, 3]" },
            { "id": "c", "text": "[1, 2, 3, 4]" },
            { "id": "d", "text": "[]" }
          ],
          "answer": "a",
          "explanation": "filter mantém só os números pares, que passam no teste x % 2 == 0."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "É possível reescrever um map/filter usando list comprehension?",
          "choices": [
            { "id": "a", "text": "Sim, tudo que map/filter fazem também pode ser escrito com comprehension" },
            { "id": "b", "text": "Não, são funcionalidades completamente diferentes" },
            { "id": "c", "text": "Só filter pode ser reescrito, map não" },
            { "id": "d", "text": "Só funciona com números" }
          ],
          "answer": "a",
          "explanation": "List comprehensions cobrem os mesmos casos de uso de map/filter, de forma equivalente."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete a função que mantém só os itens que passam num teste lógico:",
          "code": "pares = list(___(lambda x: x % 2 == 0, nums))",
          "accept": ["filter"],
          "explanation": "filter é a função que filtra itens de acordo com um teste lógico."
        }
      ]
    },
    {
      "id": "int-13-reduce",
      "title": "functools.reduce",
      "goal": "Combinar todos os itens de uma sequência num único valor com reduce.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "O que reduce faz?",
            "body": "reduce combina todos os itens de uma sequência, aplicando uma função repetidamente, até sobrar um único valor."
          },
          {
            "title": "Importando reduce",
            "body": "reduce não é uma função embutida como map/filter — ela vem do módulo functools e precisa ser importada.",
            "code": "from functools import reduce"
          },
          {
            "title": "Um exemplo: somando uma lista",
            "body": "reduce(funcao, sequencia) aplica a função aos dois primeiros itens, depois ao resultado com o terceiro item, e assim por diante.",
            "code": "from functools import reduce\nnums = [1, 2, 3, 4]\ntotal = reduce(lambda a, b: a + b, nums)\nprint(total)  # 10"
          },
          {
            "title": "Passo a passo do reduce",
            "body": "Para [1, 2, 3, 4] com soma: primeiro 1+2=3, depois 3+3=6, depois 6+4=10 — o resultado final é 10."
          },
          {
            "title": "reduce x um laço com acumulador",
            "body": "reduce faz exatamente o que um laço for com uma variável acumuladora faria, só que numa expressão só."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que reduce(funcao, sequencia) faz?",
          "choices": [
            { "id": "a", "text": "Combina todos os itens da sequência, aplicando a função repetidamente até sobrar um único valor" },
            { "id": "b", "text": "Filtra itens da sequência" },
            { "id": "c", "text": "Aplica a função a cada item, sem combinar nada" },
            { "id": "d", "text": "Ordena a sequência" }
          ],
          "answer": "a",
          "explanation": "reduce reduz a sequência inteira a um único valor combinado."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "De qual módulo vem a função reduce?",
          "choices": [
            { "id": "a", "text": "functools" },
            { "id": "b", "text": "math" },
            { "id": "c", "text": "random" },
            { "id": "d", "text": "Não precisa importar, já é embutida" }
          ],
          "answer": "a",
          "explanation": "reduce está no módulo functools da biblioteca padrão."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Dado nums = [1, 2, 3, 4], o que reduce(lambda a, b: a + b, nums) produz?",
          "choices": [
            { "id": "a", "text": "10" },
            { "id": "b", "text": "24" },
            { "id": "c", "text": "[1, 2, 3, 4]" },
            { "id": "d", "text": "erro" }
          ],
          "answer": "a",
          "explanation": "1+2+3+4 = 10."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete a instrução que importa reduce:",
          "code": "___ functools import reduce",
          "accept": ["from"],
          "explanation": "from functools import reduce traz a função reduce para uso."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Como reduce processa uma sequência de 4 itens com uma função de soma?",
          "choices": [
            { "id": "a", "text": "Aplica a função aos dois primeiros, depois ao resultado com o terceiro, e assim por diante" },
            { "id": "b", "text": "Aplica a função a todos os itens ao mesmo tempo" },
            { "id": "c", "text": "Aplica a função só ao primeiro item" },
            { "id": "d", "text": "Ignora os itens do meio" }
          ],
          "answer": "a",
          "explanation": "reduce processa a sequência de forma acumulativa, item por item."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "O que reduce faz que é equivalente a um padrão já visto antes no curso?",
          "choices": [
            { "id": "a", "text": "O mesmo que um laço com uma variável acumuladora" },
            { "id": "b", "text": "O mesmo que uma decisão SE-ENTÃO" },
            { "id": "c", "text": "O mesmo que uma busca binária" },
            { "id": "d", "text": "Não tem equivalente nenhum" }
          ],
          "answer": "a",
          "explanation": "reduce automatiza o mesmo padrão de um laço com acumulador."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "reduce é uma função embutida (como map e filter) ou precisa de import?",
          "choices": [
            { "id": "a", "text": "Precisa de import, vem do módulo functools" },
            { "id": "b", "text": "É embutida, como map e filter" },
            { "id": "c", "text": "Só funciona dentro de uma classe" },
            { "id": "d", "text": "Só existe em versões antigas do Python" }
          ],
          "answer": "a",
          "explanation": "Diferente de map/filter, reduce precisa ser importada do módulo functools."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o módulo de onde vem a função reduce:",
          "code": "from ___ import reduce",
          "accept": ["functools"],
          "explanation": "functools é o módulo da biblioteca padrão que contém reduce."
        }
      ]
    },
    {
      "id": "int-10-testes",
      "title": "Testes básicos com assert",
      "goal": "Usar assert para verificar se o código se comporta como esperado.",
      "xp": 30,
      "intro": {
        "slides": [
          {
            "title": "Por que testar o código?",
            "body": "Testar significa verificar se uma função se comporta como esperado, ANTES de descobrir um erro em produção. Um teste simples compara o resultado obtido com o resultado esperado."
          },
          {
            "title": "O comando assert",
            "body": "assert condicao verifica se a condição é True; se for False, ele gera um erro (AssertionError), avisando que algo deu errado.",
            "code": "def soma(a, b):\n    return a + b\n\nassert soma(2, 3) == 5"
          },
          {
            "title": "Assert com mensagem personalizada",
            "body": "Podemos adicionar uma mensagem para explicar o que deu errado, exibida junto com o erro.",
            "code": "assert soma(2, 3) == 5, \"soma(2, 3) deveria ser 5\""
          },
          {
            "title": "Escrevendo uma função de teste",
            "body": "É comum agrupar vários asserts numa função de teste, com um nome que comece com \"test_\", para testar vários casos de uma vez.",
            "code": "def test_soma():\n    assert soma(2, 3) == 5\n    assert soma(-1, 1) == 0\n    assert soma(0, 0) == 0"
          },
          {
            "title": "Testes automatizados dão confiança para mudar o código",
            "body": "Com testes escritos, é possível alterar uma função e rodar os testes de novo para confirmar que nada quebrou — sem precisar testar manualmente tudo de novo."
          }
        ]
      },
      "questions": [
        {
          "id": "q1", "kind": "mcq",
          "prompt": "O que o comando assert faz?",
          "choices": [
            { "id": "a", "text": "Verifica se uma condição é True; se for False, gera um erro (AssertionError)" },
            { "id": "b", "text": "Sempre imprime uma mensagem na tela" },
            { "id": "c", "text": "Corrige o código automaticamente" },
            { "id": "d", "text": "Repete o teste várias vezes" }
          ],
          "answer": "a",
          "explanation": "assert é uma verificação: só gera erro se a condição for falsa."
        },
        {
          "id": "q2", "kind": "mcq",
          "prompt": "O que acontece quando assert soma(2, 3) == 5 é executado, se soma(2,3) devolver 5?",
          "choices": [
            { "id": "a", "text": "Nada acontece — a condição é True e o programa segue normalmente" },
            { "id": "b", "text": "Um erro é sempre gerado" },
            { "id": "c", "text": "O valor 5 é impresso na tela" },
            { "id": "d", "text": "A função soma é redefinida" }
          ],
          "answer": "a",
          "explanation": "Quando a condição do assert é verdadeira, o programa simplesmente continua."
        },
        {
          "id": "q3", "kind": "mcq",
          "prompt": "Para que serve a mensagem opcional num assert?",
          "choices": [
            { "id": "a", "text": "Explicar o que deu errado, exibida junto com o erro caso a condição seja falsa" },
            { "id": "b", "text": "Substituir a condição testada" },
            { "id": "c", "text": "Tornar o assert mais lento" },
            { "id": "d", "text": "É obrigatória em todo assert" }
          ],
          "answer": "a",
          "explanation": "A mensagem é opcional e ajuda a entender a falha quando o assert dispara."
        },
        {
          "id": "q4", "kind": "fill",
          "prompt": "Complete o comando que verifica se uma condição é verdadeira, gerando erro se não for:",
          "code": "___ soma(2, 3) == 5",
          "accept": ["assert"],
          "explanation": "assert é o comando de verificação usado em testes simples."
        },
        {
          "id": "q5", "kind": "mcq",
          "prompt": "Por que é comum agrupar vários asserts numa função de teste?",
          "choices": [
            { "id": "a", "text": "Para testar vários casos de uma vez, com um nome organizado (como test_soma)" },
            { "id": "b", "text": "Porque um assert sozinho nunca funciona" },
            { "id": "c", "text": "É obrigatório por sintaxe do Python" },
            { "id": "d", "text": "Não existe motivo, é só estilo aleatório" }
          ],
          "answer": "a",
          "explanation": "Agrupar asserts numa função organiza e nomeia o que está sendo testado."
        },
        {
          "id": "q6", "kind": "mcq",
          "prompt": "Qual a vantagem de ter testes automatizados ao alterar uma função?",
          "choices": [
            { "id": "a", "text": "Dá confiança de que a mudança não quebrou nada, sem precisar testar tudo manualmente" },
            { "id": "b", "text": "Torna o código mais lento sempre" },
            { "id": "c", "text": "Impede qualquer alteração futura" },
            { "id": "d", "text": "Não há vantagem nenhuma" }
          ],
          "answer": "a",
          "explanation": "Testes automatizados detectam rapidamente se uma mudança quebrou algo existente."
        },
        {
          "id": "q7", "kind": "mcq",
          "prompt": "O que acontece se assert 1 == 2 for executado?",
          "choices": [
            { "id": "a", "text": "Gera um AssertionError, porque a condição é False" },
            { "id": "b", "text": "Nada acontece" },
            { "id": "c", "text": "Devolve True" },
            { "id": "d", "text": "Corrige automaticamente para 1 == 1" }
          ],
          "answer": "a",
          "explanation": "1 == 2 é False, então o assert dispara um AssertionError."
        },
        {
          "id": "q8", "kind": "fill",
          "prompt": "Complete o prefixo comum usado para nomear uma função de teste:",
          "code": "def ___soma():\n    assert soma(2, 3) == 5",
          "accept": ["test_"],
          "explanation": "test_ é a convenção usada para nomear funções de teste."
        }
      ]
    }
  ]
};
