// Módulo "Intermediário" do curso de Redes de Computadores — 15 lições (primeira metade do nível),
// 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o
// formato e a validação de boot. Camada 2 em profundidade (switching, VLAN, STP, agregação e
// redundância), roteamento (estático, dinâmico, VLSM/sumarização), IPv6, ACLs/firewalls, NAT, DNS,
// DHCP, TCP, UDP/tempo real e QoS. Mesmo padrão de ./01-*.js e dos demais cursos.
// Para não repetir o mesmo objeto literal centenas de vezes, as questões usam helpers locais (mcq e
// fill) que produzem exatamente o formato esperado pela validação do boot: mcq recebe a letra da
// resposta correta e as 4 alternativas na ordem a, b, c, d (a posição da certa é escolhida à mão e
// variada); fill recebe prompt, código com a lacuna ___ e a lista de respostas aceitas (a 1ª é a
// canônica). sl() monta um slide (code opcional).
// Segurança e privacidade (LGPD): endereços só de documentação (192.0.2.0/24, 198.51.100.0/24,
// 203.0.113.0/24, 2001:db8::/32) ou privados (RFC 1918); MACs e domínios fictícios (example.com);
// nenhum dado pessoal real. Ataques (loops/BPDU forjado, DHCP rogue, starvation, spoofing) aparecem
// só em nível conceitual, sempre junto da defesa (BPDU Guard, DHCP snooping, ACLs, menor
// privilégio); logs de DHCP/DNS/NAT são tratados como possíveis dados pessoais (minimização e
// retenção). Nenhum número que envelheça (versões, preços, velocidades de moda) é afirmado — só
// conceitos e valores estáveis dos padrões (IEEE/IETF); valores padrão de fabricante vêm
// identificados como "costumam ser".
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
  id: 'intermediario-redes',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Switching, VLAN, STP, roteamento (estático, RIP, OSPF, EIGRP), VLSM, IPv6, ACLs, NAT, DNS, DHCP, TCP, UDP e QoS',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'rdi-01-switching-profundidade',
      title: 'Switching em profundidade',
      goal: 'Entender como o switch aprende e esquece endereços, o que faz com destinos desconhecidos e como duplex errado derruba o desempenho.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Tabela MAC: aprender e envelhecer',
            'O switch constrói sua tabela MAC olhando o MAC de ORIGEM de cada quadro que chega: anota "este MAC está atrás desta porta" (e em qual VLAN). Cada entrada tem um temporizador de envelhecimento (aging time; em muitos switches o padrão costuma ser 300 segundos): a cada quadro novo daquela origem o contador reinicia; se o dispositivo fica calado até o tempo acabar, a entrada é apagada. Isso mantém a tabela enxuta e permite que um host mude de porta: ao falar de novo, a entrada é atualizada para a nova porta. A tabela tem tamanho limitado (memória do switch).',
            'SW1# show mac address-table\n\nVlan  Mac Address       Type     Ports\n----  -----------       ----     -----\n   1  aaaa.bbbb.0001    DYNAMIC  Gi0/1\n   1  aaaa.bbbb.0002    DYNAMIC  Gi0/2\n   1  aaaa.bbbb.0003    DYNAMIC  Gi0/24'
          ),
          sl(
            'Flooding e unknown unicast',
            'Para ENCAMINHAR, o switch olha o MAC de DESTINO. Se achou na tabela, envia só pela porta correspondente (forwarding). Se o destino é um unicast que NÃO está na tabela (unknown unicast), o switch faz flooding: copia o quadro por todas as portas da mesma VLAN, exceto a de entrada. O mesmo acontece com broadcast (FF:FF:FF:FF:FF:FF) e, por padrão, com multicast. Quando o destino responder, o switch aprende onde ele está e passa a enviar direto. Se a origem for a mesma porta do destino, o quadro é descartado (filtering), pois o destino já recebeu pelo mesmo segmento.'
          ),
          sl(
            'Store-and-forward vs cut-through',
            'Store-and-forward: o switch recebe o quadro INTEIRO, confere o FCS (verificação de erros) e só então encaminha — descarta quadros corrompidos, mas adiciona latência proporcional ao tamanho do quadro (1500 bytes a 100 Mb/s levam 1500 × 8 / 100.000.000 = 120 µs só para chegar). Cut-through: começa a encaminhar assim que lê o MAC de destino (os primeiros 6 bytes), sem esperar o fim — latência baixa e quase constante, mas pode propagar quadros com erro, pois o FCS só chega no final. Existe também a variante fragment-free (espera 64 bytes para filtrar colisões). Store-and-forward é o modo mais comum.'
          ),
          sl(
            'Domínios de colisão e de broadcast',
            'Domínio de colisão: conjunto de dispositivos que disputam o mesmo meio e cujos quadros podem colidir. Num hub, todas as portas formam UM domínio; em cada porta de switch full-duplex há um domínio próprio (na prática, sem colisões). Domínio de broadcast: alcance de um broadcast. O switch NÃO o divide: todas as portas da mesma VLAN estão no mesmo domínio. Quem o divide é o roteador (ou uma VLAN, vista na próxima lição). Resumo: switch separa colisão por porta; roteador separa broadcast por interface.'
          ),
          sl(
            'Switch L2 vs switch L3',
            'Switch de camada 2 decide pelo MAC e não entende IP: para falar entre sub-redes diferentes, precisa de um roteador. Switch de camada 3 (multilayer) também roteia pacotes IP entre VLANs/sub-redes, em hardware e em alta velocidade, usando interfaces virtuais (SVI) ou portas roteadas. Em uma rede de campus, o acesso costuma ser L2 e o núcleo/distribuição L3. Um switch L3 continua fazendo switching normal dentro da mesma VLAN; só roteia quando o destino está em outra sub-rede.'
          ),
          sl(
            'Velocidade, duplex e mismatch',
            'Cada porta opera numa velocidade (10/100/1000 Mb/s ou mais) e num duplex: full-duplex (envia e recebe ao mesmo tempo, sem colisões) ou half-duplex (um de cada vez, com CSMA/CD e colisões). A autonegociação faz as duas pontas combinarem o melhor modo comum. Mismatch de duplex ocorre quando uma ponta fica em full e a outra em half (comum ao fixar manualmente só um lado: o lado em auto não consegue negociar e assume half). Sintoma: a rede "funciona", mas lenta, com late collisions e erros de CRC contadores crescentes, principalmente sob carga. Correção: configurar as duas pontas igualmente (ambas em auto, ou ambas fixas com o mesmo valor).',
            'SW1# show interfaces gi0/2\n  Full-duplex, 1000Mb/s\n  ...\n  5 late collision\n  1342 CRC\n\n(lado oposto em half-duplex: mismatch)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como o switch preenche a tabela MAC?', 'b', [
          'Lendo o MAC de destino de cada quadro',
          'Lendo o MAC de origem de cada quadro e associando-o à porta de chegada',
          'Consultando o DHCP para saber os MACs',
          'Perguntando por ARP a cada host ligado'
        ], 'O switch aprende pela ORIGEM: "este MAC está nesta porta". O destino só é usado na hora de encaminhar.'),
        mcq('q2', 'Um switch recebe um quadro unicast cujo MAC de destino não está na tabela. O que ele faz?', 'd', [
          'Descarta o quadro',
          'Envia só para o gateway',
          'Pede ao host de origem que repita depois',
          'Faz flooding: copia o quadro por todas as portas da VLAN, menos a de entrada'
        ], 'Unknown unicast é inundado. Quando o destino responder, o switch aprende sua porta.'),
        mcq('q3', 'Um notebook é movido da porta Gi0/1 para a Gi0/5 sem desligar o switch. O que acontece com a entrada MAC dele?', 'a', [
          'É atualizada para Gi0/5 assim que ele enviar um quadro de lá (ou expira pelo aging)',
          'Fica errada para sempre até reiniciar o switch',
          'O switch bloqueia a porta Gi0/5 por segurança automaticamente',
          'É duplicada, apontando para as duas portas'
        ], 'O aprendizado é contínuo: um novo quadro de origem na nova porta atualiza a entrada; entradas sem uso expiram.'),
        fill('q4', 'Como se chama, em inglês, o comportamento do switch de copiar um quadro de destino desconhecido por todas as portas da VLAN (menos a de entrada)?', 'Unknown unicast é tratado por ___', ['flooding', 'flood', 'inundação'], 'Flooding: o quadro é espalhado até o destino responder e ser aprendido.'),
        mcq('q5', 'Qual a principal vantagem do cut-through sobre o store-and-forward?', 'c', [
          'Descarta quadros corrompidos com mais eficiência',
          'Usa menos memória no roteador',
          'Latência menor, pois começa a encaminhar após ler o MAC de destino',
          'Permite roteamento entre VLANs'
        ], 'O cut-through não espera o quadro inteiro. Em troca, pode repassar quadros com FCS inválido.'),
        mcq('q6', 'Quantos domínios de broadcast existem em um switch L2 comum, sem VLANs, com 24 portas full-duplex em uso?', 'b', [
          '24, um por porta',
          '1 (e 24 domínios de colisão)',
          '2, um para cada metade das portas',
          'Nenhum, o switch bloqueia broadcasts'
        ], 'O switch separa colisão por porta, mas o broadcast atravessa todas as portas da mesma VLAN.'),
        mcq('q7', 'O que um switch L3 faz que um L2 não faz?', 'd', [
          'Aprender MACs dinamicamente',
          'Encaminhar quadros por full-duplex',
          'Usar autonegociação de velocidade',
          'Rotear pacotes IP entre sub-redes/VLANs em hardware'
        ], 'O L3 acrescenta roteamento IP (SVI/portas roteadas). Aprender MAC e duplex qualquer switch faz.'),
        fill('q8', 'Quantos microssegundos um quadro de 1500 bytes leva para ser recebido por completo a 100 Mb/s (ignore preâmbulo e cabeçalhos)? Use a conta do slide.', 'Latência de recepção = ___ µs', ['120', '120 µs', '120us'], '1500 × 8 = 12.000 bits; 12.000 / 100.000.000 s = 0,00012 s = 120 µs.')
      ]
    },
    {
      id: 'rdi-31-cli-equipamentos',
      title: 'Primeiros passos na CLI de equipamentos de rede',
      goal: 'Acessar um equipamento, navegar pelos modos, configurar uma interface, salvar a configuração e aplicar segurança básica (referência: estilo Cisco IOS).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Como acessar: console, SSH e Telnet',
            'A CLI (interface de linha de comando) é a forma clássica de configurar roteadores e switches. Neste módulo usamos o estilo do Cisco IOS como referência, mas a sintaxe varia por fabricante (Juniper, Huawei, MikroTik e outros têm comandos próprios); os conceitos, porém, se repetem. Há dois jeitos de chegar à CLI. Pela porta de console: um cabo console liga o seu computador ao equipamento (hoje é comum um cabo com USB de um lado e a porta de console do outro) e você abre um programa de terminal (PuTTY, minicom...). A velocidade (baud rate) configurada no programa precisa ser a do equipamento; o manual informa o valor (em muitos equipamentos costuma ser 9600). O console funciona SEM nenhum IP configurado, por isso é o acesso do primeiro dia e da recuperação quando a rede falha. Pela rede: SSH (cifrado) ou Telnet (sem cifra, texto puro), que exigem IP, rota e serviço habilitado.',
            'Computador --cabo console--> porta CONSOLE do switch   (sem IP)\nComputador --rede (SSH)-----> IP do switch             (precisa de IP e SSH ativo)'
          ),
          sl(
            'Modos de operação e o prompt',
            'A CLI é dividida em modos, e o prompt (o texto antes do cursor) diz em qual você está. Modo usuário, prompt terminado em ">": só comandos básicos de consulta. Modo privilegiado, terminado em "#": todos os comandos de consulta e de gerência; entra-se com o comando enable. Modo de configuração global, "(config)#": alterações que valem para o equipamento todo; entra-se com configure terminal (a partir do privilegiado). Modos específicos, como interface, "(config-if)#": alterações de uma interface; entra-se com interface <nome> a partir do config global. O comando exit sobe um nível; end (ou Ctrl+Z) volta direto ao modo privilegiado. Se um comando "não existe", quase sempre é porque você está no modo errado.',
            'Switch> enable\nSwitch# configure terminal\nSwitch(config)# interface gigabitethernet0/1\nSwitch(config-if)# exit\nSwitch(config)# end\nSwitch#'
          ),
          sl(
            'Ajuda com ? e Tab',
            'Você não precisa decorar tudo. Digitar ? em qualquer ponto lista os comandos possíveis daquele modo; digitar o começo de uma palavra seguido de ? (sem espaço) lista as palavras que começam assim; digitar um comando e um espaço seguido de ? mostra o que pode vir a seguir. A tecla Tab completa o comando quando só há uma possibilidade. Abreviações também funcionam enquanto forem inequívocas (conf t vale configure terminal). Duas mensagens de erro comuns: "% Incomplete command" significa que faltam argumentos (use ? para ver quais); "% Invalid input detected at \'^\' marker" significa que há erro de digitação ou o comando não existe naquele modo, e o marcador ^ aponta onde.',
            'Switch# show ip ?\n  interface  IP interface status and configuration\n  route      IP routing table\nSwitch# show ip\n% Incomplete command.'
          ),
          sl(
            'running-config, startup-config e salvar',
            'O equipamento mantém duas configurações. A running-config é a que está em uso agora, na memória RAM: cada comando que você digita altera a running-config imediatamente. A startup-config fica na memória não volátil e é a carregada quando o equipamento liga. Consequência importante: se você não salvar, ao reiniciar (ou faltar energia) tudo o que configurou desde o último salvamento SE PERDE. Para salvar, copie a running para a startup. show running-config e show startup-config mostram uma e outra, e comparar as duas revela mudanças ainda não salvas. O comando hostname <nome> troca o nome do equipamento (aparece no prompt) e é a primeira configuração de praxe, pois ajuda a saber em qual equipamento você está.',
            'Switch(config)# hostname SW1\nSW1(config)# end\nSW1# show running-config\nSW1# show startup-config\nSW1# copy running-config startup-config'
          ),
          sl(
            'Configurar uma interface e conferir o resultado',
            'Para dar IP a uma interface de roteador (ou a uma interface de VLAN de um switch L3), entre no modo da interface e use ip address <endereço> <máscara>. Interfaces de roteador costumam vir desligadas: é preciso no shutdown para ligá-las. description <texto> registra para que serve a interface e ajuda muito na operação. Para conferir, show ip interface brief dá uma tabela com uma linha por interface: a coluna Status reflete a camada física ("up" com link, "down" sem link/cabo, "administratively down" quando alguém aplicou shutdown) e a coluna Protocol reflete a camada 2 (o protocolo da linha). Outros comandos de leitura: show interfaces (detalhes e contadores de erros), show version (modelo, versão do software, tempo ligado), show vlan brief (VLANs e portas de um switch) e show ip route (tabela de rotas de um roteador).',
            'R1(config)# interface gigabitethernet0/0\nR1(config-if)# ip address 192.0.2.1 255.255.255.0\nR1(config-if)# description LINK-PARA-SW1\nR1(config-if)# no shutdown\n\nR1# show ip interface brief\nInterface         IP-Address   OK? Method Status                Protocol\nGigabitEthernet0/0 192.0.2.1    YES manual up                    up\nGigabitEthernet0/1 unassigned   YES unset  administratively down down'
          ),
          sl(
            'Desfazer com no',
            'Quase todo comando de configuração pode ser desfeito colocando a palavra no na frente dele, no mesmo modo em que foi aplicado: no shutdown liga a interface (e shutdown a desliga); no ip address remove o endereço; no description remove a descrição. Como a mudança vale na running-config na hora, desfazer com no também vale na hora. Se você errou e AINDA não salvou, uma saída é reiniciar o equipamento para voltar à startup-config; mas em produção isso derruba a rede, então prefira desfazer o comando certo.',
            'SW1(config-if)# shutdown       <- desliga a porta\nSW1(config-if)# no shutdown    <- desfaz: liga a porta\nSW1(config-if)# no description <- remove a descrição'
          ),
          sl(
            'Segurança básica logo no início',
            'Equipamento novo e sem proteção é risco. Medidas básicas: enable secret <senha> protege o modo privilegiado guardando a senha com hash (o antigo enable password a guarda sem proteção). Senhas nas linhas: line console 0 e line vty 0 4 aceitam login com senha, e o ideal é login local com usuários criados por username <nome> secret <senha>. O comando service password-encryption cifra as senhas "em texto" do arquivo de configuração, mas com cifragem FRACA e reversível: serve só para evitar que alguém leia por cima do ombro, não como proteção real, por isso não substitui o enable secret. Telnet envia usuário e senha sem cifra: nas linhas VTY (acesso remoto) use transport input ssh, que exige hostname, nome de domínio e um par de chaves gerado no equipamento. banner login define o aviso legal exibido antes do login (avise que o acesso é restrito e monitorado, sem revelar modelo, versão ou nome da empresa). Nunca deixe senhas de exemplo ou padrão de fábrica.',
            'SW1(config)# enable secret <senha-forte>\nSW1(config)# username admin secret <senha-forte>\nSW1(config)# ip domain-name example.com\nSW1(config)# crypto key generate rsa\nSW1(config)# line vty 0 4\nSW1(config-line)# transport input ssh\nSW1(config-line)# login local\nSW1(config)# banner login #Acesso restrito a pessoal autorizado#'
          )
        ]
      },
      questions: [
        mcq('q1', 'O prompt mostra "Switch(config-if)#". Em que modo você está e como volta ao modo privilegiado de uma vez?', 'c', [
          'Modo usuário; digitando disable',
          'Configuração global; digitando enable',
          'Configuração de interface; digitando end (ou Ctrl+Z)',
          'Modo privilegiado; já está nele'
        ], '"(config-if)#" é o modo de configuração de interface. O end (ou Ctrl+Z) volta direto ao modo privilegiado, enquanto exit sobe só um nível.'),
        mcq('q2', 'Qual a vantagem do acesso por console num equipamento novo, sem nenhuma configuração?', 'a', [
          'Funciona sem IP configurado, por ser uma ligação direta por cabo',
          'É cifrado de ponta a ponta pela rede',
          'Permite acessar de qualquer lugar da internet',
          'Dispensa o programa de terminal'
        ], 'O console é local e independe de rede; por isso serve para a primeira configuração e para a recuperação. SSH e Telnet precisam de IP.'),
        mcq('q3', 'Você digitou "show ip" e recebeu "% Incomplete command". O que fazer?', 'd', [
          'Reiniciar o equipamento',
          'Trocar para o modo de configuração global',
          'Digitar no show ip',
          'Digitar "show ip ?" para ver o que pode vir a seguir e completar o comando'
        ], 'Esse erro indica argumentos faltando. O ? mostra as opções (como interface e route).'),
        fill('q4', 'Qual configuração recebe a cópia da running-config para que as mudanças sobrevivam a uma reinicialização?', 'SW1# copy running-config ___', ['startup-config', 'startup'], 'A startup-config fica na memória não volátil e é a carregada na inicialização. Sem esse comando, as mudanças se perdem ao reiniciar.'),
        mcq('q5', 'Na saída de show ip interface brief:\nGigabitEthernet0/1 unassigned YES unset administratively down down\nO que isso indica e como ligar a interface?', 'b', [
          'Cabo desconectado; trocar o cabo',
          'A interface foi desligada por configuração (shutdown); use no shutdown no modo da interface',
          'A interface está ligada e com IP; nada a fazer',
          'O protocolo de roteamento falhou; reiniciar o roteador'
        ], '"administratively down" significa que alguém aplicou shutdown. "down" sem o "administratively" sugeriria falta de link/cabo.'),
        mcq('q6', 'Sobre service password-encryption, qual afirmação está correta?', 'c', [
          'Torna as senhas impossíveis de recuperar',
          'Substitui a necessidade do enable secret',
          'Aplica cifragem fraca e reversível às senhas do arquivo; não é proteção real e não substitui o enable secret',
          'Cifra todo o tráfego de gerência'
        ], 'Ele só evita a leitura casual de senhas no config. O enable secret guarda a senha com hash e é o recomendado.'),
        mcq('q7', 'Observe:\nline vty 0 4\n transport input telnet\n login local\nQual o problema de segurança e a correção?', 'a', [
          'Telnet envia usuário e senha sem cifra; trocar por transport input ssh',
          'O login local não existe; usar apenas senha única',
          'As linhas VTY não podem ter usuários',
          'Não há problema, o Telnet é cifrado'
        ], 'Telnet trafega credenciais em texto puro. O SSH cifra a sessão (e exige hostname, domínio e chaves).'),
        fill('q8', 'Qual palavra, colocada na frente de um comando, o desfaz (por exemplo, para ligar a porta que estava com shutdown)?', 'SW1(config-if)# ___ shutdown', ['no'], 'A forma "no <comando>" desfaz o comando. Aqui, no shutdown liga a interface.')
      ]
    },
    {
      id: 'rdi-32-laboratorios-rede',
      title: 'Montando laboratórios de rede',
      goal: 'Escolher entre simuladores, emuladores e laboratórios Linux, respeitar licenças, montar uma topologia simples e testar em camadas, sempre em ambiente isolado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que praticar em laboratório',
            'Redes se aprendem fazendo. No laboratório você pode errar, derrubar a rede, quebrar uma configuração e recomeçar sem prejudicar ninguém; em produção, o mesmo erro tira pessoas do ar. É também onde se testa uma mudança antes de aplicá-la, se reproduz um problema e se treina para certificações. A regra de ouro: o laboratório é um ambiente à parte, que não se mistura com a rede de produção nem com a de terceiros.'
          ),
          sl(
            'Simulador ou emulador?',
            'Um simulador imita o comportamento dos equipamentos com software próprio: é leve, fácil de usar, mas só entende uma parte dos comandos e recursos. O Cisco Packet Tracer é um simulador (distribuído pela Cisco, veja as condições de uso). Um emulador executa o sistema operacional real do equipamento (NOS, a imagem do fabricante) dentro de máquinas virtuais ou containers: o comportamento é o do equipamento verdadeiro, mas consome mais recursos. GNS3 e EVE-NG são emuladores gráficos que ligam essas imagens numa topologia; o Containerlab define topologias por arquivo e usa containers com sistemas de rede. Resumo: simulador para aprender o básico rápido, emulador quando a fidelidade ao equipamento real importa.',
            'Simulador (ex.: Packet Tracer): software imita o equipamento\nEmulador (ex.: GNS3, EVE-NG, Containerlab): roda o NOS real em VM/container'
          ),
          sl(
            'Linux como laboratório: namespaces, Docker e Mininet',
            'Com Linux você monta redes sem instalar nada especial. ip netns cria namespaces de rede: cada um é como um "computador" isolado, com suas próprias interfaces e rotas; um par veth funciona como um cabo virtual entre dois namespaces. Containers Docker, com redes criadas por você, e máquinas virtuais (VirtualBox, KVM) também servem como hosts e roteadores (Linux encaminha pacotes, e há roteadores em software). O Mininet cria, num só computador, uma rede de hosts e switches virtuais, muito usado para estudar SDN (redes definidas por software). Laboratórios em nuvem também existem, mas lembre de custos e de não expor nada à internet sem necessidade.',
            'sudo ip netns add h1\nsudo ip netns add h2\nsudo ip link add veth1 type veth peer name veth2\nsudo ip link set veth1 netns h1\nsudo ip link set veth2 netns h2\nsudo ip -n h1 addr add 192.0.2.1/24 dev veth1\nsudo ip -n h2 addr add 192.0.2.2/24 dev veth2\nsudo ip -n h1 link set veth1 up\nsudo ip -n h2 link set veth2 up\nsudo ip netns exec h1 ping -c 2 192.0.2.2'
          ),
          sl(
            'Licenças e imagens de fabricantes',
            'As imagens de sistema operacional de roteadores e switches são software protegido por licença. Não as baixe de sites duvidosos nem as redistribua (compartilhar imagens de fabricantes sem licença é ilegal e ainda traz risco de malware dentro do arquivo). Use as formas oficiais: simuladores e imagens gratuitas ou de avaliação oferecidos pelo fabricante, programas de aprendizagem e laboratórios virtuais oficiais, ou sistemas de código aberto (como Linux, FRRouting, VyOS em sua versão aberta, Open vSwitch). Leia os termos de uso de cada ferramenta.'
          ),
          sl(
            'Recursos de hardware e topologia típica',
            'Cada nó de um emulador é uma máquina virtual ou container que usa CPU e memória: o tamanho da topologia é limitado pelo seu computador, e é comum precisar de virtualização habilitada na BIOS/UEFI e de armazenamento rápido. Simuladores pedem bem menos. Uma topologia típica de estudo tem: dois switches ligados entre si, um roteador, duas ou mais VLANs (por exemplo, usuários e servidores), um servidor com DHCP e DNS e alguns hosts. Com ela você pratica VLAN, trunk, roteamento entre VLANs, DHCP e DNS, e depois acrescenta ACLs, NAT ou roteamento dinâmico.',
            'PC1(VLAN10) --\\\n                 SW1 ==trunk== SW2 -- Servidor DHCP/DNS (VLAN20)\nPC2(VLAN10) --/            |\n                           R1 (roteia entre as VLANs)'
          ),
          sl(
            'Boas práticas do laboratório',
            'Parta de uma topologia SIMPLES e só acrescente complexidade quando a anterior funcionar: assim, se algo quebrar, você sabe o que mudou. Documente: um desenho, a tabela de endereços e VLANs e os objetivos do teste. Salve as configurações (copy running-config startup-config, ou exporte-as para arquivos) e use snapshots das máquinas virtuais antes de um teste arriscado, para voltar ao estado anterior em segundos. Mude uma coisa por vez e anote o resultado.'
          ),
          sl(
            'Teste de conectividade em camadas e isolamento',
            'Ao validar o laboratório (ou diagnosticar um problema) teste de baixo para cima: 1) a interface está up e com o IP/máscara certos? 2) o vizinho/gateway responde ao ping? 3) um destino em outra sub-rede responde pelo IP? 4) o nome resolve (DNS)? 5) a porta do serviço abre? O primeiro passo que falha mostra a camada do problema. Segurança e privacidade: use o laboratório também para experimentar ataques e defesas, mas só dentro dele, isolado (rede interna ou host-only da VM, sem ligação à produção nem à internet quando o teste for arriscado) e jamais contra redes de terceiros. Use dados fictícios; não copie para o laboratório bases ou logs reais com dados pessoais de clientes ou colaboradores (LGPD).',
            'ping 192.0.2.1              OK   (gateway)\nping 198.51.100.10          OK   (outra sub-rede, por IP)\nping servidor.example.com   FALHA (nome nao resolve -> DNS)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o principal motivo de praticar e testar mudanças em laboratório antes da produção?', 'b', [
          'Porque laboratórios são sempre mais rápidos que a rede real',
          'Poder errar e reproduzir problemas sem afetar usuários nem a rede real',
          'Porque a licença do fabricante exige',
          'Para copiar os dados reais dos clientes e testar com eles'
        ], 'O laboratório permite errar sem consequência. Copiar dados pessoais reais para lá seria um problema de LGPD.'),
        mcq('q2', 'Qual a diferença entre simulador e emulador?', 'd', [
          'O simulador é sempre pago e o emulador sempre gratuito',
          'O emulador só funciona em nuvem',
          'Não há diferença',
          'O simulador imita o equipamento com software próprio; o emulador executa o sistema operacional real (imagem) em VM/container'
        ], 'Packet Tracer simula; GNS3, EVE-NG e Containerlab executam imagens reais de NOS, com mais fidelidade e mais consumo de recursos.'),
        mcq('q3', 'Qual é a conduta correta quanto às imagens de sistema de roteadores/switches de fabricantes?', 'a', [
          'Usar fontes oficiais, versões gratuitas/de avaliação ou software aberto; não redistribuir imagens sem licença',
          'Baixar de qualquer site e compartilhar com colegas',
          'Remover a licença antes de usar',
          'Imagens de fabricantes não têm direitos autorais'
        ], 'Imagens são software licenciado; fontes duvidosas ainda podem conter malware.'),
        fill('q4', 'Qual subcomando de ip netns executa um comando (como o ping) dentro de um namespace de rede?', 'sudo ip netns ___ h1 ping -c 2 192.0.2.2', ['exec'], 'ip netns exec <nome> <comando> roda o comando dentro do namespace, que tem sua própria pilha de rede.'),
        mcq('q5', 'Num laboratório, o ping para o gateway 192.0.2.1 funciona, o ping para 198.51.100.10 (outra sub-rede, por IP) funciona, mas "ping servidor.example.com" falha dizendo que o nome não foi encontrado. Qual camada de teste falhou primeiro?', 'c', [
          'A interface física do host',
          'O gateway',
          'A resolução de nomes (DNS)',
          'A rota para a outra sub-rede'
        ], 'Os testes por IP passaram, então interface, gateway e rota estão bons; só o nome não resolve, apontando para o DNS.'),
        mcq('q6', 'Qual ferramenta cria, num só computador, hosts e switches virtuais e é muito usada para estudar SDN?', 'b', [
          'Packet Tracer',
          'Mininet',
          'ping',
          'netplan'
        ], 'O Mininet monta redes virtuais em um computador e é muito usado em SDN. Packet Tracer é simulador de equipamentos Cisco.'),
        mcq('q7', 'Você quer experimentar uma técnica de ataque para entender a defesa. Onde fazer isso?', 'd', [
          'Na rede Wi-Fi do vizinho, com cuidado',
          'Na rede de produção, fora do horário de pico',
          'Em qualquer rede, se não houver danos',
          'No laboratório isolado, sem ligação à produção nem a terceiros, com dados fictícios'
        ], 'Testes de segurança só em ambiente próprio e isolado ou com autorização formal. Terceiros e produção estão fora de questão.'),
        fill('q8', 'Antes de um teste arriscado numa VM do laboratório, que recurso permite voltar ao estado anterior em segundos?', 'Crie um ___ da VM antes do teste', ['snapshot', 'snapshots'], 'O snapshot guarda o estado da VM para restauração rápida, junto de configurações salvas e de documentação.')
      ]
    },
    {
      id: 'rdi-33-gerenciamento-seguro-dispositivos',
      title: 'Gerenciamento seguro de dispositivos de rede',
      goal: 'Proteger o plano de gerência dos equipamentos: acesso restrito, serviços seguros, AAA, descoberta de vizinhos controlada, backups, firmware e logs tratados à luz da LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O plano de gerenciamento e onde ele fica',
            'O plano de gerenciamento é o conjunto de acessos e protocolos usados para ADMINISTRAR os equipamentos (SSH, interface web, SNMP, syslog), diferente do tráfego dos usuários. Quem controla a gerência controla a rede, então ela merece proteção própria. Prática central: uma rede (VLAN) de gerência separada, com acesso limitado por ACL a poucos IPs de administradores (ou à VPN). Há dois modelos: out-of-band, em que a gerência usa uma rede e portas dedicadas (porta de gerência, servidor de console), independentes da produção, e que continua funcionando quando a produção cai; e in-band, em que a gerência trafega pela própria rede de produção, mais barato, mas some junto com ela e fica mais exposto. O ideal é out-of-band; quando não dá, in-band em VLAN própria e restrita.',
            'ADMIN --VPN--> rede/VLAN de GERENCIA --> interface de gerencia dos equipamentos\n(ACL: so os IPs dos administradores)'
          ),
          sl(
            'Acesso seguro e serviços a desativar',
            'Para o terminal remoto, use SSH, nunca Telnet (texto puro). Dentro do SSH, chaves públicas são mais fortes que senha (a privada nunca trafega nem pode ser adivinhada), e quando se usa senha, ela deve ser forte e única por pessoa. Para interface web, use HTTPS, não HTTP sem TLS, ou desative-a. Desative serviços que não usa. No SNMP, as versões v1 e v2c autenticam só por community string em texto puro (e comunidades padrão como "public" são um risco sério): prefira SNMPv3 (autenticação e criptografia) ou desative o SNMP, como visto na lição de monitoramento. Equipamentos saem de fábrica com usuário e senha padrão públicos nos manuais: troque-os (e desative contas padrão) ANTES de ligar o equipamento à rede.',
            'snmp-server community public RO     <- risco: v2c com community padrao\nip http server                      <- risco: web sem TLS\nip http secure-server               <- HTTPS (preferivel)'
          ),
          sl(
            'AAA e perfis de privilégio',
            'AAA são três funções: Autenticação (provar quem você é: usuário e senha, chave, MFA), Autorização (definir o que você pode fazer depois de autenticado: só consultar, ou configurar) e Contabilização, em inglês accounting (registrar quem fez o quê e quando: logins, comandos, mudanças). Em vez de criar usuários equipamento por equipamento, centraliza-se o AAA num servidor: assim um desligamento de funcionário bloqueia o acesso a tudo de uma vez. Aplique o menor privilégio: perfis como "somente leitura" para o suporte e "administrador" para poucos, com contas individuais (nunca uma conta compartilhada, que impede saber quem fez algo). Mantenha uma conta local de emergência, forte e guardada, para o caso do servidor AAA estar inacessível.'
          ),
          sl(
            'RADIUS e TACACS+',
            'São os dois protocolos mais usados para falar com o servidor AAA. RADIUS é um padrão aberto (IETF) que usa UDP e é muito empregado no acesso de usuários à rede (Wi-Fi corporativo com 802.1X, VPN); combina autenticação e autorização numa só resposta e cifra apenas a senha dentro do pacote. TACACS+ nasceu na Cisco, usa TCP, separa autenticação, autorização e contabilização e cifra todo o corpo do pacote; por permitir controlar quais COMANDOS cada administrador pode executar, é o preferido para a administração de equipamentos. Regra prática: RADIUS para o acesso dos usuários à rede, TACACS+ para o acesso dos administradores aos equipamentos.'
          ),
          sl(
            'CDP e LLDP: descoberta de vizinhos',
            'LLDP (padrão IEEE 802.1AB) e CDP (protocolo proprietário da Cisco) fazem cada equipamento anunciar, aos vizinhos diretos, informações sobre si: nome, modelo, versão do software, endereço de gerência e porta. São úteis para documentar a topologia e diagnosticar (show cdp neighbors lista quem está ligado em cada porta). O risco é o vazamento de informação: quem ligar um computador numa porta que recebe esses anúncios descobre modelos, versões e IPs, material valioso para atacar. Prática: manter nas portas entre equipamentos (uplinks), onde fazem sentido, e DESATIVAR nas portas de borda/usuário e nas que ligam a redes externas.',
            'SW1# show cdp neighbors\nDevice ID   Local Intrfce   Platform\nSW2         Gi0/24          (modelo)\n\nSW1(config)# interface gigabitethernet0/5     <- porta de usuario\nSW1(config-if)# no cdp enable'
          ),
          sl(
            'Logs, relógio e LGPD',
            'Para auditar a gerência, envie os logs dos equipamentos a um servidor central (syslog), registre logins, falhas e mudanças de configuração, e mantenha os relógios sincronizados por NTP: sem hora confiável não dá para correlacionar eventos nem usar o registro como evidência. Atenção à LGPD: logs de acesso administrativo contêm dados de pessoas (nome de usuário, IP, horário, comandos). Defina a finalidade (segurança e auditoria), registre só o necessário, restrinja quem lê os logs, proteja-os contra alteração e defina um prazo de retenção, apagando ou anonimizando depois dele. Nunca grave senhas nos logs.'
          ),
          sl(
            'Backup, firmware e inventário',
            'Backup de configuração: guarde cópias da configuração de todos os equipamentos, de forma automática e versionada (cada mudança vira uma versão, e dá para ver quem alterou o quê e voltar atrás). Como a configuração pode conter segredos (hashes, chaves, communities), o próprio backup deve ficar protegido, com acesso restrito. Teste a restauração: backup que nunca foi restaurado é só uma esperança. Atualização de firmware: corrige vulnerabilidades, mas exige cuidado. Leia as notas da versão, agende uma janela de mudança, faça backup antes, tenha um plano de rollback (voltar à versão anterior), baixe só do site oficial do fabricante e verifique a integridade comparando o hash (checksum) publicado com o do arquivo baixado. Inventário de ativos: lista atualizada de cada equipamento (modelo, número de série, versão de firmware, local, responsável); sem ela você não sabe o que precisa de atualização nem o que existe na rede.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença entre gerência out-of-band e in-band?', 'a', [
          'Out-of-band usa rede/portas dedicadas, independentes da produção; in-band passa pela própria rede de produção',
          'In-band usa cabos dedicados; out-of-band usa a rede dos usuários',
          'Out-of-band é sem fio e in-band é com fio',
          'Não há diferença prática'
        ], 'A gerência out-of-band continua funcionando quando a produção cai e fica mais isolada. A in-band é mais barata, mas depende da rede que administra.'),
        mcq('q2', 'Em um equipamento aparece a linha:\nsnmp-server community public RO\nQual é o problema?', 'c', [
          'RO significa que ninguém pode ler',
          'O SNMP usa só portas TCP',
          'Usa community padrão (v1/v2c), que trafega em texto puro; o ideal é SNMPv3 ou desativar o SNMP',
          'Não há problema, "public" é a senha mais segura'
        ], 'Em v1/v2c a community é a única proteção e viaja sem cifra. SNMPv3 traz autenticação de usuário e criptografia.'),
        mcq('q3', 'Um técnico de suporte consegue se autenticar, mas só pode executar comandos show, e o sistema registra cada comando digitado. Quais funções do AAA estão em ação, além da autenticação?', 'b', [
          'Contabilização limitando comandos; autorização registrando',
          'Autorização limitando o que pode fazer; contabilização registrando o que fez',
          'Apenas a autorização',
          'Nenhuma; isso é função do NTP'
        ], 'Autorização define o que o usuário pode fazer; contabilização (accounting) registra quem fez o quê e quando.'),
        fill('q4', 'Qual protocolo AAA, nascido na Cisco, usa TCP, cifra todo o corpo do pacote e permite controlar os comandos de cada administrador?', 'Administração de equipamentos: ___', ['TACACS+', 'TACACS', 'TACACS plus'], 'O TACACS+ separa autenticação, autorização e contabilização e é o preferido para administrar equipamentos; o RADIUS é mais usado no acesso de usuários.'),
        mcq('q5', 'Qual a prática recomendada para o CDP/LLDP em uma porta que liga computadores de usuários?', 'd', [
          'Manter ativo, pois ajuda o usuário',
          'Aumentar a frequência dos anúncios',
          'Usar a mesma configuração dos uplinks',
          'Desativar, pois anúncios revelam modelo, versão e IPs a quem se conectar à porta'
        ], 'LLDP/CDP são úteis entre equipamentos, mas em portas de borda vazam informação útil para um atacante.'),
        mcq('q6', 'Qual conjunto de passos é adequado para atualizar o firmware de um equipamento?', 'a', [
          'Janela de mudança, backup da configuração, plano de rollback, arquivo do site oficial com hash conferido',
          'Baixar de qualquer site e instalar na hora de maior tráfego',
          'Atualizar sem backup, para ser mais rápido',
          'Nunca atualizar, para não arriscar'
        ], 'Atualizar corrige falhas, mas exige planejamento: janela, backup, rollback e verificação de integridade do arquivo oficial.'),
        mcq('q7', 'Qual tratamento dos logs de acesso administrativo está alinhado à LGPD?', 'c', [
          'Guardar tudo indefinidamente e deixar aberto à empresa toda',
          'Apagar os logs a cada hora para não ter dados pessoais',
          'Ter finalidade clara, registrar só o necessário, restringir o acesso e apagar/anonimizar após o prazo de retenção',
          'Incluir as senhas digitadas, para auditoria completa'
        ], 'Nomes de usuário, IPs e horários identificam pessoas. Finalidade, minimização, acesso restrito e retenção definida são os princípios; senhas nunca devem ser registradas.'),
        fill('q8', 'Antes de ligar um equipamento novo à rede, o que se deve trocar porque costuma ser pública nos manuais do fabricante?', 'Trocar a ___ padrão de fábrica antes de conectar', ['senha', 'senha padrão', 'credencial', 'credenciais'], 'Usuário e senha de fábrica são conhecidos de todos; trocá-los (e desativar contas padrão) é uma das primeiras medidas.')
      ]
    },
    {
      id: 'rdi-02-vlans',
      title: 'VLANs',
      goal: 'Segmentar a rede com VLANs, distinguir portas access e trunk, entender a tag 802.1Q e rotear entre VLANs.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que segmentar',
            'Uma rede plana tem um único domínio de broadcast: quanto mais hosts, mais broadcasts (ARP, DHCP) chegam a todos, e qualquer máquina vê o tráfego de camada 2 de todas. Segmentar traz desempenho (menos broadcast por host), segurança (departamentos isolados; só o que for permitido cruza entre eles, por roteamento e ACL) e organização (agrupar por função, não por local físico). Sem VLAN, segmentar exigiria um switch físico por grupo.'
          ),
          sl(
            'VLAN = domínio de broadcast',
            'Uma VLAN (Virtual LAN) é um domínio de broadcast lógico dentro do(s) switch(es). Portas em VLANs diferentes não se enxergam em camada 2: um broadcast da VLAN 10 não aparece na VLAN 20, e o switch só encaminha MACs dentro da própria VLAN. Convenção: uma VLAN = uma sub-rede IP (ex.: VLAN 10 = 192.168.10.0/24; VLAN 20 = 192.168.20.0/24). Para duas VLANs conversarem é preciso roteamento (camada 3). As VLANs usam números de 1 a 4094 (a 1 é a padrão).'
          ),
          sl(
            'Portas access e trunk',
            'Porta access pertence a UMA VLAN e liga um dispositivo final (PC, impressora): os quadros trafegam sem tag e o host nem sabe que existe VLAN. Porta trunk liga switch a switch (ou a roteador/servidor) e transporta VÁRIAS VLANs no mesmo cabo, marcando cada quadro com a identificação da VLAN. Um trunk permite que a VLAN 10 exista em dois andares ligados por um único link.',
            'SW1(config)# vlan 10\nSW1(config-vlan)# name VENDAS\nSW1(config)# interface gi0/5\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10\nSW1(config)# interface gi0/24\nSW1(config-if)# switchport mode trunk'
          ),
          sl(
            'Tag 802.1Q e VLAN nativa',
            'O padrão IEEE 802.1Q insere no quadro Ethernet uma tag de 4 bytes: 2 de TPID (valor 0x8100, indica "quadro com tag"), e 2 com PCP (3 bits de prioridade, usados em QoS), DEI (1 bit) e VID (12 bits: o número da VLAN, 0–4095 com 0 e 4095 reservados, daí 1–4094). Como a tag soma 4 bytes, o quadro máximo vai de 1518 para 1522 bytes. A VLAN nativa é a única cujos quadros NÃO recebem tag no trunk (por padrão, VLAN 1): quadros sem tag recebidos no trunk são atribuídos a ela. Se as pontas divergirem na VLAN nativa há vazamento/mistura de tráfego entre VLANs; por isso as duas pontas devem concordar e convém usar uma VLAN nativa dedicada e não usada por hosts.'
          ),
          sl(
            'Roteamento entre VLANs: router-on-a-stick',
            'Hosts em VLANs distintas estão em sub-redes distintas, e o gateway de cada uma é um dispositivo L3. Em router-on-a-stick, UM cabo trunk liga o switch ao roteador, e o roteador cria subinterfaces, uma por VLAN, cada uma com o IP do gateway e a tag correspondente (encapsulation dot1Q). Simples e barato, mas todo o tráfego entre VLANs passa por esse único link (gargalo).',
            'R1(config)# interface gi0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 192.168.10.1 255.255.255.0\nR1(config)# interface gi0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 192.168.20.1 255.255.255.0'
          ),
          sl(
            'SVI, switch L3 e boas práticas',
            'Num switch L3, cada VLAN ganha uma interface virtual (SVI, interface vlan N) com o IP do gateway; o roteamento entre VLANs ocorre dentro do switch, em hardware, sem link único de gargalo. Boas práticas: não usar a VLAN 1 para hosts nem como nativa; desativar portas não usadas e colocá-las numa VLAN "lixeira" sem roteamento; permitir no trunk só as VLANs necessárias (allowed list); desabilitar negociação automática de trunk em portas de usuário (modo access fixo); documentar VLANs e sub-redes; e aplicar ACLs entre VLANs sensíveis (ex.: convidados nunca alcançam a rede interna).',
            'SW1(config)# ip routing\nSW1(config)# interface vlan 10\nSW1(config-if)# ip address 192.168.10.1 255.255.255.0\nSW1(config)# interface vlan 20\nSW1(config-if)# ip address 192.168.20.1 255.255.255.0'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a melhor definição de VLAN?', 'c', [
          'Um cabo especial que isola dois switches',
          'Uma sub-rede obrigatória de 254 hosts',
          'Um domínio de broadcast lógico criado dentro do switch',
          'Um protocolo de roteamento para redes virtuais'
        ], 'VLAN é um domínio de broadcast lógico. Costuma-se mapear uma VLAN para uma sub-rede IP, mas isso é convenção, não definição.'),
        mcq('q2', 'Um PC na VLAN 10 e outro na VLAN 20 ligados ao mesmo switch L2 sem roteador. Eles conseguem se comunicar?', 'a', [
          'Não: são domínios de broadcast diferentes e falta um dispositivo L3 para rotear',
          'Sim, pois estão no mesmo switch',
          'Sim, desde que o trunk esteja ativo',
          'Sim, apenas por broadcast'
        ], 'Sem roteamento entre VLANs (router-on-a-stick ou switch L3) o tráfego não cruza as VLANs.'),
        mcq('q3', 'Qual porta transporta várias VLANs, marcando cada quadro com a tag 802.1Q?', 'd', [
          'A porta access',
          'A porta de console',
          'A porta em modo half-duplex',
          'A porta trunk'
        ], 'Trunk leva múltiplas VLANs; access leva uma só e sem tag.'),
        fill('q4', 'Qual o tamanho, em bytes, da tag 802.1Q inserida no quadro Ethernet?', 'Tag 802.1Q = ___ bytes', ['4', '4 bytes'], 'TPID (2 bytes) + PCP/DEI/VID (2 bytes) = 4 bytes; por isso o quadro máximo sobe de 1518 para 1522.'),
        mcq('q5', 'O que é a VLAN nativa de um trunk 802.1Q?', 'b', [
          'A VLAN com mais hosts',
          'A VLAN cujos quadros trafegam SEM tag no trunk',
          'A única VLAN permitida no trunk',
          'A VLAN de gerência obrigatória'
        ], 'Quadros da VLAN nativa saem sem tag; sem tag recebidos entram nela. As duas pontas devem concordar.'),
        mcq('q6', 'Qual é a desvantagem do router-on-a-stick?', 'c', [
          'Não suporta tag 802.1Q',
          'Exige uma interface física por VLAN',
          'Todo o tráfego entre VLANs passa por um único link trunk, que pode virar gargalo',
          'Só funciona com duas VLANs'
        ], 'Um cabo único carrega o tráfego de ida e volta entre todas as VLANs, limitando o desempenho.'),
        mcq('q7', 'No switch L3 do slide, o que o comando "interface vlan 10" com IP 192.168.10.1 cria?', 'a', [
          'Uma SVI: o gateway da VLAN 10, usado para rotear dentro do switch',
          'Uma porta trunk para a VLAN 10',
          'Uma ACL que bloqueia a VLAN 10',
          'Um servidor DHCP para a VLAN 10'
        ], 'SVI é a interface virtual de camada 3 da VLAN; os hosts usam seu IP como gateway.'),
        fill('q8', 'Complete o comando que configura uma porta como trunk:', 'SW1(config-if)# switchport mode ___', ['trunk'], 'switchport mode trunk faz a porta transportar várias VLANs com tag 802.1Q.')
      ]
    },
    {
      id: 'rdi-03-stp',
      title: 'Spanning Tree Protocol',
      goal: 'Entender por que loops de camada 2 são destrutivos e como o STP elege a raiz e bloqueia portas para evitá-los.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: loops em camada 2',
            'Para ter redundância, ligamos switches em anel ou em malha. Mas o quadro Ethernet NÃO tem TTL (diferente do pacote IP): se existir um laço físico, um broadcast circula para sempre, e cada switch o copia para todas as portas, multiplicando as cópias. É a tempestade de broadcast (broadcast storm): em segundos a rede inteira satura e os switches ficam sem CPU. Além disso, a tabela MAC fica instável (o mesmo MAC é visto em portas diferentes, "flapping"). Redundância física precisa vir com um protocolo que mantenha a topologia lógica sem laços.'
          ),
          sl(
            'STP: ideia geral e BPDU',
            'O Spanning Tree Protocol (IEEE 802.1D) transforma a malha em uma árvore sem laços: escolhe um switch como referência e BLOQUEIA as portas que fecham ciclos, mantendo-as como reserva. Os switches trocam mensagens chamadas BPDU (Bridge Protocol Data Unit) a cada 2 segundos, informando quem acham que é a raiz e o custo até ela. Se um link ativo cai, as BPDUs cessam, o STP recalcula e desbloqueia uma porta reserva — redundância sem loop.'
          ),
          sl(
            'Eleição da root bridge',
            'Cada switch tem um Bridge ID = prioridade (padrão 32768, múltiplos de 4096) + endereço MAC. O MENOR Bridge ID vence e vira a root bridge (ponte raiz). Se as prioridades empatam (o padrão é igual em todos), vence o menor MAC, o que costuma eleger o switch mais ANTIGO — nem sempre desejável. Boa prática: baixar a prioridade do switch de núcleo para que ele seja a raiz de propósito, e ter um secundário com prioridade logo acima.',
            'SW-A  prioridade 32768  MAC aaaa.0000.0001\nSW-B  prioridade 32768  MAC aaaa.0000.0002\nSW-C  prioridade 4096   MAC aaaa.0000.0003\n=> SW-C é a raiz (menor prioridade). Sem SW-C, SW-A (menor MAC).'
          ),
          sl(
            'Custos e papéis das portas',
            'Todo switch não-raiz escolhe UMA porta raiz (root port): a que oferece o menor custo de caminho até a raiz. Em cada segmento, uma porta designada (designated) encaminha para ele — a do switch com menor custo até a raiz. O resto vira porta bloqueada (alternate), que não encaminha dados. O custo de cada link depende da velocidade; nos valores clássicos (curtos) do 802.1D: 10 Mb/s = 100, 100 Mb/s = 19, 1 Gb/s = 4, 10 Gb/s = 2. O custo do caminho é a soma dos links até a raiz. Empate: menor Bridge ID do vizinho, depois menor ID de porta. Todas as portas da raiz são designadas.'
          ),
          sl(
            'Estados das portas e convergência',
            'No STP clássico a porta passa por: Blocking (só ouve BPDU) → Listening (15 s, participa da eleição) → Learning (15 s, aprende MACs, ainda não encaminha) → Forwarding (encaminha dados). Do bloqueio ao encaminhamento leva ~30 s (mais até 20 s de max age para notar a falha), ou seja, de 30 a 50 s sem tráfego naquele caminho. Há ainda Disabled (desligada administrativamente). Esse tempo é longo demais para aplicações modernas, o que levou ao RSTP.'
          ),
          sl(
            'RSTP, PortFast e BPDU Guard',
            'RSTP (802.1w) acelera muito a convergência (da ordem de segundos ou menos) usando handshake entre vizinhos em vez de depender só de temporizadores; só tem 3 estados: discarding, learning e forwarding, e troca blocking/listening por discarding. É compatível com o STP e é o padrão recomendado. PortFast em portas de borda (PCs, impressoras, servidores) faz a porta ir direto a forwarding, pois nelas não há switch que cause loop. Mas se alguém ligar um switch numa porta PortFast, pode criar laço: o BPDU Guard desliga (err-disable) a porta se chegar uma BPDU nela. Em portas de usuário: PortFast + BPDU Guard juntos protegem contra loops acidentais e contra switches não autorizados que tentem virar a raiz.',
            'SW1(config)# spanning-tree mode rapid-pvst\nSW1(config)# spanning-tree vlan 1 root primary\nSW1(config)# interface gi0/10\nSW1(config-if)# spanning-tree portfast\nSW1(config-if)# spanning-tree bpduguard enable'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que um loop físico de camada 2 é tão destrutivo?', 'd', [
          'O cabo superaquece',
          'O DHCP deixa de funcionar',
          'Os roteadores apagam suas rotas',
          'O quadro Ethernet não tem TTL: broadcasts circulam e se multiplicam até saturar a rede'
        ], 'Sem TTL e com flooding em todas as portas, as cópias se multiplicam: tempestade de broadcast.'),
        mcq('q2', 'Qual switch vira a root bridge?', 'b', [
          'O com maior prioridade',
          'O com menor Bridge ID (prioridade + MAC)',
          'O com mais portas',
          'O com maior MAC, mesmo com prioridade diferente'
        ], 'Menor Bridge ID vence: compara-se primeiro a prioridade e, em empate, o MAC.'),
        mcq('q3', 'No exemplo do slide (A e B com 32768; C com 4096), qual a raiz e por quê?', 'c', [
          'SW-A, por ter o menor MAC entre todos',
          'SW-B, por ter o MAC intermediário',
          'SW-C, por ter a menor prioridade',
          'Nenhum: o STP exige configuração manual'
        ], 'A prioridade é comparada antes do MAC; 4096 é menor que 32768.'),
        fill('q4', 'Como se chamam as mensagens que os switches trocam para o STP eleger a raiz e detectar mudanças? (sigla)', 'As mensagens do STP chamam-se ___', ['BPDU', 'BPDUs'], 'BPDU = Bridge Protocol Data Unit, enviada por padrão a cada 2 s.'),
        mcq('q5', 'Qual é o papel de uma porta bloqueada (alternate) no STP?', 'a', [
          'Ficar em reserva, sem encaminhar dados, para evitar um laço e assumir se o caminho principal cair',
          'Encaminhar apenas broadcasts',
          'Conectar o switch ao roteador',
          'Ser a porta da root bridge'
        ], 'Ela é o "caminho reserva": ouve BPDUs, mas não encaminha dados até ser necessária.'),
        mcq('q6', 'Qual o tempo aproximado até uma porta STP clássico sair de blocking para forwarding?', 'd', [
          'Instantâneo',
          'Cerca de 2 s',
          'Cerca de 5 min',
          'De 30 a 50 s (listening 15 s + learning 15 s, mais o max age)'
        ], 'O STP 802.1D depende de temporizadores de 15 s por estado; o RSTP resolve isso.'),
        mcq('q7', 'Qual a combinação recomendada para portas de usuário (PCs, impressoras)?', 'b', [
          'Prioridade baixa e root primary',
          'PortFast + BPDU Guard',
          'Trunk + VLAN nativa',
          'Bloquear toda BPDU e desativar o STP'
        ], 'PortFast acelera o acesso; BPDU Guard desliga a porta se aparecer um switch (BPDU) nela.'),
        fill('q8', 'Pelos valores clássicos do slide, qual o custo STP de um link de 100 Mb/s?', 'Custo de 100 Mb/s = ___', ['19'], 'Valores clássicos: 10 Mb/s = 100, 100 Mb/s = 19, 1 Gb/s = 4, 10 Gb/s = 2.')
      ]
    },
    {
      id: 'rdi-04-agregacao-redundancia',
      title: 'Agregação de links e redundância no primeiro salto',
      goal: 'Combinar links com LACP, entender o balanceamento por hash e garantir gateway redundante com HSRP/VRRP, eliminando pontos únicos de falha.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que agregar links',
            'Ligar dois switches por dois cabos paralelos parece dobrar a banda, mas o STP bloquearia um deles (laço). A agregação de links junta vários cabos físicos num único link lógico (no mundo Cisco, EtherChannel; no padrão IEEE, 802.3ad / 802.1AX, também chamado link aggregation ou port-channel). O STP vê UM link só e não bloqueia nada. Ganhos: mais banda total e redundância (se um cabo cai, o link lógico continua com os demais, só mais estreito).'
          ),
          sl(
            'LACP: negociação do agrupamento',
            'LACP (Link Aggregation Control Protocol) é o protocolo aberto que negocia o grupo: as duas pontas trocam mensagens e só ativam as portas cujas configurações combinam (velocidade, duplex, VLANs/modo trunk). Modos: active (inicia a negociação) e passive (só responde); duas pontas passive nunca formam o grupo. Existe também o modo estático ("on"), sem negociação — arriscado se um lado estiver mal configurado. Um grupo pode ter vários links ativos (o número máximo depende do equipamento).',
            'SW1(config)# interface range gi0/1 - 2\nSW1(config-if-range)# channel-group 1 mode active\nSW1(config)# interface port-channel 1\nSW1(config-if)# switchport mode trunk'
          ),
          sl(
            'Balanceamento por hash',
            'O tráfego NÃO é espalhado pacote a pacote (isso reordenaria os pacotes de uma conversa). O switch calcula um hash sobre campos do quadro/pacote (MACs de origem e destino, IPs, portas) e o resultado escolhe sempre o mesmo link para aquele fluxo. Consequências: um ÚNICO fluxo nunca ultrapassa a velocidade de um link membro (2 × 1 Gb/s não dá 2 Gb/s para uma só transferência); com muitos fluxos diferentes, o hash tende a distribuir bem; se poucos hosts conversam, pode haver desequilíbrio. Escolher o critério de hash (por exemplo IP+porta) melhora a distribuição.'
          ),
          sl(
            'SPOF: ponto único de falha',
            'Um SPOF (Single Point of Failure) é um componente cuja falha derruba o serviço inteiro: um único switch de núcleo, um único link, um único roteador de saída, uma única fonte de energia. Redundância é duplicar esses componentes e ter um mecanismo de failover (comutação automática). O desenho: dois links (agregados), dois switches/roteadores, dois caminhos de energia. Mas atenção: redundância só vale se o failover for automático e testado; e componentes duplicados que dependem de um mesmo terceiro item (mesma tomada, mesmo cabo) ainda compartilham um SPOF.'
          ),
          sl(
            'Gateway redundante: HSRP e VRRP',
            'Os hosts têm um único gateway configurado (via DHCP ou estático). Se esse roteador cair, os hosts perdem a saída mesmo havendo um segundo roteador. Soluções de redundância no primeiro salto (FHRP) criam um gateway VIRTUAL: dois (ou mais) roteadores compartilham um IP virtual e um MAC virtual; os hosts usam esse IP virtual como gateway. HSRP é proprietário da Cisco (roteador active e standby); VRRP é padrão aberto (master e backup). O roteador ativo responde ao IP virtual; se ele falhar (os hellos param), o outro assume o IP e o MAC virtuais em poucos segundos, e os hosts nem notam, pois o IP do gateway não mudou.',
            'R1: IP real 192.168.10.2   (ativo)\nR2: IP real 192.168.10.3   (standby)\nGateway virtual: 192.168.10.1  (usado pelos hosts)\n\nR1(config-if)# standby 1 ip 192.168.10.1\nR1(config-if)# standby 1 priority 110\nR1(config-if)# standby 1 preempt'
          ),
          sl(
            'Prioridade, preempt e visão de conjunto',
            'O roteador de maior prioridade (padrão 100) vira ativo/master. Com preempt, ele retoma o papel quando volta de uma falha; sem preempt, o atual continua mesmo depois que o melhor volta. Um desenho típico de campus junta as peças: hosts → switch de acesso → dois switches de distribuição (cada um com SVI e HSRP/VRRP, ligados por um port-channel LACP) → núcleo duplicado, com STP/RSTP garantindo ausência de laços. Cada camada elimina um SPOF.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que a agregação de links evita o bloqueio do STP entre dois cabos paralelos?', 'a', [
          'O STP enxerga os cabos agrupados como UM link lógico, sem laço',
          'O STP é desativado automaticamente',
          'Os cabos passam a operar em half-duplex',
          'Um dos cabos é desligado fisicamente'
        ], 'O port-channel é visto como um link único; por isso nenhuma porta é bloqueada.'),
        mcq('q2', 'Qual é o protocolo aberto (IEEE) para negociar a agregação de links?', 'c', [
          'HSRP',
          'STP',
          'LACP',
          'VRRP'
        ], 'LACP (802.3ad/802.1AX) é o aberto; o PAgP é da Cisco. HSRP e VRRP são de gateway, STP é de loops.'),
        mcq('q3', 'Duas pontas de um grupo LACP estão configuradas como passive. O que acontece?', 'b', [
          'O grupo forma normalmente',
          'O grupo não se forma: ninguém inicia a negociação',
          'Elas passam a usar HSRP',
          'O STP bloqueia as duas portas'
        ], 'Pelo menos uma ponta precisa estar active para iniciar a negociação LACP.'),
        fill('q4', 'Qual sigla designa o componente cuja falha derruba o serviço inteiro (ponto único de falha)?', 'Eliminar o ___ é o objetivo da redundância', ['SPOF', 'single point of failure'], 'SPOF = Single Point of Failure. Redundância existe para eliminá-lo.'),
        mcq('q5', 'Um port-channel com 2 links de 1 Gb/s. Uma única transferência de arquivo entre dois hosts pode usar quanto?', 'd', [
          '2 Gb/s, dividindo os pacotes entre os links',
          '4 Gb/s',
          '0,5 Gb/s',
          'No máximo 1 Gb/s: o hash do fluxo escolhe sempre o mesmo link membro'
        ], 'O balanceamento é por fluxo (hash), não por pacote; um fluxo fica num só link.'),
        mcq('q6', 'Em HSRP/VRRP, qual endereço os hosts configuram como gateway?', 'c', [
          'O IP real do roteador ativo',
          'O IP real do roteador standby',
          'O IP virtual compartilhado pelos roteadores',
          'O IP do servidor DHCP'
        ], 'Com o IP virtual, o failover é transparente: o gateway que os hosts conhecem nunca muda.'),
        mcq('q7', 'Qual a diferença principal entre HSRP e VRRP?', 'a', [
          'HSRP é proprietário da Cisco; VRRP é um padrão aberto',
          'HSRP é para IPv6 e VRRP para IPv4',
          'VRRP não usa IP virtual',
          'HSRP não tem failover'
        ], 'Ambos oferecem gateway virtual redundante; HSRP é Cisco, VRRP é padrão IETF.'),
        fill('q8', 'Qual o padrão de prioridade HSRP/VRRP do slide (valor típico) de um roteador sem configuração?', 'Prioridade padrão = ___', ['100'], 'O valor padrão da prioridade é 100; configura-se mais alto no roteador desejado como ativo.')
      ]
    },
    {
      id: 'rdi-05-roteamento-estatico',
      title: 'Roteamento estático e a tabela de rotas',
      goal: 'Ler uma tabela de rotas, prever qual rota o roteador escolhe e configurar rotas estáticas, padrão e flutuantes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Como o roteador decide',
            'Para cada pacote, o roteador olha o IP de DESTINO e procura na tabela de rotas uma entrada cujo prefixo "contenha" esse endereço. Cada rota diz: para a rede X/prefixo, envie ao próximo salto (next hop, o IP do próximo roteador) ou por uma interface de saída. Rotas conectadas (C) vêm das interfaces com IP configurado; rotas locais (L) são o /32 do próprio IP da interface; rotas estáticas (S) são escritas à mão; as demais vêm de protocolos de roteamento. Se NENHUMA rota casa e não há rota padrão, o pacote é descartado e o roteador pode avisar a origem com ICMP "destination unreachable".'
          ),
          sl(
            'Longest prefix match',
            'Mais de uma rota pode conter o destino. A regra: vence a rota com o prefixo MAIS LONGO (maior número de bits da máscara), isto é, a mais específica. Exemplo: o destino 10.1.2.77 casa com 10.0.0.0/8, com 10.1.0.0/16, com 10.1.2.0/24 e com 0.0.0.0/0; a escolhida é a 10.1.2.0/24. Já 10.1.9.5 casa só com /8, /16 e /0 e usa a /16. O prefixo mais longo vence mesmo que a rota mais curta tenha métrica melhor ou venha de outro protocolo: a comparação de métrica/distância só acontece entre rotas para o MESMO prefixo.',
            'Destino 10.1.2.77:\n  10.0.0.0/8     casa (8 bits)\n  10.1.0.0/16    casa (16 bits)\n  10.1.2.0/24    casa (24 bits)  <-- vence\n  0.0.0.0/0      casa (0 bits)'
          ),
          sl(
            'Rota padrão',
            'A rota padrão (default route) é 0.0.0.0/0: prefixo de zero bits, que casa com QUALQUER destino. Por ter o menor prefixo possível, só é usada quando nada mais específico casa. É o "mande tudo que eu não conheço para lá" — tipicamente a saída para a Internet ou para o provedor. Em roteadores Cisco aparece como "Gateway of last resort" e a letra S* (estática candidata a padrão). Em redes pequenas (borda com um só provedor) basta uma rota padrão; em casa, o gateway do host é exatamente isso.',
            'R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2'
          ),
          sl(
            'Distância administrativa e métrica',
            'Duas ideias diferentes: a distância administrativa (AD) mede a CONFIANÇA na origem da rota e só decide entre rotas de ORIGENS diferentes para o MESMO prefixo — menor AD vence. Valores típicos de Cisco: conectada 0, estática 1, EIGRP 90, OSPF 110, RIP 120. A métrica mede o "custo" dentro do MESMO protocolo (saltos no RIP, custo no OSPF) e decide entre caminhos da mesma origem — menor métrica vence. Na tabela, o par aparece como [AD/métrica]. Empate de métrica entre rotas do mesmo protocolo gera balanceamento de carga entre os caminhos.'
          ),
          sl(
            'Rotas estáticas e rota estática flutuante',
            'Rota estática: o administrador escreve "ip route rede máscara próximo-salto". Vantagens: simples, previsível, sem tráfego de protocolo, ótima para stubs e rota padrão. Desvantagens: manual (cada mudança exige configurar cada roteador), não se adapta sozinha a falhas e não escala. A rota estática flutuante é uma estática com AD ALTA de propósito (ex.: 200), maior que a do protocolo dinâmico: fica escondida enquanto a rota principal existe; se esta some (link caiu), a flutuante entra na tabela como backup. Quando a principal volta, a flutuante sai de novo.',
            'R1(config)# ip route 10.1.3.0 255.255.255.0 10.1.1.3\nR1(config)# ip route 10.1.3.0 255.255.255.0 10.9.9.2 200   ! flutuante (AD 200)'
          ),
          sl(
            'Lendo uma tabela de rotas',
            'Cada linha: código da origem (C, L, S, O...), prefixo, [AD/métrica], via próximo salto, tempo (em rotas dinâmicas) e interface. No exemplo, S* é a rota padrão (via 203.0.113.2), S é uma estática, C a rede diretamente conectada, L o IP local e O uma rota aprendida por OSPF, com AD 110 e custo 20. O "Gateway of last resort" resume a saída padrão.',
            'R1# show ip route\nGateway of last resort is 203.0.113.2 to network 0.0.0.0\n\nS*   0.0.0.0/0 [1/0] via 203.0.113.2\n     10.0.0.0/8 is variably subnetted\nC       10.1.1.0/24 is directly connected, GigabitEthernet0/0\nL       10.1.1.1/32 is directly connected, GigabitEthernet0/0\nS       10.1.2.0/24 [1/0] via 10.1.1.2\nO       10.1.3.0/24 [110/20] via 10.1.1.3, 00:10:05, GigabitEthernet0/0'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um roteador tem as rotas 10.0.0.0/8 (via A), 10.1.0.0/16 (via B), 10.1.2.0/24 (via C) e 0.0.0.0/0 (via D). Para qual próximo salto vai um pacote destinado a 10.1.2.77?', 'b', [
          'A, pois a /8 tem menor número',
          'C, a rota de prefixo mais longo (/24)',
          'D, a rota padrão sempre vence',
          'B, a rota intermediária (/16)'
        ], 'Longest prefix match: a rota mais específica (maior máscara) que contém o destino vence.'),
        mcq('q2', 'Existem uma rota estática (AD 1) e uma rota OSPF (AD 110) para o MESMO prefixo 10.1.3.0/24. Qual entra na tabela?', 'a', [
          'A estática, pois tem menor distância administrativa',
          'A OSPF, pois protocolos dinâmicos são mais confiáveis',
          'As duas, alternando',
          'Nenhuma: o roteador dá erro'
        ], 'Para o mesmo prefixo, vence a menor AD. A estática (1) é mais confiável que a OSPF (110).'),
        mcq('q3', 'Qual é o propósito de uma rota estática flutuante?', 'd', [
          'Balancear o tráfego entre dois links',
          'Ser a rota preferida sobre as dinâmicas',
          'Trocar o IP do gateway automaticamente',
          'Servir de backup: com AD alta, só entra na tabela se a rota principal desaparecer'
        ], 'AD alta de propósito faz a estática ficar "escondida" até a rota melhor sumir.'),
        fill('q4', 'Qual é o tamanho do prefixo da rota padrão IPv4 (0.0.0.0/?)?', 'Rota padrão = 0.0.0.0/___', ['0'], 'A rota padrão tem prefixo /0: casa com todos os destinos e, por ser a menos específica, só é usada se nada mais casar.'),
        mcq('q5', 'Qual é a principal desvantagem das rotas estáticas em redes grandes?', 'c', [
          'Consomem muita CPU para calcular o caminho',
          'Geram muito tráfego de controle',
          'Exigem configuração manual e não se adaptam sozinhas a falhas',
          'Não aceitam rota padrão'
        ], 'Estáticas não geram tráfego nem CPU, mas todo ajuste é manual e elas não reagem a falhas.'),
        mcq('q6', 'Na linha "O 10.1.3.0/24 [110/20] via 10.1.1.3", o que significam 110 e 20?', 'b', [
          'Tempo de vida e tamanho do pacote',
          'Distância administrativa (OSPF) e métrica (custo)',
          'Número de saltos e tempo de espera',
          'Prefixo e máscara'
        ], 'O formato é [AD/métrica]: 110 é a AD do OSPF; 20 é o custo daquela rota.'),
        mcq('q7', 'Com a tabela do slide, para onde R1 envia um pacote destinado a 10.1.2.50?', 'a', [
          'Para 10.1.1.2, pela rota estática 10.1.2.0/24',
          'Para 203.0.113.2, pela rota padrão',
          'Para 10.1.1.3, pela rota OSPF',
          'Descarta o pacote'
        ], '10.1.2.50 pertence a 10.1.2.0/24 (S), mais específica que a /0; o próximo salto é 10.1.1.2.'),
        fill('q8', 'Qual é a distância administrativa padrão de uma rota estática em equipamentos Cisco?', 'AD da rota estática = ___', ['1'], 'Conectada = 0, estática = 1, EIGRP = 90, OSPF = 110, RIP = 120 (valores típicos Cisco).')
      ]
    },
    {
      id: 'rdi-06-roteamento-dinamico',
      title: 'Roteamento dinâmico: RIP, OSPF e EIGRP',
      goal: 'Diferenciar protocolos de vetor de distância e de estado de enlace e entender como RIP, OSPF e EIGRP escolhem caminhos e convergem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'IGP vs EGP e por que dinâmico',
            'Um sistema autônomo (AS) é um conjunto de redes sob a mesma administração. Protocolos que rodam DENTRO de um AS são IGPs (RIP, OSPF, EIGRP, IS-IS); os que trocam rotas ENTRE ASes são EGPs — hoje, o BGP, que sustenta a Internet. Roteamento dinâmico faz os roteadores descobrirem vizinhos, trocarem informações e se adaptarem sozinhos a falhas e novas redes. Compara-se ao estático: escala melhor e reage a mudanças, ao custo de CPU, memória, tráfego de controle e mais configuração de segurança (autenticação entre vizinhos).'
          ),
          sl(
            'Vetor de distância vs estado de enlace',
            'Vetor de distância: cada roteador diz aos vizinhos "conheço a rede X a N de distância" — só conhece o que os vizinhos contam ("roteamento por boato"), sem ver o mapa. É simples, mas converge devagar e pode ter loops. Estado de enlace: cada roteador anuncia a todos o estado dos SEUS enlaces; todos montam o mesmo mapa da área (banco de dados) e cada um calcula, sozinho, o melhor caminho para todo destino. Converge rápido e é mais robusto, mas exige mais CPU e memória e um projeto mais cuidadoso (áreas).'
          ),
          sl(
            'RIP: contagem de saltos',
            'RIP é vetor de distância com métrica = número de saltos (roteadores no caminho). Máximo de 15; 16 significa inalcançável. Envia a tabela inteira a cada 30 s. A versão 2 usa multicast (224.0.0.9) e suporta VLSM; a 1 é classful. Limitações: ignora velocidade (3 saltos em 10 Mb/s "vence" 5 saltos em 10 Gb/s), limite de 15 saltos e convergência lenta. Como o RIP é "boato", pode surgir contagem ao infinito: após uma falha, dois roteadores trocam a rota um com o outro aumentando a métrica até 16. Mitigações: split horizon (não anunciar uma rota de volta pela interface em que foi aprendida), route poisoning (anunciar a rota perdida com métrica 16) e hold-down.',
            'R1# show ip route rip\nR    10.2.0.0/24 [120/1] via 10.1.1.2, 00:00:12, Gi0/0\nR    10.3.0.0/24 [120/2] via 10.1.1.2, 00:00:12, Gi0/0'
          ),
          sl(
            'OSPF: áreas, custo e vizinhança',
            'OSPF é de estado de enlace. Os roteadores descobrem vizinhos com pacotes Hello (parâmetros como área e temporizadores hello/dead precisam combinar) e trocam LSAs (anúncios de estado de enlace) por flooding, até todos da área ter o mesmo LSDB (banco de dados de estado de enlace). Cada roteador roda o algoritmo SPF de Dijkstra sobre esse mapa e obtém a árvore de menores caminhos. A métrica é o custo, que decorre da largura de banda: custo = largura de banda de referência / largura do link (em muitos equipamentos a referência padrão é 100 Mb/s, por isso se costuma ajustá-la em redes rápidas). Menor soma de custos vence. Para escalar, a rede é dividida em áreas; a área 0 (backbone) conecta todas as outras e limita o alcance do flooding.',
            'R1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 10.1.1.0 0.0.0.255 area 0\n\nR1# show ip ospf neighbor\nNeighbor ID  Pri  State     Dead Time  Address    Interface\n2.2.2.2        1  FULL/DR   00:00:35   10.1.1.2   Gi0/0'
          ),
          sl(
            'OSPF: estados da vizinhança e DR/BDR',
            'Vizinhos passam por estados: Down → Init → 2-Way → ExStart → Exchange → Loading → Full; em Full os LSDBs estão sincronizados e há adjacência completa. Em redes de acesso múltiplo (Ethernet com vários roteadores), se todos fizessem adjacência com todos, seriam muitas adjacências e muito flooding. Por isso elege-se um DR (Designated Router) e um BDR (reserva): os demais só formam adjacência Full com eles e enviam as atualizações ao DR. A eleição vale a maior prioridade (padrão 1; 0 nunca é DR) e, em empate, o maior router ID. Cada roteador tem um router ID, um número no formato de IPv4, que o identifica.'
          ),
          sl(
            'EIGRP e convergência',
            'EIGRP, criado pela Cisco, é considerado um vetor de distância avançado (híbrido). Combina métrica composta (por padrão, largura de banda e atraso do caminho) com o algoritmo DUAL: guarda o melhor caminho (successor) e, quando possível, um alternativo já garantido sem loop (feasible successor), trocando para ele quase instantaneamente quando o principal cai, sem recalcular. Usa Hello para vizinhos e atualizações parciais (só o que mudou). Convergência é o tempo até todos os roteadores terem uma visão consistente depois de uma mudança: lenta no RIP, rápida em OSPF e EIGRP — importante porque, durante a convergência, pacotes podem ser perdidos ou entrar em loop.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual protocolo é um EGP, usado para trocar rotas entre sistemas autônomos?', 'c', [
          'OSPF',
          'RIP',
          'BGP',
          'EIGRP'
        ], 'BGP é o EGP da Internet. RIP, OSPF e EIGRP são IGPs, usados dentro de um AS.'),
        mcq('q2', 'Qual a principal diferença entre estado de enlace e vetor de distância?', 'd', [
          'Vetor de distância usa áreas; estado de enlace não',
          'Estado de enlace só funciona em redes pequenas',
          'Vetor de distância calcula o melhor caminho com Dijkstra',
          'No estado de enlace todos os roteadores têm o mapa da área e calculam seus caminhos; no vetor, só se sabe o que os vizinhos anunciam'
        ], 'Vetor = "boatos" dos vizinhos; estado de enlace = mapa completo + SPF local.'),
        mcq('q3', 'Qual a métrica do RIP, e a partir de quanto a rede é considerada inalcançável?', 'a', [
          'Número de saltos; 16',
          'Largura de banda; 100 Mb/s',
          'Custo OSPF; 65535',
          'Atraso; 15 ms'
        ], 'RIP conta saltos: 15 é o máximo alcançável e 16 significa inalcançável.'),
        fill('q4', 'Quantos saltos é o máximo que o RIP considera alcançável?', 'Máximo alcançável no RIP = ___ saltos', ['15'], 'Com 16 = infinito, o limite útil é 15 saltos.'),
        mcq('q5', 'Para a rota ao mesmo destino, o RIP encontra um caminho de 3 saltos em links lentos e outro de 5 saltos em links rápidos. Qual ele escolhe?', 'd', [
          'O de 5 saltos, pois é mais rápido',
          'Os dois, balanceando',
          'Nenhum, pois exige 15 saltos',
          'O de 3 saltos: o RIP só conta saltos e ignora a velocidade'
        ], 'Essa é uma limitação clássica do RIP: a métrica não considera banda nem atraso.'),
        mcq('q6', 'Dois roteadores OSPF na mesma sub-rede não formam vizinhança. Qual causa é plausível?', 'b', [
          'Terem router IDs diferentes',
          'Hello/dead intervals ou números de área diferentes entre eles',
          'Estarem na área 0',
          'Usarem IPs diferentes nos hosts'
        ], 'Hello e dead interval, área e (se configurada) autenticação precisam combinar entre vizinhos. Router IDs devem ser diferentes mesmo.'),
        mcq('q7', 'Para que serve a eleição de DR/BDR no OSPF?', 'c', [
          'Escolher a rota padrão da rede',
          'Escolher o switch raiz do STP',
          'Reduzir o número de adjacências e o flooding em redes de acesso múltiplo',
          'Definir a área 0'
        ], 'Em vez de adjacência completa entre todos os pares, os roteadores só formam adjacência Full com DR e BDR.'),
        fill('q8', 'Qual é o número da área de backbone do OSPF, à qual todas as outras se conectam?', 'Backbone = área ___', ['0', 'área 0', 'area 0'], 'A área 0 é o backbone e liga todas as demais áreas.')
      ]
    },
    {
      id: 'rdi-07-vlsm-sumarizacao',
      title: 'VLSM, CIDR e sumarização de rotas',
      goal: 'Projetar endereçamento com máscaras de tamanhos diferentes e sumarizar blocos contíguos numa única rota.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema da máscara única',
            'Se você usa a mesma máscara em todas as sub-redes, escolhe o tamanho pela MAIOR necessidade e desperdiça o resto. Exemplo: um setor precisa de 100 hosts, outro de 50, outro de 25 e um enlace entre roteadores precisa de 2. Com /25 (126 hosts) para tudo, o enlace de 2 hosts gasta 126 endereços. VLSM (Variable Length Subnet Mask) resolve isso: cada sub-rede recebe a máscara do tamanho certo. É necessário que o protocolo de roteamento anuncie a máscara junto com a rede (classless): RIPv2, OSPF e EIGRP o fazem.'
          ),
          sl(
            'Tamanhos de bloco',
            'Hosts utilizáveis = 2^(32 − prefixo) − 2 (menos rede e broadcast). Tabela útil para o projeto: /25 = 128 endereços (126 hosts), /26 = 64 (62), /27 = 32 (30), /28 = 16 (14), /29 = 8 (6), /30 = 4 (2). Para escolher o prefixo, ache a menor potência de 2 que comporte hosts + 2. Ex.: 50 hosts → 52 → 64 = /26; 25 hosts → 27 → 32 = /27; 2 hosts → 4 = /30. Em enlaces ponto a ponto, também é possível usar /31 (2 endereços, sem rede/broadcast, RFC 3021) para economizar.',
            '/25 -> 128 end. (126 hosts)\n/26 ->  64 end. ( 62 hosts)\n/27 ->  32 end. ( 30 hosts)\n/28 ->  16 end. ( 14 hosts)\n/29 ->   8 end. (  6 hosts)\n/30 ->   4 end. (  2 hosts)'
          ),
          sl(
            'Projeto passo a passo',
            'Regra de ouro: ordene as redes da MAIOR para a MENOR e aloque em sequência, sempre começando no primeiro endereço livre e sem sobrepor; cada bloco começa num endereço múltiplo do seu tamanho (alinhado). Exemplo com 192.168.10.0/24: Vendas (100 hosts) → /25: 192.168.10.0/25 (0–127); TI (50) → /26 a partir do 128: 192.168.10.128/26 (128–191); Admin (25) → /27 a partir do 192: 192.168.10.192/27 (192–223); enlace (2) → /30 a partir do 224: 192.168.10.224/30 (224–227). Sobram 228–255 para crescimento.'
          ),
          sl(
            'Resultado e verificação',
            'Confira cada bloco: o primeiro endereço é a rede, o último é o broadcast; os utilizáveis ficam entre eles. A tabela fecha o projeto. Teste final: nenhuma faixa se sobrepõe e todas estão dentro do /24 original. Para saber a qual sub-rede um IP pertence, compare com as faixas: 192.168.10.150 está entre 128 e 191, logo é da rede de TI (/26).',
            'Rede                   Hosts          Broadcast\n192.168.10.0/25        .1   - .126    .127\n192.168.10.128/26      .129 - .190    .191\n192.168.10.192/27      .193 - .222    .223\n192.168.10.224/30      .225 - .226    .227'
          ),
          sl(
            'CIDR e supernetting',
            'CIDR (Classless Inter-Domain Routing) abandonou as classes A/B/C: o prefixo pode ter qualquer tamanho (/22, /13...), e a notação é endereço/prefixo. Isso permite também a agregação (supernetting): juntar blocos contíguos numa rota mais curta. Condições para agregar N blocos em um: N potência de 2, blocos contíguos e o primeiro alinhado ao tamanho do total. Exemplo: 172.16.0.0/24, 172.16.1.0/24, 172.16.2.0/24 e 172.16.3.0/24 são 4 blocos contíguos e o primeiro está alinhado, então viram 172.16.0.0/22 (172.16.0.0 a 172.16.3.255; máscara 255.255.252.0). Já 192.168.2.0/24 a 192.168.5.0/24 também são 4 blocos contíguos, mas não alinhados: não cabem num só /22 (seriam 2 rotas /23: 192.168.2.0/23 e 192.168.4.0/23).'
          ),
          sl(
            'Sumarização de rotas e cálculo',
            'Sumarização é anunciar UMA rota para um grupo de redes. Benefícios: tabela de roteamento menor, menos memória e CPU, atualizações menores e instabilidade escondida (se uma sub-rede interna oscila, o resto da rede nem percebe). Método de cálculo: escreva em binário o octeto que varia; os bits iguais a todos os blocos, mais os bits fixos dos octetos anteriores, dão o prefixo. 10.1.4.0/24 a 10.1.7.0/24: o terceiro octeto vai de 00000100 a 00000111; 6 bits em comum → 16 + 6 = /22 → 10.1.4.0/22 (wildcard 0.0.3.255). 192.168.8.0/24 a 192.168.15.0/24: 00001000 a 00001111; 5 bits em comum → /21 → 192.168.8.0/21 (máscara 255.255.248.0). Cuidado: o resumo não deve cobrir redes que não são suas (cria buracos negros, black holes, para o tráfego ao endereço não alocado).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual prefixo comporta 50 hosts na menor sub-rede possível?', 'a', [
          '/26 (62 hosts)',
          '/27 (30 hosts)',
          '/25 (126 hosts)',
          '/28 (14 hosts)'
        ], '50 + 2 = 52 → menor potência de 2 maior ou igual: 64 → 2^6 → /26, com 62 hosts utilizáveis.'),
        mcq('q2', 'Na regra de ouro do VLSM, em que ordem alocar as sub-redes?', 'b', [
          'Da menor para a maior',
          'Da maior para a menor',
          'Em ordem alfabética dos departamentos',
          'Em qualquer ordem, pois o resultado é igual'
        ], 'Começar pelos maiores evita fragmentar o espaço e garante blocos alinhados.'),
        mcq('q3', 'No projeto do slide, qual é o endereço de broadcast da rede 192.168.10.192/27?', 'c', [
          '192.168.10.255',
          '192.168.10.191',
          '192.168.10.223',
          '192.168.10.222'
        ], '/27 tem 32 endereços: de .192 a .223. O último (.223) é o broadcast; .222 é o último host.'),
        fill('q4', 'Qual prefixo (apenas o número) atende 100 hosts, com 126 utilizáveis?', 'Rede de 100 hosts = /___', ['25', '/25'], '2^7 = 128 endereços (126 utilizáveis) → 32 − 7 = /25.'),
        mcq('q5', 'No projeto, a qual rede pertence o host 192.168.10.150?', 'd', [
          'Vendas, 192.168.10.0/25',
          'Admin, 192.168.10.192/27',
          'Enlace, 192.168.10.224/30',
          'TI, 192.168.10.128/26 (faixa .128 a .191)'
        ], '150 está entre 128 e 191, intervalo do /26 de TI.'),
        mcq('q6', 'Qual é a sumarização correta de 172.16.0.0/24, 172.16.1.0/24, 172.16.2.0/24 e 172.16.3.0/24?', 'a', [
          '172.16.0.0/22',
          '172.16.0.0/23',
          '172.16.0.0/21',
          '172.16.0.0/16'
        ], '4 blocos de /24 = 1.024 endereços = /22 (172.16.0.0 a 172.16.3.255).'),
        mcq('q7', 'Por que as redes 192.168.2.0/24 a 192.168.5.0/24 NÃO podem virar uma única rota /22?', 'b', [
          'Porque /22 não existe em IPv4',
          'Porque não estão alinhadas: 192.168.2.0/22 não é um endereço de rede válido e o /22 correto incluiria redes que não são suas',
          'Porque a quantidade de blocos não é potência de 2',
          'Porque são redes privadas'
        ], 'São 4 blocos contíguos, mas o primeiro não é múltiplo de 4 no terceiro octeto. Seriam duas rotas /23.'),
        fill('q8', 'Qual é o prefixo que sumariza 10.1.4.0/24 até 10.1.7.0/24 (10.1.4.0/?)?', 'Sumário = 10.1.4.0/___', ['22', '/22'], 'Terceiro octeto de 00000100 a 00000111: 6 bits em comum → 16 + 6 = /22.')
      ]
    },
    {
      id: 'rdi-08-ipv6',
      title: 'IPv6',
      goal: 'Ler e abreviar endereços IPv6, reconhecer seus tipos e entender SLAAC, NDP e a coexistência com IPv4.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o IPv6 existe',
            'O IPv4 tem 32 bits: 2^32 = 4.294.967.296 endereços, insuficientes para tantos dispositivos. O NAT adiou o problema, mas quebrou o modelo fim a fim. O IPv6 tem 128 bits (2^128 endereços) e traz melhorias: cabeçalho de tamanho fixo e mais simples, sem fragmentação feita por roteadores intermediários, autoconfiguração nativa (SLAAC) e suporte nativo a multicast. Não é compatível com IPv4: são duas pilhas de protocolo distintas.'
          ),
          sl(
            'Formato e regras de abreviação',
            'Um endereço IPv6 são 8 grupos de 16 bits, cada um em 4 dígitos hexadecimais, separados por ":". Regras de abreviação: (1) em cada grupo, zeros à esquerda podem ser omitidos; (2) uma sequência de grupos consecutivos todos zero pode ser trocada por "::" — UMA única vez no endereço (senão seria ambíguo); se houver duas sequências, abrevia-se a mais longa (empate: a primeira). ::1 é o loopback; :: é o endereço "não especificado". Para expandir, conte quantos grupos faltam e preencha com zeros no lugar do "::".',
            'Completo : 2001:0db8:0000:0000:0000:ff00:0042:8329\nSem zeros: 2001:db8:0:0:0:ff00:42:8329\nAbreviado: 2001:db8::ff00:42:8329\n\n2001:db8::1:0:0:1 = 2001:0db8:0000:0000:0001:0000:0000:0001'
          ),
          sl(
            'Tipos de endereço',
            'Global unicast (2000::/3): roteável na Internet; é o "público". Link-local (fe80::/10): existe em TODA interface IPv6, só vale no enlace local e nunca é roteado — usado por NDP, roteamento e como próximo salto. ULA, Unique Local Address (fc00::/7; na prática fd00::/8): privado de uso interno, parecido com o RFC 1918, roteável internamente mas não na Internet. Multicast (ff00::/8): um-para-vários; por exemplo ff02::1 é "todos os nós do enlace". NÃO existe broadcast em IPv6: o multicast o substitui, e só quem se interessa processa. Nos exemplos usamos o prefixo reservado para documentação, 2001:db8::/32.'
          ),
          sl(
            'Prefixo e /64',
            'Um endereço IPv6 se divide em prefixo de rede e identificador de interface (IID). Cada sub-rede LAN usa um prefixo /64: 64 bits de rede e 64 de host — o padrão esperado por SLAAC e outros recursos. Um site recebe tipicamente um /48 (ou /56 em casa): sobram 16 bits para sub-redes (2^16 = 65.536 sub-redes /64), cada uma com 2^64 endereços; ninguém economiza endereços de host como no IPv4. Exemplo: com 2001:db8:acad::/48, a VLAN 10 pode usar 2001:db8:acad:10::/64 e a VLAN 20, 2001:db8:acad:20::/64.',
            '2001:db8:acad::/48         (site)\n2001:db8:acad:10::/64      (VLAN 10)\n2001:db8:acad:20::/64      (VLAN 20)\nHost: 2001:db8:acad:10::25/64'
          ),
          sl(
            'SLAAC, DHCPv6 e NDP',
            'SLAAC (Stateless Address Autoconfiguration): o roteador envia periodicamente (ou a pedido) um Router Advertisement (RA) com o prefixo da rede; o host monta o próprio endereço = prefixo + IID, que pode ser derivado do MAC (EUI-64) ou aleatório para privacidade (para não ser rastreável pelo MAC). Antes de usar, o host checa duplicidade (DAD). O DHCPv6 também existe: stateful (atribui endereço, como o DHCP do IPv4) ou stateless (só entrega DNS e outras opções, com o endereço vindo do SLAAC). O NDP (Neighbor Discovery Protocol), via ICMPv6, substitui o ARP: o host manda uma Neighbor Solicitation para o multicast "solicited-node" e o dono do IP responde com Neighbor Advertisement informando seu MAC; também descobre roteadores (RS/RA).',
            'C:\\> ipconfig\nEndereço IPv6 . . . . : 2001:db8:acad:10::25\nEndereço IPv6 de link local : fe80::1c2b:3d4e:5f60:7182%12\nGateway Padrão . . . : fe80::1%12'
          ),
          sl(
            'Convivência com IPv4',
            'A transição é gradual e as técnicas principais são: dual-stack (a máquina/rede roda IPv4 e IPv6 ao mesmo tempo, usando o que o destino suportar), túneis (pacotes IPv6 encapsulados dentro de IPv4 para atravessar trechos só IPv4) e tradução (NAT64, em conjunto com DNS64, deixa clientes só IPv6 alcançarem servidores só IPv4). Dual-stack é a abordagem mais comum, mas mantém duas superfícies a proteger: regras de firewall e ACL precisam existir para os dois protocolos. Teste conectividade com "ping -6" (ou "ping" com endereço IPv6) e, no Linux, veja endereços com "ip -6 addr".'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o tamanho de um endereço IPv6?', 'd', [
          '32 bits',
          '64 bits',
          '48 bits',
          '128 bits'
        ], 'IPv6 usa 128 bits, escritos como 8 grupos de 16 bits em hexadecimal.'),
        mcq('q2', 'Qual das formas abaixo NÃO é um endereço IPv6 válido?', 'c', [
          '2001:db8::ff00:42:8329',
          '2001:db8:0:0:1::1',
          '2001:db8::1::1',
          '::1'
        ], 'O "::" só pode aparecer UMA vez; com dois, não dá para saber quantos zeros cada um representa.'),
        mcq('q3', 'Qual a forma abreviada correta de 2001:0db8:0000:0000:0000:ff00:0042:8329?', 'b', [
          '2001:db8:0:0:0:ff00:42:8329::',
          '2001:db8::ff00:42:8329',
          '2001:db8::ff:42:8329',
          '2001::db8:ff00:42:8329'
        ], 'Omitem-se zeros à esquerda (0db8 → db8, 0042 → 42) e os três grupos zero viram "::". Cuidado: ff00 não pode virar ff.'),
        fill('q4', 'Qual é o prefixo dos endereços link-local IPv6 (fe80::/?)?', 'Link-local = fe80::/___', ['10', '/10'], 'Link-local é fe80::/10, presente em toda interface IPv6, válido só no enlace local.'),
        mcq('q5', 'Como o IPv6 faz o "avisar todos do enlace", já que não tem broadcast?', 'b', [
          'Usando ARP com endereços maiores',
          'Usando multicast, como ff02::1 (todos os nós do enlace)',
          'Usando o endereço :: para todos',
          'Usando unicast para cada host'
        ], 'Multicast substitui o broadcast: só os dispositivos interessados processam o pacote.'),
        mcq('q6', 'Um site recebeu 2001:db8:acad::/48. Quantas sub-redes /64 pode criar?', 'a', [
          '65.536 (2^16)',
          '256',
          '4.096',
          '16'
        ], '64 − 48 = 16 bits de sub-rede; 2^16 = 65.536.'),
        mcq('q7', 'Como um host configura seu endereço global por SLAAC?', 'd', [
          'Pedindo ao DHCP um endereço do pool',
          'Usando só o link-local',
          'Pedindo ao administrador',
          'Recebendo o prefixo no Router Advertisement e montando prefixo + IID, com checagem de duplicidade'
        ], 'O RA entrega o prefixo; o host cria o IID (EUI-64 ou aleatório) e faz DAD.'),
        fill('q8', 'Qual protocolo do IPv6 (sigla) substitui o ARP, resolvendo endereço IP em MAC por meio do ICMPv6?', 'Substituto do ARP no IPv6 = ___', ['NDP', 'ND', 'Neighbor Discovery', 'Neighbor Discovery Protocol'], 'O NDP usa Neighbor Solicitation/Advertisement (ICMPv6) para resolver endereços e descobrir roteadores.')
      ]
    },
    {
      id: 'rdi-09-acls-firewalls',
      title: 'ACLs e firewalls',
      goal: 'Escrever e interpretar regras de filtragem, entendendo ordem, deny implícito, stateless vs stateful, DMZ e menor privilégio.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Filtragem de pacotes',
            'Filtrar pacotes é decidir, para cada pacote, permitir ou negar com base em campos do cabeçalho: IP de origem, IP de destino, protocolo (TCP, UDP, ICMP) e portas. O filtro é aplicado em uma interface, numa direção: entrada (in, pacotes que CHEGAM na interface, antes do roteamento) ou saída (out, pacotes que SAEM dela). Uma lista de regras assim, em roteadores e switches L3, chama-se ACL (Access Control List). Também são usadas para escolher quais redes entram em NAT, em VPN e em QoS, mas o uso mais comum é segurança.'
          ),
          sl(
            'ACL padrão vs ACL estendida',
            'A ACL padrão (numeradas de 1 a 99) filtra SÓ pelo IP de origem: é simples, mas grosseira. A estendida (100 a 199) filtra por origem, destino, protocolo e portas: permite regras como "a rede de vendas só acessa o servidor web na porta 443". Também existem ACLs nomeadas, mais legíveis. Na ACL Cisco, a máscara é um wildcard: bit 0 = "precisa casar", bit 1 = "ignorar", ou seja, o inverso da máscara de sub-rede: /24 (255.255.255.0) = 0.0.0.255; /27 (255.255.255.224) = 0.0.0.31. A palavra host vale wildcard 0.0.0.0 e any vale "qualquer endereço". Posicionamento clássico: padrão perto do DESTINO (ela só vê a origem), estendida perto da ORIGEM (para barrar cedo o que não deve circular).',
            'access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 198.51.100.10 eq 443\naccess-list 110 permit icmp 192.168.10.0 0.0.0.255 any\naccess-list 110 deny ip any any log\n\ninterface gi0/1\n ip access-group 110 in'
          ),
          sl(
            'Ordem das regras e deny implícito',
            'A ACL é lida de cima para baixo e a PRIMEIRA regra que casa decide; as seguintes nem são olhadas. Logo, as regras mais específicas vêm antes das gerais: se você coloca "permit ip any any" no topo, nada abaixo (nem um deny) tem efeito. Ao final de toda ACL existe um deny implícito: tudo o que não casou com nenhuma regra é negado, mesmo sem aparecer escrito. Consequências: uma ACL só com regras deny bloqueia TUDO (falta um permit), e esquecer de permitir o tráfego necessário (como respostas ou DNS) o derruba. Escrever um "deny ip any any log" explícito no final permite registrar o que foi barrado.'
          ),
          sl(
            'Stateless vs stateful',
            'Um filtro stateless (ACL tradicional) avalia cada pacote isoladamente, sem memória: para a rede interna navegar, você precisa permitir a ida (saída para a porta 443) E a volta (entrada vinda da porta 443), e a volta aberta demais vira brecha. Um firewall stateful guarda uma tabela de conexões: se a conexão foi iniciada de dentro e permitida, as respostas são aceitas automaticamente; pacotes de fora que não pertencem a nenhuma conexão conhecida são descartados. Por isso, firewalls modernos permitem a saída por regra e a volta "por estado", tornando as regras menores e mais seguras.'
          ),
          sl(
            'Zonas, DMZ e menor privilégio',
            'Firewalls agrupam interfaces em zonas de confiança: inside (rede interna, alta confiança), outside (Internet, nenhuma) e DMZ (rede intermediária, onde ficam servidores que precisam ser acessíveis de fora, como web e e-mail). Política típica: inside → outside permitido (por estado), outside → DMZ só nas portas do serviço, outside → inside negado, DMZ → inside negado (se um servidor da DMZ for comprometido, o invasor não alcança a rede interna). O princípio guia é o do menor privilégio: negar tudo por padrão e permitir só o mínimo necessário, para quem precisa, pelo tempo necessário, revisando as regras periodicamente e removendo as que não servem mais.',
            'Internet --[outside]-- FIREWALL --[DMZ]    servidor web 203.0.113.x (porta 443)\n                           |\n                           +-----[inside]  rede interna 192.168.0.0/16'
          ),
          sl(
            'NGFW em visão geral',
            'Firewalls de nova geração (NGFW) somam ao filtro stateful: identificação de aplicações (reconhecem o aplicativo mesmo em portas incomuns, regras como "bloquear transferência de arquivos nesta aplicação"), prevenção de intrusão (IPS, que reconhece assinaturas de ataques), filtro de URL/categoria e integração com identidade de usuários. Para ver dentro do tráfego HTTPS, alguns inspecionam TLS, "abrindo" a conexão com um certificado próprio — o que pode expor dados pessoais e exige política clara, transparência com os usuários e exceções para dados sensíveis (saúde, bancos), em linha com a LGPD. Mais recursos aumentam a superfície de ataque e exigem atualização constante.'
          ),
          sl(
            'iptables e nftables em visão geral',
            'No Linux, o filtro de pacotes vive no kernel (Netfilter) e é configurado por iptables (clássico) ou nftables (sucessor, com sintaxe unificada). As regras ficam em cadeias (chains): INPUT (pacotes destinados à própria máquina), OUTPUT (gerados por ela) e FORWARD (que apenas passam por ela, como em um roteador). Cada cadeia tem uma política padrão (ACCEPT ou DROP). A prática segura é política DROP, aceitar o que pertence a conexões já estabelecidas (estado) e abrir só o necessário, como SSH apenas da rede de administração.',
            'iptables -P INPUT DROP\niptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT\niptables -A INPUT -p tcp --dport 22 -s 192.168.10.0/24 -j ACCEPT\niptables -A INPUT -i lo -j ACCEPT'
          )
        ]
      },
      questions: [
        mcq('q1', 'Que campos uma ACL padrão (1–99) consegue examinar?', 'b', [
          'Origem, destino e porta',
          'Somente o IP de origem',
          'Somente a porta de destino',
          'O conteúdo da aplicação'
        ], 'A padrão olha só a origem; para destino e portas é preciso uma estendida.'),
        mcq('q2', 'Numa ACL, a primeira linha é "permit ip any any" e a segunda é "deny tcp any any eq 23". O que acontece com o Telnet (TCP 23)?', 'c', [
          'É bloqueado, pois o deny é mais específico',
          'É bloqueado, pois o deny implícito vale',
          'É permitido: a primeira regra casa e as demais nunca são avaliadas',
          'A ACL é rejeitada pelo roteador'
        ], 'A ordem importa: a primeira regra que casa decide. O deny específico deveria vir antes do permit geral.'),
        mcq('q3', 'Uma ACL tem só "permit tcp any host 198.51.100.10 eq 443". O que acontece com um ping (ICMP) para essa rede?', 'd', [
          'É permitido, pois o ICMP é leve',
          'É permitido apenas na volta',
          'É permitido se vier de dentro',
          'É negado pelo deny implícito no fim da ACL'
        ], 'Tudo o que não casa com nenhuma regra é negado pelo deny implícito.'),
        fill('q4', 'Que regra existe no fim de toda ACL mesmo sem estar escrita?', 'Ao final de toda ACL há um ___ implícito', ['deny', 'deny any', 'deny ip any any', 'deny implícito'], 'O deny implícito nega tudo o que nenhuma regra anterior permitiu.'),
        mcq('q5', 'Qual a diferença essencial entre um filtro stateful e um stateless?', 'a', [
          'O stateful guarda uma tabela de conexões e aceita respostas de conexões legítimas automaticamente',
          'O stateful só funciona em IPv6',
          'O stateless inspeciona o conteúdo das aplicações',
          'O stateless é mais seguro que o stateful'
        ], 'O stateful tem memória do estado das conexões; o stateless avalia cada pacote sozinho.'),
        mcq('q6', 'Qual política de firewall é típica para uma DMZ?', 'c', [
          'DMZ → inside permitido, para facilitar a gestão',
          'Outside → inside permitido nas portas 80 e 443',
          'Outside → DMZ só nas portas do serviço; DMZ → inside negado',
          'Tudo permitido entre as zonas'
        ], 'Servidores expostos ficam isolados: se forem comprometidos, não alcançam a rede interna.'),
        mcq('q7', 'Qual a política mais segura para a cadeia INPUT de um servidor Linux?', 'a', [
          'Política DROP, aceitando estados estabelecidos e só as portas necessárias',
          'Política ACCEPT, bloqueando portas conhecidas',
          'Sem regras, confiando na rede',
          'Política DROP e nenhuma exceção, mesmo para respostas'
        ], 'Negar por padrão e abrir o mínimo é o princípio do menor privilégio; sem permitir ESTABLISHED, nem as respostas voltariam.'),
        fill('q8', 'Qual é o wildcard de uma sub-rede /27 (máscara 255.255.255.224) em uma ACL?', 'access-list 10 permit 192.168.10.0 ___', ['0.0.0.31'], 'Wildcard = inverso da máscara: 255 − 224 = 31, ou seja, 0.0.0.31.')
      ]
    },
    {
      id: 'rdi-10-nat-avancado',
      title: 'NAT avançado e port forwarding',
      goal: 'Distinguir SNAT/DNAT/PAT, ler a tabela de traduções e entender hairpin, CGNAT e por que NAT não é firewall.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Estático, dinâmico e PAT',
            'NAT estático: um IP privado é traduzido sempre para o MESMO IP público (1:1); é usado para servidores que precisam ser alcançados de fora. NAT dinâmico: os IPs privados usam, enquanto precisam, um IP de um pool público (também 1:1, mas temporário); se o pool acaba, novos hosts ficam sem saída. PAT (NAT overload): vários IPs privados compartilham UM IP público, distinguidos por portas de origem diferentes; é o NAT das casas e empresas. Termos Cisco: inside local (IP interno real), inside global (como o host interno aparece na Internet), outside (o destino).'
          ),
          sl(
            'SNAT e DNAT',
            'SNAT (Source NAT) altera o IP (e porta) de ORIGEM: é o NAT de saída, quando a rede interna acessa a Internet. No Linux, MASQUERADE é um SNAT que usa automaticamente o IP atual da interface de saída. DNAT (Destination NAT) altera o IP (e porta) de DESTINO: é o NAT de entrada, base do port forwarding (encaminhamento de portas): "quem chegar em 203.0.113.10:8080 vai para 192.168.1.50:80". Os dois são aplicados em momentos diferentes: DNAT antes do roteamento (PREROUTING) e SNAT depois (POSTROUTING).',
            '# saída: SNAT via MASQUERADE\niptables -t nat -A POSTROUTING -o eth0 -s 192.168.1.0/24 -j MASQUERADE\n\n# entrada: DNAT (port forwarding)\niptables -t nat -A PREROUTING -i eth0 -p tcp -d 203.0.113.10 --dport 8080 -j DNAT --to-destination 192.168.1.50:80'
          ),
          sl(
            'A tabela de traduções',
            'O roteador/firewall guarda uma tabela de conexões (NAT table, conntrack): cada linha associa IP:porta interno ↔ IP:porta público ↔ destino, com temporizador. Quando a resposta volta, o roteador consulta a tabela e desfaz a tradução. Sem entrada na tabela, um pacote vindo de fora não tem para onde ir e é descartado — esse é o motivo pelo qual hosts atrás de NAT não são alcançáveis "de graça". Um IP público pode ter até cerca de 65 mil portas por protocolo; muitos hosts fazendo muitas conexões esgotam as portas (port exhaustion) e novas conexões falham.',
            'Router# show ip nat translations\nPro Inside global       Inside local        Outside local      Outside global\ntcp 203.0.113.10:1025   192.168.1.20:51000  198.51.100.7:443   198.51.100.7:443\ntcp 203.0.113.10:1026   192.168.1.21:40222  198.51.100.7:443   198.51.100.7:443'
          ),
          sl(
            'Hairpin NAT',
            'Problema: um servidor interno (192.168.1.50) é publicado por port forwarding no IP público. Um cliente DA REDE INTERNA tenta acessar pelo IP público. O pacote vai ao roteador, sofre DNAT e é entregue ao servidor, mas o servidor vê a origem interna e responde DIRETO ao cliente, sem passar pelo roteador; o cliente recebe uma resposta de um IP que não era o que ele contactou e a descarta. O hairpin NAT (NAT loopback) resolve fazendo o roteador aplicar também SNAT nesse tráfego, para a resposta voltar por ele. Alternativa comum e mais simples: split-horizon DNS, em que o nome resolve para o IP privado dentro da rede e para o público fora.'
          ),
          sl(
            'NAT e protocolos com IP no payload',
            'O NAT altera IPs e portas nos CABEÇALHOS. Mas alguns protocolos escrevem IP/porta também DENTRO dos dados: no FTP em modo ativo, o cliente informa pelo canal de controle o próprio IP e porta para o servidor conectar de volta; em SIP/VoIP, o SDP carrega os endereços de mídia. Se o NAT não reescreve esses valores, o outro lado tenta o IP privado e falha. Soluções: ALG (Application Layer Gateway), um módulo do NAT que reescreve o payload desse protocolo; protocolos com travessia de NAT (STUN/ICE para voz e vídeo); e modos que evitam o problema (FTP passivo, em que o cliente inicia as duas conexões). Também há protocolos de túnel que sofrem com NAT e precisam de adaptações como o NAT-T do IPsec.'
          ),
          sl(
            'CGNAT',
            'Com os IPv4 escassos, provedores usam CGNAT (Carrier-Grade NAT): um mesmo IP público compartilhado por MUITOS clientes, que recebem um IP privado do provedor, normalmente do bloco reservado 100.64.0.0/10 (espaço compartilhado, RFC 6598). O cliente fica atrás de dois NATs (o do provedor e o do roteador dele). Impactos: não é possível fazer port forwarding (a porta pública não pertence ao cliente), jogos e P2P podem ter dificuldades, e um IP compartilhado pode sofrer bloqueio por causa de outro cliente. Para identificar um assinante o provedor precisa guardar IP, porta e horário das traduções: são dados pessoais, com finalidade e retenção definidas (LGPD).'
          ),
          sl(
            'IPv6 e "NAT não é firewall"',
            'Com 2^128 endereços, cada dispositivo pode ter um endereço global, e o NAT deixa de ser necessário em IPv6 (existem traduções de prefixo, mas raramente são necessárias). Cuidado com a ideia errada: NAT NÃO É firewall. Ele bloqueia conexões de fora como efeito colateral (falta de entrada na tabela), não por política; qualquer port forwarding ou DNAT estático abre a porta; o NAT não impede malware dentro da rede de falar para fora; e recursos como o UPnP podem abrir portas automaticamente, sem o administrador perceber. A proteção real é o firewall stateful com política "negar por padrão", que em IPv6 precisa estar ativo justamente porque os hosts têm endereços globais.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual tipo de NAT permite que vários hosts privados compartilhem UM único IP público, diferenciados por portas?', 'c', [
          'NAT estático',
          'NAT dinâmico com pool',
          'PAT (NAT overload)',
          'NAT64'
        ], 'PAT traduz IP e porta, e por isso muitos hosts cabem em um endereço público.'),
        mcq('q2', 'O que o port forwarding (DNAT) faz com um pacote que chega de fora ao IP público na porta 8080?', 'a', [
          'Altera o IP/porta de DESTINO para o servidor interno e encaminha',
          'Altera o IP de origem para o do roteador',
          'Bloqueia o pacote',
          'Apaga a porta e entrega ao roteador'
        ], 'DNAT reescreve o destino: público:8080 → privado:80, por exemplo.'),
        mcq('q3', 'Por que um pacote vindo da Internet para um host interno, sem conexão iniciada por ele, normalmente é descartado atrás de um NAT?', 'b', [
          'Porque o NAT criptografa o tráfego',
          'Porque não existe entrada na tabela de traduções que diga para onde enviá-lo',
          'Porque o IP privado é inválido',
          'Porque o DNS recusa'
        ], 'Sem entrada na tabela, não há como traduzir o destino. É um efeito colateral, não uma política de segurança.'),
        fill('q4', 'Qual a sigla do NAT que altera o IP de DESTINO de pacotes entrando (base do port forwarding)?', 'iptables -t nat -A PREROUTING ... -j ___', ['DNAT'], 'DNAT = Destination NAT; usado no PREROUTING, antes da decisão de roteamento.'),
        mcq('q5', 'Qual problema o hairpin NAT resolve?', 'd', [
          'Esgotamento de portas do IP público',
          'Falta de endereços IPv4',
          'Tradução entre IPv4 e IPv6',
          'Clientes internos que acessam o servidor interno pelo IP público e recebem a resposta direta do servidor, que descartam'
        ], 'Com SNAT adicional, a resposta passa de volta pelo roteador. Alternativa: split-horizon DNS.'),
        mcq('q6', 'Por que o FTP em modo ativo tem problemas atrás de NAT?', 'a', [
          'O IP e a porta de retorno vão dentro dos dados do protocolo, e o NAT altera só os cabeçalhos',
          'O FTP usa UDP',
          'O FTP não funciona com IPv4',
          'O NAT bloqueia a porta 21'
        ], 'O servidor tentaria conectar no IP privado informado no payload. Soluções: ALG ou FTP passivo.'),
        mcq('q7', 'Qual afirmação sobre NAT e segurança é correta?', 'd', [
          'NAT substitui o firewall',
          'NAT em IPv6 é obrigatório para segurança',
          'Com port forwarding configurado, a porta continua inacessível de fora',
          'NAT não é um firewall: bloquear conexões de fora é só efeito colateral, e um firewall stateful com negar por padrão é a proteção real'
        ], 'O port forwarding abre a porta de propósito; segurança exige política de firewall.'),
        fill('q8', 'O CGNAT costuma usar o bloco 100.64.0.0/___ (espaço compartilhado). Qual o prefixo?', 'Bloco CGNAT = 100.64.0.0/___', ['10', '/10'], '100.64.0.0/10 vai de 100.64.0.0 a 100.127.255.255 e é reservado para uso compartilhado de provedores.')
      ]
    },
    {
      id: 'rdi-34-acesso-internet-ultima-milha',
      title: 'Acesso à internet: a última milha',
      goal: 'Conhecer as tecnologias de acesso (DSL, cabo, fibra, rádio, satélite, móvel), entender PPPoE e MTU, CGNAT e como diferenciar velocidade contratada de velocidade real.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ISP, CPE e última milha',
            'O ISP (Internet Service Provider, o provedor) vende a conexão com a internet. A última milha é o trecho final entre a infraestrutura do provedor e o imóvel do cliente: costuma ser o mais caro de construir e o que mais varia de tecnologia. O CPE (Customer Premises Equipment) é o equipamento que fica no cliente: modem, ONT (fibra), roteador Wi-Fi ou um aparelho que faz tudo isso junto. Do outro lado, o provedor agrega milhares de clientes em sua rede (acesso, agregação e backbone) e se conecta ao resto da internet por trânsito e por troca de tráfego com outras redes. A tecnologia da última milha define limites de velocidade, de latência e de estabilidade.'
          ),
          sl(
            'xDSL: par de cobre',
            'DSL usa o par de fios de cobre da linha telefônica, mas em frequências bem acima da voz. ADSL e VDSL são as variantes mais conhecidas. Duas regras físicas: (1) distância e atenuação: quanto mais longo o fio até a central, mais o sinal enfraquece e menor a velocidade possível (VDSL rende mais em trechos curtos); (2) assimetria: no ADSL o download é bem maior que o upload, porque o espectro é dividido em faixas diferentes para cada sentido. Cada cliente tem seu par próprio até a central, então a velocidade DSL não é dividida com os vizinhos nesse trecho, mas ruído e qualidade do fio influenciam bastante.'
          ),
          sl(
            'Cabo coaxial (DOCSIS) e fibra (GPON)',
            'Cabo coaxial (padrão DOCSIS, o mesmo cabeamento da TV a cabo): o meio é COMPARTILHADO entre os clientes de um mesmo segmento do bairro, então em horários de pico a velocidade real pode cair se os vizinhos usam muito. Fibra até a casa (FTTH) em redes GPON: na central do provedor fica a OLT; dela sai UMA fibra que chega a um splitter óptico passivo (sem energia elétrica, apenas divide a luz) e se ramifica para várias casas; em cada casa fica uma ONT, que converte luz em Ethernet. A fibra tem enorme capacidade e pouca atenuação por distância se comparada ao cobre. Muitos planos de fibra de massa são assimétricos (mais download que upload); existem também planos simétricos, geralmente corporativos. O trecho até o splitter é compartilhado, mas a ONT só transmite nos intervalos de tempo que a OLT reserva a ela.',
            'Central do provedor            Rua              Casa\n[OLT] ---- fibra ---- [splitter passivo] ---- fibra ---- [ONT] --- roteador\n                      |---- fibra ---- [ONT] (outro cliente)'
          ),
          sl(
            'Rádio, satélite e redes móveis',
            'Rádio/FWA (Fixed Wireless Access): o provedor leva o sinal por rádio de uma torre até uma antena no imóvel; útil onde não há cabo nem fibra, mas depende de visada, clima e da carga da torre. Satélite: a antena fala com um satélite. Em órbita GEO (geoestacionária, muito alta, ao redor de 35 mil km) o satélite cobre grandes áreas, mas a viagem de ida e volta do sinal soma centenas de milissegundos de latência (ruim para voz e jogos). Em órbita LEO (baixa) a distância é muito menor e a latência é bem mais baixa, mas é preciso uma constelação com muitos satélites. Redes móveis (4G/5G) também servem de acesso: o plano de dados no celular ou um roteador móvel; a capacidade é dividida entre os usuários da célula e a qualidade varia com sinal e movimento.'
          ),
          sl(
            'PPPoE, MTU 1492 e MSS',
            'PPPoE (PPP over Ethernet) encapsula uma sessão PPP dentro de quadros Ethernet entre o CPE e o provedor. Serve para autenticar o assinante (usuário e senha com PAP ou CHAP) e para controlar a sessão (o provedor atribui o IP e pode medir a conexão). O encapsulamento adiciona 8 bytes (6 do PPPoE + 2 do PPP) em cada pacote, então a MTU útil cai de 1500 para 1492 bytes. O MSS (maior segmento TCP) acompanha: 1492 - 20 (IP) - 20 (TCP) = 1452 bytes. Problema clássico: se hosts mandam pacotes de 1500 bytes com DF (não fragmentar) e o ICMP de "fragmentação necessária" é bloqueado, as conexões travam em páginas grandes, embora ping simples funcione. Solução usual: o roteador faz MSS clamping, reescrevendo o MSS do SYN para 1452. Hoje muitas redes de fibra entregam IP por DHCP e dispensam o PPPoE, mas ele ainda é comum.',
            'Ethernet: 1500 (MTU)\n  PPPoE (6) + PPP (2) = 8 bytes de cabeçalho\n  MTU do enlace PPPoE = 1500 - 8 = 1492\n  MSS TCP = 1492 - 20 - 20 = 1452'
          ),
          sl(
            'IP dinâmico, fixo, CGNAT e IPv6',
            'IP dinâmico: o provedor atribui um endereço público que pode mudar (ao religar o equipamento ou depois de um tempo). IP fixo: o endereço é sempre o mesmo, necessário para hospedar serviço próprio de forma estável (geralmente custa à parte). CGNAT (já visto em NAT avançado): muitos clientes compartilham um IP público; o roteador recebe do provedor um endereço da faixa 100.64.0.0/10 ou outro privado na interface WAN. Sinal claro de CGNAT: o IP da WAN do roteador é DIFERENTE do IP público que sites de teste mostram. Impacto: port forwarding não funciona, porque a porta pública não pertence ao cliente; é preciso pedir IP público (ou fixo) ao provedor ou usar uma conexão de saída (túnel/VPN/nuvem). IPv6 no acesso: o provedor entrega um prefixo IPv6 (cada dispositivo ganha endereço global), sem NAT; para hospedar serviços não é preciso port forwarding, mas é obrigatório ter firewall ativo permitindo apenas o necessário.',
            'Roteador - status:\n  WAN (IPv4):            100.72.5.9\n  IP público (site teste): 203.0.113.50\n# diferentes -> o provedor usa CGNAT'
          ),
          sl(
            'SLA, medição e modo do roteador',
            'Velocidade contratada é a taxa máxima do plano; a real depende de Wi-Fi, do aparelho, do servidor testado, do horário (meio compartilhado) e do congestionamento. Para medir direito: use cabo Ethernet, nada mais baixando, e repita em horários diferentes, com mais de um servidor de teste; velocidade em Wi-Fi mede o Wi-Fi, não o provedor. O SLA (acordo de nível de serviço) é o contrato que define disponibilidade, tempo de reparo e, às vezes, latência e perda garantidas; planos corporativos costumam ter SLA mais forte que os residenciais. Roteador do provedor: é comum o equipamento já fazer NAT e Wi-Fi. Se você coloca o SEU roteador atrás dele, acontece NAT duplo (dificulta port forwarding e jogos). Duas saídas: colocar o equipamento do provedor em modo bridge (ele só repassa, e o seu roteador faz o NAT, ou o PPPoE) ou usar o seu como ponto de acesso. Troque a senha padrão de administração do equipamento, mantenha o firmware atualizado e desative a gerência remota se não for usada.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é a "última milha" de uma rede de acesso?', 'b', [
          'O backbone que liga os provedores entre si',
          'O trecho final entre a rede do provedor e o imóvel do cliente, terminado no CPE',
          'A última etapa do handshake TCP',
          'O cabo entre o roteador e o notebook, dentro de casa'
        ], 'A última milha é o enlace provedor-cliente (cobre, coaxial, fibra, rádio...). O CPE é o equipamento do cliente nessa ponta.'),
        mcq('q2', 'Qual tecnologia de acesso perde velocidade com o aumento do comprimento do par de cobre até a central, por causa da atenuação?', 'd', [
          'GPON, pois o splitter enfraquece o sinal',
          'DOCSIS, pois o meio é compartilhado',
          'Satélite GEO, pois o sinal viaja muito longe',
          'xDSL (ADSL/VDSL)'
        ], 'No DSL, quanto mais longe da central, maior a atenuação e menor a velocidade possível. O DOCSIS tem outro problema: o meio é compartilhado entre vizinhos.'),
        mcq('q3', 'Qual a vantagem típica de um satélite LEO sobre um GEO para voz e jogos?', 'a', [
          'Menor latência, pois a distância até o satélite é muito menor',
          'Não precisa de antena',
          'Não sofre com o clima',
          'Dispensa a constelação de satélites'
        ], 'GEO está muito alto e a ida e volta soma centenas de milissegundos. LEO é bem mais baixo, com latência bem menor, em troca de precisar de muitos satélites.'),
        fill('q4', 'Qual a MTU, em bytes, de um enlace PPPoE sobre Ethernet (1500 - 8 de cabeçalhos PPPoE/PPP)?', 'MTU PPPoE = ___ bytes', ['1492', '1492 bytes'], '6 bytes do PPPoE + 2 do PPP = 8; 1500 - 8 = 1492.'),
        mcq('q5', 'No GPON, qual o papel do splitter óptico?', 'c', [
          'Converte luz em Ethernet na casa do cliente',
          'Autentica o assinante com usuário e senha',
          'Divide, de forma passiva e sem energia elétrica, a luz de uma fibra entre várias casas',
          'Faz NAT de vários clientes'
        ], 'A OLT fica na central, o splitter passivo ramifica a fibra e a ONT, na casa, converte luz em Ethernet.'),
        mcq('q6', 'O roteador mostra WAN = 100.72.5.9, mas um site de teste informa seu IP como 203.0.113.50. O que isso indica?', 'b', [
          'Que o IP está sendo falsificado',
          'Que o provedor usa CGNAT: o IP da WAN é privado/compartilhado e port forwarding não vai funcionar',
          'Que o roteador está em modo bridge e tem IP fixo',
          'Que o DNS está errado'
        ], 'WAN diferente do IP público visto de fora é sinal de CGNAT. Para hospedar serviço, peça IP público ou fixo ao provedor, ou use um túnel de saída.'),
        mcq('q7', 'Você colocou seu roteador atrás do equipamento do provedor, que também faz NAT, e o port forwarding não funciona. Qual a explicação e a correção mais comuns?', 'd', [
          'O PPPoE não permite port forwarding; troque de provedor',
          'A MTU de 1492 bloqueia as portas; reduza para 1300',
          'A velocidade contratada está acima da real; peça SLA maior',
          'NAT duplo: ponha o equipamento do provedor em modo bridge ou use o seu como ponto de acesso'
        ], 'Dois NATs em cascata exigem forwarding nos dois. No modo bridge o equipamento do provedor só repassa e o seu roteador faz o NAT.'),
        fill('q8', 'Qual o MSS TCP ideal, em bytes, com MTU 1492 (cabeçalhos de 20 bytes de IP e 20 de TCP)?', 'MSS = 1492 - 20 - 20 = ___', ['1452', '1452 bytes'], '1492 - 40 = 1452 bytes. O MSS clamping reescreve o MSS do SYN para esse valor.')
      ]
    },
    {
      id: 'rdi-11-dns-avancado',
      title: 'DNS avançado',
      goal: 'Entender zonas, delegação, tipos de registro, TTL, split-horizon, ler a saída do dig e conhecer DoT, DoH e DNSSEC.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Zonas e delegação',
            'O DNS é uma hierarquia: raiz (.) → TLDs (.com, .br) → domínios (example.com) → subdomínios. Uma zona é a parte desse espaço administrada por um mesmo conjunto de servidores. A delegação é o mecanismo que passa a responsabilidade para baixo: o servidor da zona .com guarda registros NS dizendo "example.com é responsabilidade destes servidores". Se o servidor de nomes está dentro do próprio domínio (ns1.example.com), o pai também guarda um glue record (o IP desse servidor), para evitar um círculo de dependência. Um domínio pode também delegar um subdomínio (lab.example.com) a outros servidores.'
          ),
          sl(
            'Autoritativo vs recursivo',
            'Servidor autoritativo: guarda os dados da zona e responde com autoridade (a resposta traz o flag aa). Servidor recursivo (resolvedor): recebe a pergunta do cliente e a resolve em nome dele, percorrendo a hierarquia: pergunta à raiz, que responde com uma indicação (referral: registros NS do TLD); pergunta ao TLD, que indica os NS de example.com; pergunta a estes, que respondem com o dado. Guarda o resultado em cache pelo TTL. O cliente (stub resolver) só faz uma pergunta recursiva ao seu resolvedor (do provedor, da empresa ou público). Em geral, um servidor não deveria ser recursivo aberto para a Internet inteira (risco de abuso em ataques de amplificação).'
          ),
          sl(
            'Registros: SOA, NS, PTR, SRV e CAA',
            'SOA (Start of Authority): um por zona; traz servidor primário, e-mail do responsável, serial (número que cresce a cada alteração e avisa os secundários), refresh, retry, expire e o TTL negativo. NS: lista os servidores autoritativos da zona. PTR: resolve IP → nome (consulta reversa). SRV: localiza serviços, informando prioridade, peso, porta e servidor (_serviço._protocolo.nome). CAA: define quais autoridades certificadoras podem emitir certificados para o domínio, uma defesa contra emissões indevidas.',
            'example.com.  3600 IN SOA ns1.example.com. admin.example.com. (\n                2024010101 ; serial\n                7200       ; refresh\n                900        ; retry\n                1209600    ; expire\n                300 )      ; TTL negativo\nexample.com.  3600 IN NS   ns1.example.com.\n_sip._tcp.example.com. 3600 IN SRV 10 60 5060 sip.example.com.\nexample.com.  3600 IN CAA  0 issue "ca.example.net"'
          ),
          sl(
            'TTL, propagação e round-robin',
            'TTL (Time To Live) é o tempo, em segundos, que um resolvedor pode guardar a resposta em cache. A "propagação" do DNS na verdade é a expiração dos caches espalhados: depois que você muda um registro, cada cache antigo só enxerga a mudança quando o TTL acaba (um TTL de 3600 pode demorar até 1 hora). Para mudar com pouca espera, reduza o TTL com antecedência (pelo menos o tempo do TTL antigo antes da troca) e só depois troque o IP. Um TTL curto dá flexibilidade, mas aumenta a carga e a latência. Round-robin DNS: vários registros A para o mesmo nome; o servidor rotaciona a ordem das respostas, distribuindo clientes entre os servidores. Simples, mas sem checagem de saúde (continua apontando para servidor caído) e limitado pelo cache.',
            '$ dig +short www.example.com\n192.0.2.10\n192.0.2.11\n\n(consultas seguintes podem trazer a ordem trocada)'
          ),
          sl(
            'Consulta reversa e split-horizon',
            'Consulta reversa: o IP é escrito com os octetos invertidos sob in-addr.arpa e consultado como PTR; 192.0.2.10 vira 10.2.0.192.in-addr.arpa. É usada em logs, diagnóstico e, em e-mail, para validar servidores. Para IPv6 usa-se ip6.arpa. Split-horizon (ou split-DNS): o mesmo nome tem respostas diferentes dependendo de quem pergunta — por exemplo, app.example.com resolve para o IP privado dentro da rede e para o público fora. Resolve o problema de hairpin sem NAT loopback e esconde a topologia interna, mas exige manter duas visões consistentes e nunca vazar nomes internos na zona pública.'
          ),
          sl(
            'dig e problemas comuns',
            'O dig mostra a resposta do DNS: cabeçalho com status (NOERROR = ok; NXDOMAIN = o nome não existe; SERVFAIL = o servidor falhou, p.ex. validação DNSSEC quebrada) e flags (qr resposta, rd recursão pedida, ra recursão disponível, aa resposta autoritativa); seção ANSWER com nome, TTL, classe, tipo e dado. Opções úteis: @servidor (perguntar a um servidor específico), +short, -x IP (consulta reversa), +trace (percorre a delegação a partir da raiz). Problemas comuns: cache antigo com TTL alto, registro NS desatualizado no pai (lame delegation), falta de PTR para servidores de e-mail, serial esquecido (secundários desatualizados) e CNAME no apex do domínio (não é permitido, pois conviveria com SOA/NS).',
            '$ dig www.example.com A\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 4711\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1\n\n;; ANSWER SECTION:\nwww.example.com.   300  IN  A  192.0.2.10\n\n;; SERVER: 192.168.1.1#53\n\n$ dig -x 192.0.2.10 +short\nwww.example.com.'
          ),
          sl(
            'DoT, DoH e DNSSEC',
            'O DNS tradicional vai em claro (UDP/TCP 53): quem está no caminho vê e pode alterar as consultas. DoT (DNS over TLS) cifra a consulta entre cliente e resolvedor (porta 853) e DoH (DNS over HTTPS) a envia dentro de HTTPS (porta 443, misturada ao tráfego web). Os dois protegem o trecho cliente–resolvedor, mas o resolvedor ainda vê as consultas (dado pessoal: escolha com critério). DNSSEC é outra coisa: assina digitalmente os registros (RRSIG, DNSKEY, com uma cadeia de confiança via DS desde a raiz), permitindo ao resolvedor validar que a resposta é autêntica e íntegra; NÃO cifra nada, apenas impede falsificação (cache poisoning).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um resolvedor recursivo pergunta à raiz onde está www.example.com. O que a raiz responde?', 'd', [
          'O IP final do site',
          'NXDOMAIN, pois a raiz não conhece nomes',
          'Uma recusa, pois é recursivo',
          'Uma indicação (referral) com os servidores NS do TLD .com'
        ], 'A raiz delega para o TLD; o TLD delega para o domínio; só o autoritativo final dá o dado.'),
        mcq('q2', 'Para que serve o split-horizon DNS?', 'b', [
          'Dividir o cache em duas partes',
          'Responder de forma diferente para clientes internos e externos (ex.: IP privado dentro e público fora)',
          'Cifrar as consultas',
          'Distribuir carga entre servidores'
        ], 'Split-horizon dá visões distintas da mesma zona; evita hairpin NAT e esconde topologia interna.'),
        mcq('q3', 'Você vai trocar o IP de um site com TTL de 86400 s (1 dia). Qual o procedimento sensato?', 'a', [
          'Reduzir o TTL com antecedência (pelo menos 1 dia antes), depois trocar o IP',
          'Trocar o IP e aumentar o TTL depois',
          'Trocar o IP e esperar o DNS "propagar" por si',
          'Apagar o registro e recriar'
        ], 'Caches só renovam quando o TTL acaba; baixando antes, a troca é percebida rapidamente.'),
        fill('q4', 'Qual o tipo de registro usado na consulta reversa (IP → nome)?', 'Registro de consulta reversa = ___', ['PTR'], 'PTR guarda o nome associado ao IP, sob in-addr.arpa (IPv4) ou ip6.arpa (IPv6).'),
        mcq('q5', 'O comando dig +short www.example.com devolve 192.0.2.10 e 192.0.2.11. O que isso indica?', 'c', [
          'Erro: um nome não pode ter dois IPs',
          'O servidor está em loop',
          'Provavelmente round-robin DNS: dois registros A para o mesmo nome, sem checagem de saúde',
          'Que o domínio usa DNSSEC'
        ], 'Vários A formam round-robin: distribui os clientes, mas não sabe se algum servidor caiu.'),
        mcq('q6', 'Qual registro limita quais autoridades certificadoras podem emitir certificado para o domínio?', 'b', [
          'SRV',
          'CAA',
          'SOA',
          'PTR'
        ], 'CAA lista as CAs autorizadas. SRV localiza serviços, SOA descreve a zona e PTR é reverso.'),
        mcq('q7', 'Qual afirmação sobre DoH/DoT e DNSSEC está correta?', 'd', [
          'DNSSEC cifra as consultas',
          'DoH e DoT garantem que a resposta seja autêntica',
          'DoT usa a porta 443',
          'DoH/DoT cifram o trecho cliente–resolvedor; DNSSEC assina os registros para provar autenticidade, sem cifrar'
        ], 'São complementares: privacidade do trecho (DoT/DoH) vs autenticidade/integridade dos dados (DNSSEC).'),
        fill('q8', 'Qual opção do dig faz uma consulta reversa de um IP?', '$ dig ___ 192.0.2.10', ['-x'], 'dig -x 192.0.2.10 monta a consulta PTR em 10.2.0.192.in-addr.arpa.')
      ]
    },
    {
      id: 'rdi-35-email-smtp-spf-dkim-dmarc',
      title: 'E-mail: fluxo e autenticação (SMTP, SPF, DKIM, DMARC)',
      goal: 'Entender o caminho de uma mensagem entre servidores, as portas e protocolos de e-mail, e como SPF, DKIM e DMARC reduzem a falsificação de remetente.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quem faz o quê: MUA, MSA, MTA, MDA e MX',
            'MUA (Mail User Agent): o programa do usuário (cliente de e-mail ou webmail). MSA (Mail Submission Agent): recebe a mensagem do usuário, autenticado, e a entrega ao sistema de envio. MTA (Mail Transfer Agent): o servidor que transfere mensagens entre domínios usando SMTP. MDA (Mail Delivery Agent): grava a mensagem na caixa postal do destinatário. Fluxo de envio: MUA do remetente → MSA/MTA do provedor dele → (consulta DNS) → MTA do domínio do destinatário → MDA → caixa postal → MUA do destinatário lê. Para achar o servidor de entrada do domínio de destino, o MTA consulta o registro MX do domínio: ele lista os servidores de e-mail com uma prioridade; o número MENOR é tentado primeiro, e os demais servem de reserva.',
            'exemplo.com.  3600 IN MX 10 mx1.exemplo.com.\nexemplo.com.  3600 IN MX 20 mx2.exemplo.com.\n# mx1 (10) recebe primeiro; mx2 (20) é reserva'
          ),
          sl(
            'SMTP, portas, IMAP e POP3',
            'SMTP (Simple Mail Transfer Protocol) é o protocolo de ENVIO e de transferência entre servidores. Porta 25: SMTP entre servidores (MTA para MTA). Porta 587: submissão, em que o usuário autenticado entrega a mensagem ao seu provedor (use esta nos clientes). Porta 465: submissão com TLS implícito, também usada. Para LER mensagens existem dois protocolos: IMAP (portas 143, ou 993 com TLS implícito) mantém as mensagens no servidor e sincroniza vários dispositivos (pastas, lido/não lido); POP3 (110, ou 995 com TLS) tradicionalmente baixa as mensagens para um dispositivo e (conforme configuração) as apaga do servidor, sem sincronização entre aparelhos. Cifragem: STARTTLS começa a conexão em texto puro e depois "sobe" para TLS por um comando (se o atacante interferir, pode forçar a continuar sem cifra); TLS implícito já abre a conexão cifrada, desde o primeiro byte, e é mais robusto.'
          ),
          sl(
            'Por que o e-mail é fácil de falsificar e o SPF',
            'O SMTP original não verifica se o remetente é quem diz ser: o endereço de origem (MAIL FROM e o campo "From" que o usuário vê) é só texto, e qualquer servidor pode declarar um. É daí que vêm spoofing e phishing. SPF (Sender Policy Framework) é a primeira defesa: o dono do domínio publica, em um registro TXT, a lista de IPs/servidores autorizados a enviar e-mail em nome dele. O receptor compara o IP que o entregou com a lista. Elementos: ip4:, ip6: (IPs autorizados), include: (inclui a lista de outro domínio, como o serviço de envio contratado) e o final: ~all (softfail: o que não bate é suspeito, mas costuma ser aceito e marcado) ou -all (fail: o que não bate deve ser rejeitado). O SPF olha o domínio do MAIL FROM (envelope), não o "From" visível, e pode falhar quando uma mensagem é encaminhada (o IP de quem encaminha não está na lista).',
            '$ dig +short TXT exemplo.com\n"v=spf1 ip4:192.0.2.25 include:_spf.exemplo.net -all"'
          ),
          sl(
            'DKIM: assinatura da mensagem',
            'DKIM (DomainKeys Identified Mail) adiciona uma assinatura digital à mensagem. O servidor de envio assina cabeçalhos e corpo com uma chave PRIVADA que só ele possui. A chave PÚBLICA correspondente é publicada no DNS, em um registro TXT cujo nome inclui um seletor: seletor._domainkey.dominio. O seletor permite ter várias chaves ao mesmo tempo (por serviço ou para trocar a chave sem interromper o envio). O receptor lê, no cabeçalho DKIM-Signature, o domínio (d=) e o seletor (s=), busca a chave pública no DNS e confere a assinatura: se bate, a mensagem veio de quem controla o domínio e não foi alterada no caminho. DKIM costuma sobreviver ao encaminhamento (se o conteúdo não mudar), ao contrário do SPF.',
            'DKIM-Signature: v=1; d=exemplo.com; s=sel1; ...\n# o receptor consulta:\n$ dig +short TXT sel1._domainkey.exemplo.com\n"v=DKIM1; k=rsa; p=MIGfMA0...(chave pública abreviada)"'
          ),
          sl(
            'DMARC: política e alinhamento',
            'DMARC une SPF e DKIM e diz ao receptor O QUE FAZER quando a verificação falha. Publica-se um registro TXT em _dmarc.dominio. A política (p=): none (só observar e receber relatórios, sem afetar a entrega; usado no início), quarantine (tratar como suspeita, em geral spam) e reject (rejeitar). A regra de aprovação: SPF OU DKIM precisa passar E estar ALINHADO, ou seja, o domínio autenticado (do envelope no SPF, do d= no DKIM) deve corresponder ao domínio do "From" que o usuário vê. Isso fecha a brecha do SPF, que olhava só o envelope. Com rua= o dono do domínio recebe relatórios agregados de quem está enviando e-mail em seu nome (inclusive fontes que ele esqueceu). Boa prática: começar com p=none, ajustar SPF e DKIM, passar para quarantine e depois reject.',
            '$ dig +short TXT _dmarc.exemplo.com\n"v=DMARC1; p=reject; rua=mailto:relatorios@exemplo.com"'
          ),
          sl(
            'Reputação, PTR, listas de bloqueio e porta 25',
            'Mesmo com SPF, DKIM e DMARC corretos, o receptor avalia a reputação do IP e do domínio: histórico de spam, volume, reclamações. Um servidor de e-mail deve ter um PTR (DNS reverso) apontando para um nome que, por sua vez, aponte de volta ao mesmo IP; sem isso, muitos receptores rejeitam ou marcam como spam. Listas de bloqueio (blocklists/RBLs) reúnem IPs conhecidos por enviar spam; se seu IP entra numa delas (por exemplo, por uma máquina infectada enviando spam), seus e-mails passam a ser recusados até a limpeza e a retirada. Muitos provedores residenciais e de nuvem BLOQUEIAM a saída pela porta 25 por padrão, para impedir que máquinas infectadas enviem spam; quem precisa mandar e-mail usa a porta 587 com autenticação em um serviço de envio. Hospedar o próprio servidor de e-mail em casa quase sempre esbarra nisso, em IP dinâmico e em reputação.'
          ),
          sl(
            'Diagnóstico, phishing e LGPD',
            'Diagnóstico: consulte os registros com dig MX, dig TXT (SPF), dig TXT _dmarc.dominio e dig TXT seletor._domainkey.dominio; e leia os cabeçalhos completos da mensagem (opção "mostrar original"): a linha Authentication-Results mostra spf=pass/fail, dkim=pass/fail e dmarc=pass/fail, e os campos Received (de baixo para cima) mostram o caminho. Defesa contra phishing: SPF/DKIM/DMARC no seu domínio (para ninguém se passar por você), filtros de entrada, atenção a links e anexos e treinamento. LGPD: e-mails contêm dados pessoais (nomes, endereços, conteúdo de conversas, anexos). Defina retenção (por quanto tempo guardar e quando apagar), controle quem acessa as caixas (acesso mínimo, MFA, auditoria), cifre o transporte (TLS) e, se necessário, o conteúdo, e trate backups. Nos exemplos, usamos só domínios de documentação como exemplo.com.',
            'Authentication-Results: mx.exemplo.org;\n  spf=pass smtp.mailfrom=exemplo.com;\n  dkim=pass header.d=exemplo.com;\n  dmarc=pass header.from=exemplo.com'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um funcionário configura o cliente de e-mail para ENVIAR mensagens pelo servidor da empresa, com usuário e senha. Qual porta é a recomendada?', 'c', [
          '25, SMTP entre servidores',
          '110, POP3',
          '587, submissão autenticada',
          '53, DNS'
        ], 'A 587 é a porta de submissão: o usuário autenticado entrega a mensagem ao seu provedor. A 25 fica para a transferência entre MTAs.'),
        mcq('q2', 'Qual a diferença essencial entre IMAP e POP3?', 'a', [
          'O IMAP mantém as mensagens no servidor e sincroniza vários dispositivos; o POP3 tradicionalmente baixa para um dispositivo',
          'O IMAP é usado para enviar e o POP3 para receber',
          'O POP3 sincroniza pastas e o IMAP não',
          'O IMAP não pode usar TLS'
        ], 'IMAP = leitura sincronizada no servidor; POP3 = baixar (e muitas vezes apagar do servidor). O envio é com SMTP.'),
        mcq('q3', 'O registro SPF de exemplo.com é "v=spf1 ip4:192.0.2.25 include:_spf.exemplo.net -all" (o include não lista o IP 198.51.100.7). Uma mensagem de @exemplo.com chega entregue pelo IP 198.51.100.7. Qual o resultado do SPF?', 'd', [
          'pass, pois o domínio existe',
          'softfail, pois o final é -all',
          'none, pois não há DKIM',
          'fail: o IP não está autorizado e o -all indica que deve ser rejeitado'
        ], 'O IP não está entre os autorizados nem no include. -all pede rejeição; ~all seria softfail.'),
        fill('q4', 'Em que nome DNS (apenas o rótulo inicial) fica o registro TXT da política DMARC de exemplo.com?', '___.exemplo.com', ['_dmarc', '_dmarc.'], 'O DMARC é publicado em _dmarc.dominio, como TXT.'),
        mcq('q5', 'Como o receptor verifica uma assinatura DKIM?', 'b', [
          'Pergunta ao remetente por telefone',
          'Lê o domínio e o seletor da DKIM-Signature, busca a chave pública no DNS (seletor._domainkey.dominio) e confere a assinatura',
          'Compara o IP com a lista do SPF',
          'Pede a chave privada ao servidor de envio'
        ], 'Quem assina usa a chave privada; o receptor usa a pública publicada no DNS. A chave privada nunca sai do servidor de envio.'),
        mcq('q6', 'O registro "v=DMARC1; p=reject; rua=mailto:relatorios@exemplo.com" está publicado. O que ele significa?', 'a', [
          'Mensagens que falham no SPF/DKIM alinhados devem ser rejeitadas, e relatórios agregados vão para o endereço rua',
          'Todas as mensagens são aceitas e apenas observadas',
          'Mensagens suspeitas vão para a quarentena',
          'O domínio não tem servidor de e-mail'
        ], 'p=reject pede rejeição. p=none seria só observação; quarantine, tratamento como suspeita. rua define para onde vão os relatórios.'),
        mcq('q7', 'Você instalou um servidor de e-mail em casa e os provedores de destino recusam suas mensagens. Qual o conjunto de causas mais provável?', 'c', [
          'A porta 993 está fechada e o IMAP é obrigatório para enviar',
          'O DKIM não pode ser usado com IP dinâmico, mas o SPF resolve tudo',
          'Saída da porta 25 bloqueada pelo provedor, IP residencial/dinâmico sem PTR adequado e reputação ou blocklist',
          'O MX só aceita um servidor por domínio'
        ], 'Provedores bloqueiam a 25 de saída, receptores exigem PTR coerente e consultam reputação e listas de bloqueio. Use um serviço de envio na 587.'),
        fill('q8', 'Qual o tipo de registro DNS que indica os servidores que RECEBEM e-mail de um domínio?', 'dig ___ exemplo.com', ['MX', 'mx'], 'O registro MX lista os servidores de entrada, com prioridade (menor número primeiro).')
      ]
    },
    {
      id: 'rdi-12-dhcp-avancado',
      title: 'DHCP avançado',
      goal: 'Configurar DHCP em redes com várias sub-redes (relay, escopos, opções) e protegê-lo contra servidores falsos com DHCP snooping.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Revisão e o limite do broadcast',
            'O DHCP funciona em quatro passos (DORA): Discover, Offer, Request, Acknowledge. O cliente usa UDP porta 68 e o servidor, porta 67. O Discover é um BROADCAST (o cliente ainda não tem IP nem sabe quem é o servidor), e roteadores não encaminham broadcast. Então, em uma rede com várias VLANs/sub-redes, o servidor central não receberia os pedidos das outras sub-redes — a menos que um agente os transporte. Instalar um servidor DHCP em cada sub-rede seria trabalhoso de manter.'
          ),
          sl(
            'Relay agent (ip helper-address)',
            'O relay agent é um roteador/switch L3 configurado na interface da sub-rede dos clientes: ele escuta os broadcasts DHCP e os reenvia como UNICAST ao servidor, preenchendo o campo giaddr com o seu próprio IP naquela sub-rede (informa "este pedido veio da sub-rede X"). O servidor usa o giaddr para escolher o escopo certo e responde ao relay, que entrega ao cliente. No Cisco, o comando é ip helper-address, na interface que serve os clientes (SVI da VLAN ou interface do roteador).',
            'interface vlan 10\n ip address 192.168.10.1 255.255.255.0\n ip helper-address 192.168.1.5     ! IP do servidor DHCP'
          ),
          sl(
            'Escopos, exclusões e reservas',
            'Um escopo (scope/pool) é a configuração para UMA sub-rede: faixa de endereços, máscara, gateway, DNS e tempo de concessão (lease). Um servidor tem vários escopos, um por sub-rede; o giaddr do relay indica qual usar. Exclusão: endereços do intervalo que o servidor NÃO deve distribuir (ex.: .1–.20 reservados a roteadores, impressoras e servidores com IP fixo). Reserva: o servidor sempre dá o mesmo IP a um cliente identificado pelo MAC (ou ID de cliente); é gerenciada centralmente, melhor que IP fixo no dispositivo, mas guarda identificadores únicos de equipamentos (dado pessoal se ligado a uma pessoa): mantenha só o necessário.',
            'ip dhcp excluded-address 192.168.10.1 192.168.10.20\nip dhcp pool VLAN10\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 192.168.1.53\n domain-name lab.example.com\n lease 1'
          ),
          sl(
            'Opções DHCP e renovação',
            'Além do IP e da máscara, o DHCP entrega opções numeradas: 3 = roteador (gateway padrão), 6 = servidores DNS, 15 = nome de domínio, 51 = tempo de concessão (lease). O cliente renova sem avisar: aos 50% do lease (T1) tenta renovar com o mesmo servidor e, se falhar, aos 87,5% (T2) tenta com qualquer servidor. Lease curto recicla IPs rápido (bom para convidados e Wi-Fi público) mas gera mais tráfego; lease longo reduz tráfego (bom para redes estáveis). Se o gateway ou DNS do escopo estiver errado, os clientes recebem IP mas não navegam: confira as opções.'
          ),
          sl(
            'Ameaças: servidor DHCP falso e starvation',
            'DHCP não tem autenticação nativa: o cliente aceita a primeira oferta que chega. Um servidor DHCP rogue (um roteador doméstico ligado por engano, ou um equipamento malicioso) pode responder mais rápido e entregar gateway ou DNS errados — redirecionando o tráfego para o equipamento do invasor (man-in-the-middle). DHCP starvation: um dispositivo inunda a rede com pedidos usando MACs falsos até esgotar o escopo, impedindo clientes legítimos (e abrindo espaço para o servidor falso). Em ambos os casos, o ataque funciona porque a rede confia em quem responde.'
          ),
          sl(
            'Defesa: DHCP snooping',
            'DHCP snooping é um recurso do switch que classifica as portas: trusted (confiáveis: as que levam ao servidor DHCP legítimo ou ao uplink) e untrusted (as de usuários). Em portas untrusted, mensagens de SERVIDOR (Offer, Ack) são descartadas — um servidor falso ali fica mudo. O switch também limita a taxa de mensagens DHCP por porta (contra starvation) e constrói uma tabela de associações (binding): MAC, IP, VLAN, porta e tempo de lease dos clientes legítimos, que outros recursos usam (inspeção ARP dinâmica e IP source guard contra falsificação de IP/ARP). Complemente com port security (limite de MACs por porta). Configure o snooping por VLAN, marque como confiável apenas a porta do servidor/uplink e guarde logs só pelo tempo necessário: IP, MAC e hostname podem identificar pessoas.',
            'ip dhcp snooping\nip dhcp snooping vlan 10\n!\ninterface gi0/24            ! uplink / servidor\n ip dhcp snooping trust\n!\ninterface range gi0/1 - 20  ! portas de usuário (untrusted)\n ip dhcp snooping limit rate 15'
          ),
          sl(
            'DHCPv6 em visão geral',
            'Em IPv6, o endereço pode vir por SLAAC (sem servidor), por DHCPv6 stateful (o servidor atribui o endereço e mantém o estado, parecido com o DHCPv4) ou por DHCPv6 stateless (SLAAC dá o endereço e o DHCPv6 só entrega DNS e outras opções). O Router Advertisement diz ao host, por meio de flags, o que fazer: M = usar DHCPv6 para obter o endereço; O = usar DHCPv6 para as outras opções. Os conceitos de relay, escopo e proteção contra servidores falsos continuam valendo (relay e snooping também existem para DHCPv6), e, como não existe broadcast em IPv6, as mensagens vão para um endereço multicast dos servidores/relays DHCP.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que é necessário um relay agent para o DHCP atender várias sub-redes com um servidor central?', 'a', [
          'O Discover é broadcast e roteadores não encaminham broadcast; o relay o converte em unicast para o servidor',
          'O DHCP só funciona em redes com mais de 254 hosts',
          'O servidor não entende máscaras',
          'O relay criptografa as mensagens'
        ], 'Sem o relay, os pedidos de outras sub-redes nunca chegariam ao servidor.'),
        mcq('q2', 'Como o servidor DHCP sabe qual escopo usar para um pedido que veio por relay?', 'd', [
          'Pelo MAC do cliente',
          'Pelo nome do computador',
          'Pelo número da VLAN nativa',
          'Pelo campo giaddr, com o IP do relay naquela sub-rede'
        ], 'O relay preenche o giaddr; o servidor escolhe o escopo cuja rede contém esse endereço.'),
        mcq('q3', 'Qual a diferença entre exclusão e reserva no DHCP?', 'c', [
          'São sinônimos',
          'A exclusão atribui um IP fixo a um MAC; a reserva retira endereços do pool',
          'A exclusão retira endereços do intervalo distribuído; a reserva liga um IP fixo a um cliente (MAC)',
          'A reserva só vale para impressoras'
        ], 'Exclusão = não distribuir; reserva = sempre dar o mesmo IP àquele cliente identificado.'),
        fill('q4', 'Complete o comando que configura o relay na interface da VLAN dos clientes:', 'interface vlan 10\n ip ___-address 192.168.1.5', ['helper', 'ip helper', 'helper-address'], 'ip helper-address indica o servidor para o qual os broadcasts DHCP serão encaminhados em unicast.'),
        mcq('q5', 'Qual opção DHCP entrega o gateway padrão ao cliente?', 'b', [
          'Opção 6',
          'Opção 3 (roteador)',
          'Opção 15',
          'Opção 51'
        ], '3 = roteador; 6 = DNS; 15 = nome de domínio; 51 = tempo de concessão.'),
        mcq('q6', 'Um funcionário liga um roteador doméstico à rede por engano, e ele passa a distribuir IPs. Qual o risco?', 'c', [
          'Nenhum: o DHCP escolhe o servidor correto',
          'Apenas troca de lease',
          'Clientes recebem gateway/DNS errados, ficando sem rede ou com tráfego redirecionado',
          'O switch cai'
        ], 'Servidor DHCP falso: o cliente aceita a primeira oferta. Defesa: DHCP snooping com portas untrusted.'),
        mcq('q7', 'No DHCP snooping, que mensagens são descartadas em portas untrusted?', 'a', [
          'As de servidor (Offer e Ack)',
          'As de cliente (Discover e Request)',
          'Todas as mensagens ARP',
          'Todo o tráfego de dados'
        ], 'Só portas trusted podem emitir Offer/Ack; assim, servidor falso numa porta de usuário fica mudo.'),
        fill('q8', 'Qual a porta UDP em que o servidor DHCP escuta?', 'Servidor DHCP: UDP ___', ['67', 'udp 67'], 'O servidor usa UDP 67; o cliente, UDP 68.')
      ]
    },
    {
      id: 'rdi-13-tcp-profundidade',
      title: 'TCP em profundidade',
      goal: 'Ler um handshake e entender números de sequência/ACK, janela, retransmissão, congestionamento, MSS e estados da conexão.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Números de sequência e ACK',
            'O TCP numera cada BYTE enviado. O número de sequência (seq) de um segmento é o número do primeiro byte de dados que ele carrega; o número de confirmação (ack) diz "recebi tudo até aqui; o próximo byte que espero é este". O ACK é cumulativo. Exemplo: segmento com seq = 1000 e 500 bytes de dados cobre os bytes 1000 a 1499; a confirmação correta é ack = 1500. O número inicial (ISN) é escolhido de forma imprevisível em cada conexão. SYN e FIN consomem 1 número de sequência cada, mesmo sem dados.'
          ),
          sl(
            'Flags e o handshake',
            'Flags do cabeçalho TCP: SYN (sincronizar: abrir), ACK (o campo ack é válido), FIN (terminar de enviar), RST (abortar/recusar imediatamente), PSH (entregar já à aplicação). Na abertura de três vias: o cliente envia SYN com seu ISN; o servidor responde SYN+ACK com seu ISN e ack = ISN do cliente + 1; o cliente confirma com ACK, ack = ISN do servidor + 1. Na notação do tcpdump: [S] = SYN, [S.] = SYN+ACK, [.] = ACK, [P.] = PSH+ACK, [F.] = FIN+ACK, [R] = RST. Se a porta estiver fechada, o servidor responde com RST.',
            '1 10.0.0.5.51000 > 10.0.0.9.443: Flags [S],  seq 1000,           win 64240, options [mss 1460]\n2 10.0.0.9.443 > 10.0.0.5.51000: Flags [S.], seq 5000, ack 1001, win 65535, options [mss 1460]\n3 10.0.0.5.51000 > 10.0.0.9.443: Flags [.],             ack 5001, win 64240'
          ),
          sl(
            'Janela deslizante e controle de fluxo',
            'O controle de fluxo impede que o transmissor afogue um receptor lento. Em cada segmento, o receptor informa a janela (win): quantos bytes ainda cabem no seu buffer. O transmissor pode ter, no máximo, essa quantidade de bytes enviados e ainda NÃO confirmados; a cada ACK, a janela "desliza" para frente e libera novos envios. Janela 0 = pare e espere (o receptor envia nova janela quando liberar espaço). Consequência: a vazão máxima é aproximadamente janela / RTT. Com janela de 65.535 bytes e RTT de 50 ms: 65.535 × 8 / 0,05 ≈ 10,5 Mb/s, mesmo num link muito mais rápido (por isso existe a opção de window scaling, que amplia a janela em links de alta velocidade/latência).'
          ),
          sl(
            'Retransmissão e RTO',
            'Se um segmento se perde, o transmissor precisa reenviá-lo. Dois gatilhos: (1) RTO (Retransmission Timeout): um temporizador calculado a partir do RTT medido; se o ACK não chega, retransmite; a cada novo estouro seguido, o RTO dobra (backoff exponencial). (2) Retransmissão rápida: se um segmento some mas os seguintes chegam, o receptor repete o MESMO ack (ACK duplicado) apontando o byte que falta; após 3 ACKs duplicados, o transmissor reenvia sem esperar o RTO. Isso detecta a perda muito antes do temporizador.'
          ),
          sl(
            'Controle de congestionamento',
            'Fluxo protege o receptor; congestionamento protege a REDE. O transmissor mantém uma janela de congestionamento (cwnd) e envia no máximo o menor entre cwnd e a janela do receptor. Slow start: começa com cwnd pequena (poucos MSS) e dobra a cada RTT (1, 2, 4, 8, 16 MSS...) — cresce exponencialmente (o nome "slow" é irônico) até atingir um limite (ssthresh) ou haver perda. Congestion avoidance: acima do limite, cresce 1 MSS por RTT (linear). Ao detectar perda: por 3 ACKs duplicados, a cwnd é reduzida pela metade (rede ainda entrega algo); por timeout (perda severa), o limite cai para metade da cwnd e a cwnd volta a 1 MSS, recomeçando o slow start. Algoritmos modernos (CUBIC, BBR) mudam a fórmula, mas mantêm a ideia: aumentar enquanto tudo vai bem, recuar na perda/sinal de fila.'
          ),
          sl(
            'MSS, MTU e fragmentação',
            'MTU é o maior pacote IP que o enlace transporta (1500 bytes em Ethernet). MSS é o maior bloco de DADOS TCP por segmento: MSS = MTU − 20 (IP) − 20 (TCP) = 1460 bytes. É anunciado nas opções do SYN, e cada lado respeita o do outro. Se um pacote IP excede o MTU de algum enlace, ele pode ser fragmentado (se o bit DF não estiver ligado) — o que é custoso e frágil: perder um fragmento perde o pacote inteiro. O TCP evita isso com o MSS e com o Path MTU Discovery: envia com DF ligado e o roteador que não cabe devolve ICMP "fragmentation needed" com o MTU do trecho. Bloquear todo ICMP quebra esse mecanismo e gera conexões que abrem mas travam ao enviar dados grandes. VPNs e túneis reduzem o MTU útil (por isso se usa MSS clamping).'
          ),
          sl(
            'Estados da conexão e TIME_WAIT',
            'Cada ponta do TCP passa por estados: LISTEN (servidor esperando), SYN_SENT / SYN_RECEIVED (durante o handshake), ESTABLISHED (transferindo dados), e no fechamento FIN_WAIT, CLOSE_WAIT, LAST_ACK e TIME_WAIT. O fechamento ordenado usa 4 passos (FIN, ACK, FIN, ACK), pois cada direção é encerrada separadamente. Quem fecha PRIMEIRO fica em TIME_WAIT depois do último ACK, por um período (de dezenas de segundos a poucos minutos, conforme o sistema): garante que o último ACK chegue (se for perdido, o outro lado reenvia o FIN) e que pacotes atrasados da conexão antiga morram antes de o mesmo par IP:porta ser reutilizado. Muitos TIME_WAIT em um servidor ocupado são normais, não um erro. Para ver estados: ss -tan (Linux) ou netstat -an.',
            '$ ss -tan\nState       Local Address:Port    Peer Address:Port\nLISTEN      0.0.0.0:443           0.0.0.0:*\nESTAB       10.0.0.9:443          10.0.0.5:51000\nTIME-WAIT   10.0.0.9:443          10.0.0.7:49822'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um segmento chega com seq = 1000 e 500 bytes de dados. Qual o ack que o receptor envia (supondo que recebeu tudo até então)?', 'b', [
          'ack = 1000',
          'ack = 1500',
          'ack = 1501',
          'ack = 500'
        ], 'Cobre os bytes 1000–1499; o ack indica o PRÓXIMO byte esperado: 1500.'),
        mcq('q2', 'No handshake do slide, o cliente enviou SYN com seq 1000. Qual é o ack do SYN+ACK do servidor?', 'c', [
          '1000',
          '5000',
          '1001',
          '5001'
        ], 'O SYN consome 1 número de sequência; o servidor confirma ISN + 1 = 1001.'),
        mcq('q3', 'Qual o limite aproximado de vazão de uma conexão TCP com janela de 65.535 bytes e RTT de 50 ms?', 'a', [
          'Cerca de 10,5 Mb/s',
          'Cerca de 65 Mb/s',
          'Cerca de 1 Gb/s',
          'Cerca de 1,3 Mb/s'
        ], 'Vazão ≈ janela / RTT = 65.535 × 8 / 0,05 ≈ 10,5 Mb/s, mesmo em link muito mais rápido.'),
        fill('q4', 'Qual o MSS (em bytes) de uma conexão sobre Ethernet com MTU de 1500, cabeçalhos IP e TCP de 20 bytes cada?', 'MSS = 1500 − 20 − 20 = ___', ['1460'], 'MSS = MTU − cabeçalho IP − cabeçalho TCP = 1460 bytes de dados.'),
        mcq('q5', 'Em slow start sem perdas, a cwnd começa em 1 MSS e dobra a cada RTT. Quanto vale após 4 RTTs?', 'd', [
          '5 MSS',
          '8 MSS',
          '4 MSS',
          '16 MSS'
        ], '1 → 2 → 4 → 8 → 16: cresce exponencialmente.'),
        mcq('q6', 'O transmissor recebe 3 ACKs duplicados com o mesmo ack. O que acontece?', 'b', [
          'Ele encerra a conexão com RST',
          'Retransmissão rápida do segmento que falta, sem esperar o RTO',
          'Dobra a janela do receptor',
          'Volta ao handshake'
        ], 'Os ACKs repetidos indicam que um byte específico falta; a retransmissão rápida corrige antes do timeout.'),
        mcq('q7', 'Após um TIMEOUT (perda severa) por congestionamento, o que o TCP faz?', 'c', [
          'Dobra a cwnd',
          'Mantém a cwnd e aumenta o RTO',
          'Reduz o limite à metade e volta a cwnd para 1 MSS (recomeça o slow start)',
          'Fecha a conexão'
        ], 'O timeout é sinal de perda grave: recuo drástico. Com ACKs duplicados o recuo é menor (cwnd pela metade).'),
        fill('q8', 'Em que estado (nome do estado, como no ss/netstat) fica a ponta que fechou a conexão primeiro, após o último ACK?', 'Estado após fechar primeiro: ___', ['TIME_WAIT', 'TIME-WAIT', 'time wait', 'TIMEWAIT'], 'TIME_WAIT garante a entrega do último ACK e a morte dos pacotes atrasados da conexão antiga.')
      ]
    },
    {
      id: 'rdi-14-udp-tempo-real',
      title: 'UDP e tráfego em tempo real',
      goal: 'Entender por que voz, vídeo, jogos e consultas curtas preferem UDP, e como RTP, jitter buffer, streaming adaptativo e QUIC lidam com a falta de garantias.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'UDP: sem conexão',
            'O UDP (User Datagram Protocol) entrega datagramas sem estabelecer conexão: não há handshake, confirmação (ACK), retransmissão, ordenação, controle de fluxo nem controle de congestionamento. É serviço best-effort: o datagrama pode se perder, duplicar ou chegar fora de ordem, e o UDP não avisa. Em troca é leve e rápido: sem estado, sem espera por confirmações. A aplicação decide o que fazer: ignorar a perda, retransmitir por conta própria ou construir sobre o UDP outra camada (como o QUIC faz).'
          ),
          sl(
            'Cabeçalho simples',
            'O cabeçalho UDP tem apenas 8 bytes, em 4 campos de 16 bits: porta de origem, porta de destino, comprimento (cabeçalho + dados) e checksum. Compare com o TCP, que tem no mínimo 20 bytes (sequência, ack, flags, janela, opções). Menos cabeçalho significa menos bytes por pacote e menos processamento. Não há campo de sequência: se a aplicação precisa de ordem, precisa numerar por conta própria.',
            ' 0                 16                 31\n+-----------------+-----------------+\n| Porta origem    | Porta destino   |\n+-----------------+-----------------+\n| Comprimento     | Checksum        |\n+-----------------+-----------------+\n|        Dados (payload)            |'
          ),
          sl(
            'Quem usa UDP e por quê',
            'DNS (porta 53): pergunta e resposta cabem em um datagrama; abrir uma conexão custaria mais que a própria consulta (cai para TCP quando a resposta é grande). DHCP (67/68): o cliente ainda nem tem IP e usa broadcast, que o TCP não suporta. NTP (123): sincronização de relógio, mensagens curtas e frequentes. VoIP/vídeo e jogos online: o dado só vale se chegar a tempo, então esperar retransmissões atrapalha mais do que perder. Multicast (IPTV, descoberta de serviços): TCP é só unicast, UDP permite um-para-vários.'
          ),
          sl(
            'Perda tolerável, atraso não',
            'Em tempo real, um pacote atrasado é tão inútil quanto um perdido: se a voz de 20 ms chega 500 ms depois, o instante de tocá-la já passou. Retransmitir seria pior (mais atraso). Por isso, a aplicação aceita pequenas perdas e as disfarça: concealment (repetir ou interpolar o último trecho de áudio), codecs resilientes e FEC (correção antecipada de erros: envia redundância para recuperar sem retransmitir). Já para conversa interativa, a referência comum é atraso de ida abaixo de cerca de 150 ms (ITU-T G.114).'
          ),
          sl(
            'RTP, jitter e jitter buffer',
            'O RTP (Real-time Transport Protocol) roda sobre UDP e acrescenta o que falta ao tempo real: número de sequência (detectar perda e reordenar), timestamp (reproduzir no ritmo certo) e tipo de carga (codec); o RTCP envia estatísticas de qualidade. Jitter é a variação do atraso entre pacotes: mesmo enviados a cada 20 ms, chegam em intervalos irregulares. O jitter buffer segura os pacotes por alguns milissegundos e os entrega num ritmo uniforme: buffer maior suaviza mais, mas ACRESCENTA atraso; buffer menor tem menos atraso, mas pode faltar pacote. Exemplo de conta: voz G.711 (64 kb/s) em pacotes de 20 ms: 64.000 × 0,02 = 1.280 bits = 160 bytes de dados; + RTP 12 + UDP 8 + IPv4 20 = 200 bytes por pacote; 50 pacotes por segundo → 200 × 8 × 50 = 80.000 b/s = 80 kb/s (camada 3, sem contar Ethernet).'
          ),
          sl(
            'Streaming adaptativo',
            'Vídeo sob demanda (e muitas transmissões ao vivo com alguns segundos de atraso) usa streaming adaptativo (HLS, MPEG-DASH): o vídeo é cortado em pedaços de poucos segundos, codificados em várias qualidades. O player baixa os pedaços por HTTP (normalmente sobre TCP, ou QUIC), mede a vazão e o buffer e, a cada pedaço, escolhe a qualidade: rede boa, qualidade alta; rede ruim, desce sem travar. É diferente de uma chamada de voz: aqui há buffer de vários segundos, então TCP e retransmissão são aceitáveis; na conversa em tempo real (RTP/UDP), o buffer precisa ser mínimo.'
          ),
          sl(
            'QUIC em visão geral',
            'O QUIC é um protocolo de transporte construído sobre UDP (porta 443 em geral), implementado no espaço do usuário, que reúne o que o TCP+TLS fazem: confiabilidade, ordenação por fluxo, controle de congestionamento e cifragem (TLS 1.3 embutido). Vantagens: handshake de transporte e criptografia juntos (menos idas e voltas até enviar dados), múltiplos fluxos independentes na mesma conexão (a perda em um não trava os outros: sem head-of-line blocking entre fluxos) e identificador de conexão que sobrevive à troca de rede (Wi-Fi para 4G/5G). O HTTP/3 roda sobre QUIC. Se um firewall bloqueia UDP/443, navegadores voltam ao HTTP sobre TCP: lembre de tratar UDP nas regras de segurança.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Numa chamada de voz, um pacote de áudio chega 500 ms depois do momento de tocá-lo. O que a aplicação deve fazer?', 'c', [
          'Pedir retransmissão e esperar',
          'Pausar a chamada até o pacote chegar',
          'Descartá-lo e disfarçar a falha (concealment): ele já é inútil',
          'Reiniciar a conexão'
        ], 'Em tempo real o atraso inutiliza o dado; reenviar só pioraria o atraso.'),
        mcq('q2', 'Por que o DNS usa UDP para consultas comuns?', 'a', [
          'Pergunta e resposta são curtas; um handshake TCP custaria mais que a própria troca',
          'O UDP é mais seguro que o TCP',
          'O TCP não funciona na porta 53',
          'O UDP garante a entrega'
        ], 'O UDP evita a abertura de conexão. Respostas grandes podem usar TCP.'),
        mcq('q3', 'Voz G.711 de 64 kb/s em pacotes de 20 ms, com cabeçalhos RTP (12), UDP (8) e IPv4 (20). Qual a taxa na camada IP?', 'd', [
          '64 kb/s',
          '50 kb/s',
          '160 kb/s',
          '80 kb/s'
        ], 'Cada pacote = 160 + 40 = 200 bytes; 50 pacotes/s × 200 × 8 = 80.000 b/s.'),
        fill('q4', 'Quantos bytes tem o cabeçalho UDP?', 'Cabeçalho UDP = ___ bytes', ['8', '8 bytes'], '4 campos de 16 bits: portas, comprimento e checksum = 8 bytes.'),
        mcq('q5', 'Qual o trade-off de aumentar o jitter buffer de uma chamada de voz?', 'b', [
          'Mais perda de pacotes e menos atraso',
          'Voz mais estável, porém com mais atraso fim a fim',
          'Mais banda e menos jitter',
          'Nenhum: só vantagens'
        ], 'Buffer maior absorve mais variação, mas atrasa a reprodução.'),
        mcq('q6', 'Como o streaming adaptativo (HLS/DASH) reage a uma piora da rede?', 'a', [
          'O player escolhe, para os próximos pedaços, uma qualidade menor, evitando travar',
          'O servidor reinicia o vídeo',
          'O vídeo para até a rede melhorar',
          'O player troca para UDP e RTP'
        ], 'O vídeo está em pedaços de várias qualidades; o player escolhe conforme a vazão e o buffer.'),
        mcq('q7', 'Qual característica descreve o QUIC?', 'd', [
          'Um protocolo sem cifragem, sobre TCP',
          'Um substituto do DNS',
          'Um protocolo de roteamento',
          'Transporte sobre UDP com confiabilidade, controle de congestionamento e TLS embutidos, e fluxos independentes'
        ], 'O QUIC reconstrói no UDP o que o TCP+TLS entregam, com handshake combinado e sem bloqueio entre fluxos.'),
        fill('q8', 'Como se chama a variação do atraso entre os pacotes de um fluxo?', 'A variação do atraso entre pacotes é o ___', ['jitter'], 'Jitter é o que o jitter buffer procura absorver.')
      ]
    },
    {
      id: 'rdi-15-qos',
      title: 'Qualidade de serviço (QoS)',
      goal: 'Classificar e marcar tráfego (CoS/DSCP), escolher filas, diferenciar policing de shaping e saber onde o QoS funciona e onde não funciona.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que QoS',
            'Por padrão, a rede é best-effort e os pacotes saem em ordem de chegada (FIFO). Quando uma interface fica congestionada, a fila enche e o atraso, o jitter e a perda crescem para TODOS: um download grande atrasa uma chamada de voz. QoS (Quality of Service) é um conjunto de técnicas para tratar tipos de tráfego de modo diferente, protegendo o que é sensível. As quatro métricas: largura de banda, atraso, jitter e perda. Ponto-chave: o QoS NÃO cria banda; só decide quem é favorecido quando há congestionamento. Num link sempre ocioso, ele não faz diferença.'
          ),
          sl(
            'Classificação e marcação',
            'Primeiro se CLASSIFICA o tráfego (por ACL, porta, protocolo, aplicação ou origem) e depois se MARCA o pacote com um valor que os próximos equipamentos leem sem reclassificar. Marcação em camada 2: CoS, 3 bits na tag 802.1Q (valores 0 a 7). Em camada 3: DSCP, 6 bits no campo DS do cabeçalho IP (0 a 63); antes dele existia o IP Precedence (3 bits). Valores comuns: EF (46) para voz, AF41 (34) para vídeo interativo, 0 (default/best effort) para o resto. EF = 46 = 101110 em binário; no byte inteiro (DSCP seguido de 2 bits de ECN), vale 184. Fronteira de confiança: marque o mais perto possível da origem e só confie na marcação de dispositivos confiáveis (como telefones IP); marcações de PCs de usuários devem ser reescritas, senão qualquer um se declara "voz".'
          ),
          sl(
            'Filas e prioridade',
            'Quando a saída está congestionada, o escalonador decide a ordem. FIFO: uma fila só, sem distinção. Fila de prioridade estrita: a classe mais alta sempre passa primeiro: latência mínima, mas pode matar de fome (starvation) as filas de baixo se o tráfego prioritário for grande. Filas ponderadas (WFQ, CBWFQ): cada classe recebe uma parcela mínima de banda; ninguém fica sem nada. LLQ (Low Latency Queuing) junta os dois: uma fila de prioridade para voz, LIMITADA (para não consumir tudo), mais classes ponderadas para o resto. As filas só atuam em congestionamento, e na interface de saída.',
            'class-map match-any VOZ\n match dscp ef\npolicy-map WAN-OUT\n class VOZ\n  priority percent 20\n class class-default\n  fair-queue\ninterface gi0/1\n service-policy output WAN-OUT'
          ),
          sl(
            'Congestionamento: tail drop e WRED',
            'Quando a fila está cheia, o comportamento padrão é tail drop: descarta o que chega, sem distinção, e muitas conexões TCP perdem pacotes juntas, reduzem a velocidade juntas e depois crescem juntas (sincronização global), deixando o link subutilizado em ondas. WRED (Weighted Random Early Detection) descarta alguns pacotes ANTES de a fila encher, de modo aleatório e mais para as classes de menor prioridade; os fluxos TCP recuam aos poucos e a fila não explode. Também importa o tamanho dos buffers: buffers enormes escondem a perda, mas aumentam muito o atraso (bufferbloat).'
          ),
          sl(
            'Policing vs shaping',
            'Ambos limitam um tráfego a uma taxa contratada, geralmente com o modelo de balde de fichas (token bucket: permite pequenas rajadas e depois impõe a taxa média). Policing: o excedente é DESCARTADO (ou re-marcado com prioridade menor); não usa buffer, não adiciona atraso, mas é abrupto e causa retransmissões; pode ser aplicado na entrada ou na saída. Shaping: o excedente é guardado em fila e enviado mais tarde, suavizando a curva: sem perda imediata, mas com atraso; só na saída. Uso típico: o provedor aplica policing ao que excede o contrato; o cliente faz shaping para a velocidade contratada, evitando que o provedor descarte seus pacotes.'
          ),
          sl(
            'Voz e vídeo vs dados',
            'Voz: pacotes pequenos e constantes, banda baixa, mas muito sensível a atraso, jitter e perda. Referências comuns: atraso unidirecional até cerca de 150 ms, jitter até cerca de 30 ms e perda abaixo de cerca de 1%. Vídeo interativo: banda maior, em rajadas, também sensível à perda e ao atraso. Dados (web, e-mail, backups): toleram atraso e usam TCP, que se adapta; tráfego de limpeza (backup, atualizações) pode ficar numa classe "scavenger", que cede a todos. Uma política típica: voz em fila de prioridade limitada; vídeo e aplicações críticas com banda garantida; o resto em best effort.',
            'Voz        DSCP EF   (46)  fila prioritária (ex.: até 20%)\nVídeo      DSCP AF41 (34)  banda garantida\nCríticos   DSCP AF31       banda garantida\nPadrão     DSCP 0          best effort\nBackup     DSCP CS1        scavenger (cede a todos)'
          ),
          sl(
            'Onde aplicar e limites',
            'Marcação e confiança: nas bordas de acesso (switches, telefones). Filas, shaping e WRED: nos pontos onde a banda estreita e há congestionamento, como a saída para o WAN e para a Internet. Para funcionar de ponta a ponta, TODOS os saltos precisam honrar a marcação (e as classes precisam ser coerentes entre os equipamentos). Limites: pela Internet pública, os provedores costumam ignorar ou reescrever o DSCP; QoS não resolve falta de capacidade (se a soma da voz já excede o link, não há o que priorizar); no Wi-Fi, a marcação é mapeada para categorias de acesso (WMM), mas a interferência de rádio continua. Monitore filas e descartes: uma política de QoS sem medição é só suposição.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em qual situação o QoS faz diferença?', 'd', [
          'Em qualquer link, mesmo muito ocioso',
          'Quando o link é aumentado para o dobro',
          'Quando se muda o IP do roteador',
          'Quando a interface de saída está congestionada e é preciso decidir quem é atendido primeiro'
        ], 'O QoS não cria banda: atua nas filas, quando há disputa por ela.'),
        mcq('q2', 'Qual a diferença entre CoS e DSCP?', 'a', [
          'CoS tem 3 bits na tag 802.1Q (camada 2); DSCP tem 6 bits no cabeçalho IP (camada 3)',
          'CoS é do cabeçalho IP e DSCP da tag 802.1Q',
          'Ambos têm 6 bits',
          'CoS só vale para voz'
        ], 'CoS (0–7) vai na tag VLAN; DSCP (0–63) vai no campo DS do pacote IP.'),
        mcq('q3', 'Qual risco da fila de prioridade estrita sem limite?', 'b', [
          'A voz perde prioridade',
          'Starvation: classes menores podem ficar sem banda se o tráfego prioritário for grande',
          'O DSCP é apagado',
          'A fila vira FIFO'
        ], 'Por isso o LLQ limita (policia) a fila de prioridade.'),
        fill('q4', 'Qual o valor decimal do DSCP EF, usado para voz?', 'DSCP EF = ___', ['46'], 'EF = 46 (101110 em binário), valor típico para voz.'),
        mcq('q5', 'Qual a principal diferença entre policing e shaping?', 'c', [
          'Policing usa fila e shaping não',
          'Shaping descarta o excedente e policing atrasa',
          'Policing descarta (ou re-marca) o excedente; shaping o guarda em fila e atrasa',
          'Não há diferença'
        ], 'Policing = corta; shaping = suaviza com buffer (e atraso).'),
        mcq('q6', 'Qual conjunto de características descreve melhor o tráfego de voz?', 'a', [
          'Pouca banda, mas muito sensível a atraso, jitter e perda',
          'Muita banda e tolerante a atraso',
          'Rajadas grandes e retransmissão por TCP',
          'Indiferente a jitter'
        ], 'A voz é leve, porém exige entrega rápida e regular; por isso a fila de prioridade.'),
        mcq('q7', 'Por que um PC de usuário NÃO deve ter sua marcação DSCP aceita na rede?', 'd', [
          'Porque o PC não consegue marcar pacotes',
          'Porque o DSCP só funciona em IPv6',
          'Porque a marcação consome banda',
          'Porque qualquer usuário poderia se declarar "voz" e furar a fila prioritária; a marcação só é confiável na fronteira de confiança'
        ], 'Reescreve-se a marcação de dispositivos não confiáveis; só telefones IP e equipamentos controlados mantêm a sua.'),
        fill('q8', 'Quantos bits tem o campo DSCP no cabeçalho IP?', 'DSCP = ___ bits', ['6', '6 bits'], '6 bits permitem valores de 0 a 63.')
      ]
    },
    {
      id: 'rdi-36-voip-tempo-real-web',
      title: 'VoIP e comunicação em tempo real',
      goal: 'Entender SIP e RTP, calcular a banda de voz, tratar NAT com STUN/TURN/ICE, proteger a telefonia IP e conhecer WebRTC, WebSocket e SSE.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'SIP, RTP, RTCP e SDP',
            'Em telefonia IP há dois planos separados. Sinalização: o SIP (Session Initiation Protocol) estabelece, modifica e encerra chamadas (mensagens como INVITE para chamar, 180 Ringing, 200 OK, ACK e BYE para desligar); usa em geral a porta 5060 (UDP ou TCP) e 5061 para SIP sobre TLS. Mídia: o áudio em si trafega em RTP sobre UDP, em portas dinâmicas (uma faixa definida na configuração), e o RTCP leva estatísticas de qualidade (perda, jitter). O SDP (Session Description Protocol) vai dentro do SIP e descreve a mídia: quais codecs cada lado aceita, o endereço IP e a porta para onde enviar o áudio. Por isso um problema comum é "a chamada toca e atende, mas não há áudio": a sinalização funcionou, a mídia não.',
            'INVITE sip:200@pbx.exemplo.com  (sinalização, porta 5060)\n  SDP: m=audio 10000 RTP ... c=IN IP4 192.0.2.50\n200 OK (com o SDP do outro lado)\n--- áudio RTP/UDP (portas dinâmicas) ---\nBYE'
          ),
          sl(
            'Codecs e banda necessária',
            'O codec converte voz em dados. G.711 (64 kb/s de áudio, sem compressão relevante, qualidade de telefonia) e G.729 (8 kb/s, comprime muito, com qualidade um pouco menor) são exemplos clássicos; o Opus é um codec moderno e flexível, que adapta a taxa e a qualidade e é muito usado em WebRTC. A banda real é MAIOR que a do codec por causa dos cabeçalhos de cada pacote (RTP 12 + UDP 8 + IPv4 20 = 40 bytes). Com pacotes de 20 ms (50 pacotes por segundo): G.711 tem 160 bytes de áudio por pacote, 200 bytes no total, 200 × 8 × 50 = 80.000 b/s = 80 kb/s por chamada e por sentido (camada IP). G.729 tem 20 bytes de áudio, 60 no total, 60 × 8 × 50 = 24.000 b/s = 24 kb/s. Dimensionando: 10 chamadas simultâneas em G.711 consomem 10 × 80 = 800 kb/s em cada sentido do link. Planeje o pico de chamadas simultâneas, não o número de ramais.',
            'G.711: (160 + 40) B x 8 x 50 = 80 kb/s por chamada\nG.729:  (20 + 40) B x 8 x 50 = 24 kb/s por chamada\n10 chamadas G.711 = 800 kb/s por sentido'
          ),
          sl(
            'PBX IP, ramais, troncos e SBC',
            'O PBX IP (central telefônica) conecta ramais entre si e com a rede pública. Asterisk é uma plataforma de código aberto para isso, e o FreePBX é uma interface web de administração sobre o Asterisk. Ramal: o número interno de um telefone ou softphone, registrado no PBX com usuário e senha. Tronco SIP: a ligação entre o PBX e uma operadora ou provedor de telefonia pela internet, para receber e fazer chamadas externas. SBC (Session Border Controller): equipamento ou software que fica na borda da rede, entre o PBX e a internet/operadora; ele protege a telefonia (esconde a topologia interna, filtra e normaliza SIP, limita taxa e ajuda na travessia de NAT).'
          ),
          sl(
            'VoIP e NAT: áudio em um sentido só',
            'O SIP e o SDP carregam endereços IP dentro das mensagens. Um telefone atrás de NAT escreve no SDP o seu IP PRIVADO como destino do áudio; o outro lado envia o RTP para um endereço que não é roteável na internet, e o áudio some em UM dos sentidos (ou nos dois). Soluções: STUN (o cliente pergunta a um servidor público qual é o seu IP e porta públicos e os usa no SDP), TURN (um servidor retransmite a mídia quando a conexão direta é impossível; gasta banda do servidor, mas funciona quase sempre) e ICE, que reúne os candidatos de endereço (local, o descoberto por STUN e o do relé TURN), testa os caminhos e escolhe o melhor. Em redes corporativas, o SBC ou um ALG no firewall também ajudam. Lembre: nunca resolva liberando todas as portas UDP.'
          ),
          sl(
            'QoS, VLAN de voz e PoE',
            'Voz é sensível a atraso, jitter e perda (veja a lição de QoS). Marque o RTP com DSCP EF (46) e use fila de prioridade limitada na saída congestionada. Boa prática no campus: VLAN de voz separada da VLAN de dados; o telefone IP é ligado ao switch e o PC do usuário ao telefone (ele tem uma porta de passagem), então o switch deve aceitar duas VLANs na mesma porta de acesso (a de voz com tag e a de dados sem tag). Separar a voz facilita QoS, limita a escuta de tráfego e permite aplicar ACLs. PoE (Power over Ethernet): o switch alimenta o telefone pelo próprio cabo de rede, dispensando a fonte na mesa; é preciso planejar o orçamento de potência do switch para todos os aparelhos.'
          ),
          sl(
            'WebRTC, WebSocket e SSE',
            'WebRTC permite chamadas de voz, vídeo e dados direto no navegador, sem plugin. Usa ICE (STUN/TURN) para atravessar NAT e cifra por padrão: DTLS faz a troca de chaves e SRTP cifra a mídia. O padrão NÃO define como os lados trocam a sinalização (ofertas e respostas): a aplicação escolhe, muitas vezes por WebSocket. WebSocket: conexão persistente e full-duplex (cliente e servidor enviam quando quiserem) sobre uma única conexão TCP, iniciada por um upgrade HTTP: o cliente pede Upgrade: websocket e o servidor responde 101 Switching Protocols; com TLS, o esquema é wss://. É ideal para chat, jogos e painéis ao vivo. SSE (Server-Sent Events): o servidor envia eventos ao navegador por uma resposta HTTP que fica aberta (somente servidor para cliente, texto, com reconexão automática); mais simples quando só é preciso empurrar dados.',
            'GET /chat HTTP/1.1\nHost: app.exemplo.com\nUpgrade: websocket\nConnection: Upgrade\n\nHTTP/1.1 101 Switching Protocols\nUpgrade: websocket'
          ),
          sl(
            'Segurança e LGPD na telefonia IP',
            'Um servidor SIP exposto à internet é varrido continuamente por robôs que testam senhas de ramais. Quando conseguem, a consequência é a fraude telefônica: ligações caras para destinos pagos, com a conta chegando para a empresa. Defesas: senhas fortes e únicas em ramais e troncos, restringir por firewall as origens permitidas (só IPs da operadora e das filiais), não expor o PBX diretamente (usar SBC ou VPN), limitar chamadas internacionais e o gasto, cifrar com TLS (sinalização) e SRTP (mídia), manter o PBX atualizado e monitorar logs. LGPD: a gravação de chamadas e os metadados (quem ligou para quem, quando, quanto tempo, IPs) são dados pessoais. Informe o interlocutor de que a chamada é gravada, defina finalidade e prazo de retenção, restrinja e audite o acesso às gravações, proteja os arquivos e apague ao fim do prazo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a divisão de papéis entre SIP e RTP em uma chamada?', 'd', [
          'O SIP leva o áudio e o RTP faz o NAT',
          'O RTP faz a sinalização e o SIP leva o áudio',
          'Ambos levam áudio, um em cada sentido',
          'O SIP faz a sinalização (iniciar, atender, encerrar) e o RTP, sobre UDP, leva o áudio'
        ], 'Sinalização e mídia são planos separados. SIP na 5060 (ou 5061 com TLS); RTP em portas dinâmicas.'),
        mcq('q2', 'Um escritório espera no máximo 20 chamadas simultâneas em G.711, pacotes de 20 ms, com RTP+UDP+IPv4. Qual a banda necessária em cada sentido do link?', 'b', [
          '640 kb/s',
          '1.600 kb/s (1,6 Mb/s)',
          '960 kb/s',
          '2.400 kb/s'
        ], 'Cada chamada G.711 usa 80 kb/s por sentido na camada IP: 20 × 80 = 1.600 kb/s. Usar só os 64 kb/s do codec (20 × 64 = 1.280 kb/s) ignoraria os cabeçalhos.'),
        mcq('q3', 'Uma chamada via SIP atende normalmente, mas só um lado ouve o outro. O telefone está atrás de NAT. Qual a causa e o recurso para resolver?', 'a', [
          'O SDP anunciou o IP privado como destino do RTP; use STUN/TURN/ICE ou um SBC',
          'O codec G.711 não funciona em IPv4; troque por G.729',
          'A porta 5060 está fechada; sem ela nem toca',
          'O DSCP EF está desativado, e por isso falta áudio em um sentido'
        ], 'O SDP leva IP e porta de mídia. Com IP privado, o outro lado não consegue enviar. STUN descobre o IP público, TURN retransmite e o ICE escolhe o caminho.'),
        fill('q4', 'Qual o valor decimal do DSCP EF, usado para marcar o RTP de voz?', 'DSCP EF = ___', ['46'], 'EF = 46 (visto em QoS): fila de prioridade limitada para a voz.'),
        mcq('q5', 'O que é um tronco SIP?', 'c', [
          'O cabo que liga o telefone ao switch com PoE',
          'O codec que comprime a voz',
          'A ligação entre o PBX e uma operadora ou provedor de telefonia para chamadas externas',
          'O número interno de cada telefone'
        ], 'Tronco = PBX para operadora. Ramal é o número interno. O SBC protege essa borda.'),
        mcq('q6', 'Qual afirmação sobre WebSocket e SSE está correta?', 'd', [
          'SSE é full-duplex e WebSocket só vai do servidor ao cliente',
          'WebSocket usa UDP e dispensa HTTP',
          'WebSocket nunca funciona com TLS',
          'WebSocket começa com um upgrade HTTP e passa a ser full-duplex persistente; SSE só envia do servidor ao navegador, sobre HTTP'
        ], 'O servidor responde 101 Switching Protocols ao upgrade. SSE é unidirecional, mais simples, com reconexão automática.'),
        mcq('q7', 'Um PBX com SIP exposto à internet começa a gerar ligações internacionais não autorizadas. Qual o conjunto de medidas mais adequado, incluindo o aspecto de LGPD das gravações?', 'b', [
          'Trocar a porta 5060 por outra e manter as senhas atuais; guardar as gravações indefinidamente',
          'Senhas fortes, firewall só com origens permitidas, SBC ou VPN, TLS/SRTP, limite de chamadas; gravações com aviso, finalidade, retenção e acesso restrito',
          'Liberar todas as portas UDP para o PBX e usar G.729',
          'Desativar o QoS e a VLAN de voz'
        ], 'Fraude telefônica vem de senhas fracas e exposição. Gravações e metadados são dados pessoais: finalidade, prazo, acesso mínimo e auditoria.'),
        fill('q8', 'Que código de status HTTP o servidor devolve para aceitar o upgrade para WebSocket?', 'HTTP/1.1 ___ Switching Protocols', ['101'], 'O servidor responde 101 Switching Protocols e a conexão passa a falar WebSocket.')
      ]
    },
    {
      id: 'rdi-16-http-profundidade',
      title: 'HTTP em profundidade',
      goal: 'Entender versões do HTTP, métodos, status, cache, cookies e CORS, e ler a saída de curl -v.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ler uma conversa HTTP com curl -v',
            'O HTTP é pedido e resposta em texto (nas versões 1.x) ou em quadros binários (2 e 3), mas com os mesmos conceitos. O curl -v mostra tudo: linhas com > são o que você enviou (método, caminho, cabeçalhos), linhas com < são o que o servidor respondeu (status e cabeçalhos). Depois dos cabeçalhos vem o corpo. O status na primeira linha da resposta diz se deu certo.',
            '$ curl -v https://exemplo.com/api/itens\n> GET /api/itens HTTP/2\n> Host: exemplo.com\n> Accept: application/json\n>\n< HTTP/2 200\n< content-type: application/json\n< cache-control: max-age=60\n< etag: "abc123"\n<\n[{"id":1}]'
          ),
          sl(
            'Métodos: seguros e idempotentes',
            'Método seguro não deveria alterar nada no servidor (só leitura): GET, HEAD e OPTIONS. Método idempotente é aquele em que repetir a mesma requisição várias vezes deixa o servidor no mesmo estado que uma só vez: GET, HEAD, OPTIONS, PUT (substitui o recurso por completo) e DELETE (apagar de novo continua apagado). POST não é idempotente: repetir pode criar dois pedidos. Isso importa para retentativas: é seguro reenviar automaticamente um PUT após uma falha de rede, mas um POST pode duplicar a operação.',
            'GET    /itens/7   -> lê (seguro, idempotente)\nPUT    /itens/7   -> substitui (idempotente, não seguro)\nDELETE /itens/7   -> apaga (idempotente, não seguro)\nPOST   /itens     -> cria (nem seguro, nem idempotente)'
          ),
          sl(
            'Status codes que você precisa conhecer',
            'A primeira centena indica a família: 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor. Importantes: 200 OK; 201 Created (algo foi criado, típico de POST em API); 204 No Content (sucesso sem corpo); 301 redirecionamento permanente e 302 temporário (o destino vem no cabeçalho Location); 304 Not Modified (use a cópia em cache); 400 requisição inválida; 401 não autenticado (faltam credenciais válidas); 403 autenticado mas sem permissão; 404 não encontrado; 429 muitas requisições; 500 erro interno; 502 Bad Gateway (o proxy recebeu resposta inválida do servidor de trás); 503 indisponível; 504 Gateway Timeout (o servidor de trás demorou demais).',
            '< HTTP/1.1 301 Moved Permanently\n< Location: https://exemplo.com/novo-caminho'
          ),
          sl(
            'HTTP/1.1, HTTP/2 e HTTP/3',
            'No HTTP/1.1 a conexão TCP pode ser reaproveitada (keep-alive), mas as respostas saem uma de cada vez por conexão; por isso navegadores abrem várias conexões. O HTTP/2 é binário e faz multiplexação: muitas requisições e respostas intercaladas ao mesmo tempo numa única conexão TCP, além de comprimir cabeçalhos. Mas se um pacote TCP se perde, todos os fluxos esperam a retransmissão. O HTTP/3 resolve isso rodando sobre o QUIC, que usa UDP e traz criptografia (TLS 1.3) integrada, com fluxos independentes: a perda em um não trava os outros.',
            'HTTP/1.1: texto, TCP, keep-alive\nHTTP/2  : binário, TCP, multiplexação\nHTTP/3  : binário, QUIC sobre UDP'
          ),
          sl(
            'Cache: Cache-Control e ETag',
            'Cache-Control diz quanto tempo e como guardar: max-age=60 permite reutilizar por 60 segundos sem perguntar ao servidor; no-cache permite guardar mas obriga a revalidar antes de usar; no-store proíbe guardar (usado para dados sensíveis). Revalidação: o servidor manda um ETag (identificador da versão do conteúdo); o cliente depois pergunta com If-None-Match. Se nada mudou, o servidor responde 304 Not Modified sem corpo e o cliente usa a cópia local, economizando banda.',
            '> GET /logo.png\n> If-None-Match: "abc123"\n< HTTP/2 304\n(sem corpo: usar a cópia em cache)'
          ),
          sl(
            'Cookies e sessão',
            'O HTTP não guarda memória entre requisições (é sem estado). Para manter login, o servidor envia Set-Cookie com um identificador de sessão e o navegador o devolve no cabeçalho Cookie em cada pedido. Atributos de proteção: HttpOnly impede que JavaScript leia o cookie (reduz roubo via XSS); Secure só envia por HTTPS; SameSite limita o envio em requisições vindas de outros sites (reduz CSRF). Cookies de identificação podem ser dados pessoais (LGPD): guarde o mínimo necessário e informe o titular.',
            '< Set-Cookie: sid=9f8e7d; HttpOnly; Secure; SameSite=Lax; Path=/'
          ),
          sl(
            'CORS e APIs REST',
            'Por segurança, o navegador só deixa o JavaScript de uma origem (esquema + domínio + porta) ler respostas de outra origem se o servidor autorizar. Isso é o CORS: o servidor responde com Access-Control-Allow-Origin indicando a origem permitida. Quem aplica a regra é o navegador; o curl não é afetado. Já uma API REST usa os métodos como verbos sobre recursos identificados por URL (GET /pedidos/42 lê, POST /pedidos cria, DELETE /pedidos/42 apaga) e status para o resultado, normalmente trocando JSON.',
            '> Origin: https://app.exemplo.com\n< Access-Control-Allow-Origin: https://app.exemplo.com'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual método HTTP é idempotente, mas não é seguro?', 'b', [
          'GET',
          'DELETE',
          'POST',
          'HEAD'
        ], 'DELETE altera o servidor (não é seguro), mas repetir o pedido deixa o mesmo estado (idempotente). GET e HEAD são seguros; POST não é idempotente.'),
        mcq('q2', 'No curl -v aparece:\n< HTTP/2 301\n< location: https://exemplo.com/novo\nO que significa?', 'd', [
          'Erro do servidor; tentar de novo mais tarde',
          'O conteúdo não mudou; usar o cache',
          'O recurso foi criado com sucesso',
          'O recurso mudou de lugar de forma permanente; o cliente deve ir à URL do Location'
        ], '301 é redirecionamento permanente e o destino vem no cabeçalho Location. 304 seria "não modificado" e 5xx, erro do servidor.'),
        mcq('q3', 'O que o HTTP/2 traz de principal em relação ao HTTP/1.1?', 'a', [
          'Multiplexação: várias requisições e respostas simultâneas numa única conexão TCP',
          'Troca do TCP pelo UDP',
          'Volta ao formato de texto puro',
          'Eliminação dos cabeçalhos'
        ], 'O HTTP/2 intercala vários fluxos numa conexão TCP. O UDP é a base do HTTP/3 (QUIC).'),
        fill('q4', 'Qual valor de Cache-Control proíbe armazenar a resposta (dados sensíveis)?', 'Cache-Control: ___', ['no-store'], 'no-store proíbe guardar a resposta. no-cache guarda, mas revalida antes de usar.'),
        mcq('q5', 'Qual é o transporte do HTTP/3?', 'c', [
          'TCP com TLS opcional',
          'SCTP',
          'QUIC, que roda sobre UDP',
          'UDP puro, sem criptografia'
        ], 'O HTTP/3 usa QUIC sobre UDP, com TLS 1.3 integrado e fluxos independentes.'),
        mcq('q6', 'Um cliente tem uma cópia com ETag "abc123". Como a revalidação funciona?', 'a', [
          'Ele envia If-None-Match: "abc123"; se não mudou, o servidor responde 304 sem corpo',
          'Ele baixa o arquivo sempre e compara depois',
          'Ele envia Set-Cookie e espera um 200',
          'O servidor responde 404 se o ETag for igual'
        ], 'If-None-Match + 304 Not Modified economiza banda: a cópia local continua válida.'),
        mcq('q7', 'Sobre CORS, qual afirmação está correta?', 'b', [
          'O servidor impede que outras origens enviem requisições de qualquer tipo, inclusive via curl',
          'O navegador bloqueia a leitura da resposta entre origens diferentes, a menos que o servidor envie Access-Control-Allow-Origin adequado',
          'CORS é um protocolo de criptografia entre servidores',
          'CORS só vale para HTTP/1.1'
        ], 'CORS é uma regra aplicada pelo navegador, liberada pelo servidor com cabeçalhos Access-Control-*. O curl não é afetado.'),
        fill('q8', 'Qual atributo do cookie impede que JavaScript o leia?', 'Set-Cookie: sid=9f8e7d; ___; Secure; SameSite=Lax', ['HttpOnly'], 'HttpOnly bloqueia o acesso via JavaScript (document.cookie), reduzindo o impacto de XSS.')
      ]
    },
    {
      id: 'rdi-17-proxies-balanceadores-cdn',
      title: 'Proxies, balanceadores de carga e CDN',
      goal: 'Distinguir proxy direto e reverso, balanceamento L4 e L7, e entender health checks, TLS, CDN e o IP real do cliente.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Forward proxy vs reverse proxy',
            'Um proxy é um intermediário. O forward proxy fica do lado do cliente: os usuários da empresa saem para a internet através dele, e ele pode filtrar sites, registrar acessos e fazer cache. O reverse proxy fica do lado do servidor: o cliente acha que fala com o site, mas o reverse proxy recebe o pedido e o repassa a servidores internos. Ele esconde a topologia, centraliza TLS, cache e proteções. Nginx, HAProxy e Envoy são exemplos comuns de reverse proxy.',
            'Forward : [usuários] -> proxy -> Internet\nReverse : Internet -> proxy -> [servidor A, B, C]'
          ),
          sl(
            'Balanceamento L4 vs L7',
            'Um balanceador de carga distribui as conexões entre vários servidores para escalar e dar redundância. No nível 4 (L4) ele decide só com IP e porta (TCP/UDP): é rápido e simples, mas não enxerga o conteúdo. No nível 7 (L7) ele lê a requisição HTTP e decide por Host, caminho, cabeçalhos ou cookies: por exemplo, /api vai para um grupo de servidores e /imagens para outro. O L7 é mais flexível e custa mais processamento.',
            'L4: 203.0.113.10:443 -> servidor1:443 / servidor2:443\nL7: /api -> pool-api    /static -> pool-estaticos'
          ),
          sl(
            'Algoritmos de distribuição',
            'Round-robin: um servidor de cada vez, em sequência, simples e bom quando requisições e servidores são parecidos. Least connections: escolhe o servidor com menos conexões ativas, melhor quando as requisições têm duração muito diferente. Hash (por IP de origem ou por URL): a mesma entrada vai sempre para o mesmo servidor, útil para afinidade e para caches. Existem versões ponderadas (peso maior para servidores mais fortes).',
            'round-robin     : A, B, C, A, B, C ...\nleast_conn      : vai para quem tem menos conexões abertas\nip_hash         : mesmo IP -> mesmo servidor'
          ),
          sl(
            'Health checks, sticky sessions e terminação TLS',
            'Health check: o balanceador testa periodicamente cada servidor (por exemplo GET /health esperando 200) e tira do rodízio quem falha, devolvendo-o quando se recupera. Sticky session (afinidade) faz o mesmo cliente voltar ao mesmo servidor, por cookie ou hash de IP: resolve apps que guardam sessão na memória, mas distribui de forma desigual e perde a sessão se o servidor cair; o ideal é guardar a sessão em um armazenamento compartilhado. Terminação TLS: o balanceador decifra o HTTPS e fala HTTP (ou outro TLS) com os servidores, centralizando certificados e permitindo ao L7 ler a requisição.',
            'upstream app {\n  server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;\n  server 10.0.1.12:8080 max_fails=3 fail_timeout=10s;\n}'
          ),
          sl(
            'CDN e cache de borda',
            'Uma CDN (Content Delivery Network) é uma rede de servidores espalhados pelo mundo, perto dos usuários. Ela guarda cópias do conteúdo (imagens, scripts, vídeos) em cache de borda e responde sem ir à origem, reduzindo latência e carga no seu servidor, além de absorver picos e ataques de volume. O que é cacheado e por quanto tempo vem dos cabeçalhos Cache-Control; conteúdo alterado exige purga (invalidar o cache) ou um nome de arquivo novo. Conteúdo personalizado por usuário normalmente não deve ser cacheado de forma compartilhada.',
            'usuário (SP) -> borda em SP (HIT: responde)\nusuário (SP) -> borda em SP (MISS) -> origem -> guarda cópia'
          ),
          sl(
            'IP real do cliente: X-Forwarded-For e LGPD',
            'Atrás de um proxy ou balanceador, o servidor vê o IP do proxy, não o do cliente. Para repassar o IP original, o proxy acrescenta o cabeçalho X-Forwarded-For, com a lista de IPs por onde a requisição passou (o primeiro é o cliente original). Só confie nesse cabeçalho se vier de um proxy seu: um cliente pode forjá-lo. O endereço IP identifica pessoa natural em muitos contextos, então é dado pessoal sob a LGPD: registre só se tiver finalidade, defina prazo de retenção curto, restrinja o acesso aos logs e considere anonimizar (por exemplo, mascarar o último octeto) quando a identificação não for necessária.',
            'X-Forwarded-For: 203.0.113.7, 10.0.1.5\n   (cliente original, proxy intermediário)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre um forward proxy e um reverse proxy?', 'c', [
          'O forward proxy fica na frente dos servidores; o reverse, dos clientes',
          'Não há diferença, só o nome muda',
          'O forward atende os clientes internos saindo para a internet; o reverse fica na frente dos servidores e recebe os pedidos de fora',
          'O reverse proxy só funciona com UDP'
        ], 'Forward = lado do cliente, sai para a internet. Reverse = lado do servidor, recebe e repassa a servidores internos.'),
        mcq('q2', 'Você quer enviar /api para um grupo de servidores e /imagens para outro. Que tipo de balanceamento é necessário?', 'a', [
          'L7, que lê a requisição HTTP (caminho, Host, cookies)',
          'L4, que decide só por IP e porta',
          'Nenhum: o DNS resolve isso',
          'O round-robin simples resolve'
        ], 'Decidir por caminho exige ler o conteúdo HTTP, ou seja, balanceamento de camada 7.'),
        mcq('q3', 'As requisições têm durações muito diferentes (algumas rápidas, outras muito longas). Qual algoritmo tende a distribuir melhor a carga?', 'd', [
          'Round-robin',
          'Hash por IP de origem',
          'Sempre o primeiro servidor',
          'Least connections'
        ], 'Least connections considera quantas conexões cada servidor tem agora, compensando requisições longas. O round-robin ignora a carga real.'),
        fill('q4', 'Quando o balanceador decifra o HTTPS e fala HTTP com os servidores, chamamos isso de ___ TLS.', '# o balanceador faz a ___ TLS (decifra aqui)', ['terminação', 'terminacao', 'termination'], 'Terminação TLS: a conexão cifrada acaba no balanceador, que centraliza certificados e consegue ler a requisição.'),
        mcq('q5', 'Para que serve o health check do balanceador?', 'b', [
          'Cifrar o tráfego entre cliente e servidor',
          'Testar periodicamente os servidores e tirar do rodízio os que falham',
          'Descobrir o IP real do cliente',
          'Guardar a sessão do usuário'
        ], 'O health check detecta servidores com problema e evita enviar clientes a eles, devolvendo-os quando se recuperam.'),
        mcq('q6', 'Qual é uma desvantagem das sticky sessions?', 'd', [
          'Impedem o uso de HTTPS',
          'Exigem que todos os servidores tenham o mesmo IP',
          'Só funcionam em L4 com UDP',
          'Distribuem a carga de forma desigual e a sessão se perde se aquele servidor cair'
        ], 'A afinidade prende o cliente a um servidor: desequilibra a carga e a sessão em memória some se ele cair. O ideal é sessão em armazenamento compartilhado.'),
        mcq('q7', 'Qual é o principal benefício de uma CDN para o seu site?', 'c', [
          'Dispensa o uso de TLS',
          'Troca o protocolo HTTP por UDP',
          'Responde com cópias em cache de servidores perto do usuário, reduzindo latência e carga na origem',
          'Impede que qualquer conteúdo seja cacheado'
        ], 'A borda da CDN guarda cópias do conteúdo e responde sem ir à origem, melhorando a velocidade e aliviando o servidor.'),
        fill('q8', 'Qual cabeçalho carrega o IP original do cliente quando há proxy (lembrando que o IP é dado pessoal, então a retenção deve ser mínima)?', 'X-Forwarded-___: 203.0.113.7', ['For'], 'X-Forwarded-For lista os IPs por onde a requisição passou. Só confie se vier do seu próprio proxy, e trate o IP como dado pessoal (LGPD).')
      ]
    },
    {
      id: 'rdi-18-tls-pki-basico',
      title: 'TLS, HTTPS e certificados',
      goal: 'Entender o que o TLS garante, como funciona o handshake e a cadeia de certificados, e interpretar erros de certificado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que o TLS garante',
            'O TLS (usado pelo HTTPS) dá três garantias: confidencialidade (ninguém no caminho lê o conteúdo, graças à cifragem), integridade (qualquer alteração em trânsito é detectada) e autenticação (você confirma que fala com o dono do domínio, por meio do certificado). Ele não protege o dado depois que chega ao servidor e não esconde com quem você está falando (o IP continua visível).',
            'HTTPS = HTTP dentro de TLS\nconfidencialidade + integridade + autenticação do servidor'
          ),
          sl(
            'Handshake TLS em visão geral',
            'No início, cliente e servidor negociam. O cliente envia ClientHello (versões e cifras que suporta, e o nome do site pedido). O servidor responde com a versão escolhida e seu certificado. Os dois acertam uma chave por troca de chaves (com criptografia assimétrica, em que o certificado prova a identidade do servidor) e derivam chaves de sessão simétricas. A partir daí, os dados trafegam cifrados com a chave simétrica, muito mais rápida que a assimétrica.',
            'Cliente -> ClientHello (versões, cifras, SNI)\nServidor -> ServerHello + certificado\nambos -> trocam chaves, derivam a chave de sessão\nambos -> dados cifrados (simétrico)'
          ),
          sl(
            'Certificado X.509 e cadeia de confiança',
            'O certificado X.509 liga uma chave pública a um nome (o domínio), com validade e assinatura de quem o emitiu. Quem confia em quem: o sistema ou navegador traz uma lista de CAs raiz (autoridades certificadoras) confiáveis. A raiz assina CAs intermediárias, e a intermediária assina o certificado do seu site. O servidor deve enviar o certificado do site e as intermediárias; a raiz já está no repositório de confiança do cliente. Se a cadeia está incompleta ou termina numa CA desconhecida, a validação falha.',
            'CA raiz (já confiada no cliente)\n  -> CA intermediária\n      -> certificado de exemplo.com'
          ),
          sl(
            'SNI e HSTS',
            'Um mesmo IP pode hospedar vários sites HTTPS. O SNI (Server Name Indication) é o campo do ClientHello em que o cliente diz qual nome quer, para o servidor escolher o certificado certo. Em geral o SNI trafega visível. O HSTS é um cabeçalho (Strict-Transport-Security) que manda o navegador usar sempre HTTPS naquele domínio por um tempo, impedindo downgrade para HTTP e ataques de remoção de TLS.',
            'Strict-Transport-Security: max-age=31536000; includeSubDomains'
          ),
          sl(
            'Let\'s Encrypt e ACME',
            'O ACME é o protocolo que automatiza emissão e renovação de certificados: um agente no servidor prova que controla o domínio (respondendo a um desafio por HTTP ou pondo um registro no DNS) e a CA emite o certificado. O Let\'s Encrypt é uma CA gratuita que usa ACME. Como a emissão é automatizada, a renovação também deve ser: certificado vencido é uma das causas mais comuns de indisponibilidade. Para checar o certificado e o SNI na linha de comando: openssl s_client.',
            'openssl s_client -connect exemplo.com:443 -servername exemplo.com'
          ),
          sl(
            'Erros de certificado: o que significam',
            'Expirado: passou da data de validade (renove). Nome não confere: o domínio acessado não está no certificado (certificado para outro nome ou acesso por IP). Emissor não confiável ou autoassinado: a CA não está no repositório de confiança (comum em testes e redes internas; ou sinal de interceptação). Cadeia incompleta: faltou enviar a intermediária. Relógio errado no cliente também causa "ainda não válido". Nunca clique em "continuar mesmo assim" em contas reais: o aviso existe porque a autenticação falhou.',
            'verify error: certificate has expired\nverify error: hostname mismatch\nverify error: self-signed certificate'
          ),
          sl(
            'TLS 1.2 vs TLS 1.3',
            'O TLS 1.3 é mais rápido e mais seguro. Seu handshake completo precisa de uma ida e volta (1-RTT), contra duas no TLS 1.2, e permite retomada de sessão ainda mais rápida. Ele removeu algoritmos antigos e fracos e só mantém cifras modernas com sigilo futuro (forward secrecy: vazar a chave do servidor depois não decifra tráfego antigo). O TLS 1.2 ainda é muito usado, mas versões mais antigas (SSL, TLS 1.0 e 1.1) estão obsoletas e devem ser desativadas.',
            'TLS 1.2: 2 idas e voltas no handshake\nTLS 1.3: 1 ida e volta, só cifras modernas'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual propriedade do TLS garante que você está falando com o dono real do domínio?', 'a', [
          'Autenticação, por meio do certificado do servidor',
          'Confidencialidade, por meio da cifragem',
          'Integridade, por meio do SNI',
          'Compressão dos dados'
        ], 'O certificado assinado por uma CA confiável autentica o servidor. A cifragem dá confidencialidade e a verificação de alterações dá integridade.'),
        mcq('q2', 'Por que o servidor deve enviar o certificado intermediário junto com o do site?', 'c', [
          'Para economizar banda',
          'Porque a CA raiz não existe',
          'Para o cliente conseguir montar a cadeia até uma raiz que já confia (a raiz está no repositório local)',
          'Porque o certificado do site não tem assinatura'
        ], 'A raiz já está no repositório de confiança do cliente, mas a intermediária não necessariamente. Sem ela, a cadeia fica incompleta.'),
        mcq('q3', 'Um usuário acessa https://192.0.2.10 e o navegador reclama que o nome não confere. Qual é a causa mais provável?', 'b', [
          'O certificado expirou há anos',
          'O certificado é emitido para um nome de domínio, e o acesso foi feito pelo IP, que não consta nele',
          'O TLS 1.3 não funciona com IPs',
          'A CA raiz foi removida'
        ], 'Certificados são validados contra o nome acessado. Acessando pelo IP, o nome do certificado não confere.'),
        fill('q4', 'Qual cabeçalho obriga o navegador a usar sempre HTTPS naquele domínio?', '___-Transport-Security: max-age=31536000', ['Strict'], 'O HSTS é o cabeçalho Strict-Transport-Security.'),
        mcq('q5', 'Para que serve o SNI no handshake?', 'd', [
          'Cifrar os dados da aplicação',
          'Renovar o certificado automaticamente',
          'Escolher a versão do TLS',
          'Informar ao servidor qual nome de site o cliente quer, para ele apresentar o certificado certo num IP compartilhado'
        ], 'O SNI vai no ClientHello e permite hospedar vários sites HTTPS no mesmo IP, cada um com seu certificado.'),
        mcq('q6', 'O que faz o ACME (usado pelo Let\'s Encrypt)?', 'c', [
          'Cifra o tráfego de e-mail',
          'Substitui o DNS',
          'Automatiza a prova de controle do domínio e a emissão e renovação de certificados',
          'Impede ataques de DDoS'
        ], 'O ACME automatiza a emissão e a renovação: o agente prova que controla o domínio e a CA emite o certificado.'),
        mcq('q7', 'Qual é uma melhoria do TLS 1.3 sobre o 1.2?', 'a', [
          'Handshake mais curto (1-RTT) e remoção de algoritmos antigos e fracos',
          'Não usa criptografia simétrica',
          'Dispensa certificados',
          'Funciona apenas sobre UDP'
        ], 'O TLS 1.3 reduz as idas e voltas e só mantém cifras modernas com sigilo futuro.'),
        fill('q8', 'Qual opção do openssl s_client define o nome enviado no SNI?', 'openssl s_client -connect exemplo.com:443 -___ exemplo.com', ['servername'], 'A opção -servername define o SNI enviado no ClientHello.')
      ]
    },
    {
      id: 'rdi-19-vpns',
      title: 'VPNs',
      goal: 'Entender tipos de VPN, túnel e encapsulamento, IPsec, OpenVPN e WireGuard, split tunneling e boas práticas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Túnel e encapsulamento',
            'Uma VPN (rede privada virtual) cria um túnel: o pacote original (com IPs privados) é cifrado e colocado dentro de outro pacote, com IPs públicos, que atravessa a internet até o outro ponto da VPN, onde é aberto e entregue. Esse empacotamento é o encapsulamento. Por causa do cabeçalho extra, o pacote fica maior e o MTU efetivo diminui, o que pode causar fragmentação se não for ajustado.',
            'pacote interno : 10.8.0.2 -> 192.168.10.5   (cifrado)\npacote externo : 198.51.100.4 -> 203.0.113.10 (o que a internet vê)'
          ),
          sl(
            'Site-to-site vs acesso remoto',
            'Site-to-site liga duas redes inteiras (matriz e filial) por um túnel permanente entre dois gateways; os computadores nem sabem que existe VPN. Acesso remoto liga um usuário individual (notebook, celular) à rede da empresa: o usuário abre um cliente VPN, autentica e recebe um IP interno. Muito usado em trabalho remoto. Ambos permitem usar endereços privados como se estivessem na mesma rede.',
            'site-to-site : [LAN matriz] <== túnel ==> [LAN filial]\nacesso remoto: [notebook] == túnel ==> [gateway VPN] -> LAN'
          ),
          sl(
            'IPsec: IKE e ESP',
            'O IPsec é um conjunto de protocolos na camada de rede, muito usado em site-to-site. O IKE (Internet Key Exchange) autentica as pontas (chave pré-compartilhada ou certificados) e negocia algoritmos e chaves, normalmente em UDP 500 (e 4500 com NAT). O ESP (Encapsulating Security Payload) é quem protege os dados, com cifragem, integridade e autenticação de cada pacote. No modo túnel o pacote IP original inteiro é encapsulado e protegido; no modo transporte só a carga útil é protegida.',
            'IKE : negocia chaves e autentica as pontas (UDP 500/4500)\nESP : cifra e autentica os pacotes de dados'
          ),
          sl(
            'OpenVPN, WireGuard e SSL/TLS VPN',
            'OpenVPN é uma solução de código aberto que usa TLS para autenticação e troca de chaves, flexível, rodando sobre UDP ou TCP. WireGuard é moderno, com código pequeno e fácil de auditar: cada ponta tem um par de chaves, e o campo AllowedIPs diz que destinos seguem pelo túnel. Uma SSL/TLS VPN dá acesso por TLS (às vezes por navegador, a apenas algumas aplicações), atravessando firewalls com facilidade por usar a porta 443. A escolha depende de compatibilidade, desempenho e gestão.',
            '[Interface]\nAddress = 10.8.0.2/32\nPrivateKey = <chave-privada-nunca-compartilhar>\n\n[Peer]\nPublicKey = <chave-publica-do-servidor>\nEndpoint = 203.0.113.10:51820\nAllowedIPs = 10.8.0.0/24, 192.168.10.0/24'
          ),
          sl(
            'Split tunneling e full tunnel',
            'No full tunnel todo o tráfego do usuário vai pelo túnel (em WireGuard, AllowedIPs = 0.0.0.0/0): a empresa consegue inspecionar e filtrar tudo, mas sobrecarrega o link da VPN. No split tunneling só o tráfego para as redes da empresa vai pelo túnel; o resto sai direto pela internet do usuário. É mais leve, porém o notebook fica ao mesmo tempo na rede doméstica e na corporativa, e um malware ali pode servir de ponte. É uma decisão de risco, não só de desempenho.',
            '# split: só a rede da empresa pelo túnel\nAllowedIPs = 192.168.10.0/24\n# full tunnel: tudo pelo túnel\nAllowedIPs = 0.0.0.0/0'
          ),
          sl(
            'Riscos e boas práticas',
            'A VPN é uma porta de entrada: se for comprometida, o invasor está dentro. Boas práticas: autenticação multifator; contas individuais (nunca login compartilhado); acesso apenas às redes e sistemas necessários (mínimo privilégio, com regras de firewall por perfil); atualizar o servidor de VPN; chaves privadas protegidas e revogáveis quando alguém sai da empresa; e registros de acesso com finalidade definida e retenção curta, já que os logs identificam pessoas (LGPD). Dispositivos que conectam também precisam estar atualizados e protegidos.',
            'regra de firewall: grupo "financeiro" -> só 192.168.20.0/24\nregra de firewall: grupo "suporte"    -> só 192.168.30.0/24'
          ),
          sl(
            'VPN comercial não é anonimato',
            'Uma VPN comercial (de consumidor) leva seu tráfego até o servidor dela, mudando o IP que os sites veem e protegendo você de quem está na mesma rede Wi-Fi aberta. Mas isso não garante anonimato: o provedor da VPN passa a ver seu tráfego e o IP real, sites ainda identificam você por login, cookies e fingerprinting, e a proteção depende da confiança no provedor e nas suas políticas de log. É uma ferramenta de privacidade parcial, não uma capa de invisibilidade nem de impunidade.',
            'você -> [VPN comercial] -> site\nsite vê o IP da VPN; a VPN vê o seu IP real e o destino'
          )
        ]
      },
      questions: [
        mcq('q1', 'Matriz e filial ficam ligadas por um túnel permanente entre dois roteadores, e os usuários nem percebem. Que tipo de VPN é e o que acontece com os pacotes?', 'd', [
          'Acesso remoto; os pacotes vão sem proteção',
          'Acesso remoto; cada usuário abre um cliente',
          'Site-to-site; os pacotes são apenas roteados, sem encapsulamento',
          'Site-to-site; o pacote original é cifrado e encapsulado dentro de outro pacote com IPs públicos'
        ], 'Site-to-site liga redes inteiras. O encapsulamento coloca o pacote interno cifrado dentro de um pacote externo.'),
        mcq('q2', 'No IPsec, qual a função do IKE?', 'b', [
          'Cifrar cada pacote de dados',
          'Autenticar as pontas e negociar algoritmos e chaves',
          'Substituir o DNS',
          'Escolher o melhor caminho de roteamento'
        ], 'O IKE negocia e autentica; o ESP é quem cifra e autentica os pacotes de dados.'),
        mcq('q3', 'No WireGuard, o cliente tem AllowedIPs = 192.168.10.0/24. O que isso significa?', 'c', [
          'Todo o tráfego do cliente vai pelo túnel',
          'O cliente só aceita conexões vindas da internet',
          'Só o tráfego para 192.168.10.0/24 segue pelo túnel; o resto sai direto (split tunneling)',
          'O túnel está desativado'
        ], 'AllowedIPs define quais destinos usam o túnel. Só uma rede interna = split tunneling.'),
        fill('q4', 'No IPsec, qual protocolo protege (cifra e autentica) os pacotes de dados? Responda com a sigla.', '# IKE negocia as chaves; ___ protege os dados', ['ESP'], 'ESP (Encapsulating Security Payload) cifra e autentica os dados. O IKE só negocia.'),
        mcq('q5', 'Qual é um risco do split tunneling?', 'a', [
          'O dispositivo fica ao mesmo tempo na rede doméstica e na corporativa, e um malware ali pode servir de ponte',
          'Todo o tráfego passa pelo servidor da empresa',
          'O túnel deixa de usar criptografia',
          'Impede o acesso à internet'
        ], 'Com split tunneling, o notebook liga duas redes. O full tunnel permite inspecionar tudo, mas pesa no link.'),
        mcq('q6', 'Qual conjunto de práticas é mais adequado para uma VPN corporativa de acesso remoto?', 'b', [
          'Um login e senha compartilhado pela equipe, para facilitar',
          'Contas individuais com MFA, acesso só às redes necessárias e logs com retenção curta',
          'Liberar acesso total à rede interna a todos os usuários',
          'Guardar logs de acesso para sempre, por segurança'
        ], 'Contas individuais, MFA e mínimo privilégio reduzem o risco. Logs identificam pessoas: retenção só pelo necessário (LGPD).'),
        mcq('q7', 'Uma VPN comercial garante anonimato total na internet?', 'd', [
          'Sim, porque cifra todo o tráfego',
          'Sim, porque esconde todos os cookies',
          'Sim, porque impede qualquer rastreio',
          'Não: o provedor vê seu tráfego e seu IP, e sites ainda identificam você por login, cookies e fingerprinting'
        ], 'Muda o IP visível e protege em Wi-Fi aberto, mas a confiança passa ao provedor e a identificação por outros meios continua.'),
        fill('q8', 'Qual valor de AllowedIPs, no WireGuard, envia todo o tráfego IPv4 pelo túnel (full tunnel)? Responda só com o endereço, sem a barra.', 'AllowedIPs = ___/0', ['0.0.0.0'], 'O prefixo 0.0.0.0/0 casa com qualquer destino IPv4, mandando tudo pelo túnel.')
      ]
    },
    {
      id: 'rdi-20-wifi-avancado',
      title: 'Wi-Fi avançado',
      goal: 'Entender bandas, canais e larguras, MIMO, roaming e mesh, WPA2/WPA3 Personal e Enterprise, 802.1X e a segurança de redes de convidados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Padrões 802.11 em visão geral',
            'O 802.11n (Wi-Fi 4) operava em 2,4 e 5 GHz e introduziu o MIMO. O 802.11ac (Wi-Fi 5) trabalha só em 5 GHz, com canais mais largos e MU-MIMO para downlink. O 802.11ax (Wi-Fi 6) opera em 2,4 e 5 GHz, melhora a eficiência com muitos clientes (OFDMA) e, na versão Wi-Fi 6E, também usa a faixa de 6 GHz. Velocidades de catálogo são o máximo teórico: o desempenho real depende de canal, distância, interferência e do cliente.',
            'n  (Wi-Fi 4): 2,4 e 5 GHz\nac (Wi-Fi 5): 5 GHz\nax (Wi-Fi 6): 2,4 e 5 GHz  | 6E: + 6 GHz'
          ),
          sl(
            'Bandas e canais',
            'Em 2,4 GHz há poucos canais e eles se sobrepõem: os canais 1, 6 e 11 são os que não se sobrepõem entre si com largura de 20 MHz, por isso são os usados em planos de canais. Essa faixa tem o maior alcance e a maior interferência (micro-ondas, Bluetooth, vizinhos). A faixa de 5 GHz tem mais canais, menos interferência e mais velocidade, porém menor alcance e atravessa menos paredes. A de 6 GHz tem ainda mais espaço limpo, porém só para dispositivos compatíveis e com alcance semelhante ou menor que o de 5 GHz.',
            '2,4 GHz: alcance maior, poucos canais, mais ruído\n5 GHz  : mais canais e velocidade, alcance menor\n6 GHz  : espaço limpo, só clientes compatíveis'
          ),
          sl(
            'Largura de canal e MIMO',
            'A largura do canal (20, 40, 80, 160 MHz) é como uma estrada mais larga: mais velocidade possível, mas ocupa mais espectro. Canais largos deixam menos canais sem sobreposição e sofrem mais interferência, então em ambientes com muitos APs (escritórios, condomínios) canais de 20 ou 40 MHz costumam ser melhores. MIMO usa várias antenas para enviar fluxos espaciais simultâneos e aumentar a capacidade; o MU-MIMO permite atender vários clientes ao mesmo tempo.',
            '2,4 GHz com 40 MHz -> quase não sobra canal sem sobreposição\n5 GHz com 80 MHz   -> bom em casa, ruim em ambiente densíssimo'
          ),
          sl(
            'Roaming e mesh',
            'Para cobrir um prédio, vários APs usam o mesmo SSID e o cliente troca de AP ao se mover (roaming). Quem decide é o cliente, que às vezes fica "grudado" num AP distante; padrões como 802.11k, v e r ajudam o cliente a escolher e a trocar rápido sem perder chamadas. Numa rede mesh, os nós conversam entre si; se a ligação entre eles (backhaul) for sem fio, parte da capacidade do rádio é gasta repassando dados, e a velocidade cai a cada salto. Backhaul por cabo é sempre melhor.',
            'AP1 (canal 1) --cabo-- switch --cabo-- AP2 (canal 6)\nmesmo SSID, canais diferentes, backhaul cabeado'
          ),
          sl(
            'WPA2/WPA3 Personal vs Enterprise e 802.1X',
            'Personal usa uma senha única compartilhada (WPA2 com PSK; WPA3 troca isso pelo SAE, que resiste a ataques de dicionário offline). O problema: todos usam a mesma senha, e quem sai da empresa leva a senha. O Enterprise usa 802.1X: cada pessoa se autentica com credencial própria (usuário e senha ou certificado), e o AP consulta um servidor RADIUS que valida. O EAP é o conjunto de métodos de autenticação transportados: PEAP (senha dentro de túnel TLS) e EAP-TLS (certificados dos dois lados, o mais forte). Revogar um usuário não exige trocar a senha de todos.',
            'cliente <-802.1X/EAP-> AP <-RADIUS-> servidor de autenticação'
          ),
          sl(
            'Site survey, interferência e lentidão',
            'O site survey é o levantamento do local, com medição de sinal e interferência (por mapa de calor, em ferramentas de análise), para decidir onde pôr APs, canais e potência. Causas comuns de lentidão: muitos APs no mesmo canal (interferência co-canal), potência alta demais (cliente enxerga APs que não consegue responder), canal largo demais, clientes antigos que reduzem a velocidade do canal, backhaul fraco, muitos clientes por AP e fontes externas como micro-ondas. Mais potência nem sempre é melhor.',
            'sintoma: lento só no fim da tarde, no 2,4 GHz\ncausa provável: congestão e interferência co-canal'
          ),
          sl(
            'Rede de convidados',
            'Convidados não devem enxergar a rede interna. Boas práticas: SSID separado, mapeado a uma VLAN própria, com regras de firewall que permitem apenas internet (e bloqueiam acesso às redes internas); isolamento de clientes (um convidado não fala com outro); limites de banda; senha trocada periodicamente ou portal com aceite de termos. Se houver registro de acesso, ele guarda dados pessoais: colete o mínimo e defina um prazo de retenção.',
            'SSID Convidados -> VLAN 30 -> firewall: permitir internet, negar redes internas'
          )
        ]
      },
      questions: [
        mcq('q1', 'Quais canais de 2,4 GHz (20 MHz) não se sobrepõem entre si, sendo os mais usados em planos de canais?', 'b', [
          '1, 2 e 3',
          '1, 6 e 11',
          '3, 4 e 5',
          '2, 5 e 8'
        ], 'Os canais 1, 6 e 11 têm espaçamento suficiente para não se sobrepor com largura de 20 MHz.'),
        mcq('q2', 'Qual é a principal desvantagem de 5 GHz em relação a 2,4 GHz?', 'a', [
          'Menor alcance e menor capacidade de atravessar paredes',
          'Menos canais disponíveis',
          'Mais interferência de micro-ondas',
          'Velocidade menor'
        ], '5 GHz oferece mais canais, menos ruído e mais velocidade, mas o sinal alcança menos e perde mais nas paredes.'),
        mcq('q3', 'Em um prédio com muitos APs próximos, por que escolher canais muito largos (por exemplo 160 MHz) pode piorar o desempenho?', 'd', [
          'Porque o canal largo não funciona com WPA3',
          'Porque reduz a potência do sinal a zero',
          'Porque desativa o roaming',
          'Porque sobram poucos canais sem sobreposição e a interferência co-canal aumenta'
        ], 'Quanto mais largo o canal, menos canais distintos; APs vizinhos acabam no mesmo canal e disputam o ar.'),
        fill('q4', 'O Wi-Fi Enterprise usa 802.1X e o AP consulta um servidor de autenticação chamado:', 'AP <-> servidor ___ (autenticação 802.1X)', ['RADIUS'], 'O RADIUS valida as credenciais individuais no Enterprise, substituindo a senha única compartilhada.'),
        mcq('q5', 'Qual é a vantagem do WPA2/WPA3-Enterprise sobre o Personal?', 'c', [
          'Dispensa criptografia',
          'Usa uma senha ainda mais simples',
          'Cada usuário tem credencial própria, e é possível revogar um sem trocar a senha de todos',
          'Funciona só com cabo'
        ], 'No Personal todos compartilham a senha. No Enterprise, a autenticação individual (802.1X/RADIUS) permite controle e revogação por usuário.'),
        mcq('q6', 'Numa rede mesh com backhaul sem fio, o que costuma acontecer com a velocidade a cada salto?', 'a', [
          'Cai, porque o mesmo rádio é usado para clientes e para repassar dados entre os nós',
          'Aumenta, porque o sinal é repetido',
          'Não muda nunca',
          'Dobra'
        ], 'O backhaul sem fio consome capacidade do rádio. Backhaul cabeado evita a perda.'),
        mcq('q7', 'O Wi-Fi do escritório fica lento só no fim da tarde e todos os APs usam o canal 6 em 2,4 GHz. Qual é a causa mais provável e a ação adequada?', 'c', [
          'Senha WPA fraca; trocar a senha',
          'Falta de MIMO; comprar roteador novo',
          'Interferência co-canal entre APs; distribuir canais (1, 6, 11) e reduzir a potência',
          'O DNS está lento; trocar o servidor'
        ], 'APs no mesmo canal disputam o mesmo ar. Planejar canais e potência (site survey) resolve mais que trocar equipamento.'),
        fill('q8', 'A rede de convidados deve ser mapeada a uma ___ própria, separada da rede interna.', 'SSID Convidados -> ___ 30 -> firewall', ['VLAN'], 'Uma VLAN própria, mais regras de firewall, isola os convidados da rede interna.')
      ]
    },
    {
      id: 'rdi-21-monitoramento-snmp-syslog-netflow',
      title: 'Monitoramento e gerenciamento: SNMP, syslog e NetFlow',
      goal: 'Monitorar a rede com SNMP, syslog, fluxos e NTP, definir baseline e alertas e tratar logs com minimização e retenção (LGPD).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'SNMP: gerente, agente, MIB e OID',
            'O SNMP permite consultar e gerenciar dispositivos de rede. O agente roda no dispositivo (roteador, switch, servidor) e expõe informações; o gerente (sistema de monitoramento) consulta. Os dados ficam numa MIB (Management Information Base), uma árvore de objetos em que cada item tem um OID, o identificador numérico (por exemplo, 1.3.6.1.2.1.1.5.0 é o nome do equipamento, sysName). Operações principais: GET (ler), SET (alterar) e TRAP (o agente avisa o gerente por conta própria quando algo acontece, como interface caindo). Usa UDP: 161 para consultas e 162 para traps.',
            'gerente --GET sysName--> agente (switch)\ngerente <--resposta-------- agente\ngerente <--TRAP: interface 3 down-- agente'
          ),
          sl(
            'Versões do SNMP e segurança',
            'O SNMPv1 e o v2c autenticam apenas com a community string, uma espécie de senha que trafega em texto puro e costuma estar com valor padrão ("public"), o que é um risco sério, principalmente para SET. O SNMPv3 acrescenta autenticação de usuário e criptografia (nível authPriv). Boas práticas: usar v3, desativar SNMP onde não for necessário, limitar quem pode consultar (por IP de origem), preferir acesso somente leitura e nunca deixar a community padrão.',
            'snmpget -v3 -l authPriv -u monitor \\\n  -a SHA -A "<senha-auth>" -x AES -X "<senha-priv>" \\\n  192.0.2.1 1.3.6.1.2.1.1.5.0'
          ),
          sl(
            'Syslog e níveis de severidade',
            'O syslog é o padrão para os dispositivos enviarem mensagens de log a um servidor central (tradicionalmente UDP 514), onde ficam preservadas mesmo que o equipamento seja reiniciado ou comprometido. Cada mensagem tem uma severidade de 0 a 7, e o número menor é o mais grave: 0 emergency, 1 alert, 2 critical, 3 error, 4 warning, 5 notice, 6 informational, 7 debug. Os alertas costumam disparar a partir de um nível (por exemplo, 3 ou menor).',
            '<189>Oct  3 10:15:01 sw01 %LINK-3-UPDOWN: Interface Gi0/3, changed state to down\n(severidade 3 = error)'
          ),
          sl(
            'NetFlow, IPFIX e sFlow',
            'Em vez de guardar cada pacote, o NetFlow registra fluxos: um resumo por conversa (IPs de origem e destino, portas, protocolo, bytes, pacotes e horários). Não guarda o conteúdo, só os metadados, então é leve e ótimo para saber quem consome a banda, detectar anomalias e planejar capacidade. IPFIX é a versão padronizada do conceito. O sFlow trabalha por amostragem: examina 1 a cada N pacotes e estima o total. Captura de pacotes (Wireshark) é detalhe máximo e pesado; fluxo é visão agregada.',
            'origem          destino         porta proto  bytes\n192.168.1.20    198.51.100.8    443   TCP    1.2M\n192.168.1.35    203.0.113.5     53    UDP    340'
          ),
          sl(
            'NTP: relógios sincronizados',
            'Para correlacionar eventos de dispositivos diferentes (um log do firewall com o do servidor), os relógios precisam estar iguais; com horários divergentes, a investigação de um incidente vira um quebra-cabeça. O NTP (UDP 123) sincroniza os relógios com servidores de tempo confiáveis. Prática comum: alguns servidores internos sincronizam com fontes externas e todos os equipamentos usam esses servidores internos. Logs com hora correta também têm valor probatório e de auditoria.',
            'ntp server 192.0.2.123\n(todos os equipamentos apontam para o mesmo servidor de tempo)'
          ),
          sl(
            'Baseline, alertas e ferramentas',
            'O baseline é o retrato do comportamento normal da rede (uso de banda por horário, latência, CPU dos equipamentos). Sem ele não dá para saber se 70% de uso é normal ou alerta. Alertas devem ser acionáveis: poucos, com limites baseados no baseline e severidade clara; alertas demais geram "fadiga" e passam a ser ignorados. Ferramentas de monitoramento comuns: Zabbix, LibreNMS, Nagios, PRTG, e pilhas como Prometheus com Grafana. Elas combinam SNMP, syslog, fluxos e checagens ativas (ping, HTTP).',
            'baseline: uso normal do link às 10h = 40%\nalerta: > 85% por 10 minutos (não: qualquer pico de 1 segundo)'
          ),
          sl(
            'Dados pessoais em logs e fluxos',
            'Logs e fluxos contêm endereços IP, nomes de usuário, URLs e horários de acesso, que podem identificar pessoas: são dados pessoais sob a LGPD. Princípios: finalidade (guarde para segurança e operação, não "por via das dúvidas"), minimização (registre só o necessário; evite guardar senhas, tokens ou conteúdo de requisições), retenção definida (apague ou anonimize depois do prazo), acesso restrito e protegido dos próprios logs (integridade e confidencialidade), e transparência sobre a coleta. Use envio centralizado e seguro, com permissões mínimas.',
            'política de logs (exemplo):\n- finalidade: segurança e diagnóstico\n- retenção: prazo definido e documentado\n- acesso: só equipe de segurança/infra'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como um switch pode avisar o sistema de monitoramento, sem ser consultado, que uma interface caiu?', 'c', [
          'Por um GET periódico',
          'Por um SET no gerente',
          'Por um TRAP SNMP enviado ao gerente',
          'Por uma consulta DNS'
        ], 'O TRAP é a notificação espontânea do agente ao gerente. GET e SET são operações iniciadas pelo gerente.'),
        mcq('q2', 'Qual é a razão de preferir SNMPv3 ao v2c?', 'd', [
          'O v3 usa TCP e é mais rápido',
          'O v2c não permite leitura de OIDs',
          'O v3 não precisa de MIB',
          'O v3 oferece autenticação de usuário e criptografia; o v2c depende de uma community string em texto puro'
        ], 'No v1 e v2c a community trafega em texto puro. O v3 acrescenta autenticação e criptografia (authPriv).'),
        mcq('q3', 'Entre as severidades syslog 2 (critical), 4 (warning) e 6 (informational), qual é a mais grave?', 'a', [
          '2 (critical): número menor significa mais grave',
          '4 (warning)',
          '6 (informational)',
          'Todas têm a mesma gravidade'
        ], 'Em syslog, 0 é o mais grave (emergency) e 7 o menos grave (debug).'),
        fill('q4', 'Qual protocolo sincroniza os relógios dos equipamentos, essencial para correlacionar logs?', 'ntp server 192.0.2.123   # protocolo: ___', ['NTP'], 'O NTP mantém os relógios sincronizados, permitindo comparar eventos de dispositivos diferentes.'),
        mcq('q5', 'O que um registro de NetFlow/IPFIX contém?', 'b', [
          'O conteúdo completo dos pacotes',
          'Metadados do fluxo: IPs, portas, protocolo, bytes e horários, sem o conteúdo',
          'Apenas as senhas dos usuários',
          'Somente a configuração do equipamento'
        ], 'Fluxos resumem conversas (quem falou com quem, quanto), sem guardar o payload. Captura de pacotes é que guarda o conteúdo.'),
        mcq('q6', 'Por que definir um baseline antes de configurar alertas?', 'd', [
          'Porque alerta sem baseline não funciona em UDP',
          'Para registrar senhas dos equipamentos',
          'Para desligar o monitoramento fora do horário',
          'Para saber o que é normal na rede e definir limites que evitem tanto falhas não detectadas quanto alertas em excesso'
        ], 'O baseline mostra o comportamento normal. Limites baseados nele geram alertas acionáveis e reduzem a fadiga de alertas.'),
        mcq('q7', 'Qual prática está alinhada à LGPD no tratamento de logs de rede?', 'a', [
          'Definir finalidade, registrar só o necessário, restringir acesso e apagar após o prazo de retenção',
          'Guardar tudo para sempre, para o caso de precisar',
          'Registrar senhas digitadas para auditoria',
          'Deixar os logs abertos a toda a empresa'
        ], 'IPs e usuários em logs são dados pessoais. Finalidade, minimização, retenção limitada e acesso restrito são os princípios.'),
        fill('q8', 'Como se chama a árvore de objetos cujos itens são identificados por OIDs?', 'Os OIDs ficam numa ___ (Management Information Base)', ['MIB'], 'A MIB define os objetos gerenciáveis; cada objeto é referenciado por um OID.')
      ]
    },
    {
      id: 'rdi-22-wireshark-tcpdump',
      title: 'Análise de pacotes com Wireshark e tcpdump',
      goal: 'Capturar e ler tráfego com filtros corretos, entender handshake TCP, DNS e a diferença entre HTTP e TLS, com ética e LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é captura e modo promíscuo',
            'Capturar pacotes é registrar os quadros que passam por uma interface de rede para analisá-los depois. Normalmente a placa só entrega ao sistema os quadros destinados a ela; no modo promíscuo ela entrega todos que vê. Mas numa rede com switch, a porta só recebe o que é para ela (e broadcast): para ver o tráfego de outros equipamentos é preciso espelhar portas (port mirroring/SPAN) ou capturar no próprio dispositivo (roteador, firewall, servidor). Em Wi-Fi, o modo monitor captura quadros do ar, no canal escolhido.',
            'PC com NIC promíscua em porta de switch comum: vê só o seu tráfego\nPC em porta espelhada (SPAN): vê o tráfego da porta espelhada'
          ),
          sl(
            'Wireshark e tcpdump',
            'O Wireshark é a ferramenta gráfica: mostra a lista de pacotes, os campos de cada protocolo decodificados e o conteúdo em hexadecimal. O tcpdump é a ferramenta de linha de comando, ideal em servidores sem interface gráfica; ele pode gravar em arquivo (.pcap) que depois é aberto no Wireshark. Usar o tcpdump normalmente exige privilégios de administrador (sudo). A opção -i escolhe a interface; -n evita resolver nomes; -w grava em arquivo.',
            'sudo tcpdump -i eth0 -n port 53\nsudo tcpdump -i eth0 -w captura.pcap host 192.0.2.10'
          ),
          sl(
            'Filtro de captura vs filtro de exibição',
            'O filtro de captura (sintaxe BPF, como port 53 ou host 192.0.2.10) é aplicado enquanto captura: o que não casa nem é guardado, o que economiza espaço mas não se recupera depois. O filtro de exibição (sintaxe própria do Wireshark, como tcp.port == 443, ip.addr == 192.0.2.10 ou dns) só esconde pacotes na tela: tudo continua no arquivo, e você pode mudar o filtro à vontade. As sintaxes são diferentes e não se misturam. ip.addr == X casa pacotes em que X é origem ou destino.',
            'captura : port 53\nexibição: tcp.port == 443\nexibição: ip.addr == 192.0.2.10\nexibição: dns'
          ),
          sl(
            'Ler o handshake TCP',
            'Uma conexão TCP começa com três pacotes: SYN (cliente pede), SYN+ACK (servidor aceita) e ACK (cliente confirma). No tcpdump os flags aparecem entre colchetes: [S] é SYN, [S.] é SYN+ACK (o ponto significa ACK), [.] é um ACK simples, [P.] é dado com push e ACK, [F.] é fim da conexão e [R] é reset (conexão recusada ou derrubada). Um SYN sem SYN+ACK de volta indica servidor inatingível ou firewall descartando; um [R.] em resposta ao SYN indica porta fechada.',
            '10:15:01.123 IP 192.168.1.10.51514 > 192.0.2.10.443: Flags [S],  seq 1000\n10:15:01.140 IP 192.0.2.10.443 > 192.168.1.10.51514: Flags [S.], seq 5000, ack 1001\n10:15:01.140 IP 192.168.1.10.51514 > 192.0.2.10.443: Flags [.],  ack 5001'
          ),
          sl(
            'Ler DNS na captura',
            'O DNS comum usa UDP porta 53 e vai em texto claro. Numa captura, a consulta mostra o ID da transação, o tipo de registro (A é IPv4, AAAA é IPv6) e o nome pedido, e a resposta traz o ID igual e os endereços. Com isso você vê quais nomes cada equipamento consulta, o que é útil para diagnóstico (consultas sem resposta indicam servidor DNS inacessível) e, justamente por isso, sensível para a privacidade.',
            '192.168.1.10.53211 > 192.168.1.1.53: 4821+ A? exemplo.com. (29)\n192.168.1.1.53 > 192.168.1.10.53211: 4821 1/0/0 A 192.0.2.10 (45)'
          ),
          sl(
            'HTTP em texto claro vs TLS',
            'No HTTP sem TLS, a captura mostra tudo: método, URL, cabeçalhos, cookies e o corpo (inclusive senhas enviadas em formulários). Por isso, nunca se deve usar HTTP para dados sensíveis. Com HTTPS/TLS, a captura só mostra IPs, portas, tamanhos e tempos, e normalmente o nome do site (SNI) no início; o conteúdo está cifrado. Para analisar tráfego TLS sem ser o servidor, só com configuração específica do próprio cliente ou servidor dentro da sua infraestrutura.',
            'HTTP : GET /login ... Cookie: sid=... (legível)\nHTTPS: Application Data (cifrado, ilegível)'
          ),
          sl(
            'Ética e LGPD na captura',
            'O tráfego capturado contém dados pessoais e sigilosos (mensagens, cookies, nomes consultados). Capture somente em redes suas ou com autorização expressa e por escrito, com finalidade clara (diagnóstico), pelo menor tempo e com o menor escopo possível (filtros de captura estreitos). Proteja os arquivos .pcap (acesso restrito, criptografia em repouso), não os compartilhe sem anonimizar e apague quando terminar. Interceptar comunicação alheia sem autorização pode ser crime e viola a LGPD.',
            'checklist: autorização? finalidade? filtro estreito?\n          arquivo protegido? prazo de apagar?'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um computador com a placa em modo promíscuo está ligado a uma porta comum de um switch. Ele vê o tráfego dos outros computadores?', 'a', [
          'Em geral não: o switch só envia à porta o que é para ela; é preciso espelhamento de porta (SPAN)',
          'Sim, vê todo o tráfego de todas as portas',
          'Sim, mas só o tráfego UDP',
          'Sim, desde que use o Wireshark'
        ], 'Switches encaminham quadros apenas pela porta do destino. Para ver outro tráfego é preciso port mirroring ou capturar no próprio dispositivo.'),
        mcq('q2', 'Qual é a diferença entre filtro de captura e filtro de exibição?', 'b', [
          'Não há diferença',
          'O de captura descarta pacotes durante a captura (não recuperáveis); o de exibição só esconde pacotes na tela',
          'O de exibição descarta definitivamente os pacotes',
          'O de captura só funciona com HTTP'
        ], 'Capture filter (BPF) decide o que gravar; display filter apenas mostra um subconjunto do que já foi gravado.'),
        mcq('q3', 'No tcpdump aparece "Flags [S.]" vindo do servidor. O que é esse pacote?', 'c', [
          'Um SYN do cliente',
          'Um reset',
          'Um SYN+ACK, a segunda etapa do handshake',
          'O fim da conexão'
        ], '[S] é SYN, [S.] é SYN+ACK (ponto = ACK) e [F.] é FIN. É a resposta do servidor ao SYN.'),
        fill('q4', 'Qual palavra do filtro de captura seleciona pacotes de uma porta (por exemplo, a 53)?', 'tcpdump -i eth0 ___ 53', ['port'], 'port 53 captura apenas pacotes com origem ou destino na porta 53 (DNS).'),
        mcq('q5', 'O que você consegue ler numa captura de uma sessão HTTPS (TLS)?', 'd', [
          'URL completa e senha enviada',
          'Cookies de sessão em texto claro',
          'O corpo da resposta',
          'IPs, portas, tamanhos e tempos (e normalmente o nome do site pelo SNI), mas não o conteúdo'
        ], 'O TLS cifra o conteúdo. Só os metadados da conexão ficam visíveis. No HTTP puro tudo é legível.'),
        mcq('q6', 'Qual conduta está correta ao capturar tráfego numa rede?', 'b', [
          'Capturar a rede de qualquer lugar para testar',
          'Capturar apenas em redes próprias ou autorizadas, com filtro estreito, protegendo e apagando o arquivo depois',
          'Compartilhar o .pcap completo no fórum para pedir ajuda',
          'Guardar todos os .pcap indefinidamente'
        ], 'Tráfego tem dados pessoais. Autorização, finalidade, mínimo necessário e proteção do arquivo são obrigatórios (LGPD).'),
        mcq('q7', 'O que mostra o filtro de exibição ip.addr == 192.0.2.10?', 'c', [
          'Só pacotes cuja origem é 192.0.2.10',
          'Só pacotes cujo destino é 192.0.2.10',
          'Pacotes em que 192.0.2.10 é origem ou destino',
          'Pacotes que não envolvem 192.0.2.10'
        ], 'ip.addr casa tanto origem quanto destino. Para um sentido só existem ip.src e ip.dst.'),
        fill('q8', 'Qual filtro de exibição do Wireshark mostra apenas pacotes de DNS?', 'Filtro de exibição: ___', ['dns'], 'Digitar o nome do protocolo (dns) mostra só os pacotes dele.')
      ]
    },
    {
      id: 'rdi-23-seguranca-camada2-3',
      title: 'Segurança em camadas 2 e 3',
      goal: 'Reconhecer ameaças comuns nas camadas 2 e 3 e aplicar as defesas correspondentes (visão conceitual e defensiva).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que as camadas 2 e 3 são vulneráveis',
            'Os protocolos básicos da LAN nasceram assumindo que todos na rede são confiáveis: o ARP não autentica respostas, o DHCP aceita qualquer servidor que responda primeiro, o switch aprende MACs de qualquer quadro. Quem consegue conectar um cabo ou entrar no Wi-Fi interno já está dentro desse círculo de confiança. Por isso a defesa é em camadas: controlar quem conecta, limitar o que cada porta pode fazer e segmentar. Este módulo trata as ameaças de forma conceitual para você saber o que defender.',
            'Camada 2: ARP, switch (tabela MAC), VLAN, DHCP, STP\nCamada 3: IP (origem pode ser forjada), ICMP, varreduras, DoS'
          ),
          sl(
            'Ameaças da camada 2',
            'ARP spoofing: o atacante envia respostas ARP falsas para fazer vítimas associarem o IP do gateway ao MAC dele, desviando o tráfego pela máquina dele (para espionar ou alterar). MAC flooding: inundar o switch com quadros de MACs falsos para encher a tabela de endereços; ao lotar, o switch pode passar a enviar quadros por todas as portas, deixando o tráfego visível a quem estiver conectado. VLAN hopping: tentar alcançar uma VLAN que não é a sua, abusando de negociação automática de trunk ou do uso da VLAN nativa. DHCP rogue: um servidor DHCP falso entrega gateway ou DNS errados; DHCP starvation: esgotar os endereços do servidor legítimo com muitos pedidos falsos.',
            'ARP falso: "o gateway 192.168.1.1 está no MAC do atacante"\nresultado: tráfego passa por quem não devia (man-in-the-middle)'
          ),
          sl(
            'Defesas na camada 2',
            'Port security limita quantos e quais MACs uma porta aceita e define a ação ao violar (por exemplo, desligar a porta). DHCP snooping classifica portas em confiáveis (onde está o servidor DHCP legítimo e o uplink) e não confiáveis (usuários): respostas de servidor DHCP em portas não confiáveis são descartadas, e o switch monta uma tabela de associações IP-MAC-porta. O DAI (Dynamic ARP Inspection) usa essa tabela para barrar ARPs inconsistentes, o que combate o ARP spoofing. BPDU guard desliga portas de acesso que recebam BPDUs, impedindo que um dispositivo estranho interfira no STP.',
            'interface GigabitEthernet0/5\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security violation shutdown\n spanning-tree bpduguard enable\n!\nip dhcp snooping\nip dhcp snooping vlan 10\nip arp inspection vlan 10\n!\ninterface GigabitEthernet0/48\n ip dhcp snooping trust    ! uplink para o servidor DHCP'
          ),
          sl(
            'Defesas contra VLAN hopping e boas práticas de porta',
            'Contra VLAN hopping: configurar portas de usuário como access fixas (switchport mode access), sem negociação automática de trunk; configurar trunks de forma explícita, permitindo só as VLANs necessárias; usar uma VLAN nativa sem uso e diferente da VLAN dos usuários. Em geral: desligar (shutdown) portas não usadas e colocá-las numa VLAN sem uso, aplicar 802.1X para autenticar quem conecta, manter o firmware atualizado e alterar senhas padrão.',
            'interface range GigabitEthernet0/10-24\n description NAO USADA\n switchport access vlan 999\n shutdown'
          ),
          sl(
            'Ameaças da camada 3: spoofing, varreduras e DoS',
            'Spoofing de IP é forjar o endereço de origem do pacote, usado para esconder a origem ou em ataques de reflexão. A defesa clássica é a filtragem de entrada: o roteador de borda descarta pacotes que chegam por uma interface com origem que não poderia vir dali (por exemplo, endereços privados vindos da internet), e verificações de caminho reverso (uRPF). Varredura de portas é o reconhecimento do que está aberto num alvo: o defensor reduz a superfície de ataque (fechar portas e serviços desnecessários, firewall com política padrão de negar) e monitora. DoS é esgotar os recursos de um serviço; DDoS é o mesmo, vindo de muitas fontes distribuídas, o que torna inútil só bloquear um IP.',
            'ACL de borda (exemplo): negar origem 10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16 vindo da internet'
          ),
          sl(
            'Mitigar DDoS e endurecer dispositivos',
            'Contra DDoS: limitar taxa (rate limit), usar mitigação do provedor ou serviços de proteção upstream (que absorvem o volume antes de chegar ao seu link) e CDN, e ter capacidade e redundância. Ter plano de resposta com contatos do provedor. Endurecimento (hardening) de equipamentos: gerenciar por SSH em vez de Telnet (Telnet envia senhas em texto claro), restringir o acesso de gerenciamento a uma rede ou IPs específicos, contas individuais, desativar serviços não usados, atualizar o firmware, registrar logs de acesso e mudanças e fazer backup das configurações.',
            'line vty 0 4\n transport input ssh\n access-class 10 in    ! só a rede de gerência\n login local'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual recurso do switch combate o ARP spoofing validando as respostas ARP com a tabela de associações IP-MAC-porta?', 'd', [
          'Port security',
          'BPDU guard',
          'Uso de Telnet',
          'DAI (Dynamic ARP Inspection), apoiado no DHCP snooping'
        ], 'O DAI compara ARPs com a tabela criada pelo DHCP snooping e descarta os inconsistentes.'),
        mcq('q2', 'Qual defesa limita o número de MACs aprendidos por porta, atenuando o MAC flooding?', 'c', [
          'DHCP snooping',
          'Aumentar o MTU',
          'Port security com limite máximo de endereços',
          'Mudar a cor do cabo'
        ], 'Port security restringe quantos e quais MACs uma porta aceita, e define a ação (como shutdown) ao violar.'),
        mcq('q3', 'Como o DHCP snooping evita que um servidor DHCP falso ligado a uma porta de usuário distribua endereços?', 'b', [
          'Cifrando o DHCP',
          'Aceitando respostas de servidor DHCP apenas em portas confiáveis (trust) e descartando as demais',
          'Desligando o DHCP da rede',
          'Trocando IPs por IPv6'
        ], 'Só portas marcadas como trust (servidor legítimo/uplink) podem enviar ofertas DHCP; portas de usuário são não confiáveis.'),
        fill('q4', 'Qual recurso do STP desliga uma porta de acesso que recebe BPDUs?', 'spanning-tree ___ enable', ['bpduguard'], 'BPDU guard protege o STP desligando a porta se um dispositivo estranho enviar BPDUs.'),
        mcq('q5', 'Qual conjunto de medidas reduz o risco de VLAN hopping?', 'a', [
          'Portas de usuário em modo access fixo, trunks explícitos com VLANs permitidas e VLAN nativa sem uso',
          'Deixar todas as portas negociando trunk automaticamente',
          'Usar a VLAN 1 para todos',
          'Remover as VLANs'
        ], 'Evitar negociação automática de trunk e limitar VLANs e a nativa fecha as brechas que o hopping explora.'),
        mcq('q6', 'Por que apenas bloquear o IP de origem normalmente não resolve um DDoS?', 'c', [
          'Porque DDoS não usa IP',
          'Porque o bloqueio é ilegal',
          'Porque o ataque vem de muitas fontes distribuídas; é preciso limitar a taxa e usar mitigação upstream ou CDN',
          'Porque o firewall não consegue bloquear IPs'
        ], 'O D de distribuído significa muitas origens. A defesa envolve limitar taxa, absorver volume antes do seu link e ter redundância.'),
        mcq('q7', 'Qual técnica combate o spoofing de IP na borda da rede?', 'b', [
          'Aumentar o TTL',
          'Filtragem de entrada, descartando pacotes com origem impossível naquela interface (uRPF/ACL)',
          'Usar Telnet',
          'Mudar o MTU'
        ], 'O roteador de borda descarta pacotes cuja origem não poderia vir daquela interface, como endereços privados vindos da internet.'),
        fill('q8', 'Qual protocolo deve substituir o Telnet na administração remota, por cifrar a sessão? Complete a linha de VTY.', 'line vty 0 4\n transport input ___', ['ssh'], 'O Telnet envia senhas em texto claro. O SSH cifra a sessão.')
      ]
    },
    {
      id: 'rdi-24-nuvem-virtualizacao-redes',
      title: 'Redes em nuvem e virtualização',
      goal: 'Entender VPC, sub-redes públicas e privadas, tabelas de rotas, gateways, security groups e NACLs, e redes de VMs e containers.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'VPC e sub-redes',
            'Uma VPC (Virtual Private Cloud, ou VNet em alguns provedores) é a sua rede isolada na nuvem: você escolhe um bloco de endereços privados (por exemplo 10.0.0.0/16) e o divide em sub-redes, normalmente em zonas de disponibilidade diferentes para redundância. É o mesmo raciocínio de CIDR que você já conhece. Uma /16 pode ser dividida em 2^(24-16) = 256 sub-redes /24.',
            'VPC 10.0.0.0/16\n  sub-rede pública  10.0.1.0/24\n  sub-rede privada  10.0.2.0/24'
          ),
          sl(
            'Tabelas de rotas e sub-redes públicas e privadas',
            'Cada sub-rede é associada a uma tabela de rotas. Uma sub-rede é pública quando sua tabela tem uma rota para o Internet Gateway (IGW), o componente que liga a VPC à internet, em geral a rota padrão 0.0.0.0/0. As instâncias nela também precisam de IP público para serem acessadas de fora. Uma sub-rede privada não tem rota para o IGW: seus recursos (bancos de dados, servidores de aplicação) não são acessíveis diretamente da internet.',
            'Tabela da sub-rede pública:\n10.0.0.0/16   local\n0.0.0.0/0     igw\n\nTabela da sub-rede privada:\n10.0.0.0/16   local\n0.0.0.0/0     nat-gw'
          ),
          sl(
            'NAT Gateway',
            'Recursos em sub-rede privada muitas vezes precisam sair para a internet (atualizações, APIs), mas sem receber conexões de fora. O NAT Gateway fica numa sub-rede pública e traduz o endereço das instâncias privadas para um IP público na saída; a rota padrão da sub-rede privada aponta para ele. Funciona apenas para conexões iniciadas de dentro: não permite que a internet inicie conexões com as instâncias privadas.',
            'instância privada 10.0.2.15 -> NAT Gateway -> internet\n(só conexões iniciadas de dentro)'
          ),
          sl(
            'Security groups (stateful) e NACLs (stateless)',
            'O security group é um firewall virtual aplicado à instância/interface. É stateful: ele lembra as conexões, então se você permite a entrada na porta 443, a resposta é liberada automaticamente. As regras só permitem (o padrão é negar o que não foi permitido). O NACL (Network ACL) é aplicado na sub-rede, é stateless: não lembra conexões, então é preciso regras para ida e para volta (incluindo as portas efêmeras de retorno), e as regras são numeradas, avaliadas em ordem e podem permitir ou negar. Por isso o SG é a defesa principal e o NACL, uma camada extra.',
            'Security group (stateful): permitir TCP 443 de 0.0.0.0/0  -> a resposta volta sozinha\nNACL (stateless): entrada 443 + saída para portas altas (retorno)'
          ),
          sl(
            'Peering, VPN, linha dedicada e balanceadores',
            'O VPC peering conecta duas VPCs privadamente, e exige que os blocos CIDR não se sobreponham; o peering não é transitivo (se A liga a B e B liga a C, A não alcança C por B). Para ligar a nuvem ao escritório: VPN site-to-site pela internet (barata, rápida de montar) ou linha dedicada (circuito privado do provedor, maior estabilidade e banda previsível). Balanceadores de carga de nuvem distribuem o tráfego entre instâncias de várias zonas, com health checks, e podem ser públicos ou internos.',
            'VPC A 10.0.0.0/16 <-peering-> VPC B 10.1.0.0/16 (sem sobreposição)'
          ),
          sl(
            'Virtualização e redes de VMs e containers',
            'Em um host de virtualização, um switch virtual (vSwitch) ou bridge liga as placas virtuais das VMs, como um switch físico dentro do servidor. Modos comuns: bridge (a VM aparece na LAN com IP próprio), NAT (a VM usa o IP do host para sair) e rede apenas interna (só entre as VMs). Containers usam a mesma ideia: uma rede bridge local por padrão, com NAT para o exterior, e redes overlay para conectar containers em vários hosts. A segmentação com VLANs e regras de firewall vale também para o mundo virtual.',
            'host: [vSwitch/bridge] -- VM1 (192.168.122.10)\n                         -- VM2 (192.168.122.11)\n                         -- uplink -> LAN física'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que torna uma sub-rede "pública" em uma VPC?', 'b', [
          'Ter um endereço IPv6',
          'A tabela de rotas dela ter rota para um Internet Gateway',
          'Estar em uma zona de disponibilidade especial',
          'Ter mais de 100 instâncias'
        ], 'Sub-rede pública = rota para o IGW (e instâncias com IP público). Sem essa rota, é privada.'),
        mcq('q2', 'Para que serve o NAT Gateway?', 'd', [
          'Receber conexões da internet para os bancos de dados',
          'Cifrar o tráfego entre VPCs',
          'Balancear tráfego entre zonas',
          'Permitir que instâncias de sub-rede privada iniciem conexões para a internet sem serem acessíveis de fora'
        ], 'O NAT Gateway traduz endereços na saída; a internet não consegue iniciar conexões para as instâncias privadas.'),
        mcq('q3', 'Um security group permite entrada na porta 443. O que acontece com o tráfego de resposta?', 'c', [
          'É bloqueado, a menos que haja uma regra de saída para portas altas',
          'É bloqueado sempre',
          'É liberado automaticamente, pois o security group é stateful',
          'Depende do número da regra'
        ], 'Security groups lembram as conexões: permitir a entrada já libera a resposta. Em NACLs (stateless) é preciso regra de retorno.'),
        fill('q4', 'Um NACL não lembra conexões; ele é dito:', 'NACL: um firewall ___ (sem estado)', ['stateless', 'sem estado'], 'NACLs são stateless: tratam cada pacote isoladamente, com regras para ida e volta.'),
        mcq('q5', 'Por que um NACL que libera a entrada na porta 443 pode ainda assim quebrar a conexão?', 'a', [
          'Porque, sendo stateless, também precisa permitir a saída das respostas (portas efêmeras de retorno)',
          'Porque NACL só funciona com UDP',
          'Porque o NACL não pode permitir regras',
          'Porque a porta 443 é reservada'
        ], 'Sem estado, o NACL avalia o tráfego de volta como um fluxo novo e precisa de regra própria para ele.'),
        mcq('q6', 'A VPC A tem peering com B, e B tem peering com C. A consegue acessar C passando por B?', 'd', [
          'Sim, automaticamente',
          'Sim, se os CIDRs forem iguais',
          'Sim, mas só por IPv6',
          'Não: o peering não é transitivo, é preciso peering direto A-C (e os CIDRs não podem se sobrepor)'
        ], 'Peering é ponto a ponto. Não há trânsito por uma VPC intermediária.'),
        mcq('q7', 'Em um host de virtualização, o que liga as placas virtuais das VMs entre si e à rede física?', 'a', [
          'Um switch virtual (vSwitch) ou bridge',
          'O Internet Gateway',
          'O NAT Gateway da nuvem',
          'O servidor DNS'
        ], 'O vSwitch/bridge faz no host o papel de um switch físico para as placas virtuais.'),
        fill('q8', 'Quantas sub-redes /24 cabem em uma VPC 10.0.0.0/16? Responda com o número.', '2^(24-16) = ___', ['256'], 'Entre /16 e /24 há 8 bits de diferença, então 2^8 = 256 sub-redes.')
      ]
    },
    {
      id: 'rdi-25-cli-linux-windows',
      title: 'Redes na linha de comando: Linux e Windows',
      goal: 'Usar e interpretar os comandos de rede de Linux e PowerShell para ver endereços, rotas, portas, DNS e conectividade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Linux: ip addr, ip link e ip route',
            'O comando ip substituiu o antigo ifconfig. ip addr mostra endereços das interfaces (a opção -br dá uma saída resumida), ip link mostra o estado das interfaces (UP/DOWN) e ip route mostra a tabela de rotas. A rota "default via" é o gateway: para onde vai tudo que não tem rota mais específica. A rota "scope link" é a rede diretamente conectada.',
            '$ ip -br addr\nlo     UNKNOWN  127.0.0.1/8\neth0   UP       192.168.1.20/24\n$ ip route\ndefault via 192.168.1.1 dev eth0 proto dhcp\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.20'
          ),
          sl(
            'ss -tulpn: quem escuta em qual porta',
            'O ss lista sockets. Em ss -tulpn: t é TCP, u é UDP, l mostra só os que escutam (listen), p mostra o processo e n usa números em vez de nomes. O endereço local importa: 0.0.0.0 (ou *) significa que escuta em todas as interfaces, ou seja, acessível pela rede; 127.0.0.1 significa que escuta só localmente, inacessível de fora. É a forma de checar se um serviço está exposto sem querer.',
            'Netid State  Local Address:Port  Process\ntcp   LISTEN 0.0.0.0:22         users:(("sshd",pid=812))\ntcp   LISTEN 127.0.0.1:5432     users:(("postgres",pid=950))\nudp   UNCONN 0.0.0.0:68         users:(("dhclient",pid=701))'
          ),
          sl(
            'ping, traceroute, mtr, dig e curl',
            'ping testa se um destino responde ao ICMP e mede o tempo. traceroute mostra os saltos até o destino; asteriscos (* * *) indicam que aquele salto não respondeu, o que muitas vezes é apenas o roteador ignorando ICMP e não uma falha, olhe se os saltos seguintes respondem. O mtr combina ping e traceroute com estatísticas de perda por salto. dig consulta DNS (dig +short exemplo.com A). curl faz requisições HTTP (curl -I mostra só os cabeçalhos).',
            '$ traceroute 203.0.113.5\n 1  192.168.1.1  1.1 ms\n 2  * * *\n 3  203.0.113.5  12.4 ms\n$ dig +short exemplo.com A\n192.0.2.10'
          ),
          sl(
            'nmcli e netplan; IP estático',
            'Em Linux, a configuração é feita por ferramentas como nmcli (NetworkManager) ou arquivos do netplan (comum em servidores Ubuntu), e é aplicada, por exemplo, com netplan apply. Um IP estático exige informar quatro coisas: endereço com prefixo, gateway, servidores DNS e (conceitualmente) que o endereço fique fora da faixa distribuída pelo DHCP, ou reservar o endereço no DHCP, para evitar conflito de IP. Configure só em redes suas, com um endereço realmente livre.',
            'network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: false\n      addresses: [192.168.1.50/24]\n      routes:\n        - to: default\n          via: 192.168.1.1\n      nameservers:\n        addresses: [192.168.1.1]'
          ),
          sl(
            'Windows: ipconfig e PowerShell',
            'ipconfig /all mostra IP, máscara, gateway, DNS, servidor DHCP e MAC de cada adaptador. Get-NetIPConfiguration dá um resumo no PowerShell. Resolve-DnsName consulta DNS (equivalente ao dig). route print mostra a tabela de rotas (equivalente ao ip route). Test-NetConnection testa conectividade, inclusive uma porta TCP específica, o que o ping não faz: confira o campo TcpTestSucceeded. O netsh é a ferramenta clássica de configuração (hoje em boa parte substituída por cmdlets do PowerShell).',
            'PS> Test-NetConnection -ComputerName 192.0.2.10 -Port 443\nComputerName     : 192.0.2.10\nRemotePort       : 443\nTcpTestSucceeded : True\n\nPS> Resolve-DnsName exemplo.com -Type A'
          ),
          sl(
            'Equivalências e leitura de saídas',
            'Para trocar de sistema sem perder o fio: ip addr corresponde a ipconfig /all; ip route a route print; dig a Resolve-DnsName; ss -tulpn a netstat -ano (ou Get-NetTCPConnection); traceroute a tracert; curl existe nos dois. Ao ler saídas, siga uma ordem: interface UP e com IP correto, gateway alcançável, rota padrão presente, DNS resolvendo, porta de serviço acessível. Cada comando responde a uma camada.',
            'ip addr  <-> ipconfig /all\nip route <-> route print\ndig      <-> Resolve-DnsName\ntraceroute <-> tracert'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na saída de ip route:\ndefault via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 scope link\nPara onde vai um pacote com destino 203.0.113.5?', 'c', [
          'Fica na própria máquina',
          'Para 192.168.1.0/24, que é a rede de destino',
          'Para o gateway 192.168.1.1, pela rota default',
          'É descartado, pois não há rota'
        ], '203.0.113.5 não está na rede local, então a rota padrão (default) envia ao gateway.'),
        mcq('q2', 'No ss -tulpn, a linha "tcp LISTEN 127.0.0.1:5432" indica que o serviço:', 'a', [
          'Escuta só localmente e não é acessível de outros computadores',
          'Está acessível pela internet',
          'Está parado',
          'Usa UDP'
        ], '127.0.0.1 é o loopback: só conexões locais. 0.0.0.0 escutaria em todas as interfaces.'),
        mcq('q3', 'Test-NetConnection -ComputerName 192.0.2.10 -Port 443 retorna TcpTestSucceeded : False. O que isso indica?', 'b', [
          'O servidor está desligado com certeza',
          'A conexão TCP até a porta 443 não foi estabelecida (serviço parado, firewall ou rota)',
          'O DNS falhou',
          'O certificado é inválido'
        ], 'O teste tenta um handshake TCP na porta. Falha pode ser serviço fora, firewall bloqueando ou problema de rota; ele não prova qual é.'),
        fill('q4', 'Qual subcomando do ip mostra a tabela de rotas?', 'ip ___', ['route', 'r'], 'ip route mostra as rotas, incluindo o default via.'),
        mcq('q5', 'Qual comando do Windows é equivalente ao ip route do Linux?', 'd', [
          'ipconfig /flushdns',
          'ping -t',
          'nslookup',
          'route print'
        ], 'route print lista a tabela de rotas do Windows. O dig equivale ao Resolve-DnsName.'),
        mcq('q6', 'Ao configurar um IP estático em uma rede com DHCP, qual cuidado evita conflito de endereço?', 'a', [
          'Escolher um endereço fora da faixa distribuída pelo DHCP (ou reservá-lo no DHCP)',
          'Usar sempre o endereço do gateway',
          'Usar o mesmo IP de outro computador',
          'Desligar o DNS'
        ], 'Dois dispositivos com o mesmo IP conflitam. Fora da faixa do DHCP, ou reservado nele, o endereço fica garantido.'),
        mcq('q7', 'Num traceroute, o salto 2 mostra "* * *" e os saltos 3 e 4 respondem normalmente. O que é mais provável?', 'd', [
          'O destino está fora do ar',
          'A conexão está totalmente quebrada',
          'O DNS falhou',
          'O roteador do salto 2 não responde a ICMP/TTL expirado, mas encaminha os pacotes normalmente'
        ], 'Como os saltos seguintes respondem, o tráfego passa. Muitos roteadores simplesmente não respondem ao traceroute.'),
        fill('q8', 'Qual parâmetro do Test-NetConnection testa uma porta TCP específica?', 'Test-NetConnection -ComputerName srv.exemplo.local -___ 443', ['Port'], 'O parâmetro -Port faz o teste de conexão TCP em uma porta, algo que o ping não faz.')
      ]
    },
    {
      id: 'rdi-38-inventario-varredura-ferramentas',
      title: 'Inventário e varredura da própria rede',
      goal: 'Descobrir hosts e serviços da própria rede com nmap e ferramentas de teste, interpretar resultados e corrigir o que está exposto, dentro de limites éticos e legais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que conhecer a própria rede',
            'Não se protege o que não se conhece. Um inventário atualizado de hosts e serviços mostra quais equipamentos existem, o que roda em cada um e o que está exposto. Ele revela o shadow IT (equipamentos e serviços instalados sem conhecimento da TI, como um roteador Wi-Fi doméstico ligado na parede ou um servidor de teste esquecido) e serve de auditoria: quais portas estão abertas, e deveriam estar? Cada porta aberta é superfície de ataque; descobri-la antes de quem não deve é o objetivo da varredura defensiva.'
          ),
          sl(
            'Ética e legalidade: autorização e escopo',
            'Varrer uma rede é inofensivo para quem a administra, mas pode ser considerado ato hostil (e até crime) se feito em redes de terceiros. A regra é simples: só varra redes SUAS ou com autorização por ESCRITO de quem as administra, definindo o escopo (quais faixas de IP, quais horários, o que pode e o que não pode ser feito). Varreduras podem lotar tabelas e derrubar equipamentos frágeis, então avise a equipe e escolha o horário. No Brasil, a Lei 12.737/2012 trata, em visão geral, da invasão de dispositivo informático; em caso de dúvida, consulte o jurídico. Nunca varra a rede do vizinho, do cliente ou da internet "só para ver". Esta lição mostra apenas o uso defensivo, em ambiente próprio ou de laboratório.'
          ),
          sl(
            'Descoberta de hosts: ping sweep e ARP',
            'Ping sweep é enviar um ping (ICMP echo) a cada IP de uma faixa para ver quais respondem. Limitação: hosts com firewall que bloqueia ICMP parecem inexistentes. Na mesma LAN (mesmo segmento de camada 2) existe um jeito melhor: o ARP scan, que pergunta "quem tem este IP?" a cada endereço; um host ligado precisa responder ao ARP para se comunicar, então é difícil se esconder, mas o método só funciona no mesmo segmento, pois o ARP não atravessa roteadores. O nmap faz as duas coisas: a opção -sn faz só a descoberta de hosts, sem varrer portas, e na LAN local ele usa ARP automaticamente. A tabela ARP do próprio computador (ip neigh) também lista vizinhos recentes.',
            '$ nmap -sn 192.0.2.0/24\nNmap scan report for 192.0.2.1\nHost is up\nNmap scan report for 192.0.2.10\nHost is up\nNmap done: 256 IP addresses (2 hosts up)'
          ),
          sl(
            'Varredura de portas com nmap e os estados',
            'Para ver os serviços de um host, use nmap <alvo>: por padrão ele testa as portas TCP mais comuns. A opção -p escolhe portas (-p 22,80,443 uma lista; -p- todas as 65535) e -sV tenta identificar o serviço e a versão que respondem, útil para saber se algo está desatualizado. Cada porta recebe um estado: open (há um serviço aceitando conexões), closed (o host respondeu, mas nenhum serviço escuta ali) e filtered (o nmap não consegue saber: um firewall descarta ou bloqueia os testes, e não há resposta conclusiva). Para o defensor, o que importa são as portas open: cada uma precisa ter motivo para existir.',
            '$ nmap -p 22,23,80,443 192.0.2.10\nPORT    STATE    SERVICE\n22/tcp  open     ssh\n23/tcp  open     telnet\n80/tcp  closed   http\n443/tcp filtered https'
          ),
          sl(
            'Comparar o que o host vê e o que a rede vê',
            'Duas visões se complementam. De dentro do host, ss -tulpn (Linux) lista quem escuta: 0.0.0.0 ou * significa todas as interfaces; 127.0.0.1 significa só local. De fora, o nmap mostra o que é realmente alcançável pela rede, depois de firewalls. Um serviço escutando em 127.0.0.1 NÃO aparece como aberto de outra máquina; um serviço em 0.0.0.0 pode aparecer aberto (ou aparecer como filtered/closed se um firewall o barrar). Diferenças entre as visões apontam para configurações a rever. No Windows, Test-NetConnection -Port testa uma porta específica.'
          ),
          sl(
            'nc, iperf3 e mtr',
            'nc (netcat) testa uma porta TCP sem programa especial: nc -vz 192.0.2.10 443 (-v mostra o resultado, -z só testa a conexão, sem enviar dados); a mensagem de sucesso ou falha varia conforme a versão do nc. iperf3 mede a vazão (largura de banda efetiva) entre dois pontos: num lado, iperf3 -s (servidor); no outro, iperf3 -c <ip do servidor> (cliente); o resultado em bits por segundo mostra o que o caminho realmente entrega (e -u testa UDP). Ele SATURA o enlace durante o teste, então use só em redes suas, combinando o horário. mtr junta ping e traceroute e mostra a perda (Loss%) por salto: se um salto intermediário mostra perda, mas os saltos seguintes e o destino não, é provavelmente o roteador limitando respostas ICMP e não perda real; se a perda aparece naquele salto e continua até o destino, ela é real a partir dali.',
            '$ nc -vz 192.0.2.10 443\n(conexão aceita: porta aberta)\n\n$ iperf3 -s              # no servidor\n$ iperf3 -c 192.0.2.10   # no cliente\n\n$ mtr -rc 10 198.51.100.8\n  1. 192.0.2.1       0.0%\n  2. 203.0.113.1    40.0%\n  3. 198.51.100.8    0.0%'
          ),
          sl(
            'Relatar achados e corrigir',
            'Varrer sem agir é perda de tempo. Registre cada achado com: o que foi encontrado, evidência (saída do comando), risco, recomendação e prazo. Corrija: feche/desative serviços desnecessários (por exemplo, Telnet aberto, trocando por SSH), restrinja os necessários por firewall ao mínimo de origens, atualize o que estiver desatualizado e troque senhas padrão. Depois, repita a varredura para confirmar que a correção funcionou. Os relatórios de varredura são sensíveis (mapa de fraquezas e de IPs): guarde-os com acesso restrito e evite registrar dados pessoais desnecessários.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em uma varredura autorizada do seu servidor 192.0.2.10:\n22/tcp open ssh\n23/tcp open telnet\n80/tcp closed http\n443/tcp filtered https\nQual leitura está correta?', 'd', [
          'A porta 80 está aberta e a 23 está fechada',
          'A 443 está aberta, pois o nmap a listou',
          'Todas as portas estão protegidas, pois há uma filtered',
          'Telnet (23) está aberto: se não for necessário, deve ser desativado; a 80 não tem serviço; a 443 está atrás de algo que impede conclusão (firewall)'
        ], 'open = serviço aceitando conexões; closed = host respondeu e não há serviço; filtered = sem resposta conclusiva (firewall). O Telnet aberto é achado a corrigir.'),
        mcq('q2', 'No host, ss -tulpn mostra "tcp LISTEN 127.0.0.1:5432". Como esse serviço aparece numa varredura feita de OUTRO computador da rede?', 'b', [
          'Aberto, como qualquer serviço que escuta',
          'Não aparece como alcançável: escutar em 127.0.0.1 significa só conexões locais',
          'Aparece como open em todas as portas',
          'Faz o nmap travar'
        ], 'O loopback só aceita conexões da própria máquina. A varredura externa mostra apenas o alcançável pela rede.'),
        mcq('q3', 'Um amigo pede para você varrer a rede da empresa dele "para ajudar", mas sem avisar ninguém na empresa. Qual a conduta correta?', 'c', [
          'Varrer rápido, pois é inofensivo',
          'Varrer só de madrugada para ninguém notar',
          'Não varrer até haver autorização por escrito de quem administra a rede, com escopo definido',
          'Varrer apenas as portas acima de 1024'
        ], 'Sem autorização formal e escopo, a varredura de rede de terceiros é inaceitável (e pode ser ilegal), mesmo com boa intenção.'),
        fill('q4', 'Na mesma LAN, o nmap -sn descobre hosts mesmo que o firewall deles bloqueie ping, usando qual protocolo que não atravessa roteadores?', 'nmap -sn 192.0.2.0/24   # na LAN local usa ___', ['ARP'], 'Na LAN, o ARP identifica hosts ligados: eles precisam responder a ele para se comunicar. O ARP só funciona dentro do segmento.'),
        mcq('q5', 'O que faz o comando nc -vz 192.0.2.10 443?', 'a', [
          'Testa se a porta TCP 443 aceita conexão, sem enviar dados, mostrando o resultado',
          'Mede a vazão do enlace',
          'Lista todos os hosts da rede',
          'Baixa uma página web e a salva'
        ], '-z testa a conexão sem enviar dados e -v mostra o resultado. Medir vazão é função do iperf3.'),
        mcq('q6', 'Para medir a vazão entre dois computadores da sua rede com iperf3, qual é a combinação correta?', 'd', [
          'iperf3 -c nos dois computadores',
          'iperf3 -s nos dois computadores',
          'ping -vz entre eles',
          'iperf3 -s no computador que recebe e iperf3 -c <ip do servidor> no outro'
        ], 'Um lado é o servidor (-s) e o outro, o cliente (-c) apontando para o IP do servidor.'),
        mcq('q7', 'Num mtr:\n1. 192.0.2.1 0.0%\n2. 203.0.113.1 40.0%\n3. 198.51.100.8 0.0%\nComo interpretar o salto 2?', 'b', [
          'Há 40% de perda real até o destino',
          'Provavelmente o roteador do salto 2 limita respostas ICMP; como o destino não tem perda, o tráfego passa bem',
          'O destino está fora do ar',
          'O DNS está falhando'
        ], 'Perda apenas num salto intermediário, sem continuar nos seguintes, costuma ser limitação de ICMP do roteador, não perda real.'),
        fill('q8', 'Qual opção do nmap escolhe as portas a varrer (por exemplo, 22,443)?', 'nmap ___ 22,443 192.0.2.10', ['-p', 'p'], 'A opção -p define as portas; -p- varre as 65535.')
      ]
    },
    {
      id: 'rdi-26-acesso-remoto-arquivos',
      title: 'Acesso remoto e serviços de arquivos',
      goal: 'Acessar servidores e arquivos com segurança: SSH com chaves, túneis, riscos do RDP, SMB e NFS, firewall e limitação de tentativas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'SSH: chaves em vez de senha',
            'O SSH dá acesso remoto cifrado ao terminal. Com senha, qualquer pessoa na internet pode tentar adivinhá-la. Com chaves, você gera um par: a chave pública vai para o servidor (arquivo authorized_keys do usuário) e a chave privada fica só com você e nunca é compartilhada, copiada para repositórios ou enviada por mensagem. O servidor prova que você tem a privada sem que ela trafegue. Proteja a privada com uma passphrase. Ed25519 é um algoritmo moderno recomendado.',
            'ssh-keygen -t ed25519 -C "notebook-trabalho"\nssh-copy-id usuario@192.0.2.30\nssh usuario@192.0.2.30'
          ),
          sl(
            'Endurecer o servidor SSH',
            'No arquivo /etc/ssh/sshd_config, desative o login de root, desative a senha depois de configurar as chaves e restrinja quais usuários podem entrar. Isso elimina quase todos os ataques de adivinhação de senha. Mudar a porta padrão reduz o ruído nos logs, mas não é segurança de verdade. Lembre de recarregar o serviço após alterar e de testar em outra sessão antes de fechar a atual, para não se trancar fora.',
            'PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAllowUsers deploy suporte'
          ),
          sl(
            'scp, sftp e túnel SSH',
            'scp e sftp transferem arquivos por dentro do SSH (cifrado), substituindo o FTP, que trafega senha e dados em texto puro. scp copia direto por linha de comando; sftp abre uma sessão interativa. O túnel SSH encaminha uma porta por dentro da conexão cifrada: -L 8080:127.0.0.1:80 faz a porta 8080 da sua máquina levar ao 127.0.0.1:80 do servidor remoto. Assim você acessa um serviço interno sem expô-lo à internet. É uma ferramenta de administração pontual, não substitui uma VPN.',
            'scp relatorio.pdf usuario@192.0.2.30:/tmp/\nsftp usuario@192.0.2.30\nssh -L 8080:127.0.0.1:80 usuario@192.0.2.30\n# agora http://localhost:8080 chega ao serviço remoto'
          ),
          sl(
            'RDP: riscos de expor ao público',
            'O RDP (porta TCP 3389) é o acesso remoto à área de trabalho do Windows. Exposto diretamente na internet, ele é alvo constante de tentativas de força bruta e de explorações de falhas, e é uma entrada clássica de ransomware. Regras: não publique a 3389 na internet; faça o acesso por VPN ou por um gateway de acesso remoto; ative a autenticação em nível de rede (NLA), senhas fortes e MFA; limite quem pode usar RDP e mantenha tudo atualizado.',
            'ERRADO: Internet -> 3389 -> servidor\nCERTO : Internet -> VPN com MFA -> rede interna -> 3389'
          ),
          sl(
            'SMB e NFS: compartilhamento de arquivos',
            'SMB/CIFS (porta TCP 445) é o protocolo de compartilhamento do Windows (também usado pelo Samba em Linux); NFS é o equivalente típico em Unix e Linux. Ambos foram feitos para redes internas confiáveis e nunca devem ser expostos diretamente à internet. Compartilhamento seguro: permissões por grupo com o mínimo necessário (leitura onde só leitura basta), nada de pastas abertas a "todos", desativar versões antigas e inseguras do protocolo, registrar acessos e manter backups. Pastas de RH, financeiro ou clientes contêm dados pessoais: restrinja e audite o acesso (LGPD).',
            'Internet --X--> 445 (SMB)   # nunca expor\nRede interna -> 445 apenas para o grupo "financeiro"'
          ),
          sl(
            'Portas, firewall e VPN antes de expor serviços',
            'A regra geral: exponha o mínimo possível. Serviços administrativos (SSH, RDP, painéis, bancos de dados, compartilhamentos) devem ficar acessíveis apenas pela rede interna ou por VPN, e o firewall deve negar por padrão, liberando só o necessário e, se possível, apenas de IPs de origem conhecidos. Cada porta aberta ao público aumenta a superfície de ataque. Revise regularmente quais portas estão abertas (por exemplo com ss -tulpn no servidor).',
            'política: negar tudo por padrão\nexceção: 443 para o site; 22 apenas da rede de gerência/VPN'
          ),
          sl(
            'Limitar tentativas: fail2ban e rate limiting',
            'Mesmo com chaves, o servidor recebe tentativas de login o tempo todo. Ferramentas como o fail2ban leem os logs, identificam IPs com várias falhas seguidas e os bloqueiam no firewall por um tempo. É uma defesa adicional, não substitui senha forte, chaves e MFA; a limitação de tentativas (rate limiting) também existe em aplicações web e VPNs. Cuidado para não bloquear a si mesmo: configure uma lista de IPs confiáveis, e lembre que os logs de tentativas contêm IPs (dados pessoais): retenção limitada.',
            '[sshd]\nenabled  = true\nmaxretry = 5\nbantime  = 1h'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a vantagem principal do SSH com chaves em relação ao login por senha?', 'd', [
          'É mais rápido por usar UDP',
          'Dispensa o uso do servidor',
          'Não usa criptografia',
          'Elimina a adivinhação de senha; a chave privada nunca trafega e fica só com o usuário'
        ], 'Com chaves, o servidor verifica que você tem a privada sem recebê-la. Isso inviabiliza o ataque de adivinhação de senha, se a senha for desativada.'),
        mcq('q2', 'Qual arquivo da dupla de chaves nunca deve ser compartilhado nem enviado a repositórios?', 'b', [
          'A chave pública (.pub)',
          'A chave privada',
          'O authorized_keys do servidor',
          'O sshd_config'
        ], 'A privada é a identidade; quem a tem se passa por você. A pública pode ser distribuída livremente.'),
        mcq('q3', 'O que faz o comando ssh -L 8080:127.0.0.1:80 usuario@192.0.2.30?', 'a', [
          'Faz a porta 8080 da sua máquina levar, por dentro do SSH, ao 127.0.0.1:80 do servidor remoto',
          'Abre a porta 80 do servidor para a internet',
          'Copia arquivos para o servidor',
          'Desativa o login por senha'
        ], 'O -L cria um túnel local: o que você acessa em localhost:8080 é encaminhado, cifrado, ao serviço do lado remoto.'),
        fill('q4', 'Qual valor de PasswordAuthentication desativa o login por senha no sshd (depois de configurar as chaves)?', 'PasswordAuthentication ___', ['no'], 'Com PasswordAuthentication no, só chaves funcionam, e as tentativas de adivinhar senha deixam de ter efeito.'),
        mcq('q5', 'Qual a abordagem adequada para dar acesso remoto por RDP aos funcionários?', 'b', [
          'Abrir a porta 3389 para a internet com senha forte',
          'Acesso por VPN ou gateway, com NLA, MFA e atualização em dia',
          'Desligar o firewall do servidor',
          'Usar o mesmo usuário para todos'
        ], 'O RDP exposto é alvo constante de força bruta e ransomware. VPN/gateway com MFA e NLA reduz muito o risco.'),
        mcq('q6', 'Por que SMB (445) e NFS não devem ser expostos diretamente à internet?', 'c', [
          'Porque usam UDP e não funcionam fora da LAN',
          'Porque só funcionam em Wi-Fi',
          'Foram feitos para redes internas confiáveis e são alvos frequentes de ataque, com dados pessoais em risco',
          'Porque exigem IPv6'
        ], 'Compartilhamentos de arquivo devem ficar na rede interna, com acesso por VPN quando remoto.'),
        mcq('q7', 'O que o fail2ban faz?', 'c', [
          'Cifra os arquivos do servidor',
          'Substitui o firewall',
          'Lê logs e bloqueia por um tempo IPs com muitas falhas de login',
          'Gera as chaves SSH'
        ], 'É uma defesa adicional contra força bruta, que não substitui senhas fortes, chaves e MFA.'),
        fill('q8', 'Qual algoritmo moderno de chave (curva elíptica) o slide recomenda no ssh-keygen?', 'ssh-keygen -t ___', ['ed25519'], 'Ed25519 gera chaves curtas, rápidas e seguras, recomendadas hoje.')
      ]
    },
    {
      id: 'rdi-37-diretorio-autenticacao',
      title: 'Serviços de diretório e autenticação de rede',
      goal: 'Entender LDAP, Active Directory, Kerberos, RADIUS/802.1X, SSO e MFA, e como gerir identidades com privilégio mínimo e cuidados de LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que centralizar identidades e o LDAP',
            'Sem diretório, cada sistema (Wi-Fi, e-mail, servidores, aplicações) teria usuários e senhas próprios: difícil de manter, de auditar e de desligar quando alguém sai. Um serviço de diretório guarda as identidades em um só lugar e os sistemas consultam esse repositório. LDAP (Lightweight Directory Access Protocol) é o protocolo padrão de acesso a diretórios. Os dados formam uma árvore: a raiz costuma ser o domínio (dc=exemplo,dc=com), com ramos chamados unidades organizacionais (ou=pessoas) e as entradas (usuários, grupos, computadores) como folhas. Cada entrada tem um DN (Distinguished Name), o caminho completo até ela; o RDN é só a parte mais à esquerda. Operações principais: bind (autenticar-se no servidor, com um DN e senha, ou anonimamente) e search (buscar com base, escopo e filtro). Portas: 389 (LDAP, com opção de StartTLS para cifrar) e 636 (LDAPS, TLS implícito). Senhas em bind sem cifragem trafegam em texto puro: use sempre LDAPS ou StartTLS.',
            'dn: uid=usuario01,ou=pessoas,dc=exemplo,dc=com\n#  RDN = uid=usuario01\n#  pai = ou=pessoas,dc=exemplo,dc=com\n\nldapsearch -H ldaps://ldap.exemplo.com -D "uid=leitor,ou=servico,dc=exemplo,dc=com" -W -b "ou=pessoas,dc=exemplo,dc=com" "(uid=usuario01)"\n# -D = DN do bind  -W = pede senha  -b = base da busca'
          ),
          sl(
            'Active Directory em visão geral',
            'O Active Directory (AD) é o serviço de diretório da Microsoft e o centro de muitas redes corporativas Windows. Domínio: unidade administrativa com seu banco de identidades. Controladores de domínio (DC): servidores que guardam e replicam o diretório (tenha mais de um, por redundância). Dentro dele: usuários, grupos, computadores e OUs (unidades organizacionais, que organizam objetos e delegam administração). Group Policy (GPO): políticas aplicadas a usuários e máquinas de uma OU (senhas, bloqueios, instalação de software, regras de firewall do Windows). O AD usa LDAP e Kerberos por baixo. Dependências críticas: DNS, pois os clientes localizam os DCs por registros SRV (como _ldap._tcp.dc._msdcs.dominio) e, se o DNS estiver errado, o login de domínio falha; e o relógio (NTP), pois a autenticação Kerberos depende de horários sincronizados.',
            '$ dig +short SRV _ldap._tcp.dc._msdcs.exemplo.com\n0 100 389 dc1.exemplo.com.\n0 100 389 dc2.exemplo.com.\n# prioridade 0, peso 100, porta 389, servidor dc1/dc2'
          ),
          sl(
            'Kerberos: tickets em vez de senha',
            'Kerberos é o protocolo de autenticação padrão do AD (porta 88). Há um terceiro de confiança: o KDC (Key Distribution Center), que roda no controlador de domínio. Fluxo: (1) o usuário prova quem é ao KDC e recebe um TGT (Ticket-Granting Ticket), uma espécie de "crachá" válido por algumas horas; (2) quando quer usar um serviço (um servidor de arquivos, por exemplo), apresenta o TGT ao KDC e pede um ticket de serviço; (3) entrega esse ticket ao serviço, que o aceita sem nunca ver a senha. O serviço é identificado por um SPN (Service Principal Name, como HTTP/app.exemplo.com). Os tickets têm carimbo de tempo e validade: se o relógio do cliente diverge demais do relógio do KDC (a tolerância é pequena, em geral da ordem de minutos), a autenticação falha. Por isso, sincronize todos os equipamentos por NTP.'
          ),
          sl(
            'NTLM, RADIUS, TACACS+ e 802.1X',
            'NTLM é o protocolo de autenticação mais antigo da Microsoft: legado, mais fraco que o Kerberos (por exemplo, é vulnerável a retransmissão de credenciais em muitos cenários); mantenha-o apenas onde for inevitável e plano para desativar. RADIUS: protocolo de autenticação, autorização e contabilização (AAA) usado por equipamentos de rede (Wi-Fi corporativo, VPN, switches) para consultar um servidor central, que por sua vez consulta o diretório. TACACS+ (TCP porta 49): também AAA, mais usado para o ACESSO ADMINISTRATIVO a roteadores e switches, com controle fino de quais comandos cada administrador pode executar. 802.1X: controle de acesso à rede por porta ou por Wi-Fi: o dispositivo (suplicante) só ganha acesso depois de autenticar, via o switch ou AP (autenticador), que consulta o servidor RADIUS (servidor de autenticação). Enquanto não autentica, a porta fica limitada. Assim o login da rede usa as mesmas contas do diretório.'
          ),
          sl(
            'SSO, federação e MFA',
            'SSO (Single Sign-On): o usuário autentica uma vez e acessa vários sistemas sem digitar a senha de novo. Menos senhas para lembrar, menos pontos de vazamento e um único lugar para aplicar regras e desligar acessos. Federação: um sistema confia na autenticação feita por outro, mesmo de outra organização, por meio de protocolos padronizados; SAML (baseado em XML, comum em sistemas corporativos) e OIDC/OpenID Connect (construído sobre OAuth 2.0, comum em aplicações web e móveis) são os dois mais conhecidos. A aplicação (provedor de serviço) redireciona o usuário ao provedor de identidade (IdP), que autentica e devolve uma asserção ou token. MFA (autenticação multifator): exige dois ou mais fatores independentes (algo que você sabe, algo que você tem, algo que você é); mesmo com a senha vazada, o invasor não entra. Prefira aplicativos autenticadores e chaves de segurança a códigos por SMS.'
          ),
          sl(
            'Contas de serviço, privilégio mínimo e higiene',
            'Contas de serviço são usadas por aplicações, não por pessoas (backup, integração, consulta LDAP). Dê a cada serviço uma conta própria, com senha longa e aleatória guardada em cofre, permissões mínimas (uma conta de leitura de diretório não precisa ser administradora) e sem login interativo. Privilégio mínimo: cada identidade recebe só o acesso necessário e usa conta administrativa separada da conta do dia a dia. Higiene: política de senhas robusta (tamanho e proibição de senhas comuns, mais que complexidade forçada), revisão periódica de acessos, remoção de contas inativas, de grupos antigos e de contas compartilhadas, e bloqueio por tentativas. Alternativas de código aberto: OpenLDAP (servidor LDAP), FreeIPA (diretório com Kerberos e gestão de identidade para ambientes Linux) e Samba (que pode atuar como controlador de domínio compatível com o AD).'
          ),
          sl(
            'LGPD e o diretório',
            'O diretório é uma base de dados pessoais: nomes, usuários, e-mails, telefones, cargos, grupos, horários de login. Aplique os princípios da LGPD: coletar apenas os atributos necessários (minimização), restringir quem pode ler e alterar (inclusive atributos sensíveis), registrar e auditar acessos e alterações, e manter logs com prazo de retenção definido. No desligamento de colaboradores, siga um processo formal: desativar a conta e revogar acessos, tokens, chaves e MFA no mesmo dia; transferir a propriedade de arquivos e caixas de e-mail; manter ou apagar os dados conforme a finalidade e o prazo legal. Backups do diretório contêm credenciais e dados pessoais: cifre e controle o acesso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em "dn: uid=usuario01,ou=pessoas,dc=exemplo,dc=com", qual é o RDN da entrada?', 'a', [
          'uid=usuario01',
          'ou=pessoas',
          'dc=exemplo,dc=com',
          'dn'
        ], 'O DN é o caminho completo; o RDN é a parte mais à esquerda (uid=usuario01). O restante é o pai (ou=pessoas) e a raiz do domínio.'),
        mcq('q2', 'Uma aplicação faz bind simples no LDAP pela porta 389 sem nenhuma cifragem. Qual o problema e a correção?', 'c', [
          'Nenhum: o bind nunca envia a senha',
          'A 389 só funciona com Kerberos; troque por RADIUS',
          'A senha trafega em texto puro; use LDAPS (636) ou StartTLS',
          'O DN está errado; use o RDN no lugar'
        ], 'Bind simples envia a senha; sem TLS, ela pode ser capturada. Cifre com LDAPS (636) ou StartTLS na 389.'),
        mcq('q3', 'O comando "dig SRV _ldap._tcp.dc._msdcs.exemplo.com" não retorna nada e os PCs não conseguem entrar no domínio. Qual a causa provável?', 'b', [
          'O Kerberos usa UDP e o DNS não influencia',
          'O DNS não está resolvendo os registros SRV que localizam os controladores de domínio',
          'A GPO está bloqueando o DHCP',
          'O relógio está certo, então o problema é do NTLM'
        ], 'O AD depende de DNS: os clientes acham os DCs por registros SRV. Cliente apontando para um DNS que não conhece a zona do domínio é falha comum.'),
        fill('q4', 'Qual a sigla do ticket que o Kerberos entrega ao usuário após o primeiro login, usado para pedir tickets de serviço?', 'Kerberos: após o login o usuário recebe o ___', ['TGT', 'ticket-granting ticket', 'ticket granting ticket'], 'TGT = Ticket-Granting Ticket. Com ele o usuário pede tickets de serviço ao KDC sem digitar a senha de novo.'),
        mcq('q5', 'Um servidor ficou com o relógio atrasado e os usuários não conseguem autenticar por Kerberos. Qual a explicação e a correção?', 'd', [
          'O TGT expirou porque a rede está lenta; troque o switch',
          'O SPN foi apagado; recrie o SPN',
          'O NTLM está desativado; reative-o em todos os clientes',
          'Os tickets têm carimbo de tempo e a tolerância é pequena; sincronize o relógio por NTP'
        ], 'Kerberos depende de relógios próximos. Distorção grande invalida os tickets; a correção é a sincronização por NTP.'),
        mcq('q6', 'Quais papéis existem em uma autenticação 802.1X em uma porta de switch?', 'b', [
          'Cliente DHCP, servidor DNS e roteador',
          'Suplicante (dispositivo), autenticador (switch/AP) e servidor de autenticação (RADIUS)',
          'KDC, TGT e SPN',
          'OLT, splitter e ONT'
        ], 'O dispositivo se autentica; o switch ou AP repassa ao servidor RADIUS, que consulta o diretório; só então a porta é liberada.'),
        mcq('q7', 'Qual prática está alinhada ao privilégio mínimo e à LGPD na gestão de identidades?', 'a', [
          'Conta de serviço própria, só com o acesso necessário e senha em cofre; desativar contas e acessos de quem sai da empresa no mesmo dia',
          'Uma única conta administrativa compartilhada para todos os serviços',
          'Manter contas de ex-colaboradores ativas por segurança',
          'Dar acesso de administrador do domínio à conta que só consulta o LDAP'
        ], 'Contas separadas e mínimas reduzem o estrago de um vazamento; desligar quem sai evita acessos indevidos a dados pessoais.'),
        fill('q8', 'Qual a sigla do recurso em que o usuário autentica uma vez e acessa vários sistemas sem digitar a senha de novo?', 'Login único = ___', ['SSO', 'single sign-on', 'single sign on'], 'SSO (Single Sign-On), muitas vezes com federação por SAML ou OIDC e MFA no provedor de identidade.')
      ]
    },
    {
      id: 'rdi-27-cabeamento-infra-fisica',
      title: 'Cabeamento estruturado e infraestrutura física',
      goal: 'Entender os subsistemas do cabeamento estruturado, racks e patch panels, cobre e fibra, PoE e certificação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Subsistemas do cabeamento estruturado',
            'Cabeamento estruturado é o cabeamento organizado por padrão, independente do equipamento, que atende a vários serviços. Seus blocos: área de trabalho (tomada, cordão e dispositivo do usuário); cabeamento horizontal (do patch panel na sala de telecomunicações até a tomada de cada área de trabalho, em geral cabo de par trançado); cabeamento de backbone ou vertical (liga salas de telecomunicações entre andares ou prédios, geralmente fibra); sala de telecomunicações (um por andar, concentra patch panels e switches de acesso); sala de equipamentos (servidores e núcleo) e entrada de facilidades (onde chegam as operadoras).',
            'tomada -> [horizontal] -> sala de telecom (andar)\nsala de telecom -> [backbone] -> sala de equipamentos'
          ),
          sl(
            'Racks, patch panels e organização',
            'O rack acomoda switches, patch panels e organizadores de cabos em unidades padronizadas (U). O cabo horizontal fixo termina no patch panel; um cordão curto (patch cord) liga a porta do patch panel ao switch. Assim, para mudar uma conexão, mexe-se só no cordão e o cabo fixo não é tocado nem desgastado. Organização conta: cordões no comprimento certo, organizadores de cabo, separação por função e boa ventilação. Identificação: etiquete as duas pontas do cabo, as portas do patch panel e as tomadas com a mesma nomenclatura, e mantenha a documentação atualizada.',
            'tomada A-12 <--cabo fixo--> patch panel porta 12\npatch panel porta 12 --cordão--> switch porta 12'
          ),
          sl(
            'Categorias e distâncias do par trançado',
            'Os cabos de par trançado são classificados em categorias (Cat5e, Cat6, Cat6a e outras): categorias mais altas suportam velocidades maiores e têm melhor desempenho contra interferência entre pares. Cat5e e Cat6 atendem bem 1 Gbps, e categorias superiores são exigidas para 10 Gbps em distâncias maiores. A distância máxima de um canal de cobre em Ethernet é de 100 metros, somando cabo fixo e cordões; acima disso, é preciso um switch intermediário ou fibra. Cabo UTP e blindado (STP/FTP) diferem na proteção contra ruído; a blindagem exige aterramento correto.',
            'switch --cordão-- patch panel --cabo horizontal-- tomada --cordão-- PC\n(total do canal: máx. 100 m)'
          ),
          sl(
            'Fibra óptica em backbones',
            'A fibra transmite luz, é imune a interferência eletromagnética, suporta distâncias e velocidades muito maiores e isola eletricamente os pontos, por isso é a escolha em backbones entre andares e prédios. Fibra multimodo tem núcleo mais grosso, usa fontes mais simples e atende distâncias curtas ou médias (dentro de prédio ou campus). Fibra monomodo tem núcleo fino, usa laser e atende longas distâncias. Os conectores comuns são LC e SC. Fibra exige cuidado: limpeza dos conectores, raio de curvatura e uso do tipo correto de transceiver (módulo SFP) para o tipo de fibra.',
            'multimodo: curta/média distância (prédio, campus)\nmonomodo : longas distâncias (entre prédios, metropolitano)'
          ),
          sl(
            'PoE e orçamento de energia',
            'O PoE (Power over Ethernet) alimenta dispositivos (telefones IP, câmeras, APs) pelo próprio cabo de rede, sem tomada e sem fonte separada. Há classes de potência por porta, mas o switch também tem um orçamento total de potência PoE: a soma do que os dispositivos consomem não pode ultrapassar esse total. Exemplo: orçamento de 180 W, 8 câmeras de 15 W (120 W) deixam 60 W livres, o que comporta mais 2 APs de 30 W. Planeje com folga e lembre que cabos de categoria baixa e longos esquentam e perdem potência.',
            'orçamento PoE do switch: 180 W\n8 câmeras x 15 W = 120 W  ->  sobram 60 W\n60 W / 30 W por AP = 2 APs'
          ),
          sl(
            'Certificação, boas práticas e normas',
            'Um simples testador de continuidade só confirma que os fios estão ligados nos pinos certos. A certificação usa equipamento específico que mede mapa de fiação, comprimento, atenuação, diafonia (interferência entre pares) e outros parâmetros e gera relatório para a categoria desejada: prova que o cabeamento atende ao padrão. Boas práticas: separar cabos de dados de cabos de energia, respeitar o raio de curvatura e não esticar demais, não passar de 100 m, etiquetar as duas pontas, deixar sobra técnica e documentar o resultado. Há normas ABNT, ANSI/TIA e ISO/IEC de cabeamento estruturado: consulte-as no projeto.',
            'teste de continuidade: fios nos pinos certos\ncertificação: comprimento, atenuação, diafonia, relatório para a categoria'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o cabeamento horizontal?', 'a', [
          'O cabo que liga o patch panel da sala de telecomunicações à tomada da área de trabalho',
          'A fibra que liga prédios diferentes',
          'O cabo de energia dos racks',
          'O cordão entre o PC e a tomada'
        ], 'Horizontal = da sala de telecom até a tomada, de cada andar. O vertical/backbone liga salas entre andares ou prédios.'),
        mcq('q2', 'Por que a fibra óptica é preferida em backbones entre prédios?', 'c', [
          'Porque é mais barata que qualquer cobre',
          'Porque não precisa de conectores',
          'É imune a interferência eletromagnética, atinge maiores distâncias e velocidades e isola eletricamente os pontos',
          'Porque só funciona com PoE'
        ], 'Entre prédios, as distâncias e as diferenças de aterramento favorecem a fibra.'),
        mcq('q3', 'Qual é a vantagem de usar patch panel e cordões (patch cords) no rack?', 'd', [
          'Aumenta a distância máxima do cabo',
          'Substitui o switch',
          'Fornece energia PoE',
          'Permite mudar conexões mexendo só no cordão, sem manipular o cabo fixo, e organiza e identifica as portas'
        ], 'O cabo horizontal termina no painel e fica intacto. As mudanças ocorrem nos cordões, com a identificação padronizada.'),
        fill('q4', 'Qual é a distância máxima do canal de cobre (par trançado) para Ethernet, em metros?', 'Distância máxima do canal de cobre: ___ metros', ['100'], 'O limite de um canal de cobre Ethernet é de 100 m, somando cabo fixo e cordões.'),
        mcq('q5', 'Um switch tem orçamento PoE de 180 W e já alimenta 8 câmeras de 15 W. Quantos APs de 30 W ainda cabem?', 'b', [
          '1',
          '2',
          '3',
          '6'
        ], '8 x 15 = 120 W. Sobram 180 - 120 = 60 W, que alimentam 60 / 30 = 2 APs.'),
        mcq('q6', 'Qual a diferença entre um testador de continuidade simples e a certificação do cabeamento?', 'c', [
          'Não há diferença',
          'A certificação só confere a cor dos cabos',
          'A certificação mede parâmetros como comprimento, atenuação e diafonia e emite relatório para a categoria; o testador só confirma a ligação dos fios',
          'O testador simples já prova conformidade com a norma'
        ], 'Só a certificação comprova que o cabeamento atende à categoria exigida.'),
        mcq('q7', 'Qual conjunto de boas práticas está correto?', 'd', [
          'Passar o cabo de dados junto ao de energia para economizar espaço',
          'Dobrar cabos em ângulo reto para caber no duto',
          'Etiquetar só uma ponta',
          'Separar dados de energia, respeitar o raio de curvatura, etiquetar as duas pontas e documentar'
        ], 'Dados perto de energia sofrem interferência; curvas fechadas degradam o cabo; etiquetas e documentação evitam erros.'),
        fill('q8', 'Qual tipo de fibra, de núcleo fino e laser, atende as longas distâncias?', 'fibra ___ -> longas distâncias', ['monomodo', 'mono', 'single-mode', 'singlemode'], 'Monomodo (single-mode) tem núcleo fino e laser, para grandes distâncias. Multimodo atende curtas e médias.')
      ]
    },
    {
      id: 'rdi-28-design-hierarquico-ipam',
      title: 'Design de rede e documentação',
      goal: 'Aplicar o modelo hierárquico, planejar endereçamento com IPAM, padronizar nomes e documentar e gerir mudanças.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Modelo hierárquico: acesso, distribuição e núcleo',
            'O modelo hierárquico divide a rede em três camadas com papéis claros. Acesso: onde usuários e dispositivos se conectam (switches de andar, PoE, VLANs, segurança de porta). Distribuição: agrega os switches de acesso, faz o roteamento entre VLANs, aplica políticas (ACLs) e fornece redundância. Núcleo: transporta tráfego entre blocos de distribuição com altíssima velocidade e disponibilidade, sem políticas pesadas. A divisão torna a rede previsível, fácil de escalar e de diagnosticar.',
            '        [Núcleo]\n       /        \\\n[Distribuição] [Distribuição]\n   |   |         |   |\n[Acesso][Acesso][Acesso][Acesso]'
          ),
          sl(
            'Collapsed core e redundância',
            'Em redes pequenas ou médias, núcleo e distribuição podem ser fundidos na mesma camada de switches (collapsed core ou núcleo colapsado, em duas camadas): menos equipamentos e custo, com os mesmos princípios. Redundância significa eliminar pontos únicos de falha: dois switches de núcleo/distribuição, cada switch de acesso com dois uplinks (para equipamentos diferentes), links agregados, gateway redundante (FHRP) e fontes de energia duplas. Mas redundância exige gerenciamento (STP, protocolos de roteamento) e testes de falha de verdade.',
            'acesso -> uplink 1 -> distribuição A\nacesso -> uplink 2 -> distribuição B\n(se A cair, B continua)'
          ),
          sl(
            'Plano de endereçamento e IPAM',
            'Um plano de endereçamento define como o espaço de IPs é dividido: blocos por local, função (usuários, servidores, gerência, convidados, DMZ), com espaço de sobra para crescer e sumarização possível. Exemplo de convenção: 10.<site>.<vlan>.0/24, em que o site 2, VLAN 30, usa 10.2.30.0/24. O IPAM (IP Address Management) é a ferramenta ou planilha controlada que registra quais blocos, sub-redes e endereços estão alocados, para quem, e com qual função, evitando duplicidade e sobreposição. Reserve faixas para gateways, servidores e DHCP.',
            'site 1 (matriz): 10.1.0.0/16\n  VLAN 10 usuários  10.1.10.0/24\n  VLAN 20 servidores 10.1.20.0/24\nsite 2 (filial) : 10.2.0.0/16'
          ),
          sl(
            'Convenção de nomes',
            'Nomes padronizados permitem identificar equipamento, local e função só pelo nome, e facilitam logs, monitoramento e automação. Defina um padrão e siga-o sempre: por exemplo, sw-sp01-acc-03 (switch, site sp01, camada de acesso, número 03) ou fw-sp01-core-01. Use nomes sem acentos nem espaços, a mesma lógica para VLANs (nome descritivo: USUARIOS, SERVIDORES, CONVIDADOS) e para etiquetas físicas. Evite nomes de pessoas ou nomes engraçados, que não escalam.',
            'sw-sp01-acc-03   switch de acesso 3, site sp01\nsw-sp01-dis-01   switch de distribuição\nfw-sp01-bor-01   firewall de borda'
          ),
          sl(
            'Diagramas L1, L2 e L3',
            'Diagramas contam a rede em níveis. Diagrama físico (L1): equipamentos, racks, cabos e portas. Diagrama lógico L2: VLANs, trunks, agregações e topologia do STP. Diagrama lógico L3: sub-redes, gateways, roteamento e firewalls. Cada diagrama responde a perguntas diferentes: "em que porta está esse cabo?" é L1; "quais VLANs passam neste trunk?" é L2; "para onde roteia essa sub-rede?" é L3. Mantenha-os atualizados: diagrama errado é pior que nenhum.',
            'L1: rack 2, porta Gi1/0/12 -> patch 24 -> tomada A-12\nL2: trunk Gi1/0/48 carrega VLANs 10,20,30\nL3: 10.1.10.0/24 gateway 10.1.10.1 no sw-sp01-dis-01'
          ),
          sl(
            'Gestão de mudanças e documentação',
            'Toda mudança deve ser planejada: o que muda e por quê, quem aprova, janela de execução, passos, teste de validação e plano de rollback (como voltar atrás se der errado). Registre a mudança, faça backup da configuração antes e atualize a documentação (diagramas, IPAM, inventário) depois. Isso reduz paradas causadas por mudanças improvisadas, ajuda na investigação de incidentes ("o que mudou ontem?") e na auditoria. Documentação sensível (senhas, topologia detalhada) deve ter acesso controlado.',
            'mudança: adicionar VLAN 40\njanela: sábado 22h  | backup: feito\nteste: ping gateway da VLAN 40  | rollback: remover VLAN 40 do trunk'
          ),
          sl(
            'Capacidade e crescimento',
            'Capacidade é planejada medindo o uso real (monitoramento) e projetando o crescimento: mais usuários, mais vídeo, mais nuvem. Um conceito útil é o oversubscription (sobreinscrição): a razão entre a banda somada das portas de acesso e a dos uplinks. Exemplo: 48 portas de 1 Gbps (48 Gbps) e 2 uplinks de 10 Gbps (20 Gbps) resultam em 48/20 = 2,4:1. Funciona porque nem todas as portas transmitem ao mesmo tempo, mas se a utilização dos uplinks se aproximar do limite, é hora de ampliar. Deixe portas livres e espaço no rack para crescer.',
            '48 x 1 Gbps = 48 Gbps (acesso)\n 2 x 10 Gbps = 20 Gbps (uplinks)\n48 / 20 = 2,4 : 1'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual camada do modelo hierárquico faz o roteamento entre VLANs e aplica políticas como ACLs?', 'c', [
          'Acesso',
          'Núcleo, que aplica as políticas mais pesadas',
          'Distribuição',
          'Nenhuma, isso é feito pelo servidor DNS'
        ], 'A distribuição agrega os acessos, roteia entre VLANs e concentra as políticas. O núcleo só transporta rapidamente.'),
        mcq('q2', 'Quando faz sentido usar o collapsed core?', 'b', [
          'Em redes grandes de data center, sempre',
          'Em redes pequenas ou médias, fundindo núcleo e distribuição para reduzir equipamentos e custo',
          'Quando se quer eliminar a camada de acesso',
          'Quando não há redundância'
        ], 'No núcleo colapsado, os switches de distribuição fazem também o papel de núcleo, em duas camadas.'),
        mcq('q3', 'O que significa eliminar pontos únicos de falha?', 'a', [
          'Garantir que a queda de um único equipamento ou link não derrube o serviço, por exemplo com dois uplinks para equipamentos diferentes',
          'Ter apenas um switch por andar',
          'Usar somente um cabo',
          'Desligar o monitoramento'
        ], 'Redundância com caminhos e equipamentos duplicados mantém a rede funcionando quando uma parte falha.'),
        fill('q4', 'Calcule a razão de oversubscription: 48 portas de 1 Gbps e uplinks que somam 20 Gbps.', '48 / 20 = ___ : 1', ['2,4', '2.4'], '48 Gbps de acesso sobre 20 Gbps de uplinks resulta em 2,4 para 1.'),
        mcq('q5', 'Qual é o objetivo de um IPAM?', 'd', [
          'Cifrar o tráfego entre VLANs',
          'Substituir o DHCP',
          'Aumentar a velocidade do núcleo',
          'Registrar e controlar blocos, sub-redes e endereços, evitando duplicidade e sobreposição'
        ], 'O IPAM é o controle central do espaço de endereçamento, seja ferramenta ou planilha.'),
        mcq('q6', 'Qual é a vantagem de uma convenção de nomes como sw-sp01-acc-03?', 'a', [
          'Identifica equipamento, local e função só pelo nome, facilitando logs, monitoramento e automação',
          'Aumenta a velocidade do switch',
          'Substitui o diagrama de rede',
          'Dispensa o inventário'
        ], 'Nomes padronizados tornam logs e alertas imediatamente compreensíveis e permitem automação.'),
        mcq('q7', 'Qual diagrama mostra VLANs permitidas em cada trunk e a topologia do STP?', 'b', [
          'L1, o físico',
          'L2, o lógico de camada 2',
          'L3, o lógico de camada 3',
          'Nenhum deles'
        ], 'L2 mostra VLANs, trunks e STP. L1 mostra cabos e portas; L3, sub-redes e roteamento.'),
        fill('q8', 'Como se chama o plano para desfazer uma mudança que deu errado?', 'mudança: plano de ___ (voltar atrás)', ['rollback'], 'Todo plano de mudança deve prever o rollback antes da execução.')
      ]
    },
    {
      id: 'rdi-29-troubleshooting-intermediario',
      title: 'Diagnóstico intermediário de redes',
      goal: 'Aplicar uma metodologia e reconhecer sintomas de VLAN errada, duplex mismatch, loop, rota ausente, MTU e DNS lento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Metodologia: divide e conquistar',
            'Diagnosticar é reduzir o espaço de busca. Passos: definir o problema com precisão (quem, o que, desde quando, o que mudou); coletar fatos; levantar hipóteses; testar uma coisa por vez; confirmar e documentar. Divide-and-conquer: em vez de começar na camada 1 ou na 7, comece no meio (por exemplo, ping ao gateway) e, conforme o resultado, vá para cima ou para baixo. Se o ping ao gateway falha, o problema está entre o host e o gateway (cabo, VLAN, IP, máscara). Se funciona, suba (rota, DNS, aplicação).',
            'ping 127.0.0.1      -> pilha local ok?\nping IP próprio       -> interface ok?\nping gateway          -> LAN ok?\nping IP externo       -> rota/NAT ok?\nping nome             -> DNS ok?'
          ),
          sl(
            'VLAN errada e duplex mismatch',
            'VLAN errada: o host está em outra VLAN que a esperada. Sintomas: recebe IP de outra faixa (ou nenhum IP, se a VLAN não tem DHCP), não alcança o gateway esperado. Veja a VLAN da porta (show vlan brief) e corrija. Duplex mismatch: uma ponta em full duplex e a outra em half duplex (comum quando um lado fixa velocidade e duplex e o outro autonegocia). Sintomas: link sobe, mas fica lento, com perda intermitente, e os contadores mostram erros (CRC, late collisions). Corrija deixando as duas pontas em auto, ou fixando as duas igualmente.',
            'Switch# show vlan brief\nVLAN Name        Ports\n10   USUARIOS    Gi0/1, Gi0/2\n20   SERVIDORES  Gi0/3\n(host na Gi0/3 recebeu IP da faixa dos servidores)'
          ),
          sl(
            'Loop de camada 2',
            'Um loop em L2 (cabo ligado de volta à própria rede, ou STP desativado ou mal configurado) faz quadros de broadcast circularem e se multiplicarem infinitamente: a tempestade de broadcast (broadcast storm). Sintomas: rede inteira lentíssima ou parada, CPU dos switches alta, LEDs piscando sem parar, tabela MAC instável (mesmo MAC aparecendo em portas diferentes), MAC flapping nos logs. Ação: identificar e desconectar o enlace do loop, e prevenir com STP e BPDU guard nas portas de acesso.',
            '%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6801 in vlan 10 is flapping\nbetween port Gi0/1 and port Gi0/2'
          ),
          sl(
            'Rota ausente e problemas de gateway',
            'Rota ausente: o destino é alcançável no seu segmento, mas não em outras redes. Ping para a rede remota falha; traceroute avança até certo roteador e para ali (esse roteador não sabe o caminho, ou o de volta). Verifique a tabela de rotas do roteador onde para (ip route / show ip route). Gateway errado: o host usa como gateway um endereço que não é o roteador (por erro de digitação ou DHCP incorreto): acessa a LAN, mas não sai dela. Roteamento assimétrico: a ida e a volta seguem caminhos diferentes; é normal em redes redundantes, mas firewalls stateful só veem metade da conversa e descartam pacotes, causando falhas estranhas.',
            'traceroute 203.0.113.5\n 1  192.168.1.1   1 ms\n 2  10.0.0.2      3 ms\n 3  * * *      (para aqui: o roteador 2 não tem rota?)'
          ),
          sl(
            'MTU e fragmentação: ping com DF',
            'O MTU típico de Ethernet é 1500 bytes de pacote IP. Se um enlace do caminho tem MTU menor (túneis e VPNs diminuem o MTU) e o pacote não pode ser fragmentado (bit DF ligado), o roteador o descarta e envia uma mensagem ICMP "fragmentation needed". Se esse ICMP é bloqueado, a conexão trava com páginas que começam e não terminam, mas pings pequenos funcionam. Teste com ping sem fragmentar, de tamanhos variados. O tamanho do dado do ping é MTU menos 28 bytes (20 do IP + 8 do ICMP): para 1500, é 1472. Linux: ping -M do -s 1472; Windows: ping -f -l 1472.',
            '$ ping -M do -s 1472 192.0.2.10\nFrom 10.0.0.2 icmp_seq=1 Frag needed and DF set (mtu = 1400)   # 1472 + 28 = 1500 não cabe\n$ ping -M do -s 1372 192.0.2.10\n64 bytes from 192.0.2.10 (funciona)'
          ),
          sl(
            'DNS lento e uso de captura e logs',
            'Sintoma típico de DNS lento: o ping ao IP responde na hora, mas abrir sites demora vários segundos no começo (o resolvedor primário não responde e o sistema espera o tempo limite antes de tentar o secundário). Teste com dig exemplo.com e olhe "Query time"; compare servidores DNS. Para casos difíceis, a captura de pacotes mostra o que realmente acontece (consultas sem resposta, retransmissões, resets), e os logs de equipamentos e servidores dão a linha do tempo. Meça antes e depois de qualquer correção.',
            '$ dig exemplo.com\n;; Query time: 2004 msec\n;; SERVER: 192.168.1.1#53'
          ),
          sl(
            'Roteiro e checklist',
            'Roteiro prático: 1) qual é o sintoma exato e o que mudou? 2) quantos usuários afetados e onde (um host, uma VLAN, tudo)? 3) camada 1: cabo, link, LEDs, contadores de erro; 4) camada 2: VLAN, duplex, loops, MAC; 5) camada 3: IP, máscara, gateway, rotas; 6) DNS e MTU; 7) aplicação e firewall/ACL; 8) logs e captura de pacotes; 9) corrigir uma coisa por vez, testar, documentar a causa e a solução. Se afeta só um host, comece por ele; se afeta uma VLAN, olhe o gateway/trunk; se afeta tudo, olhe o núcleo e a saída.',
            'um host    -> cabo, IP, VLAN da porta\numa VLAN   -> gateway, trunk, DHCP\ntodos      -> núcleo, firewall, link de saída'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um host consegue pingar 127.0.0.1 e o próprio IP, mas não o gateway da LAN. Onde está o problema mais provável?', 'b', [
          'No servidor DNS',
          'Entre o host e o gateway: cabo, VLAN, máscara ou gateway configurado',
          'No site de destino',
          'No certificado TLS'
        ], 'A pilha local está ok, e o próximo salto falha: investigue a conexão com a LAN (cabo, VLAN, IP/máscara).'),
        mcq('q2', 'Qual sintoma sugere duplex mismatch?', 'a', [
          'Link sobe, mas fica lento e com perdas intermitentes, com erros CRC e late collisions nos contadores',
          'Nenhuma conectividade, com LED apagado',
          'O DNS não resolve nomes',
          'Certificado expirado'
        ], 'O desacordo de duplex causa colisões tardias e erros, degradando o desempenho sem derrubar o link.'),
        mcq('q3', 'Toda a rede ficou lenta de repente, os switches estão com CPU alta e os logs mostram o mesmo MAC alternando entre duas portas. O que é provável?', 'c', [
          'Rota ausente no roteador',
          'DNS lento',
          'Loop de camada 2 com tempestade de broadcast',
          'Erro de certificado'
        ], 'MAC flapping e CPU alta são marcas de loop L2. Desconecte o enlace do loop e reforce STP e BPDU guard.'),
        fill('q4', 'Qual tamanho de dados deve ser usado em ping -M do -s ___ para testar um MTU de 1500 (20 de IP + 8 de ICMP)?', 'ping -M do -s ___ 192.0.2.10', ['1472'], '1500 - 28 = 1472. Se esse tamanho falha com DF ligado, o MTU do caminho é menor.'),
        mcq('q5', 'ping -M do -s 1472 falha com "message too long", e -s 1372 funciona. O que isso indica?', 'd', [
          'O destino está desligado',
          'O DNS está lento',
          'Há duplex mismatch',
          'O MTU do caminho é menor que 1500 (por exemplo, por causa de um túnel), e pacotes grandes sem fragmentação são descartados'
        ], 'Pacote pequeno passa e grande não: MTU menor no caminho, com o bit DF impedindo fragmentação.'),
        mcq('q6', 'Pings por IP respondem na hora, mas abrir sites demora vários segundos no início. Qual é a causa mais provável?', 'c', [
          'Cabo defeituoso',
          'VLAN errada',
          'DNS lento (o primeiro resolvedor não responde e o sistema espera o timeout)',
          'Loop de camada 2'
        ], 'Conectividade por IP boa e atraso na resolução de nomes apontam para o DNS. Verifique com dig e compare resolvedores.'),
        mcq('q7', 'O traceroute avança até o roteador 2 e depois só mostra * * *, enquanto o destino não é alcançado. Qual é a hipótese mais útil a verificar?', 'a', [
          'A tabela de rotas do roteador 2 (rota ausente para o destino, ou para a volta)',
          'A cor do cabo da LAN',
          'O certificado do site',
          'A senha Wi-Fi'
        ], 'O ponto onde o caminho para é o melhor lugar para olhar a tabela de rotas. Roteamento assimétrico e firewalls stateful também podem causar falhas assim.'),
        fill('q8', 'Qual subcomando mostra a VLAN de cada porta de um switch Cisco?', 'show vlan ___', ['brief'], 'show vlan brief lista as VLANs e as portas associadas.')
      ]
    },
    {
      id: 'rdi-30-consolidacao-intermediaria',
      title: 'Projeto guiado: rede de uma pequena empresa',
      goal: 'Juntar VLANs, VLSM, roteamento, DHCP, DNS, firewall, Wi-Fi, VPN, monitoramento e LGPD num projeto completo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Requisitos e plano de VLANs com VLSM',
            'A empresa fictícia tem: 100 funcionários (e dispositivos) na rede interna, 20 servidores, 40 dispositivos de convidados, 10 equipamentos de administração/gerência e um pequeno segmento para servidores publicados na internet (DMZ), com 5 equipamentos. Bloco privado disponível: 192.168.100.0/24. Com VLSM, aloca-se do maior para o menor: 100 hosts exigem /25 (126 utilizáveis; /26 daria só 62); 40 exigem /26 (62); 20 exigem /27 (30); 10 exigem /28 (14); 5 equipamentos mais o gateway exigem /29 (6 utilizáveis). Lembre que o gateway também consome um endereço de cada rede. Cada rede começa num endereço múltiplo do seu tamanho e não se sobrepõe.',
            'VLAN 10 USUARIOS   192.168.100.0/25    (.1-.126)    gw .1\nVLAN 30 CONVIDADOS 192.168.100.128/26  (.129-.190)  gw .129\nVLAN 20 SERVIDORES 192.168.100.192/27  (.193-.222)  gw .193\nVLAN 40 GERENCIA   192.168.100.224/28  (.225-.238)  gw .225\nVLAN 50 DMZ        192.168.100.240/29  (.241-.246)  gw .241'
          ),
          sl(
            'Roteamento entre VLANs, DHCP e DNS',
            'Um switch de camada 3 (ou um roteador com sub-interfaces) faz o roteamento entre VLANs: cada VLAN tem uma interface virtual (SVI) com o IP do gateway. O DHCP entrega endereço, máscara, gateway e DNS por VLAN; como o DHCP está numa VLAN diferente dos clientes, o relay (ip helper-address) encaminha os pedidos ao servidor. Servidores e equipamentos de rede usam IPs fixos ou reservas, fora das faixas dinâmicas. O DNS interno resolve nomes da empresa e encaminha o resto a resolvedores externos.',
            'interface Vlan10\n ip address 192.168.100.1 255.255.255.128\n ip helper-address 192.168.100.195\n!\ninterface Vlan30\n ip address 192.168.100.129 255.255.255.192'
          ),
          sl(
            'Firewall, ACLs e DMZ',
            'A DMZ é uma zona intermediária para servidores publicados (site, e-mail, proxy reverso), isolada da rede interna: se um servidor da DMZ for comprometido, o invasor não chega direto à LAN. Política padrão: negar tudo e liberar só o necessário. Internet para DMZ: apenas as portas publicadas (por exemplo, 443). DMZ para LAN: negar (apenas fluxos específicos e iniciados de dentro). Usuários para servidores: só as portas necessárias. Convidados: somente internet, sem acesso a nenhuma rede interna. Gerência: acessível só por quem administra.',
            'Internet -> DMZ     : permitir TCP 443 (apenas ao servidor web)\nDMZ      -> LAN     : negar\nUSUARIOS -> SERVIDORES : permitir só portas dos serviços\nCONVIDADOS -> internet : permitir;  -> redes internas: negar'
          ),
          sl(
            'Wi-Fi corporativo e de convidados',
            'No Wi-Fi corporativo, o ideal é WPA2/WPA3-Enterprise (802.1X com RADIUS), com credenciais individuais; se a empresa não tiver essa estrutura, WPA2/WPA3-Personal com senha forte e trocada quando alguém sai. O SSID de convidados é separado, na VLAN 30, com isolamento de clientes, limite de banda e política só para internet. Planeje canais e potência com site survey e use backhaul cabeado para os APs. Mapeie SSIDs às VLANs correspondentes por trunk configurado entre switch e APs.',
            'SSID EMPRESA     -> VLAN 10 (802.1X/RADIUS)\nSSID CONVIDADOS  -> VLAN 30 (isolado, só internet)'
          ),
          sl(
            'VPN para acesso remoto',
            'Para o trabalho remoto, a empresa oferece uma VPN no firewall de borda, com contas individuais, MFA e regras por perfil: cada grupo acessa só o que precisa. Os usuários remotos recebem endereços de um pool dedicado (por exemplo 10.99.0.0/24, fora do bloco das VLANs, para as regras de firewall tratarem o grupo à parte). Serviços internos (RDP, SSH, arquivos) não são publicados na internet: só são alcançados via VPN. Logs da VPN têm retenção definida e acesso restrito.',
            'Remoto (10.99.0.0/24) -> VPN -> permitir SERVIDORES (portas necessárias)\nRDP/SSH/SMB: nunca publicados na internet'
          ),
          sl(
            'Monitoramento, backup e documentação',
            'Monitore com SNMPv3 (ou agentes), syslog centralizado, fluxos e NTP em todos os equipamentos, com baseline e poucos alertas acionáveis (link de saída, CPU, interfaces, certificados perto de expirar). Faça backup periódico e automático das configurações dos equipamentos, guardado cifrado e fora do próprio equipamento, e teste a restauração. Mantenha IPAM, diagramas L1/L2/L3, nomes padronizados e um processo de mudança com rollback. Registre o inventário e quem tem acesso administrativo.',
            'backup de configs: diário, cifrado, restauração testada\nsyslog -> servidor central | NTP -> mesma fonte de tempo\nIPAM + diagramas + inventário atualizados'
          ),
          sl(
            'Checklist de segurança e LGPD',
            'Checklist: segmentação por VLAN e política de negar por padrão; SSH em vez de Telnet, contas individuais e MFA no acesso administrativo; portas não usadas desligadas, port security e DHCP snooping nas portas de acesso; firmware atualizado e senhas padrão trocadas; Wi-Fi de convidados isolado; VPN com mínimo privilégio; backups cifrados e testados. LGPD: mapeie onde há dados pessoais (servidores de RH, clientes), restrinja o acesso a eles, cifre quando possível, defina retenção e minimização dos logs (IPs e usuários são dados pessoais) e tenha plano de resposta a incidentes.',
            '[ ] segmentação e negar por padrão   [ ] SSH + MFA\n[ ] portas fechadas/shutdown           [ ] backup cifrado testado\n[ ] logs com retenção definida         [ ] plano de incidentes'
          )
        ]
      },
      questions: [
        mcq('q1', 'No plano, a VLAN de usuários precisa de 100 hosts. Qual é a menor máscara que atende?', 'd', [
          '/26, que oferece 62 hosts utilizáveis',
          '/27, que oferece 30 hosts utilizáveis',
          '/24, é a única possível',
          '/25, que oferece 126 hosts utilizáveis'
        ], '/25 = 128 endereços, 126 utilizáveis. /26 dá 62, insuficiente para 100.'),
        mcq('q2', 'Qual é o endereço de broadcast da rede 192.168.100.128/26 (convidados)?', 'c', [
          '192.168.100.190',
          '192.168.100.255',
          '192.168.100.191',
          '192.168.100.129'
        ], '/26 tem 64 endereços: de .128 a .191. O último (.191) é o broadcast; .190 é o último utilizável.'),
        mcq('q3', 'Qual regra de firewall está de acordo com o desenho da DMZ?', 'a', [
          'Internet para DMZ só nas portas publicadas (por exemplo, 443) e DMZ para a LAN negado',
          'DMZ liberada para toda a LAN',
          'Internet liberada para toda a LAN',
          'Convidados liberados para a DMZ e a LAN'
        ], 'A DMZ isola servidores expostos. Se um deles for comprometido, não deve alcançar a LAN.'),
        fill('q4', 'Qual é o último octeto da máscara /27 (255.255.255.___)?', '/27 = 255.255.255.___', ['224'], '/27 tem 3 bits no último octeto: 128 + 64 + 32 = 224.'),
        mcq('q5', 'Qual é o primeiro endereço utilizável da rede 192.168.100.224/28 (gerência), normalmente usado como gateway?', 'b', [
          '192.168.100.224',
          '192.168.100.225',
          '192.168.100.226',
          '192.168.100.239'
        ], 'O .224 é o endereço da rede; o primeiro utilizável é .225. O .239 é o broadcast.'),
        mcq('q6', 'Qual conjunto de regras de acesso do projeto está correto?', 'd', [
          'Convidados acessam servidores e internet',
          'Usuários acessam todas as portas de todas as redes',
          'Gerência é acessível por qualquer VLAN',
          'Convidados só internet; usuários só as portas necessárias dos servidores; gerência apenas por quem administra'
        ], 'Mínimo privilégio e negar por padrão: cada segmento só acessa o que precisa.'),
        mcq('q7', 'Qual combinação faz parte de um bom fechamento de segurança e LGPD para o projeto?', 'b', [
          'Backups sem criptografia e logs guardados para sempre',
          'VPN com MFA, backups cifrados e restauração testada, logs com retenção definida e acesso restrito',
          'RDP aberto na internet e senhas compartilhadas',
          'Sem monitoramento, para não registrar dados pessoais'
        ], 'Medidas técnicas e organizacionais juntas: acesso mínimo, MFA, backup cifrado testado e retenção definida de logs.'),
        fill('q8', 'Quantos hosts utilizáveis tem a DMZ /29?', '/29: 2^3 - 2 = ___ hosts utilizáveis', ['6'], '/29 tem 8 endereços; descontando rede e broadcast, sobram 6.')
      ]
    },
  ]
};
