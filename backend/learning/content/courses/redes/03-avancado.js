// Módulo "Avançado" do curso de Redes de Computadores (1ª metade) — lições de 8 questões (3 múltipla
// escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a validação de boot.
// Assume iniciante e intermediário e aprofunda em internals e operação profissional: BGP, OSPF
// avançado, MPLS, multicast, SDN/NFV, data center (spine-leaf, VXLAN, EVPN), virtualização de rede
// no Linux, IPv6 avançado, criptografia aplicada, PKI, QUIC/HTTP3, DNS em escala e segurança, CDN/
// anycast/GSLB, desempenho e engenharia de tráfego, WAN e SD-WAN. Helpers locais (mcq, fill, sl)
// geram exatamente o formato da validação do boot; a posição da alternativa correta é escolhida à
// mão e variada. Segurança e privacidade (LGPD): endereços só de documentação (192.0.2.0/24,
// 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32), ASNs de documentação/privados, chaves e segredos
// fictícios, ataques tratados só de forma conceitual e defensiva, logs e IPs tratados como dados
// pessoais. Nenhum número, versão ou preço sujeito a mudança é afirmado.
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
  id: 'avancado-redes',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'BGP, OSPF avançado, MPLS, multicast, SDN, VXLAN/EVPN, IPv6, criptografia, PKI, QUIC, DNS, CDN, desempenho e SD-WAN',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'rda-01-bgp',
      title: 'BGP: o protocolo da internet',
      goal: 'Entender como sistemas autônomos trocam rotas com BGP, como os atributos de caminho implementam políticas e como proteger a sessão e os prefixos contra erros e sequestros.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Sistemas autônomos e por que precisamos de um EGP',
            'Um sistema autônomo (AS) é um conjunto de redes sob a mesma administração técnica e com uma política de roteamento comum. Cada AS tem um número, o ASN (16 ou 32 bits), atribuído pelos registros regionais. Para documentação existem os ASNs 64496 a 64511; os ASNs 64512 a 65534 são privados (uso interno, nunca anunciados à internet). Dentro de um AS você usa um IGP (OSPF, IS-IS) que otimiza uma métrica. ENTRE ASs o objetivo não é o caminho mais curto, e sim a POLÍTICA: com quem você troca tráfego, quem paga a quem, por onde prefere entrar e sair. O protocolo de roteamento entre ASs (EGP) usado na internet é o BGP-4. Ele é do tipo path-vector: cada rota carrega a lista de ASs por onde passou.',
            'AS 64500 (sua empresa)  ---  AS 64501 (provedor A)\n        |                          |\n        +------ AS 64502 (provedor B) --- resto da internet\n\nIGP: dentro de cada AS   |   BGP: entre os ASs'
          ),
          sl(
            'A sessão BGP: TCP/179, eBGP e iBGP',
            'Vizinhos BGP são configurados manualmente e conversam por uma sessão TCP na porta 179 (confiável, sem protocolo próprio de retransmissão). As mensagens são OPEN (parâmetros e ASN), KEEPALIVE, UPDATE (anuncia ou retira prefixos) e NOTIFICATION (erro; derruba a sessão). Se o ASN do vizinho é DIFERENTE do seu, a sessão é eBGP (borda entre organizações, normalmente um salto direto). Se é IGUAL, é iBGP (dentro do AS, leva as rotas externas aos demais roteadores). Duas regras clássicas: (1) o eBGP troca o NEXT_HOP para o próprio roteador ao anunciar; o iBGP preserva o next hop original (por isso usa-se next-hop-self nas bordas); (2) uma rota aprendida de um vizinho iBGP NÃO é repassada a outro vizinho iBGP, para evitar loops dentro do AS — daí a necessidade de full mesh ou de route reflectors. Contra loops entre ASs, o roteador descarta rotas cujo AS_PATH já contém o seu próprio ASN.',
            'router bgp 64500\n neighbor 192.0.2.1 remote-as 64501   ! ASN diferente: eBGP\n neighbor 192.0.2.2 remote-as 64500   ! mesmo ASN: iBGP\n neighbor 192.0.2.2 next-hop-self'
          ),
          sl(
            'Atributos de caminho',
            'Cada rota BGP viaja com atributos que alimentam a decisão. AS_PATH: lista ordenada dos ASs atravessados (cada AS se acrescenta ao anunciar para fora); caminho menor é preferido e fazer prepend (repetir o próprio ASN) o alonga de propósito para desencorajar a entrada por aquele lado. NEXT_HOP: o IP do próximo salto, que precisa ser alcançável pelo IGP. LOCAL_PREF: preferência dentro do AS (o MAIOR vence), usada para escolher a SAÍDA; não atravessa a fronteira do AS. MED (Multi-Exit Discriminator): sugestão que um AS envia ao vizinho para influenciar a ENTRADA; o MENOR vence e só é comparado entre rotas do mesmo AS vizinho. ORIGIN: de onde a rota nasceu (IGP, EGP ou incompleta). Comunidades: etiquetas numéricas (formato ASN:valor, ex. 64500:80) que acompanham a rota; não alteram nada sozinhas, mas os roteadores aplicam políticas conforme a etiqueta (por exemplo, "abaixe o LOCAL_PREF" ou "não anuncie a peers").',
            'R1# show ip bgp\n   Network            Next Hop     Metric LocPrf Weight Path\n*> 198.51.100.0/24    192.0.2.1         0    200      0 64501 64502 i\n*  198.51.100.0/24    192.0.2.5         0    100      0 64503 i\n! O "*>" é o melhor: LocPrf 200 venceu, mesmo com AS_PATH mais longo'
          ),
          sl(
            'Como o BGP escolhe o melhor caminho (visão geral)',
            'Havendo várias rotas para o mesmo prefixo, o BGP aplica critérios em ordem até desempatar. Em visão geral: (0) a rota precisa ser válida e o next hop alcançável; em implementações Cisco vem antes o weight, local ao roteador; (1) MAIOR LOCAL_PREF; (2) rota originada localmente; (3) MENOR AS_PATH; (4) menor ORIGIN; (5) menor MED; (6) eBGP preferido a iBGP; (7) menor métrica IGP até o next hop; (8) desempates finais, como o menor router ID. Observe a ordem: LOCAL_PREF vem antes do tamanho do AS_PATH, e por isso é a ferramenta principal do operador para dizer "prefiro sair por este provedor". Antes de tudo isso vale o prefixo mais específico: o roteamento IP sempre escolhe a rota de maior máscara (longest match) entre os prefixos instalados.'
          ),
          sl(
            'Trânsito, peering, filtros e prefix limits',
            'Há dois tipos de relação comercial. TRÂNSITO: o cliente paga ao provedor, que o anuncia ao mundo todo e entrega ao cliente a tabela completa. PEERING: dois ASs trocam tráfego entre si, normalmente sem pagamento, e anunciam um ao outro APENAS as rotas dos próprios clientes e as suas, nunca as aprendidas de provedores ou de outros peers (senão virariam trânsito gratuito, o chamado vazamento de rota ou route leak). Por isso toda sessão eBGP deve ter filtros: de ENTRADA (aceitar só prefixos legítimos do vizinho, rejeitar bogons, prefixos privados, o seu próprio espaço e rotas absurdamente específicas) e de SAÍDA (anunciar só o que é seu e dos seus clientes). Complemento essencial: o prefix limit (maximum-prefix), que derruba ou alerta a sessão se o vizinho anunciar mais prefixos que o combinado — protege a sua tabela e a sua CPU contra um erro de configuração do outro lado.',
            'ip prefix-list DO-CLIENTE seq 5 permit 198.51.100.0/24\nrouter bgp 64500\n neighbor 203.0.113.2 remote-as 64510\n neighbor 203.0.113.2 prefix-list DO-CLIENTE in\n neighbor 203.0.113.2 maximum-prefix 10'
          ),
          sl(
            'Sequestro de prefixo e RPKI',
            'O BGP foi projetado com confiança: se um AS anuncia um prefixo, os vizinhos tendem a aceitar. Um sequestro de prefixo (hijack) acontece, por erro ou má-fé, quando um AS anuncia um prefixo que não é seu. Anunciar um prefixo MAIS ESPECÍFICO (ex.: duas metades /24 de um /23 alheio) é particularmente eficaz, porque o longest match atrai o tráfego mesmo que o AS_PATH seja pior. A defesa estrutural é o RPKI: o dono do prefixo publica um ROA (Route Origin Authorization), assinado criptograficamente, declarando "este prefixo, até este tamanho máximo (maxLength), pode ser originado por este ASN". Os roteadores consultam validadores e classificam cada anúncio como valid (confere com um ROA), invalid (existe ROA, mas o ASN de origem ou o tamanho não bate) ou not-found (sem ROA). Fazendo ROV (route origin validation), o operador descarta os invalid. Limite: o RPKI valida a ORIGEM, não todo o caminho. Defesa em camadas: ROA para seus prefixos, filtros de entrada, prefix limits e monitoramento dos seus anúncios por serviços externos.',
            'ROA: 198.51.100.0/24  maxLength 24  origem AS 64500\nAnúncio 198.51.100.0/24 origem AS 64500 -> valid\nAnúncio 198.51.100.0/24 origem AS 64505 -> invalid\nAnúncio 198.51.100.0/25 origem AS 64500 -> invalid (maxLength)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que a internet usa um protocolo como o BGP entre organizações, em vez de simplesmente um IGP global como o OSPF?', 'b', [
          'Porque o OSPF não funciona em links de longa distância',
          'Porque entre ASs o que importa é a política (quem paga e por onde passar), e o BGP escala e expressa isso',
          'Porque o BGP é sempre mais rápido para convergir que qualquer IGP',
          'Porque o BGP descobre vizinhos automaticamente por multicast'
        ], 'Entre organizações a decisão é de política e de escala; o BGP carrega atributos de política e a lista de ASs. Seus vizinhos são configurados à mão, e ele não é famoso por convergir rápido.'),
        mcq('q2', 'Um roteador do AS 64500 tem a linha "neighbor 192.0.2.2 remote-as 64500". Que tipo de sessão é e o que muda no NEXT_HOP por padrão?', 'a', [
          'iBGP: o next hop da rota é preservado, por isso se usa next-hop-self nas bordas',
          'eBGP: o next hop é sempre trocado para o roteador local',
          'iBGP: o next hop é sempre trocado para o roteador local',
          'eBGP: a sessão usa UDP e não troca next hop'
        ], 'ASN igual ao seu = iBGP, e o iBGP não altera o next hop (o eBGP altera). Por isso o next hop externo precisa estar no IGP ou ser corrigido com next-hop-self.'),
        mcq('q3', 'Qual atributo é uma etiqueta que acompanha a rota e não altera o encaminhamento por si só, mas aciona políticas nos roteadores (ex.: 64500:80)?', 'd', [
          'MED',
          'NEXT_HOP',
          'ORIGIN',
          'Comunidade'
        ], 'Comunidades são tags (ASN:valor) interpretadas por políticas. MED sugere preferência de entrada ao vizinho; NEXT_HOP é o IP do salto.'),
        fill('q4', 'Complete com o número da porta TCP usada pelas sessões BGP.', 'tcp dst port ___   # filtro do tcpdump para capturar sessões BGP', ['179'], 'O BGP estabelece sessões sobre TCP na porta 179.'),
        mcq('q5', 'Um roteador recebe o mesmo prefixo por dois provedores. Rota X: LOCAL_PREF 200, AS_PATH com 5 ASs. Rota Y: LOCAL_PREF 100, AS_PATH com 2 ASs. Qual é escolhida?', 'c', [
          'Y, porque o AS_PATH é menor e isso sempre vence',
          'Y, porque tem o menor LOCAL_PREF',
          'X, porque o LOCAL_PREF maior é avaliado antes do tamanho do AS_PATH',
          'As duas, em balanceamento obrigatório'
        ], 'LOCAL_PREF vem antes do AS_PATH na decisão e o maior vence. É assim que o operador impõe a saída preferida.'),
        mcq('q6', 'O AS 64500 faz peering (sem custo) com o AS 64501 e compra trânsito do AS 64502. Qual anúncio ao peer 64501 está CORRETO?', 'b', [
          'Todas as rotas aprendidas de 64502, para dar acesso à internet inteira ao peer',
          'Os prefixos próprios e os dos clientes de 64500, e nada vindo do provedor de trânsito',
          'Somente a rota default, nunca prefixos específicos',
          'Os prefixos de qualquer vizinho, desde que o AS_PATH seja curto'
        ], 'No peering anunciam-se só as rotas próprias e dos clientes. Repassar rotas do provedor transformaria o peer em usuário gratuito de trânsito e causaria um route leak.'),
        mcq('q7', 'Existe um ROA: 198.51.100.0/24, maxLength 24, origem AS 64500. Chega um anúncio de 198.51.100.0/24 com origem AS 64505. Qual o estado RPKI e o que faz um roteador com ROV?', 'd', [
          'valid; aceita, pois o prefixo existe no ROA',
          'not-found; aceita, pois não há ROA',
          'valid; descarta, por causa do AS_PATH',
          'invalid; descarta, pois a origem não é a autorizada pelo ROA'
        ], 'Existe ROA para o prefixo, mas o ASN de origem não confere: invalid, e o ROV descarta. not-found só ocorre quando nenhum ROA cobre o prefixo.'),
        fill('q8', 'Complete o comando que limita quantos prefixos o vizinho pode anunciar antes de a sessão ser derrubada ou alertada.', 'neighbor 203.0.113.2 maximum-___ 10', ['prefix'], 'maximum-prefix protege a tabela contra um vizinho que vaza rotas por erro de configuração.')
      ]
    },
    {
      id: 'rda-02-ospf-avancado',
      title: 'OSPF avançado: áreas, LSAs e operação',
      goal: 'Dominar DR/BDR, áreas, tipos de LSA, áreas stub/NSSA, custo, summarização e diagnóstico de vizinhanças que não sobem.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Tipos de rede e eleição de DR/BDR',
            'O OSPF se comporta conforme o tipo de rede da interface. Em segmentos broadcast (Ethernet com vários roteadores) há eleição de DR (Designated Router) e BDR (Backup): os demais roteadores (DROthers) formam adjacência completa (Full) só com DR e BDR e permanecem em 2-Way entre si, o que reduz a inundação de LSAs. O DR é o de MAIOR prioridade na interface (padrão 1; prioridade 0 = nunca participa); empate é resolvido pelo MAIOR router ID. A eleição NÃO é preemptiva: um roteador melhor que chega depois não derruba o DR atual. Em links ponto a ponto não há eleição. Num link Ethernet com apenas dois roteadores, configurar o tipo point-to-point evita a eleição e acelera a subida. O OSPF usa o protocolo IP 89; os hellos vão ao multicast 224.0.0.5 (todos os roteadores OSPF) e as atualizações aos DR/BDR para 224.0.0.6.',
            'interface GigabitEthernet0/1\n ip ospf priority 100\n!\ninterface GigabitEthernet0/2\n ip ospf network point-to-point'
          ),
          sl(
            'Áreas, ABR e ASBR',
            'Em redes grandes, um único domínio OSPF faz toda mudança disparar SPF em todos os roteadores. Por isso se divide em áreas. A área 0 é o backbone, e toda área deve se conectar a ela. Os roteadores internos de uma área só conhecem a topologia detalhada da própria área. O ABR (Area Border Router) tem interfaces em duas ou mais áreas, mantém um banco de dados (LSDB) por área e resume as informações entre elas. O ASBR (Autonomous System Boundary Router) injeta rotas de fora do domínio OSPF (redistribuição de estáticas, BGP, outros protocolos). Benefícios das áreas: menos LSAs, SPF menor e instabilidade contida. Rotas dentro da mesma área aparecem como O; de outra área, O IA; externas, O E1 ou O E2.'
          ),
          sl(
            'Tipos de LSA em visão geral',
            'O LSDB é feito de LSAs. Tipo 1 (Router): cada roteador descreve seus links dentro da área; fica na área. Tipo 2 (Network): gerado pelo DR, lista os roteadores do segmento; fica na área. Tipo 3 (Summary): gerado pelo ABR, anuncia prefixos de OUTRAS áreas (rotas O IA). Tipo 4 (ASBR Summary): gerado pelo ABR, informa como chegar ao ASBR. Tipo 5 (AS External): gerado pelo ASBR, anuncia rotas externas e inunda todo o domínio exceto áreas stub. Tipo 7 (NSSA External): igual ao 5, mas gerado dentro de uma NSSA; o ABR o traduz em tipo 5 ao sair da área. Saber o tipo de LSA que cada papel gera ajuda a ler o show ip ospf database.',
            'R1# show ip ospf database\n  Router Link States (Area 1)        <- tipo 1\n  Net Link States (Area 1)           <- tipo 2\n  Summary Net Link States (Area 1)   <- tipo 3 (gerado pelo ABR)\n  Type-5 AS External Link States     <- tipo 5 (gerado pelo ASBR)'
          ),
          sl(
            'Áreas stub, totally stubby e NSSA',
            'Áreas de borda pequenas não precisam da tabela completa. Stub: bloqueia LSAs tipo 5 (e 4); o ABR injeta uma rota default (via LSA tipo 3), e a área continua a receber LSAs tipo 3 de outras áreas. Todos os roteadores da área precisam concordar com a flag stub, senão a vizinhança não sobe. Totally stubby (termo Cisco, área stub com no-summary no ABR): bloqueia também os tipos 3; o roteador interno só conhece as rotas da própria área mais a default. NSSA (Not-So-Stubby Area): é uma stub que PODE ter um ASBR dentro dela (ex.: uma filial que redistribui rotas estáticas); o ASBR gera LSA tipo 7, que não vaza para o backbone como tipo 7: o ABR o converte em tipo 5. A área 0 nunca pode ser stub.',
            'router ospf 1\n area 1 stub\n area 2 stub no-summary     ! no ABR: totally stubby\n area 3 nssa'
          ),
          sl(
            'Custo, referência de banda e summarização',
            'O custo OSPF de uma interface é banda de referência dividida pela banda da interface. Na Cisco IOS a referência padrão é 100 Mbps, então links de 100 Mbps, 1 Gbps e 10 Gbps têm todos custo 1 (o protocolo não distingue). Solução: ajustar com auto-cost reference-bandwidth (valor em Mbps), IGUAL em todos os roteadores, ou definir ip ospf cost por interface. Com referência de 100000 Mbps: 10 Gbps = custo 10, 1 Gbps = 100, 100 Mbps = 1000. A summarização entre áreas é feita no ABR com area X range (agrega os prefixos da área X em um só LSA tipo 3); a de rotas externas é feita no ASBR com summary-address. Resumir esconde flaps internos do resto da rede e reduz o LSDB.',
            'router ospf 1\n auto-cost reference-bandwidth 100000\n area 1 range 192.0.2.0 255.255.255.0   ! junta 192.0.2.0/25 e 192.0.2.128/25'
          ),
          sl(
            'Timers, convergência e autenticação',
            'Hello e Dead interval são os timers de detecção: o padrão em broadcast e ponto a ponto é Hello 10 s e Dead 40 s (4 hellos); em redes NBMA, 30 s e 120 s. Eles precisam COINCIDIR entre vizinhos. Para convergir mais rápido: hellos menores (até sub-segundo), BFD (detecção de falha em milissegundos, independente do protocolo) e ajustes de SPF/LSA throttling para não recalcular a cada flap. Autenticação impede que um roteador não autorizado forme adjacência e injete rotas: existem texto puro (inseguro, só identifica), MD5 e a autenticação criptográfica com HMAC-SHA, preferível. A chave precisa coincidir nos dois lados. No OSPFv3 a autenticação usa IPsec ou authentication trailer.',
            'interface GigabitEthernet0/1\n ip ospf hello-interval 1\n ip ospf dead-interval 4\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 SEGREDO-EXEMPLO'
          ),
          sl(
            'Vizinhança que não sobe: diagnóstico',
            'Estados de adjacência: Down, Init (ouviu hello do outro, mas ele não nos viu), 2-Way (comunicação bidirecional; DROthers ficam aqui entre si), ExStart (decide mestre/escravo), Exchange (troca de resumos do LSDB), Loading (pede LSAs que faltam) e Full. Causas comuns de vizinhança que não sobe: Hello/Dead diferentes; áreas diferentes na interface; flag de tipo de área (stub/NSSA) divergente; máscara diferente em rede broadcast; autenticação diferente; router ID duplicado; interface passiva; ACL ou firewall bloqueando o protocolo 89. Um sintoma clássico: vizinhos presos em ExStart/Exchange costumam indicar MTU diferente entre as interfaces. Comandos: show ip ospf neighbor, show ip ospf interface e debug ip ospf adj (com cuidado em produção).',
            'R1# show ip ospf neighbor\nNeighbor ID   Pri State          Dead Time Address     Interface\n192.0.2.2       1  EXSTART/DR     00:00:34  192.0.2.2   Gi0/1   <- preso: MTU?'
          )
        ]
      },
      questions: [
        mcq('q1', 'Num segmento Ethernet há quatro roteadores: R1 (prioridade 1, RID 192.0.2.1), R2 (prioridade 100, RID 192.0.2.2), R3 (prioridade 100, RID 192.0.2.3) e R4 (prioridade 0, RID 192.0.2.4). Todos sobem juntos. Quem vira DR?', 'c', [
          'R4, por ter o maior router ID',
          'R1, por ter o menor router ID',
          'R3, pois empata com R2 na prioridade e tem o maior router ID',
          'R2, pois foi o primeiro da lista'
        ], 'Maior prioridade vence; empate decide pelo maior router ID. Prioridade 0 (R4) nunca é eleito.'),
        mcq('q2', 'Dois roteadores OSPF estão no mesmo segmento, mas um tem Hello 10 s / Dead 40 s e o outro, Hello 30 s / Dead 120 s. O que acontece?', 'd', [
          'A adjacência sobe, usando o menor timer',
          'A adjacência sobe, usando o maior timer',
          'Sobe, mas só troca rotas O IA',
          'A adjacência não se forma: Hello e Dead precisam coincidir'
        ], 'Hello e Dead interval (assim como área, flag de stub e autenticação) precisam bater entre vizinhos.'),
        mcq('q3', 'Um roteador numa área totally stubby tem, na sua tabela, o quê?', 'a', [
          'Rotas da própria área e uma rota default injetada pelo ABR',
          'Rotas da própria área, rotas de outras áreas e uma default',
          'Apenas a rota default, sem as rotas da própria área',
          'Todas as rotas externas via LSA tipo 5'
        ], 'Totally stubby (no-summary) bloqueia LSAs tipo 3, 4 e 5; sobram as rotas intra-área e a default.'),
        fill('q4', 'Complete o comando que ajusta a banda de referência usada no cálculo do custo OSPF (valor em Mbps).', 'router ospf 1\n auto-cost reference-___ 100000', ['bandwidth'], 'auto-cost reference-bandwidth deve ser igual em todos os roteadores, senão os custos ficam inconsistentes.'),
        mcq('q5', 'Com auto-cost reference-bandwidth 100000 (Mbps), qual é o custo OSPF de uma interface de 1 Gbps?', 'b', [
          '1',
          '100',
          '10',
          '1000'
        ], 'Custo = 100000 / 1000 = 100. Com a referência padrão de 100 Mbps o custo seria 1.'),
        mcq('q6', 'Uma filial precisa de um ASBR local (redistribuindo rotas estáticas) mas sem receber a tabela de LSAs tipo 5 do resto da rede. Qual tipo de área resolve?', 'd', [
          'Stub',
          'Totally stubby',
          'Backbone (área 0)',
          'NSSA'
        ], 'Stub e totally stubby não admitem ASBR. A NSSA permite, usando LSA tipo 7, que o ABR converte em tipo 5.'),
        mcq('q7', 'Dois roteadores ficam presos no estado ExStart/Exchange. Qual é a causa mais provável?', 'a', [
          'MTU diferente entre as interfaces dos dois lados',
          'Prioridade de DR igual nos dois',
          'Rota default ausente',
          'Banda de referência diferente'
        ], 'Falha na troca de DBD por diferença de MTU é o clássico de ExStart/Exchange. Banda de referência afeta o custo, não a vizinhança.'),
        fill('q8', 'Complete o comando que resume, no ABR, prefixos da área 1 em um único LSA tipo 3.', 'router ospf 1\n area 1 ___ 192.0.2.0 255.255.255.0', ['range'], 'area X range agrega prefixos da área no ABR; para rotas externas usa-se summary-address no ASBR.')
      ]
    },
    {
      id: 'rda-31-politicas-roteamento',
      title: 'Políticas de roteamento: redistribuição, route-maps e PBR',
      goal: 'Controlar quais rotas entram, saem e como são trocadas entre protocolos, usando redistribuição, prefix-lists, route-maps e roteamento por política, com segurança operacional nas mudanças.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Por que controlar rotas',
            'Por padrão, um protocolo de roteamento anuncia e aceita quase tudo. Em redes reais isso é perigoso: uma filial pode vazar rotas para o provedor, uma rota errada pode atrair o tráfego da empresa inteira, e protocolos diferentes precisam conviver. As ferramentas de POLÍTICA de roteamento deste módulo respondem a quatro perguntas: (1) como levar rotas de um protocolo para outro (redistribuição); (2) como identificar quais rotas quero tratar (prefix-lists e ACLs); (3) como filtrar e modificar essas rotas (route-maps e distribute-list); (4) como encaminhar por uma regra que não seja só o destino (PBR). Os exemplos usam sintaxe estilo Cisco IOS como ilustração: os comandos variam entre fabricantes (Juniper, Arista, FRR, MikroTik...), mas as ideias são as mesmas.'
          ),
          sl(
            'Redistribuição entre protocolos',
            'Redistribuir é injetar, em um protocolo de roteamento, rotas aprendidas por outra fonte (outro protocolo, rotas estáticas ou redes conectadas). Casos típicos: OSPF da matriz com BGP do provedor, ou uma rota estática para uma rede legada que precisa ser conhecida por todos. Dois cuidados básicos. (1) MÉTRICA SEMENTE: cada protocolo mede custo de um jeito (OSPF usa custo, RIP usa saltos, BGP usa atributos), então não existe conversão automática; ao redistribuir, define-se uma métrica inicial (seed metric) explícita, que o protocolo de destino passa a usar. (2) DISTÂNCIA ADMINISTRATIVA (AD): quando duas fontes diferentes oferecem o MESMO prefixo, o roteador escolhe a de MENOR AD, antes de olhar qualquer métrica. Valores clássicos: conectada 0, estática 1, eBGP 20, OSPF 110, iBGP 200. Logo, para um prefixo oferecido por eBGP (20) e por OSPF (110), vence o eBGP.',
            'router ospf 1\n redistribute static subnets metric 50   ! rotas estáticas entram no OSPF com métrica semente 50\n!\nrouter bgp 64500\n redistribute ospf 1 route-map OSPF-PARA-BGP'
          ),
          sl(
            'Loops de redistribuição e tags',
            'Se há DOIS pontos de redistribuição entre os protocolos A e B, uma rota pode ir de A para B no roteador R1 e voltar de B para A no roteador R2, já com outra métrica e outra AD. O resultado é roteamento sub-ótimo (o tráfego faz um caminho absurdo) ou até loop. A defesa padrão é a TAG: um rótulo numérico que acompanha a rota. Ao redistribuir A para B, você marca (set tag 100); ao redistribuir B para A, você RECUSA as rotas com essa marca (match tag 100). Assim, só voltam as rotas que realmente nasceram em B. Outras defesas: redistribuir poucas rotas e sempre filtradas, preferir sumarização, evitar redistribuição mútua em mais de um ponto sem filtro.',
            'route-map A-PARA-B permit 10\n set tag 100\n!\nroute-map B-PARA-A deny 10\n match tag 100        ! rota já veio de A: não devolve\nroute-map B-PARA-A permit 20'
          ),
          sl(
            'Prefix-lists e ACLs para casar rotas',
            'Para dizer QUAIS rotas uma política afeta, usa-se uma prefix-list, que casa o prefixo e o seu COMPRIMENTO de máscara. Sintaxe: prefixo/tamanho, com os modificadores opcionais ge (comprimento maior ou igual a) e le (menor ou igual a). Sem ge/le, só casa exatamente aquele prefixo. "permit 192.0.2.0/24 le 28" casa 192.0.2.0/24 e qualquer sub-rede dentro dele até /28 (a /24, uma /26, uma /28...). "permit 192.0.2.0/24 ge 26 le 28" casa só /26 a /28 dentro dele. Fim da lista = deny implícito (o que nenhuma linha permite, é negado). Uma ACL padrão também pode casar rotas, mas olha só o endereço de rede com máscara curinga, sem o comprimento; por isso a prefix-list é mais precisa e preferida. Um filtro simples de rotas é a distribute-list, que aplica uma prefix-list ou ACL ao que um protocolo anuncia ou aceita (conceito: é um filtro de entrada ou saída de rotas, sem modificar atributos).',
            'ip prefix-list INTERNAS seq 10 permit 192.0.2.0/24 le 28\n! 192.0.2.0/24 e 192.0.2.64/26 casam; 192.0.2.0/29 não (maior que /28)\n! 198.51.100.0/24 não casa: fora do prefixo, e a lista termina em deny implícito'
          ),
          sl(
            'Route-maps: match, set, permit/deny e sequência',
            'O route-map é a ferramenta geral: uma lista de blocos numerados (sequências, avaliados do menor para o maior número). Cada bloco tem ação permit ou deny, cláusulas match (condições: prefix-list, tag, AS_PATH, comunidade...) e cláusulas set (alterações: métrica, LOCAL_PREF, tag, next hop...). O roteador testa os blocos em ordem; no PRIMEIRO cujo match for verdadeiro: se for permit, aplica os set e aceita a rota; se for deny, REJEITA a rota. Um bloco permit sem match casa tudo. Se nenhum bloco casar, vale o DENY IMPLÍCITO no fim: a rota é rejeitada. Por isso um route-map só com blocos que casam exceções, sem um permit final, descarta todo o resto sem aviso: o erro clássico de quem esquece o "permit 20" no fim. Use números espaçados (10, 20, 30) para poder inserir blocos depois.',
            'route-map OSPF-PARA-BGP deny 10\n match ip address prefix-list PRIVADAS    ! nunca anunciar\nroute-map OSPF-PARA-BGP permit 20\n match ip address prefix-list INTERNAS\n set local-preference 200\n! rota que não casou nem em 10 nem em 20: deny implícito'
          ),
          sl(
            'PBR: decidir por quem envia, não só pelo destino',
            'No roteamento normal a decisão depende só do DESTINO (longest match na tabela de rotas). O PBR (policy-based routing) escolhe o caminho por outros critérios: endereço de ORIGEM, porta, protocolo. Exemplo: o tráfego da rede de visitantes sai por um link de internet barato, e o da empresa, pelo link principal. Configura-se com um route-map (match numa ACL, set do próximo salto) aplicado na interface onde o tráfego ENTRA; o que não casa segue a tabela normal. Use com parcimônia: foge do modelo "tabela de rotas" e dificulta o diagnóstico; prefira o roteamento normal sempre que possível. VRF-lite (visão geral): várias tabelas de roteamento isoladas no mesmo roteador, sem MPLS; cada interface pertence a uma VRF, e redes com endereços sobrepostos (como dois clientes usando o mesmo 192.0.2.0/24) convivem sem conflito.',
            'ip access-list standard VISITANTES\n permit 192.0.2.0 0.0.0.255\nroute-map SAIDA-VISITANTES permit 10\n match ip address VISITANTES\n set ip next-hop 203.0.113.1\ninterface GigabitEthernet0/1\n ip policy route-map SAIDA-VISITANTES'
          ),
          sl(
            'Verificação e riscos em produção',
            'Antes e depois de mudar políticas, verifique: show ip route (a rota foi instalada? com qual protocolo e AD?), show ip route 192.0.2.10 (qual caminho este destino usa), show route-map e show ip prefix-list (a política está como se pensa; contadores de casamento), show ip protocols (o que o protocolo redistribui e filtra) e um traceroute do ponto de vista dos usuários. Simule em laboratório virtual com a topologia real. Mudanças de política são arriscadas porque afetam MUITAS rotas de uma vez, e um erro de filtro pode isolar a rede ou vazar rotas para a internet. Boas práticas: janela de mudança aprovada, revisão por um segundo engenheiro, configuração anterior guardada, mudança pequena de cada vez e um plano de REVERSÃO pronto. Em equipamentos Cisco, uma rede de segurança clássica é agendar uma reinicialização com reload in 10 sem salvar a configuração: se a mudança derrubar o acesso, em 10 minutos ele volta ao estado salvo; se deu certo, cancela-se com reload cancel e então salva-se.',
            'R1# reload in 10        ! rede de segurança\n  ...aplica a mudança, testa...\nR1# reload cancel       ! deu certo\nR1# copy running-config startup-config'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que é preciso definir uma métrica semente (seed metric) ao redistribuir rotas de um protocolo para outro?', 'c', [
          'Para criptografar as rotas redistribuídas',
          'Porque a métrica semente evita que a distância administrativa seja usada',
          'Porque cada protocolo mede custo de um jeito e não existe conversão automática entre eles',
          'Porque o protocolo de destino só aceita métricas iguais a zero'
        ], 'OSPF usa custo, RIP usa saltos, BGP usa atributos: não há equivalência. A semente dá à rota um valor inicial na linguagem do protocolo de destino.'),
        mcq('q2', 'O roteador aprende o mesmo prefixo por eBGP (AD 20) e por OSPF (AD 110). Qual rota é instalada na tabela e por quê?', 'a', [
          'A do eBGP, porque a menor distância administrativa vence antes de qualquer comparação de métrica',
          'A do OSPF, porque a métrica de custo é sempre avaliada primeiro',
          'As duas, em balanceamento obrigatório',
          'Nenhuma, porque fontes diferentes não podem ser comparadas'
        ], 'A AD compara a confiança entre fontes diferentes; só entre rotas da mesma fonte é que a métrica desempata.'),
        mcq('q3', 'Há dois roteadores fazendo redistribuição mútua entre os protocolos A e B, e as rotas estão voltando para onde nasceram com caminhos ruins. Qual é a defesa padrão?', 'd', [
          'Aumentar o Hello e o Dead interval',
          'Desligar a autenticação para os roteadores convergirem',
          'Redistribuir tudo sem filtro para ter mais opções de caminho',
          'Marcar as rotas com tag ao passar de A para B e recusar essa tag na volta de B para A'
        ], 'A tag identifica a origem da rota; o filtro com match tag impede que ela retorne ao protocolo onde nasceu.'),
        fill('q4', 'Complete a ação do último bloco para que o route-map aceite todas as demais rotas, em vez de descartá-las pelo deny implícito.', 'route-map OSPF-PARA-BGP deny 10\n match ip address prefix-list PRIVADAS\nroute-map OSPF-PARA-BGP ___ 20', ['permit'], 'Um bloco permit sem match casa tudo o que o deny da sequência 10 não pegou. Sem ele, o deny implícito final rejeita as outras rotas.'),
        mcq('q5', 'Dada a linha "ip prefix-list INTERNAS seq 10 permit 192.0.2.0/24 le 26", qual prefixo NÃO é casado pela lista?', 'b', [
          '192.0.2.64/26',
          '192.0.2.0/27',
          '192.0.2.0/24',
          '192.0.2.128/25'
        ], 'O le 26 aceita comprimentos de /24 a /26 dentro do prefixo. A /27 é mais específica que o limite, e cai no deny implícito.'),
        mcq('q6', 'Qual é o efeito da configuração "route-map SAIDA permit 10 / match ip address VISITANTES / set ip next-hop 203.0.113.1" aplicada com "ip policy route-map SAIDA" na interface Gi0/1?', 'c', [
          'Filtra as rotas que o OSPF anuncia pela Gi0/1',
          'Redistribui as rotas de visitantes para o BGP',
          'Pacotes que entram pela Gi0/1 e casam com a ACL VISITANTES são enviados ao 203.0.113.1, mesmo que a tabela de rotas indique outro caminho',
          'Bloqueia todo o tráfego que não casa com a ACL VISITANTES'
        ], 'É PBR: a decisão usa a origem (ACL), no ingresso da interface. O tráfego que não casa segue o roteamento normal, não é bloqueado.'),
        mcq('q7', 'Qual afirmação descreve corretamente o VRF-lite?', 'a', [
          'Várias tabelas de roteamento isoladas no mesmo roteador, sem MPLS, que permitem redes com endereços sobrepostos',
          'Um protocolo de roteamento leve que substitui o OSPF',
          'Um tipo de filtro que casa rotas pelo comprimento da máscara',
          'Uma versão do PBR que só funciona com IPv6'
        ], 'Cada VRF tem tabela própria; interfaces pertencem a uma VRF, e por isso endereços repetidos não conflitam.'),
        fill('q8', 'Complete o comando Cisco que agenda uma reinicialização em 10 minutos como rede de segurança antes de mudar a política, devolvendo o roteador à configuração salva.', 'reload ___ 10', ['in'], 'reload in 10 reinicia em dez minutos; se a mudança não for salva e der errado, ele volta ao estado anterior. reload cancel desfaz o agendamento.')
      ]
    },
    {
      id: 'rda-03-mpls',
      title: 'MPLS e redes de operadora',
      goal: 'Entender o encaminhamento por rótulos, os papéis LER/LSR, o LDP, as VPNs L3 e L2 e por que operadoras usam MPLS, engenharia de tráfego e Segment Routing.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'A ideia: encaminhar por rótulo',
            'No roteamento IP comum cada roteador faz uma consulta de prefixo mais longo (longest match) na tabela. No MPLS (Multiprotocol Label Switching) o pacote ganha um pequeno cabeçalho (shim) de 32 bits entre o cabeçalho de enlace e o IP, com: rótulo (20 bits), TC (3 bits, classe de serviço), bit S (1 bit, marca o último rótulo da pilha) e TTL (8 bits). Dentro do núcleo, o roteador só olha o rótulo e consulta uma tabela de correspondência exata (rápido e simples). Três operações: push (inserir rótulo), swap (trocar o rótulo por outro) e pop (remover). Rótulos têm significado LOCAL a cada enlace: o rótulo 17 que R1 usa para falar com R2 pode ser 40 no próximo salto.',
            'Quadro Ethernet | Cabeçalho MPLS (32 bits) | Pacote IP\n                  rótulo(20) TC(3) S(1) TTL(8)'
          ),
          sl(
            'LER, LSR, LSP e FEC',
            'LER (Label Edge Router) fica na borda da nuvem MPLS: recebe pacote IP comum e faz push do rótulo na entrada (ingress) e pop na saída (egress). LSR (Label Switching Router) fica no núcleo e só faz swap. LSP (Label Switched Path) é o caminho unidirecional que o pacote percorre, definido pela sequência de rótulos. FEC (Forwarding Equivalence Class) é o grupo de pacotes tratados da mesma forma (por exemplo, "todos os pacotes para o prefixo 198.51.100.0/24"): a entrada decide a FEC do pacote e escolhe o rótulo correspondente. Otimização comum: PHP (Penultimate Hop Popping): o penúltimo roteador do LSP já remove o rótulo, poupando ao último uma consulta dupla (de rótulo e de IP).',
            'IP --> [LER ingress: push 17] --17--> [LSR: swap 17->40] --40--> [LSR penúltimo: pop] --IP--> [LER egress]'
          ),
          sl(
            'Distribuição de rótulos: LDP',
            'Os rótulos precisam ser distribuídos entre os roteadores. O LDP (Label Distribution Protocol) associa rótulos aos prefixos do IGP: cada roteador anuncia aos vizinhos "para o prefixo X, use o rótulo Y". Os vizinhos descobrem-se por hellos UDP e formam uma sessão TCP (porta 646). Como o LDP segue a tabela do IGP, o LSP segue o caminho mais curto do IGP; para desviar disso, usa-se engenharia de tráfego (slide mais adiante). A tabela de encaminhamento por rótulos (LFIB) mostra o rótulo de entrada, a ação e o de saída.',
            'R2# show mpls forwarding-table\nLocal  Outgoing  Prefix            Next Hop\nLabel  Label\n17     40        198.51.100.0/24   192.0.2.6\n18     Pop Label 203.0.113.0/24    192.0.2.10'
          ),
          sl(
            'L3VPN: VRF, RD e RT',
            'A operadora entrega a vários clientes uma VPN de camada 3 sobre a mesma infraestrutura. Nos roteadores de borda da operadora (PE) cada cliente tem uma VRF: uma tabela de roteamento virtual isolada. O CE (equipamento do cliente) fala com o PE; os roteadores do núcleo (P) NÃO conhecem as rotas dos clientes. Entre PEs, as rotas dos clientes trafegam por MP-BGP (BGP multiprotocolo). Como dois clientes podem usar o mesmo endereço privado, o RD (Route Distinguisher, 64 bits) é anexado ao prefixo para torná-lo único no BGP (formando um prefixo VPNv4). O RT (Route Target) é uma comunidade estendida que controla QUEM importa a rota: a VRF exporta com um RT e outras VRFs importam os RTs que desejam, o que permite desenhar topologias (any-to-any, hub-and-spoke). No encaminhamento há uma pilha de dois rótulos: o externo (transporte, via LDP, leva até o PE de saída) e o interno (VPN, identifica a VRF de destino).',
            'ip vrf CLIENTE-A\n rd 64500:1\n route-target export 64500:1\n route-target import 64500:1\n!\nrouter bgp 64500\n address-family vpnv4\n  neighbor 192.0.2.2 activate'
          ),
          sl(
            'L2VPN em visão geral',
            'Quando o cliente quer um meio Ethernet e não roteamento da operadora, usa-se L2VPN. VPWS (pseudowire): um circuito ponto a ponto emulado, que transporta quadros de uma ponta a outra dentro de um LSP. VPLS: multiponto, em que a nuvem MPLS se comporta como um grande switch Ethernet (aprende MACs e inunda desconhecidos) ligando várias filiais na mesma LAN lógica. Hoje, EVPN (usando BGP como plano de controle para MACs) é a evolução preferida do VPLS. Em ambos o cliente vê o serviço como Ethernet e define o seu próprio roteamento e VLANs.'
          ),
          sl(
            'Engenharia de tráfego e Segment Routing',
            'Com o IGP, todo o tráfego tende ao caminho mais curto e deixa links alternativos ociosos. A engenharia de tráfego (TE) escolhe caminhos explícitos por demanda, banda reservada ou requisitos de latência. No MPLS-TE o protocolo RSVP-TE sinaliza LSPs com reserva de banda e permite proteção rápida (Fast Reroute), que desvia em dezenas de milissegundos. O Segment Routing (SR) simplifica: o roteador de entrada codifica o caminho como uma lista de segmentos (no SR-MPLS cada segmento é um rótulo, distribuído pelo próprio IGP, IS-IS ou OSPF). O núcleo mantém menos estado (sem LDP nem RSVP-TE) e a política fica na borda. O SRv6 aplica a mesma ideia sobre IPv6.',
            'Pilha de rótulos criada no ingress:\n[ segmento A ][ segmento B ][ segmento C ]  -> força o caminho A,B,C'
          ),
          sl(
            'Por que as operadoras usam MPLS',
            'O MPLS dá à operadora, na mesma infraestrutura: isolamento entre clientes (VPNs), qualidade de serviço por classe (via TC), engenharia de tráfego, recuperação rápida de falhas (FRR), núcleo sem a tabela BGP completa (apenas PEs a conhecem) e múltiplos serviços (L3VPN, L2VPN, internet) sobre uma só rede. O isolamento é lógico: não é criptografia, portanto dados sensíveis ainda podem exigir IPsec por cima da VPN MPLS. Para o cliente, o MPLS contratado é um serviço com SLA; ele raramente vê os rótulos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Quantos bits tem o campo rótulo no cabeçalho MPLS (shim de 32 bits)?', 'd', [
          '8',
          '3',
          '32',
          '20'
        ], 'O shim tem rótulo de 20 bits, TC de 3 bits, S de 1 bit e TTL de 8 bits (soma 32).'),
        mcq('q2', 'No PHP (Penultimate Hop Popping), qual roteador remove o rótulo?', 'b', [
          'O LER de entrada, antes de enviar',
          'O penúltimo roteador do LSP, deixando o último receber só o pacote IP',
          'O último roteador, sempre depois de duas consultas',
          'Nenhum: o rótulo chega ao destino final'
        ], 'O pop no penúltimo salto poupa ao LER de saída uma consulta dupla (rótulo e IP).'),
        mcq('q3', 'O que define uma FEC no MPLS?', 'c', [
          'O tamanho máximo do pacote no LSP',
          'O ASN do cliente',
          'Um grupo de pacotes encaminhados da mesma forma, como os destinados a um prefixo',
          'A quantidade de rótulos na pilha'
        ], 'FEC é a classe de equivalência de encaminhamento: pacotes que recebem o mesmo tratamento e o mesmo rótulo.'),
        fill('q4', 'Complete a palavra que controla quais VRFs importam as rotas de uma VPN (extended community).', 'route-___ import 64500:1', ['target'], 'O Route Target controla exportação e importação de rotas entre VRFs.'),
        mcq('q5', 'Por que dois clientes de L3VPN podem usar o mesmo prefixo privado sem conflito no BGP da operadora?', 'a', [
          'O RD é anexado ao prefixo, tornando-o único (VPNv4) por VRF',
          'O LDP troca os endereços dos clientes',
          'O núcleo converte tudo em IPv6',
          'O TTL do MPLS diferencia os clientes'
        ], 'O Route Distinguisher torna cada prefixo único no MP-BGP, mesmo que o endereço IP seja igual.'),
        mcq('q6', 'Qual afirmação descreve melhor o Segment Routing (SR-MPLS)?', 'c', [
          'Exige um LSP sinalizado por RSVP-TE para cada par de roteadores',
          'Substitui o IGP por um protocolo proprietário',
          'A entrada codifica o caminho como lista de segmentos (rótulos) distribuídos pelo IGP, reduzindo estado no núcleo',
          'Usa apenas cabeçalhos IPv4 e dispensa rótulos'
        ], 'No SR a política vive na borda e os segmentos vêm do IGP, dispensando LDP e RSVP-TE.'),
        mcq('q7', 'Uma empresa quer ligar três filiais como se estivessem no mesmo segmento Ethernet, sem o roteamento da operadora. Qual serviço atende?', 'b', [
          'L3VPN com RD por filial',
          'VPLS (ou EVPN), L2VPN multiponto',
          'Pseudowire ponto a ponto entre cada par',
          'LDP'
        ], 'VPLS/EVPN emulam um switch Ethernet multiponto; pseudowire é ponto a ponto (cada par exigiria um circuito).'),
        fill('q8', 'Complete o protocolo que transporta as rotas VPNv4 entre os PEs.', 'router bgp 64500\n address-family vpnv4   ! sessões ___-BGP entre PEs', ['mp', 'mp-bgp', 'MP-BGP'], 'MP-BGP (BGP multiprotocolo) leva rotas VPNv4 e seus RTs/rótulos entre os PEs.')
      ]
    },
    {
      id: 'rda-04-multicast',
      title: 'Multicast: IGMP, PIM e distribuição em grupo',
      goal: 'Entender como uma origem alcança um grupo de receptores com uma só cópia por enlace, usando endereços de grupo, IGMP, PIM, RPF e IGMP snooping.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Unicast, broadcast, multicast e anycast',
            'Quatro modelos de entrega. Unicast: um para um. Broadcast: um para todos do domínio de camada 2 (não atravessa roteadores). Multicast: um para um GRUPO de interessados, em qualquer lugar da rede; a origem envia UMA cópia e a rede a replica só onde há receptores. Anycast: o mesmo endereço existe em vários nós e a rede entrega ao mais próximo (usado em DNS e CDN). Multicast economiza banda da origem e dos enlaces compartilhados: transmitir um vídeo a mil receptores por unicast exigiria mil fluxos; por multicast, um fluxo por enlace. Normalmente usa UDP, pois não há conexão por receptor.'
          ),
          sl(
            'Endereços multicast e o mapeamento para MAC',
            'O IPv4 reserva 224.0.0.0/4 (de 224.0.0.0 a 239.255.255.255) para grupos. Faixas notáveis: 224.0.0.0/24 é link-local (nunca roteada): 224.0.0.1 = todos os hosts, 224.0.0.2 = todos os roteadores, 224.0.0.5 e .6 = OSPF; 232.0.0.0/8 é usada por SSM; 239.0.0.0/8 é de escopo administrativo (uso interno, equivalente ao espaço privado). Em Ethernet, o IP do grupo vira um MAC multicast: prefixo 01:00:5e seguido dos 23 bits menos significativos do endereço IP. Como o IPv4 de grupo tem 28 bits variáveis e só 23 vão ao MAC, 32 endereços de grupo diferentes compartilham o mesmo MAC (ambiguidade 32 para 1).',
            '239.1.1.1  -> 01:00:5e:01:01:01\n224.0.0.5  -> 01:00:5e:00:00:05\n224.1.1.1 e 239.1.1.1 geram o MESMO MAC (o bit mais alto do 2o octeto é descartado)'
          ),
          sl(
            'IGMP: hosts avisam o roteador',
            'O IGMP (Internet Group Management Protocol, protocolo IP número 2) é o diálogo entre hosts e o roteador local. O host que quer receber um grupo envia um Membership Report; o roteador (o querier eleito na LAN) envia periodicamente General Queries a 224.0.0.1 para saber se ainda há interessados; no IGMPv2 o host avisa a saída com Leave Group. O IGMPv3 acrescenta filtragem por origem (include/exclude), base do SSM. Se não restam membros, o roteador deixa de encaminhar o grupo naquela interface. No IPv6, a função equivalente é do MLD (Multicast Listener Discovery, sobre ICMPv6): MLDv1 corresponde ao IGMPv2, MLDv2 ao IGMPv3. Endereços de grupo IPv6 começam com ff (ff00::/8), por exemplo ff02::1 (todos os nós do enlace).',
            'R1# show ip igmp groups\nGroup Address  Interface  Uptime    Last Reporter\n239.1.1.1      Gi0/1      00:12:03  192.0.2.50'
          ),
          sl(
            'RPF e árvores de distribuição',
            'Para evitar loops, o multicast usa o RPF (Reverse Path Forwarding): o roteador só aceita um pacote de uma origem se ele chegou pela interface que ele próprio usaria (na tabela unicast) para alcançar essa origem; caso contrário, descarta. Os pacotes formam uma árvore. Árvore de origem, ou SPT, notada (S,G): um caminho mais curto da origem S até os receptores do grupo G, uma árvore por origem. Árvore compartilhada, notada (*,G): todos os que enviam para G usam uma árvore enraizada em um ponto de encontro, o RP (Rendezvous Point), com menos estado, porém caminhos às vezes piores.'
          ),
          sl(
            'PIM: o roteamento multicast',
            'O PIM (Protocol Independent Multicast, protocolo IP 103, mensagens a 224.0.0.13) constrói as árvores usando a tabela de rotas unicast para o RPF, daí "independente de protocolo". PIM-SM (Sparse Mode, o mais usado): ninguém recebe nada até pedir; os receptores enviam Join em direção ao RP formando a árvore (*,G); as origens se registram no RP; depois o último roteador pode trocar para a árvore da origem (S,G) (switchover para SPT). PIM-SSM (Source-Specific Multicast): o receptor, via IGMPv3, escolhe a origem e o grupo (S,G) diretamente, sem RP e sem descoberta de origens, na faixa 232.0.0.0/8; é o mais simples e seguro. PIM-DM (Dense Mode) inunda e poda; raro.',
            'R1# show ip mroute 239.1.1.1\n(*, 239.1.1.1), 00:05:10/stopped, RP 192.0.2.100\n(198.51.100.10, 239.1.1.1), 00:04:55/00:02:30'
          ),
          sl(
            'Onde se usa multicast',
            'IPTV e distribuição de vídeo ao vivo em redes de operadora e corporativas; feeds de cotações no mercado financeiro (um fluxo de dados de mercado para muitos consumidores com baixíssima latência); distribuição de atualizações de software e imagens para muitos hosts; protocolos de descoberta locais (mDNS, em 224.0.0.251) e os protocolos de roteamento (OSPF, EIGRP, VRRP). Em segurança, controle quem pode receber e enviar: filtros de grupos no roteador, escopo 239.x e limites de TTL; multicast sem controle expõe dados a qualquer host da LAN.'
          ),
          sl(
            'Multicast no switch e no Wi-Fi',
            'Sem inteligência, um switch trata multicast como broadcast e o inunda em todas as portas da VLAN. O IGMP snooping faz o switch espiar os Membership Reports e encaminhar o grupo só para as portas com membros (e para a porta do roteador). Se não houver roteador na VLAN gerando queries, o switch precisa ser configurado como querier para o snooping funcionar. No Wi-Fi, o multicast é enviado sem ACK por quadro e, tipicamente, na taxa básica (baixa) para que todos os clientes consigam receber, consumindo muito tempo de ar; por isso muitos APs oferecem multicast-to-unicast (converter para unicast por cliente) e limitam grupos permitidos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual modelo de entrega envia o pacote ao nó MAIS PRÓXIMO entre vários que compartilham o mesmo endereço?', 'a', [
          'Anycast',
          'Multicast',
          'Broadcast',
          'Unicast reverso'
        ], 'No anycast o mesmo endereço existe em vários locais e o roteamento escolhe o mais próximo. Multicast entrega a todos os membros do grupo.'),
        mcq('q2', 'Qual destes endereços pertence à faixa multicast IPv4 de escopo administrativo (uso interno)?', 'c', [
          '192.0.2.239',
          '224.0.0.5',
          '239.1.1.1',
          '198.51.100.239'
        ], '239.0.0.0/8 é o escopo administrativo (interno). 224.0.0.5 é link-local (OSPF); 232.0.0.0/8 é a faixa do SSM e também é multicast.'),
        mcq('q3', 'Qual é o MAC multicast Ethernet correspondente ao grupo 239.1.1.1?', 'b', [
          '01:00:5e:ef:01:01',
          '01:00:5e:01:01:01',
          '33:33:00:01:01:01',
          '00:00:5e:01:01:01'
        ], 'Prefixo 01:00:5e mais os 23 bits baixos do IP: 239 (bit alto do 2º octeto descartado) -> 01:01:01. 33:33 é o prefixo do multicast IPv6.'),
        fill('q4', 'Complete a sigla do protocolo pelo qual os hosts informam ao roteador local que querem receber um grupo IPv4.', 'show ip ___ groups', ['igmp'], 'O IGMP gerencia a participação de hosts em grupos IPv4; no IPv6 é o MLD.'),
        mcq('q5', 'O que faz o teste RPF (Reverse Path Forwarding) num roteador multicast?', 'd', [
          'Descarta pacotes com TTL menor que 64',
          'Escolhe o RP pelo menor router ID',
          'Replica o pacote para todas as interfaces',
          'Aceita o pacote só se ele chegou pela interface que o roteador usaria para alcançar a origem'
        ], 'RPF evita loops: pacotes que chegam por interface diferente da rota unicast para a origem são descartados.'),
        mcq('q6', 'Em PIM-SM, o que é o RP?', 'b', [
          'O receptor principal do grupo',
          'O ponto de encontro onde se enraíza a árvore compartilhada (*,G)',
          'O roteador que gera as queries IGMP',
          'Um grupo reservado para o OSPF'
        ], 'O Rendezvous Point é a raiz da árvore compartilhada e o ponto onde origens se registram e receptores se juntam. O querier IGMP é outro papel.'),
        mcq('q7', 'Uma VLAN com IPTV congestiona todas as portas de acesso, embora só duas tenham clientes. Qual recurso corrige?', 'c', [
          'Aumentar o TTL dos pacotes de vídeo',
          'Trocar o grupo para a faixa 224.0.0.0/24',
          'IGMP snooping (com um querier na VLAN)',
          'Desligar o spanning tree'
        ], 'Sem snooping o switch inunda o multicast como broadcast. O snooping restringe às portas com membros. 224.0.0.0/24 é link-local e nem seria roteada.'),
        fill('q8', 'Complete a sigla do protocolo que cumpre no IPv6 o papel do IGMP.', 'Protocolo IPv6 para membros de grupo: ___', ['mld', 'mldv2', 'mldv1'], 'MLD (Multicast Listener Discovery) roda sobre ICMPv6 e é o equivalente do IGMP.')
      ]
    },
    {
      id: 'rda-05-sdn-nfv',
      title: 'SDN e NFV: redes definidas por software',
      goal: 'Compreender a separação entre planos de dados, controle e gerenciamento, o papel dos controladores e APIs, o modelo intent-based e a virtualização de funções de rede.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Os três planos de uma rede',
            'Todo equipamento de rede tem três planos. Plano de dados (data plane/forwarding): encaminha os pacotes na velocidade da linha, normalmente em hardware (ASIC), consultando tabelas já prontas. Plano de controle: decide o que vai nas tabelas (OSPF, BGP, ARP, spanning tree, aprendizado de MAC). Plano de gerenciamento: como o operador configura e observa o equipamento (SSH, SNMP, NETCONF, telemetria). Na rede tradicional, cada equipamento carrega os três: o plano de controle roda em cada um deles, de forma distribuída, e cada caixa é configurada individualmente.'
          ),
          sl(
            'A proposta do SDN',
            'SDN (Software-Defined Networking) separa o plano de controle do plano de dados. Um controlador, logicamente centralizado (na prática um cluster, para não ser ponto único de falha), tem a visão global da topologia e calcula o comportamento da rede; os equipamentos mantêm o encaminhamento e recebem instruções programaticamente. Ganhos: visão global, políticas consistentes aplicadas em toda a rede, automação por software e rapidez para criar redes e isolamentos (muito útil em nuvem e data centers).'
          ),
          sl(
            'OpenFlow em visão geral',
            'O OpenFlow é um protocolo clássico de SDN entre controlador e switch (o canal usa TCP, tipicamente porta 6653). O switch tem uma ou mais tabelas de fluxos. Cada entrada tem: campos de correspondência (match: porta de entrada, MAC, IP, porta L4, VLAN...), ações (encaminhar por uma porta, descartar, reescrever campos, enviar ao controlador) e contadores. Um pacote que não casa com nenhuma entrada (table-miss) pode ser enviado ao controlador num packet-in; o controlador decide e instala uma regra para os próximos pacotes do fluxo (flow-mod). Limite: tabelas de fluxo em hardware (TCAM) são pequenas e o packet-in em excesso sobrecarrega o controlador.',
            'Fluxo: match(ip_dst=198.51.100.10, tcp_dst=443) -> ação: saída porta 3\nFluxo: match(ip_dst=192.0.2.66)               -> ação: descartar\nTable-miss                                    -> enviar ao controlador'
          ),
          sl(
            'APIs southbound e northbound',
            'A API southbound liga o controlador aos equipamentos: OpenFlow, NETCONF (configuração via SSH, porta 830, com dados modelados em YANG), gNMI (telemetria e configuração), OVSDB (configura Open vSwitch) e P4Runtime. A API northbound liga as aplicações ao controlador: tipicamente REST ou gRPC; é por ela que um orquestrador pede "crie esta rede" sem saber detalhes dos equipamentos. Ainda existem as interfaces east-west entre controladores de um cluster. YANG é a linguagem que descreve o modelo de dados (a estrutura da configuração e do estado), usada por NETCONF e RESTCONF, o que permite automatizar sem fazer "screen scraping" da CLI.',
            'App/orquestrador\n   | northbound (REST/gRPC)\nControlador\n   | southbound (OpenFlow, NETCONF/YANG, gNMI)\nSwitches e roteadores'
          ),
          sl(
            'Intent-based networking',
            'Redes baseadas em intenção elevam a abstração. Em vez de dizer "coloque esta ACL neste switch" (imperativo), o operador declara o objetivo ("os servidores de pagamento só falam com o banco de dados; a aplicação X precisa de baixa latência"), e o sistema traduz a intenção em configuração, implanta e depois verifica continuamente, em laço fechado, se o resultado corresponde ao objetivo, corrigindo desvios. A base é o modelo declarativo, a automação e a telemetria; a intenção também fica versionada como código (infraestrutura como código), com revisão e histórico.'
          ),
          sl(
            'NFV: funções de rede virtualizadas',
            'NFV (Network Functions Virtualization) leva as funções de rede (firewall, roteador, balanceador, NAT, DPI, IDS) de appliances dedicados para software executado em servidores padrão, como VMs ou containers. Cada função em software é uma VNF (Virtual Network Function; quando em containers, CNF). Um orquestrador (MANO) cria, escala e encadeia essas funções (service chaining: o tráfego passa pela sequência firewall, depois NAT, depois balanceador). SDN e NFV são independentes, mas se complementam: o SDN direciona o tráfego, o NFV fornece as funções em software.'
          ),
          sl(
            'Vantagens e riscos',
            'Vantagens: agilidade, automação, menos hardware proprietário, escalabilidade elástica e visibilidade global. Riscos: o controlador vira ponto único de falha e alvo valioso (precisa de cluster, autenticação forte, RBAC, TLS no canal southbound e isolamento da rede de gerenciamento, pois quem o domina controla toda a rede); latência e carga com packet-in; limites de tabela em hardware; desempenho de funções em software (exige técnicas como DPDK e SR-IOV); complexidade de operação e de depuração; dependência de fornecedor; APIs expostas que precisam de autenticação e limitação de acesso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual plano decide o conteúdo das tabelas de encaminhamento (rotas, MACs aprendidos)?', 'b', [
          'Plano de dados',
          'Plano de controle',
          'Plano de gerenciamento',
          'Plano de aplicação'
        ], 'O plano de controle calcula as tabelas; o de dados as usa para encaminhar; o de gerenciamento serve para configurar e monitorar.'),
        mcq('q2', 'Num switch OpenFlow, chega um pacote sem nenhuma regra correspondente (table-miss). O que costuma acontecer?', 'd', [
          'É sempre descartado em silêncio',
          'É inundado em todas as portas',
          'O switch calcula uma rota OSPF',
          'É enviado ao controlador (packet-in), que pode instalar uma regra'
        ], 'O packet-in leva o pacote ao controlador, que decide e instala a regra (flow-mod). Em excesso, isso sobrecarrega o controlador.'),
        mcq('q3', 'Um orquestrador envia uma requisição REST ao controlador pedindo a criação de uma rede. Que interface foi usada?', 'c', [
          'Southbound',
          'East-west entre switches',
          'Northbound',
          'Out-of-band do console serial'
        ], 'Northbound liga aplicações ao controlador; southbound liga o controlador aos equipamentos.'),
        fill('q4', 'Complete o nome da linguagem de modelagem de dados usada por NETCONF e RESTCONF.', 'Modelo de dados do NETCONF: ___', ['yang'], 'YANG descreve a estrutura da configuração e do estado de equipamentos de forma padronizada.'),
        mcq('q5', 'O que diferencia o modelo intent-based do tradicional (imperativo)?', 'a', [
          'O operador declara o objetivo; o sistema implanta e verifica continuamente se foi atingido',
          'O operador digita comandos em cada equipamento, mas mais rápido',
          'Dispensa qualquer tipo de controlador',
          'Só funciona com OpenFlow'
        ], 'Intent-based é declarativo e de laço fechado: traduz, implanta e verifica a intenção. Pode usar vários protocolos southbound.'),
        mcq('q6', 'Qual afirmação sobre SDN e NFV é correta?', 'd', [
          'NFV exige OpenFlow',
          'SDN significa trocar switches por servidores',
          'São a mesma coisa com nomes diferentes',
          'São independentes: SDN separa controle e dados; NFV roda funções de rede como software'
        ], 'Os dois se complementam, mas resolvem problemas diferentes: SDN separa planos; NFV virtualiza funções (firewall, NAT, etc.).'),
        mcq('q7', 'Qual medida reduz o risco do controlador SDN ser ponto único de falha e alvo de ataque?', 'b', [
          'Expor a API northbound sem autenticação para facilitar a integração',
          'Rodar em cluster, com autenticação forte, RBAC, TLS e rede de gerenciamento isolada',
          'Instalar mais regras com prioridade alta',
          'Desativar a telemetria'
        ], 'Quem controla o controlador controla a rede: redundância mais acesso restrito e canais criptografados são essenciais.'),
        fill('q8', 'Complete a palavra: VNF significa Virtual Network ___.', 'VNF = Virtual Network ___', ['function', 'functions'], 'Uma VNF é uma função de rede (firewall, NAT, roteador) implementada em software em vez de appliance dedicado.')
      ]
    },
    {
      id: 'rda-06-datacenter-vxlan-evpn',
      title: 'Data center: spine-leaf, VXLAN e EVPN',
      goal: 'Entender a topologia spine-leaf com ECMP, a separação underlay/overlay, o encapsulamento VXLAN com seu overhead de MTU e o papel do EVPN como plano de controle.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Tráfego leste-oeste e o problema da árvore clássica',
            'Em data centers modernos a maior parte do tráfego é leste-oeste: entre servidores do próprio data center (microsserviços, armazenamento, migração de VMs, replicação). O tráfego norte-sul é o que entra e sai do data center. A topologia clássica em três camadas (acesso, agregação, núcleo) com spanning tree bloqueia links redundantes e tem pontos de afunilamento, com latência variável conforme os servidores estejam sob switches diferentes. A resposta é a topologia spine-leaf.'
          ),
          sl(
            'Spine-leaf e oversubscription',
            'Na topologia spine-leaf, cada leaf (switch de topo de rack, onde conectam servidores) liga-se a TODOS os spines; os spines não se ligam entre si nem a servidores; leafs não se ligam entre si. Entre servidores de leafs diferentes são sempre dois saltos de switch (leaf, spine, leaf), com latência previsível. Escala-se adicionando spines (mais banda entre leafs) ou leafs (mais portas). Roteia-se em camada 3 até o leaf, sem spanning tree. A razão de oversubscription de um leaf é a banda total para servidores dividida pela banda total de uplinks. Exemplo: 24 portas de 10 Gbps para servidores (240 Gbps) e 4 uplinks de 40 Gbps (160 Gbps): 240/160 = 1,5:1.',
            'spine1   spine2   spine3   spine4\n  |  \\   /  |  \\   /  |  \\   /  |\n  +---leaf1---+---leaf2---+---leaf3---+  (cada leaf liga em TODOS os spines)\n    servidores   servidores   servidores'
          ),
          sl(
            'ECMP e roteamento do underlay',
            'Como todo leaf alcança outro por todos os spines, há vários caminhos de mesmo custo: o ECMP (Equal-Cost Multi-Path) usa todos ao mesmo tempo. O roteador calcula um hash dos campos de um fluxo (a 5-tupla: IPs, protocolo e portas) e escolhe o caminho; assim todos os pacotes de uma mesma conexão seguem o mesmo caminho (sem reordenação) e fluxos diferentes se distribuem. Com 4 spines há 4 caminhos entre leafs. O underlay costuma usar BGP (eBGP em cada nível é uma prática comum) ou OSPF/IS-IS. Falha de um spine só reduz a banda; os demais seguem.',
            'leaf1# show ip route 198.51.100.0/24\n  via 192.0.2.1 (spine1)\n  via 192.0.2.3 (spine2)\n  via 192.0.2.5 (spine3)\n  via 192.0.2.7 (spine4)   <- 4 caminhos ECMP'
          ),
          sl(
            'Underlay e overlay',
            'Underlay é a rede IP roteada física (links, loopbacks e roteamento entre os leafs e os spines). Overlay são as redes virtuais dos clientes/aplicações construídas por cima, por encapsulamento. Por que overlay: estender a mesma rede de camada 2 entre racks sem spanning tree (mobilidade de VMs mantendo IP), isolar vários clientes (multi-tenancy) e superar o limite de 4094 VLANs úteis (o campo VLAN tem 12 bits). O underlay só precisa transportar pacotes IP entre os pontos de encapsulamento, sem conhecer os endereços dos tenants.'
          ),
          sl(
            'VXLAN: VNI, VTEP e o encapsulamento',
            'VXLAN encapsula um quadro Ethernet inteiro dentro de um pacote UDP (porta de destino 4789). O VTEP (VXLAN Tunnel Endpoint, tipicamente o leaf) encapsula na origem e desencapsula no destino. O VNI (VXLAN Network Identifier) tem 24 bits e identifica a rede virtual, o que dá 2^24 = 16.777.216 redes (contra 4096 valores de VLAN). A porta UDP de ORIGEM é calculada por hash do quadro interno: isso dá entropia ao underlay para o ECMP distribuir bem os fluxos que, de outra forma, teriam todos a mesma 5-tupla externa.',
            'Ethernet(ext) | IP(ext: VTEP A -> VTEP B) | UDP(dst 4789) | VXLAN(VNI) | Ethernet(int) | IP(int) | dados'
          ),
          sl(
            'MTU extra do overlay',
            'O encapsulamento acrescenta cabeçalhos: Ethernet externo (14) + IPv4 externo (20) + UDP (8) + VXLAN (8) = 50 bytes (com underlay IPv6, 70; com tag VLAN externa, mais 4). Para que um pacote IP interno de 1500 bytes passe sem fragmentar, o underlay precisa de MTU IP de 1500 + 50 = 1550 no mínimo (na prática se usa jumbo, como 9000 ou mais). Sintoma típico de MTU insuficiente: pings pequenos funcionam, transferências e pings grandes falham. VXLAN normalmente usa o bit DF, então não haverá fragmentação do pacote externo, e o pacote é perdido.',
            'MTU IP interna 1500 + 14 + 20 + 8 + 8 = 1550 (underlay)'
          ),
          sl(
            'EVPN e multi-tenancy',
            'Só o VXLAN diz COMO encapsular; falta um plano de controle para os VTEPs descobrirem onde estão os MACs. O flood-and-learn (inundar e aprender) é ineficiente. EVPN usa o MP-BGP como plano de controle, anunciando MACs e IPs: o Tipo 2 leva MAC/IP, o Tipo 3 anuncia membership para tráfego BUM (broadcast, unknown unicast, multicast) e o Tipo 5 leva prefixos IP (roteamento entre redes). Benefícios: menos inundação (ARP suppression), mobilidade de VM, multihoming. Para multi-tenancy: uma VRF por tenant, VNIs de camada 2 por segmento e um VNI de camada 3 por VRF, com roteamento simétrico. O anycast gateway usa o mesmo IP e MAC de gateway em todos os leafs, e a VM mantém o gateway local ao migrar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um leaf tem 24 portas de 10 Gbps para servidores e 4 uplinks de 40 Gbps. Qual é a razão de oversubscription?', 'd', [
          '1:1',
          '6:1',
          '0,66:1',
          '1,5:1'
        ], 'Banda para servidores 240 Gbps / uplinks 160 Gbps = 1,5:1.'),
        mcq('q2', 'Em um VXLAN, o que é o VTEP e o que é o VNI?', 'a', [
          'VTEP: ponto que encapsula/desencapsula; VNI: identificador de 24 bits da rede virtual',
          'VTEP: identificador da rede virtual; VNI: ponto de encapsulamento',
          'VTEP: tabela de MACs; VNI: porta UDP 4789',
          'VTEP: o spine; VNI: o endereço do leaf'
        ], 'O VTEP faz o túnel; o VNI de 24 bits separa as redes virtuais.'),
        mcq('q3', 'Num spine-leaf com 4 spines, quantos caminhos ECMP existem entre dois leafs?', 'c', [
          '1, pelo spanning tree',
          '2, sempre',
          '4, um por spine',
          '16'
        ], 'Cada leaf se liga a todos os spines; portanto, há um caminho de mesmo custo por spine (4).'),
        fill('q4', 'Complete a porta UDP de destino padrão do VXLAN.', 'udp dst port ___   # filtro de captura de tráfego VXLAN', ['4789'], 'A porta UDP 4789 foi atribuída ao VXLAN.'),
        mcq('q5', 'Por que o VTEP deriva a porta UDP de origem do hash do quadro interno?', 'b', [
          'Para esconder o tráfego do tenant com criptografia',
          'Para dar entropia ao underlay, de modo que o ECMP distribua os fluxos',
          'Porque o UDP exige uma porta de origem aleatória a cada pacote',
          'Para que o spine saiba o VNI'
        ], 'Sem variação, todo o tráfego entre dois VTEPs teria a mesma 5-tupla externa e iria por um único caminho.'),
        mcq('q6', 'Qual problema o EVPN resolve em relação ao VXLAN puro com flood-and-learn?', 'c', [
          'Aumenta o campo VNI além de 24 bits',
          'Elimina a necessidade de underlay IP',
          'Distribui MACs e IPs entre VTEPs via BGP, reduzindo a inundação',
          'Troca UDP por TCP'
        ], 'O EVPN é plano de controle (MP-BGP); o VXLAN é o plano de dados. O underlay continua necessário.'),
        mcq('q7', 'Como se isola dois tenants (clientes) em um data center com EVPN/VXLAN?', 'd', [
          'Usando a mesma VRF e filtrando por MAC',
          'Dando a cada tenant uma VLAN no underlay',
          'Desligando o ECMP',
          'Uma VRF por tenant, com seus VNIs de camada 2 e de camada 3'
        ], 'A VRF isola o roteamento de cada tenant; os VNIs separam os segmentos. As VLANs do underlay não escalam nem isolam.'),
        fill('q8', 'Underlay IPv4 com MTU de 1500 no overlay: qual é o MTU IP mínimo do underlay (inteiro), somando os 50 bytes de overhead do VXLAN?', 'ip mtu ___   # interface do underlay', ['1550'], '1500 + 14 (Ethernet) + 20 (IPv4) + 8 (UDP) + 8 (VXLAN) = 1550.')
      ]
    },
    {
      id: 'rda-07-virtualizacao-rede-linux',
      title: 'Virtualização de rede no Linux',
      goal: 'Montar redes virtuais com namespaces, veth, bridges, VLAN/VXLAN e NAT, e entender como containers e VMs usam essas peças.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Network namespaces',
            'Um network namespace é uma pilha de rede isolada dentro do kernel: tem as próprias interfaces, tabela de rotas, regras de firewall (nftables/iptables), tabela ARP e sockets. Um processo dentro dele só enxerga isso. Um namespace novo nasce apenas com a interface loopback (lo), desativada. Containers são, na essência, processos em um namespace de rede próprio. O comando ip netns gerencia namespaces nomeados; ip netns exec roda um comando dentro de um deles.',
            'ip netns add vermelho\nip netns list\nip netns exec vermelho ip link set lo up\nip netns exec vermelho ip addr   # só enxerga o loopback\nip netns del vermelho'
          ),
          sl(
            'Pares veth: o cabo virtual',
            'Um namespace isolado não fala com ninguém. O par veth é um cabo virtual de duas pontas: o que entra por uma ponta sai pela outra. Cria-se o par e move-se uma ponta para o namespace, formando um enlace entre ele e o host (ou outro namespace). Depois é só atribuir IPs e subir as duas interfaces. Os endereços abaixo são de documentação (192.0.2.0/24).',
            'ip netns add a && ip netns add b\nip link add veth-a type veth peer name veth-b\nip link set veth-a netns a\nip link set veth-b netns b\nip netns exec a ip addr add 192.0.2.1/24 dev veth-a\nip netns exec b ip addr add 192.0.2.2/24 dev veth-b\nip netns exec a ip link set veth-a up\nip netns exec b ip link set veth-b up\nip netns exec a ping -c1 192.0.2.2'
          ),
          sl(
            'Bridges Linux: um switch virtual',
            'Para ligar mais de dois participantes no mesmo segmento de camada 2 usa-se uma bridge Linux: ela aprende MACs e encaminha quadros entre as portas, como um switch. As portas são interfaces adicionadas com master; no caso dos namespaces, a ponta do veth que fica no host é a porta da bridge. O comando bridge mostra tabela de MACs (fdb), portas e VLANs (a bridge pode filtrar VLANs com vlan_filtering). A bridge docker0, por exemplo, é exatamente isso.',
            'ip link add br0 type bridge\nip link set br0 up\nip link set veth-host1 master br0\nbridge link\nbridge fdb show br br0\nip link set br0 type bridge vlan_filtering 1'
          ),
          sl(
            'VLAN e VXLAN no Linux',
            'O Linux cria subinterfaces 802.1Q com ip link add link <pai> name <nome> type vlan id <n>: o tráfego da subinterface sai marcado com aquela VLAN. Para VXLAN, cria-se uma interface type vxlan com o VNI (id), a porta de destino (dstport 4789) e o endereço do VTEP local; no modo mais simples ponto a ponto informa-se o remote; também é possível usar um grupo multicast ou um plano de controle (EVPN, com FRR). Lembre-se do overhead de 50 bytes: reduza o MTU da interface VXLAN em 50 em relação ao MTU do underlay.',
            'ip link add link eth0 name eth0.100 type vlan id 100\nip link add vxlan100 type vxlan id 100 dstport 4789 local 192.0.2.10 remote 192.0.2.20\nip link set vxlan100 master br0 && ip link set vxlan100 up'
          ),
          sl(
            'TUN/TAP e Open vSwitch',
            'TUN e TAP são interfaces virtuais cuja outra ponta é um programa em espaço de usuário (via /dev/net/tun). tun é de camada 3 (o programa lê e escreve pacotes IP; usado por VPNs como o OpenVPN); tap é de camada 2 (quadros Ethernet; usado por hipervisores: a VM tem uma interface virtual e o host liga a ponta tap numa bridge). O Open vSwitch (OVS) é um switch virtual mais completo que a bridge Linux: suporta OpenFlow, OVSDB, túneis VXLAN/GRE/Geneve, espelhamento de portas e controle por SDN; é muito usado em nuvens privadas.',
            'ovs-vsctl add-br br0\novs-vsctl add-port br0 vxlan0 -- set interface vxlan0 type=vxlan options:remote_ip=192.0.2.20\novs-ofctl dump-flows br0'
          ),
          sl(
            'NAT e encaminhamento no Linux',
            'Para que um namespace de rede privada saia para a internet, o host precisa (1) habilitar o encaminhamento (net.ipv4.ip_forward=1) e (2) fazer NAT de origem (masquerade) na saída. Com nftables: crie a tabela, a chain no hook postrouting e a regra masquerade. A forma legada equivalente é iptables -t nat -A POSTROUTING ... -j MASQUERADE. O DNAT (redirecionar uma porta do host para um destino interno) faz a publicação de portas.',
            'sysctl -w net.ipv4.ip_forward=1\nnft add table ip nat\nnft add chain ip nat postrouting \'{ type nat hook postrouting priority 100 ; }\'\nnft add rule ip nat postrouting ip saddr 192.0.2.0/24 oifname "eth0" masquerade\n# legado: iptables -t nat -A POSTROUTING -s 192.0.2.0/24 -o eth0 -j MASQUERADE'
          ),
          sl(
            'Como containers e VMs usam tudo isso',
            'Docker (rede bridge padrão): cria a bridge docker0; para cada container cria um namespace de rede, um par veth (uma ponta dentro do container como eth0, a outra na bridge) e regras de NAT (masquerade para sair, DNAT para -p). Libvirt/KVM: uma bridge (virbr0) com interfaces tap das VMs e dnsmasq dando DHCP. Kubernetes: cada pod tem um namespace e o plugin CNI liga com veth e bridge, roteamento ou túnel (VXLAN). Saber montar a mão (ip netns, veth, bridge, nft) é a melhor forma de depurar: ip netns exec ou nsenter permitem rodar tcpdump dentro da rede de um container.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que um network namespace isola?', 'c', [
          'Apenas o hostname',
          'Somente a lista de processos',
          'Interfaces, rotas, regras de firewall e sockets de rede',
          'Os arquivos montados no container'
        ], 'O namespace de rede dá uma pilha própria de interfaces, rotas, ARP, firewall e sockets. hostname é do namespace uts; arquivos, do mnt.'),
        mcq('q2', 'Como o Docker liga um container à bridge docker0?', 'a', [
          'Com um par veth: uma ponta no namespace do container e a outra na bridge',
          'Copiando a interface física do host para dentro do container',
          'Com uma interface tun de camada 3',
          'Com uma VLAN por container'
        ], 'O par veth é o cabo virtual entre o namespace do container e a bridge do host.'),
        mcq('q3', 'Qual é a diferença entre tun e tap?', 'b', [
          'tun é de camada 2 e tap é de camada 3',
          'tun transporta pacotes IP (camada 3) e tap transporta quadros Ethernet (camada 2)',
          'tun é para VLAN e tap é para VXLAN',
          'Não há diferença: são aliases'
        ], 'tun lida com pacotes IP (VPNs de roteamento); tap lida com quadros Ethernet (VMs ligadas a bridges).'),
        fill('q4', 'Complete o subcomando que executa um comando dentro de um namespace de rede nomeado.', 'ip netns ___ vermelho ip addr', ['exec'], 'ip netns exec NOME comando roda o comando dentro do namespace.'),
        mcq('q5', 'O comando "ip link add vxlan100 type vxlan id 100 dstport 4789 local 192.0.2.10 remote 192.0.2.20" cria o quê?', 'd', [
          'Uma subinterface 802.1Q com a VLAN 100',
          'Um par veth entre dois namespaces',
          'Uma bridge com o ID 100',
          'Um túnel VXLAN ponto a ponto com VNI 100 entre dois VTEPs'
        ], 'id é o VNI; dstport, a porta UDP; local e remote são os endereços dos VTEPs. A VLAN usaria type vlan.'),
        mcq('q6', 'Qual vantagem típica do Open vSwitch sobre a bridge Linux simples?', 'c', [
          'Dispensa o kernel',
          'Funciona sem interfaces virtuais',
          'Suporta OpenFlow e controle por SDN, com túneis e recursos avançados',
          'Só funciona com namespaces'
        ], 'O OVS é um switch programável (OpenFlow/OVSDB, túneis, espelhamento) usado em ambientes de nuvem.'),
        mcq('q7', 'O namespace 192.0.2.0/24 tem a regra masquerade configurada, mas não sai para a internet. O que verificar primeiro?', 'a', [
          'Se net.ipv4.ip_forward está habilitado no host',
          'Se o MTU é de 9000',
          'Se a bridge usa VLAN',
          'Se o hostname do namespace foi definido'
        ], 'Sem ip_forward o host não encaminha pacotes entre as interfaces, e o NAT não chega a agir.'),
        fill('q8', 'Complete o tipo de interface para criar um switch virtual (camada 2) do Linux.', 'ip link add br0 type ___', ['bridge'], 'Uma interface do tipo bridge age como um switch; as portas são adicionadas com master.')
      ]
    },
    {
      id: 'rda-32-firewall-linux-netfilter',
      title: 'Firewall no Linux: netfilter, nftables e conntrack',
      goal: 'Escrever e testar um firewall com nftables, entendendo os ganchos do netfilter, o rastreamento de estado, o NAT, a limitação de taxa e as práticas seguras de implantação.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Netfilter e seus ganchos',
            'O netfilter é o framework do kernel Linux que permite inspecionar e decidir sobre pacotes em pontos fixos do caminho, chamados ganchos (hooks). Existem cinco para IPv4/IPv6: PREROUTING (assim que o pacote entra, antes da decisão de roteamento), INPUT (o pacote é destinado ao próprio host), FORWARD (o pacote só passa pelo host, indo para outra rede), OUTPUT (gerado por processos locais) e POSTROUTING (último ponto antes de sair). Um pacote vindo de fora para um serviço local percorre prerouting e input; um pacote encaminhado percorre prerouting, forward e postrouting; um pacote local para fora percorre output e postrouting. Programas como nftables e iptables são só as interfaces de configuração do netfilter; quem filtra de fato é o kernel.',
            'Entrada ---> PREROUTING ---> [roteamento] ---> INPUT ---> processo local\n                               |\n                               +--> FORWARD ---> POSTROUTING ---> Saída\nprocesso local ---> OUTPUT ---> POSTROUTING ---> Saída'
          ),
          sl(
            'nftables: tabelas, cadeias e regras',
            'O nftables é o sucessor moderno do iptables. A hierarquia é: TABELA (pertence a uma família: ip, ip6 ou inet, que cobre IPv4 e IPv6 juntos) contém CADEIAS, e as cadeias contêm REGRAS. Uma cadeia "base" é ligada a um gancho (type filter hook input priority 0) e pode ter uma política padrão (policy drop ou accept) para os pacotes que nenhuma regra decidiu. Regras são lidas de cima para baixo, e a primeira que casa com um veredito terminal (accept, drop) decide; por isso a ORDEM importa. A boa prática é política padrão NEGAR: tudo é bloqueado, e você abre só o necessário. Conectores úteis: tcp dport 443, iif "lo", counter (conta pacotes e bytes da regra, visível em nft list ruleset).',
            'table inet filtro {\n  chain input {\n    type filter hook input priority 0; policy drop;\n    ct state established,related accept\n    iif "lo" accept\n    tcp dport { 22, 443 } accept\n  }\n}'
          ),
          sl(
            'Conntrack: o firewall que lembra das conexões',
            'O conntrack do kernel rastreia o estado de cada conexão (também para UDP e ICMP, de forma simplificada). Estados principais: NEW (primeiro pacote de uma conexão), ESTABLISHED (pacotes de uma conexão já vista nos dois sentidos), RELATED (conexão nova ligada a uma existente, como um erro ICMP ou o canal de dados de um FTP) e INVALID (pacote que não pertence a nenhuma conexão conhecida nem faz sentido). Com isso o firewall é stateful: a regra "ct state established,related accept" no INÍCIO da cadeia libera automaticamente as respostas de tudo que já foi permitido ou iniciado pelo próprio host, sem abrir portas altas para respostas. É também a regra mais frequente, então colocá-la primeiro economiza processamento. "ct state invalid drop" descarta pacotes sem sentido. Para olhar a tabela, use conntrack -L (pacote conntrack-tools).',
            'chain input {\n  type filter hook input priority 0; policy drop;\n  ct state invalid drop\n  ct state established,related accept\n  ct state new tcp dport 443 accept\n}'
          ),
          sl(
            'NAT com nftables e o legado iptables',
            'NAT no nftables usa uma cadeia do tipo nat. SNAT/masquerade (troca a ORIGEM) ocorre no gancho POSTROUTING: "masquerade" usa automaticamente o IP da interface de saída (ideal quando o IP público é dinâmico); "snat to 192.0.2.1" usa um endereço fixo. DNAT (troca o DESTINO, publicando um serviço interno) ocorre no PREROUTING: "dnat to 192.0.2.10:8080". Com DNAT, o pacote passa a ser encaminhado, portanto uma regra do gancho FORWARD precisa permitir esse tráfego (e net.ipv4.ip_forward=1). O iptables é o legado: usa as mesmas ideias com outra sintaxe (iptables -P INPUT DROP, iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT) e separa IPv4 (iptables) de IPv6 (ip6tables). Em sistemas novos, mesmo comandos iptables podem ser apenas uma camada sobre o nftables.',
            'table ip nat {\n  chain prerouting {\n    type nat hook prerouting priority dstnat; policy accept;\n    tcp dport 443 dnat to 192.0.2.10:443\n  }\n  chain postrouting {\n    type nat hook postrouting priority srcnat; policy accept;\n    oifname "eth0" masquerade\n  }\n}'
          ),
          sl(
            'Limite de taxa, varredura e logs',
            'Para reduzir abuso básico (tentativas em massa de SSH, varreduras de portas), limite a taxa de novas conexões: "tcp dport 22 ct state new limit rate 6/minute accept". Conexões novas acima do limite não casam e caem na política drop. Para auditar o que é negado, registre com log, SEMPRE com limite para o log não encher o disco nem a CPU durante uma varredura: "limit rate 5/minute log prefix \"nft-negado: \"" no fim da cadeia, antes da política. Esse limite é uma amostragem: o log não é completo. ATENÇÃO à LGPD: um log de firewall contém endereços IP de origem, e IP é dado pessoal quando permite identificar alguém. Defina a finalidade (segurança), guarde só o necessário, restrinja o acesso, fixe um prazo de retenção e descarte depois. No ambiente IPv6 lembre de permitir o ICMPv6, que é essencial (descoberta de vizinhos, parâmetros de rota); bloqueá-lo quebra o IPv6.',
            'chain input {\n  type filter hook input priority 0; policy drop;\n  ct state established,related accept\n  meta l4proto { icmp, ipv6-icmp } accept\n  tcp dport 22 ct state new limit rate 6/minute accept\n  limit rate 5/minute log prefix "nft-negado: "\n}'
          ),
          sl(
            'Implantação segura: persistência, teste e rollback',
            'Um firewall remoto mal aplicado pode TRANCAR VOCÊ FORA do próprio servidor. Rotina segura: (1) escreva as regras num arquivo (em muitas distribuições, /etc/nftables.conf; o caminho e o nome do serviço variam) e valide a sintaxe sem aplicar com "nft -c -f arquivo"; (2) carregue com "nft -f arquivo" (a carga é atômica: ou entra tudo ou nada); (3) ANTES, agende um desfazer automático, por exemplo "echo \'nft flush ruleset\' | at now + 5 minutes", e mantenha uma segunda sessão SSH aberta ou acesso por console; (4) teste uma NOVA conexão SSH antes de confirmar; (5) se deu certo, cancele o agendamento (atrm) e torne a regra persistente. Regras aplicadas na linha de comando se perdem na reinicialização: só o arquivo carregado pelo serviço (por exemplo, systemctl enable nftables) sobrevive. Verifique sempre com nft list ruleset.',
            'nft -c -f /etc/nftables.conf     # só valida\necho \'nft flush ruleset\' | at now + 5 minutes\nnft -f /etc/nftables.conf        # aplica\nnft list ruleset                 # confere'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um pacote vindo de uma rede e destinado a outra rede, apenas atravessando o Linux, passa por quais ganchos, em ordem?', 'b', [
          'input e output',
          'prerouting, forward e postrouting',
          'output e postrouting',
          'prerouting e input'
        ], 'Pacote encaminhado: prerouting, depois forward (decisão de passagem) e por último postrouting. input é só para pacotes destinados ao próprio host.'),
        mcq('q2', 'Por que a regra "ct state established,related accept" costuma ser a primeira da cadeia input?', 'd', [
          'Porque ela libera qualquer conexão nova, inclusive de atacantes',
          'Porque o nftables exige que as regras comecem pelo estado',
          'Porque ela bloqueia o tráfego que o host iniciou',
          'Porque libera automaticamente as respostas de conexões já permitidas ou iniciadas pelo host, e é a regra mais frequente'
        ], 'O conntrack permite um firewall stateful: as respostas entram sem abrir portas altas, e ficar no início economiza processamento.'),
        mcq('q3', 'Com a cadeia "type filter hook input priority 0; policy drop;" contendo só "ct state established,related accept", "iif lo accept" e "tcp dport { 22, 443 } accept", o que acontece com um pacote TCP novo para a porta 8080 e com um ping vindo de fora (tabela da família inet)?', 'a', [
          'Os dois são descartados pela política, tanto em IPv4 quanto em IPv6',
          'Os dois passam, porque a política só vale para UDP',
          'O TCP 8080 passa e o ping é descartado',
          'Só o IPv6 é descartado, pois a família inet é exclusiva de IPv4'
        ], 'Nenhuma regra libera 8080 nem ICMP, então vale a política drop. A família inet cobre IPv4 e IPv6; em IPv6 de verdade é preciso permitir o ICMPv6 explicitamente.'),
        fill('q4', 'Complete o estado do conntrack para liberar as respostas de conexões já existentes.', 'ct state ___,related accept', ['established'], 'ESTABLISHED = pacotes de conexão já vista nos dois sentidos; RELATED = conexões novas ligadas a uma existente.'),
        mcq('q5', 'Um servidor interno 192.0.2.10 deve ser acessado pela porta 443 do firewall. Qual configuração publica esse serviço?', 'c', [
          'masquerade no gancho postrouting',
          'snat no gancho prerouting',
          'dnat no gancho prerouting, com uma regra no forward permitindo esse tráfego',
          'policy accept no gancho output'
        ], 'DNAT troca o destino no prerouting (antes do roteamento); como o pacote passa a ser encaminhado, o forward precisa permiti-lo. O masquerade troca a origem na saída.'),
        mcq('q6', 'Por que a regra de log usa "limit rate 5/minute" e que cuidado de privacidade os registros exigem?', 'd', [
          'O limite acelera o firewall e os logs são anônimos por natureza',
          'O limite é obrigatório para o log funcionar, e IPs nunca são dados pessoais',
          'O limite desativa o log após cinco pacotes, e a LGPD não se aplica a firewalls',
          'O limite evita que uma varredura encha disco e CPU; os logs têm IPs de origem, que são dados pessoais, e exigem finalidade, acesso restrito e retenção definida'
        ], 'O limite amostra o log; o IP de origem é dado pessoal quando identifica alguém, o que pede minimização, controle de acesso e prazo de retenção.'),
        mcq('q7', 'Qual sequência é a mais segura para aplicar um novo firewall em um servidor acessado só por SSH?', 'b', [
          'Aplicar a regra direto com policy drop e torcer para dar certo',
          'Validar com nft -c -f, agendar um desfazer com at, aplicar, testar uma nova conexão e só então persistir',
          'Reiniciar o servidor e verificar depois se o SSH voltou',
          'Apagar todas as regras para ter certeza de que nada bloqueia'
        ], 'A validação, o rollback agendado e o teste numa nova sessão evitam o bloqueio total. Só o arquivo carregado pelo serviço persiste após o reboot.'),
        fill('q8', 'Complete o comando do iptables (legado) que define a política padrão da cadeia INPUT como negar.', 'iptables -P INPUT ___', ['DROP', 'drop'], 'No iptables a política é DROP ou ACCEPT; no nftables, policy drop. As regras devem abrir só o necessário.')
      ]
    },
    {
      id: 'rda-08-ipv6-avancado',
      title: 'IPv6 avançado: transição, NDP e planejamento',
      goal: 'Dominar os mecanismos de transição, delegação de prefixos, cabeçalhos de extensão, ataques ao NDP, privacidade de endereços e o planejamento de prefixos.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Transição: dual-stack e túneis',
            'A forma preferida de convivência é o dual-stack: cada host e rede executa IPv4 e IPv6 em paralelo. Aplicações modernas usam Happy Eyeballs: tentam IPv6 e IPv4 quase juntos e usam o que conectar primeiro, de modo que um IPv6 quebrado quase não atrapalhe o usuário. Quando um trecho da rede só tem IPv4, usam-se túneis: 6in4 encapsula o pacote IPv6 diretamente em IPv4 (protocolo IP número 41), em túneis configurados manualmente, ponto a ponto; 6rd é uma variante para provedores, na qual o prefixo IPv6 do cliente é derivado do endereço IPv4 dele, sem necessidade de estado nos roteadores do provedor. Túneis aumentam o overhead (MTU menor) e dificultam a segurança; o objetivo final é IPv6 nativo.'
          ),
          sl(
            'NAT64 e DNS64',
            'Em redes só IPv6, como acessar um servidor que só tem IPv4? O NAT64 traduz entre IPv6 e IPv4 num gateway; o DNS64 é um DNS que, quando o nome tem apenas registro A, sintetiza um registro AAAA embutindo o IPv4 no prefixo conhecido 64:ff9b::/96 (os 32 bits finais). O cliente envia ao endereço sintetizado e o NAT64 extrai o IPv4. Limitações: aplicações com IPv4 literal (sem DNS) não funcionam sem recursos adicionais (como 464XLAT) e a validação DNSSEC pelo cliente conflita com a síntese do DNS64.',
            'Servidor IPv4: 198.51.100.10 (hex: c6.33.64.0a)\nAAAA sintetizado: 64:ff9b::c633:640a'
          ),
          sl(
            'DHCPv6 Prefix Delegation',
            'Como o provedor entrega vários /64 a um cliente com roteador? Com DHCPv6-PD (prefix delegation): o roteador do cliente (requesting router) pede um prefixo e o do provedor (delegating router) delega um bloco, por exemplo um /56 ou /48. O roteador do cliente o divide em sub-redes /64, uma por LAN (o SLAAC exige /64). A conta é 2^(64 - tamanho do prefixo): um /56 dá 256 redes /64; um /48 dá 65.536. O DHCPv6 usa UDP, com servidores na porta 547 e clientes na 546. O cliente ganha endereçamento IPv6 público sem NAT, e os /64 devem ser roteados (o provedor roteia o prefixo delegado ao roteador do cliente).',
            'Delegado:  2001:db8:100::/56\nLAN 1:     2001:db8:100:0::/64\nLAN 2:     2001:db8:100:1::/64\n... até 2001:db8:100:ff::/64  (256 redes)'
          ),
          sl(
            'Cabeçalhos de extensão e MTU',
            'O cabeçalho IPv6 base é fixo (40 bytes), e opções ficam em cabeçalhos de extensão encadeados pelo campo Next Header: Hop-by-Hop Options, Routing, Fragment, Destination Options, AH e ESP. Mudanças importantes: roteadores NÃO fragmentam pacotes IPv6: só a origem pode, usando o cabeçalho Fragment, depois de descobrir o MTU do caminho pelo ICMPv6 Packet Too Big (tipo 2); por isso bloquear ICMPv6 indiscriminadamente quebra conexões. O MTU mínimo de enlace IPv6 é 1280 bytes. Do ponto de vista de segurança: o Routing Header tipo 0 foi descontinuado por permitir amplificação e evasão; firewalls devem inspecionar a cadeia de cabeçalhos, descartar tipos obsoletos e limitar pacotes com muitos cabeçalhos de extensão ou fragmentos fora do padrão, que são usados para evadir filtros e sobrecarregar equipamentos.'
          ),
          sl(
            'NDP e seus ataques: RA spoofing e RA Guard',
            'O NDP (Neighbor Discovery Protocol) usa ICMPv6: Router Solicitation (133), Router Advertisement (134), Neighbor Solicitation (135), Neighbor Advertisement (136) e Redirect (137). Substitui o ARP e anuncia prefixo e gateway por RA. Não há autenticação por padrão: qualquer host da LAN pode enviar um RA falso (RA spoofing/rogue RA), fazendo-se de gateway ou injetando um prefixo, o que permite interceptar tráfego (MITM) ou causar negação de serviço; do mesmo modo, NA falsos envenenam a tabela de vizinhos. Defesas: RA Guard no switch (descarta RAs vindos de portas que não são de roteadores), DHCPv6 Guard, ND inspection/SAVI, segmentação e monitoramento de RAs inesperados (o NDP exige Hop Limit 255, portanto não vem de fora do enlace). SEND (NDP seguro, com criptografia) existe, mas é pouco usado.',
            'switch(config)# ipv6 nd raguard policy SO-ROTEADOR\nswitch(config-nd-raguard)# device-role router     ! portas de roteador\nswitch(config)# ipv6 nd raguard attach-policy HOST  ! portas de acesso: RAs descartados'
          ),
          sl(
            'Privacidade dos endereços',
            'No SLAAC clássico o identificador de interface (os 64 bits finais) era derivado do MAC (EUI-64): o mesmo dispositivo teria o mesmo identificador em qualquer rede, o que permite rastrear a pessoa/dispositivo. Mitigações: endereços temporários (RFC 4941): gerados aleatoriamente e renovados periodicamente, preferidos para conexões de SAÍDA; e identificadores estáveis opacos (RFC 7217), estáveis dentro de um prefixo, mas diferentes em cada rede, sem expor o MAC. Do ponto de vista da LGPD, um endereço IP pode identificar uma pessoa: limite a retenção de logs com endereços e proteja-os. Em servidores, endereços estáveis são bem-vindos; em dispositivos de usuários, prefira os temporários.'
          ),
          sl(
            'Roteamento IPv6 e planejamento de prefixos',
            'OSPFv3 é a versão do OSPF para IPv6: o router ID continua com 32 bits, a adjacência usa endereços link-local, e é por enlace (e não por sub-rede). IS-IS e EIGRP têm suporte IPv6. No BGP, o mesmo protocolo carrega IPv6 por multiprotocolo (address-family ipv6), e a sessão pode correr sobre IPv4 ou IPv6. Planejamento: use sempre /64 em LANs (nunca sub-redes menores), um /48 por site (65.536 redes /64), e alinhe a hierarquia a múltiplos de 4 bits (um dígito hexadecimal), o que facilita ler e SUMARIZAR. Não economize endereços: reserve espaço para crescimento. Exemplo: 2001:db8:1::/48 para o site 1; VLAN 10 recebe 2001:db8:1:a::/64 e todo o site se anuncia como 2001:db8:1::/48.',
            'Site 1: 2001:db8:1::/48\n  VLAN 10 (0xa): 2001:db8:1:a::/64\n  VLAN 20 (0x14): 2001:db8:1:14::/64\nSite 2: 2001:db8:2::/48'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma rede só IPv6 precisa acessar um servidor que só tem IPv4. Que combinação resolve?', 'd', [
          'Túnel 6in4 até o servidor',
          'Apenas Happy Eyeballs',
          'RA Guard e SLAAC',
          'DNS64 sintetiza o AAAA e o NAT64 traduz entre IPv6 e IPv4'
        ], 'DNS64 cria o AAAA com o IPv4 embutido em 64:ff9b::/96, e o NAT64 faz a tradução do pacote.'),
        mcq('q2', 'Com o prefixo 2001:db8:1::/48 de um site, quantas redes /64 ele pode ter?', 'c', [
          '256',
          '4096',
          '65.536',
          '16'
        ], '2^(64-48) = 2^16 = 65.536 sub-redes /64.'),
        mcq('q3', 'O provedor delega um /56 ao cliente por DHCPv6-PD. Quantas LANs /64 o roteador do cliente consegue criar?', 'b', [
          '65.536',
          '256',
          '56',
          '16'
        ], '2^(64-56) = 2^8 = 256 redes /64.'),
        fill('q4', 'O 6in4 encapsula IPv6 em IPv4 usando o protocolo IP número ___.', 'protocolo IP número ___ (6in4)', ['41'], 'O protocolo IP 41 identifica IPv6 encapsulado em IPv4.'),
        mcq('q5', 'Por que bloquear todo o ICMPv6 em um firewall é um erro?', 'a', [
          'Ele carrega NDP e o Packet Too Big, necessários ao funcionamento e ao PMTUD',
          'Porque o ICMPv6 é usado só para ping',
          'Porque o IPv6 não tem firewalls',
          'Porque roteadores fragmentam os pacotes IPv6 nesse caso'
        ], 'NDP e Packet Too Big dependem de ICMPv6; sem o PMTUD (feito só pela origem) as conexões travam.'),
        mcq('q6', 'Um host malicioso envia Router Advertisements falsos na LAN. Qual defesa de camada 2 é a mais direta?', 'c', [
          'Aumentar o hello interval do OSPFv3',
          'Usar endereços temporários',
          'RA Guard no switch, permitindo RAs só nas portas de roteador',
          'Trocar o prefixo para /48'
        ], 'RA Guard descarta RAs vindos de portas de acesso. Endereços temporários tratam privacidade, não spoofing.'),
        mcq('q7', 'Qual problema de privacidade os endereços temporários (RFC 4941) resolvem?', 'd', [
          'Falta de endereços na LAN',
          'Lentidão do DNS',
          'Fragmentação de pacotes',
          'Rastreamento do dispositivo por um identificador estável derivado do MAC'
        ], 'O EUI-64 expõe o MAC e permanece igual em qualquer rede; endereços aleatórios e rotativos evitam o rastreio.'),
        fill('q8', 'Complete o número do tipo ICMPv6 do Router Advertisement.', 'ICMPv6 tipo ___ = Router Advertisement', ['134'], 'RS = 133, RA = 134, NS = 135, NA = 136, Redirect = 137.')
      ]
    },
    {
      id: 'rda-09-criptografia-aplicada-redes',
      title: 'Criptografia aplicada a redes',
      goal: 'Entender os blocos da criptografia usados em redes (simétrica, assimétrica, hash, HMAC, assinaturas, troca de chaves), forward secrecy e como IPsec, TLS 1.3 e WireGuard os combinam.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Simétrica, assimétrica e o modelo híbrido',
            'Criptografia simétrica (AES, ChaCha20) usa a MESMA chave para cifrar e decifrar: é muito rápida e própria para volumes grandes de dados, mas exige que as duas partes já compartilhem a chave. Criptografia assimétrica (RSA, curvas elípticas) usa um par de chaves, uma pública (que pode ser divulgada) e uma privada (secreta): resolve a distribuição de chaves e permite assinaturas, mas é bem mais lenta. Na prática combinam-se: o protocolo usa criptografia assimétrica (ou troca de chaves) para estabelecer uma chave de sessão e então cifra o tráfego com algoritmo simétrico. Os modos modernos são AEAD (AES-GCM, ChaCha20-Poly1305): cifram e autenticam o dado no mesmo passo; o nonce não pode se repetir com a mesma chave.'
          ),
          sl(
            'Hash e HMAC',
            'Uma função de hash (SHA-256, SHA-3) transforma qualquer entrada em uma saída de tamanho fixo (SHA-256: 256 bits, 32 bytes): é unidirecional (não se recupera a entrada) e resistente a colisões. Serve para verificar integridade, mas NÃO autentica: quem altera o dado pode recalcular o hash. O HMAC combina o hash com uma chave secreta compartilhada: só quem tem a chave produz o código correto, dando integridade E autenticidade. Evite MD5 e SHA-1 em novos usos.',
            'echo -n \'mensagem\' | openssl dgst -sha256\necho -n \'mensagem\' | openssl dgst -sha256 -hmac \'chave-de-exemplo\''
          ),
          sl(
            'Assinaturas digitais',
            'A assinatura digital prova autoria e integridade: o remetente calcula o hash da mensagem e o assina com sua chave PRIVADA; qualquer um com a chave PÚBLICA confere. Isso garante autenticidade, integridade e não repúdio (o dono da chave não pode negar que assinou). Atenção para não confundir os papéis: para CIFRAR para alguém usa-se a chave pública do destinatário (só ele decifra com a privada); para ASSINAR usa-se a chave privada do remetente. Algoritmos: RSA, ECDSA, Ed25519. Em redes, assinaturas autenticam servidores (certificados), registros DNS (DNSSEC) e rotas (RPKI).'
          ),
          sl(
            'Diffie-Hellman, ECDH e forward secrecy',
            'No Diffie-Hellman, cada lado gera um par de chaves temporário, troca a parte pública e calcula, de forma independente, o MESMO segredo compartilhado, que nunca viaja pela rede; um espectador passivo, vendo só as partes públicas, não consegue calculá-lo. ECDH é a versão em curvas elípticas (chaves menores para a mesma segurança). Sozinha, a troca é vulnerável a um atacante ativo no meio (MITM), então precisa ser autenticada por assinaturas/certificados. Forward secrecy (sigilo adiante): se cada sessão usa chaves efêmeras (DHE/ECDHE), o vazamento posterior da chave privada de longo prazo não permite decifrar o tráfego antigo gravado. Sem ela, um atacante que grave o tráfego hoje pode decifrá-lo se a chave vazar no futuro. Nota: computadores quânticos ameaçam RSA/ECDH, então a criptografia pós-quântica (já em adoção em modo híbrido) vem sendo introduzida; aqui apenas mencionamos.'
          ),
          sl(
            'IPsec: IKEv2, ESP e os modos',
            'IPsec protege pacotes IP na camada 3. O IKEv2 (UDP porta 500; 4500 com NAT traversal) autentica os pares e negocia chaves e parâmetros, criando SAs (Security Associations): primeiro a IKE_SA, depois a CHILD_SA que protege os dados. O ESP (protocolo IP 50) cifra e autentica o conteúdo e inclui número de sequência para impedir replay; o AH (protocolo 51) só autentica e não passa por NAT, por isso é pouco usado. Dois modos: transporte (protege só o payload, mantém o cabeçalho IP original; comunicação host a host) e túnel (encapsula o pacote IP inteiro em um novo, com novo cabeçalho; usado em VPNs site a site e de acesso remoto). Em NAT-T, o ESP vai dentro de UDP 4500.',
            'Modo transporte: [IP original][ESP[payload]]\nModo túnel:      [IP novo][ESP[IP original][payload]]'
          ),
          sl(
            'TLS 1.3 em visão geral',
            'O TLS 1.3 reduziu o handshake a 1 RTT: o cliente já envia sua parte da troca de chaves (key share) na primeira mensagem. Pontos de projeto: só troca de chaves com ECDHE (ou DHE): sempre há forward secrecy; só cifras AEAD; sem RSA key exchange, sem CBC e sem renegociação; o certificado do servidor vai criptografado e o servidor prova a posse da chave privada com uma assinatura sobre a transcrição do handshake. Existe a retomada com 0-RTT, que reduz a latência, mas os dados 0-RTT podem sofrer replay (veja a lição de QUIC).'
          ),
          sl(
            'WireGuard em visão geral',
            'O WireGuard é uma VPN de camada 3 pequena e moderna, que roda no kernel e usa UDP. Em vez de negociar algoritmos, tem um conjunto fixo e moderno: Curve25519 (ECDH), ChaCha20-Poly1305 (AEAD) e BLAKE2s (hash), via o framework Noise: menos superfície de ataque e configuração. Cada peer tem um par de chaves e conhece a chave PÚBLICA do outro; o AllowedIPs funciona como tabela de roteamento criptográfico (só aceita pacotes com origem nesses IPs e roteia para o peer certo). As chaves de sessão são renovadas periodicamente (forward secrecy). Tamanhos de chave: de modo conceitual, maior chave significa mais custo de força bruta, e as curvas elípticas dão segurança comparável com chaves bem menores que as do RSA.',
            '[Interface]\nPrivateKey = <chave privada local - nunca compartilhar>\nAddress = 192.0.2.1/24\nListenPort = 51820\n\n[Peer]\nPublicKey = <chave pública do outro lado>\nAllowedIPs = 192.0.2.2/32\nEndpoint = 203.0.113.5:51820'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que os protocolos como o TLS e o IPsec combinam criptografia assimétrica e simétrica?', 'b', [
          'Porque a simétrica não existe em redes',
          'A assimétrica/troca de chaves estabelece a chave de sessão e a simétrica cifra os dados com rapidez',
          'Porque a assimétrica é mais rápida para grandes volumes',
          'Porque assim as chaves nunca precisam ser trocadas'
        ], 'A simétrica é rápida, mas precisa de chave compartilhada; a assimétrica/ECDH resolve a obtenção dessa chave.'),
        mcq('q2', 'Qual a diferença entre um hash simples e um HMAC?', 'c', [
          'O HMAC é reversível',
          'O hash simples usa chave secreta',
          'O HMAC usa chave secreta compartilhada, dando também autenticidade',
          'Não há diferença prática'
        ], 'Qualquer um recalcula um hash simples; só quem tem a chave gera o HMAC correto.'),
        mcq('q3', 'Qual chave é usada para ASSINAR uma mensagem e qual para verificar a assinatura?', 'a', [
          'Privada do remetente assina; pública do remetente verifica',
          'Pública do destinatário assina; privada do destinatário verifica',
          'Privada do destinatário assina; pública do remetente verifica',
          'Chave simétrica compartilhada nos dois'
        ], 'Assina-se com a privada e verifica-se com a pública do mesmo par. Cifrar para alguém é que usa a pública do destinatário.'),
        fill('q4', 'Complete o número do protocolo IP do ESP no IPsec.', 'protocolo IP número ___ (ESP)', ['50'], 'ESP = protocolo 50; AH = 51.'),
        mcq('q5', 'O que garante o forward secrecy?', 'd', [
          'Usar uma chave RSA muito grande',
          'Trocar a senha do servidor a cada ano',
          'Assinar todos os pacotes',
          'Chaves efêmeras por sessão (ECDHE): vazar a chave de longo prazo não decifra tráfego antigo'
        ], 'Cada sessão deriva segredo independente com chaves temporárias descartadas. A chave de longo prazo só autentica.'),
        mcq('q6', 'Uma VPN site a site IPsec encapsula o pacote original inteiro em um novo cabeçalho IP. Qual modo é esse?', 'a', [
          'Túnel',
          'Transporte',
          'AH sem ESP',
          'IKE_SA_INIT'
        ], 'No modo túnel o pacote original é encapsulado e protegido; no de transporte o IP original permanece.'),
        mcq('q7', 'Qual característica distingue o TLS 1.3 de versões anteriores?', 'b', [
          'Permite troca de chaves RSA estática',
          'Troca de chaves efêmera obrigatória e cifras AEAD, com handshake de 1 RTT',
          'Usa UDP obrigatoriamente',
          'Envia o certificado em claro'
        ], 'O 1.3 removeu RSA estático e CBC; o certificado vai cifrado e o handshake é de 1 RTT.'),
        fill('q8', 'Complete a porta UDP usada pelo IKEv2 (sem NAT traversal).', 'udp port ___   # IKEv2', ['500'], 'O IKE usa UDP 500; com NAT-T passa à 4500.')
      ]
    },
    {
      id: 'rda-34-vpn-avancada-ztna',
      title: 'VPNs avançadas, ZTNA e SASE',
      goal: 'Dominar o IPsec site a site, a VPN baseada em rota, o WireGuard e as topologias de VPN, e entender por que o modelo de perímetro com VPN tem limites e como ZTNA e SASE respondem a eles.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'IPsec site a site em detalhe',
            'Duas filiais ligadas por IPsec negociam em etapas. No IKEv1 havia a fase 1 (cria o canal de controle protegido, a ISAKMP SA) e a fase 2 (cria as SAs que protegem os dados). No IKEv2 isso virou a IKE_SA (autentica os pares e faz a troca de chaves) e a CHILD_SA (protege o tráfego com ESP, criada junto da autenticação e depois renovada). O ESP protege o pacote; no modo túnel, o pacote original inteiro vai encapsulado. Quais pacotes entram no túnel é definido pelos SELETORES (traffic selectors, ou "tráfego interessante"): pares origem/destino, p. ex. 192.0.2.0/24 com 198.51.100.0/24. Os dois lados precisam ter seletores espelhados: se não, o túnel sobe, mas o tráfego não passa (falha clássica). PFS (Perfect Forward Secrecy): a renovação da CHILD_SA faz uma nova troca Diffie-Hellman, e a chave nova não deriva da antiga. Atrás de NAT, o ESP vai dentro de UDP 4500 (NAT-T). O DPD (Dead Peer Detection) envia sondas para detectar que o outro lado caiu e derrubar a SA, permitindo renegociar ou trocar de rota. Como o túnel acrescenta cabeçalhos, o MTU útil diminui: faz-se MSS clamping, reduzindo o MSS do TCP no SYN para os segmentos caberem sem fragmentar.',
            'IKE_SA (autentica, DH) -> CHILD_SA (ESP: dados)\nSeletores lado A: 192.0.2.0/24 <-> 198.51.100.0/24\nSeletores lado B: 198.51.100.0/24 <-> 192.0.2.0/24   (espelhados)\nNAT-T: ESP dentro de UDP 4500'
          ),
          sl(
            'VPN baseada em política e baseada em rota',
            'Na VPN baseada em POLÍTICA, os seletores (uma lista de redes) decidem o que entra no túnel: somente o tráfego que casa é cifrado. Funciona para casos simples, mas cada nova rede exige alterar os seletores nos dois lados e não combina com roteamento dinâmico. Na VPN baseada em ROTA, o túnel é uma interface virtual (VTI), os seletores são amplos (0.0.0.0/0) e quem decide o que entra é a TABELA DE ROTAS, como com qualquer outra interface. Vantagens: dá para rodar OSPF ou BGP dentro do túnel, redes novas são só rotas, e o failover entre túneis vira roteamento. Por isso a baseada em rota é a preferida em desenhos modernos e em nuvem.',
            'Política: seletores 192.0.2.0/24 <-> 198.51.100.0/24  (só isso entra)\nRota: interface vti0 (seletores 0.0.0.0/0)\n      ip route 198.51.100.0/24 dev vti0   # a rota decide'
          ),
          sl(
            'WireGuard: pares, chaves e AllowedIPs',
            'O WireGuard é uma VPN de camada 3 simples, que usa UDP e um conjunto fixo de algoritmos modernos. Cada ponta (peer) tem um par de chaves; você configura a sua chave PRIVADA (nunca compartilhe, e nunca a publique em repositórios) e a chave PÚBLICA de cada par. O AllowedIPs funciona como roteamento criptográfico: para SAÍDA, os pacotes destinados a esses IPs são cifrados e enviados àquele par; para ENTRADA, só são aceitos pacotes decifrados de um par cuja origem esteja nessa lista (os outros são descartados). Roaming: se um par autenticado chega de um novo endereço, o WireGuard passa a usá-lo como endpoint, e por isso o celular troca de Wi-Fi para 4G sem renegociar. PersistentKeepalive mantém aberto o mapeamento do NAT. Chaves e segredos abaixo estão como marcadores: gere as reais com wg genkey e guarde-as com permissão restrita.',
            '[Interface]\nPrivateKey = <chave-privada>\nAddress = 10.99.0.1/24\nListenPort = 51820\n\n[Peer]\nPublicKey = <chave-publica-filial-A>\nAllowedIPs = 10.99.0.2/32, 198.51.100.0/24'
          ),
          sl(
            'Topologias e alta disponibilidade',
            'Hub-and-spoke: todas as filiais (spokes) têm túnel só com a matriz (hub); é simples de operar e controlar, mas o tráfego entre filiais passa pelo hub (latência e carga) e o hub é ponto único de falha. Malha completa (full mesh): túnel entre cada par; caminho direto, mas o número de túneis cresce em n(n-1)/2 e a configuração fica pesada. DMVPN/overlay dinâmico (visão geral): spokes ligados ao hub aprendem com ele o endereço do outro spoke e abrem um túnel direto sob demanda, juntando a simplicidade do hub com caminho direto. Alta disponibilidade: dois hubs ou dois equipamentos em cada ponta, túneis redundantes e roteamento dinâmico para o failover; o DPD detecta a queda do par.'
          ),
          sl(
            'Split tunneling e o limite do perímetro',
            'No VPN de acesso remoto, split tunneling manda para a VPN só o tráfego da empresa, e o resto da internet sai direto pelo dispositivo; economiza banda e latência, mas o dispositivo fica numa rede hostil e na rede corporativa ao mesmo tempo, e pode virar ponte para um invasor, além de a empresa perder a inspeção do tráfego de internet. O túnel total (full tunnel) manda tudo pela empresa, com mais controle e mais carga. O modelo "perímetro + VPN" assume que quem está dentro da rede é confiável: uma vez conectado, o usuário (ou o invasor com credencial roubada, ou um laptop infectado) costuma enxergar muita coisa. Isso permite o MOVIMENTO LATERAL: pular de um sistema para outro dentro da rede. Segmentação, menor privilégio e monitoramento reduzem o risco, mas o modelo em si é frágil.'
          ),
          sl(
            'ZTNA, SASE, MFA e privacidade',
            'Zero Trust significa "nunca confie, sempre verifique": nenhuma rede, nem a interna, é confiável por si. O ZTNA (Zero Trust Network Access) dá acesso por APLICAÇÃO, não por rede: o usuário só chega ao sistema específico que a política permite, depois de verificar identidade e estado do dispositivo (atualizado, com disco cifrado, com certificado da empresa), de forma contínua e não só no login. Quem não está autorizado nem enxerga as demais aplicações, o que reduz o movimento lateral. O SASE (visão geral) combina SD-WAN e serviços de segurança entregues em nuvem (ZTNA, SWG, CASB, FWaaS). Reforços: MFA (segundo fator, de preferência resistente a phishing) e certificado de dispositivo (só máquinas gerenciadas se conectam). Privacidade: os logs de acesso (quem acessou o quê, de onde, quando) são dados pessoais; registre só o necessário para segurança, restrinja o acesso, defina retenção e informe os usuários, conforme a LGPD.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O túnel IPsec site a site está "up", mas o tráfego entre as filiais não passa. Qual causa clássica?', 'a', [
          'Os seletores (tráfego interessante) dos dois lados não são espelhados ou não incluem as redes certas',
          'O ESP está sendo usado em vez do AH',
          'O túnel usa o modo túnel em vez do modo transporte',
          'A porta UDP 4500 está aberta'
        ], 'Se os seletores não casam, o outro lado descarta o tráfego, mesmo com a IKE_SA estabelecida. O ESP em modo túnel é o normal.'),
        mcq('q2', 'Qual é a principal vantagem da VPN baseada em rota (VTI) sobre a baseada em política?', 'c', [
          'Não usa criptografia',
          'Dispensa os endereços IP',
          'Permite roteamento dinâmico dentro do túnel, e as redes são acrescentadas como rotas, sem editar seletores',
          'Só funciona com IPv6'
        ], 'Na baseada em rota, o túnel é uma interface; OSPF/BGP e failover viram roteamento comum.'),
        mcq('q3', 'No hub WireGuard com "[Peer] PublicKey = <chave-publica-filial-A> / AllowedIPs = 10.99.0.2/32, 198.51.100.0/24", o que acontece com um pacote destinado a 198.51.100.20?', 'b', [
          'É descartado, pois só 10.99.0.2 está permitido',
          'É cifrado e enviado ao par da filial A; e pacotes recebidos desse par só são aceitos com origem nesses IPs',
          'É enviado sem cifrar, pois a rede é de documentação',
          'É enviado a todos os pares configurados'
        ], 'AllowedIPs é a tabela de roteamento criptográfico: define o par de saída e filtra a origem aceita na entrada.'),
        fill('q4', 'Complete a porta UDP usada pelo IPsec com NAT traversal (NAT-T).', 'ESP dentro de UDP porta ___   # NAT-T', ['4500'], 'IKE usa UDP 500; com NAT-T, o IKE e o ESP encapsulado passam à UDP 4500.'),
        mcq('q5', 'O que o PFS (Perfect Forward Secrecy) acrescenta ao IPsec?', 'd', [
          'Impede que o túnel seja derrubado',
          'Permite usar o AH com NAT',
          'Reduz o MTU do túnel',
          'Uma nova troca Diffie-Hellman na renovação da CHILD_SA, de modo que a chave nova não derive da antiga'
        ], 'Com PFS, o vazamento de uma chave não compromete as anteriores nem as seguintes.'),
        mcq('q6', 'Qual é o principal risco do split tunneling em um VPN de acesso remoto?', 'a', [
          'O dispositivo fica ao mesmo tempo na internet direta e na rede da empresa, podendo servir de ponte para um invasor, sem inspeção corporativa do tráfego de internet',
          'Todo o tráfego passa obrigatoriamente pela empresa',
          'A VPN deixa de usar criptografia',
          'Os usuários perdem o acesso à intranet'
        ], 'O split tunneling economiza banda, mas deixa o endpoint exposto à internet enquanto conectado à rede interna.'),
        mcq('q7', 'Qual é a diferença central do ZTNA em relação a uma VPN de acesso remoto tradicional?', 'b', [
          'O ZTNA dá acesso a toda a rede interna depois do login',
          'O ZTNA dá acesso apenas às aplicações autorizadas, com verificação contínua de identidade e do estado do dispositivo',
          'O ZTNA dispensa identidade e usa só o IP de origem',
          'O ZTNA só funciona dentro do escritório'
        ], 'Acesso por aplicação e verificação contínua reduzem o movimento lateral que o modelo de perímetro permite.'),
        fill('q8', 'Complete o nome da técnica que reduz o MSS do TCP no SYN para que os pacotes caibam no túnel sem fragmentar.', 'TCP ___ clamping', ['MSS'], 'O MSS clamping ajusta o tamanho máximo de segmento ao MTU reduzido pelo overhead do túnel.')
      ]
    },
    {
      id: 'rda-10-pki-gestao-certificados',
      title: 'PKI e gestão de certificados',
      goal: 'Entender a hierarquia de CAs, o ciclo CSR/emissão/cadeia/rotação, ACME, revogação, Certificate Transparency, mTLS e a proteção de chaves privadas, evitando as falhas operacionais mais comuns.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Hierarquia de CAs e CA interna',
            'Uma PKI (Public Key Infrastructure) liga uma chave pública a uma identidade por meio de certificados assinados por uma autoridade certificadora (CA). A hierarquia típica tem a CA raiz (root), com certificado autoassinado, que fica OFFLINE (desligada e guardada, só é usada para assinar CAs intermediárias); as CAs intermediárias, online, que emitem os certificados finais (leaf) de servidores e usuários. Vantagens: a raiz quase não é exposta e, se uma intermediária for comprometida, revoga-se só ela. O cliente confia na raiz porque ela está na sua trust store (do sistema operacional ou do navegador). Uma CA interna é uma PKI privada da organização: você distribui o certificado da SUA raiz aos dispositivos (por MDM/GPO) para que confiem nos certificados internos; essa raiz não é confiada fora da organização, e sua chave exige proteção máxima.'
          ),
          sl(
            'O certificado X.509 e o CSR',
            'Um certificado X.509 contém: subject (dono), issuer (quem assinou), chave pública, validade (notBefore e notAfter), uso das chaves e a extensão SAN (Subject Alternative Name), que lista os nomes de host válidos: os clientes modernos validam o nome contra a SAN, e não mais contra o CN. Para obter um certificado, o servidor gera a chave privada LOCALMENTE (ela nunca sai dele) e cria um CSR (Certificate Signing Request): contém a chave pública e os nomes solicitados, assinado com a chave privada (prova de posse). A CA valida o pedido (controle do domínio) e devolve o certificado. Nunca se envia a chave privada à CA.',
            'openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 \\\n  -nodes -keyout srv.key -out srv.csr -subj "/CN=app.example.com" \\\n  -addext "subjectAltName=DNS:app.example.com"\nchmod 600 srv.key'
          ),
          sl(
            'Cadeia, validade e rotação',
            'O servidor deve apresentar o certificado leaf MAIS as intermediárias (não a raiz); o cliente monta a cadeia até uma raiz que ele já confia. Erro clássico: servidor sem a intermediária, que funciona em alguns navegadores e falha em clientes de API, com mensagens como "unable to get local issuer certificate". Validade curta limita o dano de um vazamento e força a automação; a rotação (renovar e trocar a chave periodicamente, de preferência gerando nova chave) deve ser rotina, não evento. Ferramentas de diagnóstico: openssl s_client -connect host:443 -showcerts, openssl x509 -noout -dates -subject -issuer -ext subjectAltName e openssl verify.',
            'openssl s_client -connect app.example.com:443 -servername app.example.com </dev/null \\\n  | openssl x509 -noout -subject -issuer -dates\nnotAfter=... <- monitore esta data'
          ),
          sl(
            'ACME e automação',
            'O ACME (Automatic Certificate Management Environment) automatiza validação, emissão e renovação. O cliente (certbot, acme.sh, cert-manager no Kubernetes) prova o controle do domínio por um desafio: HTTP-01 (arquivo em /.well-known/acme-challenge/ na porta 80), DNS-01 (registro TXT em _acme-challenge.<nome>, o único que permite certificados wildcard e funciona sem expor o servidor) ou TLS-ALPN-01. Cuidados: credenciais de API do DNS com privilégio mínimo (só editar a zona necessária); e MONITORAR a expiração mesmo com automação, pois renovações falham em silêncio (porta bloqueada, token expirado, limites de taxa). Uma CA interna também pode falar ACME.',
            'certbot certonly --dns-<provedor> -d "*.example.com" -d example.com\n# o desafio DNS-01 cria: _acme-challenge.example.com TXT "<token>"'
          ),
          sl(
            'Revogação, OCSP stapling e Certificate Transparency',
            'Se uma chave vazar, é preciso revogar o certificado. A CRL é uma lista assinada de certificados revogados, publicada periodicamente (pode ser grande e desatualizada). O OCSP permite perguntar à CA o estado de UM certificado; traz latência e um problema de privacidade (a CA vê quais sites o cliente visita). O OCSP stapling resolve isso: o próprio servidor busca a resposta OCSP assinada e recente e a anexa ao handshake. Mesmo assim, clientes frequentemente falham aberto (aceitam se não conseguem verificar), por isso certificados de vida curta são a melhor defesa. O Certificate Transparency (CT) registra todo certificado emitido em logs públicos append-only; as CAs incluem provas (SCTs) no certificado e os donos de domínio podem monitorar os logs para detectar emissões indevidas. Atenção à privacidade: nomes de hosts internos vazam em logs públicos; para ambientes internos, use CA interna.'
          ),
          sl(
            'mTLS entre serviços',
            'No TLS comum só o servidor se autentica. No mTLS (TLS mútuo) o cliente também apresenta um certificado, e o servidor valida a cadeia e a identidade. É a base da autenticação entre serviços (service mesh, APIs internas, zero trust): cada carga de trabalho tem uma identidade criptográfica, sem senhas ou tokens estáticos compartilhados. Exige uma CA para emitir os certificados de serviços (de vida curta, renovados automaticamente) e decisões de autorização além da autenticação (por exemplo, o serviço A pode chamar B, mas não C).'
          ),
          sl(
            'Proteção das chaves privadas e falhas comuns',
            'A chave privada é o segredo central: permissões restritas (leitura só pelo serviço), fora de repositórios e imagens de container, guardada em um cofre de segredos; para as mais críticas (raiz e intermediárias) usa-se HSM (Hardware Security Module) ou KMS: a chave é gerada e usada dentro do dispositivo e não pode ser exportada. Em caso de suspeita de vazamento: revogue, emita novo par de chaves (não reuse a chave) e investigue. Falhas comuns de expiração: certificado esquecido (sem dono ou monitoramento), intermediária expirada, renovação automática quebrada, relógio errado em cliente ou servidor, certificados fixados (pinning) em aplicações, cadeia incompleta. Boas práticas: inventário de certificados, alertas bem antes do vencimento, dono definido e teste das renovações.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que a CA raiz é mantida offline e usada só para assinar CAs intermediárias?', 'a', [
          'Reduz a exposição da chave mais crítica; comprometer uma intermediária não exige trocar a raiz',
          'Porque a raiz não consegue assinar certificados finais',
          'Para que os navegadores aceitem a raiz',
          'Porque certificados raiz expiram em dias'
        ], 'A raiz offline é difícil de atacar; se uma intermediária vazar, revoga-se apenas ela.'),
        mcq('q2', 'O que é o mTLS?', 'd', [
          'TLS que usa apenas chaves simétricas',
          'Um protocolo para cifrar e-mail',
          'TLS em que o servidor se autentica e o cliente envia, em claro, um nome de usuário',
          'TLS em que cliente e servidor apresentam certificados e se autenticam mutuamente'
        ], 'No mTLS ambos os lados autenticam-se por certificados: base de identidade entre serviços.'),
        mcq('q3', 'O que um CSR contém e o que NUNCA deve ser enviado à CA?', 'c', [
          'Contém a chave privada; nada deve ser omitido',
          'Contém a senha do administrador; nunca a chave pública',
          'Contém a chave pública e os nomes; a chave privada nunca sai do servidor',
          'Contém o certificado da raiz; nunca o domínio'
        ], 'O CSR leva a chave pública e os nomes, assinado com a chave privada (prova de posse). A privada fica local.'),
        fill('q4', 'Complete o tipo de desafio ACME necessário para emitir um certificado wildcard (*.example.com).', 'desafio ACME: ___-01', ['dns', 'dns-01'], 'Wildcards exigem o desafio DNS-01 (registro TXT em _acme-challenge).'),
        mcq('q5', 'Uma API passa a falhar às 00:00 de um dia com TLS inválido, embora a "renovação automática" estivesse configurada. Qual a prática estrutural?', 'b', [
          'Aumentar a validade do certificado para vários anos',
          'Monitorar a data de expiração e alertar com antecedência, além de testar a renovação',
          'Desligar a validação no cliente',
          'Copiar a chave privada para o cliente'
        ], 'Automação falha em silêncio; monitoramento da expiração com alertas evita o apagão. Validade longa aumenta o risco.'),
        mcq('q6', 'Qual a vantagem do OCSP stapling em relação ao OCSP comum?', 'd', [
          'Dispensa o certificado do servidor',
          'Substitui a cadeia de CAs',
          'Permite certificados sem data de validade',
          'O servidor anexa a resposta assinada ao handshake, reduzindo latência e evitando que a CA veja os acessos do cliente'
        ], 'No stapling o servidor busca a resposta OCSP e a entrega ao cliente, preservando a privacidade e a velocidade.'),
        mcq('q7', 'Para que serve o Certificate Transparency?', 'c', [
          'Para cifrar o conteúdo dos certificados',
          'Para ocultar certificados internos',
          'Registrar emissões em logs públicos, permitindo detectar certificados emitidos indevidamente',
          'Para renovar certificados automaticamente'
        ], 'CT cria logs públicos e auditáveis; o dono do domínio monitora emissões suspeitas. Também expõe nomes, por isso hosts internos devem usar CA interna.'),
        fill('q8', 'Complete a sigla do hardware que gera e usa a chave privada sem permitir sua exportação.', 'Chave da CA guardada em ___ (Hardware Security Module)', ['hsm'], 'O HSM guarda e usa a chave internamente, sem expô-la.')
      ]
    },
    {
      id: 'rda-11-quic-http3',
      title: 'QUIC e HTTP/3',
      goal: 'Entender por que o HTTP/3 foi construído sobre o QUIC (UDP): head-of-line blocking, handshake combinado, 0-RTT e seus riscos, streams, migração de conexão e impactos operacionais.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Os limites do TCP + TLS',
            'O HTTP/2 multiplexa vários streams (requisições) numa só conexão TCP, mas o TCP entrega bytes em ordem: se um segmento se perde, TODOS os streams esperam a retransmissão. É o head-of-line blocking (bloqueio da cabeça da fila) no nível de transporte. Além disso, a conexão custa um handshake TCP (1 RTT) mais o do TLS (1 RTT no TLS 1.3): 2 RTTs antes do primeiro dado de aplicação. A conexão é identificada pela 4-tupla (IPs e portas): mudar de rede (Wi-Fi para 4G) muda o IP e quebra tudo. E o TCP vive no kernel e nos middleboxes, difícil de evoluir.'
          ),
          sl(
            'QUIC: transporte sobre UDP',
            'O QUIC é um protocolo de transporte novo, implementado sobre UDP (geralmente na porta 443) e geralmente em espaço de usuário. O HTTP/3 é o HTTP mapeado sobre o QUIC. Ele integra o TLS 1.3 ao transporte: o handshake de transporte e o de criptografia acontecem juntos, resultando em 1 RTT para uma conexão nova. Quase tudo é criptografado, inclusive grande parte do cabeçalho de transporte e dos números de pacote: só poucos campos são visíveis à rede. Confiabilidade, controle de congestionamento e ordenação são implementados pelo próprio QUIC.',
            'Pilha tradicional:  HTTP/2 -> TLS -> TCP -> IP\nPilha nova:         HTTP/3 -> QUIC (inclui TLS 1.3) -> UDP -> IP'
          ),
          sl(
            'Streams independentes',
            'Dentro de uma conexão QUIC existem streams independentes: cada um é uma sequência ordenada de bytes. Se um pacote com dados do stream A se perde, só o stream A espera; os streams B e C continuam sendo entregues: acabou o bloqueio de cabeça de fila entre requisições (ainda existe ordem DENTRO de cada stream). O controle de fluxo vale por stream e pela conexão, e os números de pacote só crescem (retransmissões usam novo número, o que elimina a ambiguidade entre original e retransmissão que existe no TCP).'
          ),
          sl(
            '0-RTT e o risco de replay',
            'Quando o cliente já falou com o servidor antes, pode usar a retomada de sessão e enviar dados de aplicação já no PRIMEIRO voo, sem esperar o handshake: o 0-RTT. O custo: esses dados iniciais podem ser reenviados (replay) por um atacante que os capturou, e o servidor pode processá-los duas vezes; além disso o early data não tem forward secrecy completo. Regra: usar 0-RTT apenas para requisições idempotentes e seguras (como um GET sem efeitos colaterais); nunca para pagamentos ou alterações; servidores podem recusar o 0-RTT e exigir o handshake completo.'
          ),
          sl(
            'Migração de conexão',
            'No QUIC a conexão é identificada por um Connection ID (CID), escolhido pelos endpoints, e não pela 4-tupla. Quando o cliente muda de IP (de Wi-Fi para dados móveis), a conexão continua: os pacotes seguintes trazem o mesmo CID de outro endereço. Para impedir spoofing e uso do servidor como amplificador, o novo caminho é validado (PATH_CHALLENGE/PATH_RESPONSE), e o servidor limita o quanto envia a um endereço ainda não validado (cerca de 3 vezes o recebido). Por privacidade, os endpoints trocam de CID ao migrar, para que observadores não vinculem os caminhos.'
          ),
          sl(
            'Ossificação e descoberta',
            'Ossificação é o fenômeno em que middleboxes (firewalls, NATs, otimizadores) passam a assumir como o TCP "deve" ser, impedindo novas extensões. O QUIC se esconde atrás de UDP e criptografa quase tudo para que a rede não possa se acostumar com seus campos e para que ele possa evoluir. Como o cliente sabe que o servidor fala HTTP/3? O servidor anuncia por Alt-Svc (cabeçalho HTTP) ou pelo registro DNS HTTPS; o cliente tenta o QUIC e, se UDP/443 estiver bloqueado, cai para HTTP/2 sobre TCP, de modo que o fallback é automático.',
            'HTTP/2 200\nalt-svc: h3=":443"; ma=86400    <- "também falo HTTP/3 na UDP 443"'
          ),
          sl(
            'Impacto em firewalls e observabilidade',
            'Firewalls que só liberam TCP/443 bloqueiam o QUIC (UDP/443) e forçam o fallback para TCP, o que pode ser aceitável; bloquear de propósito é política de alguns ambientes, desde que consciente. Como o conteúdo e a maior parte dos metadados são cifrados, a inspeção profunda de pacotes não enxerga HTTP/3; só um proxy que TERMINE o TLS vê o conteúdo. A observabilidade muda: não dá para inferir RTT, retransmissões e janelas no tcpdump como no TCP; usam-se logs e métricas dos endpoints (qlog) e, opcionalmente, o spin bit. Balanceadores precisam de suporte a QUIC (e roteamento por Connection ID para que a migração não troque de servidor); mitigar ataques UDP (rate limiting, validação de endereço com Retry) e prever mais CPU (criptografia em espaço de usuário).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o head-of-line blocking do TCP no HTTP/2 e como o QUIC o evita?', 'c', [
          'É o limite de 6 conexões; o QUIC abre 60',
          'É a perda de pacotes UDP; o QUIC usa TCP',
          'Uma perda atrasa todos os streams da conexão; no QUIC cada stream é independente',
          'É a fragmentação IP; o QUIC não fragmenta'
        ], 'No TCP uma perda bloqueia a entrega em ordem de tudo; no QUIC só o stream afetado espera.'),
        mcq('q2', 'Quantos RTTs, antes do primeiro dado de aplicação, o QUIC exige numa conexão NOVA, comparado a TCP + TLS 1.3?', 'b', [
          'QUIC: 2 RTT; TCP+TLS: 1 RTT',
          'QUIC: 1 RTT; TCP+TLS 1.3: 2 RTT',
          'Ambos: 3 RTT',
          'QUIC: 0 RTT sempre; TCP+TLS: 1 RTT'
        ], 'O QUIC combina transporte e TLS 1.3 em 1 RTT; TCP (1) + TLS 1.3 (1) = 2. O 0-RTT só vale em retomada.'),
        mcq('q3', 'Qual é o principal risco do 0-RTT?', 'd', [
          'Impossibilidade de usar UDP',
          'Perda do Connection ID',
          'Aumento do tamanho dos cabeçalhos',
          'Replay: um atacante pode reenviar os dados iniciais; use só para requisições idempotentes'
        ], 'Dados 0-RTT não têm proteção contra replay; por isso só operações idempotentes (como GET seguro).'),
        fill('q4', 'Complete a porta indicada no cabeçalho Alt-Svc para HTTP/3.', 'alt-svc: h3=":___"', ['443'], 'O HTTP/3 usa normalmente a porta UDP 443; o Alt-Svc a anuncia.'),
        mcq('q5', 'Por que o QUIC sobrevive à troca de Wi-Fi para dados móveis?', 'a', [
          'A conexão é identificada por um Connection ID, não pela 4-tupla de IPs e portas',
          'Porque o servidor guarda o endereço MAC do cliente',
          'Porque o NAT da operadora mantém o IP',
          'Porque o TCP reconecta automaticamente'
        ], 'O CID permite continuar após mudar de IP, com validação do novo caminho.'),
        mcq('q6', 'Por que o QUIC usa UDP e criptografa quase todos os cabeçalhos?', 'b', [
          'Porque o UDP é mais confiável que o TCP',
          'Para evitar a ossificação: middleboxes não conseguem depender dos campos do protocolo',
          'Para aumentar o tamanho dos pacotes',
          'Porque o kernel não aceita novos protocolos de transporte'
        ], 'UDP atravessa a rede; a criptografia impede que os middleboxes presumam comportamento, mantendo o protocolo evolutivo.'),
        mcq('q7', 'Um firewall corporativo só permite TCP/443 de saída. O que acontece com um navegador que tenta HTTP/3?', 'c', [
          'A conexão fica pendurada sem fallback',
          'O HTTP/3 passa por TCP automaticamente',
          'O QUIC é bloqueado e o cliente cai para HTTP/2 sobre TCP',
          'O firewall inspeciona o conteúdo do QUIC'
        ], 'Com UDP/443 bloqueado há fallback automático. A inspeção profunda não vê o QUIC (cifrado).'),
        fill('q8', 'Complete o nome do protocolo de transporte sobre UDP, no qual o HTTP/3 é executado.', 'HTTP/3 roda sobre ___, que roda sobre UDP', ['quic'], 'HTTP/3 = HTTP sobre QUIC; QUIC = transporte com TLS 1.3 integrado sobre UDP.')
      ]
    },
    {
      id: 'rda-12-dns-escala-seguranca',
      title: 'DNS em escala e segurança',
      goal: 'Entender como o DNS escala (anycast, cache e TTL), como o DNSSEC garante autenticidade, o papel de DoT/DoH/DoQ e como detectar e mitigar tunneling, cache poisoning e amplificação.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Anycast e resolvers públicos',
            'Os servidores raiz do DNS são 13 identidades (a até m), mas cada uma é composta por centenas de instâncias espalhadas pelo mundo por meio de anycast: o mesmo endereço IP é anunciado por BGP de muitos locais e cada cliente fala com a instância mais próxima (em termos de roteamento). Isso reduz latência, distribui carga e dilui ataques DDoS. O DNS combina bem com anycast porque a maioria das consultas é um único datagrama UDP. Resolvers recursivos (do provedor, da empresa ou públicos) buscam e fazem cache; servidores autoritativos guardam as zonas. Privacidade: o resolver que você usa vê todos os nomes que você consulta, o que pode ser dado pessoal pela LGPD: escolha e contrate com critério.'
          ),
          sl(
            'Cache, TTL e cache negativo em escala',
            'Cada registro tem um TTL: por quanto tempo caches podem reutilizá-lo. Caches existem em camadas (aplicação, sistema, resolver). TTL alto reduz carga e latência e dá resiliência (alguns resolvers podem servir dados expirados quando o autoritativo cai, o serve-stale); TTL baixo permite mudanças rápidas, ao custo de mais consultas. Planeje migrações abaixando o TTL ANTES (com antecedência de ao menos o TTL antigo). O cache negativo também existe: respostas NXDOMAIN (nome inexistente) e NODATA são guardadas pelo tempo derivado do SOA da zona (campo de TTL negativo); portanto, um nome criado logo depois de ter sido consultado pode "não existir" por um tempo nos caches.'
          ),
          sl(
            'DNSSEC: a cadeia de confiança',
            'O DNSSEC garante autenticidade e integridade das respostas (o dado vem mesmo da zona, sem alteração), mas NÃO confidencialidade. Registros: DNSKEY (as chaves públicas da zona: a ZSK assina os registros e a KSK assina o conjunto DNSKEY), RRSIG (assinatura de um conjunto de registros, com prazo de validade), DS (um hash da KSK da zona filha, publicado na zona PAI) e NSEC/NSEC3 (prova de inexistência). A cadeia: o resolver tem uma âncora de confiança (a chave da raiz); a raiz assina o DS do TLD, que assina o DS do domínio, que valida a DNSKEY, que valida os RRSIG. Se a validação passa, o resolver marca o bit AD; se falha, retorna SERVFAIL. Operação: RRSIG expirados ou DS desatualizado após troca de chaves derrubam o domínio para quem valida.',
            'dig +dnssec example.com A\n;; flags: qr rd ra ad;   <- "ad": dados autenticados\nexample.com. 3600 IN A 192.0.2.10\nexample.com. 3600 IN RRSIG A 13 2 3600 ...'
          ),
          sl(
            'DoT, DoH e DoQ: privacidade no caminho',
            'O DNS tradicional (UDP/TCP 53) trafega em claro: qualquer ponto do caminho vê e pode alterar as consultas. DNS sobre TLS (DoT, TCP porta 853), sobre HTTPS (DoH, porta 443, misturado ao tráfego web) e sobre QUIC (DoQ, UDP 853) cifram o trecho entre o cliente e o resolver. Eles NÃO substituem o DNSSEC (não validam a origem dos dados) e o resolver continua vendo tudo. Impacto corporativo: se os navegadores usam DoH para um resolver externo, o DNS da empresa (com RPZ, filtros e logs) é contornado; a política é oferecer DoH/DoT internos e restringir o DNS de saída externo.'
          ),
          sl(
            'Tunneling e exfiltração, sinkhole e RPZ',
            'No DNS tunneling, um malware codifica dados nos nomes consultados (ex.: <dados-codificados>.dominio-do-atacante.example), e o servidor autoritativo controlado pelo atacante os recebe e responde com comandos: um canal de comando e exfiltração que atravessa firewalls que liberam DNS. Sinais: nomes muito longos e de alta entropia, enorme quantidade de subdomínios únicos de um mesmo domínio, volume anormal de tipos como TXT. Defesas: obrigar o uso do resolver interno (bloquear 53/853 externos), analisar logs e a entropia, e usar RPZ (Response Policy Zone): o resolver aplica políticas a domínios listados (bloquear, devolver NXDOMAIN ou um IP de sinkhole). Um sinkhole também revela QUEM consultou o domínio malicioso (hosts comprometidos). Logs de DNS contêm dados pessoais de navegação: restrinja o acesso e a retenção.'
          ),
          sl(
            'Cache poisoning: defesas',
            'No cache poisoning (envenenamento de cache), o atacante tenta fazer o resolver aceitar e guardar uma resposta FALSA, forjando uma resposta que corresponda à consulta em andamento: o ID da transação (16 bits) e a porta de origem. Em 2008, Kaminsky mostrou que, sem aleatorização, isso era viável. Defesas: porta de origem aleatória e ID aleatório (hoje padrão), codificação 0x20 (alternar maiúsculas/minúsculas no nome da consulta), cookies DNS, não aceitar dados fora do que foi perguntado (bailiwick) e, principalmente, o DNSSEC, que torna a resposta falsa verificavelmente inválida. Mantenha o software de resolvers atualizado e restrinja quem pode usá-los.'
          ),
          sl(
            'Amplificação por reflexão: defesa',
            'No ataque de amplificação, o atacante envia consultas pequenas com o IP de origem FALSIFICADO (o da vítima) a servidores DNS, que respondem à vítima com mensagens muito maiores. O fator de amplificação é bytes da resposta divididos pelos bytes da consulta: uma consulta de 60 bytes com resposta de 3000 amplifica 50 vezes. Respostas grandes vêm de registros TXT, DNSKEY/DNSSEC, ANY. Defesas (conceituais e defensivas): não ser um resolver aberto (permitir recursão apenas a clientes autorizados por ACL); RRL (Response Rate Limiting) em autoritativos; não responder desnecessariamente a ANY; BCP 38 (filtragem anti-spoofing de entrada nos provedores, para impedir que pacotes com origem falsa saiam); e usar cookies DNS/TCP para validar o cliente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o anycast é útil para servidores DNS, como os raiz e os resolvers públicos?', 'd', [
          'Porque cada servidor tem um IP diferente',
          'Porque usa TCP com handshake',
          'Porque cifra as consultas',
          'O mesmo IP é anunciado de muitos locais e o cliente é atendido pelo mais próximo, reduzindo latência e diluindo DDoS'
        ], 'Anycast distribui carga e ataques por muitas instâncias; consultas UDP curtas combinam com ele.'),
        mcq('q2', 'Um nome inexistente (NXDOMAIN) foi consultado e, minutos depois, você criou o registro. Muitos usuários continuam sem resolver. Por quê?', 'a', [
          'O cache negativo guarda a inexistência pelo tempo dado pelo SOA',
          'O DNSSEC bloqueia registros recentes',
          'O anycast não sincroniza',
          'O DoH ignora registros novos'
        ], 'Respostas negativas também são cacheadas (TTL negativo derivado do SOA).'),
        mcq('q3', 'Qual tecnologia garante que a resposta DNS é autêntica e não foi alterada?', 'b', [
          'DoH',
          'DNSSEC',
          'DoT',
          'Anycast'
        ], 'DoH/DoT/DoQ protegem o canal contra espionagem, mas só o DNSSEC valida a origem dos dados.'),
        fill('q4', 'Complete a porta TCP padrão do DNS sobre TLS (DoT).', 'tcp port ___   # DoT', ['853'], 'DoT usa a porta 853 (DoQ, UDP 853); DoH usa a 443.'),
        mcq('q5', 'Qual medida torna o cache poisoning muito mais difícil, mesmo sem DNSSEC?', 'c', [
          'Usar TTLs muito altos',
          'Responder por TCP somente',
          'Porta de origem e ID de transação aleatórios nas consultas do resolver',
          'Bloquear o tipo TXT'
        ], 'O atacante precisa adivinhar ID e porta; aleatorizar ambos aumenta enormemente o espaço de busca.'),
        mcq('q6', 'Quais sinais sugerem DNS tunneling na análise de logs, e qual controle ajuda a contê-lo?', 'a', [
          'Nomes longos de alta entropia e muitos subdomínios únicos; forçar o resolver interno e usar RPZ/sinkhole',
          'Respostas NXDOMAIN raras; desligar o cache',
          'Consultas A curtas; liberar DNS externo',
          'Muitos registros MX; aumentar o TTL'
        ], 'Tunneling gera nomes longos, aleatórios e muitos subdomínios únicos. Força-se o DNS interno e aplicam-se RPZ e sinkhole.'),
        mcq('q7', 'Uma consulta de 60 bytes gera uma resposta de 3000 bytes a uma vítima (IP falsificado). Qual é o fator de amplificação e uma defesa correta?', 'd', [
          '5x; abrir a recursão para todos',
          '50x; liberar ANY',
          '500x; desativar o RRL',
          '50x; limitar a recursão a clientes autorizados, aplicar RRL e filtrar spoofing (BCP 38)'
        ], '3000/60 = 50. Resolver aberto é parte do problema; RRL e BCP 38 reduzem o abuso.'),
        fill('q8', 'Complete o tipo de registro, publicado na zona pai, que contém o hash da KSK da zona filha.', 'registro ___ na zona pai (DNSSEC)', ['ds'], 'O DS liga a zona pai à KSK da filha, formando a cadeia de confiança.')
      ]
    },
    {
      id: 'rda-13-cdn-anycast-gslb',
      title: 'CDN, anycast e balanceamento global',
      goal: 'Entender como CDNs e serviços globais combinam anycast, GSLB por DNS, cache hierárquico e proteção de borda, e quais implicações de privacidade e localização de dados isso traz.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Anycast via BGP',
            'No anycast, o mesmo prefixo (ex.: 198.51.100.0/24) é anunciado por BGP a partir de vários PoPs (pontos de presença) e cada cliente chega ao PoP que o roteamento considera mais próximo (menor AS_PATH e política): o critério é o do BGP, não necessariamente a menor distância geográfica ou a menor latência. Se um PoP falha, ele retira o anúncio (withdraw) e o tráfego passa ao PoP seguinte. Pontos de atenção: mudanças de rota podem enviar pacotes de uma conexão TCP a outro PoP no meio da sessão (a conexão quebra), então o anycast é excelente para UDP/DNS e funciona bem para HTTP desde que o roteamento seja estável. Em ataques DDoS volumétricos, o anycast divide o ataque entre os PoPs conforme a origem, aumentando a capacidade de absorção.'
          ),
          sl(
            'GSLB por DNS',
            'No balanceamento global por DNS (GSLB), o servidor DNS autoritativo responde com endereços diferentes conforme critérios: geolocalização aproximada do resolver do cliente, latência medida, saúde (health checks: remove IPs que falham), carga e pesos. Limitações: o autoritativo vê o IP do RESOLVER, não do usuário final (um resolver público distante distorce a decisão); a extensão EDNS Client Subnet (ECS) repassa um trecho do IP do cliente ao autoritativo para melhorar a escolha, ao custo de privacidade; e o TTL baixo é necessário para failover rápido, mas alguns clientes e caches o ignoram. Por isso o GSLB por DNS é frequentemente combinado com anycast e redirecionamento na camada HTTP.',
            'www.example.com. 30 IN A 192.0.2.10    <- resposta para usuários da região A\nwww.example.com. 30 IN A 198.51.100.10  <- resposta para a região B'
          ),
          sl(
            'PoPs, edge e cache hierárquico',
            'Uma CDN coloca servidores de borda (edge) em muitos PoPs próximos aos usuários. A borda termina o TLS perto do cliente (handshake com poucos ms de RTT), guarda cópias de conteúdo em cache e reaproveita conexões persistentes até a origem. O comportamento do cache depende de Cache-Control e TTLs, da chave de cache (URL, cabeçalhos do Vary) e da invalidação (purge). A métrica central é a taxa de acerto (cache hit ratio). O cache hierárquico organiza camadas: edge, depois cache regional (parent) e depois a origem; um miss no edge consulta o pai, e só se ele também não tiver a requisição vai à origem, reduzindo drasticamente a carga na origem.'
          ),
          sl(
            'Origin shield e failover entre regiões',
            'O origin shield é uma camada de cache designada que fica entre todas as bordas e a origem: todas as bordas consultam o shield, que consolida requisições iguais (request collapsing) e só um pedido por objeto chega à origem. Para failover entre regiões: várias origens com health checks; active-active (todas servem) ou active-passive (uma reserva); o desvio acontece por GSLB (DNS) ou por withdraw de anycast; stale-if-error permite servir conteúdo expirado do cache quando a origem está fora do ar. Teste o failover regularmente e lembre que a CDN não resolve a consistência de dados entre regiões: replicação é problema da aplicação.'
          ),
          sl(
            'WAF e DDoS na borda; proteger a origem',
            'A borda é o melhor lugar para absorver e filtrar ataques. DDoS volumétrico (camadas 3/4): a capacidade distribuída por anycast o absorve e o tráfego é limpo (scrubbing) antes de chegar à sua rede; SYN flood: SYN cookies; ataques à camada 7: rate limiting, desafios e gestão de bots. O WAF aplica regras (injeção, XSS, abuso de API); comece em modo de detecção para medir falsos positivos antes de bloquear. Proteger a origem é essencial: se o IP da origem é conhecido, o atacante a acessa direto e contorna a borda. Faça a origem aceitar tráfego apenas da CDN (lista de IPs/ASNs ou túnel/mTLS com a borda) e só confie nos cabeçalhos de IP do cliente (X-Forwarded-For) quando a requisição vier da CDN.'
          ),
          sl(
            'Privacidade e localização de dados',
            'Se a CDN/WAF termina o TLS, ela VÊ o conteúdo em claro, inclusive dados pessoais em trânsito: ela atua como operadora de dados, e o contrato, as cláusulas de tratamento de dados e a avaliação de risco são parte da conformidade com a LGPD. Os logs da borda contêm IPs, que são dados pessoais: minimize campos, defina retenção curta e controle de acesso. O cache em PoPs fora do país pode caracterizar transferência internacional de dados, regulada pela LGPD: para conteúdo com dados pessoais, restrinja as regiões de cache/borda permitidas. Não deixe a borda cachear respostas personalizadas: use Cache-Control: private ou no-store e Vary adequado. O ECS também leva parte do IP do usuário a terceiros.',
            'HTTP/1.1 200 OK\nCache-Control: private, max-age=0     <- só o navegador pode guardar\nCache-Control: no-store               <- ninguém deve guardar'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um PoP anycast falha. O que acontece com o tráfego dos clientes que o usavam?', 'b', [
          'Continua indo para o PoP falho até o TTL do DNS expirar',
          'O PoP retira o anúncio BGP e o roteamento envia o tráfego a outro PoP',
          'Todos os PoPs são desligados',
          'O anúncio passa a usar TCP'
        ], 'O withdraw do prefixo faz o BGP convergir para o PoP seguinte; não depende de TTL de DNS. Conexões TCP em andamento podem se romper.'),
        mcq('q2', 'Qual limitação do GSLB por DNS é mitigada (com custo de privacidade) pelo EDNS Client Subnet?', 'c', [
          'O TTL mínimo do DNS',
          'A impossibilidade de health checks',
          'O autoritativo só enxerga o IP do resolver, e não o do usuário final',
          'A falta de suporte a IPv6'
        ], 'O ECS repassa parte do IP do cliente ao autoritativo para melhorar a geolocalização, e expõe dados do usuário.'),
        mcq('q3', 'Qual o benefício principal de um origin shield?', 'd', [
          'Cifra o tráfego entre a borda e o usuário',
          'Aumenta o TTL do DNS',
          'Substitui o WAF',
          'Consolida as buscas das bordas, reduzindo as requisições (e a carga) à origem'
        ], 'O shield é uma camada que unifica misses e faz request collapsing, protegendo a origem.'),
        fill('q4', 'Complete a diretiva de Cache-Control que permite cache no navegador do usuário, mas impede a CDN (cache compartilhado) de guardar a resposta.', 'Cache-Control: ___', ['private'], 'private restringe o cache ao navegador; no-store impediria até este.'),
        mcq('q5', 'A origem caiu, mas a CDN continua entregando versões antigas das páginas. Qual comportamento é esse?', 'a', [
          'Servir conteúdo expirado do cache quando a origem falha (stale-if-error)',
          'Withdraw de anycast',
          'Purge global',
          'ECS'
        ], 'stale-if-error serve cópias expiradas durante falhas da origem, preservando a disponibilidade.'),
        mcq('q6', 'Um atacante descobre o IP da origem e passa a atacá-la diretamente, contornando a CDN/WAF. Qual é a defesa estrutural?', 'd', [
          'Reduzir o TTL do DNS',
          'Habilitar mais PoPs',
          'Desabilitar o cache',
          'Restringir a origem a aceitar tráfego só da CDN (IPs/ASNs ou túnel/mTLS)'
        ], 'Se a origem aceitar tráfego de qualquer lugar, a borda pode ser contornada.'),
        mcq('q7', 'Qual risco de privacidade/LGPD a CDN que termina o TLS introduz?', 'b', [
          'Nenhum, pois o TLS é de ponta a ponta até a origem',
          'Ela vê o conteúdo em claro e pode cachear fora do país: exige contrato, minimização de logs e controle de regiões',
          'Impossibilita o uso de HTTPS',
          'Obriga o uso do IPv4'
        ], 'A CDN é operadora de dados: vê o conteúdo, guarda logs com IP e pode implicar transferência internacional.'),
        fill('q8', 'Complete a sigla da extensão de DNS que repassa parte do IP do cliente ao autoritativo: EDNS Client ___.', 'EDNS Client ___ (ECS)', ['subnet'], 'ECS = EDNS Client Subnet.')
      ]
    },
    {
      id: 'rda-14-desempenho-engenharia-trafego',
      title: 'Desempenho e engenharia de tráfego',
      goal: 'Calcular BDP e limites de janela, entender controle de congestionamento, bufferbloat/AQM/ECN, PMTUD e MTU, ECMP e medir com método.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Produto banda-atraso (BDP) e janela',
            'O BDP (bandwidth-delay product) é banda x RTT: a quantidade de dados que precisa estar "em voo" para manter o canal cheio. Exemplo: 1 Gbps e RTT de 40 ms: 1.000.000.000 bit/s x 0,04 s = 40.000.000 bits = 5.000.000 bytes (5 MB). Para encher o canal, a janela TCP (a menor entre a janela de recepção e a de congestionamento) precisa ser pelo menos o BDP. A vazão máxima de uma conexão é janela / RTT. Sem a opção de window scaling a janela é limitada a 65.535 bytes: com RTT de 40 ms, o máximo é 65.535 x 8 / 0,04 = cerca de 13,1 Mbps, mesmo num link de 1 Gbps. Com 100 Mbps e RTT de 80 ms: BDP = 100.000.000 x 0,08 / 8 = 1.000.000 bytes.'
          ),
          sl(
            'Tuning conceitual',
            'A janela de 16 bits original foi estendida pela opção de window scaling (fator de escala negociado no SYN), permitindo janelas de centenas de MB. Os buffers de envio e de recepção do socket precisam comportar o BDP; os kernels modernos fazem auto-tuning (no Linux, net.ipv4.tcp_rmem e tcp_wmem definem mínimo, padrão e máximo). Não exagere: buffers gigantes consomem memória e geram bufferbloat. Outros recursos: SACK (retransmitir só o que faltou), timestamps, offloads (TSO/GRO) para reduzir a CPU, e várias conexões em paralelo (iperf3 -P) quando uma só não enche o canal. Em links de BDP alto, a perda reduz muito a vazão do TCP.'
          ),
          sl(
            'Controle de congestionamento: CUBIC e BBR',
            'O controle de congestionamento decide quanto enviar. CUBIC (padrão do Linux por muito tempo) é baseado em PERDA: aumenta a janela com uma função cúbica do tempo desde a última perda e a reduz ao detectar perda; funciona bem em BDP alto, mas enche as filas do gargalo até haver perda. BBR modela o caminho: estima a banda do gargalo e o RTT mínimo e envia perto do ponto de operação ideal (banda cheia com fila pequena); não usa a perda como sinal principal, por isso rende bem em links com perda aleatória e mantém latência menor. Pode competir de forma desigual com fluxos CUBIC; por isso se avalia no seu ambiente. No Linux: sysctl net.ipv4.tcp_congestion_control.'
          ),
          sl(
            'Bufferbloat, AQM e ECN',
            'Bufferbloat é o excesso de buffer no gargalo: sob carga a fila enche e a latência explode (um ping que era de 20 ms vira centenas), prejudicando voz, jogos e chamadas, mesmo com banda sobrando. O AQM (Active Queue Management) controla o atraso da fila descartando ou marcando pacotes cedo: CoDel, FQ-CoDel (acrescenta filas por fluxo, que isolam fluxos pesados de leves) e CAKE. Em casa/borda, configure o shaping um pouco abaixo da velocidade real do link, para que a fila fique sob seu controle. O ECN (Explicit Congestion Notification) permite ao roteador MARCAR o pacote (bits ECN do cabeçalho IP, CE) em vez de descartar; o receptor ecoa a marca (ECE no TCP) e o remetente reduz a janela sem perder dados. Exige negociação fim a fim.'
          ),
          sl(
            'MTU, PMTUD, blackholes e jumbo frames',
            'O MSS é o maior segmento TCP: MTU menos os cabeçalhos IP e TCP: com MTU 1500 e IPv4 (20 + 20 bytes), MSS = 1500 - 40 = 1460 (no IPv6, 1440). O PMTUD (Path MTU Discovery) envia pacotes com DF e espera ICMP Fragmentation Needed (tipo 3, código 4) no IPv4 ou Packet Too Big no IPv6 de roteadores cujo enlace é menor. Se um firewall bloqueia esses ICMPs, ocorre o blackhole de PMTUD: handshake e pacotes pequenos passam, mas transferências grandes travam. Soluções: permitir os ICMP necessários, MSS clamping no gateway (muito usado em túneis/VPNs) e PLPMTUD. Jumbo frames (MTU 9000) reduzem a proporção de cabeçalhos (40/1500 = 2,7%; 40/9000 = 0,44%) e a carga de CPU; exigem MTU igual em todo o caminho L2 e são usados em data center e armazenamento, não na internet.',
            'ping -M do -s 1472 192.0.2.1    # 1472 + 8 (ICMP) + 20 (IP) = 1500: testa MTU 1500 sem fragmentar'
          ),
          sl(
            'ECMP, hash e polarização',
            'O ECMP distribui fluxos por caminhos de mesmo custo usando um hash da 5-tupla; uma única conexão sempre usa UM caminho (por isso um só fluxo grande, o elephant flow, não soma a banda de vários links) e fluxos pesados podem desequilibrar. A polarização do hash ocorre quando roteadores em camadas sucessivas usam o MESMO hash e a mesma entrada: o subconjunto de fluxos que um roteador mandou para o caminho A é de novo mandado para o caminho A no seguinte, e alguns caminhos ficam subutilizados. Mitigação: seed/algoritmo de hash diferente por dispositivo, incluir mais campos, dar entropia (como a porta UDP de origem no VXLAN) e técnicas como flowlets.'
          ),
          sl(
            'Medir com método: iperf3, ping e mtr',
            'iperf3 mede vazão: um lado com iperf3 -s (porta padrão 5201) e o outro com iperf3 -c servidor; -R inverte o sentido, -P N usa N fluxos paralelos, -u mede UDP (com -b a taxa) e -t o tempo. ping mede RTT e perda, e com -M do -s TAMANHO verifica o MTU. mtr combina traceroute e ping contínuo: mostra perda e latência por salto; perda em salto intermediário que NÃO continua nos saltos seguintes costuma ser só limitação de ICMP do roteador, não perda real. Metodologia: defina o objetivo, estabeleça uma linha de base, altere UMA variável por vez, repita várias vezes e em horários distintos, meça nos dois sentidos, monitore CPU de ambos os lados e valide com o protocolo da aplicação real.',
            'iperf3 -s                         # servidor\niperf3 -c 192.0.2.10 -t 30 -P 4   # cliente, 30 s, 4 fluxos\nmtr -rwc 100 198.51.100.1         # relatório com 100 ciclos'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o BDP de um link de 100 Mbps com RTT de 80 ms?', 'a', [
          '1.000.000 bytes (1 MB)',
          '8.000.000 bytes',
          '125.000 bytes',
          '100.000 bytes'
        ], 'BDP = 100.000.000 bit/s x 0,08 s / 8 = 1.000.000 bytes.'),
        mcq('q2', 'Sem window scaling (janela máxima de 65.535 bytes) e RTT de 50 ms, qual a vazão máxima de uma conexão TCP, aproximadamente?', 'b', [
          '1,3 Mbps',
          '10,5 Mbps',
          '65 Mbps',
          '1 Gbps'
        ], 'Vazão = janela / RTT = 65.535 x 8 / 0,05 = ~10,5 Mbps, independentemente da banda do link.'),
        mcq('q3', 'Qual afirmação descreve melhor a diferença entre CUBIC e BBR?', 'd', [
          'CUBIC modela banda e RTT; BBR reage somente à perda',
          'Ambos dependem exclusivamente de ECN',
          'BBR só funciona com UDP',
          'CUBIC é baseado em perda; BBR estima banda do gargalo e RTT mínimo, mantendo filas menores'
        ], 'CUBIC reage à perda; o BBR modela o caminho. Os dois são TCP.'),
        fill('q4', 'Para testar um MTU de 1500 bytes com ping IPv4 sem fragmentar, qual o tamanho do payload (-s)?', 'ping -M do -s ___ 192.0.2.1', ['1472'], '1500 - 20 (IP) - 8 (ICMP) = 1472.'),
        mcq('q5', 'Sob carga, o ping sobe de 20 ms para 400 ms, embora a banda esteja sendo usada normalmente. Qual o diagnóstico mais provável e a ação?', 'c', [
          'Perda de pacotes por radiofrequência; trocar o cabo',
          'MTU pequeno; ativar jumbo frames na internet',
          'Bufferbloat; usar AQM (FQ-CoDel/CAKE) e shaping um pouco abaixo da velocidade do link',
          'Window scaling desativado; aumentar o MSS'
        ], 'Fila longa no gargalo = bufferbloat; AQM e shaping controlam o atraso. Jumbo não ajuda na internet.'),
        mcq('q6', 'Em um túnel, conexões fecham o handshake, mas a transferência de arquivos grandes trava. Que causa e correção?', 'b', [
          'Falta de ECN; ativá-lo',
          'Blackhole de PMTUD (ICMP bloqueado); liberar os ICMP necessários e/ou fazer MSS clamping',
          'TTL muito baixo; aumentar',
          'Hash polarization; mudar a seed'
        ], 'Pacotes pequenos passam; os grandes são descartados sem aviso. Solução: ICMP e MSS clamping.'),
        mcq('q7', 'Por que um único fluxo grande de transferência não usa a banda somada de 4 caminhos ECMP?', 'c', [
          'Porque o ECMP só funciona com UDP',
          'Porque o BBR não suporta ECMP',
          'Porque o hash da 5-tupla mantém cada conexão em um só caminho',
          'Porque o MTU é diferente em cada caminho'
        ], 'O ECMP distribui por fluxo, não por pacote, para evitar reordenação; vários fluxos usam vários caminhos.'),
        fill('q8', 'Qual o MSS de uma conexão TCP sobre IPv4 com MTU de 1500 (sem opções)?', 'MSS = 1500 - 20 - 20 = ___', ['1460'], 'MTU 1500 menos IP (20) e TCP (20) = 1460 bytes.')
      ]
    },
    {
      id: 'rda-15-wan-sdwan',
      title: 'WAN e SD-WAN',
      goal: 'Comparar as opções de WAN (dedicado, MPLS, internet, metro Ethernet) e entender a arquitetura SD-WAN, a seleção de caminho por SLA, ZTP, SASE, QoS e custos/riscos.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Opções de WAN',
            'Linha dedicada (leased line): circuito ponto a ponto exclusivo entre dois sites, banda garantida e simétrica, SLA forte e custo alto. MPLS (L3VPN): serviço da operadora que liga todos os sites em uma VPN any-to-any, com SLA e QoS por classe, mas custo elevado por Mbps e provisionamento lento. Internet: banda larga comum (best effort, barata, sem garantia) ou DIA (Dedicated Internet Access), com banda e SLA contratados e mais caro; serve de transporte para VPNs IPsec. Metro Ethernet (serviços MEF) entrega Ethernet em área metropolitana: E-Line (ponto a ponto), E-LAN (multiponto, como uma LAN) e E-Tree (raiz e folhas). 4G/5G: backup ou acesso temporário.'
          ),
          sl(
            'Comparando e combinando',
            'Critérios de comparação: custo por Mbps, SLA (disponibilidade, latência, perda), previsibilidade de latência, prazo de provisionamento (circuitos dedicados levam semanas ou meses; internet, dias), flexibilidade e cobertura. Nenhuma opção domina: MPLS é previsível e caro; a internet é barata e variável. Por isso as redes combinam transportes (híbrido): por exemplo, MPLS para voz e aplicações críticas e internet para tráfego geral, e backup 4G/5G; o difícil era usar bem essa mistura, o que leva ao SD-WAN.'
          ),
          sl(
            'Arquitetura do SD-WAN',
            'O SD-WAN aplica a ideia do SDN (separação de planos) à WAN. Em cada site há um equipamento de borda (edge, físico ou virtual); o plano de controle e as políticas ficam em controladores/orquestrador centralizados, que distribuem rotas, chaves e políticas; o overlay é uma malha de túneis criptografados (normalmente IPsec) entre as bordas, que opera por cima de qualquer transporte (MPLS, banda larga, 4G/5G): o underlay passa a ser uma commodity e a aplicação enxerga a rede overlay. O operador define as intenções e políticas em um único ponto (GUI/API), em vez de configurar cada roteador. O plano de gerenciamento e a telemetria também são centralizados.',
            'Site A (edge) ==[túnel IPsec overlay]== Site B (edge)\n   |-- MPLS (underlay 1)\n   |-- Banda larga (underlay 2)\n   |-- 4G (underlay 3)          <- o overlay usa todos'
          ),
          sl(
            'Seleção de caminho por política e SLA',
            'O SD-WAN mede continuamente cada túnel/transporte com sondas ativas, obtendo latência, jitter e perda. As políticas ligam aplicações (identificadas por porta, endereço, domínio ou inspeção) a requisitos de SLA e preferências de caminho. Por exemplo: voz exige latência e jitter baixos e perda mínima, e usa preferencialmente o MPLS, com fallback para a internet; o backup noturno usa o caminho mais barato. Se um caminho deixa de cumprir o SLA, o tráfego muda para outro, em geral em menos de um segundo, sem derrubar sessões. Recursos adicionais: balanceamento de carga por fluxo entre transportes, correção de erros (FEC) e duplicação de pacotes em enlaces ruins.',
            'política VOZ:  SLA latência<150 ms, jitter<30 ms, perda<1%\n               preferido: MPLS; reserva: banda larga\npolítica BACKUP: preferido: banda larga (mais barato)'
          ),
          sl(
            'ZTP e segurança integrada: SASE',
            'ZTP (Zero Touch Provisioning): o equipamento novo é ligado à internet, contacta o orquestrador (por uma URL de fábrica ou DHCP), é autenticado (número de série, certificado do fabricante) e baixa a configuração sozinho, sem técnico especializado no site. Risco: onboarding indevido, portanto o orquestrador só deve aceitar dispositivos previamente registrados (allowlist de seriais) e com autenticação forte. Segurança integrada: túneis cifrados, segmentação (VRFs/segmentos por tipo de tráfego), firewall embutido e breakout local para a internet e para SaaS (acesso direto em vez de voltar ao data center). SASE (Secure Access Service Edge) combina SD-WAN com serviços de segurança em nuvem entregues em PoPs (SWG, CASB, ZTNA, FWaaS), aplicando política consistente a qualquer usuário e local sob a lógica de zero trust.'
          ),
          sl(
            'QoS na WAN',
            'A QoS na WAN classifica o tráfego, marca com DSCP (voz costuma usar EF, valor 46), enfileira por classe (prioridade para voz, banda garantida para dados críticos) e faz shaping na velocidade contratada do circuito, para que a fila se forme no seu equipamento (onde você controla) e não no da operadora. Na MPLS, a operadora honra as classes contratadas; na internet pública, não há garantia fim a fim, e a QoS só vale no seu egress; por isso o SD-WAN usa medição e seleção de caminho. Lembre-se do overhead do IPsec/túneis, que reduz o MTU útil: ajuste o MSS (MSS clamping) para evitar fragmentação.',
            'class-map VOZ\n match dscp ef                 ! EF = 46\npolicy-map WAN\n class VOZ\n  priority percent 20'
          ),
          sl(
            'Custos e riscos',
            'Ganhos: substituir parte do MPLS por banda larga reduz o custo por Mbps; provisionamento rápido (ZTP, internet); visibilidade centralizada; resiliência com vários transportes. Riscos e custos escondidos: licenças por dispositivo e por banda; dependência de fornecedor (lock-in); qualidade variável da internet (last mile); troubleshooting em dois planos (overlay e underlay); o orquestrador é um alvo crítico (acesso restrito, MFA, auditoria); a telemetria e a inspeção de aplicações geram metadados de usuários: aplique minimização e retenção conforme a LGPD. Um bom projeto faz piloto, define SLAs por aplicação e mantém plano de saída.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma empresa quer ligar cinco filiais em uma só LAN lógica, como se fosse um grande switch, pela rede da operadora. Qual serviço de Metro Ethernet atende?', 'c', [
          'E-Line',
          'E-Tree com uma única raiz',
          'E-LAN',
          'Linha dedicada ponto a ponto entre cada par'
        ], 'E-LAN é o serviço multiponto, onde todos os sites se comunicam entre si; E-Line é ponto a ponto.'),
        mcq('q2', 'No SD-WAN, o que é o overlay?', 'd', [
          'O circuito físico da operadora',
          'O painel gráfico do orquestrador',
          'O protocolo de roteamento da operadora',
          'A malha de túneis criptografados entre as bordas, independente do transporte (underlay)'
        ], 'O overlay roda por cima de MPLS, banda larga ou 4G/5G, que são o underlay.'),
        mcq('q3', 'Como o SD-WAN decide por qual transporte enviar a voz?', 'a', [
          'Medindo latência, jitter e perda de cada caminho e aplicando a política/SLA da aplicação',
          'Sempre pelo caminho com mais banda',
          'Escolhendo aleatoriamente a cada pacote',
          'Usando só o menor custo OSPF'
        ], 'Sondas ativas verificam o SLA, e a política da aplicação decide, mudando de caminho se o SLA for violado.'),
        fill('q4', 'Complete o valor numérico do DSCP EF, normalmente usado para voz.', 'ip dscp ___   # EF', ['46'], 'DSCP EF vale 46.'),
        mcq('q5', 'Qual cuidado de segurança é essencial no ZTP?', 'b', [
          'Aceitar qualquer dispositivo que contate o orquestrador',
          'Aceitar apenas dispositivos pré-registrados (serial/certificado), com autenticação forte',
          'Desligar a criptografia dos túneis na instalação',
          'Usar a mesma senha em todos os sites'
        ], 'O onboarding precisa validar a identidade do dispositivo; o ZTP aberto permitiria que equipamentos de terceiros entrassem na rede.'),
        mcq('q6', 'O que caracteriza o SASE?', 'a', [
          'SD-WAN combinado com segurança entregue em nuvem (SWG, CASB, ZTNA, FWaaS) em PoPs',
          'Substituir a internet por MPLS',
          'Uma nova versão do OSPF',
          'Exclusivamente um tipo de firewall de hardware'
        ], 'SASE converge rede e segurança como serviço de nuvem, aplicando política a qualquer usuário e local.'),
        mcq('q7', 'Qual afirmação sobre custos e riscos do SD-WAN é correta?', 'd', [
          'Elimina qualquer necessidade de licenciamento',
          'A qualidade da internet deixa de importar',
          'O orquestrador não precisa de proteção especial',
          'Pode reduzir o custo por Mbps, mas traz lock-in, licenças e troubleshooting em overlay e underlay'
        ], 'O ganho de custo é real, mas há dependência do fornecedor, licenças e mais camadas para depurar.'),
        fill('q8', 'Complete a palavra: ZTP significa Zero ___ Provisioning.', 'ZTP = Zero ___ Provisioning', ['touch'], 'Zero Touch Provisioning: o dispositivo se configura sozinho ao se conectar.')
      ]
    },
    {
      id: 'rda-33-nuvem-hibrida-avancada',
      title: 'Redes em nuvem avançadas e conectividade híbrida',
      goal: 'Projetar a rede de várias redes virtuais de nuvem e do ambiente local, com topologia, endereçamento sem sobreposição, acesso privado, DNS híbrido, controle de saída, observabilidade e conformidade com a LGPD.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Hub-and-spoke, peering e transit gateway',
            'Uma rede virtual de nuvem (VPC/VNet; os nomes variam por provedor) é uma rede privada isolada. Com várias delas, é preciso ligá-las. O PEERING liga duas redes diretamente e é simples, mas NÃO é transitivo: se A tem peering com B e B com C, A não alcança C passando por B. Para ligar todas entre si por peering, com n redes você precisa de n(n-1)/2 conexões: 6 redes pedem 15, e o número cresce de forma quadrática, ficando difícil de operar. A alternativa é a topologia hub-and-spoke: cada rede (spoke) se liga a um ponto central (o hub), um transit gateway (ou serviço equivalente do provedor). Com 6 redes são só 6 conexões; o hub concentra roteamento, segurança compartilhada e a ligação com o ambiente local, e as tabelas de rotas do hub controlam quem conversa com quem.',
            'Peering em malha (6 redes): 15 conexões\nHub-and-spoke (6 spokes): 6 conexões ao transit gateway\n\nSpoke A ---\nSpoke B ----> [ Transit Gateway ] ---- Datacenter local\nSpoke C ---/'
          ),
          sl(
            'Planejamento de CIDR sem sobreposição',
            'Redes só podem ser conectadas por roteamento se os blocos de endereços NÃO se sobrepõem. Duas redes que usam o mesmo 10.0.0.0/16 não conseguem se alcançar: o roteador não sabe a qual das duas o destino pertence. Isso vale também para o datacenter local e para fusões de empresas. A sobreposição é muito cara de corrigir depois (exige renumerar ou usar NAT em lugares incômodos). Regras de planejamento: mantenha um plano único de endereçamento (IPAM, a planilha ou ferramenta que registra os blocos), reserve blocos por ambiente e região, deixe espaço para crescer e use endereços privados (RFC 1918: 10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16). Atenção: 172.16.0.0/12 vai de 172.16.0.0 a 172.31.255.255, então um 172.20.0.0/16 está dentro dele e se sobrepõe.'
          ),
          sl(
            'Acesso privado a serviços e controle de saída',
            'Serviços gerenciados do provedor (armazenamento, bancos) normalmente têm endereço público. Um ENDPOINT PRIVADO (private link) cria, dentro da sua rede, uma interface com IP privado que leva ao serviço pela rede do provedor, sem passar pela internet pública; o recurso nem precisa de acesso à internet, e você pode restringi-lo por políticas. Já para a SAÍDA para a internet (egress) de recursos privados usa-se um NAT gateway (só inicia conexões de dentro para fora, sem aceitar conexões de entrada). Para controlar e auditar a saída, centraliza-se o tráfego em um firewall de nuvem (inspeção centralizada) no hub: todo spoke envia seu tráfego de saída por ele, que aplica listas de destinos permitidos, filtragem por nome (FQDN) e logs. O princípio é permitir só o necessário, e não deixar toda sub-rede sair livremente.'
          ),
          sl(
            'Conectividade híbrida: VPN e linha dedicada',
            'A conexão entre a nuvem e o ambiente local (híbrida) tem duas opções. VPN IPsec site a site: túneis cifrados pela internet; rápida de provisionar e barata, mas latência e capacidade variam, pois dependem da internet pública. Linha dedicada (conexão privada contratada com operadora, p. ex. serviços chamados Direct Connect, ExpressRoute ou Interconnect, só como exemplo): caminho privado de latência mais previsível e banda garantida, mas prazo e custo maiores; não é criptografada por padrão, então dados sensíveis pedem criptografia adicional (como IPsec sobre ela). Resiliência: use pelo menos DOIS túneis por conexão, em equipamentos e caminhos distintos, e combine as opções (dedicada como principal e VPN como reserva). Roteamento dinâmico com BGP sobre a VPN ou linha anuncia as redes e faz o failover automaticamente, em vez de rotas estáticas manuais.'
          ),
          sl(
            'DNS híbrido',
            'Na nuvem, o DNS padrão resolve nomes das redes virtuais e de serviços do provedor; no local, os servidores corporativos resolvem os nomes internos (por exemplo, intranet.exemplo.interno). Sem integração, a nuvem não resolve nomes locais, e vice-versa. O DNS híbrido resolve isso com resolvers com encaminhamento condicional: um resolver de saída (outbound) na nuvem encaminha as consultas do domínio local para os DNS corporativos pela conexão híbrida, e um resolver de entrada (inbound) recebe as consultas vindas do local para nomes da nuvem. A regra é por domínio, nunca "encaminhar tudo". Cuide para não criar laços de encaminhamento, e lembre que o DNS local depende da conexão: se o link cair, os nomes não resolvem, então planeje redundância.'
          ),
          sl(
            'Observabilidade, custos, segurança e LGPD',
            'Flow logs registram os fluxos aceitos e rejeitados (IPs de origem e destino, portas, protocolo, volume) das interfaces de rede da nuvem: úteis para diagnóstico, auditoria e detecção de anomalias, sem o conteúdo. CUSTO: o provedor costuma cobrar o tráfego entre zonas de disponibilidade, entre regiões e para a internet, e o processamento em gateways (conceito: o desenho com muito tráfego cruzando zonas ou passando por hubs pode custar caro e aumentar a latência; estude o modelo de preços do provedor). SEGURANÇA: o menor privilégio também vale para ROTAS: só propague para cada spoke as rotas de que ele precisa, segmente por ambiente (produção separada de teste) e use grupos de segurança restritivos. LGPD: os flow logs contêm endereços IP, que são dado pessoal quando identificam alguém; defina finalidade, acesso restrito e retenção. A região escolhida define onde os dados ficam fisicamente; transferência internacional de dados pessoais exige base legal e cuidados, então a localização é decisão de projeto, e não padrão do console.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma empresa tem 6 redes virtuais na nuvem e quer que todas se comuniquem por peering direto, em malha completa. Quantas conexões de peering serão necessárias?', 'd', [
          '6, uma por rede',
          '12',
          '36',
          '15, pela fórmula n(n-1)/2, o que cresce quadraticamente com o número de redes'
        ], '6 x 5 / 2 = 15. Por isso se usa o transit gateway: 6 conexões ao hub.'),
        mcq('q2', 'Qual par de blocos de endereços pode ser conectado por roteamento, sem sobreposição?', 'b', [
          '10.1.0.0/16 e 10.1.128.0/17',
          '10.2.0.0/16 e 10.3.0.0/16',
          '10.0.0.0/16 e 10.0.0.0/16',
          '172.16.0.0/12 e 172.20.0.0/16'
        ], '10.2.0.0/16 e 10.3.0.0/16 são disjuntos. A /17 está dentro da /16, e 172.20.0.0/16 está dentro de 172.16.0.0/12 (172.16 a 172.31).'),
        mcq('q3', 'Como permitir que recursos de uma sub-rede privada usem um serviço gerenciado do provedor sem passar pela internet pública e com saída controlada para o resto?', 'c', [
          'Atribuir IP público a todos os recursos e liberar todo o tráfego de saída',
          'Desativar o DNS da rede virtual',
          'Endpoint privado para o serviço gerenciado e saída para a internet somente por NAT gateway e firewall central, com listas de destinos permitidos',
          'Ligar todas as redes por peering e remover as tabelas de rotas'
        ], 'O endpoint privado dá IP interno ao serviço; a saída fica sob controle de NAT e inspeção central, permitindo só o necessário.'),
        fill('q4', 'Complete: o peering de redes virtuais NÃO é ___ (A-B e B-C não dão a A acesso a C).', 'peering não é ___', ['transitivo', 'transitiva'], 'Sem transitividade, é preciso peering direto ou um hub (transit gateway) para A alcançar C.'),
        mcq('q5', 'Qual desenho híbrido oferece mais resiliência entre a nuvem e o datacenter local?', 'a', [
          'Pelo menos dois túneis em equipamentos e caminhos distintos (ou dedicada mais VPN), com BGP anunciando as redes e fazendo failover',
          'Um único túnel com rotas estáticas manuais',
          'Uma linha dedicada sem reserva, pois ela nunca falha',
          'VPN apenas, com um só equipamento, para simplificar'
        ], 'Redundância de caminhos e de equipamentos mais roteamento dinâmico dão failover automático. A linha dedicada também pode cair.'),
        mcq('q6', 'Como a nuvem passa a resolver nomes internos do datacenter (intranet.exemplo.interno) em um DNS híbrido?', 'd', [
          'Copiando manualmente os nomes para o arquivo hosts de cada instância',
          'Encaminhando todo o DNS da nuvem para a internet pública',
          'Trocando o domínio interno por um domínio público',
          'Um resolver da nuvem com encaminhamento condicional por domínio, enviando as consultas do domínio local aos DNS corporativos pela conexão híbrida'
        ], 'A regra é por domínio: só as consultas do domínio local vão aos servidores corporativos, pela VPN ou linha dedicada.'),
        mcq('q7', 'Qual afirmação sobre custo e inspeção de saída está correta?', 'c', [
          'Tráfego entre zonas e regiões nunca é cobrado',
          'Um firewall central dispensa regras de menor privilégio',
          'Centralizar a saída em um firewall no hub facilita controle e auditoria, mas o desenho com muito tráfego cruzando zonas, regiões ou gateways pode aumentar custo e latência',
          'O NAT gateway aceita conexões iniciadas de fora para dentro'
        ], 'A inspeção central dá controle, mas o tráfego extra paga processamento e transferência; o NAT gateway só inicia conexões para fora.'),
        fill('q8', 'Complete: os flow logs registram endereços ___ de origem e destino, que podem ser dado pessoal pela LGPD.', 'flow logs: endereços ___ de origem e destino', ['IP', 'IPs'], 'IP identifica alguém quando combinado com outros dados: finalidade, acesso restrito, retenção definida e escolha consciente da região de armazenamento.')
      ]
    },
    {
      id: 'rda-16-wifi-6-7-planejamento',
      title: 'Wi-Fi 6/6E/7 e planejamento de RF',
      goal: 'Entender os recursos do Wi-Fi moderno e planejar cobertura e capacidade de uma rede sem fio corporativa.',
      xp: 30,
      intro: {
        slides: [
          sl('Gerações do Wi-Fi', 'Wi-Fi 5 é o 802.11ac, Wi-Fi 6 é o 802.11ax e Wi-Fi 7 é o 802.11be. O Wi-Fi 6E é o Wi-Fi 6 estendido para a banda de 6 GHz, que traz muito espectro novo e livre de dispositivos antigos. O foco do Wi-Fi 6 não é só velocidade de pico: é eficiência quando há MUITOS clientes disputando o ar.'),
          sl('OFDMA e MU-MIMO', 'OFDMA divide o canal em fatias menores (resource units) e permite que o AP atenda vários clientes na MESMA transmissão; é ótimo para muitos pacotes pequenos (voz, IoT, mensagens). MU-MIMO usa várias antenas e fluxos espaciais para o AP falar com vários clientes ao mesmo tempo, em direções diferentes. Resumo: OFDMA reparte frequência; MU-MIMO reparte espaço.'),
          sl('BSS coloring e 6 GHz', 'Em ambientes densos, APs vizinhos no mesmo canal se atrapalham: cada um espera o outro terminar. O BSS coloring põe uma "cor" (número pequeno) no cabeçalho dos quadros; o dispositivo reconhece que o quadro é de OUTRA BSS e pode reutilizar o meio (spatial reuse) em vez de esperar. Na banda de 6 GHz há mais canais largos e sem clientes legados, mas o alcance é menor e o WPA3 é obrigatório.'),
          sl('Cobertura, capacidade e canais', 'Planejar não é só "ter sinal": é dimensionar capacidade pelo número de clientes e pelo tráfego deles. Em alta densidade usam-se MAIS APs com potência REDUZIDA (células pequenas) e canais estreitos, para reutilizar canais sem co-canal interferente. Em 2,4 GHz com canais de 20 MHz só há três canais sem sobreposição: 1, 6 e 11. Mais potência não resolve: o cliente "ouve" o AP, mas o AP não ouve o cliente fraco.', 'Auditório: 1 AP de alta potência  ->  sofre\nAuditório: vários APs, potência baixa, canais diferentes  ->  melhor'),
          sl('Site survey e controladores', 'Site survey mede o ambiente: o preditivo usa a planta e um modelo (antes de instalar); o passivo ouve sinais e ruído; o ativo associa-se à rede e mede vazão. Ferramentas incluem analisadores de espectro e software de mapeamento de calor. Em redes maiores, um controlador (WLC) gerencia APs leves: concentra configuração, política, ajuste automático de rádio e roaming, em vez de configurar AP por AP.'),
          sl('Roaming e segurança enterprise', 'Para o cliente trocar de AP sem queda: 802.11k (o AP informa uma lista de vizinhos candidatos), 802.11v (o AP sugere ao cliente para qual AP ir) e 802.11r (Fast BSS Transition: acelera a troca de chaves ao mudar de AP). Na segurança, WPA3-Enterprise autentica cada usuário por 802.1X/RADIUS (não há senha única compartilhada). Um rogue AP é um ponto de acesso não autorizado (ou que imita seu SSID) ligado à rede; WIDS/WIPS e o controlador ajudam a detectá-lo.')
        ]
      },
      questions: [
        mcq('q1', 'O que o Wi-Fi 6E acrescenta ao Wi-Fi 6?', 'c', ['Substitui o 802.11ax por um padrão sem canais', 'Elimina a necessidade de segurança WPA', 'Operação também na banda de 6 GHz', 'Obriga o uso apenas da banda de 2,4 GHz'], 'O 6E é o Wi-Fi 6 operando também em 6 GHz, com mais canais e sem clientes legados.'),
        mcq('q2', 'Qual é a diferença entre OFDMA e MU-MIMO?', 'a', ['OFDMA divide o canal em fatias de frequência; MU-MIMO usa fluxos espaciais distintos', 'OFDMA cria cores nos quadros; MU-MIMO criptografa os dados', 'OFDMA só existe em 2,4 GHz; MU-MIMO só em 5 GHz', 'São o mesmo recurso com nomes diferentes'], 'OFDMA reparte frequência (resource units); MU-MIMO reparte espaço com múltiplos fluxos.'),
        mcq('q3', 'Para que serve o BSS coloring?', 'd', ['Criptografar o SSID com uma cor secreta', 'Aumentar a potência do AP em canais ocupados', 'Separar VLANs no AP', 'Identificar a BSS de origem e permitir reutilizar o meio mesmo com vizinhos no mesmo canal'], 'A cor no cabeçalho indica que o quadro é de outra BSS, habilitando o spatial reuse.'),
        fill('q4', 'Em 2,4 GHz, com canais de 20 MHz, os canais sem sobreposição usados são 1, 6 e qual?', 'Canais: 1, 6, ___', ['11'], 'Os canais 1, 6 e 11 não se sobrepõem em 20 MHz.'),
        mcq('q5', 'Um auditório com muitos clientes simultâneos apresenta lentidão. Qual abordagem de planejamento é mais adequada?', 'b', ['Um único AP com a maior potência possível', 'Mais APs com potência reduzida, canais bem distribuídos e células pequenas', 'Todos os APs no mesmo canal para simplificar', 'Desativar o 5 GHz e usar só 2,4 GHz'], 'Capacidade se obtém com células pequenas e reutilização planejada de canais, não com potência.'),
        mcq('q6', 'Qual emenda 802.11 acelera a troca de chaves ao fazer roaming entre APs?', 'd', ['802.11k', '802.11v', '802.11e', '802.11r'], 'O 802.11r (Fast BSS Transition) acelera a troca de chaves. O k informa vizinhos e o v sugere o AP.'),
        mcq('q7', 'Qual é a vantagem de um controlador (WLC) com APs leves?', 'c', ['Dispensa o uso de cabos nos APs', 'Aumenta o alcance de cada AP sem custos', 'Centraliza configuração, política, ajuste de rádio e roaming', 'Elimina a necessidade de site survey'], 'O WLC centraliza o gerenciamento da WLAN; ele não substitui o survey nem muda a física do rádio.'),
        fill('q8', 'Como se chama um ponto de acesso não autorizado conectado à rede (ou imitando seu SSID)?', 'AP ___', ['rogue', 'pirata', 'falso'], 'Rogue AP é o ponto de acesso não autorizado; WIDS/WIPS ajudam a detectá-lo.')
      ]
    },
    {
      id: 'rda-17-redes-moveis-5g-lpwan',
      title: 'Redes móveis, 5G e LPWAN',
      goal: 'Compreender a arquitetura celular, as variantes do 5G, a privacidade dos identificadores e quando usar LoRaWAN ou NB-IoT.',
      xp: 30,
      intro: {
        slides: [
          sl('RAN e núcleo', 'Uma rede celular tem duas grandes partes. A RAN (rede de acesso por rádio) é formada pelas estações base que falam com o aparelho: eNodeB no 4G/LTE e gNodeB (gNB) no 5G. O núcleo (EPC no 4G, 5GC no 5G) autentica o assinante, cria a sessão de dados, aplica políticas e conecta à internet.'),
          sl('Handover', 'Ao se mover, o aparelho precisa trocar de célula sem derrubar a sessão. O handover transfere a conexão da célula de origem para a de destino de forma coordenada pela rede, enquanto o aparelho mede os sinais vizinhos. Para o usuário a chamada ou a sessão de dados continua; falhas de handover aparecem como quedas ao circular.'),
          sl('5G NSA e SA', 'No 5G NSA (non-standalone) o rádio 5G é ancorado no núcleo e na sinalização do 4G, o que acelerou a implantação. No 5G SA (standalone) existe o núcleo 5G completo, requisito para recursos nativos como o network slicing. Na prática: NSA = rádio novo com núcleo antigo; SA = tudo 5G.'),
          sl('Network slicing', 'Slicing cria "fatias" lógicas e isoladas da mesma infraestrutura física, cada uma com requisitos próprios: uma fatia de baixa latência para controle industrial, outra de alta banda para vídeo, outra para milhões de sensores. É conceito de rede virtualizada que depende do núcleo 5G (SA).'),
          sl('SIM, eSIM e privacidade', 'O IMSI identifica o assinante dentro do SIM; o IMEI identifica o aparelho. Ambos são dados pessoais ou permitem identificar e rastrear uma pessoa, então coleta, logs e retenção seguem a LGPD (finalidade, necessidade, segurança). Equipamentos falsos de estação base (IMSI catchers) exploram a captura desses identificadores; no 5G o identificador é enviado cifrado (SUCI). O eSIM é um SIM embutido em que o perfil da operadora é baixado remotamente.'),
          sl('LPWAN: LoRaWAN e NB-IoT', 'LPWAN atende sensores com poucos bytes, bateria por anos e longo alcance. LoRa é a modulação de rádio (camada física); LoRaWAN é o protocolo de rede sobre ela, com gateways, servidor de rede, banda sem licença e criptografia. Você pode montar a rede própria sem operadora. NB-IoT é celular: usa espectro LICENCIADO da operadora, boa penetração em ambientes fechados e depende de cobertura e contrato da operadora. Nenhum serve para vídeo ou voz.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre 5G NSA e 5G SA?', 'b', ['NSA usa apenas ondas milimétricas; SA usa só sub-6 GHz', 'NSA usa rádio 5G ancorado no núcleo 4G; SA usa núcleo 5G completo', 'NSA é 5G sem rádio; SA é 5G com rádio', 'NSA é privado e SA é público'], 'NSA reaproveita o núcleo 4G; SA tem núcleo 5G, necessário ao slicing nativo.'),
        mcq('q2', 'Por que o IMSI exige cuidado do ponto de vista da LGPD?', 'd', ['Porque é uma senha de rede Wi-Fi', 'Porque só existe em redes 2G', 'Porque identifica o aparelho apenas pela marca', 'Porque identifica o assinante e permite rastrear uma pessoa, sendo dado pessoal'], 'IMSI e IMEI permitem identificar/rastrear pessoas: coleta mínima, retenção curta e segurança.'),
        mcq('q3', 'O que é network slicing?', 'a', ['Criar fatias lógicas isoladas da mesma infraestrutura, com requisitos distintos', 'Dividir o sinal em duas bandas de frequência', 'Cortar o tráfego de um assinante inadimplente', 'Dividir o IP em sub-redes menores'], 'Slicing = redes virtuais isoladas sobre infraestrutura comum, ex.: baixa latência x alta banda.'),
        fill('q4', 'No 5G, como se chama a estação base (equivalente ao eNodeB do 4G)?', 'Estação base 5G: ___', ['gNodeB', 'gNB'], 'No 5G a estação base é o gNodeB (gNB).'),
        mcq('q5', 'O que o handover garante?', 'c', ['Que o aparelho troque de operadora automaticamente', 'Que o aparelho descarregue menos bateria', 'Que a sessão continue ao mudar de célula, de forma coordenada pela rede', 'Que o IMSI seja alterado a cada chamada'], 'Handover transfere a conexão entre células mantendo a sessão.'),
        mcq('q6', 'Qual é a relação entre LoRa e LoRaWAN?', 'b', ['São sinônimos', 'LoRa é a modulação de rádio; LoRaWAN é o protocolo de rede construído sobre ela', 'LoRaWAN é a modulação; LoRa é o servidor de rede', 'LoRa é celular e LoRaWAN é cabeado'], 'LoRa é camada física; LoRaWAN define a rede (gateways, servidor, segurança).'),
        mcq('q7', 'Sensores de umidade em uma fazenda sem cobertura celular, com bateria de longa duração e poucos bytes por envio. Qual tecnologia é a mais natural?', 'a', ['LoRaWAN com gateway próprio', '5G SA com slicing de vídeo', 'Wi-Fi 6E em 6 GHz', 'NB-IoT sem cobertura de operadora'], 'LoRaWAN permite rede própria e baixo consumo; NB-IoT depende de cobertura da operadora.'),
        fill('q8', 'O NB-IoT opera em espectro licenciado ou não licenciado?', 'NB-IoT: espectro ___', ['licenciado', 'licenciada'], 'NB-IoT é celular e usa espectro licenciado da operadora; o LoRaWAN usa banda sem licença.')
      ]
    },
    {
      id: 'rda-18-redes-industriais-iot',
      title: 'Redes industriais e IoT',
      goal: 'Distinguir IT de OT, conhecer os protocolos industriais e de IoT e proteger ambientes com sistemas legados.',
      xp: 30,
      intro: {
        slides: [
          sl('IT versus OT', 'IT (tecnologia da informação) cuida de dados e escritórios; OT (tecnologia operacional) controla processos físicos: máquinas, válvulas, linhas de produção. Em IT a prioridade costuma ser confidencialidade; em OT, DISPONIBILIDADE e segurança física: parar uma linha ou abrir uma válvula errada tem custo alto. Equipamentos OT duram décadas e muitas vezes não podem ser atualizados ou reiniciados com facilidade.'),
          sl('Protocolos industriais', 'Modbus TCP é um protocolo simples cliente/servidor (mestre/escravo) sobre TCP, porta 502, SEM autenticação nem criptografia nativas: quem alcança a porta pode ler e escrever registradores. PROFINET e EtherNet/IP são protocolos industriais sobre Ethernet, com comportamento de tempo real. OPC UA é um padrão de interoperabilidade com modelo de informação e segurança embutida (autenticação, assinatura e criptografia).', 'Cliente --TCP 502--> CLP\n  "ler registradores 0..9"  /  "escrever registrador 5"'),
          sl('TSN', 'TSN (Time-Sensitive Networking) é um conjunto de extensões do Ethernet padrão que traz latência determinística: sincronização precisa de relógio, agendamento de transmissão e reserva de recursos, para que tráfego crítico e comum convivam na mesma rede. É visão geral: a ideia é previsibilidade, não apenas velocidade.'),
          sl('MQTT e CoAP', 'MQTT é publicação/assinatura: dispositivos publicam em tópicos e se inscrevem; um broker intermedia. Roda sobre TCP, porta 1883 (sem criptografia) ou 8883 (com TLS), e tem níveis de QoS 0, 1 e 2. CoAP é um protocolo parecido com HTTP (GET/PUT, REST), porém sobre UDP, porta 5683, pensado para dispositivos muito restritos.', 'mosquitto_pub -h broker.exemplo.lan -p 8883 \\\n  -t fabrica/linha1/temperatura -m 71.5 --cafile ca.pem'),
          sl('Segmentação IT/OT: Purdue e DMZ', 'O modelo Purdue organiza em níveis: processo físico (sensores/atuadores), controle (CLPs), supervisão (SCADA/HMI), operações da planta e empresa (IT). Entre IT e OT coloca-se uma DMZ industrial, onde ficam servidores de troca (historiador, jump host, patch). Nada de IT conversa direto com o controle: o tráfego passa pela DMZ e por firewalls, com regras mínimas.'),
          sl('Legados, IoT e LGPD', 'Para sistemas legados sem patch: isolar em segmentos, permitir só o tráfego necessário, usar monitoramento PASSIVO (varredura ativa pode travar equipamentos antigos), controlar acesso remoto por bastion e manter backup de configurações. Em IoT: trocar senhas padrão, atualizar firmware, usar TLS. Dados de sensores podem virar dados pessoais (câmeras, ocupação de salas, wearables): colete o mínimo, defina retenção e proteja conforme a LGPD.')
        ]
      },
      questions: [
        mcq('q1', 'Em ambientes OT, qual prioridade costuma pesar mais que em IT corporativo?', 'd', ['Confidencialidade acima de tudo', 'Estética das interfaces', 'Troca frequente de equipamentos', 'Disponibilidade e segurança física dos processos'], 'Em OT parar o processo ou comandar errado causa dano físico e financeiro.'),
        mcq('q2', 'Qual tecnologia estende o Ethernet para dar latência determinística, com relógio sincronizado e tráfego agendado?', 'c', ['MQTT', 'CoAP', 'TSN', 'Modbus'], 'TSN traz sincronização e agendamento para previsibilidade em Ethernet.'),
        mcq('q3', 'Qual afirmação sobre OPC UA e Modbus TCP é correta?', 'b', ['Ambos trazem criptografia obrigatória', 'OPC UA tem segurança embutida; Modbus TCP não tem autenticação nem criptografia nativas', 'Modbus TCP usa UDP e OPC UA usa serial', 'OPC UA é um tipo de fio de rede'], 'Modbus TCP é simples e sem segurança nativa; OPC UA inclui autenticação, assinatura e criptografia.'),
        fill('q4', 'Qual é a porta TCP padrão do Modbus TCP?', 'Modbus TCP: porta ___', ['502'], 'Modbus TCP usa a porta 502.'),
        mcq('q5', 'No modelo Purdue, onde se coloca a DMZ industrial?', 'a', ['Entre a rede IT e a rede OT', 'Dentro do CLP', 'Entre o sensor e o atuador', 'Fora da empresa, na internet'], 'A DMZ industrial é a zona de troca entre IT e OT, com firewalls dos dois lados.'),
        mcq('q6', 'Qual par descreve corretamente MQTT e CoAP?', 'c', ['MQTT: UDP, REST; CoAP: TCP, broker', 'MQTT: serial; CoAP: fibra', 'MQTT: publicação/assinatura com broker sobre TCP; CoAP: REST sobre UDP', 'Ambos exigem cabeamento industrial'], 'MQTT usa broker e TCP; CoAP é estilo REST sobre UDP.'),
        mcq('q7', 'Um CLP antigo não recebe patches. Qual conduta é mais adequada?', 'd', ['Expô-lo na internet para suporte remoto', 'Executar um scan agressivo todo dia', 'Ignorar o equipamento no inventário', 'Segmentar, permitir só o tráfego necessário e monitorar de forma passiva'], 'Compense a falta de patch com isolamento, regras mínimas e monitoramento passivo.'),
        fill('q8', 'Qual é a porta padrão do MQTT sobre TLS?', 'MQTT com TLS: porta ___', ['8883'], 'A 1883 é MQTT sem criptografia; a 8883 é MQTT sobre TLS.')
      ]
    },
    {
      id: 'rda-19-seguranca-avancada',
      title: 'Segurança avançada de redes',
      goal: 'Combinar controles em camadas (IPS, WAF, SIEM, NAC, Zero Trust) para reduzir riscos e proteger dados pessoais em logs.',
      xp: 30,
      intro: {
        slides: [
          sl('Defesa em profundidade', 'Nenhum controle é infalível, então empilham-se camadas independentes: perímetro, segmentação interna, host, aplicação e dados, mais monitoramento. Se uma camada falha, a seguinte limita o dano. O objetivo é dificultar, detectar e conter, não apenas bloquear na borda.'),
          sl('IDS, IPS, NGFW e WAF', 'IDS detecta e alerta (fica fora do caminho, copia o tráfego); IPS fica inline e BLOQUEIA o que casa com a regra. Snort e Suricata são motores de código aberto baseados em regras/assinaturas; falsos positivos exigem ajuste. NGFW é um firewall que entende aplicação, identidade e pode incluir IPS. O WAF atua na camada 7 sobre HTTP, filtrando padrões como injeção de SQL e XSS; ele ajuda, mas não substitui código seguro.'),
          sl('Mitigação de DDoS', 'Rate limiting limita requisições por origem. Scrubbing desvia o tráfego para centros de limpeza que descartam o ataque e devolvem o legítimo. Anycast espalha o mesmo IP por vários locais para diluir o volume. O RTBH (remotely triggered black hole) manda a borda DESCARTAR todo o tráfego destinado ao IP atacado: sacrifica aquele IP para proteger o resto da rede.'),
          sl('Honeypots e SIEM', 'Honeypot é um sistema isca, sem uso legítimo: qualquer acesso é suspeito e revela técnicas do atacante. O SIEM coleta logs de várias fontes, normaliza, correlaciona eventos (ex.: muitas falhas de login seguidas de sucesso, de outro país) e gera alertas. Logs têm IPs e usuários, que são dados pessoais: aplique minimização, controle de acesso e retenção definida.'),
          sl('NAC, 802.1X e microssegmentação', 'NAC controla quem entra na rede. No 802.1X o dispositivo (suplicante) se autentica ao switch ou AP (autenticador), que consulta um servidor RADIUS; só então a porta é liberada, possivelmente em uma VLAN conforme a política. A microssegmentação aplica regras entre cargas de trabalho (até entre servidores do mesmo segmento) para limitar o movimento lateral após um comprometimento.', 'IEEE 802.1X:\n  suplicante -> autenticador (switch/AP) -> servidor RADIUS'),
          sl('Zero Trust, bastion e vulnerabilidades', 'Zero Trust: "nunca confie, sempre verifique". Nenhuma localização é confiável por padrão; cada acesso é autenticado e autorizado por identidade, estado do dispositivo e contexto, com mínimo privilégio e premissa de violação. O bastion (jump host) é o ponto único, endurecido e auditado de acesso administrativo. A gestão de vulnerabilidades é um ciclo: inventariar, varrer, priorizar por risco, corrigir e verificar. A LGPD (art. 46) exige medidas técnicas e administrativas de segurança.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença essencial entre IDS e IPS?', 'a', ['O IPS fica inline e pode bloquear; o IDS detecta e alerta', 'O IDS bloqueia e o IPS só registra', 'O IDS só atua em Wi-Fi', 'Não há diferença prática'], 'IDS observa e alerta; IPS está no caminho do tráfego e bloqueia.'),
        mcq('q2', 'Em qual camada o WAF atua e o que ele protege principalmente?', 'b', ['Camada 2, contra loops', 'Camada 7, contra ataques a aplicações web como SQLi e XSS', 'Camada 1, contra interferência', 'Camada 3, contra falhas de roteamento'], 'O WAF analisa HTTP na camada 7; não substitui o código seguro.'),
        mcq('q3', 'O que faz o RTBH em um ataque DDoS?', 'c', ['Duplica o link do alvo', 'Troca o IP do atacante', 'Descarta na borda o tráfego destinado ao IP atacado, protegendo o restante da rede', 'Criptografa o tráfego do ataque'], 'RTBH sacrifica o IP alvo para preservar o resto da rede e do link.'),
        fill('q4', 'Qual padrão IEEE de controle de acesso por porta usa RADIUS? (complete a letra)', 'IEEE 802.1___', ['X', 'x'], '802.1X autentica o dispositivo antes de liberar a porta ou o Wi-Fi.'),
        mcq('q5', 'Qual é a principal função de um SIEM?', 'd', ['Substituir o firewall', 'Distribuir endereços IP', 'Armazenar backups de bancos', 'Coletar e correlacionar logs de várias fontes para gerar alertas'], 'SIEM normaliza e correlaciona eventos de diferentes fontes.'),
        mcq('q6', 'Qual é o princípio central do Zero Trust?', 'a', ['Nunca confiar por localização: verificar identidade, dispositivo e contexto a cada acesso', 'Confiar em tudo que está dentro da rede interna', 'Usar uma única senha forte compartilhada', 'Desligar o firewall interno'], 'Zero Trust elimina a confiança implícita na rede interna.'),
        mcq('q7', 'Qual é o benefício da microssegmentação?', 'd', ['Aumentar a velocidade do link', 'Reduzir o número de VLANs a uma só', 'Substituir a criptografia', 'Limitar o movimento lateral de um atacante entre cargas de trabalho'], 'Regras granulares entre cargas contêm um comprometimento.'),
        fill('q8', 'Como se chama o ponto único, endurecido e auditado de acesso administrativo (jump host)?', '___ host', ['bastion', 'jump'], 'O bastion host concentra e audita o acesso administrativo.')
      ]
    },
    {
      id: 'rda-20-ataques-defesa',
      title: 'Ataques de rede e defesa',
      goal: 'Reconhecer as principais classes de ataque, suas defesas e os limites éticos e legais do teste em laboratório.',
      xp: 30,
      intro: {
        slides: [
          sl('Taxonomia de ataques', 'Para defender, é preciso classificar: reconhecimento (descobrir hosts, portas e serviços), interceptação (MITM: ficar no meio da comunicação), spoofing (forjar identidade: IP, MAC, DNS), negação de serviço (esgotar recursos) e sequestro de roteamento ou nomes (BGP, DNS). Esta lição é DEFENSIVA e conceitual: o objetivo é entender sinais e contramedidas.'),
          sl('Reconhecimento e varredura de portas', 'Varredura de portas descobre serviços abertos. Com o nmap, em laboratório próprio, -sT faz varredura TCP connect (conclui o handshake), -sS envia SYN sem completar, e -p escolhe portas. Sinais para detectar: um mesmo origem tentando muitas portas ou hosts em pouco tempo, visível em firewall, IDS e fluxos. Reduza a superfície: feche o que não usa.', '# SOMENTE em laboratório próprio ou com autorização escrita\nnmap -sT -p 22,80,443 192.168.56.10'),
          sl('Enquadramento ético e legal', 'Testar redes de terceiros sem autorização pode ser crime. No Brasil, a Lei 12.737/2012 incluiu no Código Penal a invasão de dispositivo informático (art. 154-A); o Marco Civil da Internet (Lei 12.965/2014) trata de direitos e deveres no uso da rede. Regra prática: só teste ativos seus ou com autorização por escrito, com escopo e janelas definidos. Isto é visão geral e não substitui orientação jurídica.'),
          sl('Spoofing, MITM e SYN flood', 'No MITM de camada 2, o ARP spoofing faz a vítima associar o IP do gateway ao MAC do atacante; defesas: Dynamic ARP Inspection (DAI) com DHCP snooping, e criptografia ponta a ponta (TLS, HSTS) para que o interceptado seja inútil. No SYN flood o atacante abre muitas conexões incompletas; a defesa clássica são SYN cookies, que evitam reservar estado até o handshake terminar.'),
          sl('Amplificação por UDP e BCP 38', 'No ataque de reflexão e amplificação, o atacante envia uma requisição PEQUENA a um servidor UDP aberto (DNS, NTP, memcached) com o IP de origem FORJADO como o da vítima; o servidor responde com algo muito MAIOR para a vítima. Defesas: não manter resolvers e serviços UDP abertos para a internet, desabilitar o UDP desnecessário (memcached) e o BCP 38 (ingress filtering): o provedor descarta na borda pacotes cuja origem não pertence ao prefixo do cliente, impedindo o forjamento.'),
          sl('Sequestro de BGP e envenenamento de DNS', 'No sequestro de BGP, um AS anuncia prefixos que não são dele e atrai tráfego. Defesas: filtros de prefixo com os vizinhos, validação de origem com RPKI e monitoramento de anúncios. No envenenamento de DNS, o atacante tenta inserir respostas falsas no cache do resolvedor; defesas: ID e porta de origem aleatórios e DNSSEC, que permite validar criptograficamente a resposta.')
        ]
      },
      questions: [
        mcq('q1', 'Como funciona a amplificação por UDP?', 'c', ['O atacante criptografa a requisição para torná-la maior', 'O servidor UDP bloqueia a vítima', 'Uma requisição pequena com origem forjada gera uma resposta muito maior enviada à vítima', 'O atacante aumenta a MTU do enlace'], 'A origem forjada é o IP da vítima, e o servidor responde com muito mais bytes.'),
        mcq('q2', 'Qual é a defesa clássica contra SYN flood?', 'd', ['Liberar todas as portas', 'Aumentar a MTU', 'Desativar o TCP', 'SYN cookies'], 'SYN cookies evitam reservar estado até a conclusão do handshake.'),
        mcq('q3', 'Quais medidas ajudam contra sequestro de BGP?', 'b', ['Aumentar o TTL dos pacotes', 'Filtros de prefixo, validação de origem com RPKI e monitoramento de anúncios', 'Trocar o switch de camada 2', 'Habilitar o Wi-Fi 6E'], 'Prefix filters e RPKI limitam anúncios indevidos.'),
        fill('q4', 'Qual é o número do BCP que recomenda ingress filtering contra IP spoofing?', 'BCP ___', ['38', 'BCP 38'], 'O BCP 38 orienta descartar na borda pacotes com origem fora do prefixo legítimo.'),
        mcq('q5', 'Quando é adequado executar uma varredura com nmap?', 'b', ['Contra qualquer IP da internet para estudo', 'Em laboratório próprio ou em ativos com autorização escrita e escopo definido', 'Apenas à noite, para não ser notado', 'Somente contra redes de concorrentes'], 'Sem autorização pode haver enquadramento na Lei 12.737/2012; teste só com permissão.'),
        mcq('q6', 'Qual tecnologia permite validar criptograficamente as respostas DNS contra envenenamento?', 'a', ['DNSSEC', 'DHCP snooping', 'STP', 'NAT'], 'DNSSEC assina as respostas DNS, permitindo verificar autenticidade e integridade.'),
        mcq('q7', 'Qual recurso de switch ajuda a combater ARP spoofing?', 'c', ['Port mirroring', 'Spanning Tree', 'Dynamic ARP Inspection (DAI)', 'EtherChannel'], 'O DAI valida mensagens ARP com base na tabela do DHCP snooping.'),
        fill('q8', 'Qual flag do nmap faz varredura TCP connect (conclui o handshake)?', 'nmap ___ -p 22,80 192.168.56.10', ['-sT', 'sT'], '-sT faz TCP connect; -sS envia SYN sem completar. Use só em laboratório autorizado.')
      ]
    },
    {
      id: 'rda-21-observabilidade-telemetria',
      title: 'Observabilidade e telemetria de redes',
      goal: 'Medir a rede com telemetria moderna, definir SLIs/SLOs e tratar dados de fluxo respeitando a privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl('Polling versus streaming', 'No monitoramento tradicional por SNMP, o servidor CONSULTA (pull) os contadores a cada minuto ou mais; eventos rápidos entre as consultas se perdem. Na telemetria em streaming, o equipamento ENVIA (push) dados continuamente, por assinatura, com granularidade de segundos ou menos e no modo "a cada mudança" (on-change). Menos custo na CPU do equipamento e visão mais fina.'),
          sl('gNMI e OpenConfig', 'gNMI (gRPC Network Management Interface) é um protocolo para configurar e, principalmente, assinar telemetria, sobre gRPC. OpenConfig são modelos de dados em YANG independentes de fornecedor: o mesmo caminho (ex.: contadores de uma interface) funciona em equipamentos de marcas diferentes, o que simplifica coletores e automação.'),
          sl('Fluxos: sFlow e IPFIX', 'Um fluxo agrupa pacotes com a mesma 5-tupla (IP origem/destino, portas, protocolo). O IPFIX é o padrão do IETF para exportar registros de fluxo (evolução do NetFlow v9). O sFlow usa AMOSTRAGEM: exporta 1 a cada N pacotes e contadores de interface, o que reduz custo em links rápidos. Fluxos mostram QUEM fala com QUEM e quanto, sem o conteúdo.'),
          sl('Métricas, SLIs e SLOs', 'SLI (indicador) é o que se mede: latência, perda de pacotes, disponibilidade do serviço. SLO (objetivo) é a meta sobre o SLI: por exemplo, "99,9% das sondas com perda menor que 1% no mês". Quando o SLO não é cumprido, consome-se o "orçamento de erro" e prioriza-se confiabilidade. Medir o que o usuário sente vale mais que olhar só o uso de CPU do roteador.'),
          sl('Prometheus e exporters', 'O Prometheus faz pull: raspa (scrape) periodicamente métricas expostas em HTTP no caminho /metrics. Equipamentos de rede não falam esse formato, então usam-se exporters: o snmp_exporter traduz SNMP em métricas e o blackbox_exporter faz sondas de fora (ICMP, TCP, HTTP, DNS) para medir disponibilidade e latência como o cliente vê.', 'scrape_configs:\n  - job_name: snmp\n    metrics_path: /snmp\n    static_configs:\n      - targets: [192.0.2.1]   # roteador de documentação'),
          sl('Capacidade, anomalias e privacidade', 'Com fluxos: capacidade (top talkers, percentil 95 de uso, tendência) e segurança (varreduras, exfiltração). Detecção de anomalias compara o tráfego a uma linha de base (baseline) e alerta em desvios relevantes. IPs em fluxos podem identificar pessoas: portanto são dados pessoais. Pela LGPD, defina finalidade, colete o necessário, agregue ou pseudonimize quando possível, restrinja o acesso e defina retenção (apague o que passou do prazo).')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre SNMP polling e telemetria em streaming?', 'd', ['SNMP envia dados continuamente; o streaming só responde a consultas', 'Ambos funcionam exatamente do mesmo modo', 'Streaming só funciona em redes Wi-Fi', 'SNMP consulta (pull) periodicamente; no streaming o equipamento envia (push) por assinatura'], 'Streaming inverte o modelo: o dispositivo publica dados de modo contínuo.'),
        mcq('q2', 'O que o OpenConfig oferece, usado junto do gNMI?', 'a', ['Modelos de dados YANG comuns, independentes de fornecedor', 'Um novo tipo de cabo', 'Um firewall de aplicação', 'Criptografia do enlace Wi-Fi'], 'OpenConfig padroniza o modelo de dados entre fornecedores.'),
        mcq('q3', 'Qual componente mede a disponibilidade e a latência como o cliente enxerga, sondando de fora?', 'c', ['snmp_exporter', 'sFlow', 'blackbox_exporter', 'DHCP relay'], 'O blackbox_exporter sonda alvos por ICMP, TCP, HTTP e DNS.'),
        fill('q4', 'Qual é o padrão do IETF para exportação de registros de fluxo?', 'Exportação de fluxos: ___', ['IPFIX'], 'O IPFIX é o padrão do IETF (herdeiro do NetFlow v9).'),
        mcq('q5', 'Qual é a relação entre SLI e SLO?', 'c', ['SLI é a meta e SLO é a medição', 'São termos para o mesmo valor', 'SLI é o indicador medido; SLO é a meta definida sobre ele', 'SLO só se aplica a roteadores'], 'Exemplo: SLI = perda de pacotes; SLO = perda menor que 1% em 99,9% do tempo.'),
        mcq('q6', 'Como a detecção de anomalias identifica comportamentos suspeitos em fluxos?', 'd', ['Lendo o conteúdo dos pacotes criptografados', 'Bloqueando todo o tráfego novo', 'Contando apenas o número de portas do switch', 'Comparando o tráfego atual com uma linha de base e alertando em desvios relevantes'], 'Baseline + desvio é a ideia central; o conteúdo não é necessário.'),
        mcq('q7', 'Qual é a conduta correta para registros de fluxo sob a LGPD?', 'b', ['Guardá-los para sempre, pois podem ser úteis', 'Definir finalidade, coletar o necessário, restringir o acesso e fixar prazo de retenção', 'Publicá-los para auditoria externa', 'Não há dados pessoais em fluxos'], 'IPs podem identificar pessoas: minimização, segurança e retenção definida.'),
        fill('q8', 'Em qual caminho HTTP o Prometheus raspa as métricas por padrão?', 'GET /___', ['metrics', '/metrics'], 'O endpoint padrão de scrape é /metrics.')
      ]
    },
    {
      id: 'rda-35-sincronizacao-tempo',
      title: 'Sincronização de tempo: NTP, PTP e relógios confiáveis',
      goal: 'Entender por que o tempo correto importa, como o NTP calcula deslocamento e atraso, como ler suas saídas, como protegê-lo e quando usar PTP e GNSS, além de UTC e segundos intercalares.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Por que o tempo importa',
            'Relógios de computadores derivam (cristais de quartzo são imprecisos e dependem da temperatura), então sem sincronização cada máquina marca uma hora. Isso causa problemas reais: LOGS e forense (reconstruir um incidente exige colocar eventos de vários sistemas numa linha do tempo; relógios errados invalidam a análise); TLS/certificados (um certificado é válido entre duas datas; relógio errado faz um certificado válido parecer expirado ou ainda não válido); KERBEROS (a autenticação tolera só uma pequena diferença de relógio, na casa de minutos, e recusa tickets fora dela); TOKENS de autenticação em dois fatores por tempo (TOTP), que dependem de janelas curtas; bancos de dados distribuídos (ordenação de transações e resolução de conflitos); finanças e telecom (ordem de operações, carimbos de tempo regulatórios). Por isso, TODA a rede deve sincronizar com fontes confiáveis.'
          ),
          sl(
            'NTP: estratos, deslocamento e atraso',
            'O NTP (Network Time Protocol) usa UDP porta 123. Os servidores se organizam em ESTRATOS: estrato 0 são os relógios de referência (GPS/GNSS, relógios atômicos), que não estão na rede; o estrato 1 é o servidor ligado diretamente a um deles; um cliente que sincroniza com um estrato 1 é estrato 2, e assim por diante (cada salto soma 1). O estrato 16 significa "não sincronizado". Em cada consulta o cliente registra quatro instantes: t0 (cliente envia), t1 (servidor recebe), t2 (servidor responde) e t3 (cliente recebe). Deslocamento (offset) = ((t1 - t0) + (t2 - t3)) / 2, o quanto o relógio do cliente está atrás do servidor (positivo = cliente atrasado). Atraso (delay) = (t3 - t0) - (t2 - t1), o tempo de ida e volta na rede. Exemplo em ms: t0=0, t1=110, t2=111, t3=21 dá offset = (110 + 90) / 2 = +100 ms e delay = 21 - 1 = 20 ms. O cálculo assume que ida e volta têm o MESMO atraso: se o caminho for assimétrico, o erro do offset é metade da diferença entre os atrasos (ida 30 ms e volta 10 ms geram 10 ms de erro). O jitter mede a variação das amostras.',
            'cliente t0=0 ------------> servidor t1=110\ncliente t3=21 <------------ servidor t2=111\noffset = ((110-0)+(111-21))/2 = +100 ms\ndelay  = (21-0)-(111-110)    =  20 ms'
          ),
          sl(
            'Ler a saída: ntpq e chronyc',
            'No ntpq -p, cada linha é um servidor: o primeiro caractere indica o estado (* é a fonte escolhida para sincronizar, + candidata aceitável, - descartada como discrepante, x falsa); st é o estrato; reach é um registro octal das últimas 8 tentativas (377 = as 8 deram certo); delay, offset e jitter são em milissegundos. No chrony, o chronyc sources mostra "^*" para a fonte atual selecionada, "^+" para as combinadas e "^-" para as não combinadas, além de estrato, Reach e a última amostra (deslocamento e erro estimado). O comando chronyc tracking mostra o estado do relógio do sistema. Os servidores listados abaixo são fictícios.',
            'MS Name/IP address         Stratum Poll Reach LastRx Last sample\n==========================================================================\n^* ntp1.exemplo.interno        2   6   377    25   +213us[ +310us] +/-  18ms\n^+ ntp2.exemplo.interno        2   6   377    30   -120us[ -118us] +/-  21ms\n^- ntp3.exemplo.interno        3   6   377    28  +4200us[+4200us] +/-  35ms'
          ),
          sl(
            'Step versus slew; chrony e ntpd; NTS',
            'Para corrigir o relógio há duas formas. SLEW (ajuste gradual): o relógio passa a andar um pouco mais rápido ou mais devagar até igualar; é o modo normal para erros pequenos, e o tempo nunca pula nem volta. STEP (salto): o relógio é acertado de uma vez; só para erros grandes (p. ex. no boot), pois um salto pode fazer o tempo voltar e confundir logs, bancos de dados e agendadores. O ntpd é o daemon clássico; o chrony é a implementação moderna, que converge mais rápido, lida melhor com relógios instáveis, conexões intermitentes e VMs, e é o padrão em muitas distribuições. O NTP tradicional não tem autenticação forte por padrão. O NTS (Network Time Security), em visão geral, adiciona autenticação criptográfica, com a chave negociada por uma etapa de TLS (NTS-KE): o cliente confere que a resposta vem mesmo do servidor e não foi alterada.'
          ),
          sl(
            'Ataques e defesas',
            'Dois riscos principais, tratados aqui de forma defensiva. (1) AMPLIFICAÇÃO: servidores NTP mal configurados respondiam a certos comandos de administração com respostas muito maiores que a consulta; como o UDP permite forjar o IP de origem (spoofing), atacantes usavam isso para refletir tráfego contra uma vítima. Defesas: manter o software atualizado, desativar comandos de monitoramento/administração para clientes externos, restringir quem pode consultar (listas de acesso e restrict no servidor, ACLs no firewall), e filtro anti-spoofing na borda (BCP 38) que é responsabilidade do provedor. (2) SPOOFING DE TEMPO: alguém forja respostas e muda o relógio de uma vítima (expirando certificados, quebrando o Kerberos). Defesas: usar MÚLTIPLAS fontes independentes (de preferência 4 ou mais, para o algoritmo descartar a que discorda), servidores internos próprios que sincronizam com fontes confiáveis, NTS, e monitorar o deslocamento para alertar em desvios.'
          ),
          sl(
            'PTP, GNSS, UTC e segundos intercalares',
            'O PTP (Precision Time Protocol, IEEE 1588) obtém precisão muito maior que o NTP, na faixa de submicrossegundos, porque usa carimbos de tempo feitos em HARDWARE nas placas e switches (o NTP em software sofre com filas e interrupções, tipicamente alcançando milissegundos em redes comuns). Elementos: um grandmaster (fonte da rede), relógios de fronteira e transparentes nos switches, que compensam seu próprio atraso; domínios de tempo separam grupos de PTP; usa UDP 319 e 320. É usado em telecom (5G), mercado financeiro e automação industrial. A fonte do grandmaster costuma ser GNSS (GPS e similares): uma antena com visada do céu; dependência crítica, pois a antena pode falhar ou sofrer interferência (jamming) ou sinal falso (spoofing), então use holdover (oscilador de qualidade que mantém a hora por um tempo) e fontes redundantes. Para logs, grave sempre em UTC (ou com o deslocamento de fuso explícito, formato ISO 8601), para correlacionar sistemas de fusos diferentes e evitar a ambiguidade do horário de verão. O segundo intercalar (leap second) é um segundo inserido no UTC de vez em quando para acompanhar a rotação da Terra (23:59:60): sistemas podem sofrer, e alguns o resolvem diluindo o segundo ao longo de horas (smearing) em vez de repeti-lo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um incidente afetou três servidores em fusos horários diferentes, e os logs não batem. Qual prática evita esse problema?', 'c', [
          'Cada servidor registrar no seu horário local, sem sincronização',
          'Desativar o NTP para os relógios não mudarem durante o incidente',
          'Sincronizar todos por NTP com fontes confiáveis e registrar os logs em UTC (ou ISO 8601 com o deslocamento de fuso)',
          'Apagar os logs mais antigos'
        ], 'Relógios sincronizados e UTC permitem montar uma linha do tempo única; relógios errados invalidam a análise forense.'),
        mcq('q2', 'Em uma consulta NTP (em ms): t0=0, t1=290, t2=291, t3=81. Quanto valem o offset e o delay?', 'a', [
          'Offset +250 ms (cliente atrasado) e delay 80 ms',
          'Offset -250 ms (cliente adiantado) e delay 80 ms',
          'Offset +290 ms e delay 81 ms',
          'Offset +125 ms e delay 80 ms'
        ], 'offset = ((290 - 0) + (291 - 81)) / 2 = 250; delay = (81 - 0) - (291 - 290) = 80. Sem a divisão por 2 sairia 500; a ida e volta é o delay, não o offset.'),
        mcq('q3', 'Qual afirmação sobre GNSS, UTC e segundos intercalares está correta?', 'd', [
          'A antena GNSS nunca falha e dispensa redundância',
          'O segundo intercalar é removido do UTC sempre que o PTP é usado',
          'Logs devem usar o horário local sem indicar o fuso',
          'O GNSS é fonte comum do grandmaster, mas é uma dependência crítica (antena, jamming, spoofing), e o segundo intercalar pode ser tratado por smearing em vez de ser repetido'
        ], 'Use holdover e fontes redundantes; UTC com fuso explícito nos logs; o smearing dilui o segundo ao longo de horas.'),
        fill('q4', 'Complete a porta UDP usada pelo NTP.', 'udp port ___   # NTP', ['123'], 'O NTP usa UDP 123 (o PTP usa 319 e 320).'),
        mcq('q5', 'No "chronyc sources" mostrado, o que indicam "^*" na linha de ntp1 (estrato 2) e "Reach 377"?', 'b', [
          '^* é uma fonte descartada, e 377 significa que todas as tentativas falharam',
          '^* é a fonte atualmente selecionada para sincronizar, e 377 (octal) significa que as últimas 8 tentativas deram certo',
          '^* é o próprio servidor local, e 377 é a porta',
          '^* significa estrato 16, e 377 é o atraso em ms'
        ], 'O asterisco marca a fonte atual; Reach é um registro octal das últimas 8 consultas, e 377 = 11111111.'),
        mcq('q6', 'Por que o ajuste gradual (slew) é preferido ao salto (step) para erros pequenos de relógio?', 'c', [
          'Porque o slew é mais rápido que o step',
          'Porque o step só funciona com PTP',
          'Porque um salto pode fazer o tempo voltar ou pular, confundindo logs, bancos de dados e agendadores, enquanto o slew muda só o ritmo do relógio',
          'Porque o slew dispensa servidores de tempo'
        ], 'O slew acelera ou atrasa o relógio sem descontinuidade; o step é reservado para erros grandes, como no boot.'),
        mcq('q7', 'Qual conjunto de medidas reduz o risco de spoofing de tempo e de uso do servidor NTP em ataques de amplificação?', 'a', [
          'Várias fontes independentes, NTS, restrição de quem consulta o servidor, software atualizado e monitoramento do offset',
          'Uma única fonte pública, aberta a qualquer origem',
          'Desligar a sincronização em todos os servidores',
          'Responder a todos os comandos de administração para qualquer IP'
        ], 'Fontes múltiplas e autenticação protegem contra tempo falso; restringir consultas e atualizar impede o reflexo de tráfego.'),
        fill('q8', 'Complete o número do padrão IEEE do PTP, que usa carimbos de tempo em hardware.', 'PTP = IEEE ___', ['1588'], 'O IEEE 1588 define o PTP, com precisão submicrossegundo e uso em telecom, finanças e indústria.')
      ]
    },
    {
      id: 'rda-22-automacao-redes',
      title: 'Automação de redes',
      goal: 'Automatizar configurações com segurança: idempotência, fonte da verdade, Ansible, Netmiko, NETCONF/YANG, Git e CI.',
      xp: 30,
      intro: {
        slides: [
          sl('Por que automatizar e idempotência', 'Automatizar dá consistência, velocidade e menos erro humano em mudanças repetitivas. O conceito-chave é a IDEMPOTÊNCIA: aplicar a mesma operação várias vezes produz o mesmo resultado final. "Garantir que a VLAN 10 exista" é idempotente; "adicionar a VLAN 10" pode falhar ou duplicar na segunda vez. Ferramentas declarativas descrevem o estado desejado e só agem sobre a diferença.'),
          sl('Fonte da verdade e Git', 'A fonte da verdade (source of truth) é o lugar único onde o estado desejado vive: inventário, IPAM e arquivos de variáveis versionados no Git. Git guarda histórico, autoria e permite revisão por pull request. Config em templates + variáveis no Git significa que toda mudança é rastreável e reversível.'),
          sl('Ansible, Netmiko e templates Jinja2', 'Ansible é sem agente: roda playbooks YAML contra o inventário, via SSH ou API. Netmiko é uma biblioteca Python para SSH/CLI em vários fornecedores. Jinja2 é a linguagem de templates: variáveis e laços geram a configuração final. Repare que a senha vem do ambiente, nunca do código.', 'import os\nfrom netmiko import ConnectHandler\n\ndev = {\'device_type\': \'cisco_ios\', \'host\': \'192.0.2.10\',\n       \'username\': os.environ[\'NET_USER\'], \'password\': os.environ[\'NET_PASS\']}\nconn = ConnectHandler(**dev)\nprint(conn.send_command(\'show version\'))\n\n# template Jinja2:\n# {% for v in vlans %}vlan {{ v.id }}\\n name {{ v.nome }}\\n{% endfor %}'),
          sl('NETCONF, RESTCONF e YANG', 'YANG é a LINGUAGEM DE MODELAGEM de dados: descreve a estrutura da configuração e do estado de um equipamento. NETCONF aplica e lê esses dados em XML sobre SSH, na porta 830, com operações transacionais (candidate, commit). RESTCONF faz o mesmo via HTTP (GET/PUT/PATCH) em JSON ou XML. Muitos controladores e equipamentos também expõem APIs REST próprias.'),
          sl('Terraform e nuvem', 'Terraform é declarativo: você descreve recursos (redes virtuais, sub-redes, regras) e ele compara com o ESTADO atual. O comando plan mostra o que seria criado, alterado ou destruído; só o apply executa. Assim a revisão acontece antes da mudança, e o estado precisa ficar protegido (pode conter dados sensíveis).'),
          sl('Validação, CI, rollback e segredos', 'Antes de aplicar em produção, o CI roda verificações: lint de sintaxe, validação do modelo, testes em laboratório ou simulador e revisão humana. Planeje o ROLLBACK: reverter o commit, restaurar a configuração arquivada ou usar commit com confirmação. Segredos (senhas, chaves, tokens) ficam FORA do repositório: cofre de segredos, variáveis de ambiente ou Ansible Vault, com rotação. Um segredo versionado deve ser considerado vazado.')
        ]
      },
      questions: [
        mcq('q1', 'O que significa uma operação idempotente?', 'b', ['Só pode ser executada uma vez', 'Aplicada várias vezes, produz o mesmo estado final', 'Exige reinício do equipamento', 'Não gera logs'], 'Idempotência permite reexecutar a automação sem efeitos colaterais.'),
        mcq('q2', 'O que é YANG?', 'c', ['Um tipo de VPN', 'Um protocolo de roteamento', 'Uma linguagem de modelagem de dados de configuração e estado', 'Um comando de CLI'], 'YANG descreve os dados; NETCONF e RESTCONF os transportam.'),
        mcq('q3', 'Qual é o papel da fonte da verdade versionada em Git?', 'a', ['Guardar o estado desejado, com histórico, revisão e rastreabilidade', 'Armazenar as senhas dos roteadores', 'Substituir o monitoramento', 'Acelerar o link WAN'], 'Estado desejado em Git permite auditar e reverter mudanças.'),
        fill('q4', 'Qual é a porta padrão do NETCONF sobre SSH?', 'NETCONF/SSH: porta ___', ['830'], 'O NETCONF sobre SSH usa a porta 830.'),
        mcq('q5', 'Para que serve um template Jinja2 na automação de redes?', 'd', ['Para criptografar a sessão SSH', 'Para descobrir vizinhos', 'Para medir latência', 'Para gerar configurações a partir de variáveis e laços'], 'O template combina variáveis e lógica para produzir a configuração final.'),
        mcq('q6', 'Onde devem ficar senhas e tokens usados pela automação?', 'b', ['No playbook, em texto simples', 'Em cofre de segredos ou variáveis de ambiente, fora do repositório', 'Em comentários do código', 'No histórico do Git'], 'Segredos versionados devem ser considerados vazados; use cofre e rotação.'),
        mcq('q7', 'Qual prática de CI é adequada antes de aplicar mudança em produção?', 'a', ['Validar sintaxe, testar em laboratório e ter plano de rollback', 'Aplicar direto na produção na sexta à noite', 'Desativar a revisão por pull request', 'Remover o histórico do Git'], 'Validação automática, testes e rollback reduzem o risco de mudanças.'),
        fill('q8', 'No Netmiko, qual método envia um comando de exibição e retorna a saída?', 'saida = conn.___(\'show version\')', ['send_command'], 'send_command executa um comando de leitura; send_config_set aplica configuração.')
      ]
    },
    {
      id: 'rda-23-programacao-sockets',
      title: 'Programação de redes com sockets',
      goal: 'Escrever clientes e servidores TCP/UDP em Python, tratar o fluxo de bytes e proteger o código contra entradas hostis.',
      xp: 30,
      intro: {
        slides: [
          sl('A API de sockets e o servidor TCP', 'Um socket é um ponto de comunicação criado pelo sistema operacional. AF_INET indica IPv4; SOCK_STREAM é TCP e SOCK_DGRAM é UDP. O servidor TCP segue a ordem socket, bind (associa endereço e porta), listen (passa a aceitar conexões) e accept (devolve um novo socket para cada cliente). Em testes, escute em 127.0.0.1 para não expor o serviço.', 'import socket\n\nwith socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:\n    srv.bind((\'127.0.0.1\', 5000))\n    srv.listen()\n    conn, addr = srv.accept()\n    with conn:\n        dados = conn.recv(1024)\n        conn.sendall(dados)      # eco'),
          sl('O cliente TCP', 'O cliente cria o socket e chama connect com o endereço do servidor. sendall envia todos os bytes (send pode enviar só parte); recv(n) lê no máximo n bytes. Se recv devolver b\'\' (bytes vazios), o outro lado fechou a conexão.', 'with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as c:\n    c.connect((\'127.0.0.1\', 5000))\n    c.sendall(b\'ola\')\n    print(c.recv(1024))'),
          sl('UDP: datagramas', 'No UDP não há conexão: cada mensagem é um datagrama enviado com sendto(dados, endereco) e recebido com recvfrom(n), que devolve (dados, endereco_do_remetente). Os limites de cada mensagem são preservados, mas não há garantia de entrega, ordem ou ausência de duplicatas: a aplicação decide como lidar.', 'u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nu.bind((\'127.0.0.1\', 5001))\ndados, origem = u.recvfrom(1024)\nu.sendto(dados, origem)'),
          sl('TCP é fluxo de bytes: framing', 'O TCP não preserva fronteiras de mensagem. Dois sendall podem chegar numa única recv, ou uma mensagem pode chegar partida em várias. Por isso o protocolo precisa de framing: um DELIMITADOR (ex.: \\n) ou um PREFIXO DE COMPRIMENTO (ex.: 4 bytes dizendo o tamanho do corpo). Leia em laço até completar a mensagem.', 'def ler_exato(sock, n):\n    buf = b\'\'\n    while len(buf) < n:\n        parte = sock.recv(n - len(buf))\n        if not parte:\n            raise ConnectionError(\'fechou\')\n        buf += parte\n    return buf'),
          sl('Timeouts, erros e I/O não bloqueante', 'Por padrão as chamadas BLOQUEIAM; um cliente lento pode prender o servidor para sempre. settimeout(segundos) define o limite e gera TimeoutError. Trate erros como ConnectionRefusedError e feche sempre (with ou close). Para atender muitos clientes sem uma thread cada, use I/O multiplexado: select.select(rlist, wlist, xlist, timeout) informa quais sockets estão prontos, e asyncio faz isso com corrotinas.'),
          sl('Endianness e struct', 'Na rede usa-se a ordem big-endian (byte mais significativo primeiro). O módulo struct converte números em bytes: o prefixo ! significa ordem de rede, H é inteiro sem sinal de 2 bytes e I de 4 bytes. Exemplo: struct.pack(\'!H\', 258) gera b\'\\x01\\x02\' (258 = 1*256 + 2).', 'import struct\nstruct.pack(\'!H\', 258)        # b\'\\x01\\x02\'\nstruct.unpack(\'!H\', b\'\\x00\\x50\')  # (80,)'),
          sl('Segurança do código de rede', 'Nunca confie no cliente. Com prefixo de comprimento, REJEITE tamanhos absurdos (limite máximo) antes de alocar memória; use timeouts; valide e escape a entrada; limite conexões; não registre dados pessoais em logs. Para sigilo e autenticidade, envolva o socket com TLS usando o módulo ssl (SSLContext e wrap_socket) em vez de criar criptografia própria.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem das chamadas em um servidor TCP simples?', 'a', ['socket, bind, listen, accept', 'accept, listen, bind, socket', 'socket, connect, send, recv', 'bind, socket, accept, listen'], 'Cria o socket, associa a porta, passa a escutar e aceita conexões.'),
        mcq('q2', 'Qual característica descreve o UDP com recvfrom e sendto?', 'd', ['Garante entrega e ordem', 'Exige connect antes do envio', 'Funde várias mensagens em um fluxo contínuo', 'Preserva a fronteira dos datagramas, sem garantia de entrega'], 'UDP entrega datagramas inteiros, mas pode perder, duplicar ou reordenar.'),
        mcq('q3', 'Por que um protocolo sobre TCP precisa de framing?', 'd', ['Porque o TCP reordena os bytes', 'Porque o TCP só aceita 1024 bytes', 'Porque sendall não funciona em TCP', 'Porque o TCP é um fluxo de bytes e não preserva fronteiras de mensagem'], 'Uma recv pode devolver parte de uma mensagem ou mais de uma; use delimitador ou comprimento.'),
        fill('q4', 'Qual método do socket coloca o servidor para aceitar conexões?', 'srv.bind((\'127.0.0.1\', 5000))\nsrv.___()\nconn, addr = srv.accept()', ['listen'], 'listen() deixa o socket em modo de escuta; accept() devolve cada conexão.'),
        mcq('q5', 'O que significa recv devolver b\'\' (bytes vazios) em um socket TCP?', 'c', ['Houve erro de CRC', 'O outro lado enviou uma mensagem vazia', 'O outro lado fechou a conexão', 'O buffer é de 0 bytes'], 'Bytes vazios sinalizam fim do fluxo: o par fechou.'),
        mcq('q6', 'O que retorna struct.pack(\'!H\', 258)?', 'b', ['b\'\\x02\\x01\'', 'b\'\\x01\\x02\'', 'b\'258\'', 'b\'\\x00\\x00\\x01\\x02\''], '! é ordem de rede (big-endian) e H ocupa 2 bytes: 258 = 0x0102.'),
        mcq('q7', 'Um servidor lê um prefixo de comprimento de 4 bytes e aloca esse tamanho. Qual medida de segurança é essencial?', 'c', ['Aceitar qualquer valor para ser flexível', 'Ignorar timeouts', 'Rejeitar tamanhos acima de um limite máximo e usar timeout', 'Usar apenas UDP'], 'Sem limite, um cliente hostil força alocação enorme; timeouts evitam conexões penduradas.'),
        fill('q8', 'Qual função do módulo select informa quais sockets estão prontos para leitura?', 'prontos, _, _ = select.___([srv], [], [], 1.0)', ['select'], 'select.select(rlist, wlist, xlist, timeout) devolve as listas de sockets prontos.')
      ]
    },
    {
      id: 'rda-24-alta-disponibilidade',
      title: 'Alta disponibilidade e resiliência',
      goal: 'Projetar redes sem ponto único de falha, calcular disponibilidade em noves e definir RTO e RPO.',
      xp: 30,
      intro: {
        slides: [
          sl('SPOF e redundância', 'Um SPOF (single point of failure) é qualquer componente cuja falha derruba o serviço: um roteador, um link, uma fonte de energia, um DNS. Redundância N+1 mantém um componente extra além dos N necessários; 2N duplica tudo (ativo-ativo ou ativo-passivo). Redundância só vale se houver caminhos e falhas realmente independentes: dois links na mesma canaleta têm a mesma sorte.'),
          sl('FHRP e ECMP', 'FHRP (HSRP, VRRP) dá aos hosts um IP virtual de gateway compartilhado por dois roteadores: se o ativo cair, o outro assume o IP e os hosts não mudam nada. ECMP (equal-cost multipath) usa vários caminhos de mesmo custo ao mesmo tempo, distribuindo os fluxos por hash; se um cair, os demais absorvem o tráfego.'),
          sl('Convergência rápida: BFD e graceful restart', 'Protocolos de roteamento demoram para perceber uma falha silenciosa. O BFD (Bidirectional Forwarding Detection) é um protocolo leve de "hello" que detecta queda de caminho em milissegundos e avisa OSPF/BGP para reagir. O graceful restart permite que o plano de controle reinicie enquanto o plano de encaminhamento continua a encaminhar, evitando um flap em toda a rede.'),
          sl('Multi-homing, DNS e testes de falha', 'Multi-homing é ter mais de um provedor (BGP ou SD-WAN) para sobreviver à falha de um. No DNS/GSLB, health checks removem do DNS os destinos que falham, e TTL baixo acelera a troca (com custo de mais consultas). Teste de caos (chaos) é derrubar de propósito, de forma controlada, componentes para provar que a redundância funciona antes de uma falha real.'),
          sl('Disponibilidade em noves', 'Tempo de indisponibilidade permitido = (1 - disponibilidade) x período. Num ano de 365 dias (525.600 minutos): 99,9% permite 525,6 min (8,76 h); 99,99% permite 52,56 min; 99,999% permite 5,256 min. Em SÉRIE (todos necessários) as disponibilidades se multiplicam: 0,999 x 0,999 = 0,998001. Em PARALELO (basta um) a indisponibilidade se multiplica: dois componentes de 99% dão 1 - 0,01 x 0,01 = 99,99%.', 'minutos_ano = 365 * 24 * 60   # 525600\nprint((1 - 0.9999) * minutos_ano)   # 52.56'),
          sl('SLA, DR, RTO e RPO', 'SLA é o compromisso contratual de disponibilidade, geralmente com crédito em caso de descumprimento. DR (disaster recovery) é recuperar o serviço após um desastre. RTO (recovery time objective) é o TEMPO máximo tolerável para restaurar o serviço; RPO (recovery point objective) é a quantidade máxima de DADOS, medida em tempo, que se aceita perder (backup a cada hora implica RPO de até 1 hora). Backups e réplicas contêm dados pessoais: proteja e controle a retenção (LGPD).')
        ]
      },
      questions: [
        mcq('q1', 'Quantos minutos de indisponibilidade por ano (365 dias) permite uma disponibilidade de 99,99%?', 'c', ['5,256 minutos', '525,6 minutos', '52,56 minutos', '8,76 minutos'], '(1 - 0,9999) x 525.600 = 52,56 minutos.'),
        mcq('q2', 'Qual é a função do FHRP (HSRP/VRRP)?', 'b', ['Criptografar o tráfego entre roteadores', 'Oferecer um IP virtual de gateway compartilhado por mais de um roteador', 'Medir a latência do link', 'Aumentar o número de VLANs'], 'Se o roteador ativo falha, o outro assume o IP virtual sem mudança nos hosts.'),
        mcq('q3', 'Dois componentes de 99,9% em série (ambos necessários) resultam em qual disponibilidade aproximada?', 'a', ['99,8%', '99,99%', '100%', '99,9%'], '0,999 x 0,999 = 0,998001, cerca de 99,8%.'),
        fill('q4', 'Qual sigla indica a quantidade máxima de dados (em tempo) que se aceita perder em um desastre?', '___  # Recovery Point Objective', ['RPO'], 'RPO é o ponto de recuperação aceitável; RTO é o tempo para restaurar.'),
        mcq('q5', 'Dois componentes independentes de 99% em paralelo (basta um) dão qual disponibilidade?', 'a', ['99,99%', '98%', '99%', '100%'], '1 - (0,01 x 0,01) = 0,9999.'),
        mcq('q6', 'Qual é a definição de RTO?', 'd', ['A quantidade máxima de dados que se aceita perder', 'O número de roteadores de um site', 'O tempo médio entre falhas', 'O tempo máximo tolerável para restaurar o serviço'], 'RTO é tempo de recuperação; RPO é perda de dados aceitável.'),
        mcq('q7', 'Qual é o papel do BFD?', 'b', ['Distribuir endereços IP', 'Detectar rapidamente a queda de um caminho e avisar os protocolos de roteamento', 'Criptografar o BGP', 'Dividir o tráfego por VLAN'], 'O BFD detecta falhas em milissegundos, acelerando a convergência de OSPF e BGP.'),
        fill('q8', 'Quantas horas de indisponibilidade por ano (365 dias) permite 99,9%? Responda com duas casas decimais, usando vírgula.', 'horas = (1 - 0,999) x 8760 = ___', ['8,76', '8.76'], '(1 - 0,999) x 8760 h = 8,76 horas (525,6 minutos).')
      ]
    },
    {
      id: 'rda-25-projeto-corporativo',
      title: 'Projeto de redes corporativas',
      goal: 'Conduzir um projeto de rede do levantamento de requisitos à aceitação, com dimensionamento, segmentação, riscos e documentação.',
      xp: 30,
      intro: {
        slides: [
          sl('Requisitos primeiro', 'Todo projeto começa pelo levantamento de requisitos: objetivos do negócio, número de usuários e locais, aplicações críticas e seus requisitos (latência, banda, disponibilidade), SLAs, restrições de orçamento e prazo, conformidade (LGPD, normas do setor) e crescimento previsto. Sem requisitos mensuráveis não há como validar o projeto no final.'),
          sl('Dimensionamento e capacidade', 'Dimensione por usuários, tráfego esperado e margem de crescimento (planeje para alguns anos). Um conceito prático é a taxa de oversubscription: capacidade das portas de acesso dividida pela capacidade dos uplinks. Exemplo: 48 portas de 1 Gbps com 2 uplinks de 10 Gbps = 48 / 20 = 2,4:1. Considere também o orçamento de PoE (APs, telefones, câmeras) e a capacidade de internet e WAN.', 'oversub = (48 * 1) / (2 * 10)   # 2.4 -> 2,4:1'),
          sl('Campus, filial e data center', 'Campus segue o modelo hierárquico (acesso, distribuição, núcleo ou núcleo colapsado). Filiais são menores, com roteador/firewall e links redundantes (WAN/SD-WAN). O data center costuma usar spine-leaf. Padronize modelos de projeto por tipo de site: isso simplifica a compra, a configuração e a operação.'),
          sl('Segmentação, segurança e redundância', 'Segmente por função: usuários, voz, servidores, convidados, IoT/OT e gerência, cada um em VLAN/sub-rede e com políticas explícitas entre zonas (negar por padrão, liberar o necessário). Convidados e IoT ficam isolados dos servidores. Aplique redundância onde a falha custa mais (internet, núcleo, firewall) e segurança em camadas, com mínimo privilégio e proteção dos dados pessoais desde o projeto (privacy by design).'),
          sl('Gestão, monitoramento e documentação', 'Projete a operação junto: rede de gerência separada (out-of-band quando possível), monitoramento, coleta de logs, backup de configurações e automação. Documente: diagramas lógico e físico, plano de endereçamento (IPAM), políticas de firewall, runbooks e a documentação as-built, que descreve o que foi realmente instalado ao final (e não apenas o planejado).'),
          sl('Fases, riscos e aceitação', 'Divida em fases: projeto, piloto (um site ou ala), ondas de implantação em janelas de mudança com plano de rollback e treinamento da equipe. Liste riscos em matriz de probabilidade x impacto (atraso de fornecedor, janela curta, dependência de terceiros) com mitigação e responsável. Na aceitação, execute testes contra critérios definidos nos requisitos (desempenho, failover, segurança) e registre o aceite formal.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é o primeiro passo de um projeto de rede corporativa?', 'd', ['Comprar os equipamentos mais caros', 'Escolher a cor dos cabos', 'Configurar as VLANs', 'Levantar requisitos de negócio, usuários, aplicações e restrições'], 'Sem requisitos mensuráveis não se dimensiona nem se valida o projeto.'),
        mcq('q2', 'Um switch tem 40 portas de acesso de 1 Gbps e um único uplink de 10 Gbps. Qual é a taxa de oversubscription?', 'a', ['4:1', '40:1', '1:4', '10:1'], '40 Gbps de acesso / 10 Gbps de uplink = 4:1.'),
        mcq('q3', 'Qual prática de segmentação é a mais adequada?', 'b', ['Colocar convidados, IoT e servidores na mesma VLAN', 'Separar por função e aplicar política explícita entre zonas', 'Usar uma única VLAN para facilitar', 'Liberar todo o tráfego entre zonas por padrão'], 'Segmentação com negar por padrão limita o alcance de incidentes.'),
        fill('q4', 'Calcule a oversubscription: 48 portas de 1 Gbps e 2 uplinks de 10 Gbps. Responda no formato X,Y (o valor antes de :1).', 'oversubscription = ___ : 1', ['2,4', '2.4'], '48 / 20 = 2,4.'),
        mcq('q5', 'Para que serve uma matriz de riscos de projeto?', 'c', ['Para calcular o preço dos cabos', 'Para mapear VLANs', 'Para avaliar probabilidade e impacto e definir mitigação e responsável', 'Para escolher o fabricante'], 'Riscos são priorizados por probabilidade x impacto, com plano de mitigação.'),
        mcq('q6', 'Qual é a vantagem de uma fase-piloto antes da implantação ampla?', 'a', ['Validar o projeto em escala pequena e corrigir falhas antes de replicar', 'Evitar a documentação', 'Eliminar a necessidade de rollback', 'Dispensar testes de aceitação'], 'O piloto reduz o risco de replicar um erro em todos os sites.'),
        mcq('q7', 'Como deve ser feita a aceitação final do projeto?', 'd', ['Pela opinião informal do integrador', 'Sem testes, apenas pela entrega física', 'Apenas com a fatura paga', 'Testando contra os critérios dos requisitos e registrando o aceite formal'], 'Critérios objetivos (desempenho, failover, segurança) tornam o aceite verificável.'),
        fill('q8', 'Como se chama a documentação que descreve o que foi de fato instalado ao final?', 'Documentação ___', ['as-built', 'as built', 'asbuilt'], 'A documentação as-built reflete a implantação real, com eventuais desvios do plano.')
      ]
    },
    {
      id: 'rda-26-internet-por-dentro',
      title: 'A internet por dentro',
      goal: 'Entender como as redes se interconectam: ISPs, trânsito e peering, IXPs, RIRs, domínios, DNS raiz e o esgotamento do IPv4.',
      xp: 30,
      intro: {
        slides: [
          sl('Uma rede de redes', 'A internet não tem dono nem centro: é um conjunto de milhares de redes independentes chamadas sistemas autônomos (AS), cada uma identificada por um ASN (número de sistema autônomo) e conectadas pelo BGP. Provedores de acesso, de conteúdo, universidades e empresas são ASes que combinam entre si como trocar tráfego.'),
          sl('Trânsito e peering', 'No TRÂNSITO, uma rede paga a outra para ter acesso a toda a internet. No PEERING, duas redes trocam entre si o tráfego dos próprios clientes, normalmente sem pagar trânsito um ao outro. Em nível alto, provedores de grande porte (conhecidos como tier 1) alcançam toda a internet sem comprar trânsito, apenas com peering; os menores compram trânsito de um ou mais provedores maiores. Na prática a hierarquia é bem menos rígida que antigamente.'),
          sl('IXPs e o IX.br', 'Um IXP (Internet Exchange Point) é uma infraestrutura de camada 2 onde várias redes se conectam para fazer peering, trocando tráfego localmente em vez de dar a volta por um trânsito caro e distante. Resultado: menor latência e menor custo. O IX.br, mantido pelo NIC.br, é o exemplo brasileiro, com pontos em várias cidades.'),
          sl('RIRs, IPs e ASNs', 'Endereços IP e ASNs são alocados de forma hierárquica: a IANA reparte grandes blocos para os cinco RIRs (registros regionais de internet); o LACNIC atende a América Latina e o Caribe, incluindo o Brasil, e aloca blocos a provedores e organizações. No Brasil, o Registro.br (NIC.br) também administra o registro de domínios .br e a distribuição de recursos de numeração para o país.'),
          sl('ICANN, IANA e servidores raiz', 'A ICANN coordena o sistema de nomes e números; a IANA, função ligada à ICANN, mantém a zona raiz do DNS e os registros de parâmetros. A raiz é atendida por 13 identidades de servidores raiz (letras A a M), operadas por diferentes organizações, mas cada identidade existe em muitas instâncias espalhadas por anycast. Os servidores raiz não sabem todos os nomes: apontam para os servidores de cada TLD (.br, .com).'),
          sl('Esgotamento do IPv4, caminho de uma requisição e neutralidade', 'O IPv4 tem 32 bits (cerca de 4,3 bilhões de endereços): o espaço livre esgotou nos registros. Paliativos: transferência de blocos entre organizações e CGNAT; a solução de longo prazo é o IPv6. Uma requisição web passa por: DNS (resolvedor recursivo, raiz, TLD, servidor autoritativo), conexão TCP/TLS, saída pelo provedor, trânsito ou peering/IXP, até o servidor ou CDN; ida e volta podem seguir caminhos diferentes. Neutralidade de rede é o princípio de tratar o tráfego sem discriminar por origem, destino, conteúdo, serviço ou aplicação (Marco Civil, art. 9).')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre trânsito e peering?', 'b', ['Trânsito é gratuito e peering é pago sempre', 'No trânsito se paga para alcançar toda a internet; no peering as redes trocam tráfego dos próprios clientes', 'São sinônimos', 'Peering só existe em redes Wi-Fi'], 'Trânsito é serviço pago de acesso à internet; peering é troca direta entre as redes.'),
        mcq('q2', 'Qual é o principal benefício de um IXP?', 'a', ['Permitir que várias redes façam peering localmente, com menor latência e custo', 'Substituir o DNS', 'Aumentar o número de endereços IPv4', 'Criptografar todo o tráfego da internet'], 'IXP é o ponto onde as redes se interconectam diretamente.'),
        mcq('q3', 'Qual registro regional (RIR) aloca IPs e ASNs para o Brasil?', 'c', ['ARIN', 'RIPE NCC', 'LACNIC', 'APNIC'], 'O LACNIC atende a América Latina e o Caribe.'),
        fill('q4', 'Qual é o nome do ponto de troca de tráfego brasileiro mantido pelo NIC.br?', '___  # exemplo brasileiro de IXP', ['IX.br', 'ix.br', 'IXbr'], 'O IX.br é a rede de IXPs mantida pelo NIC.br.'),
        mcq('q5', 'O que ocorreu com o espaço de endereços IPv4 livre nos registros?', 'd', ['Foi ampliado para 64 bits', 'Foi migrado integralmente para o IPv6 sem custos', 'Ficou ilimitado com o CGNAT', 'Esgotou; usam-se transferências e CGNAT como paliativos, e o IPv6 é a solução de longo prazo'], 'O IPv4 tem cerca de 4,3 bilhões de endereços, insuficientes para a demanda.'),
        mcq('q6', 'O que é neutralidade de rede, em termos conceituais?', 'a', ['Tratar o tráfego sem discriminar por origem, destino, conteúdo, serviço ou aplicação', 'Bloquear todo o tráfego de vídeo', 'Obrigar o uso de IPv6', 'Impedir o uso de VPNs'], 'É um princípio previsto no Marco Civil (art. 9).'),
        mcq('q7', 'Como é a organização dos servidores raiz do DNS?', 'd', ['Apenas 13 máquinas físicas no mundo', 'Um único servidor mantido pelo Registro.br', 'Um servidor por país', '13 identidades (A a M), cada uma com muitas instâncias distribuídas por anycast'], 'Há 13 identidades, mas centenas de instâncias anycast.'),
        fill('q8', 'Como se chama o número que identifica um sistema autônomo na internet?', 'Identificador do AS: ___', ['ASN'], 'O ASN identifica o AS e é usado pelo BGP.')
      ]
    },
    {
      id: 'rda-27-lgpd-marco-civil-redes',
      title: 'LGPD, Marco Civil e privacidade em redes',
      goal: 'Reconhecer dados pessoais em logs e na infraestrutura de rede e aplicar os conceitos básicos da LGPD e do Marco Civil. Conteúdo educativo, sem substituir orientação jurídica.',
      xp: 30,
      intro: {
        slides: [
          sl('Onde há dados pessoais na rede', 'Dado pessoal é qualquer informação relacionada a pessoa natural identificada ou identificável. Em redes isso inclui endereços IP associados a um usuário, logs de acesso e de autenticação, registros de fluxo (NetFlow/IPFIX), consultas DNS (revelam hábitos), proxies, DPI (inspeção profunda de pacotes) e cadastros em Wi-Fi público/captive portal. Se dá para ligar o registro a alguém, trate como dado pessoal. Esta lição é visão geral e não substitui orientação jurídica.'),
          sl('Princípios da LGPD', 'A Lei 13.709/2018 (LGPD) lista princípios, entre eles: finalidade (propósito legítimo e informado), necessidade (coletar o mínimo para a finalidade), segurança (proteção técnica e administrativa), prevenção (evitar danos) e transparência. O art. 46 exige que agentes de tratamento adotem medidas de segurança, técnicas e administrativas, para proteger os dados contra acessos não autorizados e situações acidentais ou ilícitas.'),
          sl('Marco Civil da Internet', 'A Lei 12.965/2014 estabelece princípios e deveres. O provedor de conexão deve manter registros de conexão, em sigilo, por 1 ano (art. 13). O provedor de aplicações, constituído como pessoa jurídica e com atividade organizada e econômica, deve manter registros de acesso a aplicações por 6 meses (art. 15). O provedor de conexão não pode guardar registros de acesso a aplicações (art. 14). A entrega dos registros a terceiros exige ordem judicial. Esses prazos se aplicam a provedores nos termos da lei; uma empresa que apenas oferece rede interna deve definir sua retenção pela finalidade, com apoio jurídico.'),
          sl('Monitoramento de funcionários', 'Monitorar a rede corporativa pode ter finalidade legítima (segurança, conformidade), mas exige transparência (política de uso aceitável comunicada), proporcionalidade, minimização e acesso restrito aos registros. Evite acessar conteúdo pessoal desnecessário e registre quem consulta os dados. Em dúvidas, procure o encarregado (DPO) e o jurídico.'),
          sl('Criptografia, anonimização e retenção', 'Criptografe dados em trânsito (TLS) e em repouso. Anonimização torna a identificação irreversível por meios razoáveis; nesse caso o dado deixa de ser pessoal. Pseudonimização (ex.: trocar o IP por um código) ainda é dado pessoal, porque pode ser revertida com informação adicional. Retenção: guarde só pelo prazo necessário à finalidade ou à obrigação legal e depois elimine.'),
          sl('Incidentes e comunicação', 'Se houver incidente de segurança que possa acarretar risco ou dano relevante aos titulares, o controlador deve comunicar a ANPD e os titulares (art. 48 da LGPD), em prazo definido em regulamentação da ANPD. Por isso mantenha plano de resposta, registros do incidente e contatos prontos; detalhes de prazos e conteúdo devem ser confirmados na norma vigente.')
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre logs de rede e a LGPD é correta?', 'a', ['Endereços IP e logs que permitem identificar uma pessoa podem ser dados pessoais', 'Logs de rede nunca são dados pessoais', 'Só nomes completos são dados pessoais', 'A LGPD não se aplica a registros de acesso'], 'Se o registro puder ser associado a pessoa identificável, ele é dado pessoal.'),
        mcq('q2', 'Qual princípio da LGPD orienta coletar apenas o mínimo necessário?', 'c', ['Livre acesso', 'Qualidade', 'Necessidade', 'Prevenção'], 'Necessidade limita o tratamento ao mínimo para atingir a finalidade.'),
        mcq('q3', 'Segundo o Marco Civil, qual é a guarda dos registros por provedores nos termos da lei?', 'd', ['Conexão: 6 meses; aplicações: 1 ano', 'Conexão: 5 anos; aplicações: 5 anos', 'Conexão: 30 dias; aplicações: 30 dias', 'Conexão: 1 ano; aplicações: 6 meses'], 'Art. 13: 1 ano para registros de conexão; art. 15: 6 meses para registros de acesso a aplicações.'),
        fill('q4', 'Qual a sigla da Lei 13.709/2018?', 'Lei 13.709/2018: ___', ['LGPD'], 'LGPD é a Lei Geral de Proteção de Dados Pessoais.'),
        mcq('q5', 'Houve um incidente com risco relevante a titulares. O que a LGPD prevê?', 'b', ['Esconder o fato para evitar prejuízo', 'Comunicar a ANPD e os titulares, conforme a regulamentação', 'Apenas apagar os logs', 'Comunicar somente a imprensa'], 'O art. 48 prevê comunicação à ANPD e aos titulares em caso de risco ou dano relevante.'),
        mcq('q6', 'Qual a diferença entre anonimização e pseudonimização?', 'd', ['Não há diferença', 'Pseudonimização torna o dado irreversível e deixa de ser pessoal', 'Anonimização sempre mantém uma chave de reversão', 'Anonimização é irreversível por meios razoáveis; pseudonimização ainda é dado pessoal'], 'Trocar o IP por um código pode ser revertido com informação adicional.'),
        mcq('q7', 'Qual postura é adequada no monitoramento da rede dos funcionários?', 'c', ['Monitorar tudo em segredo', 'Nunca monitorar, nem por segurança', 'Ter finalidade legítima, transparência, proporcionalidade e acesso restrito aos registros', 'Compartilhar os registros com todos os setores'], 'Transparência, proporcionalidade e minimização são essenciais.'),
        fill('q8', 'Qual artigo da LGPD trata das medidas de segurança, técnicas e administrativas? (apenas o número)', 'LGPD, art. ___', ['46'], 'O art. 46 trata da segurança; o art. 48 trata da comunicação de incidentes.')
      ]
    },
    {
      id: 'rda-28-troubleshooting-avancado',
      title: 'Diagnóstico avançado de redes',
      goal: 'Diagnosticar falhas difíceis com capturas em vários pontos, análise de TCP/DNS/roteamento e um método sem culpados.',
      xp: 30,
      intro: {
        slides: [
          sl('Capturar em vários pontos', 'Capturar só em uma ponta engana. Capture no cliente, no servidor e, se possível, no meio: comparando onde um pacote aparece e onde some, você localiza o trecho com problema. O SPAN (porta espelho) copia tráfego no switch, mas pode descartar sob carga e alterar tempos. O TAP é um dispositivo passivo que entrega cópia fiel do enlace. Sincronize os relógios (NTP) para correlacionar.'),
          sl('MTU blackhole e PMTUD', 'O PMTUD descobre o menor MTU do caminho: roteadores que não conseguem encaminhar um pacote grande (com DF) devolvem um ICMP (no IPv4, "fragmentation needed", tipo 3 código 4; no IPv6, "packet too big"). Se um firewall bloqueia esse ICMP, o emissor nunca descobre e o pacote grande some: é o MTU blackhole. Sintoma clássico: o handshake TCP e pacotes pequenos funcionam, mas transferências travam. Soluções: permitir esses ICMPs e ajustar o MSS (MSS = MTU - 20 IP - 20 TCP = 1460 para MTU 1500).'),
          sl('Roteamento assimétrico e firewalls', 'Se ida e volta seguem caminhos diferentes, um firewall stateful que vê só um sentido não encontra o estado da conexão e descarta a resposta. Sintoma: SYN sai, SYN/ACK nunca chega ao cliente, mas existe na outra ponta. Verifique tabelas de rota nos dois sentidos e onde estão os firewalls.'),
          sl('TCP e DNS nas capturas', 'No Wireshark, retransmissões sugerem perda de pacotes (filtro tcp.analysis.retransmission); janela zero (zero window) significa que o RECEPTOR esgotou o buffer, normalmente por aplicação lenta, não por rede. No DNS, olhe a latência; respostas UDP grandes podem vir truncadas (flag TC=1), o que faz o cliente repetir a consulta em TCP; EDNS permite anunciar um tamanho maior de resposta UDP; fragmentos perdidos geram falhas intermitentes.'),
          sl('Roteamento, loops e microbursts', 'Flaps de OSPF/BGP aparecem nos logs como adjacências caindo e voltando (verifique link, timers, MTU incompatível e CPU). Loops de camada 2 geram broadcast storm, CPU alta e MACs mudando de porta (MAC flapping). Microbursts são picos curtos de tráfego que enchem filas e causam descartes enquanto a média de uso, medida a cada minuto, parece baixa.'),
          sl('Método e post-mortem sem culpados', 'Use o método: definir o sintoma, formular hipóteses, testar uma variável por vez por camada, documentar. Correlacione logs, métricas e pacotes na mesma linha do tempo. Depois do incidente, faça um post-mortem sem culpados (blameless): o foco é entender causas sistêmicas e definir ações, não punir pessoas. Capturas podem conter dados pessoais: limite, proteja e descarte.')
        ]
      },
      questions: [
        mcq('q1', 'Pings pequenos e o handshake TCP funcionam, mas downloads grandes travam. Qual é a hipótese mais provável?', 'c', ['Cabo UTP com par invertido', 'DNS desligado', 'MTU blackhole por bloqueio dos ICMPs do PMTUD', 'IP duplicado na VLAN'], 'Pacotes grandes somem quando o ICMP de PMTUD é filtrado.'),
        mcq('q2', 'Qual é uma vantagem do TAP sobre o SPAN?', 'a', ['Entrega cópia fiel e passiva do enlace, sem sobrecarregar o switch', 'Funciona só em Wi-Fi', 'Altera o tráfego original', 'Dispensa captura'], 'O SPAN pode descartar sob carga; o TAP é passivo e fiel.'),
        mcq('q3', 'O que um firewall stateful faz com a resposta que chega por um caminho assimétrico, sem ter visto a ida?', 'b', ['Aceita automaticamente', 'Pode descartar por não encontrar o estado da conexão', 'Reescreve a resposta', 'Cria uma VLAN'], 'Sem estado, o pacote de retorno parece inválido.'),
        fill('q4', 'Qual é o MSS típico para MTU 1500 em IPv4 sem opções (1500 - 20 - 20)?', 'MSS = ___', ['1460'], '1500 - 20 (IP) - 20 (TCP) = 1460 bytes.'),
        mcq('q5', 'O que indica uma janela zero (zero window) em uma captura TCP?', 'd', ['Perda de pacotes na rede', 'Fragmentação em IPv6', 'Falha de DNS', 'O receptor esgotou o buffer, geralmente por aplicação lenta'], 'Janela zero é sinal de gargalo no receptor, não no meio.'),
        mcq('q6', 'Uma resposta DNS chega com TC=1. O que isso significa?', 'b', ['A zona está assinada com DNSSEC', 'A resposta foi truncada e o cliente deve repetir a consulta em TCP', 'O servidor é raiz', 'A consulta foi bloqueada'], 'TC indica truncamento; o cliente reenvia por TCP.'),
        mcq('q7', 'O que é um microburst?', 'a', ['Pico curto de tráfego que causa descartes mesmo com média baixa', 'Falha de firmware em AP', 'Um tipo de ataque DNS', 'Uma loop de STP'], 'Médias de minutos escondem picos de milissegundos que enchem filas.'),
        fill('q8', 'Como se chama o post-mortem que foca em causas sistêmicas, sem buscar culpados? (termo em inglês)', 'post-mortem ___', ['blameless'], 'O post-mortem blameless busca aprendizado e melhorias, não punição.')
      ]
    },
    {
      id: 'rda-29-resposta-incidentes-rede',
      title: 'Resposta a incidentes e forense de rede',
      goal: 'Conduzir o ciclo de resposta a incidentes de rede, preservar evidências e considerar aspectos legais e de privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl('O ciclo de resposta', 'O ciclo tem quatro grandes etapas: preparação (plano, papéis, contatos, ferramentas, logs centralizados com relógios sincronizados), detecção e análise (alertas, triagem, escopo), contenção, erradicação e recuperação, e lições aprendidas (revisão sem culpados e melhorias). Quem se prepara responde mais rápido e com menos improviso.'),
          sl('Contenção', 'Conter é limitar o alcance do incidente: mover o host para uma VLAN de quarentena, desligar a porta do switch, bloquear o IP ou domínio no firewall/DNS, isolar um segmento. Equilibre a contenção com a preservação de evidências: desligar um equipamento na pressa pode apagar dados voláteis. Contenção de curto prazo estanca o problema; a de longo prazo prepara a limpeza.'),
          sl('Erradicação e recuperação', 'Erradicar é remover a causa: malware, contas e chaves comprometidas, a vulnerabilidade explorada. Recuperar é restaurar o serviço a partir de fontes limpas (backups verificados, reconstrução), trocar credenciais e monitorar de perto o retorno de sinais do atacante. Só reconecte depois de ter certeza do escopo.'),
          sl('Evidências e cadeia de custódia', 'Colete segundo a ordem de volatilidade: do mais volátil ao menos (memória, conexões de rede, depois disco). Faça cópias de capturas e logs, calcule o hash (por exemplo SHA-256, com sha256sum arquivo.pcap) para provar integridade e trabalhe sobre cópias. A cadeia de custódia registra quem coletou, quando, onde, como e quem manuseou cada evidência, o que dá credibilidade em eventual processo.', 'sha256sum captura.pcap > captura.pcap.sha256\nsha256sum -c captura.pcap.sha256'),
          sl('IoCs, PCAP e fluxos', 'Indicadores de comprometimento (IoCs) são sinais observáveis de uma intrusão: IPs e domínios maliciosos conhecidos, hashes de arquivos, padrões de tráfego como conexões em intervalos regulares (beaconing) a um destino raro. O PCAP traz o conteúdo dos pacotes (e, portanto, dados pessoais: trate com cuidado); os fluxos são mais leves e permitem ver quem falou com quem, por mais tempo. Use ambos para reconstruir a linha do tempo.'),
          sl('Comunicação, legal e LGPD', 'Defina quem comunica o quê (equipe, gestão, jurídico, clientes), use um canal fora de banda (a rede pode estar comprometida) e registre decisões. Se o incidente envolver dados pessoais com risco ou dano relevante, o art. 48 da LGPD prevê comunicação à ANPD e aos titulares, nos prazos da regulamentação vigente. Isto é visão geral, não aconselhamento jurídico: acione o encarregado (DPO) e o jurídico.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem correta do ciclo de resposta a incidentes?', 'd', ['Contenção, preparação, lições, detecção', 'Lições aprendidas, detecção, preparação, recuperação', 'Erradicação, preparação, contenção, detecção', 'Preparação, detecção e análise, contenção/erradicação/recuperação, lições aprendidas'], 'A preparação vem antes; a revisão fecha o ciclo.'),
        mcq('q2', 'Qual ação de contenção preserva melhor as evidências voláteis?', 'c', ['Desligar o equipamento da tomada imediatamente', 'Formatar o disco', 'Mover o host para uma VLAN de quarentena e coletar as evidências', 'Reinstalar o sistema antes de qualquer coleta'], 'Isolar sem desligar permite coletar memória e conexões antes de limpar.'),
        mcq('q3', 'O que registra a cadeia de custódia?', 'a', ['Quem coletou e manuseou cada evidência, quando, onde e como', 'A lista de senhas do time', 'O orçamento do projeto', 'A topologia lógica da rede'], 'Ela dá credibilidade e rastreabilidade às evidências.'),
        fill('q4', 'Qual algoritmo de hash (SHA-2 de 256 bits) é usado com sha___sum para provar a integridade de uma captura?', 'sha___sum captura.pcap', ['256'], 'sha256sum calcula o hash; mudar um bit altera o resultado e revela adulteração.'),
        mcq('q5', 'Qual a ordem de coleta recomendada pela volatilidade?', 'b', ['Disco primeiro, memória por último', 'Memória e conexões primeiro, disco depois', 'Backup primeiro, memória depois', 'A ordem é irrelevante'], 'Dados voláteis somem ao desligar; colete-os antes.'),
        mcq('q6', 'Qual é um exemplo de IoC de rede?', 'c', ['Um backup que terminou com sucesso', 'Um cabo azul em uma porta', 'Conexões periódicas (beaconing) para um domínio raro ou conhecido como malicioso', 'Um ping com resposta normal'], 'IoCs são sinais observáveis como domínios, IPs e padrões de tráfego suspeitos.'),
        mcq('q7', 'Em um incidente com dados pessoais e risco relevante, qual é a conduta prevista pela LGPD?', 'd', ['Aguardar um ano', 'Comunicar apenas a equipe de TI', 'Apagar os registros do incidente', 'Comunicar a ANPD e os titulares, conforme a regulamentação, com apoio do encarregado e do jurídico'], 'O art. 48 trata da comunicação; os prazos vêm da regulamentação da ANPD.'),
        fill('q8', 'Em qual fase do ciclo se isola o host ou o segmento para limitar o alcance do incidente?', 'Fase: ___', ['contenção', 'contencao'], 'Contenção limita o dano; a erradicação remove a causa.')
      ]
    },
    {
      id: 'rda-30-projeto-integrador',
      title: 'Projeto integrador: rede multi-site',
      goal: 'Sintetizar o curso projetando a rede de uma empresa fictícia multi-site, com revisão técnica e de privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl('A empresa fictícia e os requisitos', 'A Alfa Logística (empresa fictícia) tem uma matriz com data center pequeno, duas filiais e aplicações em nuvem. Requisitos: disponibilidade alta para o sistema de despachos, Wi-Fi para funcionários e visitantes, câmeras e sensores IoT, acesso remoto seguro e conformidade com a LGPD. Antes de desenhar, mapeie quais sistemas tratam dados pessoais (cadastros, câmeras, logs) e defina metas medidas em SLOs.'),
          sl('Endereçamento IPv4 e IPv6', 'Plano IPv4 privado agregável: matriz 10.10.0.0/16, filial A 10.20.0.0/16, filial B 10.30.0.0/16; cada VLAN recebe um /24 dentro do bloco do site (um /16 contém 256 /24; um /24 tem 254 hosts utilizáveis). IPv6: cada site recebe um /48 (aqui no prefixo de documentação 2001:db8::/32), que contém 65.536 sub-redes /64. Agregar facilita sumarização no roteamento.', 'Matriz   10.10.0.0/16   2001:db8:10::/48\nFilial A 10.20.0.0/16   2001:db8:20::/48\nFilial B 10.30.0.0/16   2001:db8:30::/48'),
          sl('VLANs, roteamento e WAN', 'VLANs por função em cada site: usuários, voz, servidores, convidados, IoT/câmeras e gerência. Internamente, OSPF entre os roteadores dos sites e do data center (rápido, com BFD); na borda, BGP com os provedores. ASNs privados de 16 bits vão de 64512 a 65534 e servem para uso interno, como BGP entre sites ou data center. A WAN usa dois links por filial em SD-WAN, com políticas por aplicação e failover.'),
          sl('Wi-Fi, segurança e Zero Trust', 'Wi-Fi com controlador: SSID corporativo com WPA3-Enterprise (802.1X/RADIUS) e SSID de convidados isolado e com portal de coleta mínima. Segmentação com negar por padrão entre zonas, microssegmentação no data center, NGFW/IPS na borda e acesso administrativo apenas por bastion com MFA. Zero Trust: cada acesso verificado por identidade, dispositivo e contexto.'),
          sl('DNS, PKI, observabilidade e automação', 'DNS interno com resolvedores redundantes, DNSSEC onde couber e split-horizon. PKI interna ou emissão automatizada para TLS em todos os serviços, com rotação. Observabilidade: SLIs/SLOs, sondas externas, fluxos e telemetria, com retenção definida. Automação: configurações em templates no Git, CI com validação e rollback, segredos em cofre.'),
          sl('HA, LGPD e checklist final', 'HA: sem SPOF (links, firewalls, FHRP, ECMP, BFD), com RTO e RPO definidos e testados. Checklist técnico: requisitos, endereçamento agregável, segmentação, redundância testada, monitoramento, documentação as-built. Checklist de privacidade: inventário de dados pessoais, finalidade e base legal, minimização de logs/fluxos/PCAP/Wi-Fi, retenção e descarte, controle de acesso, criptografia, plano de incidentes com comunicação (art. 48) e revisão do jurídico/DPO. Use somente dados fictícios.')
        ]
      },
      questions: [
        mcq('q1', 'Qual deve ser a primeira etapa do projeto integrador?', 'b', ['Escolher o modelo de AP', 'Levantar requisitos, SLOs e mapear onde há dados pessoais', 'Configurar o BGP', 'Comprar licenças de firewall'], 'Requisitos e mapeamento de dados guiam todas as decisões seguintes.'),
        mcq('q2', 'Quantas sub-redes /64 cabem em um prefixo IPv6 /48?', 'd', ['256', '1.024', '4.096', '65.536'], 'Sobram 64 - 48 = 16 bits para sub-redes: 2^16 = 65.536.'),
        mcq('q3', 'Quantas sub-redes /24 existem dentro de um bloco IPv4 /16?', 'c', ['16', '128', '256', '1.024'], 'Sobram 8 bits: 2^8 = 256.'),
        fill('q4', 'Qual é o primeiro ASN do intervalo privado de 16 bits (64512 a 65534)?', 'ASN privado inicial: ___', ['64512'], 'RFC 6996 reserva 64512 a 65534 para ASNs privados de 16 bits.'),
        mcq('q5', 'Qual é a divisão típica de protocolos de roteamento neste projeto?', 'a', ['OSPF no interior e BGP na borda com provedores', 'BGP para o switch de acesso e OSPF para a internet', 'RIP em toda a rede', 'Rotas estáticas apenas em tudo'], 'IGP (OSPF) para dentro; BGP para a fronteira entre sistemas autônomos.'),
        mcq('q6', 'Qual item pertence ao checklist de privacidade do projeto?', 'd', ['Reter todos os logs de fluxo indefinidamente', 'Guardar PCAPs completos sem controle de acesso', 'Coletar o máximo de dados no portal de convidados', 'Definir finalidade, minimização, retenção, acesso e criptografia para logs, fluxos, DNS e Wi-Fi'], 'Privacidade exige finalidade, necessidade, segurança e descarte.'),
        mcq('q7', 'Como as mudanças de configuração devem fluir neste projeto?', 'b', ['Direto no equipamento, sem registro', 'Templates e variáveis no Git, revisão, CI com validação e plano de rollback', 'Por e-mail entre administradores', 'Somente pelo fabricante'], 'Fluxo versionado, revisado e testado reduz erros e permite reverter.'),
        fill('q8', 'Quantos hosts utilizáveis tem uma sub-rede IPv4 /24?', 'Hosts utilizáveis em uma /24: ___', ['254'], '2^8 = 256 endereços, menos o de rede e o de broadcast = 254.')
      ]
    },
  ]
};
