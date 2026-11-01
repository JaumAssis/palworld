// Módulo "Fundamentos" do curso de Redes de Computadores — 26 lições, 8 questões cada (3 múltipla
// escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a validação de
// boot. Para não repetir 208 vezes o mesmo objeto literal, as questões usam helpers locais:
// mc(id, prompt, letra, certa, [3 erradas], explicação) insere a alternativa correta na posição da
// letra escolhida à mão (a/b/c/d, variada entre lições) e as erradas nas demais; fill() recebe
// prompt, código com a lacuna ___ e a lista de respostas aceitas (a 1ª é a canônica); sl() monta
// um slide (code opcional). Todos os números (binário, máscaras, sub-redes, conversões) foram
// conferidos por script. Só endereços de exemplo reservados: documentação (192.0.2.0/24,
// 198.51.100.0/24, 203.0.113.0/24) e privados (10/8, 172.16/12, 192.168/16); nenhum dado pessoal
// real. Segurança e privacidade (LGPD) aparecem de forma conceitual e defensiva (lições 14, 22, 23,
// 24): sem instruções operacionais de ataque, só como reconhecer e se proteger. Sem velocidades,
// versões ou preços que envelhecem — só conceitos e fatos estáveis dos protocolos.
const mc = (id, prompt, letter, correct, wrongs, explanation) => {
  const texts = [...wrongs];
  texts.splice('abcd'.indexOf(letter), 0, correct);
  return {
    id,
    kind: 'mcq',
    prompt,
    choices: texts.map((text, i) => ({ id: 'abcd'[i], text })),
    answer: letter,
    explanation
  };
};

const fill = (id, prompt, code, accept, explanation) => ({ id, kind: 'fill', prompt, code, accept, explanation });

const sl = (title, body, code) => (code ? { title, body, code } : { title, body });

