// Módulo "Intermediário" do curso de Segurança de Aplicações Web (OWASP) — 18 lições, 8 questões
// cada (3 múltipla escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a
// validação de boot. Mesmo padrão de ./01-*.js dos outros cursos: helpers locais mcq/fill/sl.
// Enquadramento DEFENSIVO e EDUCACIONAL: cada vulnerabilidade é explicada junto da prevenção e da
// detecção; demonstrações só em laboratório local próprio (app fictício, SQLite em memória, dados
// inventados). Nenhum exploit pronto, nenhuma técnica de evasão, nenhum alvo de terceiros: o curso
// reforça autorização/escopo (Lei 12.737/2012, Marco Civil, LGPD) e divulgação responsável.
// Segurança e privacidade (LGPD): nenhum dado pessoal real nos exemplos; segredos e chaves são
// <placeholders>; domínios usam .test/.example; números de versão e estatísticas não são afirmados.
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
  id: 'intermediario-owasp',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Modelagem de ameaças, ASVS, MFA, OAuth/OIDC, JWT, sessões, controle de acesso, injeções, XSS/CSP, CSRF/CORS, parsers, SSRF, uploads, lógica de negócio e criptografia',
  accent: '#dc2626',
  lessons: [
    {
      id: 'owi-01-threat-modeling',
      title: 'Modelagem de ameaças',
      goal: 'Pensar como defensor desde o desenho: mapear o sistema, listar o que pode dar errado e decidir o que fazer.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que modelar ameaças cedo',
            'Modelagem de ameaças é uma conversa estruturada, feita em equipe, sobre como o sistema pode ser abusado, ANTES de o código existir (ou ao menos antes de ele endurecer). Falhas de projeto — como uma API que confia no navegador para decidir o preço — não são bugs de uma linha: corrigi-las depois custa redesenho, migração e retrabalho. Já uma pergunta feita no quadro branco custa minutos. O resultado não é um documento bonito, e sim decisões registradas: o que vamos mitigar, o que aceitamos e quem cuida de cada item.'
          ),
          sl(
            'As 4 perguntas',
            'Um roteiro simples e reconhecido (popularizado no Manifesto de Modelagem de Ameaças) resume tudo em quatro perguntas, nesta ordem: (1) O que estamos construindo? — desenhe o sistema. (2) O que pode dar errado? — liste ameaças, por exemplo com STRIDE. (3) O que vamos fazer a respeito? — mitigar, eliminar, transferir ou aceitar cada risco. (4) Fizemos um bom trabalho? — revise: as mitigações foram implementadas e testadas? O modelo ficou desatualizado após mudanças? A quarta pergunta fecha o ciclo e leva a revisitar a primeira quando o sistema muda.',
            '1. O que estamos construindo?      -> diagrama (DFD)\n2. O que pode dar errado?           -> STRIDE, casos de abuso\n3. O que vamos fazer a respeito?   -> mitigar / eliminar / transferir / aceitar\n4. Fizemos um bom trabalho?        -> revisar, testar, atualizar'
          ),
          sl(
            'DFD e fronteiras de confiança',
            'O Diagrama de Fluxo de Dados (DFD) usa poucos elementos: entidades externas (usuário, serviço de terceiros), processos (a API, o worker), repositórios de dados (banco, cache, fila) e fluxos (setas com o dado que trafega). Sobre ele você traça fronteiras de confiança (trust boundaries): linhas onde muda o nível de confiança, como internet → servidor, servidor → banco, seu sistema → provedor externo. Regra de ouro: todo fluxo que CRUZA uma fronteira é candidato a ameaças, porque o dado passa de um lado menos confiável para um mais confiável (ou vice-versa) e precisa ser validado, autenticado e autorizado.',
            'LOJA FICTÍCIA (DFD em texto)\n\n[Cliente/navegador] --HTTPS--> |fronteira 1| (API da loja)\n(API da loja) --SQL--> |fronteira 2| [(Banco de pedidos)]\n(API da loja) --HTTPS--> |fronteira 3| [Gateway de pagamento]'
          ),
          sl(
            'STRIDE: seis categorias de ameaça',
            'STRIDE é um mnemônico para classificar o que pode dar errado, cada letra violando uma propriedade de segurança. Spoofing (falsificação de identidade, viola autenticidade): usar o token de outro usuário. Tampering (adulteração, viola integridade): alterar o preço no corpo da requisição. Repudiation (repúdio, viola não repúdio): usuário nega ter feito a compra e não há log confiável. Information disclosure (vazamento, viola confidencialidade): stack trace ou resposta de API devolvendo dados demais. Denial of service (negação de serviço, viola disponibilidade): endpoint caro sem limite de taxa. Elevation of privilege (elevação de privilégio, viola autorização): usuário comum chamando função de administrador.',
            'S Spoofing               -> autenticação forte, MFA\nT Tampering              -> validação no servidor, assinaturas\nR Repudiation            -> logs de auditoria protegidos\nI Information disclosure -> mínimo de dados, erros genéricos\nD Denial of service      -> limites de taxa, quotas, timeouts\nE Elevation of privilege -> autorização em toda função'
          ),
          sl(
            'Casos de abuso e priorização de risco',
            'Um caso de uso descreve o que o usuário legítimo quer fazer; um caso de abuso descreve como alguém mal-intencionado (ou apenas esperto demais) tentaria usar a mesma função: "como alguém esgotaria o estoque com um robô?", "como reaproveitaria um cupom?". Não dá para tratar tudo ao mesmo tempo, então priorize por risco, em geral probabilidade × impacto. Existem métodos formais: o CVSS dá uma nota padronizada de gravidade a vulnerabilidades conhecidas; o DREAD pontua fatores como dano e facilidade de exploração, mas é subjetivo. Para um time pequeno, uma escala simples (baixo/médio/alto) aplicada com critério já organiza a fila.'
          ),
          sl(
            'Registrar mitigações e exemplo guiado',
            'Cada ameaça relevante vira uma linha com: descrição, categoria STRIDE, risco, decisão (mitigar, eliminar, transferir ou aceitar), responsável e como verificar. Ferramentas ajudam a desenhar e guardar isso: o OWASP Threat Dragon é uma ferramenta gratuita para montar DFDs e listar ameaças e mitigações; papel e quadro branco também funcionam. Abaixo, uma linha do modelo da loja fictícia: o fluxo cliente → API cruza a fronteira 1, e a ameaça de adulterar o preço no pedido é mitigada recalculando tudo no servidor e testando isso.',
            'Ameaça: cliente envia "preco":1 no pedido      (fluxo cruza fronteira 1)\nCategoria: Tampering  | Risco: alto\nDecisão: mitigar -> servidor ignora o preço do cliente e consulta o catálogo\nVerificação: teste automatizado que envia preço falso e espera total correto\nRevisão: a cada mudança no fluxo de checkout'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na sequência das 4 perguntas da modelagem de ameaças, qual é a TERCEIRA?', 'b', [
          'Fizemos um bom trabalho? (revisar e testar o que foi feito)',
          'O que vamos fazer a respeito? (decidir entre mitigar, eliminar, transferir ou aceitar cada risco)',
          'O que pode dar errado? (listar as ameaças com STRIDE, por exemplo)',
          'O que estamos construindo? (desenhar o sistema e suas fronteiras)'
        ], 'A ordem é: o que estamos construindo, o que pode dar errado, o que vamos fazer a respeito e fizemos um bom trabalho. A terceira trata de decidir mitigar, eliminar, transferir ou aceitar.'),
        mcq('q2', 'Por que é vantajoso modelar ameaças já na fase de desenho?', 'd', [
          'Porque a modelagem substitui os testes de segurança, que passam a ser dispensáveis depois',
          'Porque o documento final pode ser entregue ao cliente como prova de que o sistema não tem falhas',
          'Porque falhas de projeto só aparecem em produção e não podem ser previstas por conversas em equipe',
          'Porque falhas de projeto são caras de corrigir depois, e uma pergunta no quadro custa pouco'
        ], 'Falhas de arquitetura exigem redesenho. Modelar cedo é barato e gera decisões registradas; não substitui testes nem garante ausência de falhas.'),
        mcq('q3', 'No DFD da loja, qual fluxo é o MAIS óbvio candidato a análise de ameaças por cruzar uma fronteira de confiança?', 'a', [
          'Navegador do cliente enviando o pedido à API pela internet',
          'Função interna da API que formata o texto da nota fiscal emitida ao cliente',
          'Variável local usada num laço dentro de um mesmo processo da API, sem trafegar na rede',
          'Comentário no código explicando por que existe uma regra de desconto'
        ], 'Fluxos que cruzam fronteiras (internet → servidor, servidor → banco, sistema → terceiro) mudam o nível de confiança do dado e merecem validação, autenticação e autorização.'),
        fill('q4', 'Complete o D do mnemônico STRIDE (em inglês).', 'S Spoofing\nT Tampering\nR Repudiation\nI Information disclosure\nD ___ of service\nE Elevation of privilege', ['Denial', 'denial of service'], 'D é Denial of service: negação de serviço, que viola a disponibilidade (por exemplo, endpoint caro sem limite de taxa).'),
        mcq('q5', 'Um usuário diz que nunca fez uma transferência e a equipe não consegue provar o contrário porque o sistema não registra ações com identidade e horário. Qual categoria STRIDE?', 'c', [
          'Spoofing',
          'Information disclosure',
          'Repudiation',
          'Tampering'
        ], 'Repudiation (repúdio): a falta de trilha de auditoria confiável permite negar ações. A mitigação é logar ações sensíveis com identidade, horário e proteção contra alteração.'),
        mcq('q6', 'A equipe tem 3 casos de abuso: (A) robô esgota o estoque de um produto de edição limitada; (B) alguém altera o preço enviado no pedido e compra de graça; (C) um erro de digitação em uma página de ajuda. Qual priorizar primeiro, usando probabilidade × impacto?', 'b', [
          'O caso C, por ser o mais simples de corrigir e de testar',
          'O caso B, pois é fácil de tentar e causa perda financeira direta; o A vem em seguida',
          'Todos têm o mesmo risco, então a ordem deve ser decidida por sorteio',
          'O caso A, porque robôs sempre causam mais prejuízo do que qualquer adulteração'
        ], 'Prioridade segue risco: B tem alta probabilidade e impacto financeiro direto. A também importa; C é de baixo impacto. Facilidade de correção é critério de esforço, não de risco.'),
        mcq('q7', 'Qual é o papel de uma ferramenta como o OWASP Threat Dragon no processo?', 'd', [
          'Escanear automaticamente o código-fonte e corrigir as vulnerabilidades encontradas',
          'Bloquear requisições maliciosas em produção, atuando como um firewall de aplicação na frente do servidor',
          'Gerar a nota CVSS final de cada dependência usada pelo projeto',
          'Apoiar o desenho do DFD e o registro das ameaças e mitigações, de forma gratuita'
        ], 'O Threat Dragon é uma ferramenta de modelagem: ajuda a desenhar o DFD e documentar ameaças e mitigações. Não escaneia código nem protege produção.'),
        fill('q8', 'Complete: a linha do DFD onde muda o nível de confiança é a fronteira de ___.', 'Todo fluxo que cruza a fronteira de ___ é candidato a ameaças', ['confiança', 'confianca', 'trust'], 'A fronteira de confiança (trust boundary) separa zonas com níveis de confiança diferentes; fluxos que a cruzam pedem validação, autenticação e autorização.')
      ]
    },
    {
      id: 'owi-02-asvs-requisitos',
      title: 'OWASP ASVS e requisitos de segurança',
      goal: 'Usar o ASVS para transformar segurança em requisitos verificáveis, critérios de aceite e checklists.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o ASVS',
            'O OWASP ASVS (Application Security Verification Standard) é um catálogo de requisitos de segurança verificáveis para aplicações web e APIs. Cada requisito é uma frase testável, como "a aplicação armazena senhas com função de hash própria para senhas". Ele serve a dois públicos: quem desenvolve (o que construir) e quem testa ou audita (o que verificar), dando a ambos um vocabulário comum e dispensando listas inventadas caso a caso. É um padrão, não uma ferramenta: ninguém "instala" o ASVS, você o usa como régua.'
          ),
          sl(
            'Os três níveis',
            'O ASVS organiza o rigor em níveis. Nível 1: o mínimo para toda aplicação, em geral verificável por testes externos e automatizados, sem acesso ao código. Nível 2: recomendado para a maioria das aplicações que lidam com dados sensíveis ou regras de negócio relevantes (o padrão para quem tem dúvida); exige verificação mais profunda. Nível 3: para aplicações críticas, onde a falha causa dano grave (finanças de alto valor, saúde, infraestrutura), com análise de arquitetura e de código mais exigente. Escolha o nível pelo risco do sistema, não por vaidade: pedir nível 3 de um blog só gera custo.',
            'Nível 1 -> base para qualquer app\nNível 2 -> maioria das apps com dados sensíveis\nNível 3 -> alto valor / alto dano potencial'
          ),
          sl(
            'Categorias em visão geral',
            'Os requisitos são agrupados por tema. Entre eles: arquitetura e modelagem de ameaças, autenticação, gerenciamento de sessão, controle de acesso, validação/sanitização e codificação de saída, criptografia, tratamento de erros e logs, proteção de dados, comunicação (TLS), lógica de negócio, arquivos e recursos, segurança de API/web service, configuração e componentes. Você não precisa decorar números: o que importa é saber que existe um capítulo para cada área vista neste curso e que dá para consultar o capítulo relevante ao projetar ou revisar uma funcionalidade.'
          ),
          sl(
            'De requisito a critério de aceite',
            'Requisito genérico não entra em sprint; critério de aceite entra. Pegue o requisito do ASVS, ligue-o à funcionalidade em construção e escreva um critério testável. Exemplo: o requisito sobre senhas fortes vira, na história "Como visitante, quero criar uma conta", o critério "o cadastro rejeita senhas com menos de 12 caracteres e senhas conhecidas como vazadas, com mensagem clara". Assim a segurança entra na definição de pronto da história e vira teste automatizado, em vez de ficar para uma "revisão de segurança" no fim.',
            'História: Como visitante, quero criar uma conta.\nCritérios de aceite (ligados ao ASVS - autenticação):\n- Senha com menos de 12 caracteres é rejeitada\n- Senha presente em lista de vazadas é rejeitada\n- Senha é armazenada com hash próprio para senhas (scrypt/Argon2)\n- Tentativas repetidas de cadastro são limitadas por IP'
          ),
          sl(
            'Checklist de verificação e mapeamento de achados',
            'Para verificar, use o ASVS como checklist: para cada requisito do nível escolhido, registre se foi atendido, não atendido ou não se aplica, e onde está a evidência (teste, trecho de código, configuração). Quando um teste de invasão, uma revisão ou uma ferramenta apontar um achado, mapeie-o ao requisito violado: isso padroniza o relatório, mostra a lacuna de controle (não só o sintoma) e permite medir progresso por capítulo ao longo do tempo.',
            'Achado: IDOR em /pedidos/{id}\nRequisito violado: controle de acesso - verificar autorização por objeto\nStatus: NÃO ATENDIDO | Evidência: teste de matriz papel x recurso falha\nAção: centralizar a checagem na camada de serviço + teste de regressão'
          ),
          sl(
            'ASVS vs Top 10',
            'O OWASP Top 10 é um documento de conscientização: lista as categorias de risco mais relevantes, sem pretender ser completo nem testável item a item. O ASVS é um padrão de verificação: detalhado, testável e escalonado por níveis. Use o Top 10 para sensibilizar o time e priorizar o aprendizado; use o ASVS para definir requisitos, planejar testes e declarar o que foi realmente verificado. Um ajuda a entender o porquê, o outro a provar o que foi feito.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a melhor descrição do OWASP ASVS?', 'c', [
          'Um scanner automático de vulnerabilidades que gera relatórios para auditoria',
          'Uma lista dos dez riscos mais comuns, feita para conscientização, sem requisitos testáveis',
          'Um catálogo de requisitos de segurança verificáveis, usado para construir e testar aplicações',
          'Uma biblioteca que implementa autenticação pronta para frameworks web'
        ], 'O ASVS é um padrão de requisitos testáveis, útil para quem desenvolve e para quem verifica. Não é ferramenta nem biblioteca, e a lista de riscos de conscientização é o Top 10.'),
        mcq('q2', 'Uma startup lança um app de agendamento de consultas com dados de saúde dos usuários e regras de negócio relevantes. Qual nível do ASVS é um ponto de partida razoável?', 'a', [
          'Nível 2, adequado à maioria das aplicações que lidam com dados sensíveis e regras de negócio',
          'Nenhum nível, pois o ASVS só se aplica a bancos e governos',
          'Nível 1 é suficiente para qualquer aplicação com dados sensíveis, sem ressalvas',
          'Nível 3 em tudo, independentemente do risco, para evitar discussões'
        ], 'O nível 2 é o recomendado para a maioria das aplicações com dados sensíveis. O nível 3 fica para sistemas críticos; o 1 é base mínima. O nível deve refletir o risco.'),
        mcq('q3', 'Qual item NÃO é uma categoria típica de requisitos do ASVS?', 'd', [
          'Gerenciamento de sessão',
          'Tratamento de erros, logs e registro de eventos de segurança',
          'Controle de acesso e autorização por função e por objeto',
          'Escolha da cor dos botões da interface'
        ], 'O ASVS cobre áreas de segurança (sessão, acesso, erros e logs, criptografia, API etc.). Estilo visual da interface não faz parte do padrão.'),
        fill('q4', 'Complete: o ASVS é um padrão de ___ (confirmar que os controles existem e funcionam), enquanto o Top 10 é de conscientização.', 'ASVS = padrão de ___\nTop 10 = documento de conscientização', ['verificação', 'verificacao'], 'O ASVS é um padrão de verificação: requisitos testáveis por níveis. O Top 10 conscientiza sobre os principais riscos.'),
        mcq('q5', 'Como transformar o requisito "limitar tentativas de login" em critério de aceite adequado para uma história?', 'b', [
          'Escrever na documentação que o login deve ser seguro e deixar que cada pessoa do time interprete como achar melhor',
          'Definir: "após 5 falhas em 10 minutos na mesma conta, novas tentativas são atrasadas, com teste automatizado"',
          'Incluir uma tarefa no backlog chamada "segurança" sem prazo nem critério',
          'Contratar uma auditoria no fim do projeto para avaliar o login em conjunto com tudo'
        ], 'Critério de aceite precisa ser específico e testável, para entrar na definição de pronto e virar teste. Os números do exemplo são ilustrativos; o essencial é a verificabilidade.'),
        mcq('q6', 'Um pentest encontrou um IDOR em /pedidos/{id}. Como usar o ASVS no relatório?', 'b', [
          'Ignorar o ASVS, pois ele só serve para o desenho inicial do sistema',
          'Mapear o achado ao requisito de controle de acesso violado, registrando status, evidência e ação corretiva',
          'Trocar o nível do ASVS para o 1 até que a falha deixe de aparecer nos testes',
          'Copiar a lista inteira do ASVS como anexo, sem relacionar nada ao achado'
        ], 'Mapear achados a requisitos padroniza o relatório, mostra a lacuna de controle e permite medir o progresso. Rebaixar o nível apenas esconde o problema.'),
        mcq('q7', 'Qual afirmação compara corretamente o Top 10 e o ASVS?', 'c', [
          'O Top 10 é testável item a item e o ASVS é uma lista de curiosidades',
          'São o mesmo documento com nomes diferentes, atualizado pela mesma equipe no mesmo dia',
          'O Top 10 ajuda a conscientizar e priorizar; o ASVS detalha requisitos verificáveis por níveis',
          'O ASVS trata só de criptografia e gestão de chaves, enquanto o Top 10 trata de todo o resto da segurança'
        ], 'Top 10 conscientiza, ASVS verifica. O ASVS é amplo e escalonado, não restrito a criptografia.'),
        fill('q8', 'Complete: ao verificar um requisito, registramos o status e onde está a ___ (teste, trecho de código ou configuração que comprova).', 'Requisito | Status (atendido/não/N.A.) | ___', ['evidência', 'evidencia', 'evidências', 'evidencias'], 'A evidência (teste, código, configuração) é o que permite a terceiros conferir que o requisito foi realmente atendido.')
      ]
    },
    {
      id: 'owi-03-autenticacao-avancada-mfa',
      title: 'Autenticação avançada e MFA',
      goal: 'Combinar fatores, entender o TOTP por dentro, preferir passkeys e proteger recuperação, senhas e tentativas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Fatores de autenticação e por que MFA',
            'Há três famílias de fatores: conhecimento (algo que você sabe: senha, PIN), posse (algo que você tem: celular, chave de segurança) e inerência (algo que você é: biometria). Autenticação multifator (MFA) combina fatores de FAMÍLIAS diferentes: senha + segunda senha continua sendo um fator só. A vantagem é simples: se a senha vazar (reuso, phishing, vazamento de terceiros), o invasor ainda precisa do segundo fator. MFA não é bala de prata, e a qualidade do segundo fator varia muito, como veremos.'
          ),
          sl(
            'TOTP por dentro',
            'No TOTP (RFC 6238), servidor e app autenticador compartilham um segredo. O código de 6 dígitos nasce de um HMAC calculado sobre um contador de tempo: passos de 30 segundos desde 1970. Pega-se o HMAC (SHA-1 no padrão básico), extrai-se 4 bytes a partir de um deslocamento dado pelos últimos 4 bits ("truncamento dinâmico") e aplica-se módulo 10^6. Ambos os lados calculam o mesmo valor sem comunicação. O servidor aceita uma pequena janela de tolerância (um passo antes/depois) e deve impedir reuso do mesmo código. Abaixo, uma implementação didática conferida com o vetor de teste do RFC 6238 (segredo ASCII de 20 bytes, tempo 59 s, 8 dígitos).',
            'import hmac, hashlib, struct\n\ndef hotp(key, counter, digits=6):\n    mac = hmac.new(key, struct.pack(\'>Q\', counter), hashlib.sha1).digest()\n    off = mac[-1] & 0x0F\n    code = struct.unpack(\'>I\', mac[off:off+4])[0] & 0x7FFFFFFF\n    return str(code % 10**digits).zfill(digits)\n\ndef totp(key, t, step=30, digits=6):\n    return hotp(key, int(t // step), digits)\n\nk = b\'12345678901234567890\'   # segredo de teste do RFC\nprint(totp(k, 59, digits=8))  # 94287082  (bate com o RFC 6238)\nprint(totp(k, 45), totp(k, 59), totp(k, 60))  # 287082 287082 359152 (mesma janela de 30 s; muda em t=60)'
          ),
          sl(
            'WebAuthn e passkeys; SMS é fraco',
            'WebAuthn (base das passkeys) usa criptografia de chave pública: o dispositivo guarda a chave privada e o servidor só guarda a pública. No login, o dispositivo assina um desafio ligado à ORIGEM do site; um site falso de phishing tem outra origem e não consegue uma assinatura válida, por isso é resistente a phishing, ao contrário de TOTP e SMS, que o usuário pode digitar numa página falsa. O SMS é o segundo fator mais fraco: sofre com SIM swap (golpe que transfere o número da vítima para um chip do atacante) e interceptação. Melhor que nada, pior que TOTP e muito pior que chaves de segurança/passkeys.',
            'Fortes  : passkey / chave de segurança (WebAuthn)  -> resistente a phishing\nBons    : TOTP em app autenticador                -> phishing ainda possível\nFracos  : SMS / ligação                           -> SIM swap, interceptação'
          ),
          sl(
            'Recuperação de conta, códigos e fadiga de MFA',
            'A recuperação costuma ser o elo mais fraco: se redefinir a senha por e-mail dispensa o MFA, o invasor ignora o segundo fator. Ofereça códigos de recuperação (aleatórios, de uso único, mostrados uma vez, guardados com hash) e fluxos de recuperação que exijam verificação equivalente. Notifique o usuário em toda redefinição. Outro risco é a fadiga de MFA: o invasor, já com a senha, dispara dezenas de notificações "aprovar login?" até o usuário aceitar por cansaço. Defesas: aprovação com número a digitar (number matching), limites de notificações e alerta de tentativas repetidas.'
          ),
          sl(
            'Senhas modernas (NIST) e senhas vazadas',
            'As diretrizes do NIST (SP 800-63B) mudaram o conselho antigo: priorize comprimento, aceite frases e todos os caracteres, NÃO imponha regras de composição ("uma maiúscula, um símbolo") e NÃO exija troca periódica sem motivo (só troque após suspeita de comprometimento). Em vez disso, rejeite senhas comuns e já vazadas. Serviços de senhas vazadas permitem checar sem enviar a senha: o cliente envia só os primeiros 5 caracteres do hash SHA-1 e recebe a lista de sufixos que casam (k-anonimato); a comparação final é local, então a senha nunca sai por inteiro.',
            'sha1(senha) = 5BAA6 1E4C9B93F3F0682250B6CF8331B7EE68FD8\n-> envia só "5BAA6"; compara o resto localmente com a lista devolvida'
          ),
          sl(
            'Limitar tentativas e notificar',
            'Sem limite, o invasor tenta milhões de senhas (força bruta) ou usa listas vazadas em muitas contas (credential stuffing). Controles: limite por conta E por IP/dispositivo, atrasos progressivos, CAPTCHA como apoio e alertas. Cuidado com o bloqueio total da conta: ele permite que um terceiro trave o usuário legítimo de propósito (negação de serviço); prefira atraso progressivo ou desafio extra. Notifique o usuário em logins de dispositivo novo, troca de senha e mudança de fatores — assim ele percebe o abuso rápido. As mensagens de erro devem ser iguais para "usuário inexistente" e "senha errada".'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual combinação é realmente autenticação multifator (fatores de famílias diferentes)?', 'd', [
          'Senha e pergunta secreta de segurança (ambas conhecimento)',
          'PIN de seis dígitos e senha de oito caracteres (ambas conhecimento)',
          'Duas senhas diferentes digitadas em sequência, uma em cada tela do login',
          'Senha (conhecimento) e código de app autenticador (posse)'
        ], 'MFA combina famílias distintas: conhecimento, posse e inerência. Dois itens de conhecimento contam como um único fator.'),
        mcq('q2', 'No TOTP, de onde vêm os 6 dígitos exibidos no app?', 'b', [
          'Um número aleatório que o servidor gera a cada minuto e envia ao app por uma notificação',
          'Um HMAC do contador de tempo com o segredo compartilhado, truncado para 6 dígitos',
          'Um hash da senha do usuário concatenado com o endereço IP atual',
          'Uma chave privada guardada no celular, cuja assinatura o servidor confere com a chave pública'
        ], 'TOTP = HMAC(segredo, tempo/30s) com truncamento. Os dois lados calculam o mesmo valor independentemente. Chave pública/privada é o modelo do WebAuthn.'),
        mcq('q3', 'Por que passkeys (WebAuthn) são resistentes a phishing, ao contrário do TOTP?', 'c', [
          'Porque o código dura pouco e expira antes que o golpista consiga usá-lo na página real',
          'Porque o app do autenticador é instalado só em celulares com biometria',
          'Porque a assinatura é ligada à origem do site, e um site falso não recebe assinatura válida',
          'Porque o servidor guarda a chave privada do usuário e a compara com a do site'
        ], 'O navegador/dispositivo vincula a assinatura à origem real. Num site falso, a origem difere e a asserção não serve. O servidor guarda apenas a chave pública.'),
        fill('q4', 'Complete: o golpe que transfere o número de telefone da vítima para um chip do atacante, enfraquecendo o SMS como fator, chama-se SIM ___.', 'SMS como MFA é fraco por causa de SIM ___', ['swap', 'swapping', 'swap attack'], 'No SIM swap o atacante passa a receber os SMS da vítima, inclusive códigos de verificação.'),
        mcq('q5', 'Segundo as orientações modernas do NIST para senhas, qual prática é recomendada?', 'a', [
          'Priorizar comprimento e barrar senhas comuns ou vazadas, sem regras de composição',
          'Exigir trocas obrigatórias a cada 60 dias para todos os usuários, mesmo sem suspeita de vazamento',
          'Bloquear colar senha no campo para evitar uso de gerenciadores',
          'Exigir ao menos um símbolo, um número e uma maiúscula, mesmo quando a senha for curta'
        ], 'O NIST recomenda comprimento, bloqueio de senhas comuns/vazadas e liberdade de caracteres, sem composição forçada nem rotação periódica obrigatória. Permitir colar favorece gerenciadores.'),
        mcq('q6', 'Como verificar se uma senha vazou sem enviar a senha completa ao serviço (k-anonimato)?', 'b', [
          'Enviar a senha criptografada com uma chave que o serviço conhece e deixar que ele responda',
          'Enviar só o prefixo do hash, receber os sufixos candidatos e comparar localmente',
          'Enviar o nome de usuário ao serviço e deixar que ele responda se a senha informada é segura',
          'Enviar a senha em texto puro por HTTPS, que garante que ninguém a verá'
        ], 'Apenas os primeiros caracteres do hash saem do cliente; o serviço devolve vários sufixos e a comparação final acontece localmente, escondendo a senha.'),
        mcq('q7', 'Um usuário relata dezenas de notificações "Aprovar login?" no celular durante a madrugada. O que está acontecendo e qual defesa ajuda?', 'a', [
          'Fadiga de MFA; usar number matching, limitar notificações e alertar o usuário sobre tentativas',
          'Falha de rede; basta reenviar a notificação com menos frequência',
          'Phishing de SMS; basta migrar o segundo fator para códigos por mensagem de texto',
          'Erro do relógio do celular; basta sincronizar o horário do aparelho'
        ], 'É o ataque de fadiga de MFA: o invasor tem a senha e insiste até alguém aprovar. Number matching, limites e alertas reduzem o risco.'),
        fill('q8', 'Complete: para evitar que a recuperação burle o MFA, ofereça códigos de recuperação de uso ___ (cada código só vale uma vez).', 'Códigos de recuperação: aleatórios, guardados com hash, de uso ___', ['único', 'unico', 'único.', 'uma vez'], 'Códigos de recuperação devem ser aleatórios, de uso único, mostrados uma vez e guardados com hash, como se fossem senhas.')
      ]
    },
    {
      id: 'owi-04-oauth-oidc-seguros',
      title: 'OAuth 2.0 e OpenID Connect seguros',
      goal: 'Usar Authorization Code com PKCE, validar state, nonce e redirect_uri e tratar tokens com cuidado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Papéis e a diferença entre OAuth e OIDC',
            'OAuth 2.0 tem quatro papéis: o usuário (dono do recurso), o cliente (o app que quer acesso), o servidor de autorização (emite tokens após o usuário consentir) e o servidor de recursos (a API que aceita o token). OAuth resolve AUTORIZAÇÃO delegada: "este app pode ler minha agenda" sem entregar a senha. Ele não diz quem o usuário é. O OpenID Connect (OIDC) é uma camada sobre o OAuth que adiciona AUTENTICAÇÃO: devolve um ID token (um JWT) com a identidade do usuário (claims como iss, sub, aud, exp, nonce). Resumo: OAuth autoriza, OIDC autentica.'
          ),
          sl(
            'Authorization Code + PKCE',
            'O fluxo recomendado é o Authorization Code com PKCE (lê-se "pixie"). Passos: o cliente gera um segredo aleatório (code_verifier) e envia só o seu hash (code_challenge, método S256) no pedido de autorização; o usuário autentica e consente; o servidor redireciona de volta com um code curto e de uso único; o cliente troca o code por tokens enviando o code_verifier original; o servidor confere que o hash bate. Se alguém roubar o code no caminho (por exemplo, por um app malicioso ou log), não consegue trocá-lo sem o verifier. PKCE é recomendado para todos os clientes, públicos (SPA, mobile) e confidenciais.',
            '1. cliente: code_verifier = aleatório; code_challenge = BASE64URL(SHA256(verifier))\n2. GET /authorize?response_type=code&client_id=<id>&redirect_uri=https://app.example/cb\n     &scope=openid%20profile&state=<aleatório>&nonce=<aleatório>\n     &code_challenge=<challenge>&code_challenge_method=S256\n3. servidor -> redireciona para redirect_uri?code=<code>&state=<mesmo state>\n4. POST /token  (code + code_verifier)  -> tokens'
          ),
          sl(
            'Gerando verifier e challenge (S256)',
            'O code_verifier é uma string aleatória de alta entropia (use gerador criptográfico). O challenge é o SHA-256 do verifier codificado em Base64URL sem preenchimento "=". A demonstração abaixo usa o exemplo publicado no RFC 7636: o resultado confere com o do documento. Em produção, gere o verifier com secrets.token_urlsafe e guarde-o até a troca do code; não o envie na primeira requisição.',
            'import hashlib, base64, secrets\n\nverifier = secrets.token_urlsafe(48)       # em produção: aleatório\n\ndef s256(v):\n    d = hashlib.sha256(v.encode(\'ascii\')).digest()\n    return base64.urlsafe_b64encode(d).rstrip(b\'=\').decode()\n\n# Exemplo do RFC 7636\nprint(s256(\'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk\'))\n# E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
          ),
          sl(
            'Fluxos desaconselhados, state e nonce',
            'O fluxo Implicit devolvia o token direto na URL de retorno (fragmento): fica em histórico, logs e pode vazar; as recomendações atuais o abandonam. O fluxo Password (Resource Owner Password Credentials) faz o app coletar a senha do usuário, derrotando o propósito do OAuth e impedindo MFA; também é desaconselhado. Dois parâmetros anti-ataque: state, um valor aleatório que o cliente gera, guarda na sessão e confere na volta (protege contra CSRF no callback: impede que alguém injete um code alheio na sua sessão); e nonce, enviado no pedido e devolvido dentro do ID token, que o cliente confere para impedir replay de tokens.'
          ),
          sl(
            'redirect_uri, escopos e tokens',
            'O servidor de autorização deve comparar o redirect_uri com a lista registrada por CORRESPONDÊNCIA EXATA (esquema, host, porta, caminho). Curingas ou comparação por prefixo permitem desviar o code para um endereço do invasor (open redirect). Escopos devem ser o mínimo necessário (princípio do menor privilégio). Tipos de token: access token (autoriza chamadas à API, vida curta), ID token (prova a identidade do usuário ao CLIENTE; não deve ser enviado como credencial a APIs) e refresh token (obtém novos access tokens; vida longa, muito sensível, ideal com rotação). Evite guardar tokens em localStorage; em apps web, o padrão mais seguro é o back-end guardar os tokens e dar ao navegador só um cookie de sessão.'
          ),
          sl(
            'Erros comuns e bibliotecas prontas',
            'Erros frequentes: aceitar redirect_uri por prefixo ou curinga; mandar token em query string da URL (vaza em logs e Referer); não validar o ID token (assinatura, iss igual ao emissor esperado, aud igual ao seu client_id, exp, nonce); confundir ID token com access token; ignorar o state. Implementar OAuth/OIDC na mão é perigoso porque os detalhes são muitos: use bibliotecas maduras e provedores/servidores de identidade consolidados, siga as boas práticas atuais da IETF para segurança em OAuth e atualize as dependências.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença essencial entre OAuth 2.0 e OpenID Connect?', 'a', [
          'OAuth delega autorização de acesso; OIDC acrescenta autenticação, com a identidade em um ID token',
          'OAuth é para sites e OIDC é para aplicativos de celular, com os mesmos objetivos e fluxos',
          'OAuth criptografa todo o tráfego, enquanto o OIDC apenas assina as mensagens para conferência posterior',
          'OAuth foi substituído pelo OIDC e deixou de ser usado como base de autorização nas aplicações atuais'
        ], 'OAuth autoriza (acesso delegado); OIDC é uma camada de identidade em cima do OAuth. Um não substitui o outro.'),
        mcq('q2', 'Qual fluxo é recomendado para uma aplicação de página única (SPA) que precisa de login via OIDC?', 'c', [
          'Implicit, retornando o token no fragmento da URL de retorno',
          'Password, coletando usuário e senha direto no app',
          'Authorization Code com PKCE',
          'Enviar o access token por e-mail ao usuário para colar no app'
        ], 'Authorization Code com PKCE é o recomendado, inclusive para clientes públicos. Implicit e Password são desaconselhados.'),
        mcq('q3', 'Para que serve o parâmetro state no pedido de autorização?', 'd', [
          'Informar ao servidor em qual estado ou país o usuário está',
          'Substituir o code_verifier quando o cliente não consegue gerar números aleatórios com segurança',
          'Definir quanto tempo o access token ficará válido',
          'Ser um valor aleatório que o cliente sempre confere na volta, protegendo o callback contra CSRF'
        ], 'O cliente guarda o state e confere que o retorno traz o mesmo valor; assim um code injetado por terceiros é rejeitado. Não define validade nem substitui o PKCE.'),
        fill('q4', 'Complete o método de transformação do PKCE mais recomendado, que aplica SHA-256 ao verifier.', 'code_challenge_method=___', ['S256', 's256'], 'S256 aplica SHA-256 e Base64URL ao verifier. O método plain só deve existir por compatibilidade, nunca como escolha preferida.'),
        mcq('q5', 'O servidor de autorização aceita qualquer redirect_uri que COMECE com https://app.example/. Qual o risco e a correção?', 'b', [
          'Nenhum risco, pois o HTTPS protege o redirecionamento; basta usar certificados válidos e atualizados',
          'Um endereço do invasor dentro desse prefixo pode receber o code; a correção é correspondência exata',
          'O risco é só de desempenho; a correção é cachear a lista de URIs',
          'O risco é o usuário esquecer a senha cadastrada; a correção é exigir MFA a cada retorno ao callback do app'
        ], 'Prefixos e curingas permitem desviar o code por redirecionamentos abertos. O correto é comparar com a lista registrada por igualdade exata.'),
        mcq('q6', 'Ao receber um ID token, qual conjunto de validações o cliente OIDC deve fazer?', 'd', [
          'Conferir se o token tem três partes separadas por ponto',
          'Decodificar o payload em Base64 e ler o campo sub, já que ninguém consegue alterá-lo sem conhecer a chave',
          'Verificar se o token cabe em um cookie e se o nome do usuário confere com o enviado no formulário de login',
          'Validar assinatura, emissor (iss), público (aud igual ao seu client_id), expiração (exp) e nonce'
        ], 'Decodificar não prova nada: é preciso verificar a assinatura e as claims iss, aud, exp e o nonce enviado no pedido.'),
        mcq('q7', 'Qual prática de armazenamento de tokens é mais segura para uma aplicação web tradicional com back-end?', 'c', [
          'Guardar o refresh token em localStorage para que sobreviva ao fechamento do navegador e do computador',
          'Enviar o access token na query string para facilitar a depuração',
          'Manter os tokens no servidor e entregar ao navegador somente um cookie de sessão HttpOnly',
          'Gravar os tokens em um cookie sem flags para que scripts da página possam renová-los quando precisarem'
        ], 'Com tokens só no servidor, um XSS no navegador não os alcança. Query string vaza em logs e histórico; localStorage é legível por scripts da página.'),
        fill('q8', 'Complete: para evitar replay do ID token, o cliente envia um valor no pedido e confere se ele volta dentro do token. Esse parâmetro chama-se ___.', 'scope=openid&state=<...>&___=<aleatório>', ['nonce'], 'O nonce vai no pedido de autorização e retorna como claim do ID token; o cliente confere a igualdade e evita reaproveitamento de tokens.')
      ]
    },
    {
      id: 'owi-05-jwt-tokens',
      title: 'JWT e tokens',
      goal: 'Entender a estrutura do JWT, validar tudo que importa e escolher entre tokens e sessão no servidor.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Estrutura: header.payload.assinatura',
            'Um JWT (JSON Web Token) tem três partes em Base64URL separadas por pontos: header (algoritmo e tipo), payload (as claims: sub, iss, aud, exp...) e assinatura. Base64URL é só uma codificação reversível, NÃO é criptografia: qualquer pessoa que tenha o token lê o conteúdo. Por isso nunca coloque segredos, senhas ou dados pessoais desnecessários no payload. A assinatura garante integridade e origem, não sigilo. Abaixo, decodificamos um JWT de exemplo gerado no laboratório.',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1NDIiLCJpc3MiOiJodHRwczovL2F1dGguZXhlbXBsby50ZXN0IiwiYXVkIjoibG9qYS1hcGkiLCJyb2xlIjoidXNlciIsImV4cCI6MjAwMDAwMDAwMH0.qQXpCV9r1ATEfdY0c2JoL5TW3j_hTdTPM-GYvheU6bk\n\nheader : {\'alg\': \'HS256\', \'typ\': \'JWT\'}\npayload: {\'sub\': \'u42\', \'iss\': \'https://auth.exemplo.test\', \'aud\': \'loja-api\', \'role\': \'user\', \'exp\': 2000000000}'
          ),
          sl(
            'HMAC vs RSA/ECDSA',
            'Com HS256 (HMAC) o MESMO segredo assina e verifica: todo serviço que valida também poderia forjar tokens, então serve bem quando quem emite e quem valida é o mesmo sistema. Com RS256/ES256 (RSA ou ECDSA) existe um par de chaves: o emissor assina com a chave privada e os demais verificam com a pública, que pode ser distribuída sem risco de forjar tokens. Prefira assinatura assimétrica quando vários serviços ou terceiros validam tokens. Em ambos os casos, o segredo ou a chave privada precisa de armazenamento protegido e ser longo e aleatório, nunca uma palavra comum.'
          ),
          sl(
            'Valide SEMPRE, e no servidor',
            'Validar um JWT é mais que "decodificar". Regras: (1) o servidor define o algoritmo esperado e IGNORA o que o header pede; rejeite "none" e evite confusão de algoritmo (um token HS256 assinado usando a chave pública RSA como segredo, aceito por um servidor que escolhe o algoritmo pelo header); (2) confira a assinatura; (3) valide iss (emissor esperado), aud (este serviço é o destinatário), exp (não expirou) e nbf (já é válido), com pequena tolerância de relógio; (4) trate o resultado como autenticação, mas faça a autorização com as regras do servidor. Use a biblioteca para isso, informando o algoritmo permitido.',
            'import hmac, hashlib, base64, json\n\ndef b64(b): return base64.urlsafe_b64encode(b).rstrip(b\'=\').decode()\ndef unb64(s): return base64.urlsafe_b64decode(s + \'=\' * (-len(s) % 4))\n\ndef verify(tok, key, iss, aud, now):\n    h, p, s = tok.split(\'.\')\n    if json.loads(unb64(h)).get(\'alg\') != \'HS256\':\n        raise ValueError(\'alg inesperado\')\n    esp = b64(hmac.new(key, f\'{h}.{p}\'.encode(), hashlib.sha256).digest())\n    if not hmac.compare_digest(esp, s):\n        raise ValueError(\'assinatura invalida\')\n    c = json.loads(unb64(p))\n    if c[\'iss\'] != iss: raise ValueError(\'iss\')\n    if c[\'aud\'] != aud: raise ValueError(\'aud\')\n    if c[\'exp\'] <= now: raise ValueError(\'expirado\')\n    return c'
          ),
          sl(
            'Resultado do laboratório',
            'Executando a verificação acima com o token do exemplo: o token íntegro passa e devolve as claims. Mudando o payload para role=admin sem a chave, a assinatura deixa de bater e o token é rejeitado. Um token com aud diferente, um expirado e um com alg "none" também são recusados. Repare que o atacante conseguiu LER e ALTERAR o payload (é só Base64URL); o que o impede de ser aceito é a assinatura, que ele não sabe recalcular sem a chave.',
            'ok          -> {\'sub\': \'u42\', \'iss\': \'https://auth.exemplo.test\', \'aud\': \'loja-api\', \'role\': \'user\', \'exp\': 2000000000}\nadulterado  -> assinatura invalida\naud errada  -> aud\nexpirado    -> expirado\nalg none    -> alg inesperado'
          ),
          sl(
            'Chaves, kid e JWKS',
            'Chaves precisam ser rotacionadas. Para isso o header traz o kid (key id), que indica qual chave usar na verificação. Provedores publicam suas chaves públicas em um endpoint JWKS (JSON Web Key Set): o cliente baixa o conjunto, escolhe a chave pelo kid e usa cache com renovação. Assim a rotação acontece sem coordenar deploys. Cuidado: o kid é entrada não confiável; use-o só para escolher entre chaves que VOCÊ já confia, nunca como caminho de arquivo ou consulta SQL concatenada.'
          ),
          sl(
            'Armazenamento, revogação e JWT vs sessão',
            'Onde guardar: um cookie HttpOnly (com Secure e SameSite) não é legível por scripts, o que limita o roubo por XSS; localStorage é acessível a qualquer JavaScript da página. Revogação: um JWT autônomo vale até expirar, então use access tokens de vida curta com refresh token de rotação (cada uso gera um novo refresh e invalida o anterior; reuso de um antigo sugere roubo). Trade-off: JWT escala sem consultar estado e serve entre serviços, mas é difícil de revogar; sessão no servidor revoga na hora, ao custo de armazenar estado. Para apps web comuns, sessão com cookie costuma ser a escolha mais simples e segura. JWE (JSON Web Encryption) é a variante que também cifra o conteúdo, usada quando o payload precisa ficar secreto para o portador.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um desenvolvedor coloca o CPF do usuário no payload do JWT "porque é assinado, então é seguro". Qual é o problema?', 'b', [
          'O payload é limitado a 10 caracteres, então o CPF será truncado',
          'A assinatura garante integridade, não sigilo: o payload é Base64URL e qualquer portador do token o lê',
          'O CPF não pode ser representado em JSON, que só aceita texto sem números',
          'Nenhum problema, pois a assinatura HMAC também criptografa o conteúdo do payload'
        ], 'Base64URL é codificação, não criptografia. Dados pessoais ou segredos não devem ir no payload; se for indispensável sigilo, existe JWE, mas o melhor é não enviar o dado.'),
        mcq('q2', 'Um servidor valida o JWT lendo o campo alg do header e usando o algoritmo informado. Qual risco isso cria?', 'd', [
          'O token fica maior e a requisição mais lenta, sem implicação de segurança',
          'O navegador deixa de reconhecer o cookie e o usuário precisa logar de novo',
          'O servidor deixa de conseguir ler o campo exp e passa a aceitar tokens expirados por tempo indefinido',
          'O atacante pode pedir alg none ou trocar RS256 por HS256; o servidor deve sempre fixar o algoritmo esperado'
        ], 'O algoritmo aceito é política do servidor. Aceitar o que o header manda abre caminho para none e para confusão de algoritmo.'),
        mcq('q3', 'Qual afirmação sobre HS256 e RS256 está correta?', 'a', [
          'Com HS256 quem valida também poderia forjar tokens, pois o segredo é o mesmo; com RS256 só a chave privada assina',
          'HS256 usa um par de chaves pública e privada, enquanto RS256 usa um segredo compartilhado entre emissor e quem valida os tokens',
          'RS256 criptografa o payload, tornando seguro colocar senhas e outros dados sensíveis dentro do token',
          'Os dois algoritmos são equivalentes em tudo, inclusive na distribuição de chaves entre serviços'
        ], 'HMAC é simétrico (segredo compartilhado). RSA/ECDSA são assimétricos: verificadores só precisam da chave pública. Nenhum dos dois cifra o payload.'),
        fill('q4', 'Complete: a claim que informa a data de expiração do token chama-se ___.', '{"sub": "u42", "___": 2000000000}', ['exp'], 'exp (expiration time) define até quando o token é válido; o servidor precisa rejeitar tokens após esse instante.'),
        mcq('q5', 'Um token válido emitido para a API "relatorios" é apresentado à API "loja", que usa o mesmo emissor. Qual validação evita que ele seja aceito?', 'c', [
          'Conferir o campo exp, que sempre difere entre serviços',
          'Conferir se o token está em Base64URL, pois cada serviço usa um alfabeto diferente',
          'Conferir se aud contém o identificador da própria API e rejeitar o token se não contiver',
          'Conferir se o header tem a claim typ com o valor JWT, que identifica o serviço'
        ], 'aud indica o destinatário do token. Rejeitar tokens sem o seu identificador impede reuso entre APIs.'),
        mcq('q6', 'Como lidar com a revogação de JWTs, dado que eles são autônomos até expirar?', 'a', [
          'Usar access tokens de vida curta com refresh tokens de rotação, e invalidar o refresh no servidor',
          'Emitir tokens que nunca expiram e pedir que o usuário apague o token do navegador ao encerrar o uso',
          'Trocar o segredo de assinatura a cada requisição de qualquer usuário',
          'Armazenar o JWT inteiro em localStorage e apagá-lo no logout, o que o invalida também no servidor de autorização'
        ], 'Vida curta limita a janela de abuso; a rotação do refresh token detecta reuso. Apagar no cliente não invalida o token em si.'),
        mcq('q7', 'Para um site tradicional, com back-end único e logout imediato como requisito, qual escolha costuma ser mais simples e adequada?', 'b', [
          'JWT com validade de um ano guardado em localStorage do navegador do usuário',
          'Sessão no servidor com cookie HttpOnly, que permite revogar na hora',
          'JWT sem assinatura, para reduzir o custo de CPU a cada requisição feita ao back-end',
          'Enviar usuário e senha em cada requisição, eliminando a necessidade de estado'
        ], 'Sessão no servidor revoga imediatamente e é simples; JWT compensa quando há muitos serviços e necessidade de verificação sem estado.'),
        fill('q8', 'Complete: o campo do header que indica qual chave usar na verificação, útil na rotação com JWKS, chama-se ___.', '{"alg": "RS256", "___": "chave-2025-a"}', ['kid'], 'kid (key id) identifica a chave entre as publicadas no JWKS; é entrada não confiável, usada só para escolher entre chaves já confiáveis.')
      ]
    },
    {
      id: 'owi-06-sessoes-avancado',
      title: 'Gerenciamento de sessão avançado',
      goal: 'Projetar sessões que resistam a fixação, sequestro e CSRF, com expiração e revogação adequadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Regenerar o ID e o ciclo de vida',
            'A sessão liga requisições separadas ao mesmo usuário por meio de um identificador secreto. Na fixação de sessão, o atacante faz a vítima usar um ID que ele já conhece; se o app mantém o mesmo ID após o login, o atacante passa a ter uma sessão autenticada. Defesa: gerar um ID NOVO a cada mudança de privilégio (login, elevação para admin, reautenticação) e descartar o antigo. O ID deve ser longo, aleatório (gerador criptográfico) e sem significado; nunca derivado de dados do usuário.',
            '# Pseudocódigo defensivo\nlogin_ok(usuario):\n    sessao_antiga.destruir()\n    sessao = nova_sessao(id=secrets.token_urlsafe(32))\n    sessao.usuario = usuario\n    definir_cookie(sessao.id)'
          ),
          sl(
            'Expiração ociosa e absoluta, logout e troca de senha',
            'Use dois relógios: expiração ociosa (inatividade, por exemplo alguns minutos para apps sensíveis) e absoluta (tempo máximo total, mesmo com uso contínuo). No logout, invalide a sessão NO SERVIDOR, não apenas apague o cookie, senão quem copiou o ID ainda o usa. Na troca de senha (ou desativação da conta), encerre as outras sessões. Permita ao usuário ver os dispositivos conectados e revogar sessões individualmente; se um celular foi perdido, ele derruba só aquela sessão. Ajuste os prazos ao risco: banco e blog têm necessidades diferentes.'
          ),
          sl(
            'Cookies: prefixos, SameSite e atributos',
            'Atributos: Secure (só via HTTPS), HttpOnly (JavaScript não lê), SameSite (controla envio em requisições entre sites: Strict, Lax ou None), Path e Domain. Prefixos de nome impõem regras que o navegador verifica: __Secure- exige o atributo Secure; __Host- exige Secure, Path=/ e NÃO ter atributo Domain (o cookie fica preso ao host exato, o que dificulta que subdomínios o sobrescrevam). O combo recomendado para o cookie de sessão é __Host- + Secure + HttpOnly + SameSite=Lax (ou Strict), com Path=/.',
            'Set-Cookie: __Host-sid=<id-aleatorio>; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600'
          ),
          sl(
            'Armazenamento e sequestro',
            'Guarde os dados da sessão no servidor (Redis ou banco) indexados pelo ID, ou use cookie assinado/cifrado com cuidado; nunca confie em dados de sessão enviados pelo cliente sem proteção. Armazene no servidor o hash do ID, não o ID em texto, para que um vazamento do armazenamento não entregue sessões utilizáveis. Contra sequestro (roubo do cookie por XSS, rede ou malware), é possível vincular a sessão a sinais fracos (família do navegador, faixa de rede) e pedir reautenticação quando mudarem muito; mas sinais mudam legitimamente (redes móveis, VPN), então use como indício de risco, não como bloqueio automático rígido.'
          ),
          sl(
            'Lembrar-me e ataques a considerar',
            'O "lembrar-me" deve usar um token PRÓPRIO, separado da sessão: aleatório, longo, de uso limitado (idealmente rotacionado a cada uso), guardado no servidor apenas como hash e revogável. Ele dá uma sessão normal, mas ações sensíveis (trocar senha, e-mail, dados de pagamento) exigem reautenticação. Ataques a considerar: fixação (regenere o ID), sequestro (cookies HttpOnly/Secure, HTTPS, XSS sob controle) e CSRF (SameSite e tokens, vistos na lição de CSRF). Nunca coloque o ID da sessão em URL.'
          ),
          sl(
            'Testes de sessão',
            'Trate comportamento de sessão como requisito testável: (1) o ID mudou depois do login? (2) o cookie traz Secure, HttpOnly e SameSite? (3) após logout, o ID antigo é rejeitado? (4) após troca de senha, as outras sessões caem? (5) o tempo ocioso expira de fato? (6) o ID tem entropia suficiente e não é previsível? Esses testes entram na suíte automatizada e são verificados também em revisões manuais, em laboratório próprio, contra a sua aplicação.',
            '1. GET /login      -> anota Set-Cookie (sid=A)\n2. POST /login ok   -> Set-Cookie deve trazer sid=B (B != A)\n3. POST /logout     -> usar sid=B depois deve dar 401\n4. troca de senha   -> sid de outro dispositivo deve dar 401'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o app deve gerar um novo ID de sessão logo após o login?', 'c', [
          'Para o cookie ficar menor e economizar banda em todas as requisições seguintes do usuário',
          'Para que o usuário possa escolher o próprio ID e lembrá-lo com facilidade',
          'Para impedir fixação de sessão: um ID conhecido antes do login nunca deve continuar valendo depois',
          'Para forçar o navegador a limpar o cache do site em cada acesso'
        ], 'Na fixação, o atacante conhece o ID pré-login. Regenerar o ID na mudança de privilégio invalida esse conhecimento.'),
        mcq('q2', 'Qual é a diferença entre expiração ociosa e absoluta?', 'a', [
          'Ociosa conta a inatividade do usuário; absoluta é o tempo máximo total, mesmo com uso contínuo',
          'Ociosa vale só para administradores; absoluta vale só para usuários comuns',
          'Ociosa apaga o cookie no navegador; absoluta apaga o arquivo de log do servidor ao fim de cada dia',
          'São o mesmo conceito com dois nomes diferentes, usados de forma intercambiável por frameworks distintos sem diferença prática'
        ], 'Os dois relógios se complementam: inatividade encerra sessões esquecidas, e o limite absoluto restringe a janela de uso de um ID roubado.'),
        mcq('q3', 'O que o prefixo __Host- no nome de um cookie garante?', 'd', [
          'Que o cookie é automaticamente criptografado pelo navegador com a chave do site',
          'Que o cookie é enviado também para todos os subdomínios, para compartilhar o login',
          'Que o servidor não precisa validar o conteúdo do cookie ao recebê-lo',
          'Que o cookie tem Secure, Path=/ e nenhum Domain, ficando preso ao host exato'
        ], 'O navegador só aceita cookies com __Host- se tiverem Secure, Path=/ e sem Domain, o que dificulta sobrescrita por subdomínios.'),
        fill('q4', 'Complete o atributo que impede JavaScript de ler o cookie de sessão.', 'Set-Cookie: sid=<id>; Secure; ___; SameSite=Lax', ['HttpOnly'], 'HttpOnly esconde o cookie de document.cookie, limitando o roubo por XSS (mas não impedindo o XSS em si).'),
        mcq('q5', 'No logout, o app apenas apaga o cookie no navegador. Qual é a falha?', 'b', [
          'Nenhuma: se o cookie sumiu do navegador, a sessão deixa de existir em qualquer lugar, inclusive no servidor',
          'A sessão continua válida no servidor; quem copiou o ID ainda poderia usá-lo, então é sempre preciso invalidá-la lá',
          'O logout fica lento porque o navegador precisa recarregar o certificado',
          'O usuário perde o histórico de compras armazenado no cookie'
        ], 'O ID só é inútil se o servidor o descartar. Logout correto invalida a sessão no armazenamento do servidor.'),
        mcq('q6', 'Como implementar o "lembrar-me" de forma segura?', 'c', [
          'Guardar a senha criptografada em um cookie persistente e reenviá-la a cada nova visita ao site',
          'Estender a sessão normal para 10 anos sem qualquer outro controle',
          'Usar token aleatório próprio, guardado como hash no servidor, revogável, e exigir reautenticação em ações sensíveis',
          'Criar um cookie com o nome de usuário e confiar nele na próxima visita'
        ], 'O token separado e hashado limita o dano de vazamento; revogação e reautenticação em ações sensíveis fecham o risco.'),
        mcq('q7', 'Vincular a sessão ao endereço IP e derrubá-la a qualquer mudança é uma boa ideia?', 'b', [
          'Sim, pois o IP de um usuário legítimo permanece fixo durante toda a sessão, então qualquer mudança indica sequestro e deve derrubá-la',
          'Não como regra rígida: IPs mudam legitimamente (redes móveis, VPN); serve como sinal de risco para pedir reautenticação',
          'Sim, desde que o IP seja guardado em um cookie sem proteção para ser conferido',
          'Não, pois o IP nunca pode ser lido pelo servidor em aplicações web modernas'
        ], 'Sinais fracos ajudam a detectar sequestro, mas bloquear de forma rígida quebra usuários legítimos. Prefira desafio extra a derrubada automática.'),
        fill('q8', 'Complete: na troca de senha, o app deve ___ as outras sessões do usuário (invalidá-las no servidor).', 'Troca de senha -> ___ as outras sessões', ['invalidar', 'encerrar', 'revogar', 'derrubar'], 'Encerrar as demais sessões na troca de senha garante que um invasor com sessão roubada perca o acesso.')
      ]
    },
    {
      id: 'owi-07-controle-acesso-avancado',
      title: 'Controle de acesso avançado',
      goal: 'Aplicar autorização por objeto e por propriedade na camada certa, com modelos, testes e logs.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'BOLA/IDOR, BFLA e atribuição em massa',
            'BOLA (Broken Object Level Authorization, também chamada IDOR) acontece quando a API recebe o identificador de um objeto (/pedidos/123) e não confere se aquele usuário pode acessar AQUELE objeto: trocar o número devolve o pedido de outra pessoa. BFLA (Broken Function Level Authorization) é o mesmo erro no nível da função: um usuário comum consegue chamar /admin/usuarios porque só o menu esconde o botão. Atribuição em massa (mass assignment) ocorre quando o servidor copia todos os campos do JSON recebido para o objeto: o cliente envia "role":"admin" ou "preco":1 junto e o campo é gravado. Os três têm a mesma raiz: confiar no que o cliente envia.',
            '# Vulnerável (BOLA + mass assignment)\ndef atualizar(req, id):\n    pedido = db.pedidos.get(id)          # não confere dono\n    pedido.update(req.json)              # aceita qualquer campo\n\n# Corrigido\ndef atualizar(req, id):\n    pedido = db.pedidos.get(id)\n    exigir(pode_editar(req.usuario, pedido))   # por objeto\n    campos = {k: v for k, v in req.json.items() if k in {\'endereco\', \'observacao\'}}  # allowlist\n    pedido.update(campos)'
          ),
          sl(
            'Modelos: RBAC, ABAC e ReBAC',
            'RBAC (baseado em papéis): permissões ligadas a papéis (admin, editor, leitor) e usuários recebem papéis; simples, mas não expressa "só editar os documentos do próprio departamento". ABAC (baseado em atributos): a decisão considera atributos do usuário, do recurso e do contexto (departamento, dono, horário, nível de sensibilidade). ReBAC (baseado em relacionamentos): a permissão deriva de relações entre entidades ("é membro da equipe dona da pasta"), comum em compartilhamento de documentos. Na prática, muitos sistemas misturam: papéis para o grosso e atributos/relações para o objeto.'
          ),
          sl(
            'Decisão centralizada e negar por padrão',
            'Espalhar if de permissão por centenas de rotas garante que alguma será esquecida. Centralize a decisão em uma função/serviço (por exemplo, pode(usuario, acao, recurso)) ou em um motor de políticas como OPA ou Casbin, que expressam regras como código versionável e testável ("políticas como código"). Princípio básico: negar por padrão. Se nenhuma regra permite a ação, a resposta é não; rotas novas nascem fechadas até que alguém as libere explicitamente. Faça a autorização por objeto E por propriedade: um usuário pode ver o pedido, mas não o campo de custo interno.'
          ),
          sl(
            'Multi-tenancy e contornos',
            'Em sistemas multi-tenant (vários clientes na mesma aplicação), o identificador do tenant vem da sessão/token no servidor, nunca de um parâmetro do cliente, e TODA consulta filtra por ele. Contornos comuns que derrotam checagens mal posicionadas: trocar o método HTTP (GET bloqueado, mas PUT ou DELETE na mesma rota não), usar parâmetro alternativo (?user_id=), rota alternativa (/api/v1 protegida e /api/v0 antiga esquecida), ou acessar o mesmo dado por um endpoint de exportação. Por isso a verificação deve ficar na camada de serviço ou de dados (que todas as rotas usam), não em um filtro de rota específico.',
            '-- sempre com o tenant da sessão\nSELECT * FROM pedidos WHERE id = ? AND tenant_id = ?   -- (id, sessao.tenant_id)'
          ),
          sl(
            'Testes automatizados de autorização',
            'Escreva uma matriz papel × recurso × ação com o resultado esperado e rode como teste. Inclua os casos negativos (usuário A tentando objeto de B, outro tenant, objeto inexistente) — são os que protegem contra regressões. O mini-teste abaixo, em Python, valida uma função de decisão com dados fictícios; no projeto real, o mesmo padrão roda contra a API em ambiente de teste.',
            'cases = [(\'ana\',1,True), (\'ana\',2,False), (\'ana\',3,False), (\'adm\',2,True), (\'adm\',3,False), (\'caio\',3,True), (\'ana\',99,False)]\nfor user, doc, esperado in cases:\n    obtido = can_read(user, doc)\n    print(user, doc, esperado, obtido, \'OK\' if obtido == esperado else \'FALHA\')\n\n# saída (todas OK)\n# ana   doc1  esperado=True  obtido=True  OK\n# ana   doc2  esperado=False obtido=False OK\n# adm   doc3  esperado=False obtido=False OK   (admin do tenant A não vê o tenant B)'
          ),
          sl(
            'Logs de negação e detecção',
            'Registre toda negação de acesso com quem, o quê, qual recurso e quando (sem gravar dados pessoais desnecessários nem segredos). Uma rajada de 403/404 de um mesmo usuário em IDs sequenciais é um sinal clássico de tentativa de BOLA e pode gerar alerta. Retorne respostas que não confirmem a existência do objeto quando isso importar (por exemplo, 404 em vez de 403 para recursos de outros tenants). Os logs também servem a auditorias e à LGPD (rastrear acessos a dados pessoais).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um usuário autenticado muda /api/pedidos/10 para /api/pedidos/11 e recebe o pedido de outra pessoa. Qual é a falha?', 'd', [
          'Injeção de SQL, pois o número do pedido é concatenado diretamente na consulta',
          'Falha de CSRF, porque a requisição foi feita pelo navegador',
          'Vazamento por erro de configuração do HTTPS no servidor',
          'BOLA/IDOR: o servidor deve sempre checar se o usuário pode acessar aquele objeto específico'
        ], 'BOLA/IDOR é a ausência de autorização por objeto. A correção é verificar posse ou permissão no servidor para cada identificador.'),
        mcq('q2', 'Um usuário comum chama POST /admin/usuarios e consegue criar contas. O botão não aparece na interface dele. O que isso demonstra?', 'b', [
          'Que esconder o botão na interface basta quando o usuário comum não conhece o endereço',
          'BFLA: a autorização só existia na interface, e o servidor precisa verificar o papel em toda função',
          'Que o servidor precisa de mais memória para tratar chamadas administrativas',
          'Que o usuário usou um navegador desatualizado'
        ], 'Esconder opções na interface não é controle de acesso. O servidor valida a permissão de cada função independentemente do front-end.'),
        mcq('q3', 'O endpoint copia todo o JSON recebido para o objeto do usuário. O cliente envia {"nome":"Ana","role":"admin"}. Qual correção?', 'a', [
          'Aceitar só campos de uma allowlist definida no servidor (por exemplo, nome) e ignorar os demais',
          'Validar o tamanho do JSON recebido e manter o comportamento de copiar todos os campos para o objeto',
          'Trocar o nome do campo role por outro menos óbvio',
          'Bloquear a palavra admin na entrada e liberar os outros campos recebidos do JSON sem mais verificações'
        ], 'Defesa contra mass assignment: allowlist de campos graváveis (ou DTOs específicos). Trocar nomes ou bloquear palavras não elimina o problema.'),
        fill('q4', 'Complete: o princípio que manda que, na ausência de uma regra permitindo, o acesso seja recusado, chama-se negar por ___.', 'Autorização: negar por ___', ['padrão', 'padrao', 'default'], 'Negar por padrão (deny by default) evita que rotas ou ações novas fiquem abertas por esquecimento.'),
        mcq('q5', 'Qual modelo descreve melhor "pode editar a pasta quem é membro da equipe dona dela"?', 'c', [
          'RBAC puro, com um papel por documento criado',
          'ABAC baseado no horário do acesso',
          'ReBAC, em que a permissão deriva de relações entre entidades',
          'Nenhum modelo: isso só pode ser resolvido com senhas por pasta'
        ], 'ReBAC deriva permissões de relacionamentos (usuário → equipe → pasta). RBAC e ABAC também podem aproximar, mas a relação é o conceito central aqui.'),
        mcq('q6', 'Em uma aplicação multi-tenant, de onde deve vir o identificador do tenant usado nas consultas?', 'b', [
          'De um parâmetro tenant_id enviado pelo cliente, para facilitar os testes de integração',
          'Da identidade autenticada no servidor (sessão ou token validado), sempre aplicado em toda consulta',
          'Do domínio digitado no cabeçalho Host da requisição, sem qualquer validação adicional',
          'Do último tenant acessado por qualquer usuário no mesmo servidor'
        ], 'O tenant deve ser derivado da identidade autenticada. Valores controlados pelo cliente permitem acessar dados de outros tenants.'),
        mcq('q7', 'A rota GET /relatorios/5 exige permissão, mas PUT /relatorios/5 foi esquecida. Qual abordagem estrutural reduz esse tipo de erro?', 'd', [
          'Documentar que o método PUT deve ser usado apenas por usuários experientes e que conheçam bem a API',
          'Remover o método GET para que o usuário não saiba o endereço',
          'Aumentar o tempo de expiração da sessão para que o usuário precise fazer menos tentativas de acesso às rotas',
          'Centralizar a decisão na camada de serviço ou dados, usada por todas as rotas, negando por padrão'
        ], 'Checagens espalhadas por rota são esquecidas. Uma verificação central, que todas as rotas atravessam, e negação por padrão cobrem métodos e rotas alternativas.'),
        fill('q8', 'Complete: a sigla do modelo de controle de acesso baseado em atributos do usuário, do recurso e do contexto é ___.', 'Modelo baseado em atributos: ___', ['ABAC'], 'ABAC (Attribute-Based Access Control) decide com base em atributos como departamento, dono do recurso e contexto.')
      ]
    },
    {
      id: 'owi-08-sqli-profundidade',
      title: 'Injeção de SQL em profundidade',
      goal: 'Reconhecer variantes de SQLi, parametrizar corretamente (inclusive ORDER BY) e reduzir o impacto com privilégio mínimo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Raiz do problema e variantes (conceitual)',
            'A raiz é uma só: montar o SQL concatenando texto do usuário, de modo que a entrada deixa de ser dado e passa a fazer parte do código. As variantes diferem em como o resultado é observado, não em como se corrige. Baseada em erro: a mensagem de erro do banco vaza informação. UNION: a injeção anexa outra consulta e o resultado aparece na própria página. Cega: nada é mostrado, mas a resposta muda (booleana: página diferente conforme verdadeiro/falso) ou demora (por tempo). De segunda ordem: o dado malicioso é gravado com segurança hoje e usado, concatenado, em outra consulta depois. Em laboratório próprio, estas são só categorias para você saber o que testar e detectar.'
          ),
          sl(
            'Vulnerável vs parametrizado (saída real)',
            'Em consulta parametrizada, o SQL e os valores seguem separados: o banco compila a estrutura com marcadores (?) e trata o valor sempre como dado. Laboratório: SQLite em memória, tabela fictícia com um item "oculto". A mesma entrada que, concatenada, devolve o item oculto, é inofensiva quando parametrizada. A entrada é uma cadeia didática clássica de teste em laboratório próprio.',
            'def vuln(nome):\n    return db.execute("select nome from produtos where oculto=0 and nome like \'%" + nome + "%\'").fetchall()\n\ndef safe(nome):\n    return db.execute("select nome from produtos where oculto=0 and nome like ?", (\'%\' + nome + \'%\',)).fetchall()\n\nx = "zzz\' OR 1=1 OR nome LIKE \'"\nprint(vuln(x))  # [(\'Caneca\',), (\'Camiseta\',), (\'Item interno\',)]  <- vazou o oculto\nprint(safe(x))  # []   <- tratado como texto de busca'
          ),
          sl(
            'Identificadores: ORDER BY e allowlist',
            'Marcadores só substituem VALORES. Nomes de coluna, de tabela e a direção da ordenação não podem ser parametrizados: ORDER BY ? ordenaria por uma constante, não pela coluna. Quando a ordenação vem do cliente (?order=preco), mapeie a entrada para um nome fixo conhecido através de uma allowlist (dicionário) e rejeite o resto. A direção também é escolhida entre ASC e DESC por comparação, nunca copiada.',
            'ALLOWED = {\'nome\': \'nome\', \'preco\': \'preco\'}\ndef listar(order, direction=\'asc\'):\n    col = ALLOWED.get(order)\n    if col is None: raise ValueError(\'coluna nao permitida\')\n    d = \'DESC\' if direction.lower() == \'desc\' else \'ASC\'\n    return db.execute(f\'select nome, preco from produtos where oculto=0 order by {col} {d}\').fetchall()\n\nprint(listar(\'preco\', \'desc\'))              # [(\'Camiseta\', 50.0), (\'Caneca\', 20.0)]\nlistar(\'preco; drop table produtos\')      # ValueError: coluna nao permitida'
          ),
          sl(
            'ORMs e armadilhas',
            'ORMs parametrizam as consultas geradas, mas oferecem saídas de emergência que reabrem o risco: SQL cru montado com f-string, order_by dinâmico recebendo texto do cliente, filtros por expressão textual e fragmentos (raw/extra) concatenados. O mesmo cuidado vale para LIKE: o valor continua parametrizado, mas os curingas % e _ digitados pelo usuário atuam como padrões; se isso importar, escape-os. Procedimentos armazenados ajudam apenas se não montarem SQL dinâmico concatenado dentro deles (EXEC com texto).'
          ),
          sl(
            'Privilégio mínimo e camadas extras',
            'Supondo que uma injeção passe, o dano depende do que a conta do banco pode fazer. Use contas diferentes para leitura e escrita, sem direitos de DDL (criar/apagar tabelas) na aplicação, sem acesso a outros esquemas e sem permissões de arquivo ou de execução de comandos no servidor. Validação de entrada (tipo, tamanho, formato) é camada extra: reduz a superfície, mas não substitui a parametrização. Mensagens de erro do banco nunca devem chegar ao cliente; registre-as só no log interno.'
          ),
          sl(
            'Detecção e testes',
            'Detecte: monitore picos de erros SQL, consultas anormalmente longas ou muito frequentes e padrões estranhos em parâmetros nos logs; um WAF (firewall de aplicação web) pode bloquear padrões conhecidos e gerar alertas, mas é rede de proteção, não correção (o código vulnerável continua lá). Teste: revisão de código procurando concatenação em consultas, análise estática (SAST) e testes dinâmicos (DAST) em ambiente de teste próprio, além de testes unitários com entradas problemáticas. Uma regra prática de revisão: toda construção de SQL com f-string, + ou format() é suspeita até provar o contrário.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a causa raiz comum às variantes de SQLi (erro, UNION, cega, segunda ordem)?', 'a', [
          'Concatenar a entrada do usuário no texto do SQL, misturando dado e código',
          'Usar HTTPS em vez de HTTP na comunicação entre a aplicação e o banco de dados',
          'Armazenar senhas com hash em vez de texto puro nas tabelas de usuários e nas cópias de segurança',
          'Ter índices demais nas tabelas do banco de dados'
        ], 'As variantes mudam a forma de extrair informação, mas todas nascem da mistura de dado e código. A defesa central é a parametrização.'),
        mcq('q2', 'Um atacante não vê nenhuma saída, mas percebe que a resposta demora mais quando a condição injetada é verdadeira. Que variante é essa?', 'c', [
          'Injeção baseada em erro',
          'Injeção por UNION',
          'Injeção cega por tempo',
          'Injeção de segunda ordem'
        ], 'Na injeção cega por tempo, a informação é inferida pela diferença de tempo de resposta. A correção é a mesma: parametrização e privilégio mínimo.'),
        mcq('q3', 'Por que SELECT ... ORDER BY ? com o nome da coluna como parâmetro não resolve a ordenação dinâmica?', 'b', [
          'Porque o banco de dados proíbe a cláusula ORDER BY em consultas parametrizadas, já que ela poderia expor a estrutura das tabelas',
          'Porque marcadores substituem apenas valores, não identificadores: o parâmetro virava uma constante, não a coluna',
          'Porque o parâmetro precisa ser um número inteiro obrigatoriamente',
          'Porque ORDER BY só funciona com índices compostos'
        ], 'Identificadores (colunas, tabelas) não são parametrizáveis. A solução é mapear a entrada para nomes fixos por allowlist.'),
        fill('q4', 'Complete: para escolher a coluna de ordenação vinda do cliente, use uma ___ (lista de valores permitidos).', 'col = ___.get(order)  # dicionário de colunas permitidas', ['allowlist', 'lista de permissão', 'lista de permissao', 'whitelist', 'lista branca'], 'Allowlist mapeia o texto recebido para um identificador fixo conhecido; valores fora da lista são rejeitados.'),
        mcq('q5', 'O código usa um ORM, mas faz Model.objects.raw(f"SELECT * FROM t WHERE nome = \'{nome}\'"). Está seguro?', 'd', [
          'Sim, porque o ORM protege qualquer consulta que passe por ele, inclusive as escritas à mão em texto cru',
          'Sim, desde que o nome tenha menos de 50 caracteres',
          'Sim, pois o prefixo f faz o Python escapar as aspas automaticamente antes de enviar a consulta ao banco',
          'Não: é concatenação em SQL cru; use os parâmetros do raw, como raw("... WHERE nome = %s", [nome])'
        ], 'ORMs protegem consultas geradas por eles; SQL cru concatenado volta a ser vulnerável. Use os parâmetros que a API de SQL cru oferece.'),
        mcq('q6', 'Um dado malicioso é gravado com segurança em um cadastro e, dias depois, outra funcionalidade o concatena em uma consulta. Qual o nome e a defesa?', 'a', [
          'Segunda ordem; parametrizar também as consultas que usam dados vindos do próprio banco',
          'Injeção cega; bloquear o endereço IP do usuário que cadastrou o dado e revisar os logs semanalmente',
          'Injeção por erro; esconder as mensagens de erro do banco e manter a concatenação nas consultas',
          'Injeção por UNION; limitar o número de colunas da tabela'
        ], 'Dados já armazenados não são confiáveis por estarem no banco. Toda consulta que os use deve ser parametrizada.'),
        mcq('q7', 'Qual medida reduz o IMPACTO de uma injeção que tenha passado despercebida?', 'c', [
          'Usar a conta de administrador do banco para evitar erros de permissão',
          'Exibir o texto completo do erro SQL ao usuário para facilitar o suporte',
          'Conta do banco com privilégio mínimo (sem DDL, só as tabelas necessárias), leitura e escrita separadas',
          'Remover todos os índices das tabelas do banco para dificultar a exploração da consulta'
        ], 'Privilégio mínimo limita o que a injeção consegue fazer. As outras opções ampliam o dano ou vazam informação.'),
        fill('q8', 'Complete: as consultas ___ separam a estrutura do SQL dos valores, enviados por marcadores (?) e tratados sempre como dado.', 'consultas ___ (prepared statements)', ['parametrizadas', 'parametrizada', 'preparadas', 'parametrizado'], 'Consultas parametrizadas (prepared statements) mantêm dado e código separados e são a defesa principal contra SQLi.')
      ]
    },
    {
      id: 'owi-38-seguranca-banco-dados',
      title: 'Segurança de banco de dados para aplicações',
      goal: 'Proteger o banco além da injeção: contas de menor privilégio, rede, criptografia, auditoria, mascaramento e boas práticas de backup e LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Contas separadas por função e menor privilégio',
            'O banco guarda o bem mais valioso da aplicação, e a injeção de SQL é só uma das formas de abusar dele. A defesa de fundo é o MENOR PRIVILÉGIO: a conta que a aplicação usa em produção recebe somente o necessário (por exemplo `SELECT`, `INSERT` e `UPDATE` nas tabelas que usa), sem direito de apagar tabelas (`DROP`) nem de alterar a estrutura (DDL, como `ALTER`). Assim, mesmo que uma injeção ocorra, o estrago possível é muito menor. Separe contas por função: uma de aplicação, outra somente leitura para relatórios, outra própria para MIGRAÇÕES (que alteram o esquema e rodam no pipeline de implantação, não no processo da aplicação) e contas nominais para administradores humanos, nunca o usuário administrador do banco embutido na aplicação.',
            '-- Exemplo ILUSTRATIVO (sintaxe varia entre SGBDs)\nCREATE ROLE app_web LOGIN PASSWORD \'<segredo>\';\nGRANT SELECT, INSERT, UPDATE ON pedidos TO app_web;\n-- sem DROP/ALTER para app_web\n\nCREATE ROLE relatorios LOGIN PASSWORD \'<segredo>\';\nGRANT SELECT ON pedidos TO relatorios;   -- só leitura\n\n-- migracoes: conta propria, usada apenas no pipeline de deploy'
          ),
          sl(
            'Rede, autenticação, TLS e segredos de conexão',
            'O banco não deve ser acessível da internet. Coloque-o em rede privada, com firewall que permita conexões só das máquinas da aplicação e configure o servidor para escutar (bind) em uma interface interna, e não em todas. Exija autenticação forte (senhas longas e únicas, ou autenticação por identidade da plataforma quando existir) e TLS na conexão entre aplicação e banco, para que as credenciais e os dados não trafeguem em texto aberto, mesmo dentro da rede. A string de conexão contém um segredo: mantenha-a fora do código e do repositório, em variáveis de ambiente ou num gerenciador de segredos, com rotação periódica. Bancos expostos à internet com configuração padrão ou sem senha estão entre os incidentes mais evitáveis que existem.'
          ),
          sl(
            'Criptografia, RLS e multi-tenant',
            'Criptografia em repouso protege os arquivos do banco e os backups caso o disco ou o volume seja acessado indevidamente; ela NÃO protege contra uma aplicação comprometida que consulte o banco normalmente. Para dados muito sensíveis (documentos, dados de saúde), considere criptografar o campo na aplicação, com chaves guardadas fora do banco. Em sistemas multi-tenant (vários clientes na mesma base), o risco clássico é uma consulta esquecer o filtro de cliente e vazar dados de outro. A segurança em nível de linha (RLS, Row-Level Security) move a regra para o banco: políticas definem quais linhas cada conta enxerga, e o filtro deixa de depender do cuidado de cada consulta. Nem todo SGBD oferece RLS nativo; uma alternativa conceitual é expor VISÕES filtradas por cliente, mas lembre que a aplicação continua responsável por autenticar e autorizar. A demonstração a seguir (SQLite em memória, dados fictícios) mostra a ideia de visão filtrada.',
            `import sqlite3
con = sqlite3.connect(':memory:')
con.executescript("""
CREATE TABLE pedidos(id INTEGER, tenant TEXT, cliente TEXT, email TEXT, cpf TEXT, total REAL);
INSERT INTO pedidos VALUES
 (1,'loja_a','Ana Teste','ana@exemplo.test','000.000.000-01',50.0),
 (2,'loja_a','Beto Teste','beto@exemplo.test','000.000.000-02',80.0),
 (3,'loja_b','Caio Teste','caio@exemplo.test','000.000.000-03',20.0);
CREATE VIEW pedidos_loja_a AS
  SELECT id, cliente, total FROM pedidos WHERE tenant='loja_a';
""")
for r in con.execute('SELECT * FROM pedidos_loja_a'): print(r)
# SAÍDA REAL:
# (1, 'Ana Teste', 50.0)
# (2, 'Beto Teste', 80.0)
# a loja_b e as colunas email/cpf não aparecem na visão`
          ),
          sl(
            'Auditoria, logs e limite de recursos',
            'Auditoria responde "quem acessou o quê e quando". Ative o registro de conexões, de falhas de login e de operações sensíveis (mudanças de privilégio, alterações de esquema, acessos a tabelas com dados pessoais), guarde esses logs fora do alcance de quem pode adulterá-los e alerte em padrões anormais, como uma conta de aplicação lendo a tabela inteira de clientes ou um volume incomum de consultas. Cuidado para não registrar os próprios dados pessoais ou segredos nos logs de consultas. Limite também recursos: consultas muito caras, sem paginação ou sem índice, podem derrubar o banco (negação de serviço, mesmo sem má intenção). Use timeouts de consulta, limites de conexões por conta, paginação obrigatória e limites de taxa na aplicação. Lembre da ligação com a injeção: uma consulta montada por concatenação deixa quem controla a entrada abusar da conta do banco; por isso as consultas parametrizadas e o menor privilégio andam juntos.'
          ),
          sl(
            'Backups, atualização e hardening',
            'Backups do banco contêm tudo: criptografe-os, restrinja o acesso, guarde cópias fora do servidor principal, defina retenção e TESTE a restauração periodicamente. Mantenha o SGBD atualizado com as correções de segurança (patching), com janela de manutenção e testes. Faça o hardening dos padrões: remova ou desabilite contas padrão e de exemplo, bancos de demonstração e senhas de fábrica, desative recursos e extensões não usados, e revise periodicamente quem tem quais privilégios, removendo contas de pessoas que saíram.'
          ),
          sl(
            'Ambientes de teste, mascaramento e LGPD',
            'Copiar o banco de produção para desenvolvimento ou teste é uma fonte frequente de vazamentos: esses ambientes têm menos controles e mais pessoas com acesso. Pela LGPD (princípios de necessidade e segurança), não use dados pessoais reais fora de produção sem anonimização. Prefira DADOS SINTÉTICOS (inventados) e, quando precisar de dados com formato real, use MASCARAMENTO: transformar campos sensíveis para que percam o valor identificador, mantendo o formato útil para os testes. O mascaramento pode também ser aplicado em exibição (um atendente vê apenas parte do CPF). Abaixo, uma função de mascaramento simples com dados fictícios e a saída real. Mascaramento por exibição não é anonimização forte: dados que ainda permitem reidentificar alguém continuam sendo pessoais.',
            `def mask_email(e):
    u, d = e.split('@')
    return u[0] + '***@' + d

def mask_cpf(c):
    return '***.***.***-' + c[-2:]

print(mask_email('ana@exemplo.test'), mask_cpf('000.000.000-01'))
# SAÍDA REAL:
# a***@exemplo.test ***.***.***-01`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual configuração de conta para a aplicação em produção é a mais coerente com o menor privilégio?', 'b', [
          'O usuário administrador do banco, para que migrações e consultas usem a mesma credencial',
          'Uma conta com SELECT, INSERT e UPDATE só nas tabelas necessárias, sem DROP nem DDL',
          'Uma conta com todos os privilégios sobre o banco da aplicação, mas sem acesso aos demais bancos',
          'Uma conta compartilhada entre aplicação, relatórios e administradores para simplificar o controle'
        ], 'A conta da aplicação só precisa operar sobre os dados. Sem DDL e sem DROP, uma injeção ou um bug causa muito menos estrago; migrações usam conta própria.'),
        mcq('q2', 'Qual é a forma mais adequada de expor o banco de dados da aplicação?', 'd', [
          'Em endereço público com senha forte e usuário dedicado, para facilitar a administração remota da equipe',
          'Em endereço público, porém com um número de porta diferente do padrão do SGBD',
          'Em endereço público limitado por horário, aceitando conexões somente durante o expediente',
          'Em rede privada, com firewall para os servidores da aplicação, bind interno e TLS'
        ], 'O banco não precisa de endereço público. Rede privada, firewall e bind interno reduzem a superfície; TLS protege credenciais e dados em trânsito.'),
        mcq('q3', 'Onde deve ficar a senha de conexão com o banco?', 'a', [
          'Num gerenciador de segredos ou variável de ambiente, com rotação, e nunca versionada junto ao código',
          'Em um arquivo de configuração versionado junto ao código, num repositório privado',
          'Em uma constante no código-fonte, ofuscada para dificultar a leitura por quem acessar o repositório',
          'Em comentários do arquivo de implantação, para que a equipe consiga localizá-la rapidamente'
        ], 'Segredos no repositório se espalham em cópias, históricos e backups. Fora do código e rotacionados, o vazamento do código não vira vazamento do banco.'),
        fill('q4', 'Complete o princípio que orienta as permissões da conta da aplicação (menor ___).', 'Princípio do menor ___', ['privilégio', 'privilegio', 'privilégios', 'privilegios'], 'Menor privilégio: cada conta recebe só as permissões de que precisa, limitando o dano de uma falha.'),
        mcq('q5', 'Um sistema multi-tenant tem consultas que às vezes esquecem o filtro por cliente. O que a segurança em nível de linha (RLS) oferece?', 'c', [
          'Criptografa todos os arquivos do disco e dos backups, o que impede vazamentos entre clientes diferentes',
          'Substitui a autenticação de usuários, pois o banco passa a identificar cada pessoa final',
          'Políticas no banco que definem quais linhas cada conta enxerga, sem depender de cada consulta',
          'Impede injeção de SQL, já que as linhas retornadas não podem ser alteradas pela entrada'
        ], 'RLS desloca a regra de isolamento para o banco. Não substitui autenticação nem prevenção de injeção; a aplicação continua autenticando e autorizando.'),
        mcq('q6', 'Uma equipe quer testar uma nova versão com dados reais, e propõe copiar o banco de produção para o ambiente de desenvolvimento. Qual é a conduta recomendada?', 'a', [
          'Usar dados sintéticos ou anonimizados e mascarados, pois ambientes de teste têm menos controles',
          'Copiar tudo e restringir o acesso ao desenvolvimento à equipe técnica, sem mascarar nenhum campo',
          'Copiar os dados, desde que o ambiente de desenvolvimento use uma senha de banco diferente da produção',
          'Copiar somente a tabela de clientes, que é a mais útil para testes de desempenho'
        ], 'Dados pessoais reais fora de produção ampliam o risco e conflitam com os princípios de necessidade e segurança da LGPD. Sintéticos ou mascarados cumprem o objetivo.'),
        mcq('q7', 'Os logs do banco mostram a conta da aplicação lendo a tabela inteira de clientes, fora do horário de pico, em consultas repetidas. O que fazer?', 'd', [
          'Ignorar, pois a conta da aplicação tem permissão para ler essa tabela e o acesso é considerado legítimo',
          'Aumentar a retenção dos logs, sem investigar a origem das consultas até que elas se repitam',
          'Dar mais privilégios à conta, para que as consultas terminem mais rápido',
          'Tratar como alerta: investigar a origem, revisar a aplicação (injeção?), limitar consultas amplas e rotacionar credenciais'
        ], 'Padrões anormais de leitura em massa são indício de abuso ou de falha na aplicação. Auditoria só ajuda se houver alerta e investigação.'),
        fill('q8', 'Complete a sigla da segurança em nível de linha: Row-Level ___.', 'RLS = Row-Level ___', ['Security', 'segurança', 'seguranca'], 'RLS (Row-Level Security) define, por política, quais linhas cada conta pode ler ou alterar, útil em cenários multi-tenant.')
      ]
    },
    {
      id: 'owi-09-xss-profundidade-csp',
      title: 'XSS em profundidade e CSP',
      goal: 'Codificar a saída conforme o contexto, evitar sumidouros perigosos no DOM e usar CSP como defesa em profundidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Contextos de saída e a codificação certa',
            'XSS acontece quando dados não confiáveis entram na página e o navegador os interpreta como código. A defesa principal é a codificação de saída, e ela depende do CONTEXTO: corpo HTML (escape de < > & e aspas), atributo HTML (escape e sempre com aspas no atributo), JavaScript (serializar como JSON dentro de um contexto controlado; evite inserir dados em blocos de script), URL (codificação percentual do componente) e CSS (evite entrada do usuário; se preciso, só valores de uma allowlist). Usar o escape errado para o contexto não protege: escape de HTML não impede um valor perigoso dentro de href.',
            'import html, json, urllib.parse\nx = \'<script>alert(1)</script>"\\\'&\'\nprint(html.escape(x))\n# &lt;script&gt;alert(1)&lt;/script&gt;&quot;&#x27;&amp;\nprint(urllib.parse.quote(\'a b&c=d/<x>\', safe=\'\'))\n# a%20b%26c%3Dd%2F%3Cx%3E\nprint(json.dumps(\'</script><b>"x"\'))\n# "</script><b>\\"x\\""   <- json.dumps SOZINHO não basta dentro de <script>: escape também "<" (ex.: \\u003c)'
          ),
          sl(
            'XSS baseado em DOM: fontes e sumidouros',
            'No XSS baseado em DOM, o próprio JavaScript do front-end lê dados controláveis (fontes) e os escreve em lugares perigosos (sumidouros), sem passar pelo servidor. Fontes: location (hash, search), document.referrer, window.name, postMessage, armazenamento. Sumidouros: innerHTML, outerHTML, document.write, eval, setTimeout com string, atributos de evento e href/src com URLs não validadas. Correção: usar textContent (insere texto, não HTML) e APIs que não interpretam código; validar esquemas de URL (só http/https).',
            '// Vulnerável\nelemento.innerHTML = new URLSearchParams(location.search).get(\'nome\');\n\n// Corrigido\nelemento.textContent = new URLSearchParams(location.search).get(\'nome\');'
          ),
          sl(
            'Sanitização e frameworks',
            'Quando você PRECISA aceitar HTML do usuário (editor de texto rico, comentários formatados), escapar tudo quebraria o recurso: use uma biblioteca de sanitização consolidada, como o DOMPurify, que remove o que é perigoso e mantém tags seguras. Nunca escreva sua própria lista de tags removidas com expressões regulares. Frameworks modernos (React, Vue, Angular) escapam por padrão ao interpolar texto; o risco volta nas saídas de emergência, como dangerouslySetInnerHTML (React), v-html (Vue) e bypassSecurityTrust* (Angular): use só com conteúdo já sanitizado, e revise essas ocorrências nas revisões de código.',
            '// React: o texto é escapado automaticamente\n<p>{comentario}</p>\n\n// Saída de emergência: só com HTML sanitizado\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />'
          ),
          sl(
            'CSP: política de segurança de conteúdo',
            'A CSP (Content-Security-Policy) é um cabeçalho que diz ao navegador de onde scripts e outros recursos podem vir, reduzindo o dano de um XSS que escapou. Diretivas principais: default-src (padrão para os tipos não listados), script-src (origens de scripts), object-src (plug-ins; use \'none\'), base-uri (impede injeção de <base>; use \'none\' ou \'self\'), frame-ancestors (quem pode embutir a página em iframe; defesa contra clickjacking). Nonces e hashes liberam scripts específicos sem abrir tudo: o servidor gera um nonce aleatório por resposta e o coloca no cabeçalho e na tag <script nonce="...">. \'strict-dynamic\' permite que um script confiável (com nonce) carregue outros. Um \'unsafe-inline\' em script-src ANULA a proteção, pois permite os scripts embutidos que o XSS injeta.',
            'Content-Security-Policy: default-src \'self\'; script-src \'nonce-R4yVMo708fdGVcDYAlifog\'; object-src \'none\'; base-uri \'none\'; frame-ancestors \'none\'\n\n<script nonce="R4yVMo708fdGVcDYAlifog">/* script legítimo */</script>\n<!-- script injetado sem o nonce é bloqueado pelo navegador -->'
          ),
          sl(
            'Implantar CSP com segurança; Trusted Types',
            'Introduza a CSP com Content-Security-Policy-Report-Only: o navegador não bloqueia, só reporta as violações (via report-to / report-uri) e você ajusta a política antes de aplicar. Gere um nonce novo e imprevisível por resposta (gerador criptográfico); nonce fixo não protege. Trusted Types é um recurso do navegador que, ativado pela CSP (require-trusted-types-for \'script\'), obriga que dados passados a sumidouros de DOM como innerHTML sejam objetos "confiáveis" criados por políticas do app, o que transforma XSS em DOM em erro detectável. Lembre-se: cookies HttpOnly limitam o dano de um XSS (o script não lê o cookie), mas não impedem que o script aja como o usuário; a prevenção continua sendo codificar e sanitizar.',
            'Content-Security-Policy-Report-Only: default-src \'self\'; script-src \'nonce-<aleatorio-por-resposta>\'; report-to csp-endpoint'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um valor do usuário é inserido dentro de href="..." em um link. Qual preocupação específica deste contexto vai além de escapar HTML?', 'b', [
          'Garantir que o valor tenha no máximo 255 caracteres e não contenha espaços no meio',
          'Validar o esquema da URL (apenas http/https), pois esquemas como javascript: executam código',
          'Colocar o valor em letras minúsculas antes de escrever',
          'Codificá-lo em Base64 antes de colocá-lo no atributo'
        ], 'No contexto de URL, o esquema importa: uma allowlist de esquemas (http, https) e a codificação adequada evitam executar código por link.'),
        mcq('q2', 'Qual trecho é um sumidouro perigoso de XSS baseado em DOM?', 'c', [
          'elemento.textContent = valorDigitadoPeloUsuario',
          'console.log(valor)',
          'elemento.innerHTML = location.hash.slice(1)',
          'elemento.setAttribute(\'data-id\', 123)'
        ], 'innerHTML interpreta HTML, e location.hash é controlado por quem fabrica o link. textContent trata o valor como texto.'),
        mcq('q3', 'Qual abordagem é adequada quando o produto precisa mesmo exibir HTML formatado enviado por usuários?', 'a', [
          'Sanitizar com uma biblioteca consolidada como o DOMPurify, antes de exibir',
          'Remover a palavra script com uma expressão regular escrita pela equipe',
          'Exibir o HTML original e depender apenas do cookie HttpOnly',
          'Converter o HTML em Base64 e confiar que o navegador o decodifica'
        ], 'Sanitização por biblioteca mantém tags seguras e remove o perigoso. Regex caseiras são contornáveis, e HttpOnly não impede o XSS.'),
        fill('q4', 'Complete: o método DOM que insere o valor como TEXTO, e não como HTML, evitando XSS, é ___.', 'elemento.___ = valorDoUsuario;', ['textContent', 'innerText'], 'textContent (ou innerText) trata o valor como texto puro, sem interpretar tags.'),
        mcq('q5', 'O que a diretiva object-src \'none\' faz em uma política CSP?', 'd', [
          'Proíbe o uso de objetos JavaScript literais em qualquer script da página',
          'Libera todos os recursos de qualquer origem, pois nenhum objeto é restrito',
          'Impede que a página seja exibida dentro de um iframe de outro site',
          'Bloqueia plug-ins e elementos como <object> e <embed>'
        ], 'object-src controla plug-ins (object, embed). O controle de iframes é de frame-ancestors.'),
        mcq('q6', 'Dado o cabeçalho: Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\'. Qual é a fraqueza principal?', 'b', [
          'default-src \'self\' bloqueia o carregamento de imagens e estilos do próprio site de origem',
          '\'unsafe-inline\' em script-src libera scripts embutidos, justamente o que um XSS injeta',
          'A política não tem nenhuma diretiva, então o navegador a ignora completamente e libera todos os recursos',
          'O valor \'self\' é inválido e faz o navegador liberar todas as origens'
        ], 'Com unsafe-inline, o script injetado executa. Prefira nonces ou hashes para os scripts embutidos legítimos.'),
        mcq('q7', 'Qual é a forma mais prudente de começar a usar uma CSP em um site existente?', 'c', [
          'Aplicar a política mais restritiva possível direto em produção e corrigir se houver reclamações',
          'Reutilizar um nonce fixo, o mesmo em todas as respostas, para simplificar o cache',
          'Usar Content-Security-Policy-Report-Only, analisar os relatórios e ajustar antes de aplicar',
          'Colocar \'unsafe-inline\' e \'unsafe-eval\' em todas as diretivas para evitar quebrar funcionalidades'
        ], 'O modo Report-Only coleta violações sem bloquear. O nonce deve ser novo e imprevisível a cada resposta.'),
        fill('q8', 'Complete a diretiva que define quais páginas podem embutir a sua em iframes (defesa contra clickjacking).', "Content-Security-Policy: ___ 'none'", ['frame-ancestors'], "frame-ancestors controla quem pode embutir a página. Com 'none', nenhum site (nem o próprio) pode.")
      ]
    },
    {
      id: 'owi-10-csrf-cors-cross-origin',
      title: 'CSRF, CORS e requisições entre origens',
      goal: 'Proteger ações do usuário contra requisições forjadas e configurar CORS sem abrir a porta errada.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'CSRF em profundidade: SameSite, tokens e Fetch Metadata',
            'No CSRF, um site malicioso faz o navegador da vítima enviar uma requisição ao seu app, e o navegador anexa os cookies de sessão automaticamente. Camadas de defesa: (1) SameSite nos cookies: Lax (padrão nos navegadores modernos quando o atributo não é informado) não envia o cookie em POSTs e subrecursos entre sites, mas ainda envia em navegações GET de topo, então GET não pode alterar estado; Strict nunca envia entre sites. Limite: "mesmo site" inclui subdomínios irmãos, então SameSite não protege contra um subdomínio comprometido. (2) Token anti-CSRF imprevisível, ligado à sessão, exigido em requisições que alteram estado. (3) Verificar o cabeçalho Origin (ou Referer) contra uma allowlist. (4) Fetch Metadata: o navegador envia Sec-Fetch-Site (same-origin, same-site, cross-site ou none); o servidor pode recusar requisições de mudança de estado com cross-site.',
            'POST /transferir HTTP/1.1\nHost: banco.example\nOrigin: https://banco.example\nSec-Fetch-Site: same-origin\nCookie: __Host-sid=<id>\nX-CSRF-Token: <token-da-sessao>'
          ),
          sl(
            'CORS: simples vs preflight',
            'CORS (Cross-Origin Resource Sharing) não é uma defesa: é um mecanismo para RELAXAR a política de mesma origem, que por padrão impede que um site leia respostas de outra origem. Requisições simples (GET, HEAD ou POST com Content-Type form-urlencoded, multipart/form-data ou text/plain, sem cabeçalhos personalizados) são enviadas direto e o navegador decide se o script pode ler a resposta. As demais (PUT, DELETE, cabeçalhos como Authorization, Content-Type: application/json) disparam antes um preflight: uma requisição OPTIONS perguntando se a real é permitida. O servidor responde com os cabeçalhos Access-Control-Allow-*.',
            'OPTIONS /api/dados HTTP/1.1\nOrigin: https://app.example\nAccess-Control-Request-Method: PUT\nAccess-Control-Request-Headers: content-type\n\nHTTP/1.1 204\nAccess-Control-Allow-Origin: https://app.example\nAccess-Control-Allow-Methods: GET, PUT\nAccess-Control-Allow-Headers: content-type\nAccess-Control-Allow-Credentials: true\nVary: Origin'
          ),
          sl(
            'Erros de configuração de CORS',
            'Erros típicos: (1) refletir o cabeçalho Origin recebido no Access-Control-Allow-Origin junto de Allow-Credentials: true: na prática qualquer site passa a ler dados autenticados do usuário; (2) usar * com credenciais: o navegador rejeita essa combinação (é inválida), e * serve só para conteúdo público sem cookies; (3) permitir a origem "null" (enviada por iframes em sandbox e arquivos locais), que o atacante consegue forjar; (4) validar por sufixo ou prefixo ("termina com exemplo.test"), que aceita domínios do atacante parecidos; (5) esquecer Vary: Origin quando a resposta varia por origem. Use uma allowlist de origens EXATAS.'
          ),
          sl(
            'CORS não protege o servidor; CSRF em APIs JSON',
            'CORS só instrui o NAVEGADOR sobre o que scripts de outras origens podem ler: qualquer cliente fora do navegador (script, curl) ignora CORS e fala direto com o servidor. Mesmo uma requisição bloqueada por CORS chega ao servidor (no caso de requisições simples), então o servidor ainda precisa autenticar, autorizar e tratar CSRF. Em APIs JSON, exigir Content-Type: application/json faz o navegador usar preflight, mas isso sozinho não é garantia: valide o Content-Type de fato, use SameSite, tokens ou Origin/Sec-Fetch-Site, e prefira autenticação por cabeçalho Authorization (não enviado automaticamente pelo navegador) quando cabível.'
          ),
          sl(
            'Clickjacking e WebSocket',
            'Clickjacking: o atacante embute o seu site num iframe invisível sobre um botão atraente, e o usuário clica sem saber. Defesa: Content-Security-Policy: frame-ancestors (\'none\' ou \'self\' ou uma lista de origens permitidas); o antigo X-Frame-Options (DENY/SAMEORIGIN) ainda é usado por compatibilidade. WebSocket: o handshake inicial é um GET que não passa por CORS e carrega os cookies, então um site malicioso pode abrir uma conexão autenticada (CSWSH, Cross-Site WebSocket Hijacking). O servidor deve verificar o cabeçalho Origin no handshake contra uma allowlist e autenticar a conexão (token, não só cookie).'
          ),
          sl(
            'Verificação de Origin com allowlist (saída real)',
            'Comparação por igualdade exata com um conjunto de origens permitidas, sem expressões regulares frouxas. Origens parecidas, com esquema ou porta diferente, ou o valor "null" são recusadas. A ausência do cabeçalho (comum em ferramentas, não em navegadores para requisições entre origens) deve ser tratada conforme a regra do app: para mudança de estado, recuse ou exija outro mecanismo.',
            'ALLOW = {\'https://app.exemplo.test\', \'https://admin.exemplo.test\'}\ndef origin_ok(h): return h in ALLOW\n\n# \'https://app.exemplo.test\'             True\n# \'https://app.exemplo.test.evil.test\'   False\n# \'http://app.exemplo.test\'              False\n# \'null\'                                 False\n# None                                   False\n# \'https://app.exemplo.test:8443\'        False'
          )
        ]
      },
      questions: [
        mcq('q1', 'Com cookies SameSite=Lax, qual requisição entre sites AINDA envia o cookie?', 'c', [
          'Um POST de formulário enviado automaticamente por outro site',
          'Uma requisição fetch com credenciais feita de outro site para carregar JSON',
          'Uma navegação de topo por link (GET) vinda de outro site',
          'Uma imagem carregada por uma tag img em outro site qualquer'
        ], 'Lax permite o cookie em navegações GET de topo entre sites. Por isso GET não deve alterar estado.'),
        mcq('q2', 'Um site de ataque hospedado em atacante.test quer ler a resposta de uma API autenticada em api.exemplo.test via fetch no navegador da vítima. O que decide se o script consegue ler a resposta?', 'b', [
          'O tamanho da resposta, que precisa ser pequeno para o navegador permitir a leitura entre origens',
          'Os cabeçalhos CORS da resposta, como Access-Control-Allow-Origin, avaliados pelo navegador',
          'O idioma configurado no navegador da vítima',
          'O número de cookies que o domínio da API definiu'
        ], 'A política de mesma origem bloqueia a leitura, a menos que o servidor autorize a origem do site via CORS. Esse controle é do navegador.'),
        mcq('q3', 'Qual configuração de CORS é inválida e rejeitada pelos navegadores?', 'a', [
          'Access-Control-Allow-Origin: * junto de Access-Control-Allow-Credentials: true',
          'Access-Control-Allow-Origin: https://app.exemplo.test combinado com Vary: Origin na resposta',
          'Access-Control-Allow-Methods: GET, POST em uma resposta de preflight',
          'Access-Control-Allow-Headers: content-type em uma resposta de preflight bem-sucedida do servidor'
        ], 'O curinga * não é aceito quando a requisição usa credenciais; a origem precisa ser explícita. As outras opções são formas válidas.'),
        fill('q4', 'Complete: antes de uma requisição PUT com JSON entre origens, o navegador envia uma requisição de verificação com o método ___ (preflight).', 'Preflight: método ___', ['OPTIONS'], 'O preflight é uma requisição OPTIONS que pergunta ao servidor se o método e os cabeçalhos da requisição real são permitidos.'),
        mcq('q5', 'O servidor devolve Access-Control-Allow-Origin com o mesmo valor do cabeçalho Origin recebido, mais Allow-Credentials: true, sem checar nada. Qual o efeito?', 'd', [
          'Nenhum efeito: o navegador ignora o cabeçalho quando o valor vem do próprio Origin',
          'Só ferramentas de linha de comando conseguem ler os dados',
          'Somente o site oficial consegue ler a resposta, pois o Origin é verificado pelo navegador em seguida',
          'Qualquer site visitado pelo usuário logado lê respostas autenticadas; corrija com allowlist de origens exatas'
        ], 'Refletir a origem com credenciais equivale a liberar todos os sites. Valide contra uma lista fechada de origens exatas.'),
        mcq('q6', 'Um desenvolvedor afirma: "Configurei CORS só para o nosso front, então ninguém mais consegue chamar a API." Qual é o erro?', 'b', [
          'CORS bloqueia o front-end oficial em vez de bloquear terceiros, porque o navegador aplica a regra no sentido inverso ao esperado',
          'CORS só instrui o navegador; scripts e ferramentas fora dele ignoram CORS, então a API precisa de autenticação e autorização',
          'CORS só funciona com WebSocket e é ignorado para chamadas HTTP comuns',
          'CORS exige que a API fique sem autenticação para funcionar'
        ], 'CORS não é controle de acesso do servidor. Ele não impede clientes que não sejam navegadores.'),
        mcq('q7', 'Como defender um endpoint WebSocket contra o sequestro entre sites (CSWSH)?', 'c', [
          'Aceitar qualquer conexão, pois o WebSocket não usa cookies',
          'Configurar Access-Control-Allow-Origin no handshake, já que o navegador impõe CORS também no WebSocket',
          'Verificar o cabeçalho Origin do handshake contra uma allowlist e autenticar a conexão com um token',
          'Usar apenas portas altas, que os navegadores não conseguem alcançar a partir de páginas de outros sites'
        ], 'O handshake do WebSocket não é limitado por CORS e carrega cookies; a verificação de Origin e uma autenticação explícita fecham a brecha.'),
        fill('q8', 'Complete o valor do cabeçalho de Fetch Metadata que indica uma requisição vinda de outro site.', 'Sec-Fetch-Site: ___', ['cross-site'], 'Sec-Fetch-Site pode ser same-origin, same-site, cross-site ou none. Requisições de mudança de estado cross-site costumam ser recusadas.')
      ]
    },
    {
      id: 'owi-11-same-origin-isolamento',
      title: 'Política de mesma origem e isolamento do navegador',
      goal: 'Entender origem, site e os mecanismos de isolamento (SOP, COOP/COEP/CORP, sandbox, postMessage).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Origem, site e a SOP',
            'Origem = esquema + host + porta. https://app.exemplo.test e http://app.exemplo.test são origens diferentes (esquema), assim como https://app.exemplo.test e https://app.exemplo.test:8443 (porta) e https://api.exemplo.test (host). A política de mesma origem (SOP) impede que scripts de uma origem LEIAM dados de outra: não leem a resposta de fetch/XHR, nem o conteúdo de um iframe de outra origem. Ela não bloqueia o ENVIO de requisições (por isso existe CSRF) nem o carregamento de recursos como scripts e imagens. Site é um conceito mais largo, usado por cookies SameSite: o domínio registrável (exemplo.test) mais o esquema, de modo que app.exemplo.test e api.exemplo.test são o mesmo site, mas origens diferentes.',
            'https://app.exemplo.test/a  vs  https://app.exemplo.test/b     -> mesma origem\nhttps://app.exemplo.test    vs  http://app.exemplo.test         -> esquema diferente\nhttps://app.exemplo.test    vs  https://api.exemplo.test        -> host diferente (mesmo site)'
          ),
          sl(
            'Isolamento de sites e processos; COOP, COEP e CORP',
            'Navegadores modernos isolam sites em processos diferentes, o que limita o dano de falhas como as de canal lateral de CPU (família Spectre), em que um código lê dados que não deveria por medição de tempo. Para páginas que precisam de recursos poderosos (como SharedArrayBuffer e temporizadores precisos) o navegador exige "isolamento entre origens" (cross-origin isolation), obtido com cabeçalhos: COOP (Cross-Origin-Opener-Policy: same-origin) separa a sua janela de janelas abertas de outras origens; COEP (Cross-Origin-Embedder-Policy: require-corp) só deixa embutir recursos que autorizem; CORP (Cross-Origin-Resource-Policy: same-origin, same-site ou cross-origin) é a forma de um recurso dizer quem pode carregá-lo. Para a maioria dos apps, o ganho é defesa em profundidade contra vazamentos entre janelas e canais laterais.',
            'Cross-Origin-Opener-Policy: same-origin\nCross-Origin-Embedder-Policy: require-corp\nCross-Origin-Resource-Policy: same-origin'
          ),
          sl(
            'iframe sandbox e Sec-Fetch-*',
            'O atributo sandbox do iframe tira poderes do conteúdo embutido: sem scripts, sem formulários, sem navegação do topo, tratando a origem como única ("opaca"). Você devolve só o necessário com tokens como allow-scripts, allow-forms. Cuidado: allow-scripts junto de allow-same-origin num conteúdo da MESMA origem da página permite que o script remova o próprio sandbox, anulando a proteção. Os cabeçalhos Sec-Fetch-* (Site, Mode, Dest, User), enviados pelo navegador e não alteráveis por scripts, informam ao servidor o contexto da requisição (de onde veio, para que serve), permitindo políticas como "recuse requisições cross-site que alteram estado".',
            '<iframe src="https://usercontent.exemplo-cdn.test/doc/123" sandbox="allow-scripts" loading="lazy"></iframe>\n\nSec-Fetch-Site: cross-site\nSec-Fetch-Mode: navigate\nSec-Fetch-Dest: iframe'
          ),
          sl(
            'Subdomínios: cookie tossing, takeover e document.domain',
            'Subdomínios do mesmo site se confiam mais do que parece. Cookie tossing: um subdomínio sob controle de terceiros (ou comprometido) grava um cookie para o domínio pai, que sobrescreve ou concorre com o cookie legítimo; o prefixo __Host- impede isso para cookies críticos. Takeover de subdomínio: um registro DNS (CNAME) aponta para um serviço externo já desativado; quem registrar aquele recurso passa a servir conteúdo sob o seu domínio. Defesa: inventariar DNS e remover registros órfãos. document.domain era um jeito de afrouxar a SOP entre subdomínios; está obsoleto e deve ser evitado (prefira postMessage).'
          ),
          sl(
            'postMessage seguro',
            'window.postMessage permite que janelas de origens diferentes conversem. Dois lados, duas verificações. Ao ENVIAR, informe o targetOrigin exato (nunca "*" quando a mensagem tem dados sensíveis), para que o navegador só entregue ao destino certo. Ao RECEBER, no listener, confira event.origin contra uma allowlist antes de usar event.data, e trate os dados como entrada não confiável (valide formato; não passe a innerHTML/eval). Sem a checagem, qualquer página que consiga abrir ou embutir a sua pode enviar comandos ao seu script.',
            '// Receber\nwindow.addEventListener(\'message\', (event) => {\n  if (event.origin !== \'https://app.exemplo.test\') return;   // verifica origem\n  if (typeof event.data?.tipo !== \'string\') return;           // valida formato\n  tratar(event.data);\n});\n\n// Enviar\njanela.postMessage({ tipo: \'ping\' }, \'https://app.exemplo.test\');   // targetOrigin exato'
          ),
          sl(
            'Conteúdo de usuário em domínio separado',
            'Páginas enviadas por usuários (HTML, SVG, relatórios, uploads) podem conter scripts. Se forem servidas na mesma origem do app, um XSS ali tem acesso a cookies e APIs do app. Sirva conteúdo de usuário a partir de um domínio SEPARADO e sem cookies da aplicação (por exemplo, um domínio registrável distinto, não apenas um subdomínio, pois subdomínios compartilham o mesmo site), combine com CSP, Content-Disposition: attachment e X-Content-Type-Options: nosniff. Assim a SOP trabalha a seu favor: o conteúdo não consegue ler nada do app.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Quais pares de URLs têm a MESMA origem?', 'd', [
          'https://app.exemplo.test e http://app.exemplo.test',
          'https://app.exemplo.test/a e https://app.exemplo.test:8443/',
          'https://app.exemplo.test e https://api.exemplo.test',
          'https://app.exemplo.test/a e https://app.exemplo.test/b?x=1'
        ], 'Origem = esquema + host + porta. Caminho e consulta não contam. Os demais pares diferem em esquema, porta ou host.'),
        mcq('q2', 'O que a política de mesma origem (SOP) impede por padrão?', 'a', [
          'Que scripts de uma origem leiam a resposta de requisições a outra origem',
          'Que qualquer requisição seja enviada a outra origem, inclusive envios de formulário',
          'Que imagens e scripts de outras origens sejam carregados na página, mesmo sem autorização',
          'Que o servidor receba cookies em requisições entre sites'
        ], 'A SOP bloqueia a LEITURA entre origens, não o envio de requisições nem o carregamento de recursos, razão pela qual CSRF existe.'),
        mcq('q3', 'app.exemplo.test e api.exemplo.test são, ao mesmo tempo:', 'c', [
          'A mesma origem e o mesmo site',
          'Origens diferentes e sites diferentes',
          'Origens diferentes, mas o mesmo site',
          'A mesma origem, mas sites diferentes'
        ], 'O host difere (origens diferentes), mas o domínio registrável é o mesmo (mesmo site), o que importa para cookies SameSite.'),
        fill('q4', 'Complete o cabeçalho que isola a janela da página de janelas de outras origens que a abriram.', 'Cross-Origin-___-Policy: same-origin', ['Opener', 'COOP'], 'COOP (Cross-Origin-Opener-Policy) separa o contexto de navegação da página dos de outras origens, apoiando o isolamento.'),
        mcq('q5', 'Qual é o uso correto do postMessage ao receber mensagens?', 'b', [
          'Executar o conteúdo de event.data com eval para suportar comandos dinâmicos',
          'Sempre verificar event.origin contra uma allowlist e validar o formato de event.data',
          'Aceitar mensagens de qualquer origem para facilitar a integração futura',
          'Confiar em event.source e ignorar event.origin, por ser mais curto de escrever e de manter'
        ], 'Sem checar a origem, qualquer página capaz de abrir ou embutir a sua envia comandos ao script. Valide também o conteúdo.'),
        mcq('q6', 'Qual configuração enfraquece o atributo sandbox de um iframe com conteúdo da mesma origem da página?', 'd', [
          'sandbox sem nenhum token adicional definido',
          'sandbox="allow-forms"',
          'sandbox="allow-downloads"',
          'sandbox="allow-scripts allow-same-origin"'
        ], 'Com os dois tokens, o script do iframe da mesma origem pode remover o próprio sandbox, anulando a proteção.'),
        mcq('q7', 'Por que servir uploads de usuários em um domínio registrável separado, sem cookies da aplicação, ajuda?', 'a', [
          'Porque scripts desse conteúdo ficam em outra origem e site, sem acesso a cookies e APIs do app',
          'Porque o navegador deixa de executar scripts em domínios diferentes do principal, por padrão',
          'Porque o uso de HTTPS fica desnecessário para o conteúdo de usuários',
          'Porque o servidor principal passa a poder ignorar a validação de uploads'
        ], 'A SOP e o isolamento de cookies impedem que conteúdo ativo de usuário leia o app. A validação de uploads continua necessária.'),
        fill('q8', 'Complete: o problema em que um registro DNS aponta para um serviço externo desativado, permitindo que terceiros sirvam conteúdo sob o seu domínio, é o ___ de subdomínio.', '___ de subdomínio (CNAME órfão)', ['takeover', 'sequestro', 'tomada'], 'Takeover de subdomínio acontece com registros DNS órfãos; a defesa é inventariar e remover entradas que apontam para serviços desativados.')
      ]
    },
    {
      id: 'owi-12-desserializacao-integridade',
      title: 'Desserialização insegura e falhas de integridade',
      goal: 'Evitar desserializar dados não confiáveis em formatos que reconstroem objetos e verificar a integridade de dados e atualizações.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que desserializar dados não confiáveis é perigoso',
            'Serializar é transformar objetos em bytes; desserializar é reconstruí-los. Alguns formatos (Java serialization/ObjectInputStream, PHP unserialize, Python pickle, .NET BinaryFormatter) reconstroem OBJETOS arbitrários e podem chamar código durante a reconstrução. Quem controla os bytes controla quais objetos nascem e, em alguns casos, que código roda: é execução de código no servidor, ou seja, um dos piores impactos. Em outros casos o efeito é menor (alterar um campo, negação de serviço), mas a regra é a mesma: nunca reconstrua objetos a partir de dados que um não confiável possa alterar (cookies, parâmetros, uploads, mensagens de filas expostas).'
          ),
          sl(
            'Gadget chains (visão geral)',
            'Um "gadget" é um trecho de código legítimo que já existe na aplicação ou em suas bibliotecas e que faz algo perigoso quando certos métodos são chamados automaticamente na desserialização. Uma "gadget chain" encadeia vários gadgets até um efeito sério. Por isso o risco depende também das bibliotecas no classpath: atualizar dependências ajuda, mas a defesa sólida é não desserializar entrada não confiável em formatos que reconstroem objetos. Aqui basta o conceito; os detalhes de construção de cadeias reais não são necessários para se defender.'
          ),
          sl(
            'Laboratório: JSON só cria dados; pickle executa',
            'Em laboratório local, com uma carga INOFENSIVA (apenas imprime uma mensagem), vemos a diferença: json.loads produz somente dicionários, listas, números e textos, enquanto pickle.loads chama a função indicada pelo objeto durante a leitura. AVISO da documentação do Python: nunca faça unpickle de dados que podem ter vindo de fonte não confiável ou ter sido adulterados. Não execute pickle de origem desconhecida nem em máquinas importantes.',
            'import json, pickle\n\nprint(json.loads(\'{"nome":"ana","__reduce__":"x"}\'))   # só dados\n# {\'nome\': \'ana\', \'__reduce__\': \'x\'}\n\nclass Inofensivo:\n    def __reduce__(self):\n        return (print, (\'>>> codigo executado durante o pickle.loads\',))\n\nblob = pickle.dumps(Inofensivo())\nprint(\'carregando pickle...\')\npickle.loads(blob)\n# carregando pickle...\n# >>> codigo executado durante o pickle.loads\n# (a carga rodou só porque lemos o pickle: era um print, poderia ser qualquer função)'
          ),
          sl(
            'Defesas: formato puro, esquema, assinatura e privilégio mínimo',
            'Defesas combináveis: (1) prefira formatos de dados puros (JSON, Protocol Buffers) que não instanciam classes arbitrárias; (2) valide o resultado com um esquema (tipos, tamanhos, campos permitidos), recusando campos extras; (3) se precisar de objetos, use allowlist de tipos permitidos (o desserializador só instancia classes da lista); (4) proteja a integridade com assinatura/HMAC calculada no servidor, verificada ANTES de desserializar (o cliente não consegue forjar sem a chave); (5) isole e use privilégio mínimo para o processo que desserializa, para limitar o dano se algo escapar; (6) em JavaScript, cuidado com mesclas recursivas de objetos que aceitam chaves como __proto__ (poluição de protótipo): valide chaves e use estruturas sem protótipo quando adequado.',
            'import hmac, hashlib\n\ndef assinar(dados: bytes, chave: bytes) -> str:\n    return hmac.new(chave, dados, hashlib.sha256).hexdigest()\n\ndef carregar(dados: bytes, tag: str, chave: bytes):\n    if not hmac.compare_digest(assinar(dados, chave), tag):\n        raise ValueError(\'integridade violada\')   # antes de qualquer parse\n    return json.loads(dados)'
          ),
          sl(
            'Integridade de atualizações, pipelines e SRI',
            'Integridade também vale para software: baixar e executar código sem verificar é confiar na rede inteira. Verifique assinaturas ou checksums de pacotes e artefatos (bloqueie versões com lockfiles e hashes), assine releases, proteja o CI/CD (acesso restrito, segredos fora do repositório, revisão de mudanças em pipelines, builds reproduzíveis quando possível). No front-end, SRI (Subresource Integrity) permite que o navegador confira o hash de um script ou CSS de um CDN: se o arquivo mudar, não é executado. Atualizações automáticas de clientes devem ser assinadas e verificadas antes da instalação.',
            '<script src="https://cdn.exemplo-cdn.test/lib.min.js"\n        integrity="sha384-<hash-base64-do-arquivo>"\n        crossorigin="anonymous"></script>'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual par de formato/risco está correto?', 'b', [
          'JSON puro permite executar código na leitura porque aceita funções',
          'Python pickle pode chamar código arbitrário ao ler bytes não confiáveis',
          'CSV puro reconstrói objetos Java e executa métodos de construção',
          'Texto simples UTF-8 invoca o desserializador do sistema operacional'
        ], 'Pickle (assim como Java serialization, PHP unserialize e .NET BinaryFormatter) reconstrói objetos e pode executar código. JSON puro só cria dados.'),
        mcq('q2', 'O que é uma gadget chain no contexto de desserialização?', 'd', [
          'Um servidor de proxy que encadeia várias conexões TLS',
          'Uma lista de dependências desatualizadas encontrada por uma ferramenta de análise de composição',
          'Um conjunto de permissões de nuvem mal configuradas',
          'Trechos de código legítimos da própria aplicação que, acionados na desserialização, produzem um efeito perigoso'
        ], 'Gadgets são códigos já existentes no classpath; encadeados, chegam a efeitos sérios. A defesa é não desserializar entrada não confiável nesses formatos.'),
        mcq('q3', 'Uma aplicação grava o carrinho de compras em um cookie, em formato serializado que reconstrói objetos. Qual alternativa é a melhor correção?', 'a', [
          'Guardar só dados puros (por exemplo JSON validado por esquema) com HMAC, ou manter o carrinho no servidor',
          'Codificar o objeto serializado em Base64 para que o usuário comum não consiga ler nem alterar o conteúdo do cookie',
          'Manter o formato e adicionar uma mensagem avisando o usuário para não editar manualmente o cookie do carrinho',
          'Reduzir o tamanho do cookie para dificultar manipulações'
        ], 'Base64 é reversível; avisos não protegem. Dados puros, esquema e HMAC (ou estado no servidor) removem o vetor.'),
        fill('q4', 'Complete: para garantir a integridade dos dados recebidos do cliente, o servidor confere uma assinatura ___ calculada com uma chave secreta antes de desserializar.', 'tag = ___(chave, dados, sha256)  # assinatura com chave secreta', ['HMAC'], 'HMAC combina hash e chave secreta: o cliente não consegue forjar uma tag válida sem a chave.'),
        mcq('q5', 'Qual a ordem correta ao receber dados assinados?', 'c', [
          'Desserializar, usar os campos e só depois conferir a assinatura',
          'Conferir a assinatura apenas se o desserializador lançar erro',
          'Verificar a assinatura sempre antes de interpretar os dados',
          'Ignorar a assinatura quando a conexão é HTTPS, pois o canal já é protegido'
        ], 'A verificação de integridade precisa vir antes de interpretar o conteúdo; HTTPS protege o trânsito, não a adulteração do dado guardado no cliente.'),
        mcq('q6', 'Para que serve o atributo integrity (SRI) em uma tag script que carrega um arquivo de CDN?', 'b', [
          'Para criptografar o arquivo durante o download',
          'Para o navegador conferir o hash do arquivo e se recusar a executá-lo se ele tiver mudado',
          'Para acelerar o carregamento usando o cache do servidor',
          'Para impedir que o script carregado acesse os cookies e o armazenamento da página'
        ], 'SRI compara o hash do recurso com o declarado; se o CDN for comprometido ou o arquivo alterado, o navegador bloqueia.'),
        mcq('q7', 'Qual prática protege melhor o pipeline de CI/CD e as dependências?', 'd', [
          'Instalar sempre a versão mais recente de todos os pacotes, sem fixar versões',
          'Baixar scripts da internet e executá-los direto no build para ganhar velocidade e simplificar o pipeline, sem conferir a origem',
          'Compartilhar um token de deploy no repositório para todos os colaboradores',
          'Fixar dependências com lockfile e hashes, verificar assinaturas, restringir quem altera o pipeline e proteger segredos'
        ], 'Controles de integridade de cadeia de suprimentos incluem lockfiles com hash, verificação de assinatura, revisão de mudanças no pipeline e gestão de segredos.'),
        fill('q8', 'Complete o formato de dados puro, que só cria dicionários, listas, números e textos, recomendado no lugar de formatos que reconstroem objetos.', 'dados = ___.loads(entrada)  # em vez de pickle.loads', ['json'], 'JSON não instancia classes arbitrárias; combinado com validação de esquema, é a escolha segura para dados não confiáveis.')
      ]
    },
    {
      id: 'owi-13-xxe-parsers',
      title: 'XXE e parsers XML/JSON',
      goal: 'Configurar parsers com segurança (XML, YAML, JSON) e evitar injeção de fórmulas em planilhas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'XML, entidades e XXE',
            'XML permite declarar entidades em uma DTD (Document Type Definition): atalhos que o parser substitui pelo conteúdo. Uma entidade EXTERNA aponta para fora do documento (um arquivo local ou uma URL). XXE (XML External Entity) ocorre quando um parser mal configurado processa entidades externas vindas de entrada não confiável: o servidor pode incluir o conteúdo de um arquivo local na resposta, ou fazer requisições de rede em nome do atacante (um caminho para SSRF). O impacto é vazamento de arquivos e acesso a serviços internos. Em laboratório local, você reconhece a declaração apenas pela forma: uma linha <!ENTITY nome SYSTEM "...">; o objetivo aqui é saber detectar e desabilitar.',
            '<!-- Reconhecer: DTD com entidade externa (forma do padrão, só para identificar) -->\n<!DOCTYPE doc [ <!ENTITY x SYSTEM "<caminho-ou-url>"> ]>\n<doc>&x;</doc>'
          ),
          sl(
            'Billion laughs e outras explosões',
            'O "billion laughs" é um ataque de negação de serviço com entidades internas aninhadas: cada entidade referencia a anterior várias vezes, e um documento minúsculo se expande para gigabytes na memória. Não precisa de entidade externa. Defesas: desabilitar DTD por completo quando o formato não precisa dela, limitar tamanho do documento, profundidade e quantidade de expansões, e usar timeouts. Um parser que "só lê XML" pode ser derrubado por uma entrada de poucas centenas de bytes se o limite de expansão não existir.'
          ),
          sl(
            'Defesas para XML',
            'Regra principal: desabilite DTDs e entidades externas no parser. Em Python use a biblioteca defusedxml, que substitui os parsers padrão por versões seguras (defusedxml.ElementTree.fromstring em vez de xml.etree). Em Java, desabilite DOCTYPE no factory (feature "http://apache.org/xml/features/disallow-doctype-decl" = true). Em lxml, resolve_entities=False e no_network=True. Além disso: limite o tamanho do corpo antes de ler, valide contra um esquema (XSD) e prefira JSON quando não precisar de XML. Lembre-se de que SOAP e vários formatos de arquivos são XML: DOCX, XLSX e SVG são pacotes ou documentos XML, então um upload e importador desses formatos herda o risco de XXE.',
            '# Vulnerável (conceito): parser com DTD/entidades habilitadas processando entrada externa\n# Seguro:\nfrom defusedxml.ElementTree import fromstring   # pip install defusedxml\nraiz = fromstring(dados_xml)   # recusa DTD/entidades perigosas'
          ),
          sl(
            'Limite de tamanho e esquema (saída real)',
            'Limitar o tamanho ANTES de interpretar protege contra entradas enormes em qualquer formato. A demonstração abaixo usa xml.etree com entrada fictícia inofensiva: um documento pequeno é aceito, e um de 2 MB é recusado pelo limite de 1 MB. Isso não substitui desabilitar DTD (use defusedxml), mas é uma camada barata e geral.',
            'MAX = 1_000_000\ndef parse(data):\n    if len(data) > MAX: raise ValueError(\'muito grande\')\n    return ET.fromstring(data)\n\nprint(parse(b\'<a><b>1</b></a>\').find(\'b\').text)   # 1\nparse(b\'<a>\' + b\'x\' * 2_000_000 + b\'</a>\')        # ValueError: muito grande'
          ),
          sl(
            'YAML inseguro e JSON: chaves duplicadas e números',
            'YAML em Python: yaml.load com o carregador padrão antigo ou "unsafe" pode construir objetos Python arbitrários a partir de tags especiais, com risco de execução de código (mesma família da desserialização insegura). Use sempre yaml.safe_load para dados não confiáveis, que cria só tipos básicos. JSON tem armadilhas de interpretação: chaves duplicadas ({"a":1,"a":2}) são resolvidas de formas diferentes por parsers diferentes (primeira ou última vence), o que pode fazer um validador e um consumidor enxergarem valores diferentes; números muito grandes perdem precisão em JavaScript (acima de 9007199254740991, Number.MAX_SAFE_INTEGER), então IDs grandes devem trafegar como texto; aninhamento profundo pode esgotar a pilha. Limite tamanho e profundidade e valide o esquema.',
            'import yaml\ndados = yaml.safe_load(texto)    # só tipos básicos: dict, list, str, int...\n# evite: yaml.load(texto) com carregadores que criam objetos arbitrários'
          ),
          sl(
            'CSV injection (fórmulas em planilhas)',
            'Quando o app exporta dados de usuários para CSV/XLSX, uma célula que começa com =, +, - ou @ pode ser interpretada como FÓRMULA pelo programa de planilha e, em alguns casos, disparar ações ou vazar dados quando um funcionário abre o arquivo. Mitigações na exportação: se o valor começa com esses caracteres, prefixar com uma aspa simples (\') ou outro marcador que force texto, escapar aspas e tratar como texto; documentar que arquivos de origem desconhecida não devem ser abertos às cegas. A validação de entrada ajuda, mas a defesa mais confiável é a neutralização na saída.',
            'def seguro_para_planilha(valor: str) -> str:\n    if valor[:1] in (\'=\', \'+\', \'-\', \'@\'):\n        return "\'" + valor\n    return valor'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é XXE?', 'c', [
          'Uma extensão do HTTPS que criptografa documentos XML',
          'Um tipo de injeção de SQL que ocorre apenas em bancos de documentos',
          'Uma falha em que um parser XML processa entidades externas vindas de entrada não confiável, podendo ler arquivos ou fazer requisições',
          'Um protocolo de autenticação baseado em certificados XML'
        ], 'XXE (XML External Entity) explora parsers que resolvem entidades externas. A defesa é desabilitar DTD e entidades externas.'),
        mcq('q2', 'Qual é o efeito do "billion laughs"?', 'a', [
          'Negação de serviço: entidades aninhadas fazem um documento pequeno consumir muita memória',
          'Roubo de cookies de sessão pela interface do navegador quando o XML é exibido na página',
          'Troca do certificado TLS do servidor por outro falso',
          'Injeção de comandos do sistema operacional pelo nome de arquivo'
        ], 'É uma explosão de entidades internas aninhadas. Desabilitar DTD e limitar expansão, tamanho e tempo mitigam.'),
        mcq('q3', 'Qual é a defesa mais direta contra XXE em Python?', 'd', [
          'Converter o XML para texto e processar o conteúdo com expressões regulares escritas pela equipe',
          'Aumentar o tempo limite da conexão do servidor',
          'Trocar o nome das tags para valores aleatórios antes de processar',
          'Usar sempre defusedxml (ou parser com DTD e entidades externas desabilitados) e limitar o tamanho'
        ], 'defusedxml recusa DTD e entidades perigosas. Regex em XML é frágil e não resolve o problema.'),
        fill('q4', 'Complete: para ler YAML não confiável em Python, use yaml.___, que cria apenas tipos básicos.', 'dados = yaml.___(texto)', ['safe_load'], 'safe_load constrói somente tipos simples; carregadores sem restrição podem instanciar objetos arbitrários.'),
        mcq('q5', 'Um arquivo DOCX enviado por um usuário é processado pelo servidor. Por que isso exige cuidado com XXE?', 'b', [
          'Porque DOCX é um formato binário opaco que o Python não consegue ler sem bibliotecas externas',
          'Porque DOCX é um pacote de arquivos XML e o importador pode usar um parser vulnerável',
          'Porque DOCX sempre contém macros que o servidor executa automaticamente ao abrir o documento',
          'Porque DOCX usa criptografia que exige senha para abrir'
        ], 'DOCX, XLSX e SVG são XML (ou pacotes de XML). Importadores precisam usar parsers com DTD e entidades externas desabilitados.'),
        mcq('q6', 'Dois componentes leem o JSON {"papel":"user","papel":"admin"}: o validador pega o primeiro valor e o consumidor pega o último. Qual o risco?', 'c', [
          'Nenhum, pois chaves duplicadas são proibidas pela especificação e sempre rejeitadas por todos os parsers',
          'O JSON fica maior, e só o consumo de banda aumenta',
          'Um valor passa na validação e outro é usado de fato; rejeite chaves duplicadas ou use um único parser',
          'O servidor reinicia automaticamente por causa do erro de sintaxe no JSON e perde todas as conexões ativas dos usuários'
        ], 'Diferenças entre parsers permitem burlar validações. Rejeite duplicatas e valide e consuma os mesmos dados já interpretados.'),
        mcq('q7', 'Uma exportação CSV de comentários de usuários contém uma célula começando com "=". Qual é o risco e a mitigação?', 'd', [
          'Nenhum, pois CSV é texto simples e programas de planilha nunca interpretam fórmulas',
          'O arquivo fica corrompido; a mitigação é compactá-lo em ZIP',
          'O risco é só visual; a mitigação é trocar a cor da célula',
          'A célula pode virar fórmula na planilha; neutralize valores que começam com =, +, - ou @'
        ], 'A injeção de fórmulas é neutralizada na saída, forçando a célula a ser tratada como texto.'),
        fill('q8', 'Complete: IDs numéricos maiores que 9007199254740991 perdem precisão em JavaScript; por isso devem trafegar como ___.', '{"id": "9007199254740993"}   // o tipo JSON deste valor é ___', ['texto', 'string', 'strings', 'cadeia'], 'Acima de Number.MAX_SAFE_INTEGER, o JavaScript não representa todos os inteiros com exatidão; enviar o ID como string evita erros e colisões.')
      ]
    },
    {
      id: 'owi-14-ssrf-profundidade',
      title: 'SSRF em profundidade',
      goal: 'Defender recursos de importação de URL e webhooks com validação robusta, egress e privilégio mínimo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é SSRF e onde aparece',
            'Em SSRF (Server-Side Request Forgery), o app faz uma requisição a um endereço escolhido pelo usuário, e o atacante usa o servidor como ponte para alcançar o que ele sozinho não alcança: serviços internos, painéis, o serviço de metadados da nuvem. Aparece em importadores de URL, pré-visualização de links, webhooks, conversores de PDF/imagem, integrações e downloads de avatar. SSRF cego: o app faz a requisição mas não devolve a resposta; ainda assim há impacto (ações em serviços internos, varredura por tempo de resposta). Em laboratório próprio, a meta é construir o validador e a rede que impedem esses caminhos.'
          ),
          sl(
            'Esquemas, redirecionamentos e representações de IP',
            'Esquemas: permita só http e https; file:// lê arquivos locais, gopher:// e outros falam protocolos arbitrários, então desabilite-os. Redirecionamentos: uma URL "segura" pode responder 302 para um endereço interno; ou proíba redirecionamentos, ou revalide cada destino. Representações alternativas de IP: o mesmo endereço pode ser escrito em decimal, octal, hexadecimal, abreviado, IPv6 ou IPv4 mapeado em IPv6 (::ffff:127.0.0.1); validar com comparação de texto ("começa com 127.") é frágil. Use a biblioteca ipaddress, normalize e classifique o IP resolvido (is_global, e não loopback, privado, link-local, reservado).'
          ),
          sl(
            'Resolução DNS e DNS rebinding',
            'Validar o NOME não basta: o nome precisa ser resolvido e o IP resultante classificado. Armadilha do DNS rebinding: um domínio controlado pelo atacante responde com um IP público na hora da validação e, na hora da conexão (TTL curto), com um IP interno (TOCTOU: checagem e uso separados). Defesa: resolva o nome UMA vez, valide o IP e conecte diretamente nesse IP (enviando o Host original), ou valide o IP no momento da conexão (hook do cliente HTTP). Também resolva e valide todos os IPs retornados (A e AAAA).'
          ),
          sl(
            'Metadados de nuvem e defesas em camadas',
            'Provedores de nuvem expõem credenciais temporárias da máquina em um endereço de link-local (169.254.169.254). Um SSRF que alcance esse serviço pode obter credenciais do papel da instância. Mitigações: usar a versão 2 do serviço de metadados da AWS (IMDSv2), que exige uma sessão com requisição PUT e cabeçalho, difícil de forjar com SSRF simples; limitar saltos; e dar ao papel da instância privilégios mínimos. Defesa em camadas para o app: (1) allowlist de destinos sempre que possível; (2) resolver-e-validar; (3) proibir ou revalidar redirecionamentos; (4) egress filtering: proxy de saída ou regras de firewall que só permitem os destinos necessários; (5) segmentação de rede para que o servidor não alcance serviços internos sensíveis; (6) não devolver o corpo da resposta bruta ao usuário.'
          ),
          sl(
            'Webhooks e importadores',
            'Webhooks e importadores de URL são o caso de uso legítimo mais comum, então o design importa: cadastre os destinos com validação na hora do cadastro E na hora do envio (o DNS pode mudar), limite tamanho e tempo da resposta, use timeouts curtos, execute a chamada em um serviço isolado de rede (sem acesso a segredos e à rede interna), assine as chamadas de saída para que o destinatário as autentique e registre as tentativas bloqueadas para detecção. Para recursos de pré-visualização, considere um serviço dedicado atrás de um proxy de saída com allowlist.'
          ),
          sl(
            'Validador com ipaddress (saída real)',
            'A função abaixo recusa esquemas não http(s), resolve (aqui simulado com um dicionário fictício) e classifica cada IP com ipaddress; IPv4 mapeado em IPv6 é convertido antes. Em produção, use a resolução real e conecte ao IP validado para evitar rebinding, mantendo ainda os controles de rede.',
            'def ip_ok(ip):\n    ip = ipaddress.ip_address(ip)\n    if getattr(ip, \'ipv4_mapped\', None): ip = ip.ipv4_mapped\n    return ip.is_global\n\n# https://api.exemplo.test/x       (True,  \'ok\')\n# file:///etc/passwd               (False, \'esquema\')\n# http://127.0.0.1/                (False, \'ip nao publico\')\n# http://169.254.169.254/latest/   (False, \'ip nao publico\')\n# http://[::ffff:127.0.0.1]/       (False, \'ip nao publico\')\n# http://interno.exemplo.test/     (False, \'ip nao publico\')  # nome que resolve para 10.0.0.5\n# gopher://x/                      (False, \'esquema\')'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual funcionalidade é um ponto clássico para SSRF?', 'b', [
          'Calculadora de impostos que só usa números enviados no formulário, sem acessar nenhum endereço',
          'Importar uma imagem de perfil a partir de uma URL fornecida pelo usuário',
          'Página estática de perguntas frequentes sem formulários nem integrações externas',
          'Rotação diária dos arquivos de log do servidor de aplicação e do banco de dados'
        ], 'Qualquer função em que o servidor faz uma requisição a um destino influenciado pelo usuário (importadores, webhooks, previews) é candidata a SSRF.'),
        mcq('q2', 'Por que validar uma URL apenas por texto (por exemplo, "não começa com 127.") é frágil?', 'd', [
          'Porque comparações de texto são lentas demais para servidores web',
          'Porque o navegador converte todas as URLs para minúsculas antes de enviar e isso quebra qualquer comparação de texto feita no servidor',
          'Porque URLs só podem conter números e letras sem pontuação',
          'Porque o mesmo endereço tem várias representações (decimal, octal, IPv6, IPv4 mapeado) e nomes podem resolver para IPs internos'
        ], 'Use resolução DNS e classificação do IP com a biblioteca ipaddress, normalizando as formas alternativas.'),
        mcq('q3', 'O validador resolve api.parceiro.test, vê um IP público e libera; na conexão real, o DNS responde com um IP interno. Como se chama e como mitigar?', 'a', [
          'DNS rebinding (TOCTOU); resolver uma vez, validar e conectar ao IP validado',
          'Phishing; treinar os usuários para desconfiar de links recebidos por e-mail',
          'Clickjacking; adicionar o cabeçalho frame-ancestors às respostas do servidor de aplicação',
          'Fixação de sessão; regenerar o ID da sessão logo após o login do usuário no site'
        ], 'A janela entre a checagem e o uso permite a troca do IP. A mitigação é validar o IP efetivamente usado na conexão.'),
        fill('q4', 'Complete: o endereço de link-local usado pelo serviço de metadados de nuvem (credenciais da instância) é 169.254.169.___.', 'http://169.254.169.___/', ['254'], 'O serviço de metadados responde em 169.254.169.254; SSRF para lá pode expor credenciais temporárias do papel da instância.'),
        mcq('q5', 'Qual conjunto de esquemas deve ser permitido em um importador de URL?', 'c', [
          'Qualquer esquema que a biblioteca HTTP suporte, para maximizar compatibilidade',
          'file, ftp e gopher, que são mais rápidos que HTTP',
          'Somente http e https, desabilitando file, gopher e demais',
          'Somente esquemas personalizados definidos pelo usuário no cadastro'
        ], 'Esquemas como file:// e gopher:// ampliam o alcance do ataque. Limite a http/https.'),
        mcq('q6', 'Qual combinação de controles reduz melhor o impacto de um SSRF que passou pela validação?', 'b', [
          'Apenas esconder a mensagem de erro do usuário e manter a rede aberta para todos os destinos externos',
          'Egress filtering/proxy de saída, segmentação de rede, IMDSv2 e papel de nuvem com privilégio mínimo',
          'Aumentar o tamanho máximo de resposta aceito pelo servidor',
          'Permitir redirecionamentos ilimitados para que o servidor consiga chegar ao destino correto da requisição'
        ], 'Defesa em profundidade: mesmo que o código falhe, a rede e as permissões limitam o dano.'),
        mcq('q7', 'Um webhook foi validado no cadastro (IP público). Por que revalidar na hora do envio?', 'c', [
          'Porque o certificado TLS expira todos os dias',
          'Porque o webhook só funciona se o destino for inserido duas vezes em formulários diferentes',
          'Porque o DNS do destino pode ter mudado e passado a resolver para um IP interno',
          'Porque a validação do cadastro é descartada pelo banco de dados'
        ], 'A resolução DNS pode mudar após o cadastro (inclusive de propósito). Validar de novo no envio e conectar ao IP validado fecha a brecha.'),
        fill('q8', 'Complete: a biblioteca padrão do Python usada para classificar IPs (privado, loopback, link-local) é a ___.', 'import ___', ['ipaddress'], 'O módulo ipaddress interpreta e normaliza IPs e oferece propriedades como is_global, is_private e is_loopback.')
      ]
    },
    {
      id: 'owi-15-upload-lfi',
      title: 'Upload, path traversal e inclusão de arquivos',
      goal: 'Receber, armazenar e servir arquivos sem permitir execução, vazamento nem escape de diretório.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Upload seguro em profundidade',
            'Nunca confie no nome, na extensão nem no Content-Type informados pelo cliente. Controles: verifique o tipo REAL pelos primeiros bytes (assinatura ou "magic bytes": PNG começa com 89 50 4E 47, JPEG com FF D8 FF, PDF com %PDF-) e compare com uma allowlist; reprocesse imagens (decodifique e recodifique), o que descarta conteúdo embutido; limite tamanho, quantidade e taxa de uploads; gere o nome do arquivo no servidor (aleatório), ignorando o original; guarde fora do diretório servido pelo servidor web, ou em armazenamento de objetos sem execução. Metadados: fotos trazem EXIF, que pode conter localização GPS e modelo do aparelho; remova-os para proteger a privacidade do usuário (LGPD).'
          ),
          sl(
            'Servir arquivos e vetores de XSS',
            'Servir o arquivo de forma segura importa tanto quanto recebê-lo: entregue de um domínio separado, sem cookies da aplicação; envie Content-Type correto, X-Content-Type-Options: nosniff (impede o navegador de "adivinhar" o tipo) e Content-Disposition: attachment quando o arquivo não deve ser exibido. SVG é XML que pode conter scripts, e HTML enviado por usuário é código: tratá-los como imagem/documento "inofensivo" gera XSS armazenado. Opções: bloquear, sanitizar ou servir como download. Antivírus ou análise em sandbox são camadas extras para arquivos que outras pessoas abrirão.',
            'Content-Type: image/png\nX-Content-Type-Options: nosniff\nContent-Disposition: attachment; filename="arquivo.png"'
          ),
          sl(
            'Path traversal e LFI/RFI',
            'Path traversal ocorre quando o app monta um caminho de arquivo com texto do usuário e o usuário usa sequências como ../ para sair do diretório permitido e ler outros arquivos. LFI (Local File Inclusion) é quando o app INCLUI/executa um arquivo local escolhido pelo usuário (como um include de página por parâmetro); RFI (Remote File Inclusion), quando carrega de uma URL remota. Defesas: não use entrada do usuário em caminhos; se precisar, mapeie por identificador (ID → arquivo registrado no banco) ou allowlist de nomes; se montar caminho, normalize (realpath/resolve) e confirme que o resultado continua dentro do diretório base; desabilite inclusão remota nas configurações da linguagem; execute com privilégios mínimos.',
            '# Corrigido: confirmar que o caminho final fica dentro do diretório base\nbase = os.path.realpath(\'/dados/uploads\')\nalvo = os.path.realpath(os.path.join(base, nome))\nif os.path.commonpath([base, alvo]) != base:\n    raise PermissionError(\'fora do diretório permitido\')'
          ),
          sl(
            'Zip Slip (saída real)',
            'Zip Slip: ao extrair um arquivo compactado, uma entrada com nome como ../fora.txt grava fora da pasta de destino. A correção é validar o caminho de CADA entrada antes de gravar (algumas bibliotecas e versões já sanitizam, outras não: não presuma). Limite também o tamanho total extraído e o número de arquivos para evitar "zip bombs". Demonstração com um zip fictício criado na memória e sem escrever nada em disco.',
            'dest = os.path.realpath(\'destino_x\')\nfor n in zipfile.ZipFile(buf).namelist():\n    t = os.path.realpath(os.path.join(dest, n))\n    print(\'permitido:\' if os.path.commonpath([dest, t]) == dest else \'BLOQUEADO:\', n)\n\n# permitido: ok.txt\n# BLOQUEADO: ../fora.txt'
          ),
          sl(
            'URLs assinadas, expiração e negar por padrão',
            'Para entregar arquivos privados sem passar pelo app, use URLs assinadas e com prazo de expiração: a URL contém uma assinatura (HMAC ou do provedor) que cobre o caminho e a data de expiração; depois do prazo, ela deixa de funcionar. Prefira prazos curtos e escopo mínimo (um objeto, só leitura). Mantenha o princípio de negar por padrão: diretórios de upload não listáveis, ninguém acessa um arquivo sem autorização verificada (o dono é o dono? o tenant confere?) e arquivos órfãos são removidos conforme a política de retenção, respeitando a LGPD.',
            'https://arquivos.exemplo.test/obj/<id>?exp=<timestamp>&sig=<hmac-de-caminho+exp>'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual verificação é a mais confiável para saber se um arquivo enviado é realmente uma imagem PNG?', 'c', [
          'Conferir a extensão .png no nome do arquivo informado pelo cliente no formulário de envio',
          'Conferir o cabeçalho Content-Type enviado pelo navegador',
          'Ler os primeiros bytes (assinatura) e, de preferência, decodificar e recodificar a imagem',
          'Conferir o tamanho do arquivo em bytes'
        ], 'Nome e Content-Type são controlados pelo cliente. A assinatura e o reprocessamento verificam o conteúdo de fato.'),
        mcq('q2', 'Por que remover metadados EXIF de fotos enviadas?', 'a', [
          'Porque podem conter dados pessoais, como localização GPS, o que afeta a privacidade e a LGPD',
          'Porque metadados fazem as imagens carregarem mais devagar no navegador dos outros usuários que as visualizam',
          'Porque o EXIF impede que o arquivo seja salvo em disco',
          'Porque o navegador não consegue exibir imagens com EXIF'
        ], 'EXIF pode revelar onde e com que aparelho a foto foi tirada. Minimizar esses dados faz parte da proteção de dados pessoais.'),
        mcq('q3', 'Qual cabeçalho impede que o navegador "adivinhe" o tipo do conteúdo ignorando o Content-Type?', 'd', [
          'Content-Disposition: inline',
          'Cache-Control: no-store, private',
          'Access-Control-Allow-Origin: *',
          'X-Content-Type-Options: nosniff'
        ], 'nosniff obriga o navegador a respeitar o tipo declarado, evitando que um arquivo seja tratado como script ou HTML.'),
        fill('q4', 'Complete o valor de Content-Disposition que força o navegador a baixar o arquivo em vez de exibi-lo.', 'Content-Disposition: ___; filename="doc.pdf"', ['attachment'], 'attachment sugere o download. Com nosniff e domínio separado, reduz o risco de conteúdo ativo ser executado.'),
        mcq('q5', 'Um usuário envia um SVG de avatar e o app o exibe diretamente na própria origem do site. Qual é o risco?', 'b', [
          'Nenhum, pois SVG é sempre uma imagem estática sem código, como qualquer PNG ou JPEG',
          'O SVG pode conter scripts (XSS armazenado); bloqueie, sanitize ou sirva como download em outro domínio',
          'O arquivo SVG consome mais memória do que um PNG',
          'O risco é só de direitos autorais'
        ], 'SVG é XML e pode embutir scripts. Tratá-lo como imagem inofensiva na mesma origem permite XSS.'),
        mcq('q6', 'O app usa include($pagina . ".php") com $pagina vindo da URL. Qual é a melhor correção?', 'c', [
          'Remover os caracteres ../ do parâmetro uma única vez e manter o include com o restante do valor digitado',
          'Converter o parâmetro para maiúsculas antes do include',
          'Mapear o parâmetro para uma allowlist de páginas conhecidas e nunca montar o caminho com texto do usuário',
          'Salvar o parâmetro em um cookie e incluí-lo na próxima requisição'
        ], 'LFI se resolve eliminando a entrada do usuário no caminho. Remoções simples de ../ costumam ser contornadas.'),
        mcq('q7', 'Ao extrair um ZIP enviado por um usuário, o que fazer para evitar o Zip Slip?', 'a', [
          'Resolver o caminho final de cada entrada e recusar as que saem do diretório de destino',
          'Confiar no nome do arquivo ZIP e extrair tudo diretamente na raiz do sistema de arquivos',
          'Extrair em uma pasta pública do servidor web para facilitar a conferência',
          'Descompactar apenas arquivos com extensão .txt, independentemente do nome interno da entrada'
        ], 'Validar o caminho de cada entrada (realpath e commonpath) impede escape do diretório. Limite também tamanho e quantidade.'),
        fill('q8', 'Complete: para entregar um arquivo privado sem passar pelo app, use URLs ___ com prazo de expiração.', 'URLs ___ (assinadas) e com expiração', ['assinadas', 'assinada', 'signed', 'presigned', 'pré-assinadas', 'pre-assinadas'], 'URLs assinadas incluem uma assinatura sobre caminho e prazo; depois de expirar, deixam de valer.')
      ]
    },
    {
      id: 'owi-16-command-template-injection',
      title: 'Injeção de comandos e de templates',
      goal: 'Separar dados de código ao chamar o sistema operacional, renderizar templates e avaliar expressões.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Injeção de comandos do SO',
            'Quando o app monta uma linha de comando com texto do usuário e a entrega a um shell, caracteres como ; && | $( ) deixam de ser dado e viram novos comandos: o resultado pode ser execução de comandos no servidor. A causa é a mesma de toda injeção: misturar dado e código. A melhor defesa é EVITAR o shell: use a API da linguagem para a tarefa (biblioteca de imagens em vez de chamar um programa externo) e, se precisar chamar um programa, passe uma LISTA de argumentos sem shell: o sistema recebe cada argumento exatamente como foi dado, sem reinterpretar.',
            'import subprocess\n\n# Vulnerável: uma string interpretada pelo shell\nsubprocess.run(\'ping -c1 \' + host, shell=True)\n\n# Corrigido: lista de argumentos, sem shell\nsubprocess.run([\'ping\', \'-c1\', host], shell=False, timeout=5)'
          ),
          sl(
            'Saída real: string de shell vs lista',
            'No laboratório abaixo, com um comando totalmente inofensivo (echo), a entrada contém um segundo comando. Com shell=True o shell executa os dois; com a lista, o texto inteiro vira um único argumento do echo e nada extra é executado. Saída obtida (a entrada fictícia usa && para funcionar no shell do Linux e no do Windows).',
            'entrada = \'ola && echo INJETADO\'\nsubprocess.run(\'echo \' + entrada, shell=True)   # ->  ola\n                                                 #     INJETADO   (o segundo comando rodou)\nsubprocess.run([\'echo\', entrada])                # ->  ola && echo INJETADO   (tudo é texto)'
          ),
          sl(
            'Injeção de argumentos e allowlist',
            'Mesmo sem shell, o valor pode ser lido como uma OPÇÃO do programa se começar com "-" (injeção de argumentos): um nome de arquivo "-rf" ou uma URL "--output=..." muda o comportamento do programa chamado. Defesas: valide o valor contra uma allowlist ou formato estrito (por exemplo, só letras, números e ponto, e comprimento máximo); use o separador "--" (que significa "o que vem depois são argumentos, não opções") quando o programa suportar; prefira caminhos absolutos para o executável; execute com privilégios mínimos, em contêiner ou usuário restrito, e com timeout.',
            'ARQ_OK = re.compile(r\'^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$\')   # não começa com "-"\nif not ARQ_OK.fullmatch(nome): raise ValueError(\'nome invalido\')\nsubprocess.run([\'/usr/bin/wc\', \'-l\', \'--\', nome], timeout=5)'
          ),
          sl(
            'SSTI: injeção em templates',
            'Motores de template (Jinja2, Twig, Thymeleaf, FreeMarker...) misturam texto fixo e expressões. O erro, a SSTI (Server-Side Template Injection), é montar o TEMPLATE concatenando entrada do usuário e depois renderizar: o usuário escreve expressões que o motor avalia, podendo ler dados internos e, em muitos motores, chegar à execução de código. A regra: nunca renderize entrada do usuário COMO template; passe-a como variável de contexto, que é tratada como dado (e escapada). Sandbox do motor é defesa extra, não substitui a regra.',
            '# Vulnerável: a entrada vira parte do template\nrender_template_string(\'Olá \' + nome)\n\n# Corrigido: template fixo, entrada como variável\nrender_template_string(\'Olá {{ nome }}\', nome=nome)\n# ou, melhor: render_template(\'ola.html\', nome=nome)'
          ),
          sl(
            'Avaliadores e linguagens de expressão',
            'eval() e exec() executam texto como código da própria linguagem; entrada do usuário nunca deve chegar a eles. O mesmo vale para linguagens de expressão de frameworks (EL, SpEL, OGNL, filtros dinâmicos de ORMs/consultas): se o usuário controla a expressão, controla comportamento do servidor. Alternativas: um formato de dados (JSON) para configurações; mapas de operações permitidas (allowlist) para cálculos escolhidos pelo usuário; para literais simples, ast.literal_eval em Python (só interpreta literais, mas limite o tamanho da entrada); um parser de expressões próprio e restrito quando for preciso.',
            '# Vulnerável\nresultado = eval(request.args[\'formula\'])\n\n# Corrigido: operações escolhidas por nome, de uma allowlist\nOPS = {\'soma\': lambda a, b: a + b, \'mult\': lambda a, b: a * b}\nresultado = OPS[op](a, b)   # KeyError => rejeitar'
          ),
          sl(
            'Injeção em cabeçalhos (CRLF) e defesa por design',
            'Em HTTP, cada linha de cabeçalho termina com CR LF (\\r\\n). Se um valor controlado pelo usuário vai para um cabeçalho (por exemplo, no redirecionamento Location ou em Set-Cookie) sem tratar quebras de linha, o usuário pode inserir novos cabeçalhos ou até uma resposta inteira (HTTP response splitting). Frameworks modernos costumam recusar quebras de linha, mas valide e não monte cabeçalhos por concatenação. O fio condutor do capítulo: prefira APIs que SEPARAM dados de código (consultas parametrizadas, lista de argumentos, contexto de template, codificação de saída) em vez de tentar "limpar" strings; a validação de entrada vem como camada extra.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual chamada é a mais segura para executar um programa externo com um argumento vindo do usuário?', 'a', [
          'subprocess.run([\'ping\', \'-c1\', host], shell=False, timeout=5), com host validado',
          'subprocess.run(\'ping -c1 \' + host, shell=True, capture_output=True, text=True)',
          'os.system(\'ping -c1 \' + host)',
          'subprocess.run(f\'ping -c1 {host}\', shell=True)'
        ], 'A lista de argumentos sem shell impede que ; && | virem comandos. As outras opções passam a string ao shell. Valide também o valor.'),
        mcq('q2', 'O app executa subprocess.run([\'wc\', \'-l\', nome]) e o usuário envia nome = "--help". Mesmo sem shell, qual é o problema e uma defesa?', 'c', [
          'Nenhum problema: sem shell, o valor sempre é tratado como nome de arquivo, nunca como opção',
          'O problema é só de desempenho; a defesa é usar um interpretador mais rápido',
          'Injeção de argumentos: o valor vira opção; valide por allowlist/formato e use -- antes dos nomes',
          'O problema é de DNS; a defesa é trocar o servidor de nomes'
        ], 'Valores começando com - podem ser interpretados como opções. O separador -- e a validação estrita resolvem.'),
        mcq('q3', 'Qual afirmação descreve melhor a SSTI?', 'b', [
          'É um erro de certificado TLS que expõe os arquivos de template do servidor ao navegador de qualquer visitante',
          'É a avaliação, pelo motor de templates, de expressões da entrada do usuário concatenada ao template',
          'É uma falha de CSRF em formulários renderizados por templates',
          'É a injeção de CSS em e-mails de marketing'
        ], 'SSTI nasce de misturar entrada do usuário ao texto do template. A solução é usar a entrada como variável de contexto.'),
        fill('q4', 'Complete o parâmetro que garante que o subprocess NÃO use o shell para interpretar a string.', 'subprocess.run(["ls", pasta], ___=False)', ['shell'], 'shell=False (o padrão) executa o programa diretamente com a lista de argumentos, sem interpretação de metacaracteres.'),
        mcq('q5', 'Um desenvolvedor deve permitir que o usuário escolha entre soma e multiplicação em uma calculadora do site. Qual é a melhor abordagem?', 'd', [
          'Receber a fórmula completa em texto e avaliá-la com eval, filtrando as palavras import e os',
          'Aplicar exec em uma string montada a partir dos campos do formulário',
          'Salvar a fórmula em um arquivo e executá-lo como script uma vez por hora',
          'Mapear o nome da operação para funções de uma allowlist e rejeitar nomes desconhecidos'
        ], 'Filtrar palavras em eval é contornável. Um mapa de operações permitidas elimina a avaliação de texto arbitrário.'),
        mcq('q6', 'Qual alternativa NÃO é uma boa defesa contra injeção de comandos?', 'b', [
          'Evitar o shell e usar a API da própria linguagem para executar a tarefa desejada, quando existir',
          'Tentar remover manualmente os caracteres ; e | da entrada e então usar shell=True',
          'Executar o processo com um usuário de privilégios mínimos e com tempo limite (timeout)',
          'Validar o valor por allowlist ou formato estrito antes de usá-lo'
        ], 'Listas negras de caracteres são frágeis (há muitas formas de encadear comandos). O correto é separar dado de código e validar por allowlist.'),
        mcq('q7', 'Um valor controlado pelo usuário é colocado, sem tratamento, no cabeçalho Location de um redirecionamento. Qual risco de injeção é associado?', 'd', [
          'Injeção de SQL no banco de sessões',
          'Execução de código no navegador provocada pelo próprio cabeçalho Location da resposta HTTP recebida',
          'Perda de precisão em números grandes do JSON',
          'CRLF/response splitting: quebras de linha no valor podem criar cabeçalhos; recuse CR e LF'
        ], 'CR LF delimitam cabeçalhos. Valores com quebras de linha podem criar cabeçalhos extras se não forem tratados.'),
        fill('q8', 'Complete: no render_template_string, a entrada do usuário deve ir como variável de ___ (e nunca concatenada ao texto do template).', 'render_template_string("Olá {{ nome }}", nome=nome)  # nome está no ___', ['contexto', 'context'], 'Variáveis de contexto são tratadas como dados e escapadas; concatenar ao template faz a entrada ser interpretada como código do template.')
      ]
    },
    {
      id: 'owi-17-logica-negocio-race',
      title: 'Falhas de lógica de negócio e condições de corrida',
      goal: 'Validar fluxo e estado no servidor, impor limites e eliminar corridas com atomicidade e idempotência.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Falhas de lógica de negócio',
            'Algumas falhas não têm "payload": o sistema faz exatamente o que foi programado, mas as regras permitem abuso. Exemplos: alterar preço ou quantidade no pedido (inclusive quantidade negativa), reaproveitar o mesmo cupom em várias compras, pular a etapa de pagamento chamando diretamente a de confirmação, ou abusar de recursos legítimos (robôs comprando todo o estoque de ingressos para revenda, o scalping; criação massiva de contas para ganhar bônus). Scanners automáticos quase nunca as encontram, porque dependem de entender o negócio: por isso a modelagem de ameaças e os casos de abuso (lição 1) importam.'
          ),
          sl(
            'Validar estado e fluxo no servidor',
            'Defesas: (1) o servidor recalcula tudo que importa (preço, total, desconto) a partir do catálogo e ignora valores do cliente; (2) validações de domínio explícitas (quantidade entre 1 e o máximo permitido, valores não negativos); (3) o fluxo é uma máquina de estados no servidor: só se confirma um pedido que está "pago", só se paga um que está "criado" (cada ação confere o estado atual); (4) cupons com limite de uso por conta e total, marcados como usados na mesma transação; (5) limites e quotas por usuário/IP e detecção de comportamento anormal (CAPTCHA, desafios, filas) contra abuso automatizado.',
            'ESTADOS = {\'criado\': {\'pagar\'}, \'pago\': {\'confirmar\', \'reembolsar\'}}\ndef transicao(pedido, acao):\n    if acao not in ESTADOS.get(pedido.estado, set()):\n        raise PermissionError(\'transição inválida\')'
          ),
          sl(
            'Condições de corrida (TOCTOU)',
            'Em uma condição de corrida, duas ou mais requisições simultâneas passam pela MESMA checagem antes de qualquer uma atualizar o dado (Time Of Check To Time Of Use). Exemplo clássico: saldo de 100, duas retiradas de 100 chegam juntas; ambas leem saldo 100, ambas passam pelo "saldo >= 100" e ambas debitam, deixando o saldo negativo. Vale para estoque, cupons de uso único, limites de convites, votação. O padrão é: ler, decidir, escrever, em passos separados e sem exclusão mútua.'
          ),
          sl(
            'Saída real: sem e com controle',
            'Simulação com 5 threads tentando sacar 100 de um saldo de 100. Sem proteção, todas passam na checagem (há uma pequena pausa entre checar e debitar) e o saldo final fica negativo. Com um lock, a checagem e o débito viram uma seção crítica. Em banco de dados, o equivalente é a atualização atômica condicionada: UPDATE conta SET saldo = saldo - 100 WHERE saldo >= 100; só uma das tentativas afeta uma linha (rowcount 1).',
            'saque_ruim  saldo final -400          # 5 saques passaram pela checagem\nsaque_lock  saldo final 0             # com threading.Lock\natômico rowcount: [1, 0, 0, 0, 0]  saldo=0   # UPDATE ... WHERE saldo >= 100\n\ndef saque_lock(v):\n    global saldo\n    with lk:\n        if saldo >= v:\n            saldo -= v'
          ),
          sl(
            'Transações, bloqueios e idempotência',
            'No banco, use transações com o nível de isolamento adequado e bloqueio de linhas quando precisar ler antes de decidir (SELECT ... FOR UPDATE), ou restrições de unicidade (índice UNIQUE em "cupom + usuário" impede dois usos; a segunda inserção falha) e atualizações atômicas condicionadas. Um lock em memória só funciona em um único processo: em vários servidores, a exclusão mútua precisa estar no banco (ou em um serviço de coordenação). Idempotência: operações como "criar pagamento" devem aceitar uma chave de idempotência enviada pelo cliente; repetir a mesma requisição (por clique duplo ou retentativa de rede) devolve o resultado original e não cobra duas vezes.',
            'INSERT INTO usos_cupom (cupom, usuario) VALUES (?, ?);   -- UNIQUE(cupom, usuario)\n-- segunda tentativa viola a restrição e é rejeitada\n\nPOST /pagamentos\nIdempotency-Key: <uuid-gerado-pelo-cliente>'
          ),
          sl(
            'Testes de concorrência e monitoramento',
            'Corridas são difíceis de ver em testes sequenciais. Escreva testes que disparam N requisições simultâneas (threads, asyncio ou ferramenta de carga) contra a MESMA conta/cupom em ambiente de teste próprio e verifique invariantes ("o saldo nunca fica negativo", "o cupom foi usado no máximo uma vez"). Complemente com monitoramento: alertas para estoque ou saldo negativo, cupons usados além do limite e rajadas de requisições idênticas. Registre as decisões de negócio importantes em log de auditoria para investigar abusos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O formulário de checkout envia o campo "preco" junto do ID do produto, e o servidor usa esse preço. Qual a correção?', 'c', [
          'Criptografar o campo preco no navegador antes de enviar a requisição ao servidor de pedidos',
          'Esconder o campo preco com CSS ou em um campo hidden para que o usuário não o veja nem edite',
          'Nunca confiar no preço do cliente e recalcular o total no servidor a partir do catálogo',
          'Validar que o preço é um número positivo'
        ], 'Dados que determinam valor devem vir do servidor. Validar só o formato não impede que o cliente escolha o preço.'),
        mcq('q2', 'Por que o servidor deve tratar o pedido como uma máquina de estados?', 'b', [
          'Para reduzir o consumo de memória durante a navegação',
          'Para impedir que etapas sejam puladas, como confirmar um pedido que nunca foi pago',
          'Para evitar que usuários tenham mais de um pedido',
          'Para permitir que o cliente informe o estado atual do pedido a cada requisição'
        ], 'Cada ação confere o estado atual e só aceita transições válidas, bloqueando atalhos como pular o pagamento.'),
        mcq('q3', 'Qual é a descrição de TOCTOU em uma retirada de saldo?', 'a', [
          'Duas requisições leem o mesmo saldo e passam na checagem antes de algum débito ser gravado',
          'O saldo é calculado com arredondamentos incorretos por causa do tipo de dado usado na coluna do banco',
          'A senha do usuário expira entre dois acessos consecutivos ao sistema de pagamentos da loja online',
          'O banco de dados perde a conexão com a aplicação durante a retirada e reinicia a transação'
        ], 'Time Of Check To Time Of Use: a checagem e a atualização não são atômicas, e requisições concorrentes se intercalam.'),
        fill('q4', 'Complete: a característica de uma operação que pode ser repetida várias vezes produzindo o mesmo resultado, sem efeitos duplicados, chama-se ___.', 'Idempotency-Key: ... (operação ___)', ['idempotência', 'idempotencia', 'idempotente'], 'Operações idempotentes (com chave de idempotência) evitam cobrança dupla por cliques repetidos ou retentativas.'),
        mcq('q5', 'Qual alternativa elimina melhor a corrida ao debitar um saldo no banco?', 'd', [
          'Ler o saldo em uma consulta, decidir no código e gravar o novo saldo em outra consulta, dentro da mesma função',
          'Usar um lock em memória em cada servidor, rodando vários servidores',
          'Aumentar o tempo de resposta do servidor para reduzir a concorrência',
          'UPDATE ... SET saldo = saldo - :v WHERE id = :id AND saldo >= :v, conferindo as linhas afetadas'
        ], 'A atualização atômica condicionada decide e grava no mesmo comando. Um lock em memória não coordena processos diferentes.'),
        mcq('q6', 'Um cupom deve valer uma vez por usuário. Qual mecanismo garante isso mesmo com duas requisições simultâneas?', 'b', [
          'Checar na tela se o cupom já foi usado antes de enviar o formulário',
          'Restrição UNIQUE em (cupom, usuário) no banco, de modo que a segunda inserção falhe',
          'Esconder o botão de aplicar o cupom depois do primeiro clique',
          'Apagar o cupom do e-mail do cliente após o uso'
        ], 'A restrição de unicidade é aplicada pelo banco de forma atômica. Controles na interface são contornáveis.'),
        mcq('q7', 'Um robô compra todos os ingressos de um show em segundos, apesar de cada compra ser legítima do ponto de vista técnico. Que tipo de problema é e qual defesa ajuda?', 'a', [
          'Abuso de funcionalidade legítima; limites por conta/IP, filas, desafios e detecção de anomalias',
          'Injeção de SQL; usar consultas parametrizadas e privilégio mínimo na conta usada pelo banco de dados',
          'XSS refletido; codificar a saída e adotar uma política CSP restritiva em todas as páginas do site',
          'Fixação de sessão; regenerar o ID da sessão logo depois do login e também no logout do usuário final'
        ], 'É um caso de abuso de lógica (scalping). Limites, desafios e monitoramento reduzem o impacto; scanners técnicos não detectam isso.'),
        fill('q8', 'Complete a cláusula SQL que bloqueia as linhas lidas até o fim da transação, evitando que outras transações as alterem antes da decisão.', 'SELECT saldo FROM contas WHERE id = ? FOR ___', ['UPDATE'], 'SELECT ... FOR UPDATE bloqueia as linhas até o fim da transação, evitando a corrida entre leitura e escrita.')
      ]
    },
    {
      id: 'owi-18-criptografia-aplicada',
      title: 'Criptografia aplicada para desenvolvedores web',
      goal: 'Escolher e usar primitivas criptográficas corretamente, sem inventar e sem erros clássicos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'TLS, certificados e HSTS',
            'TLS protege dados em trânsito: confidencialidade, integridade e autenticação do servidor. Use versões modernas (TLS 1.2 e 1.3), desabilite as obsoletas (SSL e TLS 1.0/1.1) e suítes de cifras fracas, e prefira a configuração recomendada pelo provedor ou por geradores de configuração confiáveis. O cliente precisa VALIDAR o certificado (cadeia, nome do host, validade): desabilitar a verificação (verify=False, "aceitar qualquer certificado") para "fazer funcionar" anula o TLS e permite ataque do intermediário. HSTS (Strict-Transport-Security) instrui o navegador a usar sempre HTTPS no domínio; com preload, o domínio entra numa lista embutida nos navegadores.',
            'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n\n# Cliente Python: manter a verificação (padrão)\nrequests.get(url, timeout=5)              # certo\n# requests.get(url, verify=False)         # ERRADO: desliga a validação'
          ),
          sl(
            'Hash, HMAC e cifra autenticada',
            'Três ferramentas, três propósitos. Hash (SHA-256): impressão digital de um dado, sem chave: verifica integridade contra corrupção, não contra um adversário que recalcula o hash. HMAC: hash com chave secreta: prova que quem gerou conhece a chave (integridade e autenticidade de mensagem). Cifra autenticada (AES-GCM, ChaCha20-Poly1305): garante confidencialidade E integridade: se alguém alterar o texto cifrado, a decifragem falha. Cifras sem autenticação (AES-CBC puro, ECB) permitem adulteração silenciosa; e o modo ECB nem esconde padrões do texto. Use cifra autenticada para sigilo.',
            'import hmac, hashlib\nprint(hashlib.sha256(b\'abc\').hexdigest())\n# ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  (vetor conhecido)\ntag = hmac.new(b\'<chave>\', b\'msg\', hashlib.sha256).hexdigest()\nprint(hmac.compare_digest(tag, tag))   # True'
          ),
          sl(
            'Nonces, IVs e números aleatórios',
            'Em AES-GCM, o nonce (12 bytes) DEVE ser único para cada mensagem com a mesma chave: reutilizá-lo destrói a segurança (permite recuperar informações e forjar mensagens). Gere nonces aleatórios com CSPRNG (ou use um contador controlado) e guarde-o junto do texto cifrado (não é segredo). Para tokens, chaves, senhas temporárias e IDs de sessão use um gerador criptograficamente seguro: secrets e os.urandom em Python, crypto.randomBytes em Node. Nunca random.random() ou Math.random(): são previsíveis.',
            'import secrets\ntoken = secrets.token_urlsafe(32)   # token imprevisível\n\n# AES-GCM (biblioteca cryptography; pip install cryptography)\n# from cryptography.hazmat.primitives.ciphers.aead import AESGCM\n# chave = AESGCM.generate_key(bit_length=256)\n# nonce = os.urandom(12)                    # único por mensagem\n# cifrado = AESGCM(chave).encrypt(nonce, dados, aad)\n# AESGCM(chave).decrypt(nonce, cifrado, aad)   # falha se adulterado'
          ),
          sl(
            'Hash de senhas e comparação em tempo constante',
            'Senhas exigem hash LENTO e com salt por usuário, de propósito caro (memória e tempo) para frustrar tentativa em massa: Argon2id (preferido), scrypt ou bcrypt, com parâmetros ajustados ao seu hardware e revisados com o tempo; MD5, SHA-1 e SHA-256 simples são rápidos demais para isso. Ao comparar tokens, MACs ou hashes, == pode terminar assim que encontra o primeiro byte diferente, vazando informação pelo tempo de resposta; use comparação em tempo constante (hmac.compare_digest em Python, crypto.timingSafeEqual em Node). Demonstração do scrypt da biblioteca padrão, com a saída truncada.',
            'import hashlib, hmac\nsalt = b\'0123456789abcdef\'   # em produção: aleatório por usuário\nh = hashlib.scrypt(b\'senha-exemplo\', salt=salt, n=2**14, r=8, p=1, dklen=32)\nprint(h.hex()[:32])   # 19d37603f687c7a86b7c7afa16431e9f\nhmac.compare_digest(h, h)   # comparação em tempo constante'
          ),
          sl(
            'Erros comuns',
            'Os mais frequentes: ECB; IV/nonce fixo ou reutilizado; MD5 e SHA-1 para segurança (colisões práticas); comparar segredos com ==; chaves e segredos no código-fonte ou no repositório; "rolar a própria criptografia" (inventar algoritmo, protocolo ou modo): criptografia é facilmente quebrada por detalhes e as primitivas padrão, bem revisadas, existem; usar criptografia sem autenticação; derivar chaves de senhas curtas sem função de derivação adequada; tratar "ofuscar" ou Base64 como proteção. Regra prática: use bibliotecas de alto nível e conhecidas, evite APIs de baixo nível e deixe as escolhas difíceis a uma biblioteca com padrões seguros.'
          ),
          sl(
            'Gerenciamento de chaves e envelope encryption',
            'Algoritmo forte com chave mal guardada não protege nada. Guarde chaves em um KMS/HSM ou cofre de segredos (gerenciado pela nuvem ou por ferramenta própria), nunca no código nem no repositório; separe chaves por finalidade e ambiente (a chave de produção não é a de teste); controle quem pode usá-las e registre os acessos; rotacione periodicamente e após suspeita de comprometimento, com plano para recifrar ou manter versões antigas só para decifrar. Envelope encryption: cada dado é cifrado com uma chave de dados (DEK) gerada para ele, e a DEK é cifrada por uma chave mestra (KEK) guardada no KMS: o grande volume de dados fica fora do KMS e a rotação da KEK exige recifrar só as DEKs. Placeholders como <chave> nos exemplos jamais devem ser valores reais.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para "fazer funcionar" uma integração com um servidor de teste de certificado inválido, um desenvolvedor usa verify=False em produção. Qual é o problema?', 'd', [
          'Nenhum, pois o tráfego continua sendo cifrado e isso basta para garantir que o destino é o correto e confiável',
          'A conexão fica mais lenta, e nada além disso',
          'O servidor remoto passa a ver a conexão como HTTP e recusa a requisição por segurança, quebrando a integração',
          'O cliente deixa de autenticar o servidor, e um intermediário pode se passar por ele; corrija o certificado'
        ], 'Sem validar o certificado, o TLS perde a autenticação do servidor. Corrija a cadeia/nome do certificado e mantenha a verificação.'),
        mcq('q2', 'Qual ferramenta garante confidencialidade E integridade dos dados ao mesmo tempo?', 'b', [
          'Hash SHA-256 calculado sobre o dado',
          'Cifra autenticada, como AES-GCM',
          'Codificação Base64',
          'Cifra AES em modo ECB'
        ], 'Cifras autenticadas protegem sigilo e detectam adulteração. Hash e Base64 não dão sigilo; ECB não autentica e vaza padrões.'),
        mcq('q3', 'Qual é a regra sobre o nonce em AES-GCM com uma mesma chave?', 'c', [
          'Pode ser fixo, desde que mantido em segredo no servidor',
          'Deve ser igual ao tamanho da chave e reutilizado entre as mensagens, para economizar espaço',
          'Deve ser sempre único para cada mensagem cifrada com a mesma chave; a repetição compromete a segurança',
          'Deve ser derivado da senha do usuário, para facilitar a decifragem'
        ], 'O nonce não é segredo, mas não pode se repetir com a mesma chave. Gere-o de forma aleatória (CSPRNG) ou por contador controlado.'),
        fill('q4', 'Complete o módulo Python indicado para gerar tokens e chaves imprevisíveis (não use random).', 'import secrets\ntoken = ___.token_urlsafe(32)', ['secrets'], 'secrets usa o gerador criptograficamente seguro do sistema; random é previsível e não deve ser usado para segredos.'),
        mcq('q5', 'Qual opção descreve a forma adequada de guardar senhas?', 'a', [
          'Argon2id, scrypt ou bcrypt, com salt único por usuário e parâmetros revisados',
          'SHA-256 simples, que é rápido, padronizado e amplamente aceito em bibliotecas',
          'MD5 com um salt fixo igual para todos os usuários, repetido a cada cadastro de conta',
          'Cifrar as senhas com AES e guardar a chave de decifragem no mesmo banco de dados das senhas'
        ], 'Senhas pedem hash lento e com salt. Hashes rápidos permitem testar bilhões de tentativas por segundo; cifrar com a chave ao lado não ajuda.'),
        mcq('q6', 'Por que usar hmac.compare_digest em vez de == para comparar um token com o valor esperado?', 'b', [
          'Porque compare_digest converte os dois valores para minúsculas e remove espaços antes de comparar, evitando erros de formatação',
          'Porque == pode parar na primeira diferença e vazar informação pelo tempo; compare_digest leva tempo constante',
          'Porque compare_digest descriptografa os valores antes de compará-los',
          'Porque == não funciona com strings de mais de 16 caracteres'
        ], 'Comparações que terminam cedo permitem ataques de temporização. Funções de tempo constante reduzem esse vazamento.'),
        mcq('q7', 'Qual descreve melhor a envelope encryption?', 'c', [
          'Cifrar o arquivo duas vezes com a mesma chave para dobrar a segurança',
          'Colocar o arquivo cifrado em um envelope de e-mail protegido por senha antes de enviá-lo',
          'Cifrar cada dado com uma chave de dados (DEK) e proteger a DEK com uma chave mestra (KEK) no KMS',
          'Guardar a chave mestra no mesmo arquivo cifrado para facilitar a decifragem'
        ], 'A DEK cifra os dados em volume; a KEK, no KMS, protege as DEKs. A rotação da KEK exige recifrar só as DEKs.'),
        fill('q8', 'Complete o cabeçalho que instrui o navegador a usar sempre HTTPS para o domínio.', '___: max-age=31536000; includeSubDomains', ['Strict-Transport-Security', 'HSTS'], 'HSTS (Strict-Transport-Security) faz o navegador converter requisições HTTP em HTTPS durante o prazo indicado em max-age.')
      ]
    },
    {
      id: 'owi-19-apis-rest-graphql',
      title: 'Segurança de APIs REST, GraphQL e gRPC',
      goal: 'Reconhecer e prevenir as falhas mais comuns de APIs: autorização por objeto e função, exposição de propriedades, abuso de recursos, GraphQL e webhooks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'BOLA e BFLA: as duas falhas de autorização mais comuns',
            'O OWASP API Security Top 10 descreve riscos próprios de APIs. Os dois primeiros conceitos são de autorização. BOLA (autorização quebrada em nível de objeto): a API recebe um identificador (`/pedidos/124`) e devolve o objeto sem conferir se ele pertence a quem pediu — trocar o número expõe dados de outra pessoa. BFLA (autorização quebrada em nível de função): um usuário comum consegue chamar uma operação reservada a outro papel, como `DELETE /admin/usuarios/7`, porque o servidor só esconde o botão na interface. A defesa é a mesma ideia nos dois casos: o servidor decide a cada requisição, usando a identidade autenticada, e não confia no que o cliente envia ou mostra. Identificadores não adivinháveis (UUID) ajudam, mas não substituem a checagem.',
            `# vulneravel (BOLA): busca so pelo id da URL
pedido = db.query('select * from pedidos where id = ?', (pedido_id,))

# corrigido: o dono faz parte da consulta
pedido = db.query('select * from pedidos where id = ? and cliente_id = ?',
                  (pedido_id, usuario_logado.id))
if pedido is None:
    return resposta(404)   # nao revela se existe

# BFLA: checar o papel no servidor, em cada rota sensivel
if 'admin' not in usuario_logado.papeis:
    return resposta(403)`
          ),
          sl(
            'Autenticação quebrada e exposição excessiva de propriedades',
            'Autenticação quebrada em APIs inclui: endpoints sem autenticação por esquecimento, tokens que nunca expiram, ausência de limite em tentativas de login, chaves de API em URL (acabam em logs). Já a exposição excessiva de propriedades acontece em dois sentidos. Na saída, a API serializa o objeto inteiro do banco (hash de senha, flags internas, dados pessoais desnecessários) e conta com o front-end para esconder campos. Na entrada, a atribuição em massa (mass assignment): o servidor copia todo o JSON recebido para o modelo, e o cliente envia `"papel": "admin"` ou `"saldo": 1000000`. A correção é usar listas explícitas: um esquema de saída (DTO) com só os campos necessários e um esquema de entrada que aceita apenas os campos editáveis, rejeitando o resto.',
            `# vulneravel: copia tudo o que o cliente mandou
usuario.update(**request.json)          # inclui 'papel': 'admin'
return jsonify(usuario.__dict__)        # inclui hash da senha

# corrigido: listas explicitas de campos
EDITAVEIS = {'nome', 'telefone'}
dados = {k: v for k, v in request.json.items() if k in EDITAVEIS}
usuario.update(**dados)
return jsonify({'id': usuario.id, 'nome': usuario.nome})`
          ),
          sl(
            'Consumo irrestrito de recursos: limites em tudo',
            'Uma API sem limites pode ser derrubada ou gerar custo sem que haja invasão alguma. Defina limites em várias dimensões: taxa de requisições por cliente/chave/IP (resposta `429 Too Many Requests`, com `Retry-After`), tamanho máximo do corpo e de uploads, número máximo de itens por página (`limit` com teto no servidor, paginação obrigatória), tempo máximo de execução de cada requisição, e custo de operações caras (exportações, buscas, envio de SMS/e-mail que custam dinheiro). Endpoints sensíveis, como login e recuperação de senha, merecem limites mais estritos que os demais. Os limites devem valer no servidor; um cliente honesto os respeita, um abusivo os ignora.',
            `# vulneravel: o cliente decide quantos itens vem
limite = int(request.args.get('limit', 50))   # limit=10000000 ?

# corrigido: teto imposto pelo servidor
limite = min(int(request.args.get('limit', 50)), 100)

# resposta quando excede a taxa
HTTP/1.1 429 Too Many Requests
Retry-After: 30`
          ),
          sl(
            'Configuração, inventário, terceiros e SSRF',
            'Configuração incorreta: CORS aberto demais, mensagens de erro com pilha de execução, métodos HTTP desnecessários habilitados, TLS ausente, cabeçalhos de segurança esquecidos, ambiente de teste exposto. Inventário impróprio: versões antigas (`/v1`) e APIs "sombra" (esquecidas, sem dono, sem monitoramento) continuam no ar sem as correções da versão nova; mantenha catálogo de APIs, dono, versão e data de desativação. Consumo inseguro de APIs de terceiros: tratar a resposta de um parceiro como confiável. Valide e limite o que vem deles como qualquer entrada, use TLS, defina timeouts e não siga redirecionamentos às cegas. SSRF: quando a API busca uma URL informada pelo usuário (importar imagem, webhook), o servidor pode ser levado a acessar serviços internos; use lista de destinos permitidos e bloqueie endereços internos.'
          ),
          sl(
            'GraphQL: um endpoint, muitos riscos específicos',
            'No GraphQL o cliente escreve a consulta, então o servidor precisa impor limites. Introspecção (o esquema consultável) é útil em desenvolvimento; em produção costuma ser desativada para não entregar o mapa da API (isso não substitui autorização). Consultas aninhadas em profundidade exagerada ou com custo alto derrubam o servidor: imponha limite de profundidade e de complexidade/custo por consulta. Batching (várias operações numa só requisição) e aliases permitem repetir uma operação muitas vezes numa única chamada e furar um limite de taxa que conta requisições HTTP — conte operações, não requisições. Por fim, a autorização deve estar nos resolvedores de cada objeto e campo, não só na consulta raiz: se `usuario(id)` checa o papel mas o campo `pedidos` dentro dele não, o aninhamento vira um atalho para dados alheios.',
            `# em producao (ideias de configuracao, conceitual)
introspeccao: desligada
profundidade_maxima: 8
custo_maximo_por_consulta: definido
operacoes_por_requisicao: limitadas

# autorizacao por objeto, no resolvedor
def resolver_pedidos(usuario_alvo, info):
    if usuario_alvo.id != info.context.usuario.id:
        raise PermissionError()`
          ),
          sl(
            'gRPC, validação de esquema e webhooks com HMAC',
            'gRPC usa HTTP/2 e mensagens binárias (Protocol Buffers); o formato binário não é proteção. Autentique o chamador com mTLS (cada lado apresenta certificado) e/ou tokens nos metadados, use TLS, imponha prazo (deadline) e tamanho máximo de mensagem e autorize por método e objeto. Em REST, descreva a API com OpenAPI e valide entradas contra um esquema (JSON Schema): tipos, comprimentos máximos, valores permitidos e `additionalProperties: false`; isso rejeita entradas malformadas cedo, mas não substitui autorização. Webhooks: qualquer um pode enviar POST para sua URL, então o remetente calcula um HMAC-SHA256 do corpo mais um timestamp com um segredo compartilhado, e o receptor recalcula e compara em tempo constante. O timestamp assinado, aceito só numa janela curta, impede replay (reenvio de uma mensagem válida capturada); guarde também o id do evento para descartar repetidos. O segredo fica em cofre, não no código. Saída real de um teste local:',
            `# verificar(corpo, ts, assinatura, agora) -> resultado
mensagem original, agora+10s        -> aceito
corpo alterado (assinatura antiga)  -> rejeitado: assinatura invalida
mesma mensagem, 1 hora depois       -> rejeitado: timestamp fora da janela

# nucleo do codigo
esperado = hmac.new(SEGREDO, str(ts).encode() + b'.' + corpo, hashlib.sha256).hexdigest()
ok = abs(agora - ts) <= JANELA and hmac.compare_digest(assinatura, esperado)`
          )
        ]
      },
      questions: [
        mcq('q1', 'Um cliente autenticado chama GET /pedidos/124 e a API devolve o pedido, que pertence a outra pessoa. Qual é a falha e a correção?', 'd', [
          'Falha de configuração; a correção é desativar o método GET para pedidos.',
          'Exposição de propriedades; a correção é remover campos da resposta, e esse é o único ponto de entrada em que a lista de propriedades da API precisa ser revisada.',
          'Consumo irrestrito; a correção é limitar a quantidade de pedidos por minuto, o que seria suficiente para evitar a exposição indevida de pedidos.',
          'BOLA; a correção é consultar o pedido filtrando também pelo dono, usando a identidade autenticada no servidor.'
        ], 'É autorização quebrada em nível de objeto: o servidor não conferiu a posse. Limite de taxa e esquema de saída não resolvem isso.'),
        mcq('q2', 'A interface esconde o botão "excluir usuário" de usuários comuns, mas a rota DELETE /admin/usuarios/7 responde 200 para eles. O que está faltando?', 'a', [
          'Checagem de papel no servidor para a função; sua ausência caracteriza BFLA.',
          'Um identificador não adivinhável no lugar de 7, o que impediria a chamada.',
          'Um limite de taxa mais estrito na rota administrativa.',
          'Validação de esquema JSON na rota, para rejeitar o corpo da requisição.'
        ], 'Esconder botões é só UX. O servidor deve negar a função a quem não tem o papel (BFLA).'),
        mcq('q3', 'Este código é seguro?\n`usuario.update(**request.json)`', 'c', [
          'Sim, porque o ORM já escapa os valores e impede qualquer abuso, e a mesma ideia vale para qualquer campo do corpo, pois o mapeamento do ORM só considera as colunas existentes na tabela.',
          'Sim, desde que a requisição use HTTPS e um token válido.',
          'Não: permite atribuição em massa, e o cliente pode enviar campos como papel ou saldo; use uma lista explícita de campos editáveis.',
          'Não, mas só porque faltou um limite de tamanho no corpo, e a falta de limite no corpo permitiria também alterar os campos de papel e de saldo.'
        ], 'HTTPS e token autenticam o cliente, mas não restringem quais campos ele pode alterar. A solução é uma allowlist de campos.'),
        fill('q4', 'Qual código de status HTTP indica que o cliente excedeu o limite de taxa?', 'HTTP/1.1 ___ Too Many Requests', ['429'], 'O status 429 Too Many Requests, geralmente com o cabeçalho Retry-After.'),
        mcq('q5', 'Numa API GraphQL, um cliente envia numa só requisição centenas de tentativas de login usando aliases, e o limite de requisições HTTP por minuto não dispara. Qual defesa ataca esse problema?', 'b', [
          'Desligar a introspecção, o que impede o uso de aliases.',
          'Contar e limitar operações (ou custo) por requisição, não só requisições HTTP.',
          'Trocar GraphQL por gRPC, pois o formato binário impede repetições.',
          'Aumentar a profundidade máxima da consulta.'
        ], 'Aliases e batching multiplicam operações dentro de uma única requisição; o limite precisa contar operações/custo. Introspecção desligada não impede isso.'),
        mcq('q6', 'A consulta raiz `usuario(id)` valida o papel do chamador, mas o campo aninhado `pedidos` devolve os pedidos de qualquer usuário. Como corrigir?', 'c', [
          'Impor limite de profundidade 1, o que torna a raiz suficiente.',
          'Desativar a introspecção para que ninguém descubra o campo pedidos, pois sem o esquema ninguém teria como saber que o campo existe e consultá-lo pelas camadas internas.',
          'Aplicar autorização no resolvedor de cada objeto e campo sensível, comparando dono e chamador.',
          'Manter a checagem na raiz e ocultar o campo no front-end.'
        ], 'A autorização deve acompanhar o dado, não só a porta de entrada. Esconder o esquema ou a interface não protege o campo.'),
        mcq('q7', 'Qual combinação protege um receptor de webhook contra falsificação e contra replay de mensagens legítimas capturadas?', 'a', [
          'HMAC sobre timestamp e corpo, janela curta, comparação em tempo constante e descarte de ids de evento repetidos.',
          'Assinar só o corpo com HMAC e comparar com `==` para ser mais rápido.',
          'Aceitar chamadas vindas do IP que o parceiro divulgou, sem assinatura, já que o endereço de origem do parceiro costuma ser estável e estar documentado nos contratos de integração.',
          'Colocar o segredo na URL do webhook e confiar em HTTPS.'
        ], 'O timestamp assinado limita a validade de uma mensagem; o id evita duplicatas dentro da janela; compare_digest evita vazamento por tempo. IP isolado é fraco e segredo em URL vaza em logs.'),
        fill('q8', 'Complete a comparação segura de assinaturas:', 'ok = hmac.___(assinatura_recebida, assinatura_esperada)', ['compare_digest'], 'hmac.compare_digest compara em tempo constante, evitando que o tempo de resposta revele quantos caracteres coincidem.')
      ]
    },
    {
      id: 'owi-20-spa-front-end',
      title: 'Segurança em SPAs e no front-end moderno',
      goal: 'Decidir onde guardar tokens, usar OAuth com PKCE, reduzir XSS com CSP e lembrar que o servidor é a fronteira de confiança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde guardar o token: localStorage, cookie HttpOnly e BFF',
            'Uma SPA precisa lembrar quem está logado. Se o token fica em `localStorage`, qualquer JavaScript que rode na página (um XSS, uma dependência comprometida) consegue lê-lo e enviá-lo para fora. Um cookie com `HttpOnly` não pode ser lido por JavaScript; com `Secure` só trafega por HTTPS; com `SameSite` (Lax ou Strict) reduz o envio em requisições entre sites e ajuda contra CSRF. O XSS ainda consegue fazer requisições em nome do usuário enquanto a página está aberta, mas não consegue levar o token embora. O padrão BFF (backend-for-frontend) leva isso adiante: um pequeno servidor do mesmo site conversa com o provedor de identidade, guarda os tokens e entrega à SPA só um cookie de sessão HttpOnly. Nenhum token de acesso chega ao navegador.',
            `# cookie de sessao (BFF)
Set-Cookie: sid=<id-opaco>; HttpOnly; Secure; SameSite=Lax; Path=/

# vulneravel: token legivel por qualquer script da pagina
localStorage.setItem('token', jwt)

# com cookie HttpOnly nao ha nada para ler
document.cookie   // nao inclui o sid`
          ),
          sl(
            'OAuth em SPA: Authorization Code com PKCE, sem segredo no cliente',
            'Uma SPA é um cliente público: tudo o que está no bundle pode ser lido por qualquer pessoa, então não existe segredo de cliente que se mantenha secreto. O fluxo recomendado é Authorization Code com PKCE. O app gera um `code_verifier` aleatório, envia ao provedor apenas o `code_challenge` (um hash do verifier) ao iniciar o login e, ao trocar o código recebido por tokens, apresenta o verifier original. Quem interceptar o código de autorização sem o verifier não consegue trocá-lo. O fluxo Implicit (token na URL) está obsoleto. Valide também o parâmetro `state` (proteção CSRF do fluxo) e use URIs de redirecionamento cadastradas com correspondência exata.',
            `# 1) autorizacao (navegador -> provedor)
GET /authorize?response_type=code&client_id=<id-publico>
    &redirect_uri=https://app.exemplo.test/callback
    &code_challenge=<hash-do-verifier>&code_challenge_method=S256&state=<aleatorio>

# 2) troca do codigo (app -> provedor)
POST /token  code=<codigo>&code_verifier=<verifier-original>
# nenhum client_secret no codigo da SPA`
          ),
          sl(
            'XSS em frameworks: o escape automático e as saídas de emergência',
            'React, Angular e Vue escapam por padrão o texto inserido nos templates, o que elimina a maior parte do XSS comum. Os problemas aparecem nas saídas de emergência, que inserem HTML bruto: `dangerouslySetInnerHTML` (React), `[innerHTML]` e `bypassSecurityTrust*` (Angular), `v-html` (Vue), além de `element.innerHTML`, `document.write` e `eval` diretos. Outros pontos de risco: URLs vindas do usuário em `href`/`src` (esquemas como `javascript:` devem ser barrados; aceite só `http` e `https`) e bibliotecas de terceiros que manipulam o DOM. Se for realmente preciso renderizar HTML de usuário, passe-o por um sanitizador mantido e confiável (por exemplo DOMPurify) com lista de tags permitidas, e não escreva o seu.',
            `// vulneravel: HTML do usuario sem tratamento
<div dangerouslySetInnerHTML={{ __html: comentario }} />

// corrigido: texto (escapado automaticamente)
<div>{comentario}</div>

// se HTML for indispensavel: sanitizar antes
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comentario) }} />`
          ),
          sl(
            'CSP, Trusted Types, clickjacking e links externos',
            'A Content-Security-Policy (CSP) é uma camada extra: um cabeçalho que diz de onde scripts, estilos e imagens podem vir. Uma política que proíbe scripts inline e restringe `script-src` a origens conhecidas (ou usa nonces/hashes) faz muitos XSS deixarem de executar. Trusted Types (em navegadores que suportam) obriga que os pontos perigosos (`innerHTML`, `eval`) recebam objetos criados por uma política confiável, não strings soltas. Contra clickjacking (sua página dentro de um iframe de outro site), use `frame-ancestors` na CSP (ou `X-Frame-Options`). Em links que abrem outra aba com `target="_blank"`, use `rel="noopener noreferrer"` para o destino não receber referência à sua janela nem o endereço de origem.',
            `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<aleatorio-por-resposta>'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'
Content-Security-Policy: require-trusted-types-for 'script'

<a href="https://externo.test" target="_blank" rel="noopener noreferrer">Fonte</a>`
          ),
          sl(
            'Segredos no bundle, source maps e dependências de terceiros',
            'Tudo o que entra no bundle é público. Chaves de API privadas, senhas, tokens de serviço e URLs internas não pertencem ao front-end; variáveis de ambiente injetadas no build são embutidas no JavaScript. Só coloque ali valores feitos para serem públicos (um identificador de cliente OAuth, uma chave pública restrita por domínio). Source maps publicados em produção devolvem o código-fonte original, facilitando a análise; publique-os só para ferramenta de erros, ou não os publique. Dependências npm e scripts de terceiros (analytics, chat, tags) rodam com os mesmos poderes do seu código: fixe versões com lockfile, revise atualizações, minimize o número de pacotes e, para scripts de CDN, use Subresource Integrity (SRI), que faz o navegador recusar o arquivo se o hash não bater.',
            `<script src="https://cdn.exemplo.test/lib.min.js"
        integrity="sha384-<hash-do-arquivo>"
        crossorigin="anonymous"></script>

# vulneravel: segredo embutido no build
VITE_CHAVE_PRIVADA=<segredo>   # vira texto no bundle`
          ),
          sl(
            'Rotas protegidas no cliente são só UX; CORS não é autorização',
            'Esconder uma página ou um botão no React para quem não é admin melhora a experiência, mas não protege nada: o usuário pode alterar o JavaScript, chamar a API diretamente com curl ou editar o estado local. Toda validação e toda autorização precisam acontecer no servidor, a cada requisição, porque o navegador do usuário é território do usuário. Validação no cliente serve para feedback rápido. CORS é uma política do navegador que decide se uma página de outra origem pode ler respostas; refletir qualquer `Origin` recebido equivale a abrir tudo, e `*` não funciona com credenciais. Liste as origens permitidas explicitamente. CORS não impede que um programa fora do navegador chame sua API.',
            `// UX apenas: a API ainda precisa negar
{usuario.papel === 'admin' && <PainelAdmin />}

# servidor (a verificacao que vale)
if 'admin' not in usuario.papeis:
    return 403

# CORS: origens explicitas
Access-Control-Allow-Origin: https://app.exemplo.test
Vary: Origin`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal vantagem de manter a sessão em um cookie HttpOnly em vez de guardar o token em localStorage?', 'd', [
          'O cookie dispensa HTTPS, pois os dados nunca saem do navegador.',
          'O cookie impede qualquer requisição maliciosa feita pela página comprometida, segundo a política padrão de armazenamento do navegador.',
          'O cookie é criptografado automaticamente pelo navegador e não pode ser enviado a outro site.',
          'Um XSS não consegue ler o cookie para levá-lo embora, ao contrário do token em localStorage.'
        ], 'HttpOnly esconde o valor do JavaScript. O XSS ainda pode fazer requisições enquanto a página está aberta, mas não exfiltra o token.'),
        mcq('q2', 'Por que uma SPA usa Authorization Code com PKCE em vez de guardar um client_secret?', 'd', [
          'Porque o PKCE substitui a necessidade de redirecionamentos cadastrados e do parâmetro state, já que o provedor valida o código sem verifier no fluxo atual.',
          'Porque o provedor de identidade não aceita segredos de cliente em HTTPS.',
          'Porque o PKCE criptografa o bundle e esconde o segredo de quem baixar o JavaScript, e por isso o código da SPA passa a ser entregue ao navegador de forma ilegível.',
          'Porque a SPA é cliente público: não há como guardar segredo, e o verifier torna inútil um código de autorização interceptado.'
        ], 'O segredo no bundle seria público. O code_verifier prova que quem troca o código é quem iniciou o fluxo. State e redirect_uri exatos continuam necessários.'),
        mcq('q3', 'Este código é seguro?\n`<div dangerouslySetInnerHTML={{ __html: comentario }} />` com `comentario` vindo de outros usuários', 'a', [
          'Não: insere HTML bruto de usuários; renderize como texto ou sanitize com biblioteca confiável antes.',
          'Sim, porque o React escapa todo conteúdo mesmo nessa propriedade.',
          'Sim, desde que exista uma CSP, que torna a sanitização dispensável.',
          'Não, mas só se o comentário tiver mais de mil caracteres, pois nessa faixa de tamanho o navegador passa a aplicar o escape por conta própria antes de montar a página.'
        ], 'dangerouslySetInnerHTML é a saída de emergência que desliga o escape. A CSP é camada extra, não desculpa para HTML não tratado.'),
        fill('q4', 'Qual valor de rel evita que a página aberta em nova aba acesse sua janela (junto de noreferrer)?', '<a href="https://externo.test" target="_blank" rel="___ noreferrer">', ['noopener'], 'rel="noopener" impede que o destino use window.opener para interagir com a página de origem.'),
        mcq('q5', 'Qual mecanismo faz o navegador recusar um script de CDN cujo conteúdo foi alterado?', 'c', [
          'O atributo SameSite no cookie da sessão.',
          'O cabeçalho X-Frame-Options definido como DENY.',
          'Subresource Integrity (atributo integrity com o hash do arquivo).',
          'CORS com Access-Control-Allow-Origin explícito.'
        ], 'SRI compara o hash do arquivo baixado com o declarado; se diferir, o script não executa.'),
        mcq('q6', 'Uma variável VITE_CHAVE_PRIVADA com o segredo de um serviço de pagamento é lida durante o build. Qual é o problema?', 'd', [
          'Nenhum: variáveis de ambiente do build ficam só no servidor de build.',
          'O segredo só vaza se os source maps também forem publicados.',
          'O problema é de desempenho, pois o bundle fica maior, já que cada variável a mais aumenta o tempo de transferência e o custo de entrega do JavaScript.',
          'O valor é embutido no JavaScript entregue, então fica público; segredos devem ficar no servidor.'
        ], 'Variáveis expostas ao front-end são substituídas no código final. Source maps facilitam a leitura, mas o segredo já está no bundle.'),
        mcq('q7', 'Um desenvolvedor esconde a rota /admin no React para usuários comuns e considera o assunto resolvido. O que deve ser feito além disso?', 'b', [
          'Adicionar uma validação extra no próprio componente, antes de renderizar.',
          'Exigir autorização no servidor para cada chamada de API administrativa, tratando o cliente como não confiável.',
          'Ofuscar o código do bundle para que o nome da rota não seja encontrado, o que torna o nome da rota inalcançável para quem inspeciona o tráfego do navegador.',
          'Trocar o nome da rota para algo difícil de adivinhar.'
        ], 'Rotas no cliente são UX; quem tem o navegador controla o JavaScript. Obscuridade e validação no cliente não são fronteira de segurança.'),
        fill('q8', 'Qual diretiva da CSP impede que sua página seja carregada dentro de iframes de outros sites?', "Content-Security-Policy: ___ 'none'", ['frame-ancestors'], 'frame-ancestors controla quem pode embutir a página e é a defesa moderna contra clickjacking.')
      ]
    },
    {
      id: 'owi-21-microsservicos-containers',
      title: 'Segurança de microsserviços e containers',
      goal: 'Autenticar serviços entre si, segmentar a rede, proteger segredos e endurecer containers sem confiar na rede interna.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Rede interna não é zona de confiança',
            'Em uma arquitetura de microsserviços, dezenas de serviços se chamam pela rede. Se todos confiam em qualquer chamada vinda "de dentro", um serviço comprometido ou um pod mal configurado alcança todos os outros (movimento lateral). O modelo recomendado é de confiança zero: cada chamada é autenticada e autorizada, mesmo dentro do cluster. Duas peças complementares: mTLS (TLS mútuo), em que cliente e servidor apresentam certificados e verificam um ao outro, o que prova a identidade do serviço e criptografa o tráfego; e tokens de serviço (por exemplo JWT de curta duração emitido por um provedor de identidade), que dizem quem está chamando e o que pode fazer. Malhas de serviço (service mesh) automatizam o mTLS, mas a política de autorização ainda precisa ser escrita.'
          ),
          sl(
            'Propagação de identidade e API gateway',
            'Um problema clássico é o "deputado confuso": o serviço A chama o serviço B com a própria credencial poderosa, e B não sabe se o usuário original podia pedir aquilo. Propague a identidade do usuário final (um token com o sujeito e o escopo, ou um token trocado por outro de audiência restrita) para que cada serviço autorize com base em quem pediu, não só em qual serviço chamou. Trate o API gateway como ponto de entrada de autenticação, limite de taxa, validação básica e roteamento, mas sem torná-lo a única barreira: os serviços atrás dele continuam validando o token e autorizando, porque ainda podem ser chamados por outros caminhos da rede.',
            `# cabecalhos entre servicos (ideia)
Authorization: Bearer <token-do-usuario, audiencia = servico-pedidos>
# cada servico confere: assinatura, expiracao, audiencia e escopo

# vulneravel: servico B confia em qualquer chamada interna
if request.remote_addr.startswith('10.'):
    return dados

# corrigido: exige identidade e verifica permissao
claims = validar_token(request, audiencia='servico-pedidos')
exigir_escopo(claims, 'pedidos:ler')`
          ),
          sl(
            'Segmentação de rede e segredos',
            'Segmentar significa que só quem precisa conversar consegue conversar. Em orquestradores como Kubernetes, políticas de rede (NetworkPolicy) começam negando tudo e liberam fluxos específicos (frontend para API, API para banco). O banco de dados não deve aceitar conexões de qualquer serviço nem ter porta publicada na internet. Segredos (senhas de banco, chaves de API, certificados) não ficam em imagens, no repositório nem em variáveis fixas no Dockerfile; use um cofre (Vault, gerenciador de segredos da nuvem) ou o mecanismo de segredos do orquestrador, com acesso por identidade do serviço, rotação e auditoria. Lembre que Secrets do Kubernetes, por padrão, são apenas codificados em base64: habilite criptografia em repouso e controle quem pode lê-los.',
            `# NetworkPolicy (exemplo ilustrativo): so a API fala com o banco
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: banco-so-api }
spec:
  podSelector: { matchLabels: { app: banco } }
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector: { matchLabels: { app: api } }`
          ),
          sl(
            'Endurecendo o container',
            'O container compartilha o kernel do host, então privilégios demais ampliam o dano de qualquer falha na aplicação. Boas práticas: imagem enxuta e atualizada (menos pacotes, menos vulnerabilidades), rodar como usuário não-root (`USER`), sistema de arquivos somente leitura (`--read-only`, com tmpfs onde precisa gravar), remover todas as capabilities do Linux e devolver só as necessárias (`--cap-drop=ALL`), impedir ganho de privilégios (`no-new-privileges`), definir limites de CPU e memória e evitar `--privileged`. Não monte o socket do Docker (`/var/run/docker.sock`) dentro de um container: quem controla o socket controla o host. Escaneie as imagens por vulnerabilidades conhecidas no build e periodicamente. Os detalhes de Docker estão no curso de Containers; aqui o foco é o risco.',
            `docker run --read-only --tmpfs /tmp \\
  --cap-drop=ALL --security-opt no-new-privileges \\
  --user 10001:10001 --memory 256m --pids-limit 100 \\
  minha-api:<tag>

# evitar:
#   --privileged
#   -v /var/run/docker.sock:/var/run/docker.sock`
          ),
          sl(
            'SSRF interno, metadados e observabilidade sem dados pessoais',
            'Em nuvem e orquestração, um SSRF é especialmente grave: uma API que busca URLs informadas pelo usuário pode ser levada a falar com serviços internos, painéis administrativos ou o serviço de metadados da instância, que entrega credenciais temporárias. Defesas: lista de destinos permitidos, bloqueio de faixas internas e de link-local, resolver o DNS e conferir o IP final, não seguir redirecionamentos às cegas, política de rede de saída (egress) restritiva e a versão mais protegida do serviço de metadados. Quanto à observabilidade: logs, métricas e traces capturam corpos de requisição, cabeçalhos e identificadores. Registre IDs de correlação, não CPF, e-mail, senhas ou tokens; mascare o que for pessoal (LGPD) e restrinja o acesso. Referências cruzadas: curso de Containers (detalhes do Docker) e curso de Redes (segmentação, TLS).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O serviço de pedidos aceita qualquer chamada vinda do cluster, pois "a rede interna é confiável". Qual é o risco e a abordagem correta?', 'a', [
          'Um serviço comprometido alcança todos os outros; autentique cada chamada (mTLS e/ou tokens) e autorize por serviço e escopo.',
          'O risco é de desempenho; a correção é colocar um balanceador na frente.',
          'O risco é a falta de cache; a correção é replicar o serviço em mais nós, e isso resolve a exposição dos serviços sem alterar os controles de acesso.',
          'Nenhum risco, pois a rede interna é isolada da internet e isso é um controle suficiente, e qualquer comunicação entre serviços do mesmo cluster pode ser considerada interna e confiável por definição.'
        ], 'Confiança zero: a localização na rede não prova identidade. mTLS e tokens de serviço dão identidade verificável.'),
        mcq('q2', 'O serviço A chama o serviço B com a sua credencial própria, de alto privilégio, e B executa o que A pedir sem saber qual usuário originou o pedido. Qual é o problema?', 'c', [
          'O mTLS está habilitado, o que impede a propagação do token do usuário, portanto os serviços precisariam desativar o TLS interno para que o cabeçalho de identidade atravessasse a malha.',
          'O gateway deveria ser removido, pois a autorização fica a cargo do usuário final.',
          'Um deputado confuso: sem propagar a identidade do usuário, B não consegue autorizar com base em quem realmente pediu.',
          'A falta de compressão nas mensagens entre os serviços.'
        ], 'A identidade do usuário e o escopo precisam chegar aos serviços internos. O mTLS identifica serviços, não usuários.'),
        mcq('q3', 'Este comando é seguro?\n`docker run --privileged -v /var/run/docker.sock:/var/run/docker.sock minha-api`', 'c', [
          'Sim, desde que a imagem seja escaneada antes do deploy, pois a varredura detectaria o uso do socket e impediria a execução do container pelo daemon.',
          'Não, mas só porque o ideal seria publicar uma porta a menos.',
          'Não: privilégios totais e acesso ao socket do Docker equivalem a controle do host se a aplicação for comprometida.',
          'Sim, é a forma recomendada para a API gerenciar outros containers, já que o daemon do Docker isola o container do restante do host.'
        ], 'Escanear a imagem não compensa dar ao container o controle do daemon e do host. Remova ambos.'),
        fill('q4', 'Qual flag do docker run remove todas as capabilities do Linux do container?', 'docker run --___=ALL minha-api', ['cap-drop'], '--cap-drop=ALL remove as capabilities; adicione de volta só as estritamente necessárias com --cap-add.'),
        mcq('q5', 'Por que uma política de rede que começa negando todo o tráfego e libera fluxos específicos é preferível?', 'a', [
          'Porque limita o movimento lateral: o banco só aceita conexões da API, e um pod comprometido alcança pouco.',
          'Porque substitui a necessidade de autenticação entre os serviços, e isso permite remover as verificações de identidade feitas pelos próprios serviços internos.',
          'Porque elimina a necessidade de TLS na rede interna.',
          'Porque reduz o consumo de CPU dos nós, pois menos pacotes são processados.'
        ], 'Segmentação reduz o alcance de um comprometimento, mas é complementar à autenticação e ao TLS, não substituta.'),
        mcq('q6', 'Onde devem ficar a senha do banco e a chave de uma API de terceiros usadas por um microsserviço?', 'a', [
          'Em um cofre ou mecanismo de segredos do orquestrador, entregues em tempo de execução, com rotação.',
          'Em um arquivo dentro da imagem, protegido por permissões de leitura.',
          'Em variáveis ENV do Dockerfile, para que toda cópia da imagem funcione igual.',
          'No repositório, em um arquivo de configuração privado do projeto.'
        ], 'Segredos em imagem ou repositório ficam no histórico e se espalham. Cofres permitem rotação, auditoria e acesso mínimo.'),
        mcq('q7', 'Uma API importa imagens a partir de uma URL fornecida pelo usuário. Qual conjunto de defesas é mais adequado contra SSRF?', 'b', [
          'Rodar a API como root para ter acesso a mais portas de saída.',
          'Lista de destinos permitidos, bloqueio de IPs internos e link-local após resolver o DNS, controle de redirecionamentos e egress restritivo.',
          'Registrar a URL nos logs completa para auditoria, incluindo parâmetros de consulta, o que mantém um histórico detalhado de quais endereços externos a aplicação consultou em nome dos usuários.',
          'Verificar apenas se a URL começa com https://.'
        ], 'Um https:// pode apontar para endereço interno. Registrar URLs inteiras ainda pode vazar dados pessoais. A defesa é por destino, IP final e rede de saída.'),
        fill('q8', 'Qual instrução do Dockerfile define o usuário não privilegiado em que o processo roda?', '___ 10001:10001', ['USER'], 'USER define o usuário (e grupo) do processo, evitando executar como root.')
      ]
    },
    {
      id: 'owi-22-nuvem-aplicacoes',
      title: 'Segurança em nuvem para aplicações',
      goal: 'Aplicar menor privilégio, proteger armazenamento e metadados e evitar os erros de configuração mais comuns na nuvem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Responsabilidade compartilhada e IAM com menor privilégio',
            'Na nuvem a segurança é dividida. O provedor protege a infraestrutura (datacenters, hardware, a camada de virtualização). Você protege o que coloca nela: identidades e permissões, configuração dos serviços, dados, código e a rede virtual. O quanto fica com você varia (máquina virtual, plataforma gerenciada, SaaS), mas identidades, dados e configuração continuam sendo do cliente. O IAM (gestão de identidade e acesso) é o controle central: conceda o menor privilégio, ou seja, só as ações necessárias nos recursos necessários. Uma política que permite todas as ações em todos os recursos (curinga `*`) transforma qualquer vazamento de credencial em tomada total da conta. Revise permissões periodicamente e remova as não usadas.',
            `# vulneravel (ilustrativo): permissao total
{ "Effect": "Allow", "Action": "*", "Resource": "*" }

# corrigido: so o necessario, no recurso certo
{ "Effect": "Allow",
  "Action": ["armazenamento:LerObjeto"],
  "Resource": "recurso/relatorios-da-aplicacao/*" }`
          ),
          sl(
            'Papéis em vez de chaves estáticas; segredos gerenciados',
            'Chaves de acesso estáticas e de longa duração são o vazamento clássico: ficam em código, repositórios e logs, e valem até alguém notar. A alternativa é dar à aplicação um papel (role/identidade gerenciada) vinculado ao recurso (VM, container, função): o provedor entrega credenciais temporárias que expiram e se renovam sozinhas, sem arquivo para vazar. Para o que ainda precisa ser segredo (senha de banco, chave de terceiros), use o serviço de segredos gerenciados do provedor, com rotação, controle de acesso por identidade e trilha de auditoria. Para pessoas, exija MFA, use acesso federado e evite a conta raiz/proprietária no dia a dia. Se uma chave vazar, revogue e rotacione imediatamente; apagar o commit não basta.'
          ),
          sl(
            'Armazenamento de objetos: privado por padrão',
            'Grande parte dos vazamentos de dados na nuvem vem de armazenamento de objetos (buckets) deixado público ou com permissões amplas por engano: relatórios, backups, uploads de usuários, exportações. Regras: tudo é privado por padrão, com os bloqueios de acesso público do provedor ativados em nível de conta; acesso concedido por papel ou por URLs pré-assinadas de curta duração; criptografia em repouso; versionamento e proteção contra exclusão para dados importantes; logs de acesso. Antes de publicar qualquer objeto, pergunte se ele precisa mesmo ser público (ativos estáticos de um site podem; dados pessoais não). Um bucket com dados pessoais exposto é um incidente de segurança com implicações de LGPD.',
            `# URL pre-assinada (ideia): acesso temporario a UM objeto
GET /relatorio-123.pdf?assinatura=<token>&expira=<instante-curto>

# vulneravel: leitura publica no bucket de uploads
principal: "todos"   acao: "ler"   recurso: "bucket-de-uploads/*"`
          ),
          sl(
            'Serviço de metadados, IMDSv2, rede e criptografia',
            'Instâncias de nuvem têm um serviço de metadados em um endereço local que entrega informações da máquina e credenciais temporárias do papel. Se uma aplicação sofre SSRF, o atacante tenta alcançá-lo para obter essas credenciais. Mitigações: usar a versão que exige sessão e cabeçalho especial (na AWS, IMDSv2), limitar o salto de rede para dificultar o acesso a partir de containers, aplicar mínimo privilégio ao papel (assim o roubo rende pouco) e bloquear o endereço no egress da aplicação. Outros controles de rede: grupos de segurança fechados por padrão (nada de `0.0.0.0/0` para SSH ou banco), WAF na frente de aplicações expostas, bancos em sub-redes privadas. Criptografia: dados em repouso e em trânsito, com chaves em um serviço gerenciado (KMS), controle de quem usa cada chave e rotação.',
            `# regras de entrada (exemplo ilustrativo)
# vulneravel:
porta 22 (SSH)     origem 0.0.0.0/0
porta 5432 (banco) origem 0.0.0.0/0
# corrigido:
porta 443 (app)    origem internet (atras de WAF/balanceador)
porta 5432 (banco) origem somente grupo-da-api`
          ),
          sl(
            'Auditoria, erros comuns, IaC e residência de dados',
            'Ative os logs de auditoria do provedor (quem chamou qual API, de onde, quando), envie-os para um local separado e protegido contra alteração, e crie alertas para eventos críticos (mudança de política, login da conta raiz, criação de chave). Erros de configuração frequentes: buckets públicos, permissões com curinga, portas abertas ao mundo, bancos acessíveis pela internet, chaves estáticas em repositórios, logs desativados, snapshots compartilhados publicamente, recursos esquecidos. Infraestrutura como código (Terraform, CloudFormation etc.) torna a configuração revisável e repetível e permite varredura de IaC (ferramentas como Checkov ou Trivy) antes da implantação, pegando erros no pull request. LGPD, em visão geral: saiba em que região os dados pessoais ficam, quais provedores os tratam e se há transferência internacional; isso entra no mapeamento de dados e nos contratos (não substitui orientação jurídica). Os conceitos valem para qualquer provedor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na responsabilidade compartilhada, qual item continua sendo do cliente, mesmo em serviços gerenciados?', 'b', [
          'O firmware dos servidores físicos.',
          'As identidades e permissões, a configuração dos recursos e os dados armazenados.',
          'A camada de virtualização do hardware.',
          'A segurança física dos datacenters do provedor.'
        ], 'O provedor cuida da infraestrutura subjacente; o cliente responde por IAM, configuração e dados.'),
        mcq('q2', 'Qual política IAM é mais adequada para uma aplicação que só precisa ler relatórios em um local específico?', 'a', [
          'Permitir só leitura nos objetos do local dos relatórios, para o papel da aplicação.',
          'Permitir todas as ações de armazenamento em todos os recursos, para facilitar futuras funcionalidades.',
          'Permitir leitura e escrita em todos os buckets, mas só durante o horário comercial, com revisão trimestral de acessos.',
          'Usar as credenciais do administrador da conta para evitar erros de permissão.'
        ], 'Menor privilégio: ação e recurso mínimos. Limitar horário não resolve o excesso de escopo.'),
        mcq('q3', 'Uma aplicação em uma VM precisa acessar o armazenamento de objetos. Qual é a forma mais segura de obter credenciais?', 'b', [
          'Colocar a chave de acesso em variável de ambiente no Dockerfile, para que a aplicação consiga lê-la sem precisar de arquivos.',
          'Vincular um papel à VM, que recebe credenciais temporárias renovadas automaticamente pelo provedor.',
          'Gerar uma chave estática, gravá-la em um arquivo na VM e proteger o arquivo com permissões, o que evita ter de configurar papéis e políticas de permissão no provedor de nuvem.',
          'Guardar a chave no repositório privado do projeto.'
        ], 'Credenciais temporárias via papel não deixam arquivos de longa duração para vazar. Repositórios privados também vazam.'),
        fill('q4', 'Qual tipo de URL concede acesso temporário a um único objeto privado sem tornar o bucket público? (complete o prefixo)', 'Use uma URL ___-assinada com expiração curta', ['pré', 'pre'], 'URLs pré-assinadas carregam uma assinatura e prazo curto; o bucket continua privado.'),
        mcq('q5', 'Por que o serviço de metadados da instância é alvo em ataques de SSRF, e qual mitigação ajuda?', 'a', [
          'Porque entrega credenciais temporárias do papel; usar a versão com sessão (IMDSv2), mínimo privilégio e bloqueio no egress reduz o dano.',
          'Porque guarda as senhas dos usuários finais; a mitigação é trocar o algoritmo de hash.',
          'Porque só é acessível por SSH; a mitigação é fechar a porta 22, e por isso uma mitigação suficiente seria fechar essa porta no grupo de segurança e manter a aplicação como está.',
          'Porque guarda os logs da aplicação; a mitigação é desligar os logs.'
        ], 'O SSRF faz o servidor pedir ao endereço local de metadados. IMDSv2 e menor privilégio reduzem o impacto.'),
        mcq('q6', 'Qual vantagem da varredura de IaC no pull request?', 'b', [
          'Substitui os logs de auditoria do provedor.',
          'Detecta configurações inseguras (bucket público, porta aberta ao mundo) antes de existirem em produção.',
          'Dispensa o uso de papéis, pois o código já estaria correto.',
          'Garante que a infraestrutura em execução nunca mude depois do deploy, porque o modelo de nuvem aplica as definições do repositório às contas existentes de forma retroativa.'
        ], 'Varredura de IaC é um controle preventivo no código. Não substitui auditoria nem detecta alterações manuais posteriores.'),
        mcq('q7', 'Esta regra de segurança é segura?\nporta 5432 (banco), origem 0.0.0.0/0', 'b', [
          'Sim, pois o banco exige senha e isso basta, e por isso a exposição à internet não representa um risco adicional para o serviço de dados da aplicação.',
          'Não: expõe o banco à internet; restrinja a origem ao grupo de segurança da API e mantenha o banco em sub-rede privada.',
          'Sim, desde que o banco use a porta padrão.',
          'Não, mas por falta de ativar a compressão de conexões, e o impacto seria apenas de desempenho nas consultas mais pesadas do dia a dia.'
        ], 'Senha fraca ou vazada, e falhas no software do banco, passam a ser alcançáveis por qualquer um. Reduza a superfície.'),
        fill('q8', 'Qual a sigla do serviço de gestão de chaves de criptografia da nuvem?', 'Chaves guardadas e controladas em um serviço ___', ['KMS'], 'KMS (Key Management Service) guarda e controla chaves com política de uso, auditoria e rotação.')
      ]
    },
    {
      id: 'owi-23-supply-chain',
      title: 'Segurança da cadeia de suprimentos de software',
      goal: 'Controlar dependências, builds e CI/CD para reduzir o risco de código de terceiros comprometido.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Dependências diretas e transitivas',
            'Sua aplicação usa as bibliotecas que você escolheu (dependências diretas), e cada uma usa outras (transitivas). Um projeto médio carrega centenas de pacotes que ninguém da equipe leu. Qualquer um deles, se vulnerável ou malicioso, executa com os poderes da sua aplicação. Por isso a cadeia de suprimentos é um alvo atraente: comprometer um pacote popular atinge todos os projetos que o usam. Pontos de partida: conheça o que você usa (inventário), prefira poucas dependências bem mantidas, remova as que não usa mais e acompanhe avisos de vulnerabilidade. O OWASP Top 10 trata disso em "componentes vulneráveis e desatualizados" e em falhas de integridade de software e dados.'
          ),
          sl(
            'Como pacotes maliciosos chegam até você',
            'Em visão geral, os caminhos são: confusão de dependências (dependency confusion), em que o gerenciador busca um nome de pacote interno em um registro público e instala uma versão publicada por terceiros com o mesmo nome; typosquatting, pacotes com nome parecido com o de um popular (`reqeusts`), esperando um erro de digitação; contas de mantenedores comprometidas (senha vazada, sem MFA), que publicam uma versão adulterada de um pacote legítimo; e pacotes úteis que mudam de dono. Muitos desses casos usam scripts de instalação (`postinstall`, `setup.py`), que rodam código na sua máquina ou no CI durante o `install`. Defesas: registro privado/proxy com escopos próprios (nomes internos reservados), conferir o nome antes de instalar, revisar mudanças de dono e ativar MFA nas suas contas de publicação.'
          ),
          sl(
            'Lockfiles, instalações reprodutíveis e fixação de versões',
            'O lockfile (`package-lock.json`, `poetry.lock`, `requirements.txt` com versões) registra exatamente quais versões, incluindo as transitivas, foram resolvidas. Com ele, a mesma instalação gera o mesmo resultado hoje e no mês que vem. No CI use comandos que respeitam o lockfile e falham se ele divergir do manifesto: `npm ci` (em vez de `npm install`). Em Python, `pip install --require-hashes -r requirements.txt` exige que cada pacote bata com um hash fixado no arquivo, impedindo troca silenciosa do conteúdo. Fixar versões evita que uma versão nova maliciosa entre sozinha, mas também impede correções automáticas: combine com um processo de atualização regular (bots de atualização) e revise o que muda em cada atualização. Para scripts de instalação, considere desativá-los quando não forem necessários (`npm ci --ignore-scripts`) e teste.',
            `# Node: instalacao reprodutivel a partir do lockfile
npm ci

# Python: hashes fixados (exemplo)
# requirements.txt
requests==<versao> \\
  --hash=sha256:<hash-do-arquivo>
pip install --require-hashes -r requirements.txt`
          ),
          sl(
            'SBOM, assinatura e proveniência',
            'Um SBOM (Software Bill of Materials) é a lista de ingredientes do software: componentes, versões e relações, em formatos padronizados como SPDX e CycloneDX. Quando surge uma nova vulnerabilidade, o SBOM responde rápido "estamos afetados?". A assinatura prova quem produziu um artefato e que ele não foi alterado: ferramentas como Sigstore/cosign assinam imagens de container e outros artefatos. A proveniência descreve como e onde o artefato foi construído (qual commit, qual pipeline); o framework SLSA define níveis crescentes de garantia para builds automatizados, isolados e atestados. Na implantação, o ideal é verificar a assinatura e só aceitar artefatos produzidos pelo seu pipeline. Tudo isso é visão geral: comece pelo SBOM e pela assinatura, depois aprofunde.'
          ),
          sl(
            'Endurecendo o CI/CD',
            'O pipeline tem acesso a segredos e publica em produção, então é alvo valioso. Práticas: dar ao token do pipeline as permissões mínimas (somente leitura do repositório por padrão; escrever só onde precisa); fixar ações/plugins de terceiros por versão imutável (um hash de commit) em vez de uma tag que pode ser movida; não expor segredos a builds de forks ou de pull requests não confiáveis; mascarar segredos nos logs e não imprimi-los; usar runners efêmeros (descartados após cada job) para não herdar estado de outro build; separar ambientes (o job de teste não tem credenciais de produção); e exigir revisão de mudanças nos próprios arquivos do pipeline. Credenciais de curta duração via federação (OIDC) são melhores que chaves fixas guardadas como segredo.',
            `# exemplo ilustrativo (GitHub Actions)
permissions:
  contents: read          # minimo; amplie so no job que precisa
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<hash-do-commit-completo>
      - run: npm ci
# evitar: uses: acao-de-terceiro@main   (referencia movel)`
          ),
          sl(
            'Registros privados e scripts de instalação',
            'Um registro privado (ou proxy/espelho do registro público) é o ponto de controle: a equipe instala só a partir dele; pacotes novos podem ser analisados antes de serem liberados; nomes internos ficam reservados, o que combate a confusão de dependências; e há cópia local caso o pacote público seja removido. Configure o gerenciador para usar escopos (`@empresa/pacote`) associados ao registro privado. Quanto aos scripts `postinstall`: eles executam código arbitrário na instalação, no seu computador e no CI. Em projetos sensíveis, desative-os por padrão e libere só os necessários, e rode instalações em ambientes sem segredos. Nenhuma dessas medidas é perfeita sozinha; combinadas (lockfile, hash, registro controlado, revisão, CI limitado), reduzem muito a janela de exposição.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza um ataque de confusão de dependências?', 'a', [
          'O gerenciador resolve um nome de pacote interno a partir do registro público, instalando uma versão de terceiros com o mesmo nome.',
          'Um pacote legítimo é substituído no repositório do mantenedor depois de uma invasão da conta dele, e esse é o mecanismo central do ataque, que depende de a conta do mantenedor estar sem autenticação multifator.',
          'Um pacote popular é copiado com nome ligeiramente diferente, esperando erro de digitação.',
          'Duas bibliotecas diferentes exigem versões incompatíveis de uma terceira.'
        ], 'Quando nomes internos não estão reservados no registro privado, o gerenciador pode preferir uma versão pública. Typosquatting é o caso do erro de digitação.'),
        mcq('q2', 'No CI, qual comando garante instalação reprodutível a partir do lockfile, falhando se ele divergir do package.json?', 'd', [
          '`npm audit fix --force`',
          '`npm install --latest`',
          '`npm update`',
          '`npm ci`'
        ], 'npm ci instala exatamente o lockfile e falha em divergências. Os demais podem alterar versões.'),
        mcq('q3', 'Qual é o propósito do `pip install --require-hashes -r requirements.txt`?', 'c', [
          'Criptografar os pacotes instalados no disco.',
          'Verificar se o pacote tem vulnerabilidades conhecidas, e assim todos os projetos teriam o mesmo conjunto de dependências.',
          'Exigir que cada pacote baixado corresponda a um hash fixado, impedindo a troca silenciosa do conteúdo.',
          'Atualizar os pacotes para a última versão disponível, o que reduz o risco de a versão nova introduzir alguma falha ainda desconhecida no projeto.'
        ], 'Os hashes fixam o conteúdo exato. Não é um scanner de vulnerabilidades (isso é SCA) nem atualiza versões.'),
        fill('q4', 'Qual a sigla da lista de componentes e versões de um software, em formatos como SPDX e CycloneDX?', 'Gerar o ___ no build para saber o que está dentro do artefato', ['SBOM'], 'SBOM (Software Bill of Materials) é o inventário de componentes do software.'),
        mcq('q5', 'Qual referência em um workflow de CI é mais segura para uma ação de terceiros?', 'b', [
          'O nome da ação sem referência, usando o padrão do registro.',
          'O hash completo de um commit revisado, que é imutável.',
          'A tag `main`, para receber as correções mais recentes automaticamente.',
          'Uma tag de versão como v3, que pode ser movida pelo mantenedor.'
        ], 'Tags e branches podem ser reapontadas; o hash do commit não. Atualize o hash conscientemente, revisando o que mudou.'),
        mcq('q6', 'Qual prática reduz o dano se um job de CI for comprometido?', 'c', [
          'Guardar todos os segredos de produção como variáveis disponíveis a todos os jobs.',
          'Imprimir os segredos nos logs para facilitar a depuração.',
          'Token com permissões mínimas, segredos só nos jobs que precisam e runners efêmeros.',
          'Reutilizar o mesmo runner por semanas para acelerar o cache.'
        ], 'Menor privilégio e isolamento limitam o que um job malicioso alcança. Logs com segredos viram vazamento.'),
        mcq('q7', 'Para que serve assinar uma imagem com cosign (Sigstore) e verificar a assinatura na implantação?', 'd', [
          'Substituir o SBOM, pois a assinatura já lista os componentes.',
          'Reduzir o tamanho da imagem armazenada no registro.',
          'Provar que a imagem não contém nenhuma vulnerabilidade, pois o cosign analisa o conteúdo da imagem e confirma que as dependências foram revisadas antes da assinatura.',
          'Garantir que o artefato foi produzido por uma identidade esperada e não foi alterado depois.'
        ], 'Assinatura comprova origem e integridade, não ausência de vulnerabilidades. SBOM e assinatura são complementares.'),
        fill('q8', 'Qual script de ciclo de vida do npm executa automaticamente após instalar um pacote e deve ser tratado com cautela?', '"scripts": { "___": "node setup.js" }', ['postinstall'], 'postinstall roda código arbitrário na instalação; pode ser desativado com --ignore-scripts quando possível.')
      ]
    },
    {
      id: 'owi-24-sast-dast-sca',
      title: 'SAST, DAST, SCA e IAST na prática',
      goal: 'Saber o que cada técnica de análise automatizada encontra e não encontra, onde rodá-la e como lidar com falsos positivos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'SAST: analisar o código sem executá-lo',
            'SAST (Static Application Security Testing) lê o código-fonte (ou bytecode) e procura padrões perigosos: SQL montado por concatenação, uso de `eval`, funções criptográficas fracas, fluxo de dado não confiável até um ponto perigoso. Roda cedo (no editor, no pull request), aponta arquivo e linha e não precisa que a aplicação esteja no ar. Exemplos de ferramentas, em visão geral: Semgrep (regras em padrões de código), CodeQL (consulta o código como um banco de dados) e SonarQube. Limites: não enxerga configuração de execução nem comportamento em produção, tem dificuldade com lógica de negócio e gera falsos positivos quando não entende o contexto (por exemplo, uma entrada que já foi validada em outro ponto).',
            `# exemplo ilustrativo de achado SAST (formato generico)
regra:   sql-por-concatenacao      severidade: ALTA
arquivo: app/pedidos.py:42
trecho:  db.execute("select * from t where id=" + request.args["id"])
correcao sugerida: usar consulta parametrizada`
          ),
          sl(
            'DAST e IAST: ver a aplicação funcionando',
            'DAST (Dynamic Application Security Testing) testa a aplicação em execução, de fora, como um cliente HTTP: envia requisições, observa respostas e procura sinais de falha (cabeçalhos ausentes, erros reveladores, reflexão de entrada). Não precisa do código e funciona com qualquer linguagem; o OWASP ZAP é o exemplo de código aberto. Limites: precisa de um ambiente rodando (e de autenticação configurada para alcançar áreas protegidas), costuma ser mais lento, e não aponta a linha de código. A varredura ativa envia entradas de ataque, por isso roda só em ambiente autorizado e de teste. IAST (Interactive AST), em visão geral, instrumenta a aplicação com um agente que observa o fluxo de dados por dentro enquanto testes (automatizados ou manuais) exercitam o sistema; une precisão do conhecimento interno com a prova de execução, mas exige instalar o agente e só vê o que os testes exercitam.'
          ),
          sl(
            'SCA e segredos: o que vem de fora e o que vazou',
            'SCA (Software Composition Analysis) compara as dependências do projeto, diretas e transitivas, com bases de vulnerabilidades conhecidas (CVE). Ferramentas: `npm audit`, `pip-audit`, OWASP Dependency-Check e Trivy (que também examina imagens de container e IaC). O SCA só encontra problemas já publicados; não vê falhas no seu código nem vulnerabilidades ainda desconhecidas, e é preciso avaliar se a função vulnerável é realmente alcançada. Varredura de segredos (gitleaks, trufflehog) procura chaves, tokens e senhas no código e no histórico do Git. Se um segredo vazou, a primeira ação é revogá-lo e gerar um novo; só depois limpar o histórico, porque quem clonou o repositório já pode tê-lo copiado.',
            `# exemplos (comandos reais, rodar no seu projeto)
npm audit
pip-audit
gitleaks detect

# saida ilustrativa de SCA (exemplo ilustrativo)
pacote-x  1.2.0  GHSA-xxxx-xxxx  severidade ALTA
caminho: app > lib-a > pacote-x   corrigido em: 1.2.5`
          ),
          sl(
            'Falsos positivos, falsos negativos, triagem e baseline',
            'Falso positivo: a ferramenta alerta, mas não há vulnerabilidade real (custa tempo e desgasta a confiança). Falso negativo: existe a falha e a ferramenta não a vê (cria falsa sensação de segurança, é o mais perigoso). Nenhuma ferramenta elimina os dois. A triagem decide, para cada achado: é real? é alcançável? qual o impacto? Registre a decisão (corrigir, aceitar com prazo, marcar como falso positivo com justificativa). Ao introduzir uma ferramenta em um projeto antigo, crie um baseline: os achados existentes são registrados e tratados em fila própria, e o pipeline falha só para achados novos. Assim a equipe não é soterrada no primeiro dia.'
          ),
          sl(
            'Onde rodar no pipeline e como definir políticas',
            'Cada técnica tem seu melhor lugar. Pré-commit: varredura de segredos (rápida, evita que o vazamento entre no histórico). Pull request: SAST e SCA (rápidos, o autor ainda tem o contexto). Build: varredura de imagens, SBOM. Homologação: DAST contra o ambiente de teste. Produção: monitoramento. Defina políticas por severidade: críticos e altos novos bloqueiam a mesclagem; médios geram tarefa com prazo; baixos são acompanhados. Bloquear tudo, inclusive achados de baixa confiança, faz a equipe desligar a ferramenta ou ignorar os alertas. Lembre que ferramentas automáticas não substituem revisão de código e testes manuais: elas são fracas em controle de acesso, lógica de negócio e abuso de fluxos, justamente onde estão muitas falhas graves.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um agente instalado dentro da aplicação observa o fluxo de dados enquanto os testes automatizados são executados e indica onde uma entrada chega a um ponto perigoso. Que técnica é essa?', 'c', [
          'SAST, pois analisa o código-fonte antes de a aplicação ser executada.',
          'SCA, pois compara as dependências com bases de vulnerabilidades conhecidas.',
          'IAST, pois instrumenta a aplicação em execução e observa o fluxo de dados por dentro.',
          'DAST, pois envia requisições de fora e examina somente as respostas HTTP.'
        ], 'A instrumentação por agente durante a execução de testes é a característica do IAST. SAST lê código; DAST testa de fora; SCA analisa dependências.'),
        mcq('q2', 'Qual tipo de falha costuma escapar das ferramentas automáticas e exige revisão e testes manuais?', 'b', [
          'Uso de uma função de hash obsoleta, que é reconhecida por regras simples de SAST, já que esse tipo de falha está documentado em listas públicas.',
          'Controle de acesso e lógica de negócio, como um usuário acessar o pedido de outro ou burlar uma etapa do fluxo.',
          'Dependência com vulnerabilidade já publicada em base de CVE, que o SCA encontra, e por isso o SCA seria a ferramenta suficiente para cobrir a regra de posse do negócio sobre os objetos.',
          'Ausência de cabeçalhos de segurança, que o DAST detecta de forma passiva.'
        ], 'Ferramentas não entendem a intenção do negócio (quem deveria acessar o quê). Por isso testes de autorização e revisão humana são indispensáveis.'),
        mcq('q3', 'O gitleaks encontra uma chave de API de produção em um commit antigo do repositório. Qual é a ação correta?', 'b', [
          'Mover a chave para um arquivo .env e manter o valor atual, já que o repositório é privado.',
          'Revogar e rotacionar a chave imediatamente, verificar usos indevidos e depois remover do histórico e prevenir recorrência.',
          'Reescrever o histórico do Git para apagar o commit e manter a mesma chave em uso, o que invalida a chave sem precisar substituí-la, já que o histórico deixa de conter o valor exposto.',
          'Marcar o achado como falso positivo, pois o commit é antigo e ninguém notou.'
        ], 'A chave deve ser tratada como comprometida: apagar o commit não desfaz cópias. Repositório privado também vaza (clones, backups, ex-colaboradores).'),
        fill('q4', 'Qual a sigla da técnica que testa a aplicação em execução, de fora, sem acesso ao código?', '___ (Dynamic Application Security Testing)', ['DAST'], 'DAST testa a aplicação em execução como um cliente; o OWASP ZAP é um exemplo.'),
        mcq('q5', 'A ferramenta de SAST não acusa nada, mas existe uma injeção de SQL em um fluxo que ela não consegue seguir. Como se classifica e o que implica?', 'a', [
          'Falso negativo: a falha existe e passou despercebida, criando falsa sensação de segurança.',
          'Falso positivo: gera alertas desnecessários e desgasta a confiança na ferramenta.',
          'Verdadeiro positivo: a ferramenta fez a análise corretamente e a falha está documentada.',
          'Verdadeiro negativo: a ausência de alerta mostra que a análise considerou o fluxo seguro.'
        ], 'Falso negativo é falha real não detectada, o caso mais perigoso por sugerir segurança onde não há.'),
        mcq('q6', 'Em qual etapa do pipeline é mais útil rodar a varredura de segredos, e por quê?', 'a', [
          'No pré-commit (e no PR), porque impede que o segredo entre no histórico do repositório.',
          'Depois do deploy, para confirmar se algum segredo foi publicado por engano.',
          'Em produção, porque só ali os segredos são usados de fato pela aplicação.',
          'Em homologação, porque lá o ambiente já tem as credenciais reais para testar.'
        ], 'Quanto mais cedo, menor o custo: um segredo que nunca entra no histórico não precisa de limpeza. Depois do deploy já pode ter sido exposto.'),
        mcq('q7', 'Um relatório de SCA ilustrativo mostra: pacote-x 1.2.0, severidade ALTA, corrigido em 1.2.5, usado como dependência transitiva de lib-a. Qual é a ação mais adequada?', 'b', [
          'Ignorar, pois a dependência é transitiva e não foi escolhida pela equipe.',
          'Atualizar lib-a ou fixar pacote-x na versão corrigida, testar e verificar se a função vulnerável é alcançável para definir a urgência.',
          'Remover todo o lockfile e reinstalar tudo, esperando que a versão correta seja escolhida, o que garante que nenhuma versão vulnerável permaneça no cache local do gerenciador de pacotes.',
          'Bloquear qualquer mesclagem por tempo indeterminado até que o autor da lib-a corrija.'
        ], 'Dependências transitivas executam com os poderes da aplicação. Atualize ou force a versão corrigida e avalie a alcançabilidade para priorizar.'),
        fill('q8', 'Qual comando do npm compara as dependências do projeto com vulnerabilidades conhecidas?', 'npm ___', ['audit'], 'npm audit é a verificação SCA embutida no npm.')
      ]
    },
    {
      id: 'owi-25-zap-testes-dinamicos',
      title: 'OWASP ZAP e testes dinâmicos em laboratório',
      goal: 'Entender proxies de interceptação, os modos do ZAP e como ler alertas, rodando só contra alvos próprios ou autorizados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autorização primeiro: laboratório próprio e escopo',
            'Testes dinâmicos enviam requisições de teste para um sistema. Contra sistemas de terceiros, sem autorização escrita e escopo definido, isso pode ser crime (Lei 12.737/2012, que trata de invasão de dispositivo informático) e viola o Marco Civil da Internet; mesmo em sistemas seus, uma varredura pode derrubar o ambiente ou gravar dados de teste. Regra deste curso: alvos de treino rodando na sua máquina (OWASP Juice Shop, DVWA, WebGoat) ou ambientes de homologação da sua organização com autorização por escrito. O contrato de escopo diz quais endereços, quais horários e quais técnicas são permitidos. Fora disso, não teste. Ao achar uma falha em sistema alheio por acaso, a conduta é a divulgação responsável: avisar o responsável pelo canal indicado, sem explorar além do necessário.'
          ),
          sl(
            'O que é um proxy de interceptação',
            'Um proxy de interceptação fica entre o navegador e o servidor: o navegador envia as requisições ao proxy, que as repassa ao servidor e devolve as respostas. No meio do caminho você enxerga cada requisição e resposta (cabeçalhos, cookies, corpo), pode pausar, alterar e reenviar. Isso permite testar o que a interface não deixa fazer, como mudar um parâmetro oculto, reenviar uma requisição com outro identificador de objeto (para verificar autorização) ou inspecionar o que o front-end realmente manda. Para HTTPS, o proxy usa um certificado próprio que você instala no navegador de teste; por isso use um perfil de navegador separado, só para laboratório, e remova o certificado depois. O OWASP ZAP é um proxy de interceptação com scanner embutido.'
          ),
          sl(
            'Modos do ZAP: baseline, full scan e API scan',
            'O ZAP distribui scripts prontos para empacotar varreduras em linha de comando e CI. `zap-baseline.py`: faz o spider por um tempo limitado e roda só regras passivas; é rápido e seguro para rodar com frequência, não ataca ativamente. `zap-full-scan.py`: spider mais varredura ativa, que envia entradas de ataque (injeção, XSS etc.); só em alvo autorizado e de teste. `zap-api-scan.py`: recebe uma definição OpenAPI, SOAP ou GraphQL e varre os endpoints descritos nela. Em visão geral: o ZAP também tem interface gráfica, API e modo daemon. Contra o Juice Shop local, sem tocar em nada de terceiros:',
            `# 1) alvo de treino, so acessivel da propria maquina
docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop

# 2) varredura passiva (baseline) apontando para o alvo local
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable \\
  zap-baseline.py -t http://host.docker.internal:3000
# o nome host.docker.internal pode variar conforme o sistema`
          ),
          sl(
            'Contexto, escopo, spider e AJAX spider',
            'O contexto define o que o ZAP considera "a aplicação": padrões de URL incluídos e excluídos, usuários e forma de autenticação. Manter o escopo estreito evita que o scanner siga links para sites externos ou páginas de logout. Para descobrir páginas, o spider tradicional segue links presentes no HTML. Aplicações modernas (SPAs) montam a navegação com JavaScript, então o spider comum vê pouco; o AJAX spider dirige um navegador de verdade, clica, executa JavaScript e descobre rotas e requisições geradas dinamicamente. Quanto melhor o mapeamento, melhor a cobertura da varredura, pois o scanner só testa o que conhece.'
          ),
          sl(
            'Varredura passiva vs ativa, e autenticação nos scans',
            'A varredura passiva apenas observa o tráfego que passa pelo ZAP (cabeçalhos ausentes, cookies sem flags, mensagens de erro, comentários reveladores): não altera nada e é de baixo risco. A varredura ativa envia requisições modificadas para provocar falhas (entradas de injeção, tentativas de XSS, travessia de diretórios); pode criar registros, travar telas e disparar alertas, por isso exige alvo autorizado e ambiente de teste com dados fictícios. Muitas falhas só aparecem depois do login, então configure autenticação no contexto (formulário, token ou script), indique como o ZAP reconhece que está logado e use contas de teste dedicadas. Nunca use contas reais nem credenciais de produção.'
          ),
          sl(
            'Ler um alerta, triar e usar no CI',
            'Cada alerta traz: nome e descrição, risco (alto, médio, baixo, informativo), confiança (quão certo o ZAP está de que é real), URL e parâmetro afetados, evidência (o trecho da resposta que motivou o alerta), solução e referências (CWE, OWASP). Risco e confiança são coisas diferentes: um alerta de risco médio e confiança baixa precisa de verificação manual antes de virar tarefa. Falsos positivos devem ser documentados e silenciados com justificativa. No CI, o `zap-baseline` roda a cada mudança contra um ambiente efêmero de testes e falha o job conforme uma configuração de regras; é bom para regressão, mas limitado: não faz login complexo sozinho, não entende lógica de negócio nem autorização entre usuários. Complete com testes manuais e automatizados de autorização.',
            `# exemplo ilustrativo de alerta
Nome:       Cabecalho Content-Security-Policy ausente
Risco:      Medio      Confianca: Alta
URL:        http://localhost:3000/
Evidencia:  (resposta sem o cabecalho)
Solucao:    definir uma politica CSP restritiva no servidor`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a função de um proxy de interceptação como o ZAP durante um teste?', 'd', [
          'Bloquear as requisições maliciosas que chegam ao servidor de produção.',
          'Criptografar o tráfego entre o navegador e o servidor, tornando-o ilegível, evitando a leitura do conteúdo por terceiros na rede.',
          'Corrigir automaticamente as falhas encontradas no código da aplicação, o que torna desnecessária a revisão posterior dessas correções pela equipe de desenvolvimento.',
          'Ficar entre o navegador e o servidor, permitindo ver, pausar, alterar e reenviar requisições e respostas.'
        ], 'O proxy deixa o testador observar e manipular o tráfego, inclusive o que a interface não permite enviar. Ele não corrige código nem protege produção.'),
        mcq('q2', 'Qual a diferença essencial entre a varredura passiva e a ativa do ZAP?', 'c', [
          'A passiva testa apenas HTTPS; a ativa testa apenas HTTP.',
          'A passiva é paga; a ativa é a versão gratuita para laboratório, mas a ativa é obrigatória em qualquer execução do ZAP, inclusive no modo baseline em integração contínua.',
          'A passiva só observa o tráfego sem enviar ataques; a ativa envia entradas de teste maliciosas e exige alvo autorizado.',
          'A passiva exige o código-fonte; a ativa funciona sem ele.'
        ], 'A passiva analisa respostas do tráfego existente. A ativa gera requisições de ataque e pode causar efeitos colaterais, por isso só em ambiente autorizado.'),
        mcq('q3', 'Um colega sugere rodar o zap-full-scan.py contra o site público de um concorrente "só para ver o que acha". O que responder?', 'c', [
          'Pode, se os resultados forem usados apenas internamente e não publicados, pois a divulgação pública só ocorreria se o responsável pelo site fosse avisado e os dados fossem anonimizados.',
          'Pode, desde que o scan rode em horário de baixo movimento do site.',
          'Não: sem autorização escrita e escopo definido isso pode configurar crime e violar a lei; teste só alvos próprios ou autorizados, como o Juice Shop local.',
          'Pode, se o scan usar apenas regras passivas, que são inofensivas em qualquer caso, pois os dados coletados ficam restritos à equipe que executou a varredura, sem divulgação.'
        ], 'Autorização é condição para qualquer teste. Horário, finalidade ou sigilo dos resultados não substituem permissão, e o scan completo envia ataques.'),
        fill('q4', 'Qual script do ZAP faz uma varredura rápida, só com regras passivas, indicado para rodar com frequência no CI?', '___.py -t http://alvo-autorizado', ['zap-baseline'], 'zap-baseline.py faz spider limitado e regras passivas, sendo adequado para execuções frequentes.'),
        mcq('q5', 'Por que o AJAX spider é útil em uma SPA?', 'd', [
          'Porque ele ignora o escopo definido e testa qualquer domínio linkado.',
          'Porque converte automaticamente a SPA em páginas HTML estáticas para análise, o que dispensa o uso de um navegador real durante a varredura de rotas e de requisições dinâmicas.',
          'Porque substitui a necessidade de configurar autenticação no scan.',
          'Porque usa um navegador de verdade, executa JavaScript e descobre rotas e requisições geradas dinamicamente.'
        ], 'Rotas de SPA não aparecem como links no HTML; o AJAX spider dirige um navegador para descobri-las. O escopo continua valendo.'),
        mcq('q6', 'Um alerta do ZAP tem risco Médio e confiança Baixa. Qual é o próximo passo?', 'c', [
          'Aumentar a severidade no relatório para que a equipe preste atenção.',
          'Descartar, pois confiança baixa significa que o alerta é sempre um falso positivo.',
          'Verificar manualmente (reproduzir e examinar a evidência) antes de decidir corrigir, aceitar ou marcar como falso positivo.',
          'Corrigir imediatamente como se fosse crítico, sem verificar nada, já que o ZAP só emite alertas de confiança baixa quando o risco real é alto, o que justificaria a correção imediata.'
        ], 'Confiança baixa indica incerteza do ZAP, não irrelevância. Reproduza e analise a evidência antes de decidir.'),
        mcq('q7', 'Qual afirmação sobre o uso do ZAP baseline no CI é correta?', 'b', [
          'Só funciona contra ambientes de produção, que já têm dados reais para testar.',
          'Ajuda a detectar regressões como cabeçalhos ausentes, mas não substitui testes de autorização nem de lógica de negócio.',
          'Dispensa a revisão de código, pois cobre tudo o que um revisor encontraria, pois o baseline executa a mesma bateria de ataques ativos que o scan completo, só que de forma mais rápida.',
          'Garante que a aplicação está livre de injeção de SQL, pois testa ativamente todos os campos.'
        ], 'O baseline é passivo e rápido: bom para regressão de configuração, limitado para falhas de lógica e controle de acesso.'),
        fill('q8', 'Para o Juice Shop local ficar acessível só da sua máquina, publique a porta em qual endereço?', 'docker run --rm -p ___:3000:3000 bkimminich/juice-shop', ['127.0.0.1', 'localhost'], 'Publicar em 127.0.0.1 evita expor a aplicação vulnerável de treino para outros computadores da rede.')
      ]
    },
    {
      id: 'owi-26-teste-manual-wstg',
      title: 'Teste manual e a metodologia OWASP WSTG',
      goal: 'Seguir uma metodologia estruturada de teste manual, registrar evidências e reportar falhas com impacto e correção, sempre com autorização.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o WSTG e suas categorias',
            'O Web Security Testing Guide (WSTG) da OWASP é um guia aberto com procedimentos de teste organizados por categoria, para que o teste manual seja sistemático e repetível em vez de improvisado. As categorias: coleta de informações; teste de configuração e implantação; gestão de identidade; autenticação; autorização; gerenciamento de sessão; validação de entrada; tratamento de erros; criptografia; lógica de negócio; testes do lado do cliente; e testes de APIs. Cada item descreve o objetivo, como verificar e como remediar. O guia serve também para quem desenvolve: cada teste é um requisito de segurança em forma de pergunta (por exemplo, "o servidor revela versões e erros detalhados?").'
          ),
          sl(
            'Fluxo de trabalho: mapear, entender, testar, registrar',
            'Um teste manual segue quatro passos. 1) Mapear a aplicação: páginas, rotas, perfis de usuário, entradas (formulários, parâmetros, cabeçalhos, uploads), APIs e integrações. 2) Entender o fluxo: o que a aplicação deveria permitir a cada papel, quais etapas são obrigatórias (cadastro, pagamento, aprovação), onde há dados sensíveis. 3) Testar por categoria do WSTG, começando pelo que tem mais impacto (autorização e autenticação costumam render mais que cabeçalhos). 4) Registrar evidências conforme avança: requisição e resposta, horário, conta usada, captura de tela. Anotar enquanto testa evita refazer e dá base ao relatório.'
          ),
          sl(
            'Ferramentas: DevTools, proxy e curl',
            'O básico já resolve muito. As DevTools do navegador (aba Rede) mostram requisições, cookies, armazenamento local e o código que o front-end carrega. Um proxy (ZAP ou similar) permite pausar, alterar e reenviar. O `curl` reproduz uma requisição exata, útil para provar um achado e para testar a API sem o front-end: trocar o identificador de um objeto, remover o token, mudar o método. Tudo isso apenas em laboratório próprio ou alvo autorizado, com contas de teste e dados fictícios. Para verificar uma falha de autorização em um app de treino, por exemplo, você autentica como o usuário A, tenta ler um objeto do usuário B e confere se a resposta deveria ser negada.',
            `# cabecalhos da resposta de um app de TREINO local
curl -I http://localhost:3000/

# testar autorizacao (conta de teste A tentando objeto do usuario B)
curl -i -H "Authorization: Bearer <token-do-usuario-A>" \\
  http://localhost:3000/api/pedidos/<id-do-usuario-B>
# esperado em app seguro: 403 ou 404`
          ),
          sl(
            'Pensar como o desenvolvedor e como o atacante',
            'Dois olhares se complementam. Como desenvolvedor, você pergunta: o que a aplicação assume sobre a entrada? Onde está a verificação de permissão? O que acontece se o campo vier vazio, enorme, com tipo diferente? Como atacante (no sentido de testador autorizado), você pergunta: o que acontece se eu pular uma etapa, repetir uma requisição, mudar o ID, usar a conta de outro papel, enviar a requisição fora de ordem? Boa parte das falhas graves não vem de entradas "estranhas", mas de uso legítimo da aplicação em ordem ou com valores que o desenvolvedor não previu. Listar o que o sistema supõe e tentar violar cada suposição, em ambiente seguro, é o coração do teste manual.'
          ),
          sl(
            'Escopo, regras de engajamento e autorização por escrito',
            'Antes do primeiro pacote, defina por escrito: o escopo (domínios, endereços, ambientes, funcionalidades incluídas e excluídas), o período, as técnicas permitidas e proibidas (por exemplo, sem negação de serviço, sem engenharia social, sem acesso a dados reais além do estritamente necessário para provar o achado), os canais de comunicação e de emergência, e o tratamento de dados pessoais encontrados (LGPD): não copiar nem guardar além do mínimo e relatar o ocorrido. Esse documento é a autorização; sem ele, o teste não deve ocorrer. Em ambiente de treino, os mesmos hábitos valem como prática: laboratório isolado, dados fictícios, nada exposto na rede. Se algo fora do escopo for alcançado por acidente, pare e comunique.'
          ),
          sl(
            'Reportar: impacto, reprodução e correção',
            'Um bom relatório é feito para quem vai corrigir. Para cada achado inclua: título claro; onde ocorre; descrição curta; impacto no negócio (o que poderia acontecer: dados de quem, que operação); passos de reprodução objetivos (requisição, conta usada, resultado esperado e obtido); evidência (sem expor dados pessoais reais: mascare); gravidade com justificativa; recomendação de correção específica (a consulta parametrizada, a checagem de dono) e referência (CWE, WSTG). Comece por um resumo executivo com os riscos principais e priorize. Depois da correção, reteste e registre que a falha foi verificada como resolvida. O objetivo do teste não é provar habilidade, é reduzir risco.',
            `Titulo: Leitura de pedido de outro usuario (BOLA)
Onde: GET /api/pedidos/{id}
Impacto: qualquer usuario autenticado le pedidos alheios
Reproducao: 1) logar como A  2) GET /api/pedidos/<id de B>  3) resposta 200
Gravidade: Alta (dados pessoais expostos)
Correcao: filtrar por cliente_id do usuario autenticado; retornar 404
Verificacao: reteste apos correcao -> 404`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o WSTG da OWASP?', 'd', [
          'Um conjunto de bibliotecas que bloqueia ataques em tempo de execução.',
          'Uma ferramenta que varre a aplicação e corrige automaticamente as falhas.',
          'Uma lista dos dez riscos mais críticos, sem procedimentos de teste.',
          'Um guia aberto de procedimentos de teste de segurança web, organizado por categorias.'
        ], 'O WSTG descreve como testar cada categoria. A lista dos dez riscos é o OWASP Top 10, que é outro documento.'),
        mcq('q2', 'Qual é a ordem lógica do fluxo de um teste manual?', 'd', [
          'Registrar evidências, testar, mapear e só depois entender o fluxo da aplicação.',
          'Testar todas as entradas com valores aleatórios e mapear as rotas no final.',
          'Entender o fluxo, escrever o relatório e só depois testar para confirmar o que foi escrito.',
          'Mapear a aplicação, entender o fluxo, testar por categoria e registrar evidências ao longo do caminho.'
        ], 'Sem mapa e sem entendimento do fluxo, o teste fica aleatório; as evidências devem ser anotadas durante, não depois.'),
        mcq('q3', 'Um testador autorizado quer verificar autorização em um app de treino local. Qual teste é mais direto?', 'a', [
          'Autenticar como o usuário A e tentar acessar um objeto do usuário B, esperando negação.',
          'Procurar o endereço da aplicação em buscadores e testar sites parecidos.',
          'Enviar milhares de requisições por segundo até a aplicação cair, e isso mostra se o sistema aguenta o volume de acessos de um dia de grande campanha comercial.',
          'Testar só os cabeçalhos HTTP, pois indicam o controle de acesso.'
        ], 'Trocar identificadores entre contas de teste é o método clássico para detectar falhas de autorização por objeto. Derrubar o serviço não é o objetivo e fora do escopo é proibido.'),
        fill('q4', 'Qual opção do curl exibe apenas os cabeçalhos da resposta (requisição HEAD)?', 'curl ___ http://localhost:3000/', ['-I', '--head'], 'curl -I envia uma requisição HEAD e mostra os cabeçalhos, útil para inspecionar configuração de segurança.'),
        mcq('q5', 'Antes de iniciar um teste em um ambiente de homologação da empresa, o que deve existir?', 'b', [
          'Uma varredura prévia para descobrir o que está em escopo.',
          'Autorização por escrito com escopo, período, técnicas permitidas e canais de comunicação definidos.',
          'A conta de administrador do ambiente, para evitar bloqueios.',
          'Um acordo verbal com o líder técnico, pois o ambiente não é de produção.'
        ], 'O documento de escopo e regras de engajamento é a autorização. Descobrir o escopo por varredura inverte a ordem.'),
        mcq('q6', 'Qual descrição de impacto é mais útil em um relatório?', 'c', [
          'A API não segue as melhores práticas de segurança do setor.',
          'Foi encontrada uma falha de autorização, ver o anexo técnico, o que indica o tipo de falha e o local onde ela foi encontrada pelo testador.',
          'Qualquer usuário autenticado pode ler pedidos de outras pessoas por meio do identificador na URL, expondo dados pessoais.',
          'A aplicação é vulnerável a BOLA, o que é grave, e isso basta para o responsável priorizar a correção sem outras informações sobre os dados envolvidos ou a forma de reprodução.'
        ], 'O impacto deve dizer quem pode fazer o quê e com que dados. Frases genéricas não ajudam a priorizar nem a corrigir.'),
        mcq('q7', 'Durante o teste, o testador encontra por acidente uma planilha com dados pessoais reais fora do escopo. O que fazer?', 'b', [
          'Continuar explorando o sistema para entender a origem do vazamento.',
          'Parar de acessar, não copiar nem guardar os dados e comunicar o responsável pelo canal combinado.',
          'Baixar a planilha como evidência do achado.',
          'Compartilhar o link com a equipe de teste para que todos analisem.'
        ], 'Dados pessoais exigem mínimo contato (LGPD). Comunicar e interromper o acesso fora do escopo é a conduta correta.'),
        fill('q8', 'Complete a sigla: Web Security Testing ___ (WSTG)', 'Web Security Testing ___', ['Guide'], 'WSTG significa Web Security Testing Guide.')
      ]
    },
    {
      id: 'owi-39-scanners-deteccao-defensiva',
      title: 'Scanners e ferramentas de varredura: o que fazem e como detectá-los',
      goal: 'Reconhecer nos logs o rastro de varreduras automatizadas, responder de forma proporcional e usar essas ferramentas de forma ética e autorizada.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Categorias de ferramentas e o que deixam nos logs',
            'Quem opera uma aplicação precisa reconhecer o barulho que a internet faz em volta dela. As ferramentas automatizadas se dividem em famílias, e cada uma deixa um padrão. (1) Varredores de portas e serviços (como o nmap): tentam descobrir quais portas respondem e que serviço está atrás; rastro no FIREWALL: muitas tentativas de conexão em portas diferentes, vindas de um mesmo IP, em sequência. (2) Varredores de vulnerabilidades web (como o Nikto e o OWASP ZAP em modo ativo): testam caminhos e parâmetros conhecidos; rastro no log de acesso: rajada de requisições a caminhos típicos de componentes conhecidos. (3) Fuzzers de diretórios (como ffuf, gobuster, dirb): tentam listas enormes de nomes de pastas e arquivos; rastro: MUITOS 404 em sequência. (4) Proxies de interceptação (como o Burp Suite e o ZAP): ficam entre o navegador e o site, e servem para analisar e repetir requisições à mão; rastro mais sutil, parecido com uso humano, por isso são usados por testadores. (5) Ferramentas de injeção automatizada (como o sqlmap): enviam muitas variações de entradas com aspas e operadores em parâmetros; rastro: o mesmo parâmetro com valores estranhos, erros 500 e consultas lentas. Elas não são "do mal" por si só: defensores as usam em testes autorizados. O que diferencia é a autorização.'
          ),
          sl(
            'Padrões típicos em logs de acesso',
            'Sinais que merecem atenção: (a) muitos 404 do mesmo IP em poucos segundos; (b) requisições a caminhos que sua aplicação nem tem, mas que existem em componentes famosos: `/.git/config`, `/.env`, `/wp-login.php`, `/phpmyadmin/`, `/backup.zip`, `/admin`; (c) parâmetros com aspas simples, `<script>`, sequências como `../` ou comentários SQL; (d) rajadas por segundo, muito além de um humano; (e) user-agent que nomeia a ferramenta (útil, mas fraco como único critério, porque o cabeçalho é controlado por quem envia e pode ser trocado por um navegador comum); (f) mesmo IP sondando muitos hosts ou portas. Um sinal isolado quase nunca basta (um 404 pode ser um favicon ausente); a força está na COMBINAÇÃO: volume + caminhos suspeitos + ritmo. Os exemplos abaixo usam IPs de documentação e dados fictícios.',
            '# Exemplo ILUSTRATIVO (IPs de documentação, logs inventados)\n203.0.113.9 [10/Mar/2026:10:00:02] "GET /admin HTTP/1.1" 404 "ScannerX/1.0"\n203.0.113.9 [10/Mar/2026:10:00:02] "GET /.git/config HTTP/1.1" 404 "ScannerX/1.0"\n203.0.113.9 [10/Mar/2026:10:00:02] "GET /phpmyadmin/ HTTP/1.1" 404 "ScannerX/1.0"\n203.0.113.9 [10/Mar/2026:10:00:03] "GET /wp-login.php HTTP/1.1" 404 "ScannerX/1.0"\n# 4 caminhos "famosos" em ~1 s, todos 404 -> varredura'
          ),
          sl(
            'Detecção automatizada: um analisador de log',
            'Dá para automatizar a triagem inicial. O script abaixo lê um log de acesso fictício, conta os 404 por IP, procura caminhos e payloads suspeitos e imprime um resumo. É deliberadamente simples (limiares e listas devem ser ajustados ao seu tráfego, e logs reais exigem cuidado com dados pessoais, como IPs, que são dado pessoal pela LGPD: guarde com finalidade, acesso restrito e prazo de retenção). Observe que um IP com poucos 404 mas com caminhos suspeitos também é sinalizado, e que o visitante normal com um 404 de favicon não é.',
            `import re, collections
rx = re.compile(r'^(\\S+) .*?\\[(.*?)\\] "(\\S+) (\\S+) [^"]*" (\\d{3}) \\d+ "[^"]*" "([^"]*)"')
SUSP = ['/.git', '/wp-login', '/wp-admin', '/phpmyadmin', '/backup', '/.env']
PAYL = ['%27', '%3cscript', '<script']
n404 = collections.Counter(); hits = collections.defaultdict(set)
for line in LOG.splitlines():
    m = rx.match(line)
    if not m: continue
    ip, ts, met, path, st, agent = m.groups()
    if st == '404': n404[ip] += 1
    if any(s in path.lower() for s in SUSP + PAYL): hits[ip].add(path)
# limiar: 4 respostas 404
# SAÍDA REAL (sobre um log fictício de 10 linhas):
# 192.0.2.44 n404=0 ['caminhos suspeitos'] ['/busca?q=%27', '/busca?q=%3Cscript%3E'] Mozilla/5.0
# 198.51.100.7 ok (n404=1)
# 203.0.113.9 n404=5 ['muitos 404', 'caminhos suspeitos'] ['/.git/config', '/backup.zip', '/phpmyadmin/', '/wp-login.php'] ScannerX/1.0`
          ),
          sl(
            'Responder: limitar, bloquear, alertar e atrair',
            'Resposta proporcional ao sinal: (1) LIMITAÇÃO DE TAXA (rate limiting) por IP ou por token, reduzindo o ritmo sem derrubar ninguém; (2) BLOQUEIO TEMPORÁRIO de IPs que combinam vários sinais (com expiração, para não punir um IP compartilhado ou reaproveitado para sempre); (3) WAF em modo DETECÇÃO primeiro, para ver o que seria bloqueado e ajustar regras antes de ativar o bloqueio (evita falsos positivos que derrubam usuários reais); (4) ALERTAS em um sistema de monitoramento, para padrões como pico de 404, tentativas em `/.git` ou rajadas de erros 500; (5) HONEYPOTS e endpoints-isca, em visão geral: um caminho que não tem uso legítimo (um falso `/admin-backup/` que nenhum link da aplicação aponta) cujo acesso gera alerta de alta confiança, porque nenhum usuário normal chegaria lá. Isca bem usada produz poucos falsos positivos; ela é um sensor, não uma armadilha para atacar ninguém. Importante: o que a internet faz é ruído de fundo constante; priorize o que a aplicação revela (respostas 200 em caminhos sensíveis, erros 500 em parâmetros), pois o ponto crítico é corrigir a exposição, não apenas bloquear quem a encontra.'
          ),
          sl(
            'Uso ético e autorizado pelos defensores',
            'Defensores usam as mesmas famílias de ferramentas para encontrar falhas antes dos outros, mas só com AUTORIZAÇÃO. Requisitos mínimos: (1) ESCOPO por escrito (quais domínios e IPs, quais tipos de teste, o que está fora do escopo); (2) JANELA combinada (data e horário) e canal de contato para interromper se algo for mal; (3) ALVO próprio ou de laboratório (uma aplicação deliberadamente vulnerável rodando localmente, ou seu ambiente de homologação); (4) cuidado com o impacto: varredura ativa gera tráfego, pode derrubar serviços frágeis, poluir bancos de dados com registros de teste e disparar alertas; não rode contra produção sem acordo explícito. Testar sistemas de terceiros sem permissão pode configurar crime (Lei 12.737/2012, que trata de invasão de dispositivo informático) e violar contratos e o Marco Civil da Internet, mesmo "só para ver"; isto não é aconselhamento jurídico. Como defensor, diferencie a varredura da sua equipe (autorizada, de IPs conhecidos, na janela combinada) do ruído da internet: registre os IPs e horários dos testes autorizados para que o time de monitoramento não gaste tempo (nem bloqueie parceiros) por engano.'
          ),
          sl(
            'Triagem de relatório de scanner',
            'Relatórios de scanner são ponto de partida, não veredito. Triagem: (1) leia a evidência (requisição, resposta, caminho) e não só o título e a severidade; (2) classifique cada achado: verdadeiro positivo (a falha existe), falso positivo (o scanner interpretou mal uma resposta, por exemplo uma página de erro genérica com status 200) ou informativo; (3) CONFIRME manualmente, em laboratório ou homologação, o que for de severidade relevante, para não corrigir o que não existe nem ignorar o que existe; (4) agrupe duplicatas (o mesmo problema em dez URLs é um item); (5) priorize por risco real (exposição, dado afetado, facilidade) e registre a decisão: corrigir, aceitar com justificativa ou descartar como falso positivo. Um achado "crítico" num endpoint inalcançável pode importar menos que um "médio" em tela de login pública. E lembre: ausência de achados não prova ausência de falhas; scanner não entende a lógica de negócio, e por isso se complementa com revisão de código e teste manual.',
            '# Exemplo ILUSTRATIVO de linha de triagem\nAchado: "Diretório /backup/ acessível"   Severidade do scanner: alta\nEvidência: GET /backup/ -> 200, mas corpo é a página inicial (rota genérica)\nClassificação: FALSO POSITIVO (confirmado manualmente em homologação)\nDecisão: descartar; ajustar regra do scanner para comparar o corpo da resposta'
          )
        ]
      },
      questions: [
        mcq('q1', 'O log de acesso mostra, do mesmo IP, 40 requisições em 2 segundos, todas com status 404, a caminhos como /.git/config, /wp-login.php e /phpmyadmin/. O que isso indica?', 'd', [
          'Um usuário comum com navegador desatualizado que segue links quebrados do site',
          'Falha do servidor, que passou a devolver 404 para páginas que existem',
          'Um ataque bem-sucedido, já que o 404 mostra que os arquivos foram acessados',
          'Provável varredura automatizada; vale limitar a taxa, alertar e confirmar que nada sensível responde 200'
        ], 'Rajada de 404 em caminhos famosos é o rastro de fuzzers e scanners. O 404 mostra que não existem, mas confirme que o que deveria ser privado não responde 200.'),
        mcq('q2', 'Qual ferramenta é um proxy de interceptação, usado por testadores para inspecionar e repetir requisições manualmente?', 'c', [
          'Um varredor de portas, que verifica quais serviços respondem em um IP',
          'Um fuzzer de diretórios, que tenta nomes de pastas a partir de uma lista',
          'O Burp Suite ou o OWASP ZAP, posicionados entre o navegador e o site',
          'Uma ferramenta de injeção automatizada, que varia valores de parâmetros em massa'
        ], 'Proxies como o Burp e o ZAP ficam entre o navegador e o site, permitindo ver e reenviar requisições. Por isso o tráfego deles se parece mais com o de uma pessoa.'),
        mcq('q3', 'Por que o user-agent sozinho não é um bom critério para bloquear varreduras?', 'b', [
          'Porque navegadores reais nunca enviam esse cabeçalho, então ele não aparece nos logs',
          'Porque o cliente controla o cabeçalho e pode trocá-lo; ele serve somente como pista, junto com volume e ritmo',
          'Porque o user-agent identifica apenas o sistema operacional e não traz o nome de nenhuma ferramenta',
          'Porque o cabeçalho é removido pelo servidor antes de chegar ao arquivo de log'
        ], 'O user-agent é informado pelo cliente e pode ser falsificado. É útil como pista, mas a decisão deve combinar vários sinais.'),
        fill('q4', 'Qual código de status HTTP aparece em sequência nos logs quando um fuzzer de diretórios tenta nomes que não existem?', 'GET /backup.zip HTTP/1.1 -> ___', ['404'], 'O 404 (não encontrado) em grande quantidade, vindo de um mesmo IP, é o rastro clássico de fuzzers de diretórios.'),
        mcq('q5', 'Qual é a estratégia mais prudente ao introduzir um WAF novo na frente de uma aplicação em produção?', 'a', [
          'Começar em modo detecção, analisar o que seria bloqueado, ajustar regras e só então ativar o bloqueio',
          'Ativar o bloqueio imediatamente com todas as regras, pois qualquer bloqueio é preferível a um falso negativo',
          'Ativar apenas o registro e nunca passar para o bloqueio, já que o WAF é uma ferramenta de auditoria',
          'Desativar o WAF após uma semana, pois as regras ficam obsoletas e passam a bloquear usuários reais'
        ], 'O modo detecção revela falsos positivos antes de afetarem usuários reais. Depois de ajustar, o bloqueio pode ser ativado com mais segurança.'),
        mcq('q6', 'Um endpoint-isca (honeypot) como /admin-backup/ não é linkado em nenhuma página e não tem uso legítimo. Qual é seu valor para a defesa?', 'c', [
          'Servir de ponto de partida para investigar e atacar o IP que o acessou',
          'Substituir o painel administrativo real, tornando desnecessário protegê-lo com autenticação',
          'Gerar um alerta de alta confiança, pois um visitante normal não deveria acessá-lo',
          'Reduzir o tráfego do site, já que os visitantes passam a ser redirecionados a ele'
        ], 'Como ninguém legítimo chega lá, qualquer acesso é um sinal forte com poucos falsos positivos. A isca é um sensor, não um substituto de controles reais.'),
        mcq('q7', 'Sua equipe vai executar um varredor ativo no ambiente de homologação. Qual preparação é adequada?', 'b', [
          'Rodar de madrugada sem avisar ninguém, para que o monitoramento não atrapalhe o teste',
          'Definir escopo por escrito, janela e IPs de origem, e avisar quem monitora para distinguir do ruído externo',
          'Rodar contra produção do cliente, desde que o contrato de suporte exista, pois o ambiente é equivalente',
          'Rodar sem escopo definido, ampliando os alvos conforme os achados aparecerem durante o teste'
        ], 'Testes éticos têm escopo, janela, alvo autorizado e comunicação. Sem aviso, o time de monitoramento perde tempo ou bloqueia o teste por engano.'),
        fill('q8', 'Como se chama o endpoint-isca que não tem uso legítimo e serve para disparar alertas ao ser acessado? (termo em inglês)', 'Endpoint-isca = ___', ['honeypot', 'honeypots'], 'Um honeypot é um recurso falso usado como sensor: qualquer acesso é suspeito e gera alerta.')
      ]
    },
    {
      id: 'owi-27-revisao-codigo',
      title: 'Revisão de código seguro',
      goal: 'Revisar código seguindo o dado não confiável das fontes aos sumidouros e reconhecer padrões perigosos por linguagem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que revisar e o método fontes e sumidouros',
            'Revisão de código encontra falhas que testes automáticos não veem (lógica, autorização, uso incorreto de APIs) e custa pouco quando feita antes da mesclagem. O método mais eficaz é seguir o dado: identifique as fontes (sources), de onde chega dado não confiável (parâmetros de URL, corpo, cabeçalhos, cookies, arquivos enviados, dados de outros serviços, até o banco de dados se foi preenchido por usuários) e os sumidouros (sinks), onde o dado é usado de forma sensível (consulta SQL, comando de sistema, saída HTML, caminho de arquivo, desserialização, redirecionamento). Depois pergunte: entre a fonte e o sumidouro, existe validação, codificação ou parametrização adequada ao contexto do sumidouro? Se não, é uma falha provável. O raciocínio vale para qualquer linguagem.'
          ),
          sl(
            'Padrões perigosos por linguagem',
            'Sinais para olhar com atenção. Python: `eval`/`exec` com entrada, `pickle.loads` de dados não confiáveis, `subprocess` com `shell=True`, SQL montado com f-string ou `%`, `yaml.load` sem carregador seguro. JavaScript/Node: `eval` e `new Function`, `child_process.exec` com entrada, `innerHTML`, SQL por concatenação, expressões regulares com repetições aninhadas (ReDoS), `Object.assign` com objetos do usuário. Java: desserialização de objetos (`ObjectInputStream`) de fontes externas, SQL por concatenação em `Statement`, parsers XML com entidades externas habilitadas. C#: `Process.Start` com entrada, SQL cru por concatenação, `BinaryFormatter`. PHP: `include`/`require` com caminho dinâmico, `eval`, SQL por concatenação, `unserialize` de entrada. A lista não é completa: é um ponto de partida para a busca.'
          ),
          sl(
            'Revisão 1: SQL com f-string',
            'Trecho em revisão: a fonte é `entrada` (vem do cliente) e o sumidouro é `db.execute`. Não há parametrização entre os dois. A entrada `x\' OR \'1\'=\'1` altera a lógica da consulta e retorna linhas que não deveria. A correção é passar o valor como parâmetro: o driver o trata como dado, nunca como código SQL. Saída real do teste local abaixo (banco SQLite em memória, dados fictícios).',
            `# trecho vulneravel
db.execute(f"select n from t where n='{entrada}'")

# correcao
db.execute('select n from t where n=?', (entrada,))

# saida real (2 linhas na tabela; entrada = x' OR '1'='1)
f-string : 2 linhas   <- devolveu tudo
parametro: 0 linhas   <- tratou como texto`
          ),
          sl(
            'Revisão 2: comando de sistema com shell=True',
            'Fonte: `nome` vem do usuário. Sumidouro: `subprocess.run` com `shell=True`, em que a string inteira é interpretada pelo shell, então caracteres como `&&`, `;` e `|` separam comandos. A correção é passar uma lista de argumentos sem shell (o valor vira um único argumento literal) e, melhor ainda, evitar chamar programas externos quando existe biblioteca para a tarefa. Valide também o formato esperado (lista de valores permitidos). Saída real em laboratório com um comando inofensivo (`echo`):',
            `# trecho vulneravel
subprocess.run('echo ' + nome, shell=True)

# correcao
subprocess.run(['echo', nome])

# saida real, com nome = 'ola && echo EXECUTOU-OUTRO-COMANDO'
shell=True : ['ola', 'EXECUTOU-OUTRO-COMANDO']        <- 2o comando rodou
lista      : ['ola', '&&', 'echo', 'EXECUTOU-OUTRO-COMANDO']  <- tudo e texto`
          ),
          sl(
            'Revisão 3: pickle com dados não confiáveis',
            'Fonte: bytes recebidos de fora (corpo da requisição, arquivo, cache compartilhado). Sumidouro: `pickle.loads`. O formato pickle pode conter instruções para executar código durante a leitura, então desserializar dados não confiáveis equivale a executar código escolhido por quem os enviou. No exemplo abaixo, um objeto de demonstração inofensivo só imprime uma mensagem ao ser carregado. A correção é usar um formato de dados puro (JSON) e validar a estrutura com um esquema; se precisar de integridade, assine os dados com HMAC e um segredo antes de aceitar. Pickle só é aceitável entre componentes que você controla por completo.',
            `# trecho vulneravel
objeto = pickle.loads(corpo_da_requisicao)

# correcao
dados = json.loads(corpo_da_requisicao)   # so dados, sem codigo
validar_esquema(dados)

# saida real (objeto de demonstracao inofensivo)
codigo executado durante o pickle.loads
json.loads recusa: JSONDecodeError`
          ),
          sl(
            'Autenticação, autorização, checklist de PR e análise de fluxo',
            'Ao revisar autenticação e autorização, procure: rotas sem verificação de login; checagem de papel só no cliente; consulta de objeto por ID sem filtrar o dono; comparação de segredos com `==`; senhas sem hash adequado (use argon2, scrypt ou bcrypt); tokens sem expiração; mensagens de erro que revelam se o usuário existe. Checklist de pull request com foco em segurança: há entrada nova? onde é validada? há consulta, comando, HTML ou caminho montado com dado externo? há nova rota e quem pode chamá-la? há segredo no código ou nos logs? há dado pessoal novo (finalidade, retenção)? há dependência nova (necessária, mantida)? há teste para o caso de abuso? Análise de fluxo de dados (taint analysis), em visão geral: ferramentas marcam fontes e sumidouros e rastreiam o caminho automaticamente; ajudam a revisão, mas não a substituem.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No trecho `db.execute("select * from t where id=" + request.args["id"])`, o que são a fonte e o sumidouro?', 'c', [
          'Fonte: db.execute; sumidouro: request.args.',
          'Não há fonte nem sumidouro, pois o trecho não imprime nada na tela.',
          'Fonte: request.args (dado do cliente); sumidouro: db.execute (consulta SQL).',
          'Fonte: a tabela t; sumidouro: o resultado da consulta devolvido ao usuário.'
        ], 'A fonte é onde chega o dado não confiável e o sumidouro é onde ele é usado de forma sensível; aqui não há parametrização entre os dois.'),
        mcq('q2', 'Qual destes padrões é um sinal de alerta para injeção de comandos em Python?', 'c', [
          '`json.loads(corpo)` seguido de validação do esquema.',
          '`os.path.basename(arquivo)` usado para obter o nome do arquivo.',
          '`subprocess.run(f"convert {arquivo}", shell=True)` com `arquivo` vindo do usuário.',
          '`subprocess.run(["convert", arquivo])` com o executável fixo e sem shell.'
        ], 'shell=True com string montada deixa o shell interpretar metacaracteres da entrada. A forma com lista não passa pelo shell.'),
        mcq('q3', 'Este código é seguro?\n`dados = pickle.loads(request.get_data())`', 'a', [
          'Não: pickle pode executar código na leitura; use JSON com validação de esquema, e assine os dados se a integridade for necessária.',
          'Sim, desde que o endpoint exija autenticação por token, pois o token garante que apenas usuários confiáveis possam enviar dados serializados ao servidor da aplicação.',
          'Não, mas o risco é só de desempenho, pois o formato é binário.',
          'Sim, pois o pickle valida o tipo dos objetos antes de carregá-los.'
        ], 'Autenticação não torna confiável o conteúdo enviado. O pickle não é um formato de dados seguro para entradas externas.'),
        fill('q4', 'Qual valor do parâmetro de subprocess.run evita que o shell interprete a string do comando?', "subprocess.run(['echo', nome], shell=___)", ['False'], 'Com shell=False (o padrão) e uma lista de argumentos, a entrada vira um argumento literal.'),
        mcq('q5', 'Qual item NÃO é uma boa verificação em revisão de autorização?', 'c', [
          'Verificar se toda rota nova exige autenticação ou está explicitamente marcada como pública.',
          'Confirmar que a consulta de um objeto filtra também pelo dono ou pela permissão do usuário.',
          'Aceitar a verificação de papel feita apenas pelo front-end como suficiente.',
          'Conferir se comparações de segredos usam funções de tempo constante.'
        ], 'A verificação de papel precisa estar no servidor; no cliente é só UX. Os demais itens são verificações válidas.'),
        mcq('q6', 'Em JavaScript, qual trecho merece mais atenção na revisão?', 'a', [
          '`element.innerHTML = comentario` com comentário vindo de outros usuários',
          '`const total = itens.reduce((a, b) => a + b.preco, 0)`',
          '`element.textContent = comentario`',
          '`JSON.parse(texto)` dentro de um bloco try/catch'
        ], 'innerHTML interpreta o texto como HTML e é sumidouro clássico de XSS; textContent trata como texto.'),
        mcq('q7', 'Qual pergunta do checklist de PR é mais relevante para privacidade (LGPD)?', 'c', [
          'O nome das variáveis segue o padrão da equipe?',
          'Os testes demoram menos de um minuto para rodar?',
          'Este código coleta dado pessoal novo? Qual a finalidade, quem acessa e por quanto tempo será mantido?',
          'A mensagem do commit tem mais de cinquenta caracteres?'
        ], 'Finalidade, acesso e retenção são os pontos de privacidade a revisar quando surge um novo dado pessoal.'),
        fill('q8', 'Complete a consulta parametrizada do SQLite (marcador de posição):', "db.execute('select n from t where n=___', (entrada,))", ['?'], 'No sqlite3 o marcador de parâmetro é ?; o driver passa o valor como dado, sem interpretá-lo como SQL.')
      ]
    },
    {
      id: 'owi-28-testes-seguranca-automatizados',
      title: 'Testes de segurança automatizados',
      goal: 'Escrever testes que verificam entradas maliciosas, autorização e regressões, e usar fuzzing básico para validar funções de entrada.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Testes unitários de segurança: entradas maliciosas e limites',
            'Testes funcionais verificam que o caminho feliz funciona. Testes de segurança verificam que o caminho infeliz falha do jeito certo: entradas maliciosas (aspas, `<script>`, caracteres de controle), valores nos limites (vazio, comprimento máximo, um acima do máximo, número negativo), tipos errados e tamanhos excessivos devem ser rejeitados ou tratados sem exceção, sem vazar informação e sem efeitos colaterais. Escreva casos para cada regra de validação e para cada função que lida com entrada não confiável. Eles rodam em segundos no CI e documentam o que a função promete.',
            `def test_login_rejeita_sql_na_senha(self):
    assert login(db, "alice' --", 'x') is None

def test_busca_escapa_html(self):
    assert '<script>' not in busca_html('<script>alert(1)</script>')

def test_limite_de_tamanho(self):
    assert validar_usuario('a' * 21) is False   # maximo 20`
          ),
          sl(
            'Testes de autorização: a matriz papel por recurso',
            'Autorização é onde mais há falhas e onde ferramentas automáticas menos ajudam, então ela precisa de testes próprios. Monte uma matriz: nas linhas os papéis (anônimo, usuário comum, usuário de outra conta, administrador), nas colunas os recursos e operações (ler pedido, editar perfil, excluir usuário), e em cada célula o resultado esperado (permitido ou negado, 200, 403 ou 404). Transforme a matriz em testes parametrizados que percorrem todas as células. Inclua sempre o caso de outro usuário do mesmo papel (acesso lateral, BOLA) e o caso anônimo. Quando alguém adicionar uma rota nova, a matriz obriga a decidir o que cada papel pode fazer.',
            `# matriz (esperado)       anonimo  usuario(dono)  usuario(outro)  admin
# GET  /pedidos/1            401        200            404          200
# DELETE /usuarios/7         401        403            403          204

@pytest.mark.parametrize('papel,esperado', [('anonimo',401),('outro',404),('dono',200)])
def test_ler_pedido(papel, esperado):
    assert cliente(papel).get('/pedidos/1').status_code == esperado`
          ),
          sl(
            'Teste de regressão para cada vulnerabilidade corrigida',
            'Toda vez que uma vulnerabilidade é corrigida, escreva primeiro um teste que a reproduz e falha, corrija e confirme que o teste passa. Esse teste fica no repositório para sempre: se alguém reintroduzir a falha numa refatoração, o CI avisa. É a única forma de impedir que o mesmo erro volte. Nomeie o teste com o tipo de falha ou o identificador do relato (por exemplo `test_regressao_idor_pedidos`) e descreva em comentário qual era o problema. Vulnerabilidades reportadas por testes manuais ou por ferramentas devem terminar em um teste automatizado, não só em um commit de correção.'
          ),
          sl(
            'Fuzzing básico de entradas',
            'Fuzzing é gerar muitas entradas inválidas ou aleatórias e verificar que a função nunca quebra de forma inesperada (exceções não tratadas, travamentos, tempo excessivo) e que mantém suas garantias (por exemplo, nunca aceita algo fora do formato). Um fuzzer simples basta para começar: sorteia caracteres de um alfabeto amplo (inclui Unicode, byte nulo e caracteres de controle) e comprimentos variados, e confere propriedades. O experimento abaixo foi rodado de verdade contra uma função de validação forte (expressão regular restrita a letras minúsculas ASCII, números e sublinhado) e uma fraca (`isalnum()`): a fraca aceitou caracteres não ASCII, algo que a regra não pretendia permitir, pois `isalnum()` considera letras de qualquer alfabeto.',
            `# saida real (semente fixa 42, 20000 entradas)
entradas: 20000 | excecoes inesperadas: 0 | aceitas pela validacao forte: 25
validacao fraca aceitou entradas nao-ASCII: True
exemplo: '\\xe9abc'

# nucleo do fuzzer
s = ''.join(random.choice(alfabeto) for _ in range(random.randint(0, 40)))
ok = validar_usuario(s)            # nao pode levantar excecao
assert not ok or re.fullmatch(r'[a-z0-9_]{3,20}', s)`
          ),
          sl(
            'Propriedades, CI, ASVS e segurança como critério de pronto',
            'Testes baseados em propriedades (por exemplo com a biblioteca Hypothesis, em Python), em visão geral: em vez de exemplos fixos, você declara uma propriedade que deve valer para todas as entradas ("a saída escapada nunca contém `<`") e a biblioteca gera casos, inclusive de borda, e encolhe o contraexemplo ao menor possível. Integre os testes de segurança ao CI para que rodem em todo pull request, com falha bloqueando a mesclagem. Use o ASVS como lista de requisitos: para cada requisito do nível escolhido, indique qual teste o cobre e destaque os requisitos sem cobertura. Por fim, defina que a história só está pronta ("definição de pronto") quando tem testes de segurança relevantes e os requisitos de segurança foram atendidos, e não apenas quando a funcionalidade aparece na tela.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual conjunto de entradas representa bem os casos de limite de um campo de nome de usuário com 3 a 20 caracteres?', 'b', [
          'Apenas nomes de 20 caracteres, pois o maior tamanho já cobre os menores, sem testar os limites inferiores nem os valores fora do intervalo.',
          'Vazio, 2, 3, 20 e 21 caracteres, caracteres de controle, Unicode e tipos errados como números ou listas.',
          'Apenas nomes comuns de pessoas, como os que aparecem no cadastro de teste, mais alguns casos tomados do cadastro de homologação da equipe, todos dentro do formato esperado.',
          'Apenas textos aleatórios de exatamente 10 caracteres.'
        ], 'Testar nos limites e fora deles revela erros de uma unidade e tratamentos faltantes; entradas típicas só confirmam o caminho feliz.'),
        mcq('q2', 'O que a matriz papel por recurso permite fazer?', 'd', [
          'Descobrir automaticamente as vulnerabilidades de injeção da aplicação, o que dispensa qualquer revisão manual do código antes de cada nova versão ser liberada para uso.',
          'Medir o tempo de resposta de cada rota para cada papel.',
          'Substituir os testes de autenticação por testes de criptografia, o que seria útil para comparar os ambientes de homologação e de produção.',
          'Definir o resultado esperado para cada papel e cada recurso, e transformar isso em testes que percorrem todas as combinações.'
        ], 'A matriz torna explícita a política de acesso e gera testes parametrizados, inclusive para o caso do outro usuário do mesmo papel.'),
        mcq('q3', 'Uma falha IDOR foi corrigida. Qual é o passo final correto?', 'c', [
          'Informar apenas o autor da correção, para evitar atrasos, e isso garante que ninguém mais precise revisar o endpoint antes da próxima versão da aplicação.',
          'Desativar o endpoint por segurança até a próxima revisão geral.',
          'Adicionar um teste de regressão que reproduz o acesso indevido e passa a esperar a negação.',
          'Fechar o relato, pois o commit de correção já documenta o problema.'
        ], 'O teste de regressão impede que a falha volte numa refatoração futura; o histórico do Git não protege contra isso.'),
        fill('q4', 'Como se chama a técnica de gerar muitas entradas aleatórias ou inválidas para ver se a função quebra?', '___ de entradas', ['fuzzing', 'fuzz'], 'Fuzzing gera entradas inesperadas para encontrar falhas e violações de propriedades.'),
        mcq('q5', 'No experimento, a validação com isalnum() aceitou "éabc" e a regra com regex não. O que isso mostra?', 'd', [
          'Que caracteres não ASCII nunca devem aparecer em nomes de usuários.',
          'Que o fuzzing só funciona com funções que lançam exceções.',
          'Que a regex é mais lenta, e por isso deve ser evitada em validações simples, motivo pelo qual a validação por expressão regular deve ser trocada por métodos prontos da biblioteca padrão.',
          'Que um método da biblioteca padrão pode ter semântica mais ampla do que a regra pretendida, e o fuzzer revelou a diferença.'
        ], 'isalnum considera letras e dígitos de vários alfabetos. O fuzzer confrontou a função com a propriedade desejada e achou a divergência.'),
        mcq('q6', 'Como o ASVS ajuda a medir a qualidade dos testes de segurança?', 'd', [
          'Dispensa testes manuais para o nível mais alto de verificação, já que o catálogo substitui o conjunto de testes manuais para o nível mais exigente do padrão.',
          'Gera os testes automaticamente a partir do código-fonte da aplicação.',
          'Define a ferramenta de fuzzing que a equipe deve usar.',
          'Serve de lista de requisitos para mapear qual teste cobre cada um e apontar os requisitos sem cobertura.'
        ], 'O ASVS é um catálogo de requisitos; a rastreabilidade entre requisito e teste mostra lacunas. Não gera testes nem elimina a revisão manual.'),
        mcq('q7', 'Qual abordagem torna segurança parte do "pronto" de uma história?', 'b', [
          'Considerar pronta a história que passa nos testes funcionais, e tratar segurança em outro momento.',
          'Exigir testes de segurança relevantes e requisitos atendidos, verificados no CI antes da mesclagem.',
          'Rodar uma varredura completa apenas uma vez por ano.',
          'Deixar os testes de segurança para uma equipe separada após o lançamento.'
        ], 'Segurança no critério de pronto, verificada automaticamente a cada mudança, evita acumular dívida e retrabalho.'),
        fill('q8', 'Qual status HTTP o teste deve esperar quando um usuário comum tenta executar uma função administrativa?', 'assert resposta.status_code == ___', ['403'], '403 Forbidden indica que o usuário está autenticado mas não tem permissão para a função.')
      ]
    },
    {
      id: 'owi-29-devsecops-pipeline',
      title: 'Pipeline DevSecOps',
      goal: 'Montar um pipeline com controles de segurança em cada etapa, políticas por severidade e métricas, evitando teatro de segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Segurança em cada etapa, e não só no fim',
            'DevSecOps integra segurança ao fluxo de entrega, deslocando-a para o começo ("shift left") sem abandonar os controles do fim. Etapas e controles típicos: pré-commit, varredura de segredos no computador de quem desenvolve; pull request, SAST, SCA, testes de segurança e revisão de código; build, SBOM, assinatura de artefatos e varredura de imagem de container; implantação, varredura de IaC e verificação de assinatura; homologação, DAST (por exemplo ZAP) e testes de autorização; produção, monitoramento, alertas, detecção e resposta a incidentes. Quanto mais cedo uma falha é achada, mais barata a correção; mas o que só aparece em execução precisa ser testado depois. As camadas se complementam.'
          ),
          sl(
            'Políticas e portões (gates) por severidade',
            'Um portão é uma regra automática que bloqueia a progressão quando algo não atende ao critério. Defina critérios proporcionais ao risco: segredo detectado ou vulnerabilidade crítica nova bloqueia a mesclagem; alta tem prazo curto e bloqueia o lançamento se não houver mitigação; média e baixa viram tarefas com prazo e acompanhamento. Considere também a confiança da regra (alertas de baixa confiança não devem bloquear) e se a vulnerabilidade é alcançável. Deixe as regras versionadas no repositório, com revisão, para que todos saibam o que é bloqueado e por quê. Portões rígidos demais levam a contornos; portões frouxos demais perdem o sentido.'
          ),
          sl(
            'Ruído, falsos positivos e exceções com prazo',
            'Pipelines que produzem centenas de alertas ruidosos treinam todos a ignorá-los. Controle o ruído: comece com poucas regras de alta confiança e expanda; use baseline para os achados antigos; ajuste ou desligue regras que geram falsos positivos recorrentes (com registro do motivo); agrupe alertas por causa-raiz; deduplique entre ferramentas. Quando não for possível corrigir agora, registre uma exceção formal: qual o risco aceito, quem aprovou, mitigação temporária e data de expiração. Exceções sem prazo viram risco permanente esquecido; as que expiram voltam à fila e forçam uma decisão.'
          ),
          sl(
            'Métricas, cultura e security champions',
            'Meça o que importa para decidir melhorias: tempo médio de correção por severidade, quantidade de vulnerabilidades abertas e idade delas, cobertura (quantos repositórios e serviços passam pelo pipeline), taxa de falsos positivos, quantidade de segredos detectados antes de chegar ao repositório. Evite métricas de vaidade (número total de alertas) e não use métricas para punir pessoas. Cultura: segurança é responsabilidade de quem constrói. Um programa de security champions designa, em cada equipe, uma pessoa interessada que serve de ponte com a área de segurança, ajuda na triagem e difunde práticas. A equipe de segurança fornece ferramentas, padrões e apoio, e não vira gargalo de aprovação manual.'
          ),
          sl(
            'Evitar teatro de segurança',
            'Teatro de segurança é ter a aparência de controle sem a eficácia: ferramentas instaladas, mas ninguém lê os resultados; portões que sempre são ignorados; relatórios de conformidade sem correções; varreduras que não cobrem os componentes mais críticos; checklists marcados sem verificação. Sinais de alerta: alertas antigos que nunca fecham, tempo de correção crescente, desligar a ferramenta para "liberar a entrega", testes de segurança que nunca falham. Pergunte sempre: este controle impediu ou detectou algum problema real? Se o controle nunca produz decisões, ele precisa ser ajustado ou removido.'
          ),
          sl(
            'Exemplo de workflow de CI com etapas de segurança',
            'O arquivo abaixo é um exemplo ilustrativo (sintaxe de GitHub Actions) que organiza o que vimos. Os nomes das ferramentas e das ações são exemplos; adapte aos seus padrões, fixe versões por hash e revise as permissões. O ponto é a estrutura: permissões mínimas, etapas separadas por objetivo e portão por severidade.',
            `# exemplo ilustrativo
name: seguranca
on: [pull_request]
permissions:
  contents: read
jobs:
  segredos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<hash-do-commit>
      - run: gitleaks detect --redact
  sast-sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<hash-do-commit>
      - run: semgrep scan --error --severity ERROR
      - run: npm ci && npm audit --audit-level=high
  imagem:
    needs: [sast-sca]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<hash-do-commit>
      - run: docker build -t app:pr .
      - run: trivy image --severity CRITICAL,HIGH --exit-code 1 app:pr`
          )
        ]
      },
      questions: [
        mcq('q1', 'Em qual etapa do pipeline a varredura de segredos tem melhor custo-benefício?', 'b', [
          'Somente em produção, onde os segredos são usados de verdade, pois só a configuração do ambiente real tem as credenciais necessárias para a varredura funcionar.',
          'No pré-commit e no pull request, antes de o segredo entrar no histórico compartilhado.',
          'Na homologação, junto do DAST.',
          'Depois do lançamento, para auditar o que foi exposto.'
        ], 'Quanto mais cedo, menos o segredo se espalha e menor o trabalho de rotação e limpeza.'),
        mcq('q2', 'Qual política por severidade é mais razoável para achados novos?', 'd', [
          'Bloquear apenas quando a ferramenta for a mais cara do mercado.',
          'Bloquear a mesclagem para qualquer achado, mesmo os informativos e de baixa confiança.',
          'Nunca bloquear, apenas registrar relatórios para consulta futura, e revisar os achados apenas em auditorias anuais.',
          'Bloquear críticos e altos novos, e criar tarefas com prazo para os médios e baixos.'
        ], 'Portões proporcionais ao risco mantêm o fluxo e a confiança nas regras. Bloquear tudo leva a contornos, e nunca bloquear remove o controle.'),
        mcq('q3', 'Uma ferramenta nova encontra 400 achados em um projeto antigo. Qual estratégia ajuda a equipe a adotá-la?', 'b', [
          'Falhar o pipeline até os 400 serem corrigidos, para dar urgência, e só então liberar o novo código para os ambientes de teste.',
          'Registrar um baseline dos achados existentes, tratá-los em fila própria e falhar apenas para achados novos.',
          'Desligar a ferramenta até o projeto ser reescrito, o que também impede que achados novos sejam registrados enquanto o projeto não for refeito por completo.',
          'Marcar todos como falso positivo para limpar a lista.'
        ], 'O baseline separa a dívida antiga do que a mudança atual introduz, permitindo adoção gradual sem esconder os achados.'),
        fill('q4', 'Como se chama o registro formal de um risco aceito temporariamente, com responsável e data de expiração?', '___ com prazo', ['exceção', 'excecao'], 'Exceções formais com prazo de expiração evitam que riscos aceitos fiquem esquecidos para sempre.'),
        mcq('q5', 'Qual é uma métrica útil, em vez de uma métrica de vaidade?', 'd', [
          'O número de reuniões de segurança por mês.',
          'A quantidade de ferramentas instaladas no pipeline.',
          'O número total de alertas gerados por todas as ferramentas.',
          'O tempo médio de correção por severidade e a idade das vulnerabilidades abertas.'
        ], 'Tempo de correção e idade mostram se o risco está sendo reduzido. Contagens brutas de alertas e ferramentas não indicam melhoria.'),
        mcq('q6', 'O que é teatro de segurança?', 'b', [
          'Exercícios de mesa para resposta a incidentes, mas apenas quando a equipe de segurança acompanha cada exercício e aprova todas as mudanças resultantes.',
          'Controles que aparentam proteger, mas não produzem decisões nem reduzem risco, como alertas que ninguém lê.',
          'Treinamentos de segurança com simulações para a equipe.',
          'Uso de ferramentas de código aberto no pipeline.'
        ], 'O foco é a eficácia: um controle que nunca muda uma decisão é aparência. Exercícios e treinamentos reais não são teatro.'),
        mcq('q7', 'Este trecho de workflow é seguro?\n`permissions: write-all` e `uses: acao-de-terceiro@main`', 'b', [
          'Sim, desde que o job rode no mesmo dia do deploy.',
          'Não: o token tem poder demais e a referência movível permite que mudanças na ação alterem seu pipeline; use permissões mínimas e fixe por hash.',
          'Sim, pois o repositório é privado e só a equipe vê o pipeline, e nenhum atacante conseguiria alterar o fluxo sem acesso ao servidor onde o repositório está hospedado.',
          'Não, mas só por não registrar os logs em formato JSON, já que o formato do log não influencia o risco de execução de código de terceiros no pipeline.'
        ], 'Menor privilégio para o token e referência imutável da ação reduzem o impacto de um comprometimento na cadeia de suprimentos do CI.'),
        fill('q8', 'Qual o nome do papel que, em cada equipe, faz a ponte com a área de segurança e difunde práticas?', 'Security ___', ['champion', 'champions'], 'Security champions são pessoas das equipes de desenvolvimento que apoiam a segurança localmente.')
      ]
    },
    {
      id: 'owi-30-gestao-vulnerabilidades',
      title: 'Gestão de vulnerabilidades',
      goal: 'Priorizar e tratar vulnerabilidades com base em exploração, exposição e impacto, e não apenas na nota CVSS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O ciclo da gestão de vulnerabilidades',
            'Gerir vulnerabilidades é um processo contínuo, não uma varredura isolada. Etapas: descobrir (varreduras, testes, relatos externos, avisos de fornecedores, inventário de ativos e dependências); triar (confirmar se é real, se afeta o seu uso e se é alcançável); priorizar (decidir a ordem com base no risco); corrigir (atualizar, alterar o código, ou mitigar temporariamente); verificar (reteste para confirmar que a falha foi resolvida); aprender (causa-raiz, teste de regressão, melhoria de processo). Sem inventário atualizado não há como saber se um aviso novo afeta você, e sem verificação "corrigido" pode ser só uma suposição.'
          ),
          sl(
            'CVE, CWE e CVSS: o que cada um é',
            'CVE é o identificador público de uma vulnerabilidade específica em um produto ou versão (por exemplo, CVE-AAAA-NNNN), usado para que todos falem da mesma falha. CWE é a classificação do tipo de fraqueza (por exemplo, injeção de SQL ou falha de autorização), útil para prevenção e treinamento. CVSS é um sistema de pontuação de severidade técnica, de 0 a 10, derivado de um vetor. Leitura de um vetor da versão 3.1: AV (vetor de ataque: N rede, A adjacente, L local, P físico), AC (complexidade: L baixa, H alta), PR (privilégios necessários: N nenhum, L baixos, H altos), UI (interação do usuário: N nenhuma, R requerida), S (escopo: U inalterado, C alterado), C/I/A (impacto em confidencialidade, integridade e disponibilidade: N, L, H).',
            `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H   -> 9.8 (Critica)
  rede, baixa complexidade, sem privilegios, sem interacao,
  impacto alto em C, I e A

CVSS:3.1/AV:L/AC:H/PR:H/UI:R/S:U/C:L/I:N/A:N   -> nota baixa
  local, complexa, exige privilegio alto e interacao`
          ),
          sl(
            'Limites do CVSS, EPSS e a lista KEV',
            'A nota CVSS descreve a gravidade técnica da falha em abstrato; não diz se alguém está explorando, se o seu sistema está exposto, nem quanto o ativo vale para o seu negócio. Duas fontes complementam. EPSS (Exploit Prediction Scoring System) estima a probabilidade de uma vulnerabilidade ser explorada em breve, com base em dados observados; é uma probabilidade, não uma certeza. A lista KEV (Known Exploited Vulnerabilities), mantida por uma agência americana, enumera vulnerabilidades com exploração ativa conhecida, o que é um sinal forte de urgência. Em visão geral: use CVSS como entrada, e EPSS e KEV como indicadores de exploração; nenhum dos três dispensa o contexto interno.'
          ),
          sl(
            'Priorizar por exploração, exposição e impacto; SLAs e mitigações',
            'Pergunte, nesta ordem de importância prática: está sendo explorada (KEV, EPSS alto, código de prova de conceito público)? O ativo está exposto à internet ou é alcançável por um invasor? O que a falha permite e que dados ou operações de negócio estão em jogo (dados pessoais, dinheiro, disponibilidade)? Uma falha de nota 7 explorada ativamente em um serviço exposto tende a vir antes de uma nota 9 em um sistema isolado e sem caminho de ataque. Defina SLAs de correção por severidade ajustada (por exemplo, prazos menores para críticos e para os explorados) e acompanhe o cumprimento. Se a correção demorar, aplique mitigações temporárias: desativar a funcionalidade, regra de WAF, restringir acesso por rede, aumentar monitoramento, e registre quando a mitigação será substituída pela correção definitiva.'
          ),
          sl(
            'VEX, relatos externos e divulgação coordenada',
            'VEX (Vulnerability Exploitability eXchange), em visão geral, é uma declaração do fornecedor sobre se um produto é afetado por uma vulnerabilidade conhecida em um componente (afetado, não afetado, corrigido, em investigação), o que reduz alertas inúteis de SCA quando o código vulnerável não é usado. Para receber relatos externos, publique um arquivo `security.txt` em `/.well-known/security.txt` com o contato, a política e a data de expiração; escreva uma política de divulgação (como reportar, o que esperar, prazos de resposta, proteção para quem age de boa-fé). Um programa de bug bounty, em visão geral, paga recompensas por relatos válidos dentro de um escopo; exige capacidade de triagem e correção. Responda a cada relato, agradeça e informe o andamento.',
            `# /.well-known/security.txt (exemplo)
Contact: mailto:seguranca@exemplo.test
Expires: 2030-01-01T00:00:00Z
Policy: https://exemplo.test/divulgacao
Preferred-Languages: pt, en`
          ),
          sl(
            'Comunicação, registro e métricas',
            'Comunique conforme o público: a equipe técnica precisa de detalhes de correção e prazos; a gestão, do risco e da decisão necessária; clientes, quando há impacto, do que aconteceu, do que fazer e do que foi corrigido, sem revelar detalhes que facilitem exploração antes da correção. Mantenha um registro único das vulnerabilidades: identificador, origem, ativo afetado, severidade original e ajustada, responsável, prazo, status e evidência de verificação. Métricas úteis: tempo até triagem e até correção por severidade, número e idade das vulnerabilidades abertas, percentual dentro do SLA, reincidência por tipo de causa (CWE). Use as reincidências para decidir treinamento, bibliotecas padrão e testes automatizados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a relação entre CVE e CWE?', 'd', [
          'CVE é a ferramenta de varredura e CWE é o relatório que ela produz depois da execução.',
          'CVE e CWE são dois nomes para a mesma pontuação de severidade, usados por fornecedores diferentes.',
          'CVE classifica o tipo de fraqueza e CWE identifica cada vulnerabilidade em um produto.',
          'CVE identifica uma vulnerabilidade específica em um produto; CWE classifica o tipo de fraqueza, como injeção de SQL.'
        ], 'CVE é o identificador de uma falha concreta; CWE é a categoria da fraqueza, útil para prevenção e treinamento.'),
        mcq('q2', 'No vetor CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H, o que significam AV:N e PR:N?', 'b', [
          'Ataque local ao computador do usuário, depois de ele conceder autorização explícita ao atacante.',
          'Exploração pela rede, sem necessidade de privilégios prévios.',
          'Exploração só em rede adjacente, com credenciais de usuário comum.',
          'Ataque físico ao equipamento, e exigência de privilégios administrativos para executá-lo.'
        ], 'AV:N é vetor de ataque pela rede e PR:N, nenhum privilégio necessário; combinados com baixa complexidade e impacto alto, geram nota crítica.'),
        mcq('q3', 'Duas vulnerabilidades: (A) CVSS 9.8 em um sistema interno sem acesso externo, sem exploração conhecida; (B) CVSS 7.5 presente na lista KEV (exploração ativa), em um serviço exposto à internet. Qual priorizar primeiro?', 'd', [
          'As duas ao mesmo tempo, sem diferenciar, para evitar discussões internas.',
          'Nenhuma das duas, até que um relatório de testes de penetração as confirme.',
          'A, pois a maior nota CVSS indica sempre a maior prioridade de correção, independentemente de exposição, existência de exploração ou da importância do ativo para o negócio.',
          'B, pois há exploração ativa, o serviço está exposto e a nota alta já é suficiente para justificar urgência.'
        ], 'CVSS é severidade técnica; exploração conhecida e exposição aumentam muito o risco real. A pode vir logo depois, mas B é mais urgente.'),
        fill('q4', 'Em qual caminho padronizado se publica o arquivo com o contato para relatos de segurança?', '/.well-known/___.txt', ['security'], 'security.txt, em /.well-known/security.txt, informa contato, política e validade para quem encontra uma falha.'),
        mcq('q5', 'O que o EPSS expressa?', 'c', [
          'A confirmação de que um exploit público foi usado contra a sua organização, registrada pelo time de resposta em um relatório interno recente.',
          'A gravidade técnica da falha, calculada a partir do vetor CVSS, e por isso um valor alto significa que a falha já foi explorada em produção por terceiros.',
          'Uma estimativa de probabilidade de a vulnerabilidade ser explorada em breve, baseada em dados observados.',
          'O prazo máximo que um fornecedor tem para publicar a correção.'
        ], 'EPSS é probabilidade estimada, não certeza. Complementa o CVSS e a lista KEV, que registra exploração já observada.'),
        mcq('q6', 'A correção definitiva de uma vulnerabilidade crítica só poderá ser aplicada no próximo ciclo de lançamentos. O que fazer enquanto isso?', 'b', [
          'Reduzir a gravidade da vulnerabilidade no registro para ela sair da lista de itens críticos, e depois comunicar a mudança à gestão no relatório trimestral de riscos.',
          'Aplicar mitigações temporárias (desativar a função, restringir acesso, regra de WAF), reforçar o monitoramento e registrar a data da correção definitiva.',
          'Registrar o risco como aceito sem prazo, já que a correção está planejada.',
          'Remover o item do registro até a data da correção, pois o processo já está em andamento, já que o planejamento existente dispensa o acompanhamento até o lançamento da versão corrigida.'
        ], 'Mitigação reduz a exposição durante a espera; o registro e a data mantêm a responsabilização. Reclassificar ou remover esconde o risco.'),
        mcq('q7', 'Qual é a utilidade de um VEX para quem recebe o relatório de SCA?', 'b', [
          'Autorizar o uso de componentes com vulnerabilidades sem registrar exceção.',
          'Informar se o produto é de fato afetado por uma vulnerabilidade em um componente, reduzindo alertas irrelevantes.',
          'Atribuir uma nota CVSS mais precisa que a original para o seu ambiente.',
          'Substitui o inventário de componentes, pois lista todos os pacotes do projeto, e por isso dispensa o inventário de componentes e a manutenção do SBOM da aplicação.'
        ], 'VEX declara a exploração/afetação (afetado, não afetado, corrigido, em investigação) e ajuda na triagem; não substitui o SBOM nem cria exceções.'),
        fill('q8', 'No vetor CVSS, qual letra indica o vetor de ataque pela rede?', 'AV:___', ['N'], 'AV:N indica que o ataque pode ser feito pela rede (remotamente).')
      ]
    },
    {
      id: 'owi-31-logging-deteccao',
      title: 'Logging e detecção',
      goal: 'Registrar os eventos certos, em formato estruturado e sem dados pessoais indevidos, e detectar abuso como força bruta.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Que eventos de segurança registrar',
            'Sem registros adequados não há como detectar nem investigar um incidente. Registre eventos relevantes para segurança: autenticação (sucessos, falhas, bloqueios, MFA, recuperação de senha), mudanças de privilégio e de papel, acessos negados (403/404 por autorização), acesso a dados sensíveis e exportações, operações administrativas, alterações em configuração, erros de validação em volume incomum, falhas de assinatura de webhooks e de tokens. Cada registro deve ter: data e hora (em UTC), identificador do evento, identidade (id do usuário, não senha nem dados desnecessários), origem (IP, agente), recurso afetado e resultado. Nunca registre senhas, tokens, chaves, números de cartão ou segredos, nem em caso de erro.',
            `# vulneravel: dados sensiveis no log
log.info(f'login usuario={email} senha={senha}')

# corrigido: so o necessario, com identificador interno
log.info('login_falha', extra={'usuario_id': uid, 'ip': ip, 'motivo': 'senha_invalida'})`
          ),
          sl(
            'Formato estruturado, correlação, centralização e integridade',
            'Logs em formato estruturado (JSON, com campos nomeados) são fáceis de consultar e de alertar, ao contrário de frases livres. Inclua um identificador de correlação (request id) gerado na entrada e propagado entre serviços para reconstruir o caminho de uma requisição. Centralize os logs em um local separado das aplicações: se o servidor for comprometido, o invasor não deve conseguir apagar o rastro. Proteja a integridade: acesso de escrita restrito, cópia imutável ou assinada, sincronização de relógio entre sistemas (NTP) e alertas se o envio de logs parar. Quem pode ler os logs também precisa ser controlado, pois eles revelam atividade de usuários.',
            `{"ts":"2025-01-10T10:00:01Z","evento":"login_falha","usuario_id":"u-42",
 "ip":"198.51.100.7","request_id":"r-9f3","motivo":"senha_invalida"}`
          ),
          sl(
            'Detecção de abuso e resposta automática',
            'A detecção transforma registros em sinais. Padrões úteis: muitas falhas de login em pouco tempo (força bruta), uma mesma origem testando muitas contas com poucas tentativas cada (preenchimento de credenciais), sucesso de login logo após muitas falhas, enumeração de usuários e de identificadores (muitas respostas 404 ou 403 em sequência), varreduras (muitas URLs inexistentes), picos anormais de 4xx e 5xx, uso de funções administrativas fora do horário usual. A resposta pode ser automática e proporcional: limitação de taxa, atraso progressivo, desafio (CAPTCHA), bloqueio temporário e alerta para a equipe. Ajuste os limites com dados reais para não bloquear usuários legítimos que erram a senha.'
          ),
          sl(
            'Endpoints-isca, alertas acionáveis, SIEM e WAF',
            'Honeytokens e endpoints-isca, em visão geral, são recursos falsos que nenhum uso legítimo toca (uma rota `/admin-antigo`, uma credencial de mentira em um repositório interno): qualquer acesso é um alerta de alta confiança e baixo ruído. Um alerta acionável diz o que aconteceu, onde, qual o impacto provável e o que fazer, e tem dono; alertas que ninguém trata devem ser ajustados ou removidos. Um SIEM, em visão geral, reúne logs de várias fontes, correlaciona eventos e gera alertas e painéis. O WAF produz logs próprios (regra acionada, ação, origem) que ajudam a ver tentativas de abuso, mas um WAF sem leitura de logs perde valor, e seus logs também contêm dados pessoais.'
          ),
          sl(
            'LGPD nos logs',
            'Logs quase sempre contêm dados pessoais (IP, identificador de usuário, e-mail, às vezes conteúdo de requisições), então a LGPD se aplica a eles. Boas práticas: minimizar (registrar só o necessário para a finalidade de segurança e depuração); mascarar ou pseudonimizar o que for identificável; nunca registrar dados sensíveis, senhas ou tokens; controlar o acesso e registrar quem consulta os logs; definir prazo de retenção e eliminar automaticamente após o prazo; proteger em trânsito e em repouso; e documentar a finalidade e a base legal. Retenção maior para fins de investigação precisa ser justificada e proporcional. Esta é uma visão geral e não substitui orientação jurídica.'
          ),
          sl(
            'Detector simples de força bruta e preenchimento de credenciais',
            'Um detector básico conta falhas de login por origem em uma janela e alerta quando passa de um limite; também resume em quantas contas diferentes a origem tentou, o que distingue força bruta (uma conta, muitas senhas) de preenchimento de credenciais (muitas contas, poucas tentativas). O script abaixo foi executado sobre um log fictício, com IPs de documentação, e a saída é real:',
            `LIMITE = 5
falhas = defaultdict(list)
for linha in logs:
    ts, evento, ip, usuario = linha.split()
    if evento == 'login_falha':
        falhas[ip.split('=')[1]].append(usuario.split('=')[1])
for ip, us in falhas.items():
    if len(us) >= LIMITE:
        print(f'ALERTA: {ip} com {len(us)} falhas em {len(set(us))} contas distintas')

# saida real
ALERTA: 198.51.100.7 com 6 falhas em 5 contas distintas (possivel preenchimento de credenciais)
ok: 203.0.113.5 com 1 falha(s)`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual evento NÃO deve ser registrado de forma alguma no log?', 'c', [
          'Criação de uma credencial administrativa, com o autor da ação.',
          'Acesso negado a um recurso por falta de permissão.',
          'A senha digitada em uma tentativa de login falha, para ajudar a diagnosticar o erro.',
          'Falha de login, com identificador interno do usuário e IP de origem.'
        ], 'Senhas, tokens e segredos não pertencem a logs, nem em erro. Os demais são eventos de segurança úteis.'),
        mcq('q2', 'Qual é a vantagem de centralizar os logs em um local separado da aplicação?', 'd', [
          'Os logs deixam de conter dados pessoais ao serem enviados para fora do servidor.',
          'Elimina a necessidade de definir prazo de retenção para os registros.',
          'A aplicação passa a responder mais rápido, pois grava menos dados localmente, e por isso o desempenho melhora, já que o disco local deixa de ser usado para escrever registros.',
          'Um invasor que comprometa o servidor tem dificuldade para apagar o rastro, e a análise correlaciona várias fontes.'
        ], 'Separar e proteger os logs preserva evidências. Os dados continuam sendo pessoais e a retenção ainda precisa ser definida.'),
        mcq('q3', 'Este código é seguro para produção?\n`log.info(f"pedido {pedido.id} do cliente {cliente.cpf} com cartao {cartao_numero}")`', 'c', [
          'Sim, desde que o arquivo de log tenha permissões de leitura restritas, já que o acesso restrito ao arquivo elimina a necessidade de minimizar os dados registrados.',
          'Não, mas só porque o formato não é JSON.',
          'Não: registra dado pessoal e número de cartão sem necessidade; use identificadores internos, mascare e minimize.',
          'Sim, pois logs servem justamente para registrar o máximo de contexto possível, mesmo quando o conteúdo inclui dados de clientes sem relação com o erro.'
        ], 'Permissões ajudam, mas minimização é o primeiro controle: o dado que não é registrado não vaza nem precisa de eliminação posterior.'),
        fill('q4', 'Qual identificador gerado na entrada e propagado entre serviços permite ligar todos os eventos de uma mesma requisição?', 'Identificador de ___ (request id)', ['correlação', 'correlacao'], 'O identificador de correlação reconstrói o caminho de uma requisição entre os serviços.'),
        mcq('q5', 'O detector mostra: "198.51.100.7 com 6 falhas em 5 contas distintas". Qual é a leitura mais provável?', 'c', [
          'Uma varredura de portas contra o servidor.',
          'Um problema de disponibilidade do banco de dados, já que as consultas de autenticação dependem diretamente desse serviço.',
          'Possível preenchimento de credenciais: uma origem testando muitas contas, com poucas tentativas cada.',
          'Um usuário legítimo que esqueceu a senha e tentou várias vezes, pois uma pessoa legítima costuma errar a senha de várias contas diferentes em poucos segundos.'
        ], 'Muitas contas diferentes a partir da mesma origem indicam preenchimento de credenciais; resposta proporcional inclui limitação de taxa, desafio e alerta.'),
        mcq('q6', 'Qual característica define um alerta acionável?', 'b', [
          'Contém o log bruto completo, sem resumo, para evitar interpretação errada.',
          'Descreve o que ocorreu, onde, o impacto provável e o que fazer, e tem responsável definido.',
          'É enviado a todas as pessoas da empresa para dar visibilidade.',
          'Dispara a cada evento registrado, para não perder nenhum detalhe.'
        ], 'Alerta bom leva a uma ação clara por um responsável; excesso de alertas sem dono vira ruído que é ignorado.'),
        mcq('q7', 'Qual prática de retenção de logs é mais coerente com a LGPD?', 'a', [
          'Definir prazo proporcional à finalidade, restringir acesso, mascarar o identificável e eliminar automaticamente ao fim do prazo.',
          'Guardar todos os logs indefinidamente, pois podem ser úteis em investigações futuras.',
          'Apagar os logs diariamente, mesmo os de segurança, para reduzir qualquer risco jurídico, e a eliminação diária reduz o risco jurídico mais do que manter uma trilha de auditoria por prazo definido.',
          'Liberar a leitura dos logs para toda a equipe de desenvolvimento, para agilizar depurações.'
        ], 'Equilíbrio entre finalidade de segurança e minimização: prazo definido e justificado, acesso controlado, eliminação programada.'),
        fill('q8', 'Complete o limite do detector: alertar quando a quantidade de falhas for maior ou igual ao limite.', 'if len(falhas) ___ LIMITE:', ['>=', '≥'], 'O operador >= dispara o alerta quando o limite é atingido ou ultrapassado.')
      ]
    },
    {
      id: 'owi-32-resposta-incidentes',
      title: 'Resposta a incidentes em aplicações web',
      goal: 'Preparar e executar a resposta a incidentes: conter, erradicar, recuperar, comunicar e aprender, sem culpar pessoas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Preparação: o que precisa existir antes do incidente',
            'Incidente de segurança é um evento que compromete confidencialidade, integridade ou disponibilidade. Durante um incidente não há tempo para decidir tudo do zero, então prepare antes: lista de contatos (equipe técnica, gestão, jurídico, encarregado de dados, fornecedores) atualizada; papéis claros (quem coordena, quem investiga, quem comunica); runbooks com passos para cenários prováveis (chave vazada, conta comprometida, injeção); backups testados e isolados; logs centralizados e protegidos; inventário de sistemas e dados; capacidade de revogar sessões, tokens e chaves rapidamente; canal de comunicação alternativo. Faça exercícios de mesa para treinar.'
          ),
          sl(
            'Detecção e triagem',
            'Um incidente começa por um sinal: alerta de monitoramento, relato de usuário, aviso de fornecedor, relato externo (security.txt). A triagem responde: é real ou falso alarme? Qual o escopo provável (sistemas, dados, usuários)? Qual a gravidade (dados pessoais envolvidos, operação crítica parada)? Há atacante ativo? Registre desde o início uma linha do tempo com horários, quem fez o quê e o que foi observado. Defina um responsável pela coordenação e abra um canal único de comunicação. Evite tomar decisões irreversíveis (apagar máquinas, reiniciar tudo) antes de saber como preservar evidências.'
          ),
          sl(
            'Contenção, erradicação e recuperação',
            'Contenção: limitar o dano rapidamente, sem destruir evidências. Exemplos: revogar sessões e tokens, rotacionar chaves e senhas comprometidas, bloquear origens, isolar o servidor da rede, desativar a funcionalidade afetada, colocar o sistema em modo somente leitura. Erradicação: eliminar a causa-raiz, e não só o sintoma; corrigir a vulnerabilidade, remover acessos e artefatos do atacante, atualizar componentes, fechar o caminho que foi usado. Recuperação: restaurar a operação normal a partir de backups ou de builds limpos, monitorar de perto sinais de retorno e só então reabrir o serviço. Pular a erradicação costuma levar à reincidência.',
            `# exemplo de plano de contencao (chave de API vazada)
1. revogar a chave e emitir uma nova (no cofre, nao no codigo)
2. verificar nos logs do provedor usos indevidos desde a data do vazamento
3. rotacionar outros segredos que estavam junto
4. corrigir a causa: como a chave chegou ao repositorio?
5. teste/regra para impedir recorrencia (varredura de segredos no pre-commit)`
          ),
          sl(
            'Comunicação e LGPD, em visão geral',
            'Comunique com clareza e sem especulação. Internamente: o que se sabe, o que não se sabe, ações e próximos passos. Para clientes e titulares: o que aconteceu, quais dados foram afetados, o risco, o que a pessoa pode fazer e como contatar a organização. Para a ANPD (Autoridade Nacional de Proteção de Dados): a LGPD prevê que o controlador comunique à autoridade e ao titular a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, com informações como a natureza dos dados afetados, os titulares envolvidos, as medidas técnicas adotadas e os riscos; o prazo e o formato são definidos pela regulamentação da ANPD, que deve ser consultada, e o encarregado e o jurídico devem ser acionados desde o início. Este curso apresenta só conceitos e não substitui orientação jurídica.'
          ),
          sl(
            'Evidências e lições aprendidas sem culpados',
            'Preserve evidências antes de limpar: cópias dos logs relevantes, imagens de disco ou de máquinas virtuais quando apropriado, lista de processos e conexões, hashes dos arquivos coletados, registro de quem acessou o material (cadeia de custódia). Isso permite investigar a causa e atende a obrigações legais. Depois do incidente, faça uma reunião de lições aprendidas sem culpados (blameless): o foco é entender como o sistema e o processo permitiram a falha, e não achar quem errou; pessoas que temem punição escondem informações. Produza ações concretas: correções, testes de regressão, melhoria de monitoramento, ajustes nos runbooks, treinamento, com responsáveis e prazos.'
          ),
          sl(
            'Cenários e exercícios de mesa',
            'Três cenários para treinar. Vazamento de chave de API: revogar e rotacionar, verificar uso indevido, corrigir como a chave foi parar no repositório, adicionar varredura de segredos. Injeção de SQL explorada: conter (bloquear a rota ou colocar o WAF em modo de bloqueio como medida temporária), avaliar quais dados foram lidos ou alterados com os logs, corrigir com consultas parametrizadas, rotacionar credenciais do banco, restaurar dados se alterados, escrever teste de regressão, avaliar comunicação aos titulares. Conta administrativa comprometida: desabilitar a conta, revogar sessões e tokens, revisar tudo o que foi feito com ela (auditoria), trocar credenciais associadas, exigir MFA, investigar como as credenciais foram obtidas. Em um exercício de mesa a equipe percorre cenários fictícios, discute decisões e descobre lacunas sem risco real.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual item faz parte da preparação para incidentes?', 'd', [
          'Escolher o responsável pela comunicação apenas quando o incidente já estiver em andamento.',
          'Evitar documentar procedimentos, para que o atacante não os encontre.',
          'Manter os backups no mesmo servidor da aplicação, para restauração rápida, e verificar a restauração uma vez por ano.',
          'Lista de contatos atualizada, papéis definidos, runbooks e backups testados e isolados.'
        ], 'Preparação reduz decisões improvisadas. Backups no mesmo servidor podem ser perdidos junto, e definir papéis na hora atrasa a resposta.'),
        mcq('q2', 'Uma conta administrativa foi comprometida. Qual é a ação de contenção mais adequada?', 'c', [
          'Reiniciar todos os servidores imediatamente, sem coletar informação antes.',
          'Apagar a conta e os logs relacionados para eliminar qualquer vestígio.',
          'Desabilitar a conta, revogar sessões e tokens, e revisar tudo o que foi feito com ela.',
          'Aguardar o atacante agir novamente para identificar sua origem.'
        ], 'Conter sem destruir evidências: bloquear o acesso e auditar as ações. Apagar logs ou reiniciar tudo sem coleta prejudica a investigação.'),
        mcq('q3', 'Após conter um incidente de injeção de SQL, qual passo corresponde à erradicação?', 'b', [
          'Comunicar a imprensa antes de entender o que foi acessado.',
          'Corrigir a causa-raiz com consultas parametrizadas, rotacionar credenciais e escrever teste de regressão.',
          'Restaurar o backup e liberar o serviço sem alterar o código, pois o código já foi validado quando o último backup foi gerado e não contém a falha explorada.',
          'Colocar um WAF na frente e considerar o assunto encerrado.'
        ], 'Erradicar é eliminar a causa. WAF e restauração sem correção deixam a falha para a próxima exploração.'),
        fill('q4', 'Como se chama a reunião pós-incidente focada em entender falhas do sistema e do processo, sem apontar culpados? (termo em inglês)', 'Revisão ___ (sem culpados)', ['blameless'], 'Revisões blameless incentivam o compartilhamento honesto de informações e levam a melhorias reais.'),
        mcq('q5', 'Por que preservar evidências antes de limpar os sistemas?', 'a', [
          'Permite investigar a causa-raiz, entender o escopo e atender a obrigações legais, com cadeia de custódia.',
          'Porque os logs devem ser enviados ao atacante para ele corrigir o erro, o que ajudaria o atacante a encerrar o acesso por conta própria.',
          'Porque a restauração só pode ocorrer depois de seis meses, e esse prazo é definido pela regulamentação para todos os incidentes de natureza semelhante.',
          'Porque a comunicação aos titulares depende de apagar todos os logs.'
        ], 'Sem evidências não se sabe como o atacante entrou nem o que acessou, e não há como provar o ocorrido.'),
        mcq('q6', 'Qual afirmação sobre comunicação e LGPD em um incidente é adequada em visão geral?', 'c', [
          'A comunicação aos titulares é facultativa em qualquer situação, desde que a falha seja corrigida.',
          'O prazo e o formato de comunicação são os mesmos para qualquer organização, e não requerem consulta à regulamentação.',
          'Quando o incidente puder acarretar risco ou dano relevante aos titulares, a LGPD prevê comunicação à ANPD e aos titulares; o encarregado e o jurídico devem ser acionados desde o início.',
          'Não é necessário envolver o encarregado nem o jurídico, pois o incidente é técnico.'
        ], 'O conceito é de comunicação ao ocorrer risco ou dano relevante, com detalhes definidos pela regulamentação. Isso não substitui orientação jurídica.'),
        mcq('q7', 'Uma chave de API foi encontrada em um repositório público. Qual é a ordem mais adequada de ações?', 'd', [
          'Trocar apenas o nome da chave no repositório e continuar usando o mesmo valor, pois a troca do nome impede que a chave seja localizada por ferramentas de varredura de segredos.',
          'Esperar a próxima janela de manutenção mensal para trocar a chave.',
          'Apagar o commit, manter a chave ativa e acompanhar se alguém a usa.',
          'Revogar e rotacionar a chave, verificar usos indevidos nos logs do provedor, corrigir a causa e prevenir recorrência.'
        ], 'A chave deve ser considerada comprometida desde a publicação; revogar primeiro, investigar depois e prevenir com varredura de segredos.'),
        fill('q8', 'Como se chama o exercício em que a equipe discute, em torno de uma mesa, as decisões de um cenário fictício de incidente?', 'Exercício de ___', ['mesa'], 'Exercícios de mesa treinam decisões e revelam lacunas em contatos, papéis e runbooks sem risco real.')
      ]
    },
    {
      id: 'owi-33-privacidade-lgpd-aplicacoes',
      title: 'Privacidade por design e LGPD em aplicações',
      goal: 'Aplicar privacidade desde o projeto: minimizar dados, implementar direitos do titular, definir retenção e pseudonimizar quando fizer sentido.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Mapear dados e fluxos; minimização e finalidade',
            'Privacidade por design significa pensar na proteção dos dados pessoais desde o projeto da funcionalidade, e não depois. O primeiro passo é mapear: quais dados pessoais a aplicação coleta (nome, e-mail, IP, localização, identificadores de dispositivo), onde ficam (banco, logs, backups, analytics, e-mails), para onde vão (terceiros, outras equipes) e quem acessa. A partir do mapa, aplique dois princípios da LGPD: finalidade (cada dado é coletado para um propósito específico, informado ao titular, e não pode ser usado para outro incompatível) e necessidade/minimização (coletar só o mínimo indispensável para aquela finalidade). A pergunta de projeto é: "precisamos mesmo deste campo?". O dado que não é coletado não vaza, não precisa ser protegido nem eliminado.'
          ),
          sl(
            'Bases legais e consentimento',
            'Todo tratamento de dados pessoais precisa de uma base legal prevista na LGPD (por exemplo, consentimento, execução de contrato, cumprimento de obrigação legal ou regulatória, legítimo interesse, entre outras). O consentimento não é a única base e nem sempre é a mais adequada. Quando for a base, deve ser livre, informado e para finalidades específicas; na aplicação isso significa opções granulares (uma caixa por finalidade, nunca pré-marcadas), linguagem clara, registro de quando e o que foi aceito, e a possibilidade de revogar com a mesma facilidade com que foi dado. Registre a base legal de cada tratamento no mapeamento. A escolha da base é uma decisão que envolve o jurídico e o encarregado, e este curso não substitui orientação jurídica.'
          ),
          sl(
            'Direitos do titular implementados no produto',
            'A LGPD garante ao titular direitos como confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade, portabilidade, informação sobre com quem os dados foram compartilhados e revogação do consentimento. Na prática, a aplicação precisa de funcionalidades e processos: um endpoint ou tela para exportar os dados do próprio usuário em formato legível por máquina, edição de perfil, um fluxo de exclusão de conta que realmente elimina (inclusive de bancos secundários, caches e índices; backups seguem uma política de expiração), e um canal para pedidos. Autentique a pessoa antes de entregar ou apagar dados, para que o direito de um não vire vazamento para outro. Alguns dados podem precisar ser mantidos por obrigação legal; nesse caso, restrinja o uso e informe.',
            `# endpoints de direitos do titular (ideia)
GET    /me/dados            # acesso e portabilidade (exportacao em JSON)
PATCH  /me                  # correcao
DELETE /me                  # eliminacao (apos reautenticacao)
POST   /me/consentimentos   # conceder/revogar, com registro de data e finalidade`
          ),
          sl(
            'Retenção, anonimização e pseudonimização',
            'Defina quanto tempo cada dado é mantido e elimine automaticamente ao fim (tarefas agendadas, TTL em tabelas e logs), em vez de acumular para sempre. Dois conceitos que se confundem. Anonimização: o dado deixa de poder ser associado a uma pessoa por meios técnicos razoáveis; dado anonimizado, em regra, sai do alcance da LGPD, mas anonimizar de verdade é difícil (combinações de campos podem reidentificar). Pseudonimização: o identificador é substituído por um código, mas o vínculo com a pessoa pode ser refeito com informação adicional guardada separadamente; continua sendo dado pessoal e reduz risco. Um método simples é um HMAC do identificador com uma chave guardada em local distinto dos dados. Um hash simples, sem chave, de um e-mail pode ser revertido testando listas de e-mails prováveis.',
            `# pseudonimo = HMAC(chave guardada em cofre, identificador normalizado)
def pseudonimo(valor):
    return hmac.new(CHAVE_PSEUDO, valor.strip().lower().encode(), hashlib.sha256).hexdigest()[:16]

# saida real (e-mails ficticios)
'maria@exemplo.test'  -> 755a6a79b44190f9
' MARIA@exemplo.test' -> 755a6a79b44190f9   (mesmo pseudonimo apos normalizar)
'joao@exemplo.test'   -> e6fb60b0d0999064
SHA-256 sem chave de 'maria@exemplo.test' -> baffea4acdc88f52 (reproduzivel por qualquer um)`
          ),
          sl(
            'Criptografia de campos sensíveis, terceiros, cookies e registros de acesso',
            'Alguns campos (documentos, dados de saúde, dados financeiros) merecem criptografia no nível do campo, além da criptografia do disco e do transporte, com chaves em um serviço gerenciado e acesso restrito: assim um vazamento do banco não expõe o conteúdo. Terceiros: cada SDK, pixel, analytics, widget de chat ou provedor de e-mail pode receber dados pessoais; mapeie quem recebe o quê, para qual finalidade, em qual país, com qual contrato, e envie só o necessário (sem e-mail ou identificador direto se não for preciso). Cookies e rastreadores não essenciais, em geral, pedem transparência e escolha do usuário, e o carregamento deles deve respeitar a recusa. Registre quem acessa dados pessoais dentro da organização (trilha de auditoria) para detectar acesso indevido e responder a pedidos.'
          ),
          sl(
            'RIPD, encarregado e incidentes: conceitos básicos',
            'O RIPD (Relatório de Impacto à Proteção de Dados Pessoais), conceito próximo ao DPIA europeu, documenta um tratamento de maior risco: descreve os dados, a finalidade, os riscos aos titulares e as medidas para mitigá-los; a autoridade pode solicitá-lo. O encarregado (DPO) é a pessoa indicada pelo controlador como canal de comunicação com os titulares e com a ANPD, que orienta a organização sobre práticas de proteção de dados. Em incidentes de segurança que possam gerar risco ou dano relevante, a LGPD prevê comunicação à autoridade e aos titulares (veja a lição de resposta a incidentes). Tudo isto é visão geral, com conceitos básicos: obrigações e prazos dependem do caso e da regulamentação, e este material não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um formulário de newsletter pede nome completo, CPF, data de nascimento e endereço, mas só envia um e-mail semanal. Qual princípio da LGPD está sendo violado?', 'c', [
          'Segurança, pois os dados deveriam ficar em um servidor local.',
          'Transparência, pois o formulário deveria mostrar uma imagem do logotipo da empresa.',
          'Necessidade/minimização: coleta além do mínimo indispensável para a finalidade informada.',
          'Portabilidade, pois os dados deveriam ser exportáveis em formato aberto.'
        ], 'Os dados devem ser limitados ao necessário para a finalidade. Para enviar a newsletter, o e-mail basta.'),
        mcq('q2', 'Qual implementação de consentimento é mais adequada quando ele é a base legal de um tratamento de marketing?', 'd', [
          'Uma caixa única pré-marcada, que concorda com todos os usos de dados e termos futuros, pois assim o titular fica sabendo de todos os usos futuros desde o primeiro cadastro realizado.',
          'Um texto longo nos termos de uso, sem opção separada para marketing.',
          'Considerar que o uso contínuo do site já vale como consentimento específico.',
          'Opções separadas por finalidade, não pré-marcadas, com registro do aceite e revogação tão fácil quanto a concessão.'
        ], 'O consentimento deve ser livre, informado e para finalidades específicas; a revogação deve ser simples e o aceite, registrado.'),
        mcq('q3', 'Este código é adequado?\n`analytics.identify(usuario.email, {cpf: usuario.cpf, nome: usuario.nome})` enviado a um SDK de terceiros', 'a', [
          'Não: envia dados pessoais diretos a um terceiro sem necessidade; mapeie o fluxo, minimize e use identificador interno ou pseudônimo.',
          'Não, mas somente porque o nome da função deveria estar em inglês.',
          'Sim, desde que a conexão use HTTPS, que garante a conformidade com a LGPD.',
          'Sim, pois o SDK de analytics é de uma empresa conhecida e confiável, e a empresa responsável pelo SDK responde pelo tratamento, o que afasta a responsabilidade de quem coleta os dados.'
        ], 'HTTPS protege o trânsito, mas não justifica o envio. Terceiros devem receber o mínimo necessário, com finalidade e contrato.'),
        fill('q4', 'Como se chama a técnica que substitui o identificador por um código, permitindo refazer o vínculo só com informação adicional guardada separadamente?', '___ (continua sendo dado pessoal)', ['pseudonimização', 'pseudonimizacao'], 'Na pseudonimização o vínculo pode ser refeito com informação adicional guardada à parte; por isso o dado continua pessoal.'),
        mcq('q5', 'Na saída do exemplo, o mesmo e-mail com maiúsculas e espaços gerou o mesmo pseudônimo. Por que isso é útil, e por que a chave é importante?', 'c', [
          'Útil para anonimizar definitivamente; a chave serve para acelerar o cálculo.',
          'Útil para apagar o e-mail do banco; a chave é necessária só para restaurá-lo.',
          'Permite juntar registros da mesma pessoa sem expor o e-mail; sem a chave, quem tiver os dados não consegue testar e-mails prováveis para reverter o código.',
          'Útil para criptografar o e-mail; a chave é opcional, pois o SHA-256 já protege o conteúdo.'
        ], 'A normalização garante um pseudônimo estável para junção. O HMAC com chave separada impede reversão por dicionário, ao contrário do hash simples.'),
        mcq('q6', 'Qual afirmação distingue corretamente anonimização de pseudonimização?', 'a', [
          'Na anonimização não se consegue reassociar o dado a uma pessoa por meios razoáveis; na pseudonimização isso é possível com informação adicional, e o dado continua pessoal.',
          'A pseudonimização é irreversível e a anonimização é reversível com uma chave.',
          'As duas são idênticas, e ambas deixam o dado fora da LGPD.',
          'A anonimização é feita apenas no transporte e a pseudonimização, apenas no armazenamento.'
        ], 'O vínculo preservado na pseudonimização mantém o dado dentro do alcance da proteção de dados; anonimizar de verdade é mais difícil do que parece.'),
        mcq('q7', 'Um usuário solicita a exclusão de sua conta. Qual abordagem é adequada?', 'a', [
          'Reautenticar, eliminar os dados de bancos, caches e índices, manter apenas o que a lei exigir (com uso restrito), e informar ao titular.',
          'Atender o pedido por e-mail sem confirmar quem enviou, para ser rápido.',
          'Apagar só o nome e manter o e-mail e o histórico completo, pois não estão no perfil.',
          'Marcar a conta como inativa e manter todos os dados indefinidamente no banco, e a manutenção dos dados facilita o atendimento futuro caso a pessoa decida voltar a usar o serviço.'
        ], 'A eliminação deve ser efetiva e a pessoa, autenticada. Dados retidos por obrigação legal ficam restritos à finalidade, e o titular é informado.'),
        fill('q8', 'Qual a sigla do relatório que documenta tratamentos de maior risco, equivalente ao DPIA europeu?', '___ (Relatório de Impacto à Proteção de Dados Pessoais)', ['RIPD'], 'O RIPD descreve dados, finalidades, riscos e medidas de mitigação de um tratamento.')
      ]
    },
    {
      id: 'owi-34-waf-borda-anti-bot',
      title: 'WAF, proteção de borda e anti-bot',
      goal: 'Entender o que um WAF e a proteção de borda fazem e não fazem, e combater bots e preenchimento de credenciais em camadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que um WAF faz',
            'Um WAF (Web Application Firewall) inspeciona o tráfego HTTP entre os clientes e a aplicação e aplica regras para detectar e bloquear padrões de ataque conhecidos: injeção de SQL, XSS, travessia de diretórios, user agents de ferramentas de varredura, volume anormal. Pode operar em modo de detecção (só registra o que bloquearia, útil para ajustar as regras sem derrubar usuários) ou de bloqueio (recusa a requisição). O OWASP Core Rule Set (CRS), em visão geral, é um conjunto de regras genéricas e de código aberto para WAFs compatíveis, com níveis de sensibilidade configuráveis (mais sensível detecta mais, mas gera mais falsos positivos). O WAF também serve para aplicar correções virtuais rápidas enquanto o código é corrigido.'
          ),
          sl(
            'O que um WAF não faz',
            'O WAF não corrige o código: uma aplicação vulnerável continua vulnerável por trás dele. Regras baseadas em padrões podem ser contornadas por variações de codificação ou por entradas que a regra não previu; ele não entende a lógica de negócio, então não vê um BOLA (uma requisição legítima para o ID de outro usuário parece normal). Gera falsos positivos, bloqueando usuários e integrações legítimas, o que exige ajuste e exceções. E só protege o tráfego que passa por ele: se o servidor de origem for acessível diretamente pela internet, o WAF é ignorado; restrinja a origem para aceitar tráfego só da borda. O WAF é uma camada de defesa em profundidade, não um substituto de código seguro.'
          ),
          sl(
            'CDN, cache de borda, limitação de taxa e DDoS',
            'Uma CDN distribui conteúdo por servidores próximos aos usuários e absorve parte do tráfego. O cache de borda guarda respostas para reduzir a carga na origem, mas exige cuidado: nunca coloque em cache respostas personalizadas (conteúdo de um usuário entregue a outro) e defina cabeçalhos `Cache-Control` corretos (`private` ou `no-store` para dados do usuário). A limitação de taxa na borda protege endpoints sensíveis (login, recuperação de senha, busca cara) por IP, por chave ou por sessão. Proteção contra DDoS, em visão geral: ataques de negação de serviço volumétricos ou de aplicação são mitigados pela capacidade da borda, por filtragem de tráfego anômalo e por regras de taxa; a aplicação também precisa de limites e de formas baratas de rejeitar tráfego ruim.'
          ),
          sl(
            'Bots e preenchimento de credenciais (credential stuffing)',
            'Bots automatizam ações em escala: raspagem de conteúdo, criação de contas falsas, abuso de promoções e preenchimento de credenciais, em que listas de e-mail e senha vazadas em outros serviços são testadas no seu login, apostando que as pessoas reutilizam senhas. Cada IP faz poucas tentativas, então a limitação por IP isolada não basta. Sinais de detecção: muitas contas distintas por origem, taxa alta de falhas, sucessos em contas nunca usadas daquele dispositivo, user agents e padrões de navegação incomuns, horários e velocidades não humanas. Defesas combinadas: MFA, bloqueio de senhas conhecidamente vazadas no cadastro e na troca, limitação de taxa por conta e por origem, atrasos progressivos, alerta aos usuários sobre logins suspeitos.'
          ),
          sl(
            'CAPTCHA, reputação e defesa em profundidade',
            'Desafios (CAPTCHA e similares) pedem prova de que o cliente é humano. Têm limites: atrapalham a experiência e a acessibilidade, bots mais sofisticados e serviços de resolução os superam, e muitos provedores de desafio coletam dados do navegador (considere o impacto de privacidade e a transparência). Use-os de forma adaptativa, apenas quando há risco, e não como única defesa. Bloqueio por reputação (listas de IPs, redes de anonimização, países sem usuários legítimos) reduz tráfego ruim, mas gera falsos positivos e exige revisão. Defesa em profundidade combina camadas: borda (WAF, CDN, taxa), aplicação (validação, autorização, MFA), dados (criptografia, mínimo privilégio) e monitoramento; nenhuma camada sozinha é suficiente.'
          ),
          sl(
            'Ajuste, monitoramento e privacidade no WAF/CDN',
            'Implante o WAF em modo de detecção, analise os alertas por um período, ajuste regras e exceções por rota e só então passe para bloqueio, mantendo monitoramento contínuo e um processo rápido para liberar falsos positivos. Revise os logs do WAF regularmente e integre-os ao SIEM. Do ponto de vista de privacidade, o WAF e a CDN veem todo o tráfego, inclusive dados pessoais, cookies e corpos de requisição: o provedor se torna operador ou terceiro, com contrato, localização dos dados e política de retenção a avaliar; os logs do WAF contêm IPs e partes do tráfego, e devem ter acesso controlado, mascaramento de campos sensíveis (senhas, tokens) e prazo de retenção definido (LGPD).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o benefício de iniciar um WAF em modo de detecção?', 'c', [
          'Desativar as regras mais sensíveis e dispensar o monitoramento das requisições.',
          'Bloquear imediatamente todo o tráfego suspeito e eliminar a necessidade de ajustes posteriores.',
          'Registrar o que seria bloqueado para ajustar regras e exceções antes de impactar usuários legítimos.',
          'Evitar que os logs de acesso sejam gerados, reduzindo o consumo de disco do servidor.'
        ], 'O modo de detecção ajuda a medir falsos positivos antes de bloquear. O ajuste e o monitoramento continuam necessários depois.'),
        mcq('q2', 'Uma API tem BOLA: qualquer usuário autenticado lê pedidos de outros alterando o ID. O WAF com o OWASP CRS resolve isso?', 'd', [
          'Sim, desde que a sensibilidade das regras seja colocada no nível máximo, pois o conjunto de regras compensa o fato de a aplicação não verificar a posse dos objetos.',
          'Sim, pois o CRS detecta qualquer alteração de parâmetros numéricos na URL.',
          'Não, a menos que o WAF seja instalado na mesma máquina da aplicação.',
          'Não: as requisições parecem legítimas e o WAF não conhece a regra de posse do negócio; a correção é no código.'
        ], 'O WAF reconhece padrões de ataque, não regras de autorização do negócio. A correção é verificar a posse do objeto no servidor.'),
        mcq('q3', 'O servidor de origem aceita conexões diretas da internet, além das que chegam pelo WAF/CDN. Qual é o problema?', 'b', [
          'Nenhum, pois o WAF registra as requisições mesmo que elas não passem por ele, e por isso a origem não precisa de nenhuma restrição de rede adicional no ambiente.',
          'Quem descobrir o endereço da origem contorna o WAF; restrinja a origem para aceitar tráfego apenas da borda.',
          'O problema é de desempenho, pois o servidor recebe mais conexões.',
          'O problema é só de certificado: basta renovar o TLS do servidor de origem, e a origem deveria apenas ser reiniciada para aplicar o novo certificado.'
        ], 'Proteção na borda só vale para o tráfego que passa por ela; a origem deve aceitar conexões somente da borda (por rede, mTLS ou segredo de cabeçalho).'),
        fill('q4', 'Qual ataque testa, em uma tela de login, pares de e-mail e senha vazados de outros serviços, apostando na reutilização de senhas? (termo em inglês: credential ___)', 'credential ___', ['stuffing'], 'Credential stuffing usa credenciais vazadas de outros serviços; MFA e senhas únicas são as defesas mais fortes.'),
        mcq('q5', 'Por que limitar tentativas apenas por IP não basta contra o preenchimento de credenciais?', 'c', [
          'Porque o limite por IP bloqueia usuários legítimos de empresas inteiras e aumenta o suporte.',
          'Porque a limitação por IP já foi substituída pelo CAPTCHA em todos os casos.',
          'Porque o atacante distribui as tentativas por muitos IPs, com poucas tentativas cada; é preciso limitar também por conta, detectar padrões e usar MFA.',
          'Porque o limite por IP só funciona para tráfego HTTPS.'
        ], 'O abuso é distribuído; combine limites por conta e origem, detecção de padrões, MFA e verificação de senhas vazadas.'),
        mcq('q6', 'Qual afirmação sobre CAPTCHA e desafios é adequada?', 'b', [
          'Eliminam completamente os bots, e por isso dispensam outras defesas.',
          'Podem ser superados por bots avançados e impactam experiência e privacidade; use-os de forma adaptativa, junto de outras camadas.',
          'São irrelevantes para a acessibilidade, pois todos os usuários conseguem resolvê-los.',
          'Não envolvem nenhum tratamento de dados do navegador do usuário.'
        ], 'Desafios são uma camada, não uma solução completa. Considere acessibilidade e a coleta de dados feita pelo provedor.'),
        mcq('q7', 'O que deve ser considerado ao colocar respostas em cache na borda (CDN)?', 'd', [
          'Cachear as páginas de perfil por um dia, para reduzir a carga sobre a origem.',
          'Armazenar também as respostas autenticadas, para aumentar a taxa de acertos do cache, pois a CDN separa automaticamente o conteúdo de cada usuário e entrega a cópia correta.',
          'Remover os cabeçalhos Cache-Control, pois a CDN decide melhor sozinha.',
          'Não armazenar em cache respostas personalizadas, e definir Cache-Control private ou no-store para dados do usuário.'
        ], 'Cache de conteúdo personalizado pode entregar dados de uma pessoa a outra. Cabeçalhos explícitos evitam o erro.'),
        fill('q8', 'Qual cabeçalho de cache, aplicado a respostas com dados do usuário, impede o armazenamento em caches compartilhados e na borda? (valor)', 'Cache-Control: ___', ['private', 'no-store'], 'private (e no-store, para casos mais sensíveis) evita que a CDN guarde e sirva dados personalizados a outros usuários.')
      ]
    },
    {
      id: 'owi-35-frameworks-defaults',
      title: 'Frameworks: padrões seguros e armadilhas',
      goal: 'Conhecer o que frameworks populares oferecem por padrão e as armadilhas em que as pessoas mais se machucam.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que os padrões do framework importam',
            'Frameworks maduros embutem defesas: escape automático de saída, proteção contra CSRF, hashing de senhas, consultas parametrizadas pelo ORM, gestão de sessões e cabeçalhos. Quem segue o "caminho padrão" ganha essa proteção sem esforço; quem sai dele (desabilita um recurso para "resolver um erro", usa uma saída de emergência) perde a proteção sem perceber. As falhas mais comuns em aplicações com frameworks modernos não vêm de vulnerabilidades do framework, mas de configuração insegura e de uso de saídas de emergência. Os recursos variam entre frameworks e mudam entre versões: sempre confirme na documentação oficial da versão que você usa. Nesta lição, só conceitos, sem números de versão.'
          ),
          sl(
            'Django e Flask',
            'Django oferece, por padrão e em geral: auto-escape nos templates, middleware de proteção CSRF, ORM que parametriza consultas, sistema de autenticação com hashing de senhas adequado e checagens de configuração de implantação (`manage.py check --deploy`). Armadilhas: `DEBUG = True` em produção (expõe detalhes internos), `mark_safe` e o filtro `|safe` com dado de usuário, `@csrf_exempt` para "resolver" um erro 403, SQL cru montado com f-string em `raw()`/`execute()`, `SECRET_KEY` no repositório, `ALLOWED_HOSTS` mal configurado. Flask é minimalista: Jinja2 escapa por padrão em templates HTML, mas CSRF, validação e autenticação vêm de extensões (por exemplo Flask-WTF, Flask-Login); a sessão é um cookie assinado com `secret_key` (assinado, não criptografado: o conteúdo é legível), e o modo debug do servidor de desenvolvimento nunca deve ir para produção.'
          ),
          sl(
            'Express/Helmet, Spring Security e ASP.NET Core',
            'Express é minimalista: quase tudo é escolha sua. O middleware Helmet define cabeçalhos HTTP de segurança razoáveis; CSRF, validação, limites de taxa e CORS exigem pacotes e configuração; cuidado com `cors()` aberto para qualquer origem, com `req.body` aplicado direto em modelos (mass assignment) e com segredos em código. Spring Security, quando incluído, protege as rotas por padrão e habilita proteção CSRF para requisições que alteram estado, com codificadores de senha (BCrypt e similares) e cabeçalhos de segurança; armadilhas: desabilitar CSRF sem entender por que, `permitAll()` amplo, SQL por concatenação, endpoints de gerenciamento expostos. ASP.NET Core: Razor codifica HTML por padrão, há suporte a tokens antiforgery, Identity com hashing de senhas e proteção de dados; armadilhas: `Html.Raw` com entrada de usuário, endpoints sem `[Authorize]`, CORS permissivo, segredos em `appsettings` versionados.'
          ),
          sl(
            'Laravel e Rails',
            'Laravel: Blade escapa a saída com `{{ }}` (e não escapa com `{!! !!}`), middleware CSRF para rotas web, Eloquent parametriza consultas, hashing de senhas pelo facade Hash, e mass assignment controlado por `$fillable` ou `$guarded`. Armadilhas: `{!! !!}` com dado de usuário, `$guarded = []` (libera tudo), `DB::raw` com entrada, `APP_DEBUG=true` em produção, o arquivo `.env` exposto ou versionado. Rails: ERB escapa por padrão (`html_safe` e `raw` desligam isso), proteção CSRF para formulários, strong parameters para mass assignment, `has_secure_password` para hashing, ActiveRecord parametrizado com hash e placeholders. Armadilhas: `html_safe`/`raw` com entrada, `params.permit!`, interpolação de string em `where("... #{x}")`, desligar `protect_from_forgery`, segredos fora do mecanismo de credenciais.'
          ),
          sl(
            'Armadilhas comuns que atravessam frameworks',
            'Padrões de erro repetidos em todos os frameworks: modo debug ligado em produção; saída de emergência de HTML (`mark_safe`, `|safe`, `raw`, `Html.Raw`, `dangerouslySetInnerHTML`); desabilitar CSRF para "resolver" um erro em vez de enviar o token corretamente; mass assignment (aceitar todos os campos do corpo); SQL cru por concatenação em partes "difíceis" do ORM; CORS aberto (`*` ou refletir qualquer origem); segredos em arquivos de configuração versionados; cookies de sessão sem `Secure`, `HttpOnly` e `SameSite`; mensagens de erro detalhadas ao cliente; autorização feita só nas telas. Uma regra prática: quando o framework reclama de segurança, entenda a mensagem em vez de desligar a proteção.',
            `# armadilhas (resumo)
DEBUG = True                      # producao: desligar
@csrf_exempt                      # nao desligar para "resolver" erro 403
mark_safe(comentario_do_usuario)  # saida de emergencia com dado nao confiavel
Model(**request.json)             # mass assignment
db.execute(f"... {x}")            # SQL cru por concatenacao
CORS: origem = *                  # liste origens explicitas`
          ),
          sl(
            'Atualizar, ler o guia e testar; lista de verificação',
            'Mantenha o framework e suas extensões atualizados: correções de segurança chegam em versões novas, e versões fora de suporte deixam de recebê-las; use os avisos de segurança do projeto e o SCA. Leia o guia de segurança oficial do framework (todos os principais têm um) e a lista de verificação de implantação. Escreva testes que verificam as proteções (por exemplo, que o POST sem token CSRF é recusado, que o modo debug está desligado em produção, que os cabeçalhos esperados estão presentes). Lista de verificação por framework: debug desligado; segredos fora do código e do repositório; CSRF ativo; escape ativo e saídas de emergência revisadas; hashing de senha adequado; cookies de sessão com flags de segurança; cabeçalhos de segurança configurados; CORS restrito; mass assignment controlado; rotas protegidas por padrão (negar por padrão e liberar explicitamente); dependências atualizadas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um desenvolvedor recebe erro 403 de CSRF ao enviar um formulário e adiciona @csrf_exempt à view para "resolver". Qual é a avaliação correta?', 'd', [
          'Adequado, desde que a view use HTTPS, que substitui o token CSRF.',
          'Inadequado apenas se a view for pública, pois em rotas autenticadas o CSRF não existe.',
          'Adequado, pois o erro 403 indica um bug do framework que só é corrigido assim, e por isso a view deve ser marcada como isenta em todas as rotas que recebem formulários.',
          'Inadequado: remove a proteção contra CSRF; o correto é enviar o token no formulário ou na requisição.'
        ], 'O 403 é a proteção funcionando. O ajuste correto é incluir o token, e não desligar a defesa.'),
        mcq('q2', 'Em qual situação o auto-escape de um motor de templates NÃO protege contra XSS?', 'c', [
          'Quando o valor exibido contém aspas e sinais de menor ou maior.',
          'Quando o template exibe um nome de usuário comum entre chaves duplas, e a resposta já foi enviada ao navegador.',
          'Quando o desenvolvedor usa uma saída de emergência como mark_safe, |safe ou raw com dado de usuário.',
          'Quando a página é servida por HTTPS, pois nesse caso o navegador deixa de aplicar o escape que o servidor havia feito na página.'
        ], 'As saídas de emergência desligam o escape para aquele valor. O escape padrão cobre caracteres especiais em contexto HTML.'),
        mcq('q3', 'Este código é seguro?\n`Usuario.objects.create(**request.POST.dict())` num formulário de cadastro, sendo "is_staff" uma coluna do modelo', 'c', [
          'Sim, pois o ORM sempre ignora campos que não aparecem no formulário, mesmo quando o campo não consta na lista de campos do formulário enviado.',
          'Não, mas só se o servidor estiver em modo debug, pois o campo is_staff só é considerado pelo painel administrativo quando o modo debug está desligado.',
          'Não: permite mass assignment, e o cliente pode enviar is_staff; use formulários/serializadores com lista explícita de campos.',
          'Sim, porque o Django valida todos os campos automaticamente.'
        ], 'O ORM grava o que recebe. A lista de campos permitidos precisa ser explícita (formulário, serializador, fillable, strong parameters).'),
        fill('q4', 'Qual middleware do Express define cabeçalhos HTTP de segurança razoáveis por padrão?', 'app.use(___())', ['helmet'], 'O Helmet configura vários cabeçalhos de segurança; CSRF, CORS e limites continuam sendo configurados à parte.'),
        mcq('q5', 'Por que o DEBUG ligado em produção é uma falha séria?', 'a', [
          'Porque pode exibir pilhas de erro, configurações e variáveis internas a quem provocar um erro.',
          'Porque deixa o site mais lento e aumenta a conta de infraestrutura, e o consumo de memória cresce a cada requisição atendida pelo servidor de aplicação.',
          'Porque impede a instalação de atualizações do framework, já que o modo debug trava o gerenciador de pacotes do projeto.',
          'Porque desativa automaticamente o HTTPS no servidor.'
        ], 'Modo debug revela detalhes internos que facilitam ataques e podem vazar segredos. Deve estar desligado fora do desenvolvimento.'),
        mcq('q6', 'Qual conjunto de práticas é mais coerente com a orientação "atualizar e ler o guia de segurança"?', 'a', [
          'Acompanhar avisos de segurança, atualizar com testes, ler o guia oficial e testar as proteções (CSRF, debug, cabeçalhos).',
          'Fixar a versão do framework para sempre, pois mudanças podem quebrar a aplicação.',
          'Atualizar o framework mas manter a configuração antiga, sem revisar as recomendações novas.',
          'Confiar apenas nos padrões do framework e dispensar testes de segurança.'
        ], 'Versões sem suporte deixam de receber correções. Testes automatizados verificam se as proteções continuam ativas.'),
        mcq('q7', 'No Flask, a sessão padrão é um cookie assinado com a secret_key. O que isso implica?', 'b', [
          'O conteúdo é criptografado, então o cliente não consegue ler nenhum dado da sessão.',
          'O conteúdo não pode ser alterado sem a chave, mas é legível pelo cliente; não guarde segredos nela, e proteja a chave.',
          'Qualquer pessoa pode alterar o conteúdo, pois a assinatura só vale no servidor de desenvolvimento.',
          'A secret_key pode ser publicada no repositório, pois só serve para identificar a aplicação, e por isso o valor pode ser lido por quem tenha acesso ao repositório sem gerar riscos.'
        ], 'Assinatura garante integridade, não sigilo. Vazar a chave permite forjar sessões, por isso ela fica fora do repositório.'),
        fill('q8', 'Qual fechamento da sintaxe do Blade imprime a variável SEM escapar o HTML (cuidado com dados de usuário)?', 'Blade sem escape: {!! $conteudo ___', ['!!}'], 'A sintaxe {!! !!} imprime sem escape; {{ }} escapa. Use a primeira só com conteúdo confiável ou sanitizado.')
      ]
    },
    {
      id: 'owi-37-seguranca-cms-wordpress',
      title: 'Segurança de CMS e WordPress',
      goal: 'Entender por que CMS são alvos frequentes, onde estão os riscos (plugins, temas, contas) e como endurecer, monitorar e recuperar um site.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que CMS são alvos frequentes',
            'Um CMS (sistema de gerenciamento de conteúdo, como o WordPress) alimenta uma enorme quantidade de sites. Isso cria um incentivo: uma falha em um componente popular afeta milhares de instalações de uma vez, então vale a pena para quem procura alvos automatizar a busca por ela. Três fatores explicam a exposição: (1) grande base instalada, com padrões previsíveis de caminhos e arquivos; (2) ecossistema de plugins e temas feitos por terceiros, com qualidade e manutenção muito variáveis; (3) administradores frequentemente não técnicos, sem rotina de atualização ou monitoramento. O problema raramente é "o CMS é inseguro por natureza", e sim "o site foi instalado e esquecido". A boa notícia é que a maior parte do risco é controlável com processo.'
          ),
          sl(
            'Plugins e temas: a maior fonte de problemas',
            'O núcleo (core) de um CMS maduro costuma ter equipe dedicada e atualizações de segurança frequentes. Já cada plugin ou tema adicionado é código de terceiros rodando com os mesmos privilégios do site: se tiver uma falha, ela é falha do seu site. Riscos típicos: plugin com vulnerabilidade conhecida e não atualizado; plugin ou tema ABANDONADO (o autor parou de manter, então nenhuma correção virá); componentes que você instalou para um teste e nunca removeu. Há ainda os temas e plugins "nulled": versões pagas pirateadas distribuídas de graça por sites não oficiais, que muitas vezes trazem código malicioso embutido (por exemplo, uma porta dos fundos para o invasor voltar). Economizar na licença pode custar o site inteiro e os dados dos usuários. Regra: instale só de fontes oficiais ou do fornecedor, mantenha o mínimo necessário e remova o que não usa.'
          ),
          sl(
            'Contas, painel e arquivos expostos',
            'Outras superfícies de risco: (1) contas administrativas com senha fraca, reutilizada ou sem 2FA, alvo de tentativas automáticas de login; (2) a página de login e o painel (`wp-admin`, `wp-login.php`) abertos à internet inteira, e o endpoint `xmlrpc.php`, um mecanismo antigo de acesso remoto que, se não for necessário, deve ser desativado ou restrito; (3) enumeração de usuários: o site revela nomes de login (por exemplo por URLs de autor ou pela API), o que dá metade da credencial a quem tenta adivinhar a senha; (4) permissões de arquivo frouxas, que deixam o servidor web gravar onde só deveria ler; (5) `wp-config.php`, que guarda as credenciais do banco e as chaves de segurança, e precisa de acesso restrito e jamais pode ficar legível pela web; (6) listagem de diretórios ligada e backups esquecidos na pasta pública (como `backup.zip` ou `site.sql`), que entregam código e dados a quem digitar a URL.',
            '# Esqueleto ILUSTRATIVO de endurecimento (wp-config.php, valores como <placeholder>)\ndefine(\'DB_PASSWORD\', \'<segredo-fora-do-repositorio>\');\ndefine(\'DISALLOW_FILE_EDIT\', true);   // sem editor de arquivos no painel\n\n# Servidor: sem listagem de diretórios, sem backups na pasta pública\n# Permissões: o usuário do servidor web só escreve onde precisa (uploads)'
          ),
          sl(
            'Defesas: processo e configuração',
            'Defesa em camadas, começando pelo processo: (1) mantenha um INVENTÁRIO de núcleo, plugins e temas, e atualize com frequência; atualizações automáticas de segurança reduzem a janela de exposição (teste antes em homologação quando o site for crítico); (2) instale só de fontes oficiais, mantenha o mínimo e remova o que não usa; (3) 2FA nas contas com acesso ao painel e menor privilégio nos papéis: quem só escreve artigos não precisa ser administrador; (4) limite de tentativas de login e, quando possível, restrição do painel por IP ou VPN; (5) permissões de arquivo corretas e desabilitar a edição de arquivos pelo painel (a constante `DISALLOW_FILE_EDIT`), para que uma conta comprometida não consiga alterar código pelo navegador; (6) um WAF na frente do site e monitoramento de integridade de arquivos, que avisa quando um arquivo do núcleo muda; (7) hospedagem séria, com isolamento entre contas; (8) ambiente de homologação para testar atualizações antes da produção.'
          ),
          sl(
            'Backups e monitoramento',
            'Backup é a rede de segurança final, mas só vale se for (1) frequente, (2) guardado FORA do servidor (um invasor que controla o servidor também apaga backups guardados no mesmo lugar), (3) protegido com acesso restrito e criptografia, já que contém todos os dados, e (4) TESTADO: restaurar de verdade num ambiente de teste, para saber que funciona e quanto tempo leva. Complementam: monitoramento de integridade de arquivos (hashes dos arquivos do núcleo comparados com os oficiais), alertas de novos usuários administradores, de arquivos PHP novos na pasta de uploads (onde só deveriam existir mídias) e de picos de tráfego anormais, e revisão periódica de contas e plugins.'
          ),
          sl(
            'Site comprometido: investigar e recuperar',
            'Se há suspeita de comprometimento, aja de forma ordenada: (1) contenha: coloque o site em manutenção ou isole-o e preserve cópia dos logs e dos arquivos para análise; (2) investigue: compare os arquivos do núcleo, de plugins e de temas com as versões oficiais (uma diferença inesperada é indício), procure arquivos modificados ou criados recentemente e arquivos fora do lugar (por exemplo código executável dentro de uploads), olhe contas de administrador que você não criou e tarefas agendadas desconhecidas; (3) erradique: restaure a partir de um backup anterior ao incidente e limpo, reinstale núcleo, plugins e temas a partir das fontes oficiais, e corrija a causa (normalmente um componente desatualizado ou uma senha fraca) antes de recolocar no ar; (4) troque TODAS as credenciais e chaves: senhas de usuários, senha do banco, as chaves de segurança do `wp-config.php`, acessos de FTP/SSH e tokens de API; (5) comunique e aprenda: com dados pessoais envolvidos, a LGPD pode exigir avisar a ANPD e os titulares em caso de incidente com risco relevante (consulte o encarregado ou um profissional jurídico; isto não é aconselhamento jurídico), e registre as lições aprendidas.'
          ),
          sl(
            'LGPD: dados de formulários e usuários',
            'Um CMS costuma guardar dados pessoais sem que ninguém perceba: usuários cadastrados, comentários com e-mail, entradas de formulários de contato e de newsletter, pedidos em lojas. Aplique os princípios da LGPD: colete o mínimo necessário (finalidade e necessidade), defina por quanto tempo guarda e apague o que não precisa mais (formulários antigos são um passivo), restrinja quem acessa essas entradas no painel e proteja os backups, que também contêm esses dados. Um site comprometido com banco de usuários exposto é um incidente de segurança com dados pessoais. Reduzir os dados guardados reduz o impacto.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a maior fonte de problemas de segurança em sites WordPress, segundo esta lição?', 'c', [
          'O próprio painel de login, que não pode ser protegido por nenhum controle adicional',
          'O sistema de comentários, por aceitar texto de visitantes anônimos',
          'Plugins e temas de terceiros desatualizados, abandonados ou de origem duvidosa',
          'O uso de HTTPS, que expõe o conteúdo do site a invasores na rede'
        ], 'O núcleo costuma ser mantido por equipe dedicada; o código de terceiros varia em qualidade e manutenção e roda com os mesmos privilégios do site.'),
        mcq('q2', 'Um tema pago é oferecido de graça em um site desconhecido, como versão "nulled". Qual é o principal risco?', 'a', [
          'Pode trazer código malicioso embutido e não receberá atualizações do fornecedor',
          'O tema ficará mais lento por causa da compressão extra usada na distribuição pirata dos arquivos',
          'O fornecedor oficial poderá desativar o tema remotamente a qualquer momento por violação de licença',
          'O tema deixará de funcionar com plugins oficiais por incompatibilidade de licença entre eles'
        ], 'Versões pirateadas de fontes não oficiais são um vetor clássico de código malicioso. Instale só de fontes oficiais.'),
        mcq('q3', 'Qual combinação reduz mais o risco de comprometimento de contas administrativas?', 'd', [
          'Trocar o nome de usuário padrão e manter uma senha curta e fácil de lembrar',
          'Limitar o login a um horário comercial fixo, ainda que a senha seja a mesma em outros serviços',
          'Criar um único usuário administrador compartilhado por toda a equipe para facilitar o controle',
          'Senha única e forte, 2FA, papéis com menor privilégio e limite de tentativas de login'
        ], 'Defesa em camadas: senha forte e exclusiva, segundo fator, papéis mínimos e limitação de tentativas dificultam tentativas automáticas.'),
        fill('q4', 'Complete a constante que desabilita o editor de arquivos de temas e plugins no painel.', 'define(\'DISALLOW_FILE_EDIT\', ___);', ['true'], 'Com DISALLOW_FILE_EDIT em true, mesmo uma conta administrativa comprometida não consegue editar código pelo navegador.'),
        mcq('q5', 'Onde guardar os backups de um site para que eles realmente protejam em caso de invasão?', 'b', [
          'Na mesma pasta pública do site, em um arquivo compactado com nome difícil de adivinhar por quem visita',
          'Fora do servidor, com acesso restrito, criptografia e restauração testada',
          'Em outra pasta do mesmo servidor, para que a restauração seja mais rápida durante um incidente',
          'Apenas no computador do administrador do site, sem cópia em nenhum outro lugar'
        ], 'Quem controla o servidor também apaga o que está nele. Backup fora do servidor, protegido e testado é a rede de segurança.'),
        mcq('q6', 'Na pasta de uploads aparece um arquivo .php criado ontem, e ninguém da equipe o enviou. O que isso indica e qual é o próximo passo?', 'd', [
          'É comum em instalações normais; basta ignorar, pois a pasta de uploads aceita arquivos de qualquer extensão',
          'Indica falha do navegador do administrador; basta limpar o cache e recarregar a página',
          'Indica apenas que o tema está atualizado; basta registrar a mudança e seguir normalmente',
          'Sinal forte de comprometimento: conter, preservar logs, comparar com os originais e restaurar backup limpo'
        ], 'Uploads devem conter mídia, não código executável. Um script ali sugere porta dos fundos: contenha, investigue e restaure.'),
        mcq('q7', 'Depois de restaurar um site comprometido a partir de um backup limpo, o que NÃO pode ficar de fora?', 'a', [
          'Corrigir a causa e trocar senhas, chaves de segurança e acessos de FTP/SSH e do banco',
          'Reiniciar o servidor e manter as credenciais antigas para não interromper as integrações',
          'Remover apenas o arquivo suspeito e manter o restante do ambiente como estava antes',
          'Apagar os logs antigos para que o invasor não consiga mais ler o histórico de acessos'
        ], 'Credenciais podem ter sido copiadas e a causa original continuaria aberta. Troque tudo e corrija a falha antes de voltar ao ar; guarde os logs para análise.'),
        fill('q8', 'Como se chamam os temas e plugins pagos pirateados, distribuídos de graça e frequentemente com código malicioso? (termo em inglês)', 'Temas e plugins ___', ['nulled'], 'Componentes "nulled" têm a verificação de licença removida e costumam trazer código malicioso. Prefira fontes oficiais.')
      ]
    },
    {
      id: 'owi-36-projeto-app-vulneravel',
      title: 'Projeto: tornando uma aplicação vulnerável segura',
      goal: 'Identificar cinco falhas didáticas em um app fictício, corrigi-las e escrever testes de regressão, em laboratório local e com dados fictícios.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O laboratório: app fictício, local e isolado',
            'Este projeto reúne o que você aprendeu. O app é pequeno, fictício e vulnerável de propósito, escrito em Python com `sqlite3` (banco em memória) e funções que seriam chamadas por um `http.server` local. Regras do laboratório: roda só na sua máquina (ligado em 127.0.0.1, nunca exposto na rede), usa apenas dados fictícios (alice, bob, "senha-a"), não é implantado em lugar nenhum e não deve ser copiado como modelo de código. O exercício é seguir o método de revisão: para cada função, identificar fonte e sumidouro, achar a falha, corrigir e escrever um teste que falha antes e passa depois. O código tem cinco falhas: SQL por concatenação, XSS refletido, IDOR, senha com MD5 e segredo no código. Tente achá-las antes de ler as soluções.',
            `# vuln.py (trecho) - DIDATICO, NAO REUTILIZAR
SECRET_KEY = 'chave-fixa-123'
def login(db, name, pw):
    q = "select id from users where name='" + name + "' and pw='" + hashlib.md5(pw.encode()).hexdigest() + "'"
    r = db.execute(q).fetchone()
    return r[0] if r else None
def busca_html(termo):
    return '<p>Resultados para ' + termo + '</p>'
def ler_nota(db, user_id, note_id):
    r = db.execute('select text from notes where id=?', (note_id,)).fetchone()
    return r[0] if r else None`
          ),
          sl(
            'Falhas 1 e 2: SQL por concatenação e XSS refletido',
            'Falha 1: em `login`, o nome vem do cliente e entra na consulta por concatenação. Uma entrada como `alice\' --` fecha a string e comenta o restante, anulando a checagem da senha, e o login "funciona" sem senha. Correção: consulta parametrizada; e como a verificação da senha passa a ser feita em código (veja a falha 4), a consulta só busca o usuário pelo nome. Falha 2: `busca_html` devolve HTML contendo o termo sem escape; um termo com `<script>` seria interpretado pelo navegador (XSS refletido). Correção: escapar a saída para o contexto HTML com `html.escape` (ou um motor de templates com auto-escape).',
            `# corrigido
def login(db, name, pw):
    r = db.execute('select id, salt, pw from users where name=?', (name,)).fetchone()
    if r and hmac.compare_digest(hash_senha(pw, r[1]), r[2]):
        return r[0]
    return None

def busca_html(termo):
    return '<p>Resultados para ' + html.escape(termo) + '</p>'`
          ),
          sl(
            'Falha 3: IDOR em ler_nota',
            'Falha 3: `ler_nota` recebe o `user_id` mas nunca o usa. A consulta busca a nota só por `note_id`, então qualquer usuário autenticado lê a nota de outro trocando o número (IDOR, a forma clássica de BOLA). Correção: o dono faz parte da condição da consulta. Se a nota existe mas não é do usuário, o resultado é o mesmo de "não existe" (nada é revelado). O teste de regressão tenta ler a nota 2, que pertence ao usuário 2, usando o usuário 1, e espera nada.',
            `# vulneravel
db.execute('select text from notes where id=?', (note_id,))

# corrigido: dono na consulta
db.execute('select text from notes where id=? and owner_id=?', (note_id, user_id))`
          ),
          sl(
            'Falhas 4 e 5: senha com MD5 e segredo no código',
            'Falha 4: MD5 é um hash rápido e sem sal; se o banco vazar, as senhas fracas são recuperadas em massa com tabelas e força bruta, e senhas iguais geram hashes iguais. Correção: um algoritmo de hash de senhas lento e com sal por usuário, como scrypt (da biblioteca padrão), argon2 ou bcrypt, e comparação em tempo constante. Falha 5: `SECRET_KEY = \'chave-fixa-123\'` no código vai para o repositório, para o histórico e para qualquer cópia; quem o ler pode forjar tokens ou sessões assinados com essa chave. Correção: ler de variável de ambiente ou cofre, falhar se estiver ausente, rotacionar a chave que já foi exposta e adicionar varredura de segredos no pré-commit.',
            `# corrigido (seguro.py)
SECRET_KEY = os.environ.get('APP_SECRET_KEY')   # do ambiente/cofre; rotacionar a antiga

def hash_senha(pw, salt):
    return hashlib.scrypt(pw.encode(), salt=salt, n=2**14, r=8, p=1).hex()

salt = os.urandom(16)        # um sal aleatorio por usuario, guardado junto do hash`
          ),
          sl(
            'Testes de regressão e saída real',
            'Cada falha ganha um teste que a reproduz. Os mesmos seis testes (um legítimo e cinco de regressão) foram executados contra a versão vulnerável e contra a corrigida; a saída abaixo é real, com todos os dados fictícios. A versão vulnerável falha nos cinco testes de abuso; a corrigida passa em tudo, inclusive no login legítimo, o que mostra que a correção não quebrou a função.',
            `def test_sqli_login(self):
    self.assertIsNone(mod.login(self.db, "alice' --", 'qualquer'))
def test_xss_refletido(self):
    self.assertNotIn('<script>', mod.busca_html('<script>alert(1)</script>'))
def test_idor(self):
    self.assertIsNone(mod.ler_nota(self.db, 1, 2))
def test_senha_nao_e_md5(self): ...
def test_sem_segredo_no_codigo(self): ...

# versao vulneravel
FAIL: test_idor, test_sem_segredo_no_codigo, test_senha_nao_e_md5,
      test_sqli_login, test_xss_refletido
Ran 6 tests ... FAILED (failures=5)

# versao corrigida
Ran 6 tests ... OK`
          ),
          sl(
            'Relatório curto, prioridade e verificação',
            'Um relatório curto organiza o trabalho. Prioridade pelo impacto e pela facilidade de exploração: 1) SQL por concatenação no login, crítica: permite entrar sem senha e potencialmente ler o banco; 2) IDOR, alta: qualquer usuário lê dados privados de outros; 3) segredo no código, alta: permite forjar sessões se for usado para assinar e já está exposto no histórico; 4) senha com MD5, alta se o banco vazar, e leva a reuso de senha em outros serviços; 5) XSS refletido, média: exige que a vítima abra um link preparado, mas pode roubar ações da sessão. Verificação: cada item tem um teste automatizado de regressão que passou depois da correção, e a revisão de código confirmou que não há outros pontos de concatenação, saída HTML sem escape ou consulta de objeto sem dono.',
            `ID  Falha                    Prioridade  Correcao                 Verificacao
1   SQL por concatenacao      Critica     consulta parametrizada   test_sqli_login
2   IDOR em ler_nota          Alta        filtro por owner_id      test_idor
3   Segredo no codigo         Alta        ambiente/cofre+rotacao   test_sem_segredo_no_codigo
4   Senha com MD5             Alta        scrypt + sal             test_senha_nao_e_md5
5   XSS refletido             Media       html.escape              test_xss_refletido`
          ),
          sl(
            'Checklist final e próximos passos',
            'Checklist: toda consulta é parametrizada; toda saída é escapada para seu contexto; toda leitura de objeto filtra pelo dono e toda função sensível checa o papel no servidor; senhas com hash lento e sal; segredos fora do código e do histórico, com rotação; testes de regressão para cada falha corrigida; logs sem senhas e dados pessoais desnecessários; dependências atualizadas e com varredura; dados fictícios e ambiente isolado em todo laboratório. Próximos passos (curso avançado): modelagem de ameaças aplicada a arquiteturas reais, testes de penetração com escopo formal, revisão de código em projetos maiores, segurança de pipelines e de nuvem em profundidade, e programas de divulgação responsável. Pratique sempre em ambientes próprios ou autorizados, como OWASP Juice Shop, DVWA ou WebGoat rodando localmente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Este código é seguro?\n`q = "select id from users where name=\'" + name + "\'"`', 'd', [
          'Sim, pois a consulta é executada em um banco em memória isolado do restante do sistema.',
          'Não, mas só porque faltou aplicar o hash na senha antes de montar a consulta.',
          'Sim, se o nome tiver no máximo 20 caracteres, o que limita o dano.',
          'Não: a entrada do cliente altera a estrutura da consulta; use parâmetros (`where name=?`).'
        ], 'Concatenar entrada na consulta permite injeção. O limite de tamanho não impede a alteração da lógica. A solução é parametrizar.'),
        mcq('q2', 'Qual é a correção mais adequada para o XSS refletido em busca_html?', 'a', [
          'Escapar o termo para o contexto HTML (html.escape ou auto-escape de templates) na hora de gerar a saída.',
          'Verificar no JavaScript do navegador se o termo contém sinais de menor e maior.',
          'Remover a palavra "script" do termo antes de montar o HTML, com uma substituição de texto.',
          'Converter o termo para letras minúsculas antes de exibir.'
        ], 'Remover palavras é contornável e frágil. O escape contextual na saída é a defesa correta; validação no cliente não protege o servidor.'),
        mcq('q3', 'Qual consulta corrige o IDOR em ler_nota?', 'b', [
          '`select text from notes where id=?` com (note_id), validando note_id como inteiro',
          '`select text from notes where id=? and owner_id=?` com (note_id, user_id)',
          '`select text from notes where id=?` com (note_id), após conferir se o usuário está logado',
          '`select text from notes where owner_id=?` com (user_id), devolvendo a primeira nota'
        ], 'A posse precisa fazer parte da consulta. Validar o tipo do ID ou apenas exigir login não impede a leitura de notas de outros usuários.'),
        fill('q4', 'Qual função da biblioteca padrão hashlib usada no exemplo é um hash de senhas lento, com parâmetros de custo?', 'hashlib.___(pw.encode(), salt=salt, n=2**14, r=8, p=1)', ['scrypt'], 'scrypt é uma função derivada de chave lenta, adequada a senhas, usada com um sal por usuário.'),
        mcq('q5', 'SECRET_KEY = "chave-fixa-123" foi para o repositório. Qual é a resposta completa?', 'd', [
          'Mover a chave para um arquivo de configuração dentro do mesmo repositório privado e manter o mesmo valor.',
          'Apagar o commit e manter a mesma chave, já que ninguém copiou o repositório.',
          'Trocar a chave por uma string mais longa e escrevê-la no código novamente.',
          'Ler a chave do ambiente ou de um cofre, rotacionar a que foi exposta e adicionar varredura de segredos no pré-commit.'
        ], 'A chave exposta deve ser considerada comprometida e trocada; a nova fica fora do código, e a varredura evita a recorrência.'),
        mcq('q6', 'Por que cada teste de regressão deve falhar na versão vulnerável e passar na corrigida?', 'a', [
          'Porque prova que o teste detecta a falha de verdade e que a correção a elimina, protegendo contra a volta dela.',
          'Para que o relatório mostre muitos testes reprovados e sensibilize a equipe.',
          'Porque um teste só é considerado válido quando o autor da falha concorda com ele, e esse aceite deve ser registrado no relatório de incidentes.',
          'Porque testes que passam em ambas as versões são mais rápidos de executar, e isso torna o conjunto de testes de regressão mais fácil de manter pela equipe ao longo do tempo.'
        ], 'Um teste que passa também na versão vulnerável não detecta nada. Falhar antes e passar depois valida o teste e a correção.'),
        mcq('q7', 'No relatório do projeto, qual ordem de prioridade é mais coerente?', 'a', [
          'Injeção de SQL no login (permite entrar sem senha), depois IDOR e segredo exposto, MD5 e por fim XSS refletido.',
          'Todas com a mesma prioridade, para não gerar discussões.',
          'XSS refletido primeiro, pois é o mais conhecido, e a injeção de SQL por último.',
          'Senha com MD5 primeiro, pois não depende da ação de outra pessoa para ser corrigida.'
        ], 'Priorize pelo impacto e facilidade de exploração: a injeção de login e o IDOR expõem dados diretamente; o XSS refletido depende de a vítima abrir um link.'),
        fill('q8', 'Qual atributo do módulo os usado para ler a chave do ambiente em vez de escrevê-la no código?', "SECRET_KEY = os.___.get('APP_SECRET_KEY')", ['environ'], 'os.environ dá acesso às variáveis de ambiente, mantendo segredos fora do código-fonte.')
      ]
    },
  ]
};
