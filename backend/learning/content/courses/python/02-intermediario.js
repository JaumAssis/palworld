// Módulo "Intermediário" — amostra da v1 (2 lições). Mais lições entram aqui depois, sem mudar
// lógica nenhuma. Ver ./index.js para o formato e a validação de boot.
module.exports = {
  "id": "intermediario",
  "levelKey": "intermediate",
  "order": 2,
  "title": "Intermediário",
  "subtitle": "Compreensões, classes e objetos",
  "accent": "#38bdf8",
  "lessons": [
    {
      "id": "int-01-compreensoes",
      "title": "Compreensões de lista",
      "goal": "Criar listas de forma concisa a partir de outra sequência.",
      "xp": 25,
      "intro": {
        "body": "Uma list comprehension cria uma lista nova numa linha só: [expressão for item in sequência if condição]. A parte \"if\" é opcional e filtra quais itens entram no resultado.",
        "code": "quadrados = [x**2 for x in range(5)]\n# [0, 1, 4, 9, 16]"
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
      "id": "int-02-classes-objetos",
      "title": "Classes e objetos",
      "goal": "Definir classes, criar objetos e entender self e __init__.",
      "xp": 25,
      "intro": {
        "body": "Uma classe é um molde para criar objetos. __init__ é chamado automaticamente ao criar um objeto novo, e self, o primeiro parâmetro de todo método, representa o próprio objeto.",
        "code": "class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n\np = Pessoa(\"Ana\")\nprint(p.nome)  # Ana"
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
    }
  ]
};