module.exports = {
  id: 'fundamentos-redes',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Da primeira conexão ao diagnóstico: modelos em camadas, Ethernet, IPv4 e sub-redes, TCP/UDP, DNS, DHCP, NAT, web, Wi-Fi e segurança básica',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'rdb-01-o-que-e-rede',
      title: 'O que é uma rede de computadores',
      goal: 'Entender o que é uma rede, seus tipos por alcance, a diferença entre internet e web e as topologias básicas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Rede = nós ligados por enlaces',
            'Uma rede de computadores é um conjunto de dispositivos ligados para trocar dados e compartilhar recursos (arquivos, impressora, internet). Cada dispositivo que participa da rede — computador, celular, impressora, câmera, roteador — é chamado de NÓ (ou host, quando é um dispositivo final). A ligação entre dois nós é um ENLACE (link): pode ser um cabo ou uma onda de rádio (Wi-Fi). Toda a área de redes é, no fundo, sobre como nós conversam por enlaces.',
            'Nó A ---- enlace ---- Nó B\n(notebook)                (impressora)'
          ),
          sl(
            'Tipos de rede por alcance: PAN, LAN, MAN, WAN',
            'PAN (Personal Area Network): alcance de uma pessoa, poucos metros — o fone Bluetooth ligado ao celular. LAN (Local Area Network): rede local de um espaço só — sua casa, um escritório, uma escola. MAN (Metropolitan Area Network): cobre uma cidade ou região metropolitana — por exemplo a rede que liga prédios de uma prefeitura. WAN (Wide Area Network): cobre grandes distâncias, entre cidades, estados ou países — liga LANs distantes, como as filiais de uma empresa. A internet é a maior WAN que existe.',
            'PAN  ->  poucos metros   (celular + fone)\nLAN  ->  um prédio/casa   (seu Wi-Fi)\nMAN  ->  uma cidade\nWAN  ->  países/continentes'
          ),
          sl(
            'Internet não é a mesma coisa que web',
            'A INTERNET é a infraestrutura: milhões de redes interligadas no mundo todo, trocando dados com um conjunto comum de regras (protocolos). A WEB (World Wide Web) é só UM serviço que roda sobre a internet: páginas e sites acessados pelo navegador usando HTTP. E-mail, jogos online, videochamadas e transferência de arquivos também usam a internet, mas não são "a web". Resumindo: a internet é a estrada; a web é um dos tipos de veículo que trafega nela.'
          ),
          sl(
            'Intranet e extranet',
            'INTRANET é uma rede privada de uma organização, acessível só por seus membros — o portal interno de uma empresa, por exemplo. Usa as mesmas tecnologias da internet (navegador, HTTP), mas é fechada ao público. EXTRANET é uma extensão controlada da intranet para pessoas de fora e de confiança, como fornecedores ou parceiros, que acessam só uma parte dos recursos, com login. Internet = aberta ao mundo; intranet = só de dentro; extranet = de dentro mais convidados autorizados.'
          ),
          sl(
            'Cliente-servidor vs ponto a ponto (P2P)',
            'No modelo CLIENTE-SERVIDOR, há papéis fixos: o servidor fica ligado esperando e oferece um serviço (um site, um arquivo); o cliente pede e recebe. Seu navegador é cliente; o computador que guarda o site é servidor. No modelo PONTO A PONTO (P2P — peer-to-peer), todos os participantes são iguais: cada um é ao mesmo tempo cliente e servidor, e compartilham recursos direto entre si, sem um servidor central obrigatório. Cliente-servidor facilita controle e segurança centralizados; P2P distribui a carga entre os participantes.'
          ),
          sl(
            'Topologias físicas: barramento, estrela, anel, malha',
            'Topologia é o desenho da rede. BARRAMENTO: todos os nós num único cabo compartilhado (histórico; se o cabo rompe, a rede cai). ESTRELA: todos ligados a um dispositivo central (hoje um switch) — é a topologia dominante nas LANs; se um cabo falha só aquele nó cai, mas se o central falha, tudo para. ANEL: cada nó liga ao vizinho formando um círculo. MALHA: nós com várias ligações entre si, o que dá redundância; na malha COMPLETA todos ligam a todos, e o número de enlaces é n×(n−1)/2 (4 nós → 4×3/2 = 6 enlaces). A internet é, na prática, uma malha parcial.',
            'Estrela:   A   B   C        Malha (4 nós):\n            \\  |  /           A--B\n            [switch]          |\\/|\n                              |/\\|\n                              C--D'
          ),
          sl(
            'Topologia física vs lógica',
            'A topologia FÍSICA é como cabos e equipamentos estão realmente instalados. A topologia LÓGICA é como os dados circulam. As duas podem diferir: uma rede antiga com hub é fisicamente em estrela (todos os cabos vão ao hub), mas logicamente funciona como barramento, pois tudo que um nó envia é repetido para todos. Ao ouvir "topologia", pergunte-se: estão falando do desenho dos cabos ou do caminho dos dados?'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual afirmação distingue corretamente internet e web?', 'b', 'A internet é a infraestrutura de redes interligadas; a web é um serviço (sites via HTTP) que roda sobre ela', [
          'Internet e web são exatamente a mesma coisa',
          'A web é a infraestrutura física e a internet é apenas o navegador',
          'A internet só existe quando há Wi-Fi, e a web quando há cabo'
        ], 'A web é um dos serviços que usam a internet; e-mail e jogos online também a usam sem serem "a web".'),
        mc('q2', 'Uma empresa liga a LAN da matriz, em uma cidade, às LANs de filiais em outros estados. Esse tipo de rede é uma:', 'd', 'WAN', [
          'PAN',
          'LAN',
          'Topologia em anel'
        ], 'WAN cobre grandes distâncias, ligando LANs distantes. PAN é de alcance pessoal e LAN é local.'),
        mc('q3', 'Um fornecedor de confiança acessa, com login, apenas parte dos sistemas internos de uma empresa. Isso é um exemplo de:', 'a', 'Extranet', [
          'Intranet pura, sem acesso externo',
          'Rede P2P',
          'Topologia em barramento'
        ], 'Extranet estende a intranet de forma controlada a pessoas de fora e autorizadas.'),
        fill('q4', 'Complete com a sigla do tipo de rede de alcance pessoal (poucos metros), como celular + fone Bluetooth:', 'Celular + fone Bluetooth formam uma ___', ['PAN', 'rede PAN'], 'PAN = Personal Area Network, a rede de alcance de uma pessoa.'),
        mc('q5', 'Em qual modelo todos os participantes atuam ao mesmo tempo como cliente e servidor?', 'c', 'Ponto a ponto (P2P)', [
          'Cliente-servidor',
          'Intranet',
          'Topologia em estrela'
        ], 'No P2P os pares compartilham recursos entre si; no cliente-servidor os papéis são fixos.'),
        mc('q6', 'Quantos enlaces tem uma malha completa de 5 nós, em que todos ligam a todos? (use n×(n−1)/2)', 'b', '10', [
          '5',
          '15',
          '20'
        ], '5×4/2 = 10 enlaces. Cada nó liga a outros 4, e dividimos por 2 para não contar o mesmo enlace duas vezes.'),
        mc('q7', 'Uma rede antiga usa um hub: todos os cabos vão a ele, mas tudo que um nó envia é repetido para todos. Qual descreve melhor?', 'd', 'Fisicamente em estrela e logicamente em barramento', [
          'Fisicamente em barramento e logicamente em estrela',
          'Fisicamente em anel e logicamente em malha',
          'Fisicamente em malha e logicamente em anel'
        ], 'O desenho dos cabos (físico) é estrela; o comportamento dos dados (lógico) lembra um barramento compartilhado.'),
        fill('q8', 'Complete com o nome da topologia física mais usada nas LANs atuais, com um switch central:', 'Topologia dominante nas LANs: ___', ['estrela', 'em estrela', 'star'], 'Estrela: todos os nós ligam a um switch central, e a falha de um cabo derruba só aquele nó.')
      ]
    },
    {
      id: 'rdb-27-comutacao-historia-padroes',
      title: 'Como a internet funciona: comutação de pacotes, história e padrões',
      goal: 'Entender comutação de circuitos e de pacotes, a ideia de rede de redes, o papel dos protocolos e padrões e o vocabulário básico de redes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Comutação de circuitos: o modelo do telefone clássico',
            'Na telefonia clássica, quando você ligava para alguém, a rede RESERVAVA um caminho exclusivo entre os dois telefones durante toda a conversa. Esse caminho se chama CIRCUITO. Enquanto a ligação durava, aquele pedaço da rede era só seu, mesmo nos momentos de silêncio, em que nada trafegava. Vantagem: qualidade constante e previsível. Desvantagem: desperdício, porque a capacidade reservada fica parada quando ninguém fala, e ninguém mais pode usá-la. Isso é a COMUTAÇÃO DE CIRCUITOS: primeiro monta-se o caminho, depois se conversa.'
          ),
          sl(
            'Comutação de pacotes: o modelo da internet',
            'Na COMUTAÇÃO DE PACOTES, a mensagem é cortada em pedaços pequenos chamados PACOTES. Cada pacote leva no cabeçalho o endereço de destino e viaja de forma independente: os roteadores olham o destino de cada um e decidem o próximo passo. Não existe caminho reservado. Os pacotes de muitas conversas diferentes se misturam e DIVIDEM os mesmos enlaces. Como cada pacote escolhe seu caminho, dois pacotes da mesma mensagem podem seguir rotas diferentes e chegar FORA DE ORDEM; o destino os reordena (numerados pelo protocolo) antes de entregar tudo ao programa.',
            'Mensagem -> [P1][P2][P3]\nP1 -> rota A ------\\\nP2 -> rota B ------- destino (reordena: P1,P2,P3)\nP3 -> rota A ------/'
          ),
          sl(
            'Por que a internet usa pacotes',
            'Duas razões principais. EFICIÊNCIA: como o enlace é compartilhado, quando uma conversa fica em silêncio os pacotes de outras usam o espaço. Nada fica reservado e parado, então muito mais usuários cabem na mesma infraestrutura. RESILIÊNCIA: como não há um caminho fixo, se um roteador ou enlace falha, os pacotes seguintes podem simplesmente seguir outra rota. O preço dessa escolha: o tempo de chegada pode variar, pacotes podem se perder, e por isso existem protocolos (como o TCP) que cuidam de reenviar e reordenar quando necessário.'
          ),
          sl(
            'A rede de redes e um pouco de história',
            'A internet (de INTERNETworking) é uma REDE DE REDES: milhares de redes independentes (de provedores, empresas, universidades, casas), cada uma com seus próprios equipamentos, interligadas por roteadores que seguem regras comuns. Nenhuma organização é dona de tudo. Em visão geral: a ARPANET, rede de pesquisa financiada pelo governo dos Estados Unidos, é considerada a origem da internet e foi uma das primeiras a usar comutação de pacotes; mais tarde, a família de protocolos TCP/IP foi adotada como a linguagem comum que permitiu interligar redes diferentes; e nos anos 1990 surgiu a web, que levou a internet ao grande público. Guarde a sequência das ideias: rede experimental, protocolos comuns, serviço popular.'
          ),
          sl(
            'Protocolo e por que padronizar',
            'PROTOCOLO é um conjunto de regras que dois dispositivos seguem para se comunicar: qual o formato das mensagens, em que ordem se trocam, o que fazer em caso de erro. É como uma etiqueta de conversa: se um lado "fala" de um jeito que o outro não entende, não há comunicação. PADRONIZAR é publicar essas regras de forma que fabricantes diferentes criem equipamentos e programas compatíveis. Graças a isso, um celular de uma marca acessa um site hospedado num servidor de outra, passando por roteadores de vários fabricantes. Essa capacidade de funcionar junto chama-se INTEROPERABILIDADE.'
          ),
          sl(
            'Quem define os padrões',
            'IETF (Internet Engineering Task Force): comunidade que desenvolve os protocolos da internet. Seus documentos são as RFCs (Request for Comments), públicas e numeradas; por exemplo, a RFC 1918 define os endereços IP privados. IEEE: organização que padroniza tecnologias de enlace local; o grupo 802.3 define a Ethernet e o 802.11 define o Wi-Fi. ISO e ITU: organismos internacionais; a ISO publicou o modelo OSI, e a ITU cuida de padrões de telecomunicações. IANA e ICANN: coordenam recursos globais, como a distribuição de blocos de endereços IP, parâmetros dos protocolos (números de portas, por exemplo) e a raiz do sistema de nomes de domínio (DNS).',
            'IETF  -> protocolos da internet (RFCs)\nIEEE   -> 802.3 Ethernet, 802.11 Wi-Fi\nISO/ITU-> modelo OSI, telecomunicações\nIANA/ICANN -> endereços, portas, nomes'
          ),
          sl(
            'Padrão aberto, padrão proprietário e vocabulário essencial',
            'Padrão ABERTO tem especificação pública, que qualquer fabricante pode implementar (as RFCs são o exemplo): favorece interoperabilidade e concorrência. Padrão PROPRIETÁRIO é controlado por uma empresa, que pode restringir o uso: pode funcionar bem dentro do ecossistema dela, mas prende o cliente e dificulta a compatibilidade. Vocabulário: HOST é um dispositivo final da rede; CLIENTE pede um serviço e SERVIDOR o oferece; ROTEADOR liga redes e encaminha pacotes; LINK (enlace) é a ligação entre dois nós; PACOTE é a unidade de dados da camada de rede (IP); QUADRO é a unidade da camada de enlace (Ethernet); DATAGRAMA é um pacote enviado sem conexão prévia (como no IP e no UDP); PROTOCOLO são as regras da conversa.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é uma vantagem da comutação de pacotes em relação à de circuitos para a internet?', 'c', 'Vários usuários dividem os mesmos enlaces e, se um caminho falha, os pacotes podem seguir outra rota', [
          'Cada conversa recebe um caminho exclusivo e fixo durante todo o tempo',
          'Os pacotes sempre chegam na ordem em que foram enviados, sem qualquer reordenação',
          'Não é necessário nenhum endereço de destino nos dados'
        ], 'Compartilhar o meio dá eficiência e a ausência de caminho fixo dá resiliência. O preço é que a ordem e o tempo de chegada podem variar.'),
        mc('q2', 'Numa rede de comutação de pacotes, os pacotes P1, P2 e P3 de uma mesma mensagem chegam como P2, P1, P3. O que isso indica?', 'a', 'É possível: seguiram rotas diferentes e o destino os reordena antes de entregar a mensagem', [
          'A mensagem foi corrompida e deve ser descartada por completo',
          'A rede usa comutação de circuitos',
          'Os roteadores trocaram os endereços de destino'
        ], 'Cada pacote viaja de forma independente, então a chegada fora de ordem é normal; protocolos como o TCP numeram e reordenam.'),
        mc('q3', 'Por que a internet é chamada de "rede de redes"?', 'd', 'Porque interliga muitas redes independentes por meio de roteadores que seguem regras comuns', [
          'Porque pertence a uma única empresa que administra todas as redes',
          'Porque só existe dentro de uma rede local',
          'Porque cada rede precisa usar o mesmo equipamento do mesmo fabricante'
        ], 'Internetworking é a interligação de redes diferentes; nenhuma organização é dona de tudo e a interoperabilidade vem dos protocolos comuns.'),
        fill('q4', 'Complete: a telefonia clássica reservava um caminho exclusivo para cada chamada, usando comutação de ___.', 'A telefonia clássica usava comutação de ___', ['circuitos', 'circuito'], 'Na comutação de circuitos o caminho é reservado durante toda a conversa, mesmo quando ninguém fala.'),
        mc('q5', 'Qual organização desenvolve os protocolos da internet e publica os documentos chamados RFCs?', 'b', 'IETF', [
          'IEEE',
          'ITU',
          'Nenhuma: as RFCs são privadas de cada fabricante'
        ], 'O IETF produz as RFCs, públicas e numeradas. O IEEE padroniza, por exemplo, Ethernet e Wi-Fi.'),
        mc('q6', 'Qual padrão do IEEE define o Wi-Fi?', 'c', '802.11', [
          '802.3',
          'RFC 1918',
          'OSI'
        ], 'O 802.11 é o Wi-Fi; o 802.3 é a Ethernet; a RFC 1918 trata de endereços IP privados.'),
        mc('q7', 'Qual o principal benefício de um padrão aberto?', 'a', 'Fabricantes diferentes podem criar produtos compatíveis entre si (interoperabilidade)', [
          'Só uma empresa pode fabricar equipamentos compatíveis',
          'Ele elimina a necessidade de protocolos',
          'Ele impede que qualquer outra pessoa leia a especificação'
        ], 'A especificação pública permite implementação por qualquer um, o que favorece compatibilidade e concorrência.'),
        fill('q8', 'Complete com o nome da unidade de dados da camada de enlace (Ethernet):', 'Na Ethernet, a unidade de dados da camada de enlace chama-se ___', ['quadro', 'frame'], 'Quadro (frame) é a unidade da camada de enlace; pacote é a da camada de rede.')
      ]
    },
    {
      id: 'rdb-02-meios-dispositivos',
      title: 'Meios de transmissão e dispositivos de rede',
      goal: 'Conhecer os meios (cabos e rádio) e o que cada dispositivo de rede faz e em qual camada age.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Par trançado: UTP e STP',
            'É o cabo de rede mais comum. Dentro dele há 4 pares de fios de cobre trançados entre si — o trançado reduz a interferência elétrica. UTP (Unshielded Twisted Pair) não tem blindagem: barato e flexível, ideal para casas e escritórios. STP (Shielded Twisted Pair) tem uma blindagem metálica ao redor dos pares, que protege melhor em ambientes com muita interferência (perto de motores, por exemplo), mas custa mais e é mais rígido. O conector usado é o RJ-45.'
          ),
          sl(
            'Coaxial e fibra óptica',
            'O cabo COAXIAL (um condutor central cercado por isolante e malha metálica) foi usado nas primeiras redes Ethernet em barramento; hoje é histórico em LANs (ainda aparece em TV a cabo). A FIBRA ÓPTICA transmite dados como pulsos de LUZ dentro de um fio de vidro: não sofre interferência elétrica, alcança grandes distâncias e velocidades altíssimas. Há dois tipos: MONOMODO (núcleo muito fino, um só caminho de luz, longas distâncias — dezenas de quilômetros) e MULTIMODO (núcleo mais grosso, vários caminhos de luz, distâncias curtas, como dentro de um prédio ou data center).'
          ),
          sl(
            'Meio sem fio',
            'Em vez de cabo, os dados viajam por ondas de rádio no ar: Wi-Fi, Bluetooth, redes celulares. Vantagem: mobilidade e nenhuma passagem de cabo. Desvantagens: o ar é compartilhado (interferência de outras redes e aparelhos), o sinal enfraquece com distância e obstáculos (paredes), e qualquer pessoa ao alcance pode tentar "escutar" — por isso a criptografia é essencial (veremos no módulo de Wi-Fi).'
          ),
          sl(
            'NIC, hub e repetidor',
            'NIC (Network Interface Card, placa de rede): o componente que liga um dispositivo à rede — cabeada ou Wi-Fi. Cada NIC tem um endereço MAC próprio. HUB: dispositivo antigo que repete, por TODAS as portas, qualquer sinal que chega numa delas, sem inteligência — todos recebem tudo e disputam o mesmo meio. REPETIDOR: regenera e retransmite o sinal para ampliar o alcance (o hub é, essencialmente, um repetidor multiportas). Hub e repetidor agem na camada FÍSICA (1): só mexem com bits/sinais, sem entender endereços.'
          ),
          sl(
            'Switch e roteador',
            'SWITCH: liga dispositivos de uma mesma rede local. Lê o endereço MAC de destino de cada quadro e o envia só pela porta certa (veremos em detalhe numa lição própria). Age na camada de ENLACE (2). ROTEADOR: liga REDES diferentes entre si (por exemplo sua LAN e a internet). Olha o endereço IP de destino de cada pacote e decide por qual caminho enviá-lo. Age na camada de REDE (3). Regra de bolso: switch conecta dispositivos dentro de uma rede; roteador conecta redes.'
          ),
          sl(
            'Modem/ONT, access point e firewall',
            'MODEM: converte o sinal digital do seu equipamento no tipo de sinal que o meio do provedor usa (e vice-versa), como a linha telefônica (ADSL) ou o cabo da TV. ONT (Optical Network Terminal) faz papel parecido em redes de fibra: converte a luz da fibra do provedor em Ethernet para sua casa. ACCESS POINT (AP): cria uma rede Wi-Fi e a liga à rede cabeada (camada 2). FIREWALL: filtra o tráfego, permitindo ou bloqueando conexões segundo regras (pode ser software no computador ou equipamento dedicado; atua principalmente nas camadas 3 e 4, e alguns avançam até a 7).',
            'Dispositivo        Camada\nRepetidor / Hub    1 (física)\nSwitch / AP        2 (enlace)\nRoteador           3 (rede)\nFirewall           3-4 (ou mais)'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual a principal diferença entre cabo UTP e STP?', 'c', 'O STP tem blindagem metálica ao redor dos pares; o UTP não tem', [
          'O UTP usa fibra e o STP usa cobre',
          'O STP não tem pares trançados',
          'O UTP só funciona sem fio'
        ], 'STP = Shielded (blindado), melhor contra interferência; UTP = Unshielded, mais barato e flexível. Ambos são de cobre e trançados.'),
        mc('q2', 'Qual fibra óptica é indicada para distâncias longas, como entre cidades?', 'a', 'Monomodo', [
          'Multimodo',
          'Coaxial',
          'UTP'
        ], 'Monomodo tem núcleo muito fino e um só caminho de luz, o que permite longas distâncias. Multimodo serve para distâncias curtas.'),
        mc('q3', 'Qual meio de transmissão NÃO sofre interferência elétrica por transmitir luz?', 'd', 'Fibra óptica', [
          'Par trançado UTP',
          'Wi-Fi',
          'Cabo coaxial'
        ], 'A fibra leva pulsos de luz em vidro, imune a interferência eletromagnética.'),
        fill('q4', 'Complete com o nome do conector usado nos cabos de par trançado de rede:', 'Conector do cabo de rede Ethernet: ___', ['RJ-45', 'RJ45'], 'O RJ-45 é o conector de 8 pinos dos cabos Ethernet de par trançado.'),
        mc('q5', 'Qual dispositivo liga REDES diferentes e decide o caminho olhando o endereço IP?', 'b', 'Roteador', [
          'Hub',
          'Repetidor',
          'Placa de rede'
        ], 'O roteador age na camada 3 e interliga redes, escolhendo o caminho pelo IP de destino.'),
        mc('q6', 'Um hub recebe um sinal em uma porta. O que ele faz?', 'd', 'Repete o sinal por todas as outras portas, sem entender endereços', [
          'Envia só para a porta do destinatário, lendo o MAC',
          'Bloqueia o sinal se não souber o destino',
          'Converte o sinal em IP e o encaminha à internet'
        ], 'O hub é um repetidor multiportas da camada física: não lê endereços, só replica o sinal.'),
        mc('q7', 'Em qual camada do modelo OSI o switch e o access point agem principalmente?', 'a', 'Camada 2 (enlace)', [
          'Camada 1 (física)',
          'Camada 3 (rede)',
          'Camada 7 (aplicação)'
        ], 'Switch e AP encaminham quadros usando endereços MAC, função da camada de enlace.'),
        fill('q8', 'Em redes de fibra, o equipamento do provedor que converte a luz da fibra em Ethernet para a casa chama-se (sigla):', 'Equipamento óptico do cliente: ___', ['ONT'], 'ONT (Optical Network Terminal) converte o sinal óptico em Ethernet; o modem faz papel análogo em outros meios.')
      ]
    },
    {
      id: 'rdb-03-binario-hex',
      title: 'Binário e hexadecimal para redes',
      goal: 'Converter entre decimal, binário e hexadecimal e usar AND/OR, base do endereçamento IP, MAC e máscaras.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Bits e bytes',
            'Computadores guardam tudo como BITS: cada bit vale 0 ou 1 (ligado/desligado). Um grupo de 8 bits é um BYTE (também chamado de octeto em redes, pois sempre tem 8 bits). Um byte pode formar 2^8 = 256 combinações diferentes, de 0 a 255. Um endereço IPv4 tem 4 octetos (32 bits); um endereço MAC tem 6 bytes (48 bits). Por isso, entender binário não é opcional em redes: é a linguagem dos endereços e das máscaras.'
          ),
          sl(
            'Potências de 2 e o valor de cada posição',
            'Em binário, cada posição vale uma potência de 2, da direita para a esquerda. Num octeto, as posições valem 128, 64, 32, 16, 8, 4, 2, 1. Decore essa fila: ela é a base de todo o cálculo de sub-redes. Outras potências úteis: 2^10 = 1024, 2^16 = 65536.',
            'posição:  128  64  32  16   8   4   2   1\nbit:        1   1   0   0   1   0   0   0\nvalor:    128+64+8 = 200'
          ),
          sl(
            'Binário → decimal e decimal → binário',
            'Binário→decimal: some os valores das posições que têm bit 1. Exemplo: 10110 = 16 + 4 + 2 = 22. Decimal→binário: percorra a fila 128, 64, 32... e, para cada valor, se ele CABE no que sobrou, escreva 1 e subtraia; senão, escreva 0. Exemplo, 172: 128 cabe (sobra 44) → 1; 64 não cabe → 0; 32 cabe (sobra 12) → 1; 16 não → 0; 8 cabe (sobra 4) → 1; 4 cabe (sobra 0) → 1; 2 → 0; 1 → 0. Resultado: 10101100.',
            '172 -> 10101100\n192 -> 11000000\n168 -> 10101000\n 10 -> 00001010\n255 -> 11111111'
          ),
          sl(
            'Hexadecimal: base 16',
            'Hexadecimal usa 16 símbolos: 0–9 e A–F, onde A=10, B=11, C=12, D=13, E=14, F=15. Cada dígito hex representa exatamente 4 bits, então 1 byte = 2 dígitos hex (de 00 a FF). Conversão: valor = dígito1×16 + dígito2. Exemplos: 1F = 1×16 + 15 = 31; A0 = 10×16 + 0 = 160; FF = 15×16 + 15 = 255. É o formato dos endereços MAC (como 00:1A:2B:3C:4D:5E) e de partes dos endereços IPv6.',
            'hex  bin\n 0   0000\n 9   1001\n A   1010\n F   1111\n\n2B = 0010 1011 = 32+8+2+1 = 43'
          ),
          sl(
            'Operação AND',
            'AND compara dois bits: o resultado é 1 SOMENTE se os dois bits forem 1. Em qualquer outro caso, é 0. Aplicada bit a bit entre dois números, é exatamente o que um computador faz para descobrir a rede de um IP, aplicando a máscara. Regra prática: AND com 1 mantém o bit original; AND com 0 zera o bit.',
            '  11000000   (192)\nAND 10100000   (160)\n  --------\n  10000000   (128)'
          ),
          sl(
            'Operação OR e por que isso importa',
            'OR dá 1 se PELO MENOS UM dos bits for 1; só dá 0 se ambos forem 0. É usado, por exemplo, para calcular o endereço de broadcast (colocar 1 em todos os bits de host). Em resumo: IP e máscara são 32 bits, MAC é 48 bits; o roteador aplica AND para separar rede de host, e você aprenderá a fazer isso à mão nas próximas lições. Dominar a fila 128-64-32-16-8-4-2-1 e o AND vai fazer sub-redes parecerem simples.',
            '  11000000   (192)\nOR  00001010   (10)\n  --------\n  11001010   (202)'
          )
        ]
      },
      questions: [
        mc('q1', 'Quantos valores diferentes cabem em 1 byte (8 bits)?', 'c', '256 (de 0 a 255)', [
          '255 (de 1 a 255)',
          '128 (de 0 a 127)',
          '512 (de 0 a 511)'
        ], '2^8 = 256 combinações, representando os números de 0 a 255.'),
        mc('q2', 'Qual é o valor decimal do binário 11001000?', 'a', '200', [
          '192',
          '208',
          '168'
        ], '128 + 64 + 8 = 200. Somam-se só as posições com bit 1.'),
        mc('q3', 'Qual é o binário do decimal 172?', 'd', '10101100', [
          '10101001',
          '11000100',
          '10110010'
        ], '172 = 128 + 32 + 8 + 4, ou seja, 10101100.'),
        fill('q4', 'Complete com o valor decimal do hexadecimal 1F:', 'Hex 1F em decimal = ___', ['31'], '1F = 1×16 + 15 = 31.'),
        mc('q5', 'Quantos bits representa cada dígito hexadecimal?', 'b', '4 bits', [
          '2 bits',
          '8 bits',
          '16 bits'
        ], 'Cada dígito hex (0–F) tem 16 valores = 2^4, logo 4 bits; 2 dígitos hex formam 1 byte.'),
        mc('q6', 'Qual é o resultado de 11000000 AND 10100000?', 'd', '10000000', [
          '11100000',
          '01100000',
          '00000000'
        ], 'AND dá 1 só onde os dois bits são 1: apenas o primeiro bit coincide.'),
        mc('q7', 'Qual é o resultado de 11000000 OR 00001010 (em binário)?', 'c', '11001010', [
          '00000000',
          '11000000',
          '00001010'
        ], 'OR dá 1 onde qualquer um dos bits é 1: a união dos dois padrões, 11001010 (202).'),
        fill('q8', 'Complete com o valor decimal do hexadecimal A0:', 'Hex A0 em decimal = ___', ['160'], 'A = 10, então A0 = 10×16 + 0 = 160.')
      ]
    },
    {
      id: 'rdb-04-modelos-camadas',
      title: 'Modelos em camadas: OSI e TCP/IP',
      goal: 'Conhecer as camadas do OSI e do TCP/IP, o que cada uma faz e como os dados são encapsulados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que dividir em camadas',
            'Comunicar pela rede envolve centenas de detalhes: sinais elétricos, endereços, rotas, confiabilidade, formato dos dados. Para organizar isso, a rede é dividida em CAMADAS: cada uma resolve um pedaço do problema, usa os serviços da camada de baixo e oferece serviços à camada de cima. Vantagens: dá para trocar uma camada (ex.: de cabo para Wi-Fi) sem mexer nas outras, equipes diferentes cuidam de partes diferentes, e fica fácil diagnosticar: "o problema está em qual camada?". Dois modelos de referência: OSI (teórico, 7 camadas) e TCP/IP (o que a internet realmente usa).'
          ),
          sl(
            'As 7 camadas do modelo OSI',
            'De cima para baixo: 7 Aplicação (serviços para o programa do usuário: HTTP, DNS, e-mail), 6 Apresentação (formato dos dados, compressão, criptografia), 5 Sessão (abrir, manter e encerrar diálogos entre aplicações), 4 Transporte (comunicação entre processos: portas, TCP/UDP), 3 Rede (endereçamento lógico IP e roteamento entre redes), 2 Enlace (comunicação dentro da mesma rede: endereços MAC, quadros), 1 Física (bits como sinais elétricos, luz ou rádio, cabos, conectores). Mnemônico para decorar de baixo para cima: "Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação" (FERTSAA).',
            '7 Aplicação\n6 Apresentação\n5 Sessão\n4 Transporte\n3 Rede\n2 Enlace de dados\n1 Física'
          ),
          sl(
            'O modelo TCP/IP',
            'O modelo TCP/IP, que descreve a internet real, é mais enxuto. Na versão de 4 camadas: Aplicação (junta as camadas 5, 6 e 7 do OSI), Transporte (= camada 4), Internet (= camada 3, onde vive o IP) e Acesso à rede/Interface de rede (junta enlace e física, 2 e 1). Muitos livros usam a versão de 5 camadas, que separa Enlace e Física. Na prática, falamos "camada 2" e "camada 3" com a numeração do OSI, mesmo estudando TCP/IP.',
            'OSI            TCP/IP (4)\n7 Aplicação    \n6 Apresentação  Aplicação\n5 Sessão       \n4 Transporte    Transporte\n3 Rede          Internet\n2 Enlace       \n1 Física        Acesso à rede'
          ),
          sl(
            'Encapsulamento: cada camada põe seu envelope',
            'Quando um programa envia dados, eles DESCEM as camadas, e cada camada acrescenta o seu CABEÇALHO (e às vezes um rodapé) à frente do que veio de cima — como colocar uma carta dentro de envelopes sucessivos. Isso é ENCAPSULAMENTO. O nome do bloco de dados em cada camada é a PDU (Protocol Data Unit): Aplicação = dados (ou mensagem); Transporte = SEGMENTO (TCP) ou datagrama (UDP); Rede = PACOTE; Enlace = QUADRO (frame); Física = BITS.',
            'Dados\n  + cabeçalho de transporte -> Segmento\n  + cabeçalho IP            -> Pacote\n  + cabeçalho/rodapé Ethernet -> Quadro\n  -> convertido em bits no cabo'
          ),
          sl(
            'Desencapsulamento no destino',
            'Ao chegar ao destino, o caminho se inverte: os bits sobem a camada física, viram um quadro; a camada de enlace confere o endereço MAC e retira seu cabeçalho; a de rede confere o IP e retira o dela; a de transporte usa a porta para entregar ao programa certo e retira o cabeçalho; por fim a aplicação recebe os dados originais. Cada camada só lê o cabeçalho do seu próprio nível — é como se camadas de mesmo nível "conversassem" entre os dois lados.'
          ),
          sl(
            'Exemplo: uma requisição descendo e subindo',
            'Você abre um site. Aplicação: o navegador monta um pedido HTTP. Transporte: o TCP acrescenta portas (origem alta, destino 443) e forma o segmento. Rede: o IP acrescenta os endereços IP de origem e destino e forma o pacote. Enlace: o Ethernet acrescenta os MACs (do seu notebook e do próximo salto, o roteador) e forma o quadro. Física: o quadro vira sinal. No caminho, cada roteador sobe até a camada 3, decide a rota e refaz o quadro para o próximo salto. No servidor, tudo sobe até a aplicação, que responde percorrendo o caminho inverso.'
          )
        ]
      },
      questions: [
        mc('q1', 'Em qual camada do modelo OSI ocorre o roteamento com endereços IP?', 'd', 'Camada 3 (rede)', [
          'Camada 2 (enlace)',
          'Camada 4 (transporte)',
          'Camada 1 (física)'
        ], 'A camada de rede cuida do endereçamento lógico (IP) e da escolha de rotas entre redes.'),
        mc('q2', 'Qual é o nome da PDU (unidade de dados) da camada de enlace?', 'b', 'Quadro (frame)', [
          'Pacote',
          'Segmento',
          'Bit'
        ], 'Enlace = quadro; Rede = pacote; Transporte = segmento; Física = bits.'),
        mc('q3', 'Qual camada do OSI usa portas para entregar os dados ao programa certo, com TCP ou UDP?', 'c', 'Camada 4 (transporte)', [
          'Camada 3 (rede)',
          'Camada 5 (sessão)',
          'Camada 2 (enlace)'
        ], 'O transporte identifica os processos pelas portas e oferece TCP (confiável) ou UDP (rápido, sem garantias).'),
        fill('q4', 'Complete com o número da camada OSI em que o roteador age:', 'Roteador = camada OSI nº ___', ['3', 'três', 'camada 3'], 'O roteador trabalha na camada 3 (rede), lendo endereços IP.'),
        mc('q5', 'No modelo TCP/IP de 4 camadas, quais camadas do OSI formam a camada de Aplicação?', 'a', 'Aplicação, Apresentação e Sessão (7, 6 e 5)', [
          'Apenas a Aplicação (7)',
          'Transporte e Rede (4 e 3)',
          'Enlace e Física (2 e 1)'
        ], 'O TCP/IP junta 5, 6 e 7 em Aplicação e 2 e 1 em Acesso à rede.'),
        mc('q6', 'Na ordem do encapsulamento (de cima para baixo), qual sequência de PDUs está correta?', 'c', 'Dados → segmento → pacote → quadro → bits', [
          'Dados → pacote → segmento → quadro → bits',
          'Bits → quadro → pacote → segmento → dados',
          'Dados → quadro → pacote → segmento → bits'
        ], 'Transporte forma o segmento, rede o pacote, enlace o quadro e a física envia bits.'),
        mc('q7', 'O que acontece no DESENCAPSULAMENTO em quem recebe?', 'b', 'Cada camada lê e retira o seu cabeçalho e passa o restante para a camada de cima', [
          'Cada camada acrescenta um novo cabeçalho e devolve ao remetente',
          'A camada física lê os cabeçalhos de todas as camadas de uma vez',
          'Só a camada de aplicação retira cabeçalhos'
        ], 'Os cabeçalhos são retirados de baixo para cima, cada um pela camada correspondente.'),
        fill('q8', 'Complete a sequência de PDUs com o nome do bloco da camada de enlace:', 'dados -> segmento -> pacote -> ___ -> bits', ['quadro', 'frame'], 'Na camada 2 o pacote recebe cabeçalho e rodapé e vira um quadro (frame).')
      ]
    },
    {
      id: 'rdb-05-desempenho-unidades',
      title: 'Desempenho e unidades',
      goal: 'Distinguir largura de banda, vazão, latência, jitter e perda, e converter bits e bytes por segundo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Largura de banda, vazão e goodput',
            'LARGURA DE BANDA (bandwidth) é a capacidade MÁXIMA teórica de um enlace, medida em bits por segundo: é a largura da "estrada". VAZÃO (throughput) é a taxa que de fato se consegue enviar, medida na prática — quase sempre menor que a banda, por congestionamento, erros, limitações dos aparelhos etc. GOODPUT é a parte da vazão que é DADO ÚTIL da aplicação: desconta cabeçalhos dos protocolos e retransmissões. Ordem típica: banda ≥ vazão ≥ goodput. Um plano de "100 Mbps" é a banda contratada; o que o teste de velocidade mede é vazão.'
          ),
          sl(
            'Latência e RTT',
            'LATÊNCIA é o tempo que um dado leva para ir de um ponto a outro, medido em milissegundos (ms). O RTT (Round-Trip Time) é o tempo de ida E volta — é o que o comando ping mostra. Banda e latência são coisas diferentes: uma estrada larga (muita banda) pode ser longa (alta latência). Para jogos online e chamadas de voz, a latência importa mais que a banda; para baixar um arquivo grande, importa mais a banda.'
          ),
          sl(
            'Jitter e perda de pacotes',
            'JITTER é a VARIAÇÃO da latência entre pacotes sucessivos: se uns chegam em 20 ms e outros em 80 ms, a rede tem jitter alto. Atrapalha voz e vídeo em tempo real (o áudio fica picotado). PERDA DE PACOTES é a porcentagem de pacotes que não chegam ao destino (descartados por congestionamento, erro ou sinal fraco). Protocolos como o TCP pedem reenvio do que se perdeu, o que reduz o goodput e aumenta o atraso; em voz/vídeo ao vivo, a perda vira cortes ou travadas.'
          ),
          sl(
            'Unidades: bps, Kbps, Mbps, Gbps',
            'Velocidade de rede se mede em BITS por segundo (bps). Em redes, os prefixos são DECIMAIS (potências de 10): 1 Kbps = 1.000 bps; 1 Mbps = 1.000 Kbps = 1.000.000 bps; 1 Gbps = 1.000 Mbps. Arquivos, por sua vez, são medidos em BYTES (MB, GB). Como 1 byte = 8 bits, converta dividindo por 8: b minúsculo = bit, B maiúsculo = byte. Exemplos: 100 Mbps ÷ 8 = 12,5 MB/s; 1 Gbps ÷ 8 = 125 MB/s.',
            '100 Mbps / 8 = 12,5 MB/s\n200 Mbps / 8 = 25 MB/s\n 1 Gbps  / 8 = 125 MB/s'
          ),
          sl(
            'Tempo de download: o cálculo ideal',
            'Tempo ≈ tamanho em bits ÷ velocidade em bps. Exemplo: baixar um arquivo de 100 MB com um enlace de 100 Mbps: 100 MB × 8 = 800 Mb; 800 Mb ÷ 100 Mbps = 8 segundos — no cenário ideal, sem cabeçalhos, perdas ou congestionamento. Na vida real leva mais, porque a vazão e o goodput ficam abaixo da banda.'
          ),
          sl(
            'Tipos de atraso: transmissão, propagação e fila',
            'O atraso total de um pacote soma várias partes. TRANSMISSÃO: tempo de colocar todos os bits no enlace = tamanho ÷ velocidade. Exemplo: um pacote de 1500 bytes (12.000 bits) num enlace de 10 Mbps leva 12.000 ÷ 10.000.000 = 0,0012 s = 1,2 ms. PROPAGAÇÃO: tempo do sinal percorrer a distância = distância ÷ velocidade do sinal (cerca de 2/3 da velocidade da luz em cabo ou fibra, ~200.000 km/s): 2.000 km ÷ 200.000 km/s = 10 ms. Aumentar a banda reduz o atraso de transmissão, mas NÃO o de propagação. Há ainda o atraso de FILA (esperar num roteador ocupado) e o de processamento (o roteador analisar o cabeçalho).'
          ),
          sl(
            'Congestionamento',
            'Congestionamento acontece quando chega mais tráfego a um equipamento ou enlace do que ele consegue escoar. Os pacotes esperam em filas (o atraso e o jitter sobem); quando a fila enche, pacotes são descartados (perda). É como um engarrafamento: nem os carros mais rápidos andam. Os protocolos (TCP) reduzem a velocidade ao perceber perdas, e a solução de fundo é aumentar capacidade ou controlar/priorizar o tráfego (QoS).'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a diferença entre largura de banda e vazão (throughput)?', 'a', 'Banda é a capacidade máxima teórica do enlace; vazão é a taxa realmente obtida, geralmente menor', [
          'Banda é o que se mede na prática; vazão é a capacidade máxima teórica',
          'São sinônimos exatos',
          'Banda mede o tempo de resposta e vazão mede a perda de pacotes'
        ], 'Banda é a "largura da estrada"; vazão é quanto efetivamente passa por ela.'),
        mc('q2', 'O que o goodput representa?', 'c', 'A taxa de dados úteis da aplicação, sem cabeçalhos nem retransmissões', [
          'A capacidade máxima contratada com o provedor',
          'O tempo de ida e volta de um pacote',
          'A variação da latência entre pacotes'
        ], 'Goodput é a parte útil da vazão: desconta cabeçalhos e dados reenviados.'),
        mc('q3', 'Pacotes de uma chamada de voz chegam com tempos muito variados (20 ms, 90 ms, 30 ms...). Esse problema é:', 'd', 'Jitter alto', [
          'Largura de banda insuficiente por definição',
          'Perda de pacotes de 100%',
          'Alto goodput'
        ], 'Jitter é a variação da latência; prejudica áudio e vídeo em tempo real mesmo com banda sobrando.'),
        fill('q4', 'Complete com o tempo ideal, em segundos, para baixar 100 MB num enlace de 100 Mbps (1 byte = 8 bits):', 'Tempo ideal = ___ segundos', ['8', '8 s', '8 segundos'], '100 MB × 8 = 800 Mb; 800 Mb ÷ 100 Mbps = 8 s.'),
        mc('q5', 'Um enlace de 200 Mbps equivale a quantos MB/s (megabytes por segundo)?', 'b', '25 MB/s', [
          '1.600 MB/s',
          '200 MB/s',
          '2,5 MB/s'
        ], '200 ÷ 8 = 25. Divide-se por 8 para passar de bits para bytes.'),
        mc('q6', 'Qual atraso NÃO diminui quando se contrata mais largura de banda?', 'a', 'Atraso de propagação, que depende da distância e do meio', [
          'Atraso de transmissão',
          'Tempo de download de um arquivo grande',
          'Tempo para colocar um pacote no enlace'
        ], 'Propagação = distância ÷ velocidade do sinal; mais banda não encurta a distância.'),
        mc('q7', 'O que acontece quando uma fila de um roteador congestionado enche?', 'd', 'Pacotes são descartados (perda) e o atraso e o jitter aumentam', [
          'O roteador aumenta sozinho a banda do enlace',
          'Os pacotes ficam mais rápidos para compensar',
          'O endereço IP dos pacotes é trocado'
        ], 'Fila cheia significa perda de pacotes; antes disso, o tempo de espera já sobe.'),
        fill('q8', 'Complete com o atraso de transmissão, em milissegundos, de um pacote de 1500 bytes (12.000 bits) num enlace de 10 Mbps:', 'Atraso de transmissão = ___ ms', ['1,2', '1.2', '1,2 ms', '1.2 ms'], '12.000 bits ÷ 10.000.000 bps = 0,0012 s = 1,2 ms.')
      ]
    },
    {
      id: 'rdb-06-camada-fisica',
      title: 'Camada física: cabos, conectores e padrões',
      goal: 'Escolher e montar cabeamento: categorias, RJ-45, T568A/B, limites, fibra, PoE e testes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Categorias do par trançado',
            'Os cabos UTP são classificados em categorias (Cat) que indicam qualidade e velocidade máxima suportada. Cat5e atende até 1 Gbps (Gigabit) e é o mínimo razoável hoje. Cat6 também atende 1 Gbps e consegue 10 Gbps em distâncias curtas. Cat6a (o "a" é de augmented) atende 10 Gbps nos 100 m completos, com melhor proteção contra interferência. Categoria maior = mais desempenho, mas também cabo mais caro e mais grosso. Sempre existe a regra de ouro: o desempenho final é o do elo MAIS fraco (cabo, conectores, portas).'
          ),
          sl(
            'Limite de 100 metros',
            'Em Ethernet de par trançado, o comprimento máximo de um segmento de cabo é de 100 metros entre a porta do switch e o dispositivo (na cabeação estruturada, até 90 m de cabo fixo mais até 10 m de cordões nas pontas). Acima disso o sinal enfraquece e distorce, causando erros e quedas de velocidade. Para ir além, usa-se um repetidor/switch intermediário ou fibra óptica, que alcança distâncias muito maiores.'
          ),
          sl(
            'Conector RJ-45 e os pares de fios',
            'O RJ-45 tem 8 pinos para os 8 fios (4 pares) do cabo. Os pinos são numerados de 1 a 8, da esquerda para a direita, com a trava para baixo e os contatos voltados para você. Ethernet de 10 e 100 Mbps usa só 2 pares: os pinos 1 e 2 para transmitir (TX) e 3 e 6 para receber (RX). Gigabit e acima usam os 4 pares ao mesmo tempo. Fios soltos ou na ordem errada causam falhas ou velocidade reduzida.'
          ),
          sl(
            'T568A e T568B',
            'São duas normas para a ORDEM das cores dos fios nos pinos do RJ-45. T568B (1 a 8): branco/laranja, laranja, branco/verde, azul, branco/azul, verde, branco/marrom, marrom. T568A (1 a 8): branco/verde, verde, branco/laranja, azul, branco/azul, laranja, branco/marrom, marrom. A diferença é a troca dos pares laranja e verde. As duas funcionam; o importante é ser coerente.',
            'Pino  T568B             T568A\n 1    branco/laranja    branco/verde\n 2    laranja           verde\n 3    branco/verde      branco/laranja\n 4    azul              azul\n 5    branco/azul       branco/azul\n 6    verde             laranja\n 7    branco/marrom     branco/marrom\n 8    marrom            marrom'
          ),
          sl(
            'Cabo direto, crossover e Auto-MDIX',
            'Cabo DIRETO (straight-through): a mesma norma (A ou B) nas duas pontas — liga dispositivos de tipos diferentes (computador ↔ switch). Cabo CROSSOVER (cruzado): uma ponta T568A e a outra T568B, de modo que o par de transmissão de um lado cai no de recepção do outro — era necessário para ligar dispositivos iguais (computador ↔ computador, switch ↔ switch). Hoje quase todas as portas têm AUTO-MDIX: detectam e ajustam sozinhas o cruzamento, então um cabo direto serve para tudo.'
          ),
          sl(
            'Fibra: conectores e PoE',
            'Conectores de fibra comuns: LC (pequeno, muito usado em switches modernos) e SC (maior, de encaixe por empurrar). A fibra costuma ser duplex: um fio transmite e o outro recebe. PoE (Power over Ethernet) leva ENERGIA elétrica pelo próprio cabo de rede, junto com os dados — assim uma câmera IP, um access point ou um telefone IP funcionam com um cabo só, sem tomada próxima. Precisa de um switch ou injetor PoE e de aparelhos compatíveis.'
          ),
          sl(
            'Testes de cabeamento (visão geral)',
            'Um testador de cabos simples verifica o MAPA DE FIOS: se cada fio chega ao pino certo e se há rompimentos, curtos ou pares invertidos/trocados. Um certificador (equipamento profissional) vai além: mede desempenho (atenuação, interferência, comprimento) e atesta se a instalação cumpre a categoria. Em fibra, um OTDR mostra onde há emendas ou rupturas ao longo do fio. Sinais de cabo ruim: link que cai, velocidade menor que a esperada, muitos erros nas portas.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual categoria de cabo UTP atende 10 Gbps nos 100 m completos?', 'b', 'Cat6a', [
          'Cat5e',
          'Cat3',
          'Coaxial'
        ], 'Cat6a foi feita para 10 Gbps em até 100 m; Cat6 só faz 10 Gbps em distâncias curtas e Cat5e atende até 1 Gbps.'),
        mc('q2', 'Qual é o comprimento máximo de um segmento de par trançado Ethernet?', 'a', '100 metros', [
          '10 metros',
          '1 quilômetro',
          '500 metros'
        ], 'Acima de 100 m o sinal degrada; para ir além, usa-se switch/repetidor intermediário ou fibra.'),
        mc('q3', 'Como é montado um cabo DIRETO (straight-through)?', 'c', 'Com a mesma norma (A ou B) nas duas pontas', [
          'Uma ponta T568A e a outra T568B',
          'Só 2 fios em cada ponta',
          'Com fibra óptica no lugar do cobre'
        ], 'Direto = mesma ordem de cores nas duas extremidades. O cruzado usa A de um lado e B do outro.'),
        fill('q4', 'Complete com a norma de cores que, numa ponta do cabo crossover, é combinada com a T568A da outra ponta:', 'Crossover = T568A numa ponta e T568___ na outra', ['B', 't568b', 'T568B'], 'O crossover mistura as normas: A numa ponta e B na outra.'),
        mc('q5', 'O que faz o Auto-MDIX de uma porta?', 'd', 'Detecta e ajusta automaticamente o cruzamento dos pares, dispensando cabo crossover', [
          'Aumenta o limite do cabo para 200 m',
          'Liga a energia PoE',
          'Converte sinal elétrico em luz'
        ], 'Com Auto-MDIX, um cabo direto serve para ligar equipamentos iguais também.'),
        mc('q6', 'O que o PoE (Power over Ethernet) permite?', 'b', 'Alimentar um aparelho (câmera IP, access point) pelo próprio cabo de rede', [
          'Transmitir dados sem nenhum cabo',
          'Aumentar a velocidade do cabo para 10 Gbps',
          'Criptografar o tráfego Wi-Fi'
        ], 'PoE envia energia elétrica junto com os dados pelo cabo Ethernet.'),
        mc('q7', 'Um testador de cabos simples identifica principalmente:', 'c', 'Fios rompidos, em curto, invertidos ou fora da ordem (mapa de fios)', [
          'A velocidade contratada com o provedor',
          'A senha do Wi-Fi',
          'O endereço IP do dispositivo'
        ], 'O testador confere a continuidade e o mapeamento pino a pino dos fios.'),
        fill('q8', 'Complete com o nome do conector de 8 pinos usado em cabos Ethernet de par trançado:', 'Conector de 8 pinos: ___', ['RJ-45', 'RJ45'], 'O RJ-45 tem 8 pinos para os 4 pares do cabo.')
      ]
    },
    {
      id: 'rdb-07-ethernet-mac',
      title: 'Ethernet e endereço MAC',
      goal: 'Entender o quadro Ethernet, o endereço MAC, tipos de destino, duplex e auto-negociação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é Ethernet',
            'Ethernet é o conjunto de padrões (IEEE 802.3) usado nas redes cabeadas locais: define o meio físico (cabos, sinais) e o formato dos QUADROS da camada de enlace. É a tecnologia de LAN dominante. Wi-Fi (802.11) é a contraparte sem fio; os dois convivem na mesma rede e usam endereços MAC parecidos.'
          ),
          sl(
            'O endereço MAC',
            'O MAC (Media Access Control) é o endereço de camada 2 gravado de fábrica numa placa de rede (NIC). Tem 48 bits (6 bytes), escritos como 12 dígitos hexadecimais, geralmente separados por : ou -, como 00:1A:2B:3C:4D:5E. Serve para identificar o dispositivo DENTRO da rede local (não é roteado pela internet). Os 3 primeiros bytes são o OUI (Organizationally Unique Identifier), que identifica o FABRICANTE; os 3 últimos são o número de série atribuído pelo fabricante. Muitos sistemas atuais usam MACs aleatórios no Wi-Fi para proteger a privacidade do usuário.',
            'OUI (fabricante)   Série da placa\n   00:1A:2B       :3C:4D:5E\n   <-- 24 bits -->  <-- 24 bits -->'
          ),
          sl(
            'O quadro Ethernet e seus campos',
            'O quadro é o PDU da camada 2. Campos, em ordem: Preâmbulo (7 bytes) + SFD (1 byte): sequência que sincroniza o receptor e marca o início; MAC de destino (6 bytes); MAC de origem (6 bytes); EtherType/Tipo (2 bytes): diz qual protocolo vem dentro (0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6); Dados/Payload (46 a 1500 bytes): o pacote da camada 3; FCS (4 bytes): código de verificação (um CRC) calculado no envio e conferido no recebimento — se não bater, o quadro está corrompido e é descartado. Sem contar o preâmbulo, o quadro vai de 64 a 1518 bytes.',
            '| Preâmbulo+SFD | MAC dest | MAC orig | Tipo | Dados (46-1500) | FCS |\n|     8 B       |   6 B    |   6 B    | 2 B  |                 | 4 B |'
          ),
          sl(
            'Unicast, broadcast e multicast',
            'UNICAST: o quadro tem como destino um único dispositivo — a conversa normal. BROADCAST: destino FF:FF:FF:FF:FF:FF (todos os bits 1): todos os dispositivos da rede local recebem e processam. MULTICAST: destino é um GRUPO; reconhece-se por o bit menos significativo do primeiro byte do MAC ser 1 (por exemplo, 01:00:5E:00:00:FB, usado em multicast IPv4); só quem se inscreveu no grupo processa. Regra rápida: primeiro byte com valor ímpar (em binário, termina em 1) = multicast/broadcast; par = unicast.'
          ),
          sl(
            'CSMA/CD: o jeito histórico de dividir o cabo',
            'No Ethernet antigo (barramento e hubs), todos dividiam o mesmo meio, e dois dispositivos falando ao mesmo tempo causavam uma COLISÃO. O método CSMA/CD (Carrier Sense Multiple Access with Collision Detection) resolvia isso: escutar se o meio está livre (Carrier Sense); se livre, transmitir; se detectar colisão (Collision Detection), parar, esperar um tempo aleatório e tentar de novo. Hoje, com switches e full duplex, não há mais colisões e o CSMA/CD praticamente não é usado — mas o termo cai em prova e explica o passado.'
          ),
          sl(
            'Half duplex, full duplex e auto-negociação',
            'HALF DUPLEX: um lado por vez transmite (como um walkie-talkie) — era o modo de hubs. FULL DUPLEX: os dois lados transmitem e recebem ao mesmo tempo (como um telefone), sem colisões — é o modo de switches. A AUTO-NEGOCIAÇÃO faz as duas pontas trocarem sinais ao conectar e combinarem a maior velocidade e o melhor modo duplex que ambas suportam (10/100/1000 Mbps etc.). Se uma ponta for fixada manualmente e a outra negociar, pode surgir descompasso de duplex, que degrada muito o desempenho.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual dos MACs de destino abaixo indica um quadro MULTICAST?', 'c', '01:00:5E:00:00:FB', [
          '00:1A:2B:3C:4D:5E',
          '02:42:AC:11:00:02',
          '00:50:56:C0:00:08'
        ], 'O primeiro byte 01 termina em bit 1, sinal de grupo (multicast). Os demais começam com byte par: são unicast.'),
        mc('q2', 'O que indica o OUI, os 3 primeiros bytes de um MAC?', 'a', 'O fabricante da placa de rede', [
          'A velocidade da porta',
          'O endereço IP atribuído',
          'A sub-rede em que o dispositivo está'
        ], 'O OUI é atribuído ao fabricante; os 3 últimos bytes identificam a placa dentro dele.'),
        mc('q3', 'Para que serve o campo EtherType do quadro Ethernet?', 'd', 'Informar qual protocolo está no payload (por exemplo IPv4 ou ARP)', [
          'Detectar erros de transmissão',
          'Indicar a porta TCP de destino',
          'Guardar o endereço MAC de destino'
        ], 'EtherType é um código (0x0800 IPv4, 0x0806 ARP...) que diz como interpretar os dados. A detecção de erros é função do FCS.'),
        fill('q4', 'Complete com o número de bits de um endereço MAC:', 'MAC = ___ bits', ['48', '48 bits'], 'MAC tem 6 bytes = 48 bits (12 dígitos hexadecimais).'),
        mc('q5', 'O que o CSMA/CD fazia no Ethernet antigo ao detectar uma colisão?', 'b', 'Parava de transmitir, esperava um tempo aleatório e tentava de novo', [
          'Aumentava automaticamente a velocidade do cabo',
          'Enviava o quadro por outro cabo',
          'Trocava o MAC de origem'
        ], 'O Collision Detection interrompe a transmissão e usa um recuo aleatório antes da nova tentativa.'),
        mc('q6', 'Qual é a característica do modo full duplex?', 'c', 'Os dois lados transmitem e recebem ao mesmo tempo, sem colisões', [
          'Só um lado fala por vez',
          'Só permite transmissão, nunca recepção',
          'Exige hub'
        ], 'Full duplex = comunicação nos dois sentidos simultaneamente; é o modo normal em links com switch.'),
        mc('q7', 'Para que serve a auto-negociação em uma porta Ethernet?', 'a', 'As duas pontas combinam a maior velocidade e o modo duplex que ambas suportam', [
          'Negociar o preço com o provedor',
          'Atribuir um IP à porta',
          'Descobrir o nome DNS do outro lado'
        ], 'A auto-negociação evita configuração manual e mantém os dois lados compatíveis.'),
        fill('q8', 'Complete com a sigla do campo de 4 bytes, no fim do quadro Ethernet, usado para detectar erros:', 'Campo de verificação de erros do quadro: ___', ['FCS', 'CRC'], 'O FCS (Frame Check Sequence) guarda um CRC; se não bater, o quadro é descartado.')
      ]
    },
    {
      id: 'rdb-08-switch',
      title: 'Switch: como encaminha quadros',
      goal: 'Entender como o switch aprende MACs, monta a tabela, faz flooding e separa domínios de colisão.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Hub × switch',
            'O hub repete cada sinal por todas as portas: todos os dispositivos veem todo o tráfego e disputam o mesmo meio (colisões, pouca privacidade). O switch é inteligente: lê o MAC de destino de cada quadro e o entrega só à porta onde o destinatário está. Resultado: várias conversas simultâneas sem atrapalhar umas às outras, mais desempenho e menos "bisbilhotagem" do tráfego alheio.'
          ),
          sl(
            'Aprender: olhar o MAC de ORIGEM',
            'Quando liga, o switch não sabe nada. A cada quadro que chega por uma porta, ele lê o MAC de ORIGEM e anota na sua tabela: "este MAC está atrás desta porta". Assim, só de ver quem fala, ele vai descobrindo onde cada dispositivo está — sem configuração. Esta é a regra central: o switch APRENDE pela origem e DECIDE pelo destino.'
          ),
          sl(
            'A tabela de endereços MAC',
            'A tabela (também chamada CAM table ou tabela de encaminhamento) associa cada MAC a uma porta. As entradas têm tempo de validade: se um MAC fica um tempo sem aparecer, a entrada é apagada (aging), mantendo a tabela atual quando dispositivos mudam de lugar. Para cada quadro, o switch consulta a tabela pelo MAC de DESTINO.',
            'Porta   MAC\n  1     AA:AA:AA:AA:AA:01   (PC-A)\n  2     BB:BB:BB:BB:BB:02   (PC-B)\n  3     CC:CC:CC:CC:CC:03   (PC-C)'
          ),
          sl(
            'Encaminhar, inundar (flooding) e filtrar',
            'Para cada quadro o switch segue estas regras. DESTINO CONHECIDO, em outra porta: envia só por aquela porta (encaminha). DESTINO DESCONHECIDO (ainda não aprendido): envia por TODAS as portas, menos a de origem — isso é FLOODING (inundação); quando o destino responder, o switch aprende onde ele está. BROADCAST (FF:FF:FF:FF:FF:FF) e multicast sem tratamento especial: também inundados. DESTINO NA MESMA PORTA de onde o quadro veio: descarta (FILTRA), pois o destinatário já recebeu.'
          ),
          sl(
            'Exemplo passo a passo',
            'Tabela vazia. 1) PC-A (porta 1) manda um quadro para PC-B. O switch aprende A→porta 1; como B é desconhecido, inunda as portas 2, 3 e 4. 2) PC-B responde para A. O switch aprende B→porta 2 e, como A é conhecido, envia só pela porta 1. 3) A fala com B de novo: agora o switch envia somente pela porta 2. PC-C e os outros não veem mais essa conversa.'
          ),
          sl(
            'Domínio de colisão e domínio de broadcast',
            'DOMÍNIO DE COLISÃO é a área em que dois dispositivos podem colidir ao falar ao mesmo tempo. Num hub, todas as portas são UM só domínio de colisão; num switch, CADA PORTA é um domínio de colisão separado (e em full duplex colisões nem existem). DOMÍNIO DE BROADCAST é a área alcançada por um broadcast. O switch NÃO separa broadcast: todas as suas portas ficam no mesmo domínio de broadcast (a menos que use VLANs, assunto avançado). Quem separa domínios de broadcast é o ROTEADOR. Um switch de 8 portas = 8 domínios de colisão e 1 de broadcast.'
          )
        ]
      },
      questions: [
        mc('q1', 'De qual campo do quadro o switch aprende em qual porta está um dispositivo?', 'a', 'Do MAC de origem', [
          'Do MAC de destino',
          'Do endereço IP de destino',
          'Do campo FCS'
        ], 'Ao ver o MAC de origem chegando por uma porta, o switch sabe que aquele dispositivo está nela.'),
        mc('q2', 'O que o switch faz com um quadro cujo MAC de destino ainda não está na tabela?', 'd', 'Envia por todas as portas, exceto a de origem (flooding)', [
          'Descarta o quadro',
          'Devolve o quadro ao remetente',
          'Envia só para o roteador'
        ], 'Sem saber onde o destino está, o switch inunda; quando o destino responder, será aprendido.'),
        mc('q3', 'Quantos domínios de colisão tem um switch de 8 portas (sem VLANs)?', 'c', '8, um por porta', [
          '1',
          '2',
          '16'
        ], 'Cada porta do switch é seu próprio domínio de colisão; já o hub teria apenas um.'),
        fill('q4', 'Complete: o switch aprende o MAC de ___ de cada quadro (origem ou destino):', 'O switch aprende o MAC de ___', ['origem', 'de origem', 'origem do quadro'], 'Aprende pela origem; consulta a tabela pelo destino.'),
        mc('q5', 'Qual dispositivo separa domínios de broadcast?', 'b', 'Roteador', [
          'Hub',
          'Switch comum, sem VLANs',
          'Repetidor'
        ], 'O roteador não repassa broadcasts de uma rede para outra; o switch comum sim.'),
        mc('q6', 'Qual é a diferença básica entre hub e switch?', 'd', 'O hub repete tudo por todas as portas; o switch envia só à porta do destino', [
          'O hub lê o MAC e o switch não',
          'O switch só funciona com Wi-Fi',
          'O hub encaminha pelo IP e o switch pelo DNS'
        ], 'O switch usa a tabela de MACs para encaminhar com seletividade, o hub apenas replica o sinal.'),
        mc('q7', 'A tabela do switch tem A na porta 1 e B na porta 2. O PC-B envia um quadro unicast para o PC-A. Por onde o switch envia?', 'a', 'Somente pela porta 1', [
          'Por todas as portas',
          'Somente pela porta 2',
          'Pelas portas 3 e 4 apenas'
        ], 'Destino conhecido (A, porta 1): o switch encaminha só por ela.'),
        fill('q8', 'Complete com o nome do comportamento do switch ao receber um quadro para um MAC desconhecido (enviar por todas as portas, menos a de origem):', 'Destino desconhecido: o switch faz ___', ['flooding', 'inundação', 'inundacao', 'flood'], 'Flooding (inundação): o quadro é replicado por todas as portas, exceto a de origem, até aprender onde o destino está.')
      ]
    },
    {
      id: 'rdb-09-enderecamento-ipv4',
      title: 'Endereçamento IPv4',
      goal: 'Ler um endereço IPv4 e reconhecer as faixas privadas, de loopback, link-local e especiais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um endereço IP e seu formato',
            'O endereço IP é o endereço LÓGICO (camada 3) de um dispositivo numa rede: identifica quem é e em qual rede está, e pode mudar. O IPv4 tem 32 bits, escritos em 4 octetos de 8 bits, cada um em decimal (0 a 255) e separados por pontos — a notação decimal pontuada. Exemplo: 192.168.1.10 equivale a 11000000.10101000.00000001.00001010. Valores acima de 255 (como 192.168.1.256) são inválidos, pois um octeto só vai de 0 a 255. Há 2^32 = 4.294.967.296 endereços possíveis no total.',
            '192  .  168  .   1   .  10\n11000000.10101000.00000001.00001010'
          ),
          sl(
            'Parte de rede e parte de host',
            'Todo IPv4 se divide em duas partes: a parte de REDE (identifica a rede, como o nome de uma rua) e a parte de HOST (identifica o dispositivo dentro da rede, como o número da casa). Dispositivos na mesma rede compartilham a mesma parte de rede e só diferem na de host. Em 192.168.1.10, por exemplo, numa rede /24, "192.168.1" é a rede e "10" é o host. Quem define onde termina a rede é a máscara de sub-rede, assunto da próxima lição.'
          ),
          sl(
            'IP público e IP privado (RFC 1918)',
            'IP PÚBLICO é único no mundo e roteável pela internet. IP PRIVADO é reservado para redes internas e NÃO é roteado na internet; qualquer rede pode reutilizá-los. O documento RFC 1918 define três faixas privadas: 10.0.0.0/8 (de 10.0.0.0 a 10.255.255.255), 172.16.0.0/12 (de 172.16.0.0 a 172.31.255.255) e 192.168.0.0/16 (de 192.168.0.0 a 192.168.255.255). Atenção: 172.15.x.x e 172.32.x.x NÃO são privados; só 172.16 até 172.31. Para sair à internet, um IP privado precisa de NAT (lição futura).',
            '10.0.0.0    - 10.255.255.255   (/8)\n172.16.0.0  - 172.31.255.255   (/12)\n192.168.0.0 - 192.168.255.255  (/16)'
          ),
          sl(
            'Loopback e link-local',
            'LOOPBACK: a faixa 127.0.0.0/8 (normalmente usa-se 127.0.0.1, apelidado de localhost) aponta para a PRÓPRIA máquina: o tráfego nunca sai pela placa de rede. Serve para testar a pilha TCP/IP e para programas conversarem localmente. LINK-LOCAL: a faixa 169.254.0.0/16 é atribuída automaticamente (APIPA) quando o dispositivo esperava receber um IP automático de um servidor DHCP e não conseguiu; só vale na rede local. Se o seu computador mostra 169.254.x.x, normalmente quer dizer "não consegui um IP de verdade".'
          ),
          sl(
            'Classes A, B, C (história) e endereços especiais',
            'No início, a internet dividia endereços em CLASSES pelo valor do 1º octeto: A (1–126, rede /8), B (128–191, /16), C (192–223, /24), D (224–239, multicast) e E (240–255, experimental). A classe 127 ficou para loopback. Esse sistema foi abandonado em favor do CIDR (veremos), mas o vocabulário "rede classe C" ainda é usado. Endereços especiais: 0.0.0.0 significa "este dispositivo / endereço não especificado" (e, em rotas, "qualquer destino"); 255.255.255.255 é o broadcast limitado (todos na rede local). Para documentação e exemplos existem faixas reservadas: 192.0.2.0/24, 198.51.100.0/24 e 203.0.113.0/24.',
            'A: 1-126    /8\nB: 128-191  /16\nC: 192-223  /24\nD: 224-239  multicast\nE: 240-255  experimental'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual das opções é um endereço IPv4 válido?', 'd', '203.0.113.45', [
          '192.168.1.256',
          '10.0.0',
          '172.16.0.1.5'
        ], 'Cada um dos 4 octetos vai de 0 a 255. 256 estoura o limite; 10.0.0 tem só 3 octetos; o último tem 5.'),
        mc('q2', 'Qual endereço pertence a uma faixa privada (RFC 1918)?', 'c', '172.20.5.9', [
          '172.32.0.1',
          '192.169.1.1',
          '11.0.0.1'
        ], 'A faixa privada 172.16.0.0/12 vai de 172.16.0.0 a 172.31.255.255. 172.32.x.x, 192.169.x.x e 11.x.x.x são públicos.'),
        mc('q3', 'Seu computador mostra o IP 169.254.37.8. O que isso normalmente indica?', 'b', 'Falha em obter um IP automático (DHCP); o sistema usou um endereço link-local', [
          'Que você está conectado diretamente à internet com IP público',
          'Que o computador usa o IP de loopback',
          'Que a rede é classe D'
        ], '169.254.0.0/16 é a faixa APIPA, usada quando o DHCP não responde.'),
        fill('q4', 'Complete com o endereço de loopback mais comum, que aponta para o próprio computador:', 'Endereço de loopback (localhost): ___', ['127.0.0.1'], '127.0.0.1 (de 127.0.0.0/8) aponta para a própria máquina e não sai pela placa de rede.'),
        mc('q5', 'Qual classe histórica de endereços (definida pelo 1º octeto) usa a máscara padrão /24?', 'a', 'Classe C (192–223)', [
          'Classe A (1–126)',
          'Classe B (128–191)',
          'Classe D (224–239)'
        ], 'Classe A = /8, B = /16 e C = /24; D é multicast.'),
        mc('q6', 'No endereço 192.168.1.10 numa rede /24, qual é a função da parte de rede?', 'c', 'Identificar a rede à qual o dispositivo pertence, comum a todos os dispositivos dela', [
          'Identificar apenas o fabricante da placa',
          'Identificar o dispositivo dentro da rede',
          'Indicar a porta do serviço'
        ], 'A parte de rede é comum a todos os dispositivos da rede; a parte de host diferencia cada um.'),
        mc('q7', 'Qual endereço é o broadcast limitado (todos os dispositivos da rede local)?', 'd', '255.255.255.255', [
          '0.0.0.0',
          '127.255.255.255',
          '192.168.255.1'
        ], '255.255.255.255 é o broadcast limitado; 0.0.0.0 significa "não especificado".'),
        fill('q8', 'Complete o prefixo da faixa privada que começa em 192.168.0.0:', '192.168.0.0/___', ['16', '/16'], '192.168.0.0/16 vai de 192.168.0.0 a 192.168.255.255.')
      ]
    },
    {
      id: 'rdb-10-mascara-cidr',
      title: 'Máscara de sub-rede e CIDR',
      goal: 'Usar a máscara/prefixo para achar rede, broadcast, faixa de hosts e quantidade de hosts.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A máscara de sub-rede e o prefixo /n',
            'A máscara de sub-rede também tem 32 bits: os bits 1 (sempre contíguos, à esquerda) marcam a parte de REDE e os bits 0 marcam a parte de HOST. 255.255.255.0 em binário é 24 uns seguidos de 8 zeros. O PREFIXO (notação CIDR) é só a quantidade de bits 1: /24 = 255.255.255.0. CIDR (Classless Inter-Domain Routing) substituiu as classes: o limite entre rede e host pode estar em qualquer bit, não só nos fixos de 8, 16, 24.',
            '/8   255.0.0.0\n/16  255.255.0.0\n/24  255.255.255.0\n\n/24 = 11111111.11111111.11111111.00000000'
          ),
          sl(
            'Máscaras comuns no último octeto',
            'Quando o prefixo está entre /25 e /30, a máscara muda só no último octeto, e os valores possíveis vêm da soma dos bits 1 da esquerda: 128, 192, 224, 240, 248, 252. Decore a tabela abaixo: ela resolve a maior parte dos problemas de sub-rede.',
            '/25  255.255.255.128   126 hosts\n/26  255.255.255.192    62 hosts\n/27  255.255.255.224    30 hosts\n/28  255.255.255.240    14 hosts\n/29  255.255.255.248     6 hosts\n/30  255.255.255.252     2 hosts'
          ),
          sl(
            'Descobrindo o endereço de rede com AND',
            'O ENDEREÇO DE REDE é o primeiro endereço do bloco: identifica a rede, e não pode ser usado por um host. Calcula-se fazendo AND bit a bit entre o IP e a máscara — onde a máscara tem 0, o resultado zera; onde tem 1, mantém. Exemplo: 192.168.10.130 /26. Só o último octeto muda (máscara 192): 130 = 10000010; 192 = 11000000; AND = 10000000 = 128. Endereço de rede: 192.168.10.128.',
            '  10000010   (130)\nAND 11000000   (192)\n  --------\n  10000000   (128)\n=> rede 192.168.10.128'
          ),
          sl(
            'Broadcast e faixa de hosts úteis',
            'O ENDEREÇO DE BROADCAST é o último do bloco: todos os bits de host valem 1 (é o endereço usado para falar com todos da rede). Nenhum host pode usá-lo. Os HOSTS ÚTEIS ficam entre os dois: do primeiro (rede + 1) ao último (broadcast − 1). No exemplo 192.168.10.130/26: rede .128; bits de host: 6 → o bloco tem 2^6 = 64 endereços, de .128 a .191; broadcast = .191; hosts úteis: 192.168.10.129 a 192.168.10.190.',
            'Rede       192.168.10.128\n1º host    192.168.10.129\nÚltimo     192.168.10.190\nBroadcast  192.168.10.191'
          ),
          sl(
            'Quantos hosts cabem: 2^n − 2',
            'Seja h o número de bits de host (h = 32 − prefixo). O bloco tem 2^h endereços; dois não podem ser usados por dispositivos (o de rede e o de broadcast), então HOSTS ÚTEIS = 2^h − 2. /24 → h = 8 → 2^8 − 2 = 254. /26 → h = 6 → 62. /29 → h = 3 → 6. /30 → h = 2 → 2 (por isso é usado em enlaces ponto a ponto entre dois roteadores).'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a máscara correspondente ao prefixo /24?', 'a', '255.255.255.0', [
          '255.255.0.0',
          '255.255.255.128',
          '255.0.0.0'
        ], '/24 são 24 bits 1 = três octetos 255 e o último 0.'),
        mc('q2', 'Qual prefixo corresponde à máscara 255.255.255.224?', 'b', '/27', [
          '/26',
          '/28',
          '/25'
        ], '224 = 11100000: 3 bits no último octeto, 24 + 3 = 27.'),
        mc('q3', 'Quantos hosts úteis tem uma rede /26?', 'd', '62', [
          '64',
          '30',
          '126'
        ], 'h = 6 bits de host: 2^6 − 2 = 62 (o 64 inclui rede e broadcast).'),
        fill('q4', 'Complete com o endereço de rede de 192.168.1.77/27 (faça AND do 4º octeto: 77 com 224):', 'Endereço de rede = ___', ['192.168.1.64'], '77 = 01001101 AND 11100000 = 01000000 = 64. A rede é 192.168.1.64.'),
        mc('q5', 'Qual é o endereço de broadcast de 192.168.10.130/26?', 'c', '192.168.10.191', [
          '192.168.10.190',
          '192.168.10.255',
          '192.168.10.129'
        ], 'A rede é .128 e o bloco tem 64 endereços (.128 a .191); o último, .191, é o broadcast.'),
        mc('q6', 'Quantos hosts úteis cabem em uma rede /29?', 'b', '6', [
          '8',
          '14',
          '2'
        ], '/29 deixa 3 bits de host: 2^3 − 2 = 6.'),
        mc('q7', 'Por que se subtraem 2 do total de endereços ao contar hosts úteis?', 'a', 'O primeiro endereço identifica a rede e o último é o broadcast; nenhum dispositivo pode usá-los', [
          'Porque 2 endereços ficam sempre reservados ao roteador',
          'Porque 2 bits são usados pelo checksum',
          'Porque o IPv4 só permite números pares'
        ], 'O endereço de rede e o de broadcast não são atribuíveis a hosts.'),
        fill('q8', 'Complete com o prefixo correspondente à máscara 255.255.255.240:', '255.255.255.240 = /___', ['28', '/28'], '240 = 11110000: 4 bits no último octeto, 24 + 4 = 28.')
      ]
    },
    {
      id: 'rdb-11-subnetting',
      title: 'Subnetting na prática',
      goal: 'Dividir uma rede em sub-redes usando o salto (block size) e descobrir a sub-rede de um IP.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que dividir uma rede em sub-redes',
            'Subnetting é dividir uma rede grande em redes menores (sub-redes). Motivos: organizar (um setor por sub-rede), reduzir o tamanho dos domínios de broadcast (menos tráfego desnecessário), melhorar segurança (controle entre sub-redes) e aproveitar melhor os endereços. A ideia é pegar emprestados alguns bits da parte de HOST e usá-los como parte de REDE: o prefixo aumenta e as sub-redes ficam menores.'
          ),
          sl(
            'Bits emprestados: quantas sub-redes',
            'Se você empresta b bits, obtém 2^b sub-redes. Exemplo: 192.168.1.0/24 dividida em 4 sub-redes: 2^2 = 4, logo b = 2. O novo prefixo é 24 + 2 = /26 e a máscara é 255.255.255.192. Cada sub-rede passa a ter 8 − 2 = 6 bits de host: 2^6 = 64 endereços, 62 úteis. Para 8 sub-redes seriam 3 bits (/27); para 5 sub-redes, também 3 bits (2^2 = 4 não basta, então 2^3 = 8).'
          ),
          sl(
            'O salto (block size)',
            'O SALTO (block size) é o tamanho do bloco de cada sub-rede, no octeto em que a máscara "quebra": salto = 256 − valor da máscara nesse octeto. Para /26 (máscara 192): 256 − 192 = 64. As sub-redes começam em múltiplos do salto: 0, 64, 128, 192. O broadcast de cada uma é o endereço logo antes do início da próxima (o próximo início − 1). Tabela de saltos: /25 → 128; /26 → 64; /27 → 32; /28 → 16; /29 → 8; /30 → 4.',
            'Sub-rede  Rede           Hosts úteis             Broadcast\n#1   192.168.1.0/26    .1   a .62    192.168.1.63\n#2   192.168.1.64/26   .65  a .126   192.168.1.127\n#3   192.168.1.128/26  .129 a .190   192.168.1.191\n#4   192.168.1.192/26  .193 a .254   192.168.1.255'
          ),
          sl(
            'Receita passo a passo',
            '1) Descubra quantas sub-redes (ou quantos hosts por sub-rede) você precisa. 2) Calcule os bits: para sub-redes, 2^b ≥ quantidade; para hosts, 2^h − 2 ≥ quantidade. 3) Monte o novo prefixo (prefixo original + b, ou 32 − h). 4) Calcule o salto (256 − octeto da máscara). 5) Liste as redes: começo, +salto, +2×salto... 6) Para cada rede: primeiro host = rede + 1; broadcast = próxima rede − 1; último host = broadcast − 1. Exemplo por hosts: preciso de 20 hosts por sub-rede: 2^4 − 2 = 14 não basta; 2^5 − 2 = 30 serve → h = 5 → /27.'
          ),
          sl(
            'Descobrir a qual sub-rede um IP pertence',
            'Basta achar o múltiplo do salto que não ultrapassa o valor do octeto. Exemplo: 192.168.20.100/28. Salto = 16 (256 − 240). Múltiplos de 16: ... 80, 96, 112. O maior que não passa de 100 é 96. Rede: 192.168.20.96; próxima rede: .112 → broadcast: .111; hosts úteis: .97 a .110. Se a máscara quebra no 3º octeto, o mesmo raciocínio vale nele: 172.16.45.200/20 → máscara 255.255.240.0; salto no 3º octeto = 16; 45 está entre 32 e 48 → rede 172.16.32.0; broadcast = 172.16.47.255.',
            '172.16.45.200/20\nmáscara 255.255.240.0 -> salto 16 (3º octeto)\nmúltiplos: 0,16,32,48...  45 cai no bloco de 32\nrede:      172.16.32.0\nbroadcast: 172.16.47.255'
          ),
          sl(
            'Erros comuns a evitar',
            'Esquecer que o 1º e o último endereço do bloco não são para hosts. Contar o salto a partir do valor errado (some o salto ao INÍCIO do bloco anterior, não ao IP do host). Confundir quantidade de sub-redes com quantidade de hosts: bits emprestados aumentam as sub-redes e DIMINUEM os hosts. Sempre confira: rede + tamanho do bloco = início da próxima rede.'
          )
        ]
      },
      questions: [
        mc('q1', 'Quantos bits é preciso emprestar para dividir uma rede em 4 sub-redes?', 'c', '2', [
          '1',
          '4',
          '3'
        ], '2^2 = 4. Cada bit emprestado dobra o número de sub-redes.'),
        mc('q2', 'Qual é o salto (block size) de uma rede /26?', 'a', '64', [
          '32',
          '128',
          '62'
        ], 'Máscara do último octeto = 192; salto = 256 − 192 = 64.'),
        mc('q3', 'Dividindo 192.168.1.0/24 em sub-redes /26, qual é o endereço da 2ª sub-rede?', 'b', '192.168.1.64', [
          '192.168.1.62',
          '192.168.1.65',
          '192.168.1.128'
        ], 'As redes começam em 0, 64, 128 e 192; a 2ª é 192.168.1.64.'),
        fill('q4', 'Complete com o salto (tamanho do bloco) de uma rede /28:', 'Salto de /28 = ___', ['16'], '/28 → máscara 240 → 256 − 240 = 16.'),
        mc('q5', 'A qual sub-rede pertence o host 172.16.45.200/20 (máscara 255.255.240.0)?', 'd', '172.16.32.0', [
          '172.16.45.0',
          '172.16.40.0',
          '172.16.48.0'
        ], 'Salto 16 no 3º octeto; o maior múltiplo de 16 que não passa de 45 é 32. Rede 172.16.32.0.'),
        mc('q6', 'Qual é o broadcast da sub-rede de 192.168.20.100/28?', 'c', '192.168.20.111', [
          '192.168.20.96',
          '192.168.20.110',
          '192.168.20.127'
        ], 'Rede .96, salto 16, próxima rede .112; broadcast = .111.'),
        mc('q7', 'Quer-se sub-redes com pelo menos 20 hosts úteis cada. Qual prefixo atende, sem desperdiçar muito?', 'b', '/27 (30 hosts úteis)', [
          '/28 (14 hosts úteis)',
          '/26 (62 hosts úteis)',
          '/30 (2 hosts úteis)'
        ], '/28 só tem 14 úteis; /27 tem 30 e é o menor que atende; /26 funciona mas desperdiça.'),
        fill('q8', 'Complete com o novo prefixo ao dividir 172.16.0.0/16 em 8 sub-redes (empreste 3 bits):', '172.16.0.0/16 em 8 sub-redes -> /___', ['19', '/19'], '2^3 = 8 sub-redes; 16 + 3 = 19.')
      ]
    },
    {
      id: 'rdb-12-vlsm',
      title: 'VLSM básico e planejamento de endereços',
      goal: 'Dividir um bloco em sub-redes de tamanhos diferentes e montar uma tabela de endereçamento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: sub-redes do mesmo tamanho desperdiçam',
            'No subnetting da lição anterior, todas as sub-redes tinham o mesmo tamanho. Mas redes reais são diferentes: um andar tem 100 máquinas, outro tem 20, e o link entre dois roteadores precisa de só 2 endereços. Se você der a todos o mesmo tamanho (o do maior), desperdiça muitos endereços. VLSM (Variable Length Subnet Mask, máscara de tamanho variável) permite usar prefixos DIFERENTES dentro do mesmo bloco, ajustando cada sub-rede à sua necessidade.'
          ),
          sl(
            'Escolher o prefixo de cada demanda',
            'Para cada sub-rede, ache o MENOR bloco que comporta os hosts necessários (lembre: hosts úteis = 2^h − 2). Exemplo de demandas: LAN-A com 100 hosts → h = 7 (126 úteis) → /25; LAN-B com 50 hosts → h = 6 (62) → /26; LAN-C com 20 hosts → h = 5 (30) → /27; enlace entre roteadores com 2 hosts → h = 2 (2) → /30.',
            'Demanda   Hosts  h   Úteis  Prefixo\nLAN-A      100   7   126    /25\nLAN-B       50   6    62    /26\nLAN-C       20   5    30    /27\nEnlace       2   2     2    /30'
          ),
          sl(
            'Regra de ouro: do maior para o menor',
            'Ordene as demandas da MAIOR para a MENOR e vá alocando em sequência, sempre no próximo endereço livre. Isso mantém os blocos alinhados (cada bloco começa num múltiplo do seu tamanho) e evita buracos. Se você alocar o pequeno primeiro, o grande pode não encontrar um endereço de início válido. Exemplo no bloco 192.168.50.0/24: LAN-A recebe 192.168.50.0/25 (de .0 a .127); LAN-B recebe 192.168.50.128/26 (de .128 a .191); LAN-C recebe 192.168.50.192/27 (de .192 a .223); o enlace recebe 192.168.50.224/30 (de .224 a .227). Sobra livre de .228 a .255.'
          ),
          sl(
            'Tabela de endereçamento',
            'Documente o plano numa tabela de endereçamento: um registro por sub-rede, com rede, prefixo, faixa de hosts úteis e broadcast. Ela evita sobreposição, guia a configuração dos equipamentos e ajuda quem for dar manutenção depois. Boas práticas: reserve folga para crescimento (não dimensione "na régua"), padronize o uso (por exemplo o primeiro host útil para o gateway) e guarde o documento atualizado.',
            'Sub-rede  Rede              Hosts úteis                    Broadcast\nLAN-A     192.168.50.0/25   .1 a .126                      192.168.50.127\nLAN-B     192.168.50.128/26 192.168.50.129 a .190          192.168.50.191\nLAN-C     192.168.50.192/27 192.168.50.193 a .222          192.168.50.223\nEnlace    192.168.50.224/30 192.168.50.225 a .226          192.168.50.227'
          ),
          sl(
            'Conferindo o plano',
            'Três verificações rápidas: 1) cada bloco começa num múltiplo do seu tamanho (128, 64, 32, 4 nos exemplos: 0, 128, 192, 224 — todos corretos); 2) um bloco termina exatamente antes do início do próximo (.127 → .128; .191 → .192; .223 → .224); 3) nenhuma faixa de hosts se sobrepõe a outra. Os endereços usados nesses exemplos são privados (192.168.0.0/16), próprios para estudo e redes internas.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a vantagem do VLSM?', 'd', 'Usar prefixos diferentes para cada sub-rede, evitando desperdício de endereços', [
          'Aumentar a quantidade total de endereços IPv4 existentes',
          'Eliminar a necessidade de máscara',
          'Transformar endereços privados em públicos'
        ], 'Com VLSM cada sub-rede tem o tamanho que precisa, em vez do tamanho do maior caso.'),
        mc('q2', 'Em que ordem se devem alocar as sub-redes num plano VLSM?', 'c', 'Da maior para a menor', [
          'Da menor para a maior',
          'Em ordem alfabética dos nomes',
          'Aleatória'
        ], 'Começar pelo maior mantém os blocos alinhados e evita buracos.'),
        mc('q3', 'Qual o menor prefixo que comporta 50 hosts (com rede e broadcast reservados)?', 'a', '/26 (62 hosts úteis)', [
          '/27 (30 hosts úteis)',
          '/25 (126 hosts úteis)',
          '/28 (14 hosts úteis)'
        ], '/27 só tem 30 úteis; /26 tem 62 e é o menor bloco que atende. /25 funciona mas desperdiça.'),
        fill('q4', 'Complete com o prefixo adequado para um enlace entre dois roteadores (2 hosts úteis):', 'Enlace ponto a ponto -> /___', ['30', '/30'], '/30 tem 2 bits de host: 2^2 − 2 = 2 endereços úteis.'),
        mc('q5', 'No plano com 192.168.50.0/24, a LAN-B (50 hosts) recebe 192.168.50.128/26. Qual é o endereço de rede da LAN-C (/27), alocada logo depois?', 'b', '192.168.50.192', [
          '192.168.50.191',
          '192.168.50.190',
          '192.168.50.224'
        ], 'LAN-B ocupa .128 a .191; o próximo endereço livre, .192, inicia a LAN-C.'),
        mc('q6', 'Quais são os hosts úteis da LAN-C (192.168.50.192/27)?', 'd', '192.168.50.193 a 192.168.50.222', [
          '192.168.50.192 a 192.168.50.223',
          '192.168.50.193 a 192.168.50.224',
          '192.168.50.192 a 192.168.50.222'
        ], 'O bloco vai de .192 a .223; .192 é a rede, .223 o broadcast; úteis: .193 a .222.'),
        mc('q7', 'Para que serve a tabela de endereçamento num plano de rede?', 'c', 'Documentar as sub-redes (rede, prefixo, faixa de hosts, broadcast), evitando sobreposição e guiando a configuração', [
          'Aumentar a velocidade da rede',
          'Substituir o DNS',
          'Criptografar os endereços'
        ], 'A tabela é a documentação do plano: guia a configuração e a manutenção futura.'),
        fill('q8', 'Complete com o endereço de broadcast da LAN-A, 192.168.50.0/25:', 'Broadcast de 192.168.50.0/25 = ___', ['192.168.50.127'], '/25 tem 128 endereços (.0 a .127); o último, .127, é o broadcast.')
      ]
    },
    {
      id: 'rdb-13-gateway-rotas',
      title: 'Gateway padrão e como um pacote sai da rede',
      goal: 'Entender quando o host fala direto e quando usa o gateway, a tabela de rotas do host e o TTL.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A decisão do host: mesma rede ou outra?',
            'Antes de enviar um pacote, o host faz uma conta com a sua máscara: o IP de destino está na MESMA sub-rede que o meu? Ele aplica AND entre a máscara e o IP de destino e compara com a própria rede. Se for igual, o destino está na LAN: o host envia direto, usando o MAC do destino (que descobre com ARP, assunto próximo). Se for diferente, o destino está fora: o host entrega o pacote ao GATEWAY PADRÃO e deixa o roteador cuidar do resto.',
            'Meu IP: 192.168.1.10/24\nDestino 192.168.1.50 -> mesma rede  -> entrega direta\nDestino 8.8.8.8      -> outra rede  -> envia ao gateway'
          ),
          sl(
            'Gateway padrão',
            'O GATEWAY PADRÃO (default gateway) é o endereço IP do roteador, na própria LAN, que serve de saída para todas as outras redes — em casa, é o roteador Wi-Fi (por exemplo 192.168.1.1). Condição obrigatória: o gateway precisa estar na MESMA sub-rede do host, senão o host nunca conseguiria alcançá-lo diretamente. Sem gateway configurado, o computador fala com a LAN, mas não sai dela (nada de internet).'
          ),
          sl(
            'A tabela de rotas do host',
            'Até um computador comum tem uma pequena tabela de rotas. Duas entradas típicas: a rota da rede local (destinos da minha sub-rede saem pela minha interface) e a ROTA PADRÃO, escrita como 0.0.0.0/0, que casa com qualquer destino sem rota mais específica e aponta para o gateway. O sistema escolhe a rota mais específica (maior prefixo) que casa com o destino. Você vê a tabela com ip route (Linux) ou route print (Windows).',
            '$ ip route\ndefault via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 scope link src 192.168.1.10'
          ),
          sl(
            'O que muda no caminho: IP fixo, MAC por salto',
            'Quando um pacote vai a outra rede, os endereços IP de origem e destino continuam os mesmos de ponta a ponta (a exceção é o NAT, que veremos). Já os endereços MAC mudam a CADA SALTO (de enlace em enlace): o seu notebook monta o quadro com o MAC do GATEWAY como destino; o roteador retira o quadro, lê o IP de destino, escolhe o próximo salto e refaz o quadro com novos MACs. Ou seja: IP diz para onde ir no final; MAC diz quem é o próximo vizinho.'
          ),
          sl(
            'TTL: o prazo de validade do pacote',
            'O TTL (Time To Live) é um campo de 8 bits no cabeçalho IP. A cada roteador por onde passa, o pacote tem o TTL diminuído em 1. Se chegar a 0, o roteador DESCARTA o pacote e avisa a origem com uma mensagem ICMP "Time Exceeded". Isso evita que pacotes fiquem circulando para sempre em caso de erro de rota (loop). Valores iniciais comuns variam por sistema (como 64, 128 e 255). O traceroute usa justamente esse mecanismo, como veremos.'
          )
        ]
      },
      questions: [
        mc('q1', 'Para que serve o gateway padrão de um host?', 'c', 'Ser o roteador de saída da LAN para destinos em outras redes', [
          'Traduzir nomes de sites em IP',
          'Distribuir endereços IP automaticamente',
          'Criptografar o tráfego Wi-Fi'
        ], 'O gateway é o roteador local usado para tudo que não está na sub-rede do host.'),
        mc('q2', 'Um host 192.168.1.10/24 quer falar com 192.168.1.50. Como ele envia?', 'b', 'Direto ao destino, pois está na mesma sub-rede', [
          'Ao gateway, que repassa ao destino',
          'Ao servidor DNS',
          'Não consegue, pois são IPs diferentes'
        ], 'Ambos estão em 192.168.1.0/24; a entrega é direta na LAN.'),
        mc('q3', 'O mesmo host (192.168.1.10/24) quer falar com 8.8.8.8. Para quem entrega o pacote?', 'a', 'Ao gateway padrão', [
          'Diretamente ao 8.8.8.8, via broadcast',
          'Ao servidor DHCP da rede',
          'Descarta o pacote'
        ], '8.8.8.8 está fora da sub-rede; o host o entrega ao gateway, que o encaminha.'),
        fill('q4', 'Complete com a notação da rota padrão (casa com qualquer destino):', 'Rota padrão = ___', ['0.0.0.0/0', '0.0.0.0'], 'A rota padrão é 0.0.0.0/0 e aponta para o gateway.'),
        mc('q5', 'Qual é a função do TTL no cabeçalho IP?', 'd', 'Limitar a vida do pacote: cada roteador subtrai 1 e, ao chegar a 0, o pacote é descartado', [
          'Medir a largura de banda do enlace',
          'Indicar a porta do serviço de destino',
          'Guardar o MAC do próximo salto'
        ], 'O TTL evita que pacotes circulem eternamente em caso de loop de roteamento.'),
        mc('q6', 'Ao enviar um pacote à internet, qual é o MAC de destino do quadro que sai do seu notebook?', 'c', 'O MAC do gateway (roteador local)', [
          'O MAC do servidor na internet',
          'FF:FF:FF:FF:FF:FF',
          'O MAC do seu próprio notebook'
        ], 'O quadro só precisa chegar ao próximo salto, o gateway; o IP de destino continua sendo o do servidor.'),
        mc('q7', 'Um host tem IP 10.0.0.15/24 e gateway configurado como 10.0.1.1. Qual é o problema?', 'b', 'O gateway está fora da sub-rede do host (10.0.0.0/24), então não pode ser alcançado diretamente', [
          'O IP 10.0.0.15 é público e não pode ter gateway',
          'Nenhum: o gateway pode estar em qualquer rede',
          'O prefixo /24 impede o uso de gateway'
        ], 'O gateway deve estar na mesma sub-rede do host; 10.0.1.1 não pertence a 10.0.0.0/24.'),
        fill('q8', 'Complete com o valor que cada roteador subtrai do TTL ao encaminhar um pacote:', 'TTL = TTL − ___', ['1', 'um'], 'Cada roteador diminui o TTL em 1.')
      ]
    },
    {
      id: 'rdb-28-mtu-fragmentacao',
      title: 'MTU, tamanho de quadros e fragmentação',
      goal: 'Entender MTU e MSS, como funciona a fragmentação IPv4, reconhecer sintomas de MTU errada e testá-la com ping.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é MTU e por que existe um limite',
            'MTU (Maximum Transmission Unit) é o maior tamanho de CARGA ÚTIL que um enlace aceita transportar num único quadro. Na Ethernet típica, o MTU é de 1500 bytes: o quadro pode carregar até 1500 bytes de dados da camada de cima (o pacote IP). Existe um limite porque cada quadro precisa ser transmitido inteiro: quadros enormes monopolizariam o meio por muito tempo, atrasando os outros, e um erro obrigaria a repetir muito mais dados. Por isso mensagens grandes são cortadas em pedaços que cabem no MTU.'
          ),
          sl(
            'Cabeçalhos e o MSS',
            'Dentro dos 1500 bytes do MTU viaja o pacote IP, que já contém seus próprios cabeçalhos. O cabeçalho IPv4 básico tem 20 bytes e o cabeçalho TCP básico também tem 20 bytes. O que sobra para os dados do aplicativo é o MSS (Maximum Segment Size): MSS = MTU − cabeçalho IP − cabeçalho TCP. Com MTU 1500: 1500 − 20 − 20 = 1460 bytes de dados por segmento TCP. O cabeçalho Ethernet (e o FCS) ficam FORA da conta do MTU, pois o MTU mede só a carga útil do quadro.',
            'MTU 1500 bytes\n[ IP 20 ][ TCP 20 ][ dados até 1460 ]\n                     ^ MSS = 1460'
          ),
          sl(
            'Fragmentação IPv4',
            'Se um pacote IPv4 é maior que o MTU do próximo enlace, o roteador pode FRAGMENTÁ-LO: cortá-lo em pedaços menores, cada um com seu cabeçalho IP. Três campos do cabeçalho IP ajudam: IDENTIFICAÇÃO (o mesmo número em todos os fragmentos do mesmo pacote original), FLAGS (inclui o bit MF, "mais fragmentos", ligado em todos exceto no último, e o bit DF, "não fragmentar") e DESLOCAMENTO (offset), que diz a posição do fragmento no pacote original, contada em unidades de 8 bytes. A remontagem é feita só no DESTINO final, nunca pelos roteadores no meio do caminho.'
          ),
          sl(
            'Exemplo numérico de fragmentação',
            'Um pacote IP de 4000 bytes no total (20 de cabeçalho + 3980 de dados) precisa passar por um enlace de MTU 1500. Cada fragmento pode levar no máximo 1500 − 20 = 1480 bytes de dados (1480 é divisível por 8, como exigido). Divisão: 3980 = 1480 + 1480 + 1020. Resultado: 3 fragmentos, de 1500, 1500 e 1040 bytes (já com os 20 de cabeçalho). Offsets: 0, 1480÷8 = 185 e 2960÷8 = 370.',
            'frag  dados  offset  MF\n  1    1480     0     1\n  2    1480   185     1\n  3    1020   370     0'
          ),
          sl(
            'Por que fragmentar é ruim, o bit DF e o MTU do caminho',
            'Fragmentar é ruim porque aumenta a sobrecarga (mais cabeçalhos), consome processamento no roteador e no destino (remontagem) e, se UM fragmento se perder, o pacote inteiro é perdido e precisa ser reenviado. Alguns firewalls também descartam fragmentos. Por isso, quem envia pode ligar o bit DF: significa "não fragmente". Se o pacote não couber no próximo enlace, o roteador o DESCARTA e avisa o remetente com uma mensagem ICMP "fragmentação necessária". Com essa informação o remetente descobre o menor MTU do caminho e passa a enviar pacotes menores. Essa técnica se chama DESCOBERTA DO MTU DO CAMINHO (Path MTU Discovery).'
          ),
          sl(
            'Sintoma de MTU errada e o caso do PPPoE',
            'Sintoma típico: pequenas coisas funcionam (ping, DNS, o começo de uma conexão), mas alguns sites abrem pela metade, travam ou ficam carregando, enquanto outros abrem normalmente. Acontece quando pacotes grandes são descartados em algum ponto do caminho e o aviso ICMP não chega ao remetente (por exemplo, bloqueado por um firewall). Uma causa clássica é o PPPoE, protocolo de conexão usado por alguns provedores, que acrescenta 8 bytes de cabeçalho e reduz o MTU da conexão para 1492. Nesse caso o MSS TCP passa a ser 1492 − 20 − 20 = 1452.'
          ),
          sl(
            'Testando com ping, jumbo frames e MTU não é velocidade',
            'Dá para descobrir o MTU enviando pings com o bit DF ligado e aumentando o tamanho dos dados. No Windows: ping -f -l TAMANHO destino. No Linux: ping -M do -s TAMANHO destino. O tamanho informado é só o dado do ping; somam-se 8 bytes do ICMP e 20 do IP: 1472 + 28 = 1500. Se o pacote não cabe, o Windows responde: "Packet needs to be fragmented but DF set." O maior tamanho que passa, mais 28, é o MTU. JUMBO FRAMES são quadros maiores que 1500 bytes (algo em torno de 9000); só funcionam se TODOS os equipamentos do caminho os aceitarem, por isso se usam em redes controladas, como entre servidores. Por fim, MTU é TAMANHO máximo do quadro, não velocidade: velocidade é quantos bits por segundo o enlace envia.',
            'ping -f -l 1472 192.0.2.10   -> responde (1472+28=1500)\nping -f -l 1473 192.0.2.10   -> Packet needs to be\n                                fragmented but DF set.'
          )
        ]
      },
      questions: [
        mc('q1', 'O que é o MTU?', 'b', 'O maior tamanho de carga útil que um enlace aceita num único quadro', [
          'A velocidade máxima do enlace em bits por segundo',
          'O número máximo de dispositivos na rede',
          'O tempo que um pacote leva para ir e voltar'
        ], 'MTU é limite de tamanho (1500 bytes na Ethernet típica), não de velocidade nem de tempo.'),
        mc('q2', 'Com MTU de 1500 bytes, cabeçalho IP de 20 bytes e cabeçalho TCP de 20 bytes, qual é o MSS?', 'd', '1460 bytes', [
          '1500 bytes',
          '1480 bytes',
          '1420 bytes'
        ], 'MSS = 1500 − 20 − 20 = 1460 bytes de dados do aplicativo por segmento.'),
        mc('q3', 'Um pacote IP de 4000 bytes (20 de cabeçalho e 3980 de dados) passa por um enlace de MTU 1500. Quantos fragmentos serão gerados?', 'a', '3 fragmentos (1480, 1480 e 1020 bytes de dados)', [
          '2 fragmentos',
          '4 fragmentos',
          'Nenhum, pois roteadores nunca fragmentam'
        ], 'Cada fragmento leva até 1480 bytes de dados: 3980 = 1480 + 1480 + 1020, ou seja, 3 fragmentos.'),
        fill('q4', 'Complete com a sigla do bit do cabeçalho IP que significa "não fragmentar":', 'Bit que proíbe a fragmentação: ___', ['DF', 'bit DF', 'don\'t fragment'], 'DF (Don\'t Fragment): se o pacote não couber, o roteador o descarta e avisa o remetente por ICMP.'),
        mc('q5', 'Alguns sites abrem normalmente, outros travam carregando, mas ping e DNS funcionam. Qual causa é plausível?', 'c', 'Pacotes grandes sendo descartados por MTU menor no caminho, sem o aviso chegar ao remetente', [
          'O cabo de rede está com o conector invertido',
          'O computador está sem endereço MAC',
          'O endereço IP está na faixa pública'
        ], 'Pacotes pequenos passam; os grandes são descartados. É o sintoma clássico de problema de MTU/descoberta do MTU do caminho.'),
        mc('q6', 'Numa conexão PPPoE com MTU de 1492, qual é o MSS TCP (cabeçalhos IP e TCP de 20 bytes)?', 'b', '1452 bytes', [
          '1472 bytes',
          '1460 bytes',
          '1492 bytes'
        ], '1492 − 20 − 20 = 1452 bytes.'),
        mc('q7', 'Qual afirmação sobre MTU e jumbo frames está correta?', 'd', 'Jumbo frames só funcionam se todo o caminho os aceitar, e MTU maior não significa enlace mais veloz', [
          'Jumbo frames funcionam sozinhos na internet inteira',
          'MTU é a mesma coisa que largura de banda',
          'Aumentar o MTU de um só equipamento sempre acelera a conexão'
        ], 'Jumbo frames exigem suporte de ponta a ponta (redes controladas). MTU é tamanho de quadro; velocidade é taxa de bits.'),
        fill('q8', 'No Windows, ping -f -l 1464 funciona e ping -f -l 1465 responde "Packet needs to be fragmented but DF set." Some 28 bytes (8 de ICMP + 20 de IP) ao maior tamanho que passou e informe o MTU:', 'ping -f -l 1464 -> ok\nping -f -l 1465 -> precisa fragmentar\nMTU = 1464 + 28 = ___', ['1492'], '1464 + 28 = 1492, o MTU típico de uma conexão PPPoE.')
      ]
    },
    {
      id: 'rdb-14-arp',
      title: 'ARP: descobrindo o MAC a partir do IP',
      goal: 'Entender como o ARP resolve IP em MAC na rede local, o cache ARP e o risco do ARP spoofing.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema que o ARP resolve',
            'Na rede local, os quadros Ethernet precisam do endereço MAC de destino, mas as aplicações só conhecem o IP. Como descobrir o MAC de quem tem o IP 192.168.1.1? É para isso que existe o ARP (Address Resolution Protocol): ele resolve IP → MAC dentro da LAN (é um protocolo do IPv4; o IPv6 usa outro mecanismo, o NDP). Sem ARP, o host não saberia para quem endereçar o quadro.'
          ),
          sl(
            'Requisição ARP: pergunta em broadcast',
            'Quando o host A (192.168.1.10) precisa do MAC do IP 192.168.1.1, ele envia uma REQUISIÇÃO ARP em BROADCAST (MAC de destino FF:FF:FF:FF:FF:FF), para que todos da LAN a recebam: "Quem tem o IP 192.168.1.1? Responda para 192.168.1.10". Todos os dispositivos leem, mas só o dono daquele IP responde; os demais ignoram.',
            'A -> TODOS (FF:FF:FF:FF:FF:FF):\n  "Quem tem 192.168.1.1? Diga a 192.168.1.10"'
          ),
          sl(
            'Resposta ARP: unicast',
            'O dono do IP responde com uma RESPOSTA ARP em UNICAST, direto para A: "192.168.1.1 está no MAC AA:BB:CC:00:11:22". Agora A sabe o MAC e pode montar o quadro. Resumindo: requisição = broadcast (pergunta a todos); resposta = unicast (só a quem perguntou).',
            'ROTEADOR -> A (unicast):\n  "192.168.1.1 está em AA:BB:CC:00:11:22"'
          ),
          sl(
            'O cache ARP e o comando arp -a',
            'Para não perguntar toda vez, cada host guarda as respostas numa tabela temporária: o CACHE ARP. As entradas expiram depois de algum tempo sem uso (dinâmicas) e podem também ser fixadas à mão (estáticas). Para ver a tabela, use arp -a (funciona em Windows e Linux; no Linux moderno também existe ip neigh).',
            'C:\\> arp -a\nInterface: 192.168.1.10\n  Endereço IP      Endereço físico      Tipo\n  192.168.1.1      aa-bb-cc-00-11-22    dinâmico\n  192.168.1.50     de-ad-be-ef-00-33    dinâmico'
          ),
          sl(
            'E para destinos fora da LAN?',
            'O ARP só funciona dentro da rede local (broadcast não atravessa roteadores). Se o destino é de outra rede, o host NÃO pergunta o MAC do destino distante: ele faz ARP do MAC do GATEWAY e envia o quadro a ele. Por isso, no cache ARP do seu computador aparecem sobretudo vizinhos da LAN e o gateway, e não os servidores da internet.'
          ),
          sl(
            'ARP spoofing: o problema e a defesa',
            'O ARP original não tem autenticação: o host aceita respostas sem conferir se são verdadeiras. No ARP SPOOFING, um dispositivo malicioso dentro da mesma LAN envia respostas ARP falsas para convencer vítimas de que o IP do gateway está no MAC dele, desviando o tráfego para ser espionado ou alterado (ataque do tipo "homem no meio"). Não é preciso saber executá-lo; o importante é saber se defender: usar HTTPS/VPN (o conteúdo continua cifrado mesmo desviado), confiar só em redes confiáveis, segmentar e isolar clientes (Wi-Fi de convidados), e em redes maiores habilitar nos switches recursos como Dynamic ARP Inspection, que descarta respostas ARP inconsistentes. Desconfie também de avisos de certificado inválido no navegador.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a função do ARP?', 'd', 'Descobrir o endereço MAC correspondente a um IP na rede local', [
          'Traduzir nomes de sites em endereços IP',
          'Atribuir endereços IP automaticamente',
          'Descobrir o caminho até um servidor remoto'
        ], 'ARP resolve IP → MAC na LAN. Nomes → IP é função do DNS; distribuir IPs é do DHCP.'),
        mc('q2', 'Como é enviada a requisição ARP?', 'a', 'Em broadcast, para todos os dispositivos da LAN', [
          'Em unicast, direto ao dono do IP',
          'Por e-mail',
          'Somente ao gateway'
        ], 'Como o host não sabe o MAC, pergunta a todos (FF:FF:FF:FF:FF:FF).'),
        mc('q3', 'Como o dono do IP responde a uma requisição ARP?', 'b', 'Com uma resposta em unicast para quem perguntou', [
          'Com broadcast para todos',
          'Não responde; o switch responde por ele',
          'Com uma mensagem DNS'
        ], 'A resposta é direcionada (unicast) ao solicitante, informando o MAC.'),
        fill('q4', 'Complete com o comando que exibe o cache ARP (vale em Windows e Linux):', '$ ___', ['arp -a', 'arp -an', 'arp -a -n'], 'arp -a lista os pares IP ↔ MAC aprendidos.'),
        mc('q5', 'Seu PC (192.168.1.10/24) vai acessar um servidor na internet. De quem ele pergunta o MAC por ARP?', 'c', 'Do gateway padrão', [
          'Do servidor na internet',
          'De todos os roteadores da internet',
          'Do servidor DNS do provedor'
        ], 'ARP só funciona na LAN; o quadro é endereçado ao MAC do gateway, que encaminha o pacote.'),
        mc('q6', 'Por que existe o cache ARP?', 'd', 'Para evitar perguntar o mesmo MAC a cada pacote, guardando respostas por um tempo', [
          'Para criptografar as respostas ARP',
          'Para aumentar o alcance do Wi-Fi',
          'Para descobrir a senha da rede'
        ], 'Sem cache, cada pacote geraria uma nova requisição broadcast.'),
        mc('q7', 'O que é ARP spoofing e qual medida ajuda a reduzir o dano?', 'a', 'Respostas ARP falsas desviam o tráfego da LAN; usar HTTPS/VPN mantém o conteúdo cifrado mesmo se desviado', [
          'Uma falha do cabo; basta trocar o cabo',
          'Um erro de DNS; basta mudar o servidor DNS',
          'Um tipo de Wi-Fi; basta desligar o roteador'
        ], 'Como o ARP não autentica, respostas falsas são aceitas; HTTPS/VPN e inspeção ARP nos switches reduzem o risco.'),
        fill('q8', 'Complete: o ARP associa um endereço IP a um endereço ___ (sigla de 3 letras):', 'ARP: IP -> ___', ['MAC', 'mac'], 'O ARP mapeia o IP (camada 3) para o MAC (camada 2).')
      ]
    },
    {
      id: 'rdb-15-icmp-ferramentas',
      title: 'ICMP e ferramentas básicas de rede',
      goal: 'Usar e interpretar ping, traceroute, ipconfig/ip a, nslookup, ss/netstat, arp e curl.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ICMP: o protocolo de mensagens de controle',
            'O ICMP (Internet Control Message Protocol) é um protocolo da camada de rede usado para mensagens de controle e diagnóstico, não para transportar dados de usuário. Mensagens comuns: Echo Request/Echo Reply (o "ping"), Destination Unreachable (destino inalcançável) e Time Exceeded (TTL chegou a 0). Roteadores e hosts usam o ICMP para informar problemas, e ferramentas como ping e traceroute são construídas sobre ele.'
          ),
          sl(
            'ping: o destino responde?',
            'O ping envia Echo Requests e espera Echo Replies. Mostra se o destino está acessível e quanto tempo levou (o RTT). Atenção ao que cada campo significa: bytes = tamanho dos dados; time (ou tempo) = RTT em milissegundos; ttl = o TTL restante no pacote de resposta. No final há um resumo: pacotes enviados/recebidos e a porcentagem de perda — 0% de perda é o ideal.',
            '$ ping 192.168.1.1\n64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.84 ms\n64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.62 ms\n--- 192.168.1.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss'
          ),
          sl(
            'Mensagens de erro do ping',
            'No Windows: "Request timed out" (esgotou o tempo): não chegou resposta — o destino pode estar desligado, o caminho pode estar quebrado ou um firewall pode bloquear ICMP (nem toda máquina que não responde ping está fora do ar!). "Destination host unreachable": alguém (um roteador, ou o próprio computador) informou que não consegue alcançar o destino; se a resposta vem do SEU próprio IP, costuma ser que o host nem achou o vizinho na LAN (falha de ARP). "TTL expired in transit": o TTL chegou a 0 no meio do caminho — pode indicar um laço de roteamento.',
            'Request timed out.\nReply from 192.168.1.10: Destination host unreachable.\nReply from 10.0.0.1: TTL expired in transit.'
          ),
          sl(
            'traceroute / tracert: o caminho dos pacotes',
            'O traceroute mostra os roteadores (saltos) entre você e o destino. Truque: ele envia pacotes com TTL 1, depois 2, depois 3... Cada roteador que zera o TTL descarta o pacote e responde "Time Exceeded", revelando seu endereço e o tempo de resposta. Linux/macOS: traceroute; Windows: tracert. Linhas com "* * *" significam que aquele roteador não respondeu (muitos bloqueiam), o que nem sempre é falha.',
            'C:\\> tracert 203.0.113.10\n 1    2 ms   1 ms   1 ms   192.168.1.1\n 2    9 ms   8 ms   9 ms   198.51.100.1\n 3    *      *      *      Request timed out.\n 4   25 ms  24 ms  26 ms   203.0.113.10'
          ),
          sl(
            'Ver a configuração: ipconfig, ip a, ifconfig',
            'ipconfig (Windows) mostra os adaptadores com endereço IPv4, máscara, gateway padrão; ipconfig /all acrescenta o MAC, DNS e DHCP. No Linux, ip a (ou ip addr) lista interfaces e IPs, e ip route mostra gateway e rotas; ifconfig é a ferramenta antiga equivalente. Use-os sempre como primeiro passo de qualquer diagnóstico: o IP está certo? Há gateway?',
            '$ ip a\n2: eth0: ...\n    link/ether aa:bb:cc:00:11:33\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0'
          ),
          sl(
            'nslookup, ss/netstat, arp e curl',
            'nslookup nome: consulta o DNS e mostra qual servidor respondeu e o IP do nome. netstat -an (Windows) ou ss -tuln (Linux): lista conexões e as portas em que a máquina está ESCUTANDO (útil para saber que serviços estão abertos). arp -a: mostra o cache ARP. curl endereço: faz uma requisição (HTTP/HTTPS etc.) pela linha de comando e mostra a resposta; curl -I mostra só os cabeçalhos e o código de status. Cada ferramenta olha uma camada: ping/traceroute na 3, nslookup na 7, ss/netstat na 4, arp na 2/3.',
            '$ nslookup www.exemplo.com.br\n$ ss -tuln\n$ arp -a\n$ curl -I https://www.exemplo.com.br'
          )
        ]
      },
      questions: [
        mc('q1', 'Em "64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.84 ms", o que é "time=1.84 ms"?', 'a', 'O tempo de ida e volta (RTT) do pacote', [
          'O tempo de vida (TTL) restante',
          'A largura de banda do enlace',
          'O tempo total desde que o roteador foi ligado'
        ], 'time é o RTT em milissegundos; ttl é o TTL restante do pacote de resposta.'),
        mc('q2', 'Qual comando mostra IP, máscara e gateway padrão no Windows?', 'd', 'ipconfig', [
          'traceroute',
          'ss -tuln',
          'curl -I'
        ], 'ipconfig exibe a configuração dos adaptadores; no Linux, o equivalente é ip a (e ip route para o gateway).'),
        mc('q3', 'O ping retorna "Reply from 192.168.1.10: Destination host unreachable", vindo do SEU PRÓPRIO IP (192.168.1.10). O que costuma indicar?', 'b', 'Seu computador não conseguiu alcançar o vizinho na LAN (por exemplo, falha na resolução ARP)', [
          'O servidor de destino respondeu, mas lentamente',
          'O TTL foi alterado pelo provedor',
          'Que o site está em manutenção'
        ], 'Quando a mensagem vem do próprio host, ele não achou o destino/gateway na rede local.'),
        fill('q4', 'Complete com o nome do comando equivalente ao traceroute no Windows:', 'C:\\> ___ 203.0.113.10', ['tracert'], 'No Windows o comando é tracert; no Linux/macOS, traceroute.'),
        mc('q5', 'Como o traceroute descobre cada roteador do caminho?', 'c', 'Envia pacotes com TTL crescente (1, 2, 3...), e cada roteador que zera o TTL responde com "Time Exceeded"', [
          'Pergunta ao DNS qual é a lista de roteadores',
          'Lê a tabela ARP de cada roteador',
          'Usa uma porta especial que todos os roteadores respondem com seu nome'
        ], 'O TTL expirando em cada salto revela, em sequência, os roteadores do caminho.'),
        mc('q6', 'Qual associação ferramenta → função está correta?', 'd', 'nslookup: consulta DNS; ss/netstat: portas e conexões; arp -a: cache ARP', [
          'nslookup: lista portas abertas; ss/netstat: consulta DNS; arp -a: mostra rotas',
          'nslookup: mostra o cache ARP; ss/netstat: traça o caminho; arp -a: consulta DNS',
          'nslookup: faz requisições HTTP; ss/netstat: mede latência; arp -a: mostra o IP'
        ], 'nslookup fala com o DNS; ss/netstat mostra sockets e portas; arp -a exibe o cache ARP.'),
        mc('q7', 'Um ping para um servidor mostra "Request timed out", mas o site abre no navegador. Qual é uma explicação plausível?', 'a', 'O servidor ou um firewall bloqueia ICMP, embora HTTP/HTTPS funcione', [
          'O navegador usa ICMP, que está desligado',
          'O site abre apenas por cache do DNS',
          'O ping só funciona com sites HTTP, nunca HTTPS'
        ], 'Muitos servidores/firewalls descartam ICMP; falta de resposta ao ping não prova que o serviço está fora do ar.'),
        fill('q8', 'Complete com o comando que faz uma requisição HTTP/HTTPS pela linha de comando e mostra a resposta:', '$ ___ -I https://www.exemplo.com.br', ['curl'], 'curl faz requisições e mostra a resposta; com -I, só os cabeçalhos e o status.')
      ]
    },
    {
      id: 'rdb-16-tcp-udp',
      title: 'TCP e UDP: portas e sockets',
      goal: 'Entender portas, socket, o handshake de 3 vias do TCP, a confiabilidade e quando usar UDP.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Portas: o endereço do programa',
            'O IP leva o pacote até o computador certo; a PORTA leva o dado ao PROGRAMA certo dentro dele. Uma porta é um número de 16 bits, de 0 a 65535 (2^16 = 65.536 portas). Pense num prédio: o IP é o endereço da rua, a porta é o número do apartamento. As faixas: 0–1023 são portas BEM CONHECIDAS (serviços padronizados); 1024–49151 são registradas; 49152–65535 são dinâmicas/efêmeras, usadas pelos clientes como porta de origem temporária.'
          ),
          sl(
            'Portas bem conhecidas',
            'Serviços padrão usam portas fixas para que os clientes saibam onde bater: HTTP 80, HTTPS 443, SSH 22, DNS 53, SMTP 25, FTP 21, Telnet 23, POP3 110, IMAP 143, DHCP 67/68. Quando seu navegador abre um site HTTPS, ele usa uma porta alta aleatória como origem e a 443 como destino.',
            'Porta  Serviço\n  21   FTP\n  22   SSH\n  23   Telnet\n  25   SMTP\n  53   DNS\n  80   HTTP\n 110   POP3\n 143   IMAP\n 443   HTTPS'
          ),
          sl(
            'Socket: IP + porta',
            'Um SOCKET é a combinação de um endereço IP com uma porta (e o protocolo, TCP ou UDP), como 192.168.1.10:51234. Uma conexão TCP é identificada pelo par de sockets dos dois lados: origem (IP:porta) e destino (IP:porta). Por isso o mesmo servidor, na porta 443, atende milhares de clientes ao mesmo tempo — cada um tem um socket de origem diferente.',
            '192.168.1.10:51234  ->  203.0.113.10:443\n(cliente: IP + porta efêmera)  (servidor: IP + porta 443)'
          ),
          sl(
            'TCP: conexão, confiabilidade e ordem',
            'O TCP (Transmission Control Protocol) é ORIENTADO À CONEXÃO: antes de trocar dados, os dois lados estabelecem uma conexão. É CONFIÁVEL: o receptor confirma (ACK) o que recebeu, e o que se perdeu é retransmitido. É ORDENADO: números de sequência permitem remontar os dados na ordem certa mesmo se os pacotes chegarem embaralhados. Também faz controle de fluxo (não afogar o receptor) e de congestionamento (não afogar a rede). Preço: mais cabeçalho e mais atraso.'
          ),
          sl(
            'Three-way handshake: abrir a conexão',
            'Para abrir uma conexão, o TCP faz o aperto de mão em 3 vias. 1) O cliente envia SYN ("quero conectar", com seu número de sequência inicial). 2) O servidor responde SYN-ACK ("aceito e também quero sincronizar"). 3) O cliente envia ACK ("confirmado"). Pronto: a conexão está estabelecida e os dados fluem.',
            'Cliente                    Servidor\n  |---------- SYN ---------->|\n  |<------- SYN-ACK ---------|\n  |---------- ACK ---------->|\n  |====== dados ============|'
          ),
          sl(
            'Encerrando a conexão',
            'O encerramento normal usa FIN: um lado envia FIN ("terminei de enviar"), o outro confirma com ACK e depois envia o seu próprio FIN, que também é confirmado — por isso se fala em encerramento em 4 passos. Se algo dá errado, um lado pode derrubar a conexão abruptamente com RST (reset). Servidores sobrecarregados de pedidos SYN que nunca completam o handshake são alvo clássico de ataques de negação de serviço, daí a importância de firewalls e limites.'
          ),
          sl(
            'UDP: sem conexão, simples e rápido',
            'O UDP (User Datagram Protocol) é SEM CONEXÃO: simplesmente envia datagramas, sem handshake, sem confirmação, sem retransmissão e sem garantia de ordem. Em troca, tem cabeçalho pequeno (8 bytes) e pouco atraso. Use TCP quando não pode perder dado: web, e-mail, SSH, transferência de arquivos. Use UDP quando velocidade e baixa latência importam mais que a perfeição: voz e vídeo ao vivo, jogos online, consultas DNS, DHCP, NTP. A aplicação pode implementar sua própria confiabilidade sobre o UDP se precisar.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a faixa de números de porta?', 'b', '0 a 65535', [
          '1 a 1024',
          '0 a 255',
          '1 a 99999'
        ], 'A porta tem 16 bits: 2^16 = 65.536 valores, de 0 a 65535.'),
        mc('q2', 'Qual serviço usa por padrão a porta 22?', 'c', 'SSH', [
          'HTTP',
          'DNS',
          'SMTP'
        ], 'SSH = 22; HTTP = 80; DNS = 53; SMTP = 25.'),
        mc('q3', 'O que é um socket?', 'd', 'A combinação de endereço IP com número de porta (e protocolo)', [
          'O conector físico do cabo',
          'Um tipo de roteador',
          'O endereço MAC da placa'
        ], 'Socket = IP:porta, como 192.168.1.10:51234.'),
        fill('q4', 'Complete com a primeira mensagem do three-way handshake do TCP:', '___ -> SYN-ACK -> ACK', ['SYN'], 'O cliente inicia a conexão enviando um segmento SYN.'),
        mc('q5', 'Qual é a ordem correta do three-way handshake?', 'a', 'SYN, SYN-ACK, ACK', [
          'SYN, ACK, SYN-ACK',
          'ACK, SYN, SYN-ACK',
          'SYN-ACK, SYN, ACK'
        ], 'Cliente: SYN; servidor: SYN-ACK; cliente: ACK.'),
        mc('q6', 'Qual protocolo é mais adequado para uma chamada de voz ao vivo, em que atraso é pior que perder um pequeno trecho?', 'd', 'UDP', [
          'TCP, porque retransmite o que se perdeu',
          'FTP',
          'HTTPS, por ter cadeado'
        ], 'Em tempo real, uma retransmissão chegaria tarde demais; o UDP evita esse atraso.'),
        mc('q7', 'O que torna o TCP confiável e ordenado?', 'a', 'Confirmações (ACK), retransmissão do que se perde e números de sequência', [
          'O uso exclusivo de portas abaixo de 1024',
          'A ausência de cabeçalho',
          'O envio de cada pacote por um cabo diferente'
        ], 'ACKs e retransmissões garantem a entrega; números de sequência reordenam os dados.'),
        fill('q8', 'Complete com o número da porta padrão do HTTP (sem criptografia):', 'HTTP usa a porta ___', ['80'], 'HTTP = 80 e HTTPS = 443.')
      ]
    },
    {
      id: 'rdb-17-dns',
      title: 'DNS básico',
      goal: 'Entender como nomes viram IPs: hierarquia, resolução, cache/TTL, tipos de registro e arquivo hosts.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o DNS existe',
            'Humanos lembram nomes (www.exemplo.com.br); redes precisam de endereços IP. O DNS (Domain Name System) é a "lista telefônica" distribuída da internet: converte nomes em IPs (e vice-versa, na resolução inversa). Funciona de forma distribuída e hierárquica, sem um único servidor com tudo. Normalmente usa a porta 53 (UDP para consultas comuns, TCP em respostas grandes e em outras operações).'
          ),
          sl(
            'A hierarquia: raiz, TLD, domínio',
            'Os nomes são lidos da direita para a esquerda numa árvore. No topo está a RAIZ (representada por um ponto final invisível). Abaixo, os domínios de topo (TLD): .com, .org, .br... Depois, o domínio registrado (exemplo.com.br) e os subdomínios (www, mail). Um nome completo, do host até a raiz, é um FQDN (Fully Qualified Domain Name): www.exemplo.com.br.',
            '.                     (raiz)\n └── br               (TLD)\n      └── com.br\n           └── exemplo.com.br   (domínio)\n                └── www.exemplo.com.br   (host/FQDN)'
          ),
          sl(
            'Como uma consulta é resolvida',
            'Seu computador não percorre a árvore sozinho: pergunta a um RESOLVER (resolvedor recursivo) — normalmente o do provedor, o do roteador de casa (que repassa a ele) ou um público. Na consulta RECURSIVA, o cliente pede ao resolver "me traga a resposta final". Se o resolver não tem a resposta guardada, faz consultas ITERATIVAS: pergunta a um servidor raiz, que indica quem cuida do TLD; pergunta ao servidor do TLD, que indica o servidor autoritativo do domínio; pergunta ao autoritativo, que dá a resposta definitiva. O resolver devolve o resultado ao cliente.',
            'PC -> resolver: www.exemplo.com.br?\nresolver -> raiz:   "pergunte ao servidor do .br"\nresolver -> .br:    "pergunte ao NS de exemplo.com.br"\nresolver -> autoritativo: 203.0.113.10\nresolver -> PC: 203.0.113.10'
          ),
          sl(
            'Cache e TTL',
            'Para ser rápido, o DNS guarda respostas em CACHE (no navegador, no sistema operacional e no resolver). Cada registro tem um TTL (Time To Live, em segundos), definido pelo dono do domínio, que diz por quanto tempo a resposta pode ser reutilizada sem nova consulta. TTL alto = menos consultas, mas mudanças demoram para se espalhar; TTL baixo = mudanças rápidas, mais consultas. Não confunda com o TTL do cabeçalho IP (que conta saltos).'
          ),
          sl(
            'Tipos de registro DNS',
            'A: nome → endereço IPv4. AAAA: nome → endereço IPv6. CNAME: apelido; aponta um nome para outro nome (o DNS segue até achar um A/AAAA). MX: servidores de e-mail do domínio (com prioridade). NS: servidores de nomes autoritativos da zona. TXT: texto livre, usado para verificações e políticas de e-mail. Cada tipo responde a uma pergunta diferente.',
            'www      A      203.0.113.10\nwww      AAAA   2001:db8::10\nblog     CNAME  www.exemplo.com.br.\n@        MX     10 mail.exemplo.com.br.\n@        NS     ns1.exemplo.com.br.\n@        TXT    "texto de verificação"'
          ),
          sl(
            'Arquivo hosts, nslookup e dig',
            'O ARQUIVO HOSTS é uma lista local de nomes → IP, consultada antes do DNS na maioria dos sistemas (Linux: /etc/hosts; Windows: C:\\Windows\\System32\\drivers\\etc\\hosts). Serve para testes e bloqueios locais; edite com cuidado, pois entradas erradas "enganam" só aquela máquina. As ferramentas de consulta: nslookup (Windows/Linux) e dig (Linux/macOS, mais detalhada). Nota de privacidade: um DNS comum não é criptografado, então o resolver e a rede veem os nomes que você consulta; há variantes cifradas (DoT/DoH).',
            '$ nslookup www.exemplo.com.br\nServer:  192.168.1.1\nNon-authoritative answer:\nName:    www.exemplo.com.br\nAddress: 203.0.113.10\n\n$ dig www.exemplo.com.br A +short\n203.0.113.10'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a função principal do DNS?', 'c', 'Converter nomes de domínio em endereços IP', [
          'Atribuir endereços IP automaticamente',
          'Descobrir o MAC de um IP na LAN',
          'Criptografar páginas web'
        ], 'DNS = nome → IP. DHCP atribui IPs; ARP resolve IP → MAC.'),
        mc('q2', 'Na resolução de www.exemplo.com.br, qual servidor dá a resposta definitiva?', 'b', 'O servidor autoritativo do domínio exemplo.com.br', [
          'O servidor raiz',
          'O servidor do TLD .br, que só indica o caminho',
          'O switch da sua LAN'
        ], 'Raiz e TLD indicam quem consultar; o autoritativo guarda os registros do domínio e responde.'),
        mc('q3', 'Qual associação de tipos de registro está correta?', 'a', 'AAAA: nome → IPv6; NS: servidores de nomes da zona; TXT: texto livre (verificações)', [
          'AAAA: nome → IPv4; NS: servidor de e-mail; TXT: apelido',
          'AAAA: servidor de e-mail; NS: apelido; TXT: nome → IPv6',
          'AAAA: apelido; NS: texto livre; TXT: nome → IPv4'
        ], 'A = IPv4, AAAA = IPv6; NS = servidores de nomes; TXT = texto livre; MX = e-mail; CNAME = apelido.'),
        fill('q4', 'Complete com o tipo de registro DNS que cria um APELIDO, apontando um nome para outro nome:', 'blog  ___  www.exemplo.com.br.', ['CNAME', 'cname'], 'CNAME é um apelido: o DNS segue o nome apontado até encontrar o A/AAAA.'),
        mc('q5', 'O que define o TTL de um registro DNS?', 'd', 'Por quanto tempo a resposta pode ficar em cache antes de ser consultada de novo', [
          'O número máximo de roteadores até o servidor',
          'A velocidade do servidor de nomes',
          'O tamanho máximo da página'
        ], 'O TTL do DNS (em segundos) controla o cache; não é o TTL do cabeçalho IP, que conta saltos.'),
        mc('q6', 'O que o arquivo hosts faz?', 'b', 'Mapeia nomes em IPs localmente, e costuma ser consultado antes do DNS', [
          'Guarda o cache de todos os resolvers do mundo',
          'Distribui IPs aos dispositivos da LAN',
          'Define as portas bem conhecidas'
        ], 'É uma lista local de nomes → IP que prevalece sobre o DNS na máquina.'),
        mc('q7', 'Qual é a diferença entre consulta recursiva e iterativa?', 'd', 'Na recursiva o cliente pede a resposta final ao resolver; na iterativa o resolver recebe indicações de servidor em servidor até a resposta', [
          'A recursiva só vale para IPv6 e a iterativa para IPv4',
          'A recursiva é sempre mais segura que a iterativa',
          'Não há diferença; são nomes diferentes da mesma consulta'
        ], 'O cliente faz uma pergunta recursiva ao resolver; este faz consultas iterativas à raiz, ao TLD e ao autoritativo.'),
        fill('q8', 'Complete com o tipo de registro DNS que indica os servidores de e-mail de um domínio:', 'exemplo.com.br  ___  10 mail.exemplo.com.br.', ['MX', 'mx'], 'MX (Mail Exchange) indica os servidores que recebem e-mail do domínio, com prioridade.')
      ]
    },
    {
      id: 'rdb-18-dhcp',
      title: 'DHCP: configuração automática',
      goal: 'Entender o DHCP, o processo DORA, a concessão (lease), o escopo, a reserva por MAC e o APIPA.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: configurar cada máquina à mão',
            'Para funcionar numa rede, um dispositivo precisa de IP, máscara, gateway e DNS. Configurar isso manualmente em cada aparelho dá trabalho e causa erros (IPs repetidos!). O DHCP (Dynamic Host Configuration Protocol) resolve: um servidor DHCP entrega essas configurações automaticamente a quem entra na rede. Em casa, o roteador Wi-Fi é o servidor DHCP. O DHCP usa UDP: porta 67 no servidor e 68 no cliente.'
          ),
          sl(
            'O processo DORA',
            'A conversa tem 4 mensagens, de iniciais DORA. D = DISCOVER: o cliente, sem IP ainda, grita em broadcast "tem algum servidor DHCP aí?" (origem 0.0.0.0, destino 255.255.255.255). O = OFFER: o servidor oferece um IP e as configurações. R = REQUEST: o cliente aceita a oferta e a solicita formalmente (também em broadcast, avisando outros servidores). A = ACKNOWLEDGE: o servidor confirma e o cliente passa a usar o IP.',
            'Cliente                   Servidor DHCP\n  |--- Discover (broadcast) -->|\n  |<-- Offer (192.168.1.100) ---|\n  |--- Request (quero esse) --->|\n  |<-- Acknowledge (confirmado)-|'
          ),
          sl(
            'Lease: o IP é emprestado',
            'O endereço não é dado para sempre: é CONCEDIDO por um tempo, o LEASE (concessão). Perto da metade do prazo, o cliente tenta renová-lo; se o dispositivo sai da rede e não renova, o endereço volta ao estoque e pode ir a outro. Lease curto = rotatividade rápida (bom para redes com muitos visitantes); lease longo = menos tráfego e endereços mais estáveis.'
          ),
          sl(
            'Escopo (pool) do servidor',
            'O ESCOPO (scope ou pool) é o conjunto de endereços que o servidor pode distribuir, com as demais configurações da rede. Exemplo: rede 192.168.1.0/24; pool de 192.168.1.100 a 192.168.1.199; gateway 192.168.1.1; DNS 192.168.1.1; lease de 24 horas. Dispositivos que precisam de IP fixo (impressora, servidor) devem usar um endereço FORA do pool (ou uma reserva), para o DHCP nunca entregá-lo a outro.',
            'Rede:     192.168.1.0/24\nPool:     192.168.1.100 - 192.168.1.199\nGateway:  192.168.1.1\nDNS:      192.168.1.1\nLease:    24 horas'
          ),
          sl(
            'Reserva por MAC',
            'A RESERVA DHCP (DHCP reservation) associa um MAC a um IP específico: sempre que aquele dispositivo pedir, o servidor entrega o mesmo IP. Vantagem sobre configurar IP fixo no aparelho: o IP é gerido num lugar só, o servidor, e o aparelho continua em DHCP. Ótimo para impressoras, câmeras e servidores domésticos.'
          ),
          sl(
            'Quando o DHCP falha: APIPA',
            'Se o cliente não recebe nenhuma resposta do DHCP, o sistema se auto-atribui um endereço APIPA (Automatic Private IP Addressing) na faixa 169.254.x.x/16. Esse IP só permite conversar com outros dispositivos em situação parecida na mesma LAN, sem gateway nem internet. Ver 169.254.x.x é sinal clássico de que o servidor DHCP não respondeu (cabo solto, servidor fora do ar, Wi-Fi mal conectado). Em redes sérias, switches podem filtrar servidores DHCP falsos (DHCP snooping), pois um "servidor" não autorizado poderia entregar gateway ou DNS maliciosos.'
          )
        ]
      },
      questions: [
        mc('q1', 'Quais configurações um servidor DHCP normalmente entrega ao cliente?', 'd', 'IP, máscara, gateway padrão e servidores DNS', [
          'Apenas o MAC e o nome do dono',
          'Somente a senha do Wi-Fi',
          'Somente o endereço do site acessado'
        ], 'O DHCP entrega a configuração de rede: IP, máscara, gateway e DNS (entre outras opções).'),
        mc('q2', 'Qual é a ordem correta do processo DHCP?', 'c', 'Discover, Offer, Request, Acknowledge', [
          'Offer, Discover, Acknowledge, Request',
          'Request, Offer, Discover, Acknowledge',
          'Discover, Request, Offer, Acknowledge'
        ], 'DORA: o cliente descobre (Discover), o servidor oferece (Offer), o cliente solicita (Request) e o servidor confirma (Acknowledge).'),
        mc('q3', 'O pool do servidor DHCP é 192.168.1.100 a 192.168.1.199. Onde deve ficar o IP fixo de uma impressora?', 'a', 'Fora do pool (ou numa reserva), para o DHCP não entregá-lo a outro aparelho', [
          'Dentro do pool, sem qualquer cuidado',
          'Em 0.0.0.0',
          'Em 255.255.255.255'
        ], 'IPs estáticos fora do pool, ou reserva por MAC, evitam conflito de endereço.'),
        fill('q4', 'Complete a segunda mensagem do processo DORA, em que o servidor oferece um IP:', 'Discover, ___, Request, Acknowledge', ['Offer', 'oferta'], 'Offer: o servidor oferece um endereço e as configurações ao cliente.'),
        mc('q5', 'O que é o lease (concessão) do DHCP?', 'b', 'O tempo durante o qual o cliente pode usar o IP recebido, antes de renovar', [
          'A senha de acesso ao servidor DHCP',
          'O número máximo de portas do switch',
          'O endereço MAC do servidor'
        ], 'O IP é emprestado por um prazo; ao fim (ou perto da metade), o cliente renova.'),
        mc('q6', 'O que faz uma reserva DHCP?', 'c', 'Associa um MAC a um IP, para o aparelho sempre receber o mesmo endereço', [
          'Bloqueia o aparelho na rede',
          'Duplica o IP do aparelho para redundância',
          'Cria um servidor DNS no aparelho'
        ], 'A reserva liga MAC → IP no servidor, mantendo o aparelho em DHCP com endereço estável.'),
        mc('q7', 'Um computador exibe o IP 169.254.88.12. Qual é a causa mais provável?', 'a', 'Ele não obteve resposta de nenhum servidor DHCP e usou APIPA', [
          'Ele recebeu um IP público do provedor',
          'Ele está usando o endereço de loopback',
          'O DNS está lento'
        ], '169.254.0.0/16 é o link-local do APIPA, que surge quando o DHCP falha.'),
        fill('q8', 'Complete com o número da porta UDP usada pelo SERVIDOR DHCP:', 'Servidor DHCP: UDP/___', ['67', 'udp 67', 'udp/67'], 'O servidor DHCP usa a porta UDP 67 e o cliente a 68.')
      ]
    },
    {
      id: 'rdb-19-nat-pat',
      title: 'NAT e PAT',
      goal: 'Entender como IPs privados saem para a internet com um IP público, a tabela de tradução, port forwarding e CGNAT.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: faltam endereços IPv4',
            'O IPv4 tem pouco mais de 4 bilhões de endereços (2^32), e há muito mais dispositivos que isso no mundo. Além disso, IPs privados (10.x, 172.16–31.x, 192.168.x) não são roteados na internet. A solução que manteve o IPv4 funcionando por décadas é o NAT (Network Address Translation): o roteador troca os endereços dos pacotes ao passar entre a rede privada e a internet.'
          ),
          sl(
            'NAT: trocar o IP privado pelo público',
            'Quando o notebook 192.168.1.10 acessa um site, o roteador (que tem um IP público, digamos 198.51.100.7) reescreve o IP de ORIGEM do pacote: troca 192.168.1.10 por 198.51.100.7 e envia. O servidor só vê o IP público do roteador. Na volta, o roteador faz o caminho inverso, restaurando o IP privado do dispositivo certo. O NAT estático liga um IP privado a um público fixo (1 para 1); o dinâmico usa um conjunto de IPs públicos; o mais comum em casa é o PAT.'
          ),
          sl(
            'PAT: muitos dispositivos, um IP público',
            'O PAT (Port Address Translation, também chamado NAT overload) permite que MUITOS dispositivos compartilhem UM único IP público, diferenciando-os pelas PORTAS. O roteador troca também a porta de origem e guarda a correspondência. É isso que ocorre na sua casa: todos os aparelhos saem à internet com o mesmo IP público, mas cada conexão tem uma porta pública diferente.',
            'Interno (privado)           Externo (público)\n192.168.1.10:51000   ->    198.51.100.7:40001\n192.168.1.11:51000   ->    198.51.100.7:40002\n192.168.1.12:49200   ->    198.51.100.7:40003'
          ),
          sl(
            'A tabela de tradução',
            'O roteador guarda cada conexão ativa na TABELA DE TRADUÇÃO (tabela NAT): IP:porta interno ↔ IP:porta público. Quando uma resposta chega a 198.51.100.7:40001, o roteador consulta a tabela, descobre que é para 192.168.1.10:51000 e entrega. Entradas expiram quando a conexão fica inativa. Consequência importante: uma conexão iniciada de FORA, sem entrada na tabela, não sabe para quem ir e é descartada — um efeito colateral que protege os aparelhos internos, mas que NÃO substitui um firewall de verdade.'
          ),
          sl(
            'Port forwarding: abrindo uma porta de fora para dentro',
            'Se você quer que alguém de fora acesse um serviço dentro da sua rede (um servidor web, uma câmera), cria um PORT FORWARDING (redirecionamento de porta): uma regra estática que diz "o que chegar ao IP público na porta 8080 vai para 192.168.1.50:80". Cuidado: cada porta aberta é uma porta exposta à internet inteira. Abra só o necessário, mantenha o serviço atualizado e com autenticação forte, e prefira VPN quando possível.',
            'Regra: IP público:8080 -> 192.168.1.50:80'
          ),
          sl(
            'CGNAT e limitações',
            'Com a escassez de IPv4, muitos provedores fazem CGNAT (Carrier-Grade NAT): um NAT em larga escala NO PROVEDOR, de modo que vários clientes compartilham um IP público (seu roteador recebe um IP da faixa 100.64.0.0/10, reservada a isso). Consequência: você fica com NAT duplo e não consegue fazer port forwarding a partir da internet, a menos que o provedor ofereça IP público dedicado. Limitações gerais do NAT: quebra a comunicação fim a fim (dificulta P2P e servidores caseiros), complica alguns protocolos e dificulta a rastreabilidade por IP. O IPv6, com endereços em abundância, dispensa o NAT.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é o principal objetivo do NAT?', 'c', 'Permitir que dispositivos com IP privado acessem a internet traduzindo seus endereços para um IP público', [
          'Atribuir endereços IP automaticamente',
          'Traduzir nomes de site em IP',
          'Descobrir o MAC dos vizinhos'
        ], 'O NAT reescreve os endereços dos pacotes ao cruzar a fronteira entre rede privada e internet.'),
        mc('q2', 'No PAT, o que diferencia as conexões de vários dispositivos que usam o mesmo IP público?', 'a', 'A porta (de origem) traduzida para cada conexão', [
          'O endereço MAC de cada site',
          'O tamanho do pacote',
          'A cor do cabo'
        ], 'O roteador atribui uma porta pública distinta a cada conexão e guarda a correspondência na tabela.'),
        mc('q3', 'Qual é a função da tabela de tradução (tabela NAT)?', 'b', 'Lembrar qual IP:porta interno corresponde a qual IP:porta público, para devolver as respostas ao dispositivo certo', [
          'Guardar as senhas dos usuários',
          'Listar os sites bloqueados',
          'Definir a velocidade de cada cabo'
        ], 'Sem a tabela, o roteador não saberia a quem entregar a resposta que chega ao IP público.'),
        fill('q4', 'Complete com a palavra que forma o nome da regra que encaminha conexões vindas de fora, em uma porta do IP público, para um servidor interno:', '___ forwarding', ['port', 'porta'], 'Port forwarding mapeia IP público:porta para IP privado:porta interno.'),
        mc('q5', 'Por que o IPv4 ainda funciona apesar de ter poucos endereços?', 'd', 'Porque o NAT/PAT permite que muitos dispositivos compartilhem poucos IPs públicos', [
          'Porque ele foi substituído pelo IPv6 por completo',
          'Porque cada site usa um MAC em vez de IP',
          'Porque os endereços privados são roteados na internet'
        ], 'O PAT multiplica o uso de um IP público entre muitos aparelhos; o IPv6 está em adoção gradual.'),
        mc('q6', 'Qual é uma consequência típica do CGNAT para o cliente?', 'a', 'Dificuldade ou impossibilidade de receber conexões de fora (port forwarding) sem IP público dedicado', [
          'Aumento automático da velocidade',
          'Remoção de todos os cabeçalhos IP',
          'Acesso exclusivo a sites HTTP'
        ], 'No CGNAT, o IP público é compartilhado no provedor, então o cliente não controla o redirecionamento de portas.'),
        mc('q7', 'Sobre NAT e segurança, qual afirmação é a mais correta?', 'd', 'O NAT bloqueia conexões não solicitadas como efeito colateral, mas não substitui um firewall', [
          'O NAT é um firewall completo e dispensa qualquer outra proteção',
          'O NAT criptografa todo o tráfego',
          'O NAT torna o port forwarding mais seguro que qualquer VPN'
        ], 'A falta de entrada na tabela barra conexões de fora, mas isso não é filtragem por regras de segurança.'),
        fill('q8', 'Complete com a sigla do NAT que usa PORTAS para permitir que muitos dispositivos compartilhem um IP público:', 'NAT com portas = ___', ['PAT', 'NAT overload', 'overload'], 'PAT (Port Address Translation) ou NAT overload.')
      ]
    },
    {
      id: 'rdb-20-http-https',
      title: 'HTTP, HTTPS e a web',
      goal: 'Ler URLs, entender requisições e respostas HTTP, métodos, códigos de status, cookies e o que o HTTPS garante.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Anatomia de uma URL',
            'URL é o endereço de um recurso na web. Partes: esquema (https), host (www.exemplo.com.br), porta (opcional; 443 para https e 80 para http), caminho (/produtos/lista), query (?pagina=2, parâmetros) e fragmento (#topo, trecho da página, que fica no navegador). Quando você digita só o nome, o navegador completa o esquema e a porta padrão.',
            'https://www.exemplo.com.br:443/produtos/lista?pagina=2#topo\n  |          |              |       |            |        |\nesquema    host           porta   caminho      query   fragmento'
          ),
          sl(
            'HTTP: requisição e resposta',
            'HTTP é o protocolo de aplicação da web, no modelo cliente-servidor: o cliente (navegador) envia uma REQUISIÇÃO e o servidor devolve uma RESPOSTA. A requisição tem a linha inicial (método, caminho, versão), cabeçalhos e, às vezes, um corpo. A resposta tem a linha de status (código e texto), cabeçalhos e o corpo (a página, uma imagem, dados JSON). Roda sobre TCP, tradicionalmente na porta 80.',
            'GET /produtos/lista HTTP/1.1\nHost: www.exemplo.com.br\nAccept: text/html\n\nHTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 5120\n\n<html>...</html>'
          ),
          sl(
            'Métodos: GET, POST, PUT, DELETE',
            'O método diz o que o cliente quer fazer. GET: ler/obter um recurso, sem alterá-lo. POST: enviar dados para o servidor, geralmente criando algo (cadastro, envio de formulário). PUT: substituir/atualizar um recurso existente com os dados enviados. DELETE: remover um recurso. Em APIs REST, esses quatro métodos correspondem a ler, criar, atualizar e apagar.'
          ),
          sl(
            'Códigos de status',
            'O código de 3 dígitos resume o resultado, e o primeiro dígito dá a família: 1xx informativo; 2xx sucesso (200 OK, 201 Created); 3xx redirecionamento (301 movido permanentemente, 302 redirecionamento temporário, 304 não modificado); 4xx erro do CLIENTE (400 pedido inválido, 401 não autenticado, 403 proibido, 404 não encontrado); 5xx erro do SERVIDOR (500 erro interno, 502 gateway inválido, 503 serviço indisponível). Regra: 4xx = o problema está no pedido; 5xx = o problema está no servidor.',
            '200 OK            2xx sucesso\n301 Moved         3xx redirecionamento\n404 Not Found     4xx erro do cliente\n503 Unavailable   5xx erro do servidor'
          ),
          sl(
            'Cabeçalhos e cookies',
            'Cabeçalhos são pares nome: valor com informações extras: Host (qual site), User-Agent (qual navegador), Accept, Content-Type (formato do corpo), Content-Length, Location (para onde redirecionar). O HTTP não guarda memória entre pedidos (é "sem estado"). COOKIES resolvem isso: o servidor envia Set-Cookie e o navegador devolve o cookie (cabeçalho Cookie) nos próximos pedidos — é assim que você continua "logado" ou que o carrinho de compras persiste. Cookies também podem rastrear a navegação, por isso sites devem informar e pedir consentimento (LGPD) para os que não são essenciais.'
          ),
          sl(
            'HTTPS: HTTP sobre TLS e o cadeado',
            'HTTPS é o HTTP dentro de um túnel cifrado pelo TLS, na porta 443. O TLS dá: CONFIDENCIALIDADE (ninguém no caminho lê o conteúdo), INTEGRIDADE (ninguém altera sem ser notado) e AUTENTICAÇÃO do servidor, por um certificado digital assinado por uma autoridade certificadora (CA), que atesta que o site é dono do domínio. O CADEADO do navegador indica que a conexão é cifrada e o certificado é válido para aquele domínio. Cuidado: ele NÃO garante que o site seja honesto — páginas de golpe também podem ter HTTPS. Confira sempre o domínio exato.'
          )
        ]
      },
      questions: [
        mc('q1', 'Na URL https://www.exemplo.com.br/produtos?pagina=2, qual parte é o "host"?', 'b', 'www.exemplo.com.br', [
          'https',
          '/produtos',
          'pagina=2'
        ], 'https é o esquema; /produtos é o caminho; pagina=2 é a query. O host identifica o servidor.'),
        mc('q2', 'Qual método HTTP se usa para apenas ler um recurso, sem alterá-lo?', 'c', 'GET', [
          'POST',
          'DELETE',
          'PUT'
        ], 'GET lê; POST envia/cria; PUT atualiza; DELETE remove.'),
        mc('q3', 'O servidor devolveu "404 Not Found". O que isso significa?', 'a', 'Erro do cliente: o recurso pedido não foi encontrado', [
          'Sucesso: o recurso foi entregue',
          'Erro do servidor: ele caiu',
          'Redirecionamento permanente'
        ], 'Família 4xx = erro do cliente (pedido). 404 indica que o caminho não existe.'),
        fill('q4', 'Complete com o método HTTP usado para remover um recurso:', '___ /clientes/42 HTTP/1.1', ['DELETE', 'delete'], 'DELETE pede ao servidor que remova o recurso indicado.'),
        mc('q5', 'Qual a diferença entre os códigos 4xx e 5xx?', 'd', '4xx indicam erro no pedido (cliente); 5xx indicam falha do servidor', [
          '4xx indicam sucesso e 5xx redirecionamento',
          '4xx indicam erro do servidor e 5xx erro do cliente',
          'Não há diferença'
        ], 'Primeiro dígito 4 = problema no pedido; 5 = o servidor falhou ao atender um pedido válido.'),
        mc('q6', 'Qual a função dos cookies?', 'b', 'Permitir que o servidor reconheça o navegador entre pedidos (login, carrinho), já que o HTTP não guarda estado', [
          'Aumentar a largura de banda',
          'Acelerar o DNS',
          'Substituir o certificado digital'
        ], 'O servidor envia Set-Cookie e o navegador devolve Cookie; assim a sessão persiste.'),
        mc('q7', 'O cadeado do navegador está presente. O que isso garante?', 'c', 'Que a conexão é cifrada e o certificado é válido para aquele domínio, não que o site seja honesto', [
          'Que o site é seguro e confiável',
          'Que o site nunca coleta dados pessoais',
          'Que o endereço IP do site é privado'
        ], 'HTTPS protege o trânsito e valida o domínio; sites maliciosos também podem usar HTTPS.'),
        fill('q8', 'Complete com o código de status do redirecionamento permanente (movido permanentemente):', 'HTTP/1.1 ___ Moved Permanently', ['301'], '301 informa que o recurso mudou de endereço de forma definitiva (cabeçalho Location).')
      ]
    },
    {
      id: 'rdb-21-outros-protocolos',
      title: 'Outros protocolos de aplicação',
      goal: 'Conhecer e-mail (SMTP/IMAP/POP3), FTP/SFTP, SSH/Telnet, NTP, RDP, SNMP e quais são seguros ou inseguros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'E-mail: SMTP, IMAP e POP3',
            'Três protocolos dividem o trabalho. SMTP (Simple Mail Transfer Protocol) ENVIA e transfere e-mails entre servidores. Para RECEBER (ler), o cliente usa IMAP ou POP3. IMAP mantém as mensagens NO SERVIDOR e sincroniza vários dispositivos: o que você lê, apaga ou organiza num aparece em todos. POP3 baixa as mensagens para o dispositivo e, no uso tradicional, as remove do servidor — pensado para um único aparelho. Hoje o IMAP é a escolha mais comum.',
            'Enviar:   cliente -> SMTP -> servidor\nReceber:  servidor -> IMAP / POP3 -> cliente'
          ),
          sl(
            'FTP, SFTP e FTPS',
            'FTP (File Transfer Protocol, portas 20/21) transfere arquivos, mas NÃO é criptografado: usuário, senha e arquivos viajam em texto puro. SFTP (SSH File Transfer Protocol) transfere arquivos DENTRO de uma conexão SSH (porta 22), com tudo cifrado. FTPS é o FTP protegido por TLS. Regra: prefira SFTP ou FTPS; use FTP puro só em redes confiáveis, e idealmente nunca com dados sensíveis. Atenção: SFTP e FTPS são parecidos no nome, mas diferentes na tecnologia.'
          ),
          sl(
            'SSH e Telnet',
            'Os dois dão acesso remoto a um terminal. TELNET (porta 23) é antigo e inseguro: tudo, incluindo a senha, trafega em texto puro, e quem estiver no caminho pode ler. SSH (Secure Shell, porta 22) faz o mesmo com criptografia forte e autenticação por senha ou por chaves criptográficas. Hoje, administre servidores e equipamentos com SSH e desative o Telnet. O SSH também dá suporte a transferência de arquivos (SFTP/SCP).'
          ),
          sl(
            'NTP e RDP',
            'NTP (Network Time Protocol, porta UDP 123) sincroniza o relógio dos dispositivos com servidores de tempo. Relógios certos são essenciais: logs de segurança coerentes, certificados TLS (que têm prazo de validade) e senhas de uso único dependem da hora correta. RDP (Remote Desktop Protocol, porta 3389) permite controlar a área de trabalho gráfica de um computador Windows à distância. Não exponha o RDP diretamente à internet: ele é alvo constante de ataques de adivinhação de senha; use VPN, MFA e atualizações.'
          ),
          sl(
            'SNMP',
            'SNMP (Simple Network Management Protocol, porta UDP 161) serve para monitorar e gerenciar equipamentos de rede (switches, roteadores, impressoras, no-breaks): um sistema de monitoramento pergunta coisas como "qual o uso da CPU?" ou "quantos pacotes essa porta enviou?". As versões 1 e 2c usam uma "community string" que funciona como senha e trafega sem criptografia; o SNMPv3 acrescenta autenticação e criptografia e é o recomendado. Troque as comunidades padrão e restrinja quem pode consultar.'
          ),
          sl(
            'Tabela de portas e o que é seguro',
            'Resumo prático. Protocolos que enviam dados sem criptografia (inseguros em redes não confiáveis): HTTP (80), FTP (21), Telnet (23), POP3 (110), IMAP sem TLS (143), SMTP sem TLS (25) e SNMP v1/v2c (161). Alternativas seguras: HTTPS (443), SFTP/SSH (22), IMAP com TLS (993), POP3 com TLS (995), SMTP com TLS (587 para envio por clientes) e SNMPv3. Princípio de privacidade (LGPD): dados pessoais e credenciais sempre devem trafegar cifrados.',
            'Inseguro        ->  Seguro\nHTTP   80       ->  HTTPS  443\nFTP    21       ->  SFTP   22\nTelnet 23       ->  SSH    22\nPOP3   110      ->  POP3S  995\nIMAP   143      ->  IMAPS  993\nSNMP v1/v2c     ->  SNMPv3'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é o papel do SMTP no e-mail?', 'd', 'Enviar mensagens e transferi-las entre servidores', [
          'Ler mensagens, mantendo-as no servidor',
          'Resolver nomes de domínio',
          'Criptografar páginas web'
        ], 'SMTP envia; IMAP e POP3 são usados para receber/ler as mensagens.'),
        mc('q2', 'Qual é a principal diferença entre IMAP e POP3?', 'a', 'IMAP mantém as mensagens no servidor e sincroniza vários dispositivos; POP3 baixa e normalmente remove do servidor', [
          'IMAP envia e POP3 recebe',
          'IMAP usa fibra e POP3 usa cobre',
          'POP3 é criptografado por padrão e IMAP não'
        ], 'Com IMAP o estado fica no servidor e se reflete em todos os aparelhos.'),
        mc('q3', 'Qual protocolo transfere arquivos dentro de uma conexão SSH, com criptografia?', 'c', 'SFTP', [
          'FTP',
          'TFTP sem senha',
          'Telnet'
        ], 'SFTP usa o SSH (porta 22). O FTP puro não é cifrado.'),
        fill('q4', 'Complete com o protocolo seguro que substitui o Telnet para acesso remoto ao terminal:', 'Telnet (inseguro) -> ___ (seguro)', ['SSH', 'ssh'], 'O SSH oferece criptografia e autenticação forte; o Telnet envia tudo em texto puro.'),
        mc('q5', 'Por que não se deve expor o RDP (porta 3389) diretamente à internet?', 'b', 'Porque é alvo constante de tentativas de adivinhar senhas; use VPN, MFA e atualizações', [
          'Porque o RDP só funciona em fibra',
          'Porque o RDP consome muita energia',
          'Porque o RDP usa a porta 80 e conflita com o HTTP'
        ], 'Serviços de acesso remoto abertos à internet são muito atacados; VPN e MFA reduzem o risco.'),
        mc('q6', 'Qual versão do SNMP oferece autenticação e criptografia e é a recomendada?', 'c', 'SNMPv3', [
          'SNMPv1',
          'SNMPv2c',
          'Nenhuma versão tem'
        ], 'v1 e v2c usam community string sem criptografia; o v3 acrescenta segurança.'),
        mc('q7', 'Qual dos pares "inseguro → alternativa segura" está correto?', 'd', 'Telnet → SSH', [
          'SSH → Telnet',
          'HTTPS → HTTP',
          'SFTP → FTP'
        ], 'Substitua protocolos em texto puro (Telnet, FTP, HTTP) pelos cifrados (SSH, SFTP/FTPS, HTTPS).'),
        fill('q8', 'Complete com a sigla do protocolo que sincroniza os relógios dos dispositivos:', 'Sincronização de horário: ___', ['NTP', 'ntp'], 'NTP (porta UDP 123) mantém o horário correto, essencial para logs e certificados.')
      ]
    },
    {
      id: 'rdb-31-servidores-datacenter-nuvem',
      title: 'Servidores, data centers e nuvem',
      goal: 'Entender o que é servidor, data center, virtualização e nuvem, como a rede participa deles e o que muda em segurança e privacidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um servidor',
            'Servidor é uma FUNÇÃO, não um tipo especial de aparelho: é qualquer computador (ou programa) que fica disponível para atender pedidos de clientes, como entregar um site, guardar arquivos ou enviar e-mails. Um notebook pode ser servidor, e um equipamento projetado para isso também. O que costuma diferenciar os equipamentos dedicados é que são feitos para ficar ligados o tempo todo, com componentes redundantes (fontes de energia, discos) e fácil de administrar remotamente. O mesmo computador pode ser cliente de um serviço e servidor de outro.'
          ),
          sl(
            'Data center',
            'Um DATA CENTER é um prédio ou sala preparado para abrigar muitos servidores e equipamentos de rede. Os servidores ficam em RACKS, armários padronizados onde os equipamentos são empilhados. Estrutura típica: ENERGIA estável, com redundância (baterias e geradores para quedas); REFRIGERAÇÃO, pois os equipamentos esquentam; CONEXÕES de rede de alta capacidade, de mais de um provedor; e SEGURANÇA física, como controle de acesso. A palavra-chave é REDUNDÂNCIA: se um componente falha, outro assume, para o serviço não parar.'
          ),
          sl(
            'Virtualização',
            'VIRTUALIZAÇÃO permite rodar várias MÁQUINAS VIRTUAIS (VMs) num único equipamento físico. Cada VM se comporta como um computador completo, com seu sistema operacional, mas todas dividem processador, memória e disco do hardware real, sob o controle de um programa chamado hipervisor. Vantagens: melhor aproveitamento do hardware, criação rápida de novos servidores e isolamento entre sistemas. Por isso, "um servidor" muitas vezes é, na verdade, uma VM.'
          ),
          sl(
            'Computação em nuvem: IaaS, PaaS e SaaS',
            'Computação em NUVEM é usar recursos de computação (servidores, armazenamento, redes, programas) oferecidos por um provedor pela internet, pagando pelo uso e criando ou removendo recursos rapidamente. Os modelos de serviço indicam o que o provedor entrega. IaaS (infraestrutura como serviço): servidores virtuais, rede e armazenamento; você administra o sistema operacional e os programas. PaaS (plataforma como serviço): ambiente pronto para publicar seu programa, sem cuidar dos servidores. SaaS (software como serviço): o programa pronto para uso no navegador, como um webmail ou um editor de documentos online.'
          ),
          sl(
            'Nuvem pública, privada e híbrida, região e zona',
            'NUVEM PÚBLICA: o provedor atende vários clientes com a mesma infraestrutura compartilhada. NUVEM PRIVADA: infraestrutura dedicada a uma única organização, no data center dela ou de um terceiro. NUVEM HÍBRIDA: combina as duas, por exemplo mantendo dados sensíveis na privada e picos de carga na pública. Os provedores dividem a infraestrutura em REGIÕES (áreas geográficas, como um país ou parte dele) e, dentro de cada região, em ZONAS de disponibilidade (data centers separados, com energia e rede independentes). Espalhar o serviço por mais de uma zona aumenta a DISPONIBILIDADE: se uma zona sai do ar, outra continua atendendo.'
          ),
          sl(
            'Como a rede participa: IP público, balanceador, firewall, CDN e latência',
            'Para um serviço ser acessível na internet, ele precisa de um endereço IP PÚBLICO (ou um nome de domínio apontando para ele). Na frente de vários servidores iguais costuma ficar um BALANCEADOR DE CARGA, que distribui os pedidos entre eles e deixa de enviar para os que falharam. FIREWALLS (ou grupos de segurança) controlam quais portas e origens podem acessar cada servidor. A LATÊNCIA, o tempo de ida e volta, depende da DISTÂNCIA: quanto mais longe o servidor, maior o atraso. Uma CDN (rede de distribuição de conteúdo) reduz isso colocando cópias de imagens, vídeos e arquivos em servidores espalhados, próximos dos usuários; o usuário recebe do ponto mais próximo, e o servidor de origem recebe menos tráfego.'
          ),
          sl(
            'Segurança e privacidade na nuvem',
            'Na nuvem vale o modelo de RESPONSABILIDADE COMPARTILHADA: o provedor cuida da segurança DA nuvem (prédio, hardware, rede básica, virtualização); o cliente cuida da segurança NA nuvem (senhas, permissões de acesso, configuração correta, atualização do que roda nas VMs e proteção dos dados). Muitos vazamentos acontecem por configuração errada do cliente, como um armazenamento aberto ao público sem querer. Privacidade e LGPD, em visão conceitual: dados pessoais armazenados na nuvem continuam sob responsabilidade de quem os coleta; importa saber em que REGIÃO e país ficam armazenados, quem pode acessá-los e o que o CONTRATO com o provedor diz sobre isso. Para questões jurídicas concretas, consulte um profissional especializado.'
          )
        ]
      },
      questions: [
        mc('q1', 'O que é, de fato, um servidor?', 'b', 'Qualquer computador ou programa que fica disponível para atender pedidos de clientes', [
          'Um tipo de aparelho que obrigatoriamente só existe em data centers',
          'Um cabo especial que liga redes diferentes',
          'O programa que o usuário abre no navegador'
        ], 'Servidor é uma função: quem oferece o serviço. O mesmo computador pode ser cliente de um serviço e servidor de outro.'),
        mc('q2', 'Qual a principal vantagem da virtualização?', 'a', 'Rodar várias máquinas virtuais isoladas no mesmo equipamento físico, aproveitando melhor o hardware', [
          'Eliminar a necessidade de qualquer sistema operacional',
          'Fazer o equipamento nunca consumir energia',
          'Substituir completamente a rede'
        ], 'Cada VM é um computador completo, dividindo os recursos do hardware real sob o hipervisor.'),
        mc('q3', 'Um webmail usado diretamente no navegador, sem que o usuário administre servidores, é um exemplo de qual modelo?', 'c', 'SaaS', [
          'IaaS',
          'PaaS',
          'Rack'
        ], 'SaaS entrega o programa pronto. Em IaaS você administra o sistema operacional; em PaaS, apenas a aplicação.'),
        fill('q4', 'Complete com o tipo de nuvem que combina infraestrutura privada e pública:', 'Nuvem que combina privada e pública: ___', ['híbrida', 'hibrida'], 'A nuvem híbrida combina as duas, por exemplo dados sensíveis na privada e picos na pública.'),
        mc('q5', 'Qual a função de um balanceador de carga?', 'd', 'Distribuir os pedidos entre vários servidores e evitar enviar para os que falharam', [
          'Converter nomes de domínio em IPs',
          'Cifrar todo o conteúdo do disco do servidor',
          'Aumentar a distância entre usuário e servidor'
        ], 'O balanceador melhora a disponibilidade e a capacidade, espalhando o tráfego entre servidores iguais.'),
        mc('q6', 'Para que serve uma CDN?', 'b', 'Colocar cópias do conteúdo em servidores próximos dos usuários, reduzindo latência e carga na origem', [
          'Dar um IP privado a cada usuário',
          'Substituir o firewall da rede',
          'Transformar o servidor em cliente'
        ], 'O conteúdo é entregue do ponto mais próximo ao usuário, reduzindo o atraso causado pela distância.'),
        mc('q7', 'No modelo de responsabilidade compartilhada, o que costuma ser responsabilidade do cliente?', 'a', 'Senhas, permissões de acesso e a configuração correta do que ele usa na nuvem', [
          'A segurança física do prédio do data center',
          'A refrigeração dos servidores do provedor',
          'O hardware dos racks do provedor'
        ], 'O provedor protege a infraestrutura; o cliente protege contas, acessos, configurações e dados.'),
        fill('q8', 'Complete: ao contratar um serviço de nuvem, a ___ (por exemplo, o país) escolhida define em que local geográfico os dados ficam armazenados.', 'Localização geográfica dos dados = ___ escolhida', ['região', 'regiao'], 'A região define onde os dados ficam, algo relevante para a LGPD e para o contrato com o provedor.')
      ]
    },
    {
      id: 'rdb-22-wifi',
      title: 'Redes sem fio: Wi-Fi',
      goal: 'Entender 802.11, SSID/BSSID, bandas e canais, e proteger redes Wi-Fi (WPA2/WPA3) em casa e em redes públicas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            '802.11, access point, SSID e BSSID',
            'Wi-Fi é a marca da família de padrões IEEE 802.11 para redes locais sem fio. O ACCESS POINT (AP) é o equipamento que cria a rede e a liga ao lado cabeado. O SSID (Service Set Identifier) é o NOME da rede que você vê ao procurar Wi-Fi (por exemplo "CasaDaFamilia"), e pode ser igual em vários APs. O BSSID identifica um rádio/AP específico — na prática, é o endereço MAC dele. Vários APs com o mesmo SSID formam uma só rede ampliada, mas cada um tem um BSSID próprio.'
          ),
          sl(
            'Bandas: 2,4, 5 e 6 GHz',
            'A frequência do rádio muda o comportamento. 2,4 GHz: maior alcance e atravessa melhor paredes, mas é mais lenta e muito congestionada (vizinhos, micro-ondas, Bluetooth). 5 GHz: mais rápida e com mais canais, mas alcança menos e sofre mais com obstáculos. 6 GHz (Wi-Fi 6E em diante): ainda mais canais e menos interferência, com alcance menor, e exige aparelhos compatíveis. Os nomes comerciais por geração: Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax). Regra: alcance e velocidade se trocam entre si — quanto mais alta a frequência, menor o alcance.',
            'Banda     Alcance   Velocidade   Interferência\n2,4 GHz   maior     menor        alta\n5 GHz     médio     maior        média\n6 GHz     menor     maior        baixa'
          ),
          sl(
            'Canais e interferência',
            'Cada banda é dividida em CANAIS. Redes vizinhas no mesmo canal, ou em canais sobrepostos, dividem o tempo de uso do ar e se atrapalham (interferência co-canal): a velocidade cai. Em 2,4 GHz, só 3 canais não se sobrepõem (1, 6 e 11), então muita gente acaba "no mesmo canal". Soluções: escolher o canal menos ocupado (ou deixar o roteador em automático), migrar aparelhos para 5 GHz, aproximar-se do AP e evitar fontes de interferência. O Wi-Fi usa CSMA/CA (evitar colisão): escuta antes de falar, pois o ar é um meio compartilhado.'
          ),
          sl(
            'Roaming',
            'ROAMING é a troca de um AP para outro, com o mesmo SSID, enquanto você se desloca, sem perder a conexão (ou perdendo muito pouco). Em casas e empresas com vários APs, o aparelho decide quando trocar com base na intensidade do sinal. Para funcionar bem, os APs precisam usar o mesmo SSID e a mesma segurança, e canais bem planejados para não interferirem entre si.'
          ),
          sl(
            'Segurança: WEP, WPA, WPA2 e WPA3',
            'Como o sinal vai pelo ar, a criptografia é obrigatória. WEP: o primeiro padrão, hoje QUEBRADO em minutos — nunca use. WPA: provisório, também obsoleto. WPA2: usa o cifrador AES e é seguro com senha forte; ainda muito comum. WPA3: o mais recente e forte, com troca de chave mais robusta (SAE) que dificulta adivinhar a senha por tentativas offline. Prefira WPA3 (ou WPA2/WPA3 misto); se o equipamento só tiver WPA2, use senha longa. Redes abertas (sem senha) não têm criptografia nenhuma.'
          ),
          sl(
            'Boas práticas de segurança doméstica',
            'Use WPA2/WPA3 com uma senha longa e única (frase com várias palavras); desative o WPS (o botão/PIN de pareamento fácil tem falhas conhecidas); troque a senha de administração do roteador (a de fábrica é pública); mantenha o firmware atualizado; use a rede de convidados para visitas e aparelhos IoT; revise de vez em quando a lista de dispositivos conectados. Esconder o SSID e filtrar por MAC NÃO são segurança de verdade: o nome aparece em ferramentas simples e o MAC pode ser copiado.'
          ),
          sl(
            'Wi-Fi público e "gêmeo maligno"',
            'Em redes públicas (aeroporto, café), qualquer pessoa pode estar na mesma rede, e redes abertas não cifram o tráfego entre você e o AP. Um golpe conhecido é o "evil twin": uma rede falsa com nome parecido com o da legítima, criada para capturar dados de quem se conecta. Defesas: confirme o nome certo com o estabelecimento, prefira dados móveis para operações sensíveis (banco), use apenas sites HTTPS, ative uma VPN confiável, desative a conexão automática a redes abertas e mantenha o dispositivo atualizado. Nunca digite senhas em páginas que pedem dados estranhos para liberar a rede.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a diferença entre SSID e BSSID?', 'b', 'SSID é o nome da rede (pode se repetir em vários APs); BSSID identifica um AP/rádio específico, normalmente o MAC dele', [
          'SSID é o MAC do roteador e BSSID é a senha',
          'SSID é a senha e BSSID é o nome da rede',
          'São termos idênticos para a mesma coisa'
        ], 'O SSID é o nome visível; o BSSID é o identificador do ponto de acesso específico.'),
        mc('q2', 'Qual descrição da banda de 2,4 GHz está correta em relação à de 5 GHz?', 'd', '2,4 GHz tem maior alcance e atravessa melhor obstáculos, mas é mais lenta e mais congestionada', [
          '2,4 GHz é mais rápida e tem menos interferência',
          '2,4 GHz tem alcance menor, porém é imune a interferências',
          'As duas têm exatamente o mesmo alcance e velocidade'
        ], 'Frequência menor alcança mais longe, mas oferece menos canais e velocidade, e é mais disputada.'),
        mc('q3', 'Qual protocolo de segurança Wi-Fi está quebrado e nunca deve ser usado?', 'a', 'WEP', [
          'WPA3',
          'WPA2 com AES',
          'WPA2 com senha longa'
        ], 'WEP pode ser quebrado em minutos; use WPA2/WPA3.'),
        fill('q4', 'Complete com o padrão de segurança Wi-Fi mais recente e forte:', 'Segurança recomendada: WPA___', ['3', 'WPA3'], 'WPA3 traz troca de chave mais robusta (SAE) que o WPA2.'),
        mc('q5', 'Sua rede Wi-Fi de 2,4 GHz está lenta num prédio, e os vizinhos usam o mesmo canal. Qual medida ajuda?', 'c', 'Mudar para um canal menos ocupado ou migrar os aparelhos para 5 GHz', [
          'Esconder o SSID',
          'Ligar o filtro de MAC',
          'Trocar o nome da rede'
        ], 'Interferência co-canal divide o tempo de ar; outro canal ou outra banda reduz a disputa.'),
        mc('q6', 'Qual conjunto de medidas melhora a segurança do Wi-Fi doméstico?', 'b', 'Senha longa com WPA2/WPA3, desativar o WPS, trocar a senha de admin e atualizar o firmware', [
          'Esconder o SSID e filtrar por MAC, só isso',
          'Usar a senha de fábrica do roteador, que é única',
          'Deixar a rede aberta para facilitar'
        ], 'Esconder SSID e filtrar MAC dão falsa sensação de segurança; criptografia forte e administração protegida contam de verdade.'),
        mc('q7', 'Você está num café e vê duas redes com nomes quase iguais. Qual cuidado é adequado?', 'c', 'Confirmar o nome correto com o local e usar HTTPS/VPN, evitando operações sensíveis', [
          'Conectar-se à de sinal mais forte, sem verificar',
          'Digitar a senha do banco para liberar o acesso',
          'Compartilhar a senha do e-mail para validar a rede'
        ], 'O evil twin copia o nome de uma rede legítima; confirme com o estabelecimento e proteja o tráfego.'),
        fill('q8', 'Complete com o termo da troca automática de um AP para outro, com o mesmo SSID, enquanto você se desloca:', 'Troca de AP sem perder a conexão: ___', ['roaming'], 'Roaming permite mover-se entre APs da mesma rede mantendo a conexão.')
      ]
    },
    {
      id: 'rdb-29-pan-iot-bluetooth',
      title: 'Redes pessoais e IoT: Bluetooth, NFC e Zigbee',
      goal: 'Conhecer as tecnologias de curto alcance (Bluetooth, NFC, Zigbee e afins), os riscos de dispositivos IoT em casa e como se proteger, incluindo privacidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'PAN e Bluetooth',
            'Uma PAN (rede de área pessoal) liga os aparelhos de uma pessoa, a poucos metros: celular, fone, relógio, teclado. A tecnologia mais comum é o BLUETOOTH, de rádio, alcance curto e baixo consumo de energia. Para dois aparelhos se conectarem pela primeira vez há o PAREAMENTO: um deles fica visível, o outro o escolhe, e ambos confirmam (muitas vezes com um código) e guardam uma chave para reconhecerem um ao outro depois, sem repetir o processo. Cada tipo de uso é descrito por um PERFIL, um conjunto de regras para uma função: há perfis para áudio (fones e caixas de som) e para dispositivos de entrada, como teclado e mouse.'
          ),
          sl(
            'Bluetooth Classic e BLE',
            'Há duas famílias. O Bluetooth CLASSIC mantém uma conexão contínua e é usado, por exemplo, em áudio, que precisa de fluxo constante de dados. O BLE (Bluetooth Low Energy, baixa energia) foi feito para enviar pequenas quantidades de dados de vez em quando gastando muito pouca bateria: sensores, pulseiras, etiquetas de localização. A ideia: Classic para fluxo contínuo; BLE para economia de bateria. Os dois pertencem ao ecossistema Bluetooth, mas um aparelho pode suportar um, outro ou ambos.'
          ),
          sl(
            'Banda de 2,4 GHz e interferência com o Wi-Fi',
            'O Bluetooth opera na faixa de 2,4 GHz, a mesma usada por muitas redes Wi-Fi (e por micro-ondas e outros aparelhos). Por isso, quando muitos dispositivos disputam essa faixa, pode haver interferência: o áudio do fone corta, o Wi-Fi fica mais lento. Os dois tentam conviver (o Bluetooth muda de frequência constantemente para evitar canais ocupados), mas ambientes congestionados sofrem. Alternativa para o Wi-Fi: usar a faixa de 5 GHz, menos disputada.'
          ),
          sl(
            'NFC: comunicação por aproximação',
            'NFC (Near Field Communication) funciona a distâncias de poucos CENTÍMETROS: os aparelhos precisam quase se encostar. Isso é uma característica de segurança útil, pois reduz a chance de alguém "escutar" de longe. Usos: pagamento por aproximação (cartão ou celular na maquininha), cartões de acesso e transporte, e TAGS, pequenas etiquetas que guardam informações e disparam ações quando o celular as toca. Não substitui o Bluetooth ou o Wi-Fi: serve para trocas rápidas e curtas, e às vezes para iniciar um pareamento.'
          ),
          sl(
            'Redes em malha de baixo consumo: Zigbee, Z-Wave, Thread e Matter',
            'Para casa inteligente (lâmpadas, sensores, tomadas, fechaduras) existem protocolos pensados para gastar pouquíssima energia e enviar poucos dados. ZIGBEE e Z-WAVE formam redes em MALHA: os próprios dispositivos retransmitem mensagens uns dos outros, o que estende o alcance e cria caminhos alternativos. THREAD também é uma malha de baixo consumo, baseada em IP. MATTER é um padrão que busca fazer dispositivos de fabricantes e ecossistemas diferentes funcionarem juntos (interoperabilidade), usando redes como Wi-Fi e Thread. Normalmente um HUB (central) liga a malha ao seu roteador e à internet.'
          ),
          sl(
            'IoT em casa e seus riscos',
            'IoT (Internet das Coisas) são objetos comuns ligados à rede: câmeras, lâmpadas, TVs, assistentes de voz, campainhas. Muitos têm pouca capacidade e pouca atenção à segurança, e os riscos mais comuns são: SENHA PADRÃO de fábrica (conhecida por qualquer um que pesquise o modelo); FIRMWARE desatualizado, com falhas já corrigidas pelo fabricante em versões novas; abertura desnecessária à internet, por exemplo pelo UPnP (recurso que permite a aparelhos abrirem portas no roteador sozinhos) e pelo acesso remoto ligado sem necessidade. Um aparelho invadido pode espionar, ser usado como porta de entrada para os demais da rede ou ser recrutado para ataques.'
          ),
          sl(
            'Como se proteger e a privacidade (LGPD)',
            'Defesas: trocar a senha padrão por uma única e forte; atualizar o firmware (ativar atualização automática se houver); colocar os dispositivos IoT numa rede SEPARADA, como a rede de convidados do roteador, para que um aparelho comprometido não alcance seus computadores e celulares; desativar o UPnP e o acesso remoto que você não usa; no pareamento Bluetooth, parear só em local controlado, confirmar o código mostrado e remover dispositivos desconhecidos da lista. PRIVACIDADE: câmeras (imagem) e assistentes (voz) coletam DADOS PESSOAIS, e hábitos de uso (horários, rotinas) também revelam informações sobre você. A LGPD, lei brasileira de proteção de dados, trata de coleta com finalidade, transparência e minimização; na prática, leia o que o fabricante coleta, desligue microfone e câmera quando não precisar e desative recursos de nuvem desnecessários. Se uma câmera pega pessoas fora da sua casa, como vizinhos ou funcionários, a atenção a esses dados precisa ser maior.'
          )
        ]
      },
      questions: [
        mc('q1', 'O que é o pareamento no Bluetooth?', 'd', 'O processo em que dois aparelhos se reconhecem e guardam uma chave para se conectarem depois', [
          'A troca de endereços IP públicos entre os aparelhos',
          'A escolha do canal Wi-Fi menos congestionado',
          'O aumento do alcance do sinal para dezenas de quilômetros'
        ], 'O pareamento cria uma relação de confiança entre os aparelhos, que passam a se reconhecer sem repetir o processo.'),
        mc('q2', 'Qual tipo de Bluetooth foi projetado para enviar pequenos dados de vez em quando, com consumo mínimo de bateria?', 'c', 'BLE (Bluetooth Low Energy)', [
          'Bluetooth Classic',
          'NFC',
          'Powerline'
        ], 'O BLE serve para sensores e pulseiras; o Classic mantém conexão contínua, usada em áudio.'),
        mc('q3', 'Por que o Bluetooth pode sofrer interferência de redes Wi-Fi?', 'b', 'Porque ele opera na faixa de 2,4 GHz, também usada por muitas redes Wi-Fi', [
          'Porque o Bluetooth usa cabos de par trançado',
          'Porque o Bluetooth só funciona na faixa de 5 GHz',
          'Porque o Wi-Fi apaga o pareamento dos aparelhos'
        ], 'Os dois compartilham a faixa de 2,4 GHz, e ambientes congestionados geram cortes e lentidão.'),
        fill('q4', 'Complete com a sigla da tecnologia usada no pagamento por aproximação, que funciona a poucos centímetros:', 'Pagamento por aproximação usa ___', ['NFC', 'nfc'], 'NFC (Near Field Communication) opera a poucos centímetros, o que também ajuda na segurança.'),
        mc('q5', 'Qual a característica principal de redes como Zigbee e Z-Wave?', 'a', 'São redes em malha de baixo consumo, em que os dispositivos retransmitem mensagens uns dos outros', [
          'Exigem cabos de fibra óptica até cada lâmpada',
          'Servem para transmitir vídeo em alta definição',
          'Funcionam só quando cada dispositivo tem IP público'
        ], 'A malha estende o alcance e cria caminhos alternativos, gastando pouca energia, ideal para sensores e casa inteligente.'),
        mc('q6', 'Você comprou uma câmera IP. Qual cuidado é essencial logo na instalação?', 'd', 'Trocar a senha padrão de fábrica e manter o firmware atualizado', [
          'Manter a senha de fábrica para facilitar o suporte',
          'Desativar as atualizações para não mudar a configuração',
          'Compartilhar o login com os vizinhos para que a rede seja forte'
        ], 'Senhas padrão são públicas e firmware antigo tem falhas conhecidas: são os dois riscos mais comuns de IoT.'),
        mc('q7', 'Por que colocar dispositivos IoT em uma rede separada (como a de convidados)?', 'c', 'Para que um aparelho IoT comprometido não alcance diretamente seus computadores e celulares', [
          'Para que eles tenham IP público',
          'Para aumentar a velocidade da internet de todos',
          'Para que não precisem mais de atualizações'
        ], 'Segmentar limita o estrago: o aparelho invadido fica isolado da rede principal.'),
        fill('q8', 'Complete: imagem e voz captadas por câmeras e assistentes são exemplos de dados ___ , tema protegido pela LGPD.', 'Imagem e voz são dados ___', ['pessoais', 'pessoal'], 'Imagem e voz identificam pessoas: são dados pessoais, e a LGPD trata de sua coleta com finalidade e transparência.')
      ]
    },
    {
      id: 'rdb-23-rede-domestica',
      title: 'Rede doméstica e de pequena empresa na prática',
      goal: 'Entender o que o roteador Wi-Fi faz, a topologia típica ISP → ONT → roteador, rede de convidados, IP fixo, DNS alternativo e configuração segura.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A topologia típica',
            'O caminho de uma casa: PROVEDOR (ISP) → equipamento do provedor (ONT na fibra, modem no cabo/DSL) → ROTEADOR Wi-Fi → seus dispositivos (por cabo ou Wi-Fi). Em muitos casos, o provedor entrega um único aparelho que reúne ONT/modem e roteador; em outros, você liga seu próprio roteador atrás do equipamento do provedor. O lado voltado ao provedor é a interface WAN (recebe um IP público ou do CGNAT); o lado da casa é a LAN (rede privada, tipicamente 192.168.x.x).',
            'Internet -> [ISP] -> [ONT/modem] -> [Roteador Wi-Fi]\n                                       |-- cabo -> PC\n                                       |-- Wi-Fi -> celular, TV'
          ),
          sl(
            'O que o "roteador Wi-Fi" realmente é',
            'O aparelho de casa é uma caixa que junta vários papéis: SWITCH (as portas LAN), ACCESS POINT (o Wi-Fi), ROTEADOR (liga a LAN à internet, é o gateway padrão), NAT/PAT (compartilha um IP público), servidor DHCP (distribui IPs), FIREWALL (filtra conexões de entrada) e, muitas vezes, um repassador de DNS. Saber isso ajuda a diagnosticar: um problema no Wi-Fi, no DHCP ou no NAT pode ser do mesmo aparelho, mas cada um vive numa camada diferente.',
            'Roteador Wi-Fi = switch + AP + roteador\n                 + NAT + DHCP + firewall (+ DNS)'
          ),
          sl(
            'IP fixo vs DHCP',
            'Na maioria dos aparelhos, DHCP é o ideal: automático e sem conflitos. IP FIXO (configurado manualmente no aparelho, fora do pool do DHCP) ou RESERVA por MAC fazem sentido para impressora, NAS (armazenamento em rede), câmera ou servidor, que precisam ser achados sempre no mesmo endereço, e para regras de port forwarding. Cuidado: IP fixo errado (de outra sub-rede ou repetido) derruba a conexão do aparelho. A reserva no roteador costuma ser mais simples e segura do que configurar o IP no próprio aparelho.'
          ),
          sl(
            'Rede de convidados e segmentação',
            'A REDE DE CONVIDADOS é uma segunda rede Wi-Fi, com senha própria, que dá acesso à internet mas ISOLA os visitantes da sua rede principal (computadores, impressoras, NAS). Use-a para visitas e também para aparelhos IoT (TV, lâmpadas, câmeras), que costumam receber menos atualizações de segurança. Em pequenas empresas, a ideia cresce: redes separadas para funcionários, convidados e equipamentos sensíveis (caixa, servidor), conectadas com regras de firewall, com switches gerenciáveis que usam VLANs. Segmentar limita o estrago se um dispositivo for comprometido.'
          ),
          sl(
            'DNS alternativo',
            'Por padrão o roteador usa o DNS do provedor, entregue via DHCP. Você pode trocar o DNS (no roteador, valendo para todos, ou no dispositivo) por outro resolver, por razões de velocidade, filtragem de sites maliciosos ou privacidade. Mas lembre: quem opera o resolver enxerga os nomes dos sites que você consulta, então escolha um provedor em que confie. Se a internet "não abre" mas o ping para IP funciona, o DNS é o primeiro suspeito, e testar outro resolver ajuda a confirmar.'
          ),
          sl(
            'Configuração segura do roteador',
            'Checklist: trocar a senha de administração padrão; manter o firmware atualizado; Wi-Fi com WPA2/WPA3 e senha longa; desativar o WPS; desativar a administração remota (acesso à tela do roteador pela internet) se não precisar; desativar UPnP se não for necessário (ele abre portas automaticamente); abrir só os port forwards indispensáveis; usar a rede de convidados; anotar a configuração e saber como restaurar. Dispositivos conectados (câmeras, babás eletrônicas, assistentes) lidam com dados pessoais: proteja as contas deles com senhas fortes e MFA, em respeito à privacidade de quem mora ali (LGPD).'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a ordem típica do caminho até o seu celular em casa com fibra?', 'a', 'Provedor → ONT → roteador Wi-Fi → dispositivos', [
          'Provedor → dispositivos → roteador → ONT',
          'ONT → provedor → switch → internet',
          'Roteador → provedor → ONT → dispositivos'
        ], 'O sinal do provedor passa pela ONT (ou modem), vai ao roteador Wi-Fi, que serve a LAN.'),
        mc('q2', 'Quais funções o "roteador Wi-Fi" doméstico costuma reunir?', 'd', 'Switch, access point, roteador, NAT, DHCP e firewall', [
          'Apenas amplificar o sinal',
          'Somente DNS autoritativo e servidor de e-mail',
          'Somente conversão de luz em Ethernet'
        ], 'É uma caixa multifunção: várias camadas e serviços num só aparelho.'),
        mc('q3', 'Para que serve a rede de convidados?', 'b', 'Dar internet aos visitantes (e aparelhos IoT) isolando-os da rede principal', [
          'Dobrar a velocidade da rede principal',
          'Substituir o servidor DHCP',
          'Permitir que os visitantes acessem seu computador'
        ], 'Isolamento limita o que um visitante ou um aparelho vulnerável pode alcançar.'),
        fill('q4', 'Complete com a sigla da interface do roteador voltada à internet/provedor:', 'Interface voltada ao provedor: ___', ['WAN', 'wan'], 'WAN é o lado da internet; a LAN é o lado da rede local.'),
        mc('q5', 'Qual aparelho justifica ter IP fixo ou reserva DHCP?', 'c', 'Uma impressora ou NAS que precisa ser achado sempre no mesmo endereço', [
          'Um celular que se move de rede em rede',
          'Uma visita que conecta uma vez',
          'Qualquer aparelho, sempre, sem exceção'
        ], 'Dispositivos que são "servidores" da rede precisam de endereço estável; os demais ficam bem com DHCP.'),
        mc('q6', 'Ao trocar o DNS por um alternativo, qual cuidado de privacidade se aplica?', 'a', 'Quem opera o resolver passa a ver os nomes dos sites consultados; escolha um provedor confiável', [
          'Nenhum; o DNS não revela nada',
          'O DNS passa a criptografar todo o tráfego automaticamente',
          'O IP público do roteador muda'
        ], 'O resolver conhece as consultas que recebe, por isso confiança é importante.'),
        mc('q7', 'Qual medida de configuração segura do roteador está correta?', 'd', 'Trocar a senha de admin padrão, atualizar o firmware e desativar a administração remota se não for necessária', [
          'Manter a senha de fábrica para lembrar fácil',
          'Abrir todas as portas para facilitar jogos',
          'Desativar o firewall do roteador'
        ], 'Credenciais padrão são públicas; atualizações corrigem falhas; menos exposição, menos risco.'),
        fill('q8', 'Complete com a sigla da função do roteador que permite vários dispositivos compartilharem um único IP público:', 'Compartilhar um IP público: ___', ['NAT', 'PAT', 'NAT/PAT'], 'O NAT (na prática, PAT) traduz IPs privados para o IP público do roteador.')
      ]
    },
    {
      id: 'rdb-30-ampliando-rede-domestica',
      title: 'Ampliando a rede doméstica: repetidor, mesh, powerline e modo AP',
      goal: 'Escolher entre repetidor, mesh, access point e powerline, evitar NAT duplo e conflitos de DHCP e ajustar canal e segurança do equipamento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o sinal Wi-Fi fica ruim',
            'O sinal de rádio enfraquece com a DISTÂNCIA e com OBSTÁCULOS: paredes (especialmente de concreto e com estrutura metálica), pisos, espelhos e grandes volumes de água atenuam muito o sinal. Também há INTERFERÊNCIA de redes vizinhas, micro-ondas e outros aparelhos. Antes de comprar qualquer equipamento, comece pelo básico: posicione o roteador em local central, elevado e aberto, longe de paredes grossas, de metais e de eletrodomésticos, e não escondido dentro de um armário. Muitas vezes só isso resolve.'
          ),
          sl(
            'Repetidor',
            'O repetidor de Wi-Fi recebe o sinal do roteador e o retransmite, estendendo o alcance. É barato e fácil de instalar, mas tem um preço: quando ele usa o MESMO rádio para receber do roteador e para atender seus dispositivos, precisa dividir o tempo de uso do ar entre as duas tarefas, e a velocidade útil cai, em geral para cerca da metade. Também deve ficar num ponto onde AINDA receba um bom sinal do roteador: colocá-lo onde o sinal já está fraco só repete um sinal ruim.'
          ),
          sl(
            'Sistema mesh',
            'Um sistema MESH é um conjunto de nós (equipamentos) que trabalham juntos como UMA rede só, com a mesma identificação (SSID) e senha, e coordenam em qual nó cada dispositivo deve ficar ao se movimentar pela casa. A comunicação entre os nós se chama BACKHAUL. Se o backhaul usa um rádio dedicado ou, melhor ainda, um CABO entre os nós, o desempenho é bem superior ao de um repetidor comum, que divide o mesmo rádio. Mesh é uma boa solução quando não dá para passar cabo ou quando se quer troca de nó automática ao andar pela casa.'
          ),
          sl(
            'Access point com cabo e powerline',
            'A MELHOR opção costuma ser o ACCESS POINT (AP) ligado ao roteador por CABO de rede: o AP recebe os dados pelo cabo, sem gastar rádio com isso, e usa todo o ar para atender os dispositivos. Quando não é possível passar cabo de rede, existe o POWERLINE: adaptadores que levam os dados pela FIAÇÃO ELÉTRICA da casa; um é ligado ao roteador e outro, em outra tomada, entrega um cabo ou Wi-Fi. Limitações: depende da qualidade e da idade da fiação, pode não funcionar entre circuitos diferentes do quadro elétrico, sofre ruído de aparelhos ligados (e não deve ser ligado em réguas com filtro). Teste antes de decidir.'
          ),
          sl(
            'Modo AP e NAT duplo',
            'Se você liga um segundo roteador atrás do primeiro na configuração padrão, o segundo também faz NAT, e os pacotes passam por dois NATs: é o NAT DUPLO. Sintomas: port forwarding (redirecionamento de portas) não funciona, jogos online reclamam de "NAT restrito" ou "estrito", e certos serviços de acesso remoto falham. Um sinal é a porta WAN do segundo roteador receber um IP privado. A solução para só ampliar a rede é configurar o segundo equipamento em MODO AP (ou modo bridge): ele deixa de rotear, desativa o NAT e o DHCP e passa a apenas estender a mesma rede. Ele deve ser ligado por uma porta LAN, não pela WAN, ao roteador principal.'
          ),
          sl(
            'Vários equipamentos sem conflito',
            'Regras para vários equipamentos: apenas UM servidor DHCP na rede (normalmente o roteador principal); dois servidores distribuindo endereços geram conflitos de IP e falhas de conexão. Equipamentos de infraestrutura (APs, switches gerenciáveis, impressoras) devem ter IP FIXO, fora da faixa distribuída pelo DHCP, para sempre serem encontrados no mesmo endereço. Todos na mesma sub-rede; evite criar sub-redes iguais em lugares diferentes ligadas por roteador.',
            'Roteador principal: 192.168.1.1\nFaixa DHCP:        192.168.1.100 - 192.168.1.199\nAP (IP fixo):      192.168.1.2'
          ),
          sl(
            'Canal, banda e cuidados com o equipamento',
            'Na faixa de 2,4 GHz os canais se sobrepõem; os canais 1, 6 e 11 são os que não se sobrepõem entre si, e por isso são os mais indicados para escolher manualmente se a vizinhança estiver congestionada. A faixa de 5 GHz tem mais canais e menos congestionamento, mas alcance menor e passa pior por paredes. Use 5 GHz perto do roteador e 2,4 GHz para alcance. Cuidados de segurança: troque a senha de ADMINISTRAÇÃO do painel do equipamento (não é a senha do Wi-Fi) e mantenha o FIRMWARE atualizado. Isso vale para roteadores, repetidores, APs e nós mesh.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a primeira providência para melhorar o sinal Wi-Fi antes de comprar novos equipamentos?', 'a', 'Posicionar o roteador em local central, elevado e livre de obstáculos', [
          'Esconder o roteador dentro de um armário metálico',
          'Colocá-lo junto do micro-ondas',
          'Colocá-lo no canto mais distante da casa'
        ], 'Posição central e aberta evita atenuação por paredes e metal; muitas vezes só isso já resolve.'),
        mc('q2', 'O que costuma acontecer com a velocidade útil quando um repetidor usa o mesmo rádio para receber do roteador e atender os dispositivos?', 'b', 'Cai, em geral para cerca da metade', [
          'Dobra, pois o sinal é amplificado duas vezes',
          'Não muda, pois o rádio é igual',
          'Fica igual à do cabo de rede'
        ], 'O mesmo rádio divide o tempo de ar entre duas tarefas, reduzindo a vazão.'),
        mc('q3', 'Qual costuma ser a melhor opção para ampliar a cobertura quando é possível passar um cabo de rede?', 'c', 'Um access point ligado ao roteador por cabo', [
          'Um repetidor no meio da casa usando o mesmo rádio',
          'Um adaptador powerline em tomada com filtro',
          'Dois roteadores com NAT e DHCP ativos em cascata'
        ], 'O AP com cabo não gasta rádio no backhaul e tem desempenho estável.'),
        fill('q4', 'Complete: o powerline leva os dados pela fiação ___ da casa.', 'Powerline: dados pela fiação ___', ['elétrica', 'eletrica', 'de energia'], 'Adaptadores powerline usam a fiação elétrica como meio, com limitações de qualidade da fiação e ruído.'),
        mc('q5', 'Qual destes é um sintoma típico de NAT duplo?', 'd', 'Port forwarding que não funciona e jogos reclamando de NAT restrito', [
          'A tela do roteador pede senha',
          'O Wi-Fi aparece em 5 GHz',
          'O IP do celular começa em 192.168'
        ], 'Dois NATs em cascata impedem conexões de fora de chegarem aos dispositivos, mesmo com redirecionamento configurado.'),
        mc('q6', 'Ao configurar um segundo equipamento em modo AP, qual conjunto de ações está correto?', 'a', 'Desativar o DHCP e o NAT dele e ligá-lo por uma porta LAN ao roteador principal', [
          'Manter o DHCP ativo e ligá-lo pela porta WAN',
          'Usar o mesmo IP do roteador principal',
          'Criar uma sub-rede nova com NAT e DHCP próprios'
        ], 'Em modo AP o aparelho apenas estende a mesma rede; só o roteador principal faz NAT e DHCP.'),
        mc('q7', 'Quais canais de 2,4 GHz não se sobrepõem entre si?', 'b', '1, 6 e 11', [
          '1, 2 e 3',
          '3, 4 e 5',
          '5, 6 e 7'
        ], 'Os canais 1, 6 e 11 estão espaçados o suficiente para não interferir uns nos outros.'),
        fill('q8', 'Complete com a sigla do serviço que deve existir em apenas UM equipamento da rede para evitar conflitos de endereço:', 'Apenas um servidor ___ na rede', ['DHCP', 'dhcp'], 'Dois servidores DHCP distribuindo endereços na mesma rede causam conflitos de IP.')
      ]
    },
    {
      id: 'rdb-24-seguranca-privacidade',
      title: 'Segurança básica de redes e privacidade',
      goal: 'Reconhecer ameaças comuns, aplicar defesas básicas e entender dados em trânsito, criptografia e LGPD em visão geral.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Phishing: o golpe da isca',
            'Phishing é uma mensagem (e-mail, SMS, rede social, site falso) que finge ser de uma entidade confiável — banco, empresa, colega — para fazer você clicar num link, abrir um anexo ou entregar senha e dados. Sinais de alerta: urgência ou ameaça ("sua conta será bloqueada"), remetente ou domínio estranho (um endereço quase igual ao verdadeiro), link que leva a um endereço diferente do texto, anexo inesperado, erros de linguagem, pedido de senha ou código. Defesa: não clique, digite o endereço oficial você mesmo, confirme por outro canal e use MFA, que protege mesmo se a senha vazar.'
          ),
          sl(
            'Malware e ransomware',
            'MALWARE é qualquer software malicioso: vírus, trojans (disfarçados de programa útil), spyware (espionagem), entre outros. RANSOMWARE é um tipo que criptografa seus arquivos e exige pagamento (resgate) para devolvê-los. Defesas em comum: manter sistema e programas atualizados, baixar software só de fontes oficiais, usar antivírus/proteção de endpoint, desconfiar de anexos e links. Defesa decisiva contra ransomware: BACKUPS regulares, com pelo menos uma cópia offline ou isolada (regra 3-2-1: 3 cópias, 2 mídias diferentes, 1 fora do local), testados de tempos em tempos.'
          ),
          sl(
            'Ataques contra senhas',
            'Os atacantes tentam adivinhar ou reaproveitar senhas. Força bruta: testa muitas combinações. Dicionário: testa palavras e senhas comuns. Credential stuffing: usa pares usuário/senha vazados de um site para tentar entrar em outros, porque muita gente repete a mesma senha. Defesas: senhas LONGAS (frases com várias palavras), ÚNICAS por serviço (um gerenciador de senhas ajuda), MFA (autenticação em múltiplos fatores: além da senha, algo que você tem, como um app ou chave física), bloqueio ou atraso após tentativas erradas e nunca compartilhar códigos recebidos.'
          ),
          sl(
            'Firewall e atualizações',
            'O FIREWALL filtra o tráfego segundo regras (origem, destino, porta, protocolo). A boa prática é negar por padrão e liberar só o necessário (mínimo privilégio). Há firewall no roteador, no sistema operacional de cada computador e em equipamentos dedicados. ATUALIZAÇÕES (sistema, navegador, firmware de roteador, aplicativos) corrigem vulnerabilidades conhecidas: a maior parte dos ataques explora falhas que já têm correção. Desative serviços e portas que você não usa: o que não existe, não pode ser atacado.'
          ),
          sl(
            'VPN: um túnel cifrado',
            'Uma VPN (Virtual Private Network) cria um túnel cifrado entre seu dispositivo e um ponto remoto. Dois usos principais: conectar-se com segurança à rede da empresa de fora do escritório e proteger o tráfego numa rede não confiável (Wi-Fi público), pois quem está na rede local só vê dados cifrados. Limites: a VPN não deixa você imune a phishing ou malware, não deixa você 100% anônimo e o operador da VPN passa a ver seu tráfego — escolha provedores confiáveis (ou a VPN da própria organização). HTTPS continua importante: cifra o conteúdo até o site de destino.'
          ),
          sl(
            'Dados em trânsito e em repouso; criptografia',
            'Dados EM TRÂNSITO são os que viajam pela rede; dados EM REPOUSO são os que estão guardados (disco, banco de dados, backup). CRIPTOGRAFIA embaralha os dados, e só quem tem a chave lê. Em trânsito: HTTPS/TLS, SSH, VPN, Wi-Fi com WPA2/WPA3. Em repouso: disco cifrado, backups cifrados. Regra simples: nunca trafegar dados pessoais ou senhas sem cifrar (nada de HTTP, FTP, Telnet puros), e proteger as chaves e senhas como se fossem os próprios dados.'
          ),
          sl(
            'LGPD em visão geral',
            'A LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018) protege os dados PESSOAIS: qualquer informação que identifique ou possa identificar uma pessoa (nome, CPF, e-mail, telefone, endereço, localização, IP em certos contextos). Ideias centrais para quem trabalha com redes e sistemas: FINALIDADE (coletar só para um propósito claro e informado), MINIMIZAÇÃO (coletar e guardar o mínimo necessário, pelo menor tempo), SEGURANÇA (proteger com medidas técnicas, como criptografia e controle de acesso) e RESPONSABILIDADE (em caso de incidente, comunicar à autoridade, a ANPD, e aos titulares quando houver risco). Na prática: não exponha dados pessoais em logs, capturas de tela, planilhas abertas ou chats; compartilhe só com quem precisa; descarte o que não é mais necessário.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual característica é típica de uma mensagem de phishing?', 'c', 'Urgência ou ameaça e um link para um endereço diferente do oficial', [
          'Mensagem criptografada com certificado digital válido',
          'Ausência total de links e anexos',
          'Origem sempre de um endereço IP privado'
        ], 'Golpistas criam pressão (urgência) e usam links disfarçados para um domínio falso.'),
        mc('q2', 'Qual é a defesa mais decisiva para se recuperar de um ransomware sem pagar o resgate?', 'd', 'Backups regulares com cópia offline/isolada e testada', [
          'Desligar o firewall',
          'Usar a mesma senha em tudo para não esquecer',
          'Abrir o anexo para verificar o conteúdo'
        ], 'Com backup isolado você restaura os dados; a regra 3-2-1 é uma boa referência.'),
        mc('q3', 'Reutilizar a mesma senha em vários sites facilita qual tipo de ataque?', 'b', 'Credential stuffing, que usa senhas vazadas de um site para tentar entrar em outros', [
          'Ataque de negação de serviço pelo cabo',
          'Interferência no Wi-Fi',
          'Troca do endereço MAC'
        ], 'Quando um site vaza senhas, os atacantes testam os mesmos pares em outros serviços.'),
        fill('q4', 'Complete com a sigla da lei brasileira de proteção de dados pessoais:', 'Lei 13.709/2018: ___', ['LGPD', 'lgpd'], 'LGPD = Lei Geral de Proteção de Dados Pessoais.'),
        mc('q5', 'O que uma VPN faz?', 'a', 'Cria um túnel cifrado entre o dispositivo e um ponto remoto, protegendo o tráfego em redes não confiáveis', [
          'Torna você imune a phishing e malware',
          'Aumenta a velocidade do Wi-Fi',
          'Anula a necessidade de senhas e MFA'
        ], 'A VPN cifra o tráfego no trecho até o ponto VPN, mas não substitui outras defesas.'),
        mc('q6', 'Qual é a prática recomendada para as regras de um firewall?', 'b', 'Negar por padrão e liberar só o que for necessário', [
          'Liberar tudo e bloquear apenas o que der problema',
          'Desativar o firewall em redes internas',
          'Liberar todas as portas acima de 1024'
        ], 'Mínimo privilégio: tudo que não é necessário fica bloqueado.'),
        mc('q7', 'Segundo o princípio da minimização da LGPD, o que se deve fazer?', 'c', 'Coletar e guardar apenas os dados pessoais necessários à finalidade, pelo menor tempo possível', [
          'Coletar todos os dados possíveis, por precaução',
          'Guardar tudo para sempre, em texto puro',
          'Compartilhar os dados com qualquer parceiro interessado'
        ], 'Quanto menos dado pessoal coletado e guardado, menor o risco para o titular e para a organização.'),
        fill('q8', 'Complete com a sigla da autenticação que exige mais de um fator além da senha (por exemplo, um código no app):', 'Autenticação em múltiplos fatores: ___', ['MFA', '2FA', 'mfa'], 'MFA protege a conta mesmo se a senha for descoberta.')
      ]
    },
    {
      id: 'rdb-25-diagnostico',
      title: 'Diagnóstico básico de problemas de rede',
      goal: 'Aplicar uma metodologia por camadas, de baixo para cima, com ping e ferramentas, para achar a causa de falhas comuns.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Método: de baixo para cima',
            'Diagnosticar é eliminar possibilidades em ordem. A estratégia mais confiável é ir de BAIXO para CIMA nas camadas, pois cada nível depende do anterior: 1) FÍSICO: o cabo está conectado, há luz de link, o Wi-Fi está conectado e com sinal? 2) IP: o dispositivo tem IP, máscara e gateway corretos? 3) GATEWAY: o roteador local responde? 4) INTERNET POR IP: dá para alcançar um endereço da internet sem nome? 5) DNS: os nomes são resolvidos? 6) APLICAÇÃO: o site/serviço específico responde? Quando um passo falha, o problema está ali (ou abaixo), então não perca tempo em cima.'
          ),
          sl(
            'Checklist com ping',
            'Uma sequência simples de pings revela em qual degrau a rede quebra. (1) ping 127.0.0.1: testa a pilha TCP/IP do próprio computador (loopback), sem sair pela placa. (2) ping do IP do gateway (por exemplo 192.168.1.1): testa a LAN e o roteador. (3) ping 1.1.1.1 ou 8.8.8.8: testa a saída à internet sem depender de DNS. (4) ping www.exemplo.com.br: testa o DNS (resolver o nome) e o acesso ao destino. Registre qual passo foi o primeiro a falhar.',
            '1) ping 127.0.0.1        -> pilha local\n2) ping 192.168.1.1      -> LAN / gateway\n3) ping 8.8.8.8          -> internet por IP\n4) ping www.exemplo.com.br -> DNS + destino'
          ),
          sl(
            'Lendo os resultados: primeiro passo que falha',
            '127.0.0.1 falha: problema na pilha TCP/IP ou no driver do próprio computador. Gateway falha (127.0.0.1 ok): problema na LAN — cabo, Wi-Fi, IP/máscara/gateway errados, ou o roteador está travado. Gateway ok, mas 8.8.8.8 falha: o problema está do roteador para fora — ONT/modem, cabo do provedor, conta ou o próprio provedor. 8.8.8.8 ok, mas o nome falha: problema de DNS. Nome responde, mas o site/aplicação não abre: problema de aplicação (serviço fora do ar, firewall, porta bloqueada, proxy). Lembre-se: alguns destinos bloqueiam ICMP; teste com mais de um destino.',
            'Gateway falha        -> LAN (cabo/Wi-Fi/IP/roteador)\nGateway ok, 8.8.8.8 X -> saída (ONT/provedor)\n8.8.8.8 ok, nome X    -> DNS\nNome ok, site X       -> aplicação/firewall'
          ),
          sl(
            'Casos típicos: IP e configuração',
            'IP 169.254.x.x: o DHCP não respondeu (cabo, Wi-Fi, servidor DHCP fora). IP duplicado (conflito): dois dispositivos com o mesmo IP geram quedas intermitentes — resolva com DHCP ou IPs fixos fora do pool. Máscara ou gateway errados (digitados à mão): o aparelho não alcança o roteador ou fala errado com a LAN. Gateway fora da sub-rede do host: nunca funciona. Use ipconfig /all (Windows) ou ip a e ip route (Linux) para conferir cada valor com o que você espera da rede.'
          ),
          sl(
            'Casos típicos: Wi-Fi, cabo e DNS',
            'Wi-Fi: sinal fraco (longe do AP, paredes), canal congestionado, banda errada; teste perto do roteador e com cabo. Cabo: conector mal crimpado ou cabo ruim causam quedas e velocidade abaixo do esperado (um link Gigabit que negocia 100 Mbps, por exemplo, sugere par de fios com problema); troque o cabo. DNS: o servidor configurado está fora do ar ou lento; teste com nslookup e, se preciso, troque o resolver. Aplicação: o serviço está desligado, a porta está bloqueada pelo firewall, o certificado está inválido.'
          ),
          sl(
            'Delimitando o escopo e práticas finais',
            'Antes de mexer em tudo, descubra o ESCOPO: afeta só um dispositivo (problema local do aparelho), todos os dispositivos da casa (roteador/provedor) ou só um site (aplicação)? Mude uma coisa por vez e teste de novo. Reiniciar ajuda e é seguro, na ordem certa: equipamentos do provedor (ONT/modem), depois o roteador, depois o dispositivo. Anote o que fez, para poder desfazer. Se for o provedor, conte a ele o resultado dos seus testes (ex.: "o ping ao gateway funciona, mas a 8.8.8.8 não"): acelera o atendimento.'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a ordem mais eficaz para diagnosticar uma falha de rede?', 'b', 'Do físico para cima: cabo/Wi-Fi → IP → gateway → internet por IP → DNS → aplicação', [
          'Da aplicação para baixo: site → DNS → gateway → IP → cabo',
          'Aleatoriamente, mudando várias coisas ao mesmo tempo',
          'Sempre reiniciando o computador do vizinho'
        ], 'Cada camada depende da inferior; testar de baixo para cima localiza o primeiro ponto de falha.'),
        mc('q2', 'O que testa o comando ping 127.0.0.1?', 'a', 'A pilha TCP/IP do próprio computador (loopback), sem sair pela placa', [
          'A conexão com o provedor',
          'O servidor DNS do roteador',
          'A velocidade do Wi-Fi'
        ], '127.0.0.1 é o loopback: o tráfego não sai da máquina.'),
        mc('q3', 'O ping ao gateway funciona, mas o ping a 8.8.8.8 não. Onde está o problema mais provável?', 'd', 'Na saída para a internet (ONT/modem, cabo do provedor, conta ou provedor)', [
          'No cabo entre o computador e o roteador',
          'No DNS',
          'No driver do computador'
        ], 'A LAN está boa (o gateway responde); a falha está do roteador para fora.'),
        fill('q4', 'O ping para 8.8.8.8 funciona, mas o ping para www.exemplo.com.br falha ao resolver o nome. Complete com a sigla do serviço suspeito:', 'Problema provável: ___', ['DNS', 'dns'], 'Se funciona por IP e não por nome, a resolução de nomes (DNS) é a suspeita.'),
        mc('q5', 'Só o notebook perde a conexão; celular e TV na mesma rede funcionam normalmente. O que isso sugere?', 'c', 'O problema é local do notebook (placa, driver, configuração ou Wi-Fi dele), não do provedor', [
          'O provedor está fora do ar',
          'O roteador está desligado',
          'O DNS do mundo inteiro falhou'
        ], 'Delimitar o escopo evita mexer onde não precisa: se os outros funcionam, o problema é do aparelho.'),
        mc('q6', 'Um host tem IP 192.168.1.10/24 e gateway 192.168.2.1; ele fala com outros da LAN, mas não sai para a internet. Qual é a causa?', 'b', 'O gateway está fora da sub-rede do host e, por isso, não pode ser alcançado', [
          'O IP é público demais',
          'A máscara /24 impede acesso à internet',
          'O cabo é Cat6'
        ], 'O gateway deve pertencer à mesma sub-rede do host (192.168.1.x).'),
        mc('q7', 'O ping a um nome funciona, mas o site específico não abre no navegador. Em qual camada procurar?', 'd', 'Aplicação: serviço fora do ar, porta bloqueada, firewall, proxy ou certificado', [
          'Física: trocar o cabo',
          'Rede: refazer o endereçamento IP',
          'Enlace: trocar o MAC'
        ], 'Se a conectividade e o DNS funcionam, resta a camada de aplicação.'),
        fill('q8', 'Um computador aparece com IP 169.254.x.x. Complete com a sigla do serviço que provavelmente não respondeu:', 'Falha provável do servidor ___', ['DHCP', 'dhcp'], 'O endereço 169.254.x.x (APIPA) é usado quando não há resposta do DHCP.')
      ]
    },
    {
      id: 'rdb-26-revisao-abrir-site',
      title: 'Revisão integrada: o que acontece quando você abre um site',
      goal: 'Ligar tudo o que foi aprendido, da digitação da URL à página na tela: DHCP, DNS, ARP, gateway, NAT, TCP, TLS e HTTP.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Antes de tudo: o que o seu aparelho já tem',
            'Quando você abre o navegador, a rede já foi preparada. Ao conectar (cabo ou Wi-Fi), o DHCP entregou ao seu dispositivo um IP (digamos 192.168.1.10/24), o gateway (192.168.1.1) e os servidores DNS (em casa, em geral o próprio roteador, que repassa ao DNS do provedor). Você digita https://www.exemplo.com.br e aperta Enter. Vamos seguir cada etapa, passando por quase todas as lições do curso.',
            'IP: 192.168.1.10/24  Gateway: 192.168.1.1  DNS: 192.168.1.1'
          ),
          sl(
            'Etapa 1: DNS, de nome para IP',
            'O navegador separa a URL: esquema https (porta 443), host www.exemplo.com.br, caminho /. Mas redes falam IP, então ele precisa do IP do host. Procura nos caches (navegador, sistema operacional, arquivo hosts); se não achar, pergunta ao resolver (192.168.1.1), por UDP na porta 53. O resolver, se necessário, consulta raiz, TLD e o servidor autoritativo, e devolve o IP — digamos 203.0.113.10 — com um TTL de cache. Camada de aplicação (DNS) sobre UDP.'
          ),
          sl(
            'Etapa 2: fora da LAN? Gateway e ARP',
            'Agora o host precisa enviar pacotes a 203.0.113.10. Compara com sua sub-rede: 203.0.113.10 não pertence a 192.168.1.0/24, então o destino está fora e o pacote vai ao GATEWAY. Mas o quadro Ethernet/Wi-Fi precisa do MAC do gateway: se não estiver no cache ARP, o host faz uma requisição ARP em broadcast ("quem tem 192.168.1.1?") e recebe a resposta unicast. Agora ele monta o quadro com MAC de destino = o do roteador. O switch (ou AP) usa sua tabela de MACs para entregá-lo à porta certa.',
            'IP origem 192.168.1.10 -> IP destino 203.0.113.10\nMAC origem (meu) -> MAC destino (gateway)'
          ),
          sl(
            'Etapa 3: roteador, NAT e a viagem',
            'O roteador de casa tira o quadro, lê o IP de destino e aplica NAT/PAT: troca o IP e a porta de origem pelo IP público e uma porta pública, anotando na tabela de tradução. Diminui o TTL em 1 e encaminha ao próximo roteador do provedor. A cada salto, cada roteador refaz o quadro com novos MACs (o IP de destino continua o mesmo) e diminui o TTL. Assim o pacote atravessa a internet até o servidor. A resposta fará o caminho de volta, e o roteador usará a tabela NAT para devolver ao seu dispositivo.'
          ),
          sl(
            'Etapa 4: TCP e TLS',
            'Para falar com o servidor, o TCP abre a conexão: three-way handshake SYN, SYN-ACK, ACK, do seu IP:porta alta aleatória ao 203.0.113.10:443. Com a conexão aberta, o TLS faz seu próprio aperto de mão: o servidor apresenta o certificado digital; o navegador confere se é válido, não expirou, foi emitido por uma CA confiável e vale para aquele domínio; os dois combinam as chaves de criptografia. Se algo falhar, o navegador mostra um aviso de certificado e é melhor parar. Se tudo certo, aparece o cadeado.',
            'SYN ->  <- SYN-ACK  ACK ->      (TCP)\nClientHello -> <- certificado  chaves   (TLS)'
          ),
          sl(
            'Etapa 5: HTTP e a página',
            'Dentro do túnel TLS, o navegador envia a requisição HTTP: GET / com o cabeçalho Host. O servidor responde com 200 OK, cabeçalhos e o corpo (HTML). O navegador lê o HTML e pede, em novas requisições, imagens, estilos e scripts (reaproveitando conexões e o cache de DNS). Cookies, se existirem, vão e voltam nos cabeçalhos. Termina com a página desenhada na tela. Tudo isso costuma levar uma fração de segundo.',
            'GET / HTTP/1.1\nHost: www.exemplo.com.br\n\nHTTP/1.1 200 OK\nContent-Type: text/html'
          ),
          sl(
            'Mapa final: camadas e protocolos',
            'Aplicação (7): DNS para achar o IP, HTTP para pedir a página. Segurança (entre 6 e 7): TLS cifra. Transporte (4): TCP com portas e handshake. Rede (3): IP, roteamento, gateway, NAT e TTL. Enlace (2): Ethernet/Wi-Fi com MAC e ARP, switch. Física (1): cabo ou rádio. Quando algo falha, pergunte em qual etapa: não resolve nome (DNS), não alcança o gateway (LAN), não conecta (TCP/firewall), erro de certificado (TLS), erro 404/500 (HTTP). É o mesmo método de diagnóstico, de baixo para cima.',
            'Etapa             Protocolo / elemento        Camada\nIP/gateway/DNS    DHCP                        7 (UDP)\nNome -> IP        DNS                         7\nMAC do gateway    ARP                         2\nSaída/NAT         roteador, NAT, TTL          3\nConexão           TCP handshake               4\nCifra             TLS                         6-7\nPágina            HTTP                        7'
          )
        ]
      },
      questions: [
        mc('q1', 'Qual é a primeira etapa que o navegador precisa resolver para acessar www.exemplo.com.br?', 'a', 'Descobrir o IP do nome por meio do DNS', [
          'Abrir a conexão TLS',
          'Enviar o GET / do HTTP',
          'Calcular o TTL do servidor'
        ], 'Redes trabalham com IP; o DNS converte o nome no endereço para o qual os pacotes serão enviados.'),
        mc('q2', 'Por que o host faz ARP do MAC do GATEWAY e não do servidor na internet?', 'b', 'Porque o servidor está fora da LAN; o quadro só precisa chegar ao próximo salto, o gateway', [
          'Porque o ARP só funciona para roteadores',
          'Porque o servidor não tem endereço MAC',
          'Porque o gateway é sempre o servidor DNS'
        ], 'ARP age só na rede local; o MAC de destino do quadro é o do gateway enquanto o IP de destino é o do servidor.'),
        mc('q3', 'Qual é o papel do NAT/PAT do roteador nessa viagem?', 'c', 'Trocar o IP e a porta de origem privados pelo IP público e uma porta pública, registrando na tabela de tradução', [
          'Cifrar o conteúdo da página',
          'Resolver o nome em IP',
          'Descobrir o MAC do servidor'
        ], 'O NAT/PAT permite que um IP privado acesse a internet e devolve as respostas ao aparelho certo.'),
        fill('q4', 'Complete com o número da camada OSI em que o HTTP atua:', 'HTTP = camada OSI nº ___', ['7', 'sete', 'camada 7'], 'HTTP é um protocolo da camada de aplicação (7).'),
        mc('q5', 'Qual é a ordem correta dos eventos (a partir da URL digitada)?', 'a', 'DNS → ARP do gateway → handshake TCP → TLS → requisição HTTP', [
          'HTTP → TCP → DNS → ARP → TLS',
          'TLS → DNS → HTTP → ARP → TCP',
          'ARP do servidor → HTTP → DNS → TCP → TLS'
        ], 'Primeiro se descobre o IP; depois se alcança o gateway, abre-se o TCP, negocia-se o TLS e só então viaja o HTTP cifrado.'),
        mc('q6', 'Durante a viagem do pacote entre roteadores, o que muda a cada salto?', 'c', 'Os endereços MAC (e o TTL diminui em 1); os IPs de origem e destino se mantêm (exceto pelo NAT na borda)', [
          'Os IPs de origem e destino mudam sempre, o MAC permanece',
          'Nada muda, nem o TTL',
          'A porta de destino muda para 80'
        ], 'O quadro é refeito em cada enlace (novos MACs); o IP de destino é o mesmo de ponta a ponta.'),
        mc('q7', 'O navegador mostra um aviso de "certificado inválido" ao abrir o site. Em qual etapa ocorreu o problema?', 'b', 'No TLS, onde o certificado do servidor é validado', [
          'No DHCP',
          'No ARP',
          'No three-way handshake do TCP'
        ], 'A validação do certificado faz parte do aperto de mão TLS; se falhar, o navegador alerta.'),
        fill('q8', 'Complete com a sigla do protocolo de criptografia que transforma HTTP em HTTPS:', 'HTTP + ___ = HTTPS', ['TLS', 'tls', 'SSL'], 'O TLS cifra a comunicação HTTP, garantindo confidencialidade e autenticação do servidor.')
      ]
    }
  ]
};
