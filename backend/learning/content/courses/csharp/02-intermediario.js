// Módulo "Intermediário" de C# e .NET — primeira metade (19 lições, 8 questões cada: 3 múltipla
// escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a validação de
// boot. Mesmo padrão de ../containers/02-intermediario.js: helpers locais mcq (letra da resposta
// correta + 4 alternativas na ordem a, b, c, d), fill (prompt, código com UM ___, respostas aceitas;
// a 1ª é a canônica) e sl (slide com code opcional). C# moderno, sem citar números de versão.
// Segurança e privacidade (LGPD): nenhum dado pessoal real nos exemplos (nomes, e-mails e
// documentos são fictícios óbvios); segredos sempre como <placeholder>; lições sobre regex, E/S,
// JSON, configuração e logs tratam ReDoS, path traversal, desserialização não confiável, segredos
// fora do repositório e logs sem dados pessoais.
const mcq = (id, prompt, answer, texts, explanation) => ({
  id,
  kind: 'mcq',
  prompt,
  choices: texts.map((text, i) => ({ id: 'abcd'[i], text })),
  answer,
  explanation
});

const fill = (id, prompt, code, accept, explanation) => ({ id, kind: 'fill', prompt, code, accept, explanation });

const sl = (title, body, code) => (code ? { title, body, code } : { title, body });

module.exports = {
  id: 'intermediario-csharp',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Generics, async/await, LINQ avançado, concorrência, recursos, regex, JSON, injeção de dependência e Worker Services',
  accent: '#512bd4',
  lessons: [
    {
      id: 'csi-01-generics',
      title: 'Generics',
      goal: 'Escrever classes e métodos genéricos com constraints e entender por que eles dão segurança de tipos sem boxing.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que generics existem',
            'Antes dos generics, uma coleção "para qualquer tipo" guardava object. Isso obrigava a converter (cast) ao ler, deixava erros de tipo só para a execução e, com tipos de valor como int, causava boxing: o int era copiado para um objeto no heap e depois desempacotado (unboxing). Generics resolvem os três problemas: você escreve o código uma vez com um parâmetro de tipo e o compilador verifica o tipo real em cada uso, sem casts e sem boxing para tipos de valor.',
            'object o = 42;          // boxing: int vira objeto no heap\nint n = (int)o;         // unboxing + cast manual\n\nList<int> xs = new();   // generic: guarda int de verdade\nxs.Add(1);\nint primeiro = xs[0];   // sem cast, sem boxing\n// xs.Add("a");         // erro de COMPILAÇÃO'
          ),
          sl(
            'Classes genéricas',
            'Uma classe genérica declara um ou mais parâmetros de tipo entre < >, por convenção T (ou TChave, TValor quando há vários). Dentro da classe, T pode ser usado como tipo de campos, propriedades, parâmetros e retornos. Ao criar o objeto você informa o tipo real (Caixa<string>) e o compilador gera a versão tipada.',
            'class Caixa<T>\n{\n    public T Valor { get; }\n    public Caixa(T valor) => Valor = valor;\n}\n\nvar c = new Caixa<string>("oi");\nConsole.WriteLine(c.Valor.Length); // 2\nvar d = new Caixa<int>(7);\nConsole.WriteLine(d.Valor + 1);    // 8'
          ),
          sl(
            'Métodos genéricos e vários parâmetros de tipo',
            'Um método também pode ter parâmetros de tipo próprios, mesmo numa classe não genérica. Na chamada, o compilador normalmente infere T a partir dos argumentos, então você não precisa escrevê-lo. Um tipo ou método pode ter vários parâmetros, como Dictionary<TKey, TValue> ou o Par abaixo.',
            'static void Trocar<T>(ref T a, ref T b)\n{\n    (a, b) = (b, a);\n}\n\nint x = 1, y = 2;\nTrocar(ref x, ref y);      // T inferido como int\nConsole.WriteLine($"{x} {y}"); // 2 1\n\nrecord Par<TChave, TValor>(TChave Chave, TValor Valor);\nvar p = new Par<string, int>("idade", 30);\nConsole.WriteLine(p); // Par { Chave = idade, Valor = 30 }'
          ),
          sl(
            'Constraints: where T : ...',
            'Sem restrições, o compilador só sabe que T é "algum tipo", ou seja, só permite o que todo object permite. Uma constraint (where) diz o que T precisa ter, liberando operações. As principais: where T : class (tipo de referência), where T : struct (tipo de valor não anulável), where T : new() (tem construtor público sem parâmetros), where T : SomeBase (herda dessa classe), where T : IAlgo (implementa a interface) — por exemplo IComparable<T>, que dá o método CompareTo. Várias constraints se combinam, e new() vem sempre por último.',
            'static T Maior<T>(T a, T b) where T : IComparable<T>\n    => a.CompareTo(b) >= 0 ? a : b;\n\nConsole.WriteLine(Maior(3, 7));     // 7\nConsole.WriteLine(Maior("a", "b")); // b\n\nstatic T Criar<T>() where T : class, new() => new T();\nvar lista = Criar<List<int>>();\nConsole.WriteLine(lista.Count);     // 0'
          ),
          sl(
            'default(T) e coleções genéricas',
            'Como T pode ser qualquer tipo, você não pode escrever null nem 0 para "valor vazio". default (ou default(T)) devolve o valor padrão do tipo: 0 para int, false para bool, null para tipos de referência. As coleções do .NET (List<T>, Dictionary<TKey,TValue>, HashSet<T>, Queue<T>) são o exemplo diário de generics: tipadas, rápidas e sem boxing.',
            'static T? PrimeiroOuPadrao<T>(List<T> itens)\n    => itens.Count > 0 ? itens[0] : default;\n\nConsole.WriteLine(PrimeiroOuPadrao(new List<int>()));      // 0\nConsole.WriteLine(PrimeiroOuPadrao(new List<int> { 5 }));  // 5\nvar s = PrimeiroOuPadrao(new List<string>());\nConsole.WriteLine(s is null);                              // True'
          ),
          sl(
            'Covariância e contravariância (visão geral)',
            'List<string> NÃO é um List<object>, mesmo string sendo um object: se fosse, você poderia adicionar um int numa lista de strings. Genéricos são invariantes por padrão. Mas interfaces e delegates que só PRODUZEM T podem ser covariantes, declarados com out: IEnumerable<out T> permite tratar IEnumerable<string> como IEnumerable<object>. Os que só CONSOMEM T podem ser contravariantes, com in: Action<in T> permite usar um Action<object> onde se espera Action<string>. Você usará isso sem perceber; declarar out/in em interfaces próprias é raro.',
            'IEnumerable<string> textos = new List<string> { "a", "b" };\nIEnumerable<object> objetos = textos;   // OK: covariância (out T)\n\n// List<object> lo = new List<string>(); // ERRO: List<T> é invariante\n\nAction<object> imprimir = o => Console.WriteLine(o);\nAction<string> paraString = imprimir;   // OK: contravariância (in T)\nparaString("oi");                       // oi\n\ninterface IProdutor<out T> { T Obter(); }'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal vantagem de List<int> sobre guardar números num ArrayList (que usa object)?', 'b', [
          'List<int> é thread-safe e ArrayList não é',
          'Verificação de tipos em tempo de compilação, sem casts e sem boxing dos int',
          'List<int> aceita qualquer tipo de elemento',
          'ArrayList não permite remover elementos'
        ], 'Generics trazem segurança de tipos já na compilação e evitam boxing/unboxing para tipos de valor.'),
        mcq('q2', 'O que significa a constraint where T : struct?', 'd', [
          'T deve ter um construtor público sem parâmetros',
          'T deve ser uma classe qualquer',
          'T deve implementar IComparable<T>',
          'T deve ser um tipo de valor não anulável (como int ou DateTime)'
        ], 'struct restringe T a tipos de valor. class restringe a tipos de referência e new() exige construtor sem parâmetros.'),
        mcq('q3', 'O que o código imprime?\nstatic void Trocar<T>(ref T a, ref T b) { (a, b) = (b, a); }\nint x = 1, y = 2;\nTrocar(ref x, ref y);\nConsole.WriteLine($"{x} {y}");', 'a', [
          '2 1',
          '1 2',
          '2 2',
          'Não compila, pois T precisa ser informado'
        ], 'O método troca os valores e o compilador infere T como int pelos argumentos, então nada precisa ser escrito entre < >.'),
        fill('q4', 'Complete a constraint para que T tenha o método CompareTo.', 'static T Maior<T>(T a, T b) where T : ___<T>\n    => a.CompareTo(b) >= 0 ? a : b;', ['IComparable'], 'IComparable<T> declara CompareTo, que a constraint libera para o código genérico.'),
        mcq('q5', 'Por que static T Criar<T>() => new T(); não compila sem constraint?', 'c', [
          'Porque métodos genéricos não podem criar objetos',
          'Porque new só funciona com classes sealed',
          'O compilador não sabe se T tem construtor público sem parâmetros; é preciso where T : new()',
          'Porque T precisa herdar de object explicitamente'
        ], 'Sem a constraint new(), T poderia ser um tipo sem construtor acessível, então o compilador recusa.'),
        mcq('q6', 'Quais valores default(T) devolve para T = int e para T = string?', 'a', [
          '0 e null',
          'null e null',
          '0 e string vazia ("")',
          'Erro de compilação nos dois casos'
        ], 'default é 0 para tipos numéricos e null para tipos de referência; a string vazia não é o valor padrão de string.'),
        mcq('q7', 'Por que List<object> lo = new List<string>(); é recusado, enquanto IEnumerable<object> o = new List<string>(); é aceito?', 'd', [
          'IEnumerable é uma classe e List é uma interface',
          'string não herda de object',
          'O primeiro funciona, só o segundo dá erro',
          'List<T> é invariante (permite Add, o que quebraria a tipagem); IEnumerable<out T> é covariante porque só produz T'
        ], 'Se a conversão para List<object> fosse permitida, daria para adicionar um int numa lista de strings. Interfaces que só produzem T usam out e são covariantes.'),
        fill('q8', 'Qual palavra-chave declara T como covariante em uma interface?', 'interface IProdutor<___ T>\n{\n    T Obter();\n}', ['out'], 'out marca T como usado só em saída (retornos), permitindo covariância. in é o oposto, para contravariância.')
      ]
    },
    {
      id: 'csi-02-delegates-eventos',
      title: 'Delegates, eventos e closures',
      goal: 'Usar delegates, Func/Action e eventos no padrão EventHandler, e evitar as armadilhas das variáveis capturadas e dos vazamentos de assinatura.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Delegate: um tipo que representa métodos',
            'Um delegate é um tipo que descreve uma assinatura de método (parâmetros e retorno). Uma variável desse tipo guarda uma referência a qualquer método compatível e pode chamá-lo depois. É a base de callbacks, lambdas e LINQ. Na prática raramente você declara delegates próprios: usa os embutidos Func<..., TResult> (o ÚLTIMO tipo é o retorno), Action<...> (sem retorno) e Predicate<T> (retorna bool).',
            'delegate int Operacao(int a, int b);\n\nstatic int Soma(int a, int b) => a + b;\n\nOperacao op = Soma;\nConsole.WriteLine(op(2, 3));        // 5\n\nFunc<int, int, int> mult = (a, b) => a * b; // Func: último tipo = retorno\nAction<string> falar = s => Console.WriteLine(s);\nConsole.WriteLine(mult(4, 5));      // 20\nfalar("oi");                        // oi'
          ),
          sl(
            'Delegates multicast',
            'Um delegate pode guardar vários métodos ao mesmo tempo. += acrescenta um método à lista de invocação e -= remove. Ao chamar o delegate, os métodos rodam em sequência, na ordem em que foram adicionados. Se o delegate tiver retorno, só o valor do último é devolvido, e uma exceção em um método interrompe os seguintes.',
            'static void A() => Console.Write("A");\nstatic void B() => Console.Write("B");\n\nAction acao = A;\nacao += B;\nacao += A;\nacao();        // ABA\nConsole.WriteLine();\nacao -= A;     // remove a ocorrência mais recente de A\nacao();        // AB'
          ),
          sl(
            'Eventos e o padrão EventHandler',
            'Um evento é um delegate protegido: serve para o publicador avisar quem se inscreveu. O padrão do .NET usa EventHandler<TEventArgs>, cujo método tem dois parâmetros: o remetente (object? sender) e os dados do evento (um tipo que herda de EventArgs). O publicador declara com a palavra event; os assinantes usam += para se inscrever e -= para sair. Para disparar, use ?.Invoke(...): o ?. evita NullReferenceException quando ninguém assinou.',
            'class AlarmeArgs : EventArgs { public int Nivel { get; init; } }\n\nclass Sensor\n{\n    public event EventHandler<AlarmeArgs>? Alarme;\n    public void Medir(int n)\n    {\n        if (n > 5) Alarme?.Invoke(this, new AlarmeArgs { Nivel = n });\n    }\n}\n\nvar s = new Sensor();\ns.Alarme += (remetente, e) => Console.WriteLine($"nivel {e.Nivel}");\ns.Medir(3);  // (nada)\ns.Medir(9);  // nivel 9'
          ),
          sl(
            'Por que event e não um campo delegate público',
            'Se o campo for um delegate público, qualquer código externo pode invocá-lo, trocar toda a lista com = ou zerá-la com null — derrubando os outros assinantes. Com a palavra event, de fora da classe só são permitidos += e -=; invocar e atribuir ficam restritos à classe dona. Isso é encapsulamento: o publicador controla QUANDO o evento ocorre; os assinantes apenas reagem.',
            'public Action<string>? AoMudar;        // qualquer um pode: x.AoMudar = null; x.AoMudar("falso")\npublic event Action<string>? AoMudarSeguro; // de fora: só += e -='
          ),
          sl(
            'Closures e variáveis capturadas',
            'Uma lambda pode usar variáveis locais do método onde nasceu: isso é uma closure. O que ela captura é a VARIÁVEL, não uma cópia do valor no momento. A armadilha clássica está no for: a variável i é UMA só para o laço inteiro, então todas as lambdas veem o valor final. No foreach, cada iteração tem uma variável nova, então funciona como esperado. A correção no for é copiar i para uma variável local dentro do corpo.',
            'var acoes = new List<Action>();\nfor (int i = 0; i < 3; i++) acoes.Add(() => Console.Write(i + " "));\nforeach (var a in acoes) a();   // 3 3 3\nConsole.WriteLine();\n\nvar acoes2 = new List<Action>();\nforeach (var n in new[] { 0, 1, 2 }) acoes2.Add(() => Console.Write(n + " "));\nforeach (var a in acoes2) a();  // 0 1 2\nConsole.WriteLine();\n\nvar acoes3 = new List<Action>();\nfor (int i = 0; i < 3; i++) { int copia = i; acoes3.Add(() => Console.Write(copia + " ")); }\nforeach (var a in acoes3) a();  // 0 1 2'
          ),
          sl(
            'Vazamento de memória por assinaturas esquecidas',
            'Quando um objeto assina um evento, o PUBLICADOR passa a guardar uma referência para o assinante (através do delegate). Se o publicador vive muito tempo (um serviço singleton, um evento estático) e o assinante deveria ter morrido, o coletor de lixo não consegue liberá-lo: vazamento de memória, e ainda por cima o handler continua sendo executado. A defesa é cancelar a inscrição com -= quando o assinante não precisa mais (por exemplo, no Dispose). Note que -= só remove se for o MESMO método; uma lambda anônima nova não é igual à anterior, então guarde o handler numa variável ou use um método nomeado.',
            'class Tela : IDisposable\n{\n    private readonly Sensor _sensor;\n    public Tela(Sensor s) { _sensor = s; _sensor.Alarme += AoAlarme; }\n    private void AoAlarme(object? o, AlarmeArgs e) { /* atualiza a tela */ }\n    public void Dispose() => _sensor.Alarme -= AoAlarme; // sem isso, Sensor mantém Tela viva\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual método é compatível com Func<int, string>?', 'c', [
          'void M(int x)',
          'int M(string x)',
          'string M(int x)',
          'bool M(int x, string y)'
        ], 'Em Func, o último tipo é o retorno: recebe int e devolve string. Action seria o delegate sem retorno.'),
        mcq('q2', 'Por que se escreve Alarme?.Invoke(this, args) para disparar um evento?', 'a', [
          'Para não lançar NullReferenceException quando ninguém se inscreveu no evento',
          'Para que o evento rode em outra thread',
          'Para que o evento seja executado só uma vez',
          'Porque Invoke só existe com o operador ?.'
        ], 'Um evento sem assinantes é null. O ?. só chama Invoke se houver pelo menos um handler.'),
        mcq('q3', 'O que imprime?\nstatic void A() => Console.Write("A");\nstatic void B() => Console.Write("B");\nAction acao = A;\nacao += B;\nacao += A;\nacao();', 'b', [
          'AB',
          'ABA',
          'BAA',
          'A'
        ], 'Um delegate multicast executa os métodos na ordem em que foram adicionados: A, B, A.'),
        fill('q4', 'Que palavra-chave declara um evento no publicador?', 'public ___ EventHandler<AlarmeArgs>? Alarme;', ['event'], 'event restringe o acesso: de fora só se pode inscrever (+=) e cancelar (-=).'),
        mcq('q5', 'O que imprime?\nvar acoes = new List<Action>();\nfor (int i = 0; i < 3; i++) acoes.Add(() => Console.Write(i + " "));\nforeach (var a in acoes) a();', 'd', [
          '0 1 2',
          '1 2 3',
          'Nada, pois a lambda não pode usar i',
          '3 3 3'
        ], 'Todas as lambdas capturam a MESMA variável i do for; quando são chamadas, o laço já terminou e i vale 3.'),
        mcq('q6', 'Qual a vantagem de event em relação a um campo delegate público?', 'c', [
          'O event é mais rápido de invocar',
          'O event permite mais de um assinante, o campo não',
          'De fora da classe só se pode inscrever e cancelar; invocar ou substituir a lista é exclusivo do publicador',
          'O event não precisa de delegate'
        ], 'Delegates comuns também são multicast. O diferencial do event é o encapsulamento do disparo e da lista.'),
        mcq('q7', 'Uma tela assina um evento de um serviço singleton e nunca faz -=. Qual o efeito provável?', 'b', [
          'O evento deixa de funcionar para os demais assinantes',
          'A tela não é coletada pelo GC, pois o serviço guarda referência a ela, e o handler continua rodando',
          'O compilador gera erro',
          'Nada, o GC remove assinaturas automaticamente'
        ], 'Quem publica referencia o assinante via delegate. Sem -=, o objeto fica vivo (vazamento) enquanto o publicador viver.'),
        fill('q8', 'Que operador cancela a inscrição de um handler?', 's.Alarme ___ AoAlarme;', ['-='], '-= remove o handler da lista do evento (desde que seja o mesmo método).')
      ]
    },
    {
      id: 'csi-03-linq-avancado',
      title: 'LINQ avançado',
      goal: 'Agrupar, juntar e achatar sequências, paginar, e entender execução adiada, múltipla enumeração e IQueryable.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'GroupBy',
            'GroupBy agrupa os elementos por uma chave e devolve uma sequência de IGrouping<TKey, TElement>: cada grupo tem a propriedade Key e é, ele próprio, uma sequência dos elementos do grupo. É a base de relatórios do tipo "total por categoria". Os grupos aparecem na ordem em que a chave surgiu pela primeira vez.',
            'var palavras = new[] { "uva", "maca", "pera", "kiwi", "figo" };\nforeach (var g in palavras.GroupBy(p => p.Length))\n    Console.WriteLine($"{g.Key}: {string.Join(",", g)}");\n// 3: uva\n// 4: maca,pera,kiwi,figo'
          ),
          sl(
            'Join e GroupJoin',
            'Join é o INNER JOIN do SQL: recebe a outra sequência, o seletor de chave de cada lado e o resultado; produz um par por correspondência (quem não casa some). GroupJoin é o parente do LEFT JOIN: para CADA elemento da esquerda entrega a coleção (possivelmente vazia) dos elementos que casam, o que facilita totais por item.',
            'var clientes = new[] { new { Id = 1, Nome = "Ana" }, new { Id = 2, Nome = "Bia" } };\nvar pedidos = new[] {\n    new { ClienteId = 1, Total = 10 }, new { ClienteId = 1, Total = 5 },\n    new { ClienteId = 2, Total = 7 } };\n\nvar r = clientes.Join(pedidos, c => c.Id, p => p.ClienteId,\n    (c, p) => $"{c.Nome}:{p.Total}");\nConsole.WriteLine(string.Join(" ", r)); // Ana:10 Ana:5 Bia:7\n\nvar gj = clientes.GroupJoin(pedidos, c => c.Id, p => p.ClienteId,\n    (c, ps) => $"{c.Nome}={ps.Sum(p => p.Total)}");\nConsole.WriteLine(string.Join(" ", gj)); // Ana=15 Bia=7'
          ),
          sl(
            'SelectMany, Aggregate e Zip',
            'SelectMany projeta cada elemento numa sequência e ACHATA tudo em uma só (lista de listas vira lista simples). Aggregate é um "fold": acumula um resultado a partir de um valor inicial e uma função (acumulador, elemento). Zip pareia elementos de duas sequências na mesma posição e para na mais curta.',
            'var listas = new[] { new[] { 1, 2 }, new[] { 3 }, new[] { 4, 5 } };\nConsole.WriteLine(string.Join(",", listas.SelectMany(x => x)));      // 1,2,3,4,5\n\nvar soma = new[] { 1, 2, 3, 4 }.Aggregate(0, (acc, x) => acc + x * x);\nConsole.WriteLine(soma);                                            // 30\n\nvar z = new[] { 1, 2, 3 }.Zip(new[] { "a", "b" }, (n, s) => n + s);\nConsole.WriteLine(string.Join(",", z));                             // 1a,2b'
          ),
          sl(
            'Distinct, Skip/Take, Chunk e dicionários',
            'Distinct remove duplicatas. Skip(n) descarta n elementos e Take(n) pega n: juntos fazem a paginação, com Skip((pagina - 1) * tamanho).Take(tamanho). Chunk(n) divide a sequência em blocos de até n elementos (o último pode ser menor). ToDictionary monta um dicionário e LANÇA exceção se a chave se repetir; ToLookup aceita chaves repetidas, guardando vários valores por chave.',
            'var n = Enumerable.Range(1, 10);\nConsole.WriteLine(string.Join(",", n.Skip(3).Take(3)));  // 4,5,6\nint pagina = 3, tamanho = 4;\nConsole.WriteLine(string.Join(",", n.Skip((pagina - 1) * tamanho).Take(tamanho))); // 9,10\nforeach (var bloco in n.Chunk(4))\n    Console.WriteLine(bloco.Length);                     // 4, 4, 2\n\nvar lk = new[] { "ab", "ac", "b" }.ToLookup(s => s[0]);\nConsole.WriteLine(lk[\'a\'].Count());                      // 2'
          ),
          sl(
            'Execução adiada vs imediata',
            'Operadores como Where, Select, OrderBy não executam ao serem chamados: só montam a consulta, que roda quando você ENUMERA (foreach, ToList, Count, First...). Por isso a consulta enxerga alterações feitas na fonte depois de criada, e cada enumeração REFAZ o trabalho (múltipla enumeração: pode repetir efeitos colaterais, consultas ao banco e custo). Métodos como ToList, ToArray, ToDictionary, Count e Sum executam na hora; use ToList para "congelar" o resultado quando for percorrê-lo mais de uma vez.',
            'var lista = new List<int> { 1, 2, 3 };\nvar q = lista.Where(x => x > 1);   // ainda não rodou\nlista.Add(4);\nConsole.WriteLine(q.Count());      // 3  (2, 3, 4)\n\nvar snap = lista.Where(x => x > 1).ToList(); // imediato\nlista.Add(5);\nConsole.WriteLine(snap.Count);     // 3  (já congelado)'
          ),
          sl(
            'IEnumerable vs IQueryable e custo',
            'Sobre IEnumerable<T>, o LINQ recebe lambdas comuns (Func) e roda na memória. Sobre IQueryable<T> (usado por ORMs como o Entity Framework), as lambdas viram ÁRVORES DE EXPRESSÃO (Expression<Func<...>>): dados que descrevem o código e que o provedor traduz para SQL, filtrando no banco. Armadilha: chamar ToList/AsEnumerable antes do Where traz a tabela inteira para a memória e filtra depois. Outras: Count() > 0 percorre tudo (prefira Any()), Contains em List é O(n) dentro de um Where (use HashSet) e OrderBy ordena a sequência toda mesmo que você só queira o primeiro.',
            '// ruim: traz TODOS os pedidos e filtra na memória\nvar ruim = db.Pedidos.ToList().Where(p => p.Total > 100);\n\n// bom: o filtro vira SQL (WHERE Total > 100)\nvar bom = db.Pedidos.Where(p => p.Total > 100).ToList();'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que GroupBy(p => p.Length) devolve?', 'b', [
          'Um Dictionary<int, string>',
          'Uma sequência de grupos (IGrouping), cada um com Key e os elementos do grupo',
          'Uma lista única com os elementos ordenados',
          'Apenas as chaves distintas'
        ], 'Cada IGrouping tem a Key e é enumerável com os elementos que compartilham a chave.'),
        mcq('q2', 'Qual a diferença entre Join e GroupJoin?', 'c', [
          'Join é adiado e GroupJoin é imediato',
          'GroupJoin só funciona com IQueryable',
          'Join gera um resultado por par que casa; GroupJoin entrega, para cada elemento da esquerda, a coleção dos que casam (mesmo vazia)',
          'Não há diferença'
        ], 'Join se comporta como INNER JOIN; GroupJoin, como LEFT JOIN agrupado por elemento da esquerda.'),
        mcq('q3', 'O que imprime?\nvar z = new[] { 1, 2, 3 }.Zip(new[] { 10, 20 }, (a, b) => a + b);\nConsole.WriteLine(string.Join(",", z));', 'd', [
          '11,22,3',
          '11,22,13',
          'Lança exceção por tamanhos diferentes',
          '11,22'
        ], 'Zip para ao fim da sequência mais curta, descartando o 3 sem par.'),
        fill('q4', 'Qual operador acumula um resultado a partir de um valor inicial?', 'var soma = Enumerable.Range(1, 4).___(0, (acc, x) => acc + x);', ['Aggregate'], 'Aggregate faz o fold: acc começa em 0 e vai somando cada elemento (resultado 10).'),
        mcq('q5', 'Para mostrar a página 3 de uma listagem com 10 itens por página, qual a forma correta?', 'a', [
          'itens.Skip(20).Take(10)',
          'itens.Skip(30).Take(10)',
          'itens.Take(30).Skip(10)',
          'itens.Skip(3).Take(10)'
        ], 'Pula-se (pagina - 1) * tamanho = 20 itens e pegam-se 10.'),
        mcq('q6', 'O que imprime?\nvar lista = new List<int> { 1, 2, 3 };\nvar q = lista.Where(x => x > 1);\nlista.Add(4);\nConsole.WriteLine(q.Count());', 'b', [
          '2',
          '3',
          '4',
          '0'
        ], 'Where é adiado: a consulta só roda em Count(), quando a lista já tem 4, e passam 2, 3 e 4.'),
        mcq('q7', 'Por que db.Pedidos.ToList().Where(p => p.Total > 100) é uma má ideia com um ORM?', 'c', [
          'Where não funciona depois de ToList',
          'O resultado ficará errado',
          'ToList traz todos os pedidos para a memória e só então filtra, em vez de o banco aplicar o WHERE',
          'ToList converte a consulta em IQueryable'
        ], 'Sobre IQueryable, o Where vira SQL. Materializar antes joga o filtro para a memória do aplicativo.'),
        fill('q8', 'Que método agrupa por chave aceitando chaves repetidas, sem lançar exceção como ToDictionary?', 'var porInicial = nomes.___(n => n[0]);', ['ToLookup'], 'ToLookup guarda vários valores por chave; ToDictionary lança ArgumentException em chave duplicada.')
      ]
    },
    {
      id: 'csi-04-iteradores-yield',
      title: 'Iteradores e yield',
      goal: 'Criar sequências preguiçosas com yield return, entender o foreach por baixo e saber quando escrever coleções próprias.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'IEnumerable, IEnumerator e o foreach por baixo',
            'IEnumerable<T> é o contrato "sei fornecer um enumerador"; seu único método, GetEnumerator(), devolve um IEnumerator<T>. O enumerador tem MoveNext() (avança e diz se ainda há elemento) e Current (o elemento atual). O foreach nada mais é que açúcar sintático sobre isso: chama GetEnumerator uma vez, repete MoveNext até dar false, lendo Current a cada volta, e descarta o enumerador no fim. Qualquer tipo com um GetEnumerator compatível funciona em foreach.',
            '// foreach (var x in colecao) Console.Write(x);\n// equivale, em essência, a:\nusing var e = colecao.GetEnumerator();\nwhile (e.MoveNext())\n{\n    var x = e.Current;\n    Console.Write(x);\n}'
          ),
          sl(
            'yield return: o compilador escreve o enumerador',
            'Escrever um enumerador à mão é trabalhoso (uma máquina de estados). Um método que devolve IEnumerable<T> e contém yield return é um iterador: o compilador gera o enumerador para você. Cada yield return entrega um elemento ao consumidor e PAUSA o método naquele ponto, com as variáveis locais preservadas; quando o consumidor pede o próximo, a execução continua logo depois do yield.',
            'static IEnumerable<int> Pares(int max)\n{\n    for (int i = 0; i <= max; i += 2)\n        yield return i;\n}\n\nforeach (var p in Pares(6))\n    Console.Write(p + " ");   // 0 2 4 6'
          ),
          sl(
            'Avaliação preguiçosa',
            'Chamar um método iterador NÃO executa o corpo: apenas cria o objeto da sequência. O código só roda, pedaço por pedaço, a cada MoveNext do consumidor, até o próximo yield return. Isso permite processar fluxos grandes sem guardar tudo na memória e parar cedo (por exemplo com Take ou First). Também significa que o trabalho acontece de forma intercalada com o do consumidor, como a saída abaixo mostra.',
            'static IEnumerable<int> Conta()\n{\n    Console.WriteLine("inicio");\n    yield return 1;\n    Console.WriteLine("meio");\n    yield return 2;\n    Console.WriteLine("fim");\n}\n\nvar seq = Conta();          // nada impresso ainda\nConsole.WriteLine("criada");\nforeach (var n in seq)\n    Console.WriteLine($"recebi {n}");\n// criada, inicio, recebi 1, meio, recebi 2, fim'
          ),
          sl(
            'yield break e sequências infinitas',
            'yield break encerra a sequência imediatamente (como um "return" do iterador, sem valor). Como a produção é preguiçosa, é seguro escrever sequências INFINITAS: um while (true) com yield return só avança quando alguém pede o próximo elemento. O consumidor é quem limita, por exemplo com Take(n).',
            'static IEnumerable<int> Fibonacci()\n{\n    int a = 0, b = 1;\n    while (true)\n    {\n        yield return a;\n        (a, b) = (b, a + b);\n    }\n}\n\nConsole.WriteLine(string.Join(",", Fibonacci().Take(8)));  // 0,1,1,2,3,5,8,13\n\nstatic IEnumerable<int> Ate(IEnumerable<int> fonte, int limite)\n{\n    foreach (var x in fonte)\n    {\n        if (x > limite) yield break;   // encerra a sequência\n        yield return x;\n    }\n}'
          ),
          sl(
            'Armadilha: validação de argumentos adiada',
            'Como o corpo só roda na primeira enumeração, um throw colocado no início do iterador NÃO dispara quando você chama o método, e sim bem depois, quando alguém começa a percorrer — longe da causa. A solução é separar: um método comum valida na hora e devolve o iterador privado.',
            'static IEnumerable<int> Ate(int n)\n{\n    if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));\n    for (int i = 0; i <= n; i++) yield return i;\n}\n\nvar s = Ate(-1);         // não lança nada aqui!\n// foreach (var x in s)  // só aqui lançaria\n\n// correção: validar num método normal\nstatic IEnumerable<int> AteSeguro(int n)\n{\n    if (n < 0) throw new ArgumentOutOfRangeException(nameof(n)); // imediato\n    return Interno(n);\n}\nstatic IEnumerable<int> Interno(int n) { for (int i = 0; i <= n; i++) yield return i; }'
          ),
          sl(
            'Coleções próprias, mutação e IAsyncEnumerable',
            'Para uma classe aceitar foreach basta ter GetEnumerator; o jeito comum é implementar IEnumerable<T> e escrever o GetEnumerator com yield (a interface não genérica IEnumerable também exige sua versão, que apenas delega). Só vale criar uma coleção própria quando a estrutura ou a ordem de percurso é especial (uma árvore, um grafo, um buffer circular); se você só guarda itens, exponha List<T> ou IReadOnlyList<T>. Cuidado: alterar uma List durante o foreach lança InvalidOperationException (a coleção "mudou"). Para sequências assíncronas existe IAsyncEnumerable<T> com await foreach, visto na lição de async/await.',
            'class Playlist : IEnumerable<string>\n{\n    private readonly List<string> _musicas = new();\n    public void Add(string m) => _musicas.Add(m);\n\n    public IEnumerator<string> GetEnumerator()\n    {\n        foreach (var m in _musicas) yield return m;\n    }\n    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();\n}\n\nvar pl = new Playlist { "A", "B" };\nforeach (var m in pl) Console.Write(m);   // AB\n\nvar l = new List<int> { 1, 2, 3 };\n// foreach (var x in l) l.Add(x);  // InvalidOperationException'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o foreach faz por baixo?', 'd', [
          'Copia a coleção inteira para um array e percorre o array',
          'Usa um índice de 0 a Count - 1 em qualquer coleção',
          'Cria uma thread para cada elemento',
          'Chama GetEnumerator() e repete MoveNext(), lendo Current a cada volta'
        ], 'O foreach é açúcar sobre o padrão enumerador: GetEnumerator, MoveNext e Current.'),
        mcq('q2', 'O que imprime?\nstatic IEnumerable<int> Conta()\n{\n    Console.Write("A");\n    yield return 1;\n    Console.Write("B");\n    yield return 2;\n}\nvar s = Conta();\nConsole.Write("C");\nforeach (var n in s) Console.Write(n);', 'a', [
          'CA1B2',
          'AB12C',
          'A1B2C',
          'AC1B2'
        ], 'Chamar Conta() não executa o corpo. Imprime C, e depois, a cada MoveNext, o corpo avança: A, 1, B, 2.'),
        mcq('q3', 'Por que Fibonacci().Take(8) termina mesmo com while (true) no iterador?', 'c', [
          'Porque o compilador detecta o laço infinito e o corta',
          'Porque while (true) dentro de iterador é ignorado',
          'Porque a produção é preguiçosa: só gera um elemento quando o consumidor pede, e Take para de pedir após 8',
          'Porque Take roda o iterador em outra thread e a mata'
        ], 'O iterador pausa em cada yield return. Sem um consumidor pedindo mais, ele nunca avança.'),
        fill('q4', 'Que palavra-chave entrega um elemento e pausa o iterador?', 'static IEnumerable<int> Contar()\n{\n    for (int i = 1; i <= 3; i++)\n        ___ return i;\n}', ['yield'], 'yield return entrega o valor ao consumidor e guarda o estado para continuar no próximo MoveNext.'),
        mcq('q5', 'O que uma classe precisa ter para ser usada em um foreach?', 'b', [
          'Implementar IDisposable',
          'Um método GetEnumerator (em geral ao implementar IEnumerable<T>, escrito com yield)',
          'Uma propriedade Count e um indexador',
          'Herdar de List<T>'
        ], 'O foreach procura GetEnumerator. Implementar IEnumerable<T> é o caminho padrão e o yield simplifica a escrita.'),
        mcq('q6', 'static IEnumerable<int> Ate(int n)\n{\n    if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));\n    for (int i = 0; i <= n; i++) yield return i;\n}\nvar s = Ate(-1);\nQuando a exceção é lançada?', 'd', [
          'Na linha var s = Ate(-1);',
          'Nunca, o yield suprime exceções',
          'Em tempo de compilação',
          'Só quando a sequência começa a ser enumerada (primeiro MoveNext), não na chamada'
        ], 'O corpo do iterador só executa na enumeração. Para validar na hora, separe a validação em um método normal.'),
        mcq('q7', 'O que acontece ao chamar lista.Add dentro de um foreach sobre a própria lista?', 'a', [
          'InvalidOperationException, pois a coleção foi modificada durante a enumeração',
          'O novo elemento também é percorrido',
          'O elemento é ignorado em silêncio',
          'Erro de compilação'
        ], 'O enumerador da List detecta a alteração (versão da coleção) e lança InvalidOperationException.'),
        fill('q8', 'Que instrução encerra a sequência de um iterador sem devolver mais elementos?', 'foreach (var x in fonte)\n{\n    if (x > limite) yield ___;\n    yield return x;\n}', ['break'], 'yield break termina o iterador, fazendo MoveNext devolver false.')
      ]
    },
    {
      id: 'csi-05-async-await',
      title: 'Programação assíncrona com async/await',
      goal: 'Escrever código assíncrono correto: Task, await, WhenAll, cancelamento, exceções e a prevenção de deadlocks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que assíncrono: I/O não deve bloquear threads',
            'Ler um arquivo, chamar uma API ou consultar um banco gasta quase todo o tempo ESPERANDO o dispositivo ou a rede, não calculando. Se a thread fica parada esperando (bloqueada), ela é desperdiçada: um servidor com milhares de requisições esgotaria suas threads. Com async/await, ao chegar num await que ainda não terminou, o método devolve a thread ao pool e retoma depois, quando a operação acaba, possivelmente em outra thread. Resultado: o mesmo número de threads atende muito mais trabalho, e a interface de usuário não congela.',
            '// bloqueante: a thread espera parada\nstring a = File.ReadAllText("dados.txt");\n\n// assíncrono: a thread é liberada durante a espera\nstring b = await File.ReadAllTextAsync("dados.txt");'
          ),
          sl(
            'Task, Task<T>, async e await',
            'Task representa uma operação que terminará (sem valor) e Task<T> uma que terminará produzindo um T. Um método marcado async pode usar await, que "desembrulha" o resultado: await Task<int> produz um int. A convenção é terminar o nome com Async. O tipo de retorno deve ser Task ou Task<T> (ou ValueTask<T> em casos de alto desempenho). Evite async void: o chamador não consegue aguardar nem capturar exceções, que podem derrubar o processo. A única exceção são os manipuladores de evento, cuja assinatura exige void.',
            'static async Task<int> ContarCaracteresAsync(string caminho)\n{\n    string texto = await File.ReadAllTextAsync(caminho);\n    return texto.Length;               // devolve int, o método retorna Task<int>\n}\n\nstatic async Task SalvarAsync(string c, string t)   // sem valor: Task, nunca async void\n{\n    await File.WriteAllTextAsync(c, t);\n}\n\nint n = await ContarCaracteresAsync("dados.txt");'
          ),
          sl(
            'Task.WhenAll, WhenAny e Delay',
            'Para rodar operações em paralelo, INICIE todas primeiro (guardando as tasks) e só depois aguarde. Task.WhenAll espera todas e devolve os resultados na ordem original; Task.WhenAny devolve a primeira que terminar (útil para timeout). Task.Delay é o "sleep" assíncrono: espera sem bloquear thread. Aguardar uma a uma (await a; await b;) é sequencial: soma os tempos.',
            'static async Task<int> DobroAsync(int x)\n{\n    await Task.Delay(100);\n    return x * 2;\n}\n\nvar t1 = DobroAsync(1);\nvar t2 = DobroAsync(2);\nvar t3 = DobroAsync(3);               // as 3 já estão em andamento\nint[] r = await Task.WhenAll(t1, t2, t3);\nConsole.WriteLine(string.Join(",", r));   // 2,4,6  (~100 ms, não 300)\n\nvar rapida = await Task.WhenAny(Task.Delay(500), Task.Delay(50));  // a de 50 ms'
          ),
          sl(
            'Task.Run: async não significa "outra thread"',
            'async/await NÃO cria threads por si: ele só organiza a espera por operações que já são assíncronas (I/O). Para trabalho que consome CPU (calcular hash de muitos dados, processar imagem), awaitar não ajuda: a CPU fica ocupada na thread atual. Use Task.Run para empurrar esse trabalho para uma thread do pool, mantendo, por exemplo, a interface livre. Não envolva I/O em Task.Run: isso só gasta uma thread à toa.',
            'static long SomaPesada(int n)          // CPU-bound\n{\n    long s = 0;\n    for (int i = 0; i < n; i++) s += i;\n    return s;\n}\n\nlong total = await Task.Run(() => SomaPesada(100_000_000));\nConsole.WriteLine(total > 0);   // True'
          ),
          sl(
            'Cancelamento cooperativo com CancellationToken',
            'Cancelar é uma conversa: quem controla cria um CancellationTokenSource e entrega o token (cts.Token) às operações; quem executa verifica o token periodicamente (token.ThrowIfCancellationRequested()) ou o repassa às APIs, que já o respeitam. Ao cancelar, a operação lança OperationCanceledException (TaskCanceledException é um tipo derivado). Por convenção, métodos assíncronos longos aceitam um CancellationToken como último parâmetro.',
            'using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(100));\ntry\n{\n    await Task.Delay(5000, cts.Token);   // seria 5 s, cancela em 100 ms\n}\ncatch (OperationCanceledException)\n{\n    Console.WriteLine("cancelado");      // cancelado\n}'
          ),
          sl(
            'Exceções, .Result/.Wait() e deadlocks',
            'Uma exceção dentro de um método async não estoura na chamada: fica guardada na Task e é relançada, normal, no await (por isso o try/catch ao redor do await funciona). Com .Result ou .Wait() você BLOQUEIA a thread atual esperando a task, e a exceção vem embrulhada em AggregateException. Pior: em ambientes com SynchronizationContext (interfaces gráficas, ASP.NET clássico), o await tenta retomar na thread original; se ela está bloqueada no .Result esperando justamente essa task, ninguém avança: deadlock. Regra: "async até o topo" — nunca misture bloqueio com async. ConfigureAwait(false) diz "pode retomar em qualquer thread" e é recomendado em bibliotecas; o ASP.NET Core não tem SynchronizationContext, então lá o deadlock clássico não ocorre.',
            'static async Task FalhaAsync()\n{\n    await Task.Delay(10);\n    throw new InvalidOperationException("x");\n}\n\nvar t = FalhaAsync();\nConsole.WriteLine("criada");\ntry { await t; }\ncatch (InvalidOperationException e) { Console.WriteLine("pegou " + e.Message); }\n// criada, pegou x\n\n// RISCO de deadlock numa UI: bloqueia a thread que o await precisa para voltar\n// var r = ObterAsync().Result;'
          ),
          sl(
            'IAsyncEnumerable: sequências assíncronas',
            'Quando uma sequência é produzida aos poucos e cada item exige esperar (páginas de uma API, linhas de um banco), use IAsyncEnumerable<T>: o método é async, usa yield return e await juntos, e o consumidor percorre com await foreach. É a versão assíncrona e preguiçosa do iterador.',
            'static async IAsyncEnumerable<int> GerarAsync()\n{\n    for (int i = 1; i <= 3; i++)\n    {\n        await Task.Delay(10);\n        yield return i;\n    }\n}\n\nawait foreach (var n in GerarAsync())\n    Console.Write(n + " ");      // 1 2 3'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o principal benefício de await em operações de I/O?', 'b', [
          'O código passa a rodar mais rápido na CPU',
          'A thread é liberada durante a espera e pode atender outro trabalho',
          'O método passa a rodar sempre em uma nova thread dedicada',
          'Elimina a necessidade de tratar exceções'
        ], 'Enquanto a operação de I/O não termina, nenhuma thread fica bloqueada esperando.'),
        mcq('q2', 'Qual é a assinatura recomendada para um método assíncrono que salva um arquivo e não devolve valor?', 'd', [
          'async void Salvar()',
          'void SalvarAsync()',
          'async int SalvarAsync()',
          'async Task SalvarAsync()'
        ], 'Use Task (não void) para poder aguardar e capturar exceções; o sufixo Async é a convenção.'),
        mcq('q3', 'O que imprime?\nstatic async Task FalhaAsync()\n{\n    await Task.Delay(10);\n    throw new InvalidOperationException("x");\n}\nvar t = FalhaAsync();\nConsole.WriteLine("criada");\ntry { await t; }\ncatch (InvalidOperationException e) { Console.WriteLine("pegou " + e.Message); }', 'b', [
          'pegou x',
          'criada e depois pegou x',
          'criada e o programa termina com exceção não tratada',
          'Nada, a exceção é descartada'
        ], 'A exceção fica na Task e só é relançada no await; a chamada em si não lança.'),
        fill('q4', 'Qual palavra-chave aguarda a conclusão sem bloquear a thread?', 'string texto = ___ File.ReadAllTextAsync(caminho);', ['await'], 'await suspende o método até a Task terminar e entrega o resultado, sem bloquear.'),
        mcq('q5', 'Qual trabalho se beneficia de Task.Run?', 'c', [
          'Uma chamada HTTP a uma API',
          'Ler um arquivo com ReadAllTextAsync',
          'Um laço que calcula hashes de milhões de itens (CPU-bound)',
          'Task.Delay(1000)'
        ], 'Trabalho de CPU ocupa a thread; Task.Run o move para o pool. I/O já é assíncrono e não precisa disso.'),
        mcq('q6', 'Numa aplicação com interface gráfica, por que var r = ObterAsync().Result; pode travar para sempre?', 'a', [
          'A thread de UI fica bloqueada no .Result enquanto o await interno precisa dela para continuar: deadlock',
          'Porque .Result só funciona com Task<void>',
          'Porque a Task é cancelada automaticamente',
          'Porque .Result cria uma thread infinita'
        ], 'Bloquear com .Result/.Wait() num contexto de sincronização é a causa clássica de deadlock. Use await até o topo.'),
        mcq('q7', 'Qual exceção sinaliza que uma operação foi cancelada via CancellationToken?', 'c', [
          'TimeoutException',
          'InvalidOperationException',
          'OperationCanceledException',
          'ArgumentNullException'
        ], 'O cancelamento cooperativo lança OperationCanceledException (ou o derivado TaskCanceledException).'),
        fill('q8', 'Que método de Task aguarda que TODAS as tarefas informadas terminem?', 'int[] r = await Task.___(t1, t2, t3);', ['WhenAll'], 'WhenAll devolve uma Task que termina quando todas terminam, com os resultados na ordem original.')
      ]
    },
    {
      id: 'csi-06-threads-concorrencia',
      title: 'Threads e concorrência',
      goal: 'Reconhecer condições de corrida e proteger dados compartilhados com lock, Interlocked, semáforos e coleções concorrentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Processo, thread e ThreadPool',
            'Um processo é um programa em execução, com sua memória. Dentro dele, threads são linhas de execução que COMPARTILHAM essa memória e podem rodar em paralelo em vários núcleos. Criar uma Thread manualmente é caro (cada uma reserva memória de pilha), por isso o .NET mantém um ThreadPool de threads reaproveitáveis, usado por Task, async e Parallel. Use new Thread só para trabalho dedicado e de longa duração; o normal é Task. Start() inicia e Join() espera terminar.',
            'var t = new Thread(() => Console.WriteLine("na outra thread"));\nt.Start();\nt.Join();                      // espera a thread terminar\nConsole.WriteLine("fim");      // na outra thread, fim'
          ),
          sl(
            'Condição de corrida (race condition)',
            'Quando duas threads leem e escrevem o mesmo dado sem coordenação, o resultado depende da sorte do agendamento. contador++ parece uma operação só, mas são três passos (ler, somar, gravar): duas threads podem ler o mesmo valor e uma sobrescrever o incremento da outra. O resultado muda a cada execução, o que torna o bug difícil de reproduzir.',
            'int contador = 0;\nvar ts = Enumerable.Range(0, 4).Select(_ => new Thread(() =>\n{\n    for (int i = 0; i < 100_000; i++) contador++;   // NÃO é atômico\n})).ToList();\nts.ForEach(t => t.Start());\nts.ForEach(t => t.Join());\nConsole.WriteLine(contador);   // quase sempre MENOR que 400000 (e varia)'
          ),
          sl(
            'lock e Monitor',
            'lock garante exclusão mútua: só uma thread por vez executa o bloco protegido por um mesmo objeto de trava; as outras esperam. Por baixo ele usa Monitor.Enter e Monitor.Exit dentro de try/finally (a trava é liberada mesmo com exceção). Regras: trave sobre um objeto privado e dedicado (private readonly object _trava = new()), nunca sobre this, uma string ou typeof, pois código externo poderia travar no mesmo objeto; mantenha o bloco curto; e não use await dentro de lock.',
            'class Contador\n{\n    private readonly object _trava = new();\n    private int _valor;\n\n    public void Incrementar()\n    {\n        lock (_trava)          // uma thread por vez aqui\n        {\n            _valor++;\n        }\n    }\n    public int Valor { get { lock (_trava) return _valor; } }\n}'
          ),
          sl(
            'Interlocked e SemaphoreSlim',
            'Para operações simples sobre um número, Interlocked oferece versões ATÔMICAS (indivisíveis) e mais baratas que lock: Increment, Decrement, Add, Exchange, CompareExchange. SemaphoreSlim limita quantas threads/tasks entram ao mesmo tempo numa região (contagem inicial); WaitAsync() entra, Release() sai, e, ao contrário do lock, funciona com await. Sempre libere num finally.',
            'int contador = 0;\nParallel.For(0, 1000, _ => Interlocked.Increment(ref contador));\nConsole.WriteLine(contador);        // 1000\n\nvar limite = new SemaphoreSlim(3);  // no máximo 3 ao mesmo tempo\nawait limite.WaitAsync();\ntry { /* usa o recurso limitado */ }\nfinally { limite.Release(); }'
          ),
          sl(
            'Coleções concorrentes',
            'List<T> e Dictionary<TKey,TValue> NÃO são seguros para escrita simultânea. System.Collections.Concurrent traz equivalentes projetados para isso: ConcurrentDictionary (com GetOrAdd e AddOrUpdate atômicos), ConcurrentQueue, ConcurrentStack e ConcurrentBag. Cada operação isolada é segura; porém uma sequência de duas operações (ler e depois escrever) continua podendo correr, por isso prefira os métodos compostos como AddOrUpdate.',
            'var cd = new ConcurrentDictionary<string, int>();\nParallel.For(0, 1000, _ => cd.AddOrUpdate("visitas", 1, (chave, atual) => atual + 1));\nConsole.WriteLine(cd["visitas"]);   // 1000\n\nvar fila = new ConcurrentQueue<int>();\nfila.Enqueue(7);\nif (fila.TryDequeue(out var item)) Console.WriteLine(item);   // 7'
          ),
          sl(
            'Parallel.For, Parallel.ForEach e PLINQ',
            'Parallel.For e Parallel.ForEach dividem as iterações entre várias threads do pool, ideais para trabalho de CPU com iterações independentes e custo relevante: para laços pequenos, o custo de coordenar supera o ganho. A ordem de execução NÃO é garantida. PLINQ paraleliza consultas com AsParallel(). Para I/O, prefira async (Parallel.ForEachAsync ou Task.WhenAll), não Parallel.ForEach bloqueante.',
            'var numeros = Enumerable.Range(1, 1_000_000);\nlong soma = numeros.AsParallel().Sum(x => (long)x);\nConsole.WriteLine(soma);   // 500000500000\n\nParallel.ForEach(new[] { 1, 2, 3 }, n => Console.Write(n * n + " "));   // ordem imprevisível'
          ),
          sl(
            'Channels, deadlock e imutabilidade',
            'System.Threading.Channels é uma fila assíncrona produtor/consumidor: um lado escreve, o outro lê com await foreach, sem travas manuais. Deadlock acontece quando threads esperam umas pelas outras para sempre — o caso típico são duas travas adquiridas em ordens opostas. A defesa: adquirir travas sempre na MESMA ordem, travar o mínimo possível e preferir não compartilhar. Dados imutáveis (record, readonly, coleções imutáveis) podem ser lidos por várias threads sem nenhuma trava: a melhor defesa contra condições de corrida é não ter estado mutável compartilhado.',
            '// Thread 1: lock (A) { lock (B) { ... } }\n// Thread 2: lock (B) { lock (A) { ... } }   // pode travar para sempre\n\nvar canal = Channel.CreateUnbounded<int>();\nvar produtor = Task.Run(async () =>\n{\n    for (int i = 1; i <= 3; i++) await canal.Writer.WriteAsync(i);\n    canal.Writer.Complete();\n});\nawait foreach (var x in canal.Reader.ReadAllAsync())\n    Console.Write(x + " ");     // 1 2 3\nawait produtor;'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que quatro threads executando contador++ 100 mil vezes cada podem terminar com menos de 400000?', 'c', [
          'Porque int não suporta mais de 100 mil incrementos',
          'Porque o ThreadPool descarta iterações',
          'Porque ++ é leitura, soma e gravação: duas threads podem ler o mesmo valor e perder um incremento',
          'Porque o Join cancela as threads'
        ], 'Sem atomicidade, as etapas de threads diferentes se intercalam e atualizações são perdidas (condição de corrida).'),
        mcq('q2', 'O que o lock garante?', 'a', [
          'Que só uma thread por vez execute o bloco protegido por aquele mesmo objeto de trava',
          'Que o bloco rode sempre em uma thread nova',
          'Que o bloco execute mais rápido',
          'Que o bloco nunca lance exceção'
        ], 'lock é exclusão mútua. Por baixo usa Monitor.Enter/Exit com try/finally.'),
        mcq('q3', 'Qual é o objeto de trava mais adequado?', 'd', [
          'this',
          'Uma string literal, como "trava"',
          'typeof(MinhaClasse)',
          'private readonly object _trava = new();'
        ], 'Um objeto privado e dedicado impede que código externo trave no mesmo objeto e cause bloqueios ou deadlocks inesperados.'),
        fill('q4', 'Qual método de Interlocked soma 1 de forma atômica?', 'Interlocked.___(ref contador);', ['Increment'], 'Interlocked.Increment faz a leitura, soma e gravação como uma única operação indivisível.'),
        mcq('q5', 'O que faz new SemaphoreSlim(3)?', 'b', [
          'Cria 3 threads',
          'Permite no máximo 3 entradas simultâneas na região protegida; as demais esperam',
          'Executa o código 3 vezes',
          'Protege o código com 3 travas'
        ], 'A contagem inicial é o limite de acessos concorrentes. WaitAsync consome uma vaga e Release devolve.'),
        mcq('q6', 'Duas threads: uma faz lock(A){lock(B){...}} e a outra lock(B){lock(A){...}}. Qual o risco e a defesa?', 'c', [
          'Condição de corrida; resolver com Interlocked',
          'Vazamento de memória; resolver com GC.Collect',
          'Deadlock; resolver adquirindo as travas sempre na mesma ordem',
          'Nenhum risco; o lock detecta e resolve sozinho'
        ], 'Cada thread segura uma trava e espera a outra para sempre. Ordem global consistente evita o ciclo.'),
        mcq('q7', 'Qual afirmação sobre Parallel.ForEach está correta?', 'a', [
          'É indicado para trabalho de CPU com iterações independentes e não garante a ordem de execução',
          'Garante a ordem sequencial dos itens',
          'É a melhor opção para chamadas HTTP, pois bloqueia threads em paralelo',
          'Sempre é mais rápido que foreach, mesmo para laços minúsculos'
        ], 'O paralelismo tem custo de coordenação e a ordem é imprevisível. Para I/O, prefira async.'),
        fill('q8', 'Que tipo de dicionário é seguro para escrita por várias threads?', 'var cache = new ___<string, int>();', ['ConcurrentDictionary'], 'ConcurrentDictionary oferece operações atômicas como GetOrAdd e AddOrUpdate; Dictionary comum não é thread-safe.')
      ]
    },
    {
      id: 'csi-07-pattern-matching-avancado',
      title: 'Pattern matching avançado',
      goal: 'Combinar padrões de tipo, relacionais, de propriedade, posicionais e de lista em switch expressions exaustivas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Padrões de tipo, constante e var',
            'Pattern matching testa a FORMA de um valor e, se casar, pode extrair partes dele. Já se vê em is e switch. O padrão de tipo (int, string s) testa o tipo e opcionalmente declara uma variável; o de constante compara com um valor fixo (null, 0, "ok"); o padrão var sempre casa e captura o valor numa variável; o descarte _ casa com qualquer coisa. Numa switch expression, cada braço é "padrão => resultado", e o PRIMEIRO que casar vence.',
            'static string Descrever(object? o) => o switch\n{\n    null => "nulo",\n    int => "um int",\n    string s => $"texto de {s.Length}",\n    _ => "outro"\n};\n\nConsole.WriteLine(Descrever(3));      // um int\nConsole.WriteLine(Descrever("abc"));  // texto de 3\nConsole.WriteLine(Descrever(2.5));    // outro'
          ),
          sl(
            'Padrões relacionais e lógicos (and, or, not)',
            'Os operadores <, <=, >, >= viram padrões que comparam com uma constante. Eles se combinam com and, or e not (palavras, não && ou ||). Assim escrevem-se faixas e negações com clareza: n is > 0 and < 10, c is "a" or "b", x is not null. Para inteiros o compilador entende as faixas e sabe dizer se o switch cobre todos os valores.',
            'static string Faixa(int n) => n switch\n{\n    < 0 => "negativo",\n    0 => "zero",\n    > 0 and < 10 => "pequeno",\n    >= 10 => "grande"\n};\n\nConsole.WriteLine(Faixa(7));    // pequeno\nConsole.WriteLine(Faixa(-3));   // negativo\n\nstring? nome = "Ana";\nif (nome is not null) Console.WriteLine(nome.Length);   // 3'
          ),
          sl(
            'Padrão de propriedade',
            'O padrão { Propriedade: padrão } examina propriedades do objeto, e aceita outros padrões dentro (constantes, relacionais, aninhados). Casar com { ... } já garante que o objeto não é null. É ótimo para regras de negócio legíveis, sem if em cascata nem acessos que lançariam NullReferenceException.',
            'record Cliente(string Nome, string Cidade);\nrecord Pedido(string Status, decimal Total, Cliente Cliente);\n\nvar p = new Pedido("Pago", 150m, new Cliente("Ana", "Recife"));\n\nConsole.WriteLine(p is { Status: "Pago", Total: > 100 });          // True\nConsole.WriteLine(p is { Cliente: { Cidade: "Recife" } });         // True\nConsole.WriteLine(p is { Cliente.Cidade: "Natal" });               // False'
          ),
          sl(
            'Padrão posicional e deconstrução',
            'Tipos que têm Deconstruct (tuplas, records posicionais) aceitam o padrão posicional (a, b): cada posição é um sub-padrão. O truque de colocar os valores numa tupla para fazer switch sobre vários valores ao mesmo tempo (switch de tupla) é muito usado para tabelas de decisão.',
            'static string Quadrante(int x, int y) => (x, y) switch\n{\n    (0, 0) => "origem",\n    (_, 0) => "eixo x",\n    (0, _) => "eixo y",\n    _ => "plano"\n};\n\nConsole.WriteLine(Quadrante(0, 0));   // origem\nConsole.WriteLine(Quadrante(3, 0));   // eixo x\n\nrecord Ponto(int X, int Y);\nConsole.WriteLine(new Ponto(0, 9) is (0, var y) ? y : -1);   // 9'
          ),
          sl(
            'List patterns',
            'Padrões de lista casam com arrays e listas pelo tamanho e conteúdo: [1, 2, 3] exige exatamente esses elementos; o descarte de fatia .. casa com ZERO ou mais elementos (só pode aparecer uma vez); var captura elementos; [] casa com coleção vazia. Funcionam com qualquer tipo com Length/Count e indexador.',
            'int[] a = { 1, 2, 3, 4, 5 };\nConsole.WriteLine(a is [1, .., 5]);     // True\nConsole.WriteLine(a is [_, _]);          // False (tem 5 elementos)\n\nstatic string Resumo(int[] v) => v switch\n{\n    [] => "vazio",\n    [var unico] => $"um: {unico}",\n    [var primeiro, .., var ultimo] => $"{primeiro}..{ultimo}"\n};\nConsole.WriteLine(Resumo(a));            // 1..5\nConsole.WriteLine(Resumo(new int[0]));   // vazio'
          ),
          sl(
            'Exaustividade e cláusula when',
            'O compilador verifica se a switch expression cobre todas as entradas possíveis e avisa quando não cobre (warning). Se, mesmo assim, um valor sem braço chegar em tempo de execução, é lançada SwitchExpressionException; por isso costuma-se terminar com _ ou usar enums e padrões que o compilador prove completos. Um braço que nunca pode ser alcançado porque um anterior já cobre tudo é erro de compilação. A cláusula when adiciona uma condição arbitrária ao padrão: o braço só vale se o padrão casar E a condição for verdadeira.',
            'static string Paridade(int n) => n switch\n{\n    var x when x % 2 == 0 => "par",\n    _ => "impar"\n};\nConsole.WriteLine(Paridade(4));   // par\nConsole.WriteLine(Paridade(7));   // impar\n\nstatic string Parcial(int n) => n switch { 1 => "um", 2 => "dois" };\n// Parcial(3) lança SwitchExpressionException (e o compilador avisa)'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\nstatic string Faixa(int n) => n switch\n{\n    < 0 => "negativo",\n    0 => "zero",\n    > 0 and < 10 => "pequeno",\n    >= 10 => "grande"\n};\nConsole.WriteLine(Faixa(10));', 'd', [
          'pequeno',
          'zero',
          'Erro de compilação por faltar um braço _',
          'grande'
        ], '10 não é < 10, então não casa com "pequeno"; casa com >= 10. As faixas cobrem todos os inteiros.'),
        mcq('q2', 'O que significa p is { Status: "Pago", Total: > 100 }?', 'b', [
          'p é uma string com esse texto',
          'p não é null, sua propriedade Status é "Pago" e Total é maior que 100',
          'Status ou Total satisfazem a condição',
          'p é um novo objeto com esses valores'
        ], 'O padrão de propriedade exige todas as propriedades listadas e já garante que p não é null.'),
        mcq('q3', 'O que imprime?\nstatic string Q(int x, int y) => (x, y) switch\n{\n    (0, 0) => "origem",\n    (_, 0) => "eixo x",\n    (0, _) => "eixo y",\n    _ => "plano"\n};\nConsole.WriteLine(Q(3, 0));', 'a', [
          'eixo x',
          'origem',
          'eixo y',
          'plano'
        ], 'Os braços são avaliados em ordem: (3, 0) não é (0, 0), mas casa com (_, 0).'),
        fill('q4', 'Qual palavra combina dois padrões exigindo ambos?', 'bool pequeno = n is > 0 ___ < 10;', ['and'], 'and exige os dois padrões; or exige pelo menos um; not nega. Não se usa && em padrões.'),
        mcq('q5', 'Qual array casa com o padrão [1, .., 5]?', 'c', [
          'new[] { 5, 1 }',
          'new[] { 1, 2, 3 }',
          'new[] { 1, 2, 3, 5 }',
          'new[] { 2, 1, 5 }'
        ], 'Exige começar com 1 e terminar com 5; o .. cobre zero ou mais elementos do meio.'),
        mcq('q6', 'O que acontece quando uma switch expression recebe um valor que nenhum braço cobre?', 'b', [
          'Devolve default',
          'O compilador avisa e, em tempo de execução, lança SwitchExpressionException',
          'Executa o primeiro braço',
          'Retorna null silenciosamente'
        ], 'Switch expressions não têm "queda" nem valor padrão automático: um valor não coberto causa SwitchExpressionException.'),
        mcq('q7', 'O que imprime?\nstatic string D(object? o) => o switch\n{\n    null => "nulo",\n    int => "int",\n    string s => "s:" + s,\n    _ => "outro"\n};\nConsole.WriteLine(D(3.5));', 'd', [
          'nulo',
          'int',
          's:3,5',
          'outro'
        ], '3.5 é double: não é null, int nem string, então cai no descarte _.'),
        fill('q8', 'Que palavra adiciona uma condição extra a um braço do switch?', 'n switch { var x ___ x % 2 == 0 => "par", _ => "impar" }', ['when'], 'when filtra o braço: o padrão precisa casar e a condição ser verdadeira.')
      ]
    },
    {
      id: 'csi-08-tuplas-extensoes-operadores',
      title: 'Tuplas, deconstrução, extension methods e operadores',
      goal: 'Usar tuplas, métodos de extensão, operadores, indexadores e conversões com critério, sabendo quando não abusar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Tuplas e ValueTuple',
            'Uma tupla agrupa alguns valores sem você criar uma classe: (int, string). Cada elemento pode ter um nome ((int Id, string Nome)), usado para ler com t.Nome. Em tempo de execução a tupla é um ValueTuple<...>, uma struct (tipo de valor, sem alocação no heap); os nomes existem só para o compilador e os elementos reais se chamam Item1, Item2... Tuplas são ótimas para devolver mais de um valor de um método; duas tuplas se comparam com == elemento a elemento.',
            'static (int Min, int Max) Faixa(int[] v) => (v.Min(), v.Max());\n\nvar r = Faixa(new[] { 3, 1, 9 });\nConsole.WriteLine($"{r.Min}-{r.Max}");     // 1-9\nConsole.WriteLine((1, "a") == (1, "a"));   // True\nConsole.WriteLine(r.GetType().Name);       // ValueTuple`2'
          ),
          sl(
            'Deconstrução',
            'Deconstruir é desmontar um valor em variáveis separadas: var (min, max) = Faixa(...). Use _ para ignorar partes. Funciona com tuplas e com qualquer tipo que tenha um método Deconstruct com parâmetros out (records posicionais já têm um). A troca de duas variáveis sem auxiliar usa isso: (a, b) = (b, a).',
            'var (mn, mx) = Faixa(new[] { 3, 1, 9 });\n(mn, mx) = (mx, mn);\nConsole.WriteLine($"{mn}{mx}");   // 91\n\nclass Ponto\n{\n    public int X { get; init; }\n    public int Y { get; init; }\n    public void Deconstruct(out int x, out int y) { x = X; y = Y; }\n}\nvar (px, py) = new Ponto { X = 3, Y = 4 };\nConsole.WriteLine(px + py);       // 7'
          ),
          sl(
            'Extension methods',
            'Um método de extensão adiciona um "método" a um tipo que você não pode (ou não quer) alterar. Declara-se como método static, numa classe static não aninhada, com a palavra this antes do PRIMEIRO parâmetro, que é o tipo estendido. É só açúcar: "abc".Truncar(2) vira Ext.Truncar("abc", 2) na compilação. Limites: não acessa membros privados, não é polimórfico, e um método de instância de mesmo nome sempre vence. Todo o LINQ é feito de extensões sobre IEnumerable<T>. Funcionam até com receptor null (não há desreferência), então valide se necessário.',
            'static class Ext\n{\n    public static string Truncar(this string s, int max)\n        => s.Length <= max ? s : s[..max] + "...";\n}\n\nConsole.WriteLine("abcdefgh".Truncar(5));   // abcde...\nConsole.WriteLine("abc".Truncar(5));        // abc'
          ),
          sl(
            'Sobrecarga de operadores e igualdade',
            'Um tipo pode definir o significado de +, -, ==, etc. com métodos public static operator. Faça isso apenas quando o significado for óbvio (números, vetores, dinheiro). Regra de ouro da igualdade: se você sobrecarrega ==, sobrecarregue também !=, e implemente Equals e GetHashCode de forma consistente (valores iguais → mesmo hash), senão coleções como Dictionary e HashSet se comportam de forma estranha. IEquatable<T> evita boxing em structs.',
            'readonly struct Dinheiro : IEquatable<Dinheiro>\n{\n    public int Centavos { get; }\n    public Dinheiro(int c) => Centavos = c;\n\n    public static Dinheiro operator +(Dinheiro a, Dinheiro b) => new(a.Centavos + b.Centavos);\n    public static bool operator ==(Dinheiro a, Dinheiro b) => a.Centavos == b.Centavos;\n    public static bool operator !=(Dinheiro a, Dinheiro b) => !(a == b);\n    public bool Equals(Dinheiro o) => Centavos == o.Centavos;\n    public override bool Equals(object? o) => o is Dinheiro d && Equals(d);\n    public override int GetHashCode() => Centavos.GetHashCode();\n    public override string ToString() => $"{Centavos} centavos";\n}\n\nvar d = new Dinheiro(150) + new Dinheiro(250);\nConsole.WriteLine(d);                       // 400 centavos\nConsole.WriteLine(d == new Dinheiro(400));  // True'
          ),
          sl(
            'Indexadores',
            'Um indexador permite usar o objeto com colchetes, como um array: declara-se como propriedade chamada this, com parâmetros entre [ ]. O parâmetro pode ser de qualquer tipo (int, string...) e o indexador pode ter get e set. Dictionary<TKey,TValue> e List<T> funcionam assim. Útil para tipos que "contêm" elementos; evite quando um método nomeado deixaria a intenção mais clara.',
            'class Grade\n{\n    private readonly string[] _dados = new string[3];\n    public string this[int i]\n    {\n        get => _dados[i];\n        set => _dados[i] = value;\n    }\n}\n\nvar g = new Grade();\ng[1] = "x";\nConsole.WriteLine(g[1]);   // x'
          ),
          sl(
            'Conversões implicit e explicit — e quando NÃO abusar',
            'Você pode definir conversões entre tipos. implicit é aplicada pelo compilador sem cast e deve ser SEGURA: nunca perder informação nem lançar exceção. explicit exige o cast (int)x e serve para conversões que podem perder dados ou falhar. Abusos comuns: operadores com significado obscuro (somar um item a um Pedido com +), conversões implícitas que escondem custo ou perda, extension methods demais que poluem o autocompletar, e tuplas em APIs públicas (prefira um record com nome, que documenta o significado). Pergunte: o código fica MAIS claro para quem lê?',
            'readonly struct Celsius\n{\n    public double Graus { get; }\n    public Celsius(double g) => Graus = g;\n    public static implicit operator Celsius(double g) => new(g);   // seguro\n    public static implicit operator double(Celsius c) => c.Graus;\n}\nCelsius c = 36.5;      // implícita\ndouble d = c;\nConsole.WriteLine(d);  // 36,5 (ou 36.5, conforme a cultura)\n\nreadonly struct Pct\n{\n    public double V { get; }\n    public Pct(double v) => V = v;\n    public static explicit operator int(Pct p) => (int)(p.V * 100);   // perde precisão\n}\nConsole.WriteLine((int)new Pct(0.5));   // 50'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o tipo real, em tempo de execução, de uma tupla como (int Id, string Nome)?', 'b', [
          'Uma classe anônima no heap',
          'System.ValueTuple<int, string>, uma struct; os nomes existem só em tempo de compilação',
          'Um array de object',
          'Um Dictionary<string, object>'
        ], 'A tupla é um ValueTuple, tipo de valor. Os nomes Id e Nome são conveniência do compilador (Item1 e Item2 por baixo).'),
        mcq('q2', 'O que imprime?\nvar (a, b) = (1, 2);\n(a, b) = (b, a);\nConsole.WriteLine($"{a}{b}");', 'd', [
          '12',
          '11',
          '22',
          '21'
        ], 'A atribuição por tupla avalia o lado direito inteiro antes de atribuir, trocando os valores.'),
        mcq('q3', 'O que a palavra this no primeiro parâmetro de um método static faz?', 'a', [
          'Transforma-o em método de extensão, chamável como se fosse método de instância do tipo daquele parâmetro',
          'Faz o método acessar membros privados do tipo estendido',
          'Torna o método virtual',
          'Faz o método modificar o próprio tipo estendido'
        ], 'É açúcar sintático resolvido na compilação: x.M() vira Classe.M(x). Não acessa privados nem altera o tipo.'),
        fill('q4', 'Que palavra marca o primeiro parâmetro de um método de extensão?', 'public static string Truncar(___ string s, int max)\n    => s.Length <= max ? s : s[..max] + "...";', ['this'], 'O modificador this no primeiro parâmetro declara a extensão.'),
        mcq('q5', 'Ao sobrecarregar == em um tipo, o que mais deve ser feito?', 'c', [
          'Nada, o compilador cuida do resto',
          'Apenas sobrecarregar +',
          'Sobrecarregar também !=, e implementar Equals e GetHashCode de forma consistente',
          'Tornar o tipo abstrato'
        ], 'Igualdade inconsistente quebra HashSet, Dictionary e Contains. O compilador também avisa se faltar != ou Equals/GetHashCode.'),
        mcq('q6', 'Como se declara um indexador acessado por obj[0]?', 'd', [
          'public string Item(int i)',
          'public string operator [](int i)',
          'public static string this(int i)',
          'public string this[int i] { get { ... } set { ... } }'
        ], 'O indexador é uma propriedade chamada this com parâmetros entre colchetes.'),
        mcq('q7', 'Qual conversão deve ser declarada implicit?', 'b', [
          'double para int, truncando a parte decimal',
          'Celsius para double, que apenas expõe o valor sem perder informação',
          'string para int, lançando exceção se inválida',
          'long para byte'
        ], 'implicit deve ser segura: sem perda e sem exceção. Conversões que perdem dados ou podem falhar devem ser explicit.'),
        fill('q8', 'Que palavra declara uma conversão que o compilador aplica sozinho, sem cast?', 'public static ___ operator double(Celsius c) => c.Graus;', ['implicit'], 'implicit permite atribuir sem cast; explicit exigiria (double)c.')
      ]
    },
    {
      id: 'csi-09-idisposable-recursos',
      title: 'IDisposable e gerenciamento de recursos',
      goal: 'Liberar recursos não gerenciados de forma determinística com using, Dispose e DisposeAsync, e evitar vazamentos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Recursos gerenciados e não gerenciados',
            'O coletor de lixo (GC) recupera a memória dos objetos .NET, mas só quando quiser, e não sabe liberar o que o sistema operacional entregou: arquivos abertos, sockets, conexões de banco, memória nativa. Esses são recursos não gerenciados (ou escassos); segurá-los por tempo indeterminado trava arquivos e esgota limites. Por isso o .NET define IDisposable, com o método Dispose(): "libere agora, de forma determinística". Quem cria (ou possui) um objeto IDisposable é responsável por descartá-lo.',
            'var fs = new FileStream("dados.txt", FileMode.Open);\n// ... usa ...\nfs.Dispose();   // devolve o handle do arquivo ao sistema agora, sem esperar o GC'
          ),
          sl(
            'using statement e using declaration',
            'Chamar Dispose manualmente é frágil: uma exceção no meio pula a liberação. O using garante o Dispose mesmo com exceção, pois equivale a um try/finally. A forma de bloco libera ao fechar as chaves; a using declaration (using var x = ...;) libera no fim do escopo atual e fica mais enxuta. Vários using no mesmo escopo são descartados na ordem INVERSA da criação.',
            'class Recurso : IDisposable\n{\n    private readonly string _nome;\n    public Recurso(string nome) { _nome = nome; Console.WriteLine($"abre {nome}"); }\n    public void Dispose() => Console.WriteLine($"fecha {_nome}");\n}\n\nusing var a = new Recurso("A");\nusing var b = new Recurso("B");\nConsole.WriteLine("usando");\n// abre A, abre B, usando, fecha B, fecha A'
          ),
          sl(
            'O padrão Dispose(bool)',
            'Quando a classe possui recursos não gerenciados diretamente, ou é feita para ser herdada, usa-se o padrão completo: Dispose() público chama Dispose(true) e depois GC.SuppressFinalize(this); o método protected virtual Dispose(bool disposing) faz o trabalho: se disposing for true libera também os objetos gerenciados que a classe possui; sempre libera os recursos nativos; e uma flag evita liberar duas vezes (Dispose deve ser idempotente). Se a classe só guarda outros IDisposable e é sealed, basta um Dispose simples que descarta os campos.',
            'class MeuRecurso : IDisposable\n{\n    private bool _descartado;\n\n    public void Dispose()\n    {\n        Dispose(true);\n        GC.SuppressFinalize(this);   // já limpei: dispensa o finalizador\n    }\n\n    protected virtual void Dispose(bool disposing)\n    {\n        if (_descartado) return;\n        if (disposing) { /* libera objetos gerenciados que esta classe possui */ }\n        /* libera recursos nativos */\n        _descartado = true;\n    }\n\n    ~MeuRecurso() => Dispose(false);   // rede de segurança, só se há recurso nativo\n}'
          ),
          sl(
            'Finalizadores, SafeHandle e o custo',
            'O finalizador (~Classe) é uma rede de segurança chamada pelo GC caso alguém esqueça o Dispose, mas é cara e imprevisível: roda numa thread própria, em momento indeterminado, e um objeto com finalizador sobrevive a uma coleta extra antes de ser liberado. Por isso GC.SuppressFinalize no Dispose. Dentro do finalizador não se deve tocar em outros objetos gerenciados (podem já ter sido finalizados). Na prática, evite escrever finalizadores: embrulhe handles nativos em um SafeHandle, tipo do .NET que já traz a liberação confiável, e deixe sua classe apenas ter um IDisposable.',
            '// regra prática:\n// - só objetos IDisposable?       -> Dispose simples (sealed)\n// - recurso nativo direto?        -> use SafeHandle em vez de finalizador próprio\n// - classe base para herança?     -> padrão Dispose(bool)'
          ),
          sl(
            'IAsyncDisposable e await using',
            'Alguns recursos precisam de E/S para serem liberados (descarregar um buffer em disco ou rede, fechar uma conexão). Para não bloquear a thread, existe IAsyncDisposable com DisposeAsync(), que devolve ValueTask. Usa-se com await using, em bloco ou como declaração. Muitos tipos implementam as duas interfaces; num método async prefira await using.',
            'class Gravador : IAsyncDisposable\n{\n    public async ValueTask DisposeAsync()\n    {\n        await Task.Delay(10);                 // ex.: descarregar buffers\n        Console.WriteLine("gravador fechado");\n    }\n}\n\nawait using var g = new Gravador();\nConsole.WriteLine("gravando");\n// gravando, gravador fechado'
          ),
          sl(
            'Esquecer de descartar, HttpClient e ObjectDisposedException',
            'Esquecer o Dispose vaza recursos: conexões de banco esgotam o pool e a aplicação trava esperando por uma livre; arquivos ficam bloqueados; streams podem não gravar o que estava em buffer. Um caso famoso é o HttpClient: ele é IDisposable, mas deve ser REUTILIZADO (uma instância compartilhada ou o IHttpClientFactory). Criar e descartar um novo a cada requisição esgota portas e sockets do sistema. Já usar um objeto depois de descartado lança ObjectDisposedException, sinal de que o tempo de vida dele foi mal planejado.',
            'var ms = new MemoryStream();\nms.Dispose();\ntry { ms.WriteByte(1); }\ncatch (ObjectDisposedException) { Console.WriteLine("já descartado"); }\n\n// ruim: um HttpClient por requisição\n// using var c = new HttpClient();   // dentro de um laço = esgota sockets\n// bom: reutilizar uma instância (static/readonly) ou IHttpClientFactory'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual destes recursos o GC NÃO libera de forma determinística e exige Dispose?', 'c', [
          'Uma string temporária',
          'Uma List<int> local',
          'O handle de um arquivo aberto ou uma conexão de banco',
          'Um objeto Pessoa comum'
        ], 'O GC cuida da memória gerenciada quando quiser; handles do sistema precisam ser liberados explicitamente.'),
        mcq('q2', 'O que imprime?\nusing var a = new Recurso("A");\nusing var b = new Recurso("B");\nConsole.WriteLine("usando");\n// Recurso imprime "abre X" no construtor e "fecha X" no Dispose', 'a', [
          'abre A, abre B, usando, fecha B, fecha A',
          'abre A, abre B, usando, fecha A, fecha B',
          'usando, abre A, abre B, fecha B, fecha A',
          'abre A, usando, abre B, fecha B, fecha A'
        ], 'Os construtores rodam na ordem; no fim do escopo os Dispose são chamados na ordem inversa.'),
        mcq('q3', 'Um bloco using é equivalente a quê?', 'd', [
          'Um catch genérico que ignora exceções',
          'Um lock sobre o objeto',
          'Uma chamada a GC.Collect()',
          'Um try/finally que chama Dispose() no finally'
        ], 'Por isso o Dispose acontece mesmo se houver exceção dentro do bloco.'),
        fill('q4', 'Que palavra-chave garante o Dispose ao fim do escopo?', '___ var fs = File.OpenRead(caminho);', ['using'], 'A using declaration descarta o objeto quando o escopo atual termina.'),
        mcq('q5', 'Por que o Dispose() do padrão chama GC.SuppressFinalize(this)?', 'b', [
          'Para forçar o GC a rodar imediatamente',
          'Porque a limpeza já foi feita; assim o objeto não paga o custo de ser finalizado depois',
          'Para impedir que o objeto seja usado novamente',
          'Para liberar memória gerenciada manualmente'
        ], 'Objetos com finalizador custam mais ao GC. Se o Dispose já liberou tudo, o finalizador é dispensado.'),
        mcq('q6', 'Qual o problema de criar um novo HttpClient dentro de um laço, para cada requisição?', 'c', [
          'HttpClient só funciona uma vez',
          'Ele não implementa IDisposable',
          'Esgota sockets e portas do sistema; o recomendado é reutilizar uma instância ou usar IHttpClientFactory',
          'Gera ObjectDisposedException na segunda volta'
        ], 'Criar e descartar clientes em massa deixa conexões em espera e esgota recursos do sistema operacional.'),
        mcq('q7', 'O que acontece ao escrever em um MemoryStream depois de chamar Dispose nele?', 'd', [
          'O dado é gravado normalmente',
          'O GC recria o stream',
          'Retorna false em silêncio',
          'Lança ObjectDisposedException'
        ], 'Usar um objeto após o Dispose lança ObjectDisposedException.'),
        fill('q8', 'Que método a interface IAsyncDisposable exige implementar?', 'public async ValueTask ___()\n{\n    await Task.Delay(10);\n}', ['DisposeAsync'], 'IAsyncDisposable declara DisposeAsync(), consumido por await using.')
      ]
    },
    {
      id: 'csi-10-colecoes-profundidade',
      title: 'Coleções em profundidade',
      goal: 'Escolher a coleção pela complexidade, implementar igualdade e comparação corretamente e usar coleções imutáveis.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Complexidade das coleções',
            'A notação O(...) diz como o custo cresce com o número n de elementos. List<T>: acessar por índice O(1); Add é O(1) amortizado; Contains, IndexOf e Remove por valor, O(n); Insert/RemoveAt no meio, O(n) (desloca elementos). Dictionary<TKey,TValue> e HashSet<T>: buscar, inserir e remover são O(1) em média (tabela de hash). SortedDictionary e SortedSet (árvore balanceada): O(log n) em tudo, mas mantêm os itens ORDENADOS. LinkedList<T>: inserir/remover num nó que você já tem é O(1), mas achar um item por posição é O(n) e o acesso à memória é pouco amigável ao cache — raramente vence a List na prática.',
            '// Contains em lista de 1 milhão: percorre até achar -> O(n)\nbool a = lista.Contains(x);\n// HashSet: calcula o hash e vai direto -> O(1) em média\nbool b = conjunto.Contains(x);\n\nvar ordenado = new SortedDictionary<string, int> { ["b"] = 2, ["a"] = 1 };\nforeach (var kv in ordenado) Console.Write(kv.Key);   // ab (sempre ordenado)'
          ),
          sl(
            'Interfaces de coleção: o que cada uma promete',
            'IEnumerable<T>: só percorrer. ICollection<T>: acrescenta Count, Add, Remove, Contains, Clear. IList<T>: acrescenta acesso por índice e inserção por posição. IReadOnlyList<T> (e IReadOnlyCollection<T>): leitura com Count e índice, SEM métodos de alteração. Boa prática: receba como parâmetro a interface mais ampla que atenda (IEnumerable<T> se só percorre) e exponha como retorno uma interface somente leitura, para não deixar quem chama mexer no seu estado interno.',
            'public class Turma\n{\n    private readonly List<string> _alunos = new();\n    public void Matricular(string nome) => _alunos.Add(nome);\n\n    // exposição segura: quem chama só lê\n    public IReadOnlyList<string> Alunos => _alunos;\n}\n\nstatic int Contar(IEnumerable<string> nomes) => nomes.Count();   // aceita qualquer sequência'
          ),
          sl(
            'Igualdade e GetHashCode corretos',
            'Dictionary e HashSet usam GetHashCode para achar o "balde" e Equals para confirmar. Sem sobrescrever, classes comparam por REFERÊNCIA: dois objetos com o mesmo conteúdo são diferentes. Regras: objetos iguais devem ter o MESMO hash (o contrário, não: colisões são permitidas); o hash não deve mudar enquanto o objeto estiver na coleção, então só use campos imutáveis; HashCode.Combine(a, b) mistura campos com boa distribuição; implemente IEquatable<T> para comparar sem boxing. Records e structs de registro já geram igualdade por valor.',
            'class Chave : IEquatable<Chave>\n{\n    public int Id { get; }\n    public Chave(int id) => Id = id;\n    public bool Equals(Chave? o) => o is not null && Id == o.Id;\n    public override bool Equals(object? o) => Equals(o as Chave);\n    public override int GetHashCode() => HashCode.Combine(Id);\n}\n\nvar hs = new HashSet<Chave> { new Chave(1) };\nConsole.WriteLine(hs.Contains(new Chave(1)));   // True\n// sem Equals/GetHashCode sobrescritos o resultado seria False (referências diferentes)'
          ),
          sl(
            'IComparable, IComparer e comparadores',
            'IComparable<T> define a ordem NATURAL do tipo (CompareTo): é o que Sort() e SortedSet usam. IComparer<T> define uma ordem alternativa, externa ao tipo, passada a Sort, OrderBy e coleções ordenadas. Da mesma forma, Dictionary e HashSet aceitam um IEqualityComparer<T> para mudar o que significa "igual" (por exemplo ignorando maiúsculas e minúsculas). Comparer<T>.Create monta um comparador a partir de uma lambda.',
            'var nomes = new List<string> { "bia", "Ana", "carlos" };\nnomes.Sort(StringComparer.OrdinalIgnoreCase);\nConsole.WriteLine(string.Join(",", nomes));   // Ana,bia,carlos\n\nvar porTamanho = Comparer<string>.Create((a, b) => a.Length.CompareTo(b.Length));\nnomes.Sort(porTamanho);\n\nvar conj = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ola" };\nConsole.WriteLine(conj.Contains("OLA"));      // True'
          ),
          sl(
            'ReadOnlyCollection vs coleções imutáveis',
            'ReadOnlyCollection<T> (de AsReadOnly) é apenas uma VISÃO somente leitura sobre a lista original: quem a recebeu não altera, mas se o dono alterar a lista, a visão mostra a mudança. As coleções imutáveis de System.Collections.Immutable (ImmutableList, ImmutableArray, ImmutableDictionary) nunca mudam: operações como Add devolvem uma NOVA coleção, compartilhando partes internas. São seguras para várias threads sem trava e ideais para valores que circulam entre componentes.',
            'var lista = new List<int> { 1, 2 };\nvar visao = lista.AsReadOnly();\nlista.Add(3);\nConsole.WriteLine(visao.Count);          // 3 (a visão enxerga a mudança)\n\nvar im = ImmutableList.Create(1, 2);\nvar im2 = im.Add(3);\nConsole.WriteLine($"{im.Count} {im2.Count}");   // 2 3 (im não mudou)'
          ),
          sl(
            'Capacidade, realocação e escolha final',
            'List<T> guarda os itens num array interno. Quando enche, aloca um array maior (o dobro) e copia tudo: O(n) naquele momento, o que dá o custo amortizado O(1) do Add. Se você sabe o tamanho aproximado, informe a capacidade no construtor (new List<int>(10_000), o mesmo vale para Dictionary) e evite realocações e lixo. Capacity é o tamanho do array; Count, quantos itens existem. Para escolher: sequência indexada → List; busca por chave → Dictionary; unicidade/pertencimento → HashSet; ordem por chave → SortedDictionary/SortedSet; fila → Queue; pilha → Stack; nunca mude de estrutura sem medir quando o ganho for pequeno.',
            'var l = new List<int>();\nConsole.WriteLine(l.Capacity);   // 0\nl.Add(1);\nConsole.WriteLine(l.Capacity);   // 4\n\nvar grande = new List<int>(10_000);   // evita realocações sucessivas'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a complexidade média de Contains em uma List<T> e em um HashSet<T>?', 'b', [
          'O(1) nos dois',
          'O(n) na List e O(1) no HashSet',
          'O(log n) na List e O(n) no HashSet',
          'O(n) nos dois'
        ], 'A lista percorre os elementos; o HashSet usa o hash para ir direto ao balde.'),
        mcq('q2', 'Qual característica distingue SortedDictionary de Dictionary?', 'd', [
          'É mais rápido em todas as operações',
          'Permite chaves duplicadas',
          'É seguro para várias threads',
          'Mantém as chaves ordenadas, com operações O(log n)'
        ], 'SortedDictionary usa árvore balanceada: ordem garantida na iteração, ao custo de O(log n) em vez de O(1).'),
        mcq('q3', 'Qual tipo de retorno expõe uma lista interna de forma que o chamador só consiga ler?', 'a', [
          'IReadOnlyList<T>',
          'List<T>',
          'ICollection<T>',
          'IList<T>'
        ], 'IReadOnlyList<T> oferece Count e indexador, sem Add/Remove. As outras permitem modificar.'),
        fill('q4', 'Qual método estático mistura campos para formar um hash code de qualidade?', 'public override int GetHashCode() => HashCode.___(Id, Nome);', ['Combine'], 'HashCode.Combine mistura valores com boa distribuição, sem escrever fórmulas manuais.'),
        mcq('q5', 'Qual regra deve valer entre Equals e GetHashCode?', 'c', [
          'Objetos com o mesmo hash precisam ser iguais',
          'GetHashCode deve devolver sempre um valor aleatório',
          'Objetos iguais (Equals) devem ter o mesmo GetHashCode',
          'Só um dos dois pode ser sobrescrito'
        ], 'Iguais → mesmo hash. O inverso não vale: hashes iguais podem ser de objetos diferentes (colisão).'),
        mcq('q6', 'O que imprime?\nvar lista = new List<int> { 1, 2 };\nvar visao = lista.AsReadOnly();\nlista.Add(3);\nConsole.WriteLine(visao.Count);', 'd', [
          '2',
          '0',
          'Lança exceção',
          '3'
        ], 'ReadOnlyCollection é uma visão sobre a lista: reflete as mudanças feitas pelo dono. Só ImmutableList seria um instantâneo imutável.'),
        mcq('q7', 'Para que informar a capacidade ao criar uma List<int>(10_000)?', 'c', [
          'Para limitar a lista a 10 mil itens',
          'Para a lista ficar ordenada',
          'Para evitar realocações e cópias sucessivas do array interno ao adicionar muitos itens',
          'Para torná-la thread-safe'
        ], 'A capacidade é só o tamanho do array interno; ela não limita Count, apenas reduz as realocações.'),
        fill('q8', 'Que comparador permite um HashSet<string> tratar "Ola" e "OLA" como iguais?', 'var conj = new HashSet<string>(StringComparer.___);', ['OrdinalIgnoreCase'], 'StringComparer.OrdinalIgnoreCase compara caractere a caractere ignorando maiúsculas e minúsculas.')
      ]
    },
    {
      id: 'csi-11-atributos-reflexao',
      title: 'Atributos e reflexão',
      goal: 'Declarar e ler atributos com reflexão, conhecer o custo e os riscos da reflexão e das variáveis dynamic.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Atributos: metadados no código',
            'Um atributo é uma etiqueta [Nome(...)] colocada em tipos, métodos, propriedades etc. Ele não muda a lógica por si: guarda informação (metadados) que o compilador, frameworks ou seu próprio código leem. Exemplos embutidos: [Obsolete("use Novo()")] gera aviso de compilação ao usar o membro (com true, vira erro); [Flags] em enums; [Conditional("DEBUG")] faz chamadas sumirem fora do Debug; [CallerMemberName] injeta o nome de quem chamou; [Serializable] é um marcador legado, hoje pouco usado.',
            'class Servico\n{\n    [Obsolete("Use CalcularV2")]\n    public int Calcular() => 1;     // chamar gera warning de compilação\n\n    public int CalcularV2() => 2;\n}\n\n[Flags] enum Permissao { Ler = 1, Escrever = 2, Apagar = 4 }\nConsole.WriteLine(Permissao.Ler | Permissao.Escrever);   // Ler, Escrever'
          ),
          sl(
            'Criando um atributo próprio',
            'Um atributo é uma classe que herda de System.Attribute; por convenção o nome termina em Attribute, e ao aplicar você pode omitir o sufixo ([Apelido("x")]). Os parâmetros do construtor são os valores informados. [AttributeUsage] define onde pode ser aplicado e se pode repetir. Só aceita valores constantes (números, strings, typeof, enums).',
            '[AttributeUsage(AttributeTargets.Property)]\nclass ApelidoAttribute : Attribute\n{\n    public string Nome { get; }\n    public ApelidoAttribute(string nome) => Nome = nome;\n}\n\nclass Usuario\n{\n    [Apelido("nome_exibicao")]\n    public string Nome { get; set; } = "";\n    public string Cidade { get; set; } = "";\n}'
          ),
          sl(
            'typeof, GetType e o objeto Type',
            'Reflexão é a capacidade de um programa examinar a si mesmo em tempo de execução. O ponto de partida é System.Type, que descreve um tipo (nome, membros, atributos). typeof(X) obtém o Type conhecido em tempo de compilação; objeto.GetType() obtém o tipo REAL do objeto em tempo de execução, mesmo que a variável seja de um tipo base ou object.',
            'Type t = typeof(string);\nConsole.WriteLine(t.Name);          // String\n\nobject o = 5;\nConsole.WriteLine(o.GetType().Name);   // Int32\nobject l = new List<int>();\nConsole.WriteLine(l.GetType().Name);   // List`1'
          ),
          sl(
            'Ler membros e atributos; criar objetos',
            'Type.GetProperties(), GetMethods() e GetFields() listam membros públicos (BindingFlags refina). PropertyInfo.GetValue(objeto) lê o valor; MethodInfo.Invoke chama o método; GetCustomAttribute<T>() lê um atributo (devolve null se não houver). Activator.CreateInstance(tipo) cria um objeto a partir de um Type. É assim que serializadores, ORMs e containers de DI descobrem seu código.',
            'var u = new Usuario { Nome = "Ana", Cidade = "Recife" };\nforeach (var p in typeof(Usuario).GetProperties())\n{\n    var a = p.GetCustomAttribute<ApelidoAttribute>();\n    Console.WriteLine($"{p.Name} -> {a?.Nome ?? "(sem)"} = {p.GetValue(u)}");\n}\n// Nome -> nome_exibicao = Ana\n// Cidade -> (sem) = Recife\n\nvar lista = (List<int>)Activator.CreateInstance(typeof(List<int>))!;\nConsole.WriteLine(lista.Count);   // 0'
          ),
          sl(
            'Custo e riscos da reflexão',
            'Reflexão é mais lenta que chamadas diretas e impede otimizações do compilador, então cache os Type, PropertyInfo e MethodInfo em vez de procurar a cada uso. Ela também ignora o encapsulamento: com BindingFlags.NonPublic lê e escreve membros privados, quebrando invariantes das classes. O risco de segurança maior é criar tipos ou chamar métodos a partir de NOMES VINDOS DE ENTRADA NÃO CONFIÁVEL (Type.GetType(texto) + Activator): o usuário passaria a escolher qual código roda. Nomes para reflexão devem vir de uma lista fechada. Além disso, reflexão é incompatível com trimming e compilação AOT sem anotações.',
            '// PERIGOSO: o texto vem do usuário\n// var tipo = Type.GetType(requisicao.NomeDoTipo);\n// var obj = Activator.CreateInstance(tipo!);\n\n// SEGURO: lista fechada\nvar permitidos = new Dictionary<string, Type> { ["lista"] = typeof(List<int>) };\nif (permitidos.TryGetValue("lista", out var tipoSeguro))\n    Console.WriteLine(Activator.CreateInstance(tipoSeguro) is not null);   // True'
          ),
          sl(
            'Alternativas modernas e o dynamic',
            'Source generators geram código C# durante a compilação, fazendo em tempo de build o que a reflexão faria em tempo de execução: mais rápido, compatível com AOT e verificado pelo compilador (System.Text.Json e [GeneratedRegex] oferecem isso). O tipo dynamic adia a checagem de membros para a execução: a chamada compila sempre, mas se o membro não existir lança RuntimeBinderException; perde IntelliSense e segurança de tipos e é mais lento. Reserve dynamic para interoperabilidade pontual (COM, dados sem esquema) e prefira tipos reais.',
            'dynamic d = "abc";\nConsole.WriteLine(d.Length);   // 3 (resolvido em execução)\ntry { d.Nada(); }              // compila!\ncatch (Microsoft.CSharp.RuntimeBinder.RuntimeBinderException)\n{\n    Console.WriteLine("não existe");   // só falha em execução\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o efeito de aplicar [Obsolete("Use CalcularV2")] a um método?', 'c', [
          'O método deixa de existir',
          'Ele é removido na compilação',
          'Quem o usa recebe um aviso de compilação com a mensagem (ou erro, se o segundo parâmetro for true)',
          'Ele só pode ser chamado por reflexão'
        ], 'Obsolete é apenas um metadado que o compilador usa para avisar; o código continua funcionando.'),
        mcq('q2', 'O que imprime?\nobject o = 5;\nConsole.WriteLine(o.GetType().Name);', 'a', [
          'Int32',
          'Object',
          'int',
          'ValueType'
        ], 'GetType() devolve o tipo REAL em execução: System.Int32, cujo Name é Int32.'),
        mcq('q3', 'O que um atributo próprio precisa para ser um atributo?', 'd', [
          'Implementar IDisposable',
          'Ser uma struct',
          'Ter um método Apply',
          'Herdar de System.Attribute'
        ], 'A convenção é nomear com sufixo Attribute e herdar de Attribute; [AttributeUsage] controla onde se aplica.'),
        fill('q4', 'Que método de Type lista as propriedades públicas de um tipo?', 'var props = typeof(Usuario).___();', ['GetProperties'], 'GetProperties devolve PropertyInfo[]; com GetValue(objeto) lê-se cada valor.'),
        mcq('q5', 'Qual o principal risco de segurança de Type.GetType(nomeRecebidoDoUsuario) seguido de Activator.CreateInstance?', 'b', [
          'É lento demais',
          'O usuário passa a escolher qual tipo (e qual código) será instanciado e executado',
          'Consome mais memória',
          'Só funciona em Debug'
        ], 'Nomes usados em reflexão não devem vir de entrada não confiável; use uma lista fechada de tipos permitidos.'),
        mcq('q6', 'Qual alternativa moderna evita o custo e as limitações da reflexão em tempo de execução, gerando o código na compilação?', 'a', [
          'Source generators',
          'dynamic',
          'GC.Collect()',
          'Atributos [Obsolete]'
        ], 'Source generators produzem código em build: mais rápido e compatível com AOT e trimming.'),
        mcq('q7', 'Com dynamic d = "abc";, o que acontece ao escrever d.Nada();?', 'c', [
          'Erro de compilação',
          'Nada acontece, a chamada é ignorada',
          'Compila, mas lança RuntimeBinderException ao executar',
          'Retorna null'
        ], 'dynamic adia a checagem de membros para a execução, perdendo a segurança do compilador.'),
        fill('q8', 'De que classe base todo atributo herda?', 'class ApelidoAttribute : ___\n{\n    public string Nome { get; }\n    public ApelidoAttribute(string nome) => Nome = nome;\n}', ['Attribute', 'System.Attribute'], 'System.Attribute é a base de todos os atributos.')
      ]
    },
    {
      id: 'csi-12-excecoes-avancadas',
      title: 'Exceções avançadas e resiliência',
      goal: 'Tratar exceções com filtros e hierarquias próprias, repetir operações com backoff e registrar falhas sem vazar dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Filtros de exceção com when',
            'Um catch pode ter um filtro: catch (Tipo e) when (condição). O filtro é avaliado ANTES de a pilha ser desfeita; se der false, a exceção não é capturada aquele catch e segue procurando outro. Isso é melhor que capturar e relançar, porque preserva o estado e a pilha original. Os catch são testados de cima para baixo e vale o primeiro cujo tipo e filtro casam.',
            'try\n{\n    throw new ArgumentException("x");\n}\ncatch (ArgumentException e) when (e.Message == "y")\n{\n    Console.WriteLine("especifica");\n}\ncatch (ArgumentException)\n{\n    Console.WriteLine("generica");   // generica\n}'
          ),
          sl(
            'Hierarquia própria e relançar sem perder a pilha',
            'Crie uma exceção base para seu domínio (AppException : Exception) e derive as específicas (PedidoNaoEncontradoException); assim quem chama captura o grupo ou o caso. Para relançar dentro de um catch use throw; que preserva o stack trace; throw ex; ZERA a pilha (esconde a origem). Para relançar mais tarde ou em outro contexto mantendo a pilha, use ExceptionDispatchInfo.Capture(ex).Throw(). Nunca engula exceções com catch vazio: o erro some e o programa segue em estado inconsistente.',
            'class AppException : Exception\n{\n    public AppException(string msg, Exception? inner = null) : base(msg, inner) { }\n}\nclass PedidoNaoEncontradoException : AppException\n{\n    public PedidoNaoEncontradoException(int id) : base($"Pedido {id} não encontrado") { }\n}\n\ntry { try { throw new Exception("a"); }\n      catch (Exception ex) { ExceptionDispatchInfo.Capture(ex).Throw(); } }\ncatch (Exception e) { Console.WriteLine(e.Message); }   // a'
          ),
          sl(
            'AggregateException e await',
            'Quando várias tasks falham (Task.WhenAll) ou quando você usa .Wait()/.Result, as exceções ficam guardadas em uma AggregateException, com a lista em InnerExceptions. O await é mais amigável: relança apenas a PRIMEIRA exceção, sem o embrulho. Para ver todas, guarde a Task e leia task.Exception.InnerExceptions no catch. Flatten() achata agregados aninhados.',
            'static async Task Falha(int i)\n{\n    await Task.Delay(10);\n    throw new InvalidOperationException("f" + i);\n}\n\nvar t = Task.WhenAll(Falha(1), Falha(2));\ntry { await t; }\ncatch (Exception e)\n{\n    Console.WriteLine(e.Message);                       // f1  (só a primeira)\n    Console.WriteLine(t.Exception!.InnerExceptions.Count);   // 2   (todas estão na Task)\n}'
          ),
          sl(
            'Exceção ou Result?',
            'Exceções são para situações excepcionais, que quem chamou não espera nem consegue tratar ali. Erros ESPERADOS no fluxo normal (campo inválido, item não encontrado, tentativa de converter texto) são melhor representados por retorno: o padrão Try (bool TryParse(...)), um enum de status ou um tipo Resultado. Motivos: lançar e capturar é bem mais lento que retornar um valor, e o tipo de retorno obriga o chamador a considerar a falha. Use exceção para bugs e falhas inesperadas (rede caiu, disco cheio).',
            'static bool TryDividir(int a, int b, out int resultado)\n{\n    resultado = 0;\n    if (b == 0) return false;      // erro esperado: sem exceção\n    resultado = a / b;\n    return true;\n}\n\nif (TryDividir(10, 0, out var r)) Console.WriteLine(r);\nelse Console.WriteLine("divisão inválida");   // divisão inválida'
          ),
          sl(
            'Retry com backoff exponencial e jitter; idempotência',
            'Falhas transitórias (timeout, 503) muitas vezes passam se você tentar de novo. Mas tentar imediatamente e sempre na mesma cadência sobrecarrega o serviço que já está ruim. Backoff exponencial dobra a espera a cada tentativa (100, 200, 400 ms...) e jitter soma um valor aleatório, para que muitos clientes não repitam todos ao mesmo tempo. Só repita erros transitórios, limite o número de tentativas e respeite o CancellationToken. E só repita operações IDEMPOTENTES (repetir não duplica o efeito: um GET, um PUT, ou um POST com chave de idempotência); repetir "cobrar o cartão" sem essa garantia cobra duas vezes.',
            'static async Task<T> TentarAsync<T>(Func<Task<T>> op, int max = 4, CancellationToken ct = default)\n{\n    for (int i = 1; ; i++)\n    {\n        try { return await op(); }\n        catch (HttpRequestException) when (i < max)\n        {\n            var espera = TimeSpan.FromMilliseconds(100 * Math.Pow(2, i - 1) + Random.Shared.Next(0, 50));\n            await Task.Delay(espera, ct);   // 100, 200, 400 ms (+ jitter)\n        }\n    }\n}'
          ),
          sl(
            'Cancelamento, logs sem dados pessoais e Polly',
            'OperationCanceledException indica cancelamento pedido, não falha: não deve ser repetida nem registrada como erro (filtre com when (ct.IsCancellationRequested)). Ao registrar exceções, passe o objeto de exceção ao logger (ele guarda tipo e pilha) e identifique o caso por IDs; NÃO coloque dados pessoais ou segredos na mensagem (e-mail, CPF, senha, token), pois logs são copiados e retidos (LGPD). Mensagens para o usuário final devem ser genéricas, sem detalhes internos. Em projetos reais, a biblioteca Polly e os pacotes de resiliência do .NET oferecem retry, timeout, circuit breaker (parar de chamar um serviço que está caindo) e outras políticas prontas, em vez de reescrever tudo.',
            '// ruim: vaza dado pessoal na mensagem e perde a exceção\n// _logger.LogError("Falha para o CPF " + cpf + ": " + ex.Message);\n\n// bom: ID opaco e a exceção como objeto\n// _logger.LogError(ex, "Falha ao processar pedido {PedidoId}", pedido.Id);\n\ncatch (OperationCanceledException) when (ct.IsCancellationRequested)\n{\n    // cancelamento pedido: encerra sem registrar como erro\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual registro de log é o mais adequado ao tratar uma falha ao processar um pedido?', 'd', [
          'LogError("Falha para o CPF " + cpf + ": " + ex.Message)',
          'LogError("erro")',
          'LogError("Falha: " + ex.Message), apagando a pilha',
          'LogError(ex, "Falha ao processar pedido {PedidoId}", pedido.Id)'
        ], 'Passa a exceção (tipo e pilha) e um ID opaco, sem dados pessoais. Concatenar texto também perde a estrutura do log.'),
        mcq('q2', 'O que imprime?\ntry { throw new ArgumentException("x"); }\ncatch (ArgumentException e) when (e.Message == "y") { Console.WriteLine("especifica"); }\ncatch (ArgumentException) { Console.WriteLine("generica"); }', 'b', [
          'especifica',
          'generica',
          'especifica e generica',
          'A exceção não é tratada'
        ], 'O filtro dá false, então o primeiro catch é ignorado e o segundo captura.'),
        mcq('q3', 'Qual situação é melhor modelada por retorno (Try/Result) do que por exceção?', 'c', [
          'O disco ficou sem espaço',
          'A conexão de rede caiu no meio de uma operação',
          'O usuário digitou um valor inválido em um campo de formulário',
          'Um bug de índice fora do intervalo'
        ], 'Erros esperados do fluxo normal devem ser valores de retorno; exceções são para o inesperado e são mais caras.'),
        fill('q4', 'Que palavra adiciona um filtro condicional a um catch?', 'catch (HttpRequestException) ___ (tentativa < max)', ['when'], 'catch ... when (condição) só captura se a condição for verdadeira, preservando a pilha caso contrário.'),
        mcq('q5', 'Com var t = Task.WhenAll(Falha(1), Falha(2)); e ambas lançando, o que acontece no try { await t; } catch (Exception e)?', 'a', [
          'e é a primeira exceção; as duas ficam em t.Exception.InnerExceptions',
          'e é sempre uma AggregateException com as duas',
          'Nenhuma exceção chega ao catch',
          'Só a última exceção é guardada'
        ], 'await relança apenas a primeira exceção sem embrulho; a Task mantém todas na AggregateException da propriedade Exception.'),
        mcq('q6', 'Por que adicionar jitter (aleatoriedade) ao backoff exponencial?', 'b', [
          'Para tornar a espera sempre menor',
          'Para que muitos clientes não repitam todos no mesmo instante e sobrecarreguem o serviço de novo',
          'Para evitar OperationCanceledException',
          'Para dispensar o limite de tentativas'
        ], 'Sem jitter, clientes sincronizados voltam todos juntos. A aleatoriedade espalha as tentativas.'),
        mcq('q7', 'O que garantir antes de repetir automaticamente a operação "cobrar o cartão" em caso de timeout?', 'c', [
          'Aumentar o número de tentativas',
          'Usar catch vazio',
          'Que ela seja idempotente (por exemplo, com chave de idempotência), para não cobrar duas vezes',
          'Usar throw ex; em vez de throw;'
        ], 'Repetir sem idempotência pode duplicar o efeito. A chave de idempotência faz o servidor reconhecer a repetição.'),
        fill('q8', 'Que método de ExceptionDispatchInfo relança a exceção preservando a pilha original?', 'ExceptionDispatchInfo.Capture(ex).___();', ['Throw'], 'Capture(ex).Throw() relança a exceção capturada mantendo o stack trace de origem.')
      ]
    },
    {
      id: 'csi-13-span-strings-memoria',
      title: 'Span, Memory e strings eficientes',
      goal: 'Reduzir alocações com Span e Memory, montar strings com eficiência e comparar texto com a StringComparison correta.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Alocações custam: o problema do Substring',
            'Toda string é imutável: qualquer operação que "altera" texto cria uma nova string no heap. Substring, Split, Trim (quando há o que cortar) e a concatenação alocam objetos que o GC terá de recolher depois. Em código chamado milhões de vezes (parsers, servidores, laços quentes), isso vira pressão no GC e pausas. A ideia dos tipos desta lição é olhar para um pedaço de memória que já existe, sem copiá-lo.',
            'string linha = "2024-05-17";\nstring ano = linha.Substring(0, 4);   // NOVA string alocada\nConsole.WriteLine(ano);               // 2024'
          ),
          sl(
            'Span<T> e ReadOnlySpan<char>',
            'Span<T> é uma "janela" (início + tamanho) sobre memória contígua já existente: um array, parte de uma string, memória da pilha. Fatiar um span é só mudar a janela: nenhuma cópia, nenhuma alocação. ReadOnlySpan<T> é a versão só leitura (strings são imutáveis, então AsSpan() devolve ReadOnlySpan<char>). Span é uma ref struct: vive só na pilha, por isso NÃO pode ser campo de classe, ser capturado por lambda ou atravessar um await. Escrever num span altera o array original.',
            'string linha = "2024-05-17";\nReadOnlySpan<char> ano = linha.AsSpan(0, 4);   // sem alocar\nConsole.WriteLine(int.Parse(ano));             // 2024\nConsole.WriteLine(linha.AsSpan()[5..7].ToString());   // 05\n\nint[] arr = { 1, 2, 3, 4 };\nSpan<int> sp = arr;\nsp[1..3].Fill(0);                              // escreve no array original\nConsole.WriteLine(string.Join(",", arr));      // 1,0,0,4'
          ),
          sl(
            'Memory<T>: o irmão que pode ficar no heap',
            'Como Span não pode ser guardado em campos nem usado com await, o .NET oferece Memory<T> (e ReadOnlyMemory<T>): uma struct comum, que pode ser campo, ir para o heap e ser passada a métodos async. Quando precisar operar sobre os dados, use a propriedade .Span, que dá um Span temporário. Regra: Span em métodos síncronos locais; Memory quando o dado precisa viver mais (campos, async). As APIs modernas de Stream (ReadAsync, WriteAsync) aceitam Memory<byte>.',
            'byte[] dados = new byte[100];\nMemory<byte> mem = dados.AsMemory(10, 20);   // pode guardar em campo, passar a async\nmem.Span[0] = 7;                             // acessa como Span\nConsole.WriteLine(dados[10]);                // 7'
          ),
          sl(
            'stackalloc e ArrayPool<T>',
            'stackalloc reserva um buffer pequeno na PILHA (não no heap): zero trabalho para o GC e liberado sozinho ao sair do método. Use só para tamanhos pequenos e controlados por você, NUNCA derivados de entrada do usuário: um tamanho grande estoura a pilha e derruba o processo. Para buffers maiores e reutilizáveis, ArrayPool<T>.Shared.Rent(tamanho) empresta um array (que pode vir MAIOR que o pedido e com lixo de usos anteriores) e Return o devolve; devolva sempre num finally e não use o array depois de devolvê-lo.',
            'Span<byte> pequeno = stackalloc byte[16];\nConsole.WriteLine(pequeno.Length);        // 16\n\nbyte[] emprestado = ArrayPool<byte>.Shared.Rent(1024);\ntry\n{\n    // usa os primeiros 1024 bytes (emprestado.Length pode ser maior)\n}\nfinally\n{\n    ArrayPool<byte>.Shared.Return(emprestado);\n}'
          ),
          sl(
            'StringBuilder e string.Create',
            'Em laços, texto += pedaço cria uma string nova a cada volta, copiando tudo: custo quadrático. StringBuilder acumula num buffer interno e só gera a string no ToString(); use quando há muitas concatenações ou o número delas é desconhecido (para duas ou três, a concatenação normal ou a interpolação servem). string.Create(tamanho, estado, preenche) cria a string já com o tamanho final, deixando você escrever diretamente no Span dela, com uma única alocação.',
            'var sb = new StringBuilder();\nfor (int i = 0; i < 3; i++) sb.Append(i).Append(\',\');\nConsole.WriteLine(sb.ToString());   // 0,1,2,\n\nstring id = string.Create(5, 7, (span, n) =>\n{\n    span.Fill(\'x\');\n    span[0] = \'I\';\n});\nConsole.WriteLine(id);              // Ixxxx'
          ),
          sl(
            'Comparação: Ordinal ou cultura?',
            'Comparar strings pode ser feito de dois modos. Ordinal compara os valores numéricos dos caracteres: rápido e idêntico em qualquer máquina. Com cultura, segue regras linguísticas do idioma atual (ordenação, acentos, caixa), que variam entre computadores: no turco, por exemplo, o "i" maiúsculo é "İ". Para dados TÉCNICOS (chaves, identificadores, nomes de arquivo, protocolos, comparações de segurança) use StringComparison.Ordinal ou OrdinalIgnoreCase; para texto mostrado ao usuário, ordenação e busca, use a cultura. Atenção: vários métodos que recebem string (como StartsWith e Compare) usam cultura se você não informar nada.',
            'string a = "Arquivo", b = "ARQUIVO";\nConsole.WriteLine(string.Equals(a, b, StringComparison.Ordinal));            // False\nConsole.WriteLine(string.Equals(a, b, StringComparison.OrdinalIgnoreCase));  // True\n\nbool ehHttps = url.StartsWith("https://", StringComparison.Ordinal);   // explícito, rápido'
          ),
          sl(
            'Quando vale a pena otimizar',
            'Código claro vem primeiro. Otimizar alocações torna o código mais difícil de ler e de manter, então só compensa em caminhos quentes, e comprovado por medição: use um profiler ou BenchmarkDotNet antes e depois. Passos comuns, do mais simples ao mais radical: evitar trabalho repetido, usar StringBuilder, passar a Span/ReadOnlySpan para fatiar, pré-dimensionar coleções, reutilizar buffers com ArrayPool. Em aplicações comuns, a maior parte dessas otimizações não faz diferença perceptível.',
            '// regra: meça antes de otimizar\n// 1) escreva claro e correto\n// 2) meça (BenchmarkDotNet / profiler)\n// 3) otimize SÓ o que a medição apontou, e meça de novo'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença de custo entre linha.Substring(0, 4) e linha.AsSpan(0, 4)?', 'a', [
          'Substring aloca uma nova string; AsSpan só cria uma janela sobre a memória existente',
          'AsSpan copia os caracteres; Substring não',
          'Não há diferença',
          'Substring usa a pilha e AsSpan usa o heap'
        ], 'Span não copia: é apenas início e tamanho sobre os dados originais. Substring copia para um novo objeto.'),
        mcq('q2', 'Por que um campo Span<int> não pode existir em uma classe comum?', 'd', [
          'Porque Span exige herança',
          'Porque Span é thread-safe',
          'Porque Span é mais lento que arrays',
          'Span é uma ref struct: precisa viver na pilha e não pode ir para o heap (campos de classe)'
        ], 'Por isso também não atravessa await nem é capturado por lambda. Para esses casos usa-se Memory<T>.'),
        mcq('q3', 'O que imprime?\nint[] arr = { 1, 2, 3, 4 };\nSpan<int> sp = arr;\nsp[1..3].Fill(0);\nConsole.WriteLine(string.Join(",", arr));', 'c', [
          '1,2,3,4',
          '0,0,0,0',
          '1,0,0,4',
          '1,0,3,4'
        ], 'O span é uma janela sobre o array; a fatia [1..3] cobre os índices 1 e 2, que recebem 0 no próprio array.'),
        fill('q4', 'Qual palavra-chave aloca um buffer pequeno na pilha, sem passar pelo GC?', 'Span<byte> buf = ___ byte[16];', ['stackalloc'], 'stackalloc reserva memória na pilha, liberada ao sair do método. Só para tamanhos pequenos e controlados.'),
        mcq('q5', 'Quando usar Memory<T> em vez de Span<T>?', 'b', [
          'Quando se quer mais desempenho que Span',
          'Quando o dado precisa ser guardado em um campo ou usado em métodos async',
          'Quando o buffer é pequeno',
          'Nunca, são idênticos'
        ], 'Memory<T> é uma struct comum que pode ir ao heap e atravessar await; o Span é obtido por .Span quando for operar.'),
        mcq('q6', 'Por que texto += pedaço em um laço de milhares de voltas é problema?', 'a', [
          'Cada volta cria uma string nova copiando tudo, custo quadrático; StringBuilder evita isso',
          'Porque string não aceita o operador +=',
          'Porque o laço trava a thread',
          'Porque o GC não coleta strings'
        ], 'Strings são imutáveis. StringBuilder acumula no buffer interno e gera a string final uma só vez.'),
        mcq('q7', 'Qual comparação é a mais indicada para comparar identificadores técnicos (como nomes de chaves ou de arquivo) de forma previsível em qualquer máquina?', 'c', [
          'StringComparison.CurrentCulture',
          'StringComparison.CurrentCultureIgnoreCase',
          'StringComparison.Ordinal ou OrdinalIgnoreCase',
          'StringComparison.InvariantCultureIgnoreCase em dados de segurança'
        ], 'Ordinal ignora regras de idioma e é rápido e determinístico. Cultura é para texto exibido ao usuário.'),
        fill('q8', 'Que método de ArrayPool<byte>.Shared empresta um array reutilizável?', 'byte[] emprestado = ArrayPool<byte>.Shared.___(1024);', ['Rent'], 'Rent empresta (podendo devolver array maior); Return o devolve ao pool, de preferência em um finally.')
      ]
    },
    {
      id: 'csi-14-regex',
      title: 'Expressões regulares',
      goal: 'Escrever e aplicar regex com segurança: grupos, opções, GeneratedRegex, timeouts contra ReDoS e os limites da validação por regex.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Sintaxe básica',
            'Uma regex é um padrão de texto. Literais casam com eles mesmos. Classes: \\d (dígito), \\w (letra, dígito ou _), \\s (espaço), . (qualquer caractere exceto quebra de linha), [a-z] (um dos listados), [^0-9] (qualquer um MENOS os listados). Quantificadores: * (zero ou mais), + (um ou mais), ? (zero ou um), {n}, {n,m}. Âncoras: ^ (início), $ (fim), \\b (limite de palavra). | é "ou". Em C#, escreva o padrão numa string verbatim @"..." para não duplicar as contrabarras.',
            'using System.Text.RegularExpressions;\n\nConsole.WriteLine(Regex.IsMatch("abc123", @"^[a-z]+\\d+$"));   // True\nConsole.WriteLine(Regex.IsMatch("abc", @"^\\d+$"));            // False\nConsole.WriteLine(Regex.IsMatch("gato", @"gato|cao"));        // True'
          ),
          sl(
            'Match, Matches, Replace e Split',
            'IsMatch responde sim/não. Match devolve a PRIMEIRA ocorrência (Success, Value, Index). Matches devolve todas. Replace troca as ocorrências. Split divide o texto usando o padrão como separador. Os métodos estáticos de Regex recebem o padrão a cada chamada (há um cache interno); para uso repetido em laços, crie e reaproveite um objeto Regex.',
            'var m = Regex.Match("pedido 42 e 77", @"\\d+");\nConsole.WriteLine(m.Value);                             // 42\nConsole.WriteLine(Regex.Matches("pedido 42 e 77 e 5", @"\\d+").Count);   // 3\nConsole.WriteLine(Regex.Replace("a1b22", @"\\d+", "#"));  // a#b#\nConsole.WriteLine(string.Join("|", Regex.Split("a, b;c", @"[,;]\\s*")));   // a|b|c'
          ),
          sl(
            'Grupos e grupos nomeados',
            'Parênteses criam um grupo de captura, numerado da esquerda para a direita (o grupo 0 é o casamento inteiro). Grupos nomeados, (?<nome>...), são mais legíveis e acessados por m.Groups["nome"]. (?:...) agrupa SEM capturar. No Replace, $1, $2 ou ${nome} reinserem o que foi capturado, o que serve para reordenar partes do texto.',
            'var m = Regex.Match("2024-05-17", @"(?<ano>\\d{4})-(?<mes>\\d{2})-(?<dia>\\d{2})");\nConsole.WriteLine(m.Groups["mes"].Value);   // 05\n\nvar br = Regex.Replace("2024-05-17", @"(\\d{4})-(\\d{2})-(\\d{2})", "$3/$2/$1");\nConsole.WriteLine(br);                       // 17/05/2024'
          ),
          sl(
            'RegexOptions e [GeneratedRegex]',
            'RegexOptions altera o comportamento: IgnoreCase (ignora maiúsculas), Multiline (^ e $ casam em cada linha), Singleline (o . casa também a quebra de linha), CultureInvariant (não depende da cultura) e Compiled (gera código otimizado em execução, com custo de partida). Os modos se combinam com |. A forma moderna é o atributo [GeneratedRegex] numa classe partial: um source generator cria o código do casamento na COMPILAÇÃO, rápido, sem custo de montagem em execução e compatível com AOT.',
            'var r = new Regex("ola", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);\nConsole.WriteLine(r.IsMatch("OLA mundo"));   // True\n\nstatic partial class Validadores\n{\n    [GeneratedRegex(@"^\\d{5}-\\d{3}$")]\n    public static partial Regex Cep();\n}\nConsole.WriteLine(Validadores.Cep().IsMatch("50000-000"));   // True'
          ),
          sl(
            'Validação de entrada: âncoras e allow-list',
            'Sem âncoras, a regex procura o padrão EM QUALQUER LUGAR do texto: IsMatch("abc; DROP", "[a-z]+") é True, pois acha "abc". Para validar o texto INTEIRO, ancore com ^ e $. Cuidado: $ também casa antes de uma quebra de linha final ("abc\\n" casa com ^abc$); quando isso importa, use \\z para exigir o fim absoluto. Pense em allow-list: descreva exatamente o que é aceito (^[A-Za-z0-9_]{3,20}$) em vez de tentar listar o que é proibido. Limite também o tamanho da entrada ANTES de aplicar a regex.',
            'Console.WriteLine(Regex.IsMatch("abc123", @"[a-z]+"));     // True  (achou um pedaço)\nConsole.WriteLine(Regex.IsMatch("abc123", @"^[a-z]+$"));   // False (texto inteiro)\n\nbool usuarioValido = entrada.Length <= 20 && Regex.IsMatch(entrada, @"^[A-Za-z0-9_]{3,20}\\z");'
          ),
          sl(
            'ReDoS: backtracking catastrófico e matchTimeout',
            'O motor de regex padrão tenta caminhos alternativos (backtracking) quando um casamento falha. Padrões com quantificadores aninhados ou ambíguos, como ^(a+)+$, podem gerar um número EXPONENCIAL de tentativas numa entrada quase correta ("aaaa...a!"): a CPU fica presa por segundos ou minutos. É o ReDoS (negação de serviço por regex): um atacante envia uma só requisição maliciosa e derruba o servidor. Defesas: evitar quantificadores aninhados, limitar o tamanho da entrada e SEMPRE definir um matchTimeout, que lança RegexMatchTimeoutException. A opção RegexOptions.NonBacktracking usa outro motor sem esse risco, com menos recursos.',
            'var r = new Regex(@"^(a+)+$", RegexOptions.None, TimeSpan.FromMilliseconds(200));\ntry\n{\n    r.IsMatch(new string(\'a\', 40) + "!");   // explodiria sem timeout\n}\ncatch (RegexMatchTimeoutException)\n{\n    Console.WriteLine("timeout");            // timeout\n}'
          ),
          sl(
            'Limites: e-mail e CPF não se validam só com regex',
            'Regex valida o FORMATO, não a verdade. Um CPF tem dígitos verificadores calculados: 000.000.000-00 tem o formato certo e é inválido; só um algoritmo (ou consulta oficial) confirma. Para e-mail, uma regex perfeita é praticamente impossível e, mesmo que o formato esteja certo, só enviar uma mensagem de confirmação prova que o endereço existe e é da pessoa. Use a regex como filtro grosseiro de formato (por exemplo, para rejeitar lixo óbvio) e complemente com validação real. LGPD: ao registrar falhas de validação, não grave o valor digitado (pode ser dado pessoal); registre só o motivo.',
            '// formato aceito pela regex ≠ documento válido\nConsole.WriteLine(Regex.IsMatch("000.000.000-00", @"^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$"));   // True\n// ...mas os dígitos verificadores precisam ser calculados em código\n\n// log sem dado pessoal:\n// logger.LogWarning("Documento com formato invalido");   // sem o valor digitado'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\nConsole.WriteLine(Regex.IsMatch("abc123", @"[a-z]+"));\nConsole.WriteLine(Regex.IsMatch("abc123", @"^[a-z]+$"));', 'b', [
          'True e True',
          'True e False',
          'False e True',
          'False e False'
        ], 'Sem âncoras o padrão acha "abc" dentro do texto. Com ^ e $, o texto inteiro precisa ser só letras, e tem dígitos.'),
        mcq('q2', 'O que imprime?\nvar m = Regex.Match("2024-05-17", @"(?<ano>\\d{4})-(?<mes>\\d{2})");\nConsole.WriteLine(m.Groups["mes"].Value);', 'd', [
          '2024',
          '17',
          '5',
          '05'
        ], 'O grupo nomeado "mes" capturou os dois dígitos depois do primeiro hífen.'),
        mcq('q3', 'Quantas ocorrências conta?\nRegex.Matches("pedido 42 e 77 e 5", @"\\d+").Count', 'a', [
          '3',
          '5',
          '1',
          '2'
        ], '\\d+ casa sequências de um ou mais dígitos: 42, 77 e 5.'),
        fill('q4', 'Qual opção faz a regex ignorar diferenças de maiúsculas e minúsculas?', 'var r = new Regex("ola", RegexOptions.___);', ['IgnoreCase'], 'RegexOptions.IgnoreCase torna o casamento insensível à caixa.'),
        mcq('q5', 'Qual destes padrões é mais suscetível a ReDoS (backtracking catastrófico)?', 'c', [
          '^[a-z]+$',
          '^\\d{3}-\\d{4}$',
          '^(a+)+$',
          '^abc$'
        ], 'O quantificador aninhado (a+)+ permite muitas formas de dividir a mesma sequência de "a", multiplicando as tentativas quando o casamento falha.'),
        mcq('q6', 'O que acontece se o matchTimeout da Regex é estourado?', 'b', [
          'IsMatch devolve false',
          'É lançada RegexMatchTimeoutException',
          'O processo é encerrado',
          'A regex passa a usar menos CPU automaticamente'
        ], 'O timeout interrompe o casamento lançando RegexMatchTimeoutException, que deve ser tratada como entrada inválida.'),
        mcq('q7', 'Por que validar CPF apenas com regex é insuficiente?', 'd', [
          'Porque regex não aceita pontos e traços',
          'Porque regex é lenta demais',
          'Porque CPF não tem formato fixo',
          'Regex só confere o formato; os dígitos verificadores exigem um cálculo, e um número bem formatado pode ser inválido'
        ], 'Um padrão como 000.000.000-00 tem o formato certo e é inválido. Valide o formato com regex e a validade com o algoritmo.'),
        fill('q8', 'Qual atributo faz um source generator criar o código da regex em tempo de compilação?', '[___(@"^\\d{5}-\\d{3}$")]\npublic static partial Regex Cep();', ['GeneratedRegex'], '[GeneratedRegex] em um método partial gera o casamento na compilação: rápido e compatível com AOT.')
      ]
    },
    {
      id: 'csi-15-streams-io-async',
      title: 'Streams e E/S assíncrona',
      goal: 'Ler e gravar dados com streams de forma assíncrona e segura, evitando path traversal e vazamento de arquivos temporários.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Stream: uma sequência de bytes',
            'Stream é a abstração para ler ou gravar bytes em sequência, sem precisar ter tudo na memória. FileStream trabalha com arquivos, MemoryStream com um buffer na memória, e há streams de rede, compressão e criptografia, que se encadeiam. Propriedades importantes: CanRead, CanWrite, CanSeek e Position (onde está o "cursor"). Como o Stream lida com bytes, texto exige uma codificação (encoding): StreamReader e StreamWriter fazem essa ponte (UTF-8 por padrão). Streams são IDisposable: descarte-os com using para liberar o arquivo e descarregar o buffer pendente.',
            'using var ms = new MemoryStream();\nusing (var w = new StreamWriter(ms, leaveOpen: true))   // leaveOpen: não fecha o ms\n{\n    w.Write("ola");\n}                                           // Dispose descarrega o buffer\nms.Position = 0;                            // volta o cursor ao início\nusing var r = new StreamReader(ms);\nConsole.WriteLine(r.ReadToEnd());           // ola'
          ),
          sl(
            'O cursor: por que Position = 0',
            'Depois de gravar, a posição do stream está no FIM dos dados. Se você ler agora, não obtém nada, porque não há mais bytes depois do cursor. Para reler o que foi escrito, reposicione com Position = 0 (ou Seek), disponível quando CanSeek é true. Streams de rede e de entrada padrão normalmente não permitem Seek: só se lê para a frente, uma vez.',
            'using var ms = new MemoryStream();\nms.Write(new byte[] { 1, 2, 3 });\nConsole.WriteLine(ms.Position);   // 3 (cursor no fim)\nms.Position = 0;\nConsole.WriteLine(ms.ReadByte()); // 1'
          ),
          sl(
            'Leitura e escrita assíncronas',
            'Disco e rede são lentos; as versões Async liberam a thread enquanto esperam. File.ReadAllTextAsync e WriteAllTextAsync são práticos para arquivos pequenos, mas carregam o conteúdo INTEIRO na memória: para arquivos grandes, percorra com um stream (por exemplo, StreamReader.ReadLineAsync linha a linha) ou copie em blocos com CopyToAsync. Para E/S assíncrona real em arquivos, abra o FileStream com useAsync: true (File.OpenRead e File.Create já são convenientes). Prefira await using para descartar.',
            'await File.WriteAllTextAsync("exemplo.txt", "linha 1\\nlinha 2");\n\nawait using (var origem = File.OpenRead("exemplo.txt"))\nawait using (var destino = File.Create("copia.txt"))\n{\n    await origem.CopyToAsync(destino);   // copia em blocos, sem carregar tudo\n}\n\nusing var leitor = new StreamReader("copia.txt");\nstring? linha;\nwhile ((linha = await leitor.ReadLineAsync()) != null)\n    Console.WriteLine(linha);   // linha 1, linha 2'
          ),
          sl(
            'Buffers e o valor devolvido por Read',
            'Ao ler em blocos, você fornece um buffer (array) e o stream preenche até o tamanho dele. ReadAsync devolve QUANTOS bytes foram realmente lidos, que pode ser MENOS que o buffer (o fim do arquivo, um pacote de rede pequeno), e 0 quando acabou. Por isso o laço usa o valor devolvido e só processa essa quantidade de bytes do buffer, nunca o array inteiro.',
            'var origem = new MemoryStream(new byte[10000]);\nvar buffer = new byte[4096];\nint lidos, total = 0;\nwhile ((lidos = await origem.ReadAsync(buffer)) > 0)\n{\n    total += lidos;      // 4096, 4096, 1808\n}\nConsole.WriteLine(total);   // 10000'
          ),
          sl(
            'Path e path traversal',
            'Path.Combine junta partes e Path.GetFileName extrai só o nome do arquivo. O perigo é montar um caminho com texto do usuário: um nome como "../../segredo.txt" sobe diretórios (path traversal) e permite ler ou sobrescrever arquivos fora da pasta prevista. E se a segunda parte do Path.Combine for um caminho absoluto, a primeira é DESCARTADA. Defesas: nunca confie em nome de arquivo recebido (gere um nome próprio, como um Guid, ou use só Path.GetFileName); resolva o caminho final com Path.GetFullPath e confirme que ele ainda começa com a pasta permitida, terminada por separador; e dê ao processo o mínimo de permissões no sistema de arquivos.',
            'static string CaminhoSeguro(string raiz, string nome)\n{\n    var baseDir = Path.GetFullPath(raiz) + Path.DirectorySeparatorChar;\n    var completo = Path.GetFullPath(Path.Combine(raiz, nome));\n    if (!completo.StartsWith(baseDir, StringComparison.Ordinal))\n        throw new UnauthorizedAccessException("fora da pasta permitida");\n    return completo;\n}\n\nCaminhoSeguro("dados", "a.txt");       // ok\nCaminhoSeguro("dados", "../../x");     // lança UnauthorizedAccessException'
          ),
          sl(
            'Temporários, permissões, Pipelines e FileSystemWatcher',
            'Arquivos temporários: Path.GetTempFileName() cria um arquivo vazio exclusivo e Path.GetRandomFileName() sugere um nome imprevisível; apague-os ao terminar (try/finally) e não deixe dados sensíveis neles (dados pessoais no disco precisam de retenção mínima, e permissões restritas). Em uploads, valide extensão e tamanho e nunca use o nome enviado como caminho. Visão geral de dois recursos: System.IO.Pipelines (PipeReader/PipeWriter) é uma API de alto desempenho para processar fluxos com buffers gerenciados, usada pelo servidor Kestrel; FileSystemWatcher dispara eventos (Created, Changed, Deleted) quando arquivos mudam, mas pode disparar várias vezes e avisar antes de o arquivo terminar de ser escrito, então trate com tolerância.',
            'string temp = Path.GetTempFileName();   // arquivo vazio, nome único\ntry\n{\n    await File.WriteAllTextAsync(temp, "rascunho");\n    // ... usa ...\n}\nfinally\n{\n    File.Delete(temp);   // não deixe lixo (nem dados) para trás\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença entre Stream e StreamReader?', 'c', [
          'Nenhuma, são o mesmo tipo',
          'Stream só lê texto; StreamReader lê bytes',
          'Stream lida com bytes; StreamReader acrescenta a leitura de texto com uma codificação (encoding)',
          'StreamReader é sempre assíncrono'
        ], 'O Stream é a base em bytes; StreamReader/Writer fazem a ponte para texto, decodificando/codificando (UTF-8 por padrão).'),
        mcq('q2', 'Depois de gravar dados num MemoryStream, por que é preciso fazer ms.Position = 0 antes de ler?', 'a', [
          'Porque o cursor ficou no fim; sem reposicionar, a leitura não encontra bytes depois dele',
          'Porque o MemoryStream apaga os dados após gravar',
          'Porque Position = 0 libera o buffer',
          'Porque a leitura só funciona em streams fechados'
        ], 'A gravação avança o cursor. A leitura continua dali, então é preciso voltar ao início.'),
        mcq('q3', 'Qual o problema de File.ReadAllTextAsync em um arquivo de vários gigabytes?', 'd', [
          'Ele bloqueia a thread',
          'Ele só lê os primeiros bytes',
          'Ele apaga o arquivo',
          'Carrega o conteúdo inteiro na memória; para arquivos grandes use streaming (leitura em blocos ou linha a linha)'
        ], 'O ReadAll* traz tudo para a memória de uma vez. Streams processam em partes, com memória constante.'),
        fill('q4', 'Que método copia o conteúdo de um stream para outro de forma assíncrona?', 'await origem.___(destino);', ['CopyToAsync'], 'CopyToAsync lê e escreve em blocos, sem carregar tudo na memória.'),
        mcq('q5', 'ReadAsync(buffer) devolveu 100 com um buffer de 4096 bytes. O que se deve fazer?', 'b', [
          'Tratar como erro, pois o buffer deveria encher',
          'Processar só os primeiros 100 bytes e continuar lendo até o retorno ser 0',
          'Processar os 4096 bytes do buffer',
          'Fechar o stream'
        ], 'O valor devolvido é a quantidade realmente lida; pode ser menor que o buffer. Só 0 indica o fim.'),
        mcq('q6', 'Qual a vulnerabilidade de montar um caminho com Path.Combine(pasta, nomeEnviadoPeloUsuario) sem validar?', 'b', [
          'Path.Combine é lento',
          'Path traversal: um nome como "../../x" pode escapar da pasta permitida',
          'Estoura a memória',
          'O arquivo é criado sempre vazio'
        ], 'Segmentos ".." sobem diretórios. Valide com GetFullPath e StartsWith da pasta base, ou nem use o nome enviado.'),
        mcq('q7', 'O que acontece se o segundo argumento de Path.Combine já for um caminho absoluto?', 'a', [
          'O primeiro argumento é descartado e o resultado é o caminho absoluto',
          'Os dois são concatenados normalmente',
          'Lança ArgumentException',
          'O segundo argumento é descartado'
        ], 'Um caminho "enraizado" no segundo argumento sobrescreve o primeiro, outro motivo para não confiar em nomes vindos do usuário.'),
        fill('q8', 'Que método resolve ".." e devolve o caminho absoluto normalizado?', 'var completo = Path.___(Path.Combine(raiz, nome));', ['GetFullPath'], 'GetFullPath normaliza o caminho, permitindo confirmar se ele ainda está dentro da pasta permitida.')
      ]
    },
    {
      id: 'csi-16-json-avancado',
      title: 'JSON avançado',
      goal: 'Configurar o System.Text.Json, escrever conversores, ler JSON sem classes e desserializar entradas não confiáveis com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'JsonSerializerOptions e políticas de nome',
            'JsonSerializerOptions configura o serializador. PropertyNamingPolicy = JsonNamingPolicy.CamelCase escreve Nome como "nome", o padrão dos clientes web. Outras opções úteis: WriteIndented (JSON legível), PropertyNameCaseInsensitive (ao ler, aceita maiúsculas e minúsculas diferentes) e DefaultIgnoreCondition (omitir nulos). Os objetos de options guardam caches internos: crie UMA instância e reutilize, em vez de criar uma por chamada.',
            'record Produto(string Nome, int Preco);\n\nvar opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };\nvar json = JsonSerializer.Serialize(new Produto("Cafe", 12), opts);\nConsole.WriteLine(json);   // {"nome":"Cafe","preco":12}\n\nvar p = JsonSerializer.Deserialize<Produto>(json, opts);\nConsole.WriteLine(p);      // Produto { Nome = Cafe, Preco = 12 }'
          ),
          sl(
            '[JsonIgnore] e enums como string',
            '[JsonIgnore] exclui a propriedade do JSON: indispensável para campos que NUNCA devem sair da aplicação (senhas, hashes, tokens). Por padrão, enums viram o NÚMERO; para escrever o nome, use JsonStringEnumConverter nas options ou o atributo [JsonConverter(typeof(JsonStringEnumConverter))]. O nome é mais legível e não quebra se a ordem do enum mudar.',
            'enum Status { Ativo, Inativo }\nrecord Conta(string Login, [property: JsonIgnore] string Senha, Status Status);\n\nvar c = new Conta("ana", "<senha>", Status.Ativo);\nConsole.WriteLine(JsonSerializer.Serialize(c));\n// {"Login":"ana","Status":0}\n\nvar opts = new JsonSerializerOptions { Converters = { new JsonStringEnumConverter() } };\nConsole.WriteLine(JsonSerializer.Serialize(c, opts));\n// {"Login":"ana","Status":"Ativo"}'
          ),
          sl(
            'JsonConverter personalizado',
            'Quando o formato padrão não serve, escreva um conversor: uma classe que herda de JsonConverter<T> e implementa Read (de Utf8JsonReader para o objeto) e Write (do objeto para Utf8JsonWriter). Registre-o em options.Converters ou com [JsonConverter] no tipo. O exemplo grava um tipo de valor Codigo como uma string simples, em vez de um objeto aninhado.',
            'record Codigo(string Valor);\nrecord Pedido(Codigo Codigo, int Qtd);\n\nclass CodigoConverter : JsonConverter<Codigo>\n{\n    public override Codigo Read(ref Utf8JsonReader reader, Type t, JsonSerializerOptions o)\n        => new(reader.GetString()!);\n    public override void Write(Utf8JsonWriter w, Codigo v, JsonSerializerOptions o)\n        => w.WriteStringValue(v.Valor);\n}\n\nvar opts = new JsonSerializerOptions { Converters = { new CodigoConverter() } };\nConsole.WriteLine(JsonSerializer.Serialize(new Pedido(new Codigo("AB-1"), 3), opts));\n// {"Codigo":"AB-1","Qtd":3}'
          ),
          sl(
            'JsonDocument e JsonNode: ler sem criar classe',
            'Quando você só precisa de alguns campos, ou o formato é variável, dá para navegar no JSON sem classes. JsonDocument é uma visão SOMENTE LEITURA, rápida, e é IDisposable (descarte-o, pois usa memória do pool). JsonNode (JsonObject, JsonArray) é um DOM mutável: você lê com o indexador e também altera e acrescenta propriedades, e depois ToJsonString(). Prefira classes tipadas quando o formato é estável, pois ganham validação do compilador.',
            'using var doc = JsonDocument.Parse("""{"a":{"b":[1,2,3]}}""");\nConsole.WriteLine(doc.RootElement.GetProperty("a").GetProperty("b")[1].GetInt32());   // 2\n\nvar node = JsonNode.Parse("""{"a":{"b":[1,2,3]}}""")!;\nConsole.WriteLine(node["a"]!["b"]![0]!.GetValue<int>());   // 1\nnode["novo"] = 5;\nConsole.WriteLine(node.ToJsonString());   // {"a":{"b":[1,2,3]},"novo":5}'
          ),
          sl(
            'Polimorfismo com [JsonDerivedType]',
            'Por padrão o serializador só escreve as propriedades do tipo declarado, e não sabe reconstruir a classe derivada certa. [JsonDerivedType(typeof(Derivado), "rotulo")] na classe base registra os tipos permitidos e um DISCRIMINADOR: o JSON ganha a propriedade "$type" com o rótulo, e a leitura usa esse rótulo para escolher a classe. Como só tipos registrados são aceitos, a lista funciona como allow-list, ao contrário de mecanismos que aceitam nomes de tipo arbitrários.',
            '[JsonDerivedType(typeof(Circulo), "circulo")]\n[JsonDerivedType(typeof(Quadrado), "quadrado")]\nabstract record Forma;\nrecord Circulo(double Raio) : Forma;\nrecord Quadrado(double Lado) : Forma;\n\nConsole.WriteLine(JsonSerializer.Serialize<Forma>(new Circulo(2)));\n// {"$type":"circulo","Raio":2}\nForma f = JsonSerializer.Deserialize<Forma>("""{"$type":"quadrado","Lado":3}""")!;\nConsole.WriteLine(f);   // Quadrado { Lado = 3 }'
          ),
          sl(
            'Source generation, Newtonsoft.Json e XML',
            'Com source generation, um [JsonSerializable(typeof(Produto))] num JsonSerializerContext partial faz o compilador gerar o código de serialização: sem reflexão em execução, partida mais rápida e compatível com AOT e trimming. Newtonsoft.Json (Json.NET) é a biblioteca de terceiros que veio antes: tem mais recursos (JObject, LINQ to JSON, configurações flexíveis), mas o System.Text.Json é o padrão embutido, mais rápido e mais restrito por padrão. Para XML, existem XmlSerializer e XDocument (System.Xml.Linq); ao ler XML não confiável, não habilite o processamento de DTD (risco de XXE).',
            '[JsonSerializable(typeof(Produto))]\npartial class Ctx : JsonSerializerContext { }\n\nvar json = JsonSerializer.Serialize(new Produto("Cafe", 12), Ctx.Default.Produto);\nConsole.WriteLine(json);   // {"Nome":"Cafe","Preco":12}'
          ),
          sl(
            'Riscos de desserializar entrada não confiável',
            'Dados recebidos são entrada do atacante. (1) Mecanismos que deixam o JSON escolher o tipo a instanciar (BinaryFormatter, hoje inseguro e removido, ou Newtonsoft com TypeNameHandling diferente de None) permitem criar objetos arbitrários e até executar código; o System.Text.Json não faz isso por padrão. (2) Over-posting (mass assignment): se você desserializa direto numa entidade que tem campos como IsAdmin ou Saldo, o cliente consegue preenchê-los; use um DTO só com os campos permitidos e copie para a entidade. (3) Valide TUDO depois de desserializar (faixas, tamanhos, nulos) e trate JsonException; limite o tamanho do corpo e MaxDepth. (4) Não registre o JSON bruto nos logs: pode conter dados pessoais.',
            '// ruim: o cliente poderia enviar {"nome":"x","ehAdmin":true}\n// var usuario = JsonSerializer.Deserialize<Usuario>(corpo);\n\n// bom: DTO só com o que o cliente pode enviar, e validação\nrecord CriarUsuarioDto(string Nome);\nvar dto = JsonSerializer.Deserialize<CriarUsuarioDto>(corpo);\nif (dto is null || string.IsNullOrWhiteSpace(dto.Nome) || dto.Nome.Length > 100)\n    throw new ArgumentException("entrada inválida");\nvar usuario = new Usuario { Nome = dto.Nome, EhAdmin = false };'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\nrecord Produto(string Nome, int Preco);\nvar opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };\nConsole.WriteLine(JsonSerializer.Serialize(new Produto("Cafe", 12), opts));', 'b', [
          '{"Nome":"Cafe","Preco":12}',
          '{"nome":"Cafe","preco":12}',
          '{"NOME":"Cafe","PRECO":12}',
          'Produto { Nome = Cafe, Preco = 12 }'
        ], 'A política CamelCase escreve os nomes das propriedades começando em minúscula.'),
        mcq('q2', 'Para que serve [JsonIgnore] em uma propriedade como Senha?', 'c', [
          'Para criptografar o valor',
          'Para torná-la opcional',
          'Para excluí-la do JSON, impedindo que o valor saia ou entre pelo serializador',
          'Para trocar o nome no JSON'
        ], 'JsonIgnore omite a propriedade, o que evita expor segredos em respostas.'),
        mcq('q3', 'Qual o efeito de adicionar JsonStringEnumConverter às options?', 'a', [
          'Os enums são escritos pelo nome ("Ativo") em vez do número',
          'Os enums passam a ser lidos só em minúsculas',
          'Os enums são ignorados',
          'Os enums viram booleanos'
        ], 'Sem o conversor, o enum vira número, o que é frágil se a ordem dos membros mudar.'),
        fill('q4', 'Qual política de nomes escreve as propriedades com a primeira letra minúscula?', 'var opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.___ };', ['CamelCase'], 'JsonNamingPolicy.CamelCase converte Nome em nome.'),
        mcq('q5', 'Qual a diferença principal entre JsonDocument e JsonNode?', 'd', [
          'JsonDocument é mutável e JsonNode é somente leitura',
          'JsonNode só serve para arrays',
          'Não há diferença',
          'JsonDocument é somente leitura (e IDisposable); JsonNode é um DOM mutável que permite alterar e acrescentar propriedades'
        ], 'Use JsonDocument para ler com eficiência e JsonNode quando precisar modificar o JSON.'),
        mcq('q6', 'O que o atributo [JsonDerivedType(typeof(Circulo), "circulo")] faz na classe base?', 'b', [
          'Torna Circulo obrigatório em todo JSON',
          'Registra Circulo como tipo permitido com um discriminador "$type", permitindo serializar e desserializar o tipo derivado correto',
          'Faz o serializador ignorar Circulo',
          'Cria uma cópia de Circulo'
        ], 'Só os tipos registrados são aceitos na leitura, o que mantém a desserialização sob controle.'),
        mcq('q7', 'Qual prática reduz o risco de over-posting ao receber JSON do cliente?', 'c', [
          'Desserializar direto na entidade do banco para ganhar tempo',
          'Registrar o JSON bruto em log para auditar',
          'Desserializar em um DTO que contém só os campos permitidos, validar e então copiar para a entidade',
          'Habilitar TypeNameHandling no Newtonsoft'
        ], 'Com um DTO restrito, campos como IsAdmin ou Saldo não podem ser preenchidos pelo cliente. TypeNameHandling aumenta o risco.'),
        fill('q8', 'De qual classe base herda um conversor personalizado de JSON para o tipo T?', 'class CodigoConverter : ___<Codigo>\n{\n    // Read e Write\n}', ['JsonConverter'], 'JsonConverter<T> exige implementar Read e Write.')
      ]
    },
    {
      id: 'csi-48-cli-system-commandline-spectre',
      title: 'Aplicações de linha de comando em .NET',
      goal: 'Projetar uma CLI com comandos, opções e códigos de saída, combinar configuração por arquivo, ambiente e argumentos, empacotar como dotnet tool e tratar segredos e caminhos com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Anatomia de uma CLI',
            'Uma aplicação de linha de comando é guiada por texto digitado: um programa (o executável), eventualmente um subcomando que escolhe a ação, opções (nomeadas, começam com - ou --, como --formato json ou -v, podem ser obrigatórias ou ter valor padrão) e argumentos (valores posicionais, como o nome de um arquivo). Uma boa CLI oferece --help (ou -h) que descreve comandos e opções, e usa o CÓDIGO DE SAÍDA para dizer ao shell se deu certo: 0 significa sucesso e qualquer outro valor significa erro (convenção de todo o ecossistema). É por isso que "programa1 && programa2" só executa o segundo se o primeiro devolver 0. Em C#, o código de saída é o int devolvido por Main (ou Environment.ExitCode).',
            '// meutool exportar --formato csv --saida dados.csv  vendas\n//  |       |        |                |                |\n//  |       |        opção com valor     opção com valor  argumento\n//  |       subcomando\n//  programa\n\nstatic int Main(string[] args)\n{\n    if (args.Length == 0)\n    {\n        Console.Error.WriteLine("uso: meutool <comando> [opções]");\n        return 2;          // erro de uso\n    }\n    // ... executa ...\n    return 0;              // sucesso\n}'
          ),
          sl(
            'System.CommandLine (visão geral)',
            'Interpretar args à mão (índices, comparar textos, tratar --x=valor, gerar a ajuda) cresce rápido e fica cheio de erros. A biblioteca System.CommandLine, mantida pela equipe do .NET, resolve isso: você DECLARA os comandos (um comando raiz e subcomandos), as opções e os argumentos, com tipo, descrição e valor padrão, e associa a cada comando um handler (a função executada). A biblioteca faz o parse, valida tipos (um número inválido gera erro de uso), gera o --help e devolve o código de saída. A API dessa biblioteca mudou bastante ao longo do tempo, então siga sempre a documentação da versão que você instalar; o importante aqui é o modelo mental: declarar a estrutura e deixar o parse e a ajuda com a biblioteca.',
            '// Modelo mental (sem código de API específico):\n//\n//   comando raiz "meutool"\n//     subcomando "exportar"\n//         opção   --formato   (texto, padrão "csv")\n//         opção   --saida     (caminho)\n//         argumento <origem>  (obrigatório)\n//         handler: (formato, saida, origem) => { ... return código; }\n//\n// A biblioteca interpreta args, valida, gera --help e chama o handler.'
          ),
          sl(
            'Spectre.Console: saída rica no terminal',
            'Spectre.Console é uma biblioteca para deixar a interface de terminal agradável: texto com cor e estilo (marcações como [green]...[/]), tabelas, barras de progresso, indicadores de espera e prompts interativos (perguntas, escolhas, confirmação, entrada de senha sem eco). Ela detecta o terminal e, quando a saída não é um terminal (está redirecionada para arquivo ou pipe), simplifica a formatação. Use-a para ferramentas feitas para PESSOAS; a saída para outros programas deve ser simples e estável (veja o slide sobre pipes).',
            'var tabela = new Table();\ntabela.AddColumn("Produto");\ntabela.AddColumn("Estoque");\ntabela.AddRow("Caneta", "120");\ntabela.AddRow("Caderno", "35");\nAnsiConsole.Write(tabela);\n\nAnsiConsole.MarkupLine("[green]Concluído[/] com [yellow]1 aviso[/].");\n\n// pergunta sem eco (senha não aparece na tela)\nvar senha = AnsiConsole.Prompt(\n    new TextPrompt<string>("Senha:").Secret());'
          ),
          sl(
            'Configuração: arquivo, ambiente e argumentos',
            'A mesma IConfiguration do ASP.NET serve para CLIs. Você registra várias fontes e, quando duas definem a mesma chave, a ADICIONADA POR ÚLTIMO vence. A ordem típica, do menos para o mais específico, é: valores padrão e arquivo (appsettings.json), depois variáveis de ambiente (opcionalmente com um prefixo, como MEUAPP_, para não colidir com outras), depois argumentos da linha de comando (AddCommandLine), que têm a palavra final. Assim o usuário tem padrões no arquivo, configura o ambiente de execução (contêiner, CI) por variáveis e sobrepõe pontualmente com um argumento.',
            'Environment.SetEnvironmentVariable("MEUAPP_Saida", "env");\n\nvar cfg = new ConfigurationBuilder()\n    .AddInMemoryCollection(new Dictionary<string, string?> { ["Saida"] = "arquivo" })\n    .AddEnvironmentVariables("MEUAPP_")      // só variáveis com esse prefixo\n    .AddCommandLine(new[] { "--Saida=arg" })\n    .Build();\n\nConsole.WriteLine(cfg["Saida"]);   // arg  (o último provedor vence)'
          ),
          sl(
            'stdin, stdout, stderr, pipes e saída para máquinas',
            'Todo processo tem três canais: stdin (entrada), stdout (saída normal, o RESULTADO) e stderr (diagnósticos, avisos e erros). Em C#: Console.In/ReadLine, Console.Out/WriteLine e Console.Error. O shell encadeia com pipes (programa1 | programa2): só o stdout de um vira stdin do outro, então tudo o que não é resultado (progresso, avisos, erros) deve ir para stderr, senão polui o dado. Para consumo por scripts e outras ferramentas, ofereça uma saída legível por máquina (por exemplo, a opção --json, que imprime JSON estável no stdout) e deixe o formato bonito para humanos como padrão. Console.IsOutputRedirected e Console.IsInputRedirected indicam se há pipe ou redirecionamento: nesses casos, desligue cores, animações e barras de progresso. Respeite também a convenção NO_COLOR: se a variável de ambiente NO_COLOR existir, não emita cores.',
            '// resultado vai para stdout; diagnóstico para stderr\nConsole.Error.WriteLine("lendo 3 arquivos...");   // não entra no pipe\nConsole.WriteLine("{\\"total\\": 3}");               // JSON no stdout (modo --json)\n\nbool semCor = Environment.GetEnvironmentVariable("NO_COLOR") is not null\n              || Console.IsOutputRedirected;\n\n// lendo de um pipe:  cat nomes.txt | meutool contar\nif (Console.IsInputRedirected)\n{\n    string? linha;\n    while ((linha = Console.In.ReadLine()) is not null) Processar(linha);\n}'
          ),
          sl(
            'Distribuir: dotnet tool e publicação de arquivo único',
            'Uma CLI .NET pode virar uma ferramenta instalável (dotnet tool) com duas propriedades no .csproj: PackAsTool (true) e ToolCommandName (o nome que o usuário digitará). dotnet pack gera um pacote .nupkg; dotnet tool install --global instala para todo o usuário (disponível em qualquer pasta) e dotnet tool install, dentro de um repositório com manifesto (dotnet new tool-manifest), instala LOCALMENTE, com versão fixada no projeto, o que garante que toda a equipe e o CI usem a mesma versão. Outra via é dotnet publish com PublishSingleFile e, se desejado, self-contained: gera um executável único que leva o runtime junto e dispensa a instalação do .NET, ao custo de um arquivo maior e de um executável por plataforma (RID, como linux-x64).',
            '<!-- meutool.csproj -->\n<PropertyGroup>\n  <OutputType>Exe</OutputType>\n  <PackAsTool>true</PackAsTool>\n  <ToolCommandName>meutool</ToolCommandName>\n</PropertyGroup>\n\n// dotnet pack -c Release\n// dotnet tool install --global meutool --add-source ./nupkg\n// meutool --help\n//\n// executável único:\n// dotnet publish -c Release -r linux-x64 --self-contained -p:PublishSingleFile=true'
          ),
          sl(
            'Segurança em CLIs: segredos e caminhos',
            'Nunca receba segredos (senha, token, chave de API) por ARGUMENTO: a linha de comando fica gravada no histórico do shell e é visível a outros usuários da máquina na lista de processos (ps, gerenciador de tarefas), além de aparecer em logs de CI. Alternativas: variável de ambiente (melhor, mas ainda visível a quem inspeciona o processo em certos casos), leitura por stdin (echo do cofre | meutool login --senha-stdin), arquivo com permissão restrita ou prompt sem eco (como o Secret() do Spectre). Valide também caminhos recebidos: normalize com Path.GetFullPath e confira se o resultado continua dentro da pasta permitida, para impedir que "../../" leia ou grave fora dela; nunca monte comandos de shell concatenando argumentos. E trate dados pessoais com cuidado nas mensagens de erro e na saída: não imprima mais do que o necessário.',
            '// RUIM: o segredo aparece no histórico e em "ps"\n//   meutool login --usuario ana --senha <senha>\n\n// BOM: prompt sem eco, ou stdin, ou variável de ambiente\nvar senha = Environment.GetEnvironmentVariable("MEUAPP_SENHA")\n            ?? AnsiConsole.Prompt(new TextPrompt<string>("Senha:").Secret());\n\n// validar caminho: precisa ficar DENTRO da pasta base\nvar baseDir = Path.GetFullPath("dados") + Path.DirectorySeparatorChar;\nvar alvo = Path.GetFullPath(Path.Combine("dados", entrada));\nif (!alvo.StartsWith(baseDir, StringComparison.Ordinal))\n    throw new ArgumentException("Caminho fora da pasta permitida.");'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em "meutool exportar --formato json vendas.csv", o que é --formato json?', 'c', [
          'Um subcomando',
          'Um argumento posicional',
          'Uma opção nomeada com valor',
          'O código de saída do programa'
        ], 'Opções começam com - ou -- e têm nome (e, em geral, valor). Subcomando é "exportar" e o argumento posicional é "vendas.csv".'),
        mcq('q2', 'Qual convenção de código de saída é seguida pelo ecossistema?', 'a', [
          '0 indica sucesso e qualquer outro valor indica erro',
          '1 indica sucesso e 0 indica erro',
          'Qualquer valor indica sucesso, desde que nada seja impresso no stderr',
          'O código de saída só importa no Windows'
        ], 'Shells e CI usam o código de saída: 0 é sucesso. Por isso "a && b" só roda b quando a termina com 0.'),
        mcq('q3', 'Uma CLI exige "meutool login --senha <senha>". Qual o problema e a alternativa mais segura?', 'b', [
          'O parse falha com senhas muito longas; reduzir o tamanho máximo da senha',
          'Fica no histórico e no ps; usar variável de ambiente, stdin ou prompt sem eco',
          'Opções não podem ter valor; usar apenas argumentos posicionais na linha',
          'Nenhum: os argumentos são criptografados pelo sistema operacional ao executar'
        ], 'A linha de comando é visível em histórico, ps e logs de CI. Segredos devem entrar por canais que não os exponham.'),
        fill('q4', 'Complete o comando para instalar a CLI empacotada como ferramenta global do .NET.', 'dotnet ___ install --global meutool', ['tool'], 'dotnet tool install --global instala a ferramenta para todo o usuário; sem --global e com manifesto, a instalação é local ao repositório.'),
        mcq('q5', 'O que imprime?\nEnvironment.SetEnvironmentVariable("MEUAPP_Saida", "env");\nvar cfg = new ConfigurationBuilder()\n    .AddInMemoryCollection(new Dictionary<string, string?> { ["Saida"] = "arquivo" })\n    .AddEnvironmentVariables("MEUAPP_")\n    .AddCommandLine(new[] { "--Saida=arg" })\n    .Build();\nConsole.WriteLine(cfg["Saida"]);', 'd', [
          'arquivo',
          'env',
          'Lança exceção por chave duplicada',
          'arg'
        ], 'Quando várias fontes definem a mesma chave, a última adicionada vence: aqui, os argumentos da linha de comando.'),
        mcq('q6', 'Uma CLI imprime mensagens de progresso e depois o resultado, e o usuário a encadeia com "meutool listar | outraferramenta". Onde devem ir as mensagens de progresso?', 'b', [
          'Para o stdout, junto com o resultado da ferramenta',
          'Para o stderr, mantendo o stdout só com o resultado',
          'Para o stdin da outra ferramenta, antes do resultado',
          'Para um arquivo criado na pasta atual, sempre'
        ], 'O pipe conecta apenas o stdout. Diagnósticos em stderr não contaminam os dados que a próxima ferramenta lê.'),
        mcq('q7', 'Para uma saída legível por máquina e respeitosa com o terminal do usuário, qual conjunto de práticas faz sentido?', 'a', [
          '--json estável no stdout; sem cores com NO_COLOR ou saída redirecionada',
          'Sempre colorir e animar a saída, pois todo terminal moderno suporta',
          'Misturar JSON e mensagens coloridas no mesmo stdout para facilitar a leitura',
          'Imprimir apenas o código de saída do programa, sem mais nada no terminal'
        ], 'Um formato estável (JSON) serve a scripts; cores e animações atrapalham pipes, arquivos e quem pede NO_COLOR.'),
        fill('q8', 'Complete para escrever uma mensagem de erro no canal certo, sem poluir o resultado do pipe.', 'Console.___.WriteLine("erro: arquivo não encontrado");', ['Error'], 'Console.Error é o stderr, destinado a diagnósticos e erros.')
      ]
    },
    {
      id: 'csi-17-di-ioc',
      title: 'Injeção de dependência e IoC',
      goal: 'Aplicar inversão de dependência com injeção por construtor e escolher os tempos de vida corretos no container do .NET.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Inversão de dependência',
            'Se uma classe cria suas dependências com new, ela fica amarrada a elas: não dá para trocar a implementação, nem testar sem acionar o recurso real (relógio, banco, e-mail). A inversão de dependência manda DEPENDER DE ABSTRAÇÕES (interfaces) e deixar que quem usa a classe entregue a implementação. Isso é o princípio; a injeção de dependência (DI) é a técnica de entregar as dependências de fora, normalmente pelo construtor. IoC (inversão de controle) é a ideia mais ampla: o controle de montar os objetos sai da sua classe e vai para um terceiro (o container).',
            '// acoplado: não dá para trocar nem testar\nclass Notificador\n{\n    private readonly RelogioSistema _relogio = new RelogioSistema();\n}\n\n// desacoplado: depende de uma abstração, recebida de fora\ninterface IRelogio { long Agora(); }\nclass Notificador2\n{\n    private readonly IRelogio _relogio;\n    public Notificador2(IRelogio relogio) => _relogio = relogio;\n}'
          ),
          sl(
            'Injeção por construtor e testabilidade',
            'O construtor declara tudo o que a classe precisa: as dependências ficam visíveis, obrigatórias e imutáveis (campos readonly). Em produção você passa a implementação real; num teste, passa um fake controlado (um relógio fixo, um repositório em memória), sem tocar em banco ou rede. Mais de quatro ou cinco parâmetros no construtor costumam indicar uma classe com responsabilidades demais.',
            'class RelogioFixo : IRelogio\n{\n    public long Agora() => 1000;   // fake para teste: sempre o mesmo valor\n}\n\nvar n = new Notificador2(new RelogioFixo());   // teste: sem depender do relógio real'
          ),
          sl(
            'O container: ServiceCollection e ServiceProvider',
            'O pacote Microsoft.Extensions.DependencyInjection traz o container padrão do .NET. Você REGISTRA os serviços numa ServiceCollection (AddSingleton, AddScoped, AddTransient, no formato "quando pedirem a interface, entregue esta classe"), constrói o ServiceProvider com BuildServiceProvider() e RESOLVE com GetRequiredService<T>(). O container enxerga os construtores e injeta as dependências recursivamente. Registre sempre pela interface. Aplicações ASP.NET Core e o Host genérico fazem essa montagem para você, e você só chama builder.Services.AddX.',
            'var services = new ServiceCollection();\nservices.AddSingleton<IRelogio, RelogioSistema>();   // interface -> implementação\nservices.AddTransient<Notificador2>();               // classe concreta\nusing var provider = services.BuildServiceProvider();\n\nvar n = provider.GetRequiredService<Notificador2>();  // IRelogio injetado sozinho'
          ),
          sl(
            'Tempos de vida: Singleton, Scoped e Transient',
            'O tempo de vida diz por quanto tempo uma instância é reaproveitada. Singleton: UMA instância para a aplicação toda. Scoped: uma instância por ESCOPO (em aplicações web, cada requisição HTTP é um escopo; fora delas você cria com provider.CreateScope()). Transient: uma instância NOVA a cada vez que alguém pede. Regra de escolha: sem estado compartilhado e barato, Transient; estado por requisição ou unidade de trabalho (como o DbContext do EF), Scoped; estado global e seguro para várias threads (cache, configuração), Singleton.',
            'services.AddScoped<Servico>();\nusing var provider = services.BuildServiceProvider();\n\nusing var escopo1 = provider.CreateScope();\nvar a1 = escopo1.ServiceProvider.GetRequiredService<Servico>();\nvar a2 = escopo1.ServiceProvider.GetRequiredService<Servico>();\nConsole.WriteLine(ReferenceEquals(a1, a2));   // True (mesmo escopo)\n\nusing var escopo2 = provider.CreateScope();\nvar b = escopo2.ServiceProvider.GetRequiredService<Servico>();\nConsole.WriteLine(ReferenceEquals(a1, b));    // False (outro escopo)'
          ),
          sl(
            'Armadilha: dependência cativa',
            'Um Singleton que recebe um Scoped no construtor "captura" aquela instância para sempre: ela deixa de ser renovada por requisição, vira estado compartilhado entre usuários e (se for um DbContext) deixa de ser seguro para várias threads: um bug sutil e grave. A regra é depender de serviços com tempo de vida IGUAL OU MAIOR. Em desenvolvimento, ServiceProviderOptions.ValidateScopes = true (ligado por padrão no ambiente Development do host) faz o container lançar InvalidOperationException ao detectar isso. Quando um singleton (como um BackgroundService) precisa de um serviço scoped, injete IServiceScopeFactory e crie um escopo curto a cada uso.',
            'services.AddScoped<Servico>();\nservices.AddSingleton<Cativo>();           // Cativo(Servico s): singleton usa scoped!\nusing var p = services.BuildServiceProvider(\n    new ServiceProviderOptions { ValidateScopes = true });\ntry { p.GetRequiredService<Cativo>(); }\ncatch (InvalidOperationException) { Console.WriteLine("dependência cativa"); }'
          ),
          sl(
            'Service Locator, GetService e descarte',
            'Injetar o IServiceProvider inteiro e chamar GetService dentro das classes é o antipadrão Service Locator: esconde as dependências reais (o construtor não as mostra), dificulta testes e só falha em execução. Reserve o uso do provider para a "raiz" da aplicação ou fábricas. GetRequiredService lança InvalidOperationException se o serviço não estiver registrado; GetService devolve null. E quem descarta é o container: ele chama Dispose nos IDisposable que CRIOU; os que você registrou já criados por você (instância pronta) ele não descarta.',
            'Console.WriteLine(provider.GetService<IOutro>() is null);   // True (não registrado)\ntry { provider.GetRequiredService<IOutro>(); }\ncatch (InvalidOperationException) { Console.WriteLine("não registrado"); }'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que prega a inversão de dependência?', 'a', [
          'Que as classes dependam de abstrações (interfaces) e recebam as implementações de fora',
          'Que toda classe crie suas dependências com new',
          'Que só se use classes estáticas',
          'Que todas as dependências sejam Singleton'
        ], 'A classe não decide qual implementação usar; ela declara a abstração e recebe a implementação, o que permite trocar e testar.'),
        mcq('q2', 'Qual a principal vantagem da injeção por construtor para testes?', 'c', [
          'Os testes ficam mais lentos, porém mais seguros',
          'Dispensa o uso de interfaces',
          'Permite entregar fakes (como um relógio fixo) no lugar das dependências reais',
          'Faz o container descartar o objeto'
        ], 'Como as dependências vêm de fora, o teste fornece versões controladas sem acessar banco, rede ou relógio reais.'),
        mcq('q3', 'O que imprime?\nservices.AddScoped<Servico>();\nusing var provider = services.BuildServiceProvider();\nusing var e1 = provider.CreateScope();\nvar a1 = e1.ServiceProvider.GetRequiredService<Servico>();\nvar a2 = e1.ServiceProvider.GetRequiredService<Servico>();\nConsole.WriteLine(ReferenceEquals(a1, a2));\nusing var e2 = provider.CreateScope();\nvar b = e2.ServiceProvider.GetRequiredService<Servico>();\nConsole.WriteLine(ReferenceEquals(a1, b));', 'd', [
          'False e False',
          'True e True',
          'False e True',
          'True e False'
        ], 'Dentro do mesmo escopo o Scoped é a mesma instância; em outro escopo, é uma nova.'),
        fill('q4', 'Qual método registra um serviço que cria uma instância NOVA a cada pedido?', 'services.___<Notificador>();', ['AddTransient'], 'AddTransient cria uma instância por resolução; AddScoped, uma por escopo; AddSingleton, uma para sempre.'),
        mcq('q5', 'O que é a dependência cativa?', 'b', [
          'Um serviço registrado duas vezes',
          'Um Singleton que depende de um serviço Scoped, mantendo-o vivo e compartilhado indevidamente',
          'Um Transient que cria objetos demais',
          'Uma dependência circular entre dois serviços'
        ], 'O singleton captura a instância scoped para sempre, quebrando a ideia de "uma por requisição". ValidateScopes ajuda a detectar.'),
        mcq('q6', 'Por que injetar IServiceProvider e chamar GetService dentro de uma classe é considerado ruim?', 'c', [
          'Porque é impossível em .NET',
          'Porque é mais lento que new',
          'Porque esconde as dependências reais, dificulta testes e só falha em execução (Service Locator)',
          'Porque obriga a usar Singleton'
        ], 'O construtor deixa de documentar o que a classe precisa. Prefira pedir as dependências diretamente.'),
        mcq('q7', 'Qual a diferença entre GetRequiredService<T> e GetService<T> para um serviço não registrado?', 'a', [
          'GetRequiredService lança InvalidOperationException; GetService devolve null',
          'Ambos devolvem null',
          'GetService lança exceção; GetRequiredService devolve null',
          'Ambos criam o serviço automaticamente'
        ], 'Use GetRequiredService quando o serviço é obrigatório: falha cedo e com mensagem clara.'),
        fill('q8', 'Que método constrói o container a partir da ServiceCollection?', 'using var provider = services.___();', ['BuildServiceProvider'], 'BuildServiceProvider produz o ServiceProvider, que resolve os serviços com GetRequiredService.')
      ]
    },
    {
      id: 'csi-18-configuracao-options-logging',
      title: 'Configuração, Options e logging',
      goal: 'Ler configuração em camadas, proteger segredos, usar o padrão Options e registrar logs estruturados sem vazar dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'IConfiguration e as camadas de provedores',
            'IConfiguration é um dicionário hierárquico de chave/valor montado por provedores, aplicados em ordem; o ÚLTIMO a definir uma chave vence. No host padrão a ordem é: appsettings.json, appsettings.{Ambiente}.json, User Secrets (só em Development), variáveis de ambiente e argumentos de linha de comando. O ambiente vem de DOTNET_ENVIRONMENT (host genérico) ou ASPNETCORE_ENVIRONMENT (web): Development, Staging ou Production. Chaves aninhadas usam ":" (Banco:Host); em variáveis de ambiente usa-se "__" (Banco__Host), pois ":" não é aceito em todo sistema.',
            '// appsettings.json: { "Banco": { "Host": "localhost", "Porta": 5432 } }\nConsole.WriteLine(config["Banco:Host"]);                    // localhost\nConsole.WriteLine(config.GetValue<int>("Banco:Porta"));      // 5432\nConsole.WriteLine(config.GetSection("Banco")["Host"]);       // localhost\n\n// variável de ambiente Banco__Host=outro sobrepõe o valor do arquivo'
          ),
          sl(
            'Segredos: nunca no repositório',
            'Senhas, chaves de API e strings de conexão com senha NÃO podem ir no código nem no appsettings.json versionado: o histórico do Git guarda para sempre, e quem acessa o repositório acessa o serviço. Em desenvolvimento use User Secrets (dotnet user-secrets init e dotnet user-secrets set "Banco:Senha" "<senha>"): o valor fica num arquivo no perfil do usuário, fora do projeto (atenção: não é criptografado, serve só para desenvolvimento). Em produção use variáveis de ambiente injetadas pela plataforma ou um cofre de segredos. Se um segredo vazar, troque-o imediatamente (rotação); apagar o commit não basta. No appsettings.json deixe apenas valores não sensíveis ou placeholders.',
            '// desenvolvimento (fora do repositório):\n// dotnet user-secrets init\n// dotnet user-secrets set "Banco:Senha" "<senha>"\n\n// produção: variável de ambiente (definida pela plataforma, nunca versionada)\n// Banco__Senha=<senha>\n\n// appsettings.json versionado: só o que não é sensível\n// { "Banco": { "Host": "localhost", "Senha": "" } }'
          ),
          sl(
            'Padrão Options: configuração tipada',
            'Em vez de ler strings soltas, crie uma classe que representa uma seção e deixe o framework preenchê-la (Bind). Registre com AddOptions<T>().Bind(config.GetSection("Banco")) (ou services.Configure<T>(...)) e peça IOptions<T> no construtor. Ganha-se tipagem, um lugar único e testável, e VALIDAÇÃO: .ValidateDataAnnotations() (do pacote Microsoft.Extensions.Options.DataAnnotations) aplica [Required], [Range] etc., e .ValidateOnStart() faz a checagem na partida da aplicação (fail fast), lançando OptionsValidationException se algo estiver errado, em vez de falhar horas depois, no primeiro uso.',
            'class BancoOptions\n{\n    [Required] public string Host { get; set; } = "";\n    [Range(1, 65535)] public int Porta { get; set; }\n}\n\nservices.AddOptions<BancoOptions>()\n    .Bind(config.GetSection("Banco"))\n    .ValidateDataAnnotations()\n    .ValidateOnStart();\n\nclass Cliente(IOptions<BancoOptions> opcoes)\n{\n    public int Porta => opcoes.Value.Porta;   // 5432\n}'
          ),
          sl(
            'IOptions, IOptionsSnapshot e IOptionsMonitor',
            'IOptions<T>: singleton, lê os valores UMA vez e não acompanha mudanças no arquivo. IOptionsSnapshot<T>: registrado como Scoped, relê a configuração a cada escopo (a cada requisição), e por isso não pode ser injetado em singletons. IOptionsMonitor<T>: singleton que expõe CurrentValue sempre atualizado e o evento OnChange, ideal para serviços de vida longa que precisam reagir a mudanças de configuração sem reiniciar. Se os valores só mudam com reinício, IOptions<T> basta.',
            '// valor fixo na vida da aplicação\nclass A(IOptions<BancoOptions> o) { }\n\n// valor atual por requisição (Scoped)\nclass B(IOptionsSnapshot<BancoOptions> o) { }\n\n// serviço de longa duração que acompanha mudanças\nclass C(IOptionsMonitor<BancoOptions> o)\n{\n    public string Host => o.CurrentValue.Host;\n}'
          ),
          sl(
            'ILogger<T> e níveis de log',
            'ILogger<T> é o serviço de log do .NET: peça-o no construtor e a categoria (o nome da classe T) vai junto, o que permite filtrar por origem. Os níveis, do mais verboso ao mais grave: Trace, Debug, Information, Warning, Error, Critical (e None, que desliga). A configuração escolhe o nível mínimo por categoria na seção "Logging:LogLevel"; em produção costuma-se usar Information ou Warning e deixar Debug/Trace só para investigação. Use Warning para o inesperado recuperável, Error para falha da operação, Critical para a aplicação em risco.',
            'class PedidoService(ILogger<PedidoService> logger)\n{\n    public void Criar(int id)\n    {\n        logger.LogInformation("Pedido {PedidoId} criado", id);\n        logger.LogWarning("Estoque baixo para o pedido {PedidoId}", id);\n    }\n}\n\n// appsettings.json\n// { "Logging": { "LogLevel": { "Default": "Information", "Microsoft": "Warning" } } }'
          ),
          sl(
            'Templates estruturados e escopos',
            'O texto de log deve ser um TEMPLATE com placeholders nomeados ("Pedido {PedidoId} criado") e os valores passados como argumentos: o provedor guarda PedidoId como campo pesquisável, formata a mensagem só se o nível estiver ativo e trata o valor como dado. Nunca concatene nem use interpolação ($"Pedido {id}"): perde-se a estrutura, gasta-se processamento mesmo com o nível desligado e, se o valor vier do usuário, ele pode injetar linhas falsas no log (log forging). Escopos (BeginScope) anexam dados a TODOS os logs emitidos dentro do bloco, como um identificador de correlação.',
            '// ruim: perde estrutura e custa mesmo desligado\n// logger.LogInformation($"Pedido {id} criado");\n\n// bom: template + argumento\nlogger.LogInformation("Pedido {PedidoId} criado", id);\n\nusing (logger.BeginScope("Correlacao {IdCorrelacao}", idCorrelacao))\n{\n    logger.LogInformation("Processando");   // sai com IdCorrelacao anexado\n}'
          ),
          sl(
            'LGPD: o que nunca vai para o log',
            'Logs são copiados para ferramentas de busca, backups e terceiros, e guardados por muito tempo: tratam-se como dados de alto risco. Não registre dados pessoais (nome completo, e-mail, CPF, telefone, endereço, IP quando evitável) nem segredos (senhas, tokens, chaves, strings de conexão, corpos de requisição inteiros). Registre IDENTIFICADORES opacos (UserId, PedidoId), códigos de erro e contagens. Quando for indispensável, mascare (ana***@exemplo.com), defina prazo de retenção e restrinja o acesso. Cuidado também com exceções cujas mensagens incluem valores, e com o nível Debug em produção, que costuma vazar mais.',
            '// ruim\n// logger.LogInformation("Login de {Email} com senha {Senha}", email, senha);\n\n// bom: identificador opaco, nada de segredo\nlogger.LogInformation("Login realizado para o usuário {UsuarioId}", usuarioId);'
          )
        ]
      },
      questions: [
        mcq('q1', 'No host padrão, o appsettings.json define Banco:Host = "localhost" e existe a variável de ambiente Banco__Host=servidor-prod. Qual valor a aplicação enxerga?', 'b', [
          'localhost, porque o arquivo vem primeiro',
          'servidor-prod, porque as variáveis de ambiente vêm depois do arquivo e o último vence',
          'Os dois, em uma lista',
          'Lança exceção por conflito'
        ], 'Os provedores são aplicados em ordem e o último a definir a chave prevalece; variáveis de ambiente sobrescrevem appsettings.json.'),
        mcq('q2', 'Como se escreve, em uma variável de ambiente, a chave de configuração Banco:Senha?', 'd', [
          'Banco:Senha',
          'Banco.Senha',
          'Banco-Senha',
          'Banco__Senha'
        ], 'O duplo sublinhado substitui os dois-pontos, que não são aceitos em todos os sistemas.'),
        mcq('q3', 'Onde deve ficar a senha do banco?', 'a', [
          'Em User Secrets no desenvolvimento e em variável de ambiente ou cofre de segredos em produção',
          'No appsettings.json versionado no repositório',
          'Fixa no código-fonte, numa constante',
          'Num comentário do README'
        ], 'Segredos nunca vão para o repositório. Se vazarem, é preciso trocá-los (rotação).'),
        fill('q4', 'Qual método do IConfiguration devolve uma seção, usada para o Bind?', 'services.Configure<BancoOptions>(config.___("Banco"));', ['GetSection'], 'GetSection("Banco") devolve o ramo Banco da configuração, que o Bind transforma em BancoOptions.'),
        mcq('q5', 'Um singleton de longa duração precisa acompanhar mudanças de configuração sem reiniciar. O que injetar?', 'c', [
          'IOptions<T>',
          'IOptionsSnapshot<T>',
          'IOptionsMonitor<T>',
          'IConfigurationRoot por service locator'
        ], 'IOptionsMonitor<T> é singleton, expõe CurrentValue atualizado e OnChange. Snapshot é Scoped e não cabe em singleton.'),
        mcq('q6', 'Qual a forma correta de registrar o log de um pedido criado?', 'b', [
          'logger.LogInformation("Pedido " + id + " criado");',
          'logger.LogInformation("Pedido {PedidoId} criado", id);',
          'logger.LogInformation($"Pedido {id} criado");',
          'Console.WriteLine("Pedido " + id);'
        ], 'O template com placeholder preserva a estrutura (campo PedidoId), evita formatar se o nível estiver desligado e impede injeção de linhas.'),
        mcq('q7', 'Qual destes registros respeita a LGPD e boas práticas de segurança?', 'c', [
          'LogInformation("Login de {Email}", email)',
          'LogInformation("Requisição: {Corpo}", corpoCompleto)',
          'LogInformation("Login realizado para o usuário {UsuarioId}", usuarioId)',
          'LogInformation("Token {Token} validado", token)'
        ], 'Use identificadores opacos. E-mail, corpos de requisição e tokens podem conter dados pessoais ou segredos.'),
        fill('q8', 'Que método faz as options serem validadas já na partida da aplicação (fail fast)?', 'services.AddOptions<BancoOptions>()\n    .Bind(config.GetSection("Banco"))\n    .ValidateDataAnnotations()\n    .___();', ['ValidateOnStart'], 'ValidateOnStart executa a validação ao iniciar, em vez de esperar o primeiro uso das opções.')
      ]
    },
    {
      id: 'csi-44-globalizacao-localizacao-tempo',
      title: 'Globalização, localização e fusos horários',
      goal: 'Formatar e interpretar números, datas e moedas por cultura, localizar uma API ASP.NET Core e tratar tempo com UTC, DateTimeOffset, fusos e TimeProvider.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'CultureInfo: o que muda de país para país',
            'Cada cultura (pt-BR, en-US...) define como número, data e moeda são escritos: separador decimal, separador de milhar, ordem dia/mês, símbolo de moeda. O .NET representa isso em CultureInfo. Há duas culturas "atuais" por thread: CurrentCulture controla a FORMATAÇÃO e o PARSE de números e datas; CurrentUICulture controla qual conjunto de TEXTOS TRADUZIDOS (arquivos de recursos .resx) é carregado. Os métodos de formatação aceitam uma cultura explícita, e passá-la evita depender da máquina onde o código roda.',
            'var br = CultureInfo.GetCultureInfo("pt-BR");\nvar us = CultureInfo.GetCultureInfo("en-US");\nConsole.WriteLine(1234.5.ToString("N2", br));        // 1.234,50\nConsole.WriteLine(1234.5.ToString("N2", us));        // 1,234.50\nConsole.WriteLine(new DateTime(2025, 3, 4).ToString("d", br)); // 04/03/2025\nConsole.WriteLine(new DateTime(2025, 3, 4).ToString("d", us)); // 3/4/2025\nConsole.WriteLine(1234.5m.ToString("C", us));        // $1,234.50'
          ),
          sl(
            'Parse sensível à cultura: o bug silencioso',
            'Converter texto em número também depende da cultura. Em pt-BR, a vírgula é o separador decimal e o ponto é separador de MILHAR; em en-US é o contrário. Por isso o mesmo texto vira valores diferentes, e às vezes SEM erro: "1.5" em pt-BR é lido como 15. Quem escreve na cultura de uma máquina e lê na cultura de outra corrompe dados. Para dados de MÁQUINA (JSON, CSV de integração, logs, chaves de cache, parâmetros de URL) use sempre CultureInfo.InvariantCulture: uma cultura fixa, independente de país, que usa ponto decimal. Reserve a cultura do usuário só para o que ele LÊ na tela.',
            'var br = CultureInfo.GetCultureInfo("pt-BR");\nvar us = CultureInfo.GetCultureInfo("en-US");\nConsole.WriteLine(double.Parse("1,5", br));   // 1,5 (em pt-BR a vírgula é decimal)\nConsole.WriteLine(double.Parse("1.5", br));   // 15  (ponto = milhar, sem erro!)\nConsole.WriteLine(double.Parse("1.5", us));   // valor 1,5 (ponto decimal em en-US)\n\n// dado de máquina: sempre Invariant\nstring texto = 1234.5.ToString(CultureInfo.InvariantCulture); // "1234.5"\ndouble v = double.Parse(texto, CultureInfo.InvariantCulture);'
          ),
          sl(
            'Texto: comparação, ordenação e o "I turco"',
            'Comparar strings pode usar regras culturais (StringComparison.CurrentCulture, InvariantCulture) ou ordinais (Ordinal, OrdinalIgnoreCase), que comparam apenas os valores numéricos dos caracteres. Regras culturais servem para ORDENAR texto que o usuário lê (ordem alfabética de nomes). Para identificadores técnicos (chaves, nomes de cabeçalho, extensões, comandos) use Ordinal ou OrdinalIgnoreCase: é mais rápido e previsível. O erro clássico é o "I turco": em tr-TR, a maiúscula "I" vira "ı" (i sem ponto) em minúsculas, então ToLower() na cultura turca de "TITLE" produz "tıtle", e um código que compara "TITLE".ToLower() com "title" falha só naquela máquina. ToLowerInvariant e OrdinalIgnoreCase evitam o problema.',
            'var tr = CultureInfo.GetCultureInfo("tr-TR");\nConsole.WriteLine("TITLE".ToLower(tr));         // tıtle\nConsole.WriteLine("TITLE".ToLowerInvariant());  // title\n\nbool ok = string.Equals(ext, ".PDF", StringComparison.OrdinalIgnoreCase);\n\n// Ordinal compara pelo código do caractere: maiúsculas vêm antes\nConsole.WriteLine(string.Compare("a", "B", StringComparison.Ordinal));          // 31 (positivo)\nConsole.WriteLine(string.Compare("a", "B", StringComparison.InvariantCulture)); // -1 (a antes de B)'
          ),
          sl(
            'Dinheiro, ISO 8601 e Unicode',
            'Dinheiro: use decimal, nunca double. double é binário e não representa 0,1 exatamente (0.1 + 0.2 não é igual a 0.3), erro inaceitável em contas. E um valor monetário sem moeda é ambíguo: guarde o valor junto do código da moeda (BRL, USD), em vez de depender do símbolo da cultura. Datas em dados de máquina: use o formato ISO 8601 (2025-03-04T15:30:00Z), que é ordenável como texto e entendido por todo sistema; o formato "O" de DateTime/DateTimeOffset produz isso. Texto: use UTF-8 para ler e gravar arquivos e redes, e lembre que o mesmo "é" pode ser 1 caractere ou 2 (e + acento combinado); a normalização Unicode (string.Normalize) uniformiza essas formas antes de comparar ou indexar.',
            'Console.WriteLine(0.1 + 0.2 == 0.3);     // False (double)\nConsole.WriteLine(0.1m + 0.2m == 0.3m);  // True  (decimal)\n\nrecord Dinheiro(decimal Valor, string Moeda);   // new Dinheiro(10.50m, "BRL")\n\nvar t = new DateTimeOffset(2025, 3, 4, 15, 30, 0, TimeSpan.Zero);\nConsole.WriteLine(t.ToString("O"));      // 2025-03-04T15:30:00.0000000+00:00\n\nConsole.WriteLine("e\\u0301" == "é");               // False (2 chars vs 1)\nConsole.WriteLine("e\\u0301".Normalize() == "é");   // True'
          ),
          sl(
            'Localização no ASP.NET Core',
            'Localizar é traduzir a interface e as mensagens conforme o idioma do cliente. Os textos ficam em arquivos de recursos .resx (um por idioma: Mensagens.resx, Mensagens.en.resx) e são lidos por IStringLocalizer, injetado como qualquer serviço: localizer["Bem-vindo"] devolve a tradução da CurrentUICulture (e a própria chave se não houver tradução). Quem DECIDE a cultura de cada requisição é o middleware de localização: UseRequestLocalization, configurado com as culturas suportadas. Por padrão ele lê o cabeçalho HTTP Accept-Language que o navegador envia, e também pode usar query string ou cookie. Sempre defina uma cultura padrão e a lista de suportadas: aceitar qualquer valor do cabeçalho é aceitar entrada do cliente sem validar.',
            'var culturas = new[] { "pt-BR", "en-US" };\nbuilder.Services.AddLocalization();\n\nvar app = builder.Build();\napp.UseRequestLocalization(o => o\n    .SetDefaultCulture("pt-BR")\n    .AddSupportedCultures(culturas)\n    .AddSupportedUICultures(culturas));\n\napp.MapGet("/ola", (IStringLocalizer<Program> L) => L["Bem-vindo"].Value);\n// Accept-Language: en-US  ->  texto de Mensagens.en-US.resx (se existir)'
          ),
          sl(
            'Tempo: UTC, DateTimeOffset e fusos horários',
            'DateTime não carrega o fuso: o mesmo valor pode ser horário local, UTC ou "indefinido", fonte de bugs. DateTimeOffset guarda a data/hora MAIS o deslocamento em relação ao UTC, identificando um instante exato. Regra de ouro: armazene e trafegue em UTC e converta para o fuso do usuário só na borda (na exibição). TimeZoneInfo representa fusos como "America/Sao_Paulo" e conhece o horário de verão: o deslocamento de um mesmo fuso muda ao longo do ano (New York é -05:00 no inverno e -04:00 no verão), e em dias de transição existem horas que não existem ou que se repetem. Por isso nunca some "24 horas" achando que é "o mesmo horário amanhã" em horário local.',
            'var utc = new DateTimeOffset(2025, 7, 1, 15, 0, 0, TimeSpan.Zero);\nvar sp = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");\nConsole.WriteLine(TimeZoneInfo.ConvertTime(utc, sp).ToString("O"));\n// 2025-07-01T12:00:00.0000000-03:00\n\nvar ny = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");\nConsole.WriteLine(ny.GetUtcOffset(new DateTimeOffset(2025, 1, 1, 12, 0, 0, TimeSpan.Zero))); // -05:00:00\nConsole.WriteLine(ny.GetUtcOffset(new DateTimeOffset(2025, 7, 1, 12, 0, 0, TimeSpan.Zero))); // -04:00:00'
          ),
          sl(
            'TimeProvider: tempo testável',
            'Código que chama DateTime.UtcNow direto é difícil de testar: o resultado muda a cada execução. TimeProvider é uma abstração do relógio: em produção você injeta TimeProvider.System; nos testes, uma implementação falsa com o tempo controlado (o pacote Microsoft.Extensions.TimeProvider.Testing traz o FakeTimeProvider). O serviço pergunta a hora com GetUtcNow(), que devolve um DateTimeOffset em UTC, e passa a ser determinístico nos testes (expiração de token, prazos, agendamentos).',
            'class Cupom(TimeProvider tempo)\n{\n    public bool Expirado(DateTimeOffset validade) => tempo.GetUtcNow() > validade;\n}\n\n// produção\nbuilder.Services.AddSingleton(TimeProvider.System);\n\n// teste: relógio falso que você controla\nvar relogio = new FakeTimeProvider(new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero));\nvar cupom = new Cupom(relogio);\nrelogio.Advance(TimeSpan.FromDays(2));   // "passou" 2 dias sem esperar'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre CurrentCulture e CurrentUICulture?', 'c', [
          'CurrentCulture define o idioma do sistema operacional e CurrentUICulture só vale no Windows',
          'CurrentUICulture formata números e datas; CurrentCulture escolhe os arquivos de tradução (.resx)',
          'CurrentCulture formata e lê números e datas; CurrentUICulture escolhe os textos traduzidos',
          'As duas fazem exatamente o mesmo e só existem por compatibilidade com versões antigas'
        ], 'CurrentCulture cuida de formatos (decimal, data, moeda); CurrentUICulture cuida de qual idioma de recursos é carregado.'),
        mcq('q2', 'Um código compara a extensão de arquivo com "TITLE".ToLower() == "title" e falha só em máquinas configuradas em turco. Qual a correção mais adequada?', 'a', [
          'Usar string.Equals com StringComparison.OrdinalIgnoreCase',
          'Trocar ToLower() por ToUpper() em todos os pontos do código',
          'Instalar o pacote de idioma turco em todos os servidores',
          'Comparar apenas o primeiro caractere da string'
        ], 'Em tr-TR o "I" maiúsculo vira "ı" ao ficar minúsculo. Para identificadores técnicos, comparação ordinal não depende de cultura.'),
        mcq('q3', 'Como guardar o preço de um produto vendido em reais e em dólares?', 'd', [
          'double para o valor e o símbolo da cultura atual do servidor',
          'string formatada com ToString("C"), pronta para exibir ao usuário',
          'float com duas casas e arredondamento sempre feito na tela',
          'decimal para o valor e um campo com o código da moeda'
        ], 'decimal é exato para base 10 e o código da moeda elimina a ambiguidade; o símbolo da cultura do servidor não é confiável.'),
        fill('q4', 'Complete para gravar o número em formato independente de país (ponto decimal), próprio para JSON ou CSV de integração.', 'string texto = 1234.5.ToString(CultureInfo.___);', ['InvariantCulture'], 'InvariantCulture é uma cultura fixa, usada em dados de máquina para que gravar e ler funcionem em qualquer ambiente.'),
        mcq('q5', 'O que o código imprime (as duas linhas, nesta ordem)?\nvar br = CultureInfo.GetCultureInfo("pt-BR");\nConsole.WriteLine(1234.5.ToString("N2", br));\nConsole.WriteLine(double.Parse("1.5", br));', 'b', [
          '1,234.50 e 1,5',
          '1.234,50 e 15',
          '1.234,50 e FormatException',
          '1234,50 e 1,5'
        ], 'N2 em pt-BR usa ponto de milhar e vírgula decimal. No parse, o ponto é separador de milhar em pt-BR, então "1.5" vira 15, sem erro.'),
        mcq('q6', 'Em uma API ASP.NET Core, qual combinação decide o idioma de cada requisição e entrega as mensagens traduzidas?', 'c', [
          'AddLocalization sozinho já lê o Accept-Language e troca a cultura de cada requisição',
          'IStringLocalizer lê o fuso horário do navegador e escolhe o arquivo .resx correto',
          'UseRequestLocalization escolhe a cultura e IStringLocalizer busca o texto no .resx',
          'O arquivo .resx precisa ser recarregado manualmente a cada requisição feita ao servidor'
        ], 'O middleware define CurrentCulture/CurrentUICulture por requisição, a partir das culturas suportadas, e o localizer usa a UI culture para buscar a tradução.'),
        mcq('q7', 'Qual é a prática recomendada para armazenar o horário de um agendamento que será visto por usuários em vários fusos?', 'a', [
          'Guardar em UTC (DateTimeOffset) e converter para o fuso do usuário só ao exibir',
          'Guardar o horário local do servidor e somar depois o deslocamento fixo do usuário',
          'Guardar o texto digitado pelo usuário, sem nenhuma informação de fuso horário',
          'Guardar DateTime.Now e ignorar o horário de verão nos cálculos'
        ], 'UTC identifica um instante único; o horário de verão e os fusos são aplicados só na borda, na exibição.'),
        fill('q8', 'Que método do TimeProvider devolve o instante atual em UTC como DateTimeOffset?', 'bool expirou = tempo.___() > validade;', ['GetUtcNow'], 'GetUtcNow() é a forma testável de DateTime.UtcNow: nos testes, o FakeTimeProvider controla o valor devolvido.')
      ]
    },
    {
      id: 'csi-19-host-worker-services',
      title: 'Host genérico e Worker Services',
      goal: 'Criar serviços de segundo plano com o host genérico, BackgroundService, encerramento gracioso e tarefas periódicas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O Host genérico',
            'O Host unifica o que toda aplicação de longa duração precisa: injeção de dependência, configuração, logging e gerência do ciclo de vida (iniciar e encerrar). O mesmo modelo serve para aplicações web, workers e ferramentas. Host.CreateApplicationBuilder(args) já traz os padrões (appsettings.json, variáveis de ambiente, logging no console); você registra serviços em builder.Services, constrói e executa. RunAsync fica rodando até alguém pedir para parar (Ctrl+C, SIGTERM).',
            'var builder = Host.CreateApplicationBuilder(args);\nbuilder.Services.AddHostedService<Worker>();   // registra o serviço de segundo plano\n\nvar host = builder.Build();\nawait host.RunAsync();   // roda até Ctrl+C / SIGTERM'
          ),
          sl(
            'BackgroundService e ExecuteAsync',
            'BackgroundService é a classe base para tarefas contínuas: você sobrescreve ExecuteAsync(CancellationToken stoppingToken), que o host inicia e roda até o fim da aplicação. O padrão é um laço que continua enquanto o token não for cancelado, e passa o token para toda espera. Cuidados: o código antes do primeiro await roda de forma síncrona na partida (não faça trabalho longo ali); e uma exceção não tratada que escape de ExecuteAsync, por padrão, derruba o host, então envolva o trabalho de cada volta em try/catch e registre o erro.',
            'class Worker(ILogger<Worker> logger) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        while (!stoppingToken.IsCancellationRequested)\n        {\n            try\n            {\n                logger.LogInformation("Trabalhando...");\n                await Task.Delay(1000, stoppingToken);\n            }\n            catch (Exception ex) when (ex is not OperationCanceledException)\n            {\n                logger.LogError(ex, "Falha na iteração");   // não derruba o serviço\n            }\n        }\n    }\n}'
          ),
          sl(
            'IHostedService',
            'Por baixo, um serviço de host é qualquer classe que implementa IHostedService, com dois métodos: StartAsync(CancellationToken), chamado na partida (deve terminar rápido), e StopAsync(CancellationToken), chamado ao encerrar. BackgroundService é a implementação pronta que chama seu ExecuteAsync e cuida do cancelamento. Escreva IHostedService direto quando só precisa de algo na partida e/ou no encerramento (aquecer um cache, liberar recursos); use BackgroundService para laços de trabalho. Os serviços iniciam na ordem de registro e param na ordem inversa.',
            'class Aquecimento : IHostedService\n{\n    public Task StartAsync(CancellationToken ct)\n    {\n        Console.WriteLine("partida");   // algo rápido, na inicialização\n        return Task.CompletedTask;\n    }\n    public Task StopAsync(CancellationToken ct)\n    {\n        Console.WriteLine("encerrando");\n        return Task.CompletedTask;\n    }\n}\nbuilder.Services.AddHostedService<Aquecimento>();'
          ),
          sl(
            'Encerramento gracioso',
            'Ao receber Ctrl+C ou SIGTERM (o que orquestradores como Docker e Kubernetes enviam ao parar um contêiner), o host sinaliza o encerramento: cancela o stoppingToken e chama StopAsync nos serviços, aguardando até um tempo limite configurável (HostOptions.ShutdownTimeout); passado o limite, o processo é encerrado à força. Por isso, repasse sempre o token às esperas e operações, termine o trabalho em andamento de forma limpa (conclua ou devolva a mensagem à fila) e libere os recursos. Ignorar o token faz o serviço ser morto no meio do trabalho.',
            '// Ctrl+C / SIGTERM:\n// 1) o host cancela o stoppingToken\n// 2) o laço do ExecuteAsync sai (Task.Delay lança OperationCanceledException)\n// 3) StopAsync é chamado; o host espera até ShutdownTimeout\n// 4) o processo termina\n\nawait Task.Delay(1000, stoppingToken);   // sempre repassar o token'
          ),
          sl(
            'Serviços scoped dentro do worker',
            'Um BackgroundService é registrado como singleton. Se ele recebesse um serviço Scoped no construtor (como um DbContext), cairia na dependência cativa. A solução é injetar IServiceScopeFactory e criar um escopo a cada unidade de trabalho: dentro dele resolve-se o serviço scoped, usa-se e o escopo é descartado ao fim, liberando os recursos.',
            'class Worker(IServiceScopeFactory fabrica, ILogger<Worker> logger) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken ct)\n    {\n        while (!ct.IsCancellationRequested)\n        {\n            using (var escopo = fabrica.CreateScope())\n            {\n                var repo = escopo.ServiceProvider.GetRequiredService<IRepositorio>();   // Scoped\n                await repo.ProcessarPendentesAsync(ct);\n            }\n            await Task.Delay(TimeSpan.FromSeconds(30), ct);\n        }\n    }\n}'
          ),
          sl(
            'Tarefas periódicas com PeriodicTimer',
            'Para repetir algo a cada intervalo, o PeriodicTimer é a ferramenta indicada: await timer.WaitForNextTickAsync(token) espera o próximo tick e devolve true; devolve false se o timer foi descartado, e lança OperationCanceledException quando o token é cancelado. Diferente de "trabalhar e depois Task.Delay", cujo ciclo acumula o tempo do trabalho (deriva), o PeriodicTimer mantém o ritmo regular dos ticks; se o trabalho demorar mais que o intervalo, os ticks perdidos não se acumulam nem rodam em paralelo: a próxima espera já está pronta. Descarte o timer com using.',
            'protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n{\n    using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));\n    while (await timer.WaitForNextTickAsync(stoppingToken))\n    {\n        await FazerTrabalhoAsync(stoppingToken);   // a cada 5 s, sem sobreposição\n    }\n}'
          ),
          sl(
            'Serviço do Windows, systemd e health checks',
            'O mesmo worker pode virar um serviço do sistema operacional: no Windows, AddWindowsService() (pacote Microsoft.Extensions.Hosting.WindowsServices) faz o host obedecer ao gerenciador de serviços; no Linux, AddSystemd() integra com o systemd. Com a chamada no código, o mesmo executável roda no console (desenvolvimento) ou como serviço. Health checks são verificações que dizem se a aplicação está viva (liveness) ou pronta para receber trabalho (readiness, por exemplo banco acessível): registram-se com AddHealthChecks() e são consultados por orquestradores e balanceadores, que reiniciam ou tiram de circulação instâncias doentes. Em worker sem HTTP, a verificação pode ser exposta por outro meio ou por um arquivo/sinal.',
            'builder.Services.AddWindowsService();   // como serviço do Windows\n// builder.Services.AddSystemd();         // como unidade do systemd (Linux)\n\nbuilder.Services.AddHealthChecks();       // registra verificações de saúde'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o Host genérico (Host.CreateApplicationBuilder) unifica?', 'c', [
          'Apenas o acesso a banco de dados',
          'Só a interface gráfica',
          'Injeção de dependência, configuração, logging e o ciclo de vida da aplicação',
          'Somente a serialização JSON'
        ], 'O host monta DI, configuração e logging com padrões sensatos e gerencia o início e o encerramento.'),
        mcq('q2', 'Qual é o padrão correto de laço em ExecuteAsync?', 'a', [
          'while (!stoppingToken.IsCancellationRequested) { ... await Task.Delay(1000, stoppingToken); }',
          'while (true) { Thread.Sleep(1000); }',
          'for (;;) { ... } sem usar o token',
          'Executar o trabalho uma vez e nunca terminar a Task'
        ], 'O laço checa o token e repassa o token às esperas, para que o encerramento seja respeitado.'),
        mcq('q3', 'O que acontece quando o host recebe Ctrl+C ou SIGTERM?', 'd', [
          'O processo morre imediatamente, sem avisar os serviços',
          'O host ignora o sinal',
          'O host reinicia os serviços',
          'O host cancela o stoppingToken, chama StopAsync e espera até o tempo limite antes de encerrar'
        ], 'O encerramento é cooperativo: os serviços precisam respeitar o token e terminar a tempo.'),
        fill('q4', 'De que classe base herda um serviço de segundo plano com ExecuteAsync?', 'class Worker : ___\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken) { }\n}', ['BackgroundService'], 'BackgroundService implementa IHostedService e chama o ExecuteAsync, cuidando do cancelamento.'),
        mcq('q5', 'Um BackgroundService (singleton) precisa usar um DbContext (Scoped). Qual a abordagem correta?', 'b', [
          'Injetar o DbContext direto no construtor do worker',
          'Injetar IServiceScopeFactory e criar um escopo a cada unidade de trabalho',
          'Registrar o DbContext como Singleton',
          'Criar o DbContext com new em um campo estático'
        ], 'Injetar o Scoped no singleton causaria dependência cativa. O escopo curto garante instância nova e descarte.'),
        mcq('q6', 'Qual a vantagem do PeriodicTimer sobre "fazer o trabalho e depois Task.Delay"?', 'd', [
          'Ele roda o trabalho em várias threads',
          'Ele dispensa o CancellationToken',
          'Ele nunca lança exceções',
          'Mantém um ritmo regular de ticks, sem deriva por conta da duração do trabalho nem sobreposição de execuções'
        ], 'Com Delay depois do trabalho, o intervalo real é trabalho + espera. O PeriodicTimer marca os ticks em intervalos regulares.'),
        mcq('q7', 'O que acontece, por padrão, se uma exceção não tratada escapa de ExecuteAsync?', 'a', [
          'O host é encerrado, por isso se trata a exceção a cada iteração e se registra o erro',
          'A exceção é ignorada em silêncio',
          'O serviço reinicia sozinho',
          'O Windows exibe uma janela de erro'
        ], 'Por padrão uma falha não tratada no serviço de segundo plano derruba o host. Um try/catch por volta mantém o worker vivo.'),
        fill('q8', 'Que método do PeriodicTimer aguarda o próximo intervalo?', 'while (await timer.___(stoppingToken))\n{\n    await FazerTrabalhoAsync();\n}', ['WaitForNextTickAsync'], 'WaitForNextTickAsync devolve true a cada tick, e false quando o timer é descartado.')
      ]
    },
    {
      id: 'csi-46-jobs-segundo-plano-agendamento',
      title: 'Jobs em segundo plano e agendamento',
      goal: 'Decidir o que sai do ciclo da requisição, montar uma fila interna com Channel e BackgroundService, usar Hangfire/Quartz com segurança e projetar jobs idempotentes, resilientes e agendados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quando tirar trabalho do ciclo da requisição',
            'Uma requisição HTTP deve responder rápido. Trabalho que demora (gerar relatório, enviar e-mail, redimensionar imagem, chamar uma API lenta), que pode falhar e precisa ser repetido, ou que não precisa estar pronto para a resposta, deve sair da requisição: a API registra a intenção, responde logo (muitas vezes 202 Accepted) e outro componente executa depois. Ganhos: o cliente não espera, uma falha externa não derruba a requisição e dá para repetir a tarefa. Custo: o resultado deixa de ser imediato, e surgem perguntas novas (e se o processo cair? e se rodar duas vezes?). Os próximos slides respondem a elas.',
            '// RUIM: o cliente espera o e-mail sair (e a requisição falha se o SMTP cair)\napp.MapPost("/pedidos", async (Pedido p, IEmail email) =>\n{\n    await Salvar(p);\n    await email.EnviarAsync(p);        // lento e instável\n    return Results.Ok();\n});\n\n// BOM: registra o trabalho e responde na hora\n//   await fila.EnfileirarAsync(new EnviarEmail(p.Id));\n//   return Results.Accepted();'
          ),
          sl(
            'Fila em memória: Channel<T> e BackgroundService',
            'Channel<T> (namespace System.Threading.Channels) é uma fila assíncrona e segura para várias threads, com um lado que ESCREVE (Writer) e outro que LÊ (Reader). Channel.CreateBounded<T>(n) limita o tamanho: quando está cheio, WriteAsync espera, o que aplica contrapressão e evita estourar a memória; CreateUnbounded não tem limite. Um BackgroundService (hospedado no host genérico) lê o canal em ExecuteAsync com await foreach sobre Reader.ReadAllAsync. Limite importante: a fila vive na memória do processo, então se a aplicação reiniciar, o que estava na fila se perde. Serve para trabalho que pode ser refeito ou perdido; para trabalho crítico, use fila persistente, mensageria ou um framework de jobs.',
            'var canal = Channel.CreateBounded<int>(2);\nvar consumidor = Task.Run(async () =>\n{\n    await foreach (var x in canal.Reader.ReadAllAsync())\n        Console.Write(x + " ");\n});\nfor (int i = 1; i <= 4; i++) await canal.Writer.WriteAsync(i); // espera se estiver cheio\ncanal.Writer.Complete();   // avisa que não há mais itens\nawait consumidor;          // 1 2 3 4\n\n// no serviço:\n// protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n// {\n//     await foreach (var item in _canal.Reader.ReadAllAsync(stoppingToken))\n//         await Processar(item);\n// }'
          ),
          sl(
            'Escopo de DI dentro de um serviço em background',
            'Um BackgroundService é registrado como singleton: existe uma única instância durante toda a vida da aplicação. Serviços com ciclo de vida scoped (como o DbContext do EF Core, que vale por requisição) não podem ser injetados no construtor de um singleton: o contêiner recusa (ou, pior, você prenderia um DbContext por horas). A solução é injetar IServiceScopeFactory e criar um escopo manualmente para cada unidade de trabalho, resolvendo os serviços scoped dentro dele e descartando o escopo ao final (using / await using).',
            'public class Processador(IServiceScopeFactory fabrica, Channel<int> canal) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        await foreach (var id in canal.Reader.ReadAllAsync(stoppingToken))\n        {\n            using var escopo = fabrica.CreateScope();          // um escopo por item\n            var db = escopo.ServiceProvider.GetRequiredService<AppDbContext>();\n            // ... usar db ...\n        }                                                      // escopo descartado aqui\n    }\n}'
          ),
          sl(
            'Hangfire e Quartz.NET: jobs persistentes',
            'Para jobs que não podem se perder, bibliotecas como Hangfire e Quartz.NET guardam os jobs num armazenamento persistente (banco de dados, geralmente), sobrevivem a reinícios, fazem retentativas e agendam. Hangfire tem três estilos principais: fire-and-forget (executa uma vez, o mais cedo possível), delayed (executa uma vez depois de um atraso) e recurring (repete conforme uma expressão cron). Também traz um painel web (dashboard) para ver, repetir e apagar jobs. RISCO: o painel permite disparar, apagar e inspecionar jobs, cujos argumentos podem conter dados pessoais. Exponha-o SOMENTE com autenticação e autorização (um filtro de autorização que permita só administradores), nunca aberto na internet. Quartz.NET é mais voltado a agendamento sofisticado (jobs, triggers, calendários) e usa uma sintaxe de cron com um campo extra de segundos.',
            '// Hangfire (visão geral)\nBackgroundJob.Enqueue<IEmailJob>(j => j.Enviar(pedidoId));                 // fire-and-forget\nBackgroundJob.Schedule<IEmailJob>(j => j.Lembrar(pedidoId), TimeSpan.FromHours(1)); // delayed\nRecurringJob.AddOrUpdate<IRelatorioJob>("fechamento", j => j.Gerar(), "0 3 * * *"); // recurring\n\n// painel: SEMPRE protegido\napp.UseHangfireDashboard("/jobs", new DashboardOptions\n{\n    Authorization = new[] { new FiltroSomenteAdmin() }   // sem isso, o painel fica exposto\n});'
          ),
          sl(
            'Expressões cron (5 campos)',
            'Cron descreve um horário recorrente em cinco campos separados por espaço: minuto (0-59), hora (0-23), dia do mês (1-31), mês (1-12) e dia da semana (0-6, com domingo sendo 0; também 7 em muitas implementações). O asterisco * significa "todos"; */n significa "a cada n"; a-b é um intervalo; a,b é uma lista. Lembre-se: o primeiro campo é o MINUTO, não a hora. Alguns agendadores, como o Quartz.NET, acrescentam um campo de segundos no início, então confira a documentação do que você usa.',
            '0 3 * * *       // todo dia às 03:00\n*/15 * * * *    // a cada 15 minutos\n30 8 * * 1-5    // às 08:30, de segunda a sexta\n0 0 1 * *       // meia-noite do dia 1 de cada mês\n0 9,18 * * *    // às 09:00 e às 18:00'
          ),
          sl(
            'Várias instâncias, idempotência e falhas',
            'Em produção, a aplicação costuma rodar em várias instâncias (réplicas). Se cada uma tem seu timer interno, o job "diário" roda N vezes. Soluções: um agendador persistente que garante execução única (Hangfire e Quartz em modo cluster coordenam pelo banco), um lock distribuído (uma instância adquire o direito de executar, por exemplo via banco ou Redis, com expiração), eleição de líder, ou tirar o agendamento da aplicação com um CronJob do Kubernetes. Mesmo assim, jobs podem rodar mais de uma vez (queda no meio, retentativa), então escreva-os IDEMPOTENTES: executar duas vezes produz o mesmo efeito de uma. Técnicas: chave de idempotência (gravar "pedido X já processado" na mesma transação), operações do tipo "upsert" e verificação do estado antes de agir. Falhas transitórias pedem retentativas com espera crescente (backoff) e limite de tentativas; o que continua falhando vai para uma fila de mensagens com falha (dead-letter) ou fica marcado para revisão, em vez de repetir para sempre.',
            'async Task CobrarAsync(Guid pedidoId, AppDbContext db)\n{\n    var pedido = await db.Pedidos.FindAsync(pedidoId);\n    if (pedido is null || pedido.Status == Status.Cobrado)\n        return;                          // idempotente: segunda execução não faz nada\n\n    await gateway.CobrarAsync(pedido.Id.ToString(), pedido.Total);   // chave de idempotência = id\n    pedido.Status = Status.Cobrado;\n    await db.SaveChangesAsync();\n}'
          ),
          sl(
            'Desligamento, observabilidade, fuso e alternativas',
            'Cancelamento: ao desligar, o host sinaliza o stoppingToken; o job deve verificá-lo (laço while (!stoppingToken.IsCancellationRequested)) e repassá-lo às APIs async para encerrar de forma limpa. Observabilidade: registre início, fim, duração e falhas de cada execução, com um identificador do job (sem dados pessoais nos logs), e exponha métricas e alertas para jobs que não rodam ou falham sempre; um job silenciosamente parado é um problema comum. Fuso: cron roda no fuso do servidor (muitas vezes UTC), então "às 3h" pode não ser 3h no Brasil; defina o fuso do agendamento explicitamente (os agendadores têm opção de fuso) e lembre do horário de verão. Alternativas: serviço do sistema operacional (Windows Service, systemd timer), CronJob do Kubernetes (um contêiner que roda e termina) e funções serverless com gatilho de tempo; escolha conforme onde a aplicação já vive.',
            'protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n{\n    while (!stoppingToken.IsCancellationRequested)\n    {\n        try { await ExecutarCicloAsync(stoppingToken); }\n        catch (OperationCanceledException) { break; }   // desligamento normal\n        catch (Exception ex) { _log.LogError(ex, "Ciclo falhou"); }\n        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);\n    }\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual tarefa é a melhor candidata a sair do ciclo da requisição HTTP?', 'd', [
          'Validar se um campo obrigatório foi preenchido no corpo',
          'Ler um registro simples por chave primária no banco',
          'Somar dois números enviados no corpo da requisição',
          'Gerar um PDF grande e enviá-lo por e-mail ao cliente'
        ], 'Trabalho lento, instável ou não essencial para a resposta vai para segundo plano; a API responde logo (por exemplo, 202 Accepted).'),
        mcq('q2', 'Por que preferir Channel.CreateBounded a CreateUnbounded numa fila interna de jobs?', 'c', [
          'Porque o canal limitado persiste os itens em disco para sobreviver a reinícios',
          'Porque o canal ilimitado só aceita um escritor por vez e bloqueia leitores',
          'Quando cheio, WriteAsync espera (contrapressão) e a memória não cresce sem limite',
          'Porque o canal limitado garante que cada item seja processado em outra máquina da rede'
        ], 'O limite aplica contrapressão ao produtor. Em nenhum dos dois casos o canal persiste dados: ele vive na memória do processo.'),
        mcq('q3', 'Um BackgroundService recebe AppDbContext (scoped) no construtor e a aplicação falha ao subir. Qual a correção?', 'b', [
          'Registrar o BackgroundService como scoped para herdar o ciclo da requisição',
          'Injetar IServiceScopeFactory e abrir um escopo por tarefa para obter o contexto',
          'Transformar o AppDbContext em um campo estático compartilhado por todos os itens',
          'Criar o AppDbContext com new uma só vez e reutilizá-lo durante toda a vida do app'
        ], 'O serviço em background é singleton. O escopo manual dá ao DbContext um ciclo de vida curto, descartado ao fim de cada tarefa.'),
        fill('q4', 'Complete o cron para executar todo dia às 03:00 em ponto (campos: minuto hora dia mês dia-da-semana).', '___ 3 * * *', ['0'], 'O primeiro campo é o minuto: 0 minutos da hora 3, todos os dias.'),
        mcq('q5', 'O painel do Hangfire foi publicado em /jobs sem nenhum filtro de autorização. Qual o problema?', 'a', [
          'Qualquer um com a URL poderia ver, repetir e apagar jobs do sistema',
          'O painel fica lento porque cada acesso recria todos os jobs pendentes',
          'Os jobs recorrentes deixam de respeitar a expressão cron configurada',
          'O painel só funciona em ambiente de desenvolvimento e não em produção'
        ], 'Dashboards administrativos exigem autenticação e autorização; os argumentos dos jobs podem conter dados pessoais.'),
        mcq('q6', 'Um job que cobra pedidos caiu no meio e foi reexecutado, cobrando duas vezes. O que faltou?', 'c', [
          'Aumentar o tamanho do canal para que a fila em memória nunca se perca',
          'Trocar o cron por uma expressão com campo de segundos e mais precisão',
          'Idempotência: checar o estado do pedido e usar chave de idempotência',
          'Desligar para sempre as retentativas automáticas do agendador'
        ], 'Jobs podem rodar mais de uma vez. Verificar o estado e enviar uma chave de idempotência torna a repetição segura.'),
        mcq('q7', 'A API roda em 3 réplicas e cada uma tem um timer interno para o job diário, que acaba rodando 3 vezes. Qual solução resolve?', 'b', [
          'Diminuir o intervalo do timer em cada réplica para ele disparar antes das outras',
          'Agendador de execução única: lock distribuído, cluster no banco ou CronJob',
          'Aumentar o número de threads de cada instância para o job terminar mais cedo',
          'Reiniciar as réplicas em horários diferentes, para o timer não coincidir'
        ], 'É preciso coordenar as instâncias: um lock distribuído, um agendador persistente em cluster ou tirar o agendamento da aplicação.'),
        fill('q8', 'Complete o laço do serviço para parar de forma limpa quando o host for desligado.', 'while (!___.IsCancellationRequested)\n{\n    await ExecutarCicloAsync(stoppingToken);\n}', ['stoppingToken'], 'O host cancela o stoppingToken no desligamento; o laço o consulta e o repassa às operações assíncronas.')
      ]
    },
    {
      id: 'csi-39-ambiente-desenvolvimento-dotnet',
      title: 'Ambiente de desenvolvimento .NET',
      goal: 'Escolher e configurar o ambiente de trabalho: IDEs, CLI do dotnet, ferramentas, arquivos de configuração de solução e hábitos seguros com extensões e ferramentas de terceiros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Visual Studio, VS Code e Rider',
            'Você pode programar C# até num bloco de notas, mas um ambiente integrado dá produtividade. Visual Studio (Windows) é o IDE completo da Microsoft: designers, depurador e profiler poderosos, muito usado em soluções grandes e em desktop. VS Code é um editor leve e multiplataforma; com a extensão C# Dev Kit (e o C# base) ganha IntelliSense, depuração, gerenciador de testes e de solução. Rider, da JetBrains, é um IDE multiplataforma com análise de código e refatoração muito fortes. Todos oferecem o essencial: refatoração (renomear símbolo em todo o código, extrair método), navegação (ir para a definição, achar todas as referências), análise de código em tempo real (avisos e correções sugeridas) e snippets (digitar prop ou cw e expandir). Na prática: escolha pelo sistema operacional, tamanho do projeto e hábito da equipe; o projeto em si é o mesmo (.csproj) em qualquer um deles.',
            'Atalhos comuns (variam por IDE/keymap):\nF5            iniciar com depuração\nF12           ir para a definição\nShift+F12     achar todas as referências\nCtrl+.        ações rápidas e refatorações (VS e VS Code)\nAlt+Enter     ações de contexto (Rider)\n\nSnippets: digitar  prop + Tab  ->  public int MyProperty { get; set; }\n                   cw   + Tab  ->  Console.WriteLine();'
          ),
          sl(
            'A CLI dotnet: o ciclo essencial',
            'Tudo o que o IDE faz por baixo é a CLI dotnet, que também roda em servidores de CI. dotnet new cria projetos e arquivos a partir de templates; dotnet restore baixa os pacotes NuGet (build e run já o executam implicitamente); dotnet build compila; dotnet run compila e executa; dotnet test roda os testes; dotnet publish gera a saída pronta para implantar; dotnet clean apaga as saídas de build. Soluções agrupam vários projetos: dotnet new sln cria o arquivo, dotnet sln add inclui projetos. Dependências: dotnet add package traz um pacote NuGet e dotnet add reference liga um projeto a outro da mesma solução.',
            'dotnet new sln -n Loja\ndotnet new classlib -n Loja.Dominio\ndotnet new webapi -n Loja.Api\ndotnet sln add Loja.Dominio Loja.Api\ndotnet add Loja.Api reference Loja.Dominio\ndotnet add Loja.Api package Serilog.AspNetCore\ndotnet build\ndotnet test\ndotnet publish Loja.Api -c Release -o ./saida'
          ),
          sl(
            'dotnet watch, Hot Reload e templates',
            'dotnet watch run observa os arquivos e, ao salvar, recompila e aplica a mudança. Com Hot Reload, muitas edições (corpo de métodos, por exemplo) entram no processo em execução SEM reiniciá-lo e sem perder o estado; edições que ele não consegue aplicar (certas mudanças estruturais) pedem reinício, que o watch oferece ou faz sozinho. Existe também dotnet watch test, que reexecuta os testes a cada alteração. Os templates disponíveis aparecem com dotnet new list (filtre por texto, como dotnet new list web); dotnet new <nome> --help mostra as opções de cada um. Templates extras de terceiros podem ser instalados, mas valem o mesmo cuidado de qualquer pacote externo.',
            'dotnet new list                 # lista templates instalados\ndotnet new list web              # filtra por "web"\ndotnet new webapi --help         # opções do template\ndotnet watch run                 # recompila/aplica ao salvar\ndotnet watch test                # reroda testes ao salvar'
          ),
          sl(
            'Ferramentas globais e locais',
            'Ferramentas .NET são programas de linha de comando distribuídos como pacotes NuGet. Globais (--global) ficam disponíveis em qualquer pasta do seu usuário. Locais ficam registradas num manifesto, o arquivo dotnet-tools.json (tradicionalmente dentro da pasta .config; versões do SDK aceitam também na raiz), versionado com o projeto: quem clona o repositório roda dotnet tool restore e todos passam a usar as MESMAS versões. Para criar o manifesto use dotnet new tool-manifest; depois dotnet tool install <nome> (sem --global) acrescenta a ferramenta a ele. Exemplos conhecidos: dotnet-ef (migrações do Entity Framework Core, chamada como dotnet ef) e dotnet format, que aplica as regras de estilo do .editorconfig e já vem embutido no SDK. Prefira ferramentas locais em projetos de equipe: versões fixas, sem depender da máquina de cada pessoa.',
            'dotnet new tool-manifest                 # cria o manifesto dotnet-tools.json\ndotnet tool install dotnet-ef             # local: entra no manifesto\ndotnet tool install --global dotnet-ef    # global: no seu usuário\ndotnet tool restore                       # em clone novo: instala as do manifesto\ndotnet ef migrations list\ndotnet format --verify-no-changes         # útil no CI'
          ),
          sl(
            'global.json, Directory.Build.props e .editorconfig',
            'global.json, na raiz da solução, fixa qual SDK do .NET a CLI usa dali para baixo (campo sdk.version, com rollForward para permitir atualizações de patch ou feature): sem ele, cada máquina usa o SDK mais novo que tiver e o build pode variar. Directory.Build.props é um arquivo MSBuild que o build procura nas pastas acima de cada projeto e aplica automaticamente: serve para compartilhar propriedades (Nullable, TreatWarningsAsErrors, versão) sem repetir em cada .csproj. .editorconfig define o estilo de código (var, chaves, nomes) e a severidade de cada diagnóstico dos analisadores Roslyn (as regras CAxxxx de qualidade e IDExxxx de estilo): você decide se uma regra é none, suggestion, warning ou error, e o time inteiro vê o mesmo resultado no IDE e no build.',
            '// global.json\n{ "sdk": { "version": "<versão-do-sdk>", "rollForward": "latestFeature" } }\n\n<!-- Directory.Build.props -->\n<Project>\n  <PropertyGroup>\n    <Nullable>enable</Nullable>\n    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>\n  </PropertyGroup>\n</Project>\n\n# .editorconfig\n[*.cs]\ndotnet_diagnostic.CA2000.severity = warning'
          ),
          sl(
            'User Secrets, experimentação e depuração',
            'Segredos de desenvolvimento (chave de API, senha de banco local) não vão no appsettings.json versionado: use dotnet user-secrets. init prepara o projeto; set grava um valor num arquivo no perfil do seu usuário, FORA do repositório; list mostra. Atenção: não é criptografado nem serve para produção, onde se usam variáveis de ambiente ou um cofre de segredos. Para experimentar código sem criar projeto existem LINQPad, a janela C# Interactive do Visual Studio e a ferramenta de terceiros dotnet-script. Para depurar, além de F5, você pode anexar o depurador a um processo já em execução (Attach to Process; no VS Code, uma configuração do tipo attach), inclusive em contêiner ou máquina remota com o depurador remoto: isso exige canal autenticado e nunca portas de depuração abertas para a internet.',
            'dotnet user-secrets init\ndotnet user-secrets set "Pagamentos:ChaveApi" "<sua-chave>"\ndotnet user-secrets list\n\n// no código, igual a qualquer configuração:\nvar chave = builder.Configuration["Pagamentos:ChaveApi"];'
          ),
          sl(
            'Segurança do ambiente: extensões, ferramentas e pacotes',
            'Tudo o que você instala roda com as permissões do seu usuário: uma ferramenta global, uma extensão do editor ou até um pacote NuGet (pacotes podem trazer scripts MSBuild executados no build) pode ler seus arquivos, chaves SSH e tokens. Boas práticas: instale só de fontes oficiais (marketplace oficial, nuget.org), confira o editor/autor, o número de downloads, o repositório e os pacotes com prefixo reservado; desconfie de nomes quase iguais aos de ferramentas conhecidas (typosquatting); prefira ferramentas locais com versão fixa no manifesto; revise o que o CI instala; mantenha o SDK atualizado e rode dotnet list package --vulnerable. Nunca coloque segredos em .editorconfig, global.json ou nos scripts de ferramentas, e não rode como administrador por comodidade.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre os ambientes de desenvolvimento para .NET está correta?', 'b', [
          'O VS Code já traz suporte completo a C# sem nenhuma extensão instalada, bastando abrir a pasta do projeto',
          'O VS Code, com a extensão C# Dev Kit, e o Rider rodam em vários sistemas operacionais',
          'O Rider só funciona como um plugin instalado dentro do Visual Studio',
          'O Visual Studio é o único ambiente capaz de depurar aplicativos .NET'
        ], 'VS Code precisa das extensões de C#; Rider é um IDE próprio e multiplataforma. A depuração é possível nos três ambientes.'),
        mcq('q2', 'Qual comando faz o projeto Loja.Api referenciar o projeto Loja.Dominio, que está na mesma solução?', 'c', [
          'dotnet sln add Loja.Dominio, que também cria a dependência de código',
          'dotnet restore Loja.Dominio, que liga os dois projetos',
          'dotnet add Loja.Api reference Loja.Dominio',
          'dotnet add Loja.Api package Loja.Dominio, igual a um pacote'
        ], 'dotnet add reference liga um projeto a outro. sln add só inclui o projeto na solução, sem criar dependência entre eles.'),
        mcq('q3', 'O que faz dotnet watch run durante o desenvolvimento?', 'd', [
          'Publica o aplicativo em produção a cada alteração salva no disco',
          'Apenas mostra o consumo de memória do processo ao longo do tempo',
          'Executa os testes uma vez e encerra o terminal em seguida',
          'Observa os arquivos e reaplica as mudanças (Hot Reload) sozinho'
        ], 'O watch recompila ao salvar; com Hot Reload muitas mudanças entram no processo em execução sem reiniciar.'),
        fill('q4', 'Num clone novo do repositório, qual subcomando instala as ferramentas locais listadas no manifesto dotnet-tools.json?', 'dotnet tool ___', ['restore'], 'dotnet tool restore lê o manifesto e instala as versões fixadas, garantindo as mesmas ferramentas para todo o time.'),
        mcq('q5', 'Qual associação entre arquivo e função está correta?', 'a', [
          'global.json fixa o SDK usado; Directory.Build.props compartilha propriedades entre projetos',
          'global.json compartilha propriedades de build; Directory.Build.props fixa o SDK usado',
          'global.json guarda segredos locais; Directory.Build.props lista os pacotes NuGet de todos os projetos',
          'global.json define as portas do Kestrel; Directory.Build.props define a cultura'
        ], 'global.json escolhe a versão do SDK; Directory.Build.props é aplicado automaticamente pelo MSBuild a todos os projetos abaixo dele.'),
        mcq('q6', 'O que esta linha de um .editorconfig faz?\n[*.cs]\ndotnet_diagnostic.CA2000.severity = error', 'b', [
          'Desativa a regra CA2000 para todos os arquivos C# da pasta',
          'Passa a tratar o diagnóstico CA2000 do analisador como erro de build e do IDE',
          'Fixa em CA2000 a versão do SDK usada pelos projetos da pasta',
          'Cria um segredo chamado CA2000 no perfil do usuário atual'
        ], 'O .editorconfig define a severidade dos diagnósticos dos analisadores (none, suggestion, warning ou error) para todo o time.'),
        mcq('q7', 'Qual cuidado é correto ao instalar uma ferramenta com dotnet tool install --global?', 'c', [
          'Nenhum, pois ferramentas globais rodam isoladas num sandbox sem acesso aos arquivos',
          'Basta que o nome seja parecido com o de uma ferramenta conhecida e popular',
          'Conferir origem e autoria, pois ela executa com as permissões do seu usuário',
          'Instalar sempre como administrador, para evitar erros de permissão'
        ], 'Ferramentas globais são programas comuns: podem acessar o que o seu usuário acessa. Nomes parecidos são técnica de typosquatting.'),
        fill('q8', 'Complete o comando que grava um segredo de desenvolvimento fora do repositório.', 'dotnet user-secrets ___ "Jwt:Key" "<sua-chave>"', ['set'], 'user-secrets set guarda o valor no perfil do usuário (sem criptografia, só para desenvolvimento); em produção use variáveis de ambiente ou um cofre.')
      ]
    },
    {
      id: 'csi-20-aspnet-fundamentos-minimal-apis',
      title: 'ASP.NET Core: fundamentos e Minimal APIs',
      goal: 'Montar uma API HTTP com Minimal APIs, entendendo o pipeline de middleware, o roteamento, o binding e a injeção de dependência.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o ASP.NET Core e o Kestrel',
            'ASP.NET Core é o framework web do .NET: ele recebe requisições HTTP, executa o seu código e devolve respostas. Quem de fato escuta a porta e fala HTTP é o Kestrel, um servidor web embutido no próprio aplicativo — não é preciso instalar um servidor separado para rodar. Em produção é comum colocar um proxy reverso (Nginx, IIS, um balanceador) na frente do Kestrel. Seu app é, no fundo, um programa de console que sobe um servidor.'
          ),
          sl(
            'O menor programa: builder, app e Run',
            'WebApplication.CreateBuilder(args) cria o builder: é nele que você registra serviços (builder.Services) e lê configuração. builder.Build() produz o app, e a partir daí você define o pipeline e as rotas. app.Run() inicia o servidor e bloqueia até o processo ser encerrado. Tudo o que é registrado em Services precisa vir ANTES do Build; depois do Build, os serviços ficam fixos.',
            'var builder = WebApplication.CreateBuilder(args);\n// registrar serviços aqui\nvar app = builder.Build();\n// middlewares e rotas aqui\napp.MapGet("/", () => "Olá, mundo!");\napp.Run();'
          ),
          sl(
            'Pipeline de middleware: a ordem importa',
            'Uma requisição atravessa uma cadeia de middlewares, na ordem em que foram adicionados com app.Use...; a resposta volta pelo mesmo caminho. Cada middleware pode tratar a requisição, repassá-la ao próximo ou encerrá-la (curto-circuito). Por isso a ordem é parte da lógica: a autenticação precisa vir antes da autorização (primeiro descobre quem é, depois decide o que pode), e ambas antes dos endpoints que protegem. Trocar a ordem pode deixar uma rota protegida aberta ou fazê-la sempre negar.',
            'app.UseHttpsRedirection();   // http -> https\napp.UseAuthentication();      // quem é você?\napp.UseAuthorization();       // o que você pode fazer?\napp.MapGet("/segredo", () => "ok").RequireAuthorization();'
          ),
          sl(
            'Roteamento e binding',
            'MapGet, MapPost, MapPut e MapDelete ligam um verbo HTTP e um padrão de URL a um delegate (lambda). O binding preenche os parâmetros do delegate automaticamente: um nome igual ao placeholder da URL vem da rota ({id:int} ainda restringe o tipo); um tipo simples fora da rota vem da query string (?busca=abc); um tipo complexo (record, classe) num POST/PUT vem do corpo JSON. Tipos anuláveis (string?, int?) indicam parâmetros opcionais.',
            'app.MapGet("/produtos/{id:int}", (int id) => $"produto {id}");\napp.MapGet("/produtos", (string? busca, int? pagina) => $"busca={busca} pagina={pagina}");\napp.MapPost("/produtos", (NovoProduto dto) => dto);\n\nrecord NovoProduto(string Nome, decimal Preco);'
          ),
          sl(
            'Respostas com Results',
            'Devolver um valor simples gera 200 com o conteúdo serializado em JSON. Para controlar o status HTTP use a classe Results: Results.Ok(valor) = 200, Results.NotFound() = 404, Results.BadRequest("mensagem") = 400 e Results.Created(uri, valor) = 201 com o cabeçalho Location apontando para o recurso criado. Escolher o status certo faz parte do contrato da API: o cliente decide o que fazer a partir dele.',
            'app.MapGet("/produtos/{id:int}", (int id) =>\n    id == 1\n        ? Results.Ok(new { Id = 1, Nome = "Caneta" })\n        : Results.NotFound());\n\napp.MapPost("/produtos", (NovoProduto dto) =>\n    string.IsNullOrWhiteSpace(dto.Nome)\n        ? Results.BadRequest("Nome é obrigatório")\n        : Results.Created("/produtos/2", dto));'
          ),
          sl(
            'Injeção de dependência e MapGroup',
            'Parâmetros de um endpoint cujo tipo está registrado em builder.Services são injetados pelo contêiner de DI — você não precisa de atributo. MapGroup agrupa rotas com um prefixo comum (e configuração compartilhada, como RequireAuthorization), evitando repetição.',
            'builder.Services.AddSingleton<IRelogio, RelogioSistema>();\n// ...\nvar api = app.MapGroup("/api/hora");\napi.MapGet("/", (IRelogio relogio) => relogio.Agora());\n\ninterface IRelogio { DateTime Agora(); }\nclass RelogioSistema : IRelogio { public DateTime Agora() => DateTime.UtcNow; }'
          ),
          sl(
            'dotnet run e launchSettings.json',
            'dotnet run compila e executa o projeto. As URLs e o ambiente de desenvolvimento vêm de Properties/launchSettings.json: cada perfil define applicationUrl (portas) e variáveis como ASPNETCORE_ENVIRONMENT=Development. Esse arquivo serve só para o desenvolvimento local — ele não vai no publish, e em produção a configuração vem de variáveis de ambiente. Nunca coloque segredos nele, pois costuma ser versionado.',
            '{\n  "profiles": {\n    "http": {\n      "commandName": "Project",\n      "applicationUrl": "http://localhost:5080",\n      "environmentVariables": {\n        "ASPNETCORE_ENVIRONMENT": "Development"\n      }\n    }\n  }\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual componente do ASP.NET Core de fato escuta a porta e fala HTTP, dentro do seu aplicativo?', 'b', [
          'O IIS, obrigatoriamente',
          'O Kestrel, servidor web embutido no app',
          'O launchSettings.json',
          'O comando dotnet run'
        ], 'O Kestrel é o servidor embutido. Um proxy reverso pode ficar na frente, mas não é obrigatório para rodar.'),
        mcq('q2', 'Por que a ordem dos middlewares importa?', 'd', [
          'Porque o compilador exige ordem alfabética',
          'Porque só o primeiro middleware executa',
          'Porque a resposta nunca passa pelos middlewares',
          'Porque a requisição os atravessa na ordem registrada; por exemplo, autenticação deve vir antes da autorização'
        ], 'O pipeline é uma cadeia ordenada. Autorização depende de saber quem é o usuário, que a autenticação determina antes.'),
        mcq('q3', 'No código abaixo, de onde vem o valor de "pagina"?\napp.MapGet("/itens", (int? pagina) => pagina);', 'a', [
          'Da query string (?pagina=2), pois é tipo simples fora da rota',
          'Do corpo JSON da requisição',
          'De um cabeçalho obrigatório',
          'Do launchSettings.json'
        ], 'Tipos simples que não aparecem no padrão da rota são lidos da query string. O int? torna o parâmetro opcional.'),
        fill('q4', 'Complete com o método que mapeia o verbo HTTP usado para CRIAR um recurso.', 'app.___("/produtos", (NovoProduto dto) => Results.Created("/produtos/1", dto));', ['MapPost'], 'MapPost trata requisições POST, o verbo usual para criar recursos; o dto vem do corpo JSON.'),
        mcq('q5', 'Qual resultado devolve o status 201 com o cabeçalho Location?', 'c', [
          'Results.Ok(valor)',
          'Results.NotFound()',
          'Results.Created(uri, valor)',
          'Results.BadRequest(valor)'
        ], 'Results.Created responde 201 e informa em Location a URL do recurso criado.'),
        mcq('q6', 'Qual é o efeito de MapGroup("/api/pedidos")?', 'a', [
          'Agrupa rotas sob um prefixo comum, permitindo configuração compartilhada',
          'Cria uma tabela no banco chamada pedidos',
          'Desativa o roteamento nas demais rotas',
          'Executa as rotas em paralelo'
        ], 'MapGroup só organiza: prefixo comum e configuração (como autorização) aplicada a todas as rotas do grupo.'),
        mcq('q7', 'Sobre o launchSettings.json, qual afirmação é correta?', 'd', [
          'É o local ideal para guardar a chave do JWT de produção',
          'É lido pelo servidor em produção para definir as portas',
          'Substitui o Program.cs',
          'Serve para o desenvolvimento local (URLs e ambiente) e não deve conter segredos'
        ], 'Ele é usado pelo dotnet run em desenvolvimento e costuma ir para o Git; em produção a configuração vem do ambiente.'),
        fill('q8', 'Complete para que a autorização funcione depois de saber quem é o usuário.', 'app.UseAuthentication();\napp.___();', ['UseAuthorization'], 'Autenticação identifica; UseAuthorization decide o acesso. Nessa ordem.')
      ]
    },
    {
      id: 'csi-21-web-api-controllers',
      title: 'Web APIs com controllers',
      goal: 'Construir APIs REST com controllers, DTOs, validação, status HTTP corretos, ProblemDetails e paginação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Controllers: [ApiController] e ControllerBase',
            'Controllers agrupam endpoints em classes. Herde de ControllerBase (sem suporte a views) e marque com [ApiController], que ativa comportamentos úteis: validação automática do modelo com resposta 400, inferência da origem dos parâmetros (corpo, rota, query) e respostas de erro padronizadas. [Route] define o prefixo; [HttpGet], [HttpPost], [HttpPut], [HttpDelete] definem o verbo e o sufixo. O token [controller] vira o nome da classe sem "Controller". Para o controller ser descoberto, o Program precisa de builder.Services.AddControllers() e app.MapControllers().',
            '[ApiController]\n[Route("api/[controller]")]\npublic class ProdutosController : ControllerBase\n{\n    [HttpGet("{id:int}")]\n    public ActionResult<ProdutoDto> Obter(int id)\n    {\n        if (id != 1) return NotFound();\n        return new ProdutoDto(1, "Caneta", 3.5m);\n    }\n}\n\npublic record ProdutoDto(int Id, string Nome, decimal Preco);'
          ),
          sl(
            'Códigos HTTP corretos',
            '200 OK: deu certo, há corpo. 201 Created: recurso criado (com Location). 204 No Content: deu certo, sem corpo (típico de PUT/DELETE). 400 Bad Request: requisição malformada ou inválida. 401 Unauthorized: não autenticado (quem é você?). 403 Forbidden: autenticado, mas sem permissão. 404 Not Found: recurso inexistente. 409 Conflict: conflito com o estado atual (ex.: e-mail já cadastrado, versão desatualizada). 422 Unprocessable Entity: sintaxe ok, mas regras de negócio/validação semântica falharam. 500: erro inesperado do servidor — nunca devolva a exceção crua ao cliente. ActionResult<T> permite retornar o tipo T ou qualquer resultado de status (NotFound(), CreatedAtAction(...), NoContent()).'
          ),
          sl(
            'DTOs versus entidades',
            'A entidade representa a tabela do banco; o DTO (Data Transfer Object) representa o contrato público da API. Expor a entidade diretamente vaza campos internos (hash de senha, flags administrativas), acopla o cliente ao esquema do banco e abre a porta para over-posting: o cliente envia campos que você não queria que ele alterasse e o binder os preenche. Use DTOs de entrada (só os campos que o cliente pode enviar) e de saída (só o que pode ver) e mapeie entre eles.',
            'public class Usuario            // entidade (banco)\n{\n    public int Id { get; set; }\n    public string Nome { get; set; } = "";\n    public string SenhaHash { get; set; } = "";\n    public bool EhAdmin { get; set; }\n}\n\npublic record UsuarioDto(int Id, string Nome);   // saída: sem hash nem flag admin'
          ),
          sl(
            'Validação com DataAnnotations e ModelState',
            'Atributos como [Required], [StringLength(100, MinimumLength = 3)] e [Range(1, 1000)] declaram regras na própria classe. Em controllers com [ApiController] o framework valida o corpo antes de entrar na ação e, se houver erro, responde 400 sozinho. Sem [ApiController], você consulta ModelState.IsValid e devolve ValidationProblem(ModelState). Validação no servidor é obrigatória: validação no cliente é só conveniência.',
            'public class NovoProdutoDto\n{\n    [Required, StringLength(100, MinimumLength = 3)]\n    public string Nome { get; set; } = "";\n\n    [Range(0.01, 100000)]\n    public decimal Preco { get; set; }\n}'
          ),
          sl(
            'ProblemDetails, versionamento e OpenAPI',
            'ProblemDetails é o formato padrão (RFC 9457) para erros HTTP em JSON: campos como type, title, status, detail. Com [ApiController], erros de validação e códigos de erro já saem nesse formato; services.AddProblemDetails() ajuda a padronizar também exceções. Versionamento: para evoluir a API sem quebrar clientes antigos, a versão aparece na URL (/api/v1/...), em cabeçalho ou na query — escolha uma estratégia e mantenha a antiga funcionando por um período. OpenAPI descreve a API de forma legível por máquina; o Swagger UI usa essa descrição para gerar uma página de documentação e testes interativos, geralmente habilitada só em desenvolvimento.'
          ),
          sl(
            'Paginação e idempotência',
            'Nunca devolva uma coleção sem limite: use paginação com parâmetros como pagina e tamanho (impondo um máximo) e informe o total. Idempotência: repetir a mesma requisição tem o mesmo efeito de executá-la uma vez. GET, PUT e DELETE devem ser idempotentes — PUT substitui o recurso por completo (aplicar duas vezes deixa o mesmo estado) e DELETE repetido continua deixando o recurso ausente (o segundo pode devolver 404 ou 204, mas o estado final é igual). POST, em geral, não é idempotente: repetir cria dois recursos.',
            '[HttpGet]\npublic ActionResult<IEnumerable<ProdutoDto>> Listar(int pagina = 1, int tamanho = 20)\n{\n    tamanho = Math.Clamp(tamanho, 1, 100);   // teto para proteger o servidor\n    // ... consulta com Skip((pagina - 1) * tamanho).Take(tamanho)\n    return Ok(Array.Empty<ProdutoDto>());\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual código HTTP indica "autenticado, mas sem permissão para este recurso"?', 'c', [
          '401',
          '404',
          '403',
          '409'
        ], '401 significa não autenticado; 403 significa que o usuário é conhecido, mas não tem permissão.'),
        mcq('q2', 'O que [ApiController] faz por você?', 'a', [
          'Valida o modelo automaticamente (400), infere a origem dos parâmetros e padroniza erros',
          'Cria as tabelas do banco',
          'Criptografa as respostas',
          'Gera o token JWT'
        ], '[ApiController] ativa validação automática, inferência de binding e respostas ProblemDetails.'),
        mcq('q3', 'Por que não devolver a entidade do banco diretamente na API?', 'd', [
          'Porque entidades não podem ser serializadas em JSON',
          'Porque o JSON fica maior que 1 MB',
          'Porque o Swagger recusa entidades',
          'Porque vaza campos internos (como hash de senha), acopla o cliente ao esquema e permite over-posting'
        ], 'DTOs definem o contrato público e evitam expor ou aceitar campos que o cliente não deveria ver ou alterar.'),
        fill('q4', 'Complete o atributo que exige que a propriedade seja informada.', 'public class LoginDto\n{\n    [___]\n    public string Usuario { get; set; } = "";\n}', ['Required'], '[Required] faz o modelo ser inválido quando o valor está ausente (ou nulo), gerando 400 com [ApiController].'),
        mcq('q5', 'Qual status é o mais adequado para um PUT que atualizou o recurso e não devolve corpo?', 'b', [
          '201 Created',
          '204 No Content',
          '401 Unauthorized',
          '500 Internal Server Error'
        ], '204 indica sucesso sem corpo, típico de PUT e DELETE.'),
        mcq('q6', 'Qual afirmação sobre idempotência está correta?', 'd', [
          'POST é sempre idempotente',
          'PUT repetido cria um novo recurso a cada vez',
          'DELETE repetido apaga um recurso diferente a cada vez',
          'Repetir um PUT com o mesmo corpo deixa o recurso no mesmo estado'
        ], 'PUT substitui o recurso pelo corpo enviado: reaplicar não muda o resultado final. POST normalmente não é idempotente.'),
        mcq('q7', 'Qual é o problema deste código?\n[HttpGet]\npublic IActionResult Listar() => Ok(_db.Produtos.ToList());', 'c', [
          'ToList não existe em coleções',
          'Ok só aceita strings',
          'Devolve toda a tabela sem paginação e provavelmente expõe a entidade',
          'Falta o atributo [Required]'
        ], 'Sem paginação a resposta cresce sem limite (custo e risco de abuso) e a entidade está sendo exposta em vez de um DTO.'),
        fill('q8', 'Complete com o código de status que representa conflito com o estado atual do recurso.', 'return StatusCode(___, "E-mail já cadastrado");', ['409'], '409 Conflict sinaliza que a requisição conflita com o estado atual, como um valor único já existente.')
      ]
    },
    {
      id: 'csi-42-design-apis-rest',
      title: 'Design de APIs REST',
      goal: 'Projetar APIs REST consistentes e seguras: recursos, idempotência, paginação, erros, concorrência, versionamento, contratos e proteção de dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Recursos, URIs e verbos',
            'Em REST a API expõe RECURSOS (pedidos, clientes), identificados por URIs, e os manipula com os verbos do HTTP. A URI nomeia a coisa com substantivos, normalmente no plural; o verbo diz a ação. Assim, /pedidos/42 é o pedido 42, e relações aparecem por hierarquia (/pedidos/42/itens). Evite verbos na URI (/criarPedido, /excluir/42). Semântica dos verbos: GET lê (seguro: não altera nada), POST cria ou dispara um processamento, PUT substitui o recurso inteiro, PATCH altera parcialmente, DELETE remove. Seguir essas convenções torna a API previsível: quem conhece HTTP adivinha como usá-la, e proxies e caches sabem o que podem repetir ou guardar.',
            'GET    /api/v1/pedidos            # lista (paginada)\nPOST   /api/v1/pedidos            # cria um pedido\nGET    /api/v1/pedidos/42         # lê o pedido 42\nPUT    /api/v1/pedidos/42         # substitui o pedido 42\nPATCH  /api/v1/pedidos/42         # altera campos do pedido 42\nDELETE /api/v1/pedidos/42         # remove o pedido 42\nGET    /api/v1/pedidos/42/itens   # itens do pedido 42\n\n# ruim: verbo na URI\nPOST   /api/v1/criarPedido'
          ),
          sl(
            'Idempotência e Idempotency-Key',
            'Uma operação é idempotente quando repeti-la deixa o sistema no mesmo estado que executá-la uma vez. GET, PUT e DELETE são idempotentes por definição; POST não é: repetir cria outro recurso. Isso importa porque redes falham: o cliente envia um pagamento, a resposta se perde, ele tenta de novo e cobra duas vezes. A solução comum é a chave de idempotência: o cliente gera um valor único por operação lógica e o envia no cabeçalho Idempotency-Key. O servidor guarda a chave com o resultado; se a MESMA chave chegar de novo, devolve a resposta já registrada em vez de repetir o efeito. Convém dar um prazo de validade às chaves e rejeitar a reutilização da chave com um corpo diferente.',
            'POST /api/v1/pagamentos\nIdempotency-Key: 7c1e9a52-0000-4000-8000-exemplo\nContent-Type: application/json\n\n{ "pedidoId": 42, "valor": 59.90 }\n\n// servidor (esboço)\nif (await store.TentarObterAsync(chave) is { } salvo) return salvo; // repetição\nvar resultado = await pagamentos.CobrarAsync(dto);\nawait store.SalvarAsync(chave, resultado);'
          ),
          sl(
            'Criação, códigos de status e ProblemDetails',
            'Ao criar um recurso, responda 201 Created com o cabeçalho Location contendo a URI do novo recurso (e, em geral, o recurso no corpo); o cliente não precisa adivinhar o endereço. Use códigos que descrevam o resultado (200, 204, 400, 401, 403, 404, 409, 422, 429) e não esconda erros atrás de 200. Para o corpo dos erros, use ProblemDetails: o formato padrão do RFC 9457, com content-type application/problem+json e campos como type, title, status, detail e instance (mais extensões, como o dicionário errors em validação). Assim todo cliente trata erros do mesmo jeito. Em visão geral: o detail deve ser útil mas nunca vazar stack trace, SQL, caminhos internos ou dados de outros usuários.',
            'HTTP/1.1 201 Created\nLocation: /api/v1/pedidos/87\n\nHTTP/1.1 404 Not Found\nContent-Type: application/problem+json\n\n{\n  "type": "https://exemplo.com/erros/pedido-nao-encontrado",\n  "title": "Pedido não encontrado",\n  "status": 404\n}\n\n// Minimal API\nreturn Results.Created($"/api/v1/pedidos/{novo.Id}", novo);\nreturn Results.Problem(statusCode: 404, title: "Pedido não encontrado");'
          ),
          sl(
            'Paginação: offset versus keyset; filtros e ordenação',
            'Toda coleção precisa de paginação com teto de tamanho. Offset (pagina/tamanho, ou OFFSET no SQL) é simples e permite pular para qualquer página, mas o banco precisa percorrer e descartar todas as linhas anteriores: a página 10.000 é lenta, e se linhas entram ou saem entre duas requisições, itens aparecem repetidos ou somem. Keyset (ou cursor) usa o ÚLTIMO item visto como ponto de partida: WHERE Id > @ultimo ORDER BY Id LIMIT n. Com índice na coluna de ordenação o banco salta direto ao ponto, o custo é constante e as páginas ficam estáveis; o preço é não pular para a página N. A resposta devolve um cursor opaco (proximo). Filtros e ordenação vão na query string com campos permitidos (allowlist): ?status=aberto&ordenar=-criadoEm; seleção de campos (?campos=id,total) reduz o tráfego. Nunca monte SQL concatenando esses parâmetros.',
            '-- offset: descarta 200000 linhas antes de devolver 20\nSELECT * FROM Pedidos ORDER BY Id OFFSET 200000 ROWS FETCH NEXT 20 ROWS ONLY;\n\n-- keyset: usa o índice a partir do último Id visto\nSELECT TOP (20) * FROM Pedidos WHERE Id > @ultimo ORDER BY Id;\n\n// resposta\n{ "dados": [ ... ], "proximo": "eyJpZCI6MjAzfQ" }'
          ),
          sl(
            'Concorrência otimista, cache condicional e rate limit',
            'Dois usuários editam o mesmo recurso: o segundo PUT sobrescreveria o primeiro sem perceber (lost update). Concorrência otimista resolve com ETag, um identificador da versão do recurso devolvido no GET. No PUT o cliente envia If-Match com esse valor; se a versão mudou, o servidor responde 412 Precondition Failed (e 428 Precondition Required se o cabeçalho for exigido e faltar). O mesmo ETag serve para cache: o cliente envia If-None-Match e, se nada mudou, recebe 304 Not Modified sem corpo. Já o rate limit protege o servidor contra abuso e excesso: ao passar do limite responda 429 Too Many Requests com o cabeçalho Retry-After (segundos de espera). No ASP.NET Core existe o middleware de rate limiting (AddRateLimiter, UseRateLimiter).',
            'GET /api/v1/itens/2\n-> 200  ETag: "1"\n\nPUT /api/v1/itens/2\nIf-Match: "1"\n-> 204 No Content (versão ainda era a 1)\n\nPUT /api/v1/itens/2\nIf-Match: "1"        # agora a versão é outra\n-> 412 Precondition Failed\n\nHTTP/1.1 429 Too Many Requests\nRetry-After: 30'
          ),
          sl(
            'Versionamento, contratos e evolução da API',
            'Clientes antigos continuam funcionando enquanto a API evolui: mudanças compatíveis (campo novo opcional, endpoint novo, parâmetro opcional) não quebram ninguém; mudanças incompatíveis (remover ou renomear campo, mudar tipo ou significado, tornar obrigatório algo opcional) exigem uma NOVA versão. A versão pode ir na URL (/api/v1/...), em cabeçalho (por exemplo, um X-Api-Version definido por você) ou na query (?api-version=1); URL é a mais simples de ver e de cachear. No ASP.NET Core o pacote Asp.Versioning ajuda a declarar e rotear versões. A versão antiga é depreciada com aviso e prazo (cabeçalhos como Sunset, documentação, e-mail aos integradores) antes de ser desligada. O contrato é descrito em OpenAPI, e dele se geram a documentação, os testes de contrato e clientes tipados (NSwag, OpenAPI Generator). HATEOAS, em visão geral, é incluir links de ações possíveis na resposta (self, cancelar); é elegante, mas pouco usado na prática.',
            '// compatível: adicionar campo opcional\n{ "id": 42, "total": 59.9, "moeda": "BRL" }   // "moeda" é novo\n\n// QUEBRA clientes: renomear/remover campo\n{ "id": 42, "valorTotal": 59.9 }                // "total" sumiu\n\n// HATEOAS (visão geral)\n{ "id": 42, "links": [ { "rel": "cancelar", "href": "/api/v1/pedidos/42/cancelamento" } ] }'
          ),
          sl(
            'Segurança e privacidade no desenho da API',
            'Autorização por recurso: autenticar não basta. Toda operação em /pedidos/42 deve verificar se o usuário autenticado pode acessar AQUELE pedido (dono, papel ou política); sem isso, qualquer um troca o número na URL e lê o de outra pessoa: IDOR. Prefira identificadores opacos e não sequenciais (GUID/ULID) para dificultar a enumeração, mas saiba que isso NÃO substitui a verificação de permissão. Privacidade (LGPD): URLs vão parar em logs de servidor, de proxy, no histórico do navegador e em cabeçalhos Referer. Por isso nunca coloque dado pessoal (CPF, e-mail, telefone) na rota ou na query string: use um id opaco, ou envie o dado no corpo (POST de busca) sobre HTTPS. Também não registre corpos com dados pessoais nos logs. Valide tamanhos, tipos e faixas de todos os parâmetros e devolva 404 quando a existência do recurso não deve ser revelada.',
            '// VULNERÁVEL (IDOR): qualquer usuário logado lê qualquer pedido\nvar p = await db.Pedidos.FindAsync(id);\n\n// CORRETO: restringe ao dono\nvar p2 = await db.Pedidos.FirstOrDefaultAsync(x => x.Id == id && x.ClienteId == usuarioId);\n\n// RUIM: dado pessoal na URL (vai para logs e histórico)\nGET /api/v1/clientes?cpf=000.000.000-00\n// MELHOR: id opaco\nGET /api/v1/clientes/9f1c2a7e-0000-4000-8000-exemplo'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual das requisições segue melhor o desenho REST para criar um pedido?', 'b', [
          'POST /api/criarPedido, com a ação escrita na URI',
          'POST /api/pedidos, com os dados do pedido no corpo',
          'GET /api/pedidos/criar?cliente=7, passando tudo na URL',
          'PUT /api/getPedidos, enviando o corpo do novo pedido'
        ], 'URIs nomeiam recursos com substantivos e o verbo indica a ação: POST na coleção /pedidos cria um novo item. GET não deve alterar estado.'),
        mcq('q2', 'O cliente repete um POST /pagamentos por causa de timeout e o servidor poderia cobrar duas vezes. Qual solução padrão evita isso?', 'd', [
          'Trocar o POST por um GET, que é idempotente e seguro, e repetir à vontade',
          'Aumentar o timeout do cliente para nunca precisar repetir a requisição enviada',
          'Devolver sempre 200 OK, mesmo quando houver falha interna',
          'Enviar Idempotency-Key único e devolver o resultado salvo na repetição'
        ], 'Com a chave de idempotência, a repetição da mesma operação lógica devolve o resultado já registrado, sem repetir o efeito.'),
        mcq('q3', 'Qual mudança numa resposta JSON QUEBRA os clientes que já existem, exigindo uma nova versão da API?', 'a', [
          'Renomear o campo total para valorTotal',
          'Adicionar um campo novo e opcional chamado moeda',
          'Acrescentar um endpoint novo para listar devoluções',
          'Aceitar um parâmetro de query opcional chamado ordenar'
        ], 'Quem lê total deixa de encontrá-lo. Acrescentar campos, endpoints ou parâmetros opcionais é compatível com os clientes antigos.'),
        fill('q4', 'Qual cabeçalho informa ao cliente quantos segundos esperar depois de um 429?', 'HTTP/1.1 429 Too Many Requests\n___: 30', ['Retry-After'], 'Retry-After indica o tempo de espera antes de nova tentativa; a resposta 429 sinaliza que o limite de requisições foi excedido.'),
        mcq('q5', 'Por que a paginação por keyset (WHERE Id > @ultimo ORDER BY Id) escala melhor que OFFSET com valores grandes?', 'c', [
          'Porque guarda a tabela inteira em memória entre as requisições',
          'Porque permite pular direto para qualquer número de página',
          'Porque o índice leva ao ponto certo sem descartar as linhas anteriores',
          'Porque dispensa a cláusula ORDER BY e deixa a ordem aleatória'
        ], 'Keyset parte do último item visto, usando o índice; OFFSET precisa percorrer e descartar tudo o que veio antes. Pular para a página N é vantagem do offset.'),
        mcq('q6', 'O cliente envia PUT /itens/2 com If-Match: "1", mas a versão atual do recurso já é outra. Qual resposta é a esperada?', 'b', [
          '304 Not Modified, sem corpo na resposta',
          '412 Precondition Failed, sem aplicar a alteração',
          '404 Not Found, como se o item não existisse',
          '204 No Content, aplicando a alteração mesmo assim'
        ], 'If-Match com ETag desatualizado falha a pré-condição: 412. É assim que a concorrência otimista evita o lost update.'),
        mcq('q7', 'O que há de errado em GET /api/v1/clientes?cpf=000.000.000-00?', 'd', [
          'O verbo GET não pode receber parâmetros de consulta, apenas corpo',
          'A URI está no singular, e o HTTP exige o plural nas coleções',
          'Falta a versão da API dentro do cabeçalho Accept',
          'O CPF vai parar em logs e no histórico; use um id opaco'
        ], 'URLs são amplamente registradas. Dados pessoais como CPF não devem aparecer em rota ou query string (LGPD: minimização e segurança).'),
        fill('q8', 'Complete o cabeçalho de uma resposta 201 Created que aponta para o recurso criado.', 'HTTP/1.1 201 Created\n___: /api/v1/pedidos/87', ['Location'], 'O cabeçalho Location traz a URI do recurso recém-criado, para o cliente não precisar adivinhá-la.')
      ]
    },
    {
      id: 'csi-40-aspnet-mvc-razor-views',
      title: 'ASP.NET Core MVC: controllers e views Razor',
      goal: 'Construir aplicações renderizadas no servidor com MVC: pastas, sintaxe Razor, codificação contra XSS, tag helpers, ViewModels, rotas, filtros, erros e arquivos estáticos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Renderização no servidor e o padrão MVC',
            'Numa API o servidor devolve dados (JSON) e outro programa (uma SPA, um app) desenha a tela. Numa aplicação renderizada no servidor, o próprio ASP.NET Core monta o HTML e o navegador só exibe: bom para sites de conteúdo, painéis internos e SEO, e com pouco JavaScript. O padrão MVC separa responsabilidades. Model: os dados e as regras. View: o HTML gerado, escrito em Razor (.cshtml). Controller: recebe a requisição, usa o modelo e escolhe qual view renderizar e com quais dados. No Program, AddControllersWithViews registra o suporte e MapControllerRoute define a rota padrão.',
            'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddControllersWithViews();\nvar app = builder.Build();\napp.UseStaticFiles();   // os templates novos usam app.MapStaticAssets()\napp.UseRouting();\napp.UseAuthorization();\napp.MapControllerRoute(\n    name: "default",\n    pattern: "{controller=Home}/{action=Index}/{id?}");\napp.Run();'
          ),
          sl(
            'Convenção de pastas e arquivos especiais',
            'O MVC encontra as views por convenção. Para a ação Index de HomeController, return View() procura Views/Home/Index.cshtml e, se não achar, Views/Shared/Index.cshtml. A pasta Shared guarda o que é comum: _Layout.cshtml (a moldura da página: cabeçalho, menu, rodapé; o conteúdo da view entra em @RenderBody(), e seções opcionais em @RenderSection) e partials. Dois arquivos rodam automaticamente: _ViewStart.cshtml executa antes de cada view (típico: Layout = "_Layout";) e _ViewImports.cshtml traz @using e @addTagHelper comuns a todas as views, sem repetir. Arquivos estáticos (CSS, JS, imagens) ficam em wwwroot, servido por URL a partir da raiz do site.',
            'Views/\n  Home/\n    Index.cshtml\n    Privacy.cshtml\n  Produtos/\n    Index.cshtml        <- ProdutosController.Index()\n  Shared/\n    _Layout.cshtml      <- moldura com @RenderBody()\n    _Card.cshtml        <- partial\n  _ViewImports.cshtml   <- @using, @addTagHelper\n  _ViewStart.cshtml     <- Layout = "_Layout";\nwwwroot/\n  css/site.css  js/site.js'
          ),
          sl(
            'Sintaxe Razor',
            'Razor mistura HTML e C#. O @ muda para C#. Expressão implícita: @Model.Nome ou @nome.Length (termina no primeiro caractere que não faz parte do acesso, como um espaço). Expressão explícita, entre parênteses, quando há operadores: @(preco * 2). Blocos: @{ ... } executa código; @if, @foreach e @switch controlam o HTML; dentro deles, tags HTML voltam ao modo de marcação. @model declara o tipo do modelo da view (em minúscula) e Model (maiúscula) é o objeto. Para escrever um @ literal, dobre-o: @@. Comentários: @* ... *@. E-mails como ana@exemplo.com são reconhecidos e não tratados como código.',
            '@model ProdutoListaViewModel\n@{\n    var qtd = 3;\n    var nome = "Ana";\n}\n<p>@(qtd * 2) / @qtd * 2 / @nome.Length</p>   <!-- 6 / 3 * 2 / 3 -->\n<p>Contato: suporte@@exemplo.com.br</p>        <!-- suporte@exemplo.com.br -->\n@if (Model.Itens.Count == 0)\n{\n    <p>Nenhum produto.</p>\n}\n@foreach (var p in Model.Itens)\n{\n    <li>@p.Nome - @p.Preco</li>\n}\n@* comentário que não vai ao HTML *@'
          ),
          sl(
            'Codificação automática, XSS e Html.Raw',
            'Tudo o que você escreve com @ é CODIFICADO para HTML: os caracteres < > & e aspas viram entidades, então um texto digitado por um usuário aparece como texto e não como tag. Isso é a defesa padrão contra XSS (cross-site scripting: script injetado numa página vista por outras pessoas). @Html.Raw(valor) DESLIGA a codificação e escreve o HTML como está: é um risco se o valor vem de usuário, banco ou API externa. Use só com conteúdo que você mesmo controla; se precisar aceitar HTML do usuário, passe por um sanitizador com lista de tags permitidas. Cuidado também ao montar HTML ou JavaScript concatenando strings em C#: você perde a codificação.',
            '// Model.Comentario = "<script>alert(1)</script>"\n\n<p>@Model.Comentario</p>\n<!-- saída: &lt;script&gt;alert(1)&lt;/script&gt;  -> aparece como texto, seguro -->\n\n<p>@Html.Raw(Model.Comentario)</p>\n<!-- saída: <script>alert(1)</script>  -> EXECUTA no navegador de quem vê: XSS -->'
          ),
          sl(
            'Tag helpers, partials e view components',
            'Tag helpers são atributos asp-* que o servidor transforma em HTML: asp-controller, asp-action e asp-route-id geram a URL correta a partir das rotas (se a rota mudar, os links acompanham); asp-for liga um campo ao modelo (gera name, id e valor) e em formulários o tag helper de form inclui o token antiforgery. Eles são ativados por @addTagHelper no _ViewImports. Partial view é um pedaço reutilizável de view, sem lógica própria, renderizado com a tag partial ou @await Html.PartialAsync. View component é um partial com lógica: uma classe com InvokeAsync que busca seus próprios dados (carrinho no cabeçalho, menu), chamada com @await Component.InvokeAsync("Carrinho"). Os dois evitam duplicar HTML entre páginas.',
            '<a asp-controller="Produtos" asp-action="Detalhes" asp-route-id="@p.Id">Ver</a>\n<!-- /Produtos/Detalhes/5  (ou a URL da rota por atributo) -->\n\n<partial name="_Card" model="p" />\n\n@await Component.InvokeAsync("Carrinho", new { max = 3 })\n\npublic class CarrinhoViewComponent : ViewComponent\n{\n    public async Task<IViewComponentResult> InvokeAsync(int max) { /* busca dados */ return View(); }\n}'
          ),
          sl(
            'ViewModels, TempData, rotas e filtros',
            'ViewModel é uma classe criada para UMA view, com só os campos de que ela precisa. Não passe entidades do banco para a view (nem receba entidades do formulário): você vazaria campos internos (hash de senha, flags administrativas), acoplaria a tela ao esquema do banco e abriria o over-posting. TempData guarda um valor até a PRÓXIMA requisição: serve para mensagens após um redirecionamento (POST, mensagem, Redirect, GET que exibe); ViewData e ViewBag se perdem num redirecionamento. Rotas: a convencional (MapControllerRoute com o padrão {controller}/{action}/{id?}) vale para todos os controllers; a por atributo ([Route("loja/produtos")], [HttpGet("{id:int}")]) declara a URL na própria ação, a escolha comum em sistemas com URLs mais elaboradas. Filtros rodam antes ou depois das ações (ex.: [Authorize], [ResponseCache], IActionFilter): comportamento transversal sem repetir código.',
            '[Route("loja/produtos")]\npublic class ProdutosController : Controller\n{\n    [HttpGet("")]                       // GET /loja/produtos\n    public IActionResult Index() => View(new ProdutoListaViewModel());\n\n    [HttpPost("remover/{id:int}")]      // POST /loja/produtos/remover/7\n    [ValidateAntiForgeryToken]\n    public IActionResult Remover(int id)\n    {\n        TempData["Aviso"] = "Produto removido.";\n        return RedirectToAction(nameof(Index));\n    }\n}'
          ),
          sl(
            'Páginas de erro e arquivos estáticos',
            'Em produção nunca mostre a página de exceção detalhada (ela expõe código, caminhos e variáveis). Use app.UseExceptionHandler("/Home/Error") para uma página amigável e genérica e app.UseStatusCodePagesWithReExecute para 404 e afins; detalhes ficam só nos logs. O template já faz isso fora do ambiente Development. Arquivos estáticos só são servidos de wwwroot (nada fora dele fica acessível por engano). Para cache sem versões antigas presas no navegador, o atributo asp-append-version="true" nas tags link e script acrescenta ?v=<hash do conteúdo> à URL: quando o arquivo muda, a URL muda e o navegador baixa de novo; enquanto não muda, ele reaproveita o cache. Isso se chama cache busting.',
            'if (!app.Environment.IsDevelopment())\n{\n    app.UseExceptionHandler("/Home/Error");\n    app.UseHsts();\n}\napp.UseStatusCodePagesWithReExecute("/erro/{0}");\n\n<link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />\n<!-- gera: /css/site.css?v=Kx3...hash... -->'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em ProdutosController, a ação Detalhes termina com return View(); sem argumentos. Qual arquivo o MVC procura primeiro?', 'c', [
          'Views/Detalhes/Produtos.cshtml, com a ordem trocada',
          'wwwroot/Produtos/Detalhes.cshtml, na pasta de estáticos',
          'Views/Produtos/Detalhes.cshtml, e depois Views/Shared/Detalhes.cshtml',
          'Controllers/Produtos/Detalhes.cshtml, ao lado do controller'
        ], 'Por convenção: Views/{Controller}/{Action}.cshtml; se não existir, tenta Views/Shared/{Action}.cshtml.'),
        mcq('q2', 'Com a rota {controller=Home}/{action=Index}/{id?}, qual ação trata a URL /produtos/detalhes/5?', 'a', [
          'ProdutosController.Detalhes, recebendo id igual a 5',
          'HomeController.Index, ignorando produtos e detalhes e recebendo id igual a 5',
          'ProdutosController.Index, ignorando o restante',
          'Nenhuma, pois id? exige que o valor seja informado'
        ], 'Segmentos mapeiam controller=produtos, action=detalhes e id=5. O ? em id? o torna opcional; Home e Index são só valores padrão.'),
        mcq('q3', 'Qual é a saída do trecho Razor?\n@{ var qtd = 3; }\n<p>@(qtd * 2) / @qtd * 2</p>', 'd', [
          '6 / 6',
          '3 / 3 * 2',
          'Erro de compilação por causa do segundo @',
          '6 / 3 * 2'
        ], 'Entre parênteses a expressão é avaliada (6). Na forma implícita, @qtd termina no espaço: o restante, * 2, é texto literal.'),
        fill('q4', 'Complete o tag helper que escolhe a ação de destino do link.', '<a asp-___="Detalhes" asp-controller="Produtos" asp-route-id="5">Ver</a>', ['action'], 'asp-action e asp-controller geram a URL a partir das rotas; asp-route-id preenche o parâmetro id.'),
        mcq('q5', 'Qual é o risco do trecho?\n<p>@Html.Raw(Model.Comentario)</p>\n// Comentario foi digitado por um visitante do site', 'b', [
          'Nenhum, pois Razor sempre codifica o resultado de qualquer expressão, até de Html.Raw',
          'XSS: o HTML do visitante é escrito sem codificação e pode executar scripts',
          'A view deixa de compilar, pois Raw só aceita valores numéricos',
          'O comentário é gravado sem criptografia no banco de dados'
        ], 'Html.Raw desliga a codificação automática. Texto de usuário deve sair com @Model.Comentario, que converte < e > em entidades.'),
        mcq('q6', 'Por que é mais seguro passar um ViewModel à view do que a entidade do banco?', 'c', [
          'Porque entidades não podem ser usadas como modelo dentro de arquivos .cshtml do ASP.NET Core',
          'Porque o ViewModel é sempre mais rápido de carregar do banco',
          'Porque expõe só os campos necessários e não vaza nem aceita campos internos',
          'Porque o ViewModel dispensa a validação dos dados do formulário'
        ], 'ViewModels definem exatamente o que a tela mostra ou recebe, evitando vazar dados internos e o over-posting.'),
        mcq('q7', 'Após um POST bem-sucedido o controller faz RedirectToAction. Como exibir um aviso na página seguinte?', 'd', [
          'Em ViewBag.Aviso, que acompanha o redirecionamento automaticamente',
          'Em ViewData["Aviso"], que dura até o fim da sessão do usuário',
          'Numa variável estática do controller, que todos os usuários leem',
          'Em TempData["Aviso"], que sobrevive até a próxima requisição'
        ], 'TempData persiste para a próxima requisição. ViewBag e ViewData duram só a requisição atual, e variável estática é compartilhada entre usuários (bug e vazamento).'),
        fill('q8', 'Complete o atributo que acrescenta um hash de conteúdo à URL do CSS (cache busting).', '<link rel="stylesheet" href="~/css/site.css" asp-___-version="true" />', ['append'], 'asp-append-version="true" gera ?v=<hash>: a URL muda quando o arquivo muda, forçando o navegador a baixar de novo.')
      ]
    },
    {
      id: 'csi-41-razor-pages-formularios',
      title: 'Razor Pages e formulários',
      goal: 'Construir páginas com Razor Pages e formulários seguros: binding, validação no servidor, Post-Redirect-Get, antiforgery, over-posting, autorização e coleta mínima de dados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Razor Pages: página com seu PageModel',
            'Razor Pages organiza a aplicação por PÁGINA, não por controller. Cada página é um par: o arquivo .cshtml (a marcação) e uma classe PageModel (a lógica, em .cshtml.cs). A diretiva @page no topo transforma o .cshtml numa página que responde a requisições, e a URL vem do caminho do arquivo dentro da pasta Pages (Pages/Contato/Novo.cshtml vira /Contato/Novo). A classe tem handlers nomeados por verbo: OnGet, OnPost (e as versões assíncronas OnGetAsync, OnPostAsync). Registre com AddRazorPages e MapRazorPages. Quando preferir Razor Pages a MVC: telas centradas em formulários e em CRUD, em que marcação e lógica da mesma tela ficam juntas e o código fica mais coeso. MVC se destaca em rotas e fluxos complexos e quando um mesmo controller serve várias views (ou JSON). Os dois convivem no mesmo projeto e compartilham Razor, tag helpers, validação e antiforgery.',
            '@page\n@model rp.Pages.Contato.NovoModel\n<h1>Fale conosco</h1>\n\n// Pages/Contato/Novo.cshtml.cs\npublic class NovoModel : PageModel\n{\n    public void OnGet() { }                    // GET  /Contato/Novo\n    public IActionResult OnPost() { /* ... */ } // POST /Contato/Novo\n}\n\n// Program.cs\nbuilder.Services.AddRazorPages();\napp.MapRazorPages();'
          ),
          sl(
            'Binding com [BindProperty] e paginação',
            'Para receber os dados do formulário, marque propriedades do PageModel com [BindProperty]: no POST, o framework as preenche com os valores enviados. Por padrão o binding só vale para POST; para GET (como um número de página na query string) use [BindProperty(SupportsGet = true)]. Boa prática: agrupe os campos numa classe interna de entrada (InputModel) em vez de ligar uma entidade. Em listagens, receba a página como propriedade, imponha limites (nunca confie no tamanho vindo do cliente) e consulte com Skip e Take; mostre links Anterior e Próxima pelo asp-route-Pagina. Um mesmo formulário pode ter vários botões: handlers nomeados (OnPostExcluir) são escolhidos com asp-page-handler.',
            'public class ListaModel : PageModel\n{\n    [BindProperty(SupportsGet = true)]\n    public int Pagina { get; set; } = 1;\n\n    public List<string> Itens { get; private set; } = new();\n\n    public void OnGet()\n    {\n        Pagina = Math.Max(Pagina, 1);\n        const int tamanho = 20;\n        // Itens = consulta.Skip((Pagina - 1) * tamanho).Take(tamanho).ToList();\n    }\n}\n\n<a asp-page="Lista" asp-route-Pagina="@(Model.Pagina + 1)">Próxima</a>'
          ),
          sl(
            'Validação: DataAnnotations e tag helpers',
            'Declare as regras na classe com DataAnnotations: [Required], [StringLength], [Range], [EmailAddress], [RegularExpression]. Quando o POST chega, o framework valida e registra os erros em ModelState; o handler consulta ModelState.IsValid e, se inválido, devolve a MESMA página com Page(), que reexibe os dados digitados e as mensagens. Na marcação, asp-validation-for mostra o erro de um campo e asp-validation-summary os erros gerais. A validação no cliente (JavaScript, via a partial _ValidationScriptsPartial) é só conveniência de usabilidade: dá resposta imediata, mas pode ser desligada ou contornada por quem monta a requisição à mão. A validação no SERVIDOR é a que vale e é sempre obrigatória.',
            'public class InputModel\n{\n    [Required(ErrorMessage = "Informe o nome.")]\n    [StringLength(80, MinimumLength = 2)]\n    public string Nome { get; set; } = "";\n\n    [Required, EmailAddress]\n    public string Email { get; set; } = "";\n}\n\n<input asp-for="Input.Nome" />\n<span asp-validation-for="Input.Nome"></span>\n<div asp-validation-summary="ModelOnly"></div>'
          ),
          sl(
            'Post-Redirect-Get e mensagens sem vazar detalhes',
            'Se o POST válido terminar devolvendo a página, o F5 do navegador reenvia o formulário e duplica a operação. O padrão Post-Redirect-Get evita isso: o handler processa o POST, responde com um REDIRECT (RedirectToPage) e o navegador faz um GET na página seguinte; recarregar só repete o GET. Para uma mensagem de sucesso depois do redirect, use TempData (ou [TempData] numa propriedade). Mensagens de erro ao usuário devem ser úteis, mas genéricas: num login diga "Usuário ou senha inválidos" (sem revelar qual dos dois falhou) e nunca mostre exceções, SQL ou caminhos; ModelState.AddModelError(string.Empty, "...") adiciona um erro geral ao resumo. Os detalhes técnicos vão para os logs, sem dados pessoais.',
            'public IActionResult OnPost()\n{\n    if (!ModelState.IsValid) return Page();          // reexibe com erros\n\n    if (!servico.Autenticar(Input.Email, Input.Senha))\n    {\n        ModelState.AddModelError(string.Empty, "Usuário ou senha inválidos.");\n        return Page();\n    }\n\n    Mensagem = "Bem-vindo!";                         // [TempData]\n    return RedirectToPage("Painel");                 // Post-Redirect-Get\n}'
          ),
          sl(
            'Antiforgery: proteção contra CSRF',
            'CSRF ocorre quando um site malicioso faz o navegador de uma pessoa logada enviar um POST para o seu site, e o navegador anexa o cookie de sessão sozinho. A defesa é o token antiforgery: um valor secreto que só as suas páginas conhecem. O tag helper de form, em um formulário com method="post", acrescenta automaticamente um campo oculto __RequestVerificationToken (e um cookie correspondente), e o servidor recusa o POST sem token válido, respondendo 400. Em Razor Pages essa validação é automática em todos os handlers que alteram dados. Em MVC você aplica [ValidateAntiForgeryToken] na ação, ou, melhor, o filtro global [AutoValidateAntiforgeryToken], que valida todo método que não seja GET, HEAD, OPTIONS ou TRACE. Cookies SameSite ajudam, mas não substituem o token.',
            '<form method="post">          <!-- tag helper acrescenta o token -->\n    <!-- <input name="__RequestVerificationToken" type="hidden" value="..."> -->\n    ...\n</form>\n\n// MVC: por ação\n[HttpPost]\n[ValidateAntiForgeryToken]\npublic IActionResult Excluir(int id) { ... }\n\n// MVC: global\nbuilder.Services.AddControllersWithViews(o =>\n    o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));'
          ),
          sl(
            'Over-posting (mass assignment)',
            'O binder preenche QUALQUER propriedade cujo nome chegue no formulário, mesmo que a sua tela não tenha um campo para ela. Se você liga diretamente uma entidade com Nome e EhAdmin, um atacante apenas acrescenta EhAdmin=true à requisição e se promove: isso é over-posting. Defesas: (1) a melhor, usar um ViewModel/InputModel só com os campos editáveis e copiar para a entidade manualmente; (2) restringir com [Bind("Nome,Email")] na ação ou no parâmetro; (3) TryUpdateModelAsync com uma lista explícita de propriedades permitidas; (4) marcar propriedades sensíveis com [BindNever]. Nunca confie em "o campo não está no HTML": o cliente controla a requisição.',
            '// VULNERÁVEL: liga a entidade inteira\n[BindProperty] public Usuario Usuario { get; set; }   // Usuario tem EhAdmin\n// POST: Usuario.Nome=Ana&Usuario.EhAdmin=true  -> promove a admin\n\n// CORRETO: InputModel só com o que a tela edita\npublic class PerfilInput { [Required] public string Nome { get; set; } = ""; }\n[BindProperty] public PerfilInput Input { get; set; } = new();\n// no handler: usuario.Nome = Input.Nome;\n\n// alternativa: lista explícita\nawait TryUpdateModelAsync(usuario, "Input", u => u.Nome);'
          ),
          sl(
            'Autenticação, upload e LGPD em formulários',
            'Para exigir login numa página, use [Authorize] no PageModel; para áreas inteiras, convenções no AddRazorPages: AuthorizeFolder("/Admin"), AuthorizePage("/Painel") e AllowAnonymousToPage("/Admin/Login") para abrir exceções. Autorize também por recurso: confira que o usuário pode editar AQUELE registro (dono ou papel), não só que está logado. Upload de arquivos chega por IFormFile (formulário com enctype="multipart/form-data"); aqui só o citamos: valide tamanho, extensão e conteúdo e nunca confie no nome enviado, tema que aprofundamos em outra lição. LGPD em formulários: colete apenas os campos NECESSÁRIOS à finalidade (princípio da minimização) e informe, junto ao formulário, para que o dado será usado, por quanto tempo e como pedir exclusão. Se o cadastro precisa só de e-mail, não peça CPF nem data de nascimento "para o caso de precisar".',
            '[Authorize]\npublic class PerfilModel : PageModel { /* ... */ }\n\nbuilder.Services.AddRazorPages(o =>\n{\n    o.Conventions.AuthorizeFolder("/Admin");\n    o.Conventions.AllowAnonymousToPage("/Admin/Login");\n});\n\n<form method="post">\n    <input asp-for="Input.Email" />\n    <small>Usaremos seu e-mail apenas para enviar o boletim. Você pode sair a qualquer momento.</small>\n</form>'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que a diretiva @page, no topo de um .cshtml, faz?', 'a', [
          'Transforma o arquivo numa página que responde a requisições, com URL vinda do caminho',
          'Declara a view como partial, para ser embutida dentro de outras páginas e reaproveitada pelo layout',
          'Ativa a paginação automática dos itens exibidos na própria tela',
          'Marca a página como protegida, exigindo login para qualquer acesso'
        ], '@page é o que faz do .cshtml uma Razor Page endereçável: Pages/Contato/Novo.cshtml responde em /Contato/Novo, com a lógica no PageModel.'),
        mcq('q2', 'Um formulário de newsletter pede nome, e-mail, CPF e data de nascimento, mas só envia e-mails. Qual prática está alinhada à LGPD?', 'd', [
          'Manter os campos, pois dados a mais podem ser úteis no futuro',
          'Manter os campos e guardar o CPF criptografado, sem mais explicações',
          'Tornar CPF e nascimento opcionais, sem informar para que servem',
          'Coletar só o necessário (o e-mail) e informar a finalidade do uso'
        ], 'Minimização e finalidade: colete só o indispensável e diga ao titular para que o dado será usado. Criptografar não torna legítima uma coleta desnecessária.'),
        mcq('q3', 'No handler abaixo, o que acontece se o Nome obrigatório vier vazio?\npublic IActionResult OnPost()\n{\n    if (!ModelState.IsValid) return Page();\n    return RedirectToPage("Obrigado");\n}', 'c', [
          'Redireciona para Obrigado, e o erro de validação é ignorado pelo framework',
          'Lança uma exceção que derruba a aplicação inteira no servidor',
          'Reexibe a mesma página com os dados digitados e as mensagens de erro',
          'Responde 404 Not Found, porque o campo obrigatório não existe'
        ], 'Com ModelState inválido, Page() renderiza a página de novo (com os valores e os erros). O redirect só ocorre quando tudo é válido.'),
        fill('q4', 'Complete o retorno do padrão Post-Redirect-Get depois de um POST válido.', 'return ___ToPage("Obrigado");', ['Redirect'], 'RedirectToPage responde com um redirect; o navegador faz GET, e o F5 não reenvia o formulário.'),
        mcq('q5', 'Um POST de formulário Razor Pages chega sem o token antiforgery. Qual é a resposta esperada?', 'b', [
          '200 OK, pois o cookie de sessão basta para autorizar',
          '400 Bad Request, pois a validação antiforgery recusa o POST',
          '302 Found, redirecionando o usuário para a página inicial',
          '404 Not Found, como se a página nem existisse'
        ], 'Razor Pages valida antiforgery nos handlers que alteram dados; sem token válido a requisição é recusada com 400.'),
        mcq('q6', 'Qual vulnerabilidade existe?\n[BindProperty] public Usuario Usuario { get; set; }\n// Usuario tem Nome e EhAdmin; a tela só tem o campo Nome', 'd', [
          'Nenhuma, pois o binder só preenche campos existentes no HTML',
          'XSS, porque o Nome é exibido na página de resposta sem nenhuma codificação',
          'CSRF, porque a página não usa o método GET para gravar',
          'Over-posting: o cliente envia EhAdmin=true e o binder preenche'
        ], 'O binder preenche qualquer propriedade enviada. Use um InputModel só com o editável, [Bind] com lista ou TryUpdateModelAsync com propriedades permitidas.'),
        mcq('q7', 'Por que a validação no servidor continua obrigatória, mesmo com a validação no cliente (JavaScript)?', 'a', [
          'Porque o cliente pode desligar o script ou enviar a requisição à mão',
          'Porque o JavaScript do navegador não consegue validar e-mails nem outros formatos',
          'Porque a validação no cliente deixa o formulário muito lento',
          'Porque o servidor valida mais campos do que o navegador consegue'
        ], 'A validação no cliente é conveniência de usabilidade. Quem controla a requisição pode contorná-la; só a checagem no servidor protege os dados.'),
        fill('q8', 'Complete o atributo que exige usuário autenticado para acessar a página.', '[___]\npublic class PerfilModel : PageModel', ['Authorize'], '[Authorize] exige autenticação. Para áreas inteiras, use convenções como AuthorizeFolder; e confira também a posse do recurso.')
      ]
    },
    {
      id: 'csi-43-spa-front-end-integracao',
      title: 'Integração com front-end SPA (React/Angular)',
      goal: 'Integrar uma API .NET com uma SPA: hospedagem, CORS, autenticação segura, CSRF, contratos tipados, erros, segredos, cabeçalhos de segurança e cache.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Hospedagem: junto ou separado',
            'Uma SPA (single-page application, feita com React, Angular ou outro) é um conjunto de arquivos estáticos (HTML, JS, CSS) que roda no navegador e conversa com a API por HTTP. Duas formas de entregá-la. (1) Hospedada no próprio ASP.NET Core: a pasta de build vai para wwwroot, e UseDefaultFiles + UseStaticFiles servem os arquivos. Como as rotas da SPA (/pedidos/42) não existem como arquivos, MapFallbackToFile("index.html") devolve o index.html a qualquer URL não reconhecida, e o roteador do front assume. Mesma origem: sem CORS e com cookies simples. (2) Separada: a SPA fica numa CDN ou outro servidor, e a API noutro endereço (outra ORIGEM): exige CORS, mas permite implantar e escalar cada parte sozinha. Em desenvolvimento, o servidor do front (Vite, Angular CLI) roda em outra porta e costuma usar um proxy, configurado nele, que repassa /api para o back-end: o navegador enxerga uma só origem e nem precisa de CORS no desenvolvimento.',
            'var app = builder.Build();\napp.UseDefaultFiles();\napp.UseStaticFiles();\napp.MapControllers();                 // rotas /api/...\napp.MapFallbackToFile("index.html");  // /pedidos/42 -> index.html (SPA)\napp.Run();\n\n// vite.config.js (desenvolvimento)\n// server: { proxy: { "/api": "http://localhost:5080" } }'
          ),
          sl(
            'CORS: origens explícitas e preflight',
            'Origem = esquema + host + porta. Por padrão o navegador impede que uma página de uma origem LEIA respostas de outra (política de mesma origem). CORS é o mecanismo pelo qual a API diz, por cabeçalhos (Access-Control-Allow-Origin e afins), quais origens podem. Para chamadas "não simples" (PUT, DELETE, JSON com cabeçalho personalizado ou Authorization), o navegador manda antes uma requisição OPTIONS, o preflight, perguntando se a chamada real é permitida; só então envia a verdadeira. No ASP.NET Core: AddCors com uma política e UseCors. Liste origens EXPLÍCITAS com WithOrigins. AllowAnyOrigin é aceitável só para APIs públicas sem credenciais, e combiná-lo com AllowCredentials é recusado pelo ASP.NET Core (exceção ao montar a política), pela regra do protocolo. Lembre: CORS é imposto pelo NAVEGADOR para proteger o usuário; não é autenticação nem protege a API de curl, scripts ou outros servidores.',
            'builder.Services.AddCors(o => o.AddPolicy("spa", p => p\n    .WithOrigins("https://app.exemplo.com")   // origens explícitas\n    .WithMethods("GET", "POST", "PUT", "DELETE")\n    .WithHeaders("Content-Type", "X-CSRF")\n    .AllowCredentials()));\n\napp.UseCors("spa");   // antes da autorização e dos endpoints\n\n// ERRADO: AllowAnyOrigin() + AllowCredentials() -> exceção'
          ),
          sl(
            'Autenticação: cookies com BFF ou tokens no navegador',
            'Há dois modelos. (1) Cookie de sessão: o servidor autentica e emite um cookie com HttpOnly (o JavaScript NÃO consegue ler, então um XSS não o rouba), Secure (só trafega por HTTPS) e SameSite (limita o envio em requisições entre sites). Com um BFF (Backend For Frontend, um servidor seu que fica entre a SPA e as APIs, guarda os tokens do lado do servidor e entrega à SPA apenas o cookie), o navegador nunca vê um token de acesso. (2) Token (JWT, OAuth) guardado e enviado pela própria SPA no cabeçalho Authorization: simples para APIs de terceiros, mas o token fica ao alcance do JavaScript; em localStorage ou sessionStorage, um único XSS o rouba e o atacante o usa de qualquer lugar. Nenhum modelo dispensa defender-se de XSS, mas o cookie HttpOnly limita o estrago. Para uma SPA própria, cookie + BFF é, em geral, a opção mais segura.',
            'builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)\n    .AddCookie(o =>\n    {\n        o.Cookie.HttpOnly = true;                          // JS não lê\n        o.Cookie.SecurePolicy = CookieSecurePolicy.Always; // só HTTPS\n        o.Cookie.SameSite = SameSiteMode.Lax;              // limita envio cross-site\n    });\n\n// evitar: localStorage.setItem("token", jwt);  // legível por qualquer script (XSS)'
          ),
          sl(
            'CSRF em APIs que usam cookie',
            'Quando a autenticação é por cookie, o navegador o anexa automaticamente a toda requisição para o seu domínio, inclusive às disparadas por um site malicioso: isso é CSRF. APIs com token no cabeçalho Authorization não sofrem esse ataque clássico (o navegador não anexa o cabeçalho sozinho). Defesas para o cookie: SameSite=Lax (ou Strict) já bloqueia o envio do cookie em POST entre sites; some a isso o antiforgery do ASP.NET Core (um token emitido pelo servidor, que a SPA lê e devolve num cabeçalho em toda requisição que altera dados, validado com [ValidateAntiForgeryToken] ou o filtro global) ou exija um cabeçalho personalizado, que o navegador só permite via JavaScript da própria origem, após o preflight de CORS. Atenção: SPA em app.exemplo.com e API em api.exemplo.com são ORIGENS diferentes, mas o MESMO SITE (mesmo domínio registrável): cookies SameSite continuam sendo enviados, então o CORS e o token de CSRF ainda são necessários.',
            '// SPA: lê o token e envia em cabeçalho nas escritas\nawait fetch("/api/pedidos", {\n  method: "POST",\n  credentials: "include",                       // envia o cookie\n  headers: { "Content-Type": "application/json", "X-CSRF": token },\n  body: JSON.stringify({ produtoId: 7 }),\n});\n\n// servidor: AutoValidateAntiforgeryToken + SameSite=Lax + CORS por origem'
          ),
          sl(
            'Contratos tipados e tratamento de erros',
            'A API descreve seu contrato em OpenAPI (JSON gerado pelo ASP.NET Core). Dele, ferramentas como openapi-typescript, NSwag ou OpenAPI Generator geram tipos e clientes TypeScript: se o back-end renomear um campo, o build do front quebra na hora, em vez de falhar em produção. Gere o cliente no CI para não envelhecer. Erros: a API devolve ProblemDetails (application/problem+json), então o front trata de forma uniforme: verifica response.ok, lê title/status e, em validação (400), o dicionário errors, com as mensagens por campo, para exibir ao lado de cada input. Mostre ao usuário mensagens amigáveis, nunca o conteúdo bruto de detail, e trate 401 (redirecionar ao login), 403, 404, 429 (respeitar Retry-After) e falhas de rede.',
            '// tipos gerados a partir do OpenAPI (exemplo)\ntype PedidoDto = { id: number; total: number };\n\nconst r = await fetch("/api/pedidos/42", { credentials: "include" });\nif (!r.ok) {\n  const p = await r.json();           // ProblemDetails\n  mostrarErro(p.title);               // title, não stack trace\n  if (r.status === 400) mostrarCampos(p.errors);\n  return;\n}\nconst pedido: PedidoDto = await r.json();'
          ),
          sl(
            'Upload, streaming, variáveis e segredos',
            'Upload: o front envia FormData (multipart/form-data) e o servidor deve limitar tamanho, validar tipo e conteúdo, não confiar no nome do arquivo e guardá-lo fora de wwwroot (a lição de arquivos aprofunda). Respostas longas ou em tempo real podem ser entregues aos poucos (streaming, IAsyncEnumerable, SSE, SignalR) para a tela mostrar resultados antes do fim. Variáveis de ambiente do front (como VITE_API_URL ou os arquivos de environment do Angular) são substituídas em tempo de BUILD e ficam escritas dentro do JavaScript entregue ao navegador: tudo que está no bundle é PÚBLICO. Portanto só configuração não secreta (a URL da API) vai para lá. Chaves de API, senhas e connection strings ficam no back-end (user-secrets, variáveis de ambiente do servidor, cofre), e a SPA chama a SUA API, que chama o serviço externo.',
            '# .env do front (vira texto dentro do bundle: nada secreto aqui!)\nVITE_API_URL=https://api.exemplo.com\n# ERRADO:\n# VITE_PAGAMENTOS_CHAVE=<chave-secreta>   <- qualquer visitante lê no DevTools\n\n// CERTO: o segredo fica no servidor\nvar chave = builder.Configuration["Pagamentos:ChaveApi"]; // user-secrets / env'
          ),
          sl(
            'Cabeçalhos de segurança, cache e alternativas',
            'Cabeçalhos de segurança reforçam o navegador: Content-Security-Policy restringe de onde scripts e recursos podem carregar (default-src \'self\' bloqueia scripts de terceiros e inline, reduzindo o impacto de XSS), X-Content-Type-Options: nosniff impede que o navegador adivinhe o tipo do arquivo, e HSTS força HTTPS. Cache de estáticos: arquivos do build têm hash no nome (app.3f2a1c.js), então podem ser cacheados por muito tempo (Cache-Control: max-age longo, immutable); já o index.html deve ser revalidado (no-cache), para apontar sempre aos arquivos novos após cada deploy. Alternativas à SPA: Blazor (C# no navegador ou no servidor, sem JavaScript próprio) e renderização no servidor (MVC e Razor Pages, ou SSR de frameworks como Next.js e Angular SSR) quando SEO, primeira carga rápida ou simplicidade pesam mais que a interatividade de uma SPA.',
            'app.Use(async (ctx, next) =>\n{\n    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";\n    ctx.Response.Headers["Content-Security-Policy"] = "default-src \'self\'";\n    await next();\n});\n\n# estáticos com hash no nome\nCache-Control: public, max-age=31536000, immutable   # app.3f2a1c.js\nCache-Control: no-cache                              # index.html'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com esta política de CORS no ASP.NET Core?\np.AllowAnyOrigin().AllowCredentials()', 'c', [
          'Funciona, e libera qualquer site a enviar cookies à API com segurança',
          'Funciona, mas apenas em ambiente de desenvolvimento local, com o servidor de testes',
          'É recusada com exceção: origem curinga com credenciais é proibida',
          'É ignorada em silêncio, valendo apenas a opção AllowAnyOrigin'
        ], 'Origem curinga com credenciais é proibida pela especificação, e o ASP.NET Core lança exceção. Liste origens explícitas com WithOrigins.'),
        mcq('q2', 'A SPA em https://app.exemplo.com faz um PUT com JSON para https://api.exemplo.com. O que o navegador faz antes da chamada real?', 'd', [
          'Nada: o PUT é enviado direto, e o navegador só bloqueia a leitura depois',
          'Envia um GET para a raiz da API, para testar se o servidor está no ar',
          'Pede ao usuário uma confirmação manual numa janela do navegador',
          'Envia um OPTIONS (preflight) perguntando se a chamada é permitida'
        ], 'Chamadas não simples entre origens passam pelo preflight OPTIONS; o PUT real só segue se a resposta autorizar a origem, o método e os cabeçalhos.'),
        mcq('q3', 'Para que serve app.MapFallbackToFile("index.html") numa SPA hospedada no ASP.NET Core?', 'a', [
          'Devolve o index.html a URLs sem arquivo, como /pedidos/42, resolvidas pelo front',
          'Redireciona qualquer erro 500 da API para uma página estática de aviso ao usuário final',
          'Habilita o CORS para todos os arquivos presentes na pasta wwwroot, mesmo os de outras origens',
          'Compacta o index.html em gzip para economizar banda de rede'
        ], 'As rotas da SPA não existem como arquivos; o fallback entrega o index.html e o roteador do front mostra a tela certa, inclusive ao recarregar a página.'),
        fill('q4', 'Complete o método que serve a SPA para URLs não reconhecidas.', 'app.___("index.html");', ['MapFallbackToFile'], 'MapFallbackToFile entrega o arquivo informado para qualquer rota que não corresponda a endpoint ou arquivo.'),
        mcq('q5', 'Por que guardar o JWT em localStorage é considerado arriscado?', 'b', [
          'Porque o localStorage apaga os dados quando a aba é fechada',
          'Porque qualquer script na página (num XSS) pode ler e roubar o token',
          'Porque o localStorage criptografa o valor e impede o uso do token',
          'Porque o navegador envia o localStorage a todos os sites visitados'
        ], 'O JavaScript tem acesso ao localStorage; um XSS rouba o token. Um cookie HttpOnly não pode ser lido por scripts.'),
        mcq('q6', 'A API autentica por cookie de sessão. Qual conjunto protege contra CSRF?', 'c', [
          'CORS com AllowAnyOrigin, pois libera apenas as origens confiáveis',
          'Somente HTTPS, pois a criptografia impede o envio forjado do cookie',
          'Cookie SameSite e token antiforgery (ou cabeçalho personalizado) nas escritas',
          'Esconder as URLs da API, para que o atacante não as conheça'
        ], 'O navegador anexa o cookie sozinho. SameSite limita o envio entre sites e o token ou cabeçalho personalizado prova que a requisição veio da sua SPA.'),
        mcq('q7', 'O que há de errado neste .env de uma SPA?\nVITE_PAGAMENTOS_CHAVE=<chave-secreta>', 'd', [
          'Nada, pois o arquivo .env nunca é entregue ao navegador do visitante final',
          'O nome deveria estar em minúsculas para ser lido corretamente pela ferramenta de build',
          'O valor precisa ser codificado em Base64 para ser considerado seguro',
          'O valor vai para o bundle público; segredos ficam no back-end'
        ], 'Variáveis do front viram texto no JavaScript entregue ao navegador. Chaves e senhas ficam no servidor, e a SPA chama a sua API.'),
        fill('q8', 'Complete o cabeçalho que impede o navegador de adivinhar o tipo do conteúdo.', 'X-Content-Type-Options: ___', ['nosniff'], 'nosniff obriga o navegador a respeitar o Content-Type declarado, evitando que um arquivo seja interpretado como script.')
      ]
    },
    {
      id: 'csi-22-efcore-fundamentos',
      title: 'Entity Framework Core: fundamentos',
      goal: 'Usar o EF Core para mapear classes em tabelas, gerenciar migrations e fazer CRUD assíncrono com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ORM, DbContext e DbSet',
            'Um ORM (Object-Relational Mapper) traduz entre objetos C# e tabelas relacionais, para você trabalhar com classes e LINQ em vez de escrever todo o SQL. No EF Core, o DbContext representa uma sessão com o banco e cada DbSet<T> representa uma tabela (ou coleção consultável) de entidades T. Você deriva sua classe de DbContext, declara os DbSets e o EF Core cuida de abrir conexões, traduzir consultas e salvar mudanças.',
            'public class Produto\n{\n    public int Id { get; set; }\n    public string Nome { get; set; } = "";\n    public decimal Preco { get; set; }\n}\n\npublic class LojaContext : DbContext\n{\n    public LojaContext(DbContextOptions<LojaContext> options) : base(options) { }\n    public DbSet<Produto> Produtos => Set<Produto>();\n}'
          ),
          sl(
            'Provedores e connection string',
            'O provedor define qual banco o EF Core usa: Microsoft.EntityFrameworkCore.Sqlite (arquivo local, ótimo para estudo), SqlServer ou Npgsql (PostgreSQL), entre outros. O contexto é registrado na DI com AddDbContext e o provedor escolhido (UseSqlite, UseSqlServer, UseNpgsql). A connection string vem da configuração (appsettings, variáveis de ambiente, User Secrets) — nunca fixa no código, porque contém host, usuário e senha do banco.',
            'builder.Services.AddDbContext<LojaContext>(opt =>\n    opt.UseSqlite(builder.Configuration.GetConnectionString("Loja")));\n\n// appsettings.Development.json\n// { "ConnectionStrings": { "Loja": "Data Source=loja.db" } }\n// Em produção: ConnectionStrings__Loja=<connection-string> (variável de ambiente)'
          ),
          sl(
            'Migrations',
            'Migrations versionam o esquema do banco junto com o código. Depois de alterar suas entidades, dotnet ef migrations add NomeDaMigration gera uma classe com o que mudou (Up e Down); dotnet ef database update aplica as migrations pendentes ao banco. As ferramentas vêm de dotnet-ef (ferramenta global) e do pacote Microsoft.EntityFrameworkCore.Design no projeto. A pasta Migrations vai para o Git; revise o código gerado antes de aplicar, especialmente em produção.',
            'dotnet tool install --global dotnet-ef\ndotnet ef migrations add CriarProdutos\ndotnet ef database update'
          ),
          sl(
            'CRUD e SaveChanges',
            'Add marca uma entidade para inserção; Find busca pela chave primária (consulta o cache de entidades rastreadas antes de ir ao banco); Remove marca para exclusão; alterar propriedades de uma entidade rastreada marca como modificada. Nada vai ao banco até SaveChanges (ou SaveChangesAsync): ele envia todas as mudanças pendentes numa transação única. Consultas usam LINQ e são traduzidas para SQL, como em db.Produtos.Where(p => p.Preco > 10).',
            'var p = new Produto { Nome = "Caneta", Preco = 3.5m };\ndb.Produtos.Add(p);\nawait db.SaveChangesAsync();           // INSERT acontece aqui\n\nvar achado = await db.Produtos.FindAsync(p.Id);\nachado!.Preco = 4m;                    // rastreado: marcado como modificado\nawait db.SaveChangesAsync();           // UPDATE\n\ndb.Produtos.Remove(achado);\nawait db.SaveChangesAsync();           // DELETE'
          ),
          sl(
            'Rastreamento (tracking) e async',
            'O ChangeTracker do contexto guarda as entidades que ele carregou ou que você adicionou e compara o estado atual com o original para saber o que salvar. Isso é o tracking. Consultas de leitura podem custar menos com AsNoTracking (veremos adiante). Em APIs, use sempre os métodos assíncronos — ToListAsync, FirstOrDefaultAsync, SaveChangesAsync — para não bloquear threads enquanto o banco responde.',
            'var baratos = await db.Produtos\n    .Where(p => p.Preco < 10)\n    .OrderBy(p => p.Nome)\n    .ToListAsync();'
          ),
          sl(
            'Convenções, Fluent API e Data Annotations',
            'Por convenção, uma propriedade Id (ou NomeDaClasseId) vira chave primária, e DbSet<Produto> mapeia uma tabela. Para fugir da convenção há duas formas: Data Annotations (atributos na classe, como [Required], [MaxLength(100)], [Column]) e a Fluent API, configurada em OnModelCreating, mais poderosa e que mantém a entidade limpa. Quando há conflito, a Fluent API vence os atributos.',
            'protected override void OnModelCreating(ModelBuilder mb)\n{\n    mb.Entity<Produto>(e =>\n    {\n        e.Property(p => p.Nome).IsRequired().HasMaxLength(100);\n        e.Property(p => p.Preco).HasPrecision(10, 2);\n    });\n}'
          ),
          sl(
            'Tempo de vida do DbContext',
            'AddDbContext registra o contexto como scoped: uma instância por requisição HTTP. Ele não é thread-safe — nunca compartilhe a mesma instância entre threads ou tarefas paralelas, e não o guarde em campo de um singleton. Para usar o banco em um serviço singleton ou em segundo plano, injete IDbContextFactory<T> ou crie um escopo (IServiceScopeFactory) e obtenha o contexto dele, descartando-o ao fim.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que representa um DbSet<Produto> no DbContext?', 'b', [
          'Uma conexão com o banco',
          'Uma coleção consultável de entidades Produto, normalmente ligada a uma tabela',
          'Uma migration pendente',
          'Uma connection string'
        ], 'Cada DbSet<T> expõe as entidades T para consulta e alteração, mapeadas para uma tabela.'),
        mcq('q2', 'Onde deve ficar a connection string de produção?', 'c', [
          'Fixa no código do DbContext',
          'No arquivo .csproj',
          'Na configuração: variável de ambiente ou cofre de segredos, nunca no código',
          'Em um comentário no Program.cs'
        ], 'A connection string contém credenciais; deve vir da configuração e de fontes seguras, fora do repositório.'),
        mcq('q3', 'Qual comando aplica as migrations pendentes ao banco?', 'a', [
          'dotnet ef database update',
          'dotnet ef migrations add',
          'dotnet restore',
          'dotnet build'
        ], 'migrations add apenas gera o código da migration; database update a executa no banco.'),
        fill('q4', 'Complete com o método que efetiva no banco, de forma assíncrona, as mudanças pendentes.', 'db.Produtos.Add(novo);\nawait db.___();', ['SaveChangesAsync'], 'Add só marca a entidade como adicionada. O INSERT acontece em SaveChangesAsync, numa transação.'),
        mcq('q5', 'Por que o DbContext é registrado como scoped e não deve ser compartilhado entre threads?', 'd', [
          'Porque é muito grande para ser singleton',
          'Porque scoped o torna thread-safe',
          'Porque só funciona em console',
          'Porque guarda estado (tracking) e não é thread-safe; uma instância por requisição evita corrupção'
        ], 'O ChangeTracker mantém estado mutável; usar a mesma instância em paralelo causa erros e dados inconsistentes.'),
        mcq('q6', 'Qual afirmação sobre a Fluent API está correta?', 'a', [
          'É configurada em OnModelCreating e permite ajustes além das convenções',
          'Substitui o DbContext',
          'Só funciona com SQL Server',
          'Precisa ser escrita em SQL'
        ], 'A Fluent API (ModelBuilder) configura chaves, tamanhos, precisão e relacionamentos em OnModelCreating.'),
        mcq('q7', 'O que há de errado neste código?\nvar p = db.Produtos.First(x => x.Id == 1);\np.Preco = 9m;\n// fim do método', 'd', [
          'First não pode ser usado com LINQ',
          'Preco não pode ser alterado',
          'O contexto precisa ser singleton',
          'Falta SaveChanges: a mudança foi rastreada, mas nunca é enviada ao banco'
        ], 'O tracking registra a alteração, mas só SaveChanges/SaveChangesAsync gera o UPDATE.'),
        fill('q8', 'Complete com o comando que cria uma nova migration chamada AdicionarEstoque.', 'dotnet ef ___ add AdicionarEstoque', ['migrations'], 'dotnet ef migrations add NomeDaMigration gera os arquivos Up/Down com as mudanças do modelo.')
      ]
    },
    {
      id: 'csi-23-efcore-relacionamentos-consultas',
      title: 'EF Core: relacionamentos e consultas',
      goal: 'Modelar relacionamentos, carregar dados relacionados sem N+1 e consultar com desempenho, segurança e consistência.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Relacionamentos: 1:N, N:N e 1:1',
            'Um relacionamento liga duas entidades. 1:N (um cliente tem vários pedidos): o lado "muitos" guarda a chave estrangeira (FK, ex.: ClienteId) e uma propriedade de navegação (Cliente); o lado "um" tem uma coleção (Pedidos). N:N (pedido e produto): o EF Core cria a tabela de junção automaticamente quando ambos os lados têm coleções. 1:1 (usuário e perfil): cada lado tem uma navegação de referência e a FK fica no dependente. Por convenção, nomes como ClienteId e Cliente são reconhecidos sem configuração.',
            'public class Cliente\n{\n    public int Id { get; set; }\n    public string Nome { get; set; } = "";\n    public List<Pedido> Pedidos { get; set; } = new();\n}\n\npublic class Pedido\n{\n    public int Id { get; set; }\n    public int ClienteId { get; set; }          // chave estrangeira\n    public Cliente Cliente { get; set; } = null!; // navegação\n    public List<Item> Itens { get; set; } = new();\n}'
          ),
          sl(
            'Include, ThenInclude e tipos de carregamento',
            'Propriedades de navegação NÃO vêm preenchidas por padrão. Eager loading (carregamento antecipado) usa Include e ThenInclude na própria consulta e traz tudo com JOINs. Lazy loading carrega sob demanda ao acessar a propriedade, exige configuração (proxies) e é perigoso porque dispara consultas escondidas. Explicit loading carrega a relação manualmente quando você pede, com Entry(...).Collection(...).LoadAsync(). Em APIs, prefira eager loading ou projeção, de forma explícita.',
            'var pedidos = await db.Pedidos\n    .Include(p => p.Cliente)\n    .Include(p => p.Itens)\n        .ThenInclude(i => i.Produto)\n    .ToListAsync();'
          ),
          sl(
            'O problema N+1',
            'N+1 acontece quando você faz 1 consulta para listar N itens e depois mais 1 consulta por item para buscar dados relacionados: no total, N+1 idas ao banco. Costuma surgir com lazy loading ou com acesso a navegações dentro de um foreach. Com 1000 pedidos, são 1001 consultas. A solução é buscar tudo de uma vez (Include) ou projetar apenas o necessário com Select, que gera uma consulta só.',
            '// N+1: uma consulta por pedido para buscar o cliente (com lazy loading)\nforeach (var p in await db.Pedidos.ToListAsync())\n    Console.WriteLine(p.Cliente.Nome);\n\n// Correto: uma consulta só\nvar dados = await db.Pedidos\n    .Select(p => new { p.Id, Cliente = p.Cliente.Nome })\n    .ToListAsync();'
          ),
          sl(
            'AsNoTracking, projeções e AsSplitQuery',
            'AsNoTracking diz ao EF Core para não rastrear as entidades: ideal para leituras, pois economiza memória e CPU (mas elas não podem ser salvas depois por SaveChanges). Select projeta só as colunas que você precisa em DTOs — menos dados trafegados. Include de várias coleções pode gerar um JOIN gigante com linhas duplicadas (explosão cartesiana); AsSplitQuery divide em várias consultas menores. É um trade-off: menos duplicação, porém mais idas ao banco e possível inconsistência entre elas.',
            'var lista = await db.Pedidos\n    .AsNoTracking()\n    .Include(p => p.Itens)\n    .AsSplitQuery()\n    .ToListAsync();'
          ),
          sl(
            'SQL bruto sem injeção',
            'Às vezes é preciso SQL manual. FromSqlInterpolated e FromSql recebem uma string interpolada e transformam cada valor interpolado em PARÂMETRO do banco — seguro. O erro fatal é montar o SQL concatenando entrada do usuário (FromSqlRaw com +, ou $"" passado a FromSqlRaw): isso é SQL injection, em que o atacante injeta comandos no texto da consulta. Regra: valores sempre como parâmetros, nunca concatenados.',
            '// Seguro: "nome" vira parâmetro\nvar r = await db.Produtos\n    .FromSqlInterpolated($"SELECT * FROM Produtos WHERE Nome = {nome}")\n    .ToListAsync();\n\n// PERIGOSO: concatenação de entrada do usuário\n// db.Produtos.FromSqlRaw("SELECT * FROM Produtos WHERE Nome = \'" + nome + "\'")'
          ),
          sl(
            'Transações e concorrência otimista',
            'SaveChanges já é uma transação. Para agrupar várias chamadas, use db.Database.BeginTransactionAsync(), chame CommitAsync no fim e deixe o Dispose reverter se algo falhar. Concorrência otimista: em vez de bloquear linhas, cada linha carrega um token de versão (uma coluna rowversion marcada com [Timestamp], ou [ConcurrencyCheck]). Se outro usuário alterou a linha depois da sua leitura, SaveChanges lança DbUpdateConcurrencyException e você decide: recarregar, mesclar ou avisar o usuário. Evita "last write wins" silencioso.',
            'public class Produto\n{\n    public int Id { get; set; }\n    public int Estoque { get; set; }\n    [Timestamp]\n    public byte[] Versao { get; set; } = Array.Empty<byte>();\n}'
          ),
          sl(
            'Paginação e índices',
            'Paginação em EF Core: OrderBy (obrigatório para resultados estáveis) + Skip((pagina - 1) * tamanho) + Take(tamanho). Índices aceleram buscas por colunas filtradas ou ordenadas com frequência; são declarados no OnModelCreating (HasIndex, opcionalmente IsUnique). Em contrapartida, deixam as escritas um pouco mais lentas e ocupam espaço: crie índices para consultas reais, não para todas as colunas.',
            'mb.Entity<Cliente>().HasIndex(c => c.Nome);\n\nvar pagina2 = await db.Clientes\n    .OrderBy(c => c.Nome)\n    .Skip(20).Take(20)\n    .ToListAsync();'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em um relacionamento 1:N entre Cliente e Pedido, onde fica a chave estrangeira?', 'd', [
          'Em Cliente, como lista de Ids',
          'Em uma tabela chamada Cliente_Pedido obrigatoriamente',
          'Em nenhuma das duas tabelas',
          'Em Pedido (lado "muitos"), por exemplo ClienteId'
        ], 'O lado "muitos" guarda a FK que aponta para o lado "um".'),
        mcq('q2', 'Qual é o efeito de Include(p => p.Itens)?', 'b', [
          'Exclui os itens do resultado',
          'Carrega os itens relacionados junto com os pedidos (eager loading)',
          'Salva os itens no banco',
          'Cria uma migration'
        ], 'Include faz o EF Core trazer a navegação na mesma consulta, evitando consultas extras.'),
        mcq('q3', 'Qual trecho caracteriza o problema N+1?', 'b', [
          'Uma única consulta com Select projetando colunas',
          'Uma consulta para listar 500 pedidos e depois uma consulta por pedido para buscar o cliente',
          'Uma consulta paginada com Skip e Take',
          'Uma transação com Commit'
        ], 'N+1 são N consultas extras disparadas em laço, uma para cada item da consulta inicial.'),
        fill('q4', 'Complete para que o EF Core NÃO rastreie as entidades de uma consulta apenas de leitura.', 'var lista = await db.Produtos.___().ToListAsync();', ['AsNoTracking'], 'AsNoTracking evita o custo do rastreamento em leituras; as entidades não serão salvas por SaveChanges.'),
        mcq('q5', 'Qual das opções é vulnerável a SQL injection?', 'c', [
          'db.Produtos.FromSqlInterpolated($"SELECT * FROM Produtos WHERE Nome = {nome}")',
          'db.Produtos.Where(p => p.Nome == nome)',
          'db.Produtos.FromSqlRaw("SELECT * FROM Produtos WHERE Nome = \'" + nome + "\'")',
          'db.Produtos.FromSql($"SELECT * FROM Produtos WHERE Nome = {nome}")'
        ], 'Concatenar entrada do usuário no texto SQL permite injeção. As demais formas enviam o valor como parâmetro.'),
        mcq('q6', 'Para que serve uma coluna [Timestamp] (token de concorrência)?', 'a', [
          'Detectar que a linha mudou desde a leitura e lançar DbUpdateConcurrencyException ao salvar',
          'Guardar a data de criação do registro automaticamente em UTC',
          'Impedir qualquer leitura simultânea',
          'Acelerar o Include'
        ], 'É o mecanismo de concorrência otimista: o UPDATE confere a versão e falha se alguém alterou antes.'),
        mcq('q7', 'Qual é uma desvantagem de AsSplitQuery?', 'd', [
          'Impede o uso de Include',
          'Sempre gera SQL injection',
          'Desativa as migrations',
          'Executa várias consultas ao banco, aumentando as idas e voltas e podendo ver dados em momentos diferentes'
        ], 'Dividir evita a explosão cartesiana, mas custa mais round-trips e perde a consistência de uma única consulta.'),
        fill('q8', 'Complete para obter a segunda página de 10 itens (ignorando os 10 primeiros).', 'var p2 = await db.Clientes.OrderBy(c => c.Id).Skip(10).___(10).ToListAsync();', ['Take'], 'Skip descarta os primeiros itens e Take limita a quantidade; OrderBy garante estabilidade.')
      ]
    },
    {
      id: 'csi-24-ado-dapper',
      title: 'Acesso a dados: ADO.NET e Dapper',
      goal: 'Acessar bancos com ADO.NET e Dapper usando consultas parametrizadas, e saber quando preferir cada abordagem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ADO.NET: a base de tudo',
            'ADO.NET é a camada básica de acesso a dados do .NET; o EF Core e o Dapper rodam em cima dela. Os tipos centrais são DbConnection (a conexão com o banco), DbCommand (o comando SQL a executar) e DbDataReader (um cursor que lê as linhas do resultado uma a uma, só para frente). Cada banco tem seu provedor com classes concretas (SqliteConnection, SqlConnection, NpgsqlConnection). Você escreve o SQL e faz o mapeamento das colunas para objetos manualmente.',
            'await using var conn = new SqliteConnection(connectionString);\nawait conn.OpenAsync();\n\nawait using var cmd = conn.CreateCommand();\ncmd.CommandText = "SELECT Id, Nome FROM Produtos WHERE Preco > @min";\ncmd.Parameters.AddWithValue("@min", 10m);\n\nawait using var reader = await cmd.ExecuteReaderAsync();\nwhile (await reader.ReadAsync())\n{\n    int id = reader.GetInt32(0);\n    string nome = reader.GetString(1);\n    Console.WriteLine($"{id}: {nome}");\n}'
          ),
          sl(
            'SQL injection: o ataque',
            'SQL injection ocorre quando a entrada do usuário é concatenada ao texto do SQL e passa a ser interpretada como COMANDO, não como dado. Se o código monta "... WHERE Nome = \'" + nome + "\'" e o usuário envia um texto que fecha a aspa e acrescenta uma condição sempre verdadeira ou outro comando, ele pode ler, alterar ou apagar dados que não deveria. É uma das falhas mais antigas e mais graves — e totalmente evitável.',
            '// VULNERÁVEL: nunca faça isso\ncmd.CommandText = "SELECT * FROM Usuarios WHERE Login = \'" + login + "\'";'
          ),
          sl(
            'Consultas parametrizadas: a defesa',
            'A defesa correta é usar parâmetros (@nome): o texto SQL fica fixo e os valores viajam separados; o banco trata o valor SEMPRE como dado, mesmo que contenha aspas ou palavras de SQL. Vale para ADO.NET, Dapper e EF Core. Parâmetros só substituem valores — nomes de tabelas ou colunas não podem ser parametrizados; se precisar escolher uma coluna dinamicamente, valide contra uma lista fixa permitida (allowlist) no código.',
            'cmd.CommandText = "SELECT Id, Nome FROM Usuarios WHERE Login = @login";\ncmd.Parameters.AddWithValue("@login", login);   // valor sempre tratado como dado'
          ),
          sl(
            'using, pooling e transações',
            'Conexões são recursos caros: use await using (ou using) para que sejam fechadas mesmo se houver exceção. Os provedores mantêm um pool de conexões: ao fechar/descartar uma conexão, ela volta ao pool e é reaproveitada, então abrir e fechar a conexão por operação é barato e é o padrão recomendado — não guarde uma conexão aberta em campo estático. Para várias operações que precisam funcionar "tudo ou nada", use uma transação: BeginTransaction, executar os comandos, Commit; se algo falhar e o Commit não ocorrer, a transação é revertida.',
            'await using var tx = await conn.BeginTransactionAsync();\n// ... comandos associados à transação ...\nawait tx.CommitAsync();   // sem Commit, o Dispose reverte'
          ),
          sl(
            'Dapper: micro-ORM',
            'Dapper é uma biblioteca que acrescenta métodos de extensão a DbConnection. Você continua escrevendo o SQL, mas ele faz o mapeamento das colunas para as propriedades e cuida dos parâmetros a partir de objetos anônimos. QueryAsync<T> devolve linhas como T; QuerySingleOrDefaultAsync<T> devolve uma; ExecuteAsync roda INSERT/UPDATE/DELETE e devolve as linhas afetadas. Os parâmetros do objeto anônimo (new { Min = 10 }) correspondem a @Min e continuam sendo parâmetros reais, portanto seguros.',
            'var caros = await conn.QueryAsync<Produto>(\n    "SELECT Id, Nome, Preco FROM Produtos WHERE Preco > @Min",\n    new { Min = 10m });\n\nint linhas = await conn.ExecuteAsync(\n    "UPDATE Produtos SET Preco = @Preco WHERE Id = @Id",\n    new { Preco = 12m, Id = 1 });'
          ),
          sl(
            'EF Core, Dapper ou ADO.NET?',
            'EF Core: máxima produtividade, migrations, rastreamento de mudanças, LINQ tipado — ótimo para CRUD e domínios ricos, com algum custo extra. Dapper: controle total do SQL e desempenho próximo ao ADO.NET com pouca cerimônia — ótimo para consultas complexas, relatórios e leitura intensiva. ADO.NET puro: mais controle e mais código; útil para casos muito específicos ou bibliotecas. Não é uma escolha exclusiva: muitos projetos usam EF Core para escrita e Dapper para consultas pesadas, compartilhando a mesma conexão.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que torna este código vulnerável?\nvar sql = "SELECT * FROM Usuarios WHERE Login = \'" + login + "\'";', 'b', [
          'O uso de SELECT *',
          'A concatenação da entrada do usuário no texto SQL, que permite SQL injection',
          'O uso de aspas simples no SQL',
          'A falta de async'
        ], 'Concatenar a entrada faz o banco interpretar partes dela como SQL. A correção é usar parâmetros.'),
        mcq('q2', 'Como uma consulta parametrizada protege contra injeção?', 'a', [
          'O texto SQL fica fixo e o valor vai separado, sendo sempre tratado como dado',
          'Ela criptografa o SQL',
          'Ela remove automaticamente todas as aspas do banco',
          'Ela impede qualquer consulta com WHERE'
        ], 'Com parâmetros, o banco compila o comando com marcadores e recebe os valores à parte, sem reinterpretá-los como SQL.'),
        mcq('q3', 'Qual destes NÃO pode ser parametrizado em uma consulta?', 'd', [
          'Um valor numérico no WHERE',
          'Uma data no filtro',
          'Um texto comparado a uma coluna',
          'O nome da tabela ou da coluna'
        ], 'Parâmetros substituem valores. Para nomes de tabela/coluna dinâmicos, valide contra uma lista permitida no código.'),
        fill('q4', 'Complete com o prefixo usado para marcar um parâmetro em SQL parametrizado (SQLite, SQL Server).', 'cmd.CommandText = "SELECT * FROM Produtos WHERE Id = ___id";', ['@'], 'O arroba marca o parâmetro nomeado, cujo valor é adicionado em cmd.Parameters.'),
        mcq('q5', 'Por que usar "await using var conn = ..."?', 'c', [
          'Para impedir o uso de transações',
          'Para que a conexão seja singleton',
          'Para garantir que a conexão seja descartada (devolvida ao pool) mesmo se ocorrer exceção',
          'Para que o SQL fique mais rápido'
        ], 'using chama o Dispose no fim do escopo, liberando a conexão de forma determinística, também em caso de erro.'),
        mcq('q6', 'O que o pooling de conexões faz?', 'd', [
          'Mantém uma única conexão aberta para sempre no código do usuário',
          'Executa as consultas em paralelo automaticamente',
          'Cria um backup do banco',
          'Reaproveita conexões físicas já abertas quando a conexão lógica é fechada, tornando abrir/fechar barato'
        ], 'Fechar a conexão devolve-a ao pool; a próxima abertura reaproveita uma conexão física existente.'),
        mcq('q7', 'Qual cenário favorece o Dapper em vez do EF Core?', 'b', [
          'Gerar migrations automaticamente',
          'Uma consulta de relatório complexa em que você quer controlar o SQL com pouca sobrecarga',
          'Rastrear mudanças de entidades automaticamente',
          'Evitar escrever qualquer SQL'
        ], 'Dapper brilha em consultas manuais e leituras pesadas. Migrations e tracking são recursos do EF Core.'),
        fill('q8', 'Complete com o método do Dapper que executa um INSERT/UPDATE/DELETE e devolve as linhas afetadas.', 'int n = await conn.___("DELETE FROM Produtos WHERE Id = @Id", new { Id = 5 });', ['ExecuteAsync'], 'ExecuteAsync serve a comandos que não devolvem linhas de dados; retorna o número de linhas afetadas.')
      ]
    },
    {
      id: 'csi-49-nosql-mongodb-redis-armazenamento',
      title: 'NoSQL em .NET: MongoDB, Redis e armazenamento de objetos',
      goal: 'Decidir quando NoSQL faz sentido, usar o driver do MongoDB e o StackExchange.Redis com segurança, entregar arquivos por URLs pré-assinadas e aplicar retenção e eliminação de dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quando NoSQL faz sentido (e quando não)',
            '"NoSQL" reúne bancos que não seguem o modelo relacional de tabelas: documentos (MongoDB), chave-valor (Redis), colunares e de grafos. Eles brilham quando o modelo é flexível ou muda com frequência (cada documento pode ter campos diferentes), quando o acesso é principalmente por uma chave (buscar a sessão de um usuário) ou quando é preciso escalar leitura e escrita horizontalmente. O banco relacional continua melhor quando há muitas relações entre entidades, junções frequentes, restrições de integridade (chaves estrangeiras) e transações envolvendo várias tabelas, como em um sistema financeiro. Não é "um é moderno, outro antigo": escolha pelo padrão de acesso e pelas garantias necessárias, e é comum usar os dois na mesma aplicação (relacional como fonte da verdade e Redis como cache).',
            '// Relacional: dados ligados, integridade e junções\n//   Clientes --< Pedidos --< Itens    (chaves estrangeiras, transações)\n//\n// Documento (MongoDB): um agregado lido e gravado de uma vez\n//   { "_id": 1, "cliente": "Ana", "itens": [ {"sku":"A1","qtd":2}, {"sku":"B7","qtd":1} ] }\n//\n// Chave-valor (Redis): acesso direto por chave, muito rápido\n//   "sessao:abc123" -> { ...dados da sessão... }   (expira em 30 min)'
          ),
          sl(
            'MongoDB com o driver oficial',
            'O MongoDB guarda DOCUMENTOS (BSON, um JSON binário) em coleções, dentro de um banco. No .NET, o driver oficial oferece MongoClient (a conexão, que é segura para reutilizar e deve ser criada uma vez), GetDatabase, e GetCollection<T> que devolve uma IMongoCollection<T>, mapeando documentos para classes comuns (POCOs); a propriedade chamada Id (ou marcada com [BsonId]) é a chave _id. As operações principais são assíncronas: InsertOneAsync, Find(filtro).ToListAsync(), ReplaceOneAsync (troca o documento inteiro) e DeleteOneAsync. A string de conexão contém credenciais, então vem de segredos, nunca do código-fonte.',
            'public class Produto\n{\n    [BsonId] public ObjectId Id { get; set; }\n    public string Sku { get; set; } = "";\n    public decimal Preco { get; set; }\n}\n\nvar cliente = new MongoClient(configuracao["Mongo:ConexaoSegura"]);   // do cofre/segredos\nvar colecao = cliente.GetDatabase("loja").GetCollection<Produto>("produtos");\n\nawait colecao.InsertOneAsync(new Produto { Sku = "A1", Preco = 9.9m });\nvar baratos = await colecao.Find(p => p.Preco < 20m).ToListAsync();\n\nawait colecao.ReplaceOneAsync(p => p.Sku == "A1", new Produto { Sku = "A1", Preco = 12m });'
          ),
          sl(
            'Modelagem, índices e agregação',
            'Sem junções como no SQL, a modelagem pensa em como os dados são LIDOS. Embutir (guardar os itens de um pedido dentro do documento do pedido) é ótimo quando os dados são lidos juntos, pertencem a um só dono e têm tamanho limitado: uma leitura traz tudo e a gravação do documento é atômica. Referenciar (guardar o Id de outro documento) é melhor quando o dado é compartilhado, cresce sem limite ou muda independentemente; custa uma segunda consulta (ou uma etapa de agregação). Índices aceleram consultas por campo: sem índice, o banco varre a coleção inteira; um índice único (Unique) também garante que não haja duplicatas, como um SKU. O pipeline de agregação encadeia etapas (filtrar, agrupar, ordenar) para relatórios, equivalente ao GROUP BY. Transações entre vários documentos existem, mas com mais restrições e custo do que em um banco relacional, o que é mais um motivo para modelar o agregado em um único documento.',
            'var indice = new CreateIndexModel<Produto>(\n    Builders<Produto>.IndexKeys.Ascending(p => p.Sku),\n    new CreateIndexOptions { Unique = true });\nawait colecao.Indexes.CreateOneAsync(indice);\n\n// embutir: itens dentro do pedido (lidos juntos)\npublic class Pedido\n{\n    public ObjectId Id { get; set; }\n    public List<ItemPedido> Itens { get; set; } = new();\n    public ObjectId ClienteId { get; set; }   // referência: cliente é compartilhado\n}'
          ),
          sl(
            'Injeção NoSQL',
            'Bancos NoSQL também sofrem injeção. Em consultas MongoDB, filtros são documentos com operadores como $ne (diferente de), $gt, $regex e até $where (executa JavaScript). Se a aplicação pega o JSON enviado pelo usuário e o usa diretamente como filtro, o atacante troca um valor simples por um operador. Exemplo: o login recebe {"usuario": "ana", "senha": {"$ne": null}}; o filtro vira "senha diferente de null", que é verdadeiro para qualquer senha. Defesa: NUNCA transforme JSON do cliente em filtro; receba campos tipados (string, número), monte o filtro com Builders<T>.Filter ou com lambdas, passando o valor como DADO, e valide tipo, tamanho e formato antes. Para senha, aliás, compare o HASH com algoritmo próprio de senhas, nunca o texto em consulta.',
            '// RUIM: o JSON do usuário vira filtro (aceita {"$ne": null})\n// var filtro = BsonDocument.Parse(jsonDoUsuario);\n// var u = await colecao.Find(filtro).FirstOrDefaultAsync();\n\n// BOM: campos tipados; o valor é sempre dado, nunca operador\npublic record LoginDto(string Usuario, string Senha);\n\nvar filtro = Builders<Usuario>.Filter.Eq(u => u.Nome, dto.Usuario);\nvar usuario = await colecao.Find(filtro).FirstOrDefaultAsync();\n// depois: verificar dto.Senha contra o HASH guardado, com um verificador de senhas'
          ),
          sl(
            'Redis com StackExchange.Redis',
            'O Redis é um banco em memória, chave-valor, muito rápido, com estruturas: strings, hashes (campos de um objeto), listas (filas simples), sets (conjuntos sem repetição), sorted sets e outras. Com o StackExchange.Redis, a conexão é um ConnectionMultiplexer: caro de criar e feito para ser COMPARTILHADO, então crie UMA instância (singleton no DI) e reutilize; criar uma por requisição esgota conexões. Dele você obtém um IDatabase, leve, para os comandos. Toda chave que não deve existir para sempre precisa de TTL (time to live): o Redis a apaga sozinho depois do prazo. Usos comuns: cache, sessão, contadores e limite de taxa (rate limit: INCR com TTL), filas simples e locks distribuídos. RISCO de locks: o lock também expira, então um trabalho lento pode perder o lock e dois processos agirem ao mesmo tempo; use um token único ao adquirir e só libere se o token for o seu, e não trate como garantia absoluta.',
            'var mux = await ConnectionMultiplexer.ConnectAsync(configuracao["Redis:Conexao"]!); // UMA vez\nIDatabase db = mux.GetDatabase();\n\nawait db.StringSetAsync("sessao:abc", "dados", TimeSpan.FromMinutes(30)); // com TTL\nstring? v = await db.StringGetAsync("sessao:abc");\n\nawait db.HashSetAsync("usuario:1", new[] { new HashEntry("tema", "escuro") });\nawait db.ListLeftPushAsync("fila:email", "tarefa-1");\nawait db.SetAddAsync("online", "1");\n\n// rate limit: contador por minuto\nlong n = await db.StringIncrementAsync("limite:ip:1");\nif (n == 1) await db.KeyExpireAsync("limite:ip:1", TimeSpan.FromMinutes(1));'
          ),
          sl(
            'Armazenamento de objetos, TLS e LGPD',
            'Arquivos (imagens, PDFs, backups) não pertencem ao banco: ficam em armazenamento de objetos (blob storage, compatível com S3), organizado em buckets. Para entregar um arquivo privado sem passar os bytes pela API, gere uma URL pré-assinada: um link temporário, assinado pela sua credencial, que dá acesso a UM objeto por pouco tempo (minutos). Mantenha a expiração curta, a permissão mínima (só leitura) e nunca torne o bucket público por engano: buckets abertos são uma causa clássica de vazamento, então revise a política de acesso. Conexões a bancos e storage usam TLS (criptografia em trânsito) e credenciais vindas de segredos ou identidades gerenciadas, com contas de privilégio mínimo; nunca strings de conexão no repositório. LGPD: dados pessoais devem ser mantidos só pelo tempo necessário e eliminados quando solicitado. Em NoSQL e cache isso significa definir retenção (TTL em chaves do Redis, índices TTL ou rotinas de expurgo no MongoDB, regras de ciclo de vida no bucket), e conseguir localizar e apagar os dados de uma pessoa também nesses sistemas, inclusive em cópias e caches.',
            '// URL pré-assinada (conceito; o nome do método varia conforme o SDK do provedor)\n//   url = GerarUrlPreAssinada(bucket: "docs-privados",\n//                              objeto: "recibos/2025/abc.pdf",\n//                              permissao: Leitura,\n//                              expira: 5 minutos);\n\n// Conexões com TLS e segredos (valores vêm do cofre, nunca do código)\n//   Redis:   "<host>:6380,ssl=true,password=<senha-do-cofre>"\n//   Mongo:   "mongodb+srv://<usuario>:<senha-do-cofre>@<host>/"\n\n// Retenção: todo dado temporário nasce com prazo\nawait db.StringSetAsync("token:reset:42", "x", TimeSpan.FromMinutes(15));'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual cenário favorece mais um banco NoSQL (documento ou chave-valor) em vez do relacional?', 'a', [
          'Sessão por chave, com baixa latência e expiração automática',
          'Sistema contábil com muitas junções e transações entre várias tabelas',
          'Cadastros com integridade referencial rígida entre dezenas de entidades',
          'Relatórios que cruzam cinco tabelas com restrições de chave estrangeira'
        ], 'Acesso por chave, baixa latência e expiração são pontos fortes do chave-valor; junções e transações multi-entidade favorecem o relacional.'),
        mcq('q2', 'Pedido e seus itens são sempre lidos juntos, e cada pedido tem poucos itens. Como modelar no MongoDB?', 'c', [
          'Uma coleção de itens com Id do pedido, e junções manuais em toda leitura',
          'Um documento separado por campo, para facilitar a atualização de cada um',
          'Embutir os itens no documento do pedido, lido e gravado de uma vez',
          'Duplicar o pedido inteiro dentro de cada cliente que já comprou algo'
        ], 'Dados lidos juntos, de um só dono e com tamanho limitado combinam com embutir; referenciar é melhor para dados compartilhados ou ilimitados.'),
        mcq('q3', 'Qual o problema de usar BsonDocument.Parse(jsonDoUsuario) como filtro de login?', 'd', [
          'O Parse só aceita documentos JSON com mais de dois campos de texto',
          'O filtro fica lento por falta de índice e escaneia toda a coleção',
          'O driver recusa filtros construídos a partir de texto sem tipo definido',
          'Enviar {"$ne": null} como senha e burlar a verificação (injeção NoSQL)'
        ], 'Filtros do Mongo são documentos com operadores. O valor do cliente deve ser dado tipado, nunca um filtro pronto.'),
        fill('q4', 'Complete o método assíncrono que insere um documento na coleção.', 'await colecao.___(new Produto { Sku = "A1" });', ['InsertOneAsync', 'InsertOne'], 'InsertOneAsync grava um documento; para vários existe InsertManyAsync.'),
        mcq('q5', 'Como criar e usar o ConnectionMultiplexer do StackExchange.Redis em uma API?', 'b', [
          'Criar um novo ConnectionMultiplexer para cada requisição e descartá-lo ao final',
          'Uma única instância compartilhada (singleton), obtendo o IDatabase dela',
          'Criar um novo ConnectionMultiplexer a cada comando Redis executado',
          'Criar um por thread e fechá-lo logo depois do primeiro uso'
        ], 'O multiplexer é caro e feito para ser compartilhado; o IDatabase é leve e pode ser obtido quando necessário.'),
        mcq('q6', 'Tokens de redefinição de senha, com dados pessoais, ficam no Redis. Qual prática atende à retenção da LGPD?', 'c', [
          'Guardar sem expiração para facilitar auditorias futuras',
          'Guardar sem prazo e apagar manualmente quando alguém se lembrar disso',
          'Gravar com TTL curto, expirando sozinha, e apagar sob solicitação',
          'Duplicar as chaves em outro banco para ter mais um backup'
        ], 'Dados temporários devem nascer com prazo (TTL). Isso limita o tempo de retenção e reduz o impacto de um vazamento.'),
        mcq('q7', 'Qual é a forma mais segura de entregar um PDF privado guardado em um bucket de objetos a um usuário autorizado?', 'd', [
          'Tornar o bucket público e enviar o link comum do objeto ao usuário',
          'Gerar uma URL pré-assinada de leitura, com expiração de vários dias',
          'Colocar o arquivo em uma URL de nome aleatório, sem expiração e sem autenticação',
          'URL pré-assinada de leitura, com expiração curta, após checar a permissão'
        ], 'A URL temporária dá acesso a um objeto por pouco tempo. Bucket público e links permanentes são causas clássicas de vazamento.'),
        fill('q8', 'Complete a gravação no Redis para a chave expirar sozinha em 10 minutos.', 'await db.___("chave", "valor", TimeSpan.FromMinutes(10));', ['StringSetAsync', 'StringSet'], 'StringSetAsync aceita um TimeSpan de expiração (TTL), que faz o Redis remover a chave ao fim do prazo.')
      ]
    },
    {
      id: 'csi-25-autenticacao-autorizacao',
      title: 'Autenticação e autorização no ASP.NET Core',
      goal: 'Proteger APIs com autenticação (cookies e JWT), autorização por roles e policies, senhas com hash e defesas web básicas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autenticação versus autorização',
            'Autenticação responde "quem é você?": verifica uma identidade (usuário e senha, token, certificado). Autorização responde "o que você pode fazer?": decide se aquela identidade pode acessar um recurso ou executar uma ação. Falha na primeira gera 401; falha na segunda (usuário válido, sem permissão) gera 403. No ASP.NET Core a identidade autenticada vira um ClaimsPrincipal, que carrega claims — afirmações como nome, e-mail, papéis (roles) e permissões.'
          ),
          sl(
            'Cookies e JWT Bearer',
            'Autenticação por cookie: após o login o servidor emite um cookie assinado/criptografado que o navegador devolve a cada requisição — ideal para aplicações web com páginas. JWT (JSON Web Token): um token assinado enviado no cabeçalho Authorization: Bearer <token> — comum em APIs consumidas por SPAs e apps móveis. Um JWT tem cabeçalho, payload (claims, como iss = emissor, aud = audiência, exp = expiração) e assinatura. O payload é apenas codificado (Base64), NÃO é criptografado: nunca coloque nele segredos ou dados sensíveis. A assinatura garante que o token não foi adulterado.',
            'builder.Services.AddAuthentication("Bearer")\n    .AddJwtBearer("Bearer", o =>\n    {\n        o.TokenValidationParameters = new TokenValidationParameters\n        {\n            ValidateIssuer = true,\n            ValidIssuer = builder.Configuration["Jwt:Issuer"],\n            ValidateAudience = true,\n            ValidAudience = builder.Configuration["Jwt:Audience"],\n            ValidateLifetime = true,\n            ValidateIssuerSigningKey = true,\n            IssuerSigningKey = new SymmetricSecurityKey(\n                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))\n        };\n    });\n// Jwt:Key vem de User Secrets / variável de ambiente: <chave-secreta>'
          ),
          sl(
            'Validar o token: não confie, verifique',
            'O servidor precisa validar toda a cadeia: a assinatura (com a chave correta), o emissor (iss), a audiência (aud) e a expiração (exp). Desligar qualquer validação para "facilitar" abre brechas — um token emitido para outra aplicação, ou expirado, seria aceito. Use tempos de vida curtos para tokens de acesso. A chave de assinatura é um segredo: fica em configuração segura, longe do repositório, e deve ser longa e aleatória.'
          ),
          sl(
            'Senhas: hash, nunca texto puro',
            'Nunca armazene senha em texto puro, nem criptografada de forma reversível: guarde apenas um hash com sal, gerado por um algoritmo lento e próprio para senhas (PBKDF2, bcrypt, Argon2 via bibliotecas confiáveis). O ASP.NET Core Identity traz o PasswordHasher, que faz isso corretamente. Para conferir, você não "descriptografa": recalcula o hash da senha informada e compara. E jamais implemente criptografia ou hash próprios: use as bibliotecas padrão e testadas.',
            'var hasher = new PasswordHasher<Usuario>();\nstring hash = hasher.HashPassword(usuario, senhaInformada);   // guarde só o hash\n\nvar resultado = hasher.VerifyHashedPassword(usuario, hash, senhaDigitada);\nbool ok = resultado == PasswordVerificationResult.Success;'
          ),
          sl(
            'Roles, claims e policies',
            'Role é um papel ("admin", "gerente"); claim é uma afirmação mais fina; policy é uma regra nomeada que combina requisitos (ter determinada role, claim ou lógica própria). [Authorize] exige usuário autenticado; [Authorize(Roles = "admin")] exige a role; [Authorize(Policy = "...")] aplica a policy registrada em AddAuthorization; [AllowAnonymous] libera uma ação específica. Policies centralizam a regra e evitam strings de roles espalhadas. Em Minimal APIs, o equivalente é .RequireAuthorization("NomeDaPolicy").',
            'builder.Services.AddAuthorization(o =>\n    o.AddPolicy("SoAdmin", p => p.RequireRole("admin")));\n\n[Authorize(Policy = "SoAdmin")]\n[HttpDelete("{id:int}")]\npublic IActionResult Excluir(int id) => NoContent();'
          ),
          sl(
            'CORS, HTTPS/HSTS, antiforgery e rate limiting',
            'CORS (Cross-Origin Resource Sharing) é uma regra do NAVEGADOR: por padrão, uma página de uma origem não pode ler respostas de outra; o servidor libera origens específicas com cabeçalhos CORS. Não é mecanismo de autenticação e não protege a API contra clientes que não são navegadores — libere só as origens necessárias, nunca "todas" com credenciais. HTTPS criptografa o tráfego (UseHttpsRedirection) e HSTS (UseHsts) instrui o navegador a só usar HTTPS. Antiforgery protege contra CSRF em aplicações baseadas em cookies, validando um token em requisições que alteram estado. Rate limiting (AddRateLimiter/UseRateLimiter) limita o número de requisições por cliente, reduzindo força bruta e abuso.',
            'builder.Services.AddCors(o => o.AddPolicy("web", p =>\n    p.WithOrigins("https://app.exemplo.com")\n     .AllowAnyHeader()\n     .AllowAnyMethod()));\n// ...\napp.UseCors("web");'
          ),
          sl(
            'OAuth2 e OpenID Connect em visão geral',
            'OAuth2 é um protocolo de AUTORIZAÇÃO delegada: permite que um aplicativo acesse recursos em nome do usuário via tokens, sem receber a senha dele. OpenID Connect (OIDC) é uma camada sobre o OAuth2 para AUTENTICAÇÃO: devolve a identidade do usuário (ID token). Na prática você delega o login a um provedor de identidade (Microsoft Entra ID, Google, Keycloak etc.), reduzindo o risco de guardar senhas. Em vez de reinventar login, tokens e criptografia, use um provedor ou o ASP.NET Core Identity.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre autenticação e autorização?', 'c', [
          'São sinônimos',
          'Autorização verifica a senha; autenticação define permissões',
          'Autenticação verifica quem é o usuário; autorização decide o que ele pode fazer',
          'Autenticação só existe em cookies; autorização só em JWT'
        ], 'Primeiro se identifica o usuário (autenticação), depois se decide o acesso (autorização).'),
        mcq('q2', 'Um usuário autenticado tenta acessar um recurso de administrador sem ter essa permissão. Qual status é o correto?', 'd', [
          '200',
          '404',
          '401',
          '403'
        ], '401 é falta de autenticação; 403 é autenticado, mas proibido.'),
        mcq('q3', 'Sobre o conteúdo (payload) de um JWT, qual afirmação é correta?', 'a', [
          'É apenas codificado em Base64, não criptografado: não coloque segredos nele',
          'É sempre criptografado com a chave do servidor',
          'Só o servidor consegue lê-lo',
          'Nunca pode conter claims'
        ], 'A assinatura impede adulteração, mas o payload é legível por qualquer um que tenha o token.'),
        fill('q4', 'Complete com o atributo que libera uma ação específica para usuários não autenticados.', '[___]\n[HttpPost("login")]\npublic IActionResult Entrar(LoginDto dto) => Ok();', ['AllowAnonymous'], '[AllowAnonymous] ignora a exigência de [Authorize] naquela ação, como o endpoint de login.'),
        mcq('q5', 'Qual é a forma correta de guardar senhas?', 'b', [
          'Em texto puro, num campo protegido por permissão',
          'Apenas o hash com sal, gerado por algoritmo próprio para senhas (ex.: via PasswordHasher do Identity)',
          'Criptografadas de forma reversível, com chave no código',
          'Em Base64'
        ], 'Hash lento com sal; nada de texto puro, criptografia reversível ou Base64 (que é só codificação).'),
        mcq('q6', 'Qual configuração do JWT Bearer é um erro de segurança?', 'a', [
          'ValidateLifetime = false, aceitando tokens expirados',
          'Validar emissor e audiência',
          'Ler a chave de assinatura da configuração segura',
          'Usar HTTPS'
        ], 'Aceitar tokens expirados anula o controle de tempo de vida e prolonga indevidamente o acesso.'),
        mcq('q7', 'Qual afirmação sobre CORS está correta?', 'c', [
          'Protege a API contra qualquer cliente HTTP',
          'Substitui a autenticação',
          'É uma restrição aplicada pelo navegador; o servidor libera origens específicas por cabeçalhos',
          'Deve sempre liberar todas as origens com credenciais'
        ], 'CORS controla o que páginas de outra origem podem ler no navegador; não é um mecanismo de autenticação.'),
        fill('q8', 'Complete com o método que registra as policies de autorização.', 'builder.Services.___(o => o.AddPolicy("SoAdmin", p => p.RequireRole("admin")));', ['AddAuthorization'], 'AddAuthorization registra o serviço e permite configurar policies nomeadas.')
      ]
    },
    {
      id: 'csi-26-httpclient-consumo-apis',
      title: 'HttpClient e consumo de APIs',
      goal: 'Consumir APIs externas com IHttpClientFactory, timeouts, resiliência, cancelamento e cuidados contra SSRF.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'HttpClient e o esgotamento de sockets',
            'HttpClient envia requisições HTTP. Ele foi feito para ser reutilizado, não criado a cada chamada: cada new HttpClient() dentro de using abre novas conexões TCP que ficam em estado de espera após o descarte, e sob carga o programa pode esgotar as portas (sockets) do sistema, falhando com erros de conexão. A solução é reutilizar instâncias — e, em apps com injeção de dependência, deixar o IHttpClientFactory gerenciar isso.',
            '// Ruim: nova instância a cada chamada\nasync Task<string> Baixar(string url)\n{\n    using var http = new HttpClient();     // risco de esgotar sockets sob carga\n    return await http.GetStringAsync(url);\n}'
          ),
          sl(
            'IHttpClientFactory e typed clients',
            'IHttpClientFactory gerencia o pool de conexões e o ciclo de vida dos handlers (reciclando-os periodicamente, o que também respeita mudanças de DNS). O padrão mais limpo é o typed client: uma classe que recebe HttpClient no construtor, configurado no registro com AddHttpClient<T>. Assim a URL base, o timeout e os cabeçalhos ficam em um só lugar.',
            'builder.Services.AddHttpClient<ClimaClient>(c =>\n{\n    c.BaseAddress = new Uri("https://api.exemplo.com/");\n    c.Timeout = TimeSpan.FromSeconds(10);\n});\n\npublic class ClimaClient(HttpClient http)\n{\n    public Task<Clima?> ObterAsync(string cidade, CancellationToken ct) =>\n        http.GetFromJsonAsync<Clima>($"clima?cidade={Uri.EscapeDataString(cidade)}", ct);\n}\n\npublic record Clima(string Cidade, double TemperaturaC);'
          ),
          sl(
            'JSON, status e EnsureSuccessStatusCode',
            'GetFromJsonAsync<T> faz o GET e desserializa o JSON em T; PostAsJsonAsync serializa um objeto e o envia no corpo de um POST. Por padrão, HttpClient NÃO lança exceção por status de erro (404, 500): ele devolve a resposta. Chame EnsureSuccessStatusCode() para lançar HttpRequestException em status não-2xx, ou inspecione response.IsSuccessStatusCode / StatusCode para tratar cada caso. (GetFromJsonAsync já lança em status de erro.) Nomes dinâmicos na URL devem ser escapados com Uri.EscapeDataString.',
            'var resposta = await http.PostAsJsonAsync("pedidos", novoPedido, ct);\nresposta.EnsureSuccessStatusCode();\nvar criado = await resposta.Content.ReadFromJsonAsync<PedidoDto>(cancellationToken: ct);'
          ),
          sl(
            'Cabeçalhos e autenticação sem vazar segredos',
            'Tokens e chaves de API de serviços externos vão em cabeçalhos (Authorization: Bearer ... ou um cabeçalho de chave), mas o valor vem da configuração segura (User Secrets, variável de ambiente, cofre), nunca de uma string no código ou no repositório. Não registre cabeçalhos de autorização nem corpos com dados pessoais nos logs.',
            'c.DefaultRequestHeaders.Authorization =\n    new AuthenticationHeaderValue("Bearer", builder.Configuration["Clima:Token"]);\n// Clima:Token = <token-da-api> (fora do código)'
          ),
          sl(
            'Timeout, cancelamento e falhas de rede',
            'A rede falha: servidores demoram, conexões caem. Sempre defina um timeout (HttpClient.Timeout, padrão longo) e aceite um CancellationToken para que a chamada seja cancelada quando o chamador desiste (por exemplo, o cliente fechou a requisição). Trate exceções: HttpRequestException (falha de rede/status), TaskCanceledException (timeout ou cancelamento). Não deixe a lentidão de um serviço externo travar o seu.'
          ),
          sl(
            'Resiliência: retry, circuit breaker e timeout',
            'Falhas transitórias merecem nova tentativa; falhas persistentes, não. Retry repete a chamada com espera crescente (backoff) e variação aleatória (jitter). Circuit breaker "abre o circuito" após muitas falhas e rejeita chamadas imediatamente por um tempo, protegendo o serviço doente e o seu. Timeouts limitam a espera por tentativa. O pacote Microsoft.Extensions.Http.Resilience (baseado no Polly) oferece tudo isso; AddStandardResilienceHandler aplica uma combinação padrão ao cliente. Atenção: só repita operações idempotentes — repetir um POST de pagamento pode cobrar duas vezes.',
            'builder.Services.AddHttpClient<ClimaClient>(c => c.BaseAddress = new Uri("https://api.exemplo.com/"))\n    .AddStandardResilienceHandler();'
          ),
          sl(
            'SSRF: cuidado com URLs fornecidas pelo usuário',
            'SSRF (Server-Side Request Forgery) acontece quando o servidor faz uma requisição para uma URL escolhida por um usuário. Um atacante pode apontá-la para serviços internos (a rede privada, o endereço de metadados da nuvem, localhost) que ele não alcançaria de fora, usando o seu servidor como ponte. Defesas: evite aceitar URLs completas; se for inevitável, valide esquema (https) e use uma allowlist de hosts permitidos, bloqueie endereços internos e não siga redirecionamentos cegamente.',
            'static readonly HashSet<string> HostsPermitidos = new() { "api.exemplo.com" };\n\nstatic bool UrlPermitida(string texto) =>\n    Uri.TryCreate(texto, UriKind.Absolute, out var uri)\n    && uri.Scheme == Uri.UriSchemeHttps\n    && HostsPermitidos.Contains(uri.Host);'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o risco de criar "new HttpClient()" a cada chamada sob carga?', 'a', [
          'Esgotar sockets/portas, pois as conexões descartadas ficam em espera',
          'O HttpClient deixa de aceitar JSON',
          'O código deixa de compilar',
          'As respostas passam a vir sem corpo'
        ], 'Criar e descartar clientes o tempo todo acumula conexões em espera e pode esgotar as portas do sistema.'),
        mcq('q2', 'O que o IHttpClientFactory oferece?', 'b', [
          'Um banco de dados em memória',
          'Gerenciamento do ciclo de vida/pool dos handlers e clientes configurados centralmente',
          'Criptografia automática de todas as respostas',
          'Validação de JWT'
        ], 'A fábrica reaproveita conexões, recicla handlers e centraliza a configuração (typed clients).'),
        mcq('q3', 'O que acontece por padrão quando o servidor responde 500 a um HttpClient.GetAsync?', 'd', [
          'Sempre lança TaskCanceledException',
          'O programa é encerrado',
          'O HttpClient tenta de novo sozinho várias vezes',
          'Nada é lançado: a resposta é devolvida; use EnsureSuccessStatusCode ou verifique o status'
        ], 'HttpClient só lança por falhas de rede; status de erro precisam ser verificados ou forçados com EnsureSuccessStatusCode.'),
        fill('q4', 'Complete com o tipo que permite cancelar a chamada quando o chamador desiste.', 'Task<Clima?> ObterAsync(string cidade, ___ ct);', ['CancellationToken'], 'CancellationToken propaga o pedido de cancelamento até a chamada de rede.'),
        mcq('q5', 'Onde deve ficar o token de uma API externa usado no cabeçalho Authorization?', 'c', [
          'Em uma constante no código',
          'No arquivo launchSettings.json versionado',
          'Em configuração segura (User Secrets, variável de ambiente ou cofre)',
          'Em um comentário no repositório'
        ], 'Segredos ficam fora do código e do Git; o valor é lido da configuração segura em tempo de execução.'),
        mcq('q6', 'Qual cuidado é essencial ao usar retry automático?', 'b', [
          'Repetir qualquer operação, inclusive POSTs não idempotentes, sem limite',
          'Repetir apenas operações idempotentes (ou protegidas por chave de idempotência), com limite e backoff',
          'Nunca definir timeout',
          'Desligar o circuit breaker'
        ], 'Repetir operações não idempotentes pode duplicar efeitos (como cobranças); retries precisam de limite e espera crescente.'),
        mcq('q7', 'O que o código faz de errado?\napp.MapGet("/baixar", async (string url, HttpClient http) => await http.GetStringAsync(url));', 'a', [
          'Busca uma URL arbitrária enviada pelo usuário, abrindo espaço para SSRF',
          'Usa async',
          'Injeta o HttpClient',
          'Usa MapGet'
        ], 'Aceitar uma URL livre faz o servidor acessar destinos escolhidos pelo atacante, inclusive serviços internos.'),
        fill('q8', 'Complete com o método de extensão que lê o corpo da resposta como JSON tipado.', 'var dto = await resposta.Content.___<PedidoDto>();', ['ReadFromJsonAsync'], 'ReadFromJsonAsync<T> desserializa o corpo JSON da resposta em T.')
      ]
    },
    {
      id: 'csi-45-uploads-email-relatorios',
      title: 'Uploads, e-mail e geração de relatórios',
      goal: 'Receber arquivos com segurança, enviar e-mail sem travar a requisição nem permitir injeção, gerar CSV/Excel/PDF e entregar relatórios grandes respeitando a LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Upload: nunca confie no que o cliente envia',
            'Em ASP.NET Core, um arquivo enviado por formulário multipart chega como IFormFile: tem FileName (o nome que o CLIENTE declarou), Length, ContentType (também declarado pelo cliente) e OpenReadStream(). Nada disso é confiável: o atacante controla nome, tipo e conteúdo. Primeiro, limite o tamanho: [RequestSizeLimit(bytes)] limita o corpo da requisição e [RequestFormLimits(MultipartBodyLengthLimit = bytes)] limita o formulário multipart. Sem limite, um envio gigante consome disco e memória (negação de serviço). Segundo, verifique também Length antes de gravar.',
            '[HttpPost("avatar")]\n[RequestSizeLimit(2_000_000)]                               // corpo até ~2 MB\n[RequestFormLimits(MultipartBodyLengthLimit = 2_000_000)]  // limite do multipart\npublic async Task<IActionResult> Enviar(IFormFile arquivo)\n{\n    if (arquivo.Length is 0 or > 2_000_000) return BadRequest("Tamanho inválido.");\n    // ... validar tipo e gravar (próximos slides)\n    return Ok();\n}'
          ),
          sl(
            'Validar extensão E conteúdo; nunca usar o nome do cliente',
            'A extensão ".png" é só texto: qualquer arquivo pode ser renomeado. Faça duas verificações: uma lista de extensões PERMITIDAS (lista de permissão, não de bloqueio) e a verificação do CONTEÚDO pela assinatura mágica (magic number), os primeiros bytes que identificam o formato: PNG começa com 89 50 4E 47, JPEG com FF D8 FF, PDF com "%PDF". Depois, jamais use FileName como parte do caminho: um nome como "..\\..\\config.json" ou "../../x" faz Path.Combine escapar da pasta (path traversal) e sobrescrever arquivos do servidor. Gere o nome você mesmo, com Guid, e descarte o nome original (guarde-o à parte só como texto, se precisar exibi-lo).',
            'static readonly byte[] Png = { 0x89, 0x50, 0x4E, 0x47 };\n\nasync Task<bool> EhPngAsync(IFormFile f)\n{\n    var cab = new byte[4];\n    await using var s = f.OpenReadStream();\n    int lidos = await s.ReadAsync(cab);\n    return lidos == 4 && cab.AsSpan().SequenceEqual(Png);\n}\n\n// RUIM: arquivo.FileName pode ser "../../app.dll"\n// var caminho = Path.Combine(pasta, arquivo.FileName);\n\n// BOM: o nome é gerado pelo servidor\nvar nome = Guid.NewGuid().ToString("N") + ".png";\nvar caminho = Path.Combine(pasta, nome);'
          ),
          sl(
            'Onde guardar, streaming e antivírus',
            'Não grave uploads em wwwroot nem em qualquer pasta servida como arquivo estático: um HTML ou script enviado pelo atacante seria entregue e executado no navegador de outras pessoas. Guarde numa pasta fora da raiz web, ou em armazenamento de objetos (blob/S3) com acesso controlado, e entregue por uma ação que verifica permissão. Para arquivos grandes, use streaming: copie com CopyToAsync direto do stream para o destino, sem carregar tudo em memória (nunca ToArray de um arquivo de centenas de MB). Em sistemas que recebem arquivos de desconhecidos, considere também um antivírus/varredura de malware antes de disponibilizar o arquivo, geralmente como etapa assíncrona.',
            'await using var destino = File.Create(caminho);       // pasta FORA de wwwroot\nawait arquivo.CopyToAsync(destino);                    // streaming, não carrega tudo na memória\n\n// entrega controlada (verifica permissão antes de devolver)\napp.MapGet("/arquivos/{id}", async (string id, HttpContext ctx) =>\n{\n    if (!UsuarioPodeVer(ctx.User, id)) return Results.Forbid();\n    return Results.File(CaminhoDe(id), "application/octet-stream");\n});'
          ),
          sl(
            'Envio de e-mail: SMTP, bibliotecas e serviços',
            'E-mail transacional (confirmação, recibo, alerta) trafega por SMTP. A classe System.Net.Mail.SmtpClient está marcada como obsoleta para novos projetos: a própria documentação recomenda bibliotecas como MailKit (com MimeKit para montar a mensagem). Outra via comum é um serviço de e-mail por API HTTP (provedores transacionais), que cuida de entrega e reputação. Em qualquer caso: usuário, senha e chaves de API ficam em segredos (user secrets, variável de ambiente, cofre), nunca no repositório. E-mail é lento e pode falhar: não envie dentro da requisição HTTP; coloque uma mensagem numa fila/job e responda logo (veja a lição de jobs). A entregabilidade ainda depende de SPF, DKIM e DMARC, registros DNS que provam que o domínio autorizou aquele servidor a enviar; só vale conhecê-los pelo nome nesta etapa.',
            '// Visão geral com MailKit (credenciais vêm de configuração segura)\nvar msg = new MimeMessage();\nmsg.From.Add(new MailboxAddress("App", "nao-responda@exemplo.com"));\nmsg.To.Add(new MailboxAddress("", destinatario));\nmsg.Subject = "Pedido recebido";\nmsg.Body = new TextPart("plain") { Text = "Obrigado pela compra." };\n\nusing var smtp = new MailKit.Net.Smtp.SmtpClient();\nawait smtp.ConnectAsync(opcoes.Host, opcoes.Porta, SecureSocketOptions.StartTls);\nawait smtp.AuthenticateAsync(opcoes.Usuario, opcoes.Senha);   // vindos de segredos\nawait smtp.SendAsync(msg);\nawait smtp.DisconnectAsync(true);'
          ),
          sl(
            'Injeção de cabeçalho de e-mail',
            'Um cabeçalho de e-mail termina em quebra de linha (CR LF). Se você monta o assunto ou o remetente concatenando texto digitado pelo usuário, ele pode incluir "\\r\\n" seguido de outro cabeçalho (por exemplo, Bcc: vitima@exemplo.com) e usar seu servidor para spam. Defesas: nunca concatene entrada do usuário em cabeçalhos; use a API da biblioteca (que valida endereços e codifica o assunto); rejeite CR e LF em campos que vão para cabeçalho; e limite quem pode disparar e-mails, com limite de taxa, porque um formulário "fale conosco" aberto é um canal de abuso.',
            '// RUIM: assunto vindo direto do formulário\n// var cabecalho = "Subject: " + assunto;   // assunto = "oi\\r\\nBcc: x@exemplo.com"\n\n// BOM: rejeitar quebras de linha e usar a biblioteca\nif (assunto.Contains(\'\\r\') || assunto.Contains(\'\\n\'))\n    return Results.BadRequest("Assunto inválido.");\nmsg.Subject = assunto;   // a biblioteca codifica o cabeçalho'
          ),
          sl(
            'CSV: escape e injeção de fórmula',
            'CSV parece simples, mas um campo que contém vírgula, aspas ou quebra de linha precisa ser cercado por aspas, e as aspas internas são dobradas: Silva, Ana vira "Silva, Ana" e diz "oi" vira "diz ""oi""". Em vez de escrever à mão, use uma biblioteca como CsvHelper, que cuida disso (e da cultura: use InvariantCulture em dados de integração). Há também a injeção de fórmula: o Excel e planilhas similares interpretam como FÓRMULA qualquer célula que comece com =, +, - ou @. Se um usuário cadastrou o nome "=HYPERLINK(...)" e você exporta sem cuidado, quem abrir o arquivo executa a fórmula. Defesa: ao exportar texto vindo de usuário, prefixe valores que começam com esses caracteres com uma aspa simples (\') ou rejeite-os.',
            'static string CsvCampo(string v)\n{\n    if (v.Length > 0 && "=+-@".Contains(v[0])) v = "\'" + v;   // neutraliza fórmula\n    return v.IndexOfAny(new[] { \',\', \'"\', \'\\n\', \'\\r\' }) >= 0\n        ? "\\"" + v.Replace("\\"", "\\"\\"") + "\\""             // cerca e dobra as aspas\n        : v;\n}\n// CsvCampo("Silva, Ana") -> "Silva, Ana"\n// CsvCampo("diz \\"oi\\"")  -> "diz ""oi"""\n// CsvCampo("=1+1")       -> \'=1+1'
          ),
          sl(
            'Excel, PDF e relatórios grandes com LGPD',
            'Para planilhas .xlsx há bibliotecas como ClosedXML e EPPlus; para PDF, QuestPDF e iText, entre outras. Antes de adotar, VERIFIQUE a licença atual de cada uma: algumas têm termos diferentes para uso comercial (o EPPlus, por exemplo, mudou o modelo de licença em versões recentes), e licença muda com o tempo. Relatórios grandes não devem ser gerados dentro da requisição (timeout, memória): o cliente pede, a API responde logo com um identificador, um job gera o arquivo em segundo plano e o usuário recebe um link com EXPIRAÇÃO. Relatórios e exportações costumam concentrar dados pessoais, então aplique a LGPD: minimização (só as colunas necessárias, mascarando o que for possível), controle de acesso (só quem tem permissão baixa o arquivo), expiração e exclusão do arquivo gerado, e auditoria (registrar quem exportou o quê e quando).',
            '// 1) pedir\napp.MapPost("/relatorios", async (FiltroDto f, IFilaRelatorios fila) =>\n{\n    var id = Guid.NewGuid();\n    await fila.EnfileirarAsync(id, f);\n    return Results.Accepted($"/relatorios/{id}");     // 202: vai demorar\n});\n// 2) job gera o arquivo, grava fora de wwwroot e registra a expiração\n// 3) GET /relatorios/{id}: exige login, confere o dono e se não expirou; audita o acesso'
          )
        ]
      },
      questions: [
        mcq('q1', 'O código abaixo grava um upload. Qual é a vulnerabilidade?\nvar caminho = Path.Combine(pasta, arquivo.FileName);\nawait using var f = File.Create(caminho);', 'b', [
          'File.Create não suporta arquivos grandes e trava a thread de leitura',
          'FileName vem do cliente e pode ter ../ (path traversal)',
          'Path.Combine só aceita nomes de arquivo que tenham extensão definida',
          'O arquivo deveria ser gravado dentro de wwwroot, para ser servido'
        ], 'O servidor deve gerar o nome (por exemplo, com Guid) e gravar fora de wwwroot; o nome original do cliente nunca entra no caminho.'),
        mcq('q2', 'Qual a forma mais sólida de confirmar que um upload é mesmo um PNG?', 'd', [
          'Conferir se o FileName termina com ".png" e só então gravar o arquivo',
          'Confiar na propriedade ContentType que o navegador enviou na requisição',
          'Verificar apenas se o tamanho do arquivo é menor que o limite configurado',
          'Lista de extensões permitidas e assinatura mágica (89 50 4E 47)'
        ], 'Extensão e ContentType são declarados pelo cliente. A assinatura nos bytes iniciais, somada à lista de permissão, é bem mais difícil de forjar.'),
        mcq('q3', 'Um relatório em CSV com milhões de linhas e dados de clientes será exportado. Qual abordagem respeita desempenho e LGPD?', 'a', [
          'Job assíncrono, link autenticado e com expiração, colunas mínimas e auditoria',
          'Gerar tudo dentro da requisição e deixar o arquivo em wwwroot com nome previsível',
          'Gerar tudo na requisição e enviar o arquivo por e-mail sem restrição de acesso',
          'Guardar o arquivo para sempre no servidor, evitando gerar o relatório de novo'
        ], 'Trabalho longo vai para um job; o arquivo contém dados pessoais, então exige permissão, expira e é auditado, expondo só o necessário.'),
        fill('q4', 'Complete para gerar um nome de arquivo aleatório no servidor, em vez de usar o nome do cliente.', 'var nome = Guid.___().ToString("N") + ".png";', ['NewGuid'], 'Guid.NewGuid() cria um identificador imprevisível e sem caracteres de caminho, o que evita path traversal e colisões.'),
        mcq('q5', 'Um formulário "fale conosco" monta o assunto do e-mail concatenando texto do usuário. Que ataque isso permite e qual a defesa?', 'c', [
          'SQL injection no assunto do e-mail; usar consultas parametrizadas no envio',
          'XSS refletido na página de resposta; escapar o HTML no navegador do usuário',
          'Injeção de cabeçalho (CR LF); rejeitar quebras de linha e validar a entrada',
          'Path traversal no nome do anexo; gerar o assunto com um Guid aleatório'
        ], 'Quebras de linha no assunto criam novos cabeçalhos. Valide a entrada e deixe a biblioteca montar e codificar a mensagem.'),
        mcq('q6', 'O nome "=HYPERLINK(...)" foi cadastrado por um usuário e vai para uma exportação CSV aberta no Excel. Qual o risco e a mitigação?', 'a', [
          'Vira fórmula; neutralizar valores que começam com =, +, - ou @',
          'O CSV fica corrompido; trocar a vírgula por ponto e vírgula resolve',
          'O Excel sempre bloqueia isso sozinho; nenhum cuidado é necessário',
          'O risco é apenas de codificação; salvar o arquivo em UTF-8 resolve tudo'
        ], 'É a injeção de fórmula em CSV: o texto vindo de usuário precisa ser neutralizado ao exportar, além do escape normal de aspas e vírgulas.'),
        mcq('q7', 'Qual é a linha CSV correta para os campos: Silva, Ana  e  diz "oi"?', 'd', [
          '"Silva, Ana",diz ""oi"""',
          '"Silva, Ana","diz "oi""',
          '"Silva, Ana","diz \\"oi\\""',
          '"Silva, Ana","diz ""oi"""'
        ], 'Campos com vírgula ou aspas vão entre aspas, e cada aspa interna é dobrada.'),
        fill('q8', 'Que atributo limita o tamanho do corpo da requisição de um endpoint de upload?', '[___(2_000_000)]\npublic async Task<IActionResult> Enviar(IFormFile arquivo) { /* ... */ }', ['RequestSizeLimit'], 'RequestSizeLimit define o máximo de bytes aceitos no corpo; o complemento para multipart é RequestFormLimits.')
      ]
    },
    {
      id: 'csi-27-testes-avancados',
      title: 'Testes avançados',
      goal: 'Escrever testes confiáveis: parametrizados, com test doubles, de integração e determinísticos, entendendo os limites da cobertura.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A pirâmide de testes',
            'A pirâmide sugere a proporção ideal: muitos testes de unidade na base (rápidos, isolados, sem rede nem banco), menos testes de integração no meio (vários componentes juntos: API + banco) e poucos testes de ponta a ponta (fluxo completo, geralmente via interface) no topo, porque são lentos e frágeis. Quanto mais alto, mais realista, porém mais caro e mais difícil de diagnosticar uma falha. O objetivo é feedback rápido e confiança proporcional ao custo.'
          ),
          sl(
            'xUnit: Fact, Theory e MemberData',
            '[Fact] é um teste sem parâmetros. [Theory] é um teste parametrizado: roda uma vez para cada conjunto de dados. [InlineData] fornece os valores diretamente no atributo; [MemberData] busca os conjuntos em um membro estático (propriedade ou método), útil para objetos mais complexos. Cada conjunto aparece como um caso separado nos resultados.',
            'public class DescontoTests\n{\n    [Theory]\n    [InlineData(100, 10, 90)]\n    [InlineData(50, 0, 50)]\n    public void Aplica_desconto(int preco, int pct, int esperado)\n        => Assert.Equal(esperado, Desconto.Aplicar(preco, pct));\n\n    public static IEnumerable<object[]> Casos =>\n        new List<object[]> { new object[] { 200, 50, 100 } };\n\n    [Theory]\n    [MemberData(nameof(Casos))]\n    public void Aplica_desconto_membro(int preco, int pct, int esperado)\n        => Assert.Equal(esperado, Desconto.Aplicar(preco, pct));\n}'
          ),
          sl(
            'Test doubles: dummy, stub, fake, mock e spy',
            'Test doubles substituem dependências reais no teste. Dummy: objeto passado só para preencher um parâmetro, nunca usado. Stub: devolve respostas fixas pré-programadas. Fake: implementação funcional simplificada (ex.: repositório em memória). Mock: verifica interações esperadas (o método X foi chamado com Y). Spy: registra o que aconteceu para você inspecionar depois. Bibliotecas como Moq e NSubstitute criam stubs e mocks dinamicamente a partir de interfaces; por isso o código testável depende de interfaces injetadas.',
            '// Stub escrito à mão\nclass RelogioFixo(DateTime agora) : IRelogio\n{\n    public DateTime Agora() => agora;\n}\n\n// Com NSubstitute (visão geral):\n// var relogio = Substitute.For<IRelogio>();\n// relogio.Agora().Returns(new DateTime(2025, 1, 1));'
          ),
          sl(
            'Testes de integração com WebApplicationFactory',
            'WebApplicationFactory<Program> (pacote Microsoft.AspNetCore.Mvc.Testing) sobe sua aplicação em memória e fornece um HttpClient para chamá-la como um cliente real, passando por roteamento, middlewares, binding e serialização — sem abrir portas reais. Para expor o Program a projetos de teste (com top-level statements), declare "public partial class Program { }". Você pode trocar serviços (ex.: o banco) por versões de teste no ConfigureServices da factory.',
            'public class ApiTests : IClassFixture<WebApplicationFactory<Program>>\n{\n    private readonly HttpClient _client;\n    public ApiTests(WebApplicationFactory<Program> factory)\n        => _client = factory.CreateClient();\n\n    [Fact]\n    public async Task Raiz_responde_200()\n    {\n        var resposta = await _client.GetAsync("/");\n        Assert.Equal(System.Net.HttpStatusCode.OK, resposta.StatusCode);\n    }\n}\n\n// Program.cs:  public partial class Program { }'
          ),
          sl(
            'Qual banco usar nos testes?',
            'Provedor em memória do EF Core: rápido, mas não é um banco relacional — não impõe chaves estrangeiras, nem transações, nem tem o mesmo SQL; pode esconder bugs. SQLite em memória: relacional de verdade e leve, mas com diferenças do banco de produção. Testcontainers: sobe o mesmo banco da produção (PostgreSQL, SQL Server) num contêiner Docker durante o teste — o mais fiel, ao custo de mais lentidão e da necessidade de Docker. Escolha conforme o quanto o comportamento do banco importa para o teste.'
          ),
          sl(
            'TDD, determinismo e cobertura',
            'TDD segue o ciclo vermelho-verde-refatorar: escreva um teste que falha (vermelho), faça o mínimo para passar (verde) e melhore o código mantendo os testes verdes. Testes devem ser determinísticos: mesmo resultado sempre. Fontes de não determinismo — relógio (DateTime.Now), aleatoriedade, rede, ordem — devem ser injetadas (IRelogio, TimeProvider, uma semente fixa em Random) para que o teste as controle. Cobertura de código mede quais linhas rodaram, não se os testes verificam algo útil: 100% de cobertura sem asserções boas ainda deixa bugs passarem. Teste comportamento observável, não detalhes de implementação (nomes de métodos privados, ordem interna de chamadas), senão qualquer refatoração quebra os testes. Use sempre dados fictícios, nunca dados reais de pessoas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Segundo a pirâmide de testes, o que deve existir em maior quantidade?', 'd', [
          'Testes de ponta a ponta pela interface',
          'Testes manuais',
          'Testes de integração com banco real',
          'Testes de unidade, rápidos e isolados'
        ], 'A base da pirâmide são testes de unidade: baratos, rápidos e fáceis de diagnosticar.'),
        mcq('q2', 'Qual é a diferença entre [Fact] e [Theory]?', 'c', [
          '[Fact] roda em paralelo e [Theory] não',
          'São idênticos',
          '[Fact] não tem parâmetros; [Theory] roda uma vez para cada conjunto de dados fornecido',
          '[Theory] só funciona com mocks'
        ], 'Theory é o teste parametrizado, alimentado por InlineData, MemberData ou ClassData.'),
        mcq('q3', 'Qual test double devolve respostas fixas pré-programadas para a dependência?', 'b', [
          'Dummy',
          'Stub',
          'Spy',
          'Mock que verifica chamadas'
        ], 'O stub fornece respostas prontas; o mock verifica interações; o spy registra o que ocorreu; o dummy só preenche parâmetros.'),
        fill('q4', 'Complete com o atributo que busca os dados do teste em um membro estático.', '[Theory]\n[___(nameof(Casos))]\npublic void Soma(int a, int b, int esperado) { }', ['MemberData'], 'MemberData referencia uma propriedade ou método estático que devolve os conjuntos de dados.'),
        mcq('q5', 'Para que serve WebApplicationFactory<Program> em testes de integração?', 'a', [
          'Subir a aplicação em memória e obter um HttpClient para chamá-la como um cliente real',
          'Gerar migrations',
          'Substituir o xUnit',
          'Medir a cobertura de código'
        ], 'Ela hospeda o app no processo de teste, percorrendo o pipeline completo sem abrir portas reais.'),
        mcq('q6', 'Qual é a limitação do provedor em memória do EF Core como substituto do banco real?', 'd', [
          'Não aceita async',
          'Não aceita LINQ',
          'É lento demais para testes',
          'Não se comporta como um banco relacional (sem restrições relacionais e SQL real), podendo esconder bugs'
        ], 'Ele não é relacional; comportamentos de FK, transações e tradução SQL diferem do banco de produção.'),
        mcq('q7', 'Como tornar determinístico um teste que depende da data atual?', 'c', [
          'Rodar o teste só ao meio-dia',
          'Usar DateTime.Now e torcer para dar certo',
          'Injetar o relógio (IRelogio/TimeProvider) e usar um valor fixo no teste',
          'Remover as asserções'
        ], 'Dependências não determinísticas são injetadas para que o teste controle o valor devolvido.'),
        fill('q8', 'Complete a terceira fase do ciclo TDD.', 'Ciclo TDD: vermelho -> verde -> ___', ['refatorar', 'refatoração', 'refactor'], 'Depois de passar o teste, melhora-se o código (refatorar) mantendo os testes verdes.')
      ]
    },
    {
      id: 'csi-28-solid-design-patterns',
      title: 'SOLID e padrões de projeto',
      goal: 'Aplicar os princípios SOLID e padrões comuns (Strategy, Decorator, Factory, Builder, Observer) sabendo também quando não usá-los.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'S, O e L',
            'S (Responsabilidade Única): uma classe deve ter um único motivo para mudar — misturar regra de negócio, acesso a banco e envio de e-mail em uma classe só é o contrário disso. O (Aberto/Fechado): o código deve ser aberto para extensão e fechado para modificação — adicionar um comportamento novo sem editar o código existente (por exemplo, novas classes que implementam uma interface em vez de mais um "if" num método gigante). L (Substituição de Liskov): um subtipo deve poder substituir seu tipo base sem quebrar o comportamento esperado; uma subclasse que lança NotSupportedException em um método herdado viola o princípio.',
            '// Viola S: faz tudo\nclass PedidoService\n{\n    public void Fechar(Pedido p) { /* regra + SQL + e-mail */ }\n}\n\n// Viola L: Pinguim não pode voar\nclass Ave { public virtual void Voar() { } }\nclass Pinguim : Ave\n{\n    public override void Voar() => throw new NotSupportedException();\n}'
          ),
          sl(
            'I e D',
            'I (Segregação de Interfaces): clientes não devem ser forçados a depender de métodos que não usam; prefira várias interfaces pequenas e coesas a uma interface enorme. D (Inversão de Dependência): módulos de alto nível não dependem de detalhes de baixo nível; ambos dependem de abstrações. Em vez de uma classe criar new SmtpEmailSender() por dentro, ela recebe um IEmailSender no construtor. A injeção de dependência é a técnica que entrega a implementação concreta.',
            'public interface IEmailSender { Task EnviarAsync(string para, string assunto, string corpo); }\n\npublic class NotificacaoService(IEmailSender email)   // depende da abstração\n{\n    public Task AvisarAsync(string destino) =>\n        email.EnviarAsync(destino, "Pedido enviado", "Seu pedido saiu.");\n}'
          ),
          sl(
            'Repository, Unit of Work e a crítica ao EF Core',
            'Repository abstrai o acesso a dados atrás de uma interface de coleção (IProdutoRepository); Unit of Work agrupa várias operações em uma única confirmação. O problema: o DbContext do EF Core JÁ é um Unit of Work e cada DbSet já é um repositório. Envolver tudo em um repositório genérico muitas vezes só adiciona uma camada que repete o EF Core, esconde recursos (Include, projeções) e dificulta consultas eficientes. Faz sentido quando há necessidade real de isolar a persistência para testes ou trocar de tecnologia, ou repositórios específicos do domínio com consultas nomeadas — mas não por reflexo.'
          ),
          sl(
            'Strategy e Decorator',
            'Strategy: define uma família de algoritmos intercambiáveis atrás de uma interface, escolhendo qual usar em tempo de execução — substitui cadeias de if/switch e atende ao princípio Aberto/Fechado (ex.: formas de calcular frete). Decorator: envolve um objeto que implementa a mesma interface para acrescentar comportamento (logging, cache, retentativas) sem alterar a classe original.',
            'public interface IFrete { decimal Calcular(decimal peso); }\npublic class FreteExpresso : IFrete { public decimal Calcular(decimal peso) => 20m + peso * 2m; }\npublic class FretePadrao  : IFrete { public decimal Calcular(decimal peso) => 8m + peso; }\n\npublic class FreteComLog(IFrete interno, ILogger<FreteComLog> log) : IFrete\n{\n    public decimal Calcular(decimal peso)\n    {\n        var v = interno.Calcular(peso);\n        log.LogInformation("Frete calculado: {Valor}", v);\n        return v;\n    }\n}'
          ),
          sl(
            'Factory, Builder, Observer e Singleton',
            'Factory: centraliza a criação de objetos, escondendo qual classe concreta é instanciada. Builder: monta objetos complexos passo a passo, com interface fluente (o próprio WebApplication.CreateBuilder é um). Observer: um objeto notifica interessados quando algo acontece — em C# são os eventos e delegates. Singleton (uma única instância): em vez de classes com campo estático e acesso global (difíceis de testar e que escondem dependências), registre o serviço com AddSingleton na DI e injete-o; você mantém uma instância única sem acoplamento global.',
            'public class Estoque\n{\n    public event Action<string>? EstoqueBaixo;     // Observer\n    public void Retirar(string sku, int restante)\n    {\n        if (restante < 5) EstoqueBaixo?.Invoke(sku);\n    }\n}\n\nbuilder.Services.AddSingleton<IRelogio, RelogioSistema>();   // singleton via DI'
          ),
          sl(
            'CQRS, mediator e quando NÃO usar padrões',
            'CQRS separa o modelo de comandos (alteram estado) do de consultas (leem dados), permitindo otimizar cada lado; um mediator (como a biblioteca MediatR) desacopla quem envia um pedido de quem o trata. Ambos aumentam a quantidade de classes e a indireção — vale a pena em sistemas complexos, e é exagero num CRUD simples. Padrões resolvem problemas recorrentes; aplicá-los antes de o problema existir gera complexidade desnecessária. Comece simples (YAGNI: "você não vai precisar disso"), refatore quando a dor aparecer.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual princípio é violado por uma classe que valida o pedido, grava no banco e envia e-mail?', 'b', [
          'Liskov (L)',
          'Responsabilidade Única (S)',
          'Segregação de Interfaces (I)',
          'Nenhum'
        ], 'Ela tem várias razões para mudar: regra de negócio, persistência e notificação.'),
        mcq('q2', 'O que a Inversão de Dependência (D) recomenda na prática?', 'c', [
          'Usar apenas classes estáticas',
          'Criar as dependências com new dentro de cada método',
          'Depender de abstrações (interfaces) recebidas por construtor, em vez de instanciar implementações concretas',
          'Evitar interfaces'
        ], 'Alto nível e baixo nível dependem de abstrações; a DI entrega a implementação concreta.'),
        mcq('q3', 'Qual exemplo viola Liskov?', 'a', [
          'Uma subclasse que lança NotSupportedException em um método herdado que o tipo base promete suportar',
          'Uma classe que implementa uma interface',
          'Uma subclasse que adiciona um método novo',
          'Uma classe selada'
        ], 'Quem usa o tipo base não espera que o subtipo quebre o contrato; lançar "não suportado" quebra a substituição.'),
        fill('q4', 'Complete o princípio O (Aberto/Fechado) do SOLID.', 'Aberto para ___, fechado para modificação.', ['extensão', 'extensao', 'extender', 'extensão.'], 'O princípio Aberto/Fechado: acrescentar comportamento criando novos tipos, sem editar o código existente.'),
        mcq('q5', 'Qual padrão envolve um objeto de mesma interface para acrescentar logging ou cache sem alterar a classe original?', 'd', [
          'Factory',
          'Builder',
          'Strategy',
          'Decorator'
        ], 'O Decorator embrulha o objeto e adiciona comportamento mantendo a mesma interface.'),
        mcq('q6', 'Qual é a crítica comum a repositórios genéricos sobre o EF Core?', 'a', [
          'O DbContext já é Unit of Work e DbSet já é repositório; a camada extra pode só repetir e esconder recursos',
          'O EF Core não permite repositórios',
          'Repositórios deixam o código mais rápido sempre',
          'Repositórios impedem testes'
        ], 'Muitas vezes o repositório genérico duplica o EF Core e dificulta Include, projeções e consultas eficientes.'),
        mcq('q7', 'Como obter uma instância única de um serviço sem usar classe estática com acesso global?', 'b', [
          'Criando um campo estático público',
          'Registrando-o com AddSingleton e injetando-o onde necessário',
          'Usando new em cada chamada',
          'Evitando a DI'
        ], 'AddSingleton garante instância única no contêiner, sem acoplamento global e com testabilidade.'),
        fill('q8', 'Complete com a palavra-chave C# usada para implementar o padrão Observer.', 'public ___ Action<string>? EstoqueBaixo;', ['event'], 'Eventos permitem que objetos se inscrevam para ser notificados quando algo ocorre.')
      ]
    },
    {
      id: 'csi-29-arquitetura-aplicacoes',
      title: 'Arquitetura de aplicações',
      goal: 'Organizar uma aplicação .NET em camadas com dependências apontando para dentro, separando domínio, aplicação, infraestrutura e web.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Camadas e a regra de dependência',
            'Arquitetura em camadas separa responsabilidades: apresentação (web/API), lógica de aplicação, domínio (regras de negócio) e infraestrutura (banco, e-mail, serviços externos). A regra de ouro é a direção das dependências: o que é mais estável e importante (o domínio) não deve conhecer o que é volátil (banco, framework web). Se o domínio referencia o EF Core ou o ASP.NET, qualquer troca de tecnologia o contamina e ele fica difícil de testar sem infraestrutura.'
          ),
          sl(
            'Clean Architecture e Onion: dependências para dentro',
            'Clean Architecture e Onion organizam o sistema em círculos concêntricos: no centro, o domínio (entidades e regras); em volta, a aplicação (casos de uso); na borda, infraestrutura e interface web. As dependências de código apontam SEMPRE para dentro: a infraestrutura conhece a aplicação e o domínio, nunca o contrário. O domínio define interfaces (por exemplo, IPedidoRepository) e a infraestrutura as implementa — é a Inversão de Dependência aplicada à arquitetura.',
            '// Domain (sem referências a EF Core nem ASP.NET)\npublic interface IPedidoRepository\n{\n    Task<Pedido?> ObterAsync(int id, CancellationToken ct);\n    Task AdicionarAsync(Pedido pedido, CancellationToken ct);\n}\n\n// Infrastructure implementa a interface usando EF Core\npublic class PedidoRepository(LojaContext db) : IPedidoRepository\n{\n    public Task<Pedido?> ObterAsync(int id, CancellationToken ct) =>\n        db.Pedidos.FirstOrDefaultAsync(p => p.Id == id, ct);\n    public async Task AdicionarAsync(Pedido pedido, CancellationToken ct)\n    {\n        db.Pedidos.Add(pedido);\n        await db.SaveChangesAsync(ct);\n    }\n}'
          ),
          sl(
            'Estrutura de solução',
            'Uma solução (.sln) agrupa vários projetos. Uma divisão comum: Loja.Domain (entidades, regras, interfaces), Loja.Application (casos de uso, DTOs), Loja.Infrastructure (EF Core, e-mail, HTTP externo) e Loja.Web (API/Blazor, o ponto de entrada que monta tudo na DI), mais projetos de testes. As referências entre projetos impõem a regra: Domain não referencia ninguém; Application referencia Domain; Infrastructure referencia Application/Domain; Web referencia todos para compor. O compilador passa a barrar dependências proibidas.',
            'dotnet new sln -n Loja\ndotnet new classlib -n Loja.Domain\ndotnet new classlib -n Loja.Application\ndotnet add Loja.Application reference Loja.Domain'
          ),
          sl(
            'Vertical slices e monolito modular',
            'Organizar por camada técnica (Controllers, Services, Repositories) espalha uma única funcionalidade por muitas pastas. Vertical slices organizam por funcionalidade: tudo de "Criar Pedido" (endpoint, validação, handler, DTOs) fica junto, reduzindo o salto entre pastas. Monolito modular é um único deploy dividido em módulos com fronteiras claras (cada um dono de seus dados e com API pública interna): oferece muito da organização dos microsserviços sem o custo operacional da distribuição, e permite extrair um módulo depois, se necessário.'
          ),
          sl(
            'DTOs, mapeamento e validação',
            'Entre camadas e na fronteira da API, converta entidades em DTOs. Mapear à mão (um método ou construtor) é explícito, rápido e fácil de depurar; AutoMapper automatiza por convenção, mas esconde erros que só aparecem em tempo de execução — use com cautela. Para validação mais rica que DataAnnotations, FluentValidation permite escrever regras em classes dedicadas e testáveis. Valide na borda (entrada) e proteja as invariantes do domínio (um Pedido não deve existir com quantidade negativa).',
            'public record PedidoDto(int Id, string Cliente, decimal Total);\n\npublic static class PedidoMapeamento\n{\n    public static PedidoDto ParaDto(this Pedido p) =>\n        new(p.Id, p.Cliente.Nome, p.Itens.Sum(i => i.Quantidade * i.PrecoUnitario));\n}'
          ),
          sl(
            'Erros como Result',
            'Exceções são caras e podem esconder o fluxo quando usadas para situações esperadas (e-mail já existe, estoque insuficiente). O padrão Result representa sucesso ou falha como um VALOR retornado: o chamador é forçado a tratar os dois caminhos, e a camada web converte falhas em 404/409/422. Reserve exceções para situações realmente excepcionais (falha de infraestrutura, bug). Há bibliotecas prontas, mas um tipo simples já resolve.',
            'public record Resultado<T>(bool Sucesso, T? Valor, string? Erro)\n{\n    public static Resultado<T> Ok(T valor) => new(true, valor, null);\n    public static Resultado<T> Falha(string erro) => new(false, default, erro);\n}\n\nResultado<PedidoDto> r = servico.Criar(dto);\nreturn r.Sucesso ? Results.Created("/pedidos/1", r.Valor) : Results.UnprocessableEntity(r.Erro);'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na Clean Architecture, para onde apontam as dependências de código?', 'c', [
          'Para fora, do domínio para a infraestrutura',
          'Em todas as direções',
          'Para dentro: a infraestrutura depende de aplicação/domínio, e o domínio não depende dela',
          'Para o banco de dados'
        ], 'O núcleo (domínio) não conhece detalhes externos; as camadas externas dependem das internas.'),
        mcq('q2', 'Qual projeto NÃO deveria referenciar o EF Core numa arquitetura limpa?', 'a', [
          'Domain',
          'Infrastructure',
          'O projeto de testes de integração',
          'O projeto host que compõe a DI'
        ], 'O domínio deve ser independente de frameworks de persistência; quem usa EF Core é a infraestrutura.'),
        mcq('q3', 'Qual é a ideia dos vertical slices?', 'b', [
          'Separar o sistema só por camadas técnicas',
          'Agrupar por funcionalidade: tudo de um caso de uso fica junto',
          'Usar um único arquivo para a aplicação inteira',
          'Eliminar testes'
        ], 'Em vez de pastas por tipo técnico, cada funcionalidade reúne endpoint, validação e lógica.'),
        fill('q4', 'Complete com a pasta/projeto onde ficam as implementações de acesso a banco, e-mail e serviços externos.', 'Loja.Domain, Loja.Application, Loja.___, Loja.Web', ['Infrastructure'], 'Infrastructure contém os detalhes técnicos que implementam as interfaces definidas nas camadas internas.'),
        mcq('q5', 'Qual é a vantagem do monolito modular?', 'd', [
          'Exige um servidor por módulo',
          'Elimina qualquer fronteira entre módulos',
          'Impede a evolução futura',
          'Um único deploy com fronteiras claras entre módulos, com menos custo operacional que microsserviços'
        ], 'Dá organização e isolamento sem os custos de rede, observabilidade e deploy distribuídos.'),
        mcq('q6', 'Qual é um cuidado ao usar AutoMapper?', 'c', [
          'Ele não funciona com records',
          'Ele impede o uso de DTOs',
          'O mapeamento por convenção esconde erros que só aparecem em execução; mapear à mão é mais explícito',
          'Ele exige banco SQL Server'
        ], 'A convenção automática economiza código, mas pode falhar silenciosamente; mapeamento manual é explícito e depurável.'),
        mcq('q7', 'Em que situação o padrão Result é mais adequado que lançar exceção?', 'a', [
          'Falhas esperadas de regra de negócio, como "estoque insuficiente"',
          'Queda do servidor de banco de dados',
          'Bugs de programação',
          'Falta de memória'
        ], 'Falhas esperadas são parte do fluxo normal e devem ser tratadas como valor; exceções ficam para o excepcional.'),
        fill('q8', 'Complete com o projeto que Application referencia (dependência apontando para dentro).', 'dotnet add Loja.Application reference Loja.___', ['Domain'], 'Application referencia Domain (para dentro); o contrário seria uma dependência proibida.')
      ]
    },
    {
      id: 'csi-47-bibliotecas-ecossistema',
      title: 'Bibliotecas do ecossistema: Serilog, FluentValidation, mapeamento e dados de teste',
      goal: 'Usar Serilog, FluentValidation, mapeamento e geradores de dados fictícios com critério, evitando vazar dados pessoais em logs e medindo o custo de cada dependência.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Serilog: logs estruturados',
            'O ILogger do .NET aceita provedores plugáveis, e o Serilog é um dos mais usados. Sua ideia central é o log ESTRUTURADO: a mensagem é um modelo (template) com campos nomeados entre chaves, e cada valor é guardado como dado, não como texto colado. Assim o log pode ser consultado por campo ("todos os erros do PedidoId 42"). Por isso escreva Log.Information("Pedido {PedidoId} pago", id), e NÃO uma string interpolada ($"Pedido {id} pago"), que vira só texto e perde a estrutura. Os destinos de saída são os sinks (Console, arquivo, um servidor de logs), e o enriquecimento (Enrich) acrescenta propriedades automáticas a todo evento, como nome da máquina, ambiente ou o contexto da requisição (FromLogContext).',
            'Log.Logger = new LoggerConfiguration()\n    .MinimumLevel.Information()\n    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning) // menos ruído do framework\n    .Enrich.FromLogContext()\n    .WriteTo.Console()\n    .CreateLogger();\n\nLog.Information("Pedido {PedidoId} pago, total {Total}", 42, 99.9m);\n// [12:00:00 INF] Pedido 42 pago, total 99.9\n\n// ASP.NET Core: troca o provedor, o código continua usando ILogger\nbuilder.Host.UseSerilog();'
          ),
          sl(
            'Risco: logar objetos inteiros com dados pessoais',
            'Com o operador @ no template, o Serilog DESESTRUTURA o objeto: grava todas as suas propriedades. Log.Information("Novo cliente {@Cliente}", cliente) grava nome, e-mail, documento, endereço... no log, que é copiado, retido por muito tempo e lido por muita gente (e fere o princípio da minimização da LGPD). Sem @, o objeto vira texto via ToString(); com $, força texto. Defesas: registre apenas identificadores ("Novo cliente {ClienteId}"); defina políticas de desestruturação que reduzam o tipo só aos campos seguros (Destructure.ByTransforming) ou marquem campos como não logáveis; mascare o que for inevitável; e defina níveis diferentes por ambiente (Debug em desenvolvimento, Information ou Warning em produção), carregados do appsettings de cada ambiente com ReadFrom.Configuration.',
            'public record Cliente(string Id, string Nome, string Email);\n\n// RUIM: grava Nome e Email no log\nLog.Information("Novo cliente {@Cliente}", cliente);\n\n// BOM: só o identificador\nLog.Information("Novo cliente {ClienteId}", cliente.Id);\n\n// BOM: política que reduz o tipo ao campo seguro\nLog.Logger = new LoggerConfiguration()\n    .Destructure.ByTransforming<Cliente>(c => new { c.Id })\n    .WriteTo.Console().CreateLogger();\nLog.Information("Novo cliente {@Cliente}", cliente);   // Novo cliente {"Id": "1"}'
          ),
          sl(
            'FluentValidation: regras declarativas',
            'DataAnnotations ([Required], [Range]) colocam as regras como atributos no próprio modelo: simples para casos pequenos, mas limitadas para regras condicionais, que dependem de vários campos ou de serviços. O FluentValidation separa as regras em uma classe validadora por DTO (AbstractValidator<T>), escritas de forma fluente e legível, fáceis de testar sozinhas e de reutilizar. Cada RuleFor escolhe uma propriedade e encadeia validações (NotEmpty, GreaterThan, EmailAddress, MaximumLength...), com mensagem própria em WithMessage. O resultado de Validate/ValidateAsync tem IsValid e a lista Errors. Em minimal APIs ou controllers, o padrão é registrar o validador no DI e chamá-lo no endpoint (ou usar um filtro) devolvendo 400 com os erros. Lembre: validar a entrada no servidor continua obrigatório.',
            'public record CriarPedidoDto(string Nome, int Quantidade);\n\npublic class CriarPedidoValidator : AbstractValidator<CriarPedidoDto>\n{\n    public CriarPedidoValidator()\n    {\n        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome obrigatório");\n        RuleFor(x => x.Quantidade).GreaterThan(0)\n            .WithMessage("Quantidade deve ser maior que zero");\n    }\n}\n\nvar r = await new CriarPedidoValidator().ValidateAsync(new CriarPedidoDto("", 0));\nConsole.WriteLine(r.IsValid);   // False\n// r.Errors: "Nome obrigatório", "Quantidade deve ser maior que zero"'
          ),
          sl(
            'Mapeamento objeto para objeto e mediator',
            'Quase toda API converte entidades em DTOs. Há três caminhos. Manual: um método (ou construtor/extension) que copia campo a campo; é verboso, mas explícito, rápido e o compilador acusa campo renomeado. Bibliotecas baseadas em reflexão (como o AutoMapper) descobrem os campos em tempo de execução por convenção: menos código, mas erros só aparecem na execução, é mais difícil depurar e há custo de desempenho. Bibliotecas que GERAM código em tempo de compilação (como o Mapster com geração de código, ou geradores de fonte) unem concisão e velocidade. Troca de licenciamento e manutenção acontece: VERIFIQUE a licença e o estado atual de cada biblioteca antes de adotar. O padrão mediator (MediatR é a mais conhecida) encaminha "comandos" e "consultas" a handlers por um objeto central, reduzindo acoplamento entre controllers e lógica; também confirme o licenciamento atual e avalie se a indireção compensa, pois em projetos pequenos ela só esconde o fluxo.',
            '// Mapeamento manual: simples, explícito, o compilador ajuda\npublic record PedidoDto(int Id, decimal Total);\n\npublic static class PedidoMapeamento\n{\n    public static PedidoDto ParaDto(this Pedido p) => new(p.Id, p.Total);\n}\n\nvar dtos = pedidos.Select(p => p.ParaDto()).ToList();\n\n// Mediator (visão geral): o endpoint não conhece o handler\n// var id = await mediador.Send(new CriarPedido(dto));'
          ),
          sl(
            'Dados de teste: Bogus e AutoFixture; registro por convenção',
            'Testes precisam de dados, e a LGPD proíbe a prática de copiar dados reais de produção para desenvolvimento, teste ou homologação: o ambiente de teste tem controles mais frouxos e vira fonte de vazamento. Use dados FICTÍCIOS gerados. O Bogus cria objetos com valores falsos e plausíveis (nomes, e-mails de exemplo, datas), com cultura própria (por exemplo "pt_BR") e semente fixa (UseSeed) para resultados reproduzíveis. O AutoFixture preenche automaticamente objetos de qualquer tipo com valores arbitrários, ideal para testes em que os valores não importam. Já o Scrutor acrescenta ao contêiner de DI o registro por convenção: em vez de registrar cada serviço, você varre uma assembly e registra as classes que seguem uma regra (por exemplo, todas as que implementam uma interface), reduzindo código repetitivo, mas escondendo o que está registrado.',
            'var faker = new Faker<Cliente>("pt_BR")\n    .UseSeed(1)                                  // mesma sequência a cada execução\n    .CustomInstantiator(f => new Cliente(\n        f.Random.Guid().ToString(),\n        f.Name.FullName(),                      // nome fictício\n        f.Internet.ExampleEmail()));            // domínio de exemplo\nvar clientes = faker.Generate(5);\n\n// Scrutor (visão geral)\nservices.Scan(s => s.FromAssemblyOf<Program>()\n    .AddClasses(c => c.Where(t => t.Name.EndsWith("Servico")))\n    .AsImplementedInterfaces()\n    .WithScopedLifetime());'
          ),
          sl(
            'Como escolher uma biblioteca e o custo de uma dependência',
            'Cada pacote que você adiciona vira código de terceiros rodando com os privilégios da sua aplicação, e uma obrigação futura: atualizar, corrigir, trocar. Antes de adotar, avalie: manutenção (data do último lançamento, atividade dos mantenedores, issues respondidas); licença (permite o seu uso, inclusive comercial? mudou recentemente?); vulnerabilidades conhecidas (histórico de CVEs e se alertas do NuGet, ou de um verificador de dependências, aparecem); popularidade e comunidade (existem respostas, exemplos, alternativas?); tamanho e dependências transitivas (quanto ela arrasta consigo?); e se o problema não se resolve com poucas linhas suas ou com a biblioteca padrão. Uma dependência pequena e fácil de substituir é barata; uma que permeia o código todo (um mediator em cada handler) é cara de remover, então isole-a atrás de uma interface sua quando fizer sentido.',
            '// Verificar o que o projeto já arrasta e se há problemas conhecidos\n// dotnet list package --outdated\n// dotnet list package --vulnerable --include-transitive\n// dotnet list package --deprecated'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que escrever Log.Information("Pedido {PedidoId} pago", id) é melhor que Log.Information($"Pedido {id} pago")?', 'b', [
          'A versão com chaves roda numa thread separada e nunca bloqueia a própria requisição',
          'O modelo guarda PedidoId como campo consultável; a interpolação vira só texto',
          'A interpolação de strings não compila quando o Serilog está configurado',
          'Com chaves o log nunca é gravado em arquivo, só no console do processo'
        ], 'O template preserva a estrutura: cada campo vira dado que pode ser filtrado nos sinks. A string interpolada perde essa informação.'),
        mcq('q2', 'O que há de errado em Log.Information("Novo cliente {@Cliente}", cliente) quando Cliente tem nome, e-mail e documento?', 'a', [
          'O @ grava todas as propriedades, enviando dados pessoais ao log',
          'O operador @ criptografa o objeto inteiro e impede qualquer consulta no log',
          'O Serilog recusa objetos que não tenham um ToString sobrescrito pela classe',
          'Nada: o Serilog reconhece e mascara dados pessoais automaticamente em todo log'
        ], 'O @ desestrutura o objeto inteiro. Registre só o identificador ou reduza o tipo com uma política (Destructure.ByTransforming).'),
        mcq('q3', 'O que o trecho faz?\nRuleFor(x => x.Quantidade).GreaterThan(0).WithMessage("Quantidade inválida");', 'd', [
          'Define a Quantidade como 0 sempre que ela chegar nula na requisição',
          'Registra o campo Quantidade como obrigatório e não nulo no banco de dados',
          'Lança uma exceção sempre que um objeto com Quantidade é criado na memória',
          'Exige Quantidade maior que 0 e usa "Quantidade inválida" como mensagem'
        ], 'Em um AbstractValidator, RuleFor escolhe a propriedade e encadeia validações; WithMessage define o texto do erro.'),
        fill('q4', 'Complete a regra para exigir que o Nome não seja vazio nem nulo.', 'RuleFor(x => x.Nome).___();', ['NotEmpty'], 'NotEmpty falha para null, string vazia e, no caso de strings, também para texto só com espaços.'),
        mcq('q5', 'Qual a principal desvantagem de um mapeador baseado em reflexão em relação ao mapeamento manual?', 'c', [
          'Ele não consegue copiar propriedades entre tipos com nomes diferentes',
          'Ele exige que todos os objetos sejam serializados em JSON antes do mapeamento',
          'Erros (campo renomeado) só aparecem na execução, e depurar é mais difícil',
          'Ele só funciona com tipos de valor, nunca com classes comuns'
        ], 'No mapeamento manual o compilador acusa o campo inexistente. Na reflexão por convenção, a falha pode aparecer só em produção.'),
        mcq('q6', 'Qual a conduta correta para obter dados para testes de um sistema com clientes reais?', 'd', [
          'Copiar o banco de produção e apagar apenas a coluna de senhas',
          'Copiar a produção para homologação, pois o acesso é restrito à equipe',
          'Usar os dados de produção apenas em testes manuais na máquina do desenvolvedor',
          'Gerar dados fictícios com Bogus ou AutoFixture, sem dados reais'
        ], 'Ambientes de teste têm menos controles; dados pessoais reais ali ampliam o risco de vazamento. Dados gerados eliminam esse risco.'),
        mcq('q7', 'Antes de adicionar um pacote NuGet novo, qual conjunto de verificações faz mais sentido?', 'a', [
          'Manutenção, licença, vulnerabilidades e dependências que ele arrasta',
          'Apenas o número de downloads, o nome do autor e as estrelas do repositório',
          'Apenas se o exemplo do README compila na sua máquina e no servidor de CI',
          'Apenas o tamanho do arquivo .nupkg e a data de criação do pacote'
        ], 'Popularidade ajuda, mas não basta: licença, manutenção, segurança e custo da dependência definem o risco a longo prazo.'),
        fill('q8', 'Que chamada, em builder.Host, troca o provedor de logging padrão pelo Serilog?', 'builder.Host.___();', ['UseSerilog'], 'UseSerilog() liga o Serilog ao ILogger do host, então o código existente continua usando ILogger.')
      ]
    },
    {
      id: 'csi-30-caching-performance-basica',
      title: 'Cache e desempenho básico',
      goal: 'Usar cache em memória e distribuído com expiração e invalidação, e otimizar com medição, evitando vazar dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'IMemoryCache',
            'Cache guarda o resultado de uma operação cara para reaproveitá-lo. IMemoryCache armazena objetos na memória do próprio processo: rapidíssimo, mas local — cada instância da aplicação tem o seu cache e ele some quando o processo reinicia. Registre com builder.Services.AddMemoryCache() e use GetOrCreateAsync: devolve o valor em cache ou executa a fábrica, guarda e devolve.',
            'public class CatalogoService(IMemoryCache cache, LojaContext db)\n{\n    public Task<List<Categoria>?> ListarAsync() =>\n        cache.GetOrCreateAsync("categorias", async entry =>\n        {\n            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);\n            return await db.Categorias.AsNoTracking().ToListAsync();\n        });\n}'
          ),
          sl(
            'Expiração absoluta e deslizante',
            'Expiração absoluta: a entrada vence num prazo fixo após ser criada, não importa quantas vezes seja lida — garante que os dados nunca fiquem mais velhos que o prazo. Expiração deslizante (sliding): o prazo é renovado a cada acesso; itens usados com frequência permanecem, mas um item muito acessado pode nunca expirar e ficar desatualizado para sempre. Por isso é comum combinar as duas: deslizante para descartar o que ninguém usa e absoluta como teto de idade.',
            'entry.SlidingExpiration = TimeSpan.FromMinutes(2);\nentry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);'
          ),
          sl(
            'Invalidação: o problema difícil',
            'Quando o dado muda na origem, o cache pode continuar entregando o valor antigo. Estratégias: expiração curta (aceitando algum atraso), remover a chave ao alterar o dado (cache.Remove("categorias") depois de salvar) ou versionar a chave. Não existe solução perfeita: é um equilíbrio entre frescor dos dados, desempenho e complexidade. Só faça cache de dados que toleram algum atraso.',
            'await db.SaveChangesAsync();\ncache.Remove("categorias");   // próxima leitura recarrega do banco'
          ),
          sl(
            'Cache distribuído e Redis',
            'IDistributedCache é a abstração para um cache compartilhado entre várias instâncias da aplicação, com provedores como Redis ou SQL Server. Vantagens: todas as instâncias veem os mesmos dados e o cache sobrevive a reinícios do app. Custos: chamada de rede a cada acesso e valores serializados (bytes ou string). Use quando há mais de uma instância e coerência importa; para uma instância e dados pequenos, IMemoryCache basta.'
          ),
          sl(
            'Response caching, output caching e compressão',
            'Response caching segue cabeçalhos HTTP (Cache-Control) para que navegadores e proxies reutilizem respostas. Output caching guarda respostas NO SERVIDOR e permite políticas e invalidação por tags. Compressão de resposta (AddResponseCompression/UseResponseCompression) reduz o tamanho do tráfego de texto (JSON, HTML) ao custo de CPU. Cuidado: respostas por usuário ou autenticadas não devem ir para caches compartilhados — poderiam ser entregues à pessoa errada.'
          ),
          sl(
            'Medir antes de otimizar e boas práticas',
            'Otimização prematura desperdiça tempo e complica o código: meça primeiro (logs de tempo, métricas, profilers) para achar o gargalo real. BenchmarkDotNet é a biblioteca padrão para microbenchmarks confiáveis, que cuidam de aquecimento e estatística. Ganhos frequentes e baratos: async de ponta a ponta (não bloquear threads com .Result/.Wait()), paginação, projeções com Select que trazem só as colunas necessárias, AsNoTracking em leituras e índices. Privacidade: dados pessoais ou específicos de um usuário não devem ser cacheados sob chave compartilhada; se necessário, inclua o identificador do usuário na chave, use prazos curtos e lembre que o cache também é um armazenamento de dados pessoais sujeito à LGPD.',
            '// ERRADO: bloqueia a thread esperando uma Task\nvar lista = servico.ListarAsync().Result;\n\n// CERTO: async até o fim\nvar lista2 = await servico.ListarAsync();'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é uma característica do IMemoryCache?', 'd', [
          'É compartilhado entre todas as instâncias do app',
          'Sobrevive à reinicialização do processo',
          'Sempre usa Redis',
          'É local ao processo: rápido, mas perdido ao reiniciar e não compartilhado entre instâncias'
        ], 'O cache em memória vive no processo; para compartilhar entre instâncias use um cache distribuído.'),
        mcq('q2', 'Qual é o risco de usar APENAS expiração deslizante?', 'a', [
          'Um item muito acessado pode nunca expirar e ficar desatualizado',
          'O item expira na primeira leitura',
          'O cache fica sem espaço imediatamente',
          'A expiração deslizante é proibida'
        ], 'Cada acesso renova o prazo; por isso se combina com uma expiração absoluta como teto.'),
        mcq('q3', 'Por que a invalidação de cache é considerada difícil?', 'c', [
          'Porque o .NET não permite remover chaves',
          'Porque caches não têm expiração',
          'Porque é preciso decidir como e quando descartar dados que mudaram na origem, equilibrando frescor e desempenho',
          'Porque só existe invalidação manual'
        ], 'Se não invalidar, entrega-se dado velho; se invalidar demais, perde-se o benefício do cache.'),
        fill('q4', 'Complete com o método que descarta uma chave do cache após alterar os dados na origem.', 'await db.SaveChangesAsync();\ncache.___("categorias");', ['Remove'], 'Remove força a próxima leitura a recarregar o dado atualizado da origem.'),
        mcq('q5', 'Quando o IDistributedCache (por exemplo, com Redis) é preferível ao IMemoryCache?', 'b', [
          'Quando há uma única instância e dados minúsculos',
          'Quando várias instâncias precisam compartilhar o mesmo cache e ele deve sobreviver a reinícios',
          'Quando se quer evitar qualquer chamada de rede',
          'Quando não há dados para guardar'
        ], 'O distribuído é compartilhado e persistente além do processo, ao custo de latência de rede e serialização.'),
        mcq('q6', 'Qual cuidado vale para respostas HTTP específicas de um usuário autenticado?', 'c', [
          'Colocá-las em cache compartilhado por longos períodos',
          'Compactá-las para cache público',
          'Não colocá-las em um cache compartilhado sob chave comum, para não entregar dados a outra pessoa',
          'Removê-las do cabeçalho'
        ], 'Cachear conteúdo pessoal sob chave comum pode vazar dados (e fere a LGPD); inclua o usuário na chave ou não cacheie.'),
        mcq('q7', 'O que há de errado em "var lista = servico.ListarAsync().Result;" dentro de um endpoint?', 'd', [
          'Nada, é a forma recomendada',
          'Result só funciona com string',
          'Impede a compilação',
          'Bloqueia uma thread esperando a Task, prejudicando a escalabilidade; o correto é await'
        ], 'Bloquear em tarefas assíncronas desperdiça threads e pode causar deadlocks; use async de ponta a ponta.'),
        fill('q8', 'Complete com a biblioteca padrão para microbenchmarks em .NET.', 'dotnet add package ___', ['BenchmarkDotNet'], 'BenchmarkDotNet mede código com aquecimento e estatística, evitando conclusões erradas de medições ingênuas.')
      ]
    },
    {
      id: 'csi-31-mensageria-filas',
      title: 'Mensageria e filas',
      goal: 'Desacoplar componentes com filas e tópicos, lidando com entrega pelo menos uma vez, idempotência, dead-letter e dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que desacoplar com mensagens',
            'Em vez de um serviço chamar outro de forma síncrona e esperar, ele publica uma MENSAGEM em um intermediário (broker) e segue em frente; outro serviço a consome quando puder. Benefícios: o produtor não fica lento nem falha se o consumidor estiver fora do ar, picos de carga são absorvidos pela fila, e dá para escalar consumidores independentemente. Custos: consistência eventual (o efeito não é imediato) e mais complexidade operacional e de depuração.'
          ),
          sl(
            'Fila versus tópico; produtor e consumidor',
            'Fila (queue): cada mensagem é entregue a UM consumidor entre vários competindo pela fila — distribui trabalho. Tópico (publish/subscribe): cada mensagem é entregue a TODOS os assinantes interessados (cada assinante tem sua própria cópia) — distribui eventos ("PedidoCriado"). O produtor publica; o consumidor processa e confirma (ack) ao terminar. RabbitMQ, Azure Service Bus e Kafka são brokers conhecidos: os dois primeiros são brokers de mensagens com filas/tópicos; o Kafka é um log distribuído de eventos, que retém mensagens para releitura.'
          ),
          sl(
            'Entrega pelo menos uma vez e idempotência',
            'Brokers costumam garantir entrega "pelo menos uma vez" (at-least-once): se o consumidor processa mas falha antes de confirmar, a mensagem é reentregue — então ela PODE chegar duplicada. Por isso o consumidor deve ser idempotente: processar a mesma mensagem duas vezes tem o mesmo efeito que uma. Técnica comum: cada mensagem carrega um identificador único (MessageId); o consumidor registra os ids já processados (numa tabela com chave única) e ignora repetidos.',
            'public async Task TratarAsync(PedidoCriado msg, CancellationToken ct)\n{\n    if (await db.Processadas.AnyAsync(p => p.MensagemId == msg.MensagemId, ct))\n        return;                                   // duplicada: ignora\n\n    // ... efeito colateral (reservar estoque) ...\n    db.Processadas.Add(new Processada { MensagemId = msg.MensagemId });\n    await db.SaveChangesAsync(ct);\n}'
          ),
          sl(
            'Retentativas, dead-letter e ordem',
            'Quando o processamento falha, o broker reentrega, geralmente com limite de tentativas e espera crescente. Mensagens que continuam falhando (as "venenosas", por exemplo com formato inválido) vão para a dead-letter queue (DLQ): uma fila separada onde ficam para análise, sem travar as demais. Monitore a DLQ. Ordem: com vários consumidores concorrentes e retentativas, a ordem global NÃO é garantida; se a ordem importar, particione por chave (por exemplo, pelo id do pedido) ou projete o consumidor para tolerar mensagens fora de ordem.'
          ),
          sl(
            'MassTransit e o padrão outbox',
            'MassTransit é uma biblioteca .NET que abstrai brokers (RabbitMQ, Azure Service Bus, memória), com consumidores tipados, retentativas e DLQ prontos. Problema clássico: gravar no banco E publicar a mensagem são duas operações; se uma falhar, o sistema fica inconsistente. O padrão outbox grava a mensagem em uma tabela do MESMO banco, na mesma transação da alteração de dados; um processo separado lê a tabela e publica no broker, garantindo que nenhuma mensagem se perca (ao custo de possíveis duplicatas — mais um motivo para idempotência).'
          ),
          sl(
            'Serialização e dados pessoais nas mensagens',
            'Mensagens trafegam como bytes; o formato mais comum é JSON. Defina contratos explícitos e versionados (records) e tolere campos novos para que produtores e consumidores evoluam separadamente. Privacidade: mensagens são armazenadas em filas, DLQs, logs e backups. Aplique minimização — envie identificadores (PedidoId) em vez de dados pessoais completos, e deixe o consumidor buscar o necessário com autorização —, proteja o broker com autenticação e TLS, defina retenção curta e evite registrar o conteúdo das mensagens nos logs.',
            'public record PedidoCriado(Guid MensagemId, int PedidoId, DateTime CriadoEmUtc);\n// bom: carrega ids, não nome/endereço/documento do cliente'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre fila e tópico?', 'a', [
          'Na fila a mensagem vai a um único consumidor; no tópico, a todos os assinantes',
          'Na fila a mensagem vai a todos; no tópico, a um só',
          'São sinônimos',
          'Fila é só para texto e tópico só para binário'
        ], 'Fila distribui trabalho entre consumidores concorrentes; tópico faz publish/subscribe.'),
        mcq('q2', 'O que significa entrega "pelo menos uma vez" para o consumidor?', 'd', [
          'A mensagem nunca é duplicada',
          'A mensagem é entregue no máximo uma vez',
          'A mensagem pode ser perdida',
          'A mensagem pode ser reentregue e chegar duplicada, então o consumidor deve ser idempotente'
        ], 'Se a confirmação falha, o broker reentrega; o tratamento precisa suportar duplicatas.'),
        mcq('q3', 'Qual técnica torna um consumidor idempotente?', 'c', [
          'Ignorar erros',
          'Processar mais rápido',
          'Registrar o id único das mensagens já processadas e ignorar repetidas',
          'Aumentar o número de consumidores'
        ], 'Com uma tabela de ids processados (chave única), a mesma mensagem não gera o efeito duas vezes.'),
        fill('q4', 'A sigla DLQ nomeia a fila onde ficam as mensagens que falharam repetidamente. Complete o nome.', 'DLQ = ___-letter queue', ['dead'], 'A dead-letter queue isola mensagens problemáticas sem travar o processamento das demais.'),
        mcq('q5', 'Que problema o padrão outbox resolve?', 'b', [
          'A lentidão da rede',
          'A inconsistência entre gravar no banco e publicar a mensagem, que são duas operações separadas',
          'A falta de índices',
          'A compressão de mensagens'
        ], 'A mensagem é gravada na mesma transação da alteração e publicada depois por outro processo, sem se perder.'),
        mcq('q6', 'Com vários consumidores concorrentes e retentativas, o que se pode afirmar sobre a ordem?', 'a', [
          'A ordem global não é garantida; é preciso particionar por chave ou tolerar mensagens fora de ordem',
          'A ordem é sempre garantida',
          'A ordem só importa em tópicos',
          'A DLQ restaura a ordem'
        ], 'Concorrência e reentrega alteram a ordem de processamento; garantias de ordem exigem desenho específico.'),
        mcq('q7', 'Qual prática é mais adequada quanto a dados pessoais em mensagens?', 'd', [
          'Enviar o cadastro completo do cliente em toda mensagem',
          'Registrar o conteúdo completo das mensagens nos logs',
          'Guardar mensagens na fila indefinidamente',
          'Enviar identificadores em vez de dados pessoais completos, proteger o broker (TLS e autenticação) e reduzir a retenção'
        ], 'Minimização, proteção do broker e retenção curta reduzem o risco, já que filas e DLQs armazenam o conteúdo.'),
        fill('q8', 'Complete com a sigla da confirmação que o consumidor envia ao broker ao terminar de processar.', 'O consumidor envia um ___ (acknowledgement) ao broker.', ['ack'], 'O ack informa ao broker que a mensagem foi processada e pode ser removida da fila.')
      ]
    },
    {
      id: 'csi-32-blazor',
      title: 'Blazor',
      goal: 'Criar interfaces web em C# com componentes Razor, binding, eventos, formulários validados e entender os modos de renderização e o XSS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Componentes Razor',
            'Blazor permite construir interfaces web interativas com C# em vez de JavaScript. A unidade básica é o componente: um arquivo .razor que mistura marcação HTML com código C#. Expressões C# entram na marcação com @ (por exemplo @contagem); blocos de código ficam em @code { ... }. Componentes podem ser reutilizados como tags (<Contador />), formando a árvore da interface.',
            '<h3>Contador</h3>\n<p>Cliques: @contagem</p>\n<button @onclick="Incrementar">Clicar</button>\n\n@code {\n    private int contagem;\n    private void Incrementar() => contagem++;\n}'
          ),
          sl(
            'Parâmetros, @bind e eventos',
            'Um componente recebe dados do pai por propriedades marcadas com [Parameter]: <Saudacao Nome="Ana" />. @bind liga um campo da interface a uma variável nos dois sentidos (digitar atualiza a variável e vice-versa). Eventos usam @onclick, @onchange, @oninput etc., apontando para um método ou lambda. Depois que um evento do componente roda, o Blazor re-renderiza o que mudou automaticamente.',
            '<input @bind="nome" />\n<p>Olá, @nome</p>\n\n@code {\n    private string nome = "";\n\n    [Parameter] public string Titulo { get; set; } = "";\n}'
          ),
          sl(
            'Ciclo de vida, DI e roteamento',
            'O ciclo de vida oferece métodos virtuais: OnInitialized/OnInitializedAsync (uma vez, quando o componente é criado — lugar típico para carregar dados), OnParametersSet (quando parâmetros mudam) e OnAfterRender. @inject recebe serviços da DI no componente, e @page define a rota que exibe o componente como página.',
            '@page "/produtos"\n@inject HttpClient Http\n\n<h3>Produtos</h3>\n@if (itens is null)\n{\n    <p>Carregando...</p>\n}\nelse\n{\n    <ul>\n        @foreach (var p in itens) { <li>@p</li> }\n    </ul>\n}\n\n@code {\n    private string[]? itens;\n\n    protected override async Task OnInitializedAsync()\n    {\n        itens = await Http.GetFromJsonAsync<string[]>("api/produtos");\n    }\n}'
          ),
          sl(
            'Formulários e validação com EditForm',
            'EditForm liga um formulário a um modelo (Model). Os campos usam componentes como InputText e InputNumber com @bind-Value. DataAnnotationsValidator aplica as anotações do modelo ([Required], [StringLength]) e ValidationSummary lista os erros. OnValidSubmit só dispara quando o modelo é válido (OnInvalidSubmit, quando não é). A validação no cliente é conveniência: a API do servidor deve validar de novo.',
            '<EditForm Model="modelo" OnValidSubmit="Salvar">\n    <DataAnnotationsValidator />\n    <ValidationSummary />\n    <InputText @bind-Value="modelo.Nome" />\n    <button type="submit">Salvar</button>\n</EditForm>\n\n@code {\n    private NovoProdutoDto modelo = new();\n    private Task Salvar() => Task.CompletedTask;\n}'
          ),
          sl(
            'Modos de renderização',
            'Blazor Server: os componentes rodam no servidor e a interface é atualizada por uma conexão persistente (SignalR); carrega rápido e o código fica no servidor, mas depende de conexão contínua e consome memória por usuário. Blazor WebAssembly: o app é baixado e roda no navegador; funciona sem manter conexão e escala bem no servidor, mas o download inicial é maior e todo o código vai ao cliente (não coloque segredos nele). Auto (interativo): começa no servidor e passa para WebAssembly quando este termina de baixar, combinando início rápido e execução no cliente. Também há renderização estática no servidor, sem interatividade.'
          ),
          sl(
            'JS interop e XSS',
            'Quando precisa de uma API do navegador ou biblioteca JS, o Blazor chama JavaScript por IJSRuntime (JS interop) — use apenas quando necessário. Segurança: o Razor codifica automaticamente (HTML-encode) o texto inserido com @, então <script> digitado por um usuário aparece como texto inofensivo — proteção contra XSS (injeção de script). O risco volta quando você desativa essa proteção: MarkupString insere HTML bruto sem codificar. Nunca converta entrada de usuário (ou de fontes não confiáveis) em MarkupString sem sanitizá-la.',
            '<p>@comentario</p>                       @* seguro: codificado *@\n<p>@((MarkupString)comentario)</p>        @* PERIGOSO se vier do usuário *@'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um componente Blazor?', 'b', [
          'Um script JavaScript obrigatório',
          'Um arquivo .razor que combina marcação HTML e código C# e pode ser reutilizado como tag',
          'Uma migration do banco',
          'Um tipo de middleware'
        ], 'Componentes .razor são a unidade de interface do Blazor, compostos como tags.'),
        mcq('q2', 'Para que serve [Parameter] em um componente?', 'd', [
          'Para registrar o componente na DI',
          'Para definir a rota da página',
          'Para criar uma tabela',
          'Para permitir que o componente pai passe dados pela tag'
        ], 'Propriedades com [Parameter] são recebidas do pai: <Saudacao Nome="Ana" />.'),
        mcq('q3', 'Qual é o lugar típico para carregar dados ao criar o componente?', 'c', [
          'No construtor sempre',
          'No método OnAfterRender, a cada renderização',
          'No OnInitializedAsync',
          'No @page'
        ], 'OnInitializedAsync roda uma vez na inicialização e permite aguardar chamadas assíncronas.'),
        fill('q4', 'Complete com a diretiva que define a rota de um componente.', '@___ "/produtos"', ['page'], '@page transforma o componente em uma página acessível pela rota informada.'),
        mcq('q5', 'No modo Blazor WebAssembly, o que se deve evitar colocar no código?', 'a', [
          'Segredos (chaves, senhas), pois todo o código é baixado para o navegador do usuário',
          'Componentes',
          'Rotas',
          'Parâmetros'
        ], 'O app roda no cliente: qualquer segredo embutido pode ser extraído. Segredos ficam no servidor.'),
        mcq('q6', 'Qual afirmação sobre o modo Blazor Server está correta?', 'b', [
          'O app roda inteiramente no navegador, sem servidor',
          'Os componentes rodam no servidor e a interface é atualizada por uma conexão persistente',
          'Não usa C#',
          'Não suporta eventos'
        ], 'No Server, a lógica está no servidor e as atualizações viajam por SignalR; exige conexão contínua.'),
        mcq('q7', 'Qual código é perigoso quando "comentario" vem do usuário?', 'c', [
          '<p>@comentario</p>',
          '<InputText @bind-Value="modelo.Nome" />',
          '<p>@((MarkupString)comentario)</p>',
          '<button @onclick="Salvar">Salvar</button>'
        ], 'MarkupString desativa a codificação e insere HTML bruto, permitindo XSS. O @ simples codifica o texto.'),
        fill('q8', 'Complete com o componente que liga o formulário ao modelo e dispara um evento apenas se ele for válido.', '<___ Model="modelo" OnValidSubmit="Salvar">', ['EditForm'], 'EditForm gerencia o modelo e a validação; OnValidSubmit só é chamado quando as anotações passam.')
      ]
    },
    {
      id: 'csi-33-desktop-mobile-visao-geral',
      title: 'Aplicações desktop e mobile',
      goal: 'Conhecer WinForms, WPF, MAUI e Avalonia, o padrão MVVM, a regra da thread de UI e os cuidados com dados locais do usuário.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'WinForms e WPF (Windows)',
            'Windows Forms (WinForms) é a tecnologia mais antiga e simples para apps de desktop Windows: você arrasta controles no designer e trata eventos no code-behind — ótimo para ferramentas internas e manutenção de sistemas legados. WPF (Windows Presentation Foundation) é mais moderno e flexível: a interface é descrita em XAML (uma linguagem declarativa em XML), com data binding, estilos e templates poderosos, também só para Windows.',
            '<!-- XAML (WPF) -->\n<StackPanel>\n  <TextBox Text="{Binding Nome, UpdateSourceTrigger=PropertyChanged}" />\n  <Button Content="Salvar" Command="{Binding SalvarCommand}" />\n</StackPanel>'
          ),
          sl(
            'XAML, data binding e MVVM',
            'Data binding liga propriedades da interface a propriedades de um objeto, mantendo-as sincronizadas. MVVM (Model-View-ViewModel) organiza isso: Model (dados e regras), View (a tela em XAML, sem lógica) e ViewModel (estado e comandos que a View observa). A ViewModel notifica mudanças implementando INotifyPropertyChanged e expõe ações como ICommand, em vez de a View chamar métodos por code-behind. Benefício: a lógica fica testável sem abrir uma janela.',
            'public class PessoaViewModel : INotifyPropertyChanged\n{\n    private string _nome = "";\n    public string Nome\n    {\n        get => _nome;\n        set { _nome = value; PropertyChanged?.Invoke(this, new(nameof(Nome))); }\n    }\n    public event PropertyChangedEventHandler? PropertyChanged;\n}'
          ),
          sl(
            '.NET MAUI e Avalonia',
            '.NET MAUI é o framework da Microsoft para criar apps para Android, iOS, macOS e Windows com uma base de código única em C# e XAML, compartilhando a lógica e boa parte da interface. Avalonia é uma alternativa de código aberto, também baseada em XAML, que desenha a própria interface e roda em Windows, Linux, macOS e também em plataformas móveis e web — a opção natural quando o desktop precisa rodar no Linux. A escolha depende das plataformas-alvo e da equipe.'
          ),
          sl(
            'A thread de UI e o async',
            'Toda interface gráfica tem uma thread de UI que desenha a tela e processa cliques. Se você a ocupa com uma operação demorada (consulta, download, .Result ou .Wait() em uma Task), a janela congela: "não está respondendo". Regras: faça trabalho demorado com async/await (a thread de UI fica livre enquanto espera) ou em segundo plano; e só atualize controles a partir da thread de UI — frameworks lançam exceção se uma thread de fundo tocar a interface. Após um await na thread de UI, a continuação já volta para ela automaticamente.',
            'private async void BtnBaixar_Click(object sender, EventArgs e)\n{\n    btnBaixar.Enabled = false;\n    var texto = await http.GetStringAsync(url);   // UI continua responsiva\n    lblResultado.Text = texto;                    // de volta à thread de UI\n    btnBaixar.Enabled = true;\n}'
          ),
          sl(
            'Empacotamento e escolha',
            'Distribuir exige empacotar: instaladores MSIX/MSI para Windows, pacotes das lojas (Google Play, App Store) para mobile, ou publicação autocontida/em arquivo único. Como escolher: ferramenta interna só para Windows e simples — WinForms; Windows com interface rica e MVVM — WPF; um app para celular e desktop com uma base de código — MAUI; multiplataforma incluindo Linux — Avalonia; se o requisito é "abrir no navegador", considere Blazor ou uma aplicação web.'
          ),
          sl(
            'Permissões e dados locais do usuário (LGPD)',
            'Apps desktop e mobile tocam dados do dispositivo: arquivos, contatos, localização, câmera, microfone. Peça somente as permissões necessárias, no momento em que forem necessárias, e explique a finalidade. Dados guardados localmente (cache, banco SQLite, tokens) podem conter dados pessoais: armazene o mínimo, proteja segredos com o armazenamento seguro da plataforma (como o SecureStorage do MAUI ou o cofre de credenciais do sistema), não grave senhas em arquivos de configuração e ofereça forma de apagar os dados do usuário. Pela LGPD, o titular tem direitos sobre seus dados, e a coleta precisa de finalidade e base legal — incluindo o que o app envia a servidores e a ferramentas de telemetria.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que distingue o WPF do WinForms?', 'c', [
          'O WPF roda em Linux e Android',
          'O WinForms usa XAML',
          'O WPF descreve a interface em XAML, com data binding e templates; ambos são apenas para Windows',
          'Não há diferença'
        ], 'WPF usa XAML e binding avançado; WinForms é mais simples e orientado a eventos. Ambos são Windows-only.'),
        mcq('q2', 'No padrão MVVM, qual é o papel da ViewModel?', 'b', [
          'Desenhar os pixels da tela',
          'Expor estado e comandos que a View observa via binding, sem conhecer controles visuais',
          'Armazenar o banco de dados',
          'Substituir o Model'
        ], 'A ViewModel é a ponte testável entre Model e View, notificando mudanças via INotifyPropertyChanged.'),
        mcq('q3', 'Qual framework permite uma única base de código para Android, iOS, macOS e Windows?', 'a', [
          '.NET MAUI',
          'WinForms',
          'WPF',
          'ASP.NET Core'
        ], 'MAUI é multiplataforma para mobile e desktop; WinForms e WPF são só Windows.'),
        fill('q4', 'Complete com a interface que a ViewModel implementa para avisar a View que uma propriedade mudou.', 'public class PessoaViewModel : ___ { }', ['INotifyPropertyChanged'], 'INotifyPropertyChanged dispara PropertyChanged, permitindo que o binding atualize a tela.'),
        mcq('q5', 'Por que não se deve chamar .Result em uma Task no clique de um botão?', 'd', [
          'Porque Result não existe',
          'Porque deixa o código mais rápido demais',
          'Porque só funciona em Linux',
          'Porque bloqueia a thread de UI e a janela congela'
        ], 'A thread de UI precisa ficar livre para desenhar e responder; use await.'),
        mcq('q6', 'Qual alternativa é a mais indicada para um app de desktop que precisa rodar também no Linux?', 'c', [
          'WinForms',
          'WPF',
          'Avalonia',
          'Nenhuma opção em .NET'
        ], 'Avalonia é multiplataforma, incluindo Linux; WinForms e WPF são exclusivos do Windows.'),
        mcq('q7', 'Qual prática protege melhor um token de acesso guardado no dispositivo?', 'b', [
          'Gravá-lo em um arquivo de texto na pasta do app',
          'Usar o armazenamento seguro da plataforma (por exemplo, SecureStorage no MAUI)',
          'Colocá-lo no código-fonte',
          'Enviá-lo por e-mail para si mesmo'
        ], 'O armazenamento seguro usa os recursos de proteção do sistema; arquivos de texto e código-fonte expõem o segredo.'),
        fill('q8', 'Complete com a linguagem declarativa baseada em XML usada para descrever interfaces em WPF e MAUI.', 'A interface é descrita em ___ (linguagem declarativa em XML).', ['XAML'], 'XAML descreve a árvore de controles, estilos e bindings da interface.')
      ]
    },
    {
      id: 'csi-34-grpc-signalr',
      title: 'gRPC e SignalR',
      goal: 'Escolher entre REST, gRPC, GraphQL e tempo real, e entender contratos .proto, streaming, hubs e grupos do SignalR.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'gRPC: contratos .proto sobre HTTP/2',
            'gRPC é um framework de chamada de procedimento remoto: o cliente chama um método como se fosse local e a execução ocorre em outro serviço. O contrato é escrito em um arquivo .proto (Protocol Buffers), que descreve serviços, métodos e mensagens; as ferramentas geram o código C# do cliente e do servidor a partir dele. As mensagens trafegam em formato binário compacto sobre HTTP/2 (multiplexação de várias chamadas numa conexão). Cada campo recebe um número (= 1, = 2) que identifica o campo na transmissão, permitindo evoluir o contrato com compatibilidade.',
            'syntax = "proto3";\noption csharp_namespace = "Loja.Grpc";\n\nservice Estoque {\n  rpc ConsultarSaldo (ConsultaRequest) returns (SaldoReply);\n}\n\nmessage ConsultaRequest { string sku = 1; }\nmessage SaldoReply { int32 quantidade = 1; }'
          ),
          sl(
            'Streaming e quando preferir gRPC a REST',
            'gRPC suporta quatro formas de chamada: unária (um pedido, uma resposta), streaming do servidor (um pedido, várias respostas), streaming do cliente (várias mensagens, uma resposta) e streaming bidirecional. É uma ótima escolha para comunicação entre serviços internos (microsserviços) que pedem baixa latência, contrato forte e muito tráfego. REST/JSON continua melhor para APIs públicas: legível, depurável com qualquer cliente HTTP e consumível diretamente do navegador (gRPC em navegadores precisa de adaptação, como gRPC-Web).'
          ),
          sl(
            'SignalR: tempo real e hubs',
            'SignalR facilita comunicação em tempo real entre servidor e clientes: o servidor pode ENVIAR dados aos clientes sem eles perguntarem (notificações, painéis ao vivo, chat). Ele usa WebSockets quando disponíveis e, se não der, recorre a alternativas (Server-Sent Events, long polling), de forma transparente. O ponto central é o Hub: uma classe cujos métodos os clientes chamam e que, por Clients, chama métodos nos clientes.',
            'public class ChatHub : Hub\n{\n    public Task Enviar(string mensagem) =>\n        Clients.All.SendAsync("Receber", mensagem);\n}\n\n// Program.cs\nbuilder.Services.AddSignalR();\n// ...\napp.MapHub<ChatHub>("/chat");'
          ),
          sl(
            'Grupos e escala com backplane',
            'Grupos permitem enviar a subconjuntos de conexões: Groups.AddToGroupAsync(Context.ConnectionId, sala) e depois Clients.Group(sala).SendAsync(...). Cada conexão tem um ConnectionId. Ao rodar várias instâncias do servidor, cada uma conhece só as próprias conexões; para que uma mensagem alcance clientes ligados a outra instância, usa-se um backplane (por exemplo Redis), que repassa as mensagens entre as instâncias. Alternativas gerenciadas existem em serviços de nuvem.',
            'public Task Entrar(string sala) =>\n    Groups.AddToGroupAsync(Context.ConnectionId, sala);\n\npublic Task EnviarParaSala(string sala, string msg) =>\n    Clients.Group(sala).SendAsync("Receber", msg);'
          ),
          sl(
            'Autenticação e quando usar tempo real',
            'Hubs são pontos de entrada como qualquer endpoint: proteja com [Authorize] na classe do hub e valide permissões antes de entrar em grupos (um usuário não deve entrar na sala de outro apenas informando o nome). Como o WebSocket do navegador não envia cabeçalhos personalizados, o token JWT costuma ser passado na query string da conexão, o que exige cuidado para não registrar URLs em logs. Use tempo real quando a latência importa e o servidor precisa notificar; se atualizações a cada alguns segundos bastam, polling simples costuma ser mais barato e mais simples.',
            '[Authorize]\npublic class PainelHub : Hub { }'
          ),
          sl(
            'REST, gRPC e GraphQL: visão geral',
            'REST: recursos e verbos HTTP, ubíquo, simples, ótimo para APIs públicas, com cache HTTP. gRPC: contrato forte, binário, rápido, streaming, ideal entre serviços. GraphQL: uma linguagem de consulta em que o cliente escolhe exatamente os campos que quer em uma única requisição, evitando over-fetching/under-fetching (muito ou pouco dado) — útil com muitos clientes diferentes, ao custo de complexidade no servidor (consultas caras, cache mais difícil, limites de profundidade). Não há "melhor": há o mais adequado ao contexto.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que descreve o arquivo .proto em um serviço gRPC?', 'd', [
          'Apenas as configurações de porta',
          'A senha do serviço',
          'O arquivo de log',
          'O contrato: serviços, métodos e mensagens, a partir do qual o código é gerado'
        ], 'O .proto é o contrato fonte; as ferramentas geram clientes e servidores a partir dele.'),
        mcq('q2', 'Em que cenário o gRPC costuma ser preferível ao REST?', 'a', [
          'Comunicação entre serviços internos que exige baixa latência e contrato forte',
          'API pública consumida diretamente por qualquer navegador sem adaptação',
          'Quando se quer depurar com o navegador apenas',
          'Quando não há rede'
        ], 'gRPC brilha entre serviços; REST segue mais prático para APIs públicas e navegadores.'),
        mcq('q3', 'Para que serve um Hub no SignalR?', 'b', [
          'Para armazenar dados em disco',
          'Para ser o ponto onde clientes chamam métodos do servidor e o servidor chama métodos nos clientes',
          'Para criar migrations',
          'Para compilar o projeto'
        ], 'O Hub é a classe central da comunicação bidirecional em tempo real.'),
        fill('q4', 'Complete com o método que mapeia o hub a uma rota.', 'app.___<ChatHub>("/chat");', ['MapHub'], 'MapHub expõe o hub no caminho informado, como um endpoint.'),
        mcq('q5', 'Por que usar um backplane (como Redis) no SignalR?', 'c', [
          'Para compilar mais rápido',
          'Para criptografar o JWT',
          'Para que mensagens alcancem clientes conectados a outras instâncias do servidor',
          'Para criar grupos automaticamente'
        ], 'Cada instância só conhece as próprias conexões; o backplane replica as mensagens entre elas.'),
        mcq('q6', 'Qual é o problema de deixar um usuário entrar em qualquer grupo apenas informando o nome da sala?', 'a', [
          'Ele pode receber mensagens de salas às quais não deveria ter acesso; é preciso verificar a autorização',
          'Nenhum, grupos são sempre seguros',
          'O grupo deixa de existir',
          'O SignalR fecha o servidor'
        ], 'Grupos não autorizam por si; o hub deve checar se o usuário pode acessar aquela sala.'),
        mcq('q7', 'Qual afirmação sobre GraphQL está correta?', 'd', [
          'Obriga o servidor a devolver sempre todos os campos',
          'É um protocolo binário sobre HTTP/2 baseado em .proto',
          'Só funciona com SignalR',
          'Permite que o cliente peça exatamente os campos desejados em uma requisição, com custo de complexidade no servidor'
        ], 'GraphQL reduz over/under-fetching; o preço é complexidade e o cuidado com consultas caras.'),
        fill('q8', 'Complete com o atributo que protege um hub exigindo usuário autenticado.', '[___]\npublic class PainelHub : Hub { }', ['Authorize'], 'Hubs são endpoints e podem ser protegidos com [Authorize] como controllers.')
      ]
    },
    {
      id: 'csi-35-docker-deploy-dotnet',
      title: 'Docker e deploy de .NET',
      goal: 'Publicar aplicações .NET e empacotá-las em imagens Docker enxutas, seguras e configuráveis por ambiente.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'dotnet publish',
            'dotnet publish -c Release compila em modo Release e gera, em uma pasta, tudo o que é preciso para executar o app. Dois modelos: framework-dependent (padrão) — pequeno, exige o runtime do .NET instalado na máquina de destino; self-contained — inclui o runtime junto, maior, mas dispensa a instalação. Single-file empacota tudo em um único executável (com visão geral de trade-offs: arquivo maior, extração e compatibilidade com bibliotecas). Em contêiner, o normal é framework-dependent sobre uma imagem de runtime.',
            'dotnet publish -c Release -o ./publish\ndotnet publish -c Release -r linux-x64 --self-contained true -o ./publish-sc'
          ),
          sl(
            'Dockerfile multi-stage',
            'Para compilar é preciso o SDK (grande); para executar basta o runtime (menor). Um Dockerfile multi-stage usa uma etapa com a imagem do SDK para restaurar e publicar, e uma etapa final com a imagem aspnet (só runtime) para a qual se copia apenas o resultado do publish. A imagem final fica menor, com menos superfície de ataque, e sem código-fonte ou ferramentas de build. Copiar o .csproj e restaurar ANTES de copiar o restante do código aproveita o cache de camadas do Docker.',
            'FROM mcr.microsoft.com/dotnet/sdk:<versao> AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish --no-restore\n\nFROM mcr.microsoft.com/dotnet/aspnet:<versao> AS final\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Loja.Api.dll"]'
          ),
          sl(
            'Usuário não-root, porta e .dockerignore',
            'Rodar como root dentro do contêiner aumenta o estrago de uma invasão: use um usuário comum com a instrução USER (as imagens oficiais recentes do .NET já trazem um usuário sem privilégios; confirme na imagem que você usa). Usuários não-root não podem escutar portas baixas (menores que 1024), então use uma porta alta e informe ao Kestrel por ASPNETCORE_URLS (por exemplo http://+:8080) e EXPOSE para documentação. O .dockerignore impede que bin/, obj/, .git e arquivos de segredos entrem no contexto de build.',
            'USER app\nENV ASPNETCORE_URLS=http://+:8080\nEXPOSE 8080\n\n# .dockerignore\n# bin/\n# obj/\n# .git\n# .env\n# *.user'
          ),
          sl(
            'Configuração e segredos por variáveis de ambiente',
            'A imagem deve ser a MESMA em todos os ambientes; o que muda (connection string, chaves, URLs) vem de fora, por variáveis de ambiente, que sobrescrevem o appsettings. A hierarquia de configuração usa dois sublinhados no lugar de dois-pontos: ConnectionStrings__Loja equivale a ConnectionStrings:Loja. NUNCA coloque segredos na imagem (nem em ENV do Dockerfile, nem copiados em arquivos): ficam gravados nas camadas e quem tiver a imagem os lê. Injete na execução ou use o gerenciador de segredos do orquestrador.',
            'docker run -p 8080:8080 \\\n  -e ASPNETCORE_ENVIRONMENT=Production \\\n  -e ConnectionStrings__Loja="<connection-string>" \\\n  -e Jwt__Key="<chave-secreta>" \\\n  loja-api'
          ),
          sl(
            'Health checks',
            'Health checks são endpoints que informam se o app está saudável, usados por orquestradores e balanceadores para decidir se enviam tráfego ou reiniciam o contêiner. No ASP.NET Core: AddHealthChecks() registra e MapHealthChecks("/health") expõe. Distinga liveness (o processo está vivo?) de readiness (está pronto para atender, com o banco acessível?). Não exponha detalhes internos (strings de conexão, mensagens de erro) na resposta.',
            'builder.Services.AddHealthChecks();\n// ...\napp.MapHealthChecks("/health");'
          ),
          sl(
            'PaaS, contêineres e atualização de segurança',
            'Há várias formas de colocar a imagem no ar: serviços de aplicação gerenciados (PaaS) que recebem o código ou a imagem, serviços de contêiner gerenciados e orquestradores como Kubernetes; todos esperam as mesmas boas práticas (configuração externa, health check, logs em stdout). O runtime e a imagem base recebem correções de segurança periodicamente: reconstrua e reimplante com frequência para incorporá-las, em vez de manter a mesma imagem por meses, e use versões com suporte vigente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre publicar framework-dependent e self-contained?', 'a', [
          'Self-contained inclui o runtime e dispensa a instalação no destino; framework-dependent exige o runtime instalado',
          'Self-contained é sempre menor',
          'Framework-dependent inclui o runtime',
          'Não há diferença'
        ], 'Self-contained empacota o runtime junto (maior); framework-dependent confia no runtime do destino (menor).'),
        mcq('q2', 'Por que usar multi-stage com as imagens sdk e aspnet?', 'c', [
          'Para incluir o código-fonte na imagem final',
          'Porque o aspnet compila melhor',
          'Para ter uma imagem final menor, só com runtime e o resultado do publish, sem ferramentas de build',
          'Para impedir o uso de variáveis de ambiente'
        ], 'O SDK só é necessário na compilação; a imagem final fica enxuta e com menos superfície de ataque.'),
        mcq('q3', 'Qual é o problema deste Dockerfile?\nFROM mcr.microsoft.com/dotnet/aspnet:<versao>\nENV Jwt__Key=minha-chave-real\nCOPY . /app', 'd', [
          'ENV não existe',
          'A instrução COPY é inválida',
          'Falta o comentário',
          'O segredo fica gravado na imagem, legível por quem a obtiver'
        ], 'Segredos em ENV ou arquivos ficam nas camadas; devem ser injetados na execução.'),
        fill('q4', 'Complete com a variável de ambiente que informa as URLs em que o Kestrel escuta.', 'ENV ___=http://+:8080', ['ASPNETCORE_URLS'], 'ASPNETCORE_URLS define endereço e porta do servidor, como a porta alta usada por um usuário não-root.'),
        mcq('q5', 'Como definir, por variável de ambiente, a chave de configuração ConnectionStrings:Loja?', 'b', [
          'ConnectionStrings:Loja (com dois-pontos) em qualquer shell',
          'ConnectionStrings__Loja (dois sublinhados)',
          'CONNECTION.STRINGS.LOJA',
          'Não é possível'
        ], 'Em variáveis de ambiente, o separador de hierarquia é __, que o .NET converte em :.'),
        mcq('q6', 'Para que serve o .dockerignore?', 'd', [
          'Para listar as portas expostas',
          'Para definir o ponto de entrada',
          'Para ignorar erros de build',
          'Para impedir que arquivos como bin/, obj/, .git e segredos entrem no contexto de build'
        ], 'Reduz o contexto, acelera o build e evita vazar arquivos sensíveis para a imagem.'),
        mcq('q7', 'Qual é a diferença entre liveness e readiness?', 'a', [
          'Liveness indica se o processo está vivo; readiness, se está pronto para receber tráfego (dependências ok)',
          'São o mesmo teste',
          'Liveness verifica o banco; readiness verifica o processo',
          'Só existem em desenvolvimento'
        ], 'Um app pode estar vivo, mas ainda sem conexão com o banco; nesse caso não está pronto para atender.'),
        fill('q8', 'Complete com o comando que gera os arquivos de produção do app.', 'dotnet ___ -c Release -o ./publish', ['publish'], 'dotnet publish compila e reúne os arquivos necessários para implantação.')
      ]
    },
    {
      id: 'csi-36-seguranca-owasp-lgpd',
      title: 'Segurança em .NET: OWASP e LGPD',
      goal: 'Reconhecer e prevenir as principais vulnerabilidades web em aplicações .NET e aplicar conceitos básicos da LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'OWASP Top 10: injeção, XSS e desserialização',
            'OWASP Top 10 é uma lista de referência dos riscos mais críticos em aplicações web. Injeção: entrada do usuário interpretada como comando (SQL, comandos do sistema); defesa: consultas parametrizadas, LINQ/EF Core e nunca concatenar. XSS: script injetado em páginas vistas por outros usuários; defesa: codificação de saída (o Razor e o Blazor codificam por padrão), e cuidado com HTML bruto. Desserialização insegura: converter dados não confiáveis em objetos com formatos que podem instanciar tipos arbitrários (como o BinaryFormatter, que deve ser evitado); prefira System.Text.Json com tipos concretos conhecidos.'
          ),
          sl(
            'Controle de acesso quebrado e IDOR',
            'Quebra de controle de acesso é a falha mais comum: o sistema autentica, mas não verifica se AQUELE usuário pode acessar AQUELE recurso. IDOR (Insecure Direct Object Reference) é o caso clássico: GET /api/pedidos/42 retorna o pedido 42 para qualquer usuário logado que troque o número na URL. Autenticar não basta: toda consulta deve verificar a propriedade do recurso (o dono é o usuário do token) ou a permissão. Negue por padrão, e não revele se o recurso existe (404 em vez de 403, quando apropriado).',
            '// VULNERÁVEL: qualquer usuário autenticado lê qualquer pedido\nvar p = await db.Pedidos.FindAsync(id);\n\n// CORRETO: filtra pelo dono extraído do token\nvar uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);\nvar p2 = await db.Pedidos\n    .FirstOrDefaultAsync(x => x.Id == id && x.ClienteId == uid);'
          ),
          sl(
            'CSRF, SSRF e configuração insegura',
            'CSRF: um site malicioso faz o navegador do usuário (já logado, com cookie) enviar uma requisição que altera dados; defesa: tokens antiforgery e cookies SameSite. APIs com tokens em cabeçalho Authorization não sofrem CSRF clássico. SSRF: o servidor é induzido a requisitar URLs internas; defesa: allowlist de hosts. Configuração insegura: páginas de erro detalhadas (stack trace) em produção, Swagger aberto, credenciais padrão, CORS liberado para tudo, HTTPS ausente. Em produção, o ambiente deve ser Production e erros genéricos (ProblemDetails) ao cliente, detalhes só nos logs.'
          ),
          sl(
            'Componentes vulneráveis, logging e headers',
            'Dependências desatualizadas trazem falhas conhecidas: rode dotnet list package --vulnerable (e --include-transitive) para listar pacotes com vulnerabilidades divulgadas, e automatize atualizações. Logging insuficiente impede detectar e investigar ataques: registre eventos de segurança (falhas de login, acessos negados) — sem senhas, tokens nem dados pessoais. Cabeçalhos de segurança reforçam o navegador: X-Content-Type-Options: nosniff, Content-Security-Policy (restringe de onde scripts carregam), Strict-Transport-Security (HSTS) e políticas de frame. Validação de entrada: valide tamanho, tipo, formato e faixa na borda — por allowlist, não por tentativa de listar o "ruim".',
            'app.Use(async (ctx, next) =>\n{\n    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";\n    await next();\n});'
          ),
          sl(
            'Segredos e Data Protection',
            'Segredos (chaves de API, connection strings, chave do JWT) jamais ficam no código ou no Git. Em desenvolvimento, use User Secrets (dotnet user-secrets), armazenados fora do repositório; em produção, variáveis de ambiente e cofres como o Azure Key Vault (visão geral) e equivalentes. Se um segredo vazou, considere-o comprometido: troque (rotacione). A Data Protection API do ASP.NET Core criptografa dados de aplicação (como cookies e tokens temporários) com chaves gerenciadas por você: IDataProtector.Protect/Unprotect. Atenção: a chave de proteção precisa ser persistida e compartilhada entre instâncias.',
            'dotnet user-secrets init\ndotnet user-secrets set "Jwt:Key" "<chave-secreta>"\n\nvar protetor = provider.CreateProtector("Loja.Tokens");\nstring cifrado = protetor.Protect("valor");'
          ),
          sl(
            'LGPD: princípios e bases legais',
            'A LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018) regula o tratamento de dados pessoais no Brasil. Dado pessoal é qualquer informação que identifique ou possa identificar uma pessoa natural (nome, CPF, e-mail, IP, localização). Princípios essenciais: finalidade (tratar para um propósito legítimo e informado), necessidade/minimização (coletar só o indispensável), adequação, transparência, segurança e prevenção. Todo tratamento precisa de uma base legal, como consentimento (livre, informado e específico, revogável), execução de contrato, cumprimento de obrigação legal ou legítimo interesse, entre outras. Dados pessoais sensíveis (saúde, origem racial, biometria etc.) exigem cuidado redobrado.'
          ),
          sl(
            'LGPD na prática: direitos, retenção e técnica',
            'O titular tem direitos como confirmar a existência do tratamento, acessar seus dados, corrigi-los, pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo, portabilidade e revogar o consentimento — o sistema precisa ter meios de atender a esses pedidos. Retenção: guarde só pelo tempo necessário à finalidade (ou exigido por lei) e depois elimine. Na engenharia: logs sem dados pessoais (use ids, mascare o resto), criptografia em trânsito (HTTPS/TLS) e em repouso (disco, banco, backups), controle de acesso, e plano de resposta a incidentes. Este conteúdo é apenas conceitual e não substitui orientação jurídica especializada.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a defesa correta contra SQL injection?', 'c', [
          'Remover aspas manualmente da entrada',
          'Criptografar o banco',
          'Usar consultas parametrizadas (ou LINQ/EF Core) em vez de concatenar entrada no SQL',
          'Usar HTTPS'
        ], 'O banco deve receber a entrada como dado em parâmetros; filtrar aspas é frágil e HTTPS não impede injeção.'),
        mcq('q2', 'O que caracteriza uma vulnerabilidade IDOR?', 'b', [
          'Senhas fracas no banco',
          'Acessar o recurso de outra pessoa apenas trocando o identificador, porque o servidor não verifica a propriedade',
          'Falta de HTTPS',
          'Uso de cache'
        ], 'O servidor confia no id enviado sem checar se o usuário autenticado é o dono do recurso.'),
        mcq('q3', 'Qual é o problema deste código?\nvar pedido = await db.Pedidos.FindAsync(id);\nreturn pedido is null ? Results.NotFound() : Results.Ok(pedido);', 'd', [
          'O uso de await',
          'O uso de Results.Ok',
          'O uso de NotFound',
          'Não verifica se o pedido pertence ao usuário autenticado (IDOR) e ainda expõe a entidade'
        ], 'Qualquer usuário autenticado pode ler qualquer pedido; falta filtrar pelo dono e devolver um DTO.'),
        fill('q4', 'Complete com o comando que lista pacotes NuGet com vulnerabilidades conhecidas.', 'dotnet list package --___', ['vulnerable'], 'A opção --vulnerable consulta as vulnerabilidades divulgadas dos pacotes referenciados.'),
        mcq('q5', 'Onde guardar a chave do JWT em desenvolvimento, fora do repositório?', 'a', [
          'No User Secrets (dotnet user-secrets)',
          'No appsettings.json versionado',
          'Em uma constante no Program.cs',
          'No README'
        ], 'User Secrets guarda valores fora da pasta do projeto e do Git, apenas para desenvolvimento.'),
        mcq('q6', 'Qual afirmação sobre a LGPD é correta?', 'b', [
          'Permite coletar todos os dados possíveis "para o caso de precisar"',
          'Exige finalidade definida, coleta mínima e base legal para o tratamento de dados pessoais',
          'Só vale para empresas de tecnologia',
          'Dispensa medidas de segurança'
        ], 'Finalidade, necessidade (minimização) e base legal são pilares do tratamento de dados pessoais.'),
        mcq('q7', 'Qual prática de log está alinhada à LGPD e à segurança?', 'c', [
          'Registrar senha e CPF para facilitar a depuração',
          'Registrar o corpo completo de toda requisição',
          'Registrar identificadores e eventos (como falha de login), sem senhas, tokens e dados pessoais desnecessários',
          'Não registrar nada'
        ], 'Logs úteis para auditoria, mas sem segredos e com dados pessoais minimizados ou mascarados.'),
        fill('q8', 'Complete o direito do titular de pedir o apagamento de dados desnecessários.', 'Direito de eliminação: o titular pode pedir a ___ dos dados.', ['eliminação', 'eliminacao'], 'A LGPD prevê eliminação de dados tratados com consentimento (e de dados desnecessários ou em desacordo), ressalvadas hipóteses legais de retenção.')
      ]
    },
    {
      id: 'csi-37-git-ci-nuget',
      title: 'Git, CI e pacotes NuGet',
      goal: 'Automatizar build, testes e qualidade em CI, versionar com SemVer e publicar pacotes NuGet sem vazar chaves.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Fluxo de branches e .gitignore',
            'Um fluxo comum: a branch main está sempre estável; cada mudança nasce em uma branch curta (feature/nome), vira Pull Request, passa pelo CI e por revisão e só então é mesclada (merge). Branches curtas evitam conflitos grandes. O .gitignore impede versionar o que é gerado ou sensível: pastas bin/ e obj/, .vs/, arquivos *.user e, principalmente, arquivos de segredos (appsettings.*.local.json, .env). O comando dotnet new gitignore cria um .gitignore adequado para .NET. Um segredo que foi commitado já vazou, mesmo se apagado depois: o histórico guarda; rotacione a chave.',
            'dotnet new gitignore\ngit switch -c feature/listar-pedidos\n# ...commits...\ngit push -u origin feature/listar-pedidos'
          ),
          sl(
            'build, test e format num pipeline',
            'CI (integração contínua) executa automaticamente, a cada push ou Pull Request, os mesmos passos que você roda localmente: dotnet restore, dotnet build -c Release, dotnet test e, para estilo, dotnet format --verify-no-changes (falha se o código não estiver formatado). Se qualquer passo falhar, o pipeline fica vermelho e a mudança não deve ser mesclada. O valor está em detectar regressões cedo e de forma repetível, não "na minha máquina funciona".',
            'dotnet restore\ndotnet build --no-restore -c Release\ndotnet test --no-build -c Release\ndotnet format --verify-no-changes'
          ),
          sl(
            'GitHub Actions para .NET',
            'No GitHub Actions, um workflow é um arquivo YAML em .github/workflows. Ele define gatilhos (on), jobs e steps. actions/checkout baixa o código e actions/setup-dotnet instala o SDK na versão escolhida; depois vêm os comandos dotnet. Para acelerar, o cache de pacotes NuGet evita baixar tudo a cada execução. Segredos (chaves, tokens) ficam em "Secrets" do repositório e são lidos com ${{ secrets.NOME }} — nunca escritos no YAML.',
            'name: ci\non:\n  push:\n    branches: [main]\n  pull_request:\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-dotnet@v4\n        with:\n          dotnet-version: "<versao-do-sdk>"\n      - run: dotnet restore\n      - run: dotnet build --no-restore -c Release\n      - run: dotnet test --no-build -c Release'
          ),
          sl(
            'Analisadores e TreatWarningsAsErrors',
            'Analisadores (analyzers) inspecionam o código durante a compilação e emitem avisos sobre bugs e más práticas (nulabilidade, APIs obsoletas, estilo). Por padrão, avisos não quebram o build e acabam ignorados. A propriedade TreatWarningsAsErrors transforma avisos em erros: o pipeline falha e o problema precisa ser resolvido. Combine com Nullable habilitado. Adote com a base de código limpa (ou gradualmente), para não bloquear o time com centenas de avisos antigos.',
            '<PropertyGroup>\n  <Nullable>enable</Nullable>\n  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>\n</PropertyGroup>'
          ),
          sl(
            'Versionamento semântico (SemVer)',
            'SemVer usa MAIOR.MENOR.CORREÇÃO (por exemplo, 2.4.1). Incrementa-se MAIOR quando há mudança incompatível (quebra quem usa), MENOR quando se adiciona funcionalidade compatível e CORREÇÃO quando se corrige um bug compatível. Sufixos como -beta.1 marcam pré-lançamentos. Quem consome sua biblioteca confia nesse contrato para saber se atualizar é seguro.'
          ),
          sl(
            'Criar e publicar um pacote NuGet',
            'Um pacote NuGet é um .nupkg com sua biblioteca e metadados. No .csproj, defina PackageId, Version, Authors e Description; dotnet pack -c Release gera o pacote e dotnet nuget push o envia ao feed. A chave de API do feed é um segredo: no CI, vem de um Secret (${{ secrets.NUGET_API_KEY }}), nunca do código; use chaves com escopo mínimo e prazo de validade. Versões publicadas não podem ser reescritas — só despublicadas/marcadas como obsoletas —, então publique com cuidado.',
            'dotnet pack -c Release\ndotnet nuget push bin/Release/Loja.Utilidades.1.0.0.nupkg \\\n  --api-key ${{ secrets.NUGET_API_KEY }} \\\n  --source https://api.nuget.org/v3/index.json'
          ),
          sl(
            'Directory.Build.props e gerenciamento central de pacotes',
            'Em soluções com vários projetos, repetir as mesmas propriedades é frágil. Um arquivo Directory.Build.props na raiz é lido automaticamente por todos os projetos abaixo dele: ideal para Nullable, TreatWarningsAsErrors e outras propriedades comuns. O gerenciamento central de pacotes (Central Package Management) usa um Directory.Packages.props que define a versão de cada pacote uma vez; nos .csproj os PackageReference ficam sem versão. Assim todos os projetos usam a mesma versão e atualizar fica fácil e consistente.',
            '<!-- Directory.Packages.props -->\n<Project>\n  <PropertyGroup>\n    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>\n  </PropertyGroup>\n  <ItemGroup>\n    <PackageVersion Include="xunit" Version="<versao>" />\n  </ItemGroup>\n</Project>\n\n<!-- no .csproj -->\n<PackageReference Include="xunit" />'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual item NÃO deve ser versionado no Git?', 'd', [
          'O código-fonte',
          'O arquivo .csproj',
          'O .gitignore',
          'Arquivos com segredos e as pastas bin/ e obj/'
        ], 'Segredos e artefatos de build ficam fora do repositório; o histórico do Git guarda tudo que já foi commitado.'),
        mcq('q2', 'Qual comando falha se o código não estiver formatado conforme as regras do projeto?', 'a', [
          'dotnet format --verify-no-changes',
          'dotnet restore',
          'dotnet clean',
          'dotnet new sln'
        ], '--verify-no-changes verifica sem alterar e retorna erro se algo precisar de formatação.'),
        mcq('q3', 'Qual versão SemVer corresponde a uma mudança que quebra compatibilidade, partindo de 2.4.1?', 'c', [
          '2.4.2',
          '2.5.0',
          '3.0.0',
          '2.4.1-beta'
        ], 'Mudança incompatível incrementa o MAIOR e zera os demais: 3.0.0.'),
        fill('q4', 'Complete com o comando que gera o arquivo .nupkg.', 'dotnet ___ -c Release', ['pack'], 'dotnet pack cria o pacote NuGet a partir do projeto.'),
        mcq('q5', 'Onde deve ficar a chave de API usada para publicar o pacote no CI?', 'b', [
          'No arquivo YAML do workflow, em texto puro',
          'Nos Secrets do repositório, lida como ${{ secrets.NUGET_API_KEY }}',
          'No .csproj',
          'No README'
        ], 'Secrets do CI não aparecem no código e são mascarados nos logs.'),
        mcq('q6', 'O que faz TreatWarningsAsErrors?', 'a', [
          'Transforma avisos de compilação em erros, quebrando o build até serem corrigidos',
          'Desativa os analisadores',
          'Remove todos os avisos do código automaticamente',
          'Faz o dotnet test ignorar falhas'
        ], 'Evita que avisos se acumulem ignorados: o pipeline falha enquanto existirem.'),
        mcq('q7', 'Qual é a função do Directory.Build.props?', 'd', [
          'Definir o banco de dados',
          'Compilar apenas o projeto de testes',
          'Substituir o appsettings.json',
          'Definir propriedades de build comuns aplicadas automaticamente a todos os projetos abaixo dele'
        ], 'Evita repetir Nullable, TreatWarningsAsErrors etc. em cada .csproj.'),
        fill('q8', 'Complete com o nome do arquivo que define centralmente as versões dos pacotes NuGet.', 'Directory.___.props', ['Packages'], 'Directory.Packages.props, junto de ManagePackageVersionsCentrally, concentra as versões; os PackageReference ficam sem versão.')
      ]
    },
    {
      id: 'csi-38-consolidacao-projeto',
      title: 'Projeto guiado: API de pedidos',
      goal: 'Integrar tudo em uma API de pedidos: modelagem, endpoints, EF Core, JWT, validação, testes, Docker e checklist de segurança e LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Escopo e modelagem',
            'Vamos montar uma API de pedidos: clientes fazem pedidos com itens. Modelagem enxuta, seguindo a minimização de dados: Cliente (Id, Nome — nada de documentos ou endereço que a API não precise), Pedido (Id, ClienteId, CriadoEmUtc, Status) e Item (Id, PedidoId, Produto, Quantidade, PrecoUnitario). Relação 1:N entre Cliente e Pedido e entre Pedido e Item. Use sempre dados fictícios em desenvolvimento e testes (por exemplo, "Cliente Exemplo"), nunca dados reais de pessoas.',
            'public class Cliente { public int Id { get; set; } public string Nome { get; set; } = ""; }\n\npublic class Pedido\n{\n    public int Id { get; set; }\n    public int ClienteId { get; set; }\n    public DateTime CriadoEmUtc { get; set; } = DateTime.UtcNow;\n    public string Status { get; set; } = "Novo";\n    public List<Item> Itens { get; set; } = new();\n}\n\npublic class Item\n{\n    public int Id { get; set; }\n    public int PedidoId { get; set; }\n    public string Produto { get; set; } = "";\n    public int Quantidade { get; set; }\n    public decimal PrecoUnitario { get; set; }\n}'
          ),
          sl(
            'EF Core, migrations e configuração',
            'O LojaContext expõe DbSets de Cliente, Pedido e Item; o provedor e a connection string vêm da configuração. Em desenvolvimento, User Secrets ou appsettings.Development.json com SQLite; em produção, a variável de ambiente ConnectionStrings__Loja com <connection-string> injetada pelo ambiente. Crie a migration com dotnet ef migrations add Inicial e aplique com dotnet ef database update. Em produção, prefira aplicar migrations como etapa controlada do deploy, não automaticamente na inicialização de várias instâncias ao mesmo tempo.',
            'builder.Services.AddDbContext<LojaContext>(o =>\n    o.UseSqlite(builder.Configuration.GetConnectionString("Loja")));\n\n// dotnet ef migrations add Inicial\n// dotnet ef database update'
          ),
          sl(
            'Autenticação JWT e propriedade do recurso',
            'A API exige autenticação em todo o grupo /api/pedidos (RequireAuthorization) com JWT Bearer validando emissor, audiência, expiração e assinatura; a chave vem da configuração. O id do cliente é extraído das claims do TOKEN — nunca de um campo enviado no corpo da requisição — e usado como filtro em todas as consultas, evitando IDOR. Para um pedido que não pertence ao usuário, responda 404.',
            'var pedidos = app.MapGroup("/api/pedidos").RequireAuthorization();\n\npedidos.MapGet("/{id:int}", async (int id, ClaimsPrincipal user, LojaContext db) =>\n{\n    var uid = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);\n    var dto = await db.Pedidos\n        .AsNoTracking()\n        .Where(p => p.Id == id && p.ClienteId == uid)\n        .Select(p => new PedidoDto(p.Id, p.Status, p.Itens.Sum(i => i.Quantidade * i.PrecoUnitario)))\n        .FirstOrDefaultAsync();\n    return dto is null ? Results.NotFound() : Results.Ok(dto);\n});\n\npublic record PedidoDto(int Id, string Status, decimal Total);'
          ),
          sl(
            'Criação com validação e logging',
            'O POST recebe um DTO de entrada (não a entidade), valida na borda (itens não vazios, quantidade positiva, preço dentro de um limite) e devolve 400 com ValidationProblem; cria o pedido associado ao cliente do token e responde 201 com Created. Logue eventos úteis (pedido criado, falha de validação) por ILogger com templates estruturados e IDs — sem nome, documento ou outros dados pessoais.',
            'public record ItemDto(string Produto, int Quantidade, decimal PrecoUnitario);\npublic record NovoPedidoDto(List<ItemDto> Itens);\n\npedidos.MapPost("/", async (NovoPedidoDto dto, ClaimsPrincipal user, LojaContext db, ILogger<Program> log) =>\n{\n    if (dto.Itens.Count == 0 || dto.Itens.Any(i => i.Quantidade <= 0))\n        return Results.ValidationProblem(new Dictionary<string, string[]>\n        {\n            ["itens"] = new[] { "Informe ao menos um item com quantidade positiva." }\n        });\n\n    var uid = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);\n    var pedido = new Pedido\n    {\n        ClienteId = uid,\n        Itens = dto.Itens.Select(i => new Item\n        {\n            Produto = i.Produto, Quantidade = i.Quantidade, PrecoUnitario = i.PrecoUnitario\n        }).ToList()\n    };\n    db.Pedidos.Add(pedido);\n    await db.SaveChangesAsync();\n    log.LogInformation("Pedido {PedidoId} criado", pedido.Id);\n    return Results.Created($"/api/pedidos/{pedido.Id}", new { pedido.Id });\n});'
          ),
          sl(
            'Testes de integração',
            'Com WebApplicationFactory<Program> você sobe a API em memória e testa o comportamento observável: sem token, o acesso é negado (401); com token válido de outro cliente, o pedido não é encontrado (404); POST válido devolve 201. Troque o banco por SQLite em memória ou Testcontainers e gere um token de teste com uma chave de teste (fictícia, só do ambiente de teste). Teste também os caminhos de erro.',
            '[Fact]\npublic async Task Sem_token_retorna_401()\n{\n    var client = _factory.CreateClient();\n    var resposta = await client.GetAsync("/api/pedidos/1");\n    Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);\n}'
          ),
          sl(
            'Dockerfile e deploy',
            'Empacote com um Dockerfile multi-stage (SDK para publicar, aspnet para executar), usuário não-root, porta alta via ASPNETCORE_URLS e .dockerignore. Segredos (chave do JWT, connection string) entram por variáveis de ambiente na execução — nunca na imagem. Exponha /health para o orquestrador. Rode o dotnet test e dotnet list package --vulnerable no CI antes de construir a imagem.',
            'FROM mcr.microsoft.com/dotnet/sdk:<versao> AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish --no-restore\n\nFROM mcr.microsoft.com/dotnet/aspnet:<versao> AS final\nWORKDIR /app\nCOPY --from=build /app/publish .\nUSER app\nENV ASPNETCORE_URLS=http://+:8080\nENTRYPOINT ["dotnet", "Loja.Api.dll"]'
          ),
          sl(
            'Checklist final e próximos passos',
            'Segurança: consultas parametrizadas; propriedade do recurso verificada; JWT validado por completo; HTTPS/HSTS; CORS restrito; rate limiting no login; erros genéricos em produção; dependências sem vulnerabilidades; segredos fora do código. LGPD (conceitos): coletar o mínimo; finalidade definida e base legal; retenção definida; meios de atender pedidos de acesso, correção e eliminação; logs sem dados pessoais; criptografia em trânsito e em repouso — e consulta a orientação jurídica para o seu caso. Próximos passos: paginação na listagem, concorrência otimista no estoque, cache de leituras, mensageria para notificações, observabilidade (métricas e tracing) e pipeline de deploy automatizado.'
          )
        ]
      },
      questions: [
        mcq('q1', 'De onde o endpoint deve obter o id do cliente dono do pedido?', 'd', [
          'Do corpo da requisição, enviado pelo cliente',
          'Da query string',
          'De uma constante',
          'Das claims do token autenticado'
        ], 'O id vem da identidade validada (token), pois valores enviados pelo cliente podem ser forjados.'),
        mcq('q2', 'Um usuário autenticado consulta o pedido de outro cliente. Qual resposta é adequada segundo o projeto?', 'c', [
          '200 com os dados do pedido',
          '500',
          '404, sem revelar que o pedido existe',
          '201'
        ], 'A consulta filtra por dono; para quem não é dono, o pedido "não existe", sem vazar informação.'),
        mcq('q3', 'Por que o POST recebe NovoPedidoDto em vez da entidade Pedido?', 'a', [
          'Para evitar over-posting e acoplamento: o cliente só envia os campos permitidos',
          'Porque entidades não compilam',
          'Porque DTOs são mais lentos',
          'Porque o EF Core exige'
        ], 'DTO de entrada limita o que o cliente controla (ele não define ClienteId nem Status).'),
        fill('q4', 'Complete com o método que devolve 400 com um objeto ProblemDetails de validação em Minimal APIs.', 'return Results.___(new Dictionary<string, string[]> { ["itens"] = new[] { "Inválido" } });', ['ValidationProblem'], 'Results.ValidationProblem produz uma resposta 400 no formato padrão de problemas de validação.'),
        mcq('q5', 'Onde fica a connection string de produção neste projeto?', 'b', [
          'No Dockerfile, em ENV',
          'Em variável de ambiente (ConnectionStrings__Loja) injetada na execução',
          'No appsettings.json versionado',
          'No código do LojaContext'
        ], 'Segredos entram em tempo de execução; imagem e repositório não devem conter credenciais.'),
        mcq('q6', 'Qual log respeita melhor a LGPD?\nA) log.LogInformation("Pedido de {Nome} {Cpf} criado", nome, cpf);\nB) log.LogInformation("Pedido {PedidoId} criado", pedido.Id);', 'd', [
          'A, pois facilita depurar',
          'Os dois são equivalentes',
          'Nenhum log deve existir',
          'B, que registra apenas o identificador, sem dados pessoais'
        ], 'Logs com identificadores técnicos atendem à auditoria sem expor dados pessoais desnecessários.'),
        mcq('q7', 'Qual teste de integração valida a proteção do endpoint?', 'c', [
          'Chamar a API com token válido e esperar 200 sempre',
          'Verificar o tamanho da imagem Docker',
          'Chamar sem token e esperar 401, e com token de outro cliente esperar 404',
          'Executar o dotnet format'
        ], 'Testar os caminhos negativos garante que a autenticação e a propriedade do recurso funcionam.'),
        fill('q8', 'Complete com o comando que lista pacotes vulneráveis, útil como etapa do CI.', 'dotnet list package --___', ['vulnerable'], 'Falhas conhecidas em dependências são um risco do OWASP Top 10; checar no CI evita publicá-las.')
      ]
    },
  ]
};
