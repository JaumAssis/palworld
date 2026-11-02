// Módulo "Fundamentos" (Linux, nível Iniciante) — lições de 8 questões cada (3 múltipla escolha +
// 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a validação de boot.
// Conteúdo para quem nunca usou Linux: o que é, distribuições, formas de usar, terminal, árvore de
// diretórios, navegação, manipulação e leitura de arquivos, editores, redirecionamento, filtros,
// usuários/permissões, processos, pacotes e variáveis de ambiente. Comandos reais de shell (GNU/bash);
// os exemplos de processamento de texto foram executados num bash de verdade e as saídas mostradas
// são as obtidas. Comandos específicos do Linux (apt, dnf, /proc, chown, systemd...) são descritos só
// no que é estável, com aviso de que a saída varia por distribuição. Nenhum número de versão ou
// data incerta é afirmado.
// Para não repetir o mesmo objeto literal dezenas de vezes, as questões usam helpers locais (mcq e
// fill) que produzem exatamente o formato esperado pela validação do boot: mcq recebe a letra da
// resposta correta e as 4 alternativas na ordem a, b, c, d (a posição da certa é escolhida à mão e
// variada); fill recebe prompt, código com a lacuna ___ e a lista de respostas aceitas (a 1ª é a
// canônica). sl() monta um slide (code opcional).
// Segurança e privacidade (LGPD): mínimo privilégio (não usar root no dia a dia), cuidado com
// rm -rf e redirecionamento que sobrescreve, sudo só com comandos entendidos, repositórios oficiais
// e verificação de SHA-256, desconfiança de "curl | sudo bash", permissões mínimas (600 em chaves
// SSH), segredos fora de variáveis exportadas em arquivos versionados. Todos os usuários, hosts e
// arquivos dos exemplos são fictícios — nenhum dado pessoal real.
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
  id: 'fundamentos-linux',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'O que é Linux, distribuições, terminal, arquivos, permissões, processos, pacotes e variáveis de ambiente',
  accent: '#eab308',
  lessons: [
    {
      id: 'lnb-01-o-que-e-linux',
      title: 'O que é Linux',
      goal: 'Distinguir kernel de sistema operacional completo, entender código aberto e saber onde o Linux roda.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Linux é, a rigor, um kernel',
            'O kernel (núcleo) é o programa que fica entre o hardware e todos os outros programas. Ele decide quem usa o processador e por quanto tempo, gerencia a memória, conversa com discos, rede e dispositivos, e controla quem pode acessar o quê. Seus programas não falam direto com o hardware: pedem serviços ao kernel (as chamadas de sistema). O kernel Linux foi criado por Linus Torvalds e hoje é mantido por uma comunidade enorme de pessoas e empresas.',
            'Programas (navegador, editor, shell...)\n        |  pedem serviços (chamadas de sistema)\n        v\n   KERNEL Linux\n        |  controla\n        v\nHardware (CPU, memória, disco, rede...)'
          ),
          sl(
            'Do kernel ao sistema completo: GNU/Linux',
            'Um kernel sozinho não serve para o dia a dia: faltam o shell, os comandos básicos (ls, cp, grep...), as bibliotecas, o compilador. Boa parte dessas ferramentas vem do projeto GNU, anterior ao Linux. Kernel Linux + ferramentas GNU + outros programas formam o que alguns chamam de GNU/Linux. No uso comum, "Linux" acaba designando o conjunto todo — mas saber a diferença ajuda: quando alguém diz "atualizei o kernel", fala só do núcleo.',
            'sistema completo = kernel Linux\n                 + ferramentas GNU (shell, ls, cp, grep...)\n                 + bibliotecas, instalador, programas'
          ),
          sl(
            'Código aberto e a licença GPL',
            'O código do kernel é aberto: qualquer pessoa pode ler, estudar, modificar e redistribuir. Ele usa a GPL (GNU General Public License; no kernel, a versão 2). A GPL é uma licença copyleft: se você distribuir uma versão modificada, deve manter a mesma licença e oferecer o código-fonte a quem a receber. Atenção a dois equívocos: aberto não significa "sem dono" nem "sem suporte" (há empresas que vendem suporte), e gratuito é consequência comum, não a definição.'
          ),
          sl(
            'Unix como inspiração',
            'O Unix é um sistema criado nos anos 1970 nos Laboratórios Bell. Suas ideias moldaram tudo o que veio depois: programas pequenos que fazem uma coisa bem, texto como formato comum, comandos que se combinam, e "tudo é um arquivo". O Linux não é feito com o código do Unix: foi escrito do zero, mas segue as mesmas interfaces e a mesma filosofia (por isso se diz "tipo Unix", ou Unix-like). É por isso que o que você aprende aqui vale também para outros sistemas da família, como o macOS, que tem raízes no Unix.'
          ),
          sl(
            'Onde o Linux roda',
            'Servidores de sites e aplicações; a nuvem (a grande maioria das máquinas virtuais e containers que você contrata roda Linux); o Android (usa o kernel Linux, com outro conjunto de programas por cima); roteadores, TVs, carros e equipamentos embarcados; supercomputadores (a grande maioria usa Linux); e também notebooks e desktops. Containers, aliás, compartilham o kernel Linux da máquina hospedeira. Resultado: dificilmente você trabalhará com tecnologia sem encostar nele.'
          ),
          sl(
            'Por que aprender, e mitos comuns',
            'Quem desenvolve, opera servidores, trabalha com nuvem, dados ou segurança acaba acessando máquinas Linux remotas (por SSH) que nem têm interface gráfica: só o terminal. Dominar o básico dá autonomia e permite automatizar tarefas. Mitos: "Linux é só para hackers" (não: há desktops amigáveis); "Linux é uma coisa só" (existem muitas distribuições); "Linux não tem vírus" (existem malwares e vulnerabilidades para Linux; a segurança depende de atualizar e configurar bem); "só se usa o terminal" (há interface gráfica, mas o terminal é onde o poder está).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o Linux, em sentido estrito?', 'b', [
          'Uma distribuição completa, com instalador, ambiente gráfico e programas',
          'O kernel, o núcleo que gerencia processador, memória e dispositivos',
          'Um conjunto de comandos de terminal, como ls e cp, escrito pelo projeto GNU',
          'Um ambiente gráfico de janelas e ícones usado nos desktops'
        ], 'Linux, a rigor, é o kernel. Os comandos vêm de outros projetos (como o GNU) e a parte gráfica é um programa à parte; juntos, formam um sistema completo.'),
        mcq('q2', 'Por que se fala em "GNU/Linux"?', 'd', [
          'Porque o kernel Linux foi derivado diretamente do código-fonte do Unix da Bell Labs',
          'Porque GNU é o nome da empresa responsável por manter e distribuir o kernel',
          'Porque o kernel só funciona com um tipo de processador chamado GNU, de uso restrito',
          'Porque ferramentas essenciais (shell, ls, cp) vêm do projeto GNU'
        ], 'O sistema completo une o kernel Linux a ferramentas do projeto GNU e outros programas. O kernel não deriva do código do Unix.'),
        mcq('q3', 'O que a licença GPL (copyleft) exige de quem distribui uma versão modificada?', 'a', [
          'Manter a mesma licença e oferecer o código-fonte a quem receber a versão modificada',
          'Pagar royalties ao autor original quando a versão modificada for distribuída',
          'Pedir permissão individual a cada autor do código antes de distribuir a versão',
          'Esconder o código-fonte da modificação para proteger o trabalho de quem a fez'
        ], 'Copyleft: a liberdade se propaga. Quem redistribui precisa manter a licença e disponibilizar o código. Não há cobrança de royalties.'),
        fill('q4', 'Complete: o componente central do Linux, que controla CPU, memória e dispositivos, chama-se ___.', 'O ___ do Linux fica entre os programas e o hardware.', ['kernel', 'núcleo', 'nucleo'], 'O kernel (núcleo) é o programa que gerencia os recursos da máquina e atende aos pedidos dos demais programas.'),
        mcq('q5', 'Qual é a relação do Linux com o Unix?', 'c', [
          'O Linux é o próprio Unix, apenas com outro nome comercial',
          'O Linux usa o código-fonte do Unix, licenciado pelos Laboratórios Bell',
          'Foi escrito do zero, mas segue a filosofia e as interfaces do Unix',
          'O Linux foi o sistema que deu origem ao Unix nos anos 1970'
        ], 'O Linux é "tipo Unix" (Unix-like): nasceu depois, sem usar o código do Unix, mas adotando suas ideias (programas pequenos, texto, tudo é arquivo).'),
        mcq('q6', 'Qual afirmação sobre onde o Linux roda é correta?', 'b', [
          'Roda em servidores, mas não em celulares nem em equipamentos embarcados como roteadores',
          'O kernel Linux está em servidores, na nuvem, no Android, em roteadores e supercomputadores',
          'Roda em computadores desktop com interface gráfica instalada, mas não em servidores',
          'Container usa o sistema operacional da imagem inteira, sem depender do kernel do hospedeiro'
        ], 'O Linux está em quase tudo. Containers compartilham o kernel do hospedeiro, e o Android usa o kernel Linux com outro conjunto de programas.'),
        mcq('q7', 'Qual destes é um mito sobre Linux?', 'd', [
          'Existem várias distribuições diferentes, cada uma com seu foco e seu público',
          'Em servidores remotos é comum haver só o terminal, sem interface gráfica',
          'Há desktops gráficos amigáveis para quem não quer usar o terminal no dia a dia',
          'Por ser código aberto, o Linux é imune a malware e dispensa atualizações'
        ], 'Código aberto não significa invulnerável: há falhas e malware para Linux. Atualizar e configurar bem continua essencial.'),
        fill('q8', 'Complete sobre a licença do kernel Linux (sigla em inglês, General Public License):', 'Licença do kernel: ___ (copyleft)', ['GPL', 'GNU GPL', 'GPLv2', 'GPL v2', 'GPL2', 'GPL-2.0'], 'O kernel Linux usa a GPL (versão 2): você pode usar, estudar, modificar e redistribuir, mantendo a mesma licença.')
      ]
    },
    {
      id: 'lnb-02-distribuicoes',
      title: 'Distribuições',
      goal: 'Entender o que é uma distribuição, conhecer as famílias principais e escolher uma para estudar, servidor ou desktop.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma distribuição',
            'Uma distribuição (ou "distro") é um sistema pronto para instalar, montado em volta do kernel Linux. Ela reúne: o kernel, as ferramentas básicas (em geral GNU), um gerenciador de pacotes, repositórios com milhares de programas, um instalador e configurações padrão — e, opcionalmente, um ambiente gráfico. O kernel é praticamente o mesmo em todas; o que muda é a escolha de programas, a forma de empacotar e atualizar, e a filosofia do projeto.',
            'distribuição = kernel Linux\n              + ferramentas básicas\n              + gerenciador de pacotes + repositórios\n              + instalador e configurações padrão\n              + (opcional) ambiente gráfico'
          ),
          sl(
            'As grandes famílias',
            'Distribuições nascem umas das outras e formam famílias, identificadas pelo gerenciador de pacotes e pelo formato dos pacotes. Debian e derivadas (Ubuntu, Linux Mint): APT e arquivos .deb. Red Hat e afins (Fedora, RHEL, Rocky Linux, AlmaLinux): DNF e arquivos .rpm. Arch e derivadas (Manjaro): pacman. Alpine: apk, muito enxuta, popular em containers (usa BusyBox e musl no lugar das ferramentas GNU usuais). SUSE (openSUSE): zypper e .rpm. Os nomes mudam, a ideia é a mesma.',
            'Debian/Ubuntu/Mint  -> apt    (.deb)\nFedora/RHEL/Rocky    -> dnf    (.rpm)\nArch/Manjaro         -> pacman\nAlpine               -> apk\nopenSUSE/SUSE        -> zypper (.rpm)'
          ),
          sl(
            'Versões LTS e lançamento contínuo (rolling)',
            'Há dois modelos de atualização. Lançamentos pontuais: a distro publica versões numeradas e mantém cada uma por um período; as versões LTS (Long Term Support, como as do Ubuntu) ou "stable" (Debian) recebem correções de segurança por anos — ideais para servidores, onde estabilidade importa. Lançamento contínuo (rolling release, como Arch e openSUSE Tumbleweed): não há "versões"; você atualiza o sistema o tempo todo e recebe programas novíssimos, com maior chance de algo quebrar numa atualização.'
          ),
          sl(
            'Ambientes de desktop',
            'A interface gráfica não faz parte do kernel: é um conjunto de programas chamado ambiente de desktop. Os mais conhecidos: GNOME (moderno e minimalista), KDE Plasma (muito personalizável) e Xfce (leve, bom para máquinas modestas). Muitas distros oferecem "sabores" com cada um deles. Servidores quase nunca têm ambiente de desktop instalado: menos programas rodando significa menos recursos gastos e menos superfície para ataques.'
          ),
          sl(
            'Como escolher',
            'Para estudar: uma distro popular e bem documentada, como Ubuntu LTS ou Debian — a maioria dos tutoriais e respostas na internet assume APT. Para servidor: versões estáveis com suporte longo (Debian stable, Ubuntu LTS, Rocky ou AlmaLinux). Para desktop: Linux Mint, Fedora ou Ubuntu, conforme gosto. Para containers: Alpine é comum pelo tamanho. Para aprender a fundo montando tudo à mão: Arch. Regra de segurança: escolha uma distro que continue recebendo atualizações de segurança — evite projetos abandonados.'
          ),
          sl(
            'Por que os comandos do curso funcionam em quase todas',
            'Comandos como ls, cp, grep, chmod e a sintaxe do shell vêm de ferramentas padronizadas e são iguais nas distros comuns. O que muda entre famílias é, principalmente: o gerenciador de pacotes (apt, dnf, pacman...), alguns caminhos de configuração e nomes de pacotes. Na Alpine, as ferramentas do BusyBox podem aceitar menos opções que as GNU. Para descobrir em qual distro você está, leia /etc/os-release, presente na grande maioria das distros modernas. A saída abaixo é só um exemplo e varia.',
            '$ cat /etc/os-release\nNAME="Ubuntu"\nVERSION_ID="..."\nID=ubuntu\nID_LIKE=debian\n# o conteúdo varia conforme a distribuição'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que compõe uma distribuição Linux?', 'c', [
          'Somente o kernel Linux, sem nenhum outro programa junto',
          'Apenas o ambiente gráfico e o navegador de internet que acompanham o sistema',
          'Kernel, ferramentas, gerenciador de pacotes, repositórios e instalador',
          'Um conjunto de comandos de terminal compatível com os do Windows'
        ], 'Uma distribuição empacota o kernel com ferramentas, gerenciador de pacotes, repositórios e instalador. O ambiente gráfico é opcional.'),
        mcq('q2', 'Qual família usa o gerenciador APT e pacotes .deb?', 'a', [
          'Debian e derivadas, como Ubuntu e Linux Mint',
          'Fedora, RHEL e derivadas, como Rocky Linux e AlmaLinux',
          'Arch Linux e derivadas, como Manjaro',
          'Alpine Linux e outras distros voltadas a containers'
        ], 'Debian e derivadas usam APT/.deb. Fedora e Rocky usam DNF/.rpm, Arch usa pacman e Alpine usa apk.'),
        mcq('q3', 'O que caracteriza uma distribuição de lançamento contínuo (rolling release)?', 'd', [
          'Publica uma versão numerada por ano e só muda nessas datas, com programas fixos',
          'Cada versão recebe correções de segurança por muitos anos, sem mudar de programas',
          'Não usa gerenciador de pacotes: o usuário compila tudo do código-fonte',
          'Não há versões: o sistema é atualizado continuamente, com mais risco de quebra'
        ], 'No rolling release você acompanha o fluxo de atualizações (Arch, Tumbleweed). Estabilidade por muitos anos é característica das LTS/stable.'),
        fill('q4', 'Complete o comando que mostra os dados da distribuição instalada (varia a saída conforme a distro):', 'cat /etc/___', ['os-release'], 'O arquivo /etc/os-release traz nome, versão e família (ID_LIKE) da distribuição, na grande maioria das distros modernas.'),
        mcq('q5', 'Para um servidor em produção, que precisa de estabilidade e correções de segurança por vários anos, qual opção é mais adequada?', 'b', [
          'Uma distro rolling release, para ter sempre o programa mais novo',
          'Uma versão estável com suporte longo, como Ubuntu LTS ou Debian stable',
          'Uma distro experimental, para testar novidades antes de todo mundo',
          'Uma distro com ambiente gráfico completo, para facilitar a administração'
        ], 'Em servidor, previsibilidade vale mais que novidade. Versões LTS/stable têm ciclo longo de correções. Ambiente gráfico em servidor só gasta recursos.'),
        mcq('q6', 'Qual característica descreve a Alpine Linux?', 'c', [
          'Usa APT e é a base do Ubuntu e do Linux Mint',
          'Foi feita especificamente para supercomputadores e clusters científicos',
          'É enxuta (apk, BusyBox) e muito usada em imagens de containers',
          'É voltada a desktops, com uma interface gráfica pesada'
        ], 'A Alpine é minimalista e usa apk. Por gerar imagens pequenas, é popular em containers.'),
        mcq('q7', 'O que são GNOME, KDE Plasma e Xfce?', 'a', [
          'Ambientes de desktop: a camada gráfica, separada do kernel',
          'Três versões diferentes do kernel Linux mantidas em paralelo',
          'Gerenciadores de pacotes das famílias Red Hat e Debian, respectivamente',
          'Sistemas de arquivos usados para formatar discos e pendrives'
        ], 'Ambientes de desktop são programas gráficos (janelas, painéis, menus) que rodam sobre o sistema; o kernel é o mesmo.'),
        fill('q8', 'Na família Red Hat/Fedora, qual gerenciador de pacotes moderno equivale ao apt do Debian?', 'sudo ___ install htop', ['dnf', 'yum'], 'Fedora e derivadas usam dnf (o antigo yum é seu antecessor, ainda presente como compatibilidade em várias distros).')
      ]
    },
    {
      id: 'lnb-03-formas-de-usar-linux',
      title: 'Formas de usar Linux',
      goal: 'Conhecer as formas de rodar Linux, seus riscos e escolher uma maneira segura de aprender, baixando e verificando a ISO.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Um mapa das opções',
            'Você pode usar Linux de várias formas: instalação nativa (o Linux é o sistema do computador), dual boot (Linux e Windows no mesmo disco, escolhidos na inicialização), máquina virtual (um computador simulado dentro do seu), WSL2 (Linux dentro do Windows), live USB (rodar de um pendrive sem instalar), containers e servidor na nuvem. Cada uma tem vantagens e riscos diferentes — e algumas mexem no seu disco, outras não.'
          ),
          sl(
            'Instalação nativa e dual boot',
            'Na instalação nativa o Linux ocupa o computador e o instalador pode apagar o disco inteiro. No dual boot, dois sistemas dividem o mesmo disco, em partições diferentes; para isso, é preciso diminuir uma partição existente do Windows para abrir espaço. Mexer em partições é a operação mais arriscada deste curso: um erro, uma queda de energia ou escolher o disco errado pode causar perda de dados. Faça backup (de verdade, em outro disco ou na nuvem) antes de qualquer alteração em partições. Se usa criptografia de disco, guarde a chave de recuperação.'
          ),
          sl(
            'Máquina virtual',
            'Um programa de virtualização (VirtualBox, VMware, KVM/virt-manager, Hyper-V...) cria um computador simulado: o "disco" da VM é só um arquivo dentro do seu. Você instala o Linux ali dentro e o sistema real não é alterado. Vantagens: isolamento, liberdade para errar, e snapshots (fotografias do estado que permitem voltar atrás). Desvantagens: consome memória e processador da máquina real e fica um pouco mais lento. É uma das melhores formas de aprender com segurança.'
          ),
          sl(
            'WSL2 no Windows',
            'O WSL2 (Windows Subsystem for Linux) roda um Linux real, com seu próprio kernel, integrado ao Windows. Em versões atuais do Windows, abre-se o PowerShell e instala-se com um comando; depois, você abre o terminal Linux como qualquer programa. Seus arquivos do Windows aparecem em /mnt/c, mas o desempenho costuma ser melhor trabalhando dentro do sistema de arquivos do próprio Linux. É ótimo para desenvolvimento e para aprender, sem particionar o disco.',
            'PS> wsl --install\n# instala o WSL e uma distribuição padrão (pode pedir reinício)'
          ),
          sl(
            'Live USB, containers e nuvem',
            'Live USB: você grava a ISO num pendrive, inicia o computador por ele e testa o sistema sem instalar nada; ao desligar, suas alterações somem (salvo configurar persistência). Cuidado: a gravação apaga o pendrive inteiro, então confira que escolheu o dispositivo certo. Containers (Docker etc.) rodam programas isolados usando o kernel do hospedeiro, não são uma máquina completa. Servidor na nuvem (VPS): você contrata uma máquina Linux e acessa por SSH. Realista, mas fica exposta à internet: use chaves SSH, não senhas fracas, e mantenha tudo atualizado.'
          ),
          sl(
            'Escolha segura e verificação da ISO',
            'Para aprender sem risco: VM, WSL2 ou live USB não alteram os arquivos do seu disco. Ao baixar a ISO (a imagem de instalação), use só o site oficial da distribuição. Cada projeto publica uma soma de verificação (hash SHA-256): uma "impressão digital" do arquivo; mudando um único bit, o hash muda por completo. Calcule o hash do arquivo baixado com sha256sum e compare com o publicado no site oficial; se for diferente, o download está corrompido ou adulterado — apague e baixe de novo. A saída abaixo foi gerada num arquivo de teste (no Linux há dois espaços antes do nome).',
            '$ echo ola > a.txt\n$ sha256sum a.txt\nae5e34f70239c2d2634ec7780f38d526a797a2b0095b1128cb4a066b0be110c1  a.txt\n\n$ sha256sum a.txt > a.sha     # guarda a soma\n$ sha256sum -c a.sha          # confere depois\na.txt: OK\n$ echo x >> a.txt             # altera o arquivo\n$ sha256sum -c a.sha\na.txt: FAILED\nsha256sum: WARNING: 1 computed checksum did NOT match'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre containers é correta?', 'd', [
          'Cada container traz seu próprio kernel, como uma máquina virtual completa por dentro',
          'Containers rodam em servidores na nuvem, mas não em computadores pessoais comuns',
          'Containers exigem particionar o disco do computador antes de serem usados',
          'Rodam programas isolados, mas compartilham o kernel do sistema hospedeiro em vez de trazer o seu'
        ], 'Diferente de uma VM, o container não carrega um kernel próprio: usa o do hospedeiro, o que o torna leve.'),
        mcq('q2', 'Qual é o principal risco do dual boot?', 'b', [
          'O Linux deixa de funcionar quando o Windows está instalado no mesmo disco',
          'Redimensionar partições pode causar perda de dados; é preciso ter backup antes',
          'Só é possível instalar uma única distribuição, sem escolher qual iniciar no boot',
          'O computador fica sem acesso à internet até que os drivers sejam reinstalados'
        ], 'Reduzir partições existentes é delicado: erro ou queda de energia pode corromper dados. Backup antes de particionar.'),
        mcq('q3', 'Por que uma máquina virtual é boa para quem está aprendendo?', 'c', [
          'Porque roda mais rápido que o Linux instalado direto no hardware',
          'Porque dispensa baixar uma imagem de instalação do sistema',
          'Isola o experimento: disco real intacto e snapshots para desfazer',
          'Porque só pode ser usada por quem já administra servidores profissionalmente'
        ], 'A VM isola o experimento: o disco do convidado é um arquivo, e snapshots permitem voltar a um estado anterior.'),
        fill('q4', 'No PowerShell do Windows, complete o comando que instala o WSL:', 'wsl --___', ['install'], 'wsl --install instala o WSL e uma distribuição Linux padrão, sem particionar o disco.'),
        mcq('q5', 'O que acontece com as alterações feitas num live USB comum, ao desligar o computador?', 'a', [
          'Somem por padrão, já que nada é instalado no disco',
          'Ficam gravadas de forma permanente no disco interno do computador',
          'São enviadas automaticamente à nuvem do projeto da distribuição para backup',
          'Alteram a BIOS do computador, que passa a iniciar direto pelo pendrive'
        ], 'O live USB é para testar: nada é instalado, e o que você muda se perde, a não ser que você configure persistência.'),
        mcq('q6', 'Você contratou um servidor Linux na nuvem. Qual cuidado é mais importante?', 'd', [
          'Deixar a senha padrão do provedor para facilitar o acesso do suporte técnico',
          'Desativar as atualizações automáticas para evitar mudanças inesperadas no servidor',
          'Abrir todas as portas do firewall para evitar problemas de conexão',
          'Usar chave SSH, manter tudo atualizado e expor só os serviços necessários'
        ], 'Servidores expostos são atacados automaticamente o tempo todo. Chaves SSH, atualizações e poucas portas abertas reduzem o risco.'),
        mcq('q7', 'Você baixou a ISO de uma distribuição. Qual é o procedimento correto?', 'b', [
          'Gravar direto no pendrive e confiar que o instalador avisará se der erro',
          'Calcular o SHA-256 e comparar com o valor do site oficial do projeto',
          'Confiar no nome do arquivo, que já identifica a versão e a origem do download',
          'Baixar a ISO de um espelho que seja mais rápido, sem conferir nada'
        ], 'Comparar o hash detecta arquivos corrompidos ou adulterados. Use só a fonte oficial para a ISO e para o hash.'),
        fill('q8', 'Complete o comando que calcula a soma de verificação SHA-256 de um arquivo:', '___ ubuntu.iso', ['sha256sum'], 'sha256sum arquivo imprime o hash; sha256sum -c arquivo.sha confere uma lista de somas.')
      ]
    },
    {
      id: 'lnb-34-instalando-linux',
      title: 'Instalando o Linux passo a passo',
      goal: 'Escolher uma distribuição, baixar e verificar a ISO, criar o pendrive, particionar com segurança e fazer a pós-instalação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Passo 1: escolher a distribuição para começar',
            'Para o primeiro contato, prefira uma distribuição com instalador gráfico, comunidade grande e muita documentação em português (por exemplo Ubuntu, Linux Mint, Fedora ou Debian). Procure uma edição de suporte longo ou estável: ela muda menos e quebra menos. O comando de pacotes e o visual mudam entre elas, mas os conceitos deste curso valem para todas. Não existe "a melhor": escolha uma, aprenda, e troque depois se quiser. Antes de qualquer coisa, decida COMO vai usar: máquina virtual e WSL2 (aulas anteriores e a próxima) não mexem no disco; instalar de verdade mexe, e é isso que esta lição ensina. Avisos: as telas e os menus do instalador variam por distribuição e versão; use esta lição como mapa, não como roteiro de cliques.'
          ),
          sl(
            'Passo 2: baixar a ISO só do site oficial e verificar',
            'A ISO é a imagem do instalador. Baixe somente do site oficial da distribuição (digite o endereço você mesmo ou use o link do site do projeto): ISOs de terceiros podem vir adulteradas. O projeto publica o hash SHA-256 do arquivo; você calcula o hash do que baixou e compara. Se for diferente, o arquivo está corrompido ou foi alterado: apague e baixe de novo. Detalhe importante: o hash só prova algo se ele vier do site oficial, e não da mesma página duvidosa que serviu o arquivo. Muitos projetos também assinam o arquivo de hashes com GPG (assinatura digital): é uma camada extra, que prova que quem publicou foi o projeto; em visão geral, você importa a chave pública oficial e verifica a assinatura com o gpg. No Windows, dá para calcular o hash no próprio terminal.',
            '# Linux (exemplo; o hash e o nome dependem do arquivo):\n$ sha256sum distro.iso\n<64 caracteres hexadecimais>  distro.iso\n\n# Windows (PowerShell ou Prompt de Comando):\n> certutil -hashfile distro.iso SHA256\n\n# Compare o resultado, caractere a caractere, com o hash do site oficial.'
          ),
          sl(
            'Passo 3: criar o pendrive bootável (e o perigo do disco errado)',
            'Um pendrive bootável é um pendrive que o computador consegue iniciar. Gravar a ISO nele APAGA TUDO o que estava no pendrive: use um vazio ou com cópia dos arquivos em outro lugar. No Windows, programas como Rufus ou balenaEtcher fazem isso com poucos cliques (você escolhe a ISO e o pendrive). No Linux, o comando dd copia bytes brutos de um lugar para outro e NÃO pergunta nada: se você apontar of= para o disco errado (por exemplo, o disco do seu sistema), ele sobrescreve esse disco e os dados se perdem. Por isso, antes de rodar, liste os discos com lsblk e confirme pelo tamanho e pelo nome qual é o pendrive. Os nomes (sda, sdb, nvme0n1...) variam de máquina para máquina, e o alvo do dd é o disco inteiro (como /dev/sdb), não uma partição (como /dev/sdb1).',
            '$ lsblk          # EXEMPLO: confira o tamanho de cada disco\nNAME   SIZE TYPE\nsda    476G disk     # disco do sistema: NAO usar!\nsdb     15G disk     # parece o pendrive (16 GB)\n\n# ATENCAO: apaga o destino inteiro. Troque sdb pelo SEU pendrive.\n$ sudo dd if=distro.iso of=/dev/sdb bs=4M status=progress\n$ sync          # garante que tudo foi gravado'
          ),
          sl(
            'Passo 4: menu de boot, BIOS/UEFI e Secure Boot',
            'Para iniciar pelo pendrive, o computador precisa ser instruído a ligar por ele. Ao ligar, aperte repetidamente a tecla do menu de boot (ou entre na BIOS/UEFI, o firmware da placa-mãe, para mudar a ordem de inicialização). A tecla varia por fabricante e modelo (Esc, F2, F10, F12, Del são comuns): procure no manual ou na tela inicial do seu computador. Secure Boot é um recurso do UEFI que só aceita carregar sistemas com assinatura confiável. Muitas distribuições populares conseguem iniciar com ele ligado; se o pendrive não aparecer ou for recusado, a documentação da distribuição explica como proceder (às vezes é preciso ajustar essa opção). Não desligue recursos de segurança sem entender o motivo.'
          ),
          sl(
            'Passo 5: teste em modo live antes de instalar',
            'Quase todos os pendrives de instalação oferecem o modo "live": o sistema roda do pendrive sem instalar nada. Aproveite para conferir, no seu hardware, se o Wi-Fi, o vídeo, o áudio, o touchpad e o teclado funcionam. Se algo não funcionar, é melhor saber agora, antes de mexer no disco. As alterações feitas no modo live somem ao desligar. Quando tudo estiver bem, o próprio ambiente live costuma ter um atalho "Instalar" que abre o instalador.'
          ),
          sl(
            'Passo 6: particionando (a etapa mais perigosa)',
            'Três caminhos. (1) Instalar ao lado do Windows (dual boot): faça BACKUP dos seus arquivos num disco externo ou na nuvem ANTES de tudo; se o Windows usa BitLocker ou outra criptografia, guarde a chave de recuperação (e, se necessário, suspenda a proteção) antes de mexer; reduza a partição do Windows pelo próprio Windows (gerenciamento de disco) para abrir espaço livre; depois o instalador usa esse espaço. (2) Apagar o disco inteiro: só se esse é o objetivo, pois destrói tudo. (3) Particionamento manual, para quem entende. Partições típicas: EFI (guarda os arquivos de inicialização; no dual boot normalmente se reaproveita a que o Windows criou), a raiz / (sistema e programas), /home opcional (seus arquivos, separados do sistema, o que facilita reinstalar) e swap (área de troca, usada quando a memória aperta; pode ser partição ou arquivo). Errar o disco ou a partição, ou faltar energia no meio do processo, pode causar perda de dados.'
          ),
          sl(
            'Passo 7: usuário, criptografia e depois da instalação',
            'O instalador pergunta idioma, fuso horário, layout de teclado, seu nome e uma senha forte e única. Escolha com cuidado a senha: ela dá acesso ao sudo. A criptografia de disco (LUKS) é opcional: embaralha o disco e pede uma senha ao ligar; protege seus dados se o notebook for roubado, mas se você perder a senha, não há como recuperar. Depois de instalar: atualize o sistema; instale drivers recomendados (placas de vídeo, Wi-Fi) pelas ferramentas da própria distribuição; habilite codecs de mídia se necessário; configure backup e, se possível, snapshots. Problemas comuns: Wi-Fi ou placa de vídeo sem driver (use o cabo e instale os drivers); hora errada em dual boot (o Windows costuma tratar o relógio da placa-mãe como hora local e o Linux como UTC, então cada um "corrige" o outro: configure um dos dois para concordar com o outro); o menu GRUB não mostra o Windows (geralmente se resolve atualizando a configuração do gerenciador de boot, conforme a documentação da sua distribuição).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que vale testar o sistema em modo "live" antes de instalar?', 'c', [
          'O modo live já deixa o Linux instalado de forma permanente no pendrive, dispensando a instalação no disco',
          'Ele acelera a instalação posterior, porque copia os arquivos para o disco enquanto você testa o sistema',
          'Dá para conferir Wi-Fi, vídeo e teclado no seu hardware sem alterar o disco',
          'Ele dispensa a verificação do hash, pois o ambiente live valida a ISO sozinho a cada inicialização'
        ], 'O modo live roda do pendrive sem instalar nada, então você descobre incompatibilidades antes de mexer no disco. As alterações feitas ali somem ao desligar.'),
        mcq('q2', 'Você baixou a ISO de um site de terceiros, e o hash mostrado na própria página dele confere com o arquivo. O que fazer?', 'b', [
          'Seguir em frente, pois um hash que confere é garantia de que o arquivo é idêntico ao original do projeto',
          'Baixar do site oficial e comparar com o hash de lá; o da fonte duvidosa não prova nada',
          'Gravar no pendrive e confiar no Secure Boot, que barra qualquer ISO adulterada antes de ela iniciar no computador',
          'Renomear o arquivo com o nome da versão oficial, para o instalador aceitá-lo sem acusar erro'
        ], 'O hash só vale se vier de uma fonte confiável: quem adultera o arquivo pode adulterar o hash ao lado dele. Use o site oficial para as duas coisas.'),
        mcq('q3', 'No Linux, o lsblk mostra sda (476G, com seu sistema) e sdb (15G, removível). Você quer gravar a ISO num pendrive de 16 GB com dd. Qual é a atitude segura?', 'd', [
          'Usar of=/dev/sda, porque o primeiro disco da lista costuma ser o pendrive recém-conectado',
          'Usar of=/dev/sdb1 e conferir depois se o sistema continua funcionando normalmente no outro disco',
          'Rodar o dd primeiro e, só depois de terminar, conferir pelo lsblk se o disco certo foi gravado',
          'Confirmar pelo tamanho que o pendrive é o sdb e apontar of= apenas para /dev/sdb, o disco inteiro',
        ], 'O dd sobrescreve o destino sem perguntar. Confirme o dispositivo pelo tamanho no lsblk ANTES de rodar, e aponte para o disco inteiro do pendrive.'),
        fill('q4', 'Complete o comando que lista discos e partições, para confirmar qual é o pendrive antes de gravar:', '$ ___', ['lsblk'], 'lsblk lista os dispositivos de bloco (discos e partições) com nome e tamanho, ajudando a não apontar o dd para o disco errado.'),
        mcq('q5', 'Você vai instalar o Linux ao lado do Windows. Qual preparo é o mais seguro?', 'a', [
          'Backup, chave do BitLocker (se houver), reduzir a partição pelo Windows e só então instalar',
          'Reduzir a partição pelo próprio instalador do Linux, sem backup, já que ele protege os dados do Windows existentes',
          'Formatar a partição do Windows para liberar espaço e reinstalar o Windows depois que o Linux estiver pronto',
          'Pular o backup quando o computador é novo, pois discos novos não costumam perder dados ao serem redimensionados',
        ], 'Redimensionar partições pode corromper dados (erro, queda de energia). Backup, chave de recuperação e redução pelo Windows reduzem o risco.'),
        mcq('q6', 'Qual é a função da partição EFI na instalação?', 'd', [
          'Guardar os arquivos pessoais do usuário, separados do restante do sistema',
          'Servir de memória extra quando a RAM acaba, funcionando como a área de swap',
          'Armazenar o sistema inteiro, com programas e bibliotecas, a partir da pasta raiz',
          'Guardar os arquivos de inicialização que o UEFI usa para carregar os sistemas instalados'
        ], 'A partição EFI contém os gerenciadores de boot. Os arquivos pessoais ficam em /home (opcional), o sistema em / e a memória extra na swap.'),
        mcq('q7', 'Após instalar o Linux ao lado do Windows, a hora fica errada a cada troca de sistema. Qual é a causa conceitual?', 'b', [
          'O Linux altera a hora do BIOS a cada boot para sincronizar com a internet, e o Windows desfaz a mudança',
          'Os dois sistemas leem o relógio da placa-mãe de formas diferentes: um espera hora local e o outro UTC',
          'A bateria da placa-mãe se desgasta mais rápido quando há dois sistemas instalados no mesmo disco rígido ou SSD',
          'O fuso é gravado na partição EFI e é sobrescrito sempre que um dos sistemas inicia, apagando o ajuste anterior',
        ], 'O relógio de hardware é um só. Se o Windows o trata como hora local e o Linux como UTC, cada um deixa a hora errada para o outro. É preciso configurar um deles para concordar.'),
        fill('q8', 'Complete: a criptografia de disco comumente oferecida nos instaladores Linux usa o padrão ___.', 'Disco criptografado com ___ (pede a senha ao ligar)', ['LUKS'], 'LUKS embaralha o disco e exige a senha ao iniciar. Protege contra roubo, mas sem a senha os dados não podem ser recuperados.')
      ]
    },
    {
      id: 'lnb-35-linux-desktop-iniciante',
      title: 'Usando o Linux no desktop',
      goal: 'Usar o Linux com interface gráfica: ambientes, arquivos, apps, atualizações, pendrives, privacidade e como pedir ajuda.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ambientes de desktop: a aparência muda, o sistema não',
            'A parte gráfica do Linux é um programa à parte, chamado ambiente de desktop. Os mais conhecidos: GNOME, KDE Plasma, Xfce e Cinnamon. Cada um tem seu visual, atalhos e jeito de organizar janelas: o GNOME é mais minimalista, o KDE Plasma é muito personalizável, o Xfce é leve, o Cinnamon lembra um desktop tradicional. Trocar de ambiente não troca o kernel nem o sistema por baixo: os arquivos, o terminal, os usuários e os pacotes são os mesmos. Muitas distribuições oferecem edições com ambientes diferentes. Os nomes dos menus variam por distribuição e versão, então aprenda as ideias, não a posição dos botões.'
          ),
          sl(
            'Painel, atividades, menu e o gerenciador de arquivos',
            'Quase todo desktop tem: uma barra/painel (relógio, rede, volume, bateria), um jeito de abrir aplicativos (menu, ou uma visão geral de atividades com busca) e áreas de trabalho para organizar janelas. O gerenciador de arquivos mostra suas pastas (Documentos, Downloads...), permite copiar e mover arrastando e abre arquivos com o programa certo. Ele também tem Lixeira: ao apagar pela interface, o arquivo vai para uma pasta especial e pode ser restaurado. No terminal NÃO existe essa rede de proteção: o rm apaga de forma definitiva. Por isso, apagou pelo gerenciador, dá para recuperar; apagou com rm, em geral não.',
            '$ rm relatorio.txt      # apaga de vez: NAO vai para a Lixeira\n\n# Pelo gerenciador de arquivos: "Mover para a Lixeira"\n# (restaurável enquanto você não esvaziar a Lixeira)'
          ),
          sl(
            'Central de software e como instalar apps com segurança',
            'A central de software (loja de aplicativos) é uma interface gráfica para instalar, atualizar e remover programas. Por baixo, ela usa o gerenciador de pacotes da distribuição (como o APT) e, em muitas, também Flatpak ou Snap, formatos de pacote que trazem as dependências juntas e rodam mais isolados do resto do sistema. Instalar com segurança: use a central ou o repositório oficial da distribuição; para programas de fora, prefira o site oficial do projeto; confira o publicador/o nome do projeto na página do app (cuidado com cópias com nome parecido); desconfie de "instaladores" baixados de sites aleatórios e de comandos "copie e cole" que você não entende. Menos programas instalados significam menos superfície de ataque.',
            '# Equivalente de terminal em famílias com APT (Debian, Ubuntu, Mint):\n$ sudo apt update\n$ sudo apt install nome-do-pacote   # exemplo\n\n# A central de software faz algo parecido, por baixo, com cliques.'
          ),
          sl(
            'Atualizações, Wi-Fi, Bluetooth, áudio e impressora',
            'Atualizações: o sistema avisa quando há novidades; aplique-as com frequência, porque elas corrigem falhas de segurança. Reinicie quando o sistema pedir (alguns pacotes, como o kernel, só passam a valer após reiniciar). A maior parte das configurações fica no aplicativo de Configurações do ambiente de desktop: Wi-Fi (escolher a rede e digitar a senha), Bluetooth (parear dispositivos), áudio (escolher saída e entrada), impressoras (em geral detectadas automaticamente), tela, teclado e idioma. Se algo não funcionar, o problema costuma ser driver ou firmware do fabricante: veja a documentação da sua distribuição.'
          ),
          sl(
            'Pendrives, terminal integrado, atalhos e apps equivalentes',
            'Pendrives e discos externos costumam ser montados automaticamente: aparecem no gerenciador de arquivos ao conectar. Para remover, use "Ejetar" (ou "Remover com segurança"): o sistema guarda dados em memória antes de gravar, e arrancar o pendrive antes pode corromper arquivos. No terminal, o equivalente é desmontar com umount. O ambiente tem um terminal integrado (procure por "Terminal" na busca de aplicativos): tudo o que você aprendeu funciona ali. Atalhos comuns: Alt+Tab troca de janela, a tecla Super (a do logotipo) abre a busca/menu, Ctrl+C e Ctrl+V copiam e colam em aplicativos gráficos (no terminal, o colar costuma ser Ctrl+Shift+V). Apps equivalentes: LibreOffice (documentos e planilhas), Firefox (navegador), GIMP (edição de imagens) e outros.',
            '$ umount /media/ana/PENDRIVE   # EXEMPLO: o caminho varia\n# (se disser "target is busy", feche os programas que usam o pendrive)'
          ),
          sl(
            'Privacidade e segurança no desktop',
            'Bloqueie a tela ao se afastar e configure bloqueio automático. Mantenha o sistema atualizado. Use senha forte e única (um gerenciador de senhas ajuda) e não compartilhe a senha de administrador. Nas configurações de privacidade, revise as permissões de câmera, microfone e localização: conceda só aos aplicativos que precisam e revogue quando não precisar; se uma calculadora pede o microfone, desconfie. Veja também as opções de telemetria/envio de dados de uso da distribuição e desligue o que não quiser compartilhar. A criptografia de disco (configurada na instalação) protege seus arquivos contra quem tiver o computador em mãos; o bloqueio de tela sozinho não impede alguém de ler o disco retirado da máquina. Faça backup regular e teste restaurar.'
          ),
          sl(
            'Como pedir ajuda (e o que NÃO publicar)',
            'Fontes de ajuda, em ordem: a documentação e a wiki oficiais da sua distribuição, as páginas de manual no terminal (man comando) e a opção --help, e os fóruns e comunidades da distribuição. Ao pedir ajuda, diga: qual distribuição e versão, qual ambiente de desktop, o que você tentou, e a mensagem de erro EXATA (copie, não resuma). Antes de postar prints ou logs, remova dados pessoais: nomes de usuário reais, endereços de e-mail, endereços IP, senhas, chaves e tokens. Nunca cole um comando que alguém mandou sem entender o que ele faz, especialmente se tiver sudo ou rm.',
            '$ man ls          # abre o manual do comando ls (q para sair)\n$ ls --help       # resumo das opções'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que muda ao trocar o GNOME pelo KDE Plasma na mesma distribuição?', 'c', [
          'O kernel e o gerenciador de pacotes, que passam a ser outros',
          'Os usuários e as permissões dos arquivos, que precisam ser recriados',
          'Principalmente a aparência, os atalhos e o jeito de organizar janelas; o sistema por baixo é o mesmo',
          'O formato dos arquivos, que deixam de abrir nos programas já instalados, como o navegador'
        ], 'Ambiente de desktop é a camada gráfica. O kernel, os arquivos, o terminal e os pacotes continuam os mesmos.'),
        mcq('q2', 'Você apagou um arquivo com rm no terminal e depois procurou na Lixeira. Por que ele não está lá?', 'a', [
          'O rm apaga de forma definitiva e nunca usa a Lixeira; só a interface gráfica envia para ela',
          'A Lixeira só guarda arquivos grandes, e o seu era pequeno demais para ser enviado a ela pelo terminal',
          'O arquivo está na Lixeira, mas fica oculto até você reiniciar o computador e abrir o gerenciador',
          'O terminal move o arquivo para um disco externo temporário antes de apagar'
        ], 'A Lixeira é um recurso do gerenciador de arquivos, não do rm. No terminal, o apagamento é definitivo, então confira antes de rodar.'),
        mcq('q3', 'Qual é a forma mais segura de instalar um programa novo no desktop?', 'd', [
          'Procurar o nome na internet e executar o primeiro instalador que aparecer, se tiver boas avaliações',
          'Baixar de um site de downloads que reúna vários programas, por ter uma página conveniente',
          'Copiar e colar no terminal o comando de um fórum, mesmo sem saber o que ele faz, se alguém garantiu que funciona',
          'Usar a central de software ou o repositório oficial e conferir o nome e o publicador do app'
        ], 'Repositórios oficiais e a central de software passam por curadoria. Instaladores de origem desconhecida e comandos copiados às cegas são vetores comuns de malware.'),
        fill('q4', 'Complete o comando que desmonta um pendrive pelo terminal (equivalente a "Ejetar"):', '$ ___ /media/ana/PENDRIVE', ['umount'], 'umount desmonta o dispositivo depois de gravar os dados pendentes. Arrancar o pendrive sem desmontar pode corromper arquivos.'),
        mcq('q5', 'Um aplicativo de calculadora recém-instalado pede acesso ao microfone e à sua localização. O que fazer?', 'b', [
          'Conceder, porque aplicativos modernos precisam de todas as permissões para funcionar direito',
          'Negar: uma calculadora não precisa disso; revisar as permissões de privacidade',
          'Conceder temporariamente e esquecer, já que o sistema revoga a permissão sozinho depois de alguns dias',
          'Desinstalar o sistema inteiro, pois o pedido indica que o Linux foi invadido'
        ], 'Conceda o mínimo necessário. Permissões incompatíveis com a função do app são sinal de alerta. Dá para revisar e revogar nas configurações de privacidade.'),
        mcq('q6', 'Por que aplicar as atualizações do sistema com frequência?', 'c', [
          'Para liberar espaço em disco, já que cada atualização remove arquivos antigos de programas',
          'Para que o sistema troque de ambiente de desktop automaticamente a cada ciclo de lançamento',
          'Corrigem falhas de segurança; adiar muito deixa brechas abertas',
          'Para manter o Wi-Fi ligado, já que a rede cai quando o sistema fica desatualizado por alguns dias'
        ], 'Atualizações trazem correções de segurança. Algumas (como a do kernel) só valem após reiniciar.'),
        mcq('q7', 'Seu notebook com Linux foi roubado. O que protege melhor seus arquivos, se estivesse configurado antes?', 'a', [
          'A criptografia de disco: sem a senha, o conteúdo fica totalmente ilegível',
          'O bloqueio de tela, porque ninguém consegue ler o disco sem antes passar por ele',
          'Uma senha de usuário curta e fácil de lembrar, pois o login impede qualquer acesso aos dados do computador',
          'Deixar a Lixeira vazia, porque arquivos fora dela não podem ser lidos por outros'
        ], 'O bloqueio de tela não impede ler o disco retirado do aparelho. A criptografia de disco torna o conteúdo ilegível sem a senha. Backups também ajudam a recuperar o que foi perdido.'),
        fill('q8', 'Complete o comando que abre o manual de um comando no terminal:', '$ ___ ls', ['man'], 'man comando abre a página de manual (q para sair). Também existem --help e a documentação oficial da distribuição.')
      ]
    },
    {
      id: 'lnb-36-wsl2-na-pratica',
      title: 'WSL2 na prática (Linux dentro do Windows)',
      goal: 'Instalar e usar o WSL2: arquivos, desempenho, VS Code, rede, configuração, backup, limites e segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o WSL2',
            'O WSL (Windows Subsystem for Linux) deixa você usar Linux dentro do Windows, sem dual boot e sem particionar o disco. O WSL2 roda um kernel Linux real, dentro de uma máquina virtual leve gerenciada pelo próprio Windows; para você, parece só abrir um terminal Linux. O WSL1 era diferente: traduzia as chamadas do Linux para o Windows, sem kernel Linux. O WSL2 é mais compatível com programas Linux e mais rápido em operações dentro do sistema de arquivos Linux; o WSL1 pode ser mais rápido ao acessar arquivos do Windows. Hoje o recomendado para começar é o WSL2. Avisos: as saídas dos comandos e os requisitos exatos variam por versão do Windows; consulte a documentação oficial da Microsoft.'
          ),
          sl(
            'Requisitos e instalação',
            'Você precisa de uma versão do Windows que ofereça o WSL (as atuais oferecem) e de virtualização habilitada no computador (a opção na BIOS/UEFI costuma se chamar virtualização, VT-x ou SVM, e o nome varia por fabricante; se ela estiver desligada, o WSL2 não inicia). Abra o PowerShell como administrador e use os comandos abaixo; depois pode ser preciso reiniciar. O comando wsl --install instala o WSL e uma distribuição padrão. Para escolher outra, veja a lista com wsl --list --online e instale a desejada.',
            'PS> wsl --install                 # WSL + distribuicao padrao\nPS> wsl --list --online            # lista distribuicoes disponiveis\nPS> wsl --install -d <distro>      # instala uma distribuicao escolhida\nPS> wsl --set-default-version 2    # novas distros usam WSL2\nPS> wsl --status                   # mostra a configuracao geral\nPS> wsl --update                   # atualiza o componente do WSL'
          ),
          sl(
            'Primeiro uso e comandos do dia a dia',
            'Na primeira vez que abrir a distribuição, ela termina a instalação e pede para você criar um nome de usuário e uma senha do Linux: eles são só do Linux, independentes da conta do Windows. Esse usuário pode usar sudo. Use uma senha forte. Depois, atualize os pacotes. Para escolher outra distribuição instalada, use wsl -d <distro>; para ver as instaladas e se são WSL1 ou WSL2, use wsl --list --verbose; para parar tudo (inclusive a VM), wsl --shutdown.',
            '$ sudo apt update && sudo apt upgrade   # em distros com APT (ex.: Ubuntu)\n\nPS> wsl --list --verbose           # distros e versao do WSL de cada uma\nPS> wsl -d <distro>                # abre aquela distribuicao\nPS> wsl --shutdown                 # encerra todas e a VM do WSL'
          ),
          sl(
            'Arquivos nos dois sentidos e desempenho',
            'Do Linux para o Windows: o disco C: aparece em /mnt/c (e os outros em /mnt/d...). Do Windows para o Linux: o Explorador de Arquivos acessa os arquivos da distribuição pelo caminho de rede \\\\wsl$\\<distro> (ou pelo atalho Linux no painel lateral). REGRA DE OURO de desempenho: mantenha seus projetos dentro do sistema de arquivos Linux (a sua pasta pessoal, ~), e não em /mnt/c. Acessar arquivos do Windows por /mnt/c passa por uma camada de tradução e é bem mais lento, o que atrapalha operações com muitos arquivos pequenos (instalar dependências, compilar, git).',
            '$ pwd\n/home/ana                 # EXEMPLO: projeto aqui = rapido\n$ ls /mnt/c                # disco C: do Windows\n$ cd ~ && mkdir projetos   # crie projetos DENTRO do Linux\n\n# No Windows (Explorador): \\\\wsl$\\<distro>\\home\\<usuario>'
          ),
          sl(
            'VS Code e rede',
            'Com o VS Code no Windows e a extensão para WSL (chamada "Remote - WSL" ou "WSL"), você edita arquivos que estão no Linux usando a interface do Windows. Dentro da pasta do projeto, no terminal do WSL, rode code . : o VS Code abre conectado ao WSL, e o terminal integrado dele é o Linux. Na rede: um servidor que você sobe no WSL2 (por exemplo, numa porta de desenvolvimento) normalmente pode ser acessado pelo navegador do Windows em localhost. O WSL2 tem uma rede virtual própria, então o endereço IP da distribuição é diferente do da máquina Windows, e o comportamento pode variar conforme a configuração de rede do WSL: se localhost não funcionar, consulte a documentação oficial.',
            '$ cd ~/projetos/meu-site   # pasta DENTRO do Linux\n$ code .                     # abre o VS Code ligado ao WSL'
          ),
          sl(
            'systemd, .wslconfig, backup e exportação',
            'Dois arquivos diferentes. /etc/wsl.conf fica DENTRO da distribuição e configura aquela distro: por exemplo, para ativar o systemd (gerenciador de serviços, que pode não estar ativo por padrão), escreva a seção [boot] com systemd=true e depois execute wsl --shutdown para a mudança valer na próxima abertura. O arquivo .wslconfig fica na sua pasta de usuário do Windows e configura o WSL2 como um todo: por exemplo, limitar memória e processadores usados pela VM (útil quando ela consome muita RAM). Backup: wsl --export grava a distribuição inteira num arquivo .tar; wsl --import cria uma distribuição a partir dele (em outra pasta ou outro computador). Cuidado: wsl --unregister APAGA a distribuição e todos os arquivos dela; só use depois de um backup.',
            '# /etc/wsl.conf  (dentro da distro, edite com sudo)\n[boot]\nsystemd=true\n\n# %UserProfile%\\.wslconfig  (no Windows)\n[wsl2]\nmemory=4GB\nprocessors=2\n\nPS> wsl --export <distro> backup.tar\nPS> wsl --import <nome> <pasta-destino> backup.tar\nPS> wsl --unregister <distro>      # CUIDADO: apaga a distro!'
          ),
          sl(
            'Limites e segurança',
            'Limites: o WSL2 não é um computador completo: o acesso a hardware específico, como dispositivos USB, não é automático (exige ferramentas ou configuração extra). Programas gráficos Linux funcionam em versões atuais por meio do WSLg, que mostra as janelas no Windows, sem você instalar um servidor gráfico à parte (em visão geral). Segurança: o Linux do WSL enxerga seus arquivos do Windows em /mnt/c, e um comando destrutivo como rm -rf lá apaga arquivos reais do Windows: confira o diretório com pwd antes de apagar e evite rodar comandos copiados sem entender. Mantenha o WSL (wsl --update) e a distribuição (apt update/upgrade) atualizados, use senhas fortes no usuário Linux e faça backup do que importa.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que diferencia o WSL2 do WSL1?', 'c', [
          'O WSL2 roda só aplicativos gráficos, enquanto o WSL1 roda o terminal em modo de texto',
          'O WSL2 exige reiniciar o Windows a cada abertura do terminal, ao contrário do WSL1',
          'O WSL2 usa um kernel Linux real em uma VM leve; o WSL1 traduzia chamadas do Linux para o Windows',
          'O WSL2 é uma distribuição própria da Microsoft, enquanto o WSL1 aceitava distribuições de terceiros'
        ], 'O WSL2 roda um kernel Linux de verdade numa VM leve gerenciada pelo Windows, com maior compatibilidade. O WSL1 fazia tradução de chamadas.'),
        mcq('q2', 'Você rodou wsl --install e o WSL2 não inicia. Qual é uma causa comum a verificar?', 'a', [
          'A virtualização desligada na BIOS/UEFI, que precisa ser habilitada',
          'O PowerShell aberto sem o tema escuro, o que impede que a VM seja criada',
          'Falta de uma segunda partição vazia no disco para a distribuição Linux',
          'Ausência de um pendrive com a ISO da distribuição conectado ao computador'
        ], 'O WSL2 usa virtualização; se ela estiver desligada na BIOS/UEFI, a VM não inicia. Nenhuma partição ou ISO é necessária no WSL.'),
        mcq('q3', 'Onde guardar um projeto que usa muitos arquivos pequenos (dependências, git) para ter bom desempenho no WSL2?', 'd', [
          'Em /mnt/c, para o Windows e o Linux enxergarem exatamente os mesmos arquivos',
          'Na área de trabalho do Windows, que é sempre a pasta mais rápida para o WSL',
          'Em um pendrive USB, já que o WSL2 lê dispositivos externos com velocidade total de leitura',
          'Na pasta pessoal do Linux (~), dentro da distro'
        ], 'Acessar o Windows via /mnt/c passa por uma camada de tradução e é mais lento. Para desempenho, mantenha o projeto no sistema de arquivos Linux.'),
        fill('q4', 'Complete o comando do PowerShell que encerra todas as distribuições e a VM do WSL (útil para aplicar mudanças no wsl.conf):', 'PS> wsl --___', ['shutdown'], 'wsl --shutdown encerra as distribuições e a VM. Na próxima abertura, as configurações novas (como systemd=true) passam a valer.'),
        mcq('q5', 'Você quer limitar a memória usada pelo WSL2. Qual alternativa descreve a configuração correta?', 'b', [
          'Escrever memory=4GB em /etc/wsl.conf, dentro da distro, e depois reiniciar o Windows inteiro',
          'Criar o arquivo .wslconfig na pasta de usuário do Windows, com a seção [wsl2] e memory=4GB',
          'Usar o comando wsl --import com a opção memory, que redimensiona a VM que está em execução',
          'Editar o /etc/fstab da distribuição, onde ficam registrados os limites de memória da VM do WSL'
        ], 'O .wslconfig (no Windows) controla o WSL2 como um todo, inclusive memória e processadores. O /etc/wsl.conf é por distribuição e serve a outras opções, como o systemd.'),
        mcq('q6', 'Antes de mexer muito na sua distribuição, você quer um backup completo dela. O que usar?', 'd', [
          'wsl --unregister, que guarda a distribuição num arquivo antes de removê-la do Windows',
          'Copiar a pasta /mnt/c para outro disco, porque ela contém os arquivos internos da distribuição',
          'wsl --shutdown, que grava automaticamente um arquivo de backup da distribuição na pasta do usuário',
          'wsl --export, que grava a distribuição num arquivo .tar que pode ser restaurado com wsl --import'
        ], 'export gera um .tar da distro; import recria a partir dele. O unregister apaga a distribuição e seus arquivos, por isso só depois de backup.'),
        mcq('q7', 'Por que ter cuidado com rm -rf dentro de /mnt/c no WSL?', 'a', [
          'Porque ele atua nos arquivos reais do Windows, e o que for apagado ali se perde',
          'Porque o WSL bloqueia o rm em /mnt/c e o comando trava a VM por segurança',
          'Porque /mnt/c é uma cópia temporária feita pelo WSL, e apagar nela afeta só o Linux',
          'Porque o rm -rf em /mnt/c apaga a distribuição Linux inteira, mas poupa os arquivos do Windows'
        ], 'O Linux do WSL enxerga o disco C: em /mnt/c com permissão sobre seus arquivos. Comandos destrutivos ali apagam dados reais do Windows.'),
        fill('q8', 'Complete: dentro do Linux do WSL, o disco C: do Windows aparece em /mnt/___.', '$ ls /mnt/___', ['c'], 'O disco C: fica em /mnt/c; os demais discos seguem a mesma regra (/mnt/d etc.). Prefira manter projetos fora dele, em ~.')
      ]
    },
    {
      id: 'lnb-04-terminal-e-shell',
      title: 'O terminal e o shell',
      goal: 'Diferenciar terminal e shell, ler o prompt, montar comandos com opções e argumentos e usar atalhos e operadores.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Terminal, shell e console',
            'São três coisas diferentes que se confundem. O terminal (emulador de terminal) é a janela: mostra texto e recebe seu teclado. O shell é o programa que roda dentro dela, lê o que você digita, interpreta e executa os comandos — bash é o mais comum; há também zsh, sh e fish. O console é o terminal "de verdade" da máquina (a tela de texto do sistema, sem janela gráfica). Trocar o shell não muda o terminal, e vice-versa.',
            '$ echo $SHELL\n/bin/bash\n# mostra o shell de login do usuário (varia conforme a máquina)'
          ),
          sl(
            'O prompt',
            'O prompt é o texto que aparece antes do cursor, avisando que o shell espera um comando. Um formato comum: usuario@maquina:diretorio$. Aqui, "aluno" é o usuário, "servidor1" é o nome da máquina, "~" é o diretório atual (a pasta pessoal) e o último caractere indica o tipo de usuário: $ para usuário comum e # para root, o administrador. Se você vir #, cuidado redobrado: qualquer erro tem poder total sobre o sistema. O prompt é configurável, então o seu pode ter outro aspecto.',
            'aluno@servidor1:~$        # usuário comum, na pasta pessoal\nroot@servidor1:/etc#      # root, dentro de /etc'
          ),
          sl(
            'Anatomia de um comando',
            'Um comando tem até três partes separadas por espaços: o nome do comando, as opções (que mudam o comportamento) e os argumentos (sobre o que ele age). Opções curtas começam com um hífen e uma letra (-l, -a) e podem ser juntadas (-la); opções longas começam com dois hífens e uma palavra (--all, --help). O shell separa as palavras pelos espaços, por isso muitos erros de iniciante vêm de espaço faltando ou sobrando. E atenção: o Linux diferencia maiúsculas de minúsculas (case-sensitive): "LS" não é "ls".',
            '$ ls -l -a /home\n# comando: ls | opções: -l e -a | argumento: /home\n$ ls -la /home        # igual: opções curtas juntas\n$ ls --all /home      # --all é a forma longa de -a\n$ LS\nbash: LS: command not found'
          ),
          sl(
            'Pedindo ajuda: --help e man',
            'Ninguém decora todas as opções. A maioria dos comandos aceita --help, que imprime um resumo de uso na hora. Para a documentação completa, use man (manual): "man ls" abre o manual do ls num paginador — espaço avança, / procura um texto, q sai. Comandos internos do bash, como cd, não têm página própria: use "help cd". A saída abaixo é a primeira linha do ls --help do GNU coreutils (o texto exato pode variar um pouco entre versões).',
            '$ ls --help | head -n 1\nUsage: ls [OPTION]... [FILE]...\n$ man ls          # manual completo (q para sair)\n$ help cd         # ajuda de comandos internos do bash'
          ),
          sl(
            'Atalhos que poupam muito tempo',
            'Tab completa nomes de comandos e arquivos (duas vezes seguidas lista as possibilidades). Setas para cima e para baixo percorrem o histórico de comandos. Ctrl+R busca no histórico: digite parte de um comando antigo. Ctrl+C interrompe o programa em execução (use quando algo travar ou ficar em loop). Ctrl+L limpa a tela. Ctrl+D indica "fim da entrada" e, num prompt vazio, fecha o shell (sai da sessão). O comando history lista o que você já digitou.'
          ),
          sl(
            'Vários comandos numa linha',
            'Três operadores encadeiam comandos. ";" executa um depois do outro, não importa o resultado. "&&" executa o segundo só se o primeiro tiver sucesso. "||" executa o segundo só se o primeiro falhar. Todo comando termina com um código de saída: 0 significa sucesso, qualquer outro valor significa falha. As saídas abaixo foram obtidas no bash. Dica: use && quando um passo depende do anterior (por exemplo, entrar numa pasta só se ela foi criada).',
            '$ echo um; echo dois\num\ndois\n$ true && echo ok\nok\n$ false && echo ok      # não imprime nada\n$ false || echo falhou\nfalhou\n$ mkdir pasta && cd pasta   # só entra se o mkdir deu certo'
          ),
          sl(
            'Aspas simples e duplas',
            'Aspas protegem texto do shell. Aspas simples (\') preservam tudo literalmente: o shell não interpreta nada dentro. Aspas duplas (") preservam os espaços, mas ainda deixam o shell substituir variáveis como $X. Uma variável é um nome que guarda um valor; X=5 guarda o 5 (sem espaços ao redor do sinal de igual) e $X lê o valor. Sem aspas, texto com espaço vira vários argumentos. Mais variáveis aparecem numa lição própria.',
            '$ X=5\n$ echo \'$X\'      # simples: literal\n$X\n$ echo "$X"      # duplas: o shell troca $X pelo valor\n5'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre terminal e shell?', 'a', [
          'O terminal é a janela; o shell é o programa que interpreta os comandos',
          'São dois nomes diferentes para a mesma coisa, usados conforme a distribuição',
          'O shell é a janela que exibe o texto e o terminal é o interpretador de comandos',
          'O terminal só existe em servidores, e o shell só existe em desktops com interface gráfica'
        ], 'Terminal = janela (emulador). Shell = programa dentro dela (bash, zsh...). Trocar um não muda o outro.'),
        mcq('q2', 'Seu prompt é "root@servidor1:/etc#". O que o caractere # indica?', 'c', [
          'Que o comando anterior terminou com erro e o shell está aguardando outro',
          'Que você está dentro de um diretório oculto, cujo nome começa com ponto',
          'Que o usuário atual é o root, com poder total sobre o sistema, e exige cuidado',
          'Que o shell está em modo somente leitura e não grava nenhum arquivo'
        ], '$ indica usuário comum e # indica root. Como root, qualquer comando destrutivo tem efeito total.'),
        mcq('q3', 'No comando "ls -l /etc", quais são a opção e o argumento?', 'b', [
          'Opção: /etc; argumento: -l',
          'Opção: -l; argumento: /etc',
          'Opção: ls; argumento: -l',
          'Os dois são opções; este comando não tem argumento'
        ], 'ls é o comando, -l é a opção (listagem longa) e /etc é o argumento (o que listar).'),
        fill('q4', 'Complete o comando que abre o manual do comando cp:', '___ cp', ['man'], 'man nome abre a documentação completa; dentro dele, q sai e / procura um texto.'),
        mcq('q5', 'Um programa ficou rodando sem parar no terminal. Qual atalho o interrompe?', 'd', [
          'Ctrl+L',
          'Ctrl+D',
          'Tab duas vezes',
          'Ctrl+C'
        ], 'Ctrl+C envia uma interrupção ao programa em primeiro plano. Ctrl+L só limpa a tela e Ctrl+D indica fim da entrada.'),
        mcq('q6', 'Você digitou "LS" e o shell respondeu "command not found". Por quê?', 'a', [
          'O Linux diferencia maiúsculas de minúsculas, e o comando é ls',
          'O comando ls só existe para root',
          'O shell não aceita comandos em letras maiúsculas por segurança, mas aceita misturadas',
          'O terminal precisa ser reiniciado antes de cada comando'
        ], 'Nomes de comandos e arquivos são case-sensitive: LS, Ls e ls são nomes diferentes.'),
        mcq('q7', 'Depois de "X=5", qual é a saída de echo \'$X\' (aspas simples)?', 'c', [
          '5, o valor da variável',
          'Uma linha vazia',
          '$X, literalmente',
          'Um erro de sintaxe'
        ], 'Aspas simples preservam o texto literalmente. Com aspas duplas, "$X" seria trocado por 5.'),
        fill('q8', 'Complete o operador que só executa o segundo comando se o primeiro tiver sucesso:', 'mkdir pasta ___ cd pasta', ['&&'], '&& encadeia por sucesso (código de saída 0). ; executa sempre e || só executa se o anterior falhar.')
      ]
    },
    {
      id: 'lnb-05-estrutura-sistema-arquivos',
      title: 'A estrutura de diretórios do Linux',
      goal: 'Entender a árvore única a partir de /, o papel dos diretórios principais e a diferença entre caminhos absolutos e relativos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Tudo é um arquivo, numa árvore só',
            'No Linux existe uma única árvore de diretórios que começa na raiz, escrita /. Não há letras de unidade como C: e D:. Um segundo disco, um pendrive ou uma partição são montados (ligados) em algum diretório dessa mesma árvore: o conteúdo deles aparece como uma pasta comum. Outra ideia central do Unix: tudo é tratado como arquivo — textos, programas, diretórios, e até dispositivos de hardware e informações do kernel aparecem como arquivos em lugares específicos.',
            '/\n├── home/\n│   └── aluno/\n├── etc/\n├── var/\n└── mnt/\n    └── dados/   <- um segundo disco montado aqui'
          ),
          sl(
            'Pessoas, configuração e dados variáveis',
            'A organização segue um padrão chamado FHS (Filesystem Hierarchy Standard), parecido em quase todas as distros. /home guarda as pastas pessoais dos usuários (por exemplo, /home/aluno). /root é a pasta pessoal do administrador root — fica fora do /home. /etc guarda as configurações do sistema, geralmente em arquivos de texto. /var guarda dados que mudam durante o uso: logs em /var/log, filas, caches, bancos de dados. /tmp guarda arquivos temporários, que podem ser apagados pelo sistema.'
          ),
          sl(
            'Onde ficam os programas',
            '/bin e /sbin guardam comandos essenciais (o "s" de sbin vem de administração do sistema); /usr guarda a maior parte dos programas e bibliotecas instalados (/usr/bin, /usr/lib, /usr/share); /lib guarda bibliotecas usadas pelos programas. Em muitas distribuições modernas, /bin, /sbin e /lib são links simbólicos para os equivalentes dentro de /usr, então o conteúdo é o mesmo. /opt abriga programas de terceiros que vêm numa pasta própria. /boot guarda o kernel e o que é necessário para a inicialização.'
          ),
          sl(
            'Dispositivos e diretórios virtuais',
            '/dev contém "arquivos" que representam dispositivos: discos (como /dev/sda), terminais e peças especiais como /dev/null, que descarta tudo o que recebe. /proc e /sys são sistemas de arquivos virtuais: não ficam gravados no disco; o kernel os gera na hora para mostrar informações sobre processos, o sistema e o hardware. Para ligar discos e mídias, usam-se pontos de montagem: /mnt para montagens manuais temporárias e /media para mídias removíveis (pendrives, CDs), geralmente montadas automaticamente.'
          ),
          sl(
            'Caminhos absolutos e relativos',
            'Um caminho absoluto começa na raiz com / e vale de qualquer lugar: /home/aluno/docs/nota.txt. Um caminho relativo parte do diretório em que você está agora. Atalhos úteis: "." é o diretório atual, ".." é o diretório pai (um nível acima) e "~" é a sua pasta pessoal. Exemplo: estando em /home/aluno/docs, ".." é /home/aluno e "../.." é /home. O separador é a barra normal "/" (no Windows seria "\\").',
            '# estando em /home/aluno/docs:\n.       -> /home/aluno/docs\n..      -> /home/aluno\n../..   -> /home\n~       -> /home/aluno\n/etc    -> caminho absoluto, vale de qualquer lugar'
          ),
          sl(
            'Arquivos ocultos e diferenças com o Windows',
            'Arquivo oculto é, simplesmente, aquele cujo nome começa com ponto (.bashrc, .config); o ls só os mostra com a opção -a. Diferenças práticas em relação ao Windows: não há letras de unidade; o separador é "/"; maiúsculas e minúsculas importam (Notas.txt e notas.txt são arquivos diferentes); extensões como .txt são só parte do nome, não são obrigatórias; e a pasta do usuário fica em /home/nome, não em C:\\Users.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Num sistema Linux com um segundo disco, como o conteúdo dele aparece?', 'b', [
          'Como uma unidade separada, por exemplo D:, fora da árvore principal',
          'Montado em algum diretório da mesma árvore, como /mnt/dados',
          'Dentro de /proc, que reúne todos os discos físicos',
          'Só aparece depois de reiniciar o computador em modo especial'
        ], 'O Linux tem uma árvore única. Discos e pendrives são montados num diretório (ponto de montagem), sem letras de unidade.'),
        mcq('q2', 'Qual diretório guarda, em geral, as configurações do sistema em arquivos de texto?', 'a', [
          '/etc',
          '/tmp',
          '/boot',
          '/media'
        ], '/etc concentra as configurações. /tmp é temporário, /boot guarda o kernel e /media recebe mídias removíveis.'),
        mcq('q3', 'Qual é a pasta pessoal do administrador root?', 'd', [
          '/home/root',
          '/admin',
          '/etc/root',
          '/root'
        ], 'O root tem a pasta /root, fora de /home. Os demais usuários ficam em /home/nome.'),
        fill('q4', 'Complete o caminho onde costumam ficar os logs do sistema:', '/var/___', ['log'], 'Em /var ficam os dados que mudam durante o uso; os logs vão em /var/log.'),
        mcq('q5', 'O que há de especial em /proc e /sys?', 'c', [
          'São pastas de backup criadas pelo administrador na instalação do sistema',
          'Guardam os programas instalados individualmente por cada usuário comum',
          'São sistemas virtuais gerados pelo kernel; nunca ficam gravados no disco',
          'São os diretórios onde o kernel e o carregador de boot ficam gravados'
        ], 'Não são arquivos reais no disco: o kernel os cria na hora. Já o kernel de boot fica em /boot.'),
        mcq('q6', 'Você está em /home/aluno/docs e roda "cd ../..". Para onde vai?', 'a', [
          '/home',
          '/home/aluno',
          '/',
          '/home/aluno/docs/..'
        ], 'Cada .. sobe um nível: docs -> /home/aluno -> /home.'),
        mcq('q7', 'O comando "ls" não mostra o arquivo .config que você sabe que existe. Por quê?', 'd', [
          'Porque o arquivo está corrompido e o sistema esconde arquivos danificados',
          'Porque só o root enxerga arquivos que possuam extensão no nome',
          'Porque o ls mostra arquivos de texto, e não os de configuração',
          'Porque o nome começa com ponto, o que o torna oculto; ls -a mostra os ocultos'
        ], 'Em Unix, ocultar é só começar o nome com ponto. ls -a lista também os ocultos.'),
        fill('q8', 'Qual símbolo representa a pasta pessoal do usuário atual?', 'cd ___', ['~'], '~ é expandido pelo shell para o diretório home do usuário (por exemplo, /home/aluno). cd sem argumentos também leva ao home.')
      ]
    },
    {
      id: 'lnb-06-navegando',
      title: 'Navegando',
      goal: 'Saber onde você está, mudar de diretório, listar com opções, ler a saída de ls -l e lidar com nomes com espaço.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde estou e como me movo: pwd e cd',
            'pwd (print working directory) imprime o caminho absoluto do diretório atual. cd (change directory) muda de diretório: "cd docs" entra numa pasta relativa, "cd /etc" usa um caminho absoluto, "cd .." sobe um nível, "cd" sem argumento e "cd ~" vão para a sua pasta pessoal, e "cd -" volta para o diretório em que você estava antes (e imprime qual é). Os caminhos abaixo são fictícios.',
            '$ pwd\n/home/aluno\n$ cd docs\n$ pwd\n/home/aluno/docs\n$ cd ..\n$ cd -\n/home/aluno/docs\n$ cd\n$ pwd\n/home/aluno'
          ),
          sl(
            'Listando com ls e suas opções',
            'ls lista o conteúdo de um diretório. As opções mais úteis: -l (formato longo, com detalhes), -a (inclui arquivos ocultos, e as entradas . e ..), -h (tamanhos legíveis como 4K e 2M, usada junto de -l), -t (ordena pela data de modificação, mais recente primeiro) e -R (recursivo: entra nas subpastas). Opções curtas combinam: ls -lah. Sem argumento, lista o diretório atual; com um argumento, lista o que você indicar.',
            '$ ls\ndocs  notas.txt\n$ ls -a\n.  ..  .oculto  docs  notas.txt\n$ ls -lah          # longo + ocultos + tamanhos legíveis\n$ ls -lt           # mais recentes primeiro\n$ ls -R projeto    # recursivo'
          ),
          sl(
            'Lendo o ls -l coluna por coluna',
            'Cada linha do ls -l descreve um item, e as colunas são sempre as mesmas. 1) Tipo e permissões: o primeiro caractere é o tipo (- arquivo comum, d diretório, l link simbólico) e os nove seguintes são as permissões (veremos adiante). 2) Número de links. 3) Dono. 4) Grupo. 5) Tamanho em bytes (ou legível com -h). 6) Data e hora da última modificação. 7) Nome. A saída é um exemplo com usuário fictício; "total" é uma soma de blocos e varia.',
            '$ ls -l\ntotal 8\ndrwxr-xr-x 2 aluno equipe 4096 nov  2 10:18 projetos\n-rw-r--r-- 1 aluno equipe   12 nov  2 10:18 notas.txt\n# d = diretório | rwxr-xr-x = permissões | 2 = links\n# aluno = dono | equipe = grupo | 4096 = bytes | data | nome'
          ),
          sl(
            'file, stat e tree',
            'file descobre o tipo de um arquivo olhando o CONTEÚDO, não a extensão: é útil quando o nome engana. stat mostra detalhes completos de um item: tamanho, permissões, dono, datas, número do inode. Com -c você escolhe o formato (opção do GNU stat). tree desenha a árvore de diretórios, por exemplo "tree -L 2" limita a 2 níveis, mas nem sempre vem instalado: se faltar, instale pelo gerenciador de pacotes. As saídas de file e stat abaixo foram obtidas num arquivo de texto de teste.',
            '$ file notas.txt\nnotas.txt: ASCII text\n$ stat -c \'%s bytes, %A, %n\' notas.txt\n4 bytes, -rw-r--r--, notas.txt\n$ tree -L 2        # se estiver instalado'
          ),
          sl(
            'Nomes com espaços',
            'O shell separa palavras por espaço, então "cd Meus Documentos" passa DOIS argumentos e falha. Soluções: colocar o nome entre aspas (cd "Meus Documentos") ou escapar cada espaço com barra invertida (cd Meus\\ Documentos). O melhor é evitar espaços ao criar nomes: use hífen ou sublinhado (meus-documentos, meus_documentos). Dois erros comuns que isso evita: operar sobre o arquivo errado e apagar mais do que se queria.',
            '$ cd Meus Documentos          # ERRO: dois argumentos\n$ cd "Meus Documentos"        # certo: aspas\n$ cd Meus\\ Documentos         # certo: espaço escapado'
          ),
          sl(
            'Autocompletar com Tab',
            'Digite o começo do nome e aperte Tab: o shell completa até onde não haja ambiguidade, e já escapa espaços para você. Se houver mais de uma possibilidade, um segundo Tab lista as opções. Isso evita erros de digitação, acelera o trabalho e confirma que o caminho existe. Combine com o histórico (setas, Ctrl+R) e com "cd -". Em dúvida sobre onde está ou o que há na pasta, rode pwd e ls antes de qualquer comando destrutivo.',
            '$ cd Mei<Tab>      # vira: cd Meus\\ Documentos/\n$ ls pr<Tab><Tab>   # lista: projetos  prints'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o comando pwd imprime?', 'c', [
          'A lista de arquivos do diretório atual',
          'O nome do usuário conectado',
          'O caminho absoluto do diretório atual',
          'A senha do usuário atual, em texto claro'
        ], 'pwd = print working directory: mostra onde você está, como caminho absoluto.'),
        mcq('q2', 'De qualquer pasta, qual comando leva direto à sua pasta pessoal?', 'd', [
          'cd .., que sobe um nível por vez',
          'cd -, que alterna com o diretório anterior',
          'cd /, que vai para a raiz do sistema',
          'cd sozinho (ou cd ~)'
        ], 'cd sozinho e cd ~ vão para o home. cd .. sobe um nível, cd - volta ao diretório anterior e cd / vai à raiz.'),
        mcq('q3', 'Qual comando lista o diretório atual com detalhes, tamanhos legíveis e arquivos ocultos?', 'a', [
          'ls -lah',
          'ls -R',
          'ls -t',
          'ls --help'
        ], '-l dá o formato longo, -a inclui ocultos e -h torna os tamanhos legíveis (4K, 2M).'),
        fill('q4', 'Complete a opção que faz o ls mostrar também os arquivos ocultos:', 'ls ___', ['-a', '--all', '-A'], '-a (ou --all) inclui os nomes que começam com ponto; -A faz o mesmo sem mostrar . e ..'),
        mcq('q5', 'Na linha "drwxr-xr-x 2 aluno equipe 4096 nov 2 10:18 projetos", o que sabemos?', 'b', [
          'É um arquivo comum de 4096 bytes pertencente ao grupo aluno',
          'É um diretório cujo dono é aluno e cujo grupo é equipe',
          'É um link simbólico que aponta para o usuário equipe',
          'É um diretório do usuário equipe, copiado por aluno'
        ], 'O d inicial indica diretório; depois vêm permissões, links, dono (aluno), grupo (equipe), tamanho, data e nome.'),
        mcq('q6', 'Qual comando entra com segurança na pasta chamada "Meus Documentos"?', 'd', [
          'cd Meus Documentos',
          'cd Meus-Documentos',
          'cd [Meus Documentos]',
          'cd "Meus Documentos"'
        ], 'Sem aspas ou escape, o shell separa em dois argumentos. As aspas (ou Meus\\ Documentos) mantêm o nome inteiro.'),
        mcq('q7', 'O que faz "file relatorio.pdf"?', 'a', [
          'Examina o conteúdo para identificar o tipo real, sem confiar na extensão',
          'Abre o arquivo em um leitor de PDF, se houver algum instalado no sistema',
          'Cria um arquivo vazio chamado relatorio.pdf no diretório atual',
          'Mostra as permissões do arquivo, no mesmo formato do ls -l'
        ], 'file lê o conteúdo e informa o tipo real. Se o nome engana, o file revela.'),
        fill('q8', 'Complete o comando que volta ao diretório em que você estava antes:', 'cd ___', ['-'], 'cd - alterna para o diretório anterior (e imprime qual é). O bash guarda esse valor em OLDPWD.')
      ]
    },
    {
      id: 'lnb-07-arquivos-diretorios',
      title: 'Criando, copiando, movendo e apagando',
      goal: 'Manipular arquivos e diretórios com segurança: touch, mkdir, cp, mv, rm, links e curingas, sabendo que não há lixeira.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Criar: touch e mkdir',
            'touch nome cria um arquivo vazio (ou, se já existe, só atualiza a data de modificação). mkdir nome cria um diretório. Se o diretório pai não existir, o mkdir falha — a opção -p cria toda a cadeia necessária, sem reclamar se algo já existir. Várias coisas podem ser criadas de uma vez listando vários nomes. Os nomes são case-sensitive.',
            '$ touch notas.txt\n$ mkdir docs\n$ mkdir -p projeto/src/utils    # cria projeto, src e utils\n$ touch projeto/src/app.txt projeto/src/lib.txt'
          ),
          sl(
            'Copiar: cp',
            'cp origem destino copia um arquivo. Para copiar um diretório e seu conteúdo é preciso -r (recursivo); sem ele, o cp recusa. -i pergunta antes de sobrescrever (sem -i, um destino existente é substituído em silêncio). -a (archive) copia recursivamente preservando permissões, datas e links — ideal para backups. Se o destino for um diretório existente, a cópia vai para dentro dele.',
            '$ cp notas.txt copia.txt\n$ cp -i notas.txt copia.txt    # pergunta antes de sobrescrever\n$ cp projeto backup\ncp: -r not specified; omitting directory \'projeto\'\n$ cp -r projeto backup         # agora copia a pasta toda\n$ cp -a projeto backup2        # mantém permissões e datas'
          ),
          sl(
            'Mover e renomear: mv',
            'mv serve para dois fins que são, no fundo, a mesma operação: mover para outro lugar e renomear. "mv a.txt docs/" move o arquivo para dentro de docs; "mv a.txt b.txt" renomeia. Diretórios se movem sem precisar de -r. Atenção: se o destino já existir, o mv o substitui em silêncio; -i pergunta antes e -n nunca sobrescreve.',
            '$ mv notas.txt docs/          # move para dentro de docs\n$ mv docs/notas.txt docs/ideias.txt   # renomeia\n$ mv -i a.txt b.txt           # pergunta se b.txt existir'
          ),
          sl(
            'Apagar: rm e rmdir — não há lixeira',
            'rm arquivo apaga o arquivo; rmdir apaga só diretórios vazios; rm -r apaga um diretório com tudo dentro; -i pergunta antes de cada remoção; -f força e silencia avisos. IMPORTANTE: no terminal NÃO existe lixeira. O que o rm apaga não volta (a recuperação, quando possível, é um trabalho especial). Por isso: confira o que vai apagar com ls usando o mesmo padrão; prefira rm -i enquanto aprende; e desconfie de rm -rf, o comando mais destrutivo do dia a dia.',
            '$ rm notas.txt\n$ rmdir vazio          # só funciona se estiver vazio\n$ rm -r projeto/      # apaga a pasta e tudo dentro\n$ rm -i *.log         # pergunta a cada arquivo'
          ),
          sl(
            'O perigo do rm -rf com variável vazia',
            'Scripts costumam montar caminhos com variáveis. Se a variável estiver vazia ou o caminho errado, o comando muda de significado: "rm -rf $DIR/" com DIR vazio vira rm -rf / (as versões atuais do GNU rm recusam apagar a raiz pura, mas "/*" se expande para tudo e o comando tenta apagar tudo o que as permissões deixarem). Defesas: aspas, conferir com ls/echo antes, set -u, e a expansão ${DIR:?}, que aborta com erro se a variável estiver vazia. E nunca rode rm -rf como root sem ter certeza do alvo.',
            'DIR=                       # variável vazia por engano\nrm -rf "$DIR"/*            # vira: rm -rf /*   (PERIGO!)\nrm -rf "${DIR:?}"/*        # aborta: DIR: parameter null or not set'
          ),
          sl(
            'Links: simbólico e físico',
            'Link simbólico (ln -s alvo nome) é um atalho: um arquivo pequeno que guarda o CAMINHO do alvo. Pode apontar para diretórios e para outros sistemas de arquivos; se o alvo for apagado ou movido, o link "quebra". No ls -l aparece com l e uma seta. Link físico (ln alvo nome) é um segundo NOME para os mesmos dados: os dois nomes são iguais em importância e os dados só somem quando todos os nomes forem removidos; não vale para diretórios nem entre sistemas de arquivos diferentes. Obs.: no Git Bash do Windows, ln -s pode copiar o arquivo em vez de criar um link — no Linux real, cria o link.',
            '$ ln -s /etc/hostname atalho\n$ ls -l atalho\nlrwxrwxrwx 1 aluno aluno 13 nov  2 10:18 atalho -> /etc/hostname\n$ ln dados.txt copia-dura.txt   # 2 nomes, mesmos dados\n$ ls -l dados.txt\n-rw-r--r-- 2 aluno aluno 6 nov  2 10:18 dados.txt   # "2" = número de nomes'
          ),
          sl(
            'Curingas (globbing) e quem os expande',
            'Curingas montam padrões de nomes: * casa qualquer sequência (inclusive vazia), ? casa exatamente um caractere, [abc] casa um caractere dentre os listados ([0-9] um dígito) e {a,b} (brace expansion) gera texto: cada opção vira uma palavra, sem consultar o disco. QUEM expande é o SHELL, antes de o comando rodar: o rm, por exemplo, só recebe a lista final de nomes. Por isso "echo *.txt" mostra a expansão e é um bom ensaio antes de apagar. As saídas abaixo foram obtidas no bash. Aspas desligam a expansão.',
            '$ ls proj/src/?.c\nproj/src/a.c\nproj/src/b.c\n$ echo proj/{src,docs}\nproj/src proj/docs\n$ touch f{1,2,3}.txt\n$ ls f*\nf1.txt\nf2.txt\nf3.txt\n$ echo "*.txt"      # aspas: literal\n*.txt'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz "mkdir -p projeto/src/utils" quando nenhuma das pastas existe?', 'a', [
          'Cria toda a cadeia de diretórios: projeto, src e utils, de uma vez',
          'Dá erro, pois projeto e src precisam existir antes do comando',
          'Cria apenas a pasta utils, direto na pasta atual',
          'Cria um arquivo comum chamado projeto/src/utils, sem criar pastas'
        ], 'A opção -p cria os diretórios intermediários e não reclama se alguns já existirem.'),
        mcq('q2', 'Ao rodar "cp projeto backup" sendo projeto um diretório, aparece "cp: -r not specified; omitting directory \'projeto\'". O que fazer?', 'b', [
          'Rodar o comando de novo com sudo, para ter mais permissão',
          'Usar cp -r, que copia recursivamente',
          'Renomear a pasta antes de copiar, pois o nome é inválido',
          'Usar rmdir projeto para liberar espaço no disco antes'
        ], 'cp só copia diretórios com -r (ou -a, que é recursivo e preserva atributos).'),
        mcq('q3', 'Como renomear notas.txt para ideias.txt?', 'd', [
          'rename notas.txt para ideias.txt',
          'cp notas.txt ideias.txt, que renomeia o original',
          'rm notas.txt ideias.txt',
          'mv notas.txt ideias.txt'
        ], 'Renomear é mover para um novo nome. O cp mantém o original e cria uma cópia.'),
        fill('q4', 'Complete a opção que faz o rm apagar um diretório e todo o seu conteúdo:', 'rm ___ pasta/', ['-r', '-R', '--recursive'], '-r (recursivo) desce nas subpastas. rmdir só remove diretórios vazios.'),
        mcq('q5', 'Você apagou um arquivo com rm. Dá para recuperá-lo na lixeira do terminal?', 'c', [
          'Sim, com o comando undelete',
          'Sim, está em ~/.Trash por padrão em qualquer distribuição',
          'Não, o terminal não tem lixeira; o rm remove de vez',
          'Sim, desde que o terminal ainda esteja aberto'
        ], 'O rm remove a entrada diretamente. Apagar no terminal é definitivo, então confira antes e use rm -i quando tiver dúvida.'),
        mcq('q6', 'Num script, DIR está vazia e roda-se: rm -rf "$DIR"/* . O que o comando vira?', 'b', [
          'rm -rf ./*, que só apaga o conteúdo da pasta atual, que está vazia',
          'rm -rf /*, que tenta apagar tudo o que as permissões deixam',
          'Nada: o shell ignora a linha inteira quando a variável está vazia',
          'rm -rf ~/*, que apaga só o conteúdo da pasta pessoal'
        ], 'Variável vazia some e sobra "/*". Defesas: aspas, set -u e ${DIR:?}, que aborta com erro se estiver vazia.'),
        mcq('q7', 'Você criou atalho (link simbólico) e copia-dura (link físico) para dados.txt. O que acontece depois de apagar dados.txt?', 'c', [
          'Os dois continuam funcionando normalmente, como se nada tivesse acontecido',
          'Os dois deixam de funcionar, pois dependem do arquivo original',
          'O simbólico quebra, pois aponta para um caminho que sumiu; o físico segue acessando os dados',
          'O físico quebra e o simbólico continua acessando os dados'
        ], 'O simbólico guarda o caminho do alvo e quebra se o alvo some. O físico é outro nome para os mesmos dados, que só são liberados quando todos os nomes forem removidos.'),
        fill('q8', 'Complete o curinga que casa exatamente UM caractere qualquer (o shell o expande, não o comando):', 'ls arquivo___.txt', ['?'], '? casa um caractere; * casa qualquer sequência; [abc] um dos listados. Quem expande é o shell, antes de o comando rodar.')
      ]
    },
    {
      id: 'lnb-08-visualizando-conteudo',
      title: 'Visualizando conteúdo',
      goal: 'Ler arquivos de texto com cat, less, head, tail, wc, nl, diff e cmp, e saber o que fazer se o terminal bagunçar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'cat: imprimir tudo',
            'cat arquivo imprime o conteúdo inteiro na tela; com vários arquivos, concatena (é daí que vem o nome). cat -n numera as linhas. É perfeito para arquivos curtos e para emendar pedaços, mas péssimo para arquivos grandes: tudo passa voando pela tela. Antes de imprimir um arquivo desconhecido, use "file nome" para ver se é texto.',
            '$ cat frutas.txt\nbanana\nmaca\nuva\nmaca\nbanana\nmaca\n$ cat -n frutas.txt     # com números de linha'
          ),
          sl(
            'less: ler com calma',
            'less abre o arquivo num paginador: você rola sem poluir o terminal. Teclas: espaço (ou Page Down) avança uma página, b volta uma página, setas rolam linha a linha, g vai ao início e G ao fim, /texto procura para frente (n próxima ocorrência) e q sai. O man usa o less por baixo, então as teclas são as mesmas. more é o antecessor mais simples: só avança.',
            '$ less /var/log/syslog    # o caminho do log varia conforme a distro\n# dentro do less:\n#   espaço = próxima página    b = página anterior\n#   /erro  = procurar "erro"   n = próxima ocorrência\n#   q      = sair'
          ),
          sl(
            'head e tail: começo e fim',
            'head mostra as primeiras linhas (10 por padrão) e tail as últimas (10 por padrão); -n escolhe a quantidade. tail -f ("follow") fica acompanhando o arquivo e imprime as linhas novas assim que aparecem — o jeito clássico de ver um log em tempo real; para sair, Ctrl+C. As saídas abaixo foram obtidas no bash com o arquivo frutas.txt acima.',
            '$ head -n 2 frutas.txt\nbanana\nmaca\n$ tail -n 2 frutas.txt\nbanana\nmaca\n$ tail -f /var/log/syslog   # acompanha; Ctrl+C para sair'
          ),
          sl(
            'wc e nl: contar e numerar',
            'wc (word count) conta: -l linhas, -w palavras, -c bytes (sem opção, mostra os três). Muito usado para contar linhas: "wc -l". nl numera as linhas de saída (por padrão, só as não vazias). As saídas abaixo vieram do arquivo frutas.txt (6 linhas, 6 palavras, 33 bytes) e de um arquivo x com duas linhas.',
            '$ wc -l frutas.txt\n6 frutas.txt\n$ wc -w frutas.txt\n6 frutas.txt\n$ wc -c frutas.txt\n33 frutas.txt\n$ nl x\n     1\tum\n     2\tdois'
          ),
          sl(
            'diff, cmp e sort rápido',
            'diff compara dois arquivos de texto e lista as diferenças: linhas com < são do primeiro arquivo e com > do segundo; "2c2" quer dizer "a linha 2 foi mudada (changed) para a linha 2". diff -u gera o formato unificado, o usado em revisões de código. cmp compara byte a byte (serve para binários) e só avisa a primeira diferença; se forem iguais, não imprime nada. Os dois saem com código 0 se iguais e 1 se diferentes. sort ordena as linhas (detalhado numa lição à frente). No exemplo, x tem "um/dois" e y tem "um/tres".',
            '$ diff x y\n2c2\n< dois\n---\n> tres\n$ cmp x y\nx y differ: byte 4, line 2   # texto exato varia conforme a versão\n$ sort frutas.txt | head -n 2\nbanana\nbanana'
          ),
          sl(
            'Binários no terminal e o comando reset',
            'Se você der cat num arquivo binário (programa, imagem, arquivo compactado), o terminal imprime bytes que viram caracteres estranhos — e alguns são códigos de controle que mudam o modo do terminal, deixando-o ilegível. A saída: digite reset e Enter (mesmo sem enxergar o que digita) para reinicializar o terminal. Para prevenir: use file antes, e para espiar binários use less (que avisa), hexdump -C ou xxd, que mostram os bytes em hexadecimal.',
            '$ file programa.bin\nprograma.bin: ELF ... executable   # o texto exato varia\n$ reset                      # conserta o terminal bagunçado\n$ hexdump -C programa.bin | head   # espia de forma segura'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você precisa ler um arquivo de log de milhares de linhas, rolando e procurando termos. Qual comando é mais adequado?', 'd', [
          'cat, que imprime o arquivo inteiro de uma só vez na tela',
          'nl, que numera as linhas e as exibe devagar',
          'wc -l, que mostra o conteúdo paginado',
          'less, que pagina e permite buscar com /'
        ], 'less abre num paginador interativo. cat despeja tudo e wc só conta.'),
        mcq('q2', 'Dentro do less, qual tecla sai do programa?', 'c', [
          'x',
          'Ctrl+D',
          'q',
          'Esc seguido de :wq'
        ], 'q sai do less (e do man). :wq é do vim.'),
        mcq('q3', 'O que faz "tail -n 5 app.log"?', 'b', [
          'Mostra as 5 primeiras linhas do arquivo',
          'Mostra as 5 últimas linhas do arquivo',
          'Apaga as 5 primeiras linhas do arquivo',
          'Procura a palavra "5" dentro do arquivo'
        ], 'tail mostra o fim do arquivo; head, o começo. -n escolhe quantas linhas.'),
        fill('q4', 'Complete a opção que faz o tail acompanhar o arquivo em tempo real:', 'tail ___ app.log', ['-f', '--follow', '-F'], 'tail -f ("follow") imprime as linhas que são acrescentadas ao arquivo; Ctrl+C encerra.'),
        mcq('q5', 'O que "wc -l frutas.txt" imprime?', 'a', [
          'O número de linhas, seguido do nome do arquivo',
          'O número de palavras que o arquivo contém, seguido do nome',
          'O tamanho do arquivo em bytes, seguido do nome do arquivo',
          'As linhas do arquivo que contêm a letra l'
        ], 'wc -l conta linhas, -w palavras e -c bytes.'),
        mcq('q6', 'A saída de "diff x y" foi:\n2c2\n< dois\n---\n> tres\nO que isso significa?', 'c', [
          'A linha "tres" existe só no arquivo x, e o y não tem essa linha',
          'Os arquivos são idênticos, e o diff só mostra a linha 2 por cortesia',
          'A linha 2 mudou: "dois" em x, "tres" em y',
          'O arquivo y tem duas linhas a mais que o arquivo x'
        ], '< marca o que veio do primeiro arquivo e > o do segundo. 2c2 significa "linha 2 trocada pela linha 2".'),
        mcq('q7', 'Depois de um cat num arquivo binário o terminal exibe símbolos estranhos mesmo nos comandos seguintes. O que fazer?', 'b', [
          'Fechar o computador, pois o terminal foi danificado de forma permanente',
          'Digitar reset e Enter para reinicializar o terminal',
          'Apagar o arquivo com rm -rf',
          'Rodar cat novamente no mesmo arquivo'
        ], 'Bytes de controle podem alterar o modo do terminal; reset o restaura. Dá para prevenir com file antes do cat.'),
        fill('q8', 'Complete o comando que compara dois arquivos byte a byte:', '___ a.bin b.bin', ['cmp'], 'cmp compara byte a byte e avisa a primeira diferença; se forem iguais, fica em silêncio. diff compara linhas de texto.')
      ]
    },
    {
      id: 'lnb-09-editores-terminal',
      title: 'Editores de texto no terminal',
      goal: 'Editar arquivos no terminal com nano e vim (inclusive saber sair!) e editar configurações com cuidado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que dominar um editor no terminal',
            'Em servidores remotos, acessados por SSH, normalmente só existe o terminal: sem janelas, sem mouse, sem editor gráfico. E quase toda configuração do Linux é um arquivo de texto. Por isso, saber abrir, editar, salvar e sair de um editor de terminal é obrigatório. Dois são essenciais: o nano, simples e que mostra os atalhos na tela; e o vi/vim, poderoso e presente em praticamente qualquer sistema — por isso vale conhecer o mínimo dele para não ficar preso.'
          ),
          sl(
            'nano: simples e amigável',
            'Abra com "nano arquivo". Você já pode digitar e usar as setas como num bloco de notas. Os atalhos aparecem na parte de baixo da tela; o símbolo ^ significa Ctrl. Os principais: Ctrl+O grava (Write Out: confirma o nome do arquivo com Enter), Ctrl+X sai (se houver alterações não salvas, ele pergunta se quer gravar), Ctrl+W busca texto, Ctrl+K recorta a linha e Ctrl+U cola.',
            '$ nano notas.txt\n# dentro do nano:\n#   Ctrl+O  salvar (confirme com Enter)\n#   Ctrl+X  sair\n#   Ctrl+W  buscar\n#   Ctrl+K  recortar linha     Ctrl+U  colar'
          ),
          sl(
            'vim: os três modos',
            'O vim funciona por modos, e isso confunde quem chega. Modo normal: é o que abre por padrão; as teclas são COMANDOS (digitar "dd" não escreve dd, apaga uma linha). Modo de inserção: aí sim as teclas escrevem texto; entra-se nele com i (insert), e a tecla Esc volta ao modo normal. Modo de comando (ou "última linha"): começa com dois-pontos (:) e serve para salvar, sair, buscar e substituir. Se algo estranho acontecer, aperte Esc algumas vezes: você volta ao modo normal.',
            '$ vim notas.txt     # abre no modo NORMAL\n  i                  # entra em INSERÇÃO: agora pode digitar\n  Esc                # volta ao modo normal\n  :                  # modo de comando (salvar, sair...)'
          ),
          sl(
            'Como sair do vim',
            'Primeiro, Esc (para estar no modo normal). Depois, digite o comando e Enter: ":w" salva (write), ":q" sai (quit) — só funciona se não houver alterações pendentes —, ":wq" salva e sai (ZZ, em maiúsculas, também), e ":q!" sai DESCARTANDO as alterações. Se você receber o aviso "No write since last change", escolha entre :wq (guardar) ou :q! (jogar fora). Guardar essas quatro receitas já basta para não ficar preso.',
            'Esc   :w     salvar\nEsc   :q     sair (sem mudanças pendentes)\nEsc   :wq    salvar e sair\nEsc   :q!    sair e descartar alterações'
          ),
          sl(
            'Comandos do vim para o dia a dia',
            'No modo normal: dd apaga (recorta) a linha atual; yy copia a linha; p cola logo abaixo; u desfaz (e Ctrl+R refaz); x apaga o caractere sob o cursor; o abre uma linha nova abaixo e já entra em inserção; /texto procura para frente (n vai à próxima ocorrência); G vai ao fim do arquivo. Combine com números: "3dd" apaga 3 linhas. Não é preciso decorar tudo: com i, Esc, :wq, :q!, dd, yy, p, u e /, você já edita qualquer arquivo.'
          ),
          sl(
            'EDITOR, VISUAL e sudoedit',
            'Vários programas (git commit, crontab -e, visudo...) abrem um editor para você. Qual? O definido nas variáveis de ambiente EDITOR e VISUAL: por exemplo, export EDITOR=nano troca o padrão para o nano. Para editar arquivos do sistema, que pertencem ao root, prefira "sudoedit arquivo" (equivale a sudo -e): ele copia o arquivo para um local temporário, abre no SEU editor, e só grava de volta com privilégios depois de você salvar — assim o editor em si não roda como root. Editores gráficos existem (gedit, Kate, VS Code com "code ."), mas nem sempre estão disponíveis em servidores.',
            '$ export EDITOR=nano       # editor padrão desta sessão\n$ sudoedit /etc/hosts      # edita arquivo de sistema com mais cuidado'
          ),
          sl(
            'Cuidado ao editar configurações',
            'Um arquivo de configuração errado pode impedir um serviço de subir — ou trancar você fora do servidor. Hábitos que protegem: faça uma cópia antes de editar (cp arquivo arquivo.bak); mude pouco de cada vez; valide a sintaxe quando a ferramenta oferece (visudo valida o sudoers; "sshd -t" testa a configuração do servidor SSH antes de reiniciá-lo); e, ao mexer em SSH, mantenha uma sessão já aberta até confirmar que a nova configuração funciona. Se der errado, restaure o .bak.',
            '$ sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak   # backup\n$ sudoedit /etc/ssh/sshd_config                           # edita\n$ sudo sshd -t                                            # testa a sintaxe'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que é importante saber usar um editor de texto no terminal?', 'b', [
          'Porque editores gráficos não existem para Linux, só para outros sistemas',
          'Porque servidores remotos costumam ter só o terminal e a configuração é texto',
          'Porque o terminal só aceita arquivos criados com o editor nano',
          'Porque editores de terminal protegem os arquivos contra qualquer erro de digitação'
        ], 'Em servidores remotos não há interface gráfica, e a configuração do Linux é majoritariamente texto. Editores de terminal são a ferramenta disponível.'),
        mcq('q2', 'No nano, qual atalho grava (salva) o arquivo?', 'd', [
          'Ctrl+X',
          'Ctrl+W',
          'Ctrl+S',
          'Ctrl+O'
        ], 'Ctrl+O (Write Out) grava, e Enter confirma o nome. Ctrl+X sai e Ctrl+W busca.'),
        mcq('q3', 'Você abriu um arquivo no vim e digitou "i". O que aconteceu?', 'c', [
          'Inseriu a letra i no texto e continuou no modo normal, sem mudar nada',
          'O vim salvou o arquivo e voltou ao shell',
          'Entrou no modo de inserção; o que digitar vira texto, e Esc volta',
          'O vim fechou, pois i significa interromper o programa imediatamente'
        ], 'Em modo normal as teclas são comandos; i entra em inserção (insert) e Esc volta ao normal.'),
        fill('q4', 'Complete o comando do vim que sai DESCARTANDO as alterações (digitado depois de Esc):', ':___', ['q!', 'quit!'], ':q! sai sem salvar. :wq salva e sai; :q sozinho recusa sair se houver alterações pendentes.'),
        mcq('q5', 'No modo normal do vim, o que fazem as sequências dd, yy e p?', 'a', [
          'dd apaga (recorta) a linha atual, yy copia a linha e p cola',
          'dd duplica a linha, yy desfaz a última ação e p procura texto',
          'dd salva o arquivo, yy sai e p imprime',
          'dd vai ao fim, yy vai ao início e p cola uma palavra'
        ], 'dd recorta a linha, yy a copia (yank) e p a cola abaixo. u desfaz.'),
        mcq('q6', 'Para que serve a variável de ambiente EDITOR?', 'b', [
          'Para listar todos os editores de texto instalados no sistema',
          'Para dizer qual editor programas como git ou crontab -e devem abrir',
          'Para impedir que o arquivo seja editado por outros usuários do sistema',
          'Para ativar automaticamente o modo de inserção do vim'
        ], 'EDITOR (e VISUAL) definem o editor padrão chamado por outros programas. Exemplo: export EDITOR=nano.'),
        mcq('q7', 'Antes de editar /etc/ssh/sshd_config, qual hábito é mais recomendado?', 'd', [
          'Rodar o editor como root sem conferir nada, para evitar erros de permissão',
          'Apagar o arquivo antigo e criar um novo do zero, com o que se lembrar',
          'Editar direto, pois o sistema guarda histórico de tudo automaticamente',
          'Fazer backup (arquivo.bak) e testar a sintaxe antes de reiniciar o serviço afetado'
        ], 'Backup permite voltar atrás, e testar (sshd -t) evita derrubar o serviço. Não há desfazer automático em arquivos de sistema.'),
        fill('q8', 'Complete o comando que edita um arquivo de sistema usando o seu editor, de forma mais segura que "sudo nano":', '___ /etc/hosts', ['sudoedit', 'sudo -e'], 'sudoedit (ou sudo -e) edita uma cópia temporária com o seu editor e só então grava de volta com privilégios.')
      ]
    },
    {
      id: 'lnb-10-redirecionamento-pipes',
      title: 'Redirecionamento e pipes',
      goal: 'Controlar de onde a entrada vem e para onde a saída vai, e encadear programas com pipes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Três fluxos padrão',
            'Todo programa de linha de comando nasce com três canais abertos: a entrada padrão (stdin, descritor 0), normalmente o teclado; a saída padrão (stdout, descritor 1), normalmente a tela; e a saída de erro padrão (stderr, descritor 2), também a tela, mas separada para que erros não se misturem com resultados. O programa não sabe (nem precisa saber) se o canal é teclado, tela, arquivo ou outro programa: é o shell que liga as pontas. Redirecionar é mudar essas ligações.',
            'teclado --(0 stdin)--> [ programa ] --(1 stdout)--> tela\n                                  \\--(2 stderr)--> tela'
          ),
          sl(
            'Redirecionar a saída: > e >>',
            '> manda a saída padrão para um arquivo: se o arquivo não existe, é criado; se já existe, é SOBRESCRITO (o conteúdo antigo é apagado). >> acrescenta ao final, sem apagar. Cuidado: o shell esvazia o arquivo ANTES de rodar o comando, então "comando > arquivo-importante" destrói o conteúdo mesmo que o comando falhe. Confira o nome do arquivo antes de usar >.',
            '$ echo 1 > o\n$ echo 2 >> o\n$ cat o\n1\n2\n$ echo 9 > o      # sobrescreve: o antigo conteúdo some\n$ cat o\n9'
          ),
          sl(
            'Entrada e erro: <, 2>, 2>&1, &>',
            '< faz um arquivo virar a entrada padrão: "wc -l < o". 2> manda só os erros para um arquivo; 2>&1 manda o erro para onde a saída padrão está indo (a ordem importa: "cmd > arq 2>&1" junta os dois no arquivo); &> é um atalho do bash para o mesmo. /dev/null é o "buraco negro": tudo o que se escreve nele é descartado — útil para silenciar. A mensagem de erro do ls varia com o idioma do sistema.',
            '$ ls /naoexiste 2> erros.txt\n$ cat erros.txt\nls: cannot access \'/naoexiste\': No such file or directory\n$ wc -l < o\n2\n$ ls /naoexiste > /dev/null 2>&1   # silencia tudo\n$ echo $?\n2      # código de erro do ls: a falha continua registrada'
          ),
          sl(
            'Pipe: ligando programas',
            'O pipe (|) liga a saída padrão de um comando à entrada padrão do próximo. É a base da filosofia Unix: em vez de um programa gigante, vários programas pequenos, cada um bom numa coisa, combinados em linha. O pipe passa só o stdout: as mensagens de erro continuam indo para a tela, a não ser que você as junte com 2>&1 (ou |&, no bash). A linha abaixo foi executada no bash.',
            '$ printf \'erro 1\\nok\\nerro 2\\n\' | grep erro\nerro 1\nerro 2\n$ ls /etc | wc -l          # quantos itens há em /etc\n$ cat nomes.txt | sort | uniq   # três programas em fila'
          ),
          sl(
            'tee: gravar e continuar passando',
            'tee funciona como uma conexão em T: copia a entrada para a tela (ou para o próximo comando) E para um arquivo. tee -a acrescenta em vez de sobrescrever. Há um uso clássico com sudo: "sudo echo texto > /etc/arquivo" FALHA, porque o redirecionamento é feito pelo seu shell, com o seu usuário, e não pelo sudo. A solução é deixar o tee, rodando com sudo, escrever o arquivo.',
            '$ printf \'erro 1\\nok\\nerro 2\\n\' | grep erro | tee saida.txt\nerro 1\nerro 2\n$ echo "linha" | sudo tee -a /etc/exemplo.conf   # tee grava como root'
          ),
          sl(
            'xargs, echo e printf',
            'xargs lê a entrada padrão e a transforma em ARGUMENTOS de outro comando: útil quando o comando não lê da entrada, como o rm. "echo a b c | xargs -n1 echo" roda o echo uma vez por palavra. Nomes com espaço quebram o xargs puro; use find -print0 com xargs -0 (visão geral). echo imprime texto simples; printf imprime com formato controlado e é mais previsível: %s para texto, %d para inteiro e \\n para nova linha.',
            '$ echo a b c | xargs -n1 echo\na\nb\nc\n$ printf \'%s tem %d anos\\n\' ana 30\nana tem 30 anos'
          ),
          sl(
            'Proteção contra sobrescrita: noclobber',
            'Se você já perdeu um arquivo com um ">" sem querer, ative a proteção do bash: set -o noclobber. Com ela, ">" se recusa a sobrescrever um arquivo existente; para forçar de propósito, use >|. Desative com set +o noclobber. Vale incluir no ~/.bashrc se quiser que seja permanente. A mensagem abaixo foi obtida no bash.',
            '$ set -o noclobber\n$ echo z > o\nbash: o: cannot overwrite existing file\n$ echo z >| o      # força de propósito'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual descritor de arquivo corresponde à saída de erro padrão (stderr)?', 'c', [
          '0',
          '1',
          '2',
          '3'
        ], '0 é a entrada (stdin), 1 a saída (stdout) e 2 o erro (stderr).'),
        mcq('q2', 'Você rodou "echo teste > config.txt", e config.txt já tinha conteúdo importante. O que aconteceu?', 'a', [
          'O conteúdo antigo foi substituído por "teste" (> sobrescreve)',
          'A linha "teste" foi acrescentada ao final do arquivo, sem apagar nada',
          'O shell recusou o comando, porque o arquivo já existia com conteúdo',
          'O arquivo antigo foi movido para a lixeira automaticamente pelo shell'
        ], '> sobrescreve; >> acrescenta. Com set -o noclobber, o bash recusaria a sobrescrita.'),
        mcq('q3', 'Ao rodar "ls /naoexiste > saida.txt", a mensagem de erro aparece na tela e saida.txt fica vazio. Por quê?', 'b', [
          'Porque o arquivo saida.txt não tinha permissão de escrita no diretório',
          'Porque > pega só o stdout; a mensagem de erro sai pelo stderr, que é outro fluxo',
          'Porque o ls ignora redirecionamentos quando o alvo é inexistente',
          'Porque o shell só redireciona quando o comando termina com sucesso'
        ], 'Erros vão pelo stderr (2). Para redirecioná-los use 2> (ou &> / 2>&1 para juntar com a saída).'),
        fill('q4', 'Complete para descartar apenas a saída de erro:', 'ls /naoexiste ___ /dev/null', ['2>'], '2> redireciona o descritor 2 (erro). /dev/null descarta tudo o que recebe.'),
        mcq('q5', 'O que faz o comando "cat nomes.txt | wc -l"?', 'd', [
          'Apaga as linhas repetidas de nomes.txt, usando o wc como filtro',
          'Imprime nomes.txt na tela e depois o grava em um arquivo chamado wc',
          'Cria um arquivo chamado wc com as linhas de nomes.txt dentro',
          'Liga a saída do cat à entrada do wc, que conta as linhas'
        ], 'O pipe liga o stdout do primeiro comando ao stdin do segundo. Resultado: o número de linhas de nomes.txt.'),
        mcq('q6', 'O que faz "comando | tee log.txt"?', 'a', [
          'Mostra a saída na tela e também a grava em log.txt',
          'Grava a saída só em log.txt, sem mostrar nada na tela',
          'Mostra só os erros do comando na tela',
          'Apaga log.txt depois de executar o comando'
        ], 'tee divide o fluxo: copia para o arquivo e continua passando adiante. Com -a, acrescenta ao arquivo.'),
        mcq('q7', 'Por que "sudo echo texto > /etc/exemplo.conf" falha com permissão negada, apesar do sudo?', 'c', [
          'Porque o sudo não funciona com o comando echo, que é interno ao shell',
          'Porque arquivos em /etc não aceitam texto simples, só binário',
          'Porque o shell do seu usuário faz o redirecionamento; use "| sudo tee"',
          'Porque falta usar >> no lugar de >, que não tem permissão'
        ], 'O sudo eleva só o echo. O arquivo é aberto pelo shell, antes. Use "echo texto | sudo tee arquivo".'),
        fill('q8', 'Complete o comando que transforma a entrada em argumentos para outro comando:', 'echo a b c | ___ -n1 echo', ['xargs'], 'xargs lê o stdin e monta os argumentos do comando seguinte; -n1 usa um argumento por execução.')
      ]
    },
    {
      id: 'lnb-11-filtros-texto-grep',
      title: 'Filtros de texto e grep',
      goal: 'Procurar e transformar texto com grep, sort, uniq, cut, tr e wc, e montar pipelines.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'grep: procurar padrões',
            'grep imprime as linhas que casam com um padrão. Opções principais: -i ignora maiúsculas, -n mostra o número da linha, -v inverte (linhas que NÃO casam), -c conta as linhas que casam, -w exige a palavra inteira, -o mostra só o trecho que casou e -r procura recursivamente numa pasta. Os exemplos abaixo usam o arquivo log.txt com quatro linhas fictícias (INFO inicio, ERRO disco cheio, INFO ok e erro rede) e foram executados no bash.',
            '$ grep ERRO log.txt\nERRO disco cheio\n$ grep -i erro log.txt\nERRO disco cheio\nerro rede\n$ grep -n INFO log.txt\n1:INFO inicio\n3:INFO ok\n$ grep -c INFO log.txt\n2\n$ grep -v INFO log.txt\nERRO disco cheio\nerro rede\n$ grep -rn TODO src/       # procura em toda a pasta src'
          ),
          sl(
            'Regex básica',
            'O padrão do grep é uma expressão regular. Os símbolos básicos: . casa um caractere qualquer; * casa zero ou mais repetições do item anterior (não é o * do curinga de arquivos!); ^ ancora no início da linha; $ no fim; [abc] casa um dos caracteres listados; [0-9] casa um dígito; [^abc] casa qualquer um que NÃO esteja na lista. Coloque o padrão entre aspas simples para o shell não interpretá-lo.',
            '$ grep \'^INFO\' log.txt     # linhas que COMEÇAM com INFO\nINFO inicio\nINFO ok\n$ grep \'o$\' log.txt        # linhas que TERMINAM com o\nINFO inicio\nERRO disco cheio\n$ grep -o \'[0-9]*\' p.csv     # só os números'
          ),
          sl(
            'Regex estendida com -E',
            'Com -E (extended), ganham-se operadores mais legíveis: + (uma ou mais repetições), ? (zero ou uma), | (ou), ( ) (agrupa) e {n} (n repetições). "grep -E \'ok|inicio\'" casa linhas com ok OU inicio; "grep -E \'e+r\'" casa e (uma ou mais vezes) seguido de r. Sem -E, no grep básico, esses símbolos são tratados de outra forma, então em dúvida use -E.',
            '$ grep -E \'ok|inicio\' log.txt\nINFO inicio\nINFO ok\n$ grep -E \'e+r\' log.txt\nerro rede'
          ),
          sl(
            'sort, uniq e cut',
            'sort ordena as linhas (alfabético, que depende do idioma do sistema): -n ordena numericamente (sem ele, 100 vem antes de 9), -r inverte, -u remove repetidas, -k escolhe o campo e -t o separador. uniq remove ou conta linhas repetidas, mas SÓ as que estão lado a lado: por isso quase sempre vem depois de sort; -c mostra quantas vezes cada linha apareceu. cut extrai pedaços: -d define o delimitador, -f o campo, -c os caracteres. Dados fictícios abaixo: p.csv tem ana:30:SP, bia:25:RJ, carlos:41:SP.',
            '$ printf \'10\\n9\\n100\\n\' | sort\n10\n100\n9\n$ printf \'10\\n9\\n100\\n\' | sort -n\n9\n10\n100\n$ cut -d: -f1,3 p.csv\nana:SP\nbia:RJ\ncarlos:SP\n$ sort -t: -k2 -n p.csv\nbia:25:RJ\nana:30:SP\ncarlos:41:SP'
          ),
          sl(
            'uniq -c sem sort: a pegadinha',
            'uniq só junta linhas IGUAIS CONSECUTIVAS. Com o arquivo frutas.txt (banana, maca, uva, maca, banana, maca), um uniq -c direto não agrupa nada, porque nenhuma linha igual é vizinha da outra. Com sort antes, as iguais ficam juntas e a contagem fica correta. Outros filtros úteis: tr troca ou apaga caracteres (tr a-z A-Z deixa em maiúsculas), paste junta arquivos lado a lado e wc conta linhas, palavras e bytes.',
            '$ uniq -c frutas.txt\n      1 banana\n      1 maca\n      1 uva\n      1 maca\n      1 banana\n      1 maca\n$ sort frutas.txt | uniq -c\n      2 banana\n      3 maca\n      1 uva\n$ echo "Ola Mundo" | tr a-z A-Z\nOLA MUNDO'
          ),
          sl(
            'Receitas com pipelines',
            'Top-N de linhas repetidas: sort | uniq -c | sort -rn | head -n N (ordena, conta, ordena pela contagem decrescente e pega as primeiras). Contar palavras de um texto: converta tudo para minúsculas com tr, troque tudo que não for letra por quebra de linha (tr -cs: o -c complementa o conjunto e o -s comprime repetições) e aplique a receita anterior. A saída abaixo vem de um texto fictício de três linhas (o gato viu o rato...).',
            '$ sort frutas.txt | uniq -c | sort -rn | head -n 2\n      3 maca\n      2 banana\n$ tr A-Z a-z < texto.txt | tr -cs a-z \'\\n\' | sort | uniq -c | sort -rn | head -n 3\n      5 o\n      3 viu\n      3 gato\n# empates na contagem podem aparecer em outra ordem'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz "grep -v INFO log.txt"?', 'd', [
          'Mostra as linhas que contêm INFO e as numera',
          'Mostra só quantas vezes INFO aparece',
          'Procura INFO em todos os arquivos da pasta',
          'Mostra as linhas que NÃO contêm INFO'
        ], '-v inverte a seleção. -n numera, -c conta e -r é recursivo.'),
        mcq('q2', 'Qual comando mostra só as linhas que COMEÇAM com "erro"?', 'b', [
          'grep \'erro$\' arquivo',
          'grep \'^erro\' arquivo',
          'grep -v erro arquivo',
          'grep -c erro arquivo'
        ], '^ ancora no início da linha e $ no fim. -v inverte e -c só conta.'),
        mcq('q3', 'O que faz "grep -rn TODO src/"?', 'a', [
          'Procura TODO em src/ e subpastas, mostrando arquivo e linha',
          'Remove todas as linhas que contêm TODO nos arquivos da pasta src/',
          'Conta quantas pastas existem dentro de src/, uma por linha',
          'Procura só no primeiro nível de src/, ignorando as subpastas'
        ], '-r desce nas subpastas e -n mostra a linha. A saída vem como arquivo:linha:texto.'),
        fill('q4', 'Complete a opção que ativa a regex estendida (para usar | como "ou"):', 'grep ___ \'ok|inicio\' log.txt', ['-E', '--extended-regexp'], '-E habilita +, ?, |, ( ) e {n}. egrep era o atalho antigo.'),
        mcq('q5', 'Ao rodar "uniq -c" num arquivo não ordenado com banana, maca, banana, o resultado mostra três linhas, cada uma com contagem 1. Por quê?', 'c', [
          'Porque o uniq só funciona quando as linhas são números',
          'Porque o -c conta os caracteres de cada linha, não as linhas',
          'Porque só junta linhas iguais vizinhas; falta um sort antes',
          'Porque o arquivo está com permissão de leitura negada no momento'
        ], 'uniq compara só vizinhas. sort deixa as repetidas lado a lado, daí a combinação sort | uniq -c.'),
        mcq('q6', 'Qual é a saída de: echo \'ana:30:SP\' | cut -d: -f3 ?', 'd', [
          'ana',
          '30',
          'ana:30:SP',
          'SP'
        ], '-d: define o separador dois-pontos e -f3 escolhe o terceiro campo.'),
        mcq('q7', 'O que faz o pipeline "sort frutas.txt | uniq -c | sort -rn | head -n 3"?', 'a', [
          'Mostra o top 3 das linhas mais repetidas, com a contagem',
          'Ordena o arquivo e apaga as 3 primeiras linhas',
          'Conta o total de linhas e mostra só os 3 primeiros caracteres',
          'Mostra as 3 linhas que aparecem uma única vez'
        ], 'Ordena, conta repetições, ordena pela contagem (maior primeiro) e pega as 3 primeiras: o top 3.'),
        fill('q8', 'Complete a opção que faz o sort ordenar numericamente (9 antes de 10):', 'sort ___ numeros.txt', ['-n', '--numeric-sort'], 'Sem -n a ordenação é textual e 100 vem antes de 9. -r inverte e -u remove repetidas.')
      ]
    },
    {
      id: 'lnb-12-usuarios-grupos-sudo',
      title: 'Usuários, grupos e sudo',
      goal: 'Entender root, usuários e grupos, ler /etc/passwd e usar su e sudo com responsabilidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'root e o princípio do menor privilégio',
            'O Linux é multiusuário. Cada usuário tem um número de identificação, o UID. O root, de UID 0, é o administrador: pode ler, alterar e apagar qualquer coisa. Os demais usuários têm UIDs maiores (em muitas distros, os humanos começam em 1000, e serviços do sistema têm usuários próprios com UIDs baixos). O princípio do menor privilégio diz: use só o poder de que precisa. Por isso, não se trabalha logado como root no dia a dia: um engano (rm -rf no lugar errado) ou um programa malicioso ganha poder total. O padrão é usar conta comum e elevar só o necessário com sudo.'
          ),
          sl(
            'whoami, id e groups',
            'whoami diz quem você é. id mostra o UID, o GID (grupo principal) e todos os grupos. groups lista só os grupos. Os grupos servem para dar acesso compartilhado: por exemplo, o grupo "sudo" (ou "wheel", nas distros Red Hat) autoriza usar sudo; o grupo "docker" dá acesso ao Docker. Os números e nomes abaixo são um exemplo fictício e variam.',
            '$ whoami\naluno\n$ id\nuid=1000(aluno) gid=1000(aluno) groups=1000(aluno),27(sudo)\n$ groups\naluno sudo'
          ),
          sl(
            '/etc/passwd e /etc/group',
            '/etc/passwd lista as contas, uma por linha, em 7 campos separados por dois-pontos: nome:x:UID:GID:comentário:pasta-pessoal:shell. O "x" no segundo campo significa que a senha NÃO está ali: ela fica, como hash (nunca em texto claro), em /etc/shadow, que só o root consegue ler — porque /etc/passwd precisa ser legível por todos. /etc/group lista os grupos no formato nome:x:GID:membros. Os dados abaixo são fictícios.',
            'aluno:x:1000:1000:Aluno Exemplo:/home/aluno:/bin/bash\n# nome : x : UID : GID : comentário : home : shell\n\ndocker:x:998:aluno,maria\n# grupo : x : GID : membros'
          ),
          sl(
            'Criar e alterar usuários',
            'Em Debian/Ubuntu, "sudo adduser maria" é o comando amigável: cria a conta, a pasta pessoal e pergunta a senha. useradd é a ferramenta de baixo nível (precisa de -m para criar a pasta pessoal e não pede senha). passwd define ou troca senhas. usermod altera uma conta existente. Para adicionar a maria a um grupo, use "usermod -aG grupo maria": o -a (append) é crucial — sem ele, -G SUBSTITUI a lista de grupos suplementares e a pessoa pode perder acessos, até o sudo. A mudança só vale no próximo login.',
            '$ sudo adduser maria                 # Debian/Ubuntu, interativo\n$ sudo passwd maria                  # define/troca a senha\n$ sudo usermod -aG docker maria      # ADICIONA ao grupo docker\n$ sudo usermod -G docker maria       # PERIGO: substitui os outros grupos'
          ),
          sl(
            'su versus sudo',
            'su (switch user) troca de usuário numa nova sessão: "su - maria" exige a senha de MARIA; "su -" sem nome vai para o root e exige a senha do ROOT. sudo executa UM comando como root (ou como outro usuário) e pede a SUA senha, mas só se você estiver autorizado (grupo sudo ou wheel, ou regra no sudoers). Vantagens do sudo: não é preciso compartilhar a senha do root, as ações ficam registradas em log e o poder é usado por comando, não numa sessão inteira.',
            '$ su - maria                  # pede a senha da maria\n$ sudo apt update             # pede a SUA senha (se autorizado)\n$ sudo -i                     # shell root: use com muita cautela'
          ),
          sl(
            'sudoers, sudo !! e cuidados',
            'Quem pode usar sudo é definido no arquivo /etc/sudoers. Nunca o edite com um editor comum: use "sudo visudo", que valida a sintaxe antes de gravar (um erro no arquivo pode trancar todos fora do sudo). Um atalho útil do bash: "sudo !!" repete o último comando com sudo — confira o comando antes de confirmar. O maior perigo do sudo é usá-lo em comandos que você não entende: copiar e colar de um site "sudo rm -rf ..." ou "curl ... | sudo bash" dá poder total a qualquer coisa que esteja ali. Antes de sudo, pergunte: eu sei o que isto faz?',
            '$ apt update\nE: Could not open lock file ... Permission denied   # falta de privilégio (texto varia)\n$ sudo !!                       # repete como: sudo apt update\n$ sudo visudo                   # edita o sudoers com validação'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que não se deve usar a conta root para tarefas do dia a dia?', 'a', [
          'Um erro ou malware teria poder total; menor privilégio limita o estrago',
          'O root não tem pasta pessoal nem acesso à internet na maioria das distros',
          'Comandos como ls e cd não funcionam quando executados como root',
          'O root é mais lento que os demais usuários na hora de abrir arquivos'
        ], 'O princípio do menor privilégio: use conta comum e eleve só o necessário (sudo). Como root, qualquer engano é total.'),
        mcq('q2', 'Na linha "maria:x:1001:1001::/home/maria:/bin/bash" de /etc/passwd, o que o "x" indica?', 'd', [
          'Que a conta está desativada e não consegue iniciar sessão',
          'Que a usuária não tem pasta pessoal criada em /home',
          'Que o shell dela é um programa executável no sistema',
          'Que a senha nunca fica neste arquivo: está (como hash) em /etc/shadow'
        ], '/etc/passwd é legível por todos, então o hash da senha fica em /etc/shadow, legível apenas pelo root.'),
        mcq('q3', 'O que acontece ao rodar "sudo usermod -G docker maria" (sem -a), se maria estava em outros grupos suplementares?', 'c', [
          'Ela entra no grupo docker e mantém todos os outros grupos que já tinha',
          'O comando falha, pois a opção -G exige obrigatoriamente a opção -a junto',
          'Os grupos dela são substituídos só por docker, perdendo o sudo',
          'A conta da maria é apagada, junto com a pasta pessoal'
        ], 'Sem -a, -G substitui a lista de grupos. Para adicionar sem perder os outros, use usermod -aG.'),
        fill('q4', 'Complete o comando que adiciona maria ao grupo docker (com -aG):', 'sudo ___ -aG docker maria', ['usermod'], 'usermod -aG grupo usuario acrescenta o usuário a um grupo sem tirar dos outros. Vale a partir do próximo login.'),
        mcq('q5', 'Qual é a diferença de senha entre "su -" e "sudo comando"?', 'b', [
          'Os dois pedem a senha do root, só muda a forma de digitar',
          'su - pede a senha do destino (root); sudo pede a SUA senha',
          'su - não pede senha e o sudo pede a senha do root',
          'Os dois pedem a sua senha, sem nenhuma diferença entre eles'
        ], 'su troca para outro usuário e exige a senha dele. sudo usa a sua senha e a autorização do sudoers.'),
        mcq('q6', 'O que faz "sudo !!" no bash?', 'c', [
          'Repete o primeiro comando do histórico, agora com sudo na frente',
          'Executa o último comando sem pedir senha ao usuário nenhuma vez',
          'Repete o último comando com sudo; confira antes de confirmar',
          'Desativa o sudo até o próximo login do usuário na máquina'
        ], '!! é a expansão de histórico do bash para o último comando. Útil depois de um "Permission denied", mas só se você entende o comando.'),
        mcq('q7', 'Qual é o maior risco de usar sudo?', 'b', [
          'Gastar muita memória do computador a cada comando executado com sudo',
          'Rodar com poder total o que você não entende, como curl | sudo bash',
          'Ter de digitar a senha com muita frequência durante a sessão',
          'Perder o acesso à pasta pessoal depois de usar o comando'
        ], 'Com sudo, qualquer comando age sem as proteções do usuário comum. Entenda o que vai rodar antes.'),
        fill('q8', 'Complete o comando que edita o arquivo sudoers validando a sintaxe antes de gravar:', 'sudo ___', ['visudo'], 'visudo bloqueia o arquivo e valida a sintaxe antes de gravar, evitando deixar o sudo quebrado.')
      ]
    },
    {
      id: 'lnb-13-permissoes',
      title: 'Permissões',
      goal: 'Ler e alterar permissões com chmod e chown, calcular valores octais e entender o que está em jogo na segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'r, w, x para dono, grupo e outros',
            'Cada arquivo tem um dono e um grupo, e três conjuntos de permissões: para o dono (u, de user), para o grupo (g) e para os outros (o, todos os demais). Cada conjunto tem três bits: r (read, ler), w (write, escrever) e x (execute, executar). Um hífen no lugar da letra significa "sem essa permissão". No ls -l, a coluna começa com o tipo (- arquivo, d diretório, l link) seguido de 9 caracteres, de três em três: dono, grupo, outros.',
            '-rwxr-xr--  1 aluno equipe  120 nov  2 10:18 script.sh\n|\\_/\\_/\\_/\n| |  |  +-- outros: r-- (só ler)\n| |  +----- grupo : r-x (ler e executar)\n| +-------- dono  : rwx (ler, escrever, executar)\n+---------- tipo  : - (arquivo comum)'
          ),
          sl(
            'O que r, w e x significam em arquivos e em diretórios',
            'Em arquivos: r permite ler o conteúdo, w permite modificá-lo e x permite executá-lo como programa ou script. Em diretórios o sentido muda: r permite listar os nomes lá dentro (ls); w permite criar, apagar e renomear entradas (e isso depende do DIRETÓRIO, não do arquivo: quem tem w na pasta consegue remover um arquivo mesmo que não possa escrever nele); e x permite entrar e atravessar (cd e acessar os itens pelo nome). Sem x no diretório, até itens legíveis ficam inacessíveis.'
          ),
          sl(
            'chmod no modo simbólico',
            'chmod altera permissões. No modo simbólico você diz: quem (u, g, o ou a para todos), o operador (+ acrescenta, - remove, = define exatamente) e quais permissões (r, w, x). Dá para combinar com vírgulas, e -R aplica recursivamente. Exemplos reais: "u+x" dá execução ao dono; "go-w" tira escrita de grupo e outros; "a=r" deixa todos só com leitura.',
            '$ chmod u+x script.sh        # dono ganha execução\n$ chmod go-w notas.txt       # grupo e outros perdem a escrita\n$ chmod a=r leia-me.txt      # todos: somente leitura\n$ chmod u=rwx,go=rx run.sh   # define cada conjunto'
          ),
          sl(
            'chmod no modo octal',
            'No modo octal cada permissão vale um número: r = 4, w = 2, x = 1. Soma-se por categoria e escreve-se um dígito para o dono, um para o grupo e um para os outros. rwx = 4+2+1 = 7; r-x = 4+0+1 = 5; rw- = 4+2 = 6; r-- = 4. Valores comuns: 755 (rwxr-xr-x, programas e pastas), 644 (rw-r--r--, arquivos comuns) e 600 (rw-------, só o dono lê e escreve; ideal para segredos). As contas abaixo foram feitas no bash.',
            '$ echo $((4+2+1))\n7\n$ echo $((4+0+1))\n5\n$ echo $((4+2))\n6\n755 = rwx r-x r-x\n644 = rw- r-- r--\n600 = rw- --- ---'
          ),
          sl(
            'chown, chgrp e umask',
            'chown muda o dono (e, opcionalmente, o grupo: usuario:grupo); chgrp muda só o grupo. Em geral só o root pode trocar o dono, então se usa sudo. -R aplica a tudo dentro de uma pasta. A umask é uma máscara que REMOVE permissões dos arquivos novos: com a umask comum 022, arquivos nascem com 644 (base 666 menos 022) e diretórios com 755 (base 777 menos 022). Rodar "umask" mostra o valor atual (o resultado varia entre sistemas).',
            '$ sudo chown maria relatorio.txt        # novo dono\n$ sudo chown maria:equipe relatorio.txt  # dono e grupo\n$ chgrp equipe relatorio.txt             # só o grupo\n$ umask\n0022'
          ),
          sl(
            'setuid, setgid e sticky bit (apresentação)',
            'Há três permissões especiais. setuid num programa faz ele rodar com as permissões do DONO do arquivo (é como o comando passwd consegue alterar o arquivo de senhas); aparece como "s" no lugar do x do dono. setgid faz o mesmo com o grupo e, em diretórios, faz os arquivos novos herdarem o grupo da pasta. O sticky bit em um diretório impede que usuários apaguem arquivos de OUTROS, mesmo tendo w na pasta: é o caso de /tmp, que aparece como drwxrwxrwt (o "t" final). Por serem sensíveis à segurança, só mexa neles sabendo o que faz.'
          ),
          sl(
            'Permissões e segurança',
            'chmod 777 dá a QUALQUER usuário do sistema o direito de ler, alterar e executar: é má ideia, pois esconde o problema (em vez de descobrir quem deveria ter acesso) e abre brechas. O caminho certo: descubra o dono e o grupo com ls -l, e conceda o mínimo necessário. Chaves privadas SSH precisam de 600 (e a pasta ~/.ssh de 700): se estiverem abertas demais, o ssh recusa usá-las com um aviso como "UNPROTECTED PRIVATE KEY FILE". Um erro clássico: "./script.sh: Permission denied" geralmente é falta do bit x. AVISO: no Git Bash do Windows (NTFS), o chmod não reflete todas as permissões: pratique num Linux de verdade, VM ou WSL2.',
            '$ ./backup.sh\nbash: ./backup.sh: Permission denied     # falta o x\n$ chmod u+x backup.sh && ./backup.sh     # concede só o necessário\n$ chmod 600 ~/.ssh/id_ed25519           # chave privada: só o dono\n$ chmod 700 ~/.ssh'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa a permissão "-rwxr-xr--" de um arquivo?', 'b', [
          'Todos os usuários podem ler, escrever e executar o arquivo',
          'Dono: rwx; grupo: r-x; outros: apenas leitura',
          'O dono só lê, o grupo escreve e os demais executam',
          'É um diretório em que só o dono consegue entrar'
        ], 'Os 9 caracteres são dono (rwx), grupo (r-x) e outros (r--). O primeiro caractere, -, é o tipo (arquivo comum).'),
        mcq('q2', 'Um diretório tem permissão r-- (sem x) para você. O que acontece ao tentar "cd" nele?', 'c', [
          'Funciona normalmente, pois a permissão r já basta para entrar',
          'O diretório é apagado, porque o shell o considera inválido',
          'Dá "Permission denied": é o x que permite entrar (atravessar) no diretório',
          'O diretório vira um arquivo comum até a permissão ser restaurada'
        ], 'Em diretório, r lista nomes, w cria/apaga entradas e x permite entrar e acessar itens pelo nome.'),
        mcq('q3', 'Qual é a representação simbólica de "chmod 640 arquivo"?', 'd', [
          'rwxr-xr--',
          'rw-r--r--',
          'rwxr-----',
          'rw-r-----'
        ], '6 = rw- (dono), 4 = r-- (grupo), 0 = --- (outros). Total: rw-r-----.'),
        fill('q4', 'Complete o comando que dá permissão de execução somente ao dono do arquivo:', 'chmod ___ script.sh', ['u+x'], 'u+x acrescenta x ao dono (u). Os outros conjuntos não mudam.'),
        mcq('q5', 'Ao rodar "./backup.sh" aparece "Permission denied". Qual é a causa mais provável e a correção?', 'a', [
          'Falta o bit x; corrija com chmod u+x backup.sh',
          'O arquivo está vazio, então basta editá-lo e salvar de novo',
          'O nome está errado; renomeie com mv e tente de novo',
          'O terminal está desatualizado, e é preciso reinstalar o shell'
        ], 'Para executar um script direto, ele precisa de x. Conceda só o necessário, em vez de 777.'),
        mcq('q6', 'Por que "chmod 777" para resolver um "Permission denied" é uma má ideia?', 'd', [
          'Porque o chmod não aceita três dígitos iguais como argumento',
          'Porque o comando apaga o dono do arquivo e deixa o grupo vazio',
          'Porque só o root consegue executar chmod com valor 777 no sistema',
          'Libera tudo a todos e mascara a causa real do problema'
        ], '777 libera tudo para todos. Em vez disso, ache o dono/grupo e conceda o mínimo.'),
        mcq('q7', 'Qual permissão deve ter sua chave privada SSH?', 'c', [
          '777',
          '644',
          '600',
          '755'
        ], '600 (rw-------): só o dono lê e escreve. O ssh recusa chaves privadas legíveis por outros.'),
        fill('q8', 'Complete o comando que muda o dono e o grupo de um arquivo:', 'sudo ___ maria:dev relatorio.txt', ['chown'], 'chown usuario:grupo arquivo altera dono e grupo; em geral só o root pode trocar o dono.')
      ]
    },
    {
      id: 'lnb-14-processos',
      title: 'Processos',
      goal: 'Listar, monitorar, controlar e encerrar processos, e entender sinais e códigos de saída.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Programa versus processo',
            'Um programa é um arquivo no disco; um processo é um programa EM EXECUÇÃO, com memória e estado próprios. O mesmo programa pode ter vários processos ao mesmo tempo. O kernel dá a cada processo um número, o PID (process ID), e registra o PPID, o PID do processo PAI (quem o iniciou). Em muitas distribuições o PID 1 é o systemd, o primeiro processo, de onde tudo descende. Um processo pode estar rodando (R), dormindo à espera de algo (S), parado (T) ou ser um "zumbi" (Z: terminou, mas o pai ainda não registrou o fim). No shell, $$ é o PID do próprio shell.'
          ),
          sl(
            'ps: fotografia dos processos',
            'ps mostra os processos num instante. Sem opções, só os do seu terminal. "ps aux" (estilo BSD) mostra todos, com usuário, PID, %CPU, %MEM, estado e comando. "ps -ef" (estilo UNIX) mostra todos com PID e PPID. Para achar um processo pelo nome, "ps aux | grep nome" (a própria linha do grep aparece também) ou "pgrep nome". As linhas abaixo são exemplos fictícios; os valores variam.',
            '$ ps aux | head -n 3\nUSER   PID %CPU %MEM   VSZ   RSS TTY STAT START TIME COMMAND\nroot     1  0.0  0.1 ...   ...  ?   Ss   09:00 0:01 /sbin/init\naluno 1234  0.0  0.0 ...   ...  pts/0 Ss 10:00 0:00 bash\n$ ps -ef | head -n 2\nUID  PID PPID C STIME TTY  TIME CMD'
          ),
          sl(
            'top e htop: monitor ao vivo',
            'top mostra, atualizando sozinho, os processos que mais usam CPU e memória, além da carga do sistema (load average) no topo. Aperte q para sair. htop é uma versão mais amigável, colorida e com rolagem, mas nem sempre vem instalado. Servem para descobrir "o que está deixando a máquina lenta?" antes de decidir encerrar algo.',
            '$ top      # q para sair\n$ htop     # se estiver instalado'
          ),
          sl(
            'Primeiro e segundo plano',
            'Um comando em primeiro plano ocupa o terminal até acabar. Com "&" no fim, ele vai para segundo plano e o prompt volta. jobs lista os trabalhos do shell atual; Ctrl+Z suspende (para) o comando em primeiro plano; bg o retoma em segundo plano; fg o traz de volta ao primeiro plano; %1 se refere ao trabalho número 1. Ao fechar o terminal, os filhos recebem o sinal SIGHUP e morrem; para sobreviver, use "nohup comando &" (ignora o SIGHUP e guarda a saída em nohup.out). As saídas abaixo foram obtidas no bash (o PID varia).',
            '$ sleep 100 &\n[1] 4321\n$ jobs\n[1]+  Running                    sleep 100 &\n$ kill %1\n$ jobs\n[1]+  Terminated                 sleep 100\n$ nohup ./relatorio.sh &       # sobrevive ao fechar o terminal'
          ),
          sl(
            'kill e os sinais',
            'kill NÃO significa só "matar": envia um sinal a um processo. O padrão é SIGTERM (15), um pedido educado de encerramento: o programa pode fechar arquivos e limpar o que está fazendo. SIGINT (2) é o que Ctrl+C envia. SIGHUP (1) significa "o terminal caiu"; muitos serviços o usam como "releia a configuração". SIGKILL (9) é imposto pelo kernel: o programa não pode ignorá-lo nem limpar nada — pode deixar arquivos temporários e dados pela metade. Por isso: tente SIGTERM, espere um pouco, e só então use kill -9. "kill -l" lista os sinais.',
            '$ kill 1234          # SIGTERM (15): pede para encerrar\n$ kill -9 1234       # SIGKILL: último recurso\n$ kill -l            # lista os sinais'
          ),
          sl(
            'killall, pkill, nice e renice',
            'Para agir pelo NOME e não pelo PID: "pkill nome" e "killall nome" enviam sinal a todos os processos com aquele nome (no Linux; pkill -f casa com a linha de comando inteira). Confira antes com "pgrep -l nome", pois pode haver mais processos do que você imagina. nice e renice ajustam a prioridade: "nice -n 10 comando" inicia com prioridade mais baixa (valores vão de -20, mais prioridade, a 19, menos); renice muda um processo já em execução. Só o root pode dar prioridade maior que a padrão.',
            '$ pgrep -l ffmpeg            # confira o que vai ser atingido\n$ pkill ffmpeg               # SIGTERM em todos com esse nome\n$ nice -n 10 ./compactar.sh  # roda com menos prioridade'
          ),
          sl(
            'Código de saída: $?',
            'Todo processo, ao terminar, devolve um número ao pai: o código de saída. 0 significa sucesso; qualquer outro valor, algum tipo de falha. O shell guarda o do último comando em $?, e é isso que && e || consultam. Quando um processo é morto por um sinal, o código costuma ser 128 + o número do sinal: SIGTERM (15) dá 143. As saídas abaixo foram obtidas no bash.',
            '$ true; echo $?\n0\n$ false; echo $?\n1\n$ ls /naoexiste 2>/dev/null; echo $?\n2\n$ sleep 100 &\n$ kill $!; wait $!; echo $?\n143'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre programa e processo?', 'c', [
          'São sinônimos, os dois nomes valem para o arquivo e para a execução',
          'Programa é um processo que está parado na memória',
          'Programa é o arquivo no disco; processo é ele em execução',
          'Processo é o arquivo de configuração de um programa'
        ], 'O mesmo programa pode originar vários processos, cada um com seu PID, memória e estado.'),
        mcq('q2', 'O que é o PPID de um processo?', 'b', [
          'O número de prioridade dele',
          'O PID do processo pai, aquele que o iniciou',
          'A quantidade de memória usada',
          'O PID do último processo criado em todo o sistema'
        ], 'PPID = parent process ID. "ps -ef" mostra a coluna PPID.'),
        mcq('q3', 'Um comando está em primeiro plano e você aperta Ctrl+Z. O que acontece?', 'a', [
          'Fica suspenso; bg o retoma em segundo plano e fg o traz de volta',
          'É encerrado definitivamente pelo shell, sem possibilidade de retomar depois',
          'É enviado ao root, que decide se continua a execução',
          'É reiniciado do começo, perdendo o que já tinha processado'
        ], 'Ctrl+Z suspende; Ctrl+C é que interrompe. jobs lista, bg continua em segundo plano e fg volta ao primeiro.'),
        fill('q4', 'Complete o kill que envia SIGKILL (sinal 9) ao processo 1234:', 'kill ___ 1234', ['-9', '-KILL', '-SIGKILL', '-s KILL', '-s 9'], 'kill -9 envia SIGKILL: o kernel encerra o processo, que não pode limpar nada. É o último recurso.'),
        mcq('q5', 'Qual sinal "kill 1234", sem opções, envia ao processo?', 'd', [
          'SIGKILL (9)',
          'SIGINT (2)',
          'SIGHUP (1)',
          'SIGTERM (15)'
        ], 'O padrão é SIGTERM, um pedido educado. SIGKILL (9) só se ele não obedecer.'),
        mcq('q6', 'Por que se tenta SIGTERM antes de SIGKILL?', 'b', [
          'Porque o kernel só aceita SIGKILL depois de o processo ter recebido um SIGTERM antes',
          'SIGTERM deixa o programa limpar o que fazia; SIGKILL pode corromper dados',
          'Porque SIGTERM é mais rápido que SIGKILL para o kernel processar',
          'Porque SIGKILL exige uma senha de administrador para ser enviado'
        ], 'SIGTERM pode ser tratado pelo programa (limpeza ordenada). SIGKILL não pode ser capturado nem ignorado.'),
        mcq('q7', 'Para que serve "nohup comando &"?', 'a', [
          'Para continuar rodando após fechar o terminal',
          'Para rodar com mais prioridade que os outros processos do sistema',
          'Para apagar toda a saída do comando assim que ele terminar de rodar',
          'Para executar o comando como root, sem precisar digitar sudo'
        ], 'nohup ignora o SIGHUP (enviado ao fechar o terminal); o & o põe em segundo plano.'),
        fill('q8', 'Complete a variável especial que guarda o código de saída do último comando:', 'echo $___', ['?'], '$? vale 0 em sucesso e outro número em falha. É o que os operadores && e || verificam.')
      ]
    },
    {
      id: 'lnb-15-pacotes-instalacao',
      title: 'Instalando programas',
      goal: 'Instalar, atualizar e remover programas com o gerenciador de pacotes, e fazer isso com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Gerenciador de pacotes e repositórios',
            'No Linux, programas normalmente não são baixados de sites e instalados na mão. Um pacote é um arquivo com o programa, metadados e a lista de dependências (outros pacotes de que ele precisa). Um repositório é um servidor com milhares de pacotes, mantido pela distribuição e assinado digitalmente. O gerenciador de pacotes consulta os repositórios, instala o que você pediu junto com as dependências, verifica as assinaturas, atualiza tudo de uma vez e remove com limpeza. Mudar o sistema exige privilégio, então se usa sudo.'
          ),
          sl(
            'APT (Debian, Ubuntu, Mint)',
            'apt update baixa a LISTA de pacotes disponíveis — não instala nem atualiza nada. apt upgrade instala as versões novas dos pacotes que você já tem. apt install instala (e traz as dependências); apt remove tira o programa mas mantém seus arquivos de configuração; apt purge remove também as configurações; apt autoremove apaga dependências órfãs, que ninguém mais precisa. apt search procura e apt show mostra detalhes de um pacote. Pesquisar e mostrar não exigem sudo.',
            '$ sudo apt update          # atualiza a lista (não instala nada)\n$ sudo apt upgrade         # instala versões novas dos pacotes\n$ sudo apt install htop\n$ apt search editor\n$ apt show htop\n$ sudo apt remove htop     # mantém configurações\n$ sudo apt purge htop      # remove também as configurações\n$ sudo apt autoremove      # remove dependências órfãs'
          ),
          sl(
            'DNF, pacman, apk: o mesmo em outras famílias',
            'As ideias são as mesmas, só mudam os comandos. Família Red Hat/Fedora: dnf (o antigo yum). Arch: pacman, em que as opções são letras: -S instala, -R remove, -Ss busca e -Syu sincroniza e atualiza o sistema inteiro (evite "pacman -Sy" sozinho: o Arch não suporta atualizações parciais). Alpine: apk. SUSE: zypper. Pacotes têm nomes que variam um pouco entre as famílias.',
            '# tarefa    apt (Debian)       dnf (Fedora)      pacman (Arch)    apk (Alpine)\n# instalar  apt install X      dnf install X     pacman -S X      apk add X\n# remover   apt remove X       dnf remove X      pacman -R X      apk del X\n# buscar    apt search X       dnf search X      pacman -Ss X     apk search X\n# atualizar apt update+upgrade dnf upgrade       pacman -Syu      apk update+upgrade'
          ),
          sl(
            'Pacotes universais: Snap, Flatpak, AppImage',
            'Formatos que funcionam em várias distribuições. Snap (mantido pela Canonical) e Flatpak (Flathub é a loja mais usada) embrulham o programa com suas dependências e o rodam em uma sandbox (ambiente isolado). AppImage é um único arquivo executável: baixa, dá permissão de execução e roda, sem instalar. Vantagens: versões mais novas e independência da distro. Desvantagens: ocupam mais espaço, podem iniciar mais devagar, e você precisa confiar em quem publicou; no AppImage, atualizar é por sua conta. A sandbox reduz, mas não elimina, os riscos.'
          ),
          sl(
            'Compilar do código-fonte',
            'Quando não há pacote, é possível baixar o código-fonte e compilar. A sequência clássica é ./configure, make e sudo make install (varia por projeto). Em compensação, você assume tudo: instalar as dependências de compilação, ler as instruções, atualizar na mão — e o "make install" espalha arquivos que o gerenciador de pacotes desconhece, o que dificulta remover. Para um iniciante, vale preferir sempre o pacote.'
          ),
          sl(
            'Segurança na instalação',
            'Instalar um programa é dar a ele a chance de rodar no seu sistema, muitas vezes como root. Por isso: prefira os repositórios oficiais da distribuição; eles são assinados com chaves GPG, e o gerenciador verifica as assinaturas. Adicionar um repositório de terceiros ou um PPA é passar a confiar no responsável por ele, que poderá entregar qualquer atualização; só faça com projetos que você conhece. Desconfie de "curl ... | sudo bash": ele baixa e executa como root um código que você não leu; baixe, leia e verifique o hash, se for o caso. Mantenha o sistema atualizado (as atualizações trazem correções de segurança) e remova o que não usa.',
            '# ARRISCADO: executa como root um script que você não leu\n$ curl -fsSL https://exemplo.invalid/instalar.sh | sudo bash\n\n# MELHOR: baixe, leia, e só então execute\n$ curl -fsSLo instalar.sh https://exemplo.invalid/instalar.sh\n$ less instalar.sh'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a vantagem de instalar via gerenciador de pacotes, em vez de baixar um instalador de um site?', 'd', [
          'Os programas ficam mais rápidos do que os baixados de sites',
          'Não é preciso estar conectado à internet depois do primeiro uso',
          'O gerenciador dispensa o uso de sudo para instalar qualquer coisa',
          'Resolve dependências, confere assinaturas e atualiza tudo junto'
        ], 'O gerenciador baixa de repositórios assinados, instala dependências e permite atualizar e remover com limpeza.'),
        mcq('q2', 'Qual é a diferença entre "apt update" e "apt upgrade"?', 'a', [
          'update atualiza a lista de pacotes; upgrade instala as versões novas',
          'update instala os programas novos; upgrade atualiza a lista de pacotes',
          'update atualiza o kernel; upgrade atualiza só o ambiente gráfico',
          'São o mesmo comando, e um nome é apenas um apelido do outro'
        ], 'Primeiro update, para saber o que há de novo; depois upgrade, para instalar.'),
        mcq('q3', 'O que faz "sudo apt autoremove"?', 'b', [
          'Remove todos os programas que você não abriu nos últimos meses',
          'Remove dependências órfãs, que foram instaladas só como apoio e não são mais necessárias',
          'Desinstala o próprio apt e reinstala o sistema de pacotes',
          'Remove só os arquivos de configuração do pacote instalado'
        ], 'autoremove limpa dependências órfãs. A remoção das configurações é papel do purge.'),
        fill('q4', 'Complete o comando que instala o programa htop com o APT:', 'sudo apt ___ htop', ['install'], 'apt install baixa o pacote e as dependências dos repositórios. Precisa de sudo.'),
        mcq('q5', 'Você encontrou um tutorial que manda rodar: curl -fsSL https://site-desconhecido/x.sh | sudo bash. Qual é a melhor atitude?', 'c', [
          'Rodar logo o comando, já que tutoriais costumam ser confiáveis',
          'Rodar sem o sudo, o que já o torna seguro independentemente da origem',
          'Desconfiar: baixar o script, ler o conteúdo e só então decidir se executa',
          'Rodar como root numa máquina de produção, para testar logo'
        ], 'Esse padrão executa como root código que você nunca viu. Baixe, leia e confie só em origens conhecidas.'),
        mcq('q6', 'Qual é uma vantagem e uma desvantagem típicas de Snap, Flatpak e AppImage?', 'a', [
          'Rodam em várias distros e têm versões novas, mas ocupam mais espaço',
          'Dispensam atualizações e não consomem nenhum espaço extra no disco',
          'Funcionam no Ubuntu, onde costumam ser mais rápidos',
          'Não precisam de dependências e por isso são imunes a falhas de segurança'
        ], 'Os formatos universais empacotam dependências. Isso ajuda na portabilidade, mas tem custo de espaço e de confiança.'),
        mcq('q7', 'Por que adicionar um repositório de terceiros (um PPA, por exemplo) pede cautela?', 'd', [
          'Porque repositórios de terceiros deixam o sistema sem acesso à internet',
          'Porque o apt só aceita um repositório de cada vez na configuração',
          'Porque as chaves GPG deixam de ser necessárias nesses repositórios',
          'Porque você passa a confiar no mantenedor para qualquer atualização'
        ], 'Pacotes têm scripts executados como root. Só adicione repositórios de quem você conhece e confira a chave.'),
        fill('q8', 'Complete o comando que remove o pacote E suas configurações:', 'sudo apt ___ nginx', ['purge'], 'remove deixa as configurações; purge as apaga também.')
      ]
    },
    {
      id: 'lnb-16-variaveis-ambiente-path',
      title: 'Variáveis de ambiente e PATH',
      goal: 'Usar variáveis do shell e de ambiente, entender o PATH e configurar o shell sem expor segredos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Variáveis do shell',
            'Uma variável guarda um valor com um nome. Defina com NOME=valor (sem espaços ao redor do =) e leia com $NOME. echo imprime o valor. unset NOME apaga a variável. Uma variável criada assim é local ao shell: os programas que você iniciar a partir dele NÃO a enxergam. Convenção: nomes de variáveis de ambiente em MAIÚSCULAS.',
            '$ FOO=bar\n$ echo $FOO\nbar\n$ unset FOO\n$ echo "[$FOO]"\n[]'
          ),
          sl(
            'Variáveis de ambiente e export',
            'Variáveis de ambiente são as que o shell passa (uma cópia) para cada processo filho. Para "promover" uma variável do shell a variável de ambiente, use export. env e printenv listam o ambiente; "printenv NOME" mostra uma. A cópia é de mão única: o filho pode mudar a sua e a do pai não muda. Abaixo, "bash -c" inicia um shell filho (resultados obtidos no bash).',
            '$ FOO=bar\n$ bash -c \'echo [$FOO]\'      # filho não vê (não exportada)\n[]\n$ export FOO\n$ bash -c \'echo [$FOO]\'\n[bar]\n$ printenv FOO\nbar'
          ),
          sl(
            'Variáveis que você vai encontrar',
            'HOME é a pasta pessoal; USER é o nome do usuário; PWD é o diretório atual; SHELL é o shell de login; LANG define idioma e codificação (influencia, por exemplo, a ordem do sort); EDITOR é o editor padrão; PATH é a lista de lugares onde os comandos são procurados. Os valores abaixo são fictícios e variam de máquina para máquina.',
            '$ echo $HOME $USER\n/home/aluno aluno\n$ echo $SHELL\n/bin/bash\n$ echo $LANG\npt_BR.UTF-8'
          ),
          sl(
            'PATH: como o shell acha os comandos',
            'Quando você digita "ls", o shell não sabe onde ele está: percorre, em ordem, os diretórios da variável PATH (separados por dois-pontos) até achar um executável com esse nome. Se não achar: "command not found". which, type e command -v mostram o que será executado: type também revela se é um comando interno do shell (builtin), alias ou arquivo. Para acrescentar uma pasta: export PATH="$HOME/bin:$PATH". Segurança: nunca coloque "." (a pasta atual) nem diretórios graváveis por outros no PATH — alguém poderia plantar um programa com nome de comando comum.',
            '$ echo $PATH\n/usr/local/bin:/usr/bin:/bin     # exemplo; varia\n$ command -v ls\n/usr/bin/ls\n$ type cd\ncd is a shell builtin\n$ export PATH="$HOME/bin:$PATH"   # acrescenta uma pasta no começo'
          ),
          sl(
            'Por que ./script.sh precisa do ./',
            'Como a pasta atual normalmente NÃO está no PATH (por segurança), digitar "script.sh" faz o shell procurar só nos diretórios do PATH e falhar. O "./" transforma o nome num caminho (relativo à pasta atual), então o shell não consulta o PATH e executa aquele arquivo, desde que ele tenha o bit x. Alternativa: "bash script.sh", que não exige o x. Para usar o script de qualquer lugar, coloque-o numa pasta do PATH (como ~/bin).',
            '$ script.sh\nbash: script.sh: command not found\n$ ./script.sh        # caminho explícito: precisa do bit x\n$ bash script.sh     # alternativa: não precisa do x'
          ),
          sl(
            '~/.bashrc, ~/.profile e source',
            'O bash lê arquivos de configuração ao iniciar. Shells de login (SSH, console) leem ~/.bash_profile — ou, se ele não existir, ~/.profile. Shells interativos sem login, como uma nova janela de terminal, leem ~/.bashrc. Muitas distribuições fazem o ~/.profile carregar o ~/.bashrc, mas varia. Editar um arquivo não afeta a sessão aberta: recarregue com "source ~/.bashrc" (ou ". ~/.bashrc"), sem precisar abrir outro terminal.',
            '$ nano ~/.bashrc          # adicione linhas como o alias abaixo\n$ source ~/.bashrc        # aplica agora, nesta sessão'
          ),
          sl(
            'alias, funções e cuidado com segredos',
            'alias dá um apelido a um comando: alias ll=\'ls -lah\'. Funções aceitam argumentos: mkcd() { mkdir -p "$1" && cd "$1"; }. Digitados no terminal, valem só na sessão; para persistir, ponha no ~/.bashrc. Segredos (senhas, tokens, chaves de API): NUNCA os guarde em variáveis exportadas dentro de arquivos versionados. Muita gente publica o "dotfiles" no Git e vaza as credenciais. Um "export SENHA=..." digitado no terminal fica no histórico (~/.bash_history) e é herdado por todos os processos filhos. Prefira um gerenciador de segredos ou um arquivo fora do repositório com permissão 600 (e no .gitignore).',
            '$ alias ll=\'ls -lah\'\n$ mkcd() { mkdir -p "$1" && cd "$1"; }\n$ mkcd projeto/novo     # cria e entra\n\n# MAU: token dentro de arquivo versionado\nexport API_TOKEN="..."   # em ~/.bashrc publicado no Git'
          )
        ]
      },
      questions: [
        mcq('q1', 'Depois de executar "X=1" (sem export), qual é a saída de: bash -c \'echo [$X]\' ?', 'a', [
          '[], pois a variável é só do shell e não foi exportada ao filho',
          '[1], pois variáveis do shell são herdadas por padrão pelos filhos',
          '[X], o nome da variável sem o valor, já que ela não foi exportada',
          'Um erro de sintaxe, porque bash -c não aceita variáveis assim'
        ], 'Variáveis do shell não passam para filhos. Com "export X", o filho passa a receber uma cópia.'),
        mcq('q2', 'Você digitou alias ll=\'ls -lah\' num terminal. Quando ele deixa de existir, e como torná-lo permanente?', 'c', [
          'Só deixa de existir ao reiniciar o computador; já é permanente após fechar o terminal',
          'Nunca deixa de existir, pois o alias é gravado em /etc',
          'Deixa de existir ao fechar o terminal; para persistir, a linha vai no ~/.bashrc',
          'Deixa de existir após o primeiro uso e precisa ser redefinido'
        ], 'Alias digitado vale só na sessão. Para persistir, ponha no ~/.bashrc e rode source ~/.bashrc.'),
        mcq('q3', 'Para que serve a variável PATH?', 'd', [
          'Para guardar o caminho da pasta em que o usuário está no momento',
          'Para definir qual é a pasta pessoal do usuário que fez login',
          'Para listar todos os arquivos que existem no sistema inteiro',
          'Lista de pastas (separadas por :) onde o shell busca comandos'
        ], 'Quem acha "ls" é o PATH. A pasta atual é PWD e a pasta pessoal é HOME.'),
        fill('q4', 'Complete o comando que torna a variável EDITOR visível para os processos filhos:', '___ EDITOR=nano', ['export'], 'export promove a variável a variável de ambiente, herdada pelos processos filhos.'),
        mcq('q5', 'Por que, para rodar um script da pasta atual, se digita "./script.sh" e não só "script.sh"?', 'b', [
          'Porque o ponto indica que o script é um arquivo oculto no sistema',
          'Porque a pasta atual não está no PATH; o ./ dá o caminho explícito',
          'Porque o ./ concede ao arquivo a permissão de execução necessária',
          'Porque o shell só executa arquivos com extensão .sh, e o ./ completa isso'
        ], 'Sem ./ o shell só procura no PATH. O ./ indica o arquivo exato, que ainda precisa do bit x.'),
        mcq('q6', 'Qual afirmação sobre ~/.bashrc e ~/.profile (ou ~/.bash_profile) é correta?', 'd', [
          'O ~/.bashrc é lido só em logins por SSH, e o ~/.profile em cada nova janela',
          'Os dois arquivos são lidos exatamente nas mesmas situações, sempre juntos',
          'Ambos só podem ser alterados pelo root, por ficarem na pasta pessoal',
          'Login lê ~/.bash_profile (ou ~/.profile); terminal sem login lê ~/.bashrc'
        ], 'Cada tipo de shell lê arquivos diferentes (e muitas distros encadeiam um no outro). Edições valem em novas sessões ou após source.'),
        mcq('q7', 'Qual é a prática mais segura para o token de API usado em seus scripts?', 'b', [
          'Escrever "export TOKEN=..." no ~/.bashrc e versionar esse arquivo no Git',
          'Arquivo fora do repositório (permissão 600) ou gerenciador de segredos',
          'Digitá-lo direto na linha de comando, para não precisar guardar em arquivo',
          'Colocá-lo no nome do script, para que seja fácil de lembrar depois'
        ], 'Segredos em arquivos versionados vazam; na linha de comando ficam no histórico. Arquivo com 600 fora do repositório, ou um gerenciador de segredos, reduz a exposição.'),
        fill('q8', 'Complete o comando que recarrega o ~/.bashrc na sessão atual, sem abrir outro terminal:', '___ ~/.bashrc', ['source', '.'], 'source arquivo (ou . arquivo) executa o arquivo no shell atual. Sem isso, as mudanças só valem em novas sessões.')
      ]
    },
    {
      id: 'lnb-17-shell-script-basico',
      title: 'Shell script: o básico',
      goal: 'Escrever e executar seus primeiros scripts em bash, com variáveis, argumentos e código de saída.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um script',
            'Um shell script é um arquivo de texto com uma lista de comandos que o shell executa de cima para baixo, como se você os digitasse um a um. Serve para automatizar tarefas repetidas (backup, limpeza, relatórios) e para registrar um procedimento de modo que ele rode igual toda vez. Tudo o que você já aprendeu no terminal (cd, ls, grep, pipes, redirecionamento) funciona dentro de um script. Linhas que começam com # são comentários: o shell as ignora, e servem para explicar o que o script faz.',
            `# isto é um comentário
echo "Primeira linha do script"
ls -l | wc -l   # comentário também pode ficar no fim da linha`
          ),
          sl(
            'Shebang, chmod +x e ./script.sh',
            'A primeira linha #!/bin/bash se chama shebang: diz ao sistema qual interpretador deve executar o arquivo (aqui, o bash). Para rodar o arquivo diretamente é preciso dar permissão de execução com chmod +x e chamá-lo com um caminho (./ola.sh, onde o ponto é a pasta atual — a pasta atual não costuma estar no PATH). Também dá para rodar sem permissão de execução usando o interpretador de forma explícita: bash ola.sh.',
            `$ cat ola.sh
#!/bin/bash
echo "Olá, script!"
$ chmod +x ola.sh
$ ./ola.sh
Olá, script!
$ bash ola.sh        # funciona mesmo sem chmod +x
Olá, script!`
          ),
          sl(
            'Variáveis: nome=valor e $nome',
            'Para criar uma variável escreva nome=valor SEM espaços em volta do sinal de igual. Para usar o valor, coloque $ antes do nome (ou \${nome}, que delimita o nome quando há texto colado, como \${nome}s). Variáveis do shell guardam texto; para contas inteiras use $(( ... )). O erro mais comum de iniciante é escrever nome = Ana com espaços: o shell entende "nome" como um COMANDO e "=" e "Ana" como argumentos.',
            `nome=Ana
echo "Oi, $nome"      # Oi, Ana
echo "\${nome}s"       # Anas
echo $(( 2 + 3 ))     # 5

nome = Ana            # ERRADO (espaços)
# nome: command not found`
          ),
          sl(
            'Aspas simples, aspas duplas e $(comando)',
            'Dentro de aspas duplas o shell ainda substitui $variavel e $(comando); dentro de aspas simples nada é substituído: o texto sai literal. Aspas duplas também protegem valores com espaços (sem elas, o shell divide o valor em várias palavras). A substituição de comando $(comando) executa o comando e coloca a saída dele no lugar, o que permite guardar resultados em variáveis.',
            `x=Lia
echo 'oi $x' "oi $x"          # oi $x oi Lia
total=$(echo um dois três | wc -w)
echo "Total: $total"           # Total: 3
hoje=$(date +%F)               # guarda a data de hoje (varia)`
          ),
          sl(
            'Argumentos: $1, $2, $@ e $#',
            'Quem chama o script pode passar argumentos: ./script.sh Ana Bia. Dentro do script, $1 é o primeiro, $2 o segundo, e assim por diante; $# é a QUANTIDADE de argumentos; "$@" é a lista de todos (entre aspas duplas, cada argumento continua sendo uma palavra, mesmo que tenha espaços). \${1:-padrão} usa um valor padrão quando o argumento não foi passado.',
            `#!/bin/bash
nome=\${1:-mundo}
echo "Olá, $nome! Você passou $# argumento(s)."

$ ./ola.sh Ana Bia
Olá, Ana! Você passou 2 argumento(s).
$ ./ola.sh
Olá, mundo! Você passou 0 argumento(s).`
          ),
          sl(
            'Código de saída: $? e exit',
            'Todo comando termina com um código de saída: 0 significa sucesso e qualquer outro número (1 a 255) indica erro ou uma condição especial. O valor do ÚLTIMO comando fica em $?. Seu script também devolve um código: com exit N você escolhe (exit 0 sucesso, exit 1 erro genérico); se não usar exit, vale o código do último comando. É assim que scripts, cron e pipelines sabem se algo deu certo.',
            `$ ls /tmp > /dev/null; echo $?
0
$ ls /pasta-que-nao-existe 2> /dev/null; echo $?
2
# script que termina com exit 3:
$ ./ola.sh Ana; echo "código=$?"
Olá, Ana! Você passou 1 argumento(s).
código=3`
          ),
          sl(
            'echo, printf, read e erros típicos',
            'echo imprime texto com quebra de linha; printf dá controle de formato (%s texto, %d número inteiro, \\n quebra de linha) e é mais previsível. read lê uma linha do teclado para uma variável (read -r nome; o -r evita que a barra invertida seja interpretada). Armadilhas clássicas: espaços em volta do = ao atribuir; usar uma variável com espaço no valor sem aspas ($v em vez de "$v"); esquecer o chmod +x (dá "Permission denied"); esquecer o ./ (dá "command not found").',
            `printf '%s tem %d anos\\n' Ana 30     # Ana tem 30 anos
read -r resposta                       # espera você digitar
echo "Você digitou: $resposta"

v="meu arquivo.txt"
ls $v      # ERRADO: vira dois argumentos (meu e arquivo.txt)
ls "$v"    # certo`
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve a linha #!/bin/bash no início de um script?', 'b', [
          'É um comentário que o shell ignora e só serve para documentar o autor do arquivo',
          'Indica ao sistema qual interpretador deve executar o arquivo quando ele é chamado diretamente',
          'Dá permissão de execução ao arquivo, equivalente a rodar chmod +x nele, mas só se o arquivo estiver na pasta atual',
          'Instala o bash caso ele ainda não exista no computador onde o script será usado'
        ], 'O shebang (#!) é lido pelo sistema na hora de executar o arquivo e indica o interpretador, aqui o /bin/bash. Ele não dá permissão (isso é o chmod +x) e não instala nada.'),
        mcq('q2', 'Qual é a saída de x=Lia; echo \'oi $x\' "oi $x"?', 'd', [
          'oi Lia oi Lia, pois o shell substitui a variável nos dois casos',
          'oi $x oi $x, pois aspas impedem qualquer substituição',
          'oi Lia oi $x, pois só as aspas simples permitem a substituição',
          'oi $x oi Lia, pois só as aspas duplas permitem a substituição'
        ], 'Aspas simples deixam o texto literal; aspas duplas ainda expandem $variáveis e $(comandos).'),
        mcq('q3', 'O que imprime echo "Total: $(echo um dois três | wc -w)"?', 'a', [
          'Total: 3',
          'Total: um dois três',
          'Total: $(echo um dois três | wc -w)',
          'Total: 1'
        ], '$(...) executa o comando interno e coloca a saída no lugar. wc -w conta palavras: são três.'),
        fill('q4', 'Complete o comando que dá permissão de execução ao arquivo ola.sh:', 'chmod ___ ola.sh', ['+x', 'u+x', 'a+x', '755'], 'chmod +x liga o bit de execução; depois o arquivo pode ser chamado com ./ola.sh.'),
        mcq('q5', 'Um script contém echo "Recebi $# argumento(s); o primeiro é $1". Rodando ./s.sh Ana Bia, o que aparece?', 'c', [
          'Recebi 1 argumento(s); o primeiro é Ana Bia',
          'Recebi 3 argumento(s); o primeiro é ./s.sh',
          'Recebi 2 argumento(s); o primeiro é Ana',
          'Recebi 2 argumento(s); o primeiro é Bia'
        ], '$# conta os argumentos (Ana e Bia = 2) e $1 é o primeiro deles. O nome do script fica em $0 e não entra na contagem.'),
        mcq('q6', 'Um script termina com a linha exit 3. Logo depois de rodá-lo, o que mostra echo $?', 'a', [
          '3, o código de saída escolhido pelo script',
          '0, porque o script chegou ao fim sem travar',
          '1, porque qualquer código diferente de zero vira 1',
          'Nada, pois $? só existe dentro de funções'
        ], '$? guarda o código de saída do último comando; o script terminou com exit 3, então aparece 3. Zero significa sucesso e outros valores indicam erro ou situação especial.'),
        mcq('q7', 'O script tem a linha nome = Ana e falha com "nome: command not found". Qual a causa e a correção?', 'd', [
          'O comando nome não foi instalado; é preciso instalar um pacote com esse nome',
          'Falta o $ antes de nome; o correto é $nome = Ana',
          'Faltam aspas simples em volta de Ana; o correto é nome = \'Ana\'',
          'Há espaços em volta do =; o correto é nome=Ana, sem espaços'
        ], 'Com espaços, o shell trata "nome" como um comando. Na atribuição, o nome, o = e o valor devem estar colados.'),
        fill('q8', 'Complete para ler uma linha digitada pelo usuário e guardá-la na variável resposta:', 'read -r ___', ['resposta'], 'read recebe o NOME da variável (sem $). Depois, o valor fica disponível em $resposta.')
      ]
    },
    {
      id: 'lnb-18-script-condicionais-lacos',
      title: 'Scripts: condicionais, laços e funções',
      goal: 'Controlar o fluxo de um script com if, case, for, while e funções.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'if, elif, else e os colchetes [ ]',
            'if executa um comando e olha o código de saída: 0 (sucesso) entra no then. O comando mais usado é o teste [ ... ] (um comando de verdade, também chamado test). Atenção: precisa de ESPAÇO depois de [ e antes de ]. O bloco termina com fi. elif encadeia outra condição e else cobre o resto. Em uma linha, ; separa o teste do then.',
            `n=10
if [ "$n" -gt 10 ]; then
  echo grande
elif [ "$n" -eq 10 ]; then
  echo dez
else
  echo pequeno
fi
# imprime: dez`
          ),
          sl(
            'Testes de arquivo, texto e número',
            'Arquivos: -e existe (qualquer tipo), -f é arquivo comum, -d é diretório, -r legível, -w gravável, -x executável. Texto: -z vazio, -n não vazio, = igual, != diferente. Números inteiros: -eq igual, -ne diferente, -lt menor, -gt maior (-le e -ge: menor ou igual, maior ou igual). Regra: use = e != para TEXTO e -eq/-lt/... para NÚMEROS. Ponha as variáveis entre aspas duplas.',
            `[ -f notas.txt ] && echo "é arquivo"
[ -d /tmp ] && echo "é diretório"
[ -z "$vazia" ] && echo "variável vazia"
[ "$a" = "$b" ]        # compara texto
[ "$idade" -ge 18 ]    # compara número`
          ),
          sl(
            '[ ] versus [[ ]]',
            '[ é um comando comum (existe em qualquer shell POSIX, portável), por isso variáveis sem aspas podem se dividir em várias palavras e quebrar o teste. [[ ]] é uma palavra reservada do bash: não divide variáveis, aceita && e || dentro, comparação com padrão (== a*) e < > para ordem alfabética. Em scripts #!/bin/bash, [[ ]] é mais seguro; em scripts #!/bin/sh portáveis, use [ ] com aspas.',
            `s=abc
[[ $s == a* ]] && echo "começa com a"     # padrão: só no [[ ]]
x=5
[[ $x -gt 3 && $x -lt 9 ]] && echo faixa  # && dentro do [[ ]]
[ "$x" -gt 3 ] && [ "$x" -lt 9 ] && echo faixa   # equivalente com [ ]`
          ),
          sl(
            'case: vários casos',
            'case compara um valor com padrões e escolhe um bloco. Cada bloco termina com ;;. Use | para alternativas (start|iniciar), * para "qualquer outro" (fica por último) e termine com esac (case ao contrário). É mais legível que muitos elif quando você compara a mesma variável.',
            `case "$1" in
  start|iniciar) echo iniciando ;;
  stop)          echo parando ;;
  [0-9]*)        echo "começa com número" ;;
  *)             echo desconhecido ;;
esac`
          ),
          sl(
            'Laços: for, while, until, break e continue',
            'for percorre uma lista (for x in a b c) ou conta no estilo C (for ((i=1; i<=3; i++))). while repete ENQUANTO a condição for verdadeira; until repete ATÉ a condição ficar verdadeira. break sai do laço; continue pula para a próxima volta. Cuidado: em um while, lembre de alterar a variável do teste, senão o laço nunca termina.',
            `for f in um dois tres; do echo "item $f"; done
for ((i=1; i<=3; i++)); do echo "i=$i"; done
i=0
while [ $i -lt 4 ]; do
  i=$((i+1))
  [ $i -eq 2 ] && continue   # pula o 2
  echo $i
done
# imprime 1, 3 e 4`
          ),
          sl(
            'Funções, local, && e ||',
            'Uma função agrupa comandos: nome() { ...; }. Os argumentos dela também são $1, $2... Ela devolve um código de saída com return N (só 0 a 255; para devolver texto, use echo e capture com $(...)). Variáveis dentro de função são globais, a menos que declaradas com local. Os operadores && (executa o próximo SÓ se o anterior teve sucesso) e || (só se falhou) formam atalhos de if.',
            `dobro() { local r=$(( $1 * 2 )); echo $r; }
echo "dobro de 4: $(dobro 4)"      # 8

x=1
f() { local x=2; echo $x; }
f; echo $x                          # 2 e depois 1

[ -f c.sh ] && echo existe || echo "não existe"`
          ),
          sl(
            'Ler um arquivo linha a linha: while read -r',
            'O idioma para processar um arquivo é while read -r variáveis; do ...; done < arquivo. O read lê uma linha por volta; se você passar duas variáveis, a linha é dividida em palavras (a primeira vai para a primeira variável, o resto para a segunda). O -r preserva barras invertidas. Detalhe: se a última linha do arquivo não terminar com quebra de linha, o read falha nela e o laço a ignora.',
            `$ cat l.txt
ana 10
bia 20
$ while read -r nome pts; do echo "$nome -> $pts"; done < l.txt
ana -> 10
bia -> 20`
          )
        ]
      },
      questions: [
        mcq('q1', 'O arquivo c.sh NÃO existe. O que imprime [ -f c.sh ] && echo existe || echo nao?', 'c', [
          'existe, porque o teste -f verifica se o nome é válido',
          'Nada, porque o teste falhou e o || só vale para erros de sintaxe',
          'nao, porque -f é falso e então roda o comando depois do || (o -f só vale para arquivo comum existente)',
          'existe e nao, porque o shell executa os dois comandos'
        ], '-f é verdadeiro só para arquivo comum existente. Falhou, então && pula o echo existe e || executa o echo nao.'),
        mcq('q2', 'Com n=10, qual é a saída?\nif [ "$n" -gt 10 ]; then echo grande\nelif [ "$n" -eq 10 ]; then echo dez\nelse echo pequeno; fi', 'a', [
          'dez',
          'grande',
          'pequeno',
          'grande e dez'
        ], '10 não é maior que 10, então o primeiro teste falha; o elif (igual a 10) é verdadeiro e só esse bloco roda.'),
        mcq('q3', 'O que o laço imprime?\ni=0\nwhile [ $i -lt 4 ]; do\n  i=$((i+1))\n  [ $i -eq 2 ] && continue\n  echo $i\ndone', 'd', [
          '1, 2, 3 e 4',
          '1 e 3',
          '2, 3 e 4',
          '1, 3 e 4'
        ], 'Quando i vale 2, o continue pula o echo e volta ao teste do while. Sobram 1, 3 e 4.'),
        fill('q4', 'Complete para ler cada linha de nomes.txt para a variável nome:', 'while ___ -r nome; do echo "$nome"; done < nomes.txt', ['read'], 'read lê uma linha por volta; o redirecionamento < nomes.txt alimenta o laço com o arquivo.'),
        mcq('q5', 'O que imprime?\nx=1\nf() { local x=2; echo $x; }\nf\necho $x', 'b', [
          '2 e depois 2, pois a função altera a variável global',
          '2 e depois 1, pois local mantém o x da função separado do x global',
          '1 e depois 1, pois funções não conseguem usar variáveis',
          '1 e depois 2, pois o echo de fora roda por último'
        ], 'local limita a variável à função. Dentro dela x vale 2; fora, o x original continua 1.'),
        mcq('q6', 'Qual afirmação sobre [ ] e [[ ]] é correta?', 'd', [
          '[[ ]] é um programa externo em /usr/bin, por isso é o mais portável entre todos os shells existentes',
          '[ ] aceita padrões como a* e && dentro dele, e [[ ]] não aceita',
          'Os dois são idênticos; o [[ ]] só existe por estética',
          '[[ ]] é recurso do bash: não divide variáveis sem aspas e aceita padrões e &&'
        ], '[ é um comando (portável, mas exige aspas e espaços); [[ ]] é sintaxe do bash, mais tolerante e com padrões.'),
        mcq('q7', 'Um script tem if [ 1 -eq 1]; then ... e dá o erro "missing `]\'". Qual é o problema?', 'b', [
          'Falta aspas em volta de 1, pois números precisam de aspas dentro do teste',
          'Falta um espaço antes do ], pois [ é um comando e ] é um argumento',
          '-eq só funciona dentro de [[ ]]; no [ ] é preciso usar o sinal = para números',
          'Falta o ; depois do then, que separa o bloco do comando seguinte'
        ], 'Sem espaço, o shell lê "1]" como uma palavra e não encontra o ] final. Sempre separe [ e ] por espaços.'),
        fill('q8', 'Complete o case com o padrão que captura qualquer valor não previsto antes:', 'case "$op" in\n  start) echo ok ;;\n  ___) echo desconhecido ;;\nesac', ['*'], 'O padrão * casa com qualquer coisa; por isso vai por último.')
      ]
    },
    {
      id: 'lnb-19-buscar-arquivos-find',
      title: 'Buscando arquivos com find',
      goal: 'Localizar arquivos por nome, tipo, tamanho e data, e agir sobre os resultados com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A forma geral do find',
            'find percorre uma árvore de diretórios e testa cada item. Sintaxe: find ONDE CONDIÇÕES AÇÃO. Sem ação, ele imprime os caminhos encontrados (-print é o padrão). A busca é recursiva: entra em todas as subpastas. Os resultados saem em ordem não garantida; use sort se precisar de ordem.',
            `$ find . -type d | sort
.
./docs
./src
./tmp`
          ),
          sl(
            '-name, -iname e -type',
            '-name filtra pelo nome (aceita curingas * e ?) e distingue maiúsculas de minúsculas; -iname ignora a diferença. -type f seleciona arquivos comuns e -type d diretórios. Importante: ponha o padrão entre aspas simples ("\'*.txt\'"). Sem aspas, o PRÓPRIO SHELL expande o * antes de o find rodar, trocando-o pelos nomes que existem na pasta atual, e o find recebe argumentos errados.',
            `$ find . -name '*.txt' | sort
./docs/guia.txt
./notas.txt
$ find . -iname '*.txt' | sort     # pega também Leia.TXT
./docs/Leia.TXT
./docs/guia.txt
./notas.txt
$ find . -type f -name '*.py'
./src/main.py
./src/util.py`
          ),
          sl(
            'O erro do padrão sem aspas',
            'Se existirem arquivos .txt na pasta atual, find . -name *.txt vira find . -name notas.txt yy.txt zz.txt e o find reclama (ou, com um único arquivo, procura só por esse nome e esconde o problema). A regra de ouro: sempre quote padrões de -name/-iname. O mesmo vale para grep e outros comandos que recebem padrões.',
            `$ find . -name *.txt
find: paths must precede expression: \`yy.txt'
find: possible unquoted pattern after predicate \`-name'?`
          ),
          sl(
            '-size, -mtime e -maxdepth',
            '-size +100M acha arquivos maiores que 100 megabytes (use k, M, G; -size -1M para menores). -mtime conta DIAS desde a última modificação: -mtime -1 é "mudou nas últimas 24 horas", -mtime +7 é "mudou há MAIS de 7 dias". -maxdepth N limita a profundidade (1 = só a pasta dada, sem entrar em subpastas) e deve vir antes dos outros testes. Condições escritas em sequência são combinadas com E.',
            `$ find . -size +2k
./tmp/grande.log
$ find /var/log -type f -size +100M -mtime +30   # exemplo: grandes e velhos
$ find . -maxdepth 1 -type f`
          ),
          sl(
            'Ações: -exec e -print0',
            '-exec COMANDO {} \\; roda o comando uma vez para cada resultado, e {} é substituído pelo caminho encontrado; o \\; (barra invertida antes do ponto e vírgula, para o shell não consumi-lo) termina o comando. Com + no fim (-exec COMANDO {} +) vários caminhos vão juntos num só comando. Para nomes com espaços ou quebras de linha, use -print0 (separa por caractere nulo) com xargs -0.',
            `$ find . -name '*.py' -exec wc -l {} \\;
1 ./src/main.py
1 ./src/util.py
$ find . -name '*.tmp' -print0 | xargs -0 ls -l   # seguro com espaços no nome`
          ),
          sl(
            'Ações destrutivas: teste antes com -print',
            '-delete e -exec rm apagam de verdade, sem lixeira. Procedimento seguro: 1) rode o find só com -print (ou sem ação) e CONFIRA a lista; 2) só então troque por -delete ou -exec rm. Com -delete, ponha-o por último: find pode apagar tudo antes de aplicar os filtros que vieram depois dele. Em dúvida, comece com -maxdepth 1 e um diretório de teste.',
            `$ find . -name '*.tmp' -print      # 1) olhe a lista
./tmp/com espaco.tmp
$ find . -name '*.tmp' -delete     # 2) agora apague
$ find . -name '*.tmp'             # (nada: foram apagados)`
          ),
          sl(
            'locate, which, type e grep -r',
            'locate nome consulta um banco de dados de nomes de arquivos (atualizado por updatedb, em geral automaticamente uma vez ao dia): é instantâneo, mas pode estar desatualizado. which e type dizem qual programa será executado para um nome: type também mostra se é builtin do shell (type cd: "cd is a shell builtin") e whereis acha binário, manual e fonte. Para procurar DENTRO dos arquivos use grep -r texto pasta; find procura pelo NOME e atributos.',
            `$ type ls
ls is /usr/bin/ls        # o caminho varia por sistema
$ type cd
cd is a shell builtin
$ grep -rn "main" .      # linhas que contêm main, em todos os arquivos`
          )
        ]
      },
      questions: [
        mcq('q1', 'Existem os arquivos notas.txt e Leia.TXT. Qual comando encontra os DOIS?', 'a', [
          'find . -iname \'*.txt\'',
          'find . -name \'*.txt\'',
          'find . -type f \'*.txt\'',
          'find . -name \'*.TXT\' -name \'*.txt\''
        ], '-iname ignora maiúsculas e minúsculas. -name distingue (acharia só notas.txt) e dois -name seguidos exigem que o mesmo nome case com os dois padrões.'),
        mcq('q2', 'Por que se escreve find . -name \'*.txt\' com aspas simples?', 'c', [
          'Porque o find só entende padrões com curinga quando estão entre aspas, senão dá erro',
          'Porque as aspas fazem a busca ignorar maiúsculas e minúsculas, como faz o -iname',
          'Para o shell não expandir o * antes de o find receber o padrão intacto',
          'Porque o * é um caractere proibido fora de aspas no Linux'
        ], 'Sem aspas, o shell troca *.txt pelos arquivos da pasta atual e o find recebe argumentos errados.'),
        mcq('q3', 'O que procura find /var/log -type f -size +100M -mtime +30?', 'd', [
          'Diretórios menores que 100 MB modificados nos últimos 30 dias, em qualquer profundidade',
          'Arquivos com mais de 100 MB OU modificados há mais de 30 dias',
          'Arquivos menores que 100 MB criados há exatamente 30 dias',
          'Arquivos comuns com mais de 100 MB e modificados há mais de 30 dias'
        ], 'Testes em sequência são combinados com E: arquivos comuns, maiores que 100 MB e modificados há mais de 30 dias.'),
        fill('q4', 'Complete para listar apenas diretórios (e não arquivos):', 'find . ___ d', ['-type'], '-type f seleciona arquivos comuns e -type d, diretórios.'),
        mcq('q5', 'O que faz find . -name \'*.py\' -exec wc -l {} \\; ?', 'b', [
          'Conta quantos arquivos .py existem e imprime só o total, sem listar os nomes',
          'Roda wc -l uma vez por arquivo .py encontrado, trocando {} pelo caminho',
          'Executa wc -l apenas no último arquivo encontrado',
          'Apaga os arquivos .py depois de contar suas linhas'
        ], '-exec roda o comando por resultado; {} vira o caminho e \\; encerra o comando.'),
        mcq('q6', 'Você quer apagar os arquivos .tmp antigos com find. Qual é o procedimento mais seguro?', 'c', [
          'Rodar logo com -delete, pois o find pede confirmação de cada arquivo',
          'Rodar com -exec rm -rf para garantir que nada fique para trás',
          'Rodar primeiro com -print, conferir a lista e só depois trocar por -delete',
          'Rodar como root para evitar mensagens de erro de permissão e garantir que tudo seja apagado'
        ], 'Não há confirmação nem lixeira. Primeiro liste (-print), confira e só depois apague.'),
        mcq('q7', 'Você quer achar todos os arquivos de um projeto que CONTÊM a palavra "timeout". O que usar?', 'a', [
          'grep -rn "timeout" .',
          'find . -name "timeout"',
          'locate timeout',
          'type timeout'
        ], 'grep -r procura dentro do conteúdo. find e locate buscam por nomes de arquivos, e type mostra qual programa um comando executa.'),
        fill('q8', 'Complete para listar só o conteúdo da pasta atual, sem entrar em subpastas:', 'find . -___ 1 -type f', ['maxdepth'], '-maxdepth 1 limita a busca à pasta dada.')
      ]
    },
    {
      id: 'lnb-20-sed-awk-basico',
      title: 'sed e awk básicos',
      goal: 'Transformar e extrair texto em linha de comando com sed (substituir, filtrar) e awk (colunas e contas).',
      xp: 20,
      intro: {
        slides: [
          sl(
            'sed: substituir com s/antigo/novo/',
            'sed (stream editor) lê o texto linha por linha, aplica comandos e imprime o resultado, SEM alterar o arquivo original (a saída vai para a tela). O comando mais usado é a substituição: s/antigo/novo/. Por padrão troca só a PRIMEIRA ocorrência de cada linha. O delimitador pode ser outro caractere (s#/usr/bin#/opt/bin#), útil quando o texto tem barras.',
            `$ cat a.txt
gato preto
cachorro gato
passaro azul
Gato cinza
$ sed 's/gato/lobo/' a.txt
lobo preto
cachorro lobo
passaro azul
Gato cinza`
          ),
          sl(
            'Flags g e i',
            'Depois da última barra vêm flags: g (global) troca TODAS as ocorrências de cada linha, e não só a primeira; i (no GNU sed, o de Linux) ignora maiúsculas e minúsculas. Elas podem ser combinadas (gi). Sem g, uma linha como "gato gato" vira "lobo gato".',
            `$ echo "gato gato" | sed 's/gato/lobo/'
lobo gato
$ echo "gato gato" | sed 's/gato/lobo/g'
lobo lobo
$ sed 's/gato/lobo/i' a.txt     # inclui a linha "Gato cinza"
lobo preto
cachorro lobo
passaro azul
lobo cinza`
          ),
          sl(
            '-n e p, e d: escolher linhas',
            'sed imprime todas as linhas por padrão. Com -n (silencioso) ele só imprime o que você mandar com o comando p. O comando d apaga (omite) linhas da saída. Você escolhe as linhas por número (2, 2,3, $ para a última) ou por padrão (/gato/). Resumo: sed -n \'/gato/p\' mostra SÓ as linhas com gato; sed \'/gato/d\' mostra TODAS menos essas.',
            `$ sed -n '2p' a.txt
cachorro gato
$ sed -n '/gato/p' a.txt
gato preto
cachorro gato
$ sed '/azul/d' a.txt
gato preto
cachorro gato
Gato cinza`
          ),
          sl(
            'sed -i: editar no lugar (com cuidado)',
            'Com -i o sed GRAVA o resultado no próprio arquivo, sem imprimir nada. É poderoso e perigoso: um padrão errado destrói o conteúdo sem desfazer. Use -i.bak: o sed guarda o original como a.txt.bak antes de alterar. Boa prática: primeiro rode sem -i e confira a saída; só depois aplique com backup.',
            `$ sed -i.bak 's/azul/verde/' a.txt
$ ls
a.txt  a.txt.bak
$ diff a.txt a.txt.bak
3c3
< passaro verde
---
> passaro azul`
          ),
          sl(
            'awk: colunas com $1, $2, -F',
            'awk lê linha por linha e divide cada uma em campos (por padrão, separados por espaços): $1 é o primeiro, $2 o segundo, $0 a linha inteira. O programa fica entre aspas simples, com o formato condição { ação }. -F define outro separador (-F: para dois-pontos, como em /etc/passwd). Dentro do print, vírgula coloca espaço entre os campos.',
            `$ cat v.txt
ana 10 sp
bia 20 rj
carlos 5 sp
$ awk '{print $1, $3}' v.txt
ana sp
bia rj
carlos sp
$ echo "ana:x:1000" | awk -F: '{print $1, $3}'
ana 1000`
          ),
          sl(
            'NR, NF e filtros por condição',
            'Variáveis embutidas: NR é o número da linha atual e NF o número de campos ($NF é o último campo). Uma condição antes das chaves filtra as linhas: awk \'$2 > 8\' imprime as linhas em que o segundo campo é maior que 8 (sem ação, imprime a linha inteira). Comparações de texto usam ==, com aspas: $3=="sp".',
            `$ awk 'NR==2' v.txt
bia 20 rj
$ awk '$2 > 8' v.txt
ana 10 sp
bia 20 rj
$ awk '$3=="sp" {print $1}' v.txt
ana
carlos
$ awk '{print $NF}' v.txt
sp
rj
sp`
          ),
          sl(
            'Somar uma coluna e escolher a ferramenta',
            'O bloco END roda uma vez, depois da última linha: ideal para totais. awk \'{s+=$2} END {print s}\' acumula o segundo campo de cada linha em s e imprime no fim; NR no END é o total de linhas, então s/NR é a média. Quando usar cada um: sed para substituir e cortar linhas em fluxo de texto; awk quando o dado tem COLUNAS ou precisa de contas; para casos complexos, uma linguagem de script como Python.',
            `$ awk '{s+=$2} END {print s}' v.txt
35
$ awk '{s+=$2} END {print "media:", s/NR}' v.txt
media: 11.6667`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime echo "gato e gato" | sed \'s/gato/lobo/\' ?', 'b', [
          'lobo e lobo',
          'lobo e gato',
          'gato e lobo',
          'gato e gato, pois o sed só mostra o que mudaria'
        ], 'Sem a flag g, a substituição afeta só a primeira ocorrência de cada linha.'),
        mcq('q2', 'Qual flag faz o s/// trocar TODAS as ocorrências de cada linha?', 'c', [
          'a, de "all"',
          'i, de "incluir todas"',
          'g, de "global"',
          'p, de "percorrer"'
        ], 'g (global) troca todas. i ignora maiúsculas/minúsculas e p é um comando de impressão, não um flag de s///.'),
        mcq('q3', 'Qual comando mostra SOMENTE as linhas de a.txt que contêm "gato"?', 'a', [
          'sed -n \'/gato/p\' a.txt # só as linhas com gato',
          'sed \'/gato/d\' a.txt',
          'sed -n \'s/gato/lobo/\' a.txt',
          'sed -n \'/gato/d\' a.txt'
        ], '-n silencia a impressão automática e p imprime as linhas que casam. O comando d, ao contrário, remove essas linhas.'),
        fill('q4', 'Complete para editar no lugar mantendo uma cópia de segurança com extensão .bak:', 'sed ___ \'s/azul/verde/\' a.txt', ['-i.bak', '-i .bak', '--in-place=.bak'], '-i.bak grava no arquivo e guarda o original como a.txt.bak, permitindo desfazer o erro.'),
        mcq('q5', 'Dado v.txt com as linhas "ana 10 sp", "bia 20 rj" e "carlos 5 sp", o que imprime awk \'{s+=$2} END {print s}\' v.txt?', 'd', [
          '10, o valor da primeira linha lida',
          '3, o número de linhas',
          '5, o valor da última linha',
          '35, a soma da segunda coluna (10 + 20 + 5)'
        ], 's+=$2 acumula o segundo campo de cada linha (10 + 20 + 5); o END imprime o total no fim.'),
        mcq('q6', 'O que imprime echo "ana:x:1000" | awk -F: \'{print $3}\' ?', 'b', [
          'ana',
          '1000',
          'x',
          'ana:x:1000'
        ], '-F: define dois-pontos como separador; o terceiro campo é 1000.'),
        mcq('q7', 'Com o mesmo v.txt, qual é a saída de awk \'$3=="sp" {print $1}\' v.txt?', 'c', [
          'sp e sp',
          'ana 10 sp e carlos 5 sp',
          'ana e carlos',
          'bia'
        ], 'A condição $3=="sp" filtra as linhas; a ação imprime o primeiro campo delas.'),
        fill('q8', 'Complete para imprimir só a 2ª linha do arquivo (variável de número da linha):', 'awk \'___==2\' v.txt', ['NR'], 'NR guarda o número da linha atual; uma condição sem ação imprime a linha inteira.')
      ]
    },
    {
      id: 'lnb-21-compactacao-backup-basico',
      title: 'Compactação e backup básico',
      goal: 'Empacotar, compactar e copiar arquivos com tar, gzip e rsync, e entender o básico de uma boa estratégia de backup.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'tar: empacotar arquivos',
            'tar junta muitos arquivos e pastas em UM arquivo (um "pacote", .tar), preservando estrutura e permissões. Ele não compacta por si só. As opções principais: -c cria, -x extrai, -t lista o conteúdo, -v mostra os nomes (verbose), -f ARQUIVO indica o nome do arquivo (e deve vir por último no grupo, pois o próximo texto é o nome). Exemplo: tar -cvf d.tar dados cria d.tar com a pasta dados.',
            `$ tar -cvf d.tar dados
dados/
dados/a.txt
dados/sub/
dados/sub/b.txt
$ tar -tf d.tar      # lista sem extrair
dados/
dados/a.txt
dados/sub/
dados/sub/b.txt`
          ),
          sl(
            'Compactação: z, j, J e extração com -C',
            'Junte uma opção de compressão ao tar: -z usa gzip (.tar.gz ou .tgz), -j usa bzip2 (.tar.bz2) e -J usa xz (.tar.xz). Em geral gzip é o mais rápido e xz comprime mais (e demora mais); o resultado depende dos dados. Para extrair em outra pasta use -C destino (a pasta precisa existir). No GNU tar (Linux), -x detecta a compressão sozinho, mas é boa prática escrever o z/j/J.',
            `$ tar -czvf d.tar.gz dados      # cria .tar.gz
$ mkdir rest
$ tar -xzvf d.tar.gz -C rest    # extrai dentro de rest/
$ ls rest
dados
$ tar -tzf d.tar.gz              # lista sem extrair`
          ),
          sl(
            'gzip, gunzip, bzip2, xz e zip/unzip',
            'gzip arquivo compacta UM arquivo e, por padrão, REMOVE o original e cria arquivo.gz (use -k para manter). gunzip desfaz. bzip2 e xz funcionam do mesmo jeito (arquivo.bz2, arquivo.xz; -k mantém o original). gzip -t arquivo.gz testa a integridade. Para trocar arquivos com usuários de Windows, o formato zip é comum: zip -r pasta.zip pasta cria e unzip pasta.zip -d destino extrai (os dois podem precisar ser instalados).',
            `$ gzip t.txt         # t.txt some, surge t.txt.gz
$ gunzip t.txt.gz    # volta o t.txt
$ gzip -k t.txt      # mantém t.txt e cria t.txt.gz
$ gzip -t t.txt.gz && echo integro
integro
$ zip -r pasta.zip pasta       # criar
$ unzip pasta.zip -d destino   # extrair`
          ),
          sl(
            'cp -a e rsync',
            'cp -a copia pastas preservando permissões, donos, datas e links (o "a" é de archive). rsync sincroniza origem e destino copiando só o que mudou, e funciona local ou pela rede. Opções básicas: -a (modo arquivo, recursivo e preserva atributos), -v (mostra o que faz), -n (simulação: não altera nada). Para backups incrementais é muito mais eficiente que copiar tudo de novo.',
            `$ cp -a dados copia
$ rsync -av dados/ /mnt/backup/dados/
$ rsync -avn dados/ /mnt/backup/dados/   # -n: só simula`
          ),
          sl(
            'Barra final e o perigo do --delete',
            'No rsync, a barra no fim da ORIGEM muda tudo: rsync -a origem/ destino/ copia o CONTEÚDO de origem para dentro de destino; rsync -a origem destino/ copia a própria pasta origem para dentro de destino (cria destino/origem). A opção --delete apaga no destino o que não existe mais na origem, deixando os dois idênticos. Se você inverter origem e destino, ou errar o caminho, apaga o que importa. Regra: rode primeiro com -n (e --delete) e leia a lista.',
            `$ rsync -avn --delete origem/ destino/
# "deleting arquivo-antigo.txt" aparece na simulação
$ rsync -av  --delete origem/ destino/   # só depois de conferir`
          ),
          sl(
            'Estratégia: 3-2-1 e testar a restauração',
            'Regra 3-2-1 em visão geral: 3 cópias dos dados (a original e 2 backups), em 2 tipos diferentes de mídia, com 1 cópia fora do local (outro prédio ou nuvem). Backup guardado no MESMO disco da origem não protege contra falha do disco, roubo, incêndio ou ransomware. Um backup que nunca foi restaurado é só uma esperança: teste a restauração de tempos em tempos (extraia numa pasta de teste e compare). Backups também contêm dados pessoais: guarde com acesso restrito e prazo de retenção.',
            `$ mkdir teste && tar -xzf d.tar.gz -C teste
$ diff -r dados teste/dados && echo restauracao-ok
restauracao-ok`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz o comando tar -czvf copia.tar.gz projeto ?', 'a', [
          'Cria copia.tar.gz compactado com gzip contendo projeto, listando os nomes dos arquivos',
          'Extrai copia.tar.gz dentro da pasta projeto, mostrando os nomes',
          'Lista o conteúdo de copia.tar.gz sem alterar nada, no formato longo',
          'Compacta projeto com bzip2 e apaga a pasta original ao terminar o processo'
        ], '-c cria, -z comprime com gzip, -v mostra o progresso e -f dá o nome do arquivo.'),
        mcq('q2', 'Qual comando mostra o que há dentro de d.tar.gz sem extrair nada?', 'c', [
          'tar -xzf d.tar.gz',
          'tar -czf d.tar.gz dados',
          'tar -tzf d.tar.gz | less',
          'gunzip d.tar.gz'
        ], '-t lista o conteúdo. -x extrairia e -c criaria um pacote novo; gunzip descompactaria o arquivo todo.'),
        mcq('q3', 'Depois de rodar gzip relatorio.txt, o que acontece com o relatorio.txt original?', 'd', [
          'Continua lá, e o .gz é só uma cópia dele',
          'Vai para a lixeira do sistema e pode ser recuperado dali',
          'É movido para /tmp e apagado no próximo reinício da máquina',
          'É removido: sobra só o .gz, a menos que se use -k'
        ], 'gzip substitui o original pelo .gz. Com -k (keep), os dois ficam.'),
        fill('q4', 'Complete para extrair backup.tar.gz dentro da pasta /tmp/restaura (que já existe):', 'tar -xzf backup.tar.gz ___ /tmp/restaura', ['-C'], '-C muda para a pasta indicada antes de extrair.'),
        mcq('q5', 'Qual é a diferença entre rsync -a origem/ destino/ e rsync -a origem destino/ ?', 'b', [
          'Nenhuma; a barra final é só estética e o resultado é idêntico nos dois casos',
          'Com a barra copia o conteúdo; sem a barra copia a própria pasta para dentro (cria destino/origem)',
          'Com a barra, apaga arquivos extras em destino; sem a barra, não apaga nada',
          'Com a barra, a cópia vai para a rede; sem a barra, fica local'
        ], 'A barra final na origem diz "copie o conteúdo". Sem ela, a própria pasta é copiada para dentro do destino.'),
        mcq('q6', 'Qual é o principal perigo de rsync -a --delete origem/ destino/ ?', 'd', [
          'Ele apaga a origem depois de copiar',
          'Ele apaga a pasta destino inteira antes de copiar, mesmo que nada tenha mudado na origem',
          'Ele só funciona como administrador do sistema',
          'Apaga do destino o que não existe na origem; um caminho trocado destrói dados que ainda eram necessários'
        ], '--delete deixa o destino idêntico à origem, removendo extras. Use -n antes para ver a lista do que seria apagado.'),
        mcq('q7', 'Qual prática torna um backup mais confiável?', 'a', [
          'Cópias em mídias e locais diferentes, e testar a restauração de vez em quando, sem depender do mesmo disco',
          'Guardar o backup em outra pasta do mesmo disco, que é mais rápido',
          'Compactar com xz, pois isso o torna imune a falhas do disco',
          'Deixar o backup com permissão 777 para que qualquer usuário consiga restaurar quando precisar'
        ], 'Regra 3-2-1 e teste de restauração. Mesmo disco não protege de falha de hardware, e permissão aberta expõe dados pessoais.'),
        fill('q8', 'Complete para criar um pacote compactado com gzip (opção de uma letra):', 'tar -c___f dados.tar.gz dados', ['z'], '-z usa gzip (-j bzip2, -J xz).')
      ]
    },
    {
      id: 'lnb-22-disco-armazenamento-basico',
      title: 'Disco e armazenamento',
      goal: 'Entender discos, partições e montagem, e saber verificar espaço livre e uso por pasta.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Discos, partições e nomes de dispositivo',
            'Um disco (HD, SSD, pen drive) é um dispositivo de blocos: o sistema lê e escreve em pedaços de tamanho fixo. O disco costuma ser dividido em partições, e cada partição recebe um sistema de arquivos. No Linux os dispositivos ficam em /dev: discos como /dev/sda, /dev/sdb (SATA/USB) ou /dev/nvme0n1 (NVMe); as partições têm número: /dev/sda1, /dev/nvme0n1p1. Atenção: a ordem das letras pode mudar ao ligar um pen drive; nunca decore o nome, confira antes.',
            `# nomes de exemplo (variam por máquina):
/dev/sda        disco inteiro
/dev/sda1       primeira partição do disco sda
/dev/nvme0n1p2  segunda partição do disco NVMe`
          ),
          sl(
            'lsblk: ver discos e partições',
            'lsblk lista os dispositivos de blocos em forma de árvore: NAME (nome), SIZE (tamanho), TYPE (disk = disco, part = partição) e MOUNTPOINTS (onde está montado, vazio se não estiver em uso). É o comando seguro para descobrir qual é o pen drive antes de qualquer operação perigosa. A saída abaixo é um EXEMPLO; a sua será diferente.',
            `$ lsblk
NAME   SIZE TYPE MOUNTPOINTS
sda    500G disk
├─sda1 512M part /boot/efi
└─sda2 499G part /
sdb     16G disk
└─sdb1  16G part /media/usuario/PENDRIVE`
          ),
          sl(
            'df -h: espaço por sistema de arquivos',
            'df (disk free) mostra, para cada sistema de arquivos montado, tamanho, usado, disponível e % de uso. -h deixa em unidades legíveis (K, M, G). df -h . mostra só o sistema de arquivos da pasta atual. Ele responde "quanto sobrou neste disco/partição?". Os valores abaixo são um exemplo.',
            `$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2       499G  120G  354G  26% /`
          ),
          sl(
            'du: quanto cada pasta ocupa',
            'du (disk usage) soma o espaço usado por arquivos e pastas. -s resume em um total, -h usa unidades legíveis, --max-depth=1 (ou -d 1) mostra o total de cada subpasta direta. Combine com sort -h para ordenar e achar o que ocupa mais: du -h --max-depth=1 | sort -h. df olha o disco todo; du olha o que está dentro de um caminho.',
            `$ du -sh /var/log
180M    /var/log
$ du -h --max-depth=1 /var | sort -h | tail -3   # exemplo: as 3 maiores`
          ),
          sl(
            'Montagem: mount, umount e /etc/fstab',
            'Para usar uma partição, o Linux a "monta" em um diretório vazio chamado ponto de montagem (por exemplo /mnt/dados ou /media/usuario/PENDRIVE): o conteúdo da partição aparece dentro daquela pasta. mount mostra e cria montagens (comandos de montar exigem root); umount DESMONTA, e deve ser feito antes de remover um pen drive, para que todos os dados pendentes sejam gravados. O arquivo /etc/fstab lista as montagens feitas no boot; aqui ele é só apresentado: um erro nele pode impedir o sistema de iniciar, então só edite com backup e depois de estudar o formato.',
            `$ sudo mount /dev/sdb1 /mnt/dados     # exemplo: exige root
$ ls /mnt/dados
$ sudo umount /mnt/dados             # ou: umount /dev/sdb1`
          ),
          sl(
            'Sistemas de arquivos comuns e inodes',
            'O sistema de arquivos define como os dados são organizados no disco. Comuns no Linux: ext4 (muito usado, estável), xfs (comum em servidores) e btrfs (recursos como snapshots). FAT/exFAT e NTFS aparecem em pen drives e discos compartilhados com Windows. Cada arquivo também consome um inode (a ficha com seus metadados); o número de inodes é limitado. Se houver milhões de arquivos minúsculos, o "disco cheio" pode ser de inodes, mesmo com espaço sobrando: df -h mostra espaço e df -i mostra inodes.',
            `$ df -i /
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
/dev/sda2     32768000 400000 32368000    2% /   # exemplo`
          ),
          sl(
            'Perigo: dd e mkfs apagam discos',
            'Comandos como mkfs (cria um sistema de arquivos, apagando o que havia) e dd (copia blocos crus, inclusive por cima de um disco inteiro) não pedem confirmação e não têm desfazer. Trocar sdb por sda pode destruir o sistema. Antes de qualquer comando destrutivo em disco: rode lsblk, confira o tamanho e o ponto de montagem do dispositivo, confirme que ele está desmontado e releia o comando. Nesta trilha você só conhece o risco: não precisa (nem deve) executá-los agora.',
            `# NÃO execute: exemplo do perigo
# dd if=imagem.iso of=/dev/sda     <- sobrescreve o disco do sistema!
# Antes, SEMPRE:
$ lsblk`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre df -h e du -sh pasta ?', 'c', [
          'df -h lista os arquivos apagados e du -sh lista os arquivos existentes dentro de cada pasta',
          'df -h só funciona em pen drives montados, enquanto du -sh funciona nos discos internos',
          'df -h mostra o espaço por sistema de arquivos; du -sh, quanto uma pasta ocupa',
          'Nenhuma; são nomes diferentes do mesmo comando'
        ], 'df olha o sistema de arquivos montado (quanto sobra); du soma o conteúdo de um caminho (quanto ocupa).'),
        mcq('q2', 'Numa saída de lsblk aparece sdb1 do tipo part, com 16G e MOUNTPOINTS /media/usuario/PENDRIVE. O que isso indica?', 'a', [
          'É uma partição do disco sdb, atualmente montada nessa pasta, como /media/usuario/PENDRIVE',
          'É um disco inteiro sem partições, que ainda não foi montado em nenhuma pasta',
          'É o disco principal do sistema, montado na raiz',
          'É uma pasta de 16 GB criada por um usuário'
        ], 'sdb1 é a primeira partição do disco sdb (tipo part), e o MOUNTPOINTS informa onde ela está montada.'),
        mcq('q3', 'Ao salvar um arquivo você recebe "No space left on device", mas df -h mostra espaço livre. O que verificar?', 'b', [
          'Se o arquivo que você tenta salvar é maior que 4 GB, o limite de alguns formatos',
          'O uso de inodes com df -i, pois muitos arquivos pequenos os esgotam, mesmo com espaço livre',
          'Se o pen drive está formatado em NTFS e não em ext4',
          'O uso de memória com ps'
        ], 'Cada arquivo consome um inode; esgotá-los gera "disco cheio" mesmo com bytes livres.'),
        fill('q4', 'Complete para mostrar o espaço do disco em unidades legíveis (K, M, G):', 'df ___ /', ['-h'], '-h (human-readable) formata os tamanhos.'),
        mcq('q5', 'Por que se usa umount antes de retirar um pen drive?', 'd', [
          'Para o pen drive ser apagado e reformatado automaticamente pelo sistema ao ser desmontado',
          'Para o Linux copiar o pen drive para o disco principal',
          'Para liberar o ponto de montagem em outro computador',
          'Para que todos os dados pendentes sejam gravados, sempre antes de remover o dispositivo'
        ], 'O sistema usa cache de escrita; desmontar garante que tudo foi gravado antes da remoção.'),
        mcq('q6', 'Qual afirmação sobre o /etc/fstab está correta?', 'c', [
          'Guarda o histórico de arquivos apagados em cada disco, para uma eventual recuperação',
          'Mostra o espaço livre de cada partição e o uso de inodes de cada pasta',
          'Lista as montagens feitas no boot; um erro nele pode impedir a inicialização normal do sistema',
          'É um programa que formata discos e cria as tabelas de partição'
        ], '/etc/fstab é um arquivo de configuração de montagens. Edite apenas com backup e cuidado.'),
        mcq('q7', 'Antes de usar dd ou mkfs em um dispositivo, qual é o cuidado essencial?', 'a', [
          'Sempre rodar lsblk, conferir tamanho e montagem e reler o comando: não há desfazer nem lixeira',
          'Rodar o comando com sudo e conferir depois se o dispositivo certo foi afetado',
          'Escolher o dispositivo pelo nome que tinha da última vez, como /dev/sdb',
          'Rodar dentro do diretório home para limitar os danos'
        ], 'Letras de dispositivo mudam; confirme o alvo com lsblk. Esses comandos sobrescrevem dados sem confirmação.'),
        fill('q8', 'Complete para listar o tamanho de cada subpasta direta (um nível):', 'du -h --___=1', ['max-depth'], '--max-depth=1 mostra o total de cada subpasta direta.')
      ]
    },
    {
      id: 'lnb-23-rede-basica',
      title: 'Rede básica no Linux',
      goal: 'Inspecionar a rede da máquina: endereços, rotas, DNS, portas em escuta, e fazer requisições simples.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ip addr: endereços da máquina',
            'ip addr (ou ip a) lista as interfaces de rede e seus endereços. Cada interface (lo é a de loopback, a própria máquina; eth0, enp3s0, wlan0... são as reais, os nomes variam) mostra um endereço inet (IPv4) e/ou inet6 (IPv6). O número depois da barra (/24) é o tamanho da máscara de rede. Os endereços de exemplo desta lição são os reservados para documentação (192.0.2.x, 198.51.100.x, 203.0.113.x); a saída real varia por máquina.',
            `$ ip addr
2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
    inet 192.0.2.10/24 brd 192.0.2.255 scope global enp3s0
# exemplo: IP 192.0.2.10, máscara /24`
          ),
          sl(
            'ip route, gateway, ping e hostname',
            'ip route mostra a tabela de rotas; a linha "default via ..." indica o gateway (roteador por onde sai o tráfego para fora da rede local). ping testa se outro host responde: no Linux ele envia pacotes sem parar até você teclar Ctrl+C; com -c 4 envia só 4. hostname mostra o nome da máquina. Sem resposta ao ping não significa que o host esteja fora: alguns firewalls bloqueiam esse teste.',
            `$ ip route
default via 192.0.2.1 dev enp3s0       # exemplo
192.0.2.0/24 dev enp3s0 proto kernel scope link src 192.0.2.10
$ ping -c 4 192.0.2.1
$ hostname
servidor01                              # exemplo`
          ),
          sl(
            'Nomes e DNS: /etc/hosts e /etc/resolv.conf',
            'Computadores se falam por número IP; o DNS traduz nomes (como example.org) em IPs. Antes de perguntar ao DNS, o sistema consulta o arquivo /etc/hosts: pares "IP nome" mantidos à mão (útil para testes locais). Depois usa os servidores DNS indicados em /etc/resolv.conf (linhas nameserver ...); em muitas distribuições modernas esse arquivo é gerenciado automaticamente, então não edite à mão sem saber o que gerencia a rede. Para consultar o DNS diretamente use dig, nslookup ou host.',
            `$ cat /etc/hosts
127.0.0.1   localhost
192.0.2.50  servidor-teste      # exemplo
$ cat /etc/resolv.conf
nameserver 192.0.2.53          # exemplo
$ dig example.org              # consulta DNS (pode precisar instalar o pacote)`
          ),
          sl(
            'curl e wget',
            'curl faz requisições a URLs e IMPRIME a resposta no terminal (-I mostra só os cabeçalhos; -o arquivo salva em arquivo; -L segue redirecionamentos). wget baixa e SALVA o arquivo por padrão. São a forma de testar APIs e baixar arquivos sem navegador. Atenção: não execute o que baixar sem inspecionar (veja a lição de segurança).',
            `$ curl -I https://example.org      # só cabeçalhos
$ curl -o pagina.html https://example.org
$ wget https://example.org/arquivo.zip   # salva arquivo.zip`
          ),
          sl(
            'ss: quem está escutando em quais portas',
            'Um serviço "escuta" em uma porta (número de 1 a 65535) esperando conexões. ss -tulpn lista: t (TCP), u (UDP), l (apenas em escuta), p (processo dono; precisa de sudo para ver de todos) e n (números em vez de nomes). Endereço 127.0.0.1 significa "só esta máquina"; 0.0.0.0 ou * significa "qualquer interface". Esta lista é a base para saber o que está exposto. Exemplo ilustrativo.',
            `$ sudo ss -tulpn
Netid State  Local Address:Port  Process
tcp   LISTEN 0.0.0.0:22          users:(("sshd",...))
tcp   LISTEN 127.0.0.1:5432      users:(("postgres",...))`
          ),
          sl(
            'ifconfig (legado), portas privilegiadas',
            'ifconfig e netstat são ferramentas antigas (pacote net-tools) que muitas distribuições não instalam mais por padrão; ip e ss são os substitutos atuais. Você ainda os verá em tutoriais antigos. Portas abaixo de 1024 (80 para HTTP, 443 para HTTPS, 22 para SSH) são privilegiadas: um serviço rodado por usuário comum não consegue escutar nelas ("Permission denied"). Serviços de produção costumam ser iniciados pelo administrador (systemd) ou ficam atrás de um proxy; para desenvolver, use portas altas (3000, 8080).',
            `# antigo -> atual
ifconfig   ->  ip addr
route      ->  ip route
netstat    ->  ss`
          )
        ]
      },
      questions: [
        mcq('q1', 'Na saída de ip addr aparece "inet 192.0.2.10/24". O que significa?', 'b', [
          'A máquina tem o IP 192.0.2.10 e usa a porta 24',
          'O IPv4 da interface é 192.0.2.10, numa rede com máscara /24 (os 24 primeiros bits)',
          'O IP 192.0.2.10 é o do gateway e /24 é o número da rota padrão',
          'A máquina é a de número 24 da rede 192.0.2.10'
        ], 'inet é o endereço IPv4; o número após a barra (/24) é o tamanho da máscara, que define a rede.'),
        mcq('q2', 'Na saída de ip route, a linha "default via 192.0.2.1 dev enp3s0" indica...', 'c', [
          'Que 192.0.2.1 é o servidor DNS padrão da máquina',
          'Que a máquina só aceita conexões que venham de 192.0.2.1 e de mais ninguém',
          'O tráfego para fora da rede local sai pelo gateway 192.0.2.1 (o roteador da rede local)',
          'Que a interface enp3s0 está desativada'
        ], 'A rota default aponta o gateway usado quando nenhum caminho mais específico existe.'),
        mcq('q3', 'No Linux, o que acontece com ping 192.0.2.1 (sem outras opções)?', 'd', [
          'Envia exatamente 4 pacotes e termina sozinho, como o ping do Windows faz por padrão',
          'Envia um pacote e mostra se o host existe',
          'Abre o site do host no navegador',
          'Envia pacotes até ser interrompido com Ctrl+C; -c N limita a quantidade'
        ], 'Diferente do Windows, o ping do Linux continua até Ctrl+C. Use -c para limitar.'),
        fill('q4', 'Complete para listar as portas em escuta TCP/UDP com processo e números:', 'ss -___', ['tulpn', '-tulpn'], 't (tcp) u (udp) l (listening) p (processo) n (numérico).'),
        mcq('q5', 'Quando você acessa example.org, qual é a ordem típica de consulta de nomes?', 'a', [
          'Primeiro o /etc/hosts; se não achar, os DNS de /etc/resolv.conf (ordem definida em nsswitch.conf)',
          'Primeiro o DNS; o /etc/hosts só é lido se a internet estiver fora do ar',
          'Só o /etc/resolv.conf, que guarda todos os nomes',
          'Só o /etc/hosts, que é atualizado pelo gateway'
        ], '/etc/hosts é consultado antes; depois entram os DNS configurados (resolv.conf). A ordem real é definida em /etc/nsswitch.conf e é essa na maioria dos casos.'),
        mcq('q6', 'Qual a diferença de comportamento padrão entre curl URL e wget URL?', 'b', [
          'curl só funciona com HTTP e wget só com HTTPS',
          'curl imprime a resposta no terminal; wget salva em arquivo (curl só salva com -o)',
          'curl salva em arquivo e wget imprime no terminal, por padrão',
          'Não há diferença; ambos fazem exatamente o mesmo'
        ], 'curl escreve a resposta na saída padrão (use -o para salvar). wget salva um arquivo por padrão.'),
        mcq('q7', 'Um usuário comum tenta subir seu app na porta 80 e recebe "Permission denied". O que explica?', 'c', [
          'A porta 80 só existe em servidores que têm um servidor web instalado por apt ou dnf',
          'O DNS não resolveu o nome do servidor',
          'Portas abaixo de 1024 exigem privilégio; para desenvolver, use uma porta alta',
          'O firewall do roteador bloqueou a porta 80 para conexões vindas da internet'
        ], 'Escutar em portas < 1024 exige privilégio. Em desenvolvimento use portas como 3000 ou 8080.'),
        fill('q8', 'Complete com a forma curta do comando que lista os endereços das interfaces:', 'ip ___', ['a', 'addr', 'address'], 'ip addr (ip a) substituiu o ifconfig.')
      ]
    },
    {
      id: 'lnb-24-ssh-acesso-remoto',
      title: 'SSH e acesso remoto',
      goal: 'Conectar-se a servidores com SSH de forma segura, usando chaves, e copiar arquivos pela rede.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é SSH e como conectar',
            'SSH (Secure Shell) abre um terminal em OUTRA máquina por um canal criptografado: o que você digita e o que volta não pode ser lido por quem está no meio do caminho. É a forma padrão de administrar servidores Linux. Sintaxe: ssh usuario@host. A porta padrão é a 22; se o servidor usar outra, informe com -p. Os hosts de exemplo usam endereços de documentação.',
            `$ ssh ana@192.0.2.10            # usuário ana, porta 22
$ ssh -p 2222 ana@192.0.2.10    # servidor numa porta diferente
$ exit                          # encerra a sessão remota`
          ),
          sl(
            'Primeira conexão e known_hosts',
            'Na primeira vez, o SSH mostra a impressão digital (fingerprint) da chave do SERVIDOR e pergunta se você confia. Isso protege contra alguém se passando pelo servidor. O correto é comparar a impressão digital com a informada por um canal confiável (o painel do provedor ou o administrador) antes de digitar yes. Ao aceitar, ela é guardada em ~/.ssh/known_hosts e nas próximas vezes o SSH confere sozinho.',
            `The authenticity of host '192.0.2.10 (192.0.2.10)' can't be established.
ED25519 key fingerprint is SHA256:<impressao-digital-do-servidor>.
Are you sure you want to continue connecting (yes/no/[fingerprint])?`
          ),
          sl(
            'Aviso de chave do host alterada',
            'Se a chave do servidor for diferente da guardada em known_hosts, o SSH exibe "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!" e se recusa a conectar. Pode ser algo legítimo (servidor reinstalado) ou um ataque de interceptação. NÃO ignore: descubra o motivo falando com o administrador. Só depois de confirmar que a troca é legítima remova a entrada antiga com ssh-keygen -R host e aceite a nova impressão digital.',
            `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
# só após confirmar que a mudança é legítima:
$ ssh-keygen -R 192.0.2.10`
          ),
          sl(
            'Chaves: privada e pública',
            'Em vez de senha, use um par de chaves. A chave PRIVADA fica só com você e jamais é compartilhada; a PÚBLICA (arquivo .pub) pode ser entregue a qualquer servidor. Quem tem a pública verifica uma assinatura que só a privada produz. Gere o par com ssh-keygen -t ed25519 (algoritmo moderno e curto); defina uma frase secreta (passphrase) para proteger a privada caso o arquivo vaze. Os arquivos ficam em ~/.ssh: id_ed25519 (privada) e id_ed25519.pub (pública).',
            `$ ssh-keygen -t ed25519 -C "notebook-ana"
Enter passphrase (empty for no passphrase): <frase-secreta>
$ ls ~/.ssh
id_ed25519  id_ed25519.pub`
          ),
          sl(
            'authorized_keys, permissões e ssh-copy-id',
            'Para entrar sem senha, a chave pública vai numa linha do arquivo ~/.ssh/authorized_keys do usuário NO SERVIDOR. ssh-copy-id usuario@host faz isso por você (usa a senha uma última vez). O SSH é rigoroso com permissões: a pasta ~/.ssh deve ser 700, authorized_keys 600 e a chave privada 600; se a privada estiver aberta demais, o SSH recusa com "UNPROTECTED PRIVATE KEY FILE!".',
            `$ ssh-copy-id ana@192.0.2.10
$ chmod 700 ~/.ssh
$ chmod 600 ~/.ssh/id_ed25519 ~/.ssh/authorized_keys
$ ssh ana@192.0.2.10        # agora usa a chave`
          ),
          sl(
            'scp, rsync -e ssh e ssh-agent',
            'scp copia arquivos pelo SSH: scp origem destino, onde o lado remoto é usuario@host:caminho. rsync -e ssh sincroniza pelo SSH (só envia as diferenças; rsync também usa SSH por padrão para destinos remotos). O ssh-agent guarda sua chave privada desbloqueada em memória durante a sessão (ssh-add), para você não digitar a frase secreta a cada conexão.',
            `$ scp relatorio.txt ana@192.0.2.10:/tmp/       # local -> remoto
$ scp ana@192.0.2.10:/tmp/log.txt .            # remoto -> local
$ rsync -av -e ssh pasta/ ana@192.0.2.10:/srv/backup/pasta/
$ ssh-add ~/.ssh/id_ed25519                    # carrega a chave no agent`
          ),
          sl(
            'Boas práticas em servidores',
            'Nunca compartilhe, envie por e-mail/chat ou versione a chave privada (nem em repositórios). Use frase secreta. Prefira chaves a senhas, que podem ser adivinhadas em ataques automáticos. No servidor, o conceito de endurecimento é: desativar o login direto do root e desativar a autenticação por senha (no arquivo /etc/ssh/sshd_config, mantendo uma sessão aberta ao testar para não se trancar para fora). Um comprometimento de chave dá acesso à máquina: se suspeitar, remova a pública do servidor e gere outra. Não ignore avisos do SSH.',
            `# conceito, em /etc/ssh/sshd_config do servidor (confira o manual):
PermitRootLogin no
PasswordAuthentication no
# depois de editar: recarregue o serviço sshd e teste em OUTRA sessão`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o SSH e qual é a porta padrão dele?', 'd', [
          'Um sistema de arquivos de rede usado para montar pastas remotas, na porta 21',
          'Um protocolo de e-mail usado para enviar mensagens entre servidores, porta 25',
          'Um navegador de terminal que usa a porta 80',
          'Um protocolo de terminal remoto com tráfego criptografado, na porta 22'
        ], 'SSH dá acesso remoto seguro, normalmente na porta 22 (-p muda a porta).'),
        mcq('q2', 'Na primeira conexão o SSH mostra a impressão digital do servidor. O que fazer?', 'a', [
          'Comparar com a impressão digital oficial, por canal confiável, antes do yes e só então aceitar',
          'Digitar yes imediatamente, pois o aviso aparece em toda conexão e é só burocracia',
          'Cancelar e usar telnet, que não pede confirmação',
          'Enviar a impressão digital para o servidor por e-mail'
        ], 'A impressão digital permite verificar que você fala com o servidor certo. Depois de aceita, vai para known_hosts.'),
        mcq('q3', 'Qual arquivo você deve copiar para o servidor para entrar sem senha?', 'c', [
          'A chave privada, id_ed25519, que o servidor usa para conferir quem você é',
          'O arquivo known_hosts do seu computador, com as impressões digitais',
          'Somente a pública, id_ed25519.pub, em ~/.ssh/authorized_keys',
          'Qualquer um dos dois, desde que o arquivo tenha permissão 600'
        ], 'Só a pública vai para o servidor. A privada nunca sai do seu computador.'),
        fill('q4', 'Complete para gerar uma chave com o algoritmo moderno recomendado:', 'ssh-keygen -t ___', ['ed25519'], 'ed25519 é curto, rápido e considerado seguro.'),
        mcq('q5', 'Qual conjunto de práticas fortalece um servidor SSH?', 'b', [
          'Permitir senhas simples para facilitar o acesso e liberar o root direto para economizar tempo',
          'Chaves com frase secreta; sem root nem senha no SSH',
          'Compartilhar uma chave privada com toda a equipe para facilitar o acesso',
          'Desativar o known_hosts para não aparecerem avisos'
        ], 'Chaves + frase secreta; sem root direto e sem senha; sempre mantendo uma sessão aberta ao mexer em sshd_config.'),
        mcq('q6', 'Ao conectar aparece "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!". Qual é a atitude correta?', 'd', [
          'Apagar o arquivo known_hosts inteiro e conectar de novo, aceitando a nova chave',
          'Ignorar, pois o aviso é um erro comum de rede',
          'Reinstalar o cliente SSH e gerar de novo todas as suas chaves',
          'Investigar antes e remover a entrada somente se a mudança for legítima'
        ], 'A mudança pode indicar reinstalação ou ataque. Confirme antes de remover a entrada antiga.'),
        mcq('q7', 'O que faz scp relatorio.txt ana@192.0.2.10:/tmp/ ?', 'b', [
          'Baixa o conteúdo de /tmp do servidor para a pasta atual do computador local',
          'Copia o relatorio.txt local para /tmp no servidor, via SSH, onde o : separa host e caminho',
          'Abre um terminal remoto e executa o relatorio.txt',
          'Move relatorio.txt para o servidor e apaga o original'
        ], 'O primeiro argumento é a origem e o segundo, o destino; usuario@host:caminho indica o lado remoto.'),
        fill('q8', 'Complete com a permissão numérica correta para a chave privada:', 'chmod ___ ~/.ssh/id_ed25519', ['600', 'u=rw,go=', 'u=rw'], '600 = só o dono lê e escreve. O SSH recusa chaves privadas legíveis por outros.')
      ]
    },
    {
      id: 'lnb-25-logs-diagnostico-basico',
      title: 'Logs e diagnóstico básico',
      goal: 'Encontrar e ler logs do sistema para entender o que aconteceu, com cuidado com dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que servem os logs e onde ficam',
            'Logs são registros de eventos: início de serviços, erros, tentativas de login, mudanças. São a primeira fonte para responder "o que aconteceu, quando e por quê?". Tradicionalmente ficam em arquivos de texto em /var/log; em sistemas com systemd há também o journal, consultado com journalctl. O que existe e os nomes variam por distribuição; ler logs geralmente exige sudo ou participar de um grupo específico.',
            `$ ls /var/log          # exemplo (varia por distribuição)
auth.log  dmesg  syslog  nginx/  ...`
          ),
          sl(
            'Arquivos comuns em /var/log',
            'syslog (Debian/Ubuntu) ou messages (família Red Hat): mensagens gerais do sistema. auth.log (Debian/Ubuntu) ou secure (Red Hat): logins, sudo e falhas de autenticação. dmesg: mensagens do kernel, principalmente hardware e drivers (comando dmesg; pode exigir sudo). Serviços como nginx ou apache criam suas próprias pastas com access.log e error.log. Em distribuições que só usam o journal, alguns desses arquivos podem não existir.',
            `$ sudo tail -n 5 /var/log/auth.log     # exemplo Debian/Ubuntu
$ sudo dmesg | tail -n 5               # eventos recentes do kernel/hardware`
          ),
          sl(
            'journalctl: o journal do systemd',
            'journalctl lê o journal. Opções úteis: -u nome (só um serviço), -f (segue novas linhas ao vivo, como tail -f), -b (apenas desde o boot atual), --since "2 hours ago" ou --since today (a partir de um momento), -p err (apenas prioridade erro ou mais grave). Combine à vontade. Dentro do pager, q sai. A saída depende da máquina.',
            `$ journalctl -u nginx -f              # acompanha o serviço nginx
$ journalctl -b -p err                # erros desde o boot atual
$ journalctl -u ssh --since today     # exemplo: nome do serviço varia (ssh/sshd)`
          ),
          sl(
            'tail -f, grep e less em logs',
            'Para arquivos: tail -n 20 arquivo mostra as últimas 20 linhas; tail -f acompanha o arquivo ao vivo (Ctrl+C para sair); grep filtra (grep -i erro, grep "Failed password"); less permite navegar (/ busca, q sai). Pipelines combinam tudo: tail -f arquivo | grep erro mostra só as novas linhas com erro.',
            `$ tail -f /var/log/nginx/error.log | grep -i erro
$ grep -c "Failed password" /var/log/auth.log   # conta tentativas falhas (exemplo)`
          ),
          sl(
            'Ler uma mensagem de erro: o quê, onde, por quê',
            'Uma boa mensagem diz O QUE falhou, ONDE (arquivo, linha, serviço) e muitas vezes POR QUÊ. Leia com calma e comece pelo fim, onde costuma estar a causa final. Exemplo: "Failed to bind 0.0.0.0:80: Permission denied" = o serviço não conseguiu escutar na porta 80 (o quê) por falta de permissão (por quê); portas abaixo de 1024 são privilegiadas. "No such file or directory" = caminho errado ou arquivo ausente. Procure a PRIMEIRA mensagem de erro de uma sequência: as seguintes costumam ser consequência.',
            `nginx: [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)
# o quê: bind na porta 80 | por quê: Permission denied (rodando sem privilégio)`
          ),
          sl(
            'Rotação de logs e dmesg',
            'Logs crescem sem parar e podem encher o disco; por isso existe a rotação (ferramentas como logrotate): arquivos antigos são renomeados (syslog.1, syslog.2.gz), compactados e, depois de um prazo, apagados. Isso também define a retenção. dmesg mostra o buffer de mensagens do kernel: útil para erros de disco, USB ou placa de rede (por exemplo, ao conectar um pen drive).',
            `$ ls /var/log/syslog*     # exemplo
/var/log/syslog  /var/log/syslog.1  /var/log/syslog.2.gz`
          ),
          sl(
            'Privacidade e LGPD nos logs',
            'Logs guardam endereços IP, nomes de usuário, horários e, às vezes, dados pessoais que escapam em mensagens (e-mails, URLs com parâmetros, nomes). Pela LGPD, isso pode ser dado pessoal: dê acesso apenas a quem precisa, limite a retenção ao necessário (rotação com prazo), evite registrar dados sensíveis (senhas, tokens, documentos) e cuidado ao compartilhar logs em chamados ou fóruns: anonimize antes. Isto é orientação geral e não substitui consulta jurídica.',
            `# permissões típicas de um log: dono root, leitura restrita
-rw-r----- 1 root adm ... auth.log      # exemplo
# ao compartilhar: troque IPs, nomes e tokens por <placeholders>`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando mostra as mensagens do kernel, como as relacionadas a hardware e drivers?', 'c', [
          'journalctl -u nginx',
          'grep kernel /etc/passwd',
          'dmesg',
          'tail /var/log/auth.log'
        ], 'dmesg exibe o buffer do kernel (hardware, drivers, USB...). auth.log registra autenticação.'),
        mcq('q2', 'Você quer investigar tentativas de login (inclusive falhas) em um servidor Debian/Ubuntu. Onde olhar?', 'a', [
          '/var/log/auth.log (ou secure na família Red Hat), onde o sudo também deixa registro',
          '/var/log/dmesg, que guarda os logins feitos pela rede',
          '/etc/passwd, que registra as tentativas',
          '/tmp, onde o SSH guarda seus relatórios'
        ], 'auth.log (Debian/Ubuntu) ou secure (Red Hat) registram autenticação e sudo.'),
        mcq('q3', 'O que faz journalctl -u nginx -f ?', 'd', [
          'Apaga os logs do nginx depois de lê-los',
          'Mostra só os 10 primeiros registros do nginx',
          'Mostra os logs de todos os serviços, exceto o nginx, e depois encerra o comando',
          'Mostra os logs do nginx e continua acompanhando novas linhas como faz o tail -f em arquivos'
        ], '-u filtra pela unidade e -f (follow) segue ao vivo, como tail -f.'),
        fill('q4', 'Complete para acompanhar ao vivo as novas linhas do arquivo de log:', 'tail ___ /var/log/syslog', ['-f'], 'tail -f segue o arquivo e imprime linhas novas (Ctrl+C sai).'),
        mcq('q5', 'Qual comando mostra apenas mensagens de erro (ou mais graves) desde o boot atual?', 'b', [
          'journalctl --since boot -u erro',
          'journalctl -b -p err',
          'journalctl -f -p boot',
          'dmesg -u err'
        ], '-b limita ao boot atual e -p err filtra por prioridade.'),
        mcq('q6', 'O log mostra "bind() to 0.0.0.0:80 failed (13: Permission denied)". Qual é a leitura correta?', 'c', [
          'A porta 80 não existe neste computador, pois nenhum serviço a criou',
          'O disco está cheio e não há espaço para gravar o log nem os arquivos do serviço',
          'Falhou ao escutar na porta 80 por falta de privilégio (porta abaixo de 1024), não um erro de rede',
          'O DNS não resolveu o nome do servidor'
        ], 'O quê: falhou ao escutar na porta 80; por quê: Permission denied (portas < 1024 exigem privilégio).'),
        mcq('q7', 'Por que logs merecem cuidado do ponto de vista da LGPD?', 'a', [
          'Podem conter dados pessoais (IPs, usuários)',
          'São públicos por natureza e podem ser publicados em fóruns sem nenhum tratamento prévio',
          'Só contêm dados técnicos e nunca dados pessoais',
          'Devem ser mantidos para sempre para garantir a segurança'
        ], 'Logs podem trazer dados pessoais. Mínimo necessário, acesso restrito e prazo de guarda definido.'),
        fill('q8', 'Complete para ver os logs do nginx apenas a partir de hoje:', 'journalctl -u nginx --___ today', ['since'], '--since limita ao período a partir do momento indicado (today, "2 hours ago"...).')
      ]
    },
    {
      id: 'lnb-26-systemd-servicos-basico',
      title: 'Serviços e systemd',
      goal: 'Gerenciar serviços com systemctl: iniciar, parar, habilitar no boot e ler o status.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Serviços (daemons) e o systemd',
            'Um serviço (ou daemon) é um programa que roda em segundo plano, sem terminal, oferecendo uma função: servidor web (nginx), SSH (sshd), agendador (cron), banco de dados. Na maioria das distribuições atuais, o systemd é o gerenciador que inicia o sistema e controla esses serviços. Cada serviço é descrito por uma unidade (arquivo .service, como nginx.service). O comando de controle é o systemctl. Aqui, as saídas são exemplos típicos e variam por distribuição e máquina.',
            `$ systemctl status nginx
# nginx.service é a unidade; o ".service" pode ser omitido`
          ),
          sl(
            'start, stop, restart, reload e status',
            'systemctl start liga o serviço agora; stop desliga; restart desliga e liga de novo (derruba conexões por um instante); reload pede ao serviço que releia a configuração sem parar (nem todo serviço suporta); status mostra se está ativo e as últimas linhas de log. Para mudar o estado normalmente é preciso sudo.',
            `$ sudo systemctl start nginx
$ sudo systemctl stop nginx
$ sudo systemctl restart nginx    # parar e iniciar
$ sudo systemctl reload nginx     # reler configuração, sem parar
$ systemctl status nginx`
          ),
          sl(
            'enable e disable: iniciar no boot',
            'start/stop mexem no estado AGORA e não sobrevivem a um reinício da máquina. enable configura o serviço para iniciar automaticamente no boot (mas não o liga agora); disable remove esse comportamento. Para os dois efeitos de uma vez: systemctl enable --now nome. Sempre pense em duas perguntas: "está rodando agora?" e "vai subir no boot?".',
            `$ sudo systemctl enable nginx         # inicia no boot (não liga agora)
$ sudo systemctl enable --now nginx   # liga agora E habilita
$ sudo systemctl disable nginx        # não inicia mais no boot`
          ),
          sl(
            'Lendo a saída do status',
            'Linhas importantes: Loaded mostra a unidade e se está enabled ou disabled (boot); Active mostra o estado atual: active (running) = funcionando, inactive (dead) = parado, failed = tentou rodar e falhou. Abaixo vêm as últimas linhas de log, onde costuma estar o motivo de uma falha. Exemplo ilustrativo (a sua será diferente):',
            `$ systemctl status nginx
● nginx.service - A high performance web server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; ...)
     Active: active (running) since ...
   Main PID: 1234 (nginx)`
          ),
          sl(
            'is-active, list-units e journalctl -u',
            'systemctl is-active nome imprime active (ou inactive/failed) e devolve código 0 se estiver ativo, o que o torna útil em scripts. systemctl list-units --type=service lista os serviços carregados. journalctl -u nome mostra todo o log daquele serviço, bem mais do que as linhas do status. Fluxo de diagnóstico: status, depois journalctl -u, depois a configuração.',
            `$ systemctl is-active nginx
active
$ systemctl list-units --type=service      # lista (muito longa)
$ journalctl -u nginx -n 20                # últimas 20 linhas do log`
          ),
          sl(
            'Serviços comuns e o comando service',
            'Serviços que você encontrará: ssh (ou sshd, conforme a distribuição), cron (ou crond), nginx, apache2/httpd, mysql/mariadb/postgresql, docker. Os nomes das unidades variam entre distribuições, então confira com list-units ou a documentação. O comando service nome start/stop/status é legado (do SysV init) e em sistemas com systemd costuma apenas chamar o systemctl; prefira systemctl.',
            `# legado (ainda funciona em muitas máquinas):
$ sudo service nginx restart
# preferido:
$ sudo systemctl restart nginx`
          ),
          sl(
            'Cuidados ao administrar serviços',
            'Parar ou reiniciar um serviço em produção afeta usuários: prefira reload quando existir e valide a configuração antes (por exemplo nginx -t). Em servidor remoto, cuidado ao reiniciar o SSH ou o firewall: mantenha uma sessão aberta para recuperar. Se um serviço falhar ao iniciar, leia status e journalctl -u antes de tentar de novo repetidamente. Mudanças em arquivos de unidade pedem sudo systemctl daemon-reload, mas isso é assunto do nível intermediário.',
            `$ sudo nginx -t                 # valida a configuração (exemplo)
$ sudo systemctl reload nginx   # aplica sem derrubar conexões`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um serviço (daemon) no Linux?', 'b', [
          'Um arquivo de configuração em /etc, que o systemd lê ao iniciar o sistema',
          'Um programa em segundo plano, sem terminal, que oferece uma função',
          'Um comando que só o root pode digitar, usado para controlar o sistema',
          'Uma pasta onde ficam os logs e os arquivos temporários do sistema'
        ], 'Daemons rodam em segundo plano. O systemd inicia e supervisiona a maioria deles.'),
        mcq('q2', 'Qual é a diferença entre systemctl start nginx e systemctl enable nginx?', 'd', [
          'start funciona só como root e enable só como usuário comum, em qualquer unidade',
          'São sinônimos; os dois ligam o serviço agora e o habilitam para iniciar no boot',
          'start instala o pacote do nginx no sistema e enable remove o pacote depois',
          'start liga agora (não persiste no reboot); enable vale no boot (não liga agora)'
        ], 'start/stop mudam o estado atual; enable/disable mudam o comportamento no boot. enable --now faz os dois.'),
        mcq('q3', 'Qual é a diferença entre reload e restart?', 'a', [
          'reload relê a configuração sem parar o serviço; restart para e inicia de novo (se suportado)',
          'reload reinicia o computador inteiro, enquanto restart reinicia apenas o serviço',
          'restart relê a configuração sem parar; reload apaga o log',
          'Não há diferença; são nomes alternativos'
        ], 'reload é menos disruptivo (se suportado). restart derruba o processo por um instante.'),
        fill('q4', 'Complete para ver o estado e as últimas linhas de log do serviço nginx:', 'systemctl ___ nginx', ['status'], 'status mostra Loaded, Active e as últimas linhas de log.'),
        mcq('q5', 'Na saída do status aparece "Active: failed". O que isso significa?', 'c', [
          'O serviço está funcionando normalmente, com todos os processos ativos',
          'O serviço foi desinstalado do sistema e a unidade foi removida',
          'Tentou rodar e falhou; leia o status e o journalctl -u',
          'O serviço está habilitado para o boot, mas ainda não foi iniciado'
        ], 'failed indica falha na execução. O motivo costuma aparecer nas últimas linhas do status ou em journalctl -u.'),
        mcq('q6', 'Qual comando é adequado em um script para checar se nginx está ativo?', 'b', [
          'systemctl enable nginx',
          'systemctl is-active nginx',
          'systemctl list-units --all',
          'service nginx stop'
        ], 'is-active imprime o estado e devolve código 0 quando ativo.'),
        mcq('q7', 'Como ver o histórico de log completo de um serviço, e não só as últimas linhas do status?', 'd', [
          'systemctl logs nginx',
          'tail /etc/nginx',
          'dmesg -u nginx',
          'journalctl -u nginx'
        ], 'journalctl -u unidade lê o journal filtrado por serviço.'),
        fill('q8', 'Complete para que o nginx inicie automaticamente no boot:', 'sudo systemctl ___ nginx', ['enable'], 'enable cria o vínculo de inicialização no boot; --now também liga imediatamente.')
      ]
    },
    {
      id: 'lnb-27-agendamento-cron',
      title: 'Agendamento com cron',
      goal: 'Ler e escrever agendamentos no formato cron e evitar as falhas típicas de tarefas agendadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'crontab: a agenda do usuário',
            'cron é um serviço que executa comandos em horários marcados. Cada usuário tem sua própria agenda, a crontab. crontab -e edita (abre um editor), crontab -l lista e crontab -r remove tudo (cuidado: sem confirmação). Cada linha é um agendamento: cinco campos de tempo seguidos do comando. Linhas com # são comentários.',
            `$ crontab -e      # editar
$ crontab -l      # listar
# linha de exemplo:
30 2 * * * /home/ana/backup.sh`
          ),
          sl(
            'Os 5 campos',
            'Ordem: minuto (0-59), hora (0-23), dia do mês (1-31), mês (1-12), dia da semana (0-7; 0 e 7 = domingo, 1 = segunda). Leia da esquerda para a direita: "30 2 * * *" = minuto 30, hora 2, todo dia do mês, todo mês, todo dia da semana = todo dia às 02:30. O horário é de 24 horas.',
            `# min hora dia-mês mês dia-semana  comando
  30   2    *       *   *          /home/ana/backup.sh
# todo dia às 02:30`
          ),
          sl(
            'Símbolos: *, listas, intervalos e passos',
            '* significa "todos os valores". A vírgula faz lista (1,15 = nos valores 1 e 15). O hífen faz intervalo (1-5 = de 1 a 5). A barra faz passo: */15 no campo de minutos = a cada 15 minutos (0, 15, 30, 45). Combinações: "0 9 * * 1-5" = 9h em ponto de segunda a sexta; "0 0 1 * *" = meia-noite do dia 1 de cada mês.',
            `*/15 * * * *    /home/ana/checa.sh    # a cada 15 minutos
0 3 * * *       /home/ana/limpa.sh    # todo dia às 3h
0 9 * * 1-5     /home/ana/relatorio.sh   # 9h de segunda a sexta
0 0 1 * *       /home/ana/mensal.sh   # dia 1, meia-noite`
          ),
          sl(
            'PATH reduzido e caminhos absolutos',
            'O cron executa com um ambiente mínimo: o PATH é curto (em geral só /usr/bin e /bin), e variáveis do seu terminal não existem. Por isso, use sempre caminhos ABSOLUTOS para programas e arquivos (/usr/bin/python3, /home/ana/dados) e defina variáveis necessárias no próprio script. O diretório atual também não é o seu. Se funciona no terminal e falha no cron, quase sempre é PATH ou caminho relativo.',
            `# ruim: depende do PATH e do diretório atual
0 3 * * * backup.sh
# bom: caminho absoluto
0 3 * * * /home/ana/scripts/backup.sh`
          ),
          sl(
            'Registrar a saída: >> log 2>&1',
            'Sem redirecionamento, o cron tenta enviar a saída por e-mail local (quase ninguém lê). Redirecione para um arquivo: >> arquivo adiciona ao fim; 2>&1 manda os erros (saída 2) para o mesmo destino da saída normal (1). Use um caminho em que o usuário possa escrever. No crontab, o caractere % tem significado especial e precisa de barra invertida (\\%), por exemplo em date +\\%F.',
            `0 3 * * * /home/ana/scripts/backup.sh >> /home/ana/backup.log 2>&1
0 3 * * * echo "rodou em $(date +\\%F)" >> /home/ana/cron.log 2>&1`
          ),
          sl(
            'Fuso horário, at e timers',
            'O cron usa o fuso horário configurado no SERVIDOR (muitos servidores usam UTC). Um "0 3 * * *" em servidor UTC roda às 3h UTC, que são 0h em Brasília: converta antes de agendar. at agenda uma execução ÚNICA (at 14:00 digita os comandos e termina com Ctrl+D); para repetir, use cron. Os timers do systemd são uma alternativa moderna ao cron, só citados aqui.',
            `$ date             # confira o horário e o fuso do servidor
$ echo "/home/ana/script.sh" | at 14:00    # uma vez, às 14h (exemplo)`
          ),
          sl(
            'Testando uma expressão',
            'Antes de confiar, teste: rode o comando do cron à mão com o ambiente mínimo (env -i /bin/bash -c "comando") e cheque o log depois do primeiro horário. Para treinar a leitura de passos, veja os minutos de */15 numa sequência. Dica de estilo: comente cada linha da crontab explicando o horário.',
            `$ seq 0 15 59          # os minutos que */15 produz
0
15
30
45`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa a linha 30 2 * * * /home/ana/backup.sh ?', 'd', [
          'Executa a cada 30 minutos entre 2h e 3h',
          'Executa no dia 2 de todo mês às 00:30',
          'Executa às 30h do dia 2',
          'Executa todo dia às 02:30'
        ], 'Os campos são minuto (30), hora (2), dia do mês (*), mês (*), dia da semana (*): todo dia às 02:30.'),
        mcq('q2', 'Qual é o agendamento de */15 * * * * ?', 'b', [
          'Uma vez por dia, às 15h, no minuto zero',
          'A cada 15 minutos (0, 15, 30 e 45)',
          'No minuto 15 de cada hora, uma única vez por hora',
          'A cada 15 horas, a partir da meia-noite'
        ], '*/15 no campo de minutos é um passo de 15; o resto *, então roda o tempo todo.'),
        mcq('q3', 'Quando executa 0 9 * * 1-5 ?', 'a', [
          'Às 9h em ponto, de segunda a sexta',
          'A cada 9 minutos de segunda a sexta',
          'Às 9h, só no mês 1, dos dias 1 a 5',
          'Às 9h do dia 1 ao dia 5 de cada mês'
        ], 'O campo 5 (dia da semana) vale 1-5, de segunda a sexta; minuto 0 e hora 9.'),
        fill('q4', 'Complete o comando que LISTA a crontab atual do usuário:', 'crontab ___', ['-l'], 'crontab -l lista; -e edita; -r remove tudo.'),
        mcq('q5', 'Um script roda no terminal, mas falha no cron com "command not found". Qual a causa mais provável?', 'c', [
          'O cron não aceita scripts escritos em bash, só comandos simples',
          'O script precisa de 777 para o cron executar',
          'O PATH do cron é reduzido; use caminhos absolutos em vez de depender do seu PATH',
          'O cron só roda comandos aos domingos'
        ], 'O ambiente do cron é mínimo: use caminhos absolutos e defina variáveis no script.'),
        mcq('q6', 'O que faz o trecho >> /home/ana/backup.log 2>&1 no fim da linha de cron?', 'd', [
          'Apaga o log antes de cada execução e ignora os erros',
          'Envia a saída por e-mail e guarda o código de saída em backup.log',
          'Escreve só os erros em backup.log e perde a saída normal',
          'Acrescenta a saída normal e os erros ao fim de backup.log'
        ], '>> acrescenta ao arquivo e 2>&1 redireciona os erros para onde a saída normal foi.'),
        mcq('q7', 'O servidor está em UTC e você quer que uma tarefa rode às 03:00 de Brasília (UTC-3). Qual horário usar no cron?', 'b', [
          '0 3 * * * (03:00), pois o cron sempre converte para Brasília',
          '0 6 * * * (06:00 UTC), pois o cron usa o fuso do servidor',
          '0 0 * * * (00:00 UTC), pois subtrai-se o fuso',
          '3 0 * * * (minuto 3 da hora 0), pois a ordem dos campos é trocada'
        ], 'Cron usa o fuso do servidor. 03:00 em UTC-3 equivale a 06:00 UTC.'),
        fill('q8', 'Complete o campo de minutos para rodar todo dia às 3h EM PONTO:', '___ 3 * * * /usr/local/bin/backup.sh', ['0'], 'Minuto 0 e hora 3 = 03:00 em ponto. Com * no minuto, rodaria todo minuto da hora 3.')
      ]
    },
    {
      id: 'lnb-28-tempo-data-locale',
      title: 'Data, hora e idioma',
      goal: 'Formatar e interpretar datas, entender fuso e sincronização de relógio, e lidar com locale e acentuação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'date e formatos',
            'date mostra a data e hora do sistema. Com + e códigos de formato você escolhe a saída: %F é AAAA-MM-DD, %T é HH:MM:SS, %Y ano, %m mês, %d dia, %H hora, %s segundos desde 1970. O formato ISO (%F) ordena corretamente em nomes de arquivo (backup-2026-11-02.tar.gz). date -d "texto" interpreta datas escritas por extenso. As saídas abaixo variam com o dia e a hora em que você executa.',
            `$ date +%F
2026-11-02
$ date +%H:%M:%S
10:19:27
$ date +%d/%m/%Y
02/11/2026
$ date -d '2024-03-01 -1 day' +%F
2024-02-29`
          ),
          sl(
            'UTC, fuso horário e TZ',
            'UTC é a hora universal, sem horário de verão, usada em servidores e logs. O fuso é um deslocamento em relação ao UTC (Brasília: UTC-3). date -u mostra em UTC. A variável TZ muda o fuso só para um comando: TZ=America/Sao_Paulo date. timedatectl (em sistemas com systemd) mostra e configura fuso, hora e sincronização, e exige sudo para alterar. Armazenar datas em UTC e converter só na exibição evita muita confusão.',
            `$ date -u +%Y-%m-%dT%H:%M:%SZ
2026-11-02T13:19:27Z                  # exemplo
$ TZ=America/Sao_Paulo date +%z
-0300                                 # exemplo em um Linux típico
$ timedatectl                         # resumo de hora e fuso`
          ),
          sl(
            'Relógio de hardware, do sistema e NTP',
            'Há dois relógios: o do hardware (RTC, na placa-mãe, mantido pela bateria) e o do sistema (mantido pelo kernel enquanto roda). Na inicialização o sistema lê o RTC. Relógios derivam com o tempo, então serviços de NTP (chrony ou systemd-timesyncd) sincronizam o relógio com servidores de hora pela rede. Hora errada quebra logs, certificados HTTPS, tokens e agendamentos, por isso servidores devem ter NTP ativo.',
            `$ timedatectl
...
System clock synchronized: yes      # exemplo de linha que indica NTP ok`
          ),
          sl(
            'cal e uptime',
            'cal mostra um calendário no terminal (cal 2 2024 para fevereiro de 2024). uptime mostra há quanto tempo a máquina está ligada, quantos usuários estão logados e a média de carga. Podem não vir instalados em todas as distribuições mínimas.',
            `$ uptime
 10:20:01 up 3 days, 2:11,  1 user,  load average: 0.10, 0.08, 0.05   # exemplo`
          ),
          sl(
            'locale, LANG e UTF-8',
            'O locale define idioma, formato de data/número e a codificação de caracteres. locale mostra as variáveis atuais: LANG (padrão geral) e LC_* (categorias individuais; LC_ALL, se definida, vence todas). Um valor como pt_BR.UTF-8 = português do Brasil com codificação UTF-8, que representa acentos e outros alfabetos. Problemas de acentuação (ex.: "aÃ§Ã£o" em vez de "ação") indicam arquivo em uma codificação e terminal em outra.',
            `$ locale | head -3
LANG=pt_BR.UTF-8                # exemplo
LC_CTYPE="pt_BR.UTF-8"
LC_NUMERIC="pt_BR.UTF-8"`
          ),
          sl(
            'A ordenação depende do locale',
            'sort ordena segundo as regras do locale: em locales como pt_BR as regras de alfabeto podem ignorar maiúsculas e acentos de um jeito; no locale C a ordem é a dos bytes (maiúsculas antes das minúsculas, acentuadas por último). LC_ALL=C sort dá um resultado previsível em qualquer máquina. Outro ponto clássico: sort sem -n ordena como TEXTO (10 vem antes de 9); use sort -n para números.',
            `$ printf 'b\\nB\\na\\nA\\n' | LC_ALL=C sort | tr '\\n' ' '
A B a b
$ printf 'ação\\nzebra\\nábaco\\nabelha\\n' | LC_ALL=C sort | tr '\\n' ' '
abelha ação zebra ábaco
$ printf '10\\n9\\n100\\n' | sort | tr '\\n' ' '
10 100 9
$ printf '10\\n9\\n100\\n' | sort -n | tr '\\n' ' '
9 10 100`
          ),
          sl(
            'export LC_ALL=C em scripts',
            'Scripts que ordenam, comparam ou processam texto devem ter resultados iguais em qualquer servidor; por isso é comum começar com export LC_ALL=C (ou prefixar apenas o comando: LC_ALL=C sort). Cuidado: com C, ferramentas que contam caracteres (como wc -m ou \${#var}) passam a ver bytes, e acentos podem aparecer errados em algumas saídas. Use C para ordenação e comparação previsíveis, mas mantenha UTF-8 quando for exibir texto ao usuário.',
            `#!/bin/bash
export LC_ALL=C
sort nomes.txt | uniq -c      # ordem previsível em qualquer máquina`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a saída típica de date +%F ?', 'b', [
          '02/11/2026, ou seja, dia/mês/ano',
          '2026-11-02, ou seja, ano-mês-dia',
          '10:19:27, ou seja, hora:minuto:segundo',
          '1793000000, ou seja, segundos desde 1970'
        ], '%F equivale a %Y-%m-%d (formato ISO), ideal para nomes de arquivo ordenáveis.'),
        mcq('q2', 'O que o -u em date -u faz?', 'a', [
          'Mostra a hora em UTC (hora universal)',
          'Atualiza o relógio do sistema pela internet',
          'Mostra a hora de hardware, e não do sistema',
          'Mostra a data em formato universal brasileiro'
        ], '-u (UTC) exibe a hora universal, sem fuso local nem horário de verão.'),
        mcq('q3', 'Para que servem chrony e systemd-timesyncd?', 'c', [
          'Para formatar datas e horas em scripts e arquivos de log',
          'Para guardar o fuso horário de cada usuário no sistema',
          'Sincronizar o relógio com servidores de hora (NTP)',
          'Para definir o idioma do sistema'
        ], 'Implementam NTP. Relógio errado atrapalha logs, certificados e agendamentos.'),
        fill('q4', 'Complete para imprimir a data no formato ISO AAAA-MM-DD:', 'date +___', ['%F', '%Y-%m-%d'], '%F é o atalho para %Y-%m-%d.'),
        mcq('q5', 'Qual variável, quando definida, sobrepõe todas as demais categorias de locale (LC_*) e LANG?', 'd', [
          'LANG',
          'LC_TIME',
          'TZ',
          'LC_ALL'
        ], 'LC_ALL tem a maior prioridade. TZ define o fuso horário, e não o locale.'),
        mcq('q6', 'Por que sort numeros.txt (sem -n) coloca 10 antes de 9?', 'b', [
          'Porque o locale em uso é UTF-8, que ordena números pela casa decimal',
          'Ordena como texto, caractere a caractere; use sort -n para números (por isso "10" vem antes de "9")',
          'Porque 10 é par e o sort coloca números pares primeiro na lista',
          'Porque o arquivo está corrompido e precisa ser baixado de novo'
        ], 'Como texto, "10" < "9" pois "1" < "9". sort -n compara o valor numérico.'),
        mcq('q7', 'Um arquivo mostra "aÃ§Ã£o" em vez de "ação" no terminal. Qual é a causa mais provável?', 'a', [
          'Codificação diferente entre arquivo e terminal (UTF-8 lido como outra)',
          'O arquivo foi compactado com gzip e não foi descompactado antes',
          'O fuso horário do servidor está configurado de forma incorreta',
          'A variável PATH está vazia ou aponta para uma pasta inexistente'
        ], 'Esse padrão é típico de UTF-8 interpretado como Latin-1. Alinhe a codificação do arquivo e do terminal.'),
        fill('q8', 'Complete com a variável que, valendo C, torna a ordenação previsível por bytes:', '___=C sort nomes.txt', ['LC_ALL'], 'LC_ALL=C aplica o locale C a tudo, só para esse comando.')
      ]
    },
    {
      id: 'lnb-29-seguranca-basica-lgpd',
      title: 'Segurança básica e LGPD',
      goal: 'Aplicar medidas básicas de segurança em um Linux e entender o cuidado com dados pessoais em servidores.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Atualizações e usuário comum com sudo',
            'A maior parte dos ataques usa falhas já corrigidas: aplique atualizações de segurança com regularidade (apt update e apt upgrade em Debian/Ubuntu; dnf upgrade na família Red Hat), idealmente com rotina e janela de manutenção. Trabalhe com um usuário comum e use sudo só para o comando que precisa de privilégio, em vez de uma sessão permanente de root: reduz o estrago de erros e deixa rastro de quem fez o quê.',
            `$ sudo apt update && sudo apt upgrade     # Debian/Ubuntu (exemplo)
$ sudo dnf upgrade                        # família Red Hat (exemplo)
$ sudo systemctl restart nginx            # sudo só no comando necessário`
          ),
          sl(
            'Senhas fortes, chaves SSH e firewall',
            'Senhas devem ser longas e únicas (um gerenciador de senhas ajuda); para SSH, prefira chaves com frase secreta e desative o login por senha e o de root. Um firewall controla quais conexões entram: a ideia é bloquear tudo que chega por padrão e liberar só o necessário. ufw (Ubuntu) e firewalld (família Red Hat) são front-ends simples. Atenção: libere a porta do SSH ANTES de ativar o firewall em um servidor remoto, ou você se tranca para fora.',
            `$ sudo ufw allow 22/tcp      # libera SSH primeiro
$ sudo ufw enable            # só depois ativa
$ sudo ufw status`
          ),
          sl(
            'Serviços mínimos: ss -tulpn',
            'Cada serviço ativo é uma superfície de ataque. Princípio: só rode e escute o que for necessário. Liste o que está escutando com sudo ss -tulpn e, para cada porta, pergunte: preciso disto? Está exposto a toda a rede (0.0.0.0) ou só à máquina (127.0.0.1)? Um banco de dados que só o aplicativo local usa não deve escutar na rede. Desative o resto com systemctl disable --now.',
            `$ sudo ss -tulpn
tcp LISTEN 0.0.0.0:22     sshd      # exemplo: necessário
tcp LISTEN 127.0.0.1:5432 postgres  # só local: ok
$ sudo systemctl disable --now servico-que-nao-uso`
          ),
          sl(
            'Antipadrões: chmod 777 e curl | bash',
            'chmod 777 libera leitura, escrita e execução para TODOS os usuários: "resolve" o erro de permissão criando um buraco. Entenda o dono/grupo e dê o mínimo (755 para executáveis/pastas, 644 para arquivos, 600 para segredos). Outro hábito perigoso: curl URL | bash baixa e executa um script sem que você leia nada, com as suas permissões. Baixe, leia, e só então execute, e use apenas origens confiáveis (repositórios da distribuição). Nunca rode binários de origem desconhecida.',
            `# ruim:
chmod 777 arquivo
curl https://exemplo.invalid/instala.sh | bash
# melhor:
curl -o instala.sh https://exemplo.invalid/instala.sh
less instala.sh        # leia antes de executar`
          ),
          sl(
            'Verificar integridade com sha256sum',
            'Um hash (SHA-256) é uma "impressão digital" do conteúdo de um arquivo: qualquer alteração muda o hash completamente. Projetos sérios publicam o hash dos arquivos que distribuem, num canal separado. Você calcula com sha256sum arquivo e compara; sha256sum -c lista.txt verifica automaticamente os hashes de uma lista. Isso detecta download corrompido ou adulterado (e só é confiável se o hash vier de uma fonte confiável).',
            `$ echo -n abc | sha256sum
ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  -
$ sha256sum arquivo.iso > SUMS
$ sha256sum -c SUMS
arquivo.iso: OK`
          ),
          sl(
            'Malware, rootkits e backups',
            'Linux não é imune a malware: servidores expostos sofrem com scripts maliciosos, mineradores e ransomware. Rootkits são programas que se escondem no sistema depois de uma invasão; ferramentas de verificação existem, mas a defesa principal é prevenir (atualizar, privilégio mínimo, serviços mínimos) e ter backups testados e fora da máquina: se for invadido, o caminho seguro costuma ser reinstalar e restaurar dados de um backup limpo, e não confiar na máquina comprometida. Registre incidentes e mude senhas e chaves.',
            `# sinais de alerta (exemplos): processo desconhecido consumindo CPU,
# portas novas em escuta, usuários novos, tarefas estranhas no crontab
$ crontab -l
$ sudo ss -tulpn`
          ),
          sl(
            'LGPD em servidores',
            'A LGPD (Lei Geral de Proteção de Dados) protege dados pessoais (nome, CPF, e-mail, IP em muitos contextos...). Em servidores, dados pessoais podem estar em bancos, arquivos, logs e backups. Princípios práticos: minimização (colete e guarde só o necessário), finalidade (use só para o motivo informado), acesso restrito (permissões e sudo mínimos, chaves individuais), retenção limitada (apague quando não for mais necessário, inclusive em logs e backups), segurança (atualizações, criptografia de discos/backups/conexões em visão geral) e resposta a incidentes. Este conteúdo é uma introdução e não substitui orientação jurídica.',
            `# exemplos de boas práticas:
chmod 600 clientes.csv        # só o dono lê/escreve
# backups com dados pessoais: acesso restrito, criptografia e prazo para apagar
# logs: evitar gravar documentos/senhas; rotação com retenção definida`
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que chmod 777 é considerado um antipadrão?', 'a', [
          'Libera tudo a todos os usuários, e não apenas ao necessário',
          'Porque apaga o dono do arquivo e o grupo associado a ele',
          'Porque só funciona em arquivos de texto comuns e danifica os binários',
          'Porque exige reiniciar o sistema para a permissão valer'
        ], '777 dá todos os poderes a todos. Entenda dono/grupo e conceda o mínimo.'),
        mcq('q2', 'Qual é o risco de curl https://site/instala.sh | bash ?', 'b', [
          'Baixa o script mais devagar do que o normal, pois passa pelo pipe',
          'Executa um script sem você ler o conteúdo, com suas permissões',
          'Só funciona se o servidor remoto também usar Linux como sistema',
          'Impede o uso do sudo depois'
        ], 'O conteúdo é executado imediatamente. Baixe, leia e só então execute, e use fontes confiáveis.'),
        mcq('q3', 'Qual prática reduz o dano de erros e de invasões no dia a dia?', 'd', [
          'Usar sempre a conta root para evitar pedidos de senha e erros de permissão',
          'Compartilhar a mesma senha entre todos os administradores',
          'Desativar atualizações para o sistema não mudar',
          'Usar usuário comum e sudo só quando preciso'
        ], 'Privilégio mínimo e rastreabilidade: sudo só quando preciso.'),
        fill('q4', 'Ao configurar o ufw em um servidor remoto, qual porta liberar ANTES de ativar o firewall para não perder o acesso SSH?', 'sudo ufw allow ___/tcp', ['22'], 'A porta padrão do SSH é a 22. Ative o firewall só depois de liberá-la.'),
        mcq('q5', 'Ao rodar ss -tulpn você vê um banco de dados escutando em 0.0.0.0:5432, mas só o aplicativo local o usa. O que fazer?', 'c', [
          'Nada: serviços de banco são seguros por padrão em qualquer interface de rede',
          'Trocar a porta para 5433, o que resolve a exposição',
          'Limitá-lo a escutar só em 127.0.0.1',
          'Reiniciar o servidor a cada hora'
        ], 'Restrinja o serviço ao necessário: escutar só localmente reduz a superfície de ataque.'),
        mcq('q6', 'Qual abordagem se alinha à LGPD ao lidar com dados pessoais em logs e backups?', 'a', [
          'Coletar apenas o mínimo e restringir o acesso',
          'Registrar documentos e senhas nos logs para facilitar a auditoria',
          'Guardar tudo para sempre, por precaução, em um disco compartilhado',
          'Enviar cópias por e-mail pessoal dos administradores'
        ], 'Minimização, acesso restrito e retenção limitada. Não substitui orientação jurídica.'),
        mcq('q7', 'Para que serve sha256sum -c SUMS ?', 'd', [
          'Apagar os arquivos cujo hash não bate com o registrado na lista',
          'Criptografar os arquivos listados em SUMS com uma senha pedida na hora',
          'Compactar os arquivos listados em SUMS em um único pacote .tar.gz',
          'Conferir se os arquivos de SUMS ainda têm os hashes registrados'
        ], 'O -c lê hashes e nomes e confere cada arquivo, imprimindo OK ou FAILED. Só vale se o hash original for confiável.'),
        fill('q8', 'Complete para verificar os hashes de uma lista:', 'sha256sum -___ SUMS', ['c', '--check'], '-c (check) confere os arquivos listados contra os hashes.')
      ]
    },
    {
      id: 'lnb-30-documentacao-ajuda',
      title: 'Documentação e como pedir ajuda',
      goal: 'Usar man, --help e outras fontes, e pedir ajuda de forma eficaz sem expor dados sensíveis.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'man: o manual do sistema',
            'man comando abre a página de manual do comando (man ls). O manual é dividido em seções numeradas: 1 = comandos de usuário, 5 = formatos de arquivos de configuração, 8 = administração do sistema (e outras seções, como 2 e 3 para programadores). Quando o mesmo nome existe em duas seções, escolha com o número: man 5 crontab mostra o formato do arquivo, e man 1 crontab, o comando. As páginas man precisam estar instaladas; em contêineres e sistemas mínimos pode faltar o pacote man.',
            `$ man ls            # comando ls
$ man 5 crontab     # formato do arquivo da crontab
$ man 8 mount       # administração (exemplo)`
          ),
          sl(
            'Navegando no man',
            'O man usa um paginador (less). Teclas: espaço avança uma tela, b volta, /texto busca para frente (n próxima ocorrência, N anterior), g início, G fim, q sai. Estrutura comum: NAME (resumo), SYNOPSIS (como usar; [colchetes] = opcional), DESCRIPTION, OPTIONS, EXAMPLES, SEE ALSO. Para descobrir comandos por assunto: man -k palavra (ou apropos palavra) pesquisa nos resumos.',
            `$ man -k "copy files"     # busca por palavra (exige o banco do man atualizado)
# dentro do man: /opção  procura; q sai`
          ),
          sl(
            '--help, info, /usr/share/doc e tldr',
            'comando --help mostra um resumo rápido de uso, muitas vezes suficiente (ls --help). info é outro sistema de documentação (comum nas ferramentas GNU). /usr/share/doc guarda documentação, exemplos e licenças dos pacotes instalados. tldr é uma ferramenta opcional que mostra exemplos curtos e práticos dos comandos mais usados; precisa ser instalada. Wikis das distribuições (como as das principais distros) e as páginas oficiais dos projetos costumam ter guias atualizados.',
            `$ ls --help | head -5
$ ls /usr/share/doc | head
$ tldr tar         # opcional: exemplos curtos (precisa instalar)`
          ),
          sl(
            'Pesquisar uma mensagem de erro',
            'Copie a mensagem EXATA (entre aspas na busca) e acrescente o nome do programa e da distribuição; remova partes que são só seus (nomes de usuário, caminhos pessoais, IPs). Prefira fontes oficiais (documentação, wiki da distribuição, repositório do projeto) a respostas antigas e de origem duvidosa, e confira a data e a versão: um tutorial antigo pode estar errado hoje. NUNCA execute comandos copiados sem entender o que fazem (veja a lição de armadilhas).',
            `# busca útil:
"No such file or directory" nginx debian
# em vez de:
erro nginx não funciona`
          ),
          sl(
            'Ler um erro ou stack trace de trás para frente',
            'Em muitos programas, uma falha gera uma sequência de mensagens ou chamadas (stack trace). Costuma valer a pena olhar a ÚLTIMA linha (o erro final: tipo e mensagem) e depois subir até a primeira linha que cita o SEU código ou arquivo de configuração. As linhas do meio são frequentemente bibliotecas internas. Lembre também de procurar o primeiro erro de uma sequência no log: os seguintes podem ser efeito dele.',
            `Traceback (most recent call last):
  File "app.py", line 12, in <module>
    conectar()
ConnectionRefusedError: [Errno 111] Connection refused
# leia primeiro a última linha: conexão recusada (serviço parado? porta errada?)`
          ),
          sl(
            'Como perguntar bem',
            'Uma boa pergunta permite que outra pessoa reproduza o problema: diga a distribuição e a versão (cat /etc/os-release), o objetivo, o comando EXATO que rodou, a saída COMPLETA do erro (texto, não foto), o que já tentou e o que esperava. Reduza ao menor exemplo possível. Seja educado e agradeça; atualize a pergunta com a solução quando a achar, para ajudar quem vier depois.',
            `$ cat /etc/os-release | head -2    # informe a distribuição e a versão
# modelo: objetivo / comando exato / saída completa / o que já tentei`
          ),
          sl(
            'Não cole dados pessoais, segredos ou tokens',
            'Fóruns, chats e issues são PÚBLICOS e indexados: o que for colado pode ser lido por qualquer pessoa e raramente é removido de verdade. Antes de postar, revise e substitua por placeholders: senhas, chaves privadas, tokens de API, strings de conexão, e-mails, nomes, CPF, IPs de produção e domínios internos. Se um segredo vazar, considere-o comprometido: troque-o imediatamente (revogue o token, gere outra chave). Isso também é exigência de boa prática de proteção de dados (LGPD).',
            `# antes de postar, troque:
senha=hunter2                   ->  senha=<senha>
Authorization: Bearer abc123    ->  Authorization: Bearer <token>
host=203.0.113.77               ->  host=<ip-do-servidor>`
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que existem man 1 crontab e man 5 crontab?', 'c', [
          'São versões do mesmo texto em idiomas diferentes, mantidas pelos tradutores',
          'A seção 5 é uma versão antiga e a 1, a atual',
          'A 1 descreve o comando; a 5, o formato do arquivo de configuração',
          'A seção 1 é para root e a 5 para usuários comuns'
        ], 'O mesmo nome pode ter páginas em seções diferentes: 1 = comandos; 5 = formatos de arquivo; 8 = administração.'),
        mcq('q2', 'Como procurar comandos relacionados a um assunto quando você não sabe o nome?', 'a', [
          'man -k assunto (ou apropos assunto)',
          'man --find nome-do-comando, que lista os resultados',
          'ls /usr/bin | man, que abre uma página para cada comando',
          'info -k /etc'
        ], '-k pesquisa palavras nos resumos das páginas do manual.'),
        mcq('q3', 'Dentro de uma página man, qual tecla encerra a leitura?', 'd', [
          'Ctrl+S',
          'x',
          'Esc',
          'q'
        ], 'O man usa um paginador (less): q sai, / busca e espaço avança.'),
        fill('q4', 'Complete para ver o resumo rápido de uso do ls:', 'ls --___', ['help'], '--help imprime um resumo de uso, sem abrir o manual completo.'),
        mcq('q5', 'Qual é a melhor forma de pesquisar um erro na internet?', 'b', [
          'Descrever com suas palavras o que aconteceu, sem citar o programa nem a distribuição',
          'Copiar a mensagem exata, sem dados pessoais',
          'Postar a tela inteira com todos os dados do servidor',
          'Colar o primeiro comando que aparecer, sem ler'
        ], 'A mensagem exata e o contexto (programa e distro) trazem resultados melhores; remova dados seus.'),
        mcq('q6', 'Ao ler um erro com várias linhas de stack trace, por onde começar?', 'a', [
          'Pela última linha, o erro final',
          'Pela primeira linha, ignorando todas as demais, pois a informação toda está nela',
          'Pelas linhas do meio, que quase sempre trazem a causa real do problema',
          'Pelo tamanho do arquivo de log, procurando o maior trecho repetido'
        ], 'O erro final fica no fim; depois, procure o trecho que é do seu código ou da sua configuração.'),
        mcq('q7', 'Você vai pedir ajuda num fórum público. O que NÃO deve colar?', 'd', [
          'A versão da distribuição e o comando exato que você executou, sem alterações',
          'A mensagem de erro completa, sem partes pessoais',
          'O que você já tentou e o resultado',
          'Tokens, senhas e chaves privadas'
        ], 'Fóruns são públicos e indexados. Troque segredos e dados pessoais por <placeholders>; se um segredo vazar, revogue-o.'),
        fill('q8', 'Complete para abrir a página do formato do arquivo de crontab (seção 5):', 'man ___ crontab', ['5'], 'A seção 5 documenta formatos de arquivos de configuração.')
      ]
    },
    {
      id: 'lnb-31-armadilhas-boas-praticas',
      title: 'Armadilhas e boas práticas',
      goal: 'Reconhecer os erros clássicos de iniciantes em Linux e adotar hábitos que evitam desastres.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'rm -rf com variável vazia',
            'rm apaga sem lixeira e sem confirmação. O desastre clássico: rm -rf "$DIR/" quando DIR está vazio ou não foi definida vira rm -rf / (a raiz!). Defesas: conferir a variável antes; usar \${DIR:?mensagem}, que aborta o script se a variável estiver vazia; usar set -u, que trata variável não definida como erro; e fazer um ensaio (dry-run) trocando rm por echo para ver o comando que seria executado. Distribuições modernas protegem a raiz por padrão, mas outros caminhos (como /*, ou sua pasta home) continuam apagáveis.',
            `$ DIR=""
$ echo rm -rf "$DIR/"          # ensaio com echo
rm -rf /                       # <- o que seria executado!
$ echo "\${DIR:?defina DIR}"    # aborta se estiver vazia
bash: DIR: defina DIR`
          ),
          sl(
            '> sobrescreve, >> acrescenta',
            'O redirecionamento > substitui TODO o conteúdo do arquivo (cria se não existir), e isso acontece antes de o comando rodar: um > no arquivo errado apaga dados na hora. >> acrescenta ao fim. Tenha especial cuidado com comandos do tipo sort a.txt > a.txt (o arquivo é esvaziado antes de ser lido). No bash, set -o noclobber faz > recusar sobrescrever arquivos existentes ("cannot overwrite existing file").',
            `$ echo um > f.txt
$ echo dois > f.txt        # substituiu
$ cat f.txt
dois
$ echo tres >> f.txt       # acrescentou
$ cat f.txt
dois
tres`
          ),
          sl(
            'sudo sem entender e comandos copiados da internet',
            'sudo executa com poderes de administrador: um erro ou um comando malicioso tem efeito total no sistema. Antes de usar sudo, entenda o que o comando faz e por que precisa de privilégio (se "Permission denied" aparece, a solução quase nunca é rodar tudo como root: veja o dono e as permissões). Comandos copiados de sites e fóruns devem ser lidos, entendidos (man, --help) e, se possível, testados numa VM ou contêiner descartável, nunca colados às cegas, principalmente com sudo, rm, dd, chmod -R, curl | bash.',
            `# antes de colar um comando:
# 1) o que cada parte faz?  (man comando)
# 2) tem sudo/rm/dd/chmod -R/curl|bash?  redobre a atenção
# 3) teste em ambiente descartável`
          ),
          sl(
            'chmod -R 777 e editar arquivos do sistema sem backup',
            'chmod -R 777 pasta aplica permissão total a tudo dentro dela, incluindo segredos e arquivos que o sistema exige restritos (por exemplo, a pasta ~/.ssh e as chaves, que o SSH passará a recusar). Entenda o dono, o grupo e conceda o mínimo. Antes de editar arquivos de configuração de sistema (/etc/ssh/sshd_config, /etc/fstab, sudoers), faça uma cópia e mantenha outra sessão aberta; para sudoers use visudo, que valida a sintaxe.',
            `$ sudo cp -a /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
$ sudo nano /etc/ssh/sshd_config
# se der errado: restaure a cópia .bak`
          ),
          sl(
            'Espaços em nomes, -- e Ctrl+C vs Ctrl+Z',
            'Nomes com espaço quebram comandos sem aspas: rm meu arquivo.txt tenta apagar "meu" e "arquivo.txt". Use aspas: rm "meu arquivo.txt". Nomes que começam com - viram opções: use -- para marcar o fim das opções (rm -- -x). Ctrl+C INTERROMPE (encerra) o programa em primeiro plano; Ctrl+Z apenas SUSPENDE (o programa fica parado em segundo plano e você pode retomá-lo com fg ou bg). Quem digita Ctrl+Z achando que "saiu" deixa processos parados. jobs lista essas tarefas.',
            `$ touch "a b"
$ echo rm a b          # o shell enxerga 2 argumentos
rm a b
$ echo rm "a b"        # aspas: 1 argumento
rm a b
# (o echo mostra o mesmo texto, mas rm "a b" apagaria UM arquivo)
$ rm -- -x             # apaga o arquivo chamado -x`
          ),
          sl(
            'Hábitos que evitam desastres',
            'Hábitos: rode ls com o mesmo padrão ANTES de rm; use rm -i para pedir confirmação; faça ensaio com echo antes de comandos destrutivos; em scripts use aspas em todas as variáveis, set -u (e o idioma \${VAR:?}) e consulte o man; versione configurações (por exemplo com git) e faça snapshots/backups antes de mudanças grandes; pratique em uma VM ou contêiner "de teste" até ter confiança. Antes de qualquer comando, pergunte: "se eu estiver errado, o que acontece e dá para desfazer?".',
            `$ ls *.log           # confira o que casa
$ rm -i *.log        # pergunta antes de apagar cada um
#!/bin/bash
set -u               # variável não definida vira erro`
          ),
          sl(
            'Checklist final',
            'Antes de executar: 1) li e entendi o comando? 2) tem sudo, rm, dd, >, chmod -R? 3) as variáveis estão definidas e entre aspas? 4) estou no diretório e no servidor certos (pwd, hostname)? 5) há backup do que vou alterar? 6) consigo desfazer? 7) testei antes com ls/echo/-n? 8) não estou colando segredos ou dados pessoais em lugar nenhum? Se alguma resposta for "não", pare e confira.',
            `$ pwd && hostname      # onde estou?
$ ls                   # o que vou afetar?`
          )
        ]
      },
      questions: [
        mcq('q1', 'O script faz rm -rf "$DIR/" e DIR está vazia. O que o shell executa?', 'd', [
          'rm -rf, sem argumentos, que não faz nada',
          'Nada, pois o shell recusa variáveis vazias',
          'rm -rf ./, apagando só a pasta atual',
          'rm -rf /, tentando apagar a raiz'
        ], 'A variável vazia desaparece e sobra "/". Use set -u, \${DIR:?} e ensaie com echo.'),
        mcq('q2', 'Qual é o efeito de echo dois > f.txt quando f.txt já contém dados?', 'c', [
          'Acrescenta dois ao fim do arquivo',
          'Pergunta se deve sobrescrever',
          'Substitui todo o conteúdo anterior por dois',
          'Cria f.txt.bak com o conteúdo antigo e grava o novo'
        ], '> sobrescreve sem avisar. Use >> para acrescentar (ou noclobber para proteger).'),
        mcq('q3', 'Qual é a diferença entre Ctrl+C e Ctrl+Z?', 'a', [
          'Ctrl+C interrompe o programa; Ctrl+Z o suspende (parado, retomável com fg/bg)',
          'Ctrl+C suspende o programa em segundo plano e Ctrl+Z o encerra definitivamente',
          'Ctrl+C copia o texto e Ctrl+Z cola',
          'Os dois fecham o terminal'
        ], 'Ctrl+Z deixa o processo parado em segundo plano. Veja jobs e use fg ou bg para retomar.'),
        fill('q4', 'Complete para o rm perguntar antes de apagar cada arquivo:', 'rm ___ *.log', ['-i'], '-i (interactive) pede confirmação para cada arquivo.'),
        mcq('q5', 'O que fazer antes de editar /etc/ssh/sshd_config em um servidor remoto?', 'b', [
          'Editar diretamente, pois o sistema valida tudo sozinho antes de aplicar',
          'Copiar o arquivo e manter outra sessão aberta',
          'Aplicar chmod 777 no arquivo para evitar bloqueios',
          'Apagar o arquivo e criar um novo do zero'
        ], 'Backup e uma segunda sessão evitam ficar trancado para fora do servidor.'),
        mcq('q6', 'O que set -u faz em um script bash?', 'd', [
          'Atualiza os pacotes do sistema e verifica o sistema antes de executar o restante do script',
          'Imprime cada comando antes de executá-lo',
          'Executa o script como outro usuário',
          'Faz variável não definida virar erro'
        ], 'set -u falha ao expandir variável não definida, o que ajuda a evitar o caso rm -rf "$VAR/".'),
        mcq('q7', 'O que acontece com rm meu arquivo.txt (sem aspas), para apagar "meu arquivo.txt"?', 'c', [
          'Apaga o arquivo "meu arquivo.txt" normalmente, pois o shell entende o espaço',
          'O rm pergunta qual dos arquivos apagar',
          'Tenta apagar "meu" e "arquivo.txt"',
          'Apaga todos os arquivos que começam com "meu"'
        ], 'O shell divide em duas palavras. Use rm "meu arquivo.txt".'),
        fill('q8', 'Complete para que o script trate variáveis não definidas como erro:', 'set -___', ['u'], 'set -u é uma das primeiras linhas de scripts cuidadosos.')
      ]
    },
    {
      id: 'lnb-32-projeto-mini-servidor',
      title: 'Projeto: preparando um mini ambiente de servidor',
      goal: 'Juntar o que aprendeu: usuário, pacotes, pastas, permissões, SSH, backup agendado, logs e verificação de portas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O plano do projeto',
            'Vamos preparar, passo a passo, um mini ambiente para uma aplicação fictícia chamada "app" numa máquina de teste (VM ou contêiner, nunca produção). Etapas: 1) usuário comum com sudo; 2) pacotes necessários; 3) estrutura de pastas e permissões; 4) chave SSH; 5) script de backup; 6) agendamento com cron; 7) verificação com logs, ss e firewall; 8) documentação. Comandos de administração variam por distribuição; os exemplos usam nomes do Debian/Ubuntu e valores fictícios.',
            `# ambiente de teste (exemplo)
# 1 usuário  2 pacotes  3 pastas  4 SSH
# 5 backup   6 cron     7 verificar  8 documentar`
          ),
          sl(
            '1 e 2: usuário comum e pacotes',
            'Crie um usuário para o dia a dia e dê a ele o direito de usar sudo. No Debian/Ubuntu: adduser cria o usuário (pede senha) e o grupo sudo concede o direito; na família Red Hat o grupo equivalente é wheel. Depois instale só o que for necessário (princípio dos serviços mínimos): por exemplo rsync e ferramentas de rede. Confira se o login funciona numa outra sessão antes de fechar a atual.',
            `# como root ou com sudo (exemplo Debian/Ubuntu):
$ sudo adduser ana
$ sudo usermod -aG sudo ana
$ sudo apt update
$ sudo apt install rsync`
          ),
          sl(
            '3: pastas e permissões',
            'Organize a aplicação em pastas com dono e permissões coerentes: o código em /srv/app, os dados em /srv/app/dados e os backups em /srv/backup. Dados pessoais e segredos devem ser acessíveis só a quem precisa: 750 em pastas (dono tudo, grupo lê e entra, outros nada) e 600 em arquivos sensíveis. Nunca 777.',
            `$ sudo mkdir -p /srv/app/dados /srv/backup
$ sudo chown -R ana:ana /srv/app /srv/backup
$ chmod 750 /srv/app/dados /srv/backup
$ ls -ld /srv/app/dados
drwxr-x--- 2 ana ana ... /srv/app/dados`
          ),
          sl(
            '4: chave SSH',
            'Gere um par de chaves no seu computador de trabalho, envie a pública para o servidor e passe a entrar por chave. Depois de confirmar que funciona, desative a senha no servidor (conceito da lição de SSH), mantendo uma sessão aberta durante o teste. Nunca copie a chave privada para o servidor.',
            `$ ssh-keygen -t ed25519 -C "ana-notebook"
$ ssh-copy-id ana@192.0.2.10
$ ssh ana@192.0.2.10        # entra com a chave`
          ),
          sl(
            '5: script de backup (executado e testado)',
            'O script abaixo recebe origem, destino e dias de retenção; usa set -u e \${1:?} para falhar com mensagem se faltar argumento; confere a origem; cria um .tar.gz com data; testa o arquivo com tar -tzf; e remove backups mais antigos que o prazo (retenção limitada, boa para a LGPD). Foi executado com diretórios temporários e funcionou.',
            `#!/bin/bash
set -u
ORIGEM="\${1:?uso: backup.sh ORIGEM DESTINO [DIAS]}"
DESTINO="\${2:?uso: backup.sh ORIGEM DESTINO [DIAS]}"
DIAS="\${3:-7}"
[ -d "$ORIGEM" ] || { echo "origem nao existe: $ORIGEM" >&2; exit 1; }
mkdir -p "$DESTINO" || exit 1
ARQ="$DESTINO/backup-$(date +%F_%H%M%S).tar.gz"
tar -czf "$ARQ" -C "$(dirname "$ORIGEM")" "$(basename "$ORIGEM")" || exit 1
tar -tzf "$ARQ" > /dev/null || { echo "arquivo corrompido" >&2; exit 1; }
echo "criado: $ARQ"
find "$DESTINO" -name 'backup-*.tar.gz' -type f -mtime +"$DIAS" -print -delete`
          ),
          sl(
            'Rodando o script e testando a restauração',
            'Execute com um diretório de teste, confira o resultado e restaure numa pasta temporária para comparar com diff -r. O -C faz o tar entrar na pasta pai da origem, de modo que o pacote guarde o caminho relativo (app/...) e não o absoluto. Para um segundo destino (regra 3-2-1), copie os .tar.gz com rsync -a para outra máquina ou disco: com rsync -a /srv/backup/ usuario@host:/destino/ (cuidado com o --delete).',
            `$ ./backup.sh app backups 7
criado: backups/backup-2026-11-02_101944.tar.gz     # data/hora variam
$ mkdir r && tar -xzf backups/backup-*.tar.gz -C r
$ diff -r app r/app && echo restauracao-ok
restauracao-ok
$ ./backup.sh
./backup.sh: line 3: 1: uso: backup.sh ORIGEM DESTINO [DIAS]`
          ),
          sl(
            '6, 7 e 8: cron, verificação e documentação',
            'Agende com crontab -e usando caminhos absolutos e registrando saída (0 2 * * * /home/ana/backup.sh /srv/app /srv/backup 7 >> /home/ana/backup.log 2>&1), lembrando do fuso do servidor. Verifique: tail -f /home/ana/backup.log e journalctl -u cron (o nome do serviço varia: cron ou crond); sudo ss -tulpn para ver o que escuta (só SSH, no mínimo); e o firewall (sudo ufw allow 22/tcp e depois sudo ufw enable, em visão geral). Documente tudo num README: o que existe, onde ficam backups, quem tem acesso, como restaurar e a retenção dos dados.',
            `0 2 * * * /home/ana/backup.sh /srv/app /srv/backup 7 >> /home/ana/backup.log 2>&1
$ tail -n 5 /home/ana/backup.log
$ sudo ss -tulpn          # só o necessário deve escutar`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem lógica mais segura para preparar o ambiente?', 'd', [
          'Ativar o firewall, desativar o SSH por senha e só depois criar o usuário comum que fará a administração',
          'Criar o backup, apagar o usuário padrão e depois instalar pacotes',
          'Instalar todos os pacotes possíveis e depois ver o que sobra',
          'Criar usuário comum com sudo, testar o login e só então endurecer o SSH e ativar o firewall'
        ], 'Garanta acesso por outro caminho (usuário e login testados) antes de restringir senha, root e firewall, para não se trancar para fora.'),
        mcq('q2', 'No script de backup, para que serve ORIGEM="\${1:?uso: ...}"?', 'a', [
          'Faz o script abortar com a mensagem de uso se o argumento 1 faltar',
          'Define a origem como a pasta atual do usuário caso o argumento 1 seja omitido',
          'Apaga a origem depois que o backup for concluído com sucesso',
          'Executa o conteúdo da origem como se fosse um comando do shell'
        ], '\${1:?msg} falha com a mensagem quando $1 não está definido ou está vazio.'),
        mcq('q3', 'Por que o script roda tar -tzf no arquivo recém-criado?', 'c', [
          'Para extrair os arquivos de volta ao local de origem e conferir os dados',
          'Para apagar arquivos duplicados dentro do pacote e reduzir seu tamanho final',
          'Para checar que o pacote é legível antes de validá-lo',
          'Para criptografar o pacote antes do envio'
        ], 'Listar o conteúdo detecta arquivo corrompido ou vazio logo após a criação. O teste mais forte é restaurar e comparar.'),
        fill('q4', 'Complete a retenção: apagar backups com mais de DIAS dias:', 'find "$DESTINO" -name \'backup-*.tar.gz\' -type f -mtime +"$DIAS" -___', ['delete'], '-delete remove os arquivos encontrados; teste antes com -print.'),
        mcq('q5', 'Qual conjunto de permissões é adequado para a pasta de dados com informações pessoais da aplicação?', 'b', [
          '777 na pasta, para qualquer usuário do sistema poder ler quando precisar dos dados',
          '750 na pasta, apenas dono e grupo, e 600 em arquivos sensíveis',
          '666 nos arquivos, para facilitar a edição por todos',
          '000 na pasta, para ninguém jamais acessar'
        ], 'Mínimo necessário: dono e grupo responsáveis. 777 expõe dados pessoais, e 000 impede até a própria aplicação.'),
        mcq('q6', 'Por que o tar usa -C "$(dirname "$ORIGEM")" e "$(basename "$ORIGEM")"?', 'd', [
          'Para o pacote ficar maior e conter o disco inteiro, garantindo cópia completa',
          'Para o tar ignorar as permissões e os donos dos arquivos',
          'Para o script funcionar apenas dentro da pasta /srv',
          'Para guardar caminhos relativos no pacote'
        ], 'Com -C entra-se na pasta pai e arquiva só o nome da pasta, o que facilita restaurar em qualquer lugar.'),
        mcq('q7', 'A tarefa funciona manualmente, mas o cron não executa o backup. Qual é a melhor medida?', 'a', [
          'Usar caminhos absolutos, gravar a saída em log e conferir o fuso',
          'Dar chmod 777 no script e reiniciar o servidor para o cron reler tudo',
          'Trocar o cron por um laço while true rodando no terminal aberto',
          'Remover o redirecionamento para não ocupar espaço em disco com logs'
        ], 'PATH reduzido e caminhos relativos são as causas clássicas; o log mostra o erro real.'),
        fill('q8', 'Complete o comando que cria o pacote .tar.gz do backup:', '___ -czf backup.tar.gz /srv/app', ['tar'], 'tar -czf cria um pacote compactado com gzip.')
      ]
    },
    {
      id: 'lnb-33-filosofia-unix-revisao',
      title: 'Filosofia Unix e revisão',
      goal: 'Entender a filosofia Unix, revisar os comandos do nível por categoria e consolidar os hábitos seguros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Programas pequenos que fazem uma coisa bem',
            'A filosofia Unix prefere ferramentas pequenas, cada uma boa em uma única tarefa, que se combinam: sort ordena, uniq remove repetições, cut recorta colunas, grep filtra, wc conta. Em vez de um programa gigante, você encadeia peças simples. Isso torna o sistema flexível: a mesma peça serve para milhares de usos.',
            `# cada programa faz uma coisa:
grep  filtra linhas      sort  ordena
cut   recorta colunas    uniq  agrupa repetidos
wc    conta              head/tail  início/fim`
          ),
          sl(
            'Texto como interface e composição por pipes',
            'Quase tudo se comunica por TEXTO (linhas, colunas), então a saída de um programa pode ser a entrada de outro com o pipe (|). Exemplo: dado um arquivo de acessos com IPs de documentação, contar quantos acessos cada IP fez com cut, sort e uniq -c, ordenando do maior para o menor com sort -rn. Cada etapa é testável sozinha: rode a primeira, depois adicione a próxima.',
            `$ cut -d' ' -f1 acessos.txt | sort | uniq -c | sort -rn
      3 203.0.113.5
      2 198.51.100.7
      1 192.0.2.9`
          ),
          sl(
            'Tudo é arquivo',
            'No Linux, muitas coisas aparecem como arquivos: documentos, diretórios, dispositivos (/dev/sda), terminais, informações do sistema e de processos (/proc), e até canais especiais como /dev/null, que descarta tudo o que se escreve nele. Por isso as mesmas ferramentas (cat, grep, redirecionamento) servem para tudo. Redirecionar erros para /dev/null (2> /dev/null) silencia mensagens de erro.',
            `$ ls /naoexiste 2> /dev/null; echo $?
2                         # erro silenciado, código 2
$ cat /dev/null | wc -c
0                         # /dev/null é sempre vazio`
          ),
          sl(
            'Revisão 1: navegação, arquivos e texto',
            'Navegação: pwd, ls, cd. Arquivos: cp, mv, rm (com -i), mkdir, touch, find, tar. Texto: cat, less, head, tail, grep, cut, sort, uniq, wc, sed, awk. Redirecionamento e pipes: > (sobrescreve), >> (acrescenta), 2> (erros), | (encadeia). Scripts: #!/bin/bash, chmod +x, variáveis, if/for/while/case, funções, $?.',
            `# navegar:  pwd  ls  cd
# arquivos:  cp mv rm mkdir touch find tar
# texto:     cat less head tail grep cut sort uniq wc sed awk
# fluxo:     >  >>  2>  |`
          ),
          sl(
            'Revisão 2: permissões, processos, pacotes, rede, serviços e agendamento',
            'Permissões: ls -l, chmod, chown, sudo (mínimo necessário). Processos: ps, top, kill, Ctrl+C/Ctrl+Z. Pacotes: apt, dnf (atualizar e instalar com cuidado). Rede: ip addr, ip route, ping, curl, ss -tulpn, ssh, scp, rsync. Serviços: systemctl start/stop/enable/status, journalctl -u. Agendamento: crontab -e/-l e os 5 campos. Disco e tempo: df -h, du -sh, lsblk, date, timedatectl. Ajuda: man, --help.',
            `# permissões: ls -l chmod chown sudo
# processos:  ps top kill
# pacotes:    apt dnf
# rede:       ip ping curl ss ssh scp rsync
# serviços:   systemctl journalctl     # agendar: crontab`
          ),
          sl(
            'Revisão 3: hábitos seguros',
            'Leia antes de executar; ls antes de rm; echo como ensaio de comandos destrutivos; aspas nas variáveis e set -u em scripts; -n no rsync antes do --delete; backup antes de editar configurações do sistema; privilégio mínimo (usuário comum + sudo, nunca chmod 777); chaves SSH com frase secreta, nunca compartilhadas; atualizações em dia; serviços mínimos; backups testados em mais de um lugar; logs e backups tratados como possíveis dados pessoais (LGPD); nunca colar segredos em fóruns.',
            `# lembrete rápido:
ls *.tmp  &&  rm -i *.tmp
set -u ; "$variavel"
rsync -avn --delete origem/ destino/   # ensaio`
          ),
          sl(
            'Próximos passos',
            'O nível intermediário aprofunda o que viu: processo de boot e systemd em detalhe, gerenciamento de discos com LVM e sistemas de arquivos, firewall (ufw, firewalld, nftables), contas e permissões avançadas (ACL, grupos), logs e monitoramento, e hardening (endurecimento) de servidores, além de automação e contêineres. A melhor forma de treinar é manter uma VM de testes e praticar tudo desta trilha, errando num ambiente onde errar é barato.',
            `# prática sugerida:
# 1) VM descartável  2) refaça o projeto do mini servidor
# 3) quebre e conserte  4) escreva seu README`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que expressa a filosofia Unix de "fazer uma coisa bem"?', 'c', [
          'Um único programa deve incluir todas as funções, para o usuário não precisar de outros',
          'Cada programa deve ter interface gráfica própria',
          'Ferramentas pequenas e especializadas que se combinam, por exemplo com pipes',
          'Todos os comandos devem aceitar as mesmas 20 opções'
        ], 'Peças pequenas e combináveis (grep, sort, uniq, cut...) formam soluções flexíveis.'),
        mcq('q2', 'O que faz cut -d\' \' -f1 acessos.txt | sort | uniq -c | sort -rn?', 'b', [
          'Remove as linhas repetidas de acessos.txt e grava o resultado no próprio arquivo',
          'Conta quantas vezes cada IP da 1ª coluna aparece, do maior para o menor',
          'Ordena o arquivo alfabeticamente e salva em acessos.txt',
          'Soma os números da primeira coluna'
        ], 'cut pega a 1ª coluna, sort agrupa, uniq -c conta, sort -rn ordena do maior para o menor.'),
        mcq('q3', 'O que significa "tudo é arquivo" no Linux?', 'a', [
          'Tudo é acessado como arquivo',
          'Todo arquivo pode ser aberto e modificado por qualquer usuário do sistema',
          'O sistema não distingue pastas de arquivos de texto comuns',
          'Não existem programas, só arquivos de texto'
        ], 'Dispositivos em /dev e informações em /proc aparecem como arquivos, então cat, grep e redirecionamentos servem para eles.'),
        fill('q4', 'Complete o pipeline que conta repetições (sort agrupa, o próximo comando conta):', 'cut -d\' \' -f1 acessos.txt | sort | ___ -c | sort -rn', ['uniq'], 'uniq -c conta linhas consecutivas iguais, por isso vem depois de sort.'),
        mcq('q5', 'Qual categoria agrupa corretamente systemctl, journalctl e crontab no resumo do nível?', 'd', [
          'Navegação e manipulação de arquivos',
          'Permissões e usuários',
          'Compactação e backup',
          'Serviços e agendamento (e logs)'
        ], 'systemctl gerencia serviços, journalctl lê logs do journal e crontab agenda tarefas.'),
        mcq('q6', 'Qual conjunto reúne hábitos seguros do nível?', 'c', [
          'Rodar tudo como root, colar comandos sem ler e usar chmod 777 para evitar erros de permissão',
          'Evitar backups para economizar disco e manter senhas iguais',
          'Ensaiar, usar aspas e backups testados',
          'Desativar atualizações e liberar todas as portas do firewall'
        ], 'Ler antes de executar, ensaiar, aspas, backups testados e privilégio mínimo reduzem desastres.'),
        mcq('q7', 'Para que serve redirecionar para /dev/null?', 'a', [
          'Descartar a saída (por exemplo, erros com 2> /dev/null)',
          'Guardar a saída em um arquivo oculto dentro do diretório home',
          'Enviar a saída ao administrador do sistema por e-mail local',
          'Reiniciar o dispositivo nulo do sistema'
        ], '/dev/null descarta tudo o que se escreve nele; lê-lo devolve vazio.'),
        fill('q8', 'Complete para silenciar apenas as mensagens de erro do comando:', 'ls /naoexiste ___ /dev/null', ['2>'], '2> redireciona o canal de erros (saída 2).')
      ]
    },
  ]
};
