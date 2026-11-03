// Módulo "Fundamentos" do curso de Node.js — nível iniciante (lições njb-01 a njb-38).
// Cada lição tem 8 questões (3 múltipla escolha + 1 lacuna, duas vezes). Ver ../../index.js para
// o formato e a validação de boot. Público: sabe lógica de programação, nunca viu JavaScript nem Node;
// por isso as lições 03 a 07 ensinam o JavaScript necessário do zero antes de usá-lo no Node.
// Exemplos executáveis usam só módulos nativos e as saídas coladas foram obtidas executando o código
// de verdade; trechos com pacotes (Express etc.) são marcados como ilustrativos. Nenhum dado pessoal
// real (nomes e e-mails são fictícios), segredos sempre <placeholder>, nenhuma versão ou estatística
// que mude é afirmada — recursos recentes são citados como "em versões recentes" (conferir a
// documentação oficial). LGPD só em visão geral; não substitui orientação jurídica.
// Helpers locais (mcq, fill, sl) produzem o formato exigido pela validação do boot: mcq recebe a
// letra correta e as 4 alternativas em ordem a, b, c, d; fill recebe prompt, código com a lacuna
// ___ e a lista de respostas aceitas (a 1ª é a canônica); sl() monta um slide (code opcional).
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
  id: 'fundamentos-node',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'JavaScript do zero, módulos, npm, arquivos, assincronia, eventos e os primeiros servidores HTTP com Node.js',
  accent: '#16a34a',
  lessons: [
    {
      id: 'njb-01-o-que-e-nodejs',
      title: 'O que é Node.js',
      goal: 'Entender o que o Node.js é (e não é), para que serve, como ele lida com várias tarefas ao mesmo tempo e quando não é a melhor escolha.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Node.js é um ambiente de execução',
            'JavaScript nasceu para rodar dentro do navegador, dando vida às páginas. O Node.js pega o mesmo motor que executa JavaScript no Chrome, chamado V8, e o embute em um programa que roda fora do navegador: no seu computador, num servidor, num contêiner. Por isso dizemos que o Node.js é um RUNTIME (ambiente de execução) de JavaScript. Ele NÃO é uma linguagem (a linguagem é o JavaScript) e NÃO é um framework (não impõe um jeito de organizar sua aplicação). Ele fornece o motor mais um conjunto de módulos nativos para coisas que o navegador não faz: ler arquivos, abrir portas de rede, acessar variáveis de ambiente.',
            'console.log("Olá, Node!");\n// saída real:\n// Olá, Node!'
          ),
          sl(
            'Para que serve',
            'O Node.js é muito usado para: (1) APIs e servidores web que recebem requisições e devolvem dados; (2) ferramentas de linha de comando (CLIs), como empacotadores e formatadores de código; (3) automação de tarefas e scripts do dia a dia; (4) aplicações de tempo real, como chats e notificações, em que muitos clientes ficam conectados ao mesmo tempo; (5) ferramentas de build do front-end. Uma vantagem prática: a mesma linguagem serve para o navegador e para o servidor, então uma pessoa pode trabalhar nos dois lados.'
          ),
          sl(
            'Uma thread e I/O não bloqueante (visão simples)',
            'O código JavaScript do Node.js roda em UMA linha de execução principal (single-thread): faz uma coisa de cada vez. Como então atender milhares de clientes? A maior parte do tempo de um servidor é ESPERA: esperar o disco ler, o banco responder, a rede entregar. Em I/O (entrada e saída) NÃO BLOQUEANTE, o Node pede a operação ao sistema, registra "me avise quando terminar" e segue para outra tarefa em vez de ficar parado. Quando o resultado chega, o código que você deixou combinado é executado. Analogia: um garçom que anota o pedido, entrega à cozinha e atende outra mesa, em vez de ficar olhando o prato ser preparado.'
          ),
          sl(
            'Quando NÃO usar Node.js',
            'Como o seu código JavaScript roda numa linha só, uma conta que usa a CPU por muito tempo (processar vídeo, calcular algo gigantesco, criptografar arquivos enormes de forma síncrona) ocupa essa linha, e nenhum outro cliente é atendido enquanto isso. É o garçom que, em vez de atender, resolve uma conta de matemática de dez minutos. Para esse tipo de carga existem alternativas dentro do próprio Node (Worker Threads, processos separados, filas) ou outras tecnologias mais adequadas. Regra de bolso: Node brilha quando o trabalho é mais ESPERAR (I/O) do que CALCULAR (CPU).'
          ),
          sl(
            'O ecossistema: npm',
            'Junto com o Node vem o npm (Node Package Manager), o gerenciador de pacotes e o maior repositório público de bibliotecas JavaScript. Com um comando você baixa código escrito por outras pessoas (por exemplo, o framework Express) e usa no seu projeto. Isso acelera o trabalho, mas traz um cuidado de segurança: pacote de terceiros é código de terceiros rodando na sua máquina e no seu servidor. Vamos ver como escolher e conferir pacotes na lição de npm.'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: Node.js = runtime (V8 + módulos nativos) que executa JavaScript fora do navegador. Erros comuns de quem começa: achar que Node é uma linguagem ("sei Node" sem saber JavaScript), achar que é um framework como Express (Express é UMA biblioteca que roda SOBRE o Node), achar que "single-thread" significa que só atende um cliente por vez (o I/O não bloqueante permite muita concorrência), e escolher Node para uma carga de CPU pesada sem planejar workers.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um colega diz: "Node.js é uma linguagem de programação nova, parecida com JavaScript". Qual correção é a mais precisa?', 'b', [
          'Node.js é um framework que define como organizar pastas e rotas de uma aplicação em JavaScript',
          'Node.js é um runtime que executa JavaScript fora do navegador; a linguagem continua sendo JavaScript',
          'Node.js é uma versão reduzida do JavaScript pensada só para servidores, sem recursos de navegador',
          'Node.js é um compilador que transforma JavaScript em código nativo antes da execução, como fazem as linguagens compiladas clássicas'
        ], 'O Node.js é o ambiente de execução (V8 mais módulos nativos); a linguagem é o JavaScript. Não é framework (não impõe estrutura), não é um subconjunto da linguagem e a descrição como compilador não representa o que ele faz.'),
        mcq('q2', 'Qual destes projetos combina melhor com as forças do Node.js?', 'd', [
          'Renderizar vídeos em alta resolução quadro a quadro, usando só o código JavaScript principal',
          'Calcular, no próprio servidor, a simulação de milhões de partículas para cada requisição',
          'Compactar de forma síncrona arquivos de vários gigabytes a cada acesso ao site',
          'Uma API que recebe muitas requisições curtas e consulta um banco de dados para responder'
        ], 'Uma API passa a maior parte do tempo esperando banco e rede (I/O), exatamente o que o modelo não bloqueante faz bem. As outras opções ocupam a CPU por muito tempo e travariam a única linha de execução.'),
        mcq('q3', 'O que significa dizer que o Node.js usa I/O não bloqueante?', 'a', [
          'Ao pedir uma operação lenta, ele registra o que fazer quando terminar e continua atendendo outras tarefas',
          'Cada operação de disco ou rede é executada em uma thread própria que o programador precisa criar e gerenciar manualmente',
          'Ele ignora a espera: operações de arquivo e rede só funcionam se forem concluídas instantaneamente',
          'O programa bloqueia, mas o sistema operacional escolhe qual cliente atender primeiro'
        ], 'I/O não bloqueante é pedir a operação, deixar um aviso combinado e seguir em frente. Não exige que você crie threads, não proíbe operações lentas e o programa não fica parado esperando.'),
        fill('q4', 'Complete com o nome do motor JavaScript do Chrome que o Node.js usa para executar o código.', 'Node.js = motor ___ + módulos nativos (arquivos, rede, processos)', ['v8'], 'O motor é o V8, o mesmo do Chrome. O Node.js o embute e acrescenta módulos que o navegador não tem.'),
        mcq('q5', 'Um servidor Node recebe uma requisição que faz um cálculo de 10 segundos usando só a CPU, no código principal. O que acontece com os outros clientes durante esse tempo?', 'c', [
          'São atendidos normalmente, porque o Node divide o cálculo automaticamente entre vários núcleos',
          'Recebem erro 500 imediatamente, porque o Node recusa requisições enquanto calcula',
          'Ficam esperando, pois a linha única de execução está ocupada com o cálculo',
          'Passam à frente, porque requisições novas têm prioridade sobre cálculos longos'
        ], 'Sem workers, o cálculo ocupa a única linha de execução e nada mais roda até ele terminar. O Node não divide o cálculo sozinho, não recusa requisições com erro 500 e não prioriza as novas.'),
        mcq('q6', 'Qual afirmação sobre Express e Node.js está correta?', 'b', [
          'Express é o nome antigo do Node.js, usado antes de ele ter módulos nativos',
          'Express é uma biblioteca de terceiros instalada via npm que roda sobre o Node',
          'Express substitui o V8 por um motor mais rápido voltado para servidores web',
          'Express é um módulo nativo que já vem embutido no Node e dispensa instalação'
        ], 'Express é um pacote do ecossistema npm que usa o Node por baixo. Não é o nome do Node, não vem embutido (precisa instalar) e não troca o motor V8.'),
        mcq('q7', 'Por que "pacote de terceiros" exige atenção de segurança?', 'd', [
          'Porque o npm cobra por cada download e isso pode gerar custos inesperados para a equipe',
          'Porque pacotes só funcionam depois de aprovados pela equipe oficial do Node.js',
          'Porque qualquer pacote instalado deixa o Node mais lento até ser removido',
          'Porque é código de outras pessoas executado com as permissões do seu programa'
        ], 'Instalar um pacote é executar código alheio no seu ambiente, então vale conferir origem e manutenção. Não há cobrança por download nem aprovação prévia oficial, e a lentidão não é regra.'),
        fill('q8', 'Complete com a sigla do gerenciador de pacotes que acompanha o Node.js.', 'Para baixar bibliotecas de terceiros usamos o ___', ['npm'], 'O npm (Node Package Manager) acompanha o Node e dá acesso ao repositório público de pacotes.')
      ]
    },
    {
      id: 'njb-02-instalando-e-primeiros-passos',
      title: 'Instalando e primeiros passos',
      goal: 'Instalar o Node.js de fonte confiável, conferir a versão, usar o REPL, rodar um arquivo .js e montar a estrutura básica de um projeto.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'LTS e Current: qual versão usar',
            'O Node.js lança versões novas com frequência e as organiza em linhas. A linha LTS (Long Term Support, suporte de longo prazo) recebe correções e atualizações de segurança por um período grande e é a recomendada para produção e para quem está aprendendo. A linha Current traz os recursos mais novos, mas tem suporte mais curto e pode mudar mais. Regra prática: para projetos reais, use uma versão LTS que ainda esteja com suporte ativo. Os prazos exatos mudam com o tempo, então consulte o calendário de lançamentos em nodejs.org em vez de decorar números.'
          ),
          sl(
            'Como instalar com segurança',
            'Há dois caminhos comuns. (1) O instalador oficial, baixado do site nodejs.org (ou o gerenciador de pacotes do seu sistema operacional). (2) Um gerenciador de versões, como nvm ou fnm, que permite instalar várias versões do Node lado a lado e trocar entre elas por projeto, útil quando um projeto antigo exige uma versão e o novo outra. Cuidados de segurança: baixe só de fontes oficiais e confira o endereço; evite colar comandos do tipo "curl ... | sh" copiados de blogs ou vídeos sem LER o script antes, porque eles executam, com as suas permissões, o que o endereço devolver. Prefira o passo a passo da documentação oficial da ferramenta.'
          ),
          sl(
            'Conferindo a instalação e o REPL',
            'Abra um terminal e digite node -v: ele mostra a versão instalada (e npm -v mostra a do npm). Se aparecer "comando não encontrado", o Node não foi instalado ou o terminal precisa ser reaberto. Digitar apenas node (sem arquivo) abre o REPL (Read-Eval-Print Loop): você escreve uma linha de JavaScript, ele executa, imprime o resultado e espera a próxima. É ótimo para experimentar. Para sair, use Ctrl+D ou digite .exit.',
            '$ node -v\n$ node\n> 2 + 3\n5\n> "node".toUpperCase()\n\'NODE\'\n> .exit'
          ),
          sl(
            'Rodando um arquivo e console.log',
            'Crie um arquivo chamado ola.js com o código abaixo e execute no terminal com node ola.js. A função console.log escreve texto no terminal (é a "saída padrão"); ela aceita vários valores separados por vírgula. Existe também console.error, que escreve na "saída de erro", separada, útil para mensagens de falha. Importante: o arquivo é executado de cima para baixo e o programa termina quando não há mais nada a fazer.',
            '// ola.js\nconsole.log("Olá,", "Node!");\nconsole.error("isto vai para a saída de erro");\n\n// $ node ola.js\n// saída real (stdout): Olá, Node!'
          ),
          sl(
            'Editor e estrutura de um projeto',
            'Qualquer editor de texto serve; muita gente usa o Visual Studio Code por causa do realce de sintaxe, do terminal integrado e do depurador. Um projeto Node simples costuma ter: uma pasta com o nome do projeto; um arquivo de entrada (por exemplo index.js ou src/index.js); um arquivo package.json (a "identidade" do projeto, que veremos na lição de npm); a pasta node_modules (pacotes baixados, NUNCA editada à mão); e um arquivo .gitignore para não versionar node_modules nem arquivos com segredos, como .env. Segredos (senhas, chaves) nunca entram no código nem no repositório.',
            'meu-projeto/\n  package.json\n  .gitignore      <- lista node_modules e .env\n  src/\n    index.js      <- arquivo de entrada'
          ),
          sl(
            'Erros comuns de quem começa',
            '1) Digitar "node ola.js" dentro do REPL (o ">" indica que você está nele; saia antes). 2) Rodar o comando na pasta errada: o caminho do arquivo é relativo à pasta atual do terminal; confira com cd/ls. 3) Esquecer de salvar o arquivo antes de rodar. 4) Instalar o Node com permissões de administrador e copiar comandos desconhecidos que pedem sudo. 5) Usar uma versão muito antiga do Node por não conferir node -v antes de seguir um tutorial recente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você vai colocar uma API no ar para clientes reais. Qual versão do Node.js é a mais indicada?', 'c', [
          'A Current mais recente, porque tem as correções já incorporadas e as mudanças experimentais estáveis',
          'A versão mais antiga que ainda abre seu código, pois versões velhas já foram muito testadas',
          'Uma versão LTS com suporte ainda ativo',
          'Qualquer versão, já que o suporte de segurança é o mesmo em todas as linhas'
        ], 'LTS tem suporte longo e correções de segurança, ideal para produção. Current muda mais e tem suporte curto; versões sem suporte deixam de receber correções; as linhas não têm o mesmo suporte.'),
        mcq('q2', 'Qual comando mostra a versão do Node instalada?', 'a', [
          'node -v',
          'node --install',
          'npm start',
          'node version.js'
        ], 'node -v imprime a versão. As demais opções não existem como estão (--install), iniciam um script do projeto (npm start) ou tentam rodar um arquivo chamado version.js.'),
        mcq('q3', 'Um tutorial manda executar "curl endereço-desconhecido | sh" para instalar o Node. Qual é a melhor atitude?', 'd', [
          'Executar com sudo para evitar erros de permissão no meio da instalação',
          'Executar, pois todo comando que aparece em tutorial passou por revisão de quem o publicou',
          'Executar depois de desativar o antivírus, para ele não bloquear o instalador',
          'Preferir a fonte oficial e, se usar script remoto, ler o conteúdo antes de executar'
        ], 'Esse padrão executa o que o endereço devolver com as suas permissões; por isso se usa a fonte oficial e se lê o script antes. Dar mais permissão ou desligar proteção só aumenta o risco, e tutorial não é garantia de segurança.'),
        fill('q4', 'Complete com o comando que executa o arquivo servidor.js no Node.', '$ ___ servidor.js', ['node'], 'O comando node seguido do nome do arquivo executa o programa.'),
        mcq('q5', 'O que é o REPL do Node?', 'b', [
          'Um servidor web de teste que já vem configurado na porta 3000 para mostrar páginas de exemplo',
          'Um terminal interativo que lê uma linha de JavaScript, executa e imprime o resultado',
          'Um programa que reinicia o seu script toda vez que o arquivo é modificado',
          'Um modo de instalação que baixa pacotes de forma automática ao digitar um nome'
        ], 'REPL é Read-Eval-Print Loop: lê, executa, imprime, repete, ótimo para experimentar. Não é servidor de teste, nem reinício automático, nem instalador de pacotes.'),
        mcq('q6', 'Por que um gerenciador de versões como nvm ou fnm é útil?', 'a', [
          'Permite ter várias versões do Node instaladas e trocar de versão conforme o projeto',
          'Compacta o código-fonte e remove os comentários para que o projeto ocupe menos espaço em disco',
          'Corrige automaticamente os erros de sintaxe do código antes de executar o arquivo no terminal',
          'Substitui o npm e baixa pacotes direto do repositório do projeto'
        ], 'O ponto central é conviver com versões diferentes e alternar por projeto. Eles não compactam código, não corrigem sintaxe e não substituem o npm.'),
        mcq('q7', 'Você roda "node app.js" e recebe um erro dizendo que o módulo/arquivo não foi encontrado, mas o arquivo existe em outra pasta. Qual a causa mais provável?', 'd', [
          'O Node ainda não terminou de instalar os módulos nativos necessários para abrir o arquivo',
          'O arquivo precisa ser compilado antes de ser executado pelo Node',
          'O terminal precisa de permissão de administrador para ler arquivos .js',
          'O terminal está em outra pasta; o caminho do arquivo é relativo à pasta atual'
        ], 'O caminho do arquivo é resolvido a partir da pasta atual do terminal; mudar de pasta (cd) ou informar o caminho certo resolve. Não há compilação prévia, nem instalação pendente, nem exigência de administrador.'),
        fill('q8', 'Complete com o nome do arquivo que descreve o projeto Node (nome, scripts, dependências).', 'meu-projeto/\n  ___\n  src/index.js', ['package.json'], 'O package.json é a identidade do projeto; será detalhado na lição de npm.')
      ]
    },
    {
      id: 'njb-03-javascript-variaveis-e-tipos',
      title: 'JavaScript: variáveis e tipos',
      goal: 'Declarar variáveis com let e const, conhecer os tipos primitivos e evitar as armadilhas de ==, NaN e coerção.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Declarando variáveis: let e const',
            'Em JavaScript moderno você declara variáveis com duas palavras. const cria uma ligação que NÃO pode ser reatribuída (o nome sempre aponta para o mesmo valor). let cria uma variável que pode receber outro valor depois. Regra de ouro: use const por padrão e let só quando precisar reatribuir. Há uma terceira forma, var, herdada do JavaScript antigo; ela tem regras de escopo confusas (veremos na lição de escopo) e é evitada em código novo. Tentar reatribuir uma const gera um erro em tempo de execução. Importante: const impede reatribuir o NOME, mas não "congela" objetos e arrays (veremos adiante).',
            'const nome = "Ana";\nlet idade = 30;\nidade = idade + 1;\nconsole.log(`Olá, ${nome}! Idade: ${idade}`);\ntry { nome = "Bia"; } catch (e) { console.log(e.name + ": " + e.message); }\n// saída real:\n// Olá, Ana! Idade: 31\n// TypeError: Assignment to constant variable.'
          ),
          sl(
            'Tipos primitivos e typeof',
            'Os valores primitivos são: number (inteiros e decimais, todos no mesmo tipo), string (texto), boolean (true/false), undefined (variável declarada sem valor), null (ausência intencional de valor), bigint (inteiros enormes, com sufixo n) e symbol (identificador único, raro no dia a dia). O operador typeof devolve o nome do tipo como texto. Atenção a uma peculiaridade histórica: typeof null devolve "object" (é um erro antigo da linguagem, mantido por compatibilidade); null NÃO é um objeto.',
            'console.log(typeof 42, typeof "oi", typeof true, typeof undefined, typeof null, typeof 10n);\n// saída real:\n// number string boolean undefined object bigint'
          ),
          sl(
            'undefined x null e template strings',
            'undefined significa "ainda não recebeu valor" e é o que o JavaScript dá a uma variável sem valor ou a uma propriedade que não existe. null é um valor que VOCÊ atribui para dizer "não há valor aqui, de propósito". Para montar textos, use template strings: texto entre crases (`) com expressões dentro de ${ }. Elas substituem a concatenação com + e aceitam várias linhas. Aspas simples ou duplas servem para strings comuns; só crases permitem ${ }.',
            'let x;\nconsole.log(x);                 // undefined\nconst nome = "Ana";\nconsole.log(`Olá, ${nome}! 2+2 = ${2 + 2}`);\n// saída real:\n// undefined\n// Olá, Ana! 2+2 = 4'
          ),
          sl(
            'Números, NaN e ponto flutuante',
            'Todos os números são number (ponto flutuante de 64 bits). Daí vem uma pegadinha que existe em várias linguagens: 0.1 + 0.2 não dá exatamente 0.3, por causa da forma binária de armazenar decimais. Não compare decimais com ===; para dinheiro, trabalhe com inteiros em centavos. Uma conta impossível (como Number("abc")) resulta em NaN (Not a Number), que tem uma esquisitice: NaN não é igual a nada, nem a si mesmo (NaN === NaN dá false). Para testar, use Number.isNaN(valor).',
            'console.log(0.1 + 0.2, 0.1 + 0.2 === 0.3);\nconsole.log(Number("abc"), Number.isNaN(Number("abc")), NaN === NaN);\n// saída real:\n// 0.30000000000000004 false\n// NaN true false'
          ),
          sl(
            '== x === e coerção',
            'O operador === (igualdade estrita) compara valor E tipo: 5 === "5" é false. O operador == (igualdade frouxa) tenta CONVERTER os tipos antes de comparar (coerção), o que gera resultados surpreendentes: 0 == "" é true, null == undefined é true. Regra: use sempre === e !==. A coerção também acontece em contas: "5" + 3 vira o texto "53" (o + com texto concatena), enquanto "5" - 3 vira o número 2 (o - só faz sentido com números). Para converter de forma explícita e previsível, use Number(valor) ou String(valor).',
            'console.log(5 == "5", 5 === "5", 0 == "", null == undefined, null === undefined);\nconsole.log("5" + 3, "5" - 3, Number(" 12 "));\n// saída real:\n// true false true true false\n// 53 2 12'
          ),
          sl(
            'Resumo e armadilhas',
            'Resumo: const por padrão, let quando precisar mudar, evite var; typeof para inspecionar tipos (com a exceção de null); === sempre; Number.isNaN para NaN; template strings para montar texto. Armadilhas frequentes: concatenar número com texto sem perceber ("1" + 1 = "11"); comparar decimais; usar if (valor) esperando só "existe", sem lembrar que 0, "" e NaN também são tratados como falsos (veremos em fluxo e funções). Dado vindo de fora (entrada do usuário, variáveis de ambiente, parâmetros de URL) chega como TEXTO: valide e converta antes de usar em contas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual declaração é a mais adequada para um valor que não será reatribuído?', 'd', [
          'var limite = 100;',
          'let limite = 100;',
          'limite = 100; sem palavra de declaração',
          'const limite = 100;'
        ], 'const comunica e garante que o nome não será reatribuído. let permitiria reatribuir sem necessidade, var tem escopo confuso e atribuir sem declarar cria variável global implícita, prática ruim.'),
        mcq('q2', 'O que o código `const total = 10; total = 20;` faz?', 'b', [
          'Muda o valor de total para 20, pois const só impede o uso de total antes da declaração',
          'Lança um TypeError, porque uma const não pode ser reatribuída',
          'Cria uma segunda variável total, e a segunda atribuição esconde a primeira',
          'Ignora a segunda linha sem mostrar erro e mantém o valor 10'
        ], 'Reatribuir const lança TypeError em tempo de execução. Não muda o valor, não cria outra variável e não é ignorado silenciosamente.'),
        mcq('q3', 'Qual é o resultado de `"5" + 3` e de `"5" - 3`, nessa ordem?', 'c', [
          '8 e 2, porque o JavaScript converte tudo para número antes de calcular',
          '"53" e "2", pois os dois operadores devolvem texto quando há uma string',
          '"53" e 2, porque + concatena com texto e - converte para número',
          '8 e "2", porque só o operador + converte o texto em número'
        ], 'O + com uma string concatena (resulta em "53"); o - força conversão numérica (resulta em 2). Por isso é recomendável converter com Number() de forma explícita.'),
        fill('q4', 'Complete com o operador de igualdade estrita (compara valor e tipo) para que o resultado seja false.', 'console.log(5 ___ "5"); // false', ['==='], 'O operador === compara valor e tipo, então 5 === "5" é false. Já 5 == "5" daria true por causa da coerção.'),
        mcq('q5', 'O que `typeof null` devolve?', 'a', [
          '"object", uma peculiaridade histórica da linguagem',
          '"null", porque null é um tipo próprio e o typeof o nomeia',
          '"undefined", pois null e undefined representam a mesma ideia',
          '"boolean", já que null é tratado como falso'
        ], 'typeof null devolve "object" por um erro antigo mantido por compatibilidade. Não retorna "null" nem "undefined", e não é boolean.'),
        mcq('q6', 'Você precisa conferir se o resultado de `Number("abc")` é NaN. Qual forma funciona?', 'b', [
          'resultado === NaN, pois a comparação estrita funciona com NaN',
          'Number.isNaN(resultado)',
          'resultado == null, que também captura valores inválidos',
          'typeof resultado === "NaN", já que NaN é um tipo à parte'
        ], 'NaN nunca é igual a nada, nem a si, então === falha; use Number.isNaN. == null não detecta NaN e typeof NaN devolve "number", nunca "NaN".'),
        mcq('q7', 'Em `0.1 + 0.2 === 0.3`, por que o resultado é false?', 'd', [
          'Porque o JavaScript soma os números como texto e depois compara o resultado com 0.3 de forma exata',
          'Porque 0.1 é tratado como inteiro e perde a parte decimal durante a conta feita pelo motor',
          'Porque === só funciona com números inteiros e não com decimais',
          'Porque decimais são guardados em binário aproximado e a soma dá 0.30000000000000004'
        ], 'A representação binária dos decimais é aproximada, então a soma fica ligeiramente diferente de 0.3. Por isso valores monetários devem usar inteiros (centavos).'),
        fill('q8', 'Complete com a palavra que declara uma variável cujo valor pode mudar depois.', '___ contador = 0;\ncontador = contador + 1;', ['let'], 'let declara uma variável que pode ser reatribuída; const não permitiria a segunda linha.')
      ]
    },
    {
      id: 'njb-04-javascript-fluxo-e-funcoes',
      title: 'JavaScript: fluxo e funções',
      goal: 'Controlar o fluxo com if, switch e laços e escrever funções (declaração, expressão e arrow) com parâmetros padrão, retorno, rest e spread.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Condições: if/else e valores "falsos"',
            'if (condição) { ... } else if (outra) { ... } else { ... } executa o primeiro bloco cuja condição for verdadeira. O JavaScript aceita qualquer valor como condição e o converte para booleano. Os valores tratados como FALSOS ("falsy") são: false, 0, "" (texto vazio), null, undefined e NaN. Todo o resto é verdadeiro ("truthy"), inclusive "0" e [] (array vazio). Cuidado: if (quantidade) é falso quando a quantidade é 0, o que pode não ser o que você quer; quando 0 é um valor válido, compare explicitamente (quantidade !== undefined).',
            'function nota(n) {\n  if (n >= 7) return "aprovado";\n  else if (n >= 5) return "recuperação";\n  return "reprovado";\n}\nconsole.log(nota(8), nota(6), nota(2));\n// saída real:\n// aprovado recuperação reprovado'
          ),
          sl(
            'switch e laços',
            'switch compara um valor com vários case com ===. Cada case precisa terminar com break; sem ele a execução "cai" no case seguinte (fall-through), uma fonte clássica de bugs. Laços: for (let i = 0; i < 3; i++) é o laço contado; while (condição) repete enquanto verdadeira; for...of percorre os elementos de algo iterável, como texto ou array, e é o mais legível para listas. Evite for...in em arrays (ele percorre chaves, não valores).',
            'switch ("b") {\n  case "a": console.log("A"); break;\n  case "b": console.log("B");   // sem break: cai no próximo\n  case "c": console.log("C (caiu direto)"); break;\n  default: console.log("outro");\n}\nfor (let i = 0; i < 3; i++) console.log("i =", i);\nfor (const letra of "JS") console.log(letra);\n// saída real:\n// B\n// C (caiu direto)\n// i = 0\n// i = 1\n// i = 2\n// J\n// S'
          ),
          sl(
            'Funções: três formas de escrever',
            'Uma função agrupa código reutilizável. Declaração: function dobro(n) { return n * 2; }. Expressão de função: const soma = function (a, b) { return a + b; }; (a função é um valor guardado numa variável). Arrow function (função de seta): const saudar = (nome) => `Olá, ${nome}`;, forma curta muito usada em callbacks; se o corpo é uma única expressão, o return é implícito (sem chaves). Em JavaScript funções são valores como outros: podem ser guardadas em variáveis, passadas como argumento e devolvidas por outras funções.',
            'function dobro(n) { return n * 2; }\nconst soma = function (a, b) { return a + b; };\nconst saudar = (nome = "visitante") => `Olá, ${nome}`;\nconsole.log(dobro(4), soma(2, 3), saudar(), saudar("Ana"));\n// saída real:\n// 8 5 Olá, visitante Olá, Ana'
          ),
          sl(
            'Parâmetros padrão e retorno',
            'Parâmetro padrão: (nome = "visitante") usa esse valor quando o argumento NÃO é passado (ou vale undefined). O comando return devolve um valor e encerra a função na hora; uma função sem return devolve undefined. Erro comum: esquecer o return e achar que a função "não funciona" (o resultado vem undefined). Outro: com chaves em uma arrow, o return deixa de ser implícito e precisa ser escrito.',
            'function semRetorno() {}\nconsole.log(semRetorno());\nconst a = (x) => x * 2;          // return implícito\nconst b = (x) => { x * 2; };     // chaves: sem return -> undefined\nconsole.log(a(3), b(3));\n// saída real:\n// undefined\n// 6 undefined'
          ),
          sl(
            'Rest e spread',
            'Os três pontos (...) têm dois usos. REST na lista de parâmetros: function somaTudo(...nums) reúne todos os argumentos recebidos em um array chamado nums, aceitando quantidade variável. SPREAD na chamada: Math.max(...lista) "espalha" os elementos do array como argumentos separados. Mesma notação, direções opostas: rest junta, spread espalha. O rest deve ser sempre o último parâmetro.',
            'function somaTudo(...nums) {\n  let t = 0;\n  for (const n of nums) t += n;\n  return t;\n}\nconsole.log(somaTudo(1, 2, 3, 4));\nconst lista = [5, 1, 9];\nconsole.log(Math.max(...lista));\n// saída real:\n// 10\n// 9'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: if/else com valores falsy (false, 0, "", null, undefined, NaN); switch com break; for, while e for...of; funções por declaração, expressão ou arrow; padrão evita undefined; return encerra e devolve; rest junta, spread espalha. Erros comuns: esquecer o break no switch, esquecer o return, usar if (x) quando 0 é válido, e esquecer que arrow com chaves exige return explícito. Dica de segurança: nunca monte instruções a partir de entrada do usuário (como passar texto para eval); valide a entrada antes de decidir o fluxo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual destes valores é tratado como verdadeiro (truthy) em um if?', 'a', [
          '"0" (texto com o dígito zero)',
          '0 (o número zero, escrito sem aspas)',
          '"" (texto vazio, sem nenhum caractere)',
          'NaN (o resultado de uma conta inválida)'
        ], 'Qualquer texto não vazio, inclusive "0", é truthy. 0, "" e NaN estão entre os valores falsy.'),
        mcq('q2', 'No switch abaixo, qual é a saída? switch (2) { case 2: console.log("dois"); case 3: console.log("três"); break; default: console.log("outro"); }', 'd', [
          'Só "dois", porque o primeiro case que casa encerra o switch sozinho',
          'Só "três", pois o último case válido vence',
          '"dois", "três" e "outro", porque o default executa por último em qualquer switch',
          '"dois" e "três": sem break no primeiro case, a execução cai no seguinte'
        ], 'Sem break, o fluxo continua no case seguinte (fall-through) até encontrar um break. O default só roda se nenhum case casar ou se o fluxo cair até ele.'),
        mcq('q3', 'Qual laço é a forma mais direta de percorrer os valores de um array?', 'b', [
          'for (const i in lista), que entrega os valores um a um',
          'for (const item of lista)',
          'while (lista), que avança sozinho pelos elementos',
          'switch (lista), que testa cada posição'
        ], 'for...of entrega cada elemento. for...in percorre chaves (índices em texto), while com array não avança sozinho e switch não é laço.'),
        fill('q4', 'Complete com a palavra que devolve o valor da função e a encerra.', 'function dobro(n) {\n  ___ n * 2;\n}', ['return'], 'return devolve o valor e encerra a execução da função; sem ele o resultado seria undefined.'),
        mcq('q5', 'O que o código `const f = (x) => { x * 2; }; console.log(f(3));` imprime?', 'c', [
          '6, porque arrow functions devolvem o resultado da última linha',
          'NaN, porque x é tratado como texto dentro das chaves',
          'undefined, porque com chaves o return não é implícito',
          'Um erro de sintaxe, porque arrow functions não aceitam chaves'
        ], 'Com chaves o corpo é um bloco e o return precisa ser explícito; sem ele o retorno é undefined. Sem chaves o retorno seria implícito.'),
        mcq('q6', 'Para que serve `function soma(...nums)`?', 'd', [
          'Para espalhar os elementos de um array em argumentos separados dentro de uma chamada',
          'Para impedir que a função receba argumentos acima do número de parâmetros',
          'Para copiar o array nums antes de modificá-lo dentro da função',
          'Para reunir os argumentos recebidos em um array chamado nums'
        ], 'Na lista de parâmetros, ... é rest e junta os argumentos num array. Espalhar elementos é o spread na chamada.'),
        mcq('q7', 'Dado `const saudar = (nome = "visitante") => `Olá, ${nome}`;`, o que `saudar()` devolve?', 'b', [
          '"Olá, undefined", porque o parâmetro não foi informado',
          '"Olá, visitante"',
          'Um erro, porque o parâmetro nome é obrigatório',
          '"Olá, null", porque argumentos ausentes viram null'
        ], 'O parâmetro padrão é usado quando o argumento falta ou vale undefined. Não há erro por falta de argumento e o valor ausente é undefined, não null.'),
        fill('q8', 'Complete para obter o maior valor do array espalhando seus elementos como argumentos.', 'const lista = [5, 1, 9];\nconsole.log(Math.max(___lista));', ['...'], 'Os três pontos (spread) espalham os elementos da lista como argumentos separados de Math.max.')
      ]
    },
    {
      id: 'njb-05-javascript-arrays-e-objetos',
      title: 'JavaScript: arrays e objetos',
      goal: 'Manipular arrays com map, filter, reduce e companhia; usar objetos, desestruturação, spread, JSON, optional chaining e ??.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Arrays e os métodos mais usados',
            'Array é uma lista ordenada, indexada a partir de 0. push adiciona ao final. Os métodos funcionais recebem uma função e NÃO alteram o array original (devolvem um novo valor): map transforma cada elemento e devolve um array do mesmo tamanho; filter mantém só os elementos para os quais a função devolve verdadeiro; reduce acumula tudo em um único valor (recebe a função e o valor inicial); find devolve o PRIMEIRO elemento que satisfaz a condição (ou undefined se nenhum); some pergunta "algum satisfaz?"; every pergunta "todos satisfazem?". Note que push é diferente: ele MODIFICA o array.',
            'const nums = [1, 2, 3, 4, 5];\nnums.push(6);\nconsole.log(nums.map(n => n * 2));\nconsole.log(nums.filter(n => n % 2 === 0));\nconsole.log(nums.reduce((acc, n) => acc + n, 0));\nconsole.log(nums.find(n => n > 3), nums.find(n => n > 99));\nconsole.log(nums.some(n => n > 5), nums.every(n => n > 0));\n// saída real:\n// [ 2, 4, 6, 8, 10, 12 ]\n// [ 2, 4, 6 ]\n// 21\n// 4 undefined\n// true true'
          ),
          sl(
            'Objetos',
            'Objeto é uma coleção de pares chave: valor, escritos entre chaves. Acesse com ponto (usuario.nome) ou colchetes (usuario["nome"], útil quando a chave está numa variável). Objetos podem conter outros objetos, arrays e funções. Atenção: const protege o NOME, não o conteúdo; você pode alterar propriedades de um objeto declarado com const, só não pode reatribuí-lo. Ao copiar com atribuição simples (const b = a) NÃO se cria cópia: os dois nomes apontam para o mesmo objeto.',
            'const user = { nome: "Ana", idade: 30, endereco: { cidade: "Recife" } };\nuser.idade = 31;           // permitido, mesmo com const\nconsole.log(user.nome, user["idade"]);\n\nconst a = { x: 1 };\nconst b = a;               // NÃO copia: mesmo objeto\nb.x = 2;\nconsole.log(a.x);          // 2'
          ),
          sl(
            'Desestruturação e spread',
            'Desestruturação extrai valores em variáveis de uma só vez: const { nome, idade } = usuario; (por nome da propriedade) e const [primeiro, ...resto] = lista; (por posição). O spread de objeto { ...usuario, idade: 31 } cria uma NOVA cópia (rasa) com as propriedades alteradas, sem mexer no original. "Rasa" quer dizer que objetos aninhados continuam compartilhados entre original e cópia.',
            'const user = { nome: "Ana", idade: 30 };\nconst nums = [1, 2, 3, 4, 5, 6];\nconst { nome, idade } = user;\nconst [primeiro, ...resto] = nums;\nconsole.log(nome, idade, primeiro, resto);\nconst copia = { ...user, idade: 31 };\nconsole.log(copia, user.idade);\n// saída real:\n// Ana 30 1 [ 2, 3, 4, 5, 6 ]\n// { nome: \'Ana\', idade: 31 } 30'
          ),
          sl(
            'JSON: stringify e parse',
            'JSON é um formato de texto para trocar dados, parecido com objetos JavaScript, mas mais rígido (chaves sempre entre aspas duplas, sem funções). JSON.stringify(objeto) converte um objeto em texto JSON; JSON.parse(texto) faz o caminho inverso. Se o texto não for JSON válido, JSON.parse lança um erro (SyntaxError), por isso, ao ler dados que vêm de fora (arquivos, requisições), envolva em try/catch. Nunca use eval para "ler" JSON: eval executa código e é perigoso com entrada de terceiros.',
            'const txt = JSON.stringify({ nome: "Ana", idade: 30 });\nconsole.log(txt);\nconsole.log(JSON.parse(txt).nome);\ntry { JSON.parse("{quebrado"); } catch (e) { console.log(e.name); }\n// saída real:\n// {"nome":"Ana","idade":30}\n// Ana\n// SyntaxError'
          ),
          sl(
            'Optional chaining (?.) e ??',
            'Acessar uma propriedade de algo que é undefined ou null gera TypeError ("Cannot read properties of undefined"). O optional chaining (?.) interrompe a cadeia e devolve undefined em vez de erro: usuario.contato?.email. O operador ?? (nullish coalescing) fornece um valor padrão APENAS quando o lado esquerdo é null ou undefined. Diferente do ||, que troca qualquer valor falsy (inclusive 0 e ""): 0 || "padrão" dá "padrão", mas 0 ?? "padrão" dá 0. Use ?? quando 0, "" ou false são valores legítimos.',
            'const user = { nome: "Ana" };\nconsole.log(user.contato?.email, user.contato?.email ?? "sem e-mail");\nconsole.log(0 || "padrão", 0 ?? "padrão");\n// saída real:\n// undefined sem e-mail\n// padrão 0\n\n// sem ?. , user.contato.email lança:\n// TypeError: Cannot read properties of undefined (reading \'email\')'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: map transforma, filter seleciona, reduce acumula, find acha o primeiro, some/every perguntam; objetos guardam chave: valor; desestruturação extrai; spread copia (de forma rasa); JSON converte de/para texto; ?. e ?? lidam com ausência. Erros comuns: esquecer o valor inicial do reduce; achar que map altera o array original; achar que const impede mudar o conteúdo; copiar objeto com "=" e alterar o original sem querer; usar || onde ?? é o correto. Privacidade: ao transformar ou registrar objetos de usuário, copie só os campos necessários (minimização), sem espalhar dados pessoais por logs.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você tem `const precos = [10, 20, 30];` e precisa de um novo array com cada preço acrescido de 10%. Qual método usar?', 'c', [
          'filter, porque ele aplica uma função a cada elemento e devolve os novos valores',
          'reduce, porque devolve um array com o mesmo tamanho do original',
          'map, que transforma cada elemento e devolve um novo array',
          'find, que devolve o primeiro elemento já com a transformação feita'
        ], 'map transforma cada elemento e devolve um array novo. filter seleciona (não transforma), reduce acumula em um valor e find devolve um único elemento.'),
        mcq('q2', 'O que `[1, 2, 3, 4].filter(n => n > 2)` devolve?', 'a', [
          '[3, 4]',
          '[true, true]',
          '3, o primeiro elemento que passou no teste',
          '[1, 2]'
        ], 'filter mantém os elementos cuja função devolve verdadeiro: 3 e 4. O primeiro elemento isolado seria o resultado de find; [1, 2] seria o oposto.'),
        mcq('q3', 'Qual expressão soma todos os valores de `nums`?', 'b', [
          'nums.map((acc, n) => acc + n)',
          'nums.reduce((acc, n) => acc + n, 0)',
          'nums.some((acc, n) => acc + n, 0)',
          'nums.find((acc, n) => acc + n, 0)'
        ], 'reduce acumula tudo em um valor, começando em 0. map devolve array, some devolve booleano e find devolve um elemento.'),
        fill('q4', 'Complete com o método que devolve o primeiro elemento que satisfaz a condição.', 'const achado = [4, 8, 15].___(n => n > 5);\nconsole.log(achado); // 8', ['find'], 'find devolve o primeiro elemento que passa no teste (8) ou undefined se nenhum passar.'),
        mcq('q5', 'Dado `const a = { x: 1 }; const b = a; b.x = 2;`, quanto vale a.x?', 'd', [
          '1, porque b é uma cópia independente de a',
          'undefined, porque b.x foi redefinido em outro objeto',
          '1, porque const impede alterações no conteúdo do objeto',
          '2, porque a e b apontam para o mesmo objeto'
        ], 'Atribuir um objeto a outro nome não copia: os dois nomes apontam para o mesmo objeto. E const não impede alterar propriedades.'),
        mcq('q6', 'Qual a diferença prática entre `0 || 10` e `0 ?? 10`?', 'a', [
          '|| devolve 10 porque 0 é falsy; ?? devolve 0 porque só troca null ou undefined',
          'Nenhuma: os dois operadores devolvem 10 quando o lado esquerdo é 0',
          '|| devolve 0 e ?? devolve 10, porque ?? trata o zero como se fosse ausência de valor',
          'Os dois devolvem 0, pois zero é um número válido para qualquer operador'
        ], '|| troca qualquer valor falsy (inclusive 0); ?? troca só null e undefined. Por isso ?? é o certo quando 0 é legítimo.'),
        mcq('q7', 'Um objeto `usuario` pode não ter a propriedade `contato`. Como ler `email` sem lançar erro?', 'c', [
          'usuario.contato.email, pois o JavaScript devolve undefined sozinho se contato não existir',
          'JSON.parse(usuario.contato).email, que converte o valor ausente em objeto',
          'usuario.contato?.email',
          'usuario.contato = {}.email, que cria contato antes de ler'
        ], 'O optional chaining devolve undefined se contato for undefined/null. Sem ele ocorre TypeError; as outras alternativas não resolvem o problema (a última nem é sintaxe válida).'),
        fill('q8', 'Complete com a função que transforma um texto JSON em objeto.', 'const obj = JSON.___(\'{"a":1}\');', ['parse'], 'JSON.parse converte texto JSON em objeto; JSON.stringify faz o inverso.')
      ]
    },
    {
      id: 'njb-39-javascript-map-set-e-datas',
      title: 'JavaScript: Map, Set e datas',
      goal: 'Escolher entre objeto, Map, Set e array, e trabalhar com Date sem cair nas armadilhas de fuso horário e de mês começando em zero, guardando datas em ISO 8601 (UTC).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Map: dicionário com qualquer tipo de chave',
            'Um Map é uma coleção de pares chave-valor, como um objeto, mas pensada para ser dicionário de verdade. Diferenças que importam: a chave pode ser de qualquer tipo (número, objeto, texto), e o número 1 e o texto "1" são chaves DIFERENTES; ele guarda a ordem de inserção; tem a propriedade size (quantidade de pares); e não tem o risco de colidir com propriedades herdadas do objeto. Métodos principais: set(chave, valor), get(chave) (devolve undefined se não existir), has(chave), delete(chave). Prefira Map quando as chaves são dinâmicas (vêm de dados, como páginas visitadas ou ids) ou quando você insere e remove muito; prefira objeto comum para registros com campos fixos e conhecidos, como { nome, idade }, e para dados que viram JSON diretamente.',
            'const visitas = new Map();\nfor (const p of ["/home", "/sobre", "/home"]) {\n  visitas.set(p, (visitas.get(p) ?? 0) + 1);\n}\nconsole.log(visitas);\n// saída real:\n// Map(2) { \'/home\' => 2, \'/sobre\' => 1 }'
          ),
          sl(
            'Iterando um Map e comparando com objeto',
            'Um Map é iterável: com for...of cada passo entrega um par [chave, valor], que você desestrutura. Também existem keys(), values() e entries(). Veja a diferença de chaves: no objeto, as chaves viram texto, então o[1] e o["1"] são a mesma propriedade; no Map, 1 e "1" ficam separados. Erro comum: tentar usar visitas["/home"] = 1 em um Map: isso cria uma propriedade comum no objeto Map, sem passar pela coleção (size continua 0). Para um Map, use sempre set e get.',
            'for (const [pagina, n] of visitas) console.log(pagina, n);\nconst o = {}; o[1] = "a"; o["1"] = "b";\nconst m = new Map(); m.set(1, "a"); m.set("1", "b");\nconsole.log(Object.keys(o).length, m.size);\n// saída real:\n// /home 2\n// /sobre 1\n// 1 2'
          ),
          sl(
            'Set: valores únicos',
            'Um Set guarda valores SEM repetição. Adicionar um valor que já existe não faz nada. Métodos: add(valor), has(valor), delete(valor) e a propriedade size. Também é iterável, na ordem de inserção. Usos típicos: remover duplicatas de um array (passe o array ao construtor e abra de volta com o operador spread ...) e testar pertencimento rapidamente (set.has(id)) em vez de percorrer um array inteiro com includes. A comparação de valores é por igualdade estrita, então dois objetos diferentes com o mesmo conteúdo são considerados valores distintos.',
            'console.log([...new Set([3, 1, 3, 2, 1])]);\n// saída real:\n// [ 3, 1, 2 ]\nconst vistos = new Set();\nvistos.add("ana").add("ana");\nconsole.log(vistos.size, vistos.has("ana"));   // 1 true'
          ),
          sl(
            'Date: criação, mês zero e UTC x local',
            'Um Date representa um instante no tempo (internamente, milissegundos desde 1970 em UTC). Criar: new Date() (agora), new Date("texto ISO"), new Date(ano, mês, dia, ...) ou Date.UTC(...). Armadilha 1: o MÊS começa em ZERO (0 = janeiro, 11 = dezembro), mas o dia começa em 1; new Date(2025, 12, 1) não dá erro, "transborda" para janeiro de 2026. Armadilha 2: métodos como getHours() e getMonth() usam o fuso do computador (local), enquanto getUTCHours() e getUTCMonth() usam UTC; o mesmo instante mostra horas diferentes em máquinas diferentes. Armadilha 3: texto inválido gera um Date inválido, cujo getTime() é NaN, sem lançar erro. Armadilha 4: um texto só com data, como "2025-03-10", é lido como meia-noite em UTC; em um computador com fuso de Brasília, isso aparece como 9 de março à noite se você usar métodos locais.',
            'const d = new Date(Date.UTC(2025, 0, 15, 12, 0));\nconsole.log(d.toISOString());   // 2025-01-15T12:00:00.000Z\nconsole.log(d.getUTCMonth());   // 0 (janeiro)\nconsole.log(new Date("2025-03-10").toISOString());\nconsole.log(new Date(2025, 12, 1).getFullYear());\nconsole.log(new Date("abc").getTime());\n// saída real:\n// 2025-01-15T12:00:00.000Z\n// 0\n// 2025-03-10T00:00:00.000Z\n// 2026\n// NaN'
          ),
          sl(
            'Formatar para pessoas: Intl e toLocaleString',
            'Para exibir datas a pessoas, use Intl.DateTimeFormat (ou o atalho toLocaleString / toLocaleDateString) com o idioma "pt-BR". Informe timeZone explicitamente quando o resultado não puder depender da máquina: o servidor pode estar em UTC e o usuário em Brasília. Opções úteis: dateStyle ("short", "medium", "long") e timeStyle. Não monte datas concatenando getDate() e getMonth()+1 na mão: é fácil errar o zero à esquerda e o mês. Lembre que formatar é só APRESENTAÇÃO; o valor guardado continua sendo o instante.',
            'const d = new Date(Date.UTC(2025, 0, 15, 12, 0));\nconsole.log(new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(d));\nconsole.log(d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));\n// saída real:\n// 15 de janeiro de 2025\n// 15/01/2025, 09:00:00'
          ),
          sl(
            'Guardar e trafegar datas: ISO 8601 em UTC',
            'Regra prática: guarde e transmita instantes como texto ISO 8601 em UTC, por exemplo 2025-01-15T12:00:00.000Z (o Z final significa UTC). O método toISOString() gera esse formato e o JSON.stringify de um Date já o usa. Esse formato é inequívoco, ordenável como texto e independe de fuso; converta para o fuso do usuário só na hora de EXIBIR. Evite guardar o texto já formatado ("15/01/2025"): ele é ambíguo (dia/mês ou mês/dia?) e perde o instante. Para dados pessoais, lembre da minimização: se você só precisa do ano, não guarde a data de nascimento completa. Resumo: Map para dicionários dinâmicos, Set para unicidade, mês zero, UTC para guardar, Intl para exibir.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você precisa contar quantas vezes cada palavra aparece em um texto, e as palavras só são conhecidas em tempo de execução. Qual estrutura é a mais natural?', 'b', [
          'Um Set, pois cada palavra deve ser guardada uma única vez e o contador fica no próprio valor',
          'Um Map com a palavra como chave e o contador como valor, atualizado com get e set',
          'Um array de palavras, incrementando a posição que corresponde ao número de letras',
          'Um objeto com campos fixos escritos no código, um para cada palavra possível do idioma'
        ], 'Map é o dicionário dinâmico: chave = palavra, valor = contagem, com get/set simples. O Set guarda só valores únicos e não tem onde pôr o contador. Um array indexado por tamanho de palavra mistura palavras diferentes. Campos fixos no objeto exigiriam conhecer as palavras de antemão.'),
        mcq('q2', 'Qual instante representa new Date(2025, 11, 25)?', 'd', [
          'Dia 11 de dezembro de 2025, porque o segundo argumento é o dia',
          'Dia 25 de novembro de 2025, porque o mês é contado a partir de 1',
          'Dia 25 de janeiro de 2026, porque o mês 11 transborda para o ano seguinte',
          '25 de dezembro de 2025, porque o mês começa em zero e 11 é dezembro'
        ], 'O segundo argumento é o mês, e ele começa em zero: 0 = janeiro, 11 = dezembro. O dia é o terceiro argumento (25). Só um mês acima de 11 (como 12) transborda para o ano seguinte.'),
        mcq('q3', 'Qual é a melhor forma de gravar em um arquivo JSON o momento em que um pedido foi criado?', 'a', [
          'Texto ISO 8601 em UTC, gerado com toISOString(), convertendo para o fuso do usuário só ao exibir',
          'Texto já formatado para o usuário, como "15/01/2025 09:00", porque quem abrir o arquivo entende a data sem converter nada',
          'Texto com o horário local do servidor, sem indicar fuso, para que o dia gravado coincida com o que o servidor mostrava na hora',
          'Dois campos numéricos separados, dia e mês, com o mês começando em 1 por clareza, deixando hora e ano em outro campo'
        ], 'ISO 8601 em UTC é inequívoco, ordenável e independe do fuso do servidor ou do cliente. O texto formatado é ambíguo e perde o instante; o horário local sem fuso muda de significado conforme a máquina; campos soltos perdem hora e ano e confundem a convenção do mês.'),
        fill('q4', 'Complete a criação de uma coleção sem valores repetidos.', 'const unicos = new ___([1, 2, 2, 3]);\nconsole.log(unicos.size);   // 3', ['Set'], 'new Set([...]) descarta repetidos: sobram 1, 2 e 3, e size vale 3.'),
        mcq('q5', 'Um servidor em fuso de Brasília recebe "2025-03-10" e faz new Date("2025-03-10"). Ao exibir com getDate() (método local), pode aparecer dia 9. Por quê?', 'c', [
          'Porque o Date perde um dia ao converter texto, um defeito conhecido dos anos bissextos',
          'Porque getDate() devolve o dia anterior ao real, já que o dia começa em zero',
          'Porque a data sem hora é lida como 00:00 UTC, que em Brasília ainda é a noite do dia 9',
          'Porque o fuso de Brasília não aceita datas sem hora e volta um dia para compensar a falta do horário'
        ], 'Um texto ISO só com data é interpretado como 00:00 em UTC. Brasília está atrás de UTC, então esse instante cai na noite do dia anterior e os métodos locais mostram dia 9. Date não perde dias, getDate() começa em 1 (o zero é do mês) e não existe essa regra no fuso.'),
        mcq('q6', 'Como exibir um Date em português do Brasil, no horário de Brasília, independentemente do fuso da máquina onde o código roda?', 'b', [
          'Usar getHours() e getMinutes() e concatenar o texto manualmente com dois-pontos',
          'Usar toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) ou um Intl.DateTimeFormat equivalente',
          'Chamar toISOString() e mostrar o resultado, pois o Z já converte para o horário local',
          'Somar três horas ao Date com aritmética de milissegundos antes de formatar'
        ], 'Intl/toLocaleString com idioma e timeZone explícitos produz a formatação correta em qualquer máquina. getHours() usa o fuso da máquina e a concatenação manual erra zeros. O Z de toISOString() significa UTC, não horário local. Somar horas fixas ignora mudanças de regra do fuso e distorce o instante.'),
        mcq('q7', 'Sobre as chaves 1 (número) e "1" (texto), o que acontece em um Map e em um objeto comum?', 'a', [
          'No Map ficam duas entradas distintas; no objeto as duas viram a mesma propriedade "1"',
          'Nos dois casos ficam duas entradas distintas, porque o JavaScript guarda o tipo original da chave em qualquer coleção',
          'Nos dois casos fica uma entrada só, pois o JavaScript converte a chave para texto antes de guardar, seja em objeto ou em Map',
          'No Map ficam as duas como uma só; no objeto ficam separadas, cada uma com o tipo original da chave preservado'
        ], 'O Map compara chaves por igualdade estrita e preserva o tipo: 1 e "1" são entradas separadas (size 2). No objeto, chaves viram texto, então o[1] e o["1"] são a mesma propriedade (1 chave só), como mostrou a saída real.'),
        fill('q8', 'Complete com o método que devolve a data como texto ISO 8601 em UTC.', 'const quando = new Date(Date.UTC(2025, 0, 15));\nconsole.log(quando.___());   // 2025-01-15T00:00:00.000Z', ['toISOString'], 'toISOString() devolve o instante em ISO 8601 com o sufixo Z (UTC), formato recomendado para guardar e trafegar datas.')
      ]
    },
    {
      id: 'njb-06-javascript-escopo-closures-this',
      title: 'JavaScript: escopo, closures e this',
      goal: 'Entender escopo de bloco e de função, closures, hoisting em visão simples e como this se comporta (inclusive em arrow functions).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Escopo: onde uma variável existe',
            'Escopo é a região do código em que um nome é visível. let e const têm escopo de BLOCO: existem só dentro do par de chaves { } onde foram declaradas (um if, um for, uma função). Já var tem escopo de FUNÇÃO: ignora blocos e "vaza" para fora de um if ou for, o que causa bugs; é a principal razão para não usar var. Variáveis declaradas dentro de uma função não existem fora dela. Variáveis de fora são visíveis por dentro (a função "enxerga para fora", nunca o contrário).',
            '{\n  let dentro = 1;\n  var vaza = 2;\n}\nconsole.log(typeof dentro, vaza);\n// saída real:\n// undefined 2\n// (dentro não existe fora do bloco; vaza existe)'
          ),
          sl(
            'Closures: funções que lembram',
            'Uma closure acontece quando uma função guarda acesso às variáveis do lugar onde foi CRIADA, mesmo depois de esse lugar ter terminado. No exemplo, contador() cria a variável n e devolve uma função interna; mesmo depois de contador() terminar, a função devolvida continua enxergando e alterando o SEU n. Cada chamada a contador() cria um n novo e independente. Closures servem para guardar estado privado, criar funções configuradas e são a base de muitos padrões do Node (callbacks e promises as usam o tempo todo).',
            'function contador() {\n  let n = 0;\n  return () => { n++; return n; };\n}\nconst c1 = contador();\nconst c2 = contador();\nconsole.log(c1(), c1(), c1(), c2());\n// saída real:\n// 1 2 3 1'
          ),
          sl(
            'Hoisting em visão simples',
            'Hoisting ("içamento") é o comportamento em que declarações são registradas antes de o código rodar. Consequência prática: uma DECLARAÇÃO de função (function ola() {}) pode ser chamada antes da linha em que aparece. Já let e const também são registrados, mas ficam numa "zona morta temporal" até a linha da declaração: usar antes lança ReferenceError. Funções guardadas em const (expressões e arrows) NÃO podem ser chamadas antes da linha da declaração. Regra simples: declare antes de usar e você nunca depende do hoisting.',
            'console.log(ola());\nfunction ola() { return "hoisting de função"; }\ntry { console.log(a); let a = 1; } catch (e) { console.log(e.name); }\n// saída real:\n// hoisting de função\n// ReferenceError'
          ),
          sl(
            'this: quem está chamando',
            'Dentro de uma função comum, this depende de COMO a função é chamada. Chamada como método (pessoa.normal()), this é o objeto antes do ponto. Se você extrai a função para uma variável e a chama solta, this se perde (deixa de ser a pessoa e, no arquivo CommonJS comum, vira o objeto global ou undefined), e this.nome vira undefined. Arrow functions NÃO têm this próprio: usam o this do lugar onde foram escritas. Por isso são ótimas dentro de métodos (um callback arrow dentro de um método enxerga o this do método), mas ruins como método de objeto.',
            'const pessoa = {\n  nome: "Ana",\n  normal() { return this.nome; },\n  atrasado() { return [1].map(() => this.nome); }\n};\nconsole.log(pessoa.normal(), pessoa.atrasado());\nconst solto = pessoa.normal;\nconsole.log(solto());\n// saída real:\n// Ana [ \'Ana\' ]\n// undefined'
          ),
          sl(
            'bind em conceito e resumo',
            'bind cria uma NOVA função com o this já fixado: pessoa.normal.bind({ nome: "Beto" }) devolve uma função que sempre usa aquele objeto como this. Existem também call e apply, que chamam a função na hora definindo o this. Resumo: let/const têm escopo de bloco, var de função; closure = função que lembra o ambiente onde nasceu; hoisting permite chamar declarações de função antes, mas não const/let; this depende de como se chama, e arrow usa o this de fora. Erro comum: passar um método como callback (por exemplo, setTimeout(pessoa.normal)) e perder o this; corrija com arrow ou bind.',
            'const preso = pessoa.normal.bind({ nome: "Beto" });\nconsole.log(preso());\n// saída real:\n// Beto'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código `{ let a = 1; var b = 2; } console.log(typeof a, b);` imprime?', 'b', [
          'number 2, porque as duas variáveis continuam visíveis depois do bloco',
          'undefined 2, porque let fica preso ao bloco e var vaza para fora dele',
          'undefined undefined, porque o bloco apaga todas as variáveis ao terminar',
          'number undefined, porque var é a variável que fica restrita ao bloco'
        ], 'let tem escopo de bloco (fora dele typeof a dá "undefined"); var tem escopo de função e continua visível (b vale 2).'),
        mcq('q2', 'Em `function criar() { let n = 0; return () => ++n; } const f = criar(); f(); f();`, qual será o valor da próxima chamada f()?', 'd', [
          '1, porque cada chamada a f recria n com o valor inicial 0',
          '0, porque n só existe dentro de criar e some quando ela termina',
          '2, porque o valor de n é guardado dentro da própria função f',
          '3, porque a função devolvida lembra o n e continua incrementando'
        ], 'É uma closure: f continua enxergando o n de criar, que já está em 2; a próxima chamada devolve 3. Não há recriação nem perda da variável.'),
        mcq('q3', 'Qual chamada funciona sem erro, mesmo antes da linha onde a função aparece no arquivo?', 'a', [
          'ola() quando existe function ola() { ... } mais abaixo',
          'ola() quando existe const ola = () => { ... } mais abaixo',
          'ola() quando existe let ola = function () { ... } mais abaixo',
          'Todas as anteriores, pois o JavaScript iça qualquer função antes de executar'
        ], 'Declarações de função sofrem hoisting completo. const/let ficam na zona morta temporal e lançam ReferenceError se usados antes.'),
        fill('q4', 'Complete com a palavra de declaração antiga cujo escopo é de função e que deve ser evitada.', '___ x = 1; // escopo de função, evite em código novo', ['var'], 'var tem escopo de função (vaza de blocos), por isso o código moderno usa let e const.'),
        mcq('q5', 'Dado `const pessoa = { nome: "Ana", f() { return this.nome; } }; const g = pessoa.f; g();`, o que g() devolve?', 'c', [
          '"Ana", porque a função lembra de qual objeto veio',
          'Um erro de sintaxe, porque funções de objeto não podem ser guardadas em variáveis',
          'undefined, porque ao chamar solta a função perde o this da pessoa',
          '"nome", porque this passa a apontar para o nome da variável g'
        ], 'this depende de como a função é chamada: solta, deixa de ser a pessoa e this.nome vira undefined. Guardar um método em variável é válido sintaticamente.'),
        mcq('q6', 'Por que uma arrow function funciona bem como callback dentro de um método de objeto?', 'a', [
          'Porque ela não tem this próprio e usa o this do método onde foi escrita',
          'Porque ela cria um this novo que aponta para o objeto global',
          'Porque ela copia o objeto inteiro para dentro do callback',
          'Porque ela impede que a variável this seja alterada por qualquer código externo'
        ], 'Arrow usa o this léxico (do local onde nasceu). Não cria this novo, não copia o objeto e o motivo não é bloquear alterações.'),
        mcq('q7', 'O que faz `const f = pessoa.normal.bind(outroObjeto)`?', 'd', [
          'Chama pessoa.normal imediatamente e guarda o resultado em f',
          'Copia as propriedades de outroObjeto para dentro de pessoa',
          'Troca o this de pessoa.normal de forma permanente, também para quem usa a original',
          'Cria uma nova função com this fixado em outroObjeto, sem alterar a original'
        ], 'bind devolve uma função nova com o this preso; não executa na hora (isso seria call) e não modifica a função original.'),
        fill('q8', 'Complete com a palavra que declara uma variável de escopo de bloco que não pode ser reatribuída.', '___ limite = 10;\n{ /* dentro do bloco, limite continua visível */ }', ['const'], 'const tem escopo de bloco e não permite reatribuição; é o padrão recomendado.')
      ]
    },
    {
      id: 'njb-07-javascript-classes-e-prototipos',
      title: 'JavaScript: classes e protótipos',
      goal: 'Escrever classes com constructor, métodos, herança, getters/setters e campos privados, e entender a ideia de protótipo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Classes: molde de objetos',
            'Uma classe é um molde para criar objetos com a mesma forma e comportamento. Você a declara com class, define o constructor (função especial chamada ao criar o objeto com new, onde se inicializa this) e métodos (funções que todos os objetos da classe compartilham). Cada new Classe(...) cria uma instância independente. Esquecer o new gera erro, porque a classe precisa ser instanciada.',
            'class Animal {\n  constructor(nome) { this.nome = nome; }\n  falar() { return `${this.nome} faz barulho`; }\n}\nconst a = new Animal("Mia");\nconsole.log(a.falar());\n// saída: Mia faz barulho'
          ),
          sl(
            'Herança com extends e super',
            'Uma classe pode ESTENDER outra com extends, herdando seus métodos e podendo sobrescrevê-los. Dentro do método sobrescrito, super.metodo() chama a versão da classe-mãe. Se a classe filha tem constructor próprio, deve chamar super(...) antes de usar this. Use herança para relações do tipo "é um" (Cachorro é um Animal). Evite hierarquias profundas: elas deixam o código rígido.',
            'class Cachorro extends Animal {\n  falar() { return super.falar() + " (au!)"; }\n}\nconst d = new Cachorro("Rex");\nconsole.log(d.falar());\nconsole.log(d instanceof Animal);\n// saída real:\n// Rex faz barulho (au!)\n// true'
          ),
          sl(
            'Getters, setters e campos privados',
            'Um getter (get nome() { ... }) é lido como se fosse uma propriedade, mas executa código; um setter (set nome(v) { ... }) roda quando se atribui o valor, podendo validar. Campos privados começam com # (como #energia): só podem ser acessados de dentro da própria classe; fora dela, tentar ler é erro de sintaxe. Juntos, permitem proteger o estado: o campo é privado e só muda pelo setter, que valida (por exemplo, recusando energia negativa). Isso é encapsulamento.',
            'class Animal {\n  #energia = 10;\n  constructor(nome) { this.nome = nome; }\n  get energia() { return this.#energia; }\n  set energia(v) {\n    if (v < 0) throw new RangeError("energia negativa");\n    this.#energia = v;\n  }\n}\nconst x = new Animal("Mia");\nx.energia = 5;\nconsole.log(x.energia, Object.keys(x));\ntry { x.energia = -1; } catch (e) { console.log(e.name, e.message); }\n// saída real:\n// 5 [ \'nome\' ]\n// RangeError energia negativa'
          ),
          sl(
            'A ideia de protótipo',
            'Por baixo das classes, o JavaScript usa protótipos: todo objeto tem uma ligação interna com outro objeto, o seu protótipo. Quando você pede uma propriedade que o objeto não tem, a linguagem procura no protótipo, depois no protótipo do protótipo, e assim por diante (a "cadeia de protótipos"). Os métodos de uma classe ficam no prototype da classe, e por isso são compartilhados por todas as instâncias sem serem copiados. class é uma sintaxe mais confortável sobre esse mecanismo; typeof Animal é "function".',
            'console.log(typeof Animal);\nconsole.log(Object.getPrototypeOf(d) === Cachorro.prototype);\nconsole.log(Object.getPrototypeOf(Cachorro.prototype) === Animal.prototype);\n// saída real:\n// function\n// true\n// true'
          ),
          sl(
            'Quando preferir funções e objetos simples',
            'Classes não são obrigatórias. No Node é muito comum usar funções e objetos simples, ou módulos que exportam funções, quando não há estado a proteger ou várias instâncias a criar. Use classe quando houver: estado + comportamento ligados, várias instâncias, ou quando uma biblioteca exige (por exemplo, EventEmitter e classes de erro, que veremos adiante). Erros comuns: esquecer o new; usar this solto (perde-se o this, como na lição anterior); criar herança profunda onde composição (um objeto que usa outro) seria mais simples; esquecer super() no constructor da filha.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel do constructor de uma classe?', 'd', [
          'Definir as funções que ficam compartilhadas entre as classes do programa',
          'Impedir que a classe seja estendida por outras classes',
          'Criar uma classe nova toda vez que um método é chamado',
          'Inicializar a instância recém-criada com new, definindo suas propriedades'
        ], 'O constructor roda ao criar a instância (new) e inicializa this. Métodos são declarados fora dele; ele não impede extends nem cria classes.'),
        mcq('q2', 'Qual código chama a versão do método da classe-mãe dentro de uma classe filha?', 'a', [
          'super.falar()',
          'this.parent.falar()',
          'Animal.falar()',
          'extends.falar()'
        ], 'super.metodo() invoca a implementação da classe-mãe. As outras formas não existem ou não funcionam como esperado (Animal.falar tentaria um método estático).'),
        mcq('q3', 'Dada uma classe com `#saldo`, o que acontece ao tentar ler `conta.#saldo` fora da classe?', 'c', [
          'Devolve undefined, como qualquer propriedade inexistente',
          'Devolve o valor normalmente, pois o # é só uma convenção de nome dos campos',
          'Gera erro de sintaxe, porque campos privados só existem dentro da classe',
          'Devolve uma cópia protegida do valor, sem permitir alteração'
        ], 'Campos # são realmente privados: o acesso externo é erro de sintaxe, não só convenção. Não retornam undefined nem cópia.'),
        fill('q4', 'Complete com a palavra usada para criar uma instância de uma classe.', 'const rex = ___ Cachorro("Rex");', ['new'], 'new cria a instância, executa o constructor e liga o objeto ao prototype da classe.'),
        mcq('q5', 'Para que serve um setter com validação (por exemplo, recusar energia negativa)?', 'b', [
          'Para deixar a propriedade imutável, bloqueando qualquer atribuição depois da criação',
          'Para controlar como o valor é alterado e garantir que o estado fique consistente',
          'Para copiar o objeto cada vez que uma propriedade é lida',
          'Para executar a validação uma única vez, na criação da classe'
        ], 'O setter roda a cada atribuição e pode validar, protegendo o estado. Não torna a propriedade somente leitura (isso seria um getter sem setter) nem roda só uma vez.'),
        mcq('q6', 'Em JavaScript, o que é o protótipo de um objeto?', 'd', [
          'Uma cópia do objeto guardada pelo Node para desfazer alterações feitas depois',
          'Um tipo de dado primitivo usado internamente para representar classes e funções',
          'Um arquivo de configuração lido ao executar o programa, que define suas funções',
          'Outro objeto ligado a ele, onde se buscam as propriedades que ele não tem'
        ], 'A busca de propriedades sobe pela cadeia de protótipos. Não é cópia de segurança, tipo primitivo nem arquivo.'),
        mcq('q7', 'Quando é mais razoável NÃO usar uma classe?', 'b', [
          'Quando precisamos criar várias instâncias que guardam estado próprio e comportamento compartilhado',
          'Quando o código só agrupa algumas funções utilitárias sem estado, e um módulo com funções basta',
          'Quando uma biblioteca exige estender uma classe para ser usada, como acontece com o EventEmitter',
          'Quando queremos usar campos privados para proteger o estado de cada objeto criado'
        ], 'Sem estado a proteger nem instâncias múltiplas, funções em um módulo são mais simples. As demais situações são justamente casos em que classes ajudam.'),
        fill('q8', 'Complete com a palavra que faz uma classe herdar de outra.', 'class Cachorro ___ Animal { }', ['extends'], 'extends estabelece a herança: Cachorro herda os métodos de Animal.')
      ]
    },
    {
      id: 'njb-40-iteradores-e-geradores',
      title: 'Iteradores e geradores',
      goal: 'Entender o protocolo de iteração, tornar objetos iteráveis, escrever funções geradoras (function*, yield) com limite e ligar essas ideias aos async iterators e streams usados mais adiante.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O protocolo de iteração',
            'Quando você escreve for (const x of algo), o JavaScript segue um combinado chamado protocolo de iteração. Um ITERÁVEL é um objeto que possui o método [Symbol.iterator](), que devolve um ITERADOR. O iterador é um objeto com o método next(), e cada chamada a next() devolve { value, done }: value é o próximo valor e done vale true quando acabou. Arrays, strings, Map e Set já seguem esse protocolo, por isso funcionam em for...of e com o operador spread (...). Um objeto literal como { a: 1 } NÃO é iterável: for (const x of { a: 1 }) lança TypeError. Para percorrer suas chaves, use Object.keys, Object.values ou Object.entries.',
            'function* contagem(ate) { for (let i = 1; i <= ate; i++) yield i; }\nconst it = contagem(2);\nconsole.log(it.next(), it.next(), it.next());\n// saída real:\n// { value: 1, done: false } { value: 2, done: false } { value: undefined, done: true }'
          ),
          sl(
            'Funções geradoras: function* e yield',
            'Uma função geradora é declarada com function* e usa yield para entregar valores UM DE CADA VEZ. Chamá-la não executa o corpo: devolve um gerador (que é um iterador e também um iterável). A cada next(), a função roda até o próximo yield, PAUSA guardando suas variáveis locais, e retoma dali no próximo next(). Quando termina (ou chega a um return), done passa a true. Vantagem: os valores são produzidos sob demanda (preguiçosamente), sem criar um array gigante em memória. Como o gerador é iterável, funciona direto em for...of e no spread.',
            'function* contagem(ate) {\n  for (let i = 1; i <= ate; i++) yield i;\n}\nconsole.log([...contagem(3)]);\n// saída real:\n// [ 1, 2, 3 ]'
          ),
          sl(
            'Geradores infinitos e como limitá-los',
            'Um gerador pode nunca terminar, por exemplo os números naturais. Isso é seguro enquanto você consumir só uma parte, porque nada é calculado antes de ser pedido. O perigo é consumir tudo: [...naturais()] ou um for...of sem parada tenta juntar infinitos valores e trava o programa ou esgota a memória. Defina sempre um limite: um gerador auxiliar que dá return depois de N valores, ou um break dentro do for...of. Ao sair do laço com break ou return, o JavaScript encerra o gerador por você.',
            'function* naturais() { let n = 1; while (true) yield n++; }\nfunction* primeiros(origem, limite) {\n  if (limite <= 0) return;\n  let vistos = 0;\n  for (const v of origem) {\n    yield v;\n    if (++vistos >= limite) return;\n  }\n}\nconsole.log([...primeiros(naturais(), 4)]);\n// saída real:\n// [ 1, 2, 3, 4 ]'
          ),
          sl(
            'Tornando suas classes iteráveis',
            'Para que uma classe sua funcione em for...of e no spread, implemente o método [Symbol.iterator](). O jeito mais simples é delegar a um iterador que já existe (por exemplo o do array interno) ou escrever o método como gerador: *[Symbol.iterator]() { yield* this.itens; }. Assim quem usa a classe percorre os elementos sem conhecer a estrutura interna (que pode mudar). Repare que o campo privado #itens continua escondido: só a iteração é exposta.',
            'class Fila {\n  #itens = [];\n  add(x) { this.#itens.push(x); }\n  [Symbol.iterator]() { return this.#itens[Symbol.iterator](); }\n}\nconst f = new Fila(); f.add("a"); f.add("b");\nfor (const x of f) console.log(x);\nconsole.log([...f]);\n// saída real:\n// a\n// b\n// [ \'a\', \'b\' ]'
          ),
          sl(
            'Ponte para async iterators e streams',
            'Existe uma versão assíncrona do protocolo: um async iterator tem next() que devolve uma PROMISE de { value, done }, e se consome com for await...of (dentro de função async ou módulo ESM). Funções declaradas como async function* são geradores assíncronos: cada yield pode acontecer depois de esperar algo (um tempo, uma resposta, um pedaço de arquivo). Os streams do Node (leitura de arquivos grandes, requisições HTTP) são iteráveis assíncronos: você poderá ler um arquivo em pedaços com for await (const pedaco of stream), sem carregar tudo na memória. Quando chegar nesses temas, o mecanismo é este.',
            'async function* ticks() { yield 1; yield 2; }\n(async () => {\n  for await (const t of ticks()) console.log("tick", t);\n})();\n// saída real:\n// tick 1\n// tick 2'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: iterável tem [Symbol.iterator]() que devolve um iterador com next() { value, done }; function* e yield criam iteradores com pausa e retomada; geradores produzem sob demanda; async iterators usam for await. Erros comuns: usar for...of em objeto literal (TypeError); esquecer o asterisco em function* (aí yield é erro de sintaxe); consumir um gerador infinito sem limite; e reutilizar um gerador já consumido, que não reinicia: é preciso chamar a função de novo para ter um gerador novo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o método next() de um iterador devolve?', 'c', [
          'O valor seguinte diretamente, ou null quando a coleção termina, sem objeto ao redor',
          'Um array com os valores restantes, para o laço consumir de uma só vez',
          'Um objeto { value, done }, em que done indica se a iteração acabou',
          'Uma promise que cumpre quando os valores já foram produzidos pelo iterador'
        ], 'O protocolo manda devolver { value, done }: value é o item e done vale true ao fim. Devolver o valor puro não permite distinguir um valor undefined do fim; array de restantes e promise não fazem parte do protocolo síncrono (a promise aparece só nos async iterators).'),
        mcq('q2', 'O que acontece ao executar for (const x of { a: 1, b: 2 }) console.log(x)?', 'a', [
          'Lança TypeError: o objeto literal não é iterável',
          'Imprime as chaves a e b, na ordem em que foram escritas no objeto',
          'Imprime os valores 1 e 2, porque for...of lê as propriedades do objeto',
          'Não imprime nada e termina sem erro, porque o objeto não tem posições numéricas'
        ], 'Objetos literais não implementam o protocolo de iteração, então for...of lança TypeError. Para percorrê-los, use Object.keys, Object.values ou Object.entries, que devolvem arrays (iteráveis).'),
        mcq('q3', 'Em uma função geradora, o que o yield faz?', 'd', [
          'Encerra a função de vez e devolve o valor, como faz o return comum, sem poder voltar depois',
          'Chama a função de novo desde o início, descartando as variáveis locais, para produzir o próximo valor',
          'Dispara um erro controlado que o laço for...of captura e ignora para seguir adiante',
          'Entrega um valor e pausa a função, que retoma do mesmo ponto no próximo next()'
        ], 'yield devolve um valor e suspende a execução guardando as variáveis locais; o próximo next() continua logo depois do yield. return encerra de vez; não há reexecução do início nem erro envolvido.'),
        fill('q4', 'Complete com o método que pede o próximo valor de um iterador.', 'const it = contagem(2);\nconsole.log(it.___().value);   // 1', ['next'], 'it.next() retoma o gerador até o próximo yield e devolve { value, done }; aqui .value é 1.'),
        mcq('q5', 'O que há de errado em const todos = [...naturais()], em que naturais() é um gerador infinito?', 'b', [
          'Nada: o spread consome só os valores que o programa usar mais tarde',
          'O spread tenta juntar infinitos valores e trava ou esgota a memória',
          'Geradores não podem ser usados com spread, só com for...of',
          'O gerador devolve undefined no primeiro next(), então o array sai vazio'
        ], 'O spread consome o iterável até done ser true; como nunca termina, o programa fica preso e a memória cresce. A solução é limitar (gerador auxiliar com return ou break em for...of). Geradores aceitam spread e produzem valores normalmente.'),
        mcq('q6', 'Por que ler um arquivo grande com for await (const pedaco of stream) é vantajoso?', 'c', [
          'Porque o arquivo é lido por inteiro de uma vez e só depois repartido em pedaços',
          'Porque for await executa os pedaços em paralelo, em várias threads do processador',
          'Porque os pedaços chegam aos poucos e são processados sem carregar tudo na memória',
          'Porque for await dispensa o tratamento de erros, que passa a ser automático a cada iteração'
        ], 'Async iterators entregam cada pedaço quando ele fica disponível; você processa e descarta, mantendo pouca memória. O laço consome os pedaços um por vez (não em paralelo), não lê tudo antes e continua precisando de try/catch para erros.'),
        mcq('q7', 'Uma classe Playlist define [Symbol.iterator]() que devolve o iterador do array interno. O que isso permite?', 'a', [
          'Usar for (const musica of playlist) e [...playlist] sem expor o array interno',
          'Acessar playlist[0] e playlist.length como se a instância fosse um array de verdade',
          'Transformar a classe em um gerador assíncrono, que poderá ser usado com for await',
          'Impedir que o array interno seja alterado por outros trechos do programa depois da criação'
        ], 'Com [Symbol.iterator], a instância passa a ser iterável: funciona em for...of e no spread. Isso não cria índices nem length, não torna a classe assíncrona e não protege contra mudanças (para isso serviriam campos privados).'),
        fill('q8', 'Complete com a palavra que consome um iterável assíncrono.', 'async function main() {\n  for ___ (const t of ticks()) console.log(t);\n}', ['await'], 'for await...of consome iteráveis assíncronos, esperando a promise de cada next(); só pode ser usado dentro de função async (ou módulo ESM).')
      ]
    },
    {
      id: 'njb-08-modulos-commonjs-e-esm',
      title: 'Módulos: CommonJS e ESM',
      goal: 'Dividir o código em arquivos com require/module.exports e import/export, e conhecer as diferenças práticas entre CommonJS e ESM.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que dividir em módulos',
            'Módulo é um arquivo que expõe parte do seu conteúdo para outros arquivos. Dividir o código em módulos evita um arquivo gigante, permite reutilizar e isola nomes (variáveis de um módulo não vazam para os outros). O Node tem dois sistemas de módulos: o CommonJS (CJS), o original, com require e module.exports; e o ESM (ECMAScript Modules), o padrão oficial da linguagem, com import e export. Os dois convivem, e é importante saber reconhecer cada um.',
            '// util.cjs\nfunction dobro(n) { return n * 2; }\nmodule.exports = { dobro };\n\n// main.cjs\nconst { dobro } = require("./util.cjs");\nconsole.log(dobro(21));\n// saída real: 42'
          ),
          sl(
            'CommonJS: require e module.exports',
            'No CommonJS, você exporta atribuindo a module.exports e importa com require("caminho"). O require é uma FUNÇÃO executada de forma síncrona, e pode aparecer em qualquer lugar do código. Para arquivos seus, use caminho relativo começando com ./ ou ../; para módulos nativos, o nome (com prefixo node:, como veremos); para pacotes instalados, só o nome do pacote. Em CJS existem as variáveis __dirname (pasta do arquivo) e __filename (caminho do arquivo).',
            'console.log(typeof __dirname, typeof __filename);\n// saída real:\n// string string'
          ),
          sl(
            'ESM: import e export',
            'No ESM, export publica nomes (export function triplo...) e export default publica um valor "principal". Importamos com import { triplo } from "./util.mjs" (nomes entre chaves) ou import padrao from "./util.mjs" (o default, nome livre). O import é estático: fica no topo e é analisado antes de executar. ESM permite await no nível superior do arquivo (sem precisar de função async). Em ESM NÃO existem __dirname nem __filename; use import.meta.filename e import.meta.dirname (em versões recentes) ou import.meta.url. Confira a documentação da versão que você usa.',
            '// util.mjs\nexport function triplo(n) { return n * 3; }\nexport default "padrão";\n\n// main.mjs\nimport padrao, { triplo } from "./util.mjs";\nimport { basename } from "node:path";\nconsole.log(triplo(5), padrao);\nconsole.log(basename(import.meta.filename), typeof __dirname);\nconst m = await import("./util.mjs");\nconsole.log(Object.keys(m));\n// saída real:\n// 15 padrão\n// main.mjs undefined\n// [ \'default\', \'triplo\' ]'
          ),
          sl(
            'Como o Node decide: extensão e "type"',
            'O Node escolhe o sistema pela extensão e pelo package.json: arquivos .cjs são sempre CommonJS; arquivos .mjs são sempre ESM; arquivos .js seguem o campo "type" do package.json mais próximo: "type": "module" faz os .js serem ESM; sem esse campo (ou "commonjs"), são CJS. Em ESM é OBRIGATÓRIO escrever a extensão nos imports de arquivos relativos (./util.mjs, ./util.js); omitir causa erro. Em CJS a extensão .js pode ser omitida.',
            '{\n  "name": "meu-app",\n  "type": "module"\n}\n\n// import { triplo } from "./util";   // ESM sem extensão:\n// Error [ERR_MODULE_NOT_FOUND]: Cannot find module \'.../util\' imported from ...'
          ),
          sl(
            'import() dinâmico e diferenças práticas',
            'import("./arquivo.mjs") (com parênteses) é uma FUNÇÃO que devolve uma promise e funciona nos dois sistemas; serve para carregar um módulo só quando necessário, e é a ponte para usar ESM a partir de CJS (em versões recentes também é possível usar require em alguns ESM; confira a documentação). Resumo das diferenças: CJS usa require/module.exports, é síncrono e tem __dirname; ESM usa import/export, é estático, aceita await no topo, exige extensão e usa import.meta. Para projetos novos, ESM é o caminho padrão; muitos projetos e pacotes antigos ainda usam CJS. Erro comum: misturar sintaxes (import em arquivo CJS gera SyntaxError; require em ESM gera ReferenceError).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em um arquivo CommonJS, qual par permite exportar uma função dobro e usá-la em outro arquivo?', 'a', [
          'module.exports = { dobro }; e const { dobro } = require("./util.cjs");',
          'export dobro; e import dobro from "./util.cjs";',
          'exports(dobro); e require(dobro, "./util.cjs");',
          'module.import = dobro; e const dobro = require.get("./util.cjs"); no outro arquivo'
        ], 'CommonJS exporta com module.exports e importa com require. As demais combinações misturam sintaxes ou inventam APIs inexistentes.'),
        mcq('q2', 'Um arquivo termina em .js, e o package.json mais próximo tem "type": "module". Como o Node trata o arquivo?', 'c', [
          'Como CommonJS, porque a extensão .js indica CommonJS',
          'Como CommonJS, mas permitindo import quando for dentro de funções',
          'Como ESM, seguindo o campo "type" do package.json',
          'Como arquivo inválido, pois .js não pode ser usado com "type": "module"'
        ], 'Para arquivos .js, o campo "type" decide: "module" significa ESM. .cjs e .mjs são fixos independentemente do campo.'),
        mcq('q3', 'Em ESM, o import `import { triplo } from "./util";` (sem extensão) falha. Por quê?', 'b', [
          'Porque ESM aceita importar pacotes do npm, mas não arquivos locais do próprio projeto',
          'Porque em ESM a extensão do arquivo relativo é obrigatória',
          'Porque o import precisa estar dentro de uma função async para funcionar',
          'Porque o nome triplo precisa ser exportado como default para ser importado'
        ], 'ESM exige a extensão nos caminhos relativos (ERR_MODULE_NOT_FOUND se omitida). Importar arquivos locais é permitido, import fica no topo e nomes exportados podem ser importados entre chaves.'),
        fill('q4', 'Complete com a extensão que força o Node a tratar o arquivo como ESM, independentemente do package.json.', 'main.___  // sempre ESM', ['mjs'], 'A extensão .mjs sempre é tratada como módulo ESM; .cjs sempre como CommonJS.'),
        mcq('q5', 'Qual é uma diferença prática entre require e import estático?', 'd', [
          'require só funciona com módulos nativos do Node, enquanto import carrega qualquer arquivo ou pacote',
          'import é executado a cada chamada de função do programa, enquanto require só roda uma vez no início',
          'Não há diferença prática: são dois nomes diferentes para a mesma instrução de carregamento do Node',
          'require é função chamável em qualquer ponto; import estático fica no topo, analisado antes'
        ], 'require é função síncrona usável em qualquer lugar; o import estático é declarativo e analisado antes. Ambos carregam arquivos próprios e módulos nativos.'),
        mcq('q6', 'Como carregar um módulo ESM só quando necessário, a partir de qualquer arquivo?', 'a', [
          'const m = await import("./arquivo.mjs"); (import dinâmico, devolve uma promise)',
          'const m = import "./arquivo.mjs"; colocado dentro do bloco onde o módulo é necessário',
          'const m = require.async("./arquivo.mjs");',
          'Não é possível: todo módulo precisa ser carregado no início do programa'
        ], 'import() é uma função que devolve uma promise e pode ser chamada em qualquer lugar. A sintaxe estática não pode ficar em blocos, e require.async não existe.'),
        mcq('q7', 'Você quer o nome do arquivo atual em um módulo ESM. O que usar no lugar de __filename?', 'c', [
          '__filename continua disponível em ESM e funciona igual',
          'process.filename, que existe em qualquer módulo',
          'import.meta.filename (ou derivar de import.meta.url)',
          'module.filename, que é definido pelo próprio ESM'
        ], 'Em ESM, __dirname e __filename não existem; usa-se import.meta (filename/dirname em versões recentes, ou import.meta.url). process.filename e module.filename não são APIs do ESM.'),
        fill('q8', 'Complete com o campo do package.json que faz os arquivos .js serem ESM.', '{\n  "name": "app",\n  "___": "module"\n}', ['type'], 'O campo "type": "module" no package.json faz os .js desse escopo serem tratados como ESM.')
      ]
    },
    {
      id: 'njb-09-npm-e-package-json',
      title: 'npm e package.json',
      goal: 'Criar um projeto com npm, entender dependências, scripts, lockfile e semver, usar npx e adotar cuidados básicos de segurança com pacotes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'npm init e package.json',
            'npm init cria o arquivo package.json, a "identidade" do projeto: nome, versão, ponto de entrada, scripts, dependências e (como vimos) o campo "type". Com npm init -y ele aceita todos os valores padrão. É um arquivo de texto JSON que você edita e versiona. Ele é o que permite a qualquer pessoa rodar npm install e reconstruir o mesmo ambiente do projeto.',
            '$ npm init -y\n{\n  "name": "meu-app",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "start": "node src/index.js"\n  }\n}'
          ),
          sl(
            'dependencies x devDependencies e node_modules',
            'dependencies são pacotes necessários para o programa RODAR em produção (por exemplo, o framework web). devDependencies são necessários só durante o DESENVOLVIMENTO (testes, formatadores, ferramentas de build). Instale com npm install pacote (vai para dependencies) ou npm install --save-dev pacote (devDependencies); remova com npm uninstall pacote. Tudo é baixado para a pasta node_modules, que pode ficar enorme e é recriada pelo npm install: nunca a edite à mão nem a versione no Git (coloque no .gitignore).',
            '$ npm install express           # dependencies\n$ npm install --save-dev eslint   # devDependencies\n$ npm uninstall express\n# (comandos ilustrativos, não executados aqui)'
          ),
          sl(
            'scripts e npx',
            'O campo "scripts" dá nomes curtos a comandos. npm run nome executa o script; para start e test, vale o atalho npm start e npm test. É a forma padronizada de iniciar, testar e construir sem precisar lembrar os comandos longos. npx executa um programa de um pacote sem instalá-lo de forma permanente (ele baixa temporariamente ou usa o que já está instalado); é usado para ferramentas de uso ocasional. Cuidado: npx também executa código de terceiros, então confira o nome do pacote (erros de digitação podem levar a um pacote malicioso com nome parecido).',
            '{\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "node --test"\n  }\n}\n// $ npm start\n// $ npm test'
          ),
          sl(
            'package-lock e semver',
            'O package-lock.json registra as VERSÕES EXATAS de cada pacote instalado (incluindo as dependências das dependências). Deve ser versionado no Git: garante que todos instalem exatamente o mesmo conjunto, tornando o build reproduzível. Versões seguem o semver (versionamento semântico): MAIOR.MENOR.CORREÇÃO. Correção = conserta bugs sem mudar a interface; menor = acrescenta recursos compatíveis; maior = pode quebrar compatibilidade. No package.json, ^ aceita atualizações de menor e correção (mantém o número maior), e ~ aceita só correção. Exemplo: ^2.3.1 aceita 2.4.0, mas não 3.0.0; ~2.3.1 aceita 2.3.5, mas não 2.4.0.',
            '"dependencies": {\n  "pacote-a": "^2.3.1",   // aceita 2.x.y (>= 2.3.1), nunca 3.0.0\n  "pacote-b": "~2.3.1"    // aceita 2.3.x (>= 2.3.1), nunca 2.4.0\n}'
          ),
          sl(
            'Segurança básica com pacotes',
            'Cada pacote é código de terceiros com as permissões do seu programa, e suas dependências também. Boas práticas: confira nome (cuidado com erros de digitação), descrição, responsáveis, frequência de manutenção e se você realmente precisa dele; prefira poucas dependências; versione o package-lock.json; use npm audit, comando que consulta vulnerabilidades conhecidas nas dependências instaladas e sugere correções (ele aponta riscos conhecidos, mas não garante que não existam outros); atualize com regularidade; nunca publique segredos (.env) no repositório nem em pacotes. Conforme a necessidade, use npm ci em integração contínua para instalar exatamente o que está no lock. Para o lado de segurança de aplicações, veja o curso de Segurança Web (OWASP).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando cria o package.json aceitando todos os valores padrão?', 'c', [
          'npm start --default',
          'npm install package.json',
          'npm init -y',
          'node init package.json'
        ], 'npm init -y gera o package.json com valores padrão. npm start executa script, npm install instala pacotes e node init não é um comando do Node.'),
        mcq('q2', 'Uma biblioteca de testes só é usada na máquina de quem desenvolve, não em produção. Onde ela deve ficar?', 'a', [
          'Em devDependencies, instalada com --save-dev',
          'Em dependencies, porque tudo que o projeto usa precisa estar lá',
          'Na pasta node_modules, editando o arquivo do pacote à mão',
          'Em scripts, junto com o comando que executa o programa'
        ], 'Ferramentas de desenvolvimento ficam em devDependencies. node_modules é gerado pelo npm e scripts guarda comandos, não pacotes.'),
        mcq('q3', 'No package.json há "pacote": "^2.3.1". Qual versão o npm pode instalar ao atualizar dentro dessa faixa?', 'b', [
          '3.0.0, porque ^ aceita qualquer versão mais nova, inclusive uma versão maior',
          '2.9.4, pois ^ mantém o número maior e aceita menor e correção',
          '2.3.0, já que ^ permite voltar para versões anteriores',
          '2.3.1 e nada além, porque ^ fixa a versão exata escrita'
        ], '^ mantém o número maior (2) e aceita atualizações menores e de correção, como 2.9.4. Não aceita 3.0.0 nem versões anteriores à indicada, e não fixa a versão exata.'),
        fill('q4', 'Complete com o nome do arquivo que registra as versões exatas de todas as dependências instaladas.', 'package-___.json', ['lock'], 'O package-lock.json registra versões exatas e deve ser versionado para builds reproduzíveis.'),
        mcq('q5', 'Para que serve o campo "scripts" do package.json?', 'd', [
          'Para listar os pacotes que serão baixados quando o projeto for instalado em outra máquina',
          'Para definir qual versão do Node o projeto precisa para ser executado',
          'Para guardar as senhas e chaves que o projeto usa em desenvolvimento',
          'Para dar nomes a comandos, como "start", executados com npm run ou npm start'
        ], 'scripts mapeia nomes para comandos. Pacotes ficam em dependencies; segredos nunca devem ficar no package.json.'),
        mcq('q6', 'Por que a pasta node_modules não deve ir para o repositório Git?', 'c', [
          'Porque ela contém segredos que o npm gera automaticamente durante a instalação',
          'Porque o Git não consegue guardar arquivos com extensão .js',
          'Porque é grande e recriável com npm install a partir de package.json e do lock',
          'Porque o npm só funciona se a pasta estiver vazia antes da instalação'
        ], 'node_modules é volumosa e reconstruída pelo npm a partir do package.json e do lock. Não guarda segredos por padrão, o Git aceita .js e o npm não exige pasta vazia.'),
        mcq('q7', 'Qual prática reduz o risco de instalar um pacote malicioso por engano?', 'b', [
          'Instalar tudo com permissões de administrador para evitar erros durante a instalação',
          'Conferir o nome exato, a manutenção e a necessidade do pacote antes de instalar',
          'Escolher o pacote com o nome mais curto, que costuma ser o oficial',
          'Desativar o package-lock.json para o npm buscar a versão mais recente'
        ], 'Typosquatting (nomes parecidos) é um risco real; conferir nome, manutenção e necessidade reduz. Permissão extra aumenta o dano, nome curto não é garantia e desativar o lock piora a reprodutibilidade.'),
        fill('q8', 'Complete com o comando que consulta vulnerabilidades conhecidas nas dependências do projeto.', 'npm ___', ['audit'], 'npm audit verifica vulnerabilidades conhecidas nas dependências e sugere correções.')
      ]
    },
    {
      id: 'njb-10-modulos-nativos-path-os-url',
      title: 'Módulos nativos: path, os, URL e process',
      goal: 'Usar path, os, URL, URLSearchParams, process.argv, process.env e process.exit, com o prefixo node: nos módulos nativos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Módulos nativos e o prefixo node:',
            'O Node já vem com módulos prontos (path, fs, http, os, events, entre outros), que não precisam de instalação. Ao importá-los, use o prefixo node: (require("node:path") ou import path from "node:path"): ele deixa claro que é um módulo nativo e evita confusão com um pacote do npm de mesmo nome. Os exemplos desta lição usam só módulos nativos e foram executados de verdade.',
            'const path = require("node:path");\nconst os = require("node:os");'
          ),
          sl(
            'path: montar e analisar caminhos',
            'Nunca monte caminhos concatenando texto com barras: o separador muda entre sistemas (Windows usa \\ e Linux/macOS usam /). Use path. path.join junta partes e normaliza; path.resolve devolve um caminho ABSOLUTO (a partir da pasta atual); path.basename devolve o nome do arquivo; path.extname, a extensão; path.dirname, a pasta. A saída de join mostrada abaixo foi obtida no Windows; no Linux/macOS o separador seria /.',
            'console.log(path.join("pasta", "sub", "..", "arquivo.txt"));\nconsole.log(path.basename("/a/b/relatorio.pdf"), path.extname("relatorio.pdf"), path.dirname("/a/b/relatorio.pdf"));\n// saída real (Windows):\n// pasta\\arquivo.txt\n// relatorio.pdf .pdf /a/b'
          ),
          sl(
            'os e process',
            'O módulo os informa o ambiente: os.platform() (sistema operacional), os.cpus() (núcleos), os.tmpdir() (pasta temporária). O objeto global process representa o programa em execução: process.argv é um array com os argumentos de linha de comando (posição 0: o executável do node; 1: o script; a partir de 2: argumentos do usuário); process.env guarda variáveis de ambiente (sempre TEXTO, ou undefined se a variável não existe). Segredos e configurações devem vir de variáveis de ambiente, nunca escritos no código.',
            'const [, , nome = "mundo"] = process.argv;\nconsole.log(`Olá, ${nome}`);\nconsole.log(process.env.VAR_INEXISTENTE ?? "padrão");\n// $ node args.js Ana\n// saída real:\n// Olá, Ana\n// padrão'
          ),
          sl(
            'process.exit e códigos de saída',
            'Todo programa termina com um código de saída: 0 significa sucesso; qualquer outro valor indica erro, e é o que scripts e sistemas de integração contínua usam para saber se algo falhou. process.exit(1) encerra IMEDIATAMENTE, o que pode cortar trabalho pendente (gravações em andamento, por exemplo). Prefira definir process.exitCode = 1 e deixar o programa terminar naturalmente. Mensagens de erro vão para console.error (saída de erro). Nunca coloque dados pessoais ou segredos nessas mensagens.',
            'if (!process.env.MODO) {\n  console.error("MODO ausente");\n  process.exitCode = 1;\n}\n// $ node args.js        -> código de saída 1\n// $ MODO=x node args.js -> código de saída 0\n// (códigos conferidos na execução real)'
          ),
          sl(
            'URL e URLSearchParams',
            'new URL(texto) analisa um endereço e expõe as partes: hostname, port, pathname, hash e searchParams (os parâmetros depois do ?). URLSearchParams lê e monta a query string, escapando caracteres especiais corretamente (espaço vira +, & vira %26). Ao montar URLs com dados vindos de fora, use URLSearchParams em vez de concatenar: evita erros e injeção de parâmetros. Se o texto não for uma URL válida, new URL lança um TypeError (código ERR_INVALID_URL), então use try/catch ao validar entradas. Os exemplos usam example.com, um domínio reservado para documentação.',
            'const u = new URL("https://example.com:8080/produtos?cat=livros&pag=2#topo");\nconsole.log(u.hostname, u.port, u.pathname, u.searchParams.get("cat"), u.hash);\nconst p = new URLSearchParams({ q: "node js", pag: "1" });\np.append("tag", "a&b");\nconsole.log(p.toString());\ntry { new URL("isso nao e url"); } catch (e) { console.log(e.name, e.code); }\n// saída real:\n// example.com 8080 /produtos livros #topo\n// q=node+js&pag=1&tag=a%26b\n// TypeError ERR_INVALID_URL'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: prefixo node: para nativos; path para caminhos; os para o ambiente; process.argv, process.env e exitCode para entrada e saída do programa; URL e URLSearchParams para endereços. Erros comuns: esquecer que argv começa com dois itens fixos; tratar process.env como número (é texto); usar process.exit() no meio de gravações; concatenar caminhos ou URLs com texto; imprimir segredos ou dados pessoais em logs. Para Docker e variáveis de ambiente em contêineres, veja o curso de Containers.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que usar o prefixo node: em require("node:path")?', 'b', [
          'Porque sem o prefixo o Node não encontra os módulos nativos e lança erro ao executar o arquivo',
          'Para deixar claro que é módulo nativo, sem confusão com pacote do npm de mesmo nome',
          'Porque o prefixo torna o módulo mais rápido ao ser carregado do disco',
          'Porque o prefixo baixa a versão mais recente do módulo pela internet'
        ], 'O prefixo identifica claramente módulos nativos e evita ambiguidade com pacotes de terceiros. Não é obrigatório para funcionar, não acelera carregamento e não baixa nada.'),
        mcq('q2', 'Qual chamada devolve o nome do arquivo em "/a/b/relatorio.pdf"?', 'd', [
          'path.dirname("/a/b/relatorio.pdf")',
          'path.extname("/a/b/relatorio.pdf")',
          'path.resolve("/a/b/relatorio.pdf")',
          'path.basename("/a/b/relatorio.pdf")'
        ], 'basename devolve "relatorio.pdf". dirname devolve a pasta, extname a extensão e resolve devolve o caminho absoluto completo.'),
        mcq('q3', 'Você executa "node app.js Ana". Qual expressão contém o texto "Ana"?', 'c', [
          'process.argv[0]',
          'process.argv[1]',
          'process.argv[2]',
          'process.env[2]'
        ], 'argv[0] é o executável do node, argv[1] é o script e os argumentos do usuário começam em argv[2]. process.env guarda variáveis de ambiente, não argumentos.'),
        fill('q4', 'Complete com o objeto global que guarda as variáveis de ambiente do processo.', 'const porta = process.___.PORTA;', ['env'], 'process.env guarda as variáveis de ambiente (sempre texto, ou undefined quando ausentes).'),
        mcq('q5', 'Por que é melhor usar path.join em vez de juntar partes com "/" manualmente?', 'a', [
          'Porque o separador muda entre sistemas e path.join normaliza o caminho corretamente',
          'Porque path.join criptografa o caminho para que ele não possa ser lido por outros programas',
          'Porque o "/" é um caractere proibido em nomes de arquivo no Windows e no Linux',
          'Porque path.join cria as pastas que ainda não existem no disco'
        ], 'path.join cuida do separador e da normalização (inclusive "..") em cada sistema. Não criptografa nem cria pastas, e a barra é comum em muitos sistemas.'),
        mcq('q6', 'Por que preferir `process.exitCode = 1` a `process.exit(1)` em muitos casos?', 'd', [
          'Porque exitCode encerra o programa mais rápido que exit, sem esperar nenhuma tarefa pendente',
          'Porque exit só aceita o valor 0 como parâmetro e não consegue sinalizar falha',
          'Porque exitCode apaga a mensagem de erro já exibida no terminal antes de encerrar o programa',
          'Porque exit encerra na hora e pode cortar trabalho pendente; exitCode deixa terminar'
        ], 'process.exit() encerra imediatamente, interrompendo gravações e tarefas em andamento; definir exitCode deixa o término natural. exit aceita outros códigos e exitCode não apaga mensagens.'),
        mcq('q7', 'Qual é a forma mais segura de montar uma query string com valores vindos do usuário?', 'b', [
          'Concatenar com + e confiar que o navegador escapa o conteúdo depois',
          'Usar URLSearchParams, que escapa caracteres especiais corretamente',
          'Usar template string e remover manualmente os espaços do texto',
          'Passar o texto cru para new URL, que o valida e corrige sozinho'
        ], 'URLSearchParams escapa & = espaços e outros caracteres, evitando quebra e injeção de parâmetros. Concatenação crua não escapa nada, e new URL não corrige texto inválido (lança erro).'),
        fill('q8', 'Complete com a classe global que analisa um endereço e expõe hostname, pathname e searchParams.', 'const u = new ___("https://example.com/a?x=1");', ['url'], 'new URL analisa o endereço e expõe suas partes (hostname, pathname, searchParams etc.).')
      ]
    },
    {
      id: 'njb-42-expressoes-regulares-em-javascript',
      title: 'Expressões regulares em JavaScript',
      goal: 'Usar expressões regulares com test, match, matchAll e replace, grupos nomeados e flags; saber quando validar e quando extrair; e reconhecer padrões vulneráveis a ReDoS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma expressão regular',
            'Uma expressão regular (regex) é um padrão que descreve um formato de texto. Em JavaScript escreve-se entre barras: /\\d{4}/. Peças básicas: \\d um dígito; \\w letra, dígito ou sublinhado; \\s espaço em branco; . qualquer caractere (menos quebra de linha); [abc] um dos caracteres listados; * zero ou mais; + um ou mais; ? zero ou um; {4} exatamente quatro; ^ início do texto; $ fim do texto; | ou; ( ) agrupa. Para casar o caractere literal de um símbolo especial, use barra invertida: \\. casa um ponto de verdade. Uso típico: conferir se um texto tem certo formato ou extrair partes dele.',
            'console.log(/\\d{4}-\\d{2}-\\d{2}/.test("Pedidos 2025-03-10"));   // true\nconsole.log(/^\\d+$/.test("123abc"), /\\d+/.test("123abc"));\n// saída real:\n// true\n// false true'
          ),
          sl(
            'test, match, matchAll e replace',
            'regex.test(texto) devolve true ou false. texto.match(regex) devolve o PRIMEIRO resultado (com index e grupos) ou null se não houver; com a flag g devolve um array com todos os trechos casados, sem detalhes de posição. texto.matchAll(regex) (exige a flag g) devolve um iterável com um resultado completo por ocorrência, incluindo index e grupos. texto.replace(regex, novo) troca a primeira ocorrência (todas, com g); no texto novo, $1, $2 referem-se aos grupos capturados. Para casar o ponto, escape-o: "a.b".replace(/./g, "-") troca TUDO, enquanto /\\./g troca só o ponto.',
            'const texto = "Pedidos 2025-03-10 e 2025-04-02";\nconsole.log(texto.match(/\\d{4}-\\d{2}-\\d{2}/g));\nconsole.log(texto.replace(/(\\d{4})-(\\d{2})-(\\d{2})/g, "$3/$2/$1"));\nconsole.log("a.b".replace(/./g, "-"), "a.b".replace(/\\./g, "-"));\n// saída real:\n// [ \'2025-03-10\', \'2025-04-02\' ]\n// Pedidos 10/03/2025 e 02/04/2025\n// --- a-b'
          ),
          sl(
            'Grupos, grupos nomeados e flags',
            'Parênteses criam um GRUPO de captura: guardam o trecho casado para você usar depois. Para legibilidade, nomeie: (?<ano>\\d{4}) e leia em resultado.groups.ano. Flags vêm depois da barra final: g (global, todas as ocorrências), i (ignora maiúsculas e minúsculas), m (^ e $ valem por linha). Cuidado: uma regex com a flag g guarda estado (lastIndex) entre chamadas de test, então reutilizar o mesmo objeto /a/g pode dar resultados alternados, como mostra a saída. Prefira criar a regex perto do uso, ou sem g quando só testa.',
            'for (const m of texto.matchAll(/(?<ano>\\d{4})-(?<mes>\\d{2})-(?<dia>\\d{2})/g)) {\n  console.log(m.groups.dia + "/" + m.groups.mes + "/" + m.groups.ano, m.index);\n}\nconst re = /a/g;\nconsole.log(re.test("aa"), re.test("aa"), re.test("aa"));\n// saída real:\n// 10/03/2025 8\n// 02/04/2025 21\n// true true false'
          ),
          sl(
            'Validar x extrair',
            'São dois usos diferentes. VALIDAR é checar se o texto INTEIRO tem o formato: use âncoras ^ e $, senão a regex casa um pedaço e aprova entradas ruins (/\\d+/ aprova "123abc"; /^\\d+$/ não). EXTRAIR é achar partes dentro de um texto maior: sem âncoras, geralmente com g e grupos. Limite importante: regex confere FORMATO, não significado. Não valide e-mail ou CPF só com regex: o formato de e-mail válido é complexo demais para um padrão curto (e regex complicadas viram risco), e o CPF tem dígitos verificadores que exigem cálculo. Combine uma conferência simples de formato com a regra real: para e-mail, a prova é enviar uma mensagem de confirmação; para CPF, um algoritmo de verificação. E lembre da minimização: não registre em log o texto que o usuário digitou se ele for dado pessoal.'
          ),
          sl(
            'ReDoS: quando a regex vira ataque de negação de serviço',
            'Muitos motores de regex (incluindo o do JavaScript) usam backtracking: se um caminho falha, voltam e tentam outro. Em padrões com repetições aninhadas, como (a+)+, uma entrada que quase casa mas falha no fim obriga o motor a testar um número EXPLOSIVO de combinações: o tempo cresce exponencialmente com cada caractere a mais. Como o Node roda seu código em uma thread só, uma regex travada bloqueia todas as requisições. Isso é ReDoS (negação de serviço por expressão regular). Correção: remover a repetição aninhada (/^a+$/ aceita o mesmo conjunto), preferir padrões simples e específicos, e limitar o tamanho da entrada ANTES de aplicar a regex (por exemplo, rejeitar textos com mais de algumas centenas de caracteres). Veja o curso de Segurança Web para o contexto de ataques.',
            'const entrada = "a".repeat(24) + "b";\nlet t = performance.now();\nconst r1 = /^(a+)+$/.test(entrada);   // padrão perigoso\nconst ms1 = performance.now() - t;\nt = performance.now();\nconst r2 = /^a+$/.test(entrada);      // correção equivalente\nconst ms2 = performance.now() - t;\nconsole.log("perigoso:", r1, ms1.toFixed(0) + " ms");\nconsole.log("corrigido:", r2, ms2.toFixed(2) + " ms");\n// saída real (tempos variam por máquina):\n// perigoso: false 646 ms\n// corrigido: false 0.05 ms'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: regex descreve formato; test confere, match e matchAll extraem, replace troca; grupos nomeados deixam o código legível; use ^ e $ para validar o texto inteiro; g para todas as ocorrências; e fuja de repetições aninhadas e de entradas sem limite de tamanho. Erros comuns: esquecer as âncoras ao validar; esquecer de escapar o ponto; reutilizar regex com g em test; tentar validar e-mail ou CPF apenas pelo formato; e aplicar regex complexa a texto vindo do usuário sem limitar o tamanho. Em caso de dúvida, prefira funções simples como includes, startsWith e split quando bastarem: são mais fáceis de ler e não têm risco de backtracking.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Com const t = "Pedido 2025 e 2026", o que devolve t.match(/\\d{4}/g)?', 'c', [
          'Um único texto, "2025", pois match devolve só a primeira ocorrência',
          'true, pois match só informa se existe algum trecho com quatro dígitos',
          'Um array com os trechos casados: [ "2025", "2026" ]',
          'Um iterável com objetos completos, contendo index e grupos de cada ocorrência'
        ], 'Com a flag g, match devolve um array com todos os trechos que casaram. Sem g devolveria só o primeiro (com detalhes); true/false é o papel de test; o iterável com index e grupos por ocorrência é o de matchAll.'),
        mcq('q2', 'Qual regex valida que a variável inteira contém apenas dígitos, rejeitando "123abc"?', 'd', [
          '/\\d+/, porque o + garante que tudo o que existe no texto seja dígito',
          '/\\d*/, porque o asterisco aceita zero ou mais dígitos no texto',
          '/\\d+/g, porque a flag g faz a regex conferir o texto inteiro',
          '/^\\d+$/, porque as âncoras exigem texto todo formado por dígitos'
        ], 'Para validar o texto completo são necessárias as âncoras ^ e $. /\\d+/ casa o trecho "123" e aprova "123abc"; \\d* aceita até texto vazio; a flag g não muda isso, só afeta quantas ocorrências são buscadas.'),
        mcq('q3', 'Você precisa listar todas as datas de um texto com a posição de cada uma. O que usar?', 'a', [
          'texto.matchAll(/\\d{4}-\\d{2}-\\d{2}/g), que dá index por ocorrência',
          'texto.match(/\\d{4}-\\d{2}-\\d{2}/g), que já devolve as posições dos trechos',
          '/\\d{4}-\\d{2}-\\d{2}/.test(texto), repetido até acabar o texto',
          'texto.replace(/\\d{4}-\\d{2}-\\d{2}/, ""), lendo o texto removido a cada chamada'
        ], 'matchAll com g entrega, para cada ocorrência, um resultado com index e grupos. match com g devolve só os trechos, sem posições; test responde apenas true/false; replace sem g troca só a primeira ocorrência e não informa posição.'),
        fill('q4', 'Complete com a flag que faz match devolver todas as ocorrências.', 'const datas = texto.match(/\\d{4}-\\d{2}-\\d{2}/___);', ['g'], 'A flag g (global) faz a busca continuar após a primeira ocorrência e devolver todas.'),
        mcq('q5', 'Um cadastro valida o campo de e-mail apenas com uma regex longa. Qual é a melhor prática?', 'b', [
          'Manter só a regex, já que um padrão bem escrito cobre os formatos de e-mail existentes',
          'Conferir um formato simples e enviar uma mensagem de confirmação ao usuário',
          'Trocar a regex por uma ainda mais longa e detalhada para rejeitar mais casos inválidos',
          'Aceitar o texto como veio e deixar a validação para quem for ler o banco de dados'
        ], 'Regex só confere formato; o que prova que o e-mail existe e pertence à pessoa é a mensagem de confirmação. Padrões gigantes são difíceis de manter e podem trazer risco de ReDoS; aceitar tudo joga o problema adiante.'),
        mcq('q6', 'Por que /^(a+)+$/ é considerado perigoso diante de uma entrada como "aaaa...ab"?', 'c', [
          'Porque o JavaScript não aceita repetições dentro de parênteses e lança erro de sintaxe ao criar a regex',
          'Porque a regex casa mais texto do que deveria e deixa passar entradas inválidas',
          'Porque a repetição aninhada causa explosão de backtracking e trava a thread única do Node',
          'Porque a regex consome muita memória ao guardar cada grupo capturado em um array'
        ], 'Com repetição aninhada, uma entrada que quase casa mas falha no final leva o motor a testar combinações em quantidade exponencial; como o Node processa em uma thread, tudo para. O padrão é sintaticamente válido, e o problema é tempo de CPU, não memória nem excesso de casamento.'),
        mcq('q7', 'Qual conjunto de medidas reduz melhor o risco de ReDoS em um campo de texto livre?', 'd', [
          'Usar a flag i e aumentar o timeout do servidor para dar tempo à regex',
          'Escrever a regex com mais grupos de captura, que dividem o trabalho do motor',
          'Executar a mesma regex duas vezes e comparar os resultados antes de aceitar a entrada',
          'Limitar o tamanho da entrada e usar padrões simples, sem repetições aninhadas'
        ], 'Limitar o tamanho e evitar repetições aninhadas ataca a causa (explosão de backtracking). A flag i não muda a complexidade, mais timeout só prolonga o bloqueio, mais grupos não reduzem o trabalho e rodar duas vezes dobra o custo.'),
        fill('q8', 'Complete o nome do grupo para que o ano seja lido em m.groups.ano.', 'const m = "2025-03-10".match(/(?<___>\\d{4})-(?<mes>\\d{2})/);\nconsole.log(m.groups.ano);   // 2025', ['ano'], 'Em (?<nome>...) o nome entre sinais de menor e maior vira a chave em m.groups; para ler m.groups.ano o grupo deve se chamar ano.')
      ]
    },
    {
      id: 'njb-11-fs-lendo-e-escrevendo-arquivos',
      title: 'fs: lendo e escrevendo arquivos',
      goal: 'Ler, gravar e listar arquivos com fs/promises, entender síncrono x assíncrono, codificação, erros comuns e o cuidado com caminhos vindos do usuário.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O módulo fs e as três formas de usar',
            'O módulo fs (file system) lê e escreve arquivos e pastas. Ele existe em três estilos: (1) callbacks (fs.readFile(caminho, cb)); (2) promises, em node:fs/promises, a forma moderna que usaremos; (3) versões síncronas (fs.readFileSync), que BLOQUEIAM o programa até terminar. Síncrono é aceitável em scripts curtos e na inicialização do programa (por exemplo, ler uma configuração uma vez), mas num servidor bloqueia o atendimento de todos os clientes enquanto lê. A versão com promises usa await dentro de funções async, que veremos em detalhe nas lições de assincronia; por ora, leia o await como "espere o resultado desta operação sem travar o resto do programa".',
            'const fs = require("node:fs/promises");\n// readFile, writeFile, appendFile, readdir, mkdir, rm\n// todas devolvem uma promise: use com await'
          ),
          sl(
            'Gravando e lendo',
            'writeFile(caminho, conteúdo) cria o arquivo ou SUBSTITUI o conteúdo se ele já existe (cuidado: sobrescreve sem avisar). appendFile acrescenta ao final. readFile lê: se você informa a codificação ("utf8"), recebe texto (string); se não informa, recebe um Buffer (bytes brutos). Codificação é a regra que converte bytes em caracteres; utf8 é o padrão para texto atual. mkdtemp cria uma pasta temporária única, ideal para testar sem sujar o projeto.',
            'const fs = require("node:fs/promises");\nconst path = require("node:path");\nconst os = require("node:os");\n\nasync function main() {\n  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "demo-"));\n  const arq = path.join(dir, "notas.txt");\n  await fs.writeFile(arq, "linha 1\\n", "utf8");\n  await fs.appendFile(arq, "linha 2\\n");\n  const texto = await fs.readFile(arq, "utf8");\n  console.log(JSON.stringify(texto));\n  const buf = await fs.readFile(arq);\n  console.log(Buffer.isBuffer(buf), buf.length);\n  console.log(await fs.readdir(dir));\n  await fs.rm(dir, { recursive: true, force: true });\n  console.log("limpo");\n}\nmain();\n// saída real:\n// "linha 1\\nlinha 2\\n"\n// true 16\n// [ \'notas.txt\' ]\n// limpo'
          ),
          sl(
            'Listar, criar e apagar',
            'readdir(pasta) devolve um array com os nomes dos itens da pasta. mkdir(pasta, { recursive: true }) cria a pasta (e as intermediárias) sem erro se ela já existir. rm(caminho, { recursive: true, force: true }) apaga arquivos ou pastas inteiras: use com extremo cuidado, pois não há lixeira, e nunca passe a ele um caminho montado com entrada do usuário sem validar. Em arquivos com dados pessoais, aplique minimização e retenção: grave só o necessário e apague quando a finalidade acabar.'
          ),
          sl(
            'Erros comuns: ENOENT e companhia',
            'Operações de arquivo falham de formas previsíveis, e o erro traz um code. ENOENT: o arquivo ou pasta não existe (caminho errado, pasta atual diferente). EACCES: sem permissão. EEXIST: já existe (ao criar). EISDIR: era uma pasta, não um arquivo. Trate com try/catch e decida: se o arquivo é opcional, ENOENT pode ser aceitável; para os demais, registre e falhe. Ao mostrar o erro ao usuário final, NÃO exiba o caminho completo do servidor nem detalhes internos: registre no log e devolva uma mensagem genérica.',
            'try {\n  await fs.readFile(path.join(dir, "nao-existe.txt"), "utf8");\n} catch (e) {\n  console.log(e.code, e.syscall);\n}\n// saída real:\n// ENOENT open'
          ),
          sl(
            'Cuidado com caminhos vindos do usuário',
            'Se o nome do arquivo vem de fora (parâmetro de URL, formulário), um valor como ../segredo.txt pode fazer o programa sair da pasta pretendida e ler ou gravar onde não deve (vulnerabilidade chamada path traversal, tratada no curso de Segurança Web). A defesa: resolver o caminho final com path.resolve contra uma pasta base fixa e CONFERIR que o resultado continua dentro dela antes de usar. Melhor ainda: não aceitar nomes livres, e sim identificadores que você mapeia para arquivos.',
            'const path = require("node:path");\nconst BASE = path.resolve("uploads");\nfunction seguro(nomeUsuario) {\n  const alvo = path.resolve(BASE, nomeUsuario);\n  if (alvo !== BASE && !alvo.startsWith(BASE + path.sep)) {\n    throw new Error("caminho fora da pasta permitida");\n  }\n  return alvo;\n}\nconsole.log(path.relative(BASE, seguro("foto.png")));\ntry { seguro("../segredo.txt"); } catch (e) { console.log(e.message); }\n// saída real:\n// foto.png\n// caminho fora da pasta permitida'
          ),
          sl(
            'Resumo',
            'Resumo: use node:fs/promises com await; writeFile sobrescreve, appendFile acrescenta; sem codificação o resultado é Buffer; evite versões Sync em servidores; trate erros por code (ENOENT etc.) sem vazar caminhos; valide qualquer caminho vindo do usuário contra uma pasta base; apague com cuidado e mantenha só os dados necessários. Erros comuns: caminho relativo com pasta atual diferente do esperado (use path.join/resolve), esquecer o await (o código segue antes de o arquivo ser lido) e esquecer a codificação (receber Buffer em vez de texto).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece ao chamar writeFile em um arquivo que já existe, sem outras opções?', 'c', [
          'O texto novo é acrescentado ao final, preservando o conteúdo anterior',
          'O Node lança um erro EEXIST e não altera o arquivo existente',
          'O conteúdo antigo é substituído pelo novo, sem aviso',
          'O Node cria uma cópia numerada do arquivo e grava nela o novo conteúdo'
        ], 'writeFile substitui o conteúdo existente. Para acrescentar ao final usa-se appendFile. EEXIST só ocorreria com flags específicas.'),
        mcq('q2', 'Você leu um arquivo com `await fs.readFile(caminho)` (sem codificação). O que a variável recebe?', 'a', [
          'Um Buffer com os bytes do arquivo',
          'Uma string com o texto, já convertido em utf8',
          'Um array com as linhas do arquivo',
          'Um objeto JSON com o conteúdo interpretado'
        ], 'Sem codificação, readFile devolve Buffer (bytes brutos). Informar "utf8" devolve string; arrays de linhas e JSON exigem processamento posterior.'),
        mcq('q3', 'Por que readFileSync costuma ser má ideia dentro do tratador de requisições de um servidor?', 'd', [
          'Porque readFileSync devolve Buffer e não consegue devolver texto em codificação alguma',
          'Porque readFileSync só lê arquivos pequenos, de até alguns kilobytes',
          'Porque readFileSync não funciona em arquivos que estejam fora do projeto',
          'Porque ele bloqueia a única linha de execução enquanto lê, atrasando os demais clientes'
        ], 'A versão síncrona para o programa até terminar a leitura; num servidor, isso atrasa o atendimento dos demais. Ela aceita codificação, não tem limite fixo tão pequeno e lê de qualquer caminho acessível.'),
        fill('q4', 'Complete com o código de erro que indica "arquivo ou pasta não existe".', 'if (erro.code === "___") { /* arquivo ausente */ }', ['enoent'], 'ENOENT significa que o caminho não existe (arquivo ou pasta ausente).'),
        mcq('q5', 'Um servidor monta o caminho com `path.join("uploads", req.query.nome)` e lê o arquivo. O que pode dar errado?', 'b', [
          'Nada, pois path.join remove automaticamente qualquer tentativa de sair da pasta indicada',
          'Um valor como ../segredo.txt pode fazer o programa ler um arquivo fora da pasta uploads',
          'O servidor falhará quando o nome tiver letras maiúsculas',
          'O arquivo será criptografado antes de ser lido, impossibilitando a leitura'
        ], 'path.join apenas junta e normaliza; ".." continua subindo de pasta (path traversal). A correção é resolver contra uma base e conferir que o resultado fica dentro dela.'),
        mcq('q6', 'Qual abordagem protege melhor contra path traversal?', 'c', [
          'Remover só a primeira ocorrência de ".." do texto recebido antes de usar o caminho',
          'Converter o nome para minúsculas antes de montar o caminho com path.join',
          'Resolver com path.resolve numa pasta base e rejeitar se o resultado sair dela',
          'Aceitar o nome se tiver mais de 3 caracteres e contiver letras'
        ], 'Resolver e conferir o prefixo da pasta base trata todas as formas de escapar. Remover um ".." ou mudar caixa não bloqueia variações, e o tamanho do nome é irrelevante.'),
        mcq('q7', 'Ao falhar uma leitura de arquivo numa API, qual resposta ao cliente é mais adequada?', 'b', [
          'Enviar o texto completo do erro, com o caminho do servidor, para facilitar o suporte',
          'Registrar o detalhe no log interno e devolver uma mensagem genérica',
          'Enviar o stack trace inteiro para o cliente conseguir depurar o problema',
          'Não responder nada, para não revelar que o arquivo existe'
        ], 'Detalhes internos (caminhos, stack) ajudam atacantes; registre-os no servidor e devolva mensagem genérica. Ficar sem resposta deixa o cliente pendurado.'),
        fill('q8', 'Complete com o método que acrescenta texto ao final de um arquivo sem apagar o que já existe.', 'await fs.___(arquivo, "mais uma linha\\n");', ['appendfile'], 'appendFile acrescenta ao final; writeFile substituiria o conteúdo.')
      ]
    },
    {
      id: 'njb-12-callbacks-e-assincronia',
      title: 'Callbacks e assincronia',
      goal: 'Entender por que existe assincronia, usar setTimeout e callbacks, reconhecer o padrão error-first e o callback hell e prever a ordem de execução.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que existe assincronia',
            'Operações de I/O (disco, rede, banco) demoram muito comparadas ao processador. Se o programa ficasse parado esperando, a única linha de execução do Node ficaria ociosa. A solução é a assincronia: iniciar a operação, seguir com o resto do código e voltar ao resultado quando ele chegar. Isso quer dizer que o código NÃO executa necessariamente na ordem em que está escrito: o que depende de espera acontece depois. Entender isso é a chave de todo o resto do curso.'
          ),
          sl(
            'setTimeout e a ordem de execução',
            'setTimeout(função, milissegundos) agenda a função para rodar DEPOIS de pelo menos esse tempo. Mesmo com 0 ms, a função só roda depois que o código atual terminar de executar, pois ela é colocada em uma fila. Resultado: o console.log escrito DEPOIS do setTimeout executa ANTES do que está dentro dele. O tempo informado é um mínimo, não uma garantia exata.',
            'console.log("1 início");\nsetTimeout(() => console.log("3 timeout 0"), 0);\nconsole.log("2 fim do script");\n// saída real:\n// 1 início\n// 2 fim do script\n// 3 timeout 0'
          ),
          sl(
            'Callbacks',
            'Callback é uma função passada como argumento para ser chamada quando uma operação terminar. É o mecanismo mais antigo de assincronia no Node. Como a função só é chamada depois, não existe return útil: o resultado chega como argumento do callback. Um erro comum é tentar usar o resultado na linha seguinte à chamada: ele ainda não existe nesse momento.',
            'function lerFake(nome, cb) {\n  setTimeout(() => {\n    if (!nome) return cb(new Error("nome vazio"));\n    cb(null, `dados de ${nome}`);\n  }, 10);\n}'
          ),
          sl(
            'O padrão error-first',
            'Por convenção, no Node o PRIMEIRO argumento do callback é o erro (ou null se deu certo) e o segundo é o resultado: cb(err, dados). Quem recebe SEMPRE deve checar o erro primeiro. Esquecer de checar o erro faz o programa continuar com dados inexistentes. Note o uso de return antes do cb de erro: evita chamar o callback duas vezes.',
            'lerFake("a", (err, dados) => {\n  if (err) return console.log("erro:", err.message);\n  console.log(dados);\n});\nlerFake("", (err, dados) => {\n  if (err) return console.log("erro:", err.message);\n  console.log(dados);\n});\n// saída real (após o trecho anterior):\n// dados de a\n// erro: nome vazio'
          ),
          sl(
            'Callback hell',
            'Quando uma operação depende do resultado da anterior, os callbacks se aninham: ler um arquivo, depois consultar o banco, depois enviar um e-mail, cada passo dentro do anterior, formando uma "pirâmide" que cresce para a direita, difícil de ler, de testar e de tratar erros (cada nível repete if (err)). Isso é o callback hell. A solução moderna são as promises e o async/await (próximas lições). Mitigação antiga: nomear as funções e deixá-las no nível de cima.',
            'ler(a, (e1, x) => {\n  if (e1) return tratar(e1);\n  consultar(x, (e2, y) => {\n    if (e2) return tratar(e2);\n    enviar(y, (e3) => {\n      if (e3) return tratar(e3);\n      // ... e assim por diante\n    });\n  });\n});'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: assincronia existe para não ficar esperando; setTimeout agenda para depois (mesmo com 0 ms); callback recebe (erro, resultado); aninhar demais vira callback hell. Erros comuns: esperar o resultado na linha seguinte; esquecer de checar err; chamar o callback duas vezes (esquecer return); lançar exceção dentro de um callback assíncrono esperando um try/catch externo capturá-la (não captura: quando o callback roda, o try/catch já terminou); e deixar timers ou operações pendentes, que mantêm o programa vivo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem de saída? console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C");', 'a', [
          'A, C, B',
          'A, B, C',
          'B, A, C',
          'C, A, B'
        ], 'Mesmo com 0 ms, o callback do setTimeout vai para uma fila e só executa depois que o código atual terminar: A, C e depois B.'),
        mcq('q2', 'No padrão error-first, qual é o formato típico de um callback?', 'c', [
          'function (resultado, erro) { ... }',
          'function (erro) { ... }, que só é chamada quando há falha',
          'function (erro, resultado) { ... }',
          'function (sucesso, falha) { ... }, com duas funções separadas'
        ], 'Por convenção, o erro vem primeiro (null em caso de sucesso) e o resultado em seguida. A convenção permite sempre checar o erro antes de usar o resultado.'),
        mcq('q3', 'Por que o código `let dados; ler(a, (e, r) => { dados = r; }); console.log(dados);` imprime undefined?', 'b', [
          'Porque a variável dados foi declarada com let e não pode receber valor depois da declaração',
          'Porque o console.log executa antes de o callback ser chamado, quando o resultado não existe',
          'Porque callbacks só funcionam se o primeiro argumento for um erro',
          'Porque o JavaScript descarta o valor atribuído dentro de funções anônimas'
        ], 'A operação é assíncrona: o console.log roda logo após agendar a leitura, antes do callback. let aceita reatribuição e a atribuição dentro do callback funciona, mas acontece depois.'),
        fill('q4', 'Complete com a função que agenda a execução de um código depois de um tempo em milissegundos.', '___(() => console.log("depois"), 1000);', ['settimeout'], 'setTimeout(função, ms) agenda a função para depois de pelo menos esse tempo.'),
        mcq('q5', 'O que é callback hell?', 'd', [
          'Um erro que o Node mostra quando um mesmo callback é chamado duas vezes na mesma operação',
          'Um modo de execução em que os callbacks são ignorados para ganhar velocidade',
          'A obrigatoriedade de usar setTimeout em toda função assíncrona do programa',
          'O aninhamento profundo de callbacks, que prejudica a leitura e o tratamento de erros'
        ], 'Callback hell é o código em pirâmide de callbacks dentro de callbacks. Não é erro específico do Node nem modo de execução.'),
        mcq('q6', 'Em `lerFake("", cb)`, o callback recebe `cb(new Error("nome vazio"))`. O que o código que o usa deve fazer primeiro?', 'a', [
          'Checar se o primeiro argumento (err) existe antes de usar o resultado',
          'Usar o segundo argumento diretamente, ignorando o primeiro quando ele existir',
          'Chamar setTimeout para esperar o erro desaparecer sozinho',
          'Converter o erro em texto e continuar a execução normal do fluxo'
        ], 'O padrão error-first exige checar o erro antes de usar o resultado; em caso de erro, o resultado não existe. Ignorar o erro leva a dados inexistentes.'),
        mcq('q7', 'Um try/catch envolve a chamada `setTimeout(() => { throw new Error("falhou"); }, 10)`. O catch captura o erro?', 'c', [
          'Sim, porque o try/catch cobre qualquer código escrito dentro dele',
          'Sim, mas se o tempo do setTimeout for 0',
          'Não, porque quando o callback roda, o try/catch já terminou há muito tempo',
          'Não, porque setTimeout não aceita funções que lancem exceções dentro do callback agendado'
        ], 'O callback é executado depois, em outra "rodada" do programa, fora do try/catch original. Por isso erros assíncronos exigem callbacks error-first ou promises com catch.'),
        fill('q8', 'Complete com a posição do erro no padrão error-first: o erro é o ___ argumento do callback.', 'function (err, dados) { /* err é o ___ argumento */ }', ['primeiro', '1º', '1o'], 'No padrão error-first o erro é o primeiro argumento do callback.')
      ]
    },
    {
      id: 'njb-13-promises',
      title: 'Promises',
      goal: 'Entender os estados de uma promise, encadear then/catch/finally, combinar promises com all, allSettled, race e any, criar promises e converter callbacks com promisify.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma promise e seus estados',
            'Uma promise (promessa) é um objeto que representa o resultado futuro de uma operação assíncrona. Ela está sempre em um de três estados: pending (pendente, ainda executando), fulfilled (cumprida, terminou com um valor) ou rejected (rejeitada, terminou com um erro). Uma vez que sai de pendente, o estado não muda mais. Em vez de passar callbacks para a operação, você recebe a promise e anexa o que fazer quando ela terminar.'
          ),
          sl(
            'then, catch e finally; encadeamento',
            '.then(função) roda quando a promise é cumprida e recebe o valor; .catch(função) roda quando é rejeitada (ou quando algum then anterior lançou erro); .finally(função) roda sempre, ao final, útil para limpeza. Cada método devolve uma NOVA promise, o que permite encadear: o valor devolvido por um then vira o valor do próximo. Se um then lança um erro (throw), a cadeia pula até o próximo catch. Um catch no fim da cadeia trata falhas de qualquer etapa anterior.',
            'const esperar = (ms, valor) => new Promise(res => setTimeout(() => res(valor), ms));\nesperar(10, "ok")\n  .then(v => v + "!")\n  .then(v => { console.log(v); throw new Error("quebrou"); })\n  .catch(e => console.log("catch:", e.message))\n  .finally(() => console.log("finally"));\n// saída real:\n// ok!\n// catch: quebrou\n// finally'
          ),
          sl(
            'Criando uma promise',
            'new Promise((resolve, reject) => { ... }) cria uma promise. Dentro, você inicia o trabalho e chama resolve(valor) em caso de sucesso ou reject(erro) em caso de falha (sempre com um objeto Error, para ter stack trace). Só a primeira chamada vale. No exemplo, esperar devolve uma promise que cumpre após ms milissegundos. É assim que se "embrulha" uma API antiga de callbacks.',
            'const esperar = (ms, valor) =>\n  new Promise(res => setTimeout(() => res(valor), ms));\nconst falhar = (ms) =>\n  new Promise((_, rej) => setTimeout(() => rej(new Error("falhou")), ms));'
          ),
          sl(
            'Combinando várias promises',
            'Promise.all([...]) espera TODAS cumprirem e devolve um array com os valores na ordem original; se UMA rejeitar, rejeita na hora. Promise.allSettled([...]) espera todas terminarem, cumpridas ou não, e devolve o status de cada uma (use quando quer o resultado de todas mesmo com falhas). Promise.race([...]) devolve o resultado da primeira que TERMINAR, seja sucesso ou erro. Promise.any([...]) devolve a primeira que CUMPRIR, ignorando as rejeitadas (só falha se todas falharem). As promises já estão rodando em paralelo quando você as passa; esses métodos só combinam os resultados.',
            'console.log(await Promise.all([esperar(20, "a"), esperar(5, "b")]));\nconsole.log(await Promise.race([esperar(30, "lenta"), esperar(5, "rápida")]));\nconsole.log(await Promise.any([falhar(5), esperar(15, "sobrou")]));\ntry { await Promise.all([esperar(5), falhar(1)]); }\ncatch (e) { console.log("all rejeitou:", e.message); }\n// saída real:\n// [ \'a\', \'b\' ]\n// rápida\n// sobrou\n// all rejeitou: falhou\n\n// allSettled devolve, para cada promise:\n// { status: \'fulfilled\', value: \'x\' }\n// { status: \'rejected\', reason: Error: falhou ... }'
          ),
          sl(
            'promisify: de callback para promise',
            'util.promisify (módulo nativo node:util) converte uma função no estilo error-first em uma função que devolve promise. Funciona com qualquer função cujo último argumento é um callback (err, resultado). Assim você aproveita APIs antigas com async/await. Muitos módulos nativos já oferecem versão com promises (como node:fs/promises), e então promisify não é necessário.',
            'const util = require("node:util");\nconst viaCb = (n, cb) => setTimeout(() => cb(null, n * 2), 5);\nconsole.log(await util.promisify(viaCb)(21));\n// saída real:\n// 42'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: promise = resultado futuro (pending, fulfilled, rejected); then/catch/finally encadeiam; all espera todas e falha rápido; allSettled nunca falha; race pega a primeira a terminar; any pega a primeira cumprida; promisify adapta callbacks. Erros comuns: esquecer de devolver (return) a promise dentro de um then, quebrando o encadeamento; esquecer o catch (a rejeição fica sem tratamento e pode derrubar o programa); rejeitar com texto em vez de Error; achar que Promise.all executa em sequência (ele só espera o conjunto).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Quais são os três estados possíveis de uma promise?', 'c', [
          'start, running e stopped',
          'waiting, error e success',
          'pending, fulfilled e rejected',
          'created, resolved e destroyed'
        ], 'Os estados padrão são pending (pendente), fulfilled (cumprida) e rejected (rejeitada). Os demais conjuntos de nomes não fazem parte da especificação.'),
        mcq('q2', 'Em `p.then(a).then(b).catch(c).finally(d)`, se a função a lançar um erro, o que acontece?', 'b', [
          'A função b ainda executa, recebendo undefined, e depois c e d',
          'A função b é pulada, c trata o erro e d executa em seguida',
          'Tudo é interrompido e nem c nem d chegam a executar',
          'Só d executa, pois o catch exige uma rejeição vinda diretamente de p'
        ], 'Um throw dentro de then rejeita a promise seguinte e a cadeia pula até o próximo catch; o finally sempre roda. Assim, b é ignorado, c trata e d executa.'),
        mcq('q3', 'Qual método usar para esperar o resultado de TODAS as promises, mesmo que algumas falhem, sem lançar erro?', 'd', [
          'Promise.all, porque ele devolve os resultados de todas, mesmo as que falham',
          'Promise.race, porque ele aguarda todas antes de devolver',
          'Promise.any, porque ele reúne cumpridas e rejeitadas em um array',
          'Promise.allSettled'
        ], 'allSettled espera todas terminarem e informa o status de cada uma. all rejeita assim que uma falha, race devolve só a primeira a terminar e any devolve a primeira cumprida.'),
        fill('q4', 'Complete com o método que roda uma função sempre ao final da cadeia, com sucesso ou erro.', 'promessa.then(ok).catch(erro).___(() => console.log("fim"));', ['finally'], 'finally roda sempre, independente do resultado, ótimo para limpeza.'),
        mcq('q5', 'Qual a diferença entre Promise.race e Promise.any?', 'a', [
          'race devolve a primeira a terminar, mesmo se for erro; any devolve a primeira a cumprir',
          'race espera todas terminarem; any devolve a mais lenta delas',
          'race ignora erros; any rejeita assim que uma promise falhar',
          'Não há diferença: ambos aceitam um array e devolvem o primeiro resultado de qualquer tipo'
        ], 'race acompanha o primeiro término (sucesso ou falha), enquanto any ignora rejeições e só falha se todas falharem.'),
        mcq('q6', 'Você tem uma função antiga `ler(caminho, cb)` com cb(err, dados). Como usá-la com await?', 'c', [
          'Chamando await ler(caminho), pois await converte callbacks automaticamente em promises',
          'Trocando o nome para lerAsync, o que ativa o modo de promises do Node',
          'Convertendo com util.promisify(ler) e chamando await sobre a função resultante',
          'Não é possível usar await com funções que tenham callback'
        ], 'util.promisify adapta funções error-first para devolver promises. await não converte callbacks sozinho e o nome da função é irrelevante.'),
        mcq('q7', 'Dentro de um then, você faz `fetchDados().then(r => { guardar(r); })` e depois encadeia outro then esperando o resultado de guardar. O que dá errado?', 'b', [
          'O encadeamento funciona normalmente, pois as chaves devolvem o último valor calculado',
          'Faltou o return: sem ele o próximo then recebe undefined e não espera a promise',
          'O then não pode chamar funções assíncronas dentro dele',
          'O próximo then só executa se o primeiro lançar erro'
        ], 'Com chaves, o return precisa ser explícito. Sem devolver a promise, o próximo then não espera e recebe undefined.'),
        fill('q8', 'Complete com a função que cumpre a promise com um valor.', 'new Promise((___, reject) => { resolve(42); });', ['resolve'], 'resolve(valor) cumpre a promise; reject(erro) a rejeita.')
      ]
    },
    {
      id: 'njb-14-async-await-e-tratamento-de-erros',
      title: 'async/await e tratamento de erros',
      goal: 'Escrever código assíncrono com async/await, tratar erros com try/catch, evitar await em laço quando o paralelismo é possível, e criar classes de erro próprias.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'async e await',
            'Uma função marcada com async SEMPRE devolve uma promise: o valor retornado vira o valor de cumprimento, e um throw vira rejeição. Dentro dela, await pausa A FUNÇÃO (não o programa inteiro) até a promise terminar e devolve o valor. O resto do programa segue rodando enquanto a função espera. É açúcar sintático sobre promises que deixa o código assíncrono parecido com código sequencial, muito mais fácil de ler. Em módulos ESM, await também pode ser usado no nível superior do arquivo.',
            'async function buscar(id) {\n  await esperar(50);\n  return id * 10;\n}\nconst r = await buscar(2);\nconsole.log(r);   // 20'
          ),
          sl(
            'try/catch com await',
            'Com async/await, tratamos erros com o try/catch normal: uma promise rejeitada vira uma exceção no ponto do await. Isso permite um único catch para várias operações. Lembre de colocar o await DENTRO do try: sem await, a rejeição acontece depois e o catch não a vê. Use finally para limpeza (fechar recursos). Dica: capture erros apenas onde você sabe o que fazer com eles; senão deixe subir para um tratador central.',
            'async function main() {\n  try {\n    await buscar(-1);\n  } catch (e) {\n    console.log("erro:", e.message);\n  } finally {\n    console.log("limpeza");\n  }\n}'
          ),
          sl(
            'await em laço x paralelo',
            'Um await dentro de um for faz as operações rodarem UMA POR VEZ (sequencial): três buscas de 50 ms levam cerca de 150 ms. Isso é correto quando uma depende da anterior ou quando você precisa limitar a carga. Se as operações são independentes, dispare todas e espere em conjunto com Promise.all: levam cerca de 50 ms no total. Erro comum: usar await em laço para tarefas independentes e perder desempenho; ou o contrário, disparar milhares em paralelo e sobrecarregar um banco ou uma API externa (limite a concorrência).',
            'let t = Date.now();\nfor (const id of [1, 2, 3]) await buscar(id);\nconsole.log("sequencial >= 150ms:", Date.now() - t >= 140);\nt = Date.now();\nconst r = await Promise.all([1, 2, 3].map(buscar));\nconsole.log(r, "paralelo < 120ms:", Date.now() - t < 120);\n// saída real:\n// sequencial >= 150ms: true\n// [ 10, 20, 30 ] paralelo < 120ms: true'
          ),
          sl(
            'throw, Error e classes de erro próprias',
            'Lance sempre objetos Error (throw new Error("mensagem")), nunca texto ou números: só o Error carrega stack trace (o caminho das chamadas até o erro). Para distinguir tipos de falha, crie suas classes estendendo Error: o catch pode então checar com instanceof e reagir diferente a cada tipo (ex.: erro de validação vira 400; erro inesperado vira 500). Defina this.name para identificar o tipo e adicione campos úteis, sem dados pessoais nem segredos.',
            'class ValidacaoError extends Error {\n  constructor(campo, msg) {\n    super(msg);\n    this.name = "ValidacaoError";\n    this.campo = campo;\n  }\n}\ntry { throw new ValidacaoError("id", "id inválido"); }\ncatch (e) {\n  console.log(e instanceof ValidacaoError, e instanceof Error, e.name, e.campo, e.message);\n}\n// saída real:\n// true true ValidacaoError id id inválido'
          ),
          sl(
            'Erros não tratados (unhandled rejection)',
            'Se uma promise é rejeitada e ninguém a trata (nem catch, nem try/catch com await), temos uma unhandled rejection. Nas versões atuais do Node, isso derruba o processo com o erro impresso e código de saída diferente de zero. Parece duro, mas é intencional: um erro ignorado deixa o programa em estado imprevisível. Portanto: sempre trate rejeições; e jamais esqueça o await ou o return de uma promise dentro de uma função async (um "promise flutuante" rejeita sem ninguém olhando). Existe process.on("unhandledRejection") para registrar o erro antes de encerrar, mas não deve ser usado para esconder falhas.',
            'Promise.reject(new Error("ninguém tratou"));\n// saída real (processo encerrado com erro):\n// Error: ninguém tratou\n//     at Object.<anonymous> (...)'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: async devolve promise; await pausa a função até o resultado; try/catch trata falhas; em laço o await é sequencial, com Promise.all é paralelo; lance Error (ou subclasses) para ter stack e tipos; trate toda rejeição. Erros comuns: esquecer o await (a função segue sem o resultado e a rejeição fica solta); usar forEach com async (o forEach não espera as funções; prefira for...of ou Promise.all com map); misturar then/catch com async/await de forma confusa; e devolver ao cliente a mensagem interna de um erro inesperado, vazando detalhes.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que uma função declarada com async devolve?', 'b', [
          'O valor retornado, diretamente, exatamente como faz uma função comum que não é async',
          'Uma promise em qualquer caso, cumprida com o valor retornado ou rejeitada se houver throw',
          'Um array com o resultado e o erro, seguindo o padrão error-first dos callbacks do Node',
          'undefined, pois o valor só pode ser lido dentro da própria função que o calculou'
        ], 'Funções async sempre devolvem promise: o return cumpre e o throw rejeita. Quem chama precisa usar await ou then para obter o valor.'),
        mcq('q2', 'Onde deve ficar o await para que o catch capture a falha de `buscar(-1)`?', 'd', [
          'Fora do try, logo depois do bloco catch, para aguardar o tratamento do erro',
          'Em lugar algum: o catch captura rejeições de promises sem precisar do await',
          'Dentro do catch, para esperar a mensagem de erro ser montada',
          'Dentro do try, na chamada: try { await buscar(-1); } catch (e) { ... }'
        ], 'A rejeição só vira exceção no ponto do await, que precisa estar dentro do try. Sem o await, o catch não a enxerga.'),
        mcq('q3', 'Três buscas independentes levam 50 ms cada. Qual código as executa mais rápido?', 'a', [
          'await Promise.all([buscar(1), buscar(2), buscar(3)]);',
          'for (const id of [1, 2, 3]) await buscar(id);',
          'await buscar(1); await buscar(2); await buscar(3);',
          'Todas levam o mesmo tempo, pois o Node tem uma única thread'
        ], 'Com Promise.all as operações de I/O independentes são disparadas juntas (~50 ms). Com await em sequência, ~150 ms. Ser single-thread não impede I/O concorrente.'),
        fill('q4', 'Complete com a palavra que pausa uma função async até a promise terminar.', 'const dados = ___ buscar(1);', ['await'], 'await pausa a função async até a promise ser cumprida e devolve o valor.'),
        mcq('q5', 'Por que lançar `throw "falhou"` (um texto) é má prática?', 'c', [
          'Porque o JavaScript proíbe lançar qualquer valor que não seja um número ou um objeto',
          'Porque o texto é cortado ao passar por um try/catch',
          'Porque só objetos Error carregam stack trace e permitem checar o tipo (instanceof)',
          'Porque o throw com texto encerra o programa sem chance de captura'
        ], 'Lançar Error preserva stack trace e permite distinguir tipos; texto não tem stack. O JavaScript até permite lançar qualquer valor, e o catch captura normalmente.'),
        mcq('q6', 'Para que serve criar `class ValidacaoError extends Error`?', 'b', [
          'Para impedir que outros tipos de erro sejam lançados no mesmo programa em tempo de execução',
          'Para distinguir tipos de falha no catch (instanceof) e tratar cada um adequadamente',
          'Para substituir o try/catch por um mecanismo mais rápido e moderno do Node',
          'Para que o erro seja tratado automaticamente sem escrever catch'
        ], 'Subclasses de Error permitem checar o tipo (por exemplo, 400 para validação e 500 para falha inesperada). Não substituem try/catch nem tratam sozinhas.'),
        mcq('q7', 'O que costuma acontecer, nas versões atuais do Node, com uma promise rejeitada que ninguém trata?', 'd', [
          'Nada: a rejeição é descartada em silêncio e o programa continua normalmente depois dela',
          'O Node tenta executar de novo a operação até ela dar certo',
          'O Node converte a rejeição em um valor undefined e segue adiante',
          'O processo é encerrado com a mensagem do erro e um código de saída diferente de zero'
        ], 'Rejeições não tratadas encerram o processo (unhandled rejection), para evitar estado imprevisível. Não há retentativa nem descarte silencioso.'),
        fill('q8', 'Complete com a palavra-chave que cria um erro novo para ser lançado.', 'throw new ___("valor inválido");', ['error'], 'Lança-se um objeto Error (ou subclasse) para ter mensagem e stack trace.')
      ]
    },
    {
      id: 'njb-41-erros-globais-e-ciclo-de-vida-do-processo',
      title: 'Erros globais e ciclo de vida do processo',
      goal: 'Registrar e encerrar de forma controlada diante de uncaughtException e unhandledRejection, usar códigos de saída e sinais (SIGINT/SIGTERM) e saber a diferença entre process.exitCode e process.exit.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Erros que ninguém tratou',
            'Já vimos try/catch e catch de promises. Se uma exceção sobe sem ninguém capturar, o Node dispara o evento uncaughtException no objeto process; se uma promise é rejeitada sem tratador, dispara unhandledRejection. Sem nenhum ouvinte, o comportamento padrão atual é imprimir o erro e encerrar o processo com código diferente de zero. Você pode registrar ouvintes para esses eventos com process.on(nome, função). A pergunta é o que fazer dentro deles, e a resposta é o ponto central da lição.',
            'process.on("uncaughtException", (err, origem) => {\n  console.error("fatal:", err.message, "|", origem);\n  process.exitCode = 1;\n  process.exit();\n});\nsetTimeout(() => { throw new Error("falha inesperada"); }, 10);\n// saída real:\n// fatal: falha inesperada | uncaughtException'
          ),
          sl(
            'Por que logar e encerrar, e não continuar',
            'Um erro não tratado significa que o programa chegou a um estado que você não previu: uma conexão pode ter ficado meio aberta, um dado pode estar pela metade, um bloqueio pode não ter sido liberado. Continuar rodando como se nada tivesse acontecido arrisca corromper dados e devolver respostas erradas, e o defeito fica escondido. A prática segura é: registrar o erro (sem dados pessoais nem segredos no log), fazer uma limpeza curta e rápida, e encerrar com código de falha; quem reinicia o processo (o orquestrador, o gerenciador de serviços) sobe uma instância limpa. O mesmo vale para unhandledRejection: use o ouvinte para registrar e encerrar, nunca para engolir o erro e seguir. O correto, sempre, é tratar o erro perto de onde ele nasce; o ouvinte global é a última rede de proteção, não um tratamento.',
            'process.on("unhandledRejection", (motivo) => {\n  console.error("rejeição sem tratador:", motivo instanceof Error ? motivo.message : motivo);\n  process.exitCode = 1;\n  // limpeza curta e encerramento\n});\n// ilustrativo: padrão recomendado; conferir a documentação da versão em uso'
          ),
          sl(
            'Códigos de saída e exitCode x exit',
            'O código de saída (exit code) é o número que o processo devolve ao sistema: 0 significa sucesso e qualquer outro valor significa falha. Scripts de shell, pipelines de CI e orquestradores leem esse número para decidir se algo deu certo. Há duas formas de defini-lo. process.exitCode = 1 apenas registra o código e deixa o programa terminar naturalmente, depois de concluir as tarefas pendentes. process.exit(1) encerra IMEDIATAMENTE, e pode cortar gravações em andamento e logs ainda não escritos. Regra geral: prefira exitCode e deixe o programa acabar; use exit() quando o estado já é irrecuperável (como dentro de um tratador de uncaughtException, depois de registrar o erro).',
            'process.on("exit", (code) => console.log("saindo com codigo", code));\n// ...após o erro do exemplo anterior:\n// saída real (código de saída do processo: 1):\n// fatal: falha inesperada | uncaughtException\n// saindo com codigo 1'
          ),
          sl(
            'Sinais: SIGINT e SIGTERM em conceito',
            'Sinais são avisos que o sistema operacional envia a um processo. SIGINT chega quando alguém aperta Ctrl+C no terminal; SIGTERM é o pedido educado de término usado por gerenciadores de serviços e por orquestradores (como containers) antes de forçar o fim. Por padrão o Node encerra ao recebê-los, mas você pode interceptar com process.on("SIGTERM", ...) para fazer um ENCERRAMENTO ORDENADO (graceful shutdown): parar de aceitar novos pedidos, terminar os em andamento, fechar o servidor e as conexões com banco e só então sair. Se o programa ignorar o pedido, o sistema acaba forçando o término (SIGKILL), que não pode ser interceptado. Comportamento exato dos sinais varia por sistema operacional (no Windows, por exemplo, há diferenças); confira a documentação.',
            'const servidor = http.createServer(tratador);\nfunction encerrar(sinal) {\n  console.log("recebi", sinal, "- fechando");\n  servidor.close(() => {\n    process.exitCode = 0;   // terminou de forma ordenada\n  });\n}\nprocess.on("SIGINT", encerrar);\nprocess.on("SIGTERM", encerrar);\n// ilustrativo, não executado aqui (depende do sistema operacional)'
          ),
          sl(
            'O evento exit e finalizadores',
            'O evento "exit" é emitido quando o processo está prestes a terminar, por qualquer motivo (fim natural, exit(), erro). Nele só funciona código SÍNCRONO: o laço de eventos já não vai mais rodar, então timers e promises ali nunca executam. Serve para um último log simples ou para liberar algo local. Limpezas assíncronas (fechar servidor, banco, gravar fila) devem ser feitas ANTES, no ouvinte de sinal ou no fluxo de encerramento ordenado, e só depois você deixa o processo terminar. Erro comum: tentar fazer await ou enviar uma requisição dentro do ouvinte de exit. Resumo: logar, limpar rápido, definir exitCode e terminar; nunca continuar após uncaughtException.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o tratador de uncaughtException deve registrar o erro e encerrar o processo, em vez de seguir rodando?', 'd', [
          'Porque o Node proíbe código depois de uncaughtException e o processo travaria de qualquer forma',
          'Porque seguir rodando consome mais memória, e encerrar é só uma otimização de desempenho',
          'Porque o erro já foi corrigido pelo Node, e continuar executando repetiria a correção',
          'Porque o programa pode estar em estado imprevisível e continuar arrisca dados corrompidos'
        ], 'Um erro não previsto deixa o estado do programa incerto; continuar pode corromper dados e esconder o defeito. Por isso registra-se, limpa-se rápido e encerra-se, deixando o gerenciador subir uma instância limpa. Não é questão de memória, de proibição do Node nem de correção automática.'),
        mcq('q2', 'Um script de importação termina com erro de validação, mas ainda grava um relatório em arquivo. Qual abordagem mantém o relatório e sinaliza falha?', 'a', [
          'Definir process.exitCode = 1 e deixar o programa terminar depois de gravar o relatório',
          'Chamar process.exit(1) imediatamente após detectar o erro, antes de gravar o relatório pendente',
          'Definir process.exitCode = 0, já que o relatório foi gerado e o arquivo ficou completo',
          'Lançar o erro dentro do ouvinte do evento exit para que a gravação seja refeita ali'
        ], 'exitCode registra o código de falha sem interromper: a gravação pendente termina e o processo sai com 1. exit(1) logo na detecção pode cortar a gravação; código 0 esconde a falha para o CI; no evento exit só roda código síncrono, então não serve para refazer gravações.'),
        mcq('q3', 'O que SIGTERM representa e como um servidor deve reagir a ele?', 'b', [
          'É o atalho Ctrl+C do terminal; o servidor deve ignorá-lo para não perder as conexões abertas',
          'Pedido de término; o servidor deve concluir o que está em andamento e sair',
          'É um erro de memória; o servidor deve reiniciar a si mesmo imediatamente',
          'É um sinal que não pode ser interceptado e que força o fim do processo na hora'
        ], 'SIGTERM é o pedido educado de término; interceptá-lo permite o encerramento ordenado (fechar servidor e conexões e depois sair). Ctrl+C corresponde ao SIGINT; não é erro de memória; o sinal que não pode ser interceptado é o SIGKILL.'),
        fill('q4', 'Complete com o nome do evento disparado quando uma exceção sobe sem nenhum tratador.', 'process.on("___", (err) => {\n  console.error("fatal:", err.message);\n  process.exitCode = 1;\n});', ['uncaughtException'], 'uncaughtException é o evento de uma exceção que ninguém capturou; o ouvinte deve registrar e encerrar, não continuar.'),
        mcq('q5', 'Um pipeline de CI executa node teste.js e decide se o passo passou. Qual código de saída indica sucesso?', 'c', [
          '1, pois é o primeiro valor positivo e indica que a tarefa foi executada',
          '-1, que é o valor reservado pelo sistema para execuções concluídas',
          '0; qualquer outro valor indica falha',
          'O código não importa, pois o CI só observa o que foi impresso na saída'
        ], 'Por convenção, 0 é sucesso e qualquer outro número é falha; é isso que scripts, CI e orquestradores leem. Imprimir mensagens não substitui o código de saída.'),
        mcq('q6', 'Para que serve o ouvinte de unhandledRejection em uma aplicação bem escrita?', 'd', [
          'Para esconder rejeições esperadas e manter o programa rodando como se nada tivesse ocorrido',
          'Para substituir os try/catch do código, centralizando o tratamento em um lugar',
          'Para transformar a rejeição em sucesso, devolvendo um valor padrão a quem esperava a promise',
          'Para registrar a falha, sem dados pessoais, e encerrar de forma controlada'
        ], 'O ouvinte global é a última rede: registra o problema (sem dados pessoais) e encerra de forma controlada. Ele não substitui try/catch nem converte a promise em sucesso, e usá-lo para engolir erros mantém o programa em estado duvidoso.'),
        mcq('q7', 'O que é correto fazer dentro de process.on("exit", ...)?', 'b', [
          'Esperar com await o fechamento da conexão com o banco antes de sair',
          'Executar código síncrono, não assíncrono, como um último log simples',
          'Enviar uma requisição HTTP avisando o monitoramento de que o serviço caiu',
          'Agendar um setTimeout para tentar novamente a tarefa que falhou'
        ], 'Quando o evento exit ocorre, o laço de eventos não roda mais: só código síncrono funciona. await, requisições e timers nunca chegariam a executar; limpezas assíncronas devem ocorrer antes, no encerramento ordenado.'),
        fill('q8', 'Complete com a propriedade que define o código de saída sem encerrar imediatamente.', 'if (falhou) {\n  process.___ = 1;\n}', ['exitCode'], 'process.exitCode = 1 registra a falha e deixa o programa terminar naturalmente, diferente de process.exit(1), que encerra na hora.')
      ]
    },
    {
      id: 'njb-15-event-loop-primeiros-conceitos',
      title: 'Event loop: primeiros conceitos',
      goal: 'Entender pilha de chamadas, filas, microtasks x macrotasks em visão simples e por que bloquear o loop é prejudicial.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A pilha de chamadas',
            'A pilha de chamadas (call stack) é onde o JavaScript guarda "o que está sendo executado agora": ao chamar uma função, ela entra na pilha; ao terminar, sai. Só há UMA pilha (uma linha de execução): o código roda até acabar a pilha, sem ser interrompido no meio. Isso explica por que um laço longo trava tudo: enquanto a pilha está ocupada, nada mais executa.'
          ),
          sl(
            'Filas e o event loop',
            'Quando um timer termina, uma leitura de arquivo conclui ou uma requisição chega, o callback correspondente não executa na hora: ele vai para uma FILA. O event loop (laço de eventos) é o mecanismo que fica vigiando: quando a pilha de chamadas está VAZIA, ele pega o próximo item da fila e o executa. Por isso o setTimeout(fn, 0) roda depois do código atual: fn só entra quando a pilha esvazia. O event loop é o que permite o modelo não bloqueante do Node funcionar com uma só thread de JavaScript.'
          ),
          sl(
            'Microtasks x macrotasks (visão simples)',
            'Há mais de uma fila, com prioridades. Macrotasks (tarefas): callbacks de timers (setTimeout), de I/O e outros eventos. Microtasks: callbacks de promises (then, o código depois de um await) e queueMicrotask. Regra simples: depois que a pilha esvazia, o Node executa TODAS as microtasks pendentes ANTES de pegar a próxima macrotask. No Node existe ainda process.nextTick, ainda mais prioritário que as microtasks de promise (use com moderação). Por isso um then roda antes de um setTimeout de 0 ms, mesmo que o setTimeout tenha sido escrito primeiro.'
          ),
          sl(
            'Exemplo executado: a ordem de saída',
            'Acompanhe: primeiro roda todo o código síncrono (A, A2); depois o nextTick; depois as microtasks de promise; e por fim as macrotasks (timers). Observação: a ordem entre setTimeout(0) e outras macrotasks, como setImmediate, no arquivo principal pode variar; por isso aqui comparamos apenas microtasks com timer.',
            'console.log("A: script");\nsetTimeout(() => console.log("E: setTimeout 0"), 0);\nPromise.resolve().then(() => console.log("C: microtask (promise)"));\nqueueMicrotask(() => console.log("D: queueMicrotask"));\nprocess.nextTick(() => console.log("B: nextTick"));\nconsole.log("A2: fim do script");\n// saída real:\n// A: script\n// A2: fim do script\n// B: nextTick\n// C: microtask (promise)\n// D: queueMicrotask\n// E: setTimeout 0'
          ),
          sl(
            'Por que bloquear o loop é ruim',
            'Se o código síncrono demora (um laço pesado, um JSON gigante, uma versão Sync de operação de arquivo), a pilha fica ocupada e NADA da fila executa: timers atrasam, requisições esperam, o servidor parece "travado". No exemplo, um timer de 10 ms só dispara depois de ~300 ms porque o laço ocupou a pilha. Soluções: dividir o trabalho em pedaços, usar versões assíncronas, mover cálculo pesado para Worker Threads ou outro processo. Cuidado também com trabalho caro disparado por entrada do usuário: sem limites, vira um vetor de negação de serviço.',
            'const t = Date.now();\nsetTimeout(() => console.log("timer de 10ms depois de >= 300ms?", Date.now() - t >= 300), 10);\nwhile (Date.now() - t < 300) {}   // laço ocupa a pilha\nconsole.log("laço terminou");\n// saída real:\n// laço terminou\n// timer de 10ms depois de >= 300ms? true'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: uma pilha; filas guardam callbacks; o event loop leva itens da fila para a pilha quando ela esvazia; microtasks (promises) antes de macrotasks (timers); nunca bloqueie a pilha. Erros comuns: achar que setTimeout com 0 ms roda "na hora"; achar que o tempo do timer é exato (é um mínimo); usar laços ou funções Sync pesadas em servidores; e depender da ordem entre filas diferentes sem conhecê-la (como timers e setImmediate). Para a visão aprofundada (fases do loop), veja o nível intermediário.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem de saída? setTimeout(() => console.log("T"), 0); Promise.resolve().then(() => console.log("P")); console.log("S");', 'c', [
          'T, P, S',
          'S, T, P',
          'S, P, T',
          'P, S, T'
        ], 'O código síncrono (S) roda primeiro; depois as microtasks de promise (P); por fim a macrotask do timer (T).'),
        mcq('q2', 'O que o event loop faz?', 'a', [
          'Quando a pilha esvazia, pega o próximo callback pendente nas filas e o executa',
          'Cria uma thread nova para cada callback registrado no programa, executando-os em paralelo',
          'Interrompe a função em execução para dar vez ao callback mais antigo',
          'Reordena o código-fonte para executar primeiro as linhas assíncronas'
        ], 'O event loop só leva callbacks para a pilha quando ela está vazia; ele não interrompe código em execução, não cria threads por callback e não altera o código.'),
        mcq('q3', 'Por que um laço `while` que roda por 5 segundos atrasa um servidor Node inteiro?', 'b', [
          'Porque o Node reinicia o servidor quando um laço demora mais que o limite permitido',
          'Porque ocupa a única pilha e, enquanto ela está ocupada, os callbacks da fila ficam parados',
          'Porque o laço consome toda a rede, impedindo que requisições cheguem',
          'Porque o Node proíbe laços while e os executa de forma mais lenta'
        ], 'Com uma só pilha, nada da fila roda até ela esvaziar. O laço não consome rede, não é proibido e não causa reinício automático.'),
        fill('q4', 'Complete com o tipo de tarefa cujos callbacks de promise (then) são executados antes dos timers.', 'Callbacks de promise são ___ e rodam antes dos timers.', ['microtasks', 'microtask'], 'Promises geram microtasks, executadas antes da próxima macrotask (timers, I/O).'),
        mcq('q5', 'Um then de uma promise já cumprida e um setTimeout de 0 ms foram agendados no mesmo trecho. Qual executa primeiro?', 'd', [
          'O setTimeout, porque tem o tempo explícito de 0 ms',
          'Depende do tamanho do código escrito dentro de cada um',
          'Os dois executam exatamente ao mesmo tempo, em threads separadas',
          'O then, pois microtasks rodam antes da próxima macrotask'
        ], 'Microtasks são esvaziadas antes de pegar a próxima macrotask (como um timer), independentemente da ordem de escrita.'),
        mcq('q6', 'Qual afirmação sobre o tempo passado ao setTimeout está correta?', 'c', [
          'É o horário exato em que a função será executada, com precisão garantida',
          'É o tempo máximo permitido, depois do qual a função é descartada',
          'É um tempo mínimo: a função só entra na fila depois dele e roda quando a pilha libera',
          'É ignorado quando o valor é menor que 100 ms, caso em que a função roda na mesma hora'
        ], 'O timer garante apenas o mínimo; se a pilha estiver ocupada, a execução atrasa. Não há descarte, nem precisão garantida, nem limite de 100 ms.'),
        mcq('q7', 'Qual medida ajuda quando uma requisição precisa de um cálculo pesado de CPU?', 'a', [
          'Mover o cálculo para um Worker Thread ou outro processo, mantendo o loop livre',
          'Colocar o cálculo dentro de um setTimeout de 0 ms para ele rodar mais rápido',
          'Usar await antes do cálculo, pois isso o torna paralelo automaticamente',
          'Aumentar o tempo do timer para que o cálculo termine antes de outros eventos'
        ], 'Workers/processos executam fora da linha principal. setTimeout 0 e await não tornam o cálculo paralelo; ele continua ocupando a pilha quando executa.'),
        fill('q8', 'Complete com o nome do mecanismo que leva callbacks das filas para a pilha quando ela esvazia.', 'O ___ loop executa os callbacks pendentes quando a pilha está vazia.', ['event'], 'O event loop (laço de eventos) é o mecanismo que consome as filas quando a pilha está vazia.')
      ]
    },
    {
      id: 'njb-16-eventos-e-eventemitter',
      title: 'Eventos e EventEmitter',
      goal: 'Usar o EventEmitter (on, emit, once, off), entender o padrão de eventos, o evento especial error e o vazamento de listeners.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O padrão de eventos',
            'Muitas partes do Node funcionam por eventos: algo acontece (uma requisição chega, um arquivo termina de ser lido) e quem se interessou é avisado. No padrão, existe um EMISSOR, que anuncia eventos com um nome, e OUVINTES (listeners), funções registradas para reagir a um nome de evento. O emissor não precisa saber quem escuta, o que desacopla as partes do programa. A classe base é EventEmitter, do módulo nativo node:events; objetos como servidores HTTP e streams são EventEmitters.'
          ),
          sl(
            'on, emit, once e off',
            'emissor.on("nome", função) registra um ouvinte; emissor.emit("nome", ...argumentos) dispara o evento, chamando todos os ouvintes na ordem de registro, SINCRONAMENTE, com os argumentos passados; emit devolve true se havia ouvintes e false caso contrário. once registra um ouvinte que roda apenas na primeira vez e se remove sozinho. off (ou removeListener) remove um ouvinte específico: por isso é preciso guardar a função em uma variável para poder remover depois. Emitir um evento sem ouvintes não é erro: nada acontece.',
            'const { EventEmitter } = require("node:events");\nconst loja = new EventEmitter();\nloja.on("pedido", (id, valor) => console.log(`pedido ${id}: R$ ${valor}`));\nloja.once("aberta", () => console.log("loja abriu (só 1 vez)"));\nconst log = (id) => console.log("log do pedido", id);\nloja.on("pedido", log);\nloja.emit("aberta"); loja.emit("aberta");\nloja.emit("pedido", 1, 50);\nloja.off("pedido", log);\nconsole.log(loja.emit("pedido", 2, 80), loja.emit("ninguem-ouve"), loja.listenerCount("pedido"));\n// saída real:\n// loja abriu (só 1 vez)\n// pedido 1: R$ 50\n// log do pedido 1\n// pedido 2: R$ 80\n// true false 1'
          ),
          sl(
            'O evento especial "error"',
            'O nome "error" é tratado de forma especial: se você emite "error" e NÃO há nenhum ouvinte para ele, o Node lança o erro como exceção, e se ninguém a captura o processo cai. Por isso, todo emissor que pode falhar deve ter um ouvinte de "error". Ao emitir "error", passe um objeto Error (nunca texto).',
            'loja.on("error", (e) => console.log("erro tratado:", e.message));\nloja.emit("error", new Error("estoque zerado"));\n\nconst sem = new EventEmitter();\ntry { sem.emit("error", new Error("sem ouvinte")); }\ncatch (e) { console.log("lançou:", e.message); }\n// saída real:\n// erro tratado: estoque zerado\n// lançou: sem ouvinte'
          ),
          sl(
            'Estendendo EventEmitter',
            'É comum criar uma classe que estende EventEmitter para que seus objetos emitam eventos próprios: por exemplo, uma classe Download que emite "progresso" e "concluido". Quem usa a classe apenas se inscreve nos eventos. Atenção: os ouvintes são chamados sincronamente dentro do emit; se um ouvinte demora ou lança exceção, o emit é afetado. Para trabalho longo, o ouvinte deve disparar uma operação assíncrona em vez de bloquear.'
          ),
          sl(
            'Vazamento de listeners (conceito)',
            'Cada on adiciona um ouvinte que fica na memória enquanto o emissor existir. Se você registra ouvintes repetidamente (por exemplo, a cada requisição, num emissor que vive o tempo todo do servidor) e nunca os remove, a lista cresce sem parar: é um vazamento de memória. O Node alerta quando um mesmo evento tem muitos ouvintes (um aviso de "possible EventEmitter memory leak detected"). Soluções: usar once quando for um uso único, remover com off quando não precisar mais, e registrar ouvintes uma só vez, na inicialização.'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: EventEmitter (node:events); on registra, emit dispara (síncrono, na ordem), once roda uma vez, off remove (exige guardar a função), "error" sem ouvinte lança exceção, ouvintes acumulados vazam memória. Erros comuns: errar o nome do evento (um erro de digitação silencia o ouvinte, pois emit sem ouvintes não falha); passar função anônima ao off (não remove, pois é outra função); esquecer o ouvinte de "error"; e achar que os ouvintes rodam de forma assíncrona (rodam dentro do emit).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que `emissor.emit("pedido", 1, 50)` faz?', 'b', [
          'Registra um novo ouvinte chamado "pedido" que recebe os valores 1 e 50',
          'Chama, na ordem, os ouvintes registrados para "pedido", passando 1 e 50',
          'Agenda os ouvintes de "pedido" para rodar depois, em outra thread',
          'Remove os ouvintes de "pedido" e guarda os valores 1 e 50 para uso futuro'
        ], 'emit dispara o evento chamando os ouvintes sincronamente na ordem de registro. Registrar é on, e emit não agenda para outra thread nem remove ouvintes.'),
        mcq('q2', 'Qual método registra um ouvinte que executa uma única vez?', 'd', [
          'emissor.on, que remove o ouvinte automaticamente após o primeiro uso',
          'emissor.off, que executa o ouvinte e depois o descarta',
          'emissor.emit, que dispara o ouvinte e o apaga da lista',
          'emissor.once'
        ], 'once registra um ouvinte de uso único. on mantém o ouvinte; off remove; emit dispara.'),
        mcq('q3', 'O que acontece ao executar `emissor.emit("error", new Error("x"))` quando não há nenhum ouvinte de "error"?', 'c', [
          'Nada: eventos sem ouvintes são descartados em silêncio, como qualquer outro',
          'O Node imprime um aviso e continua a execução normalmente',
          'O erro é lançado como exceção, podendo derrubar o processo se ninguém a capturar',
          'O Node cria automaticamente um ouvinte que registra o erro em arquivo'
        ], '"error" é especial: sem ouvinte, o Node lança a exceção. Para outros eventos, emitir sem ouvintes é inofensivo.'),
        fill('q4', 'Complete com o método que dispara um evento chamando os ouvintes.', 'emissor.___("pedido", 1, 50);', ['emit'], 'emit dispara o evento e chama os ouvintes registrados com os argumentos passados.'),
        mcq('q5', 'Por que `emissor.off("x", () => f())` não remove o ouvinte registrado com `emissor.on("x", () => f())`?', 'a', [
          'Porque são funções diferentes; para remover é preciso passar a mesma referência registrada',
          'Porque off só funciona com eventos registrados por once, que são removidos de outra forma',
          'Porque funções anônimas não podem ser removidas por método algum do módulo events',
          'Porque o off precisa ser chamado antes do on para surtir efeito'
        ], 'off compara a referência da função: cada arrow escrita é um objeto distinto. Guarde a função numa variável para removê-la.'),
        mcq('q6', 'Qual prática reduz o risco de vazamento de listeners num servidor?', 'b', [
          'Registrar um novo ouvinte do mesmo evento a cada requisição, para garantir que ele esteja atualizado',
          'Registrar ouvintes na inicialização e usar once ou off quando o uso for temporário',
          'Aumentar o limite de ouvintes para o aviso deixar de aparecer',
          'Emitir os eventos duas vezes, para garantir que os ouvintes antigos sejam descartados'
        ], 'Ouvintes acumulados ocupam memória; registre uma vez e remova os temporários. Aumentar o limite só esconde o aviso, e emitir duas vezes não remove nada.'),
        mcq('q7', 'Os ouvintes registrados com on são executados de que forma quando se chama emit?', 'd', [
          'De forma assíncrona, depois que o código atual termina, em ordem aleatória',
          'Em paralelo, cada um em uma thread própria criada pelo Node',
          'O último ouvinte registrado, que substitui os anteriores',
          'Sincronamente, dentro da chamada de emit, na ordem em que foram registrados'
        ], 'Os ouvintes rodam dentro de emit, na ordem de registro. Se algum demora, o emit demora, e várias funções podem ouvir o mesmo evento.'),
        fill('q8', 'Complete com o módulo nativo que fornece a classe EventEmitter.', 'const { EventEmitter } = require("node:___");', ['events'], 'A classe EventEmitter vem do módulo nativo node:events.')
      ]
    },
    {
      id: 'njb-17-http-nativo-primeiro-servidor',
      title: 'HTTP nativo: o primeiro servidor',
      goal: 'Criar um servidor com o módulo http, ler req e res, definir status e headers, escutar uma porta e fazer rotas manuais, entendendo por que frameworks ajudam.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O módulo http e createServer',
            'O módulo nativo node:http permite criar um servidor web sem nenhum pacote. http.createServer(função) recebe uma função tratadora, chamada a CADA requisição, com dois objetos: req (a requisição: método, URL, cabeçalhos, corpo) e res (a resposta, que você monta e envia). server.listen(porta, endereço, callback) começa a escutar. Para desenvolvimento local, escute em 127.0.0.1 (só a sua máquina acessa), em vez de abrir para a rede inteira. Em testes, a porta 0 pede ao sistema uma porta livre.'
          ),
          sl(
            'Resposta: status e headers',
            'Toda resposta HTTP tem um status code (um número que resume o resultado: 200 = ok; 404 = não encontrado; 400 = requisição inválida; 500 = erro no servidor), cabeçalhos (headers, pares nome: valor, como Content-Type, que informa o tipo do conteúdo) e um corpo. res.writeHead(status, headers) define status e cabeçalhos; res.end(texto) envia o corpo e encerra a resposta. SEMPRE chame res.end: sem ele o cliente fica esperando para sempre. Inclua o charset no Content-Type de texto (text/plain; charset=utf-8) para acentos funcionarem.'
          ),
          sl(
            'Rotas manuais com if',
            'Rotear é decidir o que fazer conforme o método e o caminho. req.method é o método ("GET", "POST"...) e req.url vem como texto "/sobre?x=1"; use new URL(req.url, "http://localhost").pathname para separar o caminho da query. Sem framework, você escreve ifs: se for GET e o caminho for "/", responda assim; se for "/sobre", responda assado; senão, 404. Use return depois de res.end para não continuar executando e tentar responder duas vezes (o que causa erro).',
            'const http = require("node:http");\nconst server = http.createServer((req, res) => {\n  const { pathname } = new URL(req.url, "http://localhost");\n  if (req.method === "GET" && pathname === "/") {\n    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });\n    return res.end("Olá do Node!");\n  }\n  if (req.method === "GET" && pathname === "/sobre") {\n    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });\n    return res.end("Servidor de estudo");\n  }\n  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });\n  res.end("Não encontrado");\n});'
          ),
          sl(
            'Exemplo executado em localhost',
            'O código abaixo sobe o servidor acima na própria máquina (porta livre escolhida pelo sistema), faz três requisições com o fetch global (disponível em versões recentes do Node) e fecha o servidor. Nada sai da sua máquina. Para rodar um servidor "de verdade", você usaria uma porta fixa (como 3000, lida de process.env.PORT) e deixaria o programa aberto.',
            'server.listen(0, "127.0.0.1", async () => {\n  const { port } = server.address();\n  for (const p of ["/", "/sobre", "/nada"]) {\n    const r = await fetch(`http://127.0.0.1:${port}${p}`);\n    console.log(p, r.status, r.headers.get("content-type"), await r.text());\n  }\n  server.close();\n});\n// saída real:\n// / 200 text/plain; charset=utf-8 Olá do Node!\n// /sobre 200 text/plain; charset=utf-8 Servidor de estudo\n// /nada 404 text/plain; charset=utf-8 Não encontrado'
          ),
          sl(
            'Por que usar um framework depois',
            'Com o http puro, para cada rota você escreve tudo à mão: separar método e caminho, ler o corpo, interpretar JSON, tratar erros, definir cabeçalhos. Conforme a aplicação cresce, o if vira uma selva. Frameworks como Express e Fastify oferecem roteamento declarativo (app.get("/sobre", ...)), leitura de corpo, middlewares (funções encadeadas que tratam as requisições em etapas) e convenções, reduzindo código repetido e erros. Mesmo assim, entender o http nativo ajuda a saber o que o framework faz por baixo. Para os protocolos em si (HTTP, TCP), veja o curso de Redes.'
          ),
          sl(
            'Resumo e cuidados',
            'Resumo: createServer((req, res) => ...); status e headers com writeHead; sempre res.end; rotas com if sobre req.method e pathname; escute em 127.0.0.1 no desenvolvimento. Erros comuns: esquecer o res.end (a requisição "pendura"); responder duas vezes (esquecer o return); esquecer o 404 final; usar charset ausente; confiar em req.url sem separar a query; porta fixa já em uso (erro EADDRINUSE). Segurança: não devolva detalhes internos de erros ao cliente e não exponha o servidor de estudo à internet.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que a função passada a http.createServer recebe e quando é chamada?', 'c', [
          'Recebe só o corpo da requisição e é chamada uma vez, quando o servidor inicia',
          'Recebe o endereço e a porta, e é chamada quando o servidor termina de escutar',
          'Recebe os objetos req e res e é chamada a cada requisição que chega',
          'Recebe um erro e é chamada quando uma requisição falha'
        ], 'O tratador roda a cada requisição, com req (a requisição) e res (a resposta). Não é uma função de inicialização nem de erro.'),
        mcq('q2', 'O que acontece se o tratador nunca chamar `res.end()`?', 'a', [
          'O cliente fica esperando a resposta, que não chega a ser concluída',
          'O Node envia automaticamente uma resposta 200 vazia depois de alguns segundos',
          'O Node encerra o servidor com erro assim que o tratador termina',
          'O cliente recebe um status 404 por falta de conteúdo'
        ], 'Sem end, a resposta não termina e o cliente espera (até estourar o tempo limite). O Node não completa a resposta sozinho.'),
        mcq('q3', 'Qual status code indica "recurso não encontrado"?', 'd', [
          '200',
          '400',
          '500',
          '404'
        ], '404 é "não encontrado". 200 é sucesso, 400 é requisição inválida (erro do cliente) e 500 é erro interno do servidor.'),
        fill('q4', 'Complete com o método do servidor que começa a escutar uma porta.', 'server.___(3000, "127.0.0.1");', ['listen'], 'listen(porta, endereço) começa a aceitar conexões.'),
        mcq('q5', 'Por que escutar em "127.0.0.1" durante o desenvolvimento?', 'b', [
          'Porque é o único endereço que o módulo http aceita',
          'Para que só a própria máquina acesse o servidor, sem expô-lo à rede',
          'Para que o servidor fique visível na internet com o nome localhost',
          'Porque acelera as respostas ao evitar o uso de portas de rede'
        ], 'O endereço 127.0.0.1 é o loopback: só conexões da própria máquina. Isso evita expor um servidor de estudo. Não é obrigatório nem acelera respostas.'),
        mcq('q6', 'Qual cabeçalho informa ao cliente o tipo e a codificação do conteúdo de uma resposta de texto?', 'c', [
          'Accept: text/plain',
          'Host: utf-8',
          'Content-Type: text/plain; charset=utf-8',
          'Content-Length: texto'
        ], 'Content-Type descreve o tipo do corpo e o charset. Accept é do pedido, Host indica o servidor de destino e Content-Length é o tamanho em bytes.'),
        mcq('q7', 'Qual é uma razão prática para adotar um framework como Express depois de aprender o http nativo?', 'd', [
          'O http nativo não consegue responder a mais de um cliente por vez',
          'Frameworks substituem o Node e executam o seu código em uma linguagem mais rápida que JavaScript',
          'O http nativo não permite definir status code nem cabeçalhos',
          'Rotas, leitura de corpo e tratamento de erros ficam mais simples e padronizados'
        ], 'Frameworks reduzem código repetitivo (roteamento, corpo, erros, middlewares). O http nativo atende muitos clientes, define status e headers, e o Express roda sobre o Node.'),
        fill('q8', 'Complete com o método de res que define o status e os cabeçalhos da resposta.', 'res.___(404, { "Content-Type": "text/plain" });', ['writehead'], 'writeHead(status, headers) define o status e os cabeçalhos; res.end envia o corpo.')
      ]
    },
    {
      id: 'njb-18-json-e-rotas-manuais',
      title: 'JSON e rotas manuais',
      goal: 'Ler o corpo de uma requisição em pedaços, interpretar JSON com segurança, responder JSON, usar 404/400/500 e limitar o tamanho do corpo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O corpo chega em pedaços',
            'Em requisições com corpo (como POST), os dados chegam em partes (chunks), não de uma vez. O req é um objeto de eventos: o evento "data" entrega cada pedaço (um Buffer) e "end" avisa que acabou. Você junta os pedaços (Buffer.concat) e converte para texto. Envolver isso em uma promise facilita usar com await. Como o corpo vem de fora, ele é entrada não confiável: tamanho, formato e conteúdo precisam ser verificados.'
          ),
          sl(
            'Limite de tamanho do corpo',
            'Sem limite, alguém pode enviar um corpo gigante e esgotar a memória do servidor (um tipo de negação de serviço). Por isso, some o tamanho dos pedaços e, ao ultrapassar o limite, interrompa a leitura (req.destroy()) e responda 413 (conteúdo grande demais) quando possível. Escolha um limite compatível com o que sua API realmente aceita (1 KB, 100 KB...), não "ilimitado".',
            'const LIMITE = 1024; // bytes\nfunction lerCorpo(req) {\n  return new Promise((resolve, reject) => {\n    const pedacos = []; let total = 0;\n    req.on("data", (c) => {\n      total += c.length;\n      if (total > LIMITE) {\n        reject(Object.assign(new Error("corpo grande"), { status: 413 }));\n        req.destroy();\n        return;\n      }\n      pedacos.push(c);\n    });\n    req.on("end", () => resolve(Buffer.concat(pedacos).toString("utf8")));\n    req.on("error", reject);\n  });\n}'
          ),
          sl(
            'JSON.parse com try/catch e validação',
            'JSON.parse lança SyntaxError se o texto for inválido; sem try/catch, uma requisição malformada derrubaria a rotina (ou o processo). Capture e responda 400 (requisição inválida). Mas JSON válido NÃO significa dados válidos: valide cada campo esperado (tipo, tamanho, formato) antes de usar. Aceite só os campos de que precisa e ignore o resto (minimização). Nunca guarde ou registre em log o corpo inteiro se ele puder conter dados pessoais.'
          ),
          sl(
            'Content-Type e resposta JSON',
            'Ao RECEBER, confira o cabeçalho Content-Type da requisição: se esperamos JSON e veio outra coisa, responda 415 (tipo de mídia não suportado). Ao ENVIAR JSON, defina Content-Type: application/json; charset=utf-8 e use JSON.stringify no corpo. Um pequeno auxiliar evita repetir isso em cada rota.',
            'function json(res, status, obj) {\n  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });\n  res.end(JSON.stringify(obj));\n}'
          ),
          sl(
            'Códigos 400, 404 e 500 (e 201, 413, 415)',
            '400: o cliente mandou algo inválido (JSON quebrado, campo faltando). 404: a rota ou o recurso não existe. 500: falha inesperada NO SERVIDOR: registre o detalhe no log interno e devolva uma mensagem genérica ("erro interno"), sem stack trace nem caminhos. 201: recurso criado com sucesso. 413 e 415, como vimos. Escolher o código certo ajuda quem consome a API a reagir adequadamente: erro de cliente (4xx) pede correção do pedido; erro de servidor (5xx) pede nova tentativa ou ajuda.'
          ),
          sl(
            'Exemplo executado: POST /tarefas',
            'O servidor abaixo aceita POST /tarefas com JSON, valida e devolve 201; trata JSON quebrado (400), campo inválido (400), tipo errado (415), rota inexistente (404) e corpo grande (conexão cortada). O teste roda na própria máquina com o fetch global. (O trecho usa lerCorpo e json definidos nos slides anteriores.)',
            'const server = http.createServer(async (req, res) => {\n  try {\n    if (req.method === "POST" && req.url === "/tarefas") {\n      if (!(req.headers["content-type"] || "").startsWith("application/json"))\n        return json(res, 415, { erro: "use application/json" });\n      let dados;\n      try { dados = JSON.parse(await lerCorpo(req)); }\n      catch (e) { if (e.status) throw e; return json(res, 400, { erro: "JSON inválido" }); }\n      if (typeof dados.titulo !== "string" || dados.titulo.trim() === "")\n        return json(res, 400, { erro: "titulo obrigatório" });\n      return json(res, 201, { id: 1, titulo: dados.titulo.trim() });\n    }\n    json(res, 404, { erro: "não encontrado" });\n  } catch (e) {\n    if (e.status === 413) return json(res, 413, { erro: "corpo muito grande" });\n    console.error("falha interna");\n    json(res, 500, { erro: "erro interno" });\n  }\n});\n// saída real dos testes (201, 400, 400, 415, 404):\n// 201 {"id":1,"titulo":"Estudar Node"}\n// 400 {"erro":"JSON inválido"}\n// 400 {"erro":"titulo obrigatório"}\n// 415 {"erro":"use application/json"}\n// 404 {"erro":"não encontrado"}\n// corpo de 5000 bytes: conexão cortada pelo servidor'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: ler o corpo em pedaços com limite; JSON.parse em try/catch; validar campos; conferir Content-Type; responder JSON com o cabeçalho certo; 400 para entrada inválida, 404 para rota inexistente, 500 genérico para falhas internas. Erros comuns: JSON.parse sem try/catch; confiar nos campos sem validar; não limitar o corpo; devolver mensagens internas no 500; esquecer o return após responder (resposta duplicada); registrar corpo completo em logs, que pode conter dados pessoais (LGPD: registre o mínimo necessário; isto não substitui orientação jurídica).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o corpo de uma requisição é lido por eventos "data" e "end"?', 'a', [
          'Porque o corpo chega em pedaços, e o "end" indica que não há mais dados',
          'Porque o Node só entrega o corpo depois de a resposta ser enviada',
          'Porque o evento "data" contém o JSON já interpretado',
          'Porque o corpo precisa ser lido duas vezes: uma para validar e outra para usar'
        ], 'O corpo chega em chunks; "data" entrega cada um e "end" sinaliza o fim. O JSON só é interpretado depois, por JSON.parse, e a leitura ocorre uma vez.'),
        mcq('q2', 'Qual é o risco de ler o corpo da requisição sem nenhum limite de tamanho?', 'c', [
          'O JSON.parse deixa de funcionar com textos acima de 1 KB de tamanho',
          'O navegador do cliente trava ao receber a resposta do servidor sobrecarregado',
          'Um cliente pode enviar um corpo enorme e esgotar a memória do servidor',
          'O servidor passa a responder com status 500 a cada requisição seguinte'
        ], 'Sem limite, corpos gigantes consomem memória (negação de serviço). JSON.parse não tem esse limite fixo, e o risco é do servidor, não do navegador do cliente.'),
        mcq('q3', 'Chegou um corpo como "{quebrado" em uma rota que espera JSON. Qual resposta é a mais adequada?', 'b', [
          '500, com a mensagem original do SyntaxError e o stack trace',
          '400, com mensagem simples como "JSON inválido"',
          '200, com um objeto vazio, para o cliente não perceber a falha',
          '404, porque o corpo recebido não corresponde a recurso existente'
        ], 'Entrada inválida é erro do cliente: 400 com mensagem genérica. 500 seria para falha interna (e não deve expor stack), 200 esconde o problema e 404 é para rota inexistente.'),
        fill('q4', 'Complete com o método que converte o texto JSON recebido em objeto.', 'const dados = JSON.___(corpoTexto);', ['parse'], 'JSON.parse converte o texto em objeto; precisa estar em try/catch para entradas externas.'),
        mcq('q5', 'O corpo é um JSON válido, mas `titulo` veio como número e deveria ser texto. O que fazer?', 'd', [
          'Usar o valor mesmo assim, pois o JSON.parse já garantiu que está correto',
          'Converter o número em texto e seguir, sem avisar o cliente',
          'Responder 500, porque o servidor não consegue lidar com números',
          'Validar os campos e responder 400 informando que o título deve ser texto'
        ], 'JSON válido não significa dados válidos; valide tipos e responda 400 com mensagem clara. 500 é para falhas internas, não para entrada incorreta.'),
        mcq('q6', 'Qual cabeçalho de resposta deve acompanhar um corpo gerado com JSON.stringify?', 'a', [
          'Content-Type: application/json',
          'Accept: application/json; charset=utf-8',
          'Content-Type: text/html; charset=utf-8',
          'Authorization: application/json'
        ], 'Content-Type application/json informa o formato. Accept é cabeçalho de requisição, text/html declararia outro formato e Authorization trata de credenciais.'),
        mcq('q7', 'Uma falha inesperada ocorre no servidor (por exemplo, um erro de leitura interno). O que responder ao cliente?', 'c', [
          '500 com o stack trace completo, para facilitar a depuração remota',
          '500 com o caminho do arquivo que falhou, para o cliente reportar o erro',
          '500 com mensagem genérica, registrando o detalhe no log interno, fora da resposta',
          '400, porque todo erro é culpa de uma requisição malformada'
        ], 'O detalhe fica no log interno; ao cliente vai uma mensagem genérica, sem expor caminhos nem stack. 400 é para erro do cliente, e esta falha é do servidor.'),
        fill('q8', 'Complete com o código de status que indica "recurso criado com sucesso".', 'res.writeHead(___, { "Content-Type": "application/json" });', ['201'], '201 (Created) indica que o recurso foi criado; 200 é sucesso genérico.')
      ]
    },
    {
      id: 'njb-19-express-primeiro-servidor',
      title: 'Express: o primeiro servidor',
      goal: 'Entender o que é o Express, como instalá-lo, criar rotas com app.get, usar req/res, escutar uma porta e conhecer o recarregamento automático em desenvolvimento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o Express',
            'O Express é um framework web minimalista para Node.js: uma biblioteca de terceiros (do ecossistema npm) que roda SOBRE o módulo http e oferece uma forma mais prática de criar rotas, ler corpos e tratar requisições. "Minimalista" quer dizer que traz pouco por padrão e você adiciona o resto (autenticação, validação, banco) com outros pacotes. Há alternativas, como Fastify e NestJS, com filosofias diferentes; nesta lição usamos o Express por ser muito difundido. Os exemplos abaixo são ILUSTRATIVOS, NÃO EXECUTADOS AQUI, porque dependem de instalar um pacote.'
          ),
          sl(
            'Instalando e o servidor mínimo',
            'Dentro da pasta do projeto (já com package.json), instale o Express com npm install express; ele entra em dependencies e o código baixado vai para node_modules. Depois, crie o app: express() devolve a aplicação; app.get(caminho, função) registra uma rota para o método GET; app.listen(porta) começa a escutar. Em ESM (com "type": "module" no package.json), importe com import express from "express"; em CommonJS, use require("express").',
            '// ilustrativo, não executado aqui\n// $ npm install express\nimport express from "express";\n\nconst app = express();\nconst PORTA = Number(process.env.PORT) || 3000;\n\napp.get("/", (req, res) => {\n  res.send("Olá do Express!");\n});\n\napp.listen(PORTA, () => {\n  console.log(`Escutando em http://localhost:${PORTA}`);\n});'
          ),
          sl(
            'req e res no Express',
            'O Express decora os objetos req e res com recursos extras. Em res: res.send(texto) envia texto (definindo o Content-Type); res.json(objeto) serializa e envia JSON com o cabeçalho certo; res.status(404).json({ erro: "não encontrado" }) define o status antes de enviar. Em req: req.params traz partes da URL (rota "/usuarios/:id" => req.params.id), req.query traz a query string (?pag=2 => req.query.pag, sempre texto) e req.body traz o corpo JSON, depois de habilitar express.json() (um middleware, função que processa a requisição antes da rota). Tudo isso substitui o código manual que escrevemos nas lições anteriores.',
            '// ilustrativo, não executado aqui\napp.use(express.json({ limit: "100kb" })); // lê JSON, com limite\n\napp.get("/usuarios/:id", (req, res) => {\n  const id = Number(req.params.id);\n  if (!Number.isInteger(id)) {\n    return res.status(400).json({ erro: "id inválido" });\n  }\n  res.json({ id, nome: "Usuária de exemplo" });\n});\n\napp.post("/tarefas", (req, res) => {\n  const { titulo } = req.body ?? {};\n  if (typeof titulo !== "string" || titulo.trim() === "") {\n    return res.status(400).json({ erro: "titulo obrigatório" });\n  }\n  res.status(201).json({ id: 1, titulo: titulo.trim() });\n});'
          ),
          sl(
            'Segurança desde o primeiro servidor',
            'Mesmo num exemplo simples, mantenha os bons hábitos: valide os parâmetros (como o id acima, convertido e conferido) em vez de usá-los direto; limite o tamanho do corpo; não devolva detalhes internos nos erros; leia porta e segredos de variáveis de ambiente, nunca do código; e saiba que o Express, por padrão, envia o cabeçalho X-Powered-By (que revela a tecnologia), que muitos desativam com app.disable("x-powered-by"). Cabeçalhos de segurança, CORS, autenticação e limite de requisições serão vistos nos níveis seguintes; para as vulnerabilidades em si, veja o curso de Segurança Web (OWASP).'
          ),
          sl(
            'nodemon e --watch (recarregamento em desenvolvimento)',
            'Em desenvolvimento, é incômodo parar e iniciar o servidor a cada mudança no código. Duas soluções: o pacote nodemon (de terceiros), que observa os arquivos e reinicia o servidor ao salvar; e, em versões recentes do Node, a opção embutida node --watch arquivo.js, que faz o mesmo sem instalar nada (confira a documentação da sua versão). Use esse recurso apenas em desenvolvimento: em produção, o processo é iniciado e supervisionado de outra forma (assunto de níveis avançados).',
            '// package.json (ilustrativo)\n{\n  "scripts": {\n    "start": "node src/index.js",\n    "dev": "node --watch src/index.js"\n  }\n}\n// $ npm run dev   -> reinicia ao salvar o arquivo'
          ),
          sl(
            'Resumo e erros comuns',
            'Resumo: Express = framework minimalista sobre o http; npm install express; app.get/app.post definem rotas; res.json/res.status enviam respostas; req.params, req.query, req.body entregam dados; app.listen escuta; node --watch ou nodemon recarregam em desenvolvimento. Erros comuns: esquecer express.json() (req.body fica undefined); esquecer de responder (a requisição pendura); responder duas vezes (esquecer o return); tratar req.query e req.params como números (são texto); e confiar em dados de entrada sem validar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a relação entre Express e Node.js?', 'd', [
          'O Express é o motor de JavaScript que o Node usa por baixo para executar o código',
          'O Express é um módulo nativo que já vem instalado junto com o Node',
          'O Express é uma linguagem de programação que compila o código escrito para rodar no Node',
          'O Express é uma biblioteca de terceiros que roda sobre o http do Node e simplifica rotas'
        ], 'Express é um pacote do npm construído sobre o módulo http. O motor é o V8, não é nativo (precisa instalar) e não é linguagem.'),
        mcq('q2', 'Qual comando adiciona o Express como dependência do projeto?', 'a', [
          'npm install express',
          'node install express',
          'npm start express',
          'express init npm'
        ], 'npm install express baixa o pacote para node_modules e o registra em dependencies. node install não existe, npm start executa o script start e express init npm não é um comando.'),
        mcq('q3', 'Na rota `app.get("/usuarios/:id", ...)`, onde fica o valor de :id?', 'c', [
          'Em req.body.id, como número',
          'Em req.query.id, como texto, vindo depois do ponto de interrogação',
          'Em req.params.id, como texto',
          'Em res.params.id, preenchido pelo Express antes da resposta'
        ], 'Partes da URL declaradas com :nome ficam em req.params, como texto. req.query é a query string, req.body o corpo e res.params não existe.'),
        fill('q4', 'Complete com o método de res do Express que envia um objeto como JSON, com o Content-Type correto.', 'res.___({ ok: true });', ['json'], 'res.json serializa o objeto e define o Content-Type application/json.'),
        mcq('q5', 'Em um servidor Express, req.body chega como undefined em uma rota POST com JSON. Qual é a causa mais provável?', 'b', [
          'O Express não suporta rotas POST, só GET',
          'Faltou habilitar o middleware express.json() antes das rotas',
          'O cliente precisa enviar o corpo como texto sem Content-Type',
          'req.body só existe em rotas declaradas com app.get'
        ], 'Sem express.json(), o Express não interpreta o corpo JSON e req.body fica undefined. POST é suportado e o cliente deve mandar Content-Type JSON.'),
        mcq('q6', 'Para que serve o `node --watch arquivo.js` (em versões recentes) ou o nodemon?', 'a', [
          'Reiniciar o servidor sozinho quando os arquivos mudam, durante o desenvolvimento',
          'Tornar o servidor mais rápido em produção ao observar o uso de memória e de CPU',
          'Instalar automaticamente os pacotes que o código importar e ainda não existirem',
          'Impedir que o código seja alterado enquanto o servidor estiver executando'
        ], 'É recarregamento automático para desenvolvimento. Não acelera produção, não instala pacotes e não bloqueia edição.'),
        mcq('q7', 'Em `app.get("/usuarios/:id", ...)`, qual é a melhor prática antes de usar `req.params.id`?', 'd', [
          'Usar o valor diretamente, porque o Express já garante que ele é um número válido',
          'Concatená-lo em um caminho de arquivo, que será lido pelo servidor',
          'Registrá-lo em log junto com o corpo completo da requisição',
          'Converter e validar (Number, Number.isInteger) e responder 400 se for inválido'
        ], 'Parâmetros são texto vindo de fora e precisam ser convertidos e validados. Usar direto ou montar caminhos com ele abre brechas, e logs não devem guardar dados desnecessários.'),
        fill('q8', 'Complete com o método do app Express que começa a escutar uma porta.', 'app.___(3000, () => console.log("no ar"));', ['listen'], 'app.listen(porta, callback) inicia o servidor, como no http nativo.')
      ]
    },
    {
      id: 'njb-20-express-rotas-e-parametros',
      title: 'Express: rotas, parâmetros e corpo da requisição',
      goal: 'Definir rotas com app.get/post/put/delete, ler req.params, req.query e req.body, organizar com Router e responder com status e JSON.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Rota = método + caminho + função',
            'Uma ROTA diz ao Express: quando chegar uma requisição com este MÉTODO HTTP e este CAMINHO, execute esta função. As funções app.get, app.post, app.put e app.delete registram rotas para ler, criar, substituir/alterar e apagar. A função recebe dois objetos: req (a requisição: o que o cliente mandou) e res (a resposta: o que você devolve). Se nenhuma rota combina, o Express responde 404. Erro comum: registrar com app.get uma rota que o cliente chama com POST; o método tem de combinar. Exemplo ilustrativo, não executado aqui (depende do pacote Express).',
            `const express = require('express');
const app = express();

app.get('/tarefas', (req, res) => {
  res.json([{ id: 1, titulo: 'Estudar Node' }]);
});

app.post('/tarefas', (req, res) => {
  res.status(201).json({ id: 2 });
});`
          ),
          sl(
            'Parâmetros de rota: req.params',
            'Um segmento do caminho que começa com dois-pontos é um PARÂMETRO DE ROTA: ele captura um pedaço variável da URL. Na rota /tarefas/:id, a chamada GET /tarefas/7 faz req.params.id valer o texto "7". Use parâmetros de rota para identificar QUAL recurso (a tarefa 7). Atenção: o valor chega sempre como TEXTO (string). Se você comparar com um número usando ===, "7" não é igual a 7; converta antes com Number(req.params.id) e confira se o resultado é um inteiro válido. Ilustrativo, não executado aqui.',
            `app.get('/tarefas/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }
  res.json({ id });
});`
          ),
          sl(
            'Query string: req.query',
            'Na URL, tudo depois do ponto de interrogação é a QUERY STRING: pares chave=valor separados por &. Em GET /tarefas?feita=true&limite=10, req.query vira o objeto { feita: "true", limite: "10" }. Use a query para opções de filtro, ordenação e paginação (o "como listar"), enquanto o parâmetro de rota identifica o recurso. Como nos parâmetros, os valores chegam como texto e vêm do cliente: nunca confie neles sem validar (veremos na lição de validação). Ilustrativo, não executado aqui.',
            `app.get('/tarefas', (req, res) => {
  // GET /tarefas?feita=true&limite=10
  const { feita, limite } = req.query;
  res.json({ feita, limite }); // ambos sao strings
});`
          ),
          sl(
            'Corpo da requisição: req.body e express.json()',
            'Em POST e PUT, os dados vão no CORPO da requisição, normalmente em JSON. Por padrão o Express NÃO lê o corpo: req.body fica undefined. Para ler JSON, registre o middleware express.json() ANTES das rotas, com app.use(express.json()); ele converte o texto JSON em objeto e o coloca em req.body. Erro comum: esquecer essa linha e receber "Cannot destructure property of undefined". Dica de segurança: configure um limite de tamanho (por exemplo express.json({ limit: "10kb" })) para que ninguém envie um corpo gigantesco. Ilustrativo, não executado aqui.',
            `app.use(express.json({ limit: '10kb' }));

app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  res.status(201).json({ id: 3, titulo });
});`
          ),
          sl(
            'Responder com status e JSON',
            'res.json(objeto) envia o objeto como JSON e define o cabeçalho de conteúdo. Para definir o código de status, encadeie res.status(codigo).json(...). Códigos comuns: 200 (ok), 201 (criado), 204 (sem conteúdo), 400 (requisição inválida), 404 (não encontrado). O status importa: clientes e ferramentas decidem o que fazer pelo código, não pela mensagem. Erro comum: responder 200 com { erro: "..." } no corpo; use o código que descreve o resultado. Cada requisição deve receber UMA resposta: chamar res.json duas vezes causa erro.',
            `app.get('/tarefas/:id', (req, res) => {
  const t = buscar(Number(req.params.id));
  if (!t) return res.status(404).json({ erro: 'tarefa nao encontrada' });
  res.status(200).json(t);
});`
          ),
          sl(
            'express.Router: agrupar rotas',
            'Com muitas rotas, o arquivo principal vira bagunça. express.Router() cria um mini-aplicativo de rotas que você monta em um prefixo com app.use. As rotas dentro dele são escritas SEM o prefixo: roteador.get("/") vira GET /tarefas quando montado com app.use("/tarefas", roteador). Assim cada recurso (tarefas, usuários) fica em seu próprio arquivo. Erro comum: repetir o prefixo dentro do roteador e acabar com /tarefas/tarefas. Ilustrativo, não executado aqui.',
            `// tarefas.routes.js
const roteador = require('express').Router();
roteador.get('/', (req, res) => res.json([]));
roteador.get('/:id', (req, res) => res.json({}));
module.exports = roteador;

// app.js
app.use('/tarefas', require('./tarefas.routes'));`
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma rota foi declarada como app.get("/tarefas/:id", ...). O cliente faz GET /tarefas/7. Onde o código encontra o valor 7?', 'b', [
          'Em req.body.id, já convertido para número pelo próprio Express',
          'Em req.params.id, como o texto "7"',
          'Em req.query.id, porque todo valor presente na URL é lido da query string',
          'Em res.params.id, preenchido pelo Express antes de a resposta ser enviada'
        ], 'Segmentos com dois-pontos viram req.params e chegam como texto. req.body é o corpo (não a URL), req.query só traz o que vem depois do ponto de interrogação e res é o objeto de resposta, que não lê dados da requisição.'),
        mcq('q2', 'O cliente chama GET /tarefas?feita=true&limite=10. Qual expressão devolve o texto "10"?', 'd', [
          'req.params.limite, porque limite é um parâmetro da rota',
          'req.body.limite, porque os filtros de listagem ficam no corpo da requisição',
          'req.url.limite, já que a URL guarda cada pedaço como uma propriedade',
          'req.query.limite, pois a query string é lida em req.query'
        ], 'O que vem após ? é a query string e o Express a expõe em req.query. req.params só existe para segmentos com dois-pontos na rota, req.body é o corpo e req.url é uma string inteira, sem propriedades por chave.'),
        mcq('q3', 'Uma rota POST faz const { titulo } = req.body e falha dizendo que não dá para desestruturar undefined. Qual a causa mais provável?', 'a', [
          'Faltou registrar app.use(express.json()) antes da rota, então o corpo não foi lido',
          'O método POST não permite enviar dados no corpo; só o método GET permite isso',
          'A rota precisa ser declarada com app.put para que o Express aceite um corpo',
          'O cliente deveria enviar o título obrigatoriamente pela query string da URL'
        ], 'Sem express.json(), o Express não interpreta o corpo e req.body fica undefined. POST aceita corpo normalmente, PUT não é requisito para isso e enviar dados na query é escolha do cliente, não correção do servidor.'),
        fill('q4', 'Complete o encadeamento que responde com código 404 e um JSON de erro.', `res.___(404).json({ erro: 'tarefa nao encontrada' });`, ['status'], 'res.status(codigo) define o código HTTP e devolve o próprio res, permitindo encadear .json(...).'),
        mcq('q5', 'Qual combinação de método e rota é a mais adequada para CRIAR uma nova tarefa?', 'c', [
          'GET /tarefas/criar, porque GET é o método mais simples de usar',
          'DELETE /tarefas, pois isso cria uma lista nova no lugar da antiga',
          'POST /tarefas, com os dados no corpo',
          'PUT /tarefas/:id, mesmo que a tarefa ainda não exista'
        ], 'POST na coleção, com os dados no corpo, é o padrão para criar. GET deve só ler, DELETE apaga e PUT com id pressupõe que você já sabe qual recurso substituir.'),
        mcq('q6', 'Um roteador foi montado com app.use("/tarefas", roteador) e contém roteador.get("/:id", ...). Qual URL aciona essa rota?', 'd', [
          'GET /:id, pois o prefixo da montagem serve de comentário organizacional',
          'GET /tarefas/tarefas/7, porque o prefixo acaba sendo somado duas vezes',
          'GET /roteador/7, porque o nome da variável vira o prefixo automaticamente',
          'GET /tarefas/7, pois o prefixo da montagem se soma ao caminho interno'
        ], 'O Router é montado em um prefixo e as rotas internas são relativas a ele. O prefixo não é duplicado, não deriva do nome da variável e não é decorativo.'),
        mcq('q7', 'Uma rota faz const id = req.params.id e depois tarefas.find(t => t.id === id), mas as tarefas têm id numérico e nunca são achadas. Qual a correção?', 'a', [
          'Converter com Number(req.params.id), pois o parâmetro chega como texto',
          'Trocar === por == e esquecer os tipos em qualquer comparação futura',
          'Declarar a rota com app.post para que o id chegue já como número',
          'Mover o id para req.body, onde os valores mantêm o tipo número, como acontece com o JSON recebido'
        ], 'Parâmetros de rota são strings, então "7" === 7 é falso; converta e valide. Trocar por == esconde o problema e é má prática, o método da rota não muda o tipo e o corpo só traz o que o cliente enviou.'),
        fill('q8', 'Complete com a função que registra a rota do método HTTP usado para criar recursos.', `app.___('/tarefas', (req, res) => {
  res.status(201).json({ ok: true });
});`, ['post'], 'app.post registra a rota que responde ao método POST, usado para criar.')
      ]
    },
    {
      id: 'njb-21-middlewares-no-express',
      title: 'Middlewares no Express',
      goal: 'Entender o que é um middleware, por que a ordem importa, como next() funciona e como tratar log, autenticação e erro com eles.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um middleware',
            'Middleware é uma função com três parâmetros (req, res, next) que fica NO MEIO do caminho entre a chegada da requisição e a resposta final. Ela pode ler ou alterar req e res, encerrar a resposta ou passar adiante chamando next(). Pense numa linha de montagem: cada estação faz uma tarefa (registrar, checar permissão, ler JSON) e entrega à próxima. Você registra com app.use(funcao) para valer em todas as rotas, ou com app.get("/x", funcao, handler) para uma rota só. Ilustrativo, não executado aqui (depende do Express).',
            `function registrar(req, res, next) {
  console.log(req.method, req.path);
  next(); // passa para o proximo
}
app.use(registrar);`
          ),
          sl(
            'next() e a ordem de execução',
            'Os middlewares rodam NA ORDEM em que foram registrados. Cada um decide: chamar next() (continua a cadeia) ou responder (encerra). Se um middleware nem responde nem chama next(), a requisição fica pendurada até o cliente desistir (timeout). Erros comuns: esquecer o next(); chamar next() E responder (a resposta duplicada gera erro); registrar express.json() DEPOIS das rotas que precisam do corpo, o que deixa req.body vazio. Regra prática: middlewares gerais primeiro, rotas depois, tratador de erro por último.',
            `app.use(express.json());     // 1o: le o corpo
app.use(registrar);          // 2o: log
app.use('/tarefas', rotas);  // 3o: rotas
app.use(tratadorDeErro);     // ultimo: erros`
          ),
          sl(
            'Middleware de log',
            'Um uso clássico é registrar cada requisição: método, caminho, status e tempo. Para saber o status é preciso esperar a resposta terminar, usando o evento finish do res (um EventEmitter, como você viu). Cuidado de privacidade: registre método, caminho e status, mas NÃO registre cabeçalhos de autorização, corpos com senhas, tokens nem dados pessoais. Um log é um arquivo que muita gente acessa e que dura muito tempo. Ilustrativo, não executado aqui.',
            `function logar(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    console.log(req.method, req.path, res.statusCode, ms + 'ms');
  });
  next();
}`
          ),
          sl(
            'Middleware de autenticação (em conceito)',
            'Autenticar é descobrir QUEM está chamando. Um middleware de autenticação lê uma credencial da requisição (por exemplo um cabeçalho Authorization), verifica se é válida e, se for, guarda a identidade em req (req.usuario) e chama next(). Se não for, responde 401 e NÃO chama next(), então a rota protegida nunca executa. Colocar o middleware só nas rotas que precisam deixa rotas públicas livres. Os detalhes de senhas e tokens vêm nas lições 29 e 30; a função verificarCredencial abaixo é um espaço reservado. Segredos nunca ficam no código. Ilustrativo, não executado aqui.',
            `function exigirLogin(req, res, next) {
  const usuario = verificarCredencial(req.headers.authorization);
  if (!usuario) {
    return res.status(401).json({ erro: 'nao autenticado' });
  }
  req.usuario = usuario;
  next();
}
app.get('/minhas-tarefas', exigirLogin, listarMinhas);`
          ),
          sl(
            'Middleware de erro e middlewares de terceiros',
            'Um middleware com QUATRO parâmetros (err, req, res, next) é reconhecido pelo Express como tratador de erros: ele só roda quando algum passo chamou next(erro) ou lançou um erro. Deve ficar depois de todas as rotas. Você verá isso a fundo na lição 28. Além dos seus, existem middlewares publicados no npm que resolvem tarefas comuns: cors (permite que páginas de outras origens chamem sua API), helmet (define cabeçalhos HTTP de segurança), morgan (log de requisições) e compression (compacta respostas). Instale-os por nome, leia a documentação e configure; não copie configuração às cegas.'
          ),
          sl(
            'Resumo e armadilhas',
            'Middleware = função (req, res, next) numa cadeia ordenada. Três destinos possíveis para cada uma: chamar next(), responder, ou passar um erro com next(erro). Armadilhas: esquecer next() (requisição travada), responder e chamar next() (erro de cabeçalhos já enviados), ordem errada (corpo ou autenticação ainda não prontos quando a rota roda) e colocar o tratador de erro antes das rotas (ele não captura o que vem depois).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um middleware registra o método e o caminho no console, mas esquece de chamar next() e de responder. O que o cliente observa?', 'c', [
          'Recebe 404 imediatamente, pois a rota deixa de ser encontrada',
          'Recebe 500 imediatamente, porque o Express detecta o esquecimento',
          'A requisição fica pendurada até estourar o tempo limite',
          'Recebe a resposta normal da rota, porque o Express chama next sozinho'
        ], 'Sem next() e sem resposta, a cadeia para e ninguém responde: o cliente espera até o timeout. O Express não adivinha a intenção nem gera 404 ou 500 por isso.'),
        mcq('q2', 'A rota POST /tarefas lê req.body, mas app.use(express.json()) foi escrito DEPOIS dela no arquivo. O que acontece?', 'a', [
          'Na rota, o corpo ainda não foi interpretado, porque a ordem de registro vale',
          'Nada muda, pois o Express reordena os middlewares antes de executar',
          'O Express lança um erro de sintaxe ao iniciar o servidor',
          'O corpo é lido duas vezes, uma antes e outra depois da rota'
        ], 'Os middlewares executam na ordem de registro; a rota roda antes do express.json(), então o corpo ainda não foi lido. Não há reordenação automática nem erro de sintaxe.'),
        mcq('q3', 'Qual destino é o correto para um middleware de autenticação quando a credencial é inválida?', 'd', [
          'Chamar next() mesmo assim e deixar a rota decidir se vai trabalhar',
          'Responder 401 e também chamar next() para registrar o log em seguida',
          'Apagar req.headers.authorization e seguir para a próxima função da cadeia',
          'Responder 401 e retornar sem chamar next()'
        ], 'O papel do middleware é barrar: responde 401 e não segue. Chamar next() depois de responder causa resposta duplicada, e seguir adiante deixaria a rota protegida acessível.'),
        fill('q4', 'Complete o nome do terceiro parâmetro, a função que passa o controle adiante.', `function registrar(req, res, ___) {
  console.log(req.method);
  next();
}`, ['next'], 'O terceiro parâmetro é a função next; chamá-la entrega a requisição ao próximo middleware.'),
        mcq('q5', 'Como o Express reconhece que uma função é um tratador de erros?', 'b', [
          'Pelo nome da função, que precisa ser exatamente tratadorDeErro',
          'Por ter quatro parâmetros: (err, req, res, next)',
          'Por ser registrada com app.error em vez de app.use',
          'Por retornar um número de status em vez de chamar res.send'
        ], 'A assinatura com quatro parâmetros é o que o Express usa para identificar o tratador. O nome é livre, não existe app.error e o retorno da função não é usado.'),
        mcq('q6', 'Um middleware de log imprime req.headers inteiros em cada requisição. Qual o problema principal?', 'a', [
          'Pode gravar credenciais e dados pessoais em logs duráveis',
          'O console.log não aceita objetos grandes e travaria o processo inteiro',
          'Cabeçalhos HTTP não existem em req dentro de um middleware',
          'Isso impediria o Express de chamar a próxima função da cadeia'
        ], 'Cabeçalhos como Authorization e Cookie carregam segredos; logs ficam acessíveis e duram muito. O console.log aceita objetos, req.headers existe em middlewares e o log não bloqueia a cadeia.'),
        mcq('q7', 'Para que serve o pacote helmet, citado na lição?', 'c', [
          'Compactar respostas para economizar banda do servidor',
          'Registrar cada requisição com tempo e status em um arquivo de log',
          'Definir cabeçalhos HTTP de segurança nas respostas',
          'Permitir que páginas de outras origens chamem a API'
        ], 'helmet configura cabeçalhos de segurança. Compactar é papel de compression, log é de morgan e liberar outras origens é de cors.'),
        fill('q8', 'Uma função (req, res, next) que fica antes da resposta final é chamada de quê? Responda com uma palavra.', `app.use('/tarefas', exigirLogin, rotas);
// exigirLogin e um ___`, ['middleware'], 'Funções (req, res, next) que ficam no caminho antes da resposta final são middlewares.')
      ]
    },
    {
      id: 'njb-22-estaticos-e-templates',
      title: 'Arquivos estáticos, templates e escape de HTML',
      goal: 'Servir arquivos estáticos com cuidado, entender template engines e escapar HTML para evitar XSS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Arquivos estáticos e express.static',
            'ARQUIVO ESTÁTICO é aquele entregue exatamente como está no disco: HTML, CSS, imagens, JavaScript do navegador. O middleware express.static("publico") faz o Express responder a GET /logo.png com o arquivo publico/logo.png, se existir. Sem ele, você teria de escrever uma rota para cada arquivo. O Node puro também consegue (lendo com fs), mas o Express cuida de tipo de conteúdo, cache e caminho. Ilustrativo, não executado aqui (depende do Express).',
            `const express = require('express');
const path = require('node:path');
const app = express();

// tudo dentro de ./publico fica acessivel pela URL
app.use(express.static(path.join(__dirname, 'publico')));`
          ),
          sl(
            'Cuidado com o que você expõe',
            'Tudo dentro da pasta servida fica PÚBLICO: qualquer pessoa que souber ou adivinhar o nome baixa o arquivo. Por isso a pasta estática deve ser dedicada e conter só o que o navegador precisa. Erros graves e comuns: servir a raiz do projeto (expondo .env, código-fonte e package.json), deixar backups (dados.bak) ou arquivos de configuração na pasta pública e guardar uploads de usuários no mesmo lugar do código. Regra: separe a pasta pública do resto do projeto e nunca coloque segredos nela. Arquivos que começam com ponto são ignorados por padrão pelo express.static, mas não conte só com isso.'
          ),
          sl(
            'O que é uma template engine',
            'Páginas HTML geradas no servidor misturam parte fixa (a estrutura) com parte variável (o nome do usuário, uma lista). Uma TEMPLATE ENGINE é uma biblioteca que lê um modelo (template) com marcadores e o preenche com dados, produzindo o HTML final. Exemplos pelo nome: EJS, Pug e Handlebars. Em Express você escolhe a engine e chama res.render("pagina", dados). Hoje é muito comum o servidor devolver só JSON e um front-end separado montar a tela; as duas abordagens existem e a escolha depende do projeto.',
            `// ilustrativo, nao executado aqui
app.set('view engine', 'ejs');
app.get('/perfil', (req, res) => {
  res.render('perfil', { nome: 'Maria Exemplo' });
});`
          ),
          sl(
            'O problema: XSS',
            'XSS (cross-site scripting) acontece quando texto vindo de um usuário é colocado no HTML SEM tratamento e o navegador o interpreta como código da página. Se um comentário contém marcações HTML e você o insere cru na página, o navegador de quem a visitar passa a executar o que veio nele. É por isso que texto de usuário nunca deve ser tratado como HTML. A defesa básica é ESCAPAR: trocar os caracteres especiais pelas entidades HTML equivalentes, para que o navegador os mostre como texto em vez de interpretá-los. Detalhes de ataques estão no curso de Segurança Web (OWASP).'
          ),
          sl(
            'Escape de HTML na prática (executado)',
            'Os caracteres que importam são & < > " e o apóstrofo. Cada um vira uma entidade: & vira &amp;, < vira &lt;, > vira &gt;, aspas viram &quot; e o apóstrofo vira &#39;. A ordem importa: o & deve ser trocado primeiro, senão você escaparia o & das entidades já criadas. O código abaixo foi executado com Node. Na prática, a maioria das template engines escapa por padrão; o risco aparece quando você usa a forma "sem escape" (cru) ou monta HTML concatenando strings.',
            `function escaparHtml(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
console.log(escaparHtml('<b>Ana & "Beto"</b>'));
// saida real:
// &lt;b&gt;Ana &amp; &quot;Beto&quot;&lt;/b&gt;`
          ),
          sl(
            'Boas práticas resumidas',
            'Escape a saída no contexto certo (HTML, atributo, URL e JavaScript têm regras diferentes; use a engine ou uma biblioteca em vez de inventar). Prefira a engine que escapa por padrão e evite o modo cru. Valide a entrada também, mas lembre: validar na entrada NÃO substitui escapar na saída. Cabeçalhos como Content-Security-Policy (via helmet) adicionam uma segunda camada. E se a API devolve só JSON com o tipo de conteúdo correto, o risco passa a ser do front-end que consome, que também deve escapar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um desenvolvedor usa express.static(__dirname) na raiz do projeto, onde estão o código-fonte e um arquivo .env. Qual é o risco?', 'd', [
          'Risco algum, já que o Express bloqueia arquivos que contenham senhas e outros dados internos do projeto',
          'O servidor ficará mais lento, mas sem consequência para a segurança',
          'Os arquivos .js deixarão de executar no servidor e a aplicação quebra',
          'Arquivos internos, como código e configuração, podem ser baixados por qualquer pessoa'
        ], 'Tudo na pasta servida é público. O Express não identifica segredos, o impacto principal não é desempenho e os arquivos continuam executando no servidor, mas podem ser baixados.'),
        mcq('q2', 'Qual é a função de uma template engine?', 'c', [
          'Compactar imagens estáticas antes de enviá-las ao navegador',
          'Guardar dados de usuários em tabelas para consulta posterior',
          'Preencher um modelo de página com dados e gerar o HTML final',
          'Validar o corpo JSON recebido nas requisições POST do cliente'
        ], 'A engine combina o template com dados para produzir HTML. Compactar, persistir e validar são tarefas de outras partes da aplicação.'),
        mcq('q3', 'Um site mostra comentários inserindo o texto do usuário diretamente no HTML, sem escape. Qual ataque isso permite?', 'b', [
          'Injeção de SQL, pois o comentário chega ao banco sem tratamento',
          'XSS, pois o navegador pode interpretar o texto como código da página',
          'Negação de serviço, pois comentários longos esgotam a memória do navegador',
          'Roubo do arquivo .env, pois o comentário acessa o disco do servidor'
        ], 'Texto de usuário colocado cru no HTML pode ser interpretado como código pelo navegador de quem visita: é XSS. Injeção de SQL é falha na consulta ao banco, e o comentário não lê o disco do servidor.'),
        fill('q4', 'Qual caractere deve ser escapado PRIMEIRO na função escaparHtml, para não escapar as entidades já criadas? Responda com o símbolo.', `.replaceAll('___', '&amp;')`, ['&'], 'O & precisa ser trocado antes dos demais; se ficasse por último, transformaria o & de &lt; em &amp;lt;.'),
        mcq('q5', 'O que a função escaparHtml faz com a entrada "<b>oi</b>"?', 'a', [
          'Devolve "&lt;b&gt;oi&lt;/b&gt;", que o navegador mostra como texto',
          'Devolve "oi", removendo as marcações para o conteúdo ficar limpo',
          'Devolve "<b>oi</b>" sem mudança, porque marcações são seguras',
          'Lança um erro, pois o texto contém caracteres inválidos para HTML'
        ], 'Escapar troca os caracteres especiais por entidades, preservando o texto visível. Não remove marcações nem as deixa intactas, e não lança erro.'),
        mcq('q6', 'Qual afirmação sobre validação e escape está correta?', 'b', [
          'Validar a entrada dispensa o escape, pois dados validados são seguros em qualquer contexto',
          'Escapar a saída é necessário mesmo com validação de entrada',
          'Escapar é necessário em bancos de dados e dispensável em HTML',
          'O escape é desnecessário quando o front-end é feito em React'
        ], 'Validar e escapar resolvem problemas diferentes; o escape protege no momento de exibir. Um texto válido (como um nome com apóstrofo) ainda precisa ser escapado ao entrar no HTML.'),
        mcq('q7', 'Onde deve ficar a pasta servida por express.static?', 'd', [
          'Na própria raiz do projeto, para facilitar o acesso aos arquivos',
          'Junto do arquivo .env, para o navegador ler as configurações do servidor',
          'Na pasta de uploads misturada ao código, para simplificar o deploy',
          'Em uma pasta dedicada contendo o que o navegador precisa, sem código do servidor'
        ], 'Uma pasta pública dedicada limita o que pode vazar. Raiz do projeto, .env ou código misturado expõem arquivos internos.'),
        fill('q8', 'Complete com o nome do middleware do Express que serve arquivos estáticos.', `app.use(express.___(caminhoDaPastaPublica));`, ['static'], 'express.static serve os arquivos de uma pasta como estão.')
      ]
    },
    {
      id: 'njb-23-apis-rest-conceitos',
      title: 'APIs REST: conceitos',
      goal: 'Modelar recursos, escolher verbos e códigos de status, entender idempotência, versionar e padronizar erros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma API REST',
            'API é a interface pela qual um programa conversa com outro. REST é um estilo de desenhar APIs sobre HTTP, centrado em RECURSOS: coisas que o sistema tem (tarefas, usuários, pedidos). Cada recurso tem um endereço (URL) e você age sobre ele com os verbos HTTP. O cliente e o servidor são independentes e cada requisição traz tudo que o servidor precisa (sem memória de requisições anteriores). Não é uma regra rígida de um padrão oficial, e sim um conjunto de convenções que facilita a vida de quem consome a API.'
          ),
          sl(
            'Recursos e nomes de rotas',
            'Nomeie rotas com SUBSTANTIVOS no plural, não com verbos: /tarefas, /tarefas/7, /usuarios/3/tarefas. A ação vem do verbo HTTP, não do caminho. Errado: POST /criarTarefa, GET /buscarTarefa?id=7. Certo: POST /tarefas, GET /tarefas/7. Relações aparecem aninhadas, com moderação (evite mais de dois níveis). Use minúsculas e hífens, mantenha o padrão em toda a API e prefira IDs que não revelem informação (veremos mais adiante).',
            `GET    /tarefas        -> lista
POST   /tarefas        -> cria
GET    /tarefas/7      -> le uma
PUT    /tarefas/7      -> substitui
PATCH  /tarefas/7      -> altera parte
DELETE /tarefas/7      -> apaga`
          ),
          sl(
            'Verbos e códigos de status',
            'GET lê (não deve alterar nada), POST cria, PUT substitui o recurso inteiro, PATCH altera parte dele e DELETE apaga. Códigos de status por família: 2xx sucesso (200 ok, 201 criado, 204 sem conteúdo), 4xx erro DO CLIENTE (400 requisição inválida, 401 não autenticado, 403 autenticado mas sem permissão, 404 não encontrado, 409 conflito, 429 muitas requisições) e 5xx erro DO SERVIDOR (500 erro interno). Escolher o código certo permite que clientes e ferramentas reajam sem ler a mensagem.'
          ),
          sl(
            'Idempotência em nível simples',
            'Uma operação é IDEMPOTENTE quando repeti-la várias vezes deixa o sistema no mesmo estado que uma só vez. DELETE /tarefas/7 repetido: na primeira apaga, nas seguintes não há mais nada a apagar; o estado final é igual. PUT /tarefas/7 com os mesmos dados também. POST /tarefas NÃO é idempotente: repetir cria uma tarefa nova a cada vez. Isso importa porque redes falham e clientes repetem requisições: se o cliente não sabe se o POST funcionou e tenta de novo, pode duplicar a cobrança ou o pedido. GET também é idempotente (e seguro, pois não altera nada).'
          ),
          sl(
            'Versionamento e paginação',
            'Clientes dependem do formato da sua API. Se você precisa mudar algo de forma incompatível, versione: a forma mais simples é colocar a versão no caminho (/v1/tarefas, /v2/tarefas), mantendo a antiga funcionando por um tempo. Para listas grandes, não devolva tudo: use paginação (por exemplo ?pagina=2&limite=20), com um limite máximo imposto pelo servidor, para proteger desempenho e evitar abuso.'
          ),
          sl(
            'Formato de erro padronizado',
            'Todo erro deve ter o MESMO formato, para o cliente tratar de um jeito só: código de status adequado e um corpo com código de erro estável, mensagem legível e, se couber, detalhes por campo. Nunca inclua stack trace, caminhos de arquivos, consultas SQL ou dados de outros usuários na mensagem. Exemplo de corpo: { "erro": { "codigo": "VALIDACAO", "mensagem": "Dados inválidos", "detalhes": [ { "campo": "titulo", "problema": "obrigatório" } ] } }. A mensagem diz O QUE o cliente pode corrigir, não como o servidor funciona por dentro.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o desenho de rotas mais coerente com REST para apagar a tarefa de id 7?', 'a', [
          'DELETE /tarefas/7',
          'POST /apagarTarefa com o id 7 no corpo da requisição',
          'GET /tarefas/7/apagar, para poder testar a ação pelo navegador',
          'PUT /apagar/tarefas?id=7 para substituir a tarefa por vazio'
        ], 'O recurso é o substantivo no caminho e a ação vem do verbo HTTP. Verbos no caminho e GET para alterar estado quebram as convenções (e GET deveria ser seguro).'),
        mcq('q2', 'Um cliente envia dados corretos, mas está logado como um usuário comum e tenta acessar uma rota só de administradores. Qual status é o mais adequado?', 'b', [
          '401, porque faltou autenticação e o cliente precisa enviar a senha de novo',
          '403, pois ele está autenticado, mas não tem permissão',
          '404, já que o recurso não existe para aquele usuário',
          '500, porque o servidor não conseguiu concluir o pedido'
        ], '403 é para quem está identificado, mas não autorizado. 401 é para falta de autenticação, 404 diz que não existe (às vezes usado para esconder, mas não é o padrão) e 500 indica falha do servidor, não do cliente.'),
        mcq('q3', 'Um cliente de celular perde a conexão logo depois de enviar POST /pedidos e o aplicativo repete a chamada. Qual risco isso traz?', 'c', [
          'O servidor apagará o primeiro pedido, pois POST é idempotente',
          'Risco algum, pois o Express ignora requisições repetidas automaticamente',
          'Pode criar o pedido em duplicidade, pois POST não é idempotente',
          'O status voltará 200 na repetição, pois ela é considerada leitura'
        ], 'POST cria um recurso novo a cada chamada; repetir pode duplicar. O Express não deduplica e a repetição não vira leitura.'),
        fill('q4', 'Complete com o verbo HTTP usado para ler um recurso sem alterá-lo.', `___ /tarefas/7`, ['get'], 'GET lê e é seguro e idempotente: não deve alterar o estado do servidor.'),
        mcq('q5', 'Qual código de status um servidor deve devolver quando um POST cria um recurso com sucesso?', 'd', [
          '200, porque criar também é uma operação que deu certo',
          '204, para indicar que nada foi criado de novo',
          '301, que indica que o recurso foi movido para outro endereço',
          '201, que indica que o recurso foi criado'
        ], '201 comunica criação. 200 é genérico (aceitável em alguns casos, mas menos informativo), 204 significa sem conteúdo e 301 é redirecionamento.'),
        mcq('q6', 'A equipe precisa mudar de forma incompatível o formato da resposta de /tarefas, e há aplicativos antigos em uso. Qual é a melhor saída?', 'c', [
          'Alterar o formato direto e avisar os usuários para atualizarem depois',
          'Apagar a rota antiga e criar uma com nome totalmente diferente sem aviso',
          'Publicar /v2/tarefas com o novo formato e manter /v1 por um período',
          'Aceitar o formato novo e o antigo na mesma rota, adivinhando qual o cliente quer'
        ], 'Versionar permite evoluir sem quebrar quem já consome. Mudar direto quebra clientes, e adivinhar o formato gera comportamento imprevisível.'),
        mcq('q7', 'Qual corpo de erro segue as boas práticas de uma API?', 'b', [
          '{ "erro": "SQLITE_ERROR: no such column titulo at db.js:42" }',
          '{ "erro": { "codigo": "VALIDACAO", "mensagem": "Dados inválidos" } }',
          'A pilha de chamadas (stack trace) completa, para facilitar a depuração do cliente',
          'Um texto diferente em cada rota, escrito de acordo com a preferência de cada pessoa da equipe'
        ], 'Um formato estável com código e mensagem útil é a prática. Expor mensagens do banco ou stack trace vaza detalhes internos, e formatos diferentes por rota complicam o cliente.'),
        fill('q8', 'Complete com o código de status de "não encontrado".', `res.status(___).json({ erro: { codigo: 'NAO_ENCONTRADO' } });`, ['404'], '404 indica que o recurso pedido não foi encontrado.')
      ]
    },
    {
      id: 'njb-24-variaveis-de-ambiente-e-configuracao',
      title: 'Variáveis de ambiente e configuração',
      goal: 'Ler configuração com process.env, usar arquivos .env, definir padrões, validar na partida e nunca versionar segredos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que separar configuração do código',
            'Uma mesma aplicação roda em lugares diferentes: seu computador, um servidor de testes, produção. O que muda entre eles (porta, endereço do banco, chaves de serviços externos) é CONFIGURAÇÃO e não deve ficar escrito no código: você teria de editar o programa para cada ambiente, e segredos acabariam no repositório. A solução é ler a configuração de fora, e o jeito mais comum é por VARIÁVEIS DE AMBIENTE: pares nome=valor que o sistema operacional entrega ao processo.'
          ),
          sl(
            'process.env',
            'No Node, process.env é um objeto com as variáveis de ambiente do processo. process.env.PORTA lê a variável PORTA. Atenção: todo valor é TEXTO, e uma variável ausente vale undefined. Por isso converta números com Number(...) e trate o caso ausente. Erro comum: if (process.env.DEBUG) quando DEBUG vale o texto "false": texto não vazio é verdadeiro! Compare com "true" explicitamente. Para definir ao executar, no Linux/macOS: PORTA=8080 node app.js; no Windows PowerShell: $env:PORTA = "8080"; node app.js.'
          ),
          sl(
            'Valores padrão (executado)',
            'Para valores não sensíveis, defina um padrão com || ou ??. O operador ?? usa o padrão só quando o valor é undefined ou null (o || também troca texto vazio e zero). Abaixo, o código foi executado de verdade, uma vez com PORTA definida e outra sem. Segredos NÃO ganham valor padrão: se faltarem, a aplicação deve falhar na partida, em vez de subir com uma chave fraca embutida.',
            `const porta = Number(process.env.PORTA) || 3000;
const modo = process.env.MODO ?? 'desenvolvimento';
console.log({ porta, modo });

// $ PORTA=8080 node env.js
// saida real: { porta: 8080, modo: 'desenvolvimento' }`
          ),
          sl(
            'Arquivos .env e --env-file',
            'Digitar dezenas de variáveis na linha de comando é ruim; por isso usa-se um arquivo .env com linhas NOME=valor. O Node, em versões recentes, consegue carregá-lo sozinho com a opção --env-file (confira a documentação da sua versão); antes disso era comum o pacote dotenv. Executado de verdade com um arquivo de exemplo contendo PORTA=4000 e MODO=teste: node --env-file=.env.exemplo env.js imprimiu { porta: 4000, modo: "teste" }. O arquivo .env real NUNCA vai para o Git: coloque-o no .gitignore e versione apenas um .env.exemplo com nomes e valores falsos, para documentar o que é preciso configurar.',
            `# .env.exemplo (versionado, sem segredos reais)
PORTA=4000
MODO=teste
CHAVE_DO_SERVICO=<SEGREDO>

# .gitignore
.env`
          ),
          sl(
            'Validar a configuração na partida',
            'Falhar cedo é melhor que falhar no meio de uma requisição. Ao iniciar, confira se todas as variáveis obrigatórias existem e têm formato válido; se algo faltar, escreva uma mensagem clara (dizendo QUAL variável, nunca imprimindo o valor de um segredo) e encerre com process.exit(1). Centralize a leitura em um único arquivo (config.js) que exporta um objeto pronto; o resto do código importa esse objeto em vez de espalhar process.env por todo lugar.',
            `function lerConfig(env) {
  const faltando = ['CHAVE_DO_SERVICO'].filter((n) => !env[n]);
  if (faltando.length > 0) {
    console.error('Variaveis ausentes:', faltando.join(', '));
    process.exit(1);
  }
  return { porta: Number(env.PORTA) || 3000, chave: env.CHAVE_DO_SERVICO };
}
module.exports = lerConfig(process.env);`
          ),
          sl(
            'Segredos e os doze fatores',
            'Segredo é tudo que dá acesso: senhas, chaves de API, strings de conexão com senha, chaves de assinatura. Nunca no código, nunca no Git (mesmo apagado depois: o histórico guarda; se vazar, TROQUE o segredo), nunca em logs, nunca em mensagens de erro. Em produção, use o mecanismo de segredos da plataforma de hospedagem ou um cofre de segredos, em vez de arquivos soltos. A metodologia "Doze Fatores" para aplicações de serviço, em um de seus princípios, recomenda exatamente isso: guardar a configuração no ambiente, separada do código.'
          )
        ]
      },
      questions: [
        mcq('q1', 'A variável PORTA não foi definida e o código faz Number(process.env.PORTA). Qual o resultado?', 'c', [
          '0, porque variáveis ausentes valem zero',
          'Uma string vazia, que é o valor padrão de variáveis ausentes',
          'NaN, porque Number(undefined) não é um número válido',
          'Um erro que interrompe o programa imediatamente'
        ], 'Uma variável ausente é undefined e Number(undefined) resulta em NaN. Por isso o código usa || ou valida. Não vira 0 nem string vazia, e não lança erro.'),
        mcq('q2', 'O arquivo .env contém DEBUG=false e o código faz if (process.env.DEBUG) { ativarDepuracao(); }. O que acontece?', 'd', [
          'A depuração não é ativada, pois "false" é interpretado como falso',
          'O Node converte automaticamente o texto para booleano antes do if',
          'Um erro é lançado, pois o if exige um valor booleano',
          'A depuração é ativada, porque o texto "false" é não vazio e portanto verdadeiro'
        ], 'Variáveis de ambiente são texto; qualquer texto não vazio é verdadeiro no if. Compare explicitamente: process.env.DEBUG === "true".'),
        mcq('q3', 'Qual é o tratamento correto para uma chave de API obrigatória que está ausente na partida?', 'a', [
          'Encerrar a aplicação com mensagem clara dizendo qual variável falta',
          'Usar uma chave padrão escrita no código para a aplicação continuar subindo',
          'Ignorar o problema e deixar o erro surgir na primeira requisição que a usar',
          'Imprimir o valor de todas as variáveis no console para facilitar o diagnóstico'
        ], 'Falhar cedo evita surpresas depois. Chave padrão no código é vazamento de segredo, adiar o erro piora o diagnóstico e imprimir todas as variáveis expõe segredos.'),
        fill('q4', 'Complete com o objeto que guarda as variáveis de ambiente no Node.', `const porta = Number(process.___.PORTA) || 3000;`, ['env'], 'process.env contém as variáveis de ambiente do processo, todas como texto.'),
        mcq('q5', 'Qual arquivo deve ser versionado no Git para documentar quais variáveis o projeto precisa?', 'b', [
          'O .env real, para os colegas terem exatamente a mesma configuração',
          'Um .env.exemplo com nomes e valores falsos',
          'Arquivo algum: variáveis não devem ser documentadas',
          'O arquivo de log gerado na última execução bem-sucedida'
        ], 'O .env.exemplo documenta sem expor segredos. O .env real contém segredos, e não documentar atrapalha quem configura o projeto.'),
        mcq('q6', 'Uma chave de API foi commitada no Git por engano e removida no commit seguinte. O que fazer?', 'd', [
          'Nada: o commit seguinte já apagou a chave e resolveu o problema',
          'Avisar a equipe para não ler aquele commit específico',
          'Renomear a variável no código para a chave deixar de ser reconhecida',
          'Considerar a chave comprometida e trocá-la no serviço de origem'
        ], 'O histórico do Git continua com a chave; quem tiver acesso pode lê-la. O correto é revogar e gerar outra. Avisar ou renomear não invalida a chave vazada.'),
        mcq('q7', 'Por que centralizar a leitura em um config.js em vez de usar process.env em todo lugar?', 'a', [
          'Para validar uma vez, dar nomes claros e facilitar mudanças e testes',
          'Porque process.env só pode ser lido uma única vez em todo o programa e depois o valor fica bloqueado',
          'Porque o Node proíbe usar process.env fora do arquivo principal',
          'Para que os valores fiquem cifrados automaticamente na memória'
        ], 'Centralizar permite validar, converter tipos e substituir valores em testes. process.env pode ser lido sempre, não há essa proibição e nada é cifrado.'),
        fill('q8', 'Qual opção do comando node carrega um arquivo .env em versões recentes? Responda com a opção completa, começando por dois hifens.', `node ___=.env app.js`, ['--env-file'], 'A opção --env-file carrega as variáveis do arquivo indicado; confira a documentação da sua versão do Node.')
      ]
    },
    {
      id: 'njb-25-bancos-de-dados-conceitos',
      title: 'Bancos de dados: conceitos para quem usa Node',
      goal: 'Comparar SQL e NoSQL, driver, query builder e ORM, entender conexão e pool e escrever consultas parametrizadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Arquivo ou banco de dados?',
            'Guardar dados em um arquivo JSON funciona para estudos e programas pequenos, mas tem limites: ler e reescrever o arquivo inteiro a cada mudança, dificuldade com vários acessos ao mesmo tempo, nenhuma busca eficiente e nenhuma garantia contra gravações pela metade. Um BANCO DE DADOS é um programa especializado em guardar, buscar e alterar dados com segurança e desempenho, mesmo com muitos usuários simultâneos. Ele costuma rodar como um serviço à parte, e sua aplicação Node conversa com ele pela rede.'
          ),
          sl(
            'SQL e NoSQL',
            'Bancos RELACIONAIS (SQL) organizam dados em tabelas com colunas e linhas, ligadas por chaves, e usam a linguagem SQL para consultas. Têm esquema definido e transações (um conjunto de passos que ou acontece inteiro ou não acontece). Exemplos por nome: PostgreSQL, MySQL, SQLite. Bancos NoSQL abrangem modelos diferentes: documentos (como o MongoDB, parecido com objetos JSON), chave-valor (Redis), colunares e de grafos. Nenhum é "melhor": a escolha depende da forma dos dados, das consultas e das garantias necessárias. Para a maioria dos sistemas de cadastro, um relacional é uma boa primeira opção.'
          ),
          sl(
            'Driver, query builder e ORM',
            'Para falar com o banco, o Node precisa de uma biblioteca. Três níveis: o DRIVER envia o SQL que você escreve e devolve os resultados (mais controle, mais trabalho); o QUERY BUILDER monta o SQL a partir de chamadas de função em JavaScript (como Knex); o ORM (mapeamento objeto-relacional) mapeia tabelas para objetos e esconde boa parte do SQL (como Prisma, Sequelize ou TypeORM). Quanto mais alto o nível, menos SQL você escreve, mas mais precisa entender o que ele gera. Todos exigem os mesmos cuidados de segurança. Nomes só como referência; veja a documentação atual de cada um.'
          ),
          sl(
            'Conexão e pool',
            'Abrir uma conexão com o banco é lento: há rede, autenticação e preparação. Abrir uma nova a cada requisição desperdiça tempo e pode esgotar o limite do banco. O POOL DE CONEXÕES resolve: a aplicação mantém um conjunto de conexões abertas, empresta uma para cada consulta e a devolve depois. O tamanho do pool limita quantas consultas ocorrem ao mesmo tempo. Os dados de conexão (endereço, usuário, senha) vêm de variáveis de ambiente, nunca do código. Crie o pool UMA vez na partida e reutilize em toda a aplicação.'
          ),
          sl(
            'Injeção de SQL: o contraexemplo',
            'Se você monta o SQL concatenando texto vindo do usuário, uma entrada com aspas e comandos pode mudar o sentido da consulta: isso é INJEÇÃO DE SQL, uma das falhas mais graves da web. O código abaixo é o contraexemplo, ilustrativo e nunca para copiar (usa uma biblioteca de banco fictícia chamada db, não executado aqui). O problema é que o valor do usuário faz parte do TEXTO do comando, e o banco não consegue distinguir dado de instrução.',
            `// VULNERAVEL - nao use
const nome = req.query.nome;
const sql = "SELECT id, titulo FROM tarefas WHERE dono = '" + nome + "'";
const linhas = await db.query(sql);`
          ),
          sl(
            'A correção: consulta parametrizada',
            'A correção é enviar o comando e os valores SEPARADOS: o SQL traz marcadores (como $1, ou ? conforme o banco) e os valores vão em uma lista à parte. O banco trata os valores sempre como dado, nunca como parte do comando, não importa o conteúdo. Todos os drivers e ORMs sérios oferecem isso; use sempre. Isso vale para qualquer valor externo: query, parâmetros de rota, corpo, cabeçalhos. Nomes de tabelas e colunas não podem ser parametrizados; para eles, use uma lista de permissão fixa no código. Ilustrativo, não executado aqui.',
            `// SEGURO - valores separados do comando
const sql = 'SELECT id, titulo FROM tarefas WHERE dono = $1';
const linhas = await db.query(sql, [nome]);`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação descreve melhor a diferença entre driver e ORM?', 'b', [
          'O driver só funciona com bancos NoSQL e o ORM só com bancos SQL',
          'O driver envia o SQL que você escreve; o ORM mapeia tabelas para objetos e esconde boa parte do SQL',
          'O ORM dispensa qualquer cuidado de segurança, pois valida tudo automaticamente',
          'São o mesmo conceito com nomes diferentes, sem diferença no uso'
        ], 'O driver é a camada mais baixa e o ORM mapeia tabelas para objetos. Ambos podem ser usados com SQL, e nenhum dispensa cuidados como parametrização e validação.'),
        mcq('q2', 'Por que usar um pool de conexões em vez de abrir uma conexão nova por requisição?', 'a', [
          'Abrir conexões é custoso; reaproveitar conexões abertas poupa tempo e protege o banco',
          'Porque o banco de dados só aceita exatamente uma conexão por aplicação ligada ao mesmo tempo ao banco',
          'Porque o pool cifra automaticamente todas as consultas enviadas',
          'Porque conexões novas não conseguem ler dados gravados anteriormente'
        ], 'O pool reaproveita conexões, reduz a latência e limita a carga no banco. Bancos aceitam várias conexões, o pool não é cifra e conexões novas leem os mesmos dados.'),
        mcq('q3', 'Uma consulta é montada somando o texto da pesquisa do usuário ao comando SQL. O que a torna vulnerável?', 'd', [
          'O uso de aspas simples no comando, que o SQL não aceita',
          'O fato de a consulta ser um SELECT, que é perigoso por natureza',
          'A ausência de um índice na coluna dono, que expõe os dados',
          'A entrada do usuário virar parte do texto do comando SQL'
        ], 'Quando o valor externo é concatenado ao comando, o banco não distingue dado de instrução. O SELECT e as aspas são normais, e índice é questão de desempenho.'),
        fill('q4', 'Complete com o nome da técnica que envia os valores separados do comando SQL.', `Consulta ___: db.query('SELECT * FROM tarefas WHERE id = $1', [id])`, ['parametrizada', 'parametrizadas'], 'Na consulta parametrizada o comando traz marcadores e os valores vão à parte, sendo tratados só como dados.'),
        mcq('q5', 'Para que serve uma transação em bancos relacionais?', 'c', [
          'Para criar cópias de segurança automáticas a cada hora',
          'Para acelerar buscas por meio de índices em todas as colunas',
          'Para fazer um conjunto de passos acontecer por inteiro ou não acontecer',
          'Para impedir que mais de uma pessoa leia o mesmo dado'
        ], 'Transação agrupa operações de forma atômica. Backup, índices e bloqueio de leitura são outros recursos.'),
        mcq('q6', 'Um endpoint precisa ordenar por uma coluna escolhida pelo cliente (?ordenar=titulo). Nomes de colunas não aceitam parâmetros. O que fazer?', 'a', [
          'Conferir o valor numa lista fixa de colunas permitidas antes de usá-lo',
          'Concatenar o valor direto no SQL, já que o cliente conhece as colunas e a consulta segue funcionando',
          'Remover as aspas do valor recebido e então concatená-lo ao comando',
          'Passar o valor como parâmetro posicional, mesmo para o nome da coluna'
        ], 'Lista de permissão fixa no código garante que só nomes conhecidos entram no SQL. Concatenar ou "limpar" aspas é frágil e nomes de colunas não funcionam como parâmetro.'),
        mcq('q7', 'Onde devem ficar o endereço, o usuário e a senha do banco usados pelo pool de conexões?', 'd', [
          'Escritos diretamente no arquivo que cria o pool, para ficarem à vista',
          'Em um arquivo dentro da pasta pública servida por express.static',
          'Em um comentário no README, para a equipe consultar quando precisar',
          'Em variáveis de ambiente, lidas na partida'
        ], 'Configuração e segredos ficam no ambiente. No código, em pasta pública ou em documentação eles acabam vazando.'),
        fill('q8', 'Complete com o termo que designa o conjunto de conexões abertas e reutilizadas.', `const ___ = criarPool({ max: 10 }); // pool de conexoes`, ['pool'], 'O pool mantém conexões abertas para serem emprestadas e devolvidas.')
      ]
    },
    {
      id: 'njb-26-crud-em-memoria-e-arquivo',
      title: 'CRUD em memória e em arquivo JSON',
      goal: 'Implementar criar, ler, atualizar e remover uma coleção de tarefas com módulos nativos, gerar IDs e persistir em JSON, entendendo a condição de corrida.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é CRUD',
            'CRUD são as quatro operações básicas sobre dados: Create (criar), Read (ler), Update (atualizar) e Delete (apagar). Quase toda API gira em torno delas, e elas se ligam aos verbos HTTP: POST cria, GET lê, PUT/PATCH atualiza e DELETE apaga. Antes de ligar um banco de dados, vale implementar o CRUD com um array em memória: isso isola a lógica dos detalhes de infraestrutura. Nesta lição tudo usa só módulos nativos e foi executado de verdade com Node.'
          ),
          sl(
            'Criar e ler: IDs e coleção',
            'Uma tarefa é um objeto { id, titulo, feita }. A coleção é um array e o ID identifica cada item. Uma forma simples de gerar IDs é um contador que só cresce (proximoId++): nunca reutiliza um número, mesmo depois de apagar. Evite calcular o ID como tamanho do array + 1, pois após remover itens você repetiria IDs. Em bancos reais, IDs costumam vir do próprio banco (sequências) ou serem identificadores aleatórios longos (UUID), que não revelam quantos registros existem. Ler = percorrer ou buscar com find.',
            `let tarefas = [];
let proximoId = 1;

function criar(titulo) {
  const t = { id: proximoId++, titulo, feita: false };
  tarefas.push(t);
  return t;
}
function listar() { return tarefas; }
function buscar(id) { return tarefas.find((t) => t.id === id); }`
          ),
          sl(
            'Atualizar e remover',
            'Atualizar: ache o item, e altere SÓ os campos permitidos, depois de checar o tipo de cada um (não copie o corpo inteiro do cliente para o objeto: ele poderia trocar o id ou criar campos inesperados). Se o item não existe, devolva "não encontrado" (na API seria 404). Remover: findIndex localiza a posição e splice(i, 1) retira o elemento; se o índice for -1, o item não existe. Perceba que as funções retornam null ou false para o "não achei", deixando a decisão de HTTP para quem chama.',
            `function atualizar(id, mudancas) {
  const t = buscar(id);
  if (!t) return null;
  if (typeof mudancas.titulo === 'string') t.titulo = mudancas.titulo;
  if (typeof mudancas.feita === 'boolean') t.feita = mudancas.feita;
  return t;
}
function remover(id) {
  const i = tarefas.findIndex((t) => t.id === id);
  if (i === -1) return false;
  tarefas.splice(i, 1);
  return true;
}`
          ),
          sl(
            'Persistir em arquivo JSON',
            'Dados só em memória somem quando o programa termina. Para guardá-los, serialize com JSON.stringify e grave com fs.writeFileSync; para recuperar, leia com fs.readFileSync e use JSON.parse. Guarde também o proximoId, senão os IDs recomeçariam do 1. Ao carregar, verifique se o arquivo existe (primeira execução). Este modelo serve para estudos e programas pequenos; em produção, prefira um banco (lição 25). Arquivos de dados com informações pessoais também exigem cuidado: permissões restritas e nada dentro de pasta pública.',
            `const fs = require('node:fs');
function salvar() {
  fs.writeFileSync('tarefas.json', JSON.stringify({ proximoId, tarefas }, null, 2));
}
function carregar() {
  if (!fs.existsSync('tarefas.json')) return;
  const d = JSON.parse(fs.readFileSync('tarefas.json', 'utf8'));
  tarefas = d.tarefas; proximoId = d.proximoId;
}`
          ),
          sl(
            'Executando o CRUD completo',
            'O programa criou duas tarefas, marcou a 1 como feita, removeu a 2, criou outra, salvou no arquivo, zerou a memória, carregou do arquivo e listou. Note que a nova tarefa recebeu o id 3, pois o 2 foi apagado e NÃO é reutilizado, e que buscar um id inexistente devolve undefined.',
            `criar('Estudar Node');   criar('Escrever testes');
atualizar(1, { feita: true });
remover(2);
criar('Revisar API');
salvar();  tarefas = [];  proximoId = 1;  carregar();
console.log(listar());
console.log('proximoId:', proximoId);
console.log('buscar(99):', buscar(99));

// saida real:
// [
//   { id: 1, titulo: 'Estudar Node', feita: true },
//   { id: 3, titulo: 'Revisar API', feita: false }
// ]
// proximoId: 4
// buscar(99): undefined`
          ),
          sl(
            'Condição de corrida ao gravar arquivo',
            'CONDIÇÃO DE CORRIDA é quando o resultado depende da ordem em que operações concorrentes acontecem. Imagine duas requisições que fazem ler-modificar-gravar no mesmo arquivo: ambas leem o valor antigo, ambas somam 1 e a segunda gravação apaga a primeira (uma atualização perdida). Ao testar aqui três incrementos simultâneos com fs/promises, uma das execuções até falhou com JSON.parse sobre arquivo lido pela metade: o resultado é imprevisível, e é isso que define a corrida. Mitigações em conceito: serializar as gravações (uma fila), gravar em arquivo temporário e renomear, ou usar um banco de dados, que resolve isso com transações e bloqueios. Em funções síncronas (writeFileSync) dentro de um único processo não há intercalação, mas com vários processos ainda há.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Depois de criar tarefas com ids 1, 2 e 3 e apagar a 2, um novo item é criado com proximoId++. Qual id ele recebe?', 'd', [
          '2, pois o servidor reaproveita o menor número livre',
          '3, pois o contador volta ao último id existente',
          '1, pois o contador reinicia quando um item é apagado',
          '4, pois o contador só cresce e não reutiliza números'
        ], 'O contador incrementa sempre; ids de itens apagados não são reutilizados. As outras opções descrevem comportamentos que o contador não tem.'),
        mcq('q2', 'Por que calcular o novo id como tarefas.length + 1 é arriscado?', 'b', [
          'Porque length retorna texto e a soma resulta em concatenação',
          'Porque após remover itens o id pode repetir um já existente',
          'Porque arrays em JavaScript não possuem a propriedade length',
          'Porque o resultado começa em zero e não em um'
        ], 'Com ids 1, 2, 3 e a remoção do 1, length vale 2 e length + 1 gera 3, repetido. length é número e existe em arrays.'),
        mcq('q3', 'Na função atualizar, por que copiar só campos específicos (titulo, feita) em vez de usar Object.assign(t, mudancas)?', 'c', [
          'Porque Object.assign não funciona com objetos criados por literal como os usados nas rotas',
          'Porque copiar campos manualmente roda mais rápido',
          'Para que o cliente não consiga alterar o id nem criar campos indevidos',
          'Porque JSON não permite objetos com mais de dois campos'
        ], 'Copiar tudo do corpo permite ao cliente trocar o id ou inserir campos arbitrários. Object.assign funciona, o desempenho não é a razão e JSON aceita qualquer quantidade de campos.'),
        fill('q4', 'Complete com o método de array que remove um elemento a partir de uma posição.', `tarefas.___(i, 1); // remove 1 elemento na posicao i`, ['splice'], 'splice(posicao, quantidade) remove elementos do array alterando-o no próprio lugar.'),
        mcq('q5', 'Duas requisições leem o mesmo contador em arquivo (valor 10), cada uma soma 1 e grava. Qual é o valor final mais provável sem coordenação?', 'a', [
          '11, porque a segunda gravação sobrescreve a primeira com o mesmo valor',
          '12, porque o sistema de arquivos soma as gravações',
          '10, porque o arquivo não aceita duas gravações próximas',
          '0, porque o arquivo é zerado a cada gravação'
        ], 'Ambas partiram de 10 e gravaram 11: uma atualização foi perdida, que é a condição de corrida. O sistema de arquivos não soma nada.'),
        mcq('q6', 'Qual mitigação ajuda a evitar um arquivo corrompido por uma gravação interrompida?', 'b', [
          'Gravar em um arquivo de nome aleatório que não será lido por outros processos do sistema',
          'Gravar em um arquivo temporário e depois renomeá-lo para o definitivo',
          'Abrir o arquivo no modo leitura antes de cada gravação',
          'Converter os dados em texto maiúsculo antes de salvar'
        ], 'Gravar no temporário e renomear faz a troca ser praticamente atômica: o arquivo definitivo está sempre completo. As outras ideias não protegem contra interrupção.'),
        mcq('q7', 'Ao carregar tarefas.json na primeira execução, o arquivo ainda não existe. Qual cuidado evita o erro?', 'c', [
          'Colocar o readFileSync dentro de um laço infinito até o arquivo aparecer',
          'Ignorar o problema, pois readFileSync cria o arquivo vazio sozinho',
          'Verificar com fs.existsSync antes de ler e começar com dados vazios',
          'Trocar JSON.parse por eval para aceitar qualquer conteúdo'
        ], 'Verificar a existência (ou tratar o erro) permite iniciar com a coleção vazia. readFileSync lança erro se o arquivo falta, e eval com dados de arquivo é perigoso e desnecessário.'),
        fill('q8', 'Complete com a função que converte um objeto JavaScript em texto JSON antes de gravar no arquivo.', `fs.writeFileSync('tarefas.json', JSON.___(dados, null, 2));`, ['stringify'], 'JSON.stringify serializa o objeto em texto; JSON.parse faz o caminho inverso.')
      ]
    },
    {
      id: 'njb-27-validacao-de-entrada',
      title: 'Validação de entrada',
      goal: 'Não confiar no cliente, validar tipo, tamanho e formato, usar listas de permissão e devolver mensagens úteis sem vazar internos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Nunca confie no cliente',
            'Tudo que chega de fora é ENTRADA NÃO CONFIÁVEL: corpo, parâmetros de rota, query string, cabeçalhos e cookies. O front-end pode validar para ajudar o usuário, mas isso é conforto, não segurança: qualquer pessoa pode enviar requisições direto à API, sem passar pela sua tela. Quem garante a regra é SEMPRE o servidor. A validação protege a integridade dos dados e é a base de defesas contra injeção, estouro de memória e comportamento inesperado.'
          ),
          sl(
            'O que validar: tipo, tamanho e formato',
            'Valide três coisas. TIPO: o campo é texto, número, booleano, objeto? (typeof corpo.titulo === "string"; o JSON permite que o cliente mande um número onde você esperava texto, ou um objeto, ou null). TAMANHO: texto com mínimo e máximo, listas com limite de itens, números dentro de uma faixa; sem limite, alguém envia megabytes num campo. FORMATO: padrão esperado, como um e-mail simples, uma data ISO ou um código com letras e dígitos. Ao receber em texto algo que deveria ser número (parâmetros e query chegam como string), converta e confira com Number.isInteger.'
          ),
          sl(
            'Lista de permissão (allowlist)',
            'Duas estratégias: lista de BLOQUEIO (rejeitar o que sei que é ruim) e lista de PERMISSÃO (aceitar só o que sei que é bom). A segunda é bem mais segura, porque você não precisa prever todo ataque. Exemplos: o campo prioridade só pode ser "baixa", "media" ou "alta"; o campo de ordenação só pode ser uma entre colunas conhecidas; um objeto de entrada só pode ter os campos esperados. Qualquer coisa fora da lista é rejeitada com 400, em vez de "consertada" às escondidas.'
          ),
          sl(
            'Validando na prática (executado)',
            'A função abaixo junta as ideias: confere o corpo, o tipo e o tamanho do título e usa lista de permissão para a prioridade. Ela devolve uma lista de erros em vez de lançar na primeira falha, para o cliente corrigir tudo de uma vez. As mensagens dizem o que corrigir, sem revelar detalhes internos (nada de nomes de tabelas ou caminhos). O código foi executado com Node.',
            `function validarTarefa(corpo) {
  const erros = [];
  if (typeof corpo !== 'object' || corpo === null) return ['corpo deve ser um objeto'];
  if (typeof corpo.titulo !== 'string') erros.push('titulo deve ser texto');
  else if (corpo.titulo.trim().length < 3 || corpo.titulo.length > 100)
    erros.push('titulo deve ter de 3 a 100 caracteres');
  const prioridades = ['baixa', 'media', 'alta'];
  if (corpo.prioridade !== undefined && !prioridades.includes(corpo.prioridade))
    erros.push('prioridade invalida');
  return erros;
}
// validarTarefa({ titulo: 'Estudar', prioridade: 'alta' })  -> []
// validarTarefa({ titulo: 5 })                              -> [ 'titulo deve ser texto' ]
// validarTarefa({ titulo: 'ab', prioridade: 'urgente' })
//   -> [ 'titulo deve ter de 3 a 100 caracteres', 'prioridade invalida' ]
// validarTarefa(null)                                       -> [ 'corpo deve ser um objeto' ]`
          ),
          sl(
            'Bibliotecas de schema',
            'Escrever à mão cada regra cansa e dá erros. Existem bibliotecas que permitem descrever o formato esperado (o SCHEMA) e validar de uma vez, devolvendo erros por campo: zod, joi, ajv (JSON Schema) e outras, por nome. Você declara "titulo: texto de 3 a 100 caracteres; prioridade: uma das três opções" e a biblioteca valida e até converte tipos. Escolha uma, aplique-a em um middleware ANTES do controlador e consulte a documentação atual dela. Ilustrativo, sem código executado aqui.'
          ),
          sl(
            'Mensagens de erro úteis e seguras',
            'Responda 400 (ou 422, conforme a convenção da equipe) com o formato de erro padronizado e uma lista de problemas por campo, em linguagem clara. Não devolva a entrada recebida sem escape se ela for exibida em HTML, não revele regras de segurança (diga "credenciais inválidas" e não "o usuário existe mas a senha está errada") e não exponha mensagens de banco ou stack trace. Validação também protege contra abuso: limite o tamanho do corpo na camada do servidor, antes mesmo de validar os campos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O formulário do site já valida o título com no mínimo 3 caracteres. Por que o servidor precisa validar de novo?', 'a', [
          'Porque qualquer pessoa pode chamar a API direto, sem passar pela tela',
          'Porque o navegador apaga as validações ao enviar o formulário',
          'Porque o servidor é mais rápido ao validar do que o navegador',
          'Porque a validação do navegador só funciona para números'
        ], 'A validação do cliente é conforto de uso; a API pode receber chamadas montadas à mão. O navegador não apaga a validação, a velocidade não é o motivo e ela vale para qualquer tipo.'),
        mcq('q2', 'Uma API espera titulo como texto e recebe { "titulo": { "a": 1 } }. Sem validação de tipo, qual o risco?', 'c', [
          'Risco algum, pois JSON converte os valores para texto',
          'O Node recusa a requisição antes de chegar ao código da rota',
          'O código pode se comportar de forma inesperada ou falhar ao tratar o valor como texto',
          'O objeto é transformado automaticamente na string "[object Object]" e gravado normalmente de forma segura'
        ], 'JSON permite objetos, números e null; sem checar o tipo, métodos de texto podem falhar e dados estranhos podem ser gravados. O Node não valida isso por você.'),
        mcq('q3', 'Qual estratégia é mais segura para o campo prioridade (baixa, media, alta)?', 'b', [
          'Rejeitar os valores conhecidos como perigosos e aceitar o restante',
          'Aceitar os três valores permitidos e rejeitar o resto',
          'Aceitar qualquer texto e removê-lo se contiver símbolos',
          'Converter o valor recebido para minúsculas e gravá-lo sem checar'
        ], 'Lista de permissão aceita só o que se conhece; lista de bloqueio depende de prever todo valor ruim. Remover símbolos ou só converter caixa não garante um valor válido.'),
        fill('q4', 'Qual é o nome da estratégia que aceita somente valores previamente definidos como válidos? Responda em uma palavra (em português, a "lista de ...").', `Lista de ___: aceitar apenas o que esta explicitamente permitido`, ['permissão', 'permissao', 'allowlist'], 'A lista de permissão (allowlist) define o que é aceito; tudo fora dela é rejeitado.'),
        mcq('q5', 'Qual mensagem de erro de validação é adequada?', 'd', [
          '"Erro SQL: coluna titulo violou restrição NOT NULL em tarefas"',
          '"Falha em /app/src/rotas/tarefas.js linha 42"',
          '"Tente de novo mais tarde", sem dizer qual campo está errado',
          '"titulo deve ter de 3 a 100 caracteres"'
        ], 'A mensagem útil diz o que corrigir sem revelar tabela, caminho ou código. Mensagem vaga atrapalha o cliente legítimo, e detalhes internos ajudam atacantes.'),
        mcq('q6', 'Um campo ?limite=abc chega pela query string e o código faz Number(req.query.limite). O que fazer em seguida?', 'c', [
          'Usar o resultado diretamente, pois Number devolve um inteiro válido para qualquer texto',
          'Aceitar NaN, que o banco interpreta como "sem limite"',
          'Checar com Number.isInteger e uma faixa máxima, rejeitando com 400 se falhar',
          'Trocar por parseInt, que não falha com entradas inválidas'
        ], 'Number("abc") resulta em NaN; é preciso validar o resultado e impor um teto. parseInt também pode devolver NaN, e NaN no banco pode causar erro ou comportamento indevido.'),
        mcq('q7', 'Qual é o benefício de uma biblioteca de schema como zod ou joi?', 'a', [
          'Descrever o formato esperado uma vez e validar com erros por campo',
          'Tornar desnecessário limitar o tamanho do corpo das requisições',
          'Garantir que o front-end não envie dados inválidos ao servidor',
          'Substituir a necessidade de escapar HTML na saída'
        ], 'Schemas centralizam regras e produzem erros por campo. Não dispensam limite de tamanho nem escape de saída e não controlam o front-end.'),
        fill('q8', 'Complete a checagem de tipo do campo titulo.', `if (typeof corpo.titulo !== '___') erros.push('titulo deve ser texto');`, ['string'], 'typeof devolve "string" para textos; é a checagem de tipo mais básica.')
      ]
    },
    {
      id: 'njb-28-tratamento-de-erros-em-express',
      title: 'Tratamento de erros em Express',
      goal: 'Usar o middleware de erro, distinguir erros operacionais de bugs, tratar async e escolher status sem vazar detalhes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Erros operacionais x bugs',
            'ERRO OPERACIONAL é uma falha esperada do ambiente ou da entrada: JSON inválido, id inexistente, banco indisponível, arquivo sem permissão. Você prevê e responde de forma adequada. BUG é erro de programação: acessar propriedade de undefined, esquecer um await. Você corrige o código; em produção, o cliente recebe uma resposta genérica 500 e a equipe é avisada pelo log. Separar os dois tipos define a reação: operacional gera uma resposta clara (404, 400, 503); bug gera 500 sem detalhes e registro interno.'
          ),
          sl(
            'O middleware de erro (4 parâmetros)',
            'No Express, qualquer função com assinatura (err, req, res, next) é um tratador de erros. Quando uma rota lança um erro síncrono ou chama next(erro), o Express pula os middlewares comuns e vai direto aos tratadores, que devem ser registrados DEPOIS das rotas. Um tratador final concentra a resposta de erro num lugar só, com o formato padrão da lição 23. Os 4 parâmetros devem existir mesmo que não use next: o Express conta os parâmetros para reconhecê-lo. Ilustrativo, não executado aqui (depende do Express).',
            `function tratadorDeErro(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error('erro interno:', err.message);
  res.status(status).json({
    erro: { codigo: err.codigo || 'ERRO_INTERNO',
            mensagem: status >= 500 ? 'Erro interno' : err.message }
  });
}
app.use(tratadorDeErro); // depois de todas as rotas`
          ),
          sl(
            'Erros em código assíncrono',
            'Erros lançados em código SÍNCRONO são capturados pelo Express automaticamente. Em funções async, uma promise rejeitada não é capturada por versões antigas do Express: o erro vira uma rejeição não tratada e a requisição fica pendurada. Em versões recentes do Express (confira a documentação da sua versão) rotas async que rejeitam já chamam next(erro); em outras, o padrão seguro é um ASYNC HANDLER: uma função que envolve a rota e repassa qualquer rejeição a next. Você também pode usar try/catch dentro da rota e chamar next(erro).',
            `const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/tarefas/:id', asyncHandler(async (req, res) => {
  const t = await buscarNoBanco(Number(req.params.id));
  if (!t) throw Object.assign(new Error('Tarefa nao encontrada'), { status: 404 });
  res.json(t);
}));`
          ),
          sl(
            'Status adequados',
            'Escolha o status pela causa. 400: entrada inválida (corpo malformado, validação falhou). 401/403: sem autenticação / sem permissão. 404: recurso inexistente. 409: conflito (por exemplo, e-mail já cadastrado). 429: muitas requisições. 500: erro inesperado no servidor. 503: serviço indisponível, como o banco fora do ar. Erros de cliente (4xx) podem ter mensagem específica; erros de servidor (5xx) têm mensagem genérica. Crie uma classe de erro simples (por exemplo ErroHttp com status e código) para lançar erros operacionais sem repetir res.status em toda parte.'
          ),
          sl(
            'Não vazar stack trace',
            'O stack trace mostra caminhos de arquivos, nomes de funções e às vezes trechos do que falhou: valioso para você e para quem ataca. Registre-o no LOG do servidor, nunca no corpo da resposta ao cliente. Algumas ferramentas mostram detalhes por padrão em ambientes de desenvolvimento; confirme que em produção isso esteja desativado (a variável de ambiente que indica o modo é a que costuma controlar, veja a lição 24). Para o cliente, devolva um identificador de erro curto, que ele possa informar ao suporte e você encontrar no log, sem dados pessoais.'
          ),
          sl(
            'Processo: o que fazer com erros fatais',
            'Alguns erros deixam o processo em estado incerto: exceções não capturadas e rejeições de promise não tratadas. O comportamento recomendado é registrar o erro e ENCERRAR o processo, deixando um gerenciador (PM2, systemd, Docker ou o orquestrador) reiniciá-lo limpo, em vez de continuar rodando em estado duvidoso. Os eventos process.on("uncaughtException") e process.on("unhandledRejection") servem para registrar e sair, não para "engolir" o erro e seguir como se nada tivesse acontecido.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual destes é um erro operacional, em vez de um bug?', 'c', [
          'Acessar req.body.titulo quando req.body vale undefined por falta de código',
          'Esquecer o await antes de uma função que devolve promise',
          'O banco de dados ficar indisponível durante uma consulta',
          'Digitar errado o nome de uma variável dentro de uma função'
        ], 'Indisponibilidade do banco é falha esperada do ambiente, que deve ser tratada (503, nova tentativa). As outras opções são erros de programação a serem corrigidos no código.'),
        mcq('q2', 'Qual assinatura identifica um middleware de tratamento de erros no Express?', 'd', [
          '(req, res), usada nas rotas comuns',
          '(req, res, next), usada nos middlewares comuns',
          '(erro, resposta), com os nomes em português',
          '(err, req, res, next)'
        ], 'O Express reconhece o tratador pela quantidade de parâmetros: quatro, sendo o primeiro o erro. As outras assinaturas são rota, middleware comum ou inválida.'),
        mcq('q3', 'Onde deve ser registrado o middleware de erro para capturar falhas das rotas?', 'b', [
          'Antes de todas as rotas e middlewares, no topo do arquivo',
          'Depois de todas as rotas e middlewares',
          'Dentro de cada rota, copiado em cada arquivo de rotas',
          'Em qualquer lugar, pois a ordem não importa para erros'
        ], 'O tratador precisa vir depois do que pode gerar erro. A ordem importa, e repetir em cada rota é desnecessário.'),
        fill('q4', 'Complete com a função que repassa o erro ao tratador de erros do Express.', `app.get('/x', (req, res, next) => {
  try { riscoDeFalha(); } catch (e) { ___(e); }
});`, ['next'], 'Chamar next(erro) pula os middlewares comuns e leva o erro ao tratador de quatro parâmetros.'),
        mcq('q5', 'Qual é a resposta mais adequada em produção para um bug inesperado (TypeError) dentro de uma rota?', 'a', [
          '500 com mensagem genérica, registrando o detalhe só no log do servidor',
          '200 com { erro: "..." } contendo a mensagem original do TypeError',
          '404, para não revelar que existe um problema no servidor',
          '500 com o stack trace completo, para o cliente enviar à equipe'
        ], 'Bug é falha do servidor: 500, mensagem genérica e detalhes no log. Responder 200 com erro engana, 404 é para recurso inexistente e stack trace na resposta vaza informações internas.'),
        mcq('q6', 'Uma rota async chama await no banco, que rejeita a promise. Em um Express que não captura isso sozinho, o que acontece sem proteção?', 'd', [
          'O tratador de erros é chamado automaticamente em todas as versões',
          'O Node reinicia o servidor e retorna a mesma requisição ao cliente sem intervenção',
          'O erro vira um erro de sintaxe que impede o servidor de ligar',
          'A rejeição fica sem tratamento e a requisição pode ficar pendurada'
        ], 'Sem capturar a rejeição (try/catch, async handler ou suporte da versão), o erro não chega ao tratador. O Node não reinicia sozinho e não é erro de sintaxe.'),
        mcq('q7', 'Por que não enviar o stack trace ao cliente?', 'b', [
          'Porque ele ocupa muito espaço e deixa a resposta lenta demais',
          'Porque revela caminhos e estrutura internos que ajudam quem ataca',
          'Porque navegadores não conseguem exibir texto com várias linhas',
          'Porque o Express proíbe enviar texto no corpo de respostas de erro'
        ], 'O stack trace expõe detalhes internos; o lugar dele é o log. Tamanho, exibição e uma suposta proibição do Express não são o motivo.'),
        fill('q8', 'Complete com o status HTTP de um erro interno inesperado do servidor.', `res.status(___).json({ erro: { codigo: 'ERRO_INTERNO' } });`, ['500'], '500 indica falha inesperada do servidor, com mensagem genérica ao cliente.')
      ]
    },
    {
      id: 'njb-29-senhas-e-hash',
      title: 'Senhas e hash',
      goal: 'Armazenar senhas com hash lento e salt (scrypt), comparar em tempo constante e conhecer política de senha e noções de LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Nunca guarde a senha em texto',
            'Se o banco guarda senhas em texto, qualquer vazamento (backup esquecido, falha de injeção, funcionário curioso) entrega as senhas de todos, e pessoas reutilizam senhas em vários serviços. A regra é: o sistema NÃO precisa saber a senha, só precisa conferir se quem tenta entrar a conhece. Para isso guarda-se um HASH: o resultado de uma função de mão única que transforma a senha em uma sequência de bytes, da qual não dá para recuperar a senha. No login, calcula-se o hash do que foi digitado e compara-se com o guardado. Criptografar (cifrar) não é o mesmo: a cifra é reversível por quem tem a chave.'
          ),
          sl(
            'Por que hash comum não basta',
            'Funções como SHA-256 foram feitas para serem RÁPIDAS, o que é ruim aqui: quem rouba a base consegue testar bilhões de palpites por segundo, e senhas comuns caem rápido. Além disso, sem SAL, duas pessoas com a mesma senha teriam o mesmo hash, e tabelas pré-calculadas de hashes de senhas comuns funcionariam. O SAL é um valor aleatório e único por usuário, misturado à senha antes do hash: ele torna cada hash diferente e invalida as tabelas prontas. O sal não é segredo; é guardado junto do hash. Para senhas, use funções de hash LENTAS e configuráveis, projetadas para isso.'
          ),
          sl(
            'scrypt, bcrypt e argon2',
            'As escolhas habituais são argon2, bcrypt e scrypt, funções deliberadamente lentas e (no caso do scrypt e argon2) que também consomem memória, encarecendo ataques em massa. O Node traz o scrypt no módulo nativo node:crypto, então você pode usá-lo sem pacotes. Bcrypt e argon2 existem como pacotes de terceiros (por nome). Confira nas orientações atuais da OWASP e na documentação os parâmetros de custo recomendados; eles aumentam com o tempo, à medida que o hardware melhora. Nunca invente a sua própria função de hash.'
          ),
          sl(
            'Hash com scrypt e salt (executado)',
            'O código gera um sal aleatório de 16 bytes, calcula o hash de 64 bytes e guarda ambos como "sal:hash" em texto hexadecimal. A mesma senha usada duas vezes produz resultados diferentes por causa do sal. Executado de verdade com Node: o parâmetro de custo foi o padrão do scrypt; em produção, avalie ajustá-lo.',
            `const { scryptSync, randomBytes, timingSafeEqual } = require('node:crypto');
function gerarHash(senha) {
  const sal = randomBytes(16);
  const hash = scryptSync(senha, sal, 64);
  return sal.toString('hex') + ':' + hash.toString('hex');
}
const a = gerarHash('senha-de-exemplo-123');
const b = gerarHash('senha-de-exemplo-123');
console.log('mesmo hash para mesma senha?', a === b);
console.log('formato sal:hash ->', a.split(':').map((p) => p.length));
// saida real:
// mesmo hash para mesma senha? false
// formato sal:hash -> [ 32, 128 ]`
          ),
          sl(
            'Conferir a senha em tempo constante (executado)',
            'Para conferir, separe sal e hash, recalcule o hash da senha digitada com o MESMO sal e compare. Use timingSafeEqual, que compara sem parar no primeiro byte diferente: comparações comuns (===) podem demorar um pouco mais ou menos conforme quantos bytes coincidem, e um atacante paciente poderia explorar essa diferença de tempo. As duas buffers devem ter o mesmo tamanho. Resultado real da execução abaixo: senha certa true, errada false. Na resposta de login, use sempre a mesma mensagem genérica para usuário inexistente e senha errada.',
            `function conferir(senha, guardado) {
  const [salHex, hashHex] = guardado.split(':');
  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = scryptSync(senha, Buffer.from(salHex, 'hex'), esperado.length);
  return timingSafeEqual(esperado, calculado);
}
// conferir('senha-de-exemplo-123', a) -> true
// conferir('outra-senha', a)          -> false`
          ),
          sl(
            'Política de senha e LGPD',
            'Política de senha moderna: exija comprimento mínimo razoável (frases longas valem mais que símbolos obrigatórios), aceite senhas longas, bloqueie senhas muito comuns, não force trocas periódicas sem motivo e ofereça verificação em duas etapas. Limite as tentativas de login (lição 31). Senha e hash são DADOS PESSOAIS de segurança: a LGPD (Lei 13.709/2018) exige medidas técnicas adequadas para proteger dados pessoais, e hash com salt é uma delas. Nunca registre senhas em logs. Isto é uma visão geral e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um banco vaza e as senhas estavam em texto puro. Qual a consequência mais grave?', 'b', [
          'Só os administradores teriam as senhas expostas, e os usuários comuns ficariam protegidos',
          'Todas as contas ficam comprometidas, inclusive em outros serviços onde a senha se repete',
          'As senhas só poderiam ser lidas por quem tem a chave de cifragem',
          'O banco precisaria ser reinstalado antes de qualquer outra providência'
        ], 'Texto puro revela a senha de todos e muita gente a reutiliza em outros lugares. Não há chave a proteger e não é necessário reinstalar o banco para o dano acontecer.'),
        mcq('q2', 'Qual é a diferença entre hash e criptografia (cifra)?', 'a', [
          'O hash é de mão única; a cifra é reversível por quem tem a chave',
          'O hash é reversível com a senha; a cifra não pode ser desfeita',
          'Os dois são idênticos, só com nomes diferentes',
          'O hash só funciona com números; a cifra só com textos'
        ], 'Hash não pode ser revertido; cifra pode, com a chave. Por isso senhas usam hash. As outras opções invertem ou confundem os conceitos.'),
        mcq('q3', 'Qual é a função do SAL?', 'c', [
          'Acelerar o cálculo do hash para o login ficar mais rápido',
          'Funcionar como segredo guardado no código-fonte do servidor e fora do banco',
          'Tornar único o hash de cada usuário e invalidar tabelas pré-calculadas',
          'Cifrar a senha para que ela possa ser recuperada depois'
        ], 'O sal é aleatório e por usuário: evita hashes iguais para senhas iguais e inutiliza tabelas prontas. Ele não acelera, não é segredo de código e não permite recuperar a senha.'),
        fill('q4', 'Complete com a função nativa do node:crypto usada no exemplo para derivar o hash lento da senha.', `const hash = ___(senha, sal, 64);`, ['scryptSync', 'scrypt'], 'scrypt (aqui na versão síncrona scryptSync) é uma função de derivação de chave lenta e que usa memória, adequada para senhas.'),
        mcq('q5', 'Por que usar timingSafeEqual em vez de === para comparar hashes?', 'd', [
          'Porque === só consegue comparar números inteiros e não buffers',
          'Porque timingSafeEqual converte o hash de volta para a senha original',
          'Porque === lança erro quando os hashes são diferentes',
          'Porque a comparação em tempo constante evita revelar, pelo tempo, quantos bytes coincidem'
        ], 'A comparação comum pode terminar mais cedo ao achar uma diferença, vazando informação pelo tempo. timingSafeEqual não reverte hash e === não lança erro.'),
        mcq('q6', 'Qual mensagem de login falho é mais segura?', 'a', [
          '"Credenciais inválidas", igual para usuário inexistente e senha errada',
          '"Esse usuário não existe", quando o nome não for encontrado',
          '"Senha incorreta para o usuário maria", quando só a senha falha e o usuário existe no banco',
          '"Falha no banco de dados: tabela usuarios sem resposta"'
        ], 'A mesma mensagem genérica evita revelar quais usuários existem. As outras revelam existência de contas ou detalhes internos.'),
        mcq('q7', 'Qual é o problema de usar SHA-256 puro (sem sal e sem custo) para guardar senhas?', 'c', [
          'O SHA-256 não consegue gerar saídas de tamanho fixo',
          'O SHA-256 é lento demais e trava o servidor no login',
          'É muito rápido e sem sal, o que facilita testes em massa e tabelas prontas',
          'O SHA-256 só existe em sistemas operacionais antigos'
        ], 'Funções rápidas permitem testar muitos palpites por segundo, e a falta de sal repete hashes. Para senhas use funções lentas como scrypt, bcrypt ou argon2.'),
        fill('q8', 'Complete com o nome da lei brasileira, citada em visão geral, que trata da proteção de dados pessoais. Responda com a sigla.', `Lei 13.709/2018: ___ (Lei Geral de Proteção de Dados)`, ['lgpd'], 'A LGPD (Lei 13.709/2018) trata da proteção de dados pessoais; esta lição é visão geral e não substitui orientação jurídica.')
      ]
    },
    {
      id: 'njb-30-sessoes-vs-jwt',
      title: 'Sessões e JWT',
      goal: 'Diferenciar autenticação de autorização, comparar sessão com cookie e token JWT, e conhecer atributos de cookie, armazenamento e expiração.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autenticação x autorização',
            'AUTENTICAÇÃO responde "quem é você?" (provar identidade, por exemplo com senha). AUTORIZAÇÃO responde "o que você pode fazer?" (permissões: este usuário pode apagar a tarefa de outro?). Os dois são etapas distintas: estar autenticado não dá direito a tudo. Erro comum e grave: autenticar bem, mas esquecer de checar se o recurso pedido pertence ao usuário, permitindo que ele leia ou altere dados de outras pessoas só trocando o id na URL. Em HTTP: 401 = não autenticado; 403 = autenticado sem permissão.'
          ),
          sl(
            'O problema: HTTP não tem memória',
            'Cada requisição HTTP é independente: depois do login, o servidor precisa reconhecer o usuário nas próximas chamadas sem pedir a senha de novo. Há duas famílias de solução: guardar o estado do login NO SERVIDOR (sessão) ou entregar ao cliente uma credencial assinada que ele reapresenta (token). Ambas passam por entregar ao cliente algo que prove o login; quem obtém esse algo passa por aquele usuário, então o item deve ser protegido como uma senha.'
          ),
          sl(
            'Sessão com cookie',
            'No modelo de SESSÃO, após o login o servidor cria um registro (a sessão) em memória, em um banco ou em um cache, e entrega ao navegador apenas um identificador longo e aleatório dentro de um COOKIE. O navegador envia o cookie automaticamente em cada requisição; o servidor procura a sessão pelo identificador. Vantagem: o servidor controla tudo e pode encerrar a sessão na hora (logout, bloqueio). Custo: precisa guardar sessões (e compartilhá-las entre várias instâncias do servidor). Pacotes populares existem por nome (express-session e similares).'
          ),
          sl(
            'JWT em conceito',
            'JWT (JSON Web Token) é um token com três partes separadas por pontos: cabeçalho, conteúdo (claims, como o id do usuário e a expiração) e assinatura. O servidor assina com uma chave secreta; ao receber o token, confere a assinatura sem consultar um banco, e por isso ele é chamado de "sem estado". ATENÇÃO: o conteúdo é só codificado em Base64, NÃO cifrado; qualquer pessoa lê. Nunca coloque senhas nem dados pessoais sensíveis no JWT. Riscos de uso incorreto: aceitar tokens sem verificar a assinatura ou aceitar algoritmo "none", chave secreta fraca ou no código, ausência de expiração e dificuldade de revogar um token já emitido (ele vale até expirar).'
          ),
          sl(
            'Atributos de cookie',
            'Cookies de autenticação devem usar três atributos. HttpOnly: JavaScript da página não consegue ler o cookie, o que limita roubo por XSS. Secure: o cookie só viaja por HTTPS. SameSite (Lax ou Strict): o navegador não envia o cookie em requisições originadas de outros sites, reduzindo ataques de CSRF (veja o curso de OWASP). Defina também uma expiração. Ilustrativo, não executado aqui (depende do Express).',
            `res.cookie('sid', identificadorDaSessao, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 1000 // 1 hora, em milissegundos
});`
          ),
          sl(
            'Onde guardar o token e expiração',
            'No navegador, guardar o token em localStorage deixa-o legível por qualquer JavaScript da página (um XSS o rouba); cookie HttpOnly é geralmente preferível para aplicações web. Em aplicativos móveis, use o armazenamento seguro do sistema. Tokens de acesso devem ter vida CURTA (minutos); para manter o usuário logado, usa-se um token de renovação de vida mais longa, guardado com mais cuidado e que pode ser revogado no servidor. Sempre trafegue por HTTPS. Sessão ou JWT não é questão de "melhor": para um site tradicional com um servidor, sessões costumam ser mais simples e mais fáceis de revogar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um usuário autenticado muda o id na URL de /tarefas/7 para /tarefas/8 e vê a tarefa de outra pessoa. Qual falha ocorreu?', 'd', [
          'Falha de autenticação, pois o usuário não deveria ter conseguido fazer login',
          'Falha de disponibilidade, pois o servidor entregou dados demais',
          'Falha de cifragem, pois o id deveria estar criptografado na URL',
          'Falha de autorização, pois não se verificou se a tarefa pertence ao usuário'
        ], 'O usuário está corretamente autenticado, mas faltou checar a permissão sobre o recurso. Cifrar o id não resolve; a regra de propriedade deve ser verificada no servidor.'),
        mcq('q2', 'Qual é uma vantagem da sessão com cookie sobre um JWT de longa duração?', 'c', [
          'A sessão dispensa armazenamento no servidor',
          'A sessão dispensa o uso de HTTPS e de cookies seguros',
          'O servidor pode encerrar a sessão imediatamente, apagando-a',
          'A sessão não expira, o que melhora a experiência do usuário'
        ], 'Como o estado está no servidor, logout e bloqueio são imediatos. A sessão exige armazenamento, deve usar HTTPS e deve expirar.'),
        mcq('q3', 'O que acontece com o conteúdo (payload) de um JWT assinado?', 'a', [
          'Qualquer pessoa com o token o lê; a assinatura só impede alterações',
          'Fica cifrado e só o servidor consegue ler o seu conteúdo graças à chave de assinatura',
          'É apagado automaticamente após a primeira requisição',
          'Só pode ser lido no navegador que fez o login original'
        ], 'JWT assinado não é cifrado: o conteúdo é apenas codificado, então não se coloca informação secreta nele. A assinatura garante que não foi adulterado.'),
        fill('q4', 'Complete com o atributo de cookie que impede o JavaScript da página de ler o cookie.', `res.cookie('sid', valor, { ___: true, secure: true });`, ['httpOnly', 'httponly'], 'HttpOnly esconde o cookie do JavaScript da página, dificultando seu roubo por XSS.'),
        mcq('q5', 'Qual é o efeito do atributo Secure em um cookie?', 'b', [
          'Cifra o valor do cookie com uma chave guardada no navegador',
          'Faz o navegador enviar o cookie por conexões HTTPS, e não por HTTP',
          'Impede que o servidor altere o valor do cookie depois de criado',
          'Apaga o cookie assim que a aba é fechada'
        ], 'Secure restringe o envio a HTTPS. Não cifra o valor, não impede o servidor de reenviar o cookie e a duração é controlada por expiração, não por Secure.'),
        mcq('q6', 'Qual é uma prática adequada para tokens de acesso?', 'c', [
          'Dar vida de vários anos para o usuário não precisar logar de novo',
          'Guardar no localStorage e incluir nele a senha do usuário para conferência',
          'Vida curta, com renovação controlada e revogável no servidor',
          'Gerar um token único e fixo para os usuários do sistema inteiro'
        ], 'Tokens curtos limitam o estrago em caso de roubo; renovação revogável mantém conforto. Vida longa, senha dentro do token ou token único são práticas perigosas.'),
        mcq('q7', 'Um servidor aceita JWTs sem verificar a assinatura, só decodificando o conteúdo. Qual é o risco?', 'd', [
          'Risco algum, pois o conteúdo já está cifrado dentro do token',
          'Só lentidão, já que decodificar é mais demorado que verificar',
          'O token passa a expirar antes da data escrita nele',
          'Qualquer pessoa pode fabricar um token afirmando ser outro usuário'
        ], 'Sem verificar a assinatura, o servidor confia em qualquer conteúdo, e é trivial forjar um token. O conteúdo não é cifrado e a verificação não é um custo de desempenho relevante.'),
        fill('q8', 'Qual sigla designa o token de três partes (cabeçalho, conteúdo e assinatura) discutido na lição?', `Token de acesso do tipo ___ (JSON Web Token)`, ['jwt'], 'JWT significa JSON Web Token e é composto de cabeçalho, conteúdo (claims) e assinatura.')
      ]
    },
    {
      id: 'njb-31-seguranca-basica-em-apis-node',
      title: 'Segurança básica em APIs Node',
      goal: 'Aplicar cabeçalhos com helmet, CORS correto, rate limit, limite de corpo, dependências atualizadas, erros sem vazamento e HTTPS atrás de proxy.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Camadas de defesa',
            'Segurança é feita de camadas pequenas que se somam: nenhuma sozinha basta. Esta lição junta o checklist mínimo de uma API Node: cabeçalhos de segurança, CORS, limite de requisições, limite de corpo, dependências em dia, erros sem vazamento e HTTPS. Muitos desses itens você já viu (validação, senhas, erros); aqui entram os que faltam. Para a análise profunda de cada vulnerabilidade, veja o curso de Segurança Web (OWASP). Os trechos usam pacotes de terceiros e são ilustrativos, não executados aqui.'
          ),
          sl(
            'Cabeçalhos de segurança com helmet',
            'Respostas HTTP podem carregar cabeçalhos que instruem o navegador a se proteger: Content-Security-Policy (limita de onde scripts podem carregar), X-Content-Type-Options (impede que o navegador "adivinhe" tipos de arquivo), Strict-Transport-Security (exige HTTPS) e outros. O pacote helmet define um conjunto razoável de cabeçalhos com uma linha. Ele também remove o cabeçalho que anuncia o uso do Express, escondendo uma informação inútil para o cliente e útil para quem procura versões vulneráveis. Revise as opções na documentação atual.',
            `const helmet = require('helmet');
app.use(helmet());`
          ),
          sl(
            'CORS bem configurado',
            'Navegadores bloqueiam, por padrão, que uma página de um site (origem) leia respostas de outro: é a política de mesma origem. CORS é o mecanismo pelo qual o SEU servidor diz quais origens podem. Configurar errado é comum: liberar tudo com "*" (qualquer site pode chamar a API do navegador do usuário) e, pior, refletir qualquer origem recebida junto de credenciais. O correto é uma lista explícita das origens do seu front-end. CORS NÃO é autenticação nem proteção do servidor: ele só instrui navegadores; ferramentas como o curl ignoram. Continue exigindo autenticação.',
            `const cors = require('cors');
app.use(cors({
  origin: ['https://app.exemplo.com'], // lista explicita
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));`
          ),
          sl(
            'Rate limit e limite de corpo',
            'RATE LIMIT restringe quantas requisições um cliente (por exemplo, por endereço IP) pode fazer em uma janela de tempo, respondendo 429 ao exceder. Protege contra tentativas de adivinhar senhas, raspagem e sobrecarga. Aplique limites mais rígidos em rotas sensíveis como login. O pacote express-rate-limit é um exemplo, por nome. Atrás de um proxy, configure corretamente de onde vem o IP real, senão todos aparecem com o IP do proxy. Já o LIMITE DE CORPO (express.json({ limit: "10kb" })) impede que um corpo enorme esgote memória e tempo; defina limites coerentes com o uso real.',
            `const rateLimit = require('express-rate-limit');
app.use('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use(express.json({ limit: '10kb' }));`
          ),
          sl(
            'Dependências atualizadas e erros sem vazamento',
            'Seu código é pequeno perto das dependências, e falhas conhecidas em pacotes são portas de entrada comuns. Rode regularmente npm audit (relata vulnerabilidades conhecidas), atualize com testes, remova pacotes não usados, versione o arquivo de lock e desconfie de pacotes obscuros ou com nomes parecidos com populares (typosquatting). E reforce o que vimos: erros ao cliente com mensagens genéricas, stack trace só no log, nenhum segredo ou dado pessoal nos logs, modo de produção ativado.'
          ),
          sl(
            'HTTPS atrás de proxy',
            'Em produção, o tráfego deve ser HTTPS: sem ele, senhas e tokens trafegam legíveis. É comum que o Node não termine o HTTPS: um PROXY REVERSO (Nginx, um balanceador de nuvem etc.) recebe a conexão cifrada e repassa à aplicação em HTTP numa rede interna. Nesse caso, o Express precisa saber que está atrás de um proxy (app.set("trust proxy", ...), conforme a documentação) para enxergar o protocolo e o IP reais, e os cookies Secure funcionarem. Certificados são emitidos e renovados pelo proxy ou pela plataforma; nunca guarde chaves privadas no repositório. O curso de Redes e o de OWASP aprofundam o tema.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel do pacote helmet?', 'a', [
          'Definir cabeçalhos HTTP que instruem o navegador a se proteger',
          'Limitar quantas requisições cada IP faz por minuto',
          'Cifrar o corpo de todas as respostas com uma chave do servidor e entregá-la ao navegador',
          'Autenticar usuários por meio de senha e sessão'
        ], 'helmet configura cabeçalhos de segurança. Limitar requisições é rate limit, cifrar tráfego é HTTPS e autenticação é outra camada.'),
        mcq('q2', 'Uma API usa cors com origin "*" e dados de usuários logados. O que isso significa?', 'd', [
          'Que o servidor só aceita chamadas feitas por ferramentas de linha de comando',
          'Que o navegador vai bloquear todas as chamadas, por segurança extra',
          'Que a API fica protegida contra requisições forjadas de outros sites',
          'Que páginas de qualquer origem podem ler as respostas da API a partir do navegador'
        ], 'O asterisco libera qualquer origem para ler respostas pelo navegador; o ideal é uma lista explícita. Não protege contra forjadas e não restringe a ferramentas de linha de comando.'),
        mcq('q3', 'Um colega diz: "configuramos o CORS, então só o nosso site consegue usar a API". Qual a correção?', 'b', [
          'Está correto: CORS bloqueia qualquer cliente que não esteja na lista de origens permitidas',
          'CORS só instrui navegadores; outros clientes ainda podem chamar a API',
          'Está correto, mas só se a API usar HTTPS junto do CORS',
          'Está incorreto, pois CORS é um recurso exclusivo de bancos de dados'
        ], 'CORS é aplicado pelo navegador; curl e scripts ignoram. A proteção do servidor vem de autenticação, autorização e validação.'),
        fill('q4', 'Complete com o código de status que um rate limit devolve quando o cliente excede o limite.', `res.status(___).json({ erro: { codigo: 'MUITAS_REQUISICOES' } });`, ['429'], '429 (Too Many Requests) indica que o cliente excedeu o limite de requisições.'),
        mcq('q5', 'Qual rota merece um rate limit mais rígido?', 'c', [
          'A rota que devolve a página inicial pública do site',
          'A rota que lista as imagens estáticas do logotipo',
          'A rota de login, alvo de tentativas de adivinhar senhas',
          'A rota que responde ao teste de saúde (health check)'
        ], 'Login é o alvo clássico de tentativas em massa de senhas. As outras rotas são públicas ou inofensivas.'),
        mcq('q6', 'Por que rodar npm audit e manter dependências atualizadas?', 'b', [
          'Para o código rodar mais rápido, pois versões novas aceleram o Node',
          'Porque pacotes com falhas conhecidas são portas de entrada comuns para ataques',
          'Porque o Node recusa iniciar se houver pacotes com mais de um ano',
          'Porque o audit corrige automaticamente todas as falhas do seu próprio código ao ser executado'
        ], 'Vulnerabilidades em dependências são frequentes e públicas. O audit não acelera código, o Node não bloqueia pacotes antigos e ele não corrige o seu código.'),
        mcq('q7', 'A aplicação roda atrás de um proxy reverso que termina o HTTPS. O que o Express precisa para enxergar o protocolo e o IP reais do cliente?', 'a', [
          'Ser configurado para confiar no proxy, por exemplo com trust proxy',
          'Rodar na porta 443, igual ao proxy',
          'Desativar o helmet para que o IP do cliente apareça',
          'Gravar o certificado privado dentro do repositório'
        ], 'Sem confiar no proxy, o Express vê apenas a conexão interna. Porta, helmet e guardar chaves no repositório não resolvem (a última é uma péssima prática).'),
        fill('q8', 'Complete com o pacote que costuma ser instalado para configurar cabeçalhos de segurança no Express.', `const ___ = require('helmet'); app.use(helmet());`, ['helmet'], 'O helmet é aplicado como middleware e define cabeçalhos de segurança em todas as respostas.')
      ]
    },
    {
      id: 'njb-32-lgpd-e-dados-pessoais-em-apis',
      title: 'LGPD e dados pessoais em APIs',
      goal: 'Reconhecer dados pessoais, aplicar minimização, finalidade, retenção, exclusão e mascaramento, e manter logs sem dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é dado pessoal',
            'DADO PESSOAL é qualquer informação relacionada a uma pessoa natural identificada ou identificável: nome, e-mail, CPF, telefone, endereço, localização, identificadores de dispositivos, e também combinações que permitam reconhecer alguém. Alguns dados são mais sensíveis (saúde, origem racial, convicções, biometria), com regras mais rígidas. Uma API de tarefas parece inofensiva, mas assim que tem usuários com e-mail, ela trata dados pessoais. Esta lição é uma VISÃO GERAL técnica da LGPD (Lei 13.709/2018) e não substitui orientação jurídica: para decisões reais, consulte um profissional.'
          ),
          sl(
            'Minimização e finalidade',
            'Dois princípios práticos para quem programa. FINALIDADE: colete dados para um propósito claro e informado, e use só para ele. MINIMIZAÇÃO (ou necessidade): colete só o que for realmente necessário para esse propósito. Se o login funciona com nome de usuário e senha, não peça CPF, data de nascimento e telefone "para o caso de precisar". Cada campo a mais é risco a mais em caso de vazamento e obrigação a mais de proteger. Antes de criar um campo, pergunte: para que serve? O que quebra se eu não coletar?'
          ),
          sl(
            'Retenção e exclusão',
            'Não guarde dados para sempre. Defina por quanto tempo cada dado é necessário (RETENÇÃO) e apague ou anonimize depois disso. Pessoas titulares têm direitos, entre eles acessar seus dados e pedir a eliminação em certas situações; o sistema deve estar preparado tecnicamente: saber onde estão os dados de uma pessoa (banco, backups, logs, caches, serviços de terceiros) e conseguir apagá-los. Planeje isso no projeto, não depois do pedido. Os prazos e hipóteses legais dependem do caso e devem ser definidos com orientação jurídica.'
          ),
          sl(
            'Mascaramento (executado)',
            'MASCARAR é mostrar só parte de um dado, suficiente para reconhecimento, mas inútil para uso indevido: em telas, respostas e logs. Os exemplos usam dados claramente fictícios. A função de e-mail mantém a primeira letra e o domínio; a de CPF mostra apenas três dígitos do meio. Executado de verdade com Node.',
            `function mascararEmail(email) {
  const [usuario, dominio] = email.split('@');
  if (!usuario || !dominio) return '***';
  return usuario[0] + '***@' + dominio;
}
function mascararCpf(cpf) {
  const d = cpf.replace(/\\D/g, '');
  return '***.***.' + d.slice(6, 9) + '-**';
}
console.log(mascararEmail('maria.exemplo@example.com'));
console.log(mascararEmail('invalido'));
console.log(mascararCpf('000.000.000-00'));
// saida real:
// m***@example.com
// ***
// ***.***.000-**`
          ),
          sl(
            'Logs sem dados pessoais',
            'Logs são cópias espalhadas e duradouras. Não registre senhas, tokens, corpos de requisição completos, e-mails, CPFs ou endereços. Registre identificadores internos (usuarioId: 42), códigos de erro e eventos. Se precisar de um dado pessoal para diagnóstico, registre mascarado. Defina também por quanto tempo os logs são guardados. O mesmo cuidado vale para ferramentas de monitoramento de erros, que podem capturar corpos e cabeçalhos automaticamente: configure o que elas coletam.'
          ),
          sl(
            'Segurança como obrigação',
            'A LGPD pede medidas técnicas e administrativas adequadas para proteger dados pessoais. Tudo que já vimos entra aqui: HTTPS, hash de senhas, validação, controle de acesso (cada usuário vê só os próprios dados), segredos fora do código, dependências atualizadas e logs limpos. Para exercer direitos e dar transparência, o sistema ainda precisa de processos (quem responde a uma solicitação, como se avisa sobre incidentes), que são decisões da organização, com apoio jurídico. Como desenvolvedor, seu papel é construir o sistema de modo que isso seja possível e simples.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual dos itens é um dado pessoal?', 'd', [
          'O número de requisições por minuto que o servidor recebe',
          'A versão do Node instalada no servidor de produção',
          'O tamanho em bytes de uma resposta JSON enviada',
          'O e-mail de uma pessoa cadastrada no sistema'
        ], 'E-mail identifica uma pessoa natural. As outras opções são métricas técnicas sem ligação a uma pessoa.'),
        mcq('q2', 'Uma API de tarefas só precisa de nome de usuário e senha para o login. O time quer coletar também CPF e telefone "por precaução". Qual princípio isso fere?', 'b', [
          'Disponibilidade, porque mais campos deixam o servidor lento ao responder',
          'Minimização, pois se coleta além do necessário para a finalidade',
          'Idempotência, pois repetir o cadastro duplicaria o registro',
          'Versionamento, pois novos campos exigem uma nova rota'
        ], 'Coletar dados sem necessidade clara fere a minimização e aumenta o risco em um vazamento. As outras opções tratam de assuntos diferentes.'),
        mcq('q3', 'Qual linha de log é mais adequada?', 'a', [
          '{"nivel":"info","msg":"login ok","usuarioId":42}',
          '{"nivel":"info","msg":"login ok","email":"maria.exemplo@example.com"}',
          '{"nivel":"info","corpo":{"email":"...","senha":"..."}}',
          '{"nivel":"info","msg":"CPF 000.000.000-00 validado"}'
        ], 'Um identificador interno permite rastrear sem expor dado pessoal. As outras linhas gravam e-mail, senha ou CPF em logs duráveis.'),
        fill('q4', 'Complete com o nome da técnica de mostrar só parte de um dado, como m***@example.com.', `Tecnica: ___ de dados (exibir parcialmente o valor)`, ['mascaramento', 'mascaramento de dados', 'mascarar'], 'Mascaramento exibe apenas parte do dado, reduzindo o risco de uso indevido em telas e logs.'),
        mcq('q5', 'O que significa definir uma política de retenção?', 'c', [
          'Guardar os dados por tempo indeterminado, para o caso de precisar deles',
          'Impedir que qualquer pessoa consulte os dados armazenados',
          'Determinar por quanto tempo cada dado será mantido e apagá-lo depois',
          'Cifrar o banco inteiro e descartar a chave após a gravação'
        ], 'Retenção define o prazo de guarda por finalidade e o descarte depois dele. Guardar para sempre fere a minimização; as outras ideias são outra coisa.'),
        mcq('q6', 'Qual o papel da função mascararEmail("maria.exemplo@example.com") dentro de um log de diagnóstico?', 'b', [
          'Cifrar o e-mail de forma reversível para a equipe recuperar depois',
          'Permitir reconhecer o registro sem expor o endereço completo',
          'Validar se o e-mail existe e pode receber mensagens',
          'Apagar o e-mail do banco de dados após o diagnóstico'
        ], 'Mascarar mostra só parte do dado, suficiente para ligar ao registro. Não cifra de modo reversível, não valida entrega e não apaga nada.'),
        mcq('q7', 'Uma pessoa pede a eliminação dos seus dados. O que o projeto da aplicação deve permitir tecnicamente?', 'd', [
          'Nada, pois dados já gravados não podem ser removidos',
          'Só apagar a conta visível, deixando cópias em logs e backups sem controle',
          'Apagar só o nome, mantendo e-mail e identificadores já que parecem inofensivos e o histórico de acessos',
          'Localizar onde os dados da pessoa estão e conseguir eliminá-los ou anonimizá-los'
        ], 'O sistema deve saber onde estão os dados (banco, logs, backups, terceiros) e conseguir tratá-los. Hipóteses e prazos legais exigem orientação jurídica. As demais respostas ignoram o dever ou fazem apenas parte do trabalho.'),
        fill('q8', 'Qual a sigla da lei brasileira (Lei 13.709/2018) de proteção de dados pessoais?', `Lei ___ (Lei Geral de Proteção de Dados)`, ['lgpd'], 'LGPD é a Lei Geral de Proteção de Dados Pessoais. Esta lição é visão geral e não substitui orientação jurídica.')
      ]
    },
    {
      id: 'njb-33-testes-com-node-test',
      title: 'Testes com node:test',
      goal: 'Escrever e executar testes com o runner embutido e node:assert, usar describe/it, o padrão AAA e scripts de teste no package.json.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que servem os testes automáticos',
            'Um TESTE AUTOMÁTICO é um programa que executa partes do seu código e confere se o resultado é o esperado. Rodar os testes depois de cada mudança avisa na hora se algo quebrou (regressão), dá coragem para refatorar e documenta o comportamento esperado. Sem testes, você depende de clicar manualmente em tudo, e esquece casos. O Node, em versões recentes, traz um executor de testes embutido (o módulo node:test) e um módulo de asserções (node:assert), então dá para começar sem instalar nada; confira a documentação da versão que você usa.'
          ),
          sl(
            'Asserções com node:assert',
            'Uma ASSERÇÃO afirma que algo é verdadeiro e lança um erro caso não seja; um teste falha quando uma asserção falha. Em node:assert, importe a versão estrita: require("node:assert/strict"). Funções comuns: assert.equal(a, b) (igualdade estrita no modo strict), assert.deepEqual(obj1, obj2) (compara objetos e arrays pelo conteúdo), assert.throws(fn) (a função deve lançar erro) e assert.ok(valor) (deve ser verdadeiro). Use deepEqual para objetos, pois dois objetos distintos nunca são iguais por referência.'
          ),
          sl(
            'describe, it e o padrão AAA',
            'it(nome, funcao) define um teste; describe(nome, funcao) agrupa testes relacionados. Dê nomes que descrevam o comportamento ("soma dois números"). Estruture cada teste no padrão AAA: ARRANGE (preparar os dados), ACT (executar o que está sendo testado) e ASSERT (conferir o resultado). Cada teste deve ser independente dos outros (não depender da ordem) e verificar uma coisa. Testes que dependem de relógio, rede ou aleatoriedade ficam frágeis: isole ou substitua essas partes.',
            `// soma.js
function somar(a, b) { return a + b; }
function ehPar(n) { return n % 2 === 0; }
module.exports = { somar, ehPar };

// soma.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { somar, ehPar } = require('./soma.js');
describe('soma', () => {
  it('soma dois numeros', () => {
    assert.equal(somar(2, 3), 5);
  });
  it('ehPar reconhece pares', () => {
    assert.equal(ehPar(4), true);
    assert.equal(ehPar(7), false);
  });
});`
          ),
          sl(
            'Executando de verdade',
            'Basta rodar node --test: o executor procura arquivos de teste (como os terminados em .test.js) e roda cada um. A saída abaixo é real, copiada da execução dos testes acima com Node 24 (os tempos variam a cada execução e o formato pode mudar entre versões).',
            `$ node --test
▶ soma
  ✔ soma dois numeros (0.4413ms)
  ✔ ehPar reconhece pares (0.1456ms)
✔ soma (1.3898ms)
ℹ tests 2
ℹ suites 1
ℹ pass 2
ℹ fail 0`
          ),
          sl(
            'Testar funções puras e rotas',
            'FUNÇÃO PURA é aquela cujo resultado depende só dos argumentos e que não altera nada fora: é a mais fácil de testar (somar, validarTarefa, mascararEmail). Por isso vale separar a lógica das rotas, como na lição de estrutura de projeto. Para testar uma ROTA em conceito: sobe-se a aplicação em uma porta de teste (ou usa-se uma ferramenta própria, como o pacote supertest, por nome), envia-se uma requisição e confere-se status e corpo. Para o banco, use um banco de testes separado, nunca o de produção, e nunca dados pessoais reais.'
          ),
          sl(
            'Cobertura e scripts no package.json',
            'COBERTURA mede que fração das linhas ou ramos do código foi executada pelos testes. Ajuda a achar o que não é testado, mas 100% não garante ausência de bugs: um teste sem asserção "cobre" e não confere nada. O runner do Node em versões recentes tem opção de cobertura (veja a documentação). Para padronizar, registre o comando no package.json, na seção "scripts": "test": "node --test". Assim qualquer pessoa (e a integração contínua) roda com npm test.',
            `{
  "scripts": {
    "test": "node --test"
  }
}`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz um teste ser considerado reprovado em node:test?', 'b', [
          'Imprimir qualquer mensagem no console durante a execução',
          'Lançar um erro, como uma asserção que falha',
          'Demorar mais de um milissegundo para terminar',
          'Estar dentro de um bloco describe com outros testes'
        ], 'Um teste falha quando lança um erro, e asserções lançam erro se a condição não se cumpre. Imprimir texto, demorar pouco ou estar em describe não reprova.'),
        mcq('q2', 'Qual método é apropriado para comparar dois objetos pelo conteúdo?', 'd', [
          'assert.equal(obj1, obj2), pois compara os campos um a um',
          'assert.throws(obj1, obj2), pois compara a estrutura dos dois',
          'assert.ok(obj1 === obj2), pois objetos iguais ocupam a mesma memória',
          'assert.deepEqual(obj1, obj2), que compara conteúdos recursivamente'
        ], 'deepEqual compara estruturas por conteúdo. equal estrito compara referência em objetos e ok(===) também, e throws serve para testar exceções.'),
        mcq('q3', 'No padrão AAA, qual é a ordem correta?', 'a', [
          'Preparar os dados, executar o que se testa, conferir o resultado',
          'Conferir o resultado, preparar os dados, executar o que se testa',
          'Executar, repetir três vezes e conferir só a última execução',
          'Conferir antes e depois, sem preparar os dados de forma explícita'
        ], 'Arrange, Act, Assert: preparar, agir, afirmar. As outras ordens não correspondem ao padrão.'),
        fill('q4', 'Complete com o comando que executa os testes com o runner embutido do Node.', `node --___`, ['test'], 'node --test executa os arquivos de teste com o runner embutido, em versões recentes do Node.'),
        mcq('q5', 'Por que funções puras são fáceis de testar?', 'c', [
          'Porque o Node as executa em um processo isolado automaticamente',
          'Porque elas não precisam de argumentos nem devolvem valores',
          'Porque o resultado depende só dos argumentos, sem efeitos externos',
          'Porque a cobertura de testes de funções puras é de 100%'
        ], 'Com resultado dependente só da entrada e sem efeitos colaterais, basta chamar e comparar. As outras explicações são falsas ou irrelevantes.'),
        mcq('q6', 'Um teste de rota grava dados no banco real de produção para "ver se funciona". O que há de errado?', 'd', [
          'Nada, pois testes devem usar o ambiente mais parecido com o real possível',
          'Só o desempenho, porque o banco de produção é mais lento que o de teste',
          'O problema é que testes de rota não podem acessar bancos de dados',
          'Pode corromper dados reais; o certo é um banco de testes com dados fictícios'
        ], 'Testes devem rodar em ambiente separado e com dados fictícios, para não alterar produção nem tratar dados pessoais reais. Testes de rota podem usar banco de testes.'),
        mcq('q7', 'Uma equipe tem 100% de cobertura, mas muitos testes não têm nenhuma asserção. Qual conclusão é correta?', 'a', [
          'A cobertura mostra que o código foi executado, não que o resultado foi conferido',
          'O código está livre de bugs, porque todas as linhas foram executadas',
          'Os testes sem asserção falham automaticamente e protegem o código',
          'A cobertura só vale quando é calculada manualmente por quem escreveu o código'
        ], 'Cobertura mede execução, não verificação. Testes sem asserção passam sem conferir nada, então 100% não prova ausência de bugs.'),
        fill('q8', 'Complete com o nome do módulo nativo de asserções usado nos exemplos (parte depois de node:).', `const assert = require('node:___/strict');`, ['assert'], 'node:assert/strict fornece as asserções com comparações estritas.')
      ]
    },
    {
      id: 'njb-34-debug-e-logs',
      title: 'Depuração e logs',
      goal: 'Depurar com console.log e debugger, usar --inspect, níveis de log, evitar registrar dados sensíveis e ler stack traces.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'console.log x debugger',
            'Depurar é achar a causa de um comportamento errado. O jeito mais simples é console.log: imprime valores em pontos do código. Funciona, mas obriga a editar o código, reexecutar e depois limpar os logs. O DEBUGGER (depurador) permite pausar o programa em uma linha (ponto de interrupção, breakpoint), inspecionar variáveis, avançar passo a passo e ver a pilha de chamadas. Para problemas simples, console.log basta; para fluxos complexos, o depurador poupa muito tempo. Cuidado: logs de depuração esquecidos no código podem vazar dados em produção.'
          ),
          sl(
            'Depurador do Node: --inspect e VS Code',
            'O Node inclui um protocolo de inspeção: ao iniciar com node --inspect app.js, o processo abre uma porta de depuração local, à qual se conectam ferramentas como o DevTools do Chrome e o Visual Studio Code. No VS Code, é possível iniciar uma sessão de depuração a partir do editor, colocar breakpoints clicando ao lado das linhas e avançar com os botões de passo. Também existe a instrução debugger; no código, que pausa a execução quando um depurador está conectado (sem depurador, não faz nada). SEGURANÇA: nunca exponha a porta de inspeção à rede nem a ative em produção: ela permite executar código no processo.'
          ),
          sl(
            'Níveis de log',
            'Um LOG organizado usa NÍVEIS para separar importância: debug (detalhes para desenvolvimento), info (eventos normais), aviso/warn (algo estranho, mas o sistema segue) e erro (falha que precisa de atenção). Define-se um nível mínimo por ambiente: em produção, normalmente info ou acima; em desenvolvimento, debug. Também ajuda registrar em formato estruturado (JSON, uma linha por evento), que ferramentas conseguem filtrar e pesquisar. Bibliotecas como pino e winston, por nome, oferecem isso pronto. O exemplo abaixo, só com módulos nativos, foi executado.',
            `const nivel = { debug: 10, info: 20, aviso: 30, erro: 40 };
const minimo = nivel[process.env.NIVEL_LOG] ?? nivel.info;
function log(n, msg, extra = {}) {
  if (nivel[n] < minimo) return;
  console.log(JSON.stringify({ nivel: n, msg, ...extra }));
}
log('debug', 'detalhe interno');
log('info', 'tarefa criada', { tarefaId: 7 });
log('erro', 'falha ao gravar arquivo', { codigo: 'EACCES' });`
          ),
          sl(
            'Saída real com e sem filtro',
            'Executado de verdade. Sem NIVEL_LOG, o mínimo é info, então a linha debug some. Com NIVEL_LOG=erro, só a de erro aparece. Repare que as linhas contêm só identificadores e códigos, nenhum dado pessoal.',
            `$ node pool.js
{"nivel":"info","msg":"tarefa criada","tarefaId":7}
{"nivel":"erro","msg":"falha ao gravar arquivo","codigo":"EACCES"}

$ NIVEL_LOG=erro node pool.js
{"nivel":"erro","msg":"falha ao gravar arquivo","codigo":"EACCES"}`
          ),
          sl(
            'O que NÃO logar',
            'Nunca registre: senhas (nem erradas, pois podem ser quase corretas), tokens e chaves de API, cabeçalhos de autorização e cookies, corpos de requisição inteiros, números de cartão e dados pessoais como CPF, e-mail e endereço completos (veja a lição de LGPD). Prefira identificadores internos e códigos de erro. Lembre que erros de bibliotecas podem trazer a consulta ou o corpo dentro da mensagem: trate e filtre antes de registrar. Logs são cópias duradouras e acessíveis a muita gente.'
          ),
          sl(
            'Lendo um stack trace',
            'Quando um erro não é tratado, o Node imprime o STACK TRACE: a pilha de chamadas no momento do erro, da mais recente (topo) para a mais antiga. Leia de cima para baixo: a primeira linha traz o tipo e a mensagem do erro; as linhas seguintes mostram, cada uma, função, arquivo, linha e coluna. Comece pela primeira linha que aponta para o SEU código (e não para node_modules ou módulos internos do Node). Abaixo, uma saída real de um erro lançado dentro de ler(), chamada por chamar() (caminhos abreviados). Lembre: stack trace é para o log do servidor, nunca para o cliente.',
            `Error: falha de exemplo
    at ler (err.js:1:24)
    at chamar (err.js:2:21)
    at Object.<anonymous> (err.js:3:7)`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual vantagem do depurador sobre console.log em um fluxo complexo?', 'd', [
          'O depurador é executado mais rápido e dispensa o uso de testes',
          'O depurador substitui qualquer necessidade de registrar logs em produção e monitorar o sistema',
          'O depurador impede a ocorrência de erros ao pausar o código',
          'Permite pausar numa linha e inspecionar variáveis e a pilha sem editar o código'
        ], 'Com breakpoints se inspeciona o estado sem alterar o código. Não acelera o programa, não substitui logs de produção e não evita erros.'),
        mcq('q2', 'Qual cuidado é essencial com node --inspect?', 'a', [
          'Não expor a porta de inspeção à rede nem usá-la em produção',
          'Usá-lo em produção para monitorar o servidor',
          'Reiniciar o computador depois de cada sessão de depuração',
          'Desativar o HTTPS enquanto o depurador estiver conectado'
        ], 'A porta de inspeção permite executar código no processo; exposta, é um risco grave. As demais ideias não têm relação ou agravam o problema.'),
        mcq('q3', 'Em produção, a configuração mínima de log é info. O que acontece com uma chamada log("debug", ...)?', 'c', [
          'É convertida em uma mensagem de erro e impressa',
          'Causa a parada do programa, pois o nível é inválido e o processo encerra',
          'É descartada, pois o nível debug é menor que o mínimo configurado',
          'É enviada ao cliente na resposta HTTP junto do corpo'
        ], 'Níveis abaixo do mínimo são ignorados. Não vira erro, não para o programa e logs nunca devem ir ao cliente.'),
        fill('q4', 'Complete com o método de console usado para imprimir o nível de erro.', `console.___('falha ao gravar arquivo');`, ['error'], 'console.error escreve na saída de erro, usada para mensagens de falha.'),
        mcq('q5', 'Um desenvolvedor registra o corpo inteiro das requisições de login "para depurar". Qual é o problema?', 'b', [
          'O corpo é grande demais e o console.log não aceita objetos',
          'Senhas e dados pessoais ficam gravados em logs duráveis',
          'O formato JSON não pode ser escrito em arquivos de log',
          'O corpo chega vazio em requisições de login'
        ], 'O corpo de login contém a senha; registrá-la cria uma cópia insegura e duradoura. console.log aceita objetos e JSON pode ser logado.'),
        mcq('q6', 'Ao ler um stack trace, por onde começar a investigação?', 'c', [
          'Pela última linha, que é a causa original do erro',
          'Pela linha mais antiga dentro de node_modules',
          'Pela primeira linha que aponta para o seu código, a partir do topo',
          'Pelo número da coluna, ignorando nome de arquivo e função'
        ], 'O topo é onde o erro aconteceu; a primeira linha no seu código costuma ser o melhor ponto de partida. A última linha é o ponto de partida do programa e node_modules costuma não ser a origem.'),
        mcq('q7', 'Qual é a vantagem de logs estruturados em JSON, uma linha por evento?', 'd', [
          'Ocupam menos espaço do que texto livre em qualquer cenário de uso',
          'Dispensam definir níveis de log e filtros por ambiente',
          'Cifram automaticamente os dados pessoais incluídos nas mensagens',
          'Ferramentas conseguem filtrar e pesquisar campos de forma automática'
        ], 'Formato estruturado facilita busca e filtro. Não garante menor tamanho, não dispensa níveis e não cifra nada.'),
        fill('q8', 'Complete com o nome da instrução que pausa a execução quando um depurador está conectado.', `___; // pausa quando ha depurador conectado`, ['debugger'], 'A instrução debugger; funciona como um breakpoint no código quando há depurador conectado.')
      ]
    },
    {
      id: 'njb-35-estrutura-de-projeto',
      title: 'Estrutura de projeto',
      goal: 'Separar rotas, controladores, serviços e acesso a dados, isolar configuração e entender por que organizar o código facilita testes e manutenção.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que separar em camadas',
            'Num projeto pequeno, tudo em um arquivo funciona. Conforme cresce, misturar leitura da requisição, regras de negócio e consultas ao banco no mesmo lugar torna o código difícil de ler, de testar e de mudar: trocar o banco obrigaria mexer em todas as rotas. A solução é separar em CAMADAS, cada uma com uma responsabilidade única. Não existe uma estrutura oficial obrigatória; o importante é ter um padrão claro e consistente para a equipe.'
          ),
          sl(
            'As camadas e suas responsabilidades',
            'ROTAS: ligam método e caminho a um controlador (e aplicam middlewares como autenticação e validação). CONTROLADOR: traduz HTTP; lê req, chama o serviço e escolhe status e resposta; não contém regra de negócio. SERVIÇO: guarda as regras do domínio ("uma tarefa concluída não pode ser editada"), sem saber nada de HTTP (não usa req nem res). ACESSO A DADOS (repositório): único lugar que fala com o banco ou arquivo, com consultas parametrizadas. Regra de ouro: a dependência vai em um sentido (rota, controlador, serviço, dados); camadas de baixo não conhecem as de cima.'
          ),
          sl(
            'Exemplo de árvore de pastas',
            'Uma organização comum para uma API de tarefas, com a configuração isolada e os testes ao lado do que testam. Os nomes das pastas variam entre equipes; o que importa é a separação de responsabilidades. O arquivo de entrada (index.js ou server.js) apenas lê a configuração, monta a aplicação e escuta a porta.',
            `api-tarefas/
  package.json
  .gitignore
  .env.exemplo
  src/
    index.js            (entrada: liga o servidor)
    app.js              (monta middlewares e rotas)
    config.js           (le e valida variaveis de ambiente)
    rotas/
      tarefas.rotas.js
    controladores/
      tarefas.controlador.js
    servicos/
      tarefas.servico.js
    dados/
      tarefas.repositorio.js
    middlewares/
      autenticacao.js
      erros.js
  test/
    tarefas.servico.test.js`
          ),
          sl(
            'Um fluxo de ponta a ponta',
            'Siga uma chamada POST /tarefas. A ROTA aplica o middleware de validação e encaminha ao controlador. O CONTROLADOR lê req.body, chama servico.criar(dados) e responde 201 com o resultado. O SERVIÇO confere regras (limite de tarefas por usuário) e chama o repositório. O REPOSITÓRIO executa a inserção parametrizada. Se algo falha, o erro sobe até o middleware de erros. Ilustrativo, não executado aqui; repare que o serviço é uma função comum, testável com node:test sem subir servidor.',
            `// controladores/tarefas.controlador.js
async function criar(req, res) {
  const tarefa = await servico.criar(req.usuario.id, req.body);
  res.status(201).json(tarefa);
}

// servicos/tarefas.servico.js (sem req/res)
async function criar(usuarioId, dados) {
  return repositorio.inserir({ usuarioId, titulo: dados.titulo });
}`
          ),
          sl(
            'Arquivo de entrada e app separados',
            'Separar app.js (monta a aplicação e a exporta) de index.js (chama listen na porta) tem uma vantagem: os testes importam o app sem abrir uma porta de verdade. A configuração fica em config.js, validada na partida (lição 24); nenhum outro arquivo lê process.env diretamente. Isso evita que valores espalhados virem uma fonte de bugs e vazamentos.'
          ),
          sl(
            'Armadilhas e equilíbrio',
            'Camadas demais para um projeto minúsculo viram burocracia; camadas de menos viram um arquivo de mil linhas. Comece simples e separe quando a dor aparecer, mantendo alguns sinais de alerta: controlador com consulta ao banco, serviço usando req/res, e import circular (dois arquivos que se importam mutuamente). Organize por funcionalidade (pasta tarefas com rota, controlador e serviço juntos) ou por tipo técnico (como acima): ambos são válidos; escolha um e seja consistente. Nomes claros valem mais que padrões sofisticados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a responsabilidade do controlador em uma API em camadas?', 'a', [
          'Traduzir HTTP: ler a requisição, chamar o serviço e escolher a resposta',
          'Executar as consultas ao banco de dados com SQL parametrizado',
          'Guardar as regras de negócio e decidir o que é permitido no domínio',
          'Ler as variáveis de ambiente e validar a configuração da aplicação'
        ], 'O controlador é a ponte com HTTP. Consultas ficam no acesso a dados, regras no serviço e configuração em config.js.'),
        mcq('q2', 'Por que o serviço não deve usar req nem res?', 'c', [
          'Porque o Express não permite acessar req e res fora das rotas de forma nenhuma',
          'Porque req e res são objetos criados só durante testes',
          'Para ficar independente de HTTP e ser testável como função comum',
          'Porque req e res só existem para a camada de acesso a dados'
        ], 'Sem depender de HTTP, o serviço é testável sem subir servidor e reutilizável (por exemplo, em um script). O Express permite passar req e res a funções, mas isso acopla as camadas.'),
        mcq('q3', 'Um controlador executa diretamente db.query com SQL. Qual problema isso gera?', 'd', [
          'Problema algum, pois controladores existem justamente para falar com o banco',
          'A consulta deixa de ser parametrizada obrigatoriamente',
          'O Node recusa executar consultas fora da pasta de dados',
          'Mistura responsabilidades, dificultando testes e a troca do banco'
        ], 'O acesso a dados deve ficar em um só lugar. Consultas podem ser parametrizadas em qualquer camada, e o Node não impõe estrutura de pastas.'),
        fill('q4', 'Complete com o nome da camada que fala com o banco de dados, também chamada de repositório.', `Camada de acesso a ___ (repositorio)`, ['dados'], 'A camada de acesso a dados concentra consultas ao banco ou arquivo, num único lugar.'),
        mcq('q5', 'Qual vantagem de separar app.js (monta a aplicação) de index.js (chama listen)?', 'b', [
          'Faz a aplicação iniciar mais rápido em qualquer máquina',
          'Os testes podem importar o app sem abrir uma porta de rede',
          'Impede que a aplicação receba requisições de outros computadores',
          'Dispensa o uso de variáveis de ambiente para a porta'
        ], 'Exportar o app sem chamar listen permite testar sem ocupar porta. Não altera a velocidade, a abertura à rede nem a configuração.'),
        mcq('q6', 'Qual sinal indica estrutura problemática no projeto?', 'd', [
          'Ter um arquivo config.js que lê e valida as variáveis de ambiente',
          'Ter testes em uma pasta separada, ao lado do que testam',
          'Usar nomes claros de arquivos e pastas, repetidos em todas as funcionalidades',
          'Um serviço que lê req.body e chama res.json diretamente'
        ], 'Serviço usando req/res está acoplado a HTTP e mistura camadas. As outras opções são boas práticas.'),
        mcq('q7', 'Uma equipe pequena discute se organiza pastas por funcionalidade ou por tipo técnico. Qual orientação da lição se aplica?', 'a', [
          'Ambos são válidos; escolha um padrão e mantenha a consistência',
          'A organização por tipo técnico é a única aceita pelo Node',
          'A organização por funcionalidade é a única que evita erros de segurança',
          'Nenhuma organização funciona e todo código deve ficar em um arquivo'
        ], 'Não há estrutura oficial obrigatória; consistência e clareza importam. O Node não impõe estrutura e nenhuma delas garante segurança sozinha.'),
        fill('q8', 'Complete com o nome da camada que concentra as regras de negócio e não conhece HTTP.', `Camada de ___: regras do dominio, sem req nem res`, ['serviço', 'servico', 'serviços', 'servicos'], 'O serviço guarda as regras do domínio e fica independente de HTTP.')
      ]
    },
    {
      id: 'njb-36-git-e-boas-praticas',
      title: 'Git e boas práticas de projeto',
      goal: 'Usar .gitignore, commits pequenos, lockfile versionado, README, scripts úteis e conhecer lint e formatação (ESLint, Prettier).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que o Git versiona (e o que não)',
            'Git guarda o histórico do código: cada commit é uma foto nomeada das mudanças. Um projeto Node tem arquivos que NÃO devem ir ao repositório. O arquivo .gitignore lista padrões que o Git ignora: node_modules/ (centenas de megabytes, recriável com npm install), .env (segredos), arquivos de log, pastas de build e arquivos do sistema ou do editor. Se um arquivo já foi commitado antes de entrar no .gitignore, o Git continua rastreando: é preciso removê-lo do índice, e, se continha um segredo, trocar o segredo.',
            `# .gitignore
node_modules/
.env
*.log
dist/
.DS_Store`
          ),
          sl(
            'Commits pequenos e mensagens claras',
            'Faça commits PEQUENOS e FOCADOS: uma mudança lógica por commit (adicionar a rota, corrigir o bug). Facilita revisar, localizar quando um erro surgiu e desfazer só o que for preciso. A mensagem deve dizer o que e por quê, no imperativo ou de forma clara: "Valida o corpo de POST /tarefas". Evite "ajustes" e "mudanças". Antes de commitar, confira o que está sendo incluído (git status e git diff) para não levar segredos, dados pessoais reais ou arquivos temporários por engano.'
          ),
          sl(
            'package.json e o lockfile',
            'O package.json lista as dependências com faixas de versão. O arquivo de lock (package-lock.json no npm) registra as versões EXATAS instaladas, de modo que todos (você, colegas, servidor de produção) obtenham o mesmo conjunto. Por isso o lockfile DEVE ser versionado; node_modules, não. Ao instalar em integração contínua ou deploy, o comando npm ci instala exatamente o que o lock descreve e falha se houver divergência, tornando o resultado reproduzível. Evite editar o lock à mão.'
          ),
          sl(
            'README e scripts úteis',
            'O README.md é a porta de entrada: o que o projeto faz, como instalar, quais variáveis de ambiente configurar (aponte para o .env.exemplo), como rodar, testar e fazer deploy. Quem chega novo deve conseguir iniciar o projeto só com ele. Registre comandos comuns na seção "scripts" do package.json, para todos usarem o mesmo atalho: npm start, npm test, npm run lint. Ilustrativo, não executado aqui.',
            `{
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node --test",
    "lint": "eslint ."
  }
}`
          ),
          sl(
            'Lint e formatação: ESLint e Prettier',
            'Um LINTER analisa o código sem executá-lo e aponta problemas: variáveis não usadas, comparações suspeitas, possíveis bugs. O mais usado em JavaScript é o ESLint. Um FORMATADOR padroniza o estilo (aspas, espaços, quebras de linha) automaticamente; o Prettier é o exemplo mais conhecido. Juntos eliminam discussões de estilo em revisões e pegam erros cedo. São pacotes de terceiros, configurados por arquivos no projeto e executados por scripts; consulte a documentação atual. Idealmente rodam também na integração contínua, junto dos testes.'
          ),
          sl(
            'Higiene de segurança no repositório',
            'O repositório é para o código, não para segredos nem dados reais. Nunca commite .env, chaves privadas, tokens, dumps de banco com dados de pessoas ou logs com dados pessoais. Se algo assim vazar, apagar no commit seguinte NÃO basta: o histórico guarda. Revogue e troque o segredo; para dados pessoais, avalie as providências com a equipe responsável e orientação jurídica. Mantenha dependências atualizadas e, se o repositório for público, revise duas vezes antes de cada push.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual par de itens deve constar no .gitignore de um projeto Node?', 'c', [
          'package.json e package-lock.json',
          'README.md e .env.exemplo',
          'node_modules/ e .env',
          'src/ e test/'
        ], 'node_modules é recriável e .env guarda segredos. package.json, lockfile, README, .env.exemplo, código e testes devem ser versionados.'),
        mcq('q2', 'Por que o package-lock.json deve ser versionado?', 'b', [
          'Para o repositório ficar com o mesmo tamanho de node_modules',
          'Para que cada pessoa e cada ambiente instalem exatamente as mesmas versões das dependências',
          'Para que o Git deixe de ignorar o arquivo .env automaticamente',
          'Para tornar desnecessário o arquivo package.json no projeto'
        ], 'O lock fixa versões exatas e dá reprodutibilidade. Não tem relação com tamanho, com o .env nem substitui o package.json.'),
        mcq('q3', 'Uma chave de API foi commitada e no commit seguinte o arquivo foi apagado. O que fazer?', 'a', [
          'Revogar e trocar a chave, pois o histórico do Git ainda a contém',
          'Nada, pois o commit de remoção torna a chave inacessível',
          'Reescrever a mensagem do commit para esconder o motivo da alteração',
          'Adicionar o arquivo ao .gitignore e considerar o assunto resolvido'
        ], 'O histórico preserva o conteúdo; a chave deve ser tratada como comprometida. O .gitignore não apaga o que já foi commitado.'),
        fill('q4', 'Complete com o comando que instala exatamente as versões descritas no lockfile, usado em integração contínua.', `npm ___`, ['ci'], 'npm ci instala conforme o lockfile e falha se houver divergência, garantindo reprodutibilidade.'),
        mcq('q5', 'Qual mensagem de commit é mais útil?', 'd', [
          'ajustes',
          'mudanças gerais no projeto',
          'corrigindo coisas que deram errado na semana passada, conforme combinado',
          'Valida o corpo de POST /tarefas com limite de título'
        ], 'Uma boa mensagem diz o que mudou e onde. As outras são vagas e não ajudam a revisar nem a localizar problemas depois.'),
        mcq('q6', 'Qual a diferença entre um linter e um formatador?', 'c', [
          'O linter reformata o código e o formatador executa os testes',
          'O linter só funciona com TypeScript e o formatador só com JavaScript',
          'O linter aponta problemas e possíveis bugs; o formatador padroniza o estilo',
          'São o mesmo tipo de ferramenta, usadas com nomes distintos'
        ], 'O linter analisa qualidade e possíveis erros (como o ESLint); o formatador padroniza estilo (como o Prettier). Nenhum deles roda testes.'),
        mcq('q7', 'Um colega novo não consegue iniciar o projeto. Qual item é o mais útil para resolver o problema de forma permanente?', 'b', [
          'Enviar o arquivo .env real do projeto por mensagem para ele e pedir sigilo sobre ele',
          'Um README claro com instalação, variáveis (via .env.exemplo) e comandos',
          'Commitar o node_modules para que ele não precise instalar nada',
          'Pedir que ele apague o package.json e reconstrua o projeto sozinho'
        ], 'README e .env.exemplo documentam sem expor segredos. Enviar .env real espalha segredos, e commitar node_modules é má prática.'),
        fill('q8', 'Complete com o nome do arquivo que lista o que o Git deve ignorar.', `Arquivo ___ : lista padroes de arquivos ignorados pelo Git`, ['.gitignore', 'gitignore'], 'O .gitignore define quais arquivos e pastas o Git não deve rastrear.')
      ]
    },
    {
      id: 'njb-37-revisao-projeto-api-de-tarefas',
      title: 'Revisão: projetando uma API de tarefas',
      goal: 'Integrar rotas, validação, erros, configuração, segurança e testes no projeto de uma API de tarefas, tomando decisões de projeto.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O projeto e seus requisitos',
            'Vamos revisar o nível com um projeto integrado: uma API de tarefas pessoais. Cada pessoa tem sua conta (nome de usuário e senha, sem coletar e-mail ou outros dados), cria, lista, atualiza e remove as PRÓPRIAS tarefas. Requisitos de qualidade: validar entrada, devolver erros padronizados, ler configuração do ambiente, proteger senhas e rotas, registrar logs sem dados pessoais e ter testes. O objetivo não é código novo, e sim decidir bem: o que vai em cada lugar e por quê. Tudo aqui é desenho, ilustrativo e não executado.'
          ),
          sl(
            'Rotas e verbos',
            'Recursos no plural, ação no verbo. POST /v1/usuarios (cadastro), POST /v1/sessoes (login), GET /v1/tarefas (lista as do usuário logado, com paginação limitada), POST /v1/tarefas (cria, 201), GET /v1/tarefas/:id (lê uma), PATCH /v1/tarefas/:id (altera campos permitidos), DELETE /v1/tarefas/:id (204). A versão no caminho permite evoluir sem quebrar clientes. Note que o dono NÃO vem na URL nem no corpo: vem da identidade autenticada (req.usuario), para que ninguém indique outro dono.',
            `POST   /v1/usuarios
POST   /v1/sessoes
GET    /v1/tarefas?pagina=1&limite=20
POST   /v1/tarefas
GET    /v1/tarefas/:id
PATCH  /v1/tarefas/:id
DELETE /v1/tarefas/:id`
          ),
          sl(
            'Entrada, erros e autorização',
            'Cada rota passa por validação antes do controlador: tipos, tamanhos e listas de permissão; falha vira 400 com o formato de erro padronizado. Consultas ao banco são parametrizadas e SEMPRE filtram por dono: WHERE id = $1 AND usuario_id = $2. Se a tarefa não existe OU é de outro usuário, a resposta é 404 (não revela a existência). Erros inesperados caem no middleware de erro: 500 genérico ao cliente, detalhe no log. Rotas de tarefas exigem o middleware de autenticação; o login tem rate limit rígido.'
          ),
          sl(
            'Senhas, sessão e configuração',
            'Senhas guardadas com hash lento e salt (scrypt, argon2 ou bcrypt), conferidas em tempo constante; a mensagem de login falho é única e genérica. A sessão usa cookie HttpOnly, Secure e SameSite, com expiração curta, ou token de vida curta. Configuração (porta, banco, chave de assinatura) vem de variáveis de ambiente, validada na partida; o repositório só contém .env.exemplo, e .env fica no .gitignore. Segredos jamais aparecem em logs, respostas de erro ou no código.'
          ),
          sl(
            'Segurança e privacidade do conjunto',
            'Camadas: helmet, CORS com lista explícita, limite de corpo, rate limit, HTTPS terminado em proxy com trust proxy configurado, dependências auditadas e lockfile versionado. Privacidade: minimização (só nome de usuário e senha), logs com identificadores (usuarioId) e nunca senha, e uma rota de exclusão de conta que apaga as tarefas do usuário, prevendo também onde mais há cópias (logs, backups). É visão geral técnica; decisões legais exigem orientação jurídica.'
          ),
          sl(
            'Testes e estrutura',
            'Estrutura em camadas (rotas, controladores, serviços, dados) com app.js separado de index.js. Testes com node:test: funções puras de validação e regras do serviço testadas diretamente (rápido); rotas testadas em conceito com o app em porta de teste e banco de testes com dados fictícios. Cobertura ajuda a achar lacunas, mas não prova ausência de bugs. O script npm test roda tudo e entra na integração contínua junto de lint e npm audit. As questões a seguir pedem decisões de projeto sobre este cenário.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na rota POST /v1/tarefas, de onde deve vir o dono da nova tarefa?', 'd', [
          'Do corpo da requisição, em um campo usuarioId enviado pelo cliente',
          'Da query string, para facilitar o uso da API por outros sistemas',
          'Do parâmetro de rota, repetindo o id do usuário no caminho',
          'Da identidade autenticada guardada em req.usuario'
        ], 'O dono vem da autenticação, não do que o cliente informa; se viesse do corpo, qualquer um criaria tarefas para outra pessoa.'),
        mcq('q2', 'GET /v1/tarefas/42 pede uma tarefa que pertence a outro usuário. Qual a resposta mais segura?', 'b', [
          '403 com a mensagem "esta tarefa pertence ao usuário joao"',
          '404, tratando como inexistente para não revelar a existência',
          '200 com os dados, já que o usuário está autenticado',
          '500, pois a consulta falhou ao cruzar usuários diferentes'
        ], 'Filtrar por dono e responder 404 evita confirmar que o recurso existe e não vaza informação. Mostrar o dono, devolver os dados ou 500 estão errados.'),
        mcq('q3', 'Qual consulta é correta para buscar a tarefa do usuário logado?', 'c', [
          'SELECT * FROM tarefas WHERE id = " + req.params.id + "',
          'SELECT * FROM tarefas WHERE id = $1, filtrando por dono só no front-end da aplicação',
          'SELECT * FROM tarefas WHERE id = $1 AND usuario_id = $2, valores à parte',
          'SELECT * FROM tarefas, filtrando depois com find em JavaScript sem limite'
        ], 'Consulta parametrizada e filtro por dono no próprio SQL. Concatenar é injeção, filtro só no front-end é contornável e trazer tudo para filtrar no código expõe dados e desperdiça recursos.'),
        fill('q4', 'Complete com a camada onde fica a regra "limite de tarefas por usuário", sem depender de HTTP.', `Regra de negocio fica na camada de ___`, ['serviço', 'servico', 'serviços', 'servicos'], 'Regras de domínio ficam no serviço, que não conhece req nem res.'),
        mcq('q5', 'Qual dado pessoal a API de tarefas deve coletar no cadastro, segundo a minimização?', 'a', [
          'O necessário para o login: nome de usuário e senha (com hash)',
          'Nome completo, CPF e telefone, para eventuais usos futuros',
          'Endereço e data de nascimento, para personalizar a experiência',
          'Qualquer dado possível, desde que o usuário aceite os termos'
        ], 'Minimização coleta só o necessário para a finalidade. Campos extras aumentam risco e obrigações.'),
        mcq('q6', 'Em produção, um bug causa TypeError dentro do serviço. O que o cliente e o log devem receber?', 'c', [
          'Cliente: stack trace; log: nada, para economizar espaço',
          'Cliente: a mensagem do TypeError; log: só o status 200 da resposta enviada',
          'Cliente: 500 genérico no formato padrão; log: detalhe e stack trace',
          'Cliente: 404; log: o corpo completo da requisição com a senha'
        ], 'Cliente recebe erro genérico e o detalhe fica no log interno, sem dados pessoais. Expor a pilha vaza informação e logar senha é grave.'),
        mcq('q7', 'Qual conjunto de medidas protege melhor o endpoint de login?', 'd', [
          'Mensagem específica para cada falha e limite de corpo desativado',
          'Armazenar a senha em texto e restringir o login por CORS "*"',
          'HTTPS, sem outras medidas, pois ele resolve o risco do login',
          'Rate limit rígido, hash lento com comparação em tempo constante e mensagem genérica'
        ], 'Combinar limite de tentativas, hash lento e mensagem genérica reduz adivinhação e vazamento de informação. HTTPS é necessário, mas insuficiente; CORS não protege o servidor.'),
        fill('q8', 'Complete com o comando de script do package.json que executa os testes da API.', `npm ___`, ['test'], 'npm test executa o script test do package.json, que roda node --test.')
      ]
    },
    {
      id: 'njb-38-como-continuar-estudando',
      title: 'Como continuar estudando',
      goal: 'Conhecer as próximas trilhas do curso, projetos práticos, fontes oficiais, comunidades e como evitar conteúdo desatualizado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde você chegou',
            'Ao concluir o nível iniciante você entende o que é Node e seu modelo assíncrono, domina o JavaScript essencial, usa módulos, npm e módulos nativos, sabe montar uma API com Express (rotas, middlewares, validação, erros), conhece conceitos de banco de dados, autenticação, segurança, LGPD e testes e sabe organizar um projeto. Isso é a base para trabalhar como desenvolvedor back-end júnior. O próximo passo não é ler mais teoria sozinha: é construir coisas e aprofundar com método.'
          ),
          sl(
            'Trilha intermediária deste curso',
            'O nível intermediário aprofunda o que você já usou: streams e buffers para dados grandes, trabalho com bancos reais e migrações, autenticação completa, testes de integração, processos filhos e worker threads, clustering, comunicação em tempo real (WebSockets), filas e tarefas em segundo plano, documentação de API e boas práticas de projeto. Faça-o depois de ter pelo menos um projeto próprio funcionando; os conceitos fixam muito melhor quando você já sentiu a dor que eles resolvem.'
          ),
          sl(
            'Trilha avançada deste curso',
            'O nível avançado trata de desempenho e diagnóstico (perfis, vazamentos de memória, o loop de eventos sob carga), arquitetura (modularização, eventos, microsserviços e quando NÃO usá-los), observabilidade (logs estruturados, métricas, rastreamento), segurança em profundidade, implantação (contêineres, proxy reverso, integração e entrega contínuas) e extensibilidade. Ele assume experiência prática; se um tópico parecer abstrato, volte a um projeto e experimente.'
          ),
          sl(
            'Projetos práticos para praticar',
            'Aprende-se programando. Sugestões em ordem de dificuldade: (1) a API de tarefas da lição anterior, completa e com testes; (2) um encurtador de links com limite de acessos; (3) uma API de notas com autenticação e paginação; (4) um bot ou ferramenta de linha de comando que lê arquivos e gera relatórios; (5) um pequeno sistema com fila de tarefas e envio de notificações simuladas. Use SEMPRE dados fictícios, nunca dados pessoais reais de ninguém, e nunca teste ferramentas contra sistemas de terceiros sem autorização.'
          ),
          sl(
            'Fontes confiáveis e comunidades',
            'A documentação oficial do Node (nodejs.org), a do MDN Web Docs para JavaScript e a de cada pacote que você usar são as fontes mais confiáveis e atualizadas: aprenda a LER a documentação, não só tutoriais. Os guias oficiais do Node cobrem tópicos práticos. Para dúvidas, comunidades de desenvolvedores (fóruns, grupos, o Stack Overflow, repositórios no GitHub) são úteis, desde que você pesquise antes, mostre um exemplo mínimo reproduzível, e nunca cole segredos ou dados pessoais nas perguntas. Ler código de projetos abertos também ensina muito.'
          ),
          sl(
            'Como evitar tutoriais desatualizados',
            'O ecossistema muda rápido. Antes de seguir um tutorial, olhe a data, a versão do Node e dos pacotes usados e se os comandos ainda existem na documentação atual. Sinais de alerta: uso de APIs marcadas como obsoletas, dependências abandonadas, práticas inseguras (senhas em texto, SQL concatenado, segredos no código). Prefira o conceito ao truque: o que é estável (HTTP, segurança, modelo assíncrono) vale mais que o comando do momento. Quando a documentação oficial e um tutorial divergirem, confie na documentação da versão que você usa. E mantenha o hábito de atualizar dependências com testes.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a fonte mais confiável e atualizada para saber como uma função do Node funciona?', 'd', [
          'Um vídeo antigo com muitas visualizações e sem data de publicação',
          'Um post de blog sem indicação da versão do Node utilizada',
          'Uma resposta de fórum encontrada por uma busca rápida e sem testar',
          'A documentação oficial da versão do Node que você usa'
        ], 'A documentação oficial acompanha a versão e é a referência autoritativa. As demais fontes podem estar desatualizadas ou erradas.'),
        mcq('q2', 'Ao seguir um tutorial, você encontra senhas guardadas em texto e SQL montado por concatenação. O que fazer?', 'b', [
          'Copiar exatamente, pois o tutorial deve estar certo e confiar no autor da explicação',
          'Tratar como prática insegura e aplicar as boas práticas que você aprendeu',
          'Aplicar à senha, mantendo o SQL por concatenação',
          'Abandonar o Node e escolher outra tecnologia imediatamente'
        ], 'Esses sinais indicam conteúdo inseguro ou datado; use hash de senha e consultas parametrizadas. Copiar às cegas propaga o erro.'),
        mcq('q3', 'Qual a melhor forma de fixar o que se aprendeu no nível iniciante?', 'a', [
          'Construir projetos próprios com dados fictícios e testes',
          'Reler as lições sem escrever código algum',
          'Decorar a lista de funções de cada módulo nativo',
          'Passar direto ao nível avançado sem projetos'
        ], 'A prática com projetos consolida os conceitos. Reler sem praticar, decorar métodos e pular etapas rendem pouco.'),
        fill('q4', 'Complete com o site da fonte oficial citada, usada para consultar a documentação do Node (domínio sem o https://).', `Documentacao oficial: ___.org`, ['nodejs'], 'O site oficial é nodejs.org, onde está a documentação por versão.'),
        mcq('q5', 'Ao pedir ajuda em uma comunidade, qual atitude é mais adequada?', 'c', [
          'Colar o arquivo .env inteiro para que vejam toda a configuração',
          'Enviar capturas com dados reais de clientes para ilustrar o problema e do ambiente',
          'Montar um exemplo mínimo reproduzível, sem segredos nem dados pessoais',
          'Descrever só "não funciona", sem código nem mensagem de erro'
        ], 'Um exemplo mínimo e limpo facilita a ajuda e protege dados. Colar .env ou dados reais é vazamento, e descrição vaga atrapalha.'),
        mcq('q6', 'Qual prática de estudo respeita a ética e a lei?', 'd', [
          'Testar ferramentas de segurança em sites de terceiros para treinar',
          'Usar bases de dados reais de clientes de uma empresa nos projetos',
          'Coletar e-mails reais de colegas para popular o banco de testes',
          'Usar dados fictícios e testar em ambiente próprio, e não em produção'
        ], 'Ambiente próprio com dados fictícios evita problemas legais e de privacidade. As outras opções envolvem sistemas ou dados de terceiros sem autorização.'),
        mcq('q7', 'Um tutorial usa um pacote sem atualizações há muito tempo e com aviso de obsolescência. O que é prudente?', 'b', [
          'Usar normalmente, pois se funcionou no tutorial vai continuar funcionando',
          'Procurar a alternativa atual na documentação e avaliar a manutenção do pacote',
          'Copiar o código do pacote para o seu projeto e não atualizar mais',
          'Desativar o npm audit para que o aviso pare de aparecer'
        ], 'Dependências abandonadas acumulam falhas; verifique alternativas e manutenção. Copiar o código ou silenciar o audit apenas esconde o problema.'),
        fill('q8', 'Complete com o nome do nível seguinte deste curso, depois do iniciante.', `Trilha: iniciante, ___, avancado`, ['intermediário', 'intermediario'], 'Depois do nível iniciante vem o intermediário, que aprofunda streams, bancos reais e outros tópicos.')
      ]
    },
  ]
};
