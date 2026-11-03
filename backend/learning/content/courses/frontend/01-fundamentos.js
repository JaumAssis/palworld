// Módulo "Fundamentos" do curso de Frameworks Frontend (React, Vue e Angular) — nível iniciante, parte A.
// Cada lição tem 8 questões (3 múltipla escolha + 1 lacuna, duas vezes). Ver ../../index.js para
// o formato e a validação de boot. Código React/JSX, Vue SFC, Angular, CSS e HTML é ILUSTRATIVO (marcado
// nos slides); só JavaScript puro didático foi executado de verdade e tem a saída real colada.
// Nenhum dado pessoal real (usuários e e-mails são fictícios), segredos sempre <placeholder>, nenhuma
// versão ou estatística é afirmada — só conceitos estáveis; confira a documentação oficial da versão em uso.
// Helpers locais (mcq, fill, sl): mcq recebe a letra correta e as 4 alternativas em ordem a, b, c, d;
// fill recebe prompt, código com a lacuna ___ e a lista de respostas aceitas (a 1ª é a canônica).
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
  id: 'fundamentos-frontend',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Navegador, HTML, CSS, JavaScript moderno, ferramentas, pensamento em componentes e os primeiros passos em React, Vue e Angular',
  accent: '#8b5cf6',
  lessons: [
    {
      id: 'fib-01-o-que-sao-frameworks-frontend',
      title: 'O que são frameworks front-end e por que existem',
      goal: 'Entender o que o navegador faz, que problema React, Vue e Angular resolvem, a diferença entre SPA e MPA, biblioteca e framework, e quando NÃO usar framework.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que o navegador faz com uma página',
            'O navegador recebe três tipos de arquivo e cada um tem um papel. HTML descreve a ESTRUTURA e o conteúdo (títulos, parágrafos, botões, formulários). CSS descreve a APARÊNCIA (cores, tamanhos, posição, adaptação a telas). JavaScript descreve o COMPORTAMENTO (reagir a cliques, buscar dados, mudar a página sem recarregar). O navegador lê o HTML, monta uma árvore de objetos chamada DOM, aplica o CSS e executa o JavaScript, que pode alterar essa árvore a qualquer momento. Tudo isso roda na máquina da pessoa usuária: o código que você envia ao navegador é público e pode ser lido e alterado por quem quiser. Por isso, nunca coloque senhas, chaves secretas ou regras de segurança só no front-end.',
            '<!-- estrutura (HTML) -->\n<button id="curtir">Curtir</button>\n\n/* aparência (CSS) */\nbutton { background: #8b5cf6; color: white; }\n\n// comportamento (JavaScript)\ndocument.querySelector(\'#curtir\').addEventListener(\'click\', () => {\n  console.log(\'clicou\');\n});\n// ilustrativo, não executado aqui'
          ),
          sl(
            'O problema que os frameworks resolvem',
            'Em uma página simples, mudar a tela à mão com JavaScript é fácil. O problema aparece quando a tela depende de MUITOS dados que mudam: o carrinho de compras aparece no cabeçalho, na lista de produtos e no resumo do pedido. Se você altera o dado, precisa lembrar de atualizar cada ponto da tela que o mostra; esquecer um deixa a interface mentindo (2 itens em um lugar e 3 em outro). Um framework front-end inverte a responsabilidade: você descreve COMO a tela deve parecer para um dado ESTADO, e o framework descobre o que precisa mudar no DOM quando o estado muda. Você deixa de escrever "encontre aquele elemento e troque o texto" e passa a escrever "a tela é função dos dados". Esse estilo se chama declarativo e será o tema da lição 06.'
          ),
          sl(
            'SPA e MPA',
            'MPA (Multi-Page Application, aplicação de várias páginas) é o modelo clássico: cada link ou formulário pede uma nova página HTML ao servidor, e o navegador troca tudo. SPA (Single-Page Application, aplicação de página única) carrega uma página HTML e um pacote de JavaScript uma vez; depois, ao navegar, o JavaScript troca partes da tela e busca só dados (normalmente JSON) do servidor, sem recarregar. Vantagens da SPA: navegação fluida e interface rica. Custos: o primeiro carregamento baixa mais JavaScript, a indexação por buscadores e o desempenho inicial exigem cuidado, e a URL e o botão voltar precisam ser tratados por um roteador. Nenhum dos dois modelos é "o certo": depende do produto. Frameworks modernos também sabem gerar HTML no servidor, assunto de níveis mais avançados.'
          ),
          sl(
            'Biblioteca x framework',
            'Uma biblioteca é um conjunto de ferramentas que VOCÊ chama quando quer; um framework define a estrutura da aplicação e chama o SEU código nos pontos previstos (inversão de controle). Na prática a fronteira é nebulosa. React se apresenta como biblioteca para construir interfaces: cuida da tela, e você escolhe separadamente roteamento, busca de dados e formulários. Vue é descrito como framework progressivo: o núcleo cuida da tela e você adota roteador e gerenciador de estado oficiais conforme a necessidade. Angular é um framework completo e opinativo: já traz roteamento, formulários, cliente HTTP e injeção de dependência, e usa TypeScript como linguagem. Mais peças prontas significam menos decisões, mas também menos liberdade.'
          ),
          sl(
            'React, Vue e Angular: filosofias',
            'Os três resolvem o mesmo problema (interface = função do estado) com estilos diferentes. React: componentes são funções que devolvem JSX (uma sintaxe parecida com HTML dentro do JavaScript); a filosofia é "é só JavaScript", com poucas regras e muita escolha. Vue: componentes de arquivo único (.vue) separam template, script e estilo, e a reatividade é automática (o framework observa o que você lê e atualiza o que depende); busca equilíbrio entre simplicidade e recursos. Angular: componentes em TypeScript com templates próprios, injeção de dependência e ferramentas oficiais para tudo; busca consistência em equipes grandes. Os conceitos centrais (componente, props, estado, eventos) são os mesmos: aprender bem um facilita aprender os outros. Neste nível você verá os três lado a lado.'
          ),
          sl(
            'O que NÃO precisa de framework',
            'Framework tem custo: mais código para baixar, uma cadeia de ferramentas para manter, atualizações e uma curva de aprendizado. Um site institucional, uma página de documentação ou uma landing page com um único formulário funcionam muito bem com HTML, CSS e um pouco de JavaScript puro. Pergunte: a tela tem muito estado compartilhado? Há muitos pedaços que mudam com os dados? Várias pessoas vão manter o código por anos? Se as respostas são não, comece simples. E independentemente da escolha: tudo que vai para o navegador é público, validação no cliente é só conforto de uso (o servidor revalida), e dependências de terceiros são código de outras pessoas rodando na sua página, então escolha e atualize com critério.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe mantém um site de uma página com um formulário de contato e quase nenhum dado dinâmico. Qual decisão faz mais sentido?', 'c', [
          'Adotar Angular, porque projetos pequenos ficam organizados desde o início com injeção de dependência',
          'Usar React com um roteador e um gerenciador de estado, para não precisar refatorar mais tarde',
          'Começar com HTML, CSS e JavaScript puro, pois o custo de um framework não traz benefício aqui',
          'Migrar para uma SPA, já que páginas fora desse modelo não conseguem exibir formulários com validação'
        ], 'Framework resolve o problema de manter muita tela sincronizada com muito estado. Sem esse problema, só se paga o custo. As outras opções adicionam ferramentas sem necessidade, e a última é falsa: formulários com validação funcionam em qualquer página.'),
        mcq('q2', 'Qual é o papel do CSS na página?', 'c', [
          'Definir a estrutura e o conteúdo, como títulos, parágrafos e botões',
          'Definir o comportamento, como reagir a cliques e buscar dados do servidor',
          'Definir a aparência, como cores, tamanhos e posição',
          'Guardar os dados da pessoa usuária entre uma visita e outra ao site'
        ], 'HTML dá a estrutura, CSS a aparência e JavaScript o comportamento. CSS não guarda dados nem cria elementos de conteúdo.'),
        mcq('q3', 'O carrinho de compras aparece em três pontos da tela e um deles ficou com o número errado depois de adicionar um item com DOM manipulado à mão. Qual é a causa mais provável e como um framework ajuda?', 'd', [
          'O navegador não consegue atualizar três elementos ao mesmo tempo; o framework usa várias abas para dividir o trabalho',
          'O CSS do carrinho estava com especificidade alta demais; o framework remove o CSS antigo automaticamente',
          'O servidor devolveu um número diferente para cada ponto; o framework garante respostas idênticas',
          'O código esqueceu de atualizar um dos pontos; no framework a tela é descrita a partir do estado e ele atualiza todos'
        ], 'Sincronizar vários pontos manualmente é o erro clássico do DOM imperativo. O framework deriva a tela do estado, então um único dado alimenta todos os pontos. As outras causas não correspondem ao funcionamento do navegador.'),
        fill('q4', 'Complete com a sigla do modelo que carrega uma página e depois só troca partes da tela buscando dados.', 'Aplicação de página única = ___', ['SPA', 'single-page application'], 'SPA (Single-Page Application) carrega o HTML e o JavaScript uma vez e depois atualiza a tela buscando apenas dados.'),
        mcq('q5', 'Qual afirmação descreve melhor a diferença entre Angular e React?', 'c', [
          'Angular só funciona em aplicações pequenas, enquanto o React atende apenas grandes empresas e equipes enormes',
          'React exige TypeScript em todo projeto, e Angular exige JavaScript puro, o que muda a sintaxe dos componentes',
          'Angular já integra roteador, formulários e HTTP; React foca na interface e deixa o resto à escolha',
          'Angular roda no servidor e React roda no navegador, por isso os dois não podem ser comparados entre si'
        ], 'Angular traz muitas peças oficiais integradas; React é uma biblioteca de UI e o ecossistema complementa. Os dois rodam no navegador, e nenhum limita o tamanho do projeto.'),
        mcq('q6', 'Uma pessoa guarda a chave secreta de um serviço de pagamento em uma constante no código React "para facilitar". Qual é o problema?', 'd', [
          'O React criptografa constantes automaticamente, o que torna a chave inutilizável para o serviço de pagamento',
          'Constantes guardam apenas números, e uma chave de texto causaria erro de compilação no momento do build',
          'O único problema é de desempenho, pois chaves longas aumentam o tempo de renderização dos componentes',
          'O código do front-end é entregue ao navegador, então qualquer pessoa pode lê-lo e o segredo fica público'
        ], 'Tudo que vai ao bundle é baixado pelo navegador. Segredos pertencem ao servidor (variáveis de ambiente); o front-end deve conter só valores públicos.'),
        mcq('q7', 'O que significa dizer que um framework tem "inversão de controle"?', 'b', [
          'O código roda de trás para frente, começando pelo último componente declarado na árvore',
          'O framework define o fluxo e chama o seu código nos pontos previstos',
          'O navegador passa a controlar o servidor para decidir quais dados serão enviados',
          'A pessoa desenvolvedora deixa de escrever código e apenas configura arquivos de projeto'
        ], 'Em uma biblioteca você chama as funções; em um framework você registra componentes e ele decide quando executá-los. As outras opções confundem o conceito.'),
        fill('q8', 'Complete com o nome da árvore de objetos que o navegador monta a partir do HTML e que o JavaScript pode alterar.', 'HTML -> navegador monta a árvore ___', ['DOM', 'Document Object Model'], 'O DOM (Document Object Model) é a representação em árvore da página, alterável pelo JavaScript.')
      ]
    },
    {
      id: 'fib-02-html-e-dom-essencial',
      title: 'HTML e DOM essencial',
      goal: 'Escrever HTML semântico, entender a árvore DOM, selecionar e alterar elementos, tratar eventos e usar delegação, e perceber por que o DOM à mão escala mal.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'HTML semântico',
            'HTML é uma linguagem de marcação: você envolve o conteúdo em ELEMENTOS com TAGS de abertura e fechamento, e eles podem ter ATRIBUTOS. Semântico quer dizer escolher a tag pelo SIGNIFICADO, não pela aparência: <header> (cabeçalho), <nav> (navegação), <main> (conteúdo principal), <section>, <article>, <footer>, <button> (ação), <a href> (link para outro lugar), <ul>/<li> (lista), <label> ligado a um <input> (rótulo de campo). Isso ajuda leitores de tela, buscadores e teclado: um <button> já é focável e ativável com Enter e espaço, uma <div> com clique não é. Erro comum: usar <div> para tudo. Outro: campos sem <label>, que ficam inacessíveis.',
            '<main>\n  <h1>Minhas tarefas</h1>\n  <label for="nova">Nova tarefa</label>\n  <input id="nova" type="text" />\n  <button id="add" type="button">Adicionar</button>\n  <ul id="lista"></ul>\n</main>\n<!-- ilustrativo, não executado aqui -->'
          ),
          sl(
            'A árvore DOM',
            'O DOM (Document Object Model) é a página como uma ÁRVORE de objetos: o <html> é a raiz, <head> e <body> são filhos, e cada elemento tem pais, filhos e irmãos. Cada elemento é um objeto JavaScript com propriedades (textContent, className, value, children) e métodos. O objeto global document é a porta de entrada. Mudar o DOM muda o que aparece na tela. Para encontrar elementos: document.querySelector(\'#id\') devolve o primeiro que combina com um seletor CSS (ou null se não achar); document.querySelectorAll(\'.item\') devolve todos. Erro comum: usar o elemento antes de ele existir (script executado antes do HTML carregar) ou esquecer de checar null.',
            'const lista = document.querySelector(\'#lista\');\nconst itens = document.querySelectorAll(\'li\');\nconsole.log(itens.length);\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Alterar elementos com segurança',
            'Para mudar texto use elemento.textContent = valor: o valor é tratado como TEXTO puro, então caracteres como < e > aparecem literalmente e não viram HTML. Já elemento.innerHTML = valor interpreta o valor como HTML: se ele vier de uma pessoa usuária ou de uma API, pode injetar um <script> ou um atributo de evento malicioso (XSS, Cross-Site Scripting). Regra: com dados externos, use textContent; use innerHTML só com HTML que você controla ou depois de sanitizar com uma biblioteca própria para isso. Para criar elementos: document.createElement(\'li\'), definir textContent e anexar com appendChild. Veja o curso de Segurança Web (OWASP) para XSS em profundidade.',
            '// VULNERÁVEL: dado externo interpretado como HTML\nitem.innerHTML = comentarioDoUsuario;\n\n// CORRETO: tratado como texto\nitem.textContent = comentarioDoUsuario;\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Eventos',
            'Um evento é um aviso do navegador de que algo aconteceu: click, input (o valor de um campo mudou), submit (formulário enviado), keydown. Você registra uma função (listener) com elemento.addEventListener(\'click\', funcao). A função recebe um objeto event com detalhes: event.target é o elemento exato que originou o evento. Em formulários, o submit recarrega a página por padrão: chame event.preventDefault() para cancelar esse comportamento e tratar o envio com JavaScript. Erro comum: registrar listener em elemento que ainda não existe, ou registrar o mesmo listener várias vezes sem querer.',
            'const botao = document.querySelector(\'#add\');\nbotao.addEventListener(\'click\', (event) => {\n  console.log(\'alvo:\', event.target.id);\n});\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Delegação de eventos',
            'Eventos de elementos "sobem" pelos pais (bubbling): um clique em um <li> também é visto pelo <ul> que o contém. Delegação é aproveitar isso: em vez de um listener por item, você coloca UM listener no pai e descobre qual filho foi clicado com event.target.closest(\'li\') (procura o ancestral mais próximo que combina com o seletor, ou null). Vantagens: menos listeners e funciona também para itens criados DEPOIS, porque o pai já está escutando. Cuidado: se o clique cair fora de qualquer <li>, closest devolve null, então cheque antes de usar o resultado.',
            'lista.addEventListener(\'click\', (event) => {\n  const item = event.target.closest(\'li\');\n  if (!item) return;          // clique fora de um item\n  item.classList.toggle(\'feita\');\n});\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Por que o DOM à mão escala mal',
            'No exemplo da lista, adicionar uma tarefa exige: criar o <li>, definir o texto, anexar na lista, atualizar o contador de pendentes e talvez esconder a mensagem "nenhuma tarefa". Remover exige o caminho inverso. Cada nova funcionalidade (filtro, edição, ordenação) multiplica os pontos que precisam ficar coerentes entre si, e o estado real acaba espalhado pelo próprio DOM ("a tarefa está feita porque o elemento tem a classe feita"). Fica difícil saber qual é a fonte da verdade. Frameworks mantêm o estado em variáveis do programa e geram a tela a partir delas. Antes de chegar a eles, ainda faltam CSS, JavaScript moderno e ferramentas, nas próximas lições.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe cria um botão de enviar com <div class="botao" onclick="...">. Qual é o principal problema?', 'b', [
          'A div não aceita CSS, então o botão fica sem cor, sem borda e sem espaçamento algum',
          'A div não recebe foco por teclado nem é anunciada como botão; o <button> traz isso pronto',
          'O JavaScript não consegue escutar cliques em div, apenas em elementos button e links',
          'A div só pode existir dentro de um <form>, senão o navegador a ignora por completo'
        ], 'Elementos semânticos já trazem acessibilidade e comportamento de teclado. A div aceita CSS e eventos, e não depende de form.'),
        mcq('q2', 'Um comentário vindo da API será exibido em uma lista. Qual escolha evita XSS?', 'd', [
          'Atribuir o comentário com innerHTML, pois o navegador remove scripts sozinho',
          'Atribuir com innerHTML e confiar que a API já validou tudo',
          'Converter o comentário com JSON.stringify e atribuir com innerHTML',
          'Atribuir o comentário com textContent'
        ], 'textContent trata o valor como texto, sem interpretar HTML. innerHTML interpreta marcação; confiar na origem dos dados ou em stringify não substitui sanitização.'),
        mcq('q3', 'Uma lista de 500 itens precisa reagir a cliques, e novos itens são adicionados depois. Qual abordagem é mais adequada?', 'd', [
          'Um listener em cada item no carregamento inicial, e nada para os novos itens',
          'Recarregar a página inteira a cada clique para refazer os listeners',
          'Um setInterval que procura itens clicados a cada segundo',
          'Delegação: um único listener no pai usando event.target.closest'
        ], 'Com delegação o pai escuta os eventos que sobem, inclusive de itens criados depois, e custa um listener só. As alternativas deixam itens novos sem tratamento ou desperdiçam recursos.'),
        fill('q4', 'Complete com o método que seleciona o primeiro elemento que combina com um seletor CSS.', 'const lista = document.___(\'#lista\');', ['querySelector'], 'querySelector devolve o primeiro elemento que combina com o seletor, ou null se não houver.'),
        mcq('q5', 'Um formulário recarrega a página ao ser enviado e o tratamento em JavaScript se perde. O que falta no handler de submit?', 'b', [
          'Chamar event.stopPropagation() para impedir que o formulário suba na árvore',
          'Chamar event.preventDefault() para cancelar o envio padrão do navegador',
          'Trocar addEventListener por onclick, que não recarrega páginas',
          'Colocar o script no <head> para carregar antes do formulário'
        ], 'preventDefault cancela a ação padrão (enviar e recarregar). stopPropagation só impede o evento de subir; mudar o tipo de registro ou o local do script não altera esse comportamento.'),
        mcq('q6', 'Em lista.addEventListener(\'click\', e => { const item = e.target.closest(\'li\'); item.classList.toggle(\'feita\'); }) o clique em uma área vazia da lista gera erro. Por quê?', 'b', [
          'toggle não funciona em listas que tenham mais de um item dentro do mesmo pai',
          'closest devolve null fora de um <li>, e ler classList de null falha',
          'O evento click não sobe até o <ul>, ficando restrito apenas ao <li> clicado',
          'classList só existe em elementos que foram criados com createElement pelo script'
        ], 'closest devolve null quando não encontra ancestral que combine; a correção é checar if (!item) return. O evento sobe normalmente e classList existe em qualquer elemento.'),
        mcq('q7', 'Qual é a principal razão de o DOM manipulado à mão escalar mal em telas complexas?', 'a', [
          'O estado fica espalhado pelo DOM, e cada mudança exige atualizar vários pontos de forma coerente',
          'O DOM aceita um limite pequeno de elementos antes de travar o navegador por completo',
          'O JavaScript puro não consegue criar elementos novos dinamicamente depois do carregamento',
          'O navegador impede qualquer alteração no DOM depois do carregamento inicial da página'
        ], 'O problema é de organização: sem uma fonte única da verdade, esquecer um ponto gera inconsistência. Criar e alterar elementos é plenamente possível.'),
        fill('q8', 'Complete com a propriedade que insere texto puro em um elemento, sem interpretar HTML.', 'item.___ = comentario;', ['textContent', 'innerText'], 'textContent define o conteúdo como texto, o que evita interpretar marcação vinda de dados externos.')
      ]
    },
    {
      id: 'fib-03-css-essencial-para-componentes',
      title: 'CSS essencial para componentes',
      goal: 'Dominar seletores, cascata e especificidade, box model, flexbox, grid, unidades, variáveis CSS e media queries para estilizar componentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Seletores e regras',
            'Uma regra CSS tem seletor e declarações: seletor { propriedade: valor; }. Seletores comuns: de elemento (p), de classe (.cartao), de id (#topo), descendente (.cartao p, qualquer p dentro de .cartao), filho direto (.lista > li), combinação (a.ativo) e pseudo-classes (button:hover, input:focus). Em componentes, prefira CLASSES: elas são reutilizáveis e têm especificidade moderada. Erro comum: usar ids para estilizar (difíceis de sobrescrever) ou seletores muito longos presos à estrutura do HTML (qualquer mudança quebra o estilo).',
            '.cartao { border: 1px solid #ddd; padding: 1rem; }\n.cartao > h2 { margin: 0; }\nbutton:hover { opacity: 0.9; }\n/* ilustrativo, não executado aqui */'
          ),
          sl(
            'Cascata e especificidade',
            'Quando duas regras mudam a mesma propriedade do mesmo elemento, o navegador decide pela CASCATA: primeiro a marcação !important, depois a ESPECIFICIDADE do seletor, e por fim a ordem (a regra que aparece depois vence em empate). Especificidade, do mais forte ao mais fraco: estilo inline no atributo style, id, classe/atributo/pseudo-classe, elemento. Um seletor com 1 id vence qualquer quantidade de classes. Exemplo: p { color: red; } perde para .aviso { color: blue; } que perde para #topo { color: green; }. Evite !important: ele cria uma corrida de escalada. Dica: mantenha especificidade baixa e use classes.',
            'p       { color: red; }    /* elemento: fraca */\n.aviso  { color: blue; }   /* classe: média */\n#topo   { color: green; }  /* id: forte */\n/* <p id="topo" class="aviso"> fica verde */'
          ),
          sl(
            'Box model',
            'Todo elemento é uma caixa com quatro camadas, de dentro para fora: conteúdo, padding (espaço interno), border (borda) e margin (espaço externo, fora da borda). Por padrão, width e height se referem só ao CONTEÚDO, então padding e borda AUMENTAM o tamanho total (uma caixa de width: 200px com padding de 20px de cada lado ocupa 240px). Com box-sizing: border-box o width passa a incluir padding e borda, o que torna o cálculo previsível; por isso é comum aplicar border-box a todos os elementos. Margens verticais adjacentes podem se fundir (margin collapse), uma surpresa comum para iniciantes.',
            '*, *::before, *::after { box-sizing: border-box; }\n.caixa { width: 200px; padding: 20px; border: 2px solid #333; }\n/* com border-box: ocupa 200px no total */'
          ),
          sl(
            'Flexbox',
            'Flexbox organiza itens em UMA direção. No contêiner: display: flex. O eixo principal é horizontal por padrão (flex-direction: row; use column para vertical). justify-content distribui os itens no EIXO PRINCIPAL (flex-start, center, space-between); align-items alinha no EIXO CRUZADO (stretch, center, flex-start). gap define o espaço entre itens; flex-wrap: wrap permite quebrar linha. Um filho com flex: 1 ocupa o espaço livre. Use flex para barras de navegação, linhas de botões e centralização de conteúdo.',
            '.barra {\n  display: flex;\n  justify-content: space-between; /* eixo principal */\n  align-items: center;            /* eixo cruzado */\n  gap: 1rem;\n}'
          ),
          sl(
            'Grid',
            'CSS Grid organiza itens em DUAS dimensões (linhas e colunas). No contêiner: display: grid e grid-template-columns define as colunas. A unidade fr divide o espaço livre em frações: 1fr 2fr dá à segunda coluna o dobro da primeira. repeat(3, 1fr) cria três colunas iguais, e repeat(auto-fit, minmax(200px, 1fr)) cria uma grade que se adapta à largura. Regra prática: flexbox para alinhar em uma linha ou coluna; grid para layouts de página ou cartões em grade. Os dois se combinam.',
            '.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 1rem;\n}'
          ),
          sl(
            'Unidades e variáveis CSS',
            'Unidades: px (pixel fixo), % (relativa ao pai), rem (relativa ao tamanho de fonte da raiz, bom para respeitar a preferência de leitura da pessoa usuária), em (relativa à fonte do elemento), vw/vh (porcentagem da largura/altura da tela) e fr (só no grid). Prefira rem para fontes e espaçamentos. Variáveis CSS (custom properties) começam com -- e são lidas com var(): definidas em :root valem na página inteira, e podem ser sobrescritas em um componente, o que facilita temas.',
            ':root {\n  --cor-primaria: #8b5cf6;\n  --espaco: 1rem;\n}\n.botao {\n  background: var(--cor-primaria);\n  padding: var(--espaco);\n}'
          ),
          sl(
            'Responsividade com media queries',
            'Responsivo é a página se adaptar a telas de tamanhos diferentes. A tag <meta name="viewport" content="width=device-width, initial-scale=1"> no HTML faz o celular usar a largura real. Media queries aplicam regras só quando uma condição vale: @media (min-width: 768px) { ... } vale a partir de 768px de largura. Estratégia mobile-first: escreva o CSS base para telas pequenas e use min-width para melhorar em telas maiores. Erro comum: larguras fixas em px que estouram em celulares; prefira %, rem, max-width e grid/flex que se adaptam.',
            '.lista { display: grid; grid-template-columns: 1fr; gap: 1rem; }\n@media (min-width: 768px) {\n  .lista { grid-template-columns: repeat(3, 1fr); }\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um elemento <p id="topo" class="aviso"> recebe p { color: red; }, .aviso { color: blue; } e #topo { color: green; }. Qual cor aparece e por quê?', 'd', [
          'Vermelho, porque a regra de elemento foi declarada primeiro no arquivo de estilos',
          'Azul, porque classes vencem ids quando há dois seletores diferentes em disputa',
          'Fica sem cor, porque três regras em conflito se anulam entre si no navegador',
          'Verde, porque o id tem maior especificidade que classe e elemento'
        ], 'Na cascata vence a maior especificidade: id acima de classe acima de elemento. Ordem só decide em empate de especificidade, e conflitos não se anulam.'),
        mcq('q2', 'Uma caixa tem width: 200px, padding: 20px e borda de 2px, sem box-sizing definido. Qual é a largura total ocupada?', 'a', [
          '244px',
          '200px',
          '224px',
          '240px'
        ], 'Por padrão a largura se refere ao conteúdo: 200 mais 20 de padding de cada lado mais 2 de borda de cada lado dá 244. Com border-box o total seria 200.'),
        mcq('q3', 'Para distribuir três itens em uma linha com espaço entre eles e alinhados ao centro na vertical, qual combinação serve?', 'd', [
          'display: grid; justify-items: space-between; align-content: top',
          'display: block; text-align: justify; vertical-align: center',
          'position: absolute; justify-content: center; align-items: space-between',
          'display: flex; justify-content: space-between; align-items: center'
        ], 'No flexbox, justify-content trabalha no eixo principal (horizontal em row) e align-items no eixo cruzado. As demais combinam valores e propriedades que não funcionam nesse arranjo.'),
        fill('q4', 'Complete com a função usada para ler uma variável CSS.', 'background: ___(--cor-primaria);', ['var'], 'var(--nome) lê o valor de uma variável CSS definida, por exemplo, em :root.'),
        mcq('q5', 'Qual é a melhor estratégia para uma página que precisa funcionar bem em celular e em desktop?', 'b', [
          'Larguras fixas em px calculadas para um monitor grande, com zoom automático feito pelo celular',
          'CSS base para telas pequenas e @media (min-width: ...) para ampliar o layout em telas maiores',
          'Esconder o conteúdo no celular e exibir uma mensagem pedindo que abram no computador',
          'Duas páginas separadas, uma para cada dispositivo, escolhidas pelo servidor a cada acesso'
        ], 'Mobile-first com min-width mantém um só código que melhora conforme a tela cresce. Larguras fixas estouram em telas pequenas, e duas páginas duplicam manutenção.'),
        mcq('q6', 'Uma galeria deve ter colunas de pelo menos 200px que se ajustam à largura disponível. Qual declaração faz isso?', 'b', [
          'flex-direction: column-reverse para inverter a ordem das colunas na tela',
          'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))',
          'grid-template-rows: 200px 1fr e ajustar a altura das linhas',
          'width: 200vw para reservar duzentas vezes a largura'
        ], 'repeat(auto-fit, minmax(200px, 1fr)) cria quantas colunas couberem com mínimo de 200px e divide o espaço restante. As outras não criam colunas adaptáveis.'),
        mcq('q7', 'Por que preferir rem a px para tamanhos de fonte?', 'a', [
          'rem acompanha a preferência de fonte configurada no navegador da pessoa',
          'rem é a única unidade que o CSS aceita dentro das media queries',
          'px não funciona em telas de alta resolução, por isso foi abandonado pelos navegadores',
          'rem fixa o texto em 16 pixels, independentemente do restante da página'
        ], 'rem é relativo à fonte da raiz, que respeita ajustes de acessibilidade. px é fixo, mas funciona em qualquer tela; e rem não fixa o tamanho em 16 pixels.'),
        fill('q8', 'Complete com a unidade do grid que representa uma fração do espaço livre.', 'grid-template-columns: 1___ 2fr;', ['fr'], 'fr divide o espaço livre do grid em frações; 1fr 2fr dá à segunda coluna o dobro da primeira.')
      ]
    },
    {
      id: 'fib-04-javascript-moderno-para-frontend',
      title: 'JavaScript moderno para front-end',
      goal: 'Usar módulos ESM, arrow functions, desestruturação, spread, template strings, métodos de array, async/await com fetch e imutabilidade, a base de todos os frameworks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Módulos ESM',
            'Um módulo é um arquivo com seu próprio escopo, que EXPORTA o que quer compartilhar e IMPORTA o que precisa de outros arquivos. export const x ou export function f() são exports nomeados e importam com chaves: import { x } from \'./arquivo.js\'. export default exporta um valor "principal" do arquivo, importado sem chaves e com o nome que você quiser: import Botao from \'./Botao.js\'. No HTML, o script precisa de type="module". Frameworks e o Vite usam módulos para dividir a aplicação em arquivos pequenos. Erro comum: usar chaves para importar um default (ou omiti-las em um export nomeado).',
            '// util.js\nexport const dobro = (n) => n * 2;\nexport default function saudacao(nome) { return \'Olá, \' + nome; }\n\n// main.js\nimport saudacao, { dobro } from \'./util.js\';\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Arrow functions, desestruturação, spread e template strings',
            'Arrow function: forma curta de função, (a, b) => a + b; com um único parâmetro os parênteses são opcionais, e o corpo sem chaves devolve o valor automaticamente. Desestruturação extrai valores de objetos e arrays: const { nome, tema } = usuario; const [primeiro, segundo] = lista;. Spread (...) espalha os elementos de um array ou as propriedades de um objeto para um novo: [...lista, 5] cria um array novo com 5 no fim; { ...usuario, tema: \'escuro\' } cria um objeto novo copiando usuario e trocando tema. Template string usa crases e ${ } para inserir expressões: `Olá, ${nome}`. Esses recursos aparecem em quase toda linha de código de React, Vue e Angular.',
            'const usuario = { nome: \'Ana Exemplo\', tema: \'claro\' };\nconst { nome } = usuario;\nconst novo = { ...usuario, tema: \'escuro\' };\nconsole.log(`Olá, ${nome}! Tema: ${novo.tema}`);'
          ),
          sl(
            'Métodos de array',
            'Em vez de laços for manuais, use métodos que descrevem a intenção e NÃO alteram o array original. map transforma cada item e devolve um array novo do mesmo tamanho. filter devolve um array novo só com os itens para os quais a função devolve verdadeiro. reduce acumula a lista em um único valor (soma, objeto, etc.). find devolve o primeiro item que combina (ou undefined). some e every respondem se algum/todos combinam. Eles são a base de listas em frameworks: a tela de uma lista é quase sempre lista.map(...). Exemplo executado de verdade, com a saída real:',
            'const nums = [1, 2, 3, 4];\nconst dobrados = nums.map(n => n * 2);\nconst pares = nums.filter(n => n % 2 === 0);\nconst soma = nums.reduce((acc, n) => acc + n, 0);\nconsole.log(dobrados, pares, soma);\n// saída real:\n// [ 2, 4, 6, 8 ] [ 2, 4 ] 10'
          ),
          sl(
            'Imutabilidade na prática',
            'Imutabilidade significa NÃO alterar um dado existente: você cria uma cópia com a mudança. Frameworks detectam mudanças comparando referências (a nova é diferente da antiga?). Se você altera o objeto original (lista.push(x), usuario.tema = \'escuro\') a referência continua a mesma e o framework pode não perceber a mudança. Receita: objetos com { ...obj, campo: novo }; arrays com [...lista, novo] para adicionar, lista.filter(...) para remover, lista.map(...) para trocar um item. Atenção: o spread é cópia RASA (só o primeiro nível); objetos aninhados continuam compartilhados e precisam ser copiados também no nível que muda. Saída real do exemplo:',
            'const usuario = { nome: \'Ana Exemplo\', tema: \'claro\' };\nconst atualizado = { ...usuario, tema: \'escuro\' };\nconsole.log(usuario.tema, atualizado.tema, usuario === atualizado);\n// saída real:\n// claro escuro false\n\nconst nums = [1, 2, 3, 4];\nconst lista = [...nums, 5];\nconsole.log(nums.length, lista.length);\n// saída real:\n// 4 5'
          ),
          sl(
            'async/await e fetch',
            'Operações demoradas (buscar dados na rede) são assíncronas: devolvem uma Promise, um valor "prometido" que chega depois. async function declara que a função devolve Promise e permite usar await, que pausa a função até a Promise resolver. fetch(url) pede dados; a Promise resolve com a resposta (Response) mesmo quando o servidor responde 404 ou 500, então você deve checar response.ok antes de ler o corpo com await response.json(). Envolva em try/catch para erros de rede e mostre mensagem genérica à pessoa usuária, sem vazar detalhes internos. Não coloque dados pessoais na URL (aparecem em históricos e logs). Para o lado do servidor e das APIs, veja o curso de Node.js.',
            'async function carregar() {\n  try {\n    const resposta = await fetch(\'/api/tarefas\');\n    if (!resposta.ok) throw new Error(\'Falha ao carregar\');\n    return await resposta.json();\n  } catch (erro) {\n    console.error(\'Erro ao carregar tarefas\'); // sem dados pessoais no log\n    return [];\n  }\n}\n// ilustrativo, não executado aqui (precisa de servidor)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual linha cria um novo array com 5 no fim sem alterar o array original lista?', 'a', [
          'const nova = [...lista, 5];',
          'lista.push(5);',
          'const nova = lista.push(5); e usar lista como se fosse uma cópia',
          'lista[lista.length] = 5; como se criasse um array novo'
        ], 'O spread cria um array novo. push e a atribuição por índice alteram o original, e push devolve o novo tamanho, não um array.'),
        mcq('q2', 'Dado const { nome } = usuario;, o que acontece?', 'd', [
          'O objeto usuario passa a ter apenas a propriedade nome, perdendo as demais',
          'É criada uma cópia profunda de usuario chamada nome, independente do original',
          'O código lança erro, pois chaves só podem ser usadas em blocos if',
          'Uma variável nome recebe o valor da propriedade nome do objeto usuario'
        ], 'Desestruturação extrai propriedades para variáveis. Não altera o objeto original nem copia nada em profundidade.'),
        mcq('q3', 'Uma pessoa faz response = await fetch(url) e depois await response.json() sem checar response.ok. Qual risco existe?', 'a', [
          'O fetch resolve mesmo com erro 500, e o código trata a resposta de erro como dado válido',
          'O fetch não resolve quando o servidor responde 500, travando a aplicação inteira',
          'O await bloqueia a página inteira até a resposta chegar, impedindo cliques e rolagem',
          'O response.json() só funciona se o status da resposta for exatamente 404'
        ], 'fetch só rejeita em falha de rede; respostas 4xx/5xx resolvem normalmente. Checar ok evita tratar erro como sucesso. await não bloqueia a interface.'),
        fill('q4', 'Complete com o método de array que transforma cada item e devolve um novo array do mesmo tamanho.', 'const dobrados = nums.___(n => n * 2);', ['map'], 'map aplica a função a cada elemento e devolve um novo array do mesmo tamanho.'),
        mcq('q5', 'Em export default function Botao() {}, como importar corretamente em outro arquivo?', 'a', [
          'import Botao from \'./Botao.js\';',
          'import { Botao } from \'./Botao.js\';',
          'import * from \'./Botao.js\' as Botao;',
          'require.export(\'./Botao.js\');'
        ], 'Exports default são importados sem chaves, com qualquer nome. Chaves são para exports nomeados, e as demais formas não existem.'),
        mcq('q6', 'Um framework não atualiza a tela depois de usuario.tema = \'escuro\' sobre o mesmo objeto. Qual é a correção alinhada com imutabilidade?', 'd', [
          'Ler usuario.tema duas vezes seguidas para forçar o framework a detectar a mudança',
          'Converter o objeto em string e compará-lo com o anterior a cada segundo',
          'Declarar usuario com var em vez de const para que a atualização seja percebida',
          'Criar um objeto novo, como { ...usuario, tema: \'escuro\' }, e usá-lo como estado'
        ], 'Frameworks comparam referências; um objeto novo tem referência diferente e sinaliza a mudança. Mutar o mesmo objeto ou trocar a palavra de declaração não resolve.'),
        mcq('q7', 'O que o spread { ...a } copia ao lidar com um objeto aninhado a.endereco?', 'c', [
          'O objeto aninhado em profundidade, criando um endereco totalmente independente do original',
          'Nada, pois as propriedades que sejam objetos são descartadas pela cópia rasa',
          'A referência do objeto aninhado: cópia e original compartilham endereco',
          'Uma string que representa o objeto aninhado, escrita no formato JSON'
        ], 'O spread é cópia rasa: o primeiro nível é novo, mas objetos internos continuam compartilhados. Para mudar algo aninhado é preciso copiar também esse nível.'),
        fill('q8', 'Complete com a palavra-chave que pausa uma função async até a Promise resolver.', 'const dados = ___ resposta.json();', ['await'], 'await pausa a função async até a Promise resolver e devolve o valor.')
      ]
    },
    {
      id: 'fib-05-ferramentas-node-npm-e-vite',
      title: 'Ferramentas: Node, npm e Vite',
      goal: 'Usar Node e npm só como ferramenta, entender package.json, scripts e Vite (desenvolvimento, HMR, build), a estrutura de um projeto e boas práticas de segurança de dependências.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Node e npm como ferramenta',
            'Node.js é um ambiente que executa JavaScript fora do navegador. No front-end você não o usa para o site em si, e sim como FERRAMENTA de desenvolvimento: ele roda o servidor local, o compilador e os testes. npm (Node Package Manager) vem com o Node e instala PACOTES (código de terceiros) em uma pasta node_modules. Comandos essenciais: npm install nome (adiciona um pacote), npm install (instala o que o projeto já lista), npm run nome (executa um script do projeto). Para usar Node como servidor de APIs, veja o curso de Node.js. Aqui ele é só a base das ferramentas.',
            'npm install            # instala as dependências listadas\nnpm run dev            # roda o script "dev" do package.json\n# ilustrativo, não executado aqui'
          ),
          sl(
            'package.json e lockfile',
            'O arquivo package.json descreve o projeto: nome, scripts (atalhos para comandos), dependencies (pacotes necessários para a aplicação funcionar) e devDependencies (pacotes só para desenvolver: ferramentas de build, testes). Versões usam intervalos como ^1.2.3 (aceita atualizações compatíveis). O package-lock.json fixa as versões EXATAS instaladas, para que todo mundo e o servidor de build obtenham o mesmo resultado; ele deve ir para o controle de versão. npm ci instala exatamente o que o lockfile diz (indicado para automação). A pasta node_modules NÃO vai para o controle de versão: é regenerada.',
            '{\n  "name": "meu-app",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": { },\n  "devDependencies": { }\n}'
          ),
          sl(
            'Vite',
            'Vite é uma ferramenta de build moderna para front-end. Em desenvolvimento, npm run dev inicia um servidor local que serve seu código rapidamente e aplica HMR (Hot Module Replacement): ao salvar um arquivo, só aquele módulo é trocado na página aberta, preservando o estado quando possível, sem recarregar tudo. Para produção, npm run build junta, minifica e otimiza tudo em uma pasta (normalmente dist) com arquivos estáticos prontos para qualquer servidor web; npm run preview serve essa pasta localmente para conferir. Vite funciona com React, Vue e outros; o Angular usa sua própria CLI, que também oferece servidor local e build. Confira a documentação oficial da versão que você usa.',
            'npm create vite@latest meu-app\ncd meu-app\nnpm install\nnpm run dev       # desenvolvimento com HMR\nnpm run build     # gera a pasta de produção\n# ilustrativo, não executado aqui'
          ),
          sl(
            'Estrutura de um projeto',
            'Um projeto típico tem: index.html (a única página, com um elemento onde a aplicação é montada e um script do ponto de entrada), src/ (seu código: o ponto de entrada main.js ou main.ts, componentes, estilos), public/ (arquivos servidos como estão, como ícones), package.json, package-lock.json e arquivos de configuração (vite.config.js). A aplicação "monta" no elemento do index.html. Variáveis de ambiente no Vite só chegam ao código do navegador se começarem com VITE_ e, por isso mesmo, são PÚBLICAS: nunca ponha segredos nelas. Use-as para valores como a URL da API ou uma chave pública.',
            'meu-app/\n  index.html        <- página única + <div id="app">\n  package.json\n  vite.config.js\n  public/           <- arquivos estáticos\n  src/\n    main.js         <- ponto de entrada\n    components/     <- seus componentes'
          ),
          sl(
            'TypeScript é opcional',
            'TypeScript é JavaScript com TIPOS: você declara que uma variável é número ou texto, e o editor e o compilador avisam erros antes de rodar (por exemplo, passar texto onde se espera número). Os navegadores não executam TypeScript: ele é convertido em JavaScript pelo build, e os tipos desaparecem. React e Vue funcionam com ou sem TypeScript; no Angular ele é obrigatório. Para quem está começando, entender os conceitos em JavaScript primeiro é válido, mas em equipes e projetos longos os tipos evitam muitos erros. Em troca você usa arquivos .ts e .tsx e um passo de verificação de tipos.'
          ),
          sl(
            'Segurança básica de dependências',
            'Cada pacote que você instala é código de outras pessoas que roda na sua aplicação e, às vezes, na sua máquina durante a instalação. Boas práticas: instale só o necessário; confira nome, mantenedores e atividade do pacote (cuidado com nomes quase iguais aos populares, o typosquatting); mantenha o lockfile no controle de versão e use npm ci em automação; rode npm audit para ver vulnerabilidades conhecidas e atualize com critério; evite rodar comandos de instalação copiados de fontes desconhecidas. Não coloque segredos no repositório nem em variáveis VITE_. Para mais sobre cadeia de suprimentos, veja o curso de Segurança Web (OWASP).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve o arquivo package-lock.json?', 'a', [
          'Fixar as versões exatas instaladas para todas as máquinas obterem o mesmo resultado',
          'Guardar as senhas de acesso ao registro de pacotes usado pela equipe do projeto',
          'Impedir que outras pessoas leiam o código-fonte do projeto no navegador',
          'Listar quais arquivos o navegador deve baixar primeiro ao abrir a aplicação'
        ], 'O lockfile garante instalações reproduzíveis. Não guarda senhas, não protege código e não controla o carregamento no navegador.'),
        mcq('q2', 'Qual é a diferença entre dependencies e devDependencies?', 'c', [
          'Dependencies são pacotes pagos e devDependencies são pacotes gratuitos, segundo a licença',
          'Dependencies rodam apenas no servidor, e devDependencies rodam apenas no navegador',
          'Dependencies são necessárias para a aplicação; devDependencies servem só ao desenvolvimento, como build e testes',
          'Não há diferença entre elas: são nomes alternativos para a mesma lista de pacotes'
        ], 'A separação indica o que a aplicação precisa para rodar versus o que só ajuda a construí-la. As demais descrições não correspondem ao npm.'),
        mcq('q3', 'Uma pessoa coloca VITE_CHAVE_SECRETA=<SEGREDO> em um arquivo de ambiente de um projeto Vite achando que ela fica protegida. O que acontece?', 'b', [
          'O Vite criptografa automaticamente o valor no build de produção, protegendo a chave',
          'O prefixo VITE_ inclui o valor no código enviado ao navegador, então ele fica público',
          'A variável é lida somente no servidor do Vite e nunca chega a ser enviada ao navegador',
          'O prefixo VITE_ faz o Vite exigir uma senha para abrir a página em produção'
        ], 'Só variáveis prefixadas com VITE_ chegam ao código do cliente, e justamente por isso são públicas. Segredos pertencem a um servidor/back-end.'),
        fill('q4', 'Complete com o comando que gera a pasta de produção em um projeto Vite.', 'npm run ___', ['build'], 'npm run build executa o script de build e gera os arquivos otimizados para produção.'),
        mcq('q5', 'O que é HMR (Hot Module Replacement)?', 'b', [
          'Um comando do npm que reinicia o computador após instalar um novo pacote',
          'Trocar só o módulo alterado na página aberta, sem recarregar tudo',
          'Uma técnica que criptografa o código gerado no build de produção',
          'Um tipo de teste automático que roda antes do build para validar o projeto'
        ], 'HMR atualiza só o que mudou durante o desenvolvimento, preservando estado quando possível. Não tem relação com criptografia nem com testes.'),
        mcq('q6', 'Qual prática ajuda a reduzir o risco de pacotes maliciosos?', 'd', [
          'Instalar qualquer pacote com nome parecido para ter uma segunda opção',
          'Apagar o package-lock.json para forçar sempre as versões mais novas',
          'Copiar e executar o comando de instalação de qualquer tutorial encontrado',
          'Conferir nome, mantenedores e atividade antes de instalar, e rodar npm audit com regularidade'
        ], 'Verificar a origem e auditar reduzem risco. Apagar o lockfile e executar comandos desconhecidos aumentam a exposição.'),
        mcq('q7', 'Sobre TypeScript no front-end, o que está correto?', 'b', [
          'Os navegadores atuais executam arquivos .ts diretamente, sem etapa de build intermediária',
          'O navegador não executa TypeScript; o build o converte em JavaScript',
          'TypeScript é obrigatório em projetos React e opcional em projetos Angular',
          'TypeScript substitui o HTML e o CSS nos componentes da aplicação'
        ], 'Os tipos existem só no desenvolvimento e são removidos pelo build. No Angular o TypeScript é obrigatório; em React é opcional.'),
        fill('q8', 'Complete com o comando de instalação exata, baseada no lockfile, indicado para automação.', 'npm ___', ['ci'], 'npm ci instala exatamente o que o package-lock.json define, de forma reproduzível.')
      ]
    },
    {
      id: 'fib-06-pensando-em-componentes',
      title: 'Pensando em componentes',
      goal: 'Entender declarativo x imperativo, componentes, props, estado, fluxo unidirecional e composição, com um exemplo executável em JavaScript puro.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Imperativo x declarativo',
            'No estilo IMPERATIVO você diz PASSO A PASSO o que fazer ("encontre o elemento, crie um li, defina o texto, anexe na lista, atualize o contador"). No estilo DECLARATIVO você descreve o RESULTADO para um dado estado ("para estas tarefas, a tela é esta lista com este contador") e deixa a ferramenta executar os passos. É a diferença entre dar instruções de cada curva a um motorista e dar apenas o endereço. React, Vue e Angular são declarativos: a pessoa desenvolvedora mantém o ESTADO (os dados) e escreve como a tela se parece para ele; quando o estado muda, o framework atualiza o que for necessário.'
          ),
          sl(
            'Componentes',
            'Um componente é uma peça reutilizável de interface com nome, entradas e saída: recebe dados e devolve um pedaço de tela. Exemplos: Botao, CartaoDeProduto, ListaDeTarefas. Componentes podem conter outros, formando uma árvore (como o DOM): a aplicação é o componente raiz, que contém cabeçalho, lista e rodapé, e a lista contém um componente Tarefa para cada item. Vantagens: reutilização (escreva uma vez, use muitas), isolamento (cada peça é entendida sozinha) e testes mais simples. Regra prática: se um trecho se repete ou tem uma responsabilidade própria, vire componente.'
          ),
          sl(
            'Props e estado',
            'PROPS (propriedades) são as entradas que o componente PAI passa para o filho, como argumentos de função: o filho só LÊ, não altera. ESTADO é um dado que o componente guarda e que muda com o tempo (o texto de um campo, a lista de tarefas, se um menu está aberto); quando o estado muda, a tela é refeita. Distinção essencial: props vêm de fora e são somente leitura; estado pertence ao componente (ou a um ancestral) e é alterado por ele. Erro comum: guardar em estado algo que pode ser calculado a partir de props ou de outro estado (estado derivado): calcule na hora em vez de duplicar.'
          ),
          sl(
            'Fluxo unidirecional e composição',
            'Nos três frameworks os dados descem e os eventos sobem: o pai passa dados ao filho por props (para baixo); quando algo acontece no filho (um clique), ele AVISA o pai por um evento ou função recebida (para cima), e o pai atualiza seu estado, que desce de novo. Esse fluxo de mão única torna o comportamento previsível: para saber de onde um dado vem, basta subir a árvore. COMPOSIÇÃO é montar componentes maiores a partir de menores e passar conteúdo para dentro deles (os "filhos" do componente) em vez de usar herança: um Cartao pode receber qualquer conteúdo e só cuida do visual.'
          ),
          sl(
            'Exemplo executável: tela como função do estado',
            'Veja a ideia em JavaScript puro: componentes são funções que recebem props e devolvem uma STRING de HTML; a tela é uma função do estado. Observe o escape do título: um texto com marcação aparece como texto, o que evita XSS. Mudamos o estado criando um objeto novo (imutabilidade) e chamamos a renderização de novo. Frameworks fazem isso de forma eficiente, atualizando só o que mudou no DOM em vez de refazer tudo.',
            'const escapar = (t) => String(t).replace(/[&<>"\']/g, c => ({\'&\':\'&amp;\',\'<\':\'&lt;\',\'>\':\'&gt;\',\'"\':\'&quot;\',"\'":\'&#39;\'}[c]));\nfunction Tarefa({ titulo, feita }) {\n  return `<li class="${feita ? \'feita\' : \'\'}">${escapar(titulo)}</li>`;\n}\nfunction Lista({ tarefas }) {\n  const pendentes = tarefas.filter(t => !t.feita).length;\n  return `<h2>Pendentes: ${pendentes}</h2><ul>${tarefas.map(Tarefa).join(\'\')}</ul>`;\n}\nlet estado = { tarefas: [{ titulo: \'Estudar HTML\', feita: true }, { titulo: \'<b>Estudar CSS</b>\', feita: false }] };\nconsole.log(Lista(estado));\nestado = { tarefas: [...estado.tarefas, { titulo: \'Estudar JS\', feita: false }] };\nconsole.log(Lista(estado));'
          ),
          sl(
            'Lendo a saída real',
            'A execução do exemplo anterior produziu exatamente isto. Repare: o título com marcação foi escapado (&lt;b&gt;) e aparece como texto; o contador mudou de 1 para 2 pendentes porque ele é CALCULADO a partir das tarefas (estado derivado), sem variável separada que pudesse ficar desatualizada; e o novo estado foi criado com spread, sem alterar o anterior. Esses três pontos (escape, derivação e imutabilidade) acompanham todos os frameworks. Nas próximas lições você verá a mesma ideia em React (função que devolve JSX), Vue (template reativo) e Angular (template com binding).',
            '<h2>Pendentes: 1</h2><ul><li class="feita">Estudar HTML</li><li class="">&lt;b&gt;Estudar CSS&lt;/b&gt;</li></ul>\n<h2>Pendentes: 2</h2><ul><li class="feita">Estudar HTML</li><li class="">&lt;b&gt;Estudar CSS&lt;/b&gt;</li><li class="">Estudar JS</li></ul>'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual frase descreve melhor o estilo declarativo?', 'a', [
          'Descrever como a tela fica para um estado e deixar a ferramenta aplicar as mudanças',
          'Escrever cada passo de criação e remoção de elementos do DOM, em ordem rigorosa',
          'Guardar o estado dentro dos próprios elementos HTML, por meio de classes e atributos',
          'Recarregar a página inteira a cada mudança de dado para refazer a interface'
        ], 'No declarativo você descreve o resultado, não os passos. As outras opções descrevem o estilo imperativo ou práticas que não definem o conceito.'),
        mcq('q2', 'Um componente Cartao recebe titulo do pai e tenta fazer titulo = \'Outro\' dentro de si. Qual é o problema conceitual?', 'c', [
          'Props aceitam apenas números, então um texto causaria erro logo na renderização',
          'O componente deveria alterar o título diretamente no DOM do componente pai',
          'Props são somente leitura; para mudar o dado, o pai deve alterá-lo',
          'O título deveria ser guardado em um arquivo CSS compartilhado entre os componentes'
        ], 'Props descem do pai e o filho só as lê. Se algo precisa mudar, o filho avisa o pai (evento) e o pai atualiza o estado.'),
        mcq('q3', 'Uma lista guarda tarefas em estado e também uma variável "totalPendentes" atualizada à mão. Qual é a prática mais saudável?', 'c', [
          'Manter as duas variáveis e lembrar de atualizar ambas em cada mudança feita na lista',
          'Guardar o total em um cookie do navegador para que ele nunca seja esquecido',
          'Calcular o total a partir da lista na hora de renderizar',
          'Guardar o total no CSS, usando uma variável --total lida pelo JavaScript'
        ], 'O total é estado derivado: pode ser calculado da lista. Duplicar cria risco de ficarem inconsistentes.'),
        fill('q4', 'Complete com o nome das entradas que o componente pai passa aos filhos e que o filho só pode ler.', 'Dados que descem do pai para o filho = ___', ['props', 'propriedades'], 'Props (propriedades) são as entradas passadas pelo pai e somente leitura para o filho.'),
        mcq('q5', 'No fluxo unidirecional, o que acontece quando um botão dentro de um componente filho é clicado e precisa mudar um dado do pai?', 'a', [
          'O filho avisa o pai por um evento, o pai atualiza seu estado e os dados descem de novo',
          'O filho altera diretamente a variável do pai, e o pai percebe a mudança sozinho',
          'O filho recria a árvore inteira de componentes a partir da raiz da aplicação',
          'O navegador sincroniza automaticamente o dado do filho com o do pai, sem código'
        ], 'Dados descem, eventos sobem; quem possui o estado é quem o altera. Isso mantém a origem de cada dado rastreável.'),
        mcq('q6', 'No exemplo executável, por que o título "<b>Estudar CSS</b>" aparece como &lt;b&gt;Estudar CSS&lt;/b&gt; na saída?', 'b', [
          'O Node não sabe interpretar tags HTML e as remove sempre que imprime texto no terminal',
          'A função escapar converte caracteres especiais em entidades, então o texto não vira marcação',
          'O estado foi alterado por mutação direta no array antes de renderizar a lista',
          'O método filter transformou o título em texto durante a contagem de pendentes'
        ], 'O escape troca < e > por entidades, o que impede que dados externos sejam interpretados como HTML (proteção contra XSS).'),
        mcq('q7', 'Qual benefício a composição de componentes traz?', 'd', [
          'Garantir que todo componente tenha o mesmo estado compartilhado automaticamente',
          'Eliminar a necessidade de props, pois os dados passam a viver no DOM',
          'Permitir que os filhos alterem livremente o estado dos componentes pais',
          'Montar peças maiores a partir de menores, passando conteúdo para dentro delas'
        ], 'Composição favorece reutilização e isolamento. Não elimina props nem dá acesso livre ao pai.'),
        fill('q8', 'Complete com o nome do dado que muda com o tempo e faz a tela ser refeita quando alterado.', 'Dado interno do componente que muda com o tempo = ___', ['estado', 'state'], 'Estado é o dado guardado pelo componente (ou ancestral) que, ao mudar, provoca nova renderização.')
      ]
    },
    {
      id: 'fib-07-react-primeiro-componente',
      title: 'React: primeiro componente',
      goal: 'Criar um projeto React com Vite e escrever componentes de função em JSX com props, children, listas e keys.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Criando o projeto',
            'React é uma biblioteca para construir interfaces com componentes. A forma comum de começar é com Vite, que monta a estrutura e o servidor de desenvolvimento. O comando abaixo pergunta o nome do projeto e o "template" (escolha React, com ou sem TypeScript). Depois você instala as dependências e roda o servidor local. O ponto de entrada (main.jsx) pega o elemento do index.html e "monta" o componente raiz dentro dele. Os nomes exatos dos arquivos e opções mudam entre versões: confira a documentação oficial da versão em uso.',
            'npm create vite@latest meu-app\ncd meu-app\nnpm install\nnpm run dev\n# ilustrativo, não executado aqui\n\n// src/main.jsx (ilustrativo)\nimport { createRoot } from \'react-dom/client\';\nimport App from \'./App.jsx\';\ncreateRoot(document.getElementById(\'root\')).render(<App />);'
          ),
          sl(
            'Componentes de função e JSX',
            'Um componente React é uma FUNÇÃO cujo nome começa com letra MAIÚSCULA e que devolve JSX. JSX é uma sintaxe parecida com HTML escrita dentro do JavaScript; o build a converte em chamadas de função comuns. Regras principais: (1) a função devolve UM elemento raiz (use um contêiner ou fragmento <>...</>); (2) atributos usam camelCase e alguns nomes mudam: className no lugar de class, htmlFor no lugar de for; (3) toda tag é fechada (<input />); (4) chaves {} inserem uma expressão JavaScript: <h1>Olá, {nome}</h1>. Valores inseridos com {} são ESCAPADOS automaticamente, o que protege contra XSS no texto. Para usar um componente, escreva como tag: <Saudacao />.',
            '// ilustrativo, não executado aqui (JSX precisa de build)\nfunction Saudacao() {\n  const nome = \'Ana Exemplo\';\n  return <h1 className="titulo">Olá, {nome}!</h1>;\n}'
          ),
          sl(
            'Props e children',
            'Props são o objeto de argumentos do componente: <Cartao titulo="Oi" /> chama Cartao({ titulo: "Oi" }). Use desestruturação para ler: function Cartao({ titulo, children }). Props são SOMENTE LEITURA: nunca as altere. Valores que não são texto vão entre chaves: <Contador inicial={5} ativo={true} />. children é uma prop especial: tudo que você coloca ENTRE as tags do componente chega nela, o que permite composição: <Cartao titulo="Aviso"><p>Conteúdo qualquer</p></Cartao>. Erro comum: esquecer as chaves e passar o número como texto ("5").',
            '// ilustrativo, não executado aqui\nfunction Cartao({ titulo, children }) {\n  return (\n    <section className="cartao">\n      <h2>{titulo}</h2>\n      {children}\n    </section>\n  );\n}\n\n<Cartao titulo="Aviso"><p>Conteúdo qualquer</p></Cartao>'
          ),
          sl(
            'Renderizando listas e keys',
            'Para mostrar uma lista, transforme o array em elementos com map dentro do JSX. Cada item da lista precisa de uma prop key: um valor ÚNICO entre irmãos e ESTÁVEL (que identifica o item, como um id). O React usa a key para saber qual item é qual quando a lista muda, em vez de recriar tudo. Sem key aparece um aviso no console; usar o índice do array como key funciona só em listas que nunca mudam de ordem, tamanho nem conteúdo (a lição 10 mostra o problema). A key não chega ao componente como prop: se o filho precisar do id, passe outra prop.',
            '// ilustrativo, não executado aqui\nfunction ListaTarefas({ tarefas }) {\n  return (\n    <ul>\n      {tarefas.map(t => (\n        <li key={t.id}>{t.titulo}</li>\n      ))}\n    </ul>\n  );\n}'
          ),
          sl(
            'Armadilhas e segurança',
            'Armadilha 1: nomes de componentes em minúscula (<cartao />) são tratados como tags HTML; use maiúscula. Armadilha 2: dois elementos irmãos sem raiz comum causam erro; envolva em fragmento <>...</>. Armadilha 3: chamar um componente como função dentro de outro em vez de usar como tag. Segurança: React escapa o que você insere com {}, mas dangerouslySetInnerHTML desliga essa proteção e interpreta o valor como HTML: use só com conteúdo sanitizado por biblioteca própria e, de preferência, evite. Também não use href vindo de usuário sem validar o protocolo (javascript: é perigoso); aceite só http, https ou mailto. Veja o curso de Segurança Web (OWASP).',
            '// VULNERÁVEL (ilustrativo): HTML de fonte externa sem tratamento\n<div dangerouslySetInnerHTML={{ __html: comentarioDoUsuario }} />\n\n// CORRETO: texto comum, escapado pelo React\n<div>{comentarioDoUsuario}</div>'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o componente <cartao /> (minúsculo) não funciona como esperado?', 'd', [
          'Componentes React só podem ter nomes com mais de oito letras no total',
          'A palavra cartao é reservada pelo JSX e não pode nomear nenhum componente',
          'Funções em React não podem ser chamadas como tags dentro de outro JSX',
          'Nomes em minúscula são tratados como tags HTML; componentes começam com maiúscula'
        ], 'A inicial maiúscula distingue componente de elemento HTML nativo. Não há limite de tamanho nem palavra reservada nesse caso.'),
        mcq('q2', 'Qual atributo JSX aplica uma classe CSS a um elemento?', 'a', [
          'className',
          'class',
          'cssClass',
          'classList'
        ], 'class é palavra reservada em JavaScript, então o JSX usa className. As demais não são atributos JSX válidos para isso.'),
        mcq('q3', 'Dentro do JSX, como inserir o valor da variável nome em um título?', 'd', [
          '<h1>Olá, ${nome}</h1>',
          '<h1>Olá, (nome)</h1>',
          '<h1>Olá, <nome /></h1>',
          '<h1>Olá, {nome}</h1>'
        ], 'Chaves inserem expressões JavaScript no JSX. ${ } é de template string e <nome /> seria um elemento.'),
        fill('q4', 'Complete com a prop especial que recebe o conteúdo colocado entre as tags do componente.', 'function Cartao({ titulo, ___ }) {\n  // devolve <section><h2>{titulo}</h2> e o conteúdo interno</section>\n}', ['children'], 'children contém o que foi colocado entre as tags de abertura e fechamento do componente, permitindo composição.'),
        mcq('q5', 'Ao renderizar uma lista com map, qual valor é a melhor key?', 'b', [
          'Math.random() gerado a cada renderização',
          'O id único e estável de cada item',
          'O mesmo texto para todos os itens',
          'A posição do item, mesmo que a lista seja reordenada ou filtrada'
        ], 'A key deve identificar o item de forma única e estável. Valor aleatório muda a cada renderização e o índice engana quando a lista muda.'),
        mcq('q6', 'Um comentário de usuário será mostrado na tela. Qual código é seguro em React?', 'b', [
          '<p dangerouslySetInnerHTML={{ __html: comentario }} /> porque o React remove scripts',
          '<p>{comentario}</p>',
          '<p innerHTML={comentario} />',
          '<p>{eval(comentario)}</p>'
        ], 'Valores inseridos com chaves são escapados. dangerouslySetInnerHTML interpreta HTML e eval executa código: os dois são perigosos com entrada de usuário.'),
        mcq('q7', 'Um componente precisa devolver um título e um parágrafo lado a lado, sem criar uma div extra. O que usar?', 'c', [
          'Dois return seguidos na função para devolver os dois elementos',
          'Um array sem keys dentro de chaves',
          'Um fragmento <>...</> envolvendo os dois elementos',
          'Colocar o parágrafo como atributo do título e declarar o parágrafo como valor'
        ], 'Fragmentos agrupam irmãos sem adicionar nó ao DOM. Uma função só executa o primeiro return.'),
        fill('q8', 'Complete com o método de array usado para transformar uma lista em elementos JSX.', 'tarefas.___(t => <li key={t.id}>{t.titulo}</li>)', ['map'], 'map transforma cada item da lista em um elemento JSX e devolve o novo array de elementos.')
      ]
    },
    {
      id: 'fib-08-react-estado-com-usestate',
      title: 'React: estado com useState',
      goal: 'Guardar e atualizar estado com useState, tratar eventos, atualizar objetos e arrays de forma imutável, usar atualização funcional e respeitar as regras dos hooks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'useState',
            'Uma variável comum dentro do componente é recriada a cada renderização, então não guarda valor, e mudá-la não atualiza a tela. useState é um HOOK (função especial do React, nome começando com use) que guarda um valor entre renderizações. Ele devolve um par: [valor, funcaoQueAltera]. Chamar a função altera o estado E pede ao React para renderizar o componente de novo com o novo valor. Padrão: const [contagem, setContagem] = useState(0); o argumento é o valor inicial, usado só na primeira renderização.',
            '// ilustrativo, não executado aqui\nimport { useState } from \'react\';\n\nfunction Contador() {\n  const [contagem, setContagem] = useState(0);\n  return (\n    <button onClick={() => setContagem(contagem + 1)}>\n      Cliques: {contagem}\n    </button>\n  );\n}'
          ),
          sl(
            'Eventos no React',
            'Eventos usam props em camelCase: onClick, onChange, onSubmit. Você passa uma FUNÇÃO, não o resultado de chamá-la. Certo: onClick={() => setN(n + 1)} ou onClick={aoClicar}. Errado: onClick={aoClicar()}, que executa a função durante a renderização (e pode causar laço infinito se ela altera estado). O manipulador recebe um objeto de evento: em campos de texto, event.target.value é o texto atual. Em formulários, event.preventDefault() impede o recarregamento da página (você já viu isso no DOM).'
          ),
          sl(
            'Atualização imutável de objetos e arrays',
            'O React decide se precisa renderizar comparando o estado novo com o antigo por REFERÊNCIA. Se você altera o objeto ou array existente (mutação), a referência continua igual e a tela pode não atualizar. Sempre crie uma cópia: objeto — setUsuario({ ...usuario, tema: "escuro" }); adicionar a array — setLista([...lista, novo]); remover — setLista(lista.filter(i => i.id !== id)); trocar um item — setLista(lista.map(i => i.id === id ? { ...i, feita: true } : i)). Erros típicos: lista.push(novo) seguido de setLista(lista), ou usuario.tema = "escuro" seguido de setUsuario(usuario).',
            '// ERRADO (ilustrativo): muta o array e reenvia a mesma referência\nlista.push(novo);\nsetLista(lista);\n\n// CORRETO: cria um array novo\nsetLista([...lista, novo]);'
          ),
          sl(
            'Atualização funcional',
            'A função setter não altera a variável na hora: o novo valor aparece na PRÓXIMA renderização. Por isso, chamar setN(n + 1) três vezes seguidas no mesmo evento resulta em +1, não +3 (todas usam o mesmo n antigo). Quando o novo valor depende do anterior, passe uma função: setN(anterior => anterior + 1). O React entrega o valor mais recente a cada chamada, então três chamadas somam +3. Use a forma funcional sempre que o próximo estado for calculado a partir do estado atual, especialmente em contadores, listas e dentro de callbacks assíncronos.',
            '// ilustrativo, não executado aqui\nsetN(n + 1); setN(n + 1); setN(n + 1);          // +1 no total\nsetN(a => a + 1); setN(a => a + 1); setN(a => a + 1); // +3 no total'
          ),
          sl(
            'Estado derivado e regras dos hooks',
            'Não guarde em estado o que pode ser calculado: se você tem a lista de tarefas, o número de pendentes é const pendentes = tarefas.filter(t => !t.feita).length, calculado a cada renderização; guardá-lo em outro estado cria duas fontes da verdade que podem divergir. Regras dos hooks: (1) chame hooks só no TOPO do componente, nunca dentro de if, laços ou funções aninhadas, porque o React identifica cada hook pela ordem das chamadas; (2) chame hooks só em componentes de função ou em hooks personalizados. Um linter oficial (eslint-plugin-react-hooks) avisa quando você viola isso.',
            '// ilustrativo, não executado aqui\nfunction Lista({ tarefas }) {\n  const [filtro, setFiltro] = useState(\'todas\');   // topo do componente: ok\n  const pendentes = tarefas.filter(t => !t.feita).length; // derivado: sem useState\n  // if (x) { const [a, setA] = useState(0); }   // ERRADO: hook dentro de if\n  return <p>Pendentes: {pendentes}</p>;\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que useState(0) devolve?', 'c', [
          'Apenas o número 0, que depois pode ser reatribuído com =',
          'Um objeto com o histórico de todos os valores anteriores',
          'Um par: o valor atual do estado e uma função para alterá-lo',
          'Uma função que executa efeitos colaterais após a renderização'
        ], 'useState devolve [valor, setter]. Reatribuir a variável com = não avisa o React; histórico e efeitos são outros assuntos.'),
        mcq('q2', 'Um botão tem onClick={aoClicar()}. O que acontece?', 'd', [
          'A função roda só quando a pessoa clica, exatamente como se esperaria deste código',
          'O React ignora o atributo e mostra um erro de sintaxe no console do navegador',
          'A função roda duas vezes seguidas: no momento do clique e ao soltar o botão',
          'A função roda durante a renderização, não no clique, e seu resultado vira o manipulador'
        ], 'Parênteses chamam a função na hora. Para executar no clique, passe a função: onClick={aoClicar} ou uma arrow function.'),
        mcq('q3', 'Uma lista é atualizada com lista.push(novo); setLista(lista); e a tela não muda. Por quê?', 'c', [
          'push não funciona dentro de componentes React, pois ele é bloqueado pelo compilador',
          'O setLista aceita apenas números e ignora silenciosamente arrays de objetos',
          'O array foi mutado e a mesma referência foi reenviada, então o React não percebe mudança',
          'A lista precisaria ser declarada com var para aceitar alterações em seus itens'
        ], 'O React compara referências. Criar um array novo ([...lista, novo]) sinaliza a mudança.'),
        fill('q4', 'Complete com o nome do hook que guarda estado em um componente de função.', 'const [contagem, setContagem] = ___(0);', ['useState'], 'useState guarda um valor entre renderizações e devolve o valor e o setter.'),
        mcq('q5', 'Após setN(n + 1) ser chamado três vezes seguidas no mesmo evento, com n valendo 0, qual será o valor na próxima renderização?', 'c', [
          '3, porque cada chamada soma 1 ao valor anterior dentro do mesmo evento de clique',
          '0, porque o setter ignora chamadas repetidas',
          '1, porque as três chamadas usam o mesmo valor antigo de n',
          'Erro de execução por chamadas consecutivas'
        ], 'O n usado nas três chamadas é o mesmo valor da renderização atual (0), então o resultado é 1. Para acumular, use setN(a => a + 1).'),
        mcq('q6', 'Qual das opções é a forma correta de marcar uma tarefa como feita pelo id sem mutar o estado?', 'b', [
          'tarefas.find(t => t.id === id).feita = true; setTarefas(tarefas) // marca no próprio objeto',
          'setTarefas(tarefas.map(t => t.id === id ? { ...t, feita: true } : t))',
          'setTarefas(tarefas.sort()) e depois filtrar por id',
          'tarefas[id].feita = true'
        ], 'map devolve um array novo e o spread copia só o item alterado. As demais alteram os dados existentes ou não implementam a troca.'),
        mcq('q7', 'Por que não se deve chamar useState dentro de um if?', 'a', [
          'A ordem das chamadas precisa ser a mesma em toda renderização',
          'Hooks dentro de if são mais lentos, mas funcionam corretamente em qualquer situação',
          'O if cria um novo escopo que apaga o estado guardado a cada renderização',
          'O JSX proíbe o uso da palavra if em qualquer ponto do arquivo do componente'
        ], 'Se a ordem das chamadas muda entre renderizações, o React associa o estado ao hook errado. Por isso hooks ficam no topo.'),
        fill('q8', 'Complete com o operador que copia as propriedades de um objeto ao criar um novo.', 'setUsuario({ ___usuario, tema: "escuro" });', ['...'], 'O spread (...) copia as propriedades existentes para o novo objeto, que então recebe o campo alterado.')
      ]
    },
    {
      id: 'fib-09-react-efeitos-e-ciclo-de-vida',
      title: 'React: efeitos e ciclo de vida',
      goal: 'Usar useEffect com dependências e cleanup, entender o StrictMode e a dupla execução em desenvolvimento, e reconhecer quando NÃO usar efeito.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um efeito',
            'A renderização de um componente deve ser PURA: dadas as mesmas props e estado, devolve o mesmo JSX, sem mexer no mundo exterior. Mas às vezes é preciso sincronizar o componente com algo de FORA do React: buscar dados, assinar um evento do navegador, iniciar um temporizador, mudar o título da página. Isso é um EFEITO colateral e vai dentro de useEffect(funcao, dependencias). O React executa a função DEPOIS de desenhar a tela. Efeitos não são "eventos do ciclo de vida" como montar/desmontar; pense neles como "sincronize com isto quando estes valores mudarem".',
            '// ilustrativo, não executado aqui\nimport { useEffect } from \'react\';\n\nfunction Titulo({ nome }) {\n  useEffect(() => {\n    document.title = \'Olá, \' + nome;\n  }, [nome]);\n  return <h1>{nome}</h1>;\n}'
          ),
          sl(
            'Array de dependências',
            'O segundo argumento controla QUANDO o efeito roda. Sem array: roda depois de TODA renderização (raramente o desejado). Array vazio []: roda uma vez após a primeira renderização. Array com valores [a, b]: roda na primeira vez e sempre que a ou b mudarem (comparação por referência). Regra: liste TODAS as variáveis de props e estado usadas dentro do efeito; o linter do React avisa quando falta alguma. Esquecer uma dependência causa bugs sutis, como o efeito usando um valor antigo.'
          ),
          sl(
            'Cleanup (limpeza)',
            'Muitos efeitos criam algo que precisa ser desfeito: um temporizador, uma assinatura, um listener. A função do efeito pode devolver outra função, a limpeza. O React a executa antes de rodar o efeito de novo (quando as dependências mudam) e quando o componente é removido da tela. Sem cleanup, um setInterval continua rodando depois que o componente some (vazamento de memória) e vários listeners se acumulam. Regra: se o efeito inicia, o cleanup para.',
            '// ilustrativo, não executado aqui\nuseEffect(() => {\n  const id = setInterval(() => setSegundos(s => s + 1), 1000);\n  return () => clearInterval(id);   // limpeza\n}, []);'
          ),
          sl(
            'StrictMode e execução dupla',
            'Projetos criados com Vite costumam envolver o App em <StrictMode>. Em DESENVOLVIMENTO, ele executa cada efeito duas vezes (monta, desmonta e monta de novo) de propósito, para revelar efeitos sem cleanup: se seu efeito quebra com a segunda execução, falta uma limpeza. Em produção, roda uma vez. Se você vê uma requisição disparada duas vezes só em desenvolvimento, isso não é um defeito do React: o correto é o efeito ser tolerante, por exemplo, cancelando a requisição anterior no cleanup com AbortController ou ignorando respostas obsoletas.',
            '// ilustrativo, não executado aqui\nuseEffect(() => {\n  const controle = new AbortController();\n  fetch(\'/api/tarefas\', { signal: controle.signal })\n    .then(r => r.ok ? r.json() : Promise.reject(new Error(\'falha\')))\n    .then(setTarefas)\n    .catch(() => {});\n  return () => controle.abort();   // cancela ao limpar\n}, []);'
          ),
          sl(
            'Quando NÃO usar efeito',
            'Efeitos são a "saída de emergência" para sincronizar com sistemas externos. Não use efeito para: (1) calcular dados a partir de props ou estado (calcule durante a renderização: const total = itens.length); (2) responder a um evento do usuário (coloque a lógica no manipulador onClick/onSubmit); (3) copiar props para estado só para "manter sincronizado". Um padrão ruim: useEffect(() => setTotal(itens.length), [itens]). Ele renderiza duas vezes sem necessidade e cria estado derivado. Substitua por const total = itens.length. Para buscar dados em aplicações reais, bibliotecas como TanStack Query tratam cache e cancelamento melhor do que efeitos escritos à mão (veremos nos níveis seguintes).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual array de dependências faz o efeito rodar apenas uma vez, após a primeira renderização?', 'b', [
          'Nenhum array (omitir o segundo argumento)',
          '[]',
          '[estado]',
          'null'
        ], 'O array vazio indica que o efeito não depende de nada que mude. Sem array roda a cada renderização, e [estado] roda quando o estado muda.'),
        mcq('q2', 'Um componente cria um setInterval em useEffect sem cleanup. O que acontece quando o componente sai da tela?', 'd', [
          'O React cancela automaticamente qualquer temporizador criado no efeito',
          'O navegador reinicia a página para limpar a memória',
          'O temporizador passa a rodar mais devagar',
          'O temporizador continua rodando, causando vazamento e possíveis erros'
        ], 'O React não conhece o que o efeito criou; é o cleanup que deve parar o que foi iniciado.'),
        mcq('q3', 'Em desenvolvimento, uma requisição aparece duas vezes no painel de rede com <StrictMode>. Qual é a interpretação correta?', 'a', [
          'O StrictMode executa efeitos duas vezes de propósito para revelar falta de limpeza',
          'O React tem um defeito conhecido que só aparece em projetos criados com Vite',
          'O navegador duplica toda requisição feita com fetch quando o painel de rede está aberto',
          'O servidor está respondendo duas vezes à mesma chamada por falha de configuração'
        ], 'A dupla execução em desenvolvimento é um recurso de verificação. Tornar o efeito tolerante (cleanup, AbortController) resolve.'),
        fill('q4', 'Complete com a função que cancela um setInterval no cleanup.', 'return () => ___(id);', ['clearInterval'], 'clearInterval(id) para o temporizador criado por setInterval.'),
        mcq('q5', 'Qual código evita um efeito desnecessário para calcular o total de itens?', 'd', [
          'useEffect(() => setTotal(itens.length), [itens]) com estado total',
          'useEffect(() => { total = itens.length }, [])',
          'Guardar o total em localStorage e ler a cada clique',
          'const total = itens.length; durante a renderização'
        ], 'Valores derivados são calculados na renderização. O efeito com setState renderiza duas vezes e cria duas fontes da verdade.'),
        mcq('q6', 'Onde deve ficar a lógica que roda quando a pessoa clica em "Enviar"?', 'c', [
          'Em um useEffect que observa um estado "enviou"',
          'No array de dependências',
          'No manipulador onSubmit ou onClick',
          'No return do componente, depois do JSX'
        ], 'Respostas a eventos do usuário pertencem ao manipulador do evento. Efeitos servem para sincronizar com o exterior, não para reagir a cliques.'),
        mcq('q7', 'Um efeito usa a variável filtro dentro de sua função, mas o array de dependências é []. Qual risco existe?', 'a', [
          'O efeito continua usando o valor antigo de filtro quando ele muda',
          'O efeito passa a rodar a cada milissegundo, travando a interface por completo',
          'O React lança erro imediatamente e deixa de renderizar o componente',
          'O filtro é apagado do estado quando a renderização seguinte acontece'
        ], 'Dependências incompletas fazem o efeito usar valores desatualizados. O linter dos hooks ajuda a detectar isso.'),
        fill('q8', 'Complete com o array de dependências que faz o efeito rodar só na montagem.', 'useEffect(() => { iniciar(); }, ___);', ['[]'], 'O array vazio [] significa que o efeito roda uma vez após a primeira renderização.')
      ]
    },
    {
      id: 'fib-10-react-renderizacao-condicional-e-listas',
      title: 'React: renderização condicional e listas',
      goal: 'Renderizar conteúdo condicional, listas dinâmicas e fragmentos, e entender por que keys estáveis importam (e por que índice quebra quando a lista muda).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Condicionais no JSX',
            'JSX aceita expressões, não instruções como if dentro das chaves. Há três padrões. (1) Operador ternário: {logado ? <Painel /> : <Login />} escolhe entre duas opções. (2) Operador &&: {temErros && <Aviso />} mostra algo ou nada. (3) if antes do return: if (carregando) return <p>Carregando...</p>; (retorno antecipado). Valores false, null e undefined não desenham nada. Cuidado clássico com &&: se o lado esquerdo for o número 0, o React DESENHA o 0 na tela (0 não é false). Use {itens.length > 0 && <Lista />} em vez de {itens.length && <Lista />}.',
            '// ilustrativo, não executado aqui\nfunction Mensagens({ itens, carregando }) {\n  if (carregando) return <p>Carregando...</p>;     // retorno antecipado\n  return (\n    <section>\n      {itens.length > 0 && <p>Total: {itens.length}</p>}\n      {itens.length === 0 ? <p>Nenhuma mensagem</p> : null}\n    </section>\n  );\n}'
          ),
          sl(
            'Listas dinâmicas',
            'Listas vêm de dados que mudam: itens são adicionados, removidos, filtrados e reordenados. Padrão: guarde o array em estado, derive a versão exibida (filtrada ou ordenada) na renderização sem alterar o original (cuidado: sort muta o array; copie antes com [...lista].sort(...)) e use map com key. Trate também os estados "vazio" e "carregando", que fazem parte da interface: uma lista vazia sem mensagem parece quebrada.',
            '// ilustrativo, não executado aqui\nconst visiveis = tarefas.filter(t => filtro === \'todas\' || !t.feita);\nreturn visiveis.length === 0\n  ? <p>Nenhuma tarefa</p>\n  : <ul>{visiveis.map(t => <li key={t.id}>{t.titulo}</li>)}</ul>;'
          ),
          sl(
            'Keys estáveis: o problema do índice',
            'A key diz ao React "este elemento é a mesma tarefa de antes". Se você usa o índice (posição) como key e a lista muda, a posição passa a apontar para outro item. Exemplo: lista [A, B, C] com keys 0, 1, 2, cada item com um campo de texto. Você digita "nota" no campo de A (key 0) e remove A: sobram [B, C] com keys 0, 1. O React acha que o elemento de key 0 é o mesmo de antes e REAPROVEITA o componente dele (com o texto digitado "nota" ainda dentro) agora para B. O campo de B aparece com o texto que era de A. Com key = id (A, B, C): ao remover A, o React remove só o componente de A e preserva B e C corretamente. Regra: use um id estável vindo dos dados; índice só é aceitável quando a lista é fixa e nunca reordenada.',
            '// PROBLEMÁTICO (ilustrativo): índice como key em lista que muda\n{itens.map((item, i) => <Linha key={i} item={item} />)}\n\n// CORRETO: id estável vindo dos dados\n{itens.map(item => <Linha key={item.id} item={item} />)}'
          ),
          sl(
            'Onde gerar ids',
            'O id deve existir nos DADOS, criado quando o item nasce (pelo servidor/banco ou, para itens só locais, com crypto.randomUUID() ao CRIAR o item, dentro do manipulador de evento). Nunca gere o id durante a renderização (key={Math.random()}): ele muda a cada renderização, o React acha que todos os itens são novos e destrói e recria todos os componentes, perdendo estado e foco e deixando a tela lenta. Keys só precisam ser únicas entre IRMÃOS, não globalmente.',
            '// ilustrativo, não executado aqui\nfunction adicionar(titulo) {\n  setTarefas([...tarefas, { id: crypto.randomUUID(), titulo, feita: false }]);\n}'
          ),
          sl(
            'Fragmentos com key',
            'Fragmento <>...</> agrupa elementos sem criar nó extra no DOM. A forma curta não aceita key; quando você precisa devolver vários elementos por item em um map (por exemplo, um termo e sua definição em uma lista de descrição), use <Fragment key={id}> importado de react. Sem key no fragmento do map, o React avisa no console. Resumo da lição: use condicionais claras (cuidado com 0 e &&), trate lista vazia, derive listas sem mutar o estado, escolha keys estáveis dos dados.',
            '// ilustrativo, não executado aqui\nimport { Fragment } from \'react\';\n\n<dl>\n  {termos.map(t => (\n    <Fragment key={t.id}>\n      <dt>{t.nome}</dt>\n      <dd>{t.definicao}</dd>\n    </Fragment>\n  ))}\n</dl>'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que aparece na tela com {itens.length && <Lista />} quando itens está vazio?', 'b', [
          'Nada, pois 0 é falso',
          'O número 0',
          'O texto false',
          'Um erro de renderização'
        ], 'O número 0 não é ignorado pelo React: ele é desenhado. Para evitar, compare: itens.length > 0 && <Lista />.'),
        mcq('q2', 'Em uma lista com key={i} (índice), o item A, no topo, é removido e o campo de texto dos itens aparece com o texto errado. Por quê?', 'c', [
          'O React apaga o conteúdo de todos os campos de texto sempre que um item é removido',
          'O map embaralha a ordem dos itens quando há remoção em uma lista renderizada',
          'As keys foram reaproveitadas por posição, e o componente de A passou a representar B com o estado interno de A',
          'Campos de texto não podem ficar dentro de listas renderizadas com map no React'
        ], 'Com índice, a key 0 continua existindo e o React reaproveita o componente (e o estado interno) para outro item. Com id estável, o componente certo é removido.'),
        mcq('q3', 'Qual é a melhor origem para o id usado como key em uma lista de tarefas criadas pela pessoa usuária no navegador?', 'd', [
          'Um número aleatório gerado dentro do JSX a cada renderização',
          'O índice do item no array e o título repetido de outra tarefa',
          'O título da tarefa, mesmo que possa se repetir sem guardá-lo junto com os dados',
          'Um id gerado quando a tarefa é criada, guardado junto com os dados'
        ], 'O id deve ser criado uma vez, junto com o item. Valores aleatórios por renderização e títulos duplicados geram keys instáveis ou repetidas.'),
        fill('q4', 'Complete com a prop que identifica cada item de uma lista renderizada com map.', 'tarefas.map(t => <li ___={t.id}>{t.titulo}</li>)', ['key'], 'key identifica cada elemento entre irmãos para que o React saiba quais mudaram, entraram ou saíram.'),
        mcq('q5', 'Qual padrão é adequado para mostrar um aviso apenas quando existe erro?', 'b', [
          '{if (erro) <Aviso />}',
          '{erro && <Aviso texto={erro} />} quando erro é null ou uma string',
          '<Aviso if={erro} />',
          '{erro ? <Aviso />}'
        ], 'Com && o aviso só aparece quando erro é verdadeiro (string não vazia). if dentro de chaves e ternário sem else não são válidos no JSX.'),
        mcq('q6', 'Por que lista.sort() diretamente no estado pode causar problemas?', 'c', [
          'sort só funciona com números, que só ordena listas de números',
          'sort apaga os ids dos itens, pois a chave precisa ser fixa',
          'sort altera o array original; é preciso copiar antes com [...lista].sort()',
          'O React proíbe ordenar listas ao exibir listas dinâmicas'
        ], 'sort muta o array. Copiar antes mantém a imutabilidade do estado.'),
        mcq('q7', 'Em um map que devolve dois elementos irmãos por item, qual é a forma correta?', 'b', [
          '<> sem key envolvendo os dois elementos e depois o map',
          '<Fragment key={id}> envolvendo os dois elementos',
          'Dois return dentro do map',
          'Um array dentro da key'
        ], 'Para vários elementos por item é preciso um fragmento com key. A forma curta <> não aceita key.'),
        fill('q8', 'Complete com o nome do valor que aparece indevidamente quando o lado esquerdo de && é zero.', '{contagem && <Aviso />} mostra na tela o número ___ quando a contagem é zero', ['0', 'zero'], 'O React desenha o número 0. Use contagem > 0 && para evitar.')
      ]
    },
    {
      id: 'fib-11-react-formularios-controlados',
      title: 'React: formulários controlados',
      goal: 'Construir formulários com inputs controlados, vários campos, submit e validação simples, lembrando que a validação no cliente não é segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Input controlado',
            'Em um input controlado, o React é a fonte da verdade do valor: o campo mostra sempre o que está no estado, e cada digitação atualiza o estado. Receita: const [nome, setNome] = useState(""); <input value={nome} onChange={e => setNome(e.target.value)} />. O fluxo é: a pessoa digita, onChange dispara com event.target.value, o setter atualiza o estado, o React renderiza e o input mostra o novo valor. Erro comum: colocar value sem onChange: o campo fica travado (somente leitura) e o React avisa no console. Também comum: usar valor inicial undefined e depois uma string, trocando o campo entre não controlado e controlado; inicie com "".',
            '// ilustrativo, não executado aqui\nfunction CampoNome() {\n  const [nome, setNome] = useState(\'\');\n  return (\n    <label>\n      Nome\n      <input value={nome} onChange={e => setNome(e.target.value)} />\n    </label>\n  );\n}'
          ),
          sl(
            'Vários campos com um objeto de estado',
            'Em vez de um useState por campo, um formulário maior pode guardar um OBJETO e usar o atributo name do input para saber qual campo mudou. Padrão: setForm({ ...form, [e.target.name]: e.target.value }). Os colchetes [ ] criam uma chave dinâmica ("computed key") a partir do name. Para checkboxes use e.target.checked em vez de value. Lembre da atualização imutável: copiar o objeto com spread antes de trocar um campo.',
            '// ilustrativo, não executado aqui\nconst [form, setForm] = useState({ nome: \'\', email: \'\', aceito: false });\n\nfunction aoMudar(e) {\n  const { name, value, type, checked } = e.target;\n  setForm({ ...form, [name]: type === \'checkbox\' ? checked : value });\n}'
          ),
          sl(
            'Submit',
            'O formulário usa onSubmit no <form> (não onClick no botão): assim Enter também envia e o botão type="submit" funciona por teclado. No manipulador, chame e.preventDefault() para evitar o recarregamento, valide e só então envie. O envio vai para o servidor com fetch, de preferência por POST com corpo JSON ou FormData. Boa prática de privacidade: peça só os dados necessários (minimização, princípio da LGPD) e use atributos autoComplete adequados (email, current-password, new-password) para ajudar gerenciadores de senha. Nunca registre no console ou em logs o conteúdo de senhas ou dados pessoais.',
            '// ilustrativo, não executado aqui\nasync function aoEnviar(e) {\n  e.preventDefault();\n  const erros = validar(form);\n  if (Object.keys(erros).length > 0) { setErros(erros); return; }\n  const resposta = await fetch(\'/api/contato\', {\n    method: \'POST\',\n    headers: { \'Content-Type\': \'application/json\' },\n    body: JSON.stringify({ nome: form.nome, email: form.email })\n  });\n  // trate resposta.ok; não registre dados pessoais no console\n}'
          ),
          sl(
            'Validação simples e exibição de erros',
            'Validar no cliente melhora a experiência: avisa o erro antes de enviar. Uma função pura recebe o formulário e devolve um objeto de erros, fácil de testar. Mostre a mensagem perto do campo, associe-a ao input com aria-describedby (acessibilidade) e use atributos nativos como required, type="email" e minLength, que dão validação básica de graça. Exemplo de função: se nome tem menos de 2 letras devolve { nome: "Informe seu nome" }; se o e-mail não contém @ devolve { email: "E-mail inválido" }. Use apenas e-mails fictícios nos exemplos e testes, como usuario@example.com.',
            '// ilustrativo, não executado aqui\nfunction validar({ nome, email }) {\n  const erros = {};\n  if (nome.trim().length < 2) erros.nome = \'Informe seu nome\';\n  if (!email.includes(\'@\')) erros.email = \'E-mail inválido\';\n  return erros;\n}\n// exemplo de dado de teste: { nome: \'Ana Exemplo\', email: \'usuario@example.com\' }'
          ),
          sl(
            'Não confie só no cliente',
            'Tudo que roda no navegador pode ser contornado: a pessoa pode desativar o JavaScript, editar o HTML ou enviar uma requisição direto ao servidor sem usar seu formulário. Logo, a validação no cliente é UX (experiência), não segurança. O servidor DEVE revalidar tudo (tipos, tamanhos, formatos, permissões) e escapar a saída. Também não confie em campos ocultos nem em valores calculados no cliente (preço, desconto, papel de usuário): o servidor recalcula. Para proteger contra CSRF e tratar autenticação, use cookies HttpOnly e as proteções do back-end; veja os cursos de Segurança Web (OWASP) e Node.js.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um input tem value={nome} mas nenhum onChange. O que acontece?', 'c', [
          'O campo funciona normalmente e o React atualiza o estado sozinho a cada tecla digitada',
          'O React cria automaticamente um onChange padrão que sincroniza campo e estado',
          'O campo fica travado: o valor vem do estado e nada o atualiza',
          'O campo desaparece da página, pois o React exige onChange em todo input'
        ], 'Em input controlado o valor exibido vem do estado; sem onChange o estado nunca muda e a digitação não aparece.'),
        mcq('q2', 'Em setForm({ ...form, [e.target.name]: e.target.value }), para que servem os colchetes?', 'b', [
          'Transformar o objeto em array em um array de pares chave e valor',
          'Criar uma chave dinâmica a partir do atributo name do campo alterado',
          'Impedir a atualização imutável e alterar o estado diretamente',
          'Declarar o tipo do campo para o navegador validar'
        ], 'Os colchetes definem o nome da propriedade em tempo de execução, permitindo um só manipulador para vários campos.'),
        mcq('q3', 'Por que usar onSubmit no <form> em vez de onClick no botão?', 'd', [
          'O evento onClick não existe em botões dentro de formulários no React',
          'O onSubmit dispensa a chamada de preventDefault e evita o recarregamento sozinho',
          'O onSubmit valida os campos automaticamente também no lado do servidor',
          'Enter também envia, e o submit funciona por teclado e leitores de tela'
        ], 'onSubmit cobre todos os caminhos de envio. Ainda é necessário chamar preventDefault e validar.'),
        fill('q4', 'Complete com o método do evento que impede o recarregamento da página no submit.', 'e.___();', ['preventDefault'], 'preventDefault cancela o envio padrão do navegador, permitindo tratar o formulário com JavaScript.'),
        mcq('q5', 'Um formulário de compra calcula o preço total no cliente e envia o valor ao servidor, que o grava sem conferir. Qual é o problema?', 'd', [
          'O React não permite enviar números em requisições feitas pelo fetch',
          'O total precisa ser enviado como texto para ser considerado um valor seguro',
          'Não há problema algum: o cliente é um ambiente confiável para calcular preços',
          'A pessoa pode alterar o valor antes de enviar; o servidor deve recalcular com o que ele conhece'
        ], 'Valores calculados no cliente podem ser adulterados. O servidor é a autoridade e deve recalcular e validar.'),
        mcq('q6', 'Qual afirmação sobre validação está correta?', 'c', [
          'Se o cliente valida, o servidor pode confiar e ignorar a entrada',
          'A validação no servidor é opcional quando se usa type="email"',
          'A validação no cliente melhora a experiência, mas o servidor precisa validar de novo',
          'Validar no cliente impede qualquer requisição inválida de chegar à API'
        ], 'Requisições podem ser feitas sem passar pela sua interface. Por isso a validação do servidor é obrigatória.'),
        mcq('q7', 'Um formulário de newsletter pede nome, e-mail, CPF e data de nascimento, mas só envia e-mails. Qual é a melhor prática de privacidade?', 'a', [
          'Pedir apenas o e-mail, que é o dado necessário para a finalidade',
          'Pedir tudo, pois mais dados ajudam no futuro porque mais dados ajudam em análises futuras',
          'Pedir tudo, mas esconder os campos com CSS com CSS, mantendo-os enviados',
          'Registrar os dados no console para depurar para depurar o envio'
        ], 'Minimização: colete só o necessário para a finalidade. Esconder campos ou registrar dados no console não resolve e ainda cria riscos.'),
        fill('q8', 'Complete com o atributo do input controlado que recebe o texto atual do estado.', '<input ___={nome} onChange={e => setNome(e.target.value)} />', ['value'], 'value liga o campo ao estado; junto com onChange forma o input controlado.')
      ]
    },
    {
      id: 'fib-12-react-compartilhando-estado',
      title: 'React: compartilhando estado',
      goal: 'Levantar o estado, reconhecer props drilling, usar Context em nível básico e saber quando basta composição.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Levantar o estado (lifting state up)',
            'Quando dois componentes irmãos precisam do mesmo dado, o estado deve morar no ANCESTRAL comum mais próximo e descer por props; os filhos avisam as mudanças por funções recebidas também por props. Exemplo: um campo de busca e uma lista filtrada: o estado "termo" fica no pai, o campo recebe termo e aoMudar, a lista recebe termo. Assim existe UMA fonte da verdade. Erro comum: cada filho com sua cópia do estado, que depois divergem.',
            '// ilustrativo, não executado aqui\nfunction Pagina() {\n  const [termo, setTermo] = useState(\'\');\n  return (\n    <>\n      <Busca termo={termo} aoMudar={setTermo} />\n      <Resultados termo={termo} />\n    </>\n  );\n}'
          ),
          sl(
            'Props drilling',
            'Props drilling é passar uma prop por vários níveis de componentes que não a usam, só para chegar ao componente que precisa dela (Pagina -> Layout -> Menu -> Avatar). Para 2 ou 3 níveis é aceitável e até claro (o caminho dos dados é explícito). Quando fica longo e incômodo, existem alternativas: composição (próximo slide) e Context. Evite resolver todo drilling com Context por reflexo: o fluxo explícito de props é mais fácil de rastrear.'
          ),
          sl(
            'Composição como alternativa',
            'Muitas vezes o drilling some quando você passa o componente PRONTO, como children ou como prop, em vez de passar os dados por níveis. Em vez de Layout receber "usuario" só para repassar ao Avatar, a Pagina monta o <Avatar usuario={usuario} /> e o entrega ao Layout como prop (por exemplo, cabecalho={<Avatar ... />}). O Layout apenas posiciona. Assim os intermediários ficam simples e desconhecem os dados. Pergunte-se "posso resolver passando JSX?" antes de usar Context.',
            '// ilustrativo, não executado aqui\nfunction Pagina({ usuario }) {\n  return <Layout cabecalho={<Avatar usuario={usuario} />}>...</Layout>;\n}\nfunction Layout({ cabecalho, children }) {\n  return <div><header>{cabecalho}</header><main>{children}</main></div>;\n}'
          ),
          sl(
            'Context em nível básico',
            'Context é um canal para disponibilizar um valor a toda uma subárvore sem passar por props. Três passos: (1) createContext(valorPadrao) cria o contexto; (2) o Provider envolve a subárvore e fornece o valor: <TemaContext.Provider value={tema}>; (3) qualquer descendente lê com useContext(TemaContext). Quando o valor do Provider muda, os componentes que o leem são renderizados de novo. Bons usos: tema, idioma, usuário logado (dados de exibição). Cuidados: não guarde segredos (tokens de acesso) em Context ou estado da interface; use cookies HttpOnly para sessões. Context não substitui estado: o valor geralmente vem de um useState no Provider.',
            '// ilustrativo, não executado aqui\nimport { createContext, useContext, useState } from \'react\';\n\nconst TemaContext = createContext(\'claro\');\n\nfunction ProvedorTema({ children }) {\n  const [tema, setTema] = useState(\'claro\');\n  return (\n    <TemaContext.Provider value={{ tema, setTema }}>\n      {children}\n    </TemaContext.Provider>\n  );\n}\n\nfunction Botao() {\n  const { tema } = useContext(TemaContext);\n  return <button className={tema}>Ok</button>;\n}'
          ),
          sl(
            'Quando usar o quê',
            'Guia prático: (1) estado usado por UM componente: useState nele. (2) Usado por irmãos: levante ao pai. (3) Passando por poucos níveis: props mesmo. (4) Intermediários só repassam: tente composição. (5) Valor usado em muitos pontos distantes e que muda pouco (tema, idioma, usuário): Context. (6) Estado global grande com muita atualização: bibliotecas como Redux Toolkit ou Zustand, assunto dos próximos níveis. Atenção: Context renderiza de novo todos os consumidores quando o valor muda, então evite colocar nele dados que mudam o tempo todo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Dois componentes irmãos precisam do mesmo texto de busca. Onde deve ficar o estado?', 'c', [
          'Duplicado em cada irmão, com sincronização manual',
          'Em uma variável comum fora do componente, alterada diretamente',
          'No componente pai comum, passado aos dois por props',
          'Dentro do primeiro irmão, e o segundo lê o DOM dele'
        ], 'Levantar o estado ao ancestral comum cria uma única fonte da verdade. Cópias divergem e ler o DOM do irmão quebra o fluxo de dados.'),
        mcq('q2', 'O que é props drilling?', 'b', [
          'Alterar diretamente as props recebidas do componente pai para que a tela seja atualizada',
          'Repassar uma prop por vários componentes intermediários que não a usam, só para chegar a um descendente distante',
          'Criar um estado novo em cada componente da árvore para que nenhum dado precise ser compartilhado',
          'Entregar um valor a todos os descendentes por um provedor, sem passar por props nos níveis do meio'
        ], 'Drilling é o repasse em cadeia de uma prop por componentes que não a usam. Não é erro: com poucos níveis é aceitável, e há alternativas quando incomoda. Alterar props recebidas viola o fluxo unidirecional, criar estado em cada nível duplica dados e o provedor de Context é justamente uma forma de evitar o drilling.'),
        mcq('q3', 'Um Layout recebe usuario só para entregá-lo ao Avatar. Qual alternativa sem Context resolve?', 'd', [
          'Guardar o usuario em localStorage e lê-lo diretamente dentro do Avatar quando precisar',
          'Copiar o usuario para uma variável global no window, acessada por todos os componentes',
          'Duplicar o Avatar dentro do Layout usando os mesmos dados repassados por props',
          'A Pagina cria <Avatar usuario={usuario} /> e o passa ao Layout como prop ou children'
        ], 'Compor passando JSX pronto elimina intermediários que só repassam. Variáveis globais e localStorage escondem o fluxo de dados.'),
        fill('q4', 'Complete com o hook que lê o valor de um Context.', 'const { tema } = ___(TemaContext);', ['useContext'], 'useContext lê o valor fornecido pelo Provider mais próximo acima na árvore.'),
        mcq('q5', 'Qual dado é um bom candidato a Context?', 'a', [
          'Tema visual usado em muitos componentes distantes e que muda pouco',
          'O texto digitado em um único campo de formulário de uma tela isolada',
          'Um contador que muda sessenta vezes por segundo em uma animação',
          'Uma chave secreta de API que normalmente seria usada apenas no servidor'
        ], 'Tema e idioma mudam pouco e são lidos em muitos lugares. Estado local deve ficar local, dados que mudam sempre renderizam muitos consumidores, e segredos não pertencem ao front-end.'),
        mcq('q6', 'Um desenvolvedor guarda o token de acesso da sessão em um Context do React e também em localStorage. Qual é a recomendação?', 'c', [
          'Manter em localStorage, pois esse armazenamento é protegido contra ataques de XSS',
          'Manter em Context e exibir o valor no console para facilitar a depuração do login',
          'Preferir cookie HttpOnly gerenciado pelo servidor, que scripts não conseguem ler',
          'Colocar o token em uma constante exportada de um módulo comum do projeto'
        ], 'Qualquer script injetado (XSS) lê localStorage e variáveis da página; cookies HttpOnly não são acessíveis ao JavaScript. Logar o token ou deixá-lo em constante só amplia a exposição.'),
        mcq('q7', 'Três componentes seguidos repassam uma prop sem usá-la, e o app é pequeno. O que é razoável?', 'a', [
          'Manter as props: o caminho dos dados é explícito e simples de rastrear',
          'Migrar tudo para Context imediatamente e remover os intermediários do app',
          'Eliminar os intermediários e acessar o pai por document.querySelector',
          'Duplicar o estado em cada nível em cada um dos níveis'
        ], 'Para poucos níveis, props explícitas são claras. Context deve resolver um incômodo real, não ser reflexo.'),
        fill('q8', 'Complete com o nome do componente do Context que fornece o valor aos descendentes.', '<TemaContext.___ value={valor}>', ['Provider'], 'O Provider envolve a subárvore e fornece o valor a quem usar useContext.')
      ]
    },
    {
      id: 'fib-42-acessando-o-dom-com-refs',
      title: 'Acessando o DOM com refs',
      goal: 'Saber quando é justificável tocar o DOM diretamente (foco, medidas, bibliotecas externas), usar ref em React, Vue e Angular, distinguir ref de estado e evitar manipular o que o framework controla (inclusive innerHTML, que abre brecha para XSS).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quando você precisa tocar o DOM',
            'Até aqui você descreveu a tela a partir do estado e deixou o framework mexer no DOM. Isso cobre quase tudo, mas algumas ações são IMPERATIVAS por natureza: dar foco a um campo, rolar até um elemento, medir a largura de uma caixa, tocar ou pausar um vídeo, ou entregar um elemento a uma biblioteca externa (um gráfico, um mapa) que desenha dentro dele. Nesses casos você usa uma REF: uma referência ao elemento real do DOM, que o framework preenche depois de criá-lo. Ela é uma saída de emergência (escape hatch): serve para ações pontuais, não para o que a tela exibe. Se o dado muda e a tela precisa mostrar algo novo, isso continua sendo estado. Um erro comum de quem vem do JavaScript puro é pegar o elemento com document.querySelector dentro do componente; a ref é o caminho previsto, pois o framework sabe quando o elemento existe e quando foi removido.'
          ),
          sl(
            'React: useRef e o atributo ref',
            'Em React, useRef(valorInicial) devolve um objeto com uma única propriedade, current. Você passa esse objeto ao atributo ref de um elemento JSX e, depois que o React cria o elemento no DOM, current aponta para ele. Antes disso (na primeira renderização) current vale null, então não leia nem chame métodos de current no corpo do componente: faça isso em um evento (onClick) ou em um efeito (useEffect), que só roda depois de o elemento existir. Mudar current NÃO provoca nova renderização. Erro comum: chamar campo.current.focus() direto no corpo do componente e receber um erro de null.',
            '// ilustrativo, não executado aqui\nimport { useEffect, useRef } from \'react\';\n\nfunction PainelBusca({ aberto }) {\n  const campo = useRef(null);          // { current: null } no começo\n\n  useEffect(() => {\n    if (aberto) campo.current.focus(); // o elemento já existe aqui\n  }, [aberto]);\n\n  return <input ref={campo} placeholder="Buscar" />;\n}'
          ),
          sl(
            'Vue: template refs',
            'Em Vue 3 com <script setup>, você declara uma ref reativa (const campo = ref(null)) com o MESMO nome do atributo ref no template (<input ref="campo">). Quando o componente é montado, o Vue coloca o elemento em campo.value. Antes da montagem o valor é null, então use o elemento dentro de onMounted ou de um evento, e não na linha seguinte à declaração. Em versões recentes do Vue existe também a função useTemplateRef, que deixa a ligação mais explícita; confira a documentação da versão em uso. A ideia é a mesma do React: o framework entrega o elemento só depois de criá-lo.',
            '<!-- ilustrativo, não executado aqui -->\n<script setup>\nimport { ref, onMounted } from \'vue\';\n\nconst campo = ref(null);        // mesmo nome do ref="campo"\n\nonMounted(() => {\n  campo.value.focus();         // só depois de montado\n});\n</script>\n\n<template>\n  <input ref="campo" placeholder="Buscar" />\n</template>'
          ),
          sl(
            'Angular: viewChild e ElementRef',
            'No Angular você marca o elemento no template com uma variável de template (#campo) e a lê no componente com viewChild, que em versões recentes devolve um signal. O valor é um ElementRef, um invólucro cujo elemento real fica em nativeElement. Como o signal pode ainda não ter valor (o elemento pode não existir, por exemplo dentro de um @if), leia com campo()?.nativeElement. Atenção: mexer em nativeElement é acesso direto ao DOM, então use só para o que o template não consegue expressar, e lembre que em renderização no servidor não há navegador; o Angular oferece alternativas (como Renderer2) para casos mais delicados.',
            '// ilustrativo, não executado aqui\nimport { Component, ElementRef, viewChild } from \'@angular/core\';\n\n@Component({\n  selector: \'app-busca\',\n  template: `\n    <input #campo placeholder="Buscar" />\n    <button (click)="focar()">Focar no campo</button>\n  `\n})\nexport class Busca {\n  campo = viewChild<ElementRef<HTMLInputElement>>(\'campo\');\n\n  focar() {\n    this.campo()?.nativeElement.focus();\n  }\n}'
          ),
          sl(
            'Ref x estado: o que muda quando você altera',
            'A diferença que mais confunde é esta: mudar ESTADO avisa o framework, que renderiza de novo; mudar uma REF é só gravar em uma caixa, e a tela não é atualizada. Por isso a ref também serve para guardar valores que precisam sobreviver entre renderizações mas que a tela não exibe: o id de um temporizador, o valor anterior de uma prop, um contador interno. Uma variável comum declarada no corpo do componente não serve, porque é recriada a cada renderização. Regra prática: se a pessoa vê o valor na tela, use estado; se é um detalhe interno e imperativo, use ref. O exemplo abaixo é JavaScript puro e foi executado de verdade: a ref muda duas vezes e nada renderiza; o estado muda uma vez e renderiza.',
            'function criarRef(inicial) {\n  return { current: inicial };\n}\n\nfunction criarEstado(inicial, aoMudar) {\n  let valor = inicial;\n  return {\n    ler: () => valor,\n    definir(novo) {\n      valor = novo;\n      aoMudar(valor);\n    }\n  };\n}\n\nlet renderizacoes = 0;\nconst renderizar = (v) => {\n  renderizacoes++;\n  console.log(\'renderizou com valor\', v);\n};\n\nconst contador = criarEstado(0, renderizar);\nconst cliques = criarRef(0);\n\nrenderizar(contador.ler());\ncliques.current += 1;\ncliques.current += 1;\nconsole.log(\'ref =\', cliques.current, \'| renderizações =\', renderizacoes);\ncontador.definir(1);\nconsole.log(\'ref =\', cliques.current, \'| renderizações =\', renderizacoes);\n\n// Saída real:\n// renderizou com valor 0\n// ref = 2 | renderizações = 1\n// renderizou com valor 1\n// ref = 2 | renderizações = 2'
          ),
          sl(
            'O que NÃO fazer com refs',
            'Primeiro: não use a ref para alterar o que o framework controla (inserir ou remover filhos, trocar o texto de um elemento renderizado pelo template). Na próxima renderização o framework não sabe da sua alteração, e o resultado é tela quebrada ou sobrescrita. Segundo, e mais grave: não atribua texto de terceiros a innerHTML por uma ref. innerHTML interpreta o texto como HTML, então um comentário vindo de outra pessoa pode carregar marcação que executa script (XSS). A versão correta grava como texto puro com textContent ou, melhor ainda, deixa o template renderizar, pois a interpolação de React, Vue e Angular já escapa o conteúdo. Para o XSS em profundidade veja o curso de Segurança Web.',
            '// ilustrativo, não executado aqui\n// ERRADO: texto de usuário vira HTML\nlistaRef.current.innerHTML = comentario;\n\n// CORRETO: grava como texto puro, sem interpretar HTML\nlistaRef.current.textContent = comentario;\n\n// MELHOR: deixe o framework renderizar (ele escapa o conteúdo)\n// React:   <p>{comentario}</p>\n// Vue:     <p>{{ comentario }}</p>\n// Angular: <p>{{ comentario() }}</p>'
          ),
          sl(
            'Cuidado com o foco e a acessibilidade',
            'Mover o foco por código afeta diretamente quem usa teclado ou leitor de tela, então faça com propósito. Boas práticas: ao abrir um modal, leve o foco para dentro dele e, ao fechar, devolva o foco ao elemento que o abriu, para a pessoa não se perder na página. Não roube o foco ao carregar a página nem enquanto a pessoa digita em outro campo. Não remova o contorno de foco (outline) sem oferecer um visual equivalente. E lembre da lição de acessibilidade: antes de focar por código, confira se um elemento HTML correto (button, a, input) já resolve. Teste navegando só com a tecla Tab.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um modal de confirmação abre por clique em um botão. Qual prática de foco, feita com ref, é adequada para quem navega por teclado?', 'b', [
          'Dar foco ao campo do modal e remover o contorno de foco para que o visual fique mais limpo e discreto',
          'Levar o foco para dentro do modal ao abrir e devolvê-lo ao botão que o abriu quando ele fechar',
          'Chamar o foco de cada elemento da página em sequência para que o leitor de tela anuncie tudo',
          'Deixar o foco onde estava no fundo da página, já que o modal só precisa ser visível para quem enxerga'
        ], 'Mover o foco para o modal e devolvê-lo ao fechar mantém a pessoa orientada. Remover o contorno esconde onde o foco está, percorrer elementos por código confunde e deixar o foco atrás do modal faz o teclado interagir com o que está encoberto.'),
        mcq('q2', 'Um componente precisa guardar o id de um temporizador entre renderizações, sem exibi-lo na tela. Qual é a melhor escolha em React?', 'd', [
          'Um estado, pois qualquer valor que precise persistir entre renderizações deve passar por setState',
          'Uma variável comum no corpo da função, que mantém o valor de uma renderização para a seguinte',
          'O próprio elemento do DOM, guardando o id em um atributo e relendo com document.querySelector',
          'Uma ref, porque ela persiste entre renderizações e alterá-la nunca provoca renderização à toa'
        ], 'A ref guarda valores internos sem renderizar de novo. Estado re-renderizaria sem necessidade, uma variável comum é recriada a cada renderização e ir ao DOM por querySelector foge do caminho previsto.'),
        mcq('q3', 'Uma pessoa escreve campo.current.focus() direto no corpo do componente React e recebe um erro de valor null na primeira renderização. Qual é a explicação e a correção?', 'a', [
          'O elemento ainda não existe no DOM nessa fase; chamar o foco dentro de useEffect ou de um evento resolve',
          'O foco só funciona em botões, então o input precisa ser trocado por um button com o mesmo estilo',
          'O useRef exige um valor inicial diferente de null, como uma string vazia, para guardar elementos',
          'O React não permite foco por código, e o jeito de contornar é usar document.getElementById no lugar da ref'
        ], 'Na primeira renderização o JSX ainda não virou elemento, então current é null; efeitos e eventos rodam depois. O foco funciona em campos, a ref não precisa de string inicial e o React permite foco por ref.'),
        fill('q4', 'Complete o atributo JSX que liga o elemento ao objeto criado por useRef.', 'const campo = useRef(null);\n\nreturn <input ___={campo} />;', ['ref'], 'O atributo ref recebe o objeto de useRef e o React preenche current com o elemento depois de criá-lo.'),
        mcq('q5', 'No Vue 3, com const campo = ref(null) e <input ref="campo"> no template, quando campo.value contém o elemento?', 'c', [
          'Já na linha seguinte à declaração, porque o Vue liga a ref ao elemento durante o setup',
          'Só depois que a pessoa digita algo, pois a ref precisa de um evento de entrada para ser preenchida',
          'Depois que o componente foi montado, por exemplo dentro de onMounted ou de um evento',
          'Nunca, pois o Vue não preenche refs e é preciso recorrer ao document.querySelector para achar o elemento'
        ], 'O Vue preenche a ref ao montar o componente; antes disso vale null. Ela não depende de digitação e é, sim, preenchida pelo Vue.'),
        mcq('q6', 'Em Angular, como acessar o elemento de <input #campo> dentro do componente, em versões recentes?', 'a', [
          'Declarar campo = viewChild<ElementRef<HTMLInputElement>>(\'campo\') e usar campo()?.nativeElement quando precisar',
          'Ler uma propriedade do componente com o mesmo nome da variável de template, sem declarar nada na classe',
          'Declarar @Input() campo e esperar que o componente pai envie o elemento pelo template',
          'Usar @if para recriar o elemento e ler sua posição em um signal de estado a cada clique'
        ], 'viewChild consulta o template pela variável (#campo) e devolve um ElementRef, cujo elemento real está em nativeElement. Sem a declaração a propriedade não existe, Input recebe dados do pai e @if controla a existência, não entrega o elemento.'),
        mcq('q7', 'Uma lista de comentários de usuários é preenchida com listaRef.current.innerHTML = comentario. Qual é o problema e a correção?', 'd', [
          'Há uma pequena perda de desempenho, pois innerHTML é mais lento que o JSX, mas o conteúdo continua seguro',
          'O React bloqueia a atribuição e lança um erro, então não existe risco de segurança nesse trecho',
          'O risco existe quando a ref aponta para um campo de formulário, e não para uma lista de itens',
          'O texto de terceiros é interpretado como HTML e pode executar script (XSS); use textContent ou deixe o template renderizar'
        ], 'innerHTML trata texto como marcação, abrindo brecha para XSS. textContent grava texto puro e a interpolação do framework escapa o conteúdo. A atribuição funciona sem erro e o risco independe do tipo de elemento.'),
        fill('q8', 'Complete com a propriedade que grava texto puro no elemento, sem interpretar HTML.', 'listaRef.current.___ = comentario;', ['textContent'], 'textContent grava o valor como texto, então marcação digitada por alguém aparece como caracteres e não é executada.')
      ]
    },
    {
      id: 'fib-13-vue-primeiro-componente',
      title: 'Vue: primeiro componente',
      goal: 'Conhecer o Single File Component, a estrutura template, script setup e style scoped, e criar estado reativo com ref e reactive.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Criando o projeto',
            'Vue é um framework progressivo para interfaces. Esta lição usa Vue 3 com a Composition API e <script setup>, a forma atual e recomendada (a Options API existe como estilo antigo). A forma comum de iniciar é o assistente oficial do Vue, baseado no Vite, que pergunta recursos opcionais (TypeScript, roteador, Pinia, testes). Depois: instalar dependências e rodar o servidor local. O ponto de entrada (main.js) cria a aplicação com createApp(App) e monta no elemento do index.html. Os nomes exatos dos arquivos e opções podem mudar: confira a documentação oficial da versão em uso.',
            'npm create vue@latest\ncd meu-app\nnpm install\nnpm run dev\n# ilustrativo, não executado aqui\n\n// src/main.js (ilustrativo)\nimport { createApp } from \'vue\';\nimport App from \'./App.vue\';\ncreateApp(App).mount(\'#app\');'
          ),
          sl(
            'Single File Component',
            'Um componente Vue vive em um arquivo .vue (SFC, Single File Component) com até três blocos. <template>: o HTML do componente, com recursos extras do Vue. <script setup>: a lógica em JavaScript (ou TypeScript com lang="ts"); tudo que você declara ali (variáveis, funções, componentes importados) fica disponível automaticamente no template. <style scoped>: o CSS, e o atributo scoped faz o estilo valer SÓ para este componente (o Vue adiciona atributos únicos), evitando que um estilo vaze para outros.',
            '<!-- Saudacao.vue (ilustrativo, não executado aqui) -->\n<script setup>\nconst nome = \'Ana Exemplo\';\n</script>\n\n<template>\n  <h1 class="titulo">Olá, {{ nome }}!</h1>\n</template>\n\n<style scoped>\n.titulo { color: #8b5cf6; }\n</style>'
          ),
          sl(
            'Interpolação e ref',
            'No template, {{ expressao }} insere um valor (escapado como texto, protegendo contra XSS). Para um dado que MUDA e deve atualizar a tela, use ref: const contagem = ref(0). ref devolve um objeto com a propriedade .value. No <script> você lê e altera com .value (contagem.value++), mas no TEMPLATE o Vue "desempacota" automaticamente: escreva {{ contagem }}. Quando .value muda, o Vue atualiza só as partes do template que dependem dele: é a reatividade automática, sem funções "setter" como no React. Erro comum: esquecer .value no script (contagem++ não funciona como esperado).',
            '<script setup>\nimport { ref } from \'vue\';\nconst contagem = ref(0);\nfunction somar() { contagem.value++; }   // .value no script\n</script>\n\n<template>\n  <button @click="somar">Cliques: {{ contagem }}</button> <!-- sem .value -->\n</template>\n<!-- ilustrativo, não executado aqui -->'
          ),
          sl(
            'reactive',
            'reactive(objeto) torna um OBJETO reativo e você acessa as propriedades diretamente, sem .value: const usuario = reactive({ nome: "Ana", tema: "claro" }); usuario.tema = "escuro" atualiza a tela. Limitações: só funciona com objetos (não com números ou textos soltos), e se você substituir o objeto inteiro (usuario = {...}) ou desestruturar (const { tema } = usuario) a reatividade se perde, pois o valor deixa de ser rastreado. Por isso muitos times preferem usar ref para tudo (ref também aceita objetos). Diferente do React, no Vue você pode mutar o estado reativo diretamente (usuario.tema = ...): o Vue observa e atualiza.',
            'import { reactive } from \'vue\';\nconst usuario = reactive({ nome: \'Ana Exemplo\', tema: \'claro\' });\nusuario.tema = \'escuro\';        // atualiza a tela\n// const { tema } = usuario;    // CUIDADO: perde a reatividade\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Usando componentes',
            'Para usar um componente dentro de outro, importe-o no <script setup> e use como tag no template; com <script setup> nenhum registro extra é necessário. Convenção: nomes em PascalCase (Cartao.vue). O template precisa de UM elemento raiz? Em Vue 3 não: o template pode ter vários elementos de topo (fragmentos), diferentemente do que o React exige. Cuidado de segurança que veremos adiante: a diretiva v-html interpreta HTML e deve ser evitada com dados externos.',
            '<script setup>\nimport Cartao from \'./Cartao.vue\';\n</script>\n\n<template>\n  <Cartao />\n  <Cartao />\n</template>\n<!-- ilustrativo, não executado aqui -->'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel de <style scoped> em um componente Vue?', 'b', [
          'Aplicar o CSS a todos os componentes da aplicação',
          'Fazer o CSS valer somente para aquele componente',
          'Executar o CSS apenas no servidor',
          'Transformar o CSS em JavaScript executável'
        ], 'scoped isola o estilo ao componente atual. Sem ele o CSS é global.'),
        mcq('q2', 'No script, como incrementar uma contagem criada com const contagem = ref(0)?', 'd', [
          'contagem++',
          'ref(contagem)++',
          'contagem = contagem + 1',
          'contagem.value++'
        ], 'No script o valor de um ref é acessado por .value. No template o Vue desempacota e você escreve só contagem.'),
        mcq('q3', 'No template, como exibir o valor de um ref chamado contagem?', 'a', [
          '{{ contagem }}',
          '{{ contagem.value }}',
          '${contagem}',
          '<contagem />'
        ], 'No template os refs de nível superior são desempacotados automaticamente. ${ } é de template string e <contagem /> seria um componente.'),
        fill('q4', 'Complete com a função que cria um dado reativo acessado por .value.', 'const contagem = ___(0);', ['ref'], 'ref cria um valor reativo e expõe o conteúdo em .value.'),
        mcq('q5', 'Por que const { tema } = reactiveUsuario pode quebrar a reatividade?', 'a', [
          'A desestruturação copia o valor para uma variável comum, que deixa de ser rastreada',
          'O reactive proíbe o uso de const na declaração de qualquer variável do componente',
          'A desestruturação transforma o objeto reativo em um array de propriedades',
          'O Vue só rastreia propriedades cujo nome seja exatamente tema, por convenção'
        ], 'Ao extrair o valor primitivo, você obtém uma cópia sem ligação com o objeto reativo. Use o objeto diretamente ou a função toRefs, que mantém a ligação.'),
        mcq('q6', 'Qual característica distingue o Vue do React na atualização de estado?', 'd', [
          'No Vue é obrigatório criar cópias imutáveis a cada alteração, como no React',
          'No Vue não existe o conceito de estado, apenas funções puras de renderização',
          'No Vue o estado só muda depois de uma chamada ao servidor responder',
          'No Vue o estado reativo pode ser mutado diretamente e o framework detecta a mudança'
        ], 'O sistema de reatividade do Vue rastreia leituras e escritas, permitindo mutação direta. No React o estado é imutável por convenção e pelo funcionamento da comparação.'),
        mcq('q7', 'Em um componente com <script setup>, como usar outro componente Cartao.vue?', 'c', [
          'Registrar manualmente em uma lista components obrigatória em toda página em uma lista components',
          'Copiar o HTML do Cartao para dentro do template',
          'Importar com import Cartao from \'./Cartao.vue\' e usar <Cartao /> no template',
          'Chamar Cartao() como função no template'
        ], 'Em <script setup>, o que é importado fica disponível ao template automaticamente.'),
        fill('q8', 'Complete com o bloco do arquivo .vue que contém o HTML do componente.', '<___>\n  <h1>Olá</h1>\n</template>', ['template'], 'O bloco <template> contém o HTML do componente, com sintaxe própria do Vue.')
      ]
    },
    {
      id: 'fib-14-vue-diretivas-e-reatividade',
      title: 'Vue: diretivas e reatividade',
      goal: 'Usar v-if, v-for com key, v-bind, v-on e v-model, diferenciar computed de watch e lidar com .value e desempacotamento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Diretivas',
            'Diretivas são atributos especiais do template que começam com v- e dão comportamento ao HTML. As principais: v-if / v-else-if / v-else (renderização condicional), v-for (listas), v-bind (ligar atributo a uma expressão, forma curta :), v-on (ouvir evento, forma curta @) e v-model (ligação de mão dupla em campos). O valor entre aspas de uma diretiva é uma EXPRESSÃO JavaScript avaliada com o estado do componente. Com <script setup>, tudo que você declarou está disponível ali.'
          ),
          sl(
            'v-if e v-for',
            'v-if="condicao" cria o elemento só se a condição for verdadeira (o elemento é adicionado e removido do DOM); v-else vem logo depois. v-show apenas alterna o CSS display (mais barato para alternar muito, mas o elemento continua no DOM). v-for="item in lista" repete o elemento para cada item e DEVE ter :key com um valor único e estável (como o id), pelo mesmo motivo do React: identificar cada item quando a lista muda. Evite índice como key em listas que mudam. Evite v-if e v-for no MESMO elemento: filtre antes com uma propriedade computada.',
            '<!-- ilustrativo, não executado aqui -->\n<ul v-if="tarefas.length > 0">\n  <li v-for="t in tarefas" :key="t.id">{{ t.titulo }}</li>\n</ul>\n<p v-else>Nenhuma tarefa</p>'
          ),
          sl(
            'v-bind e v-on',
            'v-bind (ou só :) liga um atributo a uma expressão: <img :src="foto" :alt="descricao"> e :class="{ ativo: selecionado }". v-on (ou @) liga um evento a uma função ou expressão: <button @click="somar">, <form @submit.prevent="enviar">. O sufixo .prevent chama preventDefault, e .stop chama stopPropagation: são modificadores. Segurança: dados externos ligados a atributos de URL (:href) devem ter o protocolo validado (aceite http, https, mailto), pois um valor como javascript: é perigoso. O conteúdo de {{ }} e dos atributos ligados é escapado pelo Vue.',
            '<!-- ilustrativo, não executado aqui -->\n<a :href="linkSeguro" :class="{ ativo: selecionado }">Abrir</a>\n<form @submit.prevent="enviar">\n  <button type="submit">Salvar</button>\n</form>'
          ),
          sl(
            'v-model e v-html',
            'v-model liga um campo a um estado nos dois sentidos: o campo mostra o valor e, ao digitar, atualiza o estado, sem escrever onChange à mão como no React. <input v-model="nome"> equivale a ligar :value e ouvir o evento de entrada. Modificadores úteis: .trim (remove espaços das pontas), .number (converte para número) e .lazy (atualiza só ao sair do campo). ATENÇÃO com v-html: ele insere o valor como HTML bruto, desligando a proteção de escape, e abre espaço para XSS com dados externos. Prefira {{ }}; se for inevitável usar v-html, sanitize antes com biblioteca própria e só com HTML de origem confiável.',
            '<!-- ilustrativo, não executado aqui -->\n<input v-model.trim="nome" />\n\n<!-- VULNERÁVEL: HTML de fonte externa -->\n<div v-html="comentarioDoUsuario"></div>\n\n<!-- CORRETO: texto escapado -->\n<div>{{ comentarioDoUsuario }}</div>'
          ),
          sl(
            'computed x watch',
            'computed cria um valor DERIVADO de outros: const total = computed(() => itens.value.length). O Vue guarda o resultado em cache e só recalcula quando algo que ele leu muda; é puro e devolve valor. Use computed para qualquer coisa que se calcula a partir do estado (contadores, listas filtradas). watch executa um EFEITO quando um valor muda (salvar em armazenamento, chamar uma API, registrar algo): watch(termo, (novo) => buscar(novo)). Regra: se você quer um valor derivado, use computed; se quer FAZER algo quando um valor muda, use watch. Erro comum: usar watch para copiar um valor em outro estado.',
            'import { ref, computed, watch } from \'vue\';\nconst itens = ref([]);\nconst termo = ref(\'\');\nconst total = computed(() => itens.value.length);   // derivado\nwatch(termo, (novo) => { buscar(novo); });          // efeito colateral\n// ilustrativo, não executado aqui'
          ),
          sl(
            '.value e desempacotamento',
            'Resumo das regras: no <script>, ref sempre exige .value para ler e escrever (contagem.value). No <template>, refs de nível superior são desempacotados e você não escreve .value. Dentro de um reactive, refs também são desempacotados. computed também devolve um ref somente leitura, então no script use total.value. Atenção a um caso: se o ref estiver DENTRO de um objeto comum (const estado = { n: ref(0) }), no template é preciso escrever estado.n.value. Arrays e objetos dentro de ref são tornados reativos em profundidade: itens.value.push(novo) atualiza a tela.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a função do :key em v-for="t in tarefas" :key="t.id"?', 'b', [
          'Definir a cor de cada item da lista, conforme o valor do id',
          'Identificar cada item de forma única e estável, para o Vue atualizar a lista corretamente',
          'Impedir que a lista seja alterada depois de renderizada',
          'Ordenar as tarefas por id automaticamente a cada nova renderização'
        ], 'A key permite ao Vue saber quais itens entraram, saíram ou mudaram de lugar. Não ordena nem bloqueia a lista.'),
        mcq('q2', 'Qual diretiva você usa para ligar um campo de texto a uma variável nos dois sentidos?', 'c', [
          'v-bind sozinho',
          'v-for',
          'v-model',
          'v-html'
        ], 'v-model sincroniza campo e estado nos dois sentidos. v-bind liga em um sentido só; v-for repete elementos; v-html insere HTML bruto.'),
        mcq('q3', 'Um desenvolvedor usa <div v-html="comentario"></div> com o texto de um usuário. Qual é o risco e a correção?', 'd', [
          'Nenhum risco, pois o Vue sempre escapa o conteúdo, e a solução seria trocar por v-show',
          'Lentidão, corrigida com v-show e ajustar o tamanho do cache',
          'Erro de sintaxe, corrigido com :html e a correção seria o uso de :html',
          'XSS, pois o valor é interpretado como HTML; trocar por {{ comentario }}'
        ], 'v-html desliga o escape. Interpolação {{ }} trata o valor como texto.'),
        fill('q4', 'Complete com a função usada para criar um valor derivado, com cache, a partir de outros.', 'const total = ___(() => itens.value.length);', ['computed'], 'computed cria um valor derivado, recalculado só quando suas dependências mudam.'),
        mcq('q5', 'Quando é mais adequado usar watch em vez de computed?', 'd', [
          'Quando se quer apenas calcular o total de itens para exibir na tela',
          'Quando se quer filtrar uma lista para uso direto no template',
          'Quando se quer formatar um texto para ser mostrado em um parágrafo',
          'Quando é preciso executar uma ação ao mudar um valor, como chamar uma API'
        ], 'watch serve para efeitos colaterais; os cálculos para exibição pertencem a computed.'),
        mcq('q6', 'Em <script setup>, um ref contagem precisa de .value em qual situação?', 'a', [
          'Ao ler ou alterar no script',
          'Ao exibir dentro do {{ }} no template',
          'Nunca, o Vue remove o .value em qualquer lugar',
          'Somente dentro de v-for'
        ], 'No script, refs exigem .value; no template de nível superior são desempacotados automaticamente.'),
        mcq('q7', 'Qual é a forma correta de ligar um evento de clique a uma função somar?', 'd', [
          '<button onclick="somar">',
          '<button v-on:click:somar>',
          '<button :click="somar()">',
          '<button @click="somar">'
        ], '@click é a forma curta de v-on:click. onclick em atributo HTML não vê o estado do componente, e :click liga um atributo, não um evento.'),
        fill('q8', 'Complete com o modificador de @submit que chama preventDefault.', '<form @submit.___="enviar">', ['prevent'], '.prevent chama event.preventDefault() antes de executar o manipulador.')
      ]
    },
    {
      id: 'fib-15-vue-props-eventos-e-slots',
      title: 'Vue: props, eventos e slots',
      goal: 'Passar dados com defineProps, emitir eventos com defineEmits, usar slots, v-model em componentes e validar props.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'defineProps',
            'O pai passa dados ao filho por atributos; o filho os declara com defineProps (disponível em <script setup> sem import). Forma simples: const props = defineProps({ titulo: String }). No template você usa titulo direto; no script, props.titulo. Props são SOMENTE LEITURA: o Vue avisa se você tentar alterá-las, pois o fluxo é unidirecional (dados descem). Para passar valores que não são texto, use : (v-bind): <Cartao :preco="10" :ativo="true" /> (sem os dois pontos, 10 seria o texto "10").',
            '<!-- Cartao.vue (ilustrativo, não executado aqui) -->\n<script setup>\nconst props = defineProps({ titulo: String, preco: Number });\n</script>\n<template>\n  <section><h2>{{ titulo }}</h2><p>{{ preco }}</p></section>\n</template>\n\n<!-- uso -->\n<Cartao titulo="Camiseta" :preco="10" />'
          ),
          sl(
            'Validação de props',
            'No formato de objeto, cada prop pode declarar tipo, se é obrigatória, valor padrão e até uma função validadora: defineProps({ preco: { type: Number, required: true, validator: v => v >= 0 }, tamanho: { type: String, default: "M" } }). Em desenvolvimento, o Vue emite avisos no console se uma prop não cumprir a declaração. Essa validação ajuda a achar erros cedo, mas NÃO é segurança: ela não existe em produção do mesmo modo e não valida dados vindos do servidor ou de usuários. Com TypeScript, as props podem ser tipadas direto na declaração. Valores padrão de objetos e arrays devem ser criados por função.',
            '// ilustrativo, não executado aqui\nconst props = defineProps({\n  preco: { type: Number, required: true, validator: (v) => v >= 0 },\n  tamanho: { type: String, default: \'M\' }\n});'
          ),
          sl(
            'defineEmits: eventos para cima',
            'O filho avisa o pai com eventos: const emit = defineEmits(["comprar"]) e emit("comprar", idDoProduto). O pai escuta com @comprar="tratar". É o equivalente de passar uma função por prop no React. Convenção: nomes de eventos descrevem o que ACONTECEU (comprar, fechar, mudou), não o que o pai deve fazer. O fluxo completo: dados descem por props, eventos sobem por emit, e quem é dono do estado o altera.',
            '<!-- Cartao.vue (ilustrativo, não executado aqui) -->\n<script setup>\nconst props = defineProps({ id: Number });\nconst emit = defineEmits([\'comprar\']);\n</script>\n<template>\n  <button @click="emit(\'comprar\', id)">Comprar</button>\n</template>\n\n<!-- pai -->\n<Cartao :id="7" @comprar="aoComprar" />'
          ),
          sl(
            'Slots',
            'Slots são o equivalente Vue de children no React: espaços onde o PAI insere conteúdo dentro do filho. No filho, <slot /> marca o lugar; <slot>Texto padrão</slot> define um conteúdo reserva. Slots nomeados permitem vários espaços: <slot name="cabecalho" />, e o pai usa <template #cabecalho>...</template>. É a base da composição no Vue: um componente Cartao define a moldura e quem usa decide o conteúdo.',
            '<!-- Cartao.vue (ilustrativo, não executado aqui) -->\n<template>\n  <section>\n    <header><slot name="cabecalho" /></header>\n    <slot>Sem conteúdo</slot>\n  </section>\n</template>\n\n<!-- uso -->\n<Cartao>\n  <template #cabecalho>Aviso</template>\n  <p>Conteúdo principal</p>\n</Cartao>'
          ),
          sl(
            'v-model em componentes',
            'v-model também funciona em componentes próprios, para criar campos reutilizáveis. Em versões recentes do Vue, a macro defineModel simplifica: const texto = defineModel(); o filho usa v-model="texto" no seu input e o pai usa <CampoTexto v-model="nome" />. Por trás, o pai passa uma prop (modelValue) e escuta o evento update:modelValue; em versões mais antigas escreve-se essa dupla à mão com defineProps e defineEmits. Confira a documentação da versão em uso. A regra de ouro permanece: não altere props diretamente; use defineModel ou emita o evento.',
            '<!-- CampoTexto.vue (ilustrativo, não executado aqui) -->\n<script setup>\nconst texto = defineModel();\n</script>\n<template>\n  <input v-model="texto" />\n</template>\n\n<!-- uso -->\n<CampoTexto v-model="nome" />'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um filho tenta fazer props.titulo = "Outro". O que está errado conceitualmente?', 'b', [
          'Props aceitam só números, e por isso a atribuição de um texto gera erro',
          'Props são somente leitura; o pai deve alterar o dado, e o filho pede por evento',
          'O Vue permite alterar props normalmente, mas o resultado só aparece no console',
          'Props devem ser alteradas por meio da diretiva v-html, que atualiza o valor'
        ], 'No fluxo unidirecional o dado pertence ao pai. O filho emite um evento e o pai atualiza o estado.'),
        mcq('q2', 'Para passar o número 10 como prop preco ao componente, qual sintaxe usar?', 'a', [
          '<Cartao :preco="10" />',
          '<Cartao preco="10" />',
          '<Cartao preco={10} />',
          '<Cartao v-for preco="10" />'
        ], 'Sem os dois pontos, 10 seria o texto "10". A chave {10} é sintaxe do JSX do React.'),
        mcq('q3', 'Como o componente filho avisa o pai que o botão Comprar foi clicado?', 'd', [
          'Alterando diretamente a variável do pai e escuta o valor no outro componente',
          'Chamando document.querySelector no pai direto no DOM de outro componente',
          'Reescrevendo a prop recebida para o pai ver o valor novo',
          'Com emit("comprar") declarado em defineEmits e @comprar no pai'
        ], 'Eventos sobem por emit. Os outros caminhos violam o fluxo de dados ou acoplam o filho ao DOM do pai.'),
        fill('q4', 'Complete com a macro que declara os eventos que um componente filho pode emitir.', 'const emit = ___([\'comprar\']);', ['defineEmits'], 'defineEmits declara os eventos que o componente pode emitir; emit dispara um deles.'),
        mcq('q5', 'O que é um slot?', 'd', [
          'Um tipo de estado reativo global compartilhado entre todos os componentes',
          'Um modificador de evento que cancela o comportamento padrão do navegador',
          'Uma forma de validar o tipo e o formato das props recebidas pelo componente',
          'Um espaço no filho onde o pai insere conteúdo, como children no React'
        ], 'Slots permitem composição: o filho define o lugar e o pai decide o conteúdo.'),
        mcq('q6', 'Qual é a utilidade da validação de props e o seu limite?', 'b', [
          'Garante que nenhum dado inválido chegue ao banco de dados da aplicação',
          'Avisa erros de uso em desenvolvimento, mas não substitui a validação no servidor',
          'Criptografa os valores recebidos pelo componente antes de exibi-los na tela',
          'Substitui a necessidade de validar formulários no cliente e no servidor'
        ], 'Os avisos ajudam o desenvolvimento, mas não são um mecanismo de segurança: dados de usuários precisam ser validados no servidor.'),
        mcq('q7', 'Em versões recentes do Vue, qual é a forma de simplificar v-model em um componente próprio?', 'a', [
          'A macro defineModel, que cria uma ref ligada ao v-model do pai',
          'Alterar a prop modelValue diretamente, como ocorre desde as primeiras versões',
          'Usar v-html no input no input do componente filho',
          'Chamar emit sem declarar o evento e esperar que o pai perceba'
        ], 'defineModel encapsula a prop modelValue e o evento update:modelValue. Alterar a prop diretamente viola a regra de somente leitura.'),
        fill('q8', 'Complete com a macro que declara as props de um componente em script setup.', 'const props = ___({ titulo: String });', ['defineProps'], 'defineProps declara as props que o componente aceita do pai.')
      ]
    },
    {
      id: 'fib-16-vue-ciclo-de-vida-e-composables-basico',
      title: 'Vue: ciclo de vida e composables (básico)',
      goal: 'Usar onMounted e onUnmounted com limpeza, criar composables simples e organizar o código de componentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ciclo de vida do componente',
            'Um componente Vue passa por fases: é criado, montado na tela (inserido no DOM), atualizado quando o estado muda e desmontado (removido). Você se conecta a essas fases com funções: onMounted(() => ...) roda depois de o componente aparecer no DOM; onUnmounted(() => ...) roda quando ele é removido; onUpdated roda após atualizações. Elas são importadas de vue e chamadas dentro de <script setup>. onMounted é o lugar típico para buscar dados iniciais e iniciar assinaturas; onUnmounted para desfazer tudo.',
            '<script setup>\nimport { onMounted, onUnmounted } from \'vue\';\nonMounted(() => { console.log(\'montado\'); });\nonUnmounted(() => { console.log(\'removido\'); });\n</script>\n<!-- ilustrativo, não executado aqui -->'
          ),
          sl(
            'Limpeza de efeitos',
            'Tudo que você inicia em onMounted e que continua vivo (temporizador, listener global, assinatura de socket) deve ser desfeito em onUnmounted; senão, ao trocar de tela, o código continua rodando em componentes que já não existem (vazamento e comportamento estranho). Padrão: guardar a referência e limpar. É o mesmo princípio do cleanup do useEffect no React. Exemplo: ouvir o redimensionamento da janela.',
            '<script setup>\nimport { ref, onMounted, onUnmounted } from \'vue\';\nconst largura = ref(window.innerWidth);\nconst atualizar = () => { largura.value = window.innerWidth; };\nonMounted(() => window.addEventListener(\'resize\', atualizar));\nonUnmounted(() => window.removeEventListener(\'resize\', atualizar));\n</script>\n<!-- ilustrativo, não executado aqui -->'
          ),
          sl(
            'Composables',
            'Um composable é uma função que usa as APIs de reatividade do Vue (ref, computed, onMounted...) para encapsular e reutilizar lógica COM ESTADO. Convenção: nome começa com use (useContador, useLarguraJanela) e fica em src/composables/. Cada chamada cria seu PRÓPRIO estado, e a função devolve o que o componente precisa (valores e funções). É o equivalente aos hooks personalizados do React. Diferente de uma função utilitária comum, que só calcula e não guarda estado.',
            '// src/composables/useContador.js (ilustrativo, não executado aqui)\nimport { ref, computed } from \'vue\';\n\nexport function useContador(inicial = 0) {\n  const contagem = ref(inicial);\n  const dobro = computed(() => contagem.value * 2);\n  function somar() { contagem.value++; }\n  return { contagem, dobro, somar };\n}\n\n// no componente\n// const { contagem, somar } = useContador(5);'
          ),
          sl(
            'Composable com ciclo de vida',
            'O poder dos composables é juntar estado e ciclo de vida em uma peça reutilizável. O exemplo da largura da janela vira useLarguraJanela: qualquer componente que o use ganha o listener e a limpeza sem repetir código. Chame composables no topo do <script setup> (não dentro de if ou depois de await), porque eles se ligam ao componente atual. Mantenha cada composable com uma responsabilidade e devolva refs (não valores soltos) para a reatividade não se perder.',
            '// src/composables/useLarguraJanela.js (ilustrativo, não executado aqui)\nimport { ref, onMounted, onUnmounted } from \'vue\';\n\nexport function useLarguraJanela() {\n  const largura = ref(0);\n  const atualizar = () => { largura.value = window.innerWidth; };\n  onMounted(() => { atualizar(); window.addEventListener(\'resize\', atualizar); });\n  onUnmounted(() => window.removeEventListener(\'resize\', atualizar));\n  return { largura };\n}'
          ),
          sl(
            'Organização',
            'Dicas simples para manter componentes legíveis: um componente por arquivo, com nome em PascalCase; declarações em ordem previsível dentro do <script setup> (imports, props e emits, estado, computeds, funções, ciclo de vida); componentes pequenos, com uma responsabilidade; extraia para composable quando a mesma lógica com estado aparecer em dois lugares; e pastas por funcionalidade quando o projeto crescer. Dados pessoais: não registre no console nem em logs o conteúdo de campos sensíveis. Roteador (Vue Router) e Pinia para estado global ficam para os próximos níveis.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Onde é mais adequado buscar os dados iniciais de um componente em Vue?', 'c', [
          'Dentro do template, em uma expressão {{ }}, criando o estado com o resultado',
          'Em onUnmounted do arquivo de estilos',
          'Em onMounted, depois de o componente aparecer no DOM',
          'No arquivo de estilo ao fim do ciclo de vida'
        ], 'onMounted roda quando o componente já está na tela e é o ponto usual para dados iniciais. Template deve ser puro, e onUnmounted é para limpeza.'),
        mcq('q2', 'Um componente adiciona um listener de resize em onMounted e não remove. O que acontece ao trocar de tela?', 'd', [
          'O Vue remove o listener automaticamente em qualquer caso e o listener é cancelado quando o JavaScript do Vue termina',
          'O navegador exibe erro e fecha a aba sem avisar',
          'O listener passa a rodar uma única vez quando a página é recarregada',
          'O listener continua ativo e rodando em um componente que não existe mais'
        ], 'Listeners globais não são limpos pelo Vue; é preciso remover em onUnmounted.'),
        mcq('q3', 'O que diferencia um composable de uma função utilitária comum?', 'c', [
          'O composable só pode ser chamado fora de componentes, sem acesso a nenhuma reatividade',
          'O composable não pode devolver valores e sem retorno de funções',
          'O composable usa a reatividade e o ciclo de vida do Vue e guarda estado',
          'Não há diferença: ambos nunca guardam estado e funções apenas recebem dados'
        ], 'Composables encapsulam lógica com estado reativo e efeitos; utilitários apenas calculam.'),
        fill('q4', 'Complete com o prefixo convencional dos nomes de composables.', 'export function ___Contador() { }', ['use'], 'A convenção é começar com use, como em useContador.'),
        mcq('q5', 'Dois componentes chamam useContador(). O que acontece com o estado?', 'a', [
          'Cada chamada cria seu próprio estado independente',
          'Os dois compartilham automaticamente o mesmo estado global',
          'Só o primeiro componente consegue usar',
          'O estado é salvo no servidor'
        ], 'Estado criado dentro da função é local a cada chamada. Para compartilhar, o estado precisaria viver fora da função ou em uma store.'),
        mcq('q6', 'Qual é o equivalente conceitual de onUnmounted com limpeza no React?', 'b', [
          'O array de dependências',
          'A função de cleanup devolvida pelo useEffect',
          'O hook useState',
          'A prop children'
        ], 'Ambos desfazem o que o efeito iniciou quando o componente sai ou o efeito é refeito.'),
        mcq('q7', 'Por que devolver refs de um composable, em vez de valores soltos?', 'a', [
          'Valores soltos são cópias e perdem a reatividade; refs mantêm a tela atualizada',
          'Refs são mais rápidos por usarem menos memória do que valores comuns',
          'Valores soltos não podem ser exportados por funções em JavaScript puro',
          'O Vue proíbe que uma função devolva números, strings ou booleanos'
        ], 'Um número copiado deixa de ser rastreado; o ref carrega a reatividade para quem o usa.'),
        fill('q8', 'Complete com a função de ciclo de vida que roda quando o componente é removido da tela.', 'import { onMounted, ___ } from \'vue\';', ['onUnmounted'], 'onUnmounted roda quando o componente é removido e é o lugar de desfazer o que foi iniciado.')
      ]
    },
    {
      id: 'fib-17-angular-primeiro-componente',
      title: 'Angular: primeiro componente',
      goal: 'Conhecer a CLI do Angular, escrever componentes standalone com decorator e template, entender por que TypeScript é obrigatório e a estrutura do projeto.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Angular em uma frase',
            'Angular é um framework completo, mantido pelo Google, para construir aplicações front-end. Diferente de React e Vue, ele já inclui roteamento, formulários, cliente HTTP, injeção de dependência e ferramentas de teste e build, tudo seguindo uma estrutura única. O preço é uma curva de aprendizado maior e mais conceitos desde o início; o ganho é consistência em equipes grandes e projetos longos. Esta lição usa a forma atual: componentes STANDALONE (autossuficientes). NgModules, a forma antiga de organizar, aparecem só em código legado. Confira sempre a documentação oficial da versão que você usa.'
          ),
          sl(
            'Angular CLI',
            'A CLI (Command Line Interface) é a ferramenta oficial: cria projetos, gera código e roda o servidor. Ela é instalada com npm e usa o comando ng. ng new meu-app cria o projeto (faz perguntas sobre estilos e opções); ng serve inicia o servidor de desenvolvimento com recarregamento automático; ng generate component tarefa (ou ng g c tarefa) cria um componente com seus arquivos; ng build gera a versão de produção; ng test roda testes. Ao contrário do React e do Vue, você normalmente não escolhe o Vite à mão: a CLI cuida do build.',
            'npm install -g @angular/cli\nng new meu-app\ncd meu-app\nng serve\nng generate component tarefa\n# ilustrativo, não executado aqui'
          ),
          sl(
            'Componente standalone',
            'Um componente Angular é uma CLASSE TypeScript marcada com o decorator @Component. Decorator é uma anotação (começa com @) que adiciona metadados à classe. No objeto passado ao decorator: selector é o nome da tag HTML personalizada que usa o componente (por convenção, com prefixo app-); template é o HTML (ou templateUrl aponta para um arquivo); styles ou styleUrl define o CSS do componente; imports lista outros componentes, diretivas e pipes que o template usa (é o que torna o componente standalone). Dentro da classe ficam os dados e métodos que o template pode usar. Em versões recentes standalone é o padrão. Os nomes dos arquivos gerados (por exemplo app.ts ou app.component.ts) variam entre versões.',
            '// ilustrativo, não executado aqui\nimport { Component } from \'@angular/core\';\n\n@Component({\n  selector: \'app-saudacao\',\n  imports: [],\n  template: `\n    <h1>Olá, {{ nome }}!</h1>\n  `,\n  styles: `h1 { color: #8b5cf6; }`\n})\nexport class SaudacaoComponent {\n  nome = \'Ana Exemplo\';\n}'
          ),
          sl(
            'TypeScript é obrigatório',
            'Todo código de aplicação Angular é escrito em TypeScript, que é JavaScript com TIPOS verificados antes de rodar. Você declara o tipo das variáveis e parâmetros (nome: string, idade: number, tarefas: Tarefa[]) e interfaces para descrever o formato de objetos: interface Tarefa { id: number; titulo: string; feita: boolean }. O compilador avisa erros como passar texto onde se espera número. Os navegadores não executam TypeScript: o build converte em JavaScript. Para quem sabe JavaScript, o salto é pequeno: a sintaxe é a mesma com anotações de tipo.',
            '// ilustrativo, não executado aqui\ninterface Tarefa {\n  id: number;\n  titulo: string;\n  feita: boolean;\n}\n\nconst tarefas: Tarefa[] = [{ id: 1, titulo: \'Estudar Angular\', feita: false }];'
          ),
          sl(
            'Estrutura do projeto e boas práticas',
            'Um projeto gerado pela CLI traz: src/main.ts (ponto de entrada, que inicia a aplicação com o componente raiz), src/index.html (página única, com a tag do componente raiz), src/app/ (seus componentes, serviços e configuração), angular.json (configuração do projeto e do build), package.json e tsconfig.json. Em src/app fica o componente raiz e é lá que você cria os demais. Boas práticas iniciais: um componente por arquivo, nomes descritivos, e segurança padrão do Angular: ele trata os valores de {{ }} como texto e sanitiza HTML inserido, protegendo contra XSS; desabilitar isso (bypassSecurityTrust...) só em casos muito controlados, veremos na próxima lição.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando cria um novo componente em um projeto Angular com a CLI?', 'a', [
          'ng generate component tarefa',
          'npm create angular-component tarefa',
          'ng serve tarefa',
          'ng build tarefa --component'
        ], 'ng generate component (ou ng g c) gera o componente. ng serve inicia o servidor e ng build gera produção.'),
        mcq('q2', 'No decorator @Component, o que o selector define?', 'c', [
          'O endereço do servidor da aplicação da aplicação',
          'A cor principal do estilo do projeto inteiro',
          'O nome da tag HTML usada para inserir o componente',
          'O tipo TypeScript da classe que define as variáveis'
        ], 'selector é a tag personalizada que representa o componente, como <app-saudacao />.'),
        mcq('q3', 'Por que o Angular exige TypeScript?', 'b', [
          'Os navegadores só conseguem executar código escrito em TypeScript',
          'Os tipos ajudam a achar erros antes de rodar e fazem parte do design do framework',
          'JavaScript puro não possui classes nem funções, então o framework precisa de tipos',
          'O TypeScript dispensa qualquer etapa de build ou de compilação do projeto'
        ], 'Angular é construído em torno de TypeScript. O navegador executa JavaScript e o build converte o TypeScript.'),
        fill('q4', 'Complete com o nome do decorator que transforma uma classe em componente Angular.', '@___({ selector: \'app-saudacao\', template: \'<h1>Olá</h1>\' })', ['Component'], '@Component marca a classe como componente e recebe seus metadados (selector, template, estilos, imports).'),
        mcq('q5', 'O que a lista imports de um componente standalone contém?', 'a', [
          'Os componentes, diretivas e pipes que o template usa',
          'Os pacotes instalados pelo npm no projeto inteiro, como o tamanho da pasta',
          'As variáveis de ambiente da aplicação do arquivo angular.json',
          'Os arquivos CSS globais e as cores do tema'
        ], 'Em um componente standalone, imports declara de quais outras peças o template depende.'),
        mcq('q6', 'Qual é a diferença de filosofia entre Angular e React?', 'c', [
          'Angular serve apenas para sites estáticos, enquanto o React serve só para aplicativos',
          'O Angular não usa o conceito de componentes, apenas páginas inteiras e rotas',
          'Angular traz roteamento, formulários e HTTP integrados; React deixa essas escolhas ao ecossistema',
          'React exige decorators nas classes e Angular exige hooks nas funções'
        ], 'Angular é um framework completo e opinativo. Os dois usam componentes; decorators e hooks são específicos de cada um, como visto.'),
        mcq('q7', 'Qual arquivo é, em geral, o ponto de entrada que inicia a aplicação em um projeto gerado pela CLI?', 'b', [
          'angular.json',
          'src/main.ts',
          'package-lock.json',
          'tsconfig.json'
        ], 'main.ts inicia a aplicação com o componente raiz. Os demais são configuração ou lockfile.'),
        fill('q8', 'Complete com a palavra do TypeScript usada para descrever o formato de um objeto.', '___ Tarefa { id: number; titulo: string; }', ['interface'], 'interface descreve a forma de um objeto, e o compilador confere se os dados respeitam esse formato.')
      ]
    },
    {
      id: 'fib-18-angular-templates-e-controle-de-fluxo',
      title: 'Angular: templates e controle de fluxo',
      goal: 'Usar interpolação, property e event binding, two-way binding, @if/@for/@switch com track e pipes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Interpolação e property binding',
            'Templates Angular são HTML com recursos extras. Interpolação: {{ expressao }} mostra um valor da classe do componente como texto (escapado, protegendo contra XSS). Property binding: [propriedade]="expressao" liga uma propriedade do elemento a uma expressão da classe: <img [src]="foto" [alt]="descricao">, <button [disabled]="enviando">. Os colchetes significam "avalie como expressão TypeScript". Sem eles, o valor entre aspas é um texto literal. Segurança: se uma URL vem de usuário, valide o protocolo (http, https, mailto) antes de ligar a [href]; o Angular já bloqueia protocolos perigosos por padrão.',
            '// ilustrativo, não executado aqui\n@Component({\n  selector: \'app-perfil\',\n  template: `\n    <h1>{{ nome }}</h1>\n    <img [src]="foto" [alt]="\'Foto de \' + nome" />\n    <button [disabled]="enviando">Salvar</button>\n  `\n})\nexport class PerfilComponent {\n  nome = \'Ana Exemplo\';\n  foto = \'/assets/ana.png\';\n  enviando = false;\n}'
          ),
          sl(
            'Event binding e two-way binding',
            'Event binding: (evento)="metodo()" ouve um evento do elemento: <button (click)="somar()">. O objeto do evento fica em $event: (input)="aoDigitar($event)". Two-way binding combina os dois: [(ngModel)]="nome" mantém um campo e uma variável sincronizados nos dois sentidos (a sintaxe "banana na caixa" [( )]). Para usar ngModel é preciso importar FormsModule nos imports do componente standalone; sem isso o Angular acusa erro no template. Para formulários maiores o Angular oferece Reactive Forms, assunto dos próximos níveis.',
            '// ilustrativo, não executado aqui\n@Component({\n  selector: \'app-busca\',\n  imports: [FormsModule],\n  template: `\n    <input [(ngModel)]="termo" />\n    <button (click)="limpar()">Limpar</button>\n    <p>Buscando: {{ termo }}</p>\n  `\n})\nexport class BuscaComponent {\n  termo = \'\';\n  limpar() { this.termo = \'\'; }\n}'
          ),
          sl(
            '@if e @switch',
            'Em versões recentes, o Angular tem sintaxe de controle de fluxo embutida no template (a antiga usava as diretivas *ngIf e *ngFor, ainda encontradas em código legado). @if (condicao) { ... } @else { ... } mostra blocos condicionalmente, e @else if também existe. @switch (valor) { @case (\'a\') { ... } @default { ... } } escolhe entre várias opções. Essa sintaxe faz parte do template, não precisa importar nada, e é mais legível do que as diretivas antigas.',
            '// ilustrativo, não executado aqui\n@if (carregando) {\n  <p>Carregando...</p>\n} @else if (erro) {\n  <p>Não foi possível carregar.</p>\n} @else {\n  <p>Pronto!</p>\n}\n\n@switch (status) {\n  @case (\'ok\') { <span>Concluído</span> }\n  @case (\'erro\') { <span>Falhou</span> }\n  @default { <span>Desconhecido</span> }\n}'
          ),
          sl(
            '@for com track',
            'Listas usam @for (item of lista; track item.id) { ... }. O track é OBRIGATÓRIO: ele informa qual valor identifica cada item (como a key do React e do Vue), para o Angular reaproveitar os elementos corretos quando a lista muda. Use um identificador único e estável (id); track $index só serve para listas que nunca mudam. Variáveis úteis dentro do bloco: $index, $first, $last, $count. O bloco @empty { ... } mostra algo quando a lista está vazia, tornando o estado "sem dados" parte natural do template.',
            '// ilustrativo, não executado aqui\n<ul>\n  @for (t of tarefas; track t.id) {\n    <li>{{ $index + 1 }}. {{ t.titulo }}</li>\n  } @empty {\n    <li>Nenhuma tarefa</li>\n  }\n</ul>'
          ),
          sl(
            'Pipes e segurança de HTML',
            'Pipes transformam valores só na exibição, com a barra vertical: {{ nome | uppercase }}, {{ preco | currency:\'BRL\' }}, {{ criadoEm | date:\'dd/MM/yyyy\' }}. Há ainda lowercase, percent, json (útil para depurar) e async (lê Observables e Promises, conteúdo de lição futura). Pipes de data e moeda respeitam o idioma configurado. Segurança: [innerHTML]="html" insere HTML e o Angular o SANITIZA automaticamente, removendo partes perigosas. Os métodos bypassSecurityTrust... (de DomSanitizer) DESLIGAM essa proteção: evite com dados externos. Prefira {{ }}, que trata tudo como texto.',
            '// ilustrativo, não executado aqui\n<p>{{ nome | uppercase }}</p>\n<p>{{ preco | currency:\'BRL\' }}</p>\n\n<!-- sanitizado pelo Angular -->\n<div [innerHTML]="comentario"></div>\n\n<!-- CORRETO e mais simples: texto -->\n<div>{{ comentario }}</div>'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o [disabled]="enviando" em um <button> faz?', 'a', [
          'Liga a propriedade disabled do botão ao valor da variável enviando',
          'Escreve o texto "enviando" dentro do botão sem alterar a propriedade do botão',
          'Cria um evento chamado disabled que escuta cliques do botão',
          'Importa o FormsModule automaticamente na classe do componente'
        ], 'Os colchetes indicam property binding: a expressão é avaliada e o resultado é atribuído à propriedade do elemento.'),
        mcq('q2', 'Qual sintaxe liga o clique de um botão ao método somar()?', 'b', [
          '[click]="somar()"',
          '(click)="somar()"',
          '{{ click: somar() }}',
          '@click="somar()"'
        ], 'Parênteses são event binding no Angular. @click é a sintaxe do Vue, e colchetes ligam propriedades.'),
        mcq('q3', 'Um campo usa [(ngModel)]="termo" e o Angular acusa erro no template. Qual é a causa mais provável?', 'c', [
          'A variável termo precisa ser uma constante e o ngModel só aceita listas',
          'O ngModel só funciona em listas e o selector está em maiúsculas',
          'O FormsModule não foi incluído nos imports do componente standalone',
          'O selector do componente está em letras maiúsculas'
        ], 'ngModel pertence ao FormsModule, que precisa ser importado em componentes standalone.'),
        fill('q4', 'Complete com a palavra que identifica cada item em um bloco @for.', '@for (t of tarefas; ___ t.id) { <li>{{ t.titulo }}</li> }', ['track'], 'track informa o identificador do item para que o Angular reaproveite os elementos certos quando a lista muda.'),
        mcq('q5', 'Qual bloco mostra uma mensagem quando a lista de um @for está vazia?', 'd', [
          '@else',
          '@default',
          '@none',
          '@empty'
        ], '@empty faz parte do bloco @for. @else pertence a @if e @default a @switch; @none não existe.'),
        mcq('q6', 'O que significa {{ preco | currency:\'BRL\' }}?', 'c', [
          'Alterar o valor de preco para reais no código e salvar essa mudança no código',
          'Converter preco em texto para armazenar no banco no banco de dados da aplicação',
          'Exibir o valor de preco formatado como moeda, sem alterar a variável',
          'Importar o pacote de moedas do npm pelo gerenciador de pacotes'
        ], 'Pipes transformam o valor apenas na exibição; a variável original não muda.'),
        mcq('q7', 'Uma aplicação recebe HTML de um comentário e usa bypassSecurityTrustHtml para exibi-lo sem tratamento. Qual é o problema?', 'b', [
          'O Angular não permite exibir comentários de usuários em nenhuma situação',
          'A proteção contra XSS foi desligada para dados externos; prefira {{ }} ou o [innerHTML] sanitizado',
          'O método remove todos os estilos da página assim que é chamado',
          'O método só funciona em modo de produção e quebra o ambiente de desenvolvimento'
        ], 'bypassSecurityTrust... desativa a sanitização. Com dados externos isso abre espaço para XSS.'),
        fill('q8', 'Complete com o pipe que converte um texto para maiúsculas.', '{{ nome | ___ }}', ['uppercase'], 'O pipe uppercase exibe o texto em maiúsculas sem alterar o valor original.')
      ]
    },
    {
      id: 'fib-19-angular-signals-e-estado-local',
      title: 'Angular: signals e estado local',
      goal: 'Usar signal, computed e effect em nível básico, atualizar com set e update e entender por que signals existem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um signal',
            'Um signal é um contêiner reativo para um valor: o Angular sabe exatamente quem o lê e atualiza só o que depende dele. Criação: contagem = signal(0). LEITURA: chame como função, contagem() — os parênteses são obrigatórios, tanto na classe quanto no template ({{ contagem() }}). Erro comum: escrever {{ contagem }} e ver "[Function]" ou o objeto em vez do valor. Signals são a forma moderna de estado local e reatividade no Angular em versões recentes; confira a documentação da versão que você usa.',
            '// ilustrativo, não executado aqui\nimport { Component, signal } from \'@angular/core\';\n\n@Component({\n  selector: \'app-contador\',\n  template: `\n    <button (click)="somar()">Cliques: {{ contagem() }}</button>\n  `\n})\nexport class ContadorComponent {\n  contagem = signal(0);\n  somar() { this.contagem.update(n => n + 1); }\n}'
          ),
          sl(
            'set e update',
            'Para alterar um signal: set(novo) substitui o valor (contagem.set(0)); update(fn) calcula o novo valor a partir do anterior (contagem.update(n => n + 1)). Use update quando o próximo valor depende do atual. Com objetos e arrays, siga a imutabilidade, como no React: tarefas.update(lista => [...lista, nova]) ou tarefas.update(lista => lista.filter(t => t.id !== id)). Alterar o array interno com push sem passar por set ou update não notifica ninguém. Signals são notificados pela troca do valor (referência diferente).',
            '// ilustrativo, não executado aqui\ntarefas = signal<Tarefa[]>([]);\n\nadicionar(titulo: string) {\n  this.tarefas.update(lista => [\n    ...lista,\n    { id: Date.now(), titulo, feita: false }\n  ]);\n}\n\nremover(id: number) {\n  this.tarefas.update(lista => lista.filter(t => t.id !== id));\n}'
          ),
          sl(
            'computed',
            'computed cria um signal DERIVADO, somente leitura, calculado a partir de outros e guardado em cache: ele só recalcula quando algum signal que ele leu muda. pendentes = computed(() => this.tarefas().filter(t => !t.feita).length). Lê-se como os demais: pendentes(). É o equivalente do computed do Vue e da ideia de estado derivado do React, só que sem escrever o cálculo toda vez. Regra: não guarde em outro signal o que pode ser computado; você evita duas fontes da verdade. Um computed não pode ser alterado com set.',
            '// ilustrativo, não executado aqui\ntarefas = signal<Tarefa[]>([]);\npendentes = computed(() => this.tarefas().filter(t => !t.feita).length);\n\n// template: <p>Pendentes: {{ pendentes() }}</p>'
          ),
          sl(
            'effect em nível básico',
            'effect(() => ...) executa uma função sempre que os signals lidos dentro dela mudam: serve para efeitos colaterais, como registrar algo ou salvar no localStorage. Ele roda ao ser criado (normalmente no construtor ou em campo da classe) e depois a cada mudança relevante. Cuidados: (1) não use effect para calcular valor derivado (use computed); (2) não atualize outros signals dentro do effect sem necessidade, pois cria cadeias difíceis de seguir; (3) não grave dados pessoais em localStorage nem em logs sem necessidade e sem base legal (LGPD, visão geral: não substitui orientação jurídica). Exemplo seguro: salvar uma preferência de tema.',
            '// ilustrativo, não executado aqui\ntema = signal<\'claro\' | \'escuro\'>(\'claro\');\n\nconstructor() {\n  effect(() => {\n    localStorage.setItem(\'tema\', this.tema());   // preferência, não dado pessoal\n  });\n}'
          ),
          sl(
            'Por que signals',
            'Antes dos signals, o Angular precisava verificar toda a árvore de componentes para descobrir o que mudou (detecção de mudanças baseada em zonas). Com signals, a dependência é explícita: o template que lê contagem() é atualizado quando contagem muda, e só ele. Ganhos: código mais previsível, menos trabalho desnecessário e uma base de reatividade mais próxima da de Vue e de outras bibliotecas. Em resumo: signal guarda o valor, computed deriva, effect reage. RxJS e Observables continuam importantes para fluxos assíncronos (requisições HTTP, eventos ao longo do tempo) e serão vistos em níveis posteriores.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como ler o valor de um signal chamado contagem no template?', 'c', [
          '{{ contagem }}',
          '{{ contagem.value }}',
          '{{ contagem() }}',
          '{{ get contagem }}'
        ], 'Signals são lidos chamando-os como função. .value é do Vue e a forma sem parênteses mostra a função em vez do valor.'),
        mcq('q2', 'Qual chamada incrementa o signal contagem a partir do valor atual?', 'a', [
          'this.contagem.update(n => n + 1)',
          'this.contagem++',
          'this.contagem = this.contagem + 1',
          'this.contagem().push(1)'
        ], 'update recebe o valor atual e devolve o novo. As outras formas tentam tratar o signal como número ou mutar o conteúdo.'),
        mcq('q3', 'Para adicionar uma tarefa a um signal de lista, qual é a forma correta?', 'a', [
          'this.tarefas.update(l => [...l, nova])',
          'this.tarefas().push(nova)',
          'this.tarefas = nova',
          'this.tarefas.sort()'
        ], 'update com um array novo respeita a imutabilidade e notifica o signal. push altera o array sem avisar ninguém.'),
        fill('q4', 'Complete com a função que cria um valor derivado, somente leitura, a partir de outros signals.', 'pendentes = ___(() => this.tarefas().filter(t => !t.feita).length);', ['computed'], 'computed cria um signal derivado, guardado em cache e recalculado apenas quando suas dependências mudam.'),
        mcq('q5', 'Qual é o uso apropriado de effect?', 'c', [
          'Calcular o total de itens para exibir em qualquer cálculo do template',
          'Substituir o computed em qualquer cálculo e declarar as props do componente',
          'Efeitos colaterais, como salvar uma preferência de tema ao mudar',
          'Declarar as props do componente como se fossem inputs'
        ], 'effect serve para reagir a mudanças com efeitos externos. Valores derivados pertencem a computed.'),
        mcq('q6', 'Qual é uma preocupação de privacidade ao usar effect para salvar dados no localStorage?', 'a', [
          'Evitar gravar dados pessoais sem necessidade; salvar só o que for preciso, como preferências',
          'O localStorage criptografa todo o conteúdo automaticamente, protegendo contra leituras',
          'O effect remove os dados do localStorage quando a página é fechada',
          'O localStorage só aceita números e, por isso, não comporta dados pessoais'
        ], 'Qualquer script da página lê o localStorage; por minimização, guarde apenas o necessário e evite dados pessoais e credenciais.'),
        mcq('q7', 'Qual é a principal vantagem dos signals em relação à detecção de mudanças baseada em zonas?', 'b', [
          'Eliminam a necessidade de TypeScript nos projetos Angular em versões recentes',
          'A dependência é explícita, então o Angular atualiza só o que depende do valor',
          'Substituem os componentes por funções simples que devolvem texto',
          'Fazem os dados serem salvos no servidor de forma automática a cada mudança'
        ], 'Com signals o framework sabe quem lê cada valor. Não afetam o uso de TypeScript, de componentes ou do servidor.'),
        fill('q8', 'Complete com o método que substitui o valor de um signal por um novo.', 'this.contagem.___(0);', ['set'], 'set substitui o valor do signal; update calcula o novo valor a partir do anterior.')
      ]
    },
    {
      id: 'fib-20-angular-inputs-outputs-e-servicos-basico',
      title: 'Angular: inputs, outputs e serviços (básico)',
      goal: 'Comunicar pai e filho com input() e output(), e compartilhar lógica com serviços e injeção de dependência usando inject() e providedIn root.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'input(): dados do pai para o filho',
            'Em versões recentes do Angular, o filho recebe dados do pai por inputs baseados em signals: titulo = input.required<string>() (obrigatório) ou preco = input(0) (com valor padrão). Como são signals, você lê com parênteses: titulo(). O pai passa o valor com property binding: <app-cartao [titulo]="t.nome" [preco]="t.preco" />. Inputs são SOMENTE LEITURA para o filho: ele não os altera (mesma regra de props no React e no Vue). A forma anterior, o decorator @Input(), ainda é comum em código legado e funciona do mesmo modo conceitualmente.',
            '// ilustrativo, não executado aqui\nimport { Component, input } from \'@angular/core\';\n\n@Component({\n  selector: \'app-cartao\',\n  template: `<h2>{{ titulo() }}</h2><p>{{ preco() }}</p>`\n})\nexport class CartaoComponent {\n  titulo = input.required<string>();\n  preco = input(0);\n}\n\n// pai: <app-cartao [titulo]="t.nome" [preco]="t.preco" />'
          ),
          sl(
            'output(): eventos do filho para o pai',
            'O filho avisa o pai com um output: comprou = output<number>(); e emite com this.comprou.emit(id). O pai escuta com event binding e recebe o valor em $event: <app-cartao (comprou)="aoComprar($event)" />. O fluxo é o mesmo dos outros frameworks: dados descem por inputs, eventos sobem por outputs. Nomeie o output pelo que aconteceu (comprou, fechou), sem prefixo "on". O tipo entre < > descreve o que o evento carrega.',
            '// ilustrativo, não executado aqui\nimport { Component, input, output } from \'@angular/core\';\n\n@Component({\n  selector: \'app-cartao\',\n  template: `<button (click)="comprar()">Comprar</button>`\n})\nexport class CartaoComponent {\n  id = input.required<number>();\n  comprou = output<number>();\n  comprar() { this.comprou.emit(this.id()); }\n}\n\n// pai: <app-cartao [id]="7" (comprou)="aoComprar($event)" />'
          ),
          sl(
            'Serviços',
            'Quando vários componentes precisam da mesma lógica ou dados (acessar uma API, guardar a lista de tarefas, controlar login), você cria um SERVIÇO: uma classe comum marcada com @Injectable. Componentes devem cuidar da tela; serviços cuidam de regras e dados. Um serviço pode guardar estado em signals e expor métodos. Isso evita passar dados por vários níveis de componentes (o props drilling que você viu) e permite testar a lógica sem a interface.',
            '// ilustrativo, não executado aqui\nimport { Injectable, signal } from \'@angular/core\';\n\n@Injectable({ providedIn: \'root\' })\nexport class TarefasService {\n  private lista = signal<string[]>([]);\n  readonly tarefas = this.lista.asReadonly();\n\n  adicionar(titulo: string) {\n    this.lista.update(l => [...l, titulo]);\n  }\n}'
          ),
          sl(
            'Injeção de dependência e inject()',
            'Injeção de dependência (DI) significa que um componente não cria o serviço de que precisa: ele PEDE ao Angular, que entrega uma instância pronta. A forma atual de pedir é a função inject(): private tarefasService = inject(TarefasService). Antes era comum receber o serviço pelo construtor; as duas formas funcionam, e inject() é mais curta. Vantagem: troca fácil do serviço (por exemplo, por um falso nos testes) e uma única instância compartilhada quando o escopo é global. Chame inject() na criação da classe (campo ou construtor), não dentro de métodos chamados depois.',
            '// ilustrativo, não executado aqui\nimport { Component, inject } from \'@angular/core\';\n\n@Component({\n  selector: \'app-lista\',\n  template: `\n    @for (t of servico.tarefas(); track t) { <li>{{ t }}</li> }\n    <button (click)="servico.adicionar(\'Nova\')">Adicionar</button>\n  `\n})\nexport class ListaComponent {\n  servico = inject(TarefasService);\n}'
          ),
          sl(
            'Escopo providedIn root',
            'providedIn: \'root\' registra o serviço no injetor RAIZ: existe UMA instância (singleton) para toda a aplicação, compartilhada por todos os componentes que a pedirem, e o Angular só a cria quando alguém a usa. Assim, se dois componentes distantes usam TarefasService, os dois veem a mesma lista. Existem escopos menores (providers de um componente, para ter uma instância por componente), tema dos próximos níveis. Cuidados: um serviço singleton é global, então não guarde nele segredos nem dados pessoais além do necessário e limpe-os quando a pessoa sair (logout). Para falar com a API, serviços usarão HttpClient; veja também o curso de Node.js para o lado do servidor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como um componente pai passa o valor de t.nome para o input titulo do filho?', 'c', [
          '<app-cartao (titulo)="t.nome" />',
          '<app-cartao titulo={t.nome} />',
          '<app-cartao [titulo]="t.nome" />',
          '<app-cartao :titulo="t.nome" />'
        ], 'Property binding com colchetes envia dados ao filho. Parênteses são eventos, chaves são do JSX e os dois pontos são do Vue.'),
        mcq('q2', 'Como o filho informa o pai que o botão Comprar foi clicado, usando a API atual?', 'b', [
          'Altera diretamente o signal que pertence ao componente pai, por referência',
          'Declara comprou = output<number>() e chama this.comprou.emit(id)',
          'Reescreve o input titulo, que o pai observa por meio de detecção de mudanças',
          'Chama document.querySelector para encontrar o pai e alterar o seu conteúdo'
        ], 'output emite eventos para cima; o pai escuta com (comprou)="...". As demais formas violam o fluxo de dados.'),
        mcq('q3', 'Como ler o valor de um input declarado com titulo = input.required<string>() dentro do template?', 'b', [
          '{{ titulo }}',
          '{{ titulo() }}',
          '{{ titulo.value }}',
          '{{ this.titulo.get }}'
        ], 'Inputs baseados em signals são lidos como funções. Sem os parênteses, a expressão não devolve o valor.'),
        fill('q4', 'Complete com a função usada para pedir um serviço ao sistema de injeção de dependência.', 'servico = ___(TarefasService);', ['inject'], 'inject() pede ao Angular uma instância do serviço, em vez de criá-la manualmente.'),
        mcq('q5', 'O que providedIn: \'root\' faz em um serviço?', 'c', [
          'Cria uma instância nova do serviço para cada componente que o utilizar',
          'Torna o serviço visível como uma página própria dentro do navegador',
          'Cria uma instância única para toda a aplicação, compartilhada por quem a pedir',
          'Executa o serviço no servidor e envia apenas o resultado ao navegador'
        ], 'No injetor raiz há um singleton compartilhado. Instâncias por componente exigem providers no próprio componente.'),
        mcq('q6', 'Dois componentes distantes usam o mesmo serviço providedIn root que guarda uma lista. O que acontece quando um adiciona um item?', 'd', [
          'Cada um tem sua cópia e não vê a do outro e não vê o item adicionado no outro',
          'O item some dos dois porque foi adicionado em outro escopo',
          'O Angular exige passar a lista por props para sincronizar os dois componentes',
          'O outro também vê o item, pois ambos usam a mesma instância'
        ], 'Singleton significa estado compartilhado. Esse é um dos usos principais de serviços.'),
        mcq('q7', 'Qual cuidado de privacidade vale para serviços singleton que guardam dados do usuário?', 'd', [
          'Guardar todos os dados pessoais para facilitar o uso futuro',
          'Gravar o conteúdo no console para auditoria',
          'Copiar os dados para variáveis globais da janela',
          'Guardar o mínimo necessário e limpar os dados no logout'
        ], 'Minimização e limpeza reduzem risco; logs e globais ampliam a exposição.'),
        fill('q8', 'Complete com o nome da função usada em um output para enviar o valor ao pai.', 'this.comprou.___(this.id());', ['emit'], 'emit dispara o evento do output, levando o valor ao componente pai.')
      ]
    },
    {
      id: 'fib-21-comparando-react-vue-angular',
      title: 'Comparando React, Vue e Angular',
      goal: 'Ver o mesmo componente nos três frameworks, entender as diferenças de modelo mental e aprender a escolher por critérios, sem procurar um melhor absoluto.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O mesmo componente, três formas',
            'Para comparar de verdade, vamos escrever o MESMO componente nos três: um contador que mostra quantas vezes o botão foi clicado. Repare no que muda (sintaxe e onde mora o estado) e no que é igual (um componente recebe dados, guarda estado e devolve uma interface). Todo o código desta lição é ilustrativo, não executado aqui.'
          ),
          sl(
            'Contador em React',
            'React usa uma função que devolve JSX (marcação dentro do JavaScript). O estado vem do hook useState, que devolve o valor atual e uma função para alterá-lo. Chamar a função de atualização avisa o React, que executa a função do componente de novo e atualiza a tela.',
            '// ilustrativo, não executado aqui (JSX precisa de build)\nimport { useState } from \'react\';\n\nexport function Contador() {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      Cliques: {n}\n    </button>\n  );\n}'
          ),
          sl(
            'Contador em Vue',
            'Vue 3 com Composition API e script setup separa três blocos no mesmo arquivo: lógica, template e estilo. O estado reativo é criado com ref; no script você acessa o valor por .value, mas no template o .value é automático. O Vue rastreia onde cada ref é usada e atualiza só essas partes.',
            '<!-- ilustrativo, não executado aqui -->\n<script setup>\nimport { ref } from \'vue\';\nconst n = ref(0);\n</script>\n\n<template>\n  <button @click="n++">Cliques: {{ n }}</button>\n</template>'
          ),
          sl(
            'Contador em Angular',
            'Em Angular o componente é uma classe com um decorador @Component. Em versões recentes os componentes são standalone e o estado reativo moderno usa signals: um signal é lido chamando-o como função (n()) e alterado com set ou update. O template usa [propriedade] para dados e (evento) para ações.',
            '// ilustrativo, não executado aqui\nimport { Component, signal } from \'@angular/core\';\n\n@Component({\n  selector: \'app-contador\',\n  template: `<button (click)="n.update(v => v + 1)">\n    Cliques: {{ n() }}\n  </button>`\n})\nexport class Contador {\n  n = signal(0);\n}'
          ),
          sl(
            'Diferenças de modelo mental',
            'React: a interface é uma função do estado; a cada mudança a função roda de novo e o React compara o resultado com o anterior. Vue: dependências são rastreadas automaticamente, então só o que usa o dado alterado é atualizado. Angular: um framework completo com convenções fortes (classes, injeção de dependência, roteador e HTTP incluídos) e signals para reatividade precisa. Os três chegam ao mesmo lugar por caminhos diferentes.'
          ),
          sl(
            'Curva de aprendizado, ecossistema e escolha',
            'React é pequeno no núcleo (UI), mas exige escolher bibliotecas para rotas, dados e formulários: liberdade com mais decisões. Vue oferece pacotes oficiais próximos (Vue Router, Pinia) e templates fáceis de ler. Angular entrega quase tudo integrado e exige aprender mais conceitos no começo (TypeScript, injeção, RxJS), mas dá um caminho uniforme para equipes grandes. Não existe melhor absoluto: pergunte se a equipe já domina algum, se o projeto é longo, se há bibliotecas e vagas disponíveis, se precisa de SEO ou renderização no servidor e que código já existe. Os conceitos (componente, props, estado, eventos) se transferem entre os três.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe grande precisa de um framework que já inclua roteador, cliente HTTP, formulários e injeção de dependência, com convenções rígidas. Qual característica favorece essa escolha?', 'c', [
          'React inclui por padrão roteador, formulários e cliente HTTP oficiais, bastando importá-los do pacote principal da biblioteca',
          'Vue proíbe o uso de bibliotecas externas, o que garante que todo projeto fique igual e com a mesma estrutura',
          'Angular entrega esses recursos integrados e com um jeito padrão de organizar o projeto',
          'Os três têm exatamente o mesmo conjunto embutido, então a diferença para a equipe é só a sintaxe do template'
        ], 'Angular é um framework completo, com roteador, HTTP, formulários e DI no próprio pacote e convenções fortes. O núcleo do React é só interface, Vue não proíbe bibliotecas e os três diferem bastante no que vem incluído.'),
        mcq('q2', 'Em qual ponto os três frameworks do contador são essencialmente iguais?', 'a', [
          'O componente guarda um estado, reage ao clique e atualiza a interface quando o estado muda',
          'Os três usam JSX para descrever a interface, mudando só o nome do hook que guarda o valor do contador',
          'Os três exigem classes com decorador, e a diferença está só em como o decorador recebe o template',
          'Os três atualizam o valor com a atribuição direta de uma variável comum, sem função ou objeto reativo'
        ], 'O que se repete é o modelo: estado, evento e interface derivada do estado. JSX é do React, classes com decorador são do Angular, e nenhum dos três reage a uma variável comum alterada por atribuição.'),
        mcq('q3', 'Uma pessoa em React escreve let n = 0 dentro do componente e faz n = n + 1 no clique, mas o texto na tela não muda. Qual a causa?', 'b', [
          'O React só atualiza a tela a cada dez segundos, e o valor aparece depois desse intervalo',
          'Só a função de atualização do useState avisa o React de que precisa executar o componente de novo',
          'A variável deveria ser declarada com const para o React conseguir rastrear a alteração do valor feita dentro da função do clique',
          'O onClick não funciona com funções de seta, só com funções declaradas com a palavra function'
        ], 'O React não observa variáveis comuns: a função do componente só roda de novo quando o estado é alterado pelo setter do hook. As outras causas são inventadas: não há intervalo, const não ajudaria e funções de seta funcionam em onClick.'),
        fill('q4', 'Complete a criação de estado reativo em Vue 3 com script setup.', 'const n = ___(0);', ['ref'], 'ref cria uma referência reativa; o valor fica em n.value no script e é desembrulhado automaticamente no template.'),
        mcq('q5', 'Um projeto novo será mantido por anos por uma equipe que já conhece bem Angular. Qual a melhor justificativa para escolher?', 'd', [
          'Escolher o framework com mais conteúdo em vídeo, pois a quantidade de tutoriais mede a qualidade técnica para o projeto',
          'Escolher o framework mais recente, porque novidade reduz o custo de manutenção com o passar dos anos',
          'Escolher aleatoriamente, já que a escolha do framework não influencia decisões de equipe ou de prazo',
          'A experiência da equipe e a manutenção a longo prazo pesam mais que preferências gerais de popularidade'
        ], 'Domínio da equipe, prazo e manutenção são critérios reais de projeto. Popularidade em vídeo não mede adequação, novidade não reduz custo de manutenção e a escolha influencia sim contratação, curva e produtividade.'),
        mcq('q6', 'Como se lê o valor de um signal chamado n dentro do template do Angular?', 'd', [
          '{{ n.value }}, acessando a propriedade value como se faz com ref no script do Vue',
          '{{ n }}, igual a qualquer variável da classe, sem parênteses',
          '{{ useSignal(n) }}, usando um hook de leitura importado do pacote',
          '{{ n() }}, chamando o signal como uma função'
        ], 'Signals são funções: ler é chamá-los. .value é do ref do Vue no script, n sem parênteses entregaria a função em si e useSignal não existe no Angular.'),
        mcq('q7', 'Você precisa de rotas em uma aplicação React nova. O que isso mostra sobre a biblioteca?', 'c', [
          'O React possui roteador embutido, ativado ao importar o componente Route de dentro do pacote react',
          'É impossível ter várias páginas em React, e por isso qualquer projeto com mais de uma tela precisa migrar para Angular ou Vue antes de lançar',
          'Roteamento não vem no núcleo do React, então se escolhe uma biblioteca de rotas ou um framework baseado em React',
          'As rotas precisam ser escritas à mão com document.write, pois não existe biblioteca de rotas para React'
        ], 'O núcleo do React cuida da interface e deixa rotas para bibliotecas ou frameworks. Não há roteador embutido, várias páginas são perfeitamente possíveis e document.write não é a prática.'),
        fill('q8', 'Complete a criação de um estado reativo com signals no Angular.', 'n = ___(0);', ['signal'], 'signal(0) cria o estado reativo inicial; para ler usa-se n() e para alterar set ou update.')
      ]
    },
    {
      id: 'fib-22-typescript-para-frontend-basico',
      title: 'TypeScript para front-end (básico)',
      goal: 'Usar tipos básicos, interfaces e inferência, tipar props, eventos e estado nos três frameworks e entender que tipos somem em runtime.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que TypeScript no front-end',
            'TypeScript é JavaScript com tipos: você descreve o formato dos dados e o editor aponta erros antes de rodar (propriedade que não existe, número onde se esperava texto). Os três frameworks têm bom suporte, e o Angular o usa por padrão. O navegador não entende TypeScript: uma etapa de build remove os tipos e entrega JavaScript comum.'
          ),
          sl(
            'Tipos básicos, interfaces e inferência',
            'Tipos primitivos: string, number, boolean. Listas: string[]. Uma interface (ou type) descreve a forma de um objeto. Inferência: quando você inicializa uma variável, o TypeScript deduz o tipo e você não precisa escrever. União ( | ) permite alternativas e ? marca campo opcional.',
            'interface Tarefa {\n  id: number;\n  titulo: string;\n  concluida: boolean;\n  nota?: string;        // opcional\n}\n\nlet total = 0;           // inferido como number\nconst nomes: string[] = [\'Ana\', \'Bruno\'];\ntype Filtro = \'todas\' | \'abertas\' | \'concluidas\';'
          ),
          sl(
            'Tipando em React',
            'Props são tipadas com uma interface na lista de parâmetros. useState infere o tipo do valor inicial; quando o inicial não diz tudo (lista vazia, null), passe o tipo entre sinais de menor e maior. Eventos têm tipos próprios, como o de mudança de um input.',
            '// ilustrativo, não executado aqui\ninterface ItemProps { tarefa: Tarefa; aoAlternar: (id: number) => void; }\n\nexport function Item({ tarefa, aoAlternar }: ItemProps) {\n  return <li onClick={() => aoAlternar(tarefa.id)}>{tarefa.titulo}</li>;\n}\n\nconst [lista, setLista] = useState<Tarefa[]>([]);\nconst aoDigitar = (e: React.ChangeEvent<HTMLInputElement>) => setTexto(e.target.value);'
          ),
          sl(
            'Tipando em Vue e Angular',
            'Vue com script setup lang="ts": defineProps recebe um tipo e ref aceita o tipo entre sinais de menor e maior. Angular: inputs e signals também são tipados, e o compilador confere os templates quando a checagem estrita está ligada.',
            '<!-- Vue, ilustrativo, não executado aqui -->\n<script setup lang="ts">\nimport { ref } from \'vue\';\nconst props = defineProps<{ tarefa: Tarefa }>();\nconst lista = ref<Tarefa[]>([]);\n</script>\n\n// Angular, ilustrativo\nexport class Item {\n  tarefa = input.required<Tarefa>();\n  lista = signal<Tarefa[]>([]);\n}'
          ),
          sl(
            'Tipos não existem em runtime',
            'Depois do build os tipos desaparecem: nada impede que o servidor devolva um JSON diferente do que sua interface promete. Dizer que a resposta de fetch é Tarefa[] é só uma afirmação sua, não uma garantia. Dados externos (API, localStorage, formulário, URL) devem ser validados em tempo de execução, com uma função própria ou uma biblioteca de validação por esquema (como Zod), antes de serem tratados como confiáveis.',
            '// executado com Node (JavaScript puro, equivalente ao que sobra após o build)\nfunction ehTarefa(x) {\n  return typeof x === \'object\' && x !== null\n    && Number.isInteger(x.id)\n    && typeof x.titulo === \'string\'\n    && typeof x.concluida === \'boolean\';\n}\n\nconst recebidos = [\n  { id: 1, titulo: \'Ler docs\', concluida: false },\n  { id: \'2\', titulo: \'Id veio como texto\', concluida: false },\n  null,\n];\nfor (const item of recebidos) console.log(ehTarefa(item), JSON.stringify(item));\n\n// saída real (executado com Node):\n// true {"id":1,"titulo":"Ler docs","concluida":false}\n// false {"id":"2","titulo":"Id veio como texto","concluida":false}\n// false null'
          ),
          sl(
            'Erros comuns',
            'Usar any desliga a checagem e anula o benefício: prefira unknown para dados desconhecidos e estreite com validação. Usar "as Tarefa" (asserção de tipo) não converte nada, só cala o compilador. Tipar manualmente o que já é inferido gera ruído. E lembre: erro de tipo no editor não substitui teste nem validação dos dados reais.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com os tipos TypeScript quando o app vai para o navegador?', 'b', [
          'Permanecem no bundle e o navegador confere cada valor a cada atualização da tela',
          'São removidos no build, e o navegador recebe só JavaScript comum',
          'São convertidos em comentários que o navegador lê para bloquear valores incorretos',
          'São enviados ao servidor junto de cada requisição para que ele valide os campos recebidos'
        ], 'O build apaga os tipos e entrega JavaScript puro, por isso eles não protegem em runtime. O navegador não confere tipos nem os converte em comentários e eles não viajam nas requisições.'),
        mcq('q2', 'Uma API devolve id como texto, mas sua interface diz que id é number. O que é correto concluir?', 'a', [
          'A interface não garante nada sobre o dado que chegou, então ele precisa ser validado na execução',
          'O TypeScript converte o texto em número sozinho ao atribuir o resultado do fetch a uma variável tipada',
          'O app falhará na compilação, pois o compilador consulta a API durante o build para conferir os campos',
          'O texto passa a ser aceito como number quando contiver só dígitos, graças à inferência'
        ], 'Tipos são compromissos de compilação, não verificações do dado real. O TS não converte, não consulta a API e a inferência não troca texto por número.'),
        mcq('q3', 'Qual declaração tipa corretamente um estado inicialmente vazio que guardará tarefas em React?', 'a', [
          'useState<Tarefa[]>([])',
          'useState(Tarefa[]), passando o nome do tipo como valor inicial',
          'useState<[]>(Tarefa)',
          'useState: Tarefa = []'
        ], 'O tipo genérico entre sinais informa que a lista guardará Tarefa, já que [] sozinho não diz o conteúdo. As demais formas não são sintaxe válida de useState.'),
        fill('q4', 'Complete para tipar a lista de tarefas.', 'const lista: ___[] = [];', ['Tarefa'], 'Tarefa[] indica uma lista cujos itens seguem a interface Tarefa.'),
        mcq('q5', 'Qual tipo é mais seguro para um valor vindo de fora (por exemplo JSON.parse) antes de validá-lo?', 'c', [
          'any, porque permite acessar qualquer propriedade sem o editor reclamar',
          'never, porque indica que o valor foi conferido',
          'unknown, que obriga a estreitar o tipo antes de usar',
          'void, porque descarta o valor até que ele seja necessário'
        ], 'unknown força a verificação antes do uso. any desliga a checagem, never significa que o valor não existe e void é de funções sem retorno.'),
        mcq('q6', 'O que faz a asserção const t = dados as Tarefa?', 'b', [
          'Valida os campos de dados e lança erro se algum deles estiver com o tipo incorreto',
          'Só diz ao compilador para tratar dados como Tarefa, sem verificar nem converter nada em runtime',
          'Converte automaticamente cada campo para o tipo declarado na interface',
          'Cria uma cópia de dados com valores padrão nos campos ausentes, preenchendo números com zero e textos com string vazia'
        ], 'A asserção só silencia o compilador, sem validar nem converter nada. Validação, conversão e valores padrão exigem código escrito por você.'),
        mcq('q7', 'Qual é uma vantagem prática de tipar as props de um componente?', 'd', [
          'As props passam a ser criptografadas e não podem ser lidas pelo DevTools do navegador',
          'O componente ganha desempenho em runtime, porque o motor reconhece o tipo declarado',
          'As props deixam de precisar de valor, pois o TypeScript preenche os dados ausentes sozinho quando o componente é renderizado',
          'O editor avisa quando outro componente passa um dado faltando ou no formato errado, antes de rodar o app'
        ], 'O ganho está na detecção antecipada de erros de uso. Tipos não criptografam, não aceleram o JavaScript final e não preenchem valores.'),
        fill('q8', 'Complete o tipo união com a terceira opção permitida.', 'type Filtro = \'todas\' | \'abertas\' | ___;', ['\'concluidas\'', '"concluidas"', 'concluidas'], 'Uma união de literais restringe o valor às opções listadas, como \'concluidas\'.')
      ]
    },
    {
      id: 'fib-23-consumindo-apis-com-fetch',
      title: 'Consumindo APIs com fetch',
      goal: 'Usar fetch com async/await, tratar respostas não-2xx, representar os estados de tela e cancelar requisições com AbortController, entendendo CORS em conceito.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Do que se trata',
            'Quase toda interface busca dados em uma API HTTP. O navegador (e o Node) oferece fetch: ele recebe uma URL e devolve uma Promise de Response. Um segundo passo, resp.json(), lê o corpo e também devolve Promise. Use async/await para escrever o fluxo em ordem. A parte difícil não é chamar, é tratar todos os resultados possíveis.'
          ),
          sl(
            'O erro mais comum: HTTP 404 e 500 não rejeitam',
            'fetch só rejeita a Promise quando há falha de rede (sem conexão, DNS, bloqueio de CORS). Uma resposta 404 ou 500 é uma resposta válida e a Promise resolve normalmente! Por isso verifique resp.ok (verdadeiro para status 200 a 299) e trate o resto como erro. Esquecer isso faz o app tentar ler como dados o corpo de uma página de erro.'
          ),
          sl(
            'Estados da tela',
            'Toda tela que busca dados passa por estados: carregando, sucesso, vazio (deu certo, mas não há itens) e erro. Modele-os explicitamente, em vez de usar só uma lista que começa vazia: a lista vazia durante o carregamento parece "não há itens". Mensagens de erro ao usuário devem ser amigáveis e sem detalhes internos; o detalhe técnico fica no console de desenvolvimento.'
          ),
          sl(
            'AbortController: cancelar e limitar o tempo',
            'AbortController cria um sinal que você passa ao fetch; chamar abort() cancela a requisição e a Promise rejeita com um erro de nome AbortError. Serve para limitar o tempo, para cancelar quando o usuário sai da tela e para descartar a resposta antiga quando uma nova busca começa. Trate AbortError como situação esperada, não como falha.'
          ),
          sl(
            'Exemplo executável: servidor local e cliente',
            'O código abaixo sobe um servidor HTTP do próprio Node em 127.0.0.1 (porta livre escolhida pelo sistema) e consulta cinco rotas com fetch: sucesso, lista vazia, erro 500, resposta lenta cancelada por tempo e rota inexistente. Nada sai da sua máquina.',
            'const http = require(\'node:http\');\n\nconst server = http.createServer((req, res) => {\n  res.setHeader(\'Content-Type\', \'application/json\');\n  if (req.url === \'/tarefas\') res.end(JSON.stringify([{ id: 1, titulo: \'Estudar fetch\' }]));\n  else if (req.url === \'/vazio\') res.end(\'[]\');\n  else if (req.url === \'/quebrado\') { res.statusCode = 500; res.end(\'{"erro":"falha"}\'); }\n  else if (req.url === \'/lento\') setTimeout(() => res.end(\'[]\'), 500);\n  else { res.statusCode = 404; res.end(\'{}\'); }\n});\n\nasync function carregar(url, limiteMs = 200) {\n  const ctrl = new AbortController();\n  const timer = setTimeout(() => ctrl.abort(), limiteMs);\n  try {\n    const resp = await fetch(url, { signal: ctrl.signal });\n    if (!resp.ok) return { estado: \'erro\', detalhe: \'HTTP \' + resp.status };\n    const dados = await resp.json();\n    return dados.length === 0 ? { estado: \'vazio\' } : { estado: \'sucesso\', total: dados.length };\n  } catch (e) {\n    return { estado: \'erro\', detalhe: e.name === \'AbortError\' ? \'cancelado por tempo\' : \'falha de rede\' };\n  } finally {\n    clearTimeout(timer);\n  }\n}\n\nserver.listen(0, \'127.0.0.1\', async () => {\n  const base = \'http://127.0.0.1:\' + server.address().port;\n  for (const rota of [\'/tarefas\', \'/vazio\', \'/quebrado\', \'/lento\', \'/naoexiste\']) {\n    console.log(rota, await carregar(base + rota));\n  }\n  server.closeAllConnections();\n  server.close();\n});\n\n// saída real (executado com Node):\n// /tarefas { estado: \'sucesso\', total: 1 }\n// /vazio { estado: \'vazio\' }\n// /quebrado { estado: \'erro\', detalhe: \'HTTP 500\' }\n// /lento { estado: \'erro\', detalhe: \'cancelado por tempo\' }\n// /naoexiste { estado: \'erro\', detalhe: \'HTTP 404\' }'
          ),
          sl(
            'CORS em conceito',
            'Por segurança, o navegador só deixa uma página ler respostas de OUTRA origem (outro domínio, porta ou protocolo) se o servidor dessa origem permitir, por cabeçalhos como Access-Control-Allow-Origin. Se não permitir, o fetch falha no navegador mesmo que o servidor tenha respondido. Quem configura CORS é o servidor da API, não o front: liberar todas as origens por comodidade é um risco. Em desenvolvimento, um proxy do Vite evita o problema sem enfraquecer a API.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um fetch para uma rota que responde HTTP 500 resolve ou rejeita a Promise?', 'd', [
          'Rejeita, porque todo status acima de 399 provoca exceção automática no fetch',
          'Rejeita, mas só depois de 30 segundos, que é o tempo padrão de espera do navegador',
          'Fica pendente até o servidor corrigir a falha e mandar uma resposta bem-sucedida',
          'Resolve, pois o servidor respondeu; é preciso conferir resp.ok ou o status'
        ], 'fetch só rejeita em falhas de rede ou cancelamento; um 500 é uma resposta HTTP válida. Não existe exceção automática por status, nem espera até o servidor se recuperar.'),
        mcq('q2', 'O que significa resp.ok ser verdadeiro?', 'c', [
          'O corpo da resposta já foi lido e convertido para objeto JavaScript',
          'O servidor confirmou que a origem tem permissão de CORS',
          'O status está entre 200 e 299',
          'Os dados recebidos estão no formato que o front esperava'
        ], 'ok só resume a faixa de status 2xx. Não indica leitura do corpo, CORS nem formato dos dados, que precisam ser validados à parte.'),
        mcq('q3', 'Uma tela de lista mostra "Nenhuma tarefa" enquanto a busca ainda está em andamento. Qual o problema de modelagem?', 'a', [
          'Faltou um estado de carregamento separado do estado vazio',
          'O fetch deveria ser síncrono para a lista já nascer preenchida',
          'A lista vazia não deve existir como possibilidade na interface',
          'A mensagem deveria ser exibida só depois de o usuário clicar em um botão de atualizar'
        ], 'Sem estado de carregamento, a lista inicial vazia é confundida com resultado vazio. fetch é assíncrono por natureza, listas vazias são legítimas e exigir clique piora a experiência.'),
        fill('q4', 'Complete para cancelar a requisição pelo controlador.', 'const ctrl = new AbortController();\nfetch(url, { signal: ctrl.signal });\nctrl.___();', ['abort'], 'abort() dispara o sinal e a Promise do fetch rejeita com AbortError.'),
        mcq('q5', 'Ao capturar um erro no catch do fetch, como tratar o AbortError?', 'b', [
          'Como falha grave: exibir uma mensagem de erro em tela cheia e registrar o usuário',
          'Como cancelamento esperado: não mostrar mensagem de falha ao usuário',
          'Ignorando o catch por completo, já que o AbortError não chega ao código do aplicativo',
          'Repetindo a requisição em laço contínuo até o servidor responder com sucesso'
        ], 'AbortError é consequência de um cancelamento que você mesmo pediu, então não deve assustar o usuário. Ele chega ao catch e repetir sem limite sobrecarregaria o servidor.'),
        mcq('q6', 'O fetch do front falha por CORS, mas o servidor da API está no ar e respondeu. Quem deve ajustar?', 'd', [
          'O front, adicionando um cabeçalho Access-Control-Allow-Origin ao pedido para se autorizar',
          'O usuário, desativando a proteção de CORS nas configurações do próprio navegador',
          'Ninguém, pois CORS é um erro transitório que se resolve sozinho depois de algumas tentativas',
          'O servidor da API, informando quais origens são permitidas nos cabeçalhos de resposta'
        ], 'A permissão é dada pelo servidor dono dos dados. Cabeçalhos de resposta colocados no pedido não autorizam nada, pedir ao usuário que desligue proteções é inaceitável e o erro não é transitório.'),
        mcq('q7', 'Qual cuidado vale para a mensagem mostrada ao usuário quando a API falha?', 'a', [
          'Texto amigável e genérico, deixando detalhes técnicos fora da interface',
          'Exibir o corpo completo da resposta, para ajudar o usuário a reportar o problema',
          'Mostrar a URL interna com os parâmetros da consulta, incluindo identificadores de sessão',
          'Mostrar a pilha de erro do servidor, que é útil para qualquer usuário investigar'
        ], 'Detalhes internos podem vazar estrutura, URLs e dados sensíveis. O usuário precisa de uma orientação clara; o técnico fica em logs controlados.'),
        fill('q8', 'Complete para verificar se a resposta teve sucesso antes de ler os dados.', 'if (!resp.___) throw new Error("HTTP " + resp.status);', ['ok'], 'resp.ok é true para status 2xx; negá-lo trata 4xx e 5xx como erro.')
      ]
    },
    {
      id: 'fib-24-consumindo-apis-em-react',
      title: 'Consumindo APIs em React',
      goal: 'Buscar dados em React com efeito e estado, evitar condições de corrida com cleanup e conhecer bibliotecas de dados como o TanStack Query.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Efeito e estado juntos',
            'Em React, buscar dados é um efeito colateral: roda depois da renderização. O padrão básico usa estados (dados e situação), um useEffect que dispara a busca e uma lista de dependências que diz quando refazê-la. Chamar fetch direto no corpo do componente seria um erro: ele rodaria a cada renderização.',
            '// ilustrativo, não executado aqui\nfunction Tarefas() {\n  const [dados, setDados] = useState([]);\n  const [estado, setEstado] = useState(\'carregando\');\n\n  useEffect(() => {\n    const ctrl = new AbortController();\n    fetch(\'/api/tarefas\', { signal: ctrl.signal })\n      .then(r => { if (!r.ok) throw new Error(\'HTTP \' + r.status); return r.json(); })\n      .then(lista => { setDados(lista); setEstado(\'ok\'); })\n      .catch(e => { if (e.name !== \'AbortError\') setEstado(\'erro\'); });\n    return () => ctrl.abort();   // cleanup\n  }, []);\n\n  if (estado === \'carregando\') return <p>Carregando...</p>;\n  if (estado === \'erro\') return <p>Não foi possível carregar.</p>;\n  if (dados.length === 0) return <p>Nenhuma tarefa.</p>;\n  return <ul>{dados.map(t => <li key={t.id}>{t.titulo}</li>)}</ul>;\n}'
          ),
          sl(
            'Race conditions e cleanup',
            'Se a busca depende de uma entrada (por exemplo o texto digitado), duas requisições podem estar em voo ao mesmo tempo, e a mais lenta pode chegar por último, sobrescrevendo o resultado correto com um antigo. O React permite devolver uma função de limpeza no efeito: ela roda antes do próximo efeito e quando o componente sai da tela. Dentro dela você cancela a requisição ou marca que a resposta deve ser ignorada.'
          ),
          sl(
            'Demonstração executável: a corrida e a proteção',
            'Em JavaScript puro, o código abaixo simula duas buscas em ordem inversa de chegada. Sem proteção a resposta antiga vence; com uma marca de cancelamento (a mesma ideia do cleanup) ela é descartada.',
            'const atraso = ms => new Promise(r => setTimeout(r, ms));\nconst buscar = (termo, ms) => atraso(ms).then(() => \'resultado de \' + termo);\n\nasync function simular(comProtecao) {\n  let tela = \'\';\n  const buscas = [];\n  function iniciar(termo, ms) {\n    let cancelado = false;\n    buscas.push(buscar(termo, ms).then(r => { if (!cancelado) tela = r; }));\n    return () => { cancelado = true; };   // equivale ao cleanup do efeito\n  }\n  const limpar = iniciar(\'re\', 60);       // busca antiga, lenta\n  if (comProtecao) limpar();              // o usuário digitou mais: limpa a antiga\n  iniciar(\'react\', 10);                   // busca nova, rápida\n  await Promise.all(buscas);\n  return tela;\n}\n\n(async () => {\n  console.log(\'sem proteção :\', await simular(false));\n  console.log(\'com proteção :\', await simular(true));\n})();\n\n// saída real (executado com Node):\n// sem proteção : resultado de re\n// com proteção : resultado de react'
          ),
          sl(
            'Armadilhas do useEffect para dados',
            'Esquecer a lista de dependências (o efeito roda a cada renderização), omitir variáveis usadas dentro do efeito (dado desatualizado), atualizar estado após o componente sair da tela e não tratar o status HTTP. Em desenvolvimento, o modo estrito do React pode executar o efeito duas vezes de propósito para revelar falta de cleanup: não é bug seu, é um teste.'
          ),
          sl(
            'Bibliotecas de dados',
            'Escrever tudo isso em cada tela repete código e erros. Bibliotecas de dados de servidor, como o TanStack Query (e alternativas como SWR), fornecem cache, estados de carregamento e erro, repetição, cancelamento e revalidação prontos. Em versões recentes, frameworks baseados em React também oferecem carregamento de dados no servidor. Aprenda o padrão manual primeiro; depois use uma biblioteca para escalar.',
            '// ilustrativo, não executado aqui (TanStack Query)\nconst { data, isPending, isError } = useQuery({\n  queryKey: [\'tarefas\'],\n  queryFn: () => fetch(\'/api/tarefas\').then(r => {\n    if (!r.ok) throw new Error(\'HTTP \' + r.status);\n    return r.json();\n  }),\n});'
          ),
          sl(
            'Padrão loading, error, vazio, sucesso',
            'Escreva a renderização como uma sequência de retornos antecipados, na ordem: carregando, erro, vazio, sucesso. Cada ramo é pequeno e fácil de testar. Para dados do usuário, não inclua dados pessoais reais em logs de erro e prefira credenciais em cookie HttpOnly, não na URL.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que a chamada fetch fica dentro de um useEffect e não no corpo do componente?', 'b', [
          'O fetch só funciona dentro de funções cujo nome começa com use, regra que o próprio navegador cobra na execução',
          'O corpo roda a cada renderização, e a busca é um efeito colateral que deve rodar sob controle',
          'O corpo do componente é executado uma única vez, antes do navegador carregar a página',
          'O useEffect converte o fetch em uma chamada síncrona, evitando as Promises'
        ], 'Efeitos colaterais têm lugar próprio: o corpo é re-executado a cada atualização e buscaria dados sem parar. fetch não depende de nome, o corpo roda muitas vezes e o useEffect não torna nada síncrono.'),
        mcq('q2', 'O que faz a função retornada por um useEffect?', 'c', [
          'Executa o efeito uma segunda vez para confirmar que o dado chegou corretamente',
          'Substitui o estado do componente por seu valor inicial a cada nova renderização',
          'Limpa o efeito anterior, rodando antes do próximo efeito e quando o componente é removido',
          'Impede que o componente seja renderizado novamente durante o resto da sessão do usuário no navegador'
        ], 'O retorno é o cleanup, usado para cancelar requisições, timers e assinaturas. Ele não repete o efeito, não reinicia o estado e não bloqueia renderizações.'),
        mcq('q3', 'Uma busca por texto mostra, de vez em quando, resultados do termo anterior. Qual a causa mais provável?', 'a', [
          'Uma condição de corrida: a resposta antiga chegou depois da nova e sobrescreveu o estado',
          'O servidor guarda o termo anterior e o devolve de propósito em algumas respostas',
          'O React ordena os resultados em ordem alfabética, misturando respostas de termos diferentes',
          'A tela foi renderizada antes do primeiro fetch porque o JSX é lido de baixo para cima'
        ], 'Requisições concorrentes podem terminar fora de ordem; sem cancelamento ou descarte, a última a chegar vence. O servidor não faz isso de propósito, o React não reordena e o JSX não é lido ao contrário.'),
        fill('q4', 'Complete o cleanup que cancela a requisição.', 'return () => ctrl.___();', ['abort'], 'abort() no cleanup cancela a busca em andamento quando as dependências mudam ou o componente sai.'),
        mcq('q5', 'Você esqueceu de passar o array de dependências no useEffect que faz o fetch. O que tende a ocorrer?', 'd', [
          'O efeito roda uma única vez e o app funciona normalmente, mesmo que o efeito atualize o estado a cada resposta recebida',
          'O React emite um erro de sintaxe e a página nem chega a ser exibida',
          'O fetch passa a ser feito só no servidor, sem consumir a rede do navegador',
          'O efeito roda após toda renderização, e a atualização do estado pode causar um ciclo de buscas'
        ], 'Sem o array, o efeito é reexecutado a cada renderização; se ele atualiza estado, gera renderizações e buscas em sequência. Não há erro de sintaxe nem mudança de lugar da requisição.'),
        mcq('q6', 'Qual é o principal ganho de usar uma biblioteca como o TanStack Query?', 'b', [
          'Ela elimina a necessidade de ter uma API no servidor, guardando tudo no navegador',
          'Cache, estados de carregamento e erro, repetição e cancelamento prontos, em vez de reescrever tudo em cada tela',
          'Ela valida automaticamente a segurança dos dados e protege contra XSS no texto recebido',
          'Ela substitui o JSX, permitindo escrever toda a interface sem componentes e sem precisar de estado local nas telas'
        ], 'Bibliotecas de dados de servidor automatizam o que se repete na busca de dados. Elas não substituem a API, não sanitizam conteúdo por você e não trocam o JSX.'),
        mcq('q7', 'Em qual ordem faz sentido escrever os retornos antecipados de uma tela com dados da API?', 'c', [
          'Sucesso primeiro, pois é o caso mais comum, e os demais depois',
          'Vazio, sucesso, erro e carregando',
          'Carregando, erro, vazio e por fim sucesso',
          'Qualquer ordem produz o mesmo resultado, já que a leitura dos estados ocorre em paralelo'
        ], 'Cada estado precisa ser tratado antes de assumir que os dados existem; deixar o sucesso por último evita ler dados indefinidos. A ordem importa porque os retornos são avaliados em sequência.'),
        fill('q8', 'Complete o hook que executa efeitos colaterais após a renderização.', 'import { useState, ___ } from "react";', ['useEffect'], 'useEffect agenda o efeito para depois da renderização e controla quando ele roda pelas dependências.')
      ]
    },
    {
      id: 'fib-25-consumindo-apis-em-vue',
      title: 'Consumindo APIs em Vue',
      goal: 'Criar um composable useFetch simples, usar watchEffect e watch para refazer buscas e tratar estados e erros em Vue 3.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Buscar dados com refs',
            'Em Vue 3 com script setup, você declara refs para dados, carregando e erro, e uma função assíncrona que faz fetch e atualiza os refs. Como o Vue rastreia onde cada ref é usado, o template reage sozinho quando eles mudam. A função pode ser chamada ao montar o componente (onMounted) ou dentro de um efeito reativo.',
            '<!-- ilustrativo, não executado aqui -->\n<script setup>\nimport { ref, onMounted } from \'vue\';\nconst dados = ref([]);\nconst carregando = ref(true);\nconst erro = ref(null);\n\nonMounted(async () => {\n  try {\n    const resp = await fetch(\'/api/tarefas\');\n    if (!resp.ok) throw new Error(\'HTTP \' + resp.status);\n    dados.value = await resp.json();\n  } catch {\n    erro.value = \'Não foi possível carregar.\';\n  } finally {\n    carregando.value = false;\n  }\n});\n</script>'
          ),
          sl(
            'Template com os quatro estados',
            'No template, v-if, v-else-if e v-else escolhem entre carregando, erro, vazio e lista. Não esqueça a key no v-for, um identificador estável como o id do item.',
            '<!-- ilustrativo, não executado aqui -->\n<template>\n  <p v-if="carregando">Carregando...</p>\n  <p v-else-if="erro">{{ erro }}</p>\n  <p v-else-if="dados.length === 0">Nenhuma tarefa.</p>\n  <ul v-else>\n    <li v-for="t in dados" :key="t.id">{{ t.titulo }}</li>\n  </ul>\n</template>'
          ),
          sl(
            'Composable useFetch',
            'Um composable é uma função que usa a reatividade do Vue e empacota lógica reutilizável. Por convenção seu nome começa com use. O composable abaixo recebe uma URL (ou um getter) e devolve dados, erro e carregando; assim cada componente fica pequeno. Bibliotecas prontas e funções utilitárias existem, mas entender a versão simples é o primeiro passo.',
            '// ilustrativo, não executado aqui\nimport { ref, watchEffect, toValue } from \'vue\';\n\nexport function useFetch(url) {\n  const dados = ref(null);\n  const erro = ref(null);\n  const carregando = ref(false);\n\n  watchEffect(async (onCleanup) => {\n    const ctrl = new AbortController();\n    onCleanup(() => ctrl.abort());        // cancela se a URL mudar\n    const alvo = toValue(url);            // lido antes do await: rastreado\n    carregando.value = true;\n    erro.value = null;\n    try {\n      const resp = await fetch(alvo, { signal: ctrl.signal });\n      if (!resp.ok) throw new Error(\'HTTP \' + resp.status);\n      dados.value = await resp.json();\n    } catch (e) {\n      if (e.name !== \'AbortError\') erro.value = \'Falha ao carregar.\';\n    } finally {\n      carregando.value = false;\n    }\n  });\n  return { dados, erro, carregando };\n}'
          ),
          sl(
            'watchEffect e watch',
            'watchEffect executa a função na hora e a repete sempre que qualquer ref lido dentro dela mudar: as dependências são descobertas automaticamente (no exemplo, toValue(url) lê a URL reativa). watch observa fontes que você declara e entrega valor novo e antigo, útil quando se quer controle fino. O callback de limpeza (onCleanup) evita a corrida entre buscas, como o cleanup do useEffect no React. Atenção: só o que é lido ANTES do primeiro await é rastreado.'
          ),
          sl(
            'Usando o composable',
            'Com o composable, a URL pode depender de um ref (como o texto de busca) e a busca é refeita quando ele muda. O valor da busca deve ser codificado com encodeURIComponent ao montar a URL, para não quebrar a consulta nem injetar parâmetros extras.',
            '<!-- ilustrativo, não executado aqui -->\n<script setup>\nimport { ref, computed } from \'vue\';\nimport { useFetch } from \'./useFetch\';\n\nconst busca = ref(\'\');\nconst url = computed(() => \'/api/tarefas?q=\' + encodeURIComponent(busca.value));\nconst { dados, erro, carregando } = useFetch(url);\n</script>'
          ),
          sl(
            'Cuidados',
            'Não use dados pessoais reais em exemplos nem em logs. Use v-html só com conteúdo sanitizado e prefira {{ }}, que escapa o texto. Para cache e revalidação em projetos maiores, existe o TanStack Query também para Vue; o estado compartilhado entre telas vai para a Pinia.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que um composable como useFetch representa em Vue 3?', 'd', [
          'Um componente especial com template próprio, que precisa ser registrado globalmente',
          'Um plugin que altera o navegador para aceitar requisições entre origens diferentes',
          'Uma diretiva do template aplicada com a sintaxe v-fetch, que busca os dados antes de o componente montar',
          'Uma função que reaproveita lógica com reatividade, devolvendo refs que o componente usa'
        ], 'Composables empacotam lógica reativa em funções reutilizáveis. Não são componentes registrados, plugins de CORS nem diretivas de template.'),
        mcq('q2', 'Qual a diferença central entre watchEffect e watch?', 'c', [
          'watchEffect só roda uma vez, enquanto watch roda a cada segundo',
          'watchEffect funciona com valores numéricos e watch com qualquer tipo de dado',
          'watchEffect descobre sozinho as dependências lidas e roda na hora; watch observa fontes que você declara',
          'Não há diferença: são dois nomes para a mesma função, mantidos por compatibilidade com versões antigas do Vue e da Options API'
        ], 'A descoberta automática de dependências distingue watchEffect, que executa imediatamente. As demais afirmações sobre frequência, tipo de dado e sinonímia são falsas.'),
        mcq('q3', 'No template, qual combinação mostra uma mensagem diferente para carregando, erro e lista vazia?', 'a', [
          'v-if, v-else-if e v-else encadeados sobre os refs de estado',
          'Vários v-for sobre o mesmo array, cada um com uma mensagem',
          'Uma única interpolação {{ dados }} que o Vue transforma na mensagem apropriada',
          'O atributo v-show com valor true nos três parágrafos ao mesmo tempo'
        ], 'A renderização condicional encadeada escolhe um único ramo. v-for repete itens, interpolar o array não escolhe mensagem e v-show verdadeiro em todos mostraria tudo junto.'),
        fill('q4', 'Complete para criar a URL de forma segura com o texto digitado.', 'const url = \'/api/tarefas?q=\' + ___(busca.value);', ['encodeURIComponent'], 'encodeURIComponent escapa caracteres especiais para que o valor não quebre a consulta nem inclua parâmetros extras.'),
        mcq('q5', 'Para que serve o onCleanup recebido pelo watchEffect no useFetch?', 'b', [
          'Apagar o ref de dados depois que o componente é exibido pela primeira vez, liberando a memória usada pela lista de tarefas',
          'Cancelar a busca anterior quando a URL muda, evitando que uma resposta antiga sobrescreva a nova',
          'Encerrar o servidor da API quando o usuário fecha a aba do navegador',
          'Converter a resposta em JSON antes de entregá-la ao template'
        ], 'O cleanup roda antes da próxima execução e ao desmontar, permitindo cancelar o fetch em voo. Ele não apaga dados, não controla o servidor e não converte respostas.'),
        mcq('q6', 'Dentro de um watchEffect assíncrono, uma ref é lida somente depois de um await. O que acontece?', 'b', [
          'A ref é rastreada normalmente, pois o Vue acompanha toda a função',
          'Essa leitura não é rastreada, então mudanças nela não disparam o efeito de novo',
          'O Vue lança um erro de compilação e impede o componente de montar na página, avisando sobre a leitura',
          'O efeito passa a rodar em um laço infinito até a ref ser removida'
        ], 'O rastreamento acontece de forma síncrona, só antes do primeiro await. Por isso leia as dependências no início da função. Não há erro de compilação nem laço infinito.'),
        mcq('q7', 'Por que montar a URL com encodeURIComponent no valor digitado?', 'c', [
          'Para deixar o texto criptografado e impossível de ser lido por quem espiona a conexão',
          'Porque o fetch recusa qualquer URL que contenha letras maiúsculas, espaços ou acentos e lançaria erro de sintaxe na hora',
          'Para o texto do usuário não alterar a estrutura da URL, como incluir & ou ? e criar outros parâmetros',
          'Para o servidor reconhecer que o usuário está logado'
        ], 'A codificação trata o texto como dado, não como parte da sintaxe da URL. Não é criptografia, o fetch aceita maiúsculas e nada disso identifica o usuário.'),
        fill('q8', 'Complete o hook do Vue que roda código quando o componente é montado.', 'import { ref, ___ } from "vue";', ['onMounted'], 'onMounted executa a função depois que o componente foi inserido na página.')
      ]
    },
    {
      id: 'fib-26-consumindo-apis-em-angular',
      title: 'Consumindo APIs em Angular',
      goal: 'Usar HttpClient, entender Observables em visão básica, exibir dados com async pipe ou toSignal e tratar erros em Angular.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'HttpClient e provideHttpClient',
            'Angular traz seu próprio cliente HTTP, o HttpClient. Em aplicações standalone ele é habilitado com provideHttpClient na configuração da aplicação e injetado com inject(). Diferente do fetch, os métodos (get, post...) devolvem um Observable, e respostas com status de erro (4xx e 5xx) fazem o fluxo falhar, sem exigir a checagem de ok.',
            '// ilustrativo, não executado aqui\n// app.config.ts\nexport const appConfig = {\n  providers: [provideRouter(rotas), provideHttpClient()]\n};\n\n// tarefas.service.ts\n@Injectable({ providedIn: \'root\' })\nexport class TarefasService {\n  private http = inject(HttpClient);\n  listar() { return this.http.get<Tarefa[]>(\'/api/tarefas\'); }\n}'
          ),
          sl(
            'Observable em visão básica',
            'Um Observable representa um fluxo de valores ao longo do tempo (RxJS). Ele é preguiçoso: nada acontece até alguém se inscrever (subscribe). Para uma chamada HTTP, o fluxo emite UM valor (a resposta) e termina. Você não precisa dominar RxJS agora: basta entender que inscrever-se recebe o resultado e que inscrições devem ser encerradas quando não forem mais necessárias.'
          ),
          sl(
            'Mostrando os dados: async pipe',
            'O async pipe se inscreve no Observable dentro do template, entrega o último valor e cancela a inscrição automaticamente quando o componente é destruído. Com a nova sintaxe de controle de fluxo, combina bem com @if e @for. Esse é o caminho mais seguro contra vazamentos de inscrição.',
            '// ilustrativo, não executado aqui\n@Component({\n  imports: [AsyncPipe],\n  template: `\n    @if (tarefas$ | async; as lista) {\n      @if (lista.length === 0) { <p>Nenhuma tarefa.</p> }\n      @else {\n        <ul>@for (t of lista; track t.id) { <li>{{ t.titulo }}</li> }</ul>\n      }\n    } @else { <p>Carregando...</p> }\n  `\n})\nexport class Tarefas {\n  tarefas$ = inject(TarefasService).listar();\n}'
          ),
          sl(
            'toSignal: de Observable para signal',
            'toSignal converte um Observable em signal, de modo que o template leia com tarefas() como qualquer signal, e a inscrição é gerenciada para você. Você pode informar um valor inicial (aqui null, para distinguir carregando de lista vazia). Versões recentes também trazem recursos de dados assíncronos baseados em signals: consulte a documentação da versão em uso.',
            '// ilustrativo, não executado aqui\nexport class Tarefas {\n  private servico = inject(TarefasService);\n  tarefas = toSignal(this.servico.listar(), { initialValue: null });\n  // template: @if (tarefas() === null) { Carregando... }\n}'
          ),
          sl(
            'Tratando erros',
            'O operador catchError do RxJS intercepta a falha e devolve um valor alternativo (ou um novo fluxo). Mostre ao usuário uma mensagem amigável e registre só informações técnicas necessárias, sem dados pessoais. Um interceptor HTTP centraliza comportamentos comuns, como tratar 401 ou anexar cabeçalhos; não coloque segredos fixos no código do front.',
            '// ilustrativo, não executado aqui\nlistar() {\n  return this.http.get<Tarefa[]>(\'/api/tarefas\').pipe(\n    catchError(() => of(null))   // null sinaliza erro; a tela mostra mensagem amigável\n  );\n}'
          ),
          sl(
            'Armadilhas',
            'Assinar com subscribe manual e esquecer de cancelar vaza memória; prefira async pipe ou toSignal. Chamar http.get não executa a requisição sem subscribe. E, como nos demais frameworks, tipar a resposta com get<Tarefa[]> não valida o dado real recebido.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece ao chamar this.http.get(url) e não se inscrever no resultado?', 'a', [
          'Nenhuma requisição é enviada, pois o Observable é preguiçoso',
          'A requisição é enviada na hora e o resultado é descartado',
          'O Angular se inscreve automaticamente nos Observables criados',
          'O navegador exibe um erro de CORS no console'
        ], 'Observables só executam quando há subscribe (ou async pipe, toSignal). O Angular não se inscreve sozinho e CORS não tem relação.'),
        mcq('q2', 'Diferente do fetch, como o HttpClient trata uma resposta HTTP 404?', 'd', [
          'Entrega a resposta normalmente, sendo necessário conferir resp.ok',
          'Repete a requisição automaticamente, várias vezes, até receber um status 200 do servidor',
          'Converte o 404 em lista vazia',
          'O Observable falha com erro, e é possível tratá-lo com catchError'
        ], 'O HttpClient trata status fora da faixa 2xx como erro do fluxo. Ele não exige resp.ok, não repete por conta própria e não converte erros em listas vazias.'),
        mcq('q3', 'Qual vantagem do async pipe no template?', 'b', [
          'Torna a requisição HTTP síncrona, bloqueando a interface até a resposta do servidor chegar ao navegador',
          'Inscreve-se no Observable e cancela a inscrição ao destruir o componente, evitando vazamentos',
          'Criptografa os dados antes de exibi-los',
          'Permite alterar a resposta do servidor antes de ela chegar'
        ], 'O pipe gerencia o ciclo de vida da inscrição. Não torna nada síncrono, não criptografa nem altera a resposta.'),
        fill('q4', 'Complete para habilitar o HttpClient na aplicação standalone.', 'providers: [provideRouter(rotas), ___()]', ['provideHttpClient'], 'provideHttpClient registra o HttpClient para ser injetado nos serviços e componentes.'),
        mcq('q5', 'Qual função obtém o serviço dentro de uma classe de componente moderna, sem usar o construtor?', 'd', [
          'require(HttpClient)',
          'new HttpClient()',
          'useContext(HttpClient)',
          'inject(HttpClient)'
        ], 'inject() recupera a dependência do contêiner de injeção. require e new ignorariam o mecanismo do Angular e useContext é de React.'),
        mcq('q6', 'O que o toSignal faz com um Observable?', 'c', [
          'Transforma o Observable em Promise e cancela imediatamente a requisição',
          'Cria um servidor local de teste para a API, que responde com dados fictícios ao componente',
          'Converte o fluxo em um signal legível como tarefas(), gerenciando a inscrição',
          'Remove o tipo do Observable para que o TypeScript pare de conferir'
        ], 'toSignal faz a ponte entre RxJS e signals. Não cancela a requisição, não cria servidor e não afeta o TypeScript.'),
        mcq('q7', 'Um desenvolvedor usa subscribe manual em um componente e nunca encerra a inscrição. Qual o risco?', 'a', [
          'A inscrição pode continuar viva depois que o componente sai da tela, vazando memória e executando código à toa',
          'O Angular lança erro de compilação ao encontrar subscribe',
          'O componente passa a ter mais de uma instância automaticamente, cada uma com seu próprio estado independente e sem relação com a rota',
          'A requisição HTTP é duplicada no servidor sem que se perceba'
        ], 'Inscrições manuais são responsabilidade do código. Subscribe é permitido, não duplica componentes e o problema não é duplicar a requisição.'),
        fill('q8', 'Complete o operador que intercepta o erro e devolve um valor alternativo.', 'this.http.get(url).pipe(___(() => of(null)))', ['catchError'], 'catchError captura a falha do fluxo e devolve outro Observable, aqui com o valor null.')
      ]
    },
    {
      id: 'fib-27-roteamento-conceitos',
      title: 'Roteamento: conceitos',
      goal: 'Entender SPA e History API, rotas com parâmetros e query, rotas aninhadas, 404 e SEO, e construir um mini roteador em JavaScript puro.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é roteamento no front-end',
            'Em sites tradicionais cada página é um arquivo servido pelo servidor. Em uma SPA (aplicação de página única) o navegador carrega o app uma vez e o JavaScript troca o conteúdo conforme a URL. O roteador conecta URL e componente: /tarefas mostra a lista, /tarefas/7 mostra a tarefa de id 7. Ele mantém a URL atualizada para que o botão voltar, favoritos e links compartilhados funcionem.'
          ),
          sl(
            'History API',
            'O roteador usa a History API do navegador: history.pushState muda a URL sem recarregar a página, e o evento popstate avisa quando o usuário usa voltar ou avançar. O roteador escuta esses eventos, descobre qual rota corresponde ao novo caminho e renderiza o componente. A alternativa antiga é a URL com # (hash), que não exige configuração do servidor.',
            '// ilustrativo, não executado aqui (precisa de navegador)\nhistory.pushState({}, \'\', \'/tarefas/7\');   // muda a URL, sem recarregar\nwindow.addEventListener(\'popstate\', () => {\n  renderizar(location.pathname);           // voltar/avançar\n});'
          ),
          sl(
            'Parâmetros, query e rotas aninhadas',
            'Parâmetro de rota é um pedaço variável do caminho (/tarefas/:id). Query string vem depois do ponto de interrogação (/tarefas?filtro=abertas&pagina=2) e é boa para filtros opcionais que devem sobreviver ao compartilhar o link. Rotas aninhadas descrevem partes de tela dentro de outras: /conta com filhos /conta/perfil e /conta/senha, em que o layout da conta fica e só a parte interna troca. Os valores vindos da URL são texto controlado pelo usuário: valide antes de usar.'
          ),
          sl(
            '404 e SEO em visão geral',
            'Uma rota coringa (*) captura caminhos desconhecidos e mostra a página de não encontrado. Em SPA pura há um detalhe: o servidor precisa devolver o index.html para caminhos como /tarefas/7 (veremos isso no deploy), e a resposta pode ser 200 mesmo para páginas inexistentes. Para SEO, buscadores preferem conteúdo já presente no HTML: renderização no servidor ou geração estática ajudam, e cada página deve ter título e descrição próprios.'
          ),
          sl(
            'Mini roteador executável',
            'O código abaixo transforma padrões como /tarefas/:id em expressões regulares, descobre qual rota casa com um caminho, extrai parâmetros e lê a query com URL e URLSearchParams. Os valores continuam sendo texto: o código valida o id como inteiro.',
            'const rotas = [\n  { padrao: \'/\', nome: \'inicio\' },\n  { padrao: \'/tarefas\', nome: \'lista\' },\n  { padrao: \'/tarefas/:id\', nome: \'detalhe\' },\n  { padrao: \'*\', nome: \'nao-encontrada\' },\n];\n\nfunction compilar(padrao) {\n  if (padrao === \'*\') return { re: /^.*$/, nomes: [] };\n  const nomes = [];\n  const re = new RegExp(\'^\' + padrao.replace(/:([a-z]+)/gi, (_, n) => { nomes.push(n); return \'([^/]+)\'; }) + \'/?$\');\n  return { re, nomes };\n}\nconst tabela = rotas.map(r => ({ ...r, ...compilar(r.padrao) }));\n\nfunction resolver(endereco) {\n  const url = new URL(endereco, \'http://localhost\');\n  for (const r of tabela) {\n    const m = url.pathname.match(r.re);\n    if (m) {\n      const params = Object.fromEntries(r.nomes.map((n, i) => [n, decodeURIComponent(m[i + 1])]));\n      if (params.id !== undefined && !/^[0-9]+$/.test(params.id)) continue;  // valida\n      return { rota: r.nome, params, query: Object.fromEntries(url.searchParams) };\n    }\n  }\n}\n\nfor (const e of [\'/\', \'/tarefas?filtro=abertas&pagina=2\', \'/tarefas/7\', \'/tarefas/abc\', \'/nada/aqui\']) {\n  console.log(e, \'=>\', JSON.stringify(resolver(e)));\n}\n\n// saída real (executado com Node):\n// / => {"rota":"inicio","params":{},"query":{}}\n// /tarefas?filtro=abertas&pagina=2 => {"rota":"lista","params":{},"query":{"filtro":"abertas","pagina":"2"}}\n// /tarefas/7 => {"rota":"detalhe","params":{"id":"7"},"query":{}}\n// /tarefas/abc => {"rota":"nao-encontrada","params":{},"query":{}}\n// /nada/aqui => {"rota":"nao-encontrada","params":{},"query":{}}'
          ),
          sl(
            'Erros comuns',
            'Montar links como texto e recarregar a página inteira, perdendo estado. Esquecer a rota de 404. Confiar nos parâmetros da URL sem validar (um id pode vir como texto ou ser algo inesperado). Colocar informação sensível na URL, que vai para histórico, logs e cabeçalho Referer. Esquecer que a ordem das rotas importa: a coringa vai por último.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual API do navegador permite ao roteador mudar a URL sem recarregar a página?', 'd', [
          'document.write, que reescreve a URL da barra de endereço junto com o conteúdo de um novo documento',
          'localStorage.setItem, que guarda o caminho para o servidor ler',
          'window.alert, que avisa o servidor sobre a mudança de rota',
          'history.pushState, com o evento popstate para voltar e avançar'
        ], 'A History API troca a URL e avisa sobre navegação do histórico. As demais não alteram o endereço da página.'),
        mcq('q2', 'Em /tarefas/7?filtro=abertas, o que é o parâmetro de rota e o que é a query?', 'b', [
          'O 7 é a query string e filtro=abertas é o parâmetro de rota',
          'O 7 é parâmetro de rota (:id) e filtro=abertas é a query string',
          'Os dois são parâmetros de rota, pois fazem parte da mesma URL',
          'Os dois são query, pois o servidor trata tudo depois da barra como consulta'
        ], 'O parâmetro de rota faz parte do caminho; a query começa no ponto de interrogação e carrega opções como filtros.'),
        mcq('q3', 'Por que um roteador precisa de uma rota coringa (*) por último?', 'a', [
          'Para capturar caminhos desconhecidos e mostrar uma página de não encontrado',
          'Para acelerar o carregamento de todas as outras páginas do site que ainda não foram visitadas',
          'Para impedir que o usuário navegue com o botão voltar',
          'Para esconder a URL real do usuário durante a navegação'
        ], 'A coringa é o fallback do 404. Não acelera as demais, não bloqueia o voltar e não esconde a URL. Vai por último porque a primeira rota que casa vence.'),
        fill('q4', 'Complete o marcador de parâmetro na definição da rota de detalhe.', '/tarefas/___id', [':'], 'Os dois-pontos antes do nome marcam um segmento variável, aqui chamado id.'),
        mcq('q5', 'Um link compartilhado traz /tarefas?pagina=2. Por que a query é adequada ao número da página?', 'c', [
          'Porque querys são criptografadas pelo navegador e protegem o valor contra quem consegue ver o histórico de navegação',
          'Porque o servidor ignora a query, deixando a página mais rápida',
          'Porque é um estado opcional que deve sobreviver ao compartilhar e recarregar a URL',
          'Porque o número da página não pode fazer parte do caminho de uma rota'
        ], 'Filtros e paginação opcionais vão na query para serem compartilháveis. A query não é criptografada, o servidor pode usá-la e o caminho também poderia ter a página.'),
        mcq('q6', 'O caminho /tarefas/abc chega ao roteador. O que o código deve fazer com o id?', 'd', [
          'Usá-lo direto em uma consulta, já que a URL é confiável',
          'Convertê-lo para zero silenciosamente e abrir a tarefa zero',
          'Apagar a tarefa de id abc para limpar o banco de dados e evitar que o erro volte a aparecer em acessos futuros',
          'Validar que é um inteiro e, se não for, tratar como não encontrado ou erro'
        ], 'Valores da URL são texto controlado pelo usuário. Validar evita comportamento inesperado. Tratar a URL como confiável é o erro, e converter ou apagar escondem o problema.'),
        mcq('q7', 'Por que uma SPA pura exige que o servidor devolva o index.html para /tarefas/7?', 'a', [
          'Porque esse caminho não é um arquivo real e o JavaScript do app precisa carregar para tratar a rota',
          'Porque o navegador só carrega a pasta raiz de um site',
          'Porque o index.html guarda o banco de dados com as tarefas',
          'Porque sem isso o CSS deixa de funcionar em todas as páginas'
        ], 'Em recarga ou link direto, o servidor recebe /tarefas/7 e precisa entregar o app, que resolve a rota no cliente. O index.html não guarda dados, e o problema não é só CSS.'),
        fill('q8', 'Complete a leitura da query string de um endereço.', 'const url = new URL(endereco, "http://localhost");\nconst filtro = url.___.get("filtro");', ['searchParams'], 'searchParams oferece métodos como get para ler os parâmetros da query.')
      ]
    },
    {
      id: 'fib-28-react-router-basico',
      title: 'React Router: o básico',
      goal: 'Declarar rotas com Routes e Route, navegar com Link e useNavigate, ler parâmetros e montar rotas aninhadas com Outlet em React.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'React Router em uma frase',
            'React não traz roteador no núcleo; a biblioteca mais usada é o React Router, que aplica na prática os conceitos da lição anterior (History API, parâmetros, query, aninhamento, 404). Em versões recentes ela oferece mais de um modo de uso (declarativo, com objetos de rota e orientado a dados); o código desta lição usa o estilo declarativo e é ilustrativo, não executado aqui. Confira a documentação da versão que você usa.'
          ),
          sl(
            'Routes e Route',
            'Você envolve o app em um roteador (por exemplo BrowserRouter, que usa a History API) e descreve as rotas dentro de Routes. Cada Route liga um path a um element (o componente a mostrar). O path="*" captura o que não casou, servindo de página 404.',
            '// ilustrativo, não executado aqui\nimport { BrowserRouter, Routes, Route } from \'react-router-dom\';\n\nexport function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Inicio />} />\n        <Route path="/tarefas" element={<Lista />} />\n        <Route path="/tarefas/:id" element={<Detalhe />} />\n        <Route path="*" element={<NaoEncontrada />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}'
          ),
          sl(
            'Link, NavLink e navegação por código',
            'Use Link em vez de a href para navegar sem recarregar a página: ele troca a rota pelo roteador e preserva o estado do app. NavLink adiciona um estado de ativo para destacar o item atual do menu. Para navegar depois de uma ação (salvar e voltar à lista), use o hook useNavigate.',
            '// ilustrativo, não executado aqui\nimport { Link, NavLink, useNavigate } from \'react-router-dom\';\n\n<nav>\n  <Link to="/tarefas">Tarefas</Link>\n  <NavLink to="/sobre">Sobre</NavLink>\n</nav>\n\nfunction Salvar() {\n  const navegar = useNavigate();\n  async function aoSalvar() {\n    await salvarTarefa();\n    navegar(\'/tarefas\');\n  }\n  return <button onClick={aoSalvar}>Salvar</button>;\n}'
          ),
          sl(
            'Parâmetros e query',
            'useParams devolve os parâmetros do caminho (sempre como texto) e useSearchParams lê e altera a query. Como vêm da URL, valide: converta o id com Number e confira se é um inteiro antes de buscar.',
            '// ilustrativo, não executado aqui\nimport { useParams, useSearchParams } from \'react-router-dom\';\n\nfunction Detalhe() {\n  const { id } = useParams();            // texto\n  const idNum = Number(id);\n  if (!Number.isInteger(idNum)) return <p>Tarefa inválida.</p>;\n  return <h1>Tarefa {idNum}</h1>;\n}\n\nfunction Lista() {\n  const [busca, setBusca] = useSearchParams();\n  const filtro = busca.get(\'filtro\') ?? \'todas\';\n  // setBusca({ filtro: \'abertas\' }) atualiza a URL\n}'
          ),
          sl(
            'Rotas aninhadas e Outlet',
            'Uma rota pai pode conter rotas filhas. O componente do pai renderiza Outlet no lugar onde a rota filha deve aparecer: o layout (cabeçalho, menu) fica e só a parte interna troca. Rotas índice (index) descrevem o conteúdo padrão do pai.',
            '// ilustrativo, não executado aqui\n<Route path="/conta" element={<LayoutConta />}>\n  <Route index element={<ResumoConta />} />\n  <Route path="perfil" element={<Perfil />} />\n  <Route path="senha" element={<TrocarSenha />} />\n</Route>\n\nfunction LayoutConta() {\n  return (\n    <section>\n      <h1>Minha conta</h1>\n      <Outlet />   {/* a rota filha aparece aqui */}\n    </section>\n  );\n}'
          ),
          sl(
            'Armadilhas e proteção de rotas',
            'Usar a href comum recarrega a página. Esquecer o path="*". Esquecer que useParams devolve texto. Proteger rota no front (redirecionar quem não está logado) é só UX: dados protegidos precisam ser protegidos no servidor, pois qualquer pessoa consegue alterar o código que roda no navegador. Evite colocar dados sensíveis em parâmetros de URL.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a vantagem de usar Link no lugar de uma tag a com href para navegar entre telas?', 'c', [
          'Link criptografa o endereço na barra do navegador, escondendo o caminho real da rota',
          'Link envia a requisição ao servidor mais rápido, pois usa um protocolo exclusivo do React',
          'Troca a rota pela History API sem recarregar a página, preservando o estado do app',
          'Link impede que o usuário use o botão voltar do navegador durante a navegação'
        ], 'Link navega no cliente via History API, sem recarga. Ele não esconde a URL, não usa protocolo próprio e o botão voltar continua funcionando.'),
        mcq('q2', 'Em /tarefas/42, o que useParams devolve para id?', 'b', [
          'O número 42, já convertido pelo roteador de acordo com o formato do caminho',
          'O texto "42", que deve ser convertido e validado antes de ser usado como número',
          'O valor undefined, pois useParams só lê parâmetros de query e não do caminho da URL que está aberta',
          'Um objeto com todo o histórico de navegação do usuário até aquela tela'
        ], 'Parâmetros de caminho chegam como texto. Conversão e validação são responsabilidade do código. useParams lê o caminho (a query é de useSearchParams) e não devolve histórico.'),
        mcq('q3', 'Onde o componente de uma rota pai mostra o conteúdo da rota filha?', 'b', [
          'Em qualquer lugar da página, pois o React decide sozinho a posição',
          'No ponto onde o componente Outlet é renderizado',
          'Substituindo por completo o layout do pai, que desaparece da tela',
          'Dentro da tag head do HTML, junto do título da página'
        ], 'Outlet marca o lugar de encaixe da filha dentro do layout do pai. A posição não é automática, o layout do pai permanece e o conteúdo não vai para o head.'),
        fill('q4', 'Complete o hook que lê os parâmetros do caminho.', 'const { id } = ___();', ['useParams'], 'useParams devolve um objeto com os segmentos variáveis do caminho, como id em /tarefas/:id.'),
        mcq('q5', 'Um desenvolvedor esconde o botão de administração para quem não é admin, usando só uma rota protegida no React. Qual a conclusão correta?', 'd', [
          'A proteção está completa, porque o código do front não pode ser alterado pelo usuário',
          'A proteção basta se a rota for escrita com letras minúsculas e sem parâmetros na URL, já que o roteador diferencia maiúsculas',
          'A proteção só é necessária para usuários que usam navegadores antigos ou sem JavaScript',
          'É uma melhoria de experiência, e a verificação de permissão precisa existir também no servidor'
        ], 'O código do cliente roda na máquina do usuário e pode ser manipulado; só o servidor impõe permissões de verdade. Nem formatação de URL nem versão de navegador mudam isso.'),
        mcq('q6', 'Qual path captura qualquer endereço que nenhuma outra rota atendeu?', 'c', [
          '/404, que o React Router reconhece automaticamente como a página de erro',
          '/ com a palavra exact, que filtra os caminhos desconhecidos',
          '*',
          '/:resto, que casa caminhos de um só segmento'
        ], 'O curinga * casa com o restante e deve ficar como fallback. /404 é um caminho comum, e /:todos casa só um segmento, deixando passar caminhos mais longos.'),
        mcq('q7', 'Para navegar para a lista logo depois de salvar uma tarefa, qual recurso usar?', 'a', [
          'useNavigate, chamando navegar("/tarefas") após o salvamento',
          'window.location.reload(), que recarrega a página e leva o usuário à lista',
          'document.write("/tarefas"), que escreve o endereço direto na página',
          'Um Link renderizado dentro do useEffect, que dispara o clique sozinho'
        ], 'useNavigate permite navegação por código depois de uma ação. reload perde o estado, document.write não navega e Link é um elemento de interface, não um comando.'),
        fill('q8', 'Complete o componente que marca onde a rota filha aparece.', '<section><h1>Minha conta</h1><___ /></section>', ['Outlet'], 'Outlet é substituído pela rota filha correspondente à URL atual.')
      ]
    },
    {
      id: 'fib-29-vue-router-basico',
      title: 'Vue Router: o básico',
      goal: 'Configurar rotas no Vue Router, navegar com router-link e router-view, ler parâmetros com useRoute e criar guards de navegação simples.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Vue Router em uma frase',
            'O Vue Router é o roteador oficial do Vue 3. Você cria uma instância com createRouter, escolhe o modo de histórico (createWebHistory usa a History API; createWebHashHistory usa #) e a instala no app com app.use(router). O código desta lição é ilustrativo, não executado aqui; confira a documentação da versão em uso.'
          ),
          sl(
            'Definindo as rotas',
            'As rotas são uma lista de objetos com path, component e, opcionalmente, name. Segmentos variáveis usam dois-pontos (:id). A rota curinga usa uma expressão de parâmetro com regex para capturar o resto. Importar o componente com import() dinâmico faz carregamento sob demanda (lazy loading), gerando um arquivo separado no build.',
            '// ilustrativo, não executado aqui\n// router.js\nimport { createRouter, createWebHistory } from \'vue-router\';\nimport Inicio from \'./views/Inicio.vue\';\n\nexport const router = createRouter({\n  history: createWebHistory(),\n  routes: [\n    { path: \'/\', name: \'inicio\', component: Inicio },\n    { path: \'/tarefas\', name: \'lista\', component: () => import(\'./views/Lista.vue\') },\n    { path: \'/tarefas/:id\', name: \'detalhe\', component: () => import(\'./views/Detalhe.vue\') },\n    { path: \'/:resto(.*)*\', name: \'nao-encontrada\', component: () => import(\'./views/NaoEncontrada.vue\') },\n  ],\n});\n\n// main.js\ncreateApp(App).use(router).mount(\'#app\');'
          ),
          sl(
            'router-link e router-view',
            'router-link troca de rota sem recarregar a página (e ganha uma classe quando está ativo). router-view é o ponto do template onde o componente da rota atual aparece. Rotas filhas (children) aparecem em um router-view dentro do componente pai, como o Outlet do React.',
            '<!-- ilustrativo, não executado aqui: App.vue -->\n<template>\n  <nav>\n    <router-link to="/">Início</router-link>\n    <router-link to="/tarefas">Tarefas</router-link>\n  </nav>\n  <router-view />\n</template>'
          ),
          sl(
            'Parâmetros, query e navegação por código',
            'useRoute dá acesso à rota atual (params, query, name) e useRouter permite navegar por código com router.push. Parâmetros são texto: valide antes de usar. Em Vue, route.params é reativo; para refazer a busca quando o id muda, use watch ou watchEffect sobre ele.',
            '<!-- ilustrativo, não executado aqui -->\n<script setup>\nimport { computed } from \'vue\';\nimport { useRoute, useRouter } from \'vue-router\';\n\nconst route = useRoute();\nconst router = useRouter();\nconst id = computed(() => Number(route.params.id));\nconst valido = computed(() => Number.isInteger(id.value));\n\nasync function salvar() {\n  await salvarTarefa();\n  router.push({ name: \'lista\', query: { filtro: \'abertas\' } });\n}\n</script>'
          ),
          sl(
            'Guards de navegação',
            'Guards são funções que rodam antes de a navegação se concluir e podem permitir, redirecionar ou cancelar. O mais simples é router.beforeEach, que recebe o destino (to) e a origem (from); em versões atuais, devolva true, false ou um destino em vez de usar next. Um guard de login só melhora a experiência: o servidor continua responsável por autorizar cada requisição.',
            '// ilustrativo, não executado aqui\nrouter.beforeEach((to) => {\n  const logado = sessaoAtiva();            // função fictícia\n  if (to.meta.exigeLogin && !logado) {\n    return { name: \'entrar\', query: { voltar: to.fullPath } };\n  }\n  return true;\n});\n\n// na rota: { path: \'/conta\', component: Conta, meta: { exigeLogin: true } }'
          ),
          sl(
            'Armadilhas',
            'Usar a href comum e recarregar a página. Esquecer o fallback 404. Confiar em route.params sem validar. Guard no cliente não é segurança. Cuidado com o redirecionamento por query (voltar): aceite apenas caminhos internos conhecidos, para não criar um redirecionamento aberto a sites de terceiros.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual componente do Vue Router marca o lugar do template onde a página da rota atual aparece?', 'd', [
          'router-link, que desenha o componente da rota no ponto em que é colocado',
          'router-outlet, que é o componente de saída das rotas do Vue Router',
          'router-page, que o Vue Router cria automaticamente em cada rota',
          'router-view'
        ], 'router-view renderiza o componente da rota atual. router-link só cria links, router-outlet é nome do Angular e router-page não existe.'),
        mcq('q2', 'Um guard com router.beforeEach devolve um destino de login quando o usuário não está logado. O que isso garante?', 'b', [
          'Garante a segurança, pois impede que o usuário veja qualquer informação privada da aplicação sem precisar de mais nada',
          'Melhora a experiência no navegador, mas não protege dados: o servidor precisa autorizar as requisições',
          'Garante que a sessão do usuário seja renovada automaticamente a cada navegação feita',
          'Garante que o componente da rota não seja baixado pelo navegador do visitante'
        ], 'Guards rodam no cliente, onde o código pode ser alterado; autorização real é do servidor. O guard não renova sessão e o código da página pode ser baixado de qualquer forma.'),
        mcq('q3', 'Qual a diferença entre useRoute e useRouter?', 'c', [
          'useRoute navega por código e useRouter lê a rota atual com seus parâmetros',
          'São sinônimos que dão acesso ao mesmo objeto com os mesmos métodos',
          'useRoute lê a rota atual (params, query) e useRouter navega por código com push',
          'useRoute só funciona em Options API e useRouter só na Composition API, por causa da forma como cada um acessa this'
        ], 'A rota atual é lida com useRoute; a ação de navegar fica em useRouter. Não são sinônimos nem se dividem por estilo de API.'),
        fill('q4', 'Complete o componente que cria links de navegação sem recarregar a página.', '<___ to="/tarefas">Tarefas</router-link>', ['router-link', 'RouterLink'], 'router-link (ou RouterLink) troca a rota pelo roteador sem recarregar o documento.'),
        mcq('q5', 'Para que serve importar a view com () => import("./Lista.vue") na definição da rota?', 'a', [
          'Carregar o código da página só quando a rota for visitada, reduzindo o arquivo inicial',
          'Impedir que a página seja indexada por mecanismos de busca em qualquer circunstância, mesmo com conteúdo público',
          'Fazer a página ser carregada no servidor antes de o navegador pedir o HTML',
          'Esconder o componente de usuários que não estão logados na aplicação'
        ], 'O import dinâmico gera um arquivo separado baixado sob demanda (lazy loading). Ele não afeta indexação, não renderiza no servidor e não protege nada.'),
        mcq('q6', 'Uma rota usa /tarefas/:id. O que route.params.id contém ao acessar /tarefas/15?', 'a', [
          'O texto "15", que precisa ser convertido e validado',
          'O número 15, convertido automaticamente pelo Vue Router',
          'O valor null, pois só a query pode carregar dados da URL',
          'O objeto completo da tarefa 15, buscado pelo roteador'
        ], 'Parâmetros de rota são texto. O roteador não converte tipos nem busca dados e o caminho carrega parâmetros normalmente.'),
        mcq('q7', 'Um guard redireciona para a URL recebida em ?voltar= depois do login. Qual cuidado de segurança aplicar?', 'b', [
          'Não há risco, pois o parâmetro voltar vem da própria URL do app e é confiável e foi montado por nós',
          'Aceitar só caminhos internos conhecidos, evitando enviar o usuário a um site externo',
          'Codificar o parâmetro em maiúsculas para o navegador não o interpretar',
          'Guardar o parâmetro dentro do localStorage com o nome do usuário'
        ], 'Redirecionar para qualquer URL recebida cria um redirecionamento aberto, útil para golpes. A origem da URL não a torna confiável e maiúsculas ou localStorage não resolvem.'),
        fill('q8', 'Complete a função que cria o roteador com histórico baseado na History API.', 'const router = createRouter({ history: ___(), routes });', ['createWebHistory'], 'createWebHistory usa a History API para URLs limpas, sem o #.')
      ]
    },
    {
      id: 'fib-30-angular-router-basico',
      title: 'Angular Router: o básico',
      goal: 'Configurar rotas com provideRouter, navegar com routerLink e router-outlet, receber parâmetros como inputs e entender lazy loading e guards em conceito.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Roteador no Angular',
            'O Angular traz o roteador no próprio framework. Em aplicações standalone você registra as rotas com provideRouter na configuração da aplicação. As rotas são um array de objetos com path e component. O código desta lição é ilustrativo, não executado aqui; confira a documentação da versão em uso.',
            '// ilustrativo, não executado aqui\n// app.routes.ts\nimport { Routes } from \'@angular/router\';\n\nexport const rotas: Routes = [\n  { path: \'\', component: Inicio },\n  { path: \'tarefas\', component: Lista },\n  { path: \'tarefas/:id\', component: Detalhe },\n  { path: \'**\', component: NaoEncontrada },   // 404\n];\n\n// app.config.ts\nexport const appConfig = { providers: [provideRouter(rotas)] };'
          ),
          sl(
            'routerLink e RouterOutlet',
            'RouterLink é a diretiva que navega sem recarregar a página; routerLinkActive adiciona uma classe ao link da rota atual. RouterOutlet (a tag router-outlet) marca onde o componente da rota aparece. Como os componentes são standalone, importe RouterLink, RouterLinkActive e RouterOutlet no array imports do componente que os usa.',
            '// ilustrativo, não executado aqui\n@Component({\n  selector: \'app-root\',\n  imports: [RouterLink, RouterLinkActive, RouterOutlet],\n  template: `\n    <nav>\n      <a routerLink="/" routerLinkActive="ativo">Início</a>\n      <a routerLink="/tarefas" routerLinkActive="ativo">Tarefas</a>\n    </nav>\n    <router-outlet />\n  `\n})\nexport class App {}'
          ),
          sl(
            'Parâmetros como inputs',
            'Em versões recentes é possível ligar parâmetros de rota diretamente a inputs do componente com withComponentInputBinding na configuração do roteador. O input com o mesmo nome do parâmetro recebe o valor (como texto). Isso evita injetar ActivatedRoute e deixa o componente fácil de testar. Valide e converta o valor, pois ele vem da URL.',
            '// ilustrativo, não executado aqui\nproviders: [provideRouter(rotas, withComponentInputBinding())]\n\n@Component({ template: `<h1>Tarefa {{ numero() }}</h1>` })\nexport class Detalhe {\n  id = input.required<string>();           // vem de /tarefas/:id\n  numero = computed(() => Number(this.id()));\n}'
          ),
          sl(
            'Navegação por código e query',
            'Para navegar depois de uma ação, injete o Router e use navigate. A query pode ser enviada em queryParams, e routerLink também aceita queryParams. Ler a query também pode ser ligado a inputs com o mesmo recurso, ou via ActivatedRoute.',
            '// ilustrativo, não executado aqui\nexport class Salvar {\n  private router = inject(Router);\n  async aoSalvar() {\n    await this.servico.salvar();\n    this.router.navigate([\'/tarefas\'], { queryParams: { filtro: \'abertas\' } });\n  }\n}'
          ),
          sl(
            'Lazy loading em conceito',
            'Em vez de colocar tudo no pacote inicial, a rota pode carregar o componente sob demanda com loadComponent (ou um grupo de rotas com loadChildren). O build gera arquivos separados que o navegador baixa só quando a rota é visitada, melhorando o tempo de carregamento inicial.',
            '// ilustrativo, não executado aqui\n{ path: \'tarefas\',\n  loadComponent: () => import(\'./lista\').then(m => m.Lista) }'
          ),
          sl(
            'Guards em conceito e armadilhas',
            'Guards são funções que decidem se uma rota pode ser ativada (por exemplo canActivate). Em versões recentes são funções simples que podem usar inject(). Como nos outros frameworks, guard no cliente é UX: o servidor decide o acesso aos dados. Armadilhas: esquecer importar RouterLink/RouterOutlet nos imports, esquecer a rota ** e usar href em vez de routerLink (recarrega a página).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como se registram as rotas em uma aplicação Angular standalone?', 'c', [
          'Com um arquivo routes.json que o navegador lê automaticamente ao iniciar o app',
          'Declarando cada rota dentro do template do componente raiz com a tag route',
          'Com provideRouter(rotas) na lista de providers da configuração da aplicação',
          'Chamando createRouter com um objeto de histórico, igual ao que se faz no Vue'
        ], 'provideRouter é a forma standalone de configurar o roteador. Não há routes.json automático, rotas não são declaradas no template como tags e createRouter é do Vue.'),
        mcq('q2', 'Qual é a função da tag router-outlet?', 'd', [
          'Criar um link que navega sem recarregar o documento da página',
          'Interceptar as requisições HTTP para anexar o token de login do usuário',
          'Guardar o histórico completo de rotas já visitadas pelo usuário desde o primeiro acesso ao site',
          'Marcar o ponto do template onde o componente da rota ativa será renderizado'
        ], 'RouterOutlet é o ponto de encaixe das rotas. Links são do routerLink, interceptação HTTP é outro recurso e histórico não é função do outlet.'),
        mcq('q3', 'Qual o benefício de loadComponent em uma rota?', 'd', [
          'A rota passa a ser invisível para usuários sem permissão de acesso',
          'O componente é renderizado no servidor e enviado pronto ao navegador',
          'O Angular valida automaticamente os dados do formulário dessa página',
          'O código da página só é baixado quando a rota é visitada, reduzindo o pacote inicial'
        ], 'loadComponent habilita lazy loading. Não esconde rotas, não renderiza no servidor por si só e não valida formulários.'),
        fill('q4', 'Complete a rota que captura qualquer caminho desconhecido.', '{ path: \'___\', component: NaoEncontrada }', ['**'], 'O curinga ** casa com qualquer caminho não atendido antes e deve ficar por último.'),
        mcq('q5', 'Com withComponentInputBinding ativo, como o componente Detalhe recebe o :id de /tarefas/:id?', 'a', [
          'Por um input com o mesmo nome do parâmetro, recebendo o valor como texto',
          'Por uma variável global criada pelo roteador, chamada window.id',
          'Por um arquivo de configuração separado que o componente precisa importar',
          'Não recebe: parâmetros só podem ser lidos injetando o serviço de HTTP'
        ], 'O recurso liga parâmetros a inputs de mesmo nome; o valor vem como texto e deve ser validado. Nada de variáveis globais, arquivos ou HTTP envolvidos.'),
        mcq('q6', 'O que acontece se o componente usa routerLink mas esqueceu de importar RouterLink no array imports?', 'b', [
          'Nada muda, pois o Angular importa todas as diretivas do roteador automaticamente',
          'O Angular não reconhece a diretiva e o link não funciona como esperado, com erro ou aviso na compilação',
          'O link funciona, mas recarrega a página em vez de usar a History API',
          'O app inteiro volta ao modo NgModule e ignora os componentes standalone'
        ], 'Em componentes standalone, diretivas usadas no template precisam estar em imports. Não há importação automática nem troca para NgModule.'),
        mcq('q7', 'Um guard canActivate bloqueia a rota /admin para quem não é admin. Qual conclusão está correta?', 'c', [
          'Ele torna desnecessária qualquer verificação de permissão no servidor, já que o usuário não consegue chegar à rota',
          'Ele só vale para usuários que abrem o app pela primeira vez',
          'Ele ajuda na experiência, mas a API precisa recusar quem não tem permissão',
          'Ele protege o código-fonte da página contra download'
        ], 'O guard roda no navegador e pode ser contornado; a autorização real fica no servidor. Ele não vale só para primeiras visitas nem impede o download do código.'),
        fill('q8', 'Complete a diretiva que cria links de navegação.', '<a ___="/tarefas">Tarefas</a>', ['routerLink'], 'routerLink navega pelo roteador do Angular, sem recarregar a página.')
      ]
    },
    {
      id: 'fib-31-estilizacao-em-componentes',
      title: 'Estilização em componentes',
      goal: 'Comparar CSS global e com escopo, CSS Modules, scoped do Vue, encapsulamento do Angular, utilitários como Tailwind, variáveis CSS e tema claro e escuro.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema do CSS global',
            'Em CSS comum, todo seletor vale para a página inteira. Em apps com muitos componentes isso gera conflitos: uma regra .botao escrita em um lugar muda botões de outros lugares, e remover estilos vira medo. Frameworks oferecem formas de limitar o alcance dos estilos ao componente (escopo). Há também o caminho oposto, de utilitários.'
          ),
          sl(
            'React: CSS Modules e alternativas',
            'Em React o CSS em si não tem escopo. Um CSS Module é um arquivo .module.css em que o build troca os nomes de classe por nomes únicos, e você importa o objeto de classes. Outras opções: CSS global para o básico do site, bibliotecas de CSS-in-JS e utilitários como Tailwind. Em versões recentes, confira o que o seu framework de build recomenda.',
            '// ilustrativo, não executado aqui\n/* Botao.module.css */\n.botao { padding: 0.5rem 1rem; border-radius: 6px; }\n\n// Botao.jsx\nimport estilos from \'./Botao.module.css\';\nexport const Botao = ({ children }) => (\n  <button className={estilos.botao}>{children}</button>\n);'
          ),
          sl(
            'Vue: style scoped',
            'No componente de arquivo único do Vue, a tag style com o atributo scoped aplica as regras só aos elementos daquele componente (o Vue adiciona um atributo de dados único aos elementos e aos seletores). Para estilizar um filho de dentro de um componente com scoped, existem seletores profundos específicos, mas use com parcimônia. O Vue também oferece style module.',
            '<!-- ilustrativo, não executado aqui -->\n<template><button class="botao"><slot /></button></template>\n\n<style scoped>\n.botao { padding: 0.5rem 1rem; border-radius: 6px; }\n</style>'
          ),
          sl(
            'Angular: encapsulamento de estilos',
            'Todo componente Angular pode ter seus estilos no arquivo ou na propriedade styles. Por padrão o encapsulamento é emulado: o Angular adiciona atributos únicos e reescreve os seletores para valerem só ali. É possível trocar para nenhum encapsulamento (estilos globais) ou para Shadow DOM nativo, com ViewEncapsulation.',
            '// ilustrativo, não executado aqui\n@Component({\n  selector: \'app-botao\',\n  template: `<button class="botao"><ng-content /></button>`,\n  styles: `.botao { padding: 0.5rem 1rem; border-radius: 6px; }`\n})\nexport class Botao {}'
          ),
          sl(
            'Utilitários (Tailwind) em conceito',
            'Em vez de escrever CSS em arquivos, bibliotecas de classes utilitárias, como o Tailwind, dão classes pequenas (espaçamento, cor, fonte) que você combina no próprio HTML. Vantagens: poucos conflitos e padronização; custos: marcação mais longa e uma ferramenta a mais no build. Funciona igualmente em React, Vue e Angular. É uma escolha de equipe, não uma obrigação.'
          ),
          sl(
            'Variáveis CSS e tema claro/escuro',
            'Variáveis CSS (custom properties, escritas como --cor-fundo) guardam valores reutilizáveis e herdam pela árvore. Definidas em :root valem para o app todo, e trocar o valor de poucas variáveis troca o tema. A media query prefers-color-scheme detecta a preferência do sistema; um atributo como data-theme no elemento raiz permite o usuário escolher manualmente. Garanta contraste de cor suficiente nos dois temas.',
            '/* ilustrativo, não executado aqui */\n:root {\n  --cor-fundo: #ffffff;\n  --cor-texto: #1a1a1a;\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) { --cor-fundo: #121212; --cor-texto: #f2f2f2; }\n}\n:root[data-theme="dark"] { --cor-fundo: #121212; --cor-texto: #f2f2f2; }\n\nbody { background: var(--cor-fundo); color: var(--cor-texto); }'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual problema o CSS global causa em apps com muitos componentes?', 'd', [
          'O navegador se recusa a aplicar mais de cem regras CSS em uma mesma página',
          'As regras CSS só funcionam depois de o JavaScript terminar de carregar a página',
          'O CSS global não permite o uso de classes, só de seletores por tag HTML',
          'Uma regra escrita em um ponto pode afetar elementos de outros componentes que usam o mesmo seletor'
        ], 'Seletores globais valem para a página inteira, criando colisões. Não existe limite de cem regras, o CSS não depende do JavaScript e classes funcionam normalmente.'),
        mcq('q2', 'O que é um CSS Module?', 'c', [
          'Um arquivo CSS que o navegador baixa só quando o usuário clica em um botão',
          'Um componente do React que desenha estilos usando JavaScript em tempo de execução',
          'Um arquivo CSS em que as classes ganham nomes únicos no build, limitando o alcance ao componente que o importa',
          'Um plugin do navegador que bloqueia qualquer estilo vindo de outros sites'
        ], 'O build renomeia as classes de forma única, evitando colisões. Não é carregamento por clique, não é componente de JS puro e não é bloqueador.'),
        mcq('q3', 'Em um componente Vue, o que muda ao usar style scoped?', 'a', [
          'As regras passam a valer só para elementos daquele componente',
          'As regras passam a valer para todas as páginas do site, inclusive fora do Vue',
          'Os estilos deixam de ser aplicados e servem só como comentário para a equipe',
          'O componente passa a ser renderizado no servidor, sem JavaScript'
        ], 'scoped limita o alcance dos estilos ao componente. Não amplia para o site todo, não desativa e não muda onde o componente renderiza.'),
        fill('q4', 'Complete o atributo que limita o estilo ao componente Vue.', '<style ___>\n.botao { padding: 0.5rem; }\n</style>', ['scoped'], 'O atributo scoped faz o Vue marcar os elementos e reescrever os seletores para valerem só no componente.'),
        mcq('q5', 'Como usar uma variável CSS chamada --cor-fundo em uma regra?', 'b', [
          'background: --cor-fundo;',
          'background: var(--cor-fundo);',
          'background: $cor-fundo;',
          'background: @cor-fundo;'
        ], 'A função var() lê uma custom property. Usar --cor-fundo sozinho não funciona e $ e @ são sintaxes de pré-processadores, não do CSS.'),
        mcq('q6', 'Como oferecer tema escuro respeitando a preferência do sistema do usuário?', 'c', [
          'Detectar o navegador pelo nome e trocar as cores de acordo com a marca dele',
          'Perguntar a cor favorita do usuário em um formulário e guardar no servidor com nome completo',
          'Usar a media query prefers-color-scheme sobre variáveis CSS e, se quiser, permitir escolha manual por um atributo no elemento raiz',
          'Colocar fundo preto e texto preto para que o navegador escolha o melhor contraste'
        ], 'prefers-color-scheme expressa a preferência do sistema; trocar variáveis troca o tema todo. Detectar navegador é irrelevante, formulário com dados pessoais é desnecessário e preto sobre preto é ilegível.'),
        mcq('q7', 'Qual afirmação sobre classes utilitárias, como as do Tailwind, está correta?', 'a', [
          'Funcionam em qualquer framework e trocam arquivos CSS próprios por classes pequenas combinadas na marcação',
          'Funcionam só em React, pois dependem do JSX para gerar as classes',
          'Impedem o uso de variáveis CSS e de temas escuros no projeto',
          'Garantem acessibilidade automática, sem precisar conferir contraste ou foco'
        ], 'Utilitários independem do framework. Eles convivem com variáveis CSS e não garantem acessibilidade; contraste e foco continuam sendo responsabilidade de quem constrói.'),
        fill('q8', 'Complete a função que lê o valor de uma variável CSS.', 'color: ___(--cor-texto);', ['var'], 'var(--nome) devolve o valor da custom property, permitindo trocar o tema mudando poucas variáveis.')
      ]
    },
    {
      id: 'fib-43-bibliotecas-de-componentes-de-ui',
      title: 'Bibliotecas de componentes de UI',
      goal: 'Entender por que e quando usar bibliotecas de componentes (Material, PrimeVue/PrimeNG, shadcn/ui, Chakra, Angular Material/CDK), como temas e tokens funcionam, o que a acessibilidade herdada não resolve, os custos de bundle, manutenção e licença, e quando construir o seu próprio.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que usar uma biblioteca pronta',
            'Um botão simples qualquer pessoa faz. Mas selects com busca, calendários, tabelas ordenáveis, modais e menus suspensos escondem muitos detalhes: navegação por teclado, foco, leitores de tela, casos de borda em celulares. Uma biblioteca de componentes de UI entrega esses blocos prontos, testados e com visual consistente, e economiza semanas de trabalho. Ela também serve de linguagem comum para a equipe: todo mundo usa o mesmo botão e o mesmo modal. O preço é depender de código de terceiros, o que as próximas telas detalham. A decisão não é "usar ou não usar", e sim quais componentes valem a dependência.'
          ),
          sl(
            'Exemplos por nome e dois estilos',
            'Exemplos, só para você reconhecer os nomes: Material UI e Chakra UI (React); shadcn/ui (React, com Tailwind, que copia o código dos componentes para o SEU projeto em vez de instalá-lo como pacote fechado); PrimeVue e Vuetify (Vue); Angular Material, PrimeNG e o CDK do Angular (Angular). Existem dois estilos. As bibliotecas ESTILIZADAS entregam componentes já com aparência (Material, Chakra, Prime). As HEADLESS (sem visual) entregam só o comportamento e a acessibilidade, e você aplica o seu CSS; o Angular CDK segue essa ideia, e o shadcn/ui usa primitivos headless por baixo. A citação de um nome não é recomendação nem ranking: compare com os critérios das próximas telas e leia a documentação da versão atual.'
          ),
          sl(
            'Temas e design tokens',
            'Para o app não ficar com a cara da biblioteca, você usa o TEMA. Um design token é um valor de design com nome: cor primária, espaçamento, raio de borda, tamanho de fonte. Um tema é um conjunto de tokens. Em vez de pintar cada botão, você troca o token e todos os componentes mudam. Bibliotecas expõem tokens como variáveis CSS (a ideia da lição de estilização) ou como um objeto de tema; trocar o tema claro pelo escuro costuma ser trocar um punhado de valores. Erro comum: sobrescrever estilos internos com seletores profundos em vez de usar tokens, o que quebra a cada atualização. O exemplo abaixo é JavaScript puro, executado de verdade: transforma tokens em variáveis CSS.',
            'const tokensClaro = { \'cor-primaria\': \'#6d28d9\', \'cor-fundo\': \'#ffffff\', \'espaco-2\': \'0.5rem\', \'raio\': \'6px\' };\nconst tokensEscuro = { ...tokensClaro, \'cor-fundo\': \'#121212\' };\n\nfunction paraCss(seletor, tokens) {\n  const linhas = Object.entries(tokens).map(([nome, valor]) => `  --${nome}: ${valor};`);\n  return `${seletor} {\\n${linhas.join(\'\\n\')}\\n}`;\n}\n\nconsole.log(paraCss(\':root\', tokensClaro));\nconsole.log(paraCss(\':root[data-theme="dark"]\', tokensEscuro));\n\n// Saída real:\n// :root {\n//   --cor-primaria: #6d28d9;\n//   --cor-fundo: #ffffff;\n//   --espaco-2: 0.5rem;\n//   --raio: 6px;\n// }\n// :root[data-theme="dark"] {\n//   --cor-primaria: #6d28d9;\n//   --cor-fundo: #121212;\n//   --espaco-2: 0.5rem;\n//   --raio: 6px;\n// }'
          ),
          sl(
            'Acessibilidade: o que vem pronto e o que é seu',
            'Uma biblioteca madura costuma implementar o difícil: ordem de foco, teclas de atalho, papéis e atributos ARIA dos componentes. É um grande ganho, mas não é garantia total. Continuam sendo SUA responsabilidade: textos e rótulos claros (um botão só com ícone precisa de nome acessível), alternativas em texto para imagens, contraste das cores quando você personaliza o tema, uma estrutura de página coerente, escolher o componente certo (link para navegar, botão para agir) e o conteúdo que você coloca dentro dos componentes. Teste com o teclado e, se puder, com um leitor de tela, como se verá na lição de acessibilidade mais adiante. Mesmo a melhor biblioteca pode ser usada de forma inacessível.'
          ),
          sl(
            'Custo em bundle, dependência e licença',
            'BUNDLE: tudo que você importa vai para o navegador, então uma biblioteca grande pesa no carregamento. Importe só os componentes que usa, com importações nomeadas; o build pode descartar o resto (tree-shaking, que remove código importado mas não usado), e vale medir o tamanho antes e depois. DEPENDÊNCIA E MANUTENÇÃO: você herda atualizações, mudanças que quebram a compatibilidade e correções de segurança. Antes de adotar, confira se o projeto tem manutenção ativa, histórico de respostas a falhas e compatibilidade com a versão do seu framework; depois, audite as dependências periodicamente. LICENÇAS, em visão geral: bibliotecas têm licenças diferentes (muitas permissivas, outras com condições, e alguns componentes avançados podem ser pagos). Confira a licença de CADA biblioteca e de cada pacote extra antes do uso comercial. Isso é orientação geral e não substitui análise jurídica.',
            '// ilustrativo, não executado aqui\n// Importação nomeada: o build consegue descartar o que não é usado\nimport { Button } from \'<biblioteca-de-ui>\';\n\n// Evite puxar a biblioteca inteira só para um componente\n// import * as UI from \'<biblioteca-de-ui>\';'
          ),
          sl(
            'Quando construir o seu próprio',
            'Construa o seu quando o componente é simples e o design é muito específico (um botão, um cartão, uma etiqueta): puxar uma dependência inteira por isso é exagero. Também faz sentido quando a empresa tem um design system próprio, com identidade que a biblioteca atrapalharia. Prefira o pronto quando o componente é complexo e crítico para acessibilidade (calendário, combobox, tabela com teclado), porque acertar tudo sozinho é caro. O caminho do meio são as bibliotecas headless e o CDK: comportamento e acessibilidade prontos, visual seu. Resumo de decisão: qual a complexidade? o design é único? quem mantém? quanto pesa? qual a licença? Decida por componente, não pelo projeto inteiro.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe precisa de um seletor com busca (combobox) acessível por teclado e leitor de tela, com prazo curto. Qual decisão faz mais sentido?', 'c', [
          'Construir com div e eventos de clique para ter controle total, já que o padrão é só um campo e uma lista',
          'Usar um input comum e esconder a lista com CSS, deixando a navegação por teclado para uma versão futura',
          'Adotar um componente de biblioteca madura ou um primitivo headless',
          'Copiar o código de um exemplo antigo da internet e ajustar as cores, sem conferir a licença nem o funcionamento'
        ], 'Combobox acessível tem muitos detalhes de foco, teclado e ARIA, e bibliotecas maduras já resolvem. Montar com div repete esses problemas, adiar teclado exclui pessoas e copiar sem conferir traz risco técnico e de licença.'),
        mcq('q2', 'O que é um design token?', 'a', [
          'Um valor de design com nome, como cor primária ou espaçamento, reaproveitado por todo o tema',
          'Um código secreto gerado pela biblioteca para autenticar o app no servidor de componentes',
          'Um componente que desenha ícones e imagens a partir de arquivos enviados pela equipe de design',
          'Um documento de licença que autoriza o uso comercial da biblioteca em projetos de clientes'
        ], 'Tokens nomeiam valores como cores e espaçamentos; trocar o token altera todos os componentes que o usam. Não são credenciais, nem componentes, nem licenças.'),
        mcq('q3', 'A equipe adotou uma biblioteca cujo modal já gerencia foco e teclado. O que continua sendo responsabilidade da equipe?', 'd', [
          'Nada, pois a biblioteca garante conformidade total e dispensa qualquer teste de acessibilidade',
          'Reescrever os atributos ARIA internos de cada componente, já que a biblioteca não os inclui',
          'A cor do botão, porque o restante do conteúdo do modal é acessível por padrão',
          'Rótulos claros, contraste do tema personalizado e testes com teclado'
        ], 'A biblioteca cobre o comportamento interno, mas rótulos, contraste e o uso correto são decisões da equipe, e testar continua necessário. Os atributos internos já vêm prontos e o conteúdo colocado no modal pode ter falhas.'),
        fill('q4', 'Complete o nome da técnica em que o build descarta código importado mas não usado.', 'Descartar código não usado no bundle = ___-shaking', ['tree', 'tree-shaking'], 'Tree-shaking remove do bundle o código que ninguém importa, e por isso importações nomeadas ajudam a reduzir o tamanho.'),
        mcq('q5', 'Uma biblioteca de UI aumentou bastante o tamanho do bundle. Qual prática ajuda de forma concreta?', 'b', [
          'Reunir todas as importações em um único arquivo central, para o navegador guardar tudo em cache',
          'Importar só os componentes usados, por importações nomeadas, e medir o bundle',
          'Mover a tag de script para o fim do HTML, o que faz o navegador baixar menos código',
          'Trocar de biblioteca sempre que sair uma versão nova, para ficar com a opção mais leve do momento'
        ], 'Importar só o necessário permite descartar o resto e medir mostra o resultado real. Centralizar importações aumenta o que é baixado, mudar o script de lugar não reduz o tamanho e trocar de biblioteca a cada versão gera retrabalho sem garantia.'),
        mcq('q6', 'Antes de adotar uma biblioteca de componentes, o que vale conferir?', 'c', [
          'A quantidade de estrelas no repositório e se o site da biblioteca tem uma boa aparência visual',
          'Se o nome do autor é conhecido e a data de criação da página de documentação é antiga',
          'Manutenção ativa, correções de segurança, compatibilidade e licença',
          'Se existe pelo menos um vídeo tutorial, o que prova que a biblioteca funciona em produção'
        ], 'Manutenção, segurança, compatibilidade e licença determinam o custo de longo prazo. Estrelas, aparência, autoria e tutoriais não dizem se ela será mantida nem se pode ser usada no seu produto.'),
        mcq('q7', 'Em qual situação construir o próprio componente costuma valer mais a pena do que usar uma biblioteca?', 'b', [
          'Um calendário com seleção de intervalos e navegação por teclado, para ter controle total de cada detalhe',
          'Um cartão ou etiqueta simples, com visual muito específico, em que uma dependência inteira seria exagero',
          'Uma tabela com ordenação, filtros e leitura por leitor de tela, porque bibliotecas limitam o design',
          'Qualquer componente de uma biblioteca gratuita, já que código gratuito não recebe correções de segurança'
        ], 'Componentes simples e muito específicos compensam o esforço próprio. Calendário e tabela acessíveis são complexos e caros de acertar sozinho, e ser gratuita não impede uma biblioteca de receber correções.'),
        fill('q8', 'Complete o que se deve conferir de cada biblioteca antes do uso em um produto comercial.', 'Antes de usar em produto comercial, confira a ___ de cada biblioteca e dos componentes extras.', ['licença', 'licenca'], 'A licença define o que é permitido (uso comercial, modificação, redistribuição) e varia entre bibliotecas e até entre pacotes da mesma família.')
      ]
    },
    {
      id: 'fib-32-acessibilidade-basica',
      title: 'Acessibilidade básica',
      goal: 'Aplicar semântica, rótulos de formulário, navegação por teclado, foco, textos alternativos e contraste, usando ARIA só quando necessário e testando com o teclado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que acessibilidade importa',
            'Acessibilidade (a11y) é construir interfaces que pessoas com diferentes necessidades consigam usar: quem navega só pelo teclado, usa leitor de tela, tem baixa visão, daltonismo ou deficiência motora, e também quem está em uma tela ruim ao sol. Não é um extra: costuma ser exigência de contratos e leis, e melhora a usabilidade para todos. Frameworks não a garantem sozinhos; ela depende do HTML que você escreve.'
          ),
          sl(
            'Semântica antes de tudo',
            'Use o elemento certo: button para ações, a para links, nav, main, header, h1 a h6 em ordem lógica, ul e li para listas. Elementos nativos já trazem teclado, foco e papel para leitores de tela de graça. Um div com onClick parece um botão, mas não recebe foco nem responde a Enter e Espaço. O erro clássico é recriar botões e links com div e span.',
            '<!-- ilustrativo, não executado aqui -->\n<!-- ruim: não recebe foco, leitor de tela não sabe que é botão -->\n<div class="botao" onclick="salvar()">Salvar</div>\n\n<!-- bom: nativo, com teclado e papel corretos -->\n<button type="button" onclick="salvar()">Salvar</button>'
          ),
          sl(
            'Rótulos de formulário e imagens',
            'Todo campo precisa de um rótulo associado: label com for apontando para o id do input (em React o atributo se chama htmlFor; em Vue e Angular usa-se for no template). Assim o leitor de tela anuncia o campo e clicar no texto foca o input. Placeholder não substitui rótulo. Imagens informativas precisam de alt descrevendo o conteúdo; imagens decorativas usam alt vazio (alt="").',
            '<!-- HTML puro, ilustrativo -->\n<label for="email">E-mail</label>\n<input id="email" type="email" name="email" autocomplete="email">\n\n<img src="grafico-vendas.png" alt="Gráfico: vendas cresceram de janeiro a março">\n<img src="enfeite.svg" alt="">'
          ),
          sl(
            'Teclado e foco',
            'Tudo que o mouse faz deve ser possível pelo teclado: Tab avança entre elementos interativos, Shift+Tab volta, Enter e Espaço ativam botões. O foco precisa ser visível: nunca remova o contorno (outline) sem oferecer outro estilo equivalente. Em SPAs, ao trocar de rota ou abrir um modal, mova o foco para o conteúdo novo (por exemplo o título) e devolva o foco ao ponto de origem quando o modal fechar. Evite tabindex positivo; tabindex="0" inclui um elemento na ordem e -1 permite focar por código.'
          ),
          sl(
            'Contraste, tamanho e movimento',
            'Texto precisa de contraste suficiente com o fundo (as diretrizes WCAG definem proporções mínimas; use uma ferramenta de verificação). Não use só a cor para comunicar algo (um erro marcado apenas em vermelho some para daltônicos: acrescente texto ou ícone). Respeite zoom e tamanhos relativos, e reduza animações para quem pede isso com a media query prefers-reduced-motion.'
          ),
          sl(
            'ARIA só quando necessário',
            'ARIA são atributos (role, aria-label, aria-expanded...) que complementam a semântica quando o HTML nativo não basta, como em um menu retrátil customizado. A regra de ouro: se existe um elemento nativo que faz o trabalho, use-o em vez de ARIA. ARIA errado é pior que nenhum, porque promete um comportamento que não existe. aria-label dá nome a um controle sem texto visível, como um botão só com ícone.',
            '<!-- ilustrativo, não executado aqui -->\n<button type="button" aria-label="Fechar janela">X</button>\n\n<button type="button" aria-expanded="false" aria-controls="menu">Menu</button>\n<ul id="menu" hidden>...</ul>'
          ),
          sl(
            'Testando com o teclado',
            'O teste mais barato: abra seu app, guarde o mouse e use só Tab, Shift+Tab, Enter, Espaço e Esc. Dá para chegar em tudo? A ordem faz sentido? Você sempre vê onde está o foco? Complemente com a auditoria do DevTools (por exemplo o Lighthouse), com extensões como o axe e, quando possível, com um leitor de tela e com testes de usuários reais. Ferramentas automáticas pegam só parte dos problemas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que usar button em vez de div com onClick para uma ação?', 'b', [
          'O button é mais rápido que o div porque o navegador o desenha com aceleração de vídeo',
          'O button nativo já recebe foco, responde a Enter e Espaço e é anunciado como botão por leitores de tela',
          'O div com onClick é recusado pelo navegador moderno e gera erro ao carregar a página',
          'O button elimina a necessidade de CSS, pois já vem com o design final do produto'
        ], 'Elementos nativos trazem acessibilidade pronta. O ganho não é de desempenho, o div com onClick funciona com mouse e o button ainda precisa de estilo.'),
        mcq('q2', 'Qual a forma correta de associar um rótulo a um campo de formulário?', 'd', [
          'Colocar o texto do rótulo no placeholder do input e dispensar o label',
          'Usar um parágrafo logo acima do input, sem ligação programática entre eles além da posição na página',
          'Escrever o rótulo dentro do atributo name do input',
          'Um label com for apontando para o id do input, que em React se escreve htmlFor'
        ], 'A associação programática por for e id faz o leitor de tela anunciar o campo e permite clicar no texto. Placeholder some ao digitar, parágrafo solto não liga ao campo e name serve ao envio de dados.'),
        mcq('q3', 'Um desenvolvedor remove o contorno de foco com outline: none para o visual ficar limpo. Qual o problema?', 'b', [
          'Não há problema, pois o foco só é útil para usuários de mouse que clicam nos campos',
          'Quem navega por teclado perde a referência de onde está, a menos que exista um estilo de foco alternativo visível',
          'O navegador deixa de executar o JavaScript dos elementos que ficam sem contorno',
          'O leitor de tela passa a ler todo o conteúdo duas vezes em voz mais alta'
        ], 'O foco visível é essencial para o teclado. Removê-lo sem substituto torna a navegação cega; não afeta a execução de JS nem duplica a leitura.'),
        fill('q4', 'Complete o atributo que descreve uma imagem informativa.', '<img src="grafico.png" ___="Vendas por mês">', ['alt'], 'O atributo alt dá o texto alternativo lido por leitores de tela e exibido se a imagem falhar.'),
        mcq('q5', 'Um botão tem só um ícone de lixeira. Como dar nome acessível a ele?', 'c', [
          'Deixar sem nome, pois o leitor de tela descreve o desenho do ícone sozinho ao encontrar o botão',
          'Colocar alt="" no botão para indicar que é decorativo',
          'Adicionar aria-label com a ação, como "Excluir tarefa", ou texto oculto visualmente',
          'Trocar o botão por um div com a mesma aparência e um title vazio'
        ], 'Controles sem texto precisam de nome acessível; aria-label resolve. Leitores não interpretam desenhos, alt vazio esconderia o controle e um div com title vazio piora a situação.'),
        mcq('q6', 'Qual é a regra de ouro sobre o uso de ARIA?', 'a', [
          'Preferir elementos HTML nativos e usar ARIA só quando o nativo não resolve',
          'Adicionar role e aria-label em cada elemento da página, para o leitor de tela ter mais informação',
          'Usar ARIA no lugar de HTML semântico, já que ele é mais moderno',
          'Evitar ARIA em qualquer caso, pois leitores de tela ignoram esses atributos'
        ], 'ARIA complementa, não substitui a semântica nativa, e ARIA incorreto atrapalha. Leitores de tela usam esses atributos, então ignorá-los também não é verdade.'),
        mcq('q7', 'Um campo com erro é marcado apenas com borda vermelha. Qual a melhoria?', 'd', [
          'Deixar como está, pois a maioria das pessoas distingue vermelho do restante das cores',
          'Trocar o vermelho por um vermelho mais escuro sem acrescentar nada além disso à mensagem do campo',
          'Remover a borda e deixar o usuário descobrir o erro ao enviar o formulário',
          'Acrescentar uma mensagem de texto e, se possível, um ícone, para não depender só da cor'
        ], 'A cor sozinha não comunica a quem tem daltonismo ou baixa visão; texto e ícone resolvem. Um vermelho mais escuro mantém a dependência da cor e esconder o erro piora.'),
        fill('q8', 'Complete o atributo que dá nome acessível a um botão só com ícone.', '<button type="button" ___="Fechar janela">X</button>', ['aria-label'], 'aria-label fornece o nome lido por tecnologias assistivas quando não há texto visível descritivo.')
      ]
    },
    {
      id: 'fib-33-formularios-e-validacao-conceitos',
      title: 'Formulários e validação: conceitos',
      goal: 'Diferenciar validação no cliente (experiência) da validação no servidor (segurança), tratar estados touched e dirty, mensagens acessíveis, máscara versus validação, com um validador em JavaScript puro.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Validar no cliente é experiência, validar no servidor é segurança',
            'A validação no navegador (campo obrigatório, formato de e-mail, tamanho mínimo) dá resposta rápida e evita viagens ao servidor: é UX. Mas qualquer pessoa pode desligar o JavaScript, alterar o HTML ou chamar a API direto, então o servidor deve validar TUDO de novo e tratar o cliente como não confiável. As duas validações se complementam; só a do servidor é uma barreira de segurança. Veja o curso de Segurança Web (OWASP) para a validação de entrada no back-end.'
          ),
          sl(
            'Estados do campo: touched e dirty',
            'Mostrar erro enquanto a pessoa ainda não terminou de digitar incomoda. Os formulários modelam estados: touched (o campo já recebeu e perdeu o foco), dirty (o valor já foi alterado), pristine (intacto) e submitted (houve tentativa de envio). A regra comum: exiba o erro de um campo quando ele estiver touched ou depois de uma tentativa de envio. Angular tem esses estados prontos nos formulários; React e Vue usam estado próprio ou bibliotecas de formulário (por exemplo React Hook Form, VeeValidate).'
          ),
          sl(
            'Mensagens de erro acessíveis',
            'A mensagem deve dizer o que corrigir ("Informe um e-mail no formato nome@dominio"), ficar junto do campo e ser ligada a ele para leitores de tela: aria-describedby aponta o id da mensagem, e aria-invalid indica o campo inválido. Regiões com aria-live avisam mudanças dinâmicas. Não use só cor. Ao enviar com erros, leve o foco ao primeiro campo inválido ou a um resumo de erros.',
            '<!-- ilustrativo, não executado aqui -->\n<label for="email">E-mail</label>\n<input id="email" type="email" aria-invalid="true" aria-describedby="email-erro">\n<p id="email-erro">Informe um e-mail no formato nome@dominio.</p>'
          ),
          sl(
            'Máscara não é validação',
            'Máscara de entrada formata enquanto se digita (como inserir pontos e traço em um número). Ela ajuda a leitura, mas não prova que o dado é válido nem seguro, e atrapalha quando é rígida demais (nomes, telefones internacionais). Guarde e envie o valor normalizado, sem a formatação, e valide a regra de verdade (formato, tamanho, dígito verificador quando existir). Use sempre dados de exemplo fictícios nos testes, nunca documentos reais de pessoas.'
          ),
          sl(
            'Validador em JavaScript puro',
            'O código abaixo valida um cadastro fictício e devolve um objeto de erros por campo. A mesma função pode rodar no navegador (para dar resposta rápida) e no servidor (para ser a barreira real). Os dados de teste são inventados.',
            'function validarCadastro(d) {\n  const erros = {};\n  const nome = String(d.nome ?? \'\').trim();\n  if (nome.length < 2 || nome.length > 80) erros.nome = \'Informe o nome (2 a 80 caracteres).\';\n\n  const email = String(d.email ?? \'\').trim();\n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) erros.email = \'Informe um e-mail no formato nome@dominio.\';\n\n  const idade = Number(d.idade);\n  if (!Number.isInteger(idade) || idade < 18 || idade > 120) erros.idade = \'Idade deve ser um inteiro entre 18 e 120.\';\n\n  const senha = String(d.senha ?? \'\');\n  if (senha.length < 12) erros.senha = \'A senha precisa de pelo menos 12 caracteres.\';\n\n  return { valido: Object.keys(erros).length === 0, erros };\n}\n\nconsole.log(validarCadastro({ nome: \'Ana Exemplo\', email: \'ana@example.com\', idade: \'30\', senha: \'uma-frase-longa-123\' }));\nconsole.log(validarCadastro({ nome: \'A\', email: \'sem-arroba\', idade: \'17\', senha: \'curta\' }));\n\n// saída real (executado com Node):\n// { valido: true, erros: {} }\n// {\n//   valido: false,\n//   erros: {\n//     nome: \'Informe o nome (2 a 80 caracteres).\',\n//     email: \'Informe um e-mail no formato nome@dominio.\',\n//     idade: \'Idade deve ser um inteiro entre 18 e 120.\',\n//     senha: \'A senha precisa de pelo menos 12 caracteres.\'\n//   }\n// }'
          ),
          sl(
            'Erros comuns',
            'Validar só no cliente. Mostrar erro antes de a pessoa interagir. Mensagens vagas ("campo inválido"). Placeholder no lugar de label. Bloquear colar em campos de senha, o que atrapalha gerenciadores de senha. Pedir dados desnecessários: cada campo a mais é mais risco e menos conversão, e a LGPD valoriza a minimização (veja a lição de privacidade).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um formulário valida o e-mail no JavaScript, mas o servidor aceita qualquer valor que chegue. Qual o problema?', 'b', [
          'Não há problema, pois o JavaScript do navegador é executado em ambiente protegido contra alterações',
          'A validação do cliente pode ser contornada, então o servidor também precisa validar',
          'O problema só ocorre se o e-mail contiver letras maiúsculas ou acentos nos caracteres',
          'O servidor não consegue ler o campo e-mail porque ele foi validado antes de enviado'
        ], 'O navegador é controlado pelo usuário; chamadas diretas à API pulam o JS. O servidor é a barreira real. Maiúsculas e a suposta ilegibilidade não têm relação.'),
        mcq('q2', 'O que significa um campo estar touched?', 'd', [
          'Ele teve o valor alterado ao menos uma vez desde que a página abriu, mesmo sem ter recebido foco',
          'Ele foi preenchido corretamente e passou em todas as regras',
          'Ele está desabilitado e não aceita mais edição',
          'Ele já recebeu e perdeu o foco, e por isso pode mostrar erros'
        ], 'Touched é sobre foco (entrou e saiu). Alterar o valor é dirty, e estar correto ou desabilitado são outras coisas.'),
        mcq('q3', 'Qual mensagem de erro é mais útil à pessoa?', 'a', [
          'Informe um e-mail no formato nome@dominio.',
          'Campo inválido.',
          'Erro 422: falha de validação na entidade Usuario, campo email_address',
          'Algo deu errado, tente novamente mais tarde'
        ], 'A mensagem boa diz o que corrigir, sem jargão. As demais são vagas, técnicas demais ou não ajudam a corrigir o campo.'),
        fill('q4', 'Complete o atributo que liga o campo à mensagem de erro para leitores de tela.', '<input id="email" ___="email-erro">', ['aria-describedby'], 'aria-describedby aponta o id do elemento com a descrição, aqui a mensagem de erro, para ser anunciada junto do campo.'),
        mcq('q5', 'Uma máscara formata o número enquanto a pessoa digita. O que ela garante?', 'c', [
          'A validade do dado, pois só deixa passar números corretos dentro do formato esperado',
          'A segurança do dado, que fica criptografado no campo',
          'Só a formatação visual, sem provar que o dado é válido ou seguro',
          'A conferência no servidor, que passa a ser desnecessária'
        ], 'Máscaras só formatam; validar e proteger são etapas separadas. Elas não criptografam nem dispensam o servidor.'),
        mcq('q6', 'Quando exibir o erro de um campo, na regra mais comum?', 'd', [
          'Logo no primeiro caractere, antes de a pessoa terminar de digitar o valor',
          'Só quando o servidor responder, e não durante o preenchimento',
          'Antes de a pessoa abrir a página, para já avisar tudo que será exigido no formulário completo',
          'Quando o campo estiver touched ou depois de uma tentativa de envio do formulário'
        ], 'Mostrar erro cedo demais incomoda; só no servidor perde a resposta rápida; antes da página abrir é impossível. A regra equilibra os dois.'),
        mcq('q7', 'Qual prática de formulário de senha é considerada ruim?', 'b', [
          'Exigir comprimento mínimo maior para frases longas',
          'Bloquear o colar no campo, o que atrapalha gerenciadores de senha',
          'Permitir espaços e símbolos na senha',
          'Oferecer um botão para mostrar a senha digitada'
        ], 'Bloquear o colar impede gerenciadores de senha e leva a senhas piores. As outras práticas ajudam o usuário.'),
        fill('q8', 'Complete o atributo que marca o campo como inválido para tecnologias assistivas.', '<input id="email" ___="true">', ['aria-invalid'], 'aria-invalid="true" avisa leitores de tela que o valor atual é inválido.')
      ]
    },
    {
      id: 'fib-34-seguranca-basica-no-frontend',
      title: 'Segurança básica no front-end',
      goal: 'Entender XSS e o escape automático dos frameworks, os riscos de innerHTML, v-html e dangerouslySetInnerHTML, onde guardar tokens, por que segredos não ficam no bundle e o cuidado com dependências.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Tudo que roda no navegador é do usuário',
            'O código do front-end é baixado e executado na máquina do usuário, que pode ler e alterar tudo: JavaScript, variáveis, chamadas de rede. Por isso o front nunca é a barreira de segurança, apenas a interface. As decisões de autenticação, autorização e validação precisam estar no servidor. Esta lição dá a visão do front-end; para a visão completa, veja o curso de Segurança Web (OWASP).'
          ),
          sl(
            'XSS: o que é',
            'XSS (cross-site scripting) acontece quando conteúdo controlado por outra pessoa (um comentário, um nome, um parâmetro da URL) é inserido na página como HTML ou script em vez de texto. O código malicioso passaria a rodar no navegador de quem visita, com acesso ao que aquela página acessa. A defesa central é tratar dados como TEXTO e escapar os caracteres especiais do HTML (< > & aspas) antes de exibir.'
          ),
          sl(
            'Os três frameworks escapam por padrão',
            'Interpolar texto escapa automaticamente: {valor} em React/JSX, {{ valor }} em Vue e Angular. Ou seja, o texto aparece na tela como texto. O perigo está nas saídas que desligam o escape: dangerouslySetInnerHTML (React), v-html (Vue), [innerHTML] e os métodos bypassSecurityTrust* (Angular), além de innerHTML puro. O nome "dangerously" é um aviso: só use com HTML que você gerou ou que passou por um sanitizador confiável (como o DOMPurify) e, mesmo assim, avalie se é necessário.',
            '// ilustrativo, não executado aqui\n// ARRISCADO: o texto vira HTML sem escape\n<div dangerouslySetInnerHTML={{ __html: comentario }} />   // React\n<div v-html="comentario"></div>                            <!-- Vue -->\n<div [innerHTML]="comentario"></div>                       <!-- Angular -->\n\n// SEGURO: texto escapado automaticamente\n<div>{comentario}</div>          // React\n<div>{{ comentario }}</div>      <!-- Vue e Angular -->'
          ),
          sl(
            'Escape de HTML na prática (executável)',
            'O que o framework faz por baixo é parecido com esta função, que troca os caracteres especiais por entidades. O exemplo mostra uma versão arriscada (concatenar texto em HTML) e a corrigida. O texto de teste é apenas uma marcação inofensiva, para ver o efeito sem nada executável.',
            'const comentario = \'Gostei do <b>curso</b> & dos exemplos\';\n\n// ARRISCADO: o texto do usuário é concatenado como HTML\nconst arriscado = \'<p>\' + comentario + \'</p>\';\n\n// CORRIGIDO: caracteres especiais viram entidades antes de entrar no HTML\nfunction escaparHtml(texto) {\n  return String(texto)\n    .replace(/&/g, \'&amp;\')\n    .replace(/</g, \'&lt;\')\n    .replace(/>/g, \'&gt;\')\n    .replace(/"/g, \'&quot;\')\n    .replace(/\'/g, \'&#39;\');\n}\nconst seguro = \'<p>\' + escaparHtml(comentario) + \'</p>\';\n\nconsole.log(\'arriscado:\', arriscado);\nconsole.log(\'seguro   :\', seguro);\n\n// saída real (executado com Node):\n// arriscado: <p>Gostei do <b>curso</b> & dos exemplos</p>\n// seguro   : <p>Gostei do &lt;b&gt;curso&lt;/b&gt; &amp; dos exemplos</p>'
          ),
          sl(
            'Tokens e segredos',
            'Onde guardar o token de sessão? Em localStorage ele fica acessível a qualquer script da página, então uma falha de XSS o expõe. Prefira um cookie HttpOnly (JavaScript não consegue lê-lo) com Secure e SameSite, emitido pelo servidor. Segredos (chaves privadas, senhas de banco, tokens de serviços) NUNCA vão para o código do front: tudo no bundle é público, mesmo em variáveis de ambiente de build como as com prefixo VITE_. Só valores públicos (como <CHAVE_PUBLICA> de um serviço feito para isso) podem ir ao front.'
          ),
          sl(
            'Dependências, HTTPS e CSP',
            'Um app moderno carrega centenas de pacotes npm: cada um é código de terceiros rodando no seu site. Mantenha dependências atualizadas, use o lockfile, rode npm audit ou ferramenta equivalente e desconfie de pacotes desnecessários. Sirva tudo por HTTPS. A política CSP (Content Security Policy), configurada pelo servidor em cabeçalho, limita de onde scripts podem ser carregados e reduz o estrago de um XSS. Nunca renderize HTML de fontes não confiáveis sem sanitização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um comentário de usuário é exibido com {comentario} no JSX. O que o React faz com caracteres como < e > nesse texto?', 'a', [
          'Escapa o conteúdo, de modo que apareça como texto na tela e não seja interpretado como HTML',
          'Interpreta como HTML e executa qualquer marcação que o comentário contiver',
          'Remove os caracteres especiais do texto sem avisar a pessoa',
          'Envia o comentário ao servidor para ser sanitizado antes de exibir'
        ], 'A interpolação do JSX escapa por padrão, tratando o valor como texto. O React não interpreta o conteúdo como HTML, nem apaga caracteres, nem consulta o servidor.'),
        mcq('q2', 'Qual destas opções desliga o escape automático e exige cuidado extra?', 'c', [
          '{{ valor }} com a interpolação normal do template do Vue',
          'O atributo key dentro de uma lista com v-for, que identifica cada item da lista renderizada',
          'v-html no Vue (e o equivalente dangerouslySetInnerHTML no React)',
          'O uso de ref para guardar o estado reativo de um contador'
        ], 'v-html insere HTML sem escape. A interpolação escapa, key identifica itens e ref guarda estado: nenhum deles interpreta texto como HTML.'),
        mcq('q3', 'Onde é mais seguro guardar o token de sessão de um usuário?', 'b', [
          'Em localStorage, que é lido por qualquer script da própria página, pois persiste mesmo depois de fechar o navegador',
          'Em um cookie HttpOnly, com Secure e SameSite, definido pelo servidor',
          'Em uma variável global de JavaScript chamada token',
          'Dentro da URL, como parâmetro, para facilitar o compartilhamento'
        ], 'HttpOnly impede que scripts leiam o cookie, reduzindo o roubo por XSS. localStorage e variáveis globais são legíveis por scripts e a URL vaza em históricos e logs.'),
        fill('q4', 'Complete a função de escape com a entidade do caractere maior que.', '.replace(/>/g, \'___\')', ['&gt;'], '&gt; é a entidade HTML do sinal de maior; assim o navegador exibe o caractere em vez de interpretá-lo como marcação.'),
        mcq('q5', 'Um desenvolvedor coloca uma chave secreta de API de pagamentos em uma variável VITE_CHAVE. O que acontece?', 'a', [
          'A chave entra no bundle e fica visível a qualquer pessoa que abra o código da página',
          'A chave fica protegida, pois o prefixo VITE_ a criptografa durante o build',
          'A chave só é visível para o desenvolvedor, que usa o mesmo navegador em que publicou o site',
          'A chave é removida do bundle automaticamente na hora de publicar'
        ], 'Variáveis com esse prefixo são embutidas no JavaScript público. Não há criptografia, restrição por navegador nem remoção automática. Segredos ficam no servidor.'),
        mcq('q6', 'Para que serve um sanitizador como o DOMPurify?', 'd', [
          'Criptografar o HTML para que o navegador do usuário não consiga lê-lo',
          'Validar o formulário no servidor antes de gravar o comentário',
          'Acelerar a renderização do HTML por meio de cache nos componentes',
          'Limpar um HTML não confiável, removendo partes perigosas, quando exibir HTML for realmente necessário'
        ], 'Sanitizadores filtram marcação perigosa de HTML de origem não confiável. Não criptografam, não validam formulários e não cuidam de desempenho.'),
        mcq('q7', 'Qual prática ajuda a reduzir o risco vindo de pacotes npm de terceiros?', 'c', [
          'Instalar qualquer pacote que prometa resolver o problema, sem ler quem o mantém',
          'Copiar o código dos pacotes para dentro do projeto e deixar de atualizar ou conferir se surgiram correções',
          'Manter o lockfile, atualizar com critério e rodar auditorias de dependências com frequência',
          'Desativar o HTTPS em ambiente de produção para o bundle ficar menor'
        ], 'Auditar e atualizar dependências reduz o risco da cadeia de suprimentos. Instalar sem critério, congelar cópias e desligar o HTTPS aumentam o risco.'),
        fill('q8', 'Complete o nome do atributo de cookie que impede o JavaScript de ler o token.', 'Set-Cookie: sessao=<TOKEN>; ___; Secure; SameSite=Lax', ['HttpOnly'], 'HttpOnly proíbe o acesso ao cookie via document.cookie, reduzindo o impacto de um XSS.')
      ]
    },
    {
      id: 'fib-35-privacidade-e-lgpd-no-frontend',
      title: 'Privacidade e LGPD no front-end',
      goal: 'Aplicar minimização, consentimento de cookies, cuidado com analytics e rastreadores de terceiros e com dados pessoais no navegador, com a visão geral da LGPD e a ressalva jurídica.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o front-end importa para a privacidade',
            'O front-end é onde os dados pessoais são coletados (formulários), guardados no navegador (cookies, localStorage), enviados a terceiros (analytics, anúncios, fontes, vídeos incorporados) e mostrados na tela. Cada uma dessas decisões é sua. A LGPD (Lei 13.709/2018) é a lei brasileira de proteção de dados pessoais; aqui ela entra só em visão geral, e este conteúdo não substitui orientação jurídica: para decisões do seu projeto, consulte quem entende do assunto na sua organização.'
          ),
          sl(
            'Dado pessoal e minimização',
            'Dado pessoal é a informação relacionada a uma pessoa identificada ou identificável: nome, e-mail, CPF, telefone, endereço, IP, identificadores de dispositivo e de rastreio, localização. O princípio da minimização diz para coletar e guardar só o que é necessário para a finalidade informada. Antes de criar um campo, pergunte: preciso mesmo disso? Por quanto tempo? Quem acessa? Quem não tem resposta para essas perguntas ainda não deveria coletar o dado. Em exemplos e testes, use sempre dados fictícios, como usuario@example.com.'
          ),
          sl(
            'Cookies e consentimento',
            'Cookies estritamente necessários (como o de sessão) funcionam sem pedir consentimento, em geral. Cookies de análise, personalização e publicidade normalmente exigem informação clara e uma escolha da pessoa, que deve ser livre e fácil de desfazer: recusar precisa ser tão simples quanto aceitar, e nada além do necessário pode ser carregado antes da escolha. Banners de consentimento são feitos com bibliotecas ou plataformas próprias; as regras exatas dependem do caso e do jurídico. O código deve respeitar a escolha: sem consentimento, os scripts de analytics não são carregados.',
            '// ilustrativo, não executado aqui\nfunction carregarAnalytics() {\n  // injeta o script de terceiros só depois do consentimento\n}\nconst consentimento = lerEscolhaDoUsuario();   // \'aceito\' | \'recusado\' | null\nif (consentimento === \'aceito\') carregarAnalytics();'
          ),
          sl(
            'Analytics e terceiros',
            'Cada script de terceiros (analytics, chat, mapa, vídeo, fonte hospedada fora, pixel de anúncios) pode receber IP, página visitada e identificadores, e roda com os poderes da sua página. Faça um inventário: o que carrega, para quê, para onde envia dados. Prefira ferramentas com foco em privacidade, anonimização e IP truncado quando possível, e hospede ativos (como fontes) você mesmo quando fizer sentido. Não envie dados pessoais em URLs, títulos de página ou eventos de analytics (e-mails e nomes em query string acabam em logs de terceiros).'
          ),
          sl(
            'localStorage, logs e a tela',
            'localStorage e sessionStorage são legíveis por qualquer script da página (e por XSS) e não expiram sozinhos: guarde ali só preferências inofensivas (tema, idioma) e evite dados pessoais e tokens. Se for realmente necessário guardar algo pessoal no navegador, defina prazo, limpe ao sair e explique ao usuário. Nos logs e relatórios de erro (console, Sentry e semelhantes), não registre dados pessoais nem corpos de formulários. Na tela, mostre só o necessário: máscaras como "***.456.789-**" em documentos reduzem a exposição.',
            '// ilustrativo, não executado aqui\n// bom: preferência sem dado pessoal\nlocalStorage.setItem(\'tema\', \'escuro\');\n\n// evitar: dados pessoais e credenciais no armazenamento do navegador\n// localStorage.setItem(\'cpf\', ...);  localStorage.setItem(\'token\', ...);'
          ),
          sl(
            'Direitos das pessoas e boas práticas',
            'A LGPD prevê direitos para os titulares dos dados, como saber o que é tratado, corrigir e pedir a exclusão, em visão geral. Do lado do front, isso se traduz em telas e fluxos: página de política de privacidade clara, forma de gerenciar consentimentos, possibilidade de excluir a conta ou solicitar dados. Documente o que coleta. Comunique de forma simples, sem textos intermináveis. Lembre: segurança (cookies HttpOnly, HTTPS, sem XSS) e privacidade andam juntas. Para detalhes legais, consulte o jurídico ou o encarregado de dados da organização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa o princípio da minimização de dados?', 'a', [
          'Coletar e guardar apenas os dados necessários para a finalidade informada ao usuário',
          'Comprimir os dados pessoais para ocuparem o menor espaço possível no servidor',
          'Coletar o máximo de dados possível agora, para decidir depois o que fazer com eles, porque dado coletado cedo vale mais',
          'Apagar os dados pessoais do navegador assim que a página termina de carregar'
        ], 'Minimizar é restringir a coleta ao necessário, com finalidade definida. Compactar arquivos não é isso, acumular dados sem propósito contraria o princípio e apagar ao carregar não é o conceito.'),
        mcq('q2', 'Antes de a pessoa escolher, o que um site que respeita consentimento deve fazer com scripts de analytics de publicidade?', 'd', [
          'Carregá-los normalmente e só esconder o banner depois que a pessoa aceitar',
          'Carregá-los e só pedir ao usuário que feche a aba caso não concorde',
          'Carregá-los em segundo plano e coletar dados sem salvar identificador no navegador',
          'Não carregá-los até que haja consentimento, quando ele for exigido para essa finalidade'
        ], 'O código deve respeitar a escolha e não disparar rastreamento antes dela. Os outros caminhos coletam dados sem consentimento, só mudando a aparência.'),
        mcq('q3', 'Qual destes dados NÃO deve ser guardado em localStorage?', 'c', [
          'A preferência de tema claro ou escuro',
          'O idioma escolhido na interface do site',
          'O token de sessão e dados pessoais como o CPF do usuário',
          'O estado de abertura de um menu lateral'
        ], 'localStorage é legível por scripts da página, inclusive em caso de XSS, e não expira sozinho. Preferências inofensivas são adequadas; credenciais e dados pessoais não.'),
        fill('q4', 'Complete o nome do princípio de coletar só o necessário.', 'Princípio da ___ de dados (coletar só o necessário)', ['minimização', 'minimizacao'], 'A minimização limita a coleta e o armazenamento ao necessário para a finalidade.'),
        mcq('q5', 'Um desenvolvedor coloca o e-mail do usuário na query string de eventos de analytics, como ?email=usuario@example.com. Qual o problema?', 'b', [
          'Não há problema, pois a query string é sempre criptografada pelo HTTPS no caminho todo',
          'O dado pessoal vai parar em logs e sistemas de terceiros, ampliando a exposição sem necessidade',
          'O problema é só estético, porque a URL fica mais longa do que o recomendado',
          'O analytics deixa de funcionar, pois não aceita parâmetros com arroba'
        ], 'Mesmo com HTTPS, a URL é registrada por quem a recebe e aparece em logs. Evitar dados pessoais em eventos é minimização. O problema não é estético nem técnico de arroba.'),
        mcq('q6', 'Qual é a afirmação mais adequada sobre este material e a LGPD?', 'b', [
          'Ele substitui a consulta ao jurídico, pois contém todas as regras e prazos da lei',
          'Ele dá uma visão geral para desenvolvedores e não substitui orientação jurídica sobre o seu projeto',
          'Ele garante que seguir estas lições deixa qualquer site em conformidade total',
          'Ele lista multas e artigos específicos que devem ser decorados para a prova'
        ], 'A LGPD tem detalhes que dependem do contexto; o curso é educacional. Ele não promete conformidade, não substitui o jurídico e não lista multas.'),
        mcq('q7', 'Ao registrar um erro de formulário no serviço de monitoramento, o que fazer?', 'a', [
          'Registrar o tipo do erro e o contexto técnico, sem incluir os valores digitados pelo usuário',
          'Registrar o corpo completo do formulário para facilitar a reprodução do erro',
          'Registrar o token de sessão do usuário junto do erro para identificar quem foi afetado e reproduzir a falha depois',
          'Registrar as senhas digitadas, mascaradas só no painel do monitoramento'
        ], 'Logs não devem conter dados pessoais nem credenciais. O tipo do erro basta para diagnosticar. Mascarar só na exibição não evita que o dado já tenha sido armazenado.'),
        fill('q8', 'Complete o nome do armazenamento do navegador adequado só a preferências inofensivas, como tema.', '___.setItem(\'tema\', \'escuro\');', ['localStorage', 'sessionStorage'], 'localStorage (ou sessionStorage) guarda pares chave e valor no navegador; use só para dados sem risco, como o tema.')
      ]
    },
    {
      id: 'fib-36-depuracao-devtools-e-ferramentas',
      title: 'Depuração: DevTools e ferramentas',
      goal: 'Usar Elements, Console, Network e Sources do navegador, as extensões de React, Vue e Angular, entender source maps e depurar estado e erros comuns de console.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'DevTools: o painel que você mais vai usar',
            'Todo navegador moderno traz as DevTools (geralmente com F12 ou Ctrl+Shift+I). Quatro painéis resolvem a maior parte dos problemas. Elements: mostra o DOM atual e o CSS aplicado a cada elemento, permite editar e ver o efeito ao vivo. Console: mensagens, erros e avisos do JavaScript, além de uma linha para testar código. Network: cada requisição, com URL, método, status, tempo, cabeçalhos e corpo. Sources: o código-fonte, para pausar a execução com breakpoints.'
          ),
          sl(
            'Network e Console no dia a dia',
            'No Network, confira se a requisição saiu (URL e método certos), qual status voltou (200, 404, 500) e o que há na resposta (aba Response ou Preview). Falhou por CORS? A requisição aparece como bloqueada e o Console explica. Dá para simular rede lenta (throttling) para ver estados de carregamento e marcar Preserve log para não perder o histórico ao navegar. No Console, use console.log com moderação e NÃO registre dados pessoais, tokens ou senhas: o que vai para o console pode acabar em capturas de tela e relatórios de erro.',
            '// ilustrativo, executável no Console do navegador\nconsole.log(\'estado\', estado);          // valor simples\nconsole.table(listaDeTarefas);          // lista como tabela\nconsole.error(\'Falha ao salvar\', e.name);  // erro, sem dados pessoais\ndebugger;                                // pausa aqui se as DevTools estiverem abertas'
          ),
          sl(
            'Breakpoints e depuração passo a passo',
            'Em Sources, clique no número da linha para criar um breakpoint: a execução pausa ali e você vê os valores das variáveis, a pilha de chamadas (call stack) e pode avançar linha a linha (step over, step into). É mais preciso que espalhar console.log: você inspeciona qualquer variável sem alterar o código. Em eventos de clique ou mudança de estado, use também os breakpoints de evento.'
          ),
          sl(
            'Source maps',
            'O código que chega ao navegador foi minificado e empacotado, e o erro aponta para app.3f9a.js linha 1. Um source map é um arquivo que liga esse código gerado ao seu código original, permitindo ver nomes e linhas reais no DevTools. Em desenvolvimento ele vem ligado. Em produção, publicar source maps expõe seu código-fonte original: decida conscientemente (muitas equipes os enviam só ao serviço de monitoramento de erros). Lembre que o bundle já é público e não deve conter segredos.'
          ),
          sl(
            'DevTools de React, Vue e Angular',
            'As três comunidades mantêm extensões para o navegador. React DevTools: árvore de componentes, props e estado de cada um e o Profiler (mostra o que renderizou e por quê). Vue DevTools: árvore de componentes, estado reativo, eventos, roteador e stores da Pinia, com viagem no tempo. Angular DevTools: árvore de componentes e o profiler de detecção de mudanças. Todas servem para responder: qual componente tem este valor de estado agora, e por que ele mudou?'
          ),
          sl(
            'Erros comuns de console e como depurar estado',
            'Erros frequentes: "Cannot read properties of undefined (reading map)" (você leu um dado antes de ele chegar: trate o carregamento ou use valor padrão); aviso de key ausente em listas (falta key estável no item); "Failed to fetch" ou bloqueio de CORS (veja o Network e o servidor); "x is not a function" (tipo errado, confira a importação). Para depurar estado, reproduza o bug com passos mínimos, olhe o estado na DevTools do framework, reduza o problema e só depois mexa no código. Leia a mensagem de erro inteira, de cima para baixo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma lista não aparece e você suspeita que a API devolveu erro. Qual painel mostra o status HTTP e o corpo da resposta?', 'd', [
          'Elements, que mostra o HTML final e o CSS aplicado a cada elemento da página',
          'Sources, que exibe o código-fonte e permite criar pontos de parada',
          'Application, que mostra a versão do framework instalada no projeto',
          'Network, que lista cada requisição com status, tempo e resposta'
        ], 'Network registra as requisições e suas respostas. Elements é DOM e CSS, Sources é código e breakpoints, e a versão do framework não é a função do Application.'),
        mcq('q2', 'O erro "Cannot read properties of undefined (reading map)" aparece ao abrir a tela. Qual a causa provável?', 'c', [
          'O CSS da página bloqueou a execução do JavaScript do componente',
          'O navegador está desatualizado e não conhece a função map de listas do JavaScript moderno',
          'O código tentou usar map em dados que ainda não chegaram (estavam indefinidos)',
          'O servidor desligou o JavaScript do usuário por segurança durante a visita'
        ], 'O erro típico é acessar propriedades de algo ainda undefined, como dados da API antes do carregamento. CSS não bloqueia JS, map existe há muito tempo e o servidor não desliga o JS do usuário.'),
        mcq('q3', 'Para que serve um source map?', 'b', [
          'Mapear as rotas do site para que os buscadores as encontrem com mais facilidade',
          'Ligar o código minificado ao código original, para ver nomes e linhas reais ao depurar',
          'Criptografar o código para ninguém conseguir lê-lo no navegador nem em ferramentas de inspeção',
          'Reduzir o tamanho do bundle removendo funções que não são usadas'
        ], 'Source maps traduzem posições do código gerado para as originais. Rotas para buscadores são o sitemap, criptografar não é a função e remover código morto é tree shaking.'),
        fill('q4', 'Complete a instrução que pausa a execução quando as DevTools estão abertas.', '___;', ['debugger'], 'A instrução debugger funciona como um breakpoint escrito no código, pausando a execução nas DevTools.'),
        mcq('q5', 'Um desenvolvedor imprime com console.log o objeto completo do usuário logado, com e-mail e token, para depurar. Qual a crítica adequada?', 'd', [
          'Não há crítica, pois o console só existe na máquina do desenvolvedor e não deixa rastros',
          'O problema é o desempenho, porque objetos grandes travam a aba do navegador e deixam o painel lento',
          'O console não aceita objetos, só textos simples, e o comando falhará',
          'Dados pessoais e credenciais não devem ir ao console, pois podem vazar em capturas e relatórios'
        ], 'Logs podem ser copiados, capturados em tela e enviados a ferramentas de erro. Evite dados pessoais e tokens. O console aceita objetos e o problema central não é desempenho.'),
        mcq('q6', 'Qual é a vantagem de um breakpoint sobre vários console.log?', 'c', [
          'Faz o código rodar mais rápido, porque desliga as verificações do navegador',
          'Corrige o erro automaticamente ao ler o código da linha onde foi criado',
          'Pausa a execução e permite inspecionar qualquer variável e a pilha de chamadas, sem alterar o código',
          'Envia o estado da aplicação a um servidor externo para análise'
        ], 'Breakpoints dão inspeção completa no ponto exato sem editar o código. Eles não aceleram, não corrigem sozinhos e não enviam nada para fora.'),
        mcq('q7', 'Qual ferramenta mostra props e estado de cada componente de um app React durante a execução?', 'a', [
          'React DevTools, extensão do navegador com a árvore de componentes e o Profiler',
          'O painel Elements, que mostra o estado interno dos componentes React em tempo real',
          'O comando npm audit, que lista o estado atual de cada componente',
          'O arquivo package.json, que guarda os valores de props de cada tela'
        ], 'React DevTools expõe a árvore de componentes e o estado. Elements mostra só DOM, npm audit trata de vulnerabilidades e package.json lista dependências.'),
        fill('q8', 'Complete o método que mostra uma lista como tabela no Console.', 'console.___(listaDeTarefas);', ['table'], 'console.table organiza arrays e objetos em linhas e colunas, facilitando a leitura.')
      ]
    },
    {
      id: 'fib-37-testes-basicos-de-componentes',
      title: 'Testes básicos de componentes',
      goal: 'Entender por que e o que testar, conhecer Vitest, Jest e Testing Library, testar comportamento e não implementação, e escrever testes executáveis com node:test.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que testar',
            'Testes automáticos são programas que verificam se o seu código faz o esperado. Eles dão segurança para mudar (refatorar sem medo de quebrar o que funcionava), documentam o comportamento e pegam erros antes do usuário. Não garantem ausência de bugs, e testes ruins (frágeis, lentos) atrapalham. A pergunta útil é: que erro eu ficaria com vergonha de deixar passar?'
          ),
          sl(
            'O que testar e o que não testar',
            'Teste o que importa ao usuário e à regra do negócio: cálculos, filtros, validações, fluxos principais (adicionar tarefa, ver erro quando a API falha). Prefira testar lógica em funções puras (entrada produz saída), que são rápidas e simples. Não teste detalhes internos do framework nem o código de bibliotecas: elas já têm testes. Cada teste deve ter um motivo claro para falhar.'
          ),
          sl(
            'Comportamento, não implementação',
            'Um teste bom descreve o que o usuário vê e faz ("ao clicar em Adicionar, a tarefa aparece na lista"), não como o componente é feito por dentro (o nome de uma variável de estado, qual hook foi usado). Testes presos à implementação quebram a cada refatoração sem que nada tenha realmente quebrado. A Testing Library existe para isso: encontra elementos como o usuário (por papel e texto, como o botão "Adicionar") em vez de por classes internas.'
          ),
          sl(
            'Ferramentas por nome',
            'Executores de teste: Vitest (popular em projetos com Vite) e Jest, com funções como describe, it/test e expect. Testing Library: bibliotecas com a mesma filosofia para React, Vue e Angular que renderizam componentes e consultam a tela. Para testar o app inteiro em um navegador de verdade, ferramentas de ponta a ponta (end-to-end) como o Playwright e o Cypress. O código de componente abaixo é ilustrativo, não executado aqui.',
            '// ilustrativo, não executado aqui (Vitest + Testing Library, React)\nimport { render, screen } from \'@testing-library/react\';\nimport userEvent from \'@testing-library/user-event\';\nimport { test, expect } from \'vitest\';\n\ntest(\'adiciona uma tarefa à lista\', async () => {\n  render(<Tarefas />);\n  await userEvent.type(screen.getByLabelText(\'Nova tarefa\'), \'Estudar testes\');\n  await userEvent.click(screen.getByRole(\'button\', { name: \'Adicionar\' }));\n  expect(screen.getByText(\'Estudar testes\')).toBeInTheDocument();\n});'
          ),
          sl(
            'Exemplo executável com node:test',
            'O Node tem um executor de testes nativo, o node:test, e o node:assert para as verificações. O exemplo testa uma função pura de filtro de tarefas (a mesma ideia serve para qualquer lógica do front). Cada teste cria os dados de que precisa e verifica um comportamento. As durações foram removidas da saída.',
            'const test = require(\'node:test\');\nconst assert = require(\'node:assert/strict\');\n\nfunction filtrarTarefas(lista, filtro) {\n  if (filtro === \'abertas\') return lista.filter(t => !t.concluida);\n  if (filtro === \'concluidas\') return lista.filter(t => t.concluida);\n  return lista;\n}\n\nconst dados = [\n  { id: 1, titulo: \'Ler docs\', concluida: true },\n  { id: 2, titulo: \'Escrever teste\', concluida: false },\n];\n\ntest(\'filtro "abertas" devolve só tarefas não concluídas\', () => {\n  assert.deepEqual(filtrarTarefas(dados, \'abertas\').map(t => t.id), [2]);\n});\n\ntest(\'filtro "concluidas" devolve só tarefas concluídas\', () => {\n  assert.deepEqual(filtrarTarefas(dados, \'concluidas\').map(t => t.id), [1]);\n});\n\ntest(\'filtro desconhecido mantém a lista inteira\', () => {\n  assert.equal(filtrarTarefas(dados, \'qualquer\').length, 2);\n});\n\ntest(\'não altera a lista original\', () => {\n  const copia = structuredClone(dados);\n  filtrarTarefas(dados, \'abertas\');\n  assert.deepEqual(dados, copia);\n});\n\n// saída real (executado com Node):\n// ✔ filtro "abertas" devolve só tarefas não concluídas\n// ✔ filtro "concluidas" devolve só tarefas concluídas\n// ✔ filtro desconhecido mantém a lista inteira\n// ✔ não altera a lista original\n// ℹ tests 4\n// ℹ suites 0\n// ℹ pass 4\n// ℹ fail 0\n// ℹ cancelled 0\n// ℹ skipped 0\n// ℹ todo 0'
          ),
          sl(
            'Boas práticas e armadilhas',
            'Nomeie o teste pelo comportamento. Mantenha cada teste independente dos outros (sem depender da ordem). Use dados fictícios, nunca dados pessoais reais. Evite testar com a internet de verdade: troque chamadas de API por respostas simuladas (mocks) e teste também os estados de erro e vazio. Cobertura de 100% não prova qualidade: foque nos caminhos críticos. Rode os testes automaticamente a cada alteração (integração contínua).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é uma boa razão para ter testes automáticos em um projeto de front-end?', 'c', [
          'Eliminar a necessidade de revisar o código ou de testar o app manualmente em qualquer etapa do projeto',
          'Garantir que o programa não tenha bug em produção depois de aprovado',
          'Permitir mudanças no código com mais segurança, pois quebras são detectadas logo',
          'Fazer o app carregar mais rápido para o usuário final no navegador'
        ], 'Testes são uma rede de segurança para refatorar. Eles complementam a revisão e os testes manuais, não provam ausência de bugs e não aceleram o carregamento.'),
        mcq('q2', 'Qual teste descreve melhor um comportamento, em vez de implementação?', 'd', [
          'O estado interno chamado listaInterna recebe um novo objeto com a chave id',
          'O hook usado no componente é chamado exatamente duas vezes na renderização',
          'A classe CSS btn-primary está presente no elemento com a variável de controle',
          'Ao clicar em Adicionar, a nova tarefa aparece na lista'
        ], 'O primeiro descreve o que a pessoa vê e faz. Os demais dependem de detalhes internos e quebram em refatorações sem mudar o resultado.'),
        mcq('q3', 'Para que serve a Testing Library?', 'a', [
          'Renderizar componentes e consultá-los como o usuário faz, por papel e texto, em vez de por detalhes internos',
          'Gerar automaticamente os testes do projeto sem intervenção da pessoa',
          'Substituir o servidor de produção durante a execução dos testes',
          'Compilar o TypeScript do projeto para JavaScript que roda no navegador'
        ], 'A biblioteca incentiva consultas acessíveis (getByRole, getByText). Ela não escreve testes sozinha, não é servidor e não compila TypeScript.'),
        fill('q4', 'Complete a verificação do Node que compara dois valores com igualdade estrita.', 'const assert = require(\'node:assert/strict\');\nassert.___(2 + 2, 4);', ['equal', 'strictEqual'], 'assert.equal (no modo strict) ou strictEqual compara os valores com igualdade estrita.'),
        mcq('q5', 'Uma função pura de filtro recebe a lista e o filtro e devolve uma nova lista. Por que ela é fácil de testar?', 'b', [
          'Porque funções puras só podem ser executadas dentro de componentes de uma biblioteca de interface com testes',
          'Depende só das entradas e não tem efeitos colaterais, então basta chamar e comparar a saída',
          'Porque precisam de um navegador de verdade e de uma conexão para rodar',
          'Porque guardam estado interno que o teste precisa reiniciar entre as chamadas'
        ], 'Sem dependência externa nem efeitos, o teste é uma chamada e uma comparação. Não precisam de componentes, navegador ou estado interno.'),
        mcq('q6', 'Um componente busca tarefas em uma API. Como testar sem depender da internet?', 'c', [
          'Fazer o teste chamar a API real de produção, para ter certeza de que funciona',
          'Não testar esse componente, pois qualquer teste com API é impossível',
          'Substituir a chamada por uma resposta simulada (mock) e testar também os casos de erro e vazio',
          'Colocar a chave da API real no teste, para que o servidor reconheça a chamada'
        ], 'Mocks tornam o teste rápido e previsível e permitem simular falhas. Chamar produção ou expor chaves é ruim e testar o componente é possível.'),
        mcq('q7', 'Qual afirmação sobre cobertura de testes está adequada?', 'b', [
          'Cobertura de 100% garante que o software está livre de falhas de segurança',
          'Alta cobertura não prova qualidade; vale priorizar os caminhos críticos e verificar o comportamento',
          'Cobertura baixa é melhor, pois menos testes significam menos manutenção',
          'A cobertura mede a velocidade de carregamento das páginas em produção'
        ], 'Cobertura mede linhas executadas, não a qualidade das verificações. Não garante segurança, baixa cobertura não é melhor e velocidade é outra métrica.'),
        fill('q8', 'Complete a função do Node que declara um caso de teste.', 'const ___ = require(\'node:test\');', ['test'], 'O módulo node:test exporta test (também acessível como it dentro de describe) para declarar casos de teste.')
      ]
    },
    {
      id: 'fib-38-organizacao-de-projeto-e-boas-praticas',
      title: 'Organização de projeto e boas práticas',
      goal: 'Organizar pastas e nomes, manter componentes pequenos, usar ESLint e Prettier, trabalhar com git e escrever mensagens de commit padronizadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que organizar',
            'Um projeto que funciona hoje precisa ser entendido amanhã por outra pessoa (ou por você, meses depois). Organização reduz o tempo para achar código, evita duplicação e facilita testes e revisões. Não existe estrutura universal: o objetivo é ter uma convenção simples, combinada pela equipe e seguida por todos.'
          ),
          sl(
            'Estrutura de pastas',
            'Há dois estilos comuns. Por tipo: pastas components, hooks (ou composables), services, pages. Por funcionalidade (feature): uma pasta tarefas com os componentes, hooks, serviço e testes daquela parte do produto. Projetos pequenos funcionam bem por tipo; ao crescer, agrupar por funcionalidade mantém o que muda junto no mesmo lugar. Coloque o que é compartilhado em uma pasta comum (shared) e evite dependências circulares entre funcionalidades.',
            'src/\n  funcionalidades/\n    tarefas/\n      ListaTarefas.jsx        (React; .vue no Vue; .ts/.html no Angular)\n      useTarefas.js           (hook ou composable)\n      tarefasApi.js           (chamadas HTTP)\n      tarefas.test.js\n  compartilhado/\n    Botao.jsx\n    formatarData.js\n  App.jsx\n  main.jsx'
          ),
          sl(
            'Nomes e componentes pequenos',
            'Nomes bons dispensam comentários: componentes em PascalCase (ListaTarefas), funções e variáveis em camelCase, constantes em MAIÚSCULAS quando fizer sentido, arquivos seguindo o padrão do framework (no Angular, o guia de estilo oficial define nomes). Um componente deve fazer uma coisa: quando passar de umas poucas dezenas de linhas, ou misturar busca de dados, regra de negócio e visual, divida. Separe componentes de apresentação (recebem props e desenham) de lógica (hooks, composables, serviços).'
          ),
          sl(
            'ESLint e Prettier',
            'ESLint é um analisador que aponta problemas no código (variável não usada, hook usado de forma errada, regras de acessibilidade) e existem conjuntos de regras para React, Vue e Angular. Prettier formata o código sempre do mesmo jeito (aspas, espaços, quebras de linha), acabando com discussões de estilo. Configure ambos no editor e rode no projeto antes de commitar. Em versões recentes as configurações mudaram de formato: siga a documentação da versão que você usa.'
          ),
          sl(
            'Git e commits padronizados',
            'Use git desde o primeiro dia: commits pequenos que fazem uma coisa, com mensagens claras. Um padrão muito usado é o das convenções de commit (Conventional Commits): tipo, escopo opcional e descrição curta no imperativo, como "feat(tarefas): adicionar filtro por status", "fix(api): tratar resposta 500" e "docs: atualizar README". Trabalhe em branches e abra pull requests para revisão. Nunca faça commit de segredos (.env com chaves) ou de dados pessoais: use .gitignore e variáveis de ambiente. Se um segredo vazar para o repositório, revogue-o.',
            '# exemplos de mensagens\nfeat(tarefas): adicionar filtro por status\nfix(api): tratar resposta 500 com mensagem amigável\nrefactor(lista): extrair componente ItemTarefa\ndocs: atualizar instruções de instalação\n\n# .gitignore (trecho)\nnode_modules/\ndist/\n.env\n.env.local'
          ),
          sl(
            'Boas práticas gerais',
            'Comece simples e refatore quando a dor aparecer. Evite abstrações prematuras (não crie uma biblioteca de componentes para uma tela). Mantenha dependências sob controle: cada pacote novo é custo de manutenção e superfície de segurança. Escreva um README com como instalar, rodar, testar e fazer o build. Revise código dos colegas com foco em legibilidade, acessibilidade e segurança. Remova código morto e comentários desatualizados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um projeto cresceu e componentes, hooks e serviços de uma mesma funcionalidade estão espalhados por pastas diferentes. Qual organização ajuda?', 'd', [
          'Juntar tudo em um único arquivo gigante para não precisar procurar nada',
          'Criar uma pasta para cada letra do alfabeto e distribuir os arquivos pelo nome de cada um deles',
          'Apagar as pastas e identificar os arquivos pela data de criação',
          'Agrupar por funcionalidade, deixando juntos os arquivos que mudam por um mesmo motivo'
        ], 'Pastas por feature reúnem o que muda junto e reduzem a navegação. Arquivo único, ordem alfabética e datas dificultam a manutenção.'),
        mcq('q2', 'Qual convenção de nome é a mais usada para componentes em React e Vue?', 'a', [
          'PascalCase, como ListaTarefas',
          'snake_case, como lista_tarefas, usado em nomes de componentes de interface',
          'kebab-case com prefixo numérico, como 01-lista, em todo arquivo do projeto',
          'Letras minúsculas sem separador, como listatarefas, em qualquer arquivo'
        ], 'Componentes costumam usar PascalCase. As demais convenções são usadas em outros contextos (arquivos de utilitários, CSS) e não são a regra para componentes.'),
        mcq('q3', 'Qual é a função do Prettier?', 'c', [
          'Encontrar falhas de segurança em pacotes instalados pelo gerenciador e sugerir as versões corrigidas',
          'Executar os testes automáticos e mostrar o resultado no terminal',
          'Formatar o código sempre do mesmo jeito, eliminando discussões de estilo',
          'Publicar o app na hospedagem quando o build terminar'
        ], 'Prettier é um formatador. Auditoria de pacotes, execução de testes e publicação são tarefas de outras ferramentas.'),
        fill('q4', 'Complete o tipo de commit para uma nova funcionalidade, no padrão de convenções de commit.', '___(tarefas): adicionar filtro por status', ['feat'], 'No padrão Conventional Commits, feat indica uma nova funcionalidade e fix uma correção.'),
        mcq('q5', 'Um desenvolvedor commitou sem querer um arquivo .env com uma chave de API privada em um repositório. O que fazer?', 'a', [
          'Revogar e trocar a chave, remover o arquivo do controle de versão e adicioná-lo ao .gitignore',
          'Apagar o arquivo no próximo commit e considerar o problema resolvido, pois o histórico some',
          'Avisar só depois de um mês, quando houver tempo, porque o repositório é privado e ninguém de fora o vê',
          'Renomear a chave para outro nome de variável e manter o valor igual'
        ], 'O segredo permanece no histórico do git, então precisa ser revogado e trocado. Apagar no commit seguinte, adiar o aviso ou renomear não resolve a exposição.'),
        mcq('q6', 'O que o ESLint ajuda a fazer?', 'd', [
          'Compilar o app para um único arquivo, reduzindo o tamanho do pacote enviado ao navegador',
          'Hospedar o projeto em um servidor para que outras pessoas o acessem',
          'Gerar mensagens de commit automáticas a partir das alterações',
          'Apontar problemas no código, como variáveis não usadas ou uso incorreto de hooks'
        ], 'ESLint é um analisador estático de código. Empacotar é do bundler, hospedar é do serviço de deploy e mensagens de commit não são sua função.'),
        mcq('q7', 'Quando dividir um componente em outros menores?', 'b', [
          'Quando ele tiver mais de uma tag HTML dentro do retorno do componente',
          'Quando ele mistura responsabilidades (buscar dados, regra de negócio e visual) ou ficou difícil de ler',
          'Quando outra pessoa pedir, independentemente do tamanho ou da complexidade',
          'Não dividir, pois componentes grandes são mais rápidos que vários pequenos'
        ], 'Responsabilidades misturadas e dificuldade de leitura são sinais de divisão. O número de tags não é critério e componentes grandes não são, por si, mais rápidos.'),
        fill('q8', 'Complete a linha do .gitignore que impede o envio do arquivo de segredos locais.', '___', ['.env'], 'O arquivo .env guarda variáveis locais, às vezes segredos, e não deve ser versionado.')
      ]
    },
    {
      id: 'fib-39-build-e-deploy-estatico',
      title: 'Build e deploy estático',
      goal: 'Entender o build, variáveis de ambiente públicas, a regra de nunca colocar segredos no bundle, hospedagem estática, fallback de SPA e cache de arquivos com hash.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que o build faz',
            'Durante o desenvolvimento você roda um servidor local com recarga rápida. Para publicar, o build (npm run build) transforma o projeto: compila TypeScript e JSX/templates em JavaScript, junta módulos em poucos arquivos (bundle), minifica, divide o código em pedaços carregados sob demanda (code splitting) e coloca tudo em uma pasta de saída (como dist ou build). O resultado é só HTML, CSS, JavaScript e arquivos estáticos: não precisa de Node no servidor para servi-lo.'
          ),
          sl(
            'Variáveis de ambiente públicas',
            'Ferramentas como o Vite substituem, no build, valores de variáveis de ambiente por texto dentro do código (aquelas com um prefixo específico, como VITE_). Isso serve para configurações que mudam por ambiente, como a URL da API de produção. Mas cuidado: o valor vira texto no bundle, e o bundle é público. Qualquer pessoa pode ler. Variáveis de front-end são configuração, nunca segredo.',
            '# .env.production (exemplo)\nVITE_API_URL=https://api.example.com\nVITE_CHAVE_PUBLICA=<CHAVE_PUBLICA>\n\n# NUNCA assim: segredos no front viram texto legível no bundle\n# VITE_SENHA_DO_BANCO=...\n# VITE_CHAVE_SECRETA_DE_PAGAMENTO=...'
          ),
          sl(
            'Nunca segredos no bundle',
            'Chave de API privada, senha de banco, token administrativo, credencial de nuvem: nada disso pode ir para o front, nem escondido, nem ofuscado, nem em variável de ambiente de build. Quem precisa de um segredo é o servidor. O front chama a SUA API, que guarda os segredos e fala com os serviços externos. Algumas chaves são feitas para serem públicas (restritas por domínio ou escopo): use a variante pública e configure as restrições no provedor. Se um segredo vazou, troque-o.'
          ),
          sl(
            'Hospedagem estática e fallback de SPA',
            'Como o build é só arquivos, qualquer hospedagem de arquivos estáticos serve: um servidor web (Nginx, por exemplo), um serviço de hospedagem estática ou uma CDN, sempre com HTTPS. Ponto de atenção das SPAs: o endereço /tarefas/7 não existe como arquivo. O servidor precisa devolver o index.html (fallback) para caminhos desconhecidos, para que o roteador do app assuma. Sem isso, atualizar a página ou abrir um link direto dá 404.',
            '# ilustrativo: trecho de Nginx para SPA\nserver {\n  root /var/www/app/dist;\n  index index.html;\n\n  location /assets/ {                       # arquivos com hash no nome\n    add_header Cache-Control "public, max-age=31536000, immutable";\n  }\n  location / {\n    try_files $uri /index.html;             # fallback da SPA\n    add_header Cache-Control "no-cache";    # o HTML sempre revalida\n  }\n}'
          ),
          sl(
            'Cache e arquivos com hash (executável)',
            'O build coloca no nome do arquivo um hash do conteúdo (app.a1b2c3d4.js). Se o conteúdo muda, o nome muda, e o navegador baixa o novo; se não muda, o nome é o mesmo e o arquivo pode ficar em cache por muito tempo. O index.html, que aponta para os nomes atuais, deve ser revalidado a cada visita. O código abaixo mostra a ideia, calculando um hash do conteúdo com o módulo crypto do Node.',
            'const crypto = require(\'node:crypto\');\n\nfunction nomeComHash(base, extensao, conteudo) {\n  const hash = crypto.createHash(\'sha256\').update(conteudo).digest(\'hex\').slice(0, 8);\n  return base + \'.\' + hash + \'.\' + extensao;\n}\n\nconst v1 = \'console.log("versão 1");\';\nconst v2 = \'console.log("versão 2");\';\n\nconsole.log(nomeComHash(\'app\', \'js\', v1));\nconsole.log(nomeComHash(\'app\', \'js\', v1), \'(mesmo conteúdo, mesmo nome)\');\nconsole.log(nomeComHash(\'app\', \'js\', v2), \'(conteúdo mudou, nome mudou)\');\n\n// saída real (executado com Node):\n// app.a2fb6402.js\n// app.a2fb6402.js (mesmo conteúdo, mesmo nome)\n// app.d4d655ea.js (conteúdo mudou, nome mudou)'
          ),
          sl(
            'Checklist de publicação',
            'Rode o build localmente e teste o resultado (pré-visualização do build) antes de publicar. Confira: HTTPS ativo; variáveis de ambiente de produção corretas e sem segredos; fallback de SPA configurado; cabeçalhos de segurança do servidor (como CSP e outros, em conceito); cache com hash nos arquivos e revalidação no HTML; página 404; e remoção de console.log com dados sensíveis. Em versões recentes, ferramentas de build e hospedagem têm opções próprias: consulte a documentação da que você usa.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o resultado do build de uma SPA típica?', 'd', [
          'Um servidor Node que precisa rodar na hospedagem para gerar cada página sob demanda',
          'Um banco de dados com as telas do aplicativo salvas como tabelas prontas para consulta pelo navegador',
          'Um único arquivo de texto com o nome dos componentes do projeto',
          'Uma pasta com HTML, CSS, JavaScript e outros arquivos estáticos, prontos para serem servidos'
        ], 'O build gera arquivos estáticos que qualquer servidor de arquivos entrega. Não produz servidor, banco de dados nem simples lista de nomes.'),
        mcq('q2', 'Uma variável VITE_API_URL=https://api.example.com vai para o código do front. Isso é adequado?', 'a', [
          'Sim, pois é uma configuração pública, que não revela segredos',
          'Não, pois toda variável de ambiente é secreta e proibida no front-end',
          'Sim, mas só se a URL for escrita com letras maiúsculas no arquivo de ambiente',
          'Não, porque URLs de API são criptografadas pelo navegador antes de aparecerem'
        ], 'URLs de API são configuração pública, aceitáveis no front. O que não pode são segredos. Maiúsculas e criptografia pelo navegador não entram na história.'),
        mcq('q3', 'Um desenvolvedor quer usar uma chave secreta de pagamento no front e a esconde em uma variável do build. Qual a conclusão?', 'b', [
          'Está protegida, pois o minificador embaralha todo o código e ninguém consegue ler',
          'Ela será legível no bundle; a chamada deve ser feita pelo servidor, que guarda o segredo',
          'Está protegida, pois só o navegador do desenvolvedor baixa o bundle publicado',
          'Está protegida, desde que o arquivo se chame secreto.js no diretório raiz do projeto publicado'
        ], 'Qualquer valor no bundle pode ser lido por quem baixa o site; minificar não protege. O segredo pertence ao servidor, e o front chama a sua API.'),
        fill('q4', 'Complete o fallback da SPA no Nginx: se o arquivo não existir, devolver o index.html.', 'try_files $uri ___;', ['/index.html', 'index.html'], 'O fallback entrega o index.html para caminhos que são rotas do app, e não arquivos reais.'),
        mcq('q5', 'Depois do deploy, atualizar a página em /tarefas/7 dá erro 404 no servidor. Qual a causa provável?', 'c', [
          'O bundle ficou grande demais e o navegador recusou o carregamento',
          'A rota foi escrita com parâmetro, o que é proibido em uma SPA publicada em hospedagem estática',
          'O servidor não tem o fallback para index.html e procura um arquivo chamado tarefas/7',
          'O build apagou o JavaScript, deixando só o CSS na pasta de saída'
        ], 'Sem fallback, caminhos de rota não existem como arquivo e viram 404 ao recarregar. Tamanho do bundle, parâmetros em rotas e build sem JS não explicam o sintoma.'),
        mcq('q6', 'Por que arquivos com hash no nome podem ter cache longo?', 'd', [
          'Porque o hash criptografa o arquivo e impede que ele seja alterado depois de publicado, protegendo o conteúdo',
          'Porque o navegador recusa guardar arquivos sem hash e os baixa a cada visita',
          'Porque o hash substitui o HTTPS na proteção do tráfego até o navegador',
          'Quando o conteúdo muda o nome também muda, então o navegador busca a versão nova'
        ], 'O hash liga o nome ao conteúdo, o que torna seguro o cache longo. Ele não criptografa, não é requisito do navegador e não substitui HTTPS.'),
        mcq('q7', 'Qual deve ser a política de cache do index.html em uma SPA com arquivos com hash?', 'b', [
          'Cache de um ano, igual aos arquivos com hash, para acelerar os acessos',
          'Revalidar a cada visita, pois ele aponta para os nomes atuais dos arquivos',
          'Não ser servido, pois o navegador monta o index.html sozinho',
          'Ser renomeado a cada deploy para um nome aleatório que os usuários devem digitar'
        ], 'Se o HTML ficasse em cache longo, os usuários continuariam com referências antigas. Ele precisa existir e ser revalidado, mantendo o nome index.html.'),
        fill('q8', 'Complete o nome do comando que gera a versão de produção, no npm.', 'npm run ___', ['build'], 'O script build (configurado no package.json) executa o empacotador e gera a pasta de saída.')
      ]
    },
    {
      id: 'fib-40-revisao-projeto-lista-de-tarefas',
      title: 'Revisão: projeto lista de tarefas',
      goal: 'Planejar o mesmo app de tarefas nos três frameworks, integrando componentes, estado, API, rotas, acessibilidade e segurança, e praticar decisões de projeto.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O projeto',
            'Vamos planejar (não codificar linha a linha) um app de tarefas: lista com filtro (todas, abertas, concluídas), formulário para adicionar, marcar como concluída, detalhe de uma tarefa por rota e comunicação com uma API. Planejar antes de codificar é a habilidade principal desta revisão: o desenho é quase igual nos três frameworks, e só a forma de escrever muda. Tudo aqui é ilustrativo, não executado.'
          ),
          sl(
            'Componentes e responsabilidades',
            'Árvore sugerida: App (layout e roteador) contendo a página Lista (busca os dados, guarda o filtro, mostra os estados de carregando, erro e vazio), o componente FormNovaTarefa (campo e botão, valida o texto), a lista de ItemTarefa (recebe a tarefa e um evento de alternar) e a página Detalhe (lê o id da rota). Props descem e eventos sobem: o estado da lista vive no componente mais alto que precisa dele (a página Lista), e os filhos só recebem dados e avisam ações.',
            'App\n |- Cabecalho (nav com links)\n |- Rotas\n     |- /          -> PaginaLista\n     |                |- FormNovaTarefa   (evento: adicionar)\n     |                |- FiltroTarefas    (evento: mudarFiltro)\n     |                |- ItemTarefa x N   (props: tarefa; evento: alternar)\n     |- /tarefas/:id -> PaginaDetalhe\n     |- *            -> NaoEncontrada'
          ),
          sl(
            'Estado e derivados nos três',
            'Estado de verdade: a lista de tarefas, o filtro e a situação da requisição. Estado derivado: a lista filtrada e o contador de abertas, calculados a partir do estado em vez de guardados (evita inconsistência). React: useState e valores calculados no corpo (ou useMemo se for caro). Vue: ref e computed. Angular: signal e computed. Atualize sempre sem mutar: crie uma nova lista ao alternar uma tarefa.',
            '// ilustrativo, não executado aqui\n// React\nconst abertas = tarefas.filter(t => !t.concluida).length;\n// Vue\nconst abertas = computed(() => tarefas.value.filter(t => !t.concluida).length);\n// Angular\nabertas = computed(() => this.tarefas().filter(t => !t.concluida).length);'
          ),
          sl(
            'API e rotas',
            'A lista vem de GET /api/tarefas, a criação é POST, a alternância é PATCH. Cada chamada trata não-2xx, cancelamento e os estados da tela. Em React: efeito com cleanup ou biblioteca de dados; em Vue: composable useFetch; em Angular: HttpClient com async pipe ou toSignal. Rotas: lista em /, detalhe em /tarefas/:id com validação do id, 404 em *. As credenciais vão em cookie HttpOnly do servidor, nunca em localStorage, e a API valida e autoriza tudo de novo.'
          ),
          sl(
            'Acessibilidade e segurança no plano',
            'Acessibilidade: button para ações, label no campo, checkbox nativo para concluir, foco visível, foco levado ao campo após adicionar, mensagens de erro ligadas ao campo (aria-describedby), contraste suficiente, teste só com teclado. Segurança e privacidade: títulos de tarefa exibidos como texto (interpolação, sem v-html nem innerHTML), validação no cliente como UX e no servidor como barreira, sem segredos no bundle, nada de dados pessoais em logs ou na URL, localStorage só para preferências como o filtro e o tema.'
          ),
          sl(
            'Testes, build e deploy no plano',
            'Testes: funções puras (filtrar, contar), componente de item (clicar chama o evento), formulário (erro com campo vazio) e um fluxo ponta a ponta (adicionar e ver na lista), com a API simulada. Organização: pasta por funcionalidade, ESLint e Prettier, commits convencionais. Publicação: build, URL da API em variável pública, hospedagem estática com HTTPS, fallback de SPA, cache com hash e revisão de cabeçalhos. Depois de revisar o plano, comece a codificar pelo menor pedaço que funciona (lista fixa na tela) e vá adicionando.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No projeto de tarefas, onde deve viver o estado da lista que a página Lista e o formulário precisam usar?', 'a', [
          'No componente comum mais alto que precisa dele (a página Lista), que passa dados por props e recebe eventos dos filhos',
          'Dentro de cada ItemTarefa, com cópias da lista que cada item mantém por conta própria',
          'Em variáveis globais do navegador acessadas pelos componentes da tela diretamente',
          'Dentro do formulário, já que é ali que as tarefas nascem para o resto do app'
        ], 'Elevar o estado ao ancestral comum mantém uma fonte de verdade. Cópias em cada item e globais desorganizam a atualização, e o formulário não é dono da lista toda.'),
        mcq('q2', 'O contador de tarefas abertas deve ser guardado como um estado separado ou calculado?', 'c', [
          'Guardado em um estado separado, atualizado manualmente a cada operação feita na tela',
          'Guardado no localStorage, para sobreviver a todas as atualizações da página',
          'Calculado a partir da lista, pois assim não fica fora de sincronia com os dados',
          'Pedido ao servidor a cada clique, mesmo que a lista local já tenha a resposta'
        ], 'Valores derivados evitam inconsistência: computed, signal computed ou cálculo no corpo. Duplicar estado cria bugs, localStorage é desnecessário e pedir ao servidor a cada clique é custo à toa.'),
        mcq('q3', 'Como exibir o título de uma tarefa digitado pelo usuário de forma segura?', 'c', [
          'Com innerHTML, para respeitar a formatação que o usuário escreveu',
          'Com v-html ou dangerouslySetInnerHTML, só ocultando o botão de excluir da tarefa',
          'Como texto, com interpolação do framework, que escapa o conteúdo',
          'Convertendo o título em maiúsculas antes de colocá-lo na página'
        ], 'A interpolação trata o dado como texto. As opções que inserem HTML abrem espaço para XSS e mudar a caixa das letras não protege de nada.'),
        fill('q4', 'Complete a função do Vue que cria um valor derivado da lista.', 'const abertas = ___(() => tarefas.value.filter(t => !t.concluida).length);', ['computed'], 'computed cria um valor derivado e reativo, recalculado quando as dependências mudam.'),
        mcq('q5', 'O formulário valida que o título não está vazio. Isso basta para proteger a API?', 'b', [
          'Sim, pois um campo validado no navegador não pode chegar vazio ao servidor',
          'Não: a validação do cliente é UX, e a API precisa validar e autorizar por conta própria',
          'Sim, desde que o botão de enviar fique desabilitado enquanto o campo estiver vazio ou o texto tenha menos de dois caracteres',
          'Não, mas basta validar no servidor uma vez por mês para conferir os dados guardados'
        ], 'Requisições podem ser feitas sem passar pela interface, então o servidor valida sempre. Botão desabilitado e auditorias esporádicas não substituem isso.'),
        mcq('q6', 'Qual combinação de abordagens atende melhor a página de detalhe em /tarefas/:id?', 'a', [
          'Validar o id como inteiro, tratar não encontrado e erro de API, e mostrar a tarefa com carregamento e foco no título',
          'Usar o id sem validar, já que o roteador só deixa passar números válidos para a página',
          'Mostrar a tarefa direto, sem estado de carregamento, pois a API sempre responde rápido',
          'Redirecionar os erros para a página inicial sem explicar nada à pessoa'
        ], 'O id vem da URL e precisa de validação; a tela deve cobrir carregando, erro e não encontrado. Rotas não validam por você, a API pode demorar e erros silenciosos confundem.'),
        mcq('q7', 'Antes de publicar o app, qual verificação é essencial?', 'd', [
          'Garantir que o bundle tenha o maior tamanho possível para impressionar os usuários',
          'Deixar os console.log com dados dos usuários para facilitar o suporte após a publicação e a análise de erros',
          'Desligar o roteador, pois publicar o app dispensa as rotas que existem no desenvolvimento',
          'Conferir que não há segredos no bundle, que o HTTPS está ativo e que o fallback de SPA funciona'
        ], 'Segredos, HTTPS e fallback são itens críticos do checklist. Bundle grande é problema, logs com dados pessoais violam a minimização e as rotas continuam necessárias.'),
        fill('q8', 'Complete a regra de comunicação entre componentes pai e filho.', 'Props descem e ___ sobem', ['eventos', 'evento'], 'Dados fluem do pai para o filho por props e as ações do filho chegam ao pai por eventos, nos três frameworks.')
      ]
    },
    {
      id: 'fib-41-como-continuar-estudando',
      title: 'Como continuar estudando',
      goal: 'Conhecer as trilhas intermediária e avançada, escolher projetos práticos, usar a documentação oficial, acompanhar versões e evitar tutoriais desatualizados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que você já domina',
            'Neste nível você aprendeu HTML, CSS e DOM, JavaScript moderno, o ferramental com Vite, componentes, e os blocos básicos de React, Vue e Angular; viu consumo de APIs, roteamento, estilização, acessibilidade, formulários, segurança e privacidade, depuração, testes, organização e deploy. É uma base sólida. O que vem agora é profundidade e prática: o conhecimento se consolida construindo e errando em projetos.'
          ),
          sl(
            'Trilha intermediária',
            'O nível intermediário deste curso aprofunda: estado compartilhado (Context e bibliotecas como Redux Toolkit e Zustand em React, Pinia no Vue, serviços e signals no Angular), formulários avançados, cache e sincronização com dados do servidor (TanStack Query), renderização no servidor e geração estática (frameworks como Next.js, Nuxt e o SSR do Angular), testes mais completos (Testing Library, ponta a ponta com Playwright), animações e desempenho básico (listas grandes, code splitting).'
          ),
          sl(
            'Trilha avançada',
            'Depois: arquitetura de aplicações grandes (organização por domínio, limites entre módulos), design systems e bibliotecas de componentes (com Storybook), micro-frontends em conceito, desempenho a fundo (métricas, profiling, hidratação), acessibilidade avançada, observabilidade e monitoramento de erros respeitando a privacidade, segurança aprofundada (CSP, dependências, cadeia de suprimentos), internacionalização, e contribuir com projetos abertos. Aprenda a decidir com trade-offs, e não a seguir modas.'
          ),
          sl(
            'Projetos práticos',
            'Aprende-se mais construindo. Ideias de nível crescente: lista de tarefas com API própria (esta revisão), catálogo com busca e paginação, painel com gráficos e filtros, aplicativo de anotações com login (usando cookies HttpOnly), carrinho de compras fictício, clone simplificado de um app que você usa. Faça o mesmo projeto em dois frameworks para sentir as diferenças. Use dados fictícios, publique o código no git com um README claro e hospede o resultado: um portfólio com projetos publicados vale mais que certificados.'
          ),
          sl(
            'Documentação oficial e versões',
            'A documentação oficial (React, Vue e Angular têm guias interativos) é a fonte mais confiável e atualizada: comece por ela e use tutoriais para complementar. Frameworks evoluem: recursos novos aparecem e padrões antigos são substituídos, o que muda a forma "idiomática" de escrever. Acompanhe as notas de versão e os guias de migração dos projetos que você usa, fixe versões no lockfile e leia o changelog antes de atualizar. Este curso evitou números de versão de propósito: confira sempre a versão que o seu projeto usa.'
          ),
          sl(
            'Como evitar tutoriais desatualizados',
            'Sinais de alerta em um tutorial: não tem data ou é antigo; usa padrões que a documentação atual já substituiu (por exemplo componentes de classe em React, ou NgModules obrigatórios em Angular novo); manda copiar comandos sem explicar; usa pacotes sem manutenção; pede para instalar tudo com permissões de administrador ou desligar proteções. Confira com a documentação oficial, olhe a data e a atividade do repositório, leia os comentários e os problemas abertos. Desconfie de qualquer conteúdo que peça chaves, senhas ou dados pessoais reais para um exercício.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a melhor forma de consolidar o que aprendeu até aqui?', 'd', [
          'Reler os slides do curso repetidas vezes até decorar todas as frases do conteúdo sem praticar nada',
          'Assistir a muitos vídeos em velocidade alta sem escrever código próprio',
          'Esperar a próxima versão dos frameworks para só então começar a praticar',
          'Construir projetos próprios, publicá-los e comparar a mesma ideia em frameworks diferentes'
        ], 'Prática com projetos reais consolida o aprendizado. Decorar, assistir sem codar e adiar a prática não constroem habilidade.'),
        mcq('q2', 'Um tutorial usa um padrão que a documentação atual do framework já substituiu e não tem data. O que fazer?', 'c', [
          'Seguir à risca, pois um tutorial é mais confiável que a documentação do framework',
          'Apagar o projeto e abandonar o framework, já que o conteúdo está errado',
          'Conferir na documentação oficial e na data do conteúdo antes de seguir, e preferir as formas atuais',
          'Copiar o código e instalar as versões mais antigas dos pacotes do sistema'
        ], 'A documentação oficial é a referência atualizada. Um conteúdo antigo ainda ensina conceitos, mas deve ser conferido. Abandonar tudo ou regredir versões sem necessidade é desproporcional.'),
        mcq('q3', 'Qual tema pertence mais à trilha intermediária do que ao nível iniciante?', 'a', [
          'Estado compartilhado com Pinia, Redux Toolkit, Zustand ou serviços e signals, e cache de dados do servidor',
          'Criar o primeiro componente que mostra um texto na tela com HTML',
          'Aprender o que é uma tag e a diferença entre elementos de bloco e em linha',
          'Abrir as DevTools do navegador pela primeira vez para ver o DOM'
        ], 'Estado global e cache de dados do servidor aparecem depois do básico. Componentes simples, tags e DevTools são conteúdo do início.'),
        fill('q4', 'Complete o arquivo que fixa as versões exatas das dependências instaladas pelo npm.', 'package-___.json', ['lock'], 'O package-lock.json registra as versões exatas instaladas, tornando as instalações reproduzíveis.'),
        mcq('q5', 'Um exercício de um site desconhecido pede sua senha real do e-mail e documentos pessoais para "configurar o ambiente". Como agir?', 'b', [
          'Enviar a senha, pois os documentos pessoais são os mais sensíveis',
          'Recusar e abandonar o conteúdo, pois nenhum exercício legítimo precisa de dados pessoais reais',
          'Enviar tudo, já que sites de cursos são confiáveis para quem estuda',
          'Enviar uma foto do documento com parte coberta para ficar mais seguro'
        ], 'Exercícios usam dados fictícios. Pedir credenciais ou documentos reais é sinal de fraude e a resposta é não fornecer nada, em nenhuma versão parcial.'),
        mcq('q6', 'Por que acompanhar notas de versão e guias de migração dos frameworks?', 'd', [
          'Porque as versões novas apagam automaticamente todo o código antigo do seu projeto',
          'Porque guias de migração servem só para quem trabalha na equipe do framework',
          'Porque os frameworks permanecem estáveis, e as notas só informam datas de aniversário',
          'Porque recursos novos aparecem e padrões antigos mudam, e atualizar sem ler pode quebrar o projeto'
        ], 'Frameworks evoluem, e o changelog avisa mudanças incompatíveis. Versões novas não apagam seu código nem são só para os mantenedores, e os frameworks mudam sim.'),
        mcq('q7', 'Qual destas é uma boa prática ao montar um portfólio de projetos?', 'c', [
          'Usar dados reais de amigos e clientes para o projeto parecer mais verdadeiro',
          'Deixar o repositório sem explicações e sem instruções de como rodar o projeto',
          'Usar dados fictícios, ter um README claro e publicar o código e o resultado hospedado',
          'Incluir no código as chaves de API que usou, para quem visitar poder testar o projeto sem criar conta'
        ], 'Portfólios devem respeitar privacidade e mostrar clareza. Dados reais violam a minimização, repositório sem README afasta leitores e chaves no código são um vazamento.'),
        fill('q8', 'Complete o nome do documento onde o projeto explica como instalar e executar.', '___.md', ['README', 'readme'], 'O README.md é a porta de entrada do repositório, com instruções de instalação, execução, testes e build.')
      ]
    },
  ]
};
