// Módulo "Avançado" — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes por
// lição). Ver ../index.js para o formato e a validação de boot. Sintaxe Rust real nos exemplos de
// código, mesmo padrão de ./01-fundamentos.js e ./02-intermediario.js.
// Ids não são numericamente sequenciais na ordem pedagógica: rsa-11/rsa-12/rsa-13 foram inseridas
// depois, entre lições já numeradas (mesma convenção dos outros cursos) — FFI logo após Unsafe
// (é um dos usos mais comuns de unsafe na prática), Send/Sync logo após Futures/executors (a
// concorrência de async/threads depende diretamente desses dois traits), Macros procedurais logo
// após Macros declarativas (a segunda categoria de macro do Rust).
module.exports = {
  id: 'avancado-rust',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'Traits avançados, Deref/Drop, pattern matching, unsafe, async/await, macros e mais',
  accent: '#c084fc',
  lessons: [
    {
      id: 'rsa-01-traits-avancados',
      title: 'Traits avançados: associated types e operator overloading',
      goal: 'Usar tipos associados dentro de traits e sobrecarregar operadores como +.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando traits',
            body: 'Vimos, no nível intermediário, que um trait declara métodos que um tipo precisa implementar — mas traits também podem declarar TIPOS associados, não só métodos.'
          },
          {
            title: 'Associated types',
            body: 'Um tipo associado (type Item;) permite que cada implementação do trait escolha seu próprio tipo concreto para aquele "espaço reservado" — o próprio trait Iterator da biblioteca padrão usa isso, com type Item.',
            code: 'trait Container {\n    type Item;\n    fn obter(&self) -> Self::Item;\n}'
          },
          {
            title: 'Associated type x generic: quando usar cada um',
            body: 'Generics permitem que o MESMO tipo implemente o trait de várias formas diferentes (um tipo por implementação); associated types fixam um único tipo por implementação — usados quando só faz sentido UMA relação entre o tipo e seu "tipo associado".'
          },
          {
            title: 'Operator overloading: implementando Add',
            body: 'Traits como Add permitem definir o que o operador + faz para um tipo próprio, sobrecarregando o operador.',
            code: 'use std::ops::Add;\n\nimpl Add for Ponto {\n    type Output = Ponto;\n    fn add(self, outro: Ponto) -> Ponto {\n        Ponto { x: self.x + outro.x, y: self.y + outro.y }\n    }\n}'
          },
          {
            title: 'Por que isso é seguro em Rust',
            body: 'Diferente de outras linguagens onde sobrecarga de operador pode confundir o leitor, em Rust ela é sempre explícita (via um trait conhecido, como Add) — o comportamento nunca é "mágico" ou implícito.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Além de métodos, o que mais um trait pode declarar?',
          choices: [
            { id: 'a', text: 'Tipos associados' },
            { id: 'b', text: 'Variáveis globais mutáveis' },
            { id: 'c', text: 'Módulos inteiros' },
            { id: 'd', text: 'Threads próprias' }
          ],
          answer: 'a',
          explanation: 'Traits podem declarar tipos associados, além de métodos.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que um tipo associado (type Item;) permite?',
          choices: [
            { id: 'a', text: 'Que cada implementação do trait escolha seu próprio tipo concreto para aquele espaço reservado' },
            { id: 'b', text: 'Que o trait nunca seja implementado por nenhum tipo' },
            { id: 'c', text: 'Que o método do trait não precise de retorno' },
            { id: 'd', text: 'Que o trait vire uma struct automaticamente' }
          ],
          answer: 'a',
          explanation: 'Cada implementação define seu próprio tipo concreto para o associated type.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual trait da biblioteca padrão usa associated type de forma central?',
          choices: [
            { id: 'a', text: 'Iterator, com type Item' },
            { id: 'b', text: 'Debug' },
            { id: 'c', text: 'Clone' },
            { id: 'd', text: 'Drop' }
          ],
          answer: 'a',
          explanation: 'Iterator declara type Item, o tipo dos itens produzidos pelo iterador.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para declarar um tipo associado dentro de um trait:',
          code: 'trait Container {\n    ___ Item;\n    fn obter(&self) -> Self::Item;\n}',
          accept: ['type'],
          explanation: 'type declara um tipo associado dentro de um trait.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quando faz mais sentido usar um associated type em vez de um generic?',
          choices: [
            { id: 'a', text: 'Quando só faz sentido uma única relação entre o tipo e seu tipo associado, por implementação' },
            { id: 'b', text: 'Quando o mesmo tipo precisa implementar o trait de várias formas diferentes' },
            { id: 'c', text: 'Nunca, generics sempre substituem associated types' },
            { id: 'd', text: 'Somente para tipos numéricos' }
          ],
          answer: 'a',
          explanation: 'Associated types fixam uma única relação por implementação, diferente de generics.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que implementar o trait Add permite?',
          choices: [
            { id: 'a', text: 'Definir o que o operador + faz para um tipo próprio' },
            { id: 'b', text: 'Remover a necessidade de operadores aritméticos' },
            { id: 'c', text: 'Criar um novo módulo' },
            { id: 'd', text: 'Definir o que o operador == faz' }
          ],
          answer: 'a',
          explanation: 'Add sobrecarrega o operador + para o tipo que o implementa.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que sobrecarga de operador em Rust é considerada segura/previsível?',
          choices: [
            { id: 'a', text: 'Porque é sempre explícita, via um trait conhecido, nunca implícita ou "mágica"' },
            { id: 'b', text: 'Porque Rust não permite sobrecarregar nenhum operador' },
            { id: 'c', text: 'Porque cada operador tem um comportamento fixo, sem possibilidade de mudar' },
            { id: 'd', text: 'Não há nada de seguro nisso, é tão arriscado quanto em outras linguagens' }
          ],
          answer: 'a',
          explanation: 'A sobrecarga sempre passa por um trait explícito, sem comportamento oculto.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o trait implementado para sobrecarregar o operador + num tipo Ponto:',
          code: 'use std::ops::Add;\n\nimpl ___ for Ponto {\n    type Output = Ponto;\n    fn add(self, outro: Ponto) -> Ponto {\n        Ponto { x: self.x + outro.x, y: self.y + outro.y }\n    }\n}',
          accept: ['Add'],
          explanation: 'Add é o trait que define o comportamento do operador +.'
        }
      ]
    },
    {
      id: 'rsa-02-deref-drop',
      title: 'Deref e Drop: como smart pointers funcionam por dentro',
      goal: 'Entender os traits que permitem tratar um smart pointer como se fosse o valor de dentro, e executar código ao final da vida de um valor.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que *b funciona com Box',
            body: 'Vimos que *b acessa o valor de dentro de um Box; isso funciona porque Box implementa o trait Deref, que define o que o operador * faz para aquele tipo.'
          },
          {
            title: 'Deref: tratando um smart pointer como o valor de dentro',
            body: 'Implementar Deref permite que seu próprio tipo "encaixotado" se comporte, na prática, como uma referência ao valor interno — inclusive permitindo chamar métodos do valor interno diretamente no wrapper (deref coercion).',
            code: 'use std::ops::Deref;\n\nimpl<T> Deref for MeuBox<T> {\n    type Target = T;\n    fn deref(&self) -> &T {\n        &self.0\n    }\n}'
          },
          {
            title: 'Deref coercion',
            body: 'Graças ao Deref, o compilador converte automaticamente &MeuBox<String> em &str quando necessário, encadeando conversões — é por isso que String "funciona" onde se espera &str.'
          },
          {
            title: 'Drop: executando código ao final da vida de um valor',
            body: 'O trait Drop permite definir um método drop, chamado AUTOMATICAMENTE quando o valor sai de escopo — útil para liberar recursos (fechar um arquivo, uma conexão) de forma garantida.',
            code: 'struct Recurso {\n    nome: String,\n}\n\nimpl Drop for Recurso {\n    fn drop(&mut self) {\n        println!("Liberando {}", self.nome);\n    }\n}'
          },
          {
            title: 'Por que Drop é chamado automaticamente',
            body: 'Isso é exatamente o mesmo mecanismo de ownership que já vimos: quando o dono de um valor sai de escopo, o Rust chama drop() antes de liberar a memória — sem precisar de garbage collector nem de um "finally" manual.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que *b funciona para acessar o valor de dentro de um Box?',
          choices: [
            { id: 'a', text: 'Porque Box implementa o trait Deref, que define o que o operador * faz para aquele tipo' },
            { id: 'b', text: 'Porque Box é um tipo primitivo especial da linguagem' },
            { id: 'c', text: 'Porque todo tipo em Rust suporta * automaticamente' },
            { id: 'd', text: 'Porque Box implementa o trait Drop' }
          ],
          answer: 'a',
          explanation: 'Deref é o trait que dá significado ao operador * para um tipo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que implementar Deref permite?',
          choices: [
            { id: 'a', text: 'Que um tipo "encaixotado" se comporte, na prática, como uma referência ao valor interno' },
            { id: 'b', text: 'Que o valor seja liberado automaticamente antes do esperado' },
            { id: 'c', text: 'Que o tipo nunca possa ser copiado' },
            { id: 'd', text: 'Que o tipo vire um trait object automaticamente' }
          ],
          answer: 'a',
          explanation: 'Deref permite acessar o valor interno como se fosse uma referência a ele.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é "deref coercion"?',
          choices: [
            { id: 'a', text: 'A conversão automática feita pelo compilador, encadeando conversões de Deref quando necessário' },
            { id: 'b', text: 'Um erro de compilação causado por múltiplos Deref' },
            { id: 'c', text: 'Uma forma de forçar o programa a travar' },
            { id: 'd', text: 'O mesmo que implementar Drop' }
          ],
          answer: 'a',
          explanation: 'Deref coercion converte automaticamente tipos encadeando implementações de Deref.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o trait implementado para definir o comportamento do operador * num tipo próprio:',
          code: 'use std::ops::Deref;\n\nimpl<T> ___ for MeuBox<T> {\n    type Target = T;\n    fn deref(&self) -> &T {\n        &self.0\n    }\n}',
          accept: ['Deref'],
          explanation: 'Deref define o comportamento do operador * para o tipo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que o trait Drop permite definir?',
          choices: [
            { id: 'a', text: 'Um método drop, chamado automaticamente quando o valor sai de escopo' },
            { id: 'b', text: 'Um método que impede o valor de ser destruído' },
            { id: 'c', text: 'Um novo tipo de referência mutável' },
            { id: 'd', text: 'O comportamento do operador +' }
          ],
          answer: 'a',
          explanation: 'Drop define o método drop, executado automaticamente ao final da vida do valor.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para que Drop costuma ser usado?',
          choices: [
            { id: 'a', text: 'Liberar recursos (como fechar um arquivo ou conexão) de forma garantida' },
            { id: 'b', text: 'Criar novas instâncias de um tipo' },
            { id: 'c', text: 'Sobrecarregar o operador +' },
            { id: 'd', text: 'Converter um tipo em outro' }
          ],
          answer: 'a',
          explanation: 'Drop garante a liberação de recursos ao final da vida do valor.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando o método drop() de um valor é chamado, sem intervenção manual?',
          choices: [
            { id: 'a', text: 'Quando o dono do valor sai de escopo, antes de a memória ser liberada' },
            { id: 'b', text: 'A cada vez que o valor é lido' },
            { id: 'c', text: 'Só quando o programa é encerrado com erro' },
            { id: 'd', text: 'Nunca automaticamente, sempre precisa ser chamado manualmente' }
          ],
          answer: 'a',
          explanation: 'drop() é chamado automaticamente pelo Rust quando o dono do valor sai de escopo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o trait implementado para liberar um recurso automaticamente ao final da vida do valor:',
          code: 'impl ___ for Recurso {\n    fn drop(&mut self) {\n        println!("Liberando {}", self.nome);\n    }\n}',
          accept: ['Drop'],
          explanation: 'Drop define a lógica executada automaticamente ao final da vida do valor.'
        }
      ]
    },
    {
      id: 'rsa-03-pattern-matching',
      title: 'Pattern matching avançado',
      goal: 'Usar guards, bindings com @ e desestruturação aninhada em expressões match.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Relembrando match',
            body: 'Vimos, no nível iniciante, match comparando um valor contra variantes de enum — match é bem mais poderoso do que só isso.'
          },
          {
            title: 'Match guards: uma condição extra',
            body: 'Um "guard" é uma condição extra (if) adicionada a um braço do match, permitindo refinar quando aquele braço deve realmente ser escolhido.',
            code: 'let numero = 4;\nmatch numero {\n    n if n % 2 == 0 => println!("par"),\n    _ => println!("ímpar"),\n}'
          },
          {
            title: 'Bindings com @',
            body: 'O operador @ permite, ao mesmo tempo, TESTAR se um valor está dentro de um intervalo E guardar esse valor numa variável para usar dentro do braço.',
            code: 'let idade = 15;\nmatch idade {\n    id @ 13..=19 => println!("adolescente, tem {} anos", id),\n    _ => println!("outra faixa"),\n}'
          },
          {
            title: 'Desestruturando structs e tuplas em match',
            body: 'match pode desestruturar diretamente uma struct ou tupla, extraindo campos específicos no mesmo padrão.',
            code: 'struct Ponto { x: i32, y: i32 }\nlet p = Ponto { x: 0, y: 5 };\nmatch p {\n    Ponto { x: 0, y } => println!("no eixo y, em {}", y),\n    Ponto { x, y: 0 } => println!("no eixo x, em {}", x),\n    Ponto { x, y } => println!("em ({}, {})", x, y),\n}'
          },
          {
            title: 'O | para múltiplos padrões',
            body: 'O | dentro de um braço do match permite casar mais de um padrão com a mesma ação, evitando repetir o mesmo bloco várias vezes.',
            code: 'match numero {\n    1 | 2 | 3 => println!("pequeno"),\n    _ => println!("outro"),\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que um match guard faz?',
          choices: [
            { id: 'a', text: 'Adiciona uma condição extra (if) a um braço do match, refinando quando ele deve ser escolhido' },
            { id: 'b', text: 'Impede que o match seja executado' },
            { id: 'c', text: 'Cria um novo tipo de enum' },
            { id: 'd', text: 'Remove a necessidade do caso curinga _' }
          ],
          answer: 'a',
          explanation: 'Um guard adiciona uma condição extra para refinar a escolha do braço.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que o operador @ permite fazer num braço do match?',
          choices: [
            { id: 'a', text: 'Testar se um valor está dentro de um intervalo e, ao mesmo tempo, guardá-lo numa variável para usar dentro do braço' },
            { id: 'b', text: 'Ignorar completamente o valor testado' },
            { id: 'c', text: 'Converter o valor para outro tipo' },
            { id: 'd', text: 'Encerrar o match imediatamente' }
          ],
          answer: 'a',
          explanation: '@ combina teste de padrão com captura do valor numa variável.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'match pode desestruturar diretamente uma struct?',
          choices: [
            { id: 'a', text: 'Sim, extraindo campos específicos no mesmo padrão' },
            { id: 'b', text: 'Não, structs nunca podem ser usadas em match' },
            { id: 'c', text: 'Só se a struct tiver um único campo' },
            { id: 'd', text: 'Só se todos os campos forem numéricos' }
          ],
          answer: 'a',
          explanation: 'match desestrutura structs, extraindo os campos diretamente no padrão.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para adicionar uma condição extra a um braço do match:',
          code: 'match numero {\n    n ___ n % 2 == 0 => println!("par"),\n    _ => println!("ímpar"),\n}',
          accept: ['if'],
          explanation: 'if introduz a condição extra (guard) do braço do match.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que o | dentro de um braço do match permite?',
          choices: [
            { id: 'a', text: 'Casar mais de um padrão com a mesma ação, evitando repetir o mesmo bloco' },
            { id: 'b', text: 'Executar todos os braços do match ao mesmo tempo' },
            { id: 'c', text: 'Ignorar o valor testado' },
            { id: 'd', text: 'Criar uma nova variável global' }
          ],
          answer: 'a',
          explanation: '| permite reunir múltiplos padrões numa mesma ação, sem repetir código.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'No exemplo id @ 13..=19, o que id representa dentro do braço?',
          choices: [
            { id: 'a', text: 'O valor testado, já guardado numa variável para uso dentro do bloco' },
            { id: 'b', text: 'Um índice de array' },
            { id: 'c', text: 'O tipo da variável testada' },
            { id: 'd', text: 'Sempre o número 13' }
          ],
          answer: 'a',
          explanation: 'id captura o valor testado pelo padrão, disponível para uso dentro do braço.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que desestruturar diretamente numa expressão match é útil?',
          choices: [
            { id: 'a', text: 'Permite extrair e usar campos específicos de uma struct/tupla, sem código extra para acessá-los manualmente' },
            { id: 'b', text: 'Torna o código mais lento em tempo de execução' },
            { id: 'c', text: 'Impede o uso do caso curinga _' },
            { id: 'd', text: 'Só funciona com tuplas, nunca com structs' }
          ],
          answer: 'a',
          explanation: 'A desestruturação evita código extra para acessar campos manualmente.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador usado para testar um intervalo e capturar o valor numa variável ao mesmo tempo:',
          code: 'match idade {\n    id ___ 13..=19 => println!("adolescente, tem {} anos", id),\n    _ => println!("outra faixa"),\n}',
          accept: ['@'],
          explanation: '@ combina teste de padrão com captura de valor.'
        }
      ]
    },
    {
      id: 'rsa-04-iterator-custom',
      title: 'Implementando seu próprio Iterator',
      goal: 'Criar um tipo que pode ser percorrido com for, implementando o trait Iterator.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando: usando iterators prontos',
            body: 'No nível intermediário, usamos .iter(), map e filter sobre coleções já existentes — mas também é possível criar seu PRÓPRIO tipo que se comporta como um iterador.'
          },
          {
            title: 'O trait Iterator e seu único método obrigatório',
            body: 'Implementar Iterator exige apenas um método: next(), que devolve Option<Self::Item> — Some(item) enquanto houver próximo item, None quando acabar.',
            code: 'struct Contador {\n    atual: u32,\n}\n\nimpl Iterator for Contador {\n    type Item = u32;\n    fn next(&mut self) -> Option<u32> {\n        if self.atual < 5 {\n            self.atual += 1;\n            Some(self.atual)\n        } else {\n            None\n        }\n    }\n}'
          },
          {
            title: 'Ganhando map, filter, collect "de graça"',
            body: 'Ao implementar só next(), o tipo automaticamente ganha TODOS os outros métodos de iterator (map, filter, collect, sum...) — eles já vêm implementados na biblioteca padrão, em cima de next().'
          },
          {
            title: 'Usando com for',
            body: 'Como qualquer outro iterador, um tipo que implementa Iterator pode ser percorrido diretamente com for.',
            code: 'let contador = Contador { atual: 0 };\nfor n in contador {\n    println!("{}", n);\n}'
          },
          {
            title: 'Por que criar iteradores próprios é útil',
            body: 'Permite representar sequências customizadas (como os nós de uma estrutura de dados própria) de forma que se encaixe naturalmente com todo o ecossistema de iterators do Rust, sem reinventar map/filter/collect para cada tipo novo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual único método é obrigatório para implementar o trait Iterator?',
          choices: [
            { id: 'a', text: 'next()' },
            { id: 'b', text: 'map()' },
            { id: 'c', text: 'collect()' },
            { id: 'd', text: 'filter()' }
          ],
          answer: 'a',
          explanation: 'next() é o único método obrigatório para implementar Iterator.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que next() devolve?',
          choices: [
            { id: 'a', text: 'Option<Self::Item>: Some(item) enquanto houver próximo item, None quando acabar' },
            { id: 'b', text: 'Sempre um Vec com todos os itens restantes' },
            { id: 'c', text: 'Um Result<T, E>' },
            { id: 'd', text: 'Um valor booleano indicando se o iterador está vazio' }
          ],
          answer: 'a',
          explanation: 'next() devolve Option, sinalizando presença ou ausência de um próximo item.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Ao implementar apenas next(), o que o tipo ganha automaticamente?',
          choices: [
            { id: 'a', text: 'Todos os outros métodos de iterator, como map, filter, collect e sum' },
            { id: 'b', text: 'Nenhum outro método, é preciso implementar cada um manualmente' },
            { id: 'c', text: 'Apenas o método map, os demais precisam ser implementados' },
            { id: 'd', text: 'Um novo trait Iterator2 automaticamente' }
          ],
          answer: 'a',
          explanation: 'A biblioteca padrão implementa os demais métodos em cima de next().'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do método obrigatório ao implementar Iterator:',
          code: 'impl Iterator for Contador {\n    type Item = u32;\n    fn ___(&mut self) -> Option<u32> {\n        // ...\n    }\n}',
          accept: ['next'],
          explanation: 'next() é o método que avança o iterador, devolvendo o próximo item ou None.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um tipo que implementa Iterator pode ser percorrido com for?',
          choices: [
            { id: 'a', text: 'Sim, exatamente como qualquer outro iterador' },
            { id: 'b', text: 'Não, for só funciona com Vec e arrays' },
            { id: 'c', text: 'Só se o tipo também implementar Clone' },
            { id: 'd', text: 'Só dentro de closures' }
          ],
          answer: 'a',
          explanation: 'Qualquer tipo que implemente Iterator pode ser percorrido com for.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que criar iteradores próprios é útil?',
          choices: [
            { id: 'a', text: 'Permite representar sequências customizadas que se encaixam naturalmente com todo o ecossistema de iterators do Rust' },
            { id: 'b', text: 'É a única forma de usar for em Rust' },
            { id: 'c', text: 'Elimina a necessidade de structs' },
            { id: 'd', text: 'Torna o código mais lento, mas mais organizado' }
          ],
          answer: 'a',
          explanation: 'Iteradores próprios se integram ao ecossistema de map/filter/collect já existente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde métodos como map e filter já vêm implementados, para qualquer tipo que implemente Iterator?',
          choices: [
            { id: 'a', text: 'Na biblioteca padrão, em cima do método next()' },
            { id: 'b', text: 'Precisam ser reescritos manualmente para cada novo tipo' },
            { id: 'c', text: 'Dentro do próprio compilador, fora da biblioteca padrão' },
            { id: 'd', text: 'Não existem, precisam ser implementados do zero' }
          ],
          answer: 'a',
          explanation: 'A biblioteca padrão fornece esses métodos com base apenas em next().'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variante devolvida quando ainda há um próximo item no iterador:',
          code: 'fn next(&mut self) -> Option<u32> {\n    if self.atual < 5 {\n        self.atual += 1;\n        ___(self.atual)\n    } else {\n        None\n    }\n}',
          accept: ['Some'],
          explanation: 'Some(valor) sinaliza que há um próximo item disponível.'
        }
      ]
    },
    {
      id: 'rsa-05-unsafe',
      title: 'Unsafe Rust',
      goal: 'Entender o que unsafe permite fazer e por que ele existe, apesar da fama de segurança do Rust.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Rust ainda precisa fazer certas coisas "perigosas"',
            body: 'Algumas operações (acessar memória diretamente, chamar código de outra linguagem) não podem ser verificadas pelas regras normais do compilador — mas ainda são necessárias em certos casos.'
          },
          {
            title: 'O que unsafe faz',
            body: 'Um bloco unsafe { } permite um conjunto pequeno e específico de operações extras, normalmente proibidas: desreferenciar ponteiros brutos, chamar funções marcadas como unsafe, entre outras.',
            code: 'let numero = 5;\nlet ponteiro = &numero as *const i32;\nunsafe {\n    println!("{}", *ponteiro);\n}'
          },
          {
            title: 'unsafe não desliga o compilador inteiro',
            body: 'É um erro comum achar que unsafe desativa toda a verificação de tipos e ownership — na verdade, ele só libera um punhado específico de operações extras; todo o resto das regras continua valendo normalmente.'
          },
          {
            title: 'O contrato que você assume',
            body: 'Dentro de um unsafe, VOCÊ (o programador) garante manualmente que aquela operação é segura — o compilador para de checar, e a responsabilidade de não causar um comportamento indefinido passa a ser sua.'
          },
          {
            title: 'Por que a maioria do código Rust nunca precisa de unsafe',
            body: 'Bibliotecas cuidadosamente escritas costumam encapsular o unsafe internamente, expondo uma API 100% segura por fora — é assim que a própria biblioteca padrão do Rust é construída por baixo dos panos.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que unsafe existe em Rust?',
          choices: [
            { id: 'a', text: 'Porque algumas operações necessárias não podem ser verificadas pelas regras normais do compilador' },
            { id: 'b', text: 'Porque o compilador do Rust tem falhas de segurança' },
            { id: 'c', text: 'Para tornar o código sempre mais rápido' },
            { id: 'd', text: 'Para substituir completamente o sistema de ownership' }
          ],
          answer: 'a',
          explanation: 'unsafe existe para viabilizar operações que fogem das garantias normais do compilador.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que um bloco unsafe { } permite?',
          choices: [
            { id: 'a', text: 'Um conjunto pequeno e específico de operações extras, como desreferenciar ponteiros brutos' },
            { id: 'b', text: 'Executar qualquer código sem nenhuma restrição' },
            { id: 'c', text: 'Ignorar completamente o sistema de tipos' },
            { id: 'd', text: 'Desabilitar o borrow checker para o programa inteiro' }
          ],
          answer: 'a',
          explanation: 'unsafe libera apenas um conjunto específico de operações, não tudo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'unsafe desativa toda a verificação de tipos e ownership do compilador?',
          choices: [
            { id: 'a', text: 'Não, ele só libera um punhado específico de operações extras; o resto das regras continua valendo' },
            { id: 'b', text: 'Sim, desativa completamente todas as verificações' },
            { id: 'c', text: 'Sim, mas só dentro de funções async' },
            { id: 'd', text: 'Não existe unsafe em Rust' }
          ],
          answer: 'a',
          explanation: 'A maior parte das regras do compilador continua ativa mesmo dentro de unsafe.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para permitir desreferenciar um ponteiro bruto:',
          code: 'let ponteiro = &numero as *const i32;\n___ {\n    println!("{}", *ponteiro);\n}',
          accept: ['unsafe'],
          explanation: 'unsafe é o bloco que libera a desreferenciação de ponteiros brutos.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Dentro de um bloco unsafe, quem garante que a operação é realmente segura?',
          choices: [
            { id: 'a', text: 'O próprio programador, manualmente' },
            { id: 'b', text: 'O compilador, automaticamente' },
            { id: 'c', text: 'O sistema operacional' },
            { id: 'd', text: 'Ninguém, a segurança deixa de importar' }
          ],
          answer: 'a',
          explanation: 'Dentro de unsafe, a garantia de segurança passa a ser responsabilidade do programador.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece com a checagem do compilador dentro de um unsafe?',
          choices: [
            { id: 'a', text: 'Ele para de checar aquelas operações específicas, e a responsabilidade passa a ser do programador' },
            { id: 'b', text: 'Ele passa a checar ainda mais rigorosamente' },
            { id: 'c', text: 'Ele para de compilar o programa inteiro' },
            { id: 'd', text: 'Nada muda, a checagem continua idêntica' }
          ],
          answer: 'a',
          explanation: 'unsafe suspende a checagem apenas das operações específicas permitidas ali dentro.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que a maioria do código Rust nunca precisa usar unsafe diretamente?',
          choices: [
            { id: 'a', text: 'Porque bibliotecas cuidadosamente escritas encapsulam o unsafe internamente, expondo uma API segura por fora' },
            { id: 'b', text: 'Porque unsafe foi removido das versões recentes de Rust' },
            { id: 'c', text: 'Porque unsafe só funciona em sistemas operacionais específicos' },
            { id: 'd', text: 'Porque todo código Rust já é, por padrão, escrito com unsafe' }
          ],
          answer: 'a',
          explanation: 'Bibliotecas encapsulam o unsafe, expondo uma API segura para quem as usa.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo apontado pelo ponteiro bruto no exemplo:',
          code: 'let numero = 5;\nlet ponteiro = &numero as *const ___;',
          accept: ['i32'],
          explanation: 'O ponteiro bruto aponta para um valor do tipo i32.'
        }
      ]
    },
    {
      id: 'rsa-11-ffi',
      title: 'FFI: interoperabilidade com C',
      goal: 'Chamar código C a partir de Rust, e entender por que isso exige unsafe.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que interoperar com C',
            body: 'Décadas de bibliotecas já escritas em C (para gráficos, criptografia, sistemas operacionais) não desaparecem da noite para o dia — Rust precisa conseguir CHAMAR esse código existente, sem reescrever tudo do zero.'
          },
          {
            title: 'extern "C": declarando uma função externa',
            body: 'extern "C" declara a assinatura de uma função escrita em C, que o linker vai conectar ao código C de verdade na hora de montar o programa final.',
            code: 'extern "C" {\n    fn abs(entrada: i32) -> i32;\n}\n\nunsafe {\n    println!("{}", abs(-5)); // 5\n}'
          },
          {
            title: 'Por que chamar uma função extern exige unsafe',
            body: 'O compilador Rust não tem como verificar as garantias de memória e tipos do lado C — ele não pode garantir que aquela função C se comporta como Rust espera, então a responsabilidade fica com o programador.'
          },
          {
            title: '#[no_mangle]: expondo uma função Rust para C',
            body: 'No sentido inverso, #[no_mangle] impede que o compilador renomeie uma função Rust internamente, permitindo que código C (ou outra linguagem) a encontre e chame pelo nome original.',
            code: '#[no_mangle]\npub extern "C" fn somar(a: i32, b: i32) -> i32 {\n    a + b\n}'
          },
          {
            title: 'Onde FFI aparece na prática',
            body: 'Bibliotecas Rust que envolvem (fazem "bind" de) bibliotecas C existentes, ou programas C que querem aproveitar uma biblioteca escrita em Rust por dentro, são os dois cenários mais comuns de FFI no dia a dia.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que Rust precisa de FFI para interoperar com C?',
          choices: [
            { id: 'a', text: 'Porque décadas de bibliotecas já escritas em C não podem simplesmente ser reescritas do zero' },
            { id: 'b', text: 'Porque Rust não consegue compilar sozinho, sem C' },
            { id: 'c', text: 'Porque C é mais rápido que Rust em qualquer situação' },
            { id: 'd', text: 'Não há motivo real, FFI é apenas uma curiosidade histórica' }
          ],
          answer: 'a',
          explanation: 'FFI permite reaproveitar código C existente, sem reescrever tudo em Rust.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que extern "C" declara?',
          choices: [
            { id: 'a', text: 'A assinatura de uma função escrita em C, que o linker conecta ao código C real' },
            { id: 'b', text: 'Uma nova struct genérica' },
            { id: 'c', text: 'Um módulo Rust privado' },
            { id: 'd', text: 'Um trait implementado automaticamente' }
          ],
          answer: 'a',
          explanation: 'extern "C" declara a assinatura de uma função externa, ligada em tempo de link.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que chamar uma função extern exige um bloco unsafe?',
          choices: [
            { id: 'a', text: 'Porque o compilador Rust não pode verificar as garantias de memória e tipos do lado C' },
            { id: 'b', text: 'Porque toda função extern trava o programa' },
            { id: 'c', text: 'Porque unsafe é exigido em qualquer chamada de função em Rust' },
            { id: 'd', text: 'Não há motivo real, é apenas uma formalidade' }
          ],
          answer: 'a',
          explanation: 'O compilador não consegue garantir a segurança do código C chamado.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para declarar uma função escrita em C:',
          code: '___ "C" {\n    fn abs(entrada: i32) -> i32;\n}',
          accept: ['extern'],
          explanation: 'extern declara uma função externa, ligada pelo linker.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que #[no_mangle] faz?',
          choices: [
            { id: 'a', text: 'Impede que o compilador renomeie internamente a função Rust, permitindo que outra linguagem a chame pelo nome original' },
            { id: 'b', text: 'Torna a função privada' },
            { id: 'c', text: 'Remove a função do binário final' },
            { id: 'd', text: 'Transforma a função numa macro' }
          ],
          answer: 'a',
          explanation: '#[no_mangle] preserva o nome original da função, visível para outras linguagens.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que uma função Rust exposta para C precisa de #[no_mangle]?',
          choices: [
            { id: 'a', text: 'Porque, sem isso, o compilador renomeia a função internamente, e o código C não conseguiria encontrá-la pelo nome esperado' },
            { id: 'b', text: 'Porque C não permite chamar nenhuma função Rust' },
            { id: 'c', text: 'Porque #[no_mangle] é obrigatório em toda função pública' },
            { id: 'd', text: 'Não há relação entre #[no_mangle] e chamadas de C' }
          ],
          answer: 'a',
          explanation: 'O nome renomeado (mangled) pelo compilador não seria reconhecido pelo lado C.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quais são os dois cenários mais comuns de FFI no dia a dia?',
          choices: [
            { id: 'a', text: 'Bibliotecas Rust que envolvem bibliotecas C existentes, ou programas C que usam uma biblioteca escrita em Rust' },
            { id: 'b', text: 'Apenas jogos e aplicações gráficas' },
            { id: 'c', text: 'Somente código assíncrono' },
            { id: 'd', text: 'FFI não tem uso prático real' }
          ],
          answer: 'a',
          explanation: 'FFI aparece tanto ao consumir C de Rust quanto ao expor Rust para C.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a anotação usada para preservar o nome original de uma função Rust exposta para C:',
          code: '#[___]\npub extern "C" fn somar(a: i32, b: i32) -> i32 {\n    a + b\n}',
          accept: ['no_mangle'],
          explanation: '#[no_mangle] evita a renomeação interna do nome da função.'
        }
      ]
    },
    {
      id: 'rsa-06-async-await',
      title: 'Async/await: programação assíncrona',
      goal: 'Escrever código que espera operações demoradas (como rede ou disco) sem bloquear a thread inteira.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: esperar sem travar tudo',
            body: 'Operações como uma requisição de rede podem demorar; bloquear a thread inteira esperando desperdiça a capacidade de fazer outras coisas enquanto isso.'
          },
          {
            title: 'async fn: uma função que pode pausar',
            body: 'Marcar uma função com async transforma seu corpo numa "receita" que pode ser pausada e retomada depois, em vez de rodar do início ao fim de uma vez.',
            code: 'async fn buscar_dados() -> String {\n    // simula uma operação demorada\n    String::from("dados")\n}'
          },
          {
            title: '.await: pausando até o resultado ficar pronto',
            body: 'Dentro de uma função async, .await pausa a execução ATÉ que a operação assíncrona termine, sem bloquear a thread — outras tarefas podem rodar nesse meio-tempo.',
            code: 'async fn processar() {\n    let dados = buscar_dados().await;\n    println!("{}", dados);\n}'
          },
          {
            title: 'Uma função async não roda sozinha',
            body: 'Chamar uma função async não executa o código imediatamente: ela devolve um Future (visto na próxima lição), que só realmente roda quando entregue a um executor.'
          },
          {
            title: 'Por que isso é diferente de threads',
            body: 'async/await permite ter MUITAS tarefas "pausadas" esperando ao mesmo tempo, numa única thread (ou poucas), sem o custo de criar uma thread do sistema operacional para cada uma — muito mais leve para operações que passam a maior parte do tempo esperando (como rede).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual problema async/await resolve?',
          choices: [
            { id: 'a', text: 'Esperar operações demoradas sem bloquear a thread inteira, desperdiçando capacidade de processamento' },
            { id: 'b', text: 'Eliminar completamente a necessidade de threads' },
            { id: 'c', text: 'Tornar todo o código automaticamente mais rápido' },
            { id: 'd', text: 'Evitar que o programa precise ser compilado' }
          ],
          answer: 'a',
          explanation: 'async/await evita bloquear a thread durante esperas, permitindo outras tarefas rodarem.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que marcar uma função com async faz?',
          choices: [
            { id: 'a', text: 'Transforma seu corpo numa "receita" que pode ser pausada e retomada depois' },
            { id: 'b', text: 'Faz a função rodar imediatamente numa nova thread' },
            { id: 'c', text: 'Impede que a função tenha parâmetros' },
            { id: 'd', text: 'Torna a função privada automaticamente' }
          ],
          answer: 'a',
          explanation: 'async transforma a função num Future, que pode ser pausado e retomado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que .await faz dentro de uma função async?',
          choices: [
            { id: 'a', text: 'Pausa a execução até que a operação assíncrona termine, sem bloquear a thread' },
            { id: 'b', text: 'Bloqueia a thread inteira até o fim do programa' },
            { id: 'c', text: 'Cria uma nova thread para a operação' },
            { id: 'd', text: 'Cancela a operação assíncrona imediatamente' }
          ],
          answer: 'a',
          explanation: '.await pausa até o resultado ficar pronto, sem bloquear a thread.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que transforma uma função em assíncrona:',
          code: '___ fn buscar_dados() -> String {\n    String::from("dados")\n}',
          accept: ['async'],
          explanation: 'async marca a função como assíncrona, podendo ser pausada e retomada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Chamar uma função async executa o código imediatamente?',
          choices: [
            { id: 'a', text: 'Não, ela devolve um Future, que só roda quando entregue a um executor' },
            { id: 'b', text: 'Sim, o código roda por completo assim que a função é chamada' },
            { id: 'c', text: 'Sim, mas só em modo de depuração' },
            { id: 'd', text: 'Não, a função nunca é executada' }
          ],
          answer: 'a',
          explanation: 'Chamar uma função async apenas cria um Future, que precisa de um executor para rodar.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que async/await é mais leve que criar uma thread para cada tarefa?',
          choices: [
            { id: 'a', text: 'Permite ter muitas tarefas pausadas esperando ao mesmo tempo, numa única thread (ou poucas), sem o custo de criar uma thread por tarefa' },
            { id: 'b', text: 'Porque elimina completamente a necessidade de esperar por qualquer coisa' },
            { id: 'c', text: 'Porque async/await roda sempre mais rápido que qualquer thread' },
            { id: 'd', text: 'Não há diferença real de custo' }
          ],
          answer: 'a',
          explanation: 'Tarefas assíncronas compartilham threads, evitando o custo de uma thread por tarefa.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando async/await costuma trazer mais benefício?',
          choices: [
            { id: 'a', text: 'Em operações que passam a maior parte do tempo esperando, como requisições de rede' },
            { id: 'b', text: 'Em cálculos matemáticos pesados, sem nenhuma espera' },
            { id: 'c', text: 'Apenas em programas sem nenhuma entrada de dados' },
            { id: 'd', text: 'Nunca, threads são sempre a melhor escolha' }
          ],
          answer: 'a',
          explanation: 'async/await se destaca em cargas de trabalho dominadas por espera (I/O).'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o que pausa a execução dentro de uma função async, até o resultado ficar pronto:',
          code: 'async fn processar() {\n    let dados = buscar_dados().___;\n    println!("{}", dados);\n}',
          accept: ['await'],
          explanation: '.await pausa a execução até a operação assíncrona terminar.'
        }
      ]
    },
    {
      id: 'rsa-07-futures-executors',
      title: 'Futures e executors',
      goal: 'Entender o que um Future representa e por que ele precisa de um executor para rodar.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que uma função async realmente devolve',
            body: 'Vimos que chamar uma função async não executa nada de imediato — ela devolve um valor que implementa o trait Future, representando "um trabalho que ainda vai acontecer".'
          },
          {
            title: 'Future: um trabalho ainda não concluído',
            body: 'Um Future representa um valor que estará disponível EM ALGUM MOMENTO no futuro — ele fica "parado" até alguém pedir para ele avançar.'
          },
          {
            title: 'poll: avançando um Future',
            body: 'Por baixo dos panos, um Future é avançado repetidamente através do método poll, que devolve "ainda não terminei" ou "aqui está o resultado" — você raramente chama poll diretamente, mas é isso que .await faz por trás dos panos.'
          },
          {
            title: 'Executors: quem efetivamente roda os Futures',
            body: 'Um Future sozinho não roda sozinho; é preciso um EXECUTOR (como o runtime da crate tokio, muito usada na prática) para de fato avançar os Futures até serem concluídos.',
            code: '#[tokio::main]\nasync fn main() {\n    let resultado = buscar_dados().await;\n    println!("{}", resultado);\n}'
          },
          {
            title: 'Por que Rust não vem com um executor embutido',
            body: 'Diferente de outras linguagens com async embutido na runtime padrão, Rust deixou a escolha do executor para o ecossistema (crates como tokio ou async-std) — permitindo escolher o executor mais adequado a cada tipo de aplicação (servidor web, embarcado, etc.).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que uma função async realmente devolve, ao ser chamada?',
          choices: [
            { id: 'a', text: 'Um valor que implementa o trait Future' },
            { id: 'b', text: 'O resultado final já calculado' },
            { id: 'c', text: 'Uma nova thread do sistema operacional' },
            { id: 'd', text: 'Um Result<T, E> sempre' }
          ],
          answer: 'a',
          explanation: 'Uma função async devolve um Future, representando um trabalho ainda não concluído.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que um Future representa?',
          choices: [
            { id: 'a', text: 'Um valor que estará disponível em algum momento no futuro, ainda não concluído' },
            { id: 'b', text: 'Um erro que já ocorreu' },
            { id: 'c', text: 'Uma thread já finalizada' },
            { id: 'd', text: 'Um valor sempre disponível imediatamente' }
          ],
          answer: 'a',
          explanation: 'Future representa um trabalho pendente, que será concluído no futuro.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o método poll faz, por baixo dos panos?',
          choices: [
            { id: 'a', text: 'Avança o Future, devolvendo "ainda não terminei" ou o resultado pronto' },
            { id: 'b', text: 'Cria um novo Future do zero' },
            { id: 'c', text: 'Cancela definitivamente o Future' },
            { id: 'd', text: 'Cria uma nova thread para o Future' }
          ],
          answer: 'a',
          explanation: 'poll é o mecanismo interno usado para avançar um Future.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o método que .await chama repetidamente por trás dos panos:',
          code: 'let resultado = buscar_dados().await; // por trás dos panos, chama ___ repetidamente',
          accept: ['poll'],
          explanation: 'poll é o método usado internamente para avançar o Future até sua conclusão.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um Future roda sozinho, sem mais nada?',
          choices: [
            { id: 'a', text: 'Não, é preciso um executor para de fato avançar os Futures até serem concluídos' },
            { id: 'b', text: 'Sim, todo Future roda automaticamente assim que é criado' },
            { id: 'c', text: 'Sim, mas só em programas de linha de comando' },
            { id: 'd', text: 'Não, Futures nunca podem ser concluídos' }
          ],
          answer: 'a',
          explanation: 'Um executor é necessário para efetivamente avançar e concluir um Future.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual crate é um exemplo comum de executor usado na prática?',
          choices: [
            { id: 'a', text: 'tokio' },
            { id: 'b', text: 'serde' },
            { id: 'c', text: 'rand' },
            { id: 'd', text: 'regex' }
          ],
          answer: 'a',
          explanation: 'tokio é uma das crates mais usadas como executor de código assíncrono em Rust.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que Rust não vem com um executor embutido na linguagem?',
          choices: [
            { id: 'a', text: 'Para permitir escolher o executor mais adequado a cada tipo de aplicação, deixando essa escolha para o ecossistema' },
            { id: 'b', text: 'Porque executors nunca foram implementados para Rust' },
            { id: 'c', text: 'Porque async/await não é realmente suportado por Rust' },
            { id: 'd', text: 'Porque isso tornaria o compilador mais lento' }
          ],
          answer: 'a',
          explanation: 'Deixar o executor para o ecossistema permite escolher a solução mais adequada a cada caso.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a crate usada como executor na anotação da função main:',
          code: '#[___::main]\nasync fn main() {\n    let resultado = buscar_dados().await;\n}',
          accept: ['tokio'],
          explanation: '#[tokio::main] configura o executor da crate tokio para a função main.'
        }
      ]
    },
    {
      id: 'rsa-12-send-sync',
      title: 'Send e Sync: os traits por trás da segurança entre threads',
      goal: 'Entender os dois traits marcadores que o compilador usa para garantir a segurança de dados entre threads.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando: por que Rc não é seguro para threads',
            body: 'Vimos, no nível intermediário, que Rc<T> não pode ser compartilhado entre threads, e que Arc<T> resolve isso — mas como o COMPILADOR sabe, automaticamente, que um tipo é ou não seguro para threads?'
          },
          {
            title: 'Send: pode ser movido para outra thread',
            body: 'Um tipo é Send se for seguro TRANSFERIR sua posse para outra thread — a grande maioria dos tipos é Send automaticamente; Rc<T> é uma das exceções notáveis, marcada como "não Send".'
          },
          {
            title: 'Sync: pode ser referenciado por várias threads',
            body: 'Um tipo é Sync se for seguro que VÁRIAS threads tenham uma referência (&T) a ele ao mesmo tempo — Mutex<T> é Sync (o próprio Mutex garante acesso exclusivo internamente); RefCell<T> não é.'
          },
          {
            title: 'Traits automáticos, implementados pelo compilador',
            body: 'Send e Sync não são implementados manualmente na maioria dos casos: o compilador os deriva automaticamente, olhando se TODOS os campos internos de um tipo já são Send/Sync — um único campo não-Send torna o tipo inteiro não-Send.'
          },
          {
            title: 'Por que isso é verificado em tempo de compilação',
            body: 'Quando você tenta usar um valor não-Send numa nova thread, ou compartilhar um valor não-Sync entre threads, o erro aparece na COMPILAÇÃO, não em produção — é exatamente esse mecanismo, por trás de Arc/Mutex, que sustenta a "fearless concurrency" vista no nível intermediário.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que Send indica sobre um tipo?',
          choices: [
            { id: 'a', text: 'Que é seguro transferir sua posse para outra thread' },
            { id: 'b', text: 'Que o tipo nunca pode ser copiado' },
            { id: 'c', text: 'Que o tipo é sempre imutável' },
            { id: 'd', text: 'Que o tipo implementa Iterator' }
          ],
          answer: 'a',
          explanation: 'Send indica que a posse do valor pode ser transferida com segurança para outra thread.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que Sync indica sobre um tipo?',
          choices: [
            { id: 'a', text: 'Que é seguro que várias threads tenham uma referência a ele ao mesmo tempo' },
            { id: 'b', text: 'Que o tipo nunca pode ser referenciado' },
            { id: 'c', text: 'Que o tipo só existe dentro de uma thread' },
            { id: 'd', text: 'Que o tipo implementa Drop automaticamente' }
          ],
          answer: 'a',
          explanation: 'Sync indica segurança no compartilhamento de referências entre threads.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que Rc<T> não é Send?',
          choices: [
            { id: 'a', text: 'Porque seu contador de referências não é seguro para ser movido/acessado entre threads sem proteção' },
            { id: 'b', text: 'Porque Rc<T> nunca pode ser clonado' },
            { id: 'c', text: 'Porque Rc<T> só existe dentro de closures' },
            { id: 'd', text: 'Rc<T> é, na verdade, Send por padrão' }
          ],
          answer: 'a',
          explanation: 'O contador interno do Rc não é protegido contra acesso concorrente entre threads.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o trait marcador que indica que um tipo pode ter sua posse transferida para outra thread:',
          code: 'Um tipo é ___ se for seguro transferir sua posse para outra thread',
          accept: ['Send'],
          explanation: 'Send é o trait marcador que garante segurança na transferência entre threads.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Mutex<T> é Sync?',
          choices: [
            { id: 'a', text: 'Sim, porque o próprio Mutex garante acesso exclusivo internamente, mesmo com várias referências' },
            { id: 'b', text: 'Não, Mutex nunca pode ser compartilhado entre threads' },
            { id: 'c', text: 'Só se T também for Send' },
            { id: 'd', text: 'Não, Sync não existe para tipos com mutação interior' }
          ],
          answer: 'a',
          explanation: 'Mutex garante exclusão mútua, o que o torna seguro para acesso concorrente (Sync).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como o compilador decide se um tipo é Send/Sync, na maioria dos casos?',
          choices: [
            { id: 'a', text: 'Automaticamente, olhando se todos os campos internos do tipo já são Send/Sync' },
            { id: 'b', text: 'Perguntando ao programador em tempo de execução' },
            { id: 'c', text: 'Nunca decide, é preciso implementar manualmente sempre' },
            { id: 'd', text: 'Baseado apenas no nome do tipo' }
          ],
          answer: 'a',
          explanation: 'Send e Sync são derivados automaticamente com base na composição interna do tipo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que acontece se um único campo de uma struct não for Send?',
          choices: [
            { id: 'a', text: 'A struct inteira deixa de ser Send automaticamente' },
            { id: 'b', text: 'Nada, os outros campos compensam automaticamente' },
            { id: 'c', text: 'A struct passa a ser Sync no lugar de Send' },
            { id: 'd', text: 'O programa entra em panic em tempo de execução' }
          ],
          answer: 'a',
          explanation: 'Um único campo não-Send torna o tipo composto inteiro não-Send.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o trait marcador que indica que várias threads podem referenciar um tipo ao mesmo tempo:',
          code: 'Um tipo é ___ se for seguro que várias threads tenham uma referência a ele ao mesmo tempo',
          accept: ['Sync'],
          explanation: 'Sync é o trait marcador que garante segurança no compartilhamento entre threads.'
        }
      ]
    },
    {
      id: 'rsa-08-macros',
      title: 'Macros declarativas',
      goal: 'Criar macros próprias com macro_rules!, gerando código repetitivo automaticamente.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando: macros já usadas',
            body: 'println!, vec! e assert_eq! são todas macros, reconhecíveis pelo ! no final — mas até agora só USAMOS macros prontas.'
          },
          {
            title: 'macro_rules!: criando sua própria macro',
            body: 'macro_rules! define uma nova macro declarativa, casando padrões de código (parecido com match, mas em cima de código-fonte, não de valores).',
            code: 'macro_rules! quadrado {\n    ($x:expr) => {\n        $x * $x\n    };\n}\n\nlet resultado = quadrado!(5); // 25'
          },
          {
            title: '$x:expr: capturando um pedaço de código',
            body: 'Dentro do padrão, $x:expr captura qualquer expressão passada para a macro, disponibilizando-a como $x no código gerado.'
          },
          {
            title: 'Por que macros existem, além de funções',
            body: 'Macros operam em tempo de COMPILAÇÃO, gerando código antes mesmo dele ser compilado de fato — permitem coisas que uma função comum não consegue, como aceitar um número variável de argumentos (como println!) ou gerar código repetitivo automaticamente.'
          },
          {
            title: 'Quando usar macro em vez de função',
            body: 'Na maioria dos casos, uma função comum já resolve; macros valem a pena quando você precisa gerar código repetitivo de forma flexível, ou aceitar uma sintaxe que uma função normal não permitiria.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que println!, vec! e assert_eq! têm em comum?',
          choices: [
            { id: 'a', text: 'São todas macros, reconhecíveis pelo ! no final' },
            { id: 'b', text: 'São todas structs' },
            { id: 'c', text: 'São todos traits da biblioteca padrão' },
            { id: 'd', text: 'São todas funções assíncronas' }
          ],
          answer: 'a',
          explanation: 'O ! ao final identifica uma chamada de macro em Rust.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que macro_rules! faz?',
          choices: [
            { id: 'a', text: 'Define uma nova macro declarativa, casando padrões de código' },
            { id: 'b', text: 'Executa código em tempo de execução, como uma função' },
            { id: 'c', text: 'Cria uma nova thread' },
            { id: 'd', text: 'Declara um novo trait' }
          ],
          answer: 'a',
          explanation: 'macro_rules! declara uma macro que casa padrões de código-fonte.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que $x:expr captura, dentro do padrão de uma macro?',
          choices: [
            { id: 'a', text: 'Qualquer expressão passada para a macro, disponibilizada como $x no código gerado' },
            { id: 'b', text: 'Apenas números inteiros' },
            { id: 'c', text: 'Apenas nomes de variáveis já existentes' },
            { id: 'd', text: 'Nada, é apenas um comentário' }
          ],
          answer: 'a',
          explanation: '$x:expr captura qualquer expressão passada como argumento da macro.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a macro usada para declarar uma nova macro:',
          code: '___! quadrado {\n    ($x:expr) => {\n        $x * $x\n    };\n}',
          accept: ['macro_rules'],
          explanation: 'macro_rules! é a construção usada para declarar macros declarativas.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quando macros operam, em relação à compilação do programa?',
          choices: [
            { id: 'a', text: 'Em tempo de compilação, gerando código antes mesmo dele ser compilado de fato' },
            { id: 'b', text: 'Somente em tempo de execução' },
            { id: 'c', text: 'Depois que o programa já terminou de rodar' },
            { id: 'd', text: 'Macros não têm nenhum momento de execução definido' }
          ],
          answer: 'a',
          explanation: 'Macros expandem código em tempo de compilação, antes da compilação final.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que macros conseguem fazer que uma função comum não consegue?',
          choices: [
            { id: 'a', text: 'Aceitar um número variável de argumentos, ou gerar código repetitivo automaticamente' },
            { id: 'b', text: 'Retornar um valor de qualquer tipo' },
            { id: 'c', text: 'Ser chamadas dentro de outra macro' },
            { id: 'd', text: 'Nada, macros e funções são idênticas' }
          ],
          answer: 'a',
          explanation: 'Macros podem gerar código flexível, incluindo número variável de argumentos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quando vale a pena usar uma macro em vez de uma função comum?',
          choices: [
            { id: 'a', text: 'Quando é preciso gerar código repetitivo de forma flexível, ou aceitar uma sintaxe que uma função normal não permitiria' },
            { id: 'b', text: 'Sempre, macros deveriam substituir todas as funções' },
            { id: 'c', text: 'Nunca, macros são sempre piores que funções' },
            { id: 'd', text: 'Apenas quando a função não tem nenhum parâmetro' }
          ],
          answer: 'a',
          explanation: 'Macros valem a pena em cenários específicos de geração de código flexível.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o valor passado para a macro, para que quadrado!(___) resulte em 25:',
          code: 'let resultado = quadrado!(___); // 25',
          accept: ['5'],
          explanation: 'quadrado!(5) expande para 5 * 5, resultando em 25.'
        }
      ]
    },
    {
      id: 'rsa-13-proc-macros',
      title: 'Macros procedurais',
      goal: 'Entender a diferença entre macros declarativas e procedurais, e como criar um #[derive] customizado.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando macro_rules!',
            body: 'Vimos macros declarativas, que casam padrões de código com macro_rules! — mas existe uma segunda categoria de macros, bem mais poderosa (e mais complexa): as macros procedurais.'
          },
          {
            title: 'O que diferencia uma macro procedural',
            body: 'Em vez de casar padrões fixos, uma macro procedural é, na prática, uma FUNÇÃO RUST que recebe código como entrada (na forma de tokens) e devolve código novo — dando controle total sobre o que é gerado.'
          },
          {
            title: 'Os três tipos de macro procedural',
            body: 'Derive customizado (permite criar seu próprio #[derive(MeuTrait)]), macros de atributo (como #[tokio::main], já visto), e macros do tipo função (que se parecem com macro_rules!, mas com o poder de uma função Rust por trás).'
          },
          {
            title: 'Um derive customizado na prática',
            body: 'Bibliotecas populares como serde usam macros procedurais para o famoso #[derive(Serialize, Deserialize)], que gera automaticamente, em tempo de compilação, todo o código de conversão de uma struct para formatos como JSON.',
            code: '#[derive(Serialize, Deserialize)]\nstruct Usuario {\n    nome: String,\n    idade: u32,\n}'
          },
          {
            title: 'Onde macros procedurais vivem',
            body: 'Diferente de macro_rules!, que pode ficar em qualquer crate normal, macros procedurais exigem uma crate própria, marcada com proc-macro = true no Cargo.toml — uma diferença de organização de projeto, não só de sintaxe.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a diferença central entre uma macro declarativa e uma procedural?',
          choices: [
            { id: 'a', text: 'A declarativa casa padrões fixos de código; a procedural é uma função Rust que recebe e devolve código, com controle total sobre a geração' },
            { id: 'b', text: 'Não há diferença nenhuma entre as duas' },
            { id: 'c', text: 'A procedural só pode ser usada dentro de testes' },
            { id: 'd', text: 'A declarativa é sempre mais poderosa que a procedural' }
          ],
          answer: 'a',
          explanation: 'Macros procedurais têm o poder de uma função Rust completa sobre o código gerado.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quais são os três tipos de macro procedural?',
          choices: [
            { id: 'a', text: 'Derive customizado, macros de atributo, e macros do tipo função' },
            { id: 'b', text: 'println!, vec! e format!' },
            { id: 'c', text: 'Send, Sync e Drop' },
            { id: 'd', text: 'Structs, enums e traits' }
          ],
          answer: 'a',
          explanation: 'Essas são as três categorias oficiais de macro procedural em Rust.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que #[derive(Serialize, Deserialize)], usado por bibliotecas como serde, faz?',
          choices: [
            { id: 'a', text: 'Gera automaticamente, em tempo de compilação, o código de conversão de uma struct para formatos como JSON' },
            { id: 'b', text: 'Remove a struct do programa final' },
            { id: 'c', text: 'Torna a struct thread-safe automaticamente' },
            { id: 'd', text: 'Converte a struct num enum' }
          ],
          answer: 'a',
          explanation: 'Serialize/Deserialize são exemplos clássicos de derive customizado via macro procedural.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o que uma macro procedural realmente é, por baixo dos panos:',
          code: 'Uma macro procedural é, na prática, uma ___ Rust que recebe código como entrada e devolve código novo',
          accept: ['função'],
          explanation: 'Macros procedurais são implementadas como funções Rust que processam tokens de código.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: '#[tokio::main], visto na lição de futures, é um exemplo de qual tipo de macro procedural?',
          choices: [
            { id: 'a', text: 'Uma macro de atributo' },
            { id: 'b', text: 'Um derive customizado' },
            { id: 'c', text: 'Uma macro do tipo função' },
            { id: 'd', text: 'Uma macro declarativa (macro_rules!)' }
          ],
          answer: 'a',
          explanation: '#[tokio::main] é uma macro de atributo, aplicada sobre a função main.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde macros procedurais precisam viver, diferente de macro_rules!?',
          choices: [
            { id: 'a', text: 'Numa crate própria, marcada com proc-macro = true no Cargo.toml' },
            { id: 'b', text: 'Em qualquer arquivo, sem nenhuma configuração especial' },
            { id: 'c', text: 'Apenas dentro de testes automatizados' },
            { id: 'd', text: 'Macros procedurais não podem ser distribuídas em crates' }
          ],
          answer: 'a',
          explanation: 'Macros procedurais exigem uma crate dedicada, configurada como proc-macro.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que macros procedurais são consideradas mais poderosas que macros declarativas?',
          choices: [
            { id: 'a', text: 'Porque têm o poder de uma função Rust completa, em vez de apenas casar padrões fixos' },
            { id: 'b', text: 'Porque rodam em tempo de execução, não de compilação' },
            { id: 'c', text: 'Porque não precisam de nenhuma configuração no Cargo.toml' },
            { id: 'd', text: 'Não são mais poderosas, é só uma questão de sintaxe' }
          ],
          answer: 'a',
          explanation: 'O poder de uma função Rust completa permite gerar código muito mais flexível.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a configuração exigida no Cargo.toml de uma crate de macros procedurais:',
          code: 'Macros procedurais exigem uma crate marcada com ___ = true no Cargo.toml',
          accept: ['proc-macro'],
          explanation: 'proc-macro = true identifica a crate como uma crate de macros procedurais.'
        }
      ]
    },
    {
      id: 'rsa-09-const-generics',
      title: 'Const generics',
      goal: 'Escrever tipos genéricos sobre um valor constante, não só sobre um tipo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Generics sobre tipo x generics sobre valor',
            body: 'Vimos generics como <T>, genéricos sobre um TIPO; const generics permitem ser genérico sobre um VALOR constante, como o tamanho de um array.'
          },
          {
            title: 'O problema que const generics resolvem',
            body: 'Antes de const generics, cada tamanho de array precisava, na prática, de uma implementação separada — [i32; 3] e [i32; 5] eram tratados como tipos totalmente diferentes, sem uma forma genérica de lidar com "um array de qualquer tamanho fixo".'
          },
          {
            title: '<const N: usize>',
            body: 'A sintaxe declara um parâmetro const genérico, um valor inteiro conhecido em tempo de compilação, que pode ser usado como tamanho de array dentro da struct/função.',
            code: 'struct Buffer<const N: usize> {\n    dados: [u8; N],\n}\n\nlet b: Buffer<4> = Buffer { dados: [0; 4] };'
          },
          {
            title: 'Continua sendo checado em tempo de compilação',
            body: 'Assim como generics sobre tipo, const generics são resolvidos e checados inteiramente em tempo de compilação — não há custo em tempo de execução para saber o tamanho N.'
          },
          {
            title: 'Onde isso aparece na prática',
            body: 'Arrays de tamanho fixo dentro de structs genéricas, e certas otimizações de bibliotecas matemáticas/gráficas, são os usos mais comuns de const generics no dia a dia.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a diferença entre um generic <T> e um const generic <const N: usize>?',
          choices: [
            { id: 'a', text: '<T> é genérico sobre um TIPO; <const N: usize> é genérico sobre um VALOR constante' },
            { id: 'b', text: 'Não há diferença nenhuma entre os dois' },
            { id: 'c', text: '<const N: usize> só pode ser usado em funções, nunca em structs' },
            { id: 'd', text: '<T> só aceita tipos numéricos' }
          ],
          answer: 'a',
          explanation: 'Const generics generalizam sobre um valor, enquanto generics comuns generalizam sobre um tipo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual problema const generics resolvem?',
          choices: [
            { id: 'a', text: 'A falta de uma forma genérica de lidar com arrays de tamanhos diferentes como o mesmo tipo abstrato' },
            { id: 'b', text: 'A necessidade de usar Vec em vez de arrays' },
            { id: 'c', text: 'A impossibilidade de criar traits' },
            { id: 'd', text: 'A falta de suporte a closures' }
          ],
          answer: 'a',
          explanation: 'Const generics permitem generalizar sobre o tamanho de arrays, antes tratados como tipos distintos.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Antes de const generics, [i32; 3] e [i32; 5] eram tratados como o quê?',
          choices: [
            { id: 'a', text: 'Tipos totalmente diferentes, sem relação genérica entre eles' },
            { id: 'b', text: 'Exatamente o mesmo tipo' },
            { id: 'c', text: 'Variantes de um mesmo enum' },
            { id: 'd', text: 'Erros de compilação' }
          ],
          answer: 'a',
          explanation: 'Sem const generics, cada tamanho de array era um tipo distinto, sem generalização.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave usada para declarar um parâmetro const genérico:',
          code: 'struct Buffer<___ N: usize> {\n    dados: [u8; N],\n}',
          accept: ['const'],
          explanation: 'const declara o parâmetro genérico como um valor, não um tipo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Const generics são resolvidos quando?',
          choices: [
            { id: 'a', text: 'Inteiramente em tempo de compilação' },
            { id: 'b', text: 'Somente em tempo de execução' },
            { id: 'c', text: 'Depois que o programa termina de rodar' },
            { id: 'd', text: 'Nunca são resolvidos, ficam sempre indefinidos' }
          ],
          answer: 'a',
          explanation: 'O valor do const generic é conhecido e checado em tempo de compilação.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Há custo em tempo de execução para saber o valor de N num const generic?',
          choices: [
            { id: 'a', text: 'Não, N é conhecido e resolvido em tempo de compilação' },
            { id: 'b', text: 'Sim, o programa precisa calcular N a cada execução' },
            { id: 'c', text: 'Sim, mas só em modo debug' },
            { id: 'd', text: 'Depende do tamanho do array' }
          ],
          answer: 'a',
          explanation: 'Const generics não têm custo em tempo de execução, assim como generics comuns.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde const generics costumam aparecer na prática?',
          choices: [
            { id: 'a', text: 'Arrays de tamanho fixo dentro de structs genéricas, e otimizações de bibliotecas matemáticas/gráficas' },
            { id: 'b', text: 'Apenas em código de rede assíncrono' },
            { id: 'c', text: 'Somente em macros declarativas' },
            { id: 'd', text: 'Nunca são usados na prática' }
          ],
          answer: 'a',
          explanation: 'Const generics são comuns em estruturas com tamanho fixo conhecido em compilação.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o valor usado para instanciar um Buffer com um array de 4 posições:',
          code: 'let b: Buffer<___> = Buffer { dados: [0; 4] };',
          accept: ['4'],
          explanation: 'O valor 4 é passado como o const generic N, definindo o tamanho do array.'
        }
      ]
    },
    {
      id: 'rsa-10-workspaces',
      title: 'Cargo workspaces e features',
      goal: 'Organizar um projeto Rust com múltiplos pacotes relacionados, e tornar partes do código opcionais.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Quando um único projeto não é suficiente',
            body: 'Projetos maiores costumam ser divididos em várias crates relacionadas (uma biblioteca principal, um binário que a usa, utilitários compartilhados) — gerenciar cada uma separadamente seria repetitivo.'
          },
          {
            title: 'O que é um workspace',
            body: 'Um workspace agrupa várias crates sob um único Cargo.toml raiz, compartilhando a mesma pasta de compilação (target) e permitindo compilar/testar tudo junto.',
            code: '[workspace]\nmembers = ["biblioteca", "cli"]'
          },
          {
            title: 'Dependências compartilhadas',
            body: 'Crates dentro do mesmo workspace podem depender umas das outras diretamente, sem precisar publicar nada — útil para separar responsabilidades dentro do mesmo projeto.'
          },
          {
            title: 'Features: partes opcionais de uma crate',
            body: 'Uma feature permite compilar uma crate com ou sem determinado pedaço de código (e suas dependências), habilitada explicitamente por quem usa a crate.',
            code: '[features]\nsuporte_json = ["dep:serde_json"]'
          },
          {
            title: 'Por que features importam para quem consome uma crate',
            body: 'Habilitar só as features realmente necessárias evita compilar código (e dependências) desnecessário, reduzindo o tempo de compilação e o tamanho final do binário.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que projetos maiores costumam ser divididos em várias crates?',
          choices: [
            { id: 'a', text: 'Para separar responsabilidades (biblioteca principal, binário, utilitários) em vez de manter tudo junto' },
            { id: 'b', text: 'Porque uma única crate nunca pode ter mais de um arquivo' },
            { id: 'c', text: 'Porque o compilador exige isso para qualquer projeto' },
            { id: 'd', text: 'Não há motivo real para dividir em várias crates' }
          ],
          answer: 'a',
          explanation: 'Dividir em crates ajuda a separar responsabilidades num projeto maior.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que um workspace agrupa?',
          choices: [
            { id: 'a', text: 'Várias crates sob um único Cargo.toml raiz, compartilhando a mesma pasta de compilação' },
            { id: 'b', text: 'Apenas testes automatizados' },
            { id: 'c', text: 'Somente arquivos de documentação' },
            { id: 'd', text: 'Uma única crate isolada' }
          ],
          answer: 'a',
          explanation: 'Um workspace organiza várias crates relacionadas sob uma raiz comum.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Crates dentro do mesmo workspace podem depender umas das outras sem publicar nada?',
          choices: [
            { id: 'a', text: 'Sim, é uma das vantagens práticas de um workspace' },
            { id: 'b', text: 'Não, toda dependência precisa vir de crates.io' },
            { id: 'c', text: 'Só se as duas crates tiverem o mesmo nome' },
            { id: 'd', text: 'Não é possível ter dependências entre crates de um workspace' }
          ],
          answer: 'a',
          explanation: 'Crates de um workspace podem depender diretamente umas das outras, sem publicação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a seção do Cargo.toml usada para declarar um workspace:',
          code: '[___]\nmembers = ["biblioteca", "cli"]',
          accept: ['workspace'],
          explanation: '[workspace] declara as crates que fazem parte do mesmo workspace.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que uma feature permite?',
          choices: [
            { id: 'a', text: 'Compilar uma crate com ou sem determinado pedaço de código, habilitado explicitamente por quem usa a crate' },
            { id: 'b', text: 'Executar testes automaticamente a cada commit' },
            { id: 'c', text: 'Criar uma nova crate dentro do workspace' },
            { id: 'd', text: 'Remover a necessidade de Cargo.toml' }
          ],
          answer: 'a',
          explanation: 'Features tornam partes do código de uma crate opcionais, habilitadas sob demanda.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que habilitar só as features necessárias é uma boa prática?',
          choices: [
            { id: 'a', text: 'Evita compilar código e dependências desnecessários, reduzindo tempo de compilação e tamanho do binário' },
            { id: 'b', text: 'Porque features desabilitadas geram erro de compilação' },
            { id: 'c', text: 'Porque toda crate exige pelo menos uma feature habilitada' },
            { id: 'd', text: 'Não há vantagem real nisso' }
          ],
          answer: 'a',
          explanation: 'Habilitar só o necessário reduz tempo de build e tamanho do binário final.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde as features de uma crate costumam ser declaradas?',
          choices: [
            { id: 'a', text: 'No arquivo Cargo.toml, numa seção própria' },
            { id: 'b', text: 'Dentro do código-fonte, em qualquer função' },
            { id: 'c', text: 'No arquivo README do projeto' },
            { id: 'd', text: 'Features não podem ser declaradas em lugar nenhum' }
          ],
          answer: 'a',
          explanation: 'Features são declaradas na seção [features] do Cargo.toml.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a seção do Cargo.toml usada para declarar features de uma crate:',
          code: '[___]\nsuporte_json = ["dep:serde_json"]',
          accept: ['features'],
          explanation: '[features] é a seção do Cargo.toml onde features opcionais são declaradas.'
        }
      ]
    }
  ]
};
