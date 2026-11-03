// Módulo "Intermediário" do curso de Frameworks Frontend (React, Vue, Angular) — parte A (lições 01 a 25).
// Cada lição tem 8 questões (3 múltipla escolha + 1 lacuna, duas vezes). Ver ../../index.js para o formato
// e a validação de boot. Código de React/JSX, Vue SFC, Angular, CSS e HTML é ILUSTRATIVO (sem build nem
// navegador no ambiente de autoria); só o JavaScript puro didático foi executado de verdade e a saída
// mostrada nos slides é a saída real. Dados pessoais são sempre fictícios (usuario@example.com), segredos
// são placeholders e nenhum número de versão ou estatística é afirmado: conferir a documentação oficial
// da versão em uso. LGPD só em visão geral, sem substituir orientação jurídica.
// Helpers: mcq recebe a letra correta e as 4 alternativas; mc escreve a alternativa correta primeiro e
// a posiciona por uma sequência fixa e balanceada (texto e letra nunca se separam); fill recebe prompt,
// código com a lacuna ___ e a lista de respostas aceitas (a 1ª é a canônica); sl() monta um slide.
const mcq = (id, prompt, answer, texts, explanation) => ({
  id,
  kind: 'mcq',
  prompt,
  choices: texts.map((text, i) => ({ id: 'abcd'[i], text })),
  answer,
  explanation
});

const SEQ = 'cadbbdacdabcbcdaadcbdbcacdba';
let seqIdx = 0;
const mc = (id, prompt, correct, wrongs, explanation) => {
  const pos = 'abcd'.indexOf(SEQ[seqIdx++ % SEQ.length]);
  const texts = [...wrongs];
  texts.splice(pos, 0, correct);
  return mcq(id, prompt, 'abcd'[pos], texts, explanation);
};

const fill = (id, prompt, code, accept, explanation) => ({ id, kind: 'fill', prompt, code, accept, explanation });

const sl = (title, body, code) => (code ? { title, body, code } : { title, body });

module.exports = {
  id: 'intermediario-frontend',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Reatividade por dentro, virtual DOM, React com hooks, estado e dados do servidor, Vue com Composition API e Pinia, Angular com signals, DI, RxJS e formulários, e design systems',
  accent: '#8b5cf6',
  lessons: [
    {
      id: 'fii-01-reatividade-por-dentro',
      title: 'Reatividade por dentro',
      goal: 'Entender como uma interface reage a mudanças de dados (push x pull, Proxy, signals, observáveis) e como React, Vue e Angular se relacionam com essas ideias.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: manter tela e dados em sincronia',
            'Reatividade é a capacidade de a interface se atualizar sozinha quando os dados mudam. Sem ela, você muda uma variável e precisa lembrar de mexer manualmente em cada pedaço da tela que a usa (como no DOM puro do nível iniciante). Com ela, você descreve a relação uma vez ("a tela mostra o nome") e o sistema cuida de reexecutar essa descrição quando o nome mudar. Erro comum: achar que a reatividade é mágica do navegador; ela é código de biblioteca, e dá para escrever uma versão mínima em poucas linhas.'
          ),
          sl(
            'Pull x push',
            'Há duas formas de saber que algo mudou. No modelo PULL (puxar), a interface relê os dados e recalcula o resultado quando necessário (é a ideia de reexecutar a renderização do componente e comparar, como o React faz ao chamar sua função de novo). No modelo PUSH (empurrar), o dado avisa quem depende dele no instante em que muda (é a ideia de signals, observáveis e do sistema do Vue). Push avisa só quem precisa, mas exige registrar dependências; pull é simples, mas pode reler mais do que o necessário.'
          ),
          sl(
            'Signals: valor + lista de interessados',
            'Um signal é um valor que guarda a lista de quem o leu. Ler (get) dentro de um efeito registra o efeito como dependente; escrever (set) avisa todos os dependentes. Um efeito é uma função que roda uma vez e roda de novo quando algum signal lido por ela muda. Abaixo, um mini sistema em JavaScript puro (executado de verdade). Note que atribuir o mesmo valor não dispara nada: o set compara com Object.is antes de avisar.',
            'let atual = null;\nfunction signal(v) {\n  const subs = new Set();\n  return {\n    get() { if (atual) subs.add(atual); return v; },\n    set(n) { if (Object.is(n, v)) return; v = n; [...subs].forEach((f) => f()); }\n  };\n}\nfunction effect(fn) { atual = fn; fn(); atual = null; }\nconst nome = signal("Ana");\neffect(() => console.log("Olá,", nome.get()));\nnome.set("Bia");\nnome.set("Bia");\nnome.set("Caio");\n// saída real:\n// Olá, Ana\n// Olá, Bia\n// Olá, Caio'
          ),
          sl(
            'Proxy: interceptar leituras e escritas de objetos',
            'Um Proxy do JavaScript embrulha um objeto e permite interceptar operações com funções chamadas traps (armadilhas): get para leitura, set para escrita. É a base do reactive() do Vue 3: ao ler uma propriedade o Vue registra a dependência, ao escrever ele avisa os dependentes. A vantagem é que você escreve estado.contador++ como em JS comum. Limite: o Proxy só vê o que passa por ELE; mexer no objeto original (fora do proxy) não notifica ninguém.',
            'function reativo(obj, aoMudar) {\n  return new Proxy(obj, {\n    set(alvo, chave, valor) { alvo[chave] = valor; aoMudar(chave, valor); return true; }\n  });\n}\nconst estado = reativo({ contador: 0 }, (k, v) => console.log("mudou", k, "->", v));\nestado.contador = 1;\nestado.contador++;\n// saída real:\n// mudou contador -> 1\n// mudou contador -> 2'
          ),
          sl(
            'Observáveis: fluxos de valores ao longo do tempo',
            'Um observável (Observable, do RxJS) representa um FLUXO de valores que pode emitir várias vezes ao longo do tempo (cliques, respostas de rede, digitação). Quem se interessa faz subscribe e recebe cada valor (modelo push). Diferente de um signal, que sempre tem um valor atual, um observável pode nem ter emitido ainda e pode ser concluído ou falhar. Erro comum: esquecer de cancelar a inscrição (unsubscribe) e deixar o fluxo vivo depois que o componente sumiu (vazamento de memória).'
          ),
          sl(
            'Como os três frameworks se relacionam com isso',
            'React: chama sua função de componente de novo quando o estado muda (setState) e compara o resultado com o anterior; não rastreia dependências automaticamente em tempo de execução. Vue: usa Proxy (ref e reactive) e rastreia dependências por push, sabendo exatamente qual efeito reexecutar. Angular: tradicionalmente detectava mudanças após eventos; em versões recentes usa signals (valor + dependentes) e usa RxJS para fluxos assíncronos. Todos chegam ao mesmo objetivo (tela = função dos dados) por caminhos diferentes. Código de framework é ilustrativo; confira a documentação oficial da versão em uso.'
          )
        ]
      },
      questions: [
        mc('q1', 'Em um mini sistema de signals, um effect lê nome.get() uma vez. Depois você chama nome.set("Bia") com um valor diferente do atual. O que acontece?', 'O effect é registrado como dependente na leitura e reexecuta quando o set avisa os dependentes', [
          'O effect roda uma única vez na criação, porque a leitura feita dentro dele não cria nenhuma ligação com o signal lido',
          'O navegador detecta a mudança da variável e reexecuta toda a página',
          'O signal pergunta a cada segundo se o valor mudou e só então reexecuta'
        ], 'A leitura dentro do effect registra o effect na lista de dependentes; o set com valor diferente avisa essa lista (push). Não há polling nem ajuda do navegador, e o effect não roda só uma vez.'),
        mc('q2', 'Qual é a principal diferença entre um signal e um observável (RxJS)?', 'O signal sempre tem um valor atual para ler; o observável é um fluxo que pode emitir vários valores no tempo e até ainda não ter emitido', [
          'O signal só funciona em Angular, enquanto o observável só funciona em Vue e em React',
          'O observável guarda um único valor fixo, enquanto o signal emite vários valores ao longo do tempo',
          'Os dois são idênticos; mudam apenas o nome usado em cada biblioteca'
        ], 'Signal = valor atual sempre disponível; observável = fluxo no tempo, que pode concluir ou falhar. Os conceitos existem em várias bibliotecas e não são idênticos, nem invertidos.'),
        mc('q3', 'Qual descrição corresponde ao modelo PUSH de reatividade?', 'O dado avisa os dependentes no momento em que muda', [
          'A interface relê os dados de tempos em tempos para ver se algo mudou',
          'O usuário precisa clicar em um botão de atualizar para a tela refletir o dado',
          'O servidor reenvia a página inteira a cada mudança de um valor'
        ], 'Push significa que quem muda avisa quem depende. Reler periodicamente é pull; atualização manual e reenvio de página não são o modelo de reatividade descrito.'),
        fill('q4', 'Complete com a função do JavaScript usada no mini signal para comparar o valor novo com o atual antes de avisar os dependentes.', 'set(n) { if (___(n, v)) return; v = n; avisar(); }', ['Object.is'], 'Object.is compara se o valor novo é igual ao atual; se for, não há o que avisar e o set retorna sem disparar efeitos.'),
        mc('q5', 'No Vue 3, reactive() usa Proxy. Você guarda o objeto original numa variável e depois faz original.contador = 5 (e não pelo proxy retornado). O que acontece com a tela?', 'Ela não reage, porque o Proxy só intercepta operações feitas por meio dele', [
          'Ela atualiza normalmente, pois o Proxy observa também o objeto original',
          'O Vue lança um erro em tempo de execução e impede a atribuição direta ao objeto original que foi guardado em outra variável',
          'A tela atualiza só depois de um novo evento de clique do usuário'
        ], 'O Proxy só enxerga o que passa por ele; mexer no original não aciona as traps. Por isso se usa o objeto reativo retornado. O Vue não bloqueia a atribuição, mas ela fica invisível para a reatividade.'),
        mc('q6', 'Um componente assina um observável de cliques com subscribe e nunca cancela. O componente é removido da tela. Qual é o risco?', 'A inscrição continua viva e o fluxo mantém o código e a memória em uso (vazamento)', [
          'Nada: o navegador cancela todas as inscrições ao remover um elemento do DOM',
          'O observável passa a emitir valores duplicados para o novo componente criado depois',
          'O componente volta a ser desenhado automaticamente na tela em seguida'
        ], 'Sem unsubscribe (ou um mecanismo que o faça por você), o fluxo continua ativo e referenciando callbacks, o que vaza memória. O navegador não cancela inscrições de RxJS por conta própria.'),
        mc('q7', 'Qual afirmação descreve melhor a abordagem do React diante de uma mudança de estado?', 'Reexecuta a função do componente e compara o resultado novo com o anterior para atualizar o DOM', [
          'Usa Proxy para descobrir qual expressão do template leu cada propriedade',
          'Mantém uma lista de effects dependentes por variável e reexecuta somente eles',
          'Troca o DOM inteiro da página por HTML novo a cada mudança de estado, para garantir que nada fique desatualizado'
        ], 'No React o estado muda, a função do componente roda de novo e a comparação (reconciliação) decide o que mexer no DOM. O rastreamento por Proxy é do Vue, e trocar o DOM todo não é o que ele faz.'),
        fill('q8', 'Complete com o nome do recurso do JavaScript que embrulha um objeto e permite interceptar leitura e escrita (base do reactive do Vue 3).', 'const estado = new ___(obj, { set(alvo, chave, valor) { /* avisar */ return true; } });', ['Proxy'], 'Proxy permite definir traps (get, set) para interceptar operações no objeto, o que o Vue usa para rastrear dependências.')
      ]
    },
    {
      id: 'fii-02-virtual-dom-e-reconciliacao',
      title: 'Virtual DOM e reconciliação',
      goal: 'Entender a árvore virtual, o diff e o papel das keys, e como React, Vue e Angular chegam à atualização mínima do DOM por caminhos distintos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que não reescrever o DOM inteiro',
            'Mexer no DOM real é relativamente caro e reescrever tudo perde estado do navegador (foco do campo, texto digitado, rolagem). A ideia de um virtual DOM é descrever a interface como uma árvore de objetos JavaScript comuns (leves), gerar uma árvore nova a cada mudança e COMPARAR com a anterior, aplicando no DOM real só o que difere. A árvore virtual é só dados: cada nó tem um tipo (por exemplo "li"), props (atributos) e filhos.'
          ),
          sl(
            'Mini virtual DOM com diff (executado)',
            'A função h cria nós; diff compara dois nós e devolve a lista de operações necessárias. Regras: nó ausente antes = CRIAR; ausente depois = REMOVER; tipos diferentes = SUBSTITUIR (descarta a subárvore); mesmo tipo = comparar props e filhos na mesma posição. O resultado abaixo é a saída real do código.',
            'const h = (tipo, props, ...filhos) => ({ tipo, props: props || {}, filhos });\nfunction diff(a, b, caminho = "raiz") {\n  if (a === undefined) return ["CRIAR " + caminho];\n  if (b === undefined) return ["REMOVER " + caminho];\n  if (typeof a === "string" || typeof b === "string")\n    return a === b ? [] : [`TEXTO ${caminho}: "${a}" -> "${b}"`];\n  if (a.tipo !== b.tipo) return [`SUBSTITUIR ${caminho}: ${a.tipo} -> ${b.tipo}`];\n  const out = [];\n  for (const k of new Set([...Object.keys(a.props), ...Object.keys(b.props)]))\n    if (a.props[k] !== b.props[k]) out.push(`PROP ${caminho}.${k}: ${a.props[k]} -> ${b.props[k]}`);\n  const n = Math.max(a.filhos.length, b.filhos.length);\n  for (let i = 0; i < n; i++) out.push(...diff(a.filhos[i], b.filhos[i], `${caminho}/${i}`));\n  return out;\n}\n// v1: ul > li.a "Pão", li "Leite"   v2: ul > li.b "Pão", li "Café", li "Ovos"\n// saída real:\n// PROP raiz/0.class: a -> b\n// TEXTO raiz/1/0: "Leite" -> "Café"\n// CRIAR raiz/2'
          ),
          sl(
            'Reconciliação e o papel das keys',
            'Reconciliação é o nome do processo de comparar a árvore nova com a antiga e decidir o mínimo de mudanças. Em listas, comparar por POSIÇÃO falha quando itens são reordenados, inseridos ou removidos: o item da posição 0 passa a ser outro e o estado interno (um campo digitado, por exemplo) fica com o item errado. A key (chave) é uma identidade estável por item, que permite reaproveitar o nó certo. Abaixo, o algoritmo de keys em miniatura (saída real): reaproveita quem tem a mesma chave e cria quem é novo.',
            'function porChave(antes, depois) {\n  const m = new Map(antes.map((x) => [x.key, x]));\n  return depois.map((x) => (m.has(x.key) ? "reusa " + x.key : "cria " + x.key)).join(", ");\n}\nconsole.log(porChave([{key:"a"},{key:"b"},{key:"c"}], [{key:"c"},{key:"a"},{key:"d"}]));\n// saída real:\n// reusa c, reusa a, cria d'
          ),
          sl(
            'Keys: o que usar e o que evitar',
            'Use um identificador estável e único entre irmãos, normalmente o id do registro (ilustrativo, não executado aqui): em React key={item.id}, em Vue :key="item.id" dentro do v-for, em Angular track item.id no @for. Evite o índice do array como key quando a lista pode reordenar ou ter itens inseridos/removidos (o índice troca de dono), e evite valores aleatórios gerados a cada render (Math.random faz o item ser recriado sempre, perdendo estado e desempenho). Índice só é aceitável para listas estáticas que nunca mudam de ordem.'
          ),
          sl(
            'Como React, Vue e Angular diferem',
            'React: renderiza para uma árvore de elementos (virtual DOM) e reconcilia com a anterior; o custo é reexecutar componentes e comparar. Vue: também usa uma árvore virtual, mas o compilador de templates analisa o template e marca partes estáticas e dinâmicas, então o Vue pula o que nunca muda e a reatividade por Proxy sabe qual componente reagir. Angular: compila templates em instruções que atualizam o DOM direto, sem virtual DOM; a detecção de mudanças decide quando checar cada binding (e, com signals, quais pontos precisam atualizar). Resumo: React compara árvores, Vue combina compilador e árvore virtual, Angular compila para atualizações diretas. Confira a documentação oficial da versão em uso.'
          )
        ]
      },
      questions: [
        mc('q1', 'Uma lista tem três itens com campos de texto. Você remove o primeiro item e a lista usa o índice como key. O que pode acontecer com o texto digitado nos campos?', 'Os campos ficam com o texto trocado de dono, porque o índice 0 passou a identificar outro item', [
          'Nada muda nos campos, pois o índice identifica bem o item enquanto a lista continuar tendo o mesmo formato original',
          'O React apaga todo o conteúdo da página e redesenha o documento inteiro',
          'Os itens restantes somem e só reaparecem depois de recarregar a página'
        ], 'Com índice como key, a identidade é a posição; ao remover o primeiro, o item seguinte herda a key 0 e o estado do nó antigo. Uma key estável por registro evita isso. O índice não é sempre bom, e a página não é redesenhada por inteiro.'),
        mc('q2', 'No mini diff, o nó antigo é um "div" e o novo é um "section" na mesma posição. Qual operação é gerada?', 'SUBSTITUIR, descartando a subárvore antiga', [
          'PROP, pois só o nome do tipo mudou e os filhos continuam iguais',
          'TEXTO, pois o conteúdo visível do nó foi alterado na posição',
          'Nenhuma, porque tipos diferentes são tratados como equivalentes'
        ], 'Tipos diferentes significam que não vale reaproveitar o nó nem a subárvore, então substitui. PROP e TEXTO valem para o mesmo tipo, e o diff não ignora a diferença de tipo.'),
        mc('q3', 'Qual das opções é uma boa key para itens de uma lista que o usuário pode reordenar?', 'O id único do registro vindo dos dados', [
          'O índice do item no array, pois ele muda junto com a ordem',
          'Um número aleatório gerado a cada renderização para ser único',
          'O texto do primeiro caractere do título de cada item'
        ], 'O id do registro é estável e único. O índice troca de dono ao reordenar, o número aleatório força recriação toda vez, e o caractere inicial pode repetir entre itens.'),
        fill('q4', 'Complete com o nome do processo de comparar a árvore nova com a anterior para decidir o mínimo de mudanças no DOM.', 'A ___ compara a árvore virtual nova com a antiga e aplica só as diferenças.', ['reconciliação', 'reconciliacao', 'reconciliation'], 'Reconciliação é o processo de comparar árvores e decidir as mudanças mínimas, base do React e de bibliotecas com virtual DOM.'),
        mc('q5', 'Qual é a característica do Angular em relação ao virtual DOM?', 'Compila os templates em instruções que atualizam o DOM direto e decide quando checar cada binding, sem árvore virtual', [
          'Mantém uma árvore virtual completa e a compara a cada tecla digitada',
          'Reexecuta cada componente inteiro e compara o resultado como o React faz',
          'Substitui o DOM por HTML novo a cada clique para evitar inconsistência'
        ], 'O Angular não depende de virtual DOM: o compilador gera código que atualiza bindings específicos. Reexecutar e comparar é o modelo do React, e trocar o HTML todo não é prática do framework.'),
        mc('q6', 'O que o compilador de templates do Vue ajuda a evitar?', 'Comparar partes do template que ele identifica como estáticas e que nunca mudam', [
          'Escrever HTML nos arquivos de componente, já que o Vue usa só JavaScript puro',
          'A necessidade de atualizar o DOM real, já que o navegador faz essa atualização por conta própria e sem custo algum',
          'O uso de reatividade, já que tudo no template é recalculado do zero'
        ], 'Ao analisar o template, o Vue marca o que é estático e pula essas partes no diff. Ele ainda usa HTML nos templates, ainda atualiza o DOM e se apoia em reatividade.'),
        mc('q7', 'Por que o virtual DOM compara árvores de objetos em vez de recriar o DOM real a cada mudança?', 'Objetos JavaScript são baratos de criar e comparar, e só as diferenças tocam o DOM real, preservando foco e estado dos elementos', [
          'Porque o DOM real não pode ser alterado depois de criado e por isso precisa ser recriado do zero a cada mudança de dados, o que torna a árvore de objetos obrigatória',
          'Porque o navegador exige uma árvore de objetos antes de exibir qualquer página',
          'Porque assim o servidor consegue validar os dados digitados pelo usuário'
        ], 'O ganho é aplicar mudanças pontuais e manter o estado do navegador nos nós que permanecem. O DOM pode ser alterado, o navegador não exige árvore virtual e validação de servidor é outro assunto.'),
        fill('q8', 'Complete a key em React para uma lista de tarefas, usando o identificador único de cada registro.', 'tarefas.map((t) => <li key={___}>{t.titulo}</li>)', ['t.id'], 'A key deve ser o identificador estável do registro; t.id mantém a identidade do item mesmo se a lista for reordenada.')
      ]
    },
    {
      id: 'fii-03-react-hooks-avancados',
      title: 'React: hooks avançados',
      goal: 'Usar useRef, useMemo, useCallback e useReducer com critério, sabendo quando cada um ajuda e quando é desnecessário.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'useRef: um valor que sobrevive sem redesenhar',
            'useRef devolve um objeto { current } que persiste entre renderizações e cuja alteração NÃO causa nova renderização. Serve para dois usos: guardar uma referência a um elemento do DOM (ex.: dar foco a um campo) e guardar um valor mutável que não aparece na tela (ex.: um id de timer). Erro comum: usar ref para algo que a tela mostra; como mudar ref.current não redesenha, a tela fica desatualizada. Se o valor aparece na interface, use useState. Também não leia nem escreva ref.current durante a renderização; faça isso em eventos e efeitos. (Código React é ilustrativo, não executado aqui.)',
            'function Busca() {\n  const campo = useRef(null);\n  return (\n    <>\n      <input ref={campo} />\n      <button onClick={() => campo.current.focus()}>Focar</button>\n    </>\n  );\n}'
          ),
          sl(
            'useMemo e useCallback: memorizar com dependências',
            'useMemo(fn, deps) guarda o RESULTADO de um cálculo e só o refaz quando alguma dependência da lista muda. useCallback(fn, deps) guarda a própria FUNÇÃO (mesma identidade entre renderizações) até as dependências mudarem. Quando valem a pena: o cálculo é realmente caro, ou você passa o valor/função para um componente filho memorizado com memo (que compara props por identidade) ou para a lista de dependências de outro hook. Quando NÃO usar: cálculos baratos (somar três números) e funções que ninguém compara; memorizar tem custo de comparar dependências e deixa o código mais difícil de ler. Meça antes de otimizar.',
            'const visiveis = useMemo(\n  () => tarefas.filter((t) => t.titulo.includes(filtro)),\n  [tarefas, filtro]\n);\nconst remover = useCallback((id) => {\n  setTarefas((atuais) => atuais.filter((t) => t.id !== id));\n}, []);'
          ),
          sl(
            'useReducer: várias ações sobre um estado',
            'useReducer(reducer, estadoInicial) devolve [estado, dispatch]. O reducer é uma função PURA (sem efeitos colaterais) que recebe o estado atual e uma ação (um objeto descrevendo o que aconteceu, como { tipo: "adicionar" }) e devolve o PRÓXIMO estado, sem mutar o anterior. Vale mais que useState quando há muitas transições relacionadas, o próximo estado depende do anterior ou você quer testar a lógica isolada. Como é JavaScript puro, dá para executar o reducer fora do React (saída real no próximo slide).'
          ),
          sl(
            'Reducer em JavaScript puro (executado)',
            'Observe a imutabilidade: cada ação devolve um objeto novo; o estado antigo continua intacto. Uma ação desconhecida devolve o MESMO objeto (mesma identidade), então o React nem precisa redesenhar. Os valores abaixo vêm da execução real.',
            'function reducer(estado, acao) {\n  switch (acao.tipo) {\n    case "adicionar": return { ...estado, itens: [...estado.itens, { id: acao.id, nome: acao.nome, qtd: 1 }] };\n    case "incrementar": return { ...estado, itens: estado.itens.map((i) => (i.id === acao.id ? { ...i, qtd: i.qtd + 1 } : i)) };\n    case "remover": return { ...estado, itens: estado.itens.filter((i) => i.id !== acao.id) };\n    default: return estado;\n  }\n}\n// s0 = { itens: [] }; s1 = adicionar Caneta; s2 = incrementar; s3 = ação desconhecida\n// JSON.stringify(s2) -> {"itens":[{"id":1,"nome":"Caneta","qtd":2}]}\n// s0.itens.length, s1.itens[0].qtd, s2.itens[0].qtd -> 0 1 2\n// s3 === s2, s1 === s2 -> true false\n// remover id 1 -> {"itens":[]}'
          ),
          sl(
            'Escolhendo a ferramenta certa',
            'Regra prática: valor que aparece na tela e muda → useState; muitas ações relacionadas → useReducer; referência a DOM ou valor mutável invisível → useRef; cálculo caro ou identidade estável exigida por filho memorizado/dependência → useMemo/useCallback. Erro comum: "envolver tudo em useCallback por garantia", o que piora a leitura sem ganho. Em versões recentes, o React Compiler pode memorizar automaticamente em muitos casos, reduzindo a necessidade manual; confira a documentação oficial da versão em uso.'
          )
        ]
      },
      questions: [
        mc('q1', 'Você quer dar foco a um campo de texto quando o usuário clica em um botão. Qual hook é o mais adequado?', 'useRef, ligando a ref ao input e chamando focus() no clique', [
          'useMemo, guardando o resultado de focar o campo para reaproveitar depois',
          'useReducer, enviando uma ação de foco para o estado global do app',
          'useState, guardando o elemento do DOM e trocando o estado a cada clique'
        ], 'useRef dá acesso ao elemento DOM sem redesenhar. useMemo guarda resultados de cálculo, useReducer organiza transições de estado e guardar o elemento em useState causaria renderizações desnecessárias.'),
        mc('q2', 'Um componente guarda um contador em ref.current e o exibe na tela. Ao incrementar ref.current, a tela não muda. Por quê?', 'Alterar ref.current não dispara nova renderização, então o valor exibido não é reavaliado', [
          'O React proíbe alterar ref.current e descarta silenciosamente a atribuição feita',
          'A ref só funciona dentro de useEffect e ignora qualquer atribuição feita em manipuladores de evento do componente',
          'O valor foi alterado, mas o navegador guarda a tela antiga em cache'
        ], 'Mudar ref.current é permitido (em eventos e efeitos), porém não agenda renderização. Para valores exibidos use useState. Não há proibição, restrição a useEffect nem cache de tela envolvido.'),
        mc('q3', 'Em qual situação useMemo traz benefício real?', 'Um filtro e ordenação sobre milhares de itens que só deve refazer quando a lista ou o filtro mudarem', [
          'Somar dois números inteiros pequenos a cada renderização do componente',
          'Guardar o valor digitado em um campo de texto controlado pelo usuário',
          'Executar uma requisição de rede cada vez que o componente renderizar'
        ], 'Memorizar compensa em cálculo caro com dependências claras. Somar dois números é barato; guardar texto é papel de useState; requisições pertencem a efeitos ou bibliotecas de dados, não a useMemo.'),
        fill('q4', 'Complete com o nome do hook que devolve [estado, dispatch] e recebe uma função redutora e um estado inicial.', 'const [estado, dispatch] = ___(reducer, { itens: [] });', ['useReducer'], 'useReducer recebe o reducer e o estado inicial e devolve o estado atual e o dispatch para enviar ações.'),
        mc('q5', 'Qual é uma característica obrigatória de uma função reducer?', 'Ser pura: devolver o próximo estado a partir do atual e da ação, sem mutar o anterior nem causar efeitos', [
          'Poder chamar a API do servidor e alterar o estado antigo diretamente',
          'Usar variáveis globais para lembrar o último estado calculado entre chamadas',
          'Retornar um objeto novo para toda ação recebida, inclusive para ações desconhecidas, que deveriam ser ignoradas pelo reducer'
        ], 'O reducer deve ser puro e imutável. Chamar API e mutar o estado quebram isso, e depender de globais torna o resultado imprevisível. Para ações desconhecidas, devolver o mesmo estado é o padrão.'),
        mc('q6', 'Quando useCallback costuma ser desnecessário?', 'Ao criar um handler de clique para um botão comum, que nenhum filho memorizado nem hook compara', [
          'Ao passar uma função para um componente filho envolvido em memo que compara props',
          'Ao colocar uma função na lista de dependências de um useEffect, para que o efeito não rode de novo sem necessidade alguma',
          'Ao entregar um callback estável a muitos itens de uma lista memorizada'
        ], 'Sem comparação de identidade por parte de um filho memorizado ou de um hook, a função nova a cada render não custa nada relevante. As outras opções são os casos clássicos em que a identidade estável importa.'),
        mc('q7', 'O estado antigo é { itens: [A] }. O reducer trata "adicionar B" com estado.itens.push(B) e retorna o próprio estado. Qual é o problema?', 'Muta o estado anterior e devolve a mesma identidade, então o React pode não perceber a mudança', [
          'push é lento demais e só por isso o React recusa a atualização do estado',
          'O reducer deveria retornar apenas o item novo, e não o estado completo',
          'O React exige que todo estado seja um número ou uma string simples, e por isso objetos e listas não são aceitos em reducers'
        ], 'Mutar e retornar a mesma referência esconde a mudança de quem compara identidade. O certo é copiar: { ...estado, itens: [...estado.itens, B] }. O reducer devolve o estado completo, e objetos são permitidos.'),
        fill('q8', 'Complete com o hook que guarda o resultado de um cálculo e só o refaz quando as dependências mudam.', 'const total = ___(() => itens.reduce((s, i) => s + i.preco, 0), [itens]);', ['useMemo'], 'useMemo memoriza o resultado do cálculo enquanto as dependências não mudam.')
      ]
    },
    {
      id: 'fii-04-react-hooks-personalizados',
      title: 'React: hooks personalizados',
      goal: 'Extrair lógica reutilizável em hooks use*, respeitando as regras dos hooks e cuidando de dados pessoais ao persistir no navegador.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um hook personalizado',
            'Um hook personalizado é uma função JavaScript cujo nome começa com use e que chama outros hooks (useState, useEffect...). Serve para extrair e reutilizar LÓGICA com estado entre componentes sem duplicar código e sem mudar a hierarquia de componentes. Cada componente que chama o hook recebe sua PRÓPRIA cópia do estado: hooks compartilham lógica, não estado. (Código ilustrativo, não executado aqui.)',
            'function useContador(inicial = 0) {\n  const [n, setN] = useState(inicial);\n  const inc = () => setN((x) => x + 1);\n  const zerar = () => setN(inicial);\n  return { n, inc, zerar };\n}'
          ),
          sl(
            'Regras dos hooks e por que o prefixo use',
            'Duas regras: (1) chame hooks apenas no nível superior de componentes ou outros hooks, nunca dentro de if, laços ou funções aninhadas, porque o React identifica cada hook pela ORDEM das chamadas; (2) chame hooks apenas em componentes de função ou hooks personalizados, nunca em funções comuns. O prefixo use é a convenção que permite ao linter (eslint-plugin-react-hooks) verificar essas regras e avisa o leitor de que a função usa hooks. Erro comum: chamar um hook condicionalmente ("se logado, useState"): a ordem muda entre renderizações e o React se perde.'
          ),
          sl(
            'Exemplo: useDebounce e a ideia por trás',
            'Debounce atrasa uma ação até o usuário parar de digitar por um tempo, evitando disparar uma busca a cada tecla. O hook guarda um valor atrasado e usa useEffect com limpeza (cleanup): cada nova digitação cancela o timer anterior. A lógica é puro JavaScript e foi executada com um relógio falso: depois de "r", "re", "rea" em intervalos curtos, nada dispara; só 300 ms após o último valor a busca roda (ilustrativo abaixo, saída real no código de debounce).',
            'function useDebounce(valor, espera = 300) {\n  const [atrasado, setAtrasado] = useState(valor);\n  useEffect(() => {\n    const id = setTimeout(() => setAtrasado(valor), espera);\n    return () => clearTimeout(id); // limpeza\n  }, [valor, espera]);\n  return atrasado;\n}'
          ),
          sl(
            'Debounce em JavaScript puro (executado)',
            'Versão sem React, com relógio injetado para ser testável. Buscas: "r" em t=0, "re" em t=100, "rea" em t=200; avançamos até t=499 e nada rodou; em t=500 (300 ms após o último) dispara só a última busca. Depois "reac" dispara 300 ms mais tarde.',
            'function debounce(fn, espera, relogio) {\n  let id = null;\n  return (...args) => {\n    if (id !== null) relogio.cancelar(id);\n    id = relogio.agendar(() => fn(...args), espera);\n  };\n}\n// saída real:\n// ainda nada, t=499\n// busca: rea t=500\n// busca: reac t=800'
          ),
          sl(
            'useLocalStorage e cuidado com dados pessoais',
            'Um hook que lê e grava um valor no localStorage mantém preferências entre visitas (tema, idioma). Cuidados: (1) o localStorage é legível por qualquer script da página, então um XSS expõe tudo o que está lá; nunca guarde tokens de sessão nem senhas nele (prefira cookie HttpOnly definido pelo servidor); (2) dados pessoais (nome, e-mail, CPF) só quando realmente necessário, com o menor conteúdo possível e prazo de retenção; (3) trate JSON.parse com try/catch, pois o valor pode estar corrompido. Preferências de tema são um bom uso; um perfil completo de usuário, não. LGPD em visão geral: minimização de dados; isto não substitui orientação jurídica.',
            'function useLocalStorage(chave, inicial) {\n  const [valor, setValor] = useState(() => {\n    try {\n      const salvo = localStorage.getItem(chave);\n      return salvo !== null ? JSON.parse(salvo) : inicial;\n    } catch { return inicial; }\n  });\n  useEffect(() => {\n    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* cota/privacidade */ }\n  }, [chave, valor]);\n  return [valor, setValor];\n}\n// uso seguro: useLocalStorage("tema", "claro")  // nada pessoal'
          )
        ]
      },
      questions: [
        mc('q1', 'Dois componentes diferentes chamam useContador(). O que acontece com o estado?', 'Cada componente recebe seu próprio estado independente, pois hooks compartilham lógica e não estado', [
          'Os dois compartilham o mesmo número, como se fosse uma variável global',
          'O segundo componente a renderizar substitui o estado do primeiro',
          'O React lança erro, pois um hook só pode ser usado em um componente'
        ], 'Cada chamada de hook cria estado próprio na instância do componente. Para compartilhar estado seria preciso Context ou uma store externa. Não há substituição nem erro.'),
        mc('q2', 'Por que não se deve chamar um hook dentro de um if?', 'O React identifica os hooks pela ordem das chamadas, e um if pode mudar essa ordem entre renderizações', [
          'Porque o JavaScript não permite declarar funções dentro de blocos condicionais',
          'Porque hooks só funcionam em componentes que não recebem props, e o if poderia alterar as props recebidas entre renderizações',
          'Porque o if executa uma única vez e esconde o resultado do hook'
        ], 'A associação entre cada chamada e seu estado depende da ordem estável. JavaScript permite blocos condicionais, hooks funcionam com props e o if pode executar em toda renderização, mas quebra a ordem.'),
        mc('q3', 'Qual é o papel da função retornada em useEffect no useDebounce?', 'Cancelar o timer anterior antes de um novo efeito rodar ou do componente sumir', [
          'Disparar a busca imediatamente, sem esperar o tempo definido de atraso, para que a resposta chegue mais depressa ao usuário',
          'Guardar o valor digitado no localStorage para uso na próxima visita',
          'Redesenhar o componente para mostrar o texto mais recente do campo'
        ], 'A limpeza roda antes do próximo efeito e na desmontagem; ali se faz clearTimeout para que só o último valor dispare. Ela não executa a busca, não persiste dados e não força renderização.'),
        fill('q4', 'Complete com o prefixo obrigatório por convenção no nome de um hook personalizado.', 'function ___Contador() { const [n, setN] = useState(0); return [n, setN]; }', ['use'], 'Hooks personalizados começam com use, o que permite ao linter verificar as regras dos hooks e sinaliza ao leitor o uso de hooks.'),
        mc('q5', 'Um colega propõe guardar o token de sessão do usuário no localStorage via useLocalStorage. Qual é a melhor orientação?', 'Evitar: scripts da página (inclusive via XSS) leem o localStorage; prefira cookie HttpOnly definido pelo servidor', [
          'Aceitar, pois o localStorage é criptografado automaticamente pelo navegador',
          'Aceitar, desde que a chave tenha um nome difícil de adivinhar, pois assim os invasores não conseguem encontrar o token que ficou guardado',
          'Aceitar, pois só o domínio da página consegue ler, o que elimina o risco de XSS'
        ], 'O localStorage é acessível por qualquer JavaScript da origem, então um XSS leria o token. Cookie HttpOnly não é legível por script. O armazenamento não é criptografado e o nome da chave não protege nada.'),
        mc('q6', 'Qual preferência é um uso adequado de useLocalStorage?', 'O tema da interface (claro ou escuro) escolhido pelo usuário', [
          'O CPF do usuário, para preencher formulários mais rápido na visita seguinte',
          'A senha digitada, para evitar que a pessoa precise lembrar dela',
          'O token de acesso, para manter a sessão aberta após fechar o navegador'
        ], 'O tema não é dado pessoal sensível nem credencial, então a persistência local é adequada. CPF e senha são dados pessoais ou segredos, e o token deve ficar em cookie HttpOnly.'),
        mc('q7', 'Em useLocalStorage, por que envolver JSON.parse em try/catch?', 'O valor salvo pode estar corrompido ou o acesso ao storage pode falhar, e o componente não deve quebrar por isso', [
          'Porque JSON.parse devolve sempre uma Promise que precisa ser resolvida',
          'Porque o try/catch criptografa o valor antes de gravar no navegador',
          'Porque sem ele o localStorage deixa de aceitar novas chaves no domínio'
        ], 'Dados salvos podem estar inválidos (editados, versões antigas) e o storage pode estar bloqueado. O JSON.parse é síncrono, try/catch não criptografa nada e não afeta a aceitação de chaves.'),
        fill('q8', 'Complete com a função do navegador usada na limpeza do effect para cancelar o timer agendado.', 'return () => ___(id); // cancela o timer anterior', ['clearTimeout'], 'clearTimeout cancela um timer criado com setTimeout, garantindo que só o último valor digitado dispare a ação.')
      ]
    },
    {
      id: 'fii-05-react-context-e-composicao',
      title: 'React: Context e composição',
      goal: 'Usar Context com critério, entender seu efeito nas re-renderizações e preferir composição ao props drilling quando possível.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Props drilling: o problema',
            'Props drilling é passar uma prop por vários níveis de componentes que não a usam, só para chegar a um componente fundo na árvore (ex.: o tema ou o usuário logado). Deixa o código verboso e frágil: renomear a prop obriga a editar todos os níveis intermediários. Há duas saídas: composição (reorganizar componentes) e Context (disponibilizar o valor para toda a subárvore). (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'Context em profundidade',
            'Context tem três peças: createContext(valorPadrao) cria o contexto; o Provider (<Contexto value={...}>) fornece o valor para a subárvore; useContext(Contexto) lê o valor mais próximo acima na árvore. Quando o value do Provider muda (por identidade), TODOS os componentes que usam aquele contexto re-renderizam, mesmo que usem só uma parte do valor. Bom para dados que mudam pouco e são lidos em muitos lugares: tema, idioma, usuário autenticado. Ruim para estado que muda a cada tecla.',
            'const TemaContext = createContext("claro");\nfunction App() {\n  const [tema, setTema] = useState("claro");\n  return (\n    <TemaContext value={tema}>\n      <Pagina />\n    </TemaContext>\n  );\n}\nfunction Botao() {\n  const tema = useContext(TemaContext);\n  return <button className={tema}>Salvar</button>;\n}'
          ),
          sl(
            'Armadilha: value novo a cada render',
            'Se o Provider recebe um objeto criado inline (value={{ usuario, sair }}), a identidade muda a cada renderização do pai e todos os consumidores re-renderizam, mesmo sem mudança real. Soluções: memorizar o valor com useMemo, ou separar contextos (um para dados, outro para ações que raramente mudam). Em versões recentes o Provider pode ser escrito direto como <Contexto value>; em versões mais antigas era <Contexto.Provider>; confira a documentação da versão em uso.',
            'function UsuarioProvider({ children }) {\n  const [usuario, setUsuario] = useState(null);\n  const valor = useMemo(() => ({ usuario, setUsuario }), [usuario]);\n  return <UsuarioContext value={valor}>{children}</UsuarioContext>;\n}'
          ),
          sl(
            'Composição: passar elementos, não dados',
            'Composição significa montar a árvore para que quem tem o dado renderize diretamente quem o usa, passando componentes prontos por children ou por props. Em vez de Layout receber "usuario" só para repassar à Barra, o componente de cima monta <Layout topo={<Barra usuario={usuario} />} />. Assim os intermediários nem sabem do dado: some o drilling sem usar Context. Regra prática: tente composição primeiro; use Context quando muitos componentes distantes precisam do mesmo valor.',
            'function Pagina() {\n  const usuario = useUsuario();\n  return <Layout topo={<Barra usuario={usuario} />}><Conteudo /></Layout>;\n}\nfunction Layout({ topo, children }) {\n  return <div>{topo}<main>{children}</main></div>;\n}'
          ),
          sl(
            'Padrão de provider e dados pessoais',
            'Encapsule o Context em um componente Provider e em um hook de consumo, validando o uso: o hook lança erro claro se usado fora do Provider. Assim o resto do app nunca importa o contexto cru. Cuidado de privacidade: o contexto de usuário deve carregar só o necessário (nome de exibição e papéis), nunca senhas, tokens ou documentos; qualquer coisa colocada ali fica acessível a toda a subárvore e a ferramentas de depuração. LGPD em visão geral: minimização; não substitui orientação jurídica.',
            'function useUsuario() {\n  const ctx = useContext(UsuarioContext);\n  if (ctx === null) throw new Error("useUsuario fora do UsuarioProvider");\n  return ctx;\n}'
          )
        ]
      },
      questions: [
        mc('q1', 'Uma barra de navegação no fundo da árvore precisa do usuário logado, e cinco componentes intermediários só repassam a prop. Qual alternativa resolve sem repassar a prop?', 'Compor: o componente que tem o dado monta a Barra pronta e a entrega ao layout como elemento', [
          'Guardar o usuário em uma variável global do módulo e ler direto em cada componente',
          'Duplicar o estado do usuário em cada componente intermediário para evitar repasses',
          'Renderizar a árvore inteira de novo a cada segundo, para que os componentes consultem o usuário atual por conta própria'
        ], 'Composição evita o drilling porque os intermediários só recebem elementos prontos. Variável global não reage a mudanças, duplicar estado cria inconsistência e redesenhar a cada segundo é desperdício.'),
        mc('q2', 'O value do Provider muda. Quais componentes re-renderizam por causa do contexto?', 'Todos os que chamam useContext naquele contexto, mesmo se usarem só parte do valor', [
          'Só os que usam exatamente a propriedade do objeto que foi alterada, pois o React compara cada campo do value separadamente',
          'O componente Provider, enquanto os consumidores mantêm o valor antigo',
          'Nada, pois o React só atualiza contexto quando a página é recarregada'
        ], 'O contexto não filtra por propriedade: a mudança de identidade do value reavalia todos os consumidores. Eles não ficam com valor antigo, e a atualização acontece sem recarregar.'),
        mc('q3', 'Por que value={{ usuario, sair }} inline no Provider pode causar re-renderizações desnecessárias?', 'O objeto é novo a cada render do pai, e a mudança de identidade avisa todos os consumidores', [
          'Porque objetos literais não podem ser enviados como props em componentes de função, então o React os descarta a cada renderização',
          'Porque o Provider converte o objeto em texto e perde as funções internas',
          'Porque o useContext só aceita valores primitivos, como números e strings'
        ], 'A identidade nova dispara a comparação por referência. A solução é useMemo ou separar contextos. Objetos são aceitos como value e o useContext lê qualquer tipo.'),
        fill('q4', 'Complete com o hook que lê o valor do contexto mais próximo acima na árvore.', 'const tema = ___(TemaContext);', ['useContext'], 'useContext lê o valor fornecido pelo Provider mais próximo acima do componente.'),
        mc('q5', 'Qual dado é um bom candidato a Context?', 'O tema ou o idioma da interface, lidos em muitos lugares e alterados raramente', [
          'O texto digitado em um campo de busca, alterado a cada tecla pressionada',
          'A posição do mouse na tela, atualizada dezenas de vezes por segundo',
          'O contador de um único botão usado só dentro de um componente'
        ], 'Contexto compensa para dados globais que mudam pouco. Valores que mudam a cada tecla ou movimento causam re-renderizações em cascata, e estado de uso local deve ficar local.'),
        mc('q6', 'Qual é o benefício de criar um hook useUsuario que lança erro quando o contexto é nulo?', 'Falha cedo com mensagem clara se alguém usar o hook fora do Provider, e o app não importa o contexto cru', [
          'Faz o Provider ficar mais rápido ao renderizar a árvore de componentes, pois evita que o React compare os valores do contexto',
          'Criptografa os dados do usuário antes de entregá-los aos consumidores',
          'Impede que o contexto seja lido por componentes filhos do Provider'
        ], 'O hook encapsula o contexto e transforma um erro silencioso em erro claro. Ele não acelera o Provider, não criptografa e não impede leitura legítima pelos filhos.'),
        mc('q7', 'Qual informação NÃO deve ficar em um contexto de usuário acessível a toda a subárvore?', 'A senha ou o token de sessão do usuário', [
          'O nome de exibição mostrado no cabeçalho da aplicação',
          'A lista de papéis usada para exibir ou ocultar menus',
          'A preferência de idioma escolhida na tela de configuração'
        ], 'Segredos e credenciais não devem circular pelo estado do front-end além do necessário; token em cookie HttpOnly. Nome de exibição, papéis (para UX) e idioma são dados mínimos e apropriados.'),
        fill('q8', 'Complete com o nome da função que cria um contexto com um valor padrão.', 'const TemaContext = ___("claro");', ['createContext'], 'createContext(valorPadrao) cria o objeto de contexto usado pelo Provider e por useContext.')
      ]
    },
    {
      id: 'fii-06-react-estado-externo',
      title: 'React: estado externo',
      goal: 'Saber quando o estado local basta e quando usar uma store externa (Redux Toolkit, Zustand, Jotai), com seletores e imutabilidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Primeiro: o estado local costuma bastar',
            'Antes de qualquer biblioteca, lembre a escada: useState no componente; elevar o estado ao ancestral comum quando dois irmãos precisam dele; Context para dados globais que mudam pouco; só então uma store externa. Estado externo é um objeto de estado que vive FORA da árvore de componentes e é lido por qualquer componente por meio de uma assinatura. Erro comum: instalar uma biblioteca de estado global para um app pequeno, trazendo cerimônia sem benefício. (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'Quando uma store externa compensa',
            'Sinais de que vale a pena: muitos componentes distantes leem e alteram o mesmo estado; o estado muda com frequência e Context causaria re-renderizações demais (Context re-renderiza todos os consumidores, uma store com seletores atualiza só quem mudou); a lógica de atualização é complexa e precisa ser testada isolada; você quer ferramentas de depuração com histórico de ações. Dados vindos do servidor NÃO são bons candidatos a store global: têm ferramentas próprias (próxima lição de dados do servidor).'
          ),
          sl(
            'Redux Toolkit, Zustand e Jotai (por nome)',
            'Redux Toolkit: estilo com slices (estado + reducers + ações), fluxo previsível e ótimas ferramentas de depuração; mais estrutura, útil em apps grandes. Zustand: store pequena criada com uma função, lida por hooks com seletores; pouca cerimônia. Jotai: estado dividido em átomos pequenos que se combinam, no estilo de signals do React. Todos permitem ler só o pedaço necessário. A escolha depende de tamanho do time e do app; consulte a documentação oficial de cada um.',
            '// Zustand (ilustrativo)\nconst useCarrinho = create((set) => ({\n  itens: [],\n  adicionar: (item) => set((s) => ({ itens: [...s.itens, item] })),\n  limpar: () => set({ itens: [] })\n}));\n// componente lê só o que precisa (seletor):\nconst total = useCarrinho((s) => s.itens.length);'
          ),
          sl(
            'Seletores: assinar só o pedaço necessário',
            'Um seletor é uma função que extrai do estado inteiro apenas o valor que o componente usa: (s) => s.itens.length. O componente só re-renderiza quando o RESULTADO do seletor muda. Sem seletor (lendo a store inteira), qualquer alteração em qualquer campo redesenharia o componente. Cuidado: um seletor que cria objeto ou array novo a cada chamada (ex.: (s) => ({ a: s.a })) devolve identidade nova sempre e pode causar re-renderizações; selecione valores primitivos ou use as ferramentas de comparação da biblioteca.'
          ),
          sl(
            'Imutabilidade: nunca mutar o estado',
            'As bibliotecas detectam mudança comparando referências. Se você faz s.itens.push(x), a referência do array é a mesma e ninguém é avisado; o certo é criar cópias: [...s.itens, x]. O Redux Toolkit usa a biblioteca Immer, que permite ESCREVER como se mutasse dentro do reducer, mas produz uma cópia imutável por baixo dos panos; fora desse contexto, continue copiando. Privacidade: não coloque tokens ou documentos na store só por comodidade, e se persistir a store no navegador, exclua dados pessoais (veja a lição de hooks personalizados).'
          )
        ]
      },
      questions: [
        mc('q1', 'Dois componentes irmãos precisam compartilhar um filtro de busca em uma tela pequena. Qual é o primeiro passo mais adequado?', 'Elevar o estado ao ancestral comum e passar o valor e o setter por props', [
          'Instalar uma biblioteca de estado global e criar uma store com ações e seletores',
          'Guardar o filtro no localStorage e ler o valor de lá em cada render',
          'Duplicar o estado nos dois irmãos e sincronizar os valores com um efeito'
        ], 'Elevar o estado ao ancestral comum é a solução mais simples e suficiente. Store global é exagero aqui, localStorage não é para estado de UI transitório e duplicar estado cria inconsistências.'),
        mc('q2', 'Qual é a vantagem de um seletor em uma store externa?', 'O componente só re-renderiza quando o valor selecionado muda, e não a cada alteração da store inteira', [
          'Faz a store gravar automaticamente o estado no servidor a cada mudança',
          'Permite alterar o estado diretamente dentro do componente sem criar ações ou reducers',
          'Criptografa o estado da store para que componentes que não declararam o seletor correspondente não consigam lê-lo'
        ], 'Seletores assinam apenas o pedaço usado. Eles não sincronizam com servidor, não substituem as ações de alteração e não protegem nem criptografam dados.'),
        mc('q3', 'Qual destes dados NÃO é um bom candidato a store global?', 'A lista de produtos vinda de uma API, que tem cache, revalidação e estados de carregamento próprios', [
          'O usuário autenticado, lido por muitos componentes de diferentes telas',
          'O conteúdo do carrinho de compras, que é alterado em várias partes distantes da aplicação e lido por muitas telas',
          'O tema escolhido, consultado por praticamente todos os componentes'
        ], 'Dados do servidor têm necessidades específicas (cache, invalidação) melhor atendidas por bibliotecas de dados de servidor. As outras opções são estado de cliente compartilhado, caso típico de store.'),
        fill('q4', 'Complete com o termo da função que extrai da store só o valor de que o componente precisa.', 'const total = useCarrinho((s) => s.itens.length); // função ___', ['seletor', 'selector'], 'Um seletor extrai da store o valor usado pelo componente, que só re-renderiza quando esse resultado muda.'),
        mc('q5', 'Em Zustand, o reducer faz s.itens.push(novo) e retorna o mesmo objeto. Por que a tela pode não atualizar?', 'A referência do array não mudou, e a biblioteca compara referências para detectar mudança', [
          'O push é uma operação assíncrona e termina depois que a tela já foi desenhada de novo',
          'O Zustand só aceita estados com números e não consegue armazenar listas',
          'A tela sempre atualiza a cada chamada de set, então o problema está em outro lugar'
        ], 'Mutar não troca a referência, logo a comparação não percebe mudança. Copie: [...s.itens, novo]. O push é síncrono, listas são suportadas e a tela só atualiza quando a referência selecionada muda.'),
        mc('q6', 'O que o Immer permite no Redux Toolkit?', 'Escrever o reducer como se mutasse o estado, gerando por baixo uma cópia imutável', [
          'Evitar completamente a necessidade de ações, chamando setters direto nos componentes',
          'Guardar o estado no servidor para que os usuários vejam o mesmo valor',
          'Transformar o estado em observável do RxJS sem nenhum código extra'
        ], 'O Immer produz o próximo estado imutável a partir de uma escrita estilo mutação dentro do reducer. Não elimina ações, não sincroniza com servidor e não converte em observável.'),
        mc('q7', 'Um seletor retorna (s) => ({ a: s.a, b: s.b }) e o componente re-renderiza a cada mudança em qualquer campo. Qual é a causa provável?', 'O seletor cria um objeto novo a cada chamada, e a nova identidade é lida como mudança', [
          'A store não suporta mais de um campo por objeto de estado, e por isso o componente renderiza a cada alteração',
          'O componente precisa de useRef para guardar os campos antes de ler',
          'O objeto retornado é grande demais para a comparação do React'
        ], 'Objetos novos têm sempre identidade nova. Selecione primitivos separadamente ou use comparação rasa da biblioteca. Stores suportam vários campos, useRef não resolve e o tamanho não é o problema.'),
        fill('q8', 'Complete com o parâmetro que será acrescentado à cópia nova do array, mantendo o array antigo intacto.', 'adicionar: (item) => set((s) => ({ itens: [...s.itens, ___] }))', ['item'], 'A cópia nova do array recebe o item recebido por parâmetro e o array antigo continua intacto, o que preserva a imutabilidade.')
      ]
    },
    {
      id: 'fii-07-react-dados-do-servidor',
      title: 'React: dados do servidor',
      goal: 'Entender, em conceito, como bibliotecas como TanStack Query tratam cache, staleTime, invalidação, mutations e atualização otimista.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Estado do servidor é diferente de estado de UI',
            'Dados que vêm de uma API são uma CÓPIA de algo que pertence ao servidor: podem ficar velhos, falhar, estar carregando, ser pedidos várias vezes pelos mesmos componentes. Fazer isso à mão com useEffect + useState gera muito código repetido (loading, erro, cancelamento, repetição). Bibliotecas como TanStack Query (nome usado em React; há versões para outros frameworks) resolvem com cache e regras. Aqui vai o conceito; código é ilustrativo, não executado aqui.'
          ),
          sl(
            'Query: leitura com chave e cache',
            'Uma query é uma leitura identificada por uma queryKey (um array como ["tarefas", filtro]) e uma função que busca os dados. A biblioteca guarda o resultado em cache POR CHAVE: dois componentes que pedem a mesma chave compartilham uma única requisição. Ela expõe estados prontos (carregando, erro, dados) e refaz a busca em momentos úteis (foco na janela, reconexão). A chave deve incluir tudo que muda o resultado (ex.: filtro e página), senão você mostra dados da chave errada.',
            'const { data, isPending, error } = useQuery({\n  queryKey: ["tarefas", filtro],\n  queryFn: () => buscarTarefas(filtro)\n});'
          ),
          sl(
            'staleTime e dados "velhos"',
            'Um dado é fresco enquanto o tempo de staleTime não passou; depois vira stale (velho). Dados stale ainda aparecem na tela imediatamente (vindos do cache), e a biblioteca revalida em segundo plano para atualizar. Com staleTime 0 (comportamento padrão) todo dado é considerado velho logo ao chegar; aumentar o staleTime reduz requisições em dados que mudam pouco (lista de países) e diminui para dados voláteis (saldo). Não confunda: staleTime decide QUANDO revalidar; o tempo de descarte do cache sem uso é outro parâmetro. Confira os nomes na documentação da versão em uso.'
          ),
          sl(
            'Mutations e invalidação',
            'Mutation é uma escrita (criar, alterar, apagar). Depois que a escrita dá certo, o cache pode estar desatualizado; invalidar uma chave marca suas queries como velhas e dispara a busca de novo. Padrão: mutationFn faz o POST/PUT/DELETE e onSuccess chama queryClient.invalidateQueries({ queryKey: ["tarefas"] }), que atualiza a lista. Erro comum: esquecer a invalidação e a lista continuar mostrando o dado antigo.',
            'const criar = useMutation({\n  mutationFn: (nova) => enviarTarefa(nova),\n  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefas"] })\n});'
          ),
          sl(
            'Atualização otimista e cuidados',
            'Otimismo é atualizar a tela ANTES da confirmação do servidor, assumindo que vai dar certo (marcar tarefa como concluída na hora). Fluxo: guardar o estado anterior, aplicar a mudança no cache, e em caso de erro reverter ao anterior (rollback); ao final, invalidar para sincronizar. Vale para ações de baixo risco e alta chance de sucesso; para pagamentos prefira esperar a confirmação. Segurança: o cache vive na memória do navegador e pode conter dados pessoais; evite persisti-lo em localStorage sem necessidade, limpe-o no logout e lembre que autorização é decidida no servidor (o cliente só mostra).'
          )
        ]
      },
      questions: [
        mc('q1', 'Dois componentes diferentes usam useQuery com a mesma queryKey. O que normalmente acontece?', 'Compartilham o mesmo cache e uma única requisição atende os dois', [
          'Cada um faz sua própria requisição independente, ignorando qualquer cache existente',
          'O segundo componente recebe erro, pois a chave já está em uso',
          'A biblioteca bloqueia o segundo até o primeiro ser removido da tela'
        ], 'O cache é por chave: mesma chave, mesmos dados e requisição compartilhada. Não há duplicação obrigatória, erro ou bloqueio.'),
        mc('q2', 'Uma lista é filtrada por categoria e a queryKey é apenas ["produtos"]. Ao trocar a categoria, o que de errado pode acontecer?', 'O cache pode mostrar os dados da categoria anterior, pois a chave não distingue as consultas', [
          'A biblioteca converte automaticamente a categoria em parte da chave e tudo funciona',
          'O navegador recusa a requisição por falta de uma chave com os dois valores',
          'A lista passa a mostrar somente produtos sem categoria definida, porque a chave não carrega nenhum parâmetro da busca'
        ], 'A chave deve conter todas as variáveis que mudam o resultado, por exemplo ["produtos", categoria]. A biblioteca não inventa isso por conta própria e o navegador não verifica chaves.'),
        mc('q3', 'O que a invalidação faz depois de uma mutation bem-sucedida?', 'Marca as queries daquela chave como velhas e dispara nova busca para sincronizar a tela', [
          'Apaga os dados do servidor para que a próxima leitura traga valores limpos',
          'Reinicia o navegador do usuário para garantir que o cache em memória seja renovado com os dados mais recentes do servidor',
          'Cancela a mutation recém-concluída e devolve o dado ao valor anterior'
        ], 'Invalidar afeta só o cache local: marca como stale e refaz a busca. Não apaga dados do servidor, não reinicia o navegador e não desfaz a mutation.'),
        fill('q4', 'Complete com o nome da propriedade que identifica uma query no cache, geralmente um array com os parâmetros.', 'useQuery({ ___: ["tarefas", filtro], queryFn: buscar });', ['queryKey'], 'queryKey identifica a query no cache; deve incluir tudo que altera o resultado.'),
        mc('q5', 'Um dado raramente muda, como a lista de países. Qual ajuste reduz requisições desnecessárias?', 'Aumentar o staleTime, para que o dado seja tratado como fresco por mais tempo', [
          'Diminuir o staleTime para zero e revalidar a cada montagem do componente',
          'Remover a queryKey, pois sem chave a biblioteca guarda o resultado para sempre',
          'Trocar a query por uma mutation,, que não refaz requisições'
        ], 'Quanto maior o staleTime, mais tempo o dado é considerado fresco e menos revalidações acontecem. Zero causa mais requisições, sem chave não há cache e mutation serve para escrita.'),
        mc('q6', 'Qual é a sequência de uma atualização otimista bem feita?', 'Guardar o estado anterior, alterar o cache já, reverter se o servidor falhar e invalidar no fim', [
          'Aguardar a resposta do servidor, só então alterar o cache e depois descartar o estado anterior',
          'Alterar o cache e não reverter, pois falhas de rede não costumam acontecer',
          'Alterar o servidor e o cache sem nenhuma confirmação para ser mais rápido'
        ], 'O otimismo exige poder voltar atrás (rollback) e sincronizar ao final. Esperar a resposta não é otimismo, e ignorar falhas deixa a tela mentirosa.'),
        mc('q7', 'Em qual situação a atualização otimista é uma má escolha?', 'Em uma confirmação de pagamento, em que a tela não deve afirmar sucesso antes do servidor', [
          'Ao marcar uma tarefa como concluída em uma lista pessoal de afazeres',
          'Ao curtir um comentário, ação reversível e de baixo risco',
          'Ao alternar uma preferência de tema salva no perfil do usuário, ação simples que pode ser desfeita com facilidade'
        ], 'Operações sensíveis ou financeiras devem aguardar a confirmação. As demais são reversíveis e de baixo risco, bons casos de otimismo.'),
        fill('q8', 'Complete com o método do queryClient que marca queries como velhas e dispara nova busca após uma mutation.', 'onSuccess: () => queryClient.___({ queryKey: ["tarefas"] })', ['invalidateQueries'], 'invalidateQueries marca as queries da chave como stale e refaz a busca para a tela refletir o novo estado do servidor.')
      ]
    },
    {
      id: 'fii-08-react-formularios-avancados',
      title: 'React: formulários avançados',
      goal: 'Construir formulários com React Hook Form e schemas (Zod), incluindo validação assíncrona e erros acessíveis.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que uma biblioteca de formulários',
            'Formulários reais têm muitos campos, regras, mensagens, estados de envio e campos que dependem de outros. Controlar cada campo com useState e onChange faz o componente re-renderizar a cada tecla e gera muito código repetido. React Hook Form (por nome) registra os campos e lê os valores quando preciso, com poucas re-renderizações, e cuida de erros, estado de envio e reset. (Código ilustrativo, não executado aqui.)',
            'const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();\n<form onSubmit={handleSubmit(aoEnviar)} noValidate>\n  <input {...register("email")} />\n</form>'
          ),
          sl(
            'Schemas: regras em um lugar só',
            'Um schema descreve a forma e as regras dos dados em um objeto declarativo. Zod (por nome) é uma biblioteca de schemas em TypeScript/JavaScript: z.object({ email: z.string().email() }). O schema valida e também gera o tipo TypeScript, evitando duplicar regras entre tipos e validação. O React Hook Form se conecta por um resolver (zodResolver), e o mesmo schema pode ser reaproveitado no servidor. Regra de ouro: a validação no cliente é UX (feedback rápido); a segurança está na validação no servidor, que deve repetir as regras.',
            'const schema = z.object({\n  email: z.string().email("E-mail inválido"),\n  idade: z.number().int().min(18, "Mínimo 18 anos")\n});\nconst { register } = useForm({ resolver: zodResolver(schema) });'
          ),
          sl(
            'Validação assíncrona',
            'Algumas regras só o servidor sabe: "este nome de usuário já existe?". Validação assíncrona consulta o servidor. Cuidados: (1) usar debounce para não consultar a cada tecla; (2) tratar condição de corrida (resposta antiga chegando depois da nova) ignorando respostas obsoletas; (3) mostrar estado "verificando"; (4) o servidor deve validar de novo no envio, pois a checagem do cliente pode ser contornada ou ficar velha. Atenção de privacidade: consultar "este e-mail já existe?" permite descobrir quem tem cadastro (enumeração de contas); em sistemas sensíveis, prefira mensagens neutras e limite de tentativas.',
            'const schema = z.object({\n  usuario: z.string().min(3).refine(async (v) => !(await usuarioExiste(v)), "Nome indisponível")\n});'
          ),
          sl(
            'Erros acessíveis',
            'Um erro só ajuda se todos o perceberem, inclusive quem usa leitor de tela. Boas práticas: ligar cada mensagem ao campo com aria-describedby apontando para o id da mensagem; marcar o campo com aria-invalid="true" quando houver erro; anunciar o erro com role="alert" (ou região aria-live); não depender só de cor vermelha (acrescente texto e ícone); mover o foco ao primeiro campo inválido no envio. O label visível continua obrigatório (veja a lição de acessibilidade do nível iniciante).',
            '<label htmlFor="email">E-mail</label>\n<input id="email" {...register("email")}\n  aria-invalid={errors.email ? "true" : "false"}\n  aria-describedby={errors.email ? "email-erro" : undefined} />\n{errors.email && <p id="email-erro" role="alert">{errors.email.message}</p>}'
          ),
          sl(
            'Dados pessoais em formulários',
            'Colete só o necessário (minimização): não peça CPF se o e-mail basta. Use type e autocomplete corretos (autocomplete="email", "current-password"), nunca coloque dados do usuário em URLs nem em logs do console, e nunca grave senha em estado persistente ou localStorage. Exemplos devem usar dados fictícios como usuario@example.com. LGPD em visão geral: finalidade e minimização; isto não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é uma vantagem de usar React Hook Form em vez de controlar cada campo com useState?', 'Menos re-renderizações e menos código repetido, pois os campos são registrados e lidos quando necessário', [
          'Os dados do formulário passam a ser validados automaticamente no servidor sem código algum',
          'Os campos deixam de precisar de name, label ou qualquer atributo HTML, porque a biblioteca gera tudo isso automaticamente',
          'O navegador envia o formulário sozinho sem necessidade de um botão de envio'
        ], 'A biblioteca registra campos e reduz renderizações e código. Ela não valida no servidor por você, os atributos HTML continuam necessários e o envio ainda depende do usuário.'),
        mc('q2', 'Qual é o principal ganho de usar um schema Zod com o formulário?', 'Descrever as regras em um só lugar e reaproveitá-las para validar e gerar tipos, até no servidor', [
          'Dispensar a validação no servidor, pois o schema do cliente é suficiente para proteger a API',
          'Impedir que o usuário digite caracteres inválidos em qualquer campo do navegador, bloqueando as teclas não permitidas pela regra',
          'Criptografar os dados do formulário antes de sair do navegador do usuário'
        ], 'Um schema centraliza regras e tipos e pode ser compartilhado. Ele não substitui a validação no servidor, não bloqueia digitação e não criptografa nada.'),
        mc('q3', 'Um usuário desativa o JavaScript ou chama a API diretamente, sem passar pelo formulário. Qual conclusão correta sobre a validação do cliente?', 'Ela é conveniência de UX, e as regras precisam ser validadas de novo no servidor', [
          'Ela basta para proteger o sistema, pois o servidor confia no navegador',
          'Ela torna a API imune a dados malformados enviados por outras ferramentas',
          'Ela só falha se o usuário usar um navegador muito antigo'
        ], 'Qualquer cliente pode enviar requisições sem passar pela UI. A segurança depende da validação no servidor. Confiar no navegador é o erro clássico.'),
        fill('q4', 'Complete com o atributo ARIA que liga o campo à mensagem de erro, apontando para o id dela.', '<input id="email" aria-___="email-erro" />', ['describedby'], 'aria-describedby associa o campo ao elemento com a descrição ou erro, e o leitor de tela o anuncia junto ao campo.'),
        mc('q5', 'Ao validar "usuário já existe" a cada tecla, quais cuidados são recomendados?', 'Usar debounce, ignorar respostas obsoletas e repetir a verificação no envio no servidor', [
          'Enviar uma requisição por tecla, sem atrasos, para respostas mais rápidas',
          'Confiar na última resposta que chegou, mesmo que ela pertença a um texto digitado antes do valor atual do campo',
          'Fazer a verificação só no navegador, já que o servidor repetiria o trabalho'
        ], 'Debounce reduz requisições, descartar respostas antigas evita corrida e a revalidação no servidor garante a regra. As outras práticas geram sobrecarga ou resultados incorretos.'),
        mc('q6', 'Qual prática torna o erro de um campo acessível a quem usa leitor de tela?', 'aria-invalid no campo, mensagem ligada por aria-describedby e anúncio com role="alert"', [
          'Pintar a borda do campo de vermelho e confiar que a cor será percebida por todos',
          'Mostrar o erro só ao passar o mouse sobre o campo, para não poluir a tela com mensagens fixas e textos repetidos',
          'Remover o label para que o leitor leia apenas a mensagem de erro'
        ], 'Estrutura semântica e anúncio chegam aos leitores de tela. Só cor exclui quem não a distingue, hover não funciona em teclado e remover o label piora a acessibilidade.'),
        mc('q7', 'O campo de e-mail do cadastro avisa "este e-mail já está cadastrado". Qual risco de privacidade isso cria?', 'Permite descobrir quais e-mails têm conta (enumeração), o que pede mensagens neutras e limite de tentativas', [
          'Sem risco algum, porque o e-mail é público para qualquer usuário na internet',
          'O risco é apenas visual, pois a mensagem pode ficar longa no layout',
          'Faz o navegador armazenar o e-mail consultado no histórico para sempre, o que expõe o endereço a quem usar o computador depois'
        ], 'Respostas distintas deixam um terceiro testar e-mails para saber quem tem conta. Mitigar com mensagem genérica e rate limit no servidor. Não é problema visual nem de histórico do navegador.'),
        fill('q8', 'Complete com o nome da biblioteca de schemas citada que, com um resolver, valida os dados do React Hook Form.', 'useForm({ resolver: zodResolver(z.object({ email: ___.string().email() })) })', ['z'], 'O objeto z do Zod expõe os construtores de schema (z.string, z.object); o resolver conecta o schema ao formulário.')
      ]
    },
    {
      id: 'fii-09-react-performance-basica',
      title: 'React: performance básica',
      goal: 'Saber quando re-renderizações importam, usar memo, lidar com listas grandes, medir com o Profiler e dividir código com lazy.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Re-renderizar não é pecado',
            'Renderizar significa chamar a função do componente para descrever a UI. Re-renderizar é normal e geralmente barato; o que custa é renderizar MUITO trabalho sem necessidade. Regra: primeiro faça funcionar, depois MEÇA, só então otimize. Otimização sem medida adiciona complexidade sem garantir ganho. Um componente re-renderiza quando seu estado muda, quando o pai re-renderiza ou quando um contexto que ele usa muda. (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'memo: pular renderização quando as props são iguais',
            'memo(Componente) envolve um componente para que ele só re-renderize se suas props mudarem (comparação rasa: identidade de cada prop). Útil quando o componente é caro e o pai re-renderiza com frequência com as mesmas props. Armadilha: passar objeto, array ou função criados inline (como style={{...}} ou onClick={() => ...}) cria identidade nova a cada render e anula o memo; nesses casos use useMemo/useCallback (lição de hooks avançados). memo tem custo de comparação; não envolva tudo.',
            'const Item = memo(function Item({ tarefa, onRemover }) {\n  return <li>{tarefa.titulo} <button onClick={() => onRemover(tarefa.id)}>x</button></li>;\n});'
          ),
          sl(
            'Listas grandes: renderizar só o que aparece',
            'Renderizar milhares de itens cria milhares de nós de DOM e deixa a rolagem pesada. A técnica de virtualização (windowing) renderiza só os itens visíveis na janela de rolagem (mais uma margem) e reaproveita os nós; existem bibliotecas para isso (por nome: TanStack Virtual, react-window). Outras opções: paginação, "carregar mais" e filtrar no servidor. Sempre use keys estáveis (lição de virtual DOM). Se a lista tem 50 itens simples, nada disso é necessário.'
          ),
          sl(
            'Profiler: medir antes de otimizar',
            'O React DevTools tem uma aba Profiler que grava interações e mostra quais componentes renderizaram, por quê (qual prop ou estado mudou) e quanto tempo levaram. Fluxo: gravar uma interação lenta, achar o componente mais caro, entender a causa e aplicar UMA correção (memo, mover o estado para baixo, virtualizar), e medir de novo. Dica: mover o estado para o componente que realmente o usa (state colocation) muitas vezes elimina re-renderizações sem memo nenhum.'
          ),
          sl(
            'Divisão de código com lazy',
            'Por padrão o bundle (arquivo JavaScript) leva todo o app de uma vez. Divisão de código (code splitting) separa pedaços que são carregados sob demanda. Em React: const Grafico = lazy(() => import("./Grafico")) cria um componente carregado só quando renderizado pela primeira vez, e deve estar dentro de um Suspense com fallback. Bom ponto de corte: rotas e componentes pesados raramente usados (gráficos, editores). O import() dinâmico é padrão do JavaScript; a divisão é feita pelo bundler (como o Vite).',
            'const Grafico = lazy(() => import("./Grafico"));\n<Suspense fallback={<p>Carregando gráfico...</p>}>\n  <Grafico dados={dados} />\n</Suspense>'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é o primeiro passo recomendado ao suspeitar que uma tela está lenta?', 'Medir com o Profiler para achar o que realmente é caro antes de alterar o código', [
          'Envolver todos os componentes em memo para evitar qualquer re-renderização',
          'Trocar todas as funções por useCallback, mesmo as de componentes simples',
          'Reescrever o app inteiro com outro framework mais rápido'
        ], 'Sem medida, otimizações viram palpite e complexidade. O Profiler indica o gargalo. Aplicar memo e useCallback em tudo e trocar de framework são respostas desproporcionais.'),
        mc('q2', 'Um componente está dentro de memo, mas re-renderiza sempre. Ele recebe style={{ color: "red" }} do pai. Qual é a causa provável?', 'O objeto do style é novo a cada render do pai, e a comparação rasa de props vê uma mudança', [
          'O memo só funciona com componentes de classe e ignora funções, então um componente de função renderiza de novo por qualquer motivo',
          'O React proíbe passar objetos como props para componentes memorizados',
          'A cor vermelha força o navegador a redesenhar o componente'
        ], 'Objeto inline tem identidade nova a cada render, anulando o memo. A solução é mover para uma constante fora do componente ou memorizar. Memo funciona com funções, objetos em props são permitidos e a cor não importa.'),
        mc('q3', 'Uma tela rola uma lista de 20 mil linhas e fica travada. Qual técnica ajuda mais?', 'Virtualização, renderizando apenas as linhas visíveis na janela de rolagem', [
          'Aumentar a velocidade da conexão do usuário para baixar o HTML mais rápido',
          'Usar o índice como key, que torna o diff muito mais barato para listas longas',
          'Renderizar a lista duas vezes para o navegador guardar uma cópia'
        ], 'O gargalo é o número de nós no DOM; virtualização limita isso. Conexão não resolve renderização, índice como key pode piorar e renderizar duas vezes só duplica o trabalho.'),
        fill('q4', 'Complete com o nome da função do React usada para carregar um componente sob demanda com import dinâmico.', 'const Grafico = ___(() => import("./Grafico"));', ['lazy'], 'React.lazy cria um componente carregado apenas quando renderizado pela primeira vez, junto de Suspense.'),
        mc('q5', 'Um componente lazy é renderizado sem Suspense ao redor. Qual é o problema?', 'O React precisa de um Suspense ancestral para saber o que mostrar enquanto o código é carregado', [
          'Nada: o lazy mostra sozinho uma mensagem de carregamento padrão',
          'O lazy só funciona dentro de formulários com campos controlados',
          'O import() dinâmico não é permitido em componentes de função, então o lazy precisaria de um componente de classe'
        ], 'Sem Suspense, não há fallback definido durante o carregamento e o React sinaliza o erro. O lazy não tem mensagem própria, não se restringe a formulários e import() dinâmico é padrão do JavaScript.'),
        mc('q6', 'Mover o estado de um filtro para dentro do componente da barra de busca (em vez de no topo da página) tende a:', 'Reduzir re-renderizações, pois só a barra de busca renderiza quando o filtro muda', [
          'Aumentar re-renderizações, pois o estado fica mais longe da raiz e precisa ser comparado em mais componentes de cada vez',
          'Impedir que a lista de resultados use o valor do filtro em qualquer caso',
          'Fazer o Profiler deixar de registrar a atividade do componente'
        ], 'Colocar o estado perto de quem o usa limita o alcance das re-renderizações. Se a lista precisar do valor, é preciso elevar ou compartilhar, mas a ideia geral é manter o estado o mais local possível.'),
        mc('q7', 'Quando memo NÃO vale a pena?', 'Em um componente muito leve, cujas props mudam quase a cada render do pai', [
          'Em um componente pesado que recebe as mesmas props a maior parte do tempo',
          'Em um item de lista grande com props estáveis e renderização cara',
          'Em um gráfico complexo que só muda quando os dados mudam'
        ], 'Se o componente é barato ou as props sempre mudam, a comparação só adiciona custo. Nos demais casos o memo evita trabalho caro repetido.'),
        fill('q8', 'Complete com o termo em inglês usado para a técnica de renderizar só os itens visíveis de uma lista grande.', 'Para 20 mil linhas, use ___ da lista (windowing).', ['virtualização', 'virtualizacao', 'virtualization'], 'Virtualização (windowing) renderiza apenas a janela visível, reduzindo drasticamente o número de nós no DOM.')
      ]
    },
    {
      id: 'fii-10-react-erros-e-suspense',
      title: 'React: erros e Suspense',
      goal: 'Tratar erros de renderização com error boundaries e estados de carregamento declarativos com Suspense e lazy.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que acontece quando um componente quebra',
            'Se um componente lança um erro durante a renderização (ex.: acessar propriedade de undefined), sem proteção o React desmonta a árvore inteira e o usuário vê uma tela em branco. Um error boundary (limite de erro) é um componente que captura erros de renderização dos seus descendentes e mostra uma interface de contingência (fallback) em vez de derrubar o app. (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'Como criar um error boundary',
            'O mecanismo oficial exige um componente de CLASSE com getDerivedStateFromError (para trocar para o fallback) e componentDidCatch (para registrar o erro): é um dos poucos usos de classes que restam; na prática se usa a biblioteca react-error-boundary (por nome), que oferece um componente com a prop fallback e função de reset. O boundary captura erros de render, de ciclo de vida e de construtores abaixo dele; NÃO captura erros em manipuladores de eventos, código assíncrono (setTimeout, fetch) nem do próprio boundary. Esses você trata com try/catch ou com o estado de erro da biblioteca de dados.',
            '<ErrorBoundary fallback={<p>Algo deu errado. Tente novamente.</p>}>\n  <PainelDeVendas />\n</ErrorBoundary>'
          ),
          sl(
            'Onde colocar boundaries e o que mostrar',
            'Coloque boundaries em camadas: um no topo (último recurso), e outros ao redor de áreas independentes (um widget, uma rota), para que a falha de um painel não derrube a página. O fallback deve ser útil: mensagem clara e botão de tentar de novo, SEM detalhes técnicos (stack trace, caminhos, dados internos), que ajudam atacantes. Registre o erro para diagnóstico em um serviço de monitoramento, mas sem dados pessoais nos logs (nada de e-mail, token ou conteúdo de formulário). LGPD em visão geral: minimização também vale para logs.'
          ),
          sl(
            'Suspense: carregamento declarativo',
            'Suspense permite declarar o que mostrar enquanto algo está pendente. Em volta de um componente que ainda não está pronto (código carregado com lazy ou dados de bibliotecas compatíveis), <Suspense fallback={...}> exibe o fallback até a conclusão. Em vez de cada componente ter if (carregando), você declara o estado de espera em um ponto. Suspense pode ser aninhado: cada limite mostra seu próprio fallback, permitindo carregar partes da página em momentos diferentes.',
            '<Suspense fallback={<Esqueleto />}>\n  <Perfil />\n  <Suspense fallback={<p>Carregando posts...</p>}>\n    <Posts />\n  </Suspense>\n</Suspense>'
          ),
          sl(
            'Juntando: Suspense dentro de ErrorBoundary',
            'Os dois se complementam: Suspense trata o "ainda não chegou", o ErrorBoundary trata o "deu errado". Padrão comum: ErrorBoundary por fora e Suspense por dentro, de modo que uma falha ao carregar o chunk de um componente lazy (rede caiu) também caia no fallback de erro com opção de tentar de novo. Em versões recentes, recursos como Server Components e Actions ampliam o uso de Suspense; é conceito aqui, confira a documentação oficial da versão em uso.',
            '<ErrorBoundary fallback={<p>Não foi possível carregar.</p>}>\n  <Suspense fallback={<p>Carregando...</p>}>\n    <RelatorioPesado />\n  </Suspense>\n</ErrorBoundary>'
          )
        ]
      },
      questions: [
        mc('q1', 'Um componente filho lança um erro durante a renderização, sem nenhum error boundary acima. O que o usuário vê?', 'Normalmente uma tela em branco, pois a árvore é desmontada', [
          'O componente com erro é ignorado e o resto da página continua normal',
          'Uma mensagem de erro amigável gerada pelo próprio React em português',
          'A página anterior, restaurada automaticamente pelo navegador'
        ], 'Sem boundary, um erro de renderização não tratado desmonta a árvore. O React não ignora o componente, não gera mensagem amigável por conta própria e o navegador não restaura página.'),
        mc('q2', 'Qual erro um error boundary NÃO captura?', 'Um erro lançado dentro de um manipulador de evento de clique', [
          'Um erro lançado no corpo da função de um componente descendente',
          'Um erro lançado em um método de ciclo de vida de um descendente',
          'Um erro ao acessar propriedade de undefined durante a renderização'
        ], 'Boundaries cobrem erros de renderização e ciclo de vida de descendentes. Eventos e código assíncrono precisam de try/catch ou tratamento próprio.'),
        mc('q3', 'O que o fallback de erro mostrado ao usuário deve evitar?', 'Detalhes técnicos como stack trace, caminhos de arquivos e dados internos do sistema', [
          'Uma mensagem clara dizendo que algo falhou na tela atual',
          'Um botão para tentar novamente a operação que falhou, acompanhado de uma explicação curta do que ocorreu para o usuário',
          'Um texto curto e neutro, sem jargão, em linguagem do usuário'
        ], 'Detalhes técnicos vazam informação útil a atacantes e confundem o usuário; registre-os apenas em monitoramento, sem dados pessoais. As demais opções são boas práticas.'),
        fill('q4', 'Complete com o componente do React que mostra um fallback enquanto algo está pendente de carregamento.', '<___ fallback={<p>Carregando...</p>}><PainelPesado /></Suspense>', ['Suspense'], 'Suspense exibe o fallback enquanto o componente filho (lazy ou com dados compatíveis) ainda não está pronto.'),
        mc('q5', 'Por que usar vários boundaries em áreas independentes em vez de só um no topo?', 'Uma falha localizada em um painel não derruba a página inteira', [
          'Porque o React exige um boundary por componente da aplicação',
          'Porque assim os erros de evento passam a ser capturados também',
          'Porque cada boundary executa o código do descendente em paralelo'
        ], 'Camadas limitam o alcance da falha. O React não exige um por componente, eventos continuam fora do alcance e não há execução paralela.'),
        mc('q6', 'Qual é o papel do Suspense em volta de um componente carregado com lazy?', 'Definir o que mostrar enquanto o código do componente ainda está sendo baixado', [
          'Capturar erros de renderização do componente e exibir uma mensagem de falha no lugar da parte da tela com problema',
          'Baixar o código do componente antes mesmo de a página ser aberta',
          'Impedir que o componente seja renderizado mais de uma vez'
        ], 'Suspense controla a espera (fallback). Capturar erros é do boundary e a antecipação do download não é função dele.'),
        mc('q7', 'Em qual ordem costuma-se aninhar boundary e Suspense para tratar também a falha de rede ao carregar um chunk lazy?', 'ErrorBoundary por fora e Suspense por dentro', [
          'Suspense por fora e ErrorBoundary por dentro, sem nenhuma outra proteção',
          'Dois Suspense aninhados, sem boundary algum para as falhas',
          'Dispensar os dois, já que o navegador mostra a falha de rede ao usuário'
        ], 'Com o boundary por fora, um erro ao carregar o chunk é capturado e mostra o fallback de erro, com opção de tentar de novo. Suspense sozinho não captura erros.'),
        fill('q8', 'Complete com a prop de um error boundary que recebe a interface mostrada quando ocorre um erro.', '<ErrorBoundary ___={<p>Algo deu errado.</p>}><Painel /></ErrorBoundary>', ['fallback'], 'A prop fallback define a interface de contingência exibida no lugar da árvore que falhou.')
      ]
    },
    {
      id: 'fii-11-vue-composition-api-em-profundidade',
      title: 'Vue: Composition API em profundidade',
      goal: 'Dominar ref x reactive, toRef/toRefs, computed com get/set, watch x watchEffect, flush e escopo de efeitos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ref x reactive',
            'ref(valor) envolve QUALQUER valor (número, texto, objeto) em um objeto com .value; no script você lê e escreve contador.value, e no template o Vue desembrulha sozinho (escreve-se só {{ contador }}). reactive(objeto) torna um OBJETO reativo e você acessa as propriedades direto (estado.nome), sem .value. Limites do reactive: só funciona com objetos (não com números ou textos soltos), e se você troca a variável inteira (estado = outroObjeto) ou desestrutura (const { nome } = estado), perde a reatividade, pois a ligação é com o objeto original. Por isso muitos times preferem ref como padrão. (Código ilustrativo, não executado aqui.)',
            'import { ref, reactive } from "vue";\nconst contador = ref(0);\ncontador.value++;            // no script, usa .value\nconst usuario = reactive({ nome: "Ana", pontos: 0 });\nusuario.pontos++;            // sem .value'
          ),
          sl(
            'toRef e toRefs: desestruturar sem perder reatividade',
            'toRef(objetoReativo, "chave") cria uma ref ligada a UMA propriedade: alterar um altera o outro. toRefs(objetoReativo) faz isso para todas as propriedades e devolve um objeto de refs, que PODE ser desestruturado com segurança: const { nome, pontos } = toRefs(usuario). Caso típico: um composable devolve um reactive e o consumidor quer usar as propriedades soltas no template. Erro comum: const { nome } = usuario (cópia estática do valor, sem reatividade).',
            'const { nome, pontos } = toRefs(usuario); // refs ligadas ao objeto\npontos.value++;                           // usuario.pontos também muda'
          ),
          sl(
            'computed com get e set',
            'computed(() => ...) cria um valor DERIVADO, calculado a partir de outras fontes reativas e guardado em cache: só recalcula quando uma dependência muda. Por padrão é somente leitura. Para torná-lo editável, passe um objeto com get e set; o set recebe o valor novo e atualiza as fontes originais (ex.: nome completo que, ao ser editado, divide em nome e sobrenome). Regra: computed deve ser PURO, sem efeitos colaterais (nada de requisições ou alterar outros estados dentro dele).',
            'const completo = computed({\n  get: () => `${nome.value} ${sobrenome.value}`,\n  set: (v) => { [nome.value, sobrenome.value] = v.split(" "); }\n});'
          ),
          sl(
            'watch x watchEffect',
            'watch(fonte, callback) observa fontes ESPECÍFICAS que você declara e entrega o valor novo e o antigo; por padrão não roda na criação (use { immediate: true } para isso). Ideal para reagir a uma mudança precisa (buscar dados quando o id muda). watchEffect(callback) roda IMEDIATAMENTE e rastreia sozinho tudo que foi lido dentro dele, reexecutando quando qualquer um mudar; é mais curto, mas as dependências ficam implícitas. Escolha: watch quando você precisa do valor antigo ou controla bem a fonte; watchEffect quando o efeito depende de várias coisas e você quer simplicidade. Prefira computed a watch quando só precisa DERIVAR um valor.',
            'watch(idDoUsuario, (novo, antigo) => carregar(novo));\nwatchEffect(() => {\n  document.title = `${nome.value} (${pontos.value})`;\n});'
          ),
          sl(
            'flush e escopo de efeitos',
            'A opção flush define QUANDO o callback roda em relação à atualização do DOM: "pre" (padrão) roda antes da atualização do componente; "post" roda depois, útil quando você precisa ler o DOM já atualizado; "sync" roda de forma síncrona a cada mudança (use com cuidado). Sobre o escopo: watchers criados de forma síncrona dentro de setup/<script setup> são parados automaticamente quando o componente é desmontado. Os criados depois (dentro de setTimeout, por exemplo) NÃO são ligados ao componente: guarde o retorno (a função de parada) e chame-a, ou use effectScope() para agrupar e parar vários efeitos de uma vez.',
            'watchEffect(() => lerAlturaDoElemento(), { flush: "post" });\nconst parar = watch(fonte, cb);\nparar(); // para o watcher manualmente'
          )
        ]
      },
      questions: [
        mc('q1', 'No Vue, qual é a forma correta de incrementar um contador criado com ref(0) dentro do <script setup>?', 'contador.value++', [
          'contador++',
          'contador.valor++',
          'contador = contador + 1'
        ], 'No script, o valor da ref é acessado por .value; no template o Vue desembrulha sozinho. As outras formas não alteram o valor reativo (a última reatribui a variável e perde a ref).'),
        mc('q2', 'Dado const estado = reactive({ nome: "Ana" }), o que acontece em const { nome } = estado?', 'nome vira uma cópia simples do valor atual e não acompanha mudanças futuras do estado', [
          'nome continua reativo, pois o reactive mantém a ligação em qualquer desestruturação',
          'O Vue lança um erro, pois reactive não pode ser desestruturado',
          'nome vira automaticamente uma ref que atualiza o template quando o valor muda, pois o Vue converte a desestruturação em refs'
        ], 'A desestruturação lê o valor naquele momento e perde a reatividade. Use toRefs(estado) para obter refs ligadas. O Vue não lança erro nem converte em ref sozinho.'),
        mc('q3', 'Qual é a diferença mais importante entre computed e watch?', 'computed deriva e guarda em cache um valor a partir de dependências; watch dispara um efeito colateral quando uma fonte muda', [
          'computed serve só para números e watch só para textos',
          'computed roda a cada renderização, enquanto watch roda uma vez no início',
          'watch devolve um valor para o template e computed não pode ser usado nele'
        ], 'computed é para valores derivados puros e em cache; watch é para reagir com efeitos (requisições, logs). Não há restrição de tipos nem inversão de papéis.'),
        fill('q4', 'Complete com a função que cria uma ref ligada a uma propriedade específica de um objeto reativo.', 'const nome = ___(usuario, "nome");', ['toRef'], 'toRef(objeto, chave) cria uma ref sincronizada com a propriedade; alterar uma altera a outra.'),
        mc('q5', 'Você precisa buscar dados no servidor sempre que o id da rota mudar e quer o valor antigo para comparação. Qual escolha é a mais natural?', 'watch no id, pois recebe valor novo e antigo e foca na fonte', [
          'computed no id, pois ele pode fazer a requisição ao ser recalculado',
          'watchEffect sem fonte, pois ele fornece automaticamente o valor antigo',
          'reactive no id, pois reagir a mudanças é papel do reactive'
        ], 'watch observa uma fonte específica e entrega novo e antigo. computed deve ser puro (sem requisições) e watchEffect não oferece o valor antigo.'),
        mc('q6', 'Quando usar flush: "post" em um watcher?', 'Quando o callback precisa ler o DOM já atualizado após a mudança de estado', [
          'Quando o callback deve rodar antes de qualquer mudança no estado',
          'Quando o watcher não deve ser parado ao desmontar o componente',
          'Quando se quer desativar o rastreamento de dependências do callback, para que ele rode uma vez e não reaja a mais nada'
        ], '"post" adia o callback para depois da atualização do DOM. Não muda o escopo de desmontagem nem desativa o rastreamento.'),
        mc('q7', 'Um watch é criado dentro de um setTimeout no setup. O que acontece ao desmontar o componente?', 'Ele não é parado automaticamente; guarde a função de parada ou use effectScope', [
          'Ele é parado automaticamente, como qualquer watcher criado em qualquer lugar',
          'O Vue converte o watcher em computed para evitar vazamentos de memória quando o componente for desmontado da tela',
          'Ele continua ativo, mas só dispara quando a página é recarregada'
        ], 'Só watchers criados de forma síncrona no setup são ligados ao ciclo de vida do componente. Os demais exigem parada manual. Não há conversão em computed nem comportamento por recarga.'),
        fill('q8', 'Complete a opção que faz o watch rodar também na criação, e não apenas nas mudanças.', 'watch(id, carregar, { ___: true });', ['immediate'], 'immediate: true executa o callback uma vez logo ao criar o watcher, além das execuções por mudança.')
      ]
    },
    {
      id: 'fii-12-vue-composables-reutilizaveis',
      title: 'Vue: composables reutilizáveis',
      goal: 'Criar composables com argumentos reativos (toValue), limpeza de efeitos e boa testabilidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um composable',
            'Composable é uma função (por convenção com nome useXxx) que usa a Composition API para encapsular e reutilizar lógica com estado: refs, computed, watchers e ciclo de vida. É o equivalente Vue dos hooks personalizados do React (lição fii-04). Cada chamada cria estado novo para o componente chamador, a menos que o estado seja declarado fora da função (então é compartilhado). Padrão de retorno: devolver um objeto com refs ({ x, y }) para que o consumidor desestruture sem perder reatividade. (Código ilustrativo, não executado aqui.)',
            'import { ref, onMounted, onUnmounted } from "vue";\nexport function useMouse() {\n  const x = ref(0);\n  const y = ref(0);\n  const mover = (e) => { x.value = e.clientX; y.value = e.clientY; };\n  onMounted(() => window.addEventListener("mousemove", mover));\n  onUnmounted(() => window.removeEventListener("mousemove", mover));\n  return { x, y };\n}'
          ),
          sl(
            'Limpeza: sempre desfazer o que se criou',
            'Se o composable registra um listener, um timer ou uma assinatura, precisa desfazê-los quando o componente sai da tela, senão ocorre vazamento de memória. Use onUnmounted ou onScopeDispose (o segundo funciona também dentro de effectScope, por isso é preferido em bibliotecas). Se o composable cria watchers de forma síncrona, eles já são parados automaticamente com o componente. Regra: tudo que o composable abre, ele fecha.'
          ),
          sl(
            'Argumentos reativos e toValue',
            'Um composable flexível aceita tanto um valor simples quanto uma ref ou uma função getter como argumento. toValue(arg) normaliza os três casos: devolve o valor se for simples, o .value se for ref e o resultado da chamada se for função. Dentro de watchEffect ou computed, chamar toValue(arg) faz o Vue rastrear a dependência, então o composable reage quando o argumento reativo muda. Em versões recentes toValue está disponível no Vue; confira a documentação da versão em uso.',
            'import { ref, watchEffect, toValue } from "vue";\nexport function useBusca(termo) {      // termo: string | ref | () => string\n  const resultados = ref([]);\n  watchEffect(async () => {\n    const t = toValue(termo);          // rastreia a dependência\n    if (t.length < 2) { resultados.value = []; return; }\n    resultados.value = await buscar(t);\n  });\n  return { resultados };\n}'
          ),
          sl(
            'Testabilidade e organização',
            'Composables com lógica pura são fáceis de testar sem montar componente: injete dependências externas (função de busca, relógio) por argumento em vez de importar direto, assim o teste passa um dublê. Mantenha cada composable com UMA responsabilidade (useMouse, useBusca, usePaginacao), nomeie arquivos por composable e guarde numa pasta composables/. Composables que usam ciclo de vida (onMounted) precisam ser chamados dentro de setup; os que só usam ref/computed funcionam em qualquer lugar. Para testes de composables que dependem de componente existe a ferramenta de testes por nome Vitest com Vue Test Utils.'
          ),
          sl(
            'Evitando armadilhas',
            'Armadilha 1: retornar um reactive e o consumidor desestruturar (perde reatividade); prefira devolver refs ou usar toRefs. Armadilha 2: criar efeitos fora do setup, que não são parados. Armadilha 3: composable "faz-tudo" com muitas responsabilidades. Armadilha 4: guardar dados pessoais em estado compartilhado de módulo sem limpar no logout (o estado fora da função vive enquanto o app vive). Para estado global, prefira Pinia (próxima lição).'
          )
        ]
      },
      questions: [
        mc('q1', 'Dois componentes chamam useMouse(). O que acontece com x e y?', 'Cada componente tem seus próprios x e y, criados dentro da função a cada chamada', [
          'Os dois compartilham os mesmos x e y, como se fosse estado global automático',
          'O Vue bloqueia a segunda chamada do composable para evitar listeners duplicados na janela do navegador e perdas de desempenho',
          'O primeiro componente consegue ler os valores atualizados'
        ], 'Estado declarado dentro da função é novo a cada chamada. Para compartilhar seria preciso declarar fora da função (ou usar Pinia). Não há bloqueio nem leitura exclusiva.'),
        mc('q2', 'Qual é o papel de onUnmounted no composable de mouse?', 'Remover o listener registrado em window quando o componente for desmontado', [
          'Registrar o listener de mousemove assim que o componente for criado',
          'Reiniciar os valores de x e y toda vez que o mouse parar de se mover',
          'Impedir que o componente seja montado mais de uma vez na página'
        ], 'onUnmounted serve para desfazer efeitos (remover listener, limpar timer). O registro é feito em onMounted, e ele não reinicia valores nem controla montagem.'),
        mc('q3', 'O que toValue(termo) faz quando termo é uma ref?', 'Devolve termo.value e, dentro de watchEffect, rastreia a dependência', [
          'Devolve a própria ref, sem desembrulhar nada, e o consumidor precisa ler o .value manualmente em cada uso',
          'Converte a ref em um objeto reactive permanente',
          'Cria uma cópia estática do valor que não reage a mudanças'
        ], 'toValue normaliza: valor simples volta como está, ref vira .value e getter é chamado. Dentro de um efeito, isso registra a dependência. Não devolve a ref nem cria cópia estática.'),
        fill('q4', 'Complete com a função que normaliza um argumento que pode ser valor, ref ou getter.', 'const t = ___(termo);', ['toValue'], 'toValue devolve o valor para valor simples, ref ou função getter, permitindo composables com argumentos flexíveis.'),
        mc('q5', 'Por que injetar a função de busca como argumento do composable ajuda nos testes?', 'O teste pode passar uma função falsa e verificar a lógica sem fazer requisições reais', [
          'Porque o Vue só permite chamar APIs externas por argumentos de função',
          'Porque funções passadas por argumento são executadas mais rápido',
          'Porque dispensa a necessidade de escrever testes automatizados, já que o composable passa a ser verificado pelo próprio Vue'
        ], 'Injeção de dependência torna o composable determinístico no teste. Não há restrição do Vue, ganho de velocidade garantido nem dispensa de testes.'),
        mc('q6', 'Um composable devolve reactive({ x, y }) e o consumidor faz const { x, y } = useMouse(). Qual é o resultado?', 'x e y perdem a reatividade; o ideal é devolver refs num objeto comum ou usar toRefs', [
          'x e y continuam reativos, pois a desestruturação preserva sempre a ligação',
          'O Vue converte a desestruturação em chamadas de toRefs automaticamente',
          'O composable passa a ser executado duas vezes por componente, uma vez para cada propriedade desestruturada pelo consumidor'
        ], 'Desestruturar um reactive copia valores. Devolver refs evita o problema. O Vue não aplica toRefs sozinho nem executa o composable em duplicidade.'),
        mc('q7', 'Qual cuidado de privacidade vale para estado declarado FORA da função do composable?', 'Ele vive enquanto o app vive, então dados pessoais devem ser limpos no logout ou evitados', [
          'Nada, pois estado de módulo é apagado sozinho a cada navegação de rota',
          'Ele é criptografado automaticamente pelo Vue em todos os navegadores',
          'Só vale para estado dentro de componentes, e não para estado de módulo'
        ], 'Estado de módulo persiste e é compartilhado até o app ser recarregado, podendo reter dados de outra pessoa se não limpo. O Vue não criptografa nem apaga isso sozinho.'),
        fill('q8', 'Complete com o hook de ciclo de vida usado para registrar o listener quando o componente é montado.', '___(() => window.addEventListener("mousemove", mover));', ['onMounted'], 'onMounted roda após a montagem do componente, momento adequado para registrar listeners que serão removidos em onUnmounted.')
      ]
    },
    {
      id: 'fii-13-vue-pinia',
      title: 'Vue: Pinia',
      goal: 'Criar stores com state, getters e actions, compor stores, persistir com cuidado e usar as devtools.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que serve o Pinia',
            'Pinia é a biblioteca oficial recomendada de estado global do Vue. Uma store é um objeto de estado reativo que vive fora dos componentes e pode ser usado por qualquer um; é o lugar de dados compartilhados (usuário autenticado, carrinho). Como no React, o estado local (ref no componente) continua sendo a primeira escolha; use store quando vários componentes distantes precisam do mesmo dado. Vem com suporte a TypeScript e às devtools do Vue. (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'Store no estilo setup',
            'Há dois estilos de definir stores. O estilo setup usa a mesma sintaxe da Composition API: ref vira state, computed vira getter e funções viram actions; você devolve o que quer expor. O estilo options usa um objeto com state, getters e actions. Conceitos: STATE é o dado; GETTERS são valores derivados em cache (como computed); ACTIONS são funções que alteram o estado e podem ser assíncronas. defineStore recebe um id único da store.',
            'import { defineStore } from "pinia";\nimport { ref, computed } from "vue";\nexport const useCarrinho = defineStore("carrinho", () => {\n  const itens = ref([]);\n  const total = computed(() => itens.value.reduce((s, i) => s + i.preco * i.qtd, 0));\n  function adicionar(item) { itens.value.push(item); }\n  function limpar() { itens.value = []; }\n  return { itens, total, adicionar, limpar };\n});'
          ),
          sl(
            'Usando a store e o cuidado com storeToRefs',
            'No componente chama-se useCarrinho() e usa-se a store diretamente. Armadilha: desestruturar a store (const { itens, total } = carrinho) perde a reatividade, como no reactive. Para extrair state e getters use storeToRefs(carrinho), que devolve refs; as actions podem ser desestruturadas direto (são funções). Diferente do Redux, o Pinia permite alterar o estado dentro das actions de forma direta, sem cópias imutáveis manuais.',
            'const carrinho = useCarrinho();\nconst { itens, total } = storeToRefs(carrinho);\nconst { adicionar } = carrinho; // actions podem ser extraídas'
          ),
          sl(
            'Compondo stores',
            'Uma store pode usar outra chamando useOutraStore() dentro de uma action ou getter (não no nível do módulo, para evitar dependência circular na inicialização). Exemplo: a store de pedidos lê o usuário da store de autenticação. Mantenha cada store focada em um domínio (auth, carrinho, preferências) e evite uma store "faz-tudo".'
          ),
          sl(
            'Persistência com cuidado e devtools',
            'Plugins (por nome, como pinia-plugin-persistedstate) gravam o estado no localStorage. Cuidados: persista apenas o necessário (preferências de interface, carrinho anônimo), nunca tokens de sessão (use cookie HttpOnly) nem dados pessoais sensíveis; exclua campos com a opção do plugin e limpe no logout. Dados pessoais no navegador ficam legíveis a qualquer script da página (inclusive em caso de XSS). LGPD em visão geral: minimização e retenção; isto não substitui orientação jurídica. As devtools do Vue mostram stores, state, getters e a linha do tempo de mutações, ótimas para depurar.'
          )
        ]
      },
      questions: [
        mc('q1', 'Em uma store Pinia no estilo setup, qual elemento equivale ao "getter"?', 'Um computed devolvido pela função de setup', [
          'Uma ref devolvida pela função de setup',
          'Uma função devolvida que altera o estado da store',
          'Um watch criado dentro do setup da store'
        ], 'Getters são valores derivados em cache, ou seja, computed. ref é state, funções são actions e watch é efeito.'),
        mc('q2', 'O componente faz const { itens, total } = useCarrinho(). Qual é o problema?', 'itens e total perdem a reatividade; o certo é storeToRefs para state e getters', [
          'Nada: a desestruturação de stores preserva a reatividade automaticamente',
          'A store é recriada do zero a cada desestruturação, e todos os dados que estavam guardados nela se perdem de uma vez',
          'O Pinia proíbe ler o state fora de actions e lança erro em tempo de execução'
        ], 'Desestruturar copia valores. storeToRefs devolve refs ligadas à store. Não há recriação nem proibição de leitura.'),
        mc('q3', 'Qual dado é adequado persistir no localStorage por um plugin do Pinia?', 'A preferência de tema e idioma da interface', [
          'O token de sessão do usuário autenticado',
          'A senha digitada no formulário de login',
          'O CPF e o endereço completo do usuário logado'
        ], 'Preferências não sensíveis são adequadas. Tokens devem ficar em cookie HttpOnly, e senhas e documentos não devem ser persistidos no navegador sem necessidade e proteção.'),
        fill('q4', 'Complete com a função do Pinia que extrai state e getters de uma store mantendo a reatividade.', 'const { itens, total } = ___(carrinho);', ['storeToRefs'], 'storeToRefs devolve refs para state e getters, permitindo desestruturar sem perder a reatividade.'),
        mc('q5', 'Onde é mais seguro chamar useOutraStore() para usar outra store dentro de uma store?', 'Dentro de uma action ou getter, quando já foi chamada pelo app', [
          'No nível do módulo, no topo do arquivo, antes de definir a store',
          'Em qualquer lugar, pois o Pinia resolve dependências circulares sozinho',
          'Fora do app, num script separado carregado antes da inicialização do Vue'
        ], 'Chamar dentro de action ou getter evita problemas de ordem de inicialização e dependência circular. No topo do módulo o Pinia pode ainda não estar ativo.'),
        mc('q6', 'Qual é a diferença de estilo entre Pinia e Redux Toolkit quanto à alteração do estado?', 'No Pinia a action altera o estado diretamente, sem criar cópias imutáveis manuais', [
          'No Pinia é obrigatório criar cópias imutáveis, enquanto no Redux se altera direto',
          'O Pinia não permite alterar o estado depois de criado, então cada mudança exige criar uma store nova e substituir a antiga',
          'Os dois exigem reducers puros que devolvem o novo estado a cada ação'
        ], 'O Pinia usa a reatividade do Vue e permite mutação dentro das actions. O Redux Toolkit também aceita escrita estilo mutação, mas por meio do Immer em reducers.'),
        mc('q7', 'Qual cuidado de privacidade tomar ao persistir uma store?', 'Persistir só os campos necessários, excluir dados pessoais e limpar tudo no logout', [
          'Persistir a store inteira, já que o localStorage é criptografado pelo navegador e protege os dados guardados nele',
          'Persistir apenas quando o usuário estiver offline, pois é mais seguro',
          'Trocar o localStorage pelo sessionStorage, que é invulnerável a XSS'
        ], 'Dados no navegador são legíveis por scripts da página, e sessionStorage também. Minimização e limpeza no logout reduzem o risco. Nenhum desses armazenamentos é criptografado por padrão.'),
        fill('q8', 'Complete com a função do Pinia que define uma store a partir de um id único.', 'export const useCarrinho = ___("carrinho", () => { /* ... */ });', ['defineStore'], 'defineStore cria o hook de uso da store a partir do id e da definição (setup ou options).')
      ]
    },
    {
      id: 'fii-14-vue-componentes-avancados',
      title: 'Vue: componentes avançados',
      goal: 'Usar slots com escopo, provide/inject, Teleport, defineModel, componentes dinâmicos e KeepAlive.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Slots e slots com escopo',
            'Slot é um espaço que o componente pai preenche com conteúdo (é a composição do Vue; no React seria children). Um slot com escopo permite que o componente FILHO passe dados ao conteúdo que o pai coloca: o filho declara <slot :item="item" /> e o pai recebe com v-slot="{ item }". Útil em listas e tabelas reutilizáveis: o filho cuida da iteração e o pai decide como mostrar cada linha. (Código ilustrativo, não executado aqui.)',
            '<!-- Lista.vue -->\n<ul><li v-for="p in itens" :key="p.id"><slot :produto="p" /></li></ul>\n\n<!-- uso -->\n<Lista :itens="produtos" v-slot="{ produto }">\n  <strong>{{ produto.nome }}</strong>\n</Lista>'
          ),
          sl(
            'provide e inject',
            'provide("chave", valor) em um ancestral disponibiliza um valor para toda a subárvore; inject("chave") em qualquer descendente lê, sem passar props por todos os níveis (equivalente Vue do Context). Para o valor continuar reativo, forneça uma ref. Boas práticas: usar um Symbol como chave para evitar colisão, fornecer um valor padrão no inject e documentar o contrato. Use com moderação: dados compartilhados globalmente ficam melhor numa store Pinia; provide/inject é para relações entre componentes (ex.: Abas e Aba).',
            'const tema = ref("claro");\nprovide(TemaKey, tema);\n// em um descendente:\nconst tema = inject(TemaKey, ref("claro"));'
          ),
          sl(
            'Teleport',
            'Teleport renderiza uma parte do template em OUTRO ponto do DOM, mantendo-a logicamente dentro do componente (props, eventos e estado continuam funcionando). Caso típico: modais e menus que precisam ficar no fim do body para escapar de overflow:hidden ou de z-index do pai. Sintaxe: <Teleport to="body"> ... </Teleport>. Acessibilidade: o modal ainda precisa de role="dialog", aria-modal, foco preso dentro e fechamento por Esc.',
            '<Teleport to="body">\n  <div v-if="aberto" role="dialog" aria-modal="true">\n    <slot />\n    <button @click="fechar">Fechar</button>\n  </div>\n</Teleport>'
          ),
          sl(
            'defineModel: v-model em componentes próprios',
            'v-model em um componente próprio exige receber uma prop e emitir um evento de atualização. defineModel() (em versões recentes do Vue) simplifica: devolve uma ref que, ao ser lida, traz o valor do pai e, ao ser escrita, avisa o pai. Assim o componente de campo vira <input v-model="valor"> com uma única linha de script. Pode haver mais de um modelo, nomeando-os (defineModel("titulo")). Confira a documentação da versão em uso, pois em versões mais antigas o padrão era props + emit.',
            '<script setup>\nconst valor = defineModel();\n</script>\n<template><input v-model="valor" /></template>\n<!-- uso: <CampoTexto v-model="nome" /> -->'
          ),
          sl(
            'Componentes dinâmicos e KeepAlive',
            '<component :is="Atual" /> renderiza o componente indicado por uma variável, útil para abas e telas trocáveis. Ao trocar, o componente anterior é DESTRUÍDO e perde o estado (campos digitados). <KeepAlive> em volta guarda as instâncias em memória e preserva o estado ao voltar; as props include/exclude/max controlam quais e quantos. Use quando o custo de recriar é alto ou o estado do usuário precisa sobreviver; lembre que mantém memória ocupada. Hooks onActivated/onDeactivated sinalizam entrada e saída da cache.',
            '<KeepAlive max="3">\n  <component :is="abaAtual" />\n</KeepAlive>'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a função de um slot com escopo?', 'Permitir que o filho entregue dados ao conteúdo que o pai coloca no slot', [
          'Permitir que o pai altere o CSS interno do filho sem restrições',
          'Evitar que o filho receba qualquer conteúdo vindo do pai',
          'Renderizar o conteúdo do slot em outro ponto do DOM da página'
        ], 'No slot com escopo o filho passa dados (ex.: :produto="p") e o pai decide a apresentação. Não altera CSS do filho nem impede conteúdo, e mover para outro ponto do DOM é papel do Teleport.'),
        mc('q2', 'Um valor fornecido por provide deve continuar reativo nos descendentes. O que se deve fornecer?', 'Uma ref, para que a leitura via inject acompanhe as mudanças', [
          'Um número simples, pois o inject observa a variável original',
          'Uma string com o nome da variável, e o Vue busca o valor atual',
          'Um objeto congelado com Object.freeze para preservar o estado'
        ], 'Valores simples são copiados; uma ref mantém a ligação reativa. Strings com nome da variável e objetos congelados não criam observação.'),
        mc('q3', 'Por que usar Teleport em um modal?', 'Para renderizar o modal no fim do body e escapar de overflow ou z-index do componente pai', [
          'Para que o modal deixe de receber props e eventos do componente que o criou',
          'Para evitar a necessidade de foco, rótulos e fechamento por teclado, que o Teleport passa a tratar sozinho no modal',
          'Para que o modal funcione sem JavaScript, com HTML puro'
        ], 'Teleport muda o ponto de renderização no DOM e mantém a ligação lógica. A acessibilidade (role, foco, Esc) continua necessária e o modal ainda depende de JavaScript.'),
        fill('q4', 'Complete com a função que cria, no componente filho, um v-model simples ligado ao pai.', 'const valor = ___();', ['defineModel'], 'defineModel() devolve uma ref sincronizada com o v-model do pai, dispensando declarar prop e emit manualmente.'),
        mc('q5', 'Ao trocar de aba com <component :is>, o texto digitado na aba anterior some. Como preservar o estado?', 'Envolver o componente dinâmico em <KeepAlive>', [
          'Usar v-if em vez de :is, o que mantém o estado da aba anterior',
          'Trocar a aba usando sempre uma nova chave no componente',
          'Guardar o texto em uma variável global do window e ler dela'
        ], 'KeepAlive guarda a instância em memória e preserva o estado. v-if destrói o componente, trocar a key recria o componente e variável global é gambiarra.'),
        mc('q6', 'Qual é um cuidado ao usar KeepAlive?', 'As instâncias guardadas continuam ocupando memória; limite com max e use include/exclude', [
          'Ele destrói o componente anterior para liberar a memória imediatamente, e por isso o estado dele não é preservado',
          'Ele impede o uso de props e eventos nos componentes guardados',
          'Ele só funciona com componentes que não têm estado algum'
        ], 'O ganho de preservar estado custa memória; max ajuda. Ele não destrói a instância (é o oposto), não bloqueia props e existe justamente para componentes com estado.'),
        mc('q7', 'Quando provide/inject é preferível a uma store Pinia?', 'Quando a relação é entre componentes de um mesmo conjunto, como Abas e Aba', [
          'Quando se precisa de estado global compartilhado entre telas diferentes, como o usuário logado do aplicativo inteiro',
          'Quando os dados precisam ser persistidos no navegador',
          'Quando se quer inspecionar o histórico de mutações nas devtools'
        ], 'provide/inject cabe a relações locais entre ancestral e descendentes. Estado global, persistência e histórico nas devtools pedem uma store.'),
        fill('q8', 'Complete com o componente nativo do Vue que renderiza dinamicamente o componente indicado por uma variável.', '<___ :is="abaAtual" />', ['component'], '<component :is> renderiza o componente (ou elemento) indicado pela expressão em is.')
      ]
    },
    {
      id: 'fii-15-vue-formularios-e-validacao',
      title: 'Vue: formulários e validação',
      goal: 'Usar v-model avançado e validação com bibliotecas (VeeValidate, Zod), com erros acessíveis.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'v-model em profundidade',
            'v-model é açúcar sintático para ligação em duas vias: no input faz :value + @input; em checkbox usa checked; em select usa o valor da opção. Modificadores úteis: .trim remove espaços nas pontas, .number converte para número e .lazy atualiza no evento change (ao sair do campo) em vez de a cada tecla. Em checkbox com uma lista, v-model num array acumula os valores marcados. Para componentes próprios use defineModel (lição anterior). (Código ilustrativo, não executado aqui.)',
            '<input v-model.trim="nome" />\n<input v-model.number="idade" type="number" />\n<input v-model="aceito" type="checkbox" />\n<select v-model="pais"><option value="br">Brasil</option></select>'
          ),
          sl(
            'Por que usar uma biblioteca de validação',
            'Validar à mão cada campo gera código repetido e inconsistente (quando validar? ao digitar, ao sair do campo, ao enviar?). Bibliotecas por nome como VeeValidate e FormKit organizam: estado de cada campo (tocado, modificado, válido), mensagens, envio e reset. Elas se integram a schemas Zod (ou Yup) para declarar as regras uma vez só. Lembrete essencial: a validação do cliente é UX, a segurança está na validação do servidor, que repete as regras.'
          ),
          sl(
            'VeeValidate com schema Zod (ilustrativo)',
            'useForm recebe um validationSchema; defineField devolve o modelo e atributos de cada campo; handleSubmit só chama sua função se tudo for válido. O schema Zod descreve regras e mensagens. O mesmo schema pode ser reutilizado no servidor (se o back-end for JavaScript/TypeScript).',
            'const { errors, defineField, handleSubmit } = useForm({\n  validationSchema: toTypedSchema(z.object({\n    email: z.string().email("E-mail inválido"),\n    senha: z.string().min(12, "Use ao menos 12 caracteres")\n  }))\n});\nconst [email, emailAttrs] = defineField("email");\nconst enviar = handleSubmit((valores) => api.cadastrar(valores));'
          ),
          sl(
            'Mensagens de erro acessíveis',
            'Mesmas regras do React: ligue a mensagem ao campo com aria-describedby, marque aria-invalid, use role="alert" (ou aria-live) para anunciar, não dependa só de cor e leve o foco ao primeiro campo inválido quando o envio falhar. Exiba o erro depois que o campo foi tocado, não antes de o usuário digitar (evita tela vermelha logo ao abrir). Mantenha o label visível associado por for/id.',
            '<label for="email">E-mail</label>\n<input id="email" v-model="email" v-bind="emailAttrs"\n  :aria-invalid="errors.email ? \'true\' : \'false\'"\n  :aria-describedby="errors.email ? \'email-erro\' : undefined" />\n<p v-if="errors.email" id="email-erro" role="alert">{{ errors.email }}</p>'
          ),
          sl(
            'Segurança e privacidade em formulários Vue',
            'Evite v-html com texto digitado pelo usuário (XSS): a interpolação {{ }} já escapa o conteúdo, use-a. Não registre valores do formulário no console nem em logs. Senhas: type="password" e autocomplete adequado ("new-password" no cadastro), exigência de tamanho mínimo no cliente e no servidor, hash lento (argon2/bcrypt/scrypt) no servidor; nunca guarde senha em store ou localStorage. Tokens de proteção CSRF e sessão ficam com o back-end (veja o curso de Segurança Web). Dados fictícios nos exemplos (usuario@example.com). LGPD em visão geral; não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual modificador de v-model remove espaços no início e no fim do texto digitado?', '.trim', [
          '.lazy',
          '.number',
          '.clean'
        ], '.trim remove espaços nas pontas. .lazy muda o momento de atualização, .number converte para número e .clean não existe.'),
        mc('q2', 'Qual é o efeito de v-model.lazy em um input de texto?', 'Atualiza o valor no evento change (ao sair do campo), em vez de a cada tecla', [
          'Atrasa a atualização em um segundo para evitar requisições seguidas',
          'Impede que o valor seja alterado depois de digitado pela primeira vez',
          'Valida o conteúdo no servidor antes de atualizar a variável'
        ], '.lazy troca o evento input por change. Não aplica atraso de tempo (isso seria debounce), não bloqueia edição e não valida no servidor.'),
        mc('q3', 'Por que repetir as regras de validação no servidor mesmo com VeeValidate e Zod no cliente?', 'O cliente pode ser contornado e só o servidor protege de fato os dados', [
          'Porque o Zod só funciona no navegador e não consegue validar objetos simples',
          'Porque o servidor precisa ter o dobro de regras para ser aprovado em auditorias',
          'Porque a validação do cliente sempre falha quando há mais de um campo'
        ], 'Requisições podem ser feitas sem a interface, então a validação do servidor é a defesa real; a do cliente melhora a experiência. Zod roda em JavaScript em qualquer ambiente e a validação do cliente não falha por quantidade de campos.'),
        fill('q4', 'Complete com o modificador de v-model que converte o texto digitado em número.', '<input v-model.___="idade" type="number" />', ['number'], '.number converte o valor do campo para número, quando possível.'),
        mc('q5', 'Quando é recomendável exibir a mensagem de erro de um campo?', 'Depois que o campo foi tocado ou o envio foi tentado', [
          'Imediatamente ao abrir o formulário, antes de qualquer interação',
          'Somente depois de o formulário ser enviado com sucesso ao servidor',
          'Jamais mostrar, deixando o servidor mostrar o erro em uma página separada'
        ], 'Mostrar erros após o toque ou a tentativa de envio evita a tela vermelha prematura. Esperar sucesso não faz sentido para erros, e deixar tudo para o servidor piora a UX.'),
        mc('q6', 'Em qual situação v-html com texto de usuário é um risco?', 'Quando o texto digitado é renderizado como HTML, abrindo espaço para XSS; a interpolação {{ }} escapa o conteúdo', [
          'Quando o texto passa por .trim, que reativa scripts bloqueados do navegador e faz o conteúdo ser executado na página inteira',
          'Quando o campo usa type="text", pois o navegador desativa a proteção',
          'Em risco algum, pois o Vue sanitiza automaticamente o conteúdo do v-html'
        ], 'v-html insere HTML sem escape; a interpolação escapa. O Vue não sanitiza o v-html; se for indispensável, sanitize com biblioteca específica antes. .trim e type="text" não influenciam isso.'),
        mc('q7', 'Qual prática protege melhor uma senha no fluxo de cadastro?', 'autocomplete="new-password" no campo e hash lento no servidor, sem guardar a senha em store ou localStorage', [
          'Guardar a senha em uma store Pinia para reutilizar na tela seguinte',
          'Registrar a senha no console durante o desenvolvimento e removê-la antes de publicar, para ajudar a depurar o cadastro',
          'Enviar a senha por parâmetro de URL para facilitar o redirecionamento'
        ], 'Senha só deve existir no campo e no envio ao servidor, que a protege com hash lento. Store, console e URL a expõem (histórico, logs, referer).'),
        fill('q8', 'Complete com a função do VeeValidate que recebe sua função de envio e só a chama se todos os campos forem válidos.', 'const enviar = ___((valores) => api.cadastrar(valores));', ['handleSubmit'], 'handleSubmit valida o formulário e só então chama a função, entregando os valores válidos.')
      ]
    },
    {
      id: 'fii-16-vue-performance-e-boas-praticas',
      title: 'Vue: performance e boas práticas',
      goal: 'Aplicar v-memo, shallowRef, cache de computed, listas grandes e carregamento assíncrono de componentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Meça primeiro; o Vue já é eficiente por padrão',
            'Como a reatividade do Vue sabe quais componentes dependem de cada dado, ele costuma atualizar pouco sem esforço. Otimize só depois de medir (devtools do Vue, aba Performance do navegador). As técnicas abaixo resolvem casos específicos; aplicá-las "por garantia" só complica o código. (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'computed e seu cache',
            'computed guarda o resultado e só recalcula quando uma dependência reativa muda; chamá-lo dez vezes no template custa um cálculo. Já uma FUNÇÃO chamada no template ({{ filtrar() }}) roda a cada renderização. Por isso valores derivados e caros (filtrar e ordenar uma lista) devem ser computed. Mantenha o computed puro e sem efeitos colaterais.',
            'const visiveis = computed(() =>\n  produtos.value.filter((p) => p.nome.includes(busca.value))\n);'
          ),
          sl(
            'shallowRef e shallowReactive',
            'ref e reactive tornam reativo o objeto INTEIRO, de forma profunda (cada propriedade aninhada). Com listas enormes ou objetos grandes vindos de uma API, isso tem custo. shallowRef só torna reativa a troca do .value (não o conteúdo interno): você atualiza substituindo o objeto inteiro (lista.value = novaLista). Use quando o dado é grande, tratado como imutável, e você só o substitui. Armadilha: mudar uma propriedade interna (lista.value[0].nome = "x") NÃO dispara atualização num shallowRef; use triggerRef ou troque o valor.',
            'const linhas = shallowRef([]);\nasync function carregar() {\n  linhas.value = await api.listar(); // troca o valor: reativo\n}'
          ),
          sl(
            'v-memo e listas grandes',
            'v-memo="[dep1, dep2]" em um elemento faz o Vue pular a atualização daquela subárvore enquanto as dependências listadas não mudarem; é útil em itens de listas muito grandes (v-for com centenas de itens pesados). É uma otimização avançada: só use após medir. Para listas realmente enormes, a técnica certa é a virtualização (renderizar só o visível, com bibliotecas por nome como vue-virtual-scroller ou TanStack Virtual), além de paginação. Use sempre :key estável (id do registro).',
            '<li v-for="p in produtos" :key="p.id" v-memo="[p.id === selecionado]">\n  {{ p.nome }}\n</li>'
          ),
          sl(
            'Carregamento assíncrono de componentes',
            'defineAsyncComponent(() => import("./Grafico.vue")) cria um componente carregado só quando for renderizado (code splitting, separado pelo bundler). Aceita opções de loadingComponent, errorComponent, delay e timeout. Combina com rotas: no Vue Router, escrever component: () => import("./Painel.vue") já divide por rota. Confira a documentação oficial da versão em uso para opções e recursos novos. Outras boas práticas: evitar watchers desnecessários, preferir computed, remover listeners nas limpezas e auditar dependências.',
            'const Grafico = defineAsyncComponent(() => import("./Grafico.vue"));'
          )
        ]
      },
      questions: [
        mc('q1', 'Por que um valor derivado e caro deve ser computed e não uma função chamada no template?', 'O computed guarda o resultado em cache e só recalcula quando as dependências mudam', [
          'A função no template não chega a rodar, pois o Vue ignora chamadas de função dentro de templates e usa valores',
          'O computed executa em outra thread e assim não bloqueia a interface',
          'O computed grava o resultado no servidor para uso em futuras visitas'
        ], 'O cache do computed evita recalcular a cada renderização, como acontece com a função no template. O Vue executa funções no template, não há outra thread e não há gravação no servidor.'),
        mc('q2', 'Qual é o efeito de mudar lista.value[0].nome = "x" quando lista é um shallowRef?', 'Não dispara atualização, pois apenas a troca de lista.value é reativa', [
          'Dispara atualização normalmente, pois shallowRef é igual a ref',
          'Lança um erro que impede a atribuição de propriedades internas',
          'Atualiza só a primeira linha da lista e ignora as demais'
        ], 'Em shallowRef, a reatividade é só no .value. Para a mudança aparecer, troque o valor ou use triggerRef. Não é igual a ref, não gera erro e não atualiza parcialmente.'),
        mc('q3', 'Qual técnica é mais indicada para uma lista com dezenas de milhares de linhas?', 'Virtualização, renderizando só as linhas visíveis, e paginação quando possível', [
          'Usar o índice como key para que o diff fique mais barato, mesmo em listas que mudam de ordem com frequência',
          'Renderizar todas as linhas e esconder as não visíveis com CSS',
          'Colocar um watch em cada linha para atualizar só as alteradas'
        ], 'O gargalo é a quantidade de nós de DOM, resolvida por virtualização. Esconder com CSS mantém os nós, índice como key traz problemas e um watch por linha só adiciona custo.'),
        fill('q4', 'Complete com a função que cria um componente carregado de forma assíncrona só quando for renderizado.', 'const Grafico = ___(() => import("./Grafico.vue"));', ['defineAsyncComponent'], 'defineAsyncComponent envolve um import dinâmico e carrega o componente sob demanda, gerando um pedaço separado no bundle.'),
        mc('q5', 'O que v-memo="[selecionado]" faz em um item de lista?', 'Pula a atualização do item enquanto o valor listado na dependência não mudar', [
          'Guarda o item no localStorage para recuperá-lo na próxima visita',
          'Impede que o item seja removido da lista pelo usuário enquanto a dependência estiver com o mesmo valor guardado',
          'Faz o item ser renderizado duas vezes para garantir consistência'
        ], 'v-memo memoriza a subárvore e só reavalia quando as dependências do array mudam. Não persiste dados, não bloqueia remoção e não duplica renderizações.'),
        mc('q6', 'Qual é a melhor sequência de trabalho ao otimizar uma tela Vue?', 'Medir, achar o gargalo, aplicar uma técnica específica e medir de novo', [
          'Aplicar v-memo e shallowRef em os componentes antes de testar, já que essas técnicas não prejudicam o desempenho',
          'Reescrever a tela em outro framework para obter melhor desempenho',
          'Remover a reatividade de todo o estado para evitar qualquer custo'
        ], 'Otimização guiada por medida evita complexidade desnecessária. As outras opções são exageros sem evidência.'),
        mc('q7', 'Em um shallowRef com uma lista grande, qual é a forma de atualizar a tela?', 'Substituir o valor inteiro com linhas.value = novaLista', [
          'Alterar a posição do array diretamente com linhas.value.push(item)',
          'Reatribuir a variável linhas = novaLista, sem usar .value',
          'Chamar location.reload() para forçar a nova leitura dos dados'
        ], 'Trocar o .value é a operação reativa do shallowRef. push não é rastreado, reatribuir a constante perde a ref e recarregar a página é desproporcional.'),
        fill('q8', 'Complete com o atributo que identifica de forma estável cada item em um v-for.', '<li v-for="p in produtos" :___="p.id">{{ p.nome }}</li>', ['key'], ':key com o id do registro dá identidade estável ao item para o diff reaproveitar os nós corretos.')
      ]
    },
    {
      id: 'fii-17-angular-componentes-avancados',
      title: 'Angular: componentes avançados',
      goal: 'Usar projeção de conteúdo, ViewChild/ContentChild, ciclo de vida, OnPush e organizar componentes standalone.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Projeção de conteúdo (ng-content)',
            'Projeção de conteúdo é o equivalente Angular de slots/children: o componente declara <ng-content /> e o conteúdo que o pai coloca entre as tags do componente aparece ali. Com o atributo select você cria vários slots: <ng-content select="[cabecalho]" />. Serve para componentes de layout reutilizáveis (cartão, modal, painel) que não conhecem o conteúdo. (Código Angular ilustrativo, não executado aqui; confira a documentação da versão em uso.)',
            '@Component({\n  selector: "app-cartao",\n  template: `\n    <header><ng-content select="[cabecalho]" /></header>\n    <section><ng-content /></section>\n  `\n})\nexport class Cartao {}\n// uso:\n// <app-cartao><h2 cabecalho>Resumo</h2><p>Conteúdo</p></app-cartao>'
          ),
          sl(
            'ViewChild e ContentChild',
            'Servem para o componente acessar elementos ou componentes filhos pela classe. ViewChild consulta o que está no PRÓPRIO template do componente; ContentChild consulta o que foi PROJETADO pelo pai (conteúdo entre as tags). Em versões recentes existem as funções viewChild() e contentChild() que devolvem signals (viewChildren/contentChildren para listas), preferidas ao decorador. O resultado só fica disponível depois que a visualização é criada; antes disso é undefined.',
            'export class Busca {\n  campo = viewChild<ElementRef<HTMLInputElement>>("campo");\n  focar() { this.campo()?.nativeElement.focus(); }\n}\n// template: <input #campo />'
          ),
          sl(
            'Ciclo de vida essencial',
            'O Angular chama métodos em momentos definidos: ngOnInit (depois que as entradas foram recebidas: bom para inicializar), ngOnChanges (quando uma entrada muda, recebe os valores antigo/novo), ngAfterViewInit (depois que o template e os filhos estão prontos: único ponto seguro para tocar no DOM de view), ngOnDestroy (limpeza: cancelar assinaturas, listeners e timers). Em versões recentes, DestroyRef e funções como afterNextRender oferecem alternativas funcionais. Erro comum: usar o construtor para lógica que depende de inputs, que ainda não chegaram.'
          ),
          sl(
            'ChangeDetectionStrategy.OnPush',
            'A detecção de mudanças decide quando atualizar o template. No padrão, o Angular verifica o componente a cada ciclo. Com OnPush, o componente só é verificado quando: uma ENTRADA muda por referência, um evento do template do próprio componente acontece, um signal lido no template muda, ou o async pipe emite. Resultado: menos verificações. Condição: tratar dados como imutáveis (trocar a referência em vez de mutar o objeto), senão a tela não atualiza. Vale a pena adotar OnPush como padrão em componentes novos.',
            '@Component({\n  selector: "app-lista",\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `...`\n})\nexport class Lista { itens = input.required<Item[]>(); }'
          ),
          sl(
            'Standalone organizado',
            'Componentes standalone declaram suas próprias dependências em imports: [...], sem NgModule (módulos ficam como menção histórica). Organização sugerida: pastas por funcionalidade (features/pedidos), componentes burros (apresentação, só entradas e saídas) separados de componentes inteligentes (falam com serviços), um arquivo por componente, nomes consistentes e um arquivo de rotas por funcionalidade com carregamento sob demanda. Privacidade: componentes de apresentação não devem logar dados pessoais.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é o papel de <ng-content> em um componente Angular?', 'Mostrar, no lugar da tag, o conteúdo que o pai colocou entre as tags do componente', [
          'Importar outros componentes standalone para dentro do template do componente',
          'Carregar o componente sob demanda quando ele aparecer na tela',
          'Executar código TypeScript no momento em que o componente é criado'
        ], 'ng-content projeta o conteúdo do pai (equivalente a slots/children). Importar componentes é papel do array imports, carregar sob demanda é @defer ou lazy loading e executar código na criação é o construtor/ciclo de vida.'),
        mc('q2', 'Qual é a diferença entre ViewChild e ContentChild?', 'ViewChild consulta elementos do template do próprio componente; ContentChild consulta o conteúdo projetado pelo pai', [
          'ViewChild só funciona com texto e ContentChild só com componentes, de modo que o tipo do nó define qual deles usar em cada caso',
          'ViewChild consulta o conteúdo projetado e ContentChild o template do próprio componente',
          'Os dois são idênticos e diferem apenas no nome em versões antigas'
        ], 'A diferença é a origem: o template do próprio componente (View) ou o conteúdo projetado (Content). Não há distinção por tipo de nó e as alternativas invertem ou igualam os papéis.'),
        mc('q3', 'Em qual momento do ciclo de vida é seguro acessar o DOM do template do próprio componente?', 'Depois de ngAfterViewInit', [
          'Dentro do construtor, logo ao criar a instância da classe',
          'Antes de ngOnInit, quando as entradas ainda não chegaram',
          'Dentro de ngOnDestroy, no momento da limpeza do componente'
        ], 'Só após a view estar criada os elementos existem. No construtor e antes do init eles ainda não estão disponíveis, e ngOnDestroy é para limpeza.'),
        fill('q4', 'Complete com o método do ciclo de vida usado para fazer limpeza (cancelar assinaturas, timers e listeners) quando o componente é destruído.', 'ngOn___() { this.timer && clearInterval(this.timer); }', ['Destroy'], 'ngOnDestroy roda quando o componente é removido e é o lugar de desfazer o que foi aberto.'),
        mc('q5', 'Com OnPush, um componente recebe um objeto de entrada e o pai muda uma propriedade interna do mesmo objeto. O que acontece?', 'O componente pode não atualizar, pois a referência da entrada não mudou', [
          'O componente atualiza sempre, pois qualquer mutação é detectada em OnPush',
          'O Angular lança um erro e interrompe o aplicativo ao detectar a mutação',
          'O componente atualiza só depois de o usuário recarregar a página'
        ], 'OnPush compara a referência da entrada; mutar o interior não a altera. Use dados imutáveis (nova referência). Não há erro nem necessidade de recarga.'),
        mc('q6', 'Qual escolha de organização combina com componentes standalone?', 'Pastas por funcionalidade e componentes de apresentação separados dos que conversam com serviços', [
          'Um único arquivo com os componentes da aplicação para facilitar a busca',
          'Um NgModule gigante que declara todos os componentes e serviços do app, como único ponto de configuração do projeto',
          'Componentes que acessam diretamente o DOM de outros componentes irmãos'
        ], 'Organizar por feature e separar apresentação de lógica melhora manutenção. Arquivo único e módulo gigante dificultam, e acessar o DOM de irmãos quebra o encapsulamento.'),
        mc('q7', 'Por que evitar lógica que depende de entradas no construtor?', 'No construtor as entradas ainda não foram recebidas; ngOnInit é o ponto adequado', [
          'Porque o construtor só pode ser usado em componentes com OnPush',
          'Porque o Angular proíbe qualquer código dentro de construtores',
          'Porque o construtor roda só depois de ngOnDestroy, quando o componente já deixou a tela do usuário e perdeu as entradas'
        ], 'As entradas são definidas depois da criação da instância, então ngOnInit (ou o uso de signals) é o ponto certo. O construtor é permitido e roda no início do ciclo.'),
        fill('q8', 'Complete com a estratégia de detecção de mudanças que reduz verificações quando os dados são tratados como imutáveis.', 'changeDetection: ChangeDetectionStrategy.___', ['OnPush'], 'OnPush verifica o componente só quando entradas mudam por referência, eventos próprios, signals lidos ou async pipe emitem.')
      ]
    },
    {
      id: 'fii-18-angular-signals-em-profundidade',
      title: 'Angular: signals em profundidade',
      goal: 'Usar signal, computed, effect, input/output/model e a interoperabilidade com RxJS (toSignal/toObservable).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'signal e computed',
            'Signal é um valor reativo lido chamando-o como função: const n = signal(0); n() lê, n.set(5) escreve e n.update((v) => v + 1) altera a partir do anterior (é o mesmo modelo do mini sistema de reatividade da lição fii-01). computed(() => ...) deriva um valor de outros signals, é preguiçoso e guardado em cache, e só recalcula quando uma dependência muda. Regra: computed é puro, sem escrever em outros signals. Em versões recentes signals são a forma recomendada de estado local em componentes; confira a documentação da versão em uso. (Código ilustrativo, não executado aqui.)',
            'const preco = signal(100);\nconst qtd = signal(2);\nconst total = computed(() => preco() * qtd());\nqtd.update((q) => q + 1); // total() agora é 300'
          ),
          sl(
            'effect: efeitos colaterais',
            'effect(() => ...) roda quando os signals lidos dentro dele mudam; serve para efeitos colaterais (registrar, sincronizar com algo fora do Angular, tocar no DOM). Roda ao menos uma vez e é parado automaticamente com o componente. Evite usar effect para propagar estado (copiar um signal para outro): para isso use computed ou linkedSignal (em versões recentes). Evite também logar dados pessoais dentro de effects de depuração.',
            'effect(() => {\n  console.log("total mudou para", total()); // sem dados pessoais\n});'
          ),
          sl(
            'input, output e model signals',
            'Em versões recentes, entradas e saídas de componentes têm funções baseadas em signals. input<T>() cria uma entrada somente leitura, lida como função (input.required<T>() obriga o pai a fornecer). output<T>() cria uma saída: this.salvou.emit(valor). model<T>() cria uma entrada de DUAS VIAS: o componente pode ler e escrever, e o pai usa [(valor)]="x". Vantagem: entradas viram signals, então funcionam com computed e effect sem ngOnChanges.',
            'export class Contador {\n  inicial = input(0);\n  mudou = output<number>();\n  valor = model(0);          // [(valor)] no pai\n  dobro = computed(() => this.valor() * 2);\n}'
          ),
          sl(
            'Interoperabilidade com RxJS',
            'Muita coisa do Angular ainda emite observáveis (HttpClient, formulários reativos, rotas). toSignal(observavel$, { initialValue }) converte um observável em signal (assina e cancela sozinho); toObservable(signal) faz o caminho oposto, permitindo usar operadores como debounceTime. Regra prática: signals para ESTADO (valor atual) e RxJS para FLUXOS e eventos no tempo (digitação com debounce, requisições canceláveis). toSignal precisa de initialValue ou lida com undefined, pois o observável pode ainda não ter emitido.',
            'const termo = signal("");\nconst termo$ = toObservable(termo).pipe(debounceTime(300));\nconst resultados = toSignal(\n  termo$.pipe(switchMap((t) => api.buscar(t))),\n  { initialValue: [] }\n);'
          ),
          sl(
            'Erros comuns',
            'Erro 1: esquecer os parênteses (total em vez de total()) e ler a função, não o valor. Erro 2: mutar o conteúdo interno de um objeto dentro de um signal (lista().push(x)) sem avisar; use update com cópia: lista.update((l) => [...l, x]). Erro 3: criar effect para derivar valores. Erro 4: escrever em signals dentro de computed. Erro 5: chamar toSignal repetidamente em loops ou fora de contexto de injeção (precisa ser chamado em construtor/campo de classe ou com injector).'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a forma correta de ler o valor de um signal chamado preco no TypeScript do componente?', 'preco()', [
          'preco.value',
          'preco.get',
          'preco'
        ], 'Signals são lidos como funções. .value é o padrão da ref do Vue, .get não existe e usar só o nome devolve a função, não o valor.'),
        mc('q2', 'Qual é a característica de um computed?', 'É derivado de outros signals, guardado em cache e recalculado só quando uma dependência muda', [
          'É um signal que aceita set para escrever diretamente no valor calculado',
          'É recalculado a cada ciclo de detecção, mesmo sem mudança nas dependências',
          'É uma função assíncrona que consulta o servidor a cada leitura do valor'
        ], 'computed é somente leitura, preguiçoso e em cache. Não aceita set, não recalcula sem necessidade e deve ser puro (nada de requisições).'),
        mc('q3', 'Quando preferir computed a effect?', 'Quando você só precisa derivar um valor a partir de outros signals', [
          'Quando você quer chamar uma API a cada mudança de um signal',
          'Quando você precisa gravar no localStorage a cada mudança, garantindo a persistência do valor entre as visitas',
          'Quando você quer registrar eventos em um serviço de monitoramento'
        ], 'Derivar valores é papel do computed. Efeitos colaterais (API, storage, monitoramento) pertencem a effect ou a serviços.'),
        fill('q4', 'Complete com a função que cria uma entrada do componente baseada em signal, lida como função.', 'nome = ___<string>();', ['input'], 'input<T>() cria uma entrada somente leitura baseada em signal; input.required obriga o pai a fornecer o valor.'),
        mc('q5', 'O que model() oferece em comparação com input()?', 'Entrada de duas vias: o componente lê e escreve, e o pai usa [(valor)]', [
          'Entrada que não muda depois de definida, mesmo se o pai tentar alterá-la',
          'Saída de eventos para o pai, sem possibilidade de leitura de valores',
          'Entrada que só aceita observáveis do RxJS como valor de origem'
        ], 'model é a ligação bidirecional baseada em signal. Não é imutável, não é só saída (isso é output) e não restringe a observáveis.'),
        mc('q6', 'Para qual finalidade o Angular recomenda toSignal?', 'Converter um observável (por exemplo, de HttpClient) em signal, cancelando a assinatura sozinho', [
          'Converter um signal em observável para aplicar operadores como debounceTime',
          'Executar código quando o componente for destruído, fazendo a limpeza de todas as assinaturas abertas dentro dele',
          'Guardar o estado do formulário diretamente no localStorage do navegador'
        ], 'toSignal assina o observável e expõe o valor atual como signal, limpando ao fim. O caminho inverso é toObservable, e as outras opções são outros mecanismos.'),
        mc('q7', 'O que há de errado em lista().push(novo) para uma lista guardada em um signal?', 'Muta o array interno sem avisar o signal; use update com uma cópia nova', [
          'O método push não existe em arrays do JavaScript quando eles estão guardados dentro de um signal do Angular',
          'O signal converte automaticamente o array em string, impedindo o push',
          'Não há nada errado: o signal observa todas as alterações internas'
        ], 'Signals notificam quando o valor é substituído (referência nova). Mutar o conteúdo não notifica. Use lista.update((l) => [...l, novo]).'),
        fill('q8', 'Complete com o método do signal que altera o valor a partir do valor anterior.', 'qtd.___((q) => q + 1);', ['update'], 'update recebe uma função com o valor atual e devolve o novo; set grava um valor direto.')
      ]
    },
    {
      id: 'fii-19-angular-injecao-de-dependencias',
      title: 'Angular: injeção de dependências',
      goal: 'Entender a hierarquia de injetores, providers, tokens, escopos, inject() e serviços com e sem estado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é injeção de dependências',
            'Injeção de dependências (DI) é um padrão em que uma classe NÃO cria o que precisa; ela PEDE ao framework, que fornece uma instância pronta. Vantagens: menos acoplamento, facilidade de trocar implementações (um serviço falso nos testes) e instâncias compartilhadas gerenciadas pelo Angular. Um serviço é uma classe com lógica reutilizável (acesso a API, estado), marcada com @Injectable. (Código ilustrativo, não executado aqui.)',
            '@Injectable({ providedIn: "root" })\nexport class PedidosService {\n  private http = inject(HttpClient);\n  listar() { return this.http.get<Pedido[]>("/api/pedidos"); }\n}'
          ),
          sl(
            'inject() e providers',
            'inject(Token) pede uma dependência dentro de construtores, campos de classe ou funções executadas em contexto de injeção (é o estilo moderno; o parâmetro do construtor continua válido). Um provider ensina o Angular a criar um valor para um token: classe (padrão), useClass (outra classe), useValue (valor fixo), useFactory (função) e useExisting (alias). Em componentes standalone, providers: [...] no componente cria instâncias próprias para ele e seus filhos.',
            'export const API_URL = new InjectionToken<string>("API_URL");\n// em app.config.ts:\nproviders: [{ provide: API_URL, useValue: "/api" }]\n// uso: private url = inject(API_URL);'
          ),
          sl(
            'Hierarquia de injetores e escopos',
            'Os injetores formam uma árvore: o pedido sobe do componente para os ancestrais até achar um provider. Escopos principais: providedIn: "root" cria UMA instância para o app todo (singleton); providers no componente criam uma instância por componente (e seus descendentes); providers de rota limitam a uma área do app. Escolher o escopo certo evita estado compartilhado por engano (dados de um usuário aparecendo em outra tela) e permite isolar estado de uma funcionalidade.'
          ),
          sl(
            'Serviço sem estado x com estado',
            'Serviço SEM estado só oferece operações (calcular, chamar API) e é seguro como singleton. Serviço COM estado guarda dados (carrinho, usuário atual) e exige cuidado: um singleton com estado é compartilhado por todo o app, o que é desejado para o usuário autenticado e perigoso para dados de uma tela específica. Estado em serviços deve ser exposto como signals somente leitura (asReadonly) para que só o serviço o altere. Privacidade: limpe o estado com dados pessoais no logout e não guarde mais do que o necessário.',
            '@Injectable({ providedIn: "root" })\nexport class CarrinhoStore {\n  private _itens = signal<Item[]>([]);\n  itens = this._itens.asReadonly();\n  adicionar(i: Item) { this._itens.update((l) => [...l, i]); }\n  limpar() { this._itens.set([]); }\n}'
          ),
          sl(
            'Testes e troca de implementação',
            'A DI facilita testes: no ambiente de testes você fornece um provider falso para o mesmo token (useValue ou useClass) e o componente usa o dublê sem saber. Ferramentas por nome: TestBed (Angular) com Jasmine ou Vitest, Testing Library. Em versões recentes, funções como provideHttpClient e provideHttpClientTesting configuram o HTTP. Resolva dependências circulares reorganizando responsabilidades, não com atalhos.'
          )
        ]
      },
      questions: [
        mc('q1', 'O que significa providedIn: "root" em um serviço?', 'Existe uma única instância do serviço, compartilhada por todo o aplicativo', [
          'Cada componente que injeta o serviço recebe uma instância nova',
          'O serviço só pode ser usado pelo componente raiz da aplicação',
          'O serviço é criado novamente a cada mudança de rota'
        ], 'providedIn root cria um singleton no injetor raiz. Instância por componente exige providers no componente, e o uso não se restringe à raiz nem recria a cada rota.'),
        mc('q2', 'Qual é a vantagem de injetar uma dependência em vez de criá-la com new dentro da classe?', 'Facilita trocar a implementação, por exemplo por um dublê nos testes, e reduz o acoplamento', [
          'Faz a classe executar mais rápido por evitar o uso de memória, já que as dependências deixam de ser instanciadas de verdade',
          'Impede que a classe use qualquer outra dependência além da injetada',
          'Garante que o serviço nunca falhe ao chamar a API'
        ], 'DI desacopla e permite substituir implementações. Não é sobre velocidade, não limita dependências e não impede falhas.'),
        mc('q3', 'Um serviço singleton guarda a lista de pedidos da tela atual, e outra tela abre mostrando os mesmos pedidos. Qual a causa provável?', 'O estado de uma funcionalidade foi colocado em um serviço root compartilhado por todo o app', [
          'O Angular copia automaticamente o estado de uma tela para a outra',
          'O navegador reaproveita o HTML anterior sem executar o JavaScript',
          'O template exibe o primeiro item da lista de pedidos para qualquer tela, por causa de um erro no laço de repetição'
        ], 'Singleton compartilha estado entre telas. Para isolar, use providers no componente ou na rota. Não há cópia automática nem reaproveitamento de HTML.'),
        fill('q4', 'Complete com a função moderna que pede uma dependência dentro de um campo de classe.', 'private http = ___(HttpClient);', ['inject'], 'inject(Token) obtém a dependência em contexto de injeção, como campos de classe e construtores.'),
        mc('q5', 'Qual provider usar para fornecer um valor de configuração fixo, como a URL base da API (um placeholder, nunca um segredo)?', '{ provide: API_URL, useValue: "/api" }', [
          '{ provide: API_URL, useFactory: new Date() }',
          '{ provide: API_URL, useClass: "/api" }',
          '{ provide: API_URL, useExisting: Math.random() }'
        ], 'useValue fornece um valor fixo. useFactory espera função, useClass espera classe e useExisting espera outro token. Segredos nunca devem ir ao front-end, pois o bundle é público.'),
        mc('q6', 'Por que expor o estado de um serviço com asReadonly()?', 'Para que apenas o serviço altere o estado, enquanto os componentes só leem', [
          'Para criptografar os valores do signal antes de entregar aos componentes',
          'Para que o signal passe a ser recalculado a cada leitura do valor',
          'Para impedir que o signal seja usado dentro de computed, já que valores de leitura não têm dependências'
        ], 'asReadonly entrega uma visão sem set/update, preservando o encapsulamento. Não criptografa, não recalcula a cada leitura e funciona em computed.'),
        mc('q7', 'Qual cuidado de privacidade vale para um serviço root com estado do usuário?', 'Limpar o estado com dados pessoais no logout e guardar só o necessário', [
          'Nenhum, pois estado de serviço some quando o usuário fecha o componente',
          'Persistir tudo no localStorage para o estado sobreviver ao logout',
          'Duplicar os dados em vários serviços para ter cópias de segurança'
        ], 'Um singleton vive enquanto o app vive, podendo reter dados de quem saiu; limpar no logout e minimizar reduz o risco. Persistir tudo ou duplicar piora.'),
        fill('q8', 'Complete com a classe usada para criar um token de injeção para valores que não são classes.', 'export const API_URL = new ___<string>("API_URL");', ['InjectionToken'], 'InjectionToken cria um token tipado para injetar valores como strings, objetos de configuração e funções.')
      ]
    },
    {
      id: 'fii-20-angular-rxjs-essencial',
      title: 'Angular: RxJS essencial',
      goal: 'Usar Observable e operadores comuns (map, switchMap, debounceTime), evitar vazamentos, usar async pipe e decidir quando signal vale mais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Observable e subscribe',
            'Observable é um fluxo preguiçoso de valores: nada acontece até alguém fazer subscribe. Cada valor passa pelo callback next; o fluxo pode terminar com complete ou falhar com error. Ao assinar, você recebe uma Subscription que permite cancelar (unsubscribe). Exemplo: this.http.get(url) é um observável que só dispara a requisição quando assinado (e uma assinatura por vez). (Código RxJS ilustrativo, não executado aqui.)',
            'const s = this.http.get<Pedido[]>("/api/pedidos").subscribe({\n  next: (lista) => this.pedidos.set(lista),\n  error: () => this.erro.set("Não foi possível carregar.")\n});\n// s.unsubscribe() cancela'
          ),
          sl(
            'Operadores: map, switchMap, debounceTime',
            'Operadores transformam fluxos dentro de pipe(). map transforma cada valor (como Array.map). debounceTime(ms) só deixa passar o valor depois de um silêncio (ideal para digitação). switchMap(valor => outroObservavel) troca para um novo fluxo e CANCELA o anterior ainda em andamento: perfeito para busca, pois só a resposta da última digitação importa (evita condição de corrida). Também comuns: filter, distinctUntilChanged, catchError, take.',
            'termo$.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap((t) => this.api.buscar(t)),\n  catchError(() => of([]))\n)'
          ),
          sl(
            'Vazamentos e como evitá-los',
            'Uma assinatura de fluxo que nunca termina (cliques, interval, valueChanges) continua viva depois do componente morrer se você não cancelar: vazamento de memória e callbacks rodando à toa. Soluções, da melhor para a pior: (1) async pipe no template, que assina e cancela sozinho; (2) toSignal; (3) takeUntilDestroyed() do pacote de interoperabilidade (em versões recentes) no pipe; (4) guardar a Subscription e chamar unsubscribe em ngOnDestroy. Observáveis do HttpClient completam sozinhos após a resposta, mas o cuidado vale para fluxos infinitos.',
            'this.cliques$\n  .pipe(takeUntilDestroyed(this.destroyRef))\n  .subscribe(() => this.contar());'
          ),
          sl(
            'async pipe',
            'O async pipe lê um observável direto no template: @if (pedidos$ | async; as pedidos) { ... }. Ele assina ao criar a view, atualiza o template a cada emissão e cancela a assinatura ao destruir. Evita subscribe manual e combina com OnPush. Cuidado: usar | async várias vezes no mesmo observável pode criar várias assinaturas (várias requisições); use @if (...; as x) para assinar uma vez.',
            '@if (pedidos$ | async; as pedidos) {\n  @for (p of pedidos; track p.id) { <li>{{ p.numero }}</li> }\n} @else { <p>Carregando...</p> }'
          ),
          sl(
            'Quando signal vale mais que RxJS',
            'Para ESTADO (valor atual que o template exibe) signals são mais simples: sem subscribe, sem unsubscribe, leitura direta. Para FLUXOS no tempo (debounce, cancelamento de requisição com switchMap, combinação de eventos) RxJS continua a melhor ferramenta. Combine: toSignal para entregar o resultado ao template. Regra: não complique com RxJS o que um signal resolve, e não force signals onde o problema é um fluxo. Segurança: erros de requisição mostram mensagem genérica ao usuário, sem detalhes internos.'
          )
        ]
      },
      questions: [
        mc('q1', 'Um observável do HttpClient é criado, mas ninguém chama subscribe. O que acontece?', 'A requisição não é disparada, pois o observável é preguiçoso', [
          'A requisição é disparada imediatamente ao criar o observável',
          'O Angular assina automaticamente ao fim do ciclo de vida do componente',
          'A requisição é feita, mas a resposta é descartada pelo navegador'
        ], 'Observáveis frios só executam ao assinar. Não há disparo imediato, assinatura automática nem requisição sem assinante.'),
        mc('q2', 'Em uma caixa de busca, por que usar switchMap em vez de mergeMap?', 'switchMap cancela a requisição anterior quando chega um novo termo, evitando respostas fora de ordem', [
          'switchMap envia todas as requisições ao mesmo tempo para ser mais rápido',
          'switchMap impede que o termo seja enviado mais de uma vez ao servidor',
          'switchMap converte o resultado em signal automaticamente'
        ], 'switchMap descarta o fluxo interno anterior ao receber novo valor, evitando condição de corrida. Ele não paraleliza, não deduplica termos (isso é distinctUntilChanged) e não gera signal (isso é toSignal).'),
        mc('q3', 'Qual é a função de debounceTime(300) em um fluxo de digitação?', 'Só deixar passar um valor depois de 300 ms sem novas emissões', [
          'Atrasar todos os valores em exatamente 300 ms, sem descartar nenhum deles',
          'Cancelar a assinatura após 300 ms do primeiro valor recebido',
          'Repetir cada valor a cada 300 ms até o usuário parar'
        ], 'debounceTime descarta valores intermediários e emite o último após o silêncio (mesma ideia do debounce executado na lição fii-04). Não é um atraso fixo de todos, não cancela a assinatura e não repete.'),
        fill('q4', 'Complete com o pipe do Angular que assina um observável no template e cancela a assinatura ao destruir a view.', '@if (pedidos$ | ___; as pedidos) { ... }', ['async'], 'O async pipe assina o observável, atualiza o template a cada emissão e cancela automaticamente ao destruir.'),
        mc('q5', 'Qual fluxo tem mais risco de vazamento se não for cancelado ao destruir o componente?', 'Um fluxo infinito, como cliques ou valueChanges de um formulário', [
          'Uma requisição HttpClient que completa sozinha logo depois de receber a resposta do servidor, liberando os recursos',
          'Um of(1, 2, 3) que emite três valores e termina logo em seguida',
          'Um fluxo que já foi concluído com complete antes de ser assinado'
        ], 'Fluxos infinitos continuam ativos. Os que completam sozinhos liberam os recursos ao terminar.'),
        mc('q6', 'Qual das opções cancela a assinatura de forma automática?', 'Usar takeUntilDestroyed no pipe ou o async pipe no template', [
          'Chamar subscribe duas vezes para que a segunda cancele a primeira',
          'Guardar o resultado do subscribe em uma variável e não usá-la depois',
          'Colocar o subscribe dentro do construtor para ser executado cedo'
        ], 'takeUntilDestroyed e async pipe ligam a assinatura ao ciclo de vida. As outras ações não cancelam nada.'),
        mc('q7', 'Para exibir no template o resultado de uma requisição única, qual abordagem tende a ser a mais simples hoje?', 'Converter com toSignal (ou usar async pipe) e ler o valor, sem subscribe manual', [
          'Assinar manualmente em ngOnInit e deixar de cancelar, mesmo em fluxos infinitos',
          'Usar interval para consultar o servidor a cada milissegundo e atualizar o template com o resultado mais recente',
          'Recarregar a página inteira para obter o novo dado do servidor'
        ], 'toSignal e async pipe resolvem assinatura e limpeza. Assinar sem cancelar vaza em fluxos infinitos, interval agressivo sobrecarrega o servidor e recarregar perde o estado.'),
        fill('q8', 'Complete com o operador que cancela o fluxo interno anterior ao receber um novo valor (ideal para busca).', 'termo$.pipe(___((t) => this.api.buscar(t)))', ['switchMap'], 'switchMap troca para o novo observável interno e cancela o anterior ainda pendente.')
      ]
    },
    {
      id: 'fii-21-angular-http-interceptors-e-guards',
      title: 'Angular: HTTP, interceptors e guards',
      goal: 'Usar HttpClient com interceptors funcionais, guards e resolvers funcionais e tratar erros globalmente, cuidando de tokens.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'HttpClient avançado',
            'HttpClient devolve observáveis tipados: this.http.get<Pedido[]>(url, { params }). Boas práticas: tipar a resposta; montar parâmetros com HttpParams (ou objeto params) em vez de concatenar texto na URL (evita erros de codificação e injeção de parâmetros); encapsular chamadas em serviços; tratar erros com catchError. Em aplicações standalone, habilita-se com provideHttpClient(). (Código ilustrativo, não executado aqui.)',
            'listar(pagina: number) {\n  return this.http.get<Pagina<Pedido>>("/api/pedidos", {\n    params: { pagina, tamanho: 20 }\n  });\n}'
          ),
          sl(
            'Interceptors funcionais',
            'Interceptor é uma função que intercepta TODA requisição e/ou resposta HTTP, ideal para comportamento transversal: cabeçalhos, tratamento de erros, indicador de carregamento. Em versões recentes escreve-se como função (HttpInterceptorFn) e registra-se com provideHttpClient(withInterceptors([...])). Requisições são imutáveis: para alterar use req.clone(). Cuidado: nunca envie credenciais para domínios de terceiros; limite o interceptor às URLs da sua API.',
            'export const apiInterceptor: HttpInterceptorFn = (req, next) => {\n  if (!req.url.startsWith("/api")) return next(req);\n  const clone = req.clone({ withCredentials: true });\n  return next(clone);\n};'
          ),
          sl(
            'Tokens: cookie HttpOnly em vez de localStorage',
            'Um interceptor que lê o token do localStorage e o coloca no cabeçalho Authorization funciona, mas o token fica ao alcance de qualquer script da página (um XSS o rouba). A prática mais segura é o servidor definir um cookie de sessão HttpOnly, Secure e SameSite: o JavaScript não consegue lê-lo, e o navegador o envia sozinho quando a requisição usa withCredentials. Nesse modelo o interceptor só ativa withCredentials e trata o CSRF conforme a orientação do back-end (veja o curso de Segurança Web). Nunca coloque segredos no código do front: o bundle é público.'
          ),
          sl(
            'Guards e resolvers funcionais',
            'Guard decide se uma rota pode ser ativada: função CanActivateFn que devolve true, false ou um UrlTree para redirecionar. Resolver (ResolveFn) busca dados ANTES de a rota ativar. Ambos usam inject() dentro da função. Lembrete essencial: guard esconde telas, mas a AUTORIZAÇÃO real é do servidor; um usuário curioso pode chamar a API diretamente, então o back-end valida permissões em toda requisição.',
            'export const logadoGuard: CanActivateFn = () => {\n  const auth = inject(AuthService);\n  const router = inject(Router);\n  return auth.logado() ? true : router.createUrlTree(["/entrar"]);\n};\n// rota: { path: "painel", canActivate: [logadoGuard], component: Painel }'
          ),
          sl(
            'Tratamento global de erros',
            'Um interceptor com catchError centraliza respostas de erro: 401 (sessão expirada) redireciona para entrar; 403 mostra "sem permissão"; 5xx mostra mensagem genérica. Não exiba ao usuário o texto técnico do erro nem o corpo da resposta; registre um identificador de correlação em vez de dados pessoais. Para erros de renderização existe o ErrorHandler do Angular, que pode ser substituído para enviar relatórios sem dados pessoais. LGPD em visão geral: logs sem dados pessoais; não substitui orientação jurídica.',
            'export const erroInterceptor: HttpInterceptorFn = (req, next) =>\n  next(req).pipe(\n    catchError((e: HttpErrorResponse) => {\n      if (e.status === 401) inject(Router).navigate(["/entrar"]);\n      return throwError(() => new Error("Falha na requisição"));\n    })\n  );'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a melhor forma de enviar o filtro de busca na URL com HttpClient?', 'Usar params do HttpClient, que codifica os valores corretamente', [
          'Concatenar o texto digitado diretamente na URL com o sinal de mais',
          'Colocar o filtro dentro do cabeçalho Cookie de cada requisição',
          'Enviar o filtro como parte do caminho sem qualquer codificação'
        ], 'params montam e codificam a query string com segurança. Concatenar texto cru gera erros e brechas, e cookie e caminho não são o lugar de filtros.'),
        mc('q2', 'Como alterar uma requisição dentro de um interceptor, já que HttpRequest é imutável?', 'Criar uma cópia com req.clone({ ... }) e repassá-la a next', [
          'Alterar as propriedades diretamente em req antes de chamar next',
          'Criar uma requisição nova com new XMLHttpRequest dentro do interceptor',
          'Chamar next duas vezes, uma com cada versão da requisição'
        ], 'Requisições são imutáveis; clone devolve uma nova versão. Mutar direto não é permitido, XMLHttpRequest ignora o pipeline e duplicar next faz duas requisições.'),
        mc('q3', 'Por que é preferível guardar a sessão em cookie HttpOnly em vez do token no localStorage?', 'O JavaScript da página não consegue ler o cookie HttpOnly, então um XSS não o rouba por script', [
          'Porque o localStorage é apagado a cada requisição feita ao servidor',
          'Porque cookies HttpOnly criptografam o conteúdo da requisição inteira',
          'Porque o localStorage não funciona em navegadores modernos, que o substituíram por cookies em qualquer aplicação web atual'
        ], 'HttpOnly impede leitura via JavaScript. O localStorage não é apagado a cada requisição, cookies não criptografam o corpo (isso é HTTPS) e o localStorage funciona.'),
        fill('q4', 'Complete com o tipo de função que protege uma rota decidindo se ela pode ser ativada.', 'export const logadoGuard: ___ = () => inject(AuthService).logado();', ['CanActivateFn'], 'CanActivateFn é o tipo do guard funcional que devolve true, false ou UrlTree para decidir a ativação da rota.'),
        mc('q5', 'O guard esconde a tela de administração para quem não é admin. O que ainda é necessário?', 'Validar a permissão no servidor em toda requisição à API de administração', [
          'Nada: esconder a tela garante que ninguém acesse os dados',
          'Aumentar o tamanho do bundle para ocultar melhor o código da tela',
          'Remover o guard e deixar a tela pública para evitar redirecionamentos'
        ], 'Guard é UX; quem protege os dados é a autorização no servidor. Esconder não impede chamadas diretas à API.'),
        mc('q6', 'Qual deve ser a mensagem mostrada ao usuário em um erro 500?', 'Uma mensagem genérica, sem detalhes internos, com opção de tentar novamente', [
          'O texto completo do erro e o stack trace, para que o usuário possa enviá-lo ao suporte técnico da empresa',
          'O corpo da resposta do servidor, incluindo consultas e caminhos de arquivos',
          'Nenhuma mensagem, deixando a tela vazia sem qualquer feedback'
        ], 'Detalhes internos ajudam atacantes e confundem usuários; registre-os em monitoramento sem dados pessoais. Tela vazia é má UX.'),
        mc('q7', 'Um interceptor anexa credenciais a TODAS as requisições, inclusive para domínios de terceiros. Qual é o risco?', 'Vazar credenciais para terceiros; limite o interceptor às URLs da sua API', [
          'Sem risco algum, pois terceiros ignoram cabeçalhos desconhecidos',
          'O navegador bloqueia automaticamente qualquer cabeçalho em requisições externas',
          'Apenas aumenta o tempo de resposta do servidor, sem implicação de segurança'
        ], 'Credenciais enviadas a outros domínios podem ser registradas ou usadas indevidamente. Filtrar por URL da API é a prática correta.'),
        fill('q8', 'Complete com o método que cria uma cópia modificada de uma requisição imutável dentro do interceptor.', 'const clone = req.___({ withCredentials: true });', ['clone'], 'clone cria uma nova HttpRequest com as alterações indicadas, pois a original é imutável.')
      ]
    },
    {
      id: 'fii-22-angular-formularios-reativos',
      title: 'Angular: formulários reativos',
      goal: 'Construir formulários com FormControl, FormGroup e FormArray, validadores síncronos e assíncronos, estados e typed forms.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'FormControl, FormGroup e FormArray',
            'Nos formulários reativos o modelo é definido no TypeScript, não no template. FormControl representa UM campo (valor + estado de validação). FormGroup agrupa controles nomeados (um formulário ou seção). FormArray agrupa uma LISTA dinâmica de controles ou grupos (vários telefones). Eles emitem observáveis (valueChanges, statusChanges), o que combina com RxJS. Fica mais testável que formulários guiados por template. (Código ilustrativo, não executado aqui.)',
            'form = new FormGroup({\n  email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),\n  telefones: new FormArray([new FormControl("", { nonNullable: true })])\n});'
          ),
          sl(
            'Typed forms',
            'Em versões recentes, formulários são tipados: o TypeScript sabe o tipo de cada valor (form.value.email é string | undefined). nonNullable: true faz o reset voltar ao valor inicial em vez de null. FormBuilder (nonNullable) reduz o texto. Benefício: erros de nome de campo e de tipo aparecem na compilação, não em produção.'
          ),
          sl(
            'Validadores síncronos e assíncronos',
            'Validador síncrono é uma função que recebe o controle e devolve null (válido) ou um objeto de erro ({ minimo: true }). Validators.required, minLength e email vêm prontos. Validador assíncrono devolve um Promise ou Observable e é executado só depois que os síncronos passam; enquanto roda, o status é PENDING. Use debounce no validador assíncrono para não consultar o servidor a cada tecla. Validação do cliente é UX; o servidor valida de novo.',
            'export const semEspacos: ValidatorFn = (c) =>\n  /\\s/.test(c.value ?? "") ? { espacos: true } : null;\n\nconst usuario = new FormControl("", {\n  validators: [Validators.required, semEspacos],\n  asyncValidators: [usuarioDisponivel]\n});'
          ),
          sl(
            'Estados do controle',
            'Cada controle tem estados booleanos úteis: touched (o usuário saiu do campo), dirty (o valor foi alterado), pristine (intacto), valid/invalid, pending (validação assíncrona em andamento) e disabled. Padrão de UX: mostrar o erro só quando invalid E (touched ou dirty). O formulário inteiro tem os mesmos estados; use form.invalid para desabilitar o botão com critério, mas ao enviar chame form.markAllAsTouched() para exibir todos os erros.'
          ),
          sl(
            'Erros acessíveis e privacidade',
            'No template, ligue a mensagem ao campo com aria-describedby, marque aria-invalid e anuncie com role="alert"; mantenha label associado por for/id. Privacidade: colete o mínimo, use autocomplete correto, não logue valores do formulário e não persista senha em lugar nenhum além do envio. No servidor, use hash lento (argon2/bcrypt/scrypt). Exemplos com dados fictícios (usuario@example.com).',
            '<label for="email">E-mail</label>\n<input id="email" formControlName="email"\n  [attr.aria-invalid]="form.controls.email.invalid && form.controls.email.touched"\n  [attr.aria-describedby]="form.controls.email.invalid ? \'email-erro\' : null" />\n@if (form.controls.email.invalid && form.controls.email.touched) {\n  <p id="email-erro" role="alert">Informe um e-mail válido.</p>\n}'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual classe representa uma lista dinâmica de controles, como vários telefones de contato?', 'FormArray', [
          'FormGroup',
          'FormControl',
          'FormBuilder'
        ], 'FormArray agrupa controles em lista. FormGroup agrupa controles nomeados, FormControl é um campo e FormBuilder é uma ajuda para construir formulários.'),
        mc('q2', 'O que um validador síncrono personalizado devolve quando o valor é válido?', 'null', [
          'true',
          'Um objeto vazio',
          'Uma string vazia'
        ], 'Por convenção, null indica ausência de erro; um objeto indica o erro. true, objeto vazio e string não seguem o contrato do ValidatorFn.'),
        mc('q3', 'Qual é o status de um controle enquanto o validador assíncrono ainda está executando?', 'PENDING', [
          'INVALID',
          'VALID',
          'DISABLED'
        ], 'Durante a validação assíncrona o status é PENDING. Só depois vira VALID ou INVALID, e DISABLED é um estado do controle desabilitado.'),
        fill('q4', 'Complete com o método do formulário que faz todos os controles aparecerem como tocados, exibindo os erros ao tentar enviar.', 'if (this.form.invalid) { this.form.___(); return; }', ['markAllAsTouched'], 'markAllAsTouched marca todos os controles como tocados, o que faz as mensagens condicionadas a touched aparecerem.'),
        mc('q5', 'Qual condição é boa para mostrar o erro de um campo no template?', 'O controle está inválido e já foi tocado ou alterado', [
          'O controle está inválido, mesmo que o usuário nem tenha visto o campo ainda',
          'O formulário foi enviado com sucesso ao servidor e ainda está pristine',
          'O controle está desabilitado e nunca recebeu valor'
        ], 'Mostrar o erro após interação evita a tela vermelha prematura. Erros antes de interagir, ou depois de envio bem-sucedido, e em campo desabilitado não ajudam.'),
        mc('q6', 'Qual é o benefício de nonNullable: true em um FormControl?', 'O reset volta ao valor inicial em vez de null, e o tipo não inclui null', [
          'O campo passa a aceitar qualquer tipo de dado sem validação alguma',
          'O valor é criptografado antes de ser enviado ao servidor e deixa de aparecer em valueChanges para outros trechos',
          'O campo deixa de emitir valueChanges para economizar processamento'
        ], 'nonNullable melhora a tipagem e o comportamento do reset. Não remove validação, não criptografa e não desliga valueChanges.'),
        mc('q7', 'O formulário valida o e-mail no Angular. Ainda é necessário validar no servidor?', 'Sim, pois o cliente pode ser contornado e só o servidor protege os dados', [
          'Não, pois o Angular envia ao servidor valores já validados e seguros',
          'Não, pois o validador de e-mail do Angular é equivalente ao do banco de dados',
          'Sim, mas só se o formulário tiver campos assíncronos'
        ], 'Qualquer cliente pode enviar requisições diretamente. A validação do servidor é obrigatória independentemente do tipo de campo.'),
        fill('q8', 'Complete com a classe que agrupa controles nomeados de um formulário.', 'form = new ___({ email: new FormControl("") });', ['FormGroup'], 'FormGroup agrupa controles com nome, formando um formulário ou uma seção dele.')
      ]
    },
    {
      id: 'fii-23-angular-estado-ngrx-e-signal-store',
      title: 'Angular: estado com NgRx e SignalStore',
      goal: 'Saber quando usar NgRx e SignalStore, e entender em conceito o fluxo de ações, reducers, seletores e efeitos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Antes de uma store: a escada de estado',
            'Primeiro tente signals no componente; depois um serviço com signals compartilhado entre componentes (lição de injeção de dependências); só então uma biblioteca de estado. Uma biblioteca vale quando o app é grande, há muitos desenvolvedores e é preciso padronizar, rastrear mudanças ou isolar efeitos colaterais. Por nome: NgRx (inspirado no Redux) e NgRx SignalStore (mais leve, baseado em signals). Dados do servidor também têm caminhos próprios (cache e revalidação), então nem tudo vira estado global. (Conceitual, código ilustrativo.)'
          ),
          sl(
            'NgRx: o fluxo em conceito',
            'O fluxo é unidirecional: o componente despacha uma AÇÃO (objeto descrevendo o que aconteceu, por exemplo "Pedido Adicionado"); um REDUCER (função pura) calcula o próximo estado a partir do atual e da ação; SELETORES leem pedaços do estado (e guardam em cache); EFEITOS tratam operações assíncronas e colaterais (chamar API) e despacham novas ações com o resultado. Vantagens: previsível, testável, e as devtools mostram cada ação com o histórico. Custo: mais arquivos e cerimônia.',
            '// Conceito (ilustrativo)\n// componente  -> dispatch(carregar())\n// effect      -> chama a API -> dispatch(carregouComSucesso({ itens }))\n// reducer     -> (estado, carregouComSucesso) => ({ ...estado, itens })\n// seletor     -> state.itens (para o template)'
          ),
          sl(
            'SignalStore: estado enxuto com signals',
            'O SignalStore define o estado, valores derivados (computed) e métodos em uma só declaração, e expõe tudo como signals. Há menos cerimônia que o NgRx clássico, e funciona bem para estado de uma funcionalidade ou de um componente (provido na rota ou no componente, isolando escopo). Em versões recentes, o NgRx oferece essa API; confira a documentação oficial da versão em uso.',
            'export const PedidosStore = signalStore(\n  { providedIn: "root" },\n  withState({ itens: [] as Pedido[], carregando: false }),\n  withComputed(({ itens }) => ({ total: computed(() => itens().length) })),\n  withMethods((store, api = inject(PedidosApi)) => ({\n    async carregar() {\n      patchState(store, { carregando: true });\n      patchState(store, { itens: await firstValueFrom(api.listar()), carregando: false });\n    }\n  }))\n);'
          ),
          sl(
            'Escolhendo e evitando exageros',
            'Resumo prático: estado local → signal; compartilhado simples → serviço com signals; estado de uma feature com derivados e métodos → SignalStore; app grande com muitos times, necessidade de auditoria de ações e efeitos complexos → NgRx clássico. Erros comuns: colocar tudo na store (inclusive estado de formulário e de UI efêmera); duplicar dados do servidor na store sem estratégia de invalidação; mutar estado diretamente.'
          ),
          sl(
            'Privacidade e segurança no estado',
            'A store é memória do navegador e as devtools mostram o conteúdo, então não coloque tokens, senhas nem dados pessoais desnecessários; mantenha ids e dados de exibição. Se persistir a store (localStorage), filtre campos, nunca persista segredos e limpe no logout. Evite logar ações com payloads pessoais em ferramentas de monitoramento: sanitize antes. LGPD em visão geral: minimização; não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mc('q1', 'Para um estado simples de um único componente, qual é a escolha mais adequada?', 'Um signal no próprio componente', [
          'Uma store NgRx completa com ações, reducers e efeitos',
          'Um serviço singleton com RxJS para qualquer dado de tela',
          'Gravar o estado no localStorage e ler a cada renderização'
        ], 'Estado local cabe em signal. Store completa é exagero, serviço singleton é para estado compartilhado e o localStorage não é para estado transitório de UI.'),
        mc('q2', 'No fluxo do NgRx, qual é o papel de um reducer?', 'Calcular o próximo estado a partir do estado atual e da ação, sem efeitos colaterais', [
          'Chamar a API do servidor e despachar novas ações com o resultado, mantendo o estado como está até a resposta chegar',
          'Guardar o estado no servidor para sincronizar entre navegadores',
          'Ler pedaços do estado e entregá-los ao template do componente'
        ], 'Reducer é função pura de (estado, ação) para estado. Chamar a API é papel do effect e ler pedaços do estado é do seletor.'),
        mc('q3', 'Qual é uma vantagem do SignalStore sobre o NgRx clássico?', 'Menos cerimônia, com estado, derivados e métodos juntos e expostos como signals', [
          'Elimina a necessidade de qualquer biblioteca para qualquer tamanho de app',
          'Garante que o estado seja imutável sem nenhum cuidado do desenvolvedor',
          'Permite ler dados do servidor sem fazer requisições de rede'
        ], 'O SignalStore é mais enxuto e baseado em signals. Ele ainda é uma biblioteca, não torna tudo imutável sozinho e não acessa dados sem rede.'),
        fill('q4', 'Complete com o termo de NgRx que designa o objeto que descreve algo que aconteceu e é despachado pelo componente.', 'O componente despacha uma ___ para o reducer calcular o novo estado.', ['ação', 'acao', 'action'], 'Uma ação descreve o evento ocorrido; o reducer a usa para produzir o próximo estado.'),
        mc('q5', 'Onde devem ficar as chamadas assíncronas à API no fluxo do NgRx clássico?', 'Em efeitos, que despacham novas ações com o resultado', [
          'Dentro do reducer, para ficarem próximas do estado que alteram',
          'Dentro dos seletores, que são executados antes de cada leitura',
          'No template, com chamadas diretas de fetch dentro das expressões'
        ], 'Reducers devem ser puros e seletores só leem; efeitos isolam o colateral. Chamar fetch no template mistura responsabilidades.'),
        mc('q6', 'Qual prática de privacidade se aplica a uma store?', 'Não guardar tokens nem dados pessoais desnecessários e limpar a store no logout', [
          'Guardar o token de sessão na store para que as devtools mostrem o usuário',
          'Persistir toda a store no localStorage para o estado sobreviver ao logout e ao fechamento completo do navegador',
          'Enviar todas as ações com payload completo a serviços de monitoramento'
        ], 'A store fica em memória e é visível em devtools; minimizar e limpar reduz riscos. As outras práticas expõem dados.'),
        mc('q7', 'Qual é um erro comum ao adotar uma biblioteca de estado?', 'Colocar na store até o estado efêmero de UI e de formulários, e duplicar dados do servidor sem invalidação', [
          'Usar seletores para ler apenas o pedaço do estado de que o componente precisa',
          'Tratar o estado como imutável e criar novas referências a cada atualização',
          'Isolar os efeitos colaterais em um lugar separado dos reducers, para que o estado possa ser testado com mais facilidade'
        ], 'Exagerar no uso da store e duplicar cache de servidor sem estratégia causa inconsistência. As demais opções são boas práticas.'),
        fill('q8', 'Complete com a função de NgRx SignalStore usada para atualizar parte do estado dentro de um método.', '___(store, { carregando: true });', ['patchState'], 'patchState aplica uma atualização parcial e imutável ao estado do SignalStore.')
      ]
    },
    {
      id: 'fii-24-angular-performance-defer-e-lazy',
      title: 'Angular: performance com @defer e lazy loading',
      goal: 'Reduzir custo inicial com @defer, lazy loading de rotas, OnPush, track em listas e imagens otimizadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde está o custo',
            'O custo inicial de um app vem de: tamanho do JavaScript baixado e executado, imagens pesadas e trabalho a cada detecção de mudanças. As técnicas abaixo atacam cada um. Como sempre: meça (aba Performance e Lighthouse do navegador, Angular DevTools) antes de otimizar, e confira a documentação oficial da versão em uso. (Código ilustrativo, não executado aqui.)'
          ),
          sl(
            'Lazy loading de rotas',
            'Em vez de carregar todas as telas no início, carregue cada uma quando a rota for acessada: loadComponent: () => import("./pedidos/pedidos").then(m => m.Pedidos) ou loadChildren para um conjunto de rotas. O bundler separa o código em pedaços (chunks) baixados sob demanda. Rotas pouco visitadas (administração, relatórios) são ótimas candidatas. Combine com estratégia de pré-carregamento para baixar em segundo plano o que provavelmente será usado.',
            'export const routes: Routes = [\n  { path: "", component: Inicio },\n  { path: "relatorios", loadComponent: () => import("./relatorios/relatorios").then((m) => m.Relatorios) }\n];'
          ),
          sl(
            '@defer: carregar parte do template sob demanda',
            'O bloco @defer adia o carregamento do código de componentes dentro dele até um gatilho: on viewport (entrou na tela), on interaction (clique), on idle (navegador ocioso), on timer(5s) ou when condicao. Blocos auxiliares: @placeholder (mostrado antes de iniciar), @loading (durante o carregamento) e @error (falha). Ideal para conteúdo abaixo da dobra e componentes pesados (gráficos, comentários). Em versões recentes; confira a documentação.',
            '@defer (on viewport) {\n  <app-grafico [dados]="dados()" />\n} @placeholder {\n  <div class="reserva-altura">Gráfico</div>\n} @loading {\n  <p>Carregando gráfico...</p>\n} @error {\n  <p>Não foi possível carregar o gráfico.</p>\n}'
          ),
          sl(
            'OnPush e track em listas',
            'Revise a lição de componentes avançados: OnPush reduz verificações. Em listas, @for (item of itens; track item.id) exige uma expressão track: é a identidade usada para reaproveitar os nós quando a lista muda (mesma ideia das keys da lição fii-02). Use um id estável; evite track $index em listas que reordenam e evite expressões que criam valores novos. Combine com signals para atualizações pontuais.',
            '@for (p of produtos(); track p.id) {\n  <app-produto [dados]="p" />\n} @empty {\n  <p>Nenhum produto.</p>\n}'
          ),
          sl(
            'Imagens otimizadas (conceito)',
            'Imagens costumam ser o maior peso. Boas práticas: dimensões explícitas (width e height) para evitar saltos de layout, loading="lazy" para imagens abaixo da dobra, formatos modernos e tamanhos responsivos (srcset). O Angular oferece a diretiva NgOptimizedImage (ngSrc), que aplica várias dessas práticas e avisa sobre problemas comuns; para a imagem principal da página (LCP) use a opção de prioridade para carregá-la cedo. Acessibilidade: não esqueça o alt descritivo.',
            '<img ngSrc="/assets/capa.jpg" width="800" height="400" priority alt="Capa da campanha" />\n<img ngSrc="/assets/foto.jpg" width="400" height="300" alt="Equipe reunida" />'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é o objetivo do lazy loading de rotas?', 'Baixar o código de cada tela só quando a rota for acessada, diminuindo o carregamento inicial', [
          'Carregar todas as telas no início para que a navegação fique instantânea',
          'Impedir que o usuário acesse rotas que não estejam na página inicial',
          'Guardar todas as rotas no localStorage para uso off-line permanente, evitando qualquer nova ida ao servidor depois do primeiro acesso'
        ], 'Lazy loading divide o bundle e carrega sob demanda. Carregar tudo no início é o oposto, e as outras opções não descrevem a técnica.'),
        mc('q2', 'No bloco @defer, para que serve @placeholder?', 'Mostrar um conteúdo reservado antes de o carregamento diferido começar', [
          'Mostrar a mensagem exibida só quando ocorre um erro de rede',
          'Definir o gatilho que dispara o carregamento do componente',
          'Executar o código do componente antes de a página ser exibida'
        ], '@placeholder aparece antes do início; @loading mostra o durante e @error a falha. O gatilho é declarado em @defer (on ...). O código só carrega depois do gatilho.'),
        mc('q3', 'Qual gatilho de @defer carrega o conteúdo quando o usuário o aproxima da parte visível da página?', 'on viewport', [
          'on timer sem tempo definido',
          'on idle depois de fechar a aba',
          'on error ao ocorrer uma falha'
        ], 'on viewport dispara quando o elemento entra na área visível. Os demais são gatilhos diferentes ou não existem como descritos.'),
        fill('q4', 'Complete com a expressão obrigatória no @for que define a identidade usada para reaproveitar os nós.', '@for (p of produtos(); ___ p.id) { <app-produto [dados]="p" /> }', ['track'], 'track define a identidade de cada item no @for, como a key de React e Vue.'),
        mc('q5', 'Por que definir width e height em imagens?', 'Para o navegador reservar o espaço e evitar saltos de layout enquanto a imagem carrega', [
          'Para que a imagem seja baixada mais de uma vez e fique em cache duplicado',
          'Para criptografar a imagem antes do envio ao navegador do usuário',
          'Para impedir que o leitor de tela leia o texto alternativo, que passa a ser desnecessário com dimensões fixas definidas'
        ], 'Dimensões explícitas permitem reservar espaço e evitam saltos. Não duplicam cache, não criptografam e o alt continua necessário.'),
        mc('q6', 'Qual é um bom candidato a @defer?', 'Um gráfico pesado que fica abaixo da dobra da página', [
          'O menu de navegação principal visível logo no topo da página',
          'O texto do título da página inicial que o usuário vê primeiro',
          'O botão de login que aparece em toda tela do aplicativo'
        ], 'Diferir faz sentido para conteúdo não essencial no primeiro carregamento. Menu, título e botão de login precisam estar prontos de imediato.'),
        mc('q7', 'Qual prática de medida deve vir antes de otimizar?', 'Medir com Lighthouse, aba Performance e Angular DevTools para achar o gargalo real', [
          'Aplicar @defer, OnPush e lazy loading em tudo, para garantir ganho',
          'Reescrever o aplicativo em outro framework mais leve, já que o Angular não permite nenhuma otimização de carga inicial',
          'Remover todas as imagens do aplicativo para reduzir o peso inicial'
        ], 'Medir identifica o gargalo e orienta a técnica correta. Aplicar tudo e reescrever ou remover conteúdo são exageros.'),
        fill('q8', 'Complete com a diretiva do Angular que otimiza imagens e usa o atributo ngSrc.', '<img ___="/assets/foto.jpg" width="400" height="300" alt="Equipe" />', ['ngSrc'], 'NgOptimizedImage usa ngSrc no lugar de src e aplica boas práticas de carregamento de imagens.')
      ]
    },
    {
      id: 'fii-25-componentes-de-ui-e-design-systems',
      title: 'Componentes de UI e design systems',
      goal: 'Projetar componentes reutilizáveis com boa API, entender headless UI, Storybook, tokens de design e acessibilidade na biblioteca.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Componente reutilizável e sua API',
            'Um componente reutilizável tem uma API pública: entradas (props/inputs), saídas (eventos/outputs) e pontos de composição (children/slots/ng-content). Uma boa API é pequena, previsível e difícil de usar errado. Princípios: nomes claros; valores padrão sensatos; variações por um número limitado de opções (variante: "primario" | "secundario") em vez de dezenas de booleanos; composição em vez de props demais (um Cartao com Cabecalho e Corpo, em vez de 15 props de texto); repassar atributos nativos (aria-label, disabled, onClick) ao elemento real. Nos três frameworks a ideia é a mesma, só muda a sintaxe. (Código ilustrativo, não executado aqui.)',
            '// React (ilustrativo)\nfunction Botao({ variante = "primario", children, ...resto }) {\n  return <button className={`btn btn-${variante}`} {...resto}>{children}</button>;\n}\n// Vue: <Botao variante="secundario">Salvar</Botao> com defineProps + slot\n// Angular: <app-botao variante="secundario">Salvar</app-botao> com input() + ng-content'
          ),
          sl(
            'Headless UI',
            'Componentes headless (sem cabeça) fornecem COMPORTAMENTO e acessibilidade (teclado, foco, ARIA) sem impor estilo: você coloca o seu CSS. Exemplos por nome: Radix UI e React Aria (React), Headless UI (React e Vue), Angular CDK (Angular). Vantagem: acertar menus, diálogos, abas e comboboxes é difícil (setas, Esc, foco preso, anúncios para leitor de tela); a biblioteca resolve e você mantém a identidade visual. Custo: você ainda escreve a aparência.'
          ),
          sl(
            'Tokens de design',
            'Tokens de design são valores nomeados que guardam decisões visuais: cores, espaçamentos, tamanhos de fonte, raios, sombras. Em vez de "#8b5cf6" espalhado por todo o CSS, use cor-primaria. Mudar o tema ou a marca vira trocar tokens em um lugar. Na web usam-se variáveis CSS (custom properties), o que permite temas claro/escuro. Nomeie pelo PAPEL (cor-texto-suave), não pela aparência (cinza-claro), para o significado sobreviver a mudanças.',
            ':root {\n  --cor-primaria: #8b5cf6;\n  --espaco-2: 0.5rem;\n  --raio: 0.5rem;\n}\n@media (prefers-color-scheme: dark) {\n  :root { --cor-fundo: #0f0f14; --cor-texto: #f5f5f7; }\n}\n.btn-primario { background: var(--cor-primaria); border-radius: var(--raio); }'
          ),
          sl(
            'Storybook e documentação viva',
            'Storybook (por nome) é uma ferramenta para desenvolver e documentar componentes isoladamente, fora do app: cada "story" mostra um estado do componente (padrão, desabilitado, erro, carregando). Serve como catálogo vivo para designers e desenvolvedores, base para testes visuais e de acessibilidade (há complementos de verificação de acessibilidade) e documentação do uso. Funciona com React, Vue e Angular. Escreva stories para os estados difíceis de reproduzir no app.'
          ),
          sl(
            'Acessibilidade e segurança na biblioteca',
            'Quem constrói a biblioteca de componentes acerta a acessibilidade UMA vez para todos: foco visível, navegação por teclado, contraste suficiente, papéis ARIA corretos, rótulos obrigatórios (ex.: botão só com ícone exige aria-label), respeito a prefers-reduced-motion. Teste com teclado e leitor de tela, e com ferramentas automáticas (que não substituem teste manual). Segurança: componentes que aceitam HTML (como um campo de texto rico) devem sanitizar a entrada ou evitar HTML cru (dangerouslySetInnerHTML, v-html, [innerHTML]); prefira aceitar texto e compor. Não registre dados pessoais em telemetria de componentes. LGPD em visão geral; não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual característica descreve uma boa API de componente reutilizável?', 'Poucas opções claras, valores padrão sensatos e composição em vez de dezenas de props', [
          'Muitas props booleanas independentes para cobrir todas as combinações visuais, uma para cada variação possível do botão',
          'Nomes curtos e ambíguos para reduzir a quantidade de texto no código',
          'Nenhuma possibilidade de passar atributos nativos ao elemento interno'
        ], 'API pequena, previsível e composicional é mais fácil de usar e evoluir. Muitos booleanos geram combinações inválidas, nomes ambíguos confundem e bloquear atributos nativos prejudica acessibilidade.'),
        mc('q2', 'O que oferece uma biblioteca headless, como Radix UI ou Angular CDK?', 'Comportamento e acessibilidade prontos, sem impor aparência; você aplica seu próprio estilo', [
          'Componentes totalmente estilizados que não aceitam mudanças de aparência',
          'Apenas ícones e fontes, sem nenhum comportamento interativo',
          'Um servidor que renderiza a interface sem precisar do navegador'
        ], 'Headless entrega lógica de interação e ARIA sem estilo. Não é biblioteca de aparência fixa, de ícones ou de servidor.'),
        mc('q3', 'Qual é a vantagem de usar tokens de design?', 'Trocar uma decisão visual em um só lugar e propagar para todo o sistema, inclusive para temas', [
          'Fazer o CSS rodar mais rápido por usar menos linhas de código, já que as variáveis são resolvidas no servidor de aplicação',
          'Eliminar a necessidade de contraste adequado entre texto e fundo',
          'Impedir que designers e desenvolvedores conversem sobre decisões visuais'
        ], 'Tokens centralizam decisões e facilitam temas. Não garantem velocidade, não substituem contraste e não eliminam a colaboração.'),
        fill('q4', 'Complete com o recurso do CSS usado para definir tokens como valores reutilizáveis e consultá-los com var().', ':root { --cor-primaria: #8b5cf6; }\n.btn { background: ___(--cor-primaria); }', ['var'], 'var() lê uma variável CSS (custom property), base prática dos tokens de design na web.'),
        mc('q5', 'Qual nome de token é melhor, segundo a ideia de nomear pelo papel?', 'cor-texto-suave', [
          'cinza-claro-2',
          'azul-do-botao-antigo',
          'cor-de-hoje'
        ], 'O papel ("texto suave") continua válido mesmo se a cor mudar. Nomes ligados à aparência ou a momento ficam desatualizados.'),
        mc('q6', 'Um botão que só contém um ícone de lixeira. O que é necessário para acessibilidade?', 'Um rótulo acessível, como aria-label="Excluir item"', [
          'Nada, pois o ícone é entendido por os usuários de leitor de tela',
          'Uma cor de fundo vermelha para indicar perigo',
          'Um tamanho de ícone maior que o das demais imagens da tela'
        ], 'Sem texto, o leitor de tela não sabe o propósito do botão; aria-label resolve. Cor e tamanho não substituem o rótulo.'),
        mc('q7', 'Qual é o uso mais adequado do Storybook?', 'Desenvolver e documentar componentes isoladamente, com stories para cada estado', [
          'Servir de banco de dados para guardar os dados pessoais dos usuários',
          'Substituir completamente os testes automatizados do aplicativo',
          'Compilar o back-end do aplicativo para produção, gerando os pacotes que o servidor de aplicação vai executar depois'
        ], 'Storybook é um catálogo vivo de componentes. Não é banco de dados, não substitui testes e não compila back-end.'),
        fill('q8', 'Complete com o termo usado para bibliotecas que oferecem comportamento e acessibilidade sem estilo próprio (do inglês, sem cabeça).', 'Radix UI e Angular CDK são exemplos de componentes ___ UI.', ['headless'], 'Headless UI entrega comportamento, foco e ARIA sem estilo imposto, deixando a aparência a cargo de quem usa.')
      ]
    },
    {
      id: 'fii-51-codigo-legado-e-padroes-antigos',
      title: 'Código legado e padrões antigos',
      goal: 'Ler e manter código antigo (class components, Options API, NgModules, RxJS-only), conhecer as formas atuais equivalentes e migrar aos poucos sem reescrever à toa.',
      xp: 20,
      intro: {
        slides: [
          sl('O que é código legado e por que você vai encontrá-lo', 'Código legado é o que já está em produção, funciona e foi escrito segundo convenções anteriores às atuais. Não é sinônimo de "ruim": é código que alguém pagou para construir e que atende pessoas hoje. Em qualquer equipe você vai ler e corrigir mais código antigo do que escrever do zero. Por isso saber LER as formas antigas (e saber o que cada uma vira hoje) é habilidade de trabalho, não curiosidade histórica. Os três frameworks mantêm compatibilidade ampla: formas antigas continuam funcionando por muito tempo, o que torna a coexistência normal. Erro comum: chamar tudo que é antigo de "dívida" e propor reescrita, sem medir dor real nem risco.'),
          sl('React: class components e ciclo de vida', 'Antes dos hooks, componentes com estado eram classes: o estado ficava em this.state, era alterado por this.setState e os efeitos colaterais ficavam em métodos de ciclo de vida. componentDidMount roda uma vez depois da primeira renderização (hoje: useEffect com lista de dependências vazia), componentDidUpdate roda após atualizações (useEffect com dependências) e componentWillUnmount roda na remoção (a função de limpeza retornada pelo useEffect). Classes e funções coexistem na mesma árvore: um componente de função pode renderizar uma classe e vice-versa. Atenção: hooks só funcionam em componentes de função; para usar um hook dentro de código em classe, crie um pequeno componente de função que o chame e passe o resultado por props.', '// ANTES: class component\nclass Relogio extends React.Component {\n  state = { agora: new Date() };\n  componentDidMount() {\n    this.id = setInterval(() => this.setState({ agora: new Date() }), 1000);\n  }\n  componentWillUnmount() {\n    clearInterval(this.id);\n  }\n  render() {\n    return <p>{this.state.agora.toLocaleTimeString()}</p>;\n  }\n}\n\n// HOJE: componente de função com hooks\nfunction Relogio() {\n  const [agora, setAgora] = useState(new Date());\n  useEffect(() => {\n    const id = setInterval(() => setAgora(new Date()), 1000);\n    return () => clearInterval(id); // = componentWillUnmount\n  }, []); // = componentDidMount\n  return <p>{agora.toLocaleTimeString()}</p>;\n}\n/* ilustrativo, não executado aqui */'),
          sl('Vue: Options API e Composition API', 'No Vue, a Options API organiza o componente por TIPO de opção: data() devolve o estado, methods guarda funções, computed os valores derivados, watch os observadores e mounted é o gancho de ciclo de vida. A Composition API com script setup (que você já usou) organiza por ASSUNTO: o estado, os derivados e os efeitos de uma mesma funcionalidade ficam juntos. No Vue 3 as duas formas continuam suportadas e podem conviver no mesmo projeto, até no mesmo componente. Ao ler Options API, lembre que this dá acesso a tudo (dados, métodos, computed) e que data() vira ref ou reactive, computed vira computed(), mounted vira onMounted(). Erro comum: achar que a Options API foi removida e reescrever componentes estáveis por pressa.', '<!-- ANTES: Options API -->\n<script>\nexport default {\n  data() { return { contagem: 0 }; },\n  computed: { dobro() { return this.contagem * 2; } },\n  methods: { somar() { this.contagem++; } },\n  mounted() { console.log(\'montado\'); }\n};\n</script>\n\n<!-- HOJE: Composition API com script setup -->\n<script setup>\nimport { ref, computed, onMounted } from \'vue\';\nconst contagem = ref(0);\nconst dobro = computed(() => contagem.value * 2);\nfunction somar() { contagem.value++; }\nonMounted(() => console.log(\'montado\'));\n</script>\n/* ilustrativo, não executado aqui */'),
          sl('Angular: NgModules, *ngIf/*ngFor e RxJS', 'Código Angular antigo declara componentes dentro de NgModules (decorador @NgModule com declarations, imports e exports); hoje o padrão são componentes standalone, que listam suas próprias dependências em imports. Nos templates, as diretivas estruturais *ngIf e *ngFor deram lugar, em versões recentes, ao bloco @if e @for; o @for exige uma expressão track (a identidade de cada item, como o key do React). A injeção por construtor (constructor(private http: HttpClient)) continua válida, mas a função inject() é a forma atual. Muito código antigo também usa só RxJS: subscribe manual em ngOnInit e unsubscribe em ngOnDestroy; hoje se prefere o pipe async ou converter com toSignal. Confira na documentação oficial da versão em uso o que o seu projeto já suporta.', '<!-- ANTES: NgModule + diretivas estruturais -->\n<li *ngFor="let u of usuarios; trackBy: porId">{{ u.nome }}</li>\n<p *ngIf="vazio">Nenhum usuário.</p>\n\n<!-- HOJE: standalone + controle de fluxo nativo -->\n@for (u of usuarios(); track u.id) {\n  <li>{{ u.nome }}</li>\n} @empty {\n  <p>Nenhum usuário.</p>\n}\n\n// ANTES: construtor + subscribe manual\nconstructor(private http: HttpClient) {}\nngOnInit() { this.sub = this.http.get(\'/api/u\').subscribe(d => this.dados = d); }\nngOnDestroy() { this.sub.unsubscribe(); }\n\n// HOJE: inject() + signal\nprivate http = inject(HttpClient);\nusuarios = toSignal(this.http.get<Usuario[]>(\'/api/u\'), { initialValue: [] });\n/* ilustrativo, não executado aqui */'),
          sl('Migração gradual e coexistência', 'Migrar aos poucos reduz risco. Passos de uma migração segura: (1) escreva testes que descrevam o comportamento atual (testes de caracterização), porque são eles que provam que nada quebrou; (2) migre um componente ou uma tela por vez, começando pelos folhas (os que não têm filhos); (3) deixe o antigo e o novo coexistir: classes e funções no React, Options e script setup no Vue, NgModules e standalone no Angular convivem; (4) use ferramentas oficiais de migração e codemods quando existirem (o Angular, em versões recentes, oferece comandos de migração automática para standalone e para o novo controle de fluxo; veja a documentação da versão em uso); (5) revise o resultado, pois automação erra em casos de borda. Erro comum: uma migração "big bang" em um único pull request enorme, impossível de revisar e de reverter.'),
          sl('O que NÃO reescrever sem necessidade', 'Reescrever tem custo real: tempo, bugs novos e perda de correções sutis que o código antigo acumulou. Só reescreva quando houver dor concreta: uma dependência sem manutenção ou com vulnerabilidade conhecida, impossibilidade de atualizar o framework, lentidão medida ou código que ninguém consegue alterar com segurança. Código estável, testado e raramente mexido pode ficar como está. Há até casos em que a forma antiga continua necessária: no React, um error boundary (limite de erro que captura falhas de renderização dos filhos) ainda se escreve como classe, pois não há hook equivalente; muitas equipes usam uma biblioteca pequena que encapsula isso. Segurança também pesa: código parado costuma ter dependências desatualizadas, então rode a auditoria de dependências do gerenciador de pacotes e priorize atualizar o que tem falha conhecida, mesmo sem reescrever a lógica.', '// Regra prática para decidir (pseudocódigo)\n// reescrever = tem dor medida?  (vulnerabilidade, bloqueio de upgrade, bug recorrente)\n//              E há testes que protegem o comportamento?\n//              E dá para fazer em passos pequenos?\n// Se alguma resposta for não: mantenha, cerque de testes e migre só quando for mexer.\n\n// React: error boundary continua sendo classe\nclass Limite extends React.Component {\n  state = { erro: false };\n  static getDerivedStateFromError() { return { erro: true }; }\n  render() { return this.state.erro ? <p>Algo deu errado.</p> : this.props.children; }\n}\n/* ilustrativo, não executado aqui */')
        ]
      },
      questions: [
        mcq('q1', 'Um componente de classe do React inicia um temporizador em componentDidMount. Qual é o equivalente em um componente de função?', 'b', [
          'Um useState inicializado com uma função que cria o temporizador, pois o estado inicial roda uma única vez.',
          'Um useEffect com lista de dependências vazia, que cria o temporizador e retorna uma função de limpeza.',
          'Um useMemo com lista vazia, porque ele guarda o resultado calculado na primeira renderização.',
          'Uma chamada direta a setInterval no corpo da função, já que o corpo roda só na montagem do componente.'
        ], 'useEffect com dependências vazias roda depois da primeira renderização e a função retornada faz o papel de componentWillUnmount. useState e useMemo existem para guardar valores, não para efeitos colaterais; e o corpo da função roda a cada renderização, o que criaria um temporizador novo a cada vez.'),
        mcq('q2', 'Uma equipe tem uma biblioteca baseada em hooks e precisa usá-la dentro de um componente de classe antigo. O que funciona?', 'a', [
          'Criar um componente de função que chama o hook e entrega o resultado por props ao componente de classe.',
          'Chamar o hook dentro do método render da classe, que aceita hooks desde que respeitem a ordem das chamadas.',
          'Chamar o hook em componentDidMount e guardar o retorno em this.state, que é onde a classe guarda dados.',
          'Converter obrigatoriamente todos os componentes da árvore para função antes de usar qualquer hook.'
        ], 'Hooks só podem ser chamados em componentes de função (ou em outros hooks), então um pequeno componente de função serve de ponte e passa o valor por props. Chamar hook em método de classe é inválido, e não é preciso converter a árvore inteira porque classes e funções convivem.'),
        mcq('q3', 'Você herdou componentes Vue com data(), methods e computed. O que é verdadeiro sobre o Vue 3?', 'c', [
          'A Options API foi removida, então esses componentes só funcionam se forem reescritos antes de atualizar.',
          'Os dois estilos podem coexistir no projeto, mas é proibido misturá-los no mesmo repositório sem um plugin de compatibilidade específico.',
          'A Options API continua suportada e pode conviver com script setup no mesmo projeto, então a migração pode ser gradual.',
          'A Options API continua funcionando, porém perde a reatividade e deixa de reagir a mudanças em data().'
        ], 'No Vue 3 a Options API segue suportada, com reatividade completa, e dá para migrar componente por componente. Não houve remoção, não existe proibição de misturar estilos e a reatividade de data() não é perdida.'),
        fill('q4', 'Complete com a sintaxe atual do Angular para exibir o bloco somente quando houver usuário (substitui o *ngIf).', '___ (usuario()) {\n  <p>Olá, {{ usuario().nome }}</p>\n}', ['@if'], 'O bloco de controle de fluxo nativo em versões recentes é @if (condição) { ... }, que substitui a diretiva estrutural *ngIf sem precisar importar nada no componente.'),
        mcq('q5', 'Ao migrar um *ngFor para o bloco @for do Angular, o que muda na escrita?', 'd', [
          'O @for passa a exigir que o componente seja declarado em um NgModule para reconhecer o bloco.',
          'O trackBy continua sendo a única forma de identificar itens e deve ser declarado como função no componente.',
          'A expressão track é opcional e só vale a pena quando a lista tem mais de mil itens.',
          'O @for exige uma expressão track que identifique cada item, como track u.id.'
        ], 'A nova sintaxe torna track obrigatório, o que evita listas sem identidade estável e é parecido com o key do React. O bloco não depende de NgModule (funciona em standalone), e track não é opcional nem ligado ao tamanho da lista.'),
        mcq('q6', 'Qual estratégia de migração de um sistema grande tem menor risco?', 'c', [
          'Congelar novas funcionalidades por alguns meses e reescrever tudo em um único pull request para trocar no fim.',
          'Construir um sistema novo em paralelo e desligar o antigo em um dia marcado, depois de uma demonstração interna.',
          'Escrever testes de caracterização e migrar uma tela por vez, mantendo antigo e novo em convivência.',
          'Rodar o codemod em uma única passada sobre o repositório e publicar sem revisão, porque a ferramenta é oficial.'
        ], 'Passos pequenos com testes que provam o comportamento permitem revisar, reverter e continuar entregando valor. Os demais formatos concentram o risco num único momento, acumulam divergência com o sistema vivo ou confiam em automação sem revisão, que erra em casos de borda.'),
        mcq('q7', 'Um colega quer converter o ErrorBoundary em classe do React para função com hooks "porque classe é antiga". Qual é a melhor resposta?', 'b', [
          'Converta usando useEffect com try e catch, que captura qualquer erro lançado durante a renderização dos filhos.',
          'Não existe hook equivalente para error boundary; mantenha a classe ou use uma biblioteca que a encapsule.',
          'Converta com useState e um listener global de erros, que cobre falhas de renderização com a mesma garantia.',
          'Remova o limite de erro, pois com hooks a renderização deixou de lançar erros e ele perdeu a utilidade.'
        ], 'Capturar erros de renderização dos filhos depende de métodos de ciclo de vida específicos de classe, sem hook equivalente. useEffect só roda depois da renderização e não intercepta erros dela, e um listener global não substitui o limite; também os erros de renderização continuam existindo.'),
        fill('q8', 'Complete a limpeza do efeito (equivale ao componentWillUnmount do exemplo do relógio).', 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => ___(id);\n}, []);', ['clearInterval'], 'O temporizador criado com setInterval é cancelado por clearInterval(id). Sem essa limpeza ele continuaria rodando depois que o componente saísse da tela.')
      ]
    },
    {
      id: 'fii-26-testes-de-componentes-react',
      title: 'Testes de componentes em React',
      goal: 'Escrever testes de componentes React com Testing Library: consultas por papel, eventos do usuário, API simulada e verificação básica de acessibilidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Testar o que a pessoa vê, não como o código foi escrito',
            'Um teste de componente monta o componente isoladamente, interage com ele como uma pessoa faria e confere o resultado na tela. A Testing Library (pacote para React, com versões para Vue e Angular) nasceu com uma regra: quanto mais seus testes se parecem com o uso real, mais confiança eles dão. Por isso você NÃO testa o valor interno de um useState nem o nome de uma função privada: testa o que aparece (texto, botão habilitado, mensagem de erro) e o que acontece depois de um clique. Quando você refatora a implementação sem mudar o comportamento, os testes continuam passando. Erro comum: testar detalhes internos, o que quebra o teste a cada refatoração sem pegar bug nenhum.'
          ),
          sl(
            'render, screen e consultas por papel',
            'render(<Comp />) monta o componente num DOM de teste; screen aponta para o documento. As consultas têm três famílias: getBy (devolve o elemento ou LANÇA erro se não existir), queryBy (devolve null se não existir, útil para afirmar que algo NÃO está na tela) e findBy (assíncrona: espera o elemento aparecer, útil depois de uma chamada de API). A consulta preferida é getByRole, que busca pelo papel de acessibilidade (button, textbox, heading, link) e pelo nome acessível. Assim você testa o que um leitor de tela também enxerga. Só use getByTestId (atributo data-testid) quando nada melhor existir.',
            '// ilustrativo, não executado aqui\nimport { render, screen } from \'@testing-library/react\';\n\ntest(\'mostra o título e o botão\', () => {\n  render(<Cartao titulo="Plano" />);\n  expect(screen.getByRole(\'heading\', { name: \'Plano\' })).toBeInTheDocument();\n  expect(screen.getByRole(\'button\', { name: /assinar/i })).toBeEnabled();\n  expect(screen.queryByText(\'Erro\')).not.toBeInTheDocument();\n});'
          ),
          sl(
            'Eventos do usuário com user-event',
            'Para simular cliques e digitação use a biblioteca user-event: chame const user = userEvent.setup() e depois await user.click(botao) ou await user.type(campo, \'texto\'). Ela dispara a sequência completa de eventos do navegador (foco, teclas, soltar o mouse), parecida com a de uma pessoa real. fireEvent dispara um único evento isolado e deve ser exceção. Lembre do await: as ações do user-event são assíncronas, e esquecer o await faz a verificação rodar antes de a tela atualizar, gerando testes que falham de forma confusa ou, pior, passam por acaso.',
            '// ilustrativo, não executado aqui\nimport userEvent from \'@testing-library/user-event\';\n\ntest(\'incrementa ao clicar\', async () => {\n  const user = userEvent.setup();\n  render(<Contador />);\n  await user.click(screen.getByRole(\'button\', { name: \'Somar\' }));\n  expect(screen.getByText(\'Total: 1\')).toBeInTheDocument();\n});'
          ),
          sl(
            'Simulando a API nos testes',
            'Testes de componente não devem chamar a API real: ficam lentos, dependem de rede e de dados que mudam. Há duas abordagens. Substituir a função de busca com um mock do executor de testes (jest.fn ou vi.fn) é simples, mas acopla o teste à forma como você chama a API. A abordagem mais fiel é interceptar a requisição de rede com uma biblioteca como MSW (Mock Service Worker): o componente chama fetch normalmente e recebe a resposta que você definiu, inclusive respostas de erro. Em ambos os casos use dados fictícios (usuario@example.com, nomes inventados), nunca dados reais de pessoas. Depois de disparar a busca, use await screen.findByText(...) para esperar o resultado.',
            '// ilustrativo, não executado aqui\nconst resposta = [{ id: 1, nome: \'Ana Teste\' }];\nglobal.fetch = vi.fn().mockResolvedValue({\n  ok: true,\n  json: async () => resposta\n});\n\nrender(<ListaUsuarios />);\nexpect(await screen.findByText(\'Ana Teste\')).toBeInTheDocument();'
          ),
          sl(
            'Acessibilidade nos testes',
            'Consultar por papel e nome já é um teste de acessibilidade indireto: se getByRole(\'button\', { name: \'Salvar\' }) falha, provavelmente um leitor de tela também não encontraria um botão com esse nome. Além disso, existem verificadores automáticos baseados no motor axe (por exemplo o jest-axe) que rodam regras como imagens sem texto alternativo e campos sem rótulo sobre o HTML renderizado. Eles encontram só uma parte dos problemas: não substituem a navegação por teclado e o teste manual com leitor de tela. Use o automático como rede de segurança e o manual para o fluxo completo.'
          ),
          sl(
            'Armadilhas comuns',
            'Testar por classe CSS ou por estrutura do DOM (container.querySelector) quebra com qualquer mudança de estilo. Snapshots gigantes de HTML são aprovados sem leitura e escondem regressões. Dividir o componente em partes e mockar cada filho esvazia o teste: você deixa de testar a integração real. Esquecer await em user-event e findBy causa testes intermitentes. Compartilhar estado entre testes (um mock que não é limpo) faz um teste depender do outro. Regra prática: cada teste monta o que precisa, age como o usuário e afirma algo visível.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um componente de formulário mostra o texto "Salvo!" depois do envio. Qual teste segue melhor a filosofia da Testing Library?', 'c', ['Ler o valor interno do estado enviado dentro do componente e comparar com true', 'Afirmar que a função privada de envio foi chamada exatamente uma vez com o formato interno', 'Clicar no botão Enviar com user-event e afirmar que o texto "Salvo!" aparece na tela', 'Tirar um snapshot do HTML inteiro e aprovar o resultado atual como referência'], 'A filosofia é testar o que o usuário vê e faz. Ler estado interno, conferir funções privadas ou aprovar snapshots amplos acoplam o teste à implementação e quebram em refatorações sem acusar bug real.'),
        mcq('q2', 'Você quer afirmar que uma mensagem de erro NÃO está na tela depois de um envio válido. Qual consulta usar?', 'a', ['queryByText, que devolve null quando o elemento não existe, permitindo afirmar a ausência', 'getByText, porque ele confirma que o texto está ausente sem lançar exceções', 'findByText, que espera indefinidamente até o texto desaparecer da tela', 'getByRole com o nome da mensagem, que retorna lista vazia quando ela não existe'], 'queryBy devolve null se não achar, então combina com not.toBeInTheDocument. getBy lança erro quando não encontra (o teste quebra antes de afirmar). findBy espera o aparecimento, não o desaparecimento, e getByRole também lança erro.'),
        mcq('q3', 'Após clicar em "Carregar", a lista chega de uma API simulada depois de alguns instantes. Como esperar o item aparecer no teste?', 'b', ['screen.getByText(\'Ana Teste\') logo depois do clique, já que o React atualiza de forma síncrona', 'await screen.findByText(\'Ana Teste\'), pois findBy aguarda o elemento surgir', 'Colocar um setTimeout fixo de alguns segundos antes de cada afirmação do teste', 'screen.queryByText(\'Ana Teste\') sem await, pois null indica que ainda está carregando'], 'findBy é feito para aparecimento assíncrono. getBy imediato roda antes da resposta chegar e lança erro; timeouts fixos deixam o teste lento e frágil; queryBy sem await só devolve null naquele instante e não espera nada.'),
        fill('q4', 'Complete a consulta preferida pela Testing Library, que busca pelo papel de acessibilidade e pelo nome acessível.', 'expect(screen.___(\'button\', { name: \'Salvar\' })).toBeEnabled();', ['getByRole'], 'getByRole busca por papel e nome acessível, refletindo o que tecnologias assistivas enxergam; é a consulta preferida antes de texto, rótulo e test id.'),
        mcq('q5', 'Por que user-event é preferido a fireEvent para simular um clique em um botão?', 'd', ['Ele executa mais rápido porque pula a atualização da tela e dos manipuladores do componente', 'Ele dispensa o uso de await, o que simplifica a escrita dos testes assíncronos', 'Ele acessa diretamente o estado interno do componente para forçar o valor desejado', 'Ele reproduz a sequência completa de eventos do navegador, como o uso real'], 'user-event dispara a cadeia completa de eventos, como uma pessoa faria. Ele é assíncrono (exige await), não pula manipuladores e não mexe no estado interno; fireEvent é que dispara um evento isolado.'),
        mcq('q6', 'Qual destes é um bom motivo para usar MSW em vez de substituir fetch por um mock manual?', 'd', ['Ele envia as requisições para a API de produção para garantir que os dados sejam reais', 'Ele elimina a necessidade de escrever qualquer verificação sobre o que aparece na tela', 'Ele é obrigatório no React, pois sem ele o componente não consegue montar nos testes', 'O componente chama fetch normalmente e o teste só define a resposta'], 'MSW intercepta a rede e mantém o código do componente intacto. Ele não chama produção (seria o oposto do isolamento), não substitui afirmações e não é requisito para montar componentes.'),
        mcq('q7', 'Um verificador automático de acessibilidade (axe) passou em todos os testes. O que isso garante?', 'c', ['Que a interface está totalmente acessível e dispensa qualquer revisão manual posterior', 'Que o contraste e a ordem de foco foram validados por pessoas com deficiência visual', 'Que as regras automatizáveis não encontraram falhas, mas o teclado e o leitor de tela ainda pedem teste manual', 'Que o componente atende aos critérios legais de acessibilidade do país'], 'Ferramentas automáticas cobrem só parte dos problemas. Elas não substituem o teste de navegação por teclado e leitor de tela, nem validam conformidade legal ou a experiência de pessoas reais.'),
        fill('q8', 'Complete a chamada que prepara o user-event antes de interagir com os componentes.', 'const user = userEvent.___();\nawait user.click(screen.getByRole(\'button\', { name: \'Somar\' }));', ['setup'], 'userEvent.setup() cria a instância que será usada para clicar, digitar e navegar com o teclado; as ações dela devolvem promessas e por isso levam await.')
      ]
    },
    {
      id: 'fii-27-testes-de-componentes-vue',
      title: 'Testes de componentes em Vue',
      goal: 'Testar componentes Vue 3 com Vue Test Utils: montagem, props e eventos, Pinia em testes e mocks de dependências.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que muda e o que continua igual',
            'A filosofia é a mesma da lição anterior: testar comportamento visível, não detalhes internos. Em Vue 3 a ferramenta oficial é o Vue Test Utils (VTU), normalmente usado com o executor Vitest. Existe também a Testing Library para Vue, com as mesmas consultas por papel que você viu em React. Esta lição foca no VTU porque ele conhece conceitos próprios do Vue: props, eventos emitidos, slots e a store Pinia. O ciclo é o mesmo: montar o componente, agir como o usuário e afirmar o que aparece.'
          ),
          sl(
            'Montagem com mount e props',
            'mount(Componente, { props: { ... } }) monta o componente de verdade, com os filhos reais, e devolve um wrapper com métodos para consultar o resultado: wrapper.text(), wrapper.find(seletor), wrapper.findComponent. shallowMount troca os filhos por stubs (cópias vazias) e é útil quando um filho é pesado, mas esvazia a integração: use mount como padrão. Para uma lista de props passe a chave props; para slots, a chave slots. Erro comum: mexer em wrapper.vm (a instância interna) para ler variáveis privadas, o que acopla o teste à implementação.',
            '// ilustrativo, não executado aqui\nimport { mount } from \'@vue/test-utils\';\nimport CartaoPlano from \'./CartaoPlano.vue\';\n\ntest(\'mostra o título recebido por prop\', () => {\n  const wrapper = mount(CartaoPlano, { props: { titulo: \'Plano Básico\' } });\n  expect(wrapper.text()).toContain(\'Plano Básico\');\n});'
          ),
          sl(
            'Interações, eventos emitidos e atualização do DOM',
            'Para simular o usuário use await wrapper.find(\'button\').trigger(\'click\') ou await wrapper.find(\'input\').setValue(\'texto\'). Esses métodos devolvem uma promessa que resolve depois de o Vue atualizar o DOM; sem o await, a afirmação seguinte pode ler a tela antiga. Para conferir o que o componente avisa ao pai use wrapper.emitted(): um objeto com um array por evento, em que cada item é a lista de argumentos. Exemplo: se o componente faz emit(\'salvar\', dados), então wrapper.emitted(\'salvar\')[0] é [dados]. Testar o evento emitido é o equivalente Vue de testar a callback recebida por prop em React.',
            '// ilustrativo, não executado aqui\ntest(\'emite salvar com o nome digitado\', async () => {\n  const wrapper = mount(FormNome);\n  await wrapper.find(\'input\').setValue(\'Ana Teste\');\n  await wrapper.find(\'form\').trigger(\'submit\');\n  expect(wrapper.emitted(\'salvar\')[0]).toEqual([\'Ana Teste\']);\n});'
          ),
          sl(
            'Pinia em testes',
            'Componentes que leem uma store Pinia precisam de uma instância ativa. Duas opções: criar uma store real com setActivePinia(createPinia()) antes de cada teste (ótimo para testar a store em si) ou usar createTestingPinia, do pacote @pinia/testing, que cria as stores com as ACTIONS substituídas por espiões (spies) e permite definir o estado inicial com initialState. Com isso você confere se o clique chamou a action certa sem executar a lógica real. Passe a instância em global.plugins ao montar. Estado fictício e sem dados pessoais reais vale também aqui.',
            '// ilustrativo, não executado aqui\nimport { createTestingPinia } from \'@pinia/testing\';\n\nconst wrapper = mount(Carrinho, {\n  global: {\n    plugins: [createTestingPinia({ initialState: { carrinho: { itens: [] } } })]\n  }\n});\nawait wrapper.find(\'button\').trigger(\'click\');\nexpect(useCarrinhoStore().limpar).toHaveBeenCalled();'
          ),
          sl(
            'Mocks: API, rotas e stubs',
            'Para a API use a mesma ideia do React: simule a rede com MSW ou substitua o módulo de serviço com vi.mock(\'./api\'). Para componentes que usam o Vue Router, forneça um router de teste (createRouter com createMemoryHistory) em global.plugins ou simule $route com global.mocks. Para filhos que você quer ignorar, global.stubs troca um componente por um espaço reservado. Dica de assincronia: depois de uma chamada que resolve uma promessa, use await flushPromises() (pacote do VTU) para esperar a fila terminar antes de afirmar.'
          ),
          sl(
            'Armadilhas e boas práticas',
            'Evite: ler wrapper.vm.variavelInterna (detalhe de implementação), esquecer await em trigger/setValue, usar shallowMount por hábito e acabar sem testar a integração, e compartilhar uma Pinia entre testes (crie uma nova a cada teste). Prefira: consultar pelo texto visível e por atributos acessíveis (papel, rótulo), nomear os testes pelo comportamento ("mostra erro quando o nome está vazio") e manter um teste por comportamento. Acessibilidade: você pode usar os mesmos verificadores axe sobre o HTML montado.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em Vue Test Utils, qual é a diferença prática entre mount e shallowMount?', 'b', ['mount renderiza só o componente raiz e shallowMount renderiza a árvore completa dos filhos', 'mount usa os filhos reais; shallowMount os troca por stubs', 'mount exige um navegador real aberto e shallowMount funciona em ambiente de teste', 'mount ignora props e slots, enquanto shallowMount aceita as opções de configuração'], 'shallowMount substitui os filhos por stubs; mount usa os filhos reais. Os dois rodam no ambiente de teste e aceitam props e slots; a descrição invertida do raiz e da árvore completa está errada.'),
        mcq('q2', 'Por que escrever await antes de wrapper.find(\'button\').trigger(\'click\')?', 'a', ['Porque trigger devolve uma promessa que resolve depois de o Vue atualizar o DOM, e a afirmação precisa ler a tela nova', 'Porque sem o await o navegador bloqueia a página e o teste não termina de executar', 'Porque o await faz o clique ser repetido até o componente responder com sucesso', 'Porque trigger só funciona com promessas quando o componente usa a Options API do Vue'], 'A atualização do DOM no Vue é agendada; await espera esse ciclo. Não há bloqueio de página nem repetição de cliques, e o comportamento vale na Composition API e na Options API.'),
        mcq('q3', 'Um componente emite emit(\'salvar\', dados) ao enviar o formulário. Como conferir isso no teste?', 'a', ['Com wrapper.emitted(\'salvar\'), que lista as chamadas e seus argumentos', 'Lendo wrapper.vm.salvar para ver se a função privada existe na instância interna', 'Procurando no HTML renderizado uma tag com o nome do evento emitido', 'Substituindo o componente por um stub e verificando se o stub foi desenhado na tela'], 'wrapper.emitted() é a API do VTU para eventos. Ler a instância interna acopla ao detalhe, o HTML não contém eventos emitidos e um stub apenas substitui o componente, sem observar nada.'),
        fill('q4', 'Complete a opção de mount que passa os valores recebidos pelo componente.', 'const wrapper = mount(CartaoPlano, { ___: { titulo: \'Plano Básico\' } });', ['props'], 'A chave props do segundo argumento de mount define as props do componente montado; slots e global são outras chaves do mesmo objeto.'),
        mcq('q5', 'Qual vantagem tem createTestingPinia em relação a uma Pinia real?', 'c', ['Ela envia o estado para um servidor de testes na nuvem, onde fica guardado entre execuções', 'Ela impede que o componente leia o estado e obriga a testar só a store separadamente', 'As actions viram espiões e o estado inicial é fácil de definir', 'Ela troca o Vue por uma implementação mais rápida, sem a camada de reatividade'], 'createTestingPinia espiona as actions e aceita initialState. Não usa nuvem, o componente continua lendo o estado e a reatividade do Vue permanece.'),
        mcq('q6', 'Um componente chama uma função de um módulo de serviço que faz a requisição. Qual forma é adequada para isolá-lo?', 'b', ['Apontar o serviço para a API de produção e usar a conta de um usuário real para testar', 'Usar vi.mock (ou MSW) e retornar dados fictícios', 'Remover a chamada de API do componente para que ele passe nos testes sem dados', 'Ler o resultado direto de wrapper.vm.dados sem esperar a promessa terminar'], 'Mocks de módulo ou de rede isolam sem tocar sistemas reais e com dados fictícios. Produção e dados reais violam isolamento e privacidade, e remover a chamada altera o que se quer testar.'),
        mcq('q7', 'Qual destas práticas costuma deixar os testes de componentes Vue frágeis?', 'd', ['Nomear os testes pelo comportamento que o usuário observa na interface', 'Criar uma instância nova de Pinia para cada teste executado', 'Consultar o texto visível e atributos acessíveis do elemento', 'Ler variáveis privadas via wrapper.vm e conferir a estrutura interna do componente'], 'Testar via wrapper.vm acopla o teste à implementação. Nomear por comportamento, isolar a Pinia e consultar texto e atributos acessíveis são práticas que aumentam a robustez.'),
        fill('q8', 'Complete o método do VTU que digita um valor em um campo de texto.', 'await wrapper.find(\'input\').___(\'Ana Teste\');', ['setValue'], 'setValue define o valor do campo e dispara o evento de entrada correspondente; devolve uma promessa, por isso o await.')
      ]
    },
    {
      id: 'fii-28-testes-de-componentes-angular',
      title: 'Testes de componentes em Angular',
      goal: 'Testar componentes Angular standalone com TestBed, harnesses, HttpClient simulado e signals.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O ambiente de teste do Angular',
            'O Angular traz um ambiente de teste próprio. O coração dele é o TestBed: uma classe que monta um "mini módulo" de teste, cria o componente e dá acesso a um fixture (ComponentFixture) com o componente, o elemento DOM (fixture.nativeElement) e o controle da detecção de mudanças (fixture.detectChanges()). Os executores mais usados são Jasmine/Karma ou Jest/Vitest, e as ferramentas de linha de comando do projeto configuram um deles. A ideia de testar comportamento visível continua valendo; a Testing Library também existe para Angular com as consultas por papel que você já conhece.'
          ),
          sl(
            'TestBed com componentes standalone',
            'Em versões recentes, componentes são standalone: declaram suas próprias dependências em imports. No teste, em vez de declarar o componente num módulo, você o coloca em imports: TestBed.configureTestingModule({ imports: [CartaoComponent] }). Depois use TestBed.createComponent(CartaoComponent) para obter o fixture e chame fixture.detectChanges() para renderizar. A detecção de mudanças NÃO roda sozinha por padrão no teste: sem detectChanges o template fica vazio, um erro muito comum de quem começa. Para dependências, use providers: [{ provide: ServicoX, useValue: falso }].',
            '// ilustrativo, não executado aqui\nimport { TestBed } from \'@angular/core/testing\';\n\nit(\'mostra o título\', () => {\n  TestBed.configureTestingModule({ imports: [CartaoComponent] });\n  const fixture = TestBed.createComponent(CartaoComponent);\n  fixture.componentRef.setInput(\'titulo\', \'Plano Básico\');\n  fixture.detectChanges();\n  expect(fixture.nativeElement.textContent).toContain(\'Plano Básico\');\n});'
          ),
          sl(
            'Inputs, signals e a nova detecção',
            'Inputs de componente (inclusive os criados com a função input(), baseada em signals) devem ser definidos no teste com fixture.componentRef.setInput(\'nome\', valor): atribuir direto à propriedade não funciona com inputs de signal. Lembrete: um signal é lido chamando-o como função, contador(), e atualizado com set ou update. Em testes, depois de alterar um signal ou input, chame fixture.detectChanges() (ou await fixture.whenStable()) antes de olhar o DOM. Efeitos (effect) são executados durante a detecção de mudanças, então o mesmo cuidado vale para testar efeitos. Ao mudar o estado, afirme sobre o DOM, não só sobre o valor do signal.'
          ),
          sl(
            'Harnesses: testar sem depender do HTML interno',
            'Um harness (ComponentHarness) é uma classe de teste que representa um componente e expõe uma API de alto nível: em vez de procurar o botão por seletor CSS, você escreve botao.click() ou campo.setValue(\'x\'). A biblioteca Angular Material publica harnesses prontos (por exemplo para botão, caixa de seleção, diálogo) e você pode criar harnesses para seus próprios componentes. Eles escondem a estrutura do DOM: se o HTML interno muda, só o harness é atualizado e não todos os testes. Obtenha o carregador com TestbedHarnessEnvironment.loader(fixture) e peça o harness com loader.getHarness(MeuHarness).',
            '// ilustrativo, não executado aqui\nconst loader = TestbedHarnessEnvironment.loader(fixture);\nconst botao = await loader.getHarness(MatButtonHarness.with({ text: \'Salvar\' }));\nawait botao.click();'
          ),
          sl(
            'Simulando HttpClient',
            'Componentes e serviços usam HttpClient. No teste, não faça chamadas reais: forneça provideHttpClient() e provideHttpClientTesting() e injete o HttpTestingController. Com ele você captura a requisição (httpMock.expectOne(\'/api/usuarios\')), confere método e parâmetros e responde com req.flush(dadosFicticios) ou com um erro, e no fim chama httpMock.verify() para garantir que nenhuma requisição ficou sem resposta ou inesperada. Os dados devem ser fictícios, como { nome: \'Ana Teste\' }.',
            '// ilustrativo, não executado aqui\nTestBed.configureTestingModule({\n  providers: [provideHttpClient(), provideHttpClientTesting()]\n});\nconst http = TestBed.inject(HttpTestingController);\n\nservico.listar().subscribe();\nconst req = http.expectOne(\'/api/usuarios\');\nexpect(req.request.method).toBe(\'GET\');\nreq.flush([{ nome: \'Ana Teste\' }]);\nhttp.verify();'
          ),
          sl(
            'Erros comuns e boas práticas',
            'Esquecer fixture.detectChanges() deixa o DOM sem atualização. Atribuir input de signal direto à propriedade em vez de usar setInput gera erro. Usar seletores CSS frágeis em vez de harnesses ou consultas acessíveis acopla ao HTML. Esquecer httpMock.verify() esconde requisições extras. Importar o módulo inteiro de uma biblioteca "para o teste passar" mascara dependências que o componente deveria declarar. Boas práticas: um comportamento por teste, nomes descritivos, serviços falsos simples com useValue e verificação de acessibilidade básica (papéis e rótulos) também nos testes Angular.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Ao testar um componente standalone no Angular, onde ele deve ser colocado na configuração do TestBed?', 'd', ['Em declarations, porque o TestBed só aceita componentes declarados em módulo', 'Em providers, junto dos serviços que o componente injeta', 'Em exports, para que o fixture consiga enxergar o template renderizado', 'Em imports, pois um componente standalone não é declarado'], 'Componentes standalone entram em imports. declarations é para o modelo antigo com NgModules, providers é para serviços e exports não faz parte desse fluxo de teste.'),
        mcq('q2', 'O template do componente aparece vazio no teste, embora o componente esteja correto. Qual é a causa mais provável?', 'c', ['O TestBed desliga o HTML dos componentes quando roda em um executor de testes', 'O componente precisa ser compilado manualmente pelo navegador antes de cada teste', 'Faltou chamar fixture.detectChanges(), que renderiza o template no ambiente de teste', 'O Angular só renderiza o template depois de o teste terminar sua execução'], 'No teste a detecção de mudanças é manual por padrão; sem detectChanges o template não é atualizado. O HTML não é desligado, não há compilação manual e a renderização não aguarda o fim do teste.'),
        mcq('q3', 'Como definir um input criado com a função input() (signal) dentro de um teste?', 'a', ['Com fixture.componentRef.setInput(\'titulo\', valor), seguido de detectChanges', 'Atribuindo diretamente fixture.componentInstance.titulo = valor, como em qualquer propriedade', 'Chamando titulo.set(valor) no componente, igual a um signal gravável comum', 'Colocando o valor no atributo HTML do elemento raiz e relendo o texto'], 'Inputs de signal são somente leitura dentro do componente e devem ser definidos via setInput. Atribuição direta falha, set não existe em input() e o atributo HTML no elemento raiz não alimenta o input.'),
        fill('q4', 'Complete o método do HttpTestingController que garante que nenhuma requisição ficou pendente ou inesperada.', 'http.expectOne(\'/api/usuarios\').flush([]);\nhttp.___();', ['verify'], 'verify() falha o teste se restar requisição não esperada, o que evita que chamadas extras passem despercebidas.'),
        mcq('q5', 'Qual é a principal vantagem de usar harnesses em vez de seletores CSS nos testes?', 'b', ['Eles dispensam a detecção de mudanças e o ambiente do TestBed por completo', 'Eles dão uma API de alto nível e isolam mudanças no HTML interno', 'Eles rodam em um navegador real e por isso são mais rápidos que os testes de unidade', 'Eles geram automaticamente os dados de teste e as respostas de API'], 'O harness encapsula a estrutura do DOM. Ele ainda usa o TestBed, não é mais rápido por rodar em navegador e não cria dados nem respostas de API.'),
        mcq('q6', 'Para simular a resposta de uma API em um serviço que usa HttpClient, qual abordagem é correta?', 'd', ['Chamar a API real de homologação com o usuário de um colega para ver o resultado', 'Substituir o HttpClient por um objeto vazio e não esperar nenhuma resposta nos testes', 'Usar setTimeout dentro do teste até a resposta da rede chegar de verdade', 'HttpTestingController com flush e dados fictícios'], 'O controlador de teste intercepta e responde de forma determinística. APIs reais e dados de terceiros quebram isolamento e privacidade; um objeto vazio não testa o fluxo; timeouts tornam o teste lento e instável.'),
        mcq('q7', 'Depois de mudar um signal que alimenta o template, o teste afirma sobre o DOM e vê o valor antigo. O que fazer?', 'a', ['Chamar fixture.detectChanges() (ou aguardar whenStable) antes de olhar o DOM', 'Trocar o signal por uma variável comum, que se atualiza sozinha no teste', 'Reiniciar o navegador de testes entre a alteração e a afirmação', 'Ler o valor pelo signal, sem verificar o DOM, porque o DOM é detalhe'], 'A atualização do template depende da detecção de mudanças, manual no teste. Variáveis comuns não resolvem, reiniciar o navegador é desnecessário e ignorar o DOM deixa de testar o que o usuário vê.'),
        fill('q8', 'Complete a leitura de um signal chamado contador dentro do código do componente.', 'const valor = contador___;', ['()'], 'Um signal é uma função: contador() devolve o valor atual e registra a dependência quando lido em contexto reativo.')
      ]
    },
    {
      id: 'fii-29-testes-end-to-end',
      title: 'Testes end-to-end',
      goal: 'Entender testes E2E com Playwright e Cypress, seletores resilientes, dados de teste fictícios, causas de flakiness e o que cobrir.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um teste end-to-end',
            'Um teste end-to-end (E2E) abre um navegador de verdade, navega pela aplicação inteira (front-end, API e banco de teste) e age como uma pessoa: entra na página, preenche formulário, clica e confere o resultado. Ele valida a integração que os testes de componente não alcançam: rotas, autenticação, requisições reais, cookies. O custo: é mais lento, mais caro de manter e mais sujeito a instabilidade. Por isso o desenho clássico é uma pirâmide: muitos testes de unidade e componente, alguns de integração e poucos E2E nos caminhos críticos.'
          ),
          sl(
            'Ferramentas por nome: Playwright e Cypress',
            'Duas ferramentas muito usadas: Playwright (roda Chromium, Firefox e WebKit, com API assíncrona, vários contextos de navegador isolados e geração de relatórios e traces) e Cypress (roda dentro do navegador, com painel interativo de depuração). Ambas esperam automaticamente os elementos ficarem prontos antes de agir (auto-wait) e permitem interceptar a rede. Confira a documentação oficial da versão em uso. Os conceitos desta lição valem para as duas, e também para ferramentas semelhantes.'
          ),
          sl(
            'Seletores resilientes',
            'O seletor é como o teste encontra o elemento. Seletores frágeis (classes CSS geradas, caminho de divs, texto que muda de idioma) quebram a cada ajuste visual. Os resilientes seguem a ordem de preferência: papel e nome acessível (page.getByRole(\'button\', { name: \'Entrar\' })), rótulo do campo (getByLabel), e por último um atributo de teste estável como data-testid. Escolher por papel traz o bônus de exercitar a acessibilidade. Erro comum: usar nth-child ou classes de utilitários (como as de Tailwind) como seletor.',
            '// ilustrativo, não executado aqui (Playwright)\nimport { test, expect } from \'@playwright/test\';\n\ntest(\'login com usuário de teste\', async ({ page }) => {\n  await page.goto(\'/entrar\');\n  await page.getByLabel(\'E-mail\').fill(\'usuario@example.com\');\n  await page.getByLabel(\'Senha\').fill(process.env.SENHA_E2E);\n  await page.getByRole(\'button\', { name: \'Entrar\' }).click();\n  await expect(page.getByRole(\'heading\', { name: \'Painel\' })).toBeVisible();\n});'
          ),
          sl(
            'Dados de teste fictícios e seguros',
            'E2E precisa de contas e registros de teste. Regras: use dados FICTÍCIOS (usuario@example.com, nomes inventados, CPF claramente fictício) e nunca dados reais de clientes copiados de produção; isso é também uma questão de LGPD (a lei não substitui orientação jurídica). Credenciais do usuário de teste vêm de variáveis de ambiente ou do cofre de segredos do CI, nunca escritas no código nem no repositório. Rode contra um ambiente de teste isolado, não contra produção. Cada teste deve criar ou preparar o estado de que precisa e não depender da ordem de execução.'
          ),
          sl(
            'Flakiness: testes que falham às vezes',
            'Um teste é flaky (instável) quando ora passa, ora falha sem mudança no código. Causas comuns: esperas fixas (sleep) que são curtas demais na máquina lenta; dependência de ordem entre testes; dados compartilhados; animações; rede externa; relógio e aleatoriedade. A solução geral é esperar por uma CONDIÇÃO, não por um tempo: o auto-wait das ferramentas e expect com repetição (retry) já fazem isso. O código abaixo mostra a ideia com JavaScript puro: um waitFor consulta uma condição várias vezes até um limite.',
            'const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nasync function waitFor(cond, { tentativas = 20, intervalo = 10 } = {}) {\n  for (let i = 1; i <= tentativas; i++) {\n    if (cond()) return i;\n    await sleep(intervalo);\n  }\n  throw new Error(\'condição não ficou verdadeira a tempo\');\n}\nlet pronto = false;\nsetTimeout(() => { pronto = true; }, 55); // a tela "carrega" em ~55 ms\nwaitFor(() => pronto).then(() => {\n  console.log(\'esperou até a condição ficar verdadeira (sem sleep fixo)\');\n  console.log(\'condição verdadeira:\', pronto);\n});\n\n// saída real (Node):\n// esperou até a condição ficar verdadeira (sem sleep fixo)\n// condição verdadeira: true'
          ),
          sl(
            'O que cobrir em E2E',
            'Cubra os fluxos críticos para o negócio, os que, se quebrarem, custam caro: cadastro e login, a compra ou a ação principal do produto, uma ou duas jornadas completas. Evite cobrir cada variação de validação de formulário, cada estado de erro ou cada combinação de filtros em E2E: isso fica mais barato e rápido em testes de componente. Mantenha a suíte pequena, rápida, executada no pipeline de CI, e trate teste flaky como defeito: corrija ou remova, nunca apenas reexecute até passar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel de um teste E2E que testes de componente não cumprem bem?', 'b', ['Medir a cobertura de linhas de cada função isolada com rapidez e baixo custo', 'Validar a integração real de rotas, API e cookies no navegador', 'Substituir a necessidade de qualquer outro tipo de teste na aplicação', 'Testar cada variação de validação de campo com milhares de combinações'], 'E2E exercita o sistema integrado. Cobertura por função e muitas variações são mais baratas em testes menores, e E2E não substitui os demais níveis da pirâmide.'),
        mcq('q2', 'Qual seletor é o mais resiliente para localizar o botão "Entrar" num teste E2E?', 'c', ['O caminho de divs até o botão, como div > div:nth-child(3) > button', 'A classe gerada pela biblioteca de estilos, como .css-1x8k2z', 'getByRole(\'button\', { name: \'Entrar\' }), pelo papel e nome acessível', 'O texto exato em inglês copiado de uma versão antiga da interface'], 'Papel e nome acessível sobrevivem a mudanças de estrutura e estilo. Caminhos de divs e classes geradas quebram em ajustes visuais, e texto copiado de uma versão antiga pode simplesmente não existir mais.'),
        mcq('q3', 'Um teste usa sleep de 2 segundos antes de clicar e falha às vezes no pipeline. Qual correção ataca a causa?', 'a', ['Trocar a espera fixa por espera de condição (auto-wait)', 'Aumentar o sleep para 10 segundos nos testes da suíte inteira', 'Reexecutar o teste automaticamente até ele passar e ignorar as falhas anteriores', 'Desativar o teste no pipeline e mantê-lo na máquina de quem escreveu'], 'O problema é esperar tempo em vez de condição. Aumentar o sleep deixa a suíte lenta e ainda frágil, reexecutar mascara a instabilidade e desativar remove a cobertura.'),
        fill('q4', 'Complete a ordem de espera correta: o teste deve esperar por uma ___ (algo que se torna verdadeiro), não por um tempo fixo.', 'await waitFor(() => botao.habilitado === true); // espera por uma ___', ['condição', 'condicao'], 'Esperar por condição termina assim que a tela está pronta e tolera máquinas lentas, ao contrário de um sleep fixo.'),
        mcq('q5', 'Onde devem ficar a senha e o e-mail da conta usada nos testes E2E de login?', 'd', ['Escritos no arquivo de teste e versionados no repositório para facilitar o acesso da equipe', 'Copiados de uma conta real de cliente de produção para o teste ser realista', 'Fixos no código-fonte do front-end, já que o bundle é usado em teste', 'Em variáveis de ambiente ou no cofre do CI, nunca no repositório'], 'Credenciais em variáveis de ambiente ou cofre, com conta fictícia, evitam vazamento e respeitam a privacidade. Versionar segredos, usar dados reais de clientes ou colocá-los no bundle expõe informação.'),
        mcq('q6', 'Qual conjunto de cenários é o mais indicado para uma suíte E2E enxuta?', 'b', ['Cada mensagem de erro de cada campo dos formulários da aplicação', 'Login, a ação principal do produto e uma jornada completa dos caminhos críticos', 'As combinações possíveis de filtros e ordenações das telas', 'A página inicial carregando, sem interação do usuário'], 'E2E deve proteger fluxos críticos. Variações de validação e combinações de filtros são mais baratas em testes de componente, e só carregar a página inicial deixa os fluxos importantes descobertos.'),
        mcq('q7', 'Dois testes E2E compartilham o mesmo registro e um só passa se o outro rodar antes. Qual é o problema?', 'c', ['É um comportamento esperado das ferramentas E2E, que executam na ordem do arquivo', 'É um problema do navegador, que corrige o cache de forma diferente a cada rodada', 'Há dependência de ordem e de dados; cada teste deve preparar o próprio estado', 'É um problema que desaparece sozinho quando se aumenta o tempo limite de cada teste'], 'Testes devem ser independentes; dados e ordem compartilhados geram instabilidade. Aumentar o tempo limite não remove a dependência, e culpar o navegador desvia da causa real.'),
        fill('q8', 'Complete a ferramenta E2E que roda Chromium, Firefox e WebKit com API assíncrona e traces (mencionada na lição).', '// ferramenta E2E multinavegador da Microsoft: ___', ['Playwright'], 'Playwright é a ferramenta citada que cobre Chromium, Firefox e WebKit; Cypress é a outra, executada dentro do navegador.')
      ]
    },
    {
      id: 'fii-30-ssr-ssg-isr-e-hidratacao',
      title: 'SSR, SSG, ISR e hidratação',
      goal: 'Distinguir CSR, SSR, SSG e ISR, entender hidratação e seus mismatches, o efeito em SEO e escolher a estratégia por página.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde o HTML é gerado',
            'Toda página web acaba como HTML no navegador; a diferença é ONDE e QUANDO esse HTML é gerado. CSR (Client-Side Rendering): o servidor entrega um HTML quase vazio e um bundle de JavaScript; o navegador monta a interface. SSR (Server-Side Rendering): o servidor gera o HTML completo a cada requisição e o envia pronto. SSG (Static Site Generation): o HTML é gerado uma vez, na hora do build, e servido como arquivo estático. ISR (Incremental Static Regeneration): páginas estáticas que são regeneradas em segundo plano depois de um intervalo ou sob demanda, sem refazer o site inteiro. O nome ISR é usado por alguns meta-frameworks; o conceito de regenerar páginas estáticas existe em vários.'
          ),
          sl(
            'Comparando custos e ganhos',
            'CSR: simples de hospedar (só arquivos estáticos), boa para aplicações atrás de login (painéis), porém o primeiro conteúdo demora (baixa, executa JS, busca dados). SSR: primeiro conteúdo rápido e bom para SEO com conteúdo que muda a cada requisição ou por usuário; exige um servidor executando código e consome processamento por requisição. SSG: o mais rápido e barato de servir (CDN), ideal para conteúdo que muda pouco (blog, documentação); o conteúdo só atualiza quando se refaz o build. ISR: meio-termo para muitas páginas semi-estáticas, como um catálogo. Escolha por página, não para o site inteiro: o mesmo projeto pode misturar as quatro.'
          ),
          sl(
            'Hidratação',
            'Quando o servidor entrega HTML pronto (SSR ou SSG), a página já aparece, mas os botões ainda não respondem: falta o JavaScript. A hidratação é o passo em que o framework, no navegador, percorre o HTML existente, reaproveita os elementos e anexa os manipuladores de eventos e o estado, em vez de recriar tudo do zero. React, Vue e Angular fazem hidratação (em Angular, em versões recentes, via recurso de hidratação do SSR). Versões recentes ainda avançam para hidratar só partes da página (hidratação parcial ou por ilhas, e @defer no Angular); confira a documentação da versão em uso. Efeito colateral: entre ver a página e poder usá-la há um intervalo.'
          ),
          sl(
            'Mismatch de hidratação',
            'Na hidratação, o framework espera que o HTML que o cliente geraria seja IGUAL ao que o servidor enviou. Se for diferente, ocorre um mismatch: aviso no console, elementos refeitos, tela piscando ou comportamento estranho. Causas típicas: usar Date.now(), Math.random() ou o fuso horário diretamente na renderização (servidor e cliente geram valores diferentes); ler window, localStorage ou largura da tela durante a renderização (não existem no servidor); HTML inválido aninhado (como div dentro de p, que o navegador corrige). Solução: manter a renderização determinística e deixar o que depende do navegador para depois da montagem (efeito/onMounted/afterNextRender). O exemplo abaixo, em JavaScript puro, simula a comparação.',
            'const escapa = (s) => String(s).replace(/[&<>"\']/g, (c) => ({ \'&\': \'&amp;\', \'<\': \'&lt;\', \'>\': \'&gt;\', \'"\': \'&quot;\', "\'": \'&#39;\' }[c]));\nconst render = (nome, agoraTexto) => \'<p>Olá, \' + escapa(nome) + \' — \' + agoraTexto + \'</p>\';\n\nconst htmlServidor = render(\'Ana <Teste>\', \'12:00:01\');\nconst htmlCliente = render(\'Ana <Teste>\', \'12:00:03\'); // hora lida no cliente\nconsole.log(htmlServidor);\nconsole.log(\'iguais?\', htmlServidor === htmlCliente, \'-> mismatch\');\n\nconst fixo = \'12:00\'; // valor vindo dos dados, igual nos dois lados\nconsole.log(\'iguais?\', render(\'Ana <Teste>\', fixo) === render(\'Ana <Teste>\', fixo));\n\n// saída real (Node):\n// <p>Olá, Ana &lt;Teste&gt; — 12:00:01</p>\n// iguais? false -> mismatch\n// iguais? true'
          ),
          sl(
            'SEO e conteúdo',
            'Buscadores conseguem executar JavaScript, mas rastrear páginas que dependem de JS é mais lento e menos previsível do que ler HTML pronto. Por isso, para conteúdo público que precisa ser encontrado (blog, loja, documentação), SSR ou SSG entregam título, descrição e texto já no HTML inicial, além de pré-visualizações em redes sociais, que normalmente não executam JS. Para telas atrás de login, SEO é irrelevante e CSR costuma bastar. Lembre também de metadados por página (título, descrição) e de dados pessoais: com SSR, não coloque dados de um usuário em páginas cacheadas e compartilhadas, pois outra pessoa poderia recebê-las.'
          ),
          sl(
            'Como decidir',
            'Pergunte, por página: o conteúdo precisa ser indexado? muda a cada requisição ou por usuário? quantas vezes muda por dia? tenho um servidor disponível? Conteúdo público e estável: SSG. Conteúdo público que muda de vez em quando e é grande: ISR. Conteúdo público dinâmico ou personalizado e que precisa de SEO: SSR. Aplicação autenticada interativa: CSR (ou SSR se o primeiro carregamento importar). Em React, Vue e Angular essas opções chegam geralmente por meta-frameworks (próxima lição), embora o Angular tenha SSR e pré-renderização no próprio projeto.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual alternativa descreve corretamente o SSG?', 'd', ['O HTML é gerado pelo servidor a cada requisição de cada visitante', 'O HTML é montado no navegador, a partir de um HTML quase vazio', 'O HTML é gerado pelo navegador de cada visitante e enviado depois de volta ao servidor', 'O HTML é gerado uma vez no build e servido como arquivo estático'], 'SSG gera no build. Gerar a cada requisição é SSR, montar só no navegador é CSR, e o navegador não devolve HTML ao servidor nesse modelo.'),
        mcq('q2', 'Um blog de documentação muda poucas vezes por semana e deve ser indexado por buscadores. Qual estratégia é a mais adequada?', 'c', ['CSR puro, porque o buscador espera o JavaScript terminar de executar', 'SSR com servidor dedicado, calculando cada página do zero a cada visita', 'SSG, servindo páginas estáticas por CDN e refazendo o build quando houver mudança', 'Um servidor de aplicação com banco de dados, porque páginas estáticas não podem ser indexadas'], 'Conteúdo estável e público combina com SSG: rápido, barato e com HTML pronto para SEO. CSR puro pesa no rastreamento, SSR gasta processamento sem necessidade e não há exigência de servidor de aplicação.'),
        mcq('q3', 'O que a hidratação faz?', 'a', ['Anexa manipuladores e estado ao HTML que o servidor já entregou', 'Converte o HTML em imagens para carregar mais rápido na rede móvel', 'Apaga o HTML do servidor e recria toda a interface do zero no navegador', 'Compacta o JavaScript do bundle para reduzir o tamanho do download'], 'Hidratar é tornar interativo o HTML existente. Não converte para imagem, não recria tudo do zero (essa é a diferença para CSR) e compactar bundle é outra técnica.'),
        fill('q4', 'Complete o termo para o problema em que o HTML gerado no cliente difere do enviado pelo servidor durante a hidratação.', 'Quando o cliente gera HTML diferente do servidor ocorre um ___ de hidratação.', ['mismatch'], 'Mismatch é a divergência entre o HTML do servidor e o que o cliente renderizaria; causa avisos e refazimento de elementos.'),
        mcq('q5', 'Um componente mostra new Date().toLocaleTimeString() direto na renderização e gera mismatch. Qual correção é adequada?', 'b', ['Trocar toLocaleTimeString por Math.random para os dois lados ficarem diferentes de propósito', 'Renderizar um valor estável e atualizar o horário após a montagem', 'Desligar o SSR do projeto inteiro para não ver mais o aviso no console', 'Esconder o aviso do console, porque o resultado visual costuma ser o mesmo'], 'Valores dependentes do momento ou do navegador devem ser aplicados depois da montagem, mantendo a primeira renderização determinística. Aleatoriedade piora, desligar SSR joga fora o benefício e esconder o aviso mantém o erro.'),
        mcq('q6', 'Qual destas é uma causa típica de mismatch de hidratação?', 'b', ['Usar props com valores vindos de uma API durante a renderização no servidor', 'Ler window ou localStorage durante a renderização, já que não existem no servidor', 'Declarar um componente em arquivo separado do componente pai', 'Usar um nome de classe CSS com letras maiúsculas e minúsculas'], 'Dependências do navegador na renderização produzem resultados diferentes nos dois ambientes. Props vindas de dados iguais, organização de arquivos e nomes de classe não alteram o HTML entre servidor e cliente.'),
        mcq('q7', 'Uma página com SSR mostra o nome e os pedidos de uma pessoa. Qual cuidado de privacidade é essencial?', 'c', ['Colocar os pedidos em um comentário HTML para o buscador ignorar o conteúdo', 'Cachear a página para os visitantes e acelerar o carregamento do site', 'Impedir que um cache compartilhado guarde e reentregue essa resposta', 'Enviar os mesmos dados também em cada página pública para manter o cache aproveitado'], 'Respostas personalizadas não podem ser servidas de cache compartilhado, pois outra pessoa receberia dados pessoais. Comentário HTML não protege, cachear para todos agrava e replicar dados em páginas públicas é vazamento.'),
        fill('q8', 'Complete a sigla da estratégia em que o servidor entrega um HTML quase vazio e o navegador monta a interface.', 'Quando o navegador monta toda a interface a partir de JavaScript, a estratégia se chama ___.', ['CSR', 'Client-Side Rendering'], 'CSR significa Client-Side Rendering: o HTML inicial é mínimo e o JavaScript no navegador constrói a interface.')
      ]
    },
    {
      id: 'fii-31-meta-frameworks',
      title: 'Meta-frameworks: Next.js, Nuxt e Analog',
      goal: 'Entender o que são meta-frameworks, como rotas por arquivos e dados no servidor funcionam, o que ganham e o que custam.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um meta-framework',
            'React, Vue e Angular resolvem a camada de interface. Uma aplicação completa precisa de mais: roteamento, renderização no servidor, busca de dados, build otimizado, imagens, deploy. Um meta-framework é uma camada construída SOBRE o framework de UI que traz essas decisões prontas. Os nomes principais: Next.js (sobre React), Nuxt (sobre Vue) e Analog (sobre Angular, baseado no Vite). O Angular também oferece SSR e pré-renderização no próprio projeto; Analog acrescenta rotas por arquivos e endpoints de servidor. Cada um evolui rápido: confira a documentação da versão em uso.'
          ),
          sl(
            'Rotas por arquivos',
            'Nos três, a estrutura de pastas define as rotas: criar um arquivo cria uma página. Uma pasta de páginas contém, por exemplo, index (rota /), sobre (rota /sobre) e um arquivo com nome entre colchetes, como [slug], que vira um parâmetro dinâmico (/blog/ola-mundo). Nuxt e Analog usam pastas chamadas pages; o Next.js usa a pasta app (e historicamente pages), onde cada pasta tem um arquivo de página. As convenções de nome variam de um para outro: leia a documentação. A vantagem é não manter um arquivo central de rotas; o risco é criar uma página sem querer só por colocar um arquivo ali.',
            '// converte caminho de arquivo em rota (ideia usada pelos meta-frameworks)\nfunction arquivoParaRota(arquivo) {\n  let r = arquivo.replace(/^pages\\//, \'\').replace(/\\.(vue|ts|tsx|js)$/, \'\');\n  r = r.replace(/\\/?index$/, \'\');\n  r = r.replace(/\\[([^\\]]+)\\]/g, \':$1\');\n  return \'/\' + r;\n}\nfor (const a of [\'pages/index.vue\', \'pages/sobre.vue\', \'pages/blog/[slug].vue\', \'pages/loja/index.vue\']) {\n  console.log(a.padEnd(24), \'->\', arquivoParaRota(a));\n}\n\n// saída real (Node):\n// pages/index.vue          -> /\n// pages/sobre.vue          -> /sobre\n// pages/blog/[slug].vue    -> /blog/:slug\n// pages/loja/index.vue     -> /loja'
          ),
          sl(
            'Dados no servidor',
            'Meta-frameworks permitem buscar dados no servidor ANTES de enviar o HTML: o Next.js com Server Components e funções de servidor (conceito de versões recentes do React), o Nuxt com useFetch/useAsyncData e rotas de servidor, o Analog com resolvers de rota e endpoints. Benefícios: menos requisições a partir do navegador, segredos (chaves de API, acesso ao banco) ficam no servidor, o HTML já chega com dados. Cuidado importante: código marcado para o servidor NUNCA deve ser importado em componentes do cliente, pois iria para o bundle público. Variáveis de ambiente só são expostas ao cliente quando têm o prefixo público definido pelo framework: nunca coloque segredo numa variável com esse prefixo.'
          ),
          sl(
            'Deploy: onde isso roda',
            'Há três formas de entregar. Estática: o build gera só arquivos (SSG), hospedados em qualquer CDN, a mais simples e barata. Servidor Node: um processo que renderiza páginas sob demanda (SSR), em uma VM, um container ou uma plataforma. Edge/serverless: funções executadas perto do usuário e escalando por demanda, com limites de runtime e de tempo. Os meta-frameworks usam adaptadores ou presets para cada alvo. A escolha afeta custo, latência e quais recursos funcionam (por exemplo, ISR e streaming dependem do alvo). Decida o alvo cedo e teste o build de produção localmente.'
          ),
          sl(
            'O que se ganha e o que se paga',
            'Ganha-se: SEO e desempenho inicial melhores, rotas e dados com convenções claras, otimizações prontas (divisão de código, imagens), uma estrutura que a equipe reconhece. Paga-se: mais conceitos (o que roda no servidor, o que roda no cliente, hidratação), dependência das convenções e do ritmo de mudança do framework, infraestrutura de servidor quando há SSR, builds mais complexos e acoplamento a uma plataforma de deploy se você usar recursos específicos dela. Para um painel interno atrás de login, uma SPA simples pode bastar; para um site público com conteúdo, um meta-framework costuma compensar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel de um meta-framework como Next.js, Nuxt ou Analog?', 'a', ['Somar roteamento, renderização no servidor, dados e build ao framework de interface', 'Substituir o React, o Vue ou o Angular por uma biblioteca de interface mais leve e simples', 'Servir como gerenciador de pacotes que instala as dependências do projeto mais rápido', 'Gerar o código do back-end completo e o banco de dados a partir dos componentes visuais'], 'Meta-frameworks ficam acima do framework de UI e trazem rotas, SSR/SSG, dados e build. Não substituem o framework, não são gerenciadores de pacotes e não geram um back-end completo sozinhos.'),
        mcq('q2', 'Um arquivo pages/produtos/[id].vue existe em um projeto Nuxt. Que rota ele representa?', 'd', ['A rota literal /produtos/[id], com os colchetes escritos na URL do navegador', 'Uma rota /produtos que ignora o nome do arquivo e lista os itens da pasta', 'Nenhuma rota, porque arquivos com colchetes são tratados como comentários pelo build', 'Uma rota dinâmica /produtos/:id, em que o trecho entre colchetes vira parâmetro'], 'Nome entre colchetes é convenção de parâmetro dinâmico. A rota não é literal com colchetes, não vira /produtos genérica e o build não trata esse nome como comentário.'),
        mcq('q3', 'Por que buscar dados sensíveis no servidor em um meta-framework é uma vantagem de segurança?', 'b', ['O navegador criptografa as respostas automaticamente quando elas vêm de uma rota de servidor', 'Chaves e acesso ao banco permanecem fora do bundle público, que qualquer pessoa pode inspecionar', 'O servidor valida a identidade de quem abre a página sem outra verificação', 'O código do servidor fica ilegível para o time, então não pode ser alterado por engano'], 'Segredos no servidor não vão para o bundle do cliente. Não há criptografia automática por usar rota de servidor, a identidade ainda precisa de autenticação própria e legibilidade para o time não é o ponto.'),
        fill('q4', 'Complete: variáveis de ambiente só chegam ao navegador quando usam o prefixo ___ definido pelo framework, por isso segredos nunca devem usá-lo.', '// regra: só variáveis com prefixo ___ são expostas ao cliente', ['público', 'publico', 'public'], 'O prefixo público (por exemplo, NEXT_PUBLIC_ no Next.js ou NUXT_PUBLIC no Nuxt) marca o que vai ao bundle; tudo com esse prefixo é visível a qualquer visitante.'),
        mcq('q5', 'Qual destas opções de deploy é a mais simples e barata para um site totalmente pré-renderizado?', 'd', ['Manter um servidor Node ligado o tempo todo para renderizar cada visita sob demanda', 'Usar funções de edge para cada página, mesmo sem conteúdo dinâmico algum', 'Rodar um container com banco de dados dedicado só para servir HTML fixo', 'Hospedar os arquivos gerados no build em uma CDN, sem servidor de aplicação'], 'Páginas pré-renderizadas são arquivos estáticos e dispensam servidor. Servidor Node, edge e banco dedicado acrescentam custo e operação sem necessidade para conteúdo fixo.'),
        mcq('q6', 'Qual cuidado vale ao importar código "somente do servidor" em um projeto com SSR?', 'c', ['Duplicar o código no cliente para que a página funcione também sem conexão com o servidor', 'Colocar o código dentro de um comentário HTML para ficar escondido dos visitantes', 'Garantir que o cliente não o importe, pois iria ao bundle público', 'Aplicar o prefixo público nas variáveis para que o servidor consiga lê-las normalmente'], 'Importar módulo de servidor no cliente o inclui no bundle e pode expor segredos. Duplicar amplia a exposição, comentário HTML não protege e o prefixo público torna a variável visível a todos.'),
        mcq('q7', 'Uma equipe vai construir um painel interno, atrás de login, sem necessidade de SEO. Qual avaliação é razoável?', 'a', ['Uma SPA simples pode bastar, pois o custo extra de SSR traz pouco benefício nessa situação', 'É obrigatório usar meta-framework com SSR, porque toda aplicação moderna precisa de servidor', 'Deve-se evitar qualquer build de produção para economizar tempo da equipe', 'O painel precisa ser pré-renderizado, já que o login não funciona em páginas dinâmicas'], 'SEO e primeiro conteúdo pesam pouco atrás de login, então uma SPA costuma bastar. Meta-frameworks não são obrigatórios, build de produção é necessário e login funciona normalmente em SPA.'),
        fill('q8', 'Complete: o Nuxt é o meta-framework construído sobre o framework ___.', '// Nuxt é o meta-framework do ecossistema ___', ['Vue'], 'Nuxt é construído sobre o Vue; Next.js sobre React e Analog sobre Angular.')
      ]
    },
    {
      id: 'fii-53-seo-e-metadados-para-spas-e-ssr',
      title: 'SEO e metadados para SPAs e SSR',
      goal: 'Entender o que buscadores e cartões sociais veem de uma SPA, escolher SSR/SSG quando importa e gerar title, description, canonical e Open Graph com escape seguro.',
      xp: 20,
      intro: {
        slides: [
          sl('O que buscadores e redes sociais veem de uma SPA', 'SEO (otimização para mecanismos de busca) é tornar suas páginas encontráveis e bem apresentadas. Uma SPA entrega um HTML quase vazio, com um div raiz e um script, e o conteúdo só aparece depois que o JavaScript roda. Alguns buscadores executam JavaScript, mas isso é feito em uma fila, com atraso e limites, e vários outros consumidores não executam nada: robôs de cartões sociais (a prévia de link no mensageiro), alguns rastreadores e ferramentas de acessibilidade simples. Resultado: uma SPA pura pode ser indexada tarde ou mal, e a prévia de link sair em branco. Erro comum: concluir "o buscador roda JavaScript, então está tudo certo" sem testar o que chega no HTML inicial.', '<!-- o que o robô recebe de uma SPA pura -->\n<!doctype html>\n<html lang="pt-BR">\n  <head><title>App</title></head>\n  <body>\n    <div id="root"></div>\n    <script src="/assets/app.js"></script>\n  </body>\n</html>\n/* ilustrativo, não executado aqui */'),
          sl('SSR e SSG para SEO, e metadados por rota', 'Renderização no servidor (SSR) e geração estática (SSG), vistas na lição de SSR, SSG, ISR e hidratação, entregam HTML já preenchido na primeira resposta, inclusive as tags do head. Por isso são a resposta natural quando a página precisa ser encontrada ou compartilhada: conteúdo público, artigos, catálogo. Área logada, painel e ferramentas internas não precisam disso. Os meta-frameworks oferecem uma forma de declarar metadados por rota: no Next.js, a função generateMetadata; no Nuxt, useHead e useSeoMeta; no Angular, os serviços Title e Meta (e, para HTML completo no servidor, SSR do próprio Angular). Em React puro sem servidor, bibliotecas de head ajudam, mas só valem para quem executa JavaScript. Confira a API da versão em uso.', '// Next.js (ilustrativo)\nexport async function generateMetadata({ params }) {\n  const curso = await buscarCurso(params.slug);\n  return { title: curso.titulo, description: curso.resumo };\n}\n\n// Nuxt (ilustrativo)\nuseSeoMeta({ title: curso.titulo, description: curso.resumo });\n\n// Angular (ilustrativo)\nprivate title = inject(Title);\nprivate meta = inject(Meta);\nngOnInit() {\n  this.title.setTitle(curso.titulo);\n  this.meta.updateTag({ name: \'description\', content: curso.resumo });\n}\n/* ilustrativo, não executado aqui */'),
          sl('title, description, canonical e robots meta', 'O title é o título da aba e, em geral, o link azul do resultado de busca: deve ser único por página e descrever o conteúdo. A meta description é um resumo que costuma aparecer abaixo do título; não garante posição, mas influencia o clique. O link rel="canonical" informa a URL preferida quando o mesmo conteúdo existe em várias (com parâmetros como ?ref= ou ?utm_...). A meta robots com noindex pede para a página não entrar no índice. Também importam o atributo lang no html e a viewport. Erros comuns: o mesmo título em todas as rotas da SPA (porque ninguém atualiza ao navegar), canonical apontando para a página errada e um noindex de ambiente de teste esquecido em produção.', '<head>\n  <title>Curso de Front-end: do zero ao projeto</title>\n  <meta name="description" content="Aprenda HTML, CSS e JavaScript com exercícios práticos.">\n  <link rel="canonical" href="https://example.com/cursos/frontend">\n  <meta name="robots" content="index, follow">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n/* ilustrativo, não executado aqui */'),
          sl('Open Graph, cartões sociais e dados estruturados', 'Open Graph é um conjunto de metatags (og:title, og:description, og:image, og:url) que redes e mensageiros leem para montar a prévia ao colar o link; twitter:card escolhe o formato do cartão. Use imagem horizontal e confira o tamanho recomendado por cada plataforma. Como esses robôs em geral não executam JavaScript, as tags precisam estar no HTML inicial (SSR/SSG). Dados estruturados são marcações que descrevem o conteúdo para máquinas (um artigo, um produto, um curso) usando o vocabulário schema.org, normalmente em JSON-LD dentro de um script. Em conceito: você diz "isto é um Curso, com este nome e este provedor", e o buscador pode apresentar o resultado de forma enriquecida. Descreva só o que realmente está na página: marcação enganosa viola as diretrizes dos buscadores. Se o JSON-LD incluir texto do usuário, escape o caractere < para o texto não fechar o script.', '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Course",\n  "name": "Curso de Front-end",\n  "description": "Aprenda HTML, CSS e JavaScript.",\n  "provider": { "@type": "Organization", "name": "Escola Exemplo" }\n}\n</script>\n/* ilustrativo, não executado aqui */'),
          sl('Sitemap, robots.txt, links semânticos e acessibilidade', 'O sitemap.xml lista as URLs que você quer ver rastreadas, ajudando a descobrir páginas que não têm links internos. O robots.txt orienta o rastreamento (quais caminhos o robô deve evitar), mas é voluntário e público: não é segurança e não remove página do índice. Para tirar do índice, use noindex em uma página que continue rastreável (se o robots.txt bloquear, o robô nem vê o noindex). Conteúdo realmente privado exige autenticação. Links semânticos são parte do SEO: use <a href> de verdade, porque robôs seguem href e ignoram um div com onClick, e escreva textos de link descritivos ("ver o curso de CSS" em vez de "clique aqui"). Isso também é acessibilidade: leitores de tela listam links pelo texto. Acessibilidade e SEO andam juntos: bons títulos, hierarquia de cabeçalhos e alt em imagens ajudam as duas.', '# robots.txt (público: não coloque aqui caminhos que precisam ficar secretos)\nUser-agent: *\nDisallow: /busca\nSitemap: https://example.com/sitemap.xml\n\n<!-- ERRADO: robôs e leitores de tela não tratam como link -->\n<div onClick="irPara(\'/cursos\')">clique aqui</div>\n<!-- CERTO -->\n<a href="/cursos">Ver todos os cursos</a>\n/* ilustrativo, não executado aqui */'),
          sl('Exemplo executável: gerando as tags com escape', 'O título e a descrição podem vir de dados do banco ou de um formulário, ou seja, de texto que alguém controla. Se forem colocados no HTML sem escape, uma aspas fecha o atributo e quebra a página (e abre caminho para XSS). O código abaixo é JavaScript puro, roda em Node e faz três coisas: escapa os cinco caracteres especiais do HTML, corta título e descrição em tamanhos razoáveis e monta as tags. O corte de 60 e 155 caracteres é uma convenção prática para não ficar truncado nos resultados, não uma regra fixa.', 'const esc = (s) => String(s).replace(/&/g, \'&amp;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\').replace(/"/g, \'&quot;\').replace(/\'/g, \'&#39;\');\n\nfunction metaTags({ title, description, url, image }) {\n  const t = title.slice(0, 60);\n  const d = description.slice(0, 155);\n  return [\n    `<title>${esc(t)}</title>`,\n    `<meta name="description" content="${esc(d)}">`,\n    `<link rel="canonical" href="${esc(url)}">`,\n    `<meta property="og:title" content="${esc(t)}">`,\n    `<meta property="og:description" content="${esc(d)}">`,\n    `<meta property="og:url" content="${esc(url)}">`,\n    `<meta property="og:image" content="${esc(image)}">`,\n    `<meta name="twitter:card" content="summary_large_image">`\n  ].join(\'\\n\');\n}\n\nconsole.log(metaTags({\n  title: \'Curso "Front-end" <básico> & prático\',\n  description: \'Aprenda HTML, CSS e JS. Veja o "passo a passo" de cada aula.\',\n  url: \'https://example.com/cursos/frontend?ref=a&b=2\',\n  image: \'https://example.com/img/capa.png\'\n}));'),
          sl('Saída real e como ler', 'Esta é a saída real do programa anterior, executado em Node. Observe: as aspas viraram &quot;, os sinais < e > viraram &lt; e &gt;, e o & da URL virou &amp; (em HTML, o & solto em atributo deve ser escrito assim). O canonical e o og:url repetem a mesma URL preferida, e o twitter:card pede o cartão grande com imagem. Num projeto real, em vez de escrever o escape à mão, use o mecanismo do framework (JSX, templates do Vue e do Angular já escapam texto por padrão) e reserve funções como esta para montar HTML puro no servidor.', '// saída real (Node)\n<title>Curso &quot;Front-end&quot; &lt;básico&gt; &amp; prático</title>\n<meta name="description" content="Aprenda HTML, CSS e JS. Veja o &quot;passo a passo&quot; de cada aula.">\n<link rel="canonical" href="https://example.com/cursos/frontend?ref=a&amp;b=2">\n<meta property="og:title" content="Curso &quot;Front-end&quot; &lt;básico&gt; &amp; prático">\n<meta property="og:description" content="Aprenda HTML, CSS e JS. Veja o &quot;passo a passo&quot; de cada aula.">\n<meta property="og:url" content="https://example.com/cursos/frontend?ref=a&amp;b=2">\n<meta property="og:image" content="https://example.com/img/capa.png">\n<meta name="twitter:card" content="summary_large_image">')
        ]
      },
      questions: [
        mcq('q1', 'Ao colar o link de uma SPA pura em um mensageiro, a prévia sai sem título nem imagem. Qual é a solução mais direta?', 'c', [
          'Atualizar o document.title e as metatags com JavaScript depois que a página carrega.',
          'Aumentar o tamanho da imagem og:image, porque imagens pequenas fazem o mensageiro desistir da prévia.',
          'Entregar as tags Open Graph já no HTML inicial, por SSR, SSG ou pré-renderização.',
          'Adicionar a rota ao robots.txt para que o robô do mensageiro respeite a página e monte o cartão.'
        ], 'Robôs de prévia normalmente não executam JavaScript e leem só o HTML recebido, então as tags precisam estar nele. Alterar o head no cliente chega tarde demais, o tamanho da imagem não resolve a ausência da tag e o robots.txt não monta cartões.'),
        mcq('q2', 'O mesmo curso abre em /cursos/css, /cursos/css?ref=email e /cursos/css?utm_campanha=x. Para qual finalidade serve o link rel="canonical"?', 'b', [
          'Bloquear o rastreamento das variações com parâmetros para economizar banda do servidor.',
          'Indicar ao buscador qual é a URL preferida para esse conteúdo, agrupando as variações.',
          'Redirecionar automaticamente o visitante das variações para a URL principal antes de carregar a página.',
          'Garantir que o buscador mostre a página em primeiro lugar entre os resultados parecidos.'
        ], 'O canonical consolida URLs duplicadas em uma preferida. Ele não bloqueia rastreamento (isso é do robots.txt), não redireciona o visitante (isso seria um redirect HTTP) e não garante posição alguma nos resultados.'),
        mcq('q3', 'Uma equipe adiciona Disallow no robots.txt para esconder o caminho /admin e considera o assunto resolvido. O que está errado?', 'd', [
          'O robots.txt só funciona para imagens, então páginas HTML continuam visíveis em qualquer buscador.',
          'Falta repetir a regra no sitemap.xml, que é o arquivo que de fato tem força sobre o rastreamento do site.',
          'Nada está errado, pois robôs de boa e má fé obedecem ao robots.txt da mesma forma e o arquivo basta.',
          'O robots.txt é público e voluntário, não protege nada; a área precisa de autenticação no servidor.'
        ], 'Qualquer pessoa pode ler o robots.txt, que inclusive revela o caminho, e só robôs cooperativos o obedecem; acesso restrito se faz com autenticação. O arquivo vale para páginas e não só imagens, o sitemap serve para listar URLs e a suposição de que todos os robôs obedecem é falsa.'),
        fill('q4', 'Complete a metatag que traz o resumo da página usado nos resultados de busca.', '<meta name="___" content="Aprenda HTML, CSS e JavaScript com exercícios práticos.">', ['description'], 'A metatag name="description" carrega o resumo da página. Ela não garante posição nos resultados, mas influencia quem decide clicar.'),
        mcq('q5', 'Por que o exemplo executável passa título e descrição por uma função de escape antes de montar o HTML?', 'a', [
          'Porque o texto pode vir de alguém, e uma aspas ou um sinal < poderia fechar o atributo e injetar marcação.',
          'Porque o HTML exige que todo texto de metatag esteja codificado, mesmo quando só tem letras simples.',
          'Porque o escape reduz o tamanho do texto e ajuda a caber nos limites de 60 e 155 caracteres.',
          'Porque sem escape os buscadores recusam indexar páginas com acentos no título ou na descrição.'
        ], 'O escape neutraliza caracteres que mudariam a estrutura do HTML, prevenindo quebra e XSS. Letras comuns não exigem codificação, o escape aumenta o texto em vez de encurtá-lo e acentos são aceitos normalmente.'),
        mcq('q6', 'Qual destes itens de navegação ajuda ao mesmo tempo o SEO e a acessibilidade?', 'd', [
          'Um <div> com onClick que chama navigate(\'/cursos\') e o texto "clique aqui".',
          'Um <button> estilizado como link, que muda a URL por JavaScript sem atualizar o endereço.',
          'Uma imagem clicável sem texto alternativo, já que o ícone dispensa descrição.',
          'Um elemento <a href="/cursos"> com texto descritivo, como "Ver todos os cursos".'
        ], 'Robôs seguem o href de um âncora e leitores de tela listam links pelo texto, então um <a> descritivo serve às duas coisas. Um div com onClick não é link para robôs nem para o teclado, e a imagem sem alt não oferece texto algum.'),
        mcq('q7', 'Uma página de teste foi publicada e precisa sair do índice do buscador. Qual abordagem funciona?', 'a', [
          'Manter a página rastreável e acrescentar a meta robots noindex, para o robô ler a instrução.',
          'Bloquear a página no robots.txt e acrescentar noindex também, pois o robô lê as duas instruções.',
          'Apenas apagar a página do sitemap.xml, o que remove imediatamente a URL do índice.',
          'Trocar o title por "removido", pois o buscador entende o texto e retira a página do índice.'
        ], 'Para o robô obedecer o noindex ele precisa conseguir abrir a página; bloqueada no robots.txt, a instrução nunca é lida e a URL pode seguir indexada por links externos. Tirar do sitemap não remove do índice e mudar o título não é um sinal de remoção.'),
        fill('q8', 'Complete o tipo do script que carrega dados estruturados em JSON-LD.', '<script type="___">\n{ "@context": "https://schema.org", "@type": "Course", "name": "Curso de Front-end" }\n</script>', ['application/ld+json'], 'O tipo application/ld+json avisa ao navegador que o bloco não é código executável e sim dados estruturados que buscadores leem.')
      ]
    },
    {
      id: 'fii-32-autenticacao-no-frontend',
      title: 'Autenticação no front-end',
      goal: 'Compreender fluxos de login (sessão e tokens), OIDC com PKCE em conceito, rotas protegidas, logout e por que o cliente nunca decide autorização.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autenticação e autorização: quem decide',
            'Autenticação responde "quem é você?"; autorização responde "o que você pode fazer?". Regra de ouro do front-end: o navegador é território do usuário e pode ser alterado com as ferramentas do desenvolvedor. Esconder um botão ou bloquear uma rota no cliente melhora a experiência, mas NÃO protege nada: quem decide é sempre o servidor, a cada requisição. Se o front mostra o painel de administrador só quando um valor local diz "admin", qualquer pessoa pode editar esse valor; o que impede o acesso indevido é a API recusar a requisição. Veja também os cursos de Node.js e de Segurança Web (OWASP) neste catálogo.'
          ),
          sl(
            'Sessão com cookie x tokens',
            'Dois modelos comuns. Sessão com cookie: depois do login o servidor guarda a sessão e envia um identificador num cookie; o navegador o devolve sozinho a cada requisição. Com os atributos HttpOnly (JavaScript não consegue ler), Secure (só por HTTPS) e SameSite (limita o envio entre sites), é uma escolha forte para front-ends do mesmo domínio. Tokens (como o JWT): o servidor emite um token que o cliente envia em um cabeçalho. Funcionam bem com várias APIs, mas exigem decidir ONDE guardar: em localStorage o token fica legível por qualquer script (um XSS o rouba); na memória some ao recarregar; em cookie HttpOnly volta a ser protegido. A orientação mais segura para aplicações web é manter credenciais fora do alcance do JavaScript.',
            '// ilustrativo, não executado aqui\n// Cookie de sessão emitido pelo servidor (cabeçalho de resposta)\nSet-Cookie: sid=<ID_OPACO>; HttpOnly; Secure; SameSite=Lax; Path=/\n\n// Front-end: o navegador envia o cookie; basta pedir credenciais\nfetch(\'/api/perfil\', { credentials: \'include\' });'
          ),
          sl(
            'OIDC com PKCE, em conceito',
            'Para "entrar com a conta de um provedor de identidade", o padrão é OpenID Connect (OIDC) sobre OAuth 2. Em aplicações de navegador usa-se o fluxo de código de autorização com PKCE (Proof Key for Code Exchange). Passos: 1) o app cria um code_verifier aleatório e secreto e calcula o code_challenge, o hash SHA-256 dele em base64url; 2) redireciona a pessoa ao provedor enviando só o challenge; 3) depois do login, o provedor devolve um código; 4) o app troca o código pelos tokens enviando o verifier original; o provedor confere se ele gera o challenge enviado antes. Assim, um código roubado no caminho não serve para ninguém sem o verifier. Front-ends públicos NÃO guardam um client secret. Prefira bibliotecas mantidas a escrever o fluxo à mão.',
            'const crypto = require(\'crypto\');\n// verifier de exemplo da especificação (RFC 7636), apenas didático\nconst verifier = \'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk\';\nconst challenge = crypto.createHash(\'sha256\').update(verifier).digest(\'base64url\');\nconsole.log(\'challenge:\', challenge);\n\n// o provedor confere: hash(verifier recebido) === challenge enviado antes\nconst confere = (v) => crypto.createHash(\'sha256\').update(v).digest(\'base64url\') === challenge;\nconsole.log(\'verifier correto:\', confere(verifier));\nconsole.log(\'verifier errado :\', confere(\'outro-valor\'));\n\n// saída real (Node):\n// challenge: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM\n// verifier correto: true\n// verifier errado : false'
          ),
          sl(
            'Rotas protegidas nos três frameworks',
            'Uma rota protegida redireciona quem não está autenticado para o login. Em React Router, um componente de rota ou um loader verifica a sessão e devolve um redirect. Em Vue Router, usa-se router.beforeEach (ou beforeEnter na rota) que retorna a rota de login quando necessário. Em Angular, uma função de guarda CanActivateFn usa inject() para consultar o serviço de autenticação e devolve true ou um UrlTree de redirecionamento. Os três são só UX: a verificação de verdade acontece na API. E ao redirecionar depois do login, valide o destino (lista de rotas internas conhecidas) para evitar redirecionamento aberto para sites externos.',
            '// ilustrativo, não executado aqui\n// Vue Router\nrouter.beforeEach((to) => {\n  const auth = useAuthStore();\n  if (to.meta.exigeLogin && !auth.logado) return { name: \'entrar\' };\n});\n\n// Angular (CanActivateFn)\nexport const autenticado: CanActivateFn = () => {\n  const auth = inject(AuthService);\n  return auth.logado() ? true : inject(Router).createUrlTree([\'/entrar\']);\n};'
          ),
          sl(
            'Logout, expiração e armazenamento seguro',
            'Logout de verdade tem dois lados: o servidor invalida a sessão ou revoga o token, e o cliente apaga o estado local (store, cache de consultas, dados em memória) para que a próxima pessoa no mesmo navegador não veja dados da anterior. Apenas apagar o token local, sem invalidar no servidor, deixa a credencial válida até expirar. Trate a resposta 401 (não autenticado) de forma central, redirecionando ao login, e 403 (sem permissão) mostrando uma mensagem. Nunca registre senhas nem tokens em logs ou na telemetria, e mostre mensagens de erro de login genéricas, sem revelar se o usuário existe. Dados pessoais da sessão (nome, e-mail) devem ser mínimos; use apenas dados fictícios nos exemplos e testes.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma aplicação esconde o menu "Administração" quando o valor local role não é "admin". O que isso garante?', 'd', ['Protege o acesso, desde que o valor local seja gravado em letras minúsculas sempre', 'Protege os dados de administração, porque o navegador não permite alterar valores locais', 'Protege parcialmente, e o servidor só precisa checar a permissão na primeira requisição da sessão', 'Só melhora a experiência; o servidor é quem deve negar o acesso'], 'Estado do cliente é controlável pelo usuário, então esconder menus é só UX. A autorização precisa ser conferida pelo servidor em cada requisição, e nada impede editar valores locais.'),
        mcq('q2', 'Qual combinação de atributos de cookie de sessão é a mais protetora contra roubo por script e envio por HTTP simples?', 'b', ['Path=/, que restringe o cookie ao caminho principal do site', 'HttpOnly e Secure, com SameSite configurado', 'Domain amplo e sem atributos extras, para que os subdomínios o recebam', 'Expires distante, para que o usuário não precise fazer login de novo por meses'], 'HttpOnly impede leitura por JavaScript, Secure restringe a HTTPS e SameSite limita envio entre sites. Path, Domain amplo e Expires longo não protegem contra esses riscos (o domínio amplo e a validade longa até aumentam a exposição).'),
        mcq('q3', 'Qual é a finalidade do code_verifier no fluxo OIDC com PKCE?', 'a', ['Provar ao provedor que quem troca o código é o mesmo app que iniciou o fluxo, tornando um código roubado inútil', 'Substituir a senha da pessoa, que não precisa mais se autenticar no provedor', 'Servir como client secret do app, que deve ficar guardado no bundle do front-end', 'Criptografar o conteúdo dos tokens para que ninguém consiga lê-los no navegador'], 'O provedor compara o hash do verifier com o challenge enviado no início. Não substitui a senha, não é um client secret (front-ends públicos não têm um) e não criptografa tokens.'),
        fill('q4', 'Complete: no PKCE, o code_challenge é o hash ___ do code_verifier, codificado em base64url.', 'const challenge = createHash(\'___\').update(verifier).digest(\'base64url\');', ['sha256', 'SHA-256', 'SHA256'], 'O método S256 usa SHA-256 do verifier; o resultado em base64url é o challenge enviado ao provedor.'),
        mcq('q5', 'Onde guardar o token de acesso para reduzir o impacto de um ataque de XSS?', 'c', ['Em localStorage, pois ele é privado de cada site e script algum consegue lê-lo', 'No código-fonte do bundle, ofuscado para que ninguém o encontre com facilidade', 'Em cookie HttpOnly ou na memória, nunca em localStorage', 'Em um cookie sem HttpOnly, porque assim o front-end pode ler sem restrições'], 'Qualquer script da página lê localStorage, inclusive um script injetado. Cookie HttpOnly ou memória reduz esse risco. Um token no bundle é público e cookie sem HttpOnly continua legível por scripts.'),
        mcq('q6', 'Em Angular, qual recurso implementa uma rota protegida redirecionando para o login?', 'd', ['Um pipe no template que remove o link para a rota quando a pessoa não está logada', 'Uma diretiva @for que filtra as rotas protegidas na lista do menu principal', 'Uma variável global no window que a API consulta para decidir quem é a pessoa', 'Uma guarda CanActivateFn que devolve true ou um UrlTree'], 'Guardas de rota (CanActivateFn) decidem a navegação. Pipe ou menu filtrado apenas escondem links, e uma variável global no window é manipulável e a API não a consulta.'),
        mcq('q7', 'Qual procedimento torna o logout efetivo?', 'a', ['Invalidar a sessão ou revogar o token no servidor e limpar o estado e o cache no cliente', 'Redirecionar para a página de login e manter o token válido até expirar sozinho', 'Apagar o nome da pessoa da tela e manter as consultas em cache', 'Fechar a aba do navegador e esperar que o servidor perceba a ausência de requisições'], 'O servidor precisa invalidar a credencial e o cliente limpar o que ficou em memória e cache. Só redirecionar, esconder o nome ou fechar a aba deixa a credencial ou os dados disponíveis.'),
        fill('q8', 'Complete o código HTTP que indica "não autenticado", tratado de forma central redirecionando ao login.', 'if (resposta.status === ___) { irParaLogin(); }', ['401'], '401 significa não autenticado (credenciais ausentes ou inválidas); 403 indica que a pessoa está identificada, mas sem permissão.')
      ]
    },
    {
      id: 'fii-33-escolhendo-gerenciamento-de-estado',
      title: 'Escolhendo gerenciamento de estado',
      goal: 'Classificar o estado de uma aplicação (local, de URL, de servidor, global) e escolher a ferramenta certa nos três frameworks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quatro tipos de estado',
            'Boa parte da dor com estado vem de tratar tudo como a mesma coisa. Há quatro tipos. Estado local: pertence a um componente (campo aberto/fechado, texto digitado). Estado de URL: o que cabe no endereço (página, filtro, ordenação, aba) e permite compartilhar e recarregar a página. Estado de servidor: dados que moram no back-end e que você apenas copia para a tela (listas, perfil), com cache, carregamento, erro e revalidação. Estado global de cliente: dados que só existem no navegador e são usados em muitos lugares distantes (tema, carrinho antes do envio, preferências). Cada tipo tem uma ferramenta mais adequada.'
          ),
          sl(
            'Local e de URL',
            'Estado local: React useState/useReducer; Vue ref/reactive dentro de <script setup>; Angular signal() no componente. Levante o estado ao ancestral comum só quando dois irmãos precisam dele. Estado de URL: React Router/Next.js (parâmetros de rota e search params), Vue Router (route.query e route.params), Angular Router (paramMap, queryParamMap, ou inputs ligados à rota). Regra prática: se a pessoa gostaria de enviar o link e ver a mesma tela (filtro de busca, página 3, aba ativa), guarde na URL, não em estado interno. Erro comum: duplicar na store o que já está na URL e depois ter de sincronizar os dois.'
          ),
          sl(
            'Estado de servidor: cache em vez de store',
            'Dados do servidor têm problemas próprios: carregamento, erro, cache, deduplicar requisições, atualizar em segundo plano, invalidar depois de uma alteração. Copiá-los à mão para uma store global e escrever isso tudo é o erro mais comum. Bibliotecas especializadas resolvem: TanStack Query (React, Vue e também Angular), RTK Query (com Redux Toolkit), SWR e, no Angular, HttpClient com signals ou RxJS (e o recurso resource, em versões recentes). Elas tratam o servidor como uma fonte da verdade com cache, não como estado seu. Isso costuma tirar metade do conteúdo da store global.'
          ),
          sl(
            'Estado global de cliente',
            'Quando sobra estado realmente global e do cliente, escolha pelo tamanho do problema. React: Context para valores que mudam pouco (tema, usuário atual); Zustand ou Jotai para estado leve; Redux Toolkit quando há muita lógica, previsibilidade e ferramentas de depuração valem o custo. Vue: Pinia, a solução oficial, com stores simples e tipadas. Angular: serviços com signals na maioria dos casos; NgRx (e NgRx SignalStore) quando a escala pede padrões estritos. Armadilha: Context do React com valor que muda toda hora re-renderiza todos os consumidores; separe contextos ou use uma biblioteca com seletores.'
          ),
          sl(
            'Guia de decisão em código',
            'Siga a ordem: 1) cabe na URL e deve ser compartilhável? URL. 2) vem do servidor? biblioteca de dados com cache. 3) só um componente usa? local. 4) vários componentes distantes? global de cliente, o mais simples que resolve. O código abaixo, em JavaScript puro, transforma esse roteiro em uma função, apenas para fixar a ordem das perguntas.',
            'function ondeGuardar({ cabeNaUrl, vemDoServidor, usadoPorUmComponente }) {\n  if (cabeNaUrl) return \'URL\';\n  if (vemDoServidor) return \'cache de servidor (TanStack Query etc.)\';\n  if (usadoPorUmComponente) return \'estado local\';\n  return \'estado global de cliente (Pinia, Zustand, serviço com signals...)\';\n}\nconst casos = {\n  \'filtro de busca\': { cabeNaUrl: true },\n  \'lista de pedidos\': { vemDoServidor: true },\n  \'menu aberto\': { usadoPorUmComponente: true },\n  \'tema escuro\': {}\n};\nfor (const [nome, c] of Object.entries(casos)) console.log(nome.padEnd(18), \'->\', ondeGuardar(c));\n\n// saída real (Node):\n// filtro de busca    -> URL\n// lista de pedidos   -> cache de servidor (TanStack Query etc.)\n// menu aberto        -> estado local\n// tema escuro        -> estado global de cliente (Pinia, Zustand, serviço com signals...)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um filtro de busca e o número da página devem sobreviver a um F5 e poder ser enviados por link. Onde guardar?', 'c', ['Em uma store global, que o framework restaura sozinho ao recarregar a página', 'Em estado local do componente, que é preservado pelo navegador no recarregamento', 'Na URL, como parâmetros de busca, lendo-os pelo roteador do framework', 'Em uma variável global dentro do bundle, atualizada a cada clique do usuário'], 'A URL é recarregável e compartilhável. Stores globais, estado local e variáveis do bundle se perdem ao recarregar e não viajam em links.'),
        mcq('q2', 'O que caracteriza o "estado de servidor"?', 'b', ['É qualquer valor guardado em um componente, como o texto digitado em um campo', 'Dados remotos copiados para a tela, com cache e revalidação', 'É o estado que só existe no navegador, como o tema escuro escolhido', 'É o conteúdo da URL que identifica a página e os filtros ativos'], 'Estado de servidor é uma cópia de dados remotos e traz problemas próprios de cache e sincronização. Texto digitado é local, tema é global de cliente e a URL é o estado de URL.'),
        mcq('q3', 'Uma equipe copia a lista de pedidos da API para uma store global e escreve à mão o carregamento, o erro e a atualização. Qual alternativa melhora o design?', 'b', ['Colocar todo o estado, inclusive o da URL e o dos formulários, na mesma store global', 'Usar uma biblioteca de cache de servidor, como TanStack Query', 'Guardar a lista completa em localStorage e ler de lá a cada renderização', 'Trocar a store por variáveis globais no window, que tornam a leitura mais rápida'], 'Bibliotecas de dados tratam cache, deduplicação e revalidação. Centralizar tudo numa store piora o acoplamento, localStorage não revalida e variáveis no window não trazem reatividade nem organização.'),
        fill('q4', 'Complete: no Vue, a biblioteca oficial recomendada para estado global de cliente é a ___.', '// estado global no Vue: stores com ___', ['Pinia'], 'Pinia é a solução oficial de estado global do Vue, com stores simples e tipadas.'),
        mcq('q5', 'Qual ferramenta é natural para estado local de componente no Angular moderno?', 'd', ['Uma store NgRx para cada campo de formulário do aplicativo', 'Uma variável no window acessada pelos templates', 'O localStorage, lido novamente a cada ciclo de detecção de mudanças', 'Um signal criado com signal() no próprio componente'], 'signal() é o primitivo de estado local do Angular moderno. NgRx para cada campo é exagero, window não é reativo e localStorage a cada ciclo é lento e inadequado.'),
        mcq('q6', 'Quando faz sentido levantar o estado local ("lifting state up") para um ancestral?', 'c', ['Quando um componente tiver mais de duas variáveis de estado diferentes', 'Quando o valor aparece em um componente filho, mas é calculado no pai', 'Quando dois componentes irmãos precisam ler ou alterar o mesmo valor', 'Quando o estado pode ser mudado por um clique, independentemente de quem o usa'], 'Levanta-se o estado ao menor ancestral comum que precisa compartilhá-lo. Contar variáveis, ou o simples fato de haver um clique, não é critério; e um valor usado só pelo filho pode ficar com o filho.'),
        mcq('q7', 'Por que um Context do React com um valor que muda a cada segundo pode causar problemas de desempenho?', 'a', ['Todos os componentes consumidores são re-renderizados a cada mudança, mesmo os que não usam a parte alterada', 'O Context grava o valor em disco a cada alteração, o que atrasa a interface', 'O Context impede que o componente raiz seja montado pela primeira vez', 'O Context só aceita valores de texto e converte tudo a cada alteração'], 'Mudanças no valor do Context re-renderizam todos os consumidores. Ele não grava em disco, não impede a montagem do componente raiz e aceita qualquer valor, não só texto.'),
        fill('q8', 'Complete a ordem de decisão: dados que vêm da API devem ser guardados em um ___ de servidor (como TanStack Query), não em uma store global manual.', 'const { data } = useQuery({ queryKey: [\'pedidos\'], queryFn: buscarPedidos }); // ___ de servidor', ['cache'], 'Bibliotecas como TanStack Query mantêm um cache de servidor com revalidação; é isso que evita reescrever carregamento e erro à mão numa store.')
      ]
    },
    {
      id: 'fii-55-tabelas-listas-e-telas-de-crud',
      title: 'Tabelas, listas e telas de CRUD',
      goal: 'Montar telas de listagem, detalhe e edição com paginação, ordenação e filtros no servidor, estado na URL, tabelas acessíveis, edição em linha, exclusão segura e estados vazio, carregando e erro.',
      xp: 20,
      intro: {
        slides: [
          sl('O padrão listagem, detalhe e edição', 'CRUD é a sigla de Create, Read, Update e Delete (criar, ler, atualizar, apagar), as quatro operações básicas sobre dados. A maioria dos sistemas administrativos organiza isso em telas: uma LISTAGEM (tabela ou cards), um DETALHE de um item e um formulário de EDIÇÃO/criação. Cada tela tem uma rota (por exemplo /usuarios, /usuarios/42 e /usuarios/42/editar), o que permite link direto e botão voltar funcionando. E toda tela de dados passa por quatro estados que precisam de desenho próprio: CARREGANDO (esqueleto ou indicador), VAZIO (nenhum resultado, com orientação do que fazer), ERRO (mensagem útil, sem detalhes internos, e botão de tentar de novo) e SUCESSO (os dados). Erro comum: tratar só o caso de sucesso e deixar a tela em branco quando a lista vem vazia ou a chamada falha.'),
          sl('Paginação, ordenação e filtros no servidor; estado na URL', 'Quando a base tem milhares de linhas, baixar tudo para o navegador e ordenar lá é lento e desperdiça memória. O padrão é o servidor receber os parâmetros e devolver só uma página: page e pageSize (ou um cursor, que marca "a partir deste item" e escala melhor em listas muito grandes), sort e dir para a ordenação e q ou filtros específicos. No servidor, valide os parâmetros: aceite só colunas de ordenação de uma lista fechada (não coloque o nome vindo da query direto na consulta SQL; veja o curso de Segurança Web) e limite o tamanho da página. No cliente, guarde esse estado NA URL (?page=2&sort=pontos&dir=desc&q=ana): o link é compartilhável, o botão voltar e o recarregamento restauram a tela, e o estado não se perde ao navegar. Em filtros de texto, use debounce (esperar a pessoa parar de digitar por um instante) para não disparar uma chamada a cada tecla.'),
          sl('Os três frameworks lado a lado', 'A ideia é a mesma nos três: a URL é a fonte da verdade do estado da listagem, e o componente lê e escreve nela. No React Router, useSearchParams devolve os parâmetros e uma função para atualizá-los. No Vue Router, useRoute().query lê e router.push({ query }) escreve. No Angular, o roteador oferece queryParamMap (via ActivatedRoute) e, em versões recentes, é possível ligar parâmetros diretamente a inputs do componente; navegação com router.navigate([], { queryParams }). Em todos, ao mudar um filtro, volte para a página 1, senão a pessoa pode ficar em uma página que deixou de existir. Combine com sua biblioteca de dados (TanStack Query, por exemplo, ou HttpClient com signals no Angular), usando os parâmetros como chave da consulta.', '// React Router (ilustrativo)\nconst [params, setParams] = useSearchParams();\nconst page = Number(params.get(\'page\') ?? 1);\nconst irParaPagina = (n) => setParams({ ...Object.fromEntries(params), page: String(n) });\n\n// Vue Router (ilustrativo)\nconst route = useRoute();\nconst router = useRouter();\nconst page = computed(() => Number(route.query.page ?? 1));\nconst irParaPagina = (n) => router.push({ query: { ...route.query, page: n } });\n\n// Angular (ilustrativo)\nprivate route = inject(ActivatedRoute);\nprivate router = inject(Router);\npage = toSignal(this.route.queryParamMap.pipe(map(p => Number(p.get(\'page\') ?? 1))), { initialValue: 1 });\nirParaPagina(n: number) { this.router.navigate([], { queryParams: { page: n }, queryParamsHandling: \'merge\' }); }\n/* ilustrativo, não executado aqui */'),
          sl('Exemplo executável: paginação, ordenação e filtro', 'Para entender o contrato entre cliente e servidor, o código abaixo simula, em JavaScript puro, o que o servidor faz com dados fictícios: filtra por setor e por texto, ordena por uma coluna permitida (qualquer outra volta para o padrão), calcula o total de páginas e limita a página pedida ao intervalo válido. O pageSize também é limitado (entre 1 e 50) para ninguém pedir uma página gigante.', 'const dados = [\n  { id: 1, nome: \'Ana\', setor: \'vendas\', pontos: 42 },\n  { id: 2, nome: \'Bruno\', setor: \'suporte\', pontos: 17 },\n  { id: 3, nome: \'Carla\', setor: \'vendas\', pontos: 88 },\n  { id: 4, nome: \'Davi\', setor: \'suporte\', pontos: 63 },\n  { id: 5, nome: \'Elisa\', setor: \'vendas\', pontos: 55 },\n  { id: 6, nome: \'Fábio\', setor: \'financeiro\', pontos: 31 },\n  { id: 7, nome: \'Gabi\', setor: \'vendas\', pontos: 70 },\n  { id: 8, nome: \'Hugo\', setor: \'suporte\', pontos: 24 }\n];\nconst SORTABLE = [\'nome\', \'pontos\'];\n\nfunction consulta(rows, { q = \'\', setor = \'\', sort = \'id\', dir = \'asc\', page = 1, pageSize = 3 }) {\n  if (!SORTABLE.includes(sort) && sort !== \'id\') sort = \'id\';\n  pageSize = Math.min(Math.max(pageSize, 1), 50);\n  let r = rows.filter((x) => (!setor || x.setor === setor) && x.nome.toLowerCase().includes(q.toLowerCase()));\n  r = [...r].sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0) * (dir === \'desc\' ? -1 : 1));\n  const total = r.length;\n  const pages = Math.max(1, Math.ceil(total / pageSize));\n  page = Math.min(Math.max(page, 1), pages);\n  return { total, pages, page, itens: r.slice((page - 1) * pageSize, page * pageSize).map((x) => x.nome + \':\' + x.pontos) };\n}\n\nconsole.log(consulta(dados, {}));\nconsole.log(consulta(dados, { setor: \'vendas\', sort: \'pontos\', dir: \'desc\', page: 2 }));\nconsole.log(consulta(dados, { q: \'a\', sort: \'senha\', page: 99 }));'),
          sl('Saída real e leitura', 'Saída real do programa anterior em Node (o formato de impressão é do próprio Node). A primeira chamada usa os padrões: 8 itens, 3 páginas, três por página, em ordem de id. A segunda filtra o setor vendas (4 pessoas), ordena por pontos do maior para o menor e pede a página 2: sobra só Ana, que tem 42. A terceira pede ordenar por "senha", coluna que não está na lista permitida, então a ordenação cai em id; com o filtro q=a sobram 5 nomes e a página 99 é limitada à última, a 2, que mostra Elisa e Gabi. Por isso a interface deve usar o page e o pages que o servidor devolve, e não o que a pessoa digitou na URL.', '// saída real (Node)\n{\n  total: 8,\n  pages: 3,\n  page: 1,\n  itens: [ \'Ana:42\', \'Bruno:17\', \'Carla:88\' ]\n}\n{ total: 4, pages: 2, page: 2, itens: [ \'Ana:42\' ] }\n{ total: 5, pages: 2, page: 2, itens: [ \'Elisa:55\', \'Gabi:70\' ] }'),
          sl('Tabelas acessíveis e virtualização', 'Use <table> de verdade para dados tabulares: <caption> dá um título à tabela, <th scope="col"> (ou scope="row") liga cada célula ao seu cabeçalho para leitores de tela, e a coluna ordenada indica o estado com aria-sort ("ascending", "descending" ou "none"). Controles de ordenação são <button> dentro do <th>, operáveis por teclado. Ao paginar, mova o foco para o início da tabela ou anuncie "Página 2 de 3" em região aria-live. Evite montar tabelas com divs e CSS sem os papéis (roles) corretos, pois perdem a semântica. Em telas estreitas, permita rolagem horizontal da tabela ou reorganize em cartões. VIRTUALIZAÇÃO (conceito): para listas enormes em uma única rolagem, renderiza-se só as linhas visíveis mais uma margem, reaproveitando os elementos conforme a pessoa rola (existem bibliotecas para isso, como TanStack Virtual). Tem custos: a busca do navegador não encontra o que não foi renderizado e a acessibilidade exige cuidado. Prefira paginar primeiro.', '<table>\n  <caption>Pontuação da semana por pessoa</caption>\n  <thead>\n    <tr>\n      <th scope="col" aria-sort="none"><button type="button">Nome</button></th>\n      <th scope="col" aria-sort="descending"><button type="button">Pontos</button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><td>Carla</td><td>88</td></tr>\n    <tr><td>Gabi</td><td>70</td></tr>\n  </tbody>\n</table>\n/* ilustrativo, não executado aqui */'),
          sl('Edição em linha, exclusão segura e dados pessoais', 'Edição em linha troca as células de uma linha por campos: Enter salva, Esc cancela, o foco vai para o primeiro campo e a validação aparece ao lado. Pode-se usar atualização otimista (mostra o novo valor de imediato e desfaz se o servidor recusar), com mensagem clara em caso de falha. Exclusão é ação destrutiva: peça confirmação em um diálogo que cite o item ("Excluir o usuário Ana?"), com o botão de ação descrevendo o que faz, ou ofereça "desfazer" por alguns segundos. Esconder o botão de quem não tem permissão é só UX: o servidor precisa checar autorização em cada requisição. Dados pessoais em listas: mostre só as colunas necessárias, mascare o que for sensível (por exemplo, parte do documento), registre em logs apenas identificadores e, ao exportar para CSV, trate células que começam com =, +, - ou @ (prefixe com apóstrofo) para evitar injeção de fórmula em planilhas. A LGPD, em visão geral, pede finalidade e minimização; consulte orientação jurídica para o seu caso.', '// confirmação de exclusão acessível (ilustrativo)\n<dialog ref={dialogo} aria-labelledby="titulo-excluir">\n  <h2 id="titulo-excluir">Excluir o usuário {usuario.nome}?</h2>\n  <p>Esta ação não pode ser desfeita.</p>\n  <button onClick={cancelar}>Cancelar</button>\n  <button onClick={confirmarExclusao}>Excluir usuário</button>\n</dialog>\n\n// servidor: confere permissão a cada DELETE, mesmo que o botão esteja escondido\n/* ilustrativo, não executado aqui */')
        ]
      },
      questions: [
        mcq('q1', 'Uma listagem tem 200 mil registros e a tela baixa todos para ordenar no navegador. Qual é a melhor mudança?', 'b', [
          'Baixar tudo uma vez e guardar em localStorage, para que as próximas ordenações sejam instantâneas.',
          'Mover paginação, ordenação e filtro para o servidor, que devolve só a página pedida.',
          'Reduzir o tamanho da fonte da tabela para que o navegador desenhe as linhas mais rápido.',
          'Ordenar com mais de um sort no cliente, em sequência, para diminuir o trabalho de cada passada.'
        ], 'Com dados grandes o gargalo é transferir e manter tudo no cliente; o servidor entrega só o necessário. localStorage não comporta esse volume e ainda cria problemas de privacidade, fonte menor não reduz o trabalho e ordenar várias vezes não evita baixar tudo.'),
        mcq('q2', 'Uma pessoa filtra a tabela, copia o link, envia a um colega e este vê a tabela sem filtro. Qual é a causa?', 'd', [
          'O colega usa um navegador diferente, e links com filtro funcionam apenas dentro do mesmo navegador.',
          'O servidor apagou o filtro quando o primeiro usuário saiu da página, então ele não pode ser reaproveitado.',
          'A tabela está sem caption, o que impede o compartilhamento do estado entre pessoas.',
          'O estado do filtro estava só em memória do componente, e não na URL, por isso o link não o carrega.'
        ], 'Estado guardado em useState, ref ou signal desaparece ao recarregar ou abrir em outro lugar; query params na URL tornam a tela reproduzível. Navegadores diferentes leem a mesma URL, o servidor não guarda filtros de tela e o caption trata de acessibilidade.'),
        mcq('q3', 'A API recebe ?sort=<coluna> e usa o texto direto na ordenação da consulta. Qual é o risco e a correção?', 'a', [
          'O nome da coluna vem da pessoa e pode alterar a consulta; aceite só colunas de uma lista fechada.',
          'Não há risco, pois nomes de coluna são texto simples que o banco trata como seguro, ao contrário de valores.',
          'O risco é de lentidão; basta criar índices nas colunas que as pessoas mais costumam ordenar.',
          'O risco é no navegador; basta aplicar encodeURIComponent no cliente antes de colocar o nome na URL.'
        ], 'Nomes de coluna não podem ser parametrizados como valores, então a defesa é uma allowlist no servidor, como o SORTABLE do exemplo. Índices tratam desempenho e não segurança, e a codificação no cliente não vale para quem chama a API direto.'),
        fill('q4', 'Complete o atributo que liga a célula de cabeçalho às células da coluna, para leitores de tela.', '<th scope="___">Nome</th>', ['col'], 'scope="col" declara que o cabeçalho descreve a coluna inteira (e scope="row" descreveria a linha), permitindo que o leitor de tela anuncie o cabeçalho ao navegar pelas células.'),
        mcq('q5', 'Na terceira chamada do exemplo executável (q "a", sort "senha", page 99), por que a resposta traz Elisa e Gabi na página 2?', 'c', [
          'O filtro q="a" ordena os nomes por ordem alfabética inversa, e por isso a página 99 vira a página 2.',
          'O servidor devolveu a página 99 vazia e o cliente a trocou pela página 2 por conta própria.',
          'A coluna "senha" não é permitida e a ordenação caiu em id; a página 99 foi limitada à última existente.',
          'A coluna "senha" foi usada para ordenar e a ordem dessa coluna colocou Elisa e Gabi no fim da lista.'
        ], 'O código troca colunas não permitidas pelo id e limita page ao intervalo válido de 1 até o total de páginas, que com 5 resultados e tamanho 3 é 2. O filtro não ordena, nada é feito pelo cliente nessa simulação e a coluna senha nem existe nos dados.'),
        mcq('q6', 'O botão "Excluir" fica escondido para quem não é administrador. Isso basta para proteger a exclusão?', 'b', [
          'Sim, pois sem o botão visível a pessoa não tem como disparar a requisição de exclusão pela interface.',
          'Não: esconder o botão é só UX, e o servidor precisa verificar a permissão em cada requisição de exclusão.',
          'Sim, desde que o botão também tenha o atributo disabled enquanto a pessoa não for administradora do sistema.',
          'Não, mas basta conferir a permissão uma vez no login e guardá-la no localStorage para as próximas telas.'
        ], 'Qualquer pessoa pode chamar a API diretamente, então a autorização tem de estar no servidor, a cada requisição. Esconder ou desabilitar o botão e guardar permissão no navegador são controles do lado que a pessoa manipula.'),
        mcq('q7', 'Uma lista com 20 mil linhas em rolagem contínua trava o navegador. O que a virtualização faz?', 'a', [
          'Renderiza só as linhas visíveis (mais uma margem) e reaproveita os elementos conforme a pessoa rola.',
          'Carrega as 20 mil linhas escondidas com display none e as vai mostrando aos poucos conforme a rolagem.',
          'Move a ordenação e o filtro para o servidor, que devolve só uma página por vez.',
          'Comprime os dados da lista antes de desenhar, reduzindo o número de bytes mantidos na memória do navegador.'
        ], 'Virtualização limita o número de elementos no DOM aos que a pessoa vê. Esconder com display none mantém os elementos no DOM, mover consulta para o servidor é paginação (outra técnica) e comprimir dados não reduz a quantidade de elementos desenhados.'),
        fill('q8', 'Complete o atributo que informa o estado de ordenação de uma coluna crescente.', '<th scope="col" aria-sort="___"><button type="button">Pontos</button></th>', ['ascending'], 'aria-sort aceita ascending, descending, none e other; "ascending" informa aos leitores de tela que a coluna está ordenada de forma crescente.')
      ]
    },
    {
      id: 'fii-34-acessibilidade-intermediaria',
      title: 'Acessibilidade intermediária',
      goal: 'Gerenciar foco, construir modais acessíveis, usar ARIA em componentes customizados, anunciar mudanças com live regions e automatizar testes de acessibilidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Gestão de foco',
            'O foco é o elemento que recebe o teclado agora. Pessoas que usam teclado e leitor de tela dependem dele para saber onde estão. Em SPAs, trocar de rota ou abrir um painel não move o foco sozinho: a pessoa fica "perdida". Regras: depois de uma navegação, leve o foco para o título da nova página (com tabindex="-1" no h1 para poder focar por código); depois de abrir um diálogo, foque o primeiro elemento útil; ao fechar, devolva o foco para quem abriu. Em React use ref.focus() dentro de um efeito; em Vue, uma ref de template e nextTick; em Angular, @ViewChild ou o ElementRef com nativeElement.focus(). Nunca remova o contorno de foco (outline: none) sem oferecer um estilo visível equivalente.',
            '// ilustrativo, não executado aqui (React)\nconst titulo = useRef(null);\nuseEffect(() => { titulo.current?.focus(); }, [rota]);\n\nreturn <h1 ref={titulo} tabIndex={-1}>Pedidos</h1>;'
          ),
          sl(
            'Modais e diálogos',
            'Um modal bem feito tem: papel de diálogo (o elemento nativo <dialog> aberto com showModal() já cuida de muita coisa, ou role="dialog" com aria-modal="true"), um nome acessível (aria-labelledby apontando para o título), foco movido para dentro ao abrir, foco PRESO dentro enquanto aberto (Tab e Shift+Tab circulam nos elementos do diálogo), fechamento pela tecla Esc e devolução do foco ao elemento que o abriu. O conteúdo de fundo deve ficar inacessível (inert ou aria-hidden). Bibliotecas de componentes acessíveis (Radix, Headless UI, Angular CDK, Vue equivalentes) já implementam isso: usar uma delas costuma ser mais seguro do que escrever do zero.',
            '<!-- ilustrativo, não executado aqui -->\n<dialog id="confirma" aria-labelledby="titulo-confirma">\n  <h2 id="titulo-confirma">Excluir item?</h2>\n  <button>Cancelar</button>\n  <button>Excluir</button>\n</dialog>\n<script>\n  // abrir: document.getElementById(\'confirma\').showModal();\n  // Esc fecha; o foco volta ao botão que abriu (guarde a referência)\n</script>'
          ),
          sl(
            'ARIA em componentes customizados',
            'ARIA (Accessible Rich Internet Applications) é um conjunto de atributos que descrevem papéis e estados a tecnologias assistivas. A primeira regra de ARIA: se existe um elemento HTML nativo com o comportamento que você quer (button, a, input, details), USE-O em vez de recriar com div e ARIA. Quando precisar de um componente customizado, é preciso o conjunto completo: papel (role), estado (aria-expanded, aria-selected, aria-checked), relação (aria-controls, aria-labelledby, aria-describedby) E o comportamento de teclado esperado (setas, Enter, Espaço, Esc). Só colocar role="button" numa div não dá foco nem Enter: ARIA muda o que se ANUNCIA, não o que o elemento FAZ. ARIA errada é pior do que nenhuma.',
            '<!-- ilustrativo, não executado aqui: botão que expande um painel -->\n<button aria-expanded="false" aria-controls="detalhes">Ver detalhes</button>\n<div id="detalhes" hidden>Conteúdo do painel</div>'
          ),
          sl(
            'Live regions: anunciar mudanças',
            'Quando algo muda na tela sem que o foco se mova (mensagem de sucesso, erro de validação, contagem de resultados, notificação), leitores de tela não percebem sozinhos. Uma live region é um elemento com aria-live: o conteúdo mudado nele é lido em voz alta. aria-live="polite" espera a pessoa terminar o que está ouvindo (use na maioria dos casos); "assertive" interrompe (reserve para urgências); role="status" equivale a polite e role="alert" a assertive. Detalhe importante: a região já deve existir na página ANTES de o texto mudar. Angular tem LiveAnnouncer no CDK; em React e Vue basta renderizar a região e atualizar o texto dela.',
            '<!-- ilustrativo, não executado aqui -->\n<div role="status" aria-live="polite">{mensagem}</div>\n<!-- ao salvar, mensagem muda para "Perfil salvo" e é anunciada -->'
          ),
          sl(
            'Testes automatizados de acessibilidade',
            'Camadas de verificação: 1) lint de código, com eslint-plugin-jsx-a11y (React), eslint-plugin-vuejs-accessibility (Vue) e as regras de template de acessibilidade do angular-eslint, que pegam img sem alt, label ausente, handlers de clique em elementos não interativos; 2) testes de componente com consultas por papel e verificadores baseados no axe; 3) auditorias como Lighthouse e a extensão do axe no navegador; 4) testes E2E com axe nas páginas principais. Nada disso substitui o teste manual: navegar só com o teclado, ampliar o zoom, usar um leitor de tela. Automação costuma achar só parte dos problemas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Depois de uma navegação de rota em uma SPA, o que ajuda quem usa leitor de tela e teclado?', 'd', ['Manter o foco no link clicado, que desapareceu da tela com a página anterior', 'Remover o contorno de foco para não distrair a pessoa com bordas visuais', 'Reiniciar o navegador para que o foco volte à barra de endereço automaticamente', 'Mover o foco para o título da nova página (tabindex="-1")'], 'A SPA não move o foco sozinha; focar o título orienta a pessoa na nova tela. Manter o foco num elemento removido ou apagar o contorno desorienta, e reiniciar o navegador não é solução.'),
        mcq('q2', 'Qual item NÃO faz parte de um modal acessível?', 'b', ['Devolver o foco ao botão que abriu o diálogo depois que ele é fechado', 'Permitir que o Tab saia do diálogo e navegue pelo conteúdo de fundo enquanto ele está aberto', 'Fechar o diálogo ao pressionar a tecla Esc, sem exigir o uso do mouse', 'Dar ao diálogo um nome acessível, apontando aria-labelledby para o título'], 'Durante um modal, o foco deve ficar preso nele e o fundo inacessível. Devolver o foco, fechar com Esc e nomear o diálogo são parte do padrão.'),
        mcq('q3', 'Uma equipe cria um botão com <div role="button">. O que ainda falta para funcionar como botão?', 'c', ['Nada, pois o role já dá foco e ativação por teclado automaticamente', 'Só o atributo aria-label, que ativa o clique pelo teclado', 'Foco por teclado e resposta a Enter e Espaço; melhor usar <button>', 'Uma classe CSS com cursor pointer para os leitores de tela reconhecerem'], 'ARIA muda o que é anunciado, não o comportamento: foco e teclado precisam ser implementados. O elemento nativo já traz tudo. aria-label e cursor pointer não dão ativação por teclado.'),
        fill('q4', 'Complete o atributo ARIA que indica a um leitor de tela se o painel controlado pelo botão está aberto ou fechado.', '<button aria-___="false" aria-controls="detalhes">Ver detalhes</button>', ['expanded'], 'aria-expanded informa o estado de expansão (true/false) do elemento controlado, e aria-controls aponta qual elemento é controlado.'),
        mcq('q5', 'Quando usar aria-live="assertive" em vez de polite?', 'a', ['Em avisos urgentes que precisam interromper a leitura', 'Nas mensagens de sucesso, para garantir que sejam ouvidas primeiro', 'Quando o texto da mensagem for longo e precisar de mais tempo de leitura', 'Em qualquer região que tenha ícones, já que ícones são lidos de forma diferente'], 'Assertive interrompe o que está sendo lido e deve ficar reservado para urgências. Mensagens comuns usam polite; o tamanho do texto ou a presença de ícones não definem a escolha.'),
        mcq('q6', 'Por que a região aria-live deve existir na página antes de o texto mudar?', 'a', ['Porque leitores de tela observam mudanças em regiões já registradas; criar a região junto com o texto pode não ser anunciado', 'Porque o navegador só renderiza elementos com aria-live depois do carregamento completo', 'Porque a região precisa receber foco do teclado antes de qualquer atualização', 'Porque o framework só atualiza elementos criados na montagem inicial do componente'], 'Tecnologias assistivas monitoram regiões já presentes no DOM. Foco no elemento não é requisito, e frameworks atualizam elementos criados depois normalmente.'),
        mcq('q7', 'O verificador automático axe não encontrou problemas na página. Qual conclusão é correta?', 'b', ['A página atende aos requisitos de acessibilidade e pode ser publicada sem revisão', 'Que não achou falhas automatizáveis; teclado e leitor pedem teste manual', 'A navegação por teclado foi aprovada, porque axe testa a sequência de Tab', 'O contraste e o texto alternativo foram aprovados por pessoas com deficiência'], 'Ferramentas automáticas detectam só parte dos problemas e não substituem o uso real com teclado e leitor de tela. Elas não representam validação por pessoas nem garantem conformidade completa.'),
        fill('q8', 'Complete a propriedade que o elemento nativo <dialog> usa para abrir como modal, com foco e fundo tratados pelo navegador.', 'document.getElementById(\'confirma\').___();', ['showModal'], 'showModal() abre o dialog como modal: fundo inerte, Esc para fechar e foco gerenciado pelo navegador.')
      ]
    },
    {
      id: 'fii-35-internacionalizacao',
      title: 'Internacionalização (i18n)',
      goal: 'Traduzir interfaces com as bibliotecas de cada framework e formatar plurais, datas e números com a API Intl; noções de RTL.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'i18n, l10n e o que muda além do texto',
            'Internacionalização (i18n) é preparar a aplicação para vários idiomas e regiões; localização (l10n) é adaptar para uma região específica. Além de traduzir textos, mudam plural ("1 item", "2 itens"), ordem e formato de datas (03/11/2026 x 11/3/2026), separadores de números (1.234,56 x 1,234.56), moeda, ordenação alfabética, direção de leitura. Regra prática: nunca concatene pedaços de frase em código ("Olá " + nome + ", você tem " + n + " mensagens"), porque a ordem das palavras muda entre idiomas. Use mensagens completas, com parâmetros, e mantenha as traduções em arquivos separados por idioma.'
          ),
          sl(
            'Bibliotecas por nome, nos três frameworks',
            'React: react-intl (FormatJS) e i18next com react-i18next. Vue: vue-i18n, a biblioteca de i18n mais usada do ecossistema. Angular: i18n nativo do framework, que marca textos no template e gera arquivos de tradução em tempo de build (um build por idioma), e bibliotecas de tradução em tempo de execução como ngx-translate ou Transloco. Todas seguem o mesmo padrão: uma CHAVE ou mensagem no código, um arquivo por idioma e uma função ou componente que busca o texto. Confira a documentação da versão em uso. Escolha por: troca de idioma sem recarregar, tamanho do bundle, suporte a plural e integração com o meta-framework.',
            '// ilustrativo, não executado aqui\n// arquivos de mensagens\n// pt-BR.json: { "saudacao": "Olá, {nome}!" }\n// en.json:    { "saudacao": "Hello, {nome}!" }\n\n// Vue (vue-i18n):  {{ $t(\'saudacao\', { nome: usuario.nome }) }}\n// React (i18next): {t(\'saudacao\', { nome: usuario.nome })}\n// Angular (Transloco): {{ \'saudacao\' | transloco: { nome: usuario.nome } }}'
          ),
          sl(
            'Pluralização',
            'Em português, há duas formas (1 item, 2 itens). Outros idiomas têm mais categorias (o russo e o árabe, por exemplo, têm várias formas). Por isso as bibliotecas usam a sintaxe ICU MessageFormat ou regras equivalentes: você escreve as variações dentro da mensagem e a biblioteca escolhe com base na regra do idioma. O navegador e o Node oferecem a regra pronta em Intl.PluralRules, que devolve a categoria (one, other...) para um número. Não escreva "if (n === 1)" espalhado pelo código: não funciona em todos os idiomas (repare na saída: em pt-BR o zero cai na categoria one, "0 item").',
            'const plural = new Intl.PluralRules(\'pt-BR\');\nconst msgs = { one: \'item\', other: \'itens\' };\nfor (const n of [0, 1, 2, 5]) {\n  console.log(n, plural.select(n), \'->\', n + \' \' + msgs[plural.select(n)]);\n}\n\n// saída real (Node):\n// 0 one -> 0 item\n// 1 one -> 1 item\n// 2 other -> 2 itens\n// 5 other -> 5 itens'
          ),
          sl(
            'Datas, números e moedas com Intl',
            'A API Intl, nativa em navegadores e Node, formata sem biblioteca: Intl.NumberFormat para números e moedas, Intl.DateTimeFormat para datas e horas, Intl.RelativeTimeFormat para "há 3 dias", Intl.ListFormat para listas. Sempre passe o locale (pt-BR, en-US) e, para datas, o fuso (timeZone) quando o resultado precisa ser determinístico. Um erro comum é montar a data na mão com getDate()/getMonth(), que ignora o formato local. Guardar e trafegar datas em formato padrão (ISO 8601, em UTC) e formatar só na exibição evita confusões de fuso.',
            'const valor = 1234567.891;\nconsole.log(new Intl.NumberFormat(\'pt-BR\').format(valor));\nconsole.log(new Intl.NumberFormat(\'en-US\').format(valor));\nconsole.log(new Intl.NumberFormat(\'pt-BR\', { style: \'currency\', currency: \'BRL\' }).format(1234.5));\nconst data = new Date(\'2026-11-03T15:30:00Z\');\nconsole.log(new Intl.DateTimeFormat(\'pt-BR\', { dateStyle: \'long\', timeZone: \'UTC\' }).format(data));\nconsole.log(new Intl.DateTimeFormat(\'en-US\', { dateStyle: \'long\', timeZone: \'UTC\' }).format(data));\n\n// saída real (Node):\n// 1.234.567,891\n// 1,234,567.891\n// R$ 1.234,50\n// 3 de novembro de 2026\n// November 3, 2026'
          ),
          sl(
            'RTL e boas práticas',
            'Idiomas como árabe e hebraico são lidos da direita para a esquerda (RTL). Para suportar, defina dir="rtl" no elemento html e use propriedades CSS lógicas (margin-inline-start, padding-inline-end, text-align: start) no lugar de left/right, para o layout espelhar sozinho. Ícones direcionais (setas) também precisam espelhar. Outras boas práticas: prever que textos traduzidos podem ser bem mais longos (não fixar largura de botões), declarar lang no HTML (ajuda leitores de tela e tradutores), não embutir texto em imagens e não deixar a escolha de idioma só pelo IP: respeite a preferência do navegador (Accept-Language) e permita trocar manualmente. Idioma e região escolhidos são uma preferência: guarde só o necessário.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que não é recomendado montar frases juntando pedaços de texto com + no código?', 'c', ['O operador + é proibido em strings pelas bibliotecas de i18n nos frameworks', 'A concatenação deixa o bundle com tamanho maior que o das mensagens completas', 'A ordem das palavras muda entre idiomas, então a mensagem precisa ser completa e com parâmetros', 'A concatenação impede que as palavras sejam exibidas com acentos corretamente'], 'Em outros idiomas a estrutura da frase é diferente, então só mensagens completas com parâmetros se traduzem bem. O operador não é proibido, o tamanho do bundle não é o motivo e acentos não dependem de concatenação.'),
        mcq('q2', 'Qual biblioteca de i18n é citada para Vue?', 'd', ['react-intl, usada para tradução em projetos Vue por meio de um adaptador oficial', 'Transloco, que é a biblioteca recomendada pela documentação oficial do Vue', 'Intl.PluralRules, que carrega os arquivos de tradução por idioma automaticamente', 'vue-i18n'], 'vue-i18n é a biblioteca de i18n mais usada em Vue. react-intl é do ecossistema React, Transloco é do Angular e Intl.PluralRules é uma API nativa de regras de plural, sem carregar arquivos.'),
        mcq('q3', 'Como o Angular trata o i18n nativo do framework, segundo a lição?', 'd', ['Troca o idioma só no navegador, por meio de uma única variável global do window', 'Traduz sozinho qualquer texto, sem marcações nem arquivos de tradução', 'Exige que os textos fiquem dentro do código TypeScript, não nos templates', 'Marca textos no template e gera um build por idioma'], 'O i18n nativo marca textos no template, extrai arquivos e gera um build por idioma. Não é uma variável global, não traduz sozinho e não exige textos fora dos templates.'),
        fill('q4', 'Complete a API nativa que escolhe a categoria de plural (one, other...) para um número em um idioma.', 'const plural = new Intl.___(\'pt-BR\');\nplural.select(2); // "other"', ['PluralRules'], 'Intl.PluralRules devolve a categoria de plural segundo as regras do idioma; é a base das mensagens com plural.'),
        mcq('q5', 'Qual escolha produz a mesma data formatada de maneira previsível em qualquer máquina?', 'a', ['Intl.DateTimeFormat com locale e timeZone explícitos', 'Montar a data com getDate() e getMonth() na mão, sem informar fuso nem formato', 'Deixar o navegador decidir tudo e comparar o texto da data nos testes', 'Guardar a data já formatada como texto no banco, no idioma de quem a criou'], 'Informar locale e fuso explicitamente com Intl dá resultado determinístico. Montagem manual ignora o formato local, depender do navegador varia por máquina e guardar texto formatado atrapalha outros idiomas.'),
        mcq('q6', 'Para um layout que também funcione em RTL, qual prática de CSS é a recomendada?', 'b', ['Escrever uma folha de estilo duplicada com os valores de left e right trocados à mão', 'Usar propriedades lógicas como margin-inline-start no lugar de margin-left', 'Fixar a largura dos elementos em pixels para o texto não se mover', 'Usar position: absolute nos elementos, com coordenadas calculadas por script'], 'Propriedades lógicas se adaptam à direção de escrita automaticamente. Duplicar estilos aumenta a manutenção, larguras fixas quebram com textos traduzidos e posição absoluta em tudo é frágil.'),
        mcq('q7', 'Qual atitude respeita melhor a pessoa usuária ao escolher o idioma inicial?', 'c', ['Decidir o idioma só pelo IP e impedir a troca para evitar confusão nas telas', 'Registrar o idioma junto do nome e da localização exata em cada acesso', 'Usar a preferência do navegador (Accept-Language) e permitir troca manual, guardando só a escolha necessária', 'Enviar o idioma a um serviço de terceiros para criar um perfil detalhado'], 'A preferência do navegador com troca manual é o caminho mais respeitoso. Decidir só pelo IP sem troca é limitante, e coletar localização exata ou criar perfil é coleta excessiva de dados pessoais.'),
        fill('q8', 'Complete o atributo HTML que declara o idioma da página, útil para leitores de tela e tradutores.', '<html ___="pt-BR">', ['lang'], 'O atributo lang no elemento html declara o idioma principal; leitores de tela o usam para escolher a pronúncia correta.')
      ]
    },
    {
      id: 'fii-36-animacoes-e-transicoes',
      title: 'Animações e transições',
      goal: 'Usar transições e animações CSS com bom desempenho, respeitar prefers-reduced-motion e aplicar transições nos três frameworks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Transition e animation no CSS',
            'Há duas ferramentas nativas. Uma TRANSITION suaviza a mudança de uma propriedade entre dois estados quando algo a altera (passar o mouse, trocar uma classe): você declara transition: opacity 200ms ease e o navegador interpola. Uma ANIMATION usa @keyframes, descreve vários passos e pode rodar sozinha, repetir e alternar (animation: pulsar 1s infinite). Regra de escolha: transição para reagir a uma mudança de estado (abrir menu, hover); animação para algo que se move por conta própria (indicador de carregamento). Erro comum: usar display: none junto com transição, pois display não é interpolável e o efeito some; combine opacity com visibility ou use o atributo hidden com cuidado.',
            '/* ilustrativo, não executado aqui */\n.painel { opacity: 0; transform: translateY(8px); transition: opacity 200ms ease, transform 200ms ease; }\n.painel.aberto { opacity: 1; transform: translateY(0); }\n\n@keyframes girar { to { transform: rotate(360deg); } }\n.carregando { animation: girar 1s linear infinite; }'
          ),
          sl(
            'Desempenho: o que animar',
            'O navegador percorre etapas: layout (calcular tamanhos e posições), pintura (desenhar pixels) e composição (juntar camadas). Animar width, height, top, left ou margin força recalcular o layout de muita coisa a cada quadro e causa travadas. Já transform (mover, escalar, girar) e opacity podem ser feitas só na etapa de composição, muitas vezes pela placa de vídeo, ficando suaves. Regra prática: anime transform e opacity; para "mover" use translate em vez de left. Use will-change com parcimônia (reserva memória), só em elementos que realmente vão animar. Meça no painel de desempenho do navegador em vez de supor.'
          ),
          sl(
            'Acessibilidade: prefers-reduced-motion',
            'Movimento intenso pode causar desconforto, tontura ou náusea em pessoas com distúrbios vestibulares, e distrai quem tem dificuldade de atenção. Sistemas operacionais têm a opção "reduzir movimento", e o CSS a lê com a media query prefers-reduced-motion. Boa prática: ofereça uma versão sem movimento (ou só com fade) quando essa preferência estiver ativa. Nunca dependa de animação para transmitir informação essencial, e evite piscar mais de três vezes por segundo (risco para pessoas com epilepsia fotossensível).',
            '/* ilustrativo, não executado aqui */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n}'
          ),
          sl(
            'Transições nos três frameworks',
            'React puro não tem componente de transição: troque classes CSS conforme o estado, ou use uma biblioteca como Motion (antes Framer Motion) ou React Transition Group; o problema de saída (animar antes de remover do DOM) é o difícil. Vue traz <Transition> e <TransitionGroup> prontos: ao entrar/sair um elemento, o Vue aplica classes (v-enter-active, v-leave-to...) e você escreve o CSS. Angular tem o pacote de animações (trigger, state, transition) e, em versões recentes, recursos mais simples ligados a classes de entrada e saída; confira a documentação da versão. Bibliotecas por nome: GSAP, Motion, Lottie (animações exportadas do design) e AutoAnimate.',
            '<!-- ilustrativo, não executado aqui (Vue) -->\n<Transition name="fade">\n  <p v-if="aberto">Conteúdo</p>\n</Transition>\n\n<style>\n.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }\n.fade-enter-from, .fade-leave-to { opacity: 0; }\n</style>'
          ),
          sl(
            'Curva de aceleração (easing) na prática',
            'Easing define como a velocidade varia ao longo do tempo: linear é constante, ease-in começa devagar, ease-out termina devagar, ease-in-out faz os dois. Para interfaces, ease-out costuma parecer mais natural ao ENTRAR algo, e durações curtas (cerca de 150 a 300 ms) mantêm a interface ágil. O código abaixo, em JavaScript puro, calcula o progresso de uma animação de 5 quadros com linear e com uma curva ease-in-out simples (suavização cúbica), para mostrar como a interpolação funciona.',
            'const linear = (t) => t;\nconst easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);\nconst quadros = [0, 0.25, 0.5, 0.75, 1];\nconsole.log(\'t     linear  easeInOut\');\nfor (const t of quadros) {\n  console.log(String(t).padEnd(5), linear(t).toFixed(3).padEnd(7), easeInOut(t).toFixed(3));\n}\n// deslocamento de 100 px com easeInOut\nconsole.log(quadros.map((t) => Math.round(100 * easeInOut(t)) + \'px\').join(\' -> \'));\n\n// saída real (Node):\n// t     linear  easeInOut\n// 0     0.000   0.000\n// 0.25  0.250   0.063\n// 0.5   0.500   0.500\n// 0.75  0.750   0.938\n// 1     1.000   1.000\n// 0px -> 6px -> 50px -> 94px -> 100px'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe quer que um painel apareça suavemente quando uma classe é adicionada. Qual recurso é o mais adequado?', 'd', ['Um @keyframes com animation-iteration-count infinite que reinicia o painel a cada segundo', 'Alterar display de none para block, pois display é interpolado pelo navegador', 'Um laço setInterval que altera o estilo do painel a cada milissegundo', 'Uma transição CSS (transition) sobre opacity e transform'], 'Transições reagem a mudanças de estado, como a troca de classe. Keyframes infinitos repetiriam o movimento, display não é interpolável e setInterval é ineficiente e desnecessário.'),
        mcq('q2', 'Qual par de propriedades é o mais indicado para animar com bom desempenho?', 'c', ['width e height, que são recalculadas pela placa de vídeo sem tocar no layout', 'top e left, que movem elementos sem exigir novo cálculo de posição da página', 'transform e opacity, que podem ser tratadas na etapa de composição', 'margin e padding, que são interpolados na etapa de pintura'], 'transform e opacity evitam recalcular o layout. width/height, top/left e margin/padding disparam recálculo de layout (e pintura) a cada quadro.'),
        mcq('q3', 'Para que serve a media query prefers-reduced-motion?', 'a', ['Detectar o pedido de menos movimento e oferecer versão sem animações', 'Medir a velocidade da conexão e reduzir o tamanho das imagens para carregar mais rápido', 'Diminuir a taxa de quadros do monitor para economizar a energia do notebook inteiro', 'Pausar vídeos de qualquer site aberto em outra aba do navegador do visitante'], 'A media query lê a preferência de reduzir movimento do sistema. Ela não mede conexão, não altera o monitor e não controla vídeos de outras abas.'),
        fill('q4', 'Complete a media query que detecta a preferência do sistema por menos movimento.', '@media (___: reduce) { .banner { animation: none; } }', ['prefers-reduced-motion'], 'prefers-reduced-motion: reduce é verdadeira quando a pessoa pediu para reduzir animações; é o ponto para desligar ou simplificar o movimento.'),
        mcq('q5', 'Qual componente o Vue oferece para animar elementos que entram e saem do DOM?', 'b', ['<Animate>, que gera os quadros do movimento automaticamente a partir do texto', '<Transition>, que aplica classes de entrada e saída e você define o CSS delas', '<Fade>, que só funciona com a Options API e exige um plugin de terceiros', '<Teleport>, que move o elemento animando-o até outra parte do documento'], '<Transition> (e <TransitionGroup>) cuidam das classes de entrada e saída. <Animate> e <Fade> não existem no núcleo do Vue, e <Teleport> apenas renderiza em outro ponto do DOM, sem animar.'),
        mcq('q6', 'Por que animar "left" costuma travar mais do que animar "transform: translateX"?', 'c', ['left é interpretado pelo JavaScript, que roda mais devagar que o CSS em qualquer situação', 'transform usa menos memória por não criar nenhuma camada de composição', 'Mudar left recalcula o layout a cada quadro; transform evita isso', 'left só funciona em elementos com position: static, o que impede a animação'], 'A diferença está no custo de layout. left não é executado por JavaScript, transform pode usar camada de composição e left funciona em elementos posicionados, não estáticos.'),
        mcq('q7', 'Qual cuidado vale para o conteúdo essencial de um site animado?', 'a', ['Não depender só de movimento e evitar luzes piscando rápido', 'Colocar o texto importante dentro da animação, para ser notado com mais facilidade', 'Aumentar a velocidade das animações para durarem menos de dez milissegundos', 'Repetir a animação em ciclo, para a pessoa não perder a informação'], 'A informação precisa estar disponível sem depender do movimento, e piscar rápido é risco de crises. Esconder texto na animação, durações de poucos ms ou ciclos infinitos prejudicam.'),
        fill('q8', 'Complete a propriedade CSS que suaviza a mudança de uma propriedade entre dois estados.', '.botao { ___: background-color 200ms ease; }', ['transition'], 'transition define quais propriedades interpolam, a duração e a curva; é a ferramenta para reagir a mudanças de estado como hover ou troca de classe.')
      ]
    },
    {
      id: 'fii-37-graficos-e-visualizacao-de-dados',
      title: 'Gráficos e visualização de dados',
      goal: 'Escolher entre SVG e Canvas, conhecer bibliotecas, tornar gráficos acessíveis, lidar com grandes volumes e transformar dados antes de desenhar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'SVG x Canvas',
            'Dois jeitos nativos de desenhar. SVG é um formato vetorial em que cada forma (círculo, linha, texto) é um ELEMENTO do DOM: dá para estilizar com CSS, ouvir eventos em cada barra, o leitor de tela consegue ler textos, e escala sem perder qualidade. O custo: milhares de elementos pesam. Canvas é uma superfície de pixels desenhada por JavaScript: não há elementos individuais (só pixels), então eventos e acessibilidade exigem trabalho extra, mas desenha dezenas de milhares de pontos com folga. Regra prática: poucos a algumas centenas de elementos e interatividade rica, SVG; muitos pontos ou atualização rápida, Canvas (ou WebGL para volumes muito grandes).'
          ),
          sl(
            'Bibliotecas por nome',
            'D3 é um conjunto de ferramentas de baixo nível (escalas, formas, transformação de dados) que dá controle total, mas exige mais código; muitas vezes se usa só as escalas do D3 com o desenho feito pelo framework. Chart.js desenha em Canvas com gráficos prontos; Recharts (React) e ECharts (várias plataformas, com Canvas e opção de SVG) cobrem gráficos configuráveis; Plotly oferece gráficos científicos. Para Vue existem adaptadores (vue-chartjs, vue-echarts) e para Angular, ngx-charts e wrappers das mesmas bibliotecas. Escolha por: tipos de gráfico necessários, volume de dados, acessibilidade oferecida, tamanho no bundle (carregue com lazy loading) e licença. Confira a documentação.'
          ),
          sl(
            'Acessibilidade de gráficos',
            'Um gráfico é uma imagem para um leitor de tela, a menos que você ofereça o conteúdo de outra forma. Boas práticas: dê um resumo (role="img" com aria-label ou <title> e <desc> no SVG descrevendo a conclusão: "Vendas cresceram em cada trimestre"); ofereça os mesmos dados em uma TABELA (visível ou em um botão "ver dados"); nunca use só cor para diferenciar séries (acrescente rótulos, padrões ou formas diferentes) e verifique o contraste; garanta rótulos legíveis e navegação por teclado nos pontos interativos quando houver interação. Dados pessoais em gráficos: prefira agregações e evite expor indivíduos.',
            '<!-- ilustrativo, não executado aqui -->\n<svg role="img" aria-labelledby="t d" viewBox="0 0 200 100">\n  <title id="t">Pedidos por mês</title>\n  <desc id="d">Os pedidos subiram de 10 em janeiro para 30 em março.</desc>\n  <rect x="10" y="80" width="40" height="20" />\n  <rect x="80" y="60" width="40" height="40" />\n  <rect x="150" y="20" width="40" height="80" />\n</svg>'
          ),
          sl(
            'Grandes volumes de dados',
            'Desenhar um milhão de pontos é desperdício: a tela tem poucos milhares de pixels de largura. Estratégias: agregar no servidor (média por hora em vez de cada leitura), reduzir a amostra antes de desenhar (por exemplo, um ponto por faixa de pixels, mantendo mínimo e máximo), usar Canvas ou WebGL em vez de SVG, desenhar só o que está visível (zoom e janela), paginar ou carregar sob demanda, e mover cálculos pesados para um Web Worker para não travar a interface. Carregue a biblioteca de gráficos com lazy loading, pois ela costuma pesar no bundle.'
          ),
          sl(
            'Transformar dados antes de desenhar',
            'Quase todo gráfico exige preparar os dados: agrupar, somar, calcular médias, ordenar, preencher meses vazios. Faça isso em funções puras, fáceis de testar, separadas do componente. O exemplo agrupa pedidos fictícios por mês e depois reduz uma série longa em faixas pela média, mostrando como diminuir o volume sem perder a tendência.',
            'const pedidos = [\n  { mes: \'2026-01\', valor: 120 }, { mes: \'2026-01\', valor: 80 },\n  { mes: \'2026-02\', valor: 200 }, { mes: \'2026-03\', valor: 90 }, { mes: \'2026-03\', valor: 110 }\n];\nconst porMes = pedidos.reduce((acc, p) => { acc[p.mes] = (acc[p.mes] || 0) + p.valor; return acc; }, {});\nconsole.log(porMes);\n\n// reduzir 12 pontos em 4 faixas pela média\nconst serie = [1, 3, 2, 4, 6, 5, 7, 9, 8, 10, 12, 11];\nconst reduz = (arr, n) => {\n  const t = arr.length / n; const r = [];\n  for (let i = 0; i < n; i++) {\n    const f = arr.slice(i * t, (i + 1) * t);\n    r.push(+(f.reduce((a, b) => a + b, 0) / f.length).toFixed(2));\n  }\n  return r;\n};\nconsole.log(reduz(serie, 4));\n\n// saída real (Node):\n// { \'2026-01\': 200, \'2026-02\': 200, \'2026-03\': 200 }\n// [ 2, 5, 8, 11 ]'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um painel precisa desenhar cem mil pontos que se atualizam rapidamente. Qual tecnologia é mais adequada?', 'b', ['SVG, com um elemento <circle> para cada ponto, já que o DOM lida bem com qualquer volume', 'Canvas (ou WebGL), pois não cria um elemento do DOM para cada ponto', 'SVG com cem mil animações CSS independentes, uma para cada ponto do gráfico', 'Uma tabela HTML com uma célula colorida para cada ponto desenhado'], 'Canvas desenha pixels sem custo por elemento. Cem mil nós de DOM (em SVG ou tabela) pesam muito e as animações individuais agravam o problema.'),
        mcq('q2', 'Qual é uma vantagem do SVG para gráficos pequenos e interativos?', 'd', ['Ele desenha mais rápido do que o Canvas, independentemente da quantidade de formas', 'Ele guarda pixels, o que o torna menor e mais barato de renderizar em telas grandes', 'Ele dispensa qualquer descrição, pois o leitor de tela interpreta o desenho sozinho', 'Cada forma é um elemento do DOM, que aceita CSS, eventos e texto legível por leitor de tela'], 'As formas do SVG são elementos manipuláveis e acessíveis. Ele não é mais rápido em grandes volumes, guarda formas vetoriais (não pixels) e continua precisando de descrição.'),
        mcq('q3', 'Qual prática torna um gráfico de barras mais acessível?', 'b', ['Diferenciar as séries por cores muito próximas, que ficam mais elegantes', 'Incluir um resumo textual e oferecer os dados também em uma tabela', 'Colocar a conclusão do gráfico dentro da própria imagem, em fonte pequena', 'Remover rótulos e legendas para a imagem ficar mais limpa e compacta'], 'Resumo e tabela dão acesso ao conteúdo sem depender da visão. Cores próximas, texto escondido na imagem e ausência de rótulos prejudicam a leitura.'),
        fill('q4', 'Complete o atributo que faz um <svg> ser anunciado como imagem por um leitor de tela, ao lado de um aria-label ou <title>.', '<svg ___="img" aria-label="Pedidos por mês">', ['role'], 'role="img" trata o SVG como uma imagem única, cujo nome vem de aria-label ou do <title>.'),
        mcq('q5', 'Qual estratégia reduz o trabalho de desenhar uma série com milhões de leituras num gráfico de linha?', 'c', ['Desenhar os pontos e depender do zoom automático do navegador para suavizar', 'Enviar a série completa para cada componente filho do gráfico por props', 'Agregar ou amostrar os dados em faixas antes de desenhar, mantendo a tendência', 'Guardar os pontos em localStorage e redesenhar a cada movimento do mouse'], 'A tela tem poucos pixels; reduzir antes de desenhar preserva a forma com muito menos custo. Desenhar tudo, replicar a série em componentes e redesenhar a cada movimento são ineficientes.'),
        mcq('q6', 'A biblioteca D3 é mais corretamente descrita como:', 'a', ['Ferramentas de baixo nível (escalas, formas) com muito controle', 'Um componente de gráficos prontos que se configura com um arquivo JSON simples', 'Uma extensão do navegador que cria gráficos a partir de planilhas abertas na tela', 'Um servidor que armazena os dados e entrega gráficos já renderizados em imagem'], 'D3 oferece blocos de baixo nível e muita liberdade. Não é um componente pronto com JSON, nem uma extensão ou um servidor de imagens.'),
        mcq('q7', 'Por que transformar dados em funções puras separadas do componente de gráfico?', 'd', ['Funções puras são obrigatórias para qualquer biblioteca de gráficos funcionar', 'Funções puras fazem o navegador desenhar o gráfico em duas vezes menos tempo', 'Funções puras guardam os dados no servidor de maneira criptografada', 'Ficam fáceis de testar e reutilizar sem montar a interface'], 'Separar a transformação permite testá-la isoladamente. Não é exigência de bibliotecas, não acelera o desenho por si só e não tem relação com guardar dados criptografados.'),
        fill('q8', 'Complete a função de array usada no exemplo para somar os valores agrupando por mês.', 'const porMes = pedidos.___((acc, p) => { acc[p.mes] = (acc[p.mes] || 0) + p.valor; return acc; }, {});', ['reduce'], 'reduce percorre o array acumulando um resultado; aqui acumula a soma por chave de mês.')
      ]
    },
    {
      id: 'fii-38-tempo-real-no-frontend',
      title: 'Tempo real no front-end',
      goal: 'Comparar polling, SSE e WebSocket, reconectar com backoff, usar estado otimista, integrar ao estado dos frameworks e respeitar limites de segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Três formas de atualizar a tela',
            'Polling: o cliente pergunta ao servidor de tempos em tempos ("tem novidade?"). É simples e funciona em qualquer lugar, mas gera requisições vazias e atraso. Server-Sent Events (SSE): uma conexão HTTP em que o servidor ENVIA eventos ao cliente, em uma só direção; o navegador oferece a API EventSource, que reconecta sozinha. WebSocket: uma conexão persistente de duas vias, em que cliente e servidor trocam mensagens a qualquer momento (chat, jogos, edição colaborativa). Escolha pelo menor mecanismo que resolve: notificações e painéis só de leitura combinam com SSE; conversa bidirecional pede WebSocket; atualização esporádica pode ficar no polling.',
            '// ilustrativo, não executado aqui\nconst fonte = new EventSource(\'/api/eventos\');\nfonte.onmessage = (e) => console.log(JSON.parse(e.data));\n\nconst ws = new WebSocket(\'wss://exemplo.invalid/chat\'); // wss = WebSocket sobre TLS\nws.onmessage = (e) => console.log(JSON.parse(e.data));\nws.send(JSON.stringify({ tipo: \'mensagem\', texto: \'Oi\' }));'
          ),
          sl(
            'Reconexão com backoff exponencial',
            'Conexões caem (rede móvel, deploy do servidor). O cliente precisa reconectar, mas sem martelar o servidor: se mil clientes tentarem reconectar no mesmo segundo, derrubam o serviço de novo. A prática é o backoff exponencial: esperar 1 s, depois 2 s, 4 s, 8 s, com um teto, e somar jitter (um pedaço aleatório) para espalhar as tentativas. Ao reconectar, o cliente deve voltar a pedir o estado perdido (por exemplo, pelo último id recebido). O código calcula a sequência com limite.',
            'const espera = (tentativa, base = 1000, teto = 30000) => Math.min(teto, base * 2 ** tentativa);\nconsole.log([0, 1, 2, 3, 4, 5, 6].map((t) => espera(t) + \' ms\').join(\', \'));\n\n// com jitter: metade fixa + metade aleatória (valores variam a cada execução)\nconst comJitter = (t) => { const e = espera(t); return Math.round(e / 2 + Math.random() * (e / 2)); };\nconst j = comJitter(3);\nconsole.log(\'jitter entre 4000 e 8000?\', j >= 4000 && j <= 8000);\n\n// saída real (Node):\n// 1000 ms, 2000 ms, 4000 ms, 8000 ms, 16000 ms, 30000 ms, 30000 ms\n// jitter entre 4000 e 8000? true'
          ),
          sl(
            'Estado otimista',
            'Atualização otimista: ao clicar em "curtir", a interface muda JÁ, supondo que o servidor vai aceitar, e confirma depois. Se o servidor recusar, desfaz (rollback) e avisa. A pessoa sente a interface instantânea. Passos: guardar o valor anterior, aplicar a mudança, enviar, e em caso de erro restaurar o valor. Cuidados: só use em ações de baixo risco e quase sempre bem-sucedidas (curtir, marcar tarefa), não em pagamentos; trate respostas fora de ordem; o servidor continua sendo a fonte da verdade. TanStack Query, Apollo e o React (useOptimistic, em versões recentes) têm suporte pronto.',
            'let curtidas = 10;\nasync function curtir(servidorAceita) {\n  const anterior = curtidas;      // 1) guarda o valor anterior\n  curtidas += 1;                  // 2) atualiza a tela já\n  console.log(\'otimista:\', curtidas);\n  try {\n    if (!servidorAceita) throw new Error(\'recusado\');\n    console.log(\'servidor confirmou:\', curtidas);\n  } catch {\n    curtidas = anterior;          // 3) rollback\n    console.log(\'rollback:\', curtidas);\n  }\n}\ncurtir(true).then(() => curtir(false));\n\n// saída real (Node):\n// otimista: 11\n// servidor confirmou: 11\n// otimista: 12\n// rollback: 11'
          ),
          sl(
            'Integração com o estado dos frameworks',
            'A conexão é um recurso externo: abrir ao montar o componente e FECHAR ao desmontar, senão há vazamento e mensagens duplicadas. React: useEffect abre a conexão e retorna a função de limpeza que fecha; para vários componentes lendo o mesmo fluxo, concentre numa store ou atualize o cache do TanStack Query com setQueryData ao chegar cada mensagem. Vue: um composable usa onMounted/onUnmounted e guarda as mensagens em um ref. Angular: um serviço expõe um Observable (RxJS, inclusive webSocket) convertido em signal com toSignal, e o encerramento acontece com takeUntilDestroyed. Em todos: uma conexão por assunto, não uma por componente.',
            '// ilustrativo, não executado aqui (React)\nuseEffect(() => {\n  const fonte = new EventSource(\'/api/eventos\');\n  fonte.onmessage = (e) => setMensagens((m) => [...m, JSON.parse(e.data)]);\n  return () => fonte.close(); // limpeza ao desmontar\n}, []);'
          ),
          sl(
            'Limites e segurança',
            'Use sempre wss:// (TLS), nunca ws:// em produção. Autenticação: o WebSocket do navegador não permite cabeçalhos personalizados; prefira o cookie de sessão HttpOnly enviado no handshake ou um ticket de curta duração obtido antes, e evite colocar token longo na URL (URLs aparecem em logs). O servidor deve validar a origem (Origin) e autorizar cada assunto assinado: o cliente não decide o que pode ler. Trate toda mensagem recebida como entrada não confiável: valide o formato e escape ao exibir (XSS). Há limites: muitos clientes simultâneos exigem infraestrutura própria, e mensagens com dados pessoais devem ser mínimas e não ser registradas em logs. Veja o curso de Node.js para o servidor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um painel só precisa receber atualizações do servidor, sem enviar mensagens pelo mesmo canal. Qual opção é a mais simples?', 'b', ['WebSocket, porque só ele consegue manter uma conexão aberta com o servidor', 'Server-Sent Events, em que o servidor envia eventos e o navegador reconecta sozinho', 'Polling a cada milissegundo, para que a tela não tenha atraso algum', 'Recarregar a página inteira a cada atualização com um redirecionamento automático'], 'SSE atende fluxos de uma via e reconecta automaticamente. WebSocket é válido, mas mais do que o necessário, e polling de 1 ms ou recargas completas são ineficientes.'),
        mcq('q2', 'Por que usar backoff exponencial com jitter ao reconectar?', 'd', ['Para que a conexão seja criptografada na segunda tentativa em diante', 'Para que o servidor descubra qual cliente é o mais antigo e priorize seu acesso', 'Para reduzir o número de mensagens recebidas depois que a conexão for restabelecida', 'Para espaçar as tentativas e não sobrecarregar o servidor'], 'Esperas crescentes e aleatórias evitam uma avalanche de reconexões simultâneas. Não têm relação com criptografia, prioridade de clientes ou quantidade de mensagens.'),
        mcq('q3', 'Qual é a sequência correta de uma atualização otimista?', 'a', ['Guardar o anterior, atualizar a tela, enviar e desfazer se falhar', 'Enviar ao servidor, esperar a resposta e só então mudar a tela para o valor novo', 'Atualizar a tela e descartar o valor anterior, pois a recusa do servidor é impossível', 'Atualizar a tela depois de recarregar toda a página com os dados novos'], 'O estado otimista exige guardar o anterior para o rollback. Esperar antes de mudar é o fluxo não otimista, descartar o anterior impede o desfazer e recarregar tudo é o oposto da ideia.'),
        fill('q4', 'Complete: a atualização que muda a tela imediatamente, antes da confirmação do servidor, chama-se atualização ___.', '// aplica a mudança antes da resposta: atualização ___', ['otimista'], 'Atualização otimista presume sucesso, mostra o resultado já e faz rollback se o servidor recusar.'),
        mcq('q5', 'Em React, por que a função retornada pelo useEffect deve fechar a conexão do EventSource?', 'c', ['Para que o navegador mantenha a conexão aberta mesmo depois de fechar a aba do site', 'Para que o React guarde as mensagens antigas em localStorage automaticamente', 'Para evitar vazamento e mensagens duplicadas quando o componente é desmontado ou o efeito roda de novo', 'Para impedir que o servidor envie mensagens com dados pessoais aos outros clientes'], 'A limpeza encerra a conexão e evita ouvintes duplicados. Não mantém conexão após fechar a aba, não grava em localStorage e não controla o que o servidor envia a terceiros.'),
        mcq('q6', 'Qual forma de autenticar a conexão WebSocket é preferível?', 'd', ['Token de acesso de longa duração anexado à URL, para facilitar o suporte e a depuração', 'Sem autenticação, desde que o front-end esconda as telas protegidas', 'Senha da pessoa enviada em cada mensagem, em texto simples, pela conexão', 'Cookie HttpOnly no handshake ou ticket de curta duração'], 'Cookie HttpOnly ou ticket curto reduzem exposição; URLs vão para logs. Esconder telas não substitui autenticação no servidor e enviar senha a cada mensagem é inseguro.'),
        mcq('q7', 'Ao receber uma mensagem pelo WebSocket com um campo de texto livre, qual é a conduta segura?', 'b', ['Inserir o texto direto com innerHTML, pois mensagens do servidor já são seguras', 'Validar o formato e escapar o texto ao exibir, tratando a mensagem como entrada não confiável', 'Confiar no conteúdo se a conexão usa wss://, pois TLS valida o texto da mensagem', 'Executar o texto como código caso comece com um prefixo especial combinado'], 'Mensagens podem carregar conteúdo de outros usuários; é preciso validar e escapar. TLS protege o canal, não o conteúdo; innerHTML sem sanitização abre XSS e executar texto como código é grave.'),
        fill('q8', 'Complete o esquema de URL usado em produção para WebSocket com TLS.', 'const ws = new WebSocket(\'___://exemplo.invalid/chat\');', ['wss'], 'wss é o WebSocket sobre TLS (como https para http); ws:// trafega sem criptografia e não deve ser usado em produção.')
      ]
    },
    {
      id: 'fii-39-pwa-service-workers-e-offline',
      title: 'PWA, service workers e offline',
      goal: 'Entender manifesto, service worker, estratégias de cache, atualização, notificações com consentimento e riscos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um PWA',
            'Um Progressive Web App é um site que usa recursos modernos para ter comportamento próximo ao de um aplicativo: pode ser instalado na tela inicial, abrir em janela própria, funcionar offline (ou com rede ruim) e receber notificações. Os ingredientes: HTTPS (obrigatório), um manifesto (arquivo JSON com nome, ícones, cores e a URL inicial) e um service worker (script que fica entre a página e a rede). Nem todo site precisa ser PWA: vale quando o uso com internet instável ou a instalação trazem valor real. Os meta-frameworks e o Angular têm plugins ou ferramentas para gerar o básico; confira a documentação.',
            '{\n  "name": "Painel Exemplo",\n  "short_name": "Painel",\n  "start_url": "/",\n  "display": "standalone",\n  "background_color": "#ffffff",\n  "theme_color": "#1f2937",\n  "icons": [{ "src": "/icone-192.png", "sizes": "192x192", "type": "image/png" }]\n}'
          ),
          sl(
            'Service worker: ciclo de vida',
            'Um service worker é um script que roda em segundo plano, separado da página, sem acesso ao DOM. Intercepta as requisições da página (evento fetch) e decide: buscar na rede, responder do cache, ou combinar. Ciclo de vida: o navegador REGISTRA o script; o evento install roda uma vez (momento de guardar arquivos essenciais em cache); o evento activate roda quando assume o controle (momento de limpar caches antigos); depois ele passa a interceptar fetch. Ele só controla páginas dentro do seu escopo (a pasta onde está), e só funciona em HTTPS (exceto em localhost).',
            '// ilustrativo, não executado aqui\nif (\'serviceWorker\' in navigator) {\n  navigator.serviceWorker.register(\'/sw.js\');\n}\n\n// sw.js\nself.addEventListener(\'install\', (e) => {\n  e.waitUntil(caches.open(\'v1\').then((c) => c.addAll([\'/\', \'/app.css\', \'/app.js\'])));\n});\nself.addEventListener(\'fetch\', (e) => {\n  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));\n});'
          ),
          sl(
            'Estratégias de cache',
            'Cache-first: responde do cache e só vai à rede se não achar. É ótimo para arquivos com hash no nome (app.3f9a.js) que nunca mudam. Network-first: tenta a rede e cai para o cache se estiver offline, bom para dados que mudam (lista de pedidos). Stale-while-revalidate: responde na hora com o que está no cache e atualiza o cache em segundo plano para a próxima visita; equilíbrio de velocidade e frescor. Network-only: sempre rede (pagamentos, ações que alteram dados). Bibliotecas como Workbox (por nome) implementam essas estratégias. O código simula a escolha por tipo de requisição.',
            'function estrategia(caminho, metodo = \'GET\') {\n  if (metodo !== \'GET\') return \'network-only\';\n  if (caminho.startsWith(\'/api/pagamentos\')) return \'network-only\';\n  if (/\\.[0-9a-f]{4,}\\.(js|css)$/.test(caminho)) return \'cache-first\';\n  if (caminho.startsWith(\'/api/\')) return \'network-first\';\n  return \'stale-while-revalidate\';\n}\nconst testes = [[\'/app.3f9a1c.js\'], [\'/api/pedidos\'], [\'/api/pagamentos/1\'], [\'/sobre\'], [\'/api/pedidos\', \'POST\']];\nfor (const [c, m] of testes) console.log((m || \'GET\').padEnd(5), c.padEnd(20), \'->\', estrategia(c, m));\n\n// saída real (Node):\n// GET   /app.3f9a1c.js       -> cache-first\n// GET   /api/pedidos         -> network-first\n// GET   /api/pagamentos/1    -> network-only\n// GET   /sobre               -> stale-while-revalidate\n// POST  /api/pedidos         -> network-only'
          ),
          sl(
            'Atualização do service worker',
            'Quando você publica uma nova versão do sw.js, o navegador a instala, mas ela fica ESPERANDO até que todas as abas com a versão antiga sejam fechadas; assim a pessoa não fica com metade da aplicação nova e metade antiga. Para atualizar logo, o novo worker pode chamar skipWaiting(), mas isso pode misturar versões numa página aberta. O padrão mais cuidadoso: detectar a versão nova e mostrar um aviso "Nova versão disponível, atualizar?"; ao aceitar, ativa e recarrega. Versione os nomes de cache (v1, v2) e apague os antigos no activate. O erro clássico é um service worker antigo servindo arquivos velhos por tempo indeterminado, e usuários presos numa versão com defeito.'
          ),
          sl(
            'Notificações e riscos',
            'Notificações push exigem permissão explícita: peça só depois de uma ação da pessoa, explicando o benefício (por exemplo, um botão "Avisar quando meu pedido sair"), nunca ao carregar a página. Respeite a recusa e não insista. A inscrição push identifica o navegador: trate como dado vinculado à pessoa, colete o mínimo, permita cancelar e não envie dados pessoais no conteúdo da notificação (ela aparece na tela bloqueada). Riscos do offline: NÃO guarde em cache respostas autenticadas ou com dados pessoais em cache compartilhado ou duradouro sem necessidade; limpe os caches no logout; cuide para não cachear respostas de erro. Um service worker comprometido por XSS controla todas as requisições do escopo, por isso HTTPS e CSP importam.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Quais são os três ingredientes de um PWA instalável e com suporte offline mencionados na lição?', 'a', ['HTTPS, manifesto e service worker', 'Banco de dados relacional, servidor próprio e aplicativo nativo para cada sistema', 'HTML estático, plugin de navegador e certificado digital emitido para a pessoa', 'Cookies de rastreamento, notificações automáticas e login com redes sociais'], 'PWA se apoia em HTTPS, manifesto e service worker. As outras listas misturam itens que não são requisitos de um PWA.'),
        mcq('q2', 'Para que serve o evento activate de um service worker?', 'c', ['Guardar os arquivos essenciais em cache na primeira vez que a página abre', 'Interceptar cada requisição da página e decidir a resposta a ser enviada', 'Assumir o controle e limpar caches de versões antigas', 'Pedir permissão de notificação à pessoa assim que a aplicação carregar'], 'activate é o momento de limpar caches antigos ao assumir o controle. Guardar arquivos é tarefa do install, interceptar é o evento fetch e a permissão de notificação deve vir de uma ação da pessoa.'),
        mcq('q3', 'Qual estratégia é a mais adequada para um arquivo app.3f9a1c.js, que tem hash no nome e nunca muda?', 'b', ['Network-only, porque todo arquivo de JavaScript precisa ser baixado de novo a cada acesso', 'Cache-first, porque o conteúdo daquele nome é imutável', 'Network-first, para aguardar a resposta da rede antes de mostrar a tela', 'Sem cache, já que arquivos com hash no nome são considerados inseguros'], 'Nome com hash identifica uma versão fixa, ideal para cache-first. Baixar sempre ou esperar a rede desperdiça desempenho, e o hash não torna o arquivo inseguro.'),
        fill('q4', 'Complete a estratégia que responde na hora com o cache e atualiza o cache em segundo plano para a próxima visita.', '// estratégia: stale-while-___', ['revalidate'], 'Stale-while-revalidate entrega o conteúdo em cache imediatamente e o revalida na rede para a próxima vez.'),
        mcq('q5', 'Uma nova versão do sw.js foi publicada, mas a aplicação continua com a versão antiga. Qual é a explicação mais provável?', 'a', ['O novo worker espera as abas antigas fecharem', 'O navegador ignora service workers publicados fora do horário comercial', 'O novo worker só é instalado depois que a pessoa limpar manualmente os cookies', 'O manifesto precisa ser reescrito para o service worker voltar a funcionar'], 'O ciclo de vida mantém o novo worker em espera até liberar as abas antigas (ou até skipWaiting). Horários, cookies e o manifesto não definem a atualização.'),
        mcq('q6', 'Qual é a forma correta de pedir permissão para notificações?', 'd', ['Assim que a página carrega, com o pedido repetido a cada visita até haver aceitação', 'Escondendo o motivo, para que mais pessoas cliquem em permitir', 'Após registrar o e-mail e o telefone da pessoa, como condição para usar o site', 'Depois de uma ação da pessoa, explicando o benefício, e respeitando a recusa'], 'Permissão pedida em contexto e com explicação é a boa prática, e a recusa deve ser respeitada. Pedir ao carregar, insistir, ocultar o motivo ou exigir dados pessoais é abusivo e coleta além do necessário.'),
        mcq('q7', 'Qual risco de privacidade existe ao cachear respostas no service worker?', 'c', ['O cache apaga automaticamente os dados do servidor quando o navegador é fechado', 'O cache impede que o navegador use HTTPS nas próximas requisições', 'Dados pessoais podem ficar no dispositivo, mesmo após o logout', 'O cache envia uma cópia dos dados para o fabricante do navegador'], 'Dados em cache ficam no dispositivo e precisam ser limpos no logout e evitados quando sensíveis. O cache não apaga o servidor, não desativa HTTPS e não envia cópias a terceiros por conta própria.'),
        fill('q8', 'Complete: o arquivo JSON que descreve nome, ícones e URL inicial do PWA chama-se ___ (da aplicação web).', '// arquivo manifest.webmanifest: o ___ do app', ['manifesto', 'manifest'], 'O manifesto (web app manifest) informa nome, ícones, cores e start_url para a instalação do app.')
      ]
    },
    {
      id: 'fii-40-armazenamento-no-navegador',
      title: 'Armazenamento no navegador',
      goal: 'Comparar cookies, localStorage, sessionStorage e IndexedDB, conhecer limites e riscos e aplicar minimização de dados pessoais (LGPD).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O mapa das opções',
            'Cookies: pequenos textos (poucos KB) que o navegador ENVIA ao servidor em toda requisição ao domínio; podem ter validade, HttpOnly, Secure e SameSite. Servem para sessão. localStorage: pares chave/valor em texto, síncrono, que ficam até serem apagados; leitura por qualquer script da origem; algo como alguns MB. sessionStorage: igual, mas cada aba tem o seu e some ao fechar a aba. IndexedDB: banco assíncrono com objetos estruturados e volumes bem maiores (arquivos, listas grandes, dados offline), com API mais complexa (bibliotecas como idb ou Dexie ajudam). A Cache API guarda respostas HTTP (usada por service workers). Os limites exatos variam por navegador: não os assuma.'
          ),
          sl(
            'Quando usar cada um',
            'Preferência de interface não sensível (tema, aba aberta): localStorage ou, melhor ainda, um cookie se o servidor precisar saber (para renderizar no SSR sem piscar). Rascunho de formulário que só vale naquela aba: sessionStorage. Sessão e autenticação: cookie HttpOnly emitido pelo servidor. Dados grandes ou estruturados e uso offline: IndexedDB. Cache de dados da API: a biblioteca de consultas (TanStack Query tem opção de persistência). Atenção: localStorage é síncrono e bloqueia a thread principal quando se grava muito; e todos os armazenamentos podem falhar (modo privado, cota cheia, dados bloqueados): envolva o acesso em try/catch e faça a interface funcionar sem eles.'
          ),
          sl(
            'Segurança do armazenamento',
            'Tudo o que fica em localStorage, sessionStorage e IndexedDB pode ser lido por qualquer JavaScript da mesma origem, inclusive um script injetado por XSS. Por isso: nada de tokens de autenticação, senhas, segredos ou documentos pessoais nesses locais. O usuário também pode ver e editar tudo pelas ferramentas do navegador, então NUNCA confie no que foi lido de volta (valide como qualquer entrada) e nunca guarde nele decisões de autorização ("papel: admin"). Em computadores compartilhados, os dados continuam lá depois que a pessoa sai: limpe no logout. Cookies: prefira HttpOnly, Secure e SameSite; cookies sem HttpOnly são legíveis por scripts.'
          ),
          sl(
            'Dados pessoais e LGPD (visão geral)',
            'Guardar dados pessoais (nome, e-mail, identificadores, histórico) no navegador é tratamento de dados e tem implicações na LGPD (Lei 13.709/2018). Visão geral de boas práticas, que não substitui orientação jurídica: guarde o MÍNIMO necessário (minimização) e só para uma finalidade clara; evite dados pessoais no dispositivo quando o servidor resolve; defina por quanto tempo os dados ficam (retenção) e apague quando acabar o uso; cookies e armazenamentos não essenciais (analytics, publicidade) dependem de consentimento da pessoa, que deve poder recusar e mudar de ideia; informe o que é guardado na política de privacidade. Cookies estritamente necessários (sessão, segurança) normalmente não exigem consentimento, mas devem ser informados. Consulte o time jurídico para o seu caso.'
          ),
          sl(
            'Um wrapper seguro e com validade',
            'Boa prática: um pequeno módulo que centraliza o acesso, trata falhas, valida o que lê e permite expirar dados. O exemplo usa um armazenamento falso em memória (Map) para rodar no Node, com um tempo de validade (TTL) e uma versão de formato, sem dados pessoais.',
            '// armazenamento falso só para este exemplo (no navegador seria localStorage)\nconst fake = new Map();\nconst storage = { getItem: (k) => (fake.has(k) ? fake.get(k) : null), setItem: (k, v) => fake.set(k, v), removeItem: (k) => fake.delete(k) };\n\nfunction salvar(chave, valor, ttlMs, agora) {\n  try { storage.setItem(chave, JSON.stringify({ v: 1, expira: agora + ttlMs, valor })); } catch { /* cota cheia: segue sem salvar */ }\n}\nfunction ler(chave, agora) {\n  try {\n    const bruto = storage.getItem(chave);\n    if (!bruto) return null;\n    const obj = JSON.parse(bruto);\n    if (obj.v !== 1 || typeof obj.expira !== \'number\') return null; // formato inesperado\n    if (agora > obj.expira) { storage.removeItem(chave); return null; } // expirou\n    return obj.valor;\n  } catch { return null; } // JSON inválido ou acesso bloqueado\n}\nsalvar(\'tema\', \'escuro\', 1000, 0);\nconsole.log(ler(\'tema\', 500));   // dentro da validade\nconsole.log(ler(\'tema\', 2000));  // expirado\nstorage.setItem(\'quebrado\', \'{nao-e-json\');\nconsole.log(ler(\'quebrado\', 0)); // valor corrompido\n\n// saída real (Node):\n// escuro\n// null\n// null'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual armazenamento envia seus dados ao servidor automaticamente em toda requisição ao domínio?', 'a', ['Os cookies, em todas as requisições ao domínio', 'localStorage, que é enviado junto com os cabeçalhos de cada requisição HTTP feita', 'sessionStorage, que é transmitido ao servidor quando a aba é focada', 'IndexedDB, que sincroniza os registros com o servidor de modo automático'], 'Cookies viajam com as requisições ao domínio. localStorage, sessionStorage e IndexedDB ficam no navegador e só vão ao servidor se o seu código os enviar.'),
        mcq('q2', 'Um rascunho de formulário só deve valer naquela aba e sumir quando ela fechar. Qual opção se encaixa?', 'd', ['localStorage, que permanece até a pessoa apagar manualmente os dados do site', 'Um cookie com validade de vários anos para lembrar o rascunho sempre', 'IndexedDB, que mantém os dados mesmo depois de limpar os dados de navegação', 'sessionStorage, que é separado por aba e apagado ao fechá-la'], 'sessionStorage tem escopo de aba e desaparece com ela. localStorage, cookie longo e IndexedDB persistem além disso, o que contraria o requisito.'),
        mcq('q3', 'Por que não guardar um token de autenticação em localStorage?', 'c', ['Porque o localStorage criptografa o token e a aplicação não consegue lê-lo de volta', 'Porque o localStorage só aceita números e descarta textos longos de tokens', 'Qualquer script da origem, inclusive um injetado por XSS, consegue lê-lo', 'Porque o localStorage é apagado a cada nova requisição que a página fizer'], 'localStorage é legível por scripts da mesma origem, então um XSS pode roubar o token. Não criptografa o conteúdo, aceita texto e persiste entre requisições.'),
        fill('q4', 'Complete: dados pessoais devem ser guardados no ___ necessário, princípio chamado de minimização.', '// princípio da minimização: guardar apenas o ___ necessário', ['mínimo', 'minimo'], 'Minimização significa coletar e guardar apenas os dados estritamente necessários para a finalidade declarada.'),
        mcq('q5', 'Um site quer usar um cookie de analytics que acompanha a pessoa entre visitas. Qual conduta se alinha às boas práticas de privacidade?', 'b', ['Ativar o cookie automaticamente e esconder a opção de recusar em uma página secundária', 'Obter consentimento antes, permitir recusar e revogar, e informar a finalidade na política de privacidade', 'Gravar o cookie e só avisar a pessoa depois, quando o relatório for gerado', 'Dispensar qualquer aviso, pois cookies são dados técnicos e não pessoais'], 'Cookies não essenciais pedem consentimento, escolha real e transparência (sem substituir orientação jurídica). Ativar sem opção, avisar depois ou afirmar que cookies nunca são dados pessoais contraria essas práticas.'),
        mcq('q6', 'Qual cuidado vale ao ler de volta um valor salvo no localStorage?', 'b', ['Confiar no valor, pois só a própria aplicação consegue escrever naquele armazenamento', 'Tratá-lo sempre como entrada não confiável, validando o formato', 'Executá-lo diretamente com eval caso comece com um prefixo conhecido', 'Inseri-lo no HTML com innerHTML, já que foi gravado pela própria aplicação'], 'A pessoa (ou um script) pode alterar o localStorage, então o valor é entrada não confiável. Confiar cegamente, usar eval ou innerHTML abrem brechas de segurança.'),
        mcq('q7', 'Qual opção é a mais adequada para guardar uma lista grande de registros para uso offline?', 'a', ['IndexedDB, que é assíncrono e comporta mais dados estruturados', 'Um único cookie grande, que o servidor receberá a cada requisição da página', 'localStorage, pois gravações de muitos MB não bloqueiam a thread principal', 'sessionStorage, para que a lista permaneça disponível entre as abas'], 'IndexedDB é feito para volumes maiores e acesso assíncrono. Cookies têm poucos KB e são enviados toda hora, localStorage é síncrono e sessionStorage não é compartilhado entre abas.'),
        fill('q8', 'Complete o bloco que protege a leitura contra falhas como armazenamento bloqueado ou JSON inválido.', 'try { return JSON.parse(storage.getItem(chave)); } ___ { return null; }', ['catch'], 'try/catch evita que um armazenamento indisponível ou um valor corrompido derrube a interface; devolve-se um valor padrão seguro.')
      ]
    },
    {
      id: 'fii-54-upload-e-arrastar-e-soltar',
      title: 'Upload e arrastar e soltar',
      goal: 'Construir upload de arquivos com input, arrastar e soltar, pré-visualização, validação no cliente, progresso, cancelamento, acessibilidade e cuidados de privacidade e de segurança no servidor.',
      xp: 20,
      intro: {
        slides: [
          sl('O input type=file e o objeto File', 'Um <input type="file"> abre o seletor de arquivos do sistema. Depois que a pessoa escolhe, input.files traz uma lista de objetos File, cada um com name, size (em bytes), type (tipo MIME informado pelo navegador, como image/png) e lastModified. O atributo multiple permite vários, e accept sugere tipos ao seletor (accept="image/*"). Atenção: accept é só uma DICA de interface. A pessoa ainda pode escolher outro tipo (o seletor aceita "todos os arquivos") e o tipo informado pode ser forjado, então nada disso é validação de segurança. Um arquivo só é lido quando você pede, por FileReader, URL de objeto ou envio com FormData.', '<input id="foto" type="file" accept="image/png, image/jpeg, image/webp">\n\n<script>\nconst input = document.getElementById(\'foto\');\ninput.addEventListener(\'change\', () => {\n  for (const arquivo of input.files) {\n    console.log(arquivo.name, arquivo.type, arquivo.size);\n  }\n});\n</script>\n/* ilustrativo, não executado aqui */'),
          sl('Arrastar e soltar: a zona de soltura', 'Para aceitar arquivos arrastados, uma área ouve dois eventos: dragover (enquanto o item passa por cima) e drop (quando é solto). Nos dois você precisa chamar event.preventDefault(); sem isso, o navegador trata o drop como navegação e abre o arquivo, saindo da sua página. Ao soltar, os arquivos estão em event.dataTransfer.files, com o mesmo formato do input. Boa prática: a zona de soltura é um COMPLEMENTO e o input real continua disponível, porque arrastar exige mouse (ou toque) e não funciona para quem usa teclado ou leitor de tela. No React, Vue e Angular a lógica é a mesma, mudando só a sintaxe do evento (onDragOver, @dragover.prevent, (dragover)).', '// JavaScript puro\nconst zona = document.getElementById(\'zona\');\nzona.addEventListener(\'dragover\', (e) => e.preventDefault());\nzona.addEventListener(\'drop\', (e) => {\n  e.preventDefault();\n  tratarArquivos(e.dataTransfer.files);\n});\n\n// Vue:     <div @dragover.prevent @drop.prevent="soltou">\n// React:   <div onDragOver={(e) => e.preventDefault()} onDrop={soltou}>\n// Angular: <div (dragover)="$event.preventDefault()" (drop)="soltou($event)">\n/* ilustrativo, não executado aqui */'),
          sl('Pré-visualização com URL de objeto (e liberar a memória)', 'Para mostrar a imagem escolhida antes do envio, URL.createObjectURL(arquivo) devolve um endereço temporário (blob:...) que aponta para o arquivo na memória do navegador, e você o usa em <img src>. Esse endereço mantém o arquivo vivo até que você chame URL.revokeObjectURL(url); se esquecer, a memória vaza, o que pesa em telas que trocam de imagem várias vezes. Libere ao trocar o arquivo e ao sair da tela: no React, na função de limpeza do useEffect; no Vue, em onUnmounted ou watch; no Angular, em ngOnDestroy. Segurança: exiba imagens com <img src> e nunca insira o conteúdo de um SVG ou HTML enviado pela pessoa diretamente na página, pois isso pode conter script.', '// React (ilustrativo)\nfunction Previa({ arquivo }) {\n  const [url, setUrl] = useState(null);\n  useEffect(() => {\n    const u = URL.createObjectURL(arquivo);\n    setUrl(u);\n    return () => URL.revokeObjectURL(u); // libera ao trocar ou desmontar\n  }, [arquivo]);\n  return url ? <img src={url} alt="Pré-visualização da imagem escolhida" /> : null;\n}\n/* ilustrativo, não executado aqui */'),
          sl('Validação no cliente: UX, não segurança', 'Validar tipo e tamanho antes de enviar poupa tempo e dá resposta imediata ("este arquivo é grande demais"). Mas toda validação no navegador pode ser contornada: qualquer pessoa pode enviar a requisição direto, sem a sua página, com o tipo que quiser. Por isso o cliente valida para experiência e o SERVIDOR valida de novo, de forma definitiva. O exemplo abaixo, em JavaScript puro, confere tipo permitido, tamanho máximo, arquivo vazio, tamanho do nome e caracteres de caminho no nome (como barras e ..), que não devem chegar ao sistema de arquivos do servidor.', 'const RULES = { types: [\'image/png\', \'image/jpeg\', \'image/webp\'], maxBytes: 2 * 1024 * 1024, maxNameLength: 80 };\n\nfunction validateFile(file, rules = RULES) {\n  const errors = [];\n  if (!rules.types.includes(file.type)) errors.push(\'tipo não permitido\');\n  if (file.size > rules.maxBytes) errors.push(\'arquivo maior que \' + rules.maxBytes / 1024 / 1024 + \' MB\');\n  if (file.size === 0) errors.push(\'arquivo vazio\');\n  if (file.name.length > rules.maxNameLength) errors.push(\'nome muito longo\');\n  if (/[\\/]|\\.\\./.test(file.name)) errors.push(\'nome com caracteres de caminho\');\n  return { ok: errors.length === 0, errors };\n}\n\nconst exemplos = [\n  { name: \'foto.png\', type: \'image/png\', size: 350000 },\n  { name: \'planilha.xlsx\', type: \'application/vnd.ms-excel\', size: 90000 },\n  { name: \'grande.jpg\', type: \'image/jpeg\', size: 5 * 1024 * 1024 },\n  { name: \'../etc/senha.png\', type: \'image/png\', size: 1200 },\n  { name: \'vazio.webp\', type: \'image/webp\', size: 0 }\n];\nfor (const f of exemplos) console.log(f.name, JSON.stringify(validateFile(f)));'),
          sl('Saída real e o que o servidor precisa refazer', 'Esta é a saída real do programa anterior em Node, usando objetos que imitam File (abaixo). No servidor, a validação definitiva inclui: limite de tamanho aplicado na própria leitura do corpo da requisição; checagem do CONTEÚDO real (os primeiros bytes, chamados de assinatura ou magic bytes, e não só a extensão ou o tipo informado); troca do nome enviado por um nome gerado pelo servidor (evita sobrescrita e caminhos maliciosos); gravação fora da pasta servida publicamente; análise antivírus quando o arquivo for baixado por outras pessoas; e controle de quem pode enviar e ler. Para uploads em profundidade, veja os cursos de Node.js e de Segurança Web (OWASP).', '// saída real (Node)\nfoto.png {"ok":true,"errors":[]}\nplanilha.xlsx {"ok":false,"errors":["tipo não permitido"]}\ngrande.jpg {"ok":false,"errors":["arquivo maior que 2 MB"]}\n../etc/senha.png {"ok":false,"errors":["nome com caracteres de caminho"]}\nvazio.webp {"ok":false,"errors":["arquivo vazio"]}'),
          sl('Envio com progresso, cancelamento e arquivos grandes', 'O envio usa FormData (a requisição vai como multipart; não defina o cabeçalho Content-Type à mão, deixe o navegador acrescentar o limite de partes). O fetch não oferece progresso de ENVIO de forma simples e universal; para uma barra de progresso, XMLHttpRequest expõe xhr.upload.onprogress. Para cancelar, use xhr.abort() ou, com fetch, um AbortController passado em signal. Arquivos muito grandes podem ser cortados em partes com arquivo.slice(inicio, fim) e enviados em sequência, permitindo retomar do ponto em que parou se a conexão cair; muitos sistemas também enviam direto para um serviço de armazenamento por meio de uma URL de envio temporária emitida pelo seu servidor, sem passar o arquivo pelo seu back-end. Mostre o estado (enviando, concluído, erro) e permita tentar de novo.', '// XMLHttpRequest com progresso e cancelamento (ilustrativo)\nconst dados = new FormData();\ndados.append(\'foto\', arquivo);\n\nconst xhr = new XMLHttpRequest();\nxhr.open(\'POST\', \'/api/fotos\');\nxhr.upload.onprogress = (e) => {\n  if (e.lengthComputable) barra.value = Math.round((e.loaded / e.total) * 100);\n};\nxhr.onload = () => (xhr.status === 201 ? sucesso() : falha());\nxhr.onerror = falha;\nxhr.send(dados);\n\nbotaoCancelar.onclick = () => xhr.abort();\n\n// fetch com cancelamento\nconst ctrl = new AbortController();\nfetch(\'/api/fotos\', { method: \'POST\', body: dados, signal: ctrl.signal });\n// ctrl.abort() interrompe a requisição\n/* ilustrativo, não executado aqui */'),
          sl('Acessibilidade e privacidade no upload', 'Acessibilidade: ofereça um botão ou input focável que abre o seletor com Enter ou Espaço, rotule-o com <label>, e anuncie o resultado (arquivo aceito, erro, progresso) em uma região aria-live="polite" para quem usa leitor de tela; ligue a mensagem de erro ao campo com aria-describedby. Privacidade: fotos tiradas em celulares carregam metadados EXIF, que podem incluir a LOCALIZAÇÃO, o modelo do aparelho e a data. Se a foto será pública (avatar, anúncio), isso expõe dados pessoais sem que a pessoa perceba. Remova os metadados ao processar a imagem (reencodar no servidor ou, no cliente, desenhar em um canvas e exportar) e informe o que é feito. Aplique minimização: colete só o arquivo necessário, defina por quanto tempo ele é guardado e permita exclusão. A LGPD (Lei 13.709/2018), em visão geral, trata esses dados como pessoais quando identificam alguém; esta lição não substitui orientação jurídica.', '<label for="foto">Foto de perfil</label>\n<input id="foto" type="file" accept="image/*" aria-describedby="foto-ajuda foto-erro">\n<p id="foto-ajuda">PNG, JPEG ou WebP, até 2 MB.</p>\n<p id="foto-erro" role="status" aria-live="polite"></p>\n/* ilustrativo, não executado aqui */')
        ]
      },
      questions: [
        mcq('q1', 'O input tem accept="image/png". Por que ainda é preciso validar o tipo do arquivo no servidor?', 'b', [
          'Porque o accept filtra só pelo nome do arquivo, enquanto o tipo real dentro dele passa sem ser conferido.',
          'Porque accept é só uma dica ao seletor; quem escolhe outro tipo ou chama a API direto ignora a página.',
          'Porque o atributo accept só funciona em navegadores antigos e foi removido dos atuais por motivos de segurança.',
          'Porque o servidor precisa converter o arquivo para PNG de qualquer forma, e a conversão já serve de validação.'
        ], 'accept orienta o seletor, mas pode ser contornado por quem escolhe "todos os arquivos" ou chama a API diretamente, então a validação definitiva fica no servidor. Ele não foi removido dos navegadores, e converter arquivos não é um substituto para validar o conteúdo.'),
        mcq('q2', 'Ao soltar um arquivo na zona de soltura, o navegador sai da página e abre a imagem. Qual é a causa mais provável?', 'c', [
          'A zona não tem o atributo accept, que o navegador exige para reconhecer um arquivo solto sobre ela.',
          'O evento correto seria click, pois o drop só dispara quando há um input type=file dentro da zona.',
          'Os handlers de dragover e drop não chamam preventDefault, então o navegador faz o comportamento padrão.',
          'O arquivo é maior do que o limite do navegador, que então o abre em uma nova aba para visualização.'
        ], 'Sem preventDefault em dragover e em drop, o navegador trata a soltura como abrir o arquivo. accept é atributo de input, drop dispara em qualquer elemento com handlers e não existe esse limite que abre o arquivo em nova aba.'),
        mcq('q3', 'Uma tela de edição de avatar troca a imagem várias vezes e, depois de algum tempo, a página fica pesada. O que provavelmente falta?', 'b', [
          'Trocar createObjectURL por uma string base64 do arquivo, já que o texto em base64 não ocupa memória do navegador.',
          'Chamar URL.revokeObjectURL nos endereços criados com createObjectURL quando a imagem trocar ou a tela sair.',
          'Chamar preventDefault a cada troca de imagem para que o navegador descarte a imagem anterior da memória.',
          'Aumentar o tamanho máximo do arquivo, porque arquivos pequenos fragmentam a memória e a deixam lenta.'
        ], 'Cada URL de objeto mantém o arquivo na memória até ser revogada; a limpeza ao trocar ou desmontar resolve o vazamento. Base64 também ocupa memória (e mais), preventDefault não libera nada e aumentar o limite não tem relação com o problema.'),
        fill('q4', 'Complete a chamada que libera o endereço temporário de uma pré-visualização.', 'const url = URL.createObjectURL(arquivo);\n// ... usa a url em <img src>\nURL.___(url);', ['revokeObjectURL'], 'revokeObjectURL(url) libera o vínculo entre o endereço blob: e o arquivo na memória, evitando vazamento quando a pré-visualização não é mais necessária.'),
        mcq('q5', 'O formulário limita o arquivo a 2 MB no navegador. Alguém envia 500 MB por uma ferramenta de linha de comando. O que impede isso?', 'd', [
          'O limite do navegador, que continua valendo para qualquer cliente que chame a mesma URL da API.',
          'O atributo maxlength do input, que o servidor lê do HTML para saber o limite de cada campo.',
          'O próprio protocolo HTTP, que recusa uploads acima de 2 MB mesmo sem configuração extra.',
          'O limite aplicado no servidor ao ler o corpo da requisição, que recusa antes de aceitar o arquivo.'
        ], 'Só o servidor controla o que ele aceita; o código do navegador não participa de uma requisição feita por outra ferramenta. maxlength não se aplica a arquivos nem chega ao servidor, e HTTP não impõe esse limite por conta própria.'),
        mcq('q6', 'Um site tem uma zona de arrastar e soltar sem outra forma de enviar. Qual problema isso causa e qual é a correção?', 'a', [
          'Quem usa só teclado ou leitor de tela não consegue enviar; ofereça também um input ou botão focável.',
          'Nenhum problema de acessibilidade, porque o navegador converte o drop em tecla Enter automaticamente.',
          'O problema é só visual, pois a zona fica sem borda destacada; basta aumentar o contraste da área.',
          'Pessoas com leitor de tela conseguem arrastar usando as setas, então basta anunciar a zona com aria-label.'
        ], 'Arrastar depende de mouse ou toque, então é preciso uma alternativa operável por teclado, como o input rotulado. O navegador não converte drops em Enter, contraste não resolve a falta de operação e setas não arrastam arquivos.'),
        mcq('q7', 'Um app aceita foto de perfil tirada no celular e a exibe publicamente. Qual cuidado de privacidade é mais relevante?', 'c', [
          'Converter o nome do arquivo para minúsculas, pois nomes com maiúsculas revelam o nome do aparelho.',
          'Confiar no tipo informado pelo navegador, já que ele indica que a foto não tem dados pessoais.',
          'Remover os metadados EXIF da imagem, que podem conter localização e dados do aparelho, e avisar a pessoa.',
          'Exibir a foto em tamanho reduzido, o que apaga os metadados automaticamente no navegador de quem vê.'
        ], 'EXIF pode embutir coordenadas e outros dados pessoais, que ficam expostos se o arquivo original for publicado; reprocessar a imagem e informar a pessoa é a prática adequada. O nome em minúsculas não importa, o tipo MIME nada diz sobre metadados e reduzir a exibição em CSS não altera o arquivo baixado.'),
        fill('q8', 'Complete o objeto que permite cancelar um fetch em andamento.', 'const ctrl = new ___();\nfetch(\'/api/fotos\', { method: \'POST\', body: dados, signal: ctrl.signal });\nbotaoCancelar.onclick = () => ctrl.abort();', ['AbortController'], 'AbortController cria um sinal que o fetch observa; chamar abort() interrompe a requisição e rejeita a promessa com um erro de cancelamento, que a interface deve tratar como cancelamento e não como falha.')
      ]
    },
    {
      id: 'fii-41-core-web-vitals-e-medicao',
      title: 'Core Web Vitals e medição',
      goal: 'Entender LCP, INP e CLS, medir em laboratório e em campo, definir orçamentos de desempenho e reconhecer causas comuns.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'As três métricas',
            'Core Web Vitals são métricas que descrevem a experiência real de carregamento. LCP (Largest Contentful Paint): quanto tempo até o MAIOR elemento visível (imagem de destaque, bloco de título) aparecer; mede a sensação de "a página carregou". INP (Interaction to Next Paint): o atraso entre uma interação (clique, toque, tecla) e a tela mostrar a resposta; mede a responsividade durante todo o uso. CLS (Cumulative Layout Shift): soma dos saltos inesperados de layout (o botão que se move quando a imagem carrega e você clica no lugar errado); mede a estabilidade visual. Os limiares de "bom" são publicados pelo Google e podem ser revistos: confira a documentação oficial atual em vez de decorar números.'
          ),
          sl(
            'Lab x campo: como medir',
            'Dados de LABORATÓRIO vêm de um teste controlado, numa máquina e rede simuladas: Lighthouse (no DevTools ou na linha de comando) e o painel Performance do DevTools. São reproduzíveis e ótimos para depurar, mas não representam pessoas reais. Dados de CAMPO (RUM, Real User Monitoring) vêm dos navegadores de quem usa o site de verdade: a biblioteca web-vitals (por nome) coleta as métricas no cliente para você enviar ao seu back-end, e o relatório CrUX (Chrome User Experience Report) agrega dados públicos de campo. Use o campo para saber se há problema e o laboratório para descobrir a causa. Para RUM, não envie dados pessoais: só a métrica, a página (sem parâmetros sensíveis na URL) e o tipo de dispositivo.',
            '// ilustrativo, não executado aqui\nimport { onLCP, onINP, onCLS } from \'web-vitals\';\n\nfunction enviar(metrica) {\n  navigator.sendBeacon(\'/api/metricas\', JSON.stringify({\n    nome: metrica.name, valor: metrica.value, pagina: location.pathname // sem query string\n  }));\n}\nonLCP(enviar); onINP(enviar); onCLS(enviar);'
          ),
          sl(
            'Percentis e o que olhar',
            'Médias enganam: uma página com 90 acessos rápidos e 10 muito lentos tem média aceitável, mas dez pessoas sofrem. Por isso as métricas de campo são avaliadas pelo percentil 75: o valor abaixo do qual ficam 75% das visitas. O código calcula o percentil de um conjunto fictício de medições de LCP em segundos e classifica com um limiar escolhido por quem usa (aqui, 2,5 s; confira o limiar oficial vigente).',
            'function percentil(valores, p) {\n  const o = [...valores].sort((a, b) => a - b);\n  const i = Math.ceil((p / 100) * o.length) - 1;\n  return o[Math.max(0, i)];\n}\nconst lcp = [1.2, 1.4, 1.5, 1.6, 1.8, 2.0, 2.1, 2.3, 4.8, 7.5]; // segundos, dados fictícios\nconst media = lcp.reduce((a, b) => a + b, 0) / lcp.length;\nconsole.log(\'média:\', media.toFixed(2), \'s\');\nconsole.log(\'p75  :\', percentil(lcp, 75), \'s\');\nconsole.log(percentil(lcp, 75) <= 2.5 ? \'p75 dentro do limiar\' : \'p75 acima do limiar\');\n\n// saída real (Node):\n// média: 2.62 s\n// p75  : 2.3 s\n// p75 dentro do limiar'
          ),
          sl(
            'CLS e INP na prática',
            'CLS: cada salto vale (fração da tela afetada) x (fração da distância percorrida). Imagem sem width/height deixa o navegador sem saber o espaço e empurra o texto quando carrega: sempre declare as dimensões (ou aspect-ratio) e reserve espaço para anúncios, banners e conteúdo que chega depois. Evite inserir conteúdo acima do que a pessoa está lendo. INP: o navegador só desenha a resposta quando a thread principal está livre. Tarefas longas de JavaScript (mais de 50 ms, as long tasks) atrasam tudo. Soluções: dividir o trabalho em pedaços, adiar o que não é urgente, mover cálculo pesado para um Web Worker, evitar re-renderizações enormes (memoização, virtualização de listas).'
          ),
          sl(
            'Causas comuns e orçamentos',
            'LCP lento costuma vir de: imagem principal grande e sem otimização (formato moderno, tamanho certo, srcset), recurso do LCP descoberto tarde (carregado só depois do JS), CSS ou JS que bloqueiam a renderização, servidor lento (TTFB alto) e fontes que atrasam o texto. Um ORÇAMENTO de desempenho é um limite combinado pela equipe (tamanho do JS, LCP máximo no laboratório, número de requisições) que o pipeline verifica a cada alteração, para evitar que o site piore aos poucos. Ferramentas como Lighthouse CI aplicam esses limites (veja a lição de CI/CD). Meça antes de otimizar: o gargalo raramente é onde se imagina.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual métrica mede a estabilidade visual, ou seja, saltos inesperados do layout?', 'd', ['LCP, que mede quanto tempo o maior elemento visível leva para aparecer na tela', 'INP, que mede o atraso entre uma interação e a resposta pintada na tela', 'TTFB, que mede o tempo até o primeiro byte e descreve a estabilidade da página', 'CLS'], 'CLS soma os saltos de layout. LCP mede carregamento do maior elemento, INP mede responsividade, e TTFB mede o tempo até o primeiro byte do servidor (não estabilidade visual).'),
        mcq('q2', 'Qual é a diferença entre dados de laboratório e dados de campo?', 'c', ['Laboratório vem de pessoas reais; campo vem de simulações feitas por uma ferramenta', 'Não há diferença; os dois são sinônimos para qualquer medição de desempenho', 'Laboratório é um teste controlado e reproduzível; campo vem de pessoas reais usando o site', 'Laboratório mede só o servidor e campo mede o código de estilos'], 'Lab é controlado (Lighthouse, DevTools) e campo (RUM, CrUX) vem de usuários reais. Os termos não se invertem, não são sinônimos e não se limitam a servidor ou estilos.'),
        mcq('q3', 'Um site tem média de LCP aceitável, mas uma parte dos visitantes reclama de lentidão. Qual análise ajuda?', 'b', ['Olhar a média, que representa a experiência de qualquer visita', 'Olhar o percentil 75, pois a média esconde as visitas lentas', 'Medir uma vez na máquina do time, que é mais rápida que a de quase todos', 'Ignorar os relatos, porque o laboratório não acusou problema algum'], 'Percentis revelam a cauda de visitas lentas, que a média mascara. Só a média, uma única medição local ou ignorar relatos deixa o problema sem investigação.'),
        fill('q4', 'Complete: para evitar saltos de layout, imagens devem declarar ___ e altura (ou aspect-ratio) para o navegador reservar o espaço.', '<img src="foto.webp" ___="400" height="300" alt="Foto do produto">', ['width'], 'width e height (ou aspect-ratio) permitem reservar o espaço antes da imagem carregar, evitando o salto de layout (CLS).'),
        mcq('q5', 'O INP está ruim porque um clique dispara 300 ms de cálculo em JavaScript. Qual medida ataca a causa?', 'd', ['Aumentar o tamanho das imagens para a tela demorar mais a mostrar a resposta', 'Adicionar mais listeners de clique para o navegador dividir a carga entre eles', 'Remover o atributo alt das imagens para o HTML ficar mais leve', 'Dividir ou adiar o trabalho, e levar o cálculo pesado para um Web Worker'], 'Tarefas longas bloqueiam a thread principal; dividir, adiar ou usar Worker libera a interface. Imagens maiores, mais listeners ou remover alt não resolvem (alt ainda prejudica a acessibilidade).'),
        mcq('q6', 'Para que serve a biblioteca web-vitals na página?', 'c', ['Corrigir automaticamente o código lento sem intervenção da equipe', 'Bloquear o carregamento da página até as métricas ficarem dentro do limite', 'Coletar LCP, INP e CLS no navegador de quem usa o site', 'Substituir o Lighthouse nos testes de laboratório feitos em integração contínua'], 'web-vitals mede em campo e entrega os valores para você enviar. Não corrige código, não bloqueia a página e não troca o Lighthouse de laboratório.'),
        mcq('q7', 'Qual cuidado de privacidade vale ao enviar métricas de RUM ao servidor?', 'a', ['Nunca enviar dados pessoais: só a métrica, a página sem parâmetros e o dispositivo', 'Incluir o nome e o e-mail de quem acessa para facilitar contato com usuários lentos', 'Gravar a URL completa com tokens e filtros para reproduzir o problema depois', 'Anexar o identificador permanente do dispositivo para cruzar com outras bases'], 'RUM não precisa de dados pessoais; query strings podem carregar tokens e identificadores. Incluir nome, e-mail ou ID permanente viola a minimização de dados.'),
        fill('q8', 'Complete: um limite combinado pela equipe, como "o JavaScript não passa de um tamanho X", e verificado no pipeline, chama-se ___ de desempenho.', '// limite verificado a cada alteração: ___ de desempenho', ['orçamento', 'orcamento'], 'Um orçamento de desempenho define limites mensuráveis (tamanho de JS, LCP no laboratório) que o pipeline fiscaliza para evitar regressões.')
      ]
    },
    {
      id: 'fii-42-bundlers-e-divisao-de-codigo',
      title: 'Bundlers e divisão de código',
      goal: 'Entender o que bundlers fazem, tree shaking, chunks, lazy loading nos três frameworks, análise de bundle e dependências pesadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que um bundler faz',
            'O navegador entende módulos JavaScript, mas um projeto real tem centenas de arquivos, TypeScript, JSX/SFC, CSS, imagens e dependências do npm. Um bundler parte de um ponto de entrada, segue os imports, transforma o código (TypeScript, JSX, SFCs) e produz poucos arquivos otimizados: minificados (sem espaços e com nomes curtos), com hash no nome para cache e divididos em partes (chunks). Nomes por conceito: Vite (servidor de desenvolvimento rápido que usa módulos nativos e, no build de produção, o Rollup), Rollup (focado em bibliotecas e módulos ES), webpack (muito configurável, ainda presente em muitos projetos) e outros mais recentes (esbuild, Rspack, Turbopack). A CLI do Angular e os meta-frameworks já trazem um bundler configurado.'
          ),
          sl(
            'Tree shaking',
            'Tree shaking (sacudir a árvore) é remover do bundle o código exportado que ninguém importa. Funciona com módulos ES (import/export estáticos), porque o bundler consegue saber, sem executar, o que é usado. Exemplo: se uma biblioteca exporta 100 funções e você importa uma, as outras devem sumir. Limites: CommonJS (require dinâmico) dificulta; código com efeitos colaterais no topo do módulo (que executa algo ao ser importado) pode ser mantido por cautela, e pacotes bem feitos declaram "sideEffects": false no package.json para liberar a remoção. Importar a biblioteca inteira de um objeto (import _ from \'lib\') pode trazer tudo; importe só o que usa (import { debounce } from \'lib\').',
            '// mini "tree shaking": o que é alcançável a partir da entrada?\nconst modulos = {\n  \'entrada.js\': [\'util-data.js\', \'ui-botao.js\'],\n  \'util-data.js\': [],\n  \'ui-botao.js\': [\'util-texto.js\'],\n  \'util-texto.js\': [],\n  \'relatorio-pdf.js\': [\'util-data.js\'], // ninguém importa\n  \'graficos.js\': []                       // ninguém importa\n};\nfunction alcancaveis(entrada) {\n  const vistos = new Set();\n  (function visita(m) { if (vistos.has(m)) return; vistos.add(m); modulos[m].forEach(visita); })(entrada);\n  return [...vistos];\n}\nconst dentro = alcancaveis(\'entrada.js\');\nconsole.log(\'no bundle :\', dentro.join(\', \'));\nconsole.log(\'removidos :\', Object.keys(modulos).filter((m) => !dentro.includes(m)).join(\', \'));\n\n// saída real (Node):\n// no bundle : entrada.js, util-data.js, ui-botao.js, util-texto.js\n// removidos : relatorio-pdf.js, graficos.js'
          ),
          sl(
            'Divisão de código e lazy loading',
            'Em vez de um bundle único com tudo, divida em chunks carregados sob demanda: o usuário baixa só o necessário para a tela atual. O mecanismo base é o import() dinâmico, que devolve uma promessa e vira um chunk separado. Em React: React.lazy(() => import(\'./Grafico\')) envolvido por <Suspense fallback=...>. Em Vue: defineAsyncComponent(() => import(\'./Grafico.vue\')). Em Angular: rotas com loadComponent ou loadChildren (carregamento preguiçoso por rota) e o bloco @defer no template para adiar componentes até uma condição (visível na tela, ociosidade, interação). Divida por ROTA primeiro (mais ganho, menos complexidade) e depois por componentes pesados e raramente usados.',
            '// ilustrativo, não executado aqui\n// React\nconst Grafico = React.lazy(() => import(\'./Grafico\'));\n<Suspense fallback={<p>Carregando…</p>}><Grafico /></Suspense>\n\n// Vue\nconst Grafico = defineAsyncComponent(() => import(\'./Grafico.vue\'));\n\n// Angular (rota)\n{ path: \'relatorios\', loadComponent: () => import(\'./relatorios.component\').then(m => m.Relatorios) }\n\n// Angular (template)\n@defer (on viewport) { <app-grafico /> } @placeholder { <p>…</p> }'
          ),
          sl(
            'Analisar o bundle',
            'Não adivinhe o que pesa: visualize. Ferramentas por nome: rollup-plugin-visualizer (Vite/Rollup), webpack-bundle-analyzer, source-map-explorer e o relatório de tamanho da CLI do Angular. Elas mostram um mapa em retângulos proporcionais ao tamanho de cada módulo e quem o importa. Procure: bibliotecas inteiras importadas por uma função, duas versões do mesmo pacote, código de desenvolvimento que foi para produção e dependências grandes usadas em uma só tela. Compare o tamanho antes e depois de cada mudança e lembre que o que importa é o tamanho transferido (comprimido com gzip ou brotli) e o custo de executar o JS.'
          ),
          sl(
            'Dependências pesadas',
            'Cada dependência custa tamanho, tempo de execução, superfície de ataque e manutenção. Antes de adicionar, pergunte: o navegador já faz isso? (Intl para datas e números, fetch, URL, structuredClone, dialog); existe uma alternativa menor que cubra só o que preciso?; dá para carregar sob demanda (lazy) só na tela que usa? Casos clássicos: bibliotecas de datas completas com todos os idiomas, editores de texto rico, bibliotecas de gráficos e mapas: carregue com import() dinâmico. Use importações específicas, não a biblioteca inteira. Lembre também de auditar: menos dependências, menos risco na cadeia de suprimentos (veja a lição de segurança).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o tree shaking faz?', 'c', ['Reorganiza as pastas do projeto em ordem alfabética para facilitar a busca', 'Converte módulos ES em CommonJS para o navegador carregar mais rápido', 'Remove do bundle o código exportado que nenhum módulo importa', 'Comprime as imagens do projeto em formatos modernos durante o build'], 'Tree shaking elimina código não usado a partir da análise estática de imports e exports. Não reorganiza pastas, não converte para CommonJS (que até o dificulta) e não comprime imagens.'),
        mcq('q2', 'Qual mecanismo cria um chunk separado, carregado sob demanda?', 'd', ['A instrução import estática no topo do arquivo, que entra no mesmo bundle', 'O comando require executado em um laço dentro do componente raiz', 'Um comentário especial no HTML que o navegador lê antes de montar a página', 'O import() dinâmico, que devolve uma promessa'], 'import() dinâmico gera um chunk à parte. O import estático vai para o mesmo bundle, require em laço atrapalha a análise e comentários HTML não controlam divisão de código.'),
        mcq('q3', 'Qual é o primeiro nível recomendado para dividir o código de uma aplicação com várias telas?', 'a', ['Por rota, carregando cada tela sob demanda', 'Por função, criando um arquivo para cada função de cada módulo da aplicação', 'Por linha de código, pois quanto mais chunks pequenos melhor o desempenho', 'Não dividir, mantendo um único arquivo para que o cache seja usado uma só vez'], 'Dividir por rota traz o maior ganho com menos complexidade. Dividir por função ou linha gera excesso de requisições, e o arquivo único obriga a baixar tudo de uma vez.'),
        fill('q4', 'Complete a função do React que carrega um componente de forma preguiçosa a partir de um import() dinâmico.', 'const Grafico = React.___(() => import(\'./Grafico\'));', ['lazy'], 'React.lazy aceita uma função que devolve import() e deve ser usado dentro de <Suspense> com um fallback.'),
        mcq('q5', 'Um pacote exporta 100 funções e você usa só uma, mas o bundle ficou grande. Qual causa é plausível?', 'b', ['O bundler duplica automaticamente cada função usada para evitar falhas de execução', 'Importar o pacote inteiro, ou o pacote não suportar tree shaking', 'O navegador baixa as funções restantes em segundo plano para uso futuro', 'O Vite desativa a minificação quando detecta mais de dez exportações no pacote'], 'Importação ampla ou pacote em CommonJS/com efeitos colaterais impede o tree shaking. O bundler não duplica funções, o navegador não baixa extras e o Vite não desativa a minificação por esse motivo.'),
        mcq('q6', 'Qual é o objetivo de usar uma ferramenta como rollup-plugin-visualizer ou webpack-bundle-analyzer?', 'c', ['Traduzir automaticamente os textos da interface para outros idiomas durante o build', 'Corrigir vulnerabilidades de segurança do código sem revisão do time', 'Mostrar quais módulos pesam mais no bundle e quem os importa, para decidir o que otimizar', 'Aumentar o tamanho do bundle para garantir que o cache seja renovado a cada versão'], 'Analisadores mapeiam tamanho e origem dos módulos, guiando a otimização. Não traduzem textos, não corrigem vulnerabilidades sozinhos e não aumentam o bundle de propósito.'),
        mcq('q7', 'Antes de adicionar uma dependência para formatar datas, qual pergunta faz mais sentido?', 'b', ['Qual biblioteca tem mais estrelas, independentemente do tamanho que acrescenta?', 'O recurso nativo Intl já resolve o que preciso, sem custo extra de bundle?', 'Como incluir os idiomas disponíveis, para não ter de mudar depois?', 'Como importar o pacote inteiro para garantir que não falte função?'], 'Preferir APIs nativas reduz tamanho, risco e manutenção. Popularidade sem olhar o custo, incluir todos os idiomas e importar tudo contrariam os cuidados com dependências.'),
        fill('q8', 'Complete o bloco de template do Angular que adia o carregamento de um componente até uma condição, como entrar na área visível.', '@___ (on viewport) { <app-grafico /> } @placeholder { <p>…</p> }', ['defer'], '@defer carrega o conteúdo sob demanda, com gatilhos como viewport, idle e interaction, e @placeholder mostra algo até lá.')
      ]
    },
    {
      id: 'fii-43-bibliotecas-de-componentes-e-monorepos',
      title: 'Bibliotecas de componentes e monorepos',
      goal: 'Publicar uma biblioteca de componentes, organizar um monorepo com workspaces, usar versionamento semântico, peer dependencies e documentação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que ter uma biblioteca de componentes',
            'Quando várias aplicações precisam dos mesmos botões, campos e padrões, copiar e colar gera inconsistência. Uma biblioteca de componentes é um pacote versionado, publicado num registro (o npm público ou um registro privado da empresa), que as aplicações instalam como qualquer dependência. Ela costuma implementar o design system que você viu na primeira metade do intermediário. Decisões iniciais: para qual framework (React, Vue, Angular, ou Web Components, que funcionam em todos); como estilizar (CSS próprio, variáveis); quanto é acessível por padrão; e como o time consumidor poderá personalizar sem copiar o código.'
          ),
          sl(
            'O que vai no package.json de uma biblioteca',
            'Campos importantes: name e version; exports (e, por compatibilidade, main e module), que dizem ao bundler onde está o código para cada formato; types, com os tipos TypeScript; files, a lista do que entra no pacote publicado (só a pasta dist, sem testes e sem arquivos internos); sideEffects, para liberar o tree shaking; e peerDependencies. O build da biblioteca (Vite no modo biblioteca, tsup, Rollup, ou o ng-packagr no Angular) gera código em módulos ES com os tipos, sem empacotar o framework dentro. Segurança de publicação: nunca versione o token do npm (use o segredo do CI), ative autenticação em dois fatores na conta e considere a publicação com proveniência (o registro registra de qual build veio o pacote).',
            '{\n  "name": "@exemplo/ui",\n  "version": "1.4.2",\n  "type": "module",\n  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } },\n  "files": ["dist"],\n  "sideEffects": false,\n  "peerDependencies": { "react": ">=18", "react-dom": ">=18" }\n}'
          ),
          sl(
            'Peer dependencies',
            'Uma dependência normal é instalada junto com a biblioteca, em versão própria. Para um framework isso é um problema: se a sua biblioteca de componentes React trouxesse seu próprio React, a aplicação teria DOIS Reacts e hooks quebrariam (cada cópia tem seu estado interno). Uma peerDependency diz: "esta biblioteca precisa de React, mas da cópia que a APLICAÇÃO já tem, numa faixa de versões compatível". O gerenciador de pacotes avisa se a versão instalada estiver fora da faixa. O mesmo vale para Vue e Angular. Regra: o framework (e o que precisa ser único na aplicação) vai em peerDependencies, e também em devDependencies para você testar localmente; o que é detalhe interno vai em dependencies.'
          ),
          sl(
            'Versionamento semântico (semver)',
            'Versões têm três números MAJOR.MINOR.PATCH. PATCH sobe em correções que não mudam a API; MINOR sobe ao ADICIONAR funcionalidade de modo compatível; MAJOR sobe em mudança incompatível (remover prop, mudar comportamento). Quem consome escreve faixas: ^1.4.2 aceita 1.x.x a partir de 1.4.2 (sobe minor e patch, não o major); ~1.4.2 aceita só patches (1.4.x). Por isso a biblioteca precisa respeitar o contrato: remover uma prop num minor quebra a aplicação de quem usa ^. Ferramentas como Changesets (por nome) ajudam a registrar cada mudança, gerar o changelog e subir versões de vários pacotes. O código mostra a regra do acento circunflexo.',
            'function aceitaCircunflexo(faixa, versao) {\n  const [maj, min, pat] = faixa.replace(\'^\', \'\').split(\'.\').map(Number);\n  const [vM, vm, vp] = versao.split(\'.\').map(Number);\n  if (vM !== maj) return false;\n  if (vm !== min) return vm > min;\n  return vp >= pat;\n}\nfor (const v of [\'1.4.2\', \'1.4.9\', \'1.9.0\', \'2.0.0\', \'1.3.9\']) {\n  console.log(\'^1.4.2 aceita\', v.padEnd(6), \'->\', aceitaCircunflexo(\'^1.4.2\', v));\n}\n\n// saída real (Node):\n// ^1.4.2 aceita 1.4.2  -> true\n// ^1.4.2 aceita 1.4.9  -> true\n// ^1.4.2 aceita 1.9.0  -> true\n// ^1.4.2 aceita 2.0.0  -> false\n// ^1.4.2 aceita 1.3.9  -> false'
          ),
          sl(
            'Monorepos, workspaces e documentação',
            'Um monorepo guarda vários pacotes e aplicações no mesmo repositório (por exemplo, packages/ui, packages/utils, apps/painel). Os gerenciadores npm, pnpm e yarn têm workspaces: instalam tudo de uma vez e ligam os pacotes locais entre si sem publicar. Ferramentas como Turborepo e Nx (por nome) adicionam execução de tarefas em ordem de dependência e cache de resultados, rodando só o que mudou. Vantagens: mudança atômica entre pacote e consumidor, ferramentas compartilhadas. Custos: configuração, builds mais lentos sem cache, permissões do repositório. Documente: Storybook mostra cada componente com variações e controles, serve de documentação viva e de base para testes visuais e de acessibilidade; acrescente um README com instalação e exemplos, e um changelog.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma biblioteca de componentes React lista react em dependencies e as aplicações ficam com duas cópias do React, quebrando hooks. Qual é a correção?', 'd', ['Fixar uma versão exata de react em dependencies para que fique idêntica à da aplicação', 'Copiar o código do React para dentro da pasta dist da biblioteca antes de publicar', 'Remover react do package.json e importá-lo de uma URL pública em tempo de execução', 'Mover react para peerDependencies, usando a cópia da aplicação'], 'Peer dependency faz a biblioteca usar o React que a aplicação já instalou, evitando duplicidade. Fixar versão ou embutir o framework mantém duas cópias, e importar de URL pública cria risco de cadeia de suprimentos.'),
        mcq('q2', 'Você corrigiu um bug sem mudar a API pública de uma biblioteca na versão 1.4.2. Qual número deve subir?', 'a', ['PATCH, resultando em 1.4.3', 'MAJOR, resultando em 2.0.0, porque todo bug exige que as aplicações revisem o código', 'MINOR, resultando em 1.5.0, porque qualquer alteração é considerada uma nova funcionalidade', 'Número algum, pois correções não geram versão nova no registro'], 'Correção compatível é PATCH. MAJOR é para mudanças incompatíveis, MINOR para funcionalidades novas compatíveis, e correções também precisam de nova versão para serem publicadas.'),
        mcq('q3', 'A aplicação declara "^1.4.2". Qual versão ela aceita automaticamente?', 'c', ['2.0.0, pois ^ permite subir qualquer número para a versão mais nova', '1.3.9, pois ^ aceita também versões anteriores à indicada', '1.9.0, pois ^ permite subir minor e patch mantendo o major', '1.4.2, pois ^ trava exatamente a versão escrita'], '^ aceita atualizações compatíveis dentro do mesmo major, a partir da versão indicada. Não cruza o major, não aceita versões menores que a base e não é uma trava exata.'),
        fill('q4', 'Complete o campo do package.json que lista o que entra no pacote publicado, como apenas a pasta dist.', '{ "name": "@exemplo/ui", "___": ["dist"] }', ['files'], 'O campo files restringe o conteúdo publicado, evitando enviar testes, configurações e arquivos internos.'),
        mcq('q5', 'Qual é a vantagem de usar workspaces em um monorepo?', 'a', ['Instalar tudo junto e ligar pacotes locais sem publicar', 'Publicar os pacotes com a mesma versão obrigatoriamente, em um só comando', 'Dispensar o uso de controle de versão, já que há um único diretório', 'Impedir que dois pacotes dependam um do outro, o que evita ciclos'], 'Workspaces conectam pacotes locais e unificam a instalação. Não obrigam versão única, não substituem controle de versão e dependências entre pacotes continuam permitidas.'),
        mcq('q6', 'Qual prática de segurança vale na hora de publicar a biblioteca no npm?', 'd', ['Colocar o token no package.json para o pipeline conseguir publicar sem configuração', 'Compartilhar a senha da conta do registro com toda a equipe em um canal de chat', 'Publicar da máquina pessoal de alguém, sem registrar de onde veio o build', 'Guardar o token só no CI e nunca no repositório, com 2FA'], 'Segredo no CI, 2FA e proveniência reduzem o risco de sequestro e adulteração. Token no package.json, senha compartilhada e publicação sem rastreio são práticas inseguras.'),
        mcq('q7', 'Para que serve o Storybook em uma biblioteca de componentes?', 'b', ['Substituir o gerenciador de pacotes e publicar a biblioteca automaticamente', 'Documentar cada componente com variações interativas, servindo também de base para testes visuais e de acessibilidade', 'Compilar o código TypeScript da biblioteca em um único arquivo para produção', 'Armazenar os dados dos usuários que consomem a biblioteca nas aplicações'], 'Storybook é um catálogo vivo de componentes. Não substitui o gerenciador de pacotes, não é o compilador de produção e não armazena dados de usuários.'),
        fill('q8', 'Complete: o formato de versão com três números, como 1.4.2, chama-se versionamento ___.', '// MAJOR.MINOR.PATCH segue o versionamento ___', ['semântico', 'semantico', 'semver'], 'Versionamento semântico (semver) usa MAJOR.MINOR.PATCH para comunicar o impacto de cada mudança nos consumidores.')
      ]
    },
    {
      id: 'fii-44-seguranca-intermediaria-no-front',
      title: 'Segurança intermediária no front-end',
      goal: 'Entender CSP e Trusted Types em conceito, sanitização, cadeia de suprimentos do npm, SRI e o uso seguro de iframes e postMessage.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Defesa em camadas contra XSS',
            'Na primeira metade do curso você viu que frameworks escapam texto por padrão e que dangerouslySetInnerHTML, v-html, [innerHTML] e bypassSecurityTrust* são as portas perigosas. Esta lição acrescenta camadas: mesmo que um erro deixe passar um script injetado, políticas do navegador podem impedir a execução. A ideia de defesa em camadas é não depender de um único controle: escape por padrão, sanitização quando HTML é inevitável, CSP, Trusted Types e dependências confiáveis. Para o aprofundamento de XSS e cabeçalhos de segurança, veja o curso de Segurança Web (OWASP).'
          ),
          sl(
            'CSP (Content Security Policy) em conceito',
            'A CSP é um cabeçalho de resposta (Content-Security-Policy) em que o servidor diz ao navegador DE ONDE o site pode carregar recursos e se pode executar scripts inline. Exemplo de diretivas: default-src \'self\' (só da própria origem), script-src \'self\' (scripts só de arquivos do próprio site), img-src, connect-src (para onde fetch/WebSocket podem ir), frame-ancestors (quem pode embutir seu site). Uma política que não permite scripts inline bloqueia a execução de um script injetado no HTML. Quando você precisa de um script inline, use um nonce (valor aleatório por resposta, repetido no atributo do script) em vez de liberar tudo com \'unsafe-inline\'. Comece em modo de relatório (Content-Security-Policy-Report-Only) para ver o que quebraria. SPAs e meta-frameworks têm guias de CSP: confira a documentação do seu.',
            '# ilustrativo, não executado aqui (cabeçalho HTTP de resposta)\nContent-Security-Policy: default-src \'self\'; script-src \'self\' \'nonce-<VALOR_ALEATORIO_POR_RESPOSTA>\'; img-src \'self\' data:; connect-src \'self\' https://api.exemplo.invalid; frame-ancestors \'self\''
          ),
          sl(
            'Trusted Types e sanitização',
            'Trusted Types (recurso de navegadores que o suportam; confira a compatibilidade) fazem o navegador RECUSAR atribuir texto comum a pontos perigosos como innerHTML: só aceitam um valor "confiável", criado por uma política que você define e audita num lugar só. Assim, qualquer innerHTML espalhado pelo código passa a falhar, em vez de virar XSS silencioso. Quando precisar mesmo exibir HTML vindo de fora (um texto rico), SANITIZE com uma biblioteca mantida como a DOMPurify, que remove scripts e atributos perigosos de uma lista de permissões: não escreva um sanitizador com expressões regulares. Primeira opção: exibir como TEXTO, que é seguro por padrão.',
            '// ilustrativo, não executado aqui\nimport DOMPurify from \'dompurify\';\n\n// vulnerável: HTML externo direto no DOM\n// el.innerHTML = comentario.html;\n\n// corrigido: sanitizar com lista de permissões enxuta\nel.innerHTML = DOMPurify.sanitize(comentario.html, { ALLOWED_TAGS: [\'b\', \'i\', \'em\', \'strong\', \'a\', \'p\'], ALLOWED_ATTR: [\'href\'] });'
          ),
          sl(
            'Cadeia de suprimentos do npm e SRI',
            'A maior parte do código do seu bundle vem de dependências, e dependências de dependências. Riscos: pacote comprometido, nome parecido com um popular (typosquatting), scripts de instalação (postinstall) que executam código na sua máquina. Medidas: commitar o lockfile e instalar com npm ci (versões exatas do lockfile); rodar npm audit e ferramentas de atualização com revisão de PR; revisar pacotes novos (mantenedores, atividade, tamanho); reduzir dependências; desligar scripts de instalação onde possível; limitar permissões de tokens no CI. SRI (Subresource Integrity): ao carregar um script ou CSS de uma CDN, o atributo integrity guarda o hash esperado do arquivo e o navegador recusa se o conteúdo mudou. Prefira servir você mesmo os arquivos.',
            '<!-- ilustrativo, não executado aqui -->\n<script src="https://cdn.exemplo.invalid/lib.min.js"\n        integrity="sha384-<HASH_DO_ARQUIVO>"\n        crossorigin="anonymous"></script>'
          ),
          sl(
            'iframes e postMessage',
            'Um iframe embute outra página. Para conteúdo de terceiros, use o atributo sandbox (que remove poderes por padrão: scripts, formulários, navegação) e libere só o necessário; use também allow para recursos como câmera apenas quando preciso. Para impedir que OUTROS sites embutam o seu (clickjacking), use frame-ancestors na CSP. A comunicação entre janelas usa postMessage, e o erro clássico é confiar em qualquer mensagem: o receptor DEVE verificar event.origin contra uma lista de origens permitidas e validar o formato dos dados; o emissor deve informar um targetOrigin específico, nunca \'*\' para dados sensíveis. O código mostra a verificação de origem (as origens usadas são fictícias).',
            'const PERMITIDAS = new Set([\'https://app.exemplo.invalid\', \'https://widget.exemplo.invalid\']);\n\n// vulnerável (não faça): window.addEventListener(\'message\', (e) => aplicar(e.data));\n// corrigido: confere a origem e o formato antes de usar\nfunction tratar(evento) {\n  if (!PERMITIDAS.has(evento.origin)) return \'ignorada: origem não permitida\';\n  const d = evento.data;\n  if (!d || typeof d !== \'object\' || d.tipo !== \'altura\' || !Number.isFinite(d.valor)) return \'ignorada: formato inválido\';\n  return \'aplicada: altura \' + Math.min(Math.max(d.valor, 0), 2000);\n}\nconsole.log(tratar({ origin: \'https://widget.exemplo.invalid\', data: { tipo: \'altura\', valor: 480 } }));\nconsole.log(tratar({ origin: \'https://outro-site.invalid\', data: { tipo: \'altura\', valor: 480 } }));\nconsole.log(tratar({ origin: \'https://widget.exemplo.invalid\', data: { tipo: \'altura\', valor: \'x\' } }));\n\n// saída real (Node):\n// aplicada: altura 480\n// ignorada: origem não permitida\n// ignorada: formato inválido'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que a CSP (Content Security Policy) faz?', 'd', ['Criptografa o tráfego entre o navegador e o servidor, no lugar do HTTPS', 'Valida o login da pessoa e emite o cookie de sessão após a autenticação', 'Remove automaticamente do código-fonte as dependências que têm vulnerabilidades', 'Diz ao navegador de onde carregar recursos e bloqueia o resto'], 'A CSP é uma política de carregamento e execução aplicada pelo navegador. Não criptografa o tráfego (isso é HTTPS), não autentica e não remove dependências.'),
        mcq('q2', 'Por que usar nonce na CSP em vez de liberar \'unsafe-inline\'?', 'a', ['O nonce permite apenas o script inline marcado com o valor aleatório da resposta, e não qualquer script inline injetado', 'O nonce criptografa o script inline para que ninguém o consiga ler no navegador', 'O nonce dispensa o uso de CSP, pois já autoriza a execução dos scripts', 'O nonce obriga o navegador a baixar o script de novo a cada visita, sem cache'], 'O nonce restringe a execução a scripts marcados com o valor imprevisível daquela resposta. Não criptografa, não dispensa a política e não trata de cache.'),
        mcq('q3', 'Um texto rico vindo de usuários precisa ser exibido como HTML. Qual abordagem é adequada?', 'b', ['Remover a palavra script com uma expressão regular antes de inserir com innerHTML', 'Sanitizar com biblioteca mantida (DOMPurify) e lista de permissões', 'Confiar no HTML porque o formulário de entrada já exigiu login para enviar', 'Inserir com innerHTML e esperar que o navegador bloqueie o conteúdo perigoso'], 'Sanitizadores mantidos conhecem muitas variações de ataque. Expressões regulares são contornáveis, login não garante conteúdo seguro e o navegador não bloqueia innerHTML por conta própria sem uma política.'),
        fill('q4', 'Complete o comando que instala exatamente as versões do lockfile, indicado para pipelines.', 'npm ___', ['ci'], 'npm ci instala a partir do lockfile de forma reprodutível e falha se ele estiver incoerente com o package.json.'),
        mcq('q5', 'Qual é a função do atributo integrity (SRI) em uma tag de script de CDN?', 'c', ['Acelerar o carregamento do script, reaproveitando o cache de outras páginas do domínio', 'Criptografar o arquivo da CDN para que só o seu site consiga lê-lo', 'Fazer o navegador recusar o arquivo se o conteúdo não tiver o hash esperado', 'Impedir que o script acesse a internet depois de carregado na página'], 'SRI compara o hash do arquivo ao valor declarado e bloqueia alterações. Não acelera, não criptografa e não restringe a rede.'),
        mcq('q6', 'Para embutir um widget de terceiros com mais segurança, qual atributo reduz seus poderes por padrão?', 'd', ['hidden no iframe, que impede o widget de executar scripts em segundo plano', 'target="_blank" no iframe, que o isola em outra janela do sistema', 'title no iframe, que bloqueia o acesso do widget ao cookie da página', 'sandbox no iframe, liberando só o que for necessário'], 'sandbox remove permissões como scripts e formulários e você libera só o preciso. hidden só oculta, target não se aplica ao isolamento do iframe e title é um rótulo de acessibilidade.'),
        mcq('q7', 'Qual verificação deve existir no receptor de postMessage?', 'b', ['Aceitar qualquer origem, pois a mensagem só traz texto e texto é inofensivo', 'Sempre comparar event.origin com origens permitidas e validar os dados', 'Confiar na mensagem se o campo "remetente" dentro dos dados disser que é o próprio site', 'Executar o conteúdo da mensagem com eval para checar se ele é válido'], 'A origem vem do navegador e não pode ser forjada pelo conteúdo; o formato também precisa de validação. Aceitar tudo, confiar em campo declarado dentro dos dados ou usar eval é perigoso.'),
        fill('q8', 'Complete o cabeçalho que informa ao navegador de onde recursos podem ser carregados e executados.', '___-Security-Policy: default-src \'self\'', ['Content'], 'Content-Security-Policy é o cabeçalho da CSP; Content-Security-Policy-Report-Only permite testar a política sem bloquear.')
      ]
    },
    {
      id: 'fii-45-analytics-consentimento-e-privacidade',
      title: 'Analytics, consentimento e privacidade',
      goal: 'Medir uso do produto respeitando privacidade: consentimento e CMP, analytics com privacidade, eventos sem dados pessoais e minimização.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que medir e o que pode dar errado',
            'Analytics responde perguntas do produto: quais telas são usadas, onde as pessoas abandonam, se uma mudança melhorou algo. O risco está em medir demais: coletar identificadores, histórico de navegação ou dados digitados vira tratamento de dados pessoais, com obrigações legais (a LGPD, Lei 13.709/2018, em visão geral) e risco de vazamento. Princípios: coletar só o necessário para uma pergunta definida (finalidade e minimização), agregar sempre que possível, reter por pouco tempo, e informar com clareza. Esta lição é conceitual e NÃO substitui orientação jurídica: o enquadramento exato do seu caso deve ser validado com o jurídico ou o encarregado de dados da organização.'
          ),
          sl(
            'Cookies, consentimento e CMP',
            'Cookies e identificadores se dividem em categorias: estritamente necessários (sessão, segurança, balanceamento), de preferências, de estatística/analytics e de marketing. Em geral, os necessários não dependem de consentimento (mas devem ser informados), e os demais dependem de consentimento prévio, livre e informado, com opção de recusar tão fácil quanto aceitar, e de mudar de ideia depois. Uma CMP (Consent Management Platform) é a ferramenta que mostra o aviso, registra a escolha e a expõe ao seu código. Regra técnica: scripts de analytics e marketing só devem ser CARREGADOS depois do consentimento; carregar primeiro e "bloquear depois" não vale. O código mostra o padrão de carregamento condicional.',
            '// ilustrativo, não executado aqui\nfunction aoMudarConsentimento(escolha) {\n  // escolha vem da CMP: { estatistica: true/false, marketing: true/false }\n  if (escolha.estatistica) carregarScript(\'/analytics.js\');\n  // sem consentimento, nada é carregado nem enviado\n}'
          ),
          sl(
            'Analytics com privacidade',
            'Existem ferramentas projetadas para medir sem identificar pessoas: não usam cookies de longa duração nem cruzam dados entre sites, agregam os números e podem ser hospedadas por você (exemplos por nome: Plausible, Matomo configurado para privacidade, Umami). Isso pode reduzir (não eliminar) as obrigações de consentimento e melhora a velocidade, mas o enquadramento depende da configuração e da lei: confirme com o jurídico. Boas configurações: anonimizar o IP, não registrar identificadores persistentes, respeitar sinais do navegador como Global Privacy Control e Do Not Track, definir retenção curta e limitar quem acessa os relatórios.'
          ),
          sl(
            'Eventos sem dados pessoais',
            'Um evento de analytics tem um nome ("assinatura_iniciada") e propriedades ("plano: básico"). Erros comuns de privacidade: colocar e-mail, nome, CPF ou texto digitado nas propriedades; deixar tokens e e-mails na URL que é enviada junto (query strings como ?email=... ou ?token=...); usar o ID do usuário como identificador de evento sem necessidade. Boas práticas: lista fechada de nomes e propriedades permitidos, valores categóricos em vez de texto livre, remover a query string da URL registrada, e uma função central que filtra tudo antes de enviar. O código mostra um filtro com lista de permissão, com dados fictícios.',
            'const PERMITIDAS = new Set([\'plano\', \'origem\', \'etapa\']);\nconst EMAIL = /[^\\s@]+@[^\\s@]+\\.[^\\s@]+/;\n\nfunction limparEvento(nome, props, url) {\n  const seguras = {};\n  for (const [k, v] of Object.entries(props)) {\n    if (!PERMITIDAS.has(k)) continue;                 // lista de permissão\n    if (typeof v === \'string\' && EMAIL.test(v)) continue; // não envia e-mail\n    seguras[k] = v;\n  }\n  const u = new URL(url);\n  return { nome, props: seguras, pagina: u.origin + u.pathname }; // sem query string\n}\nconsole.log(limparEvento(\n  \'assinatura_iniciada\',\n  { plano: \'basico\', email: \'usuario@example.com\', origem: \'usuario@example.com\', etapa: 2 },\n  \'https://exemplo.invalid/planos?token=<SEGREDO>&email=usuario@example.com\'\n));\n\n// saída real (Node):\n// {\n//   nome: \'assinatura_iniciada\',\n//   props: { plano: \'basico\', etapa: 2 },\n//   pagina: \'https://exemplo.invalid/planos\'\n// }'
          ),
          sl(
            'Retenção, acesso e comunicação',
            'Defina por quanto tempo cada dado de analytics é mantido e apague depois (retenção); limite quem vê os relatórios e registre acessos; evite enviar dados brutos a terceiros sem contrato e sem saber para onde vão (transferência internacional é tema para o jurídico). Informe na política de privacidade o que é medido e por quê, e ofereça um caminho simples para exercer direitos (como pedir acesso ou exclusão, previstos na LGPD em visão geral). Teste: se o relatório continuar útil sem o dado, não colete. E lembre que os mesmos cuidados valem para logs de erro, gravação de sessões e mapas de calor: eles podem capturar campos digitados; mascare formulários.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual princípio orienta a escolha de quais dados coletar em analytics?', 'a', ['Minimização: coletar só o necessário para uma pergunta definida, por tempo limitado', 'Coletar os dados possíveis agora e decidir o uso depois que houver volume', 'Coletar dados que o usuário não percebe, para não incomodá-lo com avisos', 'Coletar o máximo e anonimizar quando houver uma reclamação formal'], 'Minimização liga a coleta a uma finalidade clara e a retenção limitada. Coletar tudo, esconder da pessoa ou anonimizar só depois de reclamação contraria a transparência e a boa prática.'),
        mcq('q2', 'Quando um script de analytics que depende de consentimento deve ser carregado?', 'c', ['Na primeira renderização da página, com o bloqueio feito depois se a pessoa recusar', 'Assim que a pessoa rolar a página, já que rolar equivale a consentir', 'Só depois de a pessoa consentir, e nunca antes disso', 'Sempre, pois o consentimento só afeta o que é exibido nos relatórios'], 'O carregamento condicional impede que dados sejam enviados antes da escolha. Carregar antes, tratar rolagem como consentimento ou ignorar a escolha não respeita o consentimento livre e informado.'),
        mcq('q3', 'O que é uma CMP?', 'c', ['Um componente visual que guarda as senhas de quem usa o site no navegador', 'Uma biblioteca de compressão que reduz o tamanho dos arquivos de analytics', 'Uma plataforma que mostra o aviso de cookies e registra a escolha', 'Um cabeçalho de segurança que bloqueia scripts de terceiros automaticamente'], 'CMP (Consent Management Platform) gerencia o aviso e o registro de consentimento. Não guarda senhas, não comprime arquivos e não é um cabeçalho HTTP de segurança.'),
        fill('q4', 'Complete a sigla da plataforma que gerencia o consentimento de cookies da pessoa.', '// plataforma de gerenciamento de consentimento: ___', ['CMP'], 'CMP significa Consent Management Platform: mostra o aviso, registra e aplica a escolha da pessoa.'),
        mcq('q5', 'Qual evento de analytics respeita melhor a privacidade?', 'b', ['assinatura_iniciada com a propriedade email: "usuario@example.com"', 'assinatura_iniciada com a propriedade plano: "basico"', 'assinatura_iniciada com a URL completa, incluindo ?token=<SEGREDO>', 'assinatura_iniciada com o texto livre digitado pela pessoa no formulário'], 'Valores categóricos e sem identificação cumprem a minimização. E-mail, token na URL ou texto livre podem conter dados pessoais ou segredos.'),
        mcq('q6', 'A URL da página será enviada junto com os eventos. Qual tratamento é adequado?', 'a', ['Registrar só origem e caminho, descartando a query string, que pode carregar tokens e e-mails', 'Enviar a URL completa, pois a query string existe só para facilitar a filtragem', 'Substituir letras maiúsculas por minúsculas e manter os parâmetros', 'Codificar a query string em base64 e enviá-la, o que a torna anônima'], 'Query strings frequentemente trazem dados sensíveis, então descartá-las é mais seguro. Enviar tudo, mudar a caixa das letras ou usar base64 (que é só codificação, reversível) não protege nada.'),
        mcq('q7', 'Qual afirmação sobre analytics com privacidade (como as ferramentas citadas) é a mais precisa?', 'd', ['Elas eliminam qualquer obrigação legal, então o aviso de privacidade fica dispensado', 'Elas funcionam sem coletar dado algum, por isso dispensam a escolha de uma finalidade', 'Elas só podem ser instaladas em servidores de terceiros fora do seu controle', 'Reduzem a coleta, mas o enquadramento legal exige validação jurídica'], 'Essas ferramentas ajudam, mas não dispensam avisos nem análise jurídica. Elas coletam algum dado agregado, e várias podem ser hospedadas por você mesmo.'),
        fill('q8', 'Complete o princípio: coletar apenas o necessário para a finalidade chama-se ___ de dados.', '// princípio de coletar só o necessário: ___ de dados', ['minimização', 'minimizacao'], 'Minimização de dados é coletar e reter apenas o necessário para uma finalidade definida; é o princípio central dessa lição.')
      ]
    },
    {
      id: 'fii-46-css-moderno-para-layouts-complexos',
      title: 'CSS moderno para layouts complexos',
      goal: 'Usar grid avançado, container queries, :has(), camadas (@layer), variáveis e tipografia fluida para layouts responsivos com poucas media queries.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Grid que se adapta sozinho',
            'Com CSS Grid você descreve colunas e deixa o navegador decidir quantas cabem. A combinação repeat(auto-fit, minmax(16rem, 1fr)) significa: crie quantas colunas de no mínimo 16rem couberem na linha e divida o espaço restante igualmente. Em telas estreitas vira uma coluna, em largas várias, sem nenhuma media query. grid-template-areas permite desenhar o layout com nomes ("cabecalho", "menu", "conteudo") e reorganizar só trocando o desenho. gap define o espaçamento entre células (melhor que margens individuais). Em navegadores recentes, subgrid permite que um item alinhe suas linhas com as do grid pai; confira a compatibilidade antes de depender dele.',
            '/* ilustrativo, não executado aqui */\n.cartoes {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));\n  gap: 1rem;\n}\n\n.pagina {\n  display: grid;\n  grid-template-areas: "topo topo" "menu principal";\n  grid-template-columns: 14rem 1fr;\n}'
          ),
          sl(
            'Container queries',
            'Media queries olham para a largura da JANELA. Mas um componente (um cartão) pode aparecer numa coluna estreita ou larga da MESMA janela, e quer se adaptar ao espaço que tem. Container queries resolvem: você marca um ancestral como contêiner (container-type: inline-size) e escreve regras com @container que dependem da largura DELE. Isso torna o componente realmente reutilizável, independente de onde é colocado, ideal para bibliotecas de componentes. Como é um recurso relativamente novo, verifique o suporte nos navegadores que você atende e ofereça um layout básico como fallback.',
            '/* ilustrativo, não executado aqui */\n.cartao-wrapper { container-type: inline-size; }\n\n.cartao { display: block; }\n@container (min-width: 30rem) {\n  .cartao { display: grid; grid-template-columns: 8rem 1fr; gap: 1rem; }\n}'
          ),
          sl(
            ':has() e camadas @layer',
            ':has() é o "seletor pai": form:has(:invalid) seleciona o formulário que contém algum campo inválido; .cartao:has(img) estiliza só cartões com imagem. Antes era preciso JavaScript. O custo é de desempenho em seletores muito amplos, então use com escopo. @layer organiza a cascata em camadas ordenadas: declare @layer base, componentes, utilitarios; e tudo que está numa camada posterior vence a anterior, independentemente da especificidade dos seletores. Isso resolve brigas de especificidade entre CSS de biblioteca, de componentes e utilitários (por exemplo, o Tailwind usa camadas). Estilos fora de qualquer camada vencem os que estão em camadas.',
            '/* ilustrativo, não executado aqui */\n@layer base, componentes, utilitarios;\n\n@layer base { a { color: var(--cor-link); } }\n@layer componentes { .botao a { color: white; } }\n\nform:has(:invalid) .aviso { display: block; }'
          ),
          sl(
            'Variáveis CSS e tipografia fluida',
            'Custom properties (--cor-primaria: #1d4ed8; usadas com var(--cor-primaria)) vivem na cascata, podem ser redefinidas por componente, tema (claro/escuro) ou contêiner, e podem ser lidas e alteradas por JavaScript. São a base de temas e de design tokens. Tipografia fluida: clamp(mínimo, preferido, máximo) mantém o tamanho entre limites e o faz crescer com a largura da tela, sem saltos entre breakpoints: font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem). Use rem (relativo à preferência do usuário) e não pixels fixos, para respeitar quem aumenta a fonte do navegador por acessibilidade. O código calcula o resultado de uma clamp para várias larguras.',
            '// clamp(min, preferido, max) com preferido = 0.8rem + 1vw (1rem = 16px)\nconst clamp = (min, pref, max) => Math.min(Math.max(min, pref), max);\nfor (const largura of [320, 600, 900, 1200, 1600]) {\n  const pref = 0.8 * 16 + 0.01 * largura; // px\n  const tam = clamp(16, pref, 24);\n  console.log(String(largura).padStart(4), \'px de tela ->\', tam.toFixed(1), \'px de fonte\');\n}\n\n// saída real (Node):\n//  320 px de tela -> 16.0 px de fonte\n//  600 px de tela -> 18.8 px de fonte\n//  900 px de tela -> 21.8 px de fonte\n// 1200 px de tela -> 24.0 px de fonte\n// 1600 px de tela -> 24.0 px de fonte'
          ),
          sl(
            'Responsivo com poucas media queries',
            'Receita atual: comece pelo layout mais simples (celular), use grid auto-fit/minmax e flex-wrap para as colunas se ajustarem, clamp() para tamanhos de fonte e espaçamentos, container queries para componentes e deixe media queries para decisões de PÁGINA (esconder uma barra lateral, trocar a navegação). Meça em unidades relativas (rem, %, fr, ch) e evite larguras fixas em pixels. Teste com zoom de 200% e fonte maior; teste também preferências do usuário via media queries de característica: prefers-color-scheme (tema escuro), prefers-reduced-motion (menos movimento) e prefers-contrast. Responsividade também é acessibilidade: nada de conteúdo cortado ou rolagem horizontal ao ampliar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que repeat(auto-fit, minmax(16rem, 1fr)) faz em um grid?', 'd', ['Cria exatamente dezesseis colunas, cada uma com um espaço de largura igual', 'Fixa as colunas em 16rem e deixa o conteúdo ultrapassar a largura quando ela faltar', 'Repete o primeiro item da lista dezesseis vezes para preencher a linha da grade', 'Cria quantas colunas de 16rem ou mais couberem na linha'], 'auto-fit com minmax adapta o número de colunas ao espaço disponível. Não cria um número fixo, não impede a adaptação e não duplica itens.'),
        mcq('q2', 'Por que uma container query torna um componente mais reutilizável do que uma media query?', 'c', ['Ela reage à altura do monitor do usuário, e não à largura da janela do navegador', 'Ela funciona dentro de bibliotecas de componentes e é ignorada em páginas comuns', 'Ela reage à largura do contêiner do componente, não à da janela, onde quer que ele esteja', 'Ela substitui o uso de rem e de unidades relativas por pixels no componente'], 'A container query se adapta ao espaço disponível ao componente. Não depende da altura do monitor, funciona em qualquer página e não troca unidades relativas por pixels.'),
        mcq('q3', 'O que o seletor form:has(:invalid) seleciona?', 'a', ['Formulários que contêm pelo menos um campo inválido', 'Campos inválidos que estão fora de qualquer formulário na página', 'Os formulários, pois :has() devolve o conjunto completo de elementos', 'Formulários que foram enviados com sucesso ao servidor da aplicação'], ':has() seleciona o elemento que contém algo que corresponda ao argumento. Não seleciona só campos soltos, não devolve tudo e não sabe do envio ao servidor.'),
        fill('q4', 'Complete a regra que declara a ordem das camadas da cascata.', '@___ base, componentes, utilitarios;', ['layer'], '@layer declara camadas ordenadas: camadas posteriores vencem as anteriores independentemente da especificidade.'),
        mcq('q5', 'Qual função CSS mantém um valor entre um mínimo e um máximo, crescendo de forma fluida com a largura?', 'b', ['calc(mínimo + máximo), que soma os dois limites a cada tamanho de tela', 'clamp(mínimo, preferido, máximo)', 'var(--mínimo), que lê uma variável com o tamanho mínimo da tela', 'min(preferido), que escolhe o primeiro valor informado pela folha'], 'clamp limita um valor preferido entre dois extremos. calc apenas calcula, var lê variáveis e min com um único argumento não impõe limite superior e inferior.'),
        mcq('q6', 'Qual escolha respeita melhor quem aumenta a fonte padrão do navegador por acessibilidade?', 'd', ['Fixar os tamanhos em pixels para o layout não se alterar', 'Bloquear o zoom da página com a meta tag do viewport', 'Usar vw puro para o tamanho do texto, sem limite mínimo', 'Usar rem e clamp com rem nos tamanhos'], 'rem acompanha a preferência de fonte da pessoa. Pixels fixos, bloqueio de zoom e vw sem limites prejudicam a ampliação e a legibilidade.'),
        mcq('q7', 'Onde as media queries ainda fazem mais sentido no CSS moderno?', 'c', ['Em cada componente reutilizável, para ajustar espaçamentos internos dele', 'Em cada propriedade de cor, para criar centenas de variações de tema', 'Em decisões de página inteira, como trocar a navegação ou esconder a barra lateral', 'Em lugar algum, pois foram removidas do CSS pelos navegadores'], 'Media queries seguem úteis para layout geral da página; componentes ficam melhor com container queries. Elas não foram removidas e não servem para multiplicar variações de cor.'),
        fill('q8', 'Complete a propriedade que marca um elemento como contêiner para container queries de largura.', '.cartao-wrapper { container-___: inline-size; }', ['type'], 'container-type: inline-size faz o elemento servir de referência de largura para regras @container dos seus descendentes.')
      ]
    },
    {
      id: 'fii-52-css-avancado-sass-css-in-js-e-tailwind',
      title: 'CSS avançado: Sass, CSS-in-JS e Tailwind',
      goal: 'Comparar Sass, CSS Modules, CSS-in-JS e Tailwind, escolher por critérios, organizar tokens de design e evitar injeção de CSS com entrada do usuário.',
      xp: 20,
      intro: {
        slides: [
          sl('O problema que cada abordagem tenta resolver', 'CSS puro tem três dores clássicas em aplicações grandes: escopo global (um .titulo em uma tela afeta outra), repetição (a mesma cor ou espaçamento copiada em dezenas de lugares) e estilos mortos (ninguém sabe se pode apagar uma regra). As ferramentas desta lição atacam isso de formas diferentes: Sass/SCSS acrescenta recursos de linguagem e compila para CSS; CSS Modules isola nomes por arquivo; CSS-in-JS escreve estilos em JavaScript junto do componente; Tailwind usa classes utilitárias pequenas direto no HTML. Nenhuma é "a certa": cada uma troca um custo por outro, e a escolha depende de critérios que você verá no fim.'),
          sl('Sass/SCSS: variáveis, aninhamento e mixins', 'Sass é um pré-processador: você escreve em .scss e uma etapa de build produz CSS comum. Variáveis ($cor-primaria) guardam valores; aninhamento escreve seletores filhos dentro do pai; mixins (@mixin e @include) reutilizam blocos de declarações, com parâmetros. Diferença importante para o CSS atual: variáveis Sass são resolvidas no BUILD e somem do resultado, enquanto as custom properties do CSS (--cor) existem no navegador e podem mudar em tempo de execução, o que é o que permite trocar para tema escuro sem recarregar. O CSS nativo também ganhou aninhamento em navegadores recentes; confira a compatibilidade antes de depender. Erro comum: aninhar seletores em muitos níveis, gerando CSS pesado e difícil de sobrescrever.', '// _tokens.scss\n$cor-primaria: #2563eb;\n$espaco: 8px;\n\n@mixin centralizar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.cartao {\n  padding: $espaco * 2;\n  border: 1px solid $cor-primaria;\n  @include centralizar;\n\n  &:hover { background: lighten($cor-primaria, 45%); } // aninhamento com &\n  .titulo { font-weight: 600; }                      // vira .cartao .titulo\n}\n/* ilustrativo, não executado aqui */'),
          sl('CSS Modules e escopo por componente', 'Um arquivo .module.css (ou .module.scss) tem nomes de classe LOCAIS: o build troca .titulo por um nome único (algo como Cartao_titulo_x7f3) e entrega ao JavaScript um objeto que mapeia o nome original para o gerado. Duas telas podem ter .titulo sem colidir. O Vue tem recurso parecido com style scoped, e o Angular isola por padrão os estilos de cada componente (encapsulamento de visualização); o resultado é o mesmo: escopo por componente sem convenções de nomes. Para algo realmente global (reset, tokens) use um arquivo global ou :global. Erro comum: tentar sobrescrever de fora uma classe de módulo usando o nome original, que não existe no HTML final.', '/* Cartao.module.css */\n.titulo { font-weight: 600; }\n\n// React\nimport estilos from \'./Cartao.module.css\';\n<h2 className={estilos.titulo}>Resumo</h2>\n\n<!-- Vue: escopo por atributo gerado -->\n<style scoped> .titulo { font-weight: 600; } </style>\n\n// Angular: cada componente tem styles/styleUrl isolados por padrão\n@Component({ selector: \'app-cartao\', styles: \'.titulo { font-weight: 600; }\', template: \'<h2 class="titulo">Resumo</h2>\' })\n/* ilustrativo, não executado aqui */'),
          sl('CSS-in-JS: styled-components e emotion', 'Em bibliotecas como styled-components e emotion você declara estilos dentro do JavaScript, em geral com template literals, e eles podem depender de props ou do tema ativo. Vantagens: estilo colado ao componente, remoção automática junto com ele e valores dinâmicos fáceis. Custos reais: no modelo de RUNTIME, o CSS é gerado e injetado no documento enquanto o componente renderiza no navegador, o que soma JavaScript ao bundle, trabalho na renderização e complexidade extra com renderização no servidor e com Server Components. Por isso surgiram opções de "zero-runtime", que extraem o CSS em tempo de build. Se usar a abordagem de runtime, meça o impacto nos Core Web Vitals. Ela é mais comum em bases de código React; no Vue e no Angular os recursos nativos de escopo costumam bastar.', '// styled-components (ilustrativo)\nconst Botao = styled.button`\n  padding: 8px 16px;\n  background: ${(p) => (p.$destaque ? \'#2563eb\' : \'#e5e7eb\')};\n  color: ${(p) => (p.$destaque ? \'#fff\' : \'#111\')};\n`;\n<Botao $destaque>Salvar</Botao>\n/* ilustrativo, não executado aqui */'),
          sl('Tailwind em profundidade', 'Tailwind é um conjunto de classes utilitárias: cada classe faz uma coisa (p-4 define padding, flex ativa flexbox, text-sm reduz o texto). Você compõe a aparência no próprio HTML ou JSX. Variantes aplicam utilitários sob condição: hover:, focus:, md: (a partir de uma largura), dark:. O tema (cores, espaçamentos, fontes) é configurável e funciona como seus tokens. O build escaneia os arquivos procurando nomes de classe COMPLETOS e gera só o CSS usado, o que mantém o resultado pequeno. Armadilha clássica: montar o nome por concatenação, como bg-${cor}-500; o escaneamento não enxerga a classe e ela não existe no CSS final. Use um mapa com nomes completos. Também evite abusar de @apply para recriar CSS tradicional: extraia um COMPONENTE reutilizável em vez de uma classe.', '// ERRADO: o escaneamento não encontra a classe montada\n<div className={\'bg-\' + cor + \'-500\'} />\n\n// CERTO: nomes completos, mapeados a partir de uma lista fechada\nconst FUNDO = { sucesso: \'bg-green-500\', erro: \'bg-red-500\', aviso: \'bg-amber-500\' };\n<div className={FUNDO[tipo] ?? \'bg-gray-500\'} />\n\n// variantes\n<button className="rounded px-4 py-2 hover:bg-blue-700 focus-visible:ring md:px-6 dark:bg-blue-400">Salvar</button>\n/* ilustrativo, não executado aqui */'),
          sl('Tokens de design e escolha por critérios', 'Tokens de design são os valores nomeados que definem a identidade visual (cores, espaçamentos, raios, tipografia). A forma mais portátil é guardá-los como custom properties do CSS: funcionam em qualquer abordagem desta lição, mudam em tempo de execução (tema escuro) e podem ser lidos por Sass, Tailwind ou CSS-in-JS. Para escolher, use critérios: tamanho e experiência da equipe; necessidade de tema dinâmico; uso de renderização no servidor e custo de JavaScript no cliente; reaproveitamento entre frameworks; facilidade de revisar e remover estilos. Exemplo de leitura: uma equipe pequena, com SSR e meta de pouco JavaScript no cliente, tende a preferir CSS Modules ou Tailwind a CSS-in-JS de runtime; um sistema de design compartilhado entre React, Vue e Angular se beneficia de tokens como custom properties.', ':root {\n  --cor-fundo: #ffffff;\n  --cor-texto: #111827;\n  --raio: 8px;\n}\n[data-tema=\'escuro\'] {\n  --cor-fundo: #0f172a;\n  --cor-texto: #e5e7eb;\n}\n.cartao {\n  background: var(--cor-fundo);\n  color: var(--cor-texto);\n  border-radius: var(--raio);\n}\n/* ilustrativo, não executado aqui */'),
          sl('Segurança: não interpolar entrada do usuário em estilos', 'Estilos também recebem entrada. Se você monta uma string de CSS (ou um bloco style) com texto vindo do usuário, a pessoa pode inserir declarações extras: esconder botões, sobrepor a tela com um falso formulário ou fazer o navegador buscar uma imagem em endereço externo por meio de url(), vazando que a página foi aberta. É a injeção de CSS, parente do XSS. O mesmo vale para valores soltos passados a styled-components, a :style do Vue ou a [style] do Angular. Correção: aceite só valores de uma lista fechada (allowlist) ou valide o formato (por exemplo, cor em hexadecimal) e aplique o resultado em uma custom property, nunca monte CSS concatenando texto livre. Para a visão completa de injeções, veja o curso de Segurança Web (OWASP).', '// VULNERÁVEL: texto livre vira CSS\nelemento.setAttribute(\'style\', \'background:\' + corDoUsuario);\n\n// CORRIGIDO: lista fechada, valor validado, aplicado em custom property\nconst CORES = { azul: \'#2563eb\', verde: \'#16a34a\', cinza: \'#6b7280\' };\nconst cor = CORES[corDoUsuario] ?? CORES.cinza;\nelemento.style.setProperty(\'--cor-destaque\', cor);\n/* ilustrativo, não executado aqui */')
        ]
      },
      questions: [
        mcq('q1', 'O produto precisa deixar a pessoa alternar entre tema claro e escuro sem recarregar a página. Qual recurso resolve isso?', 'd', [
          'Variáveis do Sass, porque ficam disponíveis no navegador e mudam quando a classe do tema é trocada.',
          'Mixins do Sass, que recompilam o CSS do tema no navegador quando a pessoa clica no botão.',
          'Um arquivo .module.css por tema, já que o nome de classe gerado muda sozinho conforme a preferência da pessoa.',
          'Custom properties do CSS, porque existem no navegador e podem ter o valor trocado em tempo de execução.'
        ], 'Custom properties vivem no CSS entregue ao navegador e podem ser redefinidas, por exemplo em [data-tema]. Variáveis e mixins do Sass são resolvidos no build e não existem em tempo de execução, e CSS Modules resolve colisão de nomes, não troca de tema.'),
        mcq('q2', 'Duas telas do projeto definem uma classe .titulo em seus próprios arquivos .module.css. O que acontece no resultado final?', 'a', [
          'Cada .titulo recebe um nome gerado único, então as duas telas não interferem uma na outra.',
          'O estilo da última tela carregada vence e a primeira passa a usar a regra errada.',
          'O build interrompe com erro de classe duplicada, pois nomes iguais são proibidos entre módulos.',
          'As duas regras são mescladas em uma só, e as propriedades repetidas somam seus valores.'
        ], 'CSS Modules gera nomes locais únicos por arquivo e entrega um objeto de mapeamento ao JavaScript, eliminando colisões. Não há sobreposição de escopo, erro de build por nomes iguais nem mescla de regras.'),
        mcq('q3', 'Qual é o principal custo extra do CSS-in-JS no modelo de runtime?', 'c', [
          'O CSS fica proibido de usar props do componente, o que limita os estilos dinâmicos a valores fixos escritos no código.',
          'Os estilos deixam de ser removidos junto com o componente e se acumulam no documento durante a navegação.',
          'Os estilos são gerados e injetados durante a renderização no navegador, somando JavaScript e trabalho, e complicando o SSR.',
          'O navegador passa a ignorar regras vindas de JavaScript, e por isso é preciso gerar também um arquivo .css separado.'
        ], 'No runtime, a biblioteca precisa executar código para produzir e inserir o CSS, o que pesa no bundle, na renderização e no servidor. Props dinâmicas são justamente um ponto forte, a remoção junto do componente é uma vantagem, e o navegador aplica normalmente o CSS injetado.'),
        fill('q4', 'Complete o mixin do Sass: a palavra que declara um bloco reutilizável de declarações.', '@___ centralizar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.cartao { @include centralizar; }', ['mixin'], 'Em Sass, @mixin declara o bloco reutilizável e @include o aplica onde for preciso, com parâmetros opcionais.'),
        mcq('q5', 'Em Tailwind, o código usa className={\'bg-\' + cor + \'-500\'} e a cor não aparece na tela. Qual é a causa e a correção?', 'd', [
          'O Tailwind não aceita cores dinâmicas; é preciso trocar para estilos inline com style em todo o projeto.',
          'A concatenação gera um nome inválido; basta reiniciar o servidor de desenvolvimento para o CSS ser regenerado.',
          'O prefixo bg- foi renomeado no tema; a correção é redefinir as cores no arquivo de configuração e manter a concatenação.',
          'O build só encontra nomes de classe completos no código; use um mapa que associe cada tipo ao nome inteiro da classe.'
        ], 'O escaneamento procura os nomes completos no texto dos arquivos, então a classe montada por concatenação nunca é gerada. Um mapa com nomes completos resolve e ainda funciona como lista fechada. Cores dinâmicas são possíveis assim, e reiniciar ou mexer no tema não muda o que o escaneamento enxerga.'),
        mcq('q6', 'Uma equipe pequena usa SSR e quer reduzir o JavaScript enviado ao cliente. Qual escolha de estilos combina melhor?', 'b', [
          'CSS-in-JS de runtime, porque o estilo gerado no navegador não aumenta o JavaScript do bundle.',
          'CSS Modules ou Tailwind, que entregam CSS extraído no build sem trabalho de estilos em runtime.',
          'Estilos inline em cada elemento, que dispensam arquivo CSS e portanto não pesam no carregamento.',
          'Sass com os estilos aninhados em um único arquivo global, que o navegador carrega uma vez.'
        ], 'Abordagens que extraem o CSS no build não executam código de estilo no cliente, alinhando-se à meta. O CSS-in-JS de runtime soma JavaScript e trabalho na renderização, estilos inline perdem reuso e variantes como hover, e um arquivo global monolítico traz de volta o problema de escopo.'),
        mcq('q7', 'Um campo de perfil deixa a pessoa digitar a cor de destaque, e o código monta a string de estilo com ela. Qual correção é adequada?', 'a', [
          'Aceitar só cores de uma lista fechada (ou validadas) e aplicá-las em uma custom property.',
          'Remover as aspas e os ponto e vírgula do texto digitado antes de concatenar na string de estilo.',
          'Validar a cor no formulário do navegador, pois o CSS é interpretado só no cliente.',
          'Mover a string de estilo para o servidor e concatenar lá o mesmo texto, que então fica protegido.'
        ], 'Lista fechada ou formato validado impede que texto livre vire declarações CSS, e a custom property recebe apenas valor conhecido. Filtrar alguns caracteres é incompleto, validação só no formulário é UX e não segurança, e mover a concatenação de lugar não muda o problema.'),
        fill('q8', 'Complete a leitura de um token definido como custom property.', ':root { --cor-fundo: #ffffff; }\n.cartao { background: ___(--cor-fundo); }', ['var'], 'A função var() lê o valor de uma custom property, e como o valor é resolvido no navegador, trocar --cor-fundo em outro seletor muda a aparência em tempo de execução.')
      ]
    },
    {
      id: 'fii-47-tipagem-avancada-em-frontend',
      title: 'Tipagem avançada em front-end',
      goal: 'Usar TypeScript com props genéricas, tipos de eventos, uniões discriminadas para estado, inferência a partir de schemas e tipos utilitários.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Props genéricas',
            'Um componente genérico funciona com vários tipos e mantém a segurança. Em vez de uma lista que aceita any, escreva function Lista<T>(props: { itens: T[]; renderizar: (item: T) => ReactNode }): quem usa passa itens de um tipo e o parâmetro da função de renderização já vem com esse tipo, sem cast. O mesmo existe em Vue (<script setup lang="ts" generic="T">) e em Angular (classes de componente com parâmetro de tipo, e input<T>() para entradas). O uso de any desliga a verificação e deve ser exceção; prefira unknown (que obriga a checar antes de usar) quando o tipo é realmente desconhecido, como respostas de API sem validação.',
            '// ilustrativo, não executado aqui\ntype ListaProps<T> = { itens: T[]; renderizar: (item: T) => React.ReactNode };\n\nfunction Lista<T>({ itens, renderizar }: ListaProps<T>) {\n  return <ul>{itens.map((i, idx) => <li key={idx}>{renderizar(i)}</li>)}</ul>;\n}\n\n// item é inferido como { id: number; nome: string }\n<Lista itens={usuarios} renderizar={(item) => item.nome} />'
          ),
          sl(
            'Tipos de eventos e saídas dos componentes',
            'Eventos do DOM têm tipos próprios. Em React: React.ChangeEvent<HTMLInputElement> para o onChange de um input (então e.target.value é string), React.MouseEvent<HTMLButtonElement> para cliques e React.FormEvent<HTMLFormElement> para formulários. Em Vue, defineEmits tipado descreve cada evento e o tipo do que carrega: defineEmits<{ salvar: [nome: string] }>(). Em Angular, output<string>() tipa o que o EventEmitter/saída emite e o $event no template é inferido. Beneficio comum: errar o tipo do argumento do evento vira erro de compilação, não bug em produção. Props de componentes pais e filhos passam a formar um contrato verificado.',
            '// ilustrativo, não executado aqui\n// React\nconst aoDigitar = (e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value);\n\n// Vue\nconst emit = defineEmits<{ salvar: [nome: string] }>();\nemit(\'salvar\', nome.value);\n\n// Angular\nsalvar = output<string>();'
          ),
          sl(
            'Uniões discriminadas para estado',
            'Um erro clássico é modelar a busca de dados com vários booleanos independentes: { carregando: boolean; erro?: string; dados?: Usuario[] } permite estados impossíveis (carregando e com erro ao mesmo tempo). Uma união discriminada usa um campo literal (o discriminante) para que cada estado só tenha os dados que fazem sentido: { estado: \'ocioso\' } | { estado: \'carregando\' } | { estado: \'sucesso\'; dados: Usuario[] } | { estado: \'erro\'; mensagem: string }. O TypeScript estreita o tipo quando você checa o discriminante, e com um switch exaustivo (com never no default) ele avisa se você esquecer um estado. O mesmo modelo serve para React, Vue e Angular. Este exemplo roda com o recurso de remoção de tipos do Node.',
            'type Estado =\n  | { estado: \'ocioso\' }\n  | { estado: \'carregando\' }\n  | { estado: \'sucesso\'; dados: string[] }\n  | { estado: \'erro\'; mensagem: string };\n\nfunction mostrar(s: Estado): string {\n  switch (s.estado) {\n    case \'ocioso\': return \'Clique para buscar\';\n    case \'carregando\': return \'Carregando...\';\n    case \'sucesso\': return s.dados.length + \' itens\';      // aqui s.dados existe\n    case \'erro\': return \'Falha: \' + s.mensagem;           // aqui s.mensagem existe\n    default: { const _exaustivo: never = s; return _exaustivo; }\n  }\n}\nconsole.log(mostrar({ estado: \'carregando\' }));\nconsole.log(mostrar({ estado: \'sucesso\', dados: [\'Ana Teste\', \'Bruno Teste\'] }));\nconsole.log(mostrar({ estado: \'erro\', mensagem: \'sem conexão\' }));\n\n// saída real (Node):\n// Carregando...\n// 2 itens\n// Falha: sem conexão'
          ),
          sl(
            'Inferência a partir de schemas',
            'Tipos do TypeScript só existem na COMPILAÇÃO: uma resposta de API ou um formulário chega em tempo de execução com qualquer forma, e um "as Usuario" não verifica nada. Bibliotecas de schema (Zod, Valibot e semelhantes, por nome) validam os dados em tempo de execução E geram o tipo TypeScript a partir do mesmo schema, sem duplicar a definição: const Usuario = z.object({ nome: z.string(), idade: z.number() }); type Usuario = z.infer<typeof Usuario>. Use na fronteira do sistema: parse das respostas da API e validação de formulários. Lembre: validação no cliente é UX; o servidor valida de novo.',
            '// ilustrativo, não executado aqui\nimport { z } from \'zod\';\n\nconst Usuario = z.object({ nome: z.string().min(1), email: z.string().email() });\ntype Usuario = z.infer<typeof Usuario>; // { nome: string; email: string }\n\nconst resultado = Usuario.safeParse(dadosDaApi);\nif (!resultado.success) { /* tratar sem expor detalhes internos */ }'
          ),
          sl(
            'Tipos utilitários',
            'O TypeScript traz tipos prontos que derivam novos tipos de existentes, evitando repetição: Partial<T> (todas as propriedades opcionais, útil para atualização parcial), Required<T> (todas obrigatórias), Pick<T, \'a\' | \'b\'> (só essas chaves), Omit<T, \'senha\'> (todas menos essas, ótimo para remover campos sensíveis do que a interface recebe), Record<K, V> (objeto com chaves K e valores V), Readonly<T> e ReturnType<typeof fn>. Regra: derive tipos de uma fonte única em vez de copiá-los, para que uma mudança no modelo apareça em todo lugar. Props de um componente que envolve outro podem usar React.ComponentProps<\'button\'> para herdar as props nativas.',
            'type Usuario = { id: number; nome: string; email: string; senhaHash: string };\n\ntype UsuarioPublico = Omit<Usuario, \'senhaHash\'>;        // remove campo sensível\ntype AtualizacaoUsuario = Partial<Pick<Usuario, \'nome\' | \'email\'>>;\n\nconst u: Usuario = { id: 1, nome: \'Ana Teste\', email: \'usuario@example.com\', senhaHash: \'<HASH>\' };\nconst { senhaHash, ...publico }: Usuario = u;\nconst atualizacao: AtualizacaoUsuario = { nome: \'Ana T.\' };\nconsole.log(publico as UsuarioPublico);\nconsole.log(atualizacao);\n\n// saída real (Node):\n// { id: 1, nome: \'Ana Teste\', email: \'usuario@example.com\' }\n// { nome: \'Ana T.\' }'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual vantagem tem uma props genérica Lista<T> em relação a uma lista com itens: any[]?', 'a', ['O tipo dos itens é inferido e propagado à função de renderização, sem casts', 'Ela remove a necessidade de passar itens, pois o tipo T gera os dados sozinho', 'Ela faz o componente rodar mais rápido no navegador, pois T é otimizado', 'Ela só funciona em React, pois Vue e Angular não aceitam parâmetros de tipo'], 'Genéricos mantêm a relação entre o tipo dos itens e o uso deles. T não gera dados, não afeta desempenho em tempo de execução, e Vue e Angular também suportam genéricos.'),
        mcq('q2', 'Qual é o tipo adequado para o evento do onChange de um <input> em React com TypeScript?', 'b', ['React.MouseEvent<HTMLInputElement>, porque todo evento de input é do tipo mouse', 'React.ChangeEvent<HTMLInputElement>, de modo que e.target.value é string', 'any, porque eventos do DOM não podem ser tipados com precisão', 'string, porque o evento é substituído pelo valor digitado antes de chegar à função'], 'ChangeEvent descreve alterações do campo e tipa e.target. MouseEvent é para cliques, any desliga a checagem e o manipulador recebe o objeto de evento, não a string.'),
        mcq('q3', 'Por que uma união discriminada é melhor do que { carregando: boolean; erro?: string; dados?: X[] } para modelar uma busca?', 'a', ['Ela impede estados impossíveis e estreita o tipo pelo discriminante', 'Ela permite combinar carregando e erro ao mesmo tempo, o que simplifica o código', 'Ela é convertida em um banco de dados em tempo de execução e guarda os estados', 'Ela só vale para funções síncronas, evitando promessas na camada de interface'], 'Cada estado carrega só os dados válidos nele. Permitir combinações é justamente o problema dos booleanos, uniões não viram banco de dados e funcionam com código assíncrono.'),
        fill('q4', 'Complete o tipo que exige tratar todos os casos de uma união em um switch exaustivo (nenhum valor possível restante).', 'default: { const _exaustivo: ___ = s; return _exaustivo; }', ['never'], 'never indica que nenhum valor pode chegar ali; se um estado novo for adicionado e não tratado, o compilador acusa erro nessa atribuição.'),
        mcq('q5', 'Por que usar Zod (ou similar) na resposta de uma API em vez de apenas escrever "as Usuario"?', 'b', ['Porque o as torna a aplicação mais lenta ao converter cada resposta recebida', 'Porque o as não verifica nada; o schema valida e gera o tipo', 'Porque o schema dispensa a validação feita pelo servidor no back-end', 'Porque o Zod envia as respostas para um serviço externo conferir o formato'], 'O as só afirma ao compilador um tipo que não foi verificado; o schema valida de verdade e infere o tipo. Não dispensa a validação do servidor e roda localmente, sem serviço externo.'),
        mcq('q6', 'Qual tipo utilitário cria uma versão de Usuario sem o campo senhaHash?', 'c', ['Partial<Usuario>, que remove os campos considerados sensíveis automaticamente', 'Pick<Usuario, \'senhaHash\'>, que remove o campo informado e mantém os demais', 'Omit<Usuario, \'senhaHash\'>', 'Readonly<Usuario>, que oculta os campos que não podem ser alterados'], 'Omit remove as chaves indicadas. Partial torna campos opcionais, Pick mantém só as chaves listadas (o oposto) e Readonly impede escrita, sem ocultar nada.'),
        mcq('q7', 'Quando faz sentido usar unknown em vez de any?', 'd', ['Quando se quer desativar a verificação de tipos dentro de uma função inteira', 'Quando se quer que o compilador aceite qualquer operação sem avisar erro algum', 'Quando o valor vem de um componente, pois unknown é exclusivo de props', 'Quando o tipo é realmente desconhecido, pois unknown obriga a checar o valor antes de usá-lo'], 'unknown mantém a segurança exigindo estreitamento. any desliga a verificação, e unknown não é exclusivo de props.'),
        fill('q8', 'Complete o tipo utilitário que torna todas as propriedades de um tipo opcionais, útil para atualizações parciais.', 'type Atualizacao = ___<Usuario>;', ['Partial'], 'Partial<T> transforma todas as propriedades em opcionais; combinado com Pick, restringe quais campos podem ser atualizados.')
      ]
    },
    {
      id: 'fii-48-ci-cd-e-qualidade-no-frontend',
      title: 'CI/CD e qualidade no front-end',
      goal: 'Montar um pipeline com lint, tipos, testes e build, medir com Lighthouse CI, usar preview deploys, proteger segredos e revisar PRs.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O pipeline de um front-end',
            'Integração contínua (CI) executa verificações automáticas a cada alteração; entrega/implantação contínua (CD) leva o resultado aprovado ao ambiente. Etapas típicas, em ordem de custo crescente: instalar dependências de forma reprodutível (npm ci), lint (regras de código e de acessibilidade), checagem de tipos (tsc --noEmit ou a do framework), testes de unidade e componente, build de produção, testes E2E contra um ambiente de preview e auditorias de desempenho e acessibilidade. Falhar rápido: coloque as etapas baratas antes das caras e interrompa na primeira falha. Use cache de dependências para acelerar. Ferramentas citadas por nome: GitHub Actions e GitLab CI são exemplos de executores de pipeline.',
            '# ilustrativo, não executado aqui (GitHub Actions)\nname: ci\non: pull_request\npermissions:\n  contents: read          # permissões mínimas\njobs:\n  verificar:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 24, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm test\n      - run: npm run build'
          ),
          sl(
            'Lighthouse CI e orçamentos',
            'O Lighthouse CI roda auditorias do Lighthouse (desempenho, acessibilidade, boas práticas, SEO) a cada PR e compara com limites que você define, falhando o pipeline se algo piorar além do aceito (por exemplo, nota de acessibilidade mínima ou LCP máximo em laboratório). Isso transforma o orçamento de desempenho da lição de Core Web Vitals em regra automática. Lembre que medidas de laboratório variam entre execuções: rode algumas vezes e use a mediana, e defina limites realistas. Os resultados de laboratório não substituem a medição em campo.',
            '// ilustrativo, não executado aqui (lighthouserc.json, trecho)\n{\n  "ci": {\n    "assert": {\n      "assertions": {\n        "categories:accessibility": ["error", { "minScore": 0.9 }],\n        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }]\n      }\n    }\n  }\n}'
          ),
          sl(
            'Preview deploys',
            'Um preview deploy publica cada PR em um endereço temporário, para que revisão, design e QA vejam a mudança funcionando antes de ir para produção, e para rodar E2E e auditorias contra ele. Plataformas de hospedagem de front-end geram isso automaticamente. Cuidados de segurança e privacidade: previews não devem expor dados reais (use dados fictícios ou um back-end de teste), devem ter proteção de acesso quando contiverem algo não público, e não devem ser indexados por buscadores (noindex). Apague previews antigos.'
          ),
          sl(
            'Segredos no CI',
            'O pipeline precisa de credenciais (token de deploy, chaves de teste). Regras: guarde em segredos do próprio serviço de CI, NUNCA no repositório, e nunca imprima com echo nem em logs (serviços mascaram valores conhecidos, mas não confie só nisso). Dê a cada token as permissões mínimas e validade curta; use ambientes protegidos para os segredos de produção, liberados só em branches protegidos. Pull requests vindos de forks não devem receber segredos: um código malicioso no PR poderia extraí-los. Lembre que variáveis expostas ao front-end (com prefixo público) vão para o bundle e NÃO são segredos. Dependências e actions de terceiros também são cadeia de suprimentos: fixe versões e revise.'
          ),
          sl(
            'Revisão de PR e proteção de branch',
            'Branch protegido: exigir PR, pipeline verde e ao menos uma aprovação antes de mesclar na principal. Boa revisão em front-end verifica: o comportamento está coberto por testes; o componente é acessível (teclado, rótulos, foco)? há uso de innerHTML/v-html/bypass sem sanitização? algum segredo ou dado pessoal real em código, testes ou capturas de tela? o bundle cresceu? textos estão na estrutura de i18n? PRs pequenos e focados são revisados melhor. Automatize o que for mecânico (formatação, lint) para a revisão humana ficar no que importa. Um modelo de descrição de PR com checklist ajuda. O código simula um pipeline que para na primeira etapa que falha.',
            'function rodarPipeline(etapas) {\n  for (const [nome, passou] of etapas) {\n    console.log((passou ? \'ok     \' : \'FALHOU \') + nome);\n    if (!passou) return \'pipeline interrompido: \' + nome;\n  }\n  return \'pipeline verde\';\n}\nconsole.log(rodarPipeline([[\'npm ci\', true], [\'lint\', true], [\'tipos\', true], [\'testes\', false], [\'build\', true]]));\nconsole.log(rodarPipeline([[\'npm ci\', true], [\'lint\', true], [\'tipos\', true], [\'testes\', true], [\'build\', true]]));\n\n// saída real (Node):\n// ok     npm ci\n// ok     lint\n// ok     tipos\n// FALHOU testes\n// pipeline interrompido: testes\n// ok     npm ci\n// ok     lint\n// ok     tipos\n// ok     testes\n// ok     build\n// pipeline verde'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que colocar lint e checagem de tipos antes dos testes E2E no pipeline?', 'd', ['Porque os testes E2E só funcionam depois que o lint reescreve o código automaticamente', 'Porque o lint substitui os testes e faz as outras etapas serem opcionais', 'Porque a ordem das etapas é definida pelo navegador, e não pela equipe', 'Porque são etapas mais baratas e rápidas, e falhar cedo economiza tempo e recursos'], 'Etapas baratas primeiro detectam problemas com menos custo. O lint não reescreve o código por padrão, não substitui testes e a ordem é definida pela equipe no pipeline.'),
        mcq('q2', 'Para que serve o comando npm ci no pipeline?', 'b', ['Atualizar as dependências para as versões mais novas disponíveis', 'Instalar exatamente as versões do lockfile, de forma reprodutível', 'Copiar o código do projeto para o servidor de produção', 'Compilar os arquivos de estilo em um único arquivo de CSS final'], 'npm ci usa o lockfile para instalação reprodutível. Não atualiza versões, não faz deploy e não compila estilos.'),
        mcq('q3', 'Qual risco justifica não entregar segredos a pull requests de forks?', 'c', ['Os segredos são apagados automaticamente quando o fork altera o package.json', 'Os forks não conseguem executar as etapas do pipeline por limitação de rede', 'Código malicioso no PR poderia extrair os segredos', 'Os segredos viram variáveis públicas assim que o PR é aberto no repositório'], 'Código não confiável executado no pipeline pode capturar segredos disponíveis. Os segredos não se apagam por mudar o package.json, forks podem rodar etapas e eles não se tornam públicos sozinhos.'),
        fill('q4', 'Complete: cada alteração é publicada em um endereço temporário para revisão, chamado de ___ deploy.', '// endereço temporário por PR: ___ deploy', ['preview'], 'Preview deploys publicam cada PR em um ambiente temporário, permitindo revisão visual e testes antes de mesclar.'),
        mcq('q5', 'Uma variável de ambiente com prefixo público do framework contém a chave secreta de um serviço pago. Qual é o problema?', 'a', ['Ela vai para o bundle do front-end e fica visível a qualquer visitante, então não é um segredo', 'Nenhum, pois o prefixo público é só uma convenção de nomes que criptografa o valor', 'Só afeta o ambiente de desenvolvimento, pois o build de produção remove essas variáveis', 'O CI recusa o build, então o problema é detectado antes de qualquer publicação'], 'Variáveis com prefixo público são embutidas no código entregue ao navegador. O prefixo não criptografa, o build de produção as inclui e o CI não recusa o build automaticamente.'),
        mcq('q6', 'O que o Lighthouse CI acrescenta a um pipeline?', 'a', ['Auditorias com limites que falham o pipeline se algo piorar', 'Substitui os testes de componente, pois a nota do Lighthouse cobre a lógica', 'Mede o desempenho real de cada pessoa que usa o site em produção', 'Garante conformidade legal de acessibilidade, dispensando a revisão manual'], 'Lighthouse CI aplica orçamentos de laboratório a cada PR. Não substitui testes de lógica, não é medição de campo e não garante conformidade legal.'),
        mcq('q7', 'Qual item pertence a uma boa revisão de PR em front-end?', 'c', ['Aprovar PRs muito grandes rapidamente, pois o pipeline já confere tudo sozinho', 'Ignorar acessibilidade, deixando esse tema para uma auditoria anual', 'Conferir innerHTML sem sanitização e dados pessoais reais', 'Revisar a formatação do código, que é o único ponto importante'], 'A revisão humana olha segurança, privacidade, acessibilidade e cobertura. Aprovar PRs enormes às pressas, adiar acessibilidade ou limitar a revisão à formatação deixa riscos de fora.'),
        fill('q8', 'Complete: para limitar o que um token do CI pode fazer, aplica-se o princípio do privilégio ___.', '// permissões mínimas: princípio do privilégio ___', ['mínimo', 'minimo'], 'Privilégio mínimo significa conceder apenas as permissões estritamente necessárias, reduzindo o dano caso a credencial vaze.')
      ]
    },
    {
      id: 'fii-56-experimentos-ab-e-feature-flags',
      title: 'Experimentos A/B e feature flags',
      goal: 'Usar feature flags para liberar e desligar recursos com segurança, montar testes A/B com bucket estável por hash, avaliar flags no lugar certo e respeitar privacidade e consentimento.',
      xp: 20,
      intro: {
        slides: [
          sl('Feature flags: liberar sem fazer deploy', 'Uma feature flag (chave de recurso) é uma condição no código que liga ou desliga uma funcionalidade sem novo deploy: if (flags.novoCheckout) { ... } else { ... }. Usos principais: LIBERAÇÃO GRADUAL (ligar para 1%, 10%, 50% e 100% das pessoas, observando erros e métricas a cada passo), KILL SWITCH (um desligamento rápido quando algo dá errado em produção, sem esperar pipeline) e flags de PERMISSÃO ou de plano (recurso só para quem contratou). Desacoplam "publicar código" de "liberar para pessoas". Erro comum: usar flag sem plano de remoção ou sem testar os dois caminhos, deixando um deles quebrar sem ninguém notar.', '// liberação gradual: 20% das pessoas (ilustrativo)\nfunction recursoAtivo(userId, flag) {\n  if (!flag.ligada) return false;                    // kill switch\n  return hash(flag.nome + \':\' + userId) % 100 < flag.percentual;\n}\n\nif (recursoAtivo(usuario.id, flags.novoCheckout)) {\n  mostrarNovoCheckout();\n} else {\n  mostrarCheckoutAtual();\n}\n/* ilustrativo, não executado aqui */'),
          sl('Ciclo de vida e dívida de flags', 'Toda flag tem ciclo de vida: criação (com dono, objetivo e data prevista de remoção), liberação gradual, 100% estável e REMOÇÃO do código dos dois ramos. Flags esquecidas são dívida técnica: cada uma dobra os caminhos possíveis do código (com 10 flags independentes são mais de mil combinações), dificulta testes e leitura, e flags antigas guardam comportamentos que ninguém lembra. Práticas: nomes claros, um dono por flag, lista central com data de expiração, revisão periódica e tarefa de limpeza criada junto com a flag. Distinga flags de curta duração (liberação, experimento), que devem sumir, das permanentes (kill switch operacional, permissão), que precisam de documentação.'),
          sl('Testes A/B: hipótese, amostra e significância', 'Um teste A/B divide as pessoas em grupos aleatórios (A, o controle, e B, a variante) para medir qual versão melhora uma métrica. Etapas: (1) hipótese escrita ("um botão com texto X aumenta a conclusão do cadastro"); (2) métrica primária única, definida antes; (3) tamanho de amostra e duração decididos antes, considerando o efeito mínimo que importa; (4) atribuição aleatória e ESTÁVEL; (5) análise. Significância estatística, em conceito, diz o quão improvável seria ver essa diferença por puro acaso se as versões fossem iguais; é um critério, não garantia. Erros comuns: "espiar" o resultado todo dia e parar quando parece favorável (isso aumenta falsos positivos), testar muitas métricas e destacar a que deu certo, e concluir sem amostra suficiente. Para decisões importantes, conte com quem entende de estatística.'),
          sl('Bucket estável por hash', 'Como decidir o grupo de cada pessoa? Sortear com Math.random a cada visita faz a mesma pessoa ver A hoje e B amanhã, o que contamina o experimento e confunde quem usa o produto. A solução é calcular o grupo a partir de um hash do identificador: hash(experimento + ":" + id) % 100 dá um número de 0 a 99 sempre igual para a mesma entrada, e faixas desse número viram variantes (0 a 49 é A, 50 a 99 é B). Incluir o NOME do experimento no hash faz cada experimento sortear de forma independente (senão quem está em A em um estaria em A em todos). O código abaixo usa FNV-1a, um hash simples e didático (não é criptográfico, e não deve ser usado para segurança); confere estabilidade e mede a distribuição em 10 mil identificadores fictícios.', '// FNV-1a de 32 bits: hash simples e determinístico (didático, não é criptográfico)\nfunction hash(str) {\n  let h = 0x811c9dc5;\n  for (let i = 0; i < str.length; i++) {\n    h ^= str.charCodeAt(i);\n    h = Math.imul(h, 0x01000193) >>> 0;\n  }\n  return h;\n}\n\nfunction bucket(userId, experimento, variantes = [\'A\', \'B\']) {\n  const n = hash(experimento + \':\' + userId) % 100; // 0..99\n  const fatia = 100 / variantes.length;\n  return variantes[Math.min(Math.floor(n / fatia), variantes.length - 1)];\n}\n\nconsole.log(bucket(\'usuario-1\', \'novo-checkout\'), bucket(\'usuario-1\', \'novo-checkout\'));\nconst cont = { A: 0, B: 0 };\nfor (let i = 0; i < 10000; i++) cont[bucket(\'u\' + i, \'novo-checkout\')]++;\nconsole.log(cont);\nconst trio = { A: 0, B: 0, C: 0 };\nfor (let i = 0; i < 9000; i++) trio[bucket(\'u\' + i, \'banner\', [\'A\', \'B\', \'C\'])]++;\nconsole.log(trio);\nlet difere = 0;\nfor (let i = 0; i < 1000; i++) if (bucket(\'u\' + i, \'novo-checkout\') !== bucket(\'u\' + i, \'banner\')) difere++;\nconsole.log(\'mudam de grupo entre experimentos:\', difere, \'de 1000\');'),
          sl('Saída real e como interpretar', 'Saída real do programa anterior em Node (abaixo). A primeira linha mostra a estabilidade: o mesmo identificador cai no mesmo grupo nas duas chamadas. Com 10 mil identificadores, a divisão ficou muito perto de 50/50, e com três variantes ficou perto de um terço cada; pequenas diferenças são normais, pois a divisão é pseudoaleatória. A última linha compara dois experimentos: 611 de 1000 pessoas mudaram de grupo, ou seja, os grupos não ficam colados de um experimento para outro (nome do experimento no hash). Para dois sorteios totalmente independentes com duas variantes o esperado seria perto de 500; o desvio vem de o FNV-1a ser um hash simples, com alguma correlação entre entradas parecidas. Em produção use um hash de melhor dispersão e confira a distribuição.', '// saída real (Node)\nB B\n{ A: 4996, B: 5004 }\n{ A: 3060, B: 2952, C: 2988 }\nmudam de grupo entre experimentos: 611 de 1000'),
          sl('Cliente x servidor, nada sensível e flicker', 'Onde avaliar a flag? No SERVIDOR (ou na borda, perto do usuário) você decide antes de montar a resposta: nenhuma regra vaza, o HTML já vem na variante certa e não há piscada. No CLIENTE a avaliação depende de baixar a configuração, e tudo que chega ao navegador é público e pode ser alterado por quem abrir as ferramentas de desenvolvimento. Por isso: envie ao cliente só o resultado do que a interface precisa (por exemplo, { novoCheckout: true }), nunca regras de segmentação, listas de e-mails ou nomes de recursos secretos; e jamais use flag de cliente como proteção de acesso, a autorização é do servidor. FLICKER é a piscada em que a página mostra a versão A e troca para B, quebrando a experiência e gerando deslocamento de layout (CLS, visto na lição de Core Web Vitals). Evite decidindo a variante antes da primeira renderização (SSR/borda) ou segurando a renderização daquela parte por pouco tempo, com espaço reservado. Em React, Vue e Angular o padrão de organização é o mesmo: um provedor central (Context, provide/inject ou Pinia, serviço com signal) expõe as flags já avaliadas.', '// React (ilustrativo): provedor central de flags já avaliadas\nconst FlagsContext = createContext({});\nexport const useFlag = (nome) => useContext(FlagsContext)[nome] ?? false;\n\nfunction Checkout() {\n  const novo = useFlag(\'novoCheckout\');\n  return novo ? <CheckoutNovo /> : <CheckoutAtual />;\n}\n\n// Vue:     provide(\'flags\', flags)  /  const flags = inject(\'flags\')\n// Angular: @Injectable({ providedIn: \'root\' }) class Flags { novoCheckout = signal(false); }\n/* ilustrativo, não executado aqui */'),
          sl('Privacidade, consentimento e ética em experimentos', 'Um experimento mede comportamento, e medir comportamento de pessoas é tratamento de dados. Boas práticas: use um identificador aleatório e pseudônimo (um id gerado, não o e-mail nem o CPF) como chave do bucket; colete só as métricas necessárias para a hipótese; defina por quanto tempo os dados ficam e apague depois; evite enviar identificadores a ferramentas de terceiros sem necessidade e sem contrato adequado; descreva experimentos e analytics na política de privacidade; e peça consentimento quando a base legal escolhida exigir, junto com um jeito simples de recusar (veja a lição de analytics, consentimento e privacidade). A LGPD (Lei 13.709/2018), em visão geral, exige finalidade, necessidade e transparência; qual base legal se aplica a cada caso é questão para orientação jurídica, que esta lição não substitui. Ética: não use testes para manipular (preços enganosos, pressão artificial), e garanta que variantes sejam igualmente acessíveis.', '// ruim: identificador pessoal como chave do experimento\nbucket(\'usuario@example.com\', \'novo-checkout\')\n\n// melhor: id aleatório gerado pelo sistema (pseudônimo)\nbucket(sessao.idAleatorio, \'novo-checkout\')\n/* ilustrativo, não executado aqui */')
        ]
      },
      questions: [
        mcq('q1', 'Um recurso está liberado para 100% das pessoas há vários meses e o código ainda tem os dois caminhos. Qual é a ação correta?', 'd', [
          'Manter a flag indefinidamente, porque ela serve como backup caso alguém queira voltar a versão antiga.',
          'Renomear a flag para algo mais curto e marcá-la como permanente, sem mexer no código.',
          'Reduzir a flag para 99% para testar o ramo antigo de vez em quando.',
          'Remover a flag e o ramo antigo, pois ela cumpriu o papel e virou dívida técnica.'
        ], 'Flags de liberação devem sumir depois de estabilizar; manter os dois ramos cria combinações a testar e código morto. Mantê-la como "backup" ignora que o ramo antigo deixa de ser testado, renomear não remove a dívida e voltar para 99% submete pessoas a um caminho sem motivo.'),
        mcq('q2', 'Por que o grupo é calculado com hash(experimento + ":" + id) e não com Math.random a cada visita?', 'c', [
          'Porque Math.random não consegue produzir números de 0 a 99 de forma uniforme nos navegadores atuais.',
          'Porque o hash esconde o identificador e, por isso, dispensa a política de privacidade sobre o experimento.',
          'Porque o hash é determinístico: a mesma pessoa cai sempre no mesmo grupo, o que o sorteio por visita não dá.',
          'Porque o hash é criptográfico e protege o experimento contra manipulação por quem inspeciona a página.'
        ], 'O mesmo id e o mesmo experimento geram sempre o mesmo número, então a experiência é consistente entre visitas e a medição é limpa. Math.random é uniforme, o hash não elimina o tratamento de dados e o FNV-1a do exemplo não é criptográfico.'),
        mcq('q3', 'Uma equipe confere o painel todo dia e encerra o teste no primeiro dia em que a variante B parece melhor. Qual é o problema?', 'd', [
          'Nenhum problema, pois quanto mais cedo o teste terminar, menos pessoas veem a versão pior dos dois.',
          'O problema é o painel, que não pode ser consultado enquanto o experimento estiver em andamento.',
          'O problema é a variante B, que deveria ter recebido bem mais da metade das pessoas desde o início do teste.',
          'Parar ao primeiro resultado favorável aumenta falsos positivos; amostra e duração devem ser definidas antes.'
        ], 'Olhar repetidamente e parar quando o resultado agrada infla a chance de concluir uma diferença que não existe. Consultar o painel é permitido desde que a regra de parada seja prévia, e a divisão desigual não resolve o viés.'),
        fill('q4', 'Complete o cálculo do bucket, que deve gerar um número entre 0 e 99.', 'const n = hash(experimento + \':\' + userId) % ___;', ['100'], 'O resto da divisão por 100 produz um número de 0 a 99, e faixas desse número viram variantes (0 a 49 para A, 50 a 99 para B, por exemplo).'),
        mcq('q5', 'Uma tela de administração só aparece se flags.painelAdmin for verdadeira no navegador, e a API não confere permissão. O que está errado?', 'a', [
          'A flag no cliente pode ser alterada por quem inspeciona a página; o servidor precisa checar a autorização.',
          'Nada, pois a flag é avaliada antes de a tela abrir e ninguém consegue alterá-la depois disso.',
          'Falta esconder o nome da flag no bundle com um minificador mais agressivo, o que impede a inspeção.',
          'O problema é a tela ser administrativa, pois flags só podem controlar telas voltadas ao público geral.'
        ], 'Qualquer valor no navegador pode ser alterado, então flag de cliente é só experiência de uso, nunca controle de acesso. Minificar não impede inspeção, e flags podem controlar telas administrativas desde que a API valide a permissão.'),
        mcq('q6', 'Qual destes é o dado mais adequado para usar como chave do bucket de um experimento?', 'b', [
          'O e-mail da pessoa, que é único e estável, enviado a qualquer ferramenta de análise.',
          'Um identificador aleatório gerado pelo sistema, sem relação com a identidade da pessoa.',
          'O CPF, porque garante que a mesma pessoa receba a mesma variante em qualquer dispositivo.',
          'O nome completo, porque é fácil de conferir em relatórios internos quando algo dá errado.'
        ], 'Um id aleatório (pseudônimo) mantém o bucket estável sem expor identidade, em linha com a minimização. E-mail, CPF e nome são dados pessoais que ampliam o risco em ferramentas e logs sem necessidade para o experimento.'),
        mcq('q7', 'Os usuários veem a versão A do botão por meio segundo e depois ela troca para B, e a página dá um salto. Qual é a boa correção?', 'c', [
          'Esperar o carregamento de toda a página e só então aplicar a variante com JavaScript.',
          'Mostrar a versão A primeiro e trocar para B só depois que a pessoa rolar a página.',
          'Decidir a variante antes da primeira renderização (servidor ou borda) e reservar o espaço do elemento.',
          'Aumentar o tempo da animação de troca para que o salto fique menos perceptível.'
        ], 'Escolher a variante antes de renderizar elimina a troca visível, e reservar o espaço evita o deslocamento de layout. Aplicar depois do carregamento ou ao rolar produz o mesmo flicker, e animar mais devagar só estende o incômodo.'),
        fill('q8', 'Libere o recurso para 20% das pessoas completando a comparação.', 'const dentro = hash(flag.nome + ":" + userId) % 100 < ___;', ['20'], 'Como o resto fica entre 0 e 99, a condição "menor que 20" seleciona 20 valores entre 100, ou seja, cerca de 20% das pessoas, sempre as mesmas para a mesma flag.')
      ]
    },
    {
      id: 'fii-49-atualizando-versoes-e-migrando',
      title: 'Atualizando versões e migrando',
      goal: 'Planejar upgrades de framework, ler notas de versão, usar codemods, tratar depreciações e migrar gradualmente entre abordagens.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que atualizar e o que pode quebrar',
            'Frameworks e bibliotecas evoluem: correções de segurança, melhorias de desempenho, recursos novos. Ficar muito atrás acumula dívida: o salto fica grande e arriscado, e vulnerabilidades conhecidas permanecem. O oposto, atualizar tudo no dia do lançamento sem avaliar, também traz risco. Versionamento semântico ajuda a prever: PATCH e MINOR deveriam ser compatíveis; MAJOR pode quebrar. Mas nem todo projeto segue semver à risca: leia as notas de versão (release notes) e o guia de migração oficial antes de subir, e confira quais versões do framework ainda recebem correções de segurança no site oficial. Atualizações de segurança têm prioridade.'
          ),
          sl(
            'Estratégia de upgrade',
            'Procedimento seguro: 1) garanta que os testes e o pipeline estão verdes ANTES; 2) crie um branch dedicado; 3) atualize um major por vez, não pule versões intermediárias; 4) leia as notas e o guia de migração; 5) rode os comandos oficiais de atualização; 6) corrija erros de compilação, avisos e testes; 7) atualize dependências que exigem a nova versão; 8) teste manualmente fluxos críticos, acessibilidade e desempenho; 9) publique em preview, depois produção, com plano de reversão. Ferramentas por nome para acompanhar versões: npm outdated, Dependabot e Renovate abrem PRs de atualização automaticamente, para você revisar em lotes pequenos. Cada framework tem seu comando de migração: o Angular tem o ng update; o Vue e o React publicam guias e ferramentas de verificação.',
            '// classifica o tamanho do salto de cada dependência (dados fictícios)\nconst deps = [\n  { nome: \'biblioteca-ui\', atual: \'2.3.1\', alvo: \'2.3.4\' },\n  { nome: \'roteador\', atual: \'6.8.0\', alvo: \'6.14.2\' },\n  { nome: \'framework\', atual: \'17.2.0\', alvo: \'19.0.0\' }\n];\nfunction tipo(a, b) {\n  const [a1, a2] = a.split(\'.\').map(Number), [b1, b2] = b.split(\'.\').map(Number);\n  return a1 !== b1 ? \'MAJOR\' : a2 !== b2 ? \'MINOR\' : \'PATCH\';\n}\nfor (const d of deps) console.log(d.nome.padEnd(14), d.atual, \'->\', d.alvo, \'(\' + tipo(d.atual, d.alvo) + \')\');\n\n// saída real (Node):\n// biblioteca-ui  2.3.1 -> 2.3.4 (PATCH)\n// roteador       6.8.0 -> 6.14.2 (MINOR)\n// framework      17.2.0 -> 19.0.0 (MAJOR)'
          ),
          sl(
            'Notas de versão, depreciações e codemods',
            'Uma depreciação (deprecation) é um aviso de que um recurso será removido em versão futura: aparece no console, no editor (riscado) ou nas notas. Trate os avisos como tarefas, não os ignore: eles são o plano de migração gratuito. Um codemod é um programa que reescreve o código automaticamente seguindo uma regra (por exemplo, trocar um import antigo pelo novo ou converter a sintaxe de um template). Ferramentas por nome: jscodeshift (base de muitos codemods de JavaScript), os schematics do Angular (executados pelo ng update e por comandos de migração) e codemods oficiais publicados pelos projetos. Sempre rode em branch, revise o diff (codemods erram em casos incomuns) e rode os testes.'
          ),
          sl(
            'Migração gradual entre abordagens',
            'Migrações grandes dentro do mesmo framework também ocorrem: componentes de classe para funções e hooks em React; Options API para Composition API com script setup em Vue; NgModules para componentes standalone e o fluxo de controle antigo (*ngIf, *ngFor) para @if/@for em Angular. Em geral, o framework mantém a abordagem antiga funcionando por um tempo, o que permite migrar GRADUALMENTE: novas telas já na abordagem nova, telas antigas migradas quando alguém precisa mexer nelas, com regra de lint para impedir novos usos da antiga. Para migrar de um framework para outro, a estratégia comum é a do "estrangulador" (strangler): rodar os dois lado a lado, rota por rota, trocando uma parte por vez, em vez de reescrever tudo (a reescrita total costuma estourar prazo e esconder regressões).'
          ),
          sl(
            'Medir e comunicar a migração',
            'Defina critérios de pronto: pipeline verde, métricas (tamanho do bundle, LCP) sem piora, nenhuma depreciação restante, documentação interna atualizada. Mantenha um registro das decisões e dos problemas encontrados para a próxima atualização. Acompanhe a lista de dependências que travam o upgrade (muitas vezes uma biblioteca sem suporte à versão nova): avalie atualizar, substituir ou remover. Comunique a equipe: congele o branch principal durante o merge de uma migração grande ou use feature flags. Lembre da segurança durante a migração: não desative lint, verificações de tipos ou testes "só para passar", e não copie trechos de código de fontes não confiáveis.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o procedimento recomendado ao atualizar um framework por vários majors?', 'd', ['Pular direto para o último major para reduzir o número de commits do projeto', 'Atualizar tudo diretamente na branch principal e corrigir os erros em produção', 'Desativar os testes que falharem durante a atualização e reativá-los no futuro', 'Atualizar um major por vez, lendo as notas de versão e o guia de migração, com testes verdes'], 'Um major por vez com guia e testes verdes limita o risco. Pular versões, atualizar direto na principal ou desligar testes escondem regressões.'),
        mcq('q2', 'O que é uma depreciação (deprecation)?', 'b', ['A remoção imediata de um recurso, sem aviso prévio aos usuários', 'Um aviso de remoção futura de um recurso', 'Uma correção de segurança que precisa ser aplicada em todo ambiente', 'Um recurso novo que ainda está em teste e pode ser usado em produção'], 'Depreciação é um aviso prévio de remoção futura. Não é remoção imediata, não é correção de segurança e não é um recurso experimental novo.'),
        mcq('q3', 'O que faz um codemod?', 'a', ['Reescreve o código automaticamente segundo uma regra, ajudando a aplicar mudanças repetitivas', 'Compila o projeto e envia o resultado para os servidores de produção', 'Mede a velocidade de cada função e remove as mais lentas sozinho', 'Traduz os comentários do código para outros idiomas'], 'Codemods transformam código por regras (por exemplo, trocar APIs antigas). Não fazem deploy, não otimizam funções por conta própria e não traduzem comentários. O diff ainda deve ser revisado.'),
        fill('q4', 'Complete o comando do Angular que atualiza o framework e executa as migrações automáticas.', 'ng ___ @angular/core @angular/cli', ['update'], 'ng update atualiza os pacotes e executa os schematics de migração fornecidos pelo projeto.'),
        mcq('q5', 'Qual é uma boa estratégia para migrar um projeto para componentes standalone (Angular) ou script setup (Vue)?', 'b', ['Reescrever todo o projeto de uma vez, em um único PR, sem manter o código antigo', 'Código novo na abordagem nova e migração gradual do antigo', 'Manter as duas abordagens para sempre, sem regra alguma para o código novo', 'Adiar a migração até a abordagem antiga ser removida e quebrar a aplicação'], 'Migração gradual com regra de lint distribui o risco. Reescrita total em um PR é arriscada, manter duas abordagens indefinidamente cria inconsistência e esperar quebrar é imprudente.'),
        mcq('q6', 'Para trocar de um framework para outro, qual padrão é o mais seguro?', 'c', ['Congelar o produto por meses e reescrever tudo antes de mostrar qualquer parte', 'Copiar o código antigo para o novo framework sem mudanças, como está', 'O estrangulador: rodar os dois lado a lado e trocar uma rota ou parte por vez', 'Remover os testes antes da troca, pois serão refeitos depois'], 'O padrão estrangulador migra aos poucos e mantém o produto funcionando. Congelar para reescrever tudo e remover testes elevam risco, e copiar código sem adaptar não funciona entre frameworks.'),
        mcq('q7', 'Como tratar os avisos de depreciação que aparecem durante o desenvolvimento?', 'd', ['Silenciá-los no console, pois só incomodam e não indicam um problema real', 'Esperar a remoção do recurso para só então descobrir o que quebrou', 'Alterar o pipeline para que a presença de avisos não faça o build falhar', 'Como tarefas de migração, resolvidas antes da remoção'], 'Avisos de depreciação são o roteiro de migração antecipado. Silenciar, esperar a remoção ou ignorar no pipeline só adia o custo.'),
        fill('q8', 'Complete: uma ferramenta que abre PRs automáticos de atualização de dependências é o ___ (ou o Renovate).', '// bot de atualização de dependências do GitHub: ___', ['Dependabot'], 'Dependabot e Renovate abrem PRs de atualização para você revisar em lotes pequenos, com o pipeline validando cada um.')
      ]
    },
    {
      id: 'fii-50-projeto-integrador-intermediario',
      title: 'Projeto integrador intermediário',
      goal: 'Revisar o nível intermediário projetando um painel: rotas, estado, API, testes, acessibilidade, i18n, segurança e deploy, discutindo as escolhas nos três frameworks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: um painel de pedidos',
            'Imagine um painel interno, fictício, de pedidos de uma loja: login, lista de pedidos com busca e filtros, detalhe de um pedido, gráfico de vendas por mês, atualização em tempo real de novos pedidos, e interface em português e inglês. Ninguém usará dados reais: clientes, e-mails e valores são inventados (usuario@example.com). O exercício não é implementar, é DECIDIR e justificar, como numa revisão de arquitetura. Para cada decisão, pergunte: qual o requisito, qual a alternativa mais simples que atende e qual o custo? Esta lição cruza o que você viu nas lições 1 a 49 do nível intermediário.'
          ),
          sl(
            'Rotas, renderização e estado',
            'Rotas: /entrar, /pedidos (lista), /pedidos/:id (detalhe), /relatorios. Renderização: painel atrás de login, sem SEO: CSR (SPA) é suficiente; um meta-framework só se houver necessidade de SSR ou de páginas públicas. Divisão de código por rota, e o gráfico (biblioteca pesada) com lazy loading. Estado: filtros, busca e página na URL (compartilhável); lista e detalhe de pedidos como estado de SERVIDOR (TanStack Query, ou HttpClient/signals no Angular) com cache e revalidação; só o tema, o idioma e o usuário atual como estado global de cliente (Context/Zustand, Pinia, serviço com signals). Estado local para menus e formulários. As ferramentas mudam entre React, Vue e Angular, mas a classificação do estado é a mesma.'
          ),
          sl(
            'API, tempo real, testes e acessibilidade',
            'API: cliente HTTP com tratamento central de 401 (ir ao login) e de erros, tipos derivados de schemas validados na fronteira. Novos pedidos em tempo real: SSE basta (só o servidor envia); reconexão com backoff e a mensagem invalidando ou atualizando o cache da lista. Testes: componentes com Testing Library (React), Vue Test Utils (Vue) ou TestBed e harnesses (Angular), cobrindo comportamento; API simulada (MSW ou HttpTestingController) com dados fictícios; poucos E2E nos fluxos críticos (login, buscar e abrir um pedido). Acessibilidade: tabela semântica com cabeçalhos, foco movido ao título após navegar, modal de confirmação com foco preso, live region para "novo pedido recebido", gráfico com resumo e tabela de dados, lint e axe no pipeline.'
          ),
          sl(
            'i18n, segurança e privacidade',
            'i18n: mensagens em arquivos por idioma, Intl para datas, números e moeda, plural por regra do idioma, atributo lang atualizado. Segurança: autorização SEMPRE na API (esconder botão é só UX); sessão em cookie HttpOnly, Secure e SameSite; sem tokens em localStorage; escape por padrão e nada de innerHTML sem sanitização; CSP com nonce e frame-ancestors; dependências auditadas com lockfile e npm ci; SRI para qualquer recurso de CDN. Privacidade: o painel exibe dados de clientes, então mostre só o necessário (mascare o e-mail na lista), não registre dados pessoais em logs nem em analytics, use eventos com lista de permissão, retenção definida; consentimento para o que não for essencial. A LGPD aparece aqui só em visão geral e não substitui orientação jurídica.'
          ),
          sl(
            'Qualidade, deploy e evolução',
            'Pipeline: npm ci, lint (com regras de acessibilidade), tipos, testes, build, Lighthouse CI com orçamento, E2E contra um preview deploy com dados fictícios, segredos só no CI. Deploy: o build estático de uma SPA vai a uma CDN; se houver SSR, um servidor Node ou funções. Medição: web-vitals em campo (sem dados pessoais) e acompanhamento de LCP, INP e CLS. Evolução: Renovate ou Dependabot, upgrades um major por vez, codemods e migração gradual. Biblioteca de componentes e monorepo só se houver mais de uma aplicação consumindo. Uma boa arquitetura de nível intermediário é a MAIS SIMPLES que atende aos requisitos, com as proteções certas. O código abaixo, em JavaScript puro, transforma algumas dessas decisões em uma função de recomendação, para fixar o raciocínio.',
            'function recomendar(req) {\n  const r = [];\n  r.push(req.seo || req.paginasPublicas ? \'SSR/SSG (meta-framework)\' : \'SPA (CSR)\');\n  r.push(req.somenteServidorEnvia ? \'SSE\' : req.duasVias ? \'WebSocket\' : \'polling\');\n  r.push(req.maisDeUmApp ? \'biblioteca de componentes em monorepo\' : \'componentes dentro do app\');\n  if (req.dadosPessoais) r.push(\'minimizar e mascarar dados; sem PII em logs/analytics\');\n  return r;\n}\nconsole.log(\'painel interno:\', recomendar({ somenteServidorEnvia: true, dadosPessoais: true }));\nconsole.log(\'blog público  :\', recomendar({ seo: true, paginasPublicas: true }));\n\n// saída real (Node):\n// painel interno: [\n//   \'SPA (CSR)\',\n//   \'SSE\',\n//   \'componentes dentro do app\',\n//   \'minimizar e mascarar dados; sem PII em logs/analytics\'\n// ]\n// blog público  : [ \'SSR/SSG (meta-framework)\', \'polling\', \'componentes dentro do app\' ]'
          )
        ]
      },
      questions: [
        mcq('q1', 'No painel de pedidos (atrás de login, sem SEO), qual estratégia de renderização é suficiente?', 'b', ['SSG das páginas, porque os pedidos mudam uma vez por ano', 'CSR como SPA, com divisão de código por rota', 'ISR com regeneração a cada segundo, para que o cache não fique atrasado', 'SSR obrigatório com servidor dedicado, porque sem ele o login não funciona'], 'Sem SEO e atrás de login, uma SPA atende bem. SSG de conteúdo dinâmico fica desatualizado, ISR a cada segundo é desnecessário e login funciona normalmente em SPA.'),
        mcq('q2', 'Onde guardar o filtro de busca e o número da página da lista de pedidos?', 'c', ['Em uma store global, porque a URL não consegue guardar parâmetros de busca', 'Em localStorage, para que valham em qualquer navegador do mundo', 'Na URL, para recarregar e compartilhar o link com a mesma tela', 'Em uma variável do componente raiz, que o navegador preserva sozinho no F5'], 'Filtros e página combinam com a URL. A URL guarda parâmetros, localStorage vale só naquele navegador e variáveis de componente se perdem no recarregamento.'),
        mcq('q3', 'O que é estado de servidor nesse painel?', 'a', ['A lista e o detalhe dos pedidos copiados da API, com cache, erro, carregamento e revalidação', 'O tema escuro e o idioma escolhidos pela pessoa, guardados no navegador', 'A abertura e o fechamento de um menu lateral dentro de um componente', 'O texto digitado temporariamente em um campo antes de enviar o formulário'], 'Dados remotos copiados à tela são estado de servidor. Tema e idioma são estado de cliente, o menu e o texto de um campo são estado local.'),
        fill('q4', 'Complete a tecnologia de tempo real mais simples quando só o servidor envia novos pedidos ao painel.', '// servidor envia, cliente só recebe: ___ (Server-Sent Events)', ['SSE'], 'SSE (Server-Sent Events) atende fluxos de uma via e reconecta sozinho; WebSocket seria necessário para comunicação nos dois sentidos.'),
        mcq('q5', 'A tela de detalhes mostra o botão "Cancelar pedido" apenas para o papel "gerente", definido em um valor local. Qual é a avaliação correta?', 'd', ['A proteção está completa, porque o botão só aparece para quem tem o papel certo', 'A proteção está completa se o valor local for guardado em localStorage com chave difícil', 'A proteção depende do idioma da interface, que controla as permissões', 'A API deve checar a permissão em todas as requisições; o botão é só UX'], 'Autorização vive no servidor; ocultar botão não protege nada porque o valor local é editável. Chave difícil não impede edição, e o idioma não tem relação com permissões.'),
        mcq('q6', 'Qual cuidado de privacidade faz mais sentido para a lista de pedidos?', 'd', ['Mostrar o CPF completo dos clientes em cada linha, por conveniência', 'Registrar a lista completa de pedidos nos logs do navegador para depuração futura', 'Enviar cada clique com o e-mail do cliente ao serviço de analytics', 'Exibir só o necessário (e-mail mascarado), sem dados pessoais em logs nem em eventos de analytics'], 'Minimização e máscara reduzem a exposição. Mostrar documentos completos, logar dados dos clientes e enviar e-mails a analytics ampliam o risco.'),
        mcq('q7', 'Qual conjunto de práticas de pipeline combina com o painel descrito?', 'b', ['Publicar direto da máquina de uma pessoa, sem lint e sem testes, para ganhar tempo', 'npm ci, lint, tipos, testes, build, Lighthouse CI e E2E em preview', 'Rodar o build e confiar que erros aparecerão no uso em produção', 'Colocar o token de deploy no repositório, para o pipeline achá-lo'], 'O pipeline completo com preview e dados fictícios protege qualidade e privacidade. Publicar sem verificações, só buildar ou versionar tokens são práticas arriscadas.'),
        fill('q8', 'Complete: a arquitetura de nível intermediário ideal é a mais ___ que atende aos requisitos, com as proteções certas.', '// a melhor arquitetura é a mais ___ que atende aos requisitos', ['simples'], 'Escolher a solução mais simples que atende aos requisitos reduz custo, risco e manutenção, mantendo as proteções de segurança, acessibilidade e privacidade.')
      ]
    },
  ]
};
