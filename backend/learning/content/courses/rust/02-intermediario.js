// Módulo "Intermediário" — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes
// por lição). Ver ../index.js para o formato e a validação de boot. Sintaxe Rust real nos exemplos
// de código, mesmo padrão de ./01-fundamentos.js.
// Ids não são numericamente sequenciais na ordem pedagógica: rsi-11/rsi-12/rsi-13 foram inseridas
// depois, entre lições já numeradas (mesma convenção dos outros cursos) — Rc/RefCell logo após Box
// (completa o trio clássico de smart pointers), Concorrência logo depois (Arc é o "Rc seguro para
// threads", Mutex ecoa RefCell), Trait objects por último desse bloco (Box<dyn Trait> só faz
// sentido depois de Box e de já ter visto Rc/dyn no contexto de ponteiros) — todos antes de
// Lifetimes.
module.exports = {
  id: 'intermediario-rust',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Traits, generics, closures, iterators, HashMap, módulos, Box, lifetimes, erros e testes',
  accent: '#38bdf8',
  lessons: [
    {
      id: 'rsi-01-traits',
      title: 'Traits: comportamento compartilhado',
      goal: 'Definir um comportamento comum que diferentes tipos podem implementar.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: comportamento comum entre tipos diferentes',
            body: 'Imagine várias structs diferentes (Circulo, Retangulo) que precisam, cada uma, calcular sua própria área — como garantir que todas tenham esse comportamento, de forma organizada?'
          },
          {
            title: 'O que é um trait',
            body: 'Um trait declara um conjunto de métodos que um tipo PRECISA implementar para "ter" aquele comportamento — parecido com uma interface em outras linguagens.',
            code: 'trait Forma {\n    fn area(&self) -> f64;\n}'
          },
          {
            title: 'Implementando um trait para um tipo',
            body: 'Usamos impl Trait for Tipo para fornecer a implementação concreta dos métodos exigidos pelo trait, naquele tipo específico.',
            code: 'struct Circulo {\n    raio: f64,\n}\n\nimpl Forma for Circulo {\n    fn area(&self) -> f64 {\n        3.14159 * self.raio * self.raio\n    }\n}'
          },
          {
            title: 'Trait bounds: exigindo um trait como parâmetro',
            body: 'Uma função pode aceitar qualquer tipo que implemente um trait específico, usando a sintaxe impl Trait — permitindo escrever código que funciona com QUALQUER Forma, sem saber de antemão qual struct exata será usada.',
            code: 'fn imprimir_area(forma: &impl Forma) {\n    println!("Área: {}", forma.area());\n}'
          },
          {
            title: 'derive: traits comuns já prontos',
            body: 'Vimos #[derive(Debug)] no nível iniciante — derive é exatamente uma forma de implementar automaticamente traits comuns (Debug, Clone, PartialEq...) sem escrever o código manualmente.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um trait declara?',
          choices: [
            { id: 'a', text: 'Um conjunto de métodos que um tipo precisa implementar para "ter" aquele comportamento' },
            { id: 'b', text: 'Uma variável global' },
            { id: 'c', text: 'Um valor constante' },
            { id: 'd', text: 'Um módulo de código' }
          ],
          answer: 'a',
          explanation: 'Traits definem comportamento comum que tipos podem implementar.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como implementamos um trait para uma struct específica?',
          choices: [
            { id: 'a', text: 'Usando impl Trait for Tipo' },
            { id: 'b', text: 'Usando struct Trait { }' },
            { id: 'c', text: 'Usando fn Trait(Tipo)' },
            { id: 'd', text: 'Traits não podem ser implementados para structs' }
          ],
          answer: 'a',
          explanation: 'impl Trait for Tipo fornece a implementação concreta dos métodos do trait.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que uma trait bound permite que uma função aceite?',
          choices: [
            { id: 'a', text: 'Qualquer tipo que implemente um trait específico, sem saber de antemão qual tipo exato será usado' },
            { id: 'b', text: 'Apenas um único tipo fixo, definido em tempo de compilação' },
            { id: 'c', text: 'Somente tipos numéricos' },
            { id: 'd', text: 'Nenhum tipo, trait bounds impedem chamadas de função' }
          ],
          answer: 'a',
          explanation: 'Trait bounds permitem que uma função aceite qualquer tipo que implemente o trait exigido.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para declarar um trait:',
          code: '___ Forma {\n    fn area(&self) -> f64;\n}',
          accept: ['trait'],
          explanation: 'trait é a palavra-chave que declara um novo conjunto de comportamento.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que #[derive(...)] faz, num contexto mais amplo do que só Debug?',
          choices: [
            { id: 'a', text: 'Implementa automaticamente traits comuns (Debug, Clone, PartialEq...) sem escrever o código manualmente' },
            { id: 'b', text: 'Cria uma nova struct do zero' },
            { id: 'c', text: 'Remove todos os métodos de um tipo' },
            { id: 'd', text: 'Converte a struct num enum' }
          ],
          answer: 'a',
          explanation: 'derive gera automaticamente implementações de traits padrão da biblioteca.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a vantagem de escrever uma função que aceita &impl Forma, em vez de um tipo concreto como &Circulo?',
          choices: [
            { id: 'a', text: 'A função passa a funcionar com qualquer tipo que implemente Forma, não só um específico' },
            { id: 'b', text: 'A função fica restrita apenas a Circulo' },
            { id: 'c', text: 'Não há nenhuma vantagem real' },
            { id: 'd', text: 'A função deixa de poder ser chamada' }
          ],
          answer: 'a',
          explanation: 'Aceitar qualquer implementação do trait torna a função reutilizável para vários tipos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que impl Forma for Circulo faz?',
          choices: [
            { id: 'a', text: 'Fornece a implementação concreta dos métodos do trait Forma para o tipo Circulo' },
            { id: 'b', text: 'Cria um novo trait chamado Circulo' },
            { id: 'c', text: 'Declara uma nova struct chamada Forma' },
            { id: 'd', text: 'Remove o trait Forma do programa' }
          ],
          answer: 'a',
          explanation: 'impl Trait for Tipo conecta a implementação concreta ao trait declarado.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para aceitar qualquer tipo que implemente um trait, como parâmetro:',
          code: 'fn imprimir_area(forma: &___ Forma) {\n    println!("Área: {}", forma.area());\n}',
          accept: ['impl'],
          explanation: '&impl Trait aceita qualquer tipo que implemente aquele trait.'
        }
      ]
    },
    {
      id: 'rsi-02-generics',
      title: 'Generics: código genérico sobre tipos',
      goal: 'Escrever funções e structs que funcionam com múltiplos tipos, sem duplicar código.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: código duplicado para tipos diferentes',
            body: 'Imagine escrever uma função "maior" para i32, depois outra idêntica para f64 — o código se repete, mudando só o tipo.'
          },
          {
            title: 'Generics: um parâmetro de tipo',
            body: 'Usando <T> na assinatura, uma função pode aceitar qualquer tipo T, escrevendo a lógica uma única vez.',
            code: 'fn maior<T: PartialOrd>(lista: &[T]) -> &T {\n    let mut m = &lista[0];\n    for item in lista {\n        if item > m {\n            m = item;\n        }\n    }\n    m\n}'
          },
          {
            title: 'Trait bounds em generics',
            body: 'T: PartialOrd, no exemplo acima, é uma trait bound: diz que T precisa implementar PartialOrd (comparação com >) para a função poder compilar — sem isso, o compilador não saberia como comparar dois valores de tipo T.'
          },
          {
            title: 'Structs genéricas',
            body: 'Structs também podem ser genéricas sobre um tipo, guardando qualquer T dentro de si.',
            code: 'struct Ponto<T> {\n    x: T,\n    y: T,\n}\n\nlet inteiro = Ponto { x: 5, y: 10 };\nlet flutuante = Ponto { x: 1.5, y: 2.5 };'
          },
          {
            title: 'Sem custo em tempo de execução',
            body: 'O compilador gera, por baixo dos panos, uma versão especializada da função/struct para cada tipo concreto usado (chamado de "monomorphization") — por isso generics não deixam o programa mais lento em tempo de execução.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual problema generics resolvem?',
          choices: [
            { id: 'a', text: 'Evitar duplicar a mesma lógica para tipos diferentes' },
            { id: 'b', text: 'Tornar o código mais lento em tempo de execução' },
            { id: 'c', text: 'Eliminar a necessidade de structs' },
            { id: 'd', text: 'Substituir completamente os traits' }
          ],
          answer: 'a',
          explanation: 'Generics evitam duplicação de código para tipos diferentes.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que <T> na assinatura de uma função representa?',
          choices: [
            { id: 'a', text: 'Um parâmetro de tipo, permitindo que a função aceite qualquer tipo T' },
            { id: 'b', text: 'Um valor de retorno obrigatório' },
            { id: 'c', text: 'Uma anotação de lifetime' },
            { id: 'd', text: 'Um erro de sintaxe' }
          ],
          answer: 'a',
          explanation: '<T> declara um parâmetro de tipo genérico para a função.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que uma trait bound como T: PartialOrd exige?',
          choices: [
            { id: 'a', text: 'Que o tipo T implemente PartialOrd, para poder ser comparado' },
            { id: 'b', text: 'Que T seja sempre um número inteiro' },
            { id: 'c', text: 'Que T nunca possa ser copiado' },
            { id: 'd', text: 'Que a função não tenha nenhum parâmetro' }
          ],
          answer: 'a',
          explanation: 'A trait bound PartialOrd garante que valores de T possam ser comparados com >.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a trait bound que permite comparar valores de tipo T:',
          code: 'fn maior<T: ___>(lista: &[T]) -> &T {\n    // ...\n}',
          accept: ['PartialOrd'],
          explanation: 'PartialOrd é a trait bound que exige que T possa ser comparado com >.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Structs podem ser genéricas sobre um tipo?',
          choices: [
            { id: 'a', text: 'Sim, como struct Ponto<T> { x: T, y: T }' },
            { id: 'b', text: 'Não, apenas funções podem ser genéricas' },
            { id: 'c', text: 'Só se a struct tiver um único campo' },
            { id: 'd', text: 'Não, generics não existem para structs em Rust' }
          ],
          answer: 'a',
          explanation: 'Structs também podem receber um parâmetro de tipo genérico.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece em tempo de execução com generics, graças à "monomorphization"?',
          choices: [
            { id: 'a', text: 'O compilador gera uma versão especializada para cada tipo concreto usado, sem custo extra em tempo de execução' },
            { id: 'b', text: 'O programa fica mais lento a cada tipo diferente usado' },
            { id: 'c', text: 'O tipo T é decidido apenas em tempo de execução' },
            { id: 'd', text: 'Generics são convertidos em texto dinamicamente' }
          ],
          answer: 'a',
          explanation: 'Monomorphization gera código especializado em tempo de compilação, sem custo em runtime.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que generics não deixam o programa mais lento?',
          choices: [
            { id: 'a', text: 'Porque o compilador gera código especializado para cada tipo usado, em tempo de compilação' },
            { id: 'b', text: 'Porque generics nunca são realmente usados em tempo de execução' },
            { id: 'c', text: 'Porque o Rust ignora os tipos genéricos' },
            { id: 'd', text: 'Eles de fato deixam o programa mais lento' }
          ],
          answer: 'a',
          explanation: 'A especialização acontece em tempo de compilação, sem overhead em tempo de execução.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o parâmetro de tipo genérico usado nos campos de uma struct:',
          code: 'struct Ponto<___> {\n    x: T,\n    y: T,\n}',
          accept: ['T'],
          explanation: 'T é o parâmetro de tipo declarado entre os sinais de menor/maior.'
        }
      ]
    },
    {
      id: 'rsi-03-closures',
      title: 'Closures: funções anônimas',
      goal: 'Criar funções anônimas que capturam variáveis do ambiente ao redor.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é uma closure',
            body: 'Uma closure é uma função anônima que pode ser guardada numa variável ou passada como argumento, e que pode CAPTURAR variáveis do escopo onde foi criada.',
            code: 'let somar_um = |x| x + 1;\nlet resultado = somar_um(5); // 6'
          },
          {
            title: 'Sintaxe: parâmetros entre pipes',
            body: 'Os parâmetros de uma closure ficam entre || (pipes), sem precisar de parênteses; o tipo geralmente é inferido pelo compilador.'
          },
          {
            title: 'Capturando variáveis do ambiente',
            body: 'Diferente de uma função comum, uma closure pode usar diretamente uma variável definida FORA dela, sem receber como parâmetro.',
            code: 'let fator = 3;\nlet multiplicar = |x| x * fator;\nlet resultado = multiplicar(5); // 15'
          },
          {
            title: 'move: capturando por posse',
            body: 'Por padrão, closures capturam por referência; a palavra move força a closure a tomar posse das variáveis capturadas, útil quando a closure precisa sobreviver além do escopo original (por exemplo, ao passar para uma nova thread).',
            code: 'let texto = String::from("olá");\nlet imprimir = move || println!("{}", texto);'
          },
          {
            title: 'Onde closures são muito usadas',
            body: 'Funções de iterators como map e filter (próxima lição) recebem closures como argumento, sendo um dos usos mais comuns do dia a dia.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma closure?',
          choices: [
            { id: 'a', text: 'Uma função anônima que pode ser guardada numa variável ou passada como argumento, capturando variáveis do escopo onde foi criada' },
            { id: 'b', text: 'Um tipo de struct especial' },
            { id: 'c', text: 'Uma variável constante' },
            { id: 'd', text: 'Um módulo de código' }
          ],
          answer: 'a',
          explanation: 'Closures são funções anônimas que capturam o ambiente ao redor.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como os parâmetros de uma closure são delimitados?',
          choices: [
            { id: 'a', text: 'Entre pipes ||' },
            { id: 'b', text: 'Entre parênteses ()' },
            { id: 'c', text: 'Entre colchetes []' },
            { id: 'd', text: 'Entre chaves {}' }
          ],
          answer: 'a',
          explanation: 'Os parâmetros de uma closure ficam entre pipes, como |x|.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Uma closure pode usar uma variável definida fora dela, sem recebê-la como parâmetro?',
          choices: [
            { id: 'a', text: 'Sim, isso é justamente capturar o ambiente' },
            { id: 'b', text: 'Não, closures nunca acessam variáveis externas' },
            { id: 'c', text: 'Só se a variável for global' },
            { id: 'd', text: 'Só dentro de structs' }
          ],
          answer: 'a',
          explanation: 'Capturar o ambiente é a característica central de uma closure.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o valor somado dentro da closure, para que somar_um(5) resulte em 6:',
          code: 'let somar_um = |x| x + ___;\nlet resultado = somar_um(5); // 6',
          accept: ['1'],
          explanation: 'A closure soma 1 ao parâmetro recebido.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que closures conseguem usar variáveis do escopo externo diretamente?',
          choices: [
            { id: 'a', text: 'Porque capturam automaticamente o ambiente ao seu redor, diferente de uma função comum' },
            { id: 'b', text: 'Porque toda closure é automaticamente global' },
            { id: 'c', text: 'Porque closures não têm escopo próprio' },
            { id: 'd', text: 'Não conseguem, precisam sempre de parâmetros explícitos' }
          ],
          answer: 'a',
          explanation: 'A captura do ambiente é o que diferencia closures de funções comuns.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que a palavra move faz numa closure?',
          choices: [
            { id: 'a', text: 'Força a closure a tomar posse das variáveis capturadas, em vez de apenas referenciá-las' },
            { id: 'b', text: 'Remove a closure da memória imediatamente' },
            { id: 'c', text: 'Impede que a closure capture qualquer variável' },
            { id: 'd', text: 'Transforma a closure numa função comum' }
          ],
          answer: 'a',
          explanation: 'move faz a closure tomar posse, em vez de apenas emprestar as variáveis capturadas.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando move costuma ser necessário?',
          choices: [
            { id: 'a', text: 'Quando a closure precisa sobreviver além do escopo original, como ao ser passada para uma nova thread' },
            { id: 'b', text: 'Sempre, toda closure precisa de move' },
            { id: 'c', text: 'Nunca, move não existe em Rust' },
            { id: 'd', text: 'Só quando a closure não captura nenhuma variável' }
          ],
          answer: 'a',
          explanation: 'move é necessário quando a closure precisa ser dona dos dados capturados por mais tempo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que faz a closure tomar posse das variáveis capturadas:',
          code: 'let texto = String::from("olá");\nlet imprimir = ___ || println!("{}", texto);',
          accept: ['move'],
          explanation: 'move transfere a posse das variáveis capturadas para a closure.'
        }
      ]
    },
    {
      id: 'rsi-04-iterators',
      title: 'Iterators: map, filter e collect',
      goal: 'Processar coleções de forma declarativa, encadeando operações como map e filter.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O padrão: transformar uma coleção em outra',
            body: 'É muito comum precisar transformar cada item de um Vec, ou filtrar só alguns itens — iterators oferecem uma forma declarativa de fazer isso, em vez de escrever um for manual com um Vec auxiliar.'
          },
          {
            title: '.iter() e map',
            body: '.iter() cria um iterador sobre uma coleção; map aplica uma closure a cada item, produzindo um NOVO iterador com os resultados transformados.',
            code: 'let numeros = vec![1, 2, 3];\nlet dobrados: Vec<i32> = numeros.iter().map(|n| n * 2).collect();\n// dobrados: [2, 4, 6]'
          },
          {
            title: 'filter',
            body: 'filter mantém só os itens para os quais a closure devolve true, descartando o resto.',
            code: 'let pares: Vec<&i32> = numeros.iter().filter(|n| *n % 2 == 0).collect();'
          },
          {
            title: 'Lazy: iterators só rodam quando consumidos',
            body: 'map e filter, sozinhos, não fazem nada de imediato — eles só são de fato executados quando algo "consome" o iterador, como collect (que junta tudo numa coleção) ou um for.'
          },
          {
            title: 'collect: reunindo o resultado',
            body: 'collect() transforma o iterador de volta numa coleção concreta, como Vec — geralmente precisa de uma anotação de tipo (como Vec<i32>) para o compilador saber que tipo de coleção montar.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que .iter() cria a partir de uma coleção?',
          choices: [
            { id: 'a', text: 'Um iterador sobre os itens da coleção' },
            { id: 'b', text: 'Uma cópia completa da coleção' },
            { id: 'c', text: 'Um novo Vec vazio' },
            { id: 'd', text: 'Uma struct genérica' }
          ],
          answer: 'a',
          explanation: '.iter() gera um iterador que percorre os itens da coleção.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que map faz com um iterador?',
          choices: [
            { id: 'a', text: 'Aplica uma closure a cada item, produzindo um novo iterador com os resultados transformados' },
            { id: 'b', text: 'Remove itens do iterador' },
            { id: 'c', text: 'Ordena os itens do iterador' },
            { id: 'd', text: 'Conta quantos itens existem' }
          ],
          answer: 'a',
          explanation: 'map transforma cada item usando a closure fornecida.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que filter faz?',
          choices: [
            { id: 'a', text: 'Mantém só os itens para os quais a closure devolve true, descartando o resto' },
            { id: 'b', text: 'Transforma cada item, sem remover nenhum' },
            { id: 'c', text: 'Ordena os itens em ordem crescente' },
            { id: 'd', text: 'Duplica cada item da coleção' }
          ],
          answer: 'a',
          explanation: 'filter seleciona apenas os itens que satisfazem a condição da closure.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o método que aplica uma closure a cada item de um iterador:',
          code: 'let dobrados: Vec<i32> = numeros.iter().___(|n| n * 2).collect();',
          accept: ['map'],
          explanation: 'map transforma cada item do iterador com a closure fornecida.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'map e filter executam a transformação imediatamente, assim que chamados?',
          choices: [
            { id: 'a', text: 'Não, eles são "lazy" e só executam quando o iterador é consumido, como por collect ou um for' },
            { id: 'b', text: 'Sim, executam imediatamente e retornam um Vec pronto' },
            { id: 'c', text: 'Sim, mas só se o programa estiver em modo release' },
            { id: 'd', text: 'Não, eles nunca são executados' }
          ],
          answer: 'a',
          explanation: 'Iterators são lazy — só executam quando consumidos por algo como collect ou for.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que collect() faz?',
          choices: [
            { id: 'a', text: 'Transforma o iterador de volta numa coleção concreta, como Vec' },
            { id: 'b', text: 'Cria um novo iterador vazio' },
            { id: 'c', text: 'Remove todos os itens do iterador' },
            { id: 'd', text: 'Aplica uma closure a cada item' }
          ],
          answer: 'a',
          explanation: 'collect materializa o resultado do iterador numa coleção concreta.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que collect() geralmente precisa de uma anotação de tipo, como Vec<i32>?',
          choices: [
            { id: 'a', text: 'Para o compilador saber que tipo de coleção deve ser montada a partir do iterador' },
            { id: 'b', text: 'Porque collect() nunca funciona sem anotação' },
            { id: 'c', text: 'Porque Vec<i32> é o único tipo aceito por collect()' },
            { id: 'd', text: 'Não há motivo real, é só uma formalidade' }
          ],
          answer: 'a',
          explanation: 'collect() pode gerar vários tipos de coleção, por isso o tipo precisa ser indicado.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o método que mantém apenas os itens que satisfazem a condição da closure:',
          code: 'let pares: Vec<&i32> = numeros.iter().___(|n| *n % 2 == 0).collect();',
          accept: ['filter'],
          explanation: 'filter seleciona apenas os itens que atendem à condição.'
        }
      ]
    },
    {
      id: 'rsi-05-hashmap',
      title: 'HashMap<K, V>',
      goal: 'Guardar pares chave-valor, buscando um valor rapidamente a partir de sua chave.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema: buscar por chave, não por posição',
            body: 'Um Vec é ótimo quando a ordem importa e buscamos por posição; mas às vezes queremos buscar um valor por um NOME (chave), não por índice numérico.'
          },
          {
            title: 'HashMap::new() e insert',
            body: 'HashMap<K, V> guarda pares chave-valor; insert adiciona ou atualiza um par.',
            code: 'use std::collections::HashMap;\n\nlet mut idades: HashMap<String, u32> = HashMap::new();\nidades.insert(String::from("Ana"), 30);'
          },
          {
            title: 'get: buscando um valor',
            body: 'get busca o valor associado a uma chave, devolvendo um Option<&V> (Some se a chave existir, None se não existir) — reforçando o uso de Option visto no nível iniciante.',
            code: 'let idade = idades.get("Ana"); // Some(&30)'
          },
          {
            title: 'entry: atualizando com segurança',
            body: 'entry permite verificar se uma chave já existe e, se não existir, inserir um valor padrão — tudo numa única operação, evitando checar manualmente com if antes.',
            code: 'idades.entry(String::from("Ana")).or_insert(0);'
          },
          {
            title: 'Por que "use std::collections::HashMap"',
            body: 'Diferente de Vec e String, que já vêm disponíveis automaticamente, HashMap precisa ser importado explicitamente da biblioteca padrão antes de ser usado.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quando um HashMap<K, V> costuma ser mais útil que um Vec?',
          choices: [
            { id: 'a', text: 'Quando queremos buscar um valor por uma chave (nome), não por posição numérica' },
            { id: 'b', text: 'Quando a ordem dos itens é a informação mais importante' },
            { id: 'c', text: 'Quando só precisamos guardar números' },
            { id: 'd', text: 'HashMap e Vec são sempre intercambiáveis, sem diferença' }
          ],
          answer: 'a',
          explanation: 'HashMap é ideal para buscas por chave, diferente da busca por posição do Vec.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que insert faz num HashMap?',
          choices: [
            { id: 'a', text: 'Adiciona ou atualiza um par chave-valor' },
            { id: 'b', text: 'Remove todos os pares do HashMap' },
            { id: 'c', text: 'Cria um novo HashMap vazio' },
            { id: 'd', text: 'Converte o HashMap num Vec' }
          ],
          answer: 'a',
          explanation: 'insert adiciona um novo par ou atualiza o valor de uma chave existente.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que get devolve ao buscar uma chave num HashMap?',
          choices: [
            { id: 'a', text: 'Um Option<&V>: Some se a chave existir, None se não existir' },
            { id: 'b', text: 'Sempre o valor diretamente, sem nenhum wrapper' },
            { id: 'c', text: 'Um erro de compilação se a chave não existir' },
            { id: 'd', text: 'Um Result<V, String>' }
          ],
          answer: 'a',
          explanation: 'get devolve um Option, refletindo que a chave pode ou não existir.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo importado do módulo std::collections, usado para guardar pares chave-valor:',
          code: 'use std::collections::___;\n\nlet mut idades: HashMap<String, u32> = HashMap::new();',
          accept: ['HashMap'],
          explanation: 'HashMap precisa ser importado de std::collections antes de ser usado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que entry, combinado com or_insert, permite fazer?',
          choices: [
            { id: 'a', text: 'Verificar se uma chave já existe e, se não existir, inserir um valor padrão, numa única operação' },
            { id: 'b', text: 'Remover uma chave do HashMap' },
            { id: 'c', text: 'Converter o HashMap num Vec' },
            { id: 'd', text: 'Ordenar as chaves do HashMap' }
          ],
          answer: 'a',
          explanation: 'entry/or_insert combina checagem e inserção de forma segura e concisa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que é preciso escrever "use std::collections::HashMap" antes de usá-lo?',
          choices: [
            { id: 'a', text: 'Porque, diferente de Vec e String, HashMap precisa ser importado explicitamente da biblioteca padrão' },
            { id: 'b', text: 'Porque HashMap não existe na biblioteca padrão' },
            { id: 'c', text: 'Porque é só um costume, sem efeito real' },
            { id: 'd', text: 'Porque HashMap é definido pelo próprio programador sempre' }
          ],
          answer: 'a',
          explanation: 'HashMap precisa ser trazido ao escopo, diferente de tipos usados o tempo todo como Vec.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que get devolve um Option, em vez do valor direto?',
          choices: [
            { id: 'a', text: 'Porque a chave buscada pode não existir no HashMap, e Option representa essa possível ausência' },
            { id: 'b', text: 'Porque HashMap nunca tem valores válidos' },
            { id: 'c', text: 'Porque get sempre falha em tempo de compilação' },
            { id: 'd', text: 'Não há motivo real, poderia devolver o valor direto' }
          ],
          answer: 'a',
          explanation: 'Option modela corretamente a possibilidade de a chave não existir.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o método usado para adicionar ou atualizar um par chave-valor:',
          code: 'idades.___(String::from("Ana"), 30);',
          accept: ['insert'],
          explanation: 'insert adiciona ou atualiza o valor associado a uma chave.'
        }
      ]
    },
    {
      id: 'rsi-06-modulos',
      title: 'Módulos e visibilidade',
      goal: 'Organizar código em módulos e controlar o que é público ou privado.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que organizar código em módulos',
            body: 'Conforme um projeto cresce, colocar tudo num único arquivo vira uma bagunça — mod permite agrupar código relacionado, criando uma organização hierárquica.',
            code: 'mod matematica {\n    fn somar(a: i32, b: i32) -> i32 {\n        a + b\n    }\n}'
          },
          {
            title: 'Privado por padrão',
            body: 'Assim como variáveis são imutáveis por padrão, itens dentro de um módulo são PRIVADOS por padrão — só visíveis dentro do próprio módulo, a menos que marcados como públicos.'
          },
          {
            title: 'pub: tornando algo público',
            body: 'A palavra-chave pub torna uma função, struct ou módulo acessível de fora do módulo onde foi definido.',
            code: 'mod matematica {\n    pub fn somar(a: i32, b: i32) -> i32 {\n        a + b\n    }\n}'
          },
          {
            title: 'Acessando itens de um módulo',
            body: 'Itens públicos de um módulo são acessados com ::, encadeando o caminho até o item.',
            code: 'let resultado = matematica::somar(2, 3);'
          },
          {
            title: 'use: trazendo um item para o escopo atual',
            body: 'use evita escrever o caminho completo toda vez, trazendo um item para o escopo atual com um nome mais curto.',
            code: 'use matematica::somar;\nlet resultado = somar(2, 3);'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve mod em Rust?',
          choices: [
            { id: 'a', text: 'Agrupar código relacionado, criando uma organização hierárquica' },
            { id: 'b', text: 'Declarar uma variável mutável' },
            { id: 'c', text: 'Criar um novo trait' },
            { id: 'd', text: 'Definir um tipo genérico' }
          ],
          answer: 'a',
          explanation: 'mod organiza código relacionado dentro de um namespace próprio.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Itens dentro de um módulo são públicos por padrão?',
          choices: [
            { id: 'a', text: 'Não, são privados por padrão' },
            { id: 'b', text: 'Sim, todo item já nasce público' },
            { id: 'c', text: 'Depende do tipo do item' },
            { id: 'd', text: 'Só funções são privadas; structs são sempre públicas' }
          ],
          answer: 'a',
          explanation: 'Itens de módulo são privados por padrão, exigindo pub para serem expostos.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que pub faz, aplicado a uma função dentro de um módulo?',
          choices: [
            { id: 'a', text: 'Torna a função acessível de fora do módulo' },
            { id: 'b', text: 'Torna a função privada' },
            { id: 'c', text: 'Remove a função do programa' },
            { id: 'd', text: 'Converte a função num trait' }
          ],
          answer: 'a',
          explanation: 'pub expõe o item para uso fora do módulo onde foi declarado.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que torna uma função acessível de fora do módulo:',
          code: 'mod matematica {\n    ___ fn somar(a: i32, b: i32) -> i32 {\n        a + b\n    }\n}',
          accept: ['pub'],
          explanation: 'pub torna o item público, acessível de fora do módulo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Como acessamos um item público de um módulo chamado matematica?',
          choices: [
            { id: 'a', text: 'Com ::, como matematica::somar(2, 3)' },
            { id: 'b', text: 'Com ponto, como matematica.somar(2, 3)' },
            { id: 'c', text: 'Com colchetes, como matematica[somar]' },
            { id: 'd', text: 'Não é possível acessar itens de outro módulo' }
          ],
          answer: 'a',
          explanation: '::  encadeia o caminho até o item dentro do módulo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que use faz?',
          choices: [
            { id: 'a', text: 'Traz um item para o escopo atual, evitando escrever o caminho completo toda vez' },
            { id: 'b', text: 'Declara um novo módulo' },
            { id: 'c', text: 'Torna um item privado' },
            { id: 'd', text: 'Remove um item do programa' }
          ],
          answer: 'a',
          explanation: 'use encurta as chamadas, trazendo o item para o escopo local.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que a privacidade por padrão em módulos é útil?',
          choices: [
            { id: 'a', text: 'Porque força o programador a decidir explicitamente o que deve ser exposto como parte pública da API' },
            { id: 'b', text: 'Porque impede que qualquer código funcione' },
            { id: 'c', text: 'Porque torna o programa mais lento' },
            { id: 'd', text: 'Não há utilidade real nisso' }
          ],
          answer: 'a',
          explanation: 'A privacidade por padrão ajuda a definir claramente a API pública de um módulo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome trazido para o escopo atual, permitindo chamar somar(2, 3) diretamente:',
          code: 'use matematica::___;\nlet resultado = somar(2, 3);',
          accept: ['somar'],
          explanation: 'use matematica::somar traz a função somar para o escopo atual.'
        }
      ]
    },
    {
      id: 'rsi-07-box',
      title: 'Box<T> e tipos recursivos',
      goal: 'Guardar um valor na heap com Box<T>, e entender por que isso é necessário para tipos recursivos.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Onde os valores vivem',
            body: 'Até agora, a maioria dos valores vistos (i32, structs simples) vive na pilha (stack); Box<T> é a forma mais simples de colocar um valor na HEAP, guardando apenas um ponteiro para ele na stack.'
          },
          {
            title: 'Box::new',
            body: 'Box::new(valor) aloca o valor na heap e devolve um Box apontando para ele; o valor dentro do Box é acessado normalmente, como se não estivesse "encaixotado".',
            code: 'let b = Box::new(5);\nprintln!("{}", *b); // 5'
          },
          {
            title: 'O problema dos tipos recursivos',
            body: 'Um tipo que contém a si mesmo diretamente (como uma lista ligada, onde um nó contém "o próximo nó" do mesmo tipo) não tem um tamanho conhecido em tempo de compilação — o compilador não sabe quanto espaço reservar.'
          },
          {
            title: 'Box resolve isso',
            body: 'Como um Box tem tamanho fixo (é só um ponteiro), colocar o "próximo" dentro de um Box quebra essa recursão infinita de tamanho, permitindo que o compilador saiba exatamente quanto espaço o tipo ocupa.',
            code: 'enum Lista {\n    Cons(i32, Box<Lista>),\n    Fim,\n}'
          },
          {
            title: 'Quando usar Box na prática',
            body: 'Além de tipos recursivos, Box também é usado quando você quer transferir a posse de um valor grande sem copiá-lo inteiro, ou quando precisa de um tipo cujo tamanho exato só é conhecido em tempo de execução.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que Box<T> faz?',
          choices: [
            { id: 'a', text: 'Guarda um valor na heap, mantendo apenas um ponteiro para ele na stack' },
            { id: 'b', text: 'Copia o valor várias vezes na stack' },
            { id: 'c', text: 'Transforma o valor num tipo genérico' },
            { id: 'd', text: 'Remove o valor da memória imediatamente' }
          ],
          answer: 'a',
          explanation: 'Box<T> aloca o valor na heap, com um ponteiro na stack.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que Box::new(5) devolve?',
          choices: [
            { id: 'a', text: 'Um Box apontando para o valor 5, alocado na heap' },
            { id: 'b', text: 'O número 5 diretamente, sem nenhuma alocação' },
            { id: 'c', text: 'Um erro de compilação' },
            { id: 'd', text: 'Um Vec com um único elemento' }
          ],
          answer: 'a',
          explanation: 'Box::new aloca o valor na heap e devolve um Box apontando para ele.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que um tipo recursivo direto (como um nó que contém outro nó do mesmo tipo) não compila sem Box?',
          choices: [
            { id: 'a', text: 'Porque o compilador não consegue determinar um tamanho fixo para esse tipo, já que a recursão seria infinita' },
            { id: 'b', text: 'Porque tipos recursivos são proibidos por lei em Rust' },
            { id: 'c', text: 'Porque enums nunca podem conter outros enums' },
            { id: 'd', text: 'Não há problema real, sempre compila normalmente' }
          ],
          answer: 'a',
          explanation: 'Sem um tamanho fixo (como o de um ponteiro), a recursão de tamanho seria infinita.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo usado para alocar um valor na heap:',
          code: 'let b = ___::new(5);\nprintln!("{}", *b);',
          accept: ['Box'],
          explanation: 'Box é o tipo usado para colocar um valor na heap.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que colocar o "próximo" item dentro de um Box resolve o problema do tipo recursivo?',
          choices: [
            { id: 'a', text: 'Porque um Box tem tamanho fixo (é só um ponteiro), quebrando a recursão infinita de tamanho' },
            { id: 'b', text: 'Porque um Box nunca pode conter outro tipo dentro dele' },
            { id: 'c', text: 'Porque Box elimina completamente a necessidade de recursão' },
            { id: 'd', text: 'Não resolve nada, é só uma boa prática estética' }
          ],
          answer: 'a',
          explanation: 'O tamanho fixo do Box (um ponteiro) permite ao compilador calcular o tamanho do tipo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Além de tipos recursivos, quando mais Box costuma ser usado?',
          choices: [
            { id: 'a', text: 'Quando se quer transferir a posse de um valor grande sem copiá-lo inteiro' },
            { id: 'b', text: 'Somente para números pequenos, como i32' },
            { id: 'c', text: 'Nunca em outra situação além de tipos recursivos' },
            { id: 'd', text: 'Apenas dentro de closures' }
          ],
          answer: 'a',
          explanation: 'Box também é útil para mover valores grandes sem copiá-los por completo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde um Box<T> vive, e onde fica o ponteiro para ele?',
          choices: [
            { id: 'a', text: 'O valor fica na heap; o ponteiro para ele fica na stack' },
            { id: 'b', text: 'O valor e o ponteiro ficam ambos na stack' },
            { id: 'c', text: 'O valor e o ponteiro ficam ambos na heap' },
            { id: 'd', text: 'O valor fica na stack; o ponteiro fica na heap' }
          ],
          answer: 'a',
          explanation: 'O valor alocado por Box fica na heap, com um ponteiro guardado na stack.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo usado para quebrar a recursão infinita de tamanho de um enum:',
          code: 'enum Lista {\n    Cons(i32, ___<Lista>),\n    Fim,\n}',
          accept: ['Box'],
          explanation: 'Box<Lista> dá um tamanho fixo ao campo recursivo do enum.'
        }
      ]
    },
    {
      id: 'rsi-11-rc-refcell',
      title: 'Rc<T> e RefCell<T>: posse compartilhada e mutação interior',
      goal: 'Entender quando um valor precisa de mais de um dono, e como mutar um valor por trás de uma referência imutável, com segurança.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O limite do ownership de um único dono',
            body: 'Vimos que Box<T> tem um único dono; mas às vezes um mesmo valor genuinamente precisa ser "dono" de mais de um lugar ao mesmo tempo (por exemplo, dois nós de um grafo apontando para o mesmo terceiro nó).'
          },
          {
            title: 'Rc<T>: contagem de referências',
            body: 'Rc<T> ("Reference Counted") permite que um valor tenha VÁRIOS donos ao mesmo tempo, contando quantas referências existem; o valor só é liberado quando a última referência desaparece.',
            code: 'use std::rc::Rc;\n\nlet a = Rc::new(5);\nlet b = Rc::clone(&a); // agora há 2 donos\nprintln!("{}", Rc::strong_count(&a)); // 2'
          },
          {
            title: 'Rc::clone não copia o valor',
            body: 'Rc::clone(&a) não duplica o valor 5 em si, só incrementa o contador de referências — é uma operação barata, bem diferente de copiar toda a estrutura de dados.'
          },
          {
            title: 'RefCell<T>: mutação interior',
            body: 'RefCell<T> permite mutar um valor mesmo através de uma referência imutável, movendo a checagem das regras de borrowing (só uma referência mutável por vez) de tempo de COMPILAÇÃO para tempo de EXECUÇÃO.',
            code: 'use std::cell::RefCell;\n\nlet celula = RefCell::new(5);\n*celula.borrow_mut() += 1;'
          },
          {
            title: 'Rc<RefCell<T>>: a combinação clássica',
            body: 'Combinar os dois é muito comum: Rc permite vários donos, e RefCell permite que qualquer um desses donos mute o valor compartilhado — juntos, imitam algo parecido com referências mutáveis compartilhadas de outras linguagens, mas com verificação (em tempo de execução) em vez de simplesmente confiar no programador.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual limite do Box<T> o Rc<T> resolve?',
          choices: [
            { id: 'a', text: 'Permite que um valor tenha vários donos ao mesmo tempo, em vez de um único dono' },
            { id: 'b', text: 'Permite que o valor viva na stack em vez da heap' },
            { id: 'c', text: 'Elimina a necessidade de qualquer ownership' },
            { id: 'd', text: 'Torna o valor imutável para sempre' }
          ],
          answer: 'a',
          explanation: 'Rc<T> permite múltiplos donos, ao contrário de Box<T>, que tem um único dono.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que Rc::strong_count devolve?',
          choices: [
            { id: 'a', text: 'Quantas referências (donos) existem atualmente para aquele valor' },
            { id: 'b', text: 'O valor guardado dentro do Rc' },
            { id: 'c', text: 'O tamanho em bytes do valor' },
            { id: 'd', text: 'Se o valor já foi liberado da memória' }
          ],
          answer: 'a',
          explanation: 'strong_count informa o número atual de referências ao valor.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Rc::clone(&a) duplica o valor original?',
          choices: [
            { id: 'a', text: 'Não, apenas incrementa o contador de referências, sem copiar o valor em si' },
            { id: 'b', text: 'Sim, cria uma cópia completa e independente do valor' },
            { id: 'c', text: 'Sim, mas só para tipos numéricos' },
            { id: 'd', text: 'Não, Rc::clone nunca pode ser chamado mais de uma vez' }
          ],
          answer: 'a',
          explanation: 'Rc::clone é uma operação barata que só incrementa a contagem de referências.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo importado do módulo std::rc, usado para posse compartilhada:',
          code: 'use std::rc::___;\n\nlet a = Rc::new(5);',
          accept: ['Rc'],
          explanation: 'Rc é o tipo de posse compartilhada com contagem de referências.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que RefCell<T> permite?',
          choices: [
            { id: 'a', text: 'Mutar um valor mesmo através de uma referência imutável' },
            { id: 'b', text: 'Ter múltiplos donos ao mesmo tempo, como o Rc' },
            { id: 'c', text: 'Compartilhar o valor entre threads com segurança' },
            { id: 'd', text: 'Eliminar completamente as regras de borrowing' }
          ],
          answer: 'a',
          explanation: 'RefCell permite mutação interior, através de uma referência imutável.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando RefCell verifica a regra de "só uma referência mutável por vez"?',
          choices: [
            { id: 'a', text: 'Em tempo de execução, em vez de em tempo de compilação' },
            { id: 'b', text: 'Nunca, RefCell ignora essa regra por completo' },
            { id: 'c', text: 'Apenas em tempo de compilação, como as referências comuns' },
            { id: 'd', text: 'Só quando o programa é compilado em modo release' }
          ],
          answer: 'a',
          explanation: 'RefCell move a checagem de borrowing para tempo de execução, causando panic! se violada.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que Rc<RefCell<T>> é uma combinação tão comum?',
          choices: [
            { id: 'a', text: 'Porque Rc permite vários donos, e RefCell permite que qualquer um desses donos mute o valor compartilhado' },
            { id: 'b', text: 'Porque os dois tipos fazem exatamente a mesma coisa' },
            { id: 'c', text: 'Porque juntos eliminam a necessidade de ownership' },
            { id: 'd', text: 'Porque é a única forma de criar uma struct em Rust' }
          ],
          answer: 'a',
          explanation: 'A combinação permite posse compartilhada com mutação segura em tempo de execução.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o método usado para obter uma referência mutável de dentro de um RefCell:',
          code: 'let celula = RefCell::new(5);\n*celula.___() += 1;',
          accept: ['borrow_mut'],
          explanation: 'borrow_mut() devolve uma referência mutável ao valor interno, checada em tempo de execução.'
        }
      ]
    },
    {
      id: 'rsi-12-concorrencia',
      title: 'Concorrência: threads, Arc e Mutex',
      goal: 'Rodar código em paralelo com segurança, usando threads, Arc e Mutex.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que Rust é conhecido pela "fearless concurrency"',
            body: 'As mesmas regras de ownership/borrowing que evitam bugs de memória também evitam, em tempo de compilação, boa parte dos bugs clássicos de concorrência (como duas threads acessando o mesmo dado ao mesmo tempo sem controle).'
          },
          {
            title: 'thread::spawn',
            body: 'Cria uma nova thread, rodando uma closure em paralelo ao restante do programa.',
            code: 'use std::thread;\n\nlet handle = thread::spawn(|| {\n    println!("rodando em outra thread");\n});\nhandle.join().unwrap(); // espera a thread terminar'
          },
          {
            title: 'O problema de compartilhar dados entre threads',
            body: 'Rc<T>, visto na lição anterior, NÃO é seguro para compartilhar entre threads (seu contador não é protegido contra acesso simultâneo) — para isso, existe Arc<T>.'
          },
          {
            title: 'Arc<T>: um Rc seguro para threads',
            body: 'Arc ("Atomic Reference Counted") funciona como Rc, mas com um contador de referências seguro para ser acessado por múltiplas threads ao mesmo tempo.',
            code: 'use std::sync::Arc;\n\nlet dado = Arc::new(5);\nlet copia = Arc::clone(&dado);'
          },
          {
            title: 'Mutex<T>: mutação segura entre threads',
            body: 'Mutex ("mutual exclusion") garante que só uma thread por vez possa acessar (e mutar) o valor por dentro dele — combinado com Arc, permite compartilhar e mutar dados com segurança entre threads.',
            code: 'use std::sync::{Arc, Mutex};\n\nlet contador = Arc::new(Mutex::new(0));\n*contador.lock().unwrap() += 1;'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que Rust é conhecido pela "fearless concurrency"?',
          choices: [
            { id: 'a', text: 'Porque as mesmas regras de ownership/borrowing evitam, em tempo de compilação, boa parte dos bugs clássicos de concorrência' },
            { id: 'b', text: 'Porque Rust não permite criar mais de uma thread' },
            { id: 'c', text: 'Porque threads em Rust nunca compartilham dados' },
            { id: 'd', text: 'Porque Rust não tem nenhum recurso de concorrência' }
          ],
          answer: 'a',
          explanation: 'O sistema de ownership/borrowing previne muitos bugs de concorrência já em compilação.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que thread::spawn faz?',
          choices: [
            { id: 'a', text: 'Cria uma nova thread, rodando uma closure em paralelo ao restante do programa' },
            { id: 'b', text: 'Encerra todas as threads em execução' },
            { id: 'c', text: 'Cria um novo processo do sistema operacional' },
            { id: 'd', text: 'Bloqueia o programa até o usuário interagir' }
          ],
          answer: 'a',
          explanation: 'thread::spawn inicia uma nova thread executando a closure fornecida.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que Rc<T> não é seguro para compartilhar entre threads?',
          choices: [
            { id: 'a', text: 'Porque seu contador de referências não é protegido contra acesso simultâneo por múltiplas threads' },
            { id: 'b', text: 'Porque Rc<T> só funciona com números' },
            { id: 'c', text: 'Porque Rc<T> não pode ser clonado' },
            { id: 'd', text: 'Rc<T> é, na verdade, totalmente seguro para threads' }
          ],
          answer: 'a',
          explanation: 'O contador interno do Rc não é atômico, causando condições de corrida entre threads.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o módulo usado para criar uma nova thread:',
          code: 'use std::thread;\n\nlet handle = ___::spawn(|| {\n    println!("rodando em outra thread");\n});',
          accept: ['thread'],
          explanation: 'thread::spawn cria e inicia uma nova thread.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que Arc<T> oferece, diferente de Rc<T>?',
          choices: [
            { id: 'a', text: 'Um contador de referências seguro para ser acessado por múltiplas threads ao mesmo tempo' },
            { id: 'b', text: 'A capacidade de mutar o valor sem nenhuma restrição' },
            { id: 'c', text: 'Um valor que nunca pode ser compartilhado' },
            { id: 'd', text: 'Nenhuma diferença real, são idênticos' }
          ],
          answer: 'a',
          explanation: 'Arc usa um contador atômico, seguro para uso concorrente entre threads.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que Mutex<T> garante?',
          choices: [
            { id: 'a', text: 'Que só uma thread por vez possa acessar (e mutar) o valor por dentro dele' },
            { id: 'b', text: 'Que o valor nunca possa ser mutado' },
            { id: 'c', text: 'Que várias threads possam mutar o valor ao mesmo tempo, livremente' },
            { id: 'd', text: 'Que o programa nunca use mais de uma thread' }
          ],
          answer: 'a',
          explanation: 'Mutex garante exclusão mútua no acesso ao valor protegido.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que Arc<Mutex<T>> é uma combinação comum em código concorrente?',
          choices: [
            { id: 'a', text: 'Arc permite compartilhar a posse entre threads, e Mutex garante acesso exclusivo e seguro ao valor' },
            { id: 'b', text: 'Porque Arc e Mutex fazem exatamente a mesma coisa' },
            { id: 'c', text: 'Porque juntos eliminam a necessidade de threads' },
            { id: 'd', text: 'Porque é a única forma de criar uma closure' }
          ],
          answer: 'a',
          explanation: 'A combinação permite compartilhar e mutar dados com segurança entre múltiplas threads.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o método usado para obter acesso exclusivo ao valor dentro de um Mutex:',
          code: 'let contador = Arc::new(Mutex::new(0));\n*contador.___().unwrap() += 1;',
          accept: ['lock'],
          explanation: 'lock() bloqueia até obter acesso exclusivo ao valor protegido pelo Mutex.'
        }
      ]
    },
    {
      id: 'rsi-13-trait-objects',
      title: 'Trait objects: polimorfismo em tempo de execução',
      goal: 'Guardar diferentes tipos que implementam o mesmo trait, decidindo em tempo de execução qual implementação chamar.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Generics resolvem em tempo de compilação',
            body: 'Vimos que generics (com trait bounds) geram uma versão especializada do código para cada tipo usado — mas isso exige saber, em tempo de compilação, quais tipos serão usados.'
          },
          {
            title: 'O problema: uma coleção de tipos diferentes',
            body: 'Às vezes você quer guardar, na MESMA coleção, valores de tipos diferentes que implementam um trait em comum (várias Formas diferentes, por exemplo) — generics sozinhos não resolvem isso.',
            code: 'let formas: Vec<Box<dyn Forma>> = vec![\n    Box::new(Circulo { raio: 2.0 }),\n    Box::new(Quadrado { lado: 3.0 }),\n];'
          },
          {
            title: 'dyn Trait: um trait object',
            body: 'dyn Trait indica que o tipo exato será decidido em tempo de EXECUÇÃO, não de compilação — por isso trait objects quase sempre vêm dentro de um ponteiro, como Box<dyn Trait>, já que o tamanho exato do tipo concreto não é conhecido de antemão.'
          },
          {
            title: 'Despacho dinâmico x estático',
            body: 'Chamar um método através de um trait object usa despacho DINÂMICO (decidido em tempo de execução, com um pequeno custo de desempenho); generics usam despacho ESTÁTICO (decidido em tempo de compilação, sem esse custo).'
          },
          {
            title: 'Quando escolher cada abordagem',
            body: 'Generics são preferíveis quando o desempenho máximo importa e os tipos são conhecidos em compilação; trait objects são a escolha certa quando você precisa de uma coleção verdadeiramente heterogênea, com tipos que só são decididos em tempo de execução.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que generics exigem saber, em tempo de compilação?',
          choices: [
            { id: 'a', text: 'Quais tipos concretos serão usados' },
            { id: 'b', text: 'O valor exato de cada variável' },
            { id: 'c', text: 'Quantas threads o programa vai usar' },
            { id: 'd', text: 'Nada, generics não exigem nenhuma informação prévia' }
          ],
          answer: 'a',
          explanation: 'Generics precisam saber os tipos concretos para gerar código especializado em compilação.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual problema trait objects resolvem, que generics sozinhos não resolvem?',
          choices: [
            { id: 'a', text: 'Guardar, na mesma coleção, valores de tipos diferentes que implementam um trait em comum' },
            { id: 'b', text: 'Tornar o código mais rápido que generics' },
            { id: 'c', text: 'Eliminar a necessidade de traits' },
            { id: 'd', text: 'Permitir múltiplos donos de um mesmo valor' }
          ],
          answer: 'a',
          explanation: 'Trait objects permitem coleções heterogêneas de tipos que implementam o mesmo trait.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que dyn Trait indica?',
          choices: [
            { id: 'a', text: 'Que o tipo exato será decidido em tempo de execução, não de compilação' },
            { id: 'b', text: 'Que o trait não pode ser implementado por nenhum tipo' },
            { id: 'c', text: 'Que o valor vive na stack, nunca na heap' },
            { id: 'd', text: 'Que o tipo é sempre conhecido em tempo de compilação' }
          ],
          answer: 'a',
          explanation: 'dyn Trait sinaliza despacho dinâmico, resolvido em tempo de execução.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para indicar um trait object:',
          code: 'let formas: Vec<Box<___ Forma>> = vec![\n    // ...\n];',
          accept: ['dyn'],
          explanation: 'dyn indica que o tipo concreto será decidido em tempo de execução.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que trait objects quase sempre vêm dentro de um ponteiro, como Box<dyn Trait>?',
          choices: [
            { id: 'a', text: 'Porque o tamanho exato do tipo concreto por trás do trait object não é conhecido em tempo de compilação' },
            { id: 'b', text: 'Porque Box é obrigatório para qualquer struct em Rust' },
            { id: 'c', text: 'Porque dyn Trait só funciona dentro de closures' },
            { id: 'd', text: 'Não há motivo real, é só uma convenção arbitrária' }
          ],
          answer: 'a',
          explanation: 'Sem tamanho fixo conhecido, o trait object precisa de um ponteiro para ser usado.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que é despacho dinâmico?',
          choices: [
            { id: 'a', text: 'A decisão de qual implementação de método chamar, feita em tempo de execução, com um pequeno custo de desempenho' },
            { id: 'b', text: 'A decisão de qual implementação chamar, feita em tempo de compilação, sem custo algum' },
            { id: 'c', text: 'Uma forma de eliminar traits do programa' },
            { id: 'd', text: 'Um tipo de erro de compilação' }
          ],
          answer: 'a',
          explanation: 'Despacho dinâmico resolve a chamada de método em tempo de execução.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando generics costumam ser preferíveis a trait objects?',
          choices: [
            { id: 'a', text: 'Quando o desempenho máximo importa e os tipos são conhecidos em tempo de compilação' },
            { id: 'b', text: 'Quando se precisa de uma coleção com tipos decididos só em tempo de execução' },
            { id: 'c', text: 'Sempre, trait objects nunca deveriam ser usados' },
            { id: 'd', text: 'Nunca, trait objects são sempre superiores' }
          ],
          answer: 'a',
          explanation: 'Generics evitam o custo do despacho dinâmico, quando os tipos são conhecidos em compilação.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de despacho usado por Vec<Box<dyn Forma>> ao chamar um método:',
          code: 'Vec<Box<dyn Forma>> permite guardar tipos diferentes que implementam Forma, usando despacho ___',
          accept: ['dinâmico', 'dinamico'],
          explanation: 'Trait objects usam despacho dinâmico, resolvido em tempo de execução.'
        }
      ]
    },
    {
      id: 'rsi-08-lifetimes',
      title: 'Lifetimes: introdução',
      goal: 'Entender por que o compilador às vezes exige anotações explícitas de tempo de vida numa referência.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando: referências e escopo',
            body: 'Vimos que uma referência (&) empresta um valor sem tomar posse — mas o compilador precisa garantir que essa referência nunca sobreviva mais tempo do que o valor original que ela aponta.'
          },
          {
            title: 'O problema: quando o compilador não consegue decidir sozinho',
            body: 'Na maioria dos casos, o compilador infere sozinho por quanto tempo uma referência é válida; mas em certas funções, especialmente as que recebem MAIS de uma referência e devolvem uma delas, ele não consegue decidir sozinho qual delas é a referência de retorno.'
          },
          {
            title: "A anotação 'a",
            body: "Uma lifetime (tempo de vida) é anotada com um apóstrofo seguido de um nome curto, como 'a — ela não muda quanto tempo o valor vive de verdade, só descreve para o compilador a relação entre os tempos de vida dos parâmetros e do retorno.",
            code: "fn mais_longa<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}"
          },
          {
            title: 'O que essa anotação diz, no exemplo',
            body: "'a diz: o valor retornado vive, no máximo, tanto quanto o MENOR dos dois tempos de vida de x e y — garantindo que quem receber o retorno não use uma referência já inválida."
          },
          {
            title: 'Nem toda função precisa de lifetime explícito',
            body: 'A grande maioria das funções nunca precisa de anotação de lifetime, graças a regras de inferência automática (elision) — lifetimes explícitos só aparecem quando o compilador realmente não consegue decidir sozinho, como no exemplo acima.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o compilador precisa garantir sobre uma referência?',
          choices: [
            { id: 'a', text: 'Que ela nunca sobreviva mais tempo do que o valor original que ela aponta' },
            { id: 'b', text: 'Que ela sempre viva mais tempo que o programa inteiro' },
            { id: 'c', text: 'Que ela seja sempre mutável' },
            { id: 'd', text: 'Que ela nunca seja usada dentro de funções' }
          ],
          answer: 'a',
          explanation: 'O compilador garante que referências nunca apontem para memória já liberada.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quando o compilador costuma precisar de uma anotação explícita de lifetime?',
          choices: [
            { id: 'a', text: 'Em funções que recebem mais de uma referência e devolvem uma delas, sem conseguir decidir sozinho qual é a referência de retorno' },
            { id: 'b', text: 'Em toda função que recebe qualquer parâmetro' },
            { id: 'c', text: 'Somente em funções sem nenhum parâmetro' },
            { id: 'd', text: 'Nunca, lifetimes são sempre inferidas automaticamente' }
          ],
          answer: 'a',
          explanation: 'Funções com múltiplas referências de entrada e uma de saída ambígua exigem lifetime explícito.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: "O que uma lifetime como 'a realmente muda no tempo de vida real de um valor?",
          choices: [
            { id: 'a', text: 'Nada, ela só descreve para o compilador a relação entre os tempos de vida dos parâmetros e do retorno' },
            { id: 'b', text: 'Ela prolonga o tempo de vida do valor automaticamente' },
            { id: 'c', text: 'Ela transforma o valor numa constante' },
            { id: 'd', text: 'Ela move a posse do valor para outra variável' }
          ],
          answer: 'a',
          explanation: 'Lifetimes são apenas anotações descritivas, não alteram o tempo de vida real.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a anotação de lifetime usada nos parâmetros da função:',
          code: "fn mais_longa<___>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}",
          accept: ["'a"],
          explanation: "'a é a lifetime declarada e usada nos parâmetros e no retorno da função."
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: "No exemplo de mais_longa, o que 'a garante sobre o valor retornado?",
          choices: [
            { id: 'a', text: 'Que ele vive, no máximo, tanto quanto o menor dos dois tempos de vida de x e y' },
            { id: 'b', text: 'Que ele vive para sempre, independente de x e y' },
            { id: 'c', text: 'Que ele é sempre uma cópia de x' },
            { id: 'd', text: 'Que ele nunca pode ser usado depois de retornado' }
          ],
          answer: 'a',
          explanation: "'a relaciona o tempo de vida do retorno ao menor entre x e y."
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Toda função em Rust precisa de anotação explícita de lifetime?',
          choices: [
            { id: 'a', text: 'Não, a grande maioria nunca precisa, graças a regras de inferência automática' },
            { id: 'b', text: 'Sim, toda função com qualquer referência precisa de lifetime explícito' },
            { id: 'c', text: 'Sim, mas só em funções sem retorno' },
            { id: 'd', text: 'Não, lifetimes nunca são necessárias em Rust' }
          ],
          answer: 'a',
          explanation: 'Regras de elision cobrem a maioria dos casos, dispensando anotação explícita.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Como uma lifetime é anotada na sintaxe de Rust?',
          choices: [
            { id: 'a', text: 'Com um apóstrofo seguido de um nome curto, como \'a' },
            { id: 'b', text: 'Com colchetes ao redor do tipo' },
            { id: 'c', text: 'Com a palavra-chave lifetime' },
            { id: 'd', text: 'Com um ponto e vírgula extra' }
          ],
          answer: 'a',
          explanation: "Lifetimes usam a sintaxe de apóstrofo, como 'a, 'b, etc."
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de retorno da função, referenciando uma fatia de texto com a mesma lifetime:',
          code: "fn mais_longa<'a>(x: &'a str, y: &'a str) -> &'a ___ {\n    if x.len() > y.len() { x } else { y }\n}",
          accept: ['str'],
          explanation: '&\'a str é o tipo de retorno, uma referência de texto com a lifetime \'a.'
        }
      ]
    },
    {
      id: 'rsi-09-erros-avancado',
      title: 'Tratamento de erros avançado',
      goal: 'Criar tipos de erro próprios e converter entre diferentes tipos de erro numa mesma função.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando Result',
            body: 'Vimos, no nível iniciante, que Result<T, E> representa sucesso (Ok) ou falha (Err) — mas até agora usamos tipos simples como String para representar o erro.'
          },
          {
            title: 'Enums de erro customizados',
            body: 'Um enum próprio para representar os erros possíveis de uma parte do programa deixa o código mais claro do que só usar uma String genérica, permitindo tratar cada tipo de erro de forma diferente com match.',
            code: 'enum ErroConfig {\n    ArquivoNaoEncontrado,\n    FormatoInvalido,\n}'
          },
          {
            title: 'O problema de combinar erros diferentes',
            body: 'Uma função pode chamar outras que retornam tipos de erro DIFERENTES entre si (por exemplo, um erro de arquivo e um erro de parsing) — se a função só devolve um tipo de erro, é preciso converter um no outro.'
          },
          {
            title: 'From e a conversão automática com ?',
            body: 'Implementando o trait From para converter de um tipo de erro para outro, o operador ? (visto no nível iniciante) passa a converter automaticamente o erro, sem código extra no meio do caminho.'
          },
          {
            title: 'Box<dyn Error>: um "erro genérico"',
            body: 'Quando não vale a pena criar um enum próprio (por exemplo, em protótipos ou scripts simples), Box<dyn Error> permite devolver "qualquer tipo de erro", sem precisar especificar exatamente qual, contanto que implemente o trait padrão Error.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que criar um enum próprio para representar erros é melhor do que usar só uma String?',
          choices: [
            { id: 'a', text: 'Porque deixa o código mais claro e permite tratar cada tipo de erro de forma diferente com match' },
            { id: 'b', text: 'Porque String não pode representar mensagens de erro' },
            { id: 'c', text: 'Porque enums são sempre mais rápidos que String' },
            { id: 'd', text: 'Não há vantagem real, é só uma questão de estilo' }
          ],
          answer: 'a',
          explanation: 'Enums de erro permitem tratar cada caso de forma distinta e explícita.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual problema surge quando uma função chama outras que retornam tipos de erro diferentes entre si?',
          choices: [
            { id: 'a', text: 'É preciso converter um tipo de erro no outro, já que a função só pode devolver um tipo de Err' },
            { id: 'b', text: 'O programa não compila em nenhuma hipótese' },
            { id: 'c', text: 'Não há problema nenhum, Rust converte automaticamente sempre' },
            { id: 'd', text: 'A função precisa devolver dois valores Result ao mesmo tempo' }
          ],
          answer: 'a',
          explanation: 'Combinar tipos de erro diferentes exige conversão, já que Result só tem um tipo E.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que implementar o trait From entre dois tipos de erro permite?',
          choices: [
            { id: 'a', text: 'Que o operador ? converta automaticamente o erro, sem código extra' },
            { id: 'b', text: 'Que a função pare de retornar Result' },
            { id: 'c', text: 'Que o erro nunca mais precise ser tratado' },
            { id: 'd', text: 'Que o enum de erro seja convertido em struct' }
          ],
          answer: 'a',
          explanation: 'From permite a conversão automática de erros usada pelo operador ?.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para declarar um tipo de erro customizado como enum:',
          code: '___ ErroConfig {\n    ArquivoNaoEncontrado,\n    FormatoInvalido,\n}',
          accept: ['enum'],
          explanation: 'enum é a palavra-chave usada para declarar um tipo de erro customizado com variantes.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que Box<dyn Error> permite?',
          choices: [
            { id: 'a', text: 'Devolver "qualquer tipo de erro", sem precisar especificar exatamente qual, contanto que implemente o trait Error' },
            { id: 'b', text: 'Eliminar completamente a necessidade de tratar erros' },
            { id: 'c', text: 'Converter qualquer Err em Ok automaticamente' },
            { id: 'd', text: 'Impedir que a função retorne Result' }
          ],
          answer: 'a',
          explanation: 'Box<dyn Error> generaliza o tipo de erro, aceitando qualquer implementação de Error.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando Box<dyn Error> costuma ser mais indicado que um enum de erro próprio?',
          choices: [
            { id: 'a', text: 'Em protótipos ou scripts simples, quando não vale a pena criar um enum específico' },
            { id: 'b', text: 'Sempre, em qualquer código de produção robusto' },
            { id: 'c', text: 'Nunca, Box<dyn Error> não deveria ser usado' },
            { id: 'd', text: 'Somente quando a função não retorna nenhum erro' }
          ],
          answer: 'a',
          explanation: 'Box<dyn Error> é uma solução prática para casos simples, sem exigir um enum dedicado.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O operador ?, visto no nível iniciante, ganha que capacidade extra com From implementado?',
          choices: [
            { id: 'a', text: 'Passa a converter automaticamente o erro de um tipo para outro, sem código extra no meio do caminho' },
            { id: 'b', text: 'Passa a nunca mais propagar erros' },
            { id: 'c', text: 'Passa a funcionar só com Option, não mais com Result' },
            { id: 'd', text: 'Nenhuma, o comportamento continua idêntico' }
          ],
          answer: 'a',
          explanation: 'Com From implementado, ? converte o erro automaticamente ao propagá-lo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o trait que, implementado entre dois tipos de erro, permite que o operador ? converta automaticamente:',
          code: 'Implementar o trait ___ entre dois tipos de erro permite que o operador ? converta automaticamente',
          accept: ['From'],
          explanation: 'From é o trait usado para definir conversões automáticas entre tipos, incluindo erros.'
        }
      ]
    },
    {
      id: 'rsi-10-testes',
      title: 'Testes automatizados',
      goal: 'Escrever e rodar testes automatizados com #[test] e cargo test.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que escrever testes',
            body: 'Testes automatizados verificam que o código continua funcionando corretamente conforme o projeto cresce e muda, sem precisar checar manualmente toda vez.'
          },
          {
            title: '#[test]: marcando uma função como teste',
            body: 'A anotação #[test] acima de uma função diz ao Rust que aquela função é um teste, a ser rodado por cargo test, não parte do programa normal.',
            code: '#[test]\nfn testa_soma() {\n    assert_eq!(2 + 2, 4);\n}'
          },
          {
            title: 'assert! e assert_eq!',
            body: 'assert!(condição) falha o teste se a condição for falsa; assert_eq!(a, b) falha o teste se a e b não forem iguais, mostrando os dois valores na mensagem de erro.',
            code: 'assert!(2 + 2 == 4);\nassert_eq!(2 + 2, 4);'
          },
          {
            title: 'cargo test: rodando todos os testes',
            body: 'O comando cargo test compila o projeto e roda automaticamente todas as funções marcadas com #[test], reportando quantas passaram e quantas falharam.'
          },
          {
            title: 'Testando que uma função gera panic',
            body: '#[should_panic] marca um teste que É ESPERADO que cause panic! — útil para verificar que uma função realmente rejeita entradas inválidas, como esperado.',
            code: '#[test]\n#[should_panic]\nfn testa_divisao_por_zero() {\n    dividir(10, 0);\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que servem testes automatizados?',
          choices: [
            { id: 'a', text: 'Verificar que o código continua funcionando corretamente conforme o projeto cresce e muda' },
            { id: 'b', text: 'Substituir completamente a necessidade de compilar o código' },
            { id: 'c', text: 'Tornar o programa mais rápido em produção' },
            { id: 'd', text: 'Documentar automaticamente o código' }
          ],
          answer: 'a',
          explanation: 'Testes verificam a corretude do código ao longo do tempo, de forma automatizada.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que #[test] faz, colocado acima de uma função?',
          choices: [
            { id: 'a', text: 'Diz ao Rust que aquela função é um teste, a ser rodado por cargo test' },
            { id: 'b', text: 'Torna a função pública automaticamente' },
            { id: 'c', text: 'Remove a função do programa final' },
            { id: 'd', text: 'Transforma a função num trait' }
          ],
          answer: 'a',
          explanation: '#[test] marca a função como um teste executado por cargo test.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que assert_eq!(a, b) faz?',
          choices: [
            { id: 'a', text: 'Falha o teste se a e b não forem iguais, mostrando os dois valores na mensagem de erro' },
            { id: 'b', text: 'Sempre passa, independente dos valores' },
            { id: 'c', text: 'Converte a em b automaticamente' },
            { id: 'd', text: 'Só funciona com números inteiros' }
          ],
          answer: 'a',
          explanation: 'assert_eq! compara dois valores e falha o teste se forem diferentes.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o símbolo que precede a anotação usada para marcar uma função como teste:',
          code: '___[test]\nfn testa_soma() {\n    assert_eq!(2 + 2, 4);\n}',
          accept: ['#'],
          explanation: '#[test] é a anotação (atributo) que marca a função como teste.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que o comando cargo test faz?',
          choices: [
            { id: 'a', text: 'Compila o projeto e roda automaticamente todas as funções marcadas com #[test]' },
            { id: 'b', text: 'Apenas compila o projeto, sem rodar nada' },
            { id: 'c', text: 'Publica o projeto como uma nova crate' },
            { id: 'd', text: 'Remove todos os testes do código' }
          ],
          answer: 'a',
          explanation: 'cargo test compila e executa automaticamente todos os testes do projeto.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre assert! e assert_eq!?',
          choices: [
            { id: 'a', text: 'assert! checa se uma condição é verdadeira; assert_eq! checa especificamente se dois valores são iguais' },
            { id: 'b', text: 'São exatamente a mesma macro, com nomes diferentes' },
            { id: 'c', text: 'assert_eq! só funciona com booleanos' },
            { id: 'd', text: 'assert! não existe em Rust' }
          ],
          answer: 'a',
          explanation: 'assert! avalia uma condição booleana; assert_eq! compara igualdade entre dois valores.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Para que serve a anotação #[should_panic]?',
          choices: [
            { id: 'a', text: 'Marcar um teste que é esperado que cause panic!, verificando que a função rejeita entradas inválidas como esperado' },
            { id: 'b', text: 'Impedir que o teste seja executado' },
            { id: 'c', text: 'Fazer o teste sempre passar, mesmo com erro' },
            { id: 'd', text: 'Marcar uma função como pública' }
          ],
          answer: 'a',
          explanation: '#[should_panic] confirma que um panic! esperado realmente ocorre.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a anotação usada para marcar que um teste é esperado gerar panic!:',
          code: '#[test]\n___\nfn testa_divisao_por_zero() {\n    dividir(10, 0);\n}',
          accept: ['#[should_panic]'],
          explanation: '#[should_panic] indica que o teste deve falhar com panic! para passar.'
        }
      ]
    }
  ]
};
