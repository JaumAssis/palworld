// Módulo "Fundamentos" do curso de Segurança de Aplicações Web (OWASP) — nível iniciante, parte A.
// Cada lição tem 8 questões (3 múltipla escolha + 1 lacuna, duas vezes). Ver ../../index.js para
// o formato e a validação de boot. Curso DEFENSIVO e educacional: cada vulnerabilidade é explicada
// junto da prevenção; demonstrações apenas em laboratório local próprio (SQLite em memória, apps
// de treino na própria máquina) com as cadeias didáticas clássicas da documentação pública da OWASP.
// Nenhum dado pessoal real (usuários e valores são fictícios), segredos sempre <placeholder>, nenhuma
// versão ou estatística é afirmada — só conceitos estáveis. Não é aconselhamento jurídico (LGPD,
// Lei 12.737/2012 e Marco Civil são citados só em visão geral).
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
  id: 'fundamentos-owasp',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Tríade CIA, HTTP, vocabulário, OWASP, ética e lei, ferramentas, validação, injeções, autenticação, sessões, acesso, CSRF e configuração',
  accent: '#dc2626',
  lessons: [
    {
      id: 'owb-01-o-que-e-seguranca-web',
      title: 'O que é segurança de aplicações web',
      goal: 'Entender o que se protege (tríade CIA), por que aplicações web são alvos e por que segurança nasce junto com o código.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é proteger uma aplicação web',
            'Segurança de aplicações web é o conjunto de práticas para que o sistema faça só o que deveria, para quem deveria, mesmo diante de pessoas que tentam usá-lo de forma errada de propósito. Não é um produto que se instala: é uma propriedade que se constrói no design, no código, na configuração e na operação. Neste curso você aprende a CONSTRUIR, TESTAR e OPERAR aplicações seguras — cada falha vem acompanhada de como preveni-la.'
          ),
          sl(
            'A tríade CIA',
            'Três objetivos guiam toda decisão de segurança. Confidencialidade: só quem tem permissão enxerga o dado (um cliente não lê o pedido de outro). Integridade: o dado só muda de forma autorizada e detectável (ninguém altera o preço ou o saldo por conta própria). Disponibilidade: o serviço funciona quando os usuários precisam (um ataque que derruba o site fere a disponibilidade). Ao analisar uma falha, pergunte: qual dos três ela quebra?',
            'Confidencialidade -> vazar a lista de clientes\nIntegridade       -> alterar o valor de uma transferência\nDisponibilidade   -> derrubar o site com excesso de requisições'
          ),
          sl(
            'Por que aplicações web são alvo',
            'Aplicações web ficam expostas à internet 24 horas: qualquer pessoa do mundo consegue enviar requisições a elas, sem precisar estar na rede da empresa. Além disso concentram dados valiosos (cadastros, credenciais, pagamentos) e são feitas de muito código, bibliotecas e configurações — muita superfície onde pode haver um erro. Boa parte das tentativas é automatizada: robôs varrem a internet atrás de falhas conhecidas, sem escolher o alvo.'
          ),
          sl(
            'Quem ataca e por quê (visão geral)',
            'As motivações variam: ganho financeiro (vender dados, fraude, extorsão), ativismo, espionagem, curiosidade ou diversão, e também pessoas de dentro da organização com mau uso de acesso. Há ainda erros acidentais de usuários legítimos. Você não precisa adivinhar quem é: projete assumindo que alguém vai tentar, e proteja primeiro os dados e funções mais valiosos.'
          ),
          sl(
            'O custo de uma falha',
            'Uma falha pode custar: dados de pessoas expostos, serviço fora do ar, fraude financeira, perda de confiança e de reputação, custo de investigar e corrigir e obrigações legais. No Brasil a LGPD exige proteção adequada de dados pessoais e prevê consequências para quem trata dados sem as medidas de segurança necessárias. Corrigir uma falha cedo, durante o desenvolvimento, é bem mais barato do que corrigir depois do incidente.'
          ),
          sl(
            'Segurança no começo, não no final',
            'Tratar segurança como uma etapa final ("depois a gente vê") deixa as falhas embutidas no design, difíceis de corrigir. O caminho saudável é incluir segurança em todo o ciclo: requisitos (o que proteger), design (quem acessa o quê), código (validar entrada, checar permissões), testes (incluir casos maliciosos), revisão de código e operação (atualizar, monitorar, registrar).'
          ),
          sl(
            'Mitos comuns',
            'Mito 1: "meu site é pequeno, ninguém ataca". Falso: robôs não escolhem pelo tamanho; qualquer site com falha conhecida é encontrado. Mito 2: "uso HTTPS, então estou seguro". HTTPS protege o tráfego entre navegador e servidor (confidencialidade e integridade em trânsito), mas não impede injeção de SQL, XSS, senha fraca ou falha de permissão: o ataque chega pelo canal criptografado normalmente. Mito 3: "o firewall resolve". Ele ajuda, mas não conhece a lógica da sua aplicação.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um atacante consegue alterar o valor de uma transferência bancária no meio do caminho, sem ser detectado. Qual propriedade da tríade CIA foi quebrada?', 'a', [
          'Integridade, porque o dado foi modificado de forma não autorizada',
          'Confidencialidade, porque o atacante viu o valor da transferência antes de todos',
          'Disponibilidade, porque a transferência deixou de funcionar para o cliente',
          'Rastreabilidade, porque o registro da operação ficou incompleto no banco'
        ], 'Alterar dados sem autorização fere a integridade. Confidencialidade trata de quem pode ler; disponibilidade trata de o serviço estar acessível.'),
        mcq('q2', 'Qual situação representa uma falha de disponibilidade?', 'd', [
          'Um cliente consegue ler o histórico de compras de outro cliente',
          'Um usuário altera o preço de um produto no carrinho antes de finalizar o pagamento',
          'A senha de um administrador é descoberta por tentativa e erro',
          'Excesso de requisições derruba o site para os usuários'
        ], 'Disponibilidade é o serviço funcionar quando necessário. As outras opções ferem confidencialidade, integridade e autenticação.'),
        mcq('q3', 'Por que aplicações web são alvos frequentes?', 'b', [
          'Os navegadores não conseguem criptografar nada, então todo dado trafega aberto pela rede inteira, inclusive senhas',
          'Ficam expostas, guardam dados valiosos e têm muita superfície',
          'Só empresas grandes usam aplicações web, e são elas que concentram dinheiro',
          'Linguagens web são inseguras por natureza e não permitem boas práticas'
        ], 'A exposição constante, o valor dos dados e a quantidade de código tornam a web um alvo atraente, em grande parte por varreduras automatizadas.'),
        fill('q4', 'Complete com o nome do objetivo da tríade CIA que garante que só quem tem permissão enxerga o dado.', 'C = ___ (só quem tem permissão acessa o dado)', ['confidencialidade', 'confidentiality'], 'A letra C da tríade é confidencialidade: impedir que dados cheguem a quem não deve vê-los.'),
        mcq('q5', 'Um colega diz: "usamos HTTPS, então não precisamos nos preocupar com injeção de SQL". Qual a melhor resposta?', 'c', [
          'Correto: o HTTPS cifra o conteúdo das consultas ao banco de dados e as torna inofensivas para o servidor',
          'Parcialmente correto: só vale se o certificado for de uma autoridade certificadora reconhecida',
          'HTTPS protege só o trânsito; o ataque chega pelo canal cifrado e a falha continua no código',
          'Incorreto: o HTTPS atrapalha a segurança porque impede inspecionar requisições e esconde ataques do servidor'
        ], 'HTTPS protege a comunicação entre navegador e servidor. Falhas de lógica e de código, como injeção, não são evitadas por ele.'),
        mcq('q6', 'Qual abordagem trata a segurança como parte do desenvolvimento?', 'a', [
          'Definir o que proteger e testar casos maliciosos desde os requisitos',
          'Contratar um teste de invasão na semana anterior ao lançamento e corrigir só o que aparecer no relatório final',
          'Esperar um incidente real para descobrir quais pontos precisam de proteção',
          'Delegar a proteção ao firewall e à equipe de infraestrutura, já que o código não é alvo'
        ], 'Segurança é contínua: requisitos, design, código, testes, revisão e operação. Deixar para o fim ou para terceiros deixa falhas embutidas.'),
        mcq('q7', 'Uma loja pequena acha que não será atacada. O que explica o risco real?', 'd', [
          'Atacantes escolhem manualmente as lojas com maior faturamento e ignoram as pequenas',
          'Lojas pequenas são automaticamente protegidas pelos provedores de hospedagem e por firewalls compartilhados',
          'O risco só existe se a loja tiver mais de um administrador cadastrado',
          'Robôs varrem a internet atrás de falhas conhecidas sem considerar o tamanho do alvo'
        ], 'Boa parte das tentativas é automatizada: qualquer site com uma falha conhecida pode ser encontrado.'),
        fill('q8', 'Qual lei brasileira exige medidas de segurança no tratamento de dados pessoais? Responda com a sigla.', 'Lei Geral de Proteção de Dados = ___', ['lgpd', 'lei geral de proteção de dados', 'lei geral de protecao de dados'], 'A LGPD trata da proteção de dados pessoais e prevê o dever de adotar medidas de segurança.')
      ]
    },
    {
      id: 'owb-02-como-a-web-funciona',
      title: 'Como a web funciona (para quem vai proteger)',
      goal: 'Entender URL, HTTP, cookies, formulários e camadas, e saber quais partes de uma requisição o usuário controla.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'URL e a conversa HTTP',
            'Uma URL como https://loja.exemplo/busca?q=gato tem esquema (https), host (loja.exemplo), caminho (/busca) e consulta (?q=gato, os parâmetros). O navegador abre uma conexão e envia uma REQUISIÇÃO HTTP; o servidor devolve uma RESPOSTA. HTTP é um protocolo de texto, sem estado: cada requisição é independente e o servidor, por si só, não lembra de quem você é.'
          ),
          sl(
            'Anatomia de requisição e resposta',
            'A requisição tem: linha inicial (método, caminho, versão), cabeçalhos (metadados como Host, Cookie, Content-Type) e, às vezes, corpo (os dados enviados). A resposta tem: código de status (200 OK, 201 Created, 301/302 redirecionamento, 400 requisição inválida, 401 não autenticado, 403 proibido, 404 não encontrado, 500 erro do servidor), cabeçalhos e corpo. Métodos comuns: GET (ler), POST (criar/enviar), PUT/PATCH (alterar), DELETE (apagar).',
            'GET /busca?q=gato HTTP/1.1\nHost: loja.exemplo\nCookie: sid=abc123\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"resultado": []}'
          ),
          sl(
            'Rodando uma requisição de verdade',
            'Em laboratório local, um servidor mínimo em Python e um cliente com http.client mostram a conversa real. O cliente controla o método, o caminho, os cabeçalhos (inclusive o Cookie) e o corpo — nada disso é "fixo" só porque o navegador costuma enviar de um jeito.',
            `# servidor local de teste (http.server) e cliente (http.client)
c = http.client.HTTPConnection('127.0.0.1', porta)
c.request('GET', '/busca?q=gato',
          headers={'Accept': 'application/json', 'Cookie': 'sid=abc123'})
r = c.getresponse()
print(r.status, r.reason)
# saída real:
# 200 OK
# Content-Type: application/json
# Set-Cookie: sid=abc123; HttpOnly
# {"ola": "mundo", "path": "/busca?q=gato"}
c.request('POST', '/pedido', body='{"qtd":1}',
          headers={'Content-Type': 'application/json'})
# 201 Created`
          ),
          sl(
            'Cookies e sessão',
            'Como o HTTP não tem memória, o servidor entrega um identificador no cabeçalho de resposta Set-Cookie; o navegador devolve esse valor no cabeçalho Cookie em toda requisição seguinte ao mesmo site. Assim nasce a SESSÃO: o servidor associa o identificador a um usuário logado. Quem possui o cookie de sessão é tratado como o usuário — por isso ele é um alvo valioso.'
          ),
          sl(
            'Front-end, back-end, banco e APIs',
            'O front-end (HTML, CSS, JavaScript) roda NO NAVEGADOR do usuário, que pode inspecioná-lo e alterá-lo. O back-end roda no servidor, aplica as regras de negócio e fala com o banco de dados, que guarda os dados. Muitas aplicações expõem APIs (geralmente JSON sobre HTTP) consumidas por páginas web e apps móveis. Formulários HTML enviam campos por GET (na URL) ou POST (no corpo).'
          ),
          sl(
            'Tudo que vem do cliente não é confiável',
            'O usuário controla: a URL e seus parâmetros, os campos de formulário (inclusive os "ocultos"), os cabeçalhos (User-Agent, Referer, Origin, Cookie), os cookies e o corpo JSON. Validações e botões desabilitados no JavaScript são apenas conveniência: quem usa curl ou um proxy ignora o navegador por completo. Regra de ouro: toda decisão de segurança é tomada e revalidada NO SERVIDOR.',
            'Origem do dado        Quem controla?\nURL / query string    usuário\nCampos do formulário  usuário (até os hidden)\nCabeçalhos e cookies  usuário\nCorpo JSON            usuário\nRegras do servidor    você'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa dizer que o HTTP é "sem estado"?', 'c', [
          'Que as requisições não carregam cabeçalhos entre cliente e servidor',
          'Que o servidor mantém a conexão aberta com cada usuário até ele sair do site',
          'Cada requisição é independente; o servidor, sozinho, não lembra das requisições anteriores',
          'Que o protocolo não permite enviar dados do cliente para o servidor, só receber'
        ], 'Cada requisição é tratada isoladamente. Cookies e sessões foram criados para ligar requisições ao mesmo usuário.'),
        mcq('q2', 'Qual código de status indica que o usuário NÃO tem permissão para acessar o recurso, embora possa estar autenticado?', 'a', [
          '403',
          '404',
          '301',
          '201'
        ], '403 significa proibido. 404 é não encontrado, 301 é redirecionamento permanente e 201 é criado com sucesso.'),
        mcq('q3', 'Como o servidor reconhece, nas requisições seguintes, o usuário que já fez login?', 'd', [
          'Pelo endereço IP, que é único e estável para cada pessoa em qualquer rede',
          'Pelo cabeçalho User-Agent, que o navegador protege contra qualquer alteração',
          'Pelo tamanho do corpo da requisição, que é diferente para cada conta',
          'Por um identificador enviado em Set-Cookie e devolvido pelo navegador no cabeçalho Cookie'
        ], 'O servidor emite um identificador de sessão via Set-Cookie e o navegador o devolve em cada requisição.'),
        fill('q4', 'Qual cabeçalho de RESPOSTA instrui o navegador a guardar um cookie?', 'HTTP/1.1 200 OK\n___: sid=abc123; HttpOnly', ['set-cookie'], 'O servidor usa Set-Cookie na resposta; o navegador devolve o valor no cabeçalho Cookie.'),
        mcq('q5', 'Um formulário tem um botão "Enviar" desabilitado por JavaScript quando o campo está vazio, e o servidor não valida nada. Qual o problema?', 'b', [
          'Nenhum, porque o botão desabilitado impede o envio de formulários vazios pelo navegador',
          'Quem usa curl ou um proxy envia direto, sem o JavaScript; o servidor precisa validar',
          'O problema é só visual: o botão deveria ser vermelho para chamar atenção',
          'A validação deveria estar no banco de dados e não no servidor da aplicação'
        ], 'Regras no front-end são conveniência. O cliente controla o que envia; a validação confiável é a do servidor.'),
        mcq('q6', 'Qual destes dados da requisição NÃO é controlável pelo usuário?', 'd', [
          'O valor de um campo oculto (hidden) do formulário enviado ao servidor',
          'O cabeçalho Referer enviado ao servidor',
          'O valor do cookie guardado pelo navegador',
          'O código-fonte das regras de negócio executadas no servidor'
        ], 'URL, campos (até hidden), cabeçalhos e cookies são controlados pelo cliente. A lógica no servidor não é.'),
        mcq('q7', 'Em qual local o código JavaScript do front-end é executado?', 'c', [
          'No servidor, protegido pelo firewall da empresa e fora do alcance do usuário',
          'No banco de dados, junto com as consultas',
          'No navegador do usuário, que pode inspecioná-lo e alterá-lo',
          'No provedor de DNS, antes de a página chegar ao usuário'
        ], 'O front-end roda no navegador do usuário; por isso não se confia nele para decisões de segurança.'),
        fill('q8', 'Em um formulário que usa o método GET, os dados enviados aparecem em qual parte da URL, depois do ponto de interrogação? Responda com o nome em inglês (query ___).', 'https://loja.exemplo/busca?q=gato  ->  parâmetros na query ___', ['string', 'query string'], 'A parte depois do ? é a query string. Dados sensíveis não devem ir nela, pois ficam em histórico e logs.')
      ]
    },
    {
      id: 'owb-03-vocabulario-modelo-ameacas',
      title: 'Vocabulário e modelo mental de ameaças',
      goal: 'Dominar os termos de segurança (ativo, ameaça, vulnerabilidade, risco, vetor, controle) e os princípios de defesa em profundidade e menor privilégio.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ativo, ameaça e vulnerabilidade',
            'ATIVO é tudo que tem valor e precisa de proteção: dados de clientes, credenciais, o próprio serviço, a reputação. AMEAÇA é o que pode causar dano ao ativo (um atacante, um funcionário descuidado, uma falha de energia). VULNERABILIDADE é uma fraqueza que permite que a ameaça cause dano (uma consulta SQL montada por concatenação, uma senha padrão). Exemplo: ativo = tabela de usuários; ameaça = alguém mal-intencionado; vulnerabilidade = injeção de SQL.'
          ),
          sl(
            'Risco = probabilidade × impacto',
            'RISCO é a chance de uma ameaça explorar uma vulnerabilidade multiplicada pelo estrago que isso causaria. Uma falha provável e de grande impacto (vazamento de todos os dados) é prioridade; uma improvável e de impacto mínimo pode esperar. Essa lógica serve para decidir O QUE corrigir primeiro, já que nunca há tempo para tudo. Riscos podem ser reduzidos (controles), aceitos conscientemente, transferidos (seguro) ou evitados (remover a funcionalidade).',
            'risco = probabilidade x impacto\nprovável + impacto alto   -> corrigir já\nimprovável + impacto baixo -> pode esperar'
          ),
          sl(
            'Exploit, vetor e superfície de ataque',
            'EXPLOIT é a técnica ou o código que aproveita uma vulnerabilidade. VETOR de ataque é o caminho usado para chegar a ela (um parâmetro de URL, um upload de arquivo, um e-mail com link). SUPERFÍCIE DE ATAQUE é o conjunto de todos os pontos de entrada possíveis: cada rota, campo, porta aberta, API, dependência e painel. Reduzir a superfície (desligar o que não é usado) reduz os riscos.'
          ),
          sl(
            'Controle ou mitigação, e vulnerabilidade vs incidente',
            'CONTROLE (ou mitigação) é qualquer medida que reduz o risco: consulta parametrizada, checagem de permissão, MFA, atualização, monitoramento. Já um INCIDENTE é um evento real que afeta a segurança (dados acessados indevidamente, serviço derrubado). A vulnerabilidade é a possibilidade; o incidente é a consequência concretizada. Muitas vulnerabilidades existem sem nunca virar incidente — o objetivo é corrigi-las antes.'
          ),
          sl(
            'Defesa em profundidade',
            'Nenhum controle é perfeito, então se usam VÁRIAS camadas independentes: se uma falhar, outra segura. Exemplo: contra injeção de SQL, use consultas parametrizadas (principal), validação de entrada (extra), conta de banco com poucas permissões (limita o estrago) e monitoramento (detecta). Defesa em profundidade não é desculpa para pular a camada principal.'
          ),
          sl(
            'Princípio do menor privilégio',
            'Cada usuário, processo e conta deve ter somente as permissões necessárias para sua tarefa, e nada além. Um serviço que só lê dados não deve usar uma conta de banco capaz de apagar tabelas; um usuário comum não deve ter acesso administrativo. Assim, se algo for comprometido, o dano fica contido.'
          ),
          sl(
            'CVE, CWE e CVSS',
            'CVE é um identificador público de uma vulnerabilidade específica em um produto (formato CVE-ano-número), útil para localizar correções. CWE é o catálogo de TIPOS de fraquezas de software (por exemplo, injeção de SQL é uma categoria CWE), usado para classificar a causa. CVSS é um sistema de pontuação que expressa a severidade técnica de uma vulnerabilidade; ele ajuda a priorizar, mas não substitui a análise do seu contexto (o que é o ativo e quem é afetado).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em "a tabela de usuários guarda e-mails e senhas", qual termo descreve a tabela de usuários?', 'b', [
          'Vulnerabilidade',
          'Ativo',
          'Exploit',
          'Vetor'
        ], 'Ativo é tudo que tem valor e merece proteção, como os dados de clientes.'),
        mcq('q2', 'Qual é a melhor definição de risco?', 'd', [
          'Qualquer erro de programação existente no código, independentemente de ser usado ou não',
          'O código que um atacante usa para tirar proveito de uma falha',
          'Um evento real em que dados foram acessados indevidamente por uma pessoa não autorizada',
          'A chance de uma ameaça explorar uma vulnerabilidade combinada com o impacto causado'
        ], 'Risco combina probabilidade e impacto. Exploit é a técnica; incidente é o evento concretizado.'),
        mcq('q3', 'Um parâmetro de URL vulnerável a injeção é usado para chegar ao banco. Esse parâmetro é um exemplo de:', 'a', [
          'Vetor de ataque, parte da superfície de ataque',
          'Controle de segurança preventivo',
          'Ativo a ser protegido pelo princípio do menor privilégio',
          'Incidente de segurança já consumado'
        ], 'O caminho de entrada da exploração é o vetor; o conjunto de todas as entradas é a superfície de ataque.'),
        fill('q4', 'Qual termo descreve usar várias camadas de proteção independentes, de modo que a falha de uma não derrube tudo? (três palavras: defesa em ___)', 'Defesa em ___', ['profundidade'], 'Defesa em profundidade combina camadas: se uma falha, outra contém o dano.'),
        mcq('q5', 'Um serviço de relatórios só precisa ler dados, mas usa a conta de banco com permissão para apagar tabelas. Qual princípio está sendo violado?', 'c', [
          'Defesa em profundidade',
          'Superfície de ataque mínima',
          'Menor privilégio',
          'Segregação de ambientes'
        ], 'Menor privilégio manda conceder só o necessário; uma conta somente leitura limitaria o estrago.'),
        mcq('q6', 'Qual a diferença entre vulnerabilidade e incidente?', 'b', [
          'Vulnerabilidade é causada por atacantes externos e incidente por erros cometidos internamente',
          'Vulnerabilidade é a fraqueza possível; incidente é o evento real que afetou a segurança',
          'Não há diferença prática: os dois termos descrevem a mesma coisa',
          'Incidente é falha só de hardware e vulnerabilidade só de software, em categorias separadas'
        ], 'A vulnerabilidade é a possibilidade; o incidente é a consequência concretizada.'),
        mcq('q7', 'Você tem duas falhas: A é provável e expõe todos os dados; B é improvável e afeta uma tela de ajuda. O que a lógica de risco indica?', 'd', [
          'Corrigir B primeiro, por ser mais simples de resolver e rápida de entregar',
          'Ignorar ambas até ocorrer um incidente',
          'Tratar as duas com a mesma urgência, pois toda falha é igual',
          'Priorizar A: maior probabilidade e maior impacto'
        ], 'Risco guia a priorização: alta probabilidade e alto impacto primeiro.'),
        fill('q8', 'Qual sigla identifica uma vulnerabilidade específica e pública em um produto, no formato CVE-ano-número?', 'O identificador público de uma falha conhecida é o ___', ['cve'], 'CVE identifica uma vulnerabilidade específica; CWE classifica o tipo de fraqueza; CVSS pontua a severidade.')
      ]
    },
    {
      id: 'owb-04-owasp-projetos',
      title: 'OWASP e seus projetos',
      goal: 'Conhecer a OWASP, o Top 10 e os principais projetos (ASVS, Cheat Sheets, WSTG, ZAP, Juice Shop, SAMM) e saber como usá-los no dia a dia.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é a OWASP',
            'OWASP (Open Worldwide Application Security Project, antes "Open Web Application Security Project") é uma fundação sem fins lucrativos que produz conteúdo aberto e gratuito sobre segurança de software: documentos, ferramentas e padrões, mantidos por uma comunidade de voluntários. Por ser aberta e independente de fornecedores, é a referência mais comum quando se fala em segurança de aplicações web.'
          ),
          sl(
            'OWASP Top 10: lista de conscientização',
            'O Top 10 é um documento de CONSCIENTIZAÇÃO que lista as categorias de risco mais críticas para aplicações web, baseado em dados e na opinião da comunidade, e é atualizado periodicamente. A edição de 2021 tem: A01 Broken Access Control (controle de acesso quebrado), A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures, A09 Security Logging and Monitoring Failures e A10 Server-Side Request Forgery. A edição de 2025 reorganiza a lista: Broken Access Control segue em 1º (e absorve SSRF), Security Misconfiguration sobe para 2º, entram Software Supply Chain Failures (cadeia de suprimentos de software) e Mishandling of Exceptional Conditions (tratamento incorreto de condições excepcionais), e outras categorias mudam de nome ou posição. Confira sempre a edição vigente em owasp.org. Este curso ensina pelas CLASSES de vulnerabilidade, que permanecem as mesmas de uma edição para outra.'
          ),
          sl(
            'O Top 10 não é um checklist completo',
            'Estar "em conformidade com o Top 10" não significa estar seguro: são só as categorias mais críticas, e cada uma agrupa dezenas de falhas específicas. Use-o para formar vocabulário, priorizar treinamento e comunicar riscos — não como lista final de verificação. Para checar de verdade, use um padrão de requisitos como o ASVS.'
          ),
          sl(
            'ASVS, Cheat Sheets e WSTG',
            'ASVS (Application Security Verification Standard) é um padrão de REQUISITOS de segurança verificáveis, organizado em níveis; serve para definir o que a aplicação deve cumprir e para checar. Cheat Sheet Series são guias curtos e práticos de COMO implementar cada defesa (consulta parametrizada, armazenamento de senhas, CSRF...). WSTG (Web Security Testing Guide) é o guia de COMO TESTAR uma aplicação web de forma metódica, passo a passo.'
          ),
          sl(
            'Ferramentas e treino: ZAP e Juice Shop',
            'OWASP ZAP é um proxy e scanner gratuito para testar aplicações web que você tem autorização para testar: intercepta requisições, repete e varre procurando problemas comuns. OWASP Juice Shop é uma loja web VULNERÁVEL DE PROPÓSITO, para treino legal na sua própria máquina (assim como DVWA e WebGoat). Nunca exponha esses apps de treino à internet.'
          ),
          sl(
            'SAMM e outras listas',
            'SAMM (Software Assurance Maturity Model) ajuda a organização a medir e melhorar a maturidade de suas práticas de segurança de software ao longo do tempo. Existem também o API Security Top 10 (riscos específicos de APIs, como autorização quebrada em nível de objeto) e o Top 10 para aplicações com LLMs (riscos de sistemas com modelos de linguagem). Todos seguem a mesma ideia: conscientização e boas práticas abertas.'
          ),
          sl(
            'Como usar no dia a dia',
            'Ao começar um projeto: defina requisitos com o ASVS. Ao codar uma defesa: consulte o Cheat Sheet do tema. Ao revisar ou testar: siga o WSTG e rode o ZAP no ambiente de teste. Para treinar a equipe: Top 10 e Juice Shop local. Para a organização: SAMM para evoluir o processo.',
            'Requisitos  -> ASVS\nImplementar -> Cheat Sheet Series\nTestar      -> WSTG + ZAP (com autorização)\nTreinar     -> Top 10 + Juice Shop local\nMaturidade  -> SAMM'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é a OWASP?', 'c', [
          'Uma empresa que vende scanners de vulnerabilidades sob licença paga e com suporte',
          'Um órgão do governo que fiscaliza aplicações web e aplica multas a quem falha',
          'Uma fundação sem fins lucrativos que publica conteúdo e ferramentas abertas',
          'Um navegador especializado em testes de segurança'
        ], 'A OWASP é uma fundação sem fins lucrativos, de comunidade, com material aberto e gratuito.'),
        mcq('q2', 'Qual é a natureza do OWASP Top 10?', 'b', [
          'Um checklist completo que garante segurança total se todos os itens forem cumpridos',
          'Um documento de conscientização sobre as categorias de risco mais críticas',
          'Uma lei que obriga empresas brasileiras a corrigir certas falhas',
          'Um catálogo com todas as vulnerabilidades individuais já descobertas, com número de CVE'
        ], 'O Top 10 conscientiza sobre categorias críticas; não é checklist completo nem lei.'),
        mcq('q3', 'Você quer definir requisitos de segurança verificáveis para um novo sistema. Qual projeto OWASP é o mais adequado?', 'd', [
          'Juice Shop',
          'ZAP',
          'SAMM',
          'ASVS'
        ], 'O ASVS é o padrão de requisitos de segurança verificáveis. Juice Shop é treino, ZAP é ferramenta e SAMM mede maturidade.'),
        fill('q4', 'Qual projeto OWASP é uma loja web vulnerável de propósito, usada para treino na própria máquina? (duas palavras)', 'OWASP ___ (app de treino)', ['juice shop', 'juiceshop'], 'Juice Shop é um app vulnerável de propósito para treino legal em ambiente local.'),
        mcq('q5', 'Um dev precisa implementar armazenamento de senhas corretamente e quer um guia curto e prático. Onde procurar primeiro?', 'a', [
          'Cheat Sheet Series da OWASP',
          'Resultado de um scan do ZAP em produção de terceiros',
          'A lista do Top 10, que traz código pronto para copiar',
          'O SAMM, que detalha o algoritmo de hash recomendado'
        ], 'Os Cheat Sheets explicam como implementar cada defesa na prática.'),
        mcq('q6', 'Qual afirmação sobre estar "em conformidade com o Top 10" é correta?', 'c', [
          'Garante que a aplicação não possui nenhuma vulnerabilidade conhecida em produção',
          'Dispensa a realização de testes de segurança e de revisões de código',
          'Não garante segurança: são só categorias críticas',
          'Torna a aplicação automaticamente conforme a LGPD'
        ], 'O Top 10 é ponto de partida para conscientização, não verificação completa; o ASVS é o padrão de verificação.'),
        mcq('q7', 'Qual projeto descreve de forma metódica COMO testar a segurança de uma aplicação web?', 'b', [
          'SAMM',
          'WSTG (Web Security Testing Guide)',
          'API Security Top 10',
          'Juice Shop, a loja vulnerável usada para treino'
        ], 'O WSTG é o guia de testes. SAMM mede maturidade; o Top 10 de APIs lista riscos; Juice Shop é app de treino.'),
        fill('q8', 'Qual ferramenta gratuita da OWASP funciona como proxy de interceptação e scanner de aplicações web (sigla de 3 letras)?', 'Proxy e scanner da OWASP: ___', ['zap', 'owasp zap'], 'O ZAP intercepta, repete e varre requisições; use apenas em alvos que você tem autorização para testar.')
      ]
    },
    {
      id: 'owb-31-top10-mapa-edicoes',
      title: 'Mapa do OWASP Top 10: edições 2021 e 2025',
      goal: 'Conhecer as categorias das edições 2021 e 2025 do Top 10, entender o que mudou em linhas gerais e saber usar a lista como conscientização, não como checklist.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que ter um mapa do Top 10',
            'O Top 10 da OWASP é publicado em edições, e cada edição reorganiza as categorias. Quem estuda segurança vê nomes e números diferentes conforme o material e fica confuso: "A03 é injeção" numa edição e "A05 é injeção" em outra. Este mapa mostra as duas edições mais recentes lado a lado, explica o que mudou em alto nível e liga cada categoria às lições deste curso. Lembre: o Top 10 é um documento de CONSCIENTIZAÇÃO sobre as categorias de risco mais críticas, não uma lei nem um checklist completo.'
          ),
          sl(
            'Edição 2021, categoria por categoria',
            'A01 Broken Access Control: usuários agindo fora das permissões que deveriam ter. A02 Cryptographic Failures: dados sensíveis mal protegidos por falta ou erro de criptografia. A03 Injection: entrada do usuário interpretada como comando (SQL, sistema operacional). A04 Insecure Design: falha na concepção, que código perfeito não corrige. A05 Security Misconfiguration: configurações inseguras ou padrão. A06 Vulnerable and Outdated Components: bibliotecas com falhas conhecidas. A07 Identification and Authentication Failures: login, senhas e sessões fracos. A08 Software and Data Integrity Failures: confiar em código ou dados sem verificar a origem. A09 Security Logging and Monitoring Failures: sem registros ou alertas para perceber ataques. A10 Server-Side Request Forgery (SSRF): fazer o servidor buscar endereços escolhidos pelo atacante.'
          ),
          sl(
            'Edição 2025, categoria por categoria',
            'A lista abaixo foi conferida na página da edição em owasp.org (confirme sempre lá, pois o material pode ser atualizado). Broken Access Control (agora também abrange SSRF). Security Misconfiguration. Software Supply Chain Failures: falhas ao longo de toda a cadeia de software (dependências, build, distribuição). Cryptographic Failures. Injection. Insecure Design. Authentication Failures. Software or Data Integrity Failures. Security Logging and Alerting Failures: registrar e também ALERTAR. Mishandling of Exceptional Conditions: erros e situações inesperadas tratados de forma incorreta, por exemplo falhando de modo inseguro.',
            `2021                                   2025
A01 Broken Access Control        ->  Broken Access Control (+ SSRF)
A10 SSRF                         ->  absorvida em Broken Access Control
A05 Security Misconfiguration    ->  Security Misconfiguration
A06 Vulnerable/Outdated Comp.    ->  Software Supply Chain Failures
A02 Cryptographic Failures       ->  Cryptographic Failures
A03 Injection                    ->  Injection
A04 Insecure Design              ->  Insecure Design
A07 Ident. and Auth. Failures    ->  Authentication Failures
A08 Software/Data Integrity      ->  Software or Data Integrity Failures
A09 Logging and Monitoring       ->  Logging and Alerting Failures
(sem equivalente direto)         ->  Mishandling of Exceptional Conditions`
          ),
          sl(
            'O que mudou e por quê (alto nível)',
            'Principais movimentos: (1) SSRF deixou de ser categoria própria e foi incorporada a Broken Access Control, já que o servidor acaba fazendo uma requisição que o usuário não deveria poder provocar. (2) Componentes vulneráveis e desatualizados ampliou-se para Software Supply Chain Failures: o risco não está só na biblioteca antiga, mas em todo o caminho do código até produção. (3) Entrou Mishandling of Exceptional Conditions, dando nome a falhas de tratamento de erros. (4) Alguns nomes foram ajustados (autenticação, registro e ALERTA). Em geral, as mudanças refletem dados novos e tendências do mercado, e não o fim de uma classe de falha antiga.'
          ),
          sl(
            'A numeração muda, as classes permanecem',
            'Injeção, controle de acesso quebrado e configuração insegura existem desde muito antes do Top 10 e continuam existindo. Mudar de posição significa que mudaram os dados ou o foco da edição, não que o problema acabou. Por isso este curso ensina pelas CLASSES de vulnerabilidade e cita o id (A01, A05...) só como referência. Ao ler um relatório, olhe o nome da categoria e a edição, não só o número.'
          ),
          sl(
            'Categoria → lições deste curso',
            'Use esta tabela para estudar por categoria, independente da edição. Controle de acesso e SSRF: owb-13 (Controle de acesso) e owb-19 (SSRF). Criptografia: owb-17 (dados sensíveis e criptografia) e owb-16 (HTTPS). Injeção: owb-07 (validação), owb-08 (SQL), owb-09 (XSS) e owb-10 (outras injeções). Design inseguro: owb-25 (princípios de design) e owb-26 (SSDLC). Configuração: owb-15, owb-21 (segredos) e owb-33. Componentes e cadeia de suprimentos: owb-20. Autenticação: owb-11, owb-12 (sessões) e owb-32 (fluxos de conta). Integridade: owb-20 e owb-26. Registro e alerta: owb-22. Condições excepcionais: owb-23 (erros e exceções).',
            `Categoria (classe)            Lições
Controle de acesso / SSRF     owb-13, owb-19
Criptografia                  owb-16, owb-17
Injeção                       owb-07, 08, 09, 10
Design inseguro               owb-25, owb-26
Configuração                  owb-15, owb-21, owb-33
Componentes / cadeia          owb-20
Autenticação                  owb-11, owb-12, owb-32
Integridade                   owb-20, owb-26
Registro e alerta             owb-22
Condições excepcionais        owb-23`
          ),
          sl(
            'Como usar o Top 10 e acompanhar novas edições',
            'Use o Top 10 para formar vocabulário, priorizar treinamento e conversar sobre riscos com a equipe. NÃO o use como checklist completo: cada categoria agrupa dezenas de falhas, e estar "em dia com o Top 10" não prova segurança. Para verificar de fato, use o ASVS, que traz requisitos testáveis. Para acompanhar novas edições: consulte a página oficial do Top 10 em owasp.org, leia o que mudou em relação à anterior e revise seu plano de estudo, treinamentos e requisitos. Sempre confirme nomes e posições na fonte oficial.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um colega afirma que, como a numeração do Top 10 mudou entre as edições, as vulnerabilidades antigas deixaram de existir. Qual a leitura correta?', 'c', [
          'As falhas antigas foram eliminadas pelos frameworks modernos e por isso perderam posição na nova edição',
          'Cada edição substitui totalmente a anterior, então o conteúdo da edição de 2021 deixou de ter valor',
          'Muda o ranking, não as classes: injeção e controle de acesso seguem existindo',
          'A OWASP altera a numeração para refletir o idioma e a região dos desenvolvedores que respondem à pesquisa'
        ], 'A numeração reflete dados e foco de cada edição. As classes de vulnerabilidade permanecem; por isso se estuda pela classe e se confere a edição.'),
        mcq('q2', 'Na edição de 2025, o que aconteceu com a categoria SSRF da edição de 2021?', 'a', [
          'Foi incorporada a Broken Access Control',
          'Passou a ser uma categoria própria com mais destaque, por causa do crescimento de serviços em nuvem',
          'Foi absorvida pela categoria Injection, pois ambas usam entrada controlada pelo usuário',
          'Saiu da lista porque os frameworks atuais passaram a bloquear esse tipo de falha automaticamente'
        ], 'Em 2025 o SSRF passou a fazer parte de Broken Access Control. A classe da falha continua existindo; mudou onde ela é classificada.'),
        mcq('q3', 'Uma aplicação, ao receber uma exceção inesperada ao validar a permissão, acaba liberando o acesso. Qual categoria de 2025 descreve melhor esse problema de tratamento de erros?', 'd', [
          'Cryptographic Failures',
          'Software Supply Chain Failures',
          'Security Logging and Alerting Failures',
          'Mishandling of Exceptional Conditions'
        ], 'Mishandling of Exceptional Conditions trata de erros e situações inesperadas tratados de forma incorreta, como falhar de modo inseguro (ver owb-23).'),
        fill('q4', 'Como o Top 10 não é um checklist completo, qual projeto da OWASP traz requisitos de segurança verificáveis para checar uma aplicação? Responda com a sigla.', 'Conscientização: Top 10  |  Verificação: ___', ['asvs', 'owasp asvs'], 'O ASVS (Application Security Verification Standard) é o padrão de requisitos verificáveis; o Top 10 serve para conscientização.'),
        mcq('q5', 'A equipe quer declarar a aplicação segura "porque cobriu as 10 categorias do Top 10". Qual a melhor orientação?', 'b', [
          'Aceitar, pois as dez categorias reúnem todas as falhas possíveis em aplicações web',
          'Usar o Top 10 para conscientização e o ASVS para verificar requisitos',
          'Aceitar, desde que a equipe use a edição mais recente publicada em owasp.org',
          'Trocar o Top 10 pela lista de CVE mais recente, que cobre todas as falhas de cada produto'
        ], 'Cada categoria agrupa muitas falhas, e o Top 10 não é checklist. Use-o para conscientizar e o ASVS (além de testes e revisão) para verificar.'),
        mcq('q6', 'A categoria "Vulnerable and Outdated Components" (2021) deu lugar a "Software Supply Chain Failures" (2025). Qual a mudança de foco?', 'c', [
          'Deixou de tratar bibliotecas e passou a tratar apenas o sistema operacional do servidor',
          'Passou a cobrir somente bibliotecas com CVE publicado, ignorando o processo de build',
          'Passa a olhar dependências, build e distribuição, e não só componentes velhos',
          'Trocou o foco de componentes de terceiros por senhas fracas escolhidas pelos usuários'
        ], 'A categoria ampliou o olhar: dependências, processo de build e distribuição também fazem parte da cadeia de software (ver owb-20).'),
        mcq('q7', 'Uma nova edição do Top 10 foi publicada. Qual a melhor forma de acompanhar a mudança?', 'a', [
          'Ler a página oficial em owasp.org, comparar com a edição anterior e revisar o plano de estudo',
          'Memorizar as novas posições e descartar o estudo das classes presentes só nas edições antigas',
          'Esperar que os frameworks atualizem a documentação, já que a OWASP não publica a lista abertamente',
          'Substituir o ASVS pela nova lista, que passa a ser o padrão de verificação'
        ], 'A fonte oficial é owasp.org. Compare edições, entenda o que mudou e atualize o plano; as classes e o ASVS continuam úteis.'),
        fill('q8', 'Complete o nome em inglês da categoria que trata de usuários acessando dados ou funções que não deveriam: Broken ___ Control.', 'Broken ___ Control', ['access'], 'Broken Access Control é a categoria de controle de acesso quebrado (ver owb-13).')
      ]
    },
    {
      id: 'owb-05-etica-lei-laboratorio',
      title: 'Ética, lei e laboratório seguro',
      goal: 'Saber testar só com autorização, conhecer o panorama legal brasileiro e montar um laboratório local isolado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autorização e escopo: a regra nº 1',
            'Testar a segurança de um sistema só é legítimo com AUTORIZAÇÃO por escrito do responsável e dentro de um ESCOPO definido: quais endereços, quais tipos de teste, em quais datas e horários, e o que está proibido. Curiosidade, boa intenção ou "só olhar" não substituem permissão. Sem autorização, o mesmo teste deixa de ser trabalho profissional e pode virar crime.'
          ),
          sl(
            'Panorama legal no Brasil (visão geral)',
            'A Lei 12.737/2012 inseriu no Código Penal o crime de invasão de dispositivo informático: acessar dispositivo alheio, conectado ou não à rede, violando mecanismo de segurança, para obter, adulterar ou destruir dados ou instalar vulnerabilidades. O Marco Civil da Internet (Lei 12.965/2014) estabelece princípios, direitos e deveres no uso da internet, inclusive sobre registros de acesso e privacidade. A LGPD (Lei 13.709/2018) regula o tratamento de dados pessoais e exige medidas de segurança. Isto é um panorama educacional, não aconselhamento jurídico: consulte um profissional do direito em casos reais.'
          ),
          sl(
            'Divulgação responsável e bug bounty',
            'Se você encontrar uma falha em um sistema que não é seu, o caminho ético é a DIVULGAÇÃO RESPONSÁVEL: comunicar de forma privada a quem pode corrigir (muitas organizações publicam um contato de segurança ou uma política de divulgação), dar prazo razoável para correção e não explorar além do necessário nem expor dados. Programas de BUG BOUNTY são convites formais: a organização define escopo e regras e, em geral, recompensa os relatos válidos. Fora das regras do programa, vale a regra nº 1.'
          ),
          sl(
            'Laboratório local isolado',
            'Para praticar, monte seu próprio laboratório: uma máquina virtual ou container na sua máquina, com a rede restrita ao ambiente local (sem rota para a internet, ou apenas com acesso interno), rodando aplicações vulneráveis DE PROPÓSITO como OWASP Juice Shop, DVWA ou WebGoat. Esses apps têm falhas intencionais e NUNCA devem ser expostos à internet: quem os encontrasse poderia usá-los para comprometer sua máquina.',
            '# exemplo conceitual: app de treino ouvindo só no loopback\ndocker run --rm -p 127.0.0.1:3000:3000 <imagem-do-juice-shop>\n# acessar em http://127.0.0.1:3000 (nunca 0.0.0.0 em rede pública)'
          ),
          sl(
            'Snapshots e dados de teste',
            'Antes de experimentar, tire um SNAPSHOT da VM: se algo quebrar ou ficar sujo, você volta ao estado limpo em segundos. Use sempre dados FICTÍCIOS no laboratório: nunca copie dados reais de produção para treinar (isso criaria risco de privacidade e problemas com a LGPD). Mantenha o laboratório atualizado e separado da sua rede de trabalho e dos seus dados pessoais.'
          ),
          sl(
            'Regras práticas de conduta',
            'Resumo: (1) tenha autorização escrita e escopo claro; (2) nunca teste produção de terceiros; (3) treine só em laboratório próprio ou plataformas feitas para isso; (4) não acesse, copie nem divulgue dados de pessoas; (5) reporte falhas de forma responsável; (6) registre o que fez, para ser transparente. O objetivo do curso é proteger sistemas, e a ética é parte da profissão.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que torna um teste de segurança legítimo?', 'b', [
          'A boa intenção de quem testa, mesmo sem avisar o responsável',
          'Autorização por escrito e escopo definido; sem elas o teste nunca é legítimo',
          'O sistema ser público e acessível pela internet',
          'O teste não causar nenhuma indisponibilidade perceptível'
        ], 'Autorização e escopo são o que separam teste profissional de acesso indevido; intenção e acessibilidade pública não bastam.'),
        mcq('q2', 'A Lei 12.737/2012, em visão geral, trata de:', 'a', [
          'Invasão de dispositivo informático, inserida no Código Penal',
          'Regras de armazenamento de senhas em bancos de dados comerciais',
          'Criação da Autoridade Nacional de Proteção de Dados',
          'Obrigação de todo site usar HTTPS com certificado válido'
        ], 'A Lei 12.737/2012 tipificou a invasão de dispositivo informático. A LGPD é outra lei, e HTTPS não é objeto dela.'),
        mcq('q3', 'Qual lei brasileira regula o tratamento de dados pessoais e exige medidas de segurança?', 'd', [
          'Marco Civil da Internet (Lei 12.965/2014)',
          'Lei 12.737/2012',
          'Código de Defesa do Consumidor',
          'LGPD (Lei 13.709/2018)'
        ], 'A LGPD é a lei de proteção de dados pessoais. O Marco Civil trata de princípios e deveres no uso da internet.'),
        fill('q4', 'Como se chama a prática de comunicar de forma privada e cuidadosa uma falha encontrada a quem pode corrigi-la? (divulgação ___)', 'Divulgação ___', ['responsável', 'responsavel', 'coordenada'], 'Na divulgação responsável o relato é privado e dá prazo para correção, sem expor dados nem explorar além do necessário.'),
        mcq('q5', 'Você quer treinar com o OWASP Juice Shop. Qual é a prática correta?', 'c', [
          'Publicá-lo num servidor na nuvem para que colegas acessem de qualquer lugar',
          'Instalá-lo no servidor de produção da empresa para ver o comportamento em um ambiente real',
          'Rodar em VM ou container local, sem exposição à internet',
          'Usar dados reais de clientes para deixar o treino mais realista'
        ], 'Apps vulneráveis de propósito ficam em laboratório isolado; expô-los ou misturar com dados reais cria riscos.'),
        mcq('q6', 'Para que serve tirar um snapshot da VM do laboratório antes de testar?', 'd', [
          'Para acelerar a execução das ferramentas de teste dentro da máquina virtual',
          'Para tornar o laboratório acessível pela internet com segurança',
          'Para criptografar automaticamente o tráfego entre as máquinas',
          'Para voltar ao estado limpo se algo quebrar ou ficar comprometido'
        ], 'Snapshots permitem restaurar rapidamente o ambiente ao estado anterior.'),
        mcq('q7', 'Você encontra, por acaso, uma falha em um site de uma loja desconhecida. Qual a conduta ética?', 'b', [
          'Explorar a falha para provar que ela existe e publicar os dados obtidos como prova pública',
          'Não explorar além do necessário e avisar o responsável em privado, pelo canal de segurança',
          'Ignorar para sempre e nunca avisar ninguém, porque o site não é seu',
          'Divulgar imediatamente em redes sociais para pressionar a empresa'
        ], 'Divulgação responsável: relato privado, sem exploração além do necessário e sem expor dados.'),
        fill('q8', 'Que tipo de dados deve ser usado no laboratório, em vez de informações de pessoas reais? (um adjetivo, no masculino plural)', 'Use dados ___ no laboratório, nunca dados reais de clientes.', ['fictícios', 'ficticios', 'falsos', 'sintéticos', 'sinteticos'], 'Dados fictícios evitam risco de privacidade e problemas com a LGPD ao treinar com informações de pessoas reais.')
      ]
    },
    {
      id: 'owb-06-ferramentas-basicas',
      title: 'Ferramentas básicas',
      goal: 'Usar DevTools, curl e proxies de interceptação para observar requisições e cabeçalhos de segurança — apenas em laboratório ou sistemas autorizados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'DevTools do navegador',
            'As ferramentas de desenvolvedor (tecla F12) já mostram quase tudo. Network: cada requisição e resposta, com cabeçalhos, status, corpo e tempo. Application: cookies, localStorage e sessionStorage (e seus atributos como HttpOnly e Secure). Console: executa JavaScript na página e mostra erros. Elements: o HTML/DOM atual, que você pode editar para entender como a página se comporta. Lembre-se: tudo que o navegador mostra, o usuário também pode alterar.'
          ),
          sl(
            'curl: o cliente HTTP da linha de comando',
            'O curl envia requisições sem navegador, mostrando que o servidor não pode confiar no cliente. Opções úteis: -i (mostra cabeçalhos da resposta junto ao corpo), -v (modo detalhado: mostra a requisição, a resposta e a negociação TLS), -X (define o método), -H (adiciona cabeçalho), -d (envia corpo), --cookie (envia cookie). Use apenas contra o seu laboratório ou sistemas autorizados.',
            'curl -i http://127.0.0.1:5000/busca?q=gato\ncurl -X POST http://127.0.0.1:5000/pedido \\\n  -H "Content-Type: application/json" \\\n  -d \'{"qtd":1}\'\ncurl --cookie "sid=<seu-id-de-teste>" http://127.0.0.1:5000/perfil'
          ),
          sl(
            'Exemplo real contra um servidor local',
            'Com o servidor de laboratório da lição anterior (Python, http.server em 127.0.0.1), a mesma requisição pode ser feita por curl ou por código. O curl -i mostraria linha de status, cabeçalhos e corpo; em Python, o resultado equivalente é este.',
            `# cliente em Python contra o servidor local (127.0.0.1)
c.request('GET', '/busca?q=gato')
r = c.getresponse()
print(r.status, r.reason)
for k, v in r.getheaders():
    print(k + ':', v)
# saída real:
# 200 OK
# Content-Type: application/json
# Set-Cookie: sid=abc123; HttpOnly
# Content-Length: 41`
          ),
          sl(
            'Proxy de interceptação (ZAP, Burp Community)',
            'Um proxy de interceptação fica ENTRE o navegador e o servidor: você configura o navegador para passar por ele e consegue ver cada requisição, pausar, editar e REPETIR (replay). Serve para entender o que a aplicação envia e testar como o servidor reage a valores inesperados. OWASP ZAP (gratuito) e Burp Suite Community são os mais conhecidos. Para HTTPS, o proxy usa um certificado próprio que você instala no navegador de teste — faça isso só em um perfil de laboratório.'
          ),
          sl(
            'Inspecionando TLS e cabeçalhos de segurança',
            'Para ver o handshake TLS e o certificado: curl -v https://... ou openssl s_client -connect host:443. Nas respostas, procure cabeçalhos de segurança: Strict-Transport-Security (força HTTPS), Content-Security-Policy (limita de onde scripts podem vir), X-Content-Type-Options: nosniff, X-Frame-Options ou a diretiva frame-ancestors do CSP (contra clickjacking) e Referrer-Policy. A ausência de um desses não é uma falha por si só, mas é um sinal para revisar a configuração.',
            'curl -sI http://127.0.0.1:5000/\n# conferir se aparecem:\n# Strict-Transport-Security, Content-Security-Policy,\n# X-Content-Type-Options, Referrer-Policy'
          ),
          sl(
            'Boas práticas ao usar as ferramentas',
            'Use as ferramentas em seu laboratório ou com autorização escrita. Ao testar, evite carga que derrube o serviço, não grave segredos (tokens, senhas) em histórico, scripts ou prints compartilhados, e descarte cookies de sessão de teste. Lembre que um scanner automático encontra problemas comuns, mas não substitui entendimento e revisão manual.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em qual aba das DevTools você inspeciona os atributos de um cookie (como HttpOnly e Secure)?', 'c', [
          'Console',
          'Elements',
          'Application',
          'Network, que só mostra as requisições'
        ], 'A aba Application mostra cookies e storages com seus atributos. Na Network você vê o Set-Cookie nas respostas, mas não o painel de atributos.'),
        mcq('q2', 'Qual opção do curl mostra os cabeçalhos da resposta junto com o corpo?', 'b', [
          '-X',
          '-i',
          '-H',
          '-d'
        ], '-i inclui os cabeçalhos da resposta na saída. -X define o método, -H adiciona cabeçalho e -d envia corpo.'),
        mcq('q3', 'Para que serve um proxy de interceptação como o ZAP?', 'd', [
          'Para esconder o IP do usuário e impedir que o servidor registre os acessos feitos',
          'Para criptografar o banco de dados da aplicação',
          'Para substituir o firewall e bloquear automaticamente ataques',
          'Ver, editar e repetir requisições entre navegador e servidor em alvos autorizados'
        ], 'Fica entre navegador e servidor e permite inspecionar e repetir requisições.'),
        fill('q4', 'Qual opção do curl mostra uma saída detalhada, incluindo a requisição enviada e a negociação TLS? (uma letra com hífen)', 'curl ___ https://exemplo.local', ['-v', '--verbose'], 'O modo detalhado (-v) exibe cabeçalhos enviados e recebidos e o handshake TLS.'),
        mcq('q5', 'Qual cabeçalho de resposta instrui o navegador a usar HTTPS nas próximas visitas ao site?', 'a', [
          'Strict-Transport-Security',
          'X-Content-Type-Options',
          'Referrer-Policy',
          'Content-Length'
        ], 'HSTS (Strict-Transport-Security) faz o navegador exigir HTTPS durante o período indicado.'),
        mcq('q6', 'Você quer testar uma aplicação de uma empresa cliente com o ZAP. O que precisa estar definido antes?', 'd', [
          'Nada, porque o ZAP é gratuito, público e amplamente usado em testes',
          'Apenas a versão mais recente do navegador e do próprio ZAP instalada',
          'Que o servidor responda em HTTPS com certificado válido',
          'Autorização por escrito e escopo definido do que pode ser testado'
        ], 'Ferramentas gratuitas não dispensam autorização e escopo.'),
        mcq('q7', 'Ao compartilhar um print de uma requisição capturada no laboratório, qual cuidado faz sentido?', 'b', [
          'Mostrar o cookie e o token completos para que outros possam reproduzir o teste',
          'Ocultar cookies, tokens e senhas, mesmo de teste',
          'Garantir que o print inclua o endereço IP da sua rede doméstica',
          'Anexar o arquivo de histórico completo do navegador'
        ], 'Segredos em prints e históricos vazam com facilidade; oculte-os, mesmo de teste.'),
        fill('q8', 'Qual ferramenta de linha de comando (além do curl) permite abrir uma conexão TLS e ver o certificado com a opção s_client? (nome do comando)', '___ s_client -connect host:443', ['openssl'], 'openssl s_client conecta via TLS e mostra o certificado e a negociação.')
      ]
    },
    {
      id: 'owb-07-validacao-entrada',
      title: 'Validação de entrada',
      goal: 'Validar entradas no servidor com allowlist, diferenciar validação, escape e sanitização e conhecer o risco do ReDoS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Entrada é não confiável',
            'Tudo que chega à aplicação de fora (parâmetros, formulários, cabeçalhos, cookies, JSON, arquivos enviados, até dados de outros sistemas) pode ter sido manipulado. A validação confere se o dado tem a forma que a aplicação espera ANTES de usá-lo. Ela precisa acontecer no SERVIDOR: a validação no navegador melhora a experiência do usuário, mas quem usa curl ou um proxy a ignora.'
          ),
          sl(
            'Allowlist em vez de denylist',
            'Uma ALLOWLIST (lista de permitidos) define exatamente o que é aceito e rejeita o resto. Uma DENYLIST (lista de proibidos) tenta listar o que é perigoso — e é frágil, pois sempre existe uma variação que você não previu (maiúsculas, codificações, caracteres alternativos). Prefira dizer "só letras, números e _ com 3 a 20 caracteres" a "não pode ter aspas nem ponto e vírgula".',
            `import re
USUARIO = re.compile(r'[a-z0-9_]{3,20}')
def valido(nome):
    return USUARIO.fullmatch(nome) is not None

print(valido('ana_01'))          # True
print(valido("x' OR '1'='1"))    # False
print(valido('a'))               # False (curto demais)`
          ),
          sl(
            'O que validar: tipo, tamanho, formato e faixa',
            'Cheque quatro coisas: TIPO (um número é mesmo número?), TAMANHO (limite máximo evita abusos e estouro de recursos), FORMATO (padrão esperado, como um CEP ou um e-mail) e FAIXA (idade entre 0 e 130, quantidade entre 1 e 100). Rejeite o que não passar, em vez de tentar "consertar" a entrada em silêncio. Use funções de conversão com tratamento de erro.',
            `def quantidade(txt):
    try:
        n = int(txt)
    except ValueError:
        raise ValueError('quantidade inválida')
    if not 1 <= n <= 100:
        raise ValueError('fora da faixa')
    return n`
          ),
          sl(
            'Canonicalização antes de validar',
            'O mesmo dado pode ter várias formas: codificações de URL (%2e%2e), maiúsculas e minúsculas, Unicode equivalente. Primeiro CANONICALIZE (converta para a forma padrão única: decodifique uma vez, normalize) e SÓ ENTÃO valide. Se você validar antes de decodificar, uma entrada pode passar na checagem e se transformar em algo perigoso depois.'
          ),
          sl(
            'Validação ≠ escape ≠ sanitização',
            'São três ferramentas distintas. VALIDAÇÃO: aceita ou rejeita a entrada. ESCAPE (ou codificação de saída): transforma caracteres especiais em texto inofensivo para o contexto onde serão usados (HTML, SQL, URL). SANITIZAÇÃO: remove ou altera partes perigosas de um conteúdo que você precisa aceitar (por exemplo, HTML permitido). Uma não substitui a outra: validar um campo não elimina a necessidade de escapar na saída. Regra: "valide na entrada, escape na saída".'
          ),
          sl(
            'Regex, ReDoS e mensagens de erro',
            'Expressões regulares são ótimas para validar, mas algumas, mal escritas, levam tempo exponencial com certas entradas: é o ReDoS (negação de serviço por expressão regular), que fere a disponibilidade. Evite padrões com repetições aninhadas ambíguas, limite o tamanho da entrada ANTES de aplicar a regex e prefira padrões simples. Nas respostas de erro, diga ao usuário o que corrigir de forma genérica, sem revelar detalhes internos (caminhos, consultas, pilhas de exceção); os detalhes vão para o log do servidor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Onde a validação de entrada que protege a aplicação deve ser feita?', 'c', [
          'No JavaScript do navegador, pois é onde o usuário digita',
          'Só no banco de dados, por meio de restrições de coluna e gatilhos',
          'No servidor, sempre, mesmo que o cliente também valide por conveniência',
          'Em um proxy reverso, e o código da aplicação confia no que chega'
        ], 'O cliente é controlado pelo usuário. A validação confiável precisa estar no servidor.'),
        mcq('q2', 'Qual é a diferença entre allowlist e denylist?', 'a', [
          'Allowlist aceita só o esperado; denylist lista o proibido e deixa passar o imprevisto',
          'A allowlist lista o que é perigoso e a denylist lista o que é seguro',
          'As duas funcionam de forma equivalente; só mudam de nome conforme a linguagem ou o framework usado',
          'A denylist é mais segura porque bloqueia todas as variações conhecidas de ataque'
        ], 'Allowlist é a abordagem robusta: aceita só o esperado. Denylist é frágil por depender de prever todo o perigoso.'),
        mcq('q3', 'O código aceita um campo "quantidade" convertendo com int() e sem checar o valor. Qual validação está faltando?', 'b', [
          'Tipo, porque int() não verifica tipos de entrada recebidos',
          'Faixa (mínimo e máximo), e o tratamento do erro de conversão',
          'Formato de e-mail, pois todo campo de texto precisa conter o caractere @',
          'Escape de HTML na entrada, antes de gravar'
        ], 'Além de tratar a falha de conversão, é preciso limitar a faixa (por exemplo 1 a 100).'),
        fill('q4', 'Qual função do módulo re do Python exige que a string INTEIRA case com o padrão?', 'if re.___(r\'[a-z0-9_]{3,20}\', nome):', ['fullmatch', 're.fullmatch'], 'fullmatch exige que toda a string case, evitando aceitar entradas que apenas contenham um trecho válido.'),
        mcq('q5', 'Por que canonicalizar a entrada antes de validar?', 'd', [
          'Para deixar o texto mais curto e economizar memória e tempo no processamento da requisição',
          'Para que a validação possa ser feita só no cliente, evitando custo extra de processamento no servidor',
          'Para que o escape de saída deixe de ser necessário em páginas dinâmicas e em respostas de API',
          'Uma entrada pode ter várias codificações; validar antes de normalizar pode deixar passar algo perigoso'
        ], 'Normalizar primeiro garante que a checagem vê a mesma forma que será usada depois.'),
        mcq('q6', 'Qual é o papel de cada técnica?', 'c', [
          'Validação transforma caracteres em texto inofensivo para o contexto; escape rejeita a entrada incorreta antes do uso',
          'Sanitização rejeita a entrada incorreta; validação remove os trechos perigosos de conteúdo aceito',
          'Validação aceita ou rejeita; escape neutraliza a saída; sanitização remove partes perigosas',
          'As três fazem a mesma coisa e uma delas basta'
        ], 'Cada técnica tem um papel distinto; combinam-se, não se substituem.'),
        mcq('q7', 'O que é ReDoS?', 'b', [
          'Um vírus que apaga expressões regulares do servidor e impede novos cadastros',
          'DoS causado por regex mal escrita que fica explosivamente lenta com certas entradas',
          'Um modo de escapar caracteres especiais em consultas SQL e em comandos do shell',
          'Um protocolo de resposta de DNS'
        ], 'Padrões com repetições aninhadas podem tornar o processamento muito lento, afetando a disponibilidade.'),
        fill('q8', 'Complete a regra de ouro: "valide na entrada, ___ na saída".', 'Valide na entrada, ___ na saída.', ['escape', 'escape na saída', 'escapar', 'codifique'], 'Escapar (codificar) a saída conforme o contexto neutraliza caracteres especiais ao exibir ou enviar o dado.')
      ]
    },
    {
      id: 'owb-08-sql-injection',
      title: 'Injeção de SQL',
      goal: 'Entender como a concatenação de entrada em consultas abre a porta à injeção de SQL e corrigir com consultas parametrizadas e privilégio mínimo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Como a injeção de SQL acontece',
            'Uma consulta SQL é texto interpretado pelo banco. Se a aplicação CONCATENA a entrada do usuário nesse texto, o banco não consegue distinguir o que era o comando do programador do que veio do usuário: a entrada passa a ser tratada como parte do comando. É a mistura de dados com código, e a causa raiz está no código da aplicação, não no banco.'
          ),
          sl(
            'Laboratório local: o código vulnerável',
            'Banco SQLite em memória, só no seu computador, com dados fictícios. A função vulnerável monta a consulta por concatenação. Com a cadeia didática clássica da documentação da OWASP, a condição vira sempre verdadeira.',
            `import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE usuarios(nome TEXT, senha_hash TEXT)')
db.executemany('INSERT INTO usuarios VALUES(?,?)',
               [('ana', 'h1'), ('bia', 'h2')])

def buscar_vulneravel(nome):
    sql = "SELECT nome FROM usuarios WHERE nome = '" + nome + "'"
    return db.execute(sql).fetchall()

entrada = "' OR '1'='1"
# consulta montada:
# SELECT nome FROM usuarios WHERE nome = '' OR '1'='1'
print(buscar_vulneravel('ana'))   # [('ana',)]
print(buscar_vulneravel(entrada)) # [('ana',), ('bia',)]  <- todos!`
          ),
          sl(
            'Impacto',
            'Dependendo do ponto vulnerável e das permissões da conta de banco, a injeção pode permitir ler dados que não deveriam ser lidos (confidencialidade), alterar ou apagar registros (integridade), contornar um login (a condição "senha correta" vira sempre verdadeira) e, em casos graves, afetar a disponibilidade. Por isso injeção está entre as classes de falha mais críticas do OWASP Top 10.'
          ),
          sl(
            'Defesa nº 1: consultas parametrizadas',
            'Em uma consulta parametrizada (prepared statement), o comando SQL e os dados viajam SEPARADOS: o banco compila o comando com marcadores (? ou %s ou :nome) e recebe os valores depois, tratados sempre como dados, nunca como SQL. A mesma entrada maliciosa vira só um texto procurado na coluna.',
            `def buscar_seguro(nome):
    return db.execute(
        'SELECT nome FROM usuarios WHERE nome = ?', (nome,)
    ).fetchall()

print(buscar_seguro('ana'))    # [('ana',)]
print(buscar_seguro(entrada))  # []  <- vira apenas texto, sem resultado`
          ),
          sl(
            'ORMs, procedures e WAF',
            'ORMs usam parametrização por baixo e ajudam muito, mas SQL cru dentro do ORM (raw, execute com f-string) continua vulnerável se concatenar entrada. Stored procedures não são mágica: se elas montarem SQL por concatenação internamente, a falha continua. Um WAF (firewall de aplicação web) pode bloquear padrões conhecidos, mas é uma camada extra, não substitui o código seguro. Nomes de tabela e colunas não podem ser parametrizados: se vierem do usuário, escolha de uma allowlist fixa.'
          ),
          sl(
            'Camadas extras: privilégio mínimo, validação e erros',
            'Use para a aplicação uma conta de banco com permissões mínimas (sem DROP, sem acesso a tabelas que ela não usa): se algo falhar, o estrago é menor. Valide a entrada (tipo, tamanho, formato) como segunda camada. E nunca devolva ao usuário a mensagem de erro detalhada do banco, pois ela revela estrutura (tabelas, colunas, consulta); mostre uma mensagem genérica e registre o detalhe no log do servidor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a causa raiz de uma injeção de SQL?', 'd', [
          'O banco de dados não criptografa as consultas que recebe da aplicação web',
          'O navegador envia caracteres especiais que o servidor não consegue ler direito',
          'O uso de HTTP em vez de HTTPS entre o navegador e o servidor',
          'A entrada do usuário é concatenada à consulta, misturando dados com código SQL'
        ], 'O banco não distingue o comando do programador do que veio do usuário quando tudo vira um único texto.'),
        mcq('q2', 'Qual é a defesa principal contra injeção de SQL?', 'b', [
          'Remover as aspas simples de toda entrada recebida antes de montar a consulta',
          'Usar consultas parametrizadas, separando comando e valores',
          'Exibir uma mensagem de erro detalhada para ajudar a depurar',
          'Aceitar apenas requisições vindas do mesmo domínio'
        ], 'Parametrizar mantém a entrada como dado. Remover aspas é uma denylist frágil.'),
        mcq('q3', 'O código abaixo é vulnerável?\n\nnome = request.args["nome"]\ncur.execute(f"SELECT * FROM clientes WHERE nome = \'{nome}\'")', 'c', [
          'Não, porque usa f-string, que escapa automaticamente os valores inseridos na consulta',
          'Não, porque o cursor do banco valida a consulta inteira antes de executar o comando',
          'Sim, concatena a entrada; usar cur.execute("... = ?", (nome,)) corrige',
          'Sim, mas só se a tabela se chamar "clientes"'
        ], 'f-string apenas concatena. A correção é passar os valores como parâmetros.'),
        fill('q4', 'Complete com o marcador de parâmetro usado pelo sqlite3 do Python.', 'db.execute("SELECT nome FROM usuarios WHERE nome = ___", (nome,))', ['?', '"?"', '\'?\''], 'No sqlite3 o marcador posicional é ?. Outros drivers usam %s ou :nome.'),
        mcq('q5', 'Um dev usa um ORM, mas escreveu um trecho com SQL cru: session.execute("SELECT ... WHERE id = " + id). O que acontece?', 'a', [
          'Continua possível, porque a concatenação em SQL cru dentro do ORM não é parametrizada',
          'Fica seguro, pois todo ORM sanitiza qualquer texto que passa por ele, inclusive SQL cru',
          'Fica seguro desde que o servidor use HTTPS',
          'O ORM bloqueia a execução do trecho com um erro de compilação ao detectar concatenação'
        ], 'ORMs protegem quando usados via API parametrizada; SQL cru com concatenação é tão vulnerável quanto antes.'),
        mcq('q6', 'Como o privilégio mínimo da conta de banco ajuda neste cenário?', 'd', [
          'Impede que qualquer injeção aconteça, o que dispensa a parametrização nas consultas',
          'Torna as consultas mais rápidas por reduzir o número de tabelas visíveis à conta',
          'Criptografa as senhas guardadas nas tabelas',
          'Limita o dano se houver falha, pois a conta é restrita'
        ], 'É uma camada de defesa em profundidade: não corrige a falha, mas contém o estrago.'),
        mcq('q7', 'Por que não mostrar a mensagem de erro detalhada do banco ao usuário?', 'b', [
          'Porque as mensagens de erro do banco são inventadas pelo driver e não ajudam em nada',
          'Pode revelar tabelas, colunas e a consulta; o detalhe deve ir para o log',
          'Porque o usuário comum não precisa saber que houve erro durante o processamento',
          'Porque o HTTP não permite corpo em respostas de erro com código 500'
        ], 'Mostre mensagem genérica ao usuário e registre os detalhes no log do servidor.'),
        fill('q8', 'Qual tipo de proteção, em vez de reescrever o código, bloqueia padrões de ataque conhecidos mas NÃO substitui o código seguro? Responda com a sigla de 3 letras.', 'Firewall de aplicação web: ___', ['waf'], 'O WAF é camada extra; a falha continua no código se a consulta for concatenada.')
      ]
    },
    {
      id: 'owb-09-xss',
      title: 'Cross-Site Scripting (XSS)',
      goal: 'Entender XSS refletido, armazenado e baseado em DOM e preveni-lo com codificação de saída contextual, CSP e cookies HttpOnly.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é XSS',
            'Cross-Site Scripting é quando JavaScript escolhido por um atacante passa a executar no navegador de outra pessoa, no contexto do SEU site. O navegador confia no site: se o seu HTML contiver um script injetado, ele o executa com os mesmos poderes da página legítima. A causa é inserir dados não confiáveis no HTML sem codificá-los para aquele contexto.'
          ),
          sl(
            'Refletido, armazenado e baseado em DOM',
            'REFLETIDO: o dado vem na requisição (por exemplo um parâmetro da URL) e a resposta o devolve sem tratamento. ARMAZENADO: o dado malicioso é guardado (comentário, perfil, mensagem) e executa para todo mundo que visualizar a página. BASEADO EM DOM: a falha está no JavaScript do front-end, que pega dados (location, hash) e os insere na página de forma insegura, sem passar pelo servidor. O armazenado costuma ter o maior alcance.'
          ),
          sl(
            'Impacto',
            'Um script executando como a vítima pode: ler dados exibidos na página, executar ações em nome do usuário (enviar formulários, alterar dados), redirecionar para páginas falsas, desfigurar a página e, se o cookie de sessão não for HttpOnly, tentar lê-lo para sequestrar a sessão. Os poderes são os do usuário logado, por isso o XSS é grave.'
          ),
          sl(
            'Demonstração local: sem escape vs com escape',
            'Em laboratório, um programa Python gera HTML. Com a cadeia didática clássica <script>alert(1)</script>, a versão sem escape coloca uma tag de script real na página; com html.escape, os caracteres especiais viram entidades e o navegador mostra apenas o texto.',
            `import html
entrada = '<script>alert(1)</script>'

print('<p>Olá, ' + entrada + '</p>')
# <p>Olá, <script>alert(1)</script></p>   <- vira script!

print('<p>Olá, ' + html.escape(entrada) + '</p>')
# <p>Olá, &lt;script&gt;alert(1)&lt;/script&gt;</p>   <- só texto`
          ),
          sl(
            'Defesa 1: codificação de saída contextual',
            'O escape correto DEPENDE do contexto onde o dado entra: corpo HTML (escape de < > & e aspas), valor de ATRIBUTO (e aspas obrigatórias no atributo), dentro de JAVASCRIPT (codificação específica; melhor evitar inserir dados em scripts, passando-os como JSON/atributos data-*) e em URL (codificação percentual). Usar o escape errado para o contexto não protege. Frameworks modernos (React, Angular, Vue, Jinja2 com autoescape) escapam por padrão no HTML.'
          ),
          sl(
            'Saídas de emergência perigosas e sanitização',
            'Os frameworks têm "portas dos fundos" que desligam o escape: innerHTML, dangerouslySetInnerHTML (React), |safe (Jinja2/Django) e v-html (Vue). Só use com conteúdo confiável. Quando PRECISAR aceitar HTML do usuário (um editor de texto rico), sanitize com uma biblioteca confiável e mantida (por exemplo DOMPurify no navegador ou bleach/nh3 no Python) que use allowlist de tags e atributos; não escreva a sua própria com regex.'
          ),
          sl(
            'Defesa em profundidade: CSP e HttpOnly',
            'CSP (Content-Security-Policy) é um cabeçalho que diz ao navegador de onde scripts podem ser carregados e se scripts inline são permitidos; uma política restritiva reduz o dano se alguma falha de XSS existir (segunda camada, não substituta do escape). O atributo HttpOnly no cookie de sessão impede que JavaScript o leia, dificultando o roubo da sessão. O XSS continua grave, mas o estrago diminui.',
            'Content-Security-Policy: default-src \'self\'; script-src \'self\'\nSet-Cookie: sid=<id>; HttpOnly; Secure; SameSite=Lax'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza um XSS armazenado?', 'a', [
          'O conteúdo malicioso fica guardado e executa para quem visualizar depois',
          'A falha existe só no JavaScript do front-end e a requisição nunca passa pelo servidor da aplicação',
          'O script malicioso aparece só na barra de endereço do navegador do atacante',
          'O script é executado diretamente no banco de dados durante a gravação'
        ], 'No armazenado, o dado persiste e afeta todos que visualizam o conteúdo.'),
        mcq('q2', 'Qual é o principal motivo de existir XSS?', 'b', [
          'O navegador executa JavaScript, o que por si só é uma falha de segurança',
          'Dados não confiáveis entram no HTML sem codificação adequada ao contexto',
          'O site usa cookies de sessão em vez de tokens de acesso enviados em cabeçalhos',
          'O servidor aceita requisições com o método POST vindas de formulários HTML'
        ], 'A causa é inserir entrada sem codificar para o contexto de saída.'),
        mcq('q3', 'Este código React é vulnerável?\n\n<div dangerouslySetInnerHTML={{ __html: comentario }} />', 'a', [
          'Sim, se vier do usuário sem sanitização; sanitize com biblioteca ou renderize como texto',
          'Não, porque o React escapa qualquer valor, inclusive neste caso, desligando a propriedade',
          'Não, porque o nome da propriedade começa com "dangerously" e isso ativa uma proteção',
          'Sim, mas só se o site não usar HTTPS'
        ], 'dangerouslySetInnerHTML desliga o escape automático; o conteúdo precisa ser confiável ou sanitizado.'),
        fill('q4', 'Qual função da biblioteca padrão do Python converte < > & e aspas em entidades HTML? (módulo html)', 'import html\nsaida = html.___(entrada)', ['escape', 'html.escape'], 'html.escape transforma caracteres especiais em entidades, neutralizando-os no contexto de HTML.'),
        mcq('q5', 'Qual atributo de cookie dificulta o roubo do cookie de sessão por um script injetado?', 'd', [
          'Secure',
          'Path',
          'Domain',
          'HttpOnly'
        ], 'HttpOnly impede que JavaScript leia o cookie via document.cookie. Secure só o restringe a conexões HTTPS.'),
        mcq('q6', 'Qual é o papel da Content-Security-Policy em relação ao XSS?', 'c', [
          'Substitui o escape de saída, tornando-o desnecessário em páginas bem configuradas',
          'Criptografa o conteúdo das páginas para que o script injetado não consiga lê-lo',
          'Segunda camada: limita de onde scripts carregam e se inline rodam, reduzindo o dano',
          'Impede que o atacante envie requisições ao servidor a partir do navegador da vítima'
        ], 'A CSP é defesa em profundidade; a defesa principal continua sendo a codificação de saída.'),
        mcq('q7', 'Uma aplicação precisa permitir que usuários formatem comentários com algumas tags HTML. Qual abordagem é a mais adequada?', 'b', [
          'Usar uma regex própria que remova a palavra "script" e os atributos de evento',
          'Sanitizar com biblioteca confiável e mantida, usando allowlist de tags',
          'Inserir o HTML bruto e confiar que o navegador bloqueia scripts perigosos por conta própria',
          'Escapar todos os caracteres e esperar que o formato continue funcionando'
        ], 'Bibliotecas de sanitização especializadas usam allowlist; regex caseiras são facilmente contornadas.'),
        fill('q8', 'Qual propriedade do DOM é uma porta perigosa para XSS por interpretar o texto atribuído como HTML? (nome da propriedade)', 'elemento.___ = dadoDoUsuario', ['innerhtml'], 'innerHTML interpreta o texto como HTML; prefira textContent para exibir texto.')
      ]
    },
    {
      id: 'owb-10-outras-injecoes',
      title: 'Outras injeções',
      goal: 'Reconhecer o padrão comum das injeções (dados misturados com comando) e aplicar as defesas em comandos do SO, NoSQL, LDAP, templates, cabeçalhos e logs.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O padrão comum a toda injeção',
            'SQL, XSS e todas as injeções desta lição têm a mesma raiz: a aplicação monta um comando, consulta ou documento em uma linguagem (SQL, shell, HTML, LDAP...) misturando texto fixo com entrada do usuário, e o interpretador não distingue os dois. A cura geral: separar DADOS de CÓDIGO usando APIs que recebem os valores à parte, evitar interpretadores quando possível, validar com allowlist e dar o menor privilégio possível.'
          ),
          sl(
            'Injeção de comandos do SO',
            'Quando a aplicação monta uma linha de comando com a entrada e a entrega ao shell (os.system, shell=True), caracteres especiais do shell (como ;, && ou |) podem encadear outros comandos. A defesa é não usar o shell: subprocess com LISTA de argumentos, onde cada item é um argumento literal. Melhor ainda, use uma biblioteca da linguagem em vez de chamar um programa externo.',
            `import os, subprocess
entrada = 'oi && echo EXTRA'      # comando inofensivo, só para a demo

os.system('echo ' + entrada)      # vulnerável: passa pelo shell
# saída real:
# oi
# EXTRA                           <- um segundo comando executou

subprocess.run(['echo', entrada]) # seguro: sem shell
# saída real:
# oi && echo EXTRA                <- tudo é só texto do argumento`
          ),
          sl(
            'NoSQL e LDAP',
            'Bancos NoSQL também sofrem injeção: se a aplicação aceita um objeto JSON da requisição e o usa direto como filtro, o usuário pode enviar operadores de consulta no lugar de um valor simples (por exemplo, no MongoDB, um objeto com operador em vez de uma string). Defesa: validar o TIPO esperado (texto, não objeto) e montar o filtro no servidor. Em LDAP (diretórios, login corporativo), filtros montados por concatenação sofrem do mesmo problema; escape os caracteres especiais do filtro e valide a entrada com allowlist.'
          ),
          sl(
            'Injeção em templates (SSTI)',
            'SSTI (Server-Side Template Injection) ocorre quando a entrada do usuário vira PARTE DO TEMPLATE (o texto do modelo), e não apenas um valor passado a ele. O motor de templates avalia expressões e, dependendo dele, o impacto pode chegar à execução de código no servidor. Defesa: o template é sempre fixo, escrito por você, e a entrada vai SÓ como variável de contexto; não use render_template_string com texto do usuário concatenado.',
            '# vulnerável: entrada vira parte do template\nrender_template_string("Olá " + nome)\n\n# seguro: template fixo, entrada como variável\nrender_template_string("Olá {{ nome }}", nome=nome)'
          ),
          sl(
            'Injeção de cabeçalhos (CRLF) e em logs',
            'Cabeçalhos HTTP são separados por quebras de linha (CRLF). Se a entrada do usuário vai para um cabeçalho (por exemplo um redirecionamento ou um cookie) sem remover \\r e \\n, o atacante pode inserir cabeçalhos extras ou dividir a resposta. Defesa: rejeitar/remover quebras de linha na entrada que vai para cabeçalhos (frameworks modernos já recusam) e validar URLs de redirecionamento. Na injeção em LOGS, entradas com quebra de linha forjam linhas falsas de registro e enganam quem investiga: registre com formato estruturado (JSON) e neutralize quebras de linha.'
          ),
          sl(
            'Checklist de defesa contra injeções',
            '1) Identifique cada interpretador usado (SQL, shell, template, LDAP, NoSQL, HTML). 2) Use sempre a API que separa dados e comando (parametrização, lista de argumentos, variáveis de contexto). 3) Prefira bibliotecas a invocar programas externos. 4) Valide entradas com allowlist (tipo, formato, tamanho). 5) Aplique o menor privilégio ao processo e às contas envolvidas, para conter danos. 6) Revise o código procurando concatenação de texto em comandos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o padrão comum de todas as injeções?', 'a', [
          'Dados do usuário se misturam a um comando e o interpretador não distingue os dois',
          'Só afetam bancos de dados relacionais, como SQLite e MySQL, e outras tecnologias ficam imunes',
          'Dependem de o servidor usar um protocolo sem criptografia entre cliente e servidor',
          'Sempre exigem que o atacante tenha uma conta autenticada'
        ], 'A raiz é a mistura de dados com código; a solução geral é separá-los.'),
        mcq('q2', 'Qual chamada é a mais segura para executar um programa externo com um parâmetro vindo do usuário?', 'd', [
          'os.system("ping " + host) com o host vindo direto do formulário',
          'subprocess.run("ping " + host, shell=True) montando a linha de comando',
          'os.popen(f"ping {host}") com o host recebido na requisição',
          'subprocess.run(["ping", host]) com validação do host por allowlist e sem shell'
        ], 'Lista de argumentos sem shell trata a entrada como argumento literal; a validação reforça. Ainda assim, prefira bibliotecas.'),
        mcq('q3', 'O código abaixo é vulnerável?\n\nnome = request.args["nome"]\nreturn render_template_string("Olá " + nome)', 'b', [
          'Não, porque o Flask escapa tudo que passa por render_template_string, inclusive o template',
          'Sim, a entrada vira parte do template (SSTI); o correto é um template fixo',
          'Não, porque a variável nome é sempre uma string',
          'Sim, mas só quando o método HTTP for POST'
        ], 'Concatenar a entrada no texto do template permite que ela seja avaliada como template.'),
        fill('q4', 'Qual função do módulo subprocess do Python executa um comando recebendo uma LISTA de argumentos, sem shell por padrão?', 'subprocess.___([\'echo\', entrada])', ['run', 'subprocess.run', 'check_output', 'call', 'popen'], 'subprocess.run com lista de argumentos evita o shell, tratando cada item como literal.'),
        mcq('q5', 'Qual a defesa adequada contra injeção NoSQL com filtros montados a partir de JSON da requisição?', 'a', [
          'Validar o tipo esperado (texto, por exemplo) e montar o filtro no servidor',
          'Remover o caractere "$" de todas as strings que chegam ao servidor e repassar o objeto',
          'Trocar o banco por outro NoSQL de nome diferente, com outro formato de consulta',
          'Ocultar o campo no formulário HTML do navegador'
        ], 'Aceitar objetos arbitrários permite operadores de consulta. Valide o tipo e construa o filtro você mesmo.'),
        mcq('q6', 'Qual risco existe ao colocar entrada do usuário diretamente em um cabeçalho HTTP, como Location?', 'c', [
          'O navegador deixa de aceitar cookies do site depois do redirecionamento',
          'O servidor deixa de responder em HTTPS para os clientes seguintes ao envio',
          'Quebras de linha (CRLF) inserem cabeçalhos extras ou dividem a resposta HTTP',
          'O cabeçalho passa a ser criptografado e fica ilegível para o navegador'
        ], 'CRLF na entrada pode forjar cabeçalhos; remova ou rejeite quebras de linha e valide URLs.'),
        mcq('q7', 'Qual cuidado protege os logs contra injeção?', 'd', [
          'Gravar tudo em texto puro, exatamente como chegou, para preservar a evidência original',
          'Gravar logs só quando houver um incidente confirmado pela equipe de segurança',
          'Desligar o registro de logs para que não haja o que forjar nem o que vazar',
          'Registrar em formato estruturado e neutralizar sempre as quebras de linha na entrada'
        ], 'Entradas com quebra de linha podem forjar registros; formato estruturado e neutralização reduzem o risco.'),
        fill('q8', 'Como se chama a injeção em que a entrada vira parte do texto do modelo de página no servidor? Responda com a sigla de 4 letras.', '___: Server-Side Template Injection', ['ssti'], 'SSTI ocorre quando a entrada vira parte do template avaliado pelo motor; mantenha o template fixo.')
      ]
    },
    {
      id: 'owb-11-autenticacao-senhas',
      title: 'Autenticação e senhas',
      goal: 'Guardar senhas com hash lento e sal, comparar com segurança e se defender de força bruta, credential stuffing e enumeração de usuários.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autenticação vs autorização',
            'AUTENTICAÇÃO responde "quem é você?" (login com senha, MFA, chave). AUTORIZAÇÃO responde "o que você pode fazer?" (permissões sobre cada recurso). São etapas separadas: estar autenticado não significa ter permissão para tudo. Esta lição trata da primeira; a autorização vem na lição de controle de acesso.'
          ),
          sl(
            'Nunca guarde a senha em texto puro',
            'Se o banco vazar (por uma falha, backup exposto ou pessoa de dentro), senhas em texto puro entregam as contas de todos — e, como muita gente reutiliza senhas, também contas em outros sites. Por isso o servidor guarda apenas uma versão derivada da senha (um hash) que não permite recuperar a original; no login, calcula-se o hash da senha digitada e compara-se com o guardado.'
          ),
          sl(
            'Hash lento com sal',
            'Para senhas use algoritmos projetados para serem LENTOS e custosos de memória: Argon2, scrypt, bcrypt ou PBKDF2. Isso torna cada tentativa cara para quem tenta adivinhar. O SAL é um valor aleatório e único por senha, guardado junto do hash: ele garante que duas senhas iguais gerem hashes diferentes e inutiliza tabelas pré-calculadas. MD5, SHA-1 e SHA-256 simples são rápidos demais — projetados para integridade, não para senhas — e permitem testar bilhões de palpites por segundo.',
            `import hashlib, hmac, os

def gerar(senha, sal=None):
    sal = sal or os.urandom(16)      # sal aleatório por senha
    h = hashlib.scrypt(senha.encode(), salt=sal, n=2**14, r=8, p=1)
    return sal, h

sal, h = gerar('correct horse')      # exemplo de senha de teste
print(len(sal), len(h))              # 16 64
sal2, h2 = gerar('correct horse')
print(h == h2)                       # False  (sais diferentes)

# verificação em tempo constante
print(hmac.compare_digest(h, gerar('correct horse', sal)[1]))  # True
print(hmac.compare_digest(h, gerar('errada', sal)[1]))         # False`
          ),
          sl(
            'Comparação em tempo constante',
            'Comparar hashes com == pode terminar mais cedo no primeiro byte diferente, e a diferença de tempo, em tese, vaza informação. Use hmac.compare_digest (Python) ou equivalente, que leva tempo independente do conteúdo. Na prática, bibliotecas de senha (bcrypt, argon2-cffi) já fazem a verificação corretamente: prefira-as a implementar tudo na mão. Os parâmetros de custo devem ser ajustados para o hardware atual e revisados periodicamente.'
          ),
          sl(
            'Ataques: força bruta, credential stuffing e enumeração',
            'FORÇA BRUTA: testar muitas senhas contra uma conta. CREDENTIAL STUFFING (preenchimento de credenciais): usar pares usuário e senha vazados de outros sites, esperando que a pessoa reutilize a senha. ENUMERAÇÃO DE USUÁRIOS: descobrir quais contas existem pela diferença nas respostas ("usuário não encontrado" vs "senha incorreta") ou no tempo de resposta. Defesa contra a última: mensagem genérica ("usuário ou senha inválidos") e tempo de resposta semelhante em ambos os casos, inclusive em cadastro e recuperação de senha.'
          ),
          sl(
            'Defesas modernas',
            'LIMITAÇÃO de tentativas (rate limiting) e atraso progressivo por conta e por origem; bloqueio temporário com cuidado para não virar negação de serviço contra o próprio usuário. MFA (autenticação multifator): mesmo com a senha vazada, falta o segundo fator. Verificação de senhas VAZADAS conhecidas ao cadastrar. Política moderna: valorize COMPRIMENTO (frases longas) em vez de regras de complexidade forçada, aceite espaços e qualquer caractere, e evite trocas periódicas obrigatórias sem motivo. Recuperação de conta: link de uso único, curto prazo de validade e token aleatório, nunca revelando se a conta existe.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre autenticação e autorização?', 'b', [
          'Autenticação define o que o usuário pode fazer; autorização verifica a senha digitada',
          'Autenticação confirma quem é o usuário; autorização decide o que ele pode fazer',
          'São sinônimos usados por frameworks diferentes',
          'Autenticação só existe em aplicações móveis'
        ], 'Autenticar é identificar com segurança; autorizar é decidir permissões.'),
        mcq('q2', 'Por que senhas não devem ser guardadas em texto puro?', 'd', [
          'Porque ocupam mais espaço no banco do que os hashes e deixam as consultas lentas',
          'Porque o navegador se recusa a enviar senhas em texto puro pela rede ao servidor',
          'Porque o HTTPS já criptografa o banco de dados, tornando o armazenamento seguro',
          'Um vazamento do banco entregaria as contas, e as de outros sites com a senha reutilizada'
        ], 'Guardar só um hash lento com sal limita o dano de um vazamento.'),
        mcq('q3', 'Qual escolha é adequada para armazenar senhas?', 'c', [
          'SHA-256 simples, por ser um algoritmo moderno e padronizado',
          'MD5 com um sal fixo igual para todos os usuários',
          'Argon2, scrypt, bcrypt ou PBKDF2, com sal aleatório para cada senha armazenada',
          'Criptografar com uma chave guardada no mesmo banco de dados das senhas'
        ], 'Algoritmos de hash de senha são lentos de propósito. SHA-256 simples é rápido demais para esse uso.'),
        fill('q4', 'Como se chama o valor aleatório e único por senha, guardado junto do hash, que evita hashes iguais para senhas iguais?', 'h = scrypt(senha, salt=___)  # valor aleatório por usuário', ['sal', 'salt'], 'O sal (salt) diferencia os hashes e inutiliza tabelas pré-calculadas.'),
        mcq('q5', 'Qual função do Python compara dois valores secretos em tempo independente do conteúdo?', 'a', [
          'hmac.compare_digest',
          'operador ==',
          'str.startswith',
          'hashlib.md5'
        ], 'compare_digest evita vazamento por diferença de tempo; == pode terminar cedo.'),
        mcq('q6', 'Um site responde "usuário não encontrado" quando o login não existe e "senha incorreta" quando existe. Qual é o problema e a correção?', 'c', [
          'Nenhum: ajuda o usuário a saber onde errou e melhora muito a experiência de uso',
          'Fere a disponibilidade; a correção é aumentar o limite de conexões simultâneas',
          'Permite enumerar contas; corrige-se com mensagem genérica e tempo parecido',
          'Fere a integridade; a correção é gravar o log em um arquivo separado do sistema'
        ], 'Respostas diferentes revelam quais usuários existem; uma mensagem genérica evita a enumeração.'),
        mcq('q7', 'O que é credential stuffing e qual defesa mais ajuda?', 'd', [
          'Preencher formulários automaticamente com dados fictícios; ajuda a validar o HTML recebido',
          'Cifrar o cookie de sessão com chave simétrica; ajudaria trocar essa chave semanalmente no servidor',
          'Adivinhar senhas pela fórmula nome mais ano; ajuda proibir nomes na senha',
          'Testar pares vazados de outros sites; ajudam MFA e checagem de vazadas'
        ], 'Reutilização de senhas torna o ataque efetivo; MFA e checagem de senhas vazadas reduzem o impacto.'),
        fill('q8', 'Qual sigla designa o uso de um segundo fator (além da senha) para autenticar?', 'Senha + código do aplicativo = ___', ['mfa', '2fa', 'autenticação multifator', 'autenticacao multifator'], 'MFA acrescenta fatores adicionais, de modo que a senha vazada sozinha não basta.')
      ]
    },
    {
      id: 'owb-12-sessoes-cookies',
      title: 'Sessões e cookies',
      goal: 'Gerenciar sessões com IDs aleatórios, atributos de cookie corretos, regeneração no login, expiração e logout efetivo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Da falta de estado à sessão',
            'Como o HTTP não guarda estado, o login só funciona se o servidor entregar um identificador de sessão e o navegador o devolver a cada requisição, geralmente num cookie. O servidor guarda, do seu lado, o que esse ID significa (qual usuário, quando expira). Quem possui o ID é tratado como o usuário: proteger o ID é proteger a conta.'
          ),
          sl(
            'ID de sessão longo e aleatório',
            'O ID deve ser imprevisível: longo e gerado por um CSPRNG (gerador de números aleatórios criptograficamente seguro), nunca por contador, data ou random comum. Em Python, use o módulo secrets. Um ID previsível permite adivinhar sessões alheias.',
            `import secrets
sid = secrets.token_urlsafe(32)      # 32 bytes aleatórios
print(len(sid))                      # 43 caracteres (url-safe)
print(secrets.token_urlsafe(32) == secrets.token_urlsafe(32))  # False`
          ),
          sl(
            'Atributos do cookie',
            'HttpOnly: JavaScript não lê o cookie (reduz o dano de XSS). Secure: o navegador só envia por HTTPS. SameSite: controla o envio em requisições entre sites — Strict (só no mesmo site), Lax (também em navegação de topo por links, padrão razoável) e None (sempre, exige Secure). Path e Domain delimitam onde o cookie vale (prefira o escopo mais restrito). Max-Age ou Expires definem a validade; sem eles o cookie dura até fechar o navegador.',
            'Set-Cookie: sid=<id-aleatorio>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800'
          ),
          sl(
            'Fixação de sessão e regeneração do ID',
            'Na FIXAÇÃO de sessão, o atacante faz a vítima usar um ID que ele já conhece; se o servidor mantiver o mesmo ID depois do login, o atacante passa a ter uma sessão autenticada. Defesa: gerar um ID NOVO (e invalidar o antigo) a cada mudança de privilégio, em especial no login, e nunca aceitar IDs de sessão vindos da URL ou de IDs que o servidor não criou.'
          ),
          sl(
            'Expiração e logout',
            'Toda sessão deve expirar: por INATIVIDADE (ociosa, por exemplo alguns minutos sem uso) e por tempo ABSOLUTO (um limite máximo mesmo com uso contínuo). O logout precisa INVALIDAR a sessão no servidor — só apagar o cookie do navegador deixa o ID válido para quem o tiver copiado. Ações sensíveis (trocar senha, e-mail) devem pedir reautenticação.'
          ),
          sl(
            'Dados no cookie e JWT',
            'Não coloque dados sensíveis (senha, CPF, permissões editáveis) no cookie: o cliente pode ler e alterar, a menos que seja assinado e cifrado, e mesmo assim prefira guardar dados no servidor. Cookie de sessão guarda só o ID. Tokens JWT são assinados e carregam dados no próprio token (sem estado no servidor), mas são difíceis de revogar antes de expirar e muitos usos exigem cuidado; para aplicações web tradicionais, sessões no servidor com cookie HttpOnly são a escolha simples e segura.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como deve ser gerado um ID de sessão?', 'c', [
          'Com um contador sequencial, para garantir que o valor não se repita',
          'Com o horário atual em milissegundos mais o nome do usuário',
          'Com um CSPRNG, longo e imprevisível, como secrets.token_urlsafe(32), e não por contador',
          'Com random.randint, que é rápido e suficiente para uso geral na aplicação'
        ], 'IDs previsíveis permitem adivinhar sessões. Use gerador criptograficamente seguro.'),
        mcq('q2', 'O que faz o atributo Secure de um cookie?', 'b', [
          'Impede que JavaScript leia o cookie',
          'Faz o navegador enviar o cookie apenas por conexões HTTPS',
          'Impede que o cookie seja enviado em requisições vindas de outros sites',
          'Criptografa o valor do cookie com a chave do servidor'
        ], 'Secure restringe o envio a HTTPS. HttpOnly bloqueia leitura por script; SameSite controla o envio entre sites.'),
        mcq('q3', 'Qual valor de SameSite envia o cookie em navegação de topo por links vindos de outros sites, mas não em requisições entre sites que mudam estado, como POST de formulário externo?', 'a', [
          'Lax',
          'Strict',
          'None',
          'Secure'
        ], 'Lax permite o cookie em navegações de topo seguras (GET por link) e o bloqueia em POSTs entre sites. Strict bloqueia até os links; None sempre envia.'),
        fill('q4', 'Qual atributo de cookie impede que scripts (document.cookie) o leiam?', 'Set-Cookie: sid=<id>; ___; Secure', ['httponly'], 'HttpOnly reduz o impacto de um XSS ao impedir o acesso do script ao cookie de sessão.'),
        mcq('q5', 'O que é fixação de sessão e como evitá-la?', 'd', [
          'Prender a sessão do usuário a um único navegador; evita-se com cookies persistentes',
          'Fixar o tempo de expiração em um valor padrão; evita-se com sessões sem expiração',
          'Gravar a sessão em disco de forma fixa; evita-se guardando-a em memória',
          'Vítima usa um ID conhecido do atacante; gere ID novo no login'
        ], 'Regenerar o ID quando os privilégios mudam impede que um ID previamente conhecido ganhe acesso.'),
        mcq('q6', 'Qual implementação de logout é a correta?', 'b', [
          'Apagar o cookie no navegador e manter a sessão válida no servidor',
          'Invalidar a sessão no servidor e também remover o cookie no navegador',
          'Redirecionar o usuário para a página inicial sem executar nenhuma ação no servidor',
          'Trocar apenas a cor do botão para "Entrar"'
        ], 'Se a sessão continuar válida no servidor, quem tiver o ID continua autenticado.'),
        mcq('q7', 'Qual é a melhor prática sobre o conteúdo do cookie de sessão?', 'c', [
          'Guardar nele o papel do usuário (admin ou comum) para evitar consultar o servidor',
          'Guardar o CPF e o e-mail para exibir no cabeçalho do site',
          'Guardar somente o ID aleatório e manter os dados da sessão no servidor',
          'Guardar a senha, cifrada em Base64, para reautenticar rápido'
        ], 'O cliente pode ler e alterar o cookie; Base64 não é criptografia. Dados ficam no servidor.'),
        fill('q8', 'Qual módulo do Python deve ser usado para gerar tokens e IDs aleatórios seguros (em vez de random)?', 'import secrets\nsid = ___.token_urlsafe(32)', ['secrets'], 'O módulo secrets usa fonte criptograficamente segura; random não é adequado para segredos.')
      ]
    },
    {
      id: 'owb-32-fluxos-conta-seguros',
      title: 'Fluxos de conta seguros: cadastro, e-mail e recuperação de senha',
      goal: 'Projetar cadastro, verificação de e-mail, login e recuperação de senha sem criar brechas para tomada de conta ou enumeração de usuários.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Cadastro: validar e aceitar senhas boas',
            'No cadastro, valide formato e tamanho dos campos NO SERVIDOR. A política moderna de senhas privilegia COMPRIMENTO: exigir um mínimo razoável, permitir frases longas e a função de colar (para gerenciadores de senha) e recusar senhas muito comuns ou já conhecidas de vazamentos. Regras de composição rígidas ("uma maiúscula, um símbolo") e trocas periódicas sem motivo tendem a gerar senhas previsíveis. A senha é guardada com hash lento e salt (owb-11). Para impedir criação de contas em massa por robôs, use limite de requisições e, em visão geral, desafios como CAPTCHA.'
          ),
          sl(
            'Evite a enumeração de usuários',
            'ENUMERAÇÃO é descobrir quais e-mails ou usuários têm conta. Ela acontece por diferenças nas respostas: "e-mail já cadastrado" no cadastro, "usuário não existe" no login ou "e-mail não encontrado" na recuperação. Também por diferenças de TEMPO: se o servidor só calcula o hash quando o usuário existe, a resposta demora mais nesse caso. Defesa: mensagens iguais nos dois casos ("usuário ou senha inválidos", "se o e-mail existir, enviamos instruções") e tempo de resposta parecido (calcular o hash mesmo para usuário inexistente). No cadastro, responda igual e avise a pessoa por e-mail se já havia conta.'
          ),
          sl(
            'Verificação de e-mail com token',
            'Para provar que o e-mail é da pessoa, envie um link com um TOKEN: valor ALEATÓRIO e imprevisível, de USO ÚNICO e com EXPIRAÇÃO. Gere com um gerador criptográfico (em Python, o módulo secrets; nunca random). No banco, guarde só o HASH do token (como se faz com senhas): se o banco vazar, os tokens ainda não podem ser usados. Ao receber o token, calcule o hash, procure no banco e confira expiração e se já foi usado; então marque como usado.',
            `import secrets, hashlib
token = secrets.token_urlsafe(32)          # vai no link do e-mail
h = hashlib.sha256(token.encode()).hexdigest()  # só isto vai ao banco`
          ),
          sl(
            'Rodando: expiração e uso único',
            'Em laboratório, com dados fictícios, a verificação consulta o hash, confere se já foi usado e se expirou. O token de 32 bytes vira 43 caracteres no link e o hash SHA-256 tem 64 caracteres hexadecimais. O mesmo token só funciona uma vez, e fora do prazo é recusado.',
            `def usar(token, agora):
    h = hashlib.sha256(token.encode()).hexdigest()
    r = db.get(h)
    if not r:             return 'invalido'
    if r['usado']:        return 'ja usado'
    if agora > r['exp']:  return 'expirado'
    r['usado'] = True
    return 'ok'
# saída real:
# 43 64          (tamanho do token e do hash)
# ok             (primeiro uso, dentro do prazo)
# ja usado       (segundo uso do mesmo token)
# expirado       (token usado depois do prazo)
# invalido       (token desconhecido)`
          ),
          sl(
            'Login: limite de tentativas sem facilitar DoS',
            'Sem limite, um robô testa milhares de senhas. Limite as tentativas por conta E por origem (IP), com atraso crescente entre tentativas ou bloqueio TEMPORÁRIO gradual. Cuidado: bloquear a conta por completo após poucas falhas permite que um atacante tranque a conta de outra pessoa de propósito (negação de serviço contra a vítima). Complementos: avisar o usuário por e-mail quando houver login em um dispositivo novo, e oferecer 2FA (segundo fator, como app autenticador), que mantém a conta protegida mesmo se a senha vazar.'
          ),
          sl(
            'Recuperação de senha: o fluxo seguro',
            'Passos: (1) o usuário informa o e-mail; (2) a resposta é SEMPRE a mesma ("se o e-mail existir, enviamos um link"); (3) o sistema gera um token longo, aleatório, de uso único e prazo curto, guarda só o hash; (4) envia o link; (5) ao trocar a senha, o token é invalidado e as sessões abertas são ENCERRADAS. Não use perguntas secretas: as respostas costumam ser públicas ou adivinháveis. E monte o link com o host CONFIGURADO, nunca com o cabeçalho Host da requisição, que o cliente controla: um Host adulterado faria o e-mail apontar para um domínio falso, levando o token à pessoa errada.',
            `# VULNERÁVEL: host vem do cabeçalho controlado pelo cliente
link = 'https://' + request.headers['Host'] + '/reset?t=' + token

# CORRIGIDO: host fixo da configuração
BASE_URL = 'https://app.exemplo'     # definido no deploy
link = BASE_URL + '/reset?t=' + token`
          ),
          sl(
            'Operações sensíveis, 2FA e exclusão de conta',
            'Trocar a senha ou o e-mail de uma conta logada exige REAUTENTICAÇÃO (pedir a senha atual): assim, quem usar uma sessão esquecida aberta não toma a conta. Ao trocar o e-mail, confirme o novo endereço por link e avise o antigo. O 2FA adiciona algo que o usuário possui à senha, mas o fluxo de recuperação não deve virar atalho que o contorne. A exclusão de conta deve ser possível e apagar ou anonimizar os dados pessoais, em linha com o direito de eliminação previsto na LGPD (visão geral; não é aconselhamento jurídico), respeitando prazos legais de guarda quando existirem.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O formulário de recuperação responde "e-mail não encontrado" quando não há conta. Qual o problema e a correção?', 'd', [
          'Nenhum problema: a mensagem ajuda o usuário a corrigir um erro de digitação rapidamente',
          'O problema é só estético; basta traduzir a mensagem para o idioma do usuário',
          'Revela quais e-mails têm conta; o correto é bloquear o endereço IP de quem perguntar',
          'Revela quais e-mails têm conta; a resposta deve ser igual nos dois casos'
        ], 'Mensagens diferentes permitem enumerar usuários. A resposta deve ser a mesma exista ou não a conta.'),
        mcq('q2', 'Como guardar um token de recuperação de senha no banco de dados?', 'b', [
          'Em texto puro, para poder reenviar o mesmo link caso o usuário peça de novo',
          'Apenas o hash do token; o valor recebido é hasheado e comparado',
          'Cifrado com a senha atual do usuário, para facilitar a verificação posterior',
          'Não guardar nada e derivar o token do e-mail do usuário por um cálculo fixo'
        ], 'Guardando só o hash, um vazamento do banco não entrega tokens utilizáveis. Tokens derivados de dados previsíveis podem ser forjados.'),
        mcq('q3', 'Um fluxo de recuperação pede "o nome do seu primeiro bichinho" e, se a resposta estiver certa, mostra a senha nova na tela. Este fluxo é seguro?', 'a', [
          'Não: respostas de perguntas secretas são adivinháveis; use sempre link com token enviado ao e-mail',
          'Sim, porque só o dono da conta conhece o nome do primeiro bichinho de estimação que teve na infância',
          'Sim, desde que a pergunta seja escolhida pelo próprio usuário no cadastro e a resposta seja guardada com hash',
          'Não, porque a senha nova deveria chegar por SMS e nunca ser exibida na tela do navegador do usuário'
        ], 'Respostas de perguntas secretas costumam estar em redes sociais ou ser fáceis de adivinhar. Use token de uso único enviado ao e-mail.'),
        fill('q4', 'Complete a função do módulo secrets que gera um token seguro, adequado para uso em URL.', 'import secrets\ntoken = secrets.___(32)', ['token_urlsafe'], 'secrets.token_urlsafe usa gerador criptográfico e devolve texto seguro para URLs. O módulo random não é adequado para tokens.'),
        mcq('q5', 'Uma pessoa logada quer trocar o e-mail da conta. Qual é o fluxo mais seguro?', 'c', [
          'Aplicar a troca imediatamente, pois a sessão já provou quem é o usuário',
          'Pedir só o novo e-mail e enviar a senha atual dele para o endereço antigo',
          'Pedir a senha atual, confirmar o novo e-mail por link e avisar o endereço antigo',
          'Pedir a senha atual e substituir o e-mail sem confirmar o novo endereço, para reduzir atrito'
        ], 'Reautenticar protege contra sessão esquecida aberta; confirmar o novo e-mail evita apontar a conta para um endereço errado ou de terceiro; avisar o antigo ajuda a detectar abuso.'),
        mcq('q6', 'O link de recuperação é montado com request.headers[\'Host\']. Qual o risco e a correção?', 'd', [
          'Risco de lentidão no servidor; corrigir usando cache do cabeçalho Host por usuário',
          'Nenhum risco, porque o navegador impede o envio de um cabeçalho Host diferente do domínio real',
          'O risco é o link ficar longo demais; corrigir encurtando o domínio',
          'O cliente controla o Host e pode desviar o link; usar o host configurado'
        ], 'O cabeçalho Host vem do cliente. O link deve usar uma URL base definida na configuração da aplicação.'),
        mcq('q7', 'Como limitar tentativas de login sem permitir que alguém tranque a conta de outra pessoa de propósito?', 'b', [
          'Bloquear a conta de forma permanente após cinco senhas erradas até o suporte liberar',
          'Atraso crescente ou bloqueio temporário gradual, por conta e por origem',
          'Remover qualquer limite de tentativas e confiar somente na complexidade da senha',
          'Bloquear apenas o endereço IP do servidor da aplicação durante a madrugada'
        ], 'Bloqueio permanente vira ferramenta de negação de serviço contra a vítima. Atrasos e bloqueios temporários desaceleram robôs sem trancar o dono.'),
        fill('q8', 'Complete com o verbo no infinitivo: após a troca de senha, o sistema deve ___ as sessões antigas do usuário.', 'Após trocar a senha: ___ as sessões antigas', ['encerrar', 'invalidar', 'revogar', 'finalizar'], 'Se a senha foi trocada porque a conta estava comprometida, sessões antigas precisam deixar de funcionar.')
      ]
    },
    {
      id: 'owb-13-controle-acesso',
      title: 'Controle de acesso',
      goal: 'Aplicar autorização no servidor, por recurso, evitando IDOR/BOLA, escalonamento de privilégios e acesso forçado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autenticar não é autorizar',
            'Saber QUEM é o usuário (autenticação) não diz o que ele pode fazer (autorização). Controle de acesso quebrado é a categoria nº 1 do OWASP Top 10 de 2021 e segue no topo na edição de 2025. A falha típica: a aplicação confirma que o usuário está logado, mas não confere se ELE pode ver ou alterar aquele recurso específico.'
          ),
          sl(
            'IDOR / BOLA',
            'IDOR (Insecure Direct Object Reference), também chamado de BOLA (Broken Object Level Authorization) em APIs: o endereço contém um identificador (/pedidos/2), e a aplicação devolve o objeto sem checar de quem ele é. Basta o usuário trocar o número para ver o dado de outro. Funciona em URLs, corpo JSON, cookies, qualquer lugar onde o cliente indique qual objeto quer.',
            `PEDIDOS = {1: {'dono': 'ana', 'item': 'livro'},
           2: {'dono': 'bia', 'item': 'caneca'}}

def ver_vulneravel(usuario, id):
    return PEDIDOS.get(id)          # não confere o dono

def ver_seguro(usuario, id):
    p = PEDIDOS.get(id)
    if p is None or p['dono'] != usuario:
        return 'negado'
    return p

print(ver_vulneravel('ana', 2))  # {'dono': 'bia', 'item': 'caneca'}  <- vazou
print(ver_seguro('ana', 2))      # negado
print(ver_seguro('ana', 1))      # {'dono': 'ana', 'item': 'livro'}`
          ),
          sl(
            'Escalonamento horizontal e vertical',
            'HORIZONTAL: acessar recursos de outro usuário do MESMO nível (ana vendo dados de bia). VERTICAL: obter permissões de nível mais alto (um usuário comum executando funções de administrador). Duas causas frequentes: acesso FORÇADO a URLs e funções administrativas (a página não aparece no menu, mas o endereço /admin responde a qualquer um) e ações apenas OCULTAS na interface (o botão sumiu, mas a API continua aceitando a chamada).'
          ),
          sl(
            'Defesas: servidor, por requisição e por recurso',
            'A autorização acontece NO SERVIDOR, em CADA requisição e POR RECURSO (verificando dono ou papel), nunca só na interface. Adote "negar por padrão": se não houver regra explícita permitindo, o acesso é negado. Se a decisão estiver espalhada, é fácil esquecer um ponto: CENTRALIZE em uma função, middleware ou política única. Registre as negações — picos de acessos negados revelam tentativas.'
          ),
          sl(
            'IDs imprevisíveis, RBAC e ABAC',
            'IDs aleatórios (como UUIDs) dificultam adivinhar identificadores, mas NÃO substituem a checagem: se um ID vazar (em um link, em um log), a falta de verificação ainda expõe o dado. Modelos de política: RBAC (controle por PAPÉIS: admin, editor, leitor) é simples e comum; ABAC (por ATRIBUTOS: dono do recurso, departamento, horário) é mais flexível para regras finas. Muitos sistemas combinam os dois.'
          ),
          sl(
            'Teste de controle de acesso',
            'Teste com contas de papéis diferentes: repita as requisições de um usuário usando a sessão de outro e confirme que a resposta é negada. Inclua testes automatizados para cada rota sensível. Lembre que a regra é testar apenas seus sistemas ou os autorizados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um usuário logado troca /pedidos/2 por /pedidos/3 na URL e vê o pedido de outra pessoa. Qual é a falha?', 'a', [
          'IDOR/BOLA: falta verificar se o recurso é do usuário',
          'Injeção de SQL, por manipulação de um parâmetro da URL',
          'Fixação de sessão, por reutilizar o ID da sessão',
          'XSS refletido, pois a URL foi alterada'
        ], 'O servidor devolveu o objeto sem checar o dono, o que é típico de IDOR/BOLA.'),
        mcq('q2', 'A tela de administração não aparece no menu para usuários comuns, mas /admin responde a todos. O que isso mostra?', 'c', [
          'Que a proteção está correta, pois o menu esconde o acesso dos usuários comuns',
          'Que o problema é só de design visual do menu',
          'Está protegida só na interface; falta checar o papel no servidor',
          'Que o servidor precisa usar HTTPS para esconder a rota'
        ], 'Ocultar na interface não é controle de acesso; a checagem deve estar no servidor.'),
        mcq('q3', 'Qual é a diferença entre escalonamento horizontal e vertical?', 'd', [
          'Horizontal acontece no front-end e vertical no banco de dados',
          'Horizontal usa HTTP e vertical usa HTTPS',
          'Horizontal envolve senhas fracas e vertical envolve senhas vazadas em outros sites',
          'Horizontal: outro usuário do mesmo nível; vertical: permissões de nível mais alto'
        ], 'Horizontal: mesmo nível, outro dono. Vertical: de comum para administrador, por exemplo.'),
        fill('q4', 'Qual é o princípio segundo o qual, sem regra explícita que permita, o acesso é recusado? (negar por ___)', 'Política: negar por ___', ['padrão', 'padrao', 'default'], 'Negar por padrão evita que um esquecimento libere acesso.'),
        mcq('q5', 'Por que usar UUIDs em vez de IDs sequenciais não resolve IDOR sozinho?', 'b', [
          'Porque UUIDs são curtos demais para serem considerados seguros em qualquer sistema',
          'Se o ID vazar, a falta de checagem ainda expõe o dado',
          'Porque UUIDs não funcionam com bancos relacionais',
          'Porque UUIDs impedem o uso de HTTPS'
        ], 'IDs imprevisíveis dificultam, mas a checagem de autorização continua obrigatória.'),
        mcq('q6', 'Onde a decisão de autorização deve ser tomada?', 'd', [
          'Apenas no JavaScript da interface, desabilitando botões que o usuário não pode usar',
          'Apenas no login, uma vez, e valendo para toda a sessão',
          'Só nas rotas de administração, pois as demais são públicas',
          'No servidor, a cada requisição e por recurso, sempre de forma centralizada'
        ], 'Checagens centralizadas e por requisição evitam esquecer pontos.'),
        mcq('q7', 'Qual descreve melhor RBAC?', 'a', [
          'Controle de acesso baseado em papéis, como admin, editor e leitor de conteúdo',
          'Controle baseado em chaves de criptografia de cada usuário do sistema',
          'Uma técnica para bloquear requisições por endereço IP',
          'Um formato de token de sessão assinado e enviado em cabeçalho'
        ], 'RBAC concede permissões a papéis; ABAC usa atributos como dono e contexto.'),
        fill('q8', 'Qual sigla designa a falha em que o identificador de um objeto na requisição é aceito sem checar o dono? (4 letras)', '___: Insecure Direct Object Reference', ['idor'], 'IDOR (ou BOLA em APIs) é falta de autorização no nível do objeto.')
      ]
    },
    {
      id: 'owb-14-csrf',
      title: 'CSRF',
      goal: 'Entender como o envio automático de cookies permite requisições forjadas e defender com SameSite, tokens anti-CSRF e verificação de origem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é CSRF',
            'Cross-Site Request Forgery é fazer o navegador de uma vítima, já autenticada em um site, enviar uma requisição indesejada a ele. A causa é que o navegador anexa AUTOMATICAMENTE os cookies do site a qualquer requisição para ele, mesmo que a requisição tenha sido disparada por OUTRA página. O servidor vê o cookie válido e acredita que foi a vítima quem pediu.'
          ),
          sl(
            'Cenário',
            'A vítima está logada no banco-exemplo.local. Em outra aba, abre uma página maliciosa com um formulário escondido que se envia sozinho para banco-exemplo.local/transferir, ou uma imagem cujo endereço aponta para uma ação via GET. O navegador envia o cookie de sessão junto, e a transferência é feita. O atacante não vê a resposta nem rouba o cookie: ele só faz a ação acontecer.',
            '<!-- página do atacante (cenário didático) -->\n<form action="https://banco-exemplo.local/transferir" method="POST">\n  <input type="hidden" name="para" value="conta-atacante">\n  <input type="hidden" name="valor" value="100">\n</form>'
          ),
          sl(
            'Quando se aplica',
            'CSRF vale para ações que MUDAM ESTADO (transferir, trocar e-mail, apagar) e só quando a autenticação é feita por algo que o navegador envia automaticamente, como cookies. APIs que exigem um cabeçalho Authorization colocado manualmente pelo código não sofrem do mesmo problema, pois uma página de outro site não consegue anexá-lo.'
          ),
          sl(
            'Defesa 1: SameSite e GET sem efeito',
            'O atributo SameSite=Lax (ou Strict) no cookie de sessão faz o navegador não enviá-lo em requisições entre sites que mudam estado (como POST vindo de outro site) — é uma defesa forte, mas deve ser combinada com as outras. Complementarmente: NUNCA mude estado com GET (GET deve ser seguro e sem efeito colateral), pois GET pode ser disparado por uma simples imagem ou link.'
          ),
          sl(
            'Defesa 2: token anti-CSRF',
            'O servidor gera um token aleatório por sessão, o inclui nos formulários e o exige em cada requisição que muda estado; uma página de outro site não consegue lê-lo para forjar a requisição. Padrões: SINCRONIZADOR (token guardado na sessão do servidor) e DUPLO ENVIO (o mesmo valor em cookie e em campo/cabeçalho, comparados). Compare em tempo constante.',
            `import secrets, hmac
sessao = {'csrf': secrets.token_urlsafe(32)}   # gerado ao criar a sessão

def valido(token_recebido):
    return hmac.compare_digest(sessao['csrf'], token_recebido or '')

print(valido(sessao['csrf']))  # True
print(valido(None))            # False
print(valido('forjado'))       # False`
          ),
          sl(
            'Defesa 3: Origin/Referer, reautenticação e o mito do CORS',
            'Verifique os cabeçalhos Origin (ou Referer) das requisições que mudam estado e rejeite origens inesperadas. Para ações críticas (trocar senha, transferir valores altos) peça a senha de novo ou um segundo fator. ATENÇÃO: CORS NÃO é proteção contra CSRF. CORS controla o que uma página de outro site pode LER da resposta; ele não impede o navegador de ENVIAR certas requisições (como um POST de formulário) com cookies.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o CSRF funciona?', 'b', [
          'O atacante consegue ler o cookie de sessão da vítima e usá-lo em outro lugar',
          'Cookies são enviados sozinhos em requisições disparadas por outra página',
          'Porque o servidor não usa HTTPS',
          'Porque o banco de dados aceita comandos SQL do navegador'
        ], 'O atacante não rouba o cookie: usa o fato de o navegador enviá-lo sozinho.'),
        mcq('q2', 'Em quais ações o CSRF é relevante?', 'd', [
          'Somente em páginas estáticas sem formulários',
          'Em qualquer leitura de dados públicos, como a página inicial do site',
          'Apenas em APIs que nunca usam cookies de nenhum tipo',
          'Apenas em ações que mudam estado com autenticação por cookies automáticos'
        ], 'Sem efeito colateral ou sem autenticação automática, não há o que forjar.'),
        mcq('q3', 'Um desenvolvedor implementou "apagar conta" como GET /apagar?id=5. Qual o problema?', 'a', [
          'GET nunca deve mudar estado: um link ou imagem em outro site o dispara com os cookies',
          'GET é lento demais para operações de exclusão, que precisam de transações completas',
          'GET não permite parâmetros na URL',
          'GET só funciona com HTTPS desativado'
        ], 'Mudar estado exige método como POST/DELETE com token anti-CSRF.'),
        fill('q4', 'Qual valor do atributo SameSite bloqueia o envio do cookie em POSTs vindos de outros sites e é um padrão razoável de equilíbrio? (uma palavra)', 'Set-Cookie: sid=<id>; SameSite=___', ['lax'], 'Lax bloqueia o cookie em requisições entre sites que mudam estado, mantendo links externos funcionando.'),
        mcq('q5', 'Como funciona um token anti-CSRF do tipo sincronizador?', 'c', [
          'O token é o próprio cookie de sessão, repetido em todas as requisições e respostas',
          'O servidor registra o IP do usuário e bloqueia qualquer troca de rede durante toda a sessão aberta',
          'O servidor gera um valor aleatório por sessão e o exige nas requisições',
          'O navegador criptografa o formulário antes de enviá-lo'
        ], 'Uma página de outro site não consegue ler o token e, portanto, não consegue forjar a requisição.'),
        mcq('q6', 'Um colega afirma: "configuramos CORS restritivo, então estamos protegidos contra CSRF". O que responder?', 'd', [
          'Correto: CORS impede o navegador de enviar qualquer requisição entre sites diferentes',
          'Correto, desde que o CORS permita apenas métodos GET',
          'Incorreto, porque CORS só funciona em HTTP',
          'Incorreto: CORS limita o que outra página lê, não o envio'
        ], 'CORS e CSRF tratam de coisas diferentes; use SameSite, tokens e verificação de origem.'),
        mcq('q7', 'Qual conjunto de medidas combina melhor contra CSRF?', 'b', [
          'Cookie sem SameSite, GET para as ações de mudança e CORS aberto a todas as origens',
          'SameSite, token anti-CSRF, verificação de Origin e reautenticação',
          'Apenas ocultar o formulário na interface',
          'Aumentar o tempo de expiração da sessão para reduzir logins repetidos'
        ], 'Defesa em profundidade: várias camadas independentes.'),
        fill('q8', 'Qual cabeçalho da requisição indica de qual site (origem) ela partiu e pode ser verificado em ações que mudam estado?', 'if request.headers.get("___") not in ORIGENS_PERMITIDAS: negar()', ['origin'], 'Origin informa a origem da requisição; rejeite valores inesperados (Referer é alternativa).')
      ]
    },
    {
      id: 'owb-15-configuracao-insegura',
      title: 'Configuração insegura',
      goal: 'Reconhecer padrões inseguros comuns, tratar segredos e ambientes e aplicar endurecimento e revisão de configuração.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é configuração insegura',
            'Muita falha não está no código, mas em como o sistema foi configurado e implantado: um padrão de fábrica nunca alterado, um recurso de depuração esquecido ligado, um serviço desnecessário aberto. É uma das categorias mais comuns e fáceis de evitar. O OWASP Top 10 a lista como Security Misconfiguration e, na edição de 2025, ela subiu de posição.'
          ),
          sl(
            'Padrões inseguros mais comuns',
            'Senhas e contas padrão (admin/admin) não trocadas; modo debug ligado em produção (revela código, variáveis e às vezes permite executar código); listagem de diretórios habilitada; mensagens de erro detalhadas com stack trace; portas e serviços desnecessários abertos; painéis administrativos e de banco expostos à internet; buckets e armazenamento de objetos configurados como públicos; cabeçalhos de segurança ausentes; software e dependências desatualizados.'
          ),
          sl(
            'Debug ligado vs desligado (visão geral)',
            'Frameworks têm modo de desenvolvimento, útil para programar, mas perigoso em produção. Em produção, desligue o debug, mostre páginas de erro genéricas e envie os detalhes ao log interno.',
            `# Flask
# perigoso em produção:
app.run(debug=True)
# em produção: debug desligado e servidor WSGI próprio (gunicorn etc.)
app.config['DEBUG'] = False

// Express
// NODE_ENV=production desliga detalhes de erro por padrão
app.disable('x-powered-by');   // não anuncia a tecnologia`
          ),
          sl(
            'Segredos no repositório',
            'Chaves de API, senhas de banco e tokens NÃO devem ficar no código nem no repositório (o histórico do Git guarda tudo, inclusive o que foi apagado depois). Use variáveis de ambiente ou um gerenciador de segredos, arquivos .env fora do versionamento (.gitignore), e rotacione qualquer segredo que tenha sido exposto. Em exemplos e documentação, use sempre um <placeholder>.',
            '# .gitignore\n.env\n\n# código\nimport os\nchave = os.environ[\'API_KEY\']   # nunca "<valor-real>" no código'
          ),
          sl(
            'Seguro por padrão e ambientes separados',
            'Princípio "seguro por padrão": o estado inicial da configuração deve ser o mais restritivo; quem precisar abrir algo faz isso explicitamente. Mantenha ambientes SEPARADOS (desenvolvimento, homologação e produção), com credenciais e dados distintos: nunca use dados reais de produção em ambientes de teste e nunca reaproveite as mesmas chaves entre ambientes.'
          ),
          sl(
            'Automatize, versione e revise',
            'Configuração feita à mão em cada servidor gera diferenças e esquecimentos. Descreva a configuração como código (arquivos versionados, infraestrutura como código, imagens de container reprodutíveis), revise mudanças como se revisa código e repita a implantação de forma automatizada. Faça revisões periódicas e varreduras de configuração, e mantenha um processo de atualização de software e dependências.'
          ),
          sl(
            'Checklist de endurecimento (hardening)',
            '1) Troque ou remova contas e senhas padrão. 2) Desligue debug, páginas de exemplo e listagem de diretórios em produção. 3) Feche portas e remova serviços não usados. 4) Restrinja painéis administrativos (rede interna, VPN, MFA). 5) Revise permissões de armazenamento (nada público sem necessidade). 6) Configure cabeçalhos de segurança e TLS. 7) Gerencie segredos fora do código. 8) Atualize sistema e dependências. 9) Separe ambientes. 10) Monitore e registre logs, sem gravar segredos nem dados pessoais desnecessários.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o risco de deixar o modo debug ligado em produção?', 'a', [
          'Pode expor código, variáveis e detalhes internos nas páginas de erro',
          'Os usuários deixam de conseguir fazer login',
          'O site fica mais lento por registrar muita informação, mas isso não traz risco de segurança',
          'O banco de dados passa a aceitar conexões sem senha'
        ], 'Debug revela informações valiosas a quem explora falhas; deve ser desligado em produção.'),
        mcq('q2', 'Um desenvolvedor commitou um arquivo .env com a senha do banco e depois o apagou no commit seguinte. O que fazer?', 'b', [
          'Nada: o arquivo foi apagado no commit seguinte, então o segredo está seguro',
          'Considerar o segredo exposto, rotacioná-lo e manter .env sempre no .gitignore',
          'Avisar só o time, sem trocar a senha, para evitar alarme desnecessário',
          'Renomear o arquivo para .env.bak e commitá-lo de novo'
        ], 'O histórico preserva o conteúdo; o segredo deve ser trocado e a prática corrigida.'),
        mcq('q3', 'O que significa "seguro por padrão"?', 'd', [
          'A segurança depende do provedor de hospedagem escolhido',
          'Todos os recursos vêm habilitados para facilitar o primeiro uso do sistema',
          'A segurança é configurada só depois do lançamento, quando houver tempo',
          'O estado inicial é o mais restritivo e abrir algo exige uma decisão explícita'
        ], 'Padrões restritivos reduzem erros por esquecimento.'),
        fill('q4', 'Complete o nome em inglês da categoria do OWASP Top 10 sobre padrões inseguros, debug ligado e serviços abertos (uma palavra).', 'Security ___', ['misconfiguration', 'misconfig'], 'Security Misconfiguration cobre padrões inseguros, serviços desnecessários, erros detalhados e armazenamento público.'),
        mcq('q5', 'Qual prática aborda corretamente os ambientes?', 'b', [
          'Usar uma cópia dos dados reais de produção em homologação, para testes mais fiéis ao uso real',
          'Manter desenvolvimento, homologação e produção separados, com credenciais distintas',
          'Manter um único ambiente e testar direto em produção',
          'Usar as mesmas chaves e senhas em todos os ambientes, para simplificar'
        ], 'Separação limita o dano; dados reais fora de produção criam risco de privacidade.'),
        mcq('q6', 'Qual vantagem principal de descrever a configuração como código versionado?', 'a', [
          'Permite revisar mudanças e repetir a implantação de forma consistente e auditável',
          'Deixa o servidor mais rápido e dispensa o uso de cache nas respostas',
          'Elimina a necessidade de atualizar software e dependências com o tempo',
          'Faz o repositório ser público por padrão, facilitando a colaboração'
        ], 'Configuração versionada é auditável e reprodutível.'),
        mcq('q7', 'Qual item NÃO deveria acontecer em um servidor de produção bem configurado?', 'c', [
          'Painel administrativo acessível só pela rede interna ou VPN com MFA ativo',
          'Páginas de erro genéricas ao usuário, com detalhes no log interno',
          'Painel de administração do banco acessível publicamente na internet',
          'Dependências atualizadas por um processo regular'
        ], 'Painéis administrativos expostos são alvo frequente; restrinja o acesso.'),
        fill('q8', 'Como se chama o conjunto de medidas que reduzem a superfície de ataque de um sistema, fechando portas e removendo o desnecessário? (termo em inglês, 9 letras)', 'Checklist de ___ (endurecimento)', ['hardening'], 'Hardening é o endurecimento da configuração para reduzir a superfície de ataque.')
      ]
    },
    {
      id: 'owb-33-falhas-menores-web',
      title: 'Falhas menores que viram problemas grandes',
      goal: 'Reconhecer e corrigir falhas aparentemente pequenas (redirecionamento aberto, clickjacking, arquivos esquecidos, cache e vazamentos) que ajudam golpes e ataques maiores.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Redirecionamento aberto',
            'Muitas aplicações aceitam um parâmetro como ?next=/painel para levar o usuário a uma página depois do login. Se o servidor redireciona para QUALQUER valor, o link https://app.exemplo/login?next=https://site-falso.example parte de um domínio legítimo e termina em um site falso, o que torna golpes de phishing mais convincentes. Defesa: aceitar apenas caminhos relativos internos (começando com uma barra simples, e não com duas barras nem com barra invertida) ou uma lista de destinos permitidos (allowlist); em qualquer dúvida, voltar à página inicial.',
            `from urllib.parse import urlsplit
def seguro(next_):
    if not next_ or chr(92) in next_: return '/'
    p = urlsplit(next_)
    if p.scheme or p.netloc: return '/'
    if not next_.startswith('/') or next_.startswith('//'): return '/'
    return next_
# saída real:
# /painel                 -> /painel
# /conta?aba=2            -> /conta?aba=2
# https://site-falso.example/x -> /
# //site-falso.example    -> /
# javascript:alert(1)     -> /
# painel                  -> /`
          ),
          sl(
            'Poluição de parâmetros HTTP',
            'O que acontece quando o mesmo parâmetro aparece duas vezes, como ?id=1&id=2? Não há regra única: alguns componentes usam o primeiro valor, outros o último, outros juntam em lista. Em Python, parse_qs devolve {id: [1, 2]}, uma lista com os dois. O problema surge quando um componente (por exemplo um filtro ou firewall) valida um valor e a aplicação usa outro. Defesa: tratar parâmetros repetidos de forma explícita (rejeitar duplicatas ou escolher um critério único e igual em todas as camadas) e validar o valor que realmente será usado.'
          ),
          sl(
            'Clickjacking e métodos HTTP',
            'CLICKJACKING é carregar seu site dentro de um quadro (iframe) invisível em outra página, para que o usuário clique em botões reais sem perceber. Defesa: o cabeçalho Content-Security-Policy com a diretiva frame-ancestors (por exemplo, frame-ancestors \'none\' ou apenas o próprio site) e, por compatibilidade, X-Frame-Options (DENY ou SAMEORIGIN). Sobre MÉTODOS HTTP: GET deve só ler (nunca alterar estado); alterações usam POST, PUT, PATCH ou DELETE. Permita só os métodos que cada rota usa e desabilite os desnecessários, como TRACE. HEAD e OPTIONS têm usos legítimos (OPTIONS aparece em pré-requisições de CORS); o ponto é não expor o que você não precisa.',
            `Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY`
          ),
          sl(
            'Segurança por obscuridade e arquivos esquecidos',
            'O arquivo robots.txt orienta robôs de busca, mas é PÚBLICO: qualquer pessoa o lê. Listar ali "Disallow: /admin-secreto/" entrega o endereço. Esconder um caminho não o protege; o controle verdadeiro é autenticação e autorização. O mesmo vale para páginas de administração com nomes previsíveis (/admin): não bastam como proteção. Outro erro comum é deixar no diretório publicado do servidor web cópias esquecidas (arquivos .bak, dumps de banco), a pasta .git ou o arquivo .env com segredos. Defesa: publicar só o necessário (build limpo), bloquear esses caminhos no servidor, manter segredos fora do código e do diretório web e girar qualquer segredo que tenha ficado exposto.'
          ),
          sl(
            'Cache e Referer',
            'Navegadores e proxies guardam páginas em cache. Para páginas com dados pessoais ou de sessão (extrato, perfil), envie Cache-Control: no-store, evitando que alguém veja a página pelo botão Voltar em um computador compartilhado. Já o cabeçalho Referer (escrito assim por razões históricas) informa a URL da página de origem ao clicar em um link. Se a URL contiver um token (por exemplo ?token=<placeholder>), ele pode vazar para o outro site e para logs. Defesas: não colocar segredos em URLs (use corpo ou cabeçalhos) e definir Referrer-Policy (por exemplo no-referrer ou strict-origin-when-cross-origin).',
            `Cache-Control: no-store
Referrer-Policy: no-referrer`
          ),
          sl(
            'Vazamento de informações e enumeração',
            'Pequenos detalhes entregam informação: cabeçalhos como Server e X-Powered-By que mostram tecnologia e versão, comentários HTML esquecidos ("TODO: senha do teste"), mensagens de erro detalhadas, e respostas diferentes para recurso inexistente versus proibido (403 versus 404), que permitem listar recursos e usuários existentes. Defesa: remover cabeçalhos e comentários desnecessários na publicação, mensagens de erro genéricas e respostas coerentes quando o recurso não deve ser revelado. Nenhum item sozinho é grave, mas somados ajudam quem planeja um ataque.'
          ),
          sl(
            'Checklist de revisão rápida',
            'Ao revisar uma aplicação, pergunte: (1) algum parâmetro de redirecionamento aceita URL livre? (2) parâmetros repetidos são tratados de modo consistente? (3) há frame-ancestors ou X-Frame-Options? (4) o robots.txt lista algo sensível? (5) há .git, .env, .bak ou dumps acessíveis pelo servidor web? (6) métodos desnecessários estão desligados e GET nunca altera dados? (7) páginas sensíveis têm no-store? (8) há segredos em URLs e Referrer-Policy definida? (9) cabeçalhos, comentários e erros revelam detalhes? Revise só sistemas seus ou com autorização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O link https://app.exemplo/login?next=https://site-falso.example leva o usuário, após o login, ao site falso. Qual o risco e a defesa?', 'a', [
          'Phishing com aparência legítima; aceitar só caminhos internos ou uma allowlist',
          'Apenas lentidão no redirecionamento; basta aumentar o tempo limite da requisição',
          'Roubo do banco de dados; a defesa é trocar a senha do administrador',
          'Risco de SQL injection no parâmetro; a defesa é usar consulta parametrizada no redirecionamento'
        ], 'O domínio legítimo no início do link dá confiança ao golpe. Valide o destino como caminho interno ou allowlist.'),
        mcq('q2', 'Qual configuração reduz a superfície de métodos HTTP de uma rota?', 'c', [
          'Aceitar todos os métodos em todas as rotas para facilitar testes e integrações',
          'Usar GET para ações que alteram dados, já que é o método mais simples de cachear',
          'Permitir só os métodos que a rota usa e desabilitar os desnecessários, como TRACE',
          'Esconder os métodos suportados trocando o nome do cabeçalho Allow'
        ], 'Permita o necessário. GET só lê; alterações usam POST, PUT, PATCH ou DELETE. Desabilitar o que não se usa reduz a superfície.'),
        mcq('q3', 'Um firewall valida o primeiro valor de ?id=1&id=2, mas a aplicação usa o último. Qual a defesa adequada?', 'b', [
          'Confiar no firewall e dispensar a validação na aplicação, já que ele valida antes dela',
          'Tratar duplicatas de forma explícita, com um critério único em todas as camadas',
          'Aumentar o tamanho máximo da URL para caberem os dois valores por completo na requisição',
          'Converter os parâmetros para maiúsculas antes de validar o valor, igualando a leitura'
        ], 'Componentes diferentes interpretam repetição de formas diferentes. Defina uma regra única e valide o valor realmente usado.'),
        fill('q4', 'Complete a diretiva do Content-Security-Policy que impede que outros sites carreguem sua página em um quadro (iframe).', "Content-Security-Policy: ___ 'none'", ['frame-ancestors'], 'frame-ancestors define quem pode embutir a página; \'none\' proíbe todos. X-Frame-Options é o cabeçalho equivalente mais antigo.'),
        mcq('q5', 'O robots.txt de um site contém "Disallow: /admin-secreto/". Qual o problema?', 'd', [
          'Nenhum, porque robôs de busca respeitam sempre o arquivo e ninguém mais o lê',
          'O arquivo deveria estar no formato XML para ser aceito pelos robôs',
          'O problema é o tamanho do arquivo, que atrasa o carregamento da página inicial',
          'Ele é público e revela o caminho; proteja a área com autenticação e autorização'
        ], 'Esconder não protege: o robots.txt é legível por qualquer pessoa. O controle real é autenticação e autorização.'),
        mcq('q6', 'Uma revisão encontra /.env e /backup.zip acessíveis pelo navegador no servidor web. Qual a correção?', 'a', [
          'Tirar os arquivos do diretório publicado, bloquear o acesso e trocar os segredos expostos',
          'Renomear os arquivos para nomes difíceis de adivinhar e manter no mesmo diretório do site',
          'Adicionar os caminhos ao robots.txt para os robôs de busca não indexarem esses arquivos',
          'Manter os arquivos onde estão e confiar que ninguém conhece os endereços exatos'
        ], 'Segredos expostos devem ser considerados comprometidos: remova do diretório web, bloqueie e gire as credenciais. Obscuridade não protege.'),
        mcq('q7', 'Uma página de extrato bancário pode ser vista pelo botão Voltar em um computador compartilhado após o logout. Qual cabeçalho ajuda?', 'c', [
          'X-Powered-By, para identificar a tecnologia que gerou a página',
          'Referrer-Policy: no-referrer, que impede a página de ser guardada no histórico',
          'Cache-Control: no-store nas páginas com dados pessoais',
          'Access-Control-Allow-Origin, que limita quais domínios abrem o extrato'
        ], 'Cache-Control: no-store instrui navegadores e proxies a não guardar a resposta. Referrer-Policy trata da URL de origem, não de cache.'),
        fill('q8', 'Complete o valor de Referrer-Policy que impede o envio da URL de origem a outros sites, evitando vazar tokens presentes na URL.', 'Referrer-Policy: ___', ['no-referrer'], 'no-referrer não envia o Referer. Ainda assim, o melhor é nunca colocar segredos em URLs.')
      ]
    },
    {
      id: 'owb-16-headers-https',
      title: 'Cabeçalhos de segurança e HTTPS',
      goal: 'Entender o que o TLS protege (e o que não protege) e configurar os principais cabeçalhos de segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que o HTTPS (TLS) protege',
            'HTTPS é o HTTP dentro de uma conexão TLS. O TLS entrega três garantias no caminho entre navegador e servidor: confidencialidade (quem está na rede, como no Wi-Fi do café, não lê o conteúdo), integridade (ninguém altera os dados no trajeto sem ser detectado) e autenticação do servidor (o certificado prova que você está falando com o domínio certo). O que o TLS NÃO faz: não corrige falhas da aplicação. Um site com SQL injection ou XSS continua vulnerável mesmo com o cadeado — o cadeado protege o transporte, não o código.'
          ),
          sl(
            'Redirecionar HTTP para HTTPS e usar HSTS',
            'Se o usuário digitar http://exemplo.local, a primeira requisição vai sem proteção. Por isso o servidor deve responder com um redirecionamento (301/308) para a versão https. Mas esse primeiro salto ainda pode ser interceptado. O cabeçalho HSTS (Strict-Transport-Security) resolve: ele diz ao navegador "durante max-age segundos, use apenas HTTPS para este domínio, mesmo que o usuário digite http://". includeSubDomains estende a regra aos subdomínios. O cabeçalho só vale se enviado por HTTPS.',
            `Strict-Transport-Security: max-age=31536000; includeSubDomains`
          ),
          sl(
            'Content-Security-Policy e nosniff',
            'A Content-Security-Policy (CSP) é uma lista de permissões que diz ao navegador de onde a página pode carregar scripts, estilos, imagens etc. Com default-src \'self\', só recursos da própria origem são aceitos: se um atacante conseguir injetar um <script> apontando para outro site, o navegador o bloqueia. É uma camada extra contra XSS, não substitui a codificação de saída. Já X-Content-Type-Options: nosniff impede que o navegador "adivinhe" o tipo de um arquivo ignorando o Content-Type declarado — evita, por exemplo, que um arquivo de texto enviado por um usuário seja tratado como script.',
            `Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff`
          ),
          sl(
            'Clickjacking, Referrer-Policy e Permissions-Policy',
            'Clickjacking: o atacante coloca o seu site dentro de um iframe invisível sobre outra página e engana o usuário para clicar em botões reais. A defesa é proibir que sua página seja emoldurada por outros sites: na CSP use frame-ancestors \'none\' (ou \'self\' para permitir só o próprio site); o antigo X-Frame-Options: DENY faz o mesmo e ainda é útil por compatibilidade. Referrer-Policy controla quanto da URL de origem é enviado ao clicar num link (strict-origin-when-cross-origin envia só o domínio para outros sites, evitando vazar parâmetros da URL). Permissions-Policy liga e desliga recursos do navegador, como câmera, microfone e geolocalização, para a sua página.',
            `Content-Security-Policy: frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()`
          ),
          sl(
            'Cookies Secure e conteúdo misto',
            'O atributo Secure faz o navegador enviar o cookie somente em conexões HTTPS; sem ele, o cookie de sessão pode vazar numa requisição HTTP. (Secure não é HttpOnly: HttpOnly esconde o cookie do JavaScript.) Conteúdo misto acontece quando uma página HTTPS carrega algum recurso por http:// — um script, por exemplo. Esse recurso viaja sem proteção e pode ser trocado por alguém na rede, o que dá ao atacante controle sobre a página. A correção é carregar tudo por HTTPS; navegadores modernos já bloqueiam parte desse conteúdo.',
            `Set-Cookie: sid=<valor>; Secure; HttpOnly; SameSite=Lax
<!-- ERRADO: script por http dentro de página https -->
<script src="http://cdn.exemplo.local/lib.js"></script>`
          ),
          sl(
            'Como verificar e como configurar',
            'Para ver os cabeçalhos de um servidor que você administra (ou de um app local de laboratório), use curl -I (só os cabeçalhos da resposta) ou a aba Rede (Network) das DevTools do navegador. Na aplicação, o ideal é definir os cabeçalhos num ponto único (middleware), para que nenhuma resposta fique de fora. Exemplo em Python: uma função que acrescenta os cabeçalhos a toda resposta. Saída real da execução: os cinco cabeçalhos aparecem junto do Content-Type original.',
            `SEC = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}
def add_security_headers(headers):
    headers = dict(headers)
    headers.update(SEC)
    return headers

# Saída ao imprimir cada par:
# Content-Type: text/html
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), geolocation=()

# Verificar (em app local ou sua):  curl -I https://exemplo.local`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o TLS (HTTPS) realmente protege?', 'b', [
          'Garante que a aplicação não tenha falhas como SQL injection e XSS, pois todo o tráfego passa criptografado.',
          'Confidencialidade e integridade dos dados em trânsito e a autenticação do servidor pelo certificado.',
          'Os dados gravados no banco do servidor, que passam a ficar cifrados em repouso pelo próprio protocolo.',
          'Impede que usuários legítimos enviem entradas maliciosas pelos formulários da aplicação.'
        ], 'O TLS protege o caminho entre navegador e servidor. Ele não corrige bugs da aplicação nem cifra o banco de dados.'),
        mcq('q2', 'Qual é o efeito do cabeçalho HSTS (Strict-Transport-Security)?', 'd', [
          'Cifra os cookies guardados no disco do usuário para que o JavaScript da página não os leia na prática.',
          'Bloqueia o carregamento de scripts vindos de outras origens na página, como faz a CSP em geral.',
          'Redireciona o servidor para o balanceador de carga sempre que há erro de certificado.',
          'O navegador passa a usar só HTTPS para o domínio durante o max-age, mesmo se digitarem http://.'
        ], 'HSTS elimina o primeiro salto inseguro em http:// depois da primeira visita, pois o navegador já sabe que o domínio exige HTTPS.'),
        mcq('q3', 'Para que serve X-Content-Type-Options: nosniff?', 'a', [
          'Impede o navegador de adivinhar o tipo do arquivo, obedecendo sempre ao Content-Type declarado.',
          'Impede que a página seja exibida dentro de um iframe de outro site, evitando clickjacking.',
          'Esconde do cliente a versão do servidor web e do framework em uso na aplicação.',
          'Obriga que todos os cookies da aplicação sejam enviados somente por conexões HTTPS.'
        ], 'Sem nosniff, um arquivo enviado como texto poderia ser interpretado como script. Com ele, o navegador obedece ao tipo declarado.'),
        fill('q4', 'Complete o cabeçalho que impede o navegador de adivinhar o tipo do conteúdo.', 'X-Content-Type-Options: ___', ['nosniff'], 'O valor é nosniff: o navegador não tenta "farejar" o tipo real do conteúdo.'),
        mcq('q5', 'Qual configuração protege contra clickjacking?', 'c', [
          'Referrer-Policy: no-referrer, para que o site emoldurador não saiba a origem do clique do usuário.',
          'Permissions-Policy: camera=(), para desligar recursos sensíveis do navegador na página.',
          'frame-ancestors \'none\' na CSP (ou X-Frame-Options: DENY), proibindo que outros sites emoldurem a página.',
          'includeSubDomains no HSTS, para cobrir todos os subdomínios do site com HTTPS.'
        ], 'Clickjacking depende de a página ser carregada em iframe de outro site; frame-ancestors (ou X-Frame-Options) proíbe isso.'),
        mcq('q6', 'O que o atributo Secure faz em um cookie?', 'b', [
          'Torna o cookie ilegível pelo JavaScript da página, protegendo-o contra roubo por XSS.',
          'O navegador só envia o cookie em conexões HTTPS, nunca em HTTP simples.',
          'Impede o envio do cookie em requisições originadas de outros sites, bloqueando CSRF.',
          'Cifra o valor do cookie para que o usuário e terceiros não consigam lê-lo.'
        ], 'Secure é sobre o canal (só HTTPS). Esconder do JavaScript é HttpOnly; restringir envio entre sites é SameSite.'),
        mcq('q7', 'Uma página servida por HTTPS carrega um script por http://. Qual é o problema e a correção?', 'd', [
          'Nenhum problema, pois o documento principal já está em HTTPS e protege os recursos que ele carrega em produção.',
          'Apenas desempenho; basta compactar o arquivo e o aviso desaparece sem outros efeitos.',
          'Basta adicionar Referrer-Policy para que o script não seja interceptado no caminho da rede.',
          'Conteúdo misto: alguém na rede pode trocar o script e controlar a página; carregue o recurso por HTTPS.'
        ], 'Um recurso ativo carregado sem TLS pode ser alterado no trajeto. O script roda com os poderes da página, então o risco é alto.'),
        fill('q8', 'Complete o comando para exibir apenas os cabeçalhos da resposta de um servidor seu.', 'curl ___ https://exemplo.local', ['-I', '--head', '-i'], 'curl -I (ou --head) faz uma requisição e mostra só os cabeçalhos da resposta.')
      ]
    },
    {
      id: 'owb-17-criptografia-dados-sensiveis',
      title: 'Exposição de dados sensíveis e criptografia básica',
      goal: 'Distinguir hash, criptografia e codificação, escolher algoritmos modernos e coletar o mínimo de dados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Que dados são sensíveis e onde protegê-los',
            'Dados sensíveis incluem credenciais (senhas), tokens e chaves, dados pessoais (nome, CPF, e-mail), financeiros (cartão, conta) e de saúde. Eles precisam de proteção em dois estados: em trânsito (pela rede, com TLS) e em repouso (gravados em banco, arquivo, backup, disco). Um site com HTTPS mas com backup sem proteção ainda expõe os dados. Falhar aqui é a causa clássica de vazamentos: dados guardados em texto puro, algoritmos fracos ou chaves mal guardadas.'
          ),
          sl(
            'Hash, criptografia e codificação não são a mesma coisa',
            'Codificação (Base64, URL-encoding) só muda a representação dos dados para transporte; não há segredo, qualquer um desfaz. Hash é uma função de mão única: gera uma "impressão digital" de tamanho fixo e não existe operação para voltar ao original (serve para verificar integridade e, com algoritmos próprios, guardar senhas). Criptografia é reversível, mas só por quem tem a chave. Erro frequente: achar que Base64 protege algo. Veja a saída real: o "texto protegido" volta ao original sem chave nenhuma.',
            `import base64, hashlib
t = base64.b64encode(b"senha123")
print(t, base64.b64decode(t))
# b'c2VuaGExMjM=' b'senha123'      <- reverteu sem chave: NAO e protecao

print(hashlib.sha256(b"senha123").hexdigest()[:16])
# 55a5e9e78207b4df               <- hash: mao unica`
          ),
          sl(
            'Algoritmos modernos e obsoletos',
            'Use algoritmos atuais e revisados pela comunidade: AES com modo autenticado (AES-GCM) para criptografar; SHA-256 (ou família SHA-2/SHA-3) para hash de uso geral; Argon2 (ou bcrypt/scrypt) para senhas, por serem lentos de propósito. Evite os obsoletos: MD5 e SHA-1 (têm colisões conhecidas), DES (chave curta demais) e o modo ECB (blocos iguais geram saídas iguais, vazando padrões). Atenção: SHA-256 puro é rápido demais para senhas; senhas pedem função própria de hash de senha, com salt.'
          ),
          sl(
            'Nunca invente criptografia; guarde bem as chaves',
            'Não crie seu próprio algoritmo nem "embaralhe" dados com XOR caseiro: criptografia segura vem de bibliotecas maduras e públicas, usadas conforme a documentação (a segurança deve depender só da chave, não do segredo do método). A chave é o ponto crítico: não pode estar no código-fonte nem no repositório. Guarde em variável de ambiente, arquivo protegido fora do repositório ou cofre de segredos/KMS, com acesso restrito e rotação periódica. Chave junto do dado cifrado é como trancar a porta e pendurar a chave na maçaneta.'
          ),
          sl(
            'Números aleatórios seguros',
            'Tokens de sessão, links de redefinição de senha e chaves precisam ser imprevisíveis. O gerador comum de linguagens (random em Python, Math.random em JavaScript) é previsível e não serve para segurança. Use o gerador criptográfico do sistema: em Python, o módulo secrets; em Node, crypto.randomBytes. O token deve ser longo o bastante para não ser adivinhado (32 bytes aleatórios é um bom padrão).',
            `import secrets
token = secrets.token_urlsafe(32)   # imprevisivel, adequado a tokens
print(len(token))                   # 43 caracteres`
          ),
          sl(
            'Minimização, mascaramento e LGPD',
            'O dado mais seguro é o que você nunca coletou: não peça nem guarde o que não precisa (minimização) e apague quando acabar a finalidade. Não mostre dados completos em telas e logs: mascare, exibindo só o necessário (cartão como **** 1234; CPF parcial) e nunca registre senha, token ou número completo de cartão. A LGPD (Lei 13.709/2018) exige que dados pessoais tenham segurança adequada, coleta limitada ao necessário e finalidade clara; vazar dados por falta de proteção traz risco ao titular e responsabilidade à organização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um colega diz que guardou o token do usuário "protegido" com Base64. O que está errado?', 'c', [
          'Base64 é um algoritmo obsoleto como MD5 e deveria ser trocado por SHA-1 para melhorar a proteção.',
          'Base64 é irreversível, então o sistema nunca conseguirá ler o token de volta depois de gravá-lo.',
          'É uma codificação que qualquer pessoa desfaz sem chave; não oferece proteção alguma ao dado.',
          'Base64 só funciona em trânsito pela rede e falha quando o dado é gravado em disco ou banco.'
        ], 'Base64 apenas muda a representação. Para proteger, é preciso criptografia com chave (ou hash, se não precisar recuperar o valor).'),
        mcq('q2', 'Qual é a diferença essencial entre hash e criptografia?', 'a', [
          'O hash é de mão única e não se desfaz; a criptografia é reversível por quem tem a chave.',
          'O hash exige uma chave secreta para ser calculado e a criptografia não exige nenhuma chave.',
          'Os dois são reversíveis, mas o hash gera saídas sempre maiores que o dado original.',
          'A criptografia serve só para dados em trânsito e o hash serve só para dados em repouso na prática.'
        ], 'Hash verifica sem permitir recuperar o original; criptografia permite recuperar o dado com a chave correta.'),
        mcq('q3', 'Qual escolha é adequada para cifrar dados pessoais gravados no banco?', 'd', [
          'MD5 sobre cada campo, pois gera saída de tamanho fixo e difícil de ler a olho nu em geral.',
          'AES em modo ECB, porque é simples de implementar e bem suportado por bibliotecas.',
          'DES com chave guardada numa constante do código para facilitar a manutenção do sistema.',
          'AES-GCM de uma biblioteca madura, com a chave mantida fora do código e do repositório.'
        ], 'MD5 é hash (não cifra), ECB vaza padrões e DES é fraco. AES-GCM com gestão correta da chave é a opção moderna.'),
        fill('q4', 'Complete o módulo do Python usado para gerar tokens imprevisíveis.', 'import secrets\ntoken = ___.token_urlsafe(32)', ['secrets'], 'O módulo secrets usa o gerador criptográfico do sistema; random é previsível.'),
        mcq('q5', 'Onde deve ficar a chave usada para cifrar os dados?', 'b', [
          'Numa constante no código-fonte, pois o código-fonte já é privado e restrito à equipe.',
          'Em variável de ambiente ou cofre de segredos, fora do repositório, com acesso restrito e rotação.',
          'Gravada no mesmo banco, ao lado do dado cifrado, para facilitar a descriptografia depois.',
          'Em um arquivo versionado no Git, desde que o repositório do projeto seja privado.'
        ], 'A chave não pode ir ao código nem ao repositório; quem acessa o repositório não deve ganhar acesso aos dados.'),
        mcq('q6', 'O que significa minimização de dados?', 'a', [
          'Coletar e guardar só o necessário para a finalidade; o dado que nunca foi coletado não pode vazar.',
          'Compactar os dados em disco para ocupar menos espaço e acelerar os backups da aplicação por padrão.',
          'Guardar todos os dados que forem possíveis e cifrá-los depois, caso venham a ser úteis.',
          'Dividir o mesmo dado em várias tabelas do banco para dificultar a leitura por terceiros.'
        ], 'Minimizar reduz o impacto de um vazamento e atende o princípio da necessidade da LGPD.'),
        mcq('q7', 'Uma tela de suporte mostra o número do cartão completo. Qual é a melhor prática?', 'c', [
          'Manter como está, pois só funcionários da empresa têm acesso a essa tela de suporte.',
          'Mostrar o número em Base64 para que não fique legível de relance por quem passa na prática.',
          'Mascarar (mostrar só os últimos dígitos) e não registrar o número completo em logs.',
          'Mostrar completo e apagar o conteúdo da tela depois de alguns minutos sem uso.'
        ], 'Mascaramento limita a exposição por ombro, capturas de tela e logs. Mostre só o necessário à tarefa.'),
        fill('q8', 'Complete: Base64 é uma ___, e não criptografia.', '# Base64 e uma ___ (reversivel sem chave)', ['codificação', 'codificacao'], 'Base64 é codificação: muda a representação, sem segredo algum.')
      ]
    },
    {
      id: 'owb-18-uploads-path-traversal',
      title: 'Uploads de arquivos e path traversal',
      goal: 'Receber arquivos de usuários com segurança e impedir acesso a caminhos fora do diretório permitido.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que upload é perigoso',
            'Receber um arquivo é aceitar dados totalmente controlados por quem envia. Riscos: execução de código (um arquivo de script gravado numa pasta que o servidor executa vira controle do servidor); XSS por arquivo (um HTML ou SVG enviado e servido pelo seu domínio executa script no contexto do site); negação de serviço (arquivos enormes enchem disco e memória); e sobrescrita (o nome enviado coincide com um arquivo existente e o substitui).'
          ),
          sl(
            'Defesa 1: validar tipo, conteúdo e tamanho',
            'Use uma allowlist (lista de permitidos) de extensões, como .png, .jpg e .pdf — nunca uma blocklist de proibidos. Mas extensão e o Content-Type vêm do cliente e podem ser forjados; por isso verifique também o conteúdo real: a assinatura do arquivo (os primeiros bytes, como o cabeçalho PNG) ou o tipo detectado por biblioteca, e, para imagens, reprocesse/recodifique. Defina um limite de tamanho no servidor (e no proxy), recusando o excedente antes de gravar tudo. Um antivírus no fluxo de upload é uma camada adicional para arquivos que outros usuários vão baixar.'
          ),
          sl(
            'Defesa 2: nome e local de armazenamento',
            'Nunca use o nome enviado pelo usuário para gravar no disco: gere um nome aleatório no servidor (por exemplo, um UUID) e guarde o nome original, se precisar, apenas como metadado no banco. Isso evita sobrescrita, caracteres perigosos e tentativas de caminho. Armazene fora do diretório público do servidor web e, se precisar servir, entregue por uma rota que você controla (com Content-Type correto e nosniff) ou use um armazenamento de objetos sem execução. Pasta de uploads nunca deve ter permissão de execução.',
            `import uuid
nome_seguro = str(uuid.uuid4()) + ".png"   # nome gerado no servidor`
          ),
          sl(
            'Path traversal: sair do diretório permitido',
            'Path traversal (ou directory traversal) acontece quando a aplicação monta um caminho de arquivo com texto do usuário e ele inclui ../ (subir um nível). Numa rota de download como /baixar?nome=foto.png, o valor ../../../etc/passwd faz a aplicação ler um arquivo fora da pasta de uploads. Vale também para gravação: o atacante escolhe onde gravar. Impacto: leitura de arquivos de configuração, chaves e código, ou escrita que leva à execução. Causa: confiar na entrada ao construir caminhos.'
          ),
          sl(
            'Vulnerável vs corrigido (rode no seu laboratório)',
            'A versão vulnerável só junta os textos com os.path.join. A corrigida resolve o caminho final com os.path.realpath (que normaliza ../ e links simbólicos) e confere se o resultado continua dentro do diretório base. Teste isolado e local, com arquivos fictícios. Saída real:',
            `import os
BASE = "/srv/app/uploads"

def vulneravel(nome):
    return os.path.join(BASE, nome)          # confia na entrada

def seguro(nome):
    base = os.path.realpath(BASE)
    p = os.path.realpath(os.path.join(base, nome))
    if os.path.commonpath([base, p]) != base:
        raise PermissionError("fora do diretorio base")
    return p

# nome = "foto.png"
#   vulneravel -> /srv/app/uploads/foto.png
#   seguro     -> /srv/app/uploads/foto.png
# nome = "../../../etc/passwd"
#   vulneravel -> /etc/passwd            (normalizado: FORA da pasta!)
#   seguro     -> bloqueado: fora do diretorio base`
          ),
          sl(
            'Zip Slip em visão geral',
            'Zip Slip é o mesmo problema dentro de arquivos compactados: uma entrada de um .zip ou .tar com nome como ../../app/config é extraída fora da pasta de destino e sobrescreve arquivos do sistema. A defesa é a mesma lógica do slide anterior, aplicada a CADA entrada antes de extrair: calcule o caminho final, confirme que está dentro do destino e recuse o restante (bibliotecas atuais costumam oferecer opções de extração segura; prefira-as e mantenha-as atualizadas). Limite também o tamanho total descompactado, para evitar arquivos "bomba".'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o risco mais grave de aceitar um upload de script e gravá-lo numa pasta que o servidor executa?', 'd', [
          'Apenas o consumo de espaço em disco, que se resolve com limpeza periódica dos arquivos antigos.',
          'O arquivo ficará com nome repetido, o que só causa confusão na listagem de arquivos.',
          'O navegador do usuário exibirá aviso de certificado inválido ao abrir a página de envio em geral.',
          'Execução de código no servidor, dando ao atacante controle sobre a aplicação e os dados.'
        ], 'Upload mais local executável é a receita clássica de execução remota de código. Daí a pasta sem permissão de execução.'),
        mcq('q2', 'Por que validar só a extensão ou o Content-Type enviado não basta?', 'b', [
          'Porque extensões são removidas pelo navegador antes do envio e o servidor não as vê.',
          'Porque ambos vêm do cliente e podem ser forjados; é preciso olhar o conteúdo real.',
          'Porque o servidor não consegue ler o nome do arquivo recebido em formulários multipart.',
          'Porque o Content-Type só existe em requisições do tipo GET, nunca em POST.'
        ], 'O cliente controla o que diz: um script pode ser enviado com nome .png. A checagem do conteúdo reduz esse engano.'),
        mcq('q3', 'Como deve ser o nome do arquivo gravado no servidor?', 'c', [
          'O mesmo nome enviado, trocando apenas os espaços por sublinhado, para evitar problemas de leitura.',
          'O nome enviado em minúsculas, para evitar diferenças entre sistemas de arquivos.',
          'Um nome aleatório gerado no servidor (ex.: UUID), guardando o original apenas como metadado.',
          'O nome enviado mais a data atual no final, para evitar que dois nomes sejam iguais.'
        ], 'Nome gerado pelo servidor evita sobrescrita, caracteres perigosos e tentativas de caminho com ../.'),
        fill('q4', 'Complete a geração de um nome aleatório com UUID.', 'import uuid\nnome = str(uuid.___()) + ".png"', ['uuid4'], 'uuid4() gera um identificador aleatório; o nome não depende de nada enviado pelo usuário.'),
        mcq('q5', 'O que é path traversal?', 'a', [
          'Quando a entrada contém ../ e faz o caminho montado sair do diretório que deveria ser usado.',
          'Um ataque que derruba o servidor com um número enorme de requisições simultâneas ao mesmo arquivo.',
          'A troca de um arquivo legítimo por outro de mesmo nome durante a gravação em disco no servidor.',
          'O uso de URLs longas demais, que o servidor não consegue interpretar corretamente ao abrir arquivos.'
        ], 'Path traversal explora a construção de caminhos com texto não confiável, permitindo ler ou gravar fora da pasta prevista.'),
        mcq('q6', 'Qual correção resolve de fato a leitura de arquivos fora da pasta base?', 'd', [
          'Remover a primeira ocorrência de ../ do texto recebido antes de juntar o caminho.',
          'Validar o nome só no JavaScript do formulário, antes de enviar ao servidor na prática.',
          'Trocar as barras por barras invertidas no texto antes de juntar os caminhos.',
          'Resolver o caminho com realpath e rejeitar se estiver fora do diretório base.'
        ], 'Remover "../" ingênuo é contornável (por exemplo, "....//"); validar no front-end é ignorável. Resolver e comparar com a base é robusto.'),
        mcq('q7', 'O que é Zip Slip e como se previne?', 'b', [
          'Um .zip grande demais que esgota a memória do servidor; previne-se recusando arquivos compactados.',
          'Entrada do arquivo compactado com ../ no nome, extraída fora do destino; valida-se o caminho de cada entrada.',
          'Um .zip protegido por senha fraca demais; previne-se com uma senha mais longa e complexa no servidor.',
          'Um .zip com a extensão trocada por outra; previne-se renomeando o arquivo ao receber.'
        ], 'É path traversal dentro de arquivos compactados. Cada entrada precisa ter o caminho final confirmado dentro do destino.'),
        fill('q8', 'Complete a função que normaliza o caminho antes da comparação com o diretório base.', 'p = os.path.___(os.path.join(base, nome))', ['realpath'], 'realpath resolve ../ e links simbólicos, permitindo comparar o destino real com a pasta base.')
      ]
    },
    {
      id: 'owb-19-ssrf-basico',
      title: 'SSRF — falsificação de requisição do lado do servidor',
      goal: 'Reconhecer SSRF e aplicar defesas em camadas: allowlist, validação de IP, redirecionamentos e rede.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é SSRF',
            'Muitas aplicações buscam uma URL informada pelo usuário: pré-visualização de link, importar imagem por endereço, webhook, conversor de PDF. SSRF (Server-Side Request Forgery) ocorre quando um atacante escolhe o destino dessa requisição, e o SERVIDOR faz a chamada em seu nome. A causa é confiar na URL recebida sem restringir para onde o servidor pode ir. A diferença para um acesso comum: a requisição sai de dentro da sua infraestrutura, com a rede e as permissões do servidor.'
          ),
          sl(
            'Por que é perigoso: o que o servidor alcança',
            'O servidor costuma enxergar o que o mundo externo não enxerga: serviços locais (um painel administrativo em localhost, bancos e filas), endereços de rede privada e, em nuvem, o serviço de metadados, um endereço interno especial (169.254.169.254, faixa link-local) que pode entregar credenciais temporárias da máquina. Impacto: leitura de dados internos, mapeamento da rede, uso de credenciais da nuvem e acesso a serviços que confiavam em "só a rede interna chega aqui". Por isso o SSRF é levado a sério em nuvem.'
          ),
          sl(
            'Defesa 1: evitar e usar allowlist',
            'A melhor defesa é não buscar URLs arbitrárias: se a funcionalidade precisa só de alguns provedores, aceite o identificador (por exemplo, "provedor=A") e monte a URL no servidor. Quando o usuário realmente informa o endereço, use allowlist de destinos permitidos (domínios e portas conhecidos) e aceite só os esquemas https (e http se indispensável), recusando file://, gopher:// e outros. Uma blocklist de "endereços proibidos" costuma falhar porque há muitas maneiras de escrever o mesmo destino.'
          ),
          sl(
            'Defesa 2: resolver o nome e validar o IP',
            'Validar o texto da URL não basta: um nome de domínio pode apontar para um IP privado. Faça assim: extraia o host, resolva o nome para IP e confira que o endereço é público; recuse loopback (127.0.0.1 e ::1, que apontam para a própria máquina), faixas privadas (10.x, 172.16-31.x, 192.168.x) e link-local (169.254.x.x). Em Python, o módulo ipaddress ajuda, e is_global é True só para endereços públicos. Saída real:',
            `import ipaddress
for ip in ["8.8.8.8", "127.0.0.1", "10.0.0.5",
           "192.168.1.10", "169.254.169.254", "::1"]:
    print(ip, ipaddress.ip_address(ip).is_global)

# 8.8.8.8 True
# 127.0.0.1 False
# 10.0.0.5 False
# 192.168.1.10 False
# 169.254.169.254 False
# ::1 False`
          ),
          sl(
            'Redirecionamentos e a hora da conexão',
            'Mesmo com a URL inicial aprovada, o destino pode responder com um redirecionamento (302) para http://127.0.0.1/. Por isso, desative o seguimento automático de redirecionamentos ou revalide a URL (e o IP) a cada salto. Cuidado também com a diferença entre o momento da checagem e o da conexão: se o nome for resolvido de novo na hora de conectar, a resposta DNS pode ter mudado. O mais seguro é conectar-se ao IP que você já validou. Demonstre tudo isso somente em laboratório local, com serviços fictícios que você mesmo subiu.'
          ),
          sl(
            'Defesa 3: a rede também protege',
            'Validação no código pode ter falhas; adicione camadas na infraestrutura. Segmente a rede para que o servidor que busca URLs fique isolado dos serviços internos sensíveis; aplique filtragem de saída (egress filtering), permitindo que o servidor se conecte apenas aos destinos necessários; exija autenticação nos serviços internos (não confie em "vem da rede interna"); e proteja o serviço de metadados da nuvem usando a versão que exige token/sessão e reduzindo o alcance das credenciais da máquina (menor privilégio). Assim, mesmo um SSRF encontra pouco para explorar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza uma vulnerabilidade de SSRF?', 'a', [
          'O servidor faz uma requisição a um destino escolhido pelo usuário, inclusive a recursos internos.',
          'O navegador do usuário envia dados a um site de terceiros sem o conhecimento do usuário do usuário.',
          'O servidor aceita requisições de qualquer origem sem verificar o certificado TLS dos clientes.',
          'Um atacante repete requisições legítimas capturadas na rede para refazer uma ação da vítima.'
        ], 'No SSRF quem faz a chamada é o servidor da vítima, com a rede e as permissões dele.'),
        mcq('q2', 'Por que o SSRF é especialmente perigoso em ambientes de nuvem?', 'c', [
          'Porque a nuvem desativa o TLS nas conexões entre servidores internos do mesmo provedor.',
          'Porque o provedor registra todas as requisições do cliente e as torna públicas na internet.',
          'Porque o servidor alcança a rede interna e o serviço de metadados, que pode entregar credenciais temporárias.',
          'Porque aplicações hospedadas em nuvem não podem usar firewall nem filtros de rede.'
        ], 'O endereço de metadados (link-local) só responde a partir da própria máquina, e o SSRF usa o servidor como ponte.'),
        mcq('q3', 'Qual é a defesa mais forte quando a função só precisa acessar poucos serviços conhecidos?', 'b', [
          'Bloquear a palavra "localhost" no texto da URL recebida e aceitar o resto sem verificar em geral.',
          'Allowlist de destinos permitidos (ou receber só um identificador que o servidor traduz).',
          'Validar o formato da URL com uma expressão regular e seguir qualquer redirecionamento recebido.',
          'Pedir ao usuário que confirme a URL numa caixa de diálogo antes de buscar o conteúdo.'
        ], 'Restringir o que pode ser acessado é mais robusto que tentar listar o que é proibido; blocklists são contornáveis.'),
        fill('q4', 'Complete a verificação que só aceita IPs públicos.', 'a = ipaddress.ip_address(ip)\nif not a.___:\n    raise ValueError("destino bloqueado")', ['is_global'], 'is_global é True para endereços públicos e False para loopback, privados e link-local.'),
        mcq('q5', 'A URL informada passa na validação, mas o servidor de destino responde 302 para http://127.0.0.1/. O que fazer?', 'd', [
          'Seguir o redirecionamento, pois a URL original já foi aprovada pela validação inicial na prática.',
          'Aumentar o tempo limite da requisição para dar chance de a resposta completar sem erro.',
          'Registrar o redirecionamento em log e permitir, já que é um comportamento padrão do HTTP.',
          'Desativar o seguimento automático ou revalidar a URL e o IP a cada salto de redirecionamento.'
        ], 'Redirecionamentos são um caminho clássico para contornar a validação inicial; cada salto é um novo destino a validar.'),
        mcq('q6', 'Por que checar só o nome do host como texto (ex.: recusar "localhost") não é suficiente?', 'c', [
          'Porque nomes de host não podem misturar letras e números numa mesma URL válida.',
          'Porque o DNS só funciona com endereços IPv6 e ignora os nomes que forem escritos em texto em produção.',
          'Um nome pode resolver para um IP privado; é preciso resolver o nome e validar o IP obtido.',
          'Porque o navegador reescreve o host antes de enviar a requisição ao servidor da aplicação.'
        ], 'O nome é só um rótulo; o que importa é o IP final. Resolva e valide o endereço obtido.'),
        mcq('q7', 'Qual é o papel da filtragem de saída (egress filtering) e da segmentação de rede contra SSRF?', 'a', [
          'Restringir para onde o servidor pode se conectar, reduzindo o impacto mesmo se o código falhar.',
          'Substituir a necessidade de validar a URL no código da aplicação, já que a rede resolve tudo.',
          'Criptografar as URLs recebidas antes de serem processadas pelo servidor da aplicação.',
          'Impedir que usuários externos acessem a página inicial do site pela internet pública.'
        ], 'É defesa em profundidade: o código valida e a rede restringe, de modo que uma falha isolada não exponha tudo.'),
        fill('q8', 'Complete: 127.0.0.1 e ::1 são endereços de ___, que apontam para a própria máquina.', '# 127.0.0.1 e ::1 sao enderecos de ___ (a propria maquina)', ['loopback'], 'Loopback aponta para a própria máquina; um SSRF contra ele alcança serviços locais do servidor.')
      ]
    },
    {
      id: 'owb-20-componentes-vulneraveis',
      title: 'Componentes vulneráveis e desatualizados',
      goal: 'Gerenciar dependências com SCA, lockfiles e atualização contínua para reduzir risco da cadeia de software.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Sua aplicação é feita de código dos outros',
            'Uma aplicação moderna usa dezenas ou centenas de bibliotecas. As diretas são as que você declara (por exemplo, no package.json ou requirements.txt). As transitivas são as dependências das suas dependências, que você nem escolheu. Uma falha em qualquer uma delas é uma falha na sua aplicação, com os mesmos privilégios. Por isso "componentes vulneráveis e desatualizados" é uma categoria clássica de risco: o código próprio pode estar perfeito e o sistema ainda ser invadido por uma biblioteca antiga.'
          ),
          sl(
            'CVE, CVSS e avisos de segurança',
            'CVE (Common Vulnerabilities and Exposures) é um identificador público e padronizado de uma vulnerabilidade conhecida, no formato CVE-ano-número. CVSS é um sistema de pontuação da gravidade, de 0 a 10, que ajuda a priorizar (mas não considera o seu contexto: uma falha "crítica" numa função que você não usa pode importar menos). Avisos de segurança (advisories) dos mantenedores e das bases de dados de vulnerabilidades dizem quais versões são afetadas e qual versão corrige.'
          ),
          sl(
            'Ferramentas de SCA',
            'SCA (Software Composition Analysis) compara as dependências do projeto com bases de vulnerabilidades conhecidas. Exemplos: npm audit (Node), pip-audit (Python), dotnet list package --vulnerable (.NET) e OWASP Dependency-Check (várias linguagens). Serviços como Dependabot e Renovate abrem automaticamente pedidos de atualização quando surge versão nova ou correção. O ideal é rodar essas ferramentas no CI a cada alteração e também periodicamente, pois novas vulnerabilidades são descobertas em código que já estava em produção.',
            `$ npm audit
$ pip-audit
$ dotnet list package --vulnerable`
          ),
          sl(
            'Lockfiles, atualização e limpeza',
            'O lockfile (package-lock.json, poetry.lock, etc.) registra as versões exatas resolvidas, inclusive das transitivas: o build é reproduzível e a análise de SCA sabe exatamente o que está instalado. Atualize com frequência, em passos pequenos, sempre com testes automatizados: muitas pequenas atualizações são mais fáceis que uma gigante depois de anos. Remova dependências que não usa mais (menos código de terceiros, menos superfície de ataque) e prefira bibliotecas bem mantidas, com histórico de correções.'
          ),
          sl(
            'Pacotes maliciosos, typosquatting e SBOM',
            'Nem toda ameaça é um bug: há pacotes publicados de propósito para causar dano. Typosquatting é publicar um pacote com nome parecido com um popular (uma letra trocada) esperando que alguém instale por engano; outros ataques comprometem a conta de um mantenedor legítimo. Confira o nome exato, o mantenedor e o histórico antes de instalar, evite instalar por impulso e use lockfiles e registros confiáveis. Um SBOM (Software Bill of Materials) é a lista formal de componentes de um software; com ele, quando surge uma vulnerabilidade nova, você descobre rapidamente se é afetado.'
          ),
          sl(
            '"Não vi a notificação" não é defesa',
            'Alertas de dependência só ajudam se alguém age. Defina responsáveis, prazos por gravidade (por exemplo, corrigir críticas rapidamente) e um fluxo: alerta, avaliar se é explorável no seu contexto, atualizar ou aplicar mitigação, testar e publicar. Se não houver correção, avalie trocar a biblioteca, desativar a função afetada ou adicionar controles compensatórios. Ignorar o aviso apenas deixa a falha conhecida, e publicamente documentada, em produção.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma dependência transitiva?', 'b', [
          'Uma dependência instalada só durante os testes e removida do pacote de produção.',
          'Uma dependência de uma das suas dependências, que você não declarou diretamente.',
          'Uma biblioteca escrita pela sua própria equipe e reutilizada em vários projetos internos.',
          'Uma dependência que muda de versão sozinha a cada execução da aplicação em produção.'
        ], 'Transitivas vêm "de carona". Uma falha nelas afeta você, por isso a SCA analisa a árvore completa.'),
        mcq('q2', 'O que é um CVE?', 'a', [
          'Um identificador público e padronizado de uma vulnerabilidade conhecida (formato CVE-ano-número).',
          'Uma ferramenta que atualiza as dependências do projeto automaticamente a cada semana por padrão.',
          'Um certificado digital que prova que um pacote publicado no registro é seguro.',
          'Um arquivo que lista as versões instaladas de cada biblioteca no projeto.'
        ], 'O CVE dá um nome único à falha, permitindo que ferramentas, avisos e equipes falem da mesma coisa.'),
        mcq('q3', 'Para que serve o CVSS?', 'd', [
          'Para corrigir automaticamente a falha no código da biblioteca afetada pela vulnerabilidade.',
          'Para assinar digitalmente o pacote publicado no registro, atestando a sua origem na prática.',
          'Para listar todas as dependências transitivas do projeto, com suas versões exatas.',
          'Pontuar a gravidade da vulnerabilidade de 0 a 10, ajudando a priorizar as correções.'
        ], 'A pontuação orienta a prioridade, mas não substitui avaliar o contexto da sua aplicação.'),
        fill('q4', 'Complete o comando de SCA do ecossistema Node.', '$ ___ audit', ['npm'], 'npm audit compara as dependências do projeto Node com a base de vulnerabilidades conhecidas.'),
        mcq('q5', 'Qual é a vantagem do lockfile para a segurança?', 'c', [
          'Impede que qualquer biblioteca do projeto receba atualizações no futuro, mesmo as de segurança.',
          'Criptografa as bibliotecas instaladas no disco para que não sejam alteradas por terceiros.',
          'Fixa versões exatas, inclusive das transitivas, para builds reproduzíveis e análise de SCA precisa.',
          'Remove automaticamente as dependências vulneráveis do projeto quando elas são detectadas.'
        ], 'Sem lockfile, a versão instalada pode variar; com ele, você sabe e controla exatamente o que roda.'),
        mcq('q6', 'O npm audit apontou uma falha corrigida na versão seguinte de uma dependência. Qual é o procedimento adequado?', 'd', [
          'Ignorar o aviso até que alguém reclame, pois a aplicação continua funcionando normalmente no servidor.',
          'Apagar o aviso do relatório para não alarmar a equipe nem atrasar a próxima entrega.',
          'Atualizar direto em produção, sem rodar os testes, para ganhar tempo na correção.',
          'Atualizar em desenvolvimento, rodar os testes e publicar, priorizando pelo risco da falha.'
        ], 'O fluxo é atualizar, testar e publicar. Ignorar mantém uma falha conhecida e documentada em produção.'),
        mcq('q7', 'O que é typosquatting no contexto de pacotes?', 'b', [
          'Um erro de digitação do mantenedor que corrompe a documentação do pacote no registro.',
          'Publicar pacote malicioso com nome parecido com o de um popular, esperando instalação por engano.',
          'Uma forma de compactar dependências para reduzir o tamanho da instalação em produção.',
          'Um método de testar bibliotecas com entradas aleatórias para achar falhas de memória.'
        ], 'A defesa é conferir nome exato, mantenedor e origem antes de instalar um pacote.'),
        fill('q8', 'Complete o comando de SCA do ecossistema Python.', '$ pip install pip-audit && pip-___', ['audit'], 'pip-audit verifica as dependências Python contra bases de vulnerabilidades conhecidas.')
      ]
    },
    {
      id: 'owb-21-segredos-configuracao',
      title: 'Segredos e configuração',
      goal: 'Manter segredos fora do código e do repositório e saber reagir quando um segredo vaza.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um segredo',
            'Segredo é qualquer informação que dá acesso a algo e que não pode ser pública: senhas, chaves de API, tokens de acesso, chaves privadas (TLS, SSH, assinatura), strings de conexão com banco (que costumam trazer usuário e senha) e chaves de criptografia. Quem tem o segredo age como a aplicação. Por isso, vazamentos de segredos são tão graves: não exigem explorar falha alguma, basta usar a credencial.'
          ),
          sl(
            'Nunca no código-fonte nem no repositório',
            'Escrever a chave direto no código ("API_KEY = ...") é o erro mais comum. O código é copiado por toda a equipe, vai para servidores de build, pode ficar público por engano, e o Git guarda tudo para sempre. Mesmo em repositório privado, qualquer pessoa com acesso ao código passa a ter acesso à credencial. Regra: o código lê o segredo de fora, na hora de executar; no repositório fica, no máximo, um arquivo de exemplo com valores fictícios.',
            `# ERRADO
API_KEY = "<chave-real-aqui>"

# CERTO
import os
API_KEY = os.environ["API_KEY"]   # injetada no ambiente`
          ),
          sl(
            'Onde guardar: ambiente, arquivos fora do repo e cofres',
            'Opções, da mais simples à mais robusta: variáveis de ambiente definidas no servidor; um arquivo .env local para desenvolvimento, listado no .gitignore para nunca ser versionado (mantenha um .env.example com valores fictícios); e cofres de segredos (secret managers) dos provedores de nuvem ou ferramentas dedicadas, que controlam quem acessa, registram cada leitura e permitem rotação. Em produção, prefira o cofre ou o mecanismo de segredos da plataforma.',
            `# .gitignore
.env

# .env.example  (versionado, valores ficticios)
API_KEY=<defina-no-seu-ambiente>
DB_URL=<usuario>:<senha>@localhost/<banco>`
          ),
          sl(
            'Menor privilégio e rotação',
            'Cada chave deve ter só as permissões necessárias e o escopo mais estreito possível (somente leitura, só um recurso, só um ambiente): se vazar, o estrago é limitado. Use chaves diferentes por ambiente (desenvolvimento, teste, produção) e por serviço. Rotação é trocar o segredo periodicamente e sempre que houver suspeita de exposição, invalidando o antigo; projete a aplicação para trocar segredos sem reescrever código.'
          ),
          sl(
            'Vazou! O Git lembra de tudo',
            'Apagar o segredo num novo commit NÃO resolve: ele continua no histórico, em clones e forks. Se um segredo foi commitado, a ordem é: 1) REVOGAR/rotacionar o segredo imediatamente (agora ele é considerado comprometido); 2) verificar nos logs do serviço se foi usado indevidamente; 3) só depois remover do histórico, se necessário, e corrigir a causa. Limpar o histórico sem revogar deixa a credencial válida na mão de quem já copiou. Scanners como gitleaks e trufflehog procuram segredos no repositório e no histórico, e podem rodar no CI e em pré-commit para impedir o problema.'
          ),
          sl(
            'Front-end e logs: dois vazamentos silenciosos',
            'Tudo que vai para o navegador ou para um aplicativo instalado é público: JavaScript, variáveis embutidas no bundle e arquivos do app podem ser lidos por qualquer pessoa. Nunca coloque chaves secretas no front-end; faça a chamada sensível no servidor, que guarda o segredo. Só vão ao cliente chaves projetadas para serem públicas (e restritas por domínio/escopo no provedor). Nos logs, também não registre segredos: evite imprimir cabeçalhos Authorization, strings de conexão completas ou o conteúdo de variáveis de ambiente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma chave de API foi enviada ao Git por engano e removida no commit seguinte. O que fazer primeiro?', 'c', [
          'Nada, pois o commit mais recente já não contém a chave e o código atual está limpo.',
          'Reescrever o histórico do Git e continuar usando a mesma chave, já que ninguém a viu.',
          'Revogar/rotacionar a chave agora; ela continua no histórico e deve ser tratada como comprometida.',
          'Tornar o repositório privado e esperar que ninguém tenha copiado a chave até agora.'
        ], 'O histórico, clones e forks guardam a chave. Primeiro invalide a credencial; limpar o histórico vem depois.'),
        mcq('q2', 'Qual é a forma adequada de fornecer a senha do banco à aplicação em produção?', 'd', [
          'Uma constante no código, já que o repositório é privado.',
          'Um arquivo de configuração versionado junto do código-fonte.',
          'Dentro do JavaScript do front-end, para que o navegador conecte direto ao banco.',
          'Variável de ambiente ou cofre de segredos, definidos fora do repositório.'
        ], 'O código lê o segredo do ambiente na execução; o repositório não deve conter a credencial real.'),
        mcq('q3', 'Um desenvolvedor colocou uma chave secreta de um serviço de pagamento no bundle do front-end. Qual é o problema?', 'a', [
          'Todo conteúdo enviado ao navegador é público; qualquer visitante pode ler a chave.',
          'O bundle fica maior e o carregamento da página fica mais lento para o usuário final.',
          'O navegador impede que scripts leiam variáveis de ambiente do servidor, quebrando a chamada.',
          'A chave só funciona em computadores que usem o mesmo sistema operacional do desenvolvedor.'
        ], 'Segredos ficam no servidor; o front-end chama o seu back-end, que usa a chave.'),
        fill('q4', 'Complete o comando que impede o arquivo .env de ser versionado.', 'echo ".env" >> .___', ['gitignore'], 'Listar .env no .gitignore evita que o Git o acompanhe. Mantenha só um .env.example fictício.'),
        mcq('q5', 'Por que dar a cada chave apenas as permissões estritamente necessárias?', 'b', [
          'Porque chaves com poucas permissões respondem mais rápido nas requisições feitas ao serviço.',
          'Se a chave vazar, o dano fica limitado ao pouco que ela permite fazer no serviço.',
          'Porque assim não é preciso rotacionar a chave no futuro, já que o risco desaparece.',
          'Porque o provedor cobra menos por chaves restritas, e esse é o principal motivo técnico.'
        ], 'Menor privilégio reduz o impacto de qualquer vazamento. Rotação continua necessária.'),
        mcq('q6', 'O que é a rotação de segredos?', 'c', [
          'Guardar vários segredos no mesmo arquivo de configuração para facilitar o acesso da equipe do usuário.',
          'Cifrar o segredo com uma chave diferente a cada leitura feita pela aplicação em produção.',
          'Trocar o segredo periodicamente e sempre que houver suspeita de exposição, invalidando o antigo.',
          'Copiar o segredo para vários servidores para ter redundância e disponibilidade do serviço.'
        ], 'Rotacionar limita por quanto tempo um segredo vazado continua útil.'),
        mcq('q7', 'O que fazer com segredos e dados sensíveis nos logs da aplicação?', 'a', [
          'Não registrá-los: omitir ou mascarar tokens, senhas e cabeçalhos de autorização.',
          'Registrá-los completos para facilitar a depuração e apagar os logs depois de um ano.',
          'Registrá-los em Base64 para que não fiquem legíveis.',
          'Registrá-los apenas em arquivos com nome diferente do log principal.'
        ], 'Logs são muito copiados e lidos; segredo neles vira um segundo vazamento.'),
        fill('q8', 'Cite uma ferramenta que varre repositórios e históricos Git procurando segredos expostos.', '# varredura de segredos no repositorio:\n$ ___ detect', ['gitleaks', 'trufflehog'], 'gitleaks e trufflehog procuram padrões de chaves e tokens no código e no histórico.')
      ]
    },
    {
      id: 'owb-22-logging-seguranca',
      title: 'Logging e monitoramento de segurança',
      goal: 'Registrar os eventos certos, sem dados sensíveis, protegê-los e usar os logs para detectar incidentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que registrar eventos de segurança',
            'Sem logs, um ataque pode acontecer sem que ninguém perceba e, depois, ninguém consegue reconstruir o que houve. Logs de segurança permitem detectar comportamento suspeito, investigar incidentes e comprovar o que ocorreu. Mas só funcionam se registrarem os eventos certos, forem protegidos e alguém olhar para eles: monitoramento e alertas completam o ciclo.'
          ),
          sl(
            'O que registrar',
            'Registre eventos relevantes para segurança: autenticação (sucessos e falhas), negações de acesso (usuário tentou algo sem permissão), mudanças de privilégio ou de papel, erros de validação de entrada (muitos podem indicar sondagem), ações administrativas e alterações em dados críticos. Em cada evento, inclua quando (data/hora com fuso), quem (identificador do usuário), o quê (tipo do evento), de onde (IP) e o resultado.'
          ),
          sl(
            'O que NÃO registrar',
            'Nunca grave senhas (nem as erradas digitadas no login, que muitas vezes são a senha correta com um erro de digitação), tokens de sessão ou de API, chaves, números completos de cartão ou outros dados sensíveis. Evite também dados pessoais desnecessários: registre um identificador do usuário em vez de nome, CPF ou e-mail completos. O que não foi gravado não pode vazar do arquivo de log.'
          ),
          sl(
            'Formato estruturado e ID de correlação',
            'Logs em formato estruturado (por exemplo, JSON, um objeto por linha) são fáceis de filtrar e analisar por ferramentas, e o serializador escapa caracteres especiais. Um ID de correlação é um identificador único gerado para cada requisição e repetido em todos os registros dela, permitindo seguir uma ação do início ao fim entre vários serviços. Exemplo real de saída:',
            `import json
def log(evento, **campos):
    print(json.dumps({"ts": "2025-01-01T12:00:00Z",
                      "event": evento, **campos}, ensure_ascii=False))

log("login_failed", user="u_42", ip="203.0.113.7", req_id="a1b2c3")
# {"ts": "2025-01-01T12:00:00Z", "event": "login_failed",
#  "user": "u_42", "ip": "203.0.113.7", "req_id": "a1b2c3"}`
          ),
          sl(
            'Injeção em logs, proteção e integridade',
            'Se a aplicação escreve texto do usuário direto no log, um valor com quebra de linha pode forjar registros falsos: um nome como "ana\\nFALSO: login ok" vira duas linhas, a segunda parecendo um evento legítimo. Defesas: usar formato estruturado (JSON escapa as quebras) e neutralizar \\n e \\r no texto livre. Proteja os logs: acesso restrito, envio para um local central separado do servidor da aplicação, e integridade (que ninguém consiga alterar ou apagar registros para apagar rastros, por exemplo com armazenamento somente de acréscimo).'
          ),
          sl(
            'Alertas, retenção e LGPD',
            'Registro sem revisão não protege. Defina alertas para sinais como muitas falhas de login em pouco tempo, uso de conta administrativa fora do horário ou picos de erros 403/500, e revise periodicamente. Defina retenção: guarde pelo tempo necessário (investigação, obrigações legais) e depois descarte. Pela LGPD, logs podem conter dados pessoais (IP, identificador do usuário): minimize o conteúdo, restrinja quem acessa e fixe um prazo de guarda compatível com a finalidade.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual conjunto de eventos é apropriado registrar para segurança?', 'a', [
          'Falhas e sucessos de login, negações de acesso, mudanças de privilégio e ações administrativas.',
          'Só as requisições que terminaram com sucesso, para manter o log enxuto e fácil de ler.',
          'O conteúdo completo de todos os formulários enviados, incluindo os campos de senha digitados.',
          'Somente erros internos do servidor, pois eventos de autenticação não interessam à segurança.'
        ], 'Esses eventos permitem detectar abuso e investigar incidentes. O resto cria ruído ou risco.'),
        mcq('q2', 'Qual destes dados NÃO deve aparecer nos logs?', 'b', [
          'O identificador interno do usuário que fez o login.',
          'A senha digitada, inclusive quando o login falha.',
          'O resultado da operação (sucesso ou falha).',
          'O ID de correlação da requisição.'
        ], 'Senhas, tokens e números de cartão não devem ser gravados. Um identificador interno é suficiente.'),
        mcq('q3', 'Um atacante envia como nome de usuário o texto "x\\nINFO login ok user=admin". O que pode acontecer num log de texto simples e qual é a defesa?', 'd', [
          'O log recusa a gravação do texto estranho; não é preciso fazer nada a respeito disso na prática.',
          'O texto é gravado criptografado; basta guardar bem a chave usada pelo servidor.',
          'Só a primeira linha é gravada e o restante é descartado pelo sistema de logs.',
          'Surge uma linha falsa (injeção em logs); use formato estruturado e neutralize as quebras de linha.'
        ], 'Quebras de linha permitem forjar registros. JSON escapa o texto, e é útil neutralizar \\n e \\r.'),
        fill('q4', 'Complete a função que serializa o evento de log em JSON.', 'import json\nprint(json.___({"event": "login_failed"}))', ['dumps'], 'json.dumps converte o dicionário em texto JSON, escapando caracteres especiais.'),
        mcq('q5', 'Para que serve o ID de correlação?', 'c', [
          'Para cifrar cada linha do log com uma chave diferente, dificultando a leitura por terceiros.',
          'Para guardar a senha do usuário em formato seguro dentro do registro de eventos.',
          'Ligar todos os registros de uma mesma requisição, mesmo entre serviços diferentes.',
          'Para indicar qual servidor da frota possui o arquivo de log mais antigo guardado em geral.'
        ], 'Com o mesmo req_id em cada linha, você reconstrói a sequência de uma ação.'),
        mcq('q6', 'Como a LGPD afeta os logs?', 'b', [
          'Não afeta, pois logs são arquivos técnicos e não contêm dados pessoais de ninguém.',
          'Logs podem conter dados pessoais; minimize, restrinja o acesso e defina prazo de guarda.',
          'Obriga a guardar logs para sempre, em nome da transparência com os titulares.',
          'Obriga a gravar nome completo e CPF em cada evento para identificar quem agiu.'
        ], 'Logs entram no tratamento de dados pessoais: aplicam-se necessidade, segurança e prazo de retenção.'),
        mcq('q7', 'Qual configuração torna os logs realmente úteis para detectar ataques?', 'd', [
          'Gravar tudo num arquivo local e só abri-lo depois que algum cliente reclamar do problema.',
          'Apagar o arquivo de log todos os dias para não ocupar espaço em disco no servidor.',
          'Permitir que qualquer desenvolvedor edite os registros para corrigir erros de digitação.',
          'Enviar a um local central protegido, com alertas, como para muitas falhas de login.'
        ], 'Registro sem revisão e proteção não detecta nem prova nada; alertas e integridade fecham o ciclo.'),
        fill('q8', 'Complete: proteger a ___ dos logs significa impedir que alguém os altere ou apague para esconder rastros.', '# Proteger a ___ dos logs: ninguem altera ou apaga registros', ['integridade'], 'Integridade garante que os registros permaneçam fiéis ao que ocorreu.')
      ]
    },
    {
      id: 'owb-23-erros-excecoes',
      title: 'Tratamento de erros e exceções',
      goal: 'Tratar erros sem vazar informações, falhando de forma segura e registrando detalhes só no log.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O erro que ajuda o atacante',
            'Quando algo dá errado, o desenvolvedor quer detalhes; o usuário não precisa deles, e o atacante adora. Mensagens como "Erro SQL near ... em /var/www/app/db.py linha 42, versão X" revelam a tecnologia, a estrutura do banco, caminhos de arquivos e versões de bibliotecas — informação que guia ataques. Regra: a pessoa vê uma mensagem genérica; os detalhes ficam no log, acessível só à equipe.'
          ),
          sl(
            'Mensagem genérica ao usuário, detalhe no log',
            'O padrão: capturar a exceção, gerar um identificador do erro, gravar o detalhe completo (tipo, stack trace) no log junto desse identificador e devolver ao usuário só "Erro interno" e o código para ele informar ao suporte. Nunca exiba stack traces, consultas SQL, caminhos ou versões. Saída real do exemplo:',
            `def handle(f):
    try:
        return 200, f()
    except Exception as e:
        rid = "e-4f2a"                       # id gerado por erro
        print("LOG", rid, repr(e))           # detalhe so no log
        return 500, {"error": "Erro interno", "id": rid}

print(handle(lambda: 1 / 0))
# LOG e-4f2a ZeroDivisionError('division by zero')
# (500, {'error': 'Erro interno', 'id': 'e-4f2a'})`
          ),
          sl(
            'Páginas padrão e modo de depuração',
            'Servidores e frameworks têm páginas de erro padrão que mostram versão, módulo ou até o código. Substitua por páginas próprias e genéricas para 404, 403 e 500. E o modo de depuração (debug), muito útil em desenvolvimento, deve estar DESLIGADO em produção: alguns frameworks, com ele ligado, exibem variáveis, código-fonte e até consoles interativos no navegador.'
          ),
          sl(
            'Fail secure: na dúvida, negar',
            'Falhar de forma segura significa que, quando algo dá errado, o sistema cai no estado mais restritivo. Se a verificação de permissão lança uma exceção (serviço de autorização fora do ar, dado inesperado), o resultado é NEGAR o acesso, e não liberar. O erro clássico é um "except: pass" ou um "except: return True" que transforma falha em permissão.',
            `def pode_acessar(user, recurso):
    try:
        return servico_autorizacao.checar(user, recurso)
    except Exception:
        registrar_erro()
        return False          # na duvida, NEGAR`
          ),
          sl(
            'Exceções não tratadas e estados inconsistentes',
            'Uma exceção no meio de uma operação com várias etapas (debitar uma conta e creditar outra) pode deixar o sistema pela metade. Use transações do banco com rollback em caso de erro, para que a operação seja completa ou nada aconteça. Exceções não tratadas também podem derrubar o processo (negação de serviço) ou devolver a página de erro padrão. Trate o que souber tratar nos pontos certos e deixe o restante a um tratador global.'
          ),
          sl(
            'Erros como canal de enumeração e tratamento centralizado',
            'Mensagens diferentes para "usuário não existe" e "senha incorreta" permitem enumerar contas válidas. Responda sempre o mesmo texto ("Usuário ou senha inválidos"), e cuide para que tempo de resposta e código HTTP também não revelem a diferença. Centralize o tratamento de erros num único ponto (um handler global/middleware): o comportamento fica consistente e nenhuma rota esquece de ocultar detalhes. Por fim, teste os caminhos de erro: entradas inválidas, serviços indisponíveis e permissões negadas devem retornar respostas seguras.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que mostrar ao usuário quando ocorre uma exceção inesperada?', 'd', [
          'O stack trace completo, para que o usuário possa enviar o conteúdo ao suporte depois.',
          'A consulta SQL que falhou, pois ela explica ao usuário qual foi o problema ocorrido.',
          'O caminho do arquivo e a versão da biblioteca onde ocorreu o erro na aplicação.',
          'Mensagem genérica com um identificador do erro; os detalhes ficam somente no log.'
        ], 'O identificador liga a queixa do usuário ao registro técnico sem expor nada ao atacante.'),
        mcq('q2', 'Por que é perigoso exibir um stack trace ao usuário?', 'c', [
          'Porque ele deixa a página mais lenta para carregar em redes móveis.',
          'Porque o navegador não consegue renderizar texto que tenha muitas quebras de linha.',
          'Revela caminhos, bibliotecas e versões que ajudam o atacante a planejar o ataque.',
          'Porque stack traces só existem em ambientes de produção e confundem os usuários.'
        ], 'Quanto mais o atacante sabe sobre a tecnologia e a estrutura, mais fácil é escolher o ataque.'),
        mcq('q3', 'O serviço de autorização está fora do ar e a verificação de permissão lança uma exceção. Qual é o comportamento "fail secure"?', 'b', [
          'Liberar o acesso temporariamente para não atrapalhar o usuário enquanto o serviço volta.',
          'Negar o acesso e registrar o erro no log da aplicação para investigação posterior.',
          'Ignorar a exceção e continuar a execução normal como se a checagem tivesse passado.',
          'Reiniciar o servidor para tentar de novo, mantendo a sessão do usuário aberta.'
        ], 'Na dúvida, negar. Transformar falha em permissão é uma falha de segurança.'),
        fill('q4', 'Complete o código de status HTTP para erro interno do servidor.', 'except Exception:\n    return {"error": "Erro interno"}, ___', ['500'], 'O status 500 indica erro interno do servidor; a mensagem fica genérica.'),
        mcq('q5', 'Uma tela de login responde "usuário não encontrado" para contas inexistentes e "senha incorreta" para as existentes. Qual é o risco e a correção?', 'a', [
          'Permite descobrir quais contas existem (enumeração); use uma mensagem genérica igual nos dois casos.',
          'Nenhum risco, pois nomes de usuário são sempre informações públicas de qualquer sistema em produção.',
          'Aumenta apenas o tempo de resposta do servidor; troque a máquina por uma mais rápida.',
          'Impede o uso de HTTPS no formulário; ative o TLS e a mensagem passa a ser segura.'
        ], 'Mensagens iguais (e comportamento semelhante) impedem usar o erro como oráculo de contas válidas.'),
        mcq('q6', 'Qual é a vantagem de um tratador de erros centralizado (handler global)?', 'c', [
          'Dispensa o uso de logs, pois o tratador resolve os erros sozinho sem registrar nada.',
          'Permite que cada rota exiba o erro no formato que preferir, dando liberdade à equipe.',
          'Garante comportamento consistente, sem vazar detalhes, em todas as rotas da aplicação.',
          'Acelera as consultas feitas ao banco de dados ao evitar blocos try/catch repetidos.'
        ], 'Num único ponto você garante mensagem genérica, registro do detalhe e código correto para todo erro.'),
        mcq('q7', 'Uma exceção ocorre entre o débito de uma conta e o crédito de outra. Qual a prática adequada?', 'b', [
          'Capturar a exceção e seguir adiante, já que o débito foi feito e não há como desfazer.',
          'Usar uma transação com rollback para a operação ser completa ou nada ser aplicado.',
          'Mostrar o erro ao usuário e pedir que tente novamente depois de algum tempo.',
          'Desativar o log para a exceção não ser repetida e poluir os registros do servidor na prática.'
        ], 'Transações evitam estados inconsistentes e dinheiro "perdido" no meio do caminho.'),
        fill('q8', 'Complete o valor do modo de depuração (debug) em produção.', 'DEBUG = ___   # em producao', ['False', 'false'], 'Debug ligado em produção pode expor código e variáveis; deve ser False.')
      ]
    },
    {
      id: 'owb-24-seguranca-apis-basico',
      title: 'Segurança de APIs',
      goal: 'Reconhecer os riscos básicos de APIs (BOLA, BFLA, mass assignment, exposição excessiva) e as defesas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'APIs: a porta de dados da aplicação',
            'Uma API expõe funções e dados para o front-end, para aplicativos e para outros sistemas, normalmente em JSON. Como não há tela para esconder nada, tudo que a API aceita e devolve pode ser chamado diretamente por qualquer pessoa com um cliente HTTP. Segurança de API é tratar cada endpoint como uma entrada pública: autenticar quem chama, autorizar cada ação, validar o que chega e devolver só o necessário. A OWASP mantém uma lista própria, o OWASP API Security Top 10, com os riscos mais críticos específicos de APIs.'
          ),
          sl(
            'Autenticação e autorização: BOLA e BFLA',
            'A API autentica por token ou chave (enviados em cabeçalho, sobre HTTPS). Mas autenticar não é autorizar. BOLA (Broken Object Level Authorization): o usuário A pede /pedidos/1002, que é do usuário B, apenas trocando o ID, e a API entrega; a defesa é checar, em toda requisição, se o objeto pertence ao usuário. BFLA (Broken Function Level Authorization): um usuário comum chama um endpoint de administração (DELETE /usuarios/7) porque só o menu estava escondido; a defesa é checar o papel/permissão no servidor para cada função.'
          ),
          sl(
            'Exposição excessiva e mass assignment',
            'Exposição excessiva: a API devolve o objeto inteiro do banco (com hash de senha, campos internos, dados de outros) esperando que o front-end mostre só uma parte. Defesa: montar a resposta com apenas os campos necessários. Mass assignment (atribuição em massa): a API copia todo o JSON recebido para o objeto, e o cliente envia campos que não devia controlar ("role": "admin"). Defesa: allowlist dos campos que o cliente pode definir. Saída real da demonstração (laboratório, dados fictícios):',
            `user = {"name": "Ana", "role": "user"}
payload = {"name": "Ana2", "role": "admin"}   # cliente malicioso

# VULNERAVEL: copia tudo
u = dict(user); u.update(payload)
print(u)   # {'name': 'Ana2', 'role': 'admin'}

# CORRIGIDO: allowlist de campos
PERMITIDOS = {"name"}
u = dict(user)
u.update({k: v for k, v in payload.items() if k in PERMITIDOS})
print(u)   # {'name': 'Ana2', 'role': 'user'}`
          ),
          sl(
            'Limitação de taxa e validação de esquema',
            'Sem limite, um cliente pode fazer milhares de chamadas: força bruta de senhas, raspagem de dados, esgotamento de recursos. A limitação de taxa (rate limiting) restringe quantas requisições cada cliente/usuário/IP faz por período; ao exceder, responda 429 Too Many Requests. Valide também o esquema: tipos, tamanhos, formatos e campos permitidos de cada requisição (com JSON Schema ou a validação do framework), rejeitando campos desconhecidos e corpos enormes.'
          ),
          sl(
            'CORS, HTTPS e erros',
            'CORS define quais origens (sites) o navegador deixa ler as respostas da sua API: configure uma lista explícita de origens confiáveis, e não reflita qualquer Origin recebido (e, quando há credenciais, o curinga * não é aceito pelos navegadores). CORS não substitui autenticação: ele só orienta navegadores. Exija HTTPS em toda a API, redirecionando ou recusando http. Devolva erros sem vazamento: mensagens genéricas e códigos HTTP corretos (400, 401, 403, 404, 429), sem stack trace.'
          ),
          sl(
            'Versionamento e inventário',
            'APIs antigas esquecidas são risco: versões v1 sem correção, endpoints de teste e documentação exposta em produção continuam acessíveis. Mantenha um inventário de todos os endpoints, versões e ambientes, desative o que não é mais usado e planeje o versionamento (/v1, /v2) com prazo para encerrar versões antigas. O que você não sabe que existe, você não protege.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O usuário A obtém os dados do pedido do usuário B trocando o ID na URL. Que falha é essa?', 'b', [
          'Limitação de taxa ausente no endpoint, que permite repetir chamadas sem controle algum.',
          'BOLA: falta autorização por objeto; é preciso checar se o pedido pertence ao usuário da requisição.',
          'Mass assignment: o cliente definiu um campo que não devia poder controlar na requisição.',
          'CORS mal configurado no servidor, deixando outras origens lerem as respostas da API.'
        ], 'Autenticado não significa autorizado: cada objeto precisa ser verificado contra o usuário da requisição.'),
        mcq('q2', 'Um usuário comum consegue chamar DELETE /usuarios/7, que deveria ser só do administrador. Qual é a correção?', 'd', [
          'Esconder o botão de excluir no front-end para usuários comuns, removendo-o do menu por padrão.',
          'Trocar o nome do endpoint para uma URL mais difícil de adivinhar e não divulgá-la em geral.',
          'Limitar o número de chamadas por minuto para esse endpoint específico de exclusão.',
          'Verificar papel/permissão no servidor a cada chamada da função administrativa (BFLA).'
        ], 'Esconder na interface ou ofuscar a URL não é controle de acesso; a checagem tem de ocorrer no servidor.'),
        mcq('q3', 'Um endpoint devolve o registro completo do usuário, incluindo o hash da senha, e o front-end exibe só o nome. Qual é o problema e a solução?', 'c', [
          'Nenhum problema, pois o usuário comum não vê os outros campos na tela do aplicativo.',
          'O problema é só de desempenho da rede; compacte a resposta e o risco desaparece.',
          'Exposição excessiva de dados: monte a resposta só com os campos necessários ao cliente.',
          'O problema é de CORS; configure uma origem permitida e o hash deixa de ser exposto no servidor.'
        ], 'Quem chama a API vê a resposta completa, não a tela. Devolva o mínimo necessário.'),
        fill('q4', 'Complete a allowlist usada para evitar mass assignment (a constante PERMITIDOS já foi definida acima).', 'PERMITIDOS = {"name"}\nu.update({k: v for k, v in payload.items() if k in ___})', ['PERMITIDOS', 'permitidos'], 'Só os campos listados em PERMITIDOS são copiados; role e outros campos sensíveis ficam de fora.'),
        mcq('q5', 'O que a limitação de taxa (rate limiting) ajuda a mitigar?', 'a', [
          'Força bruta, abuso e raspagem de dados, limitando as requisições por cliente num período.',
          'Vazamento de dados sensíveis em respostas de erro geradas pelo servidor da aplicação.',
          'Injeção SQL nas consultas ao banco de dados feitas pelos endpoints da API.',
          'Uso de HTTP em vez de HTTPS nas chamadas feitas pelos clientes da API.'
        ], 'Ao exceder o limite a API responde 429 Too Many Requests.'),
        mcq('q6', 'Qual é a configuração de CORS mais adequada para uma API que atende apenas o seu site?', 'a', [
          'Lista explícita com a origem do seu site, sem refletir origens arbitrárias recebidas.',
          'Aceitar qualquer origem recebida no cabeçalho Origin e devolvê-la na resposta ao navegador.',
          'Desativar a autenticação da API, já que o CORS passa a proteger todos os endpoints.',
          'Permitir todas as origens e todos os métodos para evitar erros no front-end em produção.'
        ], 'CORS é controle de navegador, com origens explícitas; não é um substituto da autenticação.'),
        mcq('q7', 'Por que manter um inventário de APIs e versões?', 'd', [
          'Para cobrar mais dos clientes que usam as versões mais novas e mais completas da API.',
          'Porque versões antigas têm desempenho melhor e por isso devem ser mantidas para sempre.',
          'Para gerar documentação automática que fique pública na internet para os atacantes lerem.',
          'Endpoints e versões esquecidos seguem acessíveis e sem correções, ampliando a superfície de ataque.'
        ], 'Desativar o que não se usa e saber o que existe é parte da defesa.'),
        fill('q8', 'Complete o código HTTP devolvido quando o cliente excede o limite de requisições.', 'HTTP/1.1 ___ Too Many Requests', ['429'], '429 Too Many Requests sinaliza que o cliente excedeu a taxa permitida.')
      ]
    },
    {
      id: 'owb-25-principios-design-seguro',
      title: 'Princípios de design seguro',
      goal: 'Aplicar princípios clássicos (menor privilégio, defesa em profundidade, fail secure...) a decisões de projeto.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Segurança começa no projeto',
            'Corrigir bugs um a um é necessário, mas insuficiente. Princípios de design seguro são regras de decisão que valem para qualquer tecnologia e evitam classes inteiras de falhas. Eles orientam perguntas como: quanto poder esta parte precisa ter? O que acontece se ela falhar? Quantas coisas expostas eu mantenho? A iniciativa "Secure by Design" defende que produtos já nasçam seguros, com o fabricante assumindo a responsabilidade, em vez de transferir ao usuário o trabalho de configurar segurança depois.'
          ),
          sl(
            'Menor privilégio e defesa em profundidade',
            'Menor privilégio: cada usuário, processo e conta recebe só as permissões necessárias à sua tarefa. Exemplo: o usuário de banco da aplicação pode fazer SELECT/INSERT nas suas tabelas, mas não DROP nem acessar outros bancos. Defesa em profundidade: várias camadas independentes protegem o mesmo ativo (validação de entrada, consultas parametrizadas, permissões do banco, WAF, logs), para que a falha de uma não derrube tudo. Nenhuma camada é perfeita, e a combinação reduz o risco.'
          ),
          sl(
            'Falhar de forma segura e segurança por padrão',
            'Falhar de forma segura (fail secure): diante de erro, o sistema assume o estado mais restritivo (se a checagem de permissão falha, nega). Segurança por padrão (secure by default): a configuração inicial já é a mais segura; contas novas começam sem privilégios, recursos opcionais e portas começam desligados, e quem quiser abrir algo o faz conscientemente. Se o padrão for inseguro, muita gente ficará exposta por nunca ter mudado a configuração.'
          ),
          sl(
            'Mediação completa e separação de deveres',
            'Mediação completa: toda tentativa de acessar um recurso é verificada, a cada vez. Não confie em uma checagem feita antes, em um botão escondido ou em um dado enviado pelo cliente; verifique a autorização em cada requisição, no servidor. Separação de deveres: ações críticas exigem mais de uma pessoa ou papel, de modo que uma só não consiga abusar. Exemplo: quem cadastra um pagamento não é quem o aprova; quem desenvolve não publica sozinho em produção.'
          ),
          sl(
            'Simplicidade, design aberto e superfície mínima',
            'Economia de mecanismo: quanto mais simples o projeto, menos lugares para bugs; prefira soluções simples e conhecidas. Design aberto: a segurança não deve depender do segredo do funcionamento, mas só das chaves; esconder a URL do painel administrativo ou criar um algoritmo "secreto" é segurança por obscuridade e NÃO é segurança (pode ser camada extra, nunca a única). Mínima superfície de ataque: cada endpoint, porta, função, conta e dependência é uma possível entrada; desative e remova o que não é necessário.'
          ),
          sl(
            'Privacidade por design',
            'Privacidade por design é aplicar os princípios acima também aos dados pessoais desde o início: coletar o mínimo, definir a finalidade, controlar o acesso, pensar em retenção e eliminação, proteger por padrão (por exemplo, perfis que começam privados). Em vez de "adicionar privacidade" depois de pronto, ela entra nos requisitos e na arquitetura. Isso reduz risco e custo e é coerente com a LGPD.'
          )
        ]
      },
      questions: [
        mcq('q1', 'A conta de banco usada pela aplicação web precisa apenas ler e inserir em duas tabelas. Qual é a configuração conforme o princípio do menor privilégio?', 'c', [
          'Usar a conta administradora do banco, para evitar erros de permissão futuros.',
          'Dar permissão total no banco de dados e confiar na validação da aplicação.',
          'Criar uma conta que só pode ler e inserir nessas duas tabelas.',
          'Compartilhar a mesma conta entre todos os sistemas da empresa para simplificar.'
        ], 'Se a aplicação for comprometida, o atacante herda só as permissões da conta; limitá-las limita o estrago.'),
        mcq('q2', 'O que é defesa em profundidade?', 'a', [
          'Usar várias camadas independentes de proteção, para que a falha de uma não exponha tudo.',
          'Colocar o servidor em uma sala com acesso físico restrito e controlado por crachá.',
          'Confiar em um único firewall bem configurado na borda da rede, sem camadas adicionais na prática.',
          'Escolher a ferramenta de segurança mais cara e instalá-la em todos os servidores da empresa.'
        ], 'Nenhuma camada é perfeita. Validação, consultas parametrizadas, permissões e monitoramento se complementam.'),
        mcq('q3', 'A equipe diz: "o painel de administração é seguro porque ninguém conhece a URL". Qual é a avaliação correta?', 'b', [
          'Correto, pois sem conhecer a URL o atacante não tem como chegar ao painel de administração do usuário.',
          'Segurança por obscuridade: pode ser camada extra, mas não substitui autenticação e autorização.',
          'Correto, desde que a URL seja trocada todo mês e comunicada apenas por canal seguro.',
          'Incorreto, porque painéis administrativos jamais devem existir em aplicações web.'
        ], 'URLs vazam (logs, histórico, ferramentas de varredura). A proteção real é autenticação forte e autorização, como no design aberto.'),
        fill('q4', 'Complete: no princípio "fail ___", diante de erro o sistema assume o estado mais restritivo (negar).', '# Principio: "fail ___" (na duvida, negar)', ['secure', 'segura', 'safe'], 'Fail secure: se a checagem de permissão falha, o resultado é negar o acesso.'),
        mcq('q5', 'O que é mediação completa?', 'd', [
          'Ter um mediador humano para resolver incidentes de segurança que forem identificados.',
          'Verificar a autorização apenas no login, pois ela vale pela sessão inteira do usuário.',
          'Confiar no front-end para esconder as funções que o usuário não pode usar no sistema.',
          'Verificar a autorização a cada acesso a um recurso, no servidor, sem confiar em checagens anteriores.'
        ], 'Cada requisição é verificada de novo; permissões podem mudar e o cliente pode forjar o que envia.'),
        mcq('q6', 'Qual exemplo ilustra a separação de deveres?', 'b', [
          'Um único administrador cadastra e aprova todos os pagamentos para agilizar o processo.',
          'Quem cadastra o pagamento é diferente de quem o aprova.',
          'Todos os usuários compartilham a mesma senha de administrador, facilitando o acesso.',
          'O desenvolvedor publica sozinho em produção, sem passar por nenhuma revisão do código.'
        ], 'Exigir mais de uma pessoa ou papel dificulta fraudes e erros em ações críticas.'),
        mcq('q7', 'A API tem endpoints de teste e uma documentação interativa ainda acessíveis em produção, que ninguém usa. Qual princípio recomenda removê-los?', 'c', [
          'Design aberto, porque tudo deve ser público para ser auditável pela comunidade.',
          'Separação de deveres, porque os testes precisam ser feitos por uma equipe diferente.',
          'Mínima superfície de ataque: o que não é necessário deve ser desativado e removido.',
          'Segurança por obscuridade, porque assim o atacante não encontra nenhum endpoint exposto.'
        ], 'Cada endpoint exposto é uma possível entrada. Remover o desnecessário reduz o risco.'),
        fill('q8', 'Complete: privacidade por ___ é pensar na proteção de dados pessoais desde os requisitos e a arquitetura.', '# Privacidade por ___ : desde o projeto, nao depois', ['design'], 'Privacy by design coloca minimização, finalidade e proteção desde o início do projeto.')
      ]
    },
    {
      id: 'owb-26-ssdlc-visao-geral',
      title: 'Segurança no ciclo de desenvolvimento (SSDLC)',
      goal: 'Integrar segurança a todas as etapas do desenvolvimento, com testes, automação e responsabilidade compartilhada.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é SSDLC e por que "shift left"',
            'SSDLC (Secure Software Development Life Cycle) é incluir atividades de segurança em todas as fases do ciclo de desenvolvimento: requisitos, projeto, codificação, testes, publicação e operação. "Shift left" significa mover essas atividades para a esquerda na linha do tempo, isto é, para o começo. Quanto mais cedo uma falha é encontrada, mais barato é corrigi-la: mudar um requisito ou desenho custa pouco; corrigir em produção, depois de um incidente, custa muito mais (retrabalho, indisponibilidade, danos à reputação e à privacidade dos usuários).'
          ),
          sl(
            'Requisitos de segurança e modelagem de ameaças',
            'Segurança entra como requisito, como qualquer funcionalidade: "senhas armazenadas com hash lento", "todo acesso a pedidos verifica o dono", "logs de login". Já a modelagem de ameaças (introdução) é pensar antes de construir, com quatro perguntas: o que estamos construindo? O que pode dar errado? O que faremos a respeito? Fizemos um bom trabalho? Um desenho simples do sistema (quem fala com quem, onde estão os dados, onde ficam as fronteiras de confiança) já revela riscos.'
          ),
          sl(
            'Codificação segura e revisão de código',
            'Padrões de codificação segura são regras acordadas pela equipe: usar consultas parametrizadas, codificar saída, nunca registrar segredos, usar bibliotecas aprovadas. Elas viram checklists e exemplos prontos. A revisão de código por outra pessoa (code review) é uma barreira eficaz: o revisor confere autorização, validação, tratamento de erros e uso de segredos. Pergunte sempre: "o que um usuário mal-intencionado faria aqui?".'
          ),
          sl(
            'Tipos de teste: SAST, DAST, SCA e testes manuais',
            'SAST (Static Application Security Testing) analisa o código-fonte sem executar; acha padrões de risco cedo, mas gera falsos positivos. DAST (Dynamic Application Security Testing) testa a aplicação em execução, de fora, enviando requisições, e encontra problemas de configuração e de runtime, sem enxergar o código. SCA analisa as dependências em busca de vulnerabilidades conhecidas. Testes manuais e revisões por especialistas (inclusive testes de intrusão autorizados) encontram falhas de lógica e de autorização que ferramentas costumam perder. Um programa maduro combina todos.'
          ),
          sl(
            'CI/CD, vulnerabilidades e ASVS',
            'Integre as verificações ao pipeline de CI/CD: a cada alteração rodam SAST, SCA, busca de segredos e testes de segurança, e achados graves podem barrar a publicação. Gestão de vulnerabilidades é registrar cada achado, priorizar por risco, atribuir responsável e prazo, corrigir e conferir. O OWASP ASVS (Application Security Verification Standard) é um padrão de requisitos verificáveis com três níveis, de verificação mais básica a mais rigorosa para aplicações de maior risco; serve como guia para definir requisitos e testar.'
          ),
          sl(
            'Segurança não é só ferramenta: é equipe',
            'Ferramentas ajudam, mas não substituem entendimento. Falhas de lógica, regras de negócio e decisões de projeto exigem pessoas treinadas. Por isso: treinamento contínuo de desenvolvedores, canal para reportar problemas sem medo de punição, e responsabilidade compartilhada, pois segurança é do time inteiro (produto, desenvolvimento, operações), não só de uma pessoa ou departamento. Um alerta ignorado ou um "depois a gente corrige" é uma decisão de risco que alguém aceitou.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa "shift left" em segurança?', 'd', [
          'Concentrar os testes de segurança só depois da publicação em produção, com usuários reais.',
          'Transferir a responsabilidade de segurança inteira para o time de infraestrutura da empresa.',
          'Desativar controles que atrasam o desenvolvimento para ganhar velocidade nas entregas.',
          'Antecipar a segurança para o início do ciclo (requisitos e projeto), onde corrigir é mais barato.'
        ], 'Falhas achadas em requisitos e projeto custam muito menos que as achadas em produção após um incidente.'),
        mcq('q2', 'O que o SAST faz?', 'a', [
          'Analisa o código-fonte sem executá-lo, buscando padrões inseguros que possam virar falhas.',
          'Testa a aplicação em execução, enviando requisições de fora como se fosse um usuário na prática.',
          'Verifica as dependências contra bases de vulnerabilidades já conhecidas publicamente.',
          'Substitui totalmente os testes manuais e a revisão de código feita por pessoas.'
        ], 'SAST é análise estática: encontra problemas cedo, mas pode gerar falsos positivos e não vê o comportamento em execução.'),
        mcq('q3', 'Qual é a característica do DAST?', 'c', [
          'Lê o código-fonte para achar funções inseguras antes mesmo de compilar o projeto inteiro.',
          'Lista as bibliotecas usadas pelo projeto e os respectivos mantenedores de cada uma em geral.',
          'Testa a aplicação em execução, de fora, simulando requisições, sem precisar do código.',
          'Gera automaticamente o modelo de ameaças do sistema a partir do diagrama de rede.'
        ], 'DAST observa a aplicação rodando: bom para configuração e comportamento, limitado quanto à causa no código.'),
        fill('q4', 'Complete: SAST analisa o código, DAST testa a app rodando e ___ analisa as dependências.', '# SAST = codigo; DAST = app rodando; ___ = dependencias', ['SCA', 'sca'], 'SCA (Software Composition Analysis) busca vulnerabilidades conhecidas nas dependências.'),
        mcq('q5', 'O que é o OWASP ASVS?', 'b', [
          'Uma ferramenta que escaneia automaticamente a aplicação em busca de falhas conhecidas.',
          'Um padrão de requisitos verificáveis de segurança de aplicações, com níveis de rigor.',
          'Um tipo de firewall de aplicação mantido pela OWASP para proteger sites em produção na prática.',
          'Uma lista de senhas comuns usadas por atacantes em ataques de dicionário.'
        ], 'O ASVS ajuda a definir requisitos e a testar; os níveis crescem em rigor conforme o risco da aplicação.'),
        mcq('q6', 'Qual é o objetivo da modelagem de ameaças?', 'd', [
          'Provar que a aplicação já está totalmente livre de vulnerabilidades antes da publicação.',
          'Substituir os testes de segurança depois que o sistema já estiver pronto e em uso.',
          'Escolher o fornecedor de nuvem com o menor custo para hospedar a aplicação.',
          'Pensar antes de construir no que pode dar errado e no que fazer a respeito.'
        ], 'É uma atividade de projeto: identificar riscos cedo, quando mudar o desenho é barato.'),
        mcq('q7', 'Como integrar segurança ao CI/CD de forma útil?', 'a', [
          'Rodar SAST, SCA e busca de segredos a cada alteração e barrar achados graves, sem dispensar revisão e treino.',
          'Rodar as verificações uma única vez por ano, pouco antes de uma auditoria externa.',
          'Desativar as verificações quando o pipeline ficar lento demais para a equipe.',
          'Rodar as ferramentas, mas ignorar os resultados para não atrasar as entregas.'
        ], 'Automação dá feedback rápido, mas pessoas decidem prioridades e tratam o que as ferramentas não enxergam.'),
        fill('q8', 'Complete o termo para mover atividades de segurança para o início do ciclo: shift ___.', '# "shift ___": seguranca mais cedo no ciclo', ['left'], 'Shift left: a linha do tempo vai da esquerda (requisitos) para a direita (produção).')
      ]
    },
    {
      id: 'owb-27-lgpd-desenvolvedores',
      title: 'Privacidade e LGPD para desenvolvedores web',
      goal: 'Aplicar os conceitos básicos da LGPD ao desenvolvimento: princípios, direitos do titular e privacidade por design.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Dados pessoais e dados sensíveis',
            'A LGPD (Lei nº 13.709/2018) protege dados pessoais: qualquer informação relacionada a uma pessoa natural identificada ou identificável (nome, CPF, e-mail, telefone, endereço, e também identificadores como IP quando permitem identificar alguém). Dados pessoais sensíveis têm proteção reforçada: origem racial ou étnica, convicção religiosa, opinião política, filiação sindical, saúde, vida sexual, dados genéticos e biométricos. Para o desenvolvedor, isso significa saber quais dados o sistema trata, onde estão e por quê. Aviso: este conteúdo é educativo e não substitui orientação jurídica.'
          ),
          sl(
            'Os princípios da lei',
            'Entre os princípios da LGPD que mais impactam o código: finalidade (propósitos legítimos, específicos e informados ao titular, sem uso posterior incompatível); adequação (o tratamento combina com a finalidade informada); necessidade (limitar ao mínimo indispensável: é a minimização); transparência (informações claras sobre o tratamento); segurança (medidas técnicas e administrativas contra acessos indevidos e vazamentos); e prevenção (adotar medidas para evitar danos). Eles se traduzem em decisões práticas: não criar campo "só por precaução", explicar para que serve o dado, proteger e descartar.'
          ),
          sl(
            'Bases legais e consentimento',
            'Todo tratamento precisa de uma base legal. Exemplos: consentimento do titular, cumprimento de obrigação legal, execução de contrato, legítimo interesse, entre outras. O consentimento é uma das bases, não a única, e para ser válido deve ser livre, informado e inequívoco, para finalidades determinadas, e pode ser revogado. Não adianta uma caixa pré-marcada ou termos genéricos. Quem define a base mais adequada a cada caso é a organização, com apoio jurídico; o desenvolvedor precisa registrar o que foi aceito, quando e para qual finalidade.'
          ),
          sl(
            'Direitos do titular e o que o sistema precisa suportar',
            'O titular pode, entre outros direitos, confirmar se há tratamento, acessar seus dados, corrigir dados incompletos ou incorretos, pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo, solicitar portabilidade, saber com quem os dados foram compartilhados e revogar o consentimento. O sistema precisa permitir localizar todos os dados de uma pessoa, exportá-los, corrigi-los e eliminá-los (inclusive em cópias, backups conforme a política, e nos terceiros), sem exigir mudança de arquitetura a cada pedido. Projete isso desde o início.'
          ),
          sl(
            'Cookies, terceiros, logs e backups',
            'Cookies e rastreadores não essenciais (analytics, publicidade) tratam dados pessoais e exigem informação clara e, em geral, escolha do usuário; os estritamente necessários (como a sessão) têm tratamento diferente. Ferramentas de terceiros (analytics, pixels, widgets, fontes e mapas externos) recebem dados dos seus visitantes: conheça o que enviam, avalie contratos e prefira alternativas que coletem menos. Logs e backups também contêm dados pessoais: minimize, restrinja acesso, defina prazo de retenção e inclua-os na política de eliminação.'
          ),
          sl(
            'Retenção, incidentes e privacy by design',
            'Retenção: defina por quanto tempo cada dado é guardado (o necessário à finalidade e às obrigações legais) e implemente a eliminação ou anonimização automática ao fim do prazo. Incidentes: se houver incidente de segurança que possa acarretar risco ou dano relevante aos titulares, o controlador deve comunicar à ANPD (Autoridade Nacional de Proteção de Dados) e aos titulares, em prazo razoável; ter um plano de resposta antes do problema ajuda. Privacy by design: coloque minimização, controle de acesso, finalidade e eliminação nos requisitos desde o início, em vez de remendar depois.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre dados pessoais e sensíveis na LGPD está correta?', 'a', [
          'Dado pessoal é o relativo a pessoa identificável; os sensíveis, como saúde e biometria, têm proteção reforçada.',
          'Só nome e CPF são dados pessoais; todo o resto pode ser usado livremente por qualquer sistema em produção.',
          'Dados sensíveis são apenas senhas e números de cartão de crédito dos usuários.',
          'Dados públicos na internet deixam de ser protegidos pela lei e podem ser reutilizados.'
        ], 'A definição é ampla e inclui identificadores indiretos. Saúde, biometria, religião e outros têm tratamento mais rigoroso.'),
        mcq('q2', 'O princípio da necessidade, aplicado a um formulário de cadastro, significa:', 'd', [
          'Pedir todos os dados possíveis no cadastro, pois podem ser úteis no futuro.',
          'Pedir dados só se o usuário concordar em receber propagandas dos parceiros da empresa.',
          'Guardar os dados por tempo indeterminado para fins estatísticos e de melhoria do serviço.',
          'Coletar apenas os dados indispensáveis para a finalidade informada ao titular.'
        ], 'Necessidade é minimização: cada campo precisa de justificativa ligada à finalidade.'),
        mcq('q3', 'Um app coleta e-mail para enviar o recibo e depois usa o endereço para vender dados a parceiros, sem avisar. Que princípio foi ferido?', 'b', [
          'Prevenção, pois o e-mail não foi criptografado em trânsito durante o cadastro do usuário.',
          'Finalidade e transparência: o uso é incompatível com o que foi informado ao titular.',
          'Segurança, pois o recibo deveria ter sido enviado por SMS em vez de e-mail.',
          'Nenhum princípio, pois o e-mail foi fornecido voluntariamente pelo próprio usuário em geral.'
        ], 'Os dados devem ser usados para os fins informados; mudar de propósito exige base legal e informação ao titular.'),
        fill('q4', 'Complete o número da lei geral de proteção de dados pessoais.', '# LGPD: Lei no ___, de 2018', ['13.709', '13709'], 'A LGPD é a Lei nº 13.709, de 2018.'),
        mcq('q5', 'O que o sistema precisa estar preparado para fazer em relação aos direitos do titular?', 'c', [
          'Atender qualquer pedido de terceiros sobre os dados do titular, sem verificar identidade.',
          'Apenas informar o endereço de e-mail do encarregado, sem acesso real aos dados.',
          'Localizar, exportar, corrigir e eliminar os dados de uma pessoa, inclusive onde foram compartilhados.',
          'Impedir que o titular veja os próprios dados, para evitar vazamentos por engano.'
        ], 'Direitos como acesso, correção, eliminação e portabilidade exigem que os dados sejam localizáveis e gerenciáveis.'),
        mcq('q6', 'Sobre consentimento, qual afirmação é correta?', 'd', [
          'É a única base legal permitida pela lei para tratar dados pessoais de qualquer pessoa por padrão.',
          'Uma caixa de seleção já marcada é suficiente, pois o usuário pode desmarcar depois.',
          'Uma vez dado, o consentimento não pode mais ser revogado pelo titular dos dados.',
          'É uma das bases legais; deve ser livre, informado, inequívoco e para finalidades determinadas.'
        ], 'Existem outras bases (contrato, obrigação legal, legítimo interesse...). O consentimento válido exige clareza e pode ser revogado.'),
        mcq('q7', 'Houve um vazamento que pode causar risco ou dano relevante aos titulares. O que a lei prevê, em visão geral?', 'c', [
          'Esconder o ocorrido para proteger a reputação da empresa perante clientes e parceiros.',
          'Comunicar somente quando algum titular reclamar formalmente do uso indevido dos dados.',
          'Comunicar à ANPD e aos titulares afetados, com um plano de resposta preparado antes.',
          'Apagar os logs do incidente para evitar novos acessos indevidos por terceiros.'
        ], 'A comunicação transparente e um plano de resposta fazem parte das obrigações e da boa prática.'),
        fill('q8', 'Complete o nome da autoridade: Autoridade Nacional de ___ de Dados (ANPD).', '# ANPD = Autoridade Nacional de ___ de Dados', ['Proteção', 'protecao', 'proteção'], 'A ANPD é a Autoridade Nacional de Proteção de Dados.')
      ]
    },
    {
      id: 'owb-28-front-end-navegador',
      title: 'Segurança no navegador e no front-end',
      goal: 'Compreender a política de mesma origem, CORS, armazenamento de tokens, postMessage, SRI e os limites do front-end.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Política de mesma origem (same-origin policy)',
            'Uma origem é a combinação de esquema (https), host (app.exemplo.local) e porta (443). A política de mesma origem é uma regra do navegador: o JavaScript de uma origem não pode ler as respostas nem os dados de outra origem. É por isso que o site malicioso aberto na outra aba não consegue ler o seu e-mail na sua sessão aberta. É uma proteção do navegador, que não impede o envio de requisições a outras origens (ela restringe a LEITURA da resposta); por isso existem também outras defesas, como o SameSite e tokens CSRF.'
          ),
          sl(
            'CORS: o que é e o que não é',
            'CORS (Cross-Origin Resource Sharing) é o mecanismo pelo qual o SERVIDOR informa ao navegador quais outras origens podem ler as suas respostas, por meio de cabeçalhos como Access-Control-Allow-Origin. Serve para relaxar a política de mesma origem de forma controlada (por exemplo, o seu front em app.exemplo.local falando com a API em api.exemplo.local). CORS NÃO é autenticação nem autorização: ele só instrui navegadores; um programa fora do navegador (curl, script) ignora o CORS. Liste origens explícitas e mantenha a autenticação na API.',
            `Access-Control-Allow-Origin: https://app.exemplo.local
Vary: Origin`
          ),
          sl(
            'Onde guardar o token: localStorage ou cookie HttpOnly',
            'localStorage e sessionStorage são acessíveis por qualquer JavaScript da página: se o site tiver uma falha de XSS (ou um script de terceiros comprometido), o atacante lê o token e o leva embora. Um cookie com HttpOnly não é legível por JavaScript; combinado com Secure e SameSite, reduz o roubo da sessão (mas XSS ainda pode fazer requisições em nome do usuário, e cookies exigem proteção contra CSRF). Por isso, é comum preferir cookies HttpOnly para a sessão e tratar XSS como falha crítica de qualquer jeito.',
            `Set-Cookie: sid=<valor>; HttpOnly; Secure; SameSite=Lax`
          ),
          sl(
            'postMessage e clickjacking',
            'window.postMessage permite que janelas e iframes troquem mensagens entre origens. Ao RECEBER, sempre confira event.origin antes de confiar nos dados (e valide o conteúdo); ao enviar, informe a origem de destino em vez de "*". Sobre clickjacking, lembre: use frame-ancestors (CSP) ou X-Frame-Options para impedir que seu site seja emoldurado por outros.',
            `window.addEventListener("message", (e) => {
  if (e.origin !== "https://app.exemplo.local") return;  // confere a origem
  // so entao processa e.data (validando o formato)
});`
          ),
          sl(
            'Recursos de terceiros, SRI e CSP',
            'Carregar scripts de uma CDN dá a quem controla aquele arquivo o poder de rodar código na sua página. Se possível, hospede localmente. Quando usar um recurso externo, aplique o Subresource Integrity (SRI): o atributo integrity guarda o hash do arquivo esperado e o navegador recusa executar se o conteúdo mudou. A CSP complementa, limitando de onde scripts podem vir, e funciona como camada extra contra XSS (não como substituto da codificação de saída).',
            `<script src="https://cdn.exemplo.local/lib.js"
        integrity="sha384-<hash-do-arquivo>"
        crossorigin="anonymous"></script>`
          ),
          sl(
            'Não confie no front-end; segredos e links',
            'Tudo que roda no navegador está sob controle do usuário: validação, regras de negócio e "botão escondido" no front-end são só conveniência. A validação e a autorização definitivas ficam no servidor. Pelo mesmo motivo, segredos no bundle JavaScript são públicos. Por fim, links que abrem nova aba (target="_blank") dão à página aberta acesso à janela de origem via window.opener; use rel="noopener" (e noreferrer, se não quiser enviar o referenciador).',
            `<a href="https://externo.exemplo.local" target="_blank"
   rel="noopener noreferrer">Link externo</a>`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma "origem" na política de mesma origem?', 'c', [
          'Apenas o nome de domínio do site, sem considerar esquema ou porta da URL.',
          'O endereço IP do servidor que entrega a página ao navegador do usuário.',
          'Esquema, host e porta de uma URL, combinados; mudar qualquer um deles cria outra origem.',
          'O país em que o servidor que entrega a página está hospedado fisicamente.'
        ], 'https://a.local:443 e http://a.local:80 são origens diferentes. O navegador isola o que scripts podem ler entre elas.'),
        mcq('q2', 'O que o CORS é, na prática?', 'b', [
          'Um mecanismo de autenticação que impede acessos não autorizados à API por qualquer cliente.',
          'Cabeçalhos com os quais o servidor diz ao navegador quais origens podem ler suas respostas; não substitui autenticação.',
          'Um protocolo de criptografia usado entre o navegador e o servidor para proteger o tráfego.',
          'Uma defesa que bloqueia as requisições feitas por ferramentas como curl ou scripts.'
        ], 'CORS só orienta navegadores. Clientes fora do navegador ignoram CORS, então a API continua precisando de autenticação.'),
        mcq('q3', 'Qual é a vantagem de um cookie HttpOnly sobre o localStorage para guardar o token de sessão?', 'a', [
          'O JavaScript da página não consegue ler o cookie, o que dificulta o roubo do token por XSS.',
          'O cookie é criptografado automaticamente com AES no disco do usuário pelo navegador no servidor.',
          'O cookie nunca é enviado ao servidor, o que evita qualquer interceptação do token.',
          'O cookie dispensa o uso de HTTPS na aplicação, pois o valor não trafega na rede.'
        ], 'XSS lê o localStorage com facilidade; HttpOnly bloqueia a leitura por script, embora ainda seja preciso combater XSS e CSRF.'),
        fill('q4', 'Complete a propriedade conferida ao receber uma mensagem com postMessage.', 'if (e.___ !== "https://app.exemplo.local") return;', ['origin'], 'event.origin informa a origem do remetente; confira antes de confiar na mensagem.'),
        mcq('q5', 'Para que serve o atributo integrity (SRI) em uma tag script externa?', 'd', [
          'Para compactar o arquivo antes do download e reduzir o tempo de carregamento da página do usuário.',
          'Para garantir que o arquivo seja baixado apenas por HTTP simples, sem uso de TLS.',
          'Para impedir que o script faça requisições a outros domínios depois de carregado.',
          'Para o navegador recusar executar o arquivo se o conteúdo não bater com o hash esperado.'
        ], 'Se a CDN for comprometida e o arquivo mudar, o hash não confere e o navegador bloqueia a execução.'),
        mcq('q6', 'Qual é o motivo de usar rel="noopener" em links com target="_blank"?', 'a', [
          'Impedir que a página aberta acesse a janela de origem por meio de window.opener.',
          'Impedir que o link abra a página de destino em HTTPS, mantendo o HTTP simples.',
          'Acelerar o carregamento da página aberta em nova aba, ao reaproveitar o processo.',
          'Bloquear cookies da página de destino, evitando o rastreamento do visitante pelo site.'
        ], 'Sem isso (em navegadores antigos), a página aberta poderia manipular a janela de origem, por exemplo redirecionando-a.'),
        mcq('q7', 'Por que a validação feita só no front-end não é suficiente?', 'b', [
          'Porque o JavaScript não consegue validar formatos de e-mail ou de número corretamente.',
          'O usuário controla o navegador e pode contorná-la; o servidor precisa revalidar e autorizar.',
          'Porque navegadores modernos desativam o JavaScript em formulários que tenham senha.',
          'Porque a validação no front-end deixa o site mais lento para quem usa celulares.'
        ], 'Qualquer cliente HTTP pode enviar dados sem passar pelo seu formulário. A palavra final é do servidor.'),
        fill('q8', 'Complete o valor do atributo rel para links externos com target="_blank".', '<a target="_blank" rel="___ noreferrer">Link</a>', ['noopener'], 'noopener corta a ligação window.opener; noreferrer omite o referenciador.')
      ]
    },
    {
      id: 'owb-29-frameworks-boas-praticas',
      title: 'Frameworks e boas práticas por linguagem',
      goal: 'Saber o que os frameworks já protegem, onde estão as armadilhas ao sair do caminho seguro e como mantê-los em dia.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que os frameworks fazem por você',
            'Frameworks modernos trazem proteções prontas: templates com auto-escape de saída (reduz XSS), ORMs que geram consultas parametrizadas (reduz SQL injection), proteção CSRF, utilitários de hash de senha, gerenciamento de sessão e middlewares de cabeçalhos de segurança (Helmet no Express, SecurityMiddleware no Django). Usar o caminho padrão do framework costuma ser mais seguro que reinventar. Mas atenção: a proteção só vale enquanto você usa o mecanismo como previsto.'
          ),
          sl(
            'Armadilhas: sair do caminho seguro',
            'As falhas voltam quando o desenvolvedor contorna a proteção: SQL cru com concatenação de texto em vez de parâmetros; marcar saída como "confiável" (o filtro |safe do Django e do Jinja2, dangerouslySetInnerHTML do React, o v-html do Vue); desabilitar a proteção CSRF para "fazer funcionar"; deixar o modo de depuração ligado em produção; e aceitar objetos inteiros do cliente (mass assignment). O nome ("dangerously...") é um aviso: use somente com conteúdo que você mesmo controla ou sanitizado por biblioteca específica.',
            `# Django/Jinja2: desativa o escape (so com HTML confiavel)
{{ comentario|safe }}

// React: injeta HTML cru
<div dangerouslySetInnerHTML={{ __html: texto }} />`
          ),
          sl(
            'Node/Express e Python (Django/Flask)',
            'Express: use o middleware Helmet para definir cabeçalhos de segurança, valide entradas com uma biblioteca de esquema, use consultas parametrizadas do driver/ORM e limite a taxa. Django: tem ORM parametrizado, auto-escape nos templates, CsrfViewMiddleware, SecurityMiddleware e hashers de senha prontos; mantenha DEBUG=False e SECRET_KEY fora do código. Flask: Jinja2 com auto-escape (para templates HTML), extensões para CSRF e sessões assinadas com chave secreta forte, fora do código.',
            `// Express
const helmet = require("helmet");
app.use(helmet());

# Django (settings.py de producao)
DEBUG = False
SECRET_KEY = os.environ["SECRET_KEY"]`
          ),
          sl(
            'Java/Spring, ASP.NET Core e PHP/Laravel',
            'Spring Security cuida de autenticação, autorização, CSRF e cabeçalhos; use JPA/consultas com parâmetros nomeados e não concatene JPQL/SQL. ASP.NET Core: Identity para contas e senhas, antiforgery tokens contra CSRF, Entity Framework com parâmetros e Razor com codificação automática (Html.Raw é a armadilha). Laravel: Eloquent/Query Builder com bindings, Blade com {{ }} escapando (a sintaxe {!! !!} não escapa), middleware CSRF e Hash::make para senhas. O padrão se repete: ORM + auto-escape + CSRF + hash de senha; o perigo está nas saídas "cruas".',
            `// Blade (Laravel)
{{ $texto }}      // escapa (seguro)
{!! $texto !!}    // NAO escapa (cuidado)`
          ),
          sl(
            'Manter atualizado e ler a documentação',
            'Frameworks também têm vulnerabilidades, e as correções chegam em novas versões. Acompanhe os avisos de segurança do projeto, atualize com frequência e teste (use SCA, visto antes). Leia o guia de segurança da documentação oficial do framework que você usa: ele lista os padrões, o que está ligado, o que precisa ser configurado e o que é perigoso. Saber o que o framework NÃO faz por você é tão importante quanto saber o que ele faz.'
          ),
          sl(
            'Não confie só no padrão',
            'O framework não conhece as suas regras de negócio: ele não decide quem pode ver o pedido de quem (controle de acesso), não sabe quais dados são sensíveis nem quais campos o cliente pode definir. Autorização por objeto, validação de entrada com regras do domínio, gestão de segredos, logging e tratamento de erros seguem sendo responsabilidade da aplicação. Os padrões do framework são uma base excelente, não um certificado de segurança.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o auto-escape dos templates faz e onde ele pode ser anulado?', 'b', [
          'Cifra o HTML gerado; é anulado ao usar HTTPS.',
          'Converte caracteres especiais da saída em texto inofensivo, reduzindo XSS; é anulado ao marcar a saída como segura (|safe, dangerouslySetInnerHTML).',
          'Remove todo JavaScript do banco de dados; é anulado ao reiniciar o servidor.',
          'Valida as entradas do formulário; é anulado ao usar cookies de sessão.'
        ], 'A proteção vale para a saída tratada como texto. Marcar como "seguro" devolve a responsabilidade ao desenvolvedor.'),
        mcq('q2', 'Um desenvolvedor usa o ORM, mas em uma consulta específica monta o SQL com f-string e o valor do usuário. Qual é o risco?', 'c', [
          'Nenhum, pois o uso do ORM protege toda a aplicação automaticamente em qualquer consulta.',
          'Apenas queda de desempenho, que se resolve criando índices nas colunas do banco na prática.',
          'SQL injection: SQL cru concatenado sai do mecanismo parametrizado; use parâmetros.',
          'Falha de CORS, pois a consulta cruza origens diferentes dentro da aplicação.'
        ], 'A proteção do ORM está nas consultas parametrizadas que ele gera; SQL cru com texto concatenado não tem essa proteção.'),
        mcq('q3', 'O formulário "não funciona" por causa do erro de CSRF. Qual é a atitude correta?', 'd', [
          'Desabilitar a proteção CSRF no projeto inteiro para resolver o problema depressa.',
          'Isentar só as rotas de POST do sistema de autenticação, sem mais cuidados com elas na prática.',
          'Trocar o método do formulário de POST para GET, para o erro deixar de aparecer.',
          'Incluir o token CSRF previsto pelo framework no formulário e também na requisição enviada.'
        ], 'O erro indica que o token não está sendo enviado. Corrija o uso do mecanismo em vez de removê-lo.'),
        fill('q4', 'Complete o middleware que define cabeçalhos de segurança no Express.', 'const helmet = require("helmet");\napp.use(___());', ['helmet'], 'Helmet é o middleware do Express que configura cabeçalhos de segurança HTTP.'),
        mcq('q5', 'Qual configuração é perigosa em produção?', 'a', [
          'Manter DEBUG=True ligado, o que expõe detalhes de erros e do código-fonte.',
          'Manter o framework atualizado com as correções de segurança publicadas pelos mantenedores.',
          'Guardar a SECRET_KEY em variável de ambiente, fora do código-fonte do projeto.',
          'Usar o middleware de cabeçalhos de segurança do framework em todas as respostas.'
        ], 'Debug ligado vaza código, variáveis e configurações. Em produção deve ficar desligado.'),
        mcq('q6', 'Por que manter o framework atualizado?', 'b', [
          'Porque versões novas aumentam automaticamente o número de usuários da aplicação.',
          'Porque correções de vulnerabilidades do próprio framework chegam em novas versões.',
          'Porque as versões antigas deixam de funcionar alguns meses depois do lançamento.',
          'Porque a atualização dispensa testes e a análise de dependências do projeto.'
        ], 'Frameworks também têm falhas; atualizar (com testes) é parte do gerenciamento de componentes.'),
        mcq('q7', 'Qual afirmação descreve melhor o limite das proteções padrão de um framework?', 'd', [
          'Elas cobrem todas as vulnerabilidades da aplicação, inclusive as regras de negócio.',
          'Elas decidem sozinhas quem pode acessar cada objeto no sistema, sem configuração.',
          'Elas tornam a leitura da documentação de segurança desnecessária para a equipe.',
          'Cobrem falhas comuns, mas autorização por objeto, validação de domínio e segredos seguem com a aplicação.'
        ], 'O framework não conhece o seu negócio. Controle de acesso e regras específicas precisam ser implementados e testados por você.'),
        fill('q8', 'Complete o filtro do Django/Jinja2 que desativa o escape automático (use só com HTML confiável).', '{{ comentario|___ }}', ['safe'], 'O filtro safe marca o conteúdo como confiável e desliga o escape: com entrada do usuário, abre caminho para XSS.')
      ]
    },
    {
      id: 'owb-30-auditando-app-pequeno',
      title: 'Revisão integrada: auditando uma aplicação pequena',
      goal: 'Reunir o aprendido em um checklist, montar um laboratório local isolado e registrar achados em um relatório simples.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Checklist do iniciante',
            'Para revisar uma aplicação pequena, percorra as áreas do módulo: ENTRADA (validação, consultas parametrizadas, saída codificada), AUTENTICAÇÃO (senhas com hash lento, bloqueio/limite de tentativas), SESSÃO (cookies HttpOnly, Secure e SameSite, expiração), AUTORIZAÇÃO (checagem por objeto e por função no servidor), CONFIGURAÇÃO (debug desligado, padrões seguros), CABEÇALHOS e HTTPS, DEPENDÊNCIAS (SCA, lockfile), SEGREDOS (fora do código), LOGS (eventos certos, sem dados sensíveis), ERROS (mensagens genéricas) e PRIVACIDADE (minimização, retenção, terceiros). Cada área vira perguntas de sim/não que você responde examinando código e comportamento.'
          ),
          sl(
            'Laboratório local: OWASP Juice Shop',
            'Para praticar com segurança e legalidade, use um laboratório SEU: o OWASP Juice Shop é uma aplicação web vulnerável de propósito, feita para treino. Suba-a na sua máquina isolada, ligada apenas ao endereço local (127.0.0.1), para que ninguém na sua rede ou na internet acesse. Com Docker: a porta é publicada somente no loopback, e a aplicação fica em http://127.0.0.1:3000. Se preferir, crie um app fictício simples (poucas rotas, SQLite em memória, dados inventados) e use o mesmo cuidado. Para terminar, encerre o container.',
            `docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop
# abrir no navegador: http://127.0.0.1:3000
# encerrar: Ctrl+C  (a opcao --rm remove o container)`
          ),
          sl(
            'Ética, autorização e escopo',
            'Só teste o que é seu ou o que você tem autorização ESCRITA para testar, com escopo definido (o que pode e o que não pode ser testado). Acessar sistemas sem permissão é crime (Lei 12.737/2012) e pode violar o Marco Civil da Internet e a LGPD, mesmo "por curiosidade". Se encontrar uma falha em sistema de terceiros sem querer, pare, não acesse nem guarde dados, e relate ao responsável pelo canal oficial (divulgação responsável). Use sempre dados fictícios nos laboratórios.'
          ),
          sl(
            'Registrando achados: o relatório simples',
            'Um achado bem escrito permite que outra pessoa entenda, reproduza e corrija. Campos: título curto; onde (rota, arquivo, componente); impacto (o que um atacante poderia fazer, em linguagem clara); como reproduzir NO LABORATÓRIO (passos mínimos, com dados fictícios); como corrigir (a correção concreta e a defesa em camadas); e prioridade (crítica, alta, média, baixa, com justificativa). Evite incluir dados reais, segredos ou instruções que sirvam contra sistemas de terceiros.',
            `Titulo: Rota /pedidos/<id> nao verifica o dono (BOLA)
Onde: GET /pedidos/<id> (lab local)
Impacto: um usuario le pedidos de outros (dados ficticios).
Reproduzir (LAB): logar como usuario A e trocar o id na URL.
Corrigir: checar pedido.user_id == usuario_atual no servidor.
Prioridade: Alta (exposicao de dados pessoais).`
          ),
          sl(
            'A ordem de correção por risco',
            'Nem tudo se corrige ao mesmo tempo; priorize por risco = impacto x probabilidade. Em geral, primeiro o que permite controle do sistema ou vazamento de dados em larga escala (injeções, autenticação e controle de acesso quebrados, segredos expostos, componentes críticos vulneráveis), depois falhas de impacto moderado (configuração, sessões, erros verbosos) e, por último, endurecimentos de menor impacto (alguns cabeçalhos). Segredo vazado se resolve primeiro revogando. Depois de corrigir, teste de novo e registre.'
          ),
          sl(
            'Próximos passos',
            'Depois do módulo iniciante, avance para o intermediário: modelagem de ameaças (STRIDE e fluxos de dados), uso do OWASP ASVS como guia de requisitos, autenticação e autorização modernas (OAuth 2.0 e OpenID Connect, JWT com cuidado), testes dinâmicos com o OWASP ZAP em ambiente de lab, revisão de código segura e integração de segurança no CI/CD. Continue praticando em laboratórios próprios (Juice Shop, DVWA, WebGoat), leia a documentação da OWASP e participe de comunidades e programas de divulgação responsável, sempre dentro da lei e do escopo autorizado.'
          )
        ]
      },
      questions: [
        mcq('q1', 'A auditoria encontrou: SQL injection em uma rota pública, cabeçalho Referrer-Policy ausente e uma página de erro verbosa. Qual é a ordem de correção mais adequada?', 'd', [
          'Corrigir primeiro o Referrer-Policy, por ser o ajuste mais rápido de fazer no servidor.',
          'Corrigir a página de erro verbosa primeiro, pois é a mais visível ao usuário final.',
          'Seguir a ordem em que foram encontrados, sem nenhuma priorização por risco.',
          'Corrigir primeiro a SQL injection (alto impacto), depois o erro verboso e por fim o cabeçalho.'
        ], 'A prioridade segue o risco (impacto x probabilidade). Injeção pode comprometer todo o banco; o cabeçalho é um endurecimento de menor impacto.'),
        mcq('q2', 'Onde é apropriado praticar testes de segurança?', 'b', [
          'Em qualquer site público que pareça mal protegido, desde que nenhum dano seja causado em produção.',
          'Em aplicações suas, em laboratório local ou com autorização escrita e escopo definido.',
          'No site do concorrente, desde que nenhum dado seja copiado durante os testes.',
          'Em redes públicas, pois não há um dono específico a quem pedir permissão.'
        ], 'Sem autorização, acessar sistemas é crime (Lei 12.737/2012). Laboratórios próprios existem para praticar sem riscos.'),
        mcq('q3', 'Qual item NÃO deveria constar de um relatório de achado bem escrito?', 'a', [
          'Dados pessoais reais e segredos que tenham sido obtidos durante os testes.',
          'O local da falha, como a rota, o arquivo ou o componente afetado pelo problema.',
          'A correção recomendada, descrita de forma concreta para a equipe aplicar.',
          'A prioridade, acompanhada de uma justificativa baseada em impacto e probabilidade.'
        ], 'Use dados fictícios e nunca inclua segredos ou dados reais no relatório.'),
        fill('q4', 'Complete o endereço para publicar a porta do Juice Shop somente na sua máquina.', 'docker run -p ___:3000:3000 bkimminich/juice-shop', ['127.0.0.1'], 'Publicar a porta em 127.0.0.1 (loopback) mantém o laboratório inacessível à rede e à internet.'),
        mcq('q5', 'O que é o OWASP Juice Shop?', 'c', [
          'Um firewall de aplicação web usado para proteger sites em ambiente de produção.',
          'Um escâner automático que testa sites de terceiros em busca de falhas conhecidas.',
          'Aplicação vulnerável de propósito, usada para treino em laboratório próprio e isolado.',
          'Um repositório de senhas vazadas aberto para consulta por pesquisadores de segurança.'
        ], 'É uma app de treino da OWASP: deve rodar localmente, isolada, e nunca exposta à internet.'),
        mcq('q6', 'Durante um estudo, você nota por acaso que um site de terceiros expõe dados de clientes. O que fazer?', 'c', [
          'Baixar os dados como prova e divulgar nas redes para pressionar a empresa a agir.',
          'Explorar a falha um pouco mais para medir o tamanho real do problema encontrado em geral.',
          'Parar, não acessar nem guardar dados e relatar ao responsável por canal oficial.',
          'Ignorar e esquecer o assunto por completo, pois o sistema não pertence a você.'
        ], 'Continuar a acessar pode ser crime e agravar o dano. Parar e comunicar com responsabilidade é o caminho.'),
        mcq('q7', 'Quais são próximos passos naturais após o módulo iniciante?', 'a', [
          'Modelagem de ameaças, OWASP ASVS, OAuth/OpenID Connect e testes dinâmicos (como o ZAP) em laboratório.',
          'Testar sistemas de terceiros para ganhar experiência com ambientes reais de produção por padrão.',
          'Parar de estudar, pois o checklist do iniciante já cobre todos os riscos conhecidos.',
          'Desativar todos os controles de segurança de um app próprio para observar o efeito.'
        ], 'O intermediário aprofunda o projeto seguro e as ferramentas, sempre em ambiente próprio ou autorizado.'),
        fill('q8', 'Complete: como reproduzir NO ___ (ambiente local controlado).', '# Relatorio - campo "Como reproduzir NO ___"', ['laboratório', 'laboratorio', 'lab'], 'Reproduza apenas em laboratório próprio, com dados fictícios.')
      ]
    },
    {
      id: 'owb-34-estudo-laboratorios-carreira',
      title: 'Como continuar estudando: laboratórios, CTFs e carreira',
      goal: 'Saber onde praticar de forma legal e segura, como construir hábitos de estudo, quais caminhos de carreira existem em AppSec e como agir com ética e legalidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Primeiro a regra: só alvos autorizados',
            'Antes de qualquer prática: só se testa o que é seu ou o que você tem autorização expressa para testar. No Brasil, a Lei 12.737/2012 tipificou a invasão de dispositivo informático; é um panorama educacional, não aconselhamento jurídico. Boa intenção não vira permissão. Por isso o estudo prático acontece em laboratórios próprios, em plataformas feitas para treino e em programas com regras e escopo definidos.'
          ),
          sl(
            'Laboratórios locais e isolados',
            'Aplicações vulneráveis DE PROPÓSITO permitem praticar com segurança: OWASP Juice Shop (loja moderna com muitos desafios), WebGoat (aprendizado guiado em lições) e DVWA (aplicação clássica com níveis de dificuldade). Rode-as na sua máquina, em container ou máquina virtual, ouvindo só em 127.0.0.1, sem expor à internet e sem dados reais; tire snapshot antes de experimentar. Elas contêm falhas intencionais e não devem ficar acessíveis a terceiros.',
            `# exemplo conceitual: app de treino só no loopback
docker run --rm -p 127.0.0.1:3000:3000 <imagem-do-juice-shop>`
          ),
          sl(
            'Plataformas online e CTFs',
            'Existem plataformas legais de treino: PortSwigger Web Security Academy (material e laboratórios sobre falhas web), TryHackMe e Hack The Box (laboratórios e desafios hospedados por eles). Use apenas os alvos que a própria plataforma fornece e siga as regras de uso. CTFs (Capture The Flag) são competições com desafios em que se resolve um problema para obter uma "bandeira" (texto de prova): ótimos para treinar raciocínio em ambiente autorizado. Confira as condições de cada plataforma no site oficial.'
          ),
          sl(
            'Estudar lendo: Cheat Sheets, relatos e projetos',
            'Leia as Cheat Sheets da OWASP: guias curtos de COMO implementar cada defesa. Leia avisos de segurança (security advisories) de bibliotecas e relatórios públicos de falhas já corrigidas: eles mostram como o problema foi entendido e consertado. Construa projetos próprios com código seguro (um cadastro com os fluxos do owb-32, por exemplo) e contribua com projetos abertos, começando por documentação, testes e correções pequenas. Ensinar e escrever sobre o que aprendeu consolida o conhecimento.'
          ),
          sl(
            'Caminhos de carreira em AppSec',
            'Há vários caminhos. Desenvolvedor com foco em segurança: escreve e revisa código com atenção às defesas. Engenheiro de segurança de aplicações: cria padrões, ferramentas e revisões para várias equipes. Pentester: realiza testes de invasão AUTORIZADOS e escreve relatórios. DevSecOps: integra verificações de segurança ao pipeline de entrega. Analista de vulnerabilidades: encontra, prioriza e acompanha a correção de falhas. Certificações existem em vários níveis e podem ajudar a estruturar o estudo, mas não substituem prática; pesquise o conteúdo e as condições no site de cada entidade antes de decidir.'
          ),
          sl(
            'Hábitos, ética e limites',
            'Hábitos que funcionam: estudar um tema por vez, de forma incremental; praticar em laboratório; escrever um relato do que aprendeu e de como corrigir; praticar revisão de código lendo código de terceiros de projetos abertos. Ética: só alvos autorizados. Em programas de BUG BOUNTY, a organização define escopo e regras: teste só o que está no escopo, não acesse dados de pessoas além do necessário e reporte de forma privada. Cuide também da saúde mental: a área é vasta e ninguém domina tudo; faça pausas e não se compare com os outros.'
          ),
          sl(
            'Plano de estudos de 3 meses (conceitual)',
            'Um plano possível: MÊS 1 — fundamentos: revisar o curso, montar o laboratório local e praticar injeção, XSS e controle de acesso no Juice Shop ou WebGoat. MÊS 2 — profundidade: seguir uma trilha da PortSwigger Academy, ler Cheat Sheets e fazer revisão de código de um projeto pequeno. MÊS 3 — consolidação: construir um projeto próprio com os fluxos seguros, escrever um relato público do que aprendeu (sem dados reais) e participar de um CTF. Ajuste ao seu ritmo e revise a cada mês.',
            `Mês 1  fundamentos  -> laboratório local + falhas clássicas
Mês 2  profundidade -> trilha da Academy + Cheat Sheets + revisão de código
Mês 3  consolidação -> projeto próprio + relato + CTF`
          )
        ]
      },
      questions: [
        mcq('q1', 'Onde é adequado praticar técnicas de segurança como iniciante?', 'b', [
          'Em qualquer site público, desde que você não altere nem apague nada',
          'Apenas em aplicações vulneráveis de propósito rodando na sua máquina, isoladas da rede',
          'Em sistemas de colegas e de empresas pequenas, que costumam ter menos proteção e menos riscos',
          'No sistema da empresa onde você trabalha, mesmo sem avisar a equipe responsável'
        ], 'Laboratórios próprios, isolados e com dados fictícios são o lugar certo. Testar sistemas de terceiros sem autorização não é legítimo.'),
        mcq('q2', 'Um desenvolvedor quer aprender COMO implementar uma defesa específica, como o armazenamento de senhas. Qual fonte é a mais direta?', 'd', [
          'O relatório de um scan automatizado feito em um site de terceiros qualquer',
          'A lista do Top 10, que traz código pronto para cada categoria listada',
          'Um fórum anônimo com receitas de ataque sem contexto de correção',
          'As Cheat Sheets da OWASP, guias curtos de implementação de cada defesa'
        ], 'Cheat Sheets explicam o COMO de cada defesa. O Top 10 é conscientização e scans de terceiros não são autorizados.'),
        mcq('q3', 'Você participa de um programa de bug bounty. Qual conduta é correta?', 'c', [
          'Testar também sistemas vizinhos que pareçam interessantes, mesmo fora do escopo, se parecerem vulneráveis',
          'Publicar a falha nas redes sociais para pressionar a correção mais rápido',
          'Testar só o que está no escopo, seguir as regras e reportar de forma privada',
          'Baixar o máximo de dados possível para provar o impacto da falha'
        ], 'O escopo e as regras definem o que é autorizado. Reporte em privado e evite acessar ou copiar dados de pessoas.'),
        fill('q4', 'Complete a sigla das competições de segurança em que se resolvem desafios para obter uma bandeira: Capture The Flag.', '___ = Capture The Flag', ['ctf'], 'CTFs são competições de desafios, boas para treino em ambiente autorizado.'),
        mcq('q5', 'Qual plano de 3 meses segue uma progressão sensata?', 'a', [
          'Laboratório e fundamentos, depois trilhas, depois projeto próprio e CTF',
          'Participar de um CTF no primeiro dia e só estudar conceitos no último mês',
          'Estudar todos os temas ao mesmo tempo, sem praticar, para não perder o ritmo',
          'Testar sistemas reais no primeiro mês para ganhar experiência rapidamente'
        ], 'Progressão: base e prática em laboratório, aprofundamento e, por fim, consolidação com projeto e relato.'),
        mcq('q6', 'Qual função integra verificações de segurança (SAST, SCA, busca de segredos) ao pipeline de entrega?', 'b', [
          'Pentester, que realiza testes de invasão autorizados e escreve relatórios',
          'DevSecOps',
          'Analista de vulnerabilidades, que apenas cadastra ocorrências em planilhas sem acompanhar correções',
          'Administrador de banco de dados, responsável principal por revisar o código das aplicações'
        ], 'DevSecOps integra segurança à automação de entrega. O pentester testa com autorização e o analista prioriza e acompanha falhas.'),
        mcq('q7', 'Qual hábito consolida melhor o aprendizado em segurança?', 'd', [
          'Decorar listas de vulnerabilidades sem praticar em nenhum laboratório',
          'Acumular certificações antes de escrever qualquer código ou projeto próprio',
          'Assistir a vídeos em ritmo acelerado sem fazer anotações e pular os exercícios',
          'Estudar um tema por vez, praticar em laboratório e escrever um relato'
        ], 'Estudo incremental, prática e escrita do que se aprendeu (incluindo a correção) fixam o conhecimento.'),
        fill('q8', 'Complete o número da lei brasileira de 2012 que tipificou a invasão de dispositivo informático (visão geral, não aconselhamento jurídico).', 'Lei ___/2012 — invasão de dispositivo informático', ['12.737', '12737', '12.737/2012'], 'A Lei 12.737/2012 inseriu no Código Penal a invasão de dispositivo informático. Por isso só se testa o que é autorizado.')
      ]
    },
  ]
};
